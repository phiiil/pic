import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Batterie - Multi-Engine Battery Maker',
  description: 'Compare responses from multiple AI engines',
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

