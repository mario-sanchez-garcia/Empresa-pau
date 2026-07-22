import type { Metadata } from 'next'
import Link from 'next/link'
import { Bug, CreditCard, FlaskConical, Mail, Shield, type LucideIcon } from 'lucide-react'
import KairoBrand from '@/components/shared/KairoBrand'

export const metadata: Metadata = {
  title: 'Contacto · Kairo',
  description: 'Contacta con el equipo de Kairo para soporte, privacidad, reembolsos o preguntas sobre la beta.',
}

export default function ContactoPage() {
  return (
    <main className="pau-bg-atmosphere" style={page}>
      <div style={container}>
        <div style={logoRow}>
          <KairoBrand subtitle={null} size="md" />
        </div>

        <h1 style={h1}>Contacto</h1>
        <p style={sub}>Estamos en beta privada y atendemos todas las consultas de forma personal.</p>

        <div style={cards}>
          <ContactCard
            icon={Mail}
            title="Soporte general"
            description="Preguntas sobre el producto, bugs, sugerencias o dudas de uso."
            email="hola@kairo.es"
            subject="Soporte"
          />
          <ContactCard
            icon={Shield}
            title="Privacidad y datos"
            description="Solicitudes de acceso, rectificación o eliminación de tus datos."
            email="hola@kairo.es"
            subject="Privacidad"
          />
          <ContactCard
            icon={CreditCard}
            title="Reembolsos y pagos"
            description="Solicitudes de reembolso o problemas con el pago del Pack Curso PAU."
            email="hola@kairo.es"
            subject="Reembolso"
          />
          <ContactCard
            icon={Bug}
            title="Problema técnico"
            description="Si algo no funciona correctamente o encuentras un error."
            email="hola@kairo.es"
            subject="Problema técnico"
          />
          <ContactCard
            icon={FlaskConical}
            title="Beta privada"
            description="Feedback sobre tu experiencia, ideas o preguntas sobre la fase beta."
            email="hola@kairo.es"
            subject="Beta privada"
          />
        </div>

        <div style={note}>
          <p style={noteText}>
            Respondemos en un plazo de <strong>1–2 días laborables</strong>. Para solicitudes de reembolso, consulta también nuestra <Link href="/legal/reembolsos" style={aStyle}>política de reembolsos</Link>.
          </p>
        </div>

        <footer style={foot}>
          <Link href="/legal/privacidad" style={footLink}>Privacidad</Link>
          <span style={sep}>·</span>
          <Link href="/legal/terminos" style={footLink}>Términos</Link>
          <span style={sep}>·</span>
          <Link href="/legal/reembolsos" style={footLink}>Reembolsos</Link>
          <span style={sep}>·</span>
          <Link href="/legal/ia" style={footLink}>Uso de IA</Link>
        </footer>
      </div>
    </main>
  )
}

function ContactCard({
  icon, title, description, email, subject
}: { icon: LucideIcon; title: string; description: string; email: string; subject: string }) {
  const Icon = icon
  return (
    <div style={card}>
      <span style={cardIcon}><Icon size={20} strokeWidth={2.2} /></span>
      <div>
        <p style={cardTitle}>{title}</p>
        <p style={cardDesc}>{description}</p>
        <a
          href={`mailto:${email}?subject=${encodeURIComponent(subject + ' — Kairo')}`}
          style={cardLink}
        >
          {email}
        </a>
      </div>
    </div>
  )
}

const page: React.CSSProperties = { minHeight: '100vh', padding: '48px 16px 80px' }
const container: React.CSSProperties = { maxWidth: 640, margin: '0 auto' }
const logoRow: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }
const h1: React.CSSProperties = { fontSize: 32, fontWeight: 900, color: '#111827', margin: '0 0 8px' }
const sub: React.CSSProperties = { fontSize: 15, color: '#64748b', margin: '0 0 36px', lineHeight: 1.6 }
const cards: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 12 }
const card: React.CSSProperties = { background: 'white', borderRadius: 14, padding: '18px 20px', display: 'flex', gap: 16, alignItems: 'flex-start', border: '1px solid var(--pau-border, #dbe7fb)' }
const cardIcon: React.CSSProperties = { width: 38, height: 38, borderRadius: 12, flexShrink: 0, marginTop: 2, display: 'grid', placeItems: 'center', color: '#1d4ed8', background: '#eff6ff', border: '1px solid #dbeafe' }
const cardTitle: React.CSSProperties = { fontSize: 14, fontWeight: 800, color: '#111827', margin: '0 0 4px' }
const cardDesc: React.CSSProperties = { fontSize: 13, color: '#6b7280', margin: '0 0 6px', lineHeight: 1.5 }
const cardLink: React.CSSProperties = { fontSize: 13, color: '#2563eb', textDecoration: 'none', fontWeight: 600 }
const note: React.CSSProperties = { background: '#eff6ff', borderRadius: 12, padding: '14px 18px', marginTop: 24 }
const noteText: React.CSSProperties = { fontSize: 13, color: '#1e40af', margin: 0, lineHeight: 1.6 }
const aStyle: React.CSSProperties = { color: '#1d4ed8' }
const foot: React.CSSProperties = { borderTop: '1px solid #e5e7eb', paddingTop: 20, marginTop: 36, display: 'flex', gap: 8, flexWrap: 'wrap' as const, justifyContent: 'center' }
const footLink: React.CSSProperties = { fontSize: 13, color: '#6b7280', textDecoration: 'none' }
const sep: React.CSSProperties = { fontSize: 13, color: '#d1d5db' }
