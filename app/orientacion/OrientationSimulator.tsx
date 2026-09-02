'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Check, Compass, ExternalLink, GraduationCap, Info, RefreshCw, RotateCcw, Sparkles, Target, X } from 'lucide-react'
import SidebarNav from '@/app/components/SidebarNav'
import { supabase } from '@/app/lib/supabase'
import { calculateAccessPathScore } from './access-paths/calculation'
import AccessPathInputs from './access-paths/AccessPathInputs'
import AccessPathSelector from './access-paths/AccessPathSelector'
import { ACCESS_PATH_IDS, createDefaultAccessScenarios, createEmptyStoredSubjectInputs, getAccessPath } from './access-paths/model'
import { ACCESS_PATH_STORAGE_KEY, CAMINO_ORIENTATION_CONTEXT_KEY, applyStoredSubjectInputs, createCaminoOrientationContext, parseAccessPathStorage, subjectInputsFromScenarios } from './access-paths/storage'
import type { AccessPathId, AccessPathStorageState, StoredSubjectInputs } from './access-paths/types'
import { availableCatalogTargets, findSavedTarget, mergeSubjectInputs } from './catalog'
import CorrectionGuide from './CorrectionGuide'
import { ORIENTATION_FIXTURES, type AdmissionSubject, type OfficialCriterion, type OrientationTarget, type SavedOrientationTarget } from './data'
import GradeControl from './GradeControl'
import { classifyOpportunity, rankOpportunities } from './opportunities'
import { persistOrientationTarget } from './persistence'
import TargetCombobox from './TargetCombobox'
import UniversityExplorer from './UniversityExplorer'
import styles from './orientation.module.css'

const formatGrade = (value: number) => value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const formatReference = (value: number) => value.toLocaleString('es-ES', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
type SubjectsByPath = Record<AccessPathId, AdmissionSubject[]>

function createEmptySubjectsByPath(): SubjectsByPath {
  return { spanish_bachillerato: [], bachibac: [], ib: [], international: [] }
}

export default function OrientationSimulator() {
  const [officialTargets, setOfficialTargets] = useState<OrientationTarget[]>([])
  const [criteria, setCriteria] = useState<OfficialCriterion[]>([])
  const [savedTarget, setSavedTarget] = useState<SavedOrientationTarget | null>(null)
  const [targetId, setTargetId] = useState('')
  const [accessPath, setAccessPath] = useState<AccessPathId>('spanish_bachillerato')
  const [scenarios, setScenarios] = useState(createDefaultAccessScenarios)
  const [subjectsByPath, setSubjectsByPath] = useState<SubjectsByPath>(createEmptySubjectsByPath)
  const [storageReady, setStorageReady] = useState(false)
  const storedSubjectInputs = useRef<StoredSubjectInputs>(createEmptyStoredSubjectInputs())
  const [showMethod, setShowMethod] = useState(false)
  const [activeTab, setActiveTab] = useState<'objetivo' | 'universidades' | 'correccion'>('objetivo')
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [catalogAvailable, setCatalogAvailable] = useState<boolean | null>(null)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'error'>('idle')

  const targets = useMemo(() => availableCatalogTargets(officialTargets, ORIENTATION_FIXTURES, catalogAvailable === true), [officialTargets, catalogAvailable])
  const target = targets.find(item => item.id === targetId) ?? null
  const subjects = subjectsByPath[accessPath]
  const scenario = scenarios[accessPath]
  const pathDefinition = getAccessPath(accessPath)
  const calculation = useMemo(() => calculateAccessPathScore(scenario, subjects), [scenario, subjects])
  const score = calculation.finalScore
  const difference = target && calculation.complete ? score - target.referenceScore : 0
  const universityOptions = useMemo(() => [...new Map(targets.map(item => [item.universityId, { id: item.universityId!, acronym: item.universityAcronym, name: item.university }])).values()].sort((a, b) => (a.acronym ?? a.name).localeCompare(b.acronym ?? b.name, 'es')), [targets])
  const alternatives = useMemo(() => rankOpportunities(officialTargets.filter(item => item.id !== targetId), score, savedTarget).slice(0, 4), [officialTargets, score, savedTarget, targetId])

  function selectTarget(id: string, availableTargets = targets) {
    const nextTarget = availableTargets.find(item => item.id === id)
    setTargetId(id)
    setSubjectsByPath(current => Object.fromEntries(ACCESS_PATH_IDS.map(pathId => {
      if (!nextTarget) return [pathId, []]
      const merged = mergeSubjectInputs(nextTarget.subjects, current[pathId])
      return [pathId, current[pathId].length ? merged : applyStoredSubjectInputs(merged, storedSubjectInputs.current[pathId])]
    })) as SubjectsByPath)
    setSaveState('idle')
  }

  const loadOrientation = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getSession()
      const headers: HeadersInit = data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {}
      const response = await fetch('/api/orientation', { headers })
      if (!response.ok) throw new Error('orientation-api')
      const payload = await response.json() as { targets?: OrientationTarget[]; criteria?: OfficialCriterion[]; savedTarget?: SavedOrientationTarget | null; catalogAvailable?: boolean }
      const realTargets = payload.targets ?? []
      const allTargets = availableCatalogTargets(realTargets, ORIENTATION_FIXTURES, payload.catalogAvailable !== false)
      setOfficialTargets(realTargets)
      setCriteria(payload.criteria ?? [])
      setSavedTarget(payload.savedTarget ?? null)
      setCatalogAvailable(payload.catalogAvailable ?? true)
      if (payload.savedTarget) {
        const match = findSavedTarget(allTargets, payload.savedTarget)
        if (match) {
          setTargetId(match.id)
          setSubjectsByPath(Object.fromEntries(ACCESS_PATH_IDS.map(pathId => [pathId, applyStoredSubjectInputs(match.subjects, storedSubjectInputs.current[pathId])])) as SubjectsByPath)
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
    const timer = window.setTimeout(() => {
      const stored = parseAccessPathStorage(window.localStorage.getItem(ACCESS_PATH_STORAGE_KEY))
      if (stored) {
        storedSubjectInputs.current = stored.subjectInputs
        setAccessPath(stored.selectedPath)
        setScenarios(stored.scenarios)
        setSubjectsByPath(current => Object.fromEntries(ACCESS_PATH_IDS.map(pathId => [pathId, applyStoredSubjectInputs(current[pathId], stored.subjectInputs[pathId])])) as SubjectsByPath)
      }
      setStorageReady(true)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!storageReady) return
    const subjectInputs = subjectInputsFromScenarios(subjectsByPath)
    storedSubjectInputs.current = subjectInputs
    const state: AccessPathStorageState = { version: 1, selectedPath: accessPath, scenarios, subjectInputs }
    window.localStorage.setItem(ACCESS_PATH_STORAGE_KEY, JSON.stringify(state))
  }, [accessPath, scenarios, storageReady, subjectsByPath])

  useEffect(() => {
    if (!showMethod) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setShowMethod(false) }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [showMethod])

  function updateSubject(id: string, patch: Partial<AdmissionSubject>) {
    setSubjectsByPath(current => ({ ...current, [accessPath]: current[accessPath].map(subject => subject.id === id ? { ...subject, ...patch } : subject) }))
  }

  function retryLoad() {
    setLoadState('loading')
    setCatalogAvailable(null)
    void loadOrientation()
  }

  function resetScenario() {
    const defaults = createDefaultAccessScenarios()
    setScenarios(current => ({ ...current, [accessPath]: defaults[accessPath] }))
    setSubjectsByPath(current => ({ ...current, [accessPath]: target?.subjects.map(subject => ({ ...subject })) ?? [] }))
  }

  async function saveAndOpenCamino() {
    if (!target) return
    setSaveState('saving')
    try {
      const { data } = await supabase.auth.getSession()
      if (!data.session) { setSaveState('error'); return }
      const saved = await persistOrientationTarget(data.session.access_token, target)
      if (!saved) { setSaveState('error'); return }
      setSavedTarget({ degreeId: target.degreeId, universityId: target.universityId, degree: target.degree, university: target.university, admissionScore: target.referenceScore, sourceType: target.source.type, updatedAt: new Date().toISOString() })
      const caminoContext = createCaminoOrientationContext(accessPath, target, calculation.complete ? score : null, calculation.complete ? difference : null, subjects, scenario, calculation.complete)
      window.localStorage.setItem(CAMINO_ORIENTATION_CONTEXT_KEY, JSON.stringify(caminoContext))
      window.location.assign('/camino')
    } catch {
      setSaveState('error')
    }
  }

  const recommendations = subjects.filter(subject => subject.enabled && subject.defaultGrade >= 5 && subject.defaultGrade < 10)
    .sort((a, b) => b.weighting - a.weighting || a.defaultGrade - b.defaultGrade).slice(0, 2)
    .map(subject => ({ ...subject, nextGrade: Math.min(10, subject.defaultGrade + 1), gain: (Math.min(10, subject.defaultGrade + 1) - subject.defaultGrade) * subject.weighting }))
  const prioritySubjects = subjects.filter(subject => subject.weighting === 0.2 || subject.enabled).slice(0, 8)
  const visibleSubjects = prioritySubjects.length ? prioritySubjects : subjects.slice(0, 4)
  const secondarySubjects = subjects.filter(subject => !visibleSubjects.some(visible => visible.id === subject.id))

  function updateScenario(nextScenario: typeof scenario) {
    setScenarios(current => ({ ...current, [accessPath]: nextScenario }))
    setSaveState('idle')
  }

  function renderSubject(subject: AdmissionSubject) {
    return (
      <div className={`${styles.subjectRow} ${!subject.enabled ? styles.disabledSubject : ''}`} key={subject.id}>
        <div className={styles.subjectMeta}><button role="switch" aria-checked={subject.enabled} aria-label={`${subject.enabled ? 'Desactivar' : 'Activar'} ${subject.name}`} className={styles.toggle} onClick={() => updateSubject(subject.id, { enabled: !subject.enabled })}><span><Check size={12} /></span></button><div><b>{subject.name}</b><span>Pondera ×{subject.weighting.toLocaleString('es-ES')}{subject.ruleNote ? ` · ${subject.ruleNote}` : ''}</span></div></div>
        <GradeControl id={`subject-${subject.id}`} label={`Nota de ${subject.name}`} value={subject.defaultGrade} disabled={!subject.enabled} onChange={value => updateSubject(subject.id, { defaultGrade: value })} />
      </div>
    )
  }

  const headings = {
    objetivo: ['Mi objetivo', 'Elige, simula y convierte tu meta en un siguiente paso claro.'],
    universidades: ['Explorar grados', 'Filtra el catálogo oficial según lo que buscas y tu escenario.'],
    correccion: ['Cómo se corrige', 'Baremos oficiales explicados sin mezclar fuente e interpretación.'],
  } as const

  return (
    <div className={styles.appShell}>
      <SidebarNav />
      <main className={styles.page}>
        <header className={styles.header}>
          <div><div className={styles.eyebrow}><Compass size={14} /> Orientación</div><h1>{headings[activeTab][0]}</h1><p>{headings[activeTab][1]}</p></div>
          {activeTab === 'objetivo' && <button className={styles.methodButton} onClick={() => setShowMethod(true)}><Info size={17} /> ¿Cómo se calcula?</button>}
        </header>

        <nav className={styles.tabs} aria-label="Secciones de Orientación">
          {([['objetivo', 'Mi objetivo'], ['universidades', 'Explorar grados'], ['correccion', 'Cómo se corrige']] as const).map(([id, label]) => <button key={id} aria-current={activeTab === id ? 'page' : undefined} onClick={() => setActiveTab(id)}>{label}</button>)}
        </nav>

        {activeTab === 'objetivo' && savedTarget && (
          <section className={styles.savedTarget}>
            <div><Check size={16} /><span><small>Objetivo guardado</small><b>{savedTarget.degree} · {savedTarget.university}</b></span></div>
            <strong>{formatReference(savedTarget.admissionScore)}</strong>
            <button onClick={() => { setTargetId(''); setSubjectsByPath(createEmptySubjectsByPath()) }}>Cambiar</button>
          </section>
        )}

        {activeTab === 'universidades' ? <UniversityExplorer targets={officialTargets} estimatedScore={calculation.complete ? score : null} loadState={loadState} onRetry={retryLoad} /> : activeTab === 'correccion' ? <CorrectionGuide databaseCriteria={criteria} /> : (
          <>
            <ol className={styles.flowRail} aria-label="Pasos para definir tu objetivo"><li className={styles.flowActive}><b>1</b><span>Elige objetivo</span></li><li className={target ? styles.flowActive : ''}><b>2</b><span>Ajusta notas</span></li><li className={target ? styles.flowActive : ''}><b>3</b><span>Decide qué mejorar</span></li><li><b>4</b><span>Llévalo a Camino</span></li></ol>
            <section className={styles.targetPicker}>
              <div className={styles.pickerTitle}><Target size={20} /><div><small>PASO 1</small><b>¿Dónde quieres entrar?</b><span>Busca primero el grado; afina por universidad si lo necesitas.</span></div></div>
              {loadState === 'loading' ? <div className={styles.selectSkeleton} /> : <TargetCombobox targets={targets} selectedId={targetId} universities={universityOptions} onSelect={selectTarget} />}
              <AccessPathSelector value={accessPath} onChange={pathId => { setAccessPath(pathId); setSaveState('idle') }} />
            </section>
            {catalogAvailable === false && <div className={styles.fallbackNotice}><Info size={15} /><span>No se pudo leer el catálogo verificado. No mostraremos datos demo hasta poder confirmar la fuente oficial.</span><button onClick={retryLoad}><RefreshCw size={13} /> Reintentar</button></div>}

            {!target ? <section className={styles.emptyState}><div><Target size={29} /></div><h2>Empieza por un grado.</h2><p>En cuanto lo elijas verás la referencia, tu escenario y el cambio con más impacto.</p></section> : (
              <>
                <div className={styles.simulatorGrid}>
                  <section className={styles.controlsPanel}>
                    <div className={styles.sectionHeading}><div><span>PASO 2 · SIMULACIÓN</span><h2>Ajusta tu escenario</h2></div><button onClick={resetScenario}><RotateCcw size={15} /> Restablecer</button></div>
                    <AccessPathInputs scenario={scenario} onChange={updateScenario} />
                    <div className={styles.subjectsHeading}><div><b>Materias que pueden subir tu nota</b><span>Solo cuentan las dos mejores aportaciones aprobadas, activas y válidas para tu vía.</span></div></div>
                    {subjects.length ? <>{visibleSubjects.map(renderSubject)}{secondarySubjects.length > 0 && <details className={styles.secondarySubjects}><summary>Ver {secondarySubjects.length} materias con menor ponderación</summary>{secondarySubjects.map(renderSubject)}</details>}</> : <p className={styles.noWeightings}>No hay ponderaciones verificadas para este objetivo.</p>}
                  </section>

                  <aside className={styles.resultPanel} aria-live="polite">
                    <div className={styles.resultTitle}><span>TU DISTANCIA AL OBJETIVO</span><div className={styles.liveDot} /> En vivo</div>
                    <div className={styles.scoreComparison}><div><span>Necesitas como referencia</span><b>{formatReference(target.referenceScore)}</b><small>{target.referenceLabel}</small></div><div className={styles.primaryScore}><span>Con tu nota actual</span><b key={`${accessPath}-${score}`}>{calculation.complete ? <>{formatGrade(score)} <small>/ 14</small></> : 'Pendiente'}</b><small>{calculation.complete ? `${formatGrade(calculation.baseScore)} base + ${formatGrade(calculation.weightedPoints)} admisión` : 'Falta completar tu vía'}</small></div></div>
                    {calculation.complete && <div className={styles.goalChart} aria-label={`Tu nota estimada es ${formatGrade(score)} sobre 14; referencia ${formatReference(target.referenceScore)}`}><div className={styles.chartLabels}><span>5</span><span>14</span></div><div className={styles.track}><div className={styles.trackFill} style={{ width: `${Math.max(0, Math.min(100, ((score - 5) / 9) * 100))}%` }} /><div className={`${styles.marker} ${styles.yourMarker}`} style={{ left: `${Math.max(0, Math.min(100, ((score - 5) / 9) * 100))}%` }}><span>Tú</span></div><div className={`${styles.marker} ${styles.targetMarker}`} style={{ left: `${Math.max(0, Math.min(100, ((target.referenceScore - 5) / 9) * 100))}%` }}><span>Meta</span></div></div></div>}
                    <div className={`${styles.status} ${calculation.complete && difference >= 0 ? styles.positive : ''}`}>{calculation.complete && difference >= 0 ? <Check size={19} /> : <Target size={19} />}<div><b>{calculation.complete ? difference >= 0 ? `Por encima de la referencia · +${formatGrade(difference)}` : `Te faltan ${formatGrade(Math.abs(difference))} puntos` : 'Completa los requisitos de tu vía'}</b><span>{calculation.incompleteReason ?? 'Es una simulación, no una garantía de admisión.'}</span></div></div>
                    {target.source.type === 'official' && target.source.url && <a className={styles.sourceLink} href={target.source.url} target="_blank" rel="noreferrer">OFICIAL · {target.source.label} <ExternalLink size={13} /></a>}
                    <div className={styles.recommendations}><div><span>PASO 3 · QUÉ MEJORAR</span><Sparkles size={17} /></div>{recommendations.length ? recommendations.map(item => <div className={styles.recommendation} key={item.id}><div><b>{item.name}</b><span>Si subes {formatGrade(item.defaultGrade)} → {formatGrade(item.nextGrade)}</span></div><strong>+{formatGrade(item.gain)}</strong></div>) : <p>Activa o ajusta una materia para comparar el impacto.</p>}</div>
                    <button className={`${styles.caminoCta} kairo-clay-action`} onClick={saveAndOpenCamino} disabled={saveState === 'saving'}><span><small>PASO 4</small>{saveState === 'saving' ? 'Guardando…' : savedTarget ? 'Actualizar objetivo en Camino' : 'Guardar y usar en Camino'}</span><ArrowRight size={20} /></button>
                    {saveState === 'error' && <p className={styles.saveError}>No se pudo guardar. Revisa tu sesión y vuelve a intentarlo.</p>}
                  </aside>
                </div>

                {calculation.complete && <section className={styles.alternatives} aria-label="Alternativas con tu nota actual">
                  <div className={styles.alternativesHeading}><div><span>PASO 5 · ALTERNATIVAS</span><h2>Opciones cerca de tu escenario</h2><p>Referencias ordenadas por distancia a tu nota actual.</p></div><button onClick={() => setActiveTab('universidades')}>Explorar las 554 <ArrowRight size={14} /></button></div>
                  <div className={styles.alternativeGrid}>{alternatives.map(item => { const category = classifyOpportunity(score, item.referenceScore); return <article key={item.id}><div><GraduationCap size={16} /><span>{category === 'above' ? 'Por encima' : category === 'close' ? 'Cerca' : 'Por debajo'}</span></div><h3>{item.degree}</h3><p>{item.universityAcronym ?? item.university}</p><strong>{formatReference(item.referenceScore)}</strong></article> })}</div>
                  <p className={styles.opportunityDisclaimer}>Las notas de corte son históricas y pueden variar. Estar por encima no garantiza la admisión.</p>
                </section>}
              </>
            )}
          </>
        )}
      </main>

      {showMethod && <div className={styles.modalBackdrop} role="presentation" onMouseDown={event => event.target === event.currentTarget && setShowMethod(false)}><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="method-title"><button className={styles.closeButton} aria-label="Cerrar" onClick={() => setShowMethod(false)}><X size={19} /></button><div className={styles.modalIcon}><Info size={22} /></div><h2 id="method-title">¿Cómo se calcula {pathDefinition.shortLabel}?</h2><p>{pathDefinition.officialSummary}</p><div className={styles.formula}>{calculation.formulaParts.map((part, index) => <div key={`${part.value}-${index}`}><b>{part.value}</b><span>{part.label}</span></div>)}</div><div className={styles.modalNotice}><Info size={17} /><span>Las referencias históricas orientan, pero no garantizan admisión. La acreditación oficial siempre prevalece sobre la simulación.</span></div></section></div>}
    </div>
  )
}
