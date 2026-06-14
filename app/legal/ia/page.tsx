import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Uso de Inteligencia Artificial · Pausia',
  description: 'Cómo usa Pausia la inteligencia artificial en correcciones y simulacros.',
}

export default function IaPage() {
  return (
    <main className="pau-bg-atmosphere" style={page}>
      <div style={container}>
        <Link href="/contacto" style={backLink}>← Volver</Link>

        <h1 style={h1}>Uso de Inteligencia Artificial</h1>
        <p style={meta}>Última actualización: junio 2026 · Versión beta privada</p>

        <Section title="1. Qué hace la IA en Pausia">
          <p style={p}>
            Pausia usa modelos de inteligencia artificial para generar correcciones de respuestas abiertas, feedback de simulacros y orientación sobre errores de estudio.
          </p>
        </Section>

        <Section title="2. Las correcciones son orientativas">
          <p style={p}>
            Las correcciones generadas por IA son <strong>orientativas</strong>. Pueden contener errores, omitir matices importantes o no reflejar exactamente los criterios de corrección oficiales de tu comunidad autónoma o de la asignatura concreta.
          </p>
          <p style={p}>
            <strong>Las correcciones IA no son una calificación oficial</strong> ni un indicador definitivo de tu nivel. Úsalas para identificar áreas de mejora, no como verdad absoluta.
          </p>
        </Section>

        <Section title="3. Qué hacer si la corrección parece incorrecta">
          <ul style={ul}>
            <li style={li}>Contrasta con tu libro de texto, apuntes o profesor.</li>
            <li style={li}>Revisa los criterios oficiales de corrección publicados por tu comunidad autónoma.</li>
            <li style={li}>Si detectas un error claro, puedes reportarlo en <a href="mailto:hola@pausia.es" style={aStyle}>hola@pausia.es</a>.</li>
          </ul>
        </Section>

        <Section title="4. Datos que procesa la IA">
          <p style={p}>
            El texto de tus respuestas se envía a modelos de IA para generar feedback. <strong>No incluyas datos personales innecesarios</strong> (nombre completo, DNI, datos médicos, información de terceros) en tus respuestas.
          </p>
          <p style={p}>
            Consulta nuestra <Link href="/legal/privacidad" style={aStyle}>política de privacidad</Link> para más información sobre cómo usamos y almacenamos los datos.
          </p>
        </Section>

        <Section title="5. Límites de uso razonable">
          <p style={p}>
            Para proteger la calidad del servicio y los costes operativos, puede haber límites en el número de correcciones o simulacros disponibles según el plan. Pausia muestra un aviso cuando se alcanzan estos límites. Si tienes el Pack Curso PAU activo, los límites están ampliados para un uso normal de estudio diario.
          </p>
        </Section>

        <Section title="6. Mejora continua">
          <p style={p}>
            Durante la beta privada estamos calibrando y mejorando las correcciones. Tu feedback es valioso: si una corrección no te parece útil o correcta, escríbenos.
          </p>
        </Section>

        <footer style={foot}>
          <Link href="/legal/privacidad" style={footLink}>Privacidad</Link>
          <span style={sep}>·</span>
          <Link href="/legal/terminos" style={footLink}>Términos</Link>
          <span style={sep}>·</span>
          <Link href="/legal/reembolsos" style={footLink}>Reembolsos</Link>
          <span style={sep}>·</span>
          <Link href="/contacto" style={footLink}>Contacto</Link>
        </footer>
      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2 style={h2}>{title}</h2>
      {children}
    </section>
  )
}

const page: React.CSSProperties = { minHeight: '100vh', padding: '48px 16px 80px' }
const container: React.CSSProperties = { maxWidth: 680, margin: '0 auto', background: 'white', borderRadius: 24, padding: '40px 36px', boxShadow: '0 16px 48px rgba(37,99,235,0.08)' }
const backLink: React.CSSProperties = { fontSize: 13, color: '#6b7280', textDecoration: 'none', display: 'inline-block', marginBottom: 24 }
const h1: React.CSSProperties = { fontSize: 28, fontWeight: 900, color: '#111827', margin: '0 0 4px' }
const h2: React.CSSProperties = { fontSize: 16, fontWeight: 800, color: '#1e3a8a', margin: '0 0 10px' }
const meta: React.CSSProperties = { fontSize: 13, color: '#94a3b8', marginBottom: 36 }
const p: React.CSSProperties = { fontSize: 14, color: '#374151', lineHeight: 1.75, margin: '0 0 10px' }
const ul: React.CSSProperties = { paddingLeft: 20, margin: '0 0 10px' }
const li: React.CSSProperties = { fontSize: 14, color: '#374151', lineHeight: 1.75, marginBottom: 6 }
const aStyle: React.CSSProperties = { color: '#2563eb', textDecoration: 'none' }
const foot: React.CSSProperties = { borderTop: '1px solid #e5e7eb', paddingTop: 20, marginTop: 40, display: 'flex', gap: 8, flexWrap: 'wrap' as const, justifyContent: 'center' }
const footLink: React.CSSProperties = { fontSize: 13, color: '#6b7280', textDecoration: 'none' }
const sep: React.CSSProperties = { fontSize: 13, color: '#d1d5db' }
