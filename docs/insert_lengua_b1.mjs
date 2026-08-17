// Uso: node --env-file=.env.local docs/insert_lengua_b1.mjs
// Bloque 1 — Comunicación: cards 1-15
//
// Calibrado sobre los 45 exámenes oficiales de Madrid (2018-2026) que están en
// app/data/lengua.ts. El bloque 1 vale 4 de los 10 puntos y siempre se reparte igual:
//   1.1 comentario  → tema (0,5) + características lingüísticas y estilísticas (1,3) + tipo de texto (0,2)
//   1.2 resumen de 40-50 palabras (0,6)
//   1.3 texto argumentativo de 100-150 palabras (1,4)
// Por eso 1.1.b (características lingüísticas) es la pregunta mejor pagada del examen
// entero y se le dedican varias misiones.

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY
)

const SUBJECT = 'lengua'
const BLOCK_KEY = 'Comunicación'
const BLOCK_SLUG = 'comunicacion'

const cards = [
  {
    sort_order: 1,
    title: 'El Examen de Lengua en la PAU: Estructura y Reparto de Puntos',
    concept_markdown: `## Cómo es el examen (Madrid)

**90 minutos** y **tres bloques**. Se elige entre **dos textos** y se responde a todo sobre el texto elegido.

| Bloque | Preguntas | Puntos |
|---|---|---|
| **1. Comunicación** | 1.1 comentario + 1.2 resumen + 1.3 argumentación | **4** |
| **2. Reflexión sobre la lengua** | una de 1,4 + dos de 0,8 | **3** |
| **3. Educación literaria** | una de 2 + una de 1 | **3** |

### El desglose del bloque 1
- **1.1 (2 pts):** a) tema *(0,5)*, b) características lingüísticas y estilísticas *(1,3)*, c) tipo de texto *(0,2)*
- **1.2 (0,6 pts):** resumen de **40-50 palabras**
- **1.3 (1,4 pts):** texto argumentativo de **100-150 palabras**

### Lo que casi nadie tiene en cuenta
La pregunta **1.1.b vale 1,3 puntos**: es la mejor pagada de todo el examen. Más que cualquier tema de literatura de 2 puntos dividido entre su extensión. Ahí es donde se gana o se pierde el notable.`,
    worked_example_markdown: `**Estrategia de reparto del tiempo (90 minutos):**

| Fase | Tiempo | Por qué |
|---|---|---|
| Leer los dos textos y elegir | 8 min | Elegir mal cuesta más que los 8 minutos |
| Bloque 1 completo | 35 min | Es el que más vale (4 pts) |
| Bloque 2 | 20 min | Sintaxis: la que más se practica, la más rápida |
| Bloque 3 | 22 min | Los temas se llevan memorizados |
| Repasar ortografía | 5 min | Las tildes restan |

**Criterio de elección del texto:** no elijas por el tema que te guste, elige aquel del que **sepas decir más cosas de lengua** (que tenga marcas claras de subjetividad, figuras retóricas visibles, estructura reconocible). El bloque 1.1.b se responde sobre el texto, no sobre tus opiniones.`,
    practice_prompt: 'Coge un examen oficial de Lengua de Madrid de cualquier año y, sin responderlo, identifica en 5 minutos: qué puntúa cada pregunta, cuántas palabras te piden en el resumen y en el texto argumentativo, y cuáles son las preguntas opcionales.',
    alert_markdown: '⚠️ **La ortografía resta.** Cada grafía errónea descuenta y cada tilde también, hasta un máximo fijado en los criterios de corrección. Un examen brillante con 10 faltas puede perder más puntos que una pregunta entera sin contestar.',
  },

  {
    sort_order: 2,
    title: 'El Tema del Texto: Cómo Enunciarlo (0,5 puntos)',
    concept_markdown: `## El tema

El tema es la **idea central del texto condensada en una sola frase**, sin verbo principal conjugado si es posible, y siempre en **tercera persona y con lenguaje objetivo**.

### Cómo se construye
Se suele formular con un **sustantivo abstracto** que nombre el asunto + su delimitación:
- *Crítica de…*
- *Reflexión sobre…*
- *Defensa de…*
- *Denuncia de…*

### Requisitos
- **Breve:** una línea o dos, nunca un párrafo.
- **Abstracto:** no cuenta anécdotas ni ejemplos concretos del texto.
- **Completo:** debe incluir el enfoque del autor, no solo el asunto.

### La diferencia clave con el resumen
- **Tema** = de *qué* trata (una frase, abstracta).
- **Resumen** = *qué dice* (40-50 palabras, sigue el hilo del texto).`,
    worked_example_markdown: `**Texto:** el artículo de Laura G. de Rivera sobre la palabra "disruptivo" y la tecnología (modelo PAU 2026), donde critica que adoptamos innovaciones de IA sin entender sus consecuencias.

**Tema mal formulado (0 puntos):**
> *El texto habla de la tecnología y de Mark Zuckerberg.* ❌

Falla porque: usa "el texto habla de", nombra un ejemplo concreto y no dice cuál es el enfoque.

**Tema bien formulado (0,5 puntos):**
> *Crítica del uso acrítico del término "disruptivo" y de la adopción precipitada de las innovaciones tecnológicas sin valorar sus consecuencias sociales y humanas.* ✅

Funciona porque: empieza por un sustantivo abstracto (*crítica*), recoge el enfoque del autor (es crítico, no neutral) y no se pierde en ejemplos.`,
    practice_prompt: 'Enuncia el tema de un artículo de opinión de un periódico en una sola frase que empiece por un sustantivo abstracto (crítica, defensa, reflexión, denuncia…) y que no contenga ningún ejemplo concreto del texto.',
    alert_markdown: '⚠️ **Nunca empieces con "El texto trata de…" ni "El autor habla de…".** El tema es un enunciado nominal, no una descripción de lo que hace el texto. Es el error más penalizado en esta pregunta.',
  },

  {
    sort_order: 3,
    title: 'El Resumen: 40-50 Palabras Exactas (0,6 puntos)',
    concept_markdown: `## El resumen

Reproducir el **contenido esencial** del texto respetando su orden y su lógica, en **40-50 palabras**. Se penaliza pasarse y quedarse corto.

### Reglas
1. **Tercera persona** y objetividad: nada de *"el autor dice que…"* ni *"en mi opinión"*.
2. **No copies frases literales** del texto: reformula con tus palabras.
3. **Sin ejemplos, sin cifras, sin nombres propios** salvo que sean imprescindibles.
4. **Mantén el hilo argumental**: si el texto va de A a B a C, el resumen también.

### Método en tres pasos
1. Subraya la **idea principal de cada párrafo** (una por párrafo).
2. Enlázalas con conectores para que suene a texto, no a lista.
3. **Cuenta las palabras.** Literalmente, cuéntalas.

### Qué se elimina
Los ejemplos, las repeticiones, las citas de apoyo y las digresiones. Se queda el esqueleto argumental.`,
    worked_example_markdown: `**Texto de partida:** artículo que critica la adopción acrítica de la IA, con el ejemplo de Zuckerberg ("muévete rápido y rompe cosas"), datos de un estudio de Cisco de 2024 y la definición de la RAE de "disruptivo".

**Resumen malo:**
> *El autor habla de que la palabra disruptivo según la RAE significa romper y pone el ejemplo de Mark Zuckerberg de Facebook Meta, y también cita un estudio de Cisco de 2024 que dice que el 91 por ciento…* ❌

Falla: usa "el autor habla", copia ejemplos, nombres y cifras, y se pasa de extensión.

**Resumen bueno (47 palabras):**
> *El término "disruptivo" se emplea como sinónimo de innovación pese a significar ruptura brusca. Las grandes tecnológicas lanzan productos sin evaluar sus riesgos y priorizan el beneficio sobre el bienestar de las personas. La sociedad adopta estas innovaciones antes de comprender sus consecuencias sociales y morales.* ✅

Funciona: tercera persona, sin ejemplos ni cifras, respeta el orden del original y cabe en el rango.`,
    practice_prompt: 'Resume un artículo de opinión de unas 500 palabras en exactamente 40-50 palabras. Después cuenta las palabras una a una y comprueba que no has copiado ninguna frase literal del original.',
    alert_markdown: '⚠️ **Cuenta las palabras de verdad.** Es la única pregunta del examen donde el número está fijado por escrito. Escribir 60 palabras magníficas puntúa menos que 45 correctas.',
  },

  {
    sort_order: 4,
    title: 'Las Tipologías Textuales: Identificar el Tipo de Texto (0,2 puntos)',
    concept_markdown: `## Las cinco modalidades textuales

| Modalidad | Para qué sirve | Marcas lingüísticas |
|---|---|---|
| **Narrativa** | Contar hechos en el tiempo | Verbos perfectivos, marcadores temporales, 3ª persona |
| **Descriptiva** | Decir cómo es algo | Adjetivos, verbos de estado, presente e imperfecto |
| **Expositiva** | Explicar, informar | Objetividad, 3ª persona, tecnicismos, orden lógico |
| **Argumentativa** | Convencer | Tesis, conectores causales, 1ª persona, valoración |
| **Dialógica** | Reproducir voces | Guiones, vocativos, interrogaciones, deixis |

### Lo importante para la PAU
La respuesta a 1.1.c casi nunca es una sola etiqueta. Los textos de la PAU son **artículos de opinión periodísticos**, es decir:

> **Texto argumentativo-expositivo del ámbito periodístico, del género artículo de opinión (o columna), con función apelativa y expresiva.**

### La fórmula completa
Menciona siempre tres cosas: **modalidad** (argumentativa…), **ámbito de uso** (periodístico, literario, científico…) y **género** (columna, editorial, ensayo…).`,
    worked_example_markdown: `**Pregunta tipo PAU:** *Indique qué tipo de texto es (0,2 puntos).*

**Respuesta de 0,1:**
> *Es un texto argumentativo.* ⚠️ Correcto pero incompleto.

**Respuesta de 0,2:**
> *Se trata de un texto **argumentativo** con secuencias **expositivas**, perteneciente al **ámbito periodístico**, concretamente al género del **artículo de opinión**. Predominan la **función apelativa** (busca persuadir al lector) y la **expresiva** (el autor manifiesta su punto de vista mediante marcas de subjetividad).* ✅

**Truco:** vale 0,2 puntos y se responde en 30 segundos si llevas la fórmula memorizada. Es el punto más barato del examen: no lo dejes en blanco nunca.`,
    practice_prompt: 'Clasifica estos tres textos indicando modalidad, ámbito y género: (a) una columna de opinión de un periódico, (b) el prospecto de un medicamento, (c) un fragmento de novela con diálogo. Justifica cada uno con dos marcas lingüísticas.',
    alert_markdown: null,
  },

  {
    sort_order: 5,
    title: 'Los Géneros Periodísticos de Opinión',
    concept_markdown: `## Los géneros que caen en la PAU

Casi todos los textos de la PAU de Madrid son **géneros de opinión** de prensa. Distinguirlos da precisión a la pregunta 1.1.c.

| Género | Quién firma | Rasgos |
|---|---|---|
| **Editorial** | **Sin firma** (opinión del periódico) | Tono institucional, 1ª persona del plural, gran objetividad aparente |
| **Artículo de opinión** | Firmado por un colaborador | Tema libre, estilo personal, argumentación desarrollada |
| **Columna** | Firmado, sección y extensión **fijas** | Breve, muy literaria, tono personal e irónico |
| **Crítica** | Firmado por un especialista | Valora una obra (cine, libro, teatro) |
| **Carta al director** | Firmado por un lector | Breve, tono directo, a menudo de queja |

### Géneros informativos (por contraste)
**Noticia** (objetiva, pirámide invertida), **reportaje** (más extenso y documentado), **entrevista** (dialógica), **crónica** (informa + valora, con firma).

### La clave para distinguirlos
- ¿Está **firmado**? Si no, es editorial.
- ¿Es **muy breve y literario**? Columna.
- ¿**Valora una obra** concreta? Crítica.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *Indique el género periodístico del texto y justifique su respuesta.*

**Aplicado al texto de Juan Soto Ivars publicado en *El Confidencial* (modelo 2026):**

> *Es un **artículo de opinión** del ámbito periodístico. Lo justifican tres rasgos: aparece **firmado** por su autor y con indicación del medio y la fecha, lo que descarta el editorial; desarrolla una **argumentación personal** sobre la ideología de la autorrealización, con tesis propia y ejemplos autobiográficos; y emplea un **estilo subjetivo y literario** (1ª persona, metáforas como "un suelo de marisma"), impropio de un texto informativo.*

**Fíjate en el método:** no basta con nombrar el género, hay que **justificarlo con rasgos del texto**. Tres rasgos concretos = respuesta completa.`,
    practice_prompt: 'Busca en un periódico digital un editorial y una columna. Anota tres diferencias observables entre ambos (firma, extensión, persona gramatical, tono) y redacta una justificación de dos líneas para cada género.',
    alert_markdown: '⚠️ **Editorial ≠ artículo de opinión.** El editorial **no va firmado** porque expresa la postura del periódico como institución. Si el texto lleva nombre de autor, nunca es un editorial.',
  },

  {
    sort_order: 6,
    title: 'Las Funciones del Lenguaje',
    concept_markdown: `## Las seis funciones (Jakobson)

Cada función se asocia a un elemento de la comunicación y **deja marcas lingüísticas concretas** que puedes citar en el comentario.

| Función | Elemento | Marcas en el texto |
|---|---|---|
| **Representativa** (referencial) | Contexto | 3ª persona, indicativo, objetividad, datos |
| **Expresiva** (emotiva) | Emisor | 1ª persona, valoración, exclamaciones, subjetivemas |
| **Apelativa** (conativa) | Receptor | 2ª persona, imperativo, vocativos, interrogación retórica |
| **Poética** | Mensaje | Figuras retóricas, ritmo, cuidado de la forma |
| **Fática** | Canal | *¿Me sigues?*, *oye*, *bueno* |
| **Metalingüística** | Código | El lenguaje habla de sí mismo: *"disruptivo" significa…* |

### En los textos de la PAU
Predominan casi siempre **dos**: la **expresiva** (el autor opina) y la **apelativa** (quiere convencerte). La **representativa** aparece cuando aporta datos.

La **poética** es muy rentable de mencionar si el texto tiene metáforas o juegos de palabras: demuestra que has leído con atención.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *Señale y explique las funciones del lenguaje presentes en el texto.*

**Modelo de respuesta (sobre el artículo del término "disruptivo"):**

> *Predomina la **función apelativa**, pues el texto busca modificar la actitud del lector ante la tecnología, como muestra la interrogación retórica "¿Una rotura o una interrupción brusca es algo deseable?", que interpela directamente.*
>
> *Se combina con la **función expresiva**, visible en el plural inclusivo "no lo sabemos" y en el léxico valorativo con carga irónica ("como si fuera sinónimo de… ser muy cool").*
>
> *Aparece además la **función metalingüística**, ya que el texto reflexiona sobre el significado de una palabra y cita la definición de la RAE y de la Fundéu.*
>
> *Finalmente, la **función representativa** sostiene la argumentación mediante datos objetivos (el estudio de Cisco de 2024).*

**La estructura que puntúa:** nombrar la función → explicar por qué → **citar la marca literal entre comillas**.`,
    practice_prompt: 'Identifica las funciones del lenguaje predominantes en un artículo de opinión y justifica cada una citando literalmente una marca del texto entre comillas.',
    alert_markdown: '⚠️ **Nombrar la función sin citar el texto no puntúa.** "Hay función apelativa" vale poco; "hay función apelativa, como prueba la interrogación retórica *¿…?*" vale el punto entero.',
  },

  {
    sort_order: 7,
    title: 'La Modalización: Detectar las Marcas de Subjetividad',
    concept_markdown: `## Modalización

Es el conjunto de **huellas que el emisor deja en su mensaje**. Localizarlas es el núcleo de la pregunta mejor pagada del examen (1.1.b, 1,3 puntos).

### Dónde buscar, en orden

**1. Deixis personal**
1ª persona del singular (*creo, pienso, renuncié*) o **plural inclusivo** (*nos hemos metido, no lo sabemos*), que busca la complicidad del lector.

**2. Léxico valorativo (subjetivemas)**
Adjetivos y sustantivos que califican en vez de describir: *fulgurante*, *precipitada*, *salvajito*. También los **diminutivos y aumentativos** con valor afectivo o despectivo.

**3. Modalidades oracionales**
- **Interrogativas retóricas:** *¿Es algo deseable?*
- **Exclamativas:** *¡No ha cumplido los cuatro años!*
- **Dubitativas:** *quizá*, *tal vez*
- **Desiderativas** e **imperativas**

**4. Verbos y perífrasis modales**
*Tendemos a adoptarlas*, *habría que cambiar*, *se puede tener*.

**5. Recursos tipográficos**
Comillas irónicas ("disruptivo"), cursivas, puntos suspensivos.`,
    worked_example_markdown: `**Cómo se redacta el hallazgo (fragmento de una respuesta a 1.1.b):**

> *El texto está fuertemente **modalizado**. En primer lugar, mediante la **deixis personal**: el autor emplea el **plural inclusivo** en "nos hemos metido de cabeza" y "lo mismo nos pasa a la gente de a pie", con el que se incluye a sí mismo en la crítica y busca la complicidad del lector, evitando el tono acusatorio.*
>
> *En segundo lugar, mediante el **léxico valorativo**: el adjetivo "fulgurante" aplicado a la carrera de Meta funciona irónicamente, y las **comillas** en "disruptivo" marcan distancia crítica respecto al término.*
>
> *Por último, la **interrogación retórica** "¿Una rotura o una interrupción brusca es algo deseable?" no busca información, sino orientar la respuesta del lector hacia la tesis del autor.*

**El esquema que se repite:** *mecanismo* → *cita literal* → *efecto que produce*. Ese tercer elemento (el efecto) es el que distingue un 0,8 de un 1,3.`,
    practice_prompt: 'Localiza en un artículo de opinión cinco marcas de modalización de tipos distintos (deixis personal, léxico valorativo, interrogación retórica, perífrasis modal, comillas irónicas). Para cada una, explica en una línea qué efecto produce en el lector.',
    alert_markdown: '⚠️ **No confundas modalización con modalidad textual.** La *modalización* son las marcas de subjetividad del emisor; la *modalidad textual* es el tipo de texto (narrativo, argumentativo…).',
  },

  {
    sort_order: 8,
    title: 'La Coherencia: La Estructura Interna del Texto',
    concept_markdown: `## Coherencia

Propiedad por la que un texto se percibe como una **unidad de sentido**: todas sus partes giran en torno a un mismo tema y se ordenan con lógica.

### Las tres condiciones
1. **Unidad temática:** todo el texto desarrolla un mismo asunto.
2. **Progresión informativa:** cada párrafo aporta información nueva sin contradecir lo anterior.
3. **Estructura reconocible:** las ideas están organizadas.

### Las estructuras que hay que saber nombrar

| Estructura | Cómo funciona |
|---|---|
| **Deductiva** (analizante) | La tesis va **al principio** y luego se argumenta |
| **Inductiva** (sintetizante) | Los argumentos primero, la **tesis al final** |
| **Encuadrada** | Tesis al principio, se argumenta y **se repite al final** |
| **Paralela** | Ideas del mismo nivel, sin jerarquía entre ellas |
| **Circular** | El texto termina donde empezó |

### Cómo se responde
Divide el texto en **partes numeradas por líneas o párrafos** y ponle nombre a cada una:
> *El texto presenta estructura **inductiva** y se organiza en tres partes: introducción o marco (líneas 1-5), donde…*`,
    worked_example_markdown: `**Modelo de respuesta sobre estructura:**

> *El texto presenta una **estructura inductiva o sintetizante**, pues la tesis no se enuncia hasta el final.*
>
> *Puede dividirse en **tres partes**:*
> - ***Primera parte (líneas 1-6):*** *planteamiento anecdótico. El autor narra en primera persona su renuncia a una comida con amigos, lo que sirve de punto de partida concreto.*
> - ***Segunda parte (líneas 7-14):*** *generalización. La anécdota personal se amplía a un fenómeno social observable en las entrevistas a personas famosas.*
> - ***Tercera parte (líneas 15-24):*** *tesis. El autor formula su idea central: la ideología dominante de la autorrealización oculta que "a todos nos han construido otros".*
>
> *Esta disposición, que va **de lo particular a lo general**, resulta especialmente persuasiva porque el lector recorre el razonamiento junto al autor antes de encontrarse con la conclusión.*

**Fíjate:** siempre se cierra explicando **por qué esa estructura es eficaz**. Ese remate sube la nota.`,
    practice_prompt: 'Divide un artículo de opinión en partes indicando las líneas de cada una, ponle un nombre a cada parte y determina si la estructura es deductiva, inductiva o encuadrada. Justifica dónde está la tesis.',
    alert_markdown: '⚠️ **Coherencia ≠ cohesión.** La *coherencia* es la unidad de sentido y la estructura (nivel del contenido); la *cohesión* son los mecanismos gramaticales que enlazan las partes (nivel de la forma).',
  },

  {
    sort_order: 9,
    title: 'La Cohesión: Los Mecanismos que Enlazan el Texto',
    concept_markdown: `## Cohesión

Conjunto de **mecanismos lingüísticos** que enlazan unas partes del texto con otras. Es lo que se pide cuando preguntan por los "mecanismos de cohesión".

### 1. Recurrencia (repetición)
- **Léxica:** se repite la misma palabra.
- **Semántica:** se repite el significado con **sinónimos** (*perro / can*), **hiperónimos** (*perro / animal*) o **antónimos**.
- **Sintáctica (paralelismo):** se repite una estructura.

### 2. Sustitución
Una palabra reemplaza a otra ya aparecida:
- **Pronominal:** *La perra ladraba. **Esta** no paraba.*
- **Léxica:** por un sinónimo o una **proforma** (*hacer*, *cosa*, *asunto*).

### 3. Elipsis
Se omite un elemento recuperable: *Juan llegó tarde y ∅ se disculpó.*

### 4. Deixis
Palabras que señalan al contexto: **personal** (*yo, tú*), **espacial** (*aquí, este*), **temporal** (*hoy, entonces*).

### 5. Marcadores discursivos
Conectan ideas: *sin embargo, por tanto, en primer lugar*.

### 6. Isotopías o campos semánticos
Conjunto de palabras del mismo ámbito de significado que recorren el texto y refuerzan su unidad.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *Analice los mecanismos de cohesión del texto.*

**Modelo de respuesta:**

> *El texto se cohesiona mediante varios mecanismos.*
>
> *Destaca la **recurrencia semántica** a través del **campo semántico de la tecnología** ("disruptivo", "innovación", "vanguardia", "inteligencia artificial", "IA generativa"), que recorre todo el texto y garantiza su unidad temática.*
>
> *Se emplea también la **sustitución pronominal**: en "tendemos a adoptarlas", el pronombre "las" remite anafóricamente a "innovaciones", evitando la repetición.*
>
> *Los **marcadores discursivos** ordenan la argumentación: "quizá" introduce una matización dubitativa y "lo mismo" establece una relación de semejanza entre el comportamiento de las empresas y el de los ciudadanos.*
>
> *Por último, la **deixis personal** en primera persona del plural ("nos hemos metido", "no sabemos") mantiene la cohesión entre emisor y receptor a lo largo del texto.*

**El patrón:** nombrar el mecanismo → citar el ejemplo → explicar qué enlaza.`,
    practice_prompt: 'Localiza en un texto argumentativo un ejemplo de cada uno de estos mecanismos: recurrencia léxica, sustitución pronominal, elipsis, deixis y campo semántico. Indica exactamente qué elemento enlaza cada uno con cuál.',
    alert_markdown: '⚠️ **Anáfora tiene dos sentidos.** Como mecanismo de cohesión, es un elemento que remite a algo **ya dicho** (*Compré un libro y **lo** leí*). Como figura retórica, es la **repetición al inicio** de varios versos. En el comentario, aclara en qué sentido la usas.',
  },

  {
    sort_order: 10,
    title: 'Los Marcadores Discursivos: Clasificación y Uso',
    concept_markdown: `## Marcadores discursivos

Palabras o locuciones **invariables** que no desempeñan función sintáctica dentro de la oración, sino que **guían la interpretación** del discurso.

| Tipo | Función | Ejemplos |
|---|---|---|
| **Estructuradores** | Ordenan la información | *en primer lugar, por una parte, por otro lado* |
| **Conectores aditivos** | Suman | *además, asimismo, incluso* |
| **Conectores consecutivos** | Indican consecuencia | *por tanto, así pues, en consecuencia* |
| **Conectores contraargumentativos** | Oponen | *sin embargo, no obstante, ahora bien, en cambio* |
| **Reformuladores** | Reexplican | *es decir, o sea, en otras palabras, en definitiva* |
| **Operadores argumentativos** | Refuerzan o ejemplifican | *de hecho, en realidad, por ejemplo* |
| **Marcadores conversacionales** | Regulan el diálogo | *bueno, claro, hombre, oye* |

### Por qué importan en el comentario
Los marcadores **revelan el tipo de argumentación**: abundancia de contraargumentativos indica un texto que dialoga con posturas contrarias; abundancia de consecutivos indica razonamiento lógico encadenado.

### Cómo se distinguen de las conjunciones
Los marcadores son **móviles** (pueden cambiar de posición) y van **entre comas**: *Sin embargo, llegó.* / *Llegó, sin embargo, tarde.*`,
    worked_example_markdown: `**Pregunta tipo PAU:** *Explique el valor de los marcadores discursivos presentes en el texto.*

**Modelo de respuesta:**

> *Los marcadores organizan la progresión argumentativa del texto.*
>
> *El **reformulador** "es decir" introduce una precisión del concepto anterior, propia de un texto que busca la claridad expositiva antes de argumentar.*
>
> *El **conector contraargumentativo** "sin embargo" marca el giro central del texto: presenta la objeción del autor a la tesis dominante, y es el punto donde arranca su propia argumentación.*
>
> *El **operador argumentativo** "de hecho" refuerza lo dicho aportando un dato que lo respalda, estrategia con la que el autor apuntala su credibilidad.*
>
> *En conjunto, el predominio de **contraargumentativos** revela un texto **dialógico**, que se construye rebatiendo una postura previa que se da por conocida.*

**El remate que puntúa:** la última frase, donde se extrae una conclusión global del conjunto de marcadores.`,
    practice_prompt: 'Localiza cinco marcadores discursivos en un artículo de opinión, clasifícalos por tipo y explica qué relación lógica establece cada uno entre las ideas que une.',
    alert_markdown: '⚠️ **Un marcador no tiene función sintáctica.** Si te preguntan la función de *sin embargo* en un análisis sintáctico, la respuesta es que **no desempeña ninguna**: es un marcador extraoracional, no un complemento circunstancial.',
  },

  {
    sort_order: 11,
    title: 'La Adecuación y el Registro',
    concept_markdown: `## Adecuación

Propiedad por la que el texto **se ajusta a su situación comunicativa**: emisor, receptor, canal, intención y ámbito de uso.

### Qué hay que analizar

**1. Emisor y receptor**
¿Quién escribe y para quién? En la PAU: un periodista o escritor para un **lector medio culto** de prensa generalista.

**2. Intención comunicativa**
Persuadir, informar, denunciar, entretener.

**3. Canal y ámbito**
Escrito, medio de comunicación de masas, ámbito **periodístico**.

**4. Registro**

| Registro | Rasgos |
|---|---|
| **Culto/formal** | Sintaxis compleja, léxico preciso, tecnicismos |
| **Estándar** | Norma común, accesible, sin vulgarismos ni tecnicismos |
| **Coloquial** | Espontaneidad, frases hechas, elipsis, apelaciones |
| **Vulgar** | Incorrecciones, tacos, vulgarismos |

### El registro típico de la PAU
**Estándar culto** con **rasgos coloquiales deliberados** (expresiones como "la gente de a pie", "meterse de cabeza"), que acercan el texto al lector sin perder rigor. Ese contraste siempre es comentable.`,
    worked_example_markdown: `**Modelo de respuesta sobre adecuación:**

> *El texto resulta plenamente **adecuado** a su situación comunicativa. Su **emisor** es un columnista que escribe desde su autoridad como observador social; su **receptor**, un lector medio culto de prensa digital, al que se presupone familiarizado con los debates sobre tecnología.*
>
> *La **intención** es claramente **persuasiva**: no se limita a informar sobre el uso del término "disruptivo", sino que busca modificar la actitud acrítica del lector.*
>
> *El **registro** es **estándar culto**, con léxico preciso y tecnicismos del ámbito digital ("IA generativa", "modus operandi"), pero se combina deliberadamente con **expresiones coloquiales** ("muy cool", "la gente de a pie", "nos hemos metido de cabeza").*
>
> *Esta **mezcla de registros** no es un defecto sino una **estrategia de aproximación**: acerca un tema técnico al lector no especializado y refuerza el plural inclusivo con el que el autor se sitúa a su mismo nivel.*

**La clave:** cuando detectes una mezcla de registros, no la señales como error, **explícala como estrategia**.`,
    practice_prompt: 'Analiza la adecuación de un artículo de opinión: identifica emisor, receptor, intención, canal y registro. Localiza al menos dos expresiones coloquiales dentro de un texto culto y explica qué efecto buscan.',
    alert_markdown: null,
  },

  {
    sort_order: 12,
    title: 'Las Figuras Retóricas Rentables en el Comentario',
    concept_markdown: `## Las que de verdad aparecen

No hace falta el catálogo entero: en los textos periodísticos de la PAU se repiten siempre las mismas.

### Figuras de repetición
- **Anáfora:** repetición al principio (*"en perseguir tus sueños, en cumplir tus metas, en alcanzar…"*)
- **Paralelismo:** repetición de la misma estructura sintáctica
- **Enumeración:** serie de elementos
- **Polisíndeton** (repetición de conjunciones) y **asíndeton** (supresión)

### Figuras de significado
- **Metáfora:** identificación (*"la ideología… como un suelo de marisma"*)
- **Símil o comparación:** con nexo (*como, cual*)
- **Personificación:** atribuir rasgos humanos (*"también dice, la ideología…"*)
- **Hipérbole:** exageración
- **Metonimia:** designar algo por una relación de contigüidad (*la Casa Blanca* = el gobierno)
- **Ironía:** decir lo contrario de lo que se piensa

### Figuras de construcción
- **Antítesis:** contraposición (*"No renunciaron a nada: renunciaron a mucho"*)
- **Paradoja:** contradicción aparente que encierra verdad
- **Interrogación retórica:** pregunta que no espera respuesta
- **Hipérbaton:** alteración del orden`,
    worked_example_markdown: `**Cómo se comenta una figura (bien y mal):**

**Mal:**
> *Hay una metáfora en "un suelo de marisma".* ❌ Solo identifica.

**Bien:**
> *El autor recurre a una **metáfora** de gran plasticidad al describir la ideología como *"un suelo de marisma"* sobre el que se apoyan las ideas. La imagen resulta especialmente eficaz porque la marisma es un terreno **inestable y movedizo**: sugiere que los principios morales que creemos firmes se sostienen en realidad sobre una base que cede, de ahí que "salgan inclinados". La figura condensa así la tesis del texto en una sola imagen.* ✅

**El esquema de tres pasos:**
1. **Nombrar** la figura y **citarla** literalmente.
2. **Explicar** en qué consiste la identificación o el juego.
3. **Interpretar** qué aporta al sentido del texto.

El paso 3 es el que casi nadie da y el que sube la nota.`,
    practice_prompt: 'Localiza tres figuras retóricas distintas en un artículo de opinión. Para cada una: nómbrala, cítala literalmente y explica en dos líneas qué aporta al sentido del texto (no basta con identificarla).',
    alert_markdown: '⚠️ **No hagas una lista de figuras.** Enumerar diez figuras sin interpretarlas puntúa menos que comentar tres bien. El corrector busca *interpretación*, no inventario.',
  },

  {
    sort_order: 13,
    title: 'Características Lingüísticas y Estilísticas: El Método Completo (1,3 puntos)',
    concept_markdown: `## La pregunta mejor pagada del examen

**1,3 puntos.** Se responde recorriendo el texto por **niveles lingüísticos**, de menor a mayor. Ese orden es el que espera el corrector.

### Los cuatro niveles

**1. Nivel morfológico**
Qué categorías predominan y por qué: abundancia de **adjetivos valorativos** (subjetividad), de **sustantivos abstractos** (reflexión), de **verbos en presente** (validez general) o en pasado (narración). Sufijos apreciativos.

**2. Nivel sintáctico**
- **Modalidades oracionales:** interrogativas, exclamativas…
- **Tipo de oraciones:** ¿predominio de **simples y yuxtapuestas** (agilidad, estilo cortado) o de **subordinadas** (razonamiento complejo)?
- **Orden:** hipérbaton, anteposición enfática.

**3. Nivel léxico-semántico**
- **Campos semánticos** dominantes
- **Léxico valorativo**, tecnicismos, coloquialismos, neologismos, extranjerismos
- **Connotación** frente a denotación

**4. Nivel pragmático-textual**
Modalización, deixis, funciones del lenguaje, marcadores, figuras retóricas.

### La regla de oro
**Nunca describas sin interpretar.** Cada rasgo debe ir seguido de *"lo que produce / lo que revela / con lo que el autor consigue…"*.`,
    worked_example_markdown: `**Esqueleto de respuesta completa (1,3 puntos):**

> *Desde el punto de vista **morfológico**, destaca la abundancia de **sustantivos abstractos** ("ideología", "prestigio", "autodeterminación"), coherente con el carácter reflexivo del texto, y el uso del **presente de indicativo con valor gnómico** ("la ideología es lo que no se ve"), con el que el autor presenta su opinión como verdad general.*
>
> *En el nivel **sintáctico**, alternan **oraciones simples de gran brevedad** ("No renunciaron a nada: renunciaron a mucho"), que funcionan como sentencias, con **períodos subordinados extensos** que desarrollan el razonamiento. Este contraste rítmico impide la monotonía y destaca las conclusiones.*
>
> *En el nivel **léxico-semántico**, se articulan dos campos opuestos: el de la **realización personal** ("sueños", "metas", "dueño de uno mismo") y el de la **renuncia** ("renunciar", "freno"), cuya tensión sostiene la tesis.*
>
> *Por último, en el nivel **pragmático**, el texto está intensamente **modalizado** mediante la primera persona y las **interrogaciones retóricas** ("¿he renunciado hoy a algo?"), que trasladan al lector el proceso de reflexión del autor.*

**Cuatro párrafos, uno por nivel.** Es la estructura que garantiza no dejarse nada.`,
    practice_prompt: 'Comenta las características lingüísticas y estilísticas de un artículo de opinión siguiendo los cuatro niveles (morfológico, sintáctico, léxico-semántico y pragmático). Dedica un párrafo a cada uno y cita al menos dos ejemplos literales por nivel.',
    alert_markdown: '⚠️ **Es la pregunta que más puntúa (1,3) y la que más gente improvisa.** Llevar memorizado el esquema de los cuatro niveles convierte una pregunta difícil en una plantilla que solo hay que rellenar con ejemplos del texto.',
  },

  {
    sort_order: 14,
    title: 'El Texto Argumentativo: Estructura de la Respuesta (1,4 puntos)',
    concept_markdown: `## La pregunta 1.3

Te piden **100-150 palabras** manifestando **acuerdo o desacuerdo** con alguna idea del texto. No es un resumen ni un comentario: es **tu argumentación**.

### Qué se valora
1. Que tomes **postura clara**.
2. Que la **argumentes** (no que la repitas).
3. **Coherencia, cohesión y corrección** en la redacción.
4. La **extensión** pedida.

### Estructura recomendada

| Parte | Extensión | Contenido |
|---|---|---|
| **Introducción** | 1-2 frases | Enuncias el asunto y tu **tesis** |
| **Cuerpo** | 3-4 frases | **Dos argumentos** con un ejemplo cada uno |
| **Conclusión** | 1 frase | Cierras reforzando la tesis |

### Recursos que suman
- **Marcadores** que ordenen: *en primer lugar, por otra parte, en definitiva*.
- **Concesión** antes de rebatir: *si bien es cierto que…, no obstante…* Demuestra madurez argumentativa.
- **Ejemplos concretos** y actuales.

### Lo que resta
Generalidades vacías (*"desde el principio de los tiempos…"*), tópicos, y limitarse a parafrasear el texto sin aportar nada.`,
    worked_example_markdown: `**Pregunta:** *Elabore un texto argumentativo de entre 100 y 150 palabras sobre el contenido del texto, manifestando acuerdo o desacuerdo con alguna de las ideas que refleja.*

**Modelo (128 palabras):**

> *Comparto la advertencia del texto sobre la adopción irreflexiva de la tecnología, aunque considero que el problema no reside en la innovación misma, sino en el vacío regulatorio que la acompaña.*
>
> *En primer lugar, la velocidad del desarrollo tecnológico supera con mucho la capacidad de respuesta legislativa: cuando el Reglamento europeo de inteligencia artificial entró en vigor, los modelos generativos llevaban años instalados en millones de dispositivos.*
>
> *Por otra parte, responsabilizar únicamente al usuario resulta injusto. Si bien es cierto que existe una adopción acrítica por parte del público, no puede exigirse a un ciudadano que evalúe riesgos que las propias empresas desarrolladoras admiten no comprender del todo.*
>
> *En definitiva, el problema no es movernos rápido, sino hacerlo sin que nadie responda de lo que se rompe.*

**Analiza la estructura:** tesis matizada → argumento 1 con dato → argumento 2 con concesión ("si bien es cierto… no puede") → conclusión que reformula el lema del texto.`,
    practice_prompt: 'Escribe un texto argumentativo de 100-150 palabras manifestando acuerdo o desacuerdo con esta idea: "las redes sociales han empobrecido el debate público". Usa dos argumentos, incluye una concesión y cuenta las palabras al terminar.',
    alert_markdown: '⚠️ **No resumas el texto otra vez.** El error más frecuente en 1.3 es repetir lo que dice el autor. Te piden **tu postura argumentada**, y el resumen ya lo has hecho en 1.2.',
  },

  {
    sort_order: 15,
    title: 'Los Tipos de Argumentos',
    concept_markdown: `## Clases de argumentos

Saber nombrarlos sirve para **dos preguntas**: para analizar cómo argumenta el autor (1.1.b) y para construir tu propio texto (1.3).

| Argumento | En qué consiste | Ejemplo |
|---|---|---|
| **De autoridad** | Se cita a un experto o institución | *Según la RAE…* |
| **De datos o hechos** | Cifras, estudios, estadísticas | *Un estudio de Cisco señalaba…* |
| **Ejemplificación** | Un caso concreto ilustra la tesis | *El lema de Zuckerberg…* |
| **De experiencia personal** | El emisor apela a lo vivido | *Hoy he renunciado a una comida…* |
| **Analógico** | Compara con un caso semejante | *Igual que ocurrió con el tabaco…* |
| **Causa-consecuencia** | Encadena razones y efectos | *Como no se regula, se producen abusos* |
| **De la mayoría** | Lo que todos aceptan | *Nadie discute que…* |
| **Ad hominem** | Ataca a quien defiende la idea | *(Falacia: evítalo)* |

### Contraargumentación
Un texto maduro **anticipa la objeción** y la rebate:
> *Se dirá que la tecnología siempre ha generado miedo. **Sin embargo**, nunca antes…*

Detectar esa estrategia en el texto de la PAU siempre puntúa.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *Analice los tipos de argumentos que emplea el autor.*

**Modelo de respuesta:**

> *El autor construye su argumentación combinando tres tipos de argumentos.*
>
> *Recurre al **argumento de autoridad** al citar la definición de la RAE y la matización de la Fundéu, con lo que apoya en instituciones normativas su crítica al uso del término "disruptivo" y evita que su postura parezca un capricho personal.*
>
> *Emplea la **ejemplificación** con el lema de Mark Zuckerberg "muévete rápido y rompe cosas", caso concreto que hace tangible una crítica que de otro modo resultaría abstracta.*
>
> *Por último, utiliza el **argumento de datos** con el estudio de Cisco de 2024 (91 % de equipos que emplean IA generativa frente a 70 % de profesionales que no comprenden sus implicaciones). El contraste entre ambas cifras funciona como prueba objetiva de la tesis.*
>
> *La combinación de autoridad, ejemplo y dato confiere a la argumentación una **solidez** que trasciende la mera opinión.*`,
    practice_prompt: 'Identifica los tipos de argumentos que emplea un artículo de opinión y explica qué aporta cada uno a la persuasión. Después escribe tú un párrafo defendiendo una idea contraria usando un argumento de autoridad y otro de datos.',
    alert_markdown: null,
  },
]

const BATCH_SIZE = 20

async function main() {
  console.log(`Insertando ${cards.length} tarjetas del Bloque 1 (${BLOCK_KEY})…`)

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
  else console.log(`\n✅ Bloque 1 insertado. Total filas ${SUBJECT} en tabla: ${count}`)
}

main()
