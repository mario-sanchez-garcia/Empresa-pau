import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(new URL('../package.json', import.meta.url)))

function read(path) {
  return readFileSync(join(root, path), 'utf8')
}

function includesAny(text, terms) {
  const normalized = text.toLowerCase()
  return terms.some(term => normalized.includes(term.toLowerCase()))
}

function inspectCandidate(candidate) {
  const source = read(candidate.sourceFile)
  return {
    ...candidate,
    checks: {
      enunciado: source.includes('enunciado'),
      subject: includesAny(source, [candidate.subject, candidate.subjectSlug ?? candidate.subject]),
      blockTopic: includesAny(source, candidate.searchTerms),
      criteria: includesAny(source, ['criterios', 'rubrica', 'rúbrica', 'solucion', 'solución', 'solucionOrientativa']),
      sourceFileExists: true,
    },
  }
}

const candidates = [
  { subject: 'Matemáticas II', subjectSlug: 'mates', topic: 'Matrices', exercise: 'Candidato QA M2-1', sourceFile: 'app/data/examenes.ts', searchTerms: ['matriz', 'matrices', 'determinante'] },
  { subject: 'Matemáticas II', subjectSlug: 'mates', topic: 'Sistemas', exercise: 'Candidato QA M2-2', sourceFile: 'app/data/examenes.ts', searchTerms: ['sistema', 'gauss', 'cramer'] },
  { subject: 'Matemáticas II', subjectSlug: 'mates', topic: 'Integrales', exercise: 'Candidato QA M2-3', sourceFile: 'app/data/examenes.ts', searchTerms: ['integral', 'integrales', '\\int'] },
  { subject: 'Matemáticas II', subjectSlug: 'mates', topic: 'Matrices/Sistemas', exercise: 'Candidato QA M2-4', sourceFile: 'app/data/examenes.ts', searchTerms: ['rango', 'matriz', 'sistema'] },
  { subject: 'Matemáticas II', subjectSlug: 'mates', topic: 'Integrales/Áreas', exercise: 'Candidato QA M2-5', sourceFile: 'app/data/examenes.ts', searchTerms: ['área', 'area', 'integral definida'] },
  { subject: 'Física', subjectSlug: 'fisica', topic: 'Campo gravitatorio / electromagnetismo', exercise: 'Candidato QA FIS-1', sourceFile: 'app/data/fisica.ts', searchTerms: ['campo', 'fuerza', 'potencial'] },
  { subject: 'Física', subjectSlug: 'fisica', topic: 'Ondas', exercise: 'Candidato QA FIS-2', sourceFile: 'app/data/fisica.ts', searchTerms: ['onda', 'frecuencia', 'longitud de onda'] },
  { subject: 'Física', subjectSlug: 'fisica', topic: 'Física moderna', exercise: 'Candidato QA FIS-3', sourceFile: 'app/data/fisica.ts', searchTerms: ['fotoelectrico', 'fotón', 'núcleo', 'radiactividad'] },
  { subject: 'Historia', subjectSlug: 'historia', topic: 'Comentario/fuente', exercise: 'Candidato QA HIS-1', sourceFile: 'app/data/examenes.ts', searchTerms: ['Historia de España', 'texto', 'comentario'] },
  { subject: 'Historia', subjectSlug: 'historia', topic: 'Siglo XIX', exercise: 'Candidato QA HIS-2', sourceFile: 'app/data/examenes.ts', searchTerms: ['constitución', 'liberal', 'restauración'] },
  { subject: 'Historia', subjectSlug: 'historia', topic: 'Siglo XX', exercise: 'Candidato QA HIS-3', sourceFile: 'app/data/examenes.ts', searchTerms: ['franquismo', 'guerra civil', 'transición'] },
  { subject: 'Inglés', subjectSlug: 'ingles', topic: 'Reading', exercise: 'Candidato QA ING-1', sourceFile: 'app/data/ingles.ts', searchTerms: ['reading', 'comprehension', 'text'] },
  { subject: 'Inglés', subjectSlug: 'ingles', topic: 'Use of English', exercise: 'Candidato QA ING-2', sourceFile: 'app/data/ingles.ts', searchTerms: ['use of english', 'grammar', 'vocabulary'] },
  { subject: 'Inglés', subjectSlug: 'ingles', topic: 'Writing', exercise: 'Candidato QA ING-3', sourceFile: 'app/data/ingles.ts', searchTerms: ['writing', 'essay', 'composition'] },
]

const inspected = candidates.map(inspectCandidate)
const manualResultPath = join(root, 'docs/qa/p0-corrections-manual-results.json')
let manualResults = {}
try {
  manualResults = JSON.parse(readFileSync(manualResultPath, 'utf8'))
} catch {
  manualResults = {}
}

const rows = inspected.map(item => {
  const manual = manualResults[item.exercise] ?? {}
  const dataReady = Object.values(item.checks).every(Boolean)
  return {
    asignatura: item.subject,
    tema: item.topic,
    ejercicio: item.exercise,
    fuente: item.sourceFile,
    datosBasicos: dataReady ? 'OK' : 'Revisar',
    correccionCompleta: manual.correccionCompleta ?? '',
    latexCorrecto: manual.latexCorrecto ?? '',
    historialGuardado: manual.historialGuardado ?? '',
    resultado: manual.resultado ?? '',
    observaciones: manual.observaciones ?? '',
    checks: item.checks,
  }
})

const passCount = rows.filter(row =>
  String(row.correccionCompleta).toLowerCase() === 'si' &&
  String(row.latexCorrecto).toLowerCase() === 'si' &&
  String(row.historialGuardado).toLowerCase() === 'si'
).length
const completedCount = rows.filter(row => row.correccionCompleta || row.latexCorrecto || row.historialGuardado).length
const successRate = completedCount ? Math.round((passCount / completedCount) * 100) : 0

const report = `# P0 QA Correcciones IA

Generado por \`npm run qa:corrections:p0\`.

## Objetivo

Validar manualmente que al menos el 90% de las correcciones revisadas llegan completas, con LaTeX correcto y guardadas en Historial.

## Resumen

- Candidatos listados: ${rows.length}
- Casos con datos basicos encontrados: ${rows.filter(row => row.datosBasicos === 'OK').length}
- Casos manualmente evaluados: ${completedCount}
- Casos OK completos: ${passCount}
- Tasa manual actual: ${successRate}%

## Checklist

| Asignatura | Tema | Ejercicio | Datos basicos | Correccion completa | LaTeX correcto | Historial guardado | Resultado | Observaciones |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
${rows.map(row => `| ${row.asignatura} | ${row.tema} | ${row.ejercicio} | ${row.datosBasicos} | ${row.correccionCompleta} | ${row.latexCorrecto} | ${row.historialGuardado} | ${row.resultado} | ${row.observaciones} |`).join('\n')}

## Como registrar QA manual

Opcionalmente crea \`docs/qa/p0-corrections-manual-results.json\` con claves por ejercicio:

\`\`\`json
{
  "Candidato QA M2-1": {
    "correccionCompleta": "si",
    "latexCorrecto": "si",
    "historialGuardado": "si",
    "resultado": "OK",
    "observaciones": "Revisado en beta"
  }
}
\`\`\`
`

mkdirSync(join(root, 'docs/qa'), { recursive: true })
writeFileSync(join(root, 'docs/qa/p0-corrections-report.md'), report)
writeFileSync(join(root, 'docs/qa/p0-corrections-report.json'), JSON.stringify({ generatedAt: new Date().toISOString(), successRate, rows }, null, 2))
console.log(`P0 correction QA report generated: ${rows.length} candidates, ${successRate}% manual success rate.`)
