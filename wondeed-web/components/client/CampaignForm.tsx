'use client'

import { useState, useTransition } from 'react'
import { createCampaign } from '@/app/dashboard/client/actions'

export const NICHES = [
  { value: 'finance',       label: 'Finance & Investing',   suggestedCpm: 15000 },
  { value: 'crypto',        label: 'Crypto & Web3',          suggestedCpm: 16000 },
  { value: 'real_estate',   label: 'Real Estate',            suggestedCpm: 14000 },
  { value: 'tech',          label: 'Tech & Gadgets',         suggestedCpm: 13000 },
  { value: 'fitness',       label: 'Fitness & Health',       suggestedCpm: 12000 },
  { value: 'travel',        label: 'Travel & Lifestyle',     suggestedCpm: 11000 },
  { value: 'beauty',        label: 'Beauty & Skincare',      suggestedCpm: 10000 },
  { value: 'education',     label: 'Education & Learning',   suggestedCpm: 10000 },
  { value: 'fashion',       label: 'Fashion',                suggestedCpm: 10000 },
  { value: 'food',          label: 'Food & Cooking',         suggestedCpm: 9000  },
  { value: 'entertainment', label: 'Entertainment & Comedy', suggestedCpm: 8000  },
  { value: 'gaming',        label: 'Gaming',                 suggestedCpm: 8000  },
]

const CLIP_LENGTHS = [
  { value: '15', label: '15s' },
  { value: '30', label: '30s' },
  { value: '60', label: '60s' },
  { value: '90', label: '90s' },
  { value: '',   label: 'Any' },
]

const CLIP_RATIOS = [
  { value: '9:16', label: '9:16', desc: 'Reels / Shorts' },
  { value: '16:9', label: '16:9', desc: 'YouTube' },
  { value: '1:1',  label: '1:1',  desc: 'Square' },
  { value: '4:5',  label: '4:5',  desc: 'Portrait' },
  { value: '',     label: 'Any',  desc: 'No preference' },
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
  { id: 'x',         label: 'X (Twitter)'     },
]

const CLIPPER_TIERS = [
  { value: 'pro',        label: 'Pro',        desc: 'All clippers' },
  { value: 'premium',    label: 'Premium',    desc: 'Tier 2+ only' },
  { value: 'enterprise', label: 'Enterprise', desc: 'Top clippers only' },
]

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

function fmtViews(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

export default function CampaignForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError]            = useState<string | null>(null)

  const [budget, setBudget]                       = useState('')
  const [niche, setNiche]                         = useState(NICHES[0].value)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram', 'youtube'])
  const [clipLength, setClipLength]               = useState('')
  const [clipRatio, setClipRatio]                 = useState('9:16')
  const [clipperTier, setClipperTier]             = useState('pro')

  const budgetNum     = parseFloat(budget) || 0
  const selectedNiche = NICHES.find(n => n.value === niche) ?? NICHES[0]
  const maxViews      = budgetNum > 0 && selectedNiche.suggestedCpm > 0
    ? Math.floor(budgetNum / selectedNiche.suggestedCpm * 1_000_000)
    : 0

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
    if (selectedPlatforms.length === 0) { setError('Select at least one target platform'); return }
    setError(null)
    const form = e.currentTarget
    startTransition(async () => {
      try { await createCampaign(new FormData(form)) }
      catch (err: any) { setError(err.message) }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="col gap-16">

      {/* Hidden controlled fields */}
      <input type="hidden" name="clip_length_seconds" value={clipLength} />
      <input type="hidden" name="clip_aspect_ratio" value={clipRatio} />
      <input type="hidden" name="min_clipper_tier" value={clipperTier} />
      <input type="hidden" name="platform" value={derivedPlatform} />

      {/* 1. Campaign Basics */}
      <div className="card">
        <div className="card-head">
          <div><h2>Campaign Basics</h2><div className="sub">Title, niche and reference content</div></div>
          <div className="card-head-right"><span className="badge badge-neutral">Step 1 of 6</span></div>
        </div>
        <div style={{ padding: '20px 24px' }} className="col gap-16">
          <div className="field">
            <label className="field-label">Campaign title *</label>
            <input name="title" type="text" required placeholder="e.g. Summer Product Launch — Hindi Reels" className="input" />
          </div>

          <div className="field">
            <label className="field-label">Campaign niche *</label>
            <select name="niche" value={niche} onChange={e => setNiche(e.target.value)} className="select">
              {NICHES.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
            </select>
            <span className="field-hint">
              Indicative CPM: ₹{selectedNiche.suggestedCpm.toLocaleString('en-IN')}/M views — confirmed by Wondeed before campaign goes live
            </span>
          </div>

          <div className="field">
            <label className="field-label">Source content URL</label>
            <input name="source_content_url" type="url" placeholder="https://youtube.com/watch?v=… (reference video for clippers)" className="input" />
            <span className="field-hint">Optional — share the original video clippers should remix or clip from</span>
          </div>

          <div className="field">
            <label className="field-label">Brief / Description</label>
            <textarea name="description" placeholder="Describe the product, tone, key messages, and anything clippers must include…" className="textarea" />
          </div>
        </div>
      </div>

      {/* 2. Clip Specifications */}
      <div className="card">
        <div className="card-head">
          <div><h2>Clip Specifications</h2><div className="sub">Length, format and style guidelines</div></div>
          <div className="card-head-right"><span className="badge badge-neutral">Step 2 of 6</span></div>
        </div>
        <div style={{ padding: '20px 24px' }} className="col gap-16">

          <div className="field">
            <label className="field-label">Clip length</label>
            <div className="row gap-8" style={{ flexWrap: 'wrap' }}>
              {CLIP_LENGTHS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setClipLength(opt.value)}
                  className={`chip${clipLength === opt.value ? ' active' : ''}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label className="field-label">Aspect ratio</label>
            <div className="row gap-8" style={{ flexWrap: 'wrap' }}>
              {CLIP_RATIOS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setClipRatio(opt.value)}
                  className={`chip${clipRatio === opt.value ? ' active' : ''}`}
                >
                  <span className="med">{opt.label}</span>
                  <span className="text-xs faint" style={{ display: 'block', marginTop: 2 }}>{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="g2">
            <div className="field">
              <label className="field-label">Language</label>
              <select name="clip_language" defaultValue="Hindi" className="select">
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="field-label">Hook style</label>
              <select name="hook_style" defaultValue="Any" className="select">
                {HOOK_STYLES.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Target Platforms */}
      <div className="card">
        <div className="card-head">
          <div><h2>Target Platforms</h2><div className="sub">Where clippers should post</div></div>
          <div className="card-head-right"><span className="badge badge-neutral">Step 3 of 6</span></div>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <div className="g2">
            {PLATFORMS.map(p => (
              <label
                key={p.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  borderRadius: 8, border: `1px solid ${selectedPlatforms.includes(p.id) ? 'var(--primary)' : 'var(--border)'}`,
                  background: selectedPlatforms.includes(p.id) ? 'rgba(0,210,106,0.06)' : 'var(--surface)',
                  cursor: 'pointer',
                }}
              >
                <span style={{
                  width: 16, height: 16, borderRadius: 4, flexShrink: 0, border: `1.5px solid ${selectedPlatforms.includes(p.id) ? 'var(--primary)' : 'var(--border)'}`,
                  background: selectedPlatforms.includes(p.id) ? 'var(--primary)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {selectedPlatforms.includes(p.id) && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth={3} style={{ width: 10, height: 10 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <input type="checkbox" name="target_platforms" value={p.id} checked={selectedPlatforms.includes(p.id)} onChange={() => togglePlatform(p.id)} style={{ display: 'none' }} />
                <span className="med text-xs">{p.label}</span>
              </label>
            ))}
          </div>
          {selectedPlatforms.length === 0 && (
            <p className="text-xs mt-8" style={{ color: 'var(--danger)' }}>Select at least one platform</p>
          )}
        </div>
      </div>

      {/* 4. Content Requirements */}
      <div className="card">
        <div className="card-head">
          <div><h2>Content Requirements</h2><div className="sub">Caption and hashtags clippers must use</div></div>
          <div className="card-head-right"><span className="badge badge-neutral">Step 4 of 6</span></div>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <div className="field">
            <label className="field-label">Mandatory caption &amp; hashtags</label>
            <textarea
              name="mandatory_caption"
              placeholder={"Check out @yourbrand! 🔥 #BrandName #Sponsored #Ad\n\nClippers must include this caption word-for-word."}
              className="textarea"
            />
            <span className="field-hint">Clippers are required to use this exact caption when posting. Leave blank if none.</span>
          </div>
        </div>
      </div>

      {/* 5. Budget & Payout Rules */}
      <div className="card">
        <div className="card-head">
          <div><h2>Budget &amp; Payout Rules</h2><div className="sub">How much to spend and per-clip limits</div></div>
          <div className="card-head-right"><span className="badge badge-neutral">Step 5 of 6</span></div>
        </div>
        <div style={{ padding: '20px 24px' }} className="col gap-16">
          <div className="g2">
            <div className="field">
              <label className="field-label">Campaign budget (₹) *</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-muted)', fontSize: 13, fontWeight: 500 }}>₹</span>
                <input
                  name="budget_inr"
                  type="number"
                  min={20000}
                  step={1000}
                  required
                  placeholder="20000"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  className="input"
                  style={{ paddingLeft: 26 }}
                />
              </div>
              <span className="field-hint">Minimum ₹20,000 · Payout rate set by admin after approval</span>
            </div>

            <div className="field">
              <label className="field-label">Per-post view cap *</label>
              <input name="per_post_view_cap" type="number" min={10000} step={10000} required placeholder="500000" className="input" />
              <span className="field-hint">Max views a single clip can earn from (e.g. 500K)</span>
            </div>
          </div>

          <div className="field">
            <label className="field-label">Minimum views for payout</label>
            <input name="min_views_for_payout" type="number" min={0} step={1000} placeholder="10000" className="input" />
            <span className="field-hint">Clips below this view threshold won&apos;t be eligible for earnings. Leave blank for no minimum.</span>
          </div>

          {budgetNum >= 20000 && (
            <div className="g3" style={{ background: 'var(--surface-2)', borderRadius: 8, padding: '16px' }}>
              <div>
                <p className="text-xs faint mb-4">Campaign budget</p>
                <p className="med text-xs">{fmt(budgetNum)}</p>
              </div>
              <div>
                <p className="text-xs faint mb-4">Indicative CPM</p>
                <p className="med text-xs">₹{selectedNiche.suggestedCpm.toLocaleString('en-IN')}/M</p>
                <p className="text-xs faint">Confirmed by Wondeed</p>
              </div>
              <div>
                <p className="text-xs faint mb-4">Est. reach</p>
                <p className="med text-xs">{fmtViews(maxViews)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 6. Campaign Settings */}
      <div className="card">
        <div className="card-head">
          <div><h2>Campaign Settings</h2><div className="sub">Duration and clipper tier requirements</div></div>
          <div className="card-head-right"><span className="badge badge-neutral">Step 6 of 6</span></div>
        </div>
        <div style={{ padding: '20px 24px' }} className="col gap-16">
          <div className="field">
            <label className="field-label">Campaign duration (days)</label>
            <input name="duration_days" type="number" min={1} step={1} placeholder="30" className="input" />
            <span className="field-hint">Leave blank to run until budget is exhausted.</span>
          </div>

          <div className="field">
            <label className="field-label">Minimum clipper tier</label>
            <div className="g3">
              {CLIPPER_TIERS.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setClipperTier(t.value)}
                  className={`chip${clipperTier === t.value ? ' active' : ''}`}
                  style={{ height: 'auto', padding: '12px 14px', flexDirection: 'column', alignItems: 'flex-start' }}
                >
                  <span className="med text-xs">{t.label}</span>
                  <span className="text-xs faint" style={{ marginTop: 2 }}>{t.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="helper" style={{ borderColor: 'var(--danger)', background: 'var(--danger-bg)', color: 'var(--danger)' }}>
          {error}
        </div>
      )}

      <div className="row between" style={{ paddingTop: 4 }}>
        <p className="text-xs faint">
          Saved as a <strong>draft</strong> first — review and submit for admin approval on the next screen.
        </p>
        <button
          type="submit"
          disabled={isPending || budgetNum < 20000 || selectedPlatforms.length === 0}
          className="btn btn-primary"
        >
          {isPending ? 'Saving…' : 'Save Campaign →'}
        </button>
      </div>
    </form>
  )
}
