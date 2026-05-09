'use client'

interface IconProps {
  name: string
  width?: number | string
  height?: number | string
  style?: React.CSSProperties
  className?: string
  strokeWidth?: number
}

export default function Icon({ name, width = 16, height = 16, style, className, strokeWidth = 1.8 }: IconProps) {
  const s = {
    width,
    height,
    viewBox: '0 0 24 24' as const,
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    style,
    className,
  }
  switch (name) {
    case 'arrow-right': return <svg {...s}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
    case 'arrow-up-right': return <svg {...s}><path d="M7 17 17 7M8 7h9v9" /></svg>
    case 'check': return <svg {...s}><path d="M5 12l5 5L20 7" /></svg>
    case 'plus': return <svg {...s}><path d="M12 5v14M5 12h14" /></svg>
    case 'x': return <svg {...s}><path d="M18 6 6 18M6 6l12 12" /></svg>
    case 'menu': return <svg {...s}><path d="M4 6h16M4 12h16M4 18h16" /></svg>
    case 'play': return <svg {...s} fill="currentColor" stroke="none"><path d="M8 5v14l11-7z" /></svg>
    case 'shield': return <svg {...s}><path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3z" /></svg>
    case 'shield-check': return <svg {...s}><path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3z" /><path d="m9 12 2 2 4-4" /></svg>
    case 'eye': return <svg {...s}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
    case 'rupee': return <svg {...s}><path d="M6 4h12M6 8h12M9 4c4 0 6 1.5 6 4s-2 4-6 4H7l8 8" /></svg>
    case 'phone': return <svg {...s}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
    case 'zap': return <svg {...s}><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" /></svg>
    case 'target': return <svg {...s}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" fill="currentColor" /></svg>
    case 'lock': return <svg {...s}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
    case 'sparkles': return <svg {...s}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" /></svg>
    case 'trending': return <svg {...s}><path d="m22 7-9 9-4-4-7 7" /><path d="M16 7h6v6" /></svg>
    case 'users': return <svg {...s}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    case 'wallet': return <svg {...s}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16v-5" /><circle cx="17" cy="14" r="1.5" fill="currentColor" stroke="none" /></svg>
    case 'play-circle': return <svg {...s}><circle cx="12" cy="12" r="9" /><path d="m10 8 6 4-6 4z" fill="currentColor" stroke="currentColor" /></svg>
    case 'megaphone': return <svg {...s}><path d="M3 11v2l11 5V6L3 11zM14 6l5-2v16l-5-2" /></svg>
    case 'badge-check': return <svg {...s}><path d="m12 2 2.4 1.8 3-.4 1.4 2.7 2.7 1.4-.4 3L23 13l-1.9 2.5.4 3-2.7 1.4-1.4 2.7-3-.4L12 24l-2.4-1.8-3 .4-1.4-2.7-2.7-1.4.4-3L1 13l1.9-2.5-.4-3 2.7-1.4 1.4-2.7 3 .4z" transform="scale(.85) translate(2,1)" /><path d="m9 12 2 2 4-4" /></svg>
    case 'instagram': return <svg {...s}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" /></svg>
    case 'youtube': return <svg {...s}><rect x="2" y="5" width="20" height="14" rx="3" /><path d="m10 9 5 3-5 3z" fill="currentColor" stroke="currentColor" /></svg>
    case 'twitter': return <svg {...s}><path d="m4 4 7.5 9.5L4 20h2l6.5-6 5 6h4l-7.8-9.8L20 4h-2l-5.6 5.2L8 4z" fill="currentColor" stroke="none" /></svg>
    case 'linkedin': return <svg {...s}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 11v6M8 8v.01M12 17v-3a2 2 0 0 1 4 0v3M12 11v6" /></svg>
    case 'minus': return <svg {...s}><path d="M5 12h14" /></svg>
    case 'flag': return <svg {...s}><path d="M4 22V4M4 4l8 2 8-2v10l-8 2-8-2" /></svg>
    case 'search': return <svg {...s}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
    case 'clipboard': return <svg {...s}><rect x="6" y="4" width="12" height="18" rx="2" /><path d="M9 4V2h6v2M9 12h6M9 16h4" /></svg>
    case 'spark': return <svg {...s}><path d="M12 3v4M12 17v4M5 12H1M23 12h-4" /></svg>
    default: return null
  }
}
