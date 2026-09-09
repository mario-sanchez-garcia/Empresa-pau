import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = file => fs.readFileSync(path.join(root, file), 'utf8')
const failures = []
const check = (name, condition) => {
  console.log(`${condition ? 'OK  ' : 'FAIL'} ${name}`)
  if (!condition) failures.push(name)
}

const examRoute = read('app/api/exam/correct/route.ts')
const caminoRoute = read('app/api/camino/correct/route.ts')
const simulacroRoute = read('app/api/simulacro/route.ts')
const chatRoute = read('app/api/chat/route.ts')
const historyRoute = read('app/api/exam/history/route.ts')
const historyClient = read('app/lib/examHistoryClient.ts')
const historyMigration = read('supabase/migrations/20260909144500_server_authoritative_exam_history.sql')
const cacheMigration = read('supabase/migrations/20260909143000_clear_user_specific_why_cache.sql')
const caminoTopic = read('app/camino/tema/[subject]/[block]/[topic]/CaminoTopicClient.tsx')
const fullMock = read('app/simulacros/[id]/page.tsx')
const partialMock = read('app/simulacros/practica/[id]/page.tsx')
const quotaMigration = read('supabase/migrations/20260909150000_atomic_ai_usage_reservations.sql')
const xpGrant = read('app/lib/camino/examXpGrant.ts')

check('Exámenes valida forma antes de éxito/XP', examRoute.includes('validateCorrectionJsonShape(parsed)') && examRoute.includes("status: validation.valid ? 'success' : 'invalid_output'"))
check('Historial exige auth y grant exacto', historyRoute.includes('getAuthContext(request)') && historyRoute.includes('verifyExamXpGrant(xpGrant'))
check('Cliente guarda historial solo por endpoint autoritativo', historyClient.includes("fetch('/api/exam/history'") && !historyClient.includes("from('historial_examenes').insert"))
check('Camino normal usa guardado autoritativo sin XP duplicado', caminoTopic.includes('awardXp: false') && !caminoTopic.includes("from('historial_examenes').insert"))
check('RLS elimina INSERT/UPDATE/ALL directo de notas', historyMigration.includes('drop policy if exists "Users can create own exam history"') && historyMigration.includes('drop policy if exists "Users can update own exam history"') && historyMigration.includes('drop policy if exists "usuarios ven su propio historial"'))
check('Explicación específica no se comparte entre usuarios', !examRoute.includes('topic_why_cache') && cacheMigration.includes('delete from public.topic_why_cache'))
check('Rutas de corrección no registran previews privados', ![examRoute, caminoRoute, simulacroRoute].some(source => source.includes('rawPreview')))
check('Clave libre del cliente no deduplica cuota genérica', !examRoute.includes('getMonthlyUniqueActionCount') && !chatRoute.includes('getMonthlyUniqueActionCount'))
check('Cuota se reserva atómicamente y Simulacro cuenta una sesión', quotaMigration.includes('pg_advisory_xact_lock') && simulacroRoute.includes('creditKey: String(simulacro_id)'))
check('Grant liga nota, intento y contenido exacto', xpGrant.includes('correctionDigest') && historyRoute.includes('digestExamCorrection(correctionText)'))
check('Imágenes se validan en todas las fronteras IA', [examRoute, caminoRoute, simulacroRoute, chatRoute].every(source => source.includes('validateCorrectionImagePayload')))
check('Simulacro tiene lock inmediato en ambos journeys', fullMock.includes('submitInFlightRef.current') && partialMock.includes('submitInFlightRef.current'))

if (failures.length) {
  console.error(`\n${failures.length} regression(es) de seguridad detectadas.`)
  process.exit(1)
}
