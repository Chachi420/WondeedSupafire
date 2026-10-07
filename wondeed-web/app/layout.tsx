import type { Metadata, Viewport } from 'next'
import { Fraunces } from 'next/font/google'
import './globals.css'
import './marketing.css'
import './story.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['opsz', 'SOFT', 'WONK'],
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
  themeColor: '#FAF6EE',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={fraunces.variable}>
      <body>{children}</body>
    </html>
  )
}
