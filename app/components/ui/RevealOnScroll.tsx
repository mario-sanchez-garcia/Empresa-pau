'use client'

import { useEffect, useRef, useState } from 'react'

type RevealOnScrollProps = {
  children: React.ReactNode
  className?: string
  delayMs?: number
  y?: number
  as?: 'div' | 'section'
}

// Reduced-motion users and very old browsers (no IntersectionObserver) get
// content shown immediately, never gated behind a scroll trigger.
export default function RevealOnScroll({
  children,
  className,
  delayMs = 0,
  y = 24,
  as = 'div',
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      const raf = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(raf)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const Comp = as
  return (
    <Comp
      ref={ref as never}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : `translateY(${y}px)`,
        transition: `opacity 0.7s ease ${delayMs}ms, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delayMs}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </Comp>
  )
}
