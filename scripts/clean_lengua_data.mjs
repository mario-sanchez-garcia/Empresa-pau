// Limpieza de los enunciados de Lengua extraídos de los PDF oficiales.
//
// Los datos de app/data/lengua.ts venían de una extracción directa del PDF, con
// tres problemas que hacían ilegibles los exámenes en la app:
//   1. La cabecera oficial ("UNIVERSIDADES PÚBLICAS… TIEMPO: 90 minutos") pegada
//      dentro del enunciado, a veces al final del bloque 3.
//   2. Los números del margen del PDF (1, 5, 10, 15, 20) sueltos en su propia línea.
//   3. Los saltos de línea duros del PDF: cada renglón del papel era una línea, así
//      que no había forma de distinguir un párrafo real de un salto tipográfico.
//
// Este script reescribe el array JSON del fichero en sitio. Es idempotente:
// volver a ejecutarlo sobre datos ya limpios no cambia nada.
import fs from 'node:fs'

const FILE = new URL('../app/data/lengua.ts', import.meta.url).pathname

// Líneas que solo existen porque el PDF las imprime en cada página.
const BOILERPLATE_START = /^(UNIVERSIDADES\s+P[ÚU]BLICAS\s+DE\s+LA\s+COMUNIDAD\s+DE\s+MADRID|PRUEBA\s+DE\s+ACCESO\s+A\s+LA\s+UNIVERSIDAD|EVALUACI[ÓO]N\s+PARA\s+EL\s+ACCESO)/i
const BOILERPLATE_END = /^TIEMPO\b/i
const STANDALONE_JUNK = /^(Modelo(\s+Orientativo)?|Orientativo|Curso\s+20\d\d-20\d\d|MATERIA:.*|LENGUA\s+CASTELLANA\s+Y\s+LITERATURA\s+II|INSTRUCCIONES\s+GENERALES.*|OPCI[ÓO]N\s+[AB]|[A-F]|P[áa]gina\s+\d+(\s+de\s+\d+)?|\d+\s+de\s+\d+)$/i
// Numeración del margen izquierdo del PDF y números de página: en todo el corpus
// no hay una sola línea que sea solo un número y forme parte del examen.
const GUTTER_NUMBER = /^\d{1,3}$/
// Cola de una atribución que el PDF repite fuera de su párrafo ("23/10/2017)").
const ORPHAN_DATE = /^\d{1,2}\/\d{1,2}\/\d{4}\)$/

// Inicios de línea que son estructura del examen y nunca se pegan al párrafo anterior.
const STRUCTURAL = /^(TEXTO\b|BLOQUE\b|Responda\b|Conteste\b|Escoja\b|Elija\b|Lea\b|\d+\.\d+\.?\s|\d+\.[ab]\.|[A-B]\.\d+\.?\s|\d+\.\s|[a-e]\)\s*\(\s*\d|Fuente:)/

// "a. La profesora ha entrado ya" / "b. *La profesora ha entrada ya": los dos
// miembros del par mínimo de 2026 son líneas independientes, no prosa corrida.
const MINIMAL_PAIR = /^[ab]\.\s+\*?[A-ZÁÉÍÓÚ¿¡]/

// Un título de sección ("TEXTO A", "BLOQUE 2. …", "PREGUNTAS DE COMUNICACIÓN")
// ocupa su línea entera. La variante en versales es la de los exámenes 2019-2024.
const HEADING = /^(TEXTO(\s+[\dAB]\b)?$|BLOQUE\s+\d|[A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑ0-9 ]{3,60}$)/

// La pregunta 2.2 de 2026 pide rellenar una tabla y el PDF deja sus celdas como
// líneas sueltas ("Conjunción subordinante", "Perífrasis verbal"…). Sin viñeta se
// funden en una sola frase al reflotar el párrafo.
const TABLE_INTRO = /complete una tabla/i
const TABLE_CELL = /^[A-ZÁÉÍÓÚÑ][^.!?:]{2,55}$/
// Una viñeta ya generada por una pasada anterior: el script es idempotente.
const BULLET = /^- /

function stripBoilerplate(lines) {
  const out = []
  for (let i = 0; i < lines.length; i++) {
    if (!BOILERPLATE_START.test(lines[i].trim())) {
      out.push(lines[i])
      continue
    }
    // Salta hasta la línea TIEMPO inclusive; si no aparece en las 15 siguientes,
    // era prosa que empezaba igual y se deja intacta.
    let end = -1
    for (let j = i + 1; j < Math.min(i + 16, lines.length); j++) {
      if (BOILERPLATE_END.test(lines[j].trim())) { end = j; break }
    }
    if (end === -1) out.push(lines[i])
    else i = end
  }
  return out
}

// Un marcador de pregunta que quedó solo en su línea ("4.a.\nAnalice…").
function joinOrphanMarkers(lines) {
  const out = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    const isOrphanMarker = /^(\d+\.(\d+\.?|[ab]\.)?|[A-B]\.\d+\.?)$/.test(line)
    const next = (lines[i + 1] ?? '').trim()
    if (isOrphanMarker && next) {
      out.push(`${line} ${next}`)
      i++
    } else {
      out.push(lines[i])
    }
  }
  return out
}

// El PDF parte cada párrafo en renglones. Un renglón interior llega casi al ancho
// de la caja de texto; el último de un párrafo queda corto y termina en punto.
function reflowParagraph(lines) {
  const width = Math.max(...lines.map(line => line.length))
  const paragraphs = []
  let buffer = []
  const flush = () => { if (buffer.length) { paragraphs.push(buffer.join(' ')); buffer = [] } }

  // Las celdas de la tabla llegan como líneas cortas seguidas, justo después de
  // la frase que la anuncia (que a su vez viene partida en varios renglones).
  // Sin separarlas, el reflujo las pega en una sola frase sin sentido.
  let table = 'none'
  for (const line of lines) {
    const isCell = table === 'cells' && TABLE_CELL.test(line)
    if (TABLE_INTRO.test(line)) table = /[.!?:]$/.test(line) ? 'cells' : 'intro'
    else if (table === 'intro') { if (/[.!?:]$/.test(line)) table = 'cells' }
    else if (table === 'cells' && !isCell) table = 'none'
    const isItem = isCell || BULLET.test(line) || MINIMAL_PAIR.test(line)
    const isHeading = HEADING.test(line)
    if (STRUCTURAL.test(line) || isItem) flush()
    buffer.push(line)
    const endsSentence = /[.!?…:;"”»)]$/.test(line)
    const isShort = line.length < width - 10
    if (isItem || isHeading || (endsSentence && isShort)) flush()
  }
  flush()
  return paragraphs
}

function decorate(paragraph) {
  if (BULLET.test(paragraph)) return paragraph
  // "a. La profesora ha entrado ya" / "b. *La profesora ha entrada ya": el par
  // mínimo de 2026 necesita una línea por miembro, y el asterisco de
  // agramaticalidad se escapa para que Markdown no lo lea como énfasis.
  const minimalPair = paragraph.match(/^([ab])\.\s+(\*?)(.+)$/)
  if (minimalPair) return `- ${minimalPair[1]}. ${minimalPair[2] ? '\\*' : ''}${minimalPair[3]}`
  if (HEADING.test(paragraph)) return `**${paragraph}**`
  return paragraph
}

// Las celdas van justo detrás del párrafo que anuncia la tabla y son etiquetas
// cortas sin puntuación final; la primera frase normal cierra la lista.
function markTableCells(paragraphs) {
  let inTable = false
  return paragraphs.map(paragraph => {
    if (inTable && TABLE_CELL.test(paragraph)) return `- ${paragraph}`
    inTable = TABLE_INTRO.test(paragraph)
    return paragraph
  })
}

function clean(text) {
  if (!text) return text
  let lines = text
    .replace(/ /g, ' ')
    .split('\n')
    .map(line => line.replace(/\s+/g, ' ').trim())

  lines = stripBoilerplate(lines)
  lines = lines.filter((line, index) =>
    !GUTTER_NUMBER.test(line)
    && !STANDALONE_JUNK.test(line)
    && !(ORPHAN_DATE.test(line) && lines.slice(0, index).some(earlier => earlier.endsWith(line))))
  lines = joinOrphanMarkers(lines)

  const paragraphs = []
  for (const chunk of lines.join('\n').split(/\n\s*\n/)) {
    const chunkLines = chunk.split('\n').map(line => line.trim()).filter(Boolean)
    if (!chunkLines.length) continue
    paragraphs.push(...reflowParagraph(chunkLines))
  }

  return markTableCells(paragraphs)
    .map(decorate)
    .join('\n\n')
    // Las viñetas consecutivas forman una lista, no un párrafo suelto cada una.
    .replace(/(^- .*)\n\n(?=- )/gm, '$1\n')
    // Una instrucción arrastrada al final de una pregunta opcional ("…boom.
    // Responda una de estas dos preguntas:") pertenece a la siguiente, no a esta.
    .replace(/\n\n(Responda|Escoja|Conteste)\b[^\n]*:$/, '')
    .trim()
}

const source = fs.readFileSync(FILE, 'utf8')
const declaration = /const examenesLenguaBase[^=]*=\s*/.exec(source)
const start = declaration.index + declaration[0].length
const end = source.indexOf('\n]\n\nexport const examenesLengua') + 2
const data = JSON.parse(source.slice(start, end))

let cleaned = 0
let dropped = 0
for (const examen of data) {
  for (const bloque of examen.bloques) {
    for (const field of ['enunciado', 'texto_fuente']) {
      if (typeof bloque[field] !== 'string') continue
      const next = clean(bloque[field])
      if (next !== bloque[field]) cleaned++
      bloque[field] = next
    }
    // Los exámenes 2018-2019 traían en el bloque 2 ("Reflexión sobre la lengua")
    // una copia de la pregunta 5.a de literatura en vez de la 4.b de morfología,
    // que se perdió en la extracción. Etiquetada como "morfologia" y duplicada en
    // el bloque 3, confundía más que ayudaba.
    const opcionales = bloque.preguntas_opcionales ?? []
    const misplaced = bloque.tipo === 'ReflexionLengua'
      ? opcionales.filter(pregunta => /^\s*5\.[ab]\./.test(pregunta.enunciado))
      : []
    if (misplaced.length) {
      bloque.preguntas_opcionales = opcionales.filter(pregunta => !misplaced.includes(pregunta))
      bloque.enunciado = clean(
        bloque.enunciado.split('\n\n').filter(part => !/^\*?\*?5\.[ab]\./.test(part)).join('\n\n')
      )
      dropped += misplaced.length
    }
    for (const pregunta of bloque.preguntas_opcionales ?? []) {
      const next = clean(pregunta.enunciado)
      if (next !== pregunta.enunciado) cleaned++
      pregunta.enunciado = next
    }
  }
}

if (process.argv.includes('--dry')) {
  const preview = []
  for (const examen of data) {
    for (const bloque of examen.bloques) {
      preview.push(`===== ${examen.año} ${examen.tipo} ${examen.opcion} | ${bloque.label} | ${bloque.puntuacion} pts`)
      preview.push(bloque.enunciado)
      if (bloque.texto_fuente) preview.push('--- TEXTO FUENTE ---', bloque.texto_fuente)
      preview.push('')
    }
  }
  console.log(preview.join('\n'))
  process.exit(0)
}

const body = JSON.stringify(data, null, 2)

fs.writeFileSync(FILE, source.slice(0, start) + body + source.slice(end))
console.log(`campos reescritos: ${cleaned}, preguntas mal ubicadas retiradas: ${dropped}`)
