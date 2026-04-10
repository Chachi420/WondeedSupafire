from fastapi import APIRouter, Depends, Query
from app.database import get_supabase
from app.main import get_caller_user

router = APIRouter()


@router.get("/")
def list_earnings(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    user=Depends(get_caller_user),
):
    """Clipper: list own earnings records, newest first."""
    db = get_supabase()
    result = db.table("earnings").select(
        "id, amount_inr, status, created_at, campaign_id, submission_id, "
        "campaigns(title)"
    ).eq("clipper_id", user.id).order(
        "created_at", desc=True
    ).range(offset, offset + limit - 1).execute()
    return result.data


@router.get("/summary")
def earnings_summary(user=Depends(get_caller_user)):
    """Clipper: return total credited, total paid out, and this-month earnings."""
    from datetime import datetime, timezone

    db = get_supabase()
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()

    all_earnings = db.table("earnings").select(
        "amount_inr, status, created_at"
    ).eq("clipper_id", user.id).execute().data or []

    total_credited = sum(float(e["amount_inr"]) for e in all_earnings if e["status"] in ("credited", "paid_out"))
    total_paid_out = sum(float(e["amount_inr"]) for e in all_earnings if e["status"] == "paid_out")
    this_month     = sum(
        float(e["amount_inr"]) for e in all_earnings
        if e["created_at"] >= month_start and e["status"] in ("credited", "paid_out")
    )

    return {
        "total_credited_inr": total_credited,
        "total_paid_out_inr": total_paid_out,
        "this_month_inr":     this_month,
    }
