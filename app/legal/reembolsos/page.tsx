import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de Reembolsos · Pausia',
  description: 'Condiciones de reembolso del Pack Curso PAU.',
}

export default function ReembolsosPage() {
  return (
    <main className="pau-bg-atmosphere" style={page}>
      <div style={container}>
        <Link href="/contacto" style={backLink}>← Volver</Link>

        <h1 style={h1}>Política de Reembolsos</h1>
        <p style={meta}>Última actualización: junio 2026 · Versión beta privada</p>

        <Section title="1. Pack Curso PAU — garantía de 7 días">
          <p style={p}>
            Si adquiriste el <strong>Pack Curso PAU</strong> y no estás satisfecho, puedes solicitar un reembolso completo dentro de los <strong>7 días naturales</strong> desde la fecha de pago.
          </p>
          <p style={p}>
            Esta garantía existe para que puedas probar Pausia sin riesgo. No necesitas justificar la solicitud.
          </p>
        </Section>

        <Section title="2. Cómo solicitar el reembolso">
          <p style={p}>
            Envía un email a <a href="mailto:hola@pausia.es" style={aStyle}>hola@pausia.es</a> con el asunto <em>"Solicitud de reembolso"</em> e indica:
          </p>
          <ul style={ul}>
            <li style={li}>El email con el que compraste (o el email del alumno si eres padre/madre).</li>
            <li style={li}>La fecha aproximada del pago.</li>
          </ul>
          <p style={p}>
            El equipo gestionará la devolución vía Stripe. El reembolso puede tardar 5–10 días hábiles en aparecer en tu cuenta según tu banco.
          </p>
        </Section>

        <Section title="3. Pagos procesados por Stripe">
          <p style={p}>
            Todos los pagos son procesados por <strong>Stripe</strong>, plataforma de pagos certificada PCI-DSS. Pausia no almacena datos de tarjeta. El reembolso se realiza a la misma tarjeta o método de pago original.
          </p>
        </Section>

        <Section title="4. Uso razonable durante el periodo de garantía">
          <p style={p}>
            La garantía está pensada para usuarios que prueban Pausia de buena fe. En caso de uso abusivo (automatización, scraping, acceso fraudulento o solicitud repetida de reembolsos), Pausia se reserva el derecho a no emitir el reembolso o a limitar el acceso.
          </p>
        </Section>

        <Section title="5. Beta privada">
          <p style={p}>
            Durante la beta privada el equipo gestiona los reembolsos de forma manual y con flexibilidad. Si tienes cualquier problema o duda, escríbenos y lo resolvemos.
          </p>
        </Section>

        <Section title="6. Contacto">
          <p style={p}>
            <a href="mailto:hola@pausia.es" style={aStyle}>hola@pausia.es</a> — respondemos en un plazo de 1–2 días laborables.
          </p>
        </Section>

        <footer style={foot}>
          <Link href="/legal/privacidad" style={footLink}>Privacidad</Link>
          <span style={sep}>·</span>
          <Link href="/legal/terminos" style={footLink}>Términos</Link>
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
