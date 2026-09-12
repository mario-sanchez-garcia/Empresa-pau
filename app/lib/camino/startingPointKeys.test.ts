import assert from 'node:assert/strict'
import { test } from 'node:test'

import { coveredBlockCount, queueMetadataFor, resolveStartModes } from './startingPoint.ts'
import { normalizeSubjectSlug } from './subjectSlug.ts'

// El fallo que estos tests fijan no daba error en ningún sitio.
//
// El onboarding guarda el punto de partida declarado con ETIQUETAS HUMANAS
// ("Física", "Historia de España"); generateCaminoPlan normaliza sus
// asignaturas a SLUGS ("fisica", "historia_espana") y pedía los modos con
// esos slugs. La búsqueda devolvía undefined, el fallback convertía todo en
// 'zero', y el resultado era un Camino que ignoraba por completo lo que el
// alumno había declarado — sin una sola excepción ni un log.
//
// Aguas abajo: sin `declared_start_mode` en la cola, declaredBlocks() no
// encuentra candidatos, el microdiagnóstico nunca se ofrece y
// student_block_knowledge se queda en cero para siempre.
//
// Comprobado en producción el 13/09/2026: 4.744 filas de cola, 0 con
// declared_start_mode, 4.368 con beta_sequence (la marca de la rama 'zero').

test('claves humanas: lo declarado llega a su asignatura', () => {
  const modes = resolveStartModes(
    ['fisica', 'matematicas_ii', 'historia_espana'],
    { 'Física': 'review', 'Matemáticas II': 'mid', 'Historia de España': 'first_block' },
  )
  assert.deepEqual(modes, {
    fisica: 'review',
    matematicas_ii: 'mid',
    historia_espana: 'first_block',
  })
})

test('claves ya normalizadas: el comportamiento de siempre no cambia', () => {
  const modes = resolveStartModes(
    ['fisica', 'quimica'],
    { fisica: 'review', quimica: 'mid' },
  )
  assert.deepEqual(modes, { fisica: 'review', quimica: 'mid' })
})

test('mezcla de humanas y slug en el mismo objeto', () => {
  const modes = resolveStartModes(
    ['fisica', 'matematicas_ii', 'lengua'],
    { 'Física': 'review', matematicas_ii: 'mid', 'Lengua Castellana': 'first_block' },
  )
  assert.deepEqual(modes, { fisica: 'review', matematicas_ii: 'mid', lengua: 'first_block' })
})

test('asignatura sin declarar: fallback explícito, y el fallback es configurable', () => {
  assert.deepEqual(
    resolveStartModes(['fisica', 'quimica'], { 'Física': 'review' }),
    { fisica: 'review', quimica: 'zero' },
  )
  assert.deepEqual(
    resolveStartModes(['quimica'], { 'Física': 'review' }, 'unknown'),
    { quimica: 'unknown' },
  )
})

test('declaración de una asignatura que el alumno no cursa: se ignora sin ruido', () => {
  assert.deepEqual(
    resolveStartModes(['fisica'], { 'Química': 'review', 'Física': 'mid' }),
    { fisica: 'mid' },
  )
})

test('los cinco modos válidos sobreviven al viaje, incluido zero', () => {
  for (const mode of ['zero', 'first_block', 'mid', 'review', 'unknown'] as const) {
    assert.deepEqual(resolveStartModes(['fisica'], { 'Física': mode }), { fisica: mode })
  }
})

test('un valor basura cae al fallback y nunca pisa una declaración buena', () => {
  assert.deepEqual(resolveStartModes(['fisica'], { 'Física': 'ojalá' }), { fisica: 'zero' })
  assert.deepEqual(resolveStartModes(['fisica'], { 'Física': null }), { fisica: 'zero' })
  // Dos etiquetas que normalizan al mismo slug: la válida manda, llegue
  // antes o después que la inválida.
  assert.deepEqual(
    resolveStartModes(['historia_espana'], { 'Historia': 'basura', 'Historia de España': 'review' }),
    { historia_espana: 'review' },
  )
  assert.deepEqual(
    resolveStartModes(['historia_espana'], { 'Historia de España': 'review', 'Historia': 'basura' }),
    { historia_espana: 'review' },
  )
})

test('declared vacío o ausente: todo al fallback, sin lanzar', () => {
  assert.deepEqual(resolveStartModes(['fisica'], null), { fisica: 'zero' })
  assert.deepEqual(resolveStartModes(['fisica'], undefined), { fisica: 'zero' })
  assert.deepEqual(resolveStartModes(['fisica'], {}), { fisica: 'zero' })
  assert.deepEqual(resolveStartModes([], { 'Física': 'review' }), {})
})

test('normalizeSubjectSlug es idempotente — de ahí que valga en los dos lados', () => {
  for (const label of ['Física', 'Matemáticas II', 'Historia de España', 'Lengua Castellana']) {
    const once = normalizeSubjectSlug(label)
    assert.equal(normalizeSubjectSlug(once), once, label)
  }
})

// ── Cadena completa, al nivel puro ──────────────────────────────────────
//
// Reproduce exactamente lo que hace generateCaminoPlan entre sus líneas 247 y
// 267: resolver modos, contar bloques cubiertos y construir la metadata de
// cada fila. El fallo original vivía entre capas que por separado estaban
// bien, así que lo que hay que fijar es la costura.

type Fila = { subject: string; blockKey: string; topicSlug: string }

function construirCola(
  subjectsSlug: string[],
  declarado: Record<string, unknown>,
  temario: Record<string, Fila[]>,
) {
  const startModes = resolveStartModes(subjectsSlug, declarado)
  const salida: Array<Fila & { metadata: ReturnType<typeof queueMetadataFor> }> = []
  for (const subject of subjectsSlug) {
    const items = temario[subject] ?? []
    const modo = startModes[subject]
    const bloques = [...new Set(items.map(i => i.blockKey))]
    const cubiertos = new Set(bloques.slice(0, coveredBlockCount(modo, bloques.length)))
    for (const item of items) {
      salida.push({ ...item, metadata: queueMetadataFor(modo, cubiertos.has(item.blockKey), item.topicSlug) })
    }
  }
  return salida
}

/** El mismo filtro que aplica declaredBlocks() en injectDiagnosticMissions. */
function candidatosDeDiagnostico(cola: ReturnType<typeof construirCola>) {
  return cola.filter(r =>
    typeof r.metadata.declared_start_mode === 'string' && r.metadata.mission_type === 'review')
}

const TEMARIO: Record<string, Fila[]> = {
  fisica: [
    { subject: 'fisica', blockKey: 'B1', topicSlug: 'cinematica' },
    { subject: 'fisica', blockKey: 'B2', topicSlug: 'campo-gravitatorio' },
  ],
  matematicas_ii: [
    { subject: 'matematicas_ii', blockKey: 'B1', topicSlug: 'matrices' },
    { subject: 'matematicas_ii', blockKey: 'B2', topicSlug: 'derivadas' },
  ],
  historia_espana: [
    { subject: 'historia_espana', blockKey: 'B1', topicSlug: 'al-andalus' },
    { subject: 'historia_espana', blockKey: 'B2', topicSlug: 'siglo-xix' },
  ],
}

test('REGRESIÓN: el payload real de producción produce una cola declarada', () => {
  // Exactamente lo que declaró un alumno el 10/09/2026 y que el Camino ignoró.
  const declarado = { 'Física': 'review', 'Matemáticas II': 'review', 'Historia de España': 'unknown' }
  const cola = construirCola(['fisica', 'matematicas_ii', 'historia_espana'], declarado, TEMARIO)

  const fisica = cola.filter(r => r.subject === 'fisica')
  const mates = cola.filter(r => r.subject === 'matematicas_ii')
  const historia = cola.filter(r => r.subject === 'historia_espana')

  // 'review' cubre TODO el temario: repaso express con su rastro.
  for (const fila of [...fisica, ...mates]) {
    assert.equal(fila.metadata.mission_type, 'review', fila.topicSlug)
    assert.equal(fila.metadata.express, true, fila.topicSlug)
    assert.equal(fila.metadata.declared_start_mode, 'review', fila.topicSlug)
    assert.equal(fila.metadata.beta_sequence, undefined, fila.topicSlug)
  }

  // 'unknown' no da nada por sabido: concepto nuevo, pero DECLARADO — así que
  // tampoco lleva beta_sequence, que es la marca exclusiva de 'zero'.
  for (const fila of historia) {
    assert.equal(fila.metadata.mission_type, 'concept', fila.topicSlug)
    assert.equal(fila.metadata.express, undefined, fila.topicSlug)
    assert.equal(fila.metadata.declared_start_mode, 'unknown', fila.topicSlug)
    assert.equal(fila.metadata.beta_sequence, undefined, fila.topicSlug)
  }

  // Y lo que de verdad estaba roto: que declaredBlocks() encuentre algo.
  const candidatos = candidatosDeDiagnostico(cola)
  assert.equal(candidatos.length, 4)
  assert.deepEqual(
    [...new Set(candidatos.map(c => c.subject))].sort(),
    ['fisica', 'matematicas_ii'],
  )
  // Historia queda fuera: 'unknown' no es diagnosticable, y eso es correcto.
  assert.ok(!candidatos.some(c => c.subject === 'historia_espana'))
})

test('REGRESIÓN: con el fallo, esa misma cola no daba ni un candidato', () => {
  // Lo que producía el código anterior: buscar con slug en claves humanas.
  const declarado = { 'Física': 'review', 'Matemáticas II': 'review', 'Historia de España': 'unknown' }
  const comoAntes = ['fisica', 'matematicas_ii', 'historia_espana']
    .reduce<Record<string, string>>((acc, s) => {
      const raw = (declarado as Record<string, unknown>)[s]
      acc[s] = typeof raw === 'string' ? raw : 'zero'
      return acc
    }, {})
  assert.deepEqual(comoAntes, { fisica: 'zero', matematicas_ii: 'zero', historia_espana: 'zero' })

  // Y 'zero' es justo el modo que emite beta_sequence y ningún declared_start_mode.
  const meta = queueMetadataFor('zero', false, 'cinematica')
  assert.equal(meta.beta_sequence, true)
  assert.equal(meta.declared_start_mode, undefined)
})

test('un alumno que empieza de cero sigue igual que siempre', () => {
  const cola = construirCola(['fisica'], { 'Física': 'zero' }, TEMARIO)
  for (const fila of cola) {
    assert.equal(fila.metadata.mission_type, 'concept')
    assert.equal(fila.metadata.beta_sequence, true)
    assert.equal(fila.metadata.declared_start_mode, undefined)
  }
  assert.equal(candidatosDeDiagnostico(cola).length, 0)
})

test('mid declarado con etiqueta humana cubre media asignatura, no toda', () => {
  const cola = construirCola(['matematicas_ii'], { 'Matemáticas II': 'mid' }, TEMARIO)
  const review = cola.filter(r => r.metadata.mission_type === 'review')
  const concept = cola.filter(r => r.metadata.mission_type === 'concept')
  assert.equal(review.length, 1)
  assert.equal(concept.length, 1)
  // La mitad no cubierta sigue siendo temario nuevo, pero con rastro de que
  // hubo declaración: nunca beta_sequence.
  assert.equal(concept[0].metadata.declared_start_mode, 'mid')
  assert.equal(concept[0].metadata.beta_sequence, undefined)
})
