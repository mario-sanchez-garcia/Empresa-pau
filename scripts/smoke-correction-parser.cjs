const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const ts = require('typescript')

const root = path.resolve(__dirname, '..')
const originalResolveFilename = Module._resolveFilename

Module._resolveFilename = function resolveTypescriptNeighbor(request, parent, isMain, options) {
  try {
    return originalResolveFilename.call(this, request, parent, isMain, options)
  } catch (error) {
    if (parent && request.startsWith('.')) {
      const candidate = path.resolve(path.dirname(parent.filename), `${request}.ts`)
      if (fs.existsSync(candidate)) return candidate
    }
    throw error
  }
}

Module._extensions['.ts'] = function transpileTypescript(module, filename) {
  const source = fs.readFileSync(filename, 'utf8')
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
      skipLibCheck: true,
    },
    fileName: filename,
  }).outputText
  module._compile(output, filename)
}

const {
  parseCorrectionJson,
  validateCorrectionJsonShape,
} = require(path.join(root, 'app/lib/correctionPrompt.ts'))

function assert(name, condition) {
  if (!condition) {
    console.error(`FAIL ${name}`)
    process.exitCode = 1
    return
  }
  console.log(`OK   ${name}`)
}

function validPayload(extra = {}) {
  return {
    simulacro_id: 'test',
    asignatura: 'Historia de España',
    nota_final: 7,
    feedback_general: 'Corrección clara y accionable.',
    fortalezas: ['Contextualiza bien.'],
    errores_principales: ['Falta una consecuencia.'],
    plan_repaso: [],
    desglose_bloques: [{
      numero_bloque: 'Ejercicio de curso',
      tema: 'La Segunda República',
      nota: 7,
      max_puntos: 10,
      puntos_conseguidos: 7,
      puntos_maximos: 10,
      porcentaje_logrado: 70,
      que_hizo_bien: 'Sitúa el periodo correctamente.',
      errores_detectados: ['Debe precisar las reformas.'],
      que_faltaba: 'Más causalidad.',
      correccion_detalle: 'Buen arranque, faltan relaciones causa-consecuencia.',
      solucion_orientativa: 'Explicar reformas, oposición y consecuencias.',
      consejo_para_mejorar: 'Ordena cronología y efectos.',
    }],
    resumen_por_bloque_tematico: [],
    ...extra,
  }
}

const perfectJson = JSON.stringify(validPayload())
const fencedJson = `\`\`\`json\n${perfectJson}\n\`\`\``
const wrappedJson = `Aquí va la corrección solicitada:\n${perfectJson}\nGracias.`
const optionalMissing = JSON.stringify(validPayload({ plan_repaso: undefined, resumen_por_bloque_tematico: undefined }))
const criticalMissing = JSON.stringify({ nota_final: 8, asignatura: 'Historia de España' })
const truncatedJson = '{"feedback_general":"ok","desglose_bloques":[{"correccion_detalle":"bien"'
const textualResponse = 'La respuesta está bastante bien, pero deberías ordenar mejor la cronología.'

const parsedPerfect = parseCorrectionJson(perfectJson)
assert('A JSON perfecto parsea', Boolean(parsedPerfect))
assert('A JSON perfecto valida', validateCorrectionJsonShape(parsedPerfect).valid)

const parsedFenced = parseCorrectionJson(fencedJson)
assert('B JSON en fence parsea', Boolean(parsedFenced))
assert('B JSON en fence valida', validateCorrectionJsonShape(parsedFenced).valid)

const parsedWrapped = parseCorrectionJson(wrappedJson)
assert('C texto breve con un objeto JSON inequívoco parsea', Boolean(parsedWrapped))
assert('C texto breve con un objeto JSON inequívoco valida', validateCorrectionJsonShape(parsedWrapped).valid)

const parsedOptionalMissing = parseCorrectionJson(optionalMissing)
assert('D campo opcional ausente parsea', Boolean(parsedOptionalMissing))
assert('D campo opcional ausente valida', validateCorrectionJsonShape(parsedOptionalMissing).valid)

const parsedCriticalMissing = parseCorrectionJson(criticalMissing)
const criticalValidation = validateCorrectionJsonShape(parsedCriticalMissing)
assert('E campo crítico ausente no valida', !criticalValidation.valid && criticalValidation.reason === 'missing_critical_fields')

const parsedTruncated = parseCorrectionJson(truncatedJson)
assert('F JSON truncado no se acepta como corrección válida', !validateCorrectionJsonShape(parsedTruncated).valid)

const parsedTextual = parseCorrectionJson(textualResponse)
assert('G respuesta completamente textual no inventa estructura', parsedTextual === null)
