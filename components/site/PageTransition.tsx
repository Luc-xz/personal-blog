'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const pageVariants = {
    initial: {
      opacity: prefersReducedMotion ? 1 : 0,
      y: prefersReducedMotion ? 0 : 20
    },
    in: {
      opacity: 1,
      y: 0
    },
    out: {
      opacity: prefersReducedMotion ? 1 : 0,
      y: prefersReducedMotion ? 0 : -20
    }
  }

  const pageTransition = {
    type: 'tween' as const,
    ease: 'anticipate' as const,
    duration: prefersReducedMotion ? 0 : 0.4
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
