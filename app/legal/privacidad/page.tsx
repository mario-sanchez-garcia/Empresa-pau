import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de Privacidad · Kairo',
  description: 'Política de Privacidad de Kairo.',
}

export default function PrivacidadPage() {
  return (
    <main className="pau-bg-atmosphere" style={page}>
      <div style={container}>
        <Link href="/contacto" style={backLink}>← Volver</Link>

        <h1 style={h1}>Política de Privacidad</h1>
        <p style={meta}>Última actualización: junio de 2026</p>

        <Section title="1. Responsable del tratamiento">
          <p style={p}>
            Mario Sánchez García, Alejandro Amigo Granja, Marco Martínez Mira y Diego García Verdugo.
          </p>
          <p style={p}>Contacto: <a href="mailto:legal@pausia.es" style={aStyle}>legal@pausia.es</a></p>
        </Section>

        <Section title="2. Datos que recogemos">
          <ul style={ul}>
            <li style={li}><strong>Datos de registro:</strong> correo electrónico, contraseña cifrada, centro escolar, comunidad autónoma y asignaturas.</li>
            <li style={li}><strong>Datos de uso:</strong> respuestas a ejercicios, correcciones IA, historial de progreso, XP y misiones completadas.</li>
            <li style={li}><strong>Datos de pago:</strong> correo del padre/madre/tutor que paga. Los datos de tarjeta son procesados por Stripe y nunca son accesibles para Kairo.</li>
            <li style={li}><strong>Datos técnicos:</strong> dirección IP para prevención de abuso.</li>
          </ul>
        </Section>

        <Section title="3. Finalidad del tratamiento">
          <ul style={ul}>
            <li style={li}>Prestación del Servicio.</li>
            <li style={li}>Mejora de la plataforma.</li>
            <li style={li}>Comunicaciones relacionadas con el Servicio.</li>
            <li style={li}>Seguridad y facturación.</li>
          </ul>
        </Section>

        <Section title="4. Base legal">
          <ul style={ul}>
            <li style={li}>Ejecución del contrato (Art. 6.1.b RGPD).</li>
            <li style={li}>Interés legítimo para seguridad (Art. 6.1.f RGPD).</li>
            <li style={li}>Consentimiento para comunicaciones de marketing (Art. 6.1.a RGPD).</li>
          </ul>
        </Section>

        <Section title="5. Protección de datos de menores">
          <p style={p}>
            Kairo está dirigido a usuarios de 14 a 18 años. No compartimos datos de menores con terceros con fines publicitarios. Los padres o tutores pueden solicitar acceso, rectificación o eliminación de datos de sus hijos en <a href="mailto:legal@pausia.es" style={aStyle}>legal@pausia.es</a>.
          </p>
        </Section>

        <Section title="6. Destinatarios">
          <ul style={ul}>
            <li style={li}><strong>Supabase</strong> — base de datos, UE.</li>
            <li style={li}><strong>Anthropic</strong> — API de IA, procesamiento puntual sin almacenamiento.</li>
            <li style={li}><strong>Stripe</strong> — pagos.</li>
            <li style={li}><strong>Vercel</strong> — hosting.</li>
          </ul>
          <p style={p}>Todos cumplen el RGPD.</p>
        </Section>

        <Section title="7. Conservación">
          <p style={p}>
            Datos activos mientras la cuenta esté activa. Tras eliminar la cuenta, los datos de registro se eliminan en 30 días. Los datos fiscales se conservan 5 años por obligación legal.
          </p>
        </Section>

        <Section title="8. Sus derechos">
          <p style={p}>
            Acceso, rectificación, supresión, limitación, portabilidad y oposición. Contacto: <a href="mailto:legal@pausia.es" style={aStyle}>legal@pausia.es</a>. Respuesta en máximo 30 días. Puede reclamar ante la AEPD en <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" style={aStyle}>www.aepd.es</a>.
          </p>
        </Section>

        <Section title="9. Seguridad">
          <p style={p}>
            Contraseñas con hash seguro, HTTPS/TLS, Row Level Security en base de datos, rate limiting y datos de pago nunca accesibles para Kairo.
          </p>
        </Section>

        <Section title="10. Cookies">
          <p style={p}>
            Solo cookies técnicas necesarias para la sesión. Sin cookies de seguimiento ni publicidad.
          </p>
        </Section>

        <Section title="11. Contacto">
          <p style={p}>
            <a href="mailto:legal@pausia.es" style={aStyle}>legal@pausia.es</a>
          </p>
        </Section>

        <footer style={foot}>
          <Link href="/legal/terminos" style={footLink}>Términos</Link>
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
