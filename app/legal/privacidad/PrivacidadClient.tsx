'use client'

import { Bebas_Neue, DM_Mono } from 'next/font/google'
import { LEGAL_VERSIONS } from '@/app/lib/legalVersions'
import CookiePreferencesButton from './CookiePreferencesButton'
import ClayThemeScope from '@/components/clay/ClayThemeScope'
import { ClayLegalNav, ClayLegalFooter, ClayLegalSection as S, ClayLegalP as P, ClayLegalLink as A, clayLegalUl as ul, clayLegalLi as li } from '@/components/clay/ClayLegalChrome'
import { useClayThemePreference } from '@/components/clay/useClayThemePreference'

const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'] })
const mono  = DM_Mono({ weight: ['400', '500'], subsets: ['latin'] })

export default function PrivacidadClient() {
  const B = bebas.style.fontFamily
  const M = mono.style.fontFamily
  const v = LEGAL_VERSIONS.privacidad
  const { theme } = useClayThemePreference()

  return (
    <ClayThemeScope theme={theme} style={{ color: 'var(--clay-text)', minHeight: '100dvh', fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)' }}>
      <ClayLegalNav M={M} active="privacidad" theme={theme} />

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px 100px' }}>
        <div style={{ paddingTop: 96, paddingBottom: 56, borderBottom: '1px solid var(--clay-border)' }}>
          <p style={{ fontFamily: M, fontSize: 10, color: 'var(--clay-text-muted)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 16 }}>
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
            <li style={li}><strong style={{ color: 'var(--clay-text)' }}>Datos de registro:</strong> correo electrónico, contraseña cifrada, centro escolar, comunidad autónoma y asignaturas.</li>
            <li style={li}><strong style={{ color: 'var(--clay-text)' }}>Datos de uso:</strong> respuestas a ejercicios, correcciones IA, historial de progreso, XP y misiones completadas.</li>
            <li style={li}><strong style={{ color: 'var(--clay-text)' }}>Datos de pago:</strong> correo del padre/madre/tutor que paga. Los datos de tarjeta son procesados por Stripe y nunca son accesibles para Kairo.</li>
            <li style={li}><strong style={{ color: 'var(--clay-text)' }}>Datos técnicos:</strong> dirección IP para prevención de abuso.</li>
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
            <li style={li}><strong style={{ color: 'var(--clay-text)' }}>Supabase</strong> — base de datos, UE.</li>
            <li style={li}><strong style={{ color: 'var(--clay-text)' }}>Anthropic</strong> — API de IA, procesamiento puntual sin almacenamiento.</li>
            <li style={li}><strong style={{ color: 'var(--clay-text)' }}>Stripe</strong> — pagos.</li>
            <li style={li}><strong style={{ color: 'var(--clay-text)' }}>Vercel</strong> — hosting.</li>
            <li style={li}><strong style={{ color: 'var(--clay-text)' }}>PostHog</strong> — analítica de producto, UE, solo con su consentimiento (ver sección 10).</li>
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
          <ul style={ul}>
            <li style={li}><strong style={{ color: 'var(--clay-text)' }}>Cookies técnicas:</strong> necesarias para mantener su sesión iniciada. No requieren consentimiento (Art. 5.3 LSSI).</li>
            <li style={li}><strong style={{ color: 'var(--clay-text)' }}>Cookies analíticas (PostHog):</strong> nos ayudan a entender cómo se usa Kairo para mejorarlo. Solo se activan si acepta el banner de cookies al entrar; puede rechazarlas o retirar su consentimiento cuando quiera.</li>
          </ul>
          <P>No usamos cookies de publicidad ni las compartimos con terceros con fines comerciales.</P>
          <P><CookiePreferencesButton /></P>
        </S>

        <S n="11" title="Contacto" M={M} last>
          <P><A href="mailto:legal@kairo.es">legal@kairo.es</A></P>
        </S>
      </main>

      <ClayLegalFooter M={M} active="privacidad" />
    </ClayThemeScope>
  )
}
