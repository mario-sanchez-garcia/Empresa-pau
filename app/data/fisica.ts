export type TipoFisica =
  | "Gravitacion"
  | "Ondas"
  | "Electricidad"
  | "Optica"
  | "RadioactividadModerna"

export interface PreguntaFisicaApp {
  id: string
  bloque: TipoFisica
  opcion: "A" | "B"
  enunciado: string
  puntuacion: number
  criterios: string
}

export interface ExamenFisica {
  id: number
  año: number
  tipo: "Ordinaria" | "Extraordinaria" | "Modelo"
  asignatura: "Física"
  comunidad: string
  preguntas: PreguntaFisicaApp[]
}

export const examenesFisica: ExamenFisica[] = [
  {
    id: 100,
    año: 2024,
    tipo: "Ordinaria",
    asignatura: "Física",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "f-2024-jun-A1",
        bloque: "Gravitacion",
        opcion: "A",
        enunciado: "A.1. La distancia del satélite Halimede a Neptuno varía entre 12 y 21 millones de km.\n\na) Calcule el trabajo realizado por la atracción gravitatoria de Neptuno sobre Halimede en el tránsito del punto más próximo al más distante de la órbita.\n\nb) Sabiendo que la energía mecánica de Halimede vale −2,5·10²⁰ J, determine la velocidad máxima que alcanza en su órbita.\n\nDatos: G = 6,67·10⁻¹¹ N m² kg⁻²; MH = 1,60·10¹⁵ kg; MN = 1,02·10²⁶ kg",
        puntuacion: 2,
        criterios: "Se valorará el planteamiento físico, el uso correcto de fórmulas, unidades, sustitución numérica, resultado final y justificación razonada."
      },
      {
        id: "f-2024-jun-B1",
        bloque: "Gravitacion",
        opcion: "B",
        enunciado: "B.1. Un satélite de 200 kg de masa se mueve en una órbita cerrada alrededor de la Tierra. En un determinado instante, es detectado a 630 km de altura, moviéndose a 9,92 km s⁻¹ con velocidad perpendicular a la dirección radial.\n\na) Compare la velocidad del satélite con la correspondiente a una órbita circular de la altura dada y razone si la órbita es circular o elíptica.\n\nb) Calcule los módulos del momento angular y de la aceleración del satélite en el instante señalado.\n\nDatos: G = 6,67·10⁻¹¹ N m² kg⁻²; Mt = 5,97·10²⁴ kg; Rt = 6,37·10⁶ m",
        puntuacion: 2,
        criterios: "Se valorará el planteamiento físico, el uso correcto de fórmulas, unidades, sustitución numérica, resultado final y justificación razonada."
      }
    ]
  }
]
