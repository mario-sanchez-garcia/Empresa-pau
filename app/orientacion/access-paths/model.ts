import type { AccessPathDefinition, AccessPathId, AccessScenarioMap, StoredSubjectInputs } from './types'
import type { OrientationCommunity } from '../community'

export const MADRID_ADMISSION_AGREEMENT_URL = 'https://www.comunidad.madrid/docs/2026-06/acuerdo-universidades-2026-2027.pdf'
export const BACHIBAC_MINISTRY_URL = 'https://www.educacionfpydeportes.gob.es/mc/bachibac/presentacion/acceso-universidad/acceso-universidad-espanola.html'
export const FOREIGN_EQUIVALENCE_ORDER_URL = 'https://www.boe.es/buscar/act.php?id=BOE-A-2025-10777'
export const UNIVERSITY_ACCESS_DECREE_URL = 'https://www.boe.es/buscar/doc.php?id=BOE-A-2024-11858'
export const UNEDASISS_STUDENT_TYPES_URL = 'https://unedasiss.uned.es/publico_destino'
export const CATALUNYA_FOREIGN_ACCESS_URL = 'https://universitats.gencat.cat/es/preinscripcions/acces-universitat-estudis-estrangers/'
export const CATALUNYA_WEIGHTINGS_URL = 'https://universitats.gencat.cat/es/preinscripcions/ponderacions/'

export const ACCESS_PATH_IDS: AccessPathId[] = ['spanish_bachillerato', 'bachibac', 'ib', 'international']

export const ACCESS_PATHS: AccessPathDefinition[] = [
  {
    id: 'spanish_bachillerato',
    shortLabel: 'Bachillerato',
    label: 'Bachillerato español',
    description: 'Título español y PAU ordinaria.',
    officialSummary: 'La CAU es 60 % de la media de Bachillerato y 40 % de la fase de acceso PAU. Debe alcanzar 5 y puede llegar a 10.',
    kairoSummary: 'Es el cálculo que ya conoces: tu media y la PAU construyen la base; después cuentan tus dos mejores ponderaciones.',
    changes: ['No cambia respecto al simulador habitual.'],
    needs: ['Media de Bachillerato', 'Calificación de la fase de acceso PAU'],
    stays: ['Objetivo', 'Ponderaciones 0,1/0,2', 'Máximo de 14 puntos'],
    subjectOrigin: 'Fase de admisión PAU y, cuando proceda, materia obligatoria de modalidad.',
    sources: [{ organization: 'Universidades públicas de Madrid', document: 'Acuerdo de admisión 2026-2027', period: 'Curso 2026-2027', url: MADRID_ADMISSION_AGREEMENT_URL }],
  },
  {
    id: 'bachibac',
    shortLabel: 'Bachibac',
    label: 'Bachibac',
    description: 'Elige el título con el que concurrirás.',
    officialSummary: 'Bachibac permite acceder con el título español y PAU o con el diplôme du Baccalauréat. En esta segunda ruta, la nota del diplôme se obtiene con 70 % de la media de Bachillerato y 30 % de la prueba externa.',
    kairoSummary: 'Kairo guarda las dos rutas por separado. Elige la que presentarás: no mezclaremos la prueba externa con la fase de acceso PAU.',
    changes: ['Puedes sustituir la CAU ordinaria por la nota del diplôme.', 'Si usas el título español, conservas el cálculo 60/40.'],
    needs: ['Título que harás valer', 'Media y prueba externa, o media y PAU'],
    stays: ['Mismo grado objetivo', 'Dos mejores ponderaciones', 'Máximo de 14 puntos'],
    subjectOrigin: 'Pruebas de admisión PAU válidas para mejorar la nota; deben estar aprobadas y ponderar para el grado.',
    sources: [
      { organization: 'Ministerio de Educación', document: 'Acceso a la universidad española — Bachibac', period: 'Documentación vigente consultada en 2026', url: BACHIBAC_MINISTRY_URL },
      { organization: 'BOE', document: 'Real Decreto 534/2024, disposición adicional tercera', period: 'Vigente', url: UNIVERSITY_ACCESS_DECREE_URL },
    ],
  },
  {
    id: 'ib',
    shortLabel: 'IB',
    label: 'Bachillerato Internacional (IB)',
    description: 'Diploma IB y acreditación UNEDasiss.',
    officialSummary: 'En Madrid, la CAU es la que figura en la acreditación UNEDasiss. La equivalencia estatal usa las calificaciones de las materias IB en escala 2–7 y la fórmula genérica de conversión a 5–10.',
    kairoSummary: 'Si ya tienes la acreditación, copia su CAU. Si aún no, puedes estimarla desde la media de tus seis materias; nunca multiplicamos tus puntos sobre 45.',
    changes: ['La base no usa 60 % Bachillerato + 40 % PAU.', 'La CAU procede de UNEDasiss o de la conversión oficial de materias.'],
    needs: ['CAU acreditada o media de las seis materias IB'],
    stays: ['Mismo objetivo', 'Dos mejores ponderaciones válidas', 'Máximo de 14 puntos'],
    subjectOrigin: 'PCE, materias reconocidas en la acreditación o fase de admisión PAU cuando proceda; no la obligatoria de modalidad de una fase de acceso.',
    sources: [
      { organization: 'BOE', document: 'Orden EFD/550/2025, anexos II y III', period: 'Aplicable desde 2025-2026 y siguientes', url: FOREIGN_EQUIVALENCE_ORDER_URL },
      { organization: 'Universidades públicas de Madrid', document: 'Acuerdo de admisión 2026-2027', period: 'Curso 2026-2027', url: MADRID_ADMISSION_AGREEMENT_URL },
    ],
  },
  {
    id: 'international',
    shortLabel: 'Internacional',
    label: 'Estudios internacionales',
    description: 'UE/con convenio o vía de homologación.',
    officialSummary: 'Madrid distingue el acceso directo con acreditación UNEDasiss de los estudios extracomunitarios sin convenio que requieren homologación y PCE para acreditar modalidad.',
    kairoSummary: 'Dinos en cuál de los dos casos estás. Si todavía no tienes PCE/modalidad, Kairo te muestra el trámite pendiente sin inventar una nota comparable.',
    changes: ['La CAU puede venir de una acreditación o de la fórmula específica de homologación + PCE.', 'Sin PCE/modalidad, el reparto queda relegado a la convocatoria extraordinaria.'],
    needs: ['Tipo de sistema', 'Acreditación UNEDasiss o media homologada y PCE'],
    stays: ['Mismo grado objetivo', 'Ponderaciones oficiales del grado', 'Máximo de 14 puntos cuando la vía está completa'],
    subjectOrigin: 'Acceso directo: PCE, reconocimiento o PAU de admisión cuando proceda. Homologación: únicamente PCE UNED.',
    sources: [
      { organization: 'Universidades públicas de Madrid', document: 'Acuerdo de admisión 2026-2027, apartados 3.5, 3.6, 7.3 y 7.4', period: 'Curso 2026-2027', url: MADRID_ADMISSION_AGREEMENT_URL },
      { organization: 'UNEDasiss', document: 'Tipos de estudiantes internacionales', period: 'Documentación vigente consultada en 2026', url: UNEDASISS_STUDENT_TYPES_URL },
    ],
  },
]

export function getAccessPath(pathId: AccessPathId, community: OrientationCommunity = 'Madrid') {
  const base = ACCESS_PATHS.find(path => path.id === pathId) ?? ACCESS_PATHS[0]
  if (community === 'Madrid') return base
  const catalunyaSource = { organization: 'Generalitat de Catalunya · Canal Universitats', document: 'Acceso con estudios extranjeros y ponderaciones', period: 'Preinscripción 2026-2027', url: CATALUNYA_FOREIGN_ACCESS_URL }
  if (pathId === 'international') return {
    ...base,
    description: 'UE/con convenio o Bachillerato homologado.',
    officialSummary: 'Cataluña distingue la acreditación UNEDasiss de UE, convenios e IB y la vía con Bachillerato homologado. La nota de acceso va de 5 a 10; la admisión puede llegar a 14 con las dos mejores materias aprobadas y ponderables.',
    kairoSummary: 'Solo usamos la vía que indiques. En acceso directo copiamos la nota UNEDasiss; con homologación calculamos el 60/40 de la prueba de acceso sin trasladar reglas de Madrid.',
    changes: ['Las materias de la acreditación no suman si no se han examinado por PAU o PCE.', 'Solo se eligen las dos mejores aportaciones ponderadas en Cataluña.'],
    needs: ['Acreditación UNEDasiss, o nota homologada y cuatro pruebas obligatorias'],
    subjectOrigin: 'Únicamente materias examinadas mediante PAU/EBAU o PCE, aprobadas y ponderables en Cataluña; no basta con que aparezcan reconocidas en UNEDasiss.',
    sources: [catalunyaSource, { organization: 'Generalitat de Catalunya · Canal Universitats', document: 'Ponderaciones 2026', period: '2026', url: CATALUNYA_WEIGHTINGS_URL }],
  }
  if (pathId === 'ib') return {
    ...base,
    officialSummary: 'En Cataluña, el Diploma IB accede mediante acreditación UNEDasiss con una nota entre 5 y 10. Para subir hasta 14 solo cuentan las dos mejores materias aprobadas, ponderables y examinadas por PAU o PCE.',
    subjectOrigin: 'Solo materias examinadas mediante PAU/EBAU o PCE; una materia reconocida en la acreditación UNEDasiss sin examen no suma ponderación.',
    sources: [catalunyaSource, ...base.sources.filter(source => source.organization === 'BOE')],
  }
  return {
    ...base,
    subjectOrigin: 'Materias aprobadas de admisión PAU/EBAU o PCE que ponderen para el grado en Cataluña; se aplican las dos mejores aportaciones.',
    sources: pathId === 'bachibac' ? [...base.sources.filter(source => source.organization !== 'Universidades públicas de Madrid'), catalunyaSource] : [catalunyaSource],
  }
}

export function createDefaultAccessScenarios(): AccessScenarioMap {
  return {
    spanish_bachillerato: { pathId: 'spanish_bachillerato', bachillerato: 8.2, accessPhase: 7.8 },
    bachibac: { pathId: 'bachibac', route: 'french_diploma', bachillerato: 8.2, externalTest: 7.8, accessPhase: 7.8 },
    ib: { pathId: 'ib', inputMode: 'accredited_cau', accreditedCau: null, subjectAverage: null },
    international: { pathId: 'international', route: 'direct_unedasiss', accreditedCau: null, homologatedAverage: null, pceGrades: [null, null, null, null] },
  }
}

export function createEmptyStoredSubjectInputs(): StoredSubjectInputs {
  return { spanish_bachillerato: {}, bachibac: {}, ib: {}, international: {} }
}
