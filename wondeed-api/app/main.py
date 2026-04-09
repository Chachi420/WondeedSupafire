from fastapi import FastAPI, HTTPException, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.database import get_supabase, get_supabase_anon

logger = logging.getLogger("wondeed")

# ── Auth helper ──────────────────────────────────────────────────────────────

bearer_scheme = HTTPBearer()


def get_caller_user(
    credentials: HTTPAuthorizationCredentials = Security(bearer_scheme),
):
    """
    Validates the JWT from the Authorization header against Supabase.
    Returns the user dict from the token if valid.
    Raises 401 if the token is missing or invalid.

    Usage in a route:
        @router.get("/me")
        def me(user = Depends(get_caller_user)):
            return user
    """
    supabase = get_supabase_anon()
    response = supabase.auth.get_user(credentials.credentials)
    if not response.user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return response.user


# ── App lifecycle ────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Validate Supabase connection on startup
    try:
        db = get_supabase()
        # Lightweight probe — count profiles rows (service role, no RLS)
        db.table("profiles").select("id", count="exact").limit(0).execute()
        logger.info("Supabase connection OK")
    except Exception as exc:
        logger.error("Supabase connection failed: %s", exc)
        raise
    yield
    logger.info("Wondeed API shutting down")


# ── App instance ─────────────────────────────────────────────────────────────

app = FastAPI(
    title="Wondeed API",
    description="Backend for the Wondeed performance clipping marketplace",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.environment != "production" else None,
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers (add as they're built) ───────────────────────────────────────────
# from app.routers import campaigns, submissions, earnings, wallets, payouts
# app.include_router(campaigns.router,   prefix="/campaigns",   tags=["campaigns"])
# app.include_router(submissions.router, prefix="/submissions", tags=["submissions"])
# app.include_router(earnings.router,    prefix="/earnings",    tags=["earnings"])
# app.include_router(wallets.router,     prefix="/wallets",     tags=["wallets"])
# app.include_router(payouts.router,     prefix="/payouts",     tags=["payouts"])


# ── Routes ───────────────────────────────────────────────────────────────────

@app.get("/health", tags=["ops"])
def health_check():
    """
    Railway health check endpoint.
    Returns 200 + Supabase connection status.
    """
    try:
        db = get_supabase()
        db.table("profiles").select("id", count="exact").limit(0).execute()
        db_status = "ok"
    except Exception as exc:
        db_status = f"error: {exc}"

    return {
        "status": "ok",
        "environment": settings.environment,
        "database": db_status,
    }


# ── Business logic notes ─────────────────────────────────────────────────────
#
# Key operations that MUST run via this backend (service role) rather than direct Supabase:
#
# 1. ACTIVATE CAMPAIGN
#    - Debit client wallet by campaign.total_charged_inr
#    - Set campaign.status = 'active'
#    - Both ops must be atomic (use a Supabase DB function / RPC)
#
# 2. APPROVE SUBMISSION
#    - Compute capped_view_count = MIN(raw_view_count, campaign.per_post_view_cap)
#    - Compute earnings_inr = FLOOR(capped_view_count * rate_per_million_inr / 1_000_000)
#    - If campaign.budget_remaining_inr < earnings_inr:
#        earnings_inr = campaign.budget_remaining_inr  (partial credit)
#    - Insert into earnings (status = 'pending')
#    - Decrement campaign.budget_remaining_inr
#    - If campaign.budget_remaining_inr == 0: set campaign.status = 'completed'
#    - Credit clipper wallet: balance_inr += earnings_inr
#    - Update earning.status = 'credited'
#    - All above must be atomic (Supabase RPC)
#
# 3. PROCESS PAYOUT
#    - Verify clipper wallet balance >= payout.amount_inr
#    - Debit clipper wallet
#    - Set payout.status = 'processing'
#    - Initiate Razorpay payout
#    - On success: set payout.status = 'completed', store razorpay_payout_id
#    - On failure: restore wallet balance, set payout.status = 'failed'
#
# 4. CAMPAIGN EXPIRY (scheduled job)
#    - Find active campaigns where end_date < NOW()
#    - Set status = 'completed'
#    - Unspent budget_remaining_inr is NOT refunded — it accrues to Wondeed revenue.
#      No wallet mutation needed; the amount was already debited from the client wallet
#      at activation time (total_charged_inr). budget_remaining_inr is purely a cap
#      on how much more can be paid out to clippers.
