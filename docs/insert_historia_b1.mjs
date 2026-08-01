// Uso: node --env-file=.env.local docs/insert_historia_b1.mjs
// Bloque 1 — Prehistoria y Edad Antigua: cards 1-11
// Partes 1, 2 y 3 de los apuntes de Diego

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const SUBJECT = 'historia_espana'

const cards = [
  // ─── PARTE 1: PREHISTORIA ────────────────────────────────────────────────────

  {
    sort_order: 1,
    block_key: 'Prehistoria y Edad Antigua',
    block_slug: 'prehistoria-edad-antigua',
    title: 'El Paleolítico en la Península Ibérica',
    concept_markdown: `## El Paleolítico (1.200.000 - 5.000 a.C.)

La etapa más larga de nuestra historia. Se caracteriza por una economía **depredadora** (caza, pesca y recolección) y un estilo de vida **nómada**, con asentamientos estacionales junto a ríos o cuevas.

### Paleolítico Inferior (1.200.000 - 100.000 a.C.)
Presencia del *Homo antecessor* (yacimiento de la **Gran Dolina en Atapuerca**, Burgos, c. 800.000 años) y del *Homo heidelbergensis*. Herramientas toscas como **bifaces** (hachas de piedra bifaciales).

### Paleolítico Medio (100.000 - 35.000 a.C.)
Protagonizado por el *Homo neanderthalensis*. Gran dominio del fuego, primeros **enterramientos rituales** y herramientas especializadas de piedra (cultura Musteriense).

### Paleolítico Superior (35.000 - 5.000 a.C.)
Llegada del *Homo sapiens*. Dominio del **arte rupestre** y diversificación de materiales (hueso, asta).`,
    worked_example_markdown: `**Pregunta tipo PAU:** *Describe las características del Paleolítico y los principales yacimientos paleolíticos de la Península Ibérica.*

**Clave de respuesta:**
- Define economía depredadora frente a productora (diferencia clave con el Neolítico)
- Cita las **tres etapas** con su homínido correspondiente: *Homo antecessor* → *Homo neanderthalensis* → *Homo sapiens*
- Menciona **Atapuerca (Gran Dolina)** como yacimiento estrella del Paleolítico Inferior en España
- No confundas: nomadismo = Paleolítico / sedentarismo = Neolítico. Es una distinción que cae siempre.`,
    practice_prompt: 'Explica las tres etapas del Paleolítico en la Península Ibérica, indicando qué homínido protagonizó cada una y cuáles fueron sus características económicas y tecnológicas principales.',
    alert_markdown: '⚠️ **Dato clave:** El yacimiento de **Atapuerca (Burgos)** es el más antiguo de Europa Occidental con restos humanos (~800.000 años, *Homo antecessor*). Es referencia obligatoria en PAU.',
  },

  {
    sort_order: 2,
    block_key: 'Prehistoria y Edad Antigua',
    block_slug: 'prehistoria-edad-antigua',
    title: 'El Arte Rupestre Paleolítico: La Escuela Cantábrica',
    concept_markdown: `## El Arte Rupestre Paleolítico: La Escuela Cantábrica

Su máximo exponente es la **Cueva de Altamira** (Cantabria).

### Características esenciales (para PAU)

| Rasgo | Detalle |
|---|---|
| **Localización** | Interior profundo de las cuevas (carácter ritual o religioso) |
| **Temática** | Figuras **aisladas** de grandes animales: bisontes, caballos, ciervos |
| **Color** | **Policromía** (negro, ocre y rojo) |
| **Técnica** | Gran **realismo**, aprovecha los relieves de la roca para dar volumen |
| **Figura humana** | No aparece de forma relevante |

### Interpretación
Se asocia a rituales de caza mágica: pintar el animal era una forma de dominar su espíritu antes de cazarlo. Las cuevas eran santuarios, no viviendas.

### Otros yacimientos
Cueva de Lascaux (Francia), Cueva del Castillo (Cantabria), Cueva de Tito Bustillo (Asturias).`,
    worked_example_markdown: `**Pregunta tipo PAU:** *Compara el arte rupestre paleolítico y neolítico de la Península Ibérica.*

**Clave diferenciadora:**

| | **Paleolítico (Cantábrica)** | **Neolítico (Levantina)** |
|---|---|---|
| Lugar | Interior de cuevas | Abrigos al aire libre |
| Color | Policromía | Monocromía |
| Figuras | Aisladas, animales | Escenas narrativas, humanos |
| Estilo | Realista | Esquematizado, movimiento |

Estas dos tablas aparecen en PAU constantemente. Memoriza las cuatro diferencias.`,
    practice_prompt: 'Describe las características del arte rupestre de la Escuela Cantábrica: localización, temática, técnica y materiales. ¿Qué interpretación dan los historiadores sobre su función?',
    alert_markdown: null,
  },

  {
    sort_order: 3,
    block_key: 'Prehistoria y Edad Antigua',
    block_slug: 'prehistoria-edad-antigua',
    title: 'El Neolítico: La Revolución Agrícola y el Sedentarismo',
    concept_markdown: `## El Neolítico (5.000 - 3.000 a.C.)

Supone una **revolución radical**: se pasa de una economía **depredadora** a una **economía productora** basada en la **agricultura** y la **ganadería** (trigo, cebada, ovejas, cabras).

### El cambio fundamental
Esto obliga a los grupos humanos a volverse **sedentarios**, apareciendo los primeros **poblados estables**. Es el mayor cambio en la historia de la humanidad hasta la Revolución Industrial.

### Nuevas técnicas y materiales
- **Cerámica cardial** (decorada con la concha de un cardium): primera gran producción artesanal
- **Tejidos** (lino, lana)
- Herramientas de piedra pulida en lugar de tallada
- Primeras aldeas agrícolas permanentes

### Consecuencias sociales
El excedente agrícola permite la acumulación de riqueza → aparece la **desigualdad social** → primeros jefes tribales.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué cambios económicos y sociales trajo el Neolítico? ¿Por qué se habla de "revolución neolítica"?*

**Estructura de respuesta:**
1. Definir el cambio económico: depredadora → productora (agricultura + ganadería)
2. Consecuencia inmediata: nomadismo → sedentarismo → poblados
3. Consecuencias sociales: excedente → desigualdad → primeros jefes
4. Nuevas tecnologías: cerámica, tejidos, piedra pulida
5. Relacionar con el arte: aparece la Escuela Levantina (escenas narrativas de agricultura, caza colectiva)`,
    practice_prompt: 'Explica por qué el Neolítico se considera una "revolución" en la historia de la humanidad. ¿Qué cambios económicos y sociales provocó en la Península Ibérica?',
    alert_markdown: null,
  },

  {
    sort_order: 4,
    block_key: 'Prehistoria y Edad Antigua',
    block_slug: 'prehistoria-edad-antigua',
    title: 'El Arte Rupestre Neolítico: La Escuela Levantina',
    concept_markdown: `## El Arte Rupestre Neolítico: La Escuela Levantina

Se desarrolla en abrigos rocosos al **aire libre**, en el litoral mediterráneo y zonas del interior peninsular.

### Características esenciales (para PAU)

| Rasgo | Detalle |
|---|---|
| **Localización** | Abrigos rocosos al **aire libre** |
| **Temática** | **Escenas completas** con sentido narrativo: cacerías colectivas, danzas rituales, recolección de miel |
| **Color** | **Monocromía** (predominio de un solo color: rojo o negro) |
| **Estilo** | Figuras humanas y animales muy **esquematizadas** y estilizadas |
| **Movimiento** | Transmiten gran sensación de **dinamismo y movimiento** |

### Yacimientos clave
- **Cueva de la Araña** (Valencia): famosa escena de recolección de miel
- **Valltorta** (Castellón)
- **Cogul** (Lleida): danza ritual con figuras femeninas

### Significado
La aparición de **escenas narrativas con humanos** refleja la nueva sociedad neolítica: ya no solo importa la presa, sino la acción colectiva de la caza o la cosecha.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *Compara el arte rupestre cantábrico (Paleolítico) y el arte levantino (Neolítico).*

**Las cuatro diferencias clave:**
1. **Lugar**: cuevas profundas vs. abrigos al aire libre
2. **Color**: policromía vs. monocromía
3. **Figuras**: animales aislados vs. escenas con humanos
4. **Estilo**: realismo naturalista vs. esquematismo estilizado

Recuerda siempre relacionar el estilo artístico con el contexto social: el arte paleolítico refleja la magia de caza individual; el levantino, la vida comunitaria de la sociedad agrícola.`,
    practice_prompt: 'Describe las características del arte rupestre levantino. ¿En qué se diferencia del arte cantábrico paleolítico?',
    alert_markdown: null,
  },

  {
    sort_order: 5,
    block_key: 'Prehistoria y Edad Antigua',
    block_slug: 'prehistoria-edad-antigua',
    title: 'La Edad de los Metales: Del Cobre al Hierro',
    concept_markdown: `## La Edad de los Metales (3.000 - Siglo III a.C.)

Se divide según el metal tecnológico predominante, provocando una creciente **estratificación social** y la aparición de poblados fortificados:

$$\\text{Edad del Cobre (Calcolítico)} \\longrightarrow \\text{Edad del Bronce} \\longrightarrow \\text{Edad del Hierro}$$

### Edad del Cobre o Calcolítico (3.000 - 1.700 a.C.)
- Cultura de **Los Millares** (Almería): poblado amurallado con necrópolis megalítica
- Difusión del **vaso campaniforme** por toda Europa
- Aparece el **megalitismo**: dólmenes de corredor como los de **Antequera** (Málaga)

### Edad del Bronce (1.700 - 1.000 a.C.)
Mezcla de cobre + estaño. Destaca:
- Cultura de **El Argar** (Almería): enterramientos individuales bajo las casas, jerarquización social muy marcada
- Cultura **talayótica** en las Islas Baleares (talayots = torres de vigilancia)

### Edad del Hierro (1.000 a.C. en adelante)
Coincide con la llegada de los **pueblos colonizadores** (fenicios, griegos) y los pueblos **indoeuropeos (celtas)**, introduciendo la metalurgia avanzada del hierro y la escritura. Es el umbral con la Historia.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *Describe las principales culturas de la Edad del Cobre y del Bronce en la Península Ibérica.*

**Estructura:**
1. Calcolítico: **Los Millares** → características (amurallado, necrópolis megalítica, vaso campaniforme)
2. Bronce: **El Argar** → características (enterramientos individuales, jerarquización)
3. Ambas: aparición de la **estratificación social** como novedad clave respecto al Neolítico igualitario
4. Menciona el **megalitismo** (dólmenes) como manifestación cultural del Calcolítico

**Términos clave para usar:** *megalitismo, dolmen, vaso campaniforme, ajuar funerario, estratificación social*.`,
    practice_prompt: 'Describe las principales características de Las culturas de Los Millares y El Argar, explicando qué novedades introducen respecto al período anterior.',
    alert_markdown: '⚠️ El **megalitismo** (dólmenes, menhires) es del Calcolítico, NO del Bronce. Error frecuente en PAU.',
  },

  // ─── PARTE 2: PUEBLOS PRERROMANOS Y COLONIZACIONES ──────────────────────────

  {
    sort_order: 6,
    block_key: 'Prehistoria y Edad Antigua',
    block_slug: 'prehistoria-edad-antigua',
    title: 'Los Iberos: Economía, Sociedad y Arte',
    concept_markdown: `## Los Iberos (Siglos V - III a.C.)

Asentados en el **sur y el litoral mediterráneo**. Recibieron una enorme influencia cultural de fenicios y griegos.

### Economía
Rica y avanzada. Agricultura mediterránea (trilogía: vid, olivo, trigo), ganadería, minería y metalurgia. Desarrollaron:
- El **uso de la moneda** (la más avanzada de los pueblos peninsulares)
- Una **escritura propia** aún no descifrada completamente

### Sociedad
Aristocrática y jerarquizada, liderada por **régulos** o jefes tribales. Estructurada en ciudades-estado fortificadas llamadas **oppida**.

### Arte
Muy desarrollado, especialmente la **escultura funeraria y religiosa**. Las dos obras más famosas:
- **La Dama de Elche** (Alicante): busto femenino de gran refinamiento, posiblemente urna funeraria
- **La Dama de Baza** (Granada): figura femenina sedante, también de uso funerario`,
    worked_example_markup: null,
    worked_example_markdown: `**Pregunta tipo PAU:** *Describe las características de los iberos: organización social, economía y manifestaciones artísticas.*

**Clave de respuesta:**
1. Localización: sur y litoral mediterráneo → influencia fenicia y griega
2. Economía: trilogía mediterránea + minería + moneda + escritura (no descifrada)
3. Sociedad: aristocrática, régulos, oppida (ciudades-estado)
4. Arte: escultura funeraria → **La Dama de Elche** y **La Dama de Baza** como ejemplos obligatorios

**Distinción clave con los celtas:** Los iberos usan moneda y escritura; los celtas, no. Los iberos son más "avanzados" culturalmente.`,
    practice_prompt: '¿Cuáles fueron las principales características económicas, sociales y artísticas de los iberos? Menciona al menos dos obras de arte ibéricas y explica su función.',
    alert_markdown: null,
  },

  {
    sort_order: 7,
    block_key: 'Prehistoria y Edad Antigua',
    block_slug: 'prehistoria-edad-antigua',
    title: 'Los Celtas y Celtíberos: Organización y Cultura',
    concept_markdown: `## Los Celtas y Celtíberos (Siglos V - III a.C.)

Asentados en el **centro, norte y oeste** peninsular. De origen indoeuropeo, estaban menos evolucionados que los iberos.

### Economía
- En el norte: **ganadera** y recolectora
- En el centro (celtíberos): **agrícola** y ganadera
- Excelente trabajo del **bronce y el hierro**
- **No usaban moneda ni tenían escritura propia**

### Sociedad
Organización **tribal** basada en el parentesco (clanes). Vivían en **castros** (poblados fortificados con casas de planta circular), típicos de Galicia, Asturias y el noroeste peninsular.

### Arte
Escultura tosca de animales tallados en piedra. El ejemplo más conocido: los **Toros de Guisando** (Ávila), relacionados con ritos ganaderos de demarcación territorial.

### Los Celtíberos
Resultado de la **mezcla de celtas e iberos** en la Meseta central. Adoptaron algunos rasgos ibéricos (mayor uso del metal) pero mantuvieron la organización tribal celta. Son los protagonistas de la resistencia a Roma: **Numancia** era una ciudad celtíbera.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *Compara a los iberos y a los celtas como pueblos prerromanos.*

**Tabla comparativa:**

| | **Iberos** | **Celtas** |
|---|---|---|
| Zona | Sur y mediterráneo | Centro, norte y oeste |
| Economía | Agricultura avanzada + moneda | Ganadería + sin moneda |
| Escritura | Sí (no descifrada) | No |
| Organización | Oppida (ciudades-estado) | Castros (poblados tribales) |
| Arte | La Dama de Elche | Toros de Guisando |

Este cuadro comparativo es una pregunta clásica de PAU. Apréndetelo.`,
    practice_prompt: 'Describe la organización social y económica de los celtas y celtíberos. ¿En qué se diferenciaban de los iberos? Menciona el ejemplo de los castros y los Toros de Guisando.',
    alert_markdown: null,
  },

  {
    sort_order: 8,
    block_key: 'Prehistoria y Edad Antigua',
    block_slug: 'prehistoria-edad-antigua',
    title: 'Tartessos: El Primer Gran Reino Peninsular',
    concept_markdown: `## Tartessos (Siglos VIII - VI a.C.)

Primer gran reino organizado de la Península Ibérica, situado en el **valle del Guadalquivir** (actual Andalucía occidental).

### Importancia histórica
- Mencionados en la **Biblia** (*Tarsis*) y en textos griegos por su inmensa riqueza minera
- Controlaban los yacimientos de **oro, plata y cobre** del suroeste peninsular
- Establecieron prósperas relaciones comerciales con fenicios y griegos

### Organización política
Sociedad fuertemente jerarquizada con un **monarca**. El rey más conocido es **Argantonio**, cuyo nombre significa "el hombre de plata", lo que refleja la riqueza minera del reino. Los textos griegos lo presentan como un gobernante longevo y sabio.

### Desaparición
Desaparecieron misteriosamente hacia el **siglo VI a.C.**, posiblemente como consecuencia del dominio cartaginés sobre el comercio del Mediterráneo occidental o de catástrofes naturales. Su capital no ha sido localizada arqueológicamente.

### Hallazgo arqueológico clave
**El Tesoro de El Carambolo** (Sevilla): conjunto de joyas de oro macizo que confirman el altísimo nivel artístico y la riqueza del pueblo tartésico.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fue Tartessos y cuál fue su importancia en la historia prerromana de la Península Ibérica?*

**Puntos clave para desarrollar:**
1. Localización: valle del Guadalquivir → primer reino organizado de la Península
2. Fuentes: Biblia (*Tarsis*) y textos griegos → gran riqueza minera (oro, plata)
3. Rey Argantonio → símbolo del poderío tartésico
4. Relaciones comerciales con fenicios → precursores del intercambio cultural mediterráneo
5. Desaparición misteriosa s. VI a.C. → no se ha encontrado la capital
6. Evidencia arqueológica: **Tesoro de El Carambolo**`,
    practice_prompt: 'Explica qué fue Tartessos, dónde se localizó, cuáles fueron sus principales características y por qué desapareció. Menciona el Tesoro de El Carambolo.',
    alert_markdown: null,
  },

  {
    sort_order: 9,
    block_key: 'Prehistoria y Edad Antigua',
    block_slug: 'prehistoria-edad-antigua',
    title: 'Las Colonizaciones Históricas: Fenicios, Griegos y Cartagineses',
    concept_markdown: `## Las Colonizaciones Históricas (Siglos X - III a.C.)

Tres grandes potencias mediterráneas llegaron a las costas de la Península **atraídas por la abundancia de metales**. Se limitaron a fundar **factorías comerciales marítimas** sin vocación de conquistar el interior.

### Los Fenicios (s. X - VIII a.C.)
- Pueblo semita procedente del Líbano (actuales Tiro y Sidón)
- Fundaron la primera colonia: **Gadir** (actual **Cádiz**), c. 1104 a.C. → la ciudad más antigua del mundo occidental aún habitada
- También: Malaka (Málaga), Sexi (Almuñécar), Abdera (Adra)
- **Aportaciones culturales:** el **alfabeto fenicio** (antepasado del latino), la **púrpura** como tinte, la **metalurgia del hierro**, el torno del alfarero y técnicas de salazón del pescado

### Los Griegos (s. VIII - VI a.C.)
- Procedentes de las polis de Focea (Asia Menor)
- Fundaron principalmente en el noreste: **Emporion** (Ampurias, Gerona) y **Rhode** (Rosas)
- **Aportaciones:** técnicas agrícolas avanzadas (vid, olivo), acuñación de **moneda**, escritura y arte

### Los Cartagineses (s. VI - III a.C.)
- Herederos del comercio fenicio desde Cartago (norte de África)
- Fundaron **Cartago Nova** (Cartagena) y controlaron el sur e islas Baleares
- Rivales de Roma → Segunda Guerra Púnica (218 a.C.) = inicio de la conquista romana`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué pueblos colonizadores llegaron a la Península Ibérica? ¿Cuáles fueron sus principales aportaciones culturales?*

**Estructura de respuesta:**
1. Contexto: todos buscaban metales (depredación económica, no conquista)
2. Fenicios: Gadir (1104 a.C.) → **alfabeto, hierro, salazón, alfarería**
3. Griegos: Emporion → **moneda, escritura, vino, olivo**
4. Cartagineses: Cartago Nova → control del sur → rivalidad con Roma → inicio de la Historia de Hispania

**Término que siempre cae:** *factorías comerciales* = colonias de intercambio sin intención de conquista interior.`,
    practice_prompt: 'Describe las tres oleadas de colonización mediterránea en la Península Ibérica (fenicios, griegos y cartagineses). Indica sus zonas de asentamiento y sus principales aportaciones culturales y económicas.',
    alert_markdown: '⚠️ **Gadir (Cádiz)** fundada c. 1104 a.C. es la ciudad más antigua del mundo occidental habitada de forma continua. Dato que aparece frecuentemente en PAU.',
  },

  // ─── PARTE 3: HISPANIA ROMANA ────────────────────────────────────────────────

  {
    sort_order: 10,
    block_key: 'Prehistoria y Edad Antigua',
    block_slug: 'prehistoria-edad-antigua',
    title: 'La Conquista Romana de Hispania: Las Tres Fases (218–19 a.C.)',
    concept_markdown: `## La Conquista Romana de Hispania (218 - 19 a.C.)

La llegada de los romanos se enmarcó en la **Segunda Guerra Púnica** contra Cartago. La ocupación fue un proceso **lento y discontinuo** que duró más de dos siglos:

$$\\text{Fase I: Litoral Mediterráneo (218-197 a.C.)} \\longrightarrow \\text{Fase II: Interior y Meseta (197-29 a.C.)} \\longrightarrow \\text{Fase III: Cántabros y Astures (29-19 a.C.)}$$

### Primera Fase (218 - 197 a.C.)
Los hermanos Escipión desembarcan en **Emporion**. Roma derrota a los cartagineses dirigidos por Aníbal, tomando **Cartago Nova** y Gadir. Controlan el este y el sur peninsular (valles del Ebro y Guadalquivir).

### Segunda Fase (197 - 29 a.C.)
Conquista del interior de la Meseta. Roma se enfrenta a una **feroz resistencia indígena**:
- **Las Guerras Lusitanas (154-137 a.C.):** lideradas por **Viriato**, guerrillero lusitano que derrotó a varios ejércitos romanos, asesinado a traición
- **Las Guerras Celtibéricas (154-133 a.C.):** destaca el asedio y destrucción de **Numancia** (Soria), símbolo eterno de resistencia

### Tercera Fase (29 - 19 a.C.)
Fin de la conquista bajo el mando personal del emperador **Augusto**. Sometimiento de cántabros y astures, los únicos pueblos que habían resistido. Concluye la romanización del territorio.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *Describe el proceso de conquista romana de Hispania. ¿Cuáles fueron los principales episodios de resistencia indígena?*

**Estructura:**
1. Contexto: Segunda Guerra Púnica (218 a.C.) → el desembarco en Emporion como punto de partida
2. Tres fases con fechas exactas y territorios
3. Resistencia: **Viriato** (guerrillas lusitanas, traición) + **Numancia** (asedio, destrucción)
4. Conclusión: Augusto cierra la conquista en 19 a.C.

**Términos clave para usar:** *Guerras Púnicas, Segunda Guerra Púnica, Guerras Celtibéricas, Guerras Lusitanas, pronunciamiento, guerrilla*.`,
    practice_prompt: 'Explica las tres fases de la conquista romana de Hispania, indicando las fechas, los territorios conquistados en cada fase y los principales focos de resistencia indígena.',
    alert_markdown: '⚠️ La conquista de Hispania duró **dos siglos** (218-19 a.C.). No fue rápida ni fácil: la resistencia de Viriato y Numancia la convirtió en la más larga de la historia de Roma.',
  },

  {
    sort_order: 11,
    block_key: 'Prehistoria y Edad Antigua',
    block_slug: 'prehistoria-edad-antigua',
    title: 'La Romanización: Mecanismos, Economía y Legado Cultural',
    concept_markdown: `## La Romanización

Se denomina **romanización** a la asimilación e integración de los pueblos indígenas de Hispania en el modelo cultural, económico, político y social de Roma. No fue homogénea: **muy rápida en el sur y levante, muy débil en el norte montañoso**.

### Mecanismos de Romanización
- **El Latín:** sustituyó a las lenguas prerromanas (excepto al **euskera**), unificando lingüísticamente el territorio y siendo el origen de las lenguas romances actuales
- **El Derecho Romano:** reguló las relaciones políticas, mercantiles y la organización de la propiedad
- **El Ejército:** reclutamiento de soldados indígenas y fundación de colonias para veteranos (ej. *Emerita Augusta*, actual Mérida)
- **La Red de Calzadas:** ejes de transporte militar y mercantil: **Vía Augusta** (litoral mediterráneo) y **Vía de la Plata** (occidente)

### Economía Colonial
Hispania se integró en el sistema económico romano, basado en la producción esclavista y la exportación de materias primas:
- **Trilogía Mediterránea:** trigo, vino y aceite de oliva (especialmente de la Bética)
- **Minería:** oro (Las Médulas, León), plata (Cartagena) y mercurio (Almadén)

### Legado Cultural
- **Arquitectura:** teatros (Mérida), acueductos (Segovia), puentes (Alcántara), murallas (Lugo)
- **Hispanos ilustres:** Séneca, Quintiliano, Marcial (intelectuales) y los emperadores **Trajano** y **Adriano**
- **Religión:** difusión del **Cristianismo** → Edicto de Tesalónica (380 d.C.) lo convierte en religión oficial`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fue la romanización? Explica sus principales mecanismos y su legado.*

**Estructura de respuesta (4 puntos):**
1. **Definición** precisa: asimilación cultural, no solo dominio militar
2. **Mecanismos** (mínimo 3): latín, derecho, ejército, calzadas
3. **Legado económico**: trilogía mediterránea + minería → exportación a Roma
4. **Legado cultural**: arquitectura, emperadores hispanos, difusión del cristianismo

**Truco PAU:** siempre menciona que el **euskera** fue la única lengua prerromana que sobrevivió a la romanización. Es un dato que sorprende al corrector.`,
    practice_prompt: 'Define romanización y explica sus principales vehículos de difusión. ¿Qué legado dejó Roma en la Península Ibérica en los ámbitos económico, social y cultural?',
    alert_markdown: null,
  },
]

const BATCH_SIZE = 20

async function main() {
  console.log(`Insertando ${cards.length} tarjetas del Bloque 1…`)

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

  // Confirmar total de filas historia_espana
  const { count, error: countErr } = await supabase
    .from('curriculum_content_v2')
    .select('*', { count: 'exact', head: true })
    .eq('subject', 'historia_espana')

  if (countErr) {
    console.error('Error al contar:', countErr)
  } else {
    console.log(`\n✅ Bloque 1 insertado. Total filas historia_espana en tabla: ${count}`)
  }
}

main()
