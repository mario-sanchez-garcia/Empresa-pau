// Uso: node --env-file=.env.local docs/insert_lengua_b3.mjs
// Bloque 3 — Educación literaria: cards 41-60
//
// Temario extraído de la frecuencia real en los 45 exámenes oficiales de Madrid
// (2018-2026) que están en app/data/lengua.ts. Los temas más repetidos son, por
// este orden: Generación del 27 y teatro lorquiano (5), novela de 1939-1974,
// Modernismo y 98, Novecentismo y Vanguardias, y poesía/teatro de posguerra.
//
// IMPORTANTE sobre las lecturas: el modelo vigente NO fija una lista cerrada de
// obras. Las preguntas 3.3 y 3.4 piden comentar "la obra española que haya leído"
// escrita entre 1875-1936 y entre 1937-1974 respectivamente. Por eso las dos
// últimas misiones enseñan el MÉTODO de comentar la obra leída y proponen las
// obras más rentables de cada periodo, en lugar de imponer títulos.

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY
)

const SUBJECT = 'lengua'
const BLOCK_KEY = 'Educación literaria'
const BLOCK_SLUG = 'educacion-literaria'

const cards = [
  {
    sort_order: 41,
    title: 'Cómo se Responde un Tema de Literatura (2 puntos)',
    concept_markdown: `## La pregunta 3.1 / 3.2

Vale **2 puntos**, la más cara del examen junto con el comentario. Es un tema **memorizado**, pero se puntúa la **organización**, no la cantidad.

### La estructura que espera el corrector

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
Contar la biografía de los autores. **No se pide biografía**, se piden características del movimiento y obras que lo ejemplifiquen.`,
    worked_example_markdown: `**Plantilla aplicable a cualquier tema:**

> ***[Contextualización]*** *El Modernismo surge en las últimas décadas del siglo XIX como reacción contra el prosaísmo del Realismo y la retórica del Romanticismo tardío. Llega a España desde Hispanoamérica de la mano de Rubén Darío, cuya visita en 1892 resulta decisiva.*
>
> ***[Características]*** *Se caracteriza por, en primer lugar, la **búsqueda de la belleza** como fin en sí misma… En segundo lugar, el **escapismo**… En tercer lugar, la **renovación métrica**… Por último, la **riqueza sensorial**…*
>
> ***[Autores y obras]*** *Su figura central es **Rubén Darío**, con* Azul *(1888),* Prosas profanas *(1896) y* Cantos de vida y esperanza *(1905). En España destacan **Manuel Machado** (*Alma*, 1902) y el primer **Juan Ramón Jiménez**…*
>
> ***[Cierre]*** *El Modernismo supuso la primera renovación profunda del lenguaje poético en español y abrió el camino a las vanguardias.*

**El truco de la enumeración:** usar *"en primer lugar… en segundo lugar… por último"* obliga al corrector a ver que has dado cuatro rasgos. Sin esos marcadores, el mismo contenido parece menos.`,
    practice_prompt: 'Coge cualquier tema de literatura del temario y redáctalo en 200 palabras siguiendo las cinco partes (contextualización, características, autores y obras, evolución, cierre). Cuenta las palabras al terminar.',
    alert_markdown: '⚠️ **Un tema sin títulos de obras no llega al aprobado.** Aunque describas perfectamente las características, el corrector busca que demuestres conocimiento concreto: mínimo **tres autores con una obra fechada cada uno**.',
  },

  {
    sort_order: 42,
    title: 'El Realismo y el Naturalismo',
    concept_markdown: `## El Realismo (segunda mitad del siglo XIX)

Movimiento que pretende **reflejar fielmente la realidad** contemporánea. Surge con el auge de la burguesía y el positivismo.

### Características
- **Observación y documentación** de la realidad próxima
- **Verosimilitud**: personajes y ambientes creíbles
- **Narrador omnisciente** que conoce el interior de los personajes
- **Descripciones minuciosas** de ambientes y costumbres
- **Intención crítica** y análisis social
- Estilo **sobrio**, alejado de la retórica romántica

### Autores y obras
- **Benito Pérez Galdós**: *Fortunata y Jacinta* (1887), *Misericordia* (1897), los *Episodios Nacionales*
- **Leopoldo Alas "Clarín"**: ***La Regenta*** (1884-85), la gran novela del XIX español
- **José María de Pereda**, **Juan Valera** (*Pepita Jiménez*, 1874)
- **Emilia Pardo Bazán**: *Los pazos de Ulloa* (1886)

## El Naturalismo

Radicalización del Realismo impulsada por **Émile Zola**.

### Rasgos añadidos
- **Determinismo**: el ser humano está condicionado por la **herencia genética** y el **medio social**; no es libre
- **Método experimental**: la novela como laboratorio científico
- **Materialismo** y ambientes sórdidos, miseria, alcoholismo, enfermedad
- Personajes de **clases marginales**

En España se adopta de forma **atenuada**: **Pardo Bazán** lo defiende en *La cuestión palpitante* (1883) pero rechaza su determinismo por incompatible con su fe católica. También **Blasco Ibáñez** (*La barraca*, 1898).`,
    worked_example_markdown: `**Pregunta tipo PAU:** *El Realismo y el Naturalismo: la novela. Características, autores y obras.*

**Esquema de respuesta (200 palabras):**

> *El Realismo se desarrolla en España en la segunda mitad del XIX, ligado al ascenso de la burguesía y a la mentalidad positivista, y reacciona contra el subjetivismo romántico.*
>
> *Sus rasgos esenciales son: la **verosimilitud**, con ambientes contemporáneos y reconocibles; la **observación documentada** de la realidad; el **narrador omnisciente**, que analiza la conciencia de los personajes; la **descripción minuciosa** de espacios y costumbres; y una clara **intención crítica**.*
>
> *La cumbre del género es* **La Regenta** *(1884-85) de **Leopoldo Alas "Clarín"**, análisis del adulterio y de la hipocresía de una ciudad provinciana. **Benito Pérez Galdós**, el autor más prolífico, retrata el Madrid de su tiempo en* **Fortunata y Jacinta** *(1887) y reconstruye el siglo en los* Episodios Nacionales*.*
>
> *El **Naturalismo**, de raíz zoliana, añade el **determinismo**: la conducta humana queda condicionada por la herencia y el medio. En España se adopta atenuadamente: **Emilia Pardo Bazán** lo teoriza en* La cuestión palpitante *(1883) y lo aplica en* **Los pazos de Ulloa** *(1886), aunque rechaza su materialismo.*

**Fíjate:** cinco rasgos nombrados, cuatro obras con fecha, y la distinción Realismo/Naturalismo explicada. Eso es un 2.`,
    practice_prompt: 'Explica las diferencias entre Realismo y Naturalismo en cuatro puntos concretos, citando una obra representativa de cada movimiento en la literatura española y justificando por qué la clasificas ahí.',
    alert_markdown: '⚠️ **El Naturalismo español es "atenuado".** Mencionar que Pardo Bazán acepta la técnica pero rechaza el determinismo por sus convicciones religiosas es un matiz que los correctores valoran mucho.',
  },

  {
    sort_order: 43,
    title: 'El Modernismo',
    concept_markdown: `## El Modernismo (1885-1915)

Movimiento de renovación estética nacido en **Hispanoamérica** que reacciona contra el prosaísmo realista. Su introductor en España es **Rubén Darío**, cuyo viaje en 1892 resulta decisivo.

### Influencias
El **Parnasianismo** francés (culto a la belleza formal, *"el arte por el arte"*) y el **Simbolismo** (sugerencia, musicalidad, correspondencias entre sensaciones).

### Características
1. **Búsqueda de la belleza** como valor supremo: esteticismo.
2. **Escapismo**: huida en el espacio (Oriente, Versalles, mitología griega) y en el tiempo (Edad Media, siglo XVIII), como rechazo de una realidad burguesa vulgar.
3. **Cosmopolitismo**, con París como capital simbólica.
4. **Renovación métrica**: recuperación del **alejandrino** (14 sílabas), el dodecasílabo y el eneasílabo; verso libre incipiente.
5. **Riqueza sensorial y sinestesia**: color, música, perfume (*"sonoro marfil"*).
6. **Léxico exquisito**: cisnes, princesas, nenúfares, jardines, mármoles.
7. **Intimismo y melancolía** en su etapa final: hastío, angustia existencial.

### Autores y obras
- **Rubén Darío**: *Azul* (1888), *Prosas profanas* (1896) — cumbre del esteticismo — y *Cantos de vida y esperanza* (1905), más grave e intimista.
- **Manuel Machado**: *Alma* (1902).
- **Juan Ramón Jiménez** en su primera etapa: *Arias tristes* (1903).
- **Valle-Inclán** en las *Sonatas* (1902-1905), modernismo en prosa.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *El Modernismo y la Generación del 98.*

**Cómo se estructura la comparación (que es lo que realmente se pregunta):**

| | **Modernismo** | **Generación del 98** |
|---|---|---|
| **Preocupación** | **Estética**: la belleza | **Ética**: el problema de España |
| **Actitud** | **Evasión** hacia mundos exóticos | **Inmersión** en Castilla y su paisaje |
| **Estilo** | Ornamental, sensorial, sonoro | **Sobrio**, precisión léxica, palabras tradicionales |
| **Métrica** | Innovación (alejandrino) | Formas más sencillas |
| **Géneros** | Poesía sobre todo | **Ensayo y novela** |
| **Figura** | Rubén Darío | Unamuno, Baroja, Azorín, Machado |

**Párrafo de cierre que suele puntuar:**

> *Con todo, la separación entre ambos movimientos es más didáctica que real. Comparten el **rechazo de la sociedad burguesa** de la Restauración y la **voluntad de renovar el lenguaje literario**, y varios autores participan de los dos: **Valle-Inclán** evoluciona del modernismo de las* Sonatas *al esperpento, y **Antonio Machado** parte de un modernismo intimista en* Soledades *hacia la meditación sobre España de* Campos de Castilla*.*

**Ese matiz final —que son dos caras de una misma crisis de fin de siglo— es lo que distingue una respuesta memorizada de una comprendida.**`,
    practice_prompt: 'Redacta en 200 palabras el tema "El Modernismo: características, autores y obras". Incluye al menos cuatro rasgos con su nombre técnico y tres autores con una obra fechada cada uno.',
    alert_markdown: '⚠️ **Modernismo no es "moderno".** Es un movimiento **esteticista y evasivo** de fin de siglo. Confundirlo con la modernidad o con las vanguardias (que son treinta años posteriores y radicalmente distintas) es un error grave.',
  },

  {
    sort_order: 44,
    title: 'La Generación del 98',
    concept_markdown: `## La Generación del 98

Grupo de escritores marcados por el **Desastre de 1898** (pérdida de Cuba, Puerto Rico y Filipinas), que convierte la decadencia de España en su gran tema.

### Características
1. **El problema de España**: análisis de sus causas y búsqueda de soluciones. Distinción entre la **historia oficial** y la ***intrahistoria*** (concepto de **Unamuno**: la vida callada de las gentes anónimas que sostiene la historia).
2. **El paisaje de Castilla** como símbolo del alma española: austeridad, meseta, pueblos.
3. **Preocupaciones existenciales**: el sentido de la vida, la muerte, la fe, el paso del tiempo. Influencia de **Schopenhauer**, **Nietzsche** y **Kierkegaard**.
4. **Renovación de los géneros**: la **novela** se libera de las convenciones realistas (*nivola* de Unamuno) y el **ensayo** se convierte en género central.
5. **Estilo sobrio y antirretórico**: precisión léxica, recuperación de **arcaísmos** y palabras tradicionales, frase breve.
6. **Subjetivismo**: el paisaje se contempla desde la emoción del autor.

### Autores y obras
- **Miguel de Unamuno**: *Niebla* (1914), *San Manuel Bueno, mártir* (1931), *La tía Tula* (1921); ensayo: *En torno al casticismo* (1895), *Del sentimiento trágico de la vida* (1913).
- **Pío Baroja**: *El árbol de la ciencia* (1911), *Zalacaín el aventurero* (1909), *La busca* (1904).
- **Azorín** (José Martínez Ruiz): *La voluntad* (1902), *Castilla* (1912).
- **Antonio Machado**: *Campos de Castilla* (1912).
- **Ramiro de Maeztu** y, en su órbita, **Valle-Inclán**.`,
    worked_example_markdown: `**Los conceptos que hay que saber definir:**

**1. Intrahistoria (Unamuno)**
> *Frente a la historia de los grandes acontecimientos y personajes, Unamuno propone atender a la **intrahistoria**: la vida cotidiana, silenciosa y permanente de las gentes anónimas, que es el verdadero sustrato de un pueblo. La compara con el fondo del mar, que permanece inmóvil bajo las olas de la superficie.*

**2. Nivola (Unamuno)**
> *Término inventado por Unamuno en* **Niebla** *(1914) para desmarcarse de la novela realista. La nivola prescinde de descripciones y de argumento previo, se construye sobre el **diálogo** y plantea conflictos existenciales. En* Niebla*, el personaje Augusto Pérez llega a rebelarse contra su autor y a discutir con él sobre su derecho a existir.*

**3. El paisaje castellano**
> *No es descripción objetiva sino **símbolo**: la sequedad de la meseta expresa la decadencia nacional, y su austeridad, los valores que el 98 reivindica. Machado lo formula en* Campos de Castilla*: "Castilla miserable, ayer dominadora, / envuelta en sus andrajos desprecia cuanto ignora".*

**Truco:** memorizar **una cita breve** por tema (dos versos bastan) eleva mucho la impresión de dominio. Los correctores lo notan.`,
    practice_prompt: 'Explica los conceptos de "intrahistoria" y "nivola" y relaciónalos con una obra concreta de Unamuno. Después señala tres rasgos comunes a los autores del 98 con un ejemplo de cada uno.',
    alert_markdown: '⚠️ **La Generación del 98 no es un movimiento estético sino una actitud.** Sus autores tienen estilos muy distintos entre sí (Baroja es áspero y rápido, Azorín moroso y preciosista). Lo que los une es el **tema de España** y la **preocupación existencial**.',
  },

  {
    sort_order: 45,
    title: 'Antonio Machado',
    concept_markdown: `## Antonio Machado (1875-1939)

Figura que **enlaza** el Modernismo intimista con la meditación noventayochista y con el compromiso de los años treinta.

### Las tres etapas

**1. Modernismo intimista — *Soledades* (1903), ampliado como *Soledades, galerías y otros poemas* (1907)**
Poesía **simbolista** e interior. Los grandes temas: el **tiempo**, la **muerte**, **Dios**, el **sueño** y la **melancolía**. Aparecen sus **símbolos** característicos:

| Símbolo | Significado |
|---|---|
| **La tarde** | Melancolía, declive |
| **El camino** | La vida, el paso del tiempo |
| **El agua / la fuente** | Fluir del tiempo; si está estancada, muerte |
| **El espejo, la galería** | La conciencia, el mundo interior |
| **El sueño** | Vía de conocimiento |

**2. *Campos de Castilla* (1912, ampliado en 1917)**
La mirada se vuelve al **exterior**: el paisaje soriano, las gentes, la crítica del atraso español ("*la España de charanga y pandereta*"). Incluye el romance narrativo *La tierra de Alvargonzález* y los poemas dedicados a **Leonor**, su esposa muerta en 1912. También los *Proverbios y cantares*, de tono sentencioso.

**3. Etapa final**
*Nuevas canciones* (1924) y la creación de sus **apócrifos** (**Juan de Mairena**, **Abel Martín**), heterónimos filosóficos. Durante la Guerra Civil escribe poesía comprometida; muere en **Colliure** (Francia) en 1939, en el exilio.

### Estilo
Sobriedad, **símbolo** frente a metáfora ornamental, métrica tradicional (**silva-romance**), lenguaje aparentemente sencillo con enorme densidad.`,
    worked_example_markdown: `**Cómo se comenta un poema de Machado:**

> *"Caminante, son tus huellas / el camino, y nada más; / caminante, no hay camino, / se hace camino al andar."*

**Análisis modelo:**

> *Estos versos, pertenecientes a los* **Proverbios y cantares** *de* Campos de Castilla *(1912), condensan la concepción existencial machadiana.*
>
> *El **símbolo del camino**, central en toda su obra, representa aquí el **transcurso vital**. La paradoja "no hay camino, se hace camino al andar" niega la existencia de un destino prefijado: la vida no es una senda trazada de antemano que se recorre, sino que **se construye en el propio acto de vivir**.*
>
> *Formalmente, se trata de una **copla** de versos **octosílabos** con rima asonante en los pares, forma de la **lírica popular** que Machado reivindica frente al ornamento modernista. La **anáfora** ("caminante… caminante") y el **poliptoton** ("camino… camino… caminar") refuerzan el carácter sentencioso y memorable.*
>
> *La aparente sencillez léxica encierra una reflexión de raíz **existencialista** que anticipa preocupaciones filosóficas posteriores.*

**El esquema:** contexto de la obra → **símbolos** e interpretación → **forma métrica** y recursos → conclusión sobre el sentido.`,
    practice_prompt: 'Explica el significado de tres símbolos machadianos (la tarde, el camino, el agua) y localiza un ejemplo de cada uno en un poema de "Soledades" o "Campos de Castilla". Después describe brevemente las tres etapas de su obra.',
    alert_markdown: null,
  },

  {
    sort_order: 46,
    title: 'La Novela Anterior a 1936: Unamuno, Baroja y Azorín',
    concept_markdown: `## La renovación de la novela

Los autores del 98 rompen con el molde realista: reducen la trama, disuelven el narrador omnisciente y convierten la novela en vehículo de **ideas y conflictos existenciales**.

### Miguel de Unamuno — la novela como problema
- ***Niebla*** (1914): la "**nivola**". Augusto Pérez, personaje que se rebela contra su creador y viaja a Salamanca para discutirle su derecho a existir. Metaliteratura pura.
- ***San Manuel Bueno, mártir*** (1931): un párroco que **ha perdido la fe** pero la finge para no arrebatar el consuelo a sus feligreses. Condensa el **conflicto entre razón y fe** y el ansia de inmortalidad.
- ***La tía Tula*** (1921): la maternidad sin carnalidad; el deseo de perpetuarse.

**Rasgos:** predominio del **diálogo**, ausencia de descripción, personajes "agonistas" (en lucha), temas: inmortalidad, personalidad, fe.

### Pío Baroja — la novela abierta
- ***El árbol de la ciencia*** (1911): Andrés Hurtado, médico, atraviesa el desengaño ante la ciencia, la sociedad y la vida. Novela de **pesimismo** schopenhaueriano.
- ***Zalacaín el aventurero*** (1909), ***La busca*** (1904).

**Concepción:** la novela como **"saco donde cabe todo"**, sin plan previo. **Estilo espontáneo**, párrafo corto, frase rápida, diálogo ágil. Protagonista **inadaptado** y **abúlico**.

### Azorín — la novela impresionista
- ***La voluntad*** (1902), ***Castilla*** (1912).

**Rasgos:** casi **sin acción**; predominio de la **descripción morosa**, la **sensación** y el detalle mínimo. Obsesión por el **paso del tiempo** y por lo permanente bajo lo efímero. **Frase breve**, léxico preciso, recuperación de arcaísmos.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *La novela anterior a 1936: tendencias, autores y obras principales.*

**Esquema de respuesta:**

> *La novela del primer tercio del siglo XX rompe con el realismo decimonónico. Los autores del 98 la convierten en cauce de **preocupaciones existenciales y del problema de España**, reduciendo la trama y renunciando al narrador omnisciente.*
>
> ***Unamuno*** *lleva la ruptura al extremo con la **nivola**, término con el que en* **Niebla** *(1914) rechaza las convenciones del género: la obra se construye sobre el diálogo, prescinde de descripciones y culmina con la rebelión del personaje contra su autor. En* **San Manuel Bueno, mártir** *(1931) plantea el conflicto entre fe y razón a través de un párroco que ha perdido la fe pero la finge por caridad.*
>
> ***Baroja*** *concibe la novela como un género abierto, "un saco donde cabe todo". Su estilo es rápido y antirretórico, y sus protagonistas, inadaptados y abúlicos, como Andrés Hurtado en* **El árbol de la ciencia** *(1911), cuyo pesimismo bebe de Schopenhauer.*
>
> ***Azorín*** *practica una novela casi sin acción, impresionista, dominada por la descripción y la obsesión por el tiempo, como en* **La voluntad** *(1902).*
>
> *Junto a ellos, el **novecentismo** aportará la novela intelectual y deshumanizada de **Gabriel Miró** y **Ramón Pérez de Ayala**.*`,
    practice_prompt: 'Compara la concepción de la novela de Unamuno, Baroja y Azorín en tres aspectos: papel de la trama, estilo y temas dominantes. Cita una obra fechada de cada autor.',
    alert_markdown: '⚠️ ***San Manuel Bueno, mártir* es de 1931**, no del 98. Los autores de la Generación del 98 escriben durante décadas: no confundas la fecha del *grupo* con la de cada *obra*.',
  },

  {
    sort_order: 47,
    title: 'El Teatro Anterior a 1939: Valle-Inclán y el Esperpento',
    concept_markdown: `## El teatro que triunfaba

En el primer tercio de siglo dominan las salas tres fórmulas **comerciales**:
- **La comedia burguesa** de **Jacinto Benavente** (*Los intereses creados*, 1907), amable crítica de costumbres de la alta burguesía.
- **El teatro en verso** neorromántico (**Marquina**, los **hermanos Machado**).
- **El teatro cómico y costumbrista**: los **hermanos Álvarez Quintero** (sainetes andaluces) y **Carlos Arniches**, creador de la **tragedia grotesca** (*La señorita de Trevélez*, 1916).

## El teatro innovador: Valle-Inclán

**Ramón María del Valle-Inclán** (1866-1936) protagoniza la gran renovación dramática, con un teatro que en su momento se consideró **irrepresentable**.

### Su trayectoria
1. **Ciclo modernista**: las *Comedias bárbaras*.
2. **Ciclo mítico**: la Galicia rural, mágica y primitiva de *Divinas palabras* (1920).
3. **Ciclo del esperpento**.

### El esperpento
Estética creada por Valle en ***Luces de bohemia*** (1920), donde la define el propio personaje **Max Estrella**:

> *"Los héroes clásicos reflejados en los espejos cóncavos dan el Esperpento. […] España es una deformación grotesca de la civilización europea."*

**Procedimientos:**
- **Deformación sistemática** de la realidad mediante espejos cóncavos.
- **Animalización** y **cosificación** de los personajes; **muñequización**.
- Mezcla de lo **trágico y lo grotesco**.
- **Contraste** entre lo sublime y lo vulgar.
- Lenguaje riquísimo: **coloquialismos**, jergas madrileñas, gitanismos, junto a acotaciones de gran calidad literaria.

**Obras:** *Luces de bohemia* (1920), *Los cuernos de don Friolera* (1921), *Martes de carnaval*.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *El teatro anterior a 1939. Tendencias, autores y obras principales.*

**Estructura de respuesta:**

> *El teatro del primer tercio del siglo XX presenta una **doble cara**: un teatro comercial que triunfa en las salas y un teatro innovador que apenas llega a representarse.*
>
> *En el **teatro que triunfa** destaca la **comedia burguesa** de **Jacinto Benavente**, premio Nobel en 1922, cuya* **Los intereses creados** *(1907) ejerce una crítica amable de la clase que llenaba los teatros. Junto a él, el **teatro poético** en verso y el **teatro cómico** de los **Álvarez Quintero** y de **Carlos Arniches**, creador de la *tragedia grotesca*.*
>
> *El **teatro innovador** lo encabeza **Valle-Inclán**, que tras un ciclo modernista y otro mítico —* **Divinas palabras** *(1920)— crea el **esperpento** en* **Luces de bohemia** *(1920). Consiste en deformar sistemáticamente la realidad "reflejándola en espejos cóncavos", pues, en palabras de Max Estrella, "España es una deformación grotesca de la civilización europea". Sus procedimientos son la animalización y cosificación de los personajes, la mezcla de lo trágico y lo grotesco y un lenguaje que funde el habla castiza madrileña con la creación literaria.*
>
> *También **Federico García Lorca** renueva la escena, y **Miguel Mihura** escribe en 1932* Tres sombreros de copa*, aunque no se estrenará hasta 1952.*`,
    practice_prompt: 'Define el esperpento citando las palabras de Max Estrella en "Luces de bohemia" y enumera cuatro procedimientos con los que Valle-Inclán deforma la realidad. Explica por qué su teatro se consideró irrepresentable.',
    alert_markdown: '⚠️ **"Tres sombreros de copa" se escribe en 1932 pero se estrena en 1952.** Ese desfase de veinte años es un dato que aparece con frecuencia: Mihura se adelantó al teatro del absurdo europeo.',
  },

  {
    sort_order: 48,
    title: 'El Novecentismo y la Generación del 14',
    concept_markdown: `## El Novecentismo (Generación del 14)

Generación intermedia entre el 98 y las vanguardias. Sus miembros son **universitarios, europeístas e intelectuales**, y aspiran a **modernizar España** desde el rigor.

### Características
1. **Racionalismo e intelectualismo**: análisis frío frente al subjetivismo del 98.
2. **Europeísmo**: la solución para España es **europeizarse**.
3. **Arte puro y deshumanizado**: la obra debe eliminar lo sentimental y lo anecdótico.
4. **Obsesión por la perfección formal**: obra "bien hecha", dirigida a una **minoría** culta.
5. **Predominio del ensayo** y de la prosa intelectual.

### Autores

**José Ortega y Gasset** — el gran ensayista.
- ***La deshumanización del arte*** (1925): teoriza el arte nuevo, que renuncia a lo humano y sentimental y se dirige a una minoría.
- ***La rebelión de las masas*** (1930), *España invertebrada* (1921), *Meditaciones del Quijote* (1914).

**Eugenio d'Ors** (el *glosario*), **Gregorio Marañón**, **Manuel Azaña**.

**Novela:** **Gabriel Miró** (*Nuestro Padre San Daniel*), de prosa sensorial y lírica; **Ramón Pérez de Ayala** (*Belarmino y Apolonio*), novela intelectual.

## Juan Ramón Jiménez

Figura puente hacia el 27. Su lema: la **"poesía pura"**, "desnuda". Tres etapas:
1. **Sensitiva** (hasta 1915): modernismo intimista — *Arias tristes* (1903), *Platero y yo* (1914).
2. **Intelectual** (1916-1936): ***Diario de un poeta recién casado*** (1916), obra clave que introduce el **verso libre** y despoja al poema de ornamento.
3. **Suficiente o verdadera** (exilio): *Dios deseado y deseante* (1949).

Premio **Nobel en 1956**.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *El Novecentismo y la Generación del 14: el ensayo, la novela novecentista. Juan Ramón Jiménez.*

**Esquema de respuesta:**

> *El **Novecentismo** agrupa a los intelectuales que hacia 1914 buscan una **tercera vía** entre el 98 y las vanguardias. Son universitarios y europeístas, y frente al dolorido subjetivismo noventayochista proponen el **rigor intelectual** y la **serenidad analítica**. Defienden un **arte puro**, alejado de lo sentimental y destinado a una minoría culta.*
>
> *El **ensayo** es su género central. **José Ortega y Gasset** formula la estética del momento en* **La deshumanización del arte** *(1925), donde sostiene que el arte nuevo elimina lo humano y resulta por ello impopular, y analiza la sociedad de su tiempo en* **La rebelión de las masas** *(1930).*
>
> *En la **novela**, **Gabriel Miró** cultiva una prosa de extraordinaria riqueza sensorial y **Ramón Pérez de Ayala** una novela intelectual y ensayística en* **Belarmino y Apolonio** *(1921).*
>
> ***Juan Ramón Jiménez*** *encarna el ideal de **poesía pura**. Tras una etapa **sensitiva** de raíz modernista (*Arias tristes*, 1903), alcanza en* **Diario de un poeta recién casado** *(1916) su etapa **intelectual**: verso libre, desnudez expresiva y búsqueda de la esencia. Su obra, coronada con el **Nobel en 1956**, es el puente que conduce a la Generación del 27.*`,
    practice_prompt: 'Explica qué defiende Ortega y Gasset en "La deshumanización del arte" y relaciónalo con el concepto de "poesía pura" de Juan Ramón Jiménez. Después describe las tres etapas de la obra de Juan Ramón con una obra de cada una.',
    alert_markdown: '⚠️ **"Platero y yo" no es un libro infantil.** Es prosa lírica de la etapa sensitiva de Juan Ramón. Presentarlo como literatura para niños es un error frecuente que delata desconocimiento.',
  },

  {
    sort_order: 49,
    title: 'Las Vanguardias',
    concept_markdown: `## Las vanguardias (1910-1930)

Movimientos de **ruptura radical** con el arte anterior. Buscan la **originalidad absoluta**, experimentan y rechazan el sentimentalismo y la imitación de la realidad. Se difunden mediante **manifiestos**.

### Las vanguardias europeas

| Movimiento | Fundador | Rasgos |
|---|---|---|
| **Futurismo** (1909) | Marinetti | Exalta la **máquina**, la velocidad, la guerra; rompe la sintaxis |
| **Cubismo** (1913) | Apollinaire | Descomposición de la realidad; **caligramas** |
| **Dadaísmo** (1916) | Tzara | Negación total, absurdo, azar, lenguaje infantil |
| **Surrealismo** (1924) | Breton | El **subconsciente**, los sueños, la **escritura automática**; libera al hombre |
| **Expresionismo** | — | Deformación para expresar la angustia |

### Las vanguardias hispánicas

**Ramón Gómez de la Serna**, gran introductor y agitador. Crea la **greguería**, definida por él mismo como:
> **humorismo + metáfora = greguería**

Ejemplo: *"El agua no tiene memoria: por eso es tan limpia"*.

**Ultraísmo** (1918): vanguardia española que sintetiza futurismo y cubismo; culto a la **imagen** y supresión de lo anecdótico y sentimental.

**Creacionismo**: del chileno **Vicente Huidobro**. El poeta no imita la naturaleza sino que **crea realidades nuevas**: *"el poeta es un pequeño Dios"*.

### La importancia del Surrealismo en España
Fue la vanguardia **más influyente**: permitió recuperar lo humano y lo social dentro de la experimentación. Marca obras capitales del 27: ***Poeta en Nueva York*** de Lorca, ***Sobre los ángeles*** de Alberti y la poesía de **Cernuda** y **Aleixandre**.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *El Novecentismo y las Vanguardias* / *Las vanguardias en Europa, España e Hispanoamérica.*

**Esquema de respuesta:**

> *Las vanguardias son los movimientos artísticos de ruptura que se suceden en el primer tercio del siglo XX. Comparten el **rechazo del arte anterior**, la voluntad de **originalidad absoluta**, el **antisentimentalismo** y la difusión mediante **manifiestos**.*
>
> *En **Europa**, el **Futurismo** de Marinetti (1909) exalta la máquina y la velocidad; el **Cubismo** descompone la realidad y crea los **caligramas**; el **Dadaísmo** de Tzara lleva la negación al absurdo; y el **Surrealismo** de Breton (1924) explora el **subconsciente** mediante la **escritura automática**, con propósito no solo estético sino **liberador**.*
>
> *En **España**, **Ramón Gómez de la Serna** actúa de introductor y crea la **greguería** ("humorismo más metáfora"). El **Ultraísmo** cultiva la imagen depurada, y el **Creacionismo** del chileno **Vicente Huidobro** proclama que el poeta debe crear realidades nuevas en lugar de imitar la naturaleza.*
>
> *El Surrealismo fue el de mayor calado, pues permitió a la **Generación del 27** rehumanizar su poesía sin renunciar a la experimentación, como muestran* **Poeta en Nueva York** *de Lorca y* **Sobre los ángeles** *de Alberti, ambos de en torno a 1929.*`,
    practice_prompt: 'Define greguería con la fórmula de Gómez de la Serna e inventa tres propias. Después explica qué es la escritura automática surrealista y cita dos obras españolas de influencia surrealista con su autor y fecha.',
    alert_markdown: '⚠️ **El surrealismo español no es ortodoxo.** Lorca, Alberti o Cernuda **no** practican la escritura automática pura: usan la libertad de la imagen irracional pero mantienen el control consciente del poema. Señalarlo demuestra criterio.',
  },

  {
    sort_order: 50,
    title: 'La Generación del 27: Características',
    concept_markdown: `## La Generación del 27

Es **el tema más frecuente** del bloque de literatura en la PAU de Madrid.

### Por qué "del 27"
Por el **homenaje a Luis de Góngora** celebrado en el **Ateneo de Sevilla en 1927**, en el tercer centenario de su muerte, que reunió al grupo y proclamó su reivindicación del Barroco.

### Nómina
**Pedro Salinas**, **Jorge Guillén**, **Gerardo Diego**, **Federico García Lorca**, **Rafael Alberti**, **Vicente Aleixandre**, **Luis Cernuda**, **Dámaso Alonso**, **Emilio Prados**, **Manuel Altolaguirre**.

Junto a ellos, **Las Sinsombrero**: **Maruja Mallo**, **Concha Méndez**, **Ernestina de Champourcín**, **Rosa Chacel**, **María Zambrano**, largo tiempo silenciadas por la historiografía.

### Rasgos como generación
- Nacen en fechas próximas (**1891-1905**), con formación universitaria.
- Muchos conviven en la **Residencia de Estudiantes** de Madrid.
- Colaboran en las mismas **revistas** (*Revista de Occidente*, *Litoral*).
- Comparten el **acontecimiento generacional** de 1927.

### La síntesis que los define
Es su rasgo esencial: **equilibrio entre términos opuestos**.

| Tradición | Vanguardia |
|---|---|
| Góngora y el Barroco | Surrealismo, creacionismo |
| Lírica popular, romance, cancionero | Verso libre, imagen irracional |
| Clásicos (Garcilaso, Lope) | Ultraísmo, futurismo |

También equilibran **lo intelectual y lo sentimental**, lo **culto y lo popular**, lo **universal y lo español**, la **pureza estética** y el **compromiso humano**.

### La metáfora
Es su recurso central, llevada a un grado de audacia y libertad sin precedentes.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *La generación del 27: características y trayectoria poética de los poetas del 27.*

**Las tres etapas (imprescindibles en la respuesta):**

> ***1. Hasta 1927 — poesía pura y neopopularismo.***
> *Influencia de **Juan Ramón Jiménez** y de Ortega: búsqueda de la **poesía pura**, deshumanizada, con predominio de la metáfora. Simultáneamente, cultivo del **neopopularismo**, que recupera el romance y la canción tradicional:* Marinero en tierra *de **Alberti** (1925) y el* Romancero gitano *de **Lorca** (1928). Culminación del **gongorismo** con* Cántico *de **Guillén** (1928).*
>
> ***2. De 1927 a la Guerra Civil — rehumanización y surrealismo.***
> *La irrupción del **surrealismo** devuelve al poema los conflictos humanos: el amor, la frustración, la protesta social. Son los años de* **Poeta en Nueva York** *de Lorca (escrito en 1929-30),* **Sobre los ángeles** *de Alberti (1929),* La destrucción o el amor *de **Aleixandre** (1935) y* La realidad y el deseo *de **Cernuda**. La poesía se vuelve **humana y comprometida**.*
>
> ***3. Después de 1936 — dispersión.***
> ***Lorca es asesinado** en 1936. **Salinas, Guillén, Alberti y Cernuda** parten al **exilio**, donde la nostalgia de España se convierte en tema central. **Dámaso Alonso** y **Aleixandre** permanecen en España; Dámaso inaugura con* **Hijos de la ira** *(1944) la **poesía desarraigada** de posguerra.*

**Cierre que puntúa:** *"El 27 representa la culminación de la llamada Edad de Plata de la literatura española, truncada por la guerra."*`,
    practice_prompt: 'Redacta en 200 palabras el tema "La Generación del 27: características y trayectoria poética". Incluye el porqué del nombre, tres rasgos de síntesis tradición-vanguardia y las tres etapas con una obra fechada por etapa.',
    alert_markdown: '⚠️ **Las Sinsombrero existieron.** Mencionar a Maruja Mallo, Concha Méndez o Rosa Chacel al hablar del 27 demuestra una visión actualizada del grupo y es un detalle que los correctores valoran cada vez más.',
  },

  {
    sort_order: 51,
    title: 'Los Poetas del 27: Trayectorias Individuales',
    concept_markdown: `## Quién es quién

Saber asociar **autor → rasgo → obra** es lo que permite escribir un tema del 27 con solvencia.

### Pedro Salinas — el poeta del amor
Poesía **conceptual e intelectual** sobre el amor como fuerza de conocimiento que revela la realidad auténtica del amado.
> ***La voz a ti debida*** (1933), *Razón de amor* (1936).

### Jorge Guillén — la poesía pura
El más **intelectual** y el más fiel a la poesía pura. Su obra entera se titula ***Cántico*** (1928-1950): entusiasmo ante la perfección del mundo, el "**ser**" gozoso. Verso ceñido, denso, esencial.
> *"El aire se serena / y viste de hermosura y luz no usada"*. Más tarde, *Clamor* introduce el desorden y el dolor histórico.

### Gerardo Diego — la versatilidad
Alterna **vanguardia creacionista** (*Manual de espumas*, 1924) con **poesía tradicional** (*Versos humanos*, 1925). Antólogo decisivo del grupo.

### Rafael Alberti — el poeta proteico
Cuatro líneas: **neopopular** (*Marinero en tierra*, 1925), **gongorina**, **surrealista** (*Sobre los ángeles*, 1929, crisis existencial) y **política** (*El poeta en la calle*). En el exilio, la nostalgia (*Retornos de lo vivo lejano*).

### Vicente Aleixandre — el surrealista telúrico
Fusión panteísta del hombre con la naturaleza; el amor como fuerza destructora.
> ***La destrucción o el amor*** (1935), *Sombra del paraíso* (1944). **Nobel en 1977**.

### Luis Cernuda — el conflicto realidad/deseo
Toda su obra se titula ***La realidad y el deseo***. Tema único: el **choque entre el deseo del individuo y la realidad que lo frustra**, incluida la marginación de su homosexualidad. Tono confesional, verso cercano a la prosa, ironía amarga. En el exilio: *Desolación de la Quimera*.

### Dámaso Alonso
Crítico y poeta. ***Hijos de la ira*** (1944), grito existencial de posguerra: *"Madrid es una ciudad de más de un millón de cadáveres"*.`,
    worked_example_markdown: `**Cómo se comenta un poema del 27 en la PAU:**

**Texto (aparece en el modelo oficial):** *"Insomnio"*, de **Dámaso Alonso**, en *Hijos de la ira* (1944):
> *"Madrid es una ciudad de más de un millón de cadáveres (según las últimas estadísticas)."*

**Pregunta:** *¿A qué alude el poeta con la imagen de cadáveres que se pudren?*

**Respuesta modelo:**

> *La imagen de los cadáveres que se pudren funciona como **metáfora de la condición existencial de la España de posguerra**. Los "más de un millón de cadáveres" no son literalmente muertos, sino **los vivos**: una población moralmente aniquilada, reducida a una existencia vegetativa tras la Guerra Civil.*
>
> *La eficacia del verso reside en el **contraste** entre el lenguaje poético y el burocrático: el paréntesis "(según las últimas estadísticas)" introduce un registro administrativo que **cosifica** a las personas, convirtiéndolas en cifra, y refuerza la denuncia.*
>
> *El poeta se incluye entre ellos ("este nicho en el que hace 45 años que me pudro"), de modo que la angustia no se observa desde fuera: es **compartida**. La pregunta reiterada a Dios ("por qué se pudre lentamente mi alma") revela el fondo **existencial y religioso** del poema.*
>
> *La obra inaugura la **poesía desarraigada**, que frente al garcilasismo evasivo de los años cuarenta expresa el desconcierto y la protesta ante un mundo que se percibe como caos.*

**El método:** interpretar la imagen → analizar el recurso formal que la sostiene → situarla en su corriente.`,
    practice_prompt: 'Asocia cada poeta del 27 con su tema central y su obra más representativa: Salinas, Guillén, Alberti, Aleixandre y Cernuda. Después explica qué significa el título global "La realidad y el deseo" de Cernuda.',
    alert_markdown: null,
  },

  {
    sort_order: 52,
    title: 'Federico García Lorca: La Poesía',
    concept_markdown: `## Federico García Lorca (1898-1936)

El autor más universal del 27. Su obra se articula sobre un **mito personal**: el **destino trágico**, la **frustración** y el **choque entre el individuo y una sociedad represiva**.

### Los temas
- **El amor** imposible o insatisfecho
- **La muerte**, presente desde el primer verso
- **La frustración** vital: seres marginados (gitanos, negros, mujeres, homosexuales) condenados por un orden que los excluye
- **La infancia perdida** y la naturaleza

### Los símbolos lorquianos

| Símbolo | Significado |
|---|---|
| **La luna** | Muerte |
| **El agua** | Si corre, vida; si está estancada, muerte |
| **La sangre** | Vida derramada, pasión, muerte violenta |
| **El caballo** | Pasión, erotismo, muerte |
| **Los metales** (cuchillo, puñal) | Tragedia, muerte |
| **Las hierbas** | Muerte, cementerio |
| **El verde** | Deseo frustrado, muerte |

### Las obras

**Etapa de síntesis tradición-vanguardia:**
- ***Poema del cante jondo*** (1921): raíz andaluza y flamenca.
- ***Romancero gitano*** (1928): **neopopularismo culto**. Los gitanos como pueblo perseguido y símbolo de libertad frente a la Guardia Civil, encarnación del orden represor. Metáforas audaces sobre molde de romance tradicional.

**Etapa surrealista:**
- ***Poeta en Nueva York*** (escrito 1929-30, publicado 1940): tras su viaje a EE. UU. Verso libre, imágenes violentas e irracionales. Denuncia de la **deshumanización** de la civilización capitalista, la injusticia social y la soledad del hombre en la gran ciudad. Solidaridad con los **negros de Harlem**.

**Etapa final:**
- ***Llanto por Ignacio Sánchez Mejías*** (1935), elegía magistral.
- *Sonetos del amor oscuro* (1935-36).`,
    worked_example_markdown: `**Análisis de un fragmento célebre — "Romance sonámbulo":**

> *"Verde que te quiero verde. / Verde viento. Verdes ramas. / El barco sobre la mar / y el caballo en la montaña."*

**Comentario modelo:**

> *Estos versos iniciales del "Romance sonámbulo", del* **Romancero gitano** *(1928), condensan el arte lorquiano.*
>
> *El **color verde**, repetido en **anáfora** y **poliptoton**, funciona como símbolo polivalente: **deseo frustrado** y a la vez **presagio de muerte**, sentidos que recorren todo el romance. La sinestesia "verde viento" atribuye color a lo incorpóreo, procedimiento de raíz vanguardista.*
>
> *La aparición del **caballo**, símbolo de pasión y de muerte, y del **barco**, anticipa el desenlace trágico, de acuerdo con la técnica lorquiana de **prefiguración**: el final está inscrito desde el comienzo.*
>
> *Formalmente se trata de un **romance**, forma métrica tradicional de versos octosílabos con rima asonante en los pares, sobre la que Lorca injerta **metáforas de audacia vanguardista**. Esa fusión de **molde popular** y **lenguaje nuevo** es precisamente el rasgo que define a la Generación del 27.*

**Nota clave:** siempre conviene cerrar relacionando el texto con **el rasgo general del grupo**. Demuestra que no has memorizado un poema suelto sino que entiendes el movimiento.`,
    practice_prompt: 'Explica el significado de cinco símbolos lorquianos y localiza un ejemplo de cada uno en un poema del "Romancero gitano". Después señala tres diferencias entre "Romancero gitano" y "Poeta en Nueva York" en cuanto a estilo y temática.',
    alert_markdown: '⚠️ **El "Romancero gitano" no es folclore.** Lorca se irritaba con esa lectura: los gitanos son un **símbolo** del ser humano marginado y perseguido, y el libro es una obra de altísima elaboración culta, no una recopilación popular.',
  },

  {
    sort_order: 53,
    title: 'El Teatro de Lorca',
    concept_markdown: `## El teatro lorquiano

Lorca concebía el teatro como *"poesía que se levanta del libro y se hace humana"*. Su obra dramática comparte temas y símbolos con su poesía.

### El tema único
El **conflicto entre el deseo individual (principio de autoridad frente a principio de libertad)** y las normas sociales que lo reprimen. El desenlace es siempre **trágico**: el deseo no se realiza.

### Elementos característicos
- Protagonismo de **mujeres** marginadas o frustradas
- **Símbolos** compartidos con su poesía (luna, agua, sangre, caballo, cuchillo)
- Mezcla de **prosa y verso**
- Elementos **corales** (lavanderas, segadores) de función trágica clásica
- **Presencia constante de la muerte**
- Ambientación **rural andaluza** cargada de intensidad simbólica

### Trayectoria

**1. Primeras obras y farsas:** *Mariana Pineda* (1927), *La zapatera prodigiosa* (1930).

**2. Teatro vanguardista o "imposible":** *El público* (1930), influido por el surrealismo, sobre la libertad amorosa y la propia esencia del teatro.

**3. La trilogía trágica rural** — su cumbre:

| Obra | Año | Conflicto |
|---|---|---|
| ***Bodas de sangre*** | 1933 | La Novia huye con Leonardo el día de su boda; los dos hombres se matan. La **pasión** contra el **honor** y la propiedad |
| ***Yerma*** | 1934 | La **esterilidad** y el ansia frustrada de maternidad; Yerma acaba matando a su marido |
| ***La casa de Bernarda Alba*** | 1936 | Ocho años de **luto** impuesto por la madre a sus cinco hijas; Adela se rebela y se suicida |

***La casa de Bernarda Alba***, terminada dos meses antes de su asesinato, lleva el subtítulo *"drama de mujeres en los pueblos de España"* y prescinde casi del verso: **autoridad** (Bernarda, el bastón) frente a **libertad** (Adela, el verde, el caballo garañón).`,
    worked_example_markdown: `**Pregunta tipo PAU:** *El teatro lorquiano* (suele ir unida al tema de la Generación del 27).

**Esquema de respuesta:**

> *Lorca renueva la escena española concibiendo el teatro como "poesía que se levanta del libro y se hace humana". Su obra dramática gira sobre un **conflicto único**: el enfrentamiento entre el **deseo individual** y las **normas sociales** que lo reprimen, resuelto siempre de forma **trágica**.*
>
> *Sus rasgos son el **protagonismo femenino**, el uso de **símbolos** compartidos con su poesía —la luna como muerte, el agua, la sangre, el caballo—, la alternancia de **prosa y verso**, la presencia de elementos **corales** de raíz clásica y la ambientación **rural andaluza**.*
>
> *Tras unas primeras farsas y un teatro vanguardista "imposible" (*El público*, 1930), alcanza su cumbre en la **trilogía trágica rural**:* **Bodas de sangre** *(1933), donde la pasión de la Novia y Leonardo choca con el código del honor;* **Yerma** *(1934), sobre el ansia frustrada de maternidad; y* **La casa de Bernarda Alba** *(1936), "drama de mujeres en los pueblos de España", donde el luto tiránico impuesto por Bernarda conduce al suicidio de Adela.*
>
> *En esta última, la oposición entre **autoridad** —el bastón de Bernarda, el "¡Silencio!" final— y **libertad** —Adela, el vestido verde, el caballo garañón— resume el conflicto de todo su teatro.*

**Detalle que suma:** la obra se termina en junio de 1936 y Lorca es asesinado en agosto. Nunca la vio representada.`,
    practice_prompt: 'Explica el conflicto central de "La casa de Bernarda Alba" identificando qué personajes encarnan la autoridad y cuáles la libertad. Señala tres símbolos de la obra y su significado.',
    alert_markdown: '⚠️ **La trilogía rural son tres obras: "Bodas de sangre", "Yerma" y "La casa de Bernarda Alba".** Es un error habitual incluir *Doña Rosita la soltera* o *La zapatera prodigiosa*, que son de otra línea.',
  },

  {
    sort_order: 54,
    title: 'La Poesía de 1939 a la Actualidad',
    concept_markdown: `## Las etapas de la poesía de posguerra

Tras la guerra, el panorama queda roto: **Lorca ha muerto**, muchos poetas están en el **exilio** y **Miguel Hernández** —el "genial epígono" del 27— muere en prisión en 1942 (*El rayo que no cesa*, 1936; *Cancionero y romancero de ausencias*, póstumo).

### Años 40 — dos líneas opuestas

| | **Poesía arraigada** | **Poesía desarraigada** |
|---|---|---|
| **Revista** | *Escorial*, *Garcilaso* | *Espadaña* |
| **Visión** | Mundo ordenado y armónico | Mundo **caótico y angustioso** |
| **Temas** | Amor, paisaje, sentimiento religioso sereno | Angustia existencial, Dios ausente, desesperación |
| **Forma** | **Soneto**, métrica clásica (*garcilasismo*) | Verso libre, lenguaje áspero |
| **Autores** | Luis Rosales, Leopoldo Panero | **Dámaso Alonso**, Blas de Otero |
| **Obra clave** | *La casa encendida* (Rosales) | ***Hijos de la ira*** (1944) |

### Años 50 — la poesía social
La poesía se concibe como **instrumento de transformación**: se dirige "**a la inmensa mayoría**" (Blas de Otero), con lenguaje sencillo y temas colectivos: España, la injusticia, el trabajo.
> **Blas de Otero**: *Pido la paz y la palabra* (1955). **Gabriel Celaya**: *Cantos iberos* (1955), con el verso *"la poesía es un arma cargada de futuro"*. **José Hierro**.

### Años 60 — la generación del medio siglo
Reacción contra el prosaísmo social. Vuelven la **experiencia personal**, la infancia, el amor y la amistad, con **escepticismo** e **ironía** y mayor cuidado del lenguaje.
> **Jaime Gil de Biedma**, **Ángel González**, **José Ángel Valente**, **Claudio Rodríguez**, **Francisco Brines**.

### Años 70 — los novísimos
Antología ***Nueve novísimos poetas españoles*** (1970) de **Castellet**. **Culturalismo**, referencias a los medios de masas (cine, cómic), **experimentación** formal, esteticismo y desdén por el realismo. **Pere Gimferrer**, **Guillermo Carnero**, **Leopoldo María Panero**.

### De 1980 a hoy — la poesía de la experiencia
Vuelta a la **claridad**, al tono conversacional y a la anécdota cotidiana en un marco urbano. **Luis García Montero**, **Felipe Benítez Reyes**. Conviven con la **poesía del silencio**, minimalista y esencial, y con voces como **Ana Rossetti** o **Blanca Andreu**.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *La poesía de 1939 hasta la actualidad. Tendencias, autores y obras principales.*

**El esquema cronológico, que es lo que se puntúa:**

> ***Años 40.*** *La guerra rompe el panorama poético. Se distinguen dos líneas: la **poesía arraigada** de la revista* Garcilaso*, que ofrece una visión serena y ordenada del mundo en métrica clásica (**Luis Rosales**,* La casa encendida*), y la **poesía desarraigada**, que expresa la angustia existencial ante un mundo caótico, inaugurada por* **Hijos de la ira** *de **Dámaso Alonso** (1944).*
>
> ***Años 50.*** *La **poesía social** concibe el poema como herramienta de denuncia, dirigida "a la inmensa mayoría". **Blas de Otero** publica* Pido la paz y la palabra *(1955) y **Gabriel Celaya** proclama que "la poesía es un arma cargada de futuro".*
>
> ***Años 60.*** *La **generación del medio siglo** recupera la experiencia personal y el rigor verbal, con ironía y escepticismo: **Jaime Gil de Biedma**, **Ángel González**, **Claudio Rodríguez**.*
>
> ***Años 70.*** *Los **novísimos**, reunidos por **Castellet** en 1970, practican el **culturalismo**, la experimentación y el esteticismo: **Pere Gimferrer**.*
>
> ***De 1980 a hoy.*** *Predomina la **poesía de la experiencia**, de tono conversacional y ambiente urbano (**Luis García Montero**), junto a la poesía del silencio y a nuevas voces femeninas.*

**Truco:** una **frase por década** con **un autor y una obra**. Eso ya es un tema completo.`,
    practice_prompt: 'Explica la diferencia entre poesía arraigada y desarraigada en los años 40 citando una obra de cada una. Después resume en una frase el rasgo definitorio de la poesía social, los novísimos y la poesía de la experiencia.',
    alert_markdown: '⚠️ **Miguel Hernández no es del 27 ni de la generación del 36 exactamente.** Se le suele llamar "genial epígono del 27". Murió en la cárcel de Alicante en 1942 y su *Cancionero y romancero de ausencias* es póstumo.',
  },

  {
    sort_order: 55,
    title: 'La Novela Española de 1939 a 1974',
    concept_markdown: `## Las tres etapas

Es, junto al 27, **el tema más repetido** en la PAU de Madrid.

### Años 40 — la novela existencial y el tremendismo
Refleja la **amargura y la desorientación** de la posguerra: personajes marginados, angustia, violencia, frustración.

- ***La familia de Pascual Duarte*** (1942), de **Camilo José Cela**: inaugura el **tremendismo**, caracterizado por la acumulación de episodios violentos y desagradables, personajes brutales y determinismo del medio. Pascual Duarte narra desde la cárcel, en primera persona, la cadena de crímenes de su vida.
- ***Nada*** (1945), de **Carmen Laforet**: Premio Nadal. Andrea llega a la Barcelona de posguerra y encuentra una familia degradada. **Novela existencial**.
- ***La sombra del ciprés es alargada*** (1948), de **Miguel Delibes**.

### Años 50 — el realismo social
La novela se convierte en **testimonio y denuncia** de la injusticia. Rasgos:
- **Protagonista colectivo**
- **Concentración espacial y temporal** (a menudo pocas horas)
- **Objetivismo**: el narrador se limita a registrar, como una cámara
- Predominio del **diálogo**; lenguaje sencillo

> ***La colmena*** (1951), de **Cela**: más de 300 personajes en el Madrid de 1943; estructura fragmentaria en secuencias; protagonista colectivo.
> ***El Jarama*** (1955), de **Rafael Sánchez Ferlosio**: un domingo de once jóvenes junto al río; objetivismo radical.
> **Ana María Matute**, **Juan Goytisolo**, **Delibes** (*El camino*, 1950).

### Años 60 — la novela experimental
Agotado el realismo social, se renueva la **forma**. Rasgos:
- Ruptura de la **linealidad temporal**; saltos, contrapunto
- **Monólogo interior** y segunda persona narrativa
- Desaparición del capítulo tradicional (**secuencias**)
- Desorden sintáctico, ausencia de puntuación

> ***Tiempo de silencio*** (1962), de **Luis Martín-Santos**: obra clave que abre la etapa. Pedro, joven investigador, se ve arrastrado a una tragedia en el Madrid de los suburbios. Ironía, digresiones ensayísticas, lenguaje culto y científico.
> ***Cinco horas con Mario*** (1966), de **Delibes**: monólogo de Carmen ante el cadáver de su marido; retrato de las dos Españas.
> ***Volverás a Región*** (1967), de **Juan Benet**.`,
    worked_example_markdown: `**Pregunta real de PAU 2026:** *El fragmento pertenece a* La familia de Pascual Duarte *(1942), de Camilo José Cela. Escriba cuatro rasgos de la novela tremendista y ejemplifique, con citas, su presencia en el texto.*

**Respuesta modelo:**

> *El **tremendismo** es la corriente inaugurada por Cela en esta novela, caracterizada por la presentación cruda y descarnada de los aspectos más desagradables de la realidad. En el fragmento se aprecian cuatro rasgos:*
>
> ***1. Violencia y brutalidad como algo cotidiano.*** *El maltrato se narra sin dramatismo, como rutina: "nos pegaba a mi madre y a mí las grandes palizas por cualquier cosa".*
>
> ***2. Personajes primarios y degradados.*** *El padre aparece animalizado y reducido a su corpulencia y su furia: "alto y gordo como un monte", "cuando se enfurecía, cosa que le ocurría con mayor frecuencia de lo que se necesitaba".*
>
> ***3. Determinismo del medio.*** *El ambiente familiar condiciona el destino criminal del protagonista, anticipado desde la primera línea: "De mi niñez no son precisamente buenos recuerdos los que guardo".*
>
> ***4. Narración autobiográfica en primera persona con tono desgarrado.*** *Pascual escribe desde la cárcel, y el lenguaje popular y directo choca con lo terrible de lo narrado, como en la exclamación final: "¡Se tienen las carnes muy tiernas a tan corta edad!".*

**El método:** cada rasgo → **nombre técnico** → **cita literal entre comillas**. Sin citas, la respuesta no vale.`,
    practice_prompt: 'Explica las tres etapas de la novela de 1939 a 1974 con dos obras fechadas de cada una. Después define tremendismo, realismo social y novela experimental en una frase cada uno.',
    alert_markdown: '⚠️ ***Tiempo de silencio* (1962) es la obra bisagra.** Marca el fin del realismo social y el inicio de la experimentación. Si te preguntan por la novela de los sesenta, tiene que aparecer sí o sí.',
  },

  {
    sort_order: 56,
    title: 'La Novela Española de 1975 a la Actualidad',
    concept_markdown: `## El cambio de rumbo

Con la muerte de Franco (1975) y el fin de la censura, la novela **abandona el experimentalismo** de los sesenta, que había llegado a hacerla ilegible, y **recupera el interés por contar historias**: vuelven la trama, el personaje y el lector.

### La obra que marca el giro
***La verdad sobre el caso Savolta*** (1975), de **Eduardo Mendoza**: mezcla novela policíaca, histórica y experimental. Suele considerarse el punto de partida de la narrativa democrática.

### Las tendencias

| Tendencia | Rasgos | Autores y obras |
|---|---|---|
| **Novela histórica** | Reconstrucción documentada del pasado | *El hereje* (Delibes, 1998); Arturo Pérez-Reverte |
| **Novela policíaca y negra** | Investigación como radiografía social | **Manuel Vázquez Montalbán**, serie **Carvalho** |
| **Metanovela** | La novela reflexiona sobre sí misma | *Beatus Ille* (Muñoz Molina, 1986) |
| **Novela intimista** | Búsqueda personal, memoria, sentimientos | *La lluvia amarilla* (Llamazares, 1988) |
| **Memoria histórica** | Guerra Civil y posguerra revisitadas | *Soldados de Salamina* (Cercas, 2001); *La voz dormida* (Dulce Chacón, 2002) |
| **Novela de la experiencia urbana** | Vida contemporánea, generación joven | *Historias del Kronen* (Mañas, 1994) |

### Autores consolidados
**Eduardo Mendoza** (*La ciudad de los prodigios*, 1986), **Antonio Muñoz Molina** (*El jinete polaco*, 1991), **Javier Marías** (*Corazón tan blanco*, 1992), **Almudena Grandes** (*Episodios de una guerra interminable*), **Rosa Montero**, **Javier Cercas**, **Enrique Vila-Matas**.

### Rasgos generales
- **Eclecticismo**: conviven todas las tendencias sin una dominante
- Vuelta a la **narratividad** y al gusto por contar
- **Individualismo**: no hay grupos ni manifiestos
- Influencia del **mercado editorial** y de los premios
- Incorporación plena de **autoras** al canon`,
    worked_example_markdown: `**Pregunta tipo PAU:** *La novela española de 1975 a finales del siglo XX. Tendencias, autores y obras principales.*

**Esquema de respuesta:**

> *La desaparición de la censura tras 1975 y el agotamiento del experimentalismo de los sesenta provocan un giro decisivo: la novela **recupera el placer de narrar**, con tramas reconocibles y personajes definidos. Suele señalarse como punto de partida* **La verdad sobre el caso Savolta** *(1975) de **Eduardo Mendoza**.*
>
> *El rasgo dominante es el **eclecticismo**: conviven múltiples tendencias sin que ninguna se imponga.*
>
> *La **novela histórica** reconstruye el pasado con documentación rigurosa, como* El hereje *(1998) de **Delibes**. La **novela policíaca** utiliza la investigación como radiografía social, según muestra la serie del detective Carvalho de **Vázquez Montalbán**. La **metanovela** reflexiona sobre la propia escritura en* Beatus Ille *(1986) de **Muñoz Molina**. La **novela intimista** explora la memoria y la soledad en* La lluvia amarilla *(1988) de **Llamazares**.*
>
> *Ya en el cambio de siglo cobra fuerza la **recuperación de la memoria histórica**, con* **Soldados de Salamina** *(2001) de **Javier Cercas** y* La voz dormida *(2002) de **Dulce Chacón**.*
>
> *Caracteriza además a este periodo la **incorporación plena de las escritoras** al centro del canon y el peso creciente del **mercado editorial** en la difusión de la novela.*`,
    practice_prompt: 'Enumera cinco tendencias de la novela española desde 1975 y cita una obra fechada representativa de cada una. Explica por qué "La verdad sobre el caso Savolta" se considera el punto de inflexión.',
    alert_markdown: null,
  },

  {
    sort_order: 57,
    title: 'El Teatro de 1939 a la Actualidad',
    concept_markdown: `## El teatro de posguerra

La guerra dejó el teatro sin sus grandes renovadores: **Valle-Inclán** y **Lorca** habían muerto; **Alberti** y **Max Aub**, exiliados. Además, el teatro depende de **empresarios y censura**, lo que lo hace el género más condicionado.

### Años 40 — teatro comercial y humor renovador
- **Comedia burguesa** de evasión y **teatro de humor**.
- **Miguel Mihura**: ***Tres sombreros de copa*** (escrita en **1932**, estrenada en **1952**). Humor absurdo e inverosímil que **anticipa el teatro europeo del absurdo**. Dionisio, la noche antes de su boda, conoce a Paula y descubre otra vida posible; finalmente se somete a la convención.
- **Enrique Jardiel Poncela**: *Eloísa está debajo de un almendro* (1940).

### Años 50 — teatro existencial y social
- **Antonio Buero Vallejo**: ***Historia de una escalera*** (1949), obra clave. Tres generaciones que fracasan en el mismo rellano; el espacio como símbolo de la **imposibilidad de ascenso social**. Su teatro es **posibilista**: acepta la censura para poder estrenar y hacer llegar la crítica. Otras obras: *El tragaluz* (1967), *La fundación* (1974).
- **Alfonso Sastre**: teatro **imposibilista**, de denuncia radical; apenas se estrena (*Escuadra hacia la muerte*, 1953).

### Años 60-70 — teatro experimental y vanguardista
Simbolismo, ruptura de la escena tradicional, influencia del absurdo y de Artaud.
- **Fernando Arrabal**: teatro "**pánico**" (*El cementerio de automóviles*).
- **Francisco Nieva**.
- **Grupos independientes**: **Els Joglars**, **Els Comediants**, **Tábano**, **La Cuadra**, que trabajan con creación colectiva.

### De 1975 a hoy
Recuperación de autores prohibidos, auge de los **festivales** y del teatro público (Centro Dramático Nacional, Compañía Nacional de Teatro Clásico).
- **José Luis Alonso de Santos**: ***Bajarse al moro*** (1985), comedia de la movida madrileña.
- **José Sanchis Sinisterra**: ***¡Ay, Carmela!*** (1987), memoria de la Guerra Civil.
- **Juan Mayorga**, dramaturgo de referencia actual (*Himmelweg*, *El chico de la última fila*).`,
    worked_example_markdown: `**Pregunta tipo PAU:** *El teatro de 1939 hasta la actualidad. Tendencias, autores y obras principales.*

**Esquema de respuesta:**

> *El teatro de posguerra parte de una situación excepcionalmente adversa: muertos Valle-Inclán y Lorca y exiliados Alberti y Max Aub, el género queda sometido además a la **censura** y a las exigencias comerciales de los empresarios.*
>
> *En los **años 40** predomina la **comedia de evasión**, aunque el **teatro de humor** aporta una renovación real: **Miguel Mihura** escribe en 1932* **Tres sombreros de copa***, cuyo humor absurdo anticipa en dos décadas el teatro europeo del absurdo, si bien no se estrena hasta 1952.*
>
> *Los **años 50** traen el **teatro existencial y social**. **Antonio Buero Vallejo** inaugura la etapa con* **Historia de una escalera** *(1949), donde tres generaciones fracasan en el mismo espacio, símbolo de la imposibilidad de progreso. Buero practica un teatro **posibilista**, que acepta los límites de la censura para poder estrenar, frente al **imposibilismo** de **Alfonso Sastre**, cuya denuncia radical le impide llegar a escena.*
>
> *En los **años 60 y 70** se desarrolla un **teatro experimental** —el teatro "pánico" de **Fernando Arrabal**— y surgen los **grupos independientes** (Els Joglars, Els Comediants) con la creación colectiva.*
>
> *Tras 1975 se recuperan los autores prohibidos y se consolida el teatro público. Destacan* **Bajarse al moro** *(1985) de **Alonso de Santos**,* **¡Ay, Carmela!** *(1987) de **Sanchis Sinisterra** y, ya en el siglo XXI, la obra de **Juan Mayorga**.*

**Concepto que siempre puntúa:** la oposición **posibilismo (Buero) / imposibilismo (Sastre)**.`,
    practice_prompt: 'Explica la polémica entre el posibilismo de Buero Vallejo y el imposibilismo de Alfonso Sastre. Después ordena cronológicamente y fecha estas obras: "Historia de una escalera", "Tres sombreros de copa" (escritura y estreno), "Bajarse al moro" y "¡Ay, Carmela!".',
    alert_markdown: '⚠️ **Cuidado con las dos fechas de "Tres sombreros de copa":** escrita en **1932**, estrenada en **1952**. Es el dato que más se pregunta de Mihura, precisamente porque demuestra que se adelantó al absurdo europeo.',
  },

  {
    sort_order: 58,
    title: 'La Literatura Hispanoamericana del Siglo XX',
    concept_markdown: `## La poesía hispanoamericana

Tras el Modernismo de **Rubén Darío**, la poesía americana se renueva con las vanguardias:
- **César Vallejo** (Perú): *Trilce* (1922), *Poemas humanos*. Ruptura del lenguaje, dolor humano.
- **Pablo Neruda** (Chile): *Veinte poemas de amor y una canción desesperada* (1924), *Residencia en la tierra* (surrealista), *Canto general* (1950), de compromiso americanista. **Nobel 1971**.
- **Octavio Paz** (México): *Libertad bajo palabra*, *El laberinto de la soledad* (ensayo, 1950). **Nobel 1990**.

## La narrativa: del regionalismo al *boom*

### 1. Novela regionalista (años 20-30)
La naturaleza americana como protagonista y fuerza que devora al hombre.
> *La vorágine* (Rivera), *Doña Bárbara* (Gallegos, 1929), *Don Segundo Sombra* (Güiraldes).

### 2. Renovación y realismo mágico (años 40-50)
Se incorporan las técnicas europeas y norteamericanas y lo fantástico se integra en lo cotidiano.
- **Jorge Luis Borges** (Argentina): *Ficciones* (1944), *El Aleph* (1949). Cuento intelectual, laberintos, espejos, biblioteca infinita, tiempo circular.
- **Alejo Carpentier** (Cuba): teoriza **"lo real maravilloso"** (*El reino de este mundo*, 1949).
- **Juan Rulfo** (México): *El llano en llamas* (1953) y ***Pedro Páramo*** (1955), donde Comala es un pueblo habitado por muertos.
- **Miguel Ángel Asturias**, **Ernesto Sábato**.

### 3. El *boom* (años 60)
Explosión internacional de la narrativa hispanoamericana. Rasgos:
- **Realismo mágico**: lo maravilloso se narra con naturalidad, sin extrañeza
- **Experimentación**: ruptura temporal, cambio de narradores, monólogo interior
- Fusión de lo **local** y lo **universal**
- Riqueza y libertad del lenguaje

> ***Cien años de soledad*** (1967), de **Gabriel García Márquez** (Colombia, **Nobel 1982**): siete generaciones de los Buendía en **Macondo**, síntesis del realismo mágico.
> ***Rayuela*** (1963), de **Julio Cortázar** (Argentina): novela de lectura no lineal, con dos itinerarios posibles.
> ***La ciudad y los perros*** (1963) y *La casa verde*, de **Mario Vargas Llosa** (Perú, **Nobel 2010**).
> **Carlos Fuentes** (*La muerte de Artemio Cruz*, 1962).`,
    worked_example_markdown: `**Pregunta tipo PAU:** *La literatura hispanoamericana contemporánea: poesía después de las vanguardias, la novela regionalista y el boom.*

**Esquema de respuesta:**

> *La literatura hispanoamericana del siglo XX pasa de ser periférica a ocupar el centro de la literatura en español.*
>
> *En **poesía**, tras el Modernismo, **César Vallejo** rompe el lenguaje en* Trilce *(1922) para expresar el dolor humano, y **Pablo Neruda** recorre desde el intimismo de* Veinte poemas de amor *(1924) hasta el compromiso americanista de* Canto general *(1950). **Octavio Paz** aúna poesía y ensayo.*
>
> *En **narrativa** se distinguen tres momentos. La **novela regionalista** de los años veinte presenta la naturaleza como protagonista devoradora (*Doña Bárbara*, 1929). Hacia los cuarenta, la **renovación** incorpora técnicas europeas y lo fantástico: **Borges** crea en* Ficciones *(1944) un cuento intelectual de laberintos y espejos; **Carpentier** teoriza "lo real maravilloso"; y **Juan Rulfo** publica* **Pedro Páramo** *(1955), donde Comala está habitada por muertos.*
>
> *En los años sesenta se produce el **boom**, con su rasgo definitorio, el **realismo mágico**: lo maravilloso se narra con absoluta naturalidad. Su obra emblemática es* **Cien años de soledad** *(1967) de **García Márquez**, historia de siete generaciones en Macondo. Junto a ella,* **Rayuela** *(1963) de **Cortázar**, con su estructura de lectura no lineal, y* La ciudad y los perros *de **Vargas Llosa**.*

**Definición que hay que saber dar:** el **realismo mágico** no es fantasía, sino la presentación de lo extraordinario **como si fuera cotidiano**, sin que narrador ni personajes se sorprendan.`,
    practice_prompt: 'Define el realismo mágico y diferéncialo de "lo real maravilloso" de Carpentier. Después cita tres autores del boom con una obra fechada de cada uno y explica un rasgo formal innovador de "Rayuela".',
    alert_markdown: null,
  },

  {
    sort_order: 59,
    title: 'El Comentario de un Fragmento Literario (Pregunta 3.1)',
    concept_markdown: `## La pregunta 3.1

Te dan un **fragmento** (poema, pasaje de novela o de teatro) con su autor y obra identificados, y te piden una tarea concreta: normalmente **relacionarlo con los rasgos del movimiento** o **interpretar una imagen**.

### Lo que NO es
No es un comentario libre ni un análisis métrico exhaustivo. **Se responde exactamente lo que se pregunta.**

### El método en cuatro pasos

**1. Sitúa el fragmento**
Una frase: autor, obra, fecha y **corriente**.
> *"El fragmento pertenece a* Hijos de la ira *(1944), de Dámaso Alonso, obra que inaugura la poesía desarraigada de posguerra."*

**2. Identifica lo que te piden**
Si piden "cuatro rasgos", da **exactamente cuatro**, numerados.

**3. Cita siempre**
Cada afirmación va acompañada de una **cita literal entre comillas**. Sin cita, no puntúa.

**4. Interpreta**
Explica **qué efecto** produce cada rasgo y **cómo se relaciona** con el sentido global de la obra.

### La plantilla de cada rasgo
> ***[Nombre del rasgo].*** *[Explicación de en qué consiste]. Se observa en "[cita literal]", donde [interpretación del efecto].*

### Si te piden extensión
Los modelos recientes fijan **200 palabras**. Respétalas.`,
    worked_example_markdown: `**Pregunta:** *Escriba cuatro rasgos de la novela tremendista y ejemplifique, con citas, su presencia en el texto* (fragmento de *La familia de Pascual Duarte*).

**Cómo se aplica la plantilla:**

> ***[Situación]*** *El fragmento pertenece a* La familia de Pascual Duarte *(1942), de Camilo José Cela, novela que inaugura el **tremendismo** en la narrativa de posguerra.*
>
> ***1. Presentación cruda de la violencia.*** *El tremendismo acumula episodios desagradables narrados sin atenuación. Se observa en "nos pegaba a mi madre y a mí las grandes palizas por cualquier cosa", donde el maltrato se refiere como hecho rutinario, sin indignación, lo que intensifica su crudeza.*
>
> ***2. Personajes primarios y animalizados.*** *Los seres humanos quedan reducidos a impulsos elementales: el padre es "alto y gordo como un monte", símil que lo despoja de rasgos morales para dejar solo la masa física.*
>
> ***3. Determinismo del medio.*** *El ambiente condiciona el destino del protagonista, anticipado ya en "De mi niñez no son precisamente buenos recuerdos los que guardo", que instala desde el inicio la fatalidad.*
>
> ***4. Narrador autobiográfico de lenguaje popular.*** *Pascual escribe desde la cárcel con expresión llana y giros coloquiales, como en la exclamación "¡Se tienen las carnes muy tiernas a tan corta edad!", cuyo contraste entre ternura y brutalidad define el tono de la obra.*

**Cuenta:** cuatro rasgos, cuatro citas, cuatro interpretaciones. Eso es el 2 completo.`,
    practice_prompt: 'Coge un fragmento de cualquier obra que hayas leído y aplica la plantilla: sitúalo en una frase y desarrolla cuatro rasgos de su movimiento, cada uno con nombre técnico, cita literal e interpretación del efecto.',
    alert_markdown: '⚠️ **Responde exactamente lo que se pregunta.** Si piden cuatro rasgos, dar tres deja un cuarto de la nota sin recoger; dar ocho mal explicados puntúa menos que cuatro bien desarrollados con sus citas.',
  },

  {
    sort_order: 60,
    title: 'Cómo Comentar la Obra Leída (Preguntas 3.3 y 3.4)',
    concept_markdown: `## Las preguntas de la obra leída (1 punto)

> *3.3. Comente los aspectos más relevantes de la **obra española que haya leído escrita entre 1875 y 1936**, en relación con su contexto sociohistórico y la tradición literaria.*
> *3.4. Ídem, escrita **entre 1937 y 1974**.*

**Dato clave:** **no hay lista cerrada de lecturas obligatorias**. Eliges tú la obra, siempre que sea **española** y esté dentro del **rango de fechas**. Se responde **una de las dos**.

### Lo que se valora
El enunciado marca las tres cosas que hay que tratar:
1. **Aspectos relevantes** de la obra (temas, personajes, estructura, estilo)
2. **Contexto sociohistórico** en que se escribe
3. **Tradición literaria** a la que pertenece o con la que dialoga

### La estructura de respuesta
> **[1 frase]** Obra, autor, fecha y género.
> **[2-3 frases]** Argumento y **temas principales**.
> **[2 frases]** **Contexto sociohistórico**: qué ocurría en España y cómo se refleja.
> **[2 frases]** **Tradición literaria**: movimiento, rasgos que comparte, influencias.
> **[1 frase]** Valoración o trascendencia.

### Obras rentables por periodo

**1875-1936:** *San Manuel Bueno, mártir* (Unamuno, 1931), *La tía Tula* (1921), *El árbol de la ciencia* (Baroja, 1911), *Luces de bohemia* (Valle-Inclán, 1920), *La Regenta* (Clarín, 1884), *Los pazos de Ulloa* (Pardo Bazán, 1886), *Romancero gitano* (Lorca, 1928).

**1937-1974:** *La familia de Pascual Duarte* (Cela, 1942), *Nada* (Laforet, 1945), *La colmena* (Cela, 1951), *El Jarama* (Sánchez Ferlosio, 1955), *Historia de una escalera* (Buero, 1949), *Cinco horas con Mario* (Delibes, 1966), *Tiempo de silencio* (Martín-Santos, 1962), *Hijos de la ira* (Dámaso Alonso, 1944).

⚠️ **La casa de Bernarda Alba** se termina en **1936**: úsala para 3.3, no para 3.4.`,
    worked_example_markdown: `**Respuesta modelo (obra del periodo 1937-1974) — 200 palabras:**

> ***Historia de una escalera***, *drama en tres actos de **Antonio Buero Vallejo** estrenado en **1949**, supone el punto de partida del teatro español de posguerra comprometido.*
>
> ***Aspectos relevantes.*** *La obra presenta a tres generaciones de vecinos de un mismo inmueble a lo largo de treinta años. Fernando y Urbano sueñan con prosperar y salir de allí, pero el tercer acto muestra a sus hijos repitiendo palabra por palabra las promesas de sus padres. El tema central es la **frustración** y la imposibilidad de progreso; la **escalera**, espacio único, funciona como símbolo de un destino cerrado del que nadie escapa.*
>
> ***Contexto sociohistórico.*** *Se estrena en plena posguerra, en una España de miseria material, inmovilismo social y férrea censura. Buero practica un teatro **posibilista**: acepta los límites impuestos para poder estrenar y hacer llegar al público, de forma velada, una crítica que de otro modo habría sido silenciada.*
>
> ***Tradición literaria.*** *Enlaza con el drama social europeo de Ibsen y Chéjov y recupera la línea del teatro de compromiso truncada por la guerra, la de Valle-Inclán y Lorca. Su estreno inaugura la renovación de la escena española y marca el camino del teatro existencial y social de los años cincuenta.*

**Fíjate:** los tres apartados del enunciado aparecen **explícitamente marcados**. El corrector los busca.`,
    practice_prompt: 'Elige una obra de cada periodo (1875-1936 y 1937-1974) y redacta para cada una una respuesta de 200 palabras que cubra los tres apartados: aspectos relevantes, contexto sociohistórico y tradición literaria.',
    alert_markdown: '⚠️ **No cuentes el argumento entero.** Es el error más frecuente: resumir la trama consume las 200 palabras y deja sin tratar el contexto y la tradición, que son dos tercios de lo que se pregunta.',
  },
]

const BATCH_SIZE = 20

async function main() {
  console.log(`Insertando ${cards.length} tarjetas del Bloque 3 (${BLOCK_KEY})…`)

  for (let i = 0; i < cards.length; i += BATCH_SIZE) {
    const batch = cards.slice(i, i + BATCH_SIZE)
    const rows = batch.map(c => ({
      subject: SUBJECT,
      block_key: BLOCK_KEY,
      block_slug: BLOCK_SLUG,
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
      console.error('Error en batch:', error)
      process.exit(1)
    }
    console.log(`✓ Insertadas tarjetas ${i + 1}–${Math.min(i + BATCH_SIZE, cards.length)}`)
  }

  const { count, error: countErr } = await supabase
    .from('curriculum_content_v2')
    .select('*', { count: 'exact', head: true })
    .eq('subject', SUBJECT)

  if (countErr) console.error('Error al contar:', countErr)
  else console.log(`\n✅ Bloque 3 insertado. Total filas ${SUBJECT} en tabla: ${count}`)
}

main()
