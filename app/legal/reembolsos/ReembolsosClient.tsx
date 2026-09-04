'use client'

import { Bebas_Neue, DM_Mono } from 'next/font/google'
import { LEGAL_VERSIONS } from '@/app/lib/legalVersions'
import ClayThemeScope from '@/components/clay/ClayThemeScope'
import { ClayLegalNav, ClayLegalFooter, ClayLegalSection as S, ClayLegalP as P, ClayLegalLink as A, clayLegalUl as ul, clayLegalLi as li } from '@/components/clay/ClayLegalChrome'
import { useClayThemePreference } from '@/components/clay/useClayThemePreference'

const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'] })
const mono  = DM_Mono({ weight: ['400', '500'], subsets: ['latin'] })

export default function ReembolsosClient() {
  const B = bebas.style.fontFamily
  const M = mono.style.fontFamily
  const v = LEGAL_VERSIONS.terminos
  const { theme } = useClayThemePreference()

  return (
    <ClayThemeScope theme={theme} style={{ color: 'var(--clay-text)', minHeight: '100dvh', fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)' }}>
      <ClayLegalNav M={M} active="reembolsos" theme={theme} />

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px 100px' }}>
        <div style={{ paddingTop: 96, paddingBottom: 56, borderBottom: '1px solid var(--clay-border)' }}>
          <p style={{ fontFamily: M, fontSize: 10, color: 'var(--clay-text-muted)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 16 }}>
            Última actualización: {v.label} · v{v.version}
          </p>
          <h1 style={{ fontFamily: B, fontSize: 'clamp(56px, 10vw, 100px)', lineHeight: .92, letterSpacing: '.01em', margin: 0 }}>
            POLÍTICA DE<br />REEMBOLSOS
          </h1>
        </div>

        <S n="01" title="Pack Curso PAU — garantía de 7 días" M={M}>
          <P>Si adquiriste el <strong style={{ color: 'var(--clay-text)' }}>Pack Curso PAU</strong> y no estás satisfecho, puedes solicitar un reembolso completo dentro de los <strong style={{ color: 'var(--clay-text)' }}>7 días naturales</strong> desde la fecha de pago.</P>
          <P>Esta garantía existe para que puedas probar Kairo sin riesgo. No necesitas justificar la solicitud.</P>
        </S>

        <S n="02" title="Cómo solicitar el reembolso" M={M}>
          <P>Envía un email a <A href="mailto:hola@kairo.es">hola@kairo.es</A> con el asunto <em style={{ color: 'var(--clay-text-muted)' }}>&quot;Solicitud de reembolso&quot;</em> e indica:</P>
          <ul style={ul}>
            <li style={li}>El email con el que compraste (o el email del alumno si eres padre/madre).</li>
            <li style={li}>La fecha aproximada del pago.</li>
          </ul>
          <P>El equipo gestionará la devolución vía Stripe. El reembolso puede tardar 5–10 días hábiles en aparecer en tu cuenta según tu banco.</P>
        </S>

        <S n="03" title="Pagos procesados por Stripe" M={M}>
          <P>Todos los pagos son procesados por <strong style={{ color: 'var(--clay-text)' }}>Stripe</strong>, plataforma de pagos certificada PCI-DSS. Kairo no almacena datos de tarjeta. El reembolso se realiza a la misma tarjeta o método de pago original.</P>
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

      <ClayLegalFooter M={M} active="reembolsos" />
    </ClayThemeScope>
  )
}
