// Uso: node --env-file=.env.local docs/insert_historia_b4.mjs
// Bloque 4 — Los Reyes Católicos: flashcards 29-32
// Partes 12 y 13 de los apuntes de Diego

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const SUBJECT = 'historia_espana'

const cards = [

  // ─── PARTE 12: UNIÓN DINÁSTICA E INSTITUCIONAL ────────────────────────────────

  {
    sort_order: 29,
    block_key: 'Los Reyes Católicos',
    block_slug: 'reyes-catolicos',
    title: 'La Unión Dinástica y la Construcción del Estado Moderno',
    concept_markdown: `## Los Reyes Católicos: Unión Dinástica y Monarquía Autoritaria (1469–1516)

El matrimonio de Isabel de Castilla y Fernando de Aragón en 1469 puso las bases del Estado moderno en España, transformando las monarquías feudales en una sólida Monarquía Autoritaria.

### 1. La Unión Dinástica y la Guerra Civil Castellana

La boda secreta de Isabel y Fernando (1469) aceleró los conflictos sucesorios en Castilla. A la muerte de Enrique IV, estalló la **Guerra de Sucesión Castellana (1475–1479)** entre los partidarios de su hija, **Juana "la Beltraneja"** (apoyada por Portugal), y los de su hermana **Isabel I**. El conflicto terminó con la victoria isabelina tras la Batalla de Toro y la firma del **Tratado de Alcaçovas (1479)**, que reconoció a Isabel como reina de Castilla. Ese mismo año, Fernando II heredaba el trono de Aragón.

El modelo adoptado por la nueva monarquía fue el de la **Concordia de Segovia (1475)**: una **unión dinástica, no institucional**. Cada Corona conservó sus propias leyes, fronteras, monedas, aduanas, instituciones y Cortes. Solo compartían el mismo rey y el mismo proyecto político, resumido en el lema: *"Tanto Monta, Monta Tanto, Isabel como Fernando"*.

### 2. La Construcción del Estado Moderno (Monarquía Autoritaria)

Los Reyes Católicos recortaron los poderes políticos de la nobleza, el clero y las ciudades para someter a todos los estamentos bajo la autoridad real. Para ello construyeron un moderno aparato institucional:

- **La Santa Hermandad (1476):** Primer cuerpo policial del Estado, pagado por los municipios. Perseguía delitos en los caminos, pacificaba el campo y acababa con el bandolerismo nobiliario.
- **El Consejo Real de Castilla:** Se profesionalizó, sustituyendo a la vieja alta nobleza de sangre por juristas universitarios leales a la Corona. Se crearon consejos especializados (Aragón, Inquisición, Órdenes Militares).
- **Los Corregidores:** Delegados del rey generalizados en todos los municipios de Castilla para garantizar el cumplimiento de las órdenes reales.
- **El Ejército Profesional Permanente:** Se sustituyeron las huestes feudales por tropas mercenarias asalariadas. El **Gran Capitán** (Gonzalo Fernández de Córdoba) revolucionó la táctica de infantería.
- **El Control Eclesiástico:** Obtuvieron del Papa el **Derecho de Patronato Regio** (proponer los nombres de los obispos). Fernando se convirtió en Maestre perpetuo de las Órdenes Militares, absorbiendo sus enormes riquezas para la Corona.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿En qué consistió la unión de las Coronas de Castilla y Aragón? ¿Fue una unión política real?*

**Respuesta modelo:**
1. Contexto: matrimonio secreto de 1469 → pero la unión formal llega con la Concordia de Segovia (1475) y el Tratado de Alcaçovas (1479)
2. Naturaleza de la unión: **dinástica, no institucional** — cada Corona mantiene leyes, fueros, monedas, instituciones propias
3. El lema: "Tanto Monta, Monta Tanto" expresa la igualdad de poderes entre ambos monarcas
4. Reformas institucionales: Santa Hermandad → Consejo Real → Corregidores → Ejército profesional → control eclesiástico
5. Resultado: paso de las monarquías feudales medievales a la **Monarquía Autoritaria** moderna

**Clave:** La unión NO fue política sino personal. Fernando no era rey de Castilla ni Isabel era reina de Aragón — solo reinaban juntos como pareja. Esta distinción es fundamental para entender por qué Carlos I hereda dos estados separados.`,
    practice_prompt: 'Explica en qué consistió la unión dinástica de los Reyes Católicos. ¿Por qué se denomina "dinástica" y no "política" o "institucional"? Describe las principales reformas institucionales con las que construyeron el Estado moderno.',
    alert_markdown: '⚠️ La unión de los Reyes Católicos fue **DINÁSTICA** (un mismo rey para dos Coronas separadas), NO política ni territorial. Castilla y Aragón mantuvieron leyes, instituciones y aduanas propias hasta los Decretos de Nueva Planta de Felipe V (1707–1716).',
  },

  // ─── PARTE 13A: UNIFORMIDAD RELIGIOSA ────────────────────────────────────────

  {
    sort_order: 30,
    block_key: 'Los Reyes Católicos',
    block_slug: 'reyes-catolicos',
    title: 'La Política de Uniformidad Religiosa: Inquisición, Judíos y Mudéjares',
    concept_markdown: `## La Política de Uniformidad Religiosa de los Reyes Católicos

Para cohesionar un territorio con leyes e instituciones tan diversas, los monarcas eligieron la **fe católica** como la única identidad común válida para todos sus súbditos, persiguiendo implacablemente la disidencia religiosa mediante tres grandes medidas:

### 1. El Tribunal de la Inquisición (1478)

Creado bajo la autoridad directa de los reyes —y NO del Papa— con el objetivo inicial de perseguir a los **conversos judaizantes** (judíos bautizados que seguían practicando el judaísmo en secreto). Dirigido por el dominico **Tomás de Torquemada**, se convirtió en un temible instrumento de control político y social, ya que su jurisdicción penal se imponía por encima de los fueros tradicionales de Castilla y Aragón. Era la primera institución que realmente unificaba ambas Coronas bajo una misma autoridad.

### 2. La Expulsión de los Judíos (1492)

Mediante el **Decreto de Granada (marzo de 1492)**, los reyes obligaron a todos los judíos de España a convertirse al catolicismo en un plazo de cuatro meses o abandonar definitivamente el país. Unos **100.000 judíos** eligieron el exilio, convirtiéndose en los **sefardíes** (que conservaron el español ladino durante siglos). Esto supuso una grave pérdida de médicos, intelectuales, artesanos y banqueros que sostenían la economía urbana.

### 3. La Conversión Forzosa de los Mudéjares (1502)

Tras la conquista de Granada (1492), se garantizaron inicialmente las libertades religiosas de la población musulmana. Sin embargo, la intolerancia del **Cardenal Cisneros** (arzobispo de Toledo) provocó violentas rebeliones en el Albaicín y las Alpujarras. Los reyes aprovecharon las revueltas para decretar la expulsión de los musulmanes que se negasen a bautizarse, naciendo así los **moriscos** (cristiano nuevos de origen musulmán), que serían definitivamente expulsados en 1609.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Cuál fue la política religiosa de los Reyes Católicos? ¿Por qué se la denomina de "uniformidad religiosa"?*

**Estructura:**
1. Objetivo: la religión como único elemento de cohesión de dos Coronas muy distintas
2. **Inquisición (1478):** instrumento de control político-religioso → clave: dependía de los reyes, no del Papa
3. **Expulsión judíos (1492):** Decreto de Granada → sefardíes en exilio → pérdida económica e intelectual
4. **Conversión mudéjares (1502):** Cisneros provoca revueltas → expulsión o bautismo → moriscos
5. Resultado: España nominalmente católica al 100%, pero creación de problema *converso* que duraría siglos

**Cronología clave:**
- 1478: Inquisición española
- 1492 marzo: Decreto de expulsión judíos
- 1492 enero: Caída de Granada
- 1502: Conversión forzosa mudéjares
- 1609: Expulsión de los moriscos (Felipe III)`,
    practice_prompt: 'Describe la política de uniformidad religiosa de los Reyes Católicos. ¿Qué fue el Tribunal de la Inquisición y por qué fue tan relevante que dependiera de los reyes y no del Papa? ¿Qué consecuencias tuvo la expulsión de los judíos en 1492?',
    alert_markdown: '⚠️ La Inquisición española dependía de los **REYES**, no del Papa. Eso la hacía una institución política además de religiosa y era la única que tenía jurisdicción en AMBAS Coronas. No confundir con la Inquisición medieval (pontificia).',
  },

  // ─── PARTE 13B: EXPANSIÓN TERRITORIAL ────────────────────────────────────────

  {
    sort_order: 31,
    block_key: 'Los Reyes Católicos',
    block_slug: 'reyes-catolicos',
    title: 'La Expansión Territorial: Guerra de Granada e Incorporación de Navarra',
    concept_markdown: `## La Expansión Territorial en la Península Ibérica

Los Reyes Católicos se propusieron unificar bajo su control los territorios que aún escapaban a su autoridad en la Península, logrando dos conquistas cruciales.

### 1. La Guerra de Granada (1482–1492): Fin de la Reconquista

Fue una **larga campaña militar de diez años** de asedio sistemático al Reino Nazarí de Granada, el último reducto islámico en la Península. El ejército castellano-aragonés fue conquistando ciudad por ciudad (Alhama, Ronda, Málaga, Almería, Baza) hasta cercar la ciudad de Granada.

El **2 de enero de 1492**, el último rey nazarí, **Boabdil** (Muhammad XII), rindió la ciudad entregando las llaves del reino a Isabel y Fernando. Según la leyenda, al alejarse y volver la vista atrás para contemplar la Alhambra por última vez, su madre le espetó: *"Lloras como mujer lo que no supiste defender como hombre"* (el Suspiro del Moro).

La capitulación inicial garantizaba la **tolerancia religiosa** para la población musulmana (las Capitulaciones de Granada), pero esta promesa fue rota por el Cardenal Cisneros, provocando las revueltas que llevaron a la conversión forzosa de 1502.

### 2. La Incorporación de Navarra (1512)

El pequeño **Reino de Navarra** había mantenido una política de equilibrio entre Castilla y Francia, pero la alianza de la dinastía reinante (los Albret) con el rey francés Luis XII dio a Fernando el pretexto que necesitaba.

En 1512, ordenó al **Duque de Alba** invadir militarmente Navarra. La conquista fue fulminante. En **1515**, las Cortes de Castilla formalizaron la incorporación del reino, pero este conservó sus **fueros, instituciones y fronteras interiores** (solo se unió a Castilla, no a Aragón). Navarra fue el último territorio que se incorporó a la Monarquía Hispánica en la Península.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Por qué 1492 es el año más importante de la historia de España? Menciona los tres grandes hechos de ese año.*

**Respuesta modelo:**
1. **2 enero 1492:** Rendición de Granada → fin de la Reconquista (781 años de conflicto)
2. **Marzo 1492:** Decreto de expulsión de los judíos → política de uniformidad religiosa
3. **12 octubre 1492:** Llegada de Colón a América → inicio del Imperio colonial

**Sobre Granada:** destacar que la guerra duró 10 años (1482–1492), fue sistemática y profesional — no fue una carga a caballo sino un asedio ciudad por ciudad. Las Capitulaciones iniciales prometían tolerancia religiosa, pero la promesa fue rota → semilla del conflicto morisco.

**Sobre Navarra:** importante señalar que se incorporó en 1512 (no en 1492), manteniendo sus fueros. Es el último territorio peninsular en unirse.`,
    practice_prompt: 'Explica la conquista del Reino de Granada (1482-1492). ¿Por qué fue tan importante? ¿Qué prometieron las Capitulaciones de Granada y qué sucedió con esa promesa? Describe también la incorporación de Navarra en 1512.',
    alert_markdown: '⚠️ **1492 NO fue solo el descubrimiento de América.** Ese año también cayó Granada (enero) y se expulsó a los judíos (marzo). Los tres hechos son igualmente fundamentales para PAU. Y Navarra se incorporó en **1512**, no en 1492.',
  },

  // ─── PARTE 13C: DESCUBRIMIENTO DE AMÉRICA ────────────────────────────────────

  {
    sort_order: 32,
    block_key: 'Los Reyes Católicos',
    block_slug: 'reyes-catolicos',
    title: 'El Descubrimiento de América (1492) y el Tratado de Tordesillas',
    concept_markdown: `## El Descubrimiento de América y el Tratado de Tordesillas (1494)

### 1. El Contexto: La Necesidad de una Nueva Ruta hacia Asia

A finales del siglo XV, Portugal monopolizaba las rutas comerciales hacia las Indias (especias, seda, oro) bordeando el continente africano. Castilla necesitaba urgentemente una ruta alternativa para no quedarse fuera del comercio asiático.

El marinero genovés **Cristóbal Colón** propuso llegar a Asia navegando hacia el oeste por el Atlántico, basándose en el cálculo (erróneo) de que la circunferencia de la Tierra era mucho menor de lo que era. Tras ser rechazado por Portugal, la reina **Isabel I** de Castilla financió el proyecto mediante las **Capitulaciones de Santa Fe (1492)**, que otorgaban a Colón el título de *Almirante del Mar Océano*, el cargo de virrey de las tierras descubiertas y el 10% de todas las riquezas obtenidas.

### 2. El Viaje y el Descubrimiento

Las tres carabelas (*Niña*, *Pinta* y *Santa María*) partieron del **Puerto de Palos (Huelva)** el 3 de agosto de 1492. Tras 70 días de navegación, avistaron tierra el **12 de octubre de 1492**: la isla de **Guanahaní** (San Salvador, en las Bahamas). Colón murió convencido de que había llegado a Asia —fueron Américo Vespucio y otros exploradores quienes comprendieron que se trataba de un **Nuevo Mundo** desconocido para los europeos.

### 3. El Tratado de Tordesillas (1494)

El éxito del primer viaje de Colón desató un conflicto diplomático inmediato con Portugal. El Papa **Alejandro VI** dictó la Bula Inter Caetera, que asignaba a Castilla los territorios al oeste de un meridiano. Insatisfecho, el rey portugués negoció directamente con los Reyes Católicos, llegando al **Tratado de Tordesillas (1494)**:

- Se trazó una línea imaginaria a **370 leguas al oeste** de las islas de Cabo Verde
- Todo lo que estuviera al **oeste** de esa línea sería de Castilla (América)
- Todo lo que estuviera al **este** sería de Portugal (África, India y Brasil)

Este tratado explica por qué Brasil habla portugués hoy.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Cuáles fueron las causas del descubrimiento de América? ¿En qué consistió el Tratado de Tordesillas?*

**Estructura:**
1. **Causa:** monopolio portugués de la ruta africana → Castilla busca ruta alternativa → Colón propone ir al oeste
2. **Instrumento jurídico:** Capitulaciones de Santa Fe (1492) → poderes y rentas de Colón
3. **Hecho:** 12 octubre 1492, avistamiento de Guanahaní → Colón cree que es Asia (error que da el nombre "Indias")
4. **Consecuencia inmediata:** conflicto con Portugal → Tratado de Tordesillas (1494) → reparto del mundo
5. **Resultado:** línea a 370 leguas → oeste = Castilla, este = Portugal → por eso Brasil habla portugués

**Dato PAU:** Las Capitulaciones de Santa Fe son el PRIMER contrato de descubrimiento y conquista. Establecen un modelo que se repetirá con todos los conquistadores posteriores.`,
    practice_prompt: 'Explica las causas y consecuencias del descubrimiento de América en 1492. ¿Qué eran las Capitulaciones de Santa Fe? ¿Por qué se firmó el Tratado de Tordesillas (1494) y qué acordaba?',
    alert_markdown: '⚠️ El descubrimiento de América fue una empresa **CASTELLANA**, no española en sentido amplio. Isabel I lo financió con fondos de Castilla y las nuevas tierras pertenecían a la Corona de Castilla (no a Aragón). Por eso el Consejo de Indias dependía de Castilla.',
  },
]

const BATCH_SIZE = 20

async function main() {
  console.log(`Insertando ${cards.length} tarjetas del Bloque 4 (Reyes Católicos)…`)

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
    console.log(`\n✅ Bloque 4 insertado. Total filas historia_espana en tabla: ${count}`)
  }
}

main()
