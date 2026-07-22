import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Términos y Condiciones · Kairo',
  description: 'Términos y Condiciones de Uso de Kairo.',
}

export default function TerminosPage() {
  return (
    <main className="pau-bg-atmosphere" style={page}>
      <div style={container}>
        <Link href="/contacto" style={backLink}>← Volver</Link>

        <h1 style={h1}>Términos y Condiciones de Uso</h1>
        <p style={meta}>Última actualización: junio de 2026</p>

        <Section title="1. Información del responsable">
          <p style={p}>
            El presente servicio es ofrecido por los responsables del proyecto Kairo:
          </p>
          <ul style={ul}>
            <li style={li}>Mario Sánchez García</li>
            <li style={li}>Alejandro Amigo Granja</li>
            <li style={li}>Marco Martínez Mira</li>
            <li style={li}>Diego García Verdugo</li>
          </ul>
          <p style={p}>Contacto: <a href="mailto:legal@pausia.es" style={aStyle}>legal@pausia.es</a></p>
        </Section>

        <Section title="2. Descripción del servicio">
          <p style={p}>
            Kairo es una plataforma educativa de preparación para la PAU/EVAU que ofrece exámenes oficiales con corrección mediante inteligencia artificial, simulacros de examen, plan de estudio personalizado (Camino PAU), chat educativo con asistente IA e historial de correcciones y progreso.
          </p>
        </Section>

        <Section title="3. Edad mínima y consentimiento parental">
          <p style={p}>
            El Servicio está dirigido a estudiantes de entre 14 y 18 años. Los usuarios de 14 a 17 años deben contar con el conocimiento y consentimiento de sus padres o tutores legales. Al registrarse, el usuario declara que sus padres o tutores conocen y aceptan el uso del Servicio.
          </p>
        </Section>

        <Section title="4. Registro y cuenta de usuario">
          <p style={p}>
            Para usar el Servicio es necesario proporcionar correo electrónico, contraseña, centro escolar, comunidad autónoma y asignaturas de preparación. El usuario es responsable de mantener la confidencialidad de sus credenciales.
          </p>
        </Section>

        <Section title="5. Uso del Servicio">
          <p style={p}>El usuario se compromete a:</p>
          <ul style={ul}>
            <li style={li}>Usar el Servicio únicamente con fines educativos personales.</li>
            <li style={li}>No compartir ni distribuir los contenidos sin autorización.</li>
            <li style={li}>No intentar acceder a cuentas de otros usuarios.</li>
            <li style={li}>Proporcionar información veraz en el registro.</li>
          </ul>
        </Section>

        <Section title="6. Contenido educativo">
          <p style={p}>
            Los exámenes están basados en pruebas oficiales de la PAU/EVAU de acceso público. Las correcciones son generadas por inteligencia artificial y tienen carácter orientativo. Las correcciones de Kairo no garantizan ninguna nota en la PAU/EVAU real.
          </p>
        </Section>

        <Section title="7. Planes y precios">
          <p style={p}>
            Los pagos son procesados por Stripe. Kairo no almacena datos de tarjetas de crédito. Ofrecemos devolución íntegra dentro de los 7 días naturales siguientes a la compra, siempre que no se hayan realizado más de 10 correcciones IA. Para solicitar la devolución: <a href="mailto:legal@pausia.es" style={aStyle}>legal@pausia.es</a>
          </p>
        </Section>

        <Section title="8. Propiedad intelectual">
          <p style={p}>
            Todos los contenidos originales de Kairo son propiedad de los responsables del proyecto y están protegidos por la legislación española e internacional sobre propiedad intelectual.
          </p>
        </Section>

        <Section title="9. Limitación de responsabilidad">
          <p style={p}>
            Kairo no garantiza la disponibilidad ininterrumpida del Servicio, que las correcciones IA sean equivalentes a las de un docente, ni resultados académicos específicos.
          </p>
        </Section>

        <Section title="10. Modificación de los términos">
          <p style={p}>
            Kairo se reserva el derecho a modificar estos Términos. Los cambios serán notificados por correo electrónico con al menos 15 días de antelación.
          </p>
        </Section>

        <Section title="11. Legislación aplicable">
          <p style={p}>
            Estos Términos se rigen por la legislación española. Las partes se someten a los Juzgados y Tribunales de Madrid.
          </p>
        </Section>

        <Section title="12. Contacto">
          <p style={p}>
            <a href="mailto:legal@pausia.es" style={aStyle}>legal@pausia.es</a>
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
