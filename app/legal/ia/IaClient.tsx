'use client'

import { Bebas_Neue, DM_Mono } from 'next/font/google'
import { LEGAL_VERSIONS } from '@/app/lib/legalVersions'
import ClayThemeScope from '@/components/clay/ClayThemeScope'
import { ClayLegalNav, ClayLegalFooter, ClayLegalSection as S, ClayLegalP as P, ClayLegalLink as A, clayLegalUl as ul, clayLegalLi as li } from '@/components/clay/ClayLegalChrome'
import { useClayThemePreference } from '@/components/clay/useClayThemePreference'

const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'] })
const mono  = DM_Mono({ weight: ['400', '500'], subsets: ['latin'] })

export default function IaClient() {
  const B = bebas.style.fontFamily
  const M = mono.style.fontFamily
  const v = LEGAL_VERSIONS.terminos
  const { theme } = useClayThemePreference()

  return (
    <ClayThemeScope theme={theme} style={{ color: 'var(--clay-text)', minHeight: '100dvh', fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)' }}>
      <ClayLegalNav M={M} active="ia" theme={theme} />

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px 100px' }}>
        <div style={{ paddingTop: 96, paddingBottom: 56, borderBottom: '1px solid var(--clay-border)' }}>
          <p style={{ fontFamily: M, fontSize: 10, color: 'var(--clay-text-muted)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 16 }}>
            Última actualización: {v.label} · v{v.version}
          </p>
          <h1 style={{ fontFamily: B, fontSize: 'clamp(56px, 10vw, 100px)', lineHeight: .92, letterSpacing: '.01em', margin: 0 }}>
            USO DE<br />INTELIGENCIA<br />ARTIFICIAL
          </h1>
        </div>

        <S n="01" title="Qué hace la IA en Kairo" M={M}>
          <P>Kairo usa modelos de inteligencia artificial para generar correcciones de respuestas abiertas, feedback de simulacros y orientación sobre errores de estudio.</P>
        </S>

        <S n="02" title="Las correcciones son orientativas" M={M}>
          <P>Las correcciones generadas por IA son <strong style={{ color: 'var(--clay-text)' }}>orientativas</strong>. Pueden contener errores, omitir matices importantes o no reflejar exactamente los criterios de corrección oficiales de tu comunidad autónoma o de la asignatura concreta.</P>
          <P><strong style={{ color: 'var(--clay-text)' }}>Las correcciones IA no son una calificación oficial</strong> ni un indicador definitivo de tu nivel. Úsalas para identificar áreas de mejora, no como verdad absoluta.</P>
        </S>

        <S n="03" title="Qué hacer si la corrección parece incorrecta" M={M}>
          <ul style={ul}>
            <li style={li}>Contrasta con tu libro de texto, apuntes o profesor.</li>
            <li style={li}>Revisa los criterios oficiales de corrección publicados por tu comunidad autónoma.</li>
            <li style={li}>Si detectas un error claro, puedes reportarlo en <A href="mailto:hola@kairo.es">hola@kairo.es</A>.</li>
          </ul>
        </S>

        <S n="04" title="Datos que procesa la IA" M={M}>
          <P>El texto de tus respuestas se envía a modelos de IA para generar feedback. <strong style={{ color: 'var(--clay-text)' }}>No incluyas datos personales innecesarios</strong> (nombre completo, DNI, datos médicos, información de terceros) en tus respuestas.</P>
          <P>Consulta nuestra <A href="/legal/privacidad">política de privacidad</A> para más información sobre cómo usamos y almacenamos los datos.</P>
        </S>

        <S n="05" title="Límites de uso razonable" M={M}>
          <P>Para proteger la calidad del servicio y los costes operativos, puede haber límites en el número de correcciones o simulacros disponibles según el plan. Kairo muestra un aviso cuando se alcanzan estos límites. Si tienes el Pack Curso PAU activo, los límites están ampliados para un uso normal de estudio diario.</P>
        </S>

        <S n="06" title="Mejora continua" M={M} last>
          <P>Durante la beta privada estamos calibrando y mejorando las correcciones. Tu feedback es valioso: si una corrección no te parece útil o correcta, escríbenos a <A href="mailto:hola@kairo.es">hola@kairo.es</A>.</P>
        </S>
      </main>

      <ClayLegalFooter M={M} active="ia" />
    </ClayThemeScope>
  )
}
