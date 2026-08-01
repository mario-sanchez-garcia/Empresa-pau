// Uso: node --env-file=.env.local docs/insert_historia_b10.mjs
// Bloque 10 — La Segunda República: flashcards 89-97
// Partes 45-48 de los apuntes de Diego

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const SUBJECT = 'historia_espana'

const cards = [

  // ─── PARTE 45A: PROCLAMACIÓN DE LA REPÚBLICA ──────────────────────────────────

  {
    sort_order: 89,
    block_key: 'La Segunda República',
    block_slug: 'segunda-republica',
    title: 'La Proclamación de la Segunda República y el Gobierno Provisional (14 de abril de 1931)',
    concept_markdown: `## La Proclamación de la Segunda República (14 de abril de 1931)

### Las Elecciones Municipales del 12 de abril de 1931

Las elecciones del **12 de abril de 1931** no eran formalmente un plebiscito sobre la monarquía, pero así las interpretaron todos los actores políticos. Los resultados fueron contundentes en las ciudades: la coalición republicano-socialista obtuvo la victoria en **41 de las 50 capitales de provincia**, aunque los monárquicos ganaron en el cómputo global gracias al voto rural (donde el caciquismo seguía funcionando).

El gobierno de Aznar y Alfonso XIII interpretaron el resultado como un rechazo popular a la monarquía. El rey se negó a abdicar formalmente pero decidió abandonar España para *"evitar que una guerra civil baña el país en sangre"*, según sus propias palabras. Salió de Madrid hacia Cartagena la noche del **13 de abril** y embarcó hacia el exilio.

### La Proclamación (14 de abril de 1931)

El **14 de abril de 1931**, antes incluso de que el rey abandonara el país, se fueron proclamando repúblicas en distintas ciudades españolas. En **Éibar** (Guipúzcoa) fue la primera, a las 6:30 de la mañana. A las 17:15 horas, **Niceto Alcalá-Zamora** proclamó la República desde el balcón del Ministerio de la Gobernación en la Puerta del Sol de Madrid, entre una multitud delirante.

### El Gobierno Provisional

Se constituyó un **Gobierno Provisional** presidido por Niceto Alcalá-Zamora (republicano conservador), con ministros de distintas familias republicanas y los socialistas:

| Cargo | Persona | Partido |
|---|---|---|
| Presidente del Gobierno | Niceto Alcalá-Zamora | Derecha Liberal Republicana |
| Estado (Exteriores) | Alejandro Lerroux | Partido Republicano Radical |
| Gobernación | Miguel Maura | Derecha Liberal Republicana |
| Guerra | Manuel Azaña | Acción Republicana |
| Hacienda | Indalecio Prieto | PSOE |
| Trabajo | Francisco Largo Caballero | PSOE |
| Justicia | Fernando de los Ríos | PSOE |

El Gobierno Provisional convocó elecciones a Cortes Constituyentes para el **28 de junio de 1931**. Los republicanos y socialistas obtuvieron una mayoría aplastante, lo que permitió redactar la Constitución más progresista de la historia española.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Cómo se proclamó la Segunda República el 14 de abril de 1931? ¿Por qué se interpretaron las elecciones municipales como un plebiscito contra la monarquía?*

**Respuesta modelo:**
1. Elecciones municipales (12 abril 1931): republicanos ganan en 41 de 50 capitales → aunque pierden en votos totales (campo caciquil), el resultado urbano es un rechazo inequívoco a la monarquía
2. Alfonso XIII no abdica → simplemente abandona España (13-14 abril)
3. 14 abril: se proclaman repúblicas en distintas ciudades → Éibar a las 6:30 → Alcalá-Zamora en Madrid a las 17:15
4. Se forma Gobierno Provisional (republicanos + socialistas) → convoca Cortes Constituyentes (28 junio 1931)

**Clave:** la República llegó sin revolución, sin derramamiento de sangre, aprovechando el vacío que dejó Alfonso XIII al marcharse. Ese origen pacífico fue también su debilidad: no hubo ruptura total con las estructuras del Antiguo Régimen.`,
    practice_prompt: 'Explica cómo se proclamó la Segunda República española el 14 de abril de 1931. ¿Qué papel jugaron las elecciones municipales del 12 de abril? ¿Quiénes integraron el Gobierno Provisional?',
    alert_markdown: null,
  },

  // ─── PARTE 45B: CONSTITUCIÓN DE 1931 ──────────────────────────────────────────

  {
    sort_order: 90,
    block_key: 'La Segunda República',
    block_slug: 'segunda-republica',
    title: 'La Constitución de 1931: Características y el Debate Religioso',
    concept_markdown: `## La Constitución de 1931

Aprobada el **9 de diciembre de 1931** por las Cortes Constituyentes (elegidas el 28 de junio de 1931), fue la **constitución más progresista de la historia española**. Sus características fundamentales:

### Principios Generales

- España se definía como *"una República democrática de trabajadores de toda clase"*, con soberanía popular.
- Estado **laico** (no confesional): separación Iglesia-Estado, supresión del presupuesto de culto y clero, disolución de los jesuitas (art. 26).
- **Amplio catálogo de derechos:** libertad de expresión, reunión, asociación, enseñanza, conciencia y culto.
- **Sufragio universal**, incluido el **sufragio femenino** (aprobado gracias al discurso de Clara Campoamor el 1 de octubre de 1931, frente a la oposición de la republicana Victoria Kent y del PSOE).

### Organización del Estado

- **Estado integral:** ni unitario centralista ni federal, pero reconocía la posibilidad de **Estatutos de Autonomía** para las regiones. El *Estatuto de Cataluña* (Estatut de Núria) fue aprobado en septiembre de **1932**; el *Estatuto del País Vasco* en octubre de **1936** (ya durante la guerra).
- **Cortes unicamerales:** se suprimió el Senado, considerado un bastión conservador.
- **Presidente de la República:** elegido por compromisarios y diputados para un mandato de 6 años. Podía disolver las Cortes dos veces por mandato, pero la segunda disolución requería ratificación parlamentaria.
- **Tribunal de Garantías Constitucionales:** primer tribunal constitucional de la historia española.

### El Debate Más Polémico: La Cuestión Religiosa (artículos 26 y 27)

El **artículo 26** fue el más controvertido de toda la Constitución:
- Disolvía la Compañía de Jesús (jesuitas) por considerarla peligrosa para el Estado.
- Prohibía a las órdenes religiosas dedicarse a la enseñanza, el comercio y la industria.
- Suprimía la financiación estatal del clero en un plazo de dos años.

**Niceto Alcalá-Zamora** y **Miguel Maura** (católicos) dimitieron del gobierno provisional en protesta. La cuestión religiosa fue el **principal factor de movilización de la derecha católica contra la República**.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Cuáles fueron las características principales de la Constitución de 1931? ¿Por qué fue tan conflictiva la cuestión religiosa?*

**Características:**
1. "República democrática de trabajadores" → soberanía popular
2. Estado laico → separación Iglesia-Estado + disolución jesuitas (art. 26)
3. Sufragio universal INCLUIDA la mujer (1ª vez en España) → Clara Campoamor
4. Estado integral → Estatutos de Autonomía (Cataluña 1932, País Vasco 1936)
5. Cortes unicamerales → sin Senado
6. Presidente de la República (6 años) + Tribunal de Garantías Constitucionales

**Cuestión religiosa:**
- Art. 26: disuelve jesuitas + prohíbe enseñanza de órdenes + suprime financiación
- Alcalá-Zamora y Maura dimitieron → la Constitución pierde el apoyo del ala católica moderada
- La Iglesia se convirtió en el mayor movilizador de la derecha contra la República`,
    practice_prompt: 'Analiza las características principales de la Constitución de 1931. ¿Qué novedades introdujo respecto a constituciones anteriores? ¿Por qué el artículo 26 sobre las órdenes religiosas fue tan polémico? ¿Qué fue el sufragio femenino y gracias a quién se aprobó?',
    alert_markdown: '⚠️ El **sufragio femenino** se aprobó en 1931 gracias a **Clara Campoamor** (Partido Radical), no al PSOE. De hecho, el PSOE y **Victoria Kent** (republicana) votaron CONTRA el sufragio femenino con el argumento de que las mujeres votarían como les dijeran los curas. Este detalle sorprende y suele caer en PAU.',
  },

  // ─── PARTE 46A: BIENIO REFORMISTA — REFORMA MILITAR Y AGRARIA ─────────────────

  {
    sort_order: 91,
    block_key: 'La Segunda República',
    block_slug: 'segunda-republica',
    title: 'El Bienio Reformista: Reforma Militar y Reforma Agraria (1931–1933)',
    concept_markdown: `## El Bienio Reformista (1931–1933): Las Grandes Reformas

El gobierno del Bienio Reformista estuvo presidido por **Manuel Azaña** (presidente del Consejo de Ministros desde octubre de 1931) con apoyo parlamentario socialista. Fue el período de mayor activismo reformador de la República.

### 1. La Reforma Militar

Azaña, como ministro de Guerra, acometió la reforma más urgente: el ejército español tenía un exceso brutal de oficiales (un general por cada 150 soldados). Sus medidas:

- **Ley Azaña (junio de 1931):** ofreció a los oficiales el retiro voluntario con la paga íntegra. Unos **8.000 oficiales** (de 21.000) se acogieron al retiro. El ejército quedó reducido de 16 a 8 divisiones.
- Supresión de la **Capitanía General de Madrid** y sustitución por la figura del Jefe del Estado Mayor Central.
- Cierre de la **Academia General Militar de Zaragoza** (dirigida por el general Franco desde 1928), lo que generó una profunda antipatía personal de Franco hacia Azaña.
- Exigencia de **juramento de fidelidad a la República** a todos los oficiales.

La reforma redujo el número de efectivos, pero creó un núcleo de oficiales resentidos que serían el germen del golpe de 1936.

### 2. La Reforma Agraria

Era la reforma más esperada y necesaria: el campo español estaba caracterizado por el **latifundismo** en el sur (Andalucía, Extremadura, Castilla-La Mancha) y el **minifundismo** en el norte, con millones de jornaleros sin tierra.

- **Ley de Reforma Agraria (septiembre de 1932):** establecía la expropiación, con indemnización, de las grandes fincas no cultivadas directamente por sus propietarios, tierras de la nobleza (Grandes de España), tierras arrendadas sistemáticamente y tierras deficientemente cultivadas. Las fincas expropiadas pasarían al **Instituto de Reforma Agraria (IRA)** para ser distribuidas entre los campesinos sin tierra.
- **Resultados decepcionantes:** en dos años (1932–1933) solo se asentaron unos **12.000 campesinos** sobre tierras expropiadas, frente a los 75.000 anuales previstos. La burocracia, la escasez de presupuesto, la resistencia de los propietarios y los problemas técnicos lastraron la aplicación de la ley.
- El lento ritmo de la reforma desilusionó profundamente a los jornaleros, que protagonizaron ocupaciones de tierras y huelgas agrícolas (Casas Viejas, enero de 1933).`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Cuáles fueron los objetivos y resultados de la Reforma Militar y la Reforma Agraria durante el Bienio Reformista?*

**Reforma Militar:**
- Problema: ejército hipertrofiado (1 general / 150 soldados)
- Solución: Ley Azaña (junio 1931) → retiro voluntario con paga íntegra → 8.000 de 21.000 oficiales se van
- Consecuencia imprevista: los que se quedan (incluyendo Franco) están resentidos → germen del golpe de 1936
- Cierre Academia Zaragoza → Franco guarda rencor personal a Azaña

**Reforma Agraria:**
- Problema: latifundismo en el sur (Andalucía, Extremadura) + millones de jornaleros sin tierra
- Ley de Reforma Agraria (sept. 1932): expropiación de grandes fincas + IRA + distribución a campesinos
- Resultado: solo 12.000 asentados en 2 años (previsión: 75.000/año) → fracaso práctico
- Consecuencia: desilusión de los jornaleros → Casas Viejas (1933) → fin del bienio`,
    practice_prompt: 'Explica los objetivos y los resultados de la Reforma Militar y la Reforma Agraria durante el Bienio Reformista (1931-1933). ¿Por qué la reforma agraria fue un fracaso en la práctica? ¿Qué relación tuvo la reforma militar con el posterior golpe de 1936?',
    alert_markdown: null,
  },

  // ─── PARTE 46B: BIENIO REFORMISTA — EDUCACIÓN, RELIGIÓN, ESTATUTO CATALUÑA ────

  {
    sort_order: 92,
    block_key: 'La Segunda República',
    block_slug: 'segunda-republica',
    title: 'El Bienio Reformista: Reforma Educativa, Religiosa y Estatuto de Cataluña',
    concept_markdown: `## El Bienio Reformista: Educación, Religión y Autonomía (1931–1933)

### 3. La Reforma Educativa

La República apostó por la educación laica y pública como palanca de transformación social:
- **Construcción masiva de escuelas:** se construyeron **7.000 nuevas escuelas** en 1931–1932 (frente a las 5.000 que en promedio se habían construido en décadas anteriores).
- **Las Misiones Pedagógicas (1931):** organismos que llevaban cultura (teatro, cine, música, bibliotecas ambulantes) a las zonas rurales más aisladas. Participaron intelectuales como **García Lorca**, con el teatro universitario *La Barraca*.
- **Laicización de la enseñanza:** prohibición del crucifijo en las escuelas, exigencia de titulación civil a los maestros y sustitución progresiva de los religiosos en la enseñanza.
- **Ley de Congregaciones Religiosas (1933):** concretaba la sustitución de las órdenes religiosas en la enseñanza para octubre de 1933.

### 4. La Reforma Religiosa

Además de lo establecido en la Constitución:
- **Secularización de los cementerios.**
- **Matrimonio civil** y divorcio legal (Ley del Divorcio, marzo de 1932).
- **Supresión del presupuesto de culto y clero.**
- **Quema de conventos (mayo de 1931):** el 11 de mayo de 1931 ardieron decenas de conventos e iglesias en Madrid, Málaga, Murcia y otras ciudades, sin que el gobierno interviniera con suficiente rapidez. El cardenal Segura, arzobispo de Toledo, fue expulsado de España por sus ataques a la República.

### 5. El Estatuto de Autonomía de Cataluña (Estatut de Núria, 1932)

El *Estatuto de Autonomía de Cataluña (Estatut de Núria)*, aprobado en referéndum catalán en agosto de 1931 con el 99% de los votos, fue sometido al Parlamento español. Tras largos debates, fue aprobado el **9 de septiembre de 1932**, estableciendo:
- La **Generalitat** como gobierno autónomo catalán.
- **Cooficialidad del catalán** junto al castellano.
- Competencias en orden público, enseñanza y hacienda (muy recortadas respecto al proyecto original).`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Cuáles fueron las reformas educativas de la Segunda República? ¿Qué fue el Estatuto de Núria?*

**Reforma educativa:**
- 7.000 escuelas nuevas en 1931-32 → mayor expansión de la educación pública de la historia española hasta entonces
- Misiones Pedagógicas → llevan cultura al campo (García Lorca + La Barraca)
- Laicización → crucifijos fuera + profesores civiles + sustitución de religiosos

**Reforma religiosa:**
- Divorcio civil + matrimonio civil + secularización cementerios
- Quema de conventos (mayo 1931) → el gobierno no actuó con suficiente rapidez → descrédito inicial

**Estatuto de Cataluña:**
- Referéndum catalán (agosto 1931): 99% a favor del Estatut de Núria
- Parlamento español lo recorta y aprueba (9 septiembre 1932)
- Resultado: Generalitat + cooficialidad del catalán + competencias limitadas`,
    practice_prompt: 'Describe las reformas educativas del Bienio Reformista. ¿Qué fueron las Misiones Pedagógicas? Explica también el proceso de aprobación del Estatuto de Autonomía de Cataluña (1932): ¿qué fue el Estatut de Núria y qué establecía?',
    alert_markdown: null,
  },

  // ─── PARTE 46C: SANJURJADA Y CASAS VIEJAS ────────────────────────────────────

  {
    sort_order: 93,
    block_key: 'La Segunda República',
    block_slug: 'segunda-republica',
    title: 'La Sanjurjada (1932) y el Fin del Bienio Reformista: Casas Viejas (1933)',
    concept_markdown: `## La Sanjurjada (10 de agosto de 1932)

El general **José Sanjurjo**, director de la Guardia Civil, protagonizó el primer intento de golpe de Estado contra la República el **10 de agosto de 1932**, coordinado entre Sevilla (donde él actuó) y Madrid (donde el general González Carrasco fracasó).

El golpe fue un fracaso total: en Madrid no hubo movimiento apreciable, y en Sevilla, Sanjurjo fue detenido al intentar huir hacia Portugal. Fue juzgado, condenado a muerte, y la pena fue conmutada por Alcalá-Zamora por cadena perpetua. Amnistiado en 1934 tras el triunfo electoral de la derecha, se exilió a Portugal, desde donde participó en la conspiración de 1936. Murió el **20 de julio de 1936** en un accidente de avioneta en Cascais (Portugal), al intentar regresar a España para encabezar el alzamiento.

Paradójicamente, la Sanjurjada **reforzó** al gobierno de Azaña: la aprobación del Estatuto catalán y la Ley de Reforma Agraria (pendientes desde meses) se aceleró para mostrar la solidez republicana.

## El Fin del Bienio Reformista: Casas Viejas (enero de 1933)

El **10 de enero de 1933**, la CNT convocó una insurrección libertaria en varias localidades. En **Casas Viejas** (Cádiz), un grupo de campesinos anarquistas se atrincheró en la choza del anciano **"Seisdedos"**. La Guardia de Asalto (policía republicana) sitió la choza y la incendió, matando a sus ocupantes, y fusiló posteriormente a otros **14 detenidos sin juicio**.

La matanza de Casas Viejas supuso un golpe devastador para la imagen del gobierno Azaña:
- La derecha lo utilizó como prueba de la brutalidad republicana.
- Los anarquistas retiraron su apoyo a la República.
- Azaña perdió la mayoría parlamentaria y Alcalá-Zamora convocó elecciones para **noviembre de 1933**.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fue la Sanjurjada? ¿Qué fue Casas Viejas y qué consecuencias tuvo para el gobierno de Azaña?*

**La Sanjurjada (agosto 1932):**
- General Sanjurjo → 1er golpe de Estado contra la República
- Fracaso total: Madrid sin movimiento + Sanjurjo detenido en Sevilla
- Condenado a muerte → conmutado a cadena perpetua → amnistiado 1934
- Paradoja: el golpe fortaleció a Azaña (aceleró Estatuto catalán y Reforma Agraria)

**Casas Viejas (enero 1933):**
- CNT convoca insurrección libertaria
- Casas Viejas (Cádiz): campesinos anarquistas se atrinchera en choza de "Seisdedos"
- Guardia de Asalto: quema la choza + fusila 14 detenidos sin juicio
- Consecuencias: descrédito total del gobierno Azaña → pierde mayoría → Alcalá-Zamora convoca elecciones (nov. 1933)`,
    practice_prompt: 'Explica el intento de golpe de Estado conocido como la Sanjurjada (agosto de 1932): ¿quién lo protagonizó, por qué fracasó y qué consecuencias tuvo? Describe también la matanza de Casas Viejas (enero de 1933) y sus consecuencias políticas para el gobierno de Azaña.',
    alert_markdown: '⚠️ **Sanjurjo** murió en julio de 1936 en un accidente de avioneta al intentar volar de Portugal a España para encabezar el alzamiento. Su muerte fue decisiva: dejó el liderazgo del golpe en manos de Franco, que acabó siendo el jefe indiscutible.',
  },

  // ─── PARTE 47A: BIENIO RADICAL-CEDISTA ───────────────────────────────────────

  {
    sort_order: 94,
    block_key: 'La Segunda República',
    block_slug: 'segunda-republica',
    title: 'El Bienio Radical-Cedista: Elecciones de 1933 y la Contrarreforma (1933–1935)',
    concept_markdown: `## El Bienio Radical-Cedista (1933–1936): La Contrarreforma

### Las Elecciones de Noviembre de 1933

Las elecciones del **19 de noviembre de 1933** se celebraron con dos novedades cruciales:
- **Por primera vez votaron las mujeres** (sufragio femenino aprobado en 1931).
- La izquierda fue fragmentada y desunida; la derecha fue cohesionada y organizada.

Resultados:
- La recién creada **CEDA (Confederación Española de Derechas Autónomas)**, liderada por **José María Gil-Robles**, fue el partido más votado con ~115 escaños. La CEDA era un partido democristiano de masas, ambiguo en su adhesión a la República, que aglutinaba al catolicismo político.
- El **Partido Republicano Radical** de **Alejandro Lerroux** obtuvo ~102 escaños.
- Los socialistas (PSOE) se hundieron de 116 a 58 escaños.
- La CNT llamó a la abstención, lo que perjudicó gravemente a la izquierda en zonas de su influencia.

El gobierno lo formó Lerroux con apoyo parlamentario de la CEDA, en una coalición **radical-cedista** que los socialistas y la izquierda republicana interpretaron como el equivalente español al ascenso del fascismo al poder: Mussolini en Italia y Hitler en Alemania también habían llegado al gobierno por vías legales.

### La Contrarreforma del Bienio

El Bienio Radical-Cedista procedió a desmantelar o paralizar las reformas del bienio anterior:
- **Reforma agraria paralizada:** la Ley de Amnistía de abril de 1934 liberó a los implicados en la Sanjurjada e incluyó la devolución de tierras a los Grandes de España expropiados.
- **Ley de Congregaciones Religiosas suspendida:** los religiosos pudieron seguir enseñando.
- **Amnistía a los militares** comprometidos en la Sanjurjada.
- **Paralización del Estatuto de Cataluña:** conflictos permanentes con la Generalitat de Lluís Companys (sucesor de Macià, fallecido en diciembre de 1933) sobre la Ley de Contratos de Cultivo (Ley de Rabassa Morta).
- **Aumento del presupuesto militar** y rehabilitación de generales sancionados.

### El Fin del Bienio: El Escándalo del Estraperlo (1935)

En 1935, estalló el escándalo del **"estraperlo"** (nombre de una ruleta trucada que unos empresarios holandeses habían introducido en casinos españoles con el supuesto consentimiento de dirigentes del Partido Radical). El escándalo salpicó directamente al Partido Radical de Lerroux, destruyendo su credibilidad. Alcalá-Zamora disolvió las Cortes y convocó elecciones para **febrero de 1936**.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fue el Bienio Radical-Cedista? ¿Cómo se produjo la contrarreforma y qué fue el escándalo del Estraperlo?*

**Elecciones nov. 1933:**
- 1ª vez que votan las mujeres → la izquierda (que aprobó el sufragio femenino) pierde
- CEDA (Gil-Robles): ~115 escaños → 1er partido
- Lerroux (Radical): ~102 escaños
- PSOE: de 116 a 58 escaños
- CNT llama a la abstención → perjudica a la izquierda

**Gobierno Lerroux + apoyo CEDA:**
- La izquierda lo interpreta como fascismo español (como Mussolini/Hitler)
- Contrarreforma: paralización reforma agraria + suspensión Ley Congregaciones + amnistía Sanjurjada + suspensión Estatuto catalán

**Estraperlo (1935):** ruleta trucada + corrupción Partido Radical → Lerroux desacreditado → Alcalá-Zamora convoca elecciones para feb. 1936`,
    practice_prompt: '¿Qué resultados dieron las elecciones de noviembre de 1933? ¿Qué fue la CEDA y por qué la izquierda la consideraba comparable al fascismo? Explica la política de contrarreforma del Bienio Radical-Cedista y el escándalo del Estraperlo.',
    alert_markdown: '⚠️ El término **"estraperlo"** pasó al lenguaje popular español para designar el mercado negro y la corrupción en general. Deriva del nombre de la ruleta "Straperlo" de los empresarios holandeses Daniel Strauss y Perlo. Es un dato que aparece a veces en exámenes de vocabulario histórico.',
  },

  // ─── PARTE 47B: REVOLUCIÓN DE OCTUBRE DE 1934 ────────────────────────────────

  {
    sort_order: 95,
    block_key: 'La Segunda República',
    block_slug: 'segunda-republica',
    title: 'La Revolución de Octubre de 1934: Asturias y Cataluña',
    concept_markdown: `## La Revolución de Octubre de 1934

El detonante fue la entrada de tres ministros de la CEDA en el gobierno el **4 de octubre de 1934**. Los socialistas, que llevaban meses preparando una respuesta insurreccional si la CEDA accedía al poder, declararon la **huelga general revolucionaria**.

### En Madrid y el Resto de España

La huelga fracasó rápidamente. El gobierno declaró el estado de guerra y el ejército sofocó los focos de resistencia en pocas horas.

### En Cataluña

El presidente de la Generalitat, **Lluís Companys**, proclamó el **6 de octubre de 1934** el *"Estat Català dins la República Federal Espanyola"* desde el balcón del Palau de la Generalitat. El general **Domingo Batet** (capitán general de Cataluña) sofocó la revuelta en pocas horas; Companys y el gobierno catalán fueron detenidos y juzgados. El Estatuto de Cataluña fue suspendido.

### En Asturias: La "Comuna" Asturiana

El único lugar donde la revolución triunfó inicialmente fue Asturias. Mineros socialistas, anarquistas y comunistas formaron una **alianza obrera** sin precedentes (el llamado *"frente único"*). Durante casi dos semanas (5–18 de octubre de 1934), los mineros armados con dinamita controlaron las cuencas mineras, atacaron cuarteles de la Guardia Civil y ocuparon Mieres, Sama de Langreo y el barrio de La Felguera. Intentaron tomar Oviedo sin conseguirlo totalmente.

El gobierno encargó la represión al general **Francisco Franco**, quien utilizó las tropas del Tercio (Legión) y los Regulares marroquíes —veteranos de la guerra colonial— para sofocar la revuelta. La represión fue durísima:
- **~1.300–2.000 muertos** durante los combates.
- **~30.000 detenidos.**
- Denuncias de torturas y ejecuciones extrajudiciales.

La Revolución de Octubre de 1934 tuvo consecuencias determinantes: radicalizó a ambos lados del espectro político, convirtió a **Franco** en el general imprescindible para la derecha y demostró que la vía insurreccional era una opción real para la izquierda.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fue la Revolución de Octubre de 1934? ¿Qué ocurrió en Asturias? ¿Qué consecuencias tuvo?*

**Detonante:** entrada de 3 ministros CEDA en el gobierno (4 octubre 1934) → la izquierda lo interpreta como "el fascismo llega al poder"

**Tres frentes:**
1. Madrid y el resto: huelga fracasa en horas → ejército sofoca todo
2. Cataluña: Companys proclama "Estat Català" (6 octubre) → General Batet lo detiene en horas → Estatuto catalán suspendido + Companys juzgado
3. Asturias: "la Comuna" → mineros (socialistas + anarquistas + comunistas juntos, por 1ª vez) → controlan cuencas mineras 2 semanas → Franco usa Legión y Regulares marroquíes → 1.300-2.000 muertos + 30.000 detenidos

**Consecuencias:**
- Franco: el "hombre necesario" para la derecha
- La izquierda: la vía insurreccional es real y posible
- Radicalización general → 1936 inevitable`,
    practice_prompt: 'Explica la Revolución de Octubre de 1934. ¿Qué ocurrió en Asturias, en Cataluña y en el resto de España? ¿Qué papel jugó el general Franco en la represión? ¿Cuáles fueron las consecuencias políticas de la revolución?',
    alert_markdown: '⚠️ En Asturias de 1934 se produjo la alianza **UGT + CNT + PCE** (socialistas + anarquistas + comunistas trabajando juntos). Fue la ÚNICA vez antes de la Guerra Civil en que los tres grandes movimientos obreros cooperaron. Este "frente único" fue un antecedente directo del Frente Popular de 1936.',
  },

  // ─── PARTE 48A: FRENTE POPULAR Y PRIMAVERA TRÁGICA ───────────────────────────

  {
    sort_order: 96,
    block_key: 'La Segunda República',
    block_slug: 'segunda-republica',
    title: 'El Frente Popular: Elecciones de Febrero de 1936 y la "Primavera Trágica"',
    concept_markdown: `## El Frente Popular y la "Primavera Trágica" (1936)

### Las Elecciones de Febrero de 1936 y el Frente Popular

El **Frente Popular**: coalición electoral de izquierdas formada por el PSOE, Izquierda Republicana (Azaña), Unión Republicana, PCE, POUM y otras fuerzas, que suscribió un programa mínimo común: amnistía para los presos de octubre de 1934, restauración del Estatuto catalán y reanudación de las reformas del Bienio Reformista.

Las elecciones del **16 de febrero de 1936** dieron la victoria al Frente Popular por un margen estrecho de votos pero amplio en escaños (debido al sistema electoral mayoritario):

| Coalición | Votos (aprox.) | Escaños |
|---|---|---|
| Frente Popular | 4.654.116 (47,1%) | ~263 |
| Frente Nacional (derecha) | 4.503.524 (45,6%) | ~156 |
| Centro | ~449.000 (5,4%) | ~54 |

Azaña formó gobierno con republicanos de izquierda (sin ministros socialistas). El PSOE apoyó parlamentariamente pero no participó en el ejecutivo.

### La "Primavera Trágica" (febrero–julio de 1936)

Los cinco meses que mediaron entre las elecciones y el golpe de Estado fueron de una tensión política extrema, conocidos como la *"primavera trágica"*:
- **Amnistía y liberación** de los ~30.000 presos de octubre de 1934.
- **Ocupaciones de tierras** en Extremadura y Andalucía: los jornaleros, hastiados de esperar, ocuparon fincas por su cuenta. El gobierno las legalizó *a posteriori*.
- **Oleada de huelgas** en toda España.
- **Violencia política callejera** entre milicias de izquierda (socialistas, comunistas, anarquistas) y de derecha (Falange Española, Requetés carlistas). José Antonio Primo de Rivera (fundador de Falange, detenido en marzo de 1936) estaba en prisión pero la organización siguió actuando.
- **Incendios de iglesias y sedes políticas.**

### El Asesinato de Calvo Sotelo (13 de julio de 1936)

El **12 de julio de 1936**, fue asesinado el teniente de la Guardia de Asalto José Castillo (militante socialista). La noche del **13 de julio**, como represalia, guardias de asalto y militantes socialistas detuvieron en su domicilio a **José Calvo Sotelo** y lo asesinaron de un tiro en la nuca, depositando su cadáver en el cementerio de la Almudena. El asesinato de Calvo Sotelo fue el **detonante final** que convenció a los conspiradores militares de que el golpe no podía esperar más.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fue el Frente Popular y qué resultados dio en las elecciones de febrero de 1936? ¿Qué fue la "primavera trágica"?*

**Frente Popular:**
- Coalición: PSOE + Izquierda Republicana + PCE + POUM + Unión Republicana
- Programa: amnistía presos + restauración Estatuto catalán + reanudar reformas
- Elecciones 16 feb. 1936: ganan con 47,1% votos → 263 escaños vs 156 de la derecha
- Gobierno: Azaña presidente (sólo republicanos de izquierda, sin ministros socialistas)

**"Primavera trágica" (feb.-julio 1936):**
- Amnistía de 30.000 presos de oct. 1934
- Ocupaciones de tierras en Andalucía y Extremadura
- Oleada de huelgas + violencia callejera (milicias de izquierda vs Falange + Requetés)
- Asesinato de Calvo Sotelo (13 julio 1936) → detonante final del golpe`,
    practice_prompt: '¿Qué fue el Frente Popular y qué partidos lo integraban? ¿Qué resultados dieron las elecciones de febrero de 1936? Describe la "primavera trágica" (febrero-julio 1936): ¿qué tipo de violencia y tensiones se vivieron? ¿Qué fue el asesinato de Calvo Sotelo y por qué fue tan relevante?',
    alert_markdown: '⚠️ El Frente Popular ganó las elecciones de febrero de 1936 con un margen de votos muy estrecho (47% vs 46%), pero la ley electoral mayoritaria le dio una ventaja enorme en escaños. La derecha nunca aceptó la derrota como legítima. Este dato es importante para entender la legitimidad (o ilegitimidad) del golpe de julio.',
  },

  // ─── PARTE 48B: LA CONSPIRACIÓN MILITAR ──────────────────────────────────────

  {
    sort_order: 97,
    block_key: 'La Segunda República',
    block_slug: 'segunda-republica',
    title: 'La Conspiración Militar y el Alzamiento de Julio de 1936',
    concept_markdown: `## La Conspiración Militar contra la República (1936)

La conspiración contra la República había comenzado prácticamente desde las elecciones de febrero. Su coordinador fue el general **Emilio Mola** (general de brigada destinado en Pamplona), apodado **"el Director"**.

### Los Principales Conspiradores

- **Emilio Mola:** organizador y cerebro de la conspiración. Destinado en Pamplona, tejió la red de contactos con los distintos cuerpos del ejército y las fuerzas civiles (carlistas, falangistas).
- **José Sanjurjo:** figura nominal de la conspiración como jefe del alzamiento, en el exilio en Portugal. Muerto el 20 de julio de 1936 en accidente de avioneta en Cascais al intentar volar a España.
- **Francisco Franco:** incorporado tardíamente (solo confirmó su participación el **24 de junio de 1936**); Mola le necesitaba por su prestigio y por el mando sobre las tropas de África (el Ejército de África, la fuerza más temible del ejército español).
- **Manuel Goded, Joaquín Fanjul, Luis Orgaz:** generales comprometidos en distintas plazas.
- Apoyo de **la Falange, el Requeté carlista** y sectores de la CEDA y los monárquicos (Renovación Española).

### El Plan

Alzamiento simultáneo en la Península y Marruecos el **17–18 de julio de 1936**, destinado a un golpe rápido (como el de Primo de Rivera en 1923) que estableciera un directorio militar. **Mola no esperaba una guerra larga.**

### El Alzamiento (17 de julio de 1936)

El **17 de julio de 1936**, el ejército de Marruecos se sublevó en Melilla, Ceuta y Tetuán. El **18 de julio**, el alzamiento se extendió a la Península. El resultado fue:
- **Zonas donde triunfó el golpe:** Marruecos, Galicia, Castilla y León, Navarra, Aragón y parte de Andalucía y Extremadura.
- **Zonas donde fracasó:** Madrid, Barcelona, Valencia, País Vasco, Asturias y gran parte de Castilla-La Mancha.

El fracaso parcial del golpe convirtió lo que debía ser un pronunciamiento rápido en una **guerra civil**, que duraría **casi tres años** (1936–1939).`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Quiénes organizaron la conspiración militar contra la República? ¿Por qué el golpe de julio de 1936 derivó en guerra civil?*

**Conspiradores:**
- Mola ("el Director"): cerebro + coordinador desde Pamplona
- Sanjurjo: jefe nominal (exilio en Portugal) → muere 20 julio 1936
- Franco: se incorpora tarde (24 junio 1936) → Mola lo necesita por el Ejército de África
- Apoyos civiles: Falange + Requeté carlista + monárquicos (Renovación Española)

**El plan:** golpe rápido como el de Primo de Rivera (1923) → directorio militar en días
**El resultado:** alzamiento el 17-18 julio 1936 → triunfa en Marruecos + mitad de España → FRACASA en Madrid, Barcelona, Valencia, País Vasco

**¿Por qué guerra civil?** El golpe no fue ni un éxito total ni un fracaso total → España quedó dividida en dos → comenzó la guerra civil (1936-1939)`,
    practice_prompt: 'Explica la conspiración militar contra la Segunda República en 1936. ¿Quiénes fueron sus principales organizadores? ¿Cuál era el plan de Mola? ¿Por qué el golpe del 17-18 de julio de 1936 no fue un pronunciamiento exitoso sino el inicio de una guerra civil?',
    alert_markdown: '⚠️ Mola planeó un golpe de Estado rápido (tipo 1923), NO una guerra civil. El golpe triunfó en la mitad del país y fracasó en la otra mitad → nadie había previsto ese escenario → la guerra civil fue el resultado de un pronunciamiento que salió mal para todos. Este es el matiz clave que distingue un buen análisis histórico.',
  },
]

const BATCH_SIZE = 5

async function main() {
  console.log(`Insertando ${cards.length} tarjetas del Bloque 10 (La Segunda República)…`)

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
      console.error(`Error en batch ${i + 1}–${Math.min(i + BATCH_SIZE, cards.length)}:`, error)
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
    console.log(`\n✅ Bloque 10 insertado. Total filas historia_espana en tabla: ${count}`)
  }
}

main()
