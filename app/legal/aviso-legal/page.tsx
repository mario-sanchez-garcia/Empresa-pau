import type { Metadata } from 'next'
import Link from 'next/link'
import { Bebas_Neue, DM_Mono } from 'next/font/google'
import { LEGAL_VERSIONS } from '@/app/lib/legalVersions'

export const metadata: Metadata = {
  title: 'Aviso Legal · Kairo',
  description: 'Aviso legal e información del titular del servicio Kairo, conforme a la LSSI-CE.',
}

const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'] })
const mono  = DM_Mono({ weight: ['400', '500'], subsets: ['latin'] })

export default function AvisoLegalPage() {
  const B = bebas.style.fontFamily
  const M = mono.style.fontFamily
  const v = LEGAL_VERSIONS.aviso

  return (
    <div style={{ background: '#111', color: '#fff', minHeight: '100dvh', fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)' }}>
      <LegalNav B={B} M={M} active="aviso" />

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px 100px' }}>
        {/* Hero */}
        <div style={{ paddingTop: 96, paddingBottom: 56, borderBottom: '1px solid rgba(255,255,255,.07)' }}>
          <p style={{ fontFamily: M, fontSize: 10, color: 'rgba(255,255,255,.3)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 16 }}>
            Última actualización: {v.label} · v{v.version}
          </p>
          <h1 style={{ fontFamily: B, fontSize: 'clamp(56px, 10vw, 100px)', lineHeight: .92, letterSpacing: '.01em', margin: 0 }}>
            AVISO<br />LEGAL
          </h1>
        </div>

        {/* Sections */}
        <S n="01" title="Cumplimiento de la LSSI-CE" M={M}>
          <P>En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE), se facilitan a continuación los datos identificativos del titular del sitio web y del servicio Kairo.</P>
        </S>

        <S n="02" title="Titular del servicio" M={M}>
          <P>El servicio Kairo es operado por:</P>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12 }}>
            <tbody>
              {[
                ['Nombre / Razón social', '[PENDIENTE: Nombre o razón social completa]'],
                ['NIF / CIF',             '[PENDIENTE: NIF o CIF]'],
                ['Domicilio',             '[PENDIENTE: Calle, número, CP, localidad, provincia]'],
                ['Correo de contacto',    'legal@kairo.es'],
                ['Datos registrales',     '[PENDIENTE: si es sociedad — Registro Mercantil, tomo, folio, hoja, sección]'],
              ].map(([label, value]) => (
                <tr key={label} style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                  <td style={{ padding: '10px 0', fontSize: 13, fontFamily: M, color: 'rgba(255,255,255,.35)', width: '40%', verticalAlign: 'top', paddingRight: 16 }}>{label}</td>
                  <td style={{ padding: '10px 0', fontSize: 14, color: value.startsWith('[PENDIENTE') ? '#f59e0b' : 'rgba(255,255,255,.75)', fontWeight: value.startsWith('[PENDIENTE') ? 700 : 400, lineHeight: 1.6 }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <P>Los campos marcados como <span style={{ color: '#f59e0b', fontWeight: 700 }}>[PENDIENTE]</span> deben ser cumplimentados por el titular antes de la puesta en producción del servicio con facturación a usuarios.</P>
        </S>

        <S n="03" title="Objeto del sitio web" M={M}>
          <P>Kairo es una plataforma educativa de preparación para la PAU que ofrece exámenes oficiales con corrección mediante inteligencia artificial, simulacros de examen, plan de estudio personalizado e historial de progreso, dirigida a estudiantes de bachillerato en España.</P>
          <P>El acceso y uso del sitio web atribuye la condición de usuario e implica la aceptación plena de los presentes términos, de los <A href="/legal/terminos">Términos y Condiciones</A> y de la <A href="/legal/privacidad">Política de Privacidad</A>.</P>
        </S>

        <S n="04" title="Propiedad intelectual e industrial" M={M}>
          <P>Todos los elementos del sitio web de Kairo — textos, gráficos, logotipos, iconos, imágenes, software y demás contenidos originales — son propiedad del titular del servicio o de sus legítimos licenciantes, y están protegidos por la legislación española e internacional sobre propiedad intelectual e industrial.</P>
          <P>Se prohíbe expresamente la reproducción, distribución, comunicación pública o transformación de dichos contenidos sin autorización previa por escrito del titular, salvo en los casos permitidos por la ley.</P>
        </S>

        <S n="05" title="Responsabilidad" M={M}>
          <P>El titular no se hace responsable de los daños que pudieran derivarse del uso del sitio web o de los servicios prestados a través de él, de las interrupciones del servicio por causas de fuerza mayor o por decisión técnica justificada, ni de los contenidos de terceros a los que el sitio pueda enlazar.</P>
          <P>Las correcciones generadas por inteligencia artificial tienen carácter orientativo y no constituyen un criterio oficial de corrección PAU. Para más información, consulta la <A href="/legal/ia">Política de uso de IA</A>.</P>
        </S>

        <S n="06" title="Legislación aplicable y jurisdicción" M={M}>
          <P>Este aviso legal se rige por la legislación española. Para la resolución de cualesquiera controversias derivadas del acceso o uso del sitio web, las partes se someten a los Juzgados y Tribunales competentes conforme a la normativa vigente, con renuncia expresa a cualquier otro fuero que pudiera corresponderles.</P>
        </S>

        <S n="07" title="Contacto" M={M} last>
          <P>Para cualquier consulta relacionada con este aviso legal: <A href="mailto:legal@kairo.es">legal@kairo.es</A></P>
        </S>
      </main>

      <LegalFooter M={M} active="aviso" />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared sub-components (keep in sync with other legal pages)
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
