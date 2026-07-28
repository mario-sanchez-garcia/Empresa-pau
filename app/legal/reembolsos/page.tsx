import type { Metadata } from 'next'
import Link from 'next/link'
import { Bebas_Neue, DM_Mono } from 'next/font/google'

export const metadata: Metadata = {
  title: 'Política de Reembolsos · Kairo',
  description: 'Condiciones de reembolso del Pack Curso PAU.',
}

const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'] })
const mono  = DM_Mono({ weight: ['400', '500'], subsets: ['latin'] })

export default function ReembolsosPage() {
  const B = bebas.style.fontFamily
  const M = mono.style.fontFamily

  return (
    <div style={{ background: '#111', color: '#fff', minHeight: '100dvh', fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)' }}>
      <LegalNav B={B} M={M} active="reembolsos" />

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px 100px' }}>
        <div style={{ paddingTop: 96, paddingBottom: 56, borderBottom: '1px solid rgba(255,255,255,.07)' }}>
          <p style={{ fontFamily: M, fontSize: 10, color: 'rgba(255,255,255,.3)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 16 }}>
            Última actualización: junio 2026 · Beta privada
          </p>
          <h1 style={{ fontFamily: B, fontSize: 'clamp(56px, 10vw, 100px)', lineHeight: .92, letterSpacing: '.01em', margin: 0 }}>
            POLÍTICA DE<br />REEMBOLSOS
          </h1>
        </div>

        <S n="01" title="Pack Curso PAU — garantía de 7 días" M={M}>
          <P>Si adquiriste el <strong style={{ color: 'rgba(255,255,255,.9)' }}>Pack Curso PAU</strong> y no estás satisfecho, puedes solicitar un reembolso completo dentro de los <strong style={{ color: 'rgba(255,255,255,.9)' }}>7 días naturales</strong> desde la fecha de pago.</P>
          <P>Esta garantía existe para que puedas probar Kairo sin riesgo. No necesitas justificar la solicitud.</P>
        </S>

        <S n="02" title="Cómo solicitar el reembolso" M={M}>
          <P>Envía un email a <A href="mailto:hola@kairo.es">hola@kairo.es</A> con el asunto <em style={{ color: 'rgba(255,255,255,.55)' }}>&quot;Solicitud de reembolso&quot;</em> e indica:</P>
          <ul style={ul}>
            <li style={li}>El email con el que compraste (o el email del alumno si eres padre/madre).</li>
            <li style={li}>La fecha aproximada del pago.</li>
          </ul>
          <P>El equipo gestionará la devolución vía Stripe. El reembolso puede tardar 5–10 días hábiles en aparecer en tu cuenta según tu banco.</P>
        </S>

        <S n="03" title="Pagos procesados por Stripe" M={M}>
          <P>Todos los pagos son procesados por <strong style={{ color: 'rgba(255,255,255,.9)' }}>Stripe</strong>, plataforma de pagos certificada PCI-DSS. Kairo no almacena datos de tarjeta. El reembolso se realiza a la misma tarjeta o método de pago original.</P>
        </S>

        <S n="04" title="Uso razonable durante el periodo de garantía" M={M}>
          <P>La garantía está pensada para usuarios que prueban Kairo de buena fe. En caso de uso abusivo (automatización, scraping, acceso fraudulento o solicitud repetida de reembolsos), Kairo se reserva el derecho a no emitir el reembolso o a limitar el acceso.</P>
        </S>

        <S n="05" title="Beta privada" M={M}>
          <P>Durante la beta privada el equipo gestiona los reembolsos de forma manual y con flexibilidad. Si tienes cualquier problema o duda, escríbenos y lo resolvemos.</P>
        </S>

        <S n="06" title="Contacto" M={M} last>
          <P><A href="mailto:hola@kairo.es">hola@kairo.es</A> — respondemos en un plazo de 1–2 días laborables.</P>
        </S>
      </main>

      <LegalFooter M={M} active="reembolsos" />
    </div>
  )
}

function LegalNav({ B, M, active }: { B: string; M: string; active: string }) {
  const links = [
    { href: '/legal/terminos',   label: 'Términos',   key: 'terminos'   },
    { href: '/legal/privacidad', label: 'Privacidad', key: 'privacidad' },
    { href: '/legal/reembolsos', label: 'Reembolsos', key: 'reembolsos' },
    { href: '/legal/ia',         label: 'IA',         key: 'ia'         },
    { href: '/contacto',         label: 'Contacto',   key: 'contacto'   },
  ]
  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(17,17,17,.88)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,.07)', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <Link href="/" aria-label="Inicio">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/kairo-logo-white.png" alt="Kairo" style={{ height: 28, width: 'auto', display: 'block' }} />
      </Link>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const }}>
        {links.map(l => (
          <Link key={l.key} href={l.href} style={{ fontFamily: M, fontSize: 9, fontWeight: 500, letterSpacing: '.14em', textTransform: 'uppercase', padding: '5px 10px', borderRadius: 6, textDecoration: 'none', color: active === l.key ? '#fff' : 'rgba(255,255,255,.35)', background: active === l.key ? 'rgba(37,99,235,.25)' : 'transparent', transition: 'all 140ms' }}>
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

function LegalFooter({ M, active }: { M: string; active: string }) {
  const links = [
    { href: '/legal/terminos',   label: 'Términos',   key: 'terminos'   },
    { href: '/legal/privacidad', label: 'Privacidad', key: 'privacidad' },
    { href: '/legal/reembolsos', label: 'Reembolsos', key: 'reembolsos' },
    { href: '/legal/ia',         label: 'Uso de IA',  key: 'ia'         },
    { href: '/contacto',         label: 'Contacto',   key: 'contacto'   },
  ]
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,.07)', padding: '28px 24px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap' as const, gap: 6 }}>
      {links.map((l, i) => (
        <span key={l.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {i > 0 && <span style={{ color: 'rgba(255,255,255,.12)', fontFamily: M, fontSize: 10 }}>·</span>}
          <Link href={l.href} style={{ fontFamily: M, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', textDecoration: 'none', color: active === l.key ? 'rgba(255,255,255,.8)' : 'rgba(255,255,255,.25)', transition: 'color 140ms' }}>
            {l.label}
          </Link>
        </span>
      ))}
    </footer>
  )
}

function S({ n, title, children, M, last }: { n: string; title: string; children: React.ReactNode; M: string; last?: boolean }) {
  return (
    <section style={{ borderBottom: last ? 'none' : '1px solid rgba(255,255,255,.06)', padding: '40px 0' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 20 }}>
        <span style={{ fontFamily: M, fontSize: 10, color: '#2563eb', letterSpacing: '.2em', fontWeight: 500, flexShrink: 0 }}>{n}</span>
        <h2 style={{ fontFamily: M, fontSize: 11, fontWeight: 500, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.6)', margin: 0 }}>{title}</h2>
      </div>
      {children}
    </section>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 15, color: 'rgba(255,255,255,.65)', lineHeight: 1.8, margin: '0 0 12px' }}>{children}</p>
}

function A({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 600 }}>{children}</a>
}

const ul: React.CSSProperties = { paddingLeft: 18, margin: '0 0 12px', display: 'flex', flexDirection: 'column', gap: 8 }
const li: React.CSSProperties = { fontSize: 15, color: 'rgba(255,255,255,.6)', lineHeight: 1.75, paddingLeft: 4 }
