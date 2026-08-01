import type { Metadata } from 'next'
import Link from 'next/link'
import { Bebas_Neue, DM_Mono } from 'next/font/google'
import { LEGAL_VERSIONS } from '@/app/lib/legalVersions'

export const metadata: Metadata = {
  title: 'Política de Privacidad · Kairo',
  description: 'Política de Privacidad de Kairo.',
}

const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'] })
const mono  = DM_Mono({ weight: ['400', '500'], subsets: ['latin'] })

export default function PrivacidadPage() {
  const B = bebas.style.fontFamily
  const M = mono.style.fontFamily
  const v = LEGAL_VERSIONS.privacidad

  return (
    <div style={{ background: '#111', color: '#fff', minHeight: '100dvh', fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)' }}>
      <LegalNav B={B} M={M} active="privacidad" />

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px 100px' }}>
        <div style={{ paddingTop: 96, paddingBottom: 56, borderBottom: '1px solid rgba(255,255,255,.07)' }}>
          <p style={{ fontFamily: M, fontSize: 10, color: 'rgba(255,255,255,.3)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 16 }}>
            Última actualización: {v.label} · v{v.version}
          </p>
          <h1 style={{ fontFamily: B, fontSize: 'clamp(56px, 10vw, 100px)', lineHeight: .92, letterSpacing: '.01em', margin: 0 }}>
            POLÍTICA DE<br />PRIVACIDAD
          </h1>
        </div>

        <S n="01" title="Responsable del tratamiento" M={M}>
          <P>Mario Sánchez García, Alejandro Amigo Granja, Marco Martínez Mira y Diego García Verdugo.</P>
          <P>Contacto: <A href="mailto:legal@kairo.es">legal@kairo.es</A></P>
        </S>

        <S n="02" title="Datos que recogemos" M={M}>
          <ul style={ul}>
            <li style={li}><strong style={{ color: 'rgba(255,255,255,.85)' }}>Datos de registro:</strong> correo electrónico, contraseña cifrada, centro escolar, comunidad autónoma y asignaturas.</li>
            <li style={li}><strong style={{ color: 'rgba(255,255,255,.85)' }}>Datos de uso:</strong> respuestas a ejercicios, correcciones IA, historial de progreso, XP y misiones completadas.</li>
            <li style={li}><strong style={{ color: 'rgba(255,255,255,.85)' }}>Datos de pago:</strong> correo del padre/madre/tutor que paga. Los datos de tarjeta son procesados por Stripe y nunca son accesibles para Kairo.</li>
            <li style={li}><strong style={{ color: 'rgba(255,255,255,.85)' }}>Datos técnicos:</strong> dirección IP para prevención de abuso.</li>
          </ul>
        </S>

        <S n="03" title="Finalidad del tratamiento" M={M}>
          <ul style={ul}>
            <li style={li}>Prestación del Servicio.</li>
            <li style={li}>Mejora de la plataforma.</li>
            <li style={li}>Comunicaciones relacionadas con el Servicio.</li>
            <li style={li}>Seguridad y facturación.</li>
          </ul>
        </S>

        <S n="04" title="Base legal" M={M}>
          <ul style={ul}>
            <li style={li}>Ejecución del contrato (Art. 6.1.b RGPD).</li>
            <li style={li}>Interés legítimo para seguridad (Art. 6.1.f RGPD).</li>
            <li style={li}>Consentimiento para comunicaciones de marketing (Art. 6.1.a RGPD).</li>
          </ul>
        </S>

        <S n="05" title="Protección de datos de menores" M={M}>
          <P>Kairo está dirigido a usuarios de 14 a 18 años. No compartimos datos de menores con terceros con fines publicitarios. Los padres o tutores pueden solicitar acceso, rectificación o eliminación de datos de sus hijos en <A href="mailto:legal@kairo.es">legal@kairo.es</A>.</P>
        </S>

        <S n="06" title="Destinatarios" M={M}>
          <ul style={ul}>
            <li style={li}><strong style={{ color: 'rgba(255,255,255,.85)' }}>Supabase</strong> — base de datos, UE.</li>
            <li style={li}><strong style={{ color: 'rgba(255,255,255,.85)' }}>Anthropic</strong> — API de IA, procesamiento puntual sin almacenamiento.</li>
            <li style={li}><strong style={{ color: 'rgba(255,255,255,.85)' }}>Stripe</strong> — pagos.</li>
            <li style={li}><strong style={{ color: 'rgba(255,255,255,.85)' }}>Vercel</strong> — hosting.</li>
          </ul>
          <P>Todos cumplen el RGPD.</P>
        </S>

        <S n="07" title="Conservación" M={M}>
          <P>Datos activos mientras la cuenta esté activa. Tras eliminar la cuenta, los datos de registro se eliminan en 30 días. Los datos fiscales se conservan 5 años por obligación legal.</P>
        </S>

        <S n="08" title="Sus derechos" M={M}>
          <P>Acceso, rectificación, supresión, limitación, portabilidad y oposición. Contacto: <A href="mailto:legal@kairo.es">legal@kairo.es</A>. Respuesta en máximo 30 días. Puede reclamar ante la AEPD en <A href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">www.aepd.es</A>.</P>
        </S>

        <S n="09" title="Seguridad" M={M}>
          <P>Contraseñas con hash seguro, HTTPS/TLS, Row Level Security en base de datos, rate limiting y datos de pago nunca accesibles para Kairo.</P>
        </S>

        <S n="10" title="Cookies" M={M}>
          <P>Solo cookies técnicas necesarias para la sesión. Sin cookies de seguimiento ni publicidad.</P>
        </S>

        <S n="11" title="Contacto" M={M} last>
          <P><A href="mailto:legal@kairo.es">legal@kairo.es</A></P>
        </S>
      </main>

      <LegalFooter M={M} active="privacidad" />
    </div>
  )
}

function LegalNav({ B, M, active }: { B: string; M: string; active: string }) {
  const links = [
    { href: '/legal/terminos',   label: 'Términos',   key: 'terminos'   },
    { href: '/legal/privacidad', label: 'Privacidad', key: 'privacidad' },
    { href: '/legal/reembolsos', label: 'Reembolsos', key: 'reembolsos' },
    { href: '/legal/ia',          label: 'IA',         key: 'ia'         },
    { href: '/legal/aviso-legal', label: 'Aviso',      key: 'aviso'      },
    { href: '/contacto',          label: 'Contacto',   key: 'contacto'   },
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
    { href: '/legal/ia',          label: 'Uso de IA',  key: 'ia'         },
    { href: '/legal/aviso-legal', label: 'Aviso legal',key: 'aviso'      },
    { href: '/contacto',          label: 'Contacto',   key: 'contacto'   },
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

function A({ href, children, target, rel }: { href: string; children: React.ReactNode; target?: string; rel?: string }) {
  return <a href={href} target={target} rel={rel} style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 600 }}>{children}</a>
}

const ul: React.CSSProperties = { paddingLeft: 18, margin: '0 0 12px', display: 'flex', flexDirection: 'column', gap: 8 }
const li: React.CSSProperties = { fontSize: 15, color: 'rgba(255,255,255,.6)', lineHeight: 1.75, paddingLeft: 4 }
