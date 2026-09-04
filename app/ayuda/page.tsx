'use client'

import { useState } from 'react'
import SidebarNav from '@/app/components/SidebarNav'
import XpExplainerDrawer from '@/components/ayuda/XpExplainerDrawer'
import { AYUDA_FAQS, type AyudaFaq } from '@/app/lib/ayudaFaqs'
import ClayThemeScope from '@/components/clay/ClayThemeScope'
import ClayCard from '@/components/clay/ClayCard'
import ClayBadge from '@/components/clay/ClayBadge'
import { useClayThemePreference } from '@/components/clay/useClayThemePreference'

const SECTIONS = [
  {
    title: 'Camino',
    body: 'Tu plan de estudio diario generado por Kairo. Cada día aparece una misión principal — un tema o ejercicio elegido según lo que más necesitas trabajar. Empieza siempre por aquí antes de entrar en cualquier otra sección.',
  },
  {
    title: 'Simulacros',
    body: 'Exámenes cronometrados con ejercicios reales de la PAU, exactamente como el día del examen. Elige asignatura, tiempo y dificultad, responde todo y Kairo te da la nota y el feedback al terminar. Úsalo cuando quieras entrenar bajo presión.',
  },
  {
    title: 'Exámenes',
    body: 'Práctica ejercicio a ejercicio sin reloj. Elige asignatura, bloque y nivel, responde y Kairo lo corrige en el momento con la puntuación oficial. Para trabajar una parte concreta del temario en profundidad.',
  },
  {
    title: 'La Zona',
    body: 'Repaso con flashcards de los conceptos y errores que más se te resisten. Las tarjetas se generan a partir de tu historial y Kairo las ajusta según tus resultados. Para pasar de saber la teoría a recordarla de verdad.',
  },
  {
    title: 'Tutor',
    body: 'Chat directo con Kairo. Funciona como un profesor: explica conceptos, resuelve dudas concretas y da ejemplos. Para cuando estás atascado y necesitas entender el porqué, no solo la respuesta.',
  },
  {
    title: 'Historial',
    body: 'Registro de todo lo que has practicado con tus notas, ordenado por fecha. Sirve para ver en qué asignaturas estás mejorando y cuáles todavía necesitan más trabajo.',
  },
]

// Preguntas frecuentes: ver app/lib/ayudaFaqs.ts (fuente compartida con
// page-client.tsx, para que "Pregúntale esto a Kairo" le pase a Kairo el
// texto exacto por id en vez de duplicarlo en la URL).
const FAQS = AYUDA_FAQS

function askKairoHref(faq?: AyudaFaq): string {
  const params = new URLSearchParams({ view: 'chat', from: 'ayuda_faq' })
  if (faq) params.set('faqId', faq.id)
  return `/examenes?${params.toString()}`
}

export default function AyudaPage() {
  const [xpDrawerOpen, setXpDrawerOpen] = useState(false)
  const { theme } = useClayThemePreference()

  return (
    <ClayThemeScope theme={theme} style={{ display: 'flex', minHeight: '100vh' }}>
      <style>{`
        @media (max-width: 767px) {
          .ayuda-content { padding: 24px 20px 60px !important; }
          .ayuda-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <SidebarNav />
      <XpExplainerDrawer open={xpDrawerOpen} onClose={() => setXpDrawerOpen(false)} />

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={{ padding: '36px 36px 0', maxWidth: 780 }}>
          <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--clay-text-muted)', marginBottom: 8 }}>
            Ayuda
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--clay-text)', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 8 }}>
            Cómo funciona Kairo
          </h1>
          <p style={{ fontSize: 14, color: 'var(--clay-text-muted)', lineHeight: 1.6 }}>
            Todo lo que necesitas saber para sacarle partido a la app.
          </p>
        </div>

        <div className="ayuda-content" style={{ padding: '32px 36px 80px', maxWidth: 780 }}>

          {/* Sections */}
          <h2 style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--clay-text-muted)', marginBottom: 16 }}>
            Las secciones
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 48 }}>
            {SECTIONS.map((s) => (
              <ClayCard key={s.title} radius={14} padding={20}>
                <p style={{ fontSize: 14, fontWeight: 900, color: 'var(--clay-text)', marginBottom: 6 }}>
                  {s.title}
                </p>
                <p style={{ fontSize: 13, color: 'var(--clay-text-muted)', lineHeight: 1.65 }}>
                  {s.body}
                </p>
              </ClayCard>
            ))}
          </div>

          {/* FAQs */}
          <h2 style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--clay-text-muted)', marginBottom: 16 }}>
            Preguntas frecuentes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {FAQS.map((faq) => (
              <ClayCard key={faq.id} radius={14} padding={20}>
                <p style={{ fontSize: 14, fontWeight: 900, color: 'var(--clay-text)', marginBottom: 6 }}>
                  {faq.q}
                </p>
                <p style={{ fontSize: 13, color: 'var(--clay-text-muted)', lineHeight: 1.65, marginBottom: 10 }}>
                  {faq.a}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {faq.id === 'xp' && (
                    <button
                      type="button"
                      onClick={() => setXpDrawerOpen(true)}
                      style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}
                    >
                      <ClayBadge>📊 Ver cómo se calcula</ClayBadge>
                    </button>
                  )}
                  <a href={askKairoHref(faq)} style={{ textDecoration: 'none' }}>
                    <ClayBadge tone="neutral">💬 Pregúntale esto a Kairo</ClayBadge>
                  </a>
                </div>
              </ClayCard>
            ))}
          </div>

          <ClayCard radius={14} padding={20} style={{ marginTop: 24, textAlign: 'center' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--clay-text)', marginBottom: 12 }}>
              ¿Sigues con dudas?
            </p>
            <a href={askKairoHref()} style={{ textDecoration: 'none' }}>
              <ClayBadge>💬 Pregunta a Kairo</ClayBadge>
            </a>
            <p style={{ fontSize: 12, color: 'var(--clay-text-muted)', marginTop: 14 }}>
              ¿Nada de esto lo resuelve?{' '}
              <a href="/contacto" style={{ color: 'var(--clay-accent-text)', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 2 }}>
                Escríbenos directamente
              </a>
            </p>
          </ClayCard>
        </div>
      </div>
    </ClayThemeScope>
  )
}
