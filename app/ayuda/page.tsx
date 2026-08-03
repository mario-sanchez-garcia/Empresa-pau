'use client'

import SidebarNav from '@/app/components/SidebarNav'

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
    a: 'Ganas una base de XP garantizada cada vez que corriges un ejercicio con Kairo, en cualquier sección — la saques la nota que saques: entre 10 y 50 XP en una misión de Camino, 20 en un examen de Exámenes, 30 en una práctica parcial y 50 en un simulacro completo. Si además sacas un 7 o más, sumas un 50% extra de bonus; con un 9 o más, el bonus es del 100%. La base nunca se reduce por una nota baja — el bonus solo suma. El XP total sube siempre — nunca baja.',
  },
  {
    q: '¿Qué es la racha?',
    a: 'La racha cuenta los días consecutivos en los que has completado al menos una misión. Si un día no estudias, la racha vuelve a cero. No afecta al XP ni a tu progreso real — es solo una forma de ver tu constancia.',
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
          <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 8 }}>
            Ayuda
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 8 }}>
            Cómo funciona Kairo
          </h1>
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
