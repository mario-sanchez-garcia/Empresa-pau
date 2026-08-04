import type { CSSProperties } from 'react'
import type { ZonaSubject } from './types'

// Extraído de Flashcards.tsx: Flashcards y FlashcardDecks se importaban
// entre sí (FlashcardDecks reutilizaba estas constantes de Flashcards, que a
// su vez renderiza FlashcardDecks como uno de sus modos), y ese ciclo de
// imports rompía el build de producción de /zona con un
// "Cannot access before initialization" al evaluar los módulos. Vivir aquí,
// sin depender de ninguno de los dos componentes, corta el ciclo.
export const SUBJECTS: { id: ZonaSubject; label: string; color: string; soft: string }[] = [
  { id: 'mates', label: 'Mates', color: '#2563eb', soft: '#eff6ff' },
  { id: 'matematicas_ccss', label: 'Matemáticas CCSS', color: '#7c3aed', soft: '#f5f3ff' },
  { id: 'fisica', label: 'Física', color: '#CA8A04', soft: '#FEFCE8' },
  { id: 'quimica', label: 'Química', color: '#ea580c', soft: '#fff7ed' },
  { id: 'lengua', label: 'Lengua', color: '#0284C7', soft: '#E0F2FE' },
  { id: 'historia', label: 'Historia', color: '#2f6f4e', soft: '#f0fdf4' },
  { id: 'historia_filosofia', label: 'Filosofía', color: '#64748B', soft: '#F8FAFC' },
  { id: 'ingles', label: 'Inglés', color: '#0891B2', soft: '#CFFAFE' },
  { id: 'biologia', label: 'Biología', color: '#4d7c0f', soft: '#f7fee7' },
]

export function subjectLabel(subject: ZonaSubject) {
  return SUBJECTS.find(item => item.id === subject)?.label ?? subject
}

export const eyebrowStyle: CSSProperties = {
  fontSize: 9,
  fontWeight: 900,
  letterSpacing: '.18em',
  textTransform: 'uppercase',
  color: '#94a3b8',
  margin: 0,
}

export const labelStyle: CSSProperties = {
  display: 'block',
  color: '#64748b',
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  marginBottom: 6,
}

export const inputStyle: CSSProperties = {
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
