from fastapi import APIRouter, Depends, Header, HTTPException
from app.database import get_supabase
from app.main import get_caller_user
from app.config import settings

router = APIRouter()


@router.get("/")
def list_active_campaigns():
    """Public: list all active campaigns (for discovery / validation)."""
    db = get_supabase()
    result = db.table("campaigns").select(
        "id, title, platform, target_platforms, rate_per_million_inr, "
        "budget_remaining_inr, per_post_view_cap, end_date, min_clipper_tier, "
        "clip_aspect_ratio, clip_length_seconds, clip_language, hook_style, "
        "min_views_for_payout, created_at"
    ).eq("status", "active").order("created_at", desc=True).execute()
    return result.data


@router.get("/{campaign_id}")
def get_campaign(campaign_id: str, user=Depends(get_caller_user)):
    """Authenticated: get a single campaign by ID."""
    db = get_supabase()
    result = db.table("campaigns").select("*").eq("id", campaign_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return result.data


@router.post("/expire")
def expire_campaigns(x_cron_secret: str = Header(default="")):
    """
    Cron: mark all active campaigns past their end_date as completed.
    Unspent budget is NOT refunded — it accrues to Wondeed revenue.

    Auth: pass the CRON_SECRET env var as the X-Cron-Secret header.
    Called daily by GitHub Actions (see .github/workflows/expire-campaigns.yml).
    """
    if not settings.cron_secret or x_cron_secret != settings.cron_secret:
        raise HTTPException(status_code=401, detail="Invalid cron secret")

    from datetime import datetime, timezone

    db = get_supabase()
    now = datetime.now(timezone.utc).isoformat()

    result = db.table("campaigns").update({"status": "completed"}).eq(
        "status", "active"
    ).lt("end_date", now).execute()

    expired_count = len(result.data) if result.data else 0
    return {"expired": expired_count, "processed_at": now}
