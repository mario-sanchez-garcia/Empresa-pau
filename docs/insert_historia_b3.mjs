// Uso: node --env-file=.env.local docs/insert_historia_b3.mjs
// Bloque 3 — Reinos Medievales: flashcards 21-28
// Partes 8, 9, 10 y 11 de los apuntes de Diego

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const SUBJECT = 'historia_espana'

const cards = [

  // ─── PARTE 8: NÚCLEOS DE RESISTENCIA CRISTIANA ───────────────────────────────

  {
    sort_order: 21,
    block_key: 'Reinos Medievales Cristianos',
    block_slug: 'reinos-medievales',
    title: 'El Núcleo Astur-Leonés: De Covadonga al Reino de León',
    concept_markdown: `## El Núcleo Astur-Leonés (Siglos VIII–X)

Nació en la cordillera Cantábrica, una zona montañosa de difícil acceso que los musulmanes nunca controlaron eficazmente.

### Origen: La Batalla de Covadonga (722)
El noble visigodo **Pelayo** lideró a los pobladores locales y derrotó a una expedición de castigo musulmana en la **Batalla de Covadonga (722)**. Este hecho mítico —probablemente una emboscada en un desfiladero más que una gran batalla— marca el inicio tradicional de la *Reconquista*.

Los historiadores debaten si fue una victoria real o un relato legendario, pero su importancia simbólica es indiscutible: los cronistas medievales lo convirtieron en el momento fundacional de la resistencia cristiana.

### Consolidación del Reino de Asturias
- **Alfonso I** expandió el territorio hacia el oeste y sur, creando un "desierto estratégico" en la cuenca del Duero (zona despoblada entre el Islam y el reino)
- **Alfonso II** construyó Oviedo como capital y descubrió —o promovió el descubrimiento de— la tumba del Apóstol **Santiago en Compostela**, dinamizando las peregrinaciones europeas

### El Traslado a León (914)
Con el avance de la ocupación hacia el valle del Duero, el rey **García I** trasladó la corte a **León**, pasando el estado a denominarse **Reino de León**. La capital se desplaza al sur a medida que avanza la repoblación.

### La Independencia de Castilla
La frontera oriental del reino, expuesta a las *razzias* musulmanas, se fortificó con castillos. Inicialmente gobernada por condes dependientes de León, el conde **Fernán González** (siglo X) logró la independencia de facto del **Condado de Castilla**, convertida en herencia de su familia.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Cómo surgió el núcleo de resistencia astur-leonés? ¿Qué importancia tuvo la batalla de Covadonga?*

**Estructura:**
1. Contexto geográfico: Cordillera Cantábrica como refugio inexpugnable
2. Covadonga (722): Pelayo → valor simbólico sobre el militar real
3. Consolidación: Alfonso I (desierto estratégico), Alfonso II (Santiago de Compostela)
4. Traslado a León (914) → refleja avance hacia el sur
5. Fernán González: independencia del Condado de Castilla → precursor del futuro reino más poderoso

**Dato clave:** la neopolítica de *"desierto estratégico"* —despoblar la cuenca del Duero para crear tierra de nadie— explica la lentitud inicial de la Reconquista.`,
    practice_prompt: 'Describe el origen y la evolución del núcleo de resistencia astur-leonés desde la batalla de Covadonga hasta la independencia del Condado de Castilla. ¿Por qué se trasladó la capital a León en 914?',
    alert_markdown: '⚠️ **Covadonga (722)** es el inicio SIMBÓLICO de la Reconquista. No fue una gran batalla sino una escaramuza. Su importancia es ideológica, no militar.',
  },

  {
    sort_order: 22,
    block_key: 'Reinos Medievales Cristianos',
    block_slug: 'reinos-medievales',
    title: 'Los Núcleos Pirenaicos: Navarra, Aragón y los Condados Catalanes',
    concept_markdown: `## Los Núcleos Pirenaicos y la Marca Hispánica

Surgieron al amparo del **Imperio Carolingio** (Carlomagno), que creó una franja fronteriza fortificada al sur de los Pirineos denominada **Marca Hispánica** para contener el avance islámico hacia Francia.

### El Núcleo Navarro (Reino de Pamplona)
La dinastía **Arista** expulsó a los gobernadores francos en el siglo IX, naciendo el **Reino de Pamplona** (luego Navarra). Vivió su máximo esplendor con **Sancho III el Mayor (1004-1035)**, quien unificó bajo su control político casi todo el norte cristiano (Navarra, Castilla, Aragón y los condados catalanes).

A su muerte, dividió el reino entre sus hijos como herencia **patrimonial** (como si fuera una finca privada), lo que fragmentó de nuevo el norte cristiano:
- Su hijo García heredó Navarra
- Fernando I heredó Castilla (y pronto también León)
- Ramiro I heredó Aragón

### El Núcleo Aragonés
Originado en los valles pirenaicos (ríos Aragón, Sobrarbe y Ribagorza) como condados tutelados por los francos. Tras la división de Sancho III, **Ramiro I** se convirtió en el **primer rey de Aragón (1035)**.

### Los Condados Catalanes
El conde **Wifredo el Velloso** unificó los condados de la Marca Hispánica oriental bajo la hegemonía de **Barcelona**, haciendo el cargo hereditario. En el siglo X, el conde **Borrell II** se negó a renovar el vasallaje al rey franco, declarando la **independencia real de los Condados Catalanes**.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fue la Marca Hispánica? Describe el origen de los reinos de Navarra, Aragón y los condados catalanes.*

**Estructura:**
1. Marca Hispánica: creación carolingia → franja defensiva anti-islámica
2. Navarra: Aristas → independencia de los francos en s. IX → Sancho III el Mayor (punto álgido)
3. División de Sancho III: clave para entender la fragmentación del norte (Navarra, Castilla, Aragón)
4. Aragón: Ramiro I (1035) = primer rey
5. Cataluña: Wifredo el Velloso → hereditario; Borrell II → independencia real del vasallaje franco

**Sancho III el Mayor** es el personaje clave: unifica el norte y luego lo divide. Ese error patrimonial explica siglos de rivalidad entre los reinos.`,
    practice_prompt: 'Explica el origen de los núcleos de resistencia pirenaicos. ¿Qué fue la Marca Hispánica? ¿Qué papel tuvo Sancho III el Mayor y cuáles fueron las consecuencias de la división de su reino?',
    alert_markdown: null,
  },

  // ─── PARTE 9: LA RECONQUISTA Y REPOBLACIÓN ───────────────────────────────────

  {
    sort_order: 23,
    block_key: 'Reinos Medievales Cristianos',
    block_slug: 'reinos-medievales',
    title: 'La Reconquista: Los Grandes Hitos de la Expansión Cristiana',
    concept_markdown: `## Los Grandes Hitos de la Expansión Militar Cristiana (Siglos XI–XIII)

A partir del siglo XI, el avance cristiano se aceleró de forma decisiva aprovechando la debilidad de las Taifas:

### Siglo XI: La Caída de Toledo (1085)
**Alfonso VI** de Castilla y León conquista la estratégica ciudad de **Toledo (1085)**, llevando la frontera hasta el río Tajo. Toledo era la antigua capital visigoda y su conquista tuvo un enorme simbolismo. Esta victoria alarmó al mundo islámico y provocó la llamada a los Almorávides.

### Siglo XII: Zaragoza y los Tratados de Reparto
**Alfonso I el Batallador** (Aragón) toma **Zaragoza (1118)**, incorporando el valle del Ebro a la Corona aragonesa.

Se firman tratados de delimitación entre los reinos para evitar conflictos de conquista:
- **Tratado de Cazola (1179):** entre Castilla y Aragón, que reparte las futuras zonas de conquista del sur

### Siglo XIII: El Gran Avance (La Reconquista Definitiva)
Tras la victoria aliada en **Las Navas de Tolosa (1212)**, Al-Ándalus quedó militarmente indefenso:

- **Fernando III el Santo** unificó definitivamente Castilla y León (1230) y conquistó el valle del Guadalquivir: **Córdoba (1236)**, **Sevilla (1248)** y Murcia
- **Jaime I el Conquistador** (Aragón) conquistó las **Islas Baleares (1229-1235)** y el **Reino de Valencia (1238)**

Resultado: al finalizar el siglo XIII, solo quedaba el Reino Nazarí de Granada, que sobreviviría hasta 1492.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *Describe los grandes hitos de la Reconquista. ¿Por qué el siglo XIII fue decisivo?*

**Línea del tiempo obligatoria:**
- 1085: Toledo → Alfonso VI → frontera al Tajo
- 1118: Zaragoza → Alfonso I → valle del Ebro
- 1212: **Las Navas de Tolosa** → punto de inflexión definitivo
- 1230: Unión Castilla-León → Fernando III
- 1236-1248: Córdoba y Sevilla → Fernando III
- 1229-1238: Baleares y Valencia → Jaime I el Conquistador
- 1492: Granada → Reyes Católicos (fin de la Reconquista)

El siglo XIII es decisivo porque en 50 años se conquista más territorio que en los 3 siglos anteriores. Las Navas de Tolosa lo hace posible.`,
    practice_prompt: 'Describe los principales hitos de la Reconquista en los siglos XI, XII y XIII. ¿Por qué la Batalla de las Navas de Tolosa (1212) fue un punto de inflexión? ¿Qué territorios conquistaron Fernando III y Jaime I?',
    alert_markdown: null,
  },

  {
    sort_order: 24,
    block_key: 'Reinos Medievales Cristianos',
    block_slug: 'reinos-medievales',
    title: 'Los Modelos de Repoblación (Siglos VIII–XIII)',
    concept_markdown: `## Los Cuatro Modelos de Repoblación

La forma en que se estructuró la propiedad de la tierra dependió de **cuándo** se conquistó y de la densidad de población existente. Es uno de los temas más importantes de PAU.

### A) Repoblación Libre o Presura (Siglos VIII–X)
- **Zonas:** Valle del Duero y Pirineos (tierras llanas despobladas, zona fronteriza peligrosa)
- **Mecanismo:** Un campesino o monje ocupaba una tierra despoblada (*aprisio* o *presura*) y al cultivarla pasaba a ser su propietario (derecho romano)
- **Resultado:** Predominio de la **pequeña y mediana propiedad** familiar

### B) Repoblación Concejil o por Fueros (Siglos XI–XII)
- **Zonas:** Valles del Tajo y del Ebro (importantes ciudades islámicas reconquistadas)
- **Mecanismo:** El rey dividía el territorio en *alfoces* (municipios). Para atraer población, otorgaba un **Fuero** o *Carta Puebla*: código de leyes con inmensos privilegios (exenciones fiscales, autogobierno, libertades personales)
- **Resultado:** Predominio de la **propiedad mediana** y comunal; municipios con amplias libertades

### C) Repoblación por Órdenes Militares (Primera mitad S. XIII)
- **Zonas:** La Mancha, Extremadura, cuenca del Guadiana (extensas y peligrosas)
- **Mecanismo:** El rey encomendó la defensa y colonización a las **Órdenes Militares** (Santiago, Calatrava, Alcántara, Montesa): monjes-soldados que actuaban como señores feudales
- **Resultado:** Inmensos **latifundios** orientados a la **ganadería ovina**

### D) Repoblación por Repartimiento (Segunda mitad S. XIII)
- **Zonas:** Valle del Guadalquivir, Murcia, Valencia, Baleares (ricas ciudades musulmanas)
- **Mecanismo:** Los bienes de las ciudades conquistadas se distribuían entre los participantes según su rango en los *Libros de Repartimiento*
- **Resultado:** Los nobles y la Iglesia recibieron grandes propiedades (**donadíos**), consolidando el **latifundismo** andaluz`,
    worked_example_markdown: `**Pregunta tipo PAU:** *Describe los modelos de repoblación de la Reconquista. ¿Por qué existe el problema del latifundismo en Andalucía?*

**Tabla resumen (memorizar):**

| Modelo | Época | Zona | Propiedad resultante |
|---|---|---|---|
| Presura | S. VIII-X | Valle del Duero | Pequeña/mediana |
| Fueros/Concejil | S. XI-XII | Tajo y Ebro | Mediana/comunal |
| Órdenes Militares | 1.ª mitad S. XIII | La Mancha, Extremadura | Latifundio ganadero |
| Repartimiento | 2.ª mitad S. XIII | Guadalquivir, Valencia | Latifundio nobiliario |

**Clave:** el latifundismo andaluz no es un accidente: se originó en el modelo de repartimiento del siglo XIII, cuando las tierras se dieron a nobles por sus méritos militares.`,
    practice_prompt: 'Explica los cuatro modelos de repoblación de la Reconquista. ¿Qué relación existe entre el modelo de repoblación por repartimiento y el actual latifundismo de Andalucía y Extremadura?',
    alert_markdown: '⚠️ **Los cuatro modelos de repoblación** es uno de los temas más preguntados en PAU Historia de España. Aprende la tabla: zona geográfica + mecanismo + resultado de propiedad.',
  },

  // ─── PARTE 10: MODELOS DE ESTADO BAJOMEDIEVAL ────────────────────────────────

  {
    sort_order: 25,
    block_key: 'Reinos Medievales Cristianos',
    block_slug: 'reinos-medievales',
    title: 'Corona de Castilla vs. Corona de Aragón: Dos Modelos de Estado',
    concept_markdown: `## Modelos de Estado en la Baja Edad Media: Castilla y Aragón

Durante los siglos XIV y XV, las dos grandes potencias cristianas peninsulares estructuraron modelos políticos **radicalmente opuestos**.

### La Corona de Castilla: El Autoritarismo Monárquico

En Castilla se impuso un modelo de Estado **centralizado** donde la Corona tendió al fortalecimiento del poder absoluto del rey, debilitando a la nobleza y a las Cortes.

**Fundamento político:**
- El monarca ejercía el poder de **origen divino** de manera directa
- Se unificó el derecho en todo el territorio mediante las **Partidas** de Alfonso X y el **Ordenamiento de Alcalá (1348)** (triunfo del derecho romano autoritario)
- Las **Cortes de Castilla**: asambleas de los tres estamentos cuya función principal quedó reducida a **votar impuestos** solicitados por el rey
- **Instituciones**: *Consejo Real* (asesoramiento), *Audiencia o Chancillería* (tribunal supremo), **Corregidores** (delegados del rey en los municipios)

---

### La Corona de Aragón: El Pactismo Político

A diferencia de Castilla, la Corona de Aragón era una **confederación de estados** independientes (Aragón, Valencia, Mallorca, Principado de Cataluña) que solo compartían al mismo monarca. Se impuso el **pactismo**:

- El rey **no podía legislar ni imponer impuestos sin el consentimiento** de las Cortes de cada reino
- Cada reino tenía sus propias leyes, Cortes, instituciones y fueros
- Existía la figura del **Justicia Mayor de Aragón**: magistrado que podía proteger a los ciudadanos frente a los abusos del rey
- Las Cortes eran **cuatro** (Aragón, Cataluña, Valencia, Mallorca), reuniéndose por separado`,
    worked_example_markdown: `**Pregunta tipo PAU:** *Compara los modelos políticos de Castilla y Aragón en la Baja Edad Media.*

**Tabla comparativa (fundamental para PAU):**

| Aspecto | **Castilla** | **Aragón** |
|---|---|---|
| Sistema | Autoritarismo monárquico | Pactismo político |
| Cortes | Consultivas (votan impuestos) | Legislativas (poder real) |
| Leyes | Ordenamiento de Alcalá (1348) | Fueros propios de cada reino |
| Estructura | Reino unificado | Confederación de estados |
| Institución clave | Corregidores | Justicia Mayor de Aragón |

Este contraste es esencial para entender la Unión de los Reyes Católicos (1469): no fue una unión política real sino solo dinástica, porque cada Corona mantuvo su propio sistema.`,
    practice_prompt: 'Describe y compara los modelos políticos de la Corona de Castilla y la Corona de Aragón en la Baja Edad Media. ¿Qué era el pactismo aragonés y en qué se diferenciaba del autoritarismo castellano?',
    alert_markdown: null,
  },

  // ─── PARTE 11: CRISIS DE LOS SIGLOS XIV-XV ───────────────────────────────────

  {
    sort_order: 26,
    block_key: 'Reinos Medievales Cristianos',
    block_slug: 'reinos-medievales',
    title: 'La Crisis del Siglo XIV: La Peste Negra de 1348',
    concept_markdown: `## La Crisis Demográfica y Económica de los Siglos XIV y XV

Los siglos XIV y XV representaron el fin de la expansión medieval, caracterizándose por una profunda crisis estructural que combinó factores demográficos, económicos y sociales.

### La Peste Negra (1348)

La Península ibérica sufrió una catastrófica pérdida de población por la combinación de tres factores encadenados:
1. Las **malas cosechas** provocadas por el enfriamiento climático de la "Pequeña Edad de Hielo"
2. Las continuas **guerras civiles** que arruinaron el campo
3. Sobre todo, la epidemia de **Peste Negra (1348)**

**Impacto:** Se calcula que la población peninsular disminuyó entre un **25% y un 40%**. Cataluña perdió casi un tercio de sus habitantes. Ciudades enteras quedaron semivacías.

**Consecuencias directas:**
- Despoblación de campos y abandono de aldeas
- Escasez extrema de **mano de obra agrícola** → los campesinos supervivientes tienen más poder de negociación
- Los señores feudales, para mantener sus rentas, endurece las condiciones feudales

### La Crisis Económica Diferenciada

- **Castilla:** la Corona favoreció la **ganadería ovina trashumante** (oveja merina) frente a la agricultura, ya que requería menos mano de obra. Se fortaleció la **Mesta** (gremio de ganaderos, creado por Alfonso X), convirtiendo la exportación de lana hacia Flandes en el motor económico castellano
- **Aragón/Cataluña:** sufrió el colapso del comercio mediterráneo. En Barcelona estalló una grave crisis financiera (quiebra de la banca pública) y conflictos entre la *Biga* (oligarquía) y la *Busca* (artesanos)`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Cuáles fueron las causas y consecuencias de la crisis del siglo XIV en la Península Ibérica?*

**Estructura:**
1. Triple causa: malas cosechas + guerras + Peste Negra
2. Magnitud: 25-40% de pérdida de población → dato impactante que justifica la gravedad
3. Consecuencias económicas diferenciadas:
   - Castilla: ganadería ovina + Mesta → exportación de lana → "modelo atlántico"
   - Aragón: colapso mediterráneo → crisis bancaria → conflicto social
4. Consecuencia social: enduramiento del feudalismo → conflictividad campesina

**La Mesta** es una institución clave: el gremio de ganaderos trashumantes que define la economía castellana medieval y explica el latifundismo.`,
    practice_prompt: 'Explica las causas y consecuencias de la Peste Negra de 1348 en la Península Ibérica. ¿Qué estrategias adoptaron Castilla y Aragón para hacer frente a la crisis económica del siglo XIV?',
    alert_markdown: '⚠️ La **Mesta** = asociación de ganaderos trashumantes de Castilla, clave para entender la economía medieval castellana. No confundir con una institución política.',
  },

  {
    sort_order: 27,
    block_key: 'Reinos Medievales Cristianos',
    block_slug: 'reinos-medievales',
    title: 'Conflictividad Social del Siglo XV: Revueltas y Pogromos de 1391',
    concept_markdown: `## Conflictividad Social de los Siglos XIV y XV

La pérdida de rentas feudales por la falta de campesinos llevó a la nobleza a endurecer las condiciones feudales mediante el abuso de los **"malos usos"** (prestaciones que los señores imponían a los campesinos). Esto provocó masivas rebeliones:

### Las Revueltas Campesinas

**Rebelión Irmandiña en Galicia (s. XV):** campesinos gallegos se levantaron contra los abusos de los señores feudales, destruyendo decenas de castillos nobiliarios antes de ser aplastados.

**Guerra de los Remensas en Cataluña (s. XV):** los *payeses de remensa* (campesinos sujetos a la servidumbre) lucharon por abolir la servidumbre y los **seis malos usos** (derechos arbitrarios de los señores). Fue la guerra campesina más importante de la Península. Se resolvió con la **Sentencia Arbitral de Guadalupe (1486)**: Fernando el Católico abolió los malos usos a cambio de una indemnización económica a los señores.

### Los Pogromos de 1391

El descontento social y el fanatismo religioso se unieron para provocar **asaltos violentos a las juderías** (barrios judíos) de las principales ciudades: Sevilla, Córdoba, Toledo, Valencia, Barcelona.

Miles de judíos fueron **obligados a convertirse al cristianismo** bajo amenaza de muerte (origen de los *"conversos"* o *"cristianos nuevos"*). Esta conversión forzosa masiva creó el problema de los **judaizantes**: conversos sospechosos de seguir practicando el judaísmo en secreto. Esto será el pretexto principal para la creación de la **Inquisición española en 1478**.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Cuáles fueron las principales manifestaciones de conflictividad social en la Península Ibérica durante los siglos XIV y XV?*

**Tres bloques de respuesta:**
1. **Causa común:** crisis feudal → señores endurece condiciones → campesinado se rebela
2. **Revueltas campesinas:** Irmandiños (Galicia) y Remensas (Cataluña) → la más importante es la Guerra de los Remensas, resuelta con la Sentencia de Guadalupe (1486)
3. **Pogromos de 1391:** violencia antijudía → conversiones forzadas → creación del problema *converso* → antecedente directo de la Inquisición (1478)

**Conexión cronológica:** 1391 (pogromos) → 1478 (Inquisición) → 1492 (expulsión de los judíos). Tres pasos del mismo proceso.`,
    practice_prompt: 'Describe las principales revueltas sociales del siglo XV en la Península Ibérica: la Rebelión Irmandiña, la Guerra de los Remensas y los pogromos de 1391. ¿Cuáles fueron sus causas y consecuencias?',
    alert_markdown: null,
  },

  {
    sort_order: 28,
    block_key: 'Reinos Medievales Cristianos',
    block_slug: 'reinos-medievales',
    title: 'Las Guerras Civiles y la Instauración de la Dinastía Trastámara',
    concept_markdown: `## Las Guerras Civiles y la Dinastía Trastámara

### La Guerra Civil Castellana (1366-1369)

En Castilla estalló la Guerra Civil entre:
- **Pedro I "el Cruel"**: rey legítimo, apoyado por los burgueses y algunos nobles
- **Enrique de Trastámara**: hermanastro bastardo del rey, apoyado por la alta nobleza y Francia

Pedro I fue **asesinado** personalmente por su hermanastro en Montiel (1369). Enrique II accedió al trono como el primer rey de la **dinastía Trastámara**, pagando su deuda con la nobleza mediante las **"mercedes enriqueñas"**: donaciones masivas de tierras y privilegios que convirtieron a la alta nobleza castellana en el grupo más poderoso de Europa.

Este "precio" de la victoria explica la debilidad de la monarquía castellana frente a la nobleza durante todo el siglo XV.

### El Compromiso de Caspe (1412)

A la muerte sin herederos de **Martín I el Humano** (último rey de la línea directa aragonesa), se produjo una crisis sucesoria en la Corona de Aragón. Para evitar una guerra civil, los representantes de los tres reinos de la Corona se reunieron en **Caspe** y, mediante un proceso arbitral, eligieron como nuevo rey a **Fernando I de Antequera** (de la familia Trastámara castellana).

Esto introdujo también a la **dinastía Trastámara** en la Corona de Aragón, siendo los abuelos de los futuros **Fernando II e Isabel I** (los Reyes Católicos). El Compromiso de Caspe es el antecedente directo de la unión dinástica de 1469.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fue el Compromiso de Caspe? ¿Qué importancia tuvo para la historia de España?*

**Respuesta modelo:**
1. Contexto: muerte sin herederos de Martín I el Humano (1410) → crisis sucesoria en Aragón
2. Solución pacífica: nueve compromisarios (3 por cada reino) eligen al nuevo rey
3. Elegido: Fernando I de Antequera (Trastámara castellano) → los Trastámara gobiernan ambas Coronas
4. Importancia: sus nietos serán **Fernando II** (Aragón) e **Isabel I** (Castilla) → Reyes Católicos

**La conexión dinástica:**
Trastámara castellano (Enrique II, 1369) + Trastámara en Aragón (Fernando I, 1412) = base de la unión de 1469`,
    practice_prompt: 'Explica la Guerra Civil castellana que instauró la dinastía Trastámara y el Compromiso de Caspe (1412). ¿Qué consecuencias tuvo cada uno de estos hechos para la historia de la Península?',
    alert_markdown: '⚠️ El **Compromiso de Caspe (1412)** es el antecedente directo de la unión dinástica de los Reyes Católicos (1469). Sin Caspe, no se entiende por qué Fernando era aragonés y los Trastámara reinaban en ambas Coronas.',
  },
]

const BATCH_SIZE = 20

async function main() {
  console.log(`Insertando ${cards.length} tarjetas del Bloque 3 (Reinos Medievales)…`)

  for (let i = 0; i < cards.length; i += BATCH_SIZE) {
    const batch = cards.slice(i, i + BATCH_SIZE)
    const rows = batch.map(c => ({
      subject: SUBJECT,
      block_key: c.block_key,
      block_slug: c.block_slug,
      sort_order: c.sort_order,
      title: c.title,
      concept_markdown: c.concept_markdown,
      worked_example_markdown: c.worked_example_markdown ?? null,
      practice_prompt: c.practice_prompt ?? null,
      alert_markdown: c.alert_markdown ?? null,
      video_id: null,
      pau_exercise_query: null,
    }))

    const { error } = await supabase.from('curriculum_content_v2').insert(rows)
    if (error) {
      console.error(`Error en batch:`, error)
      process.exit(1)
    }
    console.log(`✓ Insertadas tarjetas ${i + 1}–${Math.min(i + BATCH_SIZE, cards.length)}`)
  }

  const { count, error: countErr } = await supabase
    .from('curriculum_content_v2')
    .select('*', { count: 'exact', head: true })
    .eq('subject', 'historia_espana')

  if (countErr) {
    console.error('Error al contar:', countErr)
  } else {
    console.log(`\n✅ Bloque 3 insertado. Total filas historia_espana en tabla: ${count}`)
  }
}

main()
