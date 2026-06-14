import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Términos de Uso · Pausia',
  description: 'Condiciones de uso de Pausia durante la beta privada.',
}

export default function TerminosPage() {
  return (
    <main className="pau-bg-atmosphere" style={page}>
      <div style={container}>
        <Link href="/contacto" style={backLink}>← Volver</Link>

        <h1 style={h1}>Términos de Uso</h1>
        <p style={meta}>Última actualización: junio 2026 · Versión beta privada</p>

        <Section title="1. Qué es Pausia">
          <p style={p}>
            Pausia es una herramienta digital de apoyo al estudio para la preparación de la PAU. Está en <strong>fase beta privada</strong>: las funcionalidades pueden cambiar, mejorar o eliminarse sin previo aviso mientras seguimos desarrollando el producto.
          </p>
        </Section>

        <Section title="2. Qué no sustituye Pausia">
          <p style={p}>
            Pausia es un complemento al estudio personal. <strong>No sustituye</strong> a un profesor, academia, centro educativo ni a los criterios de corrección oficiales de las pruebas PAU. Los contenidos y correcciones generados por IA son orientativos y pueden contener errores.
          </p>
        </Section>

        <Section title="3. Sin garantía de resultados académicos">
          <p style={p}>
            Pausia no garantiza ninguna nota concreta ni la superación de ningún examen. El rendimiento académico depende del esfuerzo, la dedicación y muchos otros factores fuera del control de la herramienta. Pausia te ayuda a estudiar con más estructura, práctica y feedback, pero el resultado final es tuyo.
          </p>
        </Section>

        <Section title="4. Uso responsable">
          <ul style={ul}>
            <li style={li}>Usa Pausia como herramienta de apoyo, no como sustituto del estudio real.</li>
            <li style={li}>No compartas tu cuenta con otras personas.</li>
            <li style={li}>No uses la plataforma de forma automatizada, mediante bots o scripts.</li>
            <li style={li}>No intentes extraer contenido masivamente (scraping).</li>
            <li style={li}>No uses la plataforma de forma fraudulenta o para fines distintos al estudio personal.</li>
          </ul>
        </Section>

        <Section title="5. Acceso y limitaciones">
          <p style={p}>
            Pausia puede limitar o suspender el acceso a usuarios que realicen un uso abusivo, automático o que vulnere estos términos. Durante la beta privada el equipo gestiona estos casos de forma manual.
          </p>
        </Section>

        <Section title="6. Correcciones e IA">
          <p style={p}>
            Las correcciones generadas por inteligencia artificial son orientativas. Pueden equivocarse, omitir matices o no reflejar los criterios exactos de corrección de tu comunidad autónoma. Consulta siempre fuentes oficiales para preparación formal. Consulta también nuestra <Link href="/legal/ia" style={aStyle}>política de uso de IA</Link>.
          </p>
        </Section>

        <Section title="7. Cambios en el servicio">
          <p style={p}>
            Al estar en beta, el servicio puede cambiar sustancialmente. Nos comprometemos a comunicar cambios relevantes a los usuarios activos con la mayor antelación posible.
          </p>
        </Section>

        <Section title="8. Pagos y reembolsos">
          <p style={p}>
            La información sobre pagos y reembolsos está disponible en nuestra <Link href="/legal/reembolsos" style={aStyle}>política de reembolsos</Link>. Los pagos son procesados por Stripe.
          </p>
        </Section>

        <Section title="9. Contacto">
          <p style={p}>
            Dudas sobre estos términos: <a href="mailto:hola@pausia.es" style={aStyle}>hola@pausia.es</a>
          </p>
        </Section>

        <footer style={foot}>
          <Link href="/legal/privacidad" style={footLink}>Privacidad</Link>
          <span style={sep}>·</span>
          <Link href="/legal/reembolsos" style={footLink}>Reembolsos</Link>
          <span style={sep}>·</span>
          <Link href="/legal/ia" style={footLink}>Uso de IA</Link>
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
