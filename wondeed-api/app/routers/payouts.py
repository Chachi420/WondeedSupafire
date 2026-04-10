from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.database import get_supabase
from app.main import get_caller_user
from app.config import settings

router = APIRouter()


class RequestPayoutBody(BaseModel):
    amount_inr: float


class ProcessPayoutBody(BaseModel):
    razorpay_payout_id: str = ""
    mark_failed: bool = False
    failure_reason: str = ""


@router.get("/")
def list_payouts(user=Depends(get_caller_user)):
    """Clipper: list own payout requests. Admin: list all."""
    db = get_supabase()

    profile = db.table("profiles").select("role").eq("id", user.id).single().execute()
    role = profile.data.get("role") if profile.data else "clipper"

    query = db.table("payouts").select(
        "id, amount_inr, upi_id, status, razorpay_payout_id, "
        "failure_reason, requested_at, processed_at"
    ).order("requested_at", desc=True)

    if role != "admin":
        query = query.eq("clipper_id", user.id)

    return query.execute().data


@router.post("/")
def request_payout(body: RequestPayoutBody, user=Depends(get_caller_user)):
    """
    Clipper: request a payout to their verified UPI account.
    Immediately debits wallet balance; payout status starts as 'requested'.
    """
    db = get_supabase()

    if body.amount_inr < 100:
        raise HTTPException(status_code=422, detail="Minimum payout is ₹100")

    # Get clipper account (must be verified)
    account = db.table("clipper_accounts").select(
        "upi_id, is_verified, account_holder_name"
    ).eq("clipper_id", user.id).single().execute()

    if not account.data:
        raise HTTPException(status_code=422, detail="No payment account on file. Add UPI ID first.")
    if not account.data["is_verified"]:
        raise HTTPException(status_code=422, detail="Payment account not verified by admin yet.")

    # Get wallet — verify sufficient balance
    wallet = db.table("wallets").select(
        "balance_inr, total_debited_inr"
    ).eq("user_id", user.id).single().execute()

    if not wallet.data:
        raise HTTPException(status_code=404, detail="Wallet not found")

    balance = float(wallet.data["balance_inr"])
    if balance < body.amount_inr:
        raise HTTPException(
            status_code=422,
            detail=f"Insufficient balance. Available: ₹{balance:.0f}"
        )

    # Debit wallet
    db.table("wallets").update({
        "balance_inr":      balance - body.amount_inr,
        "total_debited_inr": float(wallet.data["total_debited_inr"]) + body.amount_inr,
    }).eq("user_id", user.id).execute()

    # Create payout request
    result = db.table("payouts").insert({
        "clipper_id": user.id,
        "amount_inr": body.amount_inr,
        "upi_id":     account.data["upi_id"],
        "status":     "requested",
    }).execute()

    if not result.data:
        # Rollback wallet debit
        db.table("wallets").update({
            "balance_inr":       balance,
            "total_debited_inr": float(wallet.data["total_debited_inr"]),
        }).eq("user_id", user.id).execute()
        raise HTTPException(status_code=500, detail="Failed to create payout request")

    return result.data[0]


@router.post("/{payout_id}/process")
def process_payout(
    payout_id: str,
    body: ProcessPayoutBody,
    user=Depends(get_caller_user),
):
    """
    Admin: initiate or finalise a Razorpay payout transfer.

    - If mark_failed=False and razorpay_payout_id provided → mark completed
    - If mark_failed=True → mark failed and refund clipper wallet
    - If neither → mark processing (Razorpay call initiated externally)

    TODO: Wire up Razorpay Payout API here once credentials are live.
    """
    db = get_supabase()

    profile = db.table("profiles").select("role").eq("id", user.id).single().execute()
    if not profile.data or profile.data.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    payout = db.table("payouts").select(
        "id, clipper_id, amount_inr, status"
    ).eq("id", payout_id).single().execute()

    if not payout.data:
        raise HTTPException(status_code=404, detail="Payout not found")
    if payout.data["status"] == "completed":
        raise HTTPException(status_code=422, detail="Payout already completed")

    from datetime import datetime, timezone
    now = datetime.now(timezone.utc).isoformat()

    if body.mark_failed:
        # Refund clipper wallet
        wallet = db.table("wallets").select(
            "balance_inr, total_debited_inr"
        ).eq("user_id", payout.data["clipper_id"]).single().execute()

        if wallet.data:
            db.table("wallets").update({
                "balance_inr":       float(wallet.data["balance_inr"]) + float(payout.data["amount_inr"]),
                "total_debited_inr": max(0, float(wallet.data["total_debited_inr"]) - float(payout.data["amount_inr"])),
            }).eq("user_id", payout.data["clipper_id"]).execute()

        db.table("payouts").update({
            "status":        "failed",
            "failure_reason": body.failure_reason or None,
            "processed_by":  user.id,
            "processed_at":  now,
        }).eq("id", payout_id).execute()

        return {"payout_id": payout_id, "status": "failed"}

    elif body.razorpay_payout_id:
        db.table("payouts").update({
            "status":             "completed",
            "razorpay_payout_id": body.razorpay_payout_id,
            "processed_by":       user.id,
            "processed_at":       now,
        }).eq("id", payout_id).execute()

        return {"payout_id": payout_id, "status": "completed", "razorpay_payout_id": body.razorpay_payout_id}

    else:
        # Mark as processing
        db.table("payouts").update({
            "status":       "processing",
            "processed_by": user.id,
            "processed_at": now,
        }).eq("id", payout_id).execute()

        return {"payout_id": payout_id, "status": "processing"}
