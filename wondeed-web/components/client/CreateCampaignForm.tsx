'use client'

import { useState, useTransition } from 'react'
import { createCampaignAndSubmit } from '@/app/dashboard/client/actions'
import { NICHES } from '@/components/client/CampaignForm'
import { fmtRupee as fmt, fmtViews } from '@/lib/format'

const CLIP_LENGTHS = [
  { value: '30', label: '30s' },
  { value: '60', label: '60s' },
  { value: '90', label: '90s' },
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
  { value: 'energetic',   label: 'Energetic',   desc: 'High-energy, fast cuts' },
  { value: 'educational', label: 'Educational', desc: 'Teach or explain'        },
  { value: 'emotional',   label: 'Emotional',   desc: 'Evoke feeling or story'  },
  { value: 'funny',       label: 'Funny',       desc: 'Comedy / meme format'    },
]

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram Reels' },
  { id: 'youtube',   label: 'YouTube Shorts'  },
  { id: 'x',         label: 'X (Twitter)'     },
]

const CLIPPER_TIERS = [
  { value: 'pro',        label: 'Tier 1 – Pro',        desc: 'All clippers welcome'   },
  { value: 'premium',    label: 'Tier 2 – Premium',    desc: 'Experienced clippers'   },
  { value: 'enterprise', label: 'Tier 3 – Enterprise', desc: 'Top-tier clippers only' },
]


type FieldErrors = Partial<Record<string, string>>

export default function CreateCampaignForm({ walletBalance }: { walletBalance: number }) {
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [success, setSuccess]         = useState(false)

  const [title, setTitle]             = useState('')
  const [budget, setBudget]           = useState('')
  const [niche, setNiche]             = useState(NICHES[0].value)
  const [perPostCap, setPerPostCap]   = useState('')
  const [minViews, setMinViews]       = useState('10000')
  const [duration, setDuration]       = useState('')
  const [description, setDescription] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram', 'youtube'])
  const [clipLength, setClipLength]   = useState('60')
  const [clipRatio, setClipRatio]     = useState('9:16')
  const [hookStyle, setHookStyle]     = useState('energetic')
  const [clipperTier, setClipperTier] = useState('pro')

  const budgetNum     = parseFloat(budget) || 0
  const selectedNiche = NICHES.find(n => n.value === niche) ?? NICHES[0]
  const maxViews      = budgetNum > 0 && selectedNiche.suggestedCpm > 0
    ? Math.floor((budgetNum / selectedNiche.suggestedCpm) * 1_000_000)
    : 0
  const canAfford    = walletBalance >= budgetNum
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
    if (budgetNum >= 20_000 && !canAfford) errors.budget = `Insufficient wallet balance. Available: ${fmt(walletBalance)}`
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
      <div className="card" style={{ padding: '64px 28px', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28, color: 'var(--success)' }}>
            <path d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h2 style={{ marginBottom: 8 }}>Campaign Submitted!</h2>
        <div className="sub mb-4">Your campaign is pending admin approval. We&apos;ll notify you once it goes live.</div>
        <div className="text-xs faint mb-20">{fmt(budgetNum)} has been deducted from your wallet.</div>
        <div className="row gap-12 justify-center">
          <a href="/dashboard/client/campaigns" className="btn btn-primary">View My Campaigns →</a>
          <button onClick={() => setSuccess(false)} className="btn btn-secondary">Create Another</button>
        </div>
      </div>
    )
  }


  return (
    <form onSubmit={handleSubmit} className="col gap-16">

      {/* ── Sticky stepper ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'var(--bg)', padding: '10px 0 6px', marginBottom: 4, borderBottom: '1px solid var(--border)' }}>
        <div className="row gap-0" style={{ background: 'var(--surface)', borderRadius: 10, padding: '6px 8px', display: 'flex', gap: 4 }}>
          {[
            { n: 1, label: 'Basics' },
            { n: 2, label: 'Clip Specs' },
            { n: 3, label: 'Platforms' },
            { n: 4, label: 'Budget' },
          ].map(({ n, label }) => (
            <div key={n} className="row gap-6" style={{ flex: 1, justifyContent: 'center', padding: '5px 8px', borderRadius: 7, background: 'var(--surface-2)', opacity: 1 }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--primary)', color: '#0a0a0a', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</span>
              <span className="text-xs med" style={{ color: 'var(--fg)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 1. Campaign Basics ── */}
      <div className="card">
        <div className="card-head">
          <div>
            <h2>Campaign Basics</h2>
            <div className="sub">Tell clippers what to make and who you&apos;re targeting.</div>
          </div>
          <div className="card-head-right">
            <span className="badge badge-indigo">Step 1 of 4</span>
          </div>
        </div>
        <div style={{ padding: '20px 24px' }} className="col gap-16">

          <div className="field" data-error={fieldErrors.title ? true : undefined}>
            <label className="field-label">Campaign Name <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input
              className="input"
              name="title"
              type="text"
              required
              value={title}
              onChange={e => { setTitle(e.target.value); setFieldErrors(f => ({ ...f, title: undefined })) }}
              placeholder="e.g. Summer Product Launch — Hindi Reels"
            />
            {fieldErrors.title && <span className="field-hint" style={{ color: 'var(--danger)' }}>{fieldErrors.title}</span>}
          </div>

          <div className="field">
            <label className="field-label">Campaign Niche</label>
            <select
              name="niche"
              className="select"
              value={niche}
              onChange={e => setNiche(e.target.value)}
            >
              {NICHES.map(n => (
                <option key={n.value} value={n.value}>{n.label}</option>
              ))}
            </select>
            <span className="field-hint">
              Indicative CPM: ₹{selectedNiche.suggestedCpm.toLocaleString('en-IN')}/M views — actual rate confirmed by Wondeed before going live
            </span>
          </div>

          <div className="field">
            <label className="field-label">Source Content URL</label>
            <div className="row gap-8">
              <input
                className="input"
                name="source_content_url"
                type="url"
                placeholder="https://youtube.com/watch?v=… or hosted MP4"
              />
              <button type="button" className="btn btn-secondary">Verify</button>
            </div>
            <span className="field-hint">YouTube, Vimeo, or Drive link. Clippers will edit clips from this source.</span>
          </div>

          <div className="field">
            <label className="field-label">Campaign Brief</label>
            <div className="col gap-4">
              <textarea
                className="textarea"
                name="description"
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What should clippers communicate? Tone, format, any dos and don'ts?"
              />
              <div className="row between">
                <span className="field-hint">Be specific about tone, format, and any do-not-include rules.</span>
                <span className="text-xs faint">{description.length} / 1000</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── 2. Clip Specifications ── */}
      <div className="card">
        <div className="card-head">
          <div>
            <h2>Clip Specifications</h2>
            <div className="sub">Define the format clippers must follow.</div>
          </div>
          <div className="card-head-right">
            <span className="badge badge-indigo">Step 2 of 4</span>
          </div>
        </div>
        <div style={{ padding: '20px 24px' }} className="col gap-16">

          <div className="field">
            <label className="field-label">Clip Length</label>
            <div className="segmented">
              {CLIP_LENGTHS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`seg-item ${clipLength === opt.value ? 'active' : ''}`}
                  onClick={() => setClipLength(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <input type="hidden" name="clip_length_seconds" value={clipLength} />
          </div>

          <div className="field">
            <label className="field-label">Aspect Ratio</label>
            <div className="row gap-8 flex-wrap">
              {CLIP_RATIOS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`chip ${clipRatio === opt.value ? 'active' : ''}`}
                  onClick={() => setClipRatio(opt.value)}
                  style={{ flexDirection: 'column', alignItems: 'center', gap: 2, padding: '8px 16px', height: 'auto' }}
                >
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{opt.label}</span>
                  <span style={{ fontSize: 11, opacity: 0.7 }}>{opt.desc}</span>
                </button>
              ))}
            </div>
            <input type="hidden" name="clip_aspect_ratio" value={clipRatio} />
            {clipRatio === '9:16' && (
              <span className="field-hint" style={{ color: 'var(--primary)' }}>✓ Recommended — works on all short-form platforms</span>
            )}
          </div>

          <div className="field">
            <label className="field-label">Language</label>
            <select name="clip_language" className="select" defaultValue="Hindi">
              {LANGUAGES.map(l => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="field-label">Hook Style</label>
            <div className="g2">
              {HOOK_STYLES.map(h => (
                <button
                  key={h.value}
                  type="button"
                  className={`chip ${hookStyle === h.value ? 'active' : ''}`}
                  onClick={() => setHookStyle(h.value)}
                  style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2, padding: '10px 14px', height: 'auto' }}
                >
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{h.label}</span>
                  <span style={{ fontSize: 11, opacity: 0.7 }}>{h.desc}</span>
                </button>
              ))}
            </div>
            <input type="hidden" name="hook_style" value={hookStyle} />
          </div>

        </div>
      </div>

      {/* ── 3. Target Platforms ── */}
      <div className="card">
        <div className="card-head">
          <div>
            <h2>Target Platforms</h2>
            <div className="sub">Which platforms should clippers post on?</div>
          </div>
          <div className="card-head-right">
            <span className="badge badge-indigo">Step 3 of 4</span>
          </div>
        </div>
        <div style={{ padding: '20px 24px' }} className="col gap-16">
          <input type="hidden" name="platform" value={derivedPlatform} />

          <div className="field" data-error={fieldErrors.platforms ? true : undefined}>
            <div className="row gap-8 flex-wrap">
              {PLATFORMS.map(p => {
                const checked = selectedPlatforms.includes(p.id)
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`chip ${checked ? 'active' : ''}`}
                    onClick={() => togglePlatform(p.id)}
                    style={{ padding: '8px 16px' }}
                  >
                    <input type="checkbox" name="target_platforms" value={p.id} checked={checked} onChange={() => togglePlatform(p.id)} className="sr-only" />
                    {p.label}
                  </button>
                )
              })}
            </div>
            {fieldErrors.platforms && <span className="field-hint" style={{ color: 'var(--danger)' }}>{fieldErrors.platforms}</span>}
          </div>

          <div className="field">
            <label className="field-label">Mandatory Caption &amp; Hashtags</label>
            <textarea
              name="mandatory_caption"
              className="textarea"
              rows={4}
              placeholder={"Check out @yourbrand! 🔥 #BrandName #Sponsored #Ad\n\n(Clippers must include this caption word-for-word)"}
              style={{ fontFamily: 'var(--mono)' }}
            />
            <span className="field-hint">Clippers must include this verbatim. Leave blank if none required.</span>
          </div>

        </div>
      </div>

      {/* ── 4. Budget & Settings ── */}
      <div className="card">
        <div className="card-head">
          <div>
            <h2>Budget &amp; Settings</h2>
            <div className="sub">Define spend limits and campaign rules.</div>
          </div>
          <div className="card-head-right">
            <span className="badge badge-indigo">Step 4 of 4</span>
          </div>
        </div>
        <div style={{ padding: '20px 24px' }} className="col gap-16">

          <div className="g2">
            <div className="field" data-error={fieldErrors.budget ? true : undefined}>
              <label className="field-label">Total Budget (₹) <span style={{ color: 'var(--danger)' }}>*</span></label>
              <div className="row gap-0" style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-muted)', fontSize: 14, fontWeight: 500, pointerEvents: 'none' }}>₹</span>
                <input
                  name="budget_inr"
                  type="number"
                  min={20000}
                  step={1000}
                  required
                  placeholder="20000"
                  value={budget}
                  onChange={e => { setBudget(e.target.value); setFieldErrors(f => ({ ...f, budget: undefined })) }}
                  className="input"
                  style={{ paddingLeft: 28 }}
                />
              </div>
              <span className="field-hint">Minimum ₹20,000 · Rate set by admin after approval</span>
              {fieldErrors.budget && <span className="field-hint" style={{ color: 'var(--danger)' }}>{fieldErrors.budget}</span>}
            </div>

            <div className="field" data-error={fieldErrors.perPostCap ? true : undefined}>
              <label className="field-label">Per-Post View Cap <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input
                name="per_post_view_cap"
                type="number"
                min={10000}
                step={10000}
                required
                placeholder="500000"
                value={perPostCap}
                onChange={e => { setPerPostCap(e.target.value); setFieldErrors(f => ({ ...f, perPostCap: undefined })) }}
                className="input"
              />
              <span className="field-hint">
                Max views a single clip can earn from
                {perPostCap && Number(perPostCap) > 0 ? ` · Cap: ${fmtViews(Number(perPostCap))} views` : ''}
              </span>
              {fieldErrors.perPostCap && <span className="field-hint" style={{ color: 'var(--danger)' }}>{fieldErrors.perPostCap}</span>}
            </div>
          </div>

          <div className="field">
            <label className="field-label">Minimum Views for Payout</label>
            <input
              name="min_views_for_payout"
              type="number"
              min={0}
              step={1000}
              placeholder="10000"
              value={minViews}
              onChange={e => setMinViews(e.target.value)}
              className="input"
            />
            <span className="field-hint">Clips below this threshold are excluded from earnings (default: 10,000)</span>
          </div>

          {/* Live cost breakdown */}
          {budgetNum >= 20_000 && (
            <div className="helper" style={!canAfford ? { background: 'var(--danger-bg)', borderColor: '#fecaca' } : {}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, flexShrink: 0 }}>
                <circle cx="12" cy="12" r="9"/><path d="M12 16v-5"/><circle cx="12" cy="8" r="0.6" fill="currentColor" stroke="none"/>
              </svg>
              <div className="row gap-24 flex-wrap">
                <div>
                  <div className="text-xs faint">Campaign budget</div>
                  <div className="med">{fmt(budgetNum)}</div>
                </div>
                <div>
                  <div className="text-xs faint">Indicative CPM</div>
                  <div className="med">₹{selectedNiche.suggestedCpm.toLocaleString('en-IN')}/M</div>
                </div>
                <div>
                  <div className="text-xs faint">Est. reach</div>
                  <div className="med">{fmtViews(maxViews)}</div>
                </div>
                {!canAfford && (
                  <div style={{ color: 'var(--danger)' }}>
                    <div className="text-xs">Wallet has {fmt(walletBalance)} — need {fmt(budgetNum - walletBalance)} more.</div>
                    <a href="/dashboard/client/billing" style={{ color: 'inherit', fontSize: 12, fontWeight: 600 }}>Top up →</a>
                  </div>
                )}
              </div>
            </div>
          )}
          {budgetNum > 0 && budgetNum < 20_000 && (
            <div className="helper" style={{ background: 'var(--danger-bg)', borderColor: '#fecaca', color: 'var(--danger)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, flexShrink: 0 }}>
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              Minimum campaign budget is ₹20,000. Current: {fmt(budgetNum)}.
            </div>
          )}

          <div className="g2">
            <div className="field">
              <label className="field-label">Campaign Duration (days)</label>
              <input
                name="duration_days"
                type="number"
                min={1}
                step={1}
                placeholder="30"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                className="input"
              />
              {duration && Number(duration) > 0 && (
                <span className="field-hint">
                  Ends on {new Date(Date.now() + Number(duration) * 86_400_000).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </span>
              )}
              {!duration && <span className="field-hint">Leave blank to run until budget is exhausted</span>}
            </div>

            <div className="field">
              <label className="field-label">Minimum Clipper Tier</label>
              <select
                name="min_clipper_tier"
                value={clipperTier}
                onChange={e => setClipperTier(e.target.value)}
                className="select"
              >
                {CLIPPER_TIERS.map(t => (
                  <option key={t.value} value={t.value}>{t.label} — {t.desc}</option>
                ))}
              </select>
              <span className="field-hint">Only clippers at this tier or above can join</span>
            </div>
          </div>

        </div>
      </div>

      {/* Server error */}
      {serverError && (
        <div className="helper" style={{ background: 'var(--danger-bg)', borderColor: '#fecaca', color: 'var(--danger)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, flexShrink: 0 }}>
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          {serverError}
        </div>
      )}

      {/* ── Fee disclosure + Review summary ── */}
      {budgetOk && (
        <div className="card" style={{ padding: '20px 24px', background: 'rgba(0,210,106,0.04)', border: '1px solid rgba(0,210,106,0.2)' }}>
          <div className="row gap-8 mb-12">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, color: 'var(--primary)', flexShrink: 0 }}>
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div className="bold text-xs">Campaign Cost Summary</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { label: 'Campaign budget', value: fmt(budgetNum), note: 'Locked in wallet escrow' },
              { label: 'Platform fee', value: '20%', note: 'Included in CPM — ₹0 extra' },
              { label: 'You pay today', value: fmt(budgetNum), note: 'Total wallet deduction' },
              { label: 'Est. reach', value: maxViews > 0 ? fmtViews(maxViews) : '—', note: 'At indicative CPM' },
            ].map(({ label, value, note }) => (
              <div key={label}>
                <div className="text-xs faint">{label}</div>
                <div className="med" style={{ fontSize: 15, marginTop: 2 }}>{value}</div>
                <div className="text-xs faint mt-2" style={{ fontSize: 11 }}>{note}</div>
              </div>
            ))}
          </div>
          <div className="text-xs faint mt-12" style={{ borderTop: '1px solid var(--border)', paddingTop: 10, lineHeight: 1.6 }}>
            The 20% platform fee is built into the CPM rate — brands never pay extra. You&apos;re charged {fmt(budgetNum)} today; unspent budget is returned to your wallet after the campaign ends.
          </div>
        </div>
      )}

      {/* Submit bar */}
      <div className="card" style={{ padding: '16px 24px' }}>
        <div className="row between items-center">
          <div className="row gap-20 text-xs">
            <span className="faint">
              Wallet: <span className="med" style={{ color: canAfford && budgetOk ? 'var(--fg)' : 'var(--danger)' }}>
                {fmt(walletBalance)}
              </span>
            </span>
            {budgetOk && (
              <span className="faint">
                Will deduct: <span className="med" style={{ color: 'var(--primary)' }}>{fmt(budgetNum)}</span>
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={isPending || !budgetOk || !canAfford || selectedPlatforms.length === 0}
            className="btn btn-primary"
          >
            {isPending ? 'Submitting…' : 'Submit for Approval →'}
          </button>
        </div>
      </div>

    </form>
  )
}
