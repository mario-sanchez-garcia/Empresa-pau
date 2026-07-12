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
const mathAnswerToolbar = read('components/shared/MathAnswerToolbar.tsx')
const richTextArea = read('components/shared/RichTextArea.tsx')
const signupRoute = read('app/api/auth/signup/route.ts')
const signupMigration = read('supabase/migrations/20260621130000_create_signup_attempts.sql')
const pricing = read('app/pricing/page.tsx')
const landing = read('app/landing/page.tsx')
const loginPage = read('app/login/page.tsx')
const sidebar = read('app/components/Sidebar.tsx')
const caminoCalendar = read('app/components/camino/CaminoCalendarClient.tsx')
const onboardingFlow = read('app/components/onboarding/OnboardingFlow.tsx')
const onboardingGenerateRoute = read('app/api/onboarding/generate/route.ts')
const ensureCaminoCalendar = read('app/lib/ensureCaminoCalendar.ts')
const caminoPlan = read('app/lib/camino/caminoCurriculumPlan.ts')
const betaCurriculum = read('app/lib/camino/betaCurriculum.ts')
const caminoActions = read('app/lib/camino/caminoActions.ts')
const caminoMissionGenerator = read('app/lib/camino/caminoMissionGenerator.ts')
const caminoPlanLimits = read('app/lib/camino/caminoPlanLimits.ts')
const onboardingStorage = read('app/lib/onboarding/onboardingStorage.ts')
const caminoSeed = read('app/data/camino/curriculum_seed.json')
const caminoTopic = read('app/camino/tema/[subject]/[block]/[topic]/CaminoTopicClient.tsx')
const simulacroActivePage = read('app/simulacros/[id]/page.tsx')
const catEjercicioCard = read('app/components/CatEjercicioCard.tsx')
const catFisicaEjercicioCard = read('app/components/CatFisicaEjercicioCard.tsx')
const caminoSchoolFeedbackRoute = read('app/api/camino/school-topic-feedback/route.ts')
const caminoCourseTopic = read('app/camino-pau/curso/[subject]/[block]/[topic]/page.tsx')
const randomEvauExercise = read('app/lib/camino/randomEvauExercise.ts')
const mathCcssSeed = read('supabase/migrations/20260622120000_seed_curriculum_flashcards_mates_ccss.sql')
const caminoCurriculumMigration = read('supabase/migrations/20260623110000_create_camino_curriculum_tables.sql')
const whyTheory = read('app/lib/whyItWorksTheory.ts')
const whyHistoryMigration = read('supabase/migrations/20260623113000_add_why_it_works_to_historial_examenes.sql')
const whyExplanationComponent = read('components/shared/WhyExplanation.tsx')
const packageJson = read('package.json')
const nextConfig = read('next.config.ts')
const qaCorrectionsScript = read('scripts/qa-corrections-p0.mjs')
const qaCorrectionsChecklist = read('docs/qa/p0-corrections-checklist.md')
const stripeQaChecklist = read('docs/qa/stripe-test-mode-checklist.md')
const stripeSmoke = read('scripts/smoke-stripe-p0.mjs')

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
  'chat composer auto-resizes multiline textarea without hiding first lines',
  page.includes('const chatInputRef = useRef<HTMLTextAreaElement>(null)') &&
    page.includes('const maxHeight = 180') &&
    page.includes("textarea.style.height = 'auto'") &&
    page.includes('Math.min(textarea.scrollHeight, maxHeight)') &&
    page.includes("textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden'") &&
    page.includes('ref={chatInputRef}') &&
    page.includes('minHeight: 56') &&
    page.includes('maxHeight: 180') &&
    page.includes("lineHeight: '24px'") &&
    page.includes("if (e.key === 'Enter' && !e.shiftKey)")
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
  'pricing and landing use definitive honest plan copy',
    !/ilimitad/i.test(pricing) &&
    !/ilimitad/i.test(landing) &&
    !pricing.includes("price: '7,99 €'") &&
    !pricing.includes("price: '49 €'") &&
    !landing.includes('7,99€') &&
    pricing.includes('0 €') &&
    pricing.includes('9,99 €') &&
    pricing.includes('19,99 €') &&
    pricing.includes('17,99 €') &&
    pricing.includes('Desde 59 €') &&
    pricing.includes('79 €') &&
    pricing.includes('Recomendado') &&
    pricing.includes('Uso intensivo con política de uso razonable') &&
    landing.includes('9,99 €/mes') &&
    landing.includes('19,99 € / 3 meses') &&
    landing.includes('17,99 €/mes') &&
    landing.includes('Desde 59 €') &&
    landing.includes('Normal: 79 €') &&
    landing.includes('Beta privada: de momento probamos Matemáticas II y Matemáticas CCSS')
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
    caminoCalendar.includes('target: string') &&
    caminoCalendar.includes("source: 'camino_pau'") &&
    caminoCalendar.includes("xpPolicy: 'after_correction'") &&
    caminoCalendar.includes('missionMeta') &&
    caminoCalendar.includes('topicRotationBySubject') &&
    caminoCalendar.includes('nextCurriculumItem') &&
    caminoCalendar.includes('buildTopicHref') &&
    caminoCalendar.includes('CalendarEditorOverlay') &&
    caminoCalendar.includes('Editar calendario') &&
    caminoCalendar.includes('missionMeta(kind, subject, topic') &&
    caminoCalendar.includes('hrefForMission') &&
    caminoCalendar.includes('missionId=${encodeURIComponent(mission.id)}') &&
    caminoCalendar.includes('source=camino_pau') &&
    caminoCalendar.includes('const subjects = normalizeOnboardingSubjects(onboarding.subjects)') &&
    caminoCalendar.includes('Completa tu perfil para que Pausia cree tu Camino PAU') &&
    !caminoCalendar.includes("['Matemáticas II', 'Historia de España', 'Inglés']") &&
    !caminoCalendar.includes('MATH_SUBJECTS') &&
    !caminoCalendar.includes('Marcar sin XP') &&
    !caminoCalendar.includes('error_review') &&
    !caminoCalendar.includes('view=historial') &&
    !caminoCalendar.includes('value="chat"')
)

assert(
  'math answer toolbar appears only for math and science answer boxes',
  mathAnswerToolbar.includes('data-pausia-math-toolbar="true"') &&
    mathAnswerToolbar.includes('export function shouldShowMathToolbar') &&
    mathAnswerToolbar.includes('"matematicas_ii"') &&
    mathAnswerToolbar.includes('"matematicas_ccss"') &&
    mathAnswerToolbar.includes('"fisica"') &&
    mathAnswerToolbar.includes('"quimica"') &&
    !mathAnswerToolbar.includes('"lengua"') &&
    !mathAnswerToolbar.includes('"historia"') &&
    !mathAnswerToolbar.includes('"historia_filosofia"') &&
    !mathAnswerToolbar.includes('"ingles"') &&
    richTextArea.includes('import MathAnswerToolbar') &&
    page.includes('mathSubject={asignatura}') &&
    caminoTopic.includes('mathSubject={currentTopic.subject}') &&
    catEjercicioCard.includes('mathSubject={asignatura}') &&
    catFisicaEjercicioCard.includes('mathSubject="fisica"') &&
    simulacroActivePage.includes('MathAnswerToolbar') &&
    simulacroActivePage.includes('subject={record.asignatura}')
)

assert(
  'math answer toolbar inserts LaTeX snippets without replacing existing answer text',
  mathAnswerToolbar.includes("value.slice(0, start) + snippet.latex + value.slice(end)") &&
    mathAnswerToolbar.includes('requestAnimationFrame') &&
    mathAnswerToolbar.includes('setSelectionRange(cursor, cursor)') &&
    mathAnswerToolbar.includes('document.createTextNode(snippet.latex)') &&
    mathAnswerToolbar.includes('onChange(editor.innerText)') &&
    mathAnswerToolbar.includes('\\\\frac{a}{b}') &&
    mathAnswerToolbar.includes('\\\\lim_{x \\\\to a} f(x)') &&
    mathAnswerToolbar.includes('\\\\int f(x)\\\\,dx') &&
    mathAnswerToolbar.includes('\\\\int_{a}^{b} f(x)\\\\,dx') &&
    mathAnswerToolbar.includes('\\\\frac{d}{dx}\\\\left(f(x)\\\\right)') &&
    !mathAnswerToolbar.includes('\\\\lim_{x \\\\to }') &&
    mathAnswerToolbar.includes('\\\\begin{pmatrix}') &&
    mathAnswerToolbar.includes('\\\\begin{cases}') &&
    mathAnswerToolbar.includes('F = G\\\\frac{m_1m_2}{r^2}') &&
    mathAnswerToolbar.includes('K_c') &&
    mathAnswerToolbar.includes('\\\\rightleftharpoons')
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
    caminoCalendar.includes('baseXP') &&
    caminoCalendar.includes("source: 'camino_pau'")
)

assert(
  'Camino PAU keeps calendar visibility and generated week persistent',
  caminoCalendar.includes("CALENDAR_VISIBILITY_KEY = 'pausia_camino_calendar_expanded_v1'") &&
    caminoCalendar.includes('loadJson<boolean>(CALENDAR_VISIBILITY_KEY, false)') &&
    caminoCalendar.includes('calendarMatchesOnboarding') &&
    caminoCalendar.includes('calendarStartsWeek') &&
    caminoCalendar.includes('generateWeek(weekStartISO: string') &&
    caminoCalendar.includes('persist(regenerated, nextExams)') &&
    caminoCalendar.includes('function toggleCalendarExpanded()') &&
    caminoCalendar.includes('saveJson(CALENDAR_VISIBILITY_KEY, next)') &&
    caminoCalendar.includes('onClick={toggleCalendarExpanded}')
)

assert(
  'Camino PAU uses current week and never hardcodes the June demo week',
  caminoCalendar.includes('function currentWeekStartISO()') &&
    caminoCalendar.includes('getUTCDay() || 7') &&
    caminoCalendar.includes('setUTCHours(12, 0, 0, 0)') &&
    caminoCalendar.includes('mondayOf(dateFromISO(todayMadrid()))') &&
    caminoCalendar.includes('calendarStartsWeek(calendar, weekStartISO)') &&
    caminoCalendar.includes('function buildWeekDays(weekStartISO: string, sourceDays: DayPlan[] = [])') &&
    caminoCalendar.includes('return Array.from({ length: 7 }, (_, index): DayPlan =>') &&
    caminoCalendar.includes('const dateISO = toISO(addDays(start, index))') &&
    !caminoCalendar.includes('2026-06-19') &&
    !caminoCalendar.includes('2026-06-15') &&
    !caminoCalendar.includes('2026-06-21')
)

assert(
  'Camino PAU is onboarding driven and does not invent default subjects',
  onboardingStorage.includes('export const DEFAULT_SUBJECTS: string[] = []') &&
    caminoCalendar.includes('const subjects = normalizeOnboardingSubjects(onboarding.subjects)') &&
    caminoCalendar.includes('missionBelongsToSubjects') &&
    caminoCalendar.includes('normalizeSubjectSlug(mission.subject)') &&
    caminoCalendar.includes('visibleCalendarForOnboarding') &&
    caminoCalendar.includes('Completa tu perfil para que Pausia cree tu Camino PAU') &&
    caminoCalendar.includes('const PRIVATE_BETA_SUBJECT_SLUGS = new Set<string>(PRIVATE_BETA_SUBJECTS)') &&
    !caminoCalendar.includes("['Matemáticas II', 'Historia de España', 'Inglés']")
)

assert(
  'Private beta onboarding activates four core PAU subjects and locks the rest',
  onboardingFlow.includes("const PRIVATE_BETA_ENABLED_SUBJECTS = SUBJECT_OPTS.filter(subject => subject.betaStatus === 'enabled')") &&
    onboardingFlow.includes("const PRIVATE_BETA_LOCKED_SUBJECTS = SUBJECT_OPTS.filter(subject => subject.betaStatus === 'locked')") &&
    onboardingFlow.includes("const PRIVATE_BETA_SUPPORTED_SUBJECTS = new Set(PRIVATE_BETA_ENABLED_SUBJECTS.map(subject => subject.id))") &&
    onboardingFlow.includes("betaStatus: 'locked'") &&
    onboardingFlow.includes("badge: 'Próximamente'") &&
    onboardingFlow.includes('PRIVATE_BETA_LOCKED_SUBJECTS.map') &&
    onboardingFlow.includes('disabled title="Esta asignatura estará disponible próximamente') &&
    onboardingFlow.includes('De momento puedes probar Pausia con Matemáticas II, Matemáticas CCSS, Lengua e Historia') &&
    onboardingFlow.includes('Selecciona al menos una asignatura disponible') &&
    onboardingFlow.includes("'Matemáticas CCSS': 'matematicas_ccss'") &&
    onboardingFlow.includes("'Lengua Castellana': 'lengua'") &&
    onboardingFlow.includes("'Historia de España': 'historia_espana'") &&
    onboardingFlow.includes('selectedEnabledSubjects') &&
    onboardingFlow.includes('subjects: selectedEnabledSubjects') &&
    onboardingGenerateRoute.includes("const ALLOWED_SUBJECTS = new Set(['matematicas_ii', 'matematicas_ccss', 'lengua', 'historia_espana'])") &&
    ensureCaminoCalendar.includes('filter(isPrivateBetaSubject)') &&
    caminoCalendar.includes("const subjects = subjectSlugs.length > 0 ? subjectSlugs : ['matematicas_ii']") &&
    onboardingFlow.includes('Historia de España') &&
    onboardingFlow.includes('Física') &&
    onboardingFlow.includes('Lengua Castellana y Literatura') &&
    !onboardingGenerateRoute.includes("const ALLOWED_SUBJECTS = new Set(['matematicas_ii', 'historia_espana'])") &&
    !ensureCaminoCalendar.includes("filter(s => s === 'matematicas_ii' || s === 'historia_espana')")
)

assert(
  'Camino PAU today card uses the real current date and filters stale saved missions',
  caminoPlan.includes('export function normalizeSubjectSlug') &&
    caminoCalendar.includes('function calendarDayLabel(dateISO: string)') &&
    caminoCalendar.includes('function isRealToday(dateISO: string)') &&
    caminoCalendar.includes('isToday: isRealToday(dateISO)') &&
    caminoCalendar.includes('const [selectedWeekStart, setSelectedWeekStart]') &&
    caminoCalendar.includes('const realToday = todayMadrid()') &&
    caminoCalendar.includes('visibleCalendar.find(day => day.date === realToday)') &&
    caminoCalendar.includes('const weekCalendar = buildWeekDays(selectedWeekStart') &&
    caminoCalendar.includes('bg-blue-50/60') &&
    caminoCalendar.includes('aria-label="Hoy"') &&
    caminoCalendar.includes('isToday: true, missions: []') &&
    caminoCalendar.includes('No hay misión asignada hoy') &&
    !caminoCalendar.includes('calendar.find(day => day.isToday) ?? calendar[0]') &&
    !caminoCalendar.includes('Hoy toca poco, pero bien hecho')
)

assert(
  'Camino PAU can navigate weeks without changing real today',
  caminoCalendar.includes('function weekRangeLabel') &&
    caminoCalendar.includes('function weekOffset') &&
    caminoCalendar.includes('weekOffset(selectedWeekStart, -1)') &&
    caminoCalendar.includes('weekOffset(selectedWeekStart, 1)') &&
    caminoCalendar.includes('function goToWeek(weekStartISO: string)') &&
    caminoCalendar.includes('function goToCurrentWeek()') &&
    caminoCalendar.includes('goToWeek(currentWeekStartISO())') &&
    caminoCalendar.includes('Anterior') &&
    caminoCalendar.includes('Siguiente') &&
    caminoCalendar.includes('Esta semana') &&
    caminoCalendar.includes('setSelectedWeekStart(weekStartISO)') &&
    caminoCalendar.includes('generateCalendar(onboarding, nextExams, source, planId, weekStartISO, {})')
)

assert(
  'Camino PAU plans around exams with course, EVAU and simulation limits',
  caminoCalendar.includes('function missionPhaseForExam') &&
    caminoCalendar.includes("return 'close'") &&
    caminoCalendar.includes("return 'medium'") &&
    caminoCalendar.includes('topicIsCompleted') &&
    caminoCalendar.includes('blockIsCompleted') &&
    caminoCalendar.includes('getSimulationLimitForPlan') &&
    caminoCalendar.includes('getMonthlySimulationUsage') &&
    caminoCalendar.includes('canScheduleSimulation') &&
    caminoCalendar.includes("kind === 'mock_exam'") &&
    caminoCalendar.includes('Has alcanzado el límite de simulacros de tu plan este mes. Te proponemos ejercicios PAU del mismo tema.') &&
    caminoCalendar.includes('Simulacro corto:') &&
    caminoCalendar.includes('Bloque completado: pasamos a ejercicio PAU mixto') &&
    caminoCalendar.includes('Tema completado: evitamos repetir teoría básica') &&
    caminoCalendar.includes('Refuerza ${curriculumItem?.topic')
)

assert(
  'Camino PAU visible missions follow course then same-topic EVAU and avoid flashcards/history tasks',
  caminoCalendar.includes('buildMission({') &&
    caminoCalendar.includes("kind: 'evau_practice'") &&
    caminoCalendar.includes('item: secondItem') &&
    caminoCalendar.includes('Después del curso, practica con un ejercicio PAU/EVAU del mismo tema.') &&
    caminoCalendar.includes("!\/flashcard|tarjeta|mazo|historial|corrige un error|revisa tus errores\/i.test") &&
    caminoMissionGenerator.includes("type === 'flashcard' ? 'ejercicio_corto' : type") &&
    caminoMissionGenerator.includes('title: `Refuerza ${weakBlocks[0]}`') &&
    caminoActions.includes("label: 'Practicar refuerzo'") &&
    !caminoActions.includes("href: '/?view=historial'")
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
    caminoCalendar.includes('getSimulationLimitForPlan(planId)') &&
    caminoCalendar.includes('canScheduleSimulation')
)

assert(
  'Camino PAU course topics use stable real pages and manual course navigation',
  caminoPlan.includes('return `/camino-pau/curso/${topic.subject}/${topic.blockSlug}/${topic.topicSlug}`') &&
    caminoCourseTopic.includes('getTopic(subject, block, topic)') &&
    caminoCourseTopic.includes('CaminoTopicClient') &&
    caminoCalendar.includes('CourseDirectory') &&
    caminoCalendar.includes('Temario guiado') &&
    caminoCalendar.includes('setSelectedSubject') &&
    caminoCalendar.includes('selectedBlock') &&
    caminoCalendar.includes('activeBlock') &&
    caminoCalendar.includes('courseHrefForItem') &&
    caminoCalendar.includes('/camino-pau/curso/${s}/${textSlug(block)}/${textSlug(topic)}') &&
    caminoCalendar.includes('href={courseHrefForItem(item)}') &&
    !caminoCalendar.includes('href: `/camino?subject=${s}${blockParam}${topicParam}`')
)

assert(
  'Camino calendar editor shows full week and supports drag and drop without changing mission ids',
  caminoCalendar.includes('CalendarEditorOverlay') &&
    caminoCalendar.includes('weekStartISO={selectedWeekStart}') &&
    caminoCalendar.includes('onNavigateWeek={generateWeek}') &&
    caminoCalendar.includes('const [editorWeekStart, setEditorWeekStart]') &&
    caminoCalendar.includes('function navigateEditorWeek(nextWeekStart: string)') &&
    caminoCalendar.includes('navigateEditorWeek(weekOffset(editorWeekStart, -1))') &&
    caminoCalendar.includes('navigateEditorWeek(currentWeekStartISO())') &&
    caminoCalendar.includes('navigateEditorWeek(weekOffset(editorWeekStart, 1))') &&
    caminoCalendar.includes('Semana anterior') &&
    caminoCalendar.includes('Hoy') &&
    caminoCalendar.includes('Semana siguiente') &&
    caminoCalendar.includes('grid min-w-[980px] grid-cols-7') &&
    caminoCalendar.includes("mission.role === 'main'") &&
    caminoCalendar.includes('Misiones extra / bonus') &&
    caminoCalendar.includes('bonusMissions') &&
    caminoCalendar.includes('const [missionPanelOpen, setMissionPanelOpen]') &&
    caminoCalendar.includes('setMissionPanelOpen(current => !current)') &&
    caminoCalendar.includes('onDrop={event => { event.preventDefault(); if (draggedMissionId) moveMission(draggedMissionId, day.date); setDraggedMissionId(null) }}') &&
    caminoCalendar.includes('draggable') &&
    caminoCalendar.includes('onDragStart={() => setDraggedMissionId(mission.id)}') &&
    caminoCalendar.includes('onChange={event => moveMission(mission.id, event.target.value)}') &&
    caminoCalendar.includes('updateMission(mission.id') &&
    caminoCalendar.includes('deleteMission(mission.id') &&
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
    betaCurriculum.includes('PRIVATE_BETA_CURRICULUM_TOPICS') &&
    caminoPlan.includes('normalizeTopicSlug') &&
    caminoPlan.includes("'matematicas_ii:algebra-lineal:dimension-de-una-matriz': 'matrices-operaciones'") &&
    betaCurriculum.includes("'lengua'") &&
    betaCurriculum.includes("'historia_espana'") &&
    caminoPlan.includes('buildEvauHref') &&
    caminoSeed.includes('"subject": "matematicas_ccss"') &&
    caminoSeed.includes('"subject": "matematicas_ii"') &&
    caminoSeed.includes('"blockSlug": "geometria-3d"') &&
    !/"subject": "matematicas_ccss"[\s\S]{0,240}"blockSlug": "geometria-3d"/.test(caminoSeed)
)

assert(
  'Camino beta content loading maps legacy mission slugs to local LaTeX lessons',
  caminoCourseTopic.includes('getTopic(subject, block, topic)') &&
    caminoPlan.includes('hasLocalLessonContent(exact)') &&
    caminoPlan.includes('aliasTopicSlug(subjectSlug, normalizedBlockSlug, normalizedTopicSlug)') &&
    caminoTopic.includes('Este tema aún necesita contenido completo') &&
    caminoTopic.includes('Errores típicos y criterio de avance') &&
    !caminoTopic.includes('Todavía no hay apunte LaTeX estructurado para este tema')
)

assert(
  'Camino course lessons use visual structured layout and hide empty video blocks',
  caminoTopic.includes('function StructuredLesson') &&
    caminoTopic.includes('function LessonMarkdown') &&
    caminoTopic.includes('function normalizeLessonMarkdown') &&
    caminoTopic.includes('function LessonMarkdownTable') &&
    caminoTopic.includes('Idea clave') &&
    caminoTopic.includes('Cómo se trabaja') &&
    caminoTopic.includes('function GuidedExamplePanel') &&
    caminoTopic.includes('function PracticePromptPanel') &&
    caminoTopic.includes("lessonTitleFor(currentTopic)") &&
    caminoTopic.includes("{videoId && (") &&
    !caminoTopic.includes('Qué es, para qué sirve, cuándo se usa en PAU') &&
    !caminoTopic.includes('{videoId ? (')
)

assert(
  'Camino lesson markdown normalizes compact tables before rendering',
  caminoTopic.includes("value.replace(/(\\|[^\\n]+?\\|)[ \\t]+(?=\\|)/g, '$1\\n')") &&
    caminoTopic.includes('splitMarkdownTableRow') &&
    caminoTopic.includes('isMarkdownTableSeparator') &&
    caminoTopic.includes('overflow-x-auto rounded-2xl border border-blue-100') &&
    caminoTopic.includes('<LessonMarkdown text={card.concept_markdown} format="raw" />') &&
    caminoTopic.includes('<LessonMarkdown text={section.body} format="raw" />')
)

assert(
  'Camino weekly generation advances by week and keeps canonical topic slugs',
  onboardingGenerateRoute.includes('topic_slug: topicMeta.topicSlug') &&
    ensureCaminoCalendar.includes('calMetadata.topic_slug = topicMeta.topicSlug') &&
    caminoCalendar.includes('row.metadata?.topic_slug') &&
    caminoCalendar.includes('weekDelta * topicStepPerWeek') &&
    caminoCalendar.includes('let subjectRotation = weekDelta * weeklyDays') &&
    caminoCalendar.includes('!recentTopicKeys.has(recentKey)')
)

assert(
  'Camino EVAU missions resolve to random real Madrid exercises by topic',
    randomEvauExercise.includes("from '../../data/examenes'") &&
    randomEvauExercise.includes("from '../../data/matematicas_ccss_madrid'") &&
    randomEvauExercise.includes("from '../../data/lengua'") &&
    randomEvauExercise.includes("from '../../data/ingles'") &&
    randomEvauExercise.includes("from '../../data/historia_filosofia_madrid'") &&
    randomEvauExercise.includes('getRandomEvauExerciseForMission') &&
    randomEvauExercise.includes('Math.random') &&
    randomEvauExercise.includes('pickLeastRecent') &&
    randomEvauExercise.includes('recentExerciseIds.slice(-RECENT_LIMIT)') &&
    randomEvauExercise.includes('avoidRecent?: boolean') &&
    randomEvauExercise.includes("matchLevel: 'subject_fallback'") &&
    randomEvauExercise.includes('exerciseId') &&
    randomEvauExercise.includes("subject === 'matematicas_ccss'") &&
    randomEvauExercise.includes("return 'matematicas_ccss'") &&
    randomEvauExercise.includes("return 'lengua'") &&
    randomEvauExercise.includes("return 'historia'") &&
    randomEvauExercise.includes("return 'historia_filosofia'") &&
    randomEvauExercise.includes("return 'ingles'") &&
    randomEvauExercise.includes("sintaxis: ['sintaxis'") &&
    randomEvauExercise.includes('Todavía no tenemos un ejercicio PAU específico de este tema') &&
    page.includes("params.get('mode')") &&
    page.includes("source.startsWith('camino')") &&
    page.includes("mode === 'selected' && selectedExerciseId") &&
    page.includes('getRandomEvauExerciseForMission') &&
    page.includes('selectMadridExerciseById') &&
    page.includes('rememberRecentEvauExerciseIds') &&
    page.includes("window.history.replaceState(null, '', resolved.targetUrl)") &&
    caminoPlan.includes('mode=random&source=camino')
)

assert(
  'Camino EVAU subject routing never falls back to maths for non-math missions',
  randomEvauExercise.includes("type CaminoExamSubject = 'mates' | 'matematicas_ccss' | 'fisica' | 'quimica' | 'biologia' | 'lengua' | 'historia' | 'historia_filosofia' | 'ingles'") &&
    randomEvauExercise.includes('sourceForSubject(subject)') &&
    randomEvauExercise.includes('flattenCandidates(subject') &&
    randomEvauExercise.includes('SUBJECT_FALLBACK_LABELS[subject]') &&
    page.includes('setAsignatura(subject)') &&
    page.includes('setAsignatura(resolved.subject)') &&
    page.includes('selectMadridExerciseById(resolved.subject, resolved.exerciseId)') &&
    randomEvauExercise.includes("return (examenes as ExamLike[]).filter(exam => exam.asignatura === 'Matemáticas II')") &&
    !randomEvauExercise.includes("return subject === 'matematicas_ccss'") &&
    !randomEvauExercise.includes("return 'matematicas_ccss' : examenes") &&
    !page.includes('selectMadridMathExerciseById')
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
  'P0 correction QA tooling lists manual candidates and exports report',
  packageJson.includes('qa:corrections:p0') &&
    qaCorrectionsScript.includes('docs/qa/p0-corrections-report.md') &&
    qaCorrectionsScript.includes('Candidato QA M2-1') &&
    qaCorrectionsScript.includes('Candidato QA FIS-1') &&
    qaCorrectionsScript.includes('Candidato QA HIS-1') &&
    qaCorrectionsScript.includes('Candidato QA ING-1') &&
    qaCorrectionsChecklist.includes('Correccion completa') &&
    qaCorrectionsChecklist.includes('Historial guardado')
)

assert(
  'P0 not-seen feedback persists locally, syncs to Supabase and refreshes calendar',
  caminoTopic.includes("SCHOOL_ADJUSTMENTS_KEY = 'pausia_camino_school_adjustments_v1'") &&
    caminoTopic.includes("CALENDAR_REFRESH_KEY = 'pausia_camino_calendar_needs_refresh_v1'") &&
    caminoTopic.includes('saveJson(CALENDAR_REFRESH_KEY, true)') &&
    caminoTopic.includes("window.dispatchEvent(new CustomEvent('pausia:school-topic-feedback'") &&
    caminoTopic.includes("fetch('/api/camino/school-topic-feedback'") &&
    caminoTopic.includes('No lo he dado en clase') &&
    caminoSchoolFeedbackRoute.includes("reason: 'not_seen_in_class'") &&
    caminoSchoolFeedbackRoute.includes("status = notSeenCount >= 2 ? 'delayed_for_school' : 'not_seen'") &&
    caminoSchoolFeedbackRoute.includes("upsert({") &&
    caminoSchoolFeedbackRoute.includes("onConflict: 'school_name,subject,block_slug,topic_slug'")
)

assert(
  'P0 Camino calendar lowers priority for not-seen school topics',
  caminoCalendar.includes("SCHOOL_ADJUSTMENTS_KEY = 'pausia_camino_school_adjustments_v1'") &&
    caminoCalendar.includes('loadSchoolAdjustments') &&
    caminoCalendar.includes('findAdjustmentForItem') &&
    caminoCalendar.includes('findReplacementItem') &&
    caminoCalendar.includes('schoolAdjustedItem') &&
    caminoCalendar.includes('Este tema aparece en tu parcial, pero lo has marcado como no dado') &&
    caminoCalendar.includes('Base previa') &&
    caminoCalendar.includes('Tema marcado como no dado en clase')
)

assert(
  'P0 Stripe QA smoke and checklist cover signed webhook and passive success page',
  packageJson.includes('smoke:stripe:p0') &&
    packageJson.includes('node scripts/smoke-stripe-p0.mjs') &&
    stripeSmoke.includes('constructEvent(rawBody, sig, getWebhookSecret())') &&
    stripeSmoke.includes('Success page is passive') &&
    stripeSmoke.includes('stripe_checkout_session_id') &&
    stripeQaChecklist.includes('4242 4242 4242 4242') &&
    stripeQaChecklist.includes('Success page no activa') &&
    stripeQaChecklist.includes('user_entitlements')
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
