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

type ZonaMode = 'study' | 'create' | 'space'

interface FlashcardsProps {
  userId: string
  initialCards: Flashcard[]
  externalSubject?: ZonaSubject | 'all'
}

const MODES: { key: ZonaMode; icon: ReactNode; title: string; text: string }[] = [
  { key: 'study', icon: <BookOpenCheck size={15} />, title: 'Repasar tarjetas', text: 'Practica conceptos rápidos por asignatura.' },
  { key: 'create', icon: <PencilLine size={15} />, title: 'Crear tarjetas', text: 'Guarda fórmulas o errores para repasar después.' },
  { key: 'space', icon: <Layers3 size={15} />, title: 'Mi espacio', text: 'Consulta tus tarjetas guardadas.' },
]

export default function Flashcards({ userId, initialCards, externalSubject }: FlashcardsProps) {
  const [cards, setCards] = useState<Flashcard[]>(initialCards)
  const [mode, setMode] = useState<ZonaMode | null>(null)
  const [subject, setSubject] = useState<ZonaSubject | 'all'>('all')
  const [topic, setTopic] = useState('all')
  const [reviewQueue, setReviewQueue] = useState<string[]>([])
  const [seenCards, setSeenCards] = useState<Record<string, true>>({})
  const [flipped, setFlipped] = useState(false)
  const [_answers, setAnswers] = useState<Record<string, 'know' | 'dont'>>({})
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
    // React 18 batchea estos setStates en un solo render — no hay riesgo real de cascade.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReviewQueue(studySignature ? studySignature.split('|') : [])
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSeenCards({})
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnswers({})
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFlipped(false)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDragX(0)
  }, [studySignature])

  useEffect(() => {
    if (externalSubject != null) selectSubject(externalSubject)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalSubject])

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ── Mode selector ── */}
      <section style={{ paddingBottom: 24 }}>
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '.18em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 6 }}>Empieza aquí</p>
          <h2 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 26, fontWeight: 700, color: '#0f172a', letterSpacing: '-.02em', marginBottom: 5 }}>Elige qué quieres hacer</h2>
          <p style={{ fontSize: 13, fontWeight: 500, color: '#64748b', lineHeight: 1.7 }}>Repasa conceptos, guarda errores y crea tus propias tarjetas.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', border: '1px solid #e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
          {MODES.map((m, i) => {
            const isActive = mode === m.key
            return (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 7,
                  padding: '16px 18px',
                  background: isActive ? '#0f172a' : 'white',
                  borderWidth: 0,
                  borderRightWidth: i < 2 ? 1 : 0,
                  borderRightStyle: 'solid',
                  borderRightColor: '#e2e8f0',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'background .12s',
                }}
              >
                <div style={{ color: isActive ? '#93c5fd' : '#2563eb' }}>{m.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: isActive ? 'white' : '#0f172a', lineHeight: 1.2 }}>{m.title}</div>
                <div style={{ fontSize: 11, fontWeight: 500, color: isActive ? '#94a3b8' : '#64748b', lineHeight: 1.55 }}>{m.text}</div>
              </button>
            )
          })}
        </div>
      </section>

      {/* ── Study mode ── */}
      {mode === 'study' && (
        <section style={{ borderTop: '2px solid #0f172a', paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingBottom: 16, borderBottom: '1px solid #e2e8f0' }}>
            <div>
              <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '.18em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 5 }}>Repaso activo</p>
              <h3 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 20, fontWeight: 700, color: '#0f172a', letterSpacing: '-.01em' }}>Repasa antes de hacer ejercicios</h3>
            </div>
            <button onClick={resetDeck} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid #e2e8f0', background: 'white', borderRadius: 4, padding: '7px 13px', fontSize: 11, fontWeight: 900, color: '#64748b', cursor: 'pointer' }}>
              <RotateCcw size={13} /> Reiniciar
            </button>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
            <aside style={{ display: 'grid', alignContent: 'start', gap: 16, border: '1px solid #e2e8f0', borderRadius: 4, padding: 16, background: '#fafaf9' }}>
              <div>
                <div style={eyebrowStyle}>Asignatura</div>
                <select value={subject} onChange={event => selectSubject(event.target.value as ZonaSubject | 'all')} style={inputStyle}>
                  <option value="all">Todas</option>
                  {SUBJECTS.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </div>

              <div>
                <label style={eyebrowStyle} htmlFor="zona-topic">Qué quieres practicar</label>
                <select id="zona-topic" value={topic} onChange={event => { setTopic(event.target.value); resetDeck() }} style={inputStyle}>
                  <option value="all">Todo</option>
                  {topics.map(item => <option key={item} value={item}>{item}</option>)}
                </select>
                <p style={{ marginTop: 6, fontSize: 11, fontWeight: 500, color: '#94a3b8', lineHeight: 1.5 }}>Empieza por Todo si no sabes por dónde empezar.</p>
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: 4, padding: '12px 14px', background: 'white' }}>
                <div style={eyebrowStyle}>Progreso</div>
                <div style={{ height: 3, borderRadius: 999, background: '#f1f5f9', overflow: 'hidden', margin: '10px 0 8px' }}>
                  <div style={{ height: '100%', background: '#2563eb', transition: 'width .3s', width: progress + '%' }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 900, color: '#0f172a' }}>{reviewed}/{studyCards.length} tarjetas repasadas</div>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#94a3b8', marginTop: 2 }}>{filtered.length ? 'Tus tarjetas' : 'Tarjetas recomendadas para empezar'}</div>
              </div>
            </aside>

            <div style={{ display: 'grid', gap: 14 }}>
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
              ) : studyCards.length > 0 ? (
                <DeckCompleteState onReset={resetDeck} count={reviewed} />
              ) : (
                <EmptyStudyState />
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button onClick={() => answerCard('dont')} disabled={!current} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: '1px solid #fecaca', background: 'white', borderRadius: 4, padding: 12, fontWeight: 900, fontSize: 13, color: '#dc2626', cursor: 'pointer', opacity: !current ? .45 : 1 }}>
                  <XCircle size={15} /> No me la sé
                </button>
                <button onClick={() => answerCard('know')} disabled={!current} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: '1px solid #bbf7d0', background: '#f0fdf4', borderRadius: 4, padding: 12, fontWeight: 900, fontSize: 13, color: '#059669', cursor: 'pointer', opacity: !current ? .45 : 1 }}>
                  <CheckCircle2 size={15} /> Me la sé
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Create mode ── */}
      {mode === 'create' && (
        <section style={{ borderTop: '2px solid #0f172a', paddingTop: 24 }} className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 4, background: '#fafaf9', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <p style={eyebrowStyle}>Crear tarjeta</p>
              <h3 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 20, fontWeight: 700, color: '#0f172a', letterSpacing: '-.01em', marginBottom: 6, marginTop: 6 }}>Hazlo rápido y vuelve luego</h3>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#64748b', lineHeight: 1.7 }}>Guarda aquí fórmulas, errores o ideas que quieras recordar.</p>
            </div>
            <div style={{ border: '1px solid #e2e8f0', background: 'white', borderRadius: 4, padding: '12px 14px', fontSize: 12, fontWeight: 600, color: '#64748b', lineHeight: 1.7 }}>
              Ejemplo: escribe <code style={{ background: '#f1f5f9', borderRadius: 3, padding: '1px 4px', fontSize: 11 }}>{`$P(A\\mid B)$`}</code> o una fórmula en bloque y se verá con el mismo renderizador.
            </div>
          </div>

          <form onSubmit={createCard} style={{ border: '1px solid #e2e8f0', borderRadius: 4, background: 'white', padding: 20, display: 'grid', gap: 14 }}>
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

            <div>
              <label style={labelStyle}>Pregunta / concepto</label>
              <textarea value={form.front} onChange={e => setForm(prev => ({ ...prev, front: e.target.value }))} placeholder="Concepto o pregunta" style={{ ...inputStyle, minHeight: 96, resize: 'vertical' }} />
            </div>

            <div>
              <label style={labelStyle}>Respuesta / explicación</label>
              <textarea value={form.back} onChange={e => setForm(prev => ({ ...prev, back: e.target.value }))} placeholder="Definición, explicación o regla" style={{ ...inputStyle, minHeight: 132, resize: 'vertical' }} />
            </div>

            {formError && <div style={{ border: '1px solid #bfdbfe', background: '#eff6ff', borderRadius: 4, padding: '10px 14px', fontSize: 13, fontWeight: 800, color: '#1e40af' }}>{formError}</div>}

            <button disabled={saving} style={{ display: 'inline-flex', width: '100%', alignItems: 'center', justifyContent: 'center', gap: 7, background: '#0f172a', border: 'none', borderRadius: 4, padding: 12, fontWeight: 900, fontSize: 13, color: 'white', cursor: saving ? 'wait' : 'pointer', opacity: saving ? .7 : 1 }}>
              <Plus size={16} />{saving ? 'Guardando...' : 'Crear tarjeta'}
            </button>
          </form>
        </section>
      )}

      {/* ── Space mode ── */}
      {mode === 'space' && (
        <section style={{ borderTop: '2px solid #0f172a', paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingBottom: 16, borderBottom: '1px solid #e2e8f0' }}>
            <div>
              <p style={eyebrowStyle}>Mi espacio</p>
              <h3 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 20, fontWeight: 700, color: '#0f172a', letterSpacing: '-.01em', marginTop: 5 }}>Guarda aquí lo que quieras volver a repasar</h3>
            </div>
            <Link href="/zona/canvas" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#0f172a', color: 'white', borderRadius: 4, padding: '9px 14px', fontSize: 11, fontWeight: 900, textDecoration: 'none' }}>
              Abrir canvas <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div style={{ display: 'grid', gap: 8 }}>
              {cards.length > 0 ? cards.map(card => (
                <SavedCard key={card.id} card={card} onDelete={() => void deleteCard(card)} />
              )) : (
                <div style={{ border: '1px dashed #bfdbfe', borderRadius: 4, background: '#f8fafc', padding: 28, textAlign: 'center' }}>
                  <Sparkles style={{ margin: '0 auto 10px', color: '#2563eb', display: 'block' }} size={26} />
                  <h4 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Todavía no tienes tarjetas propias</h4>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#64748b', lineHeight: 1.7, marginBottom: 14 }}>Crea una con un error o fórmula que quieras repasar.</p>
                  <button onClick={() => setMode('create')} style={{ background: '#0f172a', color: 'white', border: 'none', borderRadius: 4, padding: '9px 16px', fontSize: 12, fontWeight: 900, cursor: 'pointer' }}>Crear primera tarjeta</button>
                </div>
              )}
            </div>

            <aside style={{ display: 'grid', alignContent: 'start', gap: 10, border: '1px solid #e2e8f0', borderRadius: 4, padding: 16, background: '#fafaf9' }}>
              <div style={{ paddingBottom: 10, borderBottom: '1px solid #e2e8f0' }}>
                <div style={eyebrowStyle}>Tarjetas recomendadas</div>
                <p style={{ fontSize: 12, fontWeight: 500, color: '#64748b', lineHeight: 1.6, marginTop: 5 }}>Copia solo las que quieras tener en tu cuenta.</p>
              </div>
              {SUBJECTS.filter(item => !selectedSubject || item.id === selectedSubject.id).map(item => {
                const deckSize = RECOMMENDED_FLASHCARDS.filter(card => card.subject === item.id).length
                return (
                  <article key={item.id} style={{ border: '1px solid #e2e8f0', borderRadius: 4, padding: '12px 14px', background: 'white' }}>
                    <div style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '.14em', color: item.color, marginBottom: 3 }}>Recomendado</div>
                    <h4 style={{ fontSize: 13, fontWeight: 900, color: '#0f172a', marginBottom: 2 }}>{item.label}</h4>
                    <p style={{ fontSize: 11, fontWeight: 500, color: '#64748b', marginBottom: 10 }}>{deckSize} tarjetas esenciales</p>
                    <button onClick={() => void copyRecommendedDeck(item.id)} disabled={copyingSubject !== null} style={{ display: 'inline-flex', width: '100%', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 4, padding: '7px 10px', fontSize: 11, fontWeight: 900, cursor: 'pointer', border: `1px solid ${item.color}33`, background: item.soft, color: item.color, opacity: copyingSubject !== null ? .6 : 1 }}>
                      <CopyPlus size={13} />{copyingSubject === item.id ? 'Copiando...' : 'Copiar tarjetas'}
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

function CardFace({ subject, topic, label, text, back = false }: { subject: ZonaSubject; topic: string; label: string; text: string; back?: boolean }) {
  const color = SUBJECTS.find(item => item.id === subject)?.color ?? '#2563eb'

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      minHeight: 320,
      borderRadius: 6,
      padding: 26,
      background: back ? '#f8fafc' : 'white',
      border: '1px solid #e2e8f0',
      boxShadow: '0 8px 32px rgba(0,0,0,.06)',
      backfaceVisibility: 'hidden',
      transform: back ? 'rotateY(180deg)' : 'rotateY(0deg)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      overflowX: 'auto'
    }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ color, fontWeight: 900, fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>{subjectLabel(subject)} · {topic}</span>
      </div>
      <MathMarkdown text={text} className={back ? 'text-lg font-semibold overflow-x-auto' : 'text-xl font-black overflow-x-auto'} />
      <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600 }}>Toca para girar · Arrastra derecha/izquierda</div>
    </div>
  )
}

function SavedCard({ card, onDelete }: { card: Flashcard; onDelete: () => void }) {
  return (
    <article style={{ border: '1px solid #e2e8f0', borderRadius: 4, padding: '14px 16px', background: 'white' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '.14em', color: '#94a3b8', marginBottom: 6 }}>{subjectLabel(card.subject)} · {card.topic}</div>
          <div style={{ fontWeight: 900, color: '#0f172a', marginBottom: 8 }}><MathMarkdown text={card.front} /></div>
          <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 4, padding: '10px 12px', fontSize: 13, fontWeight: 500, color: '#475569' }}><MathMarkdown text={card.back} /></div>
        </div>
        <button onClick={onDelete} aria-label="Eliminar flashcard" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, border: '1px solid #fecaca', background: 'white', borderRadius: 4, color: '#dc2626', cursor: 'pointer' }}>
          <Trash2 size={14} />
        </button>
      </div>
    </article>
  )
}

function DeckCompleteState({ onReset, count }: { onReset: () => void; count: number }) {
  return (
    <div style={{ display: 'grid', minHeight: 320, placeItems: 'center', border: '1px solid #bbf7d0', borderRadius: 4, background: '#f0fdf4', padding: 24, textAlign: 'center' }}>
      <div>
        <CheckCircle2 style={{ margin: '0 auto 10px', color: '#059669', display: 'block' }} size={32} />
        <h3 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>¡Mazo completado!</h3>
        <p style={{ fontSize: 13, fontWeight: 500, color: '#64748b', lineHeight: 1.6, marginBottom: 16 }}>{count} tarjeta{count !== 1 ? 's' : ''} repasada{count !== 1 ? 's' : ''}.</p>
        <button onClick={onReset} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#059669', color: 'white', border: 'none', borderRadius: 4, padding: '9px 16px', fontSize: 12, fontWeight: 900, cursor: 'pointer' }}>
          <RotateCcw size={13} /> Repetir mazo
        </button>
      </div>
    </div>
  )
}

function EmptyStudyState() {
  return (
    <div style={{ display: 'grid', minHeight: 320, placeItems: 'center', border: '1px dashed #bfdbfe', borderRadius: 4, background: '#f8fafc', padding: 24, textAlign: 'center' }}>
      <div>
        <Sparkles style={{ margin: '0 auto 10px', color: '#2563eb', display: 'block' }} size={26} />
        <h3 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>No hay tarjetas con este filtro</h3>
        <p style={{ fontSize: 13, fontWeight: 500, color: '#64748b', lineHeight: 1.6 }}>Prueba otra asignatura o crea una flashcard propia.</p>
      </div>
    </div>
  )
}

function subjectLabel(subject: ZonaSubject) {
  return SUBJECTS.find(item => item.id === subject)?.label ?? subject
}

const eyebrowStyle: CSSProperties = {
  fontSize: 9,
  fontWeight: 900,
  letterSpacing: '.18em',
  textTransform: 'uppercase',
  color: '#94a3b8',
  margin: 0,
}

const labelStyle: CSSProperties = {
  display: 'block',
  color: '#64748b',
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  marginBottom: 6,
}

const inputStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  border: '1px solid #e2e8f0',
  background: 'white',
  color: '#0f172a',
  borderRadius: 4,
  padding: '10px 12px',
  font: 'inherit',
  fontSize: 13,
  outline: 'none',
}
