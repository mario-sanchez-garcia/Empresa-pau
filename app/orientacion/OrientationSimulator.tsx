'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowRight, Check, ChevronDown, Compass, ExternalLink, Info, RefreshCw, RotateCcw, Search, Sparkles, Target, X } from 'lucide-react'
import SidebarNav from '@/app/components/SidebarNav'
import { supabase } from '@/app/lib/supabase'
import { calculateAdmissionScore, getTargetDifference } from './calculation'
import { ORIENTATION_FIXTURES, type AdmissionSubject, type OfficialCriterion, type OrientationTarget, type SavedOrientationTarget } from './data'
import OfficialCriterionCard from './OfficialCriterionCard'
import OpportunitiesExplorer from './OpportunitiesExplorer'
import styles from './orientation.module.css'

const formatGrade = (value: number) => value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const clamp = (value: number) => Math.min(10, Math.max(0, value))

function GradeControl({ id, label, value, onChange, hint, disabled = false }: {
  id: string; label: string; value: number; onChange: (value: number) => void; hint?: string; disabled?: boolean
}) {
  return (
    <div className={styles.gradeControl}>
      <div className={styles.controlHeading}>
        <div><label htmlFor={id + '-range'}>{label}</label>{hint && <span>{hint}</span>}</div>
        <div className={styles.numberWrap}>
          <input id={id + '-number'} aria-label={label + ', nota numérica'} type="number" min="0" max="10" step="0.05" value={value} disabled={disabled} onChange={event => onChange(clamp(Number(event.target.value)))} />
          <span>/ 10</span>
        </div>
      </div>
      <input id={id + '-range'} aria-label={label} className={styles.range} type="range" min="0" max="10" step="0.05" value={value} disabled={disabled} style={{ '--range-progress': String(value * 10) + '%' } as React.CSSProperties} onChange={event => onChange(Number(event.target.value))} />
    </div>
  )
}

function EmptyVerifiedData({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className={styles.verifiedEmpty}>
      <Target size={25} />
      <h3>Todavía no tenemos datos verificados para esta combinación.</h3>
      <p>Solo publicaremos información con una fuente oficial trazable.</p>
      {onRetry && <button onClick={onRetry}><RefreshCw size={14} /> Reintentar</button>}
    </div>
  )
}

export default function OrientationSimulator() {
  const [officialTargets, setOfficialTargets] = useState<OrientationTarget[]>([])
  const [criteria, setCriteria] = useState<OfficialCriterion[]>([])
  const [savedTarget, setSavedTarget] = useState<SavedOrientationTarget | null>(null)
  const [targetId, setTargetId] = useState('')
  const [bachillerato, setBachillerato] = useState(8.2)
  const [accessPhase, setAccessPhase] = useState(7.8)
  const [subjects, setSubjects] = useState<AdmissionSubject[]>([])
  const [showMethod, setShowMethod] = useState(false)
  const [activeTab, setActiveTab] = useState('objetivo')
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [catalogAvailable, setCatalogAvailable] = useState<boolean | null>(null)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'error'>('idle')
  const [search, setSearch] = useState('')

  const targets = useMemo(() => [...officialTargets, ...ORIENTATION_FIXTURES], [officialTargets])
  const target = targets.find(item => item.id === targetId) ?? null
  const score = useMemo(() => calculateAdmissionScore(bachillerato, accessPhase, subjects), [bachillerato, accessPhase, subjects])
  const difference = target ? getTargetDifference(score, target.referenceScore) : 0

  function selectTarget(id: string, availableTargets = targets) {
    const nextTarget = availableTargets.find(item => item.id === id)
    setTargetId(id)
    setSubjects(nextTarget?.subjects.map(subject => ({ ...subject })) ?? [])
    setSaveState('idle')
  }

  const loadOrientation = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getSession()
      const headers: HeadersInit = data.session ? { Authorization: 'Bearer ' + data.session.access_token } : {}
      const response = await fetch('/api/orientation', { headers })
      if (!response.ok) throw new Error('orientation-api')
      const payload = await response.json() as { targets?: OrientationTarget[]; criteria?: OfficialCriterion[]; savedTarget?: SavedOrientationTarget | null; catalogAvailable?: boolean }
      const realTargets = payload.targets ?? []
      const allTargets = [...realTargets, ...ORIENTATION_FIXTURES]
      setOfficialTargets(realTargets)
      setCriteria(payload.criteria ?? [])
      setSavedTarget(payload.savedTarget ?? null)
      setCatalogAvailable(payload.catalogAvailable ?? true)
      if (payload.savedTarget) {
        const match = allTargets.find(item => item.degree === payload.savedTarget?.degree && item.university === payload.savedTarget?.university && item.source.type === payload.savedTarget?.sourceType)
        if (match) {
          setTargetId(match.id)
          setSubjects(match.subjects.map(subject => ({ ...subject })))
        }
      }
      setLoadState('ready')
    } catch {
      setOfficialTargets([])
      setCriteria([])
      setCatalogAvailable(false)
      setLoadState('error')
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadOrientation() }, 0)
    return () => window.clearTimeout(timer)
  }, [loadOrientation])
  useEffect(() => {
    if (!showMethod) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setShowMethod(false) }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [showMethod])

  function updateSubject(id: string, patch: Partial<AdmissionSubject>) {
    setSubjects(current => current.map(subject => subject.id === id ? { ...subject, ...patch } : subject))
  }

  function retryLoad() {
    setLoadState('loading')
    setCatalogAvailable(null)
    void loadOrientation()
  }

  function resetScenario() {
    setBachillerato(8.2)
    setAccessPhase(7.8)
    setSubjects(target?.subjects.map(subject => ({ ...subject })) ?? [])
  }

  async function saveAndOpenCamino() {
    if (!target) return
    setSaveState('saving')
    const { data } = await supabase.auth.getSession()
    if (!data.session) { setSaveState('error'); return }
    const response = await fetch('/api/orientation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + data.session.access_token },
      body: JSON.stringify({ target_degree: target.degree, target_university: target.university, target_admission_score: target.referenceScore, source_type: target.source.type }),
    })
    if (!response.ok) { setSaveState('error'); return }
    setSavedTarget({ degree: target.degree, university: target.university, admissionScore: target.referenceScore, sourceType: target.source.type, updatedAt: new Date().toISOString() })
    window.location.assign('/camino')
  }

  const recommendations = subjects.filter(subject => subject.enabled && subject.defaultGrade < 10)
    .sort((a, b) => b.weighting - a.weighting || a.defaultGrade - b.defaultGrade).slice(0, 2)
    .map(subject => ({ ...subject, nextGrade: Math.min(10, subject.defaultGrade + 1), gain: (Math.min(10, subject.defaultGrade + 1) - subject.defaultGrade) * subject.weighting }))
  const matchingUniversities = officialTargets.filter(item => (item.degree + ' ' + item.university).toLowerCase().includes(search.toLowerCase()))

  return (
    <div className={styles.appShell}>
      <SidebarNav />
      <main className={styles.page}>
        <header className={styles.header}>
          <div><div className={styles.eyebrow}><Compass size={14} /> Orientación</div><h1>Mi objetivo</h1><p>Ajusta tus notas y descubre qué necesitas para entrar donde quieres.</p></div>
          <button className={styles.methodButton} onClick={() => setShowMethod(true)}><Info size={17} /> ¿Cómo se calcula?</button>
        </header>

        <nav className={styles.tabs} aria-label="Secciones de Orientación">
          {[['objetivo', 'Mi objetivo'], ['calculadora', 'Calculadora'], ['universidades', 'Universidades'], ['correccion', 'Cómo se corrige']].map(([id, label]) =>
            <button key={id} aria-current={activeTab === id ? 'page' : undefined} onClick={() => setActiveTab(id)}>{label}</button>
          )}
          <button disabled title="Próximamente">Mis puntos</button>
        </nav>

        {savedTarget && (
          <section className={styles.savedTarget}>
            <div><Check size={16} /><span><small>Objetivo guardado</small><b>{savedTarget.degree} · {savedTarget.university}</b></span></div>
            <strong>{formatGrade(savedTarget.admissionScore)}</strong>
            <button onClick={() => { setTargetId(''); setSubjects([]) }}>Cambiar objetivo</button>
          </section>
        )}

        {activeTab === 'universidades' ? (
          <section className={styles.dataSection}>
            <div className={styles.dataSectionHeader}><div><span>Catálogo verificado</span><h2>Universidades y grados</h2></div><label className={styles.searchBox}><Search size={16} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar universidad o grado" aria-label="Buscar universidad o grado" /></label></div>
            {loadState === 'loading' ? <div className={styles.skeletonList}><i /><i /><i /></div> : matchingUniversities.length ? matchingUniversities.map(item => (
              <article className={styles.universityRow} key={item.id}><div><b>{item.degree}</b><span>{item.university}</span></div><strong>{formatGrade(item.referenceScore)}</strong><a href={item.source.url!} target="_blank" rel="noreferrer">Fuente <ExternalLink size={13} /></a></article>
            )) : <EmptyVerifiedData onRetry={retryLoad} />}
          </section>
        ) : activeTab === 'correccion' ? (
          <section className={styles.dataSection}>
            <div className={styles.dataSectionHeader}><div><span>Trazabilidad</span><h2>Cómo se corrige</h2><p>El texto oficial y la explicación de Kairo siempre aparecen separados.</p></div></div>
            {loadState === 'loading' ? <div className={styles.skeletonList}><i /><i /></div> : criteria.length ? criteria.map(item => <OfficialCriterionCard key={item.id} criterion={item} />) : <EmptyVerifiedData onRetry={retryLoad} />}
          </section>
        ) : (
          <>
            <section className={styles.targetPicker}>
              <div className={styles.pickerTitle}><Target size={19} /><div><b>Elige tu objetivo</b><span>El escenario no cambia tu objetivo guardado.</span></div></div>
              {loadState === 'loading' ? <div className={styles.selectSkeleton} /> : <label>Carrera + universidad<span className={styles.selectWrap}><select value={targetId} onChange={event => selectTarget(event.target.value)}><option value="">Selecciona una opción</option>{officialTargets.length > 0 && <optgroup label="Datos oficiales verificados">{officialTargets.map(item => <option key={item.id} value={item.id}>{item.degree} · {item.university}</option>)}</optgroup>}<optgroup label="Simulador de demostración">{ORIENTATION_FIXTURES.map(item => <option key={item.id} value={item.id}>{item.degree} · {item.university}</option>)}</optgroup></select><ChevronDown size={17} aria-hidden="true" /></span></label>}
              <div className={styles.sourceBadge + ' ' + (target?.source.type === 'official' ? styles.officialBadge : '')}>{target?.source.type === 'official' ? 'Fuente oficial verificada' : 'Datos demo · no oficiales'}</div>
            </section>
            {catalogAvailable === false && <div className={styles.fallbackNotice}><Info size={15} /><span>No se pudo leer el catálogo verificado. El simulador local sigue disponible.</span><button onClick={retryLoad}>Reintentar</button></div>}

            {!target ? (
              <section className={styles.emptyState}><div><Target size={29} /></div><h2>Elige una carrera para empezar a simular.</h2><p>Verás tu estimación, la distancia al objetivo y qué cambios tienen más impacto.</p></section>
            ) : (
              <div className={styles.simulatorGrid}>
                <section className={styles.controlsPanel}>
                  <div className={styles.sectionHeading}><div><span>Escenario sin guardar</span><h2>Ajusta tus notas</h2></div><button onClick={resetScenario}><RotateCcw size={15} /> Restablecer</button></div>
                  <GradeControl id="bachillerato" label="Nota media Bachillerato" hint="60% de la fase de acceso" value={bachillerato} onChange={setBachillerato} />
                  <GradeControl id="fase-acceso" label="Fase de acceso PAU" hint="40% de la fase de acceso" value={accessPhase} onChange={setAccessPhase} />
                  <div className={styles.subjectsHeading}><div><b>Materias de admisión</b><span>Se toman las dos aportaciones activas más altas.</span></div></div>
                  {subjects.length ? subjects.map(subject => (
                    <div className={styles.subjectRow + ' ' + (!subject.enabled ? styles.disabledSubject : '')} key={subject.id}>
                      <div className={styles.subjectMeta}><button role="switch" aria-checked={subject.enabled} aria-label={(subject.enabled ? 'Desactivar ' : 'Activar ') + subject.name} className={styles.toggle} onClick={() => updateSubject(subject.id, { enabled: !subject.enabled })}><span><Check size={12} /></span></button><div><b>{subject.name}</b><span>Ponderación ×{subject.weighting.toLocaleString('es-ES')}</span></div></div>
                      <GradeControl id={'subject-' + subject.id} label={'Nota de ' + subject.name} value={subject.defaultGrade} disabled={!subject.enabled} onChange={value => updateSubject(subject.id, { defaultGrade: value })} />
                    </div>
                  )) : <p className={styles.noWeightings}>No hay ponderaciones verificadas para este objetivo.</p>}
                </section>

                <aside className={styles.resultPanel} aria-live="polite">
                  <div className={styles.resultTitle}><span>Tu resultado en tiempo real</span><div className={styles.liveDot} /> En vivo</div>
                  <div className={styles.scoreComparison}><div><span>Nota de referencia</span><b>{formatGrade(target.referenceScore)}</b><small>{target.referenceLabel}</small></div><div className={styles.primaryScore}><span>Tu nota estimada</span><b key={score}>{formatGrade(score)} <small>/ 14</small></b><small>Estimación del escenario</small></div></div>
                  <p className={styles.cutoffNote}>Las notas de corte son orientativas y pueden variar cada curso.</p>
                  <div className={styles.goalChart} aria-label={'Tu nota estimada es ' + formatGrade(score) + ' sobre 14; referencia ' + formatGrade(target.referenceScore)}><div className={styles.chartLabels}><span>5</span><span>14</span></div><div className={styles.track}><div className={styles.trackFill} style={{ width: String(Math.max(0, Math.min(100, ((score - 5) / 9) * 100))) + '%' }} /><div className={styles.marker + ' ' + styles.yourMarker} style={{ left: String(Math.max(0, Math.min(100, ((score - 5) / 9) * 100))) + '%' }}><span>Tu nota</span></div><div className={styles.marker + ' ' + styles.targetMarker} style={{ left: String(Math.max(0, Math.min(100, ((target.referenceScore - 5) / 9) * 100))) + '%' }}><span>Referencia</span></div></div></div>
                  <div className={styles.status + ' ' + (difference >= 0 ? styles.positive : '')}>{difference >= 0 ? <Check size={19} /> : <Target size={19} />}<div><b>{difference >= 0 ? 'Objetivo alcanzado · +' + formatGrade(difference) : 'Te faltan +' + formatGrade(Math.abs(difference)) + ' para alcanzar la referencia.'}</b><span>Es una simulación, no una garantía de admisión.</span></div></div>
                  {target.source.type === 'official' && target.source.url && <a className={styles.sourceLink} href={target.source.url} target="_blank" rel="noreferrer">Fuente oficial · {target.source.label} · curso {target.source.academicYear} <ExternalLink size={13} /></a>}
                  <div className={styles.recommendations}><div><span>Recomendación Kairo</span><Sparkles size={17} /></div>{recommendations.length ? recommendations.map(item => <div className={styles.recommendation} key={item.id}><div><b>{item.name}</b><span>{formatGrade(item.defaultGrade)} → {formatGrade(item.nextGrade)}</span></div><strong>+{formatGrade(item.gain)}</strong></div>) : <p>Activa o ajusta una materia para comparar escenarios.</p>}</div>
                  <button className={styles.caminoCta + ' kairo-clay-action'} onClick={saveAndOpenCamino} disabled={saveState === 'saving'}><span><small>{savedTarget ? 'Actualizar objetivo' : 'Guardar objetivo'}</small>{savedTarget ? 'Usar este objetivo en Camino' : 'Guardar y usar en Camino'}</span><ArrowRight size={20} /></button>
                  {saveState === 'error' && <p className={styles.saveError}>Inicia sesión o reintenta para guardar el objetivo.</p>}
                  <p className={styles.integrationNote}>Camino podrá leer este objetivo sin modificar todavía su scheduler.</p>
                </aside>
              </div>
            )}
            <OpportunitiesExplorer
              estimatedScore={score}
              officialTargets={officialTargets}
              savedTarget={savedTarget}
              loadState={loadState}
              catalogAvailable={catalogAvailable}
              onRetry={retryLoad}
            />
          </>
        )}
      </main>

      {showMethod && <div className={styles.modalBackdrop} role="presentation" onMouseDown={event => event.target === event.currentTarget && setShowMethod(false)}><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="method-title"><button className={styles.closeButton} aria-label="Cerrar" onClick={() => setShowMethod(false)}><X size={19} /></button><div className={styles.modalIcon}><Info size={22} /></div><h2 id="method-title">¿Cómo se calcula?</h2><p>La simulación general suma la fase de acceso y las dos mejores aportaciones activas. Las reglas particulares solo se incorporarán con fuente verificada.</p><div className={styles.formula}><div><b>60%</b><span>Bachillerato</span></div><i>+</i><div><b>40%</b><span>Fase de acceso</span></div><i>+</i><div><b>Hasta 4</b><span>Dos mejores ponderadas</span></div></div><div className={styles.modalNotice}><Info size={17} /><span>Los datos demo nunca se presentan como oficiales. Las notas históricas no garantizan admisión.</span></div></section></div>}
    </div>
  )
}
