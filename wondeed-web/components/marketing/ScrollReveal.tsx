'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const TARGETS = [
  '.section-head',
  '.why-card',
  '.step',
  '.stat-cell',
  '.side-panel',
  '.cmp-card',
  '.mkt-wrap .card',
].join(', ')

/**
 * Adds reveal-on-scroll animations to marketing sections.
 * Both classes are applied from JS, so content stays visible without JS.
 */
export default function ScrollReveal() {
  const pathname = usePathname()

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const els = Array.from(document.querySelectorAll<HTMLElement>(TARGETS))
    if (els.length === 0) return

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-in')
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )

    for (const el of els) {
      // Skip elements already in the viewport on load — no point animating those
      const rect = el.getBoundingClientRect()
      if (rect.top < window.innerHeight * 0.9) continue
      el.classList.add('reveal-init')
      observer.observe(el)
    }

    return () => observer.disconnect()
  }, [pathname])

  return null
}
