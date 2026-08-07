'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, Eye, EyeOff, PlayCircle, RotateCcw } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'
import SimulacroShell from '@/components/simulacros/SimulacroShell'
import { SUBJECTS, generateSimulacro } from '@/components/simulacros/data'
import type { SimulacroBlock, SimulacroDifficulty, SimulacroOption, SimulacroRecord, SimulacroSubject } from '@/components/simulacros/types'
import { useCCAA } from '@/app/hooks/useCCAA'
import KairoLoadingDot from '@/components/shared/KairoLoadingDot'
import SectionIntroCard from '@/components/shared/SectionIntroCard'
import { normalizeSubjectSlug } from '@/app/lib/camino/caminoCurriculumPlan'
import { DEFAULT_GRADE_THRESHOLD_CONFIG, resolveGradeThreshold, shouldSuggestRepeat, type GradeThresholdConfig } from '@/app/lib/camino/gradeThreshold'

type SimulacroMode = 'normal' | 'errores' | 'personalizado'
type YearChoice = 'all' | 'recent' | 'middle' | 'classic'
type OptionChoice = 'mixed' | SimulacroOption

interface ExamHistoryRow {
  id: string
  asignatura?: string | null
  tipo?: string | null
  año?: number | null
  bloque?: string | null
  opcion?: string | null
  nota?: number | null
  nota_maxima?: number | null
  enunciado?: string | null
  correccion?: string | null
  created_at?: string | null
}

const YEAR_CHOICES: Array<{ id: YearChoice; label: string; description: string }> = [
  { id: 'all', label: 'Todos los años', description: 'Kairo mezcla ejercicios oficiales disponibles.' },
  { id: 'recent', label: 'Años recientes', description: 'Entrena con convocatorias más actuales.' },
  { id: 'middle', label: 'Años intermedios', description: 'Práctica equilibrada con exámenes estándar.' },
  { id: 'classic', label: 'Años clásicos', description: 'Base sólida con ejercicios más directos.' },
]

const OPTION_CHOICES: Array<{ id: OptionChoice; label: string; description: string }> = [
  { id: 'mixed', label: 'A/B automático', description: 'La app mezcla opciones cuando haya ejercicios compatibles.' },
  { id: 'A', label: 'Opción A', description: 'Solo ejercicios de opción A.' },
  { id: 'B', label: 'Opción B', description: 'Solo ejercicios de opción B.' },
]

const BLOCK_DISPLAY: Record<string, string> = {
  Algebra: 'Álgebra', Analisis: 'Análisis', Geometria: 'Geometría', Probabilidad: 'Probabilidad'
}

function SimulacrosPage() {
  const searchParams = useSearchParams()
  const caminoBlock = searchParams.get('block')
  const caminoSource = searchParams.get('source')
  const isCaminoPartial = caminoSource === 'camino_partial' && !!caminoBlock
  const autoTriggeredRef = useRef(false)

  const [userId, setUserId] = useState('')
  const caminoSubjectParam = searchParams.get('subject') as SimulacroSubject | null
  const [subject, setSubject] = useState<SimulacroSubject>(
    () => caminoSubjectParam && caminoSubjectParam in SUBJECTS ? caminoSubjectParam : 'mates'
  )
  const [mode, setMode] = useState<SimulacroMode>('normal')
  const [yearChoice, setYearChoice] = useState<YearChoice>('all')
  const [optionChoice, setOptionChoice] = useState<OptionChoice>('mixed')
  const [historyOpen, setHistoryOpen] = useState(false)
  const [history, setHistory] = useState<SimulacroRecord[]>([])
  const [examHistory, setExamHistory] = useState<ExamHistoryRow[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [gradeThresholdConfig, setGradeThresholdConfig] = useState<GradeThresholdConfig>(DEFAULT_GRADE_THRESHOLD_CONFIG)
  const [repeatingId, setRepeatingId] = useState<string | null>(null)
  const router = useRouter()
  const { ccaa } = useCCAA()
  const stats = useMemo(() => buildStats(history), [history])
  const weakCandidateCount = useMemo(
    () => buildWeakBlocks(history, examHistory, subject, ccaa).length,
    [history, examHistory, subject, ccaa]
  )

  useEffect(() => {
    // React 18 batchea estos setStates en un solo render — no hay riesgo real de cascade.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMode('normal')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setYearChoice('all')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOptionChoice('mixed')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setErrorMessage('')
  }, [ccaa])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login')
      else {
        setUserId(data.user.id)
        void loadHistory(data.user.id)
      }
    })
  }, [router])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token
      if (!token) return
      try {
        const res = await fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) return
        const json = await res.json() as { grade_threshold_mode?: string; grade_threshold?: number | null; subject_grade_thresholds?: Record<string, number> }
        setGradeThresholdConfig({
          mode: json.grade_threshold_mode === 'per_subject' ? 'per_subject' : 'general',
          general: typeof json.grade_threshold === 'number' ? json.grade_threshold : null,
          bySubject: json.subject_grade_thresholds ?? {},
        })
      } catch { /* usa el umbral por defecto si falla */ }
    })
  }, [])

  useEffect(() => {
    if (!isCaminoPartial || !userId || autoTriggeredRef.current) return
    autoTriggeredRef.current = true
    void createSimulacro()
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadHistory(uid = userId) {
    if (!uid) return
    const [simulacrosResult, examenesResult] = await Promise.all([
      supabase
        .from('historial_simulacros')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('historial_examenes')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(120)
    ])
    setHistory((simulacrosResult.data ?? []) as SimulacroRecord[])
    setExamHistory((examenesResult.data ?? []) as ExamHistoryRow[])
  }

  async function createSimulacro() {
    if (loading) return
    setLoading(true)
    setErrorMessage('')

    try {
      if (!SUBJECTS[subject].available) {
        setErrorMessage(`${SUBJECTS[subject].label} estará disponible en simulacros cuando carguemos suficientes ejercicios oficiales.`)
        setLoading(false)
        return
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      const currentUserId = sessionData.session?.user?.id
      if (sessionError || !currentUserId) {
        console.error('SIMULACRO_SESSION_ERROR', sessionError)
        setLoading(false)
        router.push('/login')
        return
      }
      setUserId(currentUserId)

      const effectiveYearChoice = mode === 'personalizado' ? yearChoice : 'all'
      const yearSelection = yearChoiceToSelection(effectiveYearChoice)
      const optionSelection = effectiveOptionChoice(mode, subject, optionChoice)
      const technicalDifficulty = technicalDifficultyForYearChoice(effectiveYearChoice)
      const generatorOption: SimulacroOption = optionSelection === 'B' ? 'B' : 'A'
      const generated = generateSimulacro(subject, technicalDifficulty, generatorOption, ccaa, {
        yearSelection,
        optionSelection,
        ...(isCaminoPartial && caminoBlock ? { blockFilter: caminoBlock } : {}),
      })

      const weakBlocks = mode === 'errores'
        ? buildWeakBlocks(history, examHistory, subject, ccaa)
        : []
      if (mode === 'errores' && weakBlocks.length === 0) {
        setErrorMessage('Para crear un simulacro con tus peores notas necesito al menos una corrección previa de esta asignatura.')
        setLoading(false)
        return
      }

      const finalBlocks = mode === 'errores'
        ? mergeBlocksForExam(weakBlocks, generated?.blocks ?? [], ccaa)
        : generated?.blocks ?? []

      if (!generated && finalBlocks.length === 0) {
        setErrorMessage('No hay suficientes ejercicios disponibles para crear este simulacro.')
        setLoading(false)
        return
      }
      const generatedId = generated?.id ?? crypto.randomUUID()
      const storedOption = finalBlocks.find(block => block.option === 'A' || block.option === 'B')?.option ?? generatorOption
      const configLabel = isCaminoPartial && caminoBlock
        ? `Parcial · ${caminoBlock}`
        : buildConfigLabel(mode, effectiveYearChoice, optionSelection)
      const now = new Date().toISOString()
      const row = {
        id: generatedId,
        user_id: currentUserId,
        asignatura: subject,
        opcion: storedOption,
        dificultad: technicalDifficulty,
        dificultad_real: configLabel,
        bloques: finalBlocks,
        respuestas_parciales: {},
        estado: 'en_progreso',
        created_at: now,
        updated_at: now
      }
      const { error } = await supabase.from('historial_simulacros').insert(row)
      if (error) {
        console.error('SIMULACRO_INSERT_ERROR', error)
        setErrorMessage('No se pudo crear el simulacro. Revisa la conexión o la tabla historial_simulacros en Supabase.')
        setLoading(false)
        return
      }
      router.push(`/simulacros/${generatedId}`)
    } catch (error) {
      console.error('SIMULACRO_CREATE_ERROR', error)
      setErrorMessage('No se pudo crear el simulacro ahora mismo. Inténtalo de nuevo en unos segundos.')
      setLoading(false)
    }
  }

  // "Repetir para mejorar": mismo simulacro EXACTO que el intento de
  // referencia (mismos bloques/preguntas, tal cual se guardaron en su
  // momento) — no uno nuevo generado con otras preguntas. Al corregirlo,
  // /api/simulacro compara la nota nueva contra la de este intento y solo
  // otorga XP reducido si de verdad mejora (ver repeatImprovement.ts).
  async function repeatSimulacro(recordId: string) {
    if (repeatingId) return
    setRepeatingId(recordId)
    setErrorMessage('')
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const currentUserId = sessionData.session?.user?.id
      if (!currentUserId) { router.push('/login'); return }

      const original = history.find(item => item.id === recordId)
      if (!original) { setErrorMessage('No hemos encontrado ese simulacro para repetirlo.'); return }

      // Si el original era una práctica parcial (__practice_session, creada
      // desde Camino PAU), la repetición debe seguir siéndolo: mismo flujo
      // de 45 min y mismo bloque, no el simulacro completo de 90 min. Sin
      // conservar el flag aquí, repetir una práctica parcial la convertía en
      // un "simulacro" de 90 min con solo sus 3 preguntas originales.
      const originalResultado = original.resultado_json && typeof original.resultado_json === 'object' ? original.resultado_json : {}
      const isPracticeSession = Boolean(originalResultado.__practice_session)

      const newId = crypto.randomUUID()
      const now = new Date().toISOString()
      const { error } = await supabase.from('historial_simulacros').insert({
        id: newId,
        user_id: currentUserId,
        asignatura: original.asignatura,
        opcion: original.opcion,
        dificultad: original.dificultad,
        dificultad_real: original.dificultad_real,
        bloques: original.bloques,
        respuestas_parciales: {},
        estado: 'en_progreso',
        repeated_from_id: recordId,
        created_at: now,
        updated_at: now,
        ...(isPracticeSession
          ? { resultado_json: { __practice_session: true, block: originalResultado.block, subject: originalResultado.subject, comunidad: originalResultado.comunidad } }
          : {}),
      })
      if (error) {
        console.error('SIMULACRO_REPEAT_ERROR', error)
        setErrorMessage('No se pudo preparar la repetición. Inténtalo de nuevo en unos segundos.')
        return
      }
      router.push(isPracticeSession ? `/simulacros/practica/${newId}` : `/simulacros/${newId}`)
    } finally {
      setRepeatingId(null)
    }
  }

  const cfg = SUBJECTS[subject]
  const autoInfo = autoModeInfo(mode, weakCandidateCount)
  const effectiveYearChoiceRender = mode === 'personalizado' ? yearChoice : 'all'
  const optionSelectionRender = effectiveOptionChoice(mode, subject, optionChoice)

  const BLACKBOARD_IMG = 'https://d8j0ntlcm91z4.cloudfront.net/user_3FE1qfsmGuEldtlzta7SsGkWNIV/hf_20260725_120452_c4495c67-d88a-4442-b112-50e991ce414f.png'
  const SUBJECT_HERO_IMGS: Record<string, string> = {
    mates:             'https://d8j0ntlcm91z4.cloudfront.net/user_3FE1qfsmGuEldtlzta7SsGkWNIV/hf_20260725_130632_68dfbf7a-aa85-468a-87c7-855c54c5b88f.png',
    matematicas_ccss:  'https://d8j0ntlcm91z4.cloudfront.net/user_3FE1qfsmGuEldtlzta7SsGkWNIV/hf_20260726_000821_38eb7eb4-e4a8-415f-b754-88efab45f708.png',
    fisica:            'https://d8j0ntlcm91z4.cloudfront.net/user_3FE1qfsmGuEldtlzta7SsGkWNIV/hf_20260726_000822_ca28aa98-71b6-42b5-82a1-eb035f90e318.png',
    quimica:           'https://d8j0ntlcm91z4.cloudfront.net/user_3FE1qfsmGuEldtlzta7SsGkWNIV/hf_20260726_000824_d921117a-9232-49e7-b9c2-08ffffcd4475.png',
    biologia:          'https://d8j0ntlcm91z4.cloudfront.net/user_3FE1qfsmGuEldtlzta7SsGkWNIV/hf_20260726_000825_0fbd7567-1cac-444c-81e2-36c2551b946c.png',
    lengua:            'https://d8j0ntlcm91z4.cloudfront.net/user_3FE1qfsmGuEldtlzta7SsGkWNIV/hf_20260725_134153_21d8ecce-c198-4ae1-8fc9-22814072fdbc.png',
    historia:          'https://d8j0ntlcm91z4.cloudfront.net/user_3FE1qfsmGuEldtlzta7SsGkWNIV/hf_20260724_175525_a082853d-a113-4ae3-bd27-0bff89dc2c5b.png',
    historia_filosofia:'https://d8j0ntlcm91z4.cloudfront.net/user_3FE1qfsmGuEldtlzta7SsGkWNIV/hf_20260726_000852_5474f700-2ed4-44ef-83b0-2a54eeff1d80.png',
    ingles:            'https://d8j0ntlcm91z4.cloudfront.net/user_3FE1qfsmGuEldtlzta7SsGkWNIV/hf_20260726_000853_ea284c50-cadc-413d-8412-9ddfb0c44ec9.png',
  }
  const heroImg = SUBJECT_HERO_IMGS[subject] ?? BLACKBOARD_IMG

  const modeBadgeLabel = (m: SimulacroMode) => {
    if (m === 'normal') return 'Recomendado'
    if (m === 'errores') return weakCandidateCount > 0 ? `${weakCandidateCount} detectados` : 'Necesita historial'
    return 'Ajustable'
  }
  const modeBadgeColor = (m: SimulacroMode) => {
    if (m === 'errores') return weakCandidateCount > 0 ? '#15803d' : '#b45309'
    if (m === 'personalizado') return '#64748b'
    return cfg.color
  }

  return (
    <SimulacroShell>
    {/* ── BLACKBOARD HERO ── */}
    <div className="sim-hero" style={{ position: 'relative', height: 340, overflow: 'hidden', flexShrink: 0 }}>
      <img src={heroImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(.45) saturate(.6)', display: 'block', transition: 'opacity 400ms ease' }} />
      <div className="sim-hero-overlay" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(15,23,42,.2) 0%, rgba(15,23,42,.85) 100%)', padding: '28px 32px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.18em', textTransform: 'uppercase', color: '#93c5fd', marginBottom: 6 }}>Simulacros PAU · {ccaa}</div>
        <div className="sim-hero-count" style={{ fontSize: 100, fontWeight: 900, color: 'white', lineHeight: .88, letterSpacing: '-.04em', marginBottom: 8 }}>
          {stats.completedCount > 0 ? stats.completedCount : '—'}
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.5)', letterSpacing: '.12em', textTransform: 'uppercase' }}>
          {stats.completedCount > 0 ? 'Simulacros completados en tu historial' : 'Completa tu primer simulacro para ver tus estadísticas'}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap', alignItems: 'center' }}>
          {stats.completedCount > 0 && <>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 10, padding: '8px 14px' }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: 'white' }}>{stats.bestScore == null ? '—' : formatScore(stats.bestScore)}</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Mejor nota</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 10, padding: '8px 14px' }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: 'white' }}>{stats.averageScore == null ? '—' : formatScore(stats.averageScore)}</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Media</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 10, padding: '8px 14px' }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: 'white' }}>{stats.averageTime == null ? '—' : `${stats.averageTime} min`}</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Tiempo medio</span>
            </div>
          </>}
          <button
            onClick={() => { setHistoryOpen(!historyOpen); void loadHistory() }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 10, padding: '8px 14px', color: 'rgba(255,255,255,.75)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
          >
            {historyOpen ? <EyeOff size={13} /> : <Eye size={13} />}
            {historyOpen ? 'Ocultar historial' : 'Mis simulacros'}
          </button>
        </div>
      </div>
    </div>

    {/* ── CONTENT ── */}
    <div style={{ background: 'white', borderTop: '2px solid #0f172a', flex: 1 }}>

      <div style={{ padding: '16px 24px 0' }}>
        <SectionIntroCard
          hintKey="hint_simulacros"
          line1="Exámenes cronometrados como el día real."
          line2="Elige asignatura y tiempo, responde todo y Kairo lo corrige al terminar. Úsalo para entrenar bajo presión."
        />
      </div>

      {/* Camino parcial banner */}
      {isCaminoPartial && caminoBlock && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 24px', borderBottom: '1px solid #dbeafe', background: '#eff6ff', color: '#1e40af', fontSize: 13, fontWeight: 600 }}>
          <PlayCircle size={15} style={{ flexShrink: 0 }} />
          Simulacro enfocado en <strong style={{ marginLeft: 4 }}>{BLOCK_DISPLAY[caminoBlock] ?? caminoBlock}</strong>
          <span style={{ marginLeft: 4, fontWeight: 400, color: '#3b82f6' }}>— generando para tu parcial...</span>
        </div>
      )}

      {/* History panel */}
      {historyOpen && (
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 900, color: '#0f172a' }}>Mis simulacros anteriores</span>
            <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 10px', borderRadius: 999, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>{history.length} total</span>
          </div>
          {history.length === 0 ? (
            <p style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>Todavía no tienes simulacros guardados.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 280, overflowY: 'auto' }}>
              {history.map(item => {
                const threshold = resolveGradeThreshold(gradeThresholdConfig, normalizeSubjectSlug(item.asignatura))
                const suggestRepeat = item.estado === 'completado' && shouldSuggestRepeat(item.nota_final ?? null, threshold)
                // Las prácticas parciales (creadas desde Camino PAU vía
                // /api/practica-parcial) viven en la misma tabla que los
                // simulacros completos, marcadas con __practice_session. Sin
                // distinguirlas aquí, continuar una práctica en pausa desde
                // esta lista abría /simulacros/[id] (pensado para el
                // simulacro de 90 min) en vez de /simulacros/practica/[id]
                // (45 min) — mismo historial, contexto y duración distintos
                // según por dónde se entrara a continuar la misma sesión.
                const isPracticeSession = Boolean(item.resultado_json && typeof item.resultado_json === 'object' && item.resultado_json.__practice_session)
                const continueHref = isPracticeSession ? `/simulacros/practica/${item.id}` : `/simulacros/${item.id}`
                const rowHref = item.estado === 'completado' ? `/simulacros/${item.id}/results` : continueHref
                return (
                // Antes esto era un único <a> con el botón "Repetir para
                // mejorar" anidado dentro (<button> dentro de <a>, contenido
                // interactivo anidado inválido en HTML) — el navegador podía
                // reescribir esa estructura al parsear el HTML servido, así
                // que el click a veces no llegaba al handler del botón ni se
                // podía distinguir de un click en la fila entera. Ahora la
                // fila es un <div> y son dos <a display:contents> separados
                // (mismo layout, cero cambio visual) los que cubren el resto
                // de la fila, dejando "Repetir" como único elemento
                // interactivo real, sin anidar.
                <div
                  key={item.id}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '9px 12px', borderRadius: 10, border: '1px solid #f1f5f9', background: 'white', transition: 'border-color .12s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#93c5fd'; (e.currentTarget as HTMLElement).style.background = '#eff6ff' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#f1f5f9'; (e.currentTarget as HTMLElement).style.background = 'white' }}
                >
                  <a href={rowHref} style={{ display: 'contents', textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        fontSize: 12, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        color: item.estado === 'completado' ? '#94a3b8' : '#0f172a',
                        textDecoration: item.estado === 'completado' ? 'line-through' : 'none',
                      }}>{SUBJECTS[item.asignatura]?.label ?? item.asignatura} · {item.dificultad_real ?? item.dificultad}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>Última entrada: {formatDate(item.updated_at ?? item.created_at)} · {item.estado === 'completado' ? `${item.nota_final ?? '-'}/10` : 'En progreso'}</div>
                    </div>
                  </a>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <a href={rowHref} style={{ display: 'contents', textDecoration: 'none', color: 'inherit' }}>
                      {item.estado === 'completado'
                        ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 999, background: '#f0fdf4', color: '#15803d' }}><CheckCircle2 size={11} />Completado</span>
                        : <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 999, background: '#fffbeb', color: '#b45309' }}>En progreso</span>}
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: '#f1f5f9', color: '#475569' }}>{optionSummaryForRecord(item)}</span>
                    </a>
                    {suggestRepeat && (
                      <button
                        type="button"
                        onClick={() => void repeatSimulacro(item.id)}
                        disabled={repeatingId === item.id}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 900, padding: '5px 11px', borderRadius: 999, background: 'linear-gradient(135deg, #f59e0b, #fb923c)', color: 'white', border: 'none', boxShadow: '0 2px 6px rgba(217,119,6,.4)', cursor: repeatingId === item.id ? 'default' : 'pointer', opacity: repeatingId === item.id ? .6 : 1 }}
                      >
                        <RotateCcw size={11} />
                        {repeatingId === item.id ? 'Preparando…' : 'Repetir para mejorar'}
                      </button>
                    )}
                  </div>
                </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <div className="sim-main" style={{ padding: 24, maxWidth: 860, margin: '0 auto' }}>

        {/* Error */}
        {errorMessage && (
          <div role="alert" style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', fontSize: 13, fontWeight: 600, color: '#b91c1c' }}>{errorMessage}</div>
        )}

        {/* ── STEP 1: ASIGNATURA ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.14em', textTransform: 'uppercase', color: '#94a3b8' }}>Asignatura</div>
            <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 999, background: cfg.light, color: cfg.color, border: `1px solid ${cfg.color}30` }}>{cfg.label}</span>
          </div>
          <div className="sim-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {(Object.keys(SUBJECTS) as SimulacroSubject[]).map(key => {
              const s = SUBJECTS[key]
              const isActive = subject === key
              return (
                <button
                  key={key}
                  disabled={!s.available}
                  onClick={() => s.available && setSubject(key)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '14px 10px', borderRadius: 12, border: `2px solid ${isActive ? s.color : '#e2e8f0'}`, background: isActive ? s.light : 'white', cursor: s.available ? 'pointer' : 'not-allowed', opacity: s.available ? 1 : 0.45, transition: 'all .12s', position: 'relative', textAlign: 'center' }}
                >
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                  <div style={{ fontSize: 11, fontWeight: 800, color: isActive ? s.color : '#334155', lineHeight: 1.3 }}>{s.label}</div>
                  {!s.available && <span style={{ position: 'absolute', top: 4, right: 4, fontSize: 8, fontWeight: 900, padding: '1px 4px', borderRadius: 999, background: '#f0fdf4', color: '#15803d' }}>Pronto</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── STEP 2: TIPO ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.14em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 10 }}>Tipo de simulacro</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {(['normal', 'errores', 'personalizado'] as SimulacroMode[]).map(m => {
              const isActive = mode === m
              const labels: Record<SimulacroMode, string> = { normal: 'Simulacro normal', errores: 'Peores notas', personalizado: 'Personalizado' }
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 6,
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: `1.5px solid ${isActive ? cfg.color : '#e2e8f0'}`,
                    background: isActive ? cfg.light : 'white',
                    cursor: 'pointer',
                    transition: 'border-color .12s, background .12s',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 800, color: isActive ? cfg.color : '#334155', lineHeight: 1.2 }}>
                    {labels[m]}
                  </span>
                  <span style={{
                    fontSize: 9,
                    fontWeight: 900,
                    letterSpacing: '.08em',
                    textTransform: 'uppercase',
                    color: isActive ? cfg.color : modeBadgeColor(m),
                    opacity: isActive ? 1 : 0.75,
                  }}>
                    {modeBadgeLabel(m)}
                  </span>
                </button>
              )
            })}
          </div>
          {/* Auto info */}
          {mode !== 'personalizado' && (
            <div style={{ marginTop: 10, padding: '12px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a' }}>{autoInfo.title}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginTop: 4, lineHeight: 1.5 }}>{autoInfo.description}</div>
            </div>
          )}
        </div>

        {/* ── STEP 3: CONFIG (personalizado) ── */}
        {mode === 'personalizado' && (
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: '#0f172a', marginBottom: 14 }}>Ajustes personalizados</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 8 }}>Años de convocatoria</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
              {YEAR_CHOICES.map(item => {
                const isActive = yearChoice === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setYearChoice(item.id)}
                    style={{ fontSize: 11, fontWeight: 700, padding: '6px 14px', borderRadius: 10, border: `1px solid ${isActive ? cfg.color : '#e2e8f0'}`, background: isActive ? cfg.light : 'white', color: isActive ? cfg.color : '#334155', cursor: 'pointer', transition: 'all .12s' }}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
            {yearChoice !== 'all' && (
              <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 12, padding: '6px 10px', background: 'white', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                {YEAR_CHOICES.find(y => y.id === yearChoice)?.description}
              </div>
            )}
            {subject !== 'lengua' ? (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 8 }}>Opción del examen</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {OPTION_CHOICES.map(item => {
                    const isActive = optionChoice === item.id
                    return (
                      <button
                        key={item.id}
                        onClick={() => setOptionChoice(item.id)}
                        style={{ fontSize: 11, fontWeight: 700, padding: '6px 14px', borderRadius: 10, border: `1px solid ${isActive ? cfg.color : '#e2e8f0'}`, background: isActive ? cfg.light : 'white', color: isActive ? cfg.color : '#334155', cursor: 'pointer', transition: 'all .12s' }}
                      >
                        {item.label}
                      </button>
                    )
                  })}
                </div>
              </>
            ) : (
              <div style={{ padding: '10px 14px', borderRadius: 10, background: `${cfg.color}0f`, border: `1px solid ${cfg.color}24`, fontSize: 12, fontWeight: 600, color: '#475569', lineHeight: 1.5 }}>
                Lengua se genera como examen oficial coherente. Kairo elige automáticamente la versión compatible con el banco de ejercicios.
              </div>
            )}
          </div>
        )}

        {/* ── SUMMARY + CTA ── */}
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '.1em', color: '#94a3b8' }}>Listo para crear</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginTop: 3 }}>
                {cfg.label} · {buildConfigLabel(mode, effectiveYearChoiceRender, optionSelectionRender)}
              </div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 800, padding: '4px 12px', borderRadius: 999, background: `${cfg.color}12`, color: cfg.color, border: `1px solid ${cfg.color}22` }}>{ccaa}</span>
          </div>
          <button
            onClick={createSimulacro}
            disabled={loading || !userId || !SUBJECTS[subject].available}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 15, fontWeight: 900, padding: '16px', borderRadius: 12, background: loading || !userId || !SUBJECTS[subject].available ? '#94a3b8' : '#2563eb', color: 'white', border: 'none', boxShadow: loading || !userId || !SUBJECTS[subject].available ? 'none' : '0 4px 20px rgba(37,99,235,.32)', cursor: loading || !userId || !SUBJECTS[subject].available ? 'not-allowed' : 'pointer', transition: 'background .15s' }}
          >
            {loading ? <KairoLoadingDot /> : <PlayCircle size={18} />}
            {loading
              ? 'Generando simulacro...'
              : !SUBJECTS[subject].available
              ? `Simulacros de ${SUBJECTS[subject].short} próximamente`
              : userId
              ? ctaLabel(mode, cfg.short)
              : 'Cargando sesión...'}
          </button>
        </div>
      </div>
    </div>
    </SimulacroShell>
  )
}


function buildStats(history: SimulacroRecord[]) {
  const attempted = history.filter(item => item.estado === 'completado')
  // nota_final null/undefined significa que la corrección nunca llegó a
  // completarse (fallo de IA, reintento pendiente...), no una nota real de
  // 0 — Number(null) es 0 y es "finito", así que sin este filtro explícito
  // esas correcciones fallidas contaminaban la media y el tiempo medio hacia
  // abajo aunque el alumno sí hubiera entregado el simulacro.
  const scored = attempted.filter(item => typeof item.nota_final === 'number' && Number.isFinite(item.nota_final))
  const scores = scored.map(item => Number(item.nota_final))
  const times = scored.map(item => Number(item.tiempo_empleado)).filter(t => Number.isFinite(t) && t > 0)
  return {
    completedCount: attempted.length,
    averageScore: scores.length ? average(scores) : null,
    bestScore: scores.length ? Math.max(...scores) : null,
    averageTime: times.length ? Math.round(average(times)) : null,
    lastCompleted: attempted[0] ?? null
  }
}

function average(values: number[]) {
  if (!values.length) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function formatScore(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? number.toFixed(2).replace(/\.00$/, '') : '-'
}

function formatDate(value?: string) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(new Date(value))
}

function yearChoiceToSelection(choice: YearChoice): 'all' | SimulacroDifficulty {
  if (choice === 'recent') return 'Difícil'
  if (choice === 'middle') return 'Media'
  if (choice === 'classic') return 'Fácil'
  return 'all'
}

function technicalDifficultyForYearChoice(choice: YearChoice): SimulacroDifficulty {
  if (choice === 'recent') return 'Difícil'
  if (choice === 'classic') return 'Fácil'
  return 'Media'
}

function buildConfigLabel(mode: SimulacroMode, yearChoice: YearChoice, optionChoice: OptionChoice) {
  if (mode === 'normal') return 'Normal · cualquier año · opciones mixtas'
  if (mode === 'errores') return 'Peores notas · ejercicios a remontar'
  return `Personalizado · ${yearChoiceLabel(yearChoice)} · ${optionChoiceLabel(optionChoice)}`
}

function effectiveOptionChoice(mode: SimulacroMode, subject: SimulacroSubject, optionChoice: OptionChoice): OptionChoice {
  if (mode !== 'personalizado' || subject === 'lengua') return 'mixed'
  return optionChoice
}

function autoModeInfo(mode: SimulacroMode, weakCandidateCount: number) {
  if (mode === 'errores') {
    return {
      title: weakCandidateCount > 0 ? 'Repaso dirigido por tus notas' : 'Necesita correcciones previas',
      description: weakCandidateCount > 0
        ? `Kairo usará primero ${weakCandidateCount} ejercicio${weakCandidateCount === 1 ? '' : 's'} donde tu porcentaje fue más bajo y completará el examen si hace falta.`
        : 'Completa alguna corrección o simulacro de esta asignatura para que Kairo pueda detectar tus puntos débiles.'
    }
  }
  return {
    title: 'Configuración automática',
    description: 'Cualquier año oficial disponible, opciones A/B mezcladas cuando existan y bloques elegidos para parecerse a una PAU real.'
  }
}

function ctaLabel(mode: SimulacroMode, subjectShort: string) {
  if (mode === 'errores') return `Crear simulacro de errores de ${subjectShort}`
  if (mode === 'personalizado') return `Crear simulacro personalizado de ${subjectShort}`
  return `Empezar simulacro normal de ${subjectShort}`
}

function yearChoiceLabel(choice: YearChoice) {
  const item = YEAR_CHOICES.find(entry => entry.id === choice)
  return item?.label.toLowerCase() ?? 'todos los años'
}

function optionChoiceLabel(choice: OptionChoice) {
  if (choice === 'mixed') return 'A/B automático'
  return `opción ${choice}`
}

function optionSummaryForRecord(record: SimulacroRecord) {
  const options = Array.from(new Set((record.bloques ?? []).map(block => block.option).filter(Boolean))).sort()
  if (options.length > 1) return 'Opciones A/B'
  if (options[0]) return `Opción ${options[0]}`
  return `Opción ${record.opcion}`
}

function buildWeakBlocks(
  history: SimulacroRecord[],
  examHistory: ExamHistoryRow[],
  subject: SimulacroSubject,
  ccaa: string
) {
  const scored = [
    ...weakBlocksFromSimulacros(history, subject, ccaa),
    ...weakBlocksFromCorrections(examHistory, subject, ccaa)
  ].sort((a, b) => a.score - b.score)

  const used = new Set<string>()
  const blocks: SimulacroBlock[] = []
  for (const item of scored) {
    const key = blockIdentity(item.block)
    if (used.has(key)) continue
    used.add(key)
    blocks.push(item.block)
    if (blocks.length === 4) break
  }
  return blocks
}

function weakBlocksFromSimulacros(history: SimulacroRecord[], subject: SimulacroSubject, ccaa: string) {
  return history
    .filter(record => record.estado === 'completado' && record.asignatura === subject && recordMatchesCommunity(record, ccaa))
    .flatMap(record => {
      const details = Array.isArray(record.resultado_json?.desglose_bloques) ? record.resultado_json.desglose_bloques : []
      return (record.bloques ?? []).map((block, index) => ({
        block: { ...block, numero: 0, comunidad: block.comunidad ?? record.comunidad ?? ccaa },
        score: scorePercent(details[index], block, record.nota_final)
      }))
    })
    .filter(item => Number.isFinite(item.score))
}

function weakBlocksFromCorrections(rows: ExamHistoryRow[], subject: SimulacroSubject, ccaa: string) {
  return rows
    .filter(row => rowMatchesSubject(row, subject))
    .map(row => {
      const max = Number(row.nota_maxima ?? 2.5)
      const score = Number(row.nota)
      const percent = Number.isFinite(score) && Number.isFinite(max) && max > 0 ? (score / max) * 100 : 100
      return {
        score: percent,
        block: {
          id: `historial-${row.id}`,
          numero: 0,
          tema: row.bloque || row.tipo || SUBJECTS[subject].label,
          year: Number(row.año ?? new Date().getFullYear()),
          convocatoria: row.tipo || 'Corrección previa',
          option: row.opcion === 'B' ? 'B' as SimulacroOption : 'A' as SimulacroOption,
          puntuacion: Number.isFinite(max) && max > 0 ? max : 2.5,
          enunciado: row.enunciado || 'Ejercicio recuperado de tu historial de correcciones.',
          criterios: undefined,
          comunidad: ccaa
        }
      }
    })
    .filter(item => Number.isFinite(item.score))
}

function mergeBlocksForExam(primary: SimulacroBlock[], fallback: SimulacroBlock[], ccaa: string) {
  const used = new Set<string>()
  const selected: SimulacroBlock[] = []
  for (const block of [...primary, ...fallback]) {
    const key = blockIdentity(block)
    if (used.has(key)) continue
    used.add(key)
    selected.push({ ...block, numero: selected.length + 1, comunidad: block.comunidad ?? ccaa })
    if (selected.length === 4) break
  }
  return selected
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function scorePercent(detail: any, block: SimulacroBlock, fallbackScore?: number | null) {
  const directPercent = Number(detail?.porcentaje_logrado ?? detail?.porcentaje)
  if (Number.isFinite(directPercent)) return directPercent
  const max = Number(detail?.puntos_maximos ?? block.puntuacion)
  const score = Number(detail?.puntos_conseguidos ?? detail?.nota)
  if (Number.isFinite(score) && Number.isFinite(max) && max > 0) return (score / max) * 100
  const fallback = Number(fallbackScore)
  return Number.isFinite(fallback) ? fallback * 10 : 100
}

function rowMatchesSubject(row: ExamHistoryRow, subject: SimulacroSubject) {
  const value = String(row.asignatura ?? '').toLowerCase()
  if (subject === 'mates') return value === 'mates' || value === 'matematicas' || value === 'matemáticas'
  return value === subject
}

function recordMatchesCommunity(record: SimulacroRecord, ccaa: string) {
  const community = record.comunidad ?? record.bloques?.[0]?.comunidad
  return !community || community === ccaa
}

function blockIdentity(block: SimulacroBlock) {
  const statement = (block.enunciado || '').replace(/\s+/g, ' ').trim().slice(0, 160)
  if (statement) return `${block.year || ''}:${statement}`
  return `${block.id || ''}:${block.year || ''}:${block.tema || ''}`
}

export default function SimulacrosPageRoot() {
  return <Suspense><SimulacrosPage /></Suspense>
}
