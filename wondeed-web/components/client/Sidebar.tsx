'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import NotificationBell from '@/components/NotificationBell'

const NAV = [
  { href: '/dashboard/client',                  label: 'Dashboard',       exact: true,  icon: 'home' },
  { href: '/dashboard/client/create-campaign',  label: 'Create Campaign', exact: true,  icon: 'plus' },
  { href: '/dashboard/client/campaigns',        label: 'My Campaigns',    exact: false, icon: 'folder' },
  { href: '/dashboard/client/analytics',        label: 'Analytics',       exact: false, icon: 'chart' },
  { href: '/dashboard/client/billing',          label: 'Billing',         exact: false, icon: 'wallet' },
]

function Icon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    home:   <><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1V9.5z"/></>,
    plus:   <><path d="M12 5v14M5 12h14"/></>,
    folder: <><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></>,
    chart:  <><path d="M3 21h18"/><rect x="5" y="11" width="3" height="8"/><rect x="10.5" y="6" width="3" height="13"/><rect x="16" y="14" width="3" height="5"/></>,
    wallet: <><path d="M3 7a2 2 0 012-2h12a2 2 0 012 2v2H5a2 2 0 00-2 2V7z"/><path d="M3 11a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6z"/><circle cx="17" cy="14" r="1.4" fill="currentColor"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/></>,
    logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></>,
  }
  return (
    <svg className="nav-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  )
}

export default function ClientSidebar({ userName, brandName }: {
  userName?: string
  brandName?: string
}) {
  const pathname    = usePathname()
  const router      = useRouter()
  const supabase    = createClient()
  const [open, setOpen] = useState(false)

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = userName
    ? userName.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : 'PN'

  return (
    <>
      <button className="mob-menu-btn" onClick={() => setOpen(true)} aria-label="Open menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 18, height: 18 }}>
          <path d="M3 6h18M3 12h18M3 18h18"/>
        </svg>
      </button>
      {open && <div className="mob-overlay" onClick={() => setOpen(false)} />}
    <aside className={`sidebar${open ? ' sidebar-open' : ''}`}>
      <button className="mob-close-btn" onClick={() => setOpen(false)} aria-label="Close menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 16, height: 16 }}>
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
      <div className="sidebar-brand">
        <div className="brand-mark">W</div>
        <div className="brand-name">
          Wondeed
          <span>For Brands</span>
        </div>
      </div>

      <div className="sidebar-user">
        <div className="avatar avatar-pn">{initials}</div>
        <div className="col">
          <div className="user-name">{userName ?? 'Brand User'}</div>
          <div className="user-meta">{brandName ?? 'Brand Workspace'}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Brand Workspace</div>
        {NAV.map(item => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} className={`nav-item ${active ? 'active' : ''}`} onClick={() => setOpen(false)}>
              <Icon name={item.icon} />
              {item.label}
            </Link>
          )
        })}
        <div className="nav-section-label">Account</div>
        <button className="nav-item" onClick={handleSignOut}>
          <Icon name="logout" />Sign out
        </button>
      </nav>

      <div className="sidebar-foot">
        <div className="row between" style={{ alignItems: 'center' }}>
          <div className="row gap-6">
            <span className="badge-dot" style={{ background: '#22c55e' }} />
            Verified Brand
          </div>
          <NotificationBell />
        </div>
        <div className="mt-4 faint">v2.4.0 · Brands</div>
      </div>
    </aside>
    </>
  )
}
