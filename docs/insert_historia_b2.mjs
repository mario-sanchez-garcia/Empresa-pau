// Uso: node --env-file=.env.local docs/insert_historia_b2.mjs
// Bloque 2 — Al-Ándalus: flashcards 12-20
// Partes 5, 6 y 7 de los apuntes de Diego

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const SUBJECT = 'historia_espana'

const cards = [

  // ─── PARTE 5: CONQUISTA Y EVOLUCIÓN POLÍTICA ─────────────────────────────────

  {
    sort_order: 12,
    block_key: 'Al-Ándalus',
    block_slug: 'al-andalus',
    title: 'La Conquista Musulmana (711) y el Emirato Dependiente',
    concept_markdown: `## La Conquista Musulmana (711) y el Emirato Dependiente (711–756)

### La Conquista (711-718)
Tras la victoria en la **Batalla de Guadalete**, los comandantes musulmanes **Tariq ibn Ziyad** y **Musa ibn Nusayr** ocuparon casi toda la Península en apenas **siete años** (711-718).

**¿Por qué fue tan rápida?**
- La debilidad del reino visigodo (guerra civil entre Agila y Rodrigo)
- Pactos o capitulaciones con nobles locales: ejemplo, el **Pacto de Teodomiro**, por el que los señores locales conservaban sus tierras a cambio de pagar tributos y no resistir
- Superioridad militar del ejército omeya

### El Freno Carolingio
El avance musulmán hacia Europa fue detenido por los francos en la **Batalla de Poitiers (732)**, dirigida por Carlos Martel. Este es el límite norte de la expansión islámica en Europa occidental.

### El Emirato Dependiente (711-756)
La Península pasó a ser un **Emirato Dependiente**, es decir, una **provincia periférica del Imperio Islámico**, gobernada por un emir nombrado por el **Califato Omeya de Damasco**.

**Características:**
- Enorme inestabilidad interna por conflictos étnicos: **árabes** (aristocracia) frente a **bereberes** (mayoría de tropas, tratados injustamente)
- Al-Ándalus aún dependía en todo del califa de Damasco: sin autonomía política ni religiosa`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Por qué fue tan rápida la conquista musulmana de la Península Ibérica? Describe el Emirato Dependiente.*

**Estructura:**
1. Causas de la rapidez: debilidad visigoda + pactos de capitulación (Pacto de Teodomiro)
2. Freno en Poitiers (732) → límite norte del Islam en Europa
3. Estatus político del Emirato Dependiente: provincia del Califato de Damasco, sin autonomía
4. Inestabilidad interna: conflicto étnico árabes vs. bereberes

**Distinción clave para PAU:**
- Emirato **Dependiente** = sin autonomía política, provincia del Califato omeya
- Emirato **Independiente** = autonomía política (pero no religiosa) respecto a Bagdad`,
    practice_prompt: 'Explica las causas y el desarrollo de la conquista musulmana de la Península Ibérica (711-718). ¿Qué fue el Emirato Dependiente y qué problemas internos tuvo?',
    alert_markdown: '⚠️ La **Batalla de Guadalete (711)** marca el inicio de Al-Ándalus; la **Batalla de Poitiers (732)** marca su límite norte. Ambas fechas caen con frecuencia en PAU.',
  },

  {
    sort_order: 13,
    block_key: 'Al-Ándalus',
    block_slug: 'al-andalus',
    title: 'El Emirato Independiente de Abderramán I (756–929)',
    concept_markdown: `## El Emirato Independiente (756–929)

### El Origen: La Supervivencia Omeya
En el año **750**, la dinastía Omeya fue masacrada por los Abbasíes en Oriente. El único superviviente, el joven príncipe **Abderramán I**, huyó hasta la Península, se hizo con el poder derrotando al emir omeya local y se proclamó **emir independiente en el 756**.

### ¿Qué significaba ser "independiente"?
- **Independencia POLÍTICA total** respecto al nuevo Califato Abbasí de Bagdad
- Pero mantuvo la **subordinación RELIGIOSA**: reconocía la autoridad espiritual del califa abbasí como líder de los creyentes

$$\\text{Emirato Dependiente} \\xrightarrow{756} \\text{Emirato Independiente (político, no religioso)}$$

### Consolidación del Poder
Abderramán I estableció su capital en **Córdoba** y:
- Organizó la recaudación de impuestos
- Creó un **ejército mercenario** (para no depender de tribus árabes o bereberes)
- Sometió las constantes revueltas internas de la aristocracia árabe y de las marcas fronterizas (Mérida, Toledo, Zaragoza)

### Continuación dinástica
Sus sucesores mantuvieron el emirato durante casi dos siglos con dificultades crecientes, hasta que Abderramán III tomó medidas drásticas en el siglo X.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fue el Emirato Independiente? ¿En qué se diferenciaba del Emirato Dependiente y del Califato posterior?*

**Las tres etapas clave de Al-Ándalus:**

| Etapa | Fecha | Independencia política | Independencia religiosa |
|---|---|---|---|
| Emirato Dependiente | 711-756 | NO | NO |
| Emirato Independiente | 756-929 | SÍ | NO |
| Califato | 929-1031 | SÍ | SÍ |

Este cuadro es fundamental: explica por qué el salto de Emirato a Califato es tan importante. Abderramán III rompe la última dependencia con Bagdad.`,
    practice_prompt: '¿Por qué Abderramán I fundó el Emirato Independiente en 756? ¿Qué diferencia hay entre independencia política e independencia religiosa en el contexto de Al-Ándalus?',
    alert_markdown: null,
  },

  {
    sort_order: 14,
    block_key: 'Al-Ándalus',
    block_slug: 'al-andalus',
    title: 'El Califato de Córdoba: Esplendor y Poder (929–1031)',
    concept_markdown: `## El Califato de Córdoba (929–1031)

### La Proclamación del Califato
A comienzos del siglo X, Al-Ándalus sufría una profunda crisis interna (revuelta de Omar ben Hafsún). Para restaurar la autoridad, **Abderramán III** asumió el poder político en el 912 y, en el **929**, tomó una decisión histórica: se proclamó **Califa**.

$$\\text{Emirato Independiente (Solo Independencia Política)} \\longrightarrow \\text{Califato (Independencia Política + Religiosa)}$$

El califa concentra en su persona el poder **político, militar y religioso** simultáneamente.

### Abderramán III (929-961): El Esplendor
- Pacificó el territorio sometiendo todas las rebeliones internas
- Detuvo el avance de los reinos cristianos del norte, haciéndoles pagar tributos (**parias**)
- Mandó construir la fastuosa ciudad palatina de **Medina Azahara** (a 8 km de Córdoba): palacio-ciudad que simbolizaba el poder califal ante el mundo islámico
- Córdoba se convirtió en la ciudad más grande y refinada de Occidente: ~500.000 habitantes, 700 mezquitas, 70 bibliotecas

### Al-Hakam II (961-976): La Cultura
Época de paz, estabilidad material y un inmenso esplendor **cultural y bibliográfico**. La biblioteca del califa reunió más de 400.000 manuscritos.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Por qué Abderramán III se proclamó Califa en 929? ¿Qué significaba este título?*

**Respuesta modelo:**
1. Contexto: crisis interna (revuelta de Omar ben Hafsún) → necesidad de reforzar la autoridad
2. Motivación política: los títulos de emir ya no bastaban para legitimarse frente a los califas abbasíes y fatimíes
3. Significado del título "califa": suma del poder político + militar + **religioso** (sucesor del Profeta)
4. Consecuencia: Córdoba deja de ser una provincia periférica y se convierte en el **tercer gran centro del Islam** (junto a Bagdad y El Cairo)
5. Medina Azahara: símbolo material del nuevo poder`,
    practice_prompt: 'Explica qué fue el Califato de Córdoba, por qué Abderramán III lo proclamó en 929 y cuáles fueron las principales manifestaciones de su esplendor. ¿Qué fue Medina Azahara?',
    alert_markdown: '⚠️ **Medina Azahara** (no confundir con la Alhambra, que es nazarí del s. XIV) es la ciudad palatina del Califato omeya cordobés del s. X. Error frecuente en PAU.',
  },

  {
    sort_order: 15,
    block_key: 'Al-Ándalus',
    block_slug: 'al-andalus',
    title: 'La Dictadura de Almanzor y la Fitna (976–1031)',
    concept_markdown: `## La Dictadura de Almanzor (976–1002) y la Fitna

### La Dictadura de Almanzor
Con el joven califa **Hisham II** recluido, el visir **Almanzor** (Muhámmad ibn Abi Amir) secuestró el poder real estableciendo una **dictadura militar de facto**.

**Características del régimen de Almanzor:**
- Basó su legitimidad en la **yihad** contra los reinos cristianos del norte
- Realizó más de **50 feroces campañas de saqueo** (*razzias* o *aceifas*) contra los reinos del norte
- Sus victorias más conocidas: destrucción de **Barcelona** y profanación de **Santiago de Compostela (1002)**, llevándose las campanas de la catedral a lomos de prisioneros cristianos como trofeo

### La Fitna y la Desintegración
Tras la muerte de Almanzor y de su hijo Abd al-Malik, el califato se sumió en un período de guerras civiles conocidas como la ***fitna*** (en árabe: "discordia").

En el **1031**, una asamblea de nobles cordobeses decretó oficialmente la **disolución del Califato**, fragmentándose Al-Ándalus en múltiples reinos menores llamados **Taifas**.

Este es el punto de inflexión más importante de la historia de Al-Ándalus: el fin del califato marca el inicio de la hegemonía cristiana en la Península.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fue la Fitna? ¿Cuáles fueron las consecuencias de la desintegración del Califato de Córdoba?*

**Puntos clave:**
1. Almanzor: no era califa sino visir → usurpación de facto del poder
2. Legitimidad por la yihad → campañas contra el norte cristiano
3. *Fitna* = guerras civiles tras su muerte → fragmentación
4. 1031: disolución del Califato → aparición de los Reinos de Taifas
5. Consecuencia histórica decisiva: los reinos cristianos pasan de pagar parias a cobrarlas → **inversión del equilibrio de poder peninsular**`,
    practice_prompt: 'Describe la dictadura de Almanzor: ¿cómo llegó al poder, cómo lo ejerció y cuáles fueron sus campañas militares más importantes? ¿Qué fue la Fitna y qué consecuencias tuvo?',
    alert_markdown: null,
  },

  // ─── PARTE 6: TAIFAS, INVASIONES Y REINO NAZARÍ ─────────────────────────────

  {
    sort_order: 16,
    block_key: 'Al-Ándalus',
    block_slug: 'al-andalus',
    title: 'Los Reinos de Taifas y las Invasiones Norteafricanas (1031–1212)',
    concept_markdown: `## Los Primeros Reinos de Taifas (1031–1086)

La disolución del Califato dividió Al-Ándalus en más de una veintena de pequeños estados independientes llamados **Taifas** (Sevilla, Zaragoza, Toledo, Badajoz, Granada…).

**Características:**
- Inmensa riqueza económica y refinamiento cultural (mecenazgo artístico)
- Militarmente **muy débiles**: sin ejércitos suficientes para resistir
- Obligados a pagar **parias** (tributos anuales en oro) a los reyes cristianos del norte para comprar la paz
- En **1085**, Alfonso VI de Castilla conquistó **Toledo**: alarma total en el mundo islámico

## Los Almorávides (1086–1145)

Aterrorizados por la pérdida de Toledo, los reyes de las taifas pidieron auxilio a los **almorávides**: monjes-soldados bereberes del norte de África, caracterizados por un **Islam fundamentalista y riguroso**.

- Cruzaron el estrecho y derrotaron a Alfonso VI en la **Batalla de Sagrajas (1086)**
- Depusieron a los reyes de las taifas y **unificaron Al-Ándalus** bajo su dominio
- Su intolerancia religiosa y el empuje cristiano → decadencia → *Segundos Reinos de Taifas*

## Los Almohades (1147–1224)

Sustituyeron a los almorávides. Lograron frenar temporalmente a los cristianos en la **Batalla de Alarcos (1195)**. Ante el peligro, el Papa proclamó una Cruzada: los reinos de Castilla, Aragón y Navarra se unieron de forma excepcional e infligieron una **derrota total** a los almohades en la **Batalla de las Navas de Tolosa (1212)**. El imperio almohade se desintegró.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *Describe los reinos de Taifas y las invasiones norteafricanas. ¿Qué importancia tuvo la Batalla de las Navas de Tolosa?*

**Estructura:**
1. Taifas: fragmentación + parias → invierten el equilibrio de poder (los cristianos cobran en vez de pagar)
2. Almorávides: reacción islámica → Sagrajas (1086) → unificación pero intolerancia
3. Almohades: segunda reacción → Alarcos (1195) → **Las Navas de Tolosa (1212)** como punto de no retorno

**Las Navas de Tolosa (1212)** es la batalla más importante de la Reconquista: después, el avance cristiano del siglo XIII (Fernando III, Jaime I) es imparable. Cae siempre en PAU.`,
    practice_prompt: 'Explica qué fueron los reinos de Taifas y el sistema de parias. ¿Por qué llegaron los almorávides y los almohades a la Península? ¿Cuál fue la trascendencia histórica de las Navas de Tolosa (1212)?',
    alert_markdown: '⚠️ Secuencia obligatoria: **Taifas → Almorávides (Sagrajas 1086) → 2.ª Taifas → Almohades (Alarcos 1195) → Las Navas de Tolosa (1212) → 3.ª Taifas → Reconquista del s. XIII**.',
  },

  {
    sort_order: 17,
    block_key: 'Al-Ándalus',
    block_slug: 'al-andalus',
    title: 'El Reino Nazarí de Granada (1238–1492)',
    concept_markdown: `## El Reino Nazarí de Granada (1238–1492)

Fundado por **Muhammad I** (de la dinastía Nazarí), fue el **último reducto islámico** de la Península Ibérica. Logró sobrevivir más de **dos siglos y medio** gracias a varias causas estratégicas:

### Causas de su supervivencia
- **Geografía:** territorio montañoso (Sistemas Béticos) fácil de defender militarmente
- **Vasallaje estratégico:** los reyes nazaríes se declararon vasallos del rey de Castilla, pagando costosas **parias en oro** a cambio de paz
- **Apoyo exterior:** alianzas intermitentes con los **benimerines** del norte de África
- **Economía:** activa agricultura de regadío, industria de la **seda** y comercio exterior marítimo → riqueza que permitía comprar la paz

### La Alhambra: El Legado Arquitectónico
El reino nazarí legó a la humanidad la **Alhambra de Granada**, el conjunto palaciego más refinado del Islam occidental (ss. XIII-XIV). Es Patrimonio de la Humanidad.

### La Caída (1492)
La sociedad granadina estaba marcada por constantes **disputas civiles internas** entre facciones nobiliarias (como los Abencerrajes vs. los Zegríes). Los Reyes Católicos explotaron estas divisiones. El último rey, **Boabdil**, entregó las llaves de Granada el **2 de enero de 1492**, poniendo fin a la presencia política islámica en la Península.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Por qué sobrevivió el Reino Nazarí de Granada hasta 1492? ¿Cómo cayó?*

**Estructura de respuesta:**
1. Fundación: Muhammad I en 1238 → coincide con el gran avance cristiano (Fernando III conquista Córdoba y Sevilla)
2. Claves de supervivencia: geografía + vasallaje + parias + seda + apoyo norteafricano
3. La Alhambra como símbolo del esplendor nazarí
4. Divisiones internas → los RRCC las aprovechan
5. Capitulación de Boabdil: 2 de enero de 1492 → fecha clave

**Truco:** 1492 es el año más importante de la historia española: Granada (enero) + expulsión de los judíos (marzo) + llegada a América (octubre). Tres hechos un mismo año.`,
    practice_prompt: 'Explica por qué el Reino Nazarí de Granada pudo sobrevivir más de dos siglos y medio después de que el resto de Al-Ándalus fuera reconquistado. ¿Cómo y cuándo cayó?',
    alert_markdown: null,
  },

  // ─── PARTE 7: ECONOMÍA, SOCIEDAD Y LEGADO ────────────────────────────────────

  {
    sort_order: 18,
    block_key: 'Al-Ándalus',
    block_slug: 'al-andalus',
    title: 'La Economía de Al-Ándalus: Agricultura, Industria y Comercio',
    concept_markdown: `## La Economía de Al-Ándalus

A diferencia del modelo ruralizado y subsistente del norte cristiano, Al-Ándalus desarrolló una **economía monetaria y comercial** fuertemente vinculada a las redes del mundo islámico.

### La Revolución Agrícola
Mantuvieron la trilogía mediterránea pero su gran aportación fue la **revolución agrícola** basada en:
- Técnicas avanzadas de **regadío**: acequias, norias, albercas, canales
- Introducción de nuevos cultivos: **arroz, cítricos (naranja, limón), caña de azúcar, algodón, azafrán, hortalizas**
- Estos cultivos son la base de la agricultura del levante y sur peninsular hasta hoy

### Artesanía e Industria
- Textil: la **seda cordobesa** (y granadina en el nazarí) → exportada a toda Europa
- **Cordobanes**: cuero de Córdoba, famoso en todo el Mediterráneo
- Fabricación de **papel** (introducido desde China a través del mundo islámico)
- Vidrio, cerámica y armas de calidad

### El Comercio
Al-Ándalus era un nodo comercial clave del Mediterráneo:
- Exportaba productos de lujo e importaba materias primas, oro de África subsahariana y esclavos de Europa central
- Dos monedas fuertes y estables: el **dinar de oro** y el **dirhem de plata**
- Córdoba: centro redistribuidor entre Europa cristiana y el mundo islámico oriental`,
    worked_example_markdown: `**Pregunta tipo PAU:** *Describe el modelo económico de Al-Ándalus y sus principales sectores.*

**Estructura:**
1. Contraste con el norte cristiano: economía monetaria vs. economía feudal de subsistencia
2. Agricultura: regadío + nuevos cultivos → transformación del paisaje peninsular
3. Artesanía: seda, cordobanes, papel → exportación a Europa
4. Comercio: nodo Mediterráneo, moneda estable (dinar/dirhem)

**Dato que sorprende:** muchos cultivos que hoy son típicamente "españoles" (arroz, naranjas, azafrán) los introdujeron los musulmanes en Al-Ándalus. Es un buen argumento para mostrar la profundidad del legado andalusí.`,
    practice_prompt: 'Describe la economía de Al-Ándalus. ¿Qué aportaron los musulmanes a la agricultura peninsular? ¿Qué productos artesanales destacaron y por qué era tan importante su comercio?',
    alert_markdown: null,
  },

  {
    sort_order: 19,
    block_key: 'Al-Ándalus',
    block_slug: 'al-andalus',
    title: 'La Sociedad Andalusí: Jerarquía Étnico-Religiosa',
    concept_markdown: `## La Sociedad Andalusí: Diversidad y Jerarquía

La sociedad andalusí estaba profundamente **jerarquizada** siguiendo criterios tanto de origen étnico como de filiación religiosa:

### Los Grupos Sociales

**La Aristocracia Árabe**
Minoría que acaparaba las mejores tierras (valles del Guadalquivir y del Ebro), los altos cargos políticos y el poder judicial. Representaban la élite dominante.

**Los Bereberes**
Musulmanes del norte de África, más numerosos que los árabes pero relegados a las peores tierras de pastoreo (Meseta y zonas montañosas) y a las tropas del ejército. Su resentimiento provocó **constantes rebeliones**.

**Los Muladíes**
Población hispanorromana y visigoda que se **convirtió al Islam** para evitar pagar la *chizya* (impuesto personal para no musulmanes). Formaron la gran masa social andalusí.

**Los Mozárabes**
Cristianos que mantuvieron su religión viviendo en Al-Ándalus a cambio de pagar tributos especiales (*chizya* y *jarach*). Su número disminuyó con el tiempo por conversiones o emigración al norte.

**Los Judíos**
Minoría urbana dedicada a medicina, comercio, artesanía y finanzas. Gozaron de un estatus de protección similar al mozárabe.

**Los Esclavos**
En la base social, de origen europeo (eslavos, llamados *saqa* en árabe → origen de la palabra "eslavo") o africano.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *Describe la organización social de Al-Ándalus.*

**Clave de respuesta — los seis grupos y sus características:**

| Grupo | Religión | Posición | Característica |
|---|---|---|---|
| Aristocracia árabe | Musulmana | Alta | Mejores tierras y cargos |
| Bereberes | Musulmana | Media-baja | Peores tierras, revueltas |
| Muladíes | Musulmana (conversos) | Media | Gran mayoría de la población |
| Mozárabes | Cristiana | Media | Pagan *chizya*, protegidos |
| Judíos | Judía | Media-urbana | Médicos, financieros |
| Esclavos | Variable | Base | Origen europeo o africano |

Recuerda: *muladí* = converso hispano al Islam; *mozárabe* = cristiano que vive en Al-Ándalus.`,
    practice_prompt: 'Describe los principales grupos sociales de Al-Ándalus. ¿Qué eran los muladíes, los mozárabes y los judíos? ¿Cómo se organizaba la jerarquía social?',
    alert_markdown: '⚠️ Distinción clave: **muladí** = cristiano convertido al Islam; **mozárabe** = cristiano que vive en Al-Ándalus SIN convertirse. Confundirlos es error habitual en PAU.',
  },

  {
    sort_order: 20,
    block_key: 'Al-Ándalus',
    block_slug: 'al-andalus',
    title: 'El Legado Cultural y Científico de Al-Ándalus',
    concept_markdown: `## El Legado Cultural y Científico de Al-Ándalus

Córdoba se convirtió en el siglo X en el **principal faro intelectual de Occidente**, cuando Europa cristiana vivía sumida en el oscurantismo carolingio.

### Transmisores del Conocimiento
Al-Ándalus cumplió un papel histórico decisivo: **tradujo y transmitió a Europa** el legado filosófico de la Grecia clásica (Aristóteles, Platón, Galeno) que Europa había olvidado, así como los conocimientos matemáticos de la India:
- Introducción de los **números arábigos** (de origen indio): los que usamos hoy
- El concepto del **cero** como número
- El **álgebra** (del árabe *al-jabr*, obra de Al-Juarismi)

### Las Grandes Figuras Científicas

| Nombre | Campo | Aportación |
|---|---|---|
| **Abulcasis** (s. X-XI) | Medicina / Cirugía | *Kitab al-Tasrif*: primera enciclopedia quirúrgica ilustrada |
| **Azarquiel** (s. XI) | Astronomía | Tablas de Toledo, medición del año solar |
| **Averroes** (s. XII) | Filosofía | Gran comentarista de Aristóteles; influyó en Tomás de Aquino |
| **Maimónides** (s. XII) | Filosofía / Medicina | Médico y filósofo judío de Córdoba; *Guía de Perplejos* |

### Arte y Arquitectura
El estilo islámico andalusí se caracteriza por: arco de **herradura**, arcos **lobulados**, decoraciones **epigráficas** (caligrafía árabe como elemento decorativo), **yeserías** y **atauriques** (motivos vegetales).

**Tres joyas arquitectónicas:**
1. **Mezquita de Córdoba** (ss. VIII-X): el mayor monumento del Islam occidental
2. **Palacio de la Aljafería** (Zaragoza, s. XI): ejemplo del arte taifa
3. **La Alhambra** (Granada, ss. XIII-XIV): joya del arte nazarí`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Cuál fue el legado cultural y científico de Al-Ándalus para la civilización europea?*

**Estructura (4 puntos):**
1. Papel de transmisión: recuperaron a Aristóteles y lo pasaron a Europa → base de la filosofía escolástica
2. Matemáticas: números arábigos, cero, álgebra → revolución para la ciencia europea
3. Científicos clave: Abulcasis (cirugía), Azarquiel (astronomía), **Averroes** (filosofía), Maimónides
4. Arte: Mezquita de Córdoba, Aljafería, **Alhambra** → los tres edificios que siempre hay que citar

**El argumento clave:** sin Al-Ándalus como puente, el Renacimiento europeo no hubiera tenido lugar tal como lo conocemos.`,
    practice_prompt: 'Explica el legado cultural y científico de Al-Ándalus. ¿Por qué fue importante como puente entre el mundo griego clásico y la Europa medieval cristiana? Cita al menos tres figuras científicas y tres obras arquitectónicas.',
    alert_markdown: null,
  },
]

const BATCH_SIZE = 20

async function main() {
  console.log(`Insertando ${cards.length} tarjetas del Bloque 2 (Al-Ándalus)…`)

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
    console.log(`\n✅ Bloque 2 insertado. Total filas historia_espana en tabla: ${count}`)
  }
}

main()
