-- Auditoría histórica y lingüística final de Historia de España (25 de 128
-- topics corregidos) y Lengua Castellana y Literatura II (13 de 60 topics
-- corregidos) PAU Madrid — segunda revisión independiente. Correcciones
-- objetivas de fecha/nombre (saqueo de Santiago por Almanzor: 997, no 1002;
-- Orden de Montesa fundada en 1317, fuera de la repoblación de la primera
-- mitad del s. XIII; Inquisición autorizada por bula de Sixto IV en 1478,
-- no creación regia independiente del Papado; Santa María = nao, no
-- carabela; Carlos V elegido rey de romanos en 1519, coronación imperial
-- papal en Bolonia en 1530; mudéjares 1502 limitado a Castilla, 1525-1526
-- en Aragón), simplificaciones históricas matizadas (Paleolítico peninsular,
-- arte cantábrico y levantino, megalitismo, iberos/celtíberos, Tartessos,
-- colonizaciones fenicia/griega/cartaginesa, cifras del Califato de
-- Córdoba, almorávides/almohades, legado andalusí, "desierto estratégico"
-- del Duero, Sancho III, Borrell II, Corona de Aragón, Castilla
-- bajomedieval, lema de Fernando el Católico, posición de Fernando/Isabel,
-- Paz de Augsburgo, Felipe II, aljamiado) y criterios de corrección de
-- Lengua actualizados a los vigentes de la Comisión Organizadora de la PAU
-- de Madrid (penalización ortográfica: la primera falta no penaliza, -0,25
-- desde la segunda, máximo 2 puntos; hasta 1 punto aparte por
-- redacción/coherencia/cohesión/léxico/gramática), más correcciones de
-- consejos Kairo presentados como exigencia oficial (tema, resumen,
-- tipología textual, funciones del lenguaje, características lingüísticas),
-- inconsistencia terminológica de "pero"/"también"/"si partimos de la base
-- de que" como marcadores discursivos, sintagma preposicional, morfología
-- de "predominante", estatus del aranés, asturleonés/aragonés,
-- bilingüismo/diglosia, jerarquización de dialectos, y Valle-Inclán. El
-- resto de topics (103 en Historia, 47 en Lengua) se revisaron y se
-- mantienen sin cambios. Ya aplicado en directo contra Supabase con
-- SUPABASE_SERVICE_ROLE_KEY antes de este commit; esta migración deja
-- constancia reproducible del cambio.

UPDATE curriculum_content_v2 SET concept_markdown = $mkd$## El Paleolítico (1.200.000 - 10.000/8.000 a.C.)

La etapa más larga de nuestra historia. Se caracteriza por una economía **depredadora** (caza, pesca y recolección) y un estilo de vida **nómada**, con asentamientos estacionales junto a ríos o cuevas. Tras el Paleolítico se sitúa un período de transición, el **Epipaleolítico o Mesolítico** (c. 10.000 - 5.000 a.C.), antes de la llegada del Neolítico a la Península.

### Paleolítico Inferior (1.200.000 - 100.000 a.C.)
Presencia del *Homo antecessor* (yacimiento de la **Gran Dolina en Atapuerca**, Burgos, c. 800.000 años) y del *Homo heidelbergensis*. Herramientas toscas como **bifaces** (hachas de piedra bifaciales). El consenso científico actual **no considera al *Homo antecessor* un antepasado directo** ni de los neandertales ni de los sapiens: se trata de una especie situada en una rama distinta del árbol evolutivo humano, cuya relación exacta con las poblaciones posteriores sigue debatiéndose.

### Paleolítico Medio (100.000 - 35.000 a.C.)
Protagonizado por el *Homo neanderthalensis*, que no desciende del *Homo antecessor* sino, probablemente, de poblaciones europeas de *Homo heidelbergensis*. Gran dominio del fuego, primeros **enterramientos rituales** y herramientas especializadas de piedra (cultura Musteriense).

### Paleolítico Superior (35.000 - 10.000/8.000 a.C.)
Llegada del *Homo sapiens* (que tampoco desciende del *antecessor* ni del neandertal, aunque convivió y llegó a cruzarse puntualmente con este último). Dominio del **arte rupestre** y diversificación de materiales (hueso, asta). El final del Paleolítico se sitúa, según el criterio científico estándar, hacia el 10.000-8.000 a.C., coincidiendo con el fin de la última glaciación; a partir de ahí se abre la fase de transición (Epipaleolítico/Mesolítico) hasta la llegada de la agricultura hacia el 5.000 a.C.$mkd$, worked_example_markdown = $mkd$**Pregunta tipo PAU:** *Describe las características del Paleolítico y los principales yacimientos paleolíticos de la Península Ibérica.*

**Clave de respuesta:**
- Define economía depredadora frente a productora (diferencia clave con el Neolítico)
- Cita las **tres etapas** y el homínido que protagonizó cada una, en orden cronológico: *Homo antecessor* (Inferior) — *Homo neanderthalensis* (Medio) — *Homo sapiens* (Superior). Ojo: es una sucesión cronológica, no una cadena de descendencia directa; el consenso actual sitúa al *antecessor* en una rama evolutiva distinta
- Menciona **Atapuerca (Gran Dolina)** como yacimiento estrella del Paleolítico Inferior en España
- No confundas: nomadismo = Paleolítico / sedentarismo = Neolítico. Es una distinción que cae siempre.$mkd$ WHERE subject = 'historia_espana' AND sort_order = 1;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$## El Arte Rupestre Paleolítico: La Escuela Cantábrica

Su máximo exponente es la **Cueva de Altamira** (Cantabria).

### Características esenciales (para PAU)

| Rasgo | Detalle |
|---|---|
| **Localización** | Interior profundo de las cuevas, en zonas de difícil acceso |
| **Temática** | Figuras **aisladas** de grandes animales: bisontes, caballos, ciervos |
| **Color** | **Policromía** (negro, ocre y rojo) |
| **Técnica** | Gran **realismo**, aprovecha los relieves de la roca para dar volumen |
| **Figura humana** | No aparece de forma relevante |

### Interpretación
No existe una explicación demostrada de su función. La interpretación tradicional más difundida lo asocia a rituales de **caza mágica** (pintar el animal como forma simbólica de dominar su espíritu antes de cazarlo), pero esta lectura ha sido matizada por la investigación posterior, que también baraja hipótesis chamánicas, de iniciación ritual o de marcación simbólica del territorio. Lo que sí parece razonablemente claro es que las zonas más profundas y decoradas de las cuevas no se usaban como espacio de habitación cotidiana —a diferencia de las bocas de cueva, donde sí hay restos de ocupación—, lo que sugiere un uso ritual o ceremonial de esas galerías.

### Otros yacimientos
Cueva de Lascaux (Francia), Cueva del Castillo (Cantabria), Cueva de Tito Bustillo (Asturias).$mkd$ WHERE subject = 'historia_espana' AND sort_order = 2;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$## El Arte Rupestre Neolítico: La Escuela Levantina

Se desarrolla en abrigos rocosos al **aire libre**, en el litoral mediterráneo y zonas del interior peninsular. Se asocia tradicionalmente al Neolítico, pero conviene matizar: la cronología del arte levantino es objeto de debate historiográfico, y varias dataciones sitúan sus fases más antiguas ya en el Epipaleolítico o Mesolítico, es decir, antes de la generalización de la agricultura. No debe presentarse, por tanto, como sinónimo automático y cerrado de "arte neolítico".

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
La aparición de **escenas narrativas con humanos** suele relacionarse con los cambios sociales del final de la Prehistoria: ya no solo importa la presa, sino la acción colectiva de la caza, la cosecha o la vida en grupo. Como su cronología exacta sigue debatida, esta lectura debe entenderse como una interpretación general y no como un hecho cerrado.$mkd$, worked_example_markdown = $mkd$**Pregunta tipo PAU:** *Compara el arte rupestre cantábrico (Paleolítico) y el arte levantino (Neolítico).*

**Las cuatro diferencias clave:**
1. **Lugar**: cuevas profundas vs. abrigos al aire libre
2. **Color**: policromía vs. monocromía
3. **Figuras**: animales aislados vs. escenas con humanos
4. **Estilo**: realismo naturalista vs. esquematismo estilizado

Relaciona el estilo artístico con el contexto social, pero con prudencia: al arte paleolítico se le atribuye tradicionalmente una función de "magia de caza" (interpretación en debate, no un hecho demostrado); el levantino suele vincularse a la vida colectiva de comunidades ya productoras, aunque su cronología exacta (Neolítico o incluso Epipaleolítico) sigue discutida.$mkd$ WHERE subject = 'historia_espana' AND sort_order = 4;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$## La Edad de los Metales (3.000 - Siglo III a.C.)

Se divide según el metal tecnológico predominante, provocando una creciente **estratificación social** y la aparición de poblados fortificados:

$$\text{Edad del Cobre (Calcolítico)} \longrightarrow \text{Edad del Bronce} \longrightarrow \text{Edad del Hierro}$$

### Edad del Cobre o Calcolítico (3.000 - 1.700 a.C.)
- Cultura de **Los Millares** (Almería): poblado amurallado con necrópolis megalítica
- Difusión del **vaso campaniforme** por toda Europa
- El **megalitismo** (dólmenes de corredor como los de **Antequera**, Málaga) alcanza su máximo desarrollo en este período, aunque no es exclusivo del Calcolítico: ya existen manifestaciones megalíticas en el Neolítico final peninsular

### Edad del Bronce (1.700 - 1.000 a.C.)
Mezcla de cobre + estaño. Destaca:
- Cultura de **El Argar** (Almería): enterramientos individuales bajo las casas, jerarquización social muy marcada
- Cultura **talayótica** en las Islas Baleares (talayots = torres de vigilancia)

### Edad del Hierro (1.000 a.C. en adelante)
Coincide con la llegada de los **pueblos colonizadores** (fenicios, griegos) y los pueblos **indoeuropeos (celtas)**, introduciendo la metalurgia avanzada del hierro y la escritura. Es el umbral con la Historia.$mkd$, worked_example_markdown = $mkd$**Pregunta tipo PAU:** *Describe las principales culturas de la Edad del Cobre y del Bronce en la Península Ibérica.*

**Estructura:**
1. Calcolítico: **Los Millares** → características (amurallado, necrópolis megalítica, vaso campaniforme)
2. Bronce: **El Argar** → características (enterramientos individuales, jerarquización)
3. Ambas: aparición de la **estratificación social** como novedad clave respecto al Neolítico más igualitario
4. Menciona el **megalitismo** (dólmenes) como manifestación cultural que alcanza su máximo desarrollo en el Calcolítico, aunque tiene antecedentes ya en el Neolítico final

**Términos clave para usar:** *megalitismo, dolmen, vaso campaniforme, ajuar funerario, estratificación social*.$mkd$ WHERE subject = 'historia_espana' AND sort_order = 5;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$## Los Iberos (Siglos V - III a.C.)

Asentados en el **sur y el litoral mediterráneo**. Recibieron una enorme influencia cultural de fenicios y griegos.

### Economía
Rica y avanzada. Agricultura mediterránea (trilogía: vid, olivo, trigo), ganadería, minería y metalurgia. Desarrollaron:
- El **uso de la moneda** (la más avanzada de los pueblos peninsulares)
- Una **escritura propia** (el signario ibérico): hoy sabemos **leer** sus signos (transcribirlos a sonidos) con bastante fiabilidad, pero la **lengua ibérica** que transmiten sigue sin descifrarse, es decir, no se comprende el significado de la mayoría de los textos. Conviene distinguir ambas cosas: "no descifrada" no equivale a "no se puede leer"

### Sociedad
Aristocrática y jerarquizada, liderada por **régulos** o jefes tribales. Estructurada en ciudades-estado fortificadas llamadas **oppida**.

### Arte
Muy desarrollado, especialmente la **escultura funeraria y religiosa**. Las dos obras más famosas:
- **La Dama de Elche** (Alicante): busto femenino de gran refinamiento, posiblemente urna funeraria
- **La Dama de Baza** (Granada): figura femenina sedante, también de uso funerario$mkd$, worked_example_markdown = $mkd$**Pregunta tipo PAU:** *Describe las características de los iberos: organización social, economía y manifestaciones artísticas.*

**Clave de respuesta:**
1. Localización: sur y litoral mediterráneo → influencia fenicia y griega
2. Economía: trilogía mediterránea + minería + moneda + escritura (se puede leer, pero la lengua no está descifrada)
3. Sociedad: aristocrática, régulos, oppida (ciudades-estado)
4. Arte: escultura funeraria → **La Dama de Elche** y **La Dama de Baza** como ejemplos obligatorios

**Distinción con los celtas:** los iberos desarrollaron moneda y escritura propias; los celtas del norte y el oeste, en general, no. Los celtíberos son la excepción dentro del mundo celta: por su contacto con los iberos, sí adoptaron escritura y moneda. Evita presentarlo como una jerarquía de pueblos "más" o "menos" avanzados: son trayectorias culturales distintas.$mkd$ WHERE subject = 'historia_espana' AND sort_order = 6;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$## Los Celtas y Celtíberos (Siglos V - III a.C.)

Asentados en el **centro, norte y oeste** peninsular, de origen indoeuropeo. Su organización social y su cultura material eran distintas de las de los iberos, sin que ello implique una jerarquía de "mayor" o "menor" desarrollo entre ambos pueblos.

### Economía
- En el norte: **ganadera** y recolectora
- En el centro (celtíberos): **agrícola** y ganadera
- Excelente trabajo del **bronce y el hierro**
- Los pueblos celtas del norte y del oeste, en general, no acuñaron moneda propia ni desarrollaron escritura. Los **celtíberos**, en cambio, sí adoptaron —por influencia ibérica— una **escritura propia (celtibérica, con el signario ibérico adaptado)** y llegaron a **acuñar moneda**, por lo que no deben incluirse sin matices en el grupo "sin escritura ni moneda"

### Sociedad
Organización **tribal** basada en el parentesco (clanes). Vivían en **castros** (poblados fortificados con casas de planta circular), típicos de Galicia, Asturias y el noroeste peninsular.

### Arte
Escultura tosca de animales tallados en piedra. El ejemplo más conocido: los **Toros de Guisando** (Ávila), relacionados con ritos ganaderos de demarcación territorial.

### Los Celtíberos
Pueblos de raíz céltica (indoeuropea) asentados en la Meseta central que, por su contacto prolongado con el mundo ibérico, adoptaron rasgos culturales de este —escritura, moneda, mayor uso del metal— combinándolos con su propia organización tribal. Más que una simple "mezcla étnica" de celtas e iberos, se trata de un proceso de intensa influencia cultural ibérica (aculturación) sobre una base céltica. Son los protagonistas de la resistencia a Roma: **Numancia** era una ciudad celtíbera.$mkd$, worked_example_markdown = $mkd$**Pregunta tipo PAU:** *Compara a los iberos y a los celtas como pueblos prerromanos.*

**Tabla comparativa:**

| | **Iberos** | **Celtas** |
|---|---|---|
| Zona | Sur y mediterráneo | Centro, norte y oeste |
| Economía | Agricultura avanzada + moneda | Ganadería + en general sin moneda |
| Escritura | Sí (se puede leer, pero la lengua no está descifrada) | No, salvo los celtíberos |
| Organización | Oppida (ciudades-estado) | Castros (poblados tribales) |
| Arte | La Dama de Elche | Toros de Guisando |

Este cuadro comparativo es una pregunta clásica de PAU. Apréndetelo, pero recuerda la excepción: los **celtíberos** (celtas de la Meseta) sí tuvieron escritura propia y moneda por influencia ibérica.$mkd$ WHERE subject = 'historia_espana' AND sort_order = 7;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$## Tartessos (Siglos VIII - VI a.C.)

Considerado tradicionalmente el primer gran reino organizado de la Península Ibérica, situado en el **valle del Guadalquivir** (actual Andalucía occidental).

### Importancia histórica
- Algunos autores lo identifican con el *Tarsis* bíblico y con menciones de textos griegos sobre un reino de inmensa riqueza minera en el extremo occidental, aunque esta identificación sigue siendo objeto de debate entre los especialistas
- Controlaban los yacimientos de **oro, plata y cobre** del suroeste peninsular
- Establecieron prósperas relaciones comerciales con fenicios y griegos

### Organización política
Sociedad fuertemente jerarquizada con un **monarca**. El rey más conocido, según los textos griegos (que lo presentan como un gobernante longevo y sabio), es **Argantonio**, cuyo nombre significa "el hombre de plata" y refleja la riqueza minera atribuida al reino.

### Desaparición
Tartessos entra en declive y deja de mencionarse en las fuentes hacia el **siglo VI a.C.** Las causas no están establecidas con certeza: se manejan como hipótesis el creciente dominio cartaginés sobre el comercio del Mediterráneo occidental, catástrofes naturales o un proceso de transformación interna hacia las culturas ibéricas posteriores. Su capital no ha sido localizada arqueológicamente con seguridad.

### Hallazgo arqueológico clave
**El Tesoro de El Carambolo** (Sevilla): conjunto de joyas de oro macizo que se ha vinculado tradicionalmente al mundo tartésico, aunque su atribución cultural exacta (orientalizante fenicio o propiamente tartésica) sigue siendo discutida por los especialistas.$mkd$, worked_example_markdown = $mkd$**Pregunta tipo PAU:** *¿Qué fue Tartessos y cuál fue su importancia en la historia prerromana de la Península Ibérica?*

**Puntos clave para desarrollar:**
1. Localización: valle del Guadalquivir → considerado tradicionalmente el primer reino organizado de la Península
2. Fuentes: posible identificación (discutida) con el *Tarsis* bíblico y con textos griegos → gran riqueza minera (oro, plata)
3. Rey Argantonio (según fuentes griegas) → símbolo del poderío tartésico
4. Relaciones comerciales con fenicios → precursores del intercambio cultural mediterráneo
5. Declive y desaparición de las fuentes hacia el s. VI a.C. → causas no establecidas con certeza (presión cartaginesa, causas naturales, transformación interna) → no se ha localizado con seguridad la capital
6. Evidencia arqueológica: **Tesoro de El Carambolo** (atribución tartésica discutida)$mkd$ WHERE subject = 'historia_espana' AND sort_order = 8;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$## Las Colonizaciones Históricas (Siglos X - III a.C.)

Tres grandes potencias mediterráneas llegaron a las costas de la Península **atraídas por la abundancia de metales**. Fenicios y griegos se limitaron, en general, a fundar **factorías comerciales marítimas** de intercambio, sin una vocación sistemática de conquistar el interior. Los cartagineses, en cambio, evolucionaron en el siglo III a.C. hacia una auténtica **conquista territorial** del sureste peninsular (ver más abajo), por lo que no conviene generalizar la idea de "solo factorías comerciales" a los tres pueblos por igual.

### Los Fenicios (s. X - VIII a.C.)
- Pueblo semita procedente del Líbano (actuales Tiro y Sidón)
- Fundaron la primera colonia: **Gadir** (actual **Cádiz**), tradicionalmente fechada hacia el 1104 a.C. por fuentes clásicas (como Veleyo Patérculo); se trata de una fecha legendaria transmitida por la literatura antigua, no de una datación arqueológica confirmada (los restos arqueológicos más antiguos localizados son varios siglos posteriores). Aun así, Cádiz se considera una de las ciudades habitadas más antiguas de Occidente
- También: Malaka (Málaga), Sexi (Almuñécar), Abdera (Adra)
- **Aportaciones culturales:** el **alfabeto fenicio** (antepasado del latino), la **púrpura** como tinte, la **metalurgia del hierro**, el torno del alfarero y técnicas de salazón del pescado

### Los Griegos (s. VIII - VI a.C.)
- Procedentes de las polis de Focea (Asia Menor)
- Fundaron principalmente en el noreste: **Emporion** (Ampurias, Gerona) y **Rhode** (Rosas)
- **Aportaciones:** técnicas agrícolas avanzadas (vid, olivo), acuñación de **moneda**, escritura y arte

### Los Cartagineses (s. VI - III a.C.)
- Herederos del comercio fenicio desde Cartago (norte de África); en una primera fase actuaron también mediante factorías comerciales
- Fundaron **Cartago Nova** (Cartagena) como capital de un dominio territorial propio
- A partir de finales del siglo III a.C., con los **Bárcidas** (Amílcar Barca, Asdrúbal y Aníbal), la presencia cartaginesa dejó de limitarse al comercio: se convirtió en una **conquista militar y territorial** del sureste peninsular, con explotación directa de sus minas de plata y reclutamiento de tropas indígenas
- Rivales de Roma → Segunda Guerra Púnica (218 a.C.) = inicio de la conquista romana$mkd$, worked_example_markdown = $mkd$**Pregunta tipo PAU:** *¿Qué pueblos colonizadores llegaron a la Península Ibérica? ¿Cuáles fueron sus principales aportaciones culturales?*

**Estructura de respuesta:**
1. Contexto: todos buscaban metales; fenicios y griegos, sobre todo comercio, no conquista sistemática
2. Fenicios: Gadir (fecha tradicional, 1104 a.C., no confirmada arqueológicamente) → **alfabeto, hierro, salazón, alfarería**
3. Griegos: Emporion → **moneda, escritura, vino, olivo**
4. Cartagineses: Cartago Nova → en el s. III a.C. los Bárcidas pasan de las factorías comerciales a la **conquista territorial** del sureste → rivalidad con Roma → inicio de la Historia de Hispania

**Término que siempre cae:** *factorías comerciales* = colonias de intercambio, modelo dominante en fenicios y griegos; no aplica sin matices a la expansión cartaginesa bárquida del s. III a.C., que sí fue una conquista territorial.$mkd$, alert_markdown = $mkd$⚠️ Gadir (Cádiz), tradicionalmente fechada c. 1104 a.C. por fuentes antiguas (no confirmada arqueológicamente), se considera una de las ciudades habitadas más antiguas de Occidente. Dato que aparece frecuentemente en PAU.$mkd$ WHERE subject = 'historia_espana' AND sort_order = 9;
UPDATE curriculum_content_v2 SET worked_example_markdown = $mkd$**Pregunta tipo PAU:** *Describe el proceso de conquista romana de Hispania. ¿Cuáles fueron los principales episodios de resistencia indígena?*

**Estructura:**
1. Contexto: Segunda Guerra Púnica (218 a.C.) → el desembarco en Emporion como punto de partida
2. Tres fases con fechas exactas y territorios
3. Resistencia: **Viriato** (guerrillas lusitanas, traición) + **Numancia** (asedio, destrucción)
4. Conclusión: Augusto cierra la conquista en 19 a.C.

**Términos clave para usar:** *Guerras Púnicas, Segunda Guerra Púnica, Guerras Celtibéricas, Guerras Lusitanas, guerrilla, resistencia indígena*.$mkd$ WHERE subject = 'historia_espana' AND sort_order = 10;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$## El Califato de Córdoba (929–1031)

### La Proclamación del Califato
A comienzos del siglo X, Al-Ándalus sufría una profunda crisis interna (revuelta de Omar ben Hafsún). Para restaurar la autoridad, **Abderramán III** asumió el poder político en el 912 y, en el **929**, tomó una decisión histórica: se proclamó **Califa**.

$$\text{Emirato Independiente (Solo Independencia Política)} \longrightarrow \text{Califato (Independencia Política + Religiosa)}$$

El califa concentra en su persona el poder **político, militar y religioso** simultáneamente.

### Abderramán III (929-961): El Esplendor
- Pacificó el territorio sometiendo todas las rebeliones internas
- Detuvo el avance de los reinos cristianos del norte, haciéndoles pagar tributos (**parias**)
- Mandó construir la fastuosa ciudad palatina de **Medina Azahara** (a 8 km de Córdoba): palacio-ciudad que simbolizaba el poder califal ante el mundo islámico
- Córdoba se convirtió en una de las ciudades más grandes y refinadas de Occidente. Las fuentes árabes medievales le atribuyen cifras extraordinarias (hasta ~500.000 habitantes, 700 mezquitas, 70 bibliotecas) que la historiografía moderna considera muy discutibles y probablemente exageradas; lo indiscutido es que fue una de las grandes metrópolis de su tiempo

### Al-Hakam II (961-976): La Cultura
Época de paz, estabilidad material y un inmenso esplendor **cultural y bibliográfico**. Las fuentes medievales atribuyen a la biblioteca del califa más de 400.000 manuscritos, cifra que los historiadores actuales tratan con cautela por su carácter difícilmente verificable, aunque no cuestionan que fuera, con diferencia, la mayor biblioteca de la Europa de su tiempo.$mkd$ WHERE subject = 'historia_espana' AND sort_order = 14;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$## La Dictadura de Almanzor (976–1002) y la Fitna

### La Dictadura de Almanzor
Con el joven califa **Hisham II** recluido, el visir **Almanzor** (Muhámmad ibn Abi Amir) secuestró el poder real estableciendo una **dictadura militar de facto**.

**Características del régimen de Almanzor:**
- Basó su legitimidad en la **yihad** contra los reinos cristianos del norte
- Realizó más de **50 feroces campañas de saqueo** (*razzias* o *aceifas*) contra los reinos del norte
- Sus victorias más conocidas: destrucción de **Barcelona (985)** y profanación de **Santiago de Compostela (997)**, llevándose las campanas de la catedral a lomos de prisioneros cristianos como trofeo. Almanzor murió en el **1002**, durante una campaña de regreso, en Medinaceli (algunas fuentes sitúan su muerte en Calatañazor); no debe confundirse esta fecha de su muerte con la del ataque a Santiago, ocurrido cinco años antes

### La Fitna y la Desintegración
Tras la muerte de Almanzor y de su hijo Abd al-Malik, el califato se sumió en un período de guerras civiles conocidas como la ***fitna*** (en árabe: "discordia").

En el **1031**, una asamblea de nobles cordobeses decretó oficialmente la **disolución del Califato**, fragmentándose Al-Ándalus en múltiples reinos menores llamados **Taifas**.

Este es el punto de inflexión más importante de la historia de Al-Ándalus: el fin del califato marca el inicio de la hegemonía cristiana en la Península.$mkd$ WHERE subject = 'historia_espana' AND sort_order = 15;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$## Los Primeros Reinos de Taifas (1031–1086)

La disolución del Califato dividió Al-Ándalus en más de una veintena de pequeños estados independientes llamados **Taifas** (Sevilla, Zaragoza, Toledo, Badajoz, Granada…).

**Características:**
- Inmensa riqueza económica y refinamiento cultural (mecenazgo artístico)
- Militarmente **muy débiles**: sin ejércitos suficientes para resistir
- Obligados a pagar **parias** (tributos anuales en oro) a los reyes cristianos del norte para comprar la paz
- En **1085**, Alfonso VI de Castilla conquistó **Toledo**: alarma total en el mundo islámico

## Los Almorávides (1086–1145)

Aterrorizados por la pérdida de Toledo, los reyes de las taifas pidieron auxilio a los **almorávides**: monjes-soldados bereberes del norte de África, caracterizados por un **islam rigorista y reformista**, de observancia religiosa muy estricta.

- Cruzaron el estrecho y derrotaron a Alfonso VI en la **Batalla de Sagrajas (1086)**
- Depusieron a los reyes de las taifas y **unificaron Al-Ándalus** bajo su dominio
- Su rigorismo religioso y el empuje cristiano → decadencia → *Segundos Reinos de Taifas*

## Los Almohades (1147–1224)

Sustituyeron a los almorávides, también con un proyecto de reforma religiosa rigorista. Lograron frenar temporalmente a los cristianos en la **Batalla de Alarcos (1195)**. Ante el peligro, el Papa proclamó una Cruzada: los reinos de Castilla, Aragón y Navarra se unieron de forma excepcional e infligieron una **derrota total** a los almohades en la **Batalla de las Navas de Tolosa (1212)**. El imperio almohade se desintegró.$mkd$ WHERE subject = 'historia_espana' AND sort_order = 16;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$## El Legado Cultural y Científico de Al-Ándalus

Córdoba se convirtió en el siglo X en uno de los grandes centros intelectuales de Occidente. Conviene evitar la simplificación de una "Europa cristiana sumida en el oscurantismo": la historiografía actual no acepta esa imagen para el conjunto de la Alta Edad Media europea (hubo focos culturales activos, como el propio renacimiento carolingio), aunque sí es cierto que Al-Ándalus, junto con Bizancio, fue en esos siglos uno de los polos de mayor producción y conservación del saber científico y filosófico del Mediterráneo.

### Transmisores del Conocimiento
Al-Ándalus cumplió un papel histórico relevante: **tradujo y transmitió a Europa** buena parte del legado filosófico de la Grecia clásica (Aristóteles, Platón, Galeno), en gran medida conservado y comentado previamente por el mundo islámico oriental, así como los conocimientos matemáticos de la India:
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
3. **La Alhambra** (Granada, ss. XIII-XIV): joya del arte nazarí$mkd$, worked_example_markdown = $mkd$**Pregunta tipo PAU:** *¿Cuál fue el legado cultural y científico de Al-Ándalus para la civilización europea?*

**Estructura (4 puntos):**
1. Papel de transmisión: ayudaron a recuperar y transmitir a Europa la obra de Aristóteles → contribuyó a la base de la filosofía escolástica
2. Matemáticas: números arábigos, cero, álgebra → aportación relevante para la ciencia europea
3. Científicos clave: Abulcasis (cirugía), Azarquiel (astronomía), **Averroes** (filosofía), Maimónides
4. Arte: Mezquita de Córdoba, Aljafería, **Alhambra** → los tres edificios que siempre hay que citar

**Matiz importante:** Al-Ándalus fue una vía relevante —no la única— de transmisión del saber clásico y oriental a Europa. Evita presentarlo como una condición sin la cual "el Renacimiento no habría existido": es una afirmación contrafactual que la historiografía actual no respalda.$mkd$ WHERE subject = 'historia_espana' AND sort_order = 20;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$## El Núcleo Astur-Leonés (Siglos VIII–X)

Nació en la cordillera Cantábrica, una zona montañosa de difícil acceso que los musulmanes nunca controlaron eficazmente.

### Origen: La Batalla de Covadonga (722)
El noble visigodo **Pelayo** lideró a los pobladores locales y derrotó a una expedición de castigo musulmana en la **Batalla de Covadonga (722)**. Este hecho mítico —probablemente una emboscada en un desfiladero más que una gran batalla— marca el inicio tradicional de la *Reconquista*.

Los historiadores debaten si fue una victoria real o un relato legendario, pero su importancia simbólica es indiscutible: los cronistas medievales lo convirtieron en el momento fundacional de la resistencia cristiana.

### Consolidación del Reino de Asturias
- **Alfonso I** expandió el territorio hacia el oeste y sur. La historiografía tradicional describe este proceso como la creación de un **"desierto estratégico"** en la cuenca del Duero, una franja deliberadamente despoblada entre el reino astur y Al-Ándalus. Investigaciones posteriores han matizado esta tesis: la despoblación fue probablemente menos radical y más gradual de lo que planteaba la interpretación clásica, con población remanente en distintas zonas
- **Alfonso II** construyó Oviedo como capital y descubrió —o promovió el descubrimiento de— la tumba del Apóstol **Santiago en Compostela**, dinamizando las peregrinaciones europeas

### El Traslado a León (914)
Con el avance de la ocupación hacia el valle del Duero, el rey **García I** trasladó la corte a **León**, pasando el estado a denominarse **Reino de León**. La capital se desplaza al sur a medida que avanza la repoblación.

### La Independencia de Castilla
La frontera oriental del reino, expuesta a las *razzias* musulmanas, se fortificó con castillos. Inicialmente gobernada por condes dependientes de León, el conde **Fernán González** (siglo X) logró la independencia de facto del **Condado de Castilla**, convertida en herencia de su familia.$mkd$, worked_example_markdown = $mkd$**Pregunta tipo PAU:** *¿Cómo surgió el núcleo de resistencia astur-leonés? ¿Qué importancia tuvo la batalla de Covadonga?*

**Estructura:**
1. Contexto geográfico: Cordillera Cantábrica como refugio inexpugnable
2. Covadonga (722): Pelayo → valor simbólico sobre el militar real
3. Consolidación: Alfonso I ("desierto estratégico", tesis matizada por la historiografía reciente), Alfonso II (Santiago de Compostela)
4. Traslado a León (914) → refleja avance hacia el sur
5. Fernán González: independencia del Condado de Castilla → precursor del futuro reino más poderoso

**Dato clave:** la tesis tradicional del *"desierto estratégico"* —despoblar la cuenca del Duero para crear tierra de nadie— se ha usado para explicar la lentitud inicial de la Reconquista, aunque la investigación reciente matiza el grado real de esa despoblación.$mkd$ WHERE subject = 'historia_espana' AND sort_order = 21;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$## Los Núcleos Pirenaicos y la Marca Hispánica

Surgieron al amparo del **Imperio Carolingio** (Carlomagno), que creó una franja fronteriza fortificada al sur de los Pirineos denominada **Marca Hispánica** para contener el avance islámico hacia Francia.

### El Núcleo Navarro (Reino de Pamplona)
La dinastía **Arista** expulsó a los gobernadores francos en el siglo IX, naciendo el **Reino de Pamplona** (luego Navarra). Vivió su máximo esplendor con **Sancho III el Mayor (1004-1035)**, que extendió su **hegemonía** sobre buena parte del norte cristiano. Su autoridad se ejerció de forma distinta según el territorio: gobernó Navarra de forma directa, ejerció una influencia decisiva sobre Castilla (de la que llegó a ser conde) y estableció vínculos de vasallaje y alianzas dinásticas con los condes catalanes y otros territorios pirenaicos, sin llegar a incorporarlos ni gobernarlos de forma directa como parte de un único Estado.

A su muerte, repartió sus dominios entre sus hijos como herencia **patrimonial** (como si fuera una finca privada), lo que fragmentó de nuevo el norte cristiano:
- Su hijo García heredó Navarra
- Fernando I heredó Castilla (y pronto también León)
- Ramiro I heredó Aragón

### El Núcleo Aragonés
Originado en los valles pirenaicos (ríos Aragón, Sobrarbe y Ribagorza) como condados tutelados por los francos. Tras la división de Sancho III, **Ramiro I** se convirtió en el **primer rey de Aragón (1035)**.

### Los Condados Catalanes
El conde **Wifredo el Velloso** unificó los condados de la Marca Hispánica oriental bajo la hegemonía de **Barcelona**, haciendo el cargo hereditario. En el siglo X, el conde **Borrell II** dejó de acudir a renovar el juramento de vasallaje al rey franco (tras no recibir ayuda militar frente a un ataque de Almanzor en 985); más que una "declaración formal de independencia", fue el punto culminante de un proceso gradual de ruptura de los vínculos de fidelidad con la monarquía franca, que en la práctica dejó a los condes catalanes actuando como poder soberano.$mkd$, worked_example_markdown = $mkd$**Pregunta tipo PAU:** *¿Qué fue la Marca Hispánica? Describe el origen de los reinos de Navarra, Aragón y los condados catalanes.*

**Estructura:**
1. Marca Hispánica: creación carolingia → franja defensiva anti-islámica
2. Navarra: Aristas → independencia de los francos en s. IX → Sancho III el Mayor (punto álgido de su hegemonía, no de un dominio político directo sobre todo el norte)
3. División de Sancho III: clave para entender la fragmentación del norte (Navarra, Castilla, Aragón)
4. Aragón: Ramiro I (1035) = primer rey
5. Cataluña: Wifredo el Velloso → hereditario; Borrell II → ruptura progresiva del vasallaje franco (no una declaración formal única)

**Sancho III el Mayor** es el personaje clave: extiende su hegemonía sobre el norte cristiano y luego reparte sus dominios como herencia patrimonial. Ese reparto explica siglos de rivalidad entre los reinos.$mkd$ WHERE subject = 'historia_espana' AND sort_order = 22;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$## Los Cuatro Modelos de Repoblación

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
- **Mecanismo:** El rey encomendó la defensa y colonización a las **Órdenes Militares** —principalmente Santiago, Calatrava y Alcántara en esta etapa; la orden de Montesa, activa después en tierras de la Corona de Aragón, no se fundó hasta 1317 (a partir del patrimonio templario), por lo que no participa en esta repoblación de la primera mitad del s. XIII—: monjes-soldados que actuaban como señores feudales
- **Resultado:** Inmensos **latifundios** orientados a la **ganadería ovina**

### D) Repoblación por Repartimiento (Segunda mitad S. XIII)
- **Zonas:** Valle del Guadalquivir, Murcia, Valencia, Baleares (ricas ciudades musulmanas)
- **Mecanismo:** Los bienes de las ciudades conquistadas se distribuían entre los participantes según su rango en los *Libros de Repartimiento*
- **Resultado:** Los nobles y la Iglesia recibieron grandes propiedades (**donadíos**), consolidando el **latifundismo** andaluz$mkd$, worked_example_markdown = $mkd$**Pregunta tipo PAU:** *Describe los modelos de repoblación de la Reconquista. ¿Por qué existe el problema del latifundismo en Andalucía?*

**Tabla resumen (memorizar):**

| Modelo | Época | Zona | Propiedad resultante |
|---|---|---|---|
| Presura | S. VIII-X | Valle del Duero | Pequeña/mediana |
| Fueros/Concejil | S. XI-XII | Tajo y Ebro | Mediana/comunal |
| Órdenes Militares | 1.ª mitad S. XIII | La Mancha, Extremadura | Latifundio ganadero |
| Repartimiento | 2.ª mitad S. XIII | Guadalquivir, Valencia | Latifundio nobiliario |

**Clave:** el repartimiento del siglo XIII es uno de los orígenes históricos principales del latifundismo andaluz (las tierras se entregaron a la nobleza y a la Iglesia por méritos militares), aunque no es su única causa: procesos posteriores, como las desamortizaciones del siglo XIX, también contribuyeron a consolidarlo.$mkd$ WHERE subject = 'historia_espana' AND sort_order = 24;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$## Modelos de Estado en la Baja Edad Media: Castilla y Aragón

Durante los siglos XIV y XV, las dos grandes potencias cristianas peninsulares estructuraron modelos políticos con lógicas muy distintas.

### La Corona de Castilla: Hacia el Fortalecimiento del Poder Regio

En Castilla, la Corona tendió a reforzar su poder frente a la nobleza y las Cortes, en un proceso gradual que no debe confundirse con el absolutismo pleno propio de la Edad Moderna posterior.

**Fundamento político:**
- El monarca reivindicaba un poder de **origen divino**, aunque en la práctica su autoridad estuvo condicionada por los grandes linajes nobiliarios durante buena parte del período
- Se unificó el derecho en todo el territorio mediante las **Partidas** de Alfonso X y el **Ordenamiento de Alcalá (1348)**, que dio prioridad al derecho regio sobre los derechos locales
- Las **Cortes de Castilla**: asambleas de los tres estamentos cuya función más visible fue **votar impuestos**, aunque también ejercieron funciones de petición y de intervención en asuntos legislativos (las peticiones aprobadas podían convertirse en ley)
- **Instituciones**: *Consejo Real* (asesoramiento), *Audiencia o Chancillería* (tribunal supremo), **Corregidores** (delegados del rey en los municipios)

---

### La Corona de Aragón: El Pactismo Político

A diferencia de Castilla, la Corona de Aragón era una **monarquía compuesta**: una unión dinástica de reinos y territorios (Aragón, Valencia, Principado de Cataluña, Reino de Mallorca) que compartían el mismo monarca pero conservaban leyes, instituciones y fronteras propias, sin fundirse en un único Estado. Se impuso el **pactismo**:

- El rey **no podía legislar ni imponer impuestos sin el consentimiento** de las Cortes de cada reino
- Cada reino tenía sus propias leyes, instituciones y fueros
- Existía la figura del **Justicia Mayor de Aragón**: magistrado que podía proteger a los ciudadanos frente a los abusos del rey
- Aragón, Cataluña y Valencia tenían cada uno sus propias **Cortes**, que se reunían por separado (a veces conjuntamente, como Cortes Generales). El Reino de Mallorca no tuvo Cortes propiamente dichas: su órgano representativo era el **Gran e General Consell**$mkd$, worked_example_markdown = $mkd$**Pregunta tipo PAU:** *Compara los modelos políticos de Castilla y Aragón en la Baja Edad Media.*

**Tabla comparativa (fundamental para PAU):**

| Aspecto | **Castilla** | **Aragón** |
|---|---|---|
| Sistema | Poder regio en ascenso frente a nobleza/Cortes | Pactismo político |
| Cortes | Sobre todo fiscales, con función de petición | Legislativas (consentimiento necesario) |
| Leyes | Ordenamiento de Alcalá (1348) | Fueros propios de cada reino |
| Estructura | Reino unificado | Monarquía compuesta (unión dinástica de reinos) |
| Institución clave | Corregidores | Justicia Mayor de Aragón |

Este contraste es esencial para entender la Unión de los Reyes Católicos (1469): no fue una unión política real sino solo dinástica, porque cada Corona mantuvo su propio sistema.$mkd$ WHERE subject = 'historia_espana' AND sort_order = 25;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$## Los Reyes Católicos: Unión Dinástica y Monarquía Autoritaria (1469–1516)

El matrimonio de Isabel de Castilla y Fernando de Aragón en 1469 puso las bases del Estado moderno en España, transformando las monarquías feudales en una sólida Monarquía Autoritaria.

### 1. La Unión Dinástica y la Guerra Civil Castellana

La boda secreta de Isabel y Fernando (1469) aceleró los conflictos sucesorios en Castilla. A la muerte de Enrique IV, estalló la **Guerra de Sucesión Castellana (1475–1479)** entre los partidarios de su hija, **Juana "la Beltraneja"** (apoyada por Portugal), y los de su hermana **Isabel I**. El conflicto terminó con la victoria isabelina tras la Batalla de Toro y la firma del **Tratado de Alcaçovas (1479)**, que reconoció a Isabel como reina de Castilla. Ese mismo año, Fernando II heredaba el trono de Aragón.

El modelo adoptado por la nueva monarquía fue el de la **Concordia de Segovia (1475)**: una **unión dinástica, no institucional**. Cada Corona conservó sus propias leyes, fronteras, monedas, aduanas, instituciones y Cortes. La Concordia estableció además cómo se repartía el poder dentro de Castilla: Isabel era la reina propietaria, pero Fernando obtuvo amplias facultades de cogobierno (podía actuar como rey consorte, refrendar documentos y gobernar en su nombre en campaña o ausencia), de forma que su papel en Castilla fue mucho más activo que el de un simple acompañante. El proyecto político común de ambos monarcas se resume popularmente en el lema *"tanto monta, monta tanto, Isabel como Fernando"*, aunque esta formulación exacta es una fórmula popular posterior: el lema histórico y heráldico de Fernando era solo *"tanto monta"* (alusivo al nudo gordiano de Alejandro Magno: "tanto monta cortarlo como desatarlo").

### 2. La Construcción del Estado Moderno (Monarquía Autoritaria)

Los Reyes Católicos recortaron los poderes políticos de la nobleza, el clero y las ciudades para someter a todos los estamentos bajo la autoridad real. Para ello construyeron un moderno aparato institucional:

- **La Santa Hermandad (1476):** Primer cuerpo policial del Estado, pagado por los municipios. Perseguía delitos en los caminos, pacificaba el campo y acababa con el bandolerismo nobiliario.
- **El Consejo Real de Castilla:** Se profesionalizó, sustituyendo a la vieja alta nobleza de sangre por juristas universitarios leales a la Corona. Se crearon consejos especializados (Aragón, Inquisición, Órdenes Militares).
- **Los Corregidores:** Delegados del rey generalizados en todos los municipios de Castilla para garantizar el cumplimiento de las órdenes reales.
- **El Ejército Profesional Permanente:** Se sustituyeron las huestes feudales por tropas mercenarias asalariadas. El **Gran Capitán** (Gonzalo Fernández de Córdoba) revolucionó la táctica de infantería.
- **El Control Eclesiástico:** Obtuvieron del Papa el **Derecho de Patronato Regio** (proponer los nombres de los obispos). Fernando se convirtió en Maestre perpetuo de las Órdenes Militares, absorbiendo sus enormes riquezas para la Corona.$mkd$, worked_example_markdown = $mkd$**Pregunta tipo PAU:** *¿En qué consistió la unión de las Coronas de Castilla y Aragón? ¿Fue una unión política real?*

**Respuesta modelo:**
1. Contexto: matrimonio secreto de 1469 → pero la unión formal llega con la Concordia de Segovia (1475) y el Tratado de Alcaçovas (1479)
2. Naturaleza de la unión: **dinástica, no institucional** — cada Corona mantiene leyes, fueros, monedas, instituciones propias
3. El lema popular "tanto monta, monta tanto, Isabel como Fernando" resume la idea de un proyecto compartido, aunque el lema histórico real de Fernando era solo "tanto monta" (nudo gordiano); la frase con Isabel es una formulación popular posterior
4. Reformas institucionales: Santa Hermandad → Consejo Real → Corregidores → Ejército profesional → control eclesiástico
5. Resultado: paso de las monarquías feudales medievales a la **Monarquía Autoritaria** moderna

**Clave:** La unión fue dinástica, no institucional: cada Corona conservó sus leyes e instituciones propias. Pero no la simplifiques como "Fernando no era rey de Castilla, ni Isabel de Aragón": la Concordia de Segovia dio a Fernando amplias facultades de cogobierno en Castilla (donde Isabel era la reina propietaria); en cambio, en Aragón, Isabel no tuvo derechos propios a la Corona, siendo Fernando el rey propietario. Esta asimetría explica que, a la muerte de Isabel (1504), Fernando siguiera gobernando Castilla como regente en nombre de su hija Juana, y por qué Carlos I heredó Castilla y Aragón como coronas jurídicamente distintas.$mkd$ WHERE subject = 'historia_espana' AND sort_order = 29;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$## La Política de Uniformidad Religiosa de los Reyes Católicos

Para cohesionar un territorio con leyes e instituciones tan diversas, los monarcas eligieron la **fe católica** como la única identidad común válida para todos sus súbditos, persiguiendo implacablemente la disidencia religiosa mediante tres grandes medidas:

### 1. El Tribunal de la Inquisición (1478)

Autorizado mediante la **bula pontificia *Exigit sinceræ devotionis* del papa Sixto IV (1478)**, a petición de los propios Reyes Católicos. Lo verdaderamente distintivo de la Inquisición española, frente a otras inquisiciones medievales de origen papal, no es su origen —que sí fue papal—, sino el **control regio** sobre su organización: los reyes nombraban al Inquisidor General y a los inquisidores, financiaban el tribunal y lo utilizaban como instrumento de gobierno, con escasa intervención efectiva de Roma en su funcionamiento cotidiano. Su objetivo inicial fue perseguir a los **conversos judaizantes** (judíos bautizados que seguían practicando el judaísmo en secreto). Dirigido por el dominico **Tomás de Torquemada** como primer Inquisidor General, se convirtió en un temible instrumento de control político y social, ya que su jurisdicción penal se imponía por encima de los fueros tradicionales de Castilla y Aragón. Fue una de las pocas instituciones que unificaban de hecho a ambas Coronas bajo una misma autoridad.

### 2. La Expulsión de los Judíos (1492)

Mediante el **Decreto de Granada (marzo de 1492)**, los reyes obligaron a todos los judíos de España a convertirse al catolicismo en un plazo de cuatro meses o abandonar definitivamente el país. Unos **100.000 judíos** eligieron el exilio, convirtiéndose en los **sefardíes** (que conservaron el español ladino durante siglos). Esto supuso una grave pérdida de médicos, intelectuales, artesanos y banqueros que sostenían la economía urbana.

### 3. La Conversión Forzosa de los Mudéjares (1502, solo en Castilla)

Tras la conquista de Granada (1492), se garantizaron inicialmente las libertades religiosas de la población musulmana. Sin embargo, la intolerancia del **Cardenal Cisneros** (arzobispo de Toledo) provocó violentas rebeliones en el Albaicín y las Alpujarras. Los reyes aprovecharon las revueltas para decretar, **en la Corona de Castilla, en 1502**, la expulsión de los musulmanes que se negasen a bautizarse, naciendo así los **moriscos** (cristianos nuevos de origen musulmán). En la **Corona de Aragón**, donde los mudéjares estaban protegidos por los señores nobiliarios que dependían de su mano de obra, la conversión forzosa no llegó hasta **1525-1526**, tras la revuelta de las Germanías, ya bajo Carlos V; no debe presentarse 1502 como una fecha común a toda la Monarquía. Los moriscos serían definitivamente expulsados en 1609.$mkd$, worked_example_markdown = $mkd$**Pregunta tipo PAU:** *¿Cuál fue la política religiosa de los Reyes Católicos? ¿Por qué se la denomina de "uniformidad religiosa"?*

**Estructura:**
1. Objetivo: la religión como único elemento de cohesión de dos Coronas muy distintas
2. **Inquisición (1478):** autorizada por bula del papa Sixto IV, pero con la organización y los nombramientos bajo control directo de los reyes → instrumento de control político-religioso
3. **Expulsión judíos (1492):** Decreto de Granada → sefardíes en exilio → pérdida económica e intelectual
4. **Conversión mudéjares (1502, solo Castilla):** Cisneros provoca revueltas → expulsión o bautismo → moriscos. En la Corona de Aragón, la conversión forzosa no llega hasta 1525-1526
5. Resultado: España nominalmente católica al 100%, pero creación de problema *converso* que duraría siglos

**Cronología clave:**
- 1478: bula de Sixto IV → Inquisición española
- 1492 enero: Caída de Granada
- 1492 marzo: Decreto de expulsión judíos
- 1502: Conversión forzosa mudéjares (Corona de Castilla)
- 1525-1526: Conversión forzosa mudéjares (Corona de Aragón)
- 1609: Expulsión de los moriscos (Felipe III)$mkd$, practice_prompt = $mkd$Describe la política de uniformidad religiosa de los Reyes Católicos. ¿Qué fue el Tribunal de la Inquisición, quién lo autorizó mediante bula papal en 1478 y en qué sentido quedó bajo el control de los reyes más que otras inquisiciones medievales? ¿Qué consecuencias tuvo la expulsión de los judíos en 1492?$mkd$, alert_markdown = $mkd$⚠️ La Inquisición española fue autorizada por bula del papa Sixto IV (1478), pero su organización y sus nombramientos quedaron bajo el control directo de los REYES — eso la distinguía de otras inquisiciones medievales y la convertía en la única institución con jurisdicción en AMBAS Coronas.$mkd$ WHERE subject = 'historia_espana' AND sort_order = 30;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$## El Descubrimiento de América y el Tratado de Tordesillas (1494)

### 1. El Contexto: La Necesidad de una Nueva Ruta hacia Asia

A finales del siglo XV, Portugal monopolizaba las rutas comerciales hacia las Indias (especias, seda, oro) bordeando el continente africano. Castilla necesitaba urgentemente una ruta alternativa para no quedarse fuera del comercio asiático.

El marinero genovés **Cristóbal Colón** propuso llegar a Asia navegando hacia el oeste por el Atlántico, basándose en el cálculo (erróneo) de que la circunferencia de la Tierra era mucho menor de lo que era. Tras ser rechazado por Portugal, la reina **Isabel I** de Castilla financió el proyecto mediante las **Capitulaciones de Santa Fe (1492)**, que otorgaban a Colón el título de *Almirante del Mar Océano*, el cargo de virrey de las tierras descubiertas y el 10% de todas las riquezas obtenidas.

### 2. El Viaje y el Descubrimiento

Colón partió del **Puerto de Palos (Huelva)** el 3 de agosto de 1492 al mando de tres naves: la *Niña* y la *Pinta*, que eran **carabelas**, y la *Santa María*, la nave capitana, que en realidad era una **nao** (de mayor porte, no una carabela), pese a la extendida expresión popular de "las tres carabelas". Tras 70 días de navegación, avistaron tierra el **12 de octubre de 1492**: la isla de **Guanahaní** (San Salvador, en las Bahamas). Colón murió convencido de que había llegado a Asia —fueron Américo Vespucio y otros exploradores quienes comprendieron que se trataba de un **Nuevo Mundo** desconocido para los europeos.

### 3. El Tratado de Tordesillas (1494)

El éxito del primer viaje de Colón desató un conflicto diplomático inmediato con Portugal. El Papa **Alejandro VI** dictó la Bula Inter Caetera, que asignaba a Castilla los territorios al oeste de un meridiano. Insatisfecho, el rey portugués negoció directamente con los Reyes Católicos, llegando al **Tratado de Tordesillas (1494)**:

- Se trazó una línea imaginaria a **370 leguas al oeste** de las islas de Cabo Verde
- Todo lo que estuviera al **oeste** de esa línea sería de Castilla (América)
- Todo lo que estuviera al **este** sería de Portugal (África, India y Brasil)

Este tratado explica por qué Brasil habla portugués hoy.$mkd$ WHERE subject = 'historia_espana' AND sort_order = 32;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$## Carlos I de España y V de Alemania: La Inmensa Herencia Territorial

Carlos de Habsburgo inauguró en la Península la dinastía de la **Casa de Austria (los Habsburgo)**, concentrando una de las herencias territoriales más inmensas de la historia universal en una sola persona.

### La Herencia Cuádruple

Carlos de Habsburgo recibió de sus cuatro abuelos:
- **De su abuela Isabel I (Castilla):** Corona de Castilla, Navarra, Canarias y América
- **De su abuelo Fernando II (Aragón):** Corona de Aragón, Nápoles, Sicilia y Cerdeña
- **De su abuela María de Borgoña:** el **Franco Condado** y los **Países Bajos** (territorios más ricos y poblados de Europa)
- **De su abuelo Maximiliano I (Habsburgo):** las posesiones austriacas y la candidatura al trono imperial

Carlos llegó a España en 1517 sin hablar castellano y rodeado de consejeros flamencos, lo que provocó un rechazo inmediato.

En **1519**, a la muerte de su abuelo Maximiliano I, Carlos fue elegido **rey de romanos** (soberano electo del Sacro Imperio Romano Germánico, título que llevaba aparejado el de Carlos V) por los príncipes electores alemanes, tras una costosísima campaña de sobornos financiada con préstamos de banqueros como los Fugger. En **1520** viajó a Alemania y fue coronado en Aquisgrán; la coronación imperial solemne por el Papa (Clemente VII) no llegaría hasta **1530**, en Bolonia. Con su elección de 1519 asumía la defensa de la *Universitas Christiana* (la unidad espiritual de Europa bajo el catolicismo), lo que lo convertía en el monarca más poderoso de la Cristiandad.

### Un Imperio con Pies de Barro

Pese a su extensión sin precedentes, el Imperio tenía una grave contradicción: no era un Estado centralizado, sino una unión dinástica de territorios muy distintos, con leyes propias, idiomas diferentes y intereses contrapuestos. La energía y el dinero que tenía que dedicar a mantenerlo unidos agotaron sus recursos.$mkd$ WHERE subject = 'historia_espana' AND sort_order = 33;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$## La Revuelta de las Comunidades de Castilla (1520–1521)

Las Comunidades fueron la primera gran revuelta interna de la monarquía de los Habsburgo y uno de los temas más preguntados en PAU sobre el siglo XVI.

### Causas

Carlos I llegó a España en 1517 sin hablar castellano y entregó los principales cargos del gobierno a sus consejeros flamencos. Elegido rey de romanos en 1519, convocó en 1520 las Cortes de Santiago y La Coruña para financiar su viaje a Alemania y su coronación, exigiendo cuantiosos impuestos extraordinarios.

Esto desató la indignación de las ciudades castellanas por tres razones:
- **Política:** Gobierno de extranjeros y ausencia del rey
- **Económica:** Oposición a exportar lana bruta en beneficio de la industria textil flamenca
- **Constitucional:** Defensa de los derechos de las Cortes frente al fortalecimiento del poder real

### El Conflicto

Las principales ciudades manufactureras de la Meseta (Segovia, Toledo, Burgos, Salamanca) formaron la **Santa Junta**, liderada por los comuneros **Juan de Padilla, Juan Bravo y Francisco Maldonado**. La revuelta comenzó siendo una protesta política y fue derivando hacia un conflicto social antiseñorial.

### El Desenlace: Villalar (23 de abril de 1521)

La alta nobleza, inicialmente neutral, apoyó decididamente al rey cuando la revuelta adquirió tintes antiseñoriales. Los comuneros fueron aplastados en la **Batalla de Villalar (23 de abril de 1521)** y sus tres líderes ejecutados al día siguiente. Esta derrota reforzó de forma importante la autoridad de la Corona frente a las ciudades castellanas y debilitó el papel político de las Cortes, aunque no supuso la instauración inmediata de un absolutismo pleno ni la desaparición de las Cortes de Castilla, que siguieron reuniéndose —con menor capacidad real de condicionar al rey— durante todo el siglo XVI.$mkd$, worked_example_markdown = $mkd$**Pregunta tipo PAU:** *¿Qué fueron las Comunidades de Castilla? ¿Cuáles fueron sus causas y consecuencias?*

**Estructura:**
1. Causas: consejeros flamencos + impuestos para el viaje y coronación imperial + exportación de lana → tres dimensiones (política, económica, constitucional)
2. Protagonistas: burguesía urbana (no nobleza) de las ciudades manufactureras de la Meseta
3. Organización: Santa Junta → líderes Padilla, Bravo, Maldonado
4. Punto de inflexión: la revuelta se vuelve antiseñorial → nobleza cambia de bando → apoya al rey
5. Desenlace: Villalar (23 abril 1521) → derrota total → ejecución de los líderes
6. Consecuencias: refuerzo importante de la autoridad regia en Castilla → las Cortes pierden peso político real, aunque no desaparecen ni se instaura de inmediato un absolutismo pleno

**Dato PAU:** Villalar (23 de abril de 1521) es el Día de Castilla y León. Fecha exacta obligatoria.$mkd$ WHERE subject = 'historia_espana' AND sort_order = 34;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$## Los Tres Frentes de la Política Exterior de Carlos V

La defensa de la hegemonía europea y del catolicismo universal arrastró a Carlos V a guerras permanentes financiadas con el oro americano y los impuestos de Castilla.

### Frente 1: El Conflicto con Francia

Rivalidad constante con el rey **Francisco I** por el control de los territorios italianos (especialmente el Milanesado, llave del control de Italia). El enfrentamiento culminó en la **Batalla de Pavía (1525)**, donde el ejército imperial capturó al mismísimo rey de Francia. Pese a la victoria, el conflicto nunca se cerró definitivamente y las guerras con Francia continuaron durante todo el siglo XVI.

### Frente 2: El Imperio Otomano

Carlos asumió la defensa de la Cristiandad mediterránea frente a la expansión del **Imperio Otomano de Solimán el Magnífico** y la piratería berberisca del corsario **Barbarroja** en el norte de África. Carlos V tomó **Túnez (1535)** pero fracasó estrepitosamente en la jornada de **Argel (1541)**, siendo derrotado por las tormentas.

### Frente 3: La Reforma Protestante en Alemania

El fraile agustino **Martín Lutero** inició en 1517 la Reforma protestante, cuestionando la autoridad del Papa. Los príncipes alemanes adoptaron el luteranismo para independizarse de la autoridad imperial y quedarse con los bienes de la Iglesia. Carlos V ganó militarmente en la **Batalla de Mühlberg (1547)** contra la Liga de Esmalcalda, pero no pudo frenar la expansión del protestantismo. Agotado y sin dinero, firmó la **Paz de Augsburgo (1555)**, que reconocía a cada príncipe alemán el derecho a elegir, para su territorio, entre el **catolicismo** y el **luteranismo** (*cuius regio, eius religio*: la confesión del príncipe determina la del territorio). El acuerdo no reconocía la libertad religiosa individual de los súbditos —que en principio debían acomodarse a la confesión de su príncipe o emigrar— ni incluía al calvinismo, que quedó fuera del pacto.

En **1556**, Carlos V abdicó en Bruselas, dividiendo su herencia: el Sacro Imperio para su hermano **Fernando** y los reinos hispánicos, Países Bajos e Italia para su hijo **Felipe II**. Se retiró al Monasterio de Yuste (Cáceres), donde murió en 1558.$mkd$ WHERE subject = 'historia_espana' AND sort_order = 36;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$## Felipe II: El Rey Burócrata y el Estado Moderno (1556–1598)

Felipe II representó un modelo de gobierno distinto al de su padre Carlos V. Mientras Carlos recorría continuamente sus territorios, Felipe II fue un **rey sedentario** que gobernó su inmenso Imperio desde una capital fija. Aun así, esta fijación de la capital en Madrid no equivale a una centralización de tipo moderno: la Monarquía Hispánica siguió siendo una **monarquía compuesta**, territorialmente plural, en la que cada reino conservaba sus propias leyes, instituciones y fueros.

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

Felipe II se convirtió en el principal defensor del catolicismo contra el protestantismo, aplicando una política de aislamiento cultural: prohibió estudiar en universidades extranjeras y reforzó la censura de libros a través del **Índice de la Inquisición**.$mkd$ WHERE subject = 'historia_espana' AND sort_order = 37;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$## Los Conflictos Internos del Reinado de Felipe II

### 1. La Rebelión de las Alpujarras (1568–1571)

Los **moriscos** (descendientes de los musulmanes bautizados por la fuerza en 1502, en la Corona de Castilla) de Granada habían mantenido sus costumbres, lengua y vestimentas a pesar de la conversión nominal al catolicismo. En 1567, Felipe II promulgó una **Pragmática** que les prohibía expresamente:
- Usar la **lengua árabe**, hablada y escrita (nótese que esto no es lo mismo que el **aljamiado**: el aljamiado no es lengua árabe, sino textos en **lengua romance** —el castellano o aragonés hablado por muchos moriscos— transcritos con **caracteres árabes**; fue también un género perseguido y clandestino entre los moriscos)
- Usar sus vestimentas tradicionales
- Celebrar sus ceremonias y costumbres islámicas

Los moriscos del reino de Granada se levantaron en armas, refugiándose en las Alpujarras. El ejército real, dirigido por **Don Juan de Austria** (hermanastro del rey), sofocó la revuelta con extrema dureza. Felipe II ordenó la **dispersión forzosa de unos 80.000 moriscos** por el interior de Castilla, repoblando el territorio de Granada con colonos cristianos del norte.

### 2. Las Alteraciones de Aragón y el Caso Antonio Pérez (1591)

El **secretario real Antonio Pérez** fue acusado de ordenar el asesinato del secretario Juan de Escobedo (agente de Don Juan de Austria) presuntamente siguiendo órdenes del propio rey. Encarcelado, escapó a Aragón, donde los Fueros le protegían de la justicia real de Castilla.

Felipe II utilizó hábilmente al **Tribunal de la Inquisición** (única institución con jurisdicción en toda la monarquía, incluyendo Aragón) para intentar detenerle. Antonio Pérez instigó una **revuelta popular en Zaragoza** alegando que el rey violaba los Fueros de Aragón. Felipe II envió el ejército, ejecutó al **Justicia Mayor de Aragón** (Juan de Lanuza, el guardián de los fueros) y recortó los privilegios del reino en las **Cortes de Tarazona (1592)**, reforzando el poder real en Aragón.$mkd$ WHERE subject = 'historia_espana' AND sort_order = 38;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$## Cómo es el examen de Madrid

**90 minutos.** Se te ofrecen **dos textos** y eliges uno: **todas** las preguntas del bloque 1 se responden sobre el texto elegido.

| Bloque | Qué se pregunta | Puntos |
|---|---|---|
| **1. Comunicación** | Comentario + resumen + argumentación | **4** |
| **2. Reflexión sobre la lengua** | Una de 1,4 + dos de 0,8 | **3** |
| **3. Educación literaria** | Una de 2 + una de 1 | **3** |

## El desglose exacto

**Bloque 1 (4 puntos)**
- **1.1 (2 pts):** comentario de texto en tres partes:
  - a) **tema** del texto — *0,5*
  - b) **características lingüísticas y estilísticas** — *1,3*
  - c) **tipo de texto** — *0,2*
- **1.2 (0,6 pts):** resumen de **40-50 palabras**
- **1.3 (1,4 pts):** texto argumentativo de **100-150 palabras**

**Bloque 2 (3 puntos)**
- Una pregunta de **1,4** a elegir entre 2.1 (análisis sintáctico) o 2.2 (reflexión lingüística)
- **Dos** preguntas de **0,8** a elegir entre 2.3, 2.4 y 2.5 (morfología, semántica, variedades)

**Bloque 3 (3 puntos)**
- Una de **2 puntos**: tema de literatura o comentario de un fragmento
- Una de **1 punto**: la obra leída (1875-1936 o 1937-1974)

## La penalización por ortografía

Esto no es un detalle menor: los criterios oficiales de corrección de la Comisión Organizadora de la PAU de Madrid (vigentes también para 2026) lo fijan por escrito, y para Lengua Castellana y Literatura II son distintos de los del resto de asignaturas:

- La **primera falta de ortografía** no se penaliza.
- Si la **misma falta se repite**, cuenta **una sola vez**.
- **A partir de la segunda falta distinta**: **−0,25** puntos cada una.
- **Máximo descontable por ortografía: 2 puntos** — y ese es también el **máximo global** de deducción por corrección idiomática.
- Aparte, por errores de **redacción, presentación, coherencia, cohesión, léxico o gramática** se puede descontar hasta **1 punto adicional**, siempre respetando ese máximo global de 2 puntos.

Con este criterio, **nueve faltas distintas** ya te cuestan los **2 puntos** completos (la primera no penaliza; las ocho siguientes, a 0,25 cada una, ya suman 2): más que la pregunta de literatura entera.

## Dónde están los puntos de verdad

La pregunta **1.1.b vale 1,3 puntos**: es la mejor pagada de todo el examen, por encima de cualquier tema de literatura si se mide por lo que cuesta responderla. Y el bloque de sintaxis (2.1, con la alternativa de 2.2) vale 1,4 puntos y aparece, en alguna de sus variantes, en **57 ocasiones** a lo largo de los **45 exámenes oficiales** de Madrid analizados (varios exámenes ofrecen la opción de sintaxis más de una vez, entre convocatorias y opciones A/B). Son las dos preguntas que deciden la nota.

## Reparto del tiempo

| Fase | Tiempo | Por qué |
|---|---|---|
| Leer los dos textos y elegir | 8 min | Elegir mal cuesta más que esos 8 minutos |
| Bloque 1 completo | 35 min | Es el que más vale |
| Bloque 2 | 20 min | La sintaxis es rápida si la llevas practicada |
| Bloque 3 | 22 min | Los temas van memorizados |
| Repasar ortografía | 5 min | Recupera hasta 2 puntos |

## Cómo elegir el texto

**No elijas por el tema que te resulte más simpático.** Elige aquel del que **sepas decir más cosas de lengua**: el que tenga marcas claras de subjetividad, figuras retóricas visibles, estructura reconocible y conectores localizables.

La pregunta 1.1.b se responde **sobre el texto**, no sobre tus opiniones. Un texto sobre un asunto que te interesa poco pero lleno de recursos comentables te dará mejor nota que uno apasionante y plano.$mkd$, alert_markdown = $mkd$⚠️ La ortografía puede costarte hasta 2 puntos, tanto como el tema de literatura entero. La primera falta no penaliza; a partir de la segunda, cada falta distinta resta 0,25 puntos. Reservar 5 minutos finales solo para releer buscando tildes es la inversión más rentable del examen.$mkd$ WHERE subject = 'lengua' AND sort_order = 1;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$## Qué es el tema

El **tema** es la **idea central del texto condensada en un enunciado breve**, formulado con objetividad y en tercera persona. Responde a la pregunta *"¿de qué trata este texto, en esencia?"*.

No es el asunto (*"la tecnología"*), sino el asunto **más el enfoque del autor** (*"crítica de la adopción acrítica de la tecnología"*).

## Los cuatro requisitos (estrategia Kairo para asegurar los 0,5 puntos)

El criterio oficial solo dice que el tema debe enunciarse "de manera concisa, en una o dos líneas de extensión como máximo". Estos cuatro requisitos son la forma más fiable de cumplirlo sin dejarte nada:

**1. Breve.** Una línea, dos como máximo. Si necesitas tres, estás resumiendo.

**2. Abstracto.** Sin ejemplos, sin nombres propios, sin cifras, sin anécdotas concretas del texto. Todo eso va en el resumen, no en el tema.

**3. Objetivo.** Tercera persona, sin valoraciones propias. Es buena práctica evitar además las **fórmulas metatextuales** (*"el texto trata de"*, *"el autor habla de"*, *"en este artículo se dice"*): el criterio oficial no las prohíbe expresamente, pero suelen alargar el enunciado y restarle la concisión que sí exige la rúbrica.

**4. Completo.** Debe recoger el **enfoque o la actitud** del autor. Si el texto critica, el tema debe dejar claro que critica.

## Cómo se construye: la fórmula

La estructura más segura es:

> **[Sustantivo abstracto] + de/sobre + [asunto delimitado]**

Los sustantivos abstractos que más funcionan, según lo que hace el autor:

| Si el autor… | Empieza por… |
|---|---|
| Ataca o censura | **Crítica de…**, **Denuncia de…**, **Censura de…** |
| Defiende o apoya | **Defensa de…**, **Elogio de…**, **Reivindicación de…** |
| Piensa sin tomar partido claro | **Reflexión sobre…**, **Meditación acerca de…** |
| Analiza | **Análisis de…**, **Examen de…** |
| Advierte | **Advertencia sobre…**, **Alerta ante…** |
| Contrasta dos cosas | **Contraste entre… y…**, **Oposición entre…** |

## El método en tres pasos

**1. Localiza la tesis.** Es la frase donde el autor condensa su postura. Suele estar al principio (estructura deductiva) o al final (inductiva).

**2. Despójala de lo concreto.** Quita nombres, cifras, ejemplos. Quédate con la idea.

**3. Añade el enfoque.** Pregúntate: ¿el autor está a favor, en contra, o solo reflexiona? Elige el sustantivo abstracto que corresponda.

## Tema, tesis y resumen: las tres cosas se confunden

| | Qué es | Extensión |
|---|---|---|
| **Tema** | De **qué** trata, en abstracto | Una frase nominal |
| **Tesis** | La **postura concreta** del autor, a menudo literal en el texto | Una oración |
| **Resumen** | **Qué dice**, siguiendo el hilo | 40-50 palabras |

Ejemplo sobre el mismo texto:
- **Tema:** *Crítica del uso acrítico de la innovación tecnológica.*
- **Tesis:** *Adoptamos las innovaciones antes de entender sus consecuencias.*
- **Resumen:** *(las 40-50 palabras que recorren el texto entero)*$mkd$, worked_example_markdown = $mkd$## Ejemplo guiado 1: texto de Laura G. de Rivera (modelo PAU 2026)

**El texto:** critica que la palabra "disruptivo" se use como elogio cuando significa "rotura brusca", pone el ejemplo del lema de Zuckerberg "muévete rápido y rompe cosas", cita un estudio de Cisco y concluye que adoptamos la IA sin entender sus efectos.

### Tres formulaciones y por qué solo una vale

**❌ Formulación 1 — insuficiente**
> *El texto habla de la tecnología y de Mark Zuckerberg.*

**Tres errores:** empieza con una fórmula metatextual (*"el texto habla de"*) que resta concisión; nombra un **ejemplo concreto** (Zuckerberg); y **no recoge el enfoque** — no dice que el autor critique nada.

**❌ Formulación 2 — insuficiente (es un resumen, no un tema)**
> *La palabra "disruptivo" significa rotura brusca según la RAE, pero se usa como sinónimo de innovación, y eso es un problema porque las empresas tecnológicas sacan productos sin evaluar riesgos.*

**Error:** esto es un **resumen**, no un tema. Es demasiado largo y sigue el hilo del texto en vez de condensarlo. Además incluye elementos concretos (la RAE).

**✅ Formulación 3 — la que persigue los 0,5 puntos**
> *Crítica del uso acrítico del término "disruptivo" y de la adopción precipitada de las innovaciones tecnológicas sin valorar sus consecuencias sociales y humanas.*

**Por qué funciona:**
- Empieza por **sustantivo abstracto** ("crítica") que recoge el **enfoque**.
- Es **breve** (una línea larga).
- **No hay ejemplos** concretos: ni Zuckerberg, ni Cisco, ni cifras.
- Recoge las **dos partes** del texto: el uso del término *y* el fenómeno de fondo.

## Ejemplo guiado 2: texto de Juan Soto Ivars (modelo PAU 2026)

**El texto:** el autor renuncia a una comida con amigos por estar con su familia; a partir de esa anécdota reflexiona sobre las entrevistas a gente famosa que se siente incompleta, y concluye que la ideología dominante de la autorrealización oculta que "a todos nos han construido otros".

**❌ Mal:** *El autor cuenta que renunció a una comida con sus amigos para estar con su mujer y sus hijos.*
→ Es la **anécdota**, no el tema. Confunde el punto de partida con la idea central.

**✅ Bien:** *Reflexión crítica sobre la ideología contemporánea de la autorrealización individual y sobre el valor de la renuncia en la construcción de la identidad personal.*

**Fíjate en el método:** la anécdota de la comida es solo el **vehículo**. El tema está en la **generalización** a la que llega el autor al final. En textos de estructura **inductiva** como este, el tema casi siempre está en el último párrafo.

## Truco de comprobación

Léele tu tema a alguien que **no haya leído el texto**. Si te pregunta *"¿y qué dice el autor sobre eso?"*, te ha faltado el **enfoque**. Si te pregunta *"¿quién es Zuckerberg?"*, te ha sobrado lo **concreto**.$mkd$ WHERE subject = 'lengua' AND sort_order = 2;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$## Qué te piden

Reproducir el **contenido esencial** del texto respetando su **orden** y su **lógica argumental**, en **40-50 palabras**. La extensión está fijada por escrito en el enunciado: es criterio de corrección.

## Las cinco reglas

El criterio oficial exige que el resumen sea **objetivo**, recoja las **ideas principales con coherencia interna**, esté **redactado con las palabras del estudiante** y **no sea una paráfrasis**. A partir de ahí, esta es la manera más segura de cumplirlo (estrategia Kairo recomendada):

**1. Objetividad.**
La forma más segura de lograrla es la **tercera persona**, evitando *"el autor dice que…"*, *"en mi opinión"*, *"me parece que"*. El resumen debe poder leerse como si fuera el propio texto en pequeño.

**2. No copies frases literales.**
Hay que **reformular con tus palabras**: es el propio criterio oficial ("no será una paráfrasis"). Copiar y pegar fragmentos es de lo que más penaliza, porque no demuestra comprensión.

**3. Fuera lo accesorio.**
Se eliminan: **ejemplos**, **cifras**, **nombres propios**, **citas de apoyo**, **repeticiones** y **digresiones**. Se queda el **esqueleto argumental**.

**4. Mantén el hilo (estrategia recomendada).**
Si el texto va de A a B a C, lo más seguro es que el resumen también: reordenar o empezar por la conclusión no está prohibido en el enunciado, pero es más fácil perder la "coherencia interna" que pide el criterio oficial si rompes el orden del original.

**5. Que suene a texto, no a lista.**
Enlaza las ideas con conectores. Tres frases sueltas yuxtapuestas puntúan menos que un párrafo cohesionado.

## El método en cuatro pasos

**1. Subraya una idea por párrafo.** La principal, no la que más te guste.

**2. Escribe cada idea en una frase corta,** con tus palabras.

**3. Enlázalas** con conectores (*además*, *sin embargo*, *por tanto*, *en consecuencia*).

**4. Cuenta las palabras.** Literalmente, una a una. Y ajusta.

## Cómo ajustar la extensión

**Si te pasas de 50:**
- Sustituye una enumeración por su **hiperónimo** (*"vid, olivo y trigo"* → *"cultivos mediterráneos"*).
- Elimina adjetivos no imprescindibles.
- Convierte una oración subordinada en un sintagma (*"que no comprenden sus efectos"* → *"sin comprender sus efectos"*).

**Si no llegas a 40:**
- Te has dejado un párrafo. Vuelve al texto.
- No rellenes con paja: **añade contenido real**, no palabras vacías.

## Qué se cuenta como palabra

Todo lo separado por espacios, **incluidos artículos, preposiciones y conjunciones**. *"El"*, *"de"* y *"y"* cuentan igual que *"tecnología"*.$mkd$ WHERE subject = 'lengua' AND sort_order = 3;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$## Las cinco modalidades textuales

| Modalidad | Finalidad | Marcas lingüísticas |
|---|---|---|
| **Narrativa** | Contar hechos en el tiempo | Verbos **perfectivos** (pret. perfecto simple), marcadores temporales, 3ª persona, predominio de verbos |
| **Descriptiva** | Decir cómo es algo | **Adjetivos** abundantes, verbos de estado, presente e **imperfecto**, enumeraciones |
| **Expositiva** | Explicar, informar | **Objetividad**, 3ª persona, tecnicismos, orden lógico, conectores explicativos |
| **Argumentativa** | Convencer | **Tesis**, conectores causales y contraargumentativos, 1ª persona, léxico valorativo |
| **Dialógica** | Reproducir voces | Guiones, vocativos, interrogaciones, **deixis**, marcadores conversacionales |

## Lo importante: los textos casi nunca son puros

Un artículo de opinión es **argumentativo**, pero contiene **secuencias expositivas** (cuando explica un dato), **narrativas** (cuando cuenta una anécdota) y a veces **descriptivas**. Decirlo demuestra que has leído bien.

## Los ámbitos de uso

No basta con la modalidad. Hay que situar el texto en su **ámbito**:

| Ámbito | Rasgos | Géneros |
|---|---|---|
| **Periodístico** | Actualidad, público amplio, claridad | Noticia, reportaje, editorial, columna, artículo |
| **Literario** | Función poética, ficción, elaboración formal | Novela, poema, teatro, ensayo literario |
| **Científico-técnico** | Objetividad, tecnicismos, precisión | Artículo científico, manual, prospecto |
| **Jurídico-administrativo** | Fórmulas fijas, arcaísmos, impersonalidad | Ley, instancia, sentencia, contrato |
| **Humanístico** | Reflexión, subjetividad razonada | Ensayo filosófico, crítica |
| **Publicitario** | Función apelativa, brevedad, juegos verbales | Anuncio, eslogan |

## Lo que exige el criterio oficial — y lo que suma aparte

El enunciado real de esta pregunta (0,2 puntos) pide: *"indicará el tipo de texto y el género discursivo al que corresponde el fragmento propuesto"*. Es decir, el mínimo exigible son **dos cosas**: modalidad/tipo y género.

**Estrategia Kairo recomendada — respuesta enriquecida:** añadir el **ámbito** y las **funciones predominantes** no es obligatorio según ese enunciado, pero, al ser una respuesta breve y muy rentable, conviene dar el máximo de información posible:

> **modalidad + ámbito + género + funciones predominantes**

Modelo aplicable a casi cualquier texto de la PAU de Madrid:

> *Texto **argumentativo** con secuencias **expositivas**, del ámbito **periodístico**, género **artículo de opinión**, con predominio de las funciones **apelativa** y **expresiva**.*

## Por qué no debes dejarla en blanco nunca

Vale **0,2 puntos** y se responde en **treinta segundos** si llevas la fórmula memorizada. Es, en relación esfuerzo/nota, la pregunta más rentable del examen entero.

## Cómo distinguir expositivo de argumentativo

Es la duda más frecuente. La clave está en la **intención**:

- **Expositivo:** informa sobre algo que se presenta como **hecho**. No busca que cambies de opinión. *"El 91 % de los equipos usa IA generativa."*
- **Argumentativo:** defiende una **postura** discutible. Hay tesis y hay argumentos. *"Adoptamos la IA demasiado deprisa."*

Prueba: **¿se podría estar en desacuerdo con lo que dice?** Si sí, es argumentativo.$mkd$, worked_example_markdown = $mkd$## Ejemplo guiado: los tres niveles de respuesta

**Texto:** el artículo de Juan Soto Ivars sobre la renuncia (modelo PAU 2026), publicado en *El Confidencial* y firmado, que parte de una anécdota personal para criticar la ideología de la autorrealización.

**Respuesta insuficiente**
> *Es un texto argumentativo.*

Correcto pero incompleto: aunque el criterio oficial solo exige tipo de texto y género, aquí falta el género, así que ni siquiera cubre el mínimo exigible.

**Respuesta parcial — cubre el mínimo oficial**
> *Es un texto argumentativo del ámbito periodístico.*

Da modalidad y ámbito, pero el enunciado pide expresamente el **género discursivo**, que aquí falta.

**Respuesta completa — enriquecida más allá del mínimo**
> *Se trata de un texto **argumentativo**, con secuencias **narrativas** en el planteamiento inicial —la anécdota de la comida a la que el autor renuncia— y **expositivas** al describir el fenómeno de las entrevistas. Pertenece al **ámbito periodístico**, concretamente al género del **artículo de opinión**, como acreditan la firma del autor, la indicación del medio (*El Confidencial*) y la fecha. Predominan la **función apelativa**, pues busca modificar la actitud del lector ante la idea de renuncia, y la **expresiva**, manifiesta en la primera persona y en las valoraciones del autor.*

## Por qué esta versión es la más completa

1. Da la **modalidad principal** *y* reconoce las **secuencias** de otras modalidades, con ejemplo de cada una.
2. Da el **género**, que es lo que exige el enunciado oficial junto con el tipo de texto.
3. **Justifica** el género con tres marcas objetivas (firma, medio, fecha).
4. Añade **ámbito** y **funciones** como aportación extra (estrategia Kairo de respuesta enriquecida, no exigencia del enunciado).

Todo eso ocupa cinco líneas y se escribe en un minuto largo.

## Aplicación a otros tipos de texto

**Un prospecto de medicamento:**
> *Texto **expositivo-instructivo**, del ámbito **científico-técnico**, género **prospecto**. Predomina la función **representativa** (informa de la composición) junto a la **apelativa** en las instrucciones de uso, formuladas con imperativos e infinitivos.*

**Un fragmento de novela con diálogo:**
> *Texto **narrativo** con amplias secuencias **dialógicas** y **descriptivas**, del ámbito **literario**, género **novela**. Predomina la función **poética**, por el cuidado de la forma, junto a la **representativa** en las secuencias narrativas.*

**Un editorial de periódico:**
> *Texto **argumentativo** del ámbito **periodístico**, género **editorial**, como prueba la **ausencia de firma**: expresa la postura institucional del medio. Predomina la función **apelativa**, con uso de la primera persona del plural de carácter corporativo.*$mkd$, alert_markdown = $mkd$⚠️ Es la pregunta más barata del examen: 0,2 puntos en treinta segundos. No la dejes en blanco jamás. El mínimo que exige el enunciado es tipo de texto + género; añadir ámbito y funciones es una respuesta enriquecida recomendada, no un requisito para conseguir los 0,2.$mkd$ WHERE subject = 'lengua' AND sort_order = 4;
UPDATE curriculum_content_v2 SET worked_example_markdown = $mkd$## Ejemplo guiado: las cuatro funciones del texto de Laura G. de Rivera

**Pregunta:** *Señale y explique las funciones del lenguaje presentes en el texto.*

### Respuesta modelo

> *En el texto concurren cuatro funciones del lenguaje, con predominio de la apelativa y la expresiva.*
>
> ***Función apelativa.*** *Es la dominante, pues el texto persigue modificar la actitud del lector ante la tecnología. Se manifiesta sobre todo en la **interrogación retórica** "**¿Una rotura o una interrupción brusca es algo deseable?**", que no busca información sino orientar la respuesta del lector hacia la tesis de la autora: al formular la pregunta en esos términos, la respuesta negativa resulta inevitable.*
>
> ***Función expresiva.*** *La autora deja abundantes huellas de su subjetividad. El **plural inclusivo** de "**nos hemos metido de cabeza**" y "**no lo sabemos**" la sitúa dentro del grupo criticado, lo que suaviza el reproche y busca la complicidad. El léxico valorativo con carga irónica —"como si fuera sinónimo de… **ser muy cool**"— revela su distancia crítica respecto al término.*
>
> ***Función metalingüística.*** *Resulta especialmente relevante en este texto, pues el lenguaje se convierte en objeto de reflexión: la autora **define una palabra** y cita para ello dos autoridades normativas, la **RAE** y la **Fundéu**. Todo el arranque del artículo consiste en contrastar el significado real del término con su uso social.*
>
> ***Función representativa.*** *Sostiene la argumentación mediante datos objetivos, como el **estudio de Cisco de 2024** y los porcentajes que cita, presentados en tercera persona y sin valoración explícita.*
>
> *La combinación de estas cuatro funciones explica la eficacia persuasiva del texto: la representativa aporta credibilidad, la metalingüística fundamenta la crítica, y la expresiva y la apelativa construyen la complicidad con el lector.*

## Analiza la estructura de la respuesta

Cada función lleva **cuatro elementos**:
1. **Nombre** de la función.
2. **Explicación** de por qué está.
3. **Cita literal** entre comillas.
4. **Efecto** que produce.

Y el conjunto se cierra con una **valoración global** que relaciona las cuatro. Ese párrafo final es lo que eleva la respuesta.

## Estrategia Kairo recomendada

Los criterios de corrección no fijan una fórmula cerrada y obligatoria, pero premian que la respuesta esté fundamentada en el texto y no sea una lista memorizada. **Nombrar la función sin citar el texto se queda corto**: no demuestra que la hayas localizado de verdad. Por eso en Kairo recomendamos aplicar siempre este esquema:

> **función → explicación → cita literal entre comillas → efecto**

## Error típico y su corrección

**❌ Mal:**
> *Hay función apelativa, expresiva, representativa y poética.*

Enumerar sin citar es una lista, no un análisis. Puntúa muy poco.

**✅ Bien:**
> *Hay **función apelativa**, como prueba la interrogación retórica "**¿…es algo deseable?**", que interpela directamente al lector para orientar su juicio.*

**La diferencia son doce palabras** y vale varias décimas.$mkd$ WHERE subject = 'lengua' AND sort_order = 6;
UPDATE curriculum_content_v2 SET worked_example_markdown = $mkd$## Ejemplo guiado: los marcadores y conectores del texto de Juan Soto Ivars

**Texto** (modelo PAU 2026):
> *"Un tipo de entrevista se hace cada vez más común en los periódicos: es gente rica o famosa que ha cumplido años y piensa que su vida está incompleta. […] No renunciaron a nada: renunciaron a mucho. La ideología es lo que no se ve […] **También dice, la ideología**, que se puede tener todo sin renunciar a nada: **pero** el todo al que se refiere la ideología es un todo sin los otros, un todo independiente, autodeterminado, **es decir**: relativo como mínimo, **si partimos de la base de que** a todos nos han construido otros."*

Este tramo mezcla deliberadamente un **marcador discursivo** en sentido estricto con otros elementos de cohesión que conviene no confundir con él: un adverbio, una conjunción y una construcción sintáctica compleja. Distinguirlos es justo lo que separa una respuesta precisa de una aproximada.

### Respuesta modelo

> *El fragmento organiza su progresión argumentativa mediante varios mecanismos de cohesión, no todos del mismo tipo gramatical.*
>
> ***Adverbio aditivo.*** *"**También** dice, la ideología, que…" suma una segunda característica a la caracterización de la ideología iniciada antes. Se trata de un **adverbio de foco aditivo** (no de un marcador discursivo en sentido estricto, que suele ser una locución como "además" o "asimismo"), pero cumple aquí una función próxima a la de un conector: su posición inicial y el inciso entre comas —"la ideología"— refuerzan el carácter de enumeración de rasgos.*
>
> ***Conjunción coordinante adversativa.*** *"**Pero** el todo al que se refiere la ideología es un todo sin los otros" marca el **giro decisivo** del texto: hasta aquí el autor ha expuesto lo que la ideología promete; a partir de aquí desmonta esa promesa. Es el punto exacto donde arranca su propia argumentación, y no es casual que la tesis venga inmediatamente después. Conviene precisar que *pero* es una **conjunción**, con función de nexo dentro de la oración y sin la movilidad de un marcador —no equivale, por tanto, a "sin embargo" o "no obstante", aunque cumpla un papel argumentativo semejante.*
>
> ***Reformulador explicativo.*** *"**Es decir**: relativo como mínimo" reexplica en términos más precisos lo que acaba de afirmarse. Su presencia revela la voluntad del autor de **no ser malinterpretado** en el momento culminante del razonamiento. Este sí es un marcador discursivo en sentido estricto: extraoracional y móvil.*
>
> ***Construcción condicional argumentativa.*** *"**Si partimos de la base de que** a todos nos han construido otros" no es un marcador léxico fijo como "es decir" o "sin embargo", sino una **subordinada condicional** que funciona como premisa argumentativa: introduce la base sobre la que se sostiene toda la conclusión. Al presentarla como punto de partida compartido y no como afirmación discutible, el autor logra que el lector la acepte sin someterla a examen: es una estrategia persuasiva de gran eficacia, aunque sintácticamente sea una construcción compleja y no una locución conectiva fija.*
>
> ***Conclusión global.*** *El **reformulador** "es decir" y el giro marcado por la conjunción **pero** revelan un texto **dialógico**, construido rebatiendo una postura previa —la ideología de la autorrealización— que se da por conocida y compartida por el lector. No se trata de una exposición neutra, sino de una réplica.*

## Lo que hace que esta respuesta valga

El **último párrafo**. Los cuatro anteriores identifican correctamente la naturaleza gramatical de cada elemento (adverbio, conjunción, marcador, construcción sintáctica) sin forzarlos a todos dentro de la misma etiqueta; el quinto **extrae una conclusión** sobre el tipo de texto a partir del conjunto. Esa es la diferencia entre listar y analizar.

## Error frecuente

**❌** *"Hay marcadores como *pero*, *es decir* y *también*, que sirven para unir las ideas."*

Es cierto pero vacío: no distingue conjunción de marcador ni de adverbio, no explica qué relación establece cada uno ni qué revela su conjunto. Vale muy poco.

**✅** *"La **conjunción adversativa** *pero* marca el giro entre lo que la ideología promete y lo que el autor denuncia, y es el punto donde arranca la tesis; el **reformulador** *es decir* precisa esa idea a continuación."*$mkd$ WHERE subject = 'lengua' AND sort_order = 10;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$## La pregunta mejor pagada del examen

**1,3 puntos.** Más que cualquier otra pregunta individual salvo el tema de literatura. No es una pregunta de memorizar un tema cerrado, pero sí exige **conocer de antemano** la terminología, las categorías gramaticales, los recursos retóricos, la modalización y los mecanismos de cohesión: sin ese conocimiento previo no se pueden **aplicar** al texto, por muy presente que esté todo en él.

Se responde recorriendo el texto por **niveles lingüísticos**, de menor a mayor. Es el orden que recomendamos en Kairo para no dejarte nada por el camino, aunque el criterio oficial no impone una secuencia fija: lo que se valora es que cada rasgo señalado vaya acompañado de su función en el texto, no un orden concreto de exposición.

## Nivel 1: morfológico

Qué **categorías gramaticales** predominan y **qué revela** ese predominio:

| Si abundan… | Suele indicar… |
|---|---|
| **Sustantivos abstractos** | Texto reflexivo, conceptual |
| **Adjetivos valorativos** | Subjetividad, modalización |
| **Adjetivos especificativos** y tecnicismos | Objetividad, precisión |
| **Verbos de acción** en pasado | Narración |
| **Verbos en presente** | Validez general (presente **gnómico**) o actualización |
| **1ª persona** | Implicación del emisor |
| **Sufijos apreciativos** | Afectividad, ironía, desprecio |

Menciona también los **tiempos verbales** y su valor: el **presente gnómico** presenta la opinión como verdad universal; el **condicional** matiza; el **imperfecto** describe.

## Nivel 2: sintáctico

- **Modalidades oracionales**: enunciativas, **interrogativas retóricas**, exclamativas, dubitativas.
- **Tipo de oraciones**: ¿predominio de **simples y yuxtapuestas** (estilo cortado, ágil, sentencioso) o de **subordinadas** (razonamiento complejo, matizado)?
- **Longitud del período**: frase corta = contundencia; frase larga = reflexión.
- **Orden**: **hipérbaton**, anteposición enfática, incisos.
- **Conectores** y su tipo dominante.
- Recursos como el **paralelismo** o la **elipsis**.

## Nivel 3: léxico-semántico

- **Campos semánticos** dominantes y sus posibles **oposiciones**.
- **Léxico valorativo** (subjetivemas) frente a léxico denotativo.
- **Tecnicismos**, **cultismos**, **coloquialismos**, **neologismos**, **extranjerismos**.
- **Denotación** frente a **connotación**.
- **Relaciones semánticas**: sinonimia, antonimia, hiperonimia.

## Nivel 4: pragmático-textual

- **Modalización** y deixis.
- **Funciones del lenguaje** predominantes.
- **Figuras retóricas** y su interpretación.
- **Estructura** y tipo de progresión.
- **Adecuación** y registro.
- **Intertextualidad**: citas, referencias culturales.

## La regla de oro

**Nunca describas sin interpretar.** Cada rasgo debe ir seguido de una explicación del tipo *"lo que produce…"*, *"lo que revela…"*, *"con lo que el autor consigue…"*.

Un rasgo sin interpretación es medio rasgo.

## La estructura de la respuesta

**Cuatro párrafos, uno por nivel.** Es la plantilla recomendada para no dejarte nada y para que el corrector localice todo de inmediato. En cada párrafo: **dos o tres rasgos**, cada uno con **cita** e **interpretación**.

Y un **párrafo de cierre** que relacione los niveles entre sí y conecte con la intención global del texto.$mkd$ WHERE subject = 'lengua' AND sort_order = 13;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$## Qué es un sintagma

Palabra o grupo de palabras organizado en torno a un **núcleo** y que desempeña una **función sintáctica** dentro de la oración.

Es la unidad básica del análisis: antes de decir qué función cumple algo, hay que delimitar **dónde empieza y dónde acaba**.

## Estructura general

> **(Determinantes) + NÚCLEO + (Complementos o Adyacentes)**

Entre paréntesis, lo optativo. Lo único imprescindible es el **núcleo**.

## Los cinco tipos

| Sintagma | Núcleo | Ejemplo |
|---|---|---|
| **Nominal (SN)** | Sustantivo o pronombre | *el frío suelo de cemento* |
| **Adjetival (SAdj)** | Adjetivo | *muy difícil de entender* |
| **Adverbial (SAdv)** | Adverbio | *bastante lejos de aquí* |
| **Verbal (SV)** | Verbo | *soltó una maldición* |
| **Preposicional (SPrep)** | *(sin núcleo propio en el modelo escolar tradicional)* | *de cemento*, *con sus amigos* |

## El sintagma preposicional es distinto

**En el modelo escolar tradicional —el que se usa en Bachillerato y en la PAU— no tiene núcleo propio.** Se compone de:

> **Enlace (preposición) + Término (otro sintagma, casi siempre nominal)**

> *en **los pies*** → **Enl:** *en* + **T:** SN *los pies*

Por eso, cuando analices un SPrep, siempre hay que abrir dentro de él el sintagma que funciona como término.

*Matiz:* la Nueva Gramática de la Lengua Española (NGLE) de la RAE admite también un análisis alternativo, en el que la preposición se considera el núcleo del sintagma. Para el examen de Madrid basta con el modelo tradicional de enlace + término, que es el que se usa aquí y el habitual en el análisis sintáctico escolar.

## Qué puede haber dentro de cada sintagma

**SN:** determinantes (*el*, *sus*, *dos*), adyacentes adjetivales (*frío*), complementos del nombre en SPrep (*de cemento*), aposiciones (*Madrid, la capital*), proposiciones adjetivas (*que convertía cada logro*).

**SAdj:** modificadores adverbiales (*muy* difícil) y complementos del adjetivo en SPrep (*difícil **de entender***).

**SAdv:** modificadores (*bastante* lejos) y complementos del adverbio (*lejos **de aquí***).

**SV:** todos los complementos verbales (CD, CI, CRég, CC, Atrib, CPvo, CAg).

## Tipo y función no son lo mismo

Es la confusión más frecuente y la que más se penaliza.

- **Tipo** = de qué clase es el sintagma (SN, SPrep, SAdj…). Depende de su **núcleo**.
- **Función** = qué papel desempeña en la oración (Sujeto, CD, CN, CCL…). Depende de su **relación** con el resto.

> *de cemento* → **tipo:** SPrep · **función:** CN
> *el viejo* → **tipo:** SN · **función:** Sujeto

**En el examen hay que indicar siempre las dos cosas**, normalmente escribiendo el tipo encima y la función debajo, o con la notación *SPrep/CN*.

## Por qué importa el tipo

Porque **condiciona las funciones posibles**:
- Un **CD** solo puede ser un SN (o un SPrep con *a* si es persona determinada).
- Un **CRég** es siempre un SPrep con la preposición que exige el verbo.
- Un **CC de modo** puede ser SAdv o SPrep, pero no un SN a secas.

Si has identificado un SAdv, ya sabes que no puede ser CD.$mkd$ WHERE subject = 'lengua' AND sort_order = 16;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$## Qué son

Proposiciones que desempeñan **la misma función que un sintagma nominal** dentro de la oración principal.

**La prueba definitiva:** se sustituyen por ***esto***, ***eso*** o ***algo***.

> *Dijo **que vendría*** → *Dijo **eso*** ✅ → sustantiva

## Los nexos

| Nexo | Tipo de sustantiva | Ejemplo |
|---|---|---|
| **que** (conjunción) | Enunciativa | *Dijo **que** vendría* |
| **si** (conjunción) | Interrogativa indirecta **total** | *Preguntó **si** llovía* |
| **qué, quién, cuándo, dónde, cómo, cuánto** (interrogativos, **con tilde**) | Interrogativa indirecta **parcial** | *Ignoro **dónde** vive* |
| **Sin nexo**, con infinitivo | De infinitivo | *Quiero **estudiar*** |

⚠️ El *que* de las sustantivas es **conjunción**: no tiene función sintáctica dentro de la proposición, solo enlaza. Es la diferencia clave con el *que* relativo de las adjetivas.

## Las funciones que pueden desempeñar

| Función | Ejemplo | Prueba |
|---|---|---|
| **Sujeto** | ***Que llegues tarde** me molesta* | *Eso me molesta* + concordancia |
| **CD** | *Dijo **que vendría*** | *Lo dijo* |
| **Atributo** | *Mi deseo es **que apruebes*** | *Lo es* |
| **CRég** | *Se acordó de **que era martes*** | *Se acordó de eso* |
| **CN** | *Tengo la esperanza de **que venga*** | complementa a *esperanza* |
| **CAdj** | *Estoy seguro de **que vendrá*** | complementa a *seguro* |
| **CI** | *Dio importancia a **lo que dijo*** | *Le dio importancia* |

## El método

1. **Sustituye por *eso*.** Si funciona → es sustantiva.
2. **Aplica las pruebas de función habituales**: *lo* para CD, cambio de número para sujeto, *lo* para atributo, *prep + eso* para CRég.
3. Si va precedida de preposición y depende de un **sustantivo** → CN; de un **adjetivo** → CAdj.

## Las sustantivas de sujeto

Son las que más se fallan, porque el orden habitual las coloca **detrás** del verbo. Aparecen sobre todo con:
- Verbos de **afección**: *gustar*, *molestar*, *encantar*, *preocupar*
- Verbos como *convenir*, *importar*, *parecer*, *bastar*
- Construcciones **ser + adjetivo**: *Es evidente **que…***, *Es necesario **que…***

> *Es evidente **que ha llovido**.* → *Eso es evidente* → **Sujeto**

## Las interrogativas indirectas

Reproducen una pregunta **sin signos de interrogación** y subordinada a un verbo de lengua o entendimiento (*preguntar*, *saber*, *ignorar*, *decir*).

- **Total** (respuesta sí/no): nexo ***si***. *Preguntó **si** vendrías.*
- **Parcial**: nexo **interrogativo con tilde**. *Preguntó **quién** vendría.*

⚠️ Los interrogativos indirectos **llevan tilde** aunque no haya signos de interrogación, y **sí tienen función** dentro de su proposición (a diferencia del *que* conjunción).$mkd$ WHERE subject = 'lengua' AND sort_order = 24;
UPDATE curriculum_content_v2 SET worked_example_markdown = $mkd$## Ejemplo guiado: la pregunta completa de PAU

**Pregunta real (modelo 2026):** *Indique a qué categoría gramatical, o clase de palabras, pertenece "predominante", analice su estructura morfológica y señale a qué proceso de formación de palabras responde.*

### Respuesta modelo

> ***Categoría gramatical.*** *"Predominante" es un **adjetivo** calificativo. Lo acreditan tres pruebas de comportamiento: **concuerda en número** con el sustantivo al que acompaña (*rasgo predominante / rasgos predominantes*); **admite gradación** (*muy predominante*); y puede desempeñar las funciones propias del adjetivo, esto es, **adyacente** dentro de un SN o **atributo** con verbo copulativo.*
>
> ***Estructura morfológica.*** *Se descompone en: **pre-** (prefijo de anterioridad o superioridad) + **domin-** (lexema, presente en la familia léxica *dominar, dominio, dominante*) + **-ante** (sufijo derivativo que forma adjetivos a partir de bases verbales, con valor de agente o de acción en curso; la vocal final **-e** no es un morfema aparte, sino parte del propio sufijo, invariable en género en este tipo de adjetivos). Un análisis alternativo, también válido, segmenta el mismo tramo en **-a-** (vocal temática de la 1ª conjugación, de *predominar*) + **-nte** (sufijo de participio de presente); ambas segmentaciones son coherentes y llegan al mismo resultado.*
>
> ***Proceso de formación.*** *Responde a la **derivación**, concretamente a la **sufijación** sobre el verbo *predominar* mediante *-ante*. No se trata de parasíntesis, pues el verbo *predominar* existe de forma autónoma en la lengua, de modo que el adjetivo se forma en un solo paso a partir de él y no mediante la adición simultánea de prefijo y sufijo.*

## Por qué esta respuesta vale los 0,8

| Requisito | ¿Está? |
|---|---|
| Da la categoría | ✅ adjetivo |
| **Justifica** con pruebas de comportamiento | ✅ tres pruebas |
| Segmenta la estructura | ✅ con nombre de cada elemento |
| Nombra el proceso | ✅ derivación por sufijación |
| **Descarta** la parasíntesis razonadamente | ✅ |

**El descarte razonado es lo que la eleva.** Decir por qué *no* es parasíntesis demuestra que dominas la distinción.

## Ejemplo 2: la trampa del contexto

**Pregunta:** *Indique la categoría gramatical de "bajo" en cada caso.*

> **(a)** *El niño es **bajo***. → **Adjetivo**: concuerda con *niño* (*la niña es baja*) y admite gradación (*muy bajo*).
> **(b)** *Está **bajo** la mesa*. → **Preposición**: enlaza y subordina el término *la mesa*; es invariable y no admite gradación.
> **(c)** ***Bajo** las escaleras corriendo*. → **Verbo**: 1ª persona del singular del presente de indicativo de *bajar*; admite flexión (*bajas, bajaba*).
> **(d)** *Habla más **bajo***. → **Adverbio**: modifica al verbo *habla*, es invariable (*ellas hablan bajo*) y admite cuantificación (*más bajo*).

**El método:** en cada caso, aplica **una prueba de comportamiento distinta** y menciónala. No basta con nombrar la categoría.$mkd$ WHERE subject = 'lengua' AND sort_order = 31;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$## Marco legal

El **artículo 3 de la Constitución de 1978** establece:
1. El **castellano** es la lengua española oficial del Estado. Todos los españoles tienen el **deber** de conocerla y el **derecho** a usarla.
2. Las demás lenguas españolas serán también oficiales en sus respectivas Comunidades Autónomas de acuerdo con sus Estatutos.
3. La riqueza de las modalidades lingüísticas de España es un **patrimonio cultural** que será objeto de especial respeto y protección.

## Las lenguas cooficiales

| Lengua | Territorio | Origen |
|---|---|---|
| **Catalán** | Cataluña, Islas Baleares y Comunidad Valenciana (allí como **valenciano**) | **Románica** |
| **Gallego** | Galicia | **Románica** |
| **Euskera** | País Vasco y zona vascófona de Navarra | **NO románica** |
| **Aranés** (variedad del occitano) | Lengua propia del Valle de Arán; **oficial en toda Cataluña** desde el Estatuto de Autonomía de 2006 (art. 6.5) | **Románica** |

**El dato clave:** catalán, gallego, aranés y castellano son **lenguas románicas** (proceden del latín); el **euskera no lo es**. Es una lengua **preindoeuropea** de origen desconocido, la **única lengua prerromana que sobrevivió a la romanización**. Mencionarlo siempre suma.

## Asturleonés y aragonés: variedades romances históricas

El **astur-leonés** (bable) y el **aragonés** (fabla) son **variedades romances históricas**, protegidas por sus respectivos estatutos autonómicos, pero **sin el mismo régimen de cooficialidad** que castellano, catalán, gallego y euskera. Su consideración como "lenguas" propiamente dichas o como variedades del castellano es objeto de debate entre lingüistas y no conviene presentarla como un hecho cerrado en un sentido u otro.

## Bilingüismo y diglosia

| | **Bilingüismo** | **Diglosia** |
|---|---|---|
| **Situación** | Dos lenguas conviven en un mismo territorio o hablante | Una lengua ocupa una posición **socialmente superior** a otra |
| **Usos** | Idealmente, ambas en todos los ámbitos | La **variedad alta** para lo formal; la **baja** para lo familiar |
| **Prestigio** | No siempre equiparable: el bilingüismo no garantiza por sí solo igualdad sociolingüística | Desigual por definición |
| **Estabilidad** | Puede ser estable o desigual | Puede persistir mucho tiempo; no conduce necesariamente a la sustitución de la lengua baja |

## Variedades del castellano

### Dialectos septentrionales (norte peninsular)
Rasgos: **distinción** de /s/ y /θ/, **leísmo** y **laísmo** (Castilla), pronunciación de la /d/ final. La norma estándar histórica del español se ha basado tradicionalmente en rasgos centro-septentrionales, pero eso no implica que las demás variedades sean menos correctas: todas las variedades geográficas del español son igualmente legítimas desde el punto de vista lingüístico.

### Dialectos meridionales
**Andaluz, extremeño, murciano, canario**:
- **Seseo** (*casa* y *caza* con /s/) o **ceceo** (ambas con /θ/)
- **Yeísmo** (*pollo* = *poyo*), hoy general en casi toda España
- **Aspiración o pérdida de /-s/** final: *lo*(*h*) *niño*
- **Confusión de /l/ y /r/** implosivas: *arma* por *alma*
- **Pérdida de /-d-/** intervocálica: *cansao*
- **Ustedes** por *vosotros* (Andalucía occidental y Canarias)

### Español de América
**Seseo** generalizado, **yeísmo**, **voseo** (*vos tenés* en Argentina, Uruguay, Centroamérica), ***ustedes*** por *vosotros* en todo el continente, uso preferente del pretérito perfecto simple, léxico propio e **indigenismos** (*maíz*, *chocolate*, *cacique*).

## Registros y niveles

No confundir **variedades geográficas** (dialectos) con:
- **Variedades sociales o diastráticas:** nivel culto, medio, vulgar
- **Variedades situacionales o diafásicas:** registro formal, coloquial
- **Jergas:** profesionales (tecnicismos) o de grupo (argot juvenil)$mkd$, worked_example_markdown = $mkd$## Ejemplo guiado 1: la pregunta real de PAU 2026

**Pregunta:** *Enumere las lenguas de España que tienen la consideración de oficiales.*

### Respuesta modelo

> *De acuerdo con el **artículo 3 de la Constitución española de 1978**, el **castellano** es la lengua española oficial del Estado, y todos los españoles tienen el deber de conocerla y el derecho a usarla. Las demás lenguas españolas son también oficiales en sus respectivas Comunidades Autónomas conforme a lo dispuesto en sus Estatutos de Autonomía:*
>
> - ***Catalán***, *cooficial en **Cataluña** y las **Islas Baleares**, y en la **Comunidad Valenciana** bajo la denominación estatutaria de **valenciano**.*
> - ***Gallego***, *cooficial en **Galicia**.*
> - ***Euskera***, *cooficial en el **País Vasco** y en la zona vascófona de **Navarra**.*
> - ***Aranés***, *variedad del occitano, lengua propia del **Valle de Arán** y, desde el Estatuto de Autonomía de Cataluña de 2006 (art. 6.5), **oficial en toda Cataluña**.*
>
> *Debe precisarse que el **euskera** es la única de estas lenguas que **no procede del latín**: se trata de una lengua **preindoeuropea** de origen incierto y la única lengua prerromana que sobrevivió al proceso de romanización de la Península. Las demás, junto con el castellano, son **lenguas románicas**.*
>
> *Junto a ellas existen **variedades romances históricas** sin estatus de cooficialidad, como el **astur-leonés** y el **aragonés**, protegidas por sus respectivos estatutos.*

**Lo que la eleva:** citar el artículo 3, dar el territorio de cada una, mencionar el nombre estatutario del valenciano, precisar bien el alcance de la oficialidad del aranés, señalar el carácter no románico del euskera y añadir las variedades romances históricas.

## Ejemplo guiado 2: rasgos dialectales en un texto

**Pregunta:** *¿Aparecen rasgos dialectales en este texto? Justifique su respuesta con dos ejemplos.*

**Aplicado al fragmento de Alexis Ravelo**, autor canario:

> *Sí, el texto presenta rasgos propios del **habla popular meridional**, empleados con función caracterizadora de los personajes.*
>
> *En primer lugar, el **vocativo afectivo** "**mi niño**" y su correlato "**mi hija**", fórmulas de tratamiento cariñoso muy características del español de Canarias y de Andalucía, que sitúan geográficamente a los hablantes y establecen el tono de intimidad familiar.*
>
> *En segundo lugar, la fórmula **"Ditoseadis"**, deformación fonética de *Dios te ayude* o *Bendito sea Dios*, que refleja rasgos del habla popular: **pérdida de sílabas átonas**, **relajación consonántica** y fusión de la expresión en una sola palabra. Se trata de una fórmula lexicalizada propia de la oralidad rural.*
>
> *Cabe añadir el uso del término **"bacinilla"** frente a "orinal", variante de **registro popular** que contribuye a la misma caracterización.*
>
> *Es importante señalar que estos rasgos aparecen **exclusivamente en los diálogos de los personajes**, no en la voz del narrador, lo que confirma su valor deliberadamente **caracterizador** y no un descuido del autor.*

**La observación final** —que los dialectalismos están solo en los diálogos— es exactamente el tipo de matiz que distingue una respuesta sobresaliente.$mkd$ WHERE subject = 'lengua' AND sort_order = 40;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$## La pregunta 3.1 / 3.2

Vale **2 puntos**, la más cara del examen junto con el comentario. Es un tema **memorizado**, pero se puntúa la **organización**, no la cantidad.

### La estructura recomendada (estrategia Kairo)

**1. Contextualización (2-3 líneas)**
Marco histórico y cultural: fechas, situación de España, qué corriente sustituye o a qué reacciona.

**2. Características (el núcleo)**
**Cuatro o cinco rasgos**, cada uno con su nombre y su explicación. Es lo que más puntúa.

**3. Autores y obras**
Los principales, **con títulos concretos y fechas**. Un tema sin títulos no aprueba.

**4. Trayectoria o evolución**
Si el movimiento tiene etapas, señálalas.

**5. Cierre (1-2 líneas)**
Trascendencia o influencia posterior.

### Las tres reglas de oro
1. **Títulos siempre en cursiva** y con fecha aproximada.
2. **Nombra los rasgos con su etiqueta técnica** (*esperpento*, *deshumanización*, *tremendismo*).
3. **Si te piden extensión, respétala.** Algunos modelos piden 200 palabras exactas.

### El error que más resta
Contar la biografía de los autores. **No se pide biografía**, se piden características del movimiento y obras que lo ejemplifiquen.$mkd$ WHERE subject = 'lengua' AND sort_order = 41;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$## El condicionante comercial

El teatro es el género más condicionado de todos, porque depende de **empresarios**, de **actores** y de un **público** —la burguesía madrileña— que acude a divertirse y no quiere ver cuestionados sus valores. El resultado es un panorama dividido en dos: un **teatro que triunfa** y es artísticamente pobre, y un **teatro innovador** que apenas llega a estrenarse.

## El teatro que triunfa

**1. La comedia burguesa de Jacinto Benavente (1866-1954)**
Tras el fracaso de *El nido ajeno* (1894), que criticaba con dureza las costumbres de su clase, Benavente aprendió la lección y optó por una **crítica amable**, de conflictos poco comprometidos, diálogo elegante y construcción impecable. Fue **Nobel en 1922**.
- *Los intereses creados* (1907), su obra más celebrada, farsa de ambiente italiano con personajes de la *commedia dell'arte*, sobre el poder del interés económico.
- *La malquerida* (1913), drama rural.

**2. El teatro cómico y costumbrista**
- Los **hermanos Álvarez Quintero**: **sainetes** de ambiente andaluz idealizado y amable (*Malvaloca*).
- **Carlos Arniches**: sainetes del **Madrid castizo** (*El santo de la Isidra*), con extraordinario oído para el habla popular. Crea además la ***tragedia grotesca***, mezcla de lo cómico y lo patético con intención crítica: ***La señorita de Trevélez*** (1916), sobre la crueldad de una broma de señoritos provincianos hacia una solterona.
- **Pedro Muñoz Seca**: la ***astracanada***, comedia disparatada basada en el chiste y el juego de palabras. *La venganza de don Mendo* (1918).

**3. El teatro poético**
Escrito **en verso**, influido por el Modernismo, de temas **históricos** y tono nostálgico y conservador (evocación del pasado imperial). **Eduardo Marquina** (*En Flandes se ha puesto el sol*), los **hermanos Machado** (*La Lola se va a los puertos*), **Villaespesa**.

## El teatro innovador

Los intentos renovadores del **98** tuvieron escaso éxito escénico: **Unamuno** (*Fedra*), **Azorín** (*Lo invisible*), **Jacinto Grau** (*El señor de Pigmalión*).

## Ramón María del Valle-Inclán (1866-1936)

Es **una de las grandes renovaciones del teatro español** del siglo XX. En su época se le consideró **irrepresentable** por las exigencias técnicas de sus acotaciones y por la radicalidad de sus planteamientos; hoy la crítica lo considera, junto con Lorca, **uno de los dramaturgos más importantes de la literatura española desde el Siglo de Oro**.

### Su trayectoria

**1. Ciclo modernista.** Teatro decadente y esteticista, en la línea de las *Sonatas*.

**2. Ciclo mítico.** Ambientado en una **Galicia rural, intemporal y mágica**, dominada por la superstición, la lujuria, la avaricia y la violencia primitiva. Personajes gobernados por instintos elementales.
- Las ***Comedias bárbaras*** (trilogía protagonizada por don Juan Manuel Montenegro).
- ***Divinas palabras*** (1920), sobre la avaricia y la lujuria en torno a la explotación de un enano hidrocéfalo.

**3. Ciclo de la farsa.** Uso de lo **grotesco** y de la **caricatura** para ridiculizar a los personajes, a menudo reducidos a muñecos. *Farsa y licencia de la reina castiza*.

**4. Ciclo del esperpento.**

### El esperpento

Estética creada por Valle en ***Luces de bohemia*** (1920). La define el propio protagonista, **Max Estrella**, en la escena XII, ante los espejos deformantes del **callejón del Gato** de Madrid:

> *"Los héroes clásicos reflejados en los espejos cóncavos dan el Esperpento. […] España es una deformación grotesca de la civilización europea."*

**La idea de fondo:** en un país deformado, la **tragedia clásica ya no es posible**. Un héroe español no puede ser trágico, solo grotesco. Por eso, para reflejar la realidad española con fidelidad, hay que **deformarla sistemáticamente**.

**Procedimientos:**
- **Deformación sistemática** de la realidad, "matemáticamente" calculada.
- **Animalización** de los personajes (se les compara con perros, cerdos, ratas) y **cosificación** (se convierten en objetos o muñecos).
- **Muñequización**: los personajes se mueven como marionetas, sin voluntad propia.
- **Contraste** violento entre lo **trágico y lo cómico**, entre lo sublime y lo vulgar.
- **Lenguaje riquísimo**: coloquialismos, jergas madrileñas, gitanismos, cultismos y latinajos, todo mezclado. Las **acotaciones** tienen calidad literaria de primer orden y son casi imposibles de llevar a escena.

**Argumento de *Luces de bohemia*:** Max Estrella, poeta ciego y arruinado, recorre durante una noche el Madrid "absurdo, brillante y hambriento" acompañado de don Latino de Hispalis. Es detenido, ve morir a un niño en brazos de su madre durante una carga policial, conversa en la cárcel con un preso catalán anarquista, y muere de madrugada en el umbral de su casa. Su mujer y su hija se suicidan después.

**Otras obras esperpénticas:** ***Martes de carnaval***, trilogía que incluye *Los cuernos de don Friolera*, *Las galas del difunto* y *La hija del capitán*.

## El teatro de la Generación del 27

Se produce un **acercamiento del teatro al pueblo** con compañías como ***La Barraca***, dirigida por **Lorca**, que llevaba los clásicos por los pueblos de España. Destacan **Alejandro Casona** (*La dama del alba*), que mezcla realidad y fantasía, **Max Aub**, **Rafael Alberti** (*El adefesio*) y sobre todo **Federico García Lorca** *(ver misión 53)*.

Aparte queda **Miguel Mihura**, que escribe en **1932** ***Tres sombreros de copa***, humor absurdo que anticipa el teatro europeo del absurdo, pero que **no se estrena hasta 1952**.$mkd$ WHERE subject = 'lengua' AND sort_order = 47;
