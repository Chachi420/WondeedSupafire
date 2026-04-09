import type { SubscriptionTier } from '@/lib/types/database.types'

export type { SubscriptionTier }

export const MIN_CAMPAIGN_BUDGET_INR = 20_000

export interface TierConfig {
  name: string
  price_inr: number
  price_label: string
  campaign_limit: number          // Infinity = unlimited
  features: string[]
  badge_class: string             // Tailwind classes for the tier badge
  accent_class: string            // Tailwind classes for CTA buttons
  dot_class: string               // Tailwind dot indicator color
}

export const TIER_CONFIG: Record<SubscriptionTier, TierConfig> = {
  pro: {
    name:           'Pro',
    price_inr:      0,
    price_label:    'Free',
    campaign_limit: 5,
    features: [
      '5 campaigns / month',
      'Tier 1–2 clippers only',
      'Basic analytics',
    ],
    badge_class:  'bg-gray-100 text-gray-700',
    accent_class: 'bg-gray-900 hover:bg-gray-800 text-white',
    dot_class:    'bg-gray-400',
  },
  premium: {
    name:           'Premium',
    price_inr:      8_000,
    price_label:    '₹8,000 / mo',
    campaign_limit: 20,
    features: [
      '20 campaigns / month',
      'Up to Tier 3 clippers',
      'Advanced analytics',
      'Campaign templates',
      'Featured placement',
    ],
    badge_class:  'bg-blue-100 text-blue-700',
    accent_class: 'bg-blue-600 hover:bg-blue-700 text-white',
    dot_class:    'bg-blue-500',
  },
  enterprise: {
    name:           'Enterprise',
    price_inr:      20_000,
    price_label:    '₹20,000 / mo',
    campaign_limit: Infinity,
    features: [
      'Unlimited campaigns',
      'All clipper tiers',
      'AI campaign builder',
      'API access',
      'Dedicated account manager',
      'Custom clipper pools',
      'Multi-seat',
    ],
    badge_class:  'bg-purple-100 text-purple-700',
    accent_class: 'bg-purple-600 hover:bg-purple-700 text-white',
    dot_class:    'bg-purple-500',
  },
}

export const TIER_ORDER: SubscriptionTier[] = ['pro', 'premium', 'enterprise']

/** Returns the next upgrade tier, or null if already on Enterprise. */
export function nextTier(current: SubscriptionTier): SubscriptionTier | null {
  const idx = TIER_ORDER.indexOf(current)
  return idx < TIER_ORDER.length - 1 ? TIER_ORDER[idx + 1] : null
}
