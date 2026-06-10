'use client'

import { useMemo, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import { CopyPlus, Plus, RotateCcw, Sparkles, Trash2 } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'
import MathMarkdown from '@/components/shared/MathMarkdown'
import { RECOMMENDED_FLASHCARDS } from './recommendedFlashcards'
import type { Flashcard, ZonaSubject } from './types'

const SUBJECTS: { id: ZonaSubject; label: string; color: string; soft: string }[] = [
  { id: 'mates', label: 'Mates', color: '#2563eb', soft: '#eff6ff' },
  { id: 'fisica', label: 'Física', color: '#6d28d9', soft: '#f5f3ff' },
  { id: 'quimica', label: 'Química', color: '#ea580c', soft: '#fff7ed' },
  { id: 'biologia', label: 'Biología', color: '#4d7c0f', soft: '#f7fee7' },
  { id: 'ingles', label: 'Inglés', color: '#0891B2', soft: '#CFFAFE' },
  { id: 'lengua', label: 'Lengua', color: '#4f46e5', soft: '#eef2ff' },
  { id: 'historia', label: 'Historia', color: '#2f6f4e', soft: '#f0fdf4' },
  { id: 'historia_filosofia', label: 'Filosofía', color: '#0f766e', soft: '#f0fdfa' }
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

interface FlashcardsProps {
  userId: string
  initialCards: Flashcard[]
}

function cardWeight(card: Flashcard, answers: Record<string, 'know' | 'dont'>) {
  return answers[card.id] === 'dont' ? 3 : answers[card.id] === 'know' ? 1 : 2
}

export default function Flashcards({ userId, initialCards }: FlashcardsProps) {
  const [cards, setCards] = useState<Flashcard[]>(initialCards)
  const [subject, setSubject] = useState<ZonaSubject | 'all'>('all')
  const [topic, setTopic] = useState('all')
  const [currentIdx, setCurrentIdx] = useState(0)
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
  const queue = useMemo(() => {
    return studyCards.flatMap(card => Array.from({ length: cardWeight(card, answers) }, () => card))
  }, [studyCards, answers])

  const current = queue.length ? queue[currentIdx % queue.length] : null
  const reviewed = Object.keys(answers).filter(id => studyCards.some(card => card.id === id)).length
  const progress = studyCards.length ? Math.round((reviewed / studyCards.length) * 100) : 0
  const topics = Array.from(new Set([...cards, ...RECOMMENDED_FLASHCARDS].filter(card => subject === 'all' || card.subject === subject).map(card => card.topic))).filter(Boolean)

  function resetDeck() {
    setCurrentIdx(0)
    setFlipped(false)
    setAnswers({})
    setDragX(0)
  }

  function answerCard(value: 'know' | 'dont') {
    if (!current) return
    setAnswers(prev => ({ ...prev, [current.id]: value }))
    setFlipped(false)
    setDragX(value === 'know' ? 120 : -120)
    window.setTimeout(() => {
      setCurrentIdx(prev => prev + 1)
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
      setFormError('No hemos podido guardar la flashcard. Revisa la conexion e intentalo otra vez.')
      setSaving(false)
      return
    }
    if (!error && data) {
      setCards(prev => [data as Flashcard, ...prev])
      setForm({ subject: form.subject, topic: '', front: '', back: '' })
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
    setCurrentIdx(0)
  }

  async function copyRecommendedDeck(deckSubject: ZonaSubject) {
    const deck = RECOMMENDED_FLASHCARDS.filter(card => card.subject === deckSubject)
    if (!deck.length || copyingSubject) return
    setCopyingSubject(deckSubject)
    setFormError('')
    const payload = deck.map(card => ({ user_id: userId, subject: card.subject, topic: card.topic, front: card.front, back: card.back }))
    const { data, error } = await supabase.from('flashcards').insert(payload).select('*')
    if (error) setFormError('No hemos podido copiar el mazo recomendado. Inténtalo otra vez.')
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
    <div style={{ display: 'grid', gap: 18 }}>
      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(280px, 0.75fr)', gap: 18 }}>
        <div style={{ background: 'rgba(255,255,255,0.94)', border: '1px solid ' + WARM.border, borderRadius: 28, boxShadow: '0 24px 70px rgba(37,99,235,0.10)', overflow: 'hidden' }}>
          <div style={{ padding: 22, borderBottom: '1px solid ' + WARM.border, display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <div style={{ color: WARM.softText, fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Flashcards</div>
              <h2 style={{ margin: '5px 0 0', color: WARM.ink, fontSize: 23 }}>Repasa en modo rápido</h2>
            </div>
            <button onClick={resetDeck} style={{ border: '1px solid ' + WARM.border, background: WARM.field, color: WARM.muted, borderRadius: 999, padding: '9px 13px', display: 'inline-flex', alignItems: 'center', gap: 7, fontWeight: 800, cursor: 'pointer' }}>
              <RotateCcw size={15} /> Reiniciar
            </button>
          </div>

          <div style={{ padding: 22 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              <button onClick={() => { setSubject('all'); setTopic('all'); resetDeck() }} style={chipStyle(subject === 'all', WARM.blue)}>Todas</button>
              {SUBJECTS.map(item => (
                <button key={item.id} onClick={() => { setSubject(item.id); setTopic('all'); resetDeck() }} style={chipStyle(subject === item.id, item.color)}>{item.label}</button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
              <button onClick={() => { setTopic('all'); resetDeck() }} style={topicStyle(topic === 'all')}>Todos los temas</button>
              {topics.map(item => (
                <button key={item} onClick={() => { setTopic(item); resetDeck() }} style={topicStyle(topic === item)}>{item}</button>
              ))}
            </div>

            <div style={{ height: 8, borderRadius: 999, background: '#eaf1ff', overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ width: progress + '%', height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #2563eb, #38bdf8)', transition: 'width .25s ease' }} />
            </div>
            <div style={{ color: WARM.muted, fontSize: 13, fontWeight: 750, marginBottom: 18 }}>{reviewed}/{studyCards.length} tarjetas repasadas · {filtered.length ? 'Tus flashcards' : 'Mazo recomendado para empezar'}</div>

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
                    minHeight: 280,
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
              <div style={{ minHeight: 280, borderRadius: 24, border: '1.5px dashed #bcd7ff', background: WARM.field, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
                <div>
                  <Sparkles size={34} color={WARM.blue} />
                  <h3 style={{ color: WARM.ink, margin: '12px 0 6px' }}>Tu zona está vacía... por ahora</h3>
                  <p style={{ color: WARM.muted, margin: 0, lineHeight: 1.6 }}>Prueba otro filtro o crea tu primera tarjeta.</p>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
              <button onClick={() => answerCard('dont')} disabled={!current} style={answerStyle('#475569', '#f8fafc')}>No me la sé</button>
              <button onClick={() => answerCard('know')} disabled={!current} style={answerStyle(WARM.blue, '#eff6ff')}>Me la sé</button>
            </div>
          </div>
        </div>

        <form onSubmit={createCard} style={{ background: 'rgba(255,255,255,0.94)', border: '1px solid ' + WARM.border, borderRadius: 28, boxShadow: '0 24px 70px rgba(37,99,235,0.08)', padding: 22, alignSelf: 'start' }}>
          <div style={{ color: WARM.softText, fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Crear tarjeta</div>
          <h3 style={{ color: WARM.ink, fontSize: 20, margin: '5px 0 16px' }}>Tu propio mazo</h3>

          <label style={labelStyle}>Asignatura</label>
          <select value={form.subject} onChange={e => setForm(prev => ({ ...prev, subject: e.target.value as ZonaSubject }))} style={inputStyle}>
            {SUBJECTS.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>

          <label style={labelStyle}>Tema</label>
          <input value={form.topic} onChange={e => setForm(prev => ({ ...prev, topic: e.target.value }))} placeholder="Matrices, Ondas, Restauración..." style={inputStyle} />

          <label style={labelStyle}>Frontal</label>
          <textarea value={form.front} onChange={e => setForm(prev => ({ ...prev, front: e.target.value }))} placeholder="Concepto o pregunta" style={{ ...inputStyle, minHeight: 82, resize: 'vertical' }} />

          <label style={labelStyle}>Trasera</label>
          <textarea value={form.back} onChange={e => setForm(prev => ({ ...prev, back: e.target.value }))} placeholder="Definición, explicación o regla" style={{ ...inputStyle, minHeight: 108, resize: 'vertical' }} />

          {formError && <div style={{ marginTop: 12, border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1e3a8a', borderRadius: 14, padding: '10px 12px', fontSize: 13, fontWeight: 800, lineHeight: 1.5 }}>{formError}</div>}

          <button disabled={saving} style={{ width: '100%', marginTop: 12, border: 'none', borderRadius: 16, padding: '13px 16px', background: 'linear-gradient(135deg, #1d4ed8, #2563eb, #38bdf8)', color: '#fff', fontWeight: 850, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: saving ? 'wait' : 'pointer', boxShadow: '0 16px 34px rgba(37,99,235,.24)', transition: 'transform .18s ease, box-shadow .18s ease' }}>
            <Plus size={17} />{saving ? 'Guardando...' : 'Crear flashcard'}
          </button>
        </form>
      </section>

      {filtered.length > 0 && (
        <section style={{ display: 'grid', gap: 10 }}>
          {filtered.map(card => (
            <div key={card.id} style={{ background: WARM.surface, border: '1px solid ' + WARM.border, borderRadius: 18, padding: 14, display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', boxShadow: '0 10px 26px rgba(37,99,235,0.06)' }}>
              <div>
                <div style={{ color: WARM.ink, fontWeight: 800 }}>{card.front}</div>
                <div style={{ color: WARM.softText, fontSize: 12, marginTop: 4 }}>{subjectLabel(card.subject)} · {card.topic}</div>
              </div>
              <button onClick={() => deleteCard(card)} aria-label="Eliminar flashcard" style={{ border: '1px solid #dbe7fb', color: '#2563eb', background: '#eff6ff', borderRadius: 12, width: 36, height: 36, display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </section>
      )}

      <section style={{ display: 'grid', gap: 12 }}>
        <div>
          <div style={{ color: WARM.softText, fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Para empezar</div>
          <h2 style={{ margin: '5px 0 0', color: WARM.ink, fontSize: 22 }}>Mazos recomendados</h2>
          <p style={{ color: WARM.muted, margin: '5px 0 0', fontSize: 13 }}>Puedes repasarlos sin guardarlos. Solo se añaden a tu cuenta cuando pulsas copiar.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
          {SUBJECTS.filter(item => subject === 'all' || item.id === subject).map(item => {
            const deckSize = RECOMMENDED_FLASHCARDS.filter(card => card.subject === item.id).length
            return (
              <article key={item.id} style={{ border: '1px solid ' + WARM.border, background: WARM.surface, borderRadius: 18, padding: 16, boxShadow: '0 10px 26px rgba(37,99,235,0.06)' }}>
                <div style={{ color: item.color, fontSize: 12, fontWeight: 850, textTransform: 'uppercase' }}>Mazo recomendado</div>
                <h3 style={{ color: WARM.ink, margin: '7px 0 4px' }}>{item.label}</h3>
                <p style={{ color: WARM.muted, margin: 0, fontSize: 13 }}>{deckSize} tarjetas esenciales</p>
                <button onClick={() => void copyRecommendedDeck(item.id)} disabled={copyingSubject !== null} style={{ marginTop: 14, width: '100%', border: '1px solid ' + item.color + '33', background: item.soft, color: item.color, borderRadius: 13, padding: '10px 12px', fontWeight: 850, display: 'flex', justifyContent: 'center', gap: 7, cursor: 'pointer' }}>
                  <CopyPlus size={15} />{copyingSubject === item.id ? 'Copiando...' : 'Copiar mazo'}
                </button>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function CardFace({ subject, topic, label, text, back = false }: { subject: ZonaSubject; topic: string; label: string; text: string; back?: boolean }) {
  const color = SUBJECTS.find(item => item.id === subject)?.color ?? WARM.blue

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      minHeight: 280,
      borderRadius: 26,
      padding: 26,
      background: back ? 'linear-gradient(145deg, #f8fbff, #eef6ff)' : 'linear-gradient(145deg, #ffffff, #f8fbff)',
      border: '1px solid ' + WARM.border,
      boxShadow: '0 24px 60px rgba(37,99,235,0.10)',
      backfaceVisibility: 'hidden',
      transform: back ? 'rotateY(180deg)' : 'rotateY(0deg)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
        <span style={{ color, fontWeight: 850, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ color: WARM.muted, background: WARM.field, border: '1px solid ' + WARM.border, padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 750 }}>{subjectLabel(subject)} · {topic}</span>
      </div>
      <MathMarkdown text={text} className={back ? 'text-lg font-semibold' : 'text-xl font-black'} />
      <div style={{ color: WARM.softText, fontSize: 12, fontWeight: 750 }}>Toca para girar · Arrastra derecha/izquierda</div>
    </div>
  )
}

function subjectLabel(subject: ZonaSubject) {
  return SUBJECTS.find(item => item.id === subject)?.label ?? subject
}

function chipStyle(active: boolean, color: string): CSSProperties {
  return {
    border: active ? '1px solid transparent' : '1px solid ' + WARM.border,
    background: active ? color : WARM.field,
    color: active ? '#fff' : WARM.muted,
    borderRadius: 999,
    padding: '8px 13px',
    fontWeight: 820,
    cursor: 'pointer'
  }
}

function topicStyle(active: boolean): CSSProperties {
  return {
    border: active ? '1px solid #bfdbfe' : '1px solid ' + WARM.border,
    background: active ? '#eff6ff' : WARM.surface,
    color: active ? WARM.blue : WARM.muted,
    borderRadius: 999,
    padding: '7px 12px',
    fontSize: 12,
    fontWeight: 800,
    cursor: 'pointer'
  }
}

const labelStyle: CSSProperties = {
  display: 'block',
  color: WARM.muted,
  fontSize: 12,
  fontWeight: 800,
  margin: '12px 0 7px'
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

function answerStyle(color: string, bg: string): CSSProperties {
  return {
    border: '1px solid ' + color + '22',
    background: bg,
    color,
    borderRadius: 16,
    padding: '13px 14px',
    fontWeight: 850,
    cursor: 'pointer'
  }
}
