import type { Metadata } from 'next'
import Link from 'next/link'
import { Bebas_Neue, DM_Mono } from 'next/font/google'

export const metadata: Metadata = {
  title: 'Uso de Inteligencia Artificial · Kairo',
  description: 'Cómo usa Kairo la inteligencia artificial en correcciones y simulacros.',
}

const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'] })
const mono  = DM_Mono({ weight: ['400', '500'], subsets: ['latin'] })

export default function IaPage() {
  const B = bebas.style.fontFamily
  const M = mono.style.fontFamily

  return (
    <div style={{ background: '#111', color: '#fff', minHeight: '100dvh', fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)' }}>
      <LegalNav B={B} M={M} active="ia" />

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px 100px' }}>
        <div style={{ paddingTop: 96, paddingBottom: 56, borderBottom: '1px solid rgba(255,255,255,.07)' }}>
          <p style={{ fontFamily: M, fontSize: 10, color: 'rgba(255,255,255,.3)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 16 }}>
            Última actualización: junio 2026 · Versión beta privada
          </p>
          <h1 style={{ fontFamily: B, fontSize: 'clamp(56px, 10vw, 100px)', lineHeight: .92, letterSpacing: '.01em', margin: 0 }}>
            USO DE<br />INTELIGENCIA<br />ARTIFICIAL
          </h1>
        </div>

        <S n="01" title="Qué hace la IA en Kairo" M={M}>
          <P>Kairo usa modelos de inteligencia artificial para generar correcciones de respuestas abiertas, feedback de simulacros y orientación sobre errores de estudio.</P>
        </S>

        <S n="02" title="Las correcciones son orientativas" M={M}>
          <P>Las correcciones generadas por IA son <strong style={{ color: 'rgba(255,255,255,.9)' }}>orientativas</strong>. Pueden contener errores, omitir matices importantes o no reflejar exactamente los criterios de corrección oficiales de tu comunidad autónoma o de la asignatura concreta.</P>
          <P><strong style={{ color: 'rgba(255,255,255,.9)' }}>Las correcciones IA no son una calificación oficial</strong> ni un indicador definitivo de tu nivel. Úsalas para identificar áreas de mejora, no como verdad absoluta.</P>
        </S>

        <S n="03" title="Qué hacer si la corrección parece incorrecta" M={M}>
          <ul style={ul}>
            <li style={li}>Contrasta con tu libro de texto, apuntes o profesor.</li>
            <li style={li}>Revisa los criterios oficiales de corrección publicados por tu comunidad autónoma.</li>
            <li style={li}>Si detectas un error claro, puedes reportarlo en <A href="mailto:hola@kairo.es">hola@kairo.es</A>.</li>
          </ul>
        </S>

        <S n="04" title="Datos que procesa la IA" M={M}>
          <P>El texto de tus respuestas se envía a modelos de IA para generar feedback. <strong style={{ color: 'rgba(255,255,255,.9)' }}>No incluyas datos personales innecesarios</strong> (nombre completo, DNI, datos médicos, información de terceros) en tus respuestas.</P>
          <P>Consulta nuestra <A href="/legal/privacidad">política de privacidad</A> para más información sobre cómo usamos y almacenamos los datos.</P>
        </S>

        <S n="05" title="Límites de uso razonable" M={M}>
          <P>Para proteger la calidad del servicio y los costes operativos, puede haber límites en el número de correcciones o simulacros disponibles según el plan. Kairo muestra un aviso cuando se alcanzan estos límites. Si tienes el Pack Curso PAU activo, los límites están ampliados para un uso normal de estudio diario.</P>
        </S>

        <S n="06" title="Mejora continua" M={M} last>
          <P>Durante la beta privada estamos calibrando y mejorando las correcciones. Tu feedback es valioso: si una corrección no te parece útil o correcta, escríbenos a <A href="mailto:hola@kairo.es">hola@kairo.es</A>.</P>
        </S>
      </main>

      <LegalFooter M={M} active="ia" />
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
