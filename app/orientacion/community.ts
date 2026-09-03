export const ORIENTATION_COMMUNITIES = ['Madrid', 'Cataluña'] as const
export type OrientationCommunity = typeof ORIENTATION_COMMUNITIES[number]

export const ORIENTATION_COMMUNITY_STORAGE_KEY = 'kairo_orientation_community_v1'

export const COMMUNITY_CONFIG: Record<OrientationCommunity, {
  slug: string
  databaseValue: string
  admissionRound: string
  accessGroup: string
  referenceLabel: string
  catalogLabel: string
}> = {
  Madrid: {
    slug: 'madrid',
    databaseValue: 'Comunidad de Madrid',
    admissionRound: 'grupo_1_ordinaria',
    accessGroup: 'Grupo 1',
    referenceLabel: 'Referencia · Grupo 1 ordinaria · 2026-2027',
    catalogLabel: 'Distrito Único de Madrid',
  },
  Cataluña: {
    slug: 'cataluna',
    databaseValue: 'Cataluña',
    admissionRound: 'primera_assignacio_juny',
    accessGroup: 'PAU / CFGS',
    referenceLabel: 'Nota de referencia · 1.ª asignación de junio (10/07/2026)',
    catalogLabel: 'Preinscripción universitaria de Cataluña',
  },
}

export function normalizeOrientationCommunity(value: unknown): OrientationCommunity | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  if (normalized === 'madrid' || normalized === 'comunidad de madrid') return 'Madrid'
  if (normalized === 'cataluna' || normalized === 'catalunya') return 'Cataluña'
  return null
}

export function communityFromSearchParam(value: string | null) {
  return normalizeOrientationCommunity(value)
}

export function communitySlug(community: OrientationCommunity) {
  return COMMUNITY_CONFIG[community].slug
}
