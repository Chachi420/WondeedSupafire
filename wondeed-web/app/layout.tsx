import type { Metadata, Viewport } from 'next'
import { Manrope } from 'next/font/google'
import './globals.css'
import './marketing.css'
import './immersive.css'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://wondeed.com'),
  title: {
    default: 'Wondeed — Pay only for views. India\'s performance clipping marketplace.',
    template: '%s · Wondeed',
  },
  description:
    'Wondeed is India\'s first performance-based clipping marketplace. Brands fund video campaigns, clippers turn them into Reels and Shorts, and you only pay for verified views.',
  keywords: [
    'clipping marketplace', 'performance marketing', 'Instagram Reels', 'YouTube Shorts',
    'verified views', 'creator economy India', 'video clipping', 'CPM campaigns',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://wondeed.com',
    siteName: 'Wondeed',
    title: 'Wondeed — Pay only for views.',
    description:
      'Brands fund campaigns. Clippers earn per verified view. 100% of campaign budgets reach clippers.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wondeed — Pay only for views.',
    description:
      'India\'s first performance-based clipping marketplace. Verified views via Instagram & YouTube APIs.',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#0A0E27',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={manrope.variable}>
      <body>{children}</body>
    </html>
  )
}
