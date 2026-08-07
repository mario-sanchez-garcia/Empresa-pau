'use client'

import SidebarNav from '@/app/components/SidebarNav'
import XpExplainerDrawer from '@/components/ayuda/XpExplainerDrawer'

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

const FAQS = [
  {
    q: '¿Cómo funciona el XP?',
    a: 'Ganas XP cada vez que corriges un ejercicio con Kairo, en cualquier sección — la saques la nota que saques. La base depende de cuánto dura de verdad la actividad (una misión de Camino da menos que una práctica parcial, y esa menos que un simulacro completo de 90 minutos) y de la dificultad del bloque. Sobre esa base se aplican dos bonus que se multiplican entre sí: la nota que sacas (+25% aprobando, +75% con un 7 o más, +125% con un 9 o más) y tu racha de días seguidos estudiando (hasta +50% a partir de dos meses seguidos sin cortar). Si repites algo que ya habías hecho, la base se reduce a la mitad en cada repetición sucesiva — pero si mejoras tu nota respecto a tu último intento, te llevas un bonus extra encima, tanto mayor cuanto más grande sea la mejora y cuanto más cerca del 10 termines. El XP total nunca baja. Puedes ver el desglose visual completo en "¿Cómo funciona el XP?" (arriba a la derecha).',
  },
  {
    q: '¿Qué es la racha?',
    a: 'La racha cuenta los días consecutivos en los que has completado al menos una misión. Si un día no estudias, la racha vuelve a cero. Además de ser una forma de ver tu constancia, una racha larga también da más XP en cada corrección: hasta un +50% extra a partir de dos meses seguidos estudiando (la subida es rápida los primeros días y se suaviza después, nunca se dispara).',
  },
  {
    q: '¿Qué pasa si un día no estudio?',
    a: 'Nada grave. La racha se rompe, pero tu XP y tu progreso se quedan donde estaban. Kairo retoma el plan desde donde lo dejaste. Una racha rota no significa empezar de cero — significa continuar.',
  },
  {
    q: '¿Qué son las divisiones?',
    a: 'Las divisiones (Bronce, Plata, Oro, etc.) son niveles globales basados en tu XP total. Subes de división acumulando XP. No se puede bajar de división una vez alcanzada.',
  },
  {
    q: '¿Cómo funcionan las ligas?',
    a: 'Las ligas son grupos de hasta diez alumnos que compiten entre sí por XP cada semana. Puedes unirte a una liga existente con el código de un amigo o crear la tuya. El ranking de Mi Liga muestra el XP total; el toggle "Esta semana" muestra solo el XP de la semana actual.',
  },
]

export default function AyudaPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f7fb' }}>
      <style>{`
        @media (max-width: 767px) {
          .ayuda-content { padding: 24px 20px 60px !important; }
          .ayuda-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <SidebarNav />

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={{ padding: '36px 36px 0', maxWidth: 780 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 8 }}>
                Ayuda
              </p>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 8 }}>
                Cómo funciona Kairo
              </h1>
            </div>
            <XpExplainerDrawer />
          </div>
          <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>
            Todo lo que necesitas saber para sacarle partido a la app.
          </p>
        </div>

        <div className="ayuda-content" style={{ padding: '32px 36px 80px', maxWidth: 780 }}>

          {/* Sections */}
          <h2 style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 16 }}>
            Las secciones
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginBottom: 48 }}>
            {SECTIONS.map((s) => (
              <div
                key={s.title}
                style={{
                  padding: '18px 20px',
                  background: 'white',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                }}
              >
                <p style={{ fontSize: 14, fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>
                  {s.title}
                </p>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.65 }}>
                  {s.body}
                </p>
              </div>
            ))}
          </div>

          {/* FAQs */}
          <h2 style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 16 }}>
            Preguntas frecuentes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {FAQS.map((faq) => (
              <div
                key={faq.q}
                style={{
                  padding: '18px 20px',
                  background: 'white',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                }}
              >
                <p style={{ fontSize: 14, fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>
                  {faq.q}
                </p>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.65 }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
