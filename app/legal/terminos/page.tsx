import type { Metadata } from 'next'
import Link from 'next/link'
import { Bebas_Neue, DM_Mono } from 'next/font/google'
import { LEGAL_VERSIONS } from '@/app/lib/legalVersions'

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
  description: 'Términos y Condiciones de Uso de Kairo.',
}

const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'] })
const mono  = DM_Mono({ weight: ['400', '500'], subsets: ['latin'] })

export default function TerminosPage() {
  const B = bebas.style.fontFamily
  const M = mono.style.fontFamily
  const v = LEGAL_VERSIONS.terminos

  return (
    <div style={{ background: '#111', color: '#fff', minHeight: '100dvh', fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)' }}>
      <LegalNav B={B} M={M} active="terminos" />

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px 100px' }}>
        {/* Hero */}
        <div style={{ paddingTop: 96, paddingBottom: 56, borderBottom: '1px solid rgba(255,255,255,.07)' }}>
          <p style={{ fontFamily: M, fontSize: 10, color: 'rgba(255,255,255,.3)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 16 }}>
            Última actualización: {v.label} · v{v.version}
          </p>
          <h1 style={{ fontFamily: B, fontSize: 'clamp(56px, 10vw, 100px)', lineHeight: .92, letterSpacing: '.01em', margin: 0 }}>
            TÉRMINOS Y<br />CONDICIONES
          </h1>
        </div>

        {/* Sections */}
        <S n="01" title="Información del responsable" M={M}>
          <P>El presente servicio es ofrecido por los responsables del proyecto Kairo:</P>
          <ul style={ul}>
            <li style={li}>Mario Sánchez García</li>
            <li style={li}>Alejandro Amigo Granja</li>
            <li style={li}>Marco Martínez Mira</li>
            <li style={li}>Diego García Verdugo</li>
          </ul>
          <P>Contacto: <A href="mailto:legal@kairo.es">legal@kairo.es</A></P>
        </S>

        <S n="02" title="Descripción del servicio" M={M}>
          <P>Kairo es una plataforma educativa de preparación para la PAU que ofrece exámenes oficiales con corrección mediante inteligencia artificial, simulacros de examen, plan de estudio personalizado (Camino PAU), chat educativo con asistente IA e historial de correcciones y progreso.</P>
        </S>

        <S n="03" title="Edad mínima y consentimiento parental" M={M}>
          <P>El Servicio está dirigido a estudiantes de entre 14 y 18 años. Los usuarios de 14 a 17 años deben contar con el conocimiento y consentimiento de sus padres o tutores legales. Al registrarse, el usuario declara que sus padres o tutores conocen y aceptan el uso del Servicio.</P>
        </S>

        <S n="04" title="Registro y cuenta de usuario" M={M}>
          <P>Para usar el Servicio es necesario proporcionar correo electrónico, contraseña, centro escolar, comunidad autónoma y asignaturas de preparación. El usuario es responsable de mantener la confidencialidad de sus credenciales.</P>
        </S>

        <S n="05" title="Uso del Servicio" M={M}>
          <P>El usuario se compromete a:</P>
          <ul style={ul}>
            <li style={li}>Usar el Servicio únicamente con fines educativos personales.</li>
            <li style={li}>No compartir ni distribuir los contenidos sin autorización.</li>
            <li style={li}>No intentar acceder a cuentas de otros usuarios.</li>
            <li style={li}>Proporcionar información veraz en el registro.</li>
          </ul>
        </S>

        <S n="06" title="Contenido educativo" M={M}>
          <P>Los exámenes están basados en pruebas oficiales de la PAU de acceso público. Las correcciones son generadas por inteligencia artificial y tienen carácter orientativo. Las correcciones de Kairo no garantizan ninguna nota en la PAU real.</P>
        </S>

        <S n="07" title="Planes y precios" M={M}>
          <P>Los pagos son procesados por Stripe. Kairo no almacena datos de tarjetas de crédito. Ofrecemos devolución íntegra dentro de los 7 días naturales siguientes a la compra, sin necesidad de justificar la solicitud (sujeta a la política de uso razonable frente a abuso — ver <A href="/legal/reembolsos">Política de reembolsos</A>). Para solicitar la devolución: <A href="mailto:legal@kairo.es">legal@kairo.es</A></P>
        </S>

        <S n="08" title="Derecho de desistimiento" M={M}>
          <P><strong style={{ color: 'rgba(255,255,255,.85)' }}>Derecho de desistimiento (14 días)</strong></P>
          <P>De conformidad con el Real Decreto Legislativo 1/2007 (TRLGDCU) y la Directiva 2011/83/UE, el usuario tiene derecho a desistir del contrato en un plazo de 14 días naturales desde la celebración del mismo, sin necesidad de indicar el motivo, siempre que no haya comenzado la ejecución del servicio durante ese plazo.</P>
          <P><strong style={{ color: 'rgba(255,255,255,.85)' }}>Excepción para contenido digital de acceso inmediato</strong></P>
          <P>De acuerdo con el artículo 103.m) TRLGDCU, el derecho de desistimiento <strong style={{ color: 'rgba(255,255,255,.85)' }}>no se aplicará</strong> cuando la ejecución del contrato haya comenzado, con el previo consentimiento expreso del consumidor y con el reconocimiento por su parte de que es consciente de que, una vez que el prestador haya ejecutado completamente el contrato, habrá perdido su derecho de desistimiento.</P>
          <P>En la práctica: en el momento de completar el pago, se solicita al usuario su consentimiento expreso para comenzar el acceso inmediato al Servicio y el reconocimiento de pérdida del derecho de desistimiento una vez el servicio haya sido prestado en su totalidad. Dicho consentimiento queda registrado con marca de tiempo.</P>
          <P><strong style={{ color: 'rgba(255,255,255,.85)' }}>Cómo ejercer el desistimiento</strong></P>
          <P>Si el Servicio no ha comenzado a ejecutarse y deseas ejercer el derecho de desistimiento dentro del plazo de 14 días, comunícanoslo a <A href="mailto:legal@kairo.es">legal@kairo.es</A> indicando en el asunto "Desistimiento" y aportando el número de pedido. Procederemos al reembolso íntegro en el plazo máximo de 14 días mediante el mismo medio de pago empleado.</P>
          <P>El ejercicio del derecho de desistimiento es independiente de nuestra política comercial de reembolsos, que puede ofrecer condiciones adicionales. Ver <A href="/legal/reembolsos">Política de reembolsos</A>.</P>
        </S>

        <S n="09" title="Propiedad intelectual" M={M}>
          <P>Todos los contenidos originales de Kairo son propiedad de los responsables del proyecto y están protegidos por la legislación española e internacional sobre propiedad intelectual.</P>
        </S>

        <S n="10" title="Limitación de responsabilidad" M={M}>
          <P>Kairo no garantiza la disponibilidad ininterrumpida del Servicio, que las correcciones IA sean equivalentes a las de un docente, ni resultados académicos específicos.</P>
        </S>

        <S n="11" title="Modificación de los términos" M={M}>
          <P>Kairo se reserva el derecho a modificar estos Términos. Los cambios serán notificados por correo electrónico con al menos 15 días de antelación.</P>
        </S>

        <S n="12" title="Legislación aplicable" M={M}>
          <P>Estos Términos se rigen por la legislación española. Las partes se someten a los Juzgados y Tribunales de Madrid.</P>
        </S>

        <S n="13" title="Contacto" M={M} last>
          <P><A href="mailto:legal@kairo.es">legal@kairo.es</A></P>
        </S>
      </main>

      <LegalFooter M={M} active="terminos" />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared sub-components
// ─────────────────────────────────────────────────────────────────────────────

function LegalNav({ B, M, active }: { B: string; M: string; active: string }) {
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

function A({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 600 }}>{children}</a>
}

const ul: React.CSSProperties = { paddingLeft: 18, margin: '0 0 12px', display: 'flex', flexDirection: 'column', gap: 6 }
const li: React.CSSProperties = { fontSize: 15, color: 'rgba(255,255,255,.6)', lineHeight: 1.75, paddingLeft: 4 }
