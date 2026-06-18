'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, FormEvent, ReactNode } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  CopyPlus,
  Layers3,
  PencilLine,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  XCircle
} from 'lucide-react'
import { supabase } from '@/app/lib/supabase'
import MathMarkdown from '@/components/shared/MathMarkdown'
import { RECOMMENDED_FLASHCARDS } from './recommendedFlashcards'
import type { Flashcard, ZonaSubject } from './types'

const SUBJECTS: { id: ZonaSubject; label: string; color: string; soft: string }[] = [
  { id: 'mates', label: 'Mates', color: '#2563eb', soft: '#eff6ff' },
  { id: 'matematicas_ccss', label: 'Matemáticas CCSS', color: '#7c3aed', soft: '#f5f3ff' },
  { id: 'fisica', label: 'Física', color: '#CA8A04', soft: '#FEFCE8' },
  { id: 'quimica', label: 'Química', color: '#ea580c', soft: '#fff7ed' },
  { id: 'lengua', label: 'Lengua', color: '#0284C7', soft: '#E0F2FE' },
  { id: 'historia', label: 'Historia', color: '#2f6f4e', soft: '#f0fdf4' },
  { id: 'historia_filosofia', label: 'Filosofía', color: '#64748B', soft: '#F8FAFC' },
  { id: 'ingles', label: 'Inglés', color: '#0891B2', soft: '#CFFAFE' },
  { id: 'biologia', label: 'Biología', color: '#4d7c0f', soft: '#f7fee7' }
]

const WARM = {
  ink: '#172033',
  muted: '#64748b',
  softText: '#94a3b8',
  surface: '#ffffff',
  field: '#f8fbff',
  border: '#dbe7fb',
  wash: '#eff6ff',
  blue: '#2563eb'
}

type ZonaMode = 'study' | 'create' | 'space'

interface FlashcardsProps {
  userId: string
  initialCards: Flashcard[]
}


export default function Flashcards({ userId, initialCards }: FlashcardsProps) {
  const [cards, setCards] = useState<Flashcard[]>(initialCards)
  const [mode, setMode] = useState<ZonaMode | null>(null)
  const [subject, setSubject] = useState<ZonaSubject | 'all'>('all')
  const [topic, setTopic] = useState('all')
  const [reviewQueue, setReviewQueue] = useState<string[]>([])
  const [seenCards, setSeenCards] = useState<Record<string, true>>({})
  const [flipped, setFlipped] = useState(false)
  const [answers, setAnswers] = useState<Record<string, 'know' | 'dont'>>({})
  const [dragStart, setDragStart] = useState<number | null>(null)
  const [dragX, setDragX] = useState(0)
  const [saving, setSaving] = useState(false)
  const [copyingSubject, setCopyingSubject] = useState<ZonaSubject | null>(null)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({ subject: 'mates' as ZonaSubject, topic: '', front: '', back: '' })

  const filtered = useMemo(() => {
    return cards.filter(card =>
      (subject === 'all' || card.subject === subject) &&
      (topic === 'all' || card.topic === topic)
    )
  }, [cards, subject, topic])

  const recommendedFiltered = useMemo(() => RECOMMENDED_FLASHCARDS.filter(card =>
    (subject === 'all' || card.subject === subject) &&
    (topic === 'all' || card.topic === topic)
  ), [subject, topic])
  const studyCards = filtered.length ? filtered : recommendedFiltered
  const studySignature = studyCards.map(card => card.id).join('|')
  const current = useMemo(() => studyCards.find(card => card.id === reviewQueue[0]) ?? null, [reviewQueue, studyCards])
  const reviewed = Object.keys(seenCards).filter(id => studyCards.some(card => card.id === id)).length
  const progress = studyCards.length ? Math.round((reviewed / studyCards.length) * 100) : 0
  const topics = Array.from(new Set([...cards, ...RECOMMENDED_FLASHCARDS].filter(card => subject === 'all' || card.subject === subject).map(card => card.topic))).filter(Boolean)
  const selectedSubject = subject === 'all' ? null : SUBJECTS.find(item => item.id === subject)

  useEffect(() => {
    setReviewQueue(studyCards.map(card => card.id))
    setSeenCards({})
    setAnswers({})
    setFlipped(false)
    setDragX(0)
  }, [studySignature])

  function resetDeck() {
    setReviewQueue(studyCards.map(card => card.id))
    setSeenCards({})
    setFlipped(false)
    setAnswers({})
    setDragX(0)
  }

  function selectSubject(next: ZonaSubject | 'all') {
    setSubject(next)
    setTopic('all')
    resetDeck()
  }

  function answerCard(value: 'know' | 'dont') {
    if (!current) return
    setAnswers(prev => ({ ...prev, [current.id]: value }))
    setSeenCards(prev => ({ ...prev, [current.id]: true }))
    setFlipped(false)
    setDragX(value === 'know' ? 120 : -120)
    window.setTimeout(() => {
      setReviewQueue(prev => {
        const remaining = prev.slice(1).filter(id => id !== current.id)
        if (value === 'know') return remaining
        if (remaining.length <= 2) return [...remaining, current.id]
        const lateStart = Math.floor(remaining.length * 0.6)
        const insertAt = lateStart + Math.floor(Math.random() * (remaining.length - lateStart + 1))
        const next = [...remaining]
        next.splice(insertAt, 0, current.id)
        return next
      })
      setDragX(0)
    }, 180)
  }

  async function createCard(e: FormEvent) {
    e.preventDefault()
    if (!form.topic.trim() || !form.front.trim() || !form.back.trim()) return
    setSaving(true)
    setFormError('')
    const payload = {
      user_id: userId,
      subject: form.subject,
      topic: form.topic.trim(),
      front: form.front.trim(),
      back: form.back.trim()
    }
    const { data, error } = await supabase.from('flashcards').insert(payload).select('*').single()
    if (error) {
      setFormError('No hemos podido guardar la flashcard. Revisa la conexión e inténtalo otra vez.')
      setSaving(false)
      return
    }
    if (!error && data) {
      setCards(prev => [data as Flashcard, ...prev])
      setForm({ subject: form.subject, topic: '', front: '', back: '' })
      setMode('study')
      setSubject(form.subject)
      setTopic('all')
      resetDeck()
    }
    setSaving(false)
  }

  async function deleteCard(card: Flashcard) {
    await supabase.from('flashcards').delete().eq('id', card.id).eq('user_id', userId)
    setCards(prev => prev.filter(item => item.id !== card.id))
    setAnswers(prev => {
      const next = { ...prev }
      delete next[card.id]
      return next
    })
    setReviewQueue(prev => prev.filter(id => id !== card.id))
  }

  async function copyRecommendedDeck(deckSubject: ZonaSubject) {
    const deck = RECOMMENDED_FLASHCARDS.filter(card => card.subject === deckSubject)
    if (!deck.length || copyingSubject) return
    setCopyingSubject(deckSubject)
    setFormError('')
    const payload = deck.map(card => ({ user_id: userId, subject: card.subject, topic: card.topic, front: card.front, back: card.back }))
    const { data, error } = await supabase.from('flashcards').insert(payload).select('*')
    if (error) setFormError('No hemos podido copiar las tarjetas recomendadas. Inténtalo otra vez.')
    else if (data) {
      setCards(prev => [...data as Flashcard[], ...prev])
      resetDeck()
    }
    setCopyingSubject(null)
  }

  function onPointerUp() {
    if (dragX > 82) answerCard('know')
    else if (dragX < -82) answerCard('dont')
    else setDragX(0)
    setDragStart(null)
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-[28px] border border-[#dbe7fb] bg-white/90 p-5 shadow-[0_24px_70px_rgba(37,99,235,0.10)] max-md:p-4">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400">Empieza aquí</div>
            <h2 className="mt-1 text-2xl font-black text-slate-900 max-md:text-xl">Elige qué quieres hacer</h2>
            <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-slate-500">Repasa conceptos, guarda errores y crea tus propias tarjetas.</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 max-lg:grid-cols-1">
          <ModeCard active={mode === 'study'} icon={<BookOpenCheck size={20} />} title="Repasar tarjetas" text="Practica conceptos rápidos por asignatura." onClick={() => setMode('study')} />
          <ModeCard active={mode === 'create'} icon={<PencilLine size={20} />} title="Crear tus propias tarjetas" text="Guarda preguntas, fórmulas o errores para repasarlos después." onClick={() => setMode('create')} />
          <ModeCard active={mode === 'space'} icon={<Layers3 size={20} />} title="Mi espacio" text="Consulta tus tarjetas y recursos guardados." onClick={() => setMode('space')} />
        </div>
      </section>

      {mode === 'study' && (
        <section className="grid gap-4 rounded-[28px] border border-[#dbe7fb] bg-white/95 p-5 shadow-[0_24px_70px_rgba(37,99,235,0.08)] max-md:p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dbe7fb] pb-4">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400">1 · Selecciona asignatura</div>
              <h3 className="mt-1 text-xl font-black text-slate-900">Repasa antes de hacer ejercicios</h3>
            </div>
            <button onClick={resetDeck} className="inline-flex items-center gap-2 rounded-full border border-[#dbe7fb] bg-[#f8fbff] px-4 py-2 text-sm font-black text-slate-600 transition hover:border-blue-300 hover:text-blue-700">
              <RotateCcw size={15} /> Reiniciar
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
            <aside className="grid content-start gap-4 rounded-3xl border border-[#dbe7fb] bg-[#f8fbff] p-4">
              <div>
                <div className="mb-2 text-xs font-black uppercase tracking-[0.08em] text-slate-400">Asignatura</div>
                <select value={subject} onChange={event => selectSubject(event.target.value as ZonaSubject | 'all')} style={inputStyle}>
                  <option value="all">Todas</option>
                  {SUBJECTS.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-400" htmlFor="zona-topic">2 · Qué quieres practicar</label>
                <select id="zona-topic" value={topic} onChange={event => { setTopic(event.target.value); resetDeck() }} style={inputStyle}>
                  <option value="all">Todo</option>
                  {topics.map(item => <option key={item} value={item}>{item}</option>)}
                </select>
                <p className="mt-2 text-xs font-semibold leading-5 text-slate-400">Empieza por Todo si no sabes por dónde empezar.</p>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-white p-4">
                <div className="text-xs font-black uppercase tracking-[0.08em] text-blue-500">Progreso</div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-blue-50">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-700 via-blue-600 to-sky-400 transition-[width]" style={{ width: progress + '%' }} />
                </div>
                <div className="mt-2 text-sm font-black text-slate-600">{reviewed}/{studyCards.length} tarjetas repasadas</div>
                <div className="text-xs font-semibold text-slate-400">{filtered.length ? 'Tus tarjetas' : 'Tarjetas recomendadas para empezar'}</div>
              </div>
            </aside>

            <div className="grid gap-4">
              {current ? (
                <div
                  onPointerDown={event => setDragStart(event.clientX)}
                  onPointerMove={event => {
                    if (dragStart !== null) setDragX(Math.max(-140, Math.min(140, event.clientX - dragStart)))
                  }}
                  onPointerUp={onPointerUp}
                  onPointerCancel={() => { setDragStart(null); setDragX(0) }}
                  style={{ perspective: 1200, touchAction: 'pan-y' }}
                >
                  <div
                    onClick={() => setFlipped(prev => !prev)}
                    style={{
                      position: 'relative',
                      minHeight: 320,
                      transformStyle: 'preserve-3d',
                      transform: 'translateX(' + dragX + 'px) rotate(' + dragX / 16 + 'deg) rotateY(' + (flipped ? 180 : 0) + 'deg)',
                      transition: dragStart === null ? 'transform .28s ease' : 'none',
                      cursor: 'grab'
                    }}
                  >
                    <CardFace subject={current.subject} topic={current.topic} label="Concepto" text={current.front} />
                    <CardFace subject={current.subject} topic={current.topic} label="Explicación" text={current.back} back />
                  </div>
                </div>
              ) : (
                <EmptyStudyState />
              )}

              <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                <button onClick={() => answerCard('dont')} disabled={!current} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-black text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"><XCircle size={18} /> No me la sé</button>
                <button onClick={() => answerCard('know')} disabled={!current} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 font-black text-blue-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"><CheckCircle2 size={18} /> Me la sé</button>
              </div>
            </div>
          </div>
        </section>
      )}

      {mode === 'create' && (
        <section className="grid gap-4 rounded-[28px] border border-[#dbe7fb] bg-white/95 p-5 shadow-[0_24px_70px_rgba(37,99,235,0.08)] max-md:p-4 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5">
            <div className="text-[11px] font-black uppercase tracking-[0.1em] text-blue-500">Crear tarjeta</div>
            <h3 className="mt-2 text-2xl font-black text-slate-900">Hazlo rápido y vuelve luego</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">Guarda aquí fórmulas, errores o ideas que quieras recordar.</p>
            <div className="mt-5 rounded-2xl border border-[#dbe7fb] bg-white p-4 text-sm font-bold leading-6 text-slate-500">Ejemplo: escribe `$P(A\\mid B)$` o una fórmula en bloque y se verá con el mismo renderizador.</div>
          </div>

          <form onSubmit={createCard} className="rounded-3xl border border-[#dbe7fb] bg-white p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label style={labelStyle}>Asignatura</label>
                <select value={form.subject} onChange={e => setForm(prev => ({ ...prev, subject: e.target.value as ZonaSubject }))} style={inputStyle}>
                  {SUBJECTS.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Tipo de repaso / tema breve</label>
                <input value={form.topic} onChange={e => setForm(prev => ({ ...prev, topic: e.target.value }))} placeholder="Matrices, ondas, Restauración..." style={inputStyle} />
              </div>
            </div>

            <label style={labelStyle}>Pregunta / concepto</label>
            <textarea value={form.front} onChange={e => setForm(prev => ({ ...prev, front: e.target.value }))} placeholder="Concepto o pregunta" style={{ ...inputStyle, minHeight: 96, resize: 'vertical' }} />

            <label style={labelStyle}>Respuesta / explicación</label>
            <textarea value={form.back} onChange={e => setForm(prev => ({ ...prev, back: e.target.value }))} placeholder="Definición, explicación o regla" style={{ ...inputStyle, minHeight: 132, resize: 'vertical' }} />

            {formError && <div className="mt-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-black leading-6 text-blue-900">{formError}</div>}

            <button disabled={saving} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-sky-400 px-5 py-3 font-black text-white shadow-[0_16px_34px_rgba(37,99,235,.24)] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70">
              <Plus size={18} />{saving ? 'Guardando...' : 'Crear tarjeta'}
            </button>
          </form>
        </section>
      )}

      {mode === 'space' && (
        <section className="grid gap-4 rounded-[28px] border border-[#dbe7fb] bg-white/95 p-5 shadow-[0_24px_70px_rgba(37,99,235,0.08)] max-md:p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dbe7fb] pb-4">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400">Mi espacio</div>
              <h3 className="mt-1 text-xl font-black text-slate-900">Guarda aquí lo que quieras volver a repasar</h3>
            </div>
            <Link href="/zona/canvas" className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-black text-white shadow-[0_14px_28px_rgba(37,99,235,0.2)]">
              Abrir canvas <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="grid gap-3">
              {cards.length > 0 ? cards.map(card => (
                <SavedCard key={card.id} card={card} onDelete={() => void deleteCard(card)} />
              )) : (
                <div className="rounded-3xl border border-dashed border-blue-200 bg-blue-50/70 p-6 text-center">
                  <Sparkles className="mx-auto text-blue-600" size={34} />
                  <h4 className="mt-3 text-lg font-black text-slate-900">Todavía no tienes tarjetas propias</h4>
                  <p className="mt-1 text-sm font-semibold text-slate-500">Aún no tienes tarjetas propias. Crea una con un error o fórmula que quieras repasar.</p>
                  <button onClick={() => setMode('create')} className="mt-4 rounded-full bg-blue-600 px-4 py-2 text-sm font-black text-white">Crear primera tarjeta</button>
                </div>
              )}
            </div>

            <aside className="grid content-start gap-3 rounded-3xl border border-[#dbe7fb] bg-[#f8fbff] p-4">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.08em] text-slate-400">Tarjetas recomendadas</div>
                <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">Copia solo las tarjetas que quieras tener en tu cuenta.</p>
              </div>
              {SUBJECTS.filter(item => !selectedSubject || item.id === selectedSubject.id).map(item => {
                const deckSize = RECOMMENDED_FLASHCARDS.filter(card => card.subject === item.id).length
                return (
                  <article key={item.id} className="rounded-2xl border border-[#dbe7fb] bg-white p-4">
                    <div className="text-xs font-black uppercase tracking-[0.08em]" style={{ color: item.color }}>Tarjetas recomendadas</div>
                    <h4 className="mt-1 font-black text-slate-900">{item.label}</h4>
                    <p className="text-sm font-semibold text-slate-500">{deckSize} tarjetas esenciales</p>
                    <button onClick={() => void copyRecommendedDeck(item.id)} disabled={copyingSubject !== null} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-black disabled:cursor-wait disabled:opacity-60" style={{ borderColor: item.color + '33', background: item.soft, color: item.color }}>
                      <CopyPlus size={15} />{copyingSubject === item.id ? 'Copiando...' : 'Copiar tarjetas'}
                    </button>
                  </article>
                )
              })}
            </aside>
          </div>
        </section>
      )}
    </div>
  )
}

function ModeCard({ active, icon, title, text, onClick }: { active: boolean; icon: ReactNode; title: string; text: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`group rounded-3xl border p-4 text-left transition ${active ? 'border-blue-300 bg-blue-50 shadow-[0_16px_34px_rgba(37,99,235,0.12)]' : 'border-[#dbe7fb] bg-white hover:border-blue-200 hover:bg-[#f8fbff]'}`}>
      <div className="flex items-start gap-3">
        <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${active ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'}`}>{icon}</div>
        <div>
          <div className="font-black text-slate-900">{title}</div>
          <div className="mt-1 text-sm font-semibold leading-5 text-slate-500">{text}</div>
        </div>
      </div>
    </button>
  )
}

function CardFace({ subject, topic, label, text, back = false }: { subject: ZonaSubject; topic: string; label: string; text: string; back?: boolean }) {
  const color = SUBJECTS.find(item => item.id === subject)?.color ?? WARM.blue

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      minHeight: 320,
      borderRadius: 26,
      padding: 26,
      background: back ? 'linear-gradient(145deg, #f8fbff, #eef6ff)' : 'linear-gradient(145deg, #ffffff, #f8fbff)',
      border: '1px solid ' + WARM.border,
      boxShadow: '0 24px 60px rgba(37,99,235,0.10)',
      backfaceVisibility: 'hidden',
      transform: back ? 'rotateY(180deg)' : 'rotateY(0deg)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      overflowX: 'auto'
    }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span style={{ color, fontWeight: 850, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ color: WARM.muted, background: WARM.field, border: '1px solid ' + WARM.border, padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 750 }}>{subjectLabel(subject)} · {topic}</span>
      </div>
      <MathMarkdown text={text} className={back ? 'text-lg font-semibold overflow-x-auto' : 'text-xl font-black overflow-x-auto'} />
      <div style={{ color: WARM.softText, fontSize: 12, fontWeight: 750 }}>Toca para girar · Arrastra derecha/izquierda</div>
    </div>
  )
}

function SavedCard({ card, onDelete }: { card: Flashcard; onDelete: () => void }) {
  return (
    <article className="rounded-3xl border border-[#dbe7fb] bg-white p-4 shadow-[0_10px_26px_rgba(37,99,235,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-black uppercase tracking-[0.08em] text-slate-400">{subjectLabel(card.subject)} · {card.topic}</div>
          <div className="mt-2 font-black text-slate-900"><MathMarkdown text={card.front} /></div>
          <div className="mt-2 rounded-2xl bg-[#f8fbff] p-3 text-sm font-semibold text-slate-600"><MathMarkdown text={card.back} /></div>
        </div>
        <button onClick={onDelete} aria-label="Eliminar flashcard" className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-700 transition hover:bg-white">
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  )
}

function EmptyStudyState() {
  return (
    <div className="grid min-h-[320px] place-items-center rounded-[26px] border border-dashed border-blue-200 bg-blue-50/70 p-6 text-center">
      <div>
        <Sparkles className="mx-auto text-blue-600" size={36} />
        <h3 className="mt-3 text-lg font-black text-slate-900">No hay tarjetas con este filtro</h3>
        <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">Prueba otra asignatura o crea una flashcard propia.</p>
      </div>
    </div>
  )
}

function subjectLabel(subject: ZonaSubject) {
  return SUBJECTS.find(item => item.id === subject)?.label ?? subject
}

function subjectButtonClass(active: boolean) {
  return `rounded-2xl border px-3 py-3 text-left text-sm font-black transition ${active ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-[#dbe7fb] bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50'}`
}

const labelStyle: CSSProperties = {
  display: 'block',
  color: WARM.muted,
  fontSize: 12,
  fontWeight: 800,
  margin: '0 0 7px'
}

const inputStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  border: '1.5px solid ' + WARM.border,
  background: WARM.field,
  color: WARM.ink,
  borderRadius: 15,
  padding: '11px 12px',
  font: 'inherit',
  outline: 'none'
}
