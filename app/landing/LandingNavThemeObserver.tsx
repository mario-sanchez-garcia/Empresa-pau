'use client'

import { useEffect } from 'react'

export default function LandingNavThemeObserver() {
  useEffect(() => {
    const nav = document.getElementById('v4c-nav')
    if (!nav) return
    const check = () => {
      const onLight = [...document.querySelectorAll<HTMLElement>('[data-theme="light"]')]
        .some(element => {
          const rect = element.getBoundingClientRect()
          return rect.top < 54 && rect.bottom > 0
        })
      nav.classList.toggle('v4c-on-light', onLight)
    }
    window.addEventListener('scroll', check, { passive: true })
    check()
    return () => window.removeEventListener('scroll', check)
  }, [])
  return null
}
