import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de Privacidad · Pausia',
  description: 'Cómo Pausia recoge, usa y protege tus datos durante la beta privada.',
}

export default function PrivacidadPage() {
  return (
    <main className="pau-bg-atmosphere" style={page}>
      <div style={container}>
        <Link href="/contacto" style={backLink}>← Volver</Link>

        <h1 style={h1}>Política de Privacidad</h1>
        <p style={meta}>Última actualización: junio 2026 · Versión beta privada</p>

        <Section title="1. Qué es Pausia">
          <p style={p}>
            Pausia es una herramienta de apoyo al estudio para la preparación de la PAU (Prueba de Acceso a la Universidad) actualmente en <strong>beta privada</strong>. Durante esta fase el acceso está limitado a un grupo reducido de usuarios invitados.
          </p>
        </Section>

        <Section title="2. Datos que podemos recoger">
          <ul style={ul}>
            <li style={li}><strong>Cuenta:</strong> dirección de email y datos de autenticación gestionados por Supabase.</li>
            <li style={li}><strong>Progreso de estudio:</strong> misiones completadas, XP, racha, nivel por asignatura.</li>
            <li style={li}><strong>Respuestas y ejercicios:</strong> texto que escribes en correcciones, simulacros y respuestas abiertas.</li>
            <li style={li}><strong>Historial de simulacros:</strong> preguntas respondidas, notas estimadas, correcciones.</li>
            <li style={li}><strong>Eventos de uso:</strong> páginas visitadas, funciones usadas, errores técnicos.</li>
            <li style={li}><strong>Datos de pago:</strong> gestionados íntegramente por Stripe. Pausia no almacena números completos de tarjeta ni datos de pago sensibles.</li>
            <li style={li}><strong>Onboarding:</strong> comunidad autónoma, asignaturas y preferencias de estudio guardadas localmente en tu dispositivo.</li>
          </ul>
        </Section>

        <Section title="3. Para qué usamos los datos">
          <ul style={ul}>
            <li style={li}>Personalizar tu ruta de estudio (Camino PAU).</li>
            <li style={li}>Generar correcciones y simulacros con IA.</li>
            <li style={li}>Mantener tu progreso entre sesiones.</li>
            <li style={li}>Mejorar el producto durante la beta.</li>
            <li style={li}>Gestionar pagos y entitlements de Pack Curso PAU.</li>
          </ul>
        </Section>

        <Section title="4. Proveedores externos">
          <ul style={ul}>
            <li style={li}><strong>Supabase</strong> — base de datos y autenticación. Datos almacenados en la UE.</li>
            <li style={li}><strong>Vercel</strong> — infraestructura de la aplicación web.</li>
            <li style={li}><strong>Stripe</strong> — procesamiento de pagos. Pausia no ve ni guarda datos completos de tarjeta.</li>
            <li style={li}><strong>Proveedores de IA</strong> — las respuestas que envías a las correcciones pueden procesarse por modelos de IA. No envíes datos personales sensibles en tus respuestas.</li>
          </ul>
        </Section>

        <Section title="5. Tus derechos">
          <p style={p}>
            Puedes solicitar en cualquier momento el acceso, rectificación o eliminación de tus datos enviando un email a <a href="mailto:hola@pausia.es" style={aStyle}>hola@pausia.es</a>. Durante la beta privada gestionamos estas solicitudes de forma manual y nos comprometemos a responder en un plazo razonable.
          </p>
        </Section>

        <Section title="6. Recomendación sobre datos personales">
          <p style={p}>
            Los alumnos no deben incluir datos personales innecesarios (nombre completo, DNI, dirección, datos médicos, etc.) en sus respuestas a ejercicios o simulacros. Las respuestas son texto libre y pueden procesarse por sistemas de IA.
          </p>
        </Section>

        <Section title="7. Contacto">
          <p style={p}>
            Para cualquier consulta sobre privacidad: <a href="mailto:hola@pausia.es" style={aStyle}>hola@pausia.es</a>
          </p>
          <p style={p}>
            También puedes usar nuestro <Link href="/contacto" style={aStyle}>formulario de contacto</Link>.
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

const page: React.CSSProperties = {
  minHeight: '100vh',
  padding: '48px 16px 80px',
}
const container: React.CSSProperties = {
  maxWidth: 680,
  margin: '0 auto',
  background: 'white',
  borderRadius: 24,
  padding: '40px 36px',
  boxShadow: '0 16px 48px rgba(37,99,235,0.08)',
}
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
