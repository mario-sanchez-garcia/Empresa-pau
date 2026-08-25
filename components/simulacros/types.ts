export type SimulacroSubject = 'mates' | 'matematicas_ccss' | 'fisica' | 'quimica' | 'biologia' | 'ingles' | 'lengua' | 'historia'
export type SimulacroDifficulty = 'Fácil' | 'Media' | 'Difícil'
export type SimulacroOption = 'A' | 'B'
export type SimulacroStatus = 'en_progreso' | 'completado'

export interface SimulacroBlock {
  id: string
  numero: number
  tema: string
  comunidad?: string
  year: number
  convocatoria: string
  option: SimulacroOption
  puntuacion: number
  enunciado: string
  criterios?: string
  textoFuente?: string
  conceptos?: string[]
  imagenes?: string[]
  requiereImagen?: boolean
  // Historia only for now (examenesHistoria) — real curriculum_topics slugs
  // for this exercise, used to filter by the chips a student picked when
  // creating a Parcial instead of the free-text block/theme match.
  topicSlugs?: string[]
}

export interface SimulacroAnswer {
  text: string
  // Legacy single-photo fields — kept so sessions saved before multi-photo
  // support (respuestas_parciales persisted in Supabase) still resume and
  // correct correctly. New answers use `images` instead.
  image?: string | null
  imageType?: string | null
  images?: Array<{ data: string; mediaType: string }>
}

export interface SimulacroRecord {
  id: string
  user_id: string
  asignatura: SimulacroSubject
  comunidad?: string
  opcion: SimulacroOption
  dificultad: SimulacroDifficulty
  dificultad_real?: string | null
  bloques: SimulacroBlock[]
  respuestas_parciales?: Record<string, SimulacroAnswer>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resultado_json?: any
  nota_final?: number | null
  estado: SimulacroStatus
  tiempo_empleado?: number | null
  // Future-compatible fields. Until the table exposes them, the active timer uses created_at as its fixed start.
  started_at?: string | null
  duration_minutes?: number | null
  submitted_at?: string | null
  created_at?: string
  updated_at?: string
  // Presente cuando este intento es "Repetir para mejorar" de otro anterior
  // — ver app/lib/camino/repeatImprovement.ts para el cálculo de XP reducido.
  repeated_from_id?: string | null
}
