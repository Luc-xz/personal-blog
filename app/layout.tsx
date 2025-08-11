import './globals.css'
import type { Metadata } from 'next'

const baseUrl = process.env.BASE_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  title: {
    default: '个人博客',
    template: '%s | 个人博客'
  },
  description: '基于 Next.js + SQLite + Prisma + Tailwind 的个人博客',
  keywords: ['博客', 'Next.js', 'SQLite', 'Prisma', 'Tailwind'],
  authors: [{ name: '博主' }],
  creator: '博主',
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': [{ url: '/feed.xml', title: 'RSS Feed' }]
    }
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: baseUrl,
    title: '个人博客',
    description: '基于 Next.js + SQLite + Prisma + Tailwind 的个人博客',
    siteName: '个人博客'
  },
  twitter: {
    card: 'summary_large_image',
    title: '个人博客',
    description: '基于 Next.js + SQLite + Prisma + Tailwind 的个人博客'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          {children}
        </div>
      </body>
    </html>
  )
}

