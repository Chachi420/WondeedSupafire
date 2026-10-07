'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type Notif = {
  id: string
  type: 'clip_approved' | 'clip_rejected' | 'payout_settled' | 'campaign_joined' | 'low_budget' | 'new_campaign'
  title: string
  body: string
  read: boolean
  created_at: string
}

function typeIcon(type: Notif['type']) {
  switch (type) {
    case 'clip_approved':   return { bg: 'rgba(16,185,129,0.12)', color: 'var(--success)', path: 'M5 13l4 4L19 7' }
    case 'clip_rejected':   return { bg: 'rgba(239,68,68,0.12)',  color: 'var(--danger)',  path: 'M6 18L18 6M6 6l12 12' }
    case 'payout_settled':  return { bg: 'rgba(240,78,35,0.12)', color: 'var(--primary)', path: 'M3 7a2 2 0 012-2h12a2 2 0 012 2v2H5a2 2 0 00-2 2V7zM3 11a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6z' }
    case 'low_budget':      return { bg: 'rgba(245,158,11,0.12)', color: '#d97706',        path: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' }
    default:                return { bg: 'rgba(99,102,241,0.12)', color: '#818cf8',         path: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' }
  }
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default function NotificationBell() {
  const [open, setOpen]       = useState(false)
  const [notifs, setNotifs]   = useState<Notif[]>([])
  const [loading, setLoading] = useState(false)
  const ref                   = useRef<HTMLDivElement>(null)
  const supabase              = createClient()

  const unread = notifs.filter(n => !n.read).length

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function loadNotifs() {
    if (loading) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    const { data } = await (supabase as any)
      .from('notifications')
      .select('id, type, title, body, read, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
    setNotifs((data as Notif[]) ?? [])
    setLoading(false)
  }

  async function markAllRead() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await (supabase as any).from('notifications').update({ read: true }).eq('user_id', user.id)
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }

  function toggle() {
    const next = !open
    setOpen(next)
    if (next) loadNotifs()
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={toggle}
        style={{
          position: 'relative',
          width: 32, height: 32,
          borderRadius: 8,
          background: open ? 'rgba(255,255,255,0.08)' : 'none',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--sidebar-fg)',
        }}
        aria-label="Notifications"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 3, right: 3,
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--danger)', border: '1.5px solid var(--sidebar)',
          }} />
        )}
      </button>

      {open && (
        <div style={{
          position: 'fixed', bottom: 80, right: 12,
          width: 'min(320px, calc(100vw - 24px))',
          background: 'var(--surface)',
          border: '1px solid var(--border)', borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          zIndex: 300, overflow: 'hidden',
        }}>
          <div className="row between" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <span className="med" style={{ fontSize: 13 }}>Notifications</span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: 11, fontWeight: 500 }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {loading && (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--fg-muted)', fontSize: 12 }}>Loading…</div>
            )}
            {!loading && notifs.length === 0 && (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 32, height: 32, color: 'var(--fg-muted)', margin: '0 auto 10px', display: 'block' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="text-xs faint">No notifications yet</p>
              </div>
            )}
            {!loading && notifs.map(n => {
              const ic = typeIcon(n.type)
              return (
                <div
                  key={n.id}
                  className="row gap-12"
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border)',
                    background: n.read ? 'transparent' : 'rgba(240,78,35,0.04)',
                    alignItems: 'flex-start',
                  }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: ic.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke={ic.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
                      <path d={ic.path} />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="med" style={{ fontSize: 12, marginBottom: 2 }}>{n.title}</div>
                    <div className="faint" style={{ fontSize: 11, lineHeight: 1.5 }}>{n.body}</div>
                    <div className="faint" style={{ fontSize: 10, marginTop: 4 }}>{timeAgo(n.created_at)}</div>
                  </div>
                  {!n.read && (
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: 6 }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
