import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' as any },
    orderBy: { publishedAt: 'desc' },
    take: 20,
    include: {
      categories: { include: { category: true } },
      tags: { include: { tag: true } }
    }
  })

  const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
  const buildDate = new Date().toISOString()

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>个人博客</title>
    <description>基于 Next.js + SQLite + Prisma + Tailwind 的个人博客</description>
    <link>${baseUrl}</link>
    <language>zh-CN</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${posts.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.summary || ''}]]></description>
      <content:encoded><![CDATA[${post.contentHtml}]]></content:encoded>
      <link>${baseUrl}/post/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/post/${post.slug}</guid>
      <pubDate>${post.publishedAt ? new Date(post.publishedAt).toUTCString() : buildDate}</pubDate>
      ${post.categories.map(pc => `<category>${pc.category.name}</category>`).join('')}
    </item>`).join('')}
  </channel>
</rss>`

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  })
}
