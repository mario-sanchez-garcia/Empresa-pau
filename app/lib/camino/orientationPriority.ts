import type { CaminoOrientationContext } from '../../orientacion/access-paths/types.ts'

export type MissionPriorityReasonCode = 'exam_soon' | 'academic_risk' | 'weak_topic' | 'orientation_high_weight' | 'orientation_weight' | 'orientation_gap'

export type MissionPriorityReason = {
  code: MissionPriorityReasonCode
  label: string
  source: 'camino' | 'orientation'
  daysUntilExam?: number
  weighting?: 0.1 | 0.2
}

export type MissionPriorityReasonPresentation = {
  code: MissionPriorityReasonCode
  label: string
  source: MissionPriorityReason['source']
  emphasis: 'primary' | 'secondary'
}

export type MissionPriorityPresentation = {
  visibleReasons: MissionPriorityReasonPresentation[]
  explanation: string | null
}

export type MissionPriorityInput = {
  subject: string
  reason?: string
  missionType?: string
  metadata?: Record<string, unknown>
}

export type OrientationImpact = {
  level: 'none' | 'low' | 'medium'
  score: number
  weighting: 0.1 | 0.2 | null
  defaultGrade: number | null
}

export type PersistedOrientationGoal = {
  degree: string
  university: string
  admissionScore: number
  sourceType: 'official' | 'fixture' | null
  community?: string | null
}

function normalized(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function canonicalSubject(value: string) {
  const subject = normalized(value)
  const aliases: Record<string, string> = {
    'matematicas-ii': 'matematicas-ii',
    'matematicas-2': 'matematicas-ii',
    'matematicas-ccss': 'matematicas-aplicadas-ccss-ii',
    'matematicas-aplicadas-a-las-ciencias-sociales-ii': 'matematicas-aplicadas-ccss-ii',
    'matematicas-aplicadas-ciencias-sociales-ii': 'matematicas-aplicadas-ccss-ii',
    'matematicas-aplicadas-ccss-ii': 'matematicas-aplicadas-ccss-ii',
    'economia': 'empresa-diseno-modelos-negocio',
    'economia-de-la-empresa': 'empresa-diseno-modelos-negocio',
    'empresa-y-diseno-de-modelos-de-negocio': 'empresa-diseno-modelos-negocio',
    'empresa-diseno-modelos-negocio': 'empresa-diseno-modelos-negocio',
    'historia-espana': 'historia-filosofia-o-espana-admision',
    'historia-de-espana': 'historia-filosofia-o-espana-admision',
    'historia-filosofia': 'historia-filosofia-o-espana-admision',
    'historia-de-la-filosofia': 'historia-filosofia-o-espana-admision',
    'historia-filosofia-o-espana-admision': 'historia-filosofia-o-espana-admision',
  }
  return aliases[subject] ?? subject
}

function hasSafeRoute(context: CaminoOrientationContext | null | undefined) {
  if (!context || context.calculationComplete !== true) return false
  if (context.route === 'international_homologation_pending') return false
  // Los contextos antiguos de Bachibac/internacional no distinguían la ruta.
  // Sin esa pieza no se aplica ninguna señal; español e IB sí son inequívocos.
  return Boolean(context.route)
}

export function matchingOrientationContext(localContext: CaminoOrientationContext | null, persistedTarget: PersistedOrientationGoal | null | undefined) {
  if (!localContext || !persistedTarget || persistedTarget.sourceType !== 'official') return null
  if (normalized(localContext.target.degree) !== normalized(persistedTarget.degree)) return null
  if (normalized(localContext.target.university) !== normalized(persistedTarget.university)) return null
  if (localContext.target.community && persistedTarget.community && normalized(localContext.target.community) !== normalized(persistedTarget.community)) return null
  return localContext
}

export function orientationImpactForSubject(subject: string, context: CaminoOrientationContext | null | undefined): OrientationImpact {
  if (!hasSafeRoute(context)) return { level: 'none', score: 0, weighting: null, defaultGrade: null }
  const match = context!.impactSubjects.find(candidate => canonicalSubject(candidate.subjectCode) === canonicalSubject(subject) || canonicalSubject(candidate.name) === canonicalSubject(subject))
  if (!match) return { level: 'none', score: 0, weighting: null, defaultGrade: null }

  // La ponderación procede del motor/datos de Orientación. Aquí solo se
  // convierte en una señal conservadora de ordenación; no se recalcula la
  // nota de admisión ni se promete una ganancia concreta.
  const gradeFactor = match.defaultGrade >= 9 ? 0.15 : match.defaultGrade >= 8.5 ? 0.35 : match.defaultGrade >= 7.5 ? 0.7 : 1
  const gapFactor = context!.gap == null ? 0.7 : context!.gap >= 0 ? 0.35 : 1 + Math.min(0.35, Math.abs(context!.gap) * 0.08)
  const score = Math.round((match.weighting === 0.2 ? 36 : 16) * gradeFactor * gapFactor)
  return {
    level: score >= 25 ? 'medium' : score > 0 ? 'low' : 'none',
    score,
    weighting: match.weighting,
    defaultGrade: match.defaultGrade,
  }
}

function metadataNumber(metadata: Record<string, unknown> | undefined, key: string) {
  const value = metadata?.[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function daysUntilExam(mission: MissionPriorityInput, todayISO?: string) {
  const examDate = mission.metadata?.partial_exam_date
  if (todayISO && typeof examDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(examDate)) {
    const delta = Math.ceil((new Date(`${examDate}T12:00:00Z`).getTime() - new Date(`${todayISO}T12:00:00Z`).getTime()) / 86400000)
    if (Number.isFinite(delta) && delta >= 0) return delta
  }
  return metadataNumber(mission.metadata, 'days_until_exam')
}

export function priorityReasonsForMission(mission: MissionPriorityInput, context?: CaminoOrientationContext | null, todayISO?: string): MissionPriorityReason[] {
  const reasons: MissionPriorityReason[] = []
  const examDays = daysUntilExam(mission, todayISO)
  if (examDays != null && examDays <= 14) {
    reasons.push({
      code: 'exam_soon',
      label: examDays === 0 ? 'Tu examen es hoy.' : `Tu examen es en ${examDays} día${examDays === 1 ? '' : 's'}.`,
      source: 'camino',
      daysUntilExam: examDays,
    })
  }
  if (mission.metadata?.plan_mode === 'rescue') {
    reasons.push({ code: 'academic_risk', label: 'Tu ritmo actual necesita priorizar este contenido.', source: 'camino' })
  }
  if (mission.metadata?.weak_review === true) {
    reasons.push({ code: 'weak_topic', label: 'Es uno de tus contenidos más flojos.', source: 'camino' })
  }

  const impact = orientationImpactForSubject(mission.subject, context)
  if (impact.weighting && context) {
    const university = context.target.universityAcronym || context.target.university
    reasons.push({
      code: impact.weighting === 0.2 ? 'orientation_high_weight' : 'orientation_weight',
      label: `${mission.subject} pondera ${impact.weighting.toLocaleString('es-ES')} para ${context.target.degree} en ${university}.`,
      source: 'orientation',
      weighting: impact.weighting,
    })
    if (context.gap != null && context.gap < 0) {
      reasons.push({ code: 'orientation_gap', label: 'Mejorarla puede acercarte a tu objetivo.', source: 'orientation', weighting: impact.weighting })
    }
  }
  return reasons
}

export function missionPriorityScore(mission: MissionPriorityInput, context?: CaminoOrientationContext | null, todayISO?: string) {
  const examDays = daysUntilExam(mission, todayISO)
  const examScore = examDays == null ? 0 : examDays <= 1 ? 500 : examDays <= 3 ? 450 : examDays <= 7 ? 380 : examDays <= 14 ? 300 : 0
  const riskScore = mission.metadata?.plan_mode === 'rescue' ? 250 : 0
  const weaknessScore = mission.metadata?.weak_review === true ? 180 : 0
  return examScore + riskScore + weaknessScore + orientationImpactForSubject(mission.subject, context).score
}

export function rankMissionCandidates<T extends MissionPriorityInput>(missions: T[], context?: CaminoOrientationContext | null, todayISO?: string): T[] {
  return missions
    .map((mission, index) => ({ mission, index, score: missionPriorityScore(mission, context, todayISO) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(item => item.mission)
}

export function withPriorityReasons<T extends MissionPriorityInput>(mission: T, context?: CaminoOrientationContext | null, todayISO?: string): T {
  const priorityReasons = priorityReasonsForMission(mission, context, todayISO)
  if (priorityReasons.length === 0) return mission
  return { ...mission, metadata: { ...mission.metadata, priorityReasons } }
}

export function formatPriorityReasons(mission: MissionPriorityInput) {
  const reasons = Array.isArray(mission.metadata?.priorityReasons) ? mission.metadata.priorityReasons as MissionPriorityReason[] : []
  return reasons.slice(0, 2).map(reason => reason.label).join(' ')
}

function compactReasonLabel(reason: MissionPriorityReason) {
  switch (reason.code) {
    case 'exam_soon':
      return reason.daysUntilExam === 0
        ? 'Examen hoy'
        : `Examen en ${reason.daysUntilExam} día${reason.daysUntilExam === 1 ? '' : 's'}`
    case 'academic_risk':
      return 'Ritmo en riesgo'
    case 'weak_topic':
      return 'Este tema te cuesta'
    case 'orientation_high_weight':
    case 'orientation_weight':
      return reason.weighting
        ? `Pondera ${reason.weighting.toLocaleString('es-ES')} para tu objetivo`
        : 'Importa para tu objetivo'
    case 'orientation_gap':
      return 'Puede acercarte a tu objetivo'
  }
}

function explanationClause(reason: MissionPriorityReason) {
  const label = reason.label.replace(/[.!?]+$/, '')
  if (label.startsWith('Tu ')) return `tu ${label.slice(3)}`
  if (label.startsWith('Es ')) return `es ${label.slice(3)}`
  if (label.startsWith('Mejorarla ')) return `mejorarla ${label.slice(10)}`
  return label
}

/**
 * Adapta las razones estructuradas a microcopy de interfaz. No decide ni
 * puntúa misiones: solo presenta señales ya emitidas por el motor.
 *
 * La señal universitaria se omite cuando su impacto fue demasiado tenue para
 * intervenir materialmente en la recomendación, aunque el dato de ponderación
 * exista en el objetivo.
 */
export function priorityPresentationForMission(
  mission: MissionPriorityInput,
  { orientationInfluenced = false }: { orientationInfluenced?: boolean } = {},
): MissionPriorityPresentation {
  const priorityReasons = Array.isArray(mission.metadata?.priorityReasons)
    ? mission.metadata.priorityReasons as MissionPriorityReason[]
    : []
  const applicableReasons = priorityReasons.filter(reason => reason.source !== 'orientation' || orientationInfluenced)
  const visibleReasons = applicableReasons.slice(0, 2).map((reason, index) => ({
    code: reason.code,
    label: compactReasonLabel(reason),
    source: reason.source,
    emphasis: index === 0 ? 'primary' as const : 'secondary' as const,
  }))
  const clauses = applicableReasons.map(explanationClause).filter(Boolean)
  const explanation = clauses.length === 0
    ? null
    : `Te recomiendo empezar por esto porque ${clauses.length === 1 ? clauses[0] : `${clauses.slice(0, -1).join(', ')} y ${clauses.at(-1)}`}.`

  return { visibleReasons, explanation }
}

export function orientationRotationBonusSlots(subject: string, context?: CaminoOrientationContext | null) {
  return orientationImpactForSubject(subject, context).level === 'medium' ? 1 : 0
}
