import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Wondeed',
  description: 'Performance clipping marketplace',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
