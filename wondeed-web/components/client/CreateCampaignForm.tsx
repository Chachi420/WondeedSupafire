'use client'

import { useState, useTransition } from 'react'
import { createCampaignAndSubmit } from '@/app/dashboard/client/actions'

// ── Constants ─────────────────────────────────────────────────

const CLIP_LENGTHS = [
  { value: '30',  label: '30s' },
  { value: '60',  label: '60s' },
  { value: '90',  label: '90s' },
]

const CLIP_RATIOS = [
  { value: '9:16', label: '9:16', desc: 'Reels / Shorts' },
  { value: '16:9', label: '16:9', desc: 'Landscape'      },
  { value: '1:1',  label: '1:1',  desc: 'Square'          },
  { value: '4:5',  label: '4:5',  desc: 'Portrait'        },
]

const LANGUAGES = [
  { value: 'Hindi',   label: 'Hindi'   },
  { value: 'English', label: 'English' },
  { value: 'Tamil',   label: 'Tamil'   },
  { value: 'Telugu',  label: 'Telugu'  },
  { value: 'Bengali', label: 'Bengali' },
]

const HOOK_STYLES = [
  { value: 'energetic',    label: 'Energetic',    desc: 'High-energy, fast cuts' },
  { value: 'educational',  label: 'Educational',  desc: 'Teach or explain'       },
  { value: 'emotional',    label: 'Emotional',    desc: 'Evoke feeling or story'  },
  { value: 'funny',        label: 'Funny',        desc: 'Comedy / meme format'    },
]

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram Reels' },
  { id: 'youtube',   label: 'YouTube Shorts'  },
  { id: 'moj',       label: 'Moj'             },
  { id: 'josh',      label: 'Josh'            },
]

const CLIPPER_TIERS = [
  { value: 'pro',        label: 'Tier 1 – Pro',        desc: 'All clippers welcome'   },
  { value: 'premium',    label: 'Tier 2 – Premium',    desc: 'Experienced clippers'   },
  { value: 'enterprise', label: 'Tier 3 – Enterprise', desc: 'Top-tier clippers only' },
]

// ── Helpers ───────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n)
}

function fmtViews(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

// ── UI Primitives ─────────────────────────────────────────────

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  )
}

function Label({ children, required, hint }: { children: React.ReactNode; required?: boolean; hint?: string }) {
  return (
    <div className="mb-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {children}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
    </div>
  )
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white ${props.className ?? ''}`}
    />
  )
}

function FieldError({ msg }: { msg: string | undefined }) {
  if (!msg) return null
  return <p className="mt-1 text-xs text-red-600">{msg}</p>
}

// ── Main Component ────────────────────────────────────────────

type FieldErrors = Partial<Record<string, string>>

export default function CreateCampaignForm({ walletBalance }: { walletBalance: number }) {
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [success, setSuccess]         = useState(false)

  // Controlled state for live preview / cross-field logic
  const [title, setTitle]             = useState('')
  const [budget, setBudget]           = useState('')
  const [perPostCap, setPerPostCap]   = useState('')
  const [minViews, setMinViews]       = useState('10000')
  const [duration, setDuration]       = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram', 'youtube'])
  const [clipLength, setClipLength]   = useState('60')
  const [clipRatio, setClipRatio]     = useState('9:16')
  const [hookStyle, setHookStyle]     = useState('energetic')
  const [clipperTier, setClipperTier] = useState('pro')

  const budgetNum    = parseFloat(budget) || 0
  const platformFee  = Math.round(budgetNum * 0.20 * 100) / 100
  const totalCharged = budgetNum + platformFee
  const maxViews     = budgetNum > 0 ? Math.floor((budgetNum / 10_000) * 1_000_000) : 0
  const canAfford    = walletBalance >= totalCharged
  const budgetOk     = budgetNum >= 20_000
  const hasIG        = selectedPlatforms.includes('instagram')
  const hasYT        = selectedPlatforms.includes('youtube')
  const derivedPlatform: 'instagram' | 'youtube' | 'both' =
    hasIG && !hasYT ? 'instagram' :
    hasYT && !hasIG ? 'youtube' :
    'both'

  function togglePlatform(id: string) {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
    setFieldErrors(e => ({ ...e, platforms: undefined }))
  }

  function validateClient(): FieldErrors {
    const errors: FieldErrors = {}
    if (!title.trim())                errors.title    = 'Campaign name is required'
    if (budgetNum < 20_000)           errors.budget   = 'Minimum budget is ₹20,000'
    if (!canAfford)                   errors.budget   = `Insufficient wallet balance. Available: ${fmt(walletBalance)}`
    if (!perPostCap || Number(perPostCap) <= 0) errors.perPostCap = 'Per-post view cap is required'
    if (selectedPlatforms.length === 0) errors.platforms = 'Select at least one platform'
    return errors
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setServerError(null)
    const errors = validateClient()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      // Scroll to first error
      setTimeout(() => document.querySelector('[data-error]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50)
      return
    }
    setFieldErrors({})
    const form = e.currentTarget
    startTransition(async () => {
      try {
        await createCampaignAndSubmit(new FormData(form))
        setSuccess(true)
      } catch (err: any) {
        setServerError(err.message)
      }
    })
  }

  if (success) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Campaign Submitted!</h3>
        <p className="text-sm text-gray-500 mb-2">
          Your campaign is pending admin approval. We'll notify you once it goes live.
        </p>
        <p className="text-xs text-gray-400">
          {fmt(totalCharged)} has been deducted from your wallet.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <a
            href="/dashboard/client/campaigns"
            className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            View My Campaigns →
          </a>
          <button
            onClick={() => setSuccess(false)}
            className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
          >
            Create Another
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── 1. Campaign Basics ── */}
      <SectionCard title="Campaign Basics">

        <div data-error={fieldErrors.title ? true : undefined}>
          <Label required>Campaign Name</Label>
          <TextInput
            name="title"
            type="text"
            required
            value={title}
            onChange={e => { setTitle(e.target.value); setFieldErrors(f => ({ ...f, title: undefined })) }}
            placeholder="e.g. Summer Product Launch — Hindi Reels"
          />
          <FieldError msg={fieldErrors.title} />
        </div>

        <div>
          <Label hint="Paste a YouTube link or hosted MP4 for clippers to use as reference">
            Source Content URL
          </Label>
          <TextInput
            name="source_content_url"
            type="url"
            placeholder="https://youtube.com/watch?v=… or https://example.com/video.mp4"
          />
        </div>

        <div>
          <Label hint="Describe the product, tone, key messages, and anything clippers must include">
            Campaign Brief
          </Label>
          <textarea
            name="description"
            rows={3}
            placeholder="What should clippers communicate? Any dos and don'ts?"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
        </div>
      </SectionCard>

      {/* ── 2. Clip Specifications ── */}
      <SectionCard title="Clip Specifications" subtitle="Define the format clippers must follow">

        {/* Clip length */}
        <div>
          <Label>Clip Length</Label>
          <div className="flex gap-2">
            {CLIP_LENGTHS.map(opt => (
              <label key={opt.value} className="relative cursor-pointer">
                <input
                  type="radio"
                  name="clip_length_seconds"
                  value={opt.value}
                  checked={clipLength === opt.value}
                  onChange={() => setClipLength(opt.value)}
                  className="sr-only"
                />
                <span className={`block px-5 py-2.5 border rounded-lg text-sm font-semibold transition-colors ${
                  clipLength === opt.value
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}>
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Aspect ratio */}
        <div>
          <Label>Aspect Ratio</Label>
          <div className="flex gap-2 flex-wrap">
            {CLIP_RATIOS.map(opt => (
              <label key={opt.value} className="relative cursor-pointer">
                <input
                  type="radio"
                  name="clip_aspect_ratio"
                  value={opt.value}
                  checked={clipRatio === opt.value}
                  onChange={() => setClipRatio(opt.value)}
                  className="sr-only"
                />
                <span className={`block px-4 py-2.5 border rounded-lg transition-colors text-center ${
                  clipRatio === opt.value
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <span className={`block text-sm font-semibold ${clipRatio === opt.value ? 'text-brand-700' : 'text-gray-700'}`}>
                    {opt.label}
                  </span>
                  <span className="block text-xs text-gray-400 mt-0.5">{opt.desc}</span>
                </span>
              </label>
            ))}
          </div>
          {clipRatio === '9:16' && (
            <p className="mt-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-2 py-1 inline-block">
              ✓ Recommended — works on all short-form platforms
            </p>
          )}
        </div>

        {/* Language */}
        <div>
          <Label>Language</Label>
          <select
            name="clip_language"
            defaultValue="Hindi"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            {LANGUAGES.map(l => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>

        {/* Hook style */}
        <div>
          <Label>Hook Style</Label>
          <div className="grid grid-cols-2 gap-2">
            {HOOK_STYLES.map(h => (
              <label key={h.value} className="relative cursor-pointer">
                <input
                  type="radio"
                  name="hook_style"
                  value={h.value}
                  checked={hookStyle === h.value}
                  onChange={() => setHookStyle(h.value)}
                  className="sr-only"
                />
                <span className={`flex items-start gap-3 p-3.5 border rounded-lg transition-colors ${
                  hookStyle === h.value
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <span className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center transition-colors ${
                    hookStyle === h.value ? 'border-brand-500 bg-brand-500' : 'border-gray-300'
                  }`}>
                    {hookStyle === h.value && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white block" />
                    )}
                  </span>
                  <span>
                    <span className={`block text-sm font-semibold ${hookStyle === h.value ? 'text-brand-700' : 'text-gray-900'}`}>
                      {h.label}
                    </span>
                    <span className="block text-xs text-gray-400 mt-0.5">{h.desc}</span>
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* ── 3. Target Platforms ── */}
      <SectionCard title="Target Platforms" subtitle="Which platforms should clippers post on?">
        {/* Hidden field for the db enum */}
        <input type="hidden" name="platform" value={derivedPlatform} />

        <div className="grid grid-cols-2 gap-3" data-error={fieldErrors.platforms ? true : undefined}>
          {PLATFORMS.map(p => {
            const checked = selectedPlatforms.includes(p.id)
            return (
              <label
                key={p.id}
                className={`flex items-center gap-3 p-3.5 border rounded-lg cursor-pointer transition-colors ${
                  checked ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  name="target_platforms"
                  value={p.id}
                  checked={checked}
                  onChange={() => togglePlatform(p.id)}
                  className="sr-only"
                />
                <span className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${
                  checked ? 'bg-brand-500 border-brand-500' : 'border-gray-300 bg-white'
                }`}>
                  {checked && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <span className={`text-sm font-medium ${checked ? 'text-brand-700' : 'text-gray-900'}`}>
                  {p.label}
                </span>
              </label>
            )
          })}
        </div>
        <FieldError msg={fieldErrors.platforms} />
      </SectionCard>

      {/* ── 4. Content Requirements ── */}
      <SectionCard title="Content Requirements" subtitle="Rules clippers must follow when posting">
        <div>
          <Label hint="Clippers must include this verbatim in their post caption. Leave blank if none required.">
            Mandatory Caption &amp; Hashtags
          </Label>
          <textarea
            name="mandatory_caption"
            rows={4}
            placeholder={"Check out @yourbrand! 🔥 #BrandName #Sponsored #Ad\n\n(Clippers must include this caption word-for-word)"}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none font-mono"
          />
        </div>
      </SectionCard>

      {/* ── 5. Budget & Payout Rules ── */}
      <SectionCard title="Budget &amp; Payout Rules">

        <div className="grid grid-cols-2 gap-5">

          {/* Total Budget */}
          <div data-error={fieldErrors.budget ? true : undefined}>
            <Label required hint="Minimum ₹20,000 · Clippers earn ₹10K per 1M views">
              Total Budget (₹)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium select-none">₹</span>
              <input
                name="budget_inr"
                type="number"
                min={20000}
                step={1000}
                required
                placeholder="20000"
                value={budget}
                onChange={e => { setBudget(e.target.value); setFieldErrors(f => ({ ...f, budget: undefined })) }}
                className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <FieldError msg={fieldErrors.budget} />
          </div>

          {/* Per-Post View Cap */}
          <div data-error={fieldErrors.perPostCap ? true : undefined}>
            <Label required hint="Max views a single clip can earn from">
              Per-Post View Cap
            </Label>
            <input
              name="per_post_view_cap"
              type="number"
              min={10000}
              step={10000}
              required
              placeholder="500000"
              value={perPostCap}
              onChange={e => { setPerPostCap(e.target.value); setFieldErrors(f => ({ ...f, perPostCap: undefined })) }}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {perPostCap && Number(perPostCap) > 0 && (
              <p className="mt-1 text-xs text-gray-400">Cap: {fmtViews(Number(perPostCap))} views per clip</p>
            )}
            <FieldError msg={fieldErrors.perPostCap} />
          </div>
        </div>

        {/* Min Views for Payout */}
        <div>
          <Label hint="Clips below this threshold are excluded from earnings (default: 10,000)">
            Minimum Views for Payout
          </Label>
          <input
            name="min_views_for_payout"
            type="number"
            min={0}
            step={1000}
            placeholder="10000"
            value={minViews}
            onChange={e => setMinViews(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Live cost breakdown */}
        {budgetNum >= 20_000 && (
          <div className={`rounded-lg p-4 grid grid-cols-4 gap-4 ${canAfford ? 'bg-gray-50' : 'bg-red-50 border border-red-200'}`}>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Clipper pool</p>
              <p className="text-sm font-semibold text-gray-900">{fmt(budgetNum)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Wondeed fee (20%)</p>
              <p className="text-sm font-semibold text-gray-900">{fmt(platformFee)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Total charged</p>
              <p className="text-sm font-bold text-gray-900">{fmt(totalCharged)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Est. reach</p>
              <p className="text-sm font-semibold text-gray-900">{fmtViews(maxViews)}</p>
            </div>
            {!canAfford && (
              <div className="col-span-4">
                <p className="text-xs text-red-700 font-medium">
                  ⚠ Your wallet has {fmt(walletBalance)} — need {fmt(totalCharged - walletBalance)} more.
                  <a href="/dashboard/client/wallet" className="underline ml-1">Top up →</a>
                </p>
              </div>
            )}
          </div>
        )}
        {budgetNum > 0 && budgetNum < 20_000 && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            Minimum campaign budget is ₹20,000. Current: {fmt(budgetNum)}.
          </p>
        )}
      </SectionCard>

      {/* ── 6. Campaign Settings ── */}
      <SectionCard title="Campaign Settings">

        {/* Duration */}
        <div>
          <Label hint="Leave blank to run until budget is exhausted">
            Campaign Duration (days)
          </Label>
          <input
            name="duration_days"
            type="number"
            min={1}
            step={1}
            placeholder="30"
            value={duration}
            onChange={e => setDuration(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          {duration && Number(duration) > 0 && (
            <p className="mt-1 text-xs text-gray-400">
              Ends on{' '}
              {new Date(Date.now() + Number(duration) * 86_400_000).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          )}
        </div>

        {/* Minimum Clipper Tier */}
        <div>
          <Label hint="Only clippers at this tier or above can join your campaign">
            Minimum Clipper Tier Required
          </Label>
          <select
            name="min_clipper_tier"
            value={clipperTier}
            onChange={e => setClipperTier(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            {CLIPPER_TIERS.map(t => (
              <option key={t.value} value={t.value}>{t.label} — {t.desc}</option>
            ))}
          </select>
        </div>
      </SectionCard>

      {/* Server error */}
      {serverError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 flex items-start gap-2">
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {serverError}
        </div>
      )}

      {/* Wallet summary + Submit */}
      <div className="bg-white rounded-xl border border-gray-200 px-6 py-4 flex items-center justify-between gap-6">
        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="text-gray-500">Wallet balance: </span>
            <span className={`font-semibold ${canAfford && budgetOk ? 'text-gray-900' : 'text-red-600'}`}>
              {fmt(walletBalance)}
            </span>
          </div>
          {budgetOk && (
            <div>
              <span className="text-gray-500">Will deduct: </span>
              <span className="font-semibold text-gray-900">{fmt(totalCharged)}</span>
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={isPending || !budgetOk || !canAfford || selectedPlatforms.length === 0}
          className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          {isPending ? 'Submitting…' : 'Submit for Approval →'}
        </button>
      </div>

    </form>
  )
}
