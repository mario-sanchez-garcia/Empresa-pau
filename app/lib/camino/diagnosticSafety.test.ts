import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Invariante de toda la función, comprobada sobre el código fuente.
//
// Los módulos de servidor del microdiagnóstico importan 'server-only' y no se
// pueden cargar en un test de Node, pero la regla que no se puede romper es
// justo la suya: NADA en el camino del diagnóstico marca temario como
// completado ni dominado. Un diagnóstico mueve el punto de ENTRADA entre
// "repaso rápido" y "lección completa"; nunca saca temario del plan.
//
// Si alguien añade esa escritura en el futuro, este test lo para.

const ROOT = join(process.cwd(), 'app', 'lib', 'camino')

const DIAGNOSTIC_MODULES = [
  'injectDiagnosticMissions.ts',
  'applyDiagnosticOutcome.ts',
  'diagnosticAdjustment.ts',
  'diagnosticLimits.ts',
  'knowledgeState.ts',
]

function read(file: string): string {
  return readFileSync(join(ROOT, file), 'utf8')
}

// Ignora comentarios de línea y de bloque: lo que importa es el código.
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter(line => !line.trim().startsWith('//'))
    .join('\n')
}

test('ninguna ruta de diagnóstico marca la cola como completed', () => {
  for (const file of DIAGNOSTIC_MODULES) {
    const code = stripComments(read(file))
    assert.ok(
      !/queue_status\s*:\s*['"]completed['"]/.test(code),
      `${file} escribe queue_status: 'completed'`,
    )
    assert.ok(
      !/update\([^)]*queue_status/.test(code.replace(/\s+/g, ' ')),
      `${file} actualiza queue_status; el diagnóstico solo puede ajustar metadata`,
    )
  }
})

test('ninguna ruta de diagnóstico marca misiones del calendario como completed', () => {
  for (const file of DIAGNOSTIC_MODULES) {
    const code = stripComments(read(file))
    assert.ok(
      !/status\s*:\s*['"]completed['"]/.test(code),
      `${file} marca status: 'completed'`,
    )
  }
})

test('ninguna ruta de diagnóstico promueve a dominado', () => {
  for (const file of DIAGNOSTIC_MODULES) {
    if (file === 'knowledgeState.ts') continue // define la regla, no la aplica
    const code = stripComments(read(file))
    assert.ok(!/['"]dominado['"]/.test(code), `${file} escribe el estado 'dominado'`)
  }
})

test('la promoción a dominado sigue aislada: nadie la invoca todavía', () => {
  // Está preparada y comprobada, pero activarla es una decisión aparte.
  for (const file of DIAGNOSTIC_MODULES) {
    if (file === 'knowledgeState.ts') continue
    // Se mira el CÓDIGO, no los comentarios: documentar dónde vive la regla
    // es correcto; llamarla todavía no lo es.
    assert.ok(
      !stripComments(read(file)).includes('canPromoteToDominado'),
      `${file} invoca canPromoteToDominado; esa promoción todavía no está activada`,
    )
  }
})

test('el diagnóstico nunca borra filas de la cola ni del calendario', () => {
  for (const file of DIAGNOSTIC_MODULES) {
    const code = stripComments(read(file))
    assert.ok(
      !/\.delete\(/.test(code),
      `${file} borra filas; ajustar el punto de entrada no es reconstruir el Camino`,
    )
  }
})

test('el ajuste de cola va siempre filtrado por usuario y por estado pending', () => {
  const code = stripComments(read('applyDiagnosticOutcome.ts')).replace(/\s+/g, ' ')
  assert.ok(code.includes(".eq('user_id', userId)"), 'falta el filtro por usuario')
  assert.ok(code.includes(".eq('queue_status', 'pending')"), 'falta el filtro por queue_status pending')
})

test('la ruta de práctica nunca persiste el origen reservado sin verificarlo', () => {
  // El origen `camino_diagnostic` exime de la cuota mensual del plan (ver
  // diagnosticLimits.ts), así que solo puede escribirlo el servidor cuando ha
  // comprobado la misión real. La rama de fallback del insert guardaba el
  // `source` recibido tal cual: bastaba con mandar esa etiqueta a mano para
  // no gastar cuota. Ahora se descarta antes (persistedSource).
  const route = stripComments(
    readFileSync(join(process.cwd(), 'app', 'api', 'practica-parcial', 'route.ts'), 'utf8'),
  ).replace(/\s+/g, ' ')

  assert.ok(
    route.includes('const persistedSource = source === DIAGNOSTIC_SOURCE && !isDiagnostic ? null : source'),
    'falta el descarte del origen reservado cuando la verificación no pasa',
  )
  assert.ok(
    !/\(source \? \{ source \} : \{\}\)/.test(route),
    'el insert vuelve a guardar el `source` recibido sin filtrar el origen reservado',
  )
  assert.ok(
    route.includes('(persistedSource ? { source: persistedSource } : {})'),
    'el insert debe guardar persistedSource, no el `source` crudo del cliente',
  )
})
