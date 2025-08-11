'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface PostCardProps {
  post: {
    id: number
    title: string
    slug: string
    summary?: string | null
    publishedAt: Date | null
    categories: Array<{ category: { id: number; name: string } }>
    tags: Array<{ tag: { id: number; name: string } }>
  }
  index: number
}

export function PostCard({ post, index }: PostCardProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: prefersReducedMotion ? 0 : 50,
      scale: prefersReducedMotion ? 1 : 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.6,
        delay: prefersReducedMotion ? 0 : index * 0.1,
        ease: "easeOut" as const
      }
    }
  }

  const hoverVariants = {
    hover: {
      y: prefersReducedMotion ? 0 : -8,
      scale: prefersReducedMotion ? 1 : 1.02,
      transition: {
        duration: 0.3,
        ease: "easeOut" as const
      }
    }
  }

  return (
    <motion.article
      className="group border rounded-xl p-6 bg-white dark:bg-gray-900 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
      variants={cardVariants}
      whileHover={prefersReducedMotion ? {} : "hover"}
      custom={hoverVariants}
      initial="hidden"
      animate="visible"
    >
      <Link href={`/post/${post.slug}`} className="block">
        <motion.h3 
          className="text-xl font-semibold mb-3 group-hover:text-blue-600 transition-colors duration-200"
          layoutId={`title-${post.id}`}
        >
          {post.title}
        </motion.h3>
        
        {post.summary && (
          <motion.p 
            className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2"
            layoutId={`summary-${post.id}`}
          >
            {post.summary}
          </motion.p>
        )}
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            {post.publishedAt && (
              <motion.time 
                dateTime={post.publishedAt.toISOString()}
                className="flex items-center gap-1"
                whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
              >
                📅 {new Date(post.publishedAt).toLocaleDateString('zh-CN')}
              </motion.time>
            )}
            {post.categories.length > 0 && (
              <motion.span 
                className="flex items-center gap-1"
                whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
              >
                📁 {post.categories.map(pc => pc.category.name).join(', ')}
              </motion.span>
            )}
          </div>
          
          {post.tags.length > 0 && (
            <div className="flex gap-1">
              {post.tags.slice(0, 3).map((pt, tagIndex) => (
                <motion.span
                  key={pt.tag.id}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  whileHover={{ 
                    scale: prefersReducedMotion ? 1 : 1.1,
                    transition: { delay: tagIndex * 0.05 }
                  }}
                >
                  {pt.tag.name}
                </motion.span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.article>
  )
}
