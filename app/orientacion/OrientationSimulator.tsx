'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, BookOpen, Check, GraduationCap, Info, Plus, RefreshCw, Search, Target, Trash2, X } from 'lucide-react'
import SidebarNav from '@/app/components/SidebarNav'
import ClayThemeScope from '@/components/clay/ClayThemeScope'
import { useClayThemePreference } from '@/components/clay/useClayThemePreference'
import { supabase } from '@/app/lib/supabase'
import { SUBJECT_OPTS } from '@/app/lib/subjectCatalog'
import { calculateAccessPathScore } from './access-paths/calculation'
import AccessPathInputs from './access-paths/AccessPathInputs'
import AccessPathSelector from './access-paths/AccessPathSelector'
import { ACCESS_PATH_IDS, createDefaultAccessScenarios, createEmptyStoredSubjectInputs, getAccessPath } from './access-paths/model'
import { ACCESS_PATH_STORAGE_KEY, CAMINO_ORIENTATION_CONTEXT_KEY, applyStoredSubjectInputs, createCaminoOrientationContext, parseAccessPathStorage, subjectInputsFromScenarios } from './access-paths/storage'
import type { AccessPathId, StoredSubjectInputs } from './access-paths/types'
import { LatestStateAutosave, type AutosaveStatus } from './autosave'
import { availableCatalogTargets, findSavedTarget, groupOrientationTargets, mergeSubjectInputs } from './catalog'
import { ORIENTATION_COMMUNITIES, ORIENTATION_COMMUNITY_STORAGE_KEY, communitySlug, normalizeOrientationCommunity, type OrientationCommunity } from './community'
import CorrectionGuide from './CorrectionGuide'
import { ORIENTATION_FIXTURES, type AdmissionSubject, type OfficialCriterion, type OrientationTarget, type SavedOrientationTarget } from './data'
import GradeControl from './GradeControl'
import { clearOrientationTarget, loadOrientationState, OrientationStateConflictError, persistOrientationState, persistOrientationTarget } from './persistence'
import { createOrientationState, mergeStoredSubjectInputs, orientationStateContentKey, ORIENTATION_STATE_STORAGE_KEY, parseOrientationState, reconcileOrientationStates, toAccessPathStorage, type FreeElective, type OrientationExploration, type OrientationMode, type OrientationStateV1 } from './state'
import UniversityExplorer from './UniversityExplorer'
import styles from './orientation.module.css'

// Misma imagen Higgsfield que la ficha de tema de Camino: Orientación entra en
// la misma familia visual que el resto del interior.
const ORIENTATION_HERO_IMG = 'https://d8j0ntlcm91z4.cloudfront.net/user_3FE1qfsmGuEldtlzta7SsGkWNIV/hf_20260727_125450_f5670e8f-277d-470e-82b0-58dd6db26d4b.png'

const formatGrade = (value: number) => value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const MANUAL_SIMULATION_SOURCE = { type: 'fixture' as const, label: 'Ponderación elegida por el alumno', url: null, academicYear: null, verifiedAt: null }
const ELECTIVE_OPTIONS = SUBJECT_OPTS.filter(subject => subject.betaStatus === 'enabled')
type SubjectsByPath = Record<AccessPathId, AdmissionSubject[]>

function createEmptySubjectsByPath(): SubjectsByPath {
  return { spanish_bachillerato: [], bachibac: [], ib: [], international: [] }
}

export default function OrientationSimulator() {
  const [officialTargets, setOfficialTargets] = useState<OrientationTarget[]>([])
  const [criteria, setCriteria] = useState<OfficialCriterion[]>([])
  const [savedTarget, setSavedTarget] = useState<SavedOrientationTarget | null>(null)
  const [orientationMode, setOrientationMode] = useState<OrientationMode>('free')
  const [community, setCommunity] = useState<OrientationCommunity>('Madrid')
  const [selectedDegreeKey, setSelectedDegreeKey] = useState('')
  const [targetId, setTargetId] = useState('')
  const [accessPath, setAccessPath] = useState<AccessPathId>('spanish_bachillerato')
  const [scenarios, setScenarios] = useState(createDefaultAccessScenarios)
  const [subjectsByPath, setSubjectsByPath] = useState<SubjectsByPath>(createEmptySubjectsByPath)
  const [freeElectives, setFreeElectives] = useState<FreeElective[]>([])
  const [stateReady, setStateReady] = useState(false)
  const [stateUpdatedAt, setStateUpdatedAt] = useState('1970-01-01T00:00:00.000Z')
  const [authenticated, setAuthenticated] = useState(false)
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus | 'conflict'>('idle')
  const storedSubjectInputs = useRef<StoredSubjectInputs>(createEmptyStoredSubjectInputs())
  const accessTokenRef = useRef<string | null>(null)
  const autosaveRef = useRef<LatestStateAutosave<OrientationStateV1> | null>(null)
  const queuedContentRef = useRef('')
  const currentContentRef = useRef('')
  const serverUpdatedAtRef = useRef<string | null>(null)
  const stateConflictRef = useRef(false)
  const loadSequenceRef = useRef(0)
  const pageRef = useRef<HTMLElement | null>(null)
  const [showMethod, setShowMethod] = useState(false)
  const [activeTab, setActiveTab] = useState<'objetivo' | 'universidades' | 'correccion'>('universidades')
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [catalogAvailable, setCatalogAvailable] = useState<boolean | null>(null)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [clearState, setClearState] = useState<'idle' | 'clearing' | 'error'>('idle')
  const { theme: clayTheme } = useClayThemePreference()

  const targets = useMemo(() => availableCatalogTargets(officialTargets, ORIENTATION_FIXTURES, catalogAvailable === true), [officialTargets, catalogAvailable])
  const target = targets.find(item => item.id === targetId) ?? null
  const subjects = subjectsByPath[accessPath]
  const freeSubjects = useMemo<AdmissionSubject[]>(() => freeElectives.map(elective => ({
    id: elective.id,
    subjectCode: elective.subject,
    name: elective.subject,
    weighting: elective.weighting,
    defaultGrade: elective.grade,
    enabled: true,
    source: MANUAL_SIMULATION_SOURCE,
  })), [freeElectives])
  const scenario = scenarios[accessPath]
  const pathDefinition = getAccessPath(accessPath, community)
  const calculation = useMemo(() => calculateAccessPathScore(scenario, orientationMode === 'target' ? subjects : freeSubjects, community), [community, freeSubjects, orientationMode, scenario, subjects])
  const score = calculation.finalScore
  const difference = target && calculation.complete ? score - target.referenceScore : null
  const degreeGroups = useMemo(() => groupOrientationTargets(targets), [targets])
  const selectedDegree = degreeGroups.find(group => group.key === selectedDegreeKey) ?? null

  function markStateChanged() {
    setStateUpdatedAt(new Date().toISOString())
  }

  function selectTarget(id: string) {
    const nextTarget = targets.find(item => item.id === id && item.source.type === 'official')
    if (!nextTarget) return
    const group = degreeGroups.find(item => item.offerings.some(offering => offering.id === nextTarget.id))
    setSelectedDegreeKey(group?.key ?? '')
    setTargetId(nextTarget.id)
    setSubjectsByPath(current => Object.fromEntries(ACCESS_PATH_IDS.map(pathId => {
      const merged = mergeSubjectInputs(nextTarget.subjects, current[pathId])
      return [pathId, current[pathId].length ? merged : applyStoredSubjectInputs(merged, storedSubjectInputs.current[pathId])]
    })) as SubjectsByPath)
    setOrientationMode('target')
    setSaveState('idle')
    setClearState('idle')
    setActiveTab('objetivo')
    markStateChanged()
    window.requestAnimationFrame(() => pageRef.current?.scrollTo({ top: 0, behavior: 'auto' }))
  }

  const loadOrientation = useCallback(async (requestedCommunity: OrientationCommunity, exploration: OrientationExploration | null, accessToken: string | null) => {
    const requestSequence = ++loadSequenceRef.current
    try {
      const headers: HeadersInit = accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
      const endpoint = `/api/orientation?community=${communitySlug(requestedCommunity)}`
      const response = await fetch(endpoint, { headers, cache: 'no-store' })
      if (!response.ok) throw new Error('orientation-api')
      const payload = await response.json() as { community?: OrientationCommunity; targets?: OrientationTarget[]; criteria?: OfficialCriterion[]; savedTarget?: SavedOrientationTarget | null; catalogAvailable?: boolean }
      if (requestSequence !== loadSequenceRef.current) return
      const realTargets = payload.targets ?? []
      const allTargets = availableCatalogTargets(realTargets, ORIENTATION_FIXTURES, payload.catalogAvailable !== false)
      setOfficialTargets(realTargets)
      setCriteria(payload.criteria ?? [])
      setSavedTarget(payload.savedTarget ?? null)
      setCatalogAvailable(payload.catalogAvailable ?? true)
      if (payload.community) setCommunity(payload.community)
      const activeCommunity = payload.community ?? requestedCommunity
      const groups = groupOrientationTargets(allTargets)
      const exploredHere = exploration?.community === activeCommunity
      const exploredTarget = exploredHere && exploration.degreeId && exploration.universityId
        ? allTargets.find(item => item.degreeId === exploration.degreeId && item.universityId === exploration.universityId) ?? null
        : null
      const exploredGroup = exploredHere
        ? groups.find(group => group.key === exploration.degreeGroupKey)
          ?? groups.find(group => group.offerings.some(item => item.id === exploredTarget?.id))
          ?? null
        : null
      function restoreTarget(nextTarget: OrientationTarget) {
        setTargetId(nextTarget.id)
        setSubjectsByPath(Object.fromEntries(ACCESS_PATH_IDS.map(pathId => [pathId, applyStoredSubjectInputs(nextTarget.subjects, storedSubjectInputs.current[pathId])])) as SubjectsByPath)
      }
      if (exploredGroup) setSelectedDegreeKey(exploredGroup.key)
      else setSelectedDegreeKey('')
      if (exploredTarget) {
        restoreTarget(exploredTarget)
      } else {
        setTargetId('')
        setSubjectsByPath(createEmptySubjectsByPath())
      }

      const savedCommunity = normalizeOrientationCommunity(payload.savedTarget?.community)
      const canRestoreLegacyTarget = Boolean(payload.savedTarget?.degreeId && payload.savedTarget?.universityId && !savedCommunity)
      if (!exploredHere && payload.savedTarget && (savedCommunity === activeCommunity || canRestoreLegacyTarget)) {
        const match = findSavedTarget(allTargets, payload.savedTarget)
        if (match) {
          const group = groups.find(item => item.offerings.some(offering => offering.id === match.id))
          setSelectedDegreeKey(group?.key ?? '')
          restoreTarget(match)
        }
      }
      setLoadState('ready')
    } catch {
      if (requestSequence !== loadSequenceRef.current) return
      setOfficialTargets([])
      setCriteria([])
      setCatalogAvailable(false)
      setLoadState('error')
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    function applyState(state: OrientationStateV1) {
      storedSubjectInputs.current = state.subjectInputs
      setOrientationMode(state.mode)
      setCommunity(state.activeCommunity)
      setAccessPath(state.activeAccessPath)
      setScenarios(state.scenarios)
      setFreeElectives(state.freeElectives)
      setSelectedDegreeKey(state.exploration.community === state.activeCommunity ? state.exploration.degreeGroupKey ?? '' : '')
      setTargetId('')
      setSubjectsByPath(createEmptySubjectsByPath())
      setStateUpdatedAt(state.updatedAt)
    }
    async function bootstrap() {
      const preferred = normalizeOrientationCommunity(window.localStorage.getItem(ORIENTATION_COMMUNITY_STORAGE_KEY) ?? window.localStorage.getItem('kairo_ccaa')) ?? 'Madrid'
      const unifiedLocal = parseOrientationState(window.localStorage.getItem(ORIENTATION_STATE_STORAGE_KEY))
      const legacyAccess = parseAccessPathStorage(window.localStorage.getItem(ACCESS_PATH_STORAGE_KEY))
      const localState = unifiedLocal ?? createOrientationState(preferred, legacyAccess, '1970-01-01T00:00:00.000Z')
      applyState(localState)

      const { data } = await supabase.auth.getSession()
      if (cancelled) return
      const accessToken = data.session?.access_token ?? null
      accessTokenRef.current = accessToken
      setAuthenticated(Boolean(accessToken))
      let serverState: OrientationStateV1 | null = null
      if (accessToken) {
        try {
          serverState = await loadOrientationState(accessToken)
        } catch {
          setAutosaveStatus('error')
        }
      }
      if (cancelled) return
      serverUpdatedAtRef.current = serverState?.updatedAt ?? null
      const chosen = reconcileOrientationStates(localState, serverState) ?? localState
      applyState(chosen)
      if (serverState && orientationStateContentKey(chosen) === orientationStateContentKey(serverState)) {
        queuedContentRef.current = orientationStateContentKey(serverState)
      }
      await loadOrientation(chosen.activeCommunity, unifiedLocal || serverState ? chosen.exploration : null, accessToken)
      if (!cancelled) setStateReady(true)
    }
    void bootstrap()
    return () => { cancelled = true; loadSequenceRef.current += 1 }
  }, [loadOrientation])

  useEffect(() => {
    const autosave = new LatestStateAutosave<OrientationStateV1>(async state => {
      stateConflictRef.current = false
      try {
        const saved = await persistOrientationState(accessTokenRef.current, state, serverUpdatedAtRef.current)
        if (!saved) return
        serverUpdatedAtRef.current = saved.updatedAt
        if (currentContentRef.current === orientationStateContentKey(saved)) {
          window.localStorage.setItem(ORIENTATION_STATE_STORAGE_KEY, JSON.stringify(saved))
        }
      } catch (error) {
        if (error instanceof OrientationStateConflictError) stateConflictRef.current = true
        throw error
      }
    }, status => setAutosaveStatus(status === 'error' && stateConflictRef.current ? 'conflict' : status), 750)
    autosaveRef.current = autosave
    return () => { autosave.dispose(); autosaveRef.current = null }
  }, [])

  useEffect(() => {
    if (!stateReady) return
    const visibleInputs = subjectInputsFromScenarios(subjectsByPath)
    const subjectInputs = mergeStoredSubjectInputs(storedSubjectInputs.current, visibleInputs)
    storedSubjectInputs.current = subjectInputs
    const state: OrientationStateV1 = {
      version: 1,
      updatedAt: stateUpdatedAt,
      mode: orientationMode,
      activeCommunity: community,
      activeAccessPath: accessPath,
      exploration: {
        community,
        degreeGroupKey: selectedDegree?.key ?? null,
        degreeName: selectedDegree?.name ?? null,
        degreeId: target?.degreeId ?? null,
        universityId: target?.universityId ?? null,
      },
      scenarios,
      subjectInputs,
      freeElectives,
    }
    const contentKey = orientationStateContentKey(state)
    currentContentRef.current = contentKey
    window.localStorage.setItem(ORIENTATION_STATE_STORAGE_KEY, JSON.stringify(state))
    window.localStorage.setItem(ACCESS_PATH_STORAGE_KEY, JSON.stringify(toAccessPathStorage(state)))
    window.localStorage.setItem(ORIENTATION_COMMUNITY_STORAGE_KEY, community)
    if (authenticated && contentKey !== queuedContentRef.current) {
      queuedContentRef.current = contentKey
      autosaveRef.current?.update(state)
    }
  }, [accessPath, authenticated, community, freeElectives, orientationMode, scenarios, selectedDegree, stateReady, stateUpdatedAt, subjectsByPath, target])

  useEffect(() => {
    if (!showMethod) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setShowMethod(false) }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [showMethod])

  function retryLoad() {
    setLoadState('loading')
    setCatalogAvailable(null)
    void loadOrientation(community, {
      community,
      degreeGroupKey: selectedDegree?.key ?? null,
      degreeName: selectedDegree?.name ?? null,
      degreeId: target?.degreeId ?? null,
      universityId: target?.universityId ?? null,
    }, accessTokenRef.current)
  }

  function changeCommunity(nextCommunity: OrientationCommunity) {
    if (nextCommunity === community) return
    setCommunity(nextCommunity)
    window.localStorage.setItem(ORIENTATION_COMMUNITY_STORAGE_KEY, nextCommunity)
    setSelectedDegreeKey('')
    setTargetId('')
    setSubjectsByPath(createEmptySubjectsByPath())
    setOfficialTargets([])
    setCriteria([])
    setLoadState('loading')
    setCatalogAvailable(null)
    markStateChanged()
    void loadOrientation(nextCommunity, null, accessTokenRef.current)
  }

  function chooseMode(mode: OrientationMode) {
    if (mode === orientationMode) return
    setOrientationMode(mode)
    setSaveState('idle')
    markStateChanged()
  }

  function addFreeElective() {
    if (freeElectives.length >= 8) return
    const unused = ELECTIVE_OPTIONS.find(option => !freeElectives.some(item => item.subject === option.label)) ?? ELECTIVE_OPTIONS[0]
    if (!unused) return
    setFreeElectives(current => [...current, { id: crypto.randomUUID(), subject: unused.label, grade: 7, weighting: 0.2 }])
    markStateChanged()
  }

  function updateFreeElective(id: string, patch: Partial<Omit<FreeElective, 'id'>>) {
    setFreeElectives(current => current.map(item => item.id === id ? { ...item, ...patch } : item))
    markStateChanged()
  }

  function removeFreeElective(id: string) {
    setFreeElectives(current => current.filter(item => item.id !== id))
    markStateChanged()
  }

  function updateSubject(id: string, patch: Partial<AdmissionSubject>) {
    setSubjectsByPath(current => ({
      ...current,
      [accessPath]: current[accessPath].map(subject => subject.id === id ? { ...subject, ...patch } : subject),
    }))
    setSaveState('idle')
    markStateChanged()
  }

  async function saveAndOpenCamino() {
    if (!target || target.source.type !== 'official') return
    setSaveState('saving')
    try {
      await autosaveRef.current?.flush()
      const { data } = await supabase.auth.getSession()
      if (!data.session || !await persistOrientationTarget(data.session.access_token, target)) {
        setSaveState('error')
        return
      }
      const now = new Date()
      setSavedTarget({
        degreeId: target.degreeId,
        universityId: target.universityId,
        degree: target.degree,
        university: target.university,
        community: target.community,
        admissionScore: target.referenceScore,
        sourceType: 'official',
        updatedAt: now.toISOString(),
      })
      const context = createCaminoOrientationContext(accessPath, target, calculation.complete ? score : null, difference, subjects, scenario, calculation.complete, now)
      window.localStorage.setItem(CAMINO_ORIENTATION_CONTEXT_KEY, JSON.stringify(context))
      setSaveState('saved')
      window.location.assign('/camino')
    } catch {
      setSaveState('error')
    }
  }

  async function removeSavedTarget() {
    setClearState('clearing')
    const { data } = await supabase.auth.getSession()
    if (!data.session || !await clearOrientationTarget(data.session.access_token)) {
      setClearState('error')
      return
    }
    window.localStorage.removeItem(CAMINO_ORIENTATION_CONTEXT_KEY)
    setSavedTarget(null)
    setTargetId('')
    setSelectedDegreeKey('')
    setSubjectsByPath(createEmptySubjectsByPath())
    setOrientationMode('free')
    setClearState('idle')
    markStateChanged()
  }

  function updateScenario(nextScenario: typeof scenario) {
    setScenarios(current => ({ ...current, [accessPath]: nextScenario }))
    setSaveState('idle')
    markStateChanged()
  }

  function renderOfficialSubject(subject: AdmissionSubject) {
    return <div className={`${styles.subjectRow} ${!subject.enabled ? styles.disabledSubject : ''}`} key={subject.id}>
      <div className={styles.subjectMeta}>
        <button type="button" role="switch" aria-checked={subject.enabled} aria-label={`${subject.enabled ? 'Desactivar' : 'Activar'} ${subject.name}`} className={styles.toggle} onClick={() => updateSubject(subject.id, { enabled: !subject.enabled })}><span><Check size={14} /></span></button>
        <div><b>{subject.name}</b><span>Pondera ×{subject.weighting.toLocaleString('es-ES')}{subject.ruleNote ? ` · ${subject.ruleNote}` : ''}</span></div>
      </div>
      <GradeControl id={`subject-${subject.id}`} label={`Nota de ${subject.name}`} value={subject.defaultGrade} disabled={!subject.enabled} onChange={value => updateSubject(subject.id, { defaultGrade: value })} />
    </div>
  }

  const autosaveFeedback = !authenticated
    ? 'Guardado en este dispositivo'
    : autosaveStatus === 'saving'
      ? 'Guardando cambios…'
      : autosaveStatus === 'conflict'
        ? <><span>Hay cambios más recientes en otra pestaña</span><button type="button" onClick={() => window.location.reload()}><RefreshCw size={14} /> Recargar</button></>
        : autosaveStatus === 'error'
          ? <><span>Cambios pendientes</span><button type="button" onClick={() => autosaveRef.current?.retry()}><RefreshCw size={14} /> Reintentar</button></>
          : autosaveStatus === 'saved'
            ? <><Check size={14} /> Guardado</>
            : 'Sin cambios pendientes'
  const selectedTargetIsSaved = Boolean(savedTarget && target
    && savedTarget.degreeId === target.degreeId
    && savedTarget.universityId === target.universityId)

  const headings = {
    objetivo: ['Mi objetivo', 'Calcula libremente o conecta un grado oficial con tu plan de Camino.'],
    universidades: ['Explorar grados', 'Filtra el catálogo oficial según lo que buscas y tu escenario.'],
    correccion: ['Cómo se corrige', 'Baremos oficiales explicados sin mezclar fuente e interpretación.'],
  } as const

  const freePotentialGain = Math.max(0, Math.min(4, [...freeElectives]
    .sort((a, b) => b.weighting - a.weighting)
    .slice(0, 2)
    .reduce((sum, elective) => sum + 10 * elective.weighting, 0)) - calculation.weightedPoints)

  const TABS = [
    { id: 'universidades', label: 'Explorar grados', Icon: GraduationCap },
    { id: 'objetivo', label: 'Mi objetivo', Icon: Target },
    { id: 'correccion', label: 'Cómo se corrige', Icon: BookOpen },
  ] as const

  return (
    <ClayThemeScope theme={clayTheme} className={styles.appShell}>
      <SidebarNav />
      <div className={styles.column}>
        {/* Hero a sangre con el mismo tratamiento que La Zona y Simulacros */}
        <div className={styles.heroBand}>
          <img className={styles.heroImage} src={ORIENTATION_HERO_IMG} alt="" loading="eager" />
          <div className={styles.heroOverlay}>
            <div>
              <h1 className={styles.heroTitle}>{headings[activeTab][0]}</h1>
              <p className={styles.heroCaption}>{headings[activeTab][1]}</p>
            </div>
          </div>
        </div>

        <nav className={styles.tabs} aria-label="Secciones de Orientación">
          {TABS.map(({ id, label, Icon }) => <button key={id} aria-current={activeTab === id ? 'page' : undefined} onClick={() => setActiveTab(id)}><Icon size={14} /> {label}</button>)}
          {activeTab === 'objetivo' && <button className={styles.methodButton} onClick={() => setShowMethod(true)}><Info size={14} /> ¿Cómo se calcula?</button>}
        </nav>

      <main ref={pageRef} className={styles.page}>
        <section className={styles.communityBar} aria-label="Comunidad del catálogo">
          <div><b>Consulta el sistema que te corresponde</b></div>
          <div className={styles.communitySwitch} role="group" aria-label="Selecciona comunidad">
            {ORIENTATION_COMMUNITIES.map(item => <button key={item} type="button" aria-pressed={community === item} onClick={() => changeCommunity(item)}>{item}</button>)}
          </div>
          <span>{community === 'Cataluña' ? 'Datos oficiales de preinscripción 2026' : 'Distrito único · curso 2026-2027'}</span>
        </section>
        {community === 'Cataluña' && <p className={styles.communityNote}><Info size={14} /> La nota de referencia es la del último estudiante que obtuvo plaza en la 1.ª asignación de junio de 2026; orienta, pero no garantiza admisión.</p>}

        {activeTab === 'universidades' ? <UniversityExplorer targets={officialTargets} selectedId={targetId} estimatedScore={calculation.complete ? score : null} loadState={loadState} onRetry={retryLoad} onSelect={selectTarget} /> : activeTab === 'correccion' ? <CorrectionGuide community={community} databaseCriteria={criteria} /> : (
          <>
            <section className={styles.modeChooser} aria-labelledby="orientation-mode-title">
              <div><h2 id="orientation-mode-title">¿Cómo quieres calcular?</h2><p>El simulador libre no cambia tu objetivo. El modo objetivo usa únicamente ponderaciones oficiales del grado elegido.</p></div>
              <div className={styles.modeOptions} role="radiogroup" aria-label="Modo de Orientación">
                <button type="button" role="radio" aria-checked={orientationMode === 'free'} onClick={() => chooseMode('free')}><span><b>Solo calcular mi nota</b><small>Escenario independiente</small></span></button>
                <button type="button" role="radio" aria-checked={orientationMode === 'target'} onClick={() => chooseMode('target')}><Target size={16} /><span><b>Tengo un objetivo</b><small>Grado y universidad</small></span></button>
              </div>
            </section>
            {savedTarget && !selectedTargetIsSaved && <aside className={styles.savedTargetNotice} aria-label="Objetivo guardado">
              <Check size={16} /><div><b>Objetivo guardado: {savedTarget.degree}</b><span>{savedTarget.university}{savedTarget.community ? ` · ${normalizeOrientationCommunity(savedTarget.community) ?? savedTarget.community}` : ''}. Este escenario no lo sustituirá hasta que pulses guardar.</span></div>
            </aside>}

            {orientationMode === 'free' ? <section className={styles.freeStart} aria-label="Simulador sin objetivo">
              <div className={styles.freeStartHeading}>
                <div><div><h2 id="free-simulator-title">Nota estimada</h2><p>Ajusta tu vía de acceso y tus asignaturas optativas para ver tu nota — sin objetivos ni comparaciones.</p></div></div>
                {stateReady && <div className={styles.autosaveIndicator} data-state={authenticated ? autosaveStatus : 'local'} aria-live="polite">{autosaveFeedback}</div>}
              </div>
              <AccessPathSelector value={accessPath} onChange={pathId => { setAccessPath(pathId); markStateChanged() }} />
              <AccessPathInputs community={community} scenario={scenario} onChange={updateScenario} />
              <div className={styles.freeElectivesHeading}>
                <div><b>Asignaturas optativas</b><span>Añade tus optativas con su ponderación — 0,1 o 0,2 según el grado al que apliques.</span></div>
                <button type="button" onClick={addFreeElective} disabled={freeElectives.length >= 8}><Plus size={14} /> Añadir asignatura optativa</button>
              </div>
              {freeElectives.length === 0 ? <p className={styles.freeElectivesEmpty}>Añade una asignatura optativa para ver cuánto sube tu nota.</p> : (
                <div className={styles.freeElectives}>
                  {freeElectives.map(elective => <div className={styles.freeElectiveRow} key={elective.id}>
                    <label><span>Asignatura</span><select aria-label={`Asignatura optativa ${elective.subject}`} value={elective.subject} onChange={event => updateFreeElective(elective.id, { subject: event.target.value })}>{ELECTIVE_OPTIONS.map(option => <option key={option.id} value={option.label} disabled={option.label !== elective.subject && freeElectives.some(item => item.subject === option.label)}>{option.label}</option>)}</select></label>
                    <GradeControl id={`free-elective-${elective.id}`} label={`Nota de ${elective.subject}`} value={elective.grade} onChange={grade => updateFreeElective(elective.id, { grade })} />
                    <fieldset><legend>Ponderación</legend><button type="button" aria-pressed={elective.weighting === 0.1} onClick={() => updateFreeElective(elective.id, { weighting: 0.1 })}>0,1</button><button type="button" aria-pressed={elective.weighting === 0.2} onClick={() => updateFreeElective(elective.id, { weighting: 0.2 })}>0,2</button></fieldset>
                    <button type="button" className={styles.removeElective} aria-label={`Eliminar ${elective.subject}`} onClick={() => removeFreeElective(elective.id)}><Trash2 size={15} /></button>
                  </div>)}
                </div>
              )}
              {calculation.complete && <div className={styles.freeResultBreakdown} aria-label="Desglose de nota"><div><span>Base</span><b>{formatGrade(calculation.baseScore)}</b></div><strong>+</strong><div><span>Optativas</span><b>{formatGrade(calculation.weightedPoints)}</b></div><strong>=</strong><div><span>Total</span><b>{formatGrade(score)}</b></div></div>}
              {calculation.complete && freePotentialGain > 0 && <p className={styles.freeGain}>Puedes mejorar hasta +{formatGrade(freePotentialGain)} con estas optativas.</p>}
              {!calculation.complete && <p className={styles.calculationPending}>{calculation.incompleteReason}</p>}
              <details className={styles.freeMethod}><summary>¿Cómo se calcula?</summary><p>La nota base depende de tu vía de acceso. Para admisión solo cuentan las dos mejores optativas aprobadas. Aquí eliges la ponderación para simular; comprueba el valor oficial al elegir un grado en el explorador.</p></details>
            </section> : target ? (
              <section className={styles.targetWorkspace} aria-label="Objetivo oficial" data-selected-id={target.id}>
                <div className={styles.targetSummary}>
                  <div><span className={styles.sectionKicker}>Objetivo oficial</span><h2>{target.degree}</h2><p>{target.universityAcronym ? `${target.universityAcronym} · ` : ''}{target.university}</p></div>
                  <div><span>Nota de referencia</span><b>{target.referenceScore.toLocaleString('es-ES', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</b><small>{target.referenceLabel}</small></div>
                </div>
                {stateReady && <div className={styles.autosaveIndicator} data-state={authenticated ? autosaveStatus : 'local'} aria-live="polite">{autosaveFeedback}</div>}
                <AccessPathSelector value={accessPath} onChange={pathId => { setAccessPath(pathId); setSaveState('idle'); markStateChanged() }} />
                <AccessPathInputs community={community} scenario={scenario} onChange={updateScenario} />
                <div className={styles.officialSubjectsHeading}><b>Materias que ponderan para este grado</b><span>Solo suman las dos mejores aprobadas. Los valores 0,1 y 0,2 proceden del catálogo oficial.</span></div>
                {subjects.length ? <div className={styles.officialSubjects}>{subjects.map(renderOfficialSubject)}</div> : <p className={styles.calculationPending}>No hay ponderaciones verificadas para esta oferta. No añadiremos ninguna manualmente.</p>}
                {calculation.complete ? <div className={styles.targetResult} aria-live="polite">
                  <div><span>Tu nota estimada</span><b>{formatGrade(score)} <small>/ 14</small></b><small>{formatGrade(calculation.baseScore)} base + {formatGrade(calculation.weightedPoints)} ponderadas</small></div>
                  <div data-status={difference !== null && difference >= 0 ? 'above' : 'below'}><span>Frente a la referencia</span><b>{difference !== null && difference >= 0 ? '+' : '−'}{formatGrade(Math.abs(difference ?? 0))}</b><small>{difference !== null && difference >= 0 ? 'Por encima de la referencia histórica' : 'Puntos por mejorar'}</small></div>
                </div> : <p className={styles.calculationPending}>{calculation.incompleteReason}</p>}
                <div className={styles.targetActions}>
                  <button type="button" className={styles.primaryTargetAction} onClick={saveAndOpenCamino} disabled={saveState === 'saving'}>{saveState === 'saving' ? 'Guardando…' : savedTarget?.degreeId === target.degreeId && savedTarget?.universityId === target.universityId ? 'Actualizar objetivo en Camino' : 'Guardar y usar en Camino'} <ArrowRight size={14} /></button>
                  <button type="button" onClick={() => setActiveTab('universidades')}>Cambiar grado</button>
                  {savedTarget && <button type="button" className={styles.removeTargetAction} onClick={removeSavedTarget} disabled={clearState === 'clearing'}>{clearState === 'clearing' ? 'Quitando…' : 'Quitar objetivo guardado'}</button>}
                </div>
                {saveState === 'error' && <p className={styles.saveError} role="alert">No se pudo guardar el objetivo. Comprueba tu sesión y vuelve a intentarlo.</p>}
                {clearState === 'error' && <p className={styles.saveError} role="alert">No se pudo quitar el objetivo. Vuelve a intentarlo.</p>}
              </section>
            ) : (
              <section className={styles.targetEmpty} aria-label="Objetivo sin seleccionar">
                <Target size={25} /><h2>Elige un grado y una universidad</h2><p>La selección se hace en el catálogo oficial para evitar ponderaciones o referencias inventadas.</p><button type="button" onClick={() => setActiveTab('universidades')}>Explorar grados <ArrowRight size={14} /></button>
              </section>
            )}

            {orientationMode === 'free' && calculation.complete && (
              <section className={styles.searchDegreesCta} aria-label="Buscar carreras con esta nota">
                <div><Search size={20} /><div><b>Buscar carreras con esta nota</b><span>Filtra el catálogo oficial con tu nota estimada, {formatGrade(score)} / 14, sin volver a escribirla.</span></div></div>
                <button type="button" onClick={() => setActiveTab('universidades')}>Explorar grados <ArrowRight size={14} /></button>
              </section>
            )}
          </>
        )}
      </main>
      </div>

      {showMethod && <div className={styles.modalBackdrop} role="presentation" onMouseDown={event => event.target === event.currentTarget && setShowMethod(false)}><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="method-title"><button className={styles.closeButton} aria-label="Cerrar" onClick={() => setShowMethod(false)}><X size={16} /></button><div className={styles.modalIcon}><Info size={20} /></div><h2 id="method-title">¿Cómo se calcula {pathDefinition.shortLabel}?</h2><p>{pathDefinition.officialSummary}</p><div className={styles.formula}>{calculation.formulaParts.map((part, index) => <div key={`${part.value}-${index}`}><b>{part.value}</b><span>{part.label}</span></div>)}</div><div className={styles.modalNotice}><Info size={16} /><span>Las referencias históricas orientan, pero no garantizan admisión. La acreditación oficial siempre prevalece sobre la simulación.</span></div></section></div>}
    </ClayThemeScope>
  )
}
