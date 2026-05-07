'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import NotificationBell from '@/components/NotificationBell'

const NAV = [
  { href: '/dashboard/clipper',              label: 'Home',           exact: true,  icon: 'home' },
  { href: '/dashboard/clipper/feed',         label: 'Campaign Feed',  exact: false, icon: 'grid',   isFeed: true },
  { href: '/dashboard/clipper/submit',       label: 'Submit a Clip',  exact: false, icon: 'upload' },
  { href: '/dashboard/clipper/my-campaigns', label: 'My Campaigns',   exact: false, icon: 'folder' },
  { href: '/dashboard/clipper/earnings',     label: 'Earnings',       exact: false, icon: 'wallet' },
  { href: '/dashboard/clipper/analytics',    label: 'Analytics',      exact: false, icon: 'chart' },
]

function Icon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    home:   <><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1V9.5z"/></>,
    grid:   <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    upload: <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></>,
    folder: <><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></>,
    wallet: <><path d="M3 7a2 2 0 012-2h12a2 2 0 012 2v2H5a2 2 0 00-2 2V7z"/><path d="M3 11a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6z"/><circle cx="17" cy="14" r="1.4" fill="currentColor"/></>,
    chart:  <><path d="M3 21h18"/><rect x="5" y="11" width="3" height="8"/><rect x="10.5" y="6" width="3" height="13"/><rect x="16" y="14" width="3" height="5"/></>,
    user:   <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/></>,
    logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></>,
  }
  return (
    <svg className="nav-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  )
}

export default function ClipperSidebar({ userName, userHandle, userTier, feedBadge }: {
  userName?: string
  userHandle?: string
  userTier?: string
  feedBadge?: number
}) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = userName
    ? userName.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : 'CL'

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">W</div>
        <div className="brand-name">
          Wondeed
          <span>Clipper</span>
        </div>
      </div>

      <div className="sidebar-user">
        <div className="avatar avatar-rs">{initials}</div>
        <div className="col">
          <div className="user-name">{userName ?? 'Clipper'}</div>
          <div
            className="user-meta"
            title={
              userTier === 'pro' ? 'Tier 1 – Pro: Access to all standard campaigns' :
              userTier === 'premium' ? 'Tier 2 – Premium: Access to higher CPM premium campaigns' :
              userTier === 'enterprise' ? 'Tier 3 – Enterprise: Access to exclusive top-tier campaigns' :
              'Your clipper tier determines which campaigns you can join'
            }
            style={{ cursor: 'help' }}
          >
            {userTier ?? 'Free'} · {userHandle ?? ''}
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Workspace</div>
        {NAV.map(item => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          const badge = (item as any).isFeed && feedBadge != null && feedBadge > 0 ? feedBadge : null
          return (
            <Link key={item.href} href={item.href} className={`nav-item ${active ? 'active' : ''}`}>
              <Icon name={item.icon} />
              {item.label}
              {badge != null && <span className="nav-badge">{badge}</span>}
            </Link>
          )
        })}
        <div className="nav-section-label">Account</div>
        <Link href="/dashboard/clipper/profile" className="nav-item">
          <Icon name="user" />Profile &amp; Settings
        </Link>
        <button className="nav-item" onClick={handleSignOut}>
          <Icon name="logout" />Sign out
        </button>
      </nav>

      <div className="sidebar-foot">
        <div className="row between" style={{ alignItems: 'center' }}>
          <div className="row gap-6">
            <span className="badge-dot" style={{ background: '#22c55e' }} />
            All systems normal
          </div>
          <NotificationBell />
        </div>
        <div className="mt-4 faint">v2.4.0 · Clipper</div>
      </div>
    </aside>
  )
}
