// Uso: node --env-file=.env.local docs/update_lengua_b2_ref2.mjs
//
// REESCRITURA en profundidad de las misiones 24-31 (Reflexión sobre la lengua).
// Subordinación, valores de SE, perífrasis, método completo de análisis y
// categorías gramaticales. Continúa docs/update_lengua_b2_ref1.mjs.

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY
)

const SUBJECT = 'lengua'

const cards = [
  {
    sort_order: 24,
    title: 'Subordinadas Sustantivas: Funciones',
    concept_markdown: `## Qué son

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
- Verbos de **afección**: *gustar*, *molestar*, *encantar*, *преocupar*
- Verbos como *convenir*, *importar*, *parecer*, *bastar*
- Construcciones **ser + adjetivo**: *Es evidente **que…***, *Es necesario **que…***

> *Es evidente **que ha llovido**.* → *Eso es evidente* → **Sujeto**

## Las interrogativas indirectas

Reproducen una pregunta **sin signos de interrogación** y subordinada a un verbo de lengua o entendimiento (*preguntar*, *saber*, *ignorar*, *decir*).

- **Total** (respuesta sí/no): nexo ***si***. *Preguntó **si** vendrías.*
- **Parcial**: nexo **interrogativo con tilde**. *Preguntó **quién** vendría.*

⚠️ Los interrogativos indirectos **llevan tilde** aunque no haya signos de interrogación, y **sí tienen función** dentro de su proposición (a diferencia del *que* conjunción).`,
    worked_example_markdown: `## Ejemplo guiado: seis sustantivas con su función

### 1. *Le preguntó si se llevaba la bacinilla.*
- Sustitución: *Le preguntó **eso*** ✅ → sustantiva
- Función: *Lo preguntó* ✅ → **CD**
- Nexo: *si* → **interrogativa indirecta total**

### 2. *Me molesta que no me escuches.*
- *Me molesta **eso*** ✅
- Prueba de sujeto: *Me molesta**n** esas cosas* → concuerda → **Sujeto**
- Nexo: *que* conjunción

### 3. *El problema es que nadie responde.*
- *El problema es **eso*** ✅
- Prueba: *El problema **lo** es* ✅ → **Atributo**

### 4. *No sabemos si es deseable.*
- *No sabemos **eso*** ✅ → *Lo sabemos* → **CD**
- **Interrogativa indirecta total**

### 5. *Tengo la esperanza de que venga.*
- Depende del sustantivo *esperanza* → **CN**
- Prueba: *la esperanza **de eso*** ✅

### 6. *Ignoro dónde vive.*
- *Ignoro **eso*** ✅ → *Lo ignoro* → **CD**
- Nexo: *dónde*, interrogativo **con tilde** → **interrogativa indirecta parcial**
- ⚠️ *dónde* **sí tiene función** dentro de su proposición: es **CCL** de *vive*

## Análisis completo

**Oración:** *No sabemos si una interrupción brusca es algo deseable.*

> **Suj:** omitido *(nosotros)*
> **SV/PV:** *No sabemos si una interrupción brusca es algo deseable*
> &nbsp;&nbsp;• **SAdv/CCNeg:** *No*
> &nbsp;&nbsp;• **N:** *sabemos*
> &nbsp;&nbsp;• **Prop. Sub. Sustantiva/CD:** *si una interrupción brusca es algo deseable*
> &nbsp;&nbsp;&nbsp;&nbsp;– **Nx:** *si* (conjunción, **sin función** interna)
> &nbsp;&nbsp;&nbsp;&nbsp;– **SN/Suj:** *una interrupción brusca* → Det *una* + N *interrupción* + SAdj/Ady *brusca*
> &nbsp;&nbsp;&nbsp;&nbsp;– **SV/PN:** *es algo deseable*
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;· **N:** *es* (copulativo)
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;· **SN/Atributo:** *algo deseable*

**Comprobación:** *No **lo** sabemos* ✅ → confirma que la proposición es CD.

**Clasificación:** *Oración compuesta por **subordinación sustantiva** en función de **CD** (interrogativa indirecta total). La principal es **enunciativa negativa, predicativa activa transitiva**; la subordinada, **copulativa**.*

## La distinción que decide: sustantiva o adjetiva

Ante un *que*, hazte **una sola pregunta**: **¿puedo sustituir la proposición entera por *eso*?**

> *Dijo **que vendría*** → *Dijo eso* ✅ → **sustantiva** (*que* = conjunción)
> *Perseguían un prestigio **que convertía…*** → *\\*Perseguían un prestigio eso* ❌ → **adjetiva** (*que* = relativo)

Segunda comprobación: ¿el *que* tiene **antecedente**? Si sí, es **relativo** → adjetiva.`,
    practice_prompt: 'Identifica la proposición subordinada sustantiva y su función en: (a) "Me alegra que hayas venido"; (b) "Ignoro dónde vive"; (c) "Tengo ganas de que llegue el verano"; (d) "Su intención era ayudarnos"; (e) "Estoy convencido de que aprobarás"; (f) "Conviene que descanses". Para las interrogativas indirectas, indica si son totales o parciales y qué función tiene el interrogativo dentro de su proposición.',
    alert_markdown: '⚠️ **No todo *que* introduce una sustantiva.** Si el *que* es **pronombre relativo** —tiene antecedente y se puede sustituir por *el cual*—, la proposición es **adjetiva**. La prueba infalible: sustituye la proposición entera por *eso*; si no funciona, no es sustantiva.',
  },

  {
    sort_order: 25,
    title: 'Subordinadas Adjetivas o de Relativo',
    concept_markdown: `## Qué son

Proposiciones que funcionan como un **adjetivo**: complementan a un sustantivo llamado **antecedente**. Su función es siempre **CN** (complemento del nombre) o **adyacente**.

> *Perseguían un prestigio **que convertía cada logro en un impulso**.*
> antecedente: *un prestigio*

## Los nexos: los relativos

| Relativo | Categoría | Observación |
|---|---|---|
| **que** | Pronombre | El más frecuente; **sin tilde** |
| **el cual, la cual, los cuales** | Pronombre | Más culto; útil para comprobar |
| **quien, quienes** | Pronombre | Solo para personas |
| **cuyo, cuya, cuyos, cuyas** | **Determinante** posesivo | Concuerda con lo poseído, no con el poseedor |
| **donde** | Adverbio | Lugar |
| **cuando** | Adverbio | Tiempo |
| **como** | Adverbio | Modo |
| **cuanto** | Adverbio/determinante | Cantidad |

## La clave que casi nadie hace bien

El relativo **desempeña una función sintáctica dentro de su propia proposición**, y hay que indicarla siempre.

**Método:** **sustituye el relativo por su antecedente** y analiza:

> *…**que** convertía cada logro…* → *el prestigio convertía cada logro* → *que* = **Sujeto**
> *El libro **que** leí* → *leí el libro* → *que* = **CD**
> *La casa **en la que** vivo* → *vivo en la casa* → **CCL**
> *El autor **cuyo** artículo leímos* → *leímos el artículo **del autor*** → *cuyo* = **Det** dentro del SN *cuyo artículo*, que es CD

## Especificativas y explicativas

| | **Especificativa** | **Explicativa** |
|---|---|---|
| **Comas** | **Sin** comas | **Entre** comas |
| **Función semántica** | **Restringe** el antecedente | **Añade** información no esencial |
| **Se puede suprimir** | No sin cambiar el sentido | Sí |
| **Ejemplo** | *Los alumnos **que estudian** aprueban* (solo esos) | *Los alumnos, **que estudian**, aprueban* (todos) |

**El cambio de sentido es real y comentable:** en la especificativa solo aprueban los que estudian; en la explicativa aprueban todos, y además resulta que estudian.

## Adjetivas sustantivadas

Cuando **no hay antecedente expreso**, el relativo va precedido de artículo y el conjunto funciona como un SN:

> ***El que** madruga* ayuda. → **Sujeto**
> *La ideología es **lo que no se ve**.* → **Atributo**

Se analizan como **proposición subordinada adjetiva sustantivada** y desempeñan funciones propias del SN.

## Relativas de infinitivo

> *No tengo nada **que decir**.*
El relativo va con infinitivo; se analiza igual.

## La confusión más frecuente

***Donde*** y ***cuando*** son:
- **Adjetivas** si tienen **antecedente expreso**: *la casa **donde** vivo*
- **Adverbiales** si **no** lo tienen: *Vive **donde** quiere*

Comprueba siempre si hay un sustantivo delante al que el relativo se refiera.`,
    worked_example_markdown: `## Ejemplo guiado: cinco adjetivas analizadas

### 1. *Perseguían un prestigio que convertía cada logro en un impulso.* (PAU 2026)
- **Antecedente:** *un prestigio*
- **Nexo:** *que* (pronombre relativo)
- **Función de la proposición:** **CN** de *prestigio*
- **Función del relativo:** *el prestigio convertía…* → **Sujeto**
- **Tipo:** **especificativa** (sin comas)

### 2. *Su compañía Meta, que lleva veinte años en el mercado, es un ejemplo.*
- **Antecedente:** *Meta*; entre comas → **explicativa**
- **Función del relativo:** *Meta lleva veinte años* → **Sujeto**

### 3. *La ideología es lo que no se ve.*
- **Sin antecedente expreso** → **adjetiva sustantivada**
- **Función de la proposición:** **Atributo** de *es*
- **Función del relativo:** *no se ve* → *que* = **Sujeto**

### 4. *La cueva donde se refugiaban estaba cerca.*
- **Antecedente:** *la cueva* → es **adjetiva**, no adverbial
- **Nexo:** *donde* (adverbio relativo)
- **Función del relativo:** *se refugiaban **en la cueva*** → **CCL**

### 5. *El autor cuyo artículo leímos es periodista.*
- **Antecedente:** *el autor*
- ***Cuyo*** = determinante relativo posesivo; concuerda con *artículo* (lo poseído), no con *autor*
- **Función:** *cuyo* es **Det** dentro del SN *cuyo artículo*, que funciona como **CD** de *leímos*

## Análisis completo

**Oración:** *Perseguían un prestigio que convertía cada logro en un impulso.*

**Paso 1 — Verbos:** *Perseguían*, *convertía* → **dos proposiciones**.
**Paso 2 — Nexo:** *que*, con antecedente *un prestigio* → **subordinada adjetiva**.

> **Proposición principal:**
> &nbsp;&nbsp;• **Suj:** omitido *(ellos)*
> &nbsp;&nbsp;• **SV/PV:** *Perseguían un prestigio que convertía cada logro en un impulso*
> &nbsp;&nbsp;&nbsp;&nbsp;– **N:** *Perseguían*
> &nbsp;&nbsp;&nbsp;&nbsp;– **SN/CD:** *un prestigio que convertía cada logro en un impulso*
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;· **Det:** *un*
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;· **N:** *prestigio*
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;· **Prop. Sub. Adjetiva/CN:** *que convertía cada logro en un impulso*
>
> **Dentro de la subordinada:**
> &nbsp;&nbsp;• **Nx/Suj:** *que* (= *el prestigio*)
> &nbsp;&nbsp;• **N:** *convertía*
> &nbsp;&nbsp;• **SN/CD:** *cada logro*
> &nbsp;&nbsp;• **SPrep/CRég:** *en un impulso* ← *convertir **en*** exige la preposición

**Clasificación:**
> *Oración compuesta por **subordinación adjetiva especificativa**. La principal es **enunciativa afirmativa, predicativa activa transitiva**, con sujeto omitido; la subordinada, **transitiva**, con complemento de régimen.*

## El error que más puntos cuesta

Escribir solo *"subordinada adjetiva, CN de prestigio"* deja **media pregunta sin responder**. Hay que añadir siempre **la función del relativo dentro de su proposición**, que aquí es **sujeto**.`,
    practice_prompt: 'Analiza estas subordinadas adjetivas indicando antecedente, tipo (especificativa o explicativa) y función sintáctica del relativo dentro de su proposición: (a) "El coche que compré es rojo"; (b) "Mi hermano, que vive en Roma, vendrá"; (c) "La ciudad donde nací es pequeña"; (d) "El chico con quien hablabas es mi primo"; (e) "Los libros cuyas tapas son rojas están agotados".',
    alert_markdown: '⚠️ **Siempre hay que decir la función del relativo.** *Que* puede ser Sujeto, CD, CI o parte de un CC dentro de su proposición, y averiguarlo exige sustituirlo por su antecedente. Omitirlo es dejar la respuesta a medias.',
  },

  {
    sort_order: 26,
    title: 'Subordinadas Adverbiales Propias: Tiempo, Lugar y Modo',
    concept_markdown: `## Qué son

Las que **equivalen a un adverbio** y funcionan como **complemento circunstancial** del verbo principal. Se llaman "propias" precisamente porque **sí** admiten esa sustitución.

## Las tres

### 1. Temporales → CCT
Indican **cuándo**. Se sustituyen por ***entonces***.

**Nexos:** *cuando, mientras, apenas, en cuanto, tan pronto como, antes de que, después de que, desde que, hasta que, siempre que, cada vez que*

> *Se levantó **cuando notó el frío**.* → *Se levantó **entonces*** ✅

**Valores:**
- **Anterioridad:** *antes de que*
- **Simultaneidad:** *mientras*, *cuando*
- **Posterioridad:** *después de que*, *en cuanto*

También con **formas no personales**: *al* + infinitivo (*al notar*), gerundio (*llegando él*), participio (*terminada la clase*).

### 2. Locativas → CCL
Indican **dónde**. Se sustituyen por ***allí***.

**Nexo:** *donde*, con o sin preposición (*adonde*, *por donde*, *hasta donde*)

> *Fue **donde estaban las cabras**.* → *Fue **allí*** ✅

### 3. Modales → CCM
Indican **cómo**. Se sustituyen por ***así***.

**Nexos:** *como, según, conforme, como si, sin que*

> *Lo hizo **como le habían enseñado**.* → *Lo hizo **así*** ✅

⚠️ ***Como si*** exige **subjuntivo** y añade valor **irreal o hipotético**: *Gruñía **como si quisiera entrar***.

## El truco definitivo

**Sustituye por el adverbio correspondiente:**

| Sustituye por… | Es… | Función |
|---|---|---|
| *entonces* | Temporal | **CCT** |
| *allí* | Locativa | **CCL** |
| *así* | Modal | **CCM** |

Si ninguna sustitución funciona, no es adverbial propia: será impropia o de otro tipo.

## La distinción crítica: adjetiva o adverbial

***Donde***, ***cuando*** y ***como*** pueden encabezar los dos tipos:

| | **Adjetiva** | **Adverbial** |
|---|---|---|
| **Antecedente** | **Sí**, expreso | **No** |
| **Función** | CN del antecedente | CC del verbo |
| **Ejemplo** | *Iré al pueblo **donde** naciste* | *Iré **donde** quieras* |
| **Sustitución** | por *en el cual* | por *allí* |

**Es la distinción que más se falla del bloque.** Busca siempre si hay un sustantivo delante al que el nexo se refiera.

## Las temporales con formas no personales

Muy frecuentes en los textos de examen:
- ***Al*** **+ infinitivo**: *Al acercarse, vio a la Rubia.* → *Entonces vio…* → **CCT**
- **Gerundio**: *Llegando a casa, llamó.* → **CCT**
- **Participio absoluto**: *Terminada la clase, salieron.* → **CCT**

Estas construcciones **no tienen verbo en forma personal**, así que técnicamente no son proposiciones plenas, pero se analizan como tales por su valor.`,
    worked_example_markdown: `## Ejemplo guiado: seis adverbiales propias

### 1. *Cuando notó que el viejo salía, le preguntó por la bacinilla.*
- Sustitución: ***Entonces**, le preguntó…* ✅
- **Adverbial temporal**, función **CCT**. Nexo: *cuando*
- ⚠️ Dentro hay otra subordinada: *que el viejo salía* = **sustantiva CD** de *notó*

### 2. *Al acercarse, vio a la Rubia.*
- *Al* + infinitivo con valor temporal → *Entonces vio…* ✅
- **Adverbial temporal**, **CCT**

### 3. *Volvió atrás en la oscuridad donde había dejado el recipiente.*
- ¿Hay antecedente? Sí: *la oscuridad*
- → **NO es adverbial**: es **adjetiva**, CN de *oscuridad*
- Función del relativo: *había dejado el recipiente **en la oscuridad*** → **CCL**

### 4. *La perra gruñía como si quisiera entrar.*
- *Gruñía **así*** ✅ → **adverbial modal**, **CCM**
- Nexo *como si*, con **subjuntivo** → matiz **irreal**

### 5. *Mientras el viejo cruzaba el patio, la perra raspaba la puerta.*
- **Adverbial temporal de simultaneidad**, **CCT**

### 6. *Aparcó donde pudo.*
- ¿Antecedente? **No**
- *Aparcó **allí*** ✅ → **adverbial locativa**, **CCL**

## Análisis completo

**Oración:** *El viejo soltó una maldición al notar en los pies el frío suelo de cemento.*

**Paso 1 — Verbo personal:** solo *soltó*. *Notar* es infinitivo → construcción, no proposición plena.
**Paso 2 — Valor de *al notar*:** temporal-causal (*cuando notó* / *porque notó*).

> **SN/Suj:** *El viejo* → Det *El* + N *viejo*
> **SV/PV:** *soltó una maldición al notar en los pies el frío suelo de cemento*
> &nbsp;&nbsp;• **N:** *soltó*
> &nbsp;&nbsp;• **SN/CD:** *una maldición* → Det *una* + N *maldición*
> &nbsp;&nbsp;• **SPrep/CCT (o CCCausa):** *al notar en los pies el frío suelo de cemento*
> &nbsp;&nbsp;&nbsp;&nbsp;– **Enl:** *al*
> &nbsp;&nbsp;&nbsp;&nbsp;– **T:** construcción de infinitivo *notar en los pies el frío suelo de cemento*
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;· **N:** *notar*
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;· **SPrep/CCL:** *en los pies*
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;· **SN/CD:** *el frío suelo de cemento* → Det *el* + SAdj/Ady *frío* + N *suelo* + SPrep/CN *de cemento*

**Nota:** *al* + infinitivo admite lectura **temporal** ("cuando notó") y **causal** ("porque notó"). Indicar ambas posibilidades y justificar cuál predomina en el contexto demuestra criterio y no se penaliza.

## La comprobación que evita el error más común

Antes de decir "adverbial", **busca el antecedente**:

> *la casa **donde** vivo* → hay antecedente (*casa*) → **ADJETIVA**
> *Vivo **donde** quiero* → no hay → **ADVERBIAL**`,
    practice_prompt: 'Clasifica estas adverbiales propias sustituyéndolas por su adverbio equivalente, y distingue las que en realidad son adjetivas buscando el antecedente: (a) "Llegó cuando ya habíamos cenado"; (b) "Aparcó donde pudo"; (c) "Visitamos el pueblo donde nació"; (d) "Actúa según le conviene"; (e) "En cuanto lo supo, llamó"; (f) "Recuerdo el día cuando nos conocimos".',
    alert_markdown: '⚠️ **Antecedente = adjetiva; sin antecedente = adverbial.** *Iré al pueblo **donde** naciste* es adjetiva (CN de *pueblo*); *Iré **donde** quieras* es adverbial locativa (CCL). Es la distinción que más se falla en todo el bloque de sintaxis.',
  },

  {
    sort_order: 27,
    title: 'Subordinadas Adverbiales Impropias',
    concept_markdown: `## Qué son

**No equivalen a un adverbio**: expresan **relaciones lógicas** entre proposiciones. Por eso muchas gramáticas actuales prefieren no llamarlas adverbiales, pero en la PAU se piden por su nombre tradicional.

## Las seis

| Tipo | Nexos | Ejemplo |
|---|---|---|
| **Causal** | *porque, ya que, puesto que, como, dado que, pues, a causa de que* | *No salió **porque llovía*** |
| **Final** | *para que, a fin de que, con el fin de que, a que* + **subjuntivo** | *Vino **para que lo ayudaras*** |
| **Consecutiva** | *tan/tanto/tal… que, así que, luego, por tanto, de modo que* | *Gritó **tanto que se quedó ronco*** |
| **Condicional** | *si, siempre que, con tal de que, a menos que, salvo que, como* | ***Si estudias**, aprobarás* |
| **Concesiva** | *aunque, a pesar de que, por más que, si bien, aun cuando* | ***Aunque llovía**, salió* |
| **Comparativa** | *más… que, menos… que, tan… como, igual que* | *Es **más alto que su hermano*** |

## Las distinciones que se preguntan

### Causal frente a final
- La **causa** es **anterior** al hecho y va en **indicativo**.
- La **finalidad** es **posterior** (es un propósito) y va en **subjuntivo**.

> *Vino **porque lo llamaste***. → causa, indicativo
> *Vino **para que lo llamaras***. → fin, subjuntivo

### Condicional frente a concesiva
- La **condicional** pone un **requisito** para que se cumpla lo demás.
- La **concesiva** expresa un **obstáculo que no impide** el cumplimiento.

> ***Si** llueve, no salgo.* → requisito
> ***Aunque** llueva, salgo.* → obstáculo superado

### Consecutiva frente a coordinada
- La **consecutiva intensiva** lleva un **intensificador** (*tan*, *tanto*, *tal*) en la principal: *Gritó **tanto** que…*
- Sin intensificador (*así que*, *por tanto*), muchas gramáticas la consideran **coordinada consecutiva**. Si dudas, indica ambas opciones.

## Los períodos condicionales

Terminología que suma si la usas:
- **Prótasis**: la proposición condicional (la del *si*)
- **Apódosis**: la principal

**Tipos:**
| Tipo | Estructura | Ejemplo |
|---|---|---|
| **Real** | *si* + indicativo → indicativo | *Si estudias, apruebas* |
| **Potencial / irreal de presente** | *si* + imperf. subj. → condicional | *Si estudiaras, aprobarías* |
| **Irreal de pasado** | *si* + pluscuamperf. subj. → condicional compuesto | *Si hubieras estudiado, habrías aprobado* |

## El caso de *como*: tres valores

Es la trampa clásica del examen:

| Valor | Cómo se reconoce | Ejemplo |
|---|---|---|
| **Modal** | Sustituible por *así* | *Hazlo **como** te dije* |
| **Causal** | Al principio de la oración, con coma | ***Como** llovía, no salí* |
| **Condicional** | Con **subjuntivo** | ***Como** no vengas, me enfado* |

## Comparativas

Se analizan como estructuras **discontinuas**: el primer término va en la principal (*más*, *tan*) y el segundo introduce la subordinada (*que*, *como*). Suelen presentar **elipsis** del verbo:
> *Es más alto que su hermano **∅ (es alto)**.*`,
    worked_example_markdown: `## Ejemplo guiado: seis impropias analizadas

### 1. *Soltó una maldición al notar el frío suelo.*
*al notar* = *porque notó* → **adverbial causal** (también admite lectura temporal).

### 2. *Volvió atrás para coger el recipiente de loza.*
*para* + infinitivo → **adverbial final**, **CCF**.
⚠️ El infinitivo comparte sujeto con la principal; si fueran distintos, exigiría *para que* + subjuntivo.

### 3. *La perra rabió tanto que despertó a todos.*
*tanto… que* → **adverbial consecutiva intensiva**.
La consecuencia se deriva de la **intensidad** marcada por *tanto*.

### 4. *Si partimos de la base de que a todos nos han construido otros, el todo es relativo.* (PAU 2026)
*Si* → **adverbial condicional**.
- **Prótasis:** *Si partimos de la base de que…*
- **Apódosis:** *el todo es relativo*
- **Tipo:** condicional **real** (presente indicativo → presente indicativo)
- ⚠️ Dentro de la prótasis hay una **sustantiva** (*que a todos nos han construido otros*) que funciona como **CN** de *base*.

### 5. *Aunque tenía muchas ganas de verlos, renunció a la comida.*
*Aunque* → **adverbial concesiva**.
Expresa un obstáculo (las ganas) que **no impide** el cumplimiento (la renuncia).

### 6. *No renunciaron a nada: renunciaron a mucho.*
⚠️ **No hay subordinación.** Dos puntos, sin nexo → **yuxtapuestas** con valor adversativo implícito.
No leas relaciones lógicas donde no hay nexo subordinante.

## Análisis completo de una condicional

**Oración:** *Mi madre se escandalizaría si viera estos garbanzos de bote.* (examen oficial, 2022-23)

**Paso 1 — Verbos:** *escandalizaría*, *viera* → dos proposiciones.
**Paso 2 — Nexo:** *si* → **subordinada adverbial condicional**.

> **Apódosis (principal):** *Mi madre se escandalizaría*
> &nbsp;&nbsp;• **SN/Suj:** *Mi madre* → Det *Mi* + N *madre*
> &nbsp;&nbsp;• **SV/PV:** *se escandalizaría*
> &nbsp;&nbsp;&nbsp;&nbsp;– ***se***: morfema de verbo pronominal, **sin función**
> &nbsp;&nbsp;&nbsp;&nbsp;– **N:** *escandalizaría*
>
> **Prótasis (subordinada):** *si viera estos garbanzos de bote*
> &nbsp;&nbsp;• **Nx:** *si*
> &nbsp;&nbsp;• **Suj:** omitido *(ella)*
> &nbsp;&nbsp;• **SV/PV:** *viera estos garbanzos de bote*
> &nbsp;&nbsp;&nbsp;&nbsp;– **N:** *viera*
> &nbsp;&nbsp;&nbsp;&nbsp;– **SN/CD:** *estos garbanzos de bote* → Det *estos* + N *garbanzos* + SPrep/CN *de bote*

**Clasificación:**
> *Oración compuesta por **subordinación adverbial condicional**, de tipo **potencial o irreal de presente** (imperfecto de subjuntivo en la prótasis, condicional simple en la apódosis). La principal es **enunciativa afirmativa, predicativa activa intransitiva pronominal**; la subordinada, **transitiva**.*

Señalar el **tipo de período condicional** es el detalle que distingue una respuesta completa.`,
    practice_prompt: 'Clasifica estas adverbiales impropias e indica en las condicionales el tipo de período: (a) "Como no vino, empezamos sin él"; (b) "Trabaja para que sus hijos estudien"; (c) "Estaba tan cansado que se durmió"; (d) "Por más que insistas, no iré"; (e) "Si hubieras avisado, te habríamos esperado"; (f) "Hazlo como te enseñaron". Presta atención a los tres valores posibles de "como".',
    alert_markdown: '⚠️ ***Como* tiene tres valores y hay que justificar cuál es.** **Modal** si se sustituye por *así* (*Hazlo **como** te dije*); **causal** si va al principio con coma (***Como** llovía, no salí*); **condicional** si lleva subjuntivo (***Como** no vengas, me enfado*). Solo el contexto lo decide.',
  },

  {
    sort_order: 28,
    title: 'Los Valores de SE',
    concept_markdown: `## La pregunta clave

Ante cualquier *se*, pregúntate primero: **¿tiene función sintáctica o no?**

- **Si es pronombre** → tiene función (CD, CI)
- **Si es morfema** → no tiene función; forma parte del verbo o de la construcción

## A. SE con función sintáctica

### 1. CI (variante de *le/les*)
Cuando *le/les* va seguido de otro pronombre de 3ª persona (*lo, la, los, las*), se transforma en *se* por razones fonéticas.

> *Le di el libro* → ***Se** lo di.* → **CI**

**Reconocimiento:** siempre hay **otro pronombre** justo detrás.

### 2. Reflexivo
El sujeto **realiza y recibe** la acción. Admite la paráfrasis ***a sí mismo***.

> *El viejo **se** lavó (a sí mismo).* → **CD**
> *El viejo **se** lavó las manos.* → **CI** (porque *las manos* ya es el CD)

### 3. Recíproco
Dos o más sujetos **intercambian** la acción. Admite ***el uno al otro*** o *mutuamente*.

> *Los hermanos **se** pegaban (el uno al otro).* → **CD**
> *Se escribían cartas.* → **CI**

## B. SE sin función sintáctica

### 4. Morfema de verbo pronominal
El verbo **lo exige siempre**: no existe sin él o cambia de significado.
*arrepentirse, atreverse, quejarse, jactarse, suicidarse, escandalizarse, incorporarse*

> *Quiterita **se** quejó.* → **morfema**, sin función

### 5. Dativo ético o de interés
Aporta **énfasis o participación afectiva** y **se puede suprimir** sin que la oración se resienta.

> ***Se** comió toda la tarta* → *Comió toda la tarta* ✅ → **dativo ético**

### 6. Morfema de pasiva refleja
*se* + verbo en **3ª persona que concuerda** con un **sujeto paciente**, normalmente inanimado.

> ***Se penalizarán** los errores.* (= los errores serán penalizados)
> **Sujeto paciente:** *los errores*

### 7. Morfema de impersonalidad refleja
*se* + verbo en **3ª persona del singular**, **sin sujeto posible**.

> ***Se vive** bien aquí.*
> ***Se busca** a los culpables.* (*a los culpables* = CD)

### 8. Marca de intransitividad o cambio de significado
Algunos verbos cambian de sentido o de régimen: *ir / irse*, *dormir / dormirse*, *quedar / quedarse*.

## La prueba decisiva: pasiva refleja o impersonal

**Ponlo en plural.** Si el verbo **concuerda**, es pasiva refleja; si **no puede**, es impersonal.

> *Se vende **piso*** → *Se vend**en** pisos* ✅ → **pasiva refleja** (*pisos* = sujeto)
> *Se habla de política* → *\\*Se hablan de políticas* ❌ → **impersonal**
> *Se busca **a** los culpables* → lleva *a* de CD y no concuerda → **impersonal**

## El orden de preguntas

1. ¿Va seguido de **otro pronombre**? → **CI**
2. ¿Admite ***a sí mismo***? → **reflexivo** (CD o CI)
3. ¿Admite ***el uno al otro***? → **recíproco** (CD o CI)
4. ¿El verbo **lo exige siempre**? → **morfema de verbo pronominal**
5. ¿Se puede **suprimir** sin más? → **dativo ético**
6. ¿**Concuerda** en plural? → **pasiva refleja**
7. Si no → **impersonal refleja**`,
    worked_example_markdown: `## Ejemplo guiado: ocho casos resueltos

### 1. *El viejo se incorporó hasta sentarse.*
*incorporarse* funciona como pronominal → **morfema de verbo pronominal**, **sin función**.

### 2. *Se lo dijo a su mujer.*
Va seguido de *lo* (CD) → *se* = *le* transformado → **CI**.

### 3. *Se penalizarán los errores repetidos.*
Plural: el verbo concuerda con *los errores* → **pasiva refleja**.
*Los errores repetidos* = **sujeto paciente**.

### 4. *Se contabilizará desde la primera falta.*
No admite plural con sentido → **impersonal refleja**. Sin sujeto.

### 5. *Los dos hermanos se pegaban continuamente.*
Admite *el uno al otro* → **recíproco**, función **CD**.

### 6. *Quiterita se quejó del ruido.*
*quejarse* es siempre pronominal → **morfema**, sin función.
*del ruido* = **CRég**.

### 7. *Se puso las botas.*
Reflexivo con otro CD (*las botas*) → *se* = **CI** (se las puso a sí mismo).

### 8. *Se bebió tres cafés.*
Suprimible: *Bebió tres cafés* ✅ → **dativo ético**, sin función.

## El par que más se falla

> *Se buscan camareros.* → plural, concuerda, sin *a* → **pasiva refleja**
> &nbsp;&nbsp;*camareros* = **sujeto paciente**
>
> *Se busca a los culpables.* → no concuerda, lleva *a* → **impersonal refleja**
> &nbsp;&nbsp;*a los culpables* = **CD**

**La diferencia no es el significado, es la concordancia.** Ambas frases significan casi lo mismo, pero el análisis es distinto.

## Análisis completo

**Oración:** *Mi madre se escandalizaría si viera estos garbanzos.*

Aplicando el orden de preguntas al *se*:
1. ¿Otro pronombre detrás? No.
2. ¿*A sí misma*? *\\*Se escandalizaría a sí misma* ❌ forzado.
3. ¿*La una a la otra*? No, hay un solo sujeto.
4. ¿El verbo lo exige? ***Escandalizarse*** sí es pronominal en este uso.
→ **Morfema de verbo pronominal, sin función sintáctica.**

**Cómo se escribe en el examen:**
> *El pronombre **se** funciona aquí como **morfema de verbo pronominal**, pues *escandalizarse* exige su presencia y no admite paráfrasis reflexiva ni recíproca. Carece, por tanto, de función sintáctica: forma parte del núcleo del predicado.*

Esa última frase —"carece de función sintáctica"— es lo que el corrector busca.`,
    practice_prompt: 'Indica el valor de SE y su función sintáctica si la tiene: (a) "Se arrepintió de todo"; (b) "Se venden coches usados"; (c) "María se peina"; (d) "Se lo entregué ayer"; (e) "Se come muy bien en este bar"; (f) "Se bebió tres cafés"; (g) "Se saludaron efusivamente"; (h) "Se busca a los responsables". Aplica el orden de siete preguntas y justifica cada decisión.',
    alert_markdown: '⚠️ **Pasiva refleja e impersonal se distinguen por la CONCORDANCIA, no por el significado.** *Se buscan camareros* concuerda → pasiva refleja, *camareros* es sujeto. *Se busca a los culpables* no concuerda y lleva *a* → impersonal, *a los culpables* es CD. Haz siempre la prueba del plural.',
  },

  {
    sort_order: 29,
    title: 'Las Perífrasis Verbales',
    concept_markdown: `## Qué es una perífrasis

Unión de un **verbo auxiliar** (que pierde su significado propio) + un **nexo opcional** + un **verbo en forma no personal** (infinitivo, gerundio o participio). Entre los dos forman **un solo núcleo del predicado**.

> ***Tendemos a adoptar** las innovaciones.* → núcleo: *tendemos a adoptar*

## Cómo se reconoce

**1. El auxiliar pierde su significado literal.**
> *Voy a estudiar* → no hay movimiento → **perífrasis**
> *Voy a Madrid* → sí hay movimiento → verbo pleno + CCL

**2. La prueba del pronombre.** Si la forma no personal se puede sustituir por *lo*, **no** es perífrasis:
> *Quiero **estudiar*** → *Lo quiero* ✅ → **no es perífrasis**: *estudiar* es CD
> *Tengo que **estudiar*** → *\\*Lo tengo que* ❌ → **sí es perífrasis**

**3. No admite transformación** en subordinada sustantiva.

## Clasificación

### A. Modales — expresan la actitud del hablante

| Valor | Perífrasis |
|---|---|
| **Obligación** | *tener que + inf.*, *deber + inf.*, *haber de + inf.*, *hay que + inf.* |
| **Probabilidad** | ***deber de** + inf.*, *poder + inf.* |
| **Posibilidad / capacidad** | *poder + inf.* |
| **Voluntad** | *querer + inf.* (discutida) |

### B. Aspectuales — expresan el desarrollo de la acción

| Valor | Perífrasis | Ejemplo |
|---|---|---|
| **Ingresiva** (inminencia) | *ir a + inf.*, *estar a punto de + inf.* | *Va a llover* |
| **Incoativa** (inicio) | *empezar a*, *ponerse a*, *comenzar a*, *echarse a* | *Se puso a llover* |
| **Durativa** (en curso) | *estar + ger.*, *seguir + ger.*, *andar + ger.*, *continuar + ger.* | *Está lloviendo* |
| **Terminativa** (fin) | *acabar de + inf.*, *dejar de + inf.*, *terminar de + inf.* | *Acabo de llegar* |
| **Reiterativa** | *volver a + inf.* | *Volvió a llamar* |
| **Resultativa / perfectiva** | *tener + part.*, *llevar + part.*, *dejar + part.* | *Tengo escritos tres capítulos* |
| **Habitual** | *soler + inf.* | *Suele venir* |

### C. Pasiva
*ser + participio*: *fue penalizado*. Forma un solo núcleo.

## La distinción que siempre cae

> ***Deber** + infinitivo* = **obligación**. *Debes estudiar.*
> ***Deber de** + infinitivo* = **probabilidad**. *Debe de tener veinte años.*

En la lengua coloquial se confunden, pero en el examen se distinguen.

## Lo que NO son perífrasis

- ***Estar* + adjetivo**: *Está cansado* → predicado **nominal** con atributo.
- ***Ser* + adjetivo**: igual.
- **Verbo pleno + CD de infinitivo**: *Quiero estudiar* → *Lo quiero*.
- **Verbo de movimiento + CCF**: *Vengo a verte* → *Vengo* ✅ suprimible.

## La regla que más se incumple

**La perífrasis es UN SOLO núcleo del predicado.** En el análisis sintáctico **no se separan** sus elementos: se subraya entera como núcleo.

Partir *tenía que estudiar* en dos verbos —o analizar *que* como nexo subordinante— es uno de los errores que más penalizan.`,
    worked_example_markdown: `## Ejemplo guiado: perífrasis o no

### 1. *Tendemos a adoptarlas a toda prisa.* (PAU 2026)
*tender a* no significa "extender" → **perífrasis modal**.
**Núcleo:** *tendemos a adoptar*. *las* = CD enclítico.

### 2. *Volvió atrás para coger el recipiente.*
*volver* mantiene su significado de movimiento → **NO es perífrasis**.
*atrás* = CCL.

### 3. *Volvió a llamar por teléfono.*
*volver a* = repetición, sin movimiento → **perífrasis reiterativa**.

### 4. *La perra continuó ladrando.*
**Perífrasis aspectual durativa.** Núcleo: *continuó ladrando*.

### 5. *Se puso a dar saltos.*
**Perífrasis incoativa**: *se puso a dar*.
⚠️ *dar saltos* es además una **locución verbal**.

### 6. *Hay que entender sus efectos secundarios.*
**Perífrasis modal de obligación impersonal.** Núcleo: *hay que entender*.
*sus efectos secundarios* = CD.

### 7. *Está cansado.*
*estar* + **adjetivo**, no participio verbal → **NO es perífrasis**.
Es **predicado nominal**: *cansado* = Atributo. Prueba: *Lo está* ✅

### 8. *Debe de estar cansado.*
**Perífrasis modal de probabilidad** (*deber de*). Núcleo: *debe de estar*.
*cansado* = Atributo.

## Análisis completo

**Oración:** *Tendemos a adoptarlas antes de entender sus efectos.*

> **Suj:** omitido *(nosotros)*
> **SV/PV:** *Tendemos a adoptarlas antes de entender sus efectos*
> &nbsp;&nbsp;• **N (perífrasis modal):** *Tendemos a adoptar* ← **un solo núcleo**
> &nbsp;&nbsp;• ***las*** **/CD:** enclítico, remite a *las innovaciones*
> &nbsp;&nbsp;• **SPrep/CCT:** *antes de entender sus efectos*
> &nbsp;&nbsp;&nbsp;&nbsp;– **Enl:** *antes de*
> &nbsp;&nbsp;&nbsp;&nbsp;– **T:** construcción de infinitivo
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;· **N:** *entender* · **SN/CD:** *sus efectos*

**Lo que NO hay que hacer:**
❌ Analizar *a adoptarlas* como CRég de *tendemos*.
❌ Separar *tendemos* (núcleo) y *adoptar* (otra proposición).

**Justificación para el examen:**
> *"**Tendemos a adoptar** constituye una **perífrasis verbal modal**, pues el auxiliar *tender* ha perdido su significado pleno y el conjunto funciona como un único núcleo del predicado. Lo confirma la imposibilidad de sustituir el infinitivo por un pronombre: *\\*lo tendemos a*."*

## Tabla de comprobación rápida

| Prueba | Si… | Entonces |
|---|---|---|
| Sustituir inf. por *lo* | Funciona | **NO** es perífrasis (es CD) |
| Significado del auxiliar | Es literal | **NO** es perífrasis |
| Suprimir la forma no personal | La oración sigue bien | **NO** es perífrasis |`,
    practice_prompt: 'Localiza las perífrasis verbales, clasifícalas y justifica con la prueba del pronombre: (a) "Debes de estar cansado"; (b) "Acabo de llegar"; (c) "Voy a la biblioteca"; (d) "Voy a estudiar"; (e) "Sigue lloviendo"; (f) "Tengo escritos tres capítulos"; (g) "Quiero aprobar"; (h) "Empezó a llover". Distingue especialmente los pares (c)/(d) y "deber" / "deber de".',
    alert_markdown: '⚠️ **La perífrasis es UN SOLO núcleo y no se separa en el análisis.** Escribir *tenía* como núcleo y *que estudiar* como subordinada es uno de los errores más penalizados. Se subraya entera: *tenía que estudiar*.',
  },

  {
    sort_order: 30,
    title: 'Método Completo de Análisis Sintáctico',
    concept_markdown: `## Por qué este método

La pregunta 2.1 vale **1,4 puntos** —la más cara del bloque 2— y el análisis sintáctico aparece en **57 ocasiones** en los 45 exámenes oficiales analizados. Es, con diferencia, el contenido más rentable de todo el temario de lengua.

Se resuelve siempre con el **mismo orden**. Nunca analices de izquierda a derecha: te perderás en cuanto la oración pase de diez palabras.

## Los siete pasos

### 1. Localiza los verbos en forma personal
**Tantos verbos, tantas proposiciones.** Marca las **perífrasis** como un solo núcleo antes de contar.

### 2. Localiza los nexos
Conjunciones, relativos, interrogativos. **Delimita con corchetes** dónde empieza y acaba cada proposición.

### 3. Decide el tipo de relación
- ¿Sin nexo, con coma o dos puntos? → **yuxtaposición**
- ¿Nexo coordinante y ambas funcionan solas? → **coordinación**
- ¿Una desempeña función dentro de la otra? → **subordinación**

Y si es subordinación, di de qué tipo: **sustantiva** (*eso*), **adjetiva** (antecedente) o **adverbial** (*entonces/allí/así* o relación lógica).

### 4. En la principal, busca el sujeto
Cambia el número del verbo. Si no hay, indica **sujeto omitido** entre paréntesis o **oración impersonal** con su tipo.

### 5. Analiza el predicado
¿**Nominal** (copulativo + atributo) o **verbal**?

### 6. Identifica los complementos EN ESTE ORDEN

> **CD** (*lo/la*) → **CI** (*le*) → **CRég** (*prep + eso*, no suprimible) → **Atributo** (*lo*) → **CPvo** (concuerda) → **CAg** (pasiva + *por*) → **CC** (suprimible)

El CC va el último porque es el cajón de sastre: lo que no encaja en ningún otro, es CC.

### 7. Clasifica la oración completa
Modalidad + naturaleza del predicado, y el tipo de oración compuesta si la hay.

## Cómo se presenta

- **Corchetes** para delimitar proposiciones y sintagmas.
- **Encima** de cada sintagma, su **tipo** (SN, SPrep, SAdj…).
- **Debajo**, su **función** (Suj, CD, CCL…).
- O bien la notación abreviada **SPrep/CN**.
- **Termina siempre con la clasificación** en una frase completa.

## Los cinco errores que más puntos cuestan

1. **Analizar linealmente** en vez de empezar por los verbos.
2. **Separar una perífrasis** en dos núcleos.
3. **Olvidar la función del relativo** dentro de su proposición.
4. **Marcar *cabras* como sujeto** en *Hay cabras*.
5. **No clasificar** la oración al final.

## Si te bloqueas

Aísla el **verbo principal** y pregúntale directamente:
- *¿Quién?* → sujeto
- *¿Qué?* → CD
- *¿A quién?* → CI
- *¿Dónde, cuándo, cómo?* → CC

Y luego **comprueba con las pruebas de sustitución**. Las preguntas orientan; las sustituciones deciden.`,
    worked_example_markdown: `## Ejemplo guiado: análisis completo paso a paso

**Oración (PAU 2026):** *Perseguían un prestigio que convertía cada logro en un impulso.*

### Paso 1 — Verbos en forma personal
*Perseguían*, *convertía* → **dos proposiciones**.

### Paso 2 — Nexos
*que*, con antecedente *un prestigio* → **pronombre relativo**.
Delimitación: [*Perseguían un prestigio* [*que convertía cada logro en un impulso*]]

### Paso 3 — Tipo de relación
El *que* tiene antecedente → **subordinación adjetiva**.

### Paso 4 — Sujeto de la principal
*Perseguían* es 3ª del plural. ¿Hay SN que concuerde? *Un prestigio* → *Perseguían unos prestigios*: el verbo no cambia, no es sujeto.
→ **Sujeto omitido (ellos)**.

### Paso 5 — Predicado
*Perseguir* tiene significado pleno → **predicado verbal**.

### Paso 6 — Complementos
*un prestigio…* → *Los perseguían* ✅ → **CD**.

### Estructura final

> **PROPOSICIÓN PRINCIPAL**
> • **Suj:** omitido *(ellos)*
> • **SV/PV:** *Perseguían un prestigio que convertía cada logro en un impulso*
> &nbsp;&nbsp;– **N:** *Perseguían*
> &nbsp;&nbsp;– **SN/CD:** *un prestigio que convertía cada logro en un impulso*
> &nbsp;&nbsp;&nbsp;&nbsp;· **Det:** *un*
> &nbsp;&nbsp;&nbsp;&nbsp;· **N:** *prestigio*
> &nbsp;&nbsp;&nbsp;&nbsp;· **Prop. Sub. Adjetiva/CN:** *que convertía cada logro en un impulso*
>
> **DENTRO DE LA SUBORDINADA**
> • **Nx/Suj:** *que* (= *el prestigio*) ← sustituyendo por el antecedente: *el prestigio convertía…*
> • **SV/PV:**
> &nbsp;&nbsp;– **N:** *convertía*
> &nbsp;&nbsp;– **SN/CD:** *cada logro* → Det *cada* + N *logro*
> &nbsp;&nbsp;– **SPrep/CRég:** *en un impulso* ← *convertir **en*** exige la preposición
> &nbsp;&nbsp;&nbsp;&nbsp;· **Enl:** *en* · **T:** SN *un impulso*

### Paso 7 — Clasificación

> *Oración compuesta por **subordinación adjetiva especificativa**. La proposición principal es **enunciativa afirmativa, predicativa activa transitiva**, con sujeto omitido; la subordinada es también **predicativa activa transitiva** y lleva **complemento de régimen**.*

## Comprobaciones finales

Antes de entregar, verifica:

| Comprobación | ✅ |
|---|---|
| ¿He contado bien los verbos personales? | 2 |
| ¿He dicho la función del relativo? | Sujeto |
| ¿He indicado el sujeto omitido? | (ellos) |
| ¿He abierto los SPrep en Enl + T? | sí |
| ¿He clasificado la oración al final? | sí |
| ¿He distinguido CRég de CC? | *en un impulso* = CRég |

Ese *en un impulso* es la trampa de la oración: parece CC, pero *convertir* exige *en*. Detectarlo es lo que separa un 1,4 de un 1.`,
    practice_prompt: 'Analiza sintácticamente siguiendo los siete pasos y presenta el resultado con tipo y función de cada sintagma: "El viejo se incorporó hasta sentarse y soltó una maldición al notar en los pies el frío suelo de cemento". Termina con la clasificación completa y repasa la tabla de comprobaciones finales.',
    alert_markdown: '⚠️ **Empieza SIEMPRE contando los verbos en forma personal, nunca por el principio de la frase.** Analizar linealmente de izquierda a derecha es la causa número uno de que la gente se pierda en oraciones largas y acabe inventando funciones.',
  },

  {
    sort_order: 31,
    title: 'Las Categorías Gramaticales (Clases de Palabras)',
    concept_markdown: `## Las nueve categorías

Pregunta habitual de **0,8 puntos**, casi siempre combinada con estructura morfológica y proceso de formación.

### Variables (admiten morfemas flexivos)

| Categoría | Qué expresa | Flexión |
|---|---|---|
| **Sustantivo** | Entidades, conceptos | Género y número |
| **Adjetivo** | Cualidades o propiedades | Género, número, grado |
| **Determinante** | Actualiza o cuantifica al sustantivo | Género y número |
| **Pronombre** | Sustituye al SN | Género, número, persona, caso |
| **Verbo** | Acciones, procesos, estados | Persona, número, tiempo, modo, aspecto |

### Invariables

| Categoría | Función |
|---|---|
| **Adverbio** | Modifica al verbo, al adjetivo o a otro adverbio |
| **Preposición** | Enlace subordinante |
| **Conjunción** | Enlace coordinante o subordinante |
| **Interjección** | Expresa emoción o apela; equivale a una oración |

## Los subtipos que conviene saber

**Sustantivos:** comunes/propios, concretos/**abstractos**, contables/incontables, individuales/colectivos.

**Adjetivos:** **especificativos** (restringen: *coche rojo*) / **explicativos o epítetos** (no restringen, suelen ir antepuestos: *blanca nieve*); relacionales (*mental*, *nuclear*).

**Determinantes:** artículos, demostrativos, posesivos, numerales, indefinidos, interrogativos, exclamativos.

**Pronombres:** personales (tónicos/átonos), demostrativos, posesivos, relativos, interrogativos, indefinidos, numerales.

**Adverbios:** de lugar, tiempo, modo, cantidad, afirmación, negación, duda; **oracionales** (*afortunadamente*).

## El método para acertar

**No te fíes del significado: fíjate en el comportamiento.**

1. ¿Admite **artículo** delante? → **sustantivo** (o está sustantivado)
2. ¿**Concuerda** en género y número con un sustantivo y lo califica? → **adjetivo**
3. ¿Concuerda y lo **actualiza** o cuantifica? → **determinante**
4. ¿**Sustituye** a un SN? → **pronombre**
5. ¿Admite ***muy*** delante o el sufijo ***-ísimo***? → adjetivo o adverbio
6. ¿Es **invariable** y modifica al verbo? → **adverbio**
7. ¿Enlaza y **subordina** un término? → **preposición**
8. ¿Enlaza elementos del mismo nivel? → **conjunción**

## La trampa: la misma palabra, distinta categoría

Depende **siempre del contexto**:

> ***Bajo*** *el puente* → **preposición**
> *Un tono **bajo*** → **adjetivo**
> *Yo **bajo** la escalera* → **verbo**
> *Habla **bajo*** → **adverbio**

Otro caso frecuente:
> ***Este*** *libro* → **determinante** demostrativo
> ***Este*** *es mío* → **pronombre** demostrativo

## Determinante o pronombre

La regla es simple: si **acompaña** a un sustantivo, es **determinante**; si lo **sustituye**, es **pronombre**.

> ***Muchos*** *alumnos vinieron* → determinante
> ***Muchos*** *vinieron* → pronombre`,
    worked_example_markdown: `## Ejemplo guiado: la pregunta completa de PAU

**Pregunta real (modelo 2026):** *Indique a qué categoría gramatical, o clase de palabras, pertenece "predominante", analice su estructura morfológica y señale a qué proceso de formación de palabras responde.*

### Respuesta modelo

> ***Categoría gramatical.*** *"Predominante" es un **adjetivo** calificativo. Lo acreditan tres pruebas de comportamiento: **concuerda en número** con el sustantivo al que acompaña (*rasgo predominante / rasgos predominantes*); **admite gradación** (*muy predominante*); y puede desempeñar las funciones propias del adjetivo, esto es, **adyacente** dentro de un SN o **atributo** con verbo copulativo.*
>
> ***Estructura morfológica.*** *Se descompone en: **pre-** (prefijo de anterioridad o superioridad) + **domin-** (lexema, presente en la familia léxica *dominar, dominio, dominante*) + **-ante** (sufijo derivativo que forma adjetivos a partir de bases verbales, con valor de agente o de acción en curso) + **-e** (que en este caso es parte del sufijo, pues el adjetivo es de una sola terminación y no distingue género).*
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

**El método:** en cada caso, aplica **una prueba de comportamiento distinta** y menciónala. No basta con nombrar la categoría.`,
    practice_prompt: 'Indica la categoría gramatical de "bajo" en los cuatro contextos del ejemplo, justificando cada uno con una prueba de comportamiento distinta. Después haz lo mismo con "que" en: "Dijo que vendría", "El libro que leí", "Es más alto que tú" y "¡Qué frío!".',
    alert_markdown: '⚠️ **La categoría depende del contexto, nunca de la palabra aislada.** No respondas de memoria: comprueba cómo se comporta *en esa frase concreta* aplicando las pruebas de concordancia, gradación y flexión.',
  },
]

async function main() {
  console.log(`Reescribiendo ${cards.length} misiones (24-31) en profundidad…\n`)
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
