'use client'

import { useState, useTransition } from 'react'
import { updateCampaignCpm } from '@/app/dashboard/admin/actions'

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

type Campaign = {
  id: string
  title: string
  status: string
  budget_inr: number
  platform: string
  rate_per_million_inr: number
  created_at: string
  profiles: { full_name: string | null; phone: string | null } | null
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'active')    return <span className="badge badge-success" style={{ textTransform: 'capitalize' }}>{status}</span>
  if (status === 'completed') return <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>{status}</span>
  if (status === 'cancelled') return <span className="badge badge-danger" style={{ textTransform: 'capitalize' }}>{status}</span>
  return <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>{status}</span>
}

function CampaignRow({ c }: { c: Campaign }) {
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing]        = useState(false)
  const [cpm, setCpm]                = useState(String(c.rate_per_million_inr || ''))
  const [error, setError]            = useState<string | null>(null)
  const [saved, setSaved]            = useState(false)

  function handleSave() {
    const rate = parseInt(cpm, 10)
    if (!rate || rate <= 0) { setError('Enter a valid CPM'); return }
    setError(null)
    startTransition(async () => {
      try {
        await updateCampaignCpm(c.id, rate)
        setSaved(true)
        setEditing(false)
        setTimeout(() => setSaved(false), 2000)
      } catch (e: any) {
        setError(e.message)
      }
    })
  }

  const canEdit = c.status === 'active' || c.status === 'paused'

  return (
    <tr>
      <td><span className="med text-xs">{c.title}</span></td>
      <td className="muted text-xs">{c.profiles?.full_name ?? c.profiles?.phone ?? '—'}</td>
      <td><span className="med text-xs">{fmt(c.budget_inr)}</span></td>
      <td className="muted text-xs" style={{ textTransform: 'capitalize' }}>{c.platform}</td>
      <td><StatusBadge status={c.status} /></td>
      <td>
        {canEdit ? (
          editing ? (
            <div className="row gap-8">
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--fg-muted)' }}>₹</span>
                <input
                  type="number"
                  min={1000}
                  step={500}
                  value={cpm}
                  onChange={e => { setCpm(e.target.value); setError(null) }}
                  className="input"
                  style={{ paddingLeft: 20, paddingTop: 5, paddingBottom: 5, fontSize: 12, width: 112 }}
                  autoFocus
                />
              </div>
              <span className="text-xs faint">/M</span>
              <button onClick={handleSave} disabled={isPending} className="btn btn-primary btn-sm">
                {isPending ? '…' : 'Save'}
              </button>
              <button onClick={() => { setEditing(false); setError(null) }} className="btn btn-sm btn-ghost">Cancel</button>
              {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}
            </div>
          ) : (
            <div className="row gap-8">
              <span className="med text-xs">
                {c.rate_per_million_inr > 0
                  ? `₹${c.rate_per_million_inr.toLocaleString('en-IN')}/M`
                  : <span style={{ color: 'var(--warning)' }}>Not set</span>
                }
              </span>
              <button
                onClick={() => setEditing(true)}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--primary)', fontSize: 12 }}
              >
                {c.rate_per_million_inr > 0 ? 'Edit' : 'Set CPM'}
              </button>
              {saved && <span className="text-xs" style={{ color: 'var(--success)' }}>Saved!</span>}
            </div>
          )
        ) : (
          <span className="text-xs faint">
            {c.rate_per_million_inr > 0 ? `₹${c.rate_per_million_inr.toLocaleString('en-IN')}/M` : '—'}
          </span>
        )}
      </td>
    </tr>
  )
}

export default function CampaignCpmEditor({ campaigns }: { campaigns: Campaign[] }) {
  if (!campaigns.length) {
    return <p style={{ padding: '40px 28px', textAlign: 'center', color: 'var(--fg-muted)', fontSize: 14 }}>No processed campaigns yet</p>
  }

  return (
    <div className="tbl-wrap">
      <table className="tbl">
        <thead>
          <tr>
            <th>Campaign</th>
            <th>Client</th>
            <th>Budget</th>
            <th>Platform</th>
            <th>Status</th>
            <th>CPM Rate</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map(c => <CampaignRow key={c.id} c={c} />)}
        </tbody>
      </table>
    </div>
  )
}
