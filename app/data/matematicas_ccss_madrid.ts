import type { Examen } from './examenes'

export const MATEMATICAS_CCSS_LABEL = 'Matemáticas Aplicadas a las Ciencias Sociales'

export const fuentesMatematicasCCSSMadrid = [
  { año: 2018, tipo: 'Ordinaria', archivo: 'Examen Matemáticas Aplicadas a las Ciencias Sociales de la Comunidad de Madrid (Ordinaria de 2018) [www.examenesdepau.com].pdf' },
  { año: 2018, tipo: 'Extraordinaria', archivo: 'Examen Matemáticas Aplicadas a las Ciencias Sociales de la Comunidad de Madrid (Extraordinaria de 2018) [www.examenesdepau.com].pdf' },
  { año: 2019, tipo: 'Ordinaria', archivo: 'Examen Matemáticas Aplicadas a las Ciencias Sociales de la Comunidad de Madrid (Ordinaria de 2019) [www.examenesdepau.com].pdf' },
  { año: 2019, tipo: 'Extraordinaria', archivo: 'Examen Matemáticas Aplicadas a las Ciencias Sociales de la Comunidad de Madrid (Extraordinaria de 2019) [www.examenesdepau.com].pdf' },
  { año: 2020, tipo: 'Ordinaria', archivo: 'Examen Matemáticas Aplicadas a las Ciencias Sociales de la Comunidad de Madrid (Ordinaria de 2020) [www.examenesdepau.com].pdf' },
  { año: 2020, tipo: 'Extraordinaria', archivo: 'Examen Matemáticas Aplicadas a las Ciencias Sociales de la Comunidad de Madrid (Extraordinaria de 2020) [www.examenesdepau.com].pdf' },
  { año: 2021, tipo: 'Ordinaria', archivo: 'Examen Matemáticas Aplicadas a las Ciencias Sociales de la Comunidad de Madrid (Ordinaria de 2021) [www.examenesdepau.com].pdf' },
  { año: 2021, tipo: 'Extraordinaria', archivo: 'Examen Matemáticas Aplicadas a las Ciencias Sociales de la Comunidad de Madrid (Extraordinaria de 2021) [www.examenesdepau.com].pdf' },
  { año: 2022, tipo: 'Ordinaria', archivo: 'Examen Matemáticas Aplicadas a las Ciencias Sociales de la Comunidad de Madrid (Ordinaria de 2022) [www.examenesdepau.com].pdf' },
  { año: 2022, tipo: 'Extraordinaria', archivo: 'Examen Matemáticas Aplicadas a las Ciencias Sociales de la Comunidad de Madrid (Extraordinaria de 2022) [www.examenesdepau.com].pdf' },
  { año: 2023, tipo: 'Ordinaria', archivo: 'Examen Matemáticas Aplicadas a las Ciencias Sociales de la Comunidad de Madrid (Ordinaria de 2023) [www.examenesdepau.com].pdf' },
  { año: 2023, tipo: 'Extraordinaria', archivo: 'Examen Matemáticas Aplicadas a las Ciencias Sociales de la Comunidad de Madrid (Extraordinaria de 2023) [www.examenesdepau.com].pdf' },
  { año: 2024, tipo: 'Ordinaria', archivo: 'Examen Matemáticas Aplicadas a las Ciencias Sociales de la Comunidad de Madrid (Ordinaria de 2024) [www.examenesdepau.com].pdf' },
  { año: 2024, tipo: 'Extraordinaria', archivo: 'Examen Matemáticas Aplicadas a las Ciencias Sociales de la Comunidad de Madrid (Extraordinaria de 2024) [www.examenesdepau.com].pdf' },
  { año: 2025, tipo: 'Ordinaria', archivo: 'Examen Matemáticas Aplicadas a las Ciencias Sociales de la Comunidad de Madrid (Ordinaria de 2025) [www.examenesdepau.com].pdf' },
  { año: 2025, tipo: 'Extraordinaria', archivo: 'Examen Matemáticas Aplicadas a las Ciencias Sociales de la Comunidad de Madrid (Extraordinaria de 2025) [www.examenesdepau.com].pdf' },
] as const

export const examenesMatematicasCCSSMadrid: Examen[] = fuentesMatematicasCCSSMadrid.map((fuente, index) => ({
  id: 7000 + index,
  año: fuente.año,
  tipo: fuente.tipo,
  asignatura: MATEMATICAS_CCSS_LABEL,
  comunidad: 'Madrid',
  preguntas: [],
}))
