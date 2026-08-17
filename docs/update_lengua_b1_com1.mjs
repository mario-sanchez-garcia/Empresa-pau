// Uso: node --env-file=.env.local docs/update_lengua_b1_com1.mjs
//
// REESCRITURA en profundidad de las misiones 1-8 (Comunicación).
// Mismo criterio que docs/update_lengua_b3_lit1.mjs: apuntes extensos en
// concept_markdown, ejemplo desarrollado sobre un texto REAL de examen en
// worked_example_markdown, e "inténtalo" en practice_prompt.
//
// Los textos de los ejemplos son los que aparecen en los exámenes oficiales de
// Madrid guardados en app/data/lengua.ts: Laura G. de Rivera sobre el término
// "disruptivo" y Juan Soto Ivars sobre la renuncia (modelo 2026), y Juan José
// Millás sobre los garbanzos de bote (2022-23).

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY
)

const SUBJECT = 'lengua'

const cards = [
  {
    sort_order: 1,
    title: 'El Examen de Lengua en la PAU: Estructura y Reparto de Puntos',
    concept_markdown: `## Cómo es el examen de Madrid

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

Esto no es un detalle menor: los criterios de corrección la fijan por escrito.

- Por cada **grafía errónea**: **−0,2**
- Por cada **tilde errónea**: **−0,1**
- Por errores de **coherencia, cohesión y adecuación**: **−0,2** cada uno
- **Máximo total descontable: 2 puntos**

Se cuenta **desde la primera falta** y los errores repetidos penalizan **una sola vez**. Diez faltas distintas te cuestan **2 puntos**: más que la pregunta de literatura entera.

## Dónde están los puntos de verdad

La pregunta **1.1.b vale 1,3 puntos**: es la mejor pagada de todo el examen, por encima de cualquier tema de literatura si se mide por lo que cuesta responderla. Y la **2.1**, el análisis sintáctico, vale 1,4 y aparece en **57 de los 45 exámenes** analizados (contando ambas opciones). Son las dos preguntas que deciden la nota.

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

La pregunta 1.1.b se responde **sobre el texto**, no sobre tus opiniones. Un texto sobre un asunto que te interesa poco pero lleno de recursos comentables te dará mejor nota que uno apasionante y plano.`,
    worked_example_markdown: `## Ejemplo guiado: cómo se decide entre los dos textos

Estos son los dos textos reales del modelo PAU 2026 de Madrid.

**TEXTO 1** — Laura G. de Rivera, *Esclavos del algoritmo* (2025), sobre la palabra "disruptivo":
> *"En el fragor de la batalla, surgió un término que, en la última década, muchos enarbolan como si fuera sinónimo de innovación, vanguardia y, sobre todo, de ser muy cool, pero que tiene un significado completamente distinto en el diccionario. 'Disruptivo'. Según la RAE, 'que produce rotura o interrupción brusca'. ¿Una rotura o una interrupción brusca es algo deseable? […] Un estudio de Cisco señalaba en 2024 que el 91 por ciento de los equipos de seguridad […] emplean IA generativa, aunque el 70 por ciento de los profesionales no entiendan completamente sus implicaciones."*

**TEXTO 2** — Juan Soto Ivars, *El Confidencial* (2024), sobre la renuncia:
> *"Hoy he renunciado a una comida con los amigos. […] Perseguían un prestigio que convertía cada logro en un impulso hacia el siguiente. No renunciaron a nada: renunciaron a mucho. La ideología es lo que no se ve, lo que está debajo de las piedras. Soporta encima las ideas como un suelo de marisma…"*

## Inventario rápido de lo comentable (2 minutos por texto)

| Elemento | Texto 1 | Texto 2 |
|---|---|---|
| **Interrogación retórica** | ✅ *"¿…es algo deseable?"* | ✅ *"¿he renunciado hoy a algo?"* |
| **Metáfora potente** | — | ✅ *"un suelo de marisma"* |
| **Antítesis / paradoja** | — | ✅ *"No renunciaron a nada: renunciaron a mucho"* |
| **Comillas irónicas** | ✅ *"disruptivo"*, *"cool"* | — |
| **Función metalingüística** | ✅ define una palabra, cita la RAE | — |
| **Datos y autoridad** | ✅ RAE, Fundéu, estudio de Cisco | — |
| **1ª persona / experiencia** | plural inclusivo | ✅ narración autobiográfica |
| **Estructura** | deductiva | **inductiva** (tesis al final) |

## La decisión

**Ambos son buenos, pero por razones distintas:**

- El **Texto 1** es más fácil para 1.1.c y para los **argumentos** (tiene autoridad, datos y ejemplo, los tres tipos clásicos), y su **función metalingüística** es un hallazgo que casi nadie menciona y que puntúa.
- El **Texto 2** es más rico para 1.1.b: tiene **metáfora**, **paradoja**, **estructura inductiva** claramente segmentable y una **anécdota personal que se generaliza**, que da mucho juego para hablar de modalización.

**Criterio práctico:** si dominas el análisis de recursos retóricos, elige el 2. Si te sientes más seguro clasificando argumentos y tipologías, elige el 1.

**Lo que no debes hacer:** elegir el Texto 2 porque el tema de la conciliación te toca más de cerca. La pregunta 1.3 te pedirá tu opinión, sí, pero solo vale 1,4 de los 4 puntos del bloque; los otros 2,6 se juegan analizando **la lengua del texto**.`,
    practice_prompt: 'Coge un examen oficial de Lengua de Madrid de cualquier año. Sin responderlo, haz en 10 minutos: (a) anota qué puntúa cada pregunta y cuántas palabras piden en 1.2 y 1.3; (b) haz el inventario de elementos comentables de los dos textos como en la tabla del ejemplo; (c) decide cuál elegirías y justifica por qué en tres líneas.',
    alert_markdown: '⚠️ **La ortografía puede costarte 2 puntos, tanto como el tema de literatura entero.** Cada grafía errónea resta 0,2 y cada tilde 0,1, desde la primera falta. Reservar 5 minutos finales solo para releer buscando tildes es la inversión más rentable del examen.',
  },

  {
    sort_order: 2,
    title: 'El Tema del Texto: Cómo Enunciarlo (0,5 puntos)',
    concept_markdown: `## Qué es el tema

El **tema** es la **idea central del texto condensada en un enunciado breve**, formulado con objetividad y en tercera persona. Responde a la pregunta *"¿de qué trata este texto, en esencia?"*.

No es el asunto (*"la tecnología"*), sino el asunto **más el enfoque del autor** (*"crítica de la adopción acrítica de la tecnología"*).

## Los cuatro requisitos

**1. Breve.** Una línea, dos como máximo. Si necesitas tres, estás resumiendo.

**2. Abstracto.** Sin ejemplos, sin nombres propios, sin cifras, sin anécdotas concretas del texto. Todo eso va en el resumen, no en el tema.

**3. Objetivo.** Tercera persona, sin valoraciones propias y **sin fórmulas metatextuales**: nada de *"el texto trata de"*, *"el autor habla de"*, *"en este artículo se dice"*.

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
- **Resumen:** *(las 40-50 palabras que recorren el texto entero)*`,
    worked_example_markdown: `## Ejemplo guiado 1: texto de Laura G. de Rivera (modelo PAU 2026)

**El texto:** critica que la palabra "disruptivo" se use como elogio cuando significa "rotura brusca", pone el ejemplo del lema de Zuckerberg "muévete rápido y rompe cosas", cita un estudio de Cisco y concluye que adoptamos la IA sin entender sus efectos.

### Tres formulaciones y por qué solo una vale

**❌ Formulación 1 (0 puntos)**
> *El texto habla de la tecnología y de Mark Zuckerberg.*

**Tres errores:** empieza con la fórmula metatextual prohibida ("el texto habla de"); nombra un **ejemplo concreto** (Zuckerberg); y **no recoge el enfoque** — no dice que el autor critique nada.

**❌ Formulación 2 (0,2 puntos)**
> *La palabra "disruptivo" significa rotura brusca según la RAE, pero se usa como sinónimo de innovación, y eso es un problema porque las empresas tecnológicas sacan productos sin evaluar riesgos.*

**Error:** esto es un **resumen**, no un tema. Es demasiado largo y sigue el hilo del texto en vez de condensarlo. Además incluye elementos concretos (la RAE).

**✅ Formulación 3 (0,5 puntos)**
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

Léele tu tema a alguien que **no haya leído el texto**. Si te pregunta *"¿y qué dice el autor sobre eso?"*, te ha faltado el **enfoque**. Si te pregunta *"¿quién es Zuckerberg?"*, te ha sobrado lo **concreto**.`,
    practice_prompt: 'Coge tres artículos de opinión distintos y enuncia el tema de cada uno en una sola frase que empiece por un sustantivo abstracto, sin ningún nombre propio ni cifra y sin usar "el texto trata de". Después comprueba cada uno con el truco: ¿recoge el enfoque del autor?, ¿sobra algo concreto?',
    alert_markdown: '⚠️ **Nunca empieces por "El texto trata de…" ni "El autor habla de…".** El tema es un **enunciado nominal**, no una descripción de lo que hace el texto. Es el error más penalizado de esta pregunta y el más fácil de evitar.',
  },

  {
    sort_order: 3,
    title: 'El Resumen: 40-50 Palabras Exactas (0,6 puntos)',
    concept_markdown: `## Qué te piden

Reproducir el **contenido esencial** del texto respetando su **orden** y su **lógica argumental**, en **40-50 palabras**. La extensión está fijada por escrito en el enunciado: es criterio de corrección.

## Las cinco reglas

**1. Objetividad absoluta.**
Tercera persona. Prohibido: *"el autor dice que…"*, *"en mi opinión"*, *"me parece que"*. El resumen debe poder leerse como si fuera el propio texto en pequeño.

**2. No copies frases literales.**
Hay que **reformular con tus palabras**. Copiar y pegar fragmentos es lo que más penaliza, porque no demuestra comprensión.

**3. Fuera lo accesorio.**
Se eliminan: **ejemplos**, **cifras**, **nombres propios**, **citas de apoyo**, **repeticiones** y **digresiones**. Se queda el **esqueleto argumental**.

**4. Mantén el hilo.**
Si el texto va de A a B a C, el resumen también. No reordenes ni empieces por la conclusión.

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

Todo lo separado por espacios, **incluidos artículos, preposiciones y conjunciones**. *"El"*, *"de"* y *"y"* cuentan igual que *"tecnología"*.`,
    worked_example_markdown: `## Ejemplo guiado: resumen del texto de Laura G. de Rivera

**El texto original** (modelo PAU 2026, unas 300 palabras) dice, párrafo a párrafo:

1. Surge el término "disruptivo", usado como sinónimo de innovación y modernidad, aunque en el diccionario significa "rotura o interrupción brusca". Se cita la RAE y la Fundéu.
2. Ejemplo del lema de Zuckerberg, "muévete rápido y rompe cosas": Facebook/Meta saca productos no seguros, expone a millones de personas y se preocupa después, poniendo el beneficio por encima de la salud mental.
3. No es el único: es el modo habitual en la IA, que adoptamos deprisa antes de entender sus efectos.
4. Dato de Cisco (2024): el 91 % de los equipos de seguridad usa IA generativa aunque el 70 % de los profesionales no entiende sus implicaciones. A la gente corriente le pasa igual.

### Paso 1 — Una idea por párrafo, con mis palabras

1. El término "disruptivo" se emplea como elogio pese a significar ruptura brusca.
2. Las grandes tecnológicas lanzan productos sin evaluar riesgos y priorizan el beneficio.
3. Es la forma habitual de operar en inteligencia artificial.
4. La sociedad adopta estas innovaciones sin comprenderlas.

### Paso 2 — Enlazar y contar

**❌ Versión mala (62 palabras, copia literal):**
> *El autor habla de que la palabra disruptivo según la RAE significa "que produce rotura o interrupción brusca" y pone el ejemplo de Mark Zuckerberg de Facebook Meta con su lema "muévete rápido y rompe cosas", y también cita un estudio de Cisco de 2024 que dice que el 91 por ciento de los equipos usan IA.*

**Fallos:** empieza con *"el autor habla de"*; **copia literalmente** dos fragmentos entrecomillados; incluye **nombres propios** (Zuckerberg, Facebook, Cisco) y **cifras**; y se pasa doce palabras.

**✅ Versión buena (47 palabras):**
> *El término "disruptivo" se emplea como sinónimo de innovación pese a significar ruptura brusca. Las grandes tecnológicas lanzan productos sin evaluar sus riesgos y anteponen el beneficio al bienestar de las personas. La sociedad, mientras tanto, adopta estas innovaciones antes de comprender sus consecuencias sociales y morales.*

**Por qué funciona:**
- **Tercera persona**, sin fórmulas metatextuales.
- **Sin ejemplos, nombres ni cifras**.
- **Reformulado**: no hay una sola frase copiada.
- **Respeta el orden** del original: término → empresas → sociedad.
- Cohesionado con *"mientras tanto"*, no una lista de frases sueltas.
- **47 palabras**, dentro del rango.

## Comprobación final: cuenta de verdad

> El(1) término(2) "disruptivo"(3) se(4) emplea(5) como(6) sinónimo(7) de(8) innovación(9) pese(10) a(11) significar(12) ruptura(13) brusca(14). Las(15) grandes(16) tecnológicas(17) lanzan(18) productos(19) sin(20) evaluar(21) sus(22) riesgos(23) y(24) anteponen(25) el(26) beneficio(27) al(28) bienestar(29) de(30) las(31) personas(32). La(33) sociedad(34), mientras(35) tanto(36), adopta(37) estas(38) innovaciones(39) antes(40) de(41) comprender(42) sus(43) consecuencias(44) sociales(45) y(46) morales(47).

**47 palabras.** Hazlo así en el examen: en el borrador, numera.`,
    practice_prompt: 'Coge un artículo de opinión de unas 400-500 palabras. Subraya la idea principal de cada párrafo, escríbelas con tus palabras, enlázalas con conectores y ajusta a 40-50 palabras exactas. Después numera las palabras una a una y comprueba que no has copiado ninguna frase literal del original.',
    alert_markdown: '⚠️ **Cuenta las palabras de verdad, no a ojo.** Es la única pregunta del examen donde el número está fijado por escrito. Un resumen brillante de 60 palabras puntúa menos que uno correcto de 45.',
  },

  {
    sort_order: 4,
    title: 'Las Tipologías Textuales: Identificar el Tipo de Texto (0,2 puntos)',
    concept_markdown: `## Las cinco modalidades textuales

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

## La fórmula completa de respuesta

Para los 0,2 puntos hay que decir **tres cosas**:

> **modalidad + ámbito + género + funciones predominantes**

Modelo aplicable a casi cualquier texto de la PAU de Madrid:

> *Texto **argumentativo** con secuencias **expositivas**, del ámbito **periodístico**, género **artículo de opinión**, con predominio de las funciones **apelativa** y **expresiva**.*

## Por qué no debes dejarla en blanco nunca

Vale **0,2 puntos** y se responde en **treinta segundos** si llevas la fórmula memorizada. Es, en relación esfuerzo/nota, la pregunta más rentable del examen entero.

## Cómo distinguir expositivo de argumentativo

Es la duda más frecuente. La clave está en la **intención**:

- **Expositivo:** informa sobre algo que se presenta como **hecho**. No busca que cambies de opinión. *"El 91 % de los equipos usa IA generativa."*
- **Argumentativo:** defiende una **postura** discutible. Hay tesis y hay argumentos. *"Adoptamos la IA demasiado deprisa."*

Prueba: **¿se podría estar en desacuerdo con lo que dice?** Si sí, es argumentativo.`,
    worked_example_markdown: `## Ejemplo guiado: los tres niveles de respuesta

**Texto:** el artículo de Juan Soto Ivars sobre la renuncia (modelo PAU 2026), publicado en *El Confidencial* y firmado, que parte de una anécdota personal para criticar la ideología de la autorrealización.

**Respuesta de 0,05 — insuficiente**
> *Es un texto argumentativo.*

Correcto pero incompleto: falta ámbito, género y funciones. Le has dado al corrector una cuarta parte de lo que pedía.

**Respuesta de 0,1 — a medias**
> *Es un texto argumentativo del ámbito periodístico.*

Mejor, pero sigue sin género ni justificación.

**Respuesta de 0,2 — completa**
> *Se trata de un texto **argumentativo**, con secuencias **narrativas** en el planteamiento inicial —la anécdota de la comida a la que el autor renuncia— y **expositivas** al describir el fenómeno de las entrevistas. Pertenece al **ámbito periodístico**, concretamente al género del **artículo de opinión**, como acreditan la firma del autor, la indicación del medio (*El Confidencial*) y la fecha. Predominan la **función apelativa**, pues busca modificar la actitud del lector ante la idea de renuncia, y la **expresiva**, manifiesta en la primera persona y en las valoraciones del autor.*

## Por qué esta versión vale el doble

1. Da la **modalidad principal** *y* reconoce las **secuencias** de otras modalidades, con ejemplo de cada una.
2. Da **ámbito** y **género**.
3. **Justifica** el género con tres marcas objetivas (firma, medio, fecha).
4. Añade las **funciones** con su justificación.

Todo eso ocupa cinco líneas y se escribe en un minuto largo.

## Aplicación a otros tipos de texto

**Un prospecto de medicamento:**
> *Texto **expositivo-instructivo**, del ámbito **científico-técnico**, género **prospecto**. Predomina la función **representativa** (informa de la composición) junto a la **apelativa** en las instrucciones de uso, formuladas con imperativos e infinitivos.*

**Un fragmento de novela con diálogo:**
> *Texto **narrativo** con amplias secuencias **dialógicas** y **descriptivas**, del ámbito **literario**, género **novela**. Predomina la función **poética**, por el cuidado de la forma, junto a la **representativa** en las secuencias narrativas.*

**Un editorial de periódico:**
> *Texto **argumentativo** del ámbito **periodístico**, género **editorial**, como prueba la **ausencia de firma**: expresa la postura institucional del medio. Predomina la función **apelativa**, con uso de la primera persona del plural de carácter corporativo.*`,
    practice_prompt: 'Clasifica cuatro textos distintos (una columna de opinión, un prospecto, un fragmento de novela con diálogo y un editorial) indicando en cada caso modalidad principal, secuencias de otras modalidades, ámbito, género y funciones predominantes. Justifica el género con al menos dos marcas objetivas del texto.',
    alert_markdown: '⚠️ **Es la pregunta más barata del examen: 0,2 puntos en treinta segundos.** No la dejes en blanco jamás y no te limites a decir "argumentativo": añade siempre **ámbito, género y funciones**, que es lo que la convierte en un 0,2 completo.',
  },

  {
    sort_order: 5,
    title: 'Los Géneros Periodísticos de Opinión',
    concept_markdown: `## Por qué importa

Prácticamente **todos** los textos de la PAU de Madrid son géneros periodísticos, y la mayoría **de opinión**. Distinguirlos con precisión mejora la respuesta a 1.1.c y aporta argumentos para 1.1.b.

## Los tres grandes grupos

| Grupo | Finalidad | Géneros |
|---|---|---|
| **Informativos** | Transmitir hechos | Noticia, reportaje, entrevista |
| **De opinión** | Valorar, persuadir | Editorial, artículo, columna, crítica, carta al director |
| **Mixtos o interpretativos** | Informar + valorar | Crónica, reportaje interpretativo |

## Los géneros de opinión, uno a uno

### Editorial
- **No va firmado.** Expresa la opinión de la **institución periodística**, no de una persona.
- Ocupa un lugar fijo del periódico.
- Tono **grave e institucional**; frecuente **primera persona del plural** corporativa (*"creemos que"*).
- Aparenta gran objetividad, aunque toma partido.

### Artículo de opinión
- **Firmado** por un colaborador, a menudo con periodicidad irregular.
- **Tema libre** y **extensión variable**.
- Argumentación desarrollada, con estilo personal.
- Puede citar autoridades, datos y ejemplos.

### Columna
- **Firmada**, con **sección y extensión fijas** (de ahí el nombre: ocupa siempre la misma columna).
- **Breve** y muy **literaria**: se le permite la metáfora, la ironía, el juego verbal.
- Tono marcadamente **personal**; el columnista tiene una voz reconocible.
- A menudo parte de una **anécdota mínima** para llegar a una reflexión general.

### Crítica
- Firmada por un **especialista**.
- **Valora una obra** concreta: libro, película, exposición, concierto.
- Combina descripción de la obra y juicio razonado.

### Carta al director
- Firmada por un **lector**, no por un profesional.
- **Muy breve**, tono directo, a menudo de queja o réplica.

## Cómo se distinguen en tres preguntas

1. **¿Está firmado?** No → **editorial**.
2. **¿Es muy breve, literario y de sección fija?** → **columna**.
3. **¿Valora una obra concreta?** → **crítica**.
4. Si está firmado, es más extenso y argumenta libremente → **artículo de opinión**.

## El caso frontera: artículo o columna

Es la duda más habitual y no siempre tiene respuesta tajante. Criterios:
- La **columna** tiende a ser más **breve** y más **literaria**, y suele partir de lo cotidiano.
- El **artículo** desarrolla una argumentación más extensa y suele apoyarse en datos.

**Si dudas, di ambas cosas y justifica:** *"Se trata de un artículo de opinión, con rasgos propios de la columna por su brevedad y su elaboración literaria"*. Eso no se penaliza; equivocarse tajantemente, sí.

## Los géneros informativos, por contraste

- **Noticia:** objetiva, sin firma o con firma de agencia, **pirámide invertida** (lo más importante primero), responde a las seis W (qué, quién, cuándo, dónde, cómo, por qué).
- **Reportaje:** más extenso y documentado, admite mayor libertad estilística.
- **Entrevista:** dialógica; puede ser de declaraciones o de perfil.
- **Crónica:** informa **y valora**; va firmada por un corresponsal o enviado especial. Es el género mixto por excelencia.`,
    worked_example_markdown: `## Ejemplo guiado: identificar y justificar el género

**Texto:** el artículo de Juan Soto Ivars (modelo PAU 2026), que empieza *"Hoy he renunciado a una comida con los amigos"*, publicado en *El Confidencial* el 21/09/2024.

### Respuesta modelo

> *Se trata de un **artículo de opinión** perteneciente al ámbito periodístico, con rasgos propios de la **columna**. Lo acreditan tres elementos:*
>
> ***1. La firma y los datos de publicación.*** *El texto aparece firmado por su autor, con indicación del medio (*El Confidencial*) y la fecha. Ello **descarta el editorial**, género que por definición no lleva firma porque expresa la postura institucional del periódico.*
>
> ***2. La argumentación personal.*** *El autor desarrolla una tesis propia sobre la ideología de la autorrealización, partiendo de una **anécdota autobiográfica** —la renuncia a una comida con amigos— que generaliza progresivamente. Este arranque desde lo cotidiano es rasgo característico de la columna.*
>
> ***3. La elaboración literaria del estilo.*** *El empleo de la **primera persona**, de **metáforas** de notable densidad ("la ideología… como un suelo de marisma") y de la **paradoja** ("No renunciaron a nada: renunciaron a mucho") resulta impropio de un texto informativo y confirma que estamos ante un género de opinión.*

## Por qué esta respuesta es completa

No se limita a nombrar el género: lo **justifica con tres marcas objetivas del texto** y, además, explica **por qué se descarta** el género más fácil de confundir (el editorial). Ese "descarte razonado" es lo que separa una respuesta buena de una correcta.

## Tabla de descarte rápido

Aplícala en el examen en veinte segundos:

| Observo… | Descarto… | Concluyo… |
|---|---|---|
| Hay **firma** de persona | Editorial | Artículo, columna o crítica |
| **No** valora una obra concreta | Crítica | Artículo o columna |
| Es **extenso** y con datos | Columna pura | **Artículo de opinión** |
| Usa **1ª persona** y metáforas | Noticia, reportaje | Género de **opinión** |

## Cuidado con dos confusiones frecuentes

**1. Editorial ≠ artículo de opinión.** El editorial **no va firmado**. Si el texto lleva nombre de autor, nunca es un editorial. Es el error más común de esta pregunta.

**2. Ensayo ≠ artículo periodístico.** El **ensayo** pertenece al ámbito **humanístico o literario**, es más extenso, más reflexivo y no está sujeto a la actualidad inmediata ni al formato del periódico. Un artículo puede ser "ensayístico" en su tono, pero sigue siendo periodístico.`,
    practice_prompt: 'Busca en un periódico digital un editorial, una columna y una crítica. Para cada uno, anota tres marcas objetivas (firma, extensión, persona gramatical, sección, presencia de datos) y redacta una justificación de cuatro líneas del género, incluyendo qué género descartas y por qué.',
    alert_markdown: '⚠️ **El editorial no va firmado. Nunca.** Expresa la opinión del periódico como institución, no de una persona. Si el texto lleva nombre de autor, ya puedes descartarlo, y decirlo explícitamente en la respuesta suma.',
  },

  {
    sort_order: 6,
    title: 'Las Funciones del Lenguaje',
    concept_markdown: `## El modelo de Jakobson

Todo acto comunicativo tiene **seis elementos**, y a cada uno le corresponde una **función** del lenguaje según cuál predomine.

| Elemento | Qué es | Función asociada |
|---|---|---|
| **Emisor** | Quien produce el mensaje | **Expresiva** o emotiva |
| **Receptor** | A quien va dirigido | **Apelativa** o conativa |
| **Mensaje** | Lo que se transmite | **Poética** |
| **Contexto** o referente | Aquello de lo que se habla | **Representativa** o referencial |
| **Canal** | El medio físico | **Fática** |
| **Código** | La lengua empleada | **Metalingüística** |

## Las seis funciones y sus marcas

### 1. Representativa (referencial)
Transmite información **objetiva** sobre la realidad.
**Marcas:** 3ª persona, modo **indicativo**, léxico **denotativo**, datos, cifras, ausencia de valoración.
> *"Un estudio de Cisco señalaba en 2024 que el 91 por ciento de los equipos emplean IA generativa."*

### 2. Expresiva (emotiva)
Manifiesta los **sentimientos, opiniones o estado** del emisor.
**Marcas:** **1ª persona**, léxico **valorativo** (subjetivemas), **exclamaciones**, interjecciones, diminutivos y aumentativos afectivos, modalidad dubitativa o desiderativa.
> *"Hoy he renunciado a una comida con los amigos."*

### 3. Apelativa (conativa)
Busca **influir en el receptor**: convencerlo, moverlo a actuar, modificar su actitud.
**Marcas:** **2ª persona**, **imperativo**, **vocativos**, **interrogaciones retóricas**, perífrasis de obligación.
> *"¿Una rotura o una interrupción brusca es algo deseable?"*

### 4. Poética
El mensaje llama la atención **sobre su propia forma**.
**Marcas:** **figuras retóricas**, ritmo, rima, aliteración, paralelismos, juegos de palabras, selección estilística cuidada.
> *"No renunciaron a nada: renunciaron a mucho."*

### 5. Fática
Sirve para **abrir, mantener o cerrar** el canal, no para transmitir contenido.
**Marcas:** *¿me sigues?*, *oye*, *bueno*, *¿sí?*, muletillas conversacionales.

### 6. Metalingüística
El lenguaje **habla de sí mismo**: define palabras, explica reglas, comenta el idioma.
**Marcas:** definiciones, comillas de mención, citas de diccionario.
> *"Según la RAE, 'que produce rotura o interrupción brusca'."*

## En los textos de la PAU

Predominan casi siempre **dos**: la **expresiva** (el autor opina) y la **apelativa** (quiere convencerte). La **representativa** sostiene la argumentación con datos.

Merece la pena buscar además:
- La **poética**, si el texto tiene metáforas o juegos verbales: demuestra lectura atenta.
- La **metalingüística**, que es rara y muy comentable cuando aparece — por ejemplo, en textos que discuten el significado de una palabra.

## La regla que decide la nota

**Nombrar la función sin citar el texto no puntúa.** El esquema obligatorio es:

> **función → explicación → cita literal entre comillas → efecto**`,
    worked_example_markdown: `## Ejemplo guiado: las cuatro funciones del texto de Laura G. de Rivera

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

## Error típico y su corrección

**❌ Mal:**
> *Hay función apelativa, expresiva, representativa y poética.*

Enumerar sin citar es una lista, no un análisis. Puntúa muy poco.

**✅ Bien:**
> *Hay **función apelativa**, como prueba la interrogación retórica "**¿…es algo deseable?**", que interpela directamente al lector para orientar su juicio.*

**La diferencia son doce palabras** y vale varias décimas.`,
    practice_prompt: 'Identifica las funciones del lenguaje predominantes en un artículo de opinión. Para cada una: nómbrala, explica por qué está presente, cita literalmente una marca entre comillas y explica su efecto. Cierra con un párrafo que relacione todas las funciones entre sí.',
    alert_markdown: '⚠️ **Función expresiva ≠ función poética.** La **expresiva** manifiesta los sentimientos del **emisor** (1ª persona, valoración); la **poética** llama la atención sobre la **forma del mensaje** (figuras retóricas, ritmo). Un texto puede tener las dos, pero no son lo mismo.',
  },

  {
    sort_order: 7,
    title: 'La Modalización: Detectar las Marcas de Subjetividad',
    concept_markdown: `## Qué es la modalización

Es el conjunto de **huellas que el emisor deja en su propio mensaje**: todo aquello que revela su presencia, su actitud y su punto de vista. Localizarla y explicarla es el **núcleo de la pregunta 1.1.b**, la mejor pagada del examen (1,3 puntos).

Un texto **modalizado** es subjetivo; un texto **no modalizado** aspira a la objetividad (una noticia, un prospecto).

## Los seis lugares donde buscar, en orden

### 1. Deixis personal
Las marcas de persona:
- **1ª persona del singular**: *creo, pienso, renuncié, me viene a la memoria*. Máxima implicación.
- **1ª persona del plural inclusivo**: *nos hemos metido, no lo sabemos, tendemos a*. Incluye al lector; busca **complicidad** y suaviza la crítica.
- **2ª persona**: apela directamente al receptor.

### 2. Léxico valorativo (subjetivemas)
Palabras que **califican** en lugar de describir:
- **Adjetivos valorativos**: *fulgurante*, *precipitada*, *bobas*, *inconsistentes*.
- **Sustantivos connotados**: *farsantes*, *esclavos*.
- **Verbos de opinión**: *creo*, *me parece*, *sospecho*.
- **Adverbios de modalidad**: *afortunadamente*, *desgraciadamente*, *evidentemente*.

### 3. Sufijos apreciativos
- **Diminutivos** con valor afectivo o irónico: *salvajito*, *cosita*.
- **Aumentativos** y **despectivos**: *cuarentón*, *libracho*.

### 4. Modalidades oracionales
- **Interrogativas retóricas**: no piden información, orientan.
- **Exclamativas**: emoción.
- **Dubitativas**: *quizá*, *tal vez*, *acaso*.
- **Desiderativas**: *ojalá*.
- **Exhortativas**: imperativos, consejos.

### 5. Verbos y perífrasis modales
- **Obligación**: *hay que entender*, *habría que cambiar*, *debemos*.
- **Posibilidad**: *se puede tener*, *podría*.
- **Tendencia**: *tendemos a adoptarlas*.
- **Condicional de cortesía o hipótesis**: *sería conveniente*.

### 6. Recursos tipográficos
- **Comillas irónicas**, que marcan distancia respecto a un término: *"disruptivo"*, *"cool"*.
- **Cursivas**, **puntos suspensivos**, **paréntesis** con apostillas.

## La regla de oro del comentario

Cada hallazgo debe llevar **tres partes**:

> **mecanismo** → **cita literal** → **efecto que produce**

El **tercer elemento** es el que casi nadie escribe y el que distingue un 0,8 de un 1,3. No basta con decir que hay un plural inclusivo: hay que decir **para qué** lo usa el autor.

## Modalización ≠ modalidad textual

- **Modalización**: las marcas de subjetividad del emisor (esto).
- **Modalidad textual**: el tipo de texto (narrativo, argumentativo…).
- **Modalidad oracional**: la actitud del hablante en cada oración (enunciativa, interrogativa…).

Son tres conceptos distintos con nombres parecidos. Confundirlos en el examen se nota mucho.`,
    worked_example_markdown: `## Ejemplo guiado: modalización en el texto de Juan Soto Ivars

**Texto** (modelo PAU 2026):
> *"Hoy he renunciado a una comida con los amigos. Así lo he pensado: tenía muchas ganas de verlos, pero he renunciado, porque no quería que mi mujer se quedara en casa con los dos críos ella sola. […] Repartiendo el juego entre los niños, el cansancio entre nosotros, me quedé pensando: ¿he renunciado hoy a algo? ¿Me haría esta pregunta si hubiera salido a comer con los amigos…? […] La ideología es lo que no se ve, lo que está debajo de las piedras."*

### Respuesta modelo (fragmento de 1.1.b)

> *El texto presenta un **grado muy alto de modalización**, coherente con su naturaleza de artículo de opinión.*
>
> ***Deixis personal.*** *El autor emplea de manera sistemática la **primera persona del singular** ("**he renunciado**", "**me quedé pensando**", "**no quería**"), con la que se presenta como sujeto de la experiencia narrada. Esta implicación directa cumple una función argumentativa precisa: la tesis no se enuncia como principio abstracto, sino que se **extrae de la vida del propio autor**, lo que la hace más difícil de rebatir y más cercana al lector.*
>
> ***Interrogaciones retóricas.*** *"**¿He renunciado hoy a algo?**" y "**¿Me haría esta pregunta si hubiera salido a comer con los amigos?**" no buscan información: **trasladan al lector el proceso mismo de reflexión**. El lector no recibe una conclusión cerrada, sino que asiste a cómo se forma, e implícitamente se ve obligado a hacerse la misma pregunta.*
>
> ***Léxico valorativo.*** *El uso del coloquial "**críos**" en lugar de *hijos* rebaja el registro y refuerza la impresión de confidencia doméstica, alejando el texto de cualquier solemnidad.*
>
> ***Función poética al servicio de la modalización.*** *La **metáfora** "la ideología… **es lo que está debajo de las piedras**" y, más adelante, la comparación con "un suelo de marisma", traducen una idea abstracta a imágenes materiales e inestables. No son ornamento: **son el argumento**, pues sugieren que aquello sobre lo que creemos apoyarnos con firmeza es en realidad terreno movedizo.*

## Comprueba el esquema

Cada párrafo cumple los tres pasos:

| Mecanismo | Cita | Efecto |
|---|---|---|
| Deixis personal | *"he renunciado"* | La tesis nace de la experiencia, no de la teoría |
| Interrogación retórica | *"¿he renunciado hoy a algo?"* | Traslada el proceso de reflexión al lector |
| Léxico valorativo | *"críos"* | Rebaja el registro, crea confidencia |
| Metáfora | *"debajo de las piedras"* | Materializa lo abstracto; es argumento, no adorno |

**El tercer elemento es el que puntúa.** Sin él tendrías un inventario; con él, un comentario.

## Contraste: un texto NO modalizado

> *"El Real Decreto 1/2025 entró en vigor el 3 de marzo. Afecta a 1.200 municipios."*

Sin 1ª persona, sin adjetivos valorativos, sin interrogaciones, sin figuras. **Grado cero de modalización**: ámbito jurídico-administrativo, función representativa. Señalar este contraste en el examen —"frente a un texto administrativo, aquí…"— demuestra que entiendes el concepto y no solo lo aplicas.`,
    practice_prompt: 'Localiza en un artículo de opinión seis marcas de modalización de tipos distintos (deixis personal, léxico valorativo, sufijo apreciativo, interrogación retórica, perífrasis modal y comillas irónicas). Para cada una escribe las tres partes: mecanismo, cita literal y efecto que produce en el lector.',
    alert_markdown: '⚠️ **Sin el "efecto", el hallazgo no puntúa entero.** "Hay plural inclusivo" es un inventario. "Hay plural inclusivo en *nos hemos metido*, con el que la autora se incluye en la crítica y evita el tono acusatorio" es un comentario. Esa tercera parte es la que vale las décimas.',
  },

  {
    sort_order: 8,
    title: 'La Coherencia: La Estructura Interna del Texto',
    concept_markdown: `## Qué es la coherencia

Propiedad textual por la que un texto se percibe como una **unidad de sentido**: todas sus partes giran en torno a un mismo tema y se ordenan con lógica. Opera en el nivel del **contenido** (frente a la cohesión, que opera en el de la **forma**).

## Las tres condiciones

**1. Unidad temática.** Todo el texto desarrolla un mismo asunto. No hay párrafos que se vayan a otra cosa.

**2. Progresión informativa.** Cada parte **aporta información nueva** sin contradecir lo anterior y sin repetir. El texto avanza.

**3. Estructura reconocible.** Las ideas están **organizadas** según un plan identificable.

## Las estructuras que hay que saber nombrar

| Estructura | Cómo funciona | Dónde está la tesis |
|---|---|---|
| **Deductiva** (analizante) | Se enuncia la idea y luego se argumenta | **Al principio** |
| **Inductiva** (sintetizante) | Se argumenta y se concluye | **Al final** |
| **Encuadrada** | Tesis, desarrollo y reformulación de la tesis | **Principio y final** |
| **Paralela** | Ideas del mismo nivel, sin jerarquía | Repartida |
| **Circular** | El texto termina donde empezó | Se cierra el círculo |
| **Cronológica** | Ordenada en el tiempo | — (textos narrativos) |
| **Contrastiva** | Dos posturas enfrentadas | En la síntesis |

## Cómo se responde: el método

**Paso 1 — Divide el texto en partes.** Usa las **líneas numeradas** del margen (los exámenes de la PAU las traen) o los párrafos.

**Paso 2 — Ponle un nombre a cada parte.** No describas: **titula**. *"Planteamiento anecdótico"*, *"generalización"*, *"formulación de la tesis"*, *"refutación de la objeción"*.

**Paso 3 — Nombra la estructura global.**

**Paso 4 — Explica por qué esa estructura es eficaz.** Este paso es el que sube la nota y casi nadie lo da.

## La progresión temática

Además de la estructura, puedes mencionar cómo avanza la información:

- **Progresión de tema constante:** el mismo tema recibe información nueva en cada frase. (*Juan estudió. Juan aprobó. Juan celebró.*)
- **Progresión lineal:** lo nuevo de una frase se convierte en el tema de la siguiente. (*Compré un libro. El libro trataba de física. La física es…*)
- **Progresión de temas derivados:** de un hipertema se van desgajando subtemas. (*España tiene varias regiones. Andalucía… Cataluña… Galicia…*)

Mencionar el tipo de progresión es un detalle culto que muy poca gente incluye.

## Coherencia y cohesión: la distinción que hay que tener clarísima

| | **Coherencia** | **Cohesión** |
|---|---|---|
| **Nivel** | Contenido, significado | Forma, gramática |
| **Se refiere a** | Unidad de sentido y estructura | Mecanismos que enlazan las partes |
| **Ejemplos** | Estructura inductiva, progresión temática | Pronombres, elipsis, conectores, sinónimos |

Un texto puede ser **cohesionado pero incoherente** (todo bien enlazado pero sin sentido) y **coherente pero poco cohesionado** (se entiende, pero suena a frases sueltas).`,
    worked_example_markdown: `## Ejemplo guiado: estructura del texto de Juan Soto Ivars

**El texto** (modelo PAU 2026) tiene 24 líneas numeradas. Recorrido:
1. El autor cuenta que renunció a una comida con amigos por quedarse con su familia.
2. Se pregunta si eso ha sido una renuncia, y si se lo habría preguntado en el caso contrario.
3. Observa que abundan las entrevistas a gente rica o famosa que, habiéndose realizado profesionalmente, siente su vida incompleta. "No renunciaron a nada: renunciaron a mucho."
4. Concluye: la ideología dominante predica la autodeterminación, pero ese "todo" es un todo sin los otros, y en realidad "a todos nos han construido otros".

### Respuesta modelo

> *El texto presenta una **estructura inductiva o sintetizante**, pues la tesis no se formula hasta el final, tras un recorrido que va **de lo particular a lo general**.*
>
> *Pueden distinguirse **tres partes**:*
>
> ***Primera parte (líneas 1-6): planteamiento anecdótico.*** *El autor narra en primera persona un hecho mínimo y cotidiano —renunciar a una comida con amigos para no dejar sola a su mujer con los niños—. Su función es **captar la atención** y ofrecer un punto de partida concreto y reconocible para el lector.*
>
> ***Segunda parte (líneas 7-14): generalización.*** *La anécdota personal se amplía a un fenómeno social observable: las entrevistas a personas famosas que, pese a haberse realizado, sienten su vida incompleta. Aquí el texto **abandona lo autobiográfico** y pasa a lo colectivo, transición marcada por el cambio de la primera persona a la tercera.*
>
> ***Tercera parte (líneas 15-24): formulación de la tesis.*** *El autor enuncia por fin su idea central: la ideología contemporánea de la autodeterminación oculta que la identidad se construye siempre con los demás. La sentencia "**No renunciaron a nada: renunciaron a mucho**" funciona como bisagra hacia esta conclusión.*
>
> ***Eficacia de la estructura.*** *Esta disposición inductiva resulta especialmente persuasiva porque **el lector recorre el razonamiento junto al autor** en lugar de recibir una tesis cerrada de entrada. Al haber partido de una situación cotidiana en la que cualquiera puede reconocerse, la conclusión abstracta llega ya preparada y encuentra menos resistencia. Además, el texto es **coherente** en su unidad temática: las tres partes desarrollan un único asunto, la naturaleza de la renuncia, con una progresión que va ampliando el foco.*

## Lo que hace que esta respuesta valga

1. **Nombra** la estructura con su término técnico.
2. **Divide con líneas concretas** — no "al principio" sino "líneas 1-6".
3. **Titula** cada parte en vez de resumirla.
4. Señala la **marca lingüística** de la transición (cambio de persona).
5. Cierra explicando **por qué esa estructura funciona**.

El punto 5 es el que casi nadie escribe.

## Plantilla reutilizable

> *El texto presenta una estructura **[deductiva / inductiva / encuadrada]**, pues la tesis aparece **[al principio / al final / en ambos extremos]**. Pueden distinguirse **[n]** partes: **[líneas X-Y]**, donde… ; **[líneas Y-Z]**, donde… Esta disposición resulta eficaz porque…*`,
    practice_prompt: 'Coge un artículo de opinión con párrafos numerados o numéralos tú. Divídelo en partes indicando las líneas exactas, ponle un título a cada parte, determina si la estructura es deductiva, inductiva o encuadrada señalando dónde está la tesis, y cierra explicando en tres líneas por qué esa disposición es eficaz para persuadir.',
    alert_markdown: '⚠️ **Coherencia y cohesión no son sinónimos y se preguntan por separado.** La **coherencia** es la unidad de sentido y la estructura (nivel del contenido); la **cohesión** son los mecanismos gramaticales que enlazan las partes (nivel de la forma). Intercambiarlas es un error conceptual grave.',
  },
]

async function main() {
  console.log(`Reescribiendo ${cards.length} misiones (1-8, Comunicación) en profundidad…\n`)
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

    if (error) { console.error(`✗ Error en ${c.sort_order}:`, error.message); process.exit(1) }
    console.log(`✓ ${String(c.sort_order).padStart(2)}. ${c.title.slice(0, 50).padEnd(52)} teoría ${String(c.concept_markdown.length).padStart(4)} · caso ${String(c.worked_example_markdown.length).padStart(4)}`)
  }
  const avg = Math.round(cards.reduce((a, c) => a + c.concept_markdown.length, 0) / cards.length)
  console.log(`\n✅ ${cards.length} misiones actualizadas. Teoría media: ${avg} caracteres.`)
}

main()
