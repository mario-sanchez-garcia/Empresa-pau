export type SimulacroSubject = 'mates' | 'fisica' | 'quimica' | 'biologia' | 'lengua' | 'historia'
export type SimulacroDifficulty = 'Fácil' | 'Media' | 'Difícil'
export type SimulacroOption = 'A' | 'B'
export type SimulacroStatus = 'en_progreso' | 'completado'

export interface SimulacroBlock {
  id: string
  numero: number
  tema: string
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
  opcion: SimulacroOption
  dificultad: SimulacroDifficulty
  dificultad_real?: string | null
  bloques: SimulacroBlock[]
  respuestas_parciales?: Record<string, SimulacroAnswer>
  resultado_json?: any
  nota_final?: number | null
  estado: SimulacroStatus
  tiempo_empleado?: number | null
  created_at?: string
  updated_at?: string
}
