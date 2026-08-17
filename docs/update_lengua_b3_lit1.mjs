// Uso: node --env-file=.env.local docs/update_lengua_b3_lit1.mjs
//
// REESCRITURA en profundidad de las misiones 42-50 (Educación literaria).
//
// Motivo: la primera versión tenía ~1.400 caracteres de teoría por tarjeta y
// dedicaba el "caso guiado" a explicar CÓMO responder el examen en vez de
// desarrollar la materia. Medido contra Historia de España (1.811 de media,
// 3.677 el máximo), Lengua se quedaba corta y además invertía la proporción:
// casi tanto método como contenido.
//
// Esta versión sigue el modelo de Historia: apuntes extensos de verdad en
// concept_markdown, un ejemplo desarrollado y comentado en
// worked_example_markdown, y un "inténtalo" en practice_prompt.
//
// Alcance calibrado sobre el temario EvAU de literatura al uso en Madrid
// (8 temas: Modernismo y 98 / Novecentismo y Vanguardias / Poesía del 27 /
// Teatro anterior a 1939 / Novela 1939-1974 / Teatro 1939-XX / Poesía 1939-XX /
// Novela 1975-XX) y sobre la frecuencia real en los 45 exámenes oficiales.

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY
)

const SUBJECT = 'lengua'

const cards = [
  {
    sort_order: 42,
    title: 'El Realismo y el Naturalismo',
    concept_markdown: `## Contexto histórico y cultural

La segunda mitad del siglo XIX en España está marcada por el reinado de **Isabel II**, la revolución de 1868 (**La Gloriosa**), el **Sexenio Democrático** (1868-1874) y la **Restauración borbónica** a partir de 1875. Es el momento del ascenso definitivo de la **burguesía** como clase dominante y del enfrentamiento entre dos Españas: la **tradicional y católica** frente a la **liberal y progresista**. Ese conflicto ideológico atraviesa toda la novela del periodo.

En lo intelectual dominan tres corrientes:
- El **positivismo** de Comte: solo es válido el conocimiento basado en la observación y la experiencia.
- El **evolucionismo** de Darwin.
- El **krausismo**, que en España impulsa la **Institución Libre de Enseñanza** (1876) de Giner de los Ríos, defensora de la educación laica y la reforma social.

## El Realismo: características

El Realismo reacciona contra la **subjetividad y el escapismo románticos** y se propone reflejar la realidad contemporánea de forma objetiva.

**1. Observación y documentación.** El escritor toma apuntes del natural, se documenta sobre los ambientes que va a describir. Galdós recorría los barrios de Madrid libreta en mano.

**2. Verosimilitud.** Los personajes, espacios y conflictos son **contemporáneos y reconocibles**: Madrid, Vetusta (trasunto de Oviedo), la burguesía, el clero, el pueblo llano.

**3. Narrador omnisciente.** Conoce el pasado, el presente y hasta los pensamientos de los personajes. Interviene con frecuencia para juzgarlos o ironizar sobre ellos.

**4. Descripción minuciosa** de ambientes, interiores, vestimentas y costumbres, con función caracterizadora: el espacio explica al personaje.

**5. Análisis psicológico.** Se penetra en la conciencia de los personajes, para lo que se emplean el **estilo indirecto libre** (la voz del narrador se contagia de la del personaje) y el **monólogo interior** incipiente.

**6. Intención crítica.** La novela se convierte en instrumento de análisis y denuncia social: la hipocresía, el fanatismo religioso, el caciquismo, la situación de la mujer.

**7. Estilo sobrio**, alejado de la retórica romántica, con reproducción del habla según la clase social del personaje.

## El Naturalismo

Radicalización del Realismo formulada por el francés **Émile Zola** en *La novela experimental* (1880). Añade:

- **Determinismo**: el ser humano no es libre; su conducta está determinada por la **herencia biológica** y por el **medio social**.
- **Método experimental**: el novelista actúa como un científico que somete a sus personajes a unas condiciones y observa el resultado.
- **Materialismo** y temas sórdidos: alcoholismo, prostitución, enfermedad, miseria, taras hereditarias.
- Protagonistas de las **clases más bajas**.

**En España el Naturalismo se adopta atenuado.** **Emilia Pardo Bazán** lo defiende en *La cuestión palpitante* (1883), pero rechaza el determinismo por incompatible con el libre albedrío de su fe católica: acepta la técnica, no la filosofía.

## Autores y obras

**Benito Pérez Galdós (1843-1920)**, el gran novelista del siglo:
- ***Episodios Nacionales*** (46 novelas en cinco series): la historia de España del XIX novelada.
- **Novelas de tesis** (primera etapa): *Doña Perfecta* (1876), *Gloria*, sobre el fanatismo religioso.
- **Novelas contemporáneas**: ***Fortunata y Jacinta*** (1886-87), su obra maestra, historia de dos mujeres —la burguesa estéril y la mujer del pueblo fecunda— enfrentadas por el mismo hombre, con Madrid como personaje colectivo.
- **Novelas espiritualistas**: *Misericordia* (1897), donde la criada Benina encarna la caridad.

**Leopoldo Alas "Clarín" (1852-1901)**:
- ***La Regenta*** (1884-85), cumbre de la novela española del XIX. Ana Ozores, casada con un regente mucho mayor, se debate entre el magistral don Fermín de Pas y el donjuán Álvaro Mesía en la asfixiante **Vetusta**. Análisis demoledor de la hipocresía provinciana, con extraordinario uso del **estilo indirecto libre**.
- Cuentos: *¡Adiós, Cordera!*

**Emilia Pardo Bazán (1851-1921)**: ***Los pazos de Ulloa*** (1886), decadencia de la aristocracia rural gallega y triunfo de la barbarie sobre la civilización.

**Otros:** **Juan Valera** (*Pepita Jiménez*, 1874, de idealismo psicológico), **José María de Pereda** (regionalismo cántabro), **Vicente Blasco Ibáñez** (*La barraca*, 1898, el más naturalista).

## Poesía y teatro de la segunda mitad del XIX

Frente al esplendor de la novela, ambos géneros son menores. En **poesía**, el **Realismo** produce la poesía prosaica y cívica de **Campoamor** y **Núñez de Arce**, mientras que la línea intimista y simbolista de **Gustavo Adolfo Bécquer** (*Rimas*) y **Rosalía de Castro** anticipa la modernidad. En **teatro**, triunfa el **drama neorromántico** de **José Echegaray**, Nobel en 1904, hoy muy devaluado.`,
    worked_example_markdown: `## Ejemplo guiado: cómo se reconoce el Realismo en un texto

Fragmento del inicio de ***La Regenta*** (1884), de Clarín:

> *"La heroica ciudad dormía la siesta. El viento Sur, caliente y perezoso, empujaba las nubes blanquecinas que se rasgaban al correr hacia el Norte. En las calles no había más ruido que el rumor estridente de los remolinos de polvo, trapos, pajas y papeles que iban de arroyo en arroyo, de acera en acera, de esquina en esquina revolando y persiguiéndose, como mariposas que se buscan y huyen…"*

**Paso 1 — Localiza la ironía del narrador.**
La ciudad se llama "**heroica**" pero lo que hace es "**dormir la siesta**". El adjetivo grandilocuente choca con la acción vulgar: en la primera línea de la novela, el narrador **ya está juzgando** a Vetusta. Esa distancia irónica es marca del narrador omnisciente realista.

**Paso 2 — Observa la descripción con función simbólica.**
No es un paisaje decorativo. El viento "**perezoso**", el polvo, los "trapos, pajas y papeles" componen una imagen de **inmovilidad y basura** que anticipa el retrato moral de la ciudad: una sociedad estancada donde solo circulan desperdicios. El espacio caracteriza a sus habitantes.

**Paso 3 — Identifica el estilo.**
La prosa es **precisa y trabajada** (nótese la enumeración, el paralelismo "de arroyo en arroyo, de acera en acera, de esquina en esquina"), pero **no ornamental**: cada elemento aporta información. El símil final ("como mariposas que se buscan y huyen") es el único adorno, y anticipa el juego de persecuciones amorosas de la trama.

**Paso 4 — Conclusión que se puede escribir en el examen.**
> *El fragmento condensa los rasgos del Realismo: **narrador omnisciente** que se sitúa por encima de lo narrado y lo enjuicia con **ironía**; **descripción minuciosa** con función caracterizadora, pues el ambiente sórdido y detenido prefigura la crítica moral de la sociedad provinciana; y **estilo elaborado pero funcional**, al servicio del análisis y no del ornamento.*

## Cómo se distinguen Realismo y Naturalismo en la práctica

| Pregunta | Si la respuesta es sí… |
|---|---|
| ¿Los personajes podrían haber elegido otra cosa? | **Realismo** (hay libertad moral) |
| ¿Están condenados por su herencia o su ambiente? | **Naturalismo** (determinismo) |
| ¿Aparecen taras hereditarias, alcoholismo, degeneración? | **Naturalismo** |
| ¿La crítica es social e institucional? | **Realismo** |

*Los pazos de Ulloa* es el caso limítrofe: hay ambiente degradante y personajes primarios (naturalismo), pero Pardo Bazán mantiene la responsabilidad moral de sus criaturas (realismo).`,
    practice_prompt: 'Redacta el tema "El Realismo y el Naturalismo: la novela" en 200 palabras. Incluye: contexto (positivismo y burguesía), cinco características del Realismo con su nombre técnico, la diferencia con el Naturalismo, y tres autores con una obra fechada cada uno. Después señala por qué se dice que el Naturalismo español fue "atenuado".',
    alert_markdown: '⚠️ **El Naturalismo español nunca fue ortodoxo.** Pardo Bazán acepta la técnica de Zola (ambientes duros, observación cuasi científica) pero **rechaza el determinismo** porque niega el libre albedrío, incompatible con su catolicismo. Explicar ese matiz distingue una respuesta memorizada de una comprendida.',
  },

  {
    sort_order: 43,
    title: 'El Modernismo',
    concept_markdown: `## Contexto: la crisis de fin de siglo

El siglo XIX termina en España con una **crisis general**: el **Desastre de 1898** supone la pérdida de Cuba, Puerto Rico y Filipinas, últimos restos del imperio. Ante ese hundimiento, los intelectuales reclaman una regeneración del país.

La literatura responde por **dos caminos distintos** que comparten un mismo fondo de inconformismo y voluntad de renovación:
- El **Modernismo**, que opta por la **evasión** y el **esteticismo**.
- La **Generación del 98**, que opta por la **crítica** y la reflexión sobre España.

Ambos conviven y alcanzan su apogeo en las **dos primeras décadas del siglo XX**.

## Qué es el Modernismo

Movimiento de renovación estética que nace en **Hispanoamérica** y llega a España de la mano de **Rubén Darío**, cuyo viaje a Madrid en **1892** resulta decisivo. Supone la **primera renovación profunda del lenguaje poético** en español desde el Siglo de Oro.

Frente al prosaísmo realista y a la retórica romántica tardía, el modernista persigue la **belleza como fin en sí misma**.

## Las dos fuentes francesas

**1. El Parnasianismo** (Théophile Gautier, Leconte de Lisle): culto a la **perfección formal**, "el arte por el arte", temas mitológicos y exóticos, impasibilidad. Aporta al Modernismo su gusto por el mármol, las estatuas, la Grecia clásica y Versalles.

**2. El Simbolismo** (Verlaine, Baudelaire, Rimbaud, Mallarmé): la poesía no describe, **sugiere**. Aporta la **musicalidad**, las **correspondencias** entre sensaciones (**sinestesia**) y el símbolo como vía de conocimiento.

## Características

**1. Búsqueda de la belleza.** El poema aspira a ser un objeto bello. De ahí el léxico exquisito: cisnes, princesas, nenúfares, jardines, pavos reales, mármoles, marfil, oro.

**2. Escapismo.** Rechazo de una realidad burguesa que se considera vulgar, mediante la huida:
- **En el espacio**: Oriente, la Grecia mitológica, Versalles, el París del XVIII.
- **En el tiempo**: Edad Media, Renacimiento, mundos legendarios.

**3. Cosmopolitismo**, con **París** como capital simbólica y el ideal de vida **bohemia**. El poeta se concibe como miembro de una "aristocracia del espíritu", marginado por una sociedad materialista.

**4. Renovación métrica**, quizá su aportación más duradera:
- Recuperación del **alejandrino** (14 sílabas, con hemistiquios de 7).
- Uso del **dodecasílabo** y el **eneasílabo**, muy poco frecuentes antes.
- **Estrofas nuevas** y adaptación de metros clásicos; primeros tanteos de **verso libre**.
- Ritmo muy marcado, a menudo de base acentual.

**5. Riqueza sensorial.** Color, música, perfume y tacto se entrelazan. Abundan la **sinestesia** ("*sonoro marfil*", "*verso azul*"), la **aliteración** y la **adjetivación ornamental**.

**6. Temas.** Junto a la línea **escapista y sensual**, existe una línea **intimista**: melancolía, hastío, angustia ante el paso del tiempo, insatisfacción vital. Esa vertiente íntima, heredada del Romanticismo, es la que enlaza con Machado y Juan Ramón.

**7. Símbolos característicos:** el **cisne** (belleza y misterio, con su cuello en forma de interrogación), el **azul** (el arte, el ideal), el **color** en general, la **tarde**, el **jardín**.

## Autores y obras

**Rubén Darío (1867-1916)**, nicaragüense, figura central:
- ***Azul*** (1888): prosa y verso; se suele fijar aquí el inicio del Modernismo.
- ***Prosas profanas*** (1896): cumbre del **esteticismo** y la evasión. Princesas, cisnes, mitología. Se abre con el célebre "Yo persigo una forma…".
- ***Cantos de vida y esperanza*** (1905): giro hacia lo **grave e intimista**; preocupación existencial, reflexión sobre el destino de los pueblos hispánicos y sobre la propia muerte.

**En España:**
- **Manuel Machado**: *Alma* (1902), que funde modernismo y raíz andaluza.
- **Antonio Machado**: su primer libro, *Soledades* (1903), es **modernismo intimista y simbolista**, no ornamental.
- **Juan Ramón Jiménez**: *Arias tristes* (1903), *Platero y yo* (1914) en la línea sensitiva.
- **Valle-Inclán**: modernismo **en prosa** con las cuatro ***Sonatas*** (1902-1905), memorias del Marqués de Bradomín, "feo, católico y sentimental", de gran refinamiento estilístico, con el amor y la muerte como temas.
- **Teatro poético**: escrito en verso, de temas históricos y tono conservador. **Eduardo Marquina** (*En Flandes se ha puesto el sol*) y los **hermanos Machado** (*La Lola se va a los puertos*).

## Trascendencia

El Modernismo agotó pronto su vertiente ornamental —los propios modernistas la abandonaron—, pero dejó una **renovación del idioma poético** que hizo posible todo lo que vino después: la poesía pura de Juan Ramón, la Generación del 27 y, a través de ella, la lírica contemporánea.`,
    worked_example_markdown: `## Ejemplo guiado: rasgos modernistas en un texto

Fragmento de **"Sonatina"**, de *Prosas profanas* (1896), de Rubén Darío:

> *"La princesa está triste… ¿qué tendrá la princesa?*
> *Los suspiros se escapan de su boca de fresa,*
> *que ha perdido la risa, que ha perdido el color.*
> *La princesa está pálida en su silla de oro,*
> *está mudo el teclado de su clave sonoro,*
> *y en un vaso, olvidada, se desmaya una flor."*

**Paso 1 — La métrica.**
Son **versos alejandrinos** (14 sílabas, con cesura tras la séptima: *"La princesa está triste // ¿qué tendrá la princesa?"*), el metro que el Modernismo recupera y convierte en emblema. Riman en **AABCCB**, formando **sextetos**. La regularidad acentual produce un ritmo casi musical, muy marcado.

**Paso 2 — El escapismo.**
El escenario es un **palacio intemporal**, de cuento: princesa, silla de oro, clave. No hay ninguna referencia a la España de 1896. Es la **huida del presente burgués** hacia un mundo estilizado y aristocrático.

**Paso 3 — El léxico y la sensorialidad.**
Selección de términos **bellos y suntuosos**: *oro*, *fresa*, *clave sonoro*, *flor*. Se combinan lo **visual** (pálida, color, oro), lo **gustativo** ("boca de fresa") y lo **auditivo** ("teclado… sonoro"), en la típica fusión sensorial modernista.

**Paso 4 — Los recursos.**
- **Anáfora y paralelismo**: "que ha perdido la risa, que ha perdido el color".
- **Aliteración** de la /s/ en los dos primeros versos, que imita el suspiro: *"los **s**uspiros **s**e e**s**capan"*.
- **Personificación**: la flor "**se desmaya**", contagiada del desfallecimiento de la princesa.
- **Símbolo**: la flor olvidada y marchita representa a la propia princesa, y por extensión la belleza que se pierde.

**Paso 5 — La línea intimista.**
Bajo el decorado brillante late la **melancolía**: la princesa lo tiene todo y está triste. Esa insatisfacción sin causa aparente —el *spleen*— es el reverso íntimo del Modernismo y lo que impide reducirlo a mera decoración.

**Redacción final para el examen:**
> *El fragmento reúne los rasgos esenciales del Modernismo. En lo **métrico**, emplea el **alejandrino**, verso que el movimiento recupera. En lo **temático**, practica el **escapismo** hacia un mundo palaciego e intemporal, ajeno a la realidad contemporánea. En lo **léxico**, selecciona términos suntuosos y sensoriales (*oro*, *boca de fresa*, *clave sonoro*) que funden lo visual, lo gustativo y lo auditivo. En lo **retórico**, destacan la aliteración de la /s/, que reproduce el suspiro, el paralelismo y la personificación de la flor que "se desmaya", símbolo de la propia princesa. Bajo ese decorado, sin embargo, late la **melancolía**, muestra de la vertiente intimista del movimiento.*`,
    practice_prompt: 'Redacta el tema "El Modernismo: características, autores y obras" en 200 palabras, incluyendo: las dos fuentes francesas, cinco características con su nombre técnico, la renovación métrica y tres autores con una obra fechada. Después localiza en un poema modernista una sinestesia, una aliteración y un verso alejandrino, y explica el efecto de cada uno.',
    alert_markdown: '⚠️ **Modernismo no significa "moderno".** Es un movimiento **esteticista y evasivo** de fin de siglo, con treinta años de anterioridad a las vanguardias y una estética opuesta a ellas: donde el Modernismo busca la belleza ornamental, la vanguardia busca la ruptura. Confundirlos es un error grave.',
  },

  {
    sort_order: 44,
    title: 'La Generación del 98',
    concept_markdown: `## Origen y nómina

El nombre lo acuña **Azorín** en 1913 para referirse al grupo de escritores que llegan a la vida intelectual marcados por el **Desastre de 1898**. Comparten la juventud rebelde, el rechazo de la sociedad de la Restauración y, sobre todo, una **preocupación obsesiva por España**.

**Nómina:** **Miguel de Unamuno**, **Pío Baroja**, **Azorín** (José Martínez Ruiz), **Antonio Machado**, **Ramiro de Maeztu** y, en su órbita, **Valle-Inclán**.

## Del regeneracionismo al 98

Los precede el **regeneracionismo** de **Joaquín Costa**, que diagnostica los males de España (caciquismo, atraso agrario, incultura) y propone remedios prácticos: *"escuela y despensa"*. Los del 98 heredan el diagnóstico pero lo trasladan del terreno económico al **espiritual y existencial**.

## Características

**1. El tema de España.** Es su obsesión central, abordada desde varios ángulos:

- **El paisaje de Castilla** como símbolo del alma española. No se describe objetivamente: se contempla desde la emoción. La meseta austera, los pueblos detenidos, las tierras pobres expresan a la vez la grandeza pasada y la decadencia presente.
- **La intrahistoria.** Concepto de **Unamuno** (*En torno al casticismo*, 1895): frente a la historia de las batallas y los reyes, que es la superficie, existe la **vida callada y permanente de las gentes anónimas**, que es el verdadero sustrato de un pueblo. Unamuno la compara con el **fondo del mar**, inmóvil bajo el oleaje de la superficie.
- **La literatura medieval y los clásicos.** Revalorizan el *Poema de Mio Cid*, Berceo, Gonzalo de Berceo, Manrique, el *Quijote*, buscando en ellos la esencia de lo español. Unamuno escribe *Vida de don Quijote y Sancho* (1905).

**2. Preocupaciones existenciales.** El sentido de la vida, la muerte, la inmortalidad, la fe y la duda religiosa, el paso del tiempo. Influyen **Schopenhauer** (pesimismo), **Nietzsche** (voluntad, muerte de Dios) y **Kierkegaard** (angustia existencial), a quien Unamuno leía en danés.

**3. Renovación de los géneros.**
- La **novela** se libera de las convenciones realistas: pierde peso el argumento, se reduce la descripción de ambientes y crece el peso de las ideas y del diálogo. Unamuno llega a rebautizarla como ***nivola***.
- El **ensayo** se convierte en género central, cauce natural de sus reflexiones.

**4. Estilo sobrio y antirretórico.** Frente al ornamento modernista:
- **Precisión léxica** y frase breve.
- Recuperación de **arcaísmos** y de palabras tradicionales y populares del campo castellano, que consideran más auténticas.
- **Subjetivismo**: la realidad aparece filtrada por la emoción del escritor.
- Predilección por el **relato corto** y el fragmento.

## Los autores

**Miguel de Unamuno (1864-1936)**
Rector de Salamanca, es el gran agonista: su obra entera nace del **conflicto entre la razón, que niega la inmortalidad, y el corazón, que la necesita**.
- **Ensayo:** *En torno al casticismo* (1895), donde formula la intrahistoria; *Del sentimiento trágico de la vida* (1913), su obra filosófica capital; *La agonía del cristianismo* (1925).
- **Novela:** *Niebla* (1914), *Abel Sánchez* (1917) sobre la envidia, *La tía Tula* (1921), *San Manuel Bueno, mártir* (1931).

**Pío Baroja (1872-1956)**
El más **pesimista y escéptico**. Critica a la sociedad por hipócrita, injusta y aburguesada. Concibe la novela como un género **abierto**, "un saco donde cabe todo", sin plan previo. Estilo espontáneo, párrafo corto, diálogo ágil, a veces descuidado a propósito. Sus protagonistas son **inadaptados y abúlicos**.
- *El árbol de la ciencia* (1911), *Zalacaín el aventurero* (1909), *La busca* (1904), *Memorias de un hombre de acción*.

**Azorín (1873-1967)**
El estilista del grupo. Su prosa es **morosa, impresionista y de extraordinaria precisión**: frases breves, léxico exacto, recuperación de arcaísmos. Sus obras carecen casi de acción; lo que importa es la **sensación** y la obsesión por el **tiempo** y por lo permanente bajo lo efímero.
- *La voluntad* (1902), *Castilla* (1912), *Los pueblos*.

**Antonio Machado**: *Campos de Castilla* (1912) es la gran realización poética de los temas del 98 *(ver misión siguiente)*.

**Ramiro de Maeztu**: de la rebeldía juvenil de *Hacia otra España* (1899) evoluciona al tradicionalismo de *Defensa de la Hispanidad* (1934).

## El teatro del 98

Intentaron renovar la escena, pero con escaso éxito comercial: **Unamuno** (*Fedra*), **Azorín** (*Lo invisible*), **Jacinto Grau** (*El señor de Pigmalión*). La verdadera renovación teatral llegará por **Valle-Inclán**.`,
    worked_example_markdown: `## Ejemplo guiado: el tema de España en un texto del 98

Fragmento de **"A orillas del Duero"**, de *Campos de Castilla* (1912), de Antonio Machado:

> *"¡Castilla miserable, ayer dominadora,*
> *envuelta en sus harapos desprecia cuanto ignora!*
> *¿Espera, duerme o sueña? ¿La sangre derramada*
> *recuerda, cuando tuvo la fiebre de la espada?"*

**Paso 1 — La estructura del contraste.**
Todo el fragmento se organiza sobre una **antítesis temporal**: el **ayer** glorioso ("dominadora", "la fiebre de la espada") frente al **hoy** degradado ("miserable", "envuelta en sus harapos"). Ese contraste entre pasado imperial y presente decadente **es** el tema de España del 98 en su formulación más concentrada.

**Paso 2 — El paisaje como símbolo.**
Castilla no aparece como territorio geográfico sino **personificada**: se le atribuyen desprecio, espera, sueño, memoria. La región se convierte en **símbolo del alma nacional**, procedimiento característico del grupo.

**Paso 3 — La actitud crítica.**
"**Desprecia cuanto ignora**" es una acusación durísima: identifica el mal de España con la **ignorancia soberbia**, el rechazo de lo que no se conoce. Enlaza directamente con el regeneracionismo de Costa y su reclamación de escuela.

**Paso 4 — Las interrogaciones retóricas.**
"¿Espera, duerme o sueña?" no busca respuesta: expresa la **perplejidad dolorida** del poeta ante un país paralizado. La gradación *esperar → dormir → soñar* va del optimismo a la ilusión vana.

**Paso 5 — El estilo.**
Léxico **sobrio y desnudo**, sin un solo adorno modernista. Palabras tradicionales y duras: *harapos*, *espada*, *sangre*. Metro clásico: **alejandrinos pareados**. La contención formal refuerza la gravedad del contenido.

**Redacción final para el examen:**
> *El fragmento condensa el **tema de España** propio del 98. Se estructura sobre una **antítesis temporal** entre el pasado imperial ("ayer dominadora", "la fiebre de la espada") y el presente degradado ("miserable", "envuelta en sus harapos"). Castilla aparece **personificada** y convertida en símbolo del alma nacional, procedimiento característico del grupo. La crítica es explícita y severa —"desprecia cuanto ignora" señala la ignorancia soberbia como raíz del atraso—, y las **interrogaciones retóricas** traducen la perplejidad del poeta ante un país paralizado. El estilo, de léxico sobrio y tradicional y métrica clásica, se aleja deliberadamente del ornamento modernista.*

## Los dos conceptos que hay que saber definir

**Intrahistoria:** *frente a la historia de los acontecimientos y los grandes nombres, Unamuno propone atender a la vida cotidiana, silenciosa y permanente de las gentes anónimas, verdadero sustrato de un pueblo. La compara con el fondo del mar, inmóvil bajo las olas de la superficie.*

**Nivola:** *término que Unamuno inventa en* Niebla *(1914) para desmarcarse de la novela realista. Prescinde de descripciones y de plan previo, se construye sobre el **diálogo** y plantea conflictos existenciales. En la obra, el personaje Augusto Pérez viaja a Salamanca para discutir con su propio autor el derecho a seguir existiendo.*`,
    practice_prompt: 'Redacta el tema "La Generación del 98" en 200 palabras: origen del nombre, nómina, tres características (tema de España, existencialismo, estilo) y tres autores con una obra fechada. Después define "intrahistoria" y "nivola" relacionando cada concepto con la obra de Unamuno donde aparece.',
    alert_markdown: '⚠️ **El 98 no es un movimiento estético sino una actitud.** Baroja es áspero y veloz; Azorín, moroso y preciosista; Unamuno, agónico y conceptual. Sus estilos son incompatibles entre sí. Lo que los une es el **tema de España** y la **preocupación existencial**, no una forma común de escribir.',
  },

  {
    sort_order: 45,
    title: 'Antonio Machado',
    concept_markdown: `## La figura

**Antonio Machado (1875-1939)** es el poeta que **enlaza** el Modernismo intimista, la meditación noventayochista y el compromiso de los años treinta. Nacido en Sevilla y formado en la **Institución Libre de Enseñanza**, fue catedrático de francés en Soria, donde conoció y perdió a **Leonor Izquierdo**, con quien se casó en 1909 y que murió en 1912.

Su poética se resume en una fórmula suya: la poesía es *"palabra esencial en el tiempo"*. No busca ni el ornamento ni el juego intelectual, sino **captar la intimidad del hombre en su temporalidad**.

## Primera etapa: *Soledades* (1903), ampliado como *Soledades, galerías y otros poemas* (1907)

**Modernismo intimista y simbolista.** Nada del cisne y la princesa: Machado toma del Modernismo su vertiente interior, la heredada de Bécquer y del simbolismo francés.

**Temas:** el paso del **tiempo**, la **muerte**, **Dios** (ausente o buscado), el **sueño** como vía de conocimiento, la **melancolía**, la infancia perdida, la soledad.

**Los símbolos machadianos**, imprescindibles para comentar cualquier poema suyo:

| Símbolo | Significado |
|---|---|
| **La tarde** | Melancolía, declive, final |
| **El camino** | La vida, el transcurrir |
| **El agua que corre / la fuente** | El fluir del tiempo, la vida |
| **El agua estancada** | La muerte, el tiempo detenido |
| **La galería, el espejo** | La conciencia, el mundo interior |
| **El sueño** | Vía de conocimiento de lo profundo |
| **El jardín, el huerto** | La intimidad, la infancia |
| **La noria, el reloj** | El tiempo cíclico |

**Estilo:** métrica sencilla (**silva-romance**, con versos de 7 y 11 asonantados), léxico común, tono confidencial. La aparente sencillez oculta gran densidad.

## Segunda etapa: *Campos de Castilla* (1912, ampliado en 1917)

La mirada se vuelve **hacia fuera**. Escrito en Soria, es su libro más noventayochista.

**Contenidos:**
- **El paisaje soriano**, contemplado con emoción: el Duero, los álamos, las tierras altas.
- **Crítica de la España** atrasada y cainita: "*la España de charanga y pandereta*", la España "*que ora y bosteza*". Poemas como "A orillas del Duero" o "El mañana efímero".
- ***La tierra de Alvargonzález***, romance narrativo sobre un parricidio por codicia, en el que la envidia y la violencia rural funcionan como símbolo de la España cainita.
- Los **poemas a Leonor**, escritos tras su muerte, de estremecedora contención: "*Señor, ya me arrancaste lo que yo más quería*".
- Los ***Proverbios y cantares***, breves composiciones sentenciosas de tono filosófico y popular, entre ellas la más citada de toda su obra: "*Caminante, no hay camino, / se hace camino al andar*".

## Tercera etapa: los apócrifos y el compromiso

*Nuevas canciones* (1924) y *De un cancionero apócrifo*. Machado crea **heterónimos** —**Abel Martín** y **Juan de Mairena**—, filósofos apócrifos a los que atribuye reflexiones sobre la poesía, la metafísica y la política. *Juan de Mairena* (1936) es un libro en prosa de enorme lucidez, con abundante ironía y crítica cultural.

Durante la **Guerra Civil** se compromete con la República y escribe poesía de circunstancias, entre ella la elegía *"El crimen fue en Granada"*, sobre la muerte de Lorca. Muere en **Colliure** (Francia) en febrero de **1939**, pocos días después de cruzar la frontera con su madre, huyendo del avance franquista. En el bolsillo de su abrigo se halló un último verso: *"Estos días azules y este sol de la infancia"*.

## Claves de estilo

- **Símbolo** frente a metáfora ornamental: la imagen machadiana no decora, **significa**.
- **Sobriedad** léxica: palabras comunes, cargadas de sentido por el contexto.
- Métrica **tradicional** y aparentemente humilde: silva-romance, copla, soleá.
- **Temporalidad**: casi todos sus poemas están atravesados por la conciencia del tiempo que pasa.`,
    worked_example_markdown: `## Ejemplo guiado: comentario de un poema de *Soledades*

> *"Es una tarde cenicienta y mustia,*
> *destartalada, como el alma mía;*
> *y es esta vieja angustia*
> *que habita mi usual hipocondría."*

**Paso 1 — Identifica los símbolos.**
La **tarde** es el símbolo machadiano de la **melancolía y el declive**. Los adjetivos que la acompañan —"cenicienta", "mustia", "destartalada"— no describen el clima: describen un **estado de ánimo**.

**Paso 2 — Localiza el procedimiento clave: la correspondencia.**
El símil "*como el alma mía*" hace **explícita** la correspondencia entre paisaje exterior e interior. Es el procedimiento **simbolista** por excelencia: el mundo exterior no existe en el poema como realidad autónoma, sino como **proyección del yo**. Machado llamaba a esto "paisaje del alma".

**Paso 3 — Analiza el léxico.**
"Cenicienta" (color de la ceniza, resto de lo quemado), "mustia" (marchita), "destartalada" (desvencijada) y "vieja angustia" componen un **campo semántico de la degradación y el cansancio**. Nótese que son palabras **comunes**, sin brillo modernista: la emoción nace del contexto, no del ornamento.

**Paso 4 — La métrica.**
Combinación de **endecasílabos y heptasílabos** con rima asonante: la **silva-romance**, forma predilecta de Machado por su flexibilidad y su tono conversacional. El verso corto ("y es esta vieja angustia") rompe el ritmo y aísla la palabra clave: *angustia*.

**Paso 5 — El sentido global.**
El poema no cuenta nada: **fija un estado**. La "hipocondría" final —término casi clínico, deliberadamente antipoético— desdramatiza y a la vez agrava: la angustia no es excepcional, es "**usual**", forma parte de la vida cotidiana del yo.

**Redacción final para el examen:**
> *Estos versos iniciales pertenecen a* Soledades*, obra de la primera etapa de Machado, de **modernismo intimista y simbolista**. El poema se organiza sobre la **correspondencia entre paisaje y estado de ánimo**, explicitada en el símil "como el alma mía": la **tarde**, símbolo machadiano de la melancolía y el declive, funciona como proyección del yo. El **léxico**, de palabras comunes agrupadas en un campo semántico de degradación ("cenicienta", "mustia", "destartalada"), demuestra que Machado prescinde del ornamento modernista y confía el efecto al símbolo. Métricamente emplea la **silva-romance**, combinación de endecasílabos y heptasílabos con rima asonante que le permite un tono confidencial. El cierre, con el término casi clínico "hipocondría" y el adjetivo "usual", presenta la angustia no como excepción sino como condición permanente del yo.*

## Truco para el examen

Memoriza **dos versos** de Machado. Con "*Caminante, no hay camino, / se hace camino al andar*" y "*Castilla miserable, ayer dominadora*" puedes ilustrar respectivamente su **filosofía existencial** y su **crítica de España**, que son las dos preguntas posibles.`,
    practice_prompt: 'Explica las tres etapas de la obra de Machado con una obra y un rasgo característico de cada una. Después coge un poema de "Soledades" o "Campos de Castilla", localiza tres símbolos machadianos, di qué significa cada uno y explica cómo se relacionan con el estado de ánimo del yo poético.',
    alert_markdown: '⚠️ **En Machado el paisaje nunca es decorado.** Si en un comentario escribes "describe una tarde de otoño" has perdido el poema: la tarde **es** el alma del poeta. Todo elemento externo en su poesía funciona como **símbolo** de un contenido interior.',
  },

  {
    sort_order: 46,
    title: 'La Novela Anterior a 1936: Unamuno, Baroja y Azorín',
    concept_markdown: `## La ruptura con el molde realista

Los novelistas del 98 rompen con la novela decimonónica. Frente al Realismo, que documentaba la sociedad, ellos convierten la novela en **cauce de ideas y de conflictos existenciales**. Los cambios son profundos:

- **Pierde peso el argumento**: apenas ocurre nada.
- **Se reduce la descripción** de ambientes, o se subjetiviza.
- **Crece el diálogo** y la reflexión.
- **Desaparece el narrador omnisciente clásico**, o se vuelve intrusivo y arbitrario.
- El **personaje** deja de ser un tipo social para convertirse en una **conciencia en conflicto**.

## Miguel de Unamuno: la novela como problema

Unamuno concibe la novela como **experimento existencial**. Sus personajes son "**agonistas**" (del griego *agón*, lucha): seres que se debaten con un problema que no tiene solución.

### *Niebla* (1914) y la **nivola**
Ante las críticas de que sus novelas no eran novelas, Unamuno inventó el término ***nivola***. Sus rasgos:
- Se prescinde del **plan previo**: la obra se escribe "*a lo que salga*", como la vida.
- Predominio absoluto del **diálogo**.
- Ausencia de descripción de paisajes y ambientes.
- Los personajes se definen por lo que dicen y piensan, no por lo que se cuenta de ellos.

**Argumento y escena capital:** Augusto Pérez, un joven ocioso, se enamora de Eugenia, que lo engaña con otro. Decidido a suicidarse, viaja a **Salamanca** para consultarlo con don Miguel de Unamuno, autor de un ensayo sobre el suicidio. Allí el autor le revela que **no existe**, que es un ente de ficción. Augusto se rebela y le replica que también Unamuno morirá, y que él, como criatura de ficción, puede ser más duradero que su creador. Es una de las escenas más audaces de la literatura española del siglo XX y plantea el problema de la **realidad y el sueño**, de Dios y sus criaturas.

### *San Manuel Bueno, mártir* (1931)
Su obra más redonda. Don Manuel, párroco de Valverde de Lucerna, es venerado como santo por su pueblo. Pero **ha perdido la fe**: no cree en la resurrección ni en la vida eterna. Aun así **finge creer** para no arrebatar a sus feligreses el consuelo que los sostiene. Solo Ángela Carballino y su hermano Lázaro conocen el secreto.

**Temas:** el conflicto entre **fe y razón**, el ansia de **inmortalidad**, la religión como consuelo necesario ("la verdad es acaso algo terrible"), la **intrahistoria** (el pueblo que vive al margen de la Historia, con el lago y la montaña como símbolos de permanencia).

### Otras
*Abel Sánchez* (1917), sobre la **envidia** como pasión española, reescritura del mito de Caín. *La tía Tula* (1921), sobre la **maternidad sin carnalidad** y el ansia de perpetuarse.

## Pío Baroja: la novela abierta

Su concepción es opuesta a la de la novela perfecta: la novela es **"un saco donde cabe todo"**, un género **abierto, permeable y sin reglas**. No planifica: escribe.

**Estilo:** párrafo corto, **frase breve**, léxico exacto y directo, diálogo muy vivo, ritmo rápido. Se le ha reprochado descuido, pero esa aparente desaliño es deliberado: busca la **espontaneidad de la vida**.

**Los personajes barojianos** son **inadaptados**, **abúlicos** (sin voluntad), escépticos, en perpetuo desacuerdo con una sociedad que juzgan hipócrita, injusta y aburguesada. Son hombres de acción frustrada o de reflexión estéril.

### *El árbol de la ciencia* (1911)
Su novela más lograda y la más autobiográfica. **Andrés Hurtado** estudia Medicina en un Madrid sórdido, ejerce en un pueblo manchego dominado por el caciquismo y termina suicidándose tras la muerte de su mujer. La novela contrapone dos árboles bíblicos: el **árbol de la ciencia**, que da conocimiento y con él dolor, y el **árbol de la vida**, que da inconsciencia y felicidad. El pesimismo de raíz **schopenhaueriana** se concentra en las conversaciones con su tío Iturrioz.

**Otras obras:** *Zalacaín el aventurero* (1909), novela de acción en las guerras carlistas; *La busca* (1904), sobre los bajos fondos madrileños, dentro de la trilogía *La lucha por la vida*; *Memorias de un hombre de acción*, ciclo histórico sobre Aviraneta.

## Azorín: la novela impresionista

En Azorín **casi no hay acción**. Lo que hay es **mirada**: la descripción de un instante, de una sensación, de un objeto mínimo.

**Rasgos:**
- **Frase breve**, casi sin subordinación, de gran pureza sintáctica.
- **Léxico preciso** y recuperación de **arcaísmos** y voces del campo.
- **Impresionismo**: se acumulan detalles sensoriales sueltos, como pinceladas.
- Obsesión por el **tiempo** y por lo **permanente bajo lo efímero**: le fascina que las cosas pequeñas se repitan idénticas durante siglos.

**Obras:** *La voluntad* (1902), donde el protagonista Antonio Azorín acaba anulado por la abulia; *Antonio Azorín* (1903); *Castilla* (1912), conjunto de estampas sobre el paisaje y los clásicos.

## Otras líneas anteriores a 1936

- **Valle-Inclán** en prosa: de las modernistas ***Sonatas*** (1902-05) al esperpento narrativo de ***Tirano Banderas*** (1926), sobre un dictador hispanoamericano, y el ciclo histórico *El ruedo ibérico*.
- **La novela novecentista**: **Gabriel Miró** (*Nuestro Padre San Daniel*, *El obispo leproso*), de prosa sensorial y lírica; **Ramón Pérez de Ayala** (*Belarmino y Apolonio*, *Troteras y danzaderas*), de novela intelectual y ensayística.
- **Ramón Gómez de la Serna**, con su prosa vanguardista e imaginativa.`,
    worked_example_markdown: `## Ejemplo guiado: la escena capital de *Niebla*

Resumen del encuentro entre Augusto Pérez y su autor (capítulo XXXI):

Augusto, decidido a suicidarse, viaja a Salamanca a consultar con don Miguel de Unamuno. Este le comunica que no puede suicidarse **porque no existe**: es un personaje de ficción y solo morirá cuando su autor lo decida. Augusto, primero incrédulo y luego furioso, le responde que también él, don Miguel, es un ente de ficción, un sueño de Dios, y que morirá antes que su criatura.

**Paso 1 — Identifica el procedimiento: la metaficción.**
La obra **habla de sí misma**: un personaje se encuentra con su autor dentro de la propia novela. Es un recurso que rompe la ilusión realista de manera radical y que en 1914 resultaba insólito. Anticipa en ocho años a Pirandello (*Seis personajes en busca de autor*, 1921).

**Paso 2 — Conecta con el problema filosófico.**
La escena **no es un juego**. Plantea la pregunta central de Unamuno: **¿qué diferencia hay entre existir y ser soñado?** Si Augusto existe solo porque Unamuno lo piensa, y Unamuno existe solo porque Dios lo piensa, entonces la condición del personaje y la del hombre son **la misma**. La angustia de Augusto es la angustia del propio Unamuno ante la muerte y la posible inexistencia de Dios.

**Paso 3 — Relaciona con la nivola.**
La escena solo es posible en una **nivola**: en una novela realista, con narrador omnisciente y verosimilitud estricta, sería impensable. Al prescindir del plan previo y construir sobre el diálogo, Unamuno se permite que la obra se le rebele.

**Paso 4 — El desenlace y su sentido.**
Augusto muere, pero **no se sabe si se suicidó o si lo mató Unamuno**. La ambigüedad es deliberada: el personaje ha ganado autonomía suficiente como para que ni su autor pueda afirmar quién decidió. Después, Augusto se aparece en sueños a Unamuno para anunciarle que también él morirá.

**Redacción final para el examen:**
> *La escena del encuentro entre Augusto Pérez y Unamuno en* **Niebla** *(1914) constituye el momento culminante de la **nivola**. Su procedimiento es la **metaficción**: el personaje se encuentra con su autor dentro de la propia obra, rompiendo de raíz la ilusión realista ocho años antes que Pirandello. Pero no es un juego formal, sino la formulación narrativa del problema unamuniano por excelencia: si Augusto existe únicamente porque su autor lo piensa, y el hombre existe únicamente porque Dios lo sueña, la condición de la criatura de ficción y la del ser humano son la misma. La rebelión de Augusto —"usted también morirá"— traduce así el **ansia de inmortalidad** y la **angustia ante la nada** que recorren toda la obra de Unamuno.*`,
    practice_prompt: 'Compara la concepción de la novela de Unamuno, Baroja y Azorín en tres aspectos: papel del argumento, estilo y tipo de personaje. Cita una obra fechada de cada uno. Después explica qué es una "nivola" y por qué la escena del capítulo XXXI de "Niebla" solo es posible en ese tipo de obra.',
    alert_markdown: '⚠️ **Cuidado con las fechas.** La Generación del 98 se llama así por 1898, pero sus obras se escriben durante cuarenta años: *San Manuel Bueno, mártir* es de **1931** y *Tirano Banderas* de **1926**. No confundas la fecha del *grupo* con la de cada *obra*.',
  },

  {
    sort_order: 47,
    title: 'El Teatro Anterior a 1939: Valle-Inclán y el Esperpento',
    concept_markdown: `## El condicionante comercial

El teatro es el género más condicionado de todos, porque depende de **empresarios**, de **actores** y de un **público** —la burguesía madrileña— que acude a divertirse y no quiere ver cuestionados sus valores. El resultado es un panorama dividido en dos: un **teatro que triunfa** y es artísticamente pobre, y un **teatro innovador** que apenas llega a estrenarse.

## El teatro que triunfa

**1. La comedia burguesa de Jacinto Benavente (1866-1954)**
Tras el fracaso de *El nido ajeno* (1894), que criticaba con dureza las costumbres de su clase, Benavente aprendió la lección y optó por una **crítica amable**, de conflictos poco comprometidos, diálogo elegante y construcción impecable. Fue **Nobel en 1922**.
- *Los intereses creados* (1907), su obra maestra, farsa de ambiente italiano con personajes de la *commedia dell'arte*, sobre el poder del interés económico.
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

Es **la gran renovación del teatro español** del siglo XX. En su época se le consideró **irrepresentable** por las exigencias técnicas de sus acotaciones y por la radicalidad de sus planteamientos; hoy se le reconoce como el dramaturgo más importante desde el Siglo de Oro.

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

Aparte queda **Miguel Mihura**, que escribe en **1932** ***Tres sombreros de copa***, humor absurdo que anticipa el teatro europeo del absurdo, pero que **no se estrena hasta 1952**.`,
    worked_example_markdown: `## Ejemplo guiado: cómo funciona el esperpento en un texto

Fragmento de la **escena XII** de *Luces de bohemia*, donde Max formula la teoría:

> *"MAX: Los ultraístas son unos farsantes. El esperpentismo lo ha inventado Goya. Los héroes clásicos han ido a pasearse en el callejón del Gato.*
> *DON LATINO: ¡Estás completamente curda!*
> *MAX: Los héroes clásicos reflejados en los espejos cóncavos dan el Esperpento. El sentido trágico de la vida española solo puede darse con una estética sistemáticamente deformada."*

**Paso 1 — Fíjate en quién y dónde lo dice.**
La teoría estética más importante del teatro español del siglo XX la formula un **poeta ciego, borracho y moribundo**, tirado en un portal, y su interlocutor le responde que está "curda". Valle **degrada el acto mismo de teorizar**: no hay solemnidad posible. Eso ya es esperpento.

**Paso 2 — Identifica la genealogía que Valle se atribuye.**
Cita a **Goya** (los *Caprichos*, las *Pinturas negras*) como inventor del esperpentismo, y desprecia a los **ultraístas**, la vanguardia del momento. Se sitúa así en una **tradición española de la deformación** —Quevedo, Goya— y no en la vanguardia europea de moda.

**Paso 3 — Comprende el mecanismo del espejo cóncavo.**
El **callejón del Gato** existía realmente en Madrid y tenía espejos deformantes en su fachada. La metáfora es precisa: el espejo **no inventa** nada, **refleja** lo que hay, pero deformado. Del mismo modo, el esperpento no falsea España: la muestra tal como es, y lo que hay es deforme.

**Paso 4 — Localiza la clave: "sistemáticamente".**
Valle insiste en que la deformación es **sistemática**, no caprichosa. Tiene un método, casi una matemática. Esto lo separa del simple humor grotesco.

**Paso 5 — Observa los procedimientos en la propia obra.**
- **Animalización:** los personajes son "cerdos", "perros"; la muerte de Max se describe con un vocabulario que lo cosifica.
- **Contraste trágico-cómico:** Max muere en un portal mientras don Latino le roba la cartera; el entierro se convierte en escena de sainete.
- **Lenguaje:** conviven el cultismo ("*sentido trágico de la vida*", eco de Unamuno) y el argot más bajo ("*curda*").

**Redacción final para el examen:**
> *El fragmento contiene la formulación teórica del **esperpento**, estética creada por Valle-Inclán en* **Luces de bohemia** *(1920). Su premisa es que en una España que constituye "una deformación grotesca de la civilización europea" la **tragedia clásica resulta imposible**: los héroes reflejados en los espejos cóncavos del callejón del Gato solo pueden dar esperpento. La deformación es **sistemática**, no arbitraria, y se ejecuta mediante la **animalización y cosificación** de los personajes, su reducción a **muñecos** sin voluntad, el **contraste violento entre lo trágico y lo cómico** y un **lenguaje** que funde el cultismo con el argot madrileño. Resulta significativo que la teoría la enuncie un poeta ciego, ebrio y a punto de morir, mientras su acompañante le replica que desvaría: el propio acto de teorizar aparece degradado, en coherencia con la estética que se defiende.*`,
    practice_prompt: 'Define el esperpento citando las palabras de Max Estrella y enumera cuatro procedimientos de deformación con un ejemplo de cada uno. Después redacta el tema "El teatro anterior a 1939" en 200 palabras, distinguiendo el teatro comercial (tres tendencias con autor y obra) del teatro innovador.',
    alert_markdown: '⚠️ **El esperpento no es simple humor negro.** Valle insiste en que la deformación es **sistemática** y tiene una **finalidad crítica**: mostrar que en España la tragedia es imposible. Presentarlo como "una forma de hacer humor grotesco" pierde todo su alcance ideológico.',
  },

  {
    sort_order: 48,
    title: 'El Novecentismo y la Generación del 14',
    concept_markdown: `## Qué es el Novecentismo

Se llama **Novecentismo** o **Generación del 14** al grupo de intelectuales que hacia **1914** toma el relevo del 98. El nombre lo acuñó **Eugenio d'Ors**. Su fecha simbólica es 1914, año en que **Ortega y Gasset** publica *Meditaciones del Quijote* y pronuncia su conferencia "Vieja y nueva política", y en que estalla la Primera Guerra Mundial.

Son la **primera generación de intelectuales universitarios y profesionales** de la literatura española: catedráticos, médicos, filósofos, juristas. Frente al autodidactismo apasionado del 98, ellos aportan **rigor y formación**.

## Características

**1. Racionalismo e intelectualismo.** Analizan los problemas de España con **serenidad y método**, no con el dolorido subjetivismo del 98. Desconfían del sentimentalismo.

**2. Europeísmo.** La solución para España es **europeizarse**: modernizar la ciencia, la universidad y la administración. Ortega lo resume: *"España es el problema, Europa la solución"*.

**3. Arte puro y deshumanizado.** El arte debe eliminar lo **humano, anecdótico y sentimental** y concentrarse en lo puramente estético.

**4. Obra bien hecha.** Obsesión por la **perfección formal**, el cuidado del lenguaje, la pulcritud. Prosa densa, cuidada, a veces exigente.

**5. Elitismo.** Escriben para una **minoría culta**. Rechazan explícitamente lo popular y lo masivo.

**6. Predominio del ensayo** y de la prosa intelectual sobre la narrativa y la poesía.

## José Ortega y Gasset (1883-1955)

El gran ensayista español del siglo XX y líder intelectual del grupo. Fundó la ***Revista de Occidente*** (1923), plataforma decisiva para la difusión del pensamiento europeo en España y para la propia Generación del 27.

**Obras clave:**
- ***Meditaciones del Quijote*** (1914), donde formula su idea central: *"Yo soy yo y mi circunstancia, y si no la salvo a ella no me salvo yo"*.
- ***España invertebrada*** (1921), análisis de la descomposición nacional.
- ***La deshumanización del arte*** (1925). Es el texto que hay que conocer: sostiene que el **arte nuevo** (vanguardista) se caracteriza por **eliminar los elementos humanos** —lo vivido, lo sentimental, lo narrativo— y concentrarse en la forma. Por eso resulta **impopular**: divide al público entre una minoría que lo entiende y una masa que lo rechaza. Ortega no lo lamenta: lo constata y lo justifica.
- ***La rebelión de las masas*** (1930), su obra más influyente internacionalmente: diagnostica la irrupción del "hombre-masa", satisfecho y sin exigencias hacia sí mismo, como fenómeno central del siglo.

**Su estilo** es un modelo de prosa ensayística: claridad expositiva, **metáforas** de gran eficacia didáctica, tono de conversación culta.

## Otros ensayistas

- **Eugenio d'Ors**, creador del "glosario", columna diaria de reflexión culta.
- **Gregorio Marañón**, médico y ensayista (*Don Juan*, *Las ideas biológicas del padre Feijoo*).
- **Manuel Azaña**, escritor y futuro presidente de la República.
- **Salvador de Madariaga**, **Américo Castro**, **Claudio Sánchez-Albornoz** (historiadores).

## La novela novecentista

- **Gabriel Miró (1879-1930)**: prosa de extraordinaria **riqueza sensorial y lírica**. La acción es mínima y sirve solo de soporte a la descripción y a la sensación. *Nuestro Padre San Daniel* (1921) y *El obispo leproso* (1926), ambientadas en la ficticia Oleza (trasunto de Orihuela), retrato del clericalismo de provincias.
- **Ramón Pérez de Ayala (1880-1962)**: **novela intelectual y ensayística**, con continuas digresiones sobre arte, filosofía o política, y uso de la ironía y el perspectivismo. *Belarmino y Apolonio* (1921), *Troteras y danzaderas* (1913), *Tigre Juan* (1926).
- **Ramón Gómez de la Serna (1888-1963)**: figura inclasificable, a caballo entre el novecentismo y la vanguardia *(ver misión 49)*.

## Juan Ramón Jiménez (1881-1958)

Figura **puente** entre el Modernismo y la Generación del 27. Su vida entera se consagró a la poesía con una dedicación casi religiosa: la *"Obra"*, que reescribió una y otra vez. **Premio Nobel en 1956**, dos días antes de morir su mujer, Zenobia Camprubí.

### Las tres etapas

**1. Etapa sensitiva (hasta 1915).**
Modernismo intimista, influido por Bécquer y el simbolismo. Poesía de la melancolía, el paisaje, la música, con adjetivación colorista.
- *Arias tristes* (1903), *Jardines lejanos*, *La soledad sonora*, *Platero y yo* (1914, prosa lírica).

**2. Etapa intelectual (1916-1936).**
El giro decisivo lo marca ***Diario de un poeta recién casado*** (1916), escrito durante su viaje a Estados Unidos para casarse con Zenobia. Descubre el **mar** como símbolo de lo absoluto y cambiante, incorpora el **verso libre**, la prosa poética y el poema breve, y **despoja al poema de todo ornamento**. Es el nacimiento de la **poesía pura**: la búsqueda de la esencia de las cosas mediante la palabra exacta, el conocimiento a través de la belleza.
- Su poética se resume en el poema: *"Inteligencia, dame / el nombre exacto de las cosas"*.
- *Eternidades* (1918), *Piedra y cielo* (1919).

**3. Etapa suficiente o verdadera (exilio, desde 1936).**
Tras la Guerra Civil se exilia y muere en Puerto Rico. Poesía metafísica, en busca de un dios que se identifica con la conciencia y la belleza.
- *La estación total*, *Animal de fondo* (1949), *Dios deseado y deseante*.

**Su influencia** sobre la Generación del 27 fue enorme: les enseñó el rigor, la exigencia y el ideal de poesía pura.`,
    worked_example_markdown: `## Ejemplo guiado: qué significa "poesía pura"

Poema de *Eternidades* (1918), de Juan Ramón Jiménez:

> *"¡Intelijencia, dame*
> *el nombre exacto de las cosas!*
> *…Que mi palabra sea*
> *la cosa misma,*
> *creada por mi alma nuevamente."*

**Paso 1 — La ortografía.**
"Intelijencia" con **jota** no es una errata. Juan Ramón defendía una **ortografía fonética** propia (*jeneral*, *cojer*) por coherencia entre sonido y escritura. Es un detalle que conviene mencionar porque revela su **obsesión por la exactitud**.

**Paso 2 — El programa poético en dos versos.**
"El nombre exacto de las cosas" es la formulación misma de la **poesía pura**: no se trata de describir el mundo ni de expresar sentimientos, sino de **nombrar la esencia**. Una sola palabra, la precisa, en lugar del ornamento modernista.

**Paso 3 — La aspiración imposible.**
"Que mi palabra sea / la cosa misma" es una aspiración **inalcanzable** por definición: la palabra nunca es la cosa. Ese esfuerzo imposible explica la reescritura obsesiva de toda su obra.

**Paso 4 — El giro final.**
"Creada por mi alma nuevamente": la poesía no copia la realidad, la **recrea**. El poeta no es un notario del mundo sino un segundo creador. Aquí Juan Ramón enlaza con el **creacionismo** y anuncia a la Generación del 27.

**Paso 5 — La forma.**
Verso **libre**, sin rima ni medida regular. Léxico **desnudo**: no hay un solo adjetivo ornamental, ningún cisne, ningún jardín. Compárese con *Arias tristes* (1903), de la etapa sensitiva, cargado de color y música: el contraste mide exactamente la distancia recorrida.

**Redacción final para el examen:**
> *Este poema de* Eternidades *(1918) condensa el programa de la **etapa intelectual** de Juan Ramón Jiménez. La petición del "nombre exacto de las cosas" define la **poesía pura**: frente al ornamento modernista de su primera etapa, el poeta busca ahora la **palabra precisa** que capte la esencia de lo nombrado. La aspiración a que la palabra "sea la cosa misma" resulta por definición inalcanzable, lo que explica la reescritura permanente a que sometió su obra. El verso final —"creada por mi alma nuevamente"— revela además que la poesía no copia la realidad sino que la **recrea**, concepción que enlaza con el creacionismo y que influirá decisivamente en la Generación del 27. Formalmente, el **verso libre** y la desnudez del léxico confirman la ruptura con el modernismo sensitivo de* Arias tristes*.*

## Cómo relacionar Ortega y Juan Ramón

Ambos formulan la misma exigencia desde ángulos distintos:
- **Ortega** (*La deshumanización del arte*, 1925): el arte nuevo **elimina lo humano** y por eso es minoritario.
- **Juan Ramón**: la poesía debe **despojarse** de anécdota y sentimiento para alcanzar la esencia.

Señalar esa convergencia en el examen demuestra que entiendes el Novecentismo como un **proyecto cultural unitario**, no como una lista de autores.`,
    practice_prompt: 'Redacta el tema "El Novecentismo y la Generación del 14: el ensayo, la novela novecentista y Juan Ramón Jiménez" en 200 palabras. Después explica qué defiende Ortega en "La deshumanización del arte" y relaciónalo con el concepto de poesía pura, señalando qué tienen en común.',
    alert_markdown: '⚠️ **"Platero y yo" no es literatura infantil.** Es prosa lírica de la etapa sensitiva, y el propio Juan Ramón se irritaba con esa etiqueta: su subtítulo es *"elegía andaluza"*. Presentarlo como cuento para niños delata desconocimiento de la obra.',
  },

  {
    sort_order: 49,
    title: 'Las Vanguardias',
    concept_markdown: `## Qué son las vanguardias

Los **movimientos de vanguardia** o **"ismos"** son las corrientes artísticas de **ruptura radical** que se suceden en Europa en el primer tercio del siglo XX, especialmente entre **1910 y 1925**. El término procede del lenguaje militar: la vanguardia es la parte del ejército que va en cabeza.

**Contexto:** la Primera Guerra Mundial (1914-18), la Revolución rusa (1917), el desarrollo técnico (automóvil, avión, cine, electricidad) y las teorías de Freud y Einstein hacen tambalearse la visión del mundo heredada. El arte responde con una ruptura total.

## Rasgos comunes

**1. Ruptura con el arte anterior.** Se rechaza todo lo heredado: el realismo, el sentimentalismo, la imitación de la naturaleza, las reglas métricas.

**2. Originalidad y experimentación** como valores supremos. Lo nuevo vale por ser nuevo.

**3. Antisentimentalismo.** Se elimina lo humano y confesional (coincide con la "deshumanización" de Ortega).

**4. Libertad formal absoluta:** verso libre, supresión de la puntuación, disposición tipográfica caprichosa, **caligramas**.

**5. Culto a la imagen y a la metáfora**, liberadas de la lógica.

**6. Difusión mediante manifiestos**, revistas y tertulias. Cada ismo se presenta con un programa.

**7. Carácter efímero:** surgen y desaparecen con rapidez. El más duradero fue el **surrealismo**.

## Las vanguardias europeas

**Futurismo** (1909). Fundado por el italiano **Marinetti** con su *Manifiesto futurista*. Exalta la **máquina, la velocidad, la técnica, la fuerza y la guerra** ("un automóvil de carreras es más bello que la Victoria de Samotracia"). Rompe la sintaxis, suprime adjetivos y puntuación. Su deriva política hacia el fascismo lo desacreditó.

**Cubismo** (1913). Trasladado de la pintura (Picasso, Braque) a la literatura por **Apollinaire**. **Descompone la realidad** en planos y la recompone arbitrariamente. Crea los **caligramas**, poemas cuya disposición tipográfica dibuja su contenido.

**Dadaísmo** (1916). Fundado por **Tristan Tzara** en Zúrich. **Negación total**: del arte, de la lógica, del lenguaje. Reivindica el **azar**, el absurdo, el balbuceo infantil (*dadá* es una palabra sin sentido, elegida al azar del diccionario). Prepara el terreno al surrealismo.

**Expresionismo** (Alemania). **Deforma** la realidad para expresar la angustia y la crítica social.

**Surrealismo** (1924). Fundado por **André Breton** con su *Manifiesto surrealista*. Es el más importante y el más duradero. Partiendo del **psicoanálisis de Freud**, propone liberar el **subconsciente** de las ataduras de la razón, la moral y la estética. Sus técnicas:
- La **escritura automática**: escribir sin control racional, al dictado del pensamiento.
- La transcripción de **sueños**.
- La **imagen irracional**, que asocia realidades muy alejadas entre sí.

El surrealismo no persigue solo un fin estético sino **liberador**: pretende cambiar la vida y al hombre.

## Las vanguardias hispánicas

**Ramón Gómez de la Serna (1888-1963)** es el gran introductor y agitador de la vanguardia en España, desde su tertulia del **café Pombo** y desde revistas como *Prometeo*, donde publicó en 1910 la "Proclama futurista a los españoles".

Su creación personal es la ***greguería***, que él definió con una fórmula:

> **humorismo + metáfora = greguería**

Es una frase breve, ingeniosa, que capta una asociación insólita entre dos realidades:
- *"El agua no tiene memoria: por eso es tan limpia."*
- *"Los ceros son los huevos de los que salieron las demás cifras."*
- *"El arcoíris es la cinta que se pone la naturaleza después de lavarse la cabeza."*

**Creacionismo.** Creado por el chileno **Vicente Huidobro**, que lo difunde en Madrid hacia 1918. El poeta **no debe imitar** la naturaleza sino **crear realidades nuevas**, autónomas, que no existen fuera del poema:
> *"Por qué cantáis la rosa, ¡oh poetas! / Hacedla florecer en el poema."*
> *"El poeta es un pequeño Dios."*
En España lo cultivan **Gerardo Diego** (*Manual de espumas*, 1924) y **Juan Larrea**.

**Ultraísmo** (1918). Vanguardia específicamente española, síntesis de futurismo, cubismo y creacionismo. Rasgos:
- Culto a la **imagen y la metáfora**, con frecuencia irracionales.
- **Supresión** de lo anecdótico, lo sentimental y lo ornamental.
- Eliminación de la **rima, la puntuación** y los nexos.
- Temas del **mundo moderno**: deportes, máquinas, cine, ciudad.
- Disposición **caligramática** de los versos.
Figuras: **Guillermo de Torre**, **Rafael Cansinos Assens**, y en sus inicios el joven **Jorge Luis Borges**, que llevaría el ultraísmo a Argentina.

## La influencia sobre la Generación del 27

El **surrealismo** fue la vanguardia de mayor calado en España porque permitió a los poetas del 27 **rehumanizar** su poesía sin renunciar a la libertad formal: la imagen irracional podía expresar la angustia, el deseo o la protesta. Obras capitales de esa influencia:
- ***Poeta en Nueva York*** (Lorca, 1929-30)
- ***Sobre los ángeles*** (Alberti, 1929)
- ***La destrucción o el amor*** (Aleixandre, 1935)
- ***Un río, un amor*** (Cernuda, 1929)

Conviene precisar que el surrealismo español **no fue ortodoxo**: estos poetas **no practicaron la escritura automática pura**, sino que usaron la libertad de la imagen manteniendo el control consciente del poema.`,
    worked_example_markdown: `## Ejemplo guiado 1: reconocer una greguería

> *"El arcoíris es la cinta que se pone la naturaleza después de lavarse la cabeza."*

**Descomposición según la fórmula de Ramón:**
- **Metáfora:** arcoíris → cinta del pelo. Se identifican dos realidades por su forma curva y sus colores.
- **Humorismo:** el elemento cómico llega con "después de lavarse la cabeza", que **personifica** a la naturaleza reduciéndola a un gesto doméstico y trivial.
- **Efecto:** el contraste entre lo **sublime** (un fenómeno atmosférico) y lo **cotidiano** (lavarse el pelo) produce la sorpresa. La greguería **desacraliza** mirando el mundo con ojos nuevos.

**Prueba a construir una:** elige un objeto, búscale un parecido inesperado y añade un detalle humano y prosaico. Ese es el mecanismo completo.

## Ejemplo guiado 2: la imagen surrealista

Versos de *Poeta en Nueva York*, de Lorca:

> *"Debajo de las multiplicaciones*
> *hay una gota de sangre de pato."*

**Paso 1 — Comprueba que la lógica no funciona.**
No existe relación racional entre "multiplicaciones" y "sangre de pato". Si intentas explicarlo literalmente, fracasas. Eso es **exactamente** la marca de la imagen surrealista.

**Paso 2 — Busca la lógica emocional, no la racional.**
- Las "**multiplicaciones**" evocan el cálculo, las cifras, la aritmética: el mundo del **capitalismo y la contabilidad**, que en el libro representa Wall Street.
- La "**gota de sangre**" es lo **vivo, orgánico y sufriente**.
- El conjunto sugiere que **bajo la fría maquinaria numérica late el sufrimiento de lo vivo**, aplastado y reducido a una gota.

**Paso 3 — Formula el hallazgo.**
La imagen no *significa* eso de manera unívoca: lo **sugiere** por asociación. El surrealismo no cifra un mensaje que haya que descodificar, sino que provoca una **reacción emocional** por choque de realidades distantes.

**Redacción para el examen:**
> *Los versos ejemplifican la **imagen surrealista** característica de* Poeta en Nueva York*. La asociación entre "multiplicaciones" y "gota de sangre de pato" carece de toda **lógica racional**: obedece a una lógica emocional, propia de la liberación del subconsciente que propugnaba Breton. El choque entre el campo semántico del **cálculo** —que en el libro remite al capitalismo neoyorquino— y el de lo **orgánico y sufriente** sugiere el aplastamiento de la vida bajo la maquinaria económica. Es preciso señalar, no obstante, que Lorca **no practica la escritura automática ortodoxa**: la imagen es irracional, pero su disposición en el poema responde a un control consciente, rasgo común al surrealismo español.*`,
    practice_prompt: 'Define greguería con la fórmula de Gómez de la Serna, analiza sus dos componentes en un ejemplo e inventa tres propias. Después redacta el tema "Las vanguardias en Europa, España e Hispanoamérica" en 200 palabras, con cuatro ismos europeos (fundador y rasgo) y tres hispánicos.',
    alert_markdown: '⚠️ **El surrealismo español no es ortodoxo.** Lorca, Alberti o Cernuda usan la imagen irracional pero **mantienen el control consciente del poema**: no practican la escritura automática pura de Breton. Señalar ese matiz demuestra criterio y se valora mucho.',
  },

  {
    sort_order: 50,
    title: 'La Generación del 27: Características',
    concept_markdown: `## Por qué "del 27"

El nombre procede del **acto de homenaje a Luis de Góngora** celebrado en el **Ateneo de Sevilla en diciembre de 1927**, con motivo del tercer centenario de su muerte. Al acto asistieron Alberti, Guillén, Bergamín, Dámaso Alonso, Gerardo Diego y Lorca, entre otros. Reivindicar a Góngora —despreciado durante siglos por "oscuro"— era toda una **declaración estética**: se defendía una poesía de **lenguaje elaborado, metáfora audaz y rigor formal**.

## Por qué son una generación

Cumplen los requisitos clásicos:
- **Nacen en fechas próximas** (1891-1905).
- Tienen **formación universitaria** y una cultura literaria extraordinaria.
- Muchos **conviven en la Residencia de Estudiantes** de Madrid, donde coinciden además con Dalí y Buñuel.
- Colaboran en las mismas **revistas**: *Revista de Occidente*, *Litoral*, *Carmen*, *Gallo*.
- Comparten un **acontecimiento generacional**: el homenaje de 1927.
- Mantienen relaciones de **amistad** personal muy estrechas.
- Tienen **talante liberal y progresista**, y casi todos apoyarán a la República.

## Nómina

**Pedro Salinas**, **Jorge Guillén**, **Gerardo Diego**, **Federico García Lorca**, **Rafael Alberti**, **Vicente Aleixandre**, **Luis Cernuda**, **Dámaso Alonso**, **Emilio Prados** y **Manuel Altolaguirre**.

**Las Sinsombrero.** Junto a ellos participaron plenamente en el grupo mujeres largo tiempo silenciadas por la historiografía: **Maruja Mallo** y **Ángeles Santos** (pintoras), **Concha Méndez** y **Ernestina de Champourcín** (poetas), **Rosa Chacel** (novelista), **María Zambrano** (filósofa), **María Teresa León** (escritora). El nombre alude al gesto de quitarse el sombrero en la Puerta del Sol como acto de rebeldía.

## El rasgo esencial: la síntesis

Lo que define al 27 no es un estilo común —cada uno tiene el suyo— sino su capacidad de **equilibrar términos aparentemente opuestos**:

| Tradición | Vanguardia |
|---|---|
| **Góngora** y el Barroco | **Surrealismo**, creacionismo, ultraísmo |
| **Lírica popular**: romance, cancionero, villancico | **Verso libre**, imagen irracional |
| **Clásicos**: Garcilaso, Lope, Manrique, San Juan | **Deshumanización** orteguiana |
| **Bécquer** y el simbolismo | Influencia de **Juan Ramón** |
| Estrofas clásicas: **soneto, décima, romance** | Supresión de la puntuación, caligramas |

Del mismo modo equilibran:
- Lo **intelectual** y lo **sentimental**
- Lo **culto** y lo **popular**
- Lo **universal** y lo **español**
- La **pureza estética** y el **compromiso humano**
- Lo **minoritario** y lo **mayoritario**

## La metáfora

Es su **recurso central** y el nexo de unión entre todos ellos. La llevan a un grado de audacia sin precedentes, influidos por Góngora, por Ramón Gómez de la Serna y por el surrealismo. En muchos casos la relación entre los dos términos deja de ser lógica y pasa a ser **puramente sensorial o emocional**.

## Las tres etapas

**1. Hasta 1927: poesía pura y neopopularismo**
Doble influencia de **Juan Ramón Jiménez** (poesía pura, depuración) y de la **lírica tradicional**.
- Poesía pura: *Cántico* de **Guillén** (1928), el ejemplo más riguroso.
- Neopopularismo: *Marinero en tierra* de **Alberti** (1925), *Romancero gitano* de **Lorca** (1928), *Poema del cante jondo*.
- Gongorismo y culto a la metáfora: *Manual de espumas* de **Gerardo Diego** (1924).

**2. De 1927 a la Guerra Civil: rehumanización y surrealismo**
La irrupción del **surrealismo** devuelve al poema los grandes conflictos humanos: el amor, el deseo frustrado, la angustia, la protesta social. La poesía se **rehumaniza**.
- ***Poeta en Nueva York***, Lorca (1929-30)
- ***Sobre los ángeles***, Alberti (1929)
- ***La destrucción o el amor***, Aleixandre (1935)
- ***La realidad y el deseo***, Cernuda
- Aparece además el **compromiso político**, sobre todo en Alberti (*El poeta en la calle*).

**3. Después de 1936: la dispersión**
La Guerra Civil trunca la generación:
- **Lorca es asesinado** en agosto de 1936, en Granada.
- Parten al **exilio** Salinas, Guillén, Alberti, Cernuda, Prados y Altolaguirre. En el exilio domina el tema de **España perdida** y la nostalgia.
- Permanecen en España **Dámaso Alonso**, **Vicente Aleixandre** y **Gerardo Diego**. Dámaso inaugura con ***Hijos de la ira*** (1944) la **poesía desarraigada** de posguerra.

## Trascendencia

El 27 representa la culminación de la llamada **Edad de Plata** de la cultura española (1900-1936), el momento de mayor esplendor de la literatura española desde el Siglo de Oro. La guerra la interrumpió bruscamente.`,
    worked_example_markdown: `## Ejemplo guiado: la síntesis tradición-vanguardia en un texto

Primeros versos del **"Romance sonámbulo"**, de *Romancero gitano* (1928), de Lorca:

> *"Verde que te quiero verde.*
> *Verde viento. Verdes ramas.*
> *El barco sobre la mar*
> *y el caballo en la montaña."*

**Paso 1 — Localiza la TRADICIÓN.**
- **Forma métrica:** es un **romance**, la estrofa más tradicional de la literatura española: serie indefinida de versos **octosílabos** con **rima asonante en los pares** y los impares sueltos. Procede de la Edad Media.
- **Léxico:** palabras comunes y patrimoniales (*verde*, *viento*, *ramas*, *barco*, *mar*, *caballo*, *montaña*). No hay un solo cultismo.
- **Recursos de la lírica popular:** la **repetición** obsesiva y el **paralelismo** ("El barco sobre la mar / y el caballo en la montaña"), típicos del cancionero tradicional.

**Paso 2 — Localiza la VANGUARDIA.**
- **"Verde viento"** es una **sinestesia** que atribuye color a algo incorpóreo: imagen de raíz vanguardista, imposible en un romance medieval.
- El **verde** funciona como **símbolo polivalente** e irracional: no significa una cosa concreta sino que sugiere a la vez **deseo, frustración y muerte**. Esa ambigüedad deliberada es surrealista.
- La **yuxtaposición** de barco y caballo, sin nexo lógico, crea una imagen onírica.

**Paso 3 — Comprueba la síntesis.**
Lorca **injerta metáforas de audacia vanguardista sobre un molde métrico tradicional**. Ni renuncia a la tradición ni a la modernidad: las funde. **Eso es exactamente la Generación del 27.**

**Paso 4 — El efecto.**
El molde popular hace que el poema resulte **memorable y musical**, casi de transmisión oral; las imágenes irracionales lo cargan de **misterio**. La combinación explica que el *Romancero gitano* fuera a la vez un éxito popular y una obra de altísima elaboración culta.

**Redacción final para el examen:**
> *Estos versos ilustran el rasgo definitorio de la Generación del 27: la **síntesis entre tradición y vanguardia**. Del lado **tradicional**, el poema adopta la forma del **romance** —octosílabos con rima asonante en los pares—, la estrofa más antigua y popular de la lírica española, y emplea un léxico patrimonial y recursos del cancionero como la **repetición** y el **paralelismo**. Del lado **vanguardista**, la **sinestesia** "verde viento" atribuye color a lo incorpóreo, y el **símbolo del verde** funciona de manera deliberadamente ambigua, sugiriendo a un tiempo deseo, frustración y muerte, con una lógica más emocional que racional propia del surrealismo. Lorca injerta así **imágenes de audacia vanguardista sobre un molde métrico tradicional**, procedimiento que explica que la obra alcanzara enorme éxito popular sin renunciar a una elaboración culta de primer orden.*

## Cómo se estructura el tema completo en el examen

Vale 2 puntos y conviene responderlo en este orden:
1. **Nombre y nómina** (por qué "del 27", quiénes son, mención a las Sinsombrero).
2. **Rasgos generacionales** (edad, Residencia, revistas, amistad).
3. **La síntesis tradición-vanguardia**, con al menos tres pares de opuestos.
4. **Las tres etapas**, con una obra fechada por etapa.
5. **Cierre**: Edad de Plata truncada por la guerra.`,
    practice_prompt: 'Redacta el tema "La Generación del 27: características y trayectoria poética" en 200 palabras siguiendo las cinco partes indicadas. Después coge un poema del "Romancero gitano" y localiza en él dos elementos de tradición (métricos o léxicos) y dos de vanguardia (imágenes o símbolos), explicando cómo conviven.',
    alert_markdown: '⚠️ **La síntesis tradición-vanguardia es LA respuesta.** Si en el examen solo enumeras autores y obras sin explicar ese equilibrio, has descrito el grupo pero no lo has definido. Es el concepto que el corrector busca en primer lugar.',
  },
]

async function main() {
  console.log(`Reescribiendo ${cards.length} misiones (42-50) con apuntes en profundidad…\n`)
  let ok = 0
  for (const c of cards) {
    const { error } = await supabase
      .from('curriculum_content_v2')
      .update({
        title: c.title,
        concept_markdown: c.concept_markdown,
        worked_example_markdown: c.worked_example_markdown,
        practice_prompt: c.practice_prompt,
        alert_markdown: c.alert_markdown ?? null,
      })
      .eq('subject', SUBJECT)
      .eq('sort_order', c.sort_order)

    if (error) {
      console.error(`✗ Error en ${c.sort_order}:`, error.message)
      process.exit(1)
    }
    ok++
    console.log(`✓ ${String(c.sort_order).padStart(2)}. ${c.title.padEnd(52)} teoría ${String(c.concept_markdown.length).padStart(4)} · caso ${String(c.worked_example_markdown.length).padStart(4)}`)
  }

  const avg = Math.round(cards.reduce((a, c) => a + c.concept_markdown.length, 0) / cards.length)
  console.log(`\n✅ ${ok} misiones actualizadas. Teoría media: ${avg} caracteres (Historia de España: 1811).`)
}

main()
