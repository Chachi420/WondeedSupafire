from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, HttpUrl
from app.database import get_supabase
from app.main import get_caller_user

router = APIRouter()


class SubmitClipRequest(BaseModel):
    campaign_id: str
    clip_url: str
    platform: str  # "instagram" | "youtube" | "moj" | "josh"


class ApproveSubmissionRequest(BaseModel):
    raw_view_count: int


class RejectSubmissionRequest(BaseModel):
    admin_notes: str = ""


@router.get("/")
def list_submissions(user=Depends(get_caller_user)):
    """
    Returns submissions for the calling user.
    Clippers see their own; admins see all.
    """
    db = get_supabase()

    profile = db.table("profiles").select("role").eq("id", user.id).single().execute()
    role = profile.data.get("role") if profile.data else "clipper"

    query = db.table("campaign_submissions").select(
        "id, clip_url, platform, status, raw_view_count, capped_view_count, "
        "earnings_inr, admin_notes, created_at, reviewed_at, campaign_id, clipper_id"
    ).order("created_at", desc=True)

    if role != "admin":
        query = query.eq("clipper_id", user.id)

    return query.execute().data


@router.post("/")
def submit_clip(body: SubmitClipRequest, user=Depends(get_caller_user)):
    """Clipper: submit a clip URL for a campaign."""
    db = get_supabase()

    # Verify campaign is active
    camp = db.table("campaigns").select(
        "id, status, end_date, min_clipper_tier"
    ).eq("id", body.campaign_id).single().execute()

    if not camp.data:
        raise HTTPException(status_code=404, detail="Campaign not found")
    if camp.data["status"] != "active":
        raise HTTPException(status_code=422, detail="Campaign is not accepting submissions")

    # Verify clipper tier
    profile = db.table("profiles").select(
        "subscription_tier"
    ).eq("id", user.id).single().execute()

    tier_rank = {"pro": 1, "premium": 2, "enterprise": 3}
    clipper_rank = tier_rank.get(profile.data.get("subscription_tier", "pro"), 1)
    min_rank = tier_rank.get(camp.data.get("min_clipper_tier", "pro"), 1)

    if clipper_rank < min_rank:
        raise HTTPException(status_code=403, detail="Your tier is insufficient for this campaign")

    result = db.table("campaign_submissions").insert({
        "clipper_id":   user.id,
        "campaign_id":  body.campaign_id,
        "clip_url":     body.clip_url,
        "platform":     body.platform,
        "status":       "pending",
    }).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create submission")

    return result.data[0]


@router.post("/{submission_id}/approve")
def approve_submission(
    submission_id: str,
    body: ApproveSubmissionRequest,
    user=Depends(get_caller_user),
):
    """
    Admin: approve a submission.
    Computes earnings, credits clipper wallet, decrements campaign budget.
    All mutations are sequential — replace with a Supabase RPC for atomicity.
    """
    db = get_supabase()

    # Auth check
    profile = db.table("profiles").select("role").eq("id", user.id).single().execute()
    if not profile.data or profile.data.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    sub = db.table("campaign_submissions").select(
        "id, clipper_id, campaign_id, status"
    ).eq("id", submission_id).single().execute()

    if not sub.data:
        raise HTTPException(status_code=404, detail="Submission not found")
    if sub.data["status"] != "pending":
        raise HTTPException(status_code=422, detail="Submission already processed")

    camp = db.table("campaigns").select(
        "rate_per_million_inr, per_post_view_cap, budget_remaining_inr"
    ).eq("id", sub.data["campaign_id"]).single().execute()

    if not camp.data:
        raise HTTPException(status_code=404, detail="Campaign not found")

    raw_views    = body.raw_view_count
    capped_views = min(raw_views, int(camp.data["per_post_view_cap"]))
    raw_earnings = int(capped_views * float(camp.data["rate_per_million_inr"]) / 1_000_000)
    budget_left  = float(camp.data["budget_remaining_inr"])
    earnings     = min(raw_earnings, budget_left)
    new_remaining = budget_left - earnings

    from datetime import datetime, timezone
    now = datetime.now(timezone.utc).isoformat()

    # 1. Update submission
    db.table("campaign_submissions").update({
        "status":            "approved",
        "raw_view_count":    raw_views,
        "capped_view_count": capped_views,
        "earnings_inr":      earnings,
        "reviewed_by":       user.id,
        "reviewed_at":       now,
    }).eq("id", submission_id).execute()

    # 2. Insert earning record
    db.table("earnings").insert({
        "clipper_id":    sub.data["clipper_id"],
        "submission_id": submission_id,
        "campaign_id":   sub.data["campaign_id"],
        "amount_inr":    earnings,
        "status":        "credited",
    }).execute()

    # 3. Decrement campaign budget
    update_payload = {"budget_remaining_inr": new_remaining}
    if new_remaining <= 0:
        update_payload["status"] = "completed"
    db.table("campaigns").update(update_payload).eq("id", sub.data["campaign_id"]).execute()

    # 4. Credit clipper wallet
    wallet = db.table("wallets").select(
        "balance_inr, total_credited_inr"
    ).eq("user_id", sub.data["clipper_id"]).single().execute()

    if wallet.data:
        db.table("wallets").update({
            "balance_inr":        float(wallet.data["balance_inr"]) + earnings,
            "total_credited_inr": float(wallet.data["total_credited_inr"]) + earnings,
        }).eq("user_id", sub.data["clipper_id"]).execute()

    return {
        "submission_id":   submission_id,
        "capped_views":    capped_views,
        "earnings_inr":    earnings,
        "budget_remaining": new_remaining,
    }


@router.post("/{submission_id}/reject")
def reject_submission(
    submission_id: str,
    body: RejectSubmissionRequest,
    user=Depends(get_caller_user),
):
    """Admin: reject a submission."""
    db = get_supabase()

    profile = db.table("profiles").select("role").eq("id", user.id).single().execute()
    if not profile.data or profile.data.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    from datetime import datetime, timezone
    now = datetime.now(timezone.utc).isoformat()

    db.table("campaign_submissions").update({
        "status":      "rejected",
        "reviewed_by": user.id,
        "reviewed_at": now,
        "admin_notes": body.admin_notes or None,
    }).eq("id", submission_id).execute()

    return {"submission_id": submission_id, "status": "rejected"}
