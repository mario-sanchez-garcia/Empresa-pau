import type { Metadata } from 'next'
import Link from 'next/link'
import { Bebas_Neue, DM_Mono } from 'next/font/google'
import { Bug, CreditCard, FlaskConical, Mail, Shield, type LucideIcon } from 'lucide-react'
import ContactForm from './ContactForm'
import { SUPPORT_EMAIL } from '@/app/lib/support'

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Contacta con el equipo de Kairo para soporte, privacidad, reembolsos o preguntas sobre la beta.',
}

const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'] })
const mono  = DM_Mono({ weight: ['400', '500'], subsets: ['latin'] })

export default function ContactoPage() {
  const B = bebas.style.fontFamily
  const M = mono.style.fontFamily

  return (
    <div style={{ background: '#111', color: '#fff', minHeight: '100dvh', fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)' }}>
      <style>{`
        .contact-card:hover { background: rgba(255,255,255,.06) !important; border-color: rgba(255,255,255,.14) !important; }
        .legal-nav-link:hover { color: #fff !important; }
        .legal-footer-link:hover { color: rgba(255,255,255,.6) !important; }
      `}</style>
      <LegalNav B={B} M={M} />

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px 100px' }}>
        <div style={{ paddingTop: 96, paddingBottom: 56, borderBottom: '1px solid rgba(255,255,255,.07)' }}>
          <p style={{ fontFamily: M, fontSize: 10, color: 'rgba(255,255,255,.3)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 16 }}>
            Beta privada · Respondemos en 1–2 días laborables
          </p>
          <h1 style={{ fontFamily: B, fontSize: 'clamp(56px, 10vw, 100px)', lineHeight: .92, letterSpacing: '.01em', margin: 0 }}>
            CONTACTO
          </h1>
        </div>

        <div style={{ padding: '40px 0', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,.55)', lineHeight: 1.7, margin: '0 0 32px', maxWidth: 560 }}>
            Estamos en beta privada y atendemos todas las consultas de forma personal. Escríbenos directamente desde este formulario.
          </p>

          <ContactForm M={M} />
        </div>

        <div style={{ padding: '40px 0', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <p style={{ fontFamily: M, fontSize: 10, color: 'rgba(255,255,255,.3)', letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 20 }}>
            O escribe directamente por motivo
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <ContactCard
              icon={Mail}
              title="Soporte general"
              description="Preguntas sobre el producto, bugs, sugerencias o dudas de uso."
              email={SUPPORT_EMAIL}
              subject="Soporte"
              M={M}
            />
            <ContactCard
              icon={Shield}
              title="Privacidad y datos"
              description="Solicitudes de acceso, rectificación o eliminación de tus datos."
              email={SUPPORT_EMAIL}
              subject="Privacidad"
              M={M}
            />
            <ContactCard
              icon={CreditCard}
              title="Reembolsos y pagos"
              description="Solicitudes de reembolso o problemas con el pago del Pack Curso PAU."
              email={SUPPORT_EMAIL}
              subject="Reembolso"
              M={M}
            />
            <ContactCard
              icon={Bug}
              title="Problema técnico"
              description="Si algo no funciona correctamente o encuentras un error."
              email={SUPPORT_EMAIL}
              subject="Problema técnico"
              M={M}
            />
            <ContactCard
              icon={FlaskConical}
              title="Beta privada"
              description="Feedback sobre tu experiencia, ideas o preguntas sobre la fase beta."
              email={SUPPORT_EMAIL}
              subject="Beta privada"
              M={M}
            />
          </div>
        </div>

        <div style={{ padding: '36px 0 0', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ width: 2, background: '#2563eb', borderRadius: 2, flexShrink: 0, alignSelf: 'stretch', minHeight: 48 }} />
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,.45)', lineHeight: 1.75, margin: 0 }}>
            Para solicitudes de reembolso, consulta también nuestra{' '}
            <Link href="/legal/reembolsos" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 600 }}>
              política de reembolsos
            </Link>.{' '}
            Respondemos en un plazo de <strong style={{ color: 'rgba(255,255,255,.7)' }}>1–2 días laborables</strong>.
          </p>
        </div>
      </main>

      <LegalFooter M={M} />
    </div>
  )
}

function ContactCard({
  icon, title, description, email, subject, M,
}: {
  icon: LucideIcon; title: string; description: string; email: string; subject: string; M: string
}) {
  const Icon = icon
  return (
    <a
      href={`mailto:${email}?subject=${encodeURIComponent(subject + ' — Kairo')}`}
      className="contact-card"
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 20,
        padding: '22px 24px',
        borderRadius: 12,
        textDecoration: 'none',
        background: 'rgba(255,255,255,.03)',
        border: '1px solid rgba(255,255,255,.07)',
        transition: 'background 140ms, border-color 140ms',
      }}
    >
      <span style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        display: 'grid', placeItems: 'center',
        color: '#60a5fa', background: 'rgba(96,165,250,.1)', border: '1px solid rgba(96,165,250,.18)',
      }}>
        <Icon size={20} strokeWidth={2} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,.85)', margin: '0 0 5px' }}>{title}</p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', margin: '0 0 10px', lineHeight: 1.55 }}>{description}</p>
        <span style={{ fontFamily: M, fontSize: 10, color: '#60a5fa', letterSpacing: '.1em' }}>{email} →</span>
      </div>
    </a>
  )
}

function LegalNav({ B, M }: { B: string; M: string }) {
  const links = [
    { href: '/legal/terminos',    label: 'Términos',   key: 'terminos'   },
    { href: '/legal/privacidad',  label: 'Privacidad', key: 'privacidad' },
    { href: '/legal/reembolsos',  label: 'Reembolsos', key: 'reembolsos' },
    { href: '/legal/ia',          label: 'IA',         key: 'ia'         },
    { href: '/legal/aviso-legal', label: 'Aviso',      key: 'aviso'      },
    { href: '/contacto',          label: 'Contacto',   key: 'contacto'   },
  ]
  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(17,17,17,.88)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,.07)', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <Link href="/" aria-label="Inicio">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/kairo-logo-white.png" alt="Kairo" loading="eager" style={{ height: 28, width: 'auto', display: 'block' }} />
      </Link>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const }}>
        {links.map(l => (
          <Link key={l.key} href={l.href} className="legal-nav-link" style={{ fontFamily: M, fontSize: 9, fontWeight: 500, letterSpacing: '.14em', textTransform: 'uppercase', padding: '5px 10px', borderRadius: 6, textDecoration: 'none', color: l.key === 'contacto' ? '#fff' : 'rgba(255,255,255,.35)', background: l.key === 'contacto' ? 'rgba(37,99,235,.25)' : 'transparent', transition: 'all 140ms' }}>
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

function LegalFooter({ M }: { M: string }) {
  const links = [
    { href: '/legal/terminos',    label: 'Términos',   key: 'terminos'   },
    { href: '/legal/privacidad',  label: 'Privacidad', key: 'privacidad' },
    { href: '/legal/reembolsos',  label: 'Reembolsos', key: 'reembolsos' },
    { href: '/legal/ia',          label: 'Uso de IA',  key: 'ia'         },
    { href: '/legal/aviso-legal', label: 'Aviso legal',key: 'aviso'      },
    { href: '/contacto',          label: 'Contacto',   key: 'contacto'   },
  ]
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,.07)', padding: '28px 24px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap' as const, gap: 6 }}>
      {links.map((l, i) => (
        <span key={l.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {i > 0 && <span style={{ color: 'rgba(255,255,255,.12)', fontFamily: M, fontSize: 10 }}>·</span>}
          <Link href={l.href} className="legal-footer-link" style={{ fontFamily: M, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', textDecoration: 'none', color: l.key === 'contacto' ? 'rgba(255,255,255,.8)' : 'rgba(255,255,255,.25)', transition: 'color 140ms' }}>
            {l.label}
          </Link>
        </span>
      ))}
    </footer>
  )
}
