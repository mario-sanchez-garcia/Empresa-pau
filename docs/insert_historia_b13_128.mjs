// Uso: node --env-file=.env.local docs/insert_historia_b13_128.mjs
// Bloque 13 — La Transición y la Democracia: flashcards 119-127 (Partes 58-61)
// + Card 128 — Técnicas PAU: Cómo hacer un comentario de texto histórico

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const SUBJECT = 'historia_espana'

const cards = [

  // ═══════════════════════════════════════════════════════════════════════════
  // BLOQUE 13: LA TRANSICIÓN DEMOCRÁTICA
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── PARTE 58A: JUAN CARLOS I, ARIAS NAVARRO ─────────────────────────────

  {
    sort_order: 119,
    block_key: 'La Transición y la Democracia',
    block_slug: 'transicion-democracia',
    title: 'Juan Carlos I, Arias Navarro y el Inicio de la Transición (1975–1976)',
    concept_markdown: `## Juan Carlos I y el Dilema de la Transición (1975)

El rey **Juan Carlos I** fue proclamado el **22 de noviembre de 1975** en las Cortes franquistas, jurando los Principios del Movimiento Nacional. La mayoría de la oposición democrática lo veía con desconfianza: era el sucesor designado por Franco, *"Juan Carlos el Breve"* lo llamaban en los medios de izquierda internacionales.

Sin embargo, Juan Carlos tenía desde tiempo antes la intención de pilotar una transición hacia la democracia, convencido (por su mentor **Torcuato Fernández-Miranda** y por sus contactos europeos) de que solo la democracia garantizaría la estabilidad de la monarquía y la integración de España en Europa.

La clave de la estrategia del rey fue actuar dentro de la legalidad franquista para desmantelarla: **"de la ley a la ley"**, como definió Fernández-Miranda. El instrumento sería la reforma desde dentro, no la ruptura que pedía la oposición.

## El Gobierno de Arias Navarro y el "Franquismo sin Franco" (diciembre 1975 – julio 1976)

Juan Carlos mantuvo inicialmente a **Carlos Arias Navarro** como presidente del gobierno (el mismo que había llorado en televisión al anunciar la muerte de Franco). Arias Navarro, hombre del régimen, fue incapaz de liderar una reforma real:
- Propuso una apertura cosmética (legalización de asociaciones políticas dentro del *Movimiento*, pero sin partidos políticos reales).
- El **"búnker"** (el sector inmovilista del franquismo: Fuerza Nueva de Blas Piñar, sectores militares, el diario *El Alcázar*) presionaba contra cualquier cambio.
- Los atentados de ETA continuaban.
- La oposición democrática exigía una **"ruptura democrática"** (amnistía total, libertades, elecciones constituyentes).

El rey, harto de la inmovilidad de Arias Navarro, le pidió la dimisión en **julio de 1976**.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué estrategia siguió Juan Carlos I para pilotar la Transición democrática? ¿Por qué fracasó el gobierno de Arias Navarro?*

**Estrategia de Juan Carlos I:**
- Objetivo: democracia, pero usando la legalidad franquista para desmantelar el franquismo
- Lema de Fernández-Miranda: "de la ley a la ley a través de la ley"
- NO ruptura (como pedía la oposición) → reforma desde dentro

**Arias Navarro (diciembre 1975 – julio 1976):**
- Hombre del régimen, incapaz de reformar
- Solo propone apertura cosmética: asociaciones dentro del Movimiento, no partidos
- El "búnker" presiona → ETA actúa → oposición exige ruptura
- Juan Carlos le pide la dimisión (julio 1976)

**Clave:** el rey actuó con una "doble cara" calculada → prometió al búnker continuidad mientras planeaba la transición → fue el actor decisivo, no solo un árbitro`,
    practice_prompt: '¿Qué fue la Transición española? ¿Cuál fue la estrategia del rey Juan Carlos I para pilotar el cambio hacia la democracia? ¿Por qué fracasó el gobierno de Arias Navarro (1975-1976) y cuál era la diferencia entre "reforma" y "ruptura"?',
    alert_markdown: '⚠️ La Transición española es considerada internacionalmente como un **modelo de cambio pacífico de dictadura a democracia**. Sin embargo, desde perspectivas críticas se señalan sus limitaciones: la impunidad de los crímenes del franquismo y el papel protagonista de los reformistas del propio régimen (como Suárez, hombre del Movimiento).',
  },

  // ─── PARTE 58B: ADOLFO SUÁREZ Y LA LRP ───────────────────────────────────

  {
    sort_order: 120,
    block_key: 'La Transición y la Democracia',
    block_slug: 'transicion-democracia',
    title: 'Adolfo Suárez y la Ley para la Reforma Política (julio–diciembre 1976)',
    concept_markdown: `## Adolfo Suárez: El Nombramiento Sorpresa (julio de 1976)

El rey Juan Carlos encargó a **Torcuato Fernández-Miranda** (presidente de las Cortes y del Consejo del Reino, y hombre de enorme confianza del rey) que incluyera en la terna de candidatos a la presidencia del Gobierno a **Adolfo Suárez González**.

Suárez era un joven político de **43 años**, falangista de origen y exdirector general de RTVE, considerado por la oposición como un aparatchik del Movimiento sin mayor relevancia. La prensa lo recibió con escepticismo: la revista *Cuadernos para el Diálogo* tituló *"¡Qué error, qué inmenso error!"*.

Suárez tenía, sin embargo, cualidades que resultarían decisivas: era extraordinariamente hábil negociador, conocía el sistema desde dentro, no generaba el rechazo visceral que provocaban otros reformistas del régimen entre la oposición, y tenía el apoyo total del rey.

## La Ley para la Reforma Política (noviembre 1976)

La pieza clave de la estrategia de Suárez fue la **Ley para la Reforma Política**, que debía desmantelar el franquismo utilizando los propios mecanismos jurídicos franquistas.

**La operación de Fernández-Miranda:** como presidente de las Cortes franquistas, Fernández-Miranda maniobró para que la Ley para la Reforma Política fuera tratada como una simple ley ordinaria más. Él mismo la describió como la palanca para pasar *"de la ley a la ley a través de la ley"*.

**Contenido de la Ley para la Reforma Política:**
- Establecía un sistema parlamentario bicameral: **Congreso de los Diputados** (elegido por sufragio universal directo) y **Senado**.
- Reconocía los derechos fundamentales de la persona.
- La ley se sometería a referéndum popular para su aprobación.

**El debate en las Cortes franquistas (18 de noviembre de 1976):** Suárez convenció, presionó e incentivó a los procuradores franquistas para que votaran su propia desaparición. El resultado fue **425 votos a favor, 59 en contra y 13 abstenciones**. Los procuradores fueron bautizados irónicamente como el *"harakiri"* de las Cortes.

**El referéndum (15 de diciembre de 1976):** la Ley para la Reforma Política fue aprobada en referéndum con el **94,17% de votos afirmativos** y una participación del **77%**. La oposición democrática (PCE, PSOE) había pedido la abstención, pero la mayoría de los españoles votaron sí. La reforma tenía legitimidad popular.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fue la Ley para la Reforma Política (1976) y qué papel tuvo en la Transición?*

**Adolfo Suárez:**
- 43 años, falangista, exdirector RTVE → nadie espera nada de él
- La prensa: "¡Qué error, qué inmenso error!"
- Virtudes: hábil negociador + conoce el sistema desde dentro + apoyo del rey

**La Ley para la Reforma Política:**
- Objetivo: desmantelar el franquismo usando las leyes franquistas
- Fernández-Miranda: la hace pasar como ley ordinaria (no fundamental) → trámite más simple
- Contenido: Cortes bicamerales (Congreso + Senado) por sufragio universal + derechos fundamentales
- Las Cortes franquistas: 425 a favor / 59 en contra → "harakiri de las Cortes"
- Referéndum (15 dic. 1976): 94,17% a favor → legitimidad popular conseguida`,
    practice_prompt: '¿Por qué el nombramiento de Adolfo Suárez como presidente del Gobierno sorprendió a todos en 1976? ¿Qué fue la Ley para la Reforma Política, cómo fue aprobada por las Cortes franquistas y qué establecía? ¿Qué fue el "harakiri de las Cortes"?',
    alert_markdown: null,
  },

  // ─── PARTE 59A: ELECCIONES 1977 ───────────────────────────────────────────

  {
    sort_order: 121,
    block_key: 'La Transición y la Democracia',
    block_slug: 'transicion-democracia',
    title: 'La Legalización del PCE y las Primeras Elecciones Democráticas (junio 1977)',
    concept_markdown: `## La Legalización de los Partidos y las Elecciones de Junio de 1977

Entre enero y junio de 1977, Suárez procedió a desmantelar el edificio jurídico franquista y a legalizar los partidos políticos:

- **Ley de Amnistía (julio de 1976):** primera amnistía parcial para presos políticos.
- **Decreto-ley de normas electorales (marzo de 1977):** regulación del sistema electoral.
- **Legalización del PCE (9 de abril de 1977):** el paso más arriesgado de toda la Transición. El **Sábado Santo** (cuando la cúpula militar estaba en sus casas o de vacaciones), Suárez firmó la legalización del Partido Comunista de España, dirigido por **Santiago Carrillo**. El ejército reaccionó con una declaración del Consejo Superior del Ejército que la consideraba *"especialmente penosa"*, pero acató la decisión. Carrillo había ayudado a allanar el camino renunciando públicamente a la república y aceptando la monarquía y la bandera española.
- **Disolución del Movimiento Nacional** y de la Organización Sindical.

## Las Elecciones del 15 de junio de 1977

Fueron las primeras elecciones democráticas en España desde febrero de 1936. Los resultados:

| Partido | Líder | Votos | Escaños |
|---|---|---|---|
| *UCD (Unión de Centro Democrático)* | Adolfo Suárez | 34,4% | 166 |
| *PSOE* | Felipe González | 29,3% | 118 |
| *PCE* | Santiago Carrillo | 9,3% | 20 |
| *AP (Alianza Popular)* | Manuel Fraga | 8,2% | 16 |
| *PDC (Pacte Democràtic per Catalunya)* | Jordi Pujol | 2,8% | 11 |
| *PNV* | Carlos Garaicoetxea | 1,7% | 8 |

Suárez gobernó en minoría. La UCD no era un partido sino una coalición de 14 partidos de centro-derecha, socialdemócratas, democristianos y liberales cosidos por la figura de Suárez.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fue la legalización del PCE (1977) y por qué fue el paso más arriesgado de la Transición?*

**La legalización del PCE (9 abril 1977 — Sábado Santo):**
- El PCE era el mayor tabú de los militares franquistas
- Suárez la firma el Sábado Santo: los generales están en casa, sin posibilidad de reunirse
- Carrillo ha allanado el camino: renuncia a la república + acepta monarquía + acepta bandera española
- Reacción del ejército: "especialmente penosa" → pero acata
- Por qué fue decisiva: sin el PCE legalizado, ninguna elección podría ser democráticamente legítima

**Elecciones del 15 junio 1977 (primeras democráticas desde 1936):**
- UCD (Suárez): 34,4% → 166 escaños → minoría
- PSOE (González): 29,3% → 118 escaños
- PCE (Carrillo): 9,3% → 20 escaños
- AP (Fraga): 8,2% → 16 escaños`,
    practice_prompt: 'Explica por qué la legalización del PCE el 9 de abril de 1977 fue "el paso más arriesgado de la Transición". ¿Qué condiciones había aceptado Santiago Carrillo que facilitaron la legalización? ¿Qué resultados dieron las elecciones del 15 de junio de 1977?',
    alert_markdown: '⚠️ Las elecciones del **15 de junio de 1977** fueron las primeras elecciones democráticas en España desde el **16 de febrero de 1936** (las que ganó el Frente Popular). Un período de 41 años sin elecciones libres. Esta cifra suele aparecer en preguntas que piden comparar la democracia republicana con la Transición.',
  },

  // ─── PARTE 59B: PACTOS DE LA MONCLOA ─────────────────────────────────────

  {
    sort_order: 122,
    block_key: 'La Transición y la Democracia',
    block_slug: 'transicion-democracia',
    title: 'Los Pactos de la Moncloa (octubre 1977): el Gran Consenso Económico y Político',
    concept_markdown: `## Los Pactos de la Moncloa (25–27 de octubre de 1977)

España afrontaba en 1977 una grave crisis económica: la inflación rozaba el **30%**, el desempleo crecía rápidamente y la crisis del petróleo había deteriorado la balanza de pagos. Sin abordar la crisis económica, la democracia corría el riesgo de deslegitimarse.

El **25 y 27 de octubre de 1977** se firmaron en el Palacio de la Moncloa los **Pactos de la Moncloa**, acuerdo entre el gobierno de Suárez, los partidos parlamentarios (UCD, PSOE, PCE, AP, PNV, minorías catalanas) y las organizaciones sindicales y empresariales.

### El Pacto Económico

- **Moderación salarial:** los salarios no subirían más que la inflación prevista (no la real), sacrificando poder adquisitivo para reducir la inflación.
- **Reforma fiscal:** creación del **IRPF (Impuesto sobre la Renta de las Personas Físicas)** progresivo, que sustituía al viejo impuesto franquista. Primera vez en la historia española que los ciudadanos pagarían impuestos progresivos sobre sus rentas totales.
- **Control del gasto público** y reducción del déficit.
- **Reforma del sistema financiero.**

### El Pacto Político

- Despenalización del adulterio y del amancebamiento.
- Libertad de expresión, reunión y asociación plenas.
- Reforma del Código Penal para eliminar los delitos de opinión.

Los Pactos de la Moncloa fueron posibles gracias a la **"cultura del consenso"** que impregnó la Transición: todos los actores políticos, conscientes de la fragilidad del momento, aceptaron ceder para garantizar la democracia. El PCE de Carrillo y el PSOE de González aceptaron la moderación salarial; el gobierno aceptó las reformas fiscales y políticas.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fueron los Pactos de la Moncloa (1977) y qué importancia tuvieron para la Transición?*

**Contexto:** inflación al 30% + desempleo creciente + crisis del petróleo → la democracia necesita estabilidad económica

**Pacto económico:**
- Moderación salarial: sueldos suben solo según inflación prevista, no la real → los trabajadores pierden poder adquisitivo a corto plazo
- IRPF: primera vez que España tiene un impuesto progresivo sobre la renta → base del Estado de Bienestar futuro
- Control del gasto + reforma financiera

**Pacto político:**
- Despenalización del adulterio + libertad de expresión + reforma del Código Penal

**Importancia:**
- Todos ceden → "cultura del consenso"
- PCE y PSOE aceptan moderación salarial = responsabilidad democrática
- El IRPF es quizás la reforma más duradera: aún existe hoy`,
    practice_prompt: '¿Qué fueron los Pactos de la Moncloa (octubre 1977)? ¿Quiénes los firmaron? ¿Cuáles fueron sus principales medidas económicas y políticas? ¿Qué fue el IRPF y por qué fue una novedad histórica en España?',
    alert_markdown: '⚠️ El **IRPF** (Impuesto sobre la Renta de las Personas Físicas) fue creado por los Pactos de la Moncloa en 1977. Antes de 1977 no existía un impuesto progresivo sobre la renta en España: era la primera vez que los españoles pagaban impuestos según lo que ganaban. Este dato histórico suele sorprender y aparece en PAU.',
  },

  // ─── PARTE 59C: CONSTITUCIÓN DE 1978 ─────────────────────────────────────

  {
    sort_order: 123,
    block_key: 'La Transición y la Democracia',
    block_slug: 'transicion-democracia',
    title: 'La Constitución de 1978: los "Padres de la Constitución" y sus Características',
    concept_markdown: `## La Constitución de 1978

Las Cortes elegidas en junio de 1977 asumieron la tarea de redactar una nueva Constitución. Se eligió una comisión constitucional de 7 miembros — los **"padres de la Constitución"** — que representaban a las principales fuerzas parlamentarias:

| Ponente | Partido |
|---|---|
| Gabriel Cisneros | UCD |
| Miguel Herrero y Rodríguez de Miñón | UCD |
| José Pedro Pérez-Llorca | UCD |
| Gregorio Peces-Barba | PSOE |
| Jordi Solé Tura | PCE-PSUC |
| Manuel Fraga Iribarne | AP |
| Miquel Roca Junyent | Minoría Catalana |

El PNV no participó en la redacción (se abstuvo en el referéndum final).

La Constitución fue aprobada por las Cortes el **31 de octubre de 1978** y refrendada en referéndum popular el **6 de diciembre de 1978** con el **87,8% de votos afirmativos** y una participación del **67,1%**. El rey la sancionó el **27 de diciembre de 1978**.

### Características Fundamentales

- **Monarquía parlamentaria:** el rey reina pero no gobierna. El poder ejecutivo reside en el presidente del Gobierno, elegido por el Congreso. El rey sanciona las leyes pero no puede vetarlas.
- **Soberanía nacional y democracia representativa.**
- **Estado social y democrático de Derecho** (art. 1).
- **Extensa declaración de derechos fundamentales** (arts. 14–38): igualdad, libertad, participación política, derechos sociales.
- **Estado de las Autonomías** (Título VIII): solución de compromiso al problema territorial. Se reconocía el derecho a la autonomía de las *"nacionalidades y regiones"* (no se usó la palabra "naciones"). El proceso de construcción del Estado autonómico se desarrolló a lo largo de los años 80.
- **Tribunal Constitucional** como garante de la Constitución.
- **Defensor del Pueblo** (ombudsman).
- **Aconfesionalidad del Estado**, con reconocimiento del papel social de la Iglesia Católica (art. 16).
- **Abolición de la pena de muerte** (salvo en tiempos de guerra).`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Cuáles fueron las características principales de la Constitución de 1978? ¿Quiénes fueron los "padres de la Constitución"?*

**Los 7 ponentes ("padres de la Constitución"):**
- 3 de UCD + Peces-Barba (PSOE) + Solé Tura (PCE) + Fraga (AP) + Roca (Minoría Catalana)
- El PNV no participó → se abstuvo en el referéndum

**Aprobación:**
- Cortes: 31 octubre 1978
- Referéndum: 6 diciembre 1978 → 87,8% a favor / 67,1% participación
- Sancionada: 27 diciembre 1978

**Características clave:**
1. Monarquía parlamentaria (el rey reina pero no gobierna)
2. Estado social y democrático de Derecho (art. 1)
3. Derechos fundamentales extensos (arts. 14-38)
4. Estado de las Autonomías (Título VIII) → "nacionalidades y regiones"
5. Tribunal Constitucional + Defensor del Pueblo
6. Estado aconfesional (separación Iglesia-Estado, pero reconoce la Iglesia Católica)
7. Abolición de la pena de muerte`,
    practice_prompt: 'Describe el proceso de elaboración de la Constitución de 1978. ¿Quiénes fueron los "padres de la Constitución"? ¿Cuándo fue aprobada y con qué resultados en referéndum? Explica sus características fundamentales, prestando especial atención al Estado de las Autonomías y a la forma de gobierno.',
    alert_markdown: '⚠️ La Constitución de 1978 usa la expresión **"nacionalidades y regiones"** (no "naciones") para definir las partes del Estado. Esta distinción terminológica fue una solución de compromiso que dejó abierta la interpretación: la Constitución no define qué es una "nacionalidad" ni cuáles lo son. Este punto es fuente de tensión política hasta hoy.',
  },

  // ─── PARTE 60A: 23-F ──────────────────────────────────────────────────────

  {
    sort_order: 124,
    block_key: 'La Transición y la Democracia',
    block_slug: 'transicion-democracia',
    title: 'El Estado de las Autonomías, el Terrorismo y el 23-F (1979–1981)',
    concept_markdown: `## El Estado de las Autonomías y el Terrorismo (1979–1981)

Las elecciones del **1 de marzo de 1979** confirmaron el mapa político de 1977. El proceso de construcción del Estado autonómico fue el gran trabajo político de este período: los **Estatutos de Autonomía** del País Vasco y Cataluña se aprobaron en referéndum en **octubre de 1979**. Siguieron Galicia y Andalucía.

**ETA** mantuvo una actividad terrorista intensa: **1980 fue el año más sangriento**, con **95 asesinatos**. Entre sus víctimas: militares, guardias civiles, policías, políticos y empresarios vascos.

## El 23-F: El Golpe de Estado del 23 de febrero de 1981

La tarde del **23 de febrero de 1981**, mientras el Congreso de los Diputados votaba la investidura de **Leopoldo Calvo-Sotelo** como nuevo presidente del Gobierno, el teniente coronel de la Guardia Civil **Antonio Tejero** irrumpió en el hemiciclo al frente de 200 guardias civiles armados al grito de *"¡Quieto todo el mundo!"* y disparó al techo.

Simultáneamente:
- El general **Jaime Milans del Bosch**, capitán general de Valencia, sacó los tanques a las calles de Valencia y declaró el estado de excepción en su región militar.
- El general **Alfonso Armada** (exsecretario de la Casa del Rey) intentaba presentarse ante los diputados secuestrados como candidato de consenso para presidir un gobierno de concentración nacional.

El golpe fracasó por la actuación del **rey Juan Carlos I**, que pasó la noche telefoneando a los capitanes generales de todas las regiones militares para pedirles que no se sumaran al golpe y que acataran la Constitución. A la **1:30 de la madrugada**, el rey apareció en televisión con uniforme de capitán general de los tres ejércitos y leyó un mensaje en el que rechazaba el golpe y ordenaba a los militares que volvieran a sus cuarteles.

A las **6:00 de la madrugada del 24 de febrero**, Tejero capituló y liberó a los diputados.

**Consecuencias:**
- El rey quedó consagrado como **garante de la democracia española**.
- Los golpistas fueron juzgados y condenados a penas de entre 6 y 30 años (Milans y Armada).
- La sociedad española respondió con una **manifestación multitudinaria en Madrid el 27 de febrero de 1981**: más de un millón de personas en apoyo a la democracia.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fue el 23-F y por qué fracasó?*

**Los hechos (23 febrero 1981):**
- Tejero (Guardia Civil): asalta el Congreso con 200 guardias mientras se vota la investidura de Calvo-Sotelo
- Milans del Bosch (Valencia): saca los tanques a la calle
- Armada: quiere presentarse como candidato de consenso a los diputados secuestrados

**Por qué fracasó:**
- El rey Juan Carlos I llama PERSONALMENTE a todos los capitanes generales esa noche → les pide que no se sumen
- A la 1:30 de la madrugada: el rey aparece en TVE con uniforme de capitán general → rechaza el golpe → ordena volver a cuarteles
- El ejército acata al rey

**Consecuencias:**
- Juan Carlos I: héroe de la democracia (al menos a corto plazo)
- Tejero: condenado → cumple parte de la condena
- Milans + Armada: hasta 30 años
- Manifestación en Madrid (27 feb. 1981): +1 millón de personas`,
    practice_prompt: 'Describe el golpe de Estado del 23-F (23 de febrero de 1981): ¿quiénes fueron sus protagonistas, qué ocurrió esa tarde en el Congreso de los Diputados, y por qué fracasó? ¿Qué papel jugó el rey Juan Carlos I? ¿Cuáles fueron sus consecuencias?',
    alert_markdown: '⚠️ El **23-F** fue el último intento de golpe de Estado en España hasta la fecha. Tuvo lugar mientras se votaba la investidura de Calvo-Sotelo como sucesor de Suárez (que había dimitido el 29 de enero de 1981). Fue un momento de enorme fragilidad democrática: la democracia española tenía solo 3 años.',
  },

  // ─── PARTE 60B: FIN DE LA UCD Y VICTORIA PSOE 1982 ───────────────────────

  {
    sort_order: 125,
    block_key: 'La Transición y la Democracia',
    block_slug: 'transicion-democracia',
    title: 'La Crisis de la UCD y el "Cambio": la Victoria del PSOE en 1982',
    concept_markdown: `## La Crisis Interna de la UCD y la Dimisión de Suárez

La **UCD** era una coalición artificial de tendencias (socialdemócratas, democristianos, liberales, suaristas) unida solo por la figura de Suárez. Sin el pegamento de la Transición, las tensiones internas afloraron:
- El debate sobre la **Ley del Divorcio (1981)**, que los democristianos rechazaban.
- El debate sobre la **LOAPA** (Ley Orgánica de Armonización del Proceso Autonómico).
- Las intrigas de los llamados *"barones"* de la UCD (Fernández Ordóñez, Landelino Lavilla, Miguel Herrero) contra el liderazgo de Suárez.

Suárez, agotado, dimitió el **29 de enero de 1981**, en un discurso televisivo en el que aludía a su voluntad de no ser un obstáculo para la democracia.

## El Gobierno de Calvo-Sotelo y la Entrada en la OTAN

**Leopoldo Calvo-Sotelo** gobernó hasta las elecciones de octubre de 1982, con la UCD desintegrándose: grupos de diputados se fueron al PSOE, a Alianza Popular o formaron nuevas agrupaciones.

La gran decisión de su gobierno fue la **entrada de España en la OTAN (30 de mayo de 1982)**, ratificada por las Cortes con los votos de UCD, AP y algunos diputados socialistas, mientras el PSOE prometía someter el ingreso a referéndum.

## Las Elecciones del 28 de octubre de 1982: el "Cambio"

Las elecciones del **28 de octubre de 1982** supusieron el **"cambio"**: el PSOE de **Felipe González** obtuvo una **mayoría absoluta histórica (202 escaños, el 48,1% de los votos)**. La UCD desapareció prácticamente (pasó a 11 escaños). AP de Manuel Fraga se convirtió en el principal partido de la derecha con 107 escaños.

La democracia española había superado su **primera alternancia pacífica en el poder**: el partido en el gobierno perdía y aceptaba el resultado. Era la señal definitiva de que la democracia española estaba consolidada.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Por qué quebró la UCD? ¿Qué significó la victoria del PSOE en 1982?*

**Quiebra de la UCD:**
- La UCD era una coalición artificial → sin la Transición que la unía, explota
- Suárez dimite (29 enero 1981) → días después llega el 23-F
- Calvo-Sotelo hereda un partido desintegrado
- Calvo-Sotelo: mete a España en la OTAN (30 mayo 1982) → el PSOE prometía referéndum

**Elecciones del 28 octubre 1982 ("el Cambio"):**
- PSOE (González): 48,1% → 202 escaños → mayoría absoluta histórica
- UCD: de 166 a 11 escaños → desaparece
- AP (Fraga): 107 escaños → nueva derecha
- Significado: primera alternancia democrática pacífica → la democracia española está consolidada`,
    practice_prompt: '¿Por qué quebró la UCD como partido? ¿Por qué dimitió Adolfo Suárez el 29 de enero de 1981? ¿Qué fue la entrada de España en la OTAN (1982) y qué posición adoptó el PSOE? ¿Qué significó la victoria del PSOE en las elecciones del 28 de octubre de 1982 para la consolidación de la democracia española?',
    alert_markdown: null,
  },

  // ─── PARTE 61A: GOBIERNOS PSOE — CEE, OTAN, RECONVERSIÓN ─────────────────

  {
    sort_order: 126,
    block_key: 'La Transición y la Democracia',
    block_slug: 'transicion-democracia',
    title: 'Los Gobiernos del PSOE (1982–1996): CEE, OTAN, Reconversión Industrial y Estado de Bienestar',
    concept_markdown: `## Los Gobiernos del PSOE (1982–1996)

### La Integración en Europa: La CEE (1 de enero de 1986)

La gran apuesta exterior de los gobiernos de González fue la integración de España en la **Comunidad Económica Europea (CEE)**. Las negociaciones habían comenzado en 1977, pero se habían prolongado por las reticencias de Francia y de los países del norte.

España firmó el **Tratado de Adhesión a la CEE el 12 de junio de 1985**, entrando en vigor el **1 de enero de 1986**, junto con Portugal. Fue el acontecimiento de política exterior más importante de la democracia española:
- Acceso al mercado único europeo.
- Recepción de **Fondos Estructurales y de Cohesión** europeos para modernizar infraestructuras.
- Los fondos europeos financiaron la red de autopistas, el **AVE** (línea Madrid-Sevilla inaugurada en **1992**, primera de España) y numerosas infraestructuras.

### El Referéndum de la OTAN (12 de marzo de 1986)

El PSOE había prometido someter el ingreso en la OTAN a referéndum. González cambió de posición: la permanencia era necesaria. Hizo campaña activa por el **sí a la permanencia**, con la paradoja de que la oposición de AP (que había votado el ingreso en 1982) también pedía el sí, mientras el PCE (ahora **Izquierda Unida desde 1986**) y sectores pacifistas pedían el no.

El resultado: **52,5% a favor de la permanencia**, con tres condiciones negociadas: no integración en la estructura militar integrada (hasta 1999), no instalación de armas nucleares en suelo español y reducción progresiva de la presencia militar estadounidense.

### La Reconversión Industrial

España llegó a la democracia con sectores maduros (siderurgia, construcción naval, minería) en plena crisis. La reconversión fue el cierre o reducción de sectores no competitivos, gestionada por el ministro **Carlos Solchaga**. Los sectores afectados:
- Siderurgia: ENSIDESA + Altos Hornos de Vizcaya.
- Construcción naval: astilleros de El Ferrol, Gijón, Bilbao, Cádiz, Cartagena.
- Minería del carbón: cuencas de Asturias, León y Teruel.

La **huelga general del 14 de diciembre de 1988 (14-D)**, convocada por UGT y CC.OO., fue la mayor huelga de la democracia española.

### La Construcción del Estado de Bienestar

- **Ley General de Sanidad (1986):** creación del **Sistema Nacional de Salud**, con cobertura sanitaria universal y gratuita para todos los ciudadanos.
- **LODE (1985) y LOGSE (1990):** reforma del sistema educativo, extendiendo la escolarización obligatoria hasta los **16 años**.
- Extensión de las pensiones y las prestaciones por desempleo.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Cuáles fueron los logros principales de los gobiernos del PSOE (1982-1996)?*

**CEE (1 enero 1986):**
- Negociaciones desde 1977 → Tratado firmado (12 junio 1985) → entrada en vigor (1 enero 1986)
- Consecuencias: mercado único + Fondos Estructurales + AVE (Madrid-Sevilla, 1992)

**Referéndum OTAN (12 marzo 1986):**
- PSOE prometió referéndum → González cambia y apoya la permanencia
- 52,5% sí → España permanece con 3 condiciones (no estructura militar integrada hasta 1999)

**Reconversión industrial:**
- Cierre de siderurgia + astilleros + minería no competitivos → desempleo → tensión social
- Huelga general 14-D (14 diciembre 1988): la mayor huelga de la democracia española

**Estado de Bienestar:**
- Sanidad universal gratuita (Ley General de Sanidad 1986)
- LOGSE (1990): escolarización obligatoria hasta los 16 años
- Extensión de pensiones y prestaciones por desempleo`,
    practice_prompt: '¿Cuándo y cómo ingresó España en la CEE? ¿Qué consecuencias tuvo? Explica el referéndum de la OTAN de 1986: ¿qué había prometido el PSOE y qué hizo González? ¿Qué fue la reconversión industrial y por qué generó tanto conflicto social? ¿Cuáles fueron las principales medidas del PSOE para construir el Estado de Bienestar?',
    alert_markdown: '⚠️ El **AVE Madrid-Sevilla** fue inaugurado en **1992**, el mismo año que los Juegos Olímpicos de Barcelona y la Expo de Sevilla. El año 1992 fue el año del "milagro español" en términos de proyección internacional. Fue el símbolo de la modernización de España tras la entrada en la CEE.',
  },

  // ─── PARTE 61B: CORRUPCIÓN Y FIN DEL PSOE ────────────────────────────────

  {
    sort_order: 127,
    block_key: 'La Transición y la Democracia',
    block_slug: 'transicion-democracia',
    title: 'El Declive de los Gobiernos González: Corrupción y la Segunda Alternancia (1993–1996)',
    concept_markdown: `## El Declive de los Gobiernos González: La Corrupción (1991–1996)

Los cuatro gobiernos del PSOE (1982, 1986, 1989, 1993) fueron de mayorías absolutas los tres primeros y de minoría el cuarto. El desgaste acumulado y los escándalos de corrupción erosionaron progresivamente al partido:

- **Caso Filesa (1991):** financiación ilegal del PSOE mediante empresas pantalla.
- **Caso Roldán (1993):** Luis Roldán, director general de la Guardia Civil, malversó fondos y huyó al extranjero.
- **Caso GAL (1995):** la justicia demostró la implicación de altos cargos del Ministerio del Interior (**José Barrionuevo, Rafael Vera**) en los **GAL** (*Grupos Antiterroristas de Liberación*), grupos terroristas que habían asesinado a **27 personas** en Francia entre 1983 y 1987 bajo la coartada de la lucha antiterrorista.

## La Segunda Alternancia Democrática (1996)

Las elecciones del **3 de marzo de 1996** dieron la victoria al **Partido Popular** de **José María Aznar** por un margen estrecho (156 escaños frente a 141 del PSOE). Se producía la **segunda alternancia democrática** en la historia reciente de España.

La Transición, en sentido amplio, había concluido: la democracia española había superado el test de las dos alternancias en el poder.

## El Balance de la Transición (1975–1982)

$$\text{Franco (1939)} \longrightarrow \text{Reforma (1975-1977)} \longrightarrow \text{Constitución (1978)} \longrightarrow \text{Consolidación (1982-1996)}$$

- España pasó de dictadura a democracia en menos de 7 años sin guerra civil ni ruptura violenta.
- La Constitución de 1978 sigue siendo la ley fundamental de España.
- La integración en la CEE (1986) y la OTAN (1982/1986) anclaron definitivamente a España en el bloque democrático occidental.
- Las limitaciones de la Transición: la impunidad de los crímenes del franquismo, el papel protagonista de los reformistas del régimen, la indefinición territorial que genera tensiones autonómicas hasta hoy.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Por qué perdió el PSOE las elecciones de 1996? ¿Qué fue el caso GAL?*

**Los escándalos del PSOE:**
1. Caso Filesa (1991): financiación ilegal mediante empresas pantalla
2. Caso Roldán (1993): director general Guardia Civil malversa y huye
3. Caso GAL (1995): el Ministerio del Interior financió grupos terroristas que mataron a 27 personas en Francia (1983-87)

**Los GAL:**
- "Grupos Antiterroristas de Liberación" → terrorismo de Estado
- Objetivo: matar miembros de ETA en Francia → "guerra sucia"
- Condenados: Barrionuevo (exministro) + Rafael Vera (exsecretario de Estado)
- El caso destruyó la legitimidad moral del gobierno González

**Elecciones del 3 marzo 1996:**
- PP (Aznar): 156 escaños (estrecha victoria)
- PSOE (González): 141 escaños
- 2ª alternancia democrática → la democracia española está completamente consolidada`,
    practice_prompt: 'Describe los principales escándalos de corrupción que debilitaron a los gobiernos del PSOE en los años 90. ¿Qué fue el caso GAL y qué reveló sobre la lucha antiterrorista durante esos años? ¿Qué supuso la victoria del PP en las elecciones de marzo de 1996 para la consolidación de la democracia española?',
    alert_markdown: '⚠️ Los **GAL** (Grupos Antiterroristas de Liberación) fueron un caso de **terrorismo de Estado**: el gobierno utilizó grupos paramilitares para asesinar a presuntos miembros de ETA en Francia. Barrionuevo fue el único exministro de la democracia española condenado por terrorismo. Es uno de los episodios más oscuros de la democracia española.',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CARD 128: TÉCNICAS PAU
  // ═══════════════════════════════════════════════════════════════════════════

  {
    sort_order: 128,
    block_key: 'Técnicas PAU',
    block_slug: 'tecnicas-pau',
    title: 'Cómo hacer un comentario de texto histórico',
    concept_markdown: `## Los 4 Pasos del Comentario de Texto en la PAU

### PASO 1: CLASIFICACIÓN DEL TEXTO

Responde brevemente estas preguntas:
- **Naturaleza:** ¿qué tipo de texto es? (político, económico, jurídico, literario, periodístico, epistolar, discurso, tratado, ley, proclama…)
- **Autor:** ¿individual o colectivo? ¿contemporáneo a los hechos o posterior? ¿cuál es su relevancia?
- **Fecha:** ¿cuándo se escribió? ¿en qué contexto histórico se sitúa?
- **Destinatario:** ¿a quién va dirigido? (público general, el gobierno, una nación, la historia…)
- **Propósito:** ¿qué quiere conseguir el autor? (convencer, informar, denunciar, legislar, justificar, conmemorar…)

### PASO 2: ANÁLISIS DE IDEAS

- **Idea principal:** ¿qué defiende, denuncia o anuncia el texto?
- **Ideas secundarias:** los argumentos o puntos de apoyo de la idea principal
- **Vocabulario histórico:** identifica y define los términos técnicos o conceptos clave que aparecen en el texto (una definición correcta muestra dominio del tema)

### PASO 3: CONTEXTUALIZACIÓN HISTÓRICA *(el más importante — aquí demuestras que sabes Historia)*

- Ubica el texto en su momento histórico preciso
- Explica el contexto que hace comprensible el texto (qué pasó antes, por qué se escribió)
- Relaciona con los hechos previos y posteriores
- **Amplía más allá del texto**: aporta datos, fechas y nombres que el texto no menciona pero que son relevantes
- El examinador quiere ver que usas el texto como punto de partida para mostrar tu conocimiento

### PASO 4: VALORACIÓN CRÍTICA

- ¿Qué importancia tuvo este texto o este momento histórico?
- ¿Qué consecuencias históricas tuvo?
- Fiabilidad del documento: ¿puede ser el autor parcial o interesado? ¿es una fuente primaria o secundaria? ¿qué perspectiva adopta?

---

## ⏱️ Cómo Gestionar el Tiempo en el Examen

| Paso | Tiempo aproximado | Extensión |
|---|---|---|
| Clasificación | 3–5 minutos | 3–5 líneas |
| Análisis de ideas | 5–8 minutos | 5–8 líneas |
| Contextualización | 10–15 minutos | El más largo: 2–3 párrafos |
| Valoración | 3–5 minutos | 3–5 líneas |`,
    worked_example_markdown: `## Plantilla de Redacción Rápida

**Párrafo 1 — Clasificación:**
*"El presente texto es un documento de naturaleza [X], escrito por [Y] en [fecha/período]. Su destinatario es [Z] y su propósito fundamental es [objetivo: convencer / denunciar / legislar / proclamar]."*

**Párrafo 2 — Análisis de ideas:**
*"La idea principal del texto es [X]. El autor argumenta que [idea 1], [idea 2] y [idea 3]. Los términos clave son: [término 1]: [definición breve]; [término 2]: [definición breve]."*

**Párrafos 3–4 — Contextualización:**
*"Este texto se enmarca en el contexto de [período histórico]. Para comprenderlo es necesario recordar que [antecedentes]. [Desarrollo del contexto histórico con datos concretos, fechas y nombres propios]. Esta situación derivó en [consecuencias], lo que explica el tono y el contenido del documento."*

**Párrafo 5 — Valoración:**
*"En conclusión, este texto tiene una gran importancia histórica porque [consecuencias concretas]. En cuanto a la fiabilidad, [juicio crítico: si es fuente primaria / si el autor tiene intereses / si hay que contrastar con otras fuentes]."*

---

## Los Errores Más Comunes (y cómo evitarlos)

| Error | Solución |
|---|---|
| Copiar frases del texto sin explicar | Usa el texto como punto de partida, no como respuesta |
| Olvidar contextualizar | El Paso 3 vale la mitad de la nota |
| Confundir fecha del texto con fecha de los hechos | Un texto puede ser de 1936 sobre hechos de 1808 |
| No definir el vocabulario histórico | Cada término definido = puntos fáciles |
| Olvidar la valoración crítica | El examinador valora el pensamiento crítico |`,
    practice_prompt: 'Comenta el siguiente texto histórico siguiendo los 4 pasos: clasifica el texto (naturaleza, autor, fecha, destinatario, propósito), analiza sus ideas principales y el vocabulario histórico clave, contextualiza históricamente aportando datos más allá del propio texto, y valora su importancia histórica y la fiabilidad de la fuente.',
    alert_markdown: '⚠️ **Regla de oro del comentario de texto PAU:** el examinador NO te pide que resumas el texto — lo tiene delante. Te pide que demuestres que SABES Historia. Usa el texto como trampolín para lucir tu conocimiento del contexto. El Paso 3 (contextualización) es donde se gana o se pierde la mayor parte de la nota.',
  },
]

const BATCH_SIZE = 5

async function main() {
  console.log(`Insertando ${cards.length} tarjetas (Bloque 13 + Técnicas PAU)…`)

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
    console.log(`\n✅ Inserción completa. Total filas historia_espana en tabla: ${count}`)
  }
}

main()
