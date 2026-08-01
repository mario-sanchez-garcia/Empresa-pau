import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isInternalUser } from '@/app/lib/internalUsers'
import { createServiceClient } from '@/app/lib/billing/supabase'
import {
  EXPECTED_COLUMNS,
  EXPECTED_FUNCTIONS,
  EXPECTED_TABLES,
  NO_OPEN_SELECT,
} from '@/app/lib/schema/expectedSchema'

export const dynamic = 'force-dynamic'

/**
 * Compara el esquema REAL de producción con lo que el código espera.
 *
 * Existe porque durante seis semanas hubo migraciones en el repo sin aplicar y
 * no había ninguna forma de saberlo: el rate limiting de registro estaba
 * inerte y las tablas de ligas abiertas, ambos fallando en silencio.
 *
 * Se consulta a mano antes de cada despliegue importante. No sustituye a
 * aplicar las migraciones, avisa de que no se han aplicado.
 */

type Severidad = 'critico' | 'aviso'
type Hallazgo = { severidad: Severidad; que: string; detalle: string; porque: string }

function getBearerToken(request: NextRequest): string | null {
  const match = (request.headers.get('authorization') ?? '').match(/^Bearer\s+(.+)$/i)
  return match?.[1] ?? null
}

type Snapshot = {
  tables: Array<{ name: string; rls: boolean }>
  columns: Array<{ table: string; column: string }>
  functions: string[]
  policies: Array<{ table: string; name: string; cmd: string; using: string | null }>
}

export async function GET(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return NextResponse.json({ error: 'Config error' }, { status: 500 })

  const accessToken = getBearerToken(request)
  if (!accessToken) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const authSupabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: userData, error: authError } = await authSupabase.auth.getUser(accessToken)
  if (authError || !userData.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!isInternalUser(userData.user.email)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const db = createServiceClient()
  const { data, error } = await db.rpc('schema_snapshot')
  if (error) {
    return NextResponse.json(
      {
        error: 'no_snapshot',
        message: 'Falta la función schema_snapshot(). Aplica la migración 20260801220000_create_schema_snapshot_fn.sql en el SQL Editor.',
        detalle: error.message,
      },
      { status: 503 }
    )
  }

  const snap = data as Snapshot
  const tablasReales = new Map(snap.tables.map(t => [t.name, t.rls]))
  const columnasReales = new Set(snap.columns.map(c => `${c.table}.${c.column}`))
  const funcionesReales = new Set(snap.functions)

  const hallazgos: Hallazgo[] = []

  for (const t of EXPECTED_TABLES) {
    if (!tablasReales.has(t.name)) {
      hallazgos.push({ severidad: 'critico', que: `Falta la tabla ${t.name}`, detalle: 'Migración sin aplicar', porque: t.porque })
    } else if (t.rls && tablasReales.get(t.name) === false) {
      hallazgos.push({ severidad: 'critico', que: `${t.name} sin RLS`, detalle: 'Legible con la anon key', porque: t.porque })
    }
  }

  for (const c of EXPECTED_COLUMNS) {
    if (!columnasReales.has(`${c.table}.${c.column}`)) {
      hallazgos.push({ severidad: 'critico', que: `Falta ${c.table}.${c.column}`, detalle: 'Migración sin aplicar', porque: c.porque })
    }
  }

  for (const f of EXPECTED_FUNCTIONS) {
    if (!funcionesReales.has(f.name)) {
      hallazgos.push({ severidad: 'critico', que: `Falta la función ${f.name}()`, detalle: 'Migración sin aplicar', porque: f.porque })
    }
  }

  // Políticas de lectura abiertas: el estado exacto en el que estuvieron las
  // ligas hasta hoy — cualquier usuario autenticado podía leerlo todo.
  for (const p of NO_OPEN_SELECT) {
    const abiertas = snap.policies.filter(
      pol => pol.table === p.table && (pol.cmd === 'SELECT' || pol.cmd === 'ALL') && pol.using === 'true'
    )
    for (const pol of abiertas) {
      hallazgos.push({
        severidad: 'critico',
        que: `${p.table} tiene lectura abierta`,
        detalle: `Política "${pol.name}" con USING (true)`,
        porque: p.porque,
      })
    }
  }

  // Aviso, no error: una tabla con RLS y cero políticas queda cerrada a todo
  // el mundo salvo service role. Correcto para tablas que solo escribe el
  // servidor, sospechoso si el cliente debería leerla.
  for (const t of snap.tables) {
    if (!t.rls) continue
    const n = snap.policies.filter(p => p.table === t.name).length
    if (n === 0) {
      hallazgos.push({
        severidad: 'aviso',
        que: `${t.name}: RLS activo sin políticas`,
        detalle: 'Solo accesible con service role',
        porque: 'Correcto si solo escribe el servidor; roto si el cliente debe leerla',
      })
    }
  }

  const criticos = hallazgos.filter(h => h.severidad === 'critico')
  return NextResponse.json({
    ok: criticos.length === 0,
    resumen: criticos.length === 0
      ? 'Producción coincide con lo que el código espera.'
      : `${criticos.length} problema(s) crítico(s): hay migraciones sin aplicar.`,
    criticos,
    avisos: hallazgos.filter(h => h.severidad === 'aviso'),
    comprobado: {
      tablas: EXPECTED_TABLES.length,
      columnas: EXPECTED_COLUMNS.length,
      funciones: EXPECTED_FUNCTIONS.length,
      politicasAbiertas: NO_OPEN_SELECT.length,
    },
  })
}
