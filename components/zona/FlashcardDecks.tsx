'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  CheckCircle2,
  ClipboardPaste,
  Globe2,
  Lock,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Trophy,
  X,
  XCircle,
} from 'lucide-react'
import { supabase } from '@/app/lib/supabase'
import MathMarkdown from '@/components/shared/MathMarkdown'
import { SUBJECTS, subjectLabel, eyebrowStyle, labelStyle, inputStyle } from './zonaShared'
import type { ZonaSubject } from './types'

// flashcard_decks.subject usa el mismo check constraint que flashcards.subject
// (ver supabase/migrations/20260611120500_...), que no incluye
// matematicas_ccss — se filtra aquí para no ofrecer una opción que el
// servidor rechazaría.
const DECK_SUBJECTS = SUBJECTS.filter(s => s.id !== 'matematicas_ccss')

type DeckSummary = {
  id: string
  subject: ZonaSubject
  topic: string
  title: string
  isPublic: boolean
  publishedAt: string | null
  createdAt: string
  isMine: boolean
  cardCount: number
}

type DeckCard = { id: string; front: string; back: string }

type RankingEntry = {
  id: string
  name: string
  isCurrentUser: boolean
  correctFirstTry: number
  totalCards: number
  durationSeconds: number
  rank: number
}

type MyStats = {
  attemptsCount: number
  bestCorrectFirstTry: number
  totalTimeSeconds: number
  attempts: { id: string; totalCards: number; correctFirstTry: number; durationSeconds: number; createdAt: string }[]
}

type CardDraft = { front: string; back: string }
type CardStatus = 'unseen' | 'correct' | 'failed'
type View = 'list' | 'create' | 'detail' | 'play'

async function authedFetch(path: string, init?: RequestInit) {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  const headers = new Headers(init?.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return fetch(path, { ...init, headers })
}

// Acepta texto pegado de un CSV, una hoja de cálculo (tabulado) o una lista
// simple "concepto - explicación" por línea — suficiente para lo que exporta
// un Gemini Notebook o Excel al copiar/pegar, sin depender de un formato de
// fichero concreto. Las líneas que no se pueden partir en dos se descartan y
// se cuentan como "skipped" para avisar antes de guardar.
function parseImportText(raw: string): { cards: CardDraft[]; skipped: number } {
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  const cards: CardDraft[] = []
  let skipped = 0
  for (const line of lines) {
    let parts: string[] | null = null
    if (line.includes('\t')) parts = line.split('\t')
    else if (line.includes(';')) parts = line.split(';')
    else if ((line.match(/,/g) ?? []).length === 1) parts = line.split(',')
    else {
      const dashMatch = line.match(/^(.+?)\s+[-–]\s+(.+)$/)
      if (dashMatch) parts = [dashMatch[1], dashMatch[2]]
    }
    if (!parts || parts.length < 2) { skipped++; continue }
    const front = parts[0].trim()
    const back = parts.slice(1).join(' ').trim()
    if (!front || !back) { skipped++; continue }
    cards.push({ front, back })
  }
  return { cards, skipped }
}

function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return m > 0 ? `${m} min ${s}s` : `${s}s`
}

export default function FlashcardDecks({ onExit }: { onExit?: () => void }) {
  const [view, setView] = useState<View>('list')
  const [myDecks, setMyDecks] = useState<DeckSummary[]>([])
  const [publicDecks, setPublicDecks] = useState<DeckSummary[]>([])
  const [maxCardsForPlan, setMaxCardsForPlan] = useState(15)
  const [loadingDecks, setLoadingDecks] = useState(true)
  const [decksError, setDecksError] = useState('')

  const [selectedDeck, setSelectedDeck] = useState<DeckSummary | null>(null)
  const [deckCards, setDeckCards] = useState<DeckCard[]>([])
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [myStats, setMyStats] = useState<MyStats | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // ── Study session state ──
  const [queue, setQueue] = useState<string[]>([])
  const [cardStatus, setCardStatus] = useState<Record<string, CardStatus>>({})
  const [flipped, setFlipped] = useState(false)
  const [sessionStart, setSessionStart] = useState<number>(0)
  const [attemptResult, setAttemptResult] = useState<{ xpAwarded: number; bonusXp: number; authorBonusAwarded: boolean } | null>(null)
  const [submittingAttempt, setSubmittingAttempt] = useState(false)

  // ── Create form state ──
  const [form, setForm] = useState({ subject: 'mates' as ZonaSubject, topic: '', title: '', isPublic: false })
  const [draftCards, setDraftCards] = useState<CardDraft[]>([{ front: '', back: '' }, { front: '', back: '' }])
  const [importText, setImportText] = useState('')
  const [importFeedback, setImportFeedback] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  async function loadDecks() {
    setLoadingDecks(true)
    setDecksError('')
    try {
      const [mineRes, publicRes] = await Promise.all([
        authedFetch('/api/flashcards/decks?scope=mine'),
        authedFetch('/api/flashcards/decks?scope=public'),
      ])
      const mine = await mineRes.json()
      const pub = await publicRes.json()
      if (!mineRes.ok) throw new Error(mine?.error ?? 'Error al cargar tus mazos')
      setMyDecks(mine.decks ?? [])
      if (typeof mine.maxCardsForPlan === 'number') setMaxCardsForPlan(mine.maxCardsForPlan)
      setPublicDecks(pub?.decks ?? [])
    } catch (err) {
      setDecksError(err instanceof Error ? err.message : 'Error al cargar mazos')
    } finally {
      setLoadingDecks(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadDecks()
  }, [])

  async function openDeck(deck: DeckSummary) {
    setSelectedDeck(deck)
    setView('detail')
    setLoadingDetail(true)
    setDeckCards([])
    setRanking([])
    setMyStats(null)
    try {
      const [detailRes, rankingRes] = await Promise.all([
        authedFetch(`/api/flashcards/decks/${deck.id}`),
        authedFetch(`/api/flashcards/decks/${deck.id}/ranking`),
      ])
      const detail = await detailRes.json()
      const rankingJson = await rankingRes.json()
      if (detailRes.ok) setDeckCards(detail.cards ?? [])
      if (rankingRes.ok) {
        setRanking(rankingJson.ranking ?? [])
        setMyStats(rankingJson.myStats ?? null)
      }
    } finally {
      setLoadingDetail(false)
    }
  }

  function startSession(cards: DeckCard[]) {
    setQueue(cards.map(c => c.id))
    setCardStatus(Object.fromEntries(cards.map(c => [c.id, 'unseen' as CardStatus])))
    setFlipped(false)
    setSessionStart(Date.now())
    setAttemptResult(null)
    setView('play')
  }

  function startFailedOnlySession() {
    const failedIds = Object.entries(cardStatus).filter(([, status]) => status === 'failed').map(([id]) => id)
    if (!failedIds.length) return
    setQueue(failedIds)
    setFlipped(false)
    setSessionStart(Date.now())
    setAttemptResult(null)
    setView('play')
  }

  const currentCard = useMemo(() => deckCards.find(c => c.id === queue[0]) ?? null, [deckCards, queue])
  const totalInSession = queue.length + Object.values(cardStatus).filter(s => s !== 'unseen' && queue[0] !== undefined).length
  const doneCount = Object.values(cardStatus).filter(s => s !== 'unseen').length

  function answerCurrent(correct: boolean) {
    if (!currentCard) return
    setCardStatus(prev => {
      // Solo cuenta como "correcta a la primera" si nunca había fallado antes.
      if (correct && prev[currentCard.id] === 'failed') return prev
      return { ...prev, [currentCard.id]: correct ? 'correct' : 'failed' }
    })
    setFlipped(false)
    setQueue(prev => {
      const remaining = prev.slice(1)
      if (correct) return remaining
      if (remaining.length === 0) return [currentCard.id]
      const insertAt = Math.min(remaining.length, 2 + Math.floor(Math.random() * remaining.length))
      const next = [...remaining]
      next.splice(insertAt, 0, currentCard.id)
      return next
    })
  }

  async function finishSession() {
    if (!selectedDeck || submittingAttempt) return
    setSubmittingAttempt(true)
    const correctFirstTry = Object.values(cardStatus).filter(s => s === 'correct').length
    const durationSeconds = Math.max(1, Math.round((Date.now() - sessionStart) / 1000))
    try {
      const res = await authedFetch(`/api/flashcards/decks/${selectedDeck.id}/attempt`, {
        method: 'POST',
        body: JSON.stringify({ totalCards: deckCards.length, correctFirstTry, durationSeconds }),
      })
      const json = await res.json()
      if (res.ok) {
        setAttemptResult({ xpAwarded: json.xpAwarded ?? 0, bonusXp: json.bonusXp ?? 0, authorBonusAwarded: !!json.authorBonusAwarded })
        const rankingRes = await authedFetch(`/api/flashcards/decks/${selectedDeck.id}/ranking`)
        const rankingJson = await rankingRes.json()
        if (rankingRes.ok) {
          setRanking(rankingJson.ranking ?? [])
          setMyStats(rankingJson.myStats ?? null)
        }
      }
    } finally {
      setSubmittingAttempt(false)
    }
  }

  useEffect(() => {
    if (view === 'play' && queue.length === 0 && deckCards.length > 0 && !attemptResult && !submittingAttempt) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void finishSession()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, queue.length, deckCards.length])

  function resetCreateForm() {
    setForm({ subject: 'mates', topic: '', title: '', isPublic: false })
    setDraftCards([{ front: '', back: '' }, { front: '', back: '' }])
    setImportText('')
    setImportFeedback('')
    setCreateError('')
  }

  function updateDraftCard(index: number, field: 'front' | 'back', value: string) {
    setDraftCards(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c))
  }

  function addDraftRow() {
    if (draftCards.length >= maxCardsForPlan) return
    setDraftCards(prev => [...prev, { front: '', back: '' }])
  }

  function removeDraftRow(index: number) {
    setDraftCards(prev => prev.filter((_, i) => i !== index))
  }

  function applyImport() {
    const { cards, skipped } = parseImportText(importText)
    if (cards.length === 0) {
      setImportFeedback('No se ha podido reconocer ninguna tarjeta. Usa una línea por tarjeta con formato "concepto;respuesta", tabulado o "concepto - respuesta".')
      return
    }
    const capped = cards.slice(0, maxCardsForPlan)
    setDraftCards(capped)
    setImportFeedback(
      `Importadas ${capped.length} tarjeta${capped.length !== 1 ? 's' : ''}.`
      + (skipped > 0 ? ` Se ignoraron ${skipped} línea${skipped !== 1 ? 's' : ''} que no tenían el formato esperado.` : '')
      + (cards.length > maxCardsForPlan ? ` Tu plan permite un máximo de ${maxCardsForPlan} tarjetas por mazo, así que se recortó el resto.` : ''),
    )
  }

  async function createDeck() {
    setCreateError('')
    const validCards = draftCards.map(c => ({ front: c.front.trim(), back: c.back.trim() })).filter(c => c.front && c.back)
    if (!form.topic.trim()) { setCreateError('Escribe un tema para el mazo.'); return }
    if (validCards.length === 0) { setCreateError('Añade al menos una tarjeta con concepto y respuesta.'); return }

    setCreating(true)
    try {
      const res = await authedFetch('/api/flashcards/decks', {
        method: 'POST',
        body: JSON.stringify({
          subject: form.subject,
          topic: form.topic.trim(),
          title: form.title.trim() || form.topic.trim(),
          isPublic: form.isPublic,
          cards: validCards,
        }),
      })
      const json = await res.json()
      if (!res.ok) { setCreateError(json?.error ?? 'Error al crear el mazo'); return }
      resetCreateForm()
      await loadDecks()
      setView('list')
    } catch {
      setCreateError('Error de conexión al crear el mazo')
    } finally {
      setCreating(false)
    }
  }

  async function deleteDeck(deck: DeckSummary) {
    // Borrado irreversible — si el mazo es público, se pierde también para
    // cualquiera que lo tuviera guardado. Mismo patrón de confirmación que
    // deleteSimulacro en app/simulacros/page.tsx.
    if (!window.confirm(`¿Borrar el mazo "${deck.title || 'sin nombre'}"? No se puede deshacer.`)) return
    await authedFetch(`/api/flashcards/decks/${deck.id}`, { method: 'DELETE' })
    if (selectedDeck?.id === deck.id) { setSelectedDeck(null); setView('list') }
    await loadDecks()
  }

  async function togglePublic(deck: DeckSummary) {
    await authedFetch(`/api/flashcards/decks/${deck.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isPublic: !deck.isPublic }),
    })
    await loadDecks()
    if (selectedDeck?.id === deck.id) setSelectedDeck({ ...deck, isPublic: !deck.isPublic })
  }

  // ── Views ──

  if (view === 'create') {
    return (
      <section style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <ViewHeader
          eyebrow="Nuevo mazo"
          title="Crea tu propio mazo"
          subtitle={`Hasta ${maxCardsForPlan} tarjetas por mazo con tu plan actual.`}
          onBack={() => { resetCreateForm(); setView('list') }}
        />

        <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: 4, background: 'white', padding: 16, display: 'grid', gap: 12 }}>
              <div>
                <label style={labelStyle}>Asignatura</label>
                <select value={form.subject} onChange={e => setForm(prev => ({ ...prev, subject: e.target.value as ZonaSubject }))} style={inputStyle}>
                  {DECK_SUBJECTS.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Tema</label>
                <input value={form.topic} onChange={e => setForm(prev => ({ ...prev, topic: e.target.value }))} placeholder="Matrices, ondas, Restauración..." style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Título del mazo (opcional)</label>
                <input value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Se usa el tema si lo dejas vacío" style={inputStyle} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isPublic} onChange={e => setForm(prev => ({ ...prev, isPublic: e.target.checked }))} />
                Publicar como mazo público (otros alumnos podrán resolverlo y ganar XP; si va bien, tú también ganas XP)
              </label>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: 4, background: '#fafaf9', padding: 16, display: 'grid', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <ClipboardPaste size={14} color="#2563eb" />
                <span style={{ fontSize: 12, fontWeight: 900, color: '#0f172a' }}>Importar desde texto/CSV</span>
              </div>
              <p style={{ fontSize: 11, fontWeight: 500, color: '#64748b', lineHeight: 1.6 }}>
                Pega una tarjeta por línea: &ldquo;concepto;respuesta&rdquo;, separado por tabulador (al pegar de Excel/Sheets) o &ldquo;concepto - respuesta&rdquo;.
              </p>
              <textarea
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder={'Mitosis;División celular que da lugar a dos células idénticas\nMeiosis;División celular que reduce a la mitad el número de cromosomas'}
                style={{ ...inputStyle, minHeight: 110, resize: 'vertical', fontFamily: 'ui-monospace, monospace', fontSize: 12 }}
              />
              <button
                type="button"
                onClick={applyImport}
                disabled={!importText.trim()}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: '1px solid #bfdbfe', background: '#eff6ff', borderRadius: 4, padding: '8px 12px', fontSize: 11, fontWeight: 900, color: '#1e40af', cursor: importText.trim() ? 'pointer' : 'not-allowed', opacity: importText.trim() ? 1 : .5 }}
              >
                Reconocer tarjetas
              </button>
              {importFeedback && (
                <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', lineHeight: 1.6 }}>{importFeedback}</div>
              )}
            </div>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: 4, background: 'white', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={eyebrowStyle}>Tarjetas ({draftCards.length}/{maxCardsForPlan})</span>
              <button
                type="button"
                onClick={addDraftRow}
                disabled={draftCards.length >= maxCardsForPlan}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: '1px solid #e2e8f0', background: 'white', borderRadius: 4, padding: '6px 10px', fontSize: 11, fontWeight: 900, color: '#0f172a', cursor: draftCards.length >= maxCardsForPlan ? 'not-allowed' : 'pointer', opacity: draftCards.length >= maxCardsForPlan ? .5 : 1 }}
              >
                <Plus size={12} /> Añadir tarjeta
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 480, overflowY: 'auto' }}>
              {draftCards.map((card, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 6, alignItems: 'start' }}>
                  <input value={card.front} onChange={e => updateDraftCard(i, 'front', e.target.value)} placeholder="Concepto" style={inputStyle} />
                  <input value={card.back} onChange={e => updateDraftCard(i, 'back', e.target.value)} placeholder="Respuesta" style={inputStyle} />
                  <button type="button" onClick={() => removeDraftRow(i)} aria-label="Eliminar tarjeta" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, border: '1px solid #fecaca', background: 'white', borderRadius: 4, color: '#dc2626', cursor: 'pointer' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            {createError && <div style={{ border: '1px solid #fecaca', background: '#fef2f2', borderRadius: 4, padding: '10px 14px', fontSize: 12, fontWeight: 800, color: '#b91c1c' }}>{createError}</div>}

            <button
              onClick={createDeck}
              disabled={creating}
              style={{ display: 'inline-flex', width: '100%', alignItems: 'center', justifyContent: 'center', gap: 7, background: '#0f172a', border: 'none', borderRadius: 4, padding: 12, fontWeight: 900, fontSize: 13, color: 'white', cursor: creating ? 'wait' : 'pointer', opacity: creating ? .7 : 1 }}
            >
              {creating ? 'Guardando...' : 'Crear mazo'}
            </button>
          </div>
        </div>
      </section>
    )
  }

  if (view === 'detail' && selectedDeck) {
    return (
      <section style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <ViewHeader
          eyebrow={subjectLabel(selectedDeck.subject)}
          title={selectedDeck.title}
          subtitle={`${selectedDeck.topic} · ${deckCards.length} tarjeta${deckCards.length !== 1 ? 's' : ''}`}
          onBack={() => setView('list')}
        />

        {loadingDetail ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Cargando mazo...</div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <button
                onClick={() => startSession(deckCards)}
                disabled={deckCards.length === 0}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#0f172a', color: 'white', border: 'none', borderRadius: 4, padding: 14, fontSize: 14, fontWeight: 900, cursor: 'pointer' }}
              >
                Empezar mazo
              </button>

              {selectedDeck.isMine && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => void togglePublic(selectedDeck)} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: '1px solid #e2e8f0', background: 'white', borderRadius: 4, padding: 10, fontSize: 11, fontWeight: 900, color: '#334155', cursor: 'pointer' }}>
                    {selectedDeck.isPublic ? <><Lock size={13} /> Hacer privado</> : <><Globe2 size={13} /> Publicar mazo</>}
                  </button>
                  <button onClick={() => void deleteDeck(selectedDeck)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: '1px solid #fecaca', background: 'white', borderRadius: 4, padding: '10px 14px', fontSize: 11, fontWeight: 900, color: '#dc2626', cursor: 'pointer' }}>
                    <Trash2 size={13} /> Borrar
                  </button>
                </div>
              )}

              <div style={{ border: '1px solid #e2e8f0', borderRadius: 4, background: 'white', padding: 16 }}>
                <div style={eyebrowStyle}>Tarjetas del mazo</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
                  {deckCards.map(card => (
                    <div key={card.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: '#334155', padding: '6px 8px', borderRadius: 4, background: '#fafaf9' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor(cardStatus[card.id]), flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.front}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <StatsPanel myStats={myStats} />
              <RankingPanel ranking={ranking} isPublic={selectedDeck.isPublic} />
            </aside>
          </div>
        )}
      </section>
    )
  }

  if (view === 'play' && selectedDeck) {
    if (attemptResult) {
      const failedCount = Object.values(cardStatus).filter(s => s === 'failed').length
      const correctCount = Object.values(cardStatus).filter(s => s === 'correct').length
      return (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', placeItems: 'center', border: '1px solid #bbf7d0', borderRadius: 4, background: '#f0fdf4', padding: 32, textAlign: 'center' }}>
            <CheckCircle2 style={{ margin: '0 auto 10px', color: '#059669' }} size={34} />
            <h3 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>¡Mazo completado!</h3>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
              {correctCount} a la primera · {failedCount} con algún fallo
            </p>
            <p style={{ fontSize: 13, fontWeight: 900, color: '#059669', marginBottom: 18 }}>
              +{attemptResult.xpAwarded} XP{attemptResult.bonusXp > 0 ? ` (incluye +${attemptResult.bonusXp} de bonus extra)` : ''}
              {attemptResult.authorBonusAwarded ? ' · el autor del mazo también ha ganado XP' : ''}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
              <button onClick={() => startSession(deckCards)} style={actionBtnStyle('#0f172a', 'white')}>
                <RotateCcw size={13} /> Repetir mazo completo
              </button>
              {failedCount > 0 && (
                <button onClick={startFailedOnlySession} style={actionBtnStyle('#fef2f2', '#dc2626', '#fecaca')}>
                  <XCircle size={13} /> Repasar solo las falladas
                </button>
              )}
              <button onClick={() => { resetCreateForm(); setView('create') }} style={actionBtnStyle('#eff6ff', '#1e40af', '#bfdbfe')}>
                <Plus size={13} /> Crear nuevo mazo
              </button>
              <button onClick={() => setView('list')} style={actionBtnStyle('white', '#334155', '#e2e8f0')}>
                Volver a mazos
              </button>
            </div>
          </div>
        </section>
      )
    }

    return (
      <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, fontWeight: 900, color: '#64748b' }}>{doneCount}/{Math.max(totalInSession, deckCards.length)} repasadas</span>
          <button onClick={() => setView('detail')} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: 'none', background: 'transparent', color: '#64748b', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>
            <X size={13} /> Salir
          </button>
        </div>

        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {deckCards.map(card => (
            <span key={card.id} title={card.front} style={{ width: 9, height: 9, borderRadius: '50%', background: statusColor(cardStatus[card.id]) }} />
          ))}
        </div>

        {currentCard ? (
          <div style={{ perspective: 1200 }}>
            <div
              onClick={() => setFlipped(prev => !prev)}
              style={{
                position: 'relative', minHeight: 300, transformStyle: 'preserve-3d',
                transform: `rotateY(${flipped ? 180 : 0}deg)`, transition: 'transform .28s ease', cursor: 'pointer',
              }}
            >
              <PlayCardFace label="Concepto" text={currentCard.front} subject={selectedDeck.subject} />
              <PlayCardFace label="Respuesta" text={currentCard.back} subject={selectedDeck.subject} back />
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', minHeight: 300, placeItems: 'center', color: '#94a3b8', fontSize: 13 }}>Calculando resultado...</div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button onClick={() => answerCurrent(false)} disabled={!currentCard} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: '1px solid #fecaca', background: 'white', borderRadius: 4, padding: 12, fontWeight: 900, fontSize: 13, color: '#dc2626', cursor: 'pointer', opacity: !currentCard ? .45 : 1 }}>
            <XCircle size={15} /> No me la sé
          </button>
          <button onClick={() => answerCurrent(true)} disabled={!currentCard} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: '1px solid #bbf7d0', background: '#f0fdf4', borderRadius: 4, padding: 12, fontWeight: 900, fontSize: 13, color: '#059669', cursor: 'pointer', opacity: !currentCard ? .45 : 1 }}>
            <CheckCircle2 size={15} /> Me la sé
          </button>
        </div>
      </section>
    )
  }

  // ── list view (default) ──
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <p style={eyebrowStyle}>Mazos</p>
          <h3 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 20, fontWeight: 700, color: '#0f172a', letterSpacing: '-.01em', marginTop: 5 }}>Tus mazos de tarjetas</h3>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {onExit && (
            <button onClick={onExit} style={{ border: '1px solid #e2e8f0', background: 'white', borderRadius: 4, padding: '9px 14px', fontSize: 11, fontWeight: 900, color: '#64748b', cursor: 'pointer' }}>
              Volver a La Zona
            </button>
          )}
          <button onClick={() => { resetCreateForm(); setView('create') }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#0f172a', color: 'white', border: 'none', borderRadius: 4, padding: '9px 16px', fontSize: 11, fontWeight: 900, cursor: 'pointer' }}>
            <Plus size={13} /> Nuevo mazo
          </button>
        </div>
      </div>

      {decksError && <div style={{ border: '1px solid #fecaca', background: '#fef2f2', borderRadius: 4, padding: '10px 14px', fontSize: 12, fontWeight: 800, color: '#b91c1c' }}>{decksError}</div>}

      {loadingDecks ? (
        <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Cargando mazos...</div>
      ) : (
        <>
          <div>
            <div style={{ ...eyebrowStyle, marginBottom: 10 }}>Mis mazos ({myDecks.length})</div>
            {myDecks.length === 0 ? (
              <EmptyDecksState onCreate={() => { resetCreateForm(); setView('create') }} />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {myDecks.map(deck => <DeckCard key={deck.id} deck={deck} onClick={() => void openDeck(deck)} />)}
              </div>
            )}
          </div>

          <div>
            <div style={{ ...eyebrowStyle, marginBottom: 10 }}>Mazos públicos de otros alumnos ({publicDecks.length})</div>
            {publicDecks.length === 0 ? (
              <p style={{ fontSize: 12, fontWeight: 500, color: '#94a3b8' }}>Todavía no hay mazos públicos de otros alumnos.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {publicDecks.map(deck => <DeckCard key={deck.id} deck={deck} onClick={() => void openDeck(deck)} />)}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  )
}

function ViewHeader({ eyebrow, title, subtitle, onBack }: { eyebrow: string; title: string; subtitle: string; onBack: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingBottom: 16, borderBottom: '1px solid #e2e8f0' }}>
      <div>
        <p style={eyebrowStyle}>{eyebrow}</p>
        <h3 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 20, fontWeight: 700, color: '#0f172a', letterSpacing: '-.01em', margin: '5px 0 3px' }}>{title}</h3>
        <p style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}>{subtitle}</p>
      </div>
      <button onClick={onBack} style={{ border: '1px solid #e2e8f0', background: 'white', borderRadius: 4, padding: '8px 13px', fontSize: 11, fontWeight: 900, color: '#64748b', cursor: 'pointer' }}>
        Volver
      </button>
    </div>
  )
}

function DeckCard({ deck, onClick }: { deck: DeckSummary; onClick: () => void }) {
  const subj = SUBJECTS.find(s => s.id === deck.subject)
  return (
    <button onClick={onClick} style={{ textAlign: 'left', border: '1px solid #e2e8f0', borderRadius: 4, background: 'white', padding: '14px 16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '.12em', color: subj?.color ?? '#2563eb' }}>{subjectLabel(deck.subject)}</span>
        {deck.isPublic && <Globe2 size={12} color="#94a3b8" />}
      </div>
      <div style={{ fontSize: 14, fontWeight: 900, color: '#0f172a' }}>{deck.title}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>{deck.topic} · {deck.cardCount} tarjeta{deck.cardCount !== 1 ? 's' : ''}</div>
    </button>
  )
}

function EmptyDecksState({ onCreate }: { onCreate: () => void }) {
  return (
    <div style={{ border: '1px dashed #bfdbfe', borderRadius: 4, background: '#f8fafc', padding: 28, textAlign: 'center' }}>
      <Sparkles style={{ margin: '0 auto 10px', color: '#2563eb', display: 'block' }} size={26} />
      <h4 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Todavía no tienes mazos</h4>
      <p style={{ fontSize: 13, fontWeight: 500, color: '#64748b', lineHeight: 1.7, marginBottom: 14 }}>Crea uno manualmente o importando texto/CSV.</p>
      <button onClick={onCreate} style={{ background: '#0f172a', color: 'white', border: 'none', borderRadius: 4, padding: '9px 16px', fontSize: 12, fontWeight: 900, cursor: 'pointer' }}>Crear mi primer mazo</button>
    </div>
  )
}

function StatsPanel({ myStats }: { myStats: MyStats | null }) {
  if (!myStats || myStats.attemptsCount === 0) {
    return (
      <div style={{ border: '1px solid #e2e8f0', borderRadius: 4, background: '#fafaf9', padding: 16 }}>
        <div style={eyebrowStyle}>Tus estadísticas</div>
        <p style={{ fontSize: 12, fontWeight: 500, color: '#94a3b8', marginTop: 8 }}>Todavía no has completado este mazo.</p>
      </div>
    )
  }
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 4, background: '#fafaf9', padding: 16 }}>
      <div style={eyebrowStyle}>Tus estadísticas</div>
      <div style={{ display: 'flex', gap: 16, margin: '10px 0 14px' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>{myStats.bestCorrectFirstTry}</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>mejor a la primera</div>
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>{myStats.attemptsCount}</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>intentos</div>
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>{formatDuration(myStats.totalTimeSeconds)}</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>tiempo total</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {myStats.attempts.slice(0, 8).map(a => (
          <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, color: '#475569' }}>
            <span>{new Date(a.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}</span>
            <span>{a.correctFirstTry}/{a.totalCards} · {formatDuration(a.durationSeconds)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function RankingPanel({ ranking, isPublic }: { ranking: RankingEntry[]; isPublic: boolean }) {
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 4, background: 'white', padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Trophy size={13} color="#CA8A04" />
        <span style={eyebrowStyle}>Ranking del mazo</span>
      </div>
      {!isPublic ? (
        <p style={{ fontSize: 11, fontWeight: 500, color: '#94a3b8', marginTop: 8 }}>Publica el mazo para comparar resultados con otros alumnos.</p>
      ) : ranking.length === 0 ? (
        <p style={{ fontSize: 11, fontWeight: 500, color: '#94a3b8', marginTop: 8 }}>Todavía nadie ha completado este mazo.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 10 }}>
          {ranking.map(entry => (
            <div key={entry.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, fontWeight: entry.isCurrentUser ? 900 : 600, color: entry.isCurrentUser ? '#0f172a' : '#475569', padding: '4px 6px', borderRadius: 4, background: entry.isCurrentUser ? '#eff6ff' : 'transparent' }}>
              <span>#{entry.rank} {entry.name}</span>
              <span>{entry.correctFirstTry}/{entry.totalCards}</span>
            </div>
          ))}
        </div>
      )}
      <p style={{ fontSize: 10, fontWeight: 500, color: '#cbd5e1', marginTop: 10, lineHeight: 1.5 }}>
        Ranking simple por ahora — el modo duelo 1v1 está pendiente de una futura versión.
      </p>
    </div>
  )
}

function PlayCardFace({ label, text, subject, back = false }: { label: string; text: string; subject: ZonaSubject; back?: boolean }) {
  const color = SUBJECTS.find(s => s.id === subject)?.color ?? '#2563eb'
  return (
    <div style={{
      position: 'absolute', inset: 0, minHeight: 300, borderRadius: 6, padding: 26,
      background: back ? '#f8fafc' : 'white', border: '1px solid #e2e8f0', boxShadow: '0 8px 32px rgba(0,0,0,.06)',
      backfaceVisibility: 'hidden', transform: back ? 'rotateY(180deg)' : 'rotateY(0deg)',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflowX: 'auto',
    }}>
      <span style={{ color, fontWeight: 900, fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase' }}>{label}</span>
      <MathMarkdown text={text} className={back ? 'text-lg font-semibold overflow-x-auto' : 'text-xl font-black overflow-x-auto'} />
      <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600 }}>Toca para girar</div>
    </div>
  )
}

function statusColor(status: CardStatus | undefined): string {
  if (status === 'correct') return '#059669'
  if (status === 'failed') return '#dc2626'
  return '#cbd5e1'
}

function actionBtnStyle(bg: string, color: string, border = 'transparent'): CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: bg, color, border: `1px solid ${border}`, borderRadius: 4,
    padding: '10px 16px', fontSize: 12, fontWeight: 900, cursor: 'pointer',
  }
}
