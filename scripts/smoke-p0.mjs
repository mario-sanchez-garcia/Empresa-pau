import { readFileSync } from 'node:fs'

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

function assert(name, condition) {
  if (!condition) {
    console.error(`FAIL ${name}`)
    process.exitCode = 1
    return
  }
  console.log(`OK   ${name}`)
}

const page = read('app/page.tsx')
const chatRoute = read('app/api/chat/route.ts')
const mathFormatting = read('app/lib/mathFormatting.ts')
const mathMarkdown = read('components/shared/MathMarkdown.tsx')
const signupRoute = read('app/api/auth/signup/route.ts')
const signupMigration = read('supabase/migrations/20260621130000_create_signup_attempts.sql')
const pricing = read('app/pricing/page.tsx')
const landing = read('app/landing/page.tsx')
const loginPage = read('app/login/page.tsx')
const sidebar = read('app/components/Sidebar.tsx')
const caminoCalendar = read('app/components/camino/CaminoCalendarClient.tsx')
const caminoPlan = read('app/lib/camino/caminoCurriculumPlan.ts')
const caminoPlanLimits = read('app/lib/camino/caminoPlanLimits.ts')
const caminoSeed = read('app/data/camino/curriculum_seed.json')
const caminoTopic = read('app/camino/tema/[subject]/[block]/[topic]/CaminoTopicClient.tsx')
const caminoCourseTopic = read('app/camino-pau/curso/[subject]/[block]/[topic]/page.tsx')
const randomEvauExercise = read('app/lib/camino/randomEvauExercise.ts')
const mathCcssSeed = read('supabase/migrations/20260622120000_seed_curriculum_flashcards_mates_ccss.sql')
const caminoCurriculumMigration = read('supabase/migrations/20260623110000_create_camino_curriculum_tables.sql')
const whyTheory = read('app/lib/whyItWorksTheory.ts')
const whyHistoryMigration = read('supabase/migrations/20260623113000_add_why_it_works_to_historial_examenes.sql')
const whyExplanationComponent = read('components/shared/WhyExplanation.tsx')
const packageJson = read('package.json')
const nextConfig = read('next.config.ts')

assert(
  'streaming correction uses safe progressive stream before final renderer',
  page.includes('function SafeProgressiveCorrectionStream') &&
    page.includes('function hasUnsafeStreamingLatex') &&
    page.includes('safePreviewAvailable') &&
    page.includes('Comparando con la rúbrica oficial') &&
    page.includes('Revisando el LaTeX de la corrección') &&
    page.includes('Últimos detalles') &&
    page.includes('{!correccion && (streamText || cargando) ? (') &&
    page.includes('<SafeProgressiveCorrectionStream text={streamText} isContinuing={continuingCorrection} stage={correctionStage} />') &&
    !page.includes('<SafeStreamingText text={streamText} />') &&
    page.includes('correction={correccion}')
)

assert(
  'loading side panel shows non-final progress placeholders',
  page.includes('Calculando con la rúbrica oficial') &&
    page.includes('Analizando lo que sí suma puntos') &&
    page.includes('Revisando errores y pasos omitidos')
)

assert(
  'chat streaming uses safe text for active assistant message',
  page.includes('const isStreamingMessage = cargandoChat && i === mensajes.length - 1') &&
    page.includes('if (isStreamingMessage) return <SafeStreamingText text={msg.texto} />')
)

assert(
  'truncation sentinel is propagated by stream and parsed by client',
  chatRoute.includes('STREAM_TRUNCATION_SENTINEL') &&
    chatRoute.includes("finalMsg.stop_reason === 'max_tokens'") &&
    page.includes('readSafeStreamText')
)

assert(
  'non-stream chat exposes truncation metadata',
  chatRoute.includes('truncated: message.stop_reason ===') &&
    chatRoute.includes('finishReason:')
)

assert(
  'truncated corrections are not saved as final history',
  page.includes('if (!isTruncated)') &&
    page.includes("supabase.from('historial_examenes').insert") &&
    page.includes('No la hemos guardado en Historial') &&
    page.includes('Reintentar corrección')
)

assert(
  'correction flow uses chunked correction before final truncation state',
  page.includes('buildChunkedCorrectionPrompts') &&
    page.includes('runChunkedCorrection') &&
    page.includes("id: 'nota-resumen'") &&
    page.includes("id: 'aciertos-errores'") &&
    page.includes("id: 'paso-a-paso'") &&
    page.includes("id: 'teoria-final'") &&
    page.includes('buildCompactRetryPrompt') &&
    page.includes("correctionMode: 'chunked_correction'") &&
    chatRoute.includes('correctionMode')
)

assert(
  'complete chunked correction is saved and incomplete one is not',
  page.includes('const chunkedCorrection = await runChunkedCorrection') &&
    page.includes('const isTruncated = chunkedCorrection.truncated') &&
    page.includes('if (!isTruncated)') &&
    page.includes('Guardando en Historial')
)

assert(
  'why-it-works is grounded in curriculum context after complete corrections',
  page.includes('getTheoryContextForExercise') &&
    page.includes('theoryContextToPrompt') &&
    page.includes('CORRECCIÓN YA GENERADA') &&
    page.includes('No des teoría genérica') &&
    page.includes('why_it_works: whyItWorks || null') &&
    page.includes('if (!isTruncated)') &&
    whyTheory.includes('export function getTheoryContextForExercise') &&
    whyTheory.includes('CAMINO_CURRICULUM_TOPICS') &&
    whyTheory.includes('detectedConcepts') &&
    whyTheory.includes('SAFE_FALLBACK_MESSAGE')
)

assert(
  'why-it-works persists history metadata without breaking legacy history inserts',
  whyHistoryMigration.includes('add column if not exists why_it_works text') &&
    whyHistoryMigration.includes('why_it_works_context jsonb') &&
    whyHistoryMigration.includes('detected_concepts jsonb') &&
    whyHistoryMigration.includes('curriculum_source_ids jsonb') &&
    page.includes('legacyPayload') &&
    page.includes("supabase.from('historial_examenes').insert(legacyPayload)")
)

assert(
  'why-it-works stays at the end and renders LaTeX through existing MathMarkdown',
  page.includes('## ¿Por qué es así?') &&
    page.includes('**Dónde se ve en la solución**') &&
    whyExplanationComponent.includes('MathMarkdown text={content} format={false}') &&
    whyExplanationComponent.includes('¿Por qué es así?')
)

assert(
  'correction LaTeX normalizer covers orphan tfrac fragments',
  mathFormatting.includes('wrapOrphanLatexFragments') &&
    mathFormatting.includes('tfrac') &&
    mathFormatting.includes(String.raw`[A-Z]\^\{-?1\}\s*[A-Za-z]`) &&
    mathFormatting.includes(String.raw`[A-Z]\^\{-?1\}`)
)

assert(
  'correction render normalizer hardens broken LaTeX and markdown tables',
  mathFormatting.includes('normalizeCorrectionMarkdownForRender') &&
    mathFormatting.includes('normalizeMixedDollarBlocks') &&
    mathFormatting.includes('wrapDanglingLatexEnvironmentFragments') &&
    mathFormatting.includes('normalizeRiskyMarkdownTables') &&
    mathFormatting.includes('pmatrix|bmatrix|vmatrix|matrix|cases|aligned') &&
    mathFormatting.includes('Puntuación estimada')
)

assert(
  'KaTeX fallback is neutral and image mismatch remains allowed',
  mathMarkdown.includes("errorColor: '#64748b'") &&
    page.includes('No repitas el enunciado') &&
    !page.includes('No digas que la imagen no corresponde') &&
    page.includes('Respuesta manuscrita adjunta como imagen')
)

assert(
  'signup has durable IP and email rate limits',
  signupRoute.includes('SIGNUP_IP_RATE_LIMIT') &&
    signupRoute.includes('SIGNUP_EMAIL_RATE_LIMIT') &&
    signupRoute.includes(".eq('email', normalizedEmail)") &&
    signupMigration.includes('email TEXT')
)

assert(
  'pricing and landing do not advertise unlimited AI usage',
  !/ilimitad/i.test(pricing) &&
    !/ilimitad/i.test(landing)
)

assert(
  'math curriculum seed wires CCSS without geometry',
  mathCcssSeed.includes("'matematicas_ccss'") &&
    mathCcssSeed.includes("block_key <> 'Geometría'") &&
    packageJson.includes('seed:math-curriculum')
)

assert(
  'Camino PAU generates editable curriculum missions with targets and XP',
  caminoCalendar.includes('concept_explanation') &&
    caminoCalendar.includes('guided_practice') &&
    caminoCalendar.includes('evau_practice') &&
    caminoCalendar.includes('exam_focus') &&
    caminoCalendar.includes('topicRotationBySubject') &&
    caminoCalendar.includes('nextCurriculumItem') &&
    caminoCalendar.includes('buildTopicHref') &&
    caminoCalendar.includes('CalendarEditorOverlay') &&
    caminoCalendar.includes('Editar calendario') &&
    caminoCalendar.includes('actionHref(newMission.kind') &&
    caminoCalendar.includes('hrefForMission') &&
    caminoCalendar.includes('missionId=${encodeURIComponent(mission.id)}') &&
    caminoCalendar.includes('source=camino_pau') &&
    !caminoCalendar.includes('Marcar sin XP') &&
    !caminoCalendar.includes('error_review') &&
    !caminoCalendar.includes('view=historial') &&
    !caminoCalendar.includes('value="chat"')
)

assert(
  'Camino PAU awards XP only after corrected exercises and adapts to weak areas',
  caminoTopic.includes('function xpFromScore') &&
    caminoTopic.includes('const baseXP = 10') &&
    caminoTopic.includes('score < 4 ? 5 : score < 6 ? 12 : score < 8 ? 22 : score < 9 ? 32 : 45') &&
    caminoTopic.includes('correctCourseExercise') &&
    caminoTopic.includes("supabase.from('historial_examenes').insert") &&
    caminoTopic.includes('WEAK_AREAS_KEY') &&
    caminoTopic.includes('missionId') &&
    caminoTopic.includes("status: 'done' as const") &&
    caminoTopic.includes('setProgress(previous =>') &&
    caminoTopic.includes('xpChanged') &&
    !caminoTopic.includes("award('explanation')") &&
    !caminoTopic.includes("award('guided')") &&
    !caminoTopic.includes("award('evau')") &&
    !caminoTopic.includes('He trabajado esto') &&
    !caminoTopic.includes('Marcar como trabajado') &&
    !caminoCalendar.includes('Misión marcada como hecha sin XP') &&
    !caminoCalendar.includes('Marcar sin XP') &&
    !caminoCalendar.includes('function completeMission') &&
    !caminoCalendar.includes('onComplete={completeMission')
)

assert(
  'Camino PAU keeps calendar visibility and generated week persistent',
  caminoCalendar.includes("CALENDAR_VISIBILITY_KEY = 'pausia_camino_calendar_expanded_v1'") &&
    caminoCalendar.includes('loadJson<DayPlan[]>(CALENDAR_KEY, [])') &&
    caminoCalendar.includes('loadJson<boolean>(CALENDAR_VISIBILITY_KEY, false)') &&
    caminoCalendar.includes('loadedCalendar.length ? loadedCalendar : generateCalendar') &&
    caminoCalendar.includes('if (!loadedCalendar.length) setCalendar') &&
    caminoCalendar.includes('function toggleCalendarExpanded()') &&
    caminoCalendar.includes('saveJson(CALENDAR_VISIBILITY_KEY, next)') &&
    caminoCalendar.includes('onClick={toggleCalendarExpanded}')
)

assert(
  'Camino PAU applies plan limits with a minimum 20 percent variable margin',
  caminoPlanLimits.includes('CAMINO_VARIABLE_MARGIN_FLOOR = 0.2') &&
    caminoPlanLimits.includes("free: {") &&
    caminoPlanLimits.includes("premium: {") &&
    caminoPlanLimits.includes("curso_pau: {") &&
    caminoPlanLimits.includes("intensivo: {") &&
    caminoPlanLimits.includes("superpremium: {") &&
    caminoPlanLimits.includes('maxStudyDaysPerWeek: 2') &&
    caminoPlanLimits.includes('maxStudyDaysPerWeek: 6') &&
    caminoPlanLimits.includes('correctionsPerMonth: 25') &&
    caminoPlanLimits.includes('correctionsPerMonth: 600') &&
    caminoPlanLimits.includes('photosPerMonth: 3') &&
    caminoPlanLimits.includes('photosPerMonth: 200') &&
    caminoPlanLimits.includes("caminoMode: 'limited'") &&
    caminoPlanLimits.includes("caminoMode: 'complete'") &&
    caminoPlanLimits.includes("caminoMode: 'intensive'") &&
    caminoPlanLimits.includes('normalizeCaminoPlanId') &&
    caminoPlanLimits.includes('monthlyToWeeklyLimit')
)

assert(
  'Camino PAU reads billing plan and caps generated missions by subscription',
  caminoCalendar.includes("fetch('/api/billing/me'") &&
    caminoCalendar.includes('normalizeCaminoPlanId') &&
    caminoCalendar.includes('setCaminoPlanId(planId)') &&
    caminoCalendar.includes('getCaminoPlanLimits(planId)') &&
    caminoCalendar.includes('Math.min(onboarding.weeklyStudyDaysValue ?? 4, planLimits.maxStudyDaysPerWeek)') &&
    caminoCalendar.includes('monthlyToWeeklyLimit(planLimits.correctionsPerMonth)') &&
    caminoCalendar.includes('monthlyToWeeklyLimit(planLimits.photosPerMonth)') &&
    caminoCalendar.includes("planLimits.caminoMode !== 'limited'") &&
    caminoCalendar.includes('planLimits.includeBonusMissions') &&
    caminoCalendar.includes('missions.length < maxCorrectableMissions') &&
    caminoCalendar.includes('Camino {caminoPlanLimits.caminoMode') &&
    caminoCalendar.includes('variableMarginFloor')
)

assert(
  'Camino PAU course topics use stable real pages and manual course navigation',
  caminoPlan.includes('return `/camino-pau/curso/${topic.subject}/${topic.blockSlug}/${topic.topicSlug}`') &&
    caminoCourseTopic.includes('getTopic(subject, block, topic)') &&
    caminoCourseTopic.includes('CaminoTopicClient') &&
    caminoCalendar.includes('CourseDirectory') &&
    caminoCalendar.includes('Temario guiado') &&
    caminoCalendar.includes('Cursos de tu Camino') &&
    caminoCalendar.includes('Ver cursos') &&
    caminoCalendar.includes('setSelectedSubject') &&
    caminoCalendar.includes('selectedBlock') &&
    caminoCalendar.includes('activeBlock') &&
    caminoCalendar.includes('courseHrefForItem') &&
    caminoCalendar.includes('/camino-pau/curso/${s}/${textSlug(block)}/${textSlug(topic)}') &&
    !caminoCalendar.includes('href: `/camino?subject=${s}${blockParam}${topicParam}`')
)

assert(
  'Camino calendar editor shows full week and supports drag and drop without changing mission ids',
  caminoCalendar.includes('grid flex-1 gap-4 overflow-y-auto p-5') &&
    caminoCalendar.includes('lg:grid-cols-2') &&
    caminoCalendar.includes('draggable') &&
    caminoCalendar.includes('onDragStart') &&
    caminoCalendar.includes('onDrop') &&
    caminoCalendar.includes('moveMission(draggedMissionId, day.date)') &&
    caminoCalendar.includes('missions: [...day.missions, mission]') &&
    !caminoCalendar.includes('moved-${day.missions.length + 1}')
)

assert(
  'Camino PAU is the default app landing after login',
  loginPage.includes("window.location.href = '/camino'") &&
    page.includes("window.location.replace('/camino')") &&
    page.includes("params.get('from') === 'camino_course'")
)

assert(
  'Camino curriculum seed has topic lessons and keeps CCSS free of 3D geometry',
  caminoPlan.includes('CAMINO_CURRICULUM_TOPICS') &&
    caminoPlan.includes('buildEvauHref') &&
    caminoSeed.includes('"subject": "matematicas_ccss"') &&
    caminoSeed.includes('"subject": "matematicas_ii"') &&
    caminoSeed.includes('"blockSlug": "geometria-3d"') &&
    !/"subject": "matematicas_ccss"[\s\S]{0,240}"blockSlug": "geometria-3d"/.test(caminoSeed)
)

assert(
  'Camino EVAU missions resolve to random real Madrid exercises by topic',
  randomEvauExercise.includes("from '../../data/examenes'") &&
    randomEvauExercise.includes("from '../../data/matematicas_ccss_madrid'") &&
    randomEvauExercise.includes('getRandomEvauExerciseForMission') &&
    randomEvauExercise.includes('Math.random') &&
    randomEvauExercise.includes("matchLevel: 'subject_fallback'") &&
    randomEvauExercise.includes('exerciseId') &&
    randomEvauExercise.includes("subject === 'matematicas_ccss'") &&
    randomEvauExercise.includes("return 'matematicas_ccss'") &&
    page.includes("params.get('mode')") &&
    page.includes("source.startsWith('camino')") &&
    page.includes("mode === 'selected' && selectedExerciseId") &&
    page.includes('getRandomEvauExerciseForMission') &&
    page.includes('selectMadridMathExerciseById') &&
    page.includes('rememberRecentEvauExerciseIds') &&
    page.includes("window.history.replaceState(null, '', resolved.targetUrl)") &&
    caminoPlan.includes('mode=random&source=camino')
)

assert(
  'Camino topic page shows explanation, guided practice, EVAU/correction links, central chat and not-seen feedback',
  caminoTopic.includes('No lo he dado en clase') &&
    caminoTopic.includes('Preguntar a Pausia sobre este tema') &&
    caminoTopic.includes('Hacer ejercicio PAU de este tema') &&
    caminoTopic.includes('Corregir con Pausia') &&
    caminoTopic.includes('Escribir respuesta') &&
    caminoTopic.includes('Subir foto') &&
    caminoTopic.includes('compressImageToBase64') &&
    caminoTopic.includes('buildCorrectionPrompt') &&
    caminoTopic.includes('CorrectionResultCard') &&
    caminoTopic.includes('from: \'camino_course\'') &&
    caminoTopic.includes('Abrir Chat con Pausia') &&
    caminoTopic.includes('Ahora inténtalo tú') &&
    caminoTopic.includes('Subpágina de aprendizaje') &&
    caminoTopic.includes('SCHOOL_FEEDBACK_KEY') &&
    caminoTopic.includes('El XP se asigna solo después de corregir el ejercicio final.') &&
    caminoTopic.includes('MathMarkdown text=') &&
    !caminoTopic.includes('askLocalTutor') &&
    !caminoTopic.includes('Fragmento LaTeX fuente')
)

assert(
  'Camino curriculum migrations and seed command exist',
  caminoCurriculumMigration.includes('create table if not exists public.curriculum_topics') &&
    caminoCurriculumMigration.includes('school_topic_feedback') &&
    caminoCurriculumMigration.includes('school_topic_status') &&
    packageJson.includes('seed:camino-curriculum')
)

assert(
  'Planning is removed from sidebar and old routes redirect to Camino PAU',
  !sidebar.includes("label: 'Mi Plan'") &&
    !sidebar.includes("id: 'plan-estudio'") &&
    nextConfig.includes("source: '/planning', destination: '/camino'") &&
    nextConfig.includes("source: '/mi-plan', destination: '/camino'")
)

if (process.exitCode) {
  process.exit(process.exitCode)
}
