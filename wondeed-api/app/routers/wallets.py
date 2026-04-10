from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.database import get_supabase
from app.main import get_caller_user

router = APIRouter()


@router.get("/me")
def get_my_wallet(user=Depends(get_caller_user)):
    """Returns the calling user's wallet balance."""
    db = get_supabase()
    result = db.table("wallets").select(
        "balance_inr, total_credited_inr, total_debited_inr, updated_at"
    ).eq("user_id", user.id).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Wallet not found")
    return result.data


class TopUpRequest(BaseModel):
    amount_inr: float
    reference: str = ""  # payment gateway reference ID


@router.post("/topup")
def topup_wallet(body: TopUpRequest, user=Depends(get_caller_user)):
    """
    Admin/backend: credit a user's wallet after payment gateway confirmation.
    In production this should be triggered by a Razorpay webhook, not called directly.
    """
    if body.amount_inr <= 0:
        raise HTTPException(status_code=422, detail="Amount must be positive")

    db = get_supabase()

    # Admin check
    profile = db.table("profiles").select("role").eq("id", user.id).single().execute()
    if not profile.data or profile.data.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    # Requires target user_id in body for admin top-ups
    raise HTTPException(
        status_code=501,
        detail="Use the admin wallet mutation endpoint with a target user_id. "
               "This stub enforces Razorpay webhook flow.",
    )


class AdminTopUpRequest(BaseModel):
    target_user_id: str
    amount_inr: float
    reference: str = ""


@router.post("/admin/topup")
def admin_topup_wallet(body: AdminTopUpRequest, user=Depends(get_caller_user)):
    """Admin: manually credit any user's wallet (e.g., after offline payment)."""
    db = get_supabase()

    profile = db.table("profiles").select("role").eq("id", user.id).single().execute()
    if not profile.data or profile.data.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    if body.amount_inr <= 0:
        raise HTTPException(status_code=422, detail="Amount must be positive")

    wallet = db.table("wallets").select(
        "balance_inr, total_credited_inr"
    ).eq("user_id", body.target_user_id).single().execute()

    if not wallet.data:
        raise HTTPException(status_code=404, detail="Wallet not found")

    new_balance  = float(wallet.data["balance_inr"]) + body.amount_inr
    new_credited = float(wallet.data["total_credited_inr"]) + body.amount_inr

    db.table("wallets").update({
        "balance_inr":        new_balance,
        "total_credited_inr": new_credited,
    }).eq("user_id", body.target_user_id).execute()

    return {
        "user_id":        body.target_user_id,
        "credited_inr":   body.amount_inr,
        "new_balance_inr": new_balance,
        "reference":      body.reference,
    }
