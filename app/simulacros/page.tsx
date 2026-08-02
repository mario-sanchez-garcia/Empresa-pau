'use client'

import { Suspense, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Activity,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  FileCheck2,
  Grid3x3,
  HelpCircle,
  Lightbulb,
  PlayCircle,
  Rocket,
  Shuffle,
  SlidersHorizontal,
  Star,
  Trophy,
} from 'lucide-react'
import { supabase } from '@/app/lib/supabase'
import SimulacroShell from '@/components/simulacros/SimulacroShell'
import { SUBJECTS, generateSimulacro } from '@/components/simulacros/data'
import type { SimulacroBlock, SimulacroDifficulty, SimulacroOption, SimulacroRecord, SimulacroSubject } from '@/components/simulacros/types'
import { useCCAA } from '@/app/hooks/useCCAA'
import KairoLoadingDot from '@/components/shared/KairoLoadingDot'
import SectionIntroCard from '@/components/shared/SectionIntroCard'

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

  const isPersonalizadoOptionToggle = subject !== 'lengua'
  const mezclaActiva = mode === 'personalizado' ? optionChoice === 'mixed' : true
  const readyLabel = `${cfg.label} · ${buildConfigLabel(mode, effectiveYearChoiceRender, optionSelectionRender)}`

  return (
    <SimulacroShell>
      <style>{`
        .simu-screen {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding: 22px 28px 40px;
          font-family: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
          background: #fff;
        }
        .simu-shell { width: 100%; max-width: 1500px; margin: 0 auto; }
        .simu-hero { position: relative; height: 300px; border-radius: 20px; overflow: hidden; margin-bottom: 20px; box-shadow: 0 18px 50px rgba(37,99,235,.14); }
        .simu-hero img { width: 100%; height: 100%; object-fit: cover; filter: brightness(.45) saturate(.65); }
        .simu-hero-overlay { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: flex-end; padding: 26px 30px; background: linear-gradient(to top, rgba(0,0,0,.78) 0%, rgba(0,0,0,.25) 60%, transparent 100%); }
        .simu-breadcrumb { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; color: #93c5fd; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 10px; }
        .simu-breadcrumb span:last-child { color: rgba(255,255,255,.55); }
        .simu-title { font-size: clamp(26px, 3vw, 38px); font-weight: 900; color: #fff; letter-spacing: -.03em; line-height: 1; margin-bottom: 6px; }
        .simu-subtitle { font-size: 13px; font-weight: 500; color: rgba(255,255,255,.6); margin-bottom: 18px; }
        .simu-hero-stats { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 10px; max-width: 720px; }
        .simu-hero-stat { display: flex; align-items: center; gap: 10px; }
        .simu-hero-stat-icon { width: 34px; height: 34px; border-radius: 9px; background: #2563eb; display: grid; place-items: center; color: #fff; flex-shrink: 0; }
        .simu-hero-stat-val { font-size: 19px; font-weight: 900; color: #fff; line-height: 1; }
        .simu-hero-stat-val em { font-style: normal; font-size: .55em; color: rgba(255,255,255,.5); font-weight: 800; margin-left: 2px; }
        .simu-hero-stat-label { font-size: 9px; font-weight: 700; color: rgba(255,255,255,.5); text-transform: uppercase; letter-spacing: .06em; margin-top: 2px; }
        .simu-hero-link { margin-top: 18px; align-self: flex-start; display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.2); border-radius: 10px; padding: 8px 16px; color: #fff; font-size: 12px; font-weight: 700; cursor: pointer; }
        .simu-camino-banner { display: flex; align-items: center; gap: 10px; padding: 12px 20px; border-radius: 12px; border: 1px solid #dbeafe; background: #eff6ff; color: #1e40af; font-size: 13px; font-weight: 600; margin-bottom: 20px; }
        .simu-history-panel { padding: 16px 20px; border-radius: 14px; border: 1px solid #e2e8f0; background: #f8fafc; margin-bottom: 20px; }
        .simu-layout { display: grid; grid-template-columns: 1fr 300px; gap: 20px; align-items: start; }
        .simu-main-col { min-width: 0; display: flex; flex-direction: column; gap: 18px; }
        .simu-card { padding: 20px; }
        .simu-card-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 16px; }
        .simu-card-title { display: flex; align-items: center; gap: 9px; font-size: 15px; font-weight: 800; color: #0f172a; }
        .simu-step-num { width: 22px; height: 22px; border-radius: 999px; background: #2563eb; color: #fff; font-size: 12px; font-weight: 900; display: grid; place-items: center; flex-shrink: 0; }
        .simu-help-link { display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; font-weight: 700; color: #64748b; background: none; border: 0; cursor: pointer; }
        .simu-subject-grid { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 10px; }
        .simu-subject-card { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 18px 10px; border-radius: 12px; border: 1.5px solid #e2e8f0; background: #fff; cursor: pointer; transition: all .12s; text-align: center; min-height: 100px; }
        .simu-subject-card.is-active { box-shadow: inset 0 0 0 1.5px var(--subj-color); background: var(--subj-light); }
        .simu-subject-card:disabled { cursor: not-allowed; opacity: .5; }
        .simu-subject-dot { width: 11px; height: 11px; border-radius: 999px; background: var(--subj-color); }
        .simu-subject-label { font-size: 12.5px; font-weight: 800; color: #0f172a; line-height: 1.25; }
        .simu-subject-sub { font-size: 10px; font-weight: 700; color: #94a3b8; }
        .simu-subject-check { position: absolute; top: 8px; right: 8px; width: 18px; height: 18px; border-radius: 999px; background: var(--subj-color); color: #fff; display: grid; place-items: center; }
        .simu-mode-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
        .simu-mode-card { display: flex; flex-direction: column; gap: 8px; padding: 16px; border-radius: 12px; border: 1.5px solid #e2e8f0; background: #fff; cursor: pointer; text-align: left; transition: all .12s; }
        .simu-mode-card.is-active { border-color: #2563eb; background: #eff6ff; }
        .simu-mode-icon { width: 32px; height: 32px; border-radius: 9px; display: grid; place-items: center; background: #eff6ff; color: #2563eb; }
        .simu-mode-card.is-active .simu-mode-icon { background: #2563eb; color: #fff; }
        .simu-mode-title-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .simu-mode-title { font-size: 13px; font-weight: 800; color: #0f172a; }
        .simu-mode-badge { font-size: 9.5px; font-weight: 900; padding: 2px 8px; border-radius: 999px; text-transform: uppercase; letter-spacing: .04em; }
        .simu-mode-desc { font-size: 11.5px; font-weight: 500; color: #64748b; line-height: 1.4; }
        .simu-mode-full { display: flex; align-items: center; gap: 12px; padding: 16px; border-radius: 12px; border: 1.5px solid #e2e8f0; background: #fff; cursor: pointer; text-align: left; transition: all .12s; width: 100%; }
        .simu-mode-full.is-active { border-color: #2563eb; background: #eff6ff; }
        .simu-auto-info, .simu-personal-panel { margin-top: 12px; padding: 14px 16px; border-radius: 10px; background: #f8fafc; border: 1px solid #f1f5f9; }
        .simu-auto-info-title { font-size: 12.5px; font-weight: 800; color: #0f172a; }
        .simu-auto-info-desc { font-size: 12px; font-weight: 500; color: #64748b; margin-top: 4px; line-height: 1.5; }
        .simu-personal-label { font-size: 11px; font-weight: 700; color: #334155; margin-bottom: 8px; }
        .simu-pill-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
        .simu-pill { font-size: 11px; font-weight: 700; padding: 6px 13px; border-radius: 999px; border: 1px solid #e2e8f0; background: #fff; color: #334155; cursor: pointer; transition: all .12s; }
        .simu-pill.is-active { border-color: #2563eb; background: #eff6ff; color: #2563eb; }
        .simu-tip-card { display: flex; align-items: flex-start; gap: 12px; background: #eff6ff; border: 1px solid #dbeafe; }
        .simu-tip-icon { width: 34px; height: 34px; border-radius: 9px; background: #2563eb; color: #fff; display: grid; place-items: center; flex-shrink: 0; }
        .simu-tip-title { font-size: 13px; font-weight: 800; color: #0f172a; }
        .simu-tip-desc { font-size: 12px; font-weight: 500; color: #475569; line-height: 1.5; margin-top: 3px; }
        .simu-tip-link { border: 0; background: none; color: #2563eb; font-size: 12px; font-weight: 800; cursor: pointer; padding: 0; margin-top: 6px; }
        .simu-side { position: sticky; top: 88px; display: flex; flex-direction: column; gap: 14px; max-height: calc(100vh - 108px); overflow-y: auto; }
        .simu-config-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; padding: 11px 0; border-bottom: 1px solid #f1f5f9; }
        .simu-config-row:last-child { border-bottom: 0; padding-bottom: 0; }
        .simu-config-icon { width: 26px; height: 26px; border-radius: 7px; background: #eff6ff; color: #2563eb; display: grid; place-items: center; flex-shrink: 0; }
        .simu-config-label { font-size: 12.5px; font-weight: 800; color: #0f172a; }
        .simu-config-desc { font-size: 10.5px; font-weight: 500; color: #94a3b8; margin-top: 1px; line-height: 1.3; }
        .simu-toggle { width: 36px; height: 21px; border-radius: 999px; border: 0; flex-shrink: 0; position: relative; cursor: pointer; background: #e2e8f0; transition: background .15s; }
        .simu-toggle.is-on { background: #2563eb; }
        .simu-toggle.is-disabled { cursor: default; opacity: .7; }
        .simu-toggle::after { content: ''; position: absolute; top: 2.5px; left: 2.5px; width: 16px; height: 16px; border-radius: 999px; background: #fff; transition: transform .15s; }
        .simu-toggle.is-on::after { transform: translateX(15px); }
        .simu-config-static { font-size: 11px; font-weight: 700; color: #94a3b8; flex-shrink: 0; }
        .simu-cta-card { background: linear-gradient(160deg, #eff6ff, #fff); border: 1px solid #dbeafe; }
        .simu-cta-icon { width: 38px; height: 38px; border-radius: 10px; background: #2563eb; color: #fff; display: grid; place-items: center; margin-bottom: 10px; }
        .simu-cta-title { font-size: 14px; font-weight: 800; color: #0f172a; }
        .simu-cta-desc { font-size: 12px; font-weight: 500; color: #64748b; line-height: 1.5; margin: 6px 0 14px; }
        .simu-cta-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 14px; font-weight: 800; padding: 14px; border-radius: 11px; background: #2563eb; color: #fff; border: none; box-shadow: 0 8px 22px rgba(37,99,235,.3); cursor: pointer; }
        .simu-cta-btn:disabled { background: #94a3b8; box-shadow: none; cursor: not-allowed; }
        .simu-error { margin-bottom: 4px; padding: 12px 16px; border-radius: 10px; background: #fef2f2; border: 1px solid #fecaca; font-size: 13px; font-weight: 600; color: #b91c1c; }
        @media (max-width: 1024px) {
          .simu-layout { grid-template-columns: 1fr; }
          .simu-side { position: static; max-height: none; }
        }
        @media (max-width: 767px) {
          .simu-screen { padding: 20px 16px 44px; }
          .simu-hero { height: auto; padding-bottom: 4px; }
          .simu-hero-stats { grid-template-columns: repeat(2, minmax(0,1fr)); }
          .simu-subject-grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
          .simu-mode-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="simu-screen">
        <div className="simu-shell">

          {/* HERO */}
          <div className="simu-hero">
            <img src={heroImg} alt="" />
            <div className="simu-hero-overlay">
              <div className="simu-breadcrumb"><span>Camino PAU</span><ChevronRight size={12} /><span>Simulacros</span></div>
              <div className="simu-title">Simulacros</div>
              <div className="simu-subtitle">Practica como en la PAU real y mejora tus resultados.</div>
              <div className="simu-hero-stats">
                <div className="simu-hero-stat">
                  <div className="simu-hero-stat-icon"><FileCheck2 size={16} /></div>
                  <div>
                    <div className="simu-hero-stat-val">{stats.completedCount > 0 ? stats.completedCount : '—'}</div>
                    <div className="simu-hero-stat-label">Simulacros completados</div>
                  </div>
                </div>
                <div className="simu-hero-stat">
                  <div className="simu-hero-stat-icon"><Star size={16} /></div>
                  <div>
                    <div className="simu-hero-stat-val">{stats.completedCount > 0 ? formatScore(stats.bestScore) : '—'}<em>/10</em></div>
                    <div className="simu-hero-stat-label">Mejor nota</div>
                  </div>
                </div>
                <div className="simu-hero-stat">
                  <div className="simu-hero-stat-icon"><Clock size={16} /></div>
                  <div>
                    <div className="simu-hero-stat-val">{stats.averageTime == null ? '—' : stats.averageTime}<em>min</em></div>
                    <div className="simu-hero-stat-label">Tiempo medio</div>
                  </div>
                </div>
                <div className="simu-hero-stat">
                  <div className="simu-hero-stat-icon"><Activity size={16} /></div>
                  <div>
                    <div className="simu-hero-stat-val">{stats.completedCount > 0 ? formatScore(stats.averageScore) : '—'}<em>/10</em></div>
                    <div className="simu-hero-stat-label">Nota media</div>
                  </div>
                </div>
              </div>
              <button type="button" className="simu-hero-link" onClick={() => { setHistoryOpen(!historyOpen); void loadHistory() }}>
                {historyOpen ? <EyeOff size={13} /> : <Eye size={13} />}
                {historyOpen ? 'Ocultar historial' : 'Ver mis simulacros'}
                <ChevronRight size={13} />
              </button>
            </div>
          </div>

          <div style={{ padding: '0 0 20px' }}>
            <SectionIntroCard
              hintKey="hint_simulacros"
              line1="Exámenes cronometrados como el día real."
              line2="Elige asignatura y tiempo, responde todo y Kairo lo corrige al terminar. Úsalo para entrenar bajo presión."
            />
          </div>

          {/* Camino parcial banner */}
          {isCaminoPartial && caminoBlock && (
            <div className="simu-camino-banner">
              <PlayCircle size={15} style={{ flexShrink: 0 }} />
              Simulacro enfocado en <strong style={{ marginLeft: 4 }}>{BLOCK_DISPLAY[caminoBlock] ?? caminoBlock}</strong>
              <span style={{ marginLeft: 4, fontWeight: 400, color: '#3b82f6' }}>— generando para tu parcial...</span>
            </div>
          )}

          {/* History panel */}
          {historyOpen && (
            <div className="simu-history-panel">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 900, color: '#0f172a' }}>Mis simulacros anteriores</span>
                <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 10px', borderRadius: 999, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>{history.length} total</span>
              </div>
              {history.length === 0 ? (
                <p style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', margin: 0 }}>Todavía no tienes simulacros guardados.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 280, overflowY: 'auto' }}>
                  {history.map(item => (
                    <a
                      key={item.id}
                      href={item.estado === 'completado' ? `/simulacros/${item.id}/results` : `/simulacros/${item.id}`}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '9px 12px', borderRadius: 10, border: '1px solid #f1f5f9', background: 'white', textDecoration: 'none', color: 'inherit', transition: 'border-color .12s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#93c5fd'; (e.currentTarget as HTMLElement).style.background = '#eff6ff' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#f1f5f9'; (e.currentTarget as HTMLElement).style.background = 'white' }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{SUBJECTS[item.asignatura]?.label ?? item.asignatura} · {item.dificultad_real ?? item.dificultad}</div>
                        <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>{item.id.slice(0, 8)} · {item.estado === 'completado' ? `${item.nota_final ?? '-'}/10` : 'En progreso'}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        {item.estado === 'completado'
                          ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 999, background: '#f0fdf4', color: '#15803d' }}><CheckCircle2 size={11} />Completado</span>
                          : <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 999, background: '#fffbeb', color: '#b45309' }}>En progreso</span>}
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: '#f1f5f9', color: '#475569' }}>{optionSummaryForRecord(item)}</span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {errorMessage && <div className="simu-error" role="alert">{errorMessage}</div>}

          {/* MAIN LAYOUT */}
          <div className="simu-layout">
            <div className="simu-main-col">

              {/* STEP 1 */}
              <div className="history-card simu-card">
                <div className="simu-card-head">
                  <div className="simu-card-title"><span className="simu-step-num">1</span> Elige la asignatura</div>
                  <button type="button" className="simu-help-link"><HelpCircle size={13} /> ¿No encuentras tu asignatura?</button>
                </div>
                <div className="simu-subject-grid">
                  {(Object.keys(SUBJECTS) as SimulacroSubject[]).map(key => {
                    const s = SUBJECTS[key]
                    const isActive = subject === key
                    return (
                      <button
                        key={key}
                        disabled={!s.available}
                        onClick={() => s.available && setSubject(key)}
                        className={`simu-subject-card ${isActive ? 'is-active' : ''}`}
                        style={{ '--subj-color': s.color, '--subj-light': s.light } as CSSProperties}
                      >
                        {isActive && <span className="simu-subject-check"><CheckCircle2 size={12} /></span>}
                        <span className="simu-subject-dot" />
                        <span className="simu-subject-label">{s.label}</span>
                        {key === 'mates' && <span className="simu-subject-sub">Obligatoria</span>}
                        {!s.available && <span className="simu-subject-sub">Pronto</span>}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* STEP 2 */}
              <div className="history-card simu-card">
                <div className="simu-card-head">
                  <div className="simu-card-title"><span className="simu-step-num">2</span> Elige el tipo de simulacro</div>
                </div>
                <div className="simu-mode-grid">
                  <button type="button" className={`simu-mode-card ${mode === 'normal' ? 'is-active' : ''}`} onClick={() => setMode('normal')}>
                    <div className="simu-mode-icon"><Trophy size={16} /></div>
                    <div className="simu-mode-title-row">
                      <span className="simu-mode-title">Simulacro normal</span>
                      <span className="simu-mode-badge" style={{ background: '#eff6ff', color: '#2563eb' }}>Recomendado</span>
                    </div>
                    <span className="simu-mode-desc">Simula la PAU completa con tiempo real y corrección.</span>
                  </button>
                  <button type="button" className={`simu-mode-card ${mode === 'errores' ? 'is-active' : ''}`} onClick={() => setMode('errores')}>
                    <div className="simu-mode-icon"><FileCheck2 size={16} /></div>
                    <div className="simu-mode-title-row">
                      <span className="simu-mode-title">Peores notas</span>
                      <span className="simu-mode-badge" style={{ background: weakCandidateCount > 0 ? '#f0fdf4' : '#fffbeb', color: weakCandidateCount > 0 ? '#15803d' : '#b45309' }}>
                        {weakCandidateCount > 0 ? `${weakCandidateCount} detectados` : 'Necesita historial'}
                      </span>
                    </div>
                    <span className="simu-mode-desc">Practica los exámenes de tus peores resultados.</span>
                  </button>
                </div>
                <button type="button" className={`simu-mode-full ${mode === 'personalizado' ? 'is-active' : ''}`} onClick={() => setMode('personalizado')}>
                  <div className="simu-mode-icon"><SlidersHorizontal size={16} /></div>
                  <div>
                    <div className="simu-mode-title">Personalizado</div>
                    <span className="simu-mode-desc">Crea tu propio simulacro eligiendo años y opción de examen.</span>
                  </div>
                </button>

                {mode !== 'personalizado' && (
                  <div className="simu-auto-info">
                    <div className="simu-auto-info-title">{autoInfo.title}</div>
                    <div className="simu-auto-info-desc">{autoInfo.description}</div>
                  </div>
                )}

                {mode === 'personalizado' && (
                  <div className="simu-personal-panel">
                    <div className="simu-personal-label">Años de convocatoria</div>
                    <div className="simu-pill-row">
                      {YEAR_CHOICES.map(item => (
                        <button key={item.id} type="button" className={`simu-pill ${yearChoice === item.id ? 'is-active' : ''}`} onClick={() => setYearChoice(item.id)}>
                          {item.label}
                        </button>
                      ))}
                    </div>
                    {yearChoice !== 'all' && (
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 12, padding: '6px 10px', background: 'white', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                        {YEAR_CHOICES.find(y => y.id === yearChoice)?.description}
                      </div>
                    )}
                    {isPersonalizadoOptionToggle ? (
                      <>
                        <div className="simu-personal-label">Opción del examen</div>
                        <div className="simu-pill-row" style={{ marginBottom: 0 }}>
                          {OPTION_CHOICES.map(item => (
                            <button key={item.id} type="button" className={`simu-pill ${optionChoice === item.id ? 'is-active' : ''}`} onClick={() => setOptionChoice(item.id)}>
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', lineHeight: 1.5 }}>
                        Lengua se genera como examen oficial coherente. Kairo elige automáticamente la versión compatible con el banco de ejercicios.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* TIP */}
              <div className="history-card simu-card simu-tip-card">
                <div className="simu-tip-icon"><Lightbulb size={16} /></div>
                <div>
                  <div className="simu-tip-title">Consejo Kairo</div>
                  <div className="simu-tip-desc">Haz simulacros con regularidad y revisa tus resultados para ver tu evolución.</div>
                  <button type="button" className="simu-tip-link" onClick={() => { setHistoryOpen(true); void loadHistory() }}>Ver mis simulacros →</button>
                </div>
              </div>
            </div>

            {/* SIDE */}
            <aside className="simu-side">
              <div className="history-card simu-card">
                <div className="simu-card-title" style={{ marginBottom: 16 }}><span className="simu-step-num">3</span> Configuración</div>

                <div className="simu-config-row">
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div className="simu-config-icon"><Clock size={13} /></div>
                    <div>
                      <div className="simu-config-label">Duración total</div>
                      <div className="simu-config-desc">Según la PAU oficial de cada asignatura</div>
                    </div>
                  </div>
                  <span className="simu-config-static">Auto</span>
                </div>

                <div className="simu-config-row">
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div className="simu-config-icon"><CheckCircle2 size={13} /></div>
                    <div>
                      <div className="simu-config-label">Corrección</div>
                      <div className="simu-config-desc">Corrección automática al finalizar</div>
                    </div>
                  </div>
                  <button type="button" className="simu-toggle is-on is-disabled" title="Kairo siempre corrige al finalizar" />
                </div>

                <div className="simu-config-row">
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div className="simu-config-icon"><Shuffle size={13} /></div>
                    <div>
                      <div className="simu-config-label">Mezcla de opciones A/B</div>
                      <div className="simu-config-desc">{mode === 'personalizado' ? 'Activa para mezclar cuando esté disponible' : 'Automático fuera del modo personalizado'}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`simu-toggle ${mezclaActiva ? 'is-on' : ''} ${mode === 'personalizado' && isPersonalizadoOptionToggle ? '' : 'is-disabled'}`}
                    onClick={() => {
                      if (mode !== 'personalizado' || !isPersonalizadoOptionToggle) return
                      setOptionChoice(optionChoice === 'mixed' ? 'A' : 'mixed')
                    }}
                  />
                </div>

                <div className="simu-config-row">
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div className="simu-config-icon"><Grid3x3 size={13} /></div>
                    <div>
                      <div className="simu-config-label">Bloques</div>
                      <div className="simu-config-desc">Todos los bloques incluidos</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="history-card simu-card simu-cta-card">
                <div className="simu-cta-icon"><Rocket size={18} /></div>
                <div className="simu-cta-title">Listo para empezar</div>
                <div className="simu-cta-desc">Revisa tu configuración ({readyLabel}) y comienza tu simulacro en condiciones reales de examen.</div>
                <button
                  type="button"
                  className="simu-cta-btn"
                  onClick={createSimulacro}
                  disabled={loading || !userId || !SUBJECTS[subject].available}
                >
                  {loading ? <KairoLoadingDot /> : <PlayCircle size={17} />}
                  {loading
                    ? 'Generando simulacro...'
                    : !SUBJECTS[subject].available
                    ? `Simulacros de ${SUBJECTS[subject].short} próximamente`
                    : userId
                    ? ctaLabel(mode, cfg.short)
                    : 'Cargando sesión...'}
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </SimulacroShell>
  )
}


function buildStats(history: SimulacroRecord[]) {
  const completed = history.filter(item => item.estado === 'completado' && Number.isFinite(Number(item.nota_final)))
  const scores = completed.map(item => Number(item.nota_final))
  const times = completed.map(item => Number(item.tiempo_empleado)).filter(t => Number.isFinite(t) && t > 0)
  return {
    completedCount: completed.length,
    averageScore: average(scores),
    bestScore: scores.length ? Math.max(...scores) : 0,
    averageTime: times.length ? Math.round(average(times)) : null,
    lastCompleted: completed[0] ?? null
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
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' }).format(new Date(value))
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
