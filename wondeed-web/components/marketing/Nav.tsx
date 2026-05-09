'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Icon from './Icon'

const LINKS = [
  { href: '/brands',   label: 'For Brands' },
  { href: '/clippers', label: 'For Clippers' },
  { href: '/pricing',  label: 'Pricing' },
  { href: '/trust',    label: 'Trust' },
  { href: '/faq',      label: 'FAQ' },
]

const DARK_PATHS = ['/brands', '/trust', '/faq']

export default function Nav() {
  const router   = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const dark      = DARK_PATHS.includes(pathname)
  const isClipper = pathname === '/clippers'
  const ctaLabel  = isClipper ? 'Sign up to clip & earn' : 'Start a Campaign'

  return (
    <header className={`nav ${dark ? 'on-dark' : ''}`}>
      <div className="container">
        <div className="nav-row">
          <button className="brand" onClick={() => router.push('/')} aria-label="Wondeed home">
            <span className="brand-mark">W</span>
            <span>Wondeed</span>
          </button>

          <nav className="nav-links" aria-label="Main">
            {LINKS.map(l => (
              <button
                key={l.href}
                className={`nav-link ${pathname === l.href ? 'active' : ''}`}
                onClick={() => router.push(l.href)}
              >
                {l.label}
              </button>
            ))}
          </nav>

          <div className="nav-cta">
            <button className="nav-text" onClick={() => router.push('/login')}>Login</button>
            <button className="btn btn-primary btn-sm" onClick={() => router.push('/login')}>
              {ctaLabel}
              <Icon name="arrow-right" />
            </button>
            <button
              className="nav-burger"
              onClick={() => setOpen(o => !o)}
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              <Icon name={open ? 'x' : 'menu'} />
            </button>
          </div>
        </div>
      </div>

      <div className={`mobile-menu ${open ? 'open' : ''}`}>
        <div className="container" style={{ padding: 0 }}>
          {LINKS.map(l => (
            <button
              key={l.href}
              className={`nav-link ${pathname === l.href ? 'active' : ''}`}
              onClick={() => { router.push(l.href); setOpen(false) }}
            >
              {l.label}
            </button>
          ))}
          <div className="mobile-menu-cta">
            <button className="btn btn-ghost btn-block" onClick={() => { router.push('/login'); setOpen(false) }}>Login</button>
            <button className="btn btn-primary btn-block" onClick={() => { router.push('/login'); setOpen(false) }}>
              {ctaLabel} <Icon name="arrow-right" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
