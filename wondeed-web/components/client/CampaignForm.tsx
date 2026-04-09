'use client'

import { useState, useTransition } from 'react'
import { createCampaign } from '@/app/dashboard/client/actions'

// ── Constants ────────────────────────────────────────────────

const CLIP_LENGTHS = [
  { value: '15',  label: '15s' },
  { value: '30',  label: '30s' },
  { value: '60',  label: '60s' },
  { value: '90',  label: '90s' },
  { value: '',    label: 'Any' },
]

const CLIP_RATIOS = [
  { value: '9:16',  label: '9:16', desc: 'Reels / Shorts' },
  { value: '16:9',  label: '16:9', desc: 'YouTube' },
  { value: '1:1',   label: '1:1',  desc: 'Square' },
  { value: '4:5',   label: '4:5',  desc: 'Portrait' },
  { value: '',      label: 'Any',  desc: 'No preference' },
]

const LANGUAGES = [
  'Hindi', 'English', 'Hinglish', 'Tamil', 'Telugu',
  'Bengali', 'Marathi', 'Kannada', 'Any',
]

const HOOK_STYLES = [
  'Product Demo', 'Trend Remix', 'Voiceover Review',
  'Tutorial / How-To', 'Comedy Skit', 'Testimonial', 'Any',
]

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram Reels' },
  { id: 'youtube',   label: 'YouTube Shorts'  },
  { id: 'moj',       label: 'Moj'             },
  { id: 'josh',      label: 'Josh'            },
]

const CLIPPER_TIERS = [
  { value: 'pro',        label: 'Pro',        desc: 'All clippers' },
  { value: 'premium',    label: 'Premium',    desc: 'Tier 2+ only' },
  { value: 'enterprise', label: 'Enterprise', desc: 'Top clippers only' },
]

// ── Helpers ──────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

function fmtViews(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

// ── Shared UI primitives ─────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</h2>
      {children}
    </div>
  )
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${props.className ?? ''}`}
    />
  )
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={3}
      {...props}
      className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none ${props.className ?? ''}`}
    />
  )
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { options: string[] }) {
  const { options, ...rest } = props
  return (
    <select
      {...rest}
      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

// ── Main Component ───────────────────────────────────────────

export default function CampaignForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError]   = useState<string | null>(null)

  // Controlled fields needed for live preview / cross-field logic
  const [budget, setBudget]                   = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram', 'youtube'])

  const budgetNum     = parseFloat(budget) || 0
  const platformFee   = Math.round(budgetNum * 0.20 * 100) / 100
  const totalCharged  = budgetNum + platformFee
  const maxViews      = budgetNum > 0 ? Math.floor(budgetNum / 10_000 * 1_000_000) : 0

  // Derive `platform` enum from selected platforms
  const hasIG  = selectedPlatforms.includes('instagram')
  const hasYT  = selectedPlatforms.includes('youtube')
  const derivedPlatform: 'instagram' | 'youtube' | 'both' =
    hasIG && !hasYT ? 'instagram' :
    hasYT && !hasIG ? 'youtube' :
    'both'

  function togglePlatform(id: string) {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (selectedPlatforms.length === 0) {
      setError('Select at least one target platform')
      return
    }
    setError(null)
    const form = e.currentTarget
    startTransition(async () => {
      try {
        await createCampaign(new FormData(form))
      } catch (err: any) {
        setError(err.message)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── 1. Campaign Basics ── */}
      <SectionCard title="Campaign Basics">
        <div>
          <Label required>Campaign title</Label>
          <Input name="title" type="text" required placeholder="e.g. Summer Product Launch — Hindi Reels" />
        </div>

        <div>
          <Label>Source content URL</Label>
          <Input
            name="source_content_url"
            type="url"
            placeholder="https://youtube.com/watch?v=… (reference video for clippers)"
          />
          <p className="mt-1 text-xs text-gray-400">Optional — share the original video clippers should remix or clip from</p>
        </div>

        <div>
          <Label>Brief / Description</Label>
          <Textarea
            name="description"
            placeholder="Describe the product, tone, key messages, and anything clippers must include…"
          />
        </div>
      </SectionCard>

      {/* ── 2. Clip Specifications ── */}
      <SectionCard title="Clip Specifications">

        {/* Clip length */}
        <div>
          <Label>Clip length</Label>
          <div className="flex gap-2 flex-wrap">
            {CLIP_LENGTHS.map(opt => (
              <label key={opt.value} className="relative cursor-pointer">
                <input type="radio" name="clip_length_seconds" value={opt.value} defaultChecked={opt.value === ''} className="sr-only peer" />
                <span className="block px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 peer-checked:border-brand-500 peer-checked:bg-brand-50 peer-checked:text-brand-700 hover:border-gray-300 transition-colors">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Aspect ratio */}
        <div>
          <Label>Aspect ratio</Label>
          <div className="flex gap-2 flex-wrap">
            {CLIP_RATIOS.map(opt => (
              <label key={opt.value} className="relative cursor-pointer">
                <input type="radio" name="clip_aspect_ratio" value={opt.value} defaultChecked={opt.value === '9:16'} className="sr-only peer" />
                <span className="block px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 peer-checked:border-brand-500 peer-checked:bg-brand-50 peer-checked:text-brand-700 hover:border-gray-300 transition-colors">
                  <span className="font-semibold">{opt.label}</span>
                  <span className="block text-xs text-gray-400 mt-0.5">{opt.desc}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <Label>Language</Label>
            <Select name="clip_language" options={LANGUAGES} defaultValue="Hindi" />
          </div>
          <div>
            <Label>Hook style</Label>
            <Select name="hook_style" options={HOOK_STYLES} defaultValue="Any" />
          </div>
        </div>
      </SectionCard>

      {/* ── 3. Target Platforms ── */}
      <SectionCard title="Target Platforms">
        {/* Hidden field carries the enum-compatible platform value */}
        <input type="hidden" name="platform" value={derivedPlatform} />

        <div className="grid grid-cols-2 gap-3">
          {PLATFORMS.map(p => (
            <label
              key={p.id}
              className={`flex items-center gap-3 p-3.5 border rounded-lg cursor-pointer transition-colors ${
                selectedPlatforms.includes(p.id)
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                name="target_platforms"
                value={p.id}
                checked={selectedPlatforms.includes(p.id)}
                onChange={() => togglePlatform(p.id)}
                className="sr-only"
              />
              <span className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${
                selectedPlatforms.includes(p.id) ? 'bg-brand-500 border-brand-500' : 'border-gray-300'
              }`}>
                {selectedPlatforms.includes(p.id) && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <span className="text-sm font-medium text-gray-900">{p.label}</span>
            </label>
          ))}
        </div>
        {selectedPlatforms.length === 0 && (
          <p className="text-xs text-red-500">Select at least one platform</p>
        )}
      </SectionCard>

      {/* ── 4. Content Requirements ── */}
      <SectionCard title="Content Requirements">
        <div>
          <Label>Mandatory caption &amp; hashtags</Label>
          <Textarea
            name="mandatory_caption"
            placeholder={"Check out @yourbrand! 🔥 #BrandName #Sponsored #Ad\n\nClippers must include this caption word-for-word."}
          />
          <p className="mt-1 text-xs text-gray-400">Clippers are required to use this exact caption when posting. Leave blank if none.</p>
        </div>
      </SectionCard>

      {/* ── 5. Budget & Payout Rules ── */}
      <SectionCard title="Budget &amp; Payout Rules">

        <div className="grid grid-cols-2 gap-5">
          {/* Budget */}
          <div>
            <Label required>Campaign budget (₹)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₹</span>
              <input
                name="budget_inr"
                type="number"
                min={20000}
                step={1000}
                required
                placeholder="20000"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <p className="mt-1 text-xs text-gray-400">Minimum ₹20,000 · Clippers earn ₹10K per 1M views</p>
          </div>

          {/* Per-post view cap */}
          <div>
            <Label required>Per-post view cap</Label>
            <Input
              name="per_post_view_cap"
              type="number"
              min={10000}
              step={10000}
              required
              placeholder="500000"
            />
            <p className="mt-1 text-xs text-gray-400">Max views a single clip can earn from (e.g. 500K)</p>
          </div>
        </div>

        {/* Minimum views for payout */}
        <div>
          <Label>Minimum views for payout</Label>
          <Input
            name="min_views_for_payout"
            type="number"
            min={0}
            step={1000}
            placeholder="10000"
          />
          <p className="mt-1 text-xs text-gray-400">Clips below this view threshold won&apos;t be eligible for earnings. Leave blank for no minimum.</p>
        </div>

        {/* Live cost preview */}
        {budgetNum >= 20000 && (
          <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-4 gap-4">
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
              <p className="text-xs text-gray-400 mb-0.5">Estimated reach</p>
              <p className="text-sm font-semibold text-gray-900">{fmtViews(maxViews)}</p>
            </div>
          </div>
        )}
      </SectionCard>

      {/* ── 6. Campaign Settings ── */}
      <SectionCard title="Campaign Settings">

        {/* Duration */}
        <div>
          <Label>Campaign duration (days)</Label>
          <Input
            name="duration_days"
            type="number"
            min={1}
            step={1}
            placeholder="30"
          />
          <p className="mt-1 text-xs text-gray-400">Leave blank to run until budget is exhausted.</p>
        </div>

        {/* Minimum clipper tier */}
        <div>
          <Label>Minimum clipper tier</Label>
          <div className="grid grid-cols-3 gap-3">
            {CLIPPER_TIERS.map(t => (
              <label key={t.value} className="relative cursor-pointer">
                <input type="radio" name="min_clipper_tier" value={t.value} defaultChecked={t.value === 'pro'} className="sr-only peer" />
                <span className="block p-3 border border-gray-200 rounded-lg peer-checked:border-brand-500 peer-checked:bg-brand-50 hover:border-gray-300 transition-colors">
                  <span className="block text-sm font-semibold text-gray-900">{t.label}</span>
                  <span className="block text-xs text-gray-500 mt-0.5">{t.desc}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Submit */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-gray-400">
          Saved as a <strong>draft</strong> first — review and submit for admin approval on the next screen.
        </p>
        <button
          type="submit"
          disabled={isPending || budgetNum < 20000 || selectedPlatforms.length === 0}
          className="px-6 py-2.5 bg-brand-500 text-white text-sm font-semibold rounded-lg hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? 'Saving…' : 'Save Campaign →'}
        </button>
      </div>

    </form>
  )
}
