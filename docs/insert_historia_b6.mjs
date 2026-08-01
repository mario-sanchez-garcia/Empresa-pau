// Uso: node --env-file=.env.local docs/insert_historia_b6.mjs
// Bloque 6 — El Siglo XVIII: Los Borbones: flashcards 48-52
// Partes 20-23 de los apuntes de Diego

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const SUBJECT = 'historia_espana'

const cards = [

  // ─── PARTE 20: GUERRA DE SUCESIÓN Y UTRECHT ───────────────────────────────────

  {
    sort_order: 48,
    block_key: 'El Siglo XVIII: Los Borbones',
    block_slug: 'siglo-xviii-borbones',
    title: 'La Guerra de Sucesión Española y el Tratado de Utrecht (1713)',
    concept_markdown: `## La Guerra de Sucesión Española (1701–1715) y el Tratado de Utrecht

La muerte sin descendencia de **Carlos II** (1700) puso fin a la dinastía de los Austrias y desencadenó un conflicto internacional que reconfiguró el mapa geopolítico de Europa y el Imperio español.

### Los Dos Candidatos y la Guerra Internacional

En su testamento, Carlos II nombró sucesor a **Felipe de Anjou** (nieto de Luis XIV de Francia, futura dinastía Borbón). El temor europeo a una coalición franco-española que dominase el mundo llevó a **Inglaterra, Holanda, Austria y Portugal** a formar la **Gran Alianza de La Haya**, apoyando al **Archiduque Carlos de Austria**.

### La Guerra Civil en la Península

La Península se fracturó en dos bandos con motivaciones opuestas:
- **Corona de Castilla:** Apoyó a **Felipe V** (Borbón). Vio en el modelo francés centralista una oportunidad de reforma que frenara el poder señorial
- **Corona de Aragón:** Apoyó al **Archiduque Carlos**. Temía que el absolutismo borbónico destruyera sus fueros y el pactismo político tradicional

El giro decisivo llegó en **1711**: el Archiduque Carlos heredó el Imperio Alemán al morir su hermano. Inglaterra y Holanda, ahora temerosas de una hegemonía austriaca, retiraron su apoyo y buscaron la paz. **Barcelona** resistió heroicamente hasta su capitulación definitiva el **11 de septiembre de 1714** (hoy Fiesta Nacional de Cataluña).

### La Paz de Utrecht (1713): El Fin del Imperio Europeo

Felipe V fue reconocido como rey de España a cambio de renunciar a sus derechos sobre la Corona francesa. España perdió todos sus territorios europeos:
- **Pérdidas a Austria:** Países Bajos católicos, Milanesado, Nápoles, Cerdeña
- **Pérdidas a Gran Bretaña:** **Gibraltar** (1704, aún hoy británico) y **Menorca**
- **Privilegios comerciales a Gran Bretaña:** el **Navío de Permiso** (un barco de 500 t/año con América) y el **Asiento de Negros** (monopolio del tráfico de 4.800 esclavos anuales a las Indias)`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Cuáles fueron las causas y consecuencias de la Guerra de Sucesión Española? ¿Qué supuso el Tratado de Utrecht?*

**Estructura:**
1. Causa: Carlos II muere sin hijos → testamento a favor de Felipe de Anjou (Borbón)
2. Guerra internacional: Gran Alianza vs. Francia/España → 12 años de conflicto
3. Guerra civil: Castilla = Felipe V; Aragón = Archiduque Carlos
4. Giro de 1711: Archiduque Carlos hereda el Imperio → Inglaterra y Holanda cambian de bando
5. Caída de Barcelona: 11 de septiembre de 1714
6. Utrecht (1713): Felipe V = rey de España → pierde todo el Imperio europeo → Gran Bretaña gana Gibraltar, Menorca, Navío de Permiso y Asiento de Negros

**El gran perjudicado:** España pierde todos sus territorios europeos (los había tenido 200 años).
**El gran beneficiado:** Gran Bretaña, que consolida su hegemonía marítima y comercial.`,
    practice_prompt: 'Explica las causas de la Guerra de Sucesión Española. ¿Por qué se fracturó la Península en dos bandos? ¿Qué estableció el Tratado de Utrecht (1713) y cuáles fueron sus consecuencias para España y para Gran Bretaña?',
    alert_markdown: '⚠️ El **11 de septiembre** (caída de Barcelona en 1714) es la Diada, la Fiesta Nacional de Cataluña. Los catalanes habían apoyado al Archiduque Carlos para defender sus fueros; su derrota significó la pérdida de las constituciones catalanas mediante los Decretos de Nueva Planta.',
  },

  // ─── PARTE 21A: DECRETOS DE NUEVA PLANTA ─────────────────────────────────────

  {
    sort_order: 49,
    block_key: 'El Siglo XVIII: Los Borbones',
    block_slug: 'siglo-xviii-borbones',
    title: 'Los Decretos de Nueva Planta y la Centralización Borbónica',
    concept_markdown: `## Los Decretos de Nueva Planta: El Fin del Modelo Foral

Felipe V aprovechó la derrota militar de los reinos de la Corona de Aragón para abolir sus fueros medievales mediante los **Decretos de Nueva Planta**, implantando el modelo absolutista centralista de inspiración francesa.

### Los Decretos y sus Fechas

- **1707:** Abolición de los fueros de **Valencia** y **Aragón** (primeros en caer, por su rendición)
- **1715:** Abolición de los fueros de **Mallorca** e **Ibiza**
- **1716:** Abolición de las constituciones del **Principado de Cataluña** (el último en rendirse)

### El Impacto Institucional

Los Decretos suprimieron las instituciones forales propias de cada reino:
- Las Cortes de Aragón, Valencia, Cataluña y Mallorca (disueltas)
- La Generalitat de Cataluña (abolida)
- El Justicia Mayor de Aragón (suprimido)
- Las leyes, juicios y procedimientos propios de cada territorio

En su lugar, se impuso el **modelo jurídico, administrativo y lingüístico de Castilla** en todos los territorios. El castellano se convirtió en el idioma obligatorio de la administración y los tribunales.

### Las Excepciones: País Vasco y Navarra

El **País Vasco** y **Navarra** conservaron intactos sus fueros, aduanas y privilegios fiscales porque permanecieron leales a Felipe V durante la guerra. Esta diferencia de trato sentó un precedente que explicará las Guerras Carlistas del siglo XIX, cuando los vascos y navarros defenderán a los candidatos que prometían mantener sus fueros frente a los liberales centralistas.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fueron los Decretos de Nueva Planta? ¿Por qué País Vasco y Navarra conservaron sus fueros y los reinos de la Corona de Aragón no?*

**Respuesta modelo:**
1. Contexto: Guerra de Sucesión → Corona de Aragón apoyó al Archiduque Carlos → perdieron la guerra
2. Felipe V castiga a los perdedores: suprime sus fueros "por derecho de conquista"
3. Cronología: Valencia y Aragón (1707) → Mallorca (1715) → Cataluña (1716)
4. Consecuencia: modelo castellano impuesto en toda España → primer estado uniforme de la historia
5. Excepción: País Vasco y Navarra apoyaron a Felipe V → conservaron sus fueros como premio a la lealtad

**Clave para PAU:** Los Decretos de Nueva Planta son el origen del Estado centralizado español. Antes, España era una confederación de reinos con leyes distintas. Después, un Estado (casi) uniforme.`,
    practice_prompt: 'Explica qué fueron los Decretos de Nueva Planta, cuándo se dictaron y qué consecuencias tuvieron. ¿Por qué País Vasco y Navarra conservaron sus fueros mientras los reinos de la Corona de Aragón los perdieron?',
    alert_markdown: '⚠️ Los Decretos de Nueva Planta son la reforma institucional más importante de la historia moderna de España: convierten la vieja confederación de reinos en un Estado centralizado. Sin ellos no se entiende la España contemporánea ni el debate foral del siglo XIX.',
  },

  // ─── PARTE 21B: REFORMAS INSTITUCIONALES BORBÓNICAS ──────────────────────────

  {
    sort_order: 50,
    block_key: 'El Siglo XVIII: Los Borbones',
    block_slug: 'siglo-xviii-borbones',
    title: 'Las Reformas Institucionales Borbónicas del Siglo XVIII',
    concept_markdown: `## La Nueva Arquitectura del Estado Borbónico

Junto con los Decretos de Nueva Planta, los Borbones reformaron toda la estructura del Estado para concentrar el poder absoluto en el rey y hacerlo gobernar de forma eficiente mediante una burocracia racional de inspiración francesa.

### Las Secretarías de Estado: El Antecedente de los Ministerios

Los Borbones sustituyeron el viejo e ineficiente **sistema polisinodial** de Consejos de los Austrias por las **Secretarías de Estado**, órganos especializados con competencias concretas que son el antecedente directo de los ministerios actuales:
- Secretaría de Estado (política exterior)
- Secretaría de Guerra
- Secretaría de Marina e Indias
- Secretaría de Justicia
- Secretaría de Hacienda

El único Consejo de los Austrias que sobrevivió fue el **Consejo de Castilla**, reconvertido en órgano consultivo superior.

### Los Intendentes

Funcionarios reales de origen francés, los **Intendentes** tenían amplios poderes en sus provincias: administración, recaudación fiscal, supervisión del ejército y fomento económico. Dependían directamente del rey, sin mediación señorial ni foral. Fueron el principal instrumento de centralización en el territorio.

### Los Capitanes Generales

Sustituyeron a los virreyes en los reinos de la Corona de Aragón, asumiendo el mando militar supremo y la presidencia de las Reales Audiencias.

### La Reforma Fiscal

Para unificar la fiscalidad en la Corona de Aragón (que antes no pagaba los mismos impuestos que Castilla), se implantaron nuevos tributos proporcionales a la riqueza. El más exitoso fue el **Catastro de Cataluña** (un impuesto proporcional a la riqueza del contribuyente), que fue tan eficaz que los ilustrados del siglo XVIII propusieron extenderlo a toda España.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Cómo reorganizaron los Borbones las instituciones del Estado español en el siglo XVIII?*

**Estructura:**
1. Herencia que reciben: viejo sistema polisinodial de los Austrias (ineficiente, arcaico)
2. Modelo nuevo (francés): centralización, burocracia racional, secretarías especializadas
3. Las Secretarías de Estado → antecedentes directos de los ministerios actuales
4. Los Intendentes → nuevo brazo ejecutivo del rey en las provincias → suplantan a los señores feudales
5. Los Capitanes Generales → poder militar en los reinos de Aragón
6. Reforma fiscal: Catastro de Cataluña → impuesto proporcional a la riqueza → modelo moderno

**Comparación clave:** Austrias = Consejos (lentos, plurales, dominados por la nobleza) → Borbones = Secretarías (ágiles, especializadas, controladas por el rey)`,
    practice_prompt: 'Describe las principales reformas institucionales introducidas por los Borbones en España durante el siglo XVIII. ¿Qué fueron las Secretarías de Estado y los Intendentes? ¿Por qué supusieron una modernización respecto al sistema de Consejos de los Austrias?',
    alert_markdown: null,
  },

  // ─── PARTE 22: CARLOS III Y EL REFORMISMO ILUSTRADO ──────────────────────────

  {
    sort_order: 51,
    block_key: 'El Siglo XVIII: Los Borbones',
    block_slug: 'siglo-xviii-borbones',
    title: 'Carlos III y el Reformismo Ilustrado',
    concept_markdown: `## Carlos III: El Despotismo Ilustrado (1759–1788)

El reinado de Carlos III representó el apogeo de la **Ilustración** y del **Despotismo Ilustrado** en España, un modelo político sintetizado en la frase: *"Todo para el pueblo, pero sin el pueblo"*. Se buscaba modernizar la economía y la sociedad sin cuestionar el absolutismo ni los privilegios estamentales.

### Los Ministros Ilustrados

Carlos III se rodeó de un equipo de ministros reformistas brillantes: **Conde de Floridablanca, Conde de Campomanes** y, especialmente, **Gaspar Melchor de Jovellanos**, autor del célebre *Informe sobre la Ley Agraria* (1795), que denunciaba el estancamiento rural causado por las tierras en "manos muertas" de la Iglesia y los mayorazgos nobiliarios.

### Las Grandes Reformas

**En Economía y Agricultura:**
- **Nuevas Poblaciones de Sierra Morena (1767):** El ministro **Pablo de Olavide** colonizó zonas despobladas de Jaén y Córdoba con campesinos centroeuropeos católicos para crear un modelo de pequeña propiedad agrícola productiva y pacificar los caminos reales
- **Reales Fábricas:** La Corona fundó manufacturas de bienes de lujo (tapices, vidrios, porcelana) e impulsó la industria textil algodonera en Cataluña

**En Sociedad y Comercio:**
- **Motín de Esquilache (1766):** Revuelta popular en Madrid detonada por la escasez de pan y el decreto del ministro Esquilache (extranjero) de recortar las capas y sombreros tradicionales. La violencia del motín sirvió de pretexto para **expulsar a los Jesuitas de España (1767)**, sospechosos de haberlo instigado
- **Decreto de Libre Comercio con América (1778):** Puso fin al monopolio de Cádiz; 13 puertos peninsulares (Barcelona incluida) podían comerciar directamente con las Indias → dynamizó la economía catalana
- **Dignificación del Trabajo Manual (1783):** Real cédula que declaraba los oficios artesanales "honestos y dignos", eliminando la deshonra legal del trabajo
- **Sociedades Económicas de Amigos del País:** Asociaciones ilustradas para difundir innovaciones científicas, técnicas y agrícolas`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fue el Despotismo Ilustrado? Describe las principales reformas de Carlos III.*

**Definición:** El Despotismo Ilustrado = gobernantes absolutos que aplican los principios racionales de la Ilustración para mejorar el bienestar del pueblo, PERO sin darle poder político. "Todo para el pueblo, pero sin el pueblo."

**Reformas de Carlos III — resumen:**
1. **Económicas:** Nuevas Poblaciones de Sierra Morena + Reales Fábricas + Decreto de Libre Comercio (1778)
2. **Sociales:** Dignificación del trabajo manual (1783) + Sociedades de Amigos del País
3. **Religiosas:** Expulsión de los Jesuitas (1767) → regalismo (control real de la Iglesia)
4. **Ilustradas:** Jovellanos + Informe de la Ley Agraria = denuncia de las "manos muertas"

**El Motín de Esquilache (1766):** no fue solo por las capas y sombreros — fue por el hambre y el resentimiento contra los ministros extranjeros. Es el primer gran ejemplo de un motín popular en la España moderna.`,
    practice_prompt: 'Explica en qué consistió el Despotismo Ilustrado y cómo se manifestó en el reinado de Carlos III. ¿Qué fue el Motín de Esquilache y cuáles fueron sus consecuencias? Describe las principales reformas económicas y sociales de su reinado.',
    alert_markdown: '⚠️ El **Motín de Esquilache (1766)** parece un hecho anecdótico (las capas y sombreros) pero tiene gran importancia: fue el pretexto para **expulsar a los Jesuitas de España**, una de las medidas más importantes del reinado. Siempre mencionar la expulsión jesuita como consecuencia.',
  },

  // ─── PARTE 23: POLÍTICA AMERICANA DE LOS BORBONES ────────────────────────────

  {
    sort_order: 52,
    block_key: 'El Siglo XVIII: Los Borbones',
    block_slug: 'siglo-xviii-borbones',
    title: 'La Política Americana de los Borbones: Virreinatos, Comercio y Pactos de Familia',
    concept_markdown: `## Las Reformas Borbónicas en América (Siglo XVIII)

Los Borbones transformaron la relación con las colonias americanas: América dejó de ser considerada un patrimonio personal de la Corona de Castilla para convertirse en una **colonia económica** explotada racionalmente por la nueva burocracia.

### 1. Las Reformas Administrativas

Para reforzar el control y la eficiencia fiscal frente al contrabando británico:
- **Nuevos Virreinatos:** El inmenso Virreinato del Perú fue dividido para crear el **Virreinato de Nueva Granada (1739)** —Colombia, Venezuela, Ecuador actual— y el **Virreinato del Río de la Plata (1776)** —Argentina, Uruguay, Paraguay, Bolivia—, facilitando la defensa de las costas atlánticas
- **Generalización de las Intendencias en América:** Se sustituyó a los corregidores locales corruptos por Intendentes con amplios poderes, nombrados directamente desde Madrid
- **Ejército Colonial Permanente:** Se creó un ejército defensivo colonial integrado por criollos y peninsulares para repeler los ataques navales británicos

### 2. El Impacto Económico: El Decreto de Libre Comercio (1778)

Las colonias se convirtieron en un **mercado reservado** para absorber los productos manufacturados españoles y proveer de materias primas baratas (azúcar, cacao, tabaco, café). El **Decreto de Libre Comercio de 1778** abrió el comercio con América a 13 puertos peninsulares (antes monopolio de Cádiz), dinamizando especialmente la economía de **Cataluña y el litoral mediterráneo**.

### 3. Los Pactos de Familia contra Gran Bretaña

Para defender el Imperio americano frente al expansionismo colonial británico, España firmó tres alianzas militares con Francia, gobernada por la misma dinastía Borbón:
- **Primer Pacto de Familia (1733):** Felipe V durante las guerras en Italia
- **Segundo Pacto de Familia (1743):** Felipe V durante la Guerra de Sucesión austriaca
- **Tercer Pacto de Familia (1761):** Carlos III → arrastró a España a la **Guerra de los Siete Años** contra Gran Bretaña. Posteriormente, España apoyó a los colonos americanos en la **Guerra de Independencia de EE. UU. (1775–1783)** contra Gran Bretaña. La **Paz de Versalles (1783)** permitió a España recuperar **Menorca** y **Florida**.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué reformas introdujeron los Borbones en la América española durante el siglo XVIII? ¿Qué fueron los Pactos de Familia?*

**Reformas americanas — tres ejes:**
1. **Administrativo:** 2 nuevos Virreinatos (Nueva Granada 1739, Río de la Plata 1776) + Intendencias + ejército colonial
2. **Económico:** Decreto de Libre Comercio (1778) → 13 puertos pueden comerciar con América → fin del monopolio de Cádiz → boom catalán
3. **Fiscal:** Mayor control para combatir el contrabando → mayor recaudación

**Pactos de Familia:**
- 3 alianzas militares Francia-España (misma dinastía Borbón) frente a Gran Bretaña
- Clave: el Tercero (1761) → España entra en la Guerra de los 7 Años + apoya la independencia americana → Paz de Versalles (1783) → recupera Menorca y Florida

**Paradoja:** España apoyó la independencia de las colonias americanas británicas (EE.UU.), lo que dio ejemplo a sus propias colonias 30 años después.`,
    practice_prompt: 'Describe las reformas administrativas y económicas que los Borbones introdujeron en la América española durante el siglo XVIII. ¿Qué fueron los Pactos de Familia y cuál fue el papel de España en la independencia de los Estados Unidos?',
    alert_markdown: null,
  },
]

const BATCH_SIZE = 10

async function main() {
  console.log(`Insertando ${cards.length} tarjetas del Bloque 6 (Siglo XVIII: Los Borbones)…`)

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
    console.log(`\n✅ Bloque 6 insertado. Total filas historia_espana en tabla: ${count}`)
  }
}

main()
