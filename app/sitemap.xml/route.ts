import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' as any },
    orderBy: { publishedAt: 'desc' },
    select: { slug: true, updatedAt: true, publishedAt: true }
  })

  const categories = await prisma.category.findMany({
    select: { slug: true }
  })

  const tags = await prisma.tag.findMany({
    select: { slug: true }
  })

  const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
  const now = new Date().toISOString()

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/archive</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  ${posts.map(post => `
  <url>
    <loc>${baseUrl}/post/${post.slug}</loc>
    <lastmod>${post.updatedAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>`).join('')}
  ${categories.map(cat => `
  <url>
    <loc>${baseUrl}/categories/${cat.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
  ${tags.map(tag => `
  <url>
    <loc>${baseUrl}/tags/${tag.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
</urlset>`

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  })
}
