from functools import lru_cache
from supabase import create_client, Client
from app.config import settings


@lru_cache(maxsize=1)
def get_supabase() -> Client:
    """
    Returns a Supabase client authenticated with the SERVICE ROLE key.
    This client bypasses RLS — use it only inside trusted backend logic.
    Never expose service role responses directly to end users.
    """
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


def get_supabase_anon() -> Client:
    """
    Returns a Supabase client using the ANON key.
    Use this when you want RLS to be enforced (e.g., to validate a user JWT).
    """
    return create_client(settings.supabase_url, settings.supabase_anon_key)
