'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Check, ChevronRight } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'
import {
  saveOnboarding, markOnboardingComplete,
  startModeToRouteId,
  type OnboardingCommunity, type OnboardingDailyMinutes, type OnboardingStartMode,
} from '@/app/lib/onboarding/onboardingStorage'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

// ─── Data ─────────────────────────────────────────────────────────────────────

const COMMUNITY_OPTS = [
  { id: 'Madrid',   label: 'Madrid',           desc: 'Examen EBAU Madrid' },
  { id: 'Cataluña', label: 'Cataluña',          desc: 'Examen PAU Cataluña' },
  { id: 'Otra',     label: 'Otra comunidad',    desc: 'Ruta troncal común' },
]

const DATE_OPTS = [
  { id: 'jun-25',  label: 'Junio 2025'              },
  { id: 'sep-25',  label: 'Septiembre 2025'         },
  { id: 'jun-26',  label: 'Junio 2026'              },
  { id: 'jun-27+', label: 'Junio 2027 o posterior'  },
  { id: 'no-se',   label: 'Todavía no lo sé'        },
]

const GOAL_OPTS = [
  { id: 'nota-corte', label: 'Llegar a mi nota de corte', desc: 'Tengo universidad en mente' },
  { id: 'subir',      label: 'Subir mi nota',              desc: 'Quiero mejorar lo que tengo' },
  { id: 'aprobar',    label: 'Aprobar todas',               desc: 'Lo primero es superarlas' },
  { id: 'la-mejor',   label: 'La mejor nota posible',       desc: 'Sin límites' },
]

const SUBJECT_OPTS = [
  { id: 'Matemáticas II',      label: 'Matemáticas II',      color: '#2563eb', bg: '#eff6ff' },
  { id: 'Física',              label: 'Física',              color: '#ca8a04', bg: '#fefce8' },
  { id: 'Historia de España',  label: 'Historia de España',  color: '#78350f', bg: '#fff8f1' },
  { id: 'Química',             label: 'Química',             color: '#ea580c', bg: '#fff7ed' },
  { id: 'Biología',            label: 'Biología',            color: '#047857', bg: '#d1fae5' },
  { id: 'Lengua y Literatura', label: 'Lengua y Literatura', color: '#7c3aed', bg: '#f5f3ff' },
]

const LEVEL_OPTS = [
  { id: 'perdido',  label: 'Muy perdido/a', desc: 'Necesito empezar desde cero' },
  { id: 'regular',  label: 'Regular',       desc: 'Sé algo pero me cuesta' },
  { id: 'bien',     label: 'Bastante bien', desc: 'Entiendo la mayor parte' },
  { id: 'muy-bien', label: 'Muy bien',      desc: 'Me siento muy seguro/a' },
]

const TIME_OPTS: { id: OnboardingDailyMinutes; label: string; desc: string; recommended?: boolean }[] = [
  { id: 15, label: '15 min al día', desc: 'Sesiones cortas y constantes' },
  { id: 25, label: '25 min al día', desc: 'Ritmo ideal',  recommended: true },
  { id: 40, label: '40 min al día', desc: 'Modo intensivo' },
]

const START_OPTS: { id: OnboardingStartMode; label: string; desc: string }[] = [
  { id: 'septiembre', label: 'Desde septiembre',  desc: 'Empiezo con margen, ruta completa' },
  { id: 'empezado',   label: 'Ya he empezado',    desc: 'Llevo algo de base, ajustamos ritmo' },
  { id: 'retraso',    label: 'Voy con retraso',   desc: 'Priorizamos lo que más impacta' },
  { id: 'intensivo',  label: 'Modo intensivo',    desc: 'Poco tiempo, foco máximo' },
]

const GEN_ITEMS = [
  'Adaptando a tu comunidad autónoma...',
  'Construyendo tu ruta PAU...',
  'Calibrando tu ritmo de estudio...',
  'Preparando tu primera misión...',
]

const CONFETTI_COLORS = ['#2563eb','#16a34a','#dc2626','#ca8a04','#7c3aed','#0891b2','#f59e0b','#ec4899']

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMsg { id: string; role: 'pau' | 'user'; text: string }

type Phase =
  | 'welcome' | 'community' | 'pau-date' | 'goal'
  | 'subjects' | 'subject-level' | 'daily-time'
  | 'start-mode' | 'generating' | 'done'

// ─── Component ────────────────────────────────────────────────────────────────

export default function OnboardingFlow() {
  const router      = useRouter()
  const tokenRef    = useRef<string | null>(null)
  const commRef     = useRef<OnboardingCommunity | null>(null)
  const minutesRef  = useRef<OnboardingDailyMinutes | null>(null)
  const chatEndRef  = useRef<HTMLDivElement>(null)
  const confettiRef = useRef<HTMLCanvasElement>(null)
  const mountedRef  = useRef(true)

  const [messages,    setMessages]    = useState<ChatMsg[]>([])
  const [phase,       setPhase]       = useState<Phase>('welcome')
  const [isTyping,    setIsTyping]    = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [subjects,    setSubjects]    = useState<string[]>([])
  const [subjIdx,     setSubjIdx]     = useState(0)
  const [genIdx,      setGenIdx]      = useState(0)

  // ─── Messaging helpers ───────────────────────────────────────────────────────

  const addPauMsg  = (text: string) => setMessages(p => [...p, { id: `${Date.now()}-${Math.random()}`, role: 'pau',  text }])
  const addUserMsg = (text: string) => setMessages(p => [...p, { id: `${Date.now()}-${Math.random()}`, role: 'user', text }])
  const scrollEnd  = ()             => setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 60)

  async function deliverPau(texts: string[]) {
    for (let i = 0; i < texts.length; i++) {
      if (!mountedRef.current) return
      setIsTyping(true); scrollEnd()
      await delay(i === 0 ? 780 : 900)
      if (!mountedRef.current) return
      setIsTyping(false)
      addPauMsg(texts[i]); scrollEnd()
      if (i < texts.length - 1) await delay(260)
    }
  }

  async function advance(userText: string, pauTexts: string[], next: Phase) {
    addUserMsg(userText); setShowOptions(false); scrollEnd()
    await deliverPau(pauTexts)
    if (!mountedRef.current) return
    setPhase(next)
    if (next !== 'generating' && next !== 'done') {
      await delay(120); setShowOptions(true)
    }
    scrollEnd()
  }

  // ─── Mount ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    mountedRef.current = true
    supabase.auth.getSession().then(({ data: { session } }) => { tokenRef.current = session?.access_token ?? null })
    ;(async () => {
      await delay(350)
      if (!mountedRef.current) return
      await deliverPau([
        '¡Hola! Soy Pau, tu asistente para la PAU.',
        'Voy a hacerte unas preguntas para prepararte una ruta de estudio completamente personalizada.',
      ])
      if (!mountedRef.current) return
      setShowOptions(true); scrollEnd()
    })()
    return () => { mountedRef.current = false }
  }, []) // eslint-disable-line

  // ─── Progress ────────────────────────────────────────────────────────────────

  const totalQ = 6 + subjects.length
  const stepMap: Partial<Record<Phase, number>> = {
    community: 1, 'pau-date': 2, goal: 3, subjects: 4,
    'subject-level': 4 + subjIdx + 1,
    'daily-time': 4 + subjects.length + 1,
    'start-mode': 4 + subjects.length + 2,
    generating: totalQ, done: totalQ,
  }
  const progressPct = phase === 'done' ? 100
    : phase === 'welcome' ? 0
    : Math.min(((stepMap[phase] ?? 0) / totalQ) * 100, 98)

  // ─── Handlers ────────────────────────────────────────────────────────────────

  function handleStart() {
    advance('¡Vamos!', ['¿De qué comunidad autónoma es tu examen?'], 'community')
  }

  function handleCommunity(id: string, label: string) {
    const c = id as OnboardingCommunity
    commRef.current = c
    saveOnboarding({ community: c })
    advance(label, ['¿Cuándo tienes la PAU?'], 'pau-date')
  }

  function handleDate(label: string) {
    advance(label, ['¿Qué quieres conseguir con tu nota PAU?'], 'goal')
  }

  function handleGoal(label: string) {
    advance(label, [
      '¿Qué asignaturas quieres preparar?',
      'Elige todas las que necesitas para tu examen.',
    ], 'subjects')
  }

  function handleSubjectsConfirm() {
    if (subjects.length === 0) return
    saveOnboarding({ subjects })
    const s = subjects
    const label = s.length === 1 ? s[0]
      : `${s.slice(0, -1).join(', ')} y ${s[s.length - 1]}`
    setSubjIdx(0)
    advance(label, [`¿Cómo te sientes ahora mismo con ${s[0]}?`], 'subject-level')
  }

  function handleSubjectLevel(label: string) {
    const next = subjIdx + 1
    if (next < subjects.length) {
      setSubjIdx(next)
      advance(label, [`¿Y con ${subjects[next]}?`], 'subject-level')
    } else {
      advance(label, ['¿Cuánto tiempo puedes dedicar cada día a estudiar?'], 'daily-time')
    }
  }

  function handleDailyTime(minutes: OnboardingDailyMinutes, label: string) {
    minutesRef.current = minutes
    saveOnboarding({ dailyMinutes: minutes })
    advance(label, ['¡Último paso! ¿Desde dónde arrancas con la preparación?'], 'start-mode')
  }

  function handleStartMode(mode: OnboardingStartMode, label: string) {
    saveOnboarding({ startMode: mode })
    ;(async () => {
      addUserMsg(label); setShowOptions(false); scrollEnd()
      await deliverPau(['Perfecto. Déjame preparar tu ruta personalizada...'])
      if (!mountedRef.current) return
      setPhase('generating'); scrollEnd()

      // API call (non-blocking)
      const token    = tokenRef.current
      const comm     = commRef.current
      const mins     = minutesRef.current
      const routeId  = startModeToRouteId(mode)
      if (token && comm && mins) {
        fetch('/api/onboarding/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ routeId, community: comm, dailyMinutes: mins, startMode: mode }),
        }).catch(() => {})
      }

      for (let i = 0; i < GEN_ITEMS.length; i++) {
        await delay(780)
        if (!mountedRef.current) return
        setGenIdx(i + 1)
      }
      await delay(600)
      if (!mountedRef.current) return
      markOnboardingComplete()
      setPhase('done'); scrollEnd()
      triggerConfetti()
    })()
  }

  // ─── Confetti ─────────────────────────────────────────────────────────────────

  function triggerConfetti() {
    const canvas = confettiRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    if (!ctx) return
    const W = window.innerWidth, H = window.innerHeight
    canvas.width = W; canvas.height = H
    const ps = Array.from({ length: 130 }, () => ({
      x: W * 0.5 + (Math.random() - 0.5) * W * 0.7,
      y: H * 0.25,
      vx: (Math.random() - 0.5) * 18,
      vy: -(Math.random() * 14 + 4),
      w: Math.random() * 11 + 5, h: Math.random() * 5 + 3,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rot: Math.random() * 360, rotV: (Math.random() - 0.5) * 11, alpha: 1,
    }))
    let raf: number
    function animate() {
      ctx.clearRect(0, 0, W, H)
      let alive = false
      for (const p of ps) {
        if (p.alpha <= 0) continue
        alive = true
        p.vy += 0.38; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.rot += p.rotV
        if (p.y > H * 0.8) p.alpha -= 0.035
        ctx.save()
        ctx.globalAlpha = Math.max(0, p.alpha)
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rot * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      }
      if (alive) raf = requestAnimationFrame(animate)
      else { ctx.clearRect(0, 0, W, H); if (canvas) canvas.style.display = 'none' }
    }
    canvas.style.display = 'block'
    raf = requestAnimationFrame(animate)
    // eslint-disable-next-line consistent-return
    return () => cancelAnimationFrame(raf)
  }

  // ─── Options renderer ─────────────────────────────────────────────────────────

  function renderOptions() {
    switch (phase) {
      case 'welcome':
        return (
          <motion.div key="welcome-opt" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="px-4 py-5">
            <button
              onClick={handleStart}
              className="w-full flex items-center justify-center gap-2 text-white font-bold rounded-2xl py-4 transition-all active:scale-[0.98]"
              style={{ fontSize: 15, background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', boxShadow: '0 8px 28px rgba(37,99,235,0.32)' }}
            >
              ¡Empezar! <ArrowRight size={17} />
            </button>
          </motion.div>
        )

      case 'community':
        return (
          <OptionList key="community-opts">
            {COMMUNITY_OPTS.map((o, i) => (
              <OptionBtn key={o.id} index={i} label={o.label} desc={o.desc}
                onClick={() => handleCommunity(o.id, o.label)} />
            ))}
          </OptionList>
        )

      case 'pau-date':
        return (
          <OptionList key="date-opts">
            {DATE_OPTS.map((o, i) => (
              <OptionBtn key={o.id} index={i} label={o.label}
                onClick={() => handleDate(o.label)} />
            ))}
          </OptionList>
        )

      case 'goal':
        return (
          <OptionList key="goal-opts">
            {GOAL_OPTS.map((o, i) => (
              <OptionBtn key={o.id} index={i} label={o.label} desc={o.desc}
                onClick={() => handleGoal(o.label)} />
            ))}
          </OptionList>
        )

      case 'subjects':
        return (
          <motion.div key="subject-opts" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="px-4 py-4 space-y-2">
            {SUBJECT_OPTS.map((s, i) => {
              const sel = subjects.includes(s.id)
              return (
                <motion.button
                  key={s.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.045 }}
                  onClick={() => setSubjects(p => sel ? p.filter(x => x !== s.id) : [...p, s.id])}
                  className="w-full flex items-center gap-3 px-4 rounded-2xl border-2 text-left transition-all active:scale-[0.98]"
                  style={{
                    minHeight: 56,
                    borderColor: sel ? s.color : '#e2e8f0',
                    background: sel ? s.bg : '#fff',
                    boxShadow: sel ? `0 0 0 3px ${s.color}1a` : '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                >
                  <div className="flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all"
                    style={{ borderColor: sel ? s.color : '#cbd5e1', background: sel ? s.color : 'white' }}>
                    {sel && <Check size={11} color="white" strokeWidth={3} />}
                  </div>
                  <span className="font-bold text-sm transition-colors"
                    style={{ color: sel ? s.color : '#334155' }}>
                    {s.label}
                  </span>
                </motion.button>
              )
            })}
            <motion.button
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: SUBJECT_OPTS.length * 0.045 }}
              disabled={subjects.length === 0}
              onClick={handleSubjectsConfirm}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-[15px] transition-all mt-1 active:scale-[0.98]"
              style={{
                background: subjects.length > 0 ? 'linear-gradient(135deg, #1d4ed8, #2563eb)' : '#f1f5f9',
                color: subjects.length > 0 ? 'white' : '#94a3b8',
                boxShadow: subjects.length > 0 ? '0 8px 24px rgba(37,99,235,0.28)' : 'none',
              }}
            >
              Confirmar {subjects.length > 0 && `(${subjects.length})`}
              <ArrowRight size={16} />
            </motion.button>
          </motion.div>
        )

      case 'subject-level':
        return (
          <OptionList key={`level-opts-${subjIdx}`}>
            {LEVEL_OPTS.map((o, i) => (
              <OptionBtn key={o.id} index={i} label={o.label} desc={o.desc}
                onClick={() => handleSubjectLevel(o.label)} />
            ))}
          </OptionList>
        )

      case 'daily-time':
        return (
          <OptionList key="time-opts">
            {TIME_OPTS.map((o, i) => (
              <OptionBtn key={String(o.id)} index={i} label={o.label} desc={o.desc}
                badge={o.recommended ? 'Recomendado' : undefined}
                onClick={() => handleDailyTime(o.id, o.label)} />
            ))}
          </OptionList>
        )

      case 'start-mode':
        return (
          <OptionList key="start-opts">
            {START_OPTS.map((o, i) => (
              <OptionBtn key={o.id} index={i} label={o.label} desc={o.desc}
                onClick={() => handleStartMode(o.id, o.label)} />
            ))}
          </OptionList>
        )

      default: return null
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col bg-slate-50"
      style={{ minHeight: '100dvh', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      {/* Confetti canvas */}
      <canvas ref={confettiRef} className="fixed inset-0 pointer-events-none z-50"
        style={{ display: 'none' }} />

      {/* ── Header ── */}
      <div className="sticky top-0 z-30 bg-slate-50/90 backdrop-blur-lg border-b border-slate-100/80">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <img src="/brand/pausia-lockup.png" alt="Pausia"
            style={{ height: 26, objectFit: 'contain', flexShrink: 0 }} />
          <div className="flex-1 mx-2">
            <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #1d4ed8, #3b82f6)' }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
          </div>
          {phase !== 'welcome' && phase !== 'generating' && phase !== 'done' && (
            <span className="text-xs font-bold text-slate-400 shrink-0 tabular-nums">
              {stepMap[phase] ?? 0} / {totalQ}
            </span>
          )}
        </div>
      </div>

      {/* ── Chat area ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 pt-6 pb-4 space-y-3">

          <AnimatePresence>
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'pau' && (
                  <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 mt-0.5 ring-2 ring-white shadow-sm">
                    <Image src="/mascots/pau/pau-guide.png" alt="Pau"
                      width={36} height={36} className="w-full h-full object-cover" />
                  </div>
                )}
                <div
                  className="max-w-[78%] rounded-2xl px-4 py-3 text-sm font-semibold leading-relaxed"
                  style={msg.role === 'pau' ? {
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    color: '#1e293b',
                    borderTopLeftRadius: 6,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                  } : {
                    background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                    color: '#ffffff',
                    borderTopRightRadius: 6,
                    boxShadow: '0 4px 16px rgba(37,99,235,0.30)',
                  }}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <motion.div
                key="typing"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex gap-2.5 justify-start"
              >
                <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 mt-0.5 ring-2 ring-white shadow-sm">
                  <Image src="/mascots/pau/pau-guide.png" alt="Pau"
                    width={36} height={36} className="w-full h-full object-cover" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl px-4 py-4 flex items-center gap-1.5 shadow-sm"
                  style={{ borderTopLeftRadius: 6 }}>
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-2 h-2 rounded-full bg-slate-300"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.85, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Generating ── */}
          {phase === 'generating' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                {GEN_ITEMS.map((item, i) => (
                  <motion.div key={item}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: genIdx > i ? 1 : 0.22, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3"
                  >
                    <motion.div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      animate={{ background: genIdx > i ? '#2563eb' : '#e2e8f0' }}
                      transition={{ duration: 0.3 }}
                    >
                      {genIdx > i && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
                          <Check size={11} color="white" strokeWidth={3} />
                        </motion.div>
                      )}
                    </motion.div>
                    <span className="text-sm font-semibold"
                      style={{ color: genIdx > i ? '#1e293b' : '#94a3b8' }}>
                      {item}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Done ── */}
          {phase === 'done' && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }} className="mt-3">
              <div className="bg-white rounded-3xl border border-slate-100 p-7 shadow-sm text-center space-y-5">

                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.2 }}
                  className="w-24 h-24 mx-auto rounded-full overflow-hidden shadow-xl ring-4 ring-blue-100"
                >
                  <Image src="/mascots/pau/pau-celebrate.png" alt="Pau celebrando"
                    width={96} height={96} className="w-full h-full object-cover" priority />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                  <h2 className="text-2xl font-black text-slate-950 tracking-tight">¡Tu ruta PAU está lista!</h2>
                  <p className="mt-1.5 text-sm font-semibold text-slate-400">
                    Pausia ya tiene todo lo que necesita para guiarte.
                  </p>
                </motion.div>

                {/* Subject pills */}
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
                  className="flex flex-wrap gap-2 justify-center"
                >
                  {subjects.map(s => {
                    const opt = SUBJECT_OPTS.find(o => o.id === s)
                    return opt ? (
                      <span key={s} className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{ background: opt.bg, color: opt.color }}>
                        {s}
                      </span>
                    ) : null
                  })}
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={() => router.push('/camino')}
                  whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-[15px] text-white"
                  style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', boxShadow: '0 10px 28px rgba(37,99,235,0.30)' }}
                >
                  Ver mi Camino PAU <ArrowRight size={16} />
                </motion.button>
              </div>
            </motion.div>
          )}

          <div ref={chatEndRef} style={{ paddingBottom: 4 }} />
        </div>
      </div>

      {/* ── Options panel ── */}
      <AnimatePresence>
        {showOptions && (
          <div className="sticky bottom-0 z-20 bg-slate-50/96 backdrop-blur-md border-t border-slate-100"
            style={{ maxHeight: '58vh', overflowY: 'auto' }}>
            {renderOptions()}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function OptionList({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 py-4 space-y-2"
    >
      {children}
    </motion.div>
  )
}

interface OptionBtnProps {
  label: string
  desc?: string
  badge?: string
  index: number
  onClick: () => void
}

function OptionBtn({ label, desc, badge, index, onClick }: OptionBtnProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.048 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 rounded-2xl border border-slate-200 bg-white text-left group transition-all"
      style={{
        minHeight: 56,
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#93c5fd'
        e.currentTarget.style.background = '#f0f7ff'
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(37,99,235,0.10)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#e2e8f0'
        e.currentTarget.style.background = '#ffffff'
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'
      }}
    >
      <div className="flex-1 min-w-0">
        <span className="block text-sm font-bold text-slate-800">{label}</span>
        {desc && <span className="block text-xs font-semibold text-slate-400 mt-0.5">{desc}</span>}
      </div>
      {badge && (
        <span className="shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-100 text-blue-700">
          {badge}
        </span>
      )}
      <ChevronRight size={16} className="shrink-0 text-slate-300 transition-colors" />
    </motion.button>
  )
}
