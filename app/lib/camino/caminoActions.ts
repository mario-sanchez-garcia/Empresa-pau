import type { CaminoTaskTypeId } from './caminoData'

export interface CaminoAction {
  label: string
  href: string
  subject?: string
  isDeepLink: boolean   // href uses a query param supported by app/page.tsx
  isFallback: boolean   // destination is closest available, not ideal
  note?: string
}

// Maps canonical subject keys to the ?subject= param values accepted by app/page.tsx.
// HOME_SUBJECTS = ['mates','matematicas_ccss','fisica','quimica','biologia','ingles','lengua','historia','historia_filosofia']
const SUBJECT_PARAM: Record<string, string> = {
  mates: 'mates',
  matematicas_ii: 'mates',
  matematicas_ccss: 'matematicas_ccss',
  ingles: 'ingles',
  historia: 'historia',
  fisica: 'fisica',
  quimica: 'quimica',
  biologia: 'biologia',
  lengua: 'lengua',
  historia_filosofia: 'historia_filosofia',
}

// Default action for each CaminoTaskTypeId.
// Block-level deep links (e.g. /?subject=mates&block=analisis) are NOT yet supported
// because bloquesMates is derived from exam state at render time, not from a URL param.
// Block filtering is deferred to Phase 2C.
export const CAMINO_ACTION_DEFAULTS: Record<CaminoTaskTypeId, CaminoAction> = {
  flashcard: {
    label: 'Repasar flashcards',
    href: '/zona',
    isDeepLink: false,
    isFallback: false,
  },
  ejercicio_corto: {
    label: 'Practicar ahora',
    href: '/?subject=mates',
    subject: 'mates',
    isDeepLink: true,
    isFallback: false,
  },
  correccion_ia: {
    label: 'Hacer corrección',
    href: '/?subject=mates',
    subject: 'mates',
    isDeepLink: true,
    isFallback: false,
    note: 'Lleva a Exámenes de Matemáticas donde está la corrección IA. Fase 2C: flujo de corrección directo.',
  },
  repaso_error: {
    label: 'Practicar refuerzo',
    href: '/?subject=mates&mode=random',
    subject: 'mates',
    isDeepLink: true,
    isFallback: false,
  },
  mini_simulacro: {
    label: 'Ir a simulacros',
    href: '/simulacros',
    isDeepLink: false,
    isFallback: false,
  },
  simulacro_completo: {
    label: 'Hacer simulacro',
    href: '/simulacros',
    isDeepLink: false,
    isFallback: false,
  },
  simulacro_completo_escalonado: {
    label: 'Hacer simulacro',
    href: '/simulacros',
    isDeepLink: false,
    isFallback: false,
  },
  estrategia_examen: {
    label: 'Ver mi plan',
    href: '/camino',
    isDeepLink: false,
    isFallback: true,
    note: 'Camino PAU concentra planificación, calendario y estrategia.',
  },
  repaso_ligero: {
    label: 'Practicar',
    href: '/?subject=mates',
    subject: 'mates',
    isDeepLink: true,
    isFallback: false,
  },
  reading: {
    label: 'Practicar reading',
    href: '/?subject=ingles',
    subject: 'ingles',
    isDeepLink: true,
    isFallback: false,
  },
  writing: {
    label: 'Practicar writing',
    href: '/?subject=ingles',
    subject: 'ingles',
    isDeepLink: true,
    isFallback: false,
  },
  test: {
    label: 'Practicar ahora',
    href: '/?subject=mates',
    subject: 'mates',
    isDeepLink: true,
    isFallback: false,
  },
}

// Params appended to all camino deep links so destination pages can show a back button.
const CAMINO_LINK_PARAMS = 'source=camino&returnTo=%2Fcamino'

/**
 * Returns the action for a task type, adjusting the href for the given subject when possible.
 * All deep links include source=camino&returnTo=/camino so destination pages can show a back button.
 */
export function buildCaminoAction(
  taskType: CaminoTaskTypeId,
  subject?: string
): CaminoAction {
  const base = { ...CAMINO_ACTION_DEFAULTS[taskType] }

  if (base.isDeepLink) {
    // Adjust subject if provided
    if (subject && !base.href.includes('view=')) {
      const param = SUBJECT_PARAM[subject]
      if (param) {
        base.href = `/examenes?subject=${param}`
        base.subject = param
      }
    }
    // Append camino tracking params
    const separator = base.href.includes('?') ? '&' : '?'
    base.href = `${base.href}${separator}${CAMINO_LINK_PARAMS}`
  }

  return base
}
