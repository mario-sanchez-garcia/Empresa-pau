import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, createUserSupabase } from '@/app/lib/camino/caminoProgressServer'
import { calcularRacha } from '@/app/lib/calcularRacha'
import { caminoSubjectFromSimulacro } from '@/app/lib/camino/partialExamSubjects'
import { subjectLabelFromSlug } from '@/app/lib/camino/caminoCurriculumPlan'
import { getMadridToday } from '@/app/lib/camino/studyDays'
import { GET as proyeccionGET } from '@/app/api/proyeccion/route'
import { GET as pulsoGET } from '@/app/api/centro/pulso/route'
import { GET as ligasGET } from '@/app/api/ligas/route'
import { GET as ligasGlobalGET } from '@/app/api/ligas/global/route'

export const dynamic = 'force-dynamic'

/**
 * Una sola petición para todo lo que /camino necesitaba al montar.
 *
 * El hub disparaba ~30 peticiones desde el navegador: catorce consultas
 * sueltas a Supabase (seis contadores por asignatura, XP, cola, simulacros y
 * exámenes de la semana/mes, actividad libre de hoy) más cuatro endpoints de
 * widget, cada una con su ida y vuelta desde el dispositivo del alumno. Aquí
 * se hacen todas en el mismo sitio, que además está al lado de la base de
 * datos: el coste de red pasa de ~18 viajes a uno.
 *
 * Las consultas usan el cliente con el token del alumno (RLS activa), o sea
 * exactamente los mismos permisos que tenían cuando las lanzaba el navegador:
 * este endpoint no puede leer nada que el alumno no pudiera leer ya.
 *
 * Los cuatro widgets se delegan a sus propios handlers en vez de reescribir su
 * lógica aquí, para que no haya dos versiones que puedan divergir.
 */
export async function GET(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const userId = authContext.user.id
  const db = createUserSupabase(authContext.accessToken)

  const url = new URL(request.url)
  const weekStart = url.searchParams.get('weekStart') ?? ''
  const weekEnd = url.searchParams.get('weekEnd') ?? ''
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart) || !/^\d{4}-\d{2}-\d{2}$/.test(weekEnd)) {
    return NextResponse.json({ error: 'weekStart y weekEnd son obligatorios (YYYY-MM-DD).' }, { status: 400 })
  }
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const today = getMadridToday()

  const completedInSubject = (subject: string) =>
    db.from('camino_calendar').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'completed').eq('subject', subject)

  // Un widget que falle no puede tumbar el arranque entero: cada delegación se
  // resuelve por separado y, si revienta, ese trozo viaja como null y el
  // cliente se queda con su valor por defecto —igual que cuando cada efecto
  // se tragaba su propio error.
  // El tipo admite `undefined` porque alguno de estos handlers tiene una rama
  // sin return explícito; se trata igual que un fallo.
  const delegate = async (handler: (req: NextRequest) => Promise<Response | undefined>, target: NextRequest) => {
    try {
      const response = await handler(target)
      if (!response || !response.ok) {
        console.warn('[camino/bootstrap] parte degradada:', target.nextUrl.pathname, response?.status ?? 'sin respuesta')
        return null
      }
      return await response.json() as unknown
    } catch (error) {
      // Sin esto, un widget que falle desaparece del hub en silencio: el
      // cliente se queda con su valor por defecto y nadie se entera.
      console.error('[camino/bootstrap] parte fallida:', target.nextUrl.pathname, (error as Error)?.message?.slice(0, 160))
      return null
    }
  }
  const subRequest = (path: string) => new NextRequest(new URL(path, request.url), { headers: request.headers })

  const [
    racha, matCount, ccssCount, lenguaCount, historiaCount, fisicaCount, quimicaCount,
    progressRow, weeklyXpRows, queueResult, simsWeekResult, monthlySimsResult, examsWeekResult,
    freeExamsToday, freeSimsToday,
    proyeccion, pulso, ligas, ligasGlobal,
  ] = await Promise.all([
    calcularRacha(userId, db),
    completedInSubject('matematicas_ii'),
    completedInSubject('matematicas_ccss'),
    completedInSubject('lengua'),
    completedInSubject('historia_espana'),
    completedInSubject('fisica'),
    completedInSubject('quimica'),
    db.from('camino_user_progress').select('xp_total').eq('user_id', userId).maybeSingle(),
    db.from('camino_xp_events').select('xp_amount').eq('user_id', userId).gte('created_at', weekStart + 'T00:00:00Z'),
    db.from('user_learning_queue').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    db.from('historial_simulacros').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('estado', 'completado').gte('created_at', weekStart + 'T00:00:00Z').lte('created_at', weekEnd + 'T23:59:59Z'),
    db.from('historial_simulacros').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('estado', 'completado').gte('created_at', startOfMonth),
    // historial_examenes no tiene columna 'estado' — nota != null es la misma
    // condición que usa award-exam-xp/route.ts para considerar una corrección
    // real (no evaluable = no cuenta).
    db.from('historial_examenes').select('*', { count: 'exact', head: true }).eq('user_id', userId).not('nota', 'is', null).gte('created_at', weekStart + 'T00:00:00Z').lte('created_at', weekEnd + 'T23:59:59Z'),
    // Práctica libre de hoy fuera de Camino (Exámenes/Simulacros directos) —
    // sin v2_sort_order/tema exacto enlazable, así que solo se agrega a nivel
    // de asignatura para el indicador "también trabajaste hoy".
    db.from('historial_examenes').select('asignatura').eq('user_id', userId).neq('tipo', 'Camino PAU').not('nota', 'is', null).gte('created_at', today + 'T00:00:00Z').lte('created_at', today + 'T23:59:59Z'),
    db.from('historial_simulacros').select('asignatura').eq('user_id', userId).eq('estado', 'completado').gte('created_at', today + 'T00:00:00Z').lte('created_at', today + 'T23:59:59Z'),
    delegate(proyeccionGET, subRequest('/api/proyeccion')),
    delegate(pulsoGET, subRequest('/api/centro/pulso')),
    delegate(ligasGET, subRequest('/api/ligas')),
    delegate(ligasGlobalGET, subRequest('/api/ligas/global?period=total')),
  ])

  const freeSubjects = new Set<string>()
  for (const row of (freeExamsToday.data ?? []) as Array<{ asignatura: string }>) {
    freeSubjects.add(subjectLabelFromSlug(caminoSubjectFromSimulacro(row.asignatura)))
  }
  for (const row of (freeSimsToday.data ?? []) as Array<{ asignatura: string }>) {
    freeSubjects.add(subjectLabelFromSlug(caminoSubjectFromSimulacro(row.asignatura)))
  }

  return NextResponse.json({
    streak: racha,
    subjectProgress: {
      matematicas_ii: matCount.count ?? 0,
      matematicas_ccss: ccssCount.count ?? 0,
      lengua: lenguaCount.count ?? 0,
      historia_espana: historiaCount.count ?? 0,
      fisica: fisicaCount.count ?? 0,
      quimica: quimicaCount.count ?? 0,
    },
    xpTotal: Number(progressRow.data?.xp_total) || 0,
    weeklyXP: ((weeklyXpRows.data ?? []) as Array<{ xp_amount: number }>).reduce((sum, r) => sum + (Number(r.xp_amount) || 0), 0),
    queueCount: queueResult.count ?? 0,
    weeklySimsCompleted: simsWeekResult.count ?? 0,
    monthlySimsUsed: monthlySimsResult.count ?? 0,
    weeklyExamsCompleted: examsWeekResult.count ?? 0,
    freeActivitySubjectsToday: [...freeSubjects],
    proyeccion,
    pulso,
    ligas,
    ligasGlobal,
  })
}
