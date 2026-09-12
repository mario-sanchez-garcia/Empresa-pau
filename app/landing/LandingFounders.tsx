'use client'

import { DM_Mono } from 'next/font/google'
import ClayThemeScope from '@/components/clay/ClayThemeScope'
import ClayCard from '@/components/clay/ClayCard'
import { useClayThemePreference } from '@/components/clay/useClayThemePreference'

const dmMono = DM_Mono({ weight: ['400', '500'], subsets: ['latin'] })
const M = dmMono.style.fontFamily

// Datos reales de los 4 fundadores, todos exalumnos de 2º de Bachillerato —
// no se añade nada que no venga dado (sin apellidos completos, edades ni
// redes sociales). Sin fotos todavía: el círculo con iniciales es el
// placeholder hasta que se suban.
const FOUNDERS = [
  { name: 'Mario Sánchez', study: 'Business Analytics and BBA en IE University' },
  { name: 'Marco Martínez', study: 'Economía en la UC3M' },
  { name: 'Alejandro Amigo', study: 'ADE e Ingeniería Informática en la URJC' },
  { name: 'Diego García', study: 'Ingeniería Industrial e Ingeniería Física en la UC3M' },
]

function initials(name: string): string {
  return name.split(' ').map(part => part[0]).join('').toUpperCase()
}

// Sección "Quiénes somos" — usa el mismo piloto de claymorfismo que el hero
// de esta landing (ver LandingClayPilotHero.tsx): ClayThemeScope +
// useClayThemePreference, para que sección heredé el tema clay elegido en
// /ajustes en vez de tener su propio interruptor. El resto de la landing
// (bloques v4c-*) no se toca.
export default function LandingFounders({ headingFont }: { headingFont: string }) {
  const { theme } = useClayThemePreference()
  return (
    <ClayThemeScope theme={theme}>
      <section className="v4c-full">
        <div className="v4c-full-inner">
          <span style={{ fontFamily: M, fontSize: 10, color: 'var(--clay-text-muted)', letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 16, display: 'block' }}>
            Quiénes somos
          </span>
          <h2 style={{ fontFamily: headingFont, fontSize: 'clamp(36px, 4vw, 52px)', letterSpacing: '.01em', color: 'var(--clay-text)', lineHeight: .95, marginBottom: 16 }}>
            Cuatro exalumnos de 2º de Bachillerato.
          </h2>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--clay-text-muted)', maxWidth: '60ch', marginBottom: 40 }}>
            Los cuatro fundadores de Kairo pasamos por 2º de Bachillerato hace poco. Hoy estudiamos esto:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {FOUNDERS.map((f) => (
              <ClayCard key={f.name} padding={24} radius={22}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'var(--clay-accent)', color: 'var(--clay-on-accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 800, marginBottom: 16,
                  boxShadow: '0 4px 0 0 var(--clay-accent-deep)',
                }}>
                  {initials(f.name)}
                </div>
                <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--clay-text)', margin: '0 0 6px' }}>{f.name}</p>
                <p style={{ fontSize: 12, color: 'var(--clay-text-muted)', lineHeight: 1.5, margin: 0 }}>{f.study}</p>
              </ClayCard>
            ))}
          </div>
        </div>
      </section>
    </ClayThemeScope>
  )
}
