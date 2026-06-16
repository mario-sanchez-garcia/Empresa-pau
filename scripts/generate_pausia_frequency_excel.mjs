import fs from "node:fs/promises";
import path from "node:path";
import { PDFParse } from "pdf-parse";

const ROOT = path.resolve(".");
const OUTPUT = path.join(ROOT, "PAUSIA_mapa_frecuencia_atomico_completo_final.xlsx");
const COMMUNITIES = ["Madrid", "Cataluña"];

function norm(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function level(probability) {
  if (probability >= 70) return "Crítica / Presencia Continua";
  if (probability >= 50) return "Muy Alta";
  if (probability >= 30) return "Alta";
  if (probability >= 15) return "Media";
  if (probability >= 5) return "Baja";
  if (probability > 0) return "Marginal / Testimonial";
  return "No Detectada en histórico";
}

function taxonomy() {
  const seed = [
    ["Matemáticas II", "Álgebra", "Matrices y determinantes", ["matriz", "matrices", "determinante", "rango"]],
    ["Matemáticas II", "Álgebra", "Sistemas lineales", ["sistema de ecuaciones", "discuta el sistema", "compatible"]],
    ["Matemáticas II", "Análisis", "Límites y continuidad", ["limite", "continuidad", "asintota"]],
    ["Matemáticas II", "Análisis", "Derivadas y optimización", ["derivada", "maximo", "minimo", "optimizar"]],
    ["Matemáticas II", "Análisis", "Integrales y áreas", ["integral", "area encerrada", "primitiva"]],
    ["Matemáticas II", "Geometría", "Rectas y planos", ["recta", "plano", "posicion relativa"]],
    ["Matemáticas II", "Probabilidad", "Distribución binomial y normal", ["binomial", "normal", "probabilidad"]],
    ["Historia de España", "Antiguo Régimen", "Sociedad estamental y reformismo borbónico", ["antiguo regimen", "borbones", "ilustracion", "reformismo borbonico"]],
    ["Historia de España", "Crisis liberal", "Guerra de Independencia y Constitución de 1812", ["guerra de independencia", "constitucion de 1812", "cadiz"]],
    ["Historia de España", "Siglo XIX", "Fernando VII e Isabel II", ["fernando vii", "isabel ii", "regencias"]],
    ["Historia de España", "Siglo XIX", "Sexenio Democrático y Restauración", ["sexenio democratico", "restauracion", "canovas"]],
    ["Historia de España", "Siglo XX", "Segunda República", ["segunda republica", "bienio", "frente popular"]],
    ["Historia de España", "Siglo XX", "Guerra Civil", ["guerra civil", "sublevacion", "bando republicano"]],
    ["Historia de España", "Siglo XX", "Franquismo", ["franquismo", "franco", "autarquia", "desarrollismo"]],
    ["Historia de España", "Democracia", "Transición y Constitución de 1978", ["transicion", "constitucion de 1978", "adolfo suarez"]],
    ["Historia de la Filosofía", "Antigua", "Platón: teoría de las Ideas", ["platon", "ideas", "mito de la caverna"]],
    ["Historia de la Filosofía", "Antigua", "Aristóteles: sustancia y causas", ["aristoteles", "sustancia", "causas"]],
    ["Historia de la Filosofía", "Moderna", "Descartes: método y cogito", ["descartes", "cogito", "duda metodica"]],
    ["Historia de la Filosofía", "Moderna", "Kant: conocimiento y ética", ["kant", "imperativo categorico", "critica de la razon"]],
    ["Historia de la Filosofía", "Contemporánea", "Nietzsche: crítica de la moral", ["nietzsche", "moral", "superhombre"]],
    ["Historia de la Filosofía", "Contemporánea", "Ortega: razón vital", ["ortega", "razon vital", "yo soy yo"]],
    ["Lengua Castellana y Literatura", "Comentario", "Tema, resumen y comentario crítico", ["tema del texto", "resumen", "comentario de texto"]],
    ["Lengua Castellana y Literatura", "Lengua", "Sintaxis de oración compleja", ["analisis sintactico", "oracion compuesta", "subordinada"]],
    ["Lengua Castellana y Literatura", "Lengua", "Morfología y formación de palabras", ["morfologia", "derivacion", "parasintesis"]],
    ["Lengua Castellana y Literatura", "Literatura", "Generación del 98 y Modernismo", ["generacion del 98", "modernismo", "unamuno"]],
    ["Lengua Castellana y Literatura", "Literatura", "Novecentismo, vanguardias y 27", ["generacion del 27", "vanguardias", "novecentismo"]],
    ["Inglés", "Reading", "Comprensión global y específica", ["reading", "according to the text", "true or false"]],
    ["Inglés", "Use of English", "Word formation", ["word formation", "complete the sentences", "rewrite"]],
    ["Inglés", "Use of English", "Connectors and grammar transformations", ["connectors", "reported speech", "passive voice"]],
    ["Inglés", "Writing", "Opinion essay / email", ["write", "essay", "email", "opinion"]],
    ["Biología", "Bioquímica", "Biomoléculas y metabolismo", ["glucidos", "lipidos", "proteinas", "metabolismo"]],
    ["Biología", "Genética", "Herencia mendeliana y genética molecular", ["adn", "arn", "mendel", "mutacion"]],
    ["Biología", "Inmunología", "Sistema inmunitario", ["anticuerpo", "linfocito", "inmunidad"]],
    ["Biología", "Ecología", "Ecosistemas y evolución", ["ecosistema", "evolucion", "seleccion natural"]],
    ["Física", "Campo gravitatorio", "Gravitación y órbitas", ["campo gravitatorio", "orbita", "ley de gravitacion"]],
    ["Física", "Electromagnetismo", "Campo eléctrico y magnético", ["campo electrico", "campo magnetico", "induccion"]],
    ["Física", "Ondas", "Movimiento ondulatorio", ["onda", "interferencia", "difraccion"]],
    ["Física", "Física moderna", "Cuántica y nuclear", ["efecto fotoelectrico", "nuclear", "radiactividad"]],
    ["Química", "Equilibrio", "Constantes Kc/Kp y Le Châtelier", ["kc", "kp", "le chatelier", "equilibrio quimico"]],
    ["Química", "Ácido-base", "pH, Ka/Kb e hidrólisis", ["ph", "ka", "kb", "hidrolisis", "acido base"]],
    ["Química", "Redox", "Ajuste redox y potenciales", ["redox", "potencial", "electrolisis", "oxidacion"]],
    ["Química", "Orgánica", "Isomería y reacciones orgánicas", ["isomeria", "organica", "alcohol", "ester"]],
    ["Química", "Termoquímica", "Entalpía y energía libre", ["entalpia", "energia libre", "gibbs"]],
    ["Química", "Cinética", "Velocidad de reacción", ["cinetica", "velocidad de reaccion", "energia de activacion"]],
  ];
  const rows = [];
  let id = 1;
  for (const comunidad of COMMUNITIES) {
    for (const [materia, bloque, microconcepto, sinonimos] of seed) {
      rows.push({
        conceptId: `MC-${String(id).padStart(4, "0")}`,
        comunidad,
        materia,
        bloque,
        microconcepto,
        sinonimos,
        pesoProducto: ["Matemáticas II", "Historia de España", "Inglés"].includes(materia) ? 90 : 75,
        ajusteTemario: 90,
      });
      id += 1;
    }
  }
  return rows;
}

async function listPdfs(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await listPdfs(full));
    if (entry.isFile() && entry.name.toLowerCase().endsWith(".pdf")) out.push(full);
  }
  return out.sort();
}

function detectExam(file) {
  const n = norm(file.split(path.sep).join("/"));
  const year = Number(n.match(/(20\d{2}|19\d{2})/)?.[1] ?? 0);
  return {
    materia: n.includes("quimica") ? "Química" : n.includes("historia") ? "Historia de España" : "Desconocida",
    comunidad: n.includes("cataluna") || n.includes("catalunya") ? "Cataluña" : "Madrid",
    año: year,
    convocatoria: n.includes("extraordinaria") ? "Extraordinaria" : "Ordinaria",
    variante: n.includes("lunes") ? "lunes" : n.includes("martes") ? "martes" : "",
  };
}

function splitSegments(text) {
  const parts = text
    .split(/(?=\b(?:Pregunta|Ejercicio|Exercici|Option|Opcion|Apartado)\s+\d|\n\s*\d+\.)/gi)
    .map((part) => part.replace(/\s+/g, " ").trim())
    .filter((part) => part.length > 80);
  return (parts.length ? parts : [text.replace(/\s+/g, " ").trim()]).slice(0, 40);
}

async function extractPdf(file) {
  const data = await fs.readFile(file);
  const parser = new PDFParse({ data });
  try {
    const result = await parser.getText();
    return { text: result.text ?? "", extractor: "pdf-parse", pages: result.total ?? "" };
  } finally {
    await parser.destroy();
  }
}

function escXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function colName(index) {
  let name = "";
  let n = index + 1;
  while (n > 0) {
    const r = (n - 1) % 26;
    name = String.fromCharCode(65 + r) + name;
    n = Math.floor((n - 1) / 26);
  }
  return name;
}

function sheetXml(rows) {
  const body = rows.map((row, r) => {
    const cells = row.map((value, c) => {
      const ref = `${colName(c)}${r + 1}`;
      if (typeof value === "number" && Number.isFinite(value)) return `<c r="${ref}"><v>${value}</v></c>`;
      return `<c r="${ref}" t="inlineStr"><is><t>${escXml(value)}</t></is></c>`;
    }).join("");
    return `<row r="${r + 1}">${cells}</row>`;
  }).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetData>${body}</sheetData><autoFilter ref="A1:${colName((rows[0]?.length ?? 1) - 1)}${Math.max(rows.length, 1)}"/></worksheet>`;
}

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = Array.from({ length: 256 }, (_, n) => {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      return c >>> 0;
    });
  }
  let c = 0xffffffff;
  for (const b of buf) c = table[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function u16(n) { const b = Buffer.alloc(2); b.writeUInt16LE(n); return b; }
function u32(n) { const b = Buffer.alloc(4); b.writeUInt32LE(n); return b; }

function makeZip(files) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const file of files) {
    const name = Buffer.from(file.name.replaceAll("\\", "/"));
    const data = Buffer.isBuffer(file.data) ? file.data : Buffer.from(file.data, "utf8");
    const crc = crc32(data);
    const local = Buffer.concat([
      u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), name, data,
    ]);
    const central = Buffer.concat([
      u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), name,
    ]);
    locals.push(local);
    centrals.push(central);
    offset += local.length;
  }
  const centralDir = Buffer.concat(centrals);
  const end = Buffer.concat([u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(centralDir.length), u32(offset), u16(0)]);
  return Buffer.concat([...locals, centralDir, end]);
}

function rowsFromObjects(objects) {
  if (!objects.length) return [["Sin datos"]];
  const headers = Object.keys(objects[0]);
  return [headers, ...objects.map((obj) => headers.map((header) => obj[header]))];
}

async function writeXlsx(sheets) {
  const sheetNames = Object.keys(sheets);
  const files = [
    { name: "[Content_Types].xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${sheetNames.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}</Types>` },
    { name: "_rels/.rels", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>` },
    { name: "xl/workbook.xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheetNames.map((name, i) => `<sheet name="${escXml(name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("")}</sheets></workbook>` },
    { name: "xl/_rels/workbook.xml.rels", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheetNames.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("")}</Relationships>` },
  ];
  sheetNames.forEach((name, i) => files.push({ name: `xl/worksheets/sheet${i + 1}.xml`, data: sheetXml(sheets[name]) }));
  await fs.writeFile(OUTPUT, makeZip(files));
}

const concepts = taxonomy();
const pdfs = await listPdfs(path.join(ROOT, "public"));
const exams = [];
const baseRows = [];
const audit = [];
const presence = new Map();

for (const file of pdfs) {
  const meta = detectExam(file);
  const rel = path.relative(ROOT, file);
  const examId = `${meta.materia}|${meta.comunidad}|${meta.año}|${meta.convocatoria}|${path.basename(file)}`;
  try {
    const { text, extractor, pages } = await extractPdf(file);
    const ntext = norm(text);
    const matches = concepts.filter((concept) => concept.materia === meta.materia && concept.comunidad === meta.comunidad && concept.sinonimos.some((s) => ntext.includes(norm(s))));
    for (const concept of matches) {
      const key = `${concept.comunidad}|${concept.materia}|${concept.conceptId}`;
      if (!presence.has(key)) presence.set(key, new Set());
      presence.get(key).add(examId);
    }
    exams.push({ ...meta, "ID Examen": examId, "PDF": rel, "Caracteres": text.length, "Páginas": pages, "Extractor": extractor });
    const segment = splitSegments(text)[0]?.slice(0, 900) ?? "";
    if (matches.length) {
      for (const concept of matches) {
        baseRows.push({
          "ID Examen": examId,
          "Materia": meta.materia,
          "Comunidad": meta.comunidad,
          "Año": meta.año,
          "Convocatoria": meta.convocatoria,
          "Variante": meta.variante,
          "Bloque": concept.bloque,
          "Microconcepto Detectado": concept.microconcepto,
          "Pregunta Tipo Textual": segment,
          "PDF de Origen": rel,
          "Respuesta Esperada": "No disponible en PDF; mantener soluciones orientativas de datos TS cuando existan.",
        });
      }
    } else {
      baseRows.push({ "ID Examen": examId, "Materia": meta.materia, "Comunidad": meta.comunidad, "Año": meta.año, "Convocatoria": meta.convocatoria, "Variante": meta.variante, "Bloque": "", "Microconcepto Detectado": "Sin coincidencia controlada", "Pregunta Tipo Textual": segment, "PDF de Origen": rel, "Respuesta Esperada": "No disponible" });
    }
    audit.push({ "Tipo": "PDF_PROCESADO", "Ruta": rel, "Detalle": `${extractor}; paginas=${pages}; chars=${text.length}; conceptos=${matches.length}` });
  } catch (error) {
    audit.push({ "Tipo": "ERROR_PDF", "Ruta": rel, "Detalle": error.message });
  }
}

const denominators = new Map();
for (const exam of exams) {
  const key = `${exam.Comunidad ?? exam.comunidad}|${exam.Materia ?? exam.materia}`;
  denominators.set(key, (denominators.get(key) ?? 0) + 1);
}

const ranking = concepts.map((concept) => {
  const denom = denominators.get(`${concept.comunidad}|${concept.materia}`) ?? 0;
  const hits = presence.get(`${concept.comunidad}|${concept.materia}|${concept.conceptId}`)?.size ?? 0;
  const probability = denom ? Math.round((hits / denom) * 10000) / 100 : 0;
  const score = Math.round((probability * 0.6 + concept.pesoProducto * 0.25 + concept.ajusteTemario * 0.15) * 100) / 100;
  return {
    "Concept ID": concept.conceptId,
    "Comunidad": concept.comunidad,
    "Materia": concept.materia,
    "Bloque": concept.bloque,
    "Microconcepto atómico": concept.microconcepto,
    "Apariciones": hits,
    "N Exámenes Base Materia": denom,
    "Probabilidad Empírica %": probability,
    "Nivel PAUSIA": level(probability),
    "Peso Estratégico Producto": concept.pesoProducto,
    "Ajuste Temario": concept.ajusteTemario,
    "Score PAUSIA": score,
    "Sinónimos / patrones": concept.sinonimos.join("; "),
  };
}).sort((a, b) => b["Score PAUSIA"] - a["Score PAUSIA"] || b["Probabilidad Empírica %"] - a["Probabilidad Empírica %"]);

const panel = [
  { "Métrica": "Generado", "Valor": new Date().toISOString() },
  { "Métrica": "PDFs encontrados", "Valor": pdfs.length },
  { "Métrica": "PDFs procesados", "Valor": exams.length },
  { "Métrica": "Microconceptos en temario", "Valor": concepts.length },
  { "Métrica": "Regla probabilidad", "Valor": "exámenes con aparición / total exámenes materia-comunidad * 100" },
  { "Métrica": "Escala", "Valor": "Crítica >=70; Muy Alta 50-69.9; Alta 30-49.9; Media 15-29.9; Baja 5-14.9; Marginal >0<5; No Detectada 0" },
  { "Métrica": "Regla score", "Valor": "60% probabilidad + 25% peso estratégico + 15% ajuste temario" },
];
const temario = ranking.map((r) => ({ "Concept ID": r["Concept ID"], "Comunidad": r.Comunidad, "Materia": r.Materia, "Bloque": r.Bloque, "Microconcepto atómico": r["Microconcepto atómico"], "Nivel PAUSIA": r["Nivel PAUSIA"], "Cobertura histórica": r.Apariciones > 0 ? "Detectada" : "No detectada / sin base PDF" }));
const teoria = temario.map((r) => ({ ...r, "Trigger": "Desplegar teoría si probabilidad >= 15% o score >= 65", "Secuencia": "Definición -> ejemplo PAU -> plantilla -> práctica" }));
const plantillas = [
  { "Plantilla": "Comentario histórico", "Criterio operativo": "Identificar fuente, contexto, idea principal, desarrollo y conclusión." },
  { "Plantilla": "Problema científico", "Criterio operativo": "Datos, fórmula, sustitución, unidades, interpretación." },
  { "Plantilla": "Writing Inglés", "Criterio operativo": "Plan, tesis, conectores, desarrollo, cierre y revisión gramatical." },
  { "Plantilla": "Filosofía", "Criterio operativo": "Tesis del autor, conceptos clave, relación con sistema y valoración crítica." },
];
const cambios = exams.map((e) => ({ "Materia": e.materia, "Comunidad": e.comunidad, "Año": e.año, "Convocatoria": e.convocatoria, "Variante": e.variante, "PDF": e.PDF, "Cambio formato detectado": e.variante ? "Variante/día explícito" : "Revisión manual" }));
const prioridad = ranking.slice(0, 40).map((r, i) => ({ "Prioridad MVP": i + 1, "Comunidad": r.Comunidad, "Materia": r.Materia, "Bloque": r.Bloque, "Microconcepto atómico": r["Microconcepto atómico"], "Score PAUSIA": r["Score PAUSIA"], "Nivel PAUSIA": r["Nivel PAUSIA"] }));
audit.push({ "Tipo": "ENTORNO", "Ruta": "scripts/generate_pausia_frequency_excel.py", "Detalle": "Python no estaba disponible en PATH; se generó este XLSX con runner Node equivalente y se conserva el script Python solicitado." });
audit.push({ "Tipo": "FUENTE_TEMARIO", "Ruta": "docs/camino-pau/camino-pau-curriculum-revisado.xlsx", "Detalle": "Documento curricular interno localizado; no se adjuntó documento oficial externo de temario. Se usa temario atómico controlado y se deja todo concepto sin PDF con 0%." });

await writeXlsx({
  "00_PANEL": rowsFromObjects(panel),
  "01_RANKING_PAUSIA": rowsFromObjects(ranking),
  "02_BASE_EXAMENES": rowsFromObjects(baseRows),
  "03_TEMARIO_MAPA": rowsFromObjects(temario),
  "04_TEORIA_DESPLEGABLE": rowsFromObjects(teoria),
  "05_PLANTILLAS": rowsFromObjects(plantillas),
  "06_CAMBIOS_FORMATO": rowsFromObjects(cambios),
  "07_PRIORIDAD_MVP": rowsFromObjects(prioridad),
  "_AUDIT": rowsFromObjects(audit),
});

console.log(`OK ${OUTPUT}`);
console.log(`PDFs encontrados=${pdfs.length} procesados=${exams.length} conceptos=${concepts.length} filas_base=${baseRows.length}`);
