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
}

export interface SimulacroAnswer {
  text: string
  image?: string | null
  imageType?: string | null
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
}
