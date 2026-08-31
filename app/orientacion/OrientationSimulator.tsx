'use client'

import { useMemo, useState } from 'react'
import { ArrowRight, Check, ChevronDown, Compass, Info, RotateCcw, Sparkles, Target, X } from 'lucide-react'
import SidebarNav from '@/app/components/SidebarNav'
import { calculateAdmissionScore, ORIENTATION_FIXTURES, type AdmissionSubject } from './data'
import styles from './orientation.module.css'

const formatGrade = (value: number) => value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const clamp = (value: number) => Math.min(10, Math.max(0, value))

type GradeControlProps = {
  id: string
  label: string
  value: number
  onChange: (value: number) => void
  hint?: string
}

function GradeControl({ id, label, value, onChange, hint }: GradeControlProps) {
  return (
    <div className={styles.gradeControl}>
      <div className={styles.controlHeading}>
        <div>
          <label htmlFor={`${id}-range`}>{label}</label>
          {hint && <span>{hint}</span>}
        </div>
        <div className={styles.numberWrap}>
          <input
            id={`${id}-number`}
            aria-label={`${label}, nota numérica`}
            type="number"
            min="0"
            max="10"
            step="0.05"
            value={value}
            onChange={event => onChange(clamp(Number(event.target.value)))}
          />
          <span>/ 10</span>
        </div>
      </div>
      <input
        id={`${id}-range`}
        aria-label={label}
        className={styles.range}
        type="range"
        min="0"
        max="10"
        step="0.05"
        value={value}
        style={{ '--range-progress': `${value * 10}%` } as React.CSSProperties}
        onChange={event => onChange(Number(event.target.value))}
      />
    </div>
  )
}

export default function OrientationSimulator() {
  const [targetId, setTargetId] = useState('')
  const [bachillerato, setBachillerato] = useState(8.2)
  const [accessPhase, setAccessPhase] = useState(7.8)
  const [subjects, setSubjects] = useState<AdmissionSubject[]>([])
  const [showMethod, setShowMethod] = useState(false)
  const [activeTab, setActiveTab] = useState('objetivo')

  const target = ORIENTATION_FIXTURES.find(item => item.id === targetId) ?? null
  const score = useMemo(
    () => calculateAdmissionScore(bachillerato, accessPhase, subjects),
    [bachillerato, accessPhase, subjects],
  )
  const difference = target ? score - target.referenceScore : 0

  function selectTarget(id: string) {
    const nextTarget = ORIENTATION_FIXTURES.find(item => item.id === id)
    setTargetId(id)
    setSubjects(nextTarget?.subjects.map(subject => ({ ...subject })) ?? [])
  }

  function updateSubject(id: string, patch: Partial<AdmissionSubject>) {
    setSubjects(current => current.map(subject => subject.id === id ? { ...subject, ...patch } : subject))
  }

  function resetScenario() {
    setBachillerato(8.2)
    setAccessPhase(7.8)
    setSubjects(target?.subjects.map(subject => ({ ...subject })) ?? [])
  }

  const recommendations = subjects
    .filter(subject => subject.enabled && subject.defaultGrade < 10)
    .sort((a, b) => b.weighting - a.weighting || a.defaultGrade - b.defaultGrade)
    .slice(0, 2)
    .map(subject => {
      const nextGrade = Math.min(10, subject.defaultGrade + 1)
      return { ...subject, nextGrade, gain: (nextGrade - subject.defaultGrade) * subject.weighting }
    })

  return (
    <div className={styles.appShell}>
      <SidebarNav />
      <main className={styles.page}>
        <header className={styles.header}>
          <div>
            <div className={styles.eyebrow}><Compass size={14} /> Orientación</div>
            <h1>Mi objetivo</h1>
            <p>Ajusta tus notas y descubre qué necesitas para entrar donde quieres.</p>
          </div>
          <button className={styles.methodButton} onClick={() => setShowMethod(true)}><Info size={17} /> ¿Cómo se calcula?</button>
        </header>

        <nav className={styles.tabs} aria-label="Secciones de Orientación">
          {[
            ['objetivo', 'Mi objetivo'], ['calculadora', 'Calculadora'], ['universidades', 'Universidades'], ['correccion', 'Cómo se corrige'],
          ].map(([id, label]) => (
            <button key={id} aria-current={activeTab === id ? 'page' : undefined} onClick={() => setActiveTab(id)}>{label}</button>
          ))}
          <button disabled title="Próximamente">Mis puntos</button>
        </nav>

        {activeTab !== 'objetivo' && activeTab !== 'calculadora' ? (
          <section className={styles.preparedState}>
            <Sparkles size={24} />
            <h2>{activeTab === 'universidades' ? 'Universidades' : 'Cómo se corrige'}</h2>
            <p>Esta sección queda preparada para incorporar datos y documentos oficiales verificados en la Fase 2.</p>
            {activeTab === 'correccion' && <div className={styles.officialPreview}><b>OFICIAL</b><span>Fuente, comunidad y curso académico siempre visibles.</span><b>EN LA PRÁCTICA</b><span>Explicación clara de Kairo, separada del texto oficial.</span></div>}
          </section>
        ) : (
          <>
            <section className={styles.targetPicker}>
              <div className={styles.pickerTitle}><Target size={19} /><div><b>Elige tu objetivo</b><span>Empieza por una carrera y universidad.</span></div></div>
              <label>
                Carrera + universidad
                <span className={styles.selectWrap}>
                  <select value={targetId} onChange={event => selectTarget(event.target.value)}>
                    <option value="">Selecciona una opción</option>
                    {ORIENTATION_FIXTURES.map(item => <option key={item.id} value={item.id}>{item.degree} · {item.university}</option>)}
                  </select>
                  <ChevronDown size={17} aria-hidden="true" />
                </span>
              </label>
              <div className={styles.fixtureBadge}>Datos de demostración · no oficiales</div>
            </section>

            {!target ? (
              <section className={styles.emptyState}>
                <div><Target size={29} /></div>
                <h2>Elige una carrera para empezar a simular.</h2>
                <p>Verás tu estimación, la distancia al objetivo y qué cambios tienen más impacto.</p>
              </section>
            ) : (
              <div className={styles.simulatorGrid}>
                <section className={styles.controlsPanel}>
                  <div className={styles.sectionHeading}><div><span>Tu escenario</span><h2>Ajusta tus notas</h2></div><button onClick={resetScenario}><RotateCcw size={15} /> Restablecer</button></div>
                  <GradeControl id="bachillerato" label="Nota media Bachillerato" hint="60% de la fase de acceso" value={bachillerato} onChange={setBachillerato} />
                  <GradeControl id="fase-acceso" label="Fase de acceso PAU" hint="40% de la fase de acceso" value={accessPhase} onChange={setAccessPhase} />
                  <div className={styles.subjectsHeading}><div><b>Materias de admisión</b><span>Se toman las dos aportaciones activas más altas.</span></div></div>
                  {subjects.map(subject => (
                    <div className={`${styles.subjectRow} ${!subject.enabled ? styles.disabledSubject : ''}`} key={subject.id}>
                      <div className={styles.subjectMeta}>
                        <button
                          role="switch"
                          aria-checked={subject.enabled}
                          aria-label={`${subject.enabled ? 'Desactivar' : 'Activar'} ${subject.name}`}
                          className={styles.toggle}
                          onClick={() => updateSubject(subject.id, { enabled: !subject.enabled })}
                        ><span><Check size={12} /></span></button>
                        <div><b>{subject.name}</b><span>Ponderación ×{subject.weighting.toLocaleString('es-ES')}</span></div>
                      </div>
                      <GradeControl id={`subject-${subject.id}`} label={`Nota de ${subject.name}`} value={subject.defaultGrade} onChange={value => updateSubject(subject.id, { defaultGrade: value })} />
                    </div>
                  ))}
                </section>

                <aside className={styles.resultPanel} aria-live="polite">
                  <div className={styles.resultTitle}><span>Tu resultado en tiempo real</span><div className={styles.liveDot} /> En vivo</div>
                  <div className={styles.scoreComparison}>
                    <div><span>Nota de referencia</span><b>{formatGrade(target.referenceScore)}</b><small>Demostración</small></div>
                    <div className={styles.primaryScore}><span>Tu nota estimada</span><b>{formatGrade(score)} <small>/ 14</small></b><small>Estimación del escenario</small></div>
                  </div>
                  <div className={styles.goalChart} aria-label={`Tu nota estimada es ${formatGrade(score)} sobre 14; referencia ${formatGrade(target.referenceScore)}`}>
                    <div className={styles.chartLabels}><span>5</span><span>14</span></div>
                    <div className={styles.track}>
                      <div className={styles.trackFill} style={{ width: `${Math.max(0, Math.min(100, ((score - 5) / 9) * 100))}%` }} />
                      <div className={`${styles.marker} ${styles.yourMarker}`} style={{ left: `${Math.max(0, Math.min(100, ((score - 5) / 9) * 100))}%` }}><span>Tu nota</span></div>
                      <div className={`${styles.marker} ${styles.targetMarker}`} style={{ left: `${Math.max(0, Math.min(100, ((target.referenceScore - 5) / 9) * 100))}%` }}><span>Referencia</span></div>
                    </div>
                  </div>
                  <div className={`${styles.status} ${difference >= 0 ? styles.positive : ''}`}>
                    {difference >= 0 ? <Check size={19} /> : <Target size={19} />}
                    <div><b>{difference >= 0 ? `Superas la referencia en +${formatGrade(difference)}.` : `Te faltan +${formatGrade(Math.abs(difference))} para alcanzar la referencia.`}</b><span>Es una simulación, no una garantía de admisión.</span></div>
                  </div>
                  <div className={styles.recommendations}>
                    <div><span>¿Cómo puedes acercarte?</span><Sparkles size={17} /></div>
                    {recommendations.length ? recommendations.map(item => (
                      <div className={styles.recommendation} key={item.id}><div><b>{item.name}</b><span>{formatGrade(item.defaultGrade)} → {formatGrade(item.nextGrade)}</span></div><strong>+{formatGrade(item.gain)}</strong></div>
                    )) : <p>Activa o ajusta una materia para comparar escenarios.</p>}
                  </div>
                  <a className={`${styles.caminoCta} kairo-clay-action`} href="/camino"><span><small>Siguiente paso</small>Adaptar mi Camino a este objetivo</span><ArrowRight size={20} /></a>
                  <p className={styles.integrationNote}>La integración profunda con Camino y el guardado del objetivo llegarán en la Fase 2.</p>
                </aside>
              </div>
            )}
          </>
        )}
      </main>

      {showMethod && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={event => event.target === event.currentTarget && setShowMethod(false)}>
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="method-title">
            <button className={styles.closeButton} aria-label="Cerrar" onClick={() => setShowMethod(false)}><X size={19} /></button>
            <div className={styles.modalIcon}><Info size={22} /></div>
            <h2 id="method-title">¿Cómo se calcula?</h2>
            <p>Esta V1 aplica una fórmula general de simulación. Las reglas oficiales deberán resolverse por comunidad, año, universidad y grado.</p>
            <div className={styles.formula}>
              <div><b>60%</b><span>Bachillerato</span></div><i>+</i><div><b>40%</b><span>Fase de acceso</span></div><i>+</i><div><b>Hasta 4</b><span>Dos mejores ponderadas</span></div>
            </div>
            <div className={styles.modalNotice}><Info size={17} /><span>Los objetivos y ponderaciones visibles ahora son fixtures de demostración, no fuentes oficiales.</span></div>
          </section>
        </div>
      )}
    </div>
  )
}
