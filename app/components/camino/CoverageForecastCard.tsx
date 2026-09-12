'use client'
import type { CoverageForecast } from '@/app/lib/camino/coverageForecast'

const labels: Record<string, string> = { matematicas_ii: 'Matemáticas II', matematicas_ccss: 'Matemáticas CCSS',
  fisica: 'Física', quimica: 'Química', lengua: 'Lengua', historia_espana: 'Historia de España',
  historia_filosofia: 'Historia de la Filosofía', biologia: 'Biología', ingles: 'Inglés', economia: 'Economía' }
const hours = (minutes: number) => `${(minutes / 60).toLocaleString('es-ES', { maximumFractionDigits: 1 })} h`
export default function CoverageForecastCard({ forecast }: { forecast: CoverageForecast }) {
  const known = forecast.scheduledMinutes + forecast.pendingMinutes
  // minWidth: 0 no es decorativo. Como hijo de un grid, esta tarjeta hereda
  // min-width: auto y no puede encoger por debajo del ancho intrínseco de la
  // tabla (que va con nowrap a propósito, para que los números no se partan).
  // Sin esto, el overflow-x del contenedor de la tabla no llega a activarse y
  // es la PÁGINA la que se desplaza en horizontal a 390 px.
  return <section aria-label="Previsión de tu Camino" style={{ minWidth: 0, border: '1px solid var(--clay-border, #d1d5db)', borderRadius: 14, padding: 16, background: 'var(--clay-surface, #fff)', color: 'var(--clay-text, #111827)' }}>
    <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>¿Qué cabe antes de tu PAU?</h3>
    <p style={{ fontSize: 13, margin: '0 0 12px' }}>
      {forecast.missingSubjects.length > 0 ? 'La previsión está incompleta: faltan datos de algunas asignaturas.'
        : known === 0 ? 'Todavía no hay trabajo registrado para estimar tu carga.'
        : forecast.atRiskMinutes > 0 ? `Hay ${hours(forecast.atRiskMinutes)} de trabajo en riesgo de quedarse fuera con tu disponibilidad actual.`
        : 'El trabajo registrado cabe en esta estimación. El resultado depende de tu ritmo y de mantener la disponibilidad.'}
    </p>
    <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, margin: 0, fontSize: 13 }}>
      {[
        ['Capacidad restante', hours(forecast.totalCapacityMinutes)],
        ['Trabajo ya programado', hours(forecast.scheduledMinutes)],
        ['Trabajo pendiente de colocar', hours(forecast.pendingMinutes)],
        ['Pendiente que prevemos que cabe', hours(forecast.projectedPendingMinutes)],
      ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd style={{ margin: '3px 0 0', fontWeight: 800 }}>{value}</dd></div>)}
    </dl>
    <details style={{ marginTop: 14, fontSize: 13 }}>
      <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Ver reparto por asignatura y supuestos</summary>
      <div style={{ overflowX: 'auto', marginTop: 10 }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', whiteSpace: 'nowrap' }}>
          <thead><tr>{['Asignatura', 'Programado', 'Pendiente', 'En riesgo'].map(label => <th key={label} style={{ padding: 6 }}>{label}</th>)}</tr></thead>
          <tbody>{forecast.subjects.map(row => <tr key={row.subject}>
            <th scope="row" style={{ padding: 6 }}>{labels[row.subject] ?? row.subject}</th>
            <td style={{ padding: 6 }}>{hours(row.scheduledMinutes)}</td><td style={{ padding: 6 }}>{hours(row.pendingMinutes)}</td><td style={{ padding: 6 }}>{hours(row.atRiskMinutes)}</td>
          </tr>)}</tbody>
        </table>
      </div>
      <p>De lo programado, {hours(forecast.reservedActivityMinutes)} corresponden a repaso, práctica y parciales; ya están incluidas, no se suman otra vez. La ventana final reserva {hours(forecast.finalReviewCapacityMinutes)} de capacidad para repaso y práctica.</p>
      <p>Calculado con {forecast.dailyMinutes} minutos al día y {forecast.weeklyStudyDays ?? 5} días por semana hasta {forecast.examDate.split('-').reverse().join('/')}. Respeta festivos, eventos de tu agenda de Kairo y los plazos de las misiones. Los huecos demasiado cortos no cuentan como una sesión completa.</p>
      <p>Estimaciones del trabajo registrado, todavía sin calibrar por contenido. No incluye ocupaciones externas de Google Calendar, futuras ausencias ni parciales o repasos que aún no se hayan añadido. No garantiza una nota ni el dominio de toda la asignatura.</p>
      {forecast.missingSubjects.length > 0 && <p>Sin datos: {forecast.missingSubjects.map(name => labels[name] ?? name).join(', ')}.</p>}
    </details>
    {forecast.atRiskMinutes > 0 && <p style={{ fontSize: 13, marginBottom: 0 }}>Revisa tus minutos o días disponibles y las misiones en conflicto. <a href="/settings">Ajustar disponibilidad</a></p>}
  </section>
}
