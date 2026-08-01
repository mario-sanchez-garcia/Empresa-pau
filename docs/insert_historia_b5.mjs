// Uso: node --env-file=.env.local docs/insert_historia_b5.mjs
// Bloque 5 — El Imperio de los Austrias: flashcards 33-47
// Partes 14-19 de los apuntes de Diego

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const SUBJECT = 'historia_espana'

const cards = [

  // ─── PARTE 14: CARLOS V ────────────────────────────────────────────────────────

  {
    sort_order: 33,
    block_key: 'El Imperio de los Austrias',
    block_slug: 'imperio-austrias',
    title: 'La Herencia Territorial de Carlos I y el Imperio de Carlos V',
    concept_markdown: `## Carlos I de España y V de Alemania: La Inmensa Herencia Territorial

Carlos de Habsburgo inauguró en la Península la dinastía de la **Casa de Austria (los Habsburgo)**, concentrando una de las herencias territoriales más inmensas de la historia universal en una sola persona.

### La Herencia Cuádruple

Carlos de Habsburgo recibió de sus cuatro abuelos:
- **De su abuela Isabel I (Castilla):** Corona de Castilla, Navarra, Canarias y América
- **De su abuelo Fernando II (Aragón):** Corona de Aragón, Nápoles, Sicilia y Cerdeña
- **De su abuela María de Borgoña:** el **Franco Condado** y los **Países Bajos** (territorios más ricos y poblados de Europa)
- **De su abuelo Maximiliano I (Habsburgo):** las posesiones austriacas y la candidatura al trono imperial

Carlos llegó a España en 1517 sin hablar castellano y rodeado de consejeros flamencos, lo que provocó un rechazo inmediato.

En **1520**, Carlos fue elegido oficialmente **Emperador del Sacro Imperio Romano Germánico (como Carlos V)**, asumiendo la defensa de la *Universitas Christiana* (la unidad espiritual de Europa bajo el catolicismo). Esto lo convertía en el monarca más poderoso de la Cristiandad.

### Un Imperio con Pies de Barro

Pese a su extensión sin precedentes, el Imperio tenía una grave contradicción: no era un Estado centralizado, sino una unión dinástica de territorios muy distintos, con leyes propias, idiomas diferentes y intereses contrapuestos. La energía y el dinero que tenía que dedicar a mantenerlo unidos agotaron sus recursos.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué territorios heredó Carlos I? ¿Por qué se considera que su herencia fue el origen tanto de la grandeza como del colapso del Imperio español?*

**Respuesta modelo:**
1. Herencia cuádruple: Castilla (América incluida) + Aragón (Italia) + Países Bajos (Franco Condado) + Sacro Imperio (Austria)
2. Grandeza: el mayor imperio del mundo conocido, jamás visto con anterioridad
3. Contradicción: no era un estado centralizado sino una unión dinástica de territorios con leyes propias → imposible gobernar eficazmente
4. Consecuencia financiera: Carlos gastó el oro americano en guerras europeas → bancarrotas → agotamiento de Castilla

**Mapa mental de la herencia:**
- Abuelos Reyes Católicos → Castilla + Aragón + América
- Abuelos Habsburgo/Borgoña → Sacro Imperio + Países Bajos → los más valiosos económicamente`,
    practice_prompt: 'Explica la herencia territorial de Carlos I. ¿De dónde heredó cada territorio? ¿Qué problemas estructurales planteaba gobernar un imperio tan vasto y disperso?',
    alert_markdown: '⚠️ Carlos I (de España) = Carlos V (del Sacro Imperio). El mismo monarca tiene dos numeraciones distintas dependiendo del territorio. En los exámenes PAU se puede usar cualquiera de los dos nombres.',
  },

  {
    sort_order: 34,
    block_key: 'El Imperio de los Austrias',
    block_slug: 'imperio-austrias',
    title: 'Las Comunidades de Castilla (1520–1521)',
    concept_markdown: `## La Revuelta de las Comunidades de Castilla (1520–1521)

Las Comunidades fueron la primera gran revuelta interna de la monarquía de los Habsburgo y uno de los temas más preguntados en PAU sobre el siglo XVI.

### Causas

Carlos I llegó a España en 1517 sin hablar castellano y entregó los principales cargos del gobierno a sus consejeros flamencos. Para financiar su elección como Emperador en Alemania, convocó las Cortes de Santiago y La Coruña en 1520 exigiendo cuantiosos impuestos extraordinarios.

Esto desató la indignación de las ciudades castellanas por tres razones:
- **Política:** Gobierno de extranjeros y ausencia del rey
- **Económica:** Oposición a exportar lana bruta en beneficio de la industria textil flamenca
- **Constitucional:** Defensa de los derechos de las Cortes frente al absolutismo real

### El Conflicto

Las principales ciudades manufactureras de la Meseta (Segovia, Toledo, Burgos, Salamanca) formaron la **Santa Junta**, liderada por los comuneros **Juan de Padilla, Juan Bravo y Francisco Maldonado**. La revuelta comenzó siendo una protesta política y fue derivando hacia un conflicto social antiseñorial.

### El Desenlace: Villalar (23 de abril de 1521)

La alta nobleza, inicialmente neutral, apoyó decididamente al rey cuando la revuelta adquirió tintes antiseñoriales. Los comuneros fueron aplastados en la **Batalla de Villalar (23 de abril de 1521)** y sus tres líderes ejecutados al día siguiente. Esta derrota consolidó el absolutismo de la Corona en Castilla y marginó definitivamente a las Cortes castellanas como órgano de control político.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fueron las Comunidades de Castilla? ¿Cuáles fueron sus causas y consecuencias?*

**Estructura:**
1. Causas: consejeros flamencos + impuestos para elección imperial + exportación de lana → tres dimensiones (política, económica, constitucional)
2. Protagonistas: burguesía urbana (no nobleza) de las ciudades manufactureras de la Meseta
3. Organización: Santa Junta → líderes Padilla, Bravo, Maldonado
4. Punto de inflexión: la revuelta se vuelve antiseñorial → nobleza cambia de bando → apoya al rey
5. Desenlace: Villalar (23 abril 1521) → derrota total → ejecución de los líderes
6. Consecuencias: absolutismo regio consolidado en Castilla → Cortes pierden poder real

**Dato PAU:** Villalar (23 de abril de 1521) es el Día de Castilla y León. Fecha exacta obligatoria.`,
    practice_prompt: 'Describe las causas, desarrollo y consecuencias de la revuelta de las Comunidades de Castilla (1520-1521). ¿Por qué la alta nobleza terminó apoyando al rey y no a los comuneros?',
    alert_markdown: '⚠️ Los comuneros eran **burguesía urbana** (manufactureros, artesanos), NO la alta nobleza que apoyó al rey. Esta distinción social es fundamental. La revuelta fracasó porque las clases bajas rurales la radicalizaron contra los señores, alejando a la nobleza.',
  },

  {
    sort_order: 35,
    block_key: 'El Imperio de los Austrias',
    block_slug: 'imperio-austrias',
    title: 'Las Germanías de Valencia y Mallorca (1519–1523)',
    concept_markdown: `## Las Germanías de Valencia y Mallorca (1519–1523)

Las Germanías fueron la segunda gran revuelta interna que coincidió temporalmente con las Comunidades de Castilla, aunque tuvieron causas y protagonistas muy distintos.

### ¿Qué significa "Germania"?

*Germania* significa en valenciano "hermandad" o "fraternidad". Era el nombre de las asociaciones de oficios artesanales (gremios) en el Reino de Valencia.

### Causas

El conflicto tuvo un origen claramente **social y económico**, no político como las Comunidades:
- Una grave epidemia de **peste** hizo huir a la oligarquía urbana y a la nobleza a sus posesiones rurales, abandonando las ciudades
- Los gremios de artesanos (*agermanats*) aprovecharon el vacío de poder para armarse y tomar el control de las ciudades
- Protestaron contra los **abusos señoriales** y contra la competencia desleal de la **mano de obra morisca**, que trabajaba en las tierras de los nobles a precios que los artesanos libres no podían competir

### Protagonistas: Gremios Artesanos

A diferencia de las Comunidades (burguesía urbana castellana), los protagonistas de las Germanías eran los **gremios artesanos urbanos** y los campesinos de la Corona de Aragón.

### Desenlace

El ejército real y la aristocracia sofocaron sangrientamente las revueltas en Valencia (1521) y Mallorca (1523). La represión posterior reforzó la **alianza entre la Corona y el poder señorial de la nobleza** aragonesa, que se consolidó como el gran apoyo del rey en el territorio.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *Compara las Comunidades de Castilla y las Germanías de Valencia. ¿En qué se parecen y en qué se diferencian?*

**Tabla comparativa:**

| Aspecto | **Comunidades (Castilla)** | **Germanías (Valencia/Mallorca)** |
|---|---|---|
| Protagonistas | Burguesía urbana manufacturera | Gremios artesanos urbanos |
| Causas | Políticas + económicas (impuestos, extranjeros) | Sociales (abusos señoriales, moriscos) |
| Organización | Santa Junta + líderes (Padilla, Bravo, Maldonado) | Gremios (*agermanats*) |
| Resultado | Derrota en Villalar (1521) | Sofocadas (1521-1523) |
| Consecuencia | Absolutismo regio en Castilla | Alianza Corona-nobleza en Aragón |

**Similitudes:** ambas son revueltas de grupos urbanos no nobles, ambas fracasan y consolidan el poder de Carlos I.`,
    practice_prompt: 'Explica las causas y consecuencias de las Germanías de Valencia y Mallorca. ¿En qué se diferencian de las Comunidades de Castilla que estallan al mismo tiempo?',
    alert_markdown: null,
  },

  {
    sort_order: 36,
    block_key: 'El Imperio de los Austrias',
    block_slug: 'imperio-austrias',
    title: 'La Política Exterior de Carlos V: Francia, Turcos y Protestantismo',
    concept_markdown: `## Los Tres Frentes de la Política Exterior de Carlos V

La defensa de la hegemonía europea y del catolicismo universal arrastró a Carlos V a guerras permanentes financiadas con el oro americano y los impuestos de Castilla.

### Frente 1: El Conflicto con Francia

Rivalidad constante con el rey **Francisco I** por el control de los territorios italianos (especialmente el Milanesado, llave del control de Italia). El enfrentamiento culminó en la **Batalla de Pavía (1525)**, donde el ejército imperial capturó al mismísimo rey de Francia. Pese a la victoria, el conflicto nunca se cerró definitivamente y las guerras con Francia continuaron durante todo el siglo XVI.

### Frente 2: El Imperio Otomano

Carlos asumió la defensa de la Cristiandad mediterránea frente a la expansión del **Imperio Otomano de Solimán el Magnífico** y la piratería berberisca del corsario **Barbarroja** en el norte de África. Carlos V tomó **Túnez (1535)** pero fracasó estrepitosamente en la jornada de **Argel (1541)**, siendo derrotado por las tormentas.

### Frente 3: La Reforma Protestante en Alemania

El fraile agustino **Martín Lutero** inició en 1517 la Reforma protestante, cuestionando la autoridad del Papa. Los príncipes alemanes adoptaron el luteranismo para independizarse de la autoridad imperial y quedarse con los bienes de la Iglesia. Carlos V ganó militarmente en la **Batalla de Mühlberg (1547)** contra la Liga de Esmalcalda, pero no pudo frenar la expansión del protestantismo. Agotado y sin dinero, firmó la **Paz de Augsburgo (1555)**, que reconocía la libertad religiosa de los príncipes alemanes (*cuius regio, eius religio*: la religión del pueblo sigue la del príncipe).

En **1556**, Carlos V abdicó en Bruselas, dividiendo su herencia: el Sacro Imperio para su hermano **Fernando** y los reinos hispánicos, Países Bajos e Italia para su hijo **Felipe II**. Se retiró al Monasterio de Yuste (Cáceres), donde murió en 1558.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *Describe la política exterior de Carlos V. ¿Por qué fracasó en contener el protestantismo pese a ganar en Mühlberg?*

**Respuesta modelo:**
- Tres frentes simultáneos: Francia + Otomanos + Protestantismo → ninguno se resuelve definitivamente
- Francia: Batalla de Pavía (1525) → captura de Francisco I, pero la rivalidad continúa
- Turcos: Túnez (1535) = éxito, Argel (1541) = fracaso ante las tormentas
- Protestantismo: Mühlberg (1547) = victoria militar → pero la conversión religiosa no puede revertirse por la fuerza → Paz de Augsburgo (1555) = reconoce el protestantismo

**Clave:** El mayor fracaso de Carlos V fue que pudo vencer militarmente pero no pudo resolver el problema religioso. La paz de Augsburgo es su mayor derrota política.`,
    practice_prompt: 'Describe los tres frentes de la política exterior de Carlos V: Francia, el Imperio Otomano y el Protestantismo alemán. ¿Cuál fue el resultado de la Paz de Augsburgo (1555) y qué supuso para el proyecto imperial?',
    alert_markdown: '⚠️ La **Paz de Augsburgo (1555)** NO implica libertad religiosa individual. El principio es *cuius regio, eius religio*: el rey decide la religión de SU territorio. Los súbditos deben seguir la fe del príncipe o emigrar.',
  },

  // ─── PARTE 15: FELIPE II ───────────────────────────────────────────────────────

  {
    sort_order: 37,
    block_key: 'El Imperio de los Austrias',
    block_slug: 'imperio-austrias',
    title: 'El Modelo Político de Felipe II: Centralización y Burocracia',
    concept_markdown: `## Felipe II: El Rey Burócrata y el Estado Moderno (1556–1598)

Felipe II representó un modelo de gobierno radicalmente distinto al de su padre Carlos V. Mientras Carlos recorría continuamente sus territorios, Felipe II fue un **rey sedentario** que gobernó su inmenso Imperio desde una capital fija.

### La Capital Fija y El Escorial

En **1561**, Felipe II trasladó definitivamente la capital de la monarquía a **Madrid**, ciudad central en la Península y sin privilegios históricos que pudiesen limitar el poder real. Ordenó construir el **Monasterio-Palacio de El Escorial** (1563–1584), que sirvió simultáneamente como residencia real, centro de gobierno, panteón dinástico y símbolo de la Contrarreforma.

### El Sistema Polisinodial

El gobierno se organizaba a través de un complejo entramado de **Consejos**:
- **Consejos Territoriales:** Consejo de Castilla, Consejo de Aragón, Consejo de Italia, Consejo de Indias, Consejo de Portugal (tras 1581)
- **Consejos Temáticos:** Consejo de Estado (política exterior), Consejo de Guerra, Consejo de la Inquisición, Consejo de Hacienda

Los **secretarios reales** actuaban como intermediarios entre el monarca y los Consejos, gestionando el inmenso volumen de papeles y expedientes que Felipe II leía y anotaba personalmente, ganándose la fama de "rey papelero".

### Los Virreyes y las Audiencias

En los distintos reinos, el poder político se delegaba en **Virreyes** (en Aragón, Nápoles, Sicilia, Nueva España, Perú), que representaban la autoridad del rey. La justicia se administraba a través de las **Reales Audiencias y Chancillerías**.

### La Contrarreforma

Felipe II se convirtió en el principal defensor del catolicismo contra el protestantismo, aplicando una política de aislamiento cultural: prohibió estudiar en universidades extranjeras y reforzó la censura de libros a través del **Índice de la Inquisición**.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Cómo gobernó Felipe II su Imperio? Describe el sistema polisinodial.*

**Respuesta modelo:**
1. Capital fija en Madrid (1561) → contrasta con el itinerante Carlos V
2. El Escorial: símbolo del modelo político-religioso de Felipe II
3. Sistema polisinodial: red de Consejos → territoriales + temáticos
4. Virreyes: representan al rey en los territorios → garantizan la obediencia
5. "Rey papelero": Felipe II leía y anotaba personalmente los expedientes → modelo burocrático centralizado

**Comparación con Carlos V:**
- Carlos V: rey itinerante, guerrero, defensor del Imperio universal
- Felipe II: rey sedentario, burócrata, defensor del catolicismo desde Madrid`,
    practice_prompt: 'Describe el modelo de gobierno de Felipe II. ¿Qué era el sistema polisinodial? ¿En qué se diferenciaba el modelo de gobierno de Felipe II del de su padre Carlos V?',
    alert_markdown: null,
  },

  {
    sort_order: 38,
    block_key: 'El Imperio de los Austrias',
    block_slug: 'imperio-austrias',
    title: 'Los Conflictos Internos de Felipe II: Las Alpujarras y el Caso Pérez',
    concept_markdown: `## Los Conflictos Internos del Reinado de Felipe II

### 1. La Rebelión de las Alpujarras (1568–1571)

Los **moriscos** (descendientes de los musulmanes bautizados por la fuerza en 1502) de Granada habían mantenido sus costumbres, lengua y vestimentas a pesar de la conversión nominal al catolicismo. En 1567, Felipe II promulgó una **Pragmática** que les prohibía expresamente:
- Usar la lengua árabe (el aljamiado)
- Usar sus vestimentas tradicionales
- Celebrar sus ceremonias y costumbres islámicas

Los moriscos del reino de Granada se levantaron en armas, refugiándose en las Alpujarras. El ejército real, dirigido por **Don Juan de Austria** (hermanastro del rey), sofocó la revuelta con extrema dureza. Felipe II ordenó la **dispersión forzosa de unos 80.000 moriscos** por el interior de Castilla, repoblando el territorio de Granada con colonos cristianos del norte.

### 2. Las Alteraciones de Aragón y el Caso Antonio Pérez (1591)

El **secretario real Antonio Pérez** fue acusado de ordenar el asesinato del secretario Juan de Escobedo (agente de Don Juan de Austria) presuntamente siguiendo órdenes del propio rey. Encarcelado, escapó a Aragón, donde los Fueros le protegían de la justicia real de Castilla.

Felipe II utilizó hábilmente al **Tribunal de la Inquisición** (única institución con jurisdicción en toda la monarquía, incluyendo Aragón) para intentar detenerle. Antonio Pérez instigó una **revuelta popular en Zaragoza** alegando que el rey violaba los Fueros de Aragón. Felipe II envió el ejército, ejecutó al **Justicia Mayor de Aragón** (Juan de Lanuza, el guardián de los fueros) y recortó los privilegios del reino en las **Cortes de Tarazona (1592)**, reforzando el poder real en Aragón.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *Describe la Rebelión de las Alpujarras (1568-1571). ¿Cuál fue su origen y sus consecuencias?*

**Respuesta modelo:**
1. Contexto: moriscos granadinos → conversión forzosa de 1502 → mantienen cultura islámica en privado
2. Causa directa: Pragmática de 1567 → prohibición de lengua, vestimenta y costumbres → rebelión en las Alpujarras
3. Represión: Don Juan de Austria → sofocamiento + dispersión de 80.000 moriscos por Castilla
4. Consecuencia: creación del "problema morisco" → finalmente resuelto por Felipe III con la Expulsión de 1609

**Caso Pérez en una frase:** Un secretario huye a Aragón → el rey usa la Inquisición para sortear los Fueros → el Justicia Mayor de Aragón ejecutado → los Fueros recortados en Tarazona (1592).`,
    practice_prompt: 'Explica la Rebelión de las Alpujarras (1568-1571) y las Alteraciones de Aragón (1591). ¿Qué revelan estos dos conflictos sobre las tensiones entre el poder real y los fueros/minorías en el reinado de Felipe II?',
    alert_markdown: null,
  },

  {
    sort_order: 39,
    block_key: 'El Imperio de los Austrias',
    block_slug: 'imperio-austrias',
    title: 'La Batalla de Lepanto (1571) y la Rebelión de los Países Bajos',
    concept_markdown: `## La Política Exterior de Felipe II: El Mediterráneo y los Países Bajos

### 1. La Batalla de Lepanto (1571): El Gran Triunfo Mediterráneo

El Imperio Otomano de Selim II amenazaba con dominar todo el Mediterráneo oriental. El Papa Pío V organizó la **Liga Santa** (España, Venecia y los Estados Pontificios) para frenar el avance turco.

La flota aliada, comandada por **Don Juan de Austria** (hermanastro bastardo de Felipe II), se enfrentó a la armada otomana en el **Golfo de Lepanto (7 de octubre de 1571)**, logrando una victoria naval aplastante. Fue la mayor batalla naval del Mediterráneo desde la Antigüedad: más de 200 galeras otomanas destruidas o capturadas. Participó en ella Miguel de Cervantes, quien perdió el uso de la mano izquierda.

**Importancia:** Frenó definitivamente el avance otomano por el Mediterráneo occidental, aunque el Imperio Otomano recuperó su flota rápidamente y conservó sus territorios en el Mediterráneo oriental.

### 2. La Rebelión de los Países Bajos (1568–1648)

Los **Países Bajos** (actuales Bélgica, Holanda y Luxemburgo) eran los territorios más ricos y urbanizados del Imperio, con una poderosa burguesía comercial y un creciente calvinismo protestante. La combinación del **absolutismo de Felipe II** y su **intolerancia religiosa** (intentó imponer la Inquisición en un territorio mayoritariamente protestante) desató la rebelión.

Felipe II envió al **Duque de Alba** con un ejército para aplastar la revuelta, instaurando el **"Tribunal de los Tumultos"** (llamado popularmente "Tribunal de Sangre") que ejecutó a miles de personas. La represión fue tan brutal que radicalizó aún más la resistencia. Las **17 Provincias** se organizaron bajo el mando de **Guillermo de Orange**, y las 7 provincias del norte (calvinistas) declararon su independencia como **Provincias Unidas** mediante la **Unión de Utrecht (1579)**.

El conflicto se prolongó durante 80 años (la **Guerra de los Ochenta Años**), terminando con el reconocimiento español de la independencia holandesa en la **Paz de Westfalia (1648)**.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Por qué se rebelaron los Países Bajos contra Felipe II? ¿Cuáles fueron las consecuencias?*

**Causas:**
1. Político: absolutismo de Felipe II vs. tradición autonomista flamenca
2. Religioso: imposición de la Inquisición en territorio protestante-calvinista
3. Económico: impuestos para financiar las guerras del Imperio

**Consecuencias:**
- Duque de Alba: represión brutal → "Tribunal de Sangre" → radicaliza la resistencia
- Unión de Utrecht (1579): 7 provincias norte = futura Holanda
- Guerra de los Ochenta Años (1568-1648)
- Paz de Westfalia (1648): España reconoce la independencia holandesa

**Paradoja:** Felipe II intentó defender el catolicismo y perdió los territorios más ricos del Imperio.`,
    practice_prompt: 'Explica las causas de la Rebelión de los Países Bajos (1568). ¿Qué papel tuvo el Duque de Alba? ¿Cuáles fueron las consecuencias a corto y largo plazo para el Imperio español? ¿Qué fue la Batalla de Lepanto y cuál fue su importancia?',
    alert_markdown: null,
  },

  {
    sort_order: 40,
    block_key: 'El Imperio de los Austrias',
    block_slug: 'imperio-austrias',
    title: 'La Armada Invencible (1588) y la Unión Ibérica (1580)',
    concept_markdown: `## La Armada Invencible (1588) y la Unión Ibérica (1580)

### 1. La Unión Ibérica: Felipe II, Rey de Portugal (1580–1640)

Cuando el rey Sebastián I de Portugal murió sin herederos en la **Batalla de Alcazarquivir (1578)** en Marruecos, Felipe II reclamó sus derechos sucesorios como sobrino del difunto rey. Enviando al Duque de Alba a invadir Portugal, se proclamó rey en las **Cortes de Tomar (1581)**, prometiendo respetar las leyes, instituciones y el Imperio colonial portugués.

La **Unión Ibérica (1580–1640)** unificó toda la Península bajo un mismo monarca, sumando los inmensos imperios coloniales de ambas Coronas (Brasil, África, India, Extremo Oriente). Era el mayor Imperio colonial que el mundo había visto. Sin embargo, la unión era solo dinástica: Portugal conservó su gobierno, sus leyes y sus colonias.

### 2. La Armada Invencible (1588): El Fracaso Más Simbólico

La reina protestante **Isabel I de Inglaterra** apoyaba diplomática y económicamente a los rebeldes holandeses y permitía (o incluso financiaba) la piratería de corsarios ingleses (**Francis Drake**, **John Hawkins**) contra los galeones cargados de plata americana.

Para acabar con la amenaza inglesa de una vez, Felipe II organizó la **"Gran y Felicísima Armada"**: una flota de **130 barcos y 30.000 hombres** cuya misión era cruzar el Canal de la Mancha, embarcar al ejército de los Países Bajos y desembarcar en Inglaterra para destronar a Isabel I.

La expedición **fracasó estrepitosamente** por:
1. Problemas de coordinación con el ejército terrestre
2. La **superioridad táctica de los galeones ingleses** más rápidos y maniobrables
3. Las devastadoras **tormentas** del Mar del Norte que hundieron muchos barcos al regresar

La Armada Invencible simbolizó el inicio del declive naval español y el ascenso de Inglaterra como potencia marítima.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fue la Armada Invencible (1588)? ¿Cuáles fueron las causas de su fracaso y cuáles sus consecuencias?*

**Respuesta modelo:**
1. Contexto: piratería inglesa + apoyo de Isabel I a Holanda
2. Plan: 130 barcos → cruzar el Canal → embarcar ejército de Flandes → invadir Inglaterra
3. Causas del fracaso: falta de coordinación + barcos ingleses más ágiles + tormentas del Mar del Norte
4. Consecuencias: inicio del declive naval español + ascenso inglés como potencia marítima
5. Simbología: "Invencible" fue un apodo que le dieron los españoles para no reconocer la derrota

**Sobre la Unión Ibérica:** Fecha clave 1580 (inicio) → 1640 (independencia de Portugal). Fue SOLO dinástica, no política. Portugal mantuvo sus instituciones.`,
    practice_prompt: 'Explica las causas, desarrollo y consecuencias del fracaso de la Armada Invencible (1588). ¿Qué fue la Unión Ibérica y por qué se mantuvo solo entre 1580 y 1640?',
    alert_markdown: '⚠️ La Armada Invencible fracasó principalmente por las **tormentas**, no por la superioridad naval inglesa. Los contemporáneos lo interpretaron como un castigo divino. No exageres la victoria inglesa — fue la meteorología el factor decisivo.',
  },

  // ─── PARTE 16: CONQUISTA Y COLONIZACIÓN DE AMÉRICA ───────────────────────────

  {
    sort_order: 41,
    block_key: 'El Imperio de los Austrias',
    block_slug: 'imperio-austrias',
    title: 'La Conquista y Organización del Imperio Americano',
    concept_markdown: `## La Conquista y Organización Colonial de América (Siglo XVI)

### 1. Las Grandes Conquistas

Tras los primeros establecimientos en el Caribe, la conquista del continente americano fue protagonizada por pequeñas expediciones de hidalgos, frecuentemente extremeños, financiadas con capital privado pero respaldadas por la Corona:

- **Hernán Cortés (1519–1521):** Conquistó el inmenso **Imperio Azteca** (actual México). Aprovechó las rivalidades entre los pueblos indígenas sometidos por los aztecas para formar alianzas que le permitieron derrotar a un Imperio de millones de personas con apenas 500 hombres. La capital azteca, Tenochtitlán, fue destruida y sobre sus ruinas se construyó la Ciudad de México.
- **Francisco Pizarro (1531–1533):** Sometió al **Imperio Inca** (actual Perú y los Andes), capturando al emperador **Atahualpa** durante las negociaciones de paz en Cajamarca. Los incas pagaron un rescate en oro y plata sin precedentes, pero Pizarro ordenó ejecutar a Atahualpa de todas formas.

### 2. El Sistema de Gobierno Colonial

Para administrar los vastos territorios americanos desde la Península:
- **Consejo de Indias:** Órgano legislativo y judicial supremo para los asuntos americanos, con sede en Madrid
- **Casa de Contratación de Sevilla (1503):** Controlaba el monopolio comercial: todos los barcos, pasajeros y mercancías que iban o venían de América debían pasar por Sevilla
- **Virreinatos:** El territorio se dividió en dos inmensos virreinatos: *Nueva España* (Norteamérica y Centroamérica, capital México) y *Perú* (Sudamérica, capital Lima). Los **Virreyes** representaban la autoridad directa del rey`,
    worked_example_markdown: `**Pregunta tipo PAU:** *Describe la conquista del Imperio Azteca y del Imperio Inca. ¿Qué factores explican la victoria española sobre imperios con millones de habitantes?*

**Factores de la victoria española:**
1. **Enfermedades:** viruela y sarampión diezmaron a la población indígena antes y durante la conquista
2. **Alianzas:** Cortés y Pizarro aprovecharon pueblos sometidos que odiaban a aztecas e incas
3. **Tecnología militar:** caballos, acero, cañones → ventaja psicológica y táctica decisiva
4. **Crisis interna:** el Imperio Inca vivía una guerra civil entre Atahualpa y Huáscar

**Sistema colonial: tres pilares**
- Consejo de Indias (legislación) + Casa de Contratación (comercio monopolístico) + Virreyes (gobierno territorial)`,
    practice_prompt: 'Explica las conquistas de los imperios azteca e inca. ¿Qué factores explican el éxito militar español? Describe el sistema institucional (Consejo de Indias, Casa de Contratación, Virreinatos) que organizó el gobierno colonial.',
    alert_markdown: null,
  },

  {
    sort_order: 42,
    block_key: 'El Imperio de los Austrias',
    block_slug: 'imperio-austrias',
    title: 'La Revolución de los Precios: El Impacto Económico de América',
    concept_markdown: `## La Revolución de los Precios (Siglo XVI): El Paradox del Oro

### La Fuente de Riqueza: Las Minas de Plata

La colonización americana se centró en la explotación masiva de metales preciosos. Los grandes yacimientos de plata de **Potosí** (actual Bolivia) y **Zacatecas** (México) convirtieron a Sevilla en el puerto más activo del mundo. La Corona se reservaba el **"Quinto Real"** (20% de todo el metal extraído).

### La Revolución de los Precios: La Paradoja de la Riqueza

El flujo masivo e ininterrumpido de oro y plata que desembarcaba en Sevilla provocó un fenómeno económico sin precedentes, estudiado por el economista **Jean Bodin**:

**Entrada Masiva de Plata → Aumento del dinero en circulación → Inflación generalizada → Subida brutal de precios**

Los precios en Castilla subieron entre un 300% y un 400% a lo largo del siglo XVI, muy por encima del resto de Europa.

### Las Consecuencias para España: La Trampa del Oro

El efecto fue paradójico y devastador:
- **Ruina de la industria nacional:** Los precios españoles se dispararon por encima de los europeos → era mucho más barato comprar productos importados que fabricarlos en España → la artesanía y la industria textil castellana quedaron destruidas
- **El dinero se va al extranjero:** La Corona gastó casi toda la plata en financiar las guerras del Imperio y pagar deudas con banqueros alemanes y genoveses (**Fugger** y **Welser**)
- **Bancarrotas reales:** Carlos V y Felipe II declararon la bancarrota varias veces (1557, 1575, 1596, 1607…) a pesar de recibir toneladas de plata americana`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fue la Revolución de los Precios? ¿Por qué la llegada masiva de plata americana empobr eció a España?*

**Respuesta modelo:**
1. Mecanismo: más plata en circulación → más dinero persiguiendo los mismos bienes → inflación
2. El problema específico de España: la inflación española superó a la europea → los productos españoles eran más caros → no se podía competir → se importaba todo de fuera
3. El destino de la plata: guerras + banqueros extranjeros → la plata entraba por Sevilla y salía por el norte hacia Flandes y Génova
4. Resultado: "España era el corazón por el que pasaba la sangre pero no se quedaba con ella"

**Concepto clave:** La Revolución de los Precios es la primera demostración histórica de que la inflación puede empobrecer a un país incluso cuando tiene mucho dinero.`,
    practice_prompt: 'Explica qué fue la Revolución de los Precios del siglo XVI. ¿Por qué la llegada masiva de plata americana a España no se tradujo en prosperidad a largo plazo sino en inflación y empobrecimiento industrial?',
    alert_markdown: '⚠️ La plata americana NO enriqueció a España a largo plazo. Disparó la inflación, destruyó la industria nacional y acabó en manos de banqueros extranjeros. Este es el gran **paradox** del Imperio americano español.',
  },

  {
    sort_order: 43,
    block_key: 'El Imperio de los Austrias',
    block_slug: 'imperio-austrias',
    title: 'El Impacto Social en América: Encomienda, Mita y Leyes Nuevas',
    concept_markdown: `## El Impacto Social de la Colonización en América

### El Colapso Demográfico Indígena

La llegada de los españoles provocó el mayor colapso demográfico de la historia de la humanidad. Se calcula que la población indígena de América se redujo en un **90%** a lo largo del siglo XVI. La causa principal no fueron las guerras de conquista, sino las **enfermedades europeas** (viruela, sarampión, gripe, tifus) para las que los nativos, sin exposición previa, no tenían ninguna defensa inmunológica.

### Los Sistemas de Explotación Laboral

Para explotar la mano de obra nativa superviviente se utilizaron dos sistemas legalmente distintos pero igualmente abusivos:

- **La Encomienda:** La Corona "encomendaba" un grupo de indígenas a un colonizador (**encomendero**). Los nativos debían trabajar la tierra o pagar tributos a cambio de recibir "protección" y ser evangelizados. En la práctica, era una esclavitud encubierta.
- **La Mita:** Sistema de origen inca adaptado por los españoles que obligaba a cada comunidad indígena a aportar un porcentaje de sus hombres para realizar trabajos forzosos temporales en las peligrosas minas de plata (especialmente en Potosí). La mortalidad en las minas era altísima.

### Las Leyes Nuevas de Indias (1542) y el Debate de Valladolid

Las denuncias del dominico **Fray Bartolomé de las Casas** ante el rey (su *"Brevísima relación de la destrucción de las Indias"*, 1542) sobre los horrores de la encomienda llevaron a Carlos V a promulgar las **Leyes Nuevas de Indias (1542)**, que prohibían la esclavización de los indios y limitaban las encomiendas. La resistencia de los encomenderos fue tan feroz que las leyes fueron parcialmente derogadas.

El debate teológico sobre si los indios eran "hombres completos" con alma, con derechos naturales, se escenificó en el **Debate de Valladolid (1550-1551)** entre Las Casas (defensor de los indios) y el teólogo Ginés de Sepúlveda (defensor de la guerra justa contra los "bárbaros"). La importación de esclavos africanos aumentó exponencialmente al liberarse (parcialmente) a los indígenas.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fue la encomienda? ¿Qué papel tuvo Bartolomé de las Casas en la legislación colonial?*

**Estructura:**
1. La encomienda: sistema de trabajo forzado encubierto como "protección" → encomendero recibe trabajo y tributos
2. La mita: trabajo minero obligatorio → altísima mortalidad en Potosí
3. Consecuencia demográfica: 90% de pérdida de población indígena (principalmente por enfermedades, no por violencia directa)
4. Bartolomé de las Casas: *Brevísima relación* (1542) → denuncia ante el rey → Leyes Nuevas de Indias (1542) → primer intento legislativo de proteger a los indígenas
5. Paradoja: al liberar a los indios, se intensificó la esclavitud africana

**La sociedad colonial de castas:** Peninsulares > Criollos > Mestizos > Indígenas > Esclavos negros`,
    practice_prompt: 'Describe los sistemas de explotación laboral indígena (encomienda y mita) en la América colonial. ¿Qué importancia tuvieron las Leyes Nuevas de Indias (1542) y cuál fue la figura de Bartolomé de las Casas?',
    alert_markdown: '⚠️ El colapso demográfico indígena se debió principalmente a las **enfermedades**, no a la violencia de la conquista. Un dato que hay que mencionar siempre en PAU: la viruela llegó antes que los conquistadores en muchos casos.',
  },

  // ─── PARTE 17: LOS AUSTRIAS MENORES ───────────────────────────────────────────

  {
    sort_order: 44,
    block_key: 'El Imperio de los Austrias',
    block_slug: 'imperio-austrias',
    title: 'Los Austrias Menores: El Sistema de Validos y la Expulsión de los Moriscos',
    concept_markdown: `## Los Austrias Menores: Felipe III, Felipe IV y Carlos II

A partir de 1598, los Habsburgo entraron en una fase de decadencia política progresiva. Los llamados "Austrias Menores" (Felipe III, Felipe IV y Carlos II) se caracterizaron por delegar el poder real en **validos**, nobles de su máxima confianza que gobernaban en su nombre.

### ¿Qué era un Valido?

El **valido** (o *privado*) era un noble que ejercía de facto como jefe de gobierno, tomando las decisiones políticas mientras el rey se ocupaba de la vida cortesana. El valido colocaba a sus familiares en los puestos clave del Estado (**nepotismo**) y generaba enormes redes de corrupción y favoritismo.

### Felipe III (1598–1621) y el Duque de Lerma

Felipe III delegó todo el poder en su favorito, el **Duque de Lerma**, que gobernó España durante casi 20 años. Las principales medidas de su reinado fueron:

- **Política Exterior Pacifista:** Debido a la ruina financiera del Estado, Lerma firmó la **Tregua de los Doce Años** con Holanda (1609) y la paz con Inglaterra. Era una política de repliegue defensivo.
- **La Expulsión de los Moriscos (1609):** La medida más radical del reinado. Unos **300.000 moriscos** (descendientes de los musulmanes bautizados) fueron expulsados de España bajo la acusación de ser crypto-musulmanes y colaborar con los piratas berberiscos del norte de África. Las consecuencias económicas fueron desastrosas, especialmente en Valencia y Aragón, cuya agricultura de regadío quedó destruida al perder a sus trabajadores más productivos.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fue el sistema de validos? ¿Cuáles fueron las consecuencias de la expulsión de los moriscos de 1609?*

**Sistema de validos:**
- Definición: noble favorito que gobierna en nombre del rey → nepotismo + corrupción
- Felipe III → Duque de Lerma
- Felipe IV → Conde-Duque de Olivares (mucho más ambicioso e intervencionista)
- Carlos II → Juan José de Austria

**Expulsión de 1609:**
- Causa oficial: sospecha de crypto-islamismo y colaboración con piratas berberiscos
- Causa real: presión de sectores radicales de la Iglesia + deseo de ganarse apoyo popular
- 300.000 expulsados
- Consecuencias: ruina de la agricultura valenciana y aragonesa → uno de los mayores errores económicos de la monarquía`,
    practice_prompt: 'Explica en qué consistió el sistema de validos y por qué se generalizó en el siglo XVII. ¿Qué fueron las consecuencias económicas y sociales de la expulsión de los moriscos en 1609?',
    alert_markdown: '⚠️ No confundir: los moriscos fueron expulsados en **1609** (Felipe III), NO en 1492 (que fue la expulsión de los judíos). Son dos expulsiones distintas, de dos grupos distintos, con un siglo de diferencia.',
  },

  {
    sort_order: 45,
    block_key: 'El Imperio de los Austrias',
    block_slug: 'imperio-austrias',
    title: 'El Conde-Duque de Olivares y la Unión de Armas (1626)',
    concept_markdown: `## Felipe IV y el Conde-Duque de Olivares: El Proyecto Reformista

### El Valido más Ambicioso

El **Conde-Duque de Olivares** (Gaspar de Guzmán) fue el valido de Felipe IV (1621–1643). A diferencia del pacifista Duque de Lerma, Olivares era un político reformista con una visión grandiosa: transformar la Monarquía Hispánica en un estado moderno y eficiente.

Era consciente del principal problema estructural del Imperio: **Castilla soportaba en solitario el 80% del esfuerzo fiscal y militar**, mientras que los reinos periféricos (Aragón, Cataluña, Portugal) se amparaban en sus fueros para no contribuir. La despoblación y el agotamiento de Castilla amenazaban con hundir el Imperio.

### El Gran Memorial (1624): El Diagnóstico

En 1624, Olivares presentó al rey un memorándum secreto (*"Gran Memorial"*) donde señalaba que para salvar el Imperio era imprescindible **"reducir los reinos de que se compone España a las leyes, fueros y estilos de Castilla"**, es decir, suprimir los fueros periféricos e imponer la ley castellana en toda la monarquía.

### La Unión de Armas (1626)

Para conseguir la contribución de todos los reinos sin suprimir formalmente sus fueros, Olivares diseñó la **Unión de Armas (1626)**: un ejército de reserva permanente de **140.000 hombres** aportado y financiado por todos los reinos de forma proporcional a su población y riqueza:
- Castilla y América: 44.000 soldados
- Portugal: 16.000 soldados
- Cataluña: 16.000 soldados
- Aragón: 10.000 soldados
- Valencia: 6.000 soldados (y otros territorios)

Los reinos periféricos, especialmente el **Principado de Cataluña**, rechazaron frontalmente el proyecto en las Cortes de Barcelona por considerarlo una violación directa de sus constituciones. La presión de Olivares para financiar la guerra contra Francia terminaría provocando el estallido de 1640.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿En qué consistió la Unión de Armas de Olivares (1626)? ¿Por qué fracasó?*

**Respuesta modelo:**
1. Contexto: Castilla agotada por las guerras → los reinos periféricos no contribuyen por sus fueros
2. El diagnóstico: Gran Memorial (1624) → necesidad de unificar la monarquía
3. La propuesta: Unión de Armas = ejército compartido de 140.000 hombres entre todos los reinos
4. El rechazo: Cataluña y Portugal consideran que viola sus fueros → no lo aceptan
5. El fracaso: la presión militar sobre Cataluña provocará el Corpus de Sangre (1640)

**Clave:** Olivares era brillante en el diagnóstico (Castilla no puede con todo sola) pero catastrófico en la solución (intentar suprimir los fueros por la fuerza).`,
    practice_prompt: 'Explica el proyecto político del Conde-Duque de Olivares. ¿En qué consistía la Unión de Armas? ¿Por qué fue rechazada por los reinos periféricos y qué consecuencias tuvo ese rechazo?',
    alert_markdown: null,
  },

  // ─── PARTE 18: CRISIS DE 1640 ─────────────────────────────────────────────────

  {
    sort_order: 46,
    block_key: 'El Imperio de los Austrias',
    block_slug: 'imperio-austrias',
    title: 'La Crisis de 1640: La Rebelión de Cataluña y la Independencia de Portugal',
    concept_markdown: `## La Crisis de 1640: El Imperio al Borde de la Desintegración

El año 1640 representó la crisis interna más grave de la historia de la Monarquía Hispánica, coincidiendo con las peores derrotas militares en Europa.

### 1. La Rebelión de Cataluña (1640–1652)

La entrada de España en la **Guerra de los Treinta Años** (1618–1648) contra Francia obligó a las tropas castellanas e italianas a acantonarse en el Principado de Cataluña. Olivares exigió a los campesinos catalanes alojar y alimentar a los soldados, violando directamente las **Constituciones catalanas**. Los abusos del ejército desataron una insurrección popular:

- **El Corpus de Sangre (7 de junio de 1640):** Segadores armados entraron en Barcelona durante la festividad del Corpus Christi, asesinando al virrey, el Conde de Santa Coloma
- **La *Unión de los Segadors*:** La Generalitat, presidida por **Pau Claris**, ante el temor de la represalia de Felipe IV, tomó la decisión extrema de ofrecer el vasallaje de Cataluña al rey de Francia **Luis XIII** (proclamándolo también Conde de Barcelona)
- **El fin del conflicto:** Los abusos de los soldados franceses y brotes de peste minaron la resistencia. El ejército real asedió Barcelona; la ciudad se rindió en **1652**. Felipe IV perdonó a los rebeldes y prometió **respetar íntegramente los Fueros de Cataluña**, recuperando el control sin cambiar el sistema foral.

### 2. La Independencia de Portugal (1640)

Aprovechando que los ejércitos de Felipe IV estaban inmovilizados en Cataluña, la nobleza y burguesía portuguesas ejecutaron un golpe de Estado en diciembre de 1640, proclamando al **Duque de Braganza como Rey Juan IV de Portugal**. Las causas eran la incapacidad española de proteger las colonias portuguesas en Brasil y Asia frente a los ataques holandeses. Con el apoyo de Francia e Inglaterra, Portugal resistió todos los intentos de invasión española. España reconoció definitivamente la independencia de Portugal en el **Tratado de Lisboa (1668)**.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *Explica las causas y consecuencias de la Rebelión de Cataluña de 1640. ¿Por qué Portugal también se independizó ese mismo año?*

**Cataluña:**
- Causa: tropas castellanas alojadas en Cataluña → violan constituciones catalanas → Corpus de Sangre (7 junio 1640)
- Desarrollo: Pau Claris ofrece Cataluña a Francia → Luis XIII = Conde de Barcelona
- Fin: rendición de Barcelona (1652) → Felipe IV perdona y respeta los fueros

**Portugal:**
- Causa: incapacidad de España de proteger el Imperio colonial portugués ante los holandeses
- Hecho: diciembre 1640, golpe de estado → Juan IV de Braganza, rey
- Reconocimiento: Tratado de Lisboa (1668)

**Nota de interpretación:** Los dos movimientos de 1640 son respuestas a la MISMA política: Olivares presiona demasiado a los reinos → se rompen.`,
    practice_prompt: 'Explica las causas de la Rebelión de Cataluña (1640) y de la independencia de Portugal (1640). ¿Qué conexión existe entre ambos hechos y la política del Conde-Duque de Olivares?',
    alert_markdown: '⚠️ El **Corpus de Sangre** fue el **7 de junio de 1640** (festividad del Corpus Christi en Barcelona). *"Els Segadors"* (los segadores) es el himno actual de Cataluña, que toma el nombre de esta revuelta.',
  },

  // ─── PARTES 18-19: PAZ DE WESTFALIA, PAZ DE LOS PIRINEOS Y SIGLO DE ORO ──────

  {
    sort_order: 47,
    block_key: 'El Imperio de los Austrias',
    block_slug: 'imperio-austrias',
    title: 'El Fin de la Hegemonía: Westfalia (1648), Los Pirineos (1659) y el Siglo de Oro',
    concept_markdown: `## El Declive del Imperio: Las Paces que Cerraron la Hegemonía Española

### 1. La Paz de Westfalia (1648)

La **Guerra de los Treinta Años (1618–1648)** fue el conflicto más devastador de Europa hasta las guerras napoleónicas. España había entrado en 1621, reanudando la guerra con Holanda. La mítica derrota de los **Tercios españoles** frente a los franceses en la **Batalla de Rocroi (1643)** marcó el fin de la supremacía militar española en Europa continental.

La Paz de Westfalia (1648) puso fin a la guerra y supuso para España:
- Reconocimiento oficial de la **independencia definitiva de las Provincias Unidas (Holanda)**, poniendo fin a los 80 años de conflicto
- España dejó de ser la potencia hegemónica continental → Francia de Luis XIV tomó ese papel

### 2. La Paz de los Pirineos (1659)

España continuó en solitario la guerra contra **Francia** hasta ser definitivamente derrotada. En el Tratado de los Pirineos (firmado en la Isla de los Faisanes, en el Bidasoa):
- Felipe IV cedió a Francia los territorios de **Rosellón y la Cerdaña** (norte de Cataluña), fijando la frontera hispanofrancesa en los Pirineos
- Se pactó el matrimonio de la infanta **María Teresa de Austria** con el rey **Luis XIV**, introduciendo los derechos dinámicos que llevarían a la Guerra de Sucesión de 1700

### 3. Carlos II y el Final de la Dinastía (1665–1700)

**Carlos II "el Hechizado"** fue el último rey de la Casa de Austria. Gravemente incapacitado física y mentalmente por la endogamia acumulada de generaciones, no pudo tener hijos. A su muerte (1 de noviembre de 1700), dejó como heredero universal a **Felipe de Anjou** (nieto de Luis XIV), desencadenando la **Guerra de Sucesión española**.

### 4. El Siglo de Oro: El Esplendor Cultural

Paradójicamente, el periodo de mayor decadencia política coincidió con el **Siglo de Oro** de las letras y artes españolas:
- **Literatura:** Cervantes (*Don Quijote*, 1605), Quevedo, Góngora, Lope de Vega, Tirso de Molina, Calderón de la Barca
- **Pintura:** **Velázquez** (*Las Meninas*, *La rendición de Breda*), Murillo, Zurbarán, Ribera`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fue la Paz de Westfalia (1648) y la Paz de los Pirineos (1659)? ¿Qué significaron para el Imperio español?*

**Westfalia (1648):**
- Fin de la Guerra de los 30 Años → España reconoce independencia de Holanda
- Rocroi (1643) = fin de los Tercios y de la hegemonía militar española
- Francia de Luis XIV = nueva potencia hegemónica

**Los Pirineos (1659):**
- Fin de la guerra franco-española → España cede el Rosellón y la Cerdaña
- Matrimonio María Teresa-Luis XIV → semilla de la Guerra de Sucesión de 1700

**Siglo de Oro:**
- Paradoja: máxima pobreza política = máximo esplendor cultural
- Cervantes + Lope + Calderón (literatura) + Velázquez (pintura)`,
    practice_prompt: 'Explica el significado de la Paz de Westfalia (1648) y la Paz de los Pirineos (1659) para el Imperio español. ¿Qué fue el Siglo de Oro y por qué es paradójico que coincida con la etapa de mayor decadencia política?',
    alert_markdown: '⚠️ **Rocroi (1643)** = fin del mito de la invencibilidad de los Tercios. **Westfalia (1648)** = fin de la hegemonía española en Europa. **Los Pirineos (1659)** = frontera hispanofrancesa actual + germen de la Guerra de Sucesión.',
  },
]

const BATCH_SIZE = 10

async function main() {
  console.log(`Insertando ${cards.length} tarjetas del Bloque 5 (Imperio de los Austrias)…`)

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
    console.log(`\n✅ Bloque 5 insertado. Total filas historia_espana en tabla: ${count}`)
  }
}

main()
