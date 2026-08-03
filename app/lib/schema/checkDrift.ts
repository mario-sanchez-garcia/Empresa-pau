// Server-only. Never import in client components.
//
// Núcleo de la comparación de esquema (real vs esperado), independiente de
// cómo se invoque — usado tanto por app/api/admin/schema-drift/route.ts
// (chequeo manual desde el panel) como por app/api/cron/schema-drift-check
// (chequeo automático diario). Ver expectedSchema.ts para qué se compara y
// por qué existe este detector.

import type { SupabaseClient } from '@supabase/supabase-js'
import {
  EXPECTED_COLUMNS,
  EXPECTED_FUNCTIONS,
  EXPECTED_TABLES,
  NO_OPEN_SELECT,
} from './expectedSchema'

type Severidad = 'critico' | 'aviso'
export type Hallazgo = { severidad: Severidad; que: string; detalle: string; porque: string }

type Snapshot = {
  tables: Array<{ name: string; rls: boolean }>
  columns: Array<{ table: string; column: string }>
  functions: string[]
  policies: Array<{ table: string; name: string; cmd: string; using: string | null }>
}

export type SchemaDriftResult =
  | {
      ok: boolean
      resumen: string
      criticos: Hallazgo[]
      avisos: Hallazgo[]
      comprobado: { tablas: number; columnas: number; funciones: number; politicasAbiertas: number }
    }
  | { error: 'no_snapshot'; message: string; detalle: string }

export async function runSchemaDriftCheck(db: SupabaseClient): Promise<SchemaDriftResult> {
  const { data, error } = await db.rpc('schema_snapshot')
  if (error) {
    return {
      error: 'no_snapshot',
      message: 'Falta la función schema_snapshot(). Aplica la migración 20260801220000_create_schema_snapshot_fn.sql en el SQL Editor.',
      detalle: error.message,
    }
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
  return {
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
  }
}
