export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          phone: string
          full_name: string | null
          role: Database['public']['Enums']['user_role']
          account_status: 'pending' | 'active' | 'suspended'
          subscription_tier: Database['public']['Enums']['subscription_tier']
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          phone: string
          full_name?: string | null
          role?: Database['public']['Enums']['user_role']
          account_status?: 'pending' | 'active' | 'suspended'
          subscription_tier?: Database['public']['Enums']['subscription_tier']
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          phone?: string
          full_name?: string | null
          role?: Database['public']['Enums']['user_role']
          account_status?: 'pending' | 'active' | 'suspended'
          subscription_tier?: Database['public']['Enums']['subscription_tier']
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          client_id: string
          tier: Database['public']['Enums']['subscription_tier']
          status: Database['public']['Enums']['subscription_status']
          amount_inr: number
          starts_at: string
          ends_at: string | null
          payment_ref: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          tier: Database['public']['Enums']['subscription_tier']
          status?: Database['public']['Enums']['subscription_status']
          amount_inr?: number
          starts_at?: string
          ends_at?: string | null
          payment_ref?: string | null
          created_at?: string
        }
        Update: {
          tier?: Database['public']['Enums']['subscription_tier']
          status?: Database['public']['Enums']['subscription_status']
          amount_inr?: number
          ends_at?: string | null
          payment_ref?: string | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          id: string
          client_id: string
          title: string
          description: string | null
          budget_inr: number
          platform_fee_inr: number
          total_charged_inr: number
          budget_remaining_inr: number
          rate_per_million_inr: number
          per_post_view_cap: number
          platform: Database['public']['Enums']['campaign_platform']
          status: Database['public']['Enums']['campaign_status']
          source_content_url: string | null
          target_platforms: string[]
          clip_length_seconds: number | null
          clip_aspect_ratio: string | null
          clip_language: string | null
          hook_style: string | null
          min_views_for_payout: number | null
          mandatory_caption: string | null
          duration_days: number | null
          min_clipper_tier: Database['public']['Enums']['subscription_tier']
          start_date: string | null
          end_date: string | null
          approved_by: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          title: string
          description?: string | null
          budget_inr: number
          platform_fee_inr: number
          total_charged_inr: number
          budget_remaining_inr: number
          rate_per_million_inr?: number
          per_post_view_cap: number
          platform: Database['public']['Enums']['campaign_platform']
          status?: Database['public']['Enums']['campaign_status']
          source_content_url?: string | null
          target_platforms?: string[]
          clip_length_seconds?: number | null
          clip_aspect_ratio?: string | null
          clip_language?: string | null
          hook_style?: string | null
          min_views_for_payout?: number | null
          mandatory_caption?: string | null
          duration_days?: number | null
          min_clipper_tier?: Database['public']['Enums']['subscription_tier']
          start_date?: string | null
          end_date?: string | null
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          budget_inr?: number
          platform_fee_inr?: number
          total_charged_inr?: number
          budget_remaining_inr?: number
          rate_per_million_inr?: number
          per_post_view_cap?: number
          platform?: Database['public']['Enums']['campaign_platform']
          status?: Database['public']['Enums']['campaign_status']
          source_content_url?: string | null
          target_platforms?: string[]
          clip_length_seconds?: number | null
          clip_aspect_ratio?: string | null
          clip_language?: string | null
          hook_style?: string | null
          min_views_for_payout?: number | null
          mandatory_caption?: string | null
          duration_days?: number | null
          min_clipper_tier?: Database['public']['Enums']['subscription_tier']
          start_date?: string | null
          end_date?: string | null
          approved_by?: string | null
          approved_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      campaign_submissions: {
        Row: {
          id: string
          campaign_id: string
          clipper_id: string
          clip_url: string
          platform: Database['public']['Enums']['submission_platform']
          status: Database['public']['Enums']['submission_status']
          raw_view_count: number | null
          capped_view_count: number | null
          earnings_inr: number | null
          reviewed_by: string | null
          reviewed_at: string | null
          admin_notes: string | null
          view_count_source: 'manual' | 'youtube_api' | 'instagram_api' | null
          live_view_count: number | null
          live_like_count: number | null
          live_comment_count: number | null
          last_refreshed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          clipper_id: string
          clip_url: string
          platform: Database['public']['Enums']['submission_platform']
          status?: Database['public']['Enums']['submission_status']
          raw_view_count?: number | null
          capped_view_count?: number | null
          earnings_inr?: number | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          admin_notes?: string | null
          view_count_source?: 'manual' | 'youtube_api' | 'instagram_api' | null
          live_view_count?: number | null
          live_like_count?: number | null
          live_comment_count?: number | null
          last_refreshed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          clip_url?: string
          platform?: Database['public']['Enums']['submission_platform']
          status?: Database['public']['Enums']['submission_status']
          raw_view_count?: number | null
          capped_view_count?: number | null
          earnings_inr?: number | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          admin_notes?: string | null
          view_count_source?: 'manual' | 'youtube_api' | 'instagram_api' | null
          live_view_count?: number | null
          live_like_count?: number | null
          live_comment_count?: number | null
          last_refreshed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      clipper_social_accounts: {
        Row: {
          clipper_id: string
          instagram_user_id: string | null
          instagram_username: string | null
          instagram_access_token: string | null
          instagram_token_expires_at: string | null
          instagram_connected_at: string | null
          youtube_channel_id: string | null
          youtube_channel_handle: string | null
          youtube_channel_title: string | null
          youtube_verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          clipper_id: string
          instagram_user_id?: string | null
          instagram_username?: string | null
          instagram_access_token?: string | null
          instagram_token_expires_at?: string | null
          instagram_connected_at?: string | null
          youtube_channel_id?: string | null
          youtube_channel_handle?: string | null
          youtube_channel_title?: string | null
          youtube_verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          instagram_user_id?: string | null
          instagram_username?: string | null
          instagram_access_token?: string | null
          instagram_token_expires_at?: string | null
          instagram_connected_at?: string | null
          youtube_channel_id?: string | null
          youtube_channel_handle?: string | null
          youtube_channel_title?: string | null
          youtube_verified_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      earnings: {
        Row: {
          id: string
          clipper_id: string
          submission_id: string
          campaign_id: string
          amount_inr: number
          status: Database['public']['Enums']['earning_status']
          created_at: string
        }
        Insert: {
          id?: string
          clipper_id: string
          submission_id: string
          campaign_id: string
          amount_inr: number
          status?: Database['public']['Enums']['earning_status']
          created_at?: string
        }
        Update: {
          status?: Database['public']['Enums']['earning_status']
        }
        Relationships: []
      }
      wallets: {
        Row: {
          id: string
          user_id: string
          balance_inr: number
          total_credited_inr: number
          total_debited_inr: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          balance_inr?: number
          total_credited_inr?: number
          total_debited_inr?: number
          updated_at?: string
        }
        Update: {
          balance_inr?: number
          total_credited_inr?: number
          total_debited_inr?: number
          updated_at?: string
        }
        Relationships: []
      }
      payouts: {
        Row: {
          id: string
          clipper_id: string
          amount_inr: number
          upi_id: string
          status: Database['public']['Enums']['payout_status']
          razorpay_payout_id: string | null
          failure_reason: string | null
          processed_by: string | null
          requested_at: string
          processed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          clipper_id: string
          amount_inr: number
          upi_id: string
          status?: Database['public']['Enums']['payout_status']
          razorpay_payout_id?: string | null
          failure_reason?: string | null
          processed_by?: string | null
          requested_at?: string
          processed_at?: string | null
          created_at?: string
        }
        Update: {
          status?: Database['public']['Enums']['payout_status']
          razorpay_payout_id?: string | null
          failure_reason?: string | null
          processed_by?: string | null
          processed_at?: string | null
        }
        Relationships: []
      }
      clipper_accounts: {
        Row: {
          id: string
          clipper_id: string
          upi_id: string
          account_holder_name: string
          is_verified: boolean
          razorpay_contact_id: string | null
          razorpay_fund_account_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clipper_id: string
          upi_id: string
          account_holder_name: string
          is_verified?: boolean
          razorpay_contact_id?: string | null
          razorpay_fund_account_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          upi_id?: string
          account_holder_name?: string
          is_verified?: boolean
          razorpay_contact_id?: string | null
          razorpay_fund_account_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      get_my_role: {
        Args: Record<string, never>
        Returns: Database['public']['Enums']['user_role']
      }
      approve_submission: {
        Args: { p_submission_id: string; p_raw_view_count: number; p_reviewed_by: string }
        Returns: Json
      }
      reject_campaign_and_refund: {
        Args: { p_campaign_id: string }
        Returns: Json
      }
      process_payout_failed: {
        Args: { p_payout_id: string; p_failure_reason: string; p_processed_by: string }
        Returns: Json
      }
      admin_credit_wallet: {
        Args: { p_user_id: string; p_amount: number }
        Returns: Json
      }
      get_leaderboard: {
        Args: { p_period: string }
        Returns: Json
      }
      get_clipper_season: {
        Args: { p_clipper_id: string }
        Returns: Json
      }
    }
    Enums: {
      user_role:           'client' | 'clipper' | 'admin'
      campaign_status:     'draft' | 'pending_approval' | 'active' | 'paused' | 'completed' | 'cancelled'
      campaign_platform:   'instagram' | 'youtube' | 'both'
      submission_platform: 'instagram' | 'youtube'
      submission_status:   'pending' | 'approved' | 'rejected'
      earning_status:      'pending' | 'credited' | 'paid_out'
      payout_status:       'requested' | 'processing' | 'completed' | 'failed'
      subscription_tier:   'pro' | 'premium' | 'enterprise'
      subscription_status: 'active' | 'cancelled' | 'expired'
    }
  }
}

// Convenience row types
export type Profile            = Database['public']['Tables']['profiles']['Row']
export type Campaign           = Database['public']['Tables']['campaigns']['Row']
export type CampaignSubmission = Database['public']['Tables']['campaign_submissions']['Row']
export type Earning            = Database['public']['Tables']['earnings']['Row']
export type Wallet             = Database['public']['Tables']['wallets']['Row']
export type Payout             = Database['public']['Tables']['payouts']['Row']
export type ClipperAccount     = Database['public']['Tables']['clipper_accounts']['Row']
export type Subscription       = Database['public']['Tables']['subscriptions']['Row']

export type ClipperSocialAccount = Database['public']['Tables']['clipper_social_accounts']['Row']

export type UserRole             = Database['public']['Enums']['user_role']
export type CampaignStatus       = Database['public']['Enums']['campaign_status']
export type CampaignPlatform     = Database['public']['Enums']['campaign_platform']
export type SubmissionPlatform   = Database['public']['Enums']['submission_platform']
export type SubmissionStatus     = Database['public']['Enums']['submission_status']
export type EarningStatus        = Database['public']['Enums']['earning_status']
export type PayoutStatus         = Database['public']['Enums']['payout_status']
export type SubscriptionTier     = Database['public']['Enums']['subscription_tier']
export type SubscriptionStatus   = Database['public']['Enums']['subscription_status']
