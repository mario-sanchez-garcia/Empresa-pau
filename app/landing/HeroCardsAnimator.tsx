'use client'

import { useEffect } from 'react'

export default function HeroCardsAnimator() {
  useEffect(() => {
    const container = document.querySelector('.lp-hero-visual')
    if (!container) return

    const trigger = () => {
      const cards = [
        document.querySelector<HTMLElement>('.lp-hero-card-1'),
        document.querySelector<HTMLElement>('.lp-hero-card-2'),
        document.querySelector<HTMLElement>('.lp-hero-card-3'),
      ]
      cards.forEach((card, i) => {
        if (!card) return
        setTimeout(() => card.classList.add('lp-hero-card--visible'), i * 190)
      })
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect()
          trigger()
        }
      },
      { threshold: 0.15 },
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  return null
}
