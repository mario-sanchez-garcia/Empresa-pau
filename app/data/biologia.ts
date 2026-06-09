export type BloqueBiologia =
  | "Bioquimica"
  | "Genetica"
  | "Microbiologia"
  | "Inmunologia"
  | "Evolucion"
  | "Fisiologia"
  | "Biotecnologia"
  | "Ecologia"

export interface PreguntaBiologia {
  id: string
  año: number
  convocatoria: "Ordinaria" | "Extraordinaria" | "Modelo"
  opcion: "A" | "B"
  bloque: BloqueBiologia
  label: string
  numero: string
  enunciado: string
  puntuacion: number
  criterios: string
  imagenes?: string[]
  requiereImagen?: boolean
  pdfFuente?: string
}

export interface ExamenBiologia {
  id: number
  año: number
  tipo: "Ordinaria" | "Extraordinaria" | "Modelo"
  asignatura: "Biología"
  comunidad: "Madrid"
  preguntas: PreguntaBiologia[]
}

export const BIOLOGIA_TOPICS: Array<{ tipo: BloqueBiologia; label: string; pts: number }> = [
  { tipo: "Bioquimica", label: "Bioquímica", pts: 2 },
  { tipo: "Genetica", label: "Genética", pts: 2 },
  { tipo: "Microbiologia", label: "Microbiología", pts: 2 },
  { tipo: "Inmunologia", label: "Inmunología", pts: 2 },
  { tipo: "Evolucion", label: "Evolución", pts: 2 },
  { tipo: "Fisiologia", label: "Fisiología", pts: 2 },
  { tipo: "Biotecnologia", label: "Biotecnología", pts: 2 },
  { tipo: "Ecologia", label: "Ecología", pts: 2 }
]

export const examenesBiologia: ExamenBiologia[] = []
