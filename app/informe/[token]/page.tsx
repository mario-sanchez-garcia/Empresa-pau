import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import { verifyInformeToken, isTokenExpired } from '@/app/lib/informe/token'
import { computeWeeklyReport, type WeeklyReport } from '@/app/lib/informe/computeWeeklyReport'

export const dynamic = 'force-dynamic'

// In Next.js App Router (v15+), params is a Promise — must be awaited.
interface Props {
  params: Promise<{ token: string }>
}

export const metadata: Metadata = {
  title: 'Informe semanal · Pausia',
  robots: { index: false, follow: false },
}

function createServiceDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

async function checkPremium(db: ReturnType<typeof createServiceDb>, userId: string): Promise<boolean> {
  if (!db) return false
  const now = new Date().toISOString()
  const { data } = await db
    .from('user_entitlements')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .limit(1)
  return (data?.length ?? 0) > 0
}

function formatDate(iso: string): string {
  return new Date(iso + 'T12:00:00Z').toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function gradeColor(nota: number): string {
  if (nota >= 7) return '#15803d'
  if (nota >= 5) return '#b45309'
  return '#be123c'
}

function gradeBar(nota: number): string {
  if (nota >= 7) return '#16a34a'
  if (nota >= 5) return '#d97706'
  return '#e11d48'
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
        <title>Informe semanal · Pausia</title>
      </head>
      <body style={{ margin: 0, padding: 0, background: '#f4f7fb', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a' }}>
        {children}
      </body>
    </html>
  )
}

function ErrorPage({ title, body }: { title: string; body: string }) {
  return (
    <Layout>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        <div style={{ width: '100%', maxWidth: 440, background: '#fff', borderRadius: 24, padding: 32, boxShadow: '0 4px 24px rgba(37,99,235,0.08)', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, background: '#fff1f2', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, fontSize: 24 }}>⏰</div>
          <h1 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 900, color: '#0f172a' }}>{title}</h1>
          <p style={{ margin: '0 0 24px', fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{body}</p>
          <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>Puedes pedir al alumno que comparta un enlace nuevo desde su cuenta de Pausia.</p>
        </div>
      </div>
    </Layout>
  )
}

function ReportPage({ report, isPremium, appUrl }: { report: WeeklyReport; isPremium: boolean; appUrl: string }) {
  const weekLabel = `${formatDate(report.weekStart)} – ${formatDate(report.weekEnd)}`

  return (
    <Layout>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '24px 16px 48px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, background: '#2563eb', borderRadius: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: 16, fontWeight: 900 }}>P</span>
            </div>
            <span style={{ fontSize: 17, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>Pausia</span>
          </div>
          <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em', color: '#0f172a' }}>
            Informe semanal de {report.firstName}
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>{weekLabel}</p>
        </div>

        {/* Key stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Misiones', value: String(report.missionsCompleted), icon: '✅' },
            { label: 'Racha', value: `${report.streakDays}d`, icon: '🔥' },
            { label: 'Simulacros', value: String(report.simulacrosCount), icon: '📝' },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#fff', borderRadius: 16, padding: '14px 10px', textAlign: 'center', boxShadow: '0 2px 8px rgba(37,99,235,0.06)' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{stat.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>{stat.value}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Subject projections */}
        {report.subjects.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 20, padding: 20, marginBottom: 16, boxShadow: '0 2px 8px rgba(37,99,235,0.06)' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Nota proyectada PAU</h2>
            <div style={{ display: 'grid', gap: 14 }}>
              {report.subjects.map(s => {
                const nota = s.projection
                const color = nota !== null && s.confidence !== 'low' ? gradeColor(nota) : '#64748b'
                const bar = nota !== null && s.confidence !== 'low' ? gradeBar(nota) : '#cbd5e1'
                const pct = nota !== null ? Math.min(100, (nota / 10) * 100) : 0
                return (
                  <div key={s.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{s.name}</span>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                        {s.confidence === 'low' ? (
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Aún con pocos datos</span>
                        ) : nota !== null ? (
                          <>
                            <span style={{ fontSize: 18, fontWeight: 900, color }}>{nota.toFixed(1)}</span>
                            <span style={{ fontSize: 12, color: '#94a3b8' }}>/10</span>
                            {s.trend7d !== null && Math.abs(s.trend7d) >= 0.1 && (
                              <span style={{ fontSize: 12, fontWeight: 800, color: s.trend7d > 0 ? '#16a34a' : '#dc2626' }}>
                                {s.trend7d > 0 ? '▲' : '▼'} {s.trend7d > 0 ? '+' : ''}{s.trend7d.toFixed(1)}
                              </span>
                            )}
                          </>
                        ) : null}
                      </div>
                    </div>
                    <div style={{ height: 6, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: bar, borderRadius: 99, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                )
              })}
            </div>
            <p style={{ margin: '14px 0 0', fontSize: 11, color: '#94a3b8' }}>
              Proyección basada en correcciones IA · se actualiza con cada práctica
            </p>
          </div>
        )}

        {/* Best block */}
        {report.bestBlock && (
          <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)', border: '1px solid #bfdbfe', borderRadius: 20, padding: 20, marginBottom: 16 }}>
            <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 900, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Punto fuerte esta semana</p>
            <p style={{ margin: '0 0 2px', fontSize: 18, fontWeight: 900, color: '#0f172a' }}>{report.bestBlock.block}</p>
            <p style={{ margin: 0, fontSize: 13, color: '#475569' }}>
              {report.bestBlock.subject} · {report.bestBlock.nota.toFixed(1)}/10
            </p>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
          {isPremium ? (
            <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>
              Informe generado por <strong style={{ color: '#2563eb' }}>Pausia</strong> · Preparación PAU
            </p>
          ) : (
            <div>
              <p style={{ margin: '0 0 12px', fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                ¿Quieres apoyar su preparación con correcciones IA ilimitadas y simulacros completos?
              </p>
              <a
                href={`${appUrl}/pricing`}
                style={{
                  display: 'inline-block', background: '#2563eb', color: '#fff',
                  fontSize: 14, fontWeight: 800, textDecoration: 'none',
                  padding: '12px 24px', borderRadius: 14, letterSpacing: '-0.01em',
                }}
              >
                Conoce el Pack Curso PAU →
              </a>
              <p style={{ margin: '12px 0 0', fontSize: 11, color: '#94a3b8' }}>
                Generado por <strong>Pausia</strong>
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default async function InformePage({ params }: Props) {
  const { token } = await params

  const payload = verifyInformeToken(token)
  if (!payload) {
    return <ErrorPage title="Enlace inválido" body="Este enlace no es válido o ha sido modificado." />
  }

  if (isTokenExpired(payload.weekStart)) {
    return <ErrorPage title="Enlace caducado" body="Este informe tiene más de 30 días y ya no está disponible." />
  }

  const db = createServiceDb()
  if (!db) {
    return <ErrorPage title="Error temporal" body="No podemos cargar el informe ahora mismo. Inténtalo de nuevo en unos minutos." />
  }

  const [report, isPremium] = await Promise.all([
    computeWeeklyReport(payload.userId, db),
    checkPremium(db, payload.userId),
  ])

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://empresa-pau.vercel.app'

  return <ReportPage report={report} isPremium={isPremium} appUrl={appUrl} />
}
