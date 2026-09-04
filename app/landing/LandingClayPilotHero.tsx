'use client'

import Link from 'next/link'
import { Bebas_Neue, DM_Mono } from 'next/font/google'
import { useLandingAuth } from './LandingAuthState'
import ClayThemeScope from '@/components/clay/ClayThemeScope'
import ClayCard from '@/components/clay/ClayCard'
import ClayBadge from '@/components/clay/ClayBadge'
import ClayProgressBar from '@/components/clay/ClayProgressBar'
import { useClayThemePreference } from '@/components/clay/useClayThemePreference'

const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'] })
const dmMono = DM_Mono({ weight: ['400', '500'], subsets: ['latin'] })
const B = bebas.style.fontFamily
const M = dmMono.style.fontFamily

const CTA_PRESS_OFFSET = 7

// Piloto de claymorfismo, solo para la sección hero de la landing (ver
// components/clay/). Sustituye el CTA circular y las mini-cards de vista
// previa por versiones clay — el fondo fotográfico y el titular del hero
// (app/landing/page.tsx) no se tocan, para mantener la identidad visual
// actual del hero. No sustituye HeroCta/mini-cards originales en el código:
// convive como componente aparte que la landing usa en su lugar mientras
// dura el piloto.
export function ClayHeroCta() {
  const { status, href, label } = useLandingAuth()
  const { theme } = useClayThemePreference()
  const isAuthed = status === 'authed'
  const isLoading = status === 'loading'
  const restShadow = [
    `0 ${CTA_PRESS_OFFSET}px 0 0 var(--clay-accent-deep)`,
    '0 18px 30px var(--clay-shadow-elevate)',
    'inset 0 2px 3px var(--clay-shadow-light)',
  ].join(', ')
  const pressedShadow = ['0 2px 0 0 var(--clay-accent-deep)', 'inset 0 2px 3px var(--clay-shadow-light)'].join(', ')
  return (
    <ClayThemeScope theme={theme} style={{ background: 'transparent', display: 'inline-block' }}>
      <Link
        href={isLoading ? '#' : href}
        aria-disabled={isLoading}
        onClick={e => { if (isLoading) e.preventDefault() }}
        className="v4c-clay-cta-circle"
        style={{
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: 'var(--clay-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textDecoration: 'none',
          flexDirection: 'column',
          gap: 4,
          opacity: isLoading ? 0.6 : 1,
          cursor: isLoading ? 'default' : 'pointer',
          boxShadow: restShadow,
          transform: 'translateY(0)',
          transition: 'transform 90ms ease, box-shadow 90ms ease',
        }}
        onMouseDown={e => {
          e.currentTarget.style.transform = `translateY(${CTA_PRESS_OFFSET - 2}px)`
          e.currentTarget.style.boxShadow = pressedShadow
        }}
        onMouseUp={e => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = restShadow
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = restShadow
        }}
      >
        <span style={{ fontFamily: B, fontSize: 17, letterSpacing: '.06em', color: 'var(--clay-on-accent)', textAlign: 'center', lineHeight: 1.1, fontWeight: isAuthed ? 700 : undefined }}>
          {isAuthed ? label : <>Empieza<br />gratis</>}
        </span>
        {!isAuthed && (
          <span style={{ fontFamily: M, fontSize: 9, color: 'var(--clay-on-accent)', opacity: 0.75, letterSpacing: '.1em', textTransform: 'uppercase' }}>sin tarjeta</span>
        )}
      </Link>
    </ClayThemeScope>
  )
}

export function ClayHeroMiniCards() {
  const { theme } = useClayThemePreference()
  return (
    <ClayThemeScope theme={theme} style={{ background: 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, width: '100%' }}>
      <ClayCard padding={20} radius={22} style={{ width: 220, borderRadius: '22px 22px 4px 4px' }}>
        <ClayBadge tone="neutral">Examen real</ClayBadge>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--clay-text)', margin: '12px 0' }}>
          Matemáticas II · Madrid 2023<br />Bloque análisis · Ejercicio 2
        </p>
        <p style={{ fontSize: 10, color: 'var(--clay-text-muted)', lineHeight: 1.4, margin: 0 }}>
          Calcula la derivada de f(x) = x³·ln(x) y estudia su monotonía…
        </p>
      </ClayCard>
      <ClayCard padding={20} radius={22} style={{ width: 220, borderRadius: '22px 22px 4px 4px' }}>
        <ClayBadge>Corrección IA</ClayBadge>
        <p style={{ fontFamily: M, fontSize: 26, fontWeight: 700, color: 'var(--clay-text)', lineHeight: 1, margin: '12px 0 2px' }}>
          7,8<span style={{ fontSize: 14, opacity: .55 }}>/10</span>
        </p>
        <p style={{ fontFamily: M, fontSize: 9, color: 'var(--clay-text-muted)', margin: '0 0 10px' }}>resultado sintético</p>
        <ClayProgressBar value={0.78} />
        <p style={{ fontSize: 10, color: 'var(--clay-text-muted)', lineHeight: 1.4, margin: '10px 0 0' }}>
          Derivada correcta. Signo monotonía: falta el intervalo (0,1/e). −1,2 pts.
        </p>
      </ClayCard>
    </ClayThemeScope>
  )
}
