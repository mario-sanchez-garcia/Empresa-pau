// Uso: node --env-file=.env.local docs/update_lengua_b2_ref3.mjs
//
// REESCRITURA en profundidad de las misiones 32-40 (Reflexión sobre la lengua).
// Morfología, semántica y variedades: son las preguntas de 0,8 puntos (2.3, 2.4
// y 2.5), de las que hay que responder dos. Cierra la reescritura del bloque.

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY
)

const SUBJECT = 'lengua'

const cards = [
  {
    sort_order: 32,
    title: 'Estructura Morfológica: Lexema y Morfemas',
    concept_markdown: `## Los componentes de la palabra

### Lexema (o raíz)
Aporta el **significado léxico**. Es la parte común a toda una **familia de palabras**:
> *pan*, *pan-adero*, *pan-adería*, *em-pan-ada* → lexema **pan-**

Para localizarlo, busca palabras de la misma familia y quédate con lo que comparten.

### Morfemas
Aportan significado **gramatical**. Se dividen en dos grandes clases:

## A. Morfemas flexivos (desinencias)

**No crean palabras nuevas**: solo generan variantes de la misma palabra. En el diccionario aparece **una sola entrada**.

**En el nombre y el adjetivo:**
- **Género:** *niñ-**o*** / *niñ-**a***
- **Número:** *niño-**s***

**En el verbo:**
- **Vocal temática** (indica la conjugación): *cant-**a**-r*, *tem-**e**-r*, *part-**i**-r*
- **Tiempo y modo:** *cant-a-**ba**-mos*
- **Persona y número:** *cant-a-ba-**mos***

> ***Cantábamos*** = *cant-* (lexema) + *-a-* (vocal temática, 1ª conjugación) + *-ba-* (tiempo/modo: pretérito imperfecto de indicativo) + *-mos* (persona/número: 1ª plural)

## B. Morfemas derivativos (afijos)

**Sí crean palabras nuevas**, con entrada propia en el diccionario.

| Afijo | Posición | Ejemplos |
|---|---|---|
| **Prefijo** | Delante del lexema | ***re**-leer*, ***in**-útil*, ***pre**-ver*, ***des**-hacer* |
| **Sufijo** | Detrás del lexema | *libr-**ería***, *bond-**ad***, *rápid-**amente*** |
| **Interfijo** | Entre lexema y sufijo, **sin significado** | *pan-**ec**-illo*, *polv-**ar**-eda*, *cafe-**t**-ero* |

⚠️ El **interfijo** no significa nada: solo sirve de enlace fónico. Identificarlo correctamente demuestra precisión.

## Los sufijos apreciativos

Caso especial: **no cambian la categoría** de la palabra, solo añaden **valoración afectiva**.

| Tipo | Sufijos | Valor |
|---|---|---|
| **Diminutivos** | *-ito, -illo, -ín, -uelo, -ico* | Tamaño pequeño, **afecto**, ironía |
| **Aumentativos** | *-ón, -azo, -ote* | Tamaño grande, admiración |
| **Despectivos** | *-ucho, -aco, -ejo, -astro* | Desprecio |

**En el comentario de texto siempre suman**, porque revelan la **subjetividad** del emisor:
> *salvaj**ito*** → el diminutivo no indica tamaño sino **reproche cariñoso**.

## Palabras simples, derivadas, compuestas y parasintéticas

| Tipo | Composición |
|---|---|
| **Simple** | Lexema (+ flexivos): *sol*, *niño* |
| **Derivada** | Lexema + afijos derivativos: *solar*, *insolación* |
| **Compuesta** | Dos o más lexemas: *girasol* |
| **Parasintética** | Prefijo + lexema + sufijo simultáneos, o composición + derivación |

## Cómo se presenta el análisis

Separa cada elemento con guiones e **identifica todos**:

> ***Desafortunadamente*** = *des-* (pref. negativo) + *a-* (pref.) + *fortun-* (lexema) + *-ad-* (suf.) + *-a-* (flexivo fem.) + *-mente* (suf. adverbial)`,
    worked_example_markdown: `## Ejemplo guiado: cinco análisis resueltos

### 1. *Salvajito*
> *salvaj-* (lexema; familia: *salvaje*, *salvajismo*) + *-it-* (sufijo apreciativo **diminutivo**) + *-o* (morfema flexivo de género masculino)

**Comentario que suma:** el diminutivo **no indica tamaño**. En *"¡Qué salvajito eres, mi niño!"* expresa **afecto y reproche a la vez**: Quiterita censura, pero con ternura. Relacionar morfología y valor expresivo es exactamente lo que se pide en el comentario de texto.

### 2. *Inteligencia*
> *in-* + *telig-* (lexema, del latín *legere*) + *-encia* (sufijo derivativo que forma **sustantivos abstractos** deverbales) + *-a* (flexivo de género femenino)

⚠️ Aquí *in-* **no es el prefijo negativo**: está lexicalizado (viene de *inter-*). *Inteligencia* no significa "no teligencia". Detectar estos falsos prefijos demuestra criterio.

### 3. *Enarbolan*
> *en-* (prefijo) + *arbol-* (lexema) + *-a-* (vocal temática, 1ª conjugación) + *-n* (flexivo: 3ª persona del plural, presente de indicativo)

### 4. *Desconocimiento*
> *des-* (prefijo de negación) + *conoc-* (lexema) + *-i-* (vocal temática) + *-miento* (sufijo nominalizador deverbal)

### 5. *Panecillo*
> *pan-* (lexema) + *-ec-* (**interfijo**, sin significado, solo enlaza) + *-ill-* (sufijo diminutivo) + *-o* (flexivo de género)

⚠️ Sin el interfijo tendríamos *\\*panillo*, que no existe. Esa es la prueba de que *-ec-* está ahí solo por razones fónicas.

## El método en cuatro pasos

**1. Localiza el lexema.** Busca tres palabras de la misma familia y quédate con lo común.
> *desconocimiento* → *conocer*, *conocido*, *reconocer* → lexema **conoc-**

**2. Lo que queda a la izquierda son prefijos.**
> *des-*

**3. Lo que queda a la derecha:** primero los **sufijos derivativos**, después los **flexivos** (siempre al final).
> *-i-* (vocal temática) + *-miento* (sufijo)

**4. Identifica cada elemento con su nombre y su valor.**
No basta con separar: hay que decir **qué es** cada trozo y **qué aporta**.

## Error frecuente

**❌** *"desconocimiento = des + conocimiento"*
Es una segmentación válida en dos pasos, pero incompleta: no llega al lexema ni identifica los sufijos.

**✅** *"des- (prefijo negativo) + conoc- (lexema) + -i- (vocal temática) + -miento (sufijo nominalizador deverbal)"*`,
    practice_prompt: 'Analiza la estructura morfológica indicando lexema, prefijos, sufijos, interfijos y morfemas flexivos, y di qué aporta cada elemento: (a) "reconstrucción"; (b) "cabecita"; (c) "antinaturales"; (d) "corríamos"; (e) "polvareda". Para cada una, localiza primero el lexema buscando tres palabras de su familia léxica.',
    alert_markdown: '⚠️ **Flexivo y derivativo no son lo mismo.** *Niñas* y *niño* son **la misma palabra** (morfemas flexivos, una sola entrada en el diccionario); *niñera* es una **palabra nueva** (morfema derivativo, entrada propia). Es la distinción que fundamenta todo el análisis morfológico.',
  },

  {
    sort_order: 33,
    title: 'La Derivación',
    concept_markdown: `## Qué es

Proceso de formación de palabras consistente en añadir **afijos derivativos** a un lexema. Es el mecanismo **más productivo** del español.

## Derivación por prefijación

El prefijo va delante y **normalmente no cambia la categoría** de la palabra.

| Prefijo | Valor | Ejemplos |
|---|---|---|
| *in-, i-, im-, des-, a-* | Negación, privación | *in-útil*, *des-hacer*, *a-normal* |
| *re-* | Repetición, intensidad | *re-leer*, *re-quete-bueno* |
| *pre-, ante-* | Anterioridad | *pre-ver*, *ante-sala* |
| *pos(t)-* | Posterioridad | *pos-guerra* |
| *sub-, infra-* | Inferioridad | *sub-suelo*, *infra-valorar* |
| *super-, sobre-, hiper-* | Superioridad, exceso | *super-dotado*, *hiper-activo* |
| *anti-, contra-* | Oposición | *anti-virus*, *contra-decir* |
| *co-, con-* | Compañía | *co-autor* |
| *inter-* | Entre | *inter-nacional* |
| *auto-* | Por sí mismo | *auto-determinación* |
| *multi-, poli-* | Pluralidad | *multi-modal*, *poli-semia* |
| *bi-, tri-* | Numerales | *bi-lingüe* |

## Derivación por sufijación

El sufijo va detrás y **sí suele cambiar la categoría**.

| Sufijos | Crean | Ejemplos |
|---|---|---|
| *-ción, -sión, -miento* | Sustantivos **deverbales** (acción) | *creación*, *movimiento* |
| *-dad, -ez, -eza, -ura, -ismo* | Sustantivos **deadjetivales** (cualidad) | *bondad*, *belleza*, *altura* |
| *-ero, -ista, -dor, -ante* | Sustantivos de **agente/oficio** | *panadero*, *cantante* |
| *-ería, -ado* | Sustantivos de **lugar** o **conjunto** | *panadería*, *alumnado* |
| *-oso, -able, -ible, -al, -ivo, -ante* | Adjetivos | *famoso*, *amable*, *disruptivo* |
| *-mente* | Adverbios | *rápidamente* |
| *-izar, -ificar, -ear, -ecer* | Verbos | *modernizar*, *clarificar* |

## Los tipos de derivados según la base

- **Deverbales** (de verbo): *construir* → *construc-**ción***
- **Deadjetivales** (de adjetivo): *bello* → *bell-**eza***
- **Denominales** (de sustantivo): *pan* → *pan-**adería***

Nombrar el tipo demuestra precisión: no es lo mismo decir "deriva de una palabra" que "es un **sustantivo deverbal de acción**".

## Derivación regresiva

Caso especial: en lugar de **añadir**, se **quita**. El derivado es **más corto** que la base.
> *desconcertar* → *desconcierto*
> *comprar* → *compra*
> *fichar* → *ficha*

Se reconoce porque el sustantivo carece de sufijo y procede de un verbo.

## Cómo se responde

Indica **tres cosas**:
1. **De qué palabra deriva** y de qué categoría es esa base.
2. **Qué afijo** se añade.
3. **Qué categoría** resulta y **con qué valor**.

> *"**Innovación** deriva del verbo* innovar *mediante el sufijo* **-ción***, que forma **sustantivos deverbales** con valor de **acción y efecto**."*`,
    worked_example_markdown: `## Ejemplo guiado: cinco derivados analizados

### 1. *Disruptivo*
> Deriva de la base culta *disrupt-* (del latín *disrumpere*, 'romper') mediante el sufijo **-ivo**, que forma **adjetivos** a partir de bases verbales o nominales con el valor de *'que produce'* o *'relativo a'*.
> **Categoría resultante:** adjetivo.
> **Comentario:** el propio texto de la PAU 2026 explota la tensión entre este significado morfológico —*que produce ruptura*— y el uso social del término como elogio.

### 2. *Precipitada*
> Del verbo *precipitar* + sufijo de **participio -ada**, que aquí funciona como **adjetivo** (adjetivo participial).
> ⚠️ *Pre-* está **lexicalizado**: forma parte del verbo latino de origen, no es un prefijo que el hablante añada hoy.

### 3. *Autodeterminación*
> **Doble proceso**: prefijación + sufijación.
> *auto-* (prefijo culto griego, 'por sí mismo') + *determin-* (lexema) + *-ción* (sufijo nominalizador).
> **Base:** el verbo *determinar*. **Resultado:** sustantivo abstracto deverbal.
> ⚠️ **No es parasíntesis**, porque *determinación* existe de forma autónoma: el prefijo se añade a una palabra ya formada.

### 4. *Fulgurante*
> Del verbo *fulgurar* + sufijo **-ante**, que forma adjetivos con valor de **agente o acción en curso** ('que fulgura').
> **Comentario de texto:** aplicado a la "carrera" de Meta, el adjetivo funciona **irónicamente**: sugiere brillo deslumbrante para criticar precisamente esa velocidad.

### 5. *Desconcierto*
> Del verbo *desconcertar* por **derivación regresiva**: se acorta la base verbal en lugar de añadir sufijo.
> **Resultado:** sustantivo deverbal.

## La plantilla de respuesta

> *"**[Palabra]** deriva de **[base]**, que es un **[categoría de la base]**, mediante **[afijo]**, sufijo/prefijo que forma **[categoría resultante]** con valor de **[significado]**."*

Aplicada:
> *"**Envejecimiento** deriva del verbo *envejecer* mediante el sufijo **-miento**, que forma **sustantivos deverbales** con valor de **acción y efecto**. A su vez, *envejecer* es un verbo **parasintético** formado sobre el adjetivo *viejo* con el prefijo *en-* y el sufijo *-ecer* de manera simultánea."*

Fíjate en que la segunda frase **anticipa** la pregunta siguiente (el proceso de formación) y encadena los dos análisis. Eso demuestra dominio.

## El descarte que hay que hacer siempre

Ante cualquier palabra con prefijo **y** sufijo, comprueba si es **parasíntesis**:

| Palabra | ¿Existe sin prefijo? | ¿Existe sin sufijo? | Proceso |
|---|---|---|---|
| *desconfianza* | *confianza* ✅ | — | **Derivación** |
| *autodeterminación* | *determinación* ✅ | — | **Derivación** |
| *enrojecer* | *\\*rojecer* ❌ | *\\*enrojo* ❌ | **Parasíntesis** |`,
    practice_prompt: 'Explica el proceso de derivación de estas palabras indicando base, categoría de la base, afijo, categoría resultante y valor: (a) "envejecimiento"; (b) "imprescindible"; (c) "claramente"; (d) "informatizar"; (e) "compra". Para cada una comprueba si es derivación o parasíntesis aplicando la tabla de descarte.',
    alert_markdown: '⚠️ **Cuidado con los prefijos lexicalizados.** En *inteligencia* el *in-* no es negativo, y en *precipitar* el *pre-* no lo añade el hablante: vienen ya soldados desde el latín. Analizarlos como prefijos activos del español es un error de precisión.',
  },

  {
    sort_order: 34,
    title: 'Composición, Parasíntesis y Otros Procesos',
    concept_markdown: `## Composición

Unión de **dos o más lexemas** en una sola palabra.

| Tipo | Cómo se escribe | Ejemplos |
|---|---|---|
| **Propia u ortográfica** | Unidas gráficamente | *sacacorchos*, *pelirrojo*, *bienestar* |
| **Sintagmática o impropia** | Separadas o con guion | *guardia civil*, *físico-químico*, *coche cama* |
| **Culta** | Lexemas griegos o latinos | *biblio-teca*, *tele-visión*, *demo-cracia* |

**Estructuras frecuentes:**
- **Verbo + sustantivo:** *saca-corchos*, *guarda-espaldas*, *para-guas*
- **Sustantivo + sustantivo:** *bocacalle*, *telaraña*
- **Sustantivo + adjetivo:** *pelirrojo*, *aguardiente*
- **Adjetivo + adjetivo:** *agridulce*, *sordomudo*
- **Adverbio + verbo/adjetivo:** *bienestar*, *malpensado*

## Parasíntesis

Hay **dos casos distintos** y ambos se preguntan.

### Caso 1: prefijo + lexema + sufijo **simultáneos**
No existen los pasos intermedios:
> *en-* + *roj-* + *-ecer* → ***enrojecer***
> No existen *\\*enrojo* ni *\\*rojecer*

Otros: *aterrizar*, *apenar*, *empobrecer*, *desalmado*, *anaranjado*.

### Caso 2: composición + derivación **a la vez**
> *pica* + *pedr-* + *-ero* → ***picapedrero***
> *siete* + *mes-* + *-ino* → ***sietemesino***

## La prueba de la parasíntesis

**Quita el prefijo: ¿existe la palabra? Quita el sufijo: ¿existe?**

Si **ninguna de las dos** existe → **parasíntesis**.

| Palabra | Sin prefijo | Sin sufijo | Resultado |
|---|---|---|---|
| *desalmado* | *\\*almado* ❌ | *\\*desalma* ❌ | **Parasíntesis** ✅ |
| *desconfianza* | *confianza* ✅ | — | Solo **derivación** |
| *enrojecer* | *\\*rojecer* ❌ | *\\*enrojo* ❌ | **Parasíntesis** ✅ |
| *desagradable* | *agradable* ✅ | — | Solo **derivación** |

**En el examen hay que enseñar la prueba**, no solo dar el resultado.

## Otros procesos

| Proceso | En qué consiste | Ejemplos |
|---|---|---|
| **Siglas** | Iniciales que se leen **deletreando** | *ONG*, *IA*, *DNI*, *RAE* |
| **Acrónimo** (sigla lexicalizada) | Siglas leídas **como palabra** | *ovni*, *OTAN*, *láser*, *sida*, *radar* |
| **Acronimia** | **Fusión de segmentos** de dos palabras | *ofi(cina)* + *(infor)mática* → *ofimática*; *tele* + *maratón* → *telemaratón* |
| **Acortamiento o abreviación** | Reducción de la palabra | *profe*, *bici*, *insti*, *cole*, *depre* |
| **Préstamo** | Palabra tomada de otra lengua | *cool*, *software*, *chef* |
| **Calco** | **Traducción literal** de un préstamo | *rascacielos* (< *skyscraper*), *baloncesto* (< *basketball*) |
| **Neologismo semántico** | Palabra existente con significado nuevo | *ratón* (informático), *nube*, *viral* |

## Sigla, acrónimo y acronimia: la confusión clásica

- **Sigla:** *ONG* → se deletrea (o-ene-ge)
- **Acrónimo:** *ovni* → se lee como palabra, y acaba lexicalizándose (se escribe en minúscula y admite plural: *ovnis*)
- **Acronimia:** *ofimática* → **no** son iniciales, son **trozos** de palabras`,
    worked_example_markdown: `## Ejemplo guiado: siete procesos identificados

### 1. *IA* (en el texto sobre inteligencia artificial)
> **Sigla**, formada por las iniciales de *inteligencia artificial*, que se lee deletreando (i-a). No se ha lexicalizado como acrónimo.

### 2. *Ofimática*
> **Acronimia**: fusión de segmentos de *ofi(cina)* e *(infor)mática*. No son iniciales, sino fragmentos.

### 3. *Enrojecer*
> **Parasíntesis** por prefijación y sufijación simultáneas: *en-* + *roj-* + *-ecer*.
> **Prueba:** no existen *\\*enrojo* ni *\\*rojecer*, luego el prefijo y el sufijo se han añadido a la vez sobre el adjetivo *rojo*.

### 4. *Cool* (en "ser muy cool")
> **Préstamo** (anglicismo) **no adaptado**: conserva su grafía y pronunciación originales.
> **Comentario de texto:** su uso en el artículo es **irónico**. La autora reproduce el registro de quienes emplean "disruptivo" como moda, y con ello lo ridiculiza sin criticarlo explícitamente.

### 5. *Bienestar* (en "ley del bienestar animal")
> **Composición propia**: *bien* (adverbio) + *estar* (verbo), unidos gráficamente.

### 6. *Multimodal*
> **Derivación por prefijación**: prefijo culto *multi-* ('muchos') + adjetivo *modal*.
> **No es parasíntesis:** *modal* existe de forma autónoma.

### 7. *Desalmado*
> **Parasíntesis**: *des-* + *alm-* + *-ado*.
> **Prueba:** ni *\\*desalma* ni *\\*almado* existen en español.

## Cómo se escribe la prueba en el examen

**❌ Insuficiente:**
> *"Es una palabra parasintética."*

**✅ Completo:**
> *"Se trata de una palabra **parasintética**, formada por **prefijación y sufijación simultáneas**: *des-* + *alm-* + *-ado*. Lo demuestra el hecho de que **ninguno de los pasos intermedios existe** en español: no hay ni *\\*desalma* (lexema con solo prefijo) ni *\\*almado* (lexema con solo sufijo), lo que prueba que ambos afijos se han incorporado en un único proceso."*

## Tabla de decisión

Ante cualquier palabra, pregunta en este orden:

1. ¿Tiene **dos lexemas**? → **Composición**
2. ¿Tiene **prefijo Y sufijo**, y ninguno de los intermedios existe? → **Parasíntesis**
3. ¿Tiene **solo prefijo** o **solo sufijo** (o ambos, pero con intermedios existentes)? → **Derivación**
4. ¿Son **iniciales**? → **Sigla** (o **acrónimo** si se lee como palabra)
5. ¿Son **trozos** de palabras? → **Acronimia**
6. ¿Es una palabra **recortada**? → **Acortamiento**
7. ¿Viene de **otra lengua**? → **Préstamo** (o **calco** si está traducida)`,
    practice_prompt: 'Indica el proceso de formación de: (a) "sacapuntas"; (b) "aterrizar"; (c) "ovni"; (d) "boli"; (e) "malhumorado"; (f) "wifi"; (g) "rascacielos"; (h) "teleñeco". Para los casos de parasíntesis, escribe la prueba completa demostrando que ninguno de los pasos intermedios existe.',
    alert_markdown: '⚠️ **No basta con decir "es parasintética": hay que demostrarlo.** La prueba obligatoria consiste en mostrar que **ni** la forma con solo prefijo **ni** la forma con solo sufijo existen en español. Sin esa demostración, la respuesta queda a medias.',
  },

  {
    sort_order: 35,
    title: 'Análisis Morfológico Completo: Método',
    concept_markdown: `## La pregunta encadenada

El enunciado típico de la PAU pide **tres tareas** en una sola pregunta de 0,8 puntos:

> *"Indique a qué categoría gramatical pertenece **X**, analice su estructura morfológica y señale a qué proceso de formación de palabras responde."*

Las tres partes puntúan por separado. Responder solo la primera deja dos tercios sin contestar.

## Paso 1 — Categoría gramatical

Di la categoría **y justifícala por su comportamiento**, no por su significado:

| Categoría | Justificación tipo |
|---|---|
| **Sustantivo** | Admite determinante; puede ser núcleo de un SN |
| **Adjetivo** | Concuerda en género y número; admite gradación (*muy X*, *X-ísimo*) |
| **Verbo** | Admite flexión de persona, tiempo y modo |
| **Adverbio** | Es invariable; modifica a verbo, adjetivo u otro adverbio |
| **Determinante** | Concuerda y **acompaña** a un sustantivo |
| **Pronombre** | **Sustituye** a un SN |

## Paso 2 — Estructura morfológica

**Segmenta** separando cada elemento con guiones e **identifica todos**:

> *in-* (prefijo negativo) + *oper-* (lexema) + *-ante* (sufijo adjetivador) + *-s* (morfema flexivo de número)

**El orden de trabajo:**
1. Localiza el **lexema** (busca la familia léxica).
2. A la izquierda → **prefijos**.
3. A la derecha → **sufijos derivativos** y, al final, **morfemas flexivos**.
4. Comprueba si hay **interfijo** (elemento de enlace sin significado).

## Paso 3 — Proceso de formación

**Nombra el proceso y demuéstralo**, descartando el que podría confundirse:

> *"Responde a la **derivación** por prefijación y sufijación. **No es parasíntesis**, pues *operante* existe de forma independiente."*

## La checklist mental

1. ¿Cuál es el **lexema**? → busca tres palabras de la familia
2. ¿Hay algo a la **izquierda**? → prefijos
3. ¿Hay algo a la **derecha**? → sufijos + flexivos
4. ¿Hay **dos lexemas**? → composición
5. ¿Prefijo y sufijo **imprescindibles a la vez**? → parasíntesis
6. ¿Es más **corta** que su base verbal? → derivación regresiva

## Lo que distingue un 0,8 de un 0,4

- **Justificar** la categoría en vez de afirmarla.
- **Nombrar el valor** de cada afijo, no solo separarlo.
- **Descartar razonadamente** el proceso alternativo.
- Si procede, **añadir el comentario expresivo** (un diminutivo afectivo, un anglicismo irónico).`,
    worked_example_markdown: `## Ejemplo guiado 1: respuesta completa

**Pregunta:** *Indique la categoría gramatical de "desconcierto", analice su estructura morfológica y el proceso de formación.*

> ***Categoría gramatical.*** *"Desconcierto" es un **sustantivo** común, abstracto y de género masculino. Lo acreditan dos pruebas: admite **determinante** (*el desconcierto*, *un desconcierto*) y puede desempeñar las funciones propias del sintagma nominal, como sujeto o complemento directo.*
>
> ***Estructura morfológica.*** *Se segmenta en **des-** (prefijo de negación o inversión de la acción) + **conciert-** (lexema, con diptongación de la /e/ tónica, presente en la familia *concertar, concierto, concertación*) + **-o** (morfema flexivo de género masculino, que aquí funciona además como marca de sustantivo deverbal).*
>
> ***Proceso de formación.*** *Se trata de **derivación**, concretamente de **derivación regresiva**: el sustantivo se forma a partir del verbo *desconcertar* **acortando** la base verbal en lugar de añadirle un sufijo, procedimiento habitual en pares como *comprar/compra* o *fichar/ficha*. **No es parasíntesis**, ya que *concierto* existe como palabra autónoma en español, de modo que el prefijo se ha añadido a una base ya formada.*

## Ejemplo guiado 2: la pregunta real de PAU 2026

**Pregunta:** *Indique a qué categoría gramatical pertenece "predominante", analice su estructura morfológica y señale a qué proceso de formación de palabras responde.*

> ***Categoría.*** *Es un **adjetivo** calificativo: concuerda en número con el sustantivo al que acompaña (*rasgo predominante / rasgos predominantes*), admite gradación (*muy predominante*) y desempeña funciones de adyacente o de atributo.*
>
> ***Estructura.*** ***pre-*** *(prefijo culto de anterioridad o superioridad) +* ***domin-*** *(lexema; familia: *dominar, dominio, dominante*) +* ***-ante*** *(sufijo derivativo que forma adjetivos sobre bases verbales, con valor de agente o de acción en curso).*
>
> ***Proceso.*** ***Derivación** por sufijación sobre el verbo *predominar* mediante *-ante*. **No es parasíntesis**, pues el verbo *predominar* existe de forma autónoma y el adjetivo se obtiene de él en un solo paso.*

## Comprobación final

| Requisito | ¿Hecho? |
|---|---|
| Categoría **justificada** con pruebas | ✅ |
| Segmentación **completa** | ✅ |
| **Valor** de cada afijo indicado | ✅ |
| Proceso **nombrado** | ✅ |
| Proceso alternativo **descartado** | ✅ |

Si las cinco casillas están marcadas, la pregunta vale los 0,8 completos.`,
    practice_prompt: 'Responde por completo (categoría justificada + estructura segmentada con el valor de cada afijo + proceso demostrado con descarte del alternativo) para: "insoportable", "guardacostas", "envejecimiento" y "salvajito". Comprueba al final las cinco casillas de la tabla en cada una.',
    alert_markdown: '⚠️ **La pregunta tiene tres partes y cada una puntúa.** Responder solo "es un adjetivo" deja dos tercios sin contestar. Y en la tercera parte, **descartar razonadamente** el proceso alternativo (normalmente la parasíntesis) es lo que la completa.',
  },

  {
    sort_order: 36,
    title: 'Sinonimia y Antonimia',
    concept_markdown: `## Sinonimia

Relación entre palabras de **significante distinto** y **significado igual o muy parecido**.

### Tipos

**Sinonimia total o absoluta.** Intercambiables en **cualquier** contexto sin alterar el significado. Es **rarísima**: la lengua tiende a especializar.
> *esposo / marido*, *burro / asno*, *comenzar / empezar*

**Sinonimia parcial o contextual.** Solo son equivalentes en **algunos** contextos. Es la habitual.
> *listo / inteligente* ✅ en *un chico listo*
> ❌ en *estoy listo* (= preparado)

**Sinonimia referencial.** Dos expresiones designan **la misma realidad** sin tener el mismo significado.
> *el autor de* Hijos de la ira */ Dámaso Alonso*

**Sinonimia connotativa o de registro.** Mismo significado denotativo, distinta valoración o nivel:
> *morir / fallecer / palmar*
> *orinal / bacinilla* (el segundo, más popular y rural)

### Por qué casi no hay sinónimos totales
Porque las palabras difieren en **registro** (*cara/rostro/jeta*), en **connotación**, en **zona geográfica** (*coche/carro*) o en **combinatoria** (*un rebaño de ovejas*, no *\\*una manada de ovejas*).

## Antonimia

Relación de **oposición** de significado. Hay **tres tipos** y distinguirlos es exactamente lo que se pregunta.

| Tipo | En qué consiste | Prueba | Ejemplos |
|---|---|---|---|
| **Graduales** | Admiten **términos intermedios** y gradación | ¿Puedo decir *muy X*? ¿Hay algo entre medias? | *frío / (templado) / caliente*, *alto / bajo* |
| **Complementarios** | Negar uno **implica** el otro; sin grados | ¿*No X* = *Y*? | *vivo / muerto*, *legal / ilegal*, *presente / ausente* |
| **Recíprocos** o inversos | Uno **implica** al otro desde la perspectiva contraria | ¿Puede existir uno sin el otro? | *comprar / vender*, *padre / hijo*, *dar / recibir* |

### Las pruebas aplicadas

> *frío / caliente*: existe *templado*, y puedo decir *muy frío* → **graduales**
> *vivo / muerto*: *no está vivo* **significa** *está muerto*; *\\*muy vivo* (en sentido literal) no funciona → **complementarios**
> *comprar / vender*: si A compra a B, **necesariamente** B vende a A → **recíprocos**

## Antónimos léxicos y gramaticales

- **Léxicos:** palabras distintas. *alto / bajo*
- **Gramaticales:** formados con **prefijos** negativos. *legal / **i**legal*, *hacer / **des**hacer*

## Para qué sirve en el comentario

La **antonimia** es un mecanismo de **cohesión** (recurrencia semántica por oposición) y la base de la figura de la **antítesis**. Relacionar semántica y retórica siempre suma:

> *"La **antonimia gradual** entre *nada* y *mucho* sostiene la **paradoja** «No renunciaron a nada: renunciaron a mucho», que condensa la tesis del texto."*`,
    worked_example_markdown: `## Ejemplo guiado: la pregunta tipo de PAU

**Pregunta:** *Defina el concepto de antonimia y clasifique los siguientes pares: frío/caliente, vivo/muerto, comprar/vender.*

### Respuesta modelo

> *La **antonimia** es la relación semántica de **oposición** entre dos unidades léxicas que comparten un mismo campo de significado pero se sitúan en extremos contrarios. Se distinguen tres clases:*
>
> ***1. Frío / caliente → antónimos graduales.*** *Entre ambos extremos existen **términos intermedios** (*templado*, *tibio*, *fresco*) y ambos admiten **gradación** (*muy frío*, *bastante caliente*). La negación de uno **no implica** el otro: *no está frío* no significa necesariamente *está caliente*.*
>
> ***2. Vivo / muerto → antónimos complementarios.*** *La negación de uno **implica necesariamente** la afirmación del otro: *no está vivo* equivale a *está muerto*. No admiten términos intermedios ni gradación en sentido literal: entre estar vivo y estar muerto no hay estados intermedios.*
>
> ***3. Comprar / vender → antónimos recíprocos o inversos.*** *Designan **la misma acción desde perspectivas opuestas**. Si A compra algo a B, necesariamente B se lo vende a A: la existencia de uno de los términos **implica** la del otro.*

## Aplicación a un texto real

**Sobre el artículo de Juan Soto Ivars (PAU 2026):**

> *La sentencia "**No renunciaron a nada: renunciaron a mucho**" se construye sobre la **antonimia gradual** entre *nada* y *mucho*, extremos de una escala de cantidad que admite múltiples valores intermedios.*
>
> *La eficacia del recurso reside en que el autor **niega y afirma el mismo verbo** con dos cuantificadores opuestos, generando una **paradoja**: la contradicción es solo aparente y se resuelve al distinguir dos ámbitos de renuncia —la profesional, a la que no renunciaron, y la vital, a la que sí—.*
>
> *La antonimia funciona además como mecanismo de **cohesión** por recurrencia semántica, y el **paralelismo** sintáctico refuerza el contraste.*

## Sobre los sinónimos: cómo responder bien

**❌** *"Cara y rostro son sinónimos."*
**✅** *"*Cara* y *rostro* son **sinónimos parciales**: comparten significado denotativo pero difieren en **registro**, pues *rostro* pertenece a un nivel más culto o literario. No son, por tanto, intercambiables en cualquier contexto: *me duele la cara* resulta natural, mientras que *\\*me duele el rostro* suena impropio."*

**La clave:** al ofrecer un sinónimo, **matiza siempre** en qué contexto funciona.`,
    practice_prompt: 'Clasifica estos pares de antónimos aplicando las tres pruebas (términos intermedios, implicación de la negación, reciprocidad): (a) "alto/bajo"; (b) "presente/ausente"; (c) "profesor/alumno"; (d) "posible/imposible"; (e) "dar/recibir"; (f) "caro/barato". Después busca en un texto un par de antónimos y explica qué función cumple su oposición.',
    alert_markdown: '⚠️ **La sinonimia total casi no existe.** Si te piden un sinónimo, ofrécelo **y matiza el contexto o el registro** en que funciona. Afirmar que dos palabras son sinónimos absolutos es casi siempre inexacto y el corrector lo detecta.',
  },

  {
    sort_order: 37,
    title: 'Polisemia y Homonimia',
    concept_markdown: `## Polisemia

**Una sola palabra** que ha desarrollado **varios significados relacionados** entre sí a partir de un **origen etimológico común**.

> ***Artículo***: 1) escrito periodístico · 2) mercancía · 3) clase de palabra · 4) apartado de una ley

Todos proceden del latín *articulus* ('pequeña articulación, parte, división') y comparten la idea de **parte o unidad de un conjunto**.

**En el diccionario:** aparece **una sola entrada** con las acepciones numeradas.

## Homonimia

**Dos palabras distintas**, de **origen etimológico diferente**, que han coincidido casualmente en su forma tras evolucionar.

> ***Banco***: asiento (del germánico *bank*) / entidad financiera (del italiano *banca*)
> ***Vino***: bebida (del latín *vinum*) / del verbo *venir*

**En el diccionario:** aparecen **dos entradas distintas**, numeradas con superíndice.

### Tipos de homonimia

| Tipo | Definición | Ejemplos |
|---|---|---|
| **Homógrafas** | Se **escriben** igual y suenan igual | *haya* (árbol) / *haya* (verbo haber); *vino* (bebida) / *vino* (venir) |
| **Homófonas** | **Suenan** igual pero se escriben distinto | *vaya / valla / baya*; *hola / ola*; *tubo / tuvo*; *asta / hasta* |

En español, por la relativa correspondencia entre grafía y sonido, la mayoría de las homónimas son **homógrafas**.

## Cómo se distinguen

**El criterio es el ORIGEN ETIMOLÓGICO**, no la intuición ni la distancia entre los significados:

| Pregunta | Si… | Entonces |
|---|---|---|
| ¿Los significados **están relacionados**? | Sí | **Polisemia** |
| ¿Proceden de **palabras distintas** que coincidieron? | Sí | **Homonimia** |

**Prueba práctica:** consulta el diccionario.
- **Una** entrada con varias acepciones → **polisemia**
- **Varias** entradas numeradas → **homonimia**

## Casos frontera

A veces la polisemia se ha extendido tanto que los hablantes ya no perciben el vínculo, y el diccionario acaba separando las entradas. *Sierra* (herramienta / cordillera) es históricamente polisémica —la cordillera se llamó así por su perfil dentado— pero muchos hablantes la sienten como homonimia.

**En el examen:** si el caso es discutible, **dilo y justifica**. Reconocer la frontera demuestra más criterio que elegir tajantemente.

## Para qué sirve

- La **polisemia** permite la **economía** del lenguaje y es la base de muchos **juegos de palabras** y **dilogías**.
- La **homonimia** genera **ambigüedad** y es fuente de humor y de errores ortográficos (*halla/haya/aya*).`,
    worked_example_markdown: `## Ejemplo guiado: la pregunta real de PAU 2026

**Pregunta:** *Defina el concepto de polisemia y ejemplifíquelo con la palabra "artículo".*

### Respuesta modelo

> *La **polisemia** es el fenómeno semántico por el cual **una misma palabra** posee **varios significados relacionados entre sí**, surgidos por evolución a partir de un **origen etimológico común**. Se diferencia de la **homonimia** en que en esta última coinciden formalmente **palabras de procedencia distinta**, lo que se refleja en que el diccionario les asigna entradas separadas, mientras que la palabra polisémica ocupa una sola entrada con varias acepciones.*
>
> *La palabra **"artículo"** constituye un ejemplo claro de polisemia, pues presenta al menos cuatro acepciones vinculadas entre sí:*
>
> *1. **Escrito publicado en un periódico**: "el artículo de Juan Soto Ivars".*
> *2. **Mercancía u objeto de comercio**: "artículos de primera necesidad".*
> *3. **Clase de palabra que actualiza al sustantivo**: "el artículo determinado".*
> *4. **Cada una de las divisiones de una ley o reglamento**: "el artículo 27 de la Constitución".*
>
> *Todas ellas proceden del latín* **articulus** *('pequeña articulación, parte, división'), de donde deriva la idea común de **parte o unidad diferenciada dentro de un conjunto mayor**: una parte del periódico, una unidad del comercio, una clase dentro del sistema gramatical y una división del texto legal. Es precisamente ese vínculo semántico compartido lo que permite hablar de polisemia y no de homonimia.*

## Por qué esta respuesta vale los 0,8

| Requisito | ¿Está? |
|---|---|
| **Define** el concepto | ✅ |
| **Contrasta** con la homonimia | ✅ |
| Menciona el **criterio del diccionario** | ✅ |
| Da **varias acepciones** con ejemplo de uso | ✅ cuatro |
| **Explica el vínculo etimológico** | ✅ |

**El último punto es el decisivo.** Enumerar los cuatro significados sin decir que todos vienen de la idea de "parte" no demuestra haber entendido qué **es** la polisemia: solo que sabes cuántos significados tiene la palabra.

## Ejercicio resuelto: cuatro casos clasificados

| Par | Análisis | Tipo |
|---|---|---|
| ***hoja*** (de árbol / de papel) | Ambos del latín *folia*; el papel se llamó así por su forma plana y delgada | **Polisemia** |
| ***llama*** (fuego / animal / verbo llamar) | Tres orígenes distintos: latín *flamma*, quechua *llama*, latín *clamare* | **Homonimia** (triple) |
| ***sierra*** (herramienta / montaña) | Ambos del latín *serra*; la cordillera por su perfil dentado | **Polisemia** (caso frontera) |
| ***cabo*** (militar / geográfico / extremo) | Todos del latín *caput* ('cabeza'), con la idea de extremo o jefatura | **Polisemia** |`,
    practice_prompt: 'Explica si estos casos son de polisemia u homonimia y justifícalo por el origen etimológico, indicando qué dirías si el caso es discutible: (a) "hoja"; (b) "llama"; (c) "sierra"; (d) "cabo"; (e) "vela"; (f) "gato". Después define polisemia contrastándola con la homonimia y ejemplifica con una palabra distinta de "artículo".',
    alert_markdown: '⚠️ **Explica siempre el vínculo entre las acepciones.** Enumerar los cuatro significados de *artículo* sin señalar que todos proceden de la idea de "parte" demuestra que conoces la palabra, no que entiendes qué es la polisemia. Ese vínculo es la definición misma del fenómeno.',
  },

  {
    sort_order: 38,
    title: 'Hiperonimia, Hiponimia y Campo Semántico',
    concept_markdown: `## Hiperonimia e hiponimia

Relación **jerárquica de inclusión** entre significados.

- **Hiperónimo:** término **general** que engloba a otros. Su significado está **contenido en** el de sus hipónimos.
- **Hipónimo:** término **específico** incluido en el anterior. Tiene **todos los rasgos** del hiperónimo **más** los suyos propios.
- **Cohipónimos:** hipónimos que comparten el mismo hiperónimo.

> **Hiperónimo:** *animal*
> **Hipónimos:** *perro*, *cabra*, *caballo* → cohipónimos entre sí

## La prueba

> *"Un perro **es un tipo de** animal"* ✅ → *animal* es hiperónimo de *perro*
> *"Un animal es un tipo de perro"* ❌

También: el hipónimo puede sustituirse por el hiperónimo **sin falsear** el enunciado (aunque se pierda precisión), pero no al revés.

## Es una relación relativa

Una misma palabra puede ser hiperónimo e hipónimo según con qué se compare:

> *ser vivo* > *animal* > **perro** > *galgo*

*Perro* es hipónimo de *animal* e hiperónimo de *galgo*.

## Para qué sirve en el comentario

La sustitución de un término por su **hiperónimo** es un mecanismo de **cohesión** (recurrencia semántica) que evita la repetición y permite avanzar sin monotonía:

> *La **Rubia** ladraba. El **animal** no se calmaba.*

Señalarlo en la pregunta de cohesión siempre puntúa.

## Campo semántico

Conjunto de palabras de **la misma categoría gramatical** que comparten al menos un rasgo de significado (**sema**) y se reparten un área de la realidad.

> **Campo del mobiliario:** *silla, mesa, sofá, taburete, armario*
> **Campo de los colores:** *rojo, azul, verde, amarillo*

**Rasgos:** los miembros son de la **misma categoría**, están en **relación de oposición** entre sí (cada uno ocupa un hueco distinto) y se definen por sus **semas** comunes y diferenciales.

## Campo asociativo o isotopía

Más amplio y libre que el campo semántico: agrupa palabras de **distintas categorías** relacionadas con un mismo tema.

> **Campo asociativo de la tecnología:** *disruptivo* (adj.), *innovación* (sust.), *adoptar* (verbo), *digitalmente* (adv.)

En el comentario de texto, lo que normalmente se localiza es esto: un **campo asociativo o isotopía** que recorre el texto y refuerza su unidad temática.

## Familia léxica: NO confundir

Palabras que comparten el **mismo lexema**, aunque sean de distinta categoría y de significado diverso:

> *pan, panadero, panadería, empanar, panecillo*

| | **Campo semántico** | **Familia léxica** |
|---|---|---|
| **Comparten** | El **significado** (un sema) | El **lexema** (la forma) |
| **Categoría** | La misma | Puede variar |
| **Ejemplo** | *silla, mesa, sofá* | *pan, panadero, empanar* |

Es una confusión que se penaliza siempre.`,
    worked_example_markdown: `## Ejemplo guiado: la pregunta tipo

**Pregunta:** *Localice en el texto dos ejemplos de hiponimia e indique cuál es su hiperónimo.*

**Aplicado al fragmento de Alexis Ravelo** (la perra, las cabras, el corral, la alcoba, la letrina):

### Respuesta modelo

> *En el texto aparecen los hipónimos **"perra"** y **"cabras"**, cuyo **hiperónimo** común es **"animal"**. La relación de hiponimia se comprueba porque el significado de ambos términos **incluye todos los rasgos** de *animal* y añade los específicos que los distinguen —canino y doméstico en un caso, caprino y de granja en el otro—, y porque resulta válido afirmar que "una perra es un tipo de animal", mientras que la afirmación inversa es imposible. Son, por tanto, **cohipónimos** entre sí.*
>
> *Cabe señalar además un segundo caso: **"alcoba"**, **"patio"**, **"corral"** y **"letrina"** funcionan como hipónimos de **"vivienda"** o "dependencia doméstica", constituyendo entre ellos un **campo semántico** que caracteriza el espacio rural y humilde en que transcurre la escena.*
>
> *Por el contrario, el par **"orinal" / "bacinilla"** no constituye hiponimia sino **sinonimia parcial** con diferencia de **registro**: el segundo término, más popular, aparece en boca de Quiterita y sirve para caracterizar lingüísticamente al personaje.*

## Por qué esta respuesta destaca

1. Aplica **la prueba** ("un X es un tipo de Y") en vez de afirmarlo sin más.
2. Explica la **inclusión de rasgos**, que es la definición del fenómeno.
3. Usa el término **cohipónimos**.
4. Añade un **segundo caso** con valor interpretativo (caracteriza el espacio).
5. **Descarta** un caso que podría confundirse y explica qué es en realidad.

## La distinción que se penaliza

**Campo semántico** *(mismo significado compartido, lexemas distintos)*:
> *silla, mesa, sofá, taburete* → todos son muebles

**Familia léxica** *(mismo lexema, significados distintos)*:
> *orina, orinal, orinar, orines* → todos comparten *orin-*

En el fragmento de Ravelo aparecen **las dos**: *alcoba/patio/corral/letrina* forman un **campo semántico**; *orinal/orinar/orines* forman una **familia léxica**.

## Esquema jerárquico completo

Para visualizar la relatividad de la relación:

> **ser vivo** *(hiperónimo)*
> └── **animal**
> &nbsp;&nbsp;&nbsp;&nbsp;├── **perro** ← hipónimo de *animal*, hiperónimo de *galgo*
> &nbsp;&nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;├── galgo
> &nbsp;&nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;└── mastín
> &nbsp;&nbsp;&nbsp;&nbsp;├── **cabra** ← cohipónimo de *perro*
> &nbsp;&nbsp;&nbsp;&nbsp;└── **caballo**`,
    practice_prompt: 'Localiza en un texto narrativo tres hipónimos y determina su hiperónimo, aplicando la prueba "un X es un tipo de Y". Después construye un campo semántico de cinco palabras y una familia léxica de cuatro a partir del mismo texto, y explica en dos líneas la diferencia entre ambos conceptos.',
    alert_markdown: '⚠️ **Campo semántico y familia léxica son cosas distintas.** *Silla, mesa, sofá* forman un **campo semántico** (comparten significado, lexemas distintos); *pan, panadero, panadería* forman una **familia léxica** (comparten lexema). Intercambiarlos se penaliza siempre.',
  },

  {
    sort_order: 39,
    title: 'Denotación, Connotación y Cambios de Significado',
    concept_markdown: `## Denotación y connotación

- **Denotación:** significado **objetivo**, el del diccionario, común a todos los hablantes de una lengua. Es el significado **conceptual**.
- **Connotación:** significados **añadidos** de carácter **subjetivo, afectivo, social o cultural**, que varían según el hablante, el contexto o la comunidad.

> ***Perro***
> **Denotación:** mamífero cánido doméstico.
> **Connotaciones:** fidelidad, lealtad (positivas); desprecio en *"vida de perros"*, *"tratar como a un perro"* (negativas).

## Por qué importa en el comentario

El **lenguaje connotativo** es una de las principales marcas de **subjetividad**. Señalar que el autor **elige** un término connotado en lugar de uno neutro es un hallazgo que puntúa:

> *"El autor no escribe *empresas* sino ***gigantes tecnológicos***, término cuyas connotaciones de desmesura y amenaza orientan la valoración del lector antes de que se formule ningún argumento."*

Los textos **denotativos** (científicos, jurídicos, administrativos) buscan la univocidad; los **connotativos** (literarios, publicitarios, periodísticos de opinión) explotan la ambigüedad.

## Los cambios semánticos

Los significados **evolucionan** con el tiempo. Se preguntan tanto las **causas** como los **mecanismos**.

### Causas

| Causa | En qué consiste | Ejemplo |
|---|---|---|
| **Históricas** | La realidad cambia pero la palabra permanece | *pluma* (de ave → de escribir), *azafata* |
| **Sociales** | Una palabra pasa de un grupo a otro | *faena* (del campo → del toreo) |
| **Psicológicas** | **Tabú** y **eufemismo** | *morir* → *fallecer*, *pasar a mejor vida* |
| **Lingüísticas** | Contagio entre palabras que aparecen juntas | *nada* (de *rem natam*, 'cosa nacida') |

### Mecanismos

| Mecanismo | Relación | Ejemplo |
|---|---|---|
| **Metáfora** | **Semejanza** | *la **falda** de la montaña*, *el **ratón** del ordenador* |
| **Metonimia** | **Contigüidad** (causa-efecto, continente-contenido, autor-obra) | *tomar una **copa***, *leer a **Cervantes*** |
| **Sinécdoque** | **Parte por el todo** o viceversa | *diez **cabezas** de ganado*, *ganarse el **pan*** |
| **Elipsis** | Supresión de un elemento del sintagma | *(teléfono) **móvil***, *(coche) **utilitario*** |

### Resultados

- **Ampliación de significado:** el término gana acepciones.
> *azafata*: criada de la reina → auxiliar de vuelo → de congresos, de televisión
- **Restricción de significado:** las pierde.
> *sabor*: cualquier sensación → solo la gustativa
> *labrar*: trabajar en general → trabajar la tierra
- **Cambio valorativo:** el término gana prestigio (**ennoblecimiento**) o lo pierde (**degradación**).
> *ministro*: 'sirviente' → alto cargo (ennoblecimiento)
> *villano*: 'habitante de una villa' → malvado (degradación)

## El eufemismo como decisión ideológica

Cuando un texto dice *flexibilización laboral* en vez de *despido más barato*, o *daños colaterales* en vez de *civiles muertos*, está tomando una **decisión ideológica**. Detectarlo y nombrarlo demuestra **lectura crítica**, que es exactamente lo que distingue un comentario notable.`,
    worked_example_markdown: `## Ejemplo guiado: connotación en el texto de la PAU 2026

### Respuesta modelo

> *La autora construye buena parte de su argumentación sobre la tensión entre **denotación** y **connotación** del término "disruptivo".*
>
> *Su **denotación**, que el texto cita expresamente de la RAE, es "que produce rotura o interrupción brusca": un significado **neutro o incluso negativo**, pues remite a la ruptura y al daño.*
>
> *Sin embargo, el término ha adquirido en el discurso empresarial unas **connotaciones marcadamente positivas**, asociadas a la innovación, la vanguardia y la modernidad, que el propio texto reproduce con ironía al equipararlas con "ser muy cool".*
>
> *Toda la eficacia crítica del artículo reside en esa **distancia**: al recordar el significado denotativo, la autora **desactiva** las connotaciones favorables y revela que se está celebrando, literalmente, la capacidad de romper cosas. El procedimiento se refuerza mediante dos marcas: las **comillas** en "disruptivo", que señalan distancia crítica respecto al término, y el **anglicismo** "cool", cuyas connotaciones de modernidad superficial se emplean con evidente sarcasmo.*

## Cambios semánticos en el mismo texto

| Palabra | Evolución | Mecanismo / causa |
|---|---|---|
| ***vanguardia*** | Militar ('parte delantera del ejército') → artística e ideológica | **Metáfora** |
| ***algoritmo*** | Matemático → sistema de recomendación digital | **Ampliación** por causa histórica |
| ***ratón*** *(informático)* | Animal → dispositivo | **Metáfora** por semejanza de forma |
| ***nube*** *(informática)* | Meteorológica → almacenamiento remoto | **Metáfora** |
| ***Meta*** | Del griego 'más allá' | **Préstamo culto** con nuevo referente |

## Ejercicio resuelto: elegir la palabra es tomar partido

Cuatro maneras de nombrar la misma realidad:

| Término | Connotación | Quién lo usa |
|---|---|---|
| ***recorte*** | Negativa: pérdida, amputación | Quien se opone |
| ***ajuste*** | Neutra-técnica: corrección necesaria | Quien gobierna |
| ***flexibilización*** | Positiva: adaptabilidad, modernidad | Quien lo promueve |
| ***austeridad*** | Positiva-moral: virtud, contención | Quien lo justifica |

**Todos denotan lo mismo. Ninguno connota lo mismo.**

**Cómo se escribe en el examen:**
> *"La elección del término **X** frente a sus alternativas denotativamente equivalentes revela la **posición ideológica** del emisor: mientras *recorte* connota pérdida y arbitrariedad, *ajuste* presenta la misma medida como corrección técnica necesaria, desactivando su carga polémica."*

**El patrón de análisis:** denotación → connotación → **efecto buscado por el autor**.`,
    practice_prompt: 'Analiza las connotaciones de estas palabras en un texto periodístico: "régimen", "recorte", "ajuste", "flexibilización", "inmigrante" y "expatriado". Explica por qué un emisor elegiría unas u otras para referirse a la misma realidad. Después localiza en un texto real un eufemismo y explica qué oculta.',
    alert_markdown: '⚠️ **El eufemismo es una decisión ideológica, no un adorno.** Detectar que un texto dice *flexibilización laboral* en lugar de *despido más barato*, y explicar qué desactiva ese cambio, es el tipo de observación que demuestra lectura crítica y eleva un comentario.',
  },

  {
    sort_order: 40,
    title: 'Las Lenguas de España y las Variedades del Español',
    concept_markdown: `## Marco legal

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
| **Aranés** (variedad del occitano) | Valle de Arán (Cataluña) | **Románica** |

**El dato clave:** catalán, gallego, aranés y castellano son **lenguas románicas** (proceden del latín); el **euskera no lo es**. Es una lengua **preindoeuropea** de origen desconocido, la **única lengua prerromana que sobrevivió a la romanización**. Mencionarlo siempre suma.

## Dialectos históricos, no lenguas

El **astur-leonés** (bable) y el **aragonés** (fabla) son **dialectos históricos del latín** —no derivan del castellano— pero **no tienen estatus de lengua oficial**. Gozan de protección en sus estatutos autonómicos.

## Bilingüismo y diglosia

| | **Bilingüismo** | **Diglosia** |
|---|---|---|
| **Situación** | Dos lenguas conviven en **igualdad** | Una lengua es **socialmente superior** |
| **Usos** | Ambas en todos los ámbitos | La **variedad alta** para lo formal; la **baja** para lo familiar |
| **Prestigio** | Equiparable | Desigual |
| **Estabilidad** | Puede ser estable | Tiende a la **sustitución** de la lengua baja |

## Variedades del castellano

### Dialectos septentrionales (norte peninsular)
Más próximos a la norma. Rasgos: **distinción** de /s/ y /θ/, **leísmo** y **laísmo** (Castilla), pronunciación de la /d/ final.

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
- **Jergas:** profesionales (tecnicismos) o de grupo (argot juvenil)`,
    worked_example_markdown: `## Ejemplo guiado 1: la pregunta real de PAU 2026

**Pregunta:** *Enumere las lenguas de España que tienen la consideración de oficiales.*

### Respuesta modelo

> *De acuerdo con el **artículo 3 de la Constitución española de 1978**, el **castellano** es la lengua española oficial del Estado, y todos los españoles tienen el deber de conocerla y el derecho a usarla. Las demás lenguas españolas son también oficiales en sus respectivas Comunidades Autónomas conforme a lo dispuesto en sus Estatutos de Autonomía:*
>
> - ***Catalán***, *cooficial en **Cataluña** y las **Islas Baleares**, y en la **Comunidad Valenciana** bajo la denominación estatutaria de **valenciano**.*
> - ***Gallego***, *cooficial en **Galicia**.*
> - ***Euskera***, *cooficial en el **País Vasco** y en la zona vascófona de **Navarra**.*
> - ***Aranés***, *variedad del occitano, oficial en el **Valle de Arán**.*
>
> *Debe precisarse que el **euskera** es la única de estas lenguas que **no procede del latín**: se trata de una lengua **preindoeuropea** de origen incierto y la única lengua prerromana que sobrevivió al proceso de romanización de la Península. Las demás, junto con el castellano, son **lenguas románicas**.*
>
> *Junto a ellas existen **dialectos históricos** sin estatus de oficialidad, como el **astur-leonés** y el **aragonés**, protegidos por sus respectivos estatutos.*

**Lo que la eleva:** citar el artículo 3, dar el territorio de cada una, mencionar el nombre estatutario del valenciano, señalar el carácter no románico del euskera y añadir los dialectos históricos.

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

**La observación final** —que los dialectalismos están solo en los diálogos— es exactamente el tipo de matiz que distingue una respuesta sobresaliente.`,
    practice_prompt: 'Enumera las lenguas cooficiales de España indicando territorio y origen (románico o no), citando el artículo 3 de la Constitución. Después explica la diferencia entre bilingüismo y diglosia con un ejemplo de cada uno, y localiza en un texto literario dos rasgos dialectales explicando qué función cumplen.',
    alert_markdown: '⚠️ **Seseo y ceceo no son lo mismo.** El **seseo** pronuncia /s/ tanto en *casa* como en *caza*; el **ceceo** pronuncia /θ/ en ambas. El seseo está plenamente aceptado en la norma culta —es el general en toda América—, mientras que el ceceo tiene una distribución más local y menor prestigio.',
  },
]

async function main() {
  console.log(`Reescribiendo ${cards.length} misiones (32-40) en profundidad…\n`)
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
    console.log(`✓ ${String(c.sort_order).padStart(2)}. ${c.title.slice(0, 48).padEnd(50)} teoría ${String(c.concept_markdown.length).padStart(4)} · caso ${String(c.worked_example_markdown.length).padStart(4)}`)
  }
  const avg = Math.round(cards.reduce((a, c) => a + c.concept_markdown.length, 0) / cards.length)
  console.log(`\n✅ ${cards.length} misiones actualizadas. Teoría media: ${avg} caracteres.`)
}

main()
