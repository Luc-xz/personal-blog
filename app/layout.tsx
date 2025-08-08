import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '个人博客',
  description: '基于 Next.js + SQLite + Prisma + Tailwind 的个人博客',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}

