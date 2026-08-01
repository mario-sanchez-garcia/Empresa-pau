/**
 * Lo que el código da por hecho que existe en producción.
 *
 * Esta lista es la memoria del proyecto. Durante seis semanas hubo migraciones
 * escritas en el repo pero nunca aplicadas — signup_attempts.email desde el 22
 * de junio, las políticas RLS de ligas del 31 de julio — y nadie se enteró
 * porque el código fallaba dentro de un try/catch silencioso.
 *
 * REGLA: cuando escribas una migración que el código necesite, añádela aquí.
 * Si no está aquí, /api/admin/schema-drift no puede avisarte de que falta.
 */

export type ExpectedColumn = { table: string; column: string; porque: string }
export type ExpectedFunction = { name: string; porque: string }
export type ForbiddenPolicy = { table: string; porque: string }

/** Tablas que alguna ruta consulta. Si falta una, esa función revienta. */
export const EXPECTED_TABLES: Array<{ name: string; rls: boolean; porque: string }> = [
  { name: 'perfiles',                 rls: true, porque: 'Perfil y username de cada alumno' },
  { name: 'billing_events',           rls: true, porque: 'Onboarding, consentimiento RGPD y desistimiento' },
  { name: 'signup_attempts',          rls: true, porque: 'Rate limiting de registro' },
  { name: 'camino_calendar',          rls: true, porque: 'Misiones del Camino' },
  { name: 'camino_user_progress',     rls: true, porque: 'XP y rankings' },
  { name: 'camino_xp_events',         rls: true, porque: 'Historial de XP' },
  { name: 'camino_ensure_log',        rls: true, porque: 'Throttle diario de ensure-calendar' },
  { name: 'ligas',                    rls: true, porque: 'Ligas' },
  { name: 'liga_miembros',            rls: true, porque: 'Miembros de liga (ojo: singular)' },
  { name: 'ligas_rondas',             rls: true, porque: 'Rondas mensuales' },
  { name: 'ligas_rondas_resultados',  rls: true, porque: 'Resultados de ronda' },
  { name: 'historial_examenes',       rls: true, porque: 'Correcciones y cálculo de racha' },
  { name: 'historial_simulacros',     rls: true, porque: 'Simulacros y cálculo de racha' },
  { name: 'user_entitlements',        rls: true, porque: 'Acceso de pago (Stripe)' },
  { name: 'email_events',             rls: true, porque: 'Deduplicación de envíos y reanudación de crons' },
  { name: 'ai_usage_events',          rls: true, porque: 'Control de cuota y coste de IA' },
]

/** Columnas concretas que el código nombra de forma explícita. */
export const EXPECTED_COLUMNS: ExpectedColumn[] = [
  { table: 'signup_attempts', column: 'email',
    porque: 'El INSERT del rate limiting la incluye; sin ella falla y NINGÚN límite salta' },
  { table: 'signup_attempts', column: 'ip',
    porque: 'Límite por IP' },
  { table: 'camino_calendar', column: 'completed_at',
    porque: 'La racha se calcula con la fecha real, no con scheduled_date' },
  { table: 'camino_ensure_log', column: 'last_ensured_day',
    porque: 'Throttle diario de ensure-calendar' },
  { table: 'perfiles', column: 'username',
    porque: 'Nombre mostrado en rankings; sin ella se ve "Alumno Kairo" a todos' },
  { table: 'perfiles', column: 'subjects',
    porque: 'Fuente de verdad de asignaturas tras el onboarding' },
]

/** Funciones que alguna política RLS o ruta invoca. */
export const EXPECTED_FUNCTIONS: ExpectedFunction[] = [
  { name: 'is_liga_member',
    porque: 'Las políticas RLS de ligas la llaman; sin ella las ligas quedan abiertas' },
  { name: 'schema_snapshot',
    porque: 'Esta misma comprobación' },
]

/**
 * Tablas que NUNCA deben tener una política de lectura con USING (true).
 * Es el estado en el que estuvieron las ligas: cualquier usuario registrado
 * podía volcar todas las ligas con sus códigos de invitación y sus miembros.
 */
export const NO_OPEN_SELECT: ForbiddenPolicy[] = [
  { table: 'ligas',                   porque: 'Expondría códigos de invitación de todas las ligas' },
  { table: 'liga_miembros',           porque: 'Expondría la lista completa de alumnos de cada liga' },
  { table: 'ligas_rondas_resultados', porque: 'Expondría resultados de rondas ajenas' },
  { table: 'perfiles',                porque: 'Expondría datos personales de menores' },
  { table: 'historial_examenes',      porque: 'Expondría respuestas y notas de otros alumnos' },
  { table: 'historial_simulacros',    porque: 'Expondría simulacros de otros alumnos' },
]
