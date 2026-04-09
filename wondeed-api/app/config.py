from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Supabase
    supabase_url: str
    supabase_service_role_key: str  # backend uses service role — bypasses RLS intentionally
    supabase_anon_key: str

    # Razorpay
    razorpay_key_id: str = ""
    razorpay_key_secret: str = ""
    razorpay_account_number: str = ""  # source account for payouts

    # MSG91
    msg91_auth_key: str = ""
    msg91_sender_id: str = "WONDEE"

    # App
    environment: str = "development"
    allowed_origins: list[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
