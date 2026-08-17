// Uso: node --env-file=.env.local docs/update_lengua_b2_ref1.mjs
//
// REESCRITURA en profundidad de las misiones 16-23 (Reflexión sobre la lengua).
// Bloque de sintaxis: es la pregunta de 1,4 puntos (2.1) y la que más aparece
// —57 veces en los 45 exámenes oficiales de Madrid guardados en
// app/data/lengua.ts—, así que los ejemplos guiados son análisis completos
// resueltos paso a paso sobre oraciones reales de esos exámenes.

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY
)

const SUBJECT = 'lengua'

const cards = [
  {
    sort_order: 16,
    title: 'El Sintagma: Tipos y Estructura',
    concept_markdown: `## Qué es un sintagma

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
| **Preposicional (SPrep)** | *(no tiene núcleo propio)* | *de cemento*, *con sus amigos* |

## El sintagma preposicional es distinto

**No tiene núcleo propio.** Se compone de:

> **Enlace (preposición) + Término (otro sintagma, casi siempre nominal)**

> *en **los pies*** → **Enl:** *en* + **T:** SN *los pies*

Por eso, cuando analices un SPrep, siempre hay que abrir dentro de él el sintagma que funciona como término.

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

Si has identificado un SAdv, ya sabes que no puede ser CD.`,
    worked_example_markdown: `## Ejemplo guiado: análisis interno completo

**Oración** (de un examen oficial de Madrid): *El viejo se incorporó hasta sentarse.*

### Paso 1 — Delimitar los sintagmas mayores

> [**El viejo**] [**se incorporó hasta sentarse**]
> &nbsp;&nbsp;&nbsp;&nbsp;SN/Suj &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; SV/PV

### Paso 2 — Abrir el SN sujeto

**SN:** *El viejo*
- **Det:** *El* (artículo determinado)
- **N:** *viejo* (sustantivo)

### Paso 3 — Abrir el SV predicado

**SV:** *se incorporó hasta sentarse*
- **N:** *incorporó* (verbo), con *se* como **morfema de verbo pronominal**
- **SPrep/CC:** *hasta sentarse*
  - **Enl:** *hasta* (preposición)
  - **T:** *sentarse* (infinitivo con valor nominal)

## Segundo ejemplo: un SN complejo

**Sintagma:** *el frío suelo de cemento*

- **Det:** *el*
- **SAdj/Ady:** *frío*
  - **N:** *frío* (adjetivo)
- **N:** *suelo* (sustantivo) ← **el núcleo de todo el sintagma**
- **SPrep/CN:** *de cemento*
  - **Enl:** *de*
  - **T:** SN *cemento*
    - **N:** *cemento*

**Comprobación del núcleo:** si suprimes todo lo demás, ¿qué queda en pie? *"Notó el suelo"* ✅ funciona. *"Notó el frío de cemento"* ❌ cambia de sentido. Luego el núcleo es **suelo**.

## Tercer ejemplo: SAdj y SAdv con complemento

**SAdj:** *muy difícil de entender*
- **SAdv/Mod:** *muy* → **N:** *muy* (adverbio de cantidad)
- **N:** *difícil* (adjetivo)
- **SPrep/CAdj:** *de entender* → **Enl:** *de* + **T:** *entender*

**SAdv:** *bastante lejos de aquí*
- **SAdv/Mod:** *bastante*
- **N:** *lejos* (adverbio)
- **SPrep/CAdv:** *de aquí*

## La regla práctica para encontrar el núcleo

**Pregunta: ¿qué palabra no puedo quitar sin destruir el sintagma?**

En *el frío suelo de cemento* puedo quitar *el*, *frío* y *de cemento*, y sigo teniendo un sintagma (*suelo*). No puedo quitar *suelo*. Ese es el núcleo, y su categoría (sustantivo) determina el tipo (SN).

## Error típico

**❌** *"de cemento es un complemento del nombre"* — has dado la función pero no el tipo.
**❌** *"de cemento es un sintagma preposicional"* — has dado el tipo pero no la función.
**✅** *"de cemento es un **SPrep** que funciona como **CN** de suelo"* — completo.`,
    practice_prompt: 'Analiza internamente todos los sintagmas de esta oración indicando tipo, núcleo y función de cada uno: "La perra raspaba la puerta del corral con las patas". Abre los sintagmas preposicionales separando enlace y término, y justifica en cada SN cuál es el núcleo aplicando la prueba de supresión.',
    alert_markdown: '⚠️ **Tipo y función son dos respuestas distintas y las dos puntúan.** *De cemento* es un **SPrep** (tipo, según su estructura) que funciona como **CN** (función, según su relación con el núcleo del SN). Dar solo una de las dos deja media respuesta sin contestar.',
  },

  {
    sort_order: 17,
    title: 'El Sujeto: Cómo Identificarlo sin Fallar',
    concept_markdown: `## Definición operativa

El sujeto es el sintagma nominal que **concuerda en número y persona con el verbo**.

Esta es la **única** definición fiable. Olvida "quien realiza la acción": en *Juan fue detenido por la policía*, el sujeto es *Juan* y no hace absolutamente nada.

## La prueba infalible

**Cambia el número del verbo.** Lo que cambie obligatoriamente con él es el sujeto:

> *El viejo **soltó** una maldición.*
> → *Los viejo**s soltaron** una maldición.* ✅ cambió *el viejo*
> → *El viejo soltó unas maldicion**es**.* (el verbo NO cambia) ❌ *una maldición* no es sujeto

## Tipos de sujeto

**Léxico o expreso:** aparece escrito en la oración.

**Omitido, elíptico o gramatical:** no aparece, pero se deduce por la **desinencia verbal**. En el análisis **hay que indicarlo siempre**:
> *Buscó el orinal.* → **Suj. omitido: (él)**

No confundir con las impersonales: en el sujeto omitido **sí hay** un sujeto recuperable.

## Oraciones sin sujeto: las impersonales

| Tipo | Cómo se reconoce | Ejemplo |
|---|---|---|
| **Meteorológicas** | Verbos de fenómenos naturales en 3ª sing. | *Llovía sobre el patio* |
| **Gramaticalizadas** | *haber*, *hacer*, *ser* con sentido impersonal | ***Hay** cabras*, ***Hace** frío*, ***Es** tarde* |
| **Refleja (con SE)** | *se* + verbo 3ª **singular**, sin sujeto posible | *Se vive bien aquí* |
| **Eventual u ocasional** | 3ª persona del **plural** sin referente concreto | *Llaman a la puerta* |

## Los tres errores que más cuestan

### 1. *Hay cabras en el corral*
Muchos marcan *cabras* como sujeto. **No lo es.** El verbo *haber* impersonal no admite plural: *\\*Habían cabras* es incorrecto. Como no hay concordancia posible, la oración es **impersonal** y *cabras* es **CD**.

Prueba: sustituye por pronombre. *Las hay* ✅ → si admite *lo/la/los/las*, es CD.

### 2. Verbos de afección: *gustar*, *doler*, *encantar*, *interesar*
> *Me gustan las novelas.*
Prueba: *Me gusta la novela.* Cambia *las novelas* → **es el sujeto**.
*Me* es **CI**. Quien experimenta la sensación NO es el sujeto: es el complemento indirecto. Es contraintuitivo, pero es así.

### 3. Pasiva refleja
> *Se penalizarán los errores repetidos.*
Prueba: *Se penalizará el error repetido.* Concuerda → **sujeto paciente**: *los errores repetidos*.

## El orden no importa

El sujeto puede ir **detrás** del verbo, y con mucha frecuencia lo hace:
> *Arreciaron **los balidos de las cabras**.*
> *Me gustan **las novelas**.*

Buscar el sujeto solo al principio de la oración es una de las causas más habituales de error.`,
    worked_example_markdown: `## Ejemplo guiado: seis casos resueltos

### 1. *Los balidos de las cabras arreciaron.*
**Prueba:** *El balido de las cabras arreció.* → cambia todo el sintagma.
**Sujeto:** *Los balidos de las cabras* (SN completo, con su CN incluido).
⚠️ El sujeto es **todo el sintagma**, no solo *los balidos*.

### 2. *A tientas, buscó el orinal debajo del camastro.*
No hay ningún SN que concuerde. La desinencia *-ó* indica 3ª persona del singular.
**Sujeto omitido:** *(él, el viejo)*.
*El orinal* → *Lo buscó* ✅ = **CD**.

### 3. *Me gustan las novelas de Ravelo.*
**Prueba:** *Me gusta la novela de Ravelo.* → cambia *las novelas*.
**Sujeto:** *las novelas de Ravelo*.
*Me* → **CI** (quien experimenta el gusto).

### 4. *Se penalizarán los errores repetidos.*
**Prueba:** *Se penalizará el error repetido.* → concuerda.
**Pasiva refleja.** **Sujeto paciente:** *los errores repetidos*.

### 5. *Había más de un millón de cadáveres.*
*haber* impersonal. **Prueba:** *\\*Habían más de un millón* ❌ incorrecto.
**Oración impersonal, sin sujeto.** *Más de un millón de cadáveres* = **CD**.

### 6. *Se vive bien en este bar.*
**Prueba:** *\\*Se viven bien* ❌ imposible.
**Impersonal refleja.** Sin sujeto. *bien* = CCM, *en este bar* = CCL.

## El diagrama de decisión

Aplícalo en este orden y no fallarás:

**1. ¿Hay un SN que cambie al cambiar el número del verbo?**
→ Sí: **ese es el sujeto** (esté donde esté, delante o detrás).
→ No: sigue.

**2. ¿La desinencia verbal indica una persona recuperable por el contexto?**
→ Sí: **sujeto omitido**, indícalo entre paréntesis.
→ No: sigue.

**3. ¿El verbo es meteorológico, o es *haber/hacer/ser* impersonal, o lleva *se* sin sujeto posible, o va en 3ª del plural sin referente?**
→ **Oración impersonal**, sin sujeto. Di de qué tipo.

## Aplicación a una oración de examen

*Perseguían un prestigio que convertía cada logro en un impulso.* (modelo PAU 2026)

**Paso 1:** ¿hay SN que concuerde? *Un prestigio* → prueba: *Perseguían unos prestigios* — el verbo no cambia. No es sujeto.
**Paso 2:** *Perseguían* es 3ª del plural. ¿Hay referente en el contexto? Sí, se habla de "gente rica o famosa".
**Conclusión:** **Sujeto omitido (ellos)**.

⚠️ Cuidado: no es impersonal eventual, porque **sí** hay un referente identificable en el texto.`,
    practice_prompt: 'Localiza el sujeto (o indica que es impersonal, especificando el tipo) en estas oraciones, justificando con la prueba del cambio de número: (a) "Hace frío en la alcoba"; (b) "Le duelen los pies"; (c) "Se venden pisos"; (d) "Se busca a los culpables"; (e) "Han llamado por teléfono"; (f) "Arreciaron los balidos de las cabras".',
    alert_markdown: '⚠️ **En *Hay cabras*, "cabras" NO es el sujeto: es CD.** El verbo *haber* impersonal nunca concuerda (*\\*habían cabras* es incorrecto), así que la oración carece de sujeto. Es el error más repetido de toda la sintaxis de PAU.',
  },

  {
    sort_order: 18,
    title: 'Predicado Nominal y Atributo: Las Copulativas',
    concept_markdown: `## Los dos tipos de predicado

**Predicado verbal (PV):** el verbo tiene **significado pleno** y es el núcleo semántico de la oración.

**Predicado nominal (PN):** el verbo es **copulativo** —carece de significado propio— y funciona como puente entre el sujeto y el **atributo**, que es donde reside el contenido.

## Los verbos copulativos

Solo tres: ***ser***, ***estar*** y ***parecer***.

Pero **no siempre** que aparecen son copulativos: solo cuando están vacíos de significado.

## El atributo

Elemento que **atribuye una cualidad o una clasificación al sujeto**. Puede ser:

| Tipo de sintagma | Ejemplo |
|---|---|
| **SAdj** | *La perra está **furiosa*** |
| **SN** | *Ravelo es **un novelista canario*** |
| **SPrep** | *El orinal es **de loza*** |
| **SAdv** | *Así es **como** debe hacerse* |
| **Proposición** | *El problema es **que nadie responde*** |

## La prueba decisiva: sustitución por LO

El atributo **siempre** se sustituye por el pronombre ***lo***, sea cual sea su género y número:

> *La perra está furiosa* → *La perra **lo** está* ✅
> *Ravelo es un novelista canario* → *Ravelo **lo** es* ✅
> *El suelo estaba frío* → *El suelo **lo** estaba* ✅

Si la sustitución por *lo* no funciona, **no es atributo**.

## Cuando *ser*, *estar* y *parecer* NO son copulativos

Cuando recuperan significado pleno (*existir*, *ocurrir*, *hallarse*, *asemejarse*), el predicado es **verbal** y lo que sigue es un **CC** o un **CRég**:

> *La reunión **es** en el patio.* (= se celebra) → PV, *en el patio* = **CCL**
> Prueba: *\\*La reunión lo es* ❌

> *El viejo **está** en el corral.* (= se halla) → PV, *en el corral* = **CCL**
> Prueba: *\\*El viejo lo está* ❌

> *Parece **a su padre**.* (= se asemeja) → PV con CRég.

## Atributo, predicativo y CCM: la distinción crítica

| | **Atributo** | **Predicativo (CPvo)** | **CCM** |
|---|---|---|---|
| **Verbo** | Copulativo | Predicativo (pleno) | Predicativo |
| **Concuerda** | Sí, con el sujeto | Sí, con sujeto o CD | **No**, invariable |
| **Admite *lo*** | **Sí** | No | No |
| **Ejemplo** | *Está **cansado*** | *Llegó **cansado*** | *Llegó **deprisa*** |

**Prueba práctica:** cambia el género del sujeto.
- *Llegó cansad**a*** → cambió → **predicativo**
- *Llegó deprisa* → no cambió → **CCM**

## Oraciones semicopulativas

Verbos como *quedarse*, *ponerse*, *volverse*, *resultar*, *permanecer*, *seguir*, *andar* funcionan a medio camino: tienen algo de significado propio pero exigen un complemento que califica al sujeto.
> *Se puso **nervioso***, *Resultó **herido***, *Anda **preocupado***

Se suelen analizar como **predicado verbal con complemento predicativo**, aunque algunas gramáticas los llaman **atributos de verbo semicopulativo**. Si los mencionas, aclara el criterio que sigues.`,
    worked_example_markdown: `## Ejemplo guiado: seis oraciones resueltas

### 1. *El suelo de cemento estaba frío.*
**Prueba:** *El suelo **lo** estaba* ✅
→ **Predicado nominal.** *estaba* = verbo copulativo. *frío* = **Atributo** (SAdj).

### 2. *El viejo estaba en el corral.*
**Prueba:** *\\*El viejo lo estaba* ❌
→ **Predicado verbal** (*estar* = hallarse). *en el corral* = **CCL** (SPrep).

### 3. *Quiterita parece cansada.*
**Prueba:** *Quiterita **lo** parece* ✅
→ **PN.** *cansada* = **Atributo**.

### 4. *La novela fue escrita por Ravelo.*
**Prueba:** *\\*La novela lo fue* ❌
→ **PV en voz pasiva.** *fue escrita* = perífrasis pasiva (un solo núcleo). *por Ravelo* = **Complemento agente**.
⚠️ El error clásico: ver *ser* + participio y marcar atributo. En la pasiva, *ser* forma **perífrasis**, no cópula.

### 5. *Hoy es martes.*
**Prueba:** *Hoy **lo** es* ✅
→ **PN.** *martes* = **Atributo** (SN).

### 6. *Los niños llegaron cansados.*
**Prueba:** *\\*Los niños lo llegaron* ❌ → no es atributo.
**Prueba de concordancia:** *Las niñas llegaron cansad**as*** → concuerda.
→ **PV** con **Complemento predicativo del sujeto**.

## Análisis completo de una copulativa

**Oración:** *¡Qué salvajito eres, mi niño!* (examen oficial de Madrid)

> **Modalidad:** exclamativa
> **Suj:** omitido *(tú)*
> **SN/Vocativo:** *mi niño* ← ⚠️ el vocativo **no es sujeto ni complemento**: está fuera de la estructura oracional
> **SV/PN:** *Qué salvajito eres*
> &nbsp;&nbsp;• **SAdj/Atributo:** *Qué salvajito*
> &nbsp;&nbsp;&nbsp;&nbsp;– **Det/Cuantificador:** *Qué*
> &nbsp;&nbsp;&nbsp;&nbsp;– **N:** *salvajito* (adjetivo con sufijo apreciativo diminutivo)
> &nbsp;&nbsp;• **N:** *eres* (verbo copulativo)

**Prueba:** *Lo eres* ✅ → confirma que es atributo.

**Clasificación:** *Oración exclamativa, copulativa (atributiva), con sujeto omitido.*

**Comentario que suma:** el diminutivo *-ito* en *salvajito* no indica tamaño sino **afecto**: Quiterita reprocha con cariño. Relacionar la morfología con el valor expresivo siempre puntúa.`,
    practice_prompt: 'Indica si el predicado es nominal o verbal en cada oración, justificando con la prueba del "lo", y señala la función del elemento subrayado: (a) "El examen es a las nueve"; (b) "El examen es difícil"; (c) "Mi hermano está enfermo"; (d) "Mi hermano está en Madrid"; (e) "El libro fue premiado por el jurado"; (f) "Los alumnos salieron contentos".',
    alert_markdown: '⚠️ **Ser + participio en pasiva NO es predicado nominal.** En *La novela fue escrita por Ravelo*, *fue escrita* es una **perífrasis pasiva** que forma un único núcleo verbal, y el predicado es **verbal**. La prueba del *lo* lo confirma: *\\*La novela lo fue* no funciona.',
  },

  {
    sort_order: 19,
    title: 'Complemento Directo y Complemento Indirecto',
    concept_markdown: `## Complemento directo (CD)

Complemento que completa el significado de un **verbo transitivo**, designando la entidad sobre la que recae directamente la acción.

### Las dos pruebas

**1. Sustitución por *lo, la, los, las***
> *Buscó **el orinal*** → ***Lo** buscó* ✅

**2. Transformación a pasiva:** el CD pasa a **sujeto paciente**
> *El viejo encendió **una lámpara*** → ***Una lámpara** fue encendida por el viejo* ✅

Con las dos pruebas juntas no falla nunca.

### Forma
- **SN**: *Soltó **una maldición***
- **SPrep con *a*** si es **persona o animal determinado**: *Vio **a la Rubia***
- **Proposición subordinada sustantiva**: *Dijo **que vendría***

## Complemento indirecto (CI)

Designa el **destinatario, beneficiario o perjudicado** por la acción.

### Las pruebas

**1. Sustitución por *le, les*** (que se convierten en *se* ante otro pronombre de 3ª persona)
> *Dio uso **al orinal*** → ***Le** dio uso* ✅
> *Di el libro **a Ana*** → ***Se** lo di* ✅

**2. Va siempre precedido de *a*** (o de *para* en algunos casos)

## La prueba conjunta

> *El viejo **le** dio **la bacinilla** a Quiterita.*
> - *la bacinilla* → *La dio* → **CD**
> - *a Quiterita* → *Le dio* → **CI**

**Regla:** ante un SPrep con *a*, sustituye. Si sale *lo/la* → **CD**. Si sale *le* → **CI**.

## La trampa del "a"

Un SPrep encabezado por *a* **no es automáticamente CI**:

> *Vio **a la Rubia*** → ***La** vio* ✅ → **CD** (lleva *a* por ser animal determinado)
> *\\*Le vio la Rubia* ❌

La preposición *a* aparece ante CD cuando este designa **persona o animal determinado**. Es una marca de determinación, no de función.

## Leísmo, laísmo y loísmo

**Leísmo:** usar *le* por *lo/la* en función de CD.
- **Admitido** por la RAE: *le* por CD **masculino de persona singular**. *A Juan **le** vi* ✅
- **No admitido**: *les* por *los* (*\\*Les vi a los niños*), ni *le* por *la* (*\\*Le vi a María*), ni *le* referido a cosa (*\\*El libro, le compré*).

**Laísmo:** usar *la/las* por *le/les* en función de CI. **Nunca correcto**. *\\*La dije que viniera* ❌ → *Le dije*.

**Loísmo:** usar *lo/los* por *le/les* en CI. **Nunca correcto**. *\\*Lo dije la verdad* ❌

El **laísmo** es especialmente frecuente en el habla de Madrid y Castilla, y se penaliza en el examen.

## Doblado del CI

En español es normal que el CI aparezca **dos veces**: como pronombre y como SPrep.
> ***Le*** *dio la bacinilla **a Quiterita**.*

Ambos elementos son el **mismo** CI. No los analices como dos complementos distintos.`,
    worked_example_markdown: `## Ejemplo guiado: cinco oraciones resueltas

### 1. *El viejo vació sus orines en la letrina del patio.*
- *sus orines* → *Los vació* ✅ → **CD** (SN)
- *en la letrina del patio* → ni *lo* ni *le* → **CCL** (SPrep)
- **Suj:** *El viejo*

### 2. *Le preguntó si se llevaba la bacinilla.*
- *Le* → **CI** (a ella, Quiterita)
- *si se llevaba la bacinilla* → *Lo preguntó* ✅ → **CD** (proposición subordinada sustantiva)
- **Suj:** omitido *(él)*

### 3. *Se lo dijo ayer.*
- *Se* = *le* transformado ante *lo* → **CI**
- *lo* → **CD**
- *ayer* → **CCT**
⚠️ Este *se* **no** es reflexivo ni morfema: es un CI disfrazado.

### 4. *La perra intentaba meter el hocico por debajo de la puerta.*
- *meter el hocico por debajo de la puerta* → *Lo intentaba* ✅ → **CD** (proposición de infinitivo)
- Dentro de ella: *el hocico* = CD de *meter*; *por debajo de la puerta* = CCL
- **Suj:** *La perra*

### 5. *Vio a la Rubia, que raspaba la puerta.*
- *a la Rubia* → ***La** vio* ✅ → **CD** (SPrep con *a* de persona/animal determinado)
- *que raspaba la puerta* → prop. subordinada adjetiva, **CN** de *la Rubia*
⚠️ Error clásico: marcar *a la Rubia* como CI por llevar *a*.

## Análisis completo con CD y CI

**Oración:** *Pone sus beneficios por encima de la salud mental.* (modelo PAU 2026)

> **Suj:** omitido *(él, Zuckerberg / la empresa)*
> **SV/PV:** *Pone sus beneficios por encima de la salud mental*
> &nbsp;&nbsp;• **N:** *Pone*
> &nbsp;&nbsp;• **SN/CD:** *sus beneficios*
> &nbsp;&nbsp;&nbsp;&nbsp;– **Det:** *sus* · **N:** *beneficios*
> &nbsp;&nbsp;• **SPrep/CCL:** *por encima de la salud mental*
> &nbsp;&nbsp;&nbsp;&nbsp;– **Enl:** *por encima de* (locución prepositiva)
> &nbsp;&nbsp;&nbsp;&nbsp;– **T:** SN *la salud mental* → Det *la* + N *salud* + SAdj/Ady *mental*

**Comprobaciones:**
- *Los pone* ✅ → *sus beneficios* es CD
- *Sus beneficios son puestos por encima de…* ✅ → confirma con la pasiva
- *por encima de la salud mental* no admite *lo* ni *le* → CC

**Clasificación:** *Oración enunciativa afirmativa, predicativa activa transitiva, con sujeto omitido.*`,
    practice_prompt: 'Identifica CD y CI en estas oraciones justificando con la sustitución pronominal: (a) "Regaló un libro a su hermana"; (b) "Vio a los niños en el patio"; (c) "Les explicó la lección a los alumnos"; (d) "Se lo entregué ayer"; (e) "Compré el pan esta mañana". Después corrige los casos de laísmo o leísmo incorrecto que encuentres en: "La dije que viniera" y "Les vi en el parque".',
    alert_markdown: '⚠️ **El laísmo se penaliza siempre.** *\\*La dije que viniera* es incorrecto: debe ser *Le dije*. Es un rasgo muy extendido en el habla de Madrid, lo que hace que a mucha gente le suene bien — y precisamente por eso conviene revisarlo en el examen.',
  },

  {
    sort_order: 20,
    title: 'El Complemento de Régimen (Suplemento)',
    concept_markdown: `## Qué es

Complemento **exigido por el verbo** mediante una **preposición fija** que el propio verbo impone. También se llama **suplemento** (término de Alarcos).

> *La perra **carecía de** miedo.*
> *El texto **habla de** tecnología.*
> *Nos hemos metido **en** la IA.*

## Las dos características

**1. La preposición la impone el verbo, no el significado.**
No se elige: viene con el verbo, como parte de su definición. *Acordarse* siempre lleva *de*; *confiar* siempre lleva *en*. No hay alternativa.

**2. No se puede suprimir** sin que la oración quede incompleta o cambie de significado.

## La prueba

**Sustituye por *preposición + pronombre tónico* (eso, ello, él, ella):**

> *Se acordó **de su infancia*** → *Se acordó **de eso*** ✅ → **CRég**
> *Confío **en ti*** → *Confío **en ella*** ✅ → **CRég**

Y comprueba que **no** admite *lo/la* (no es CD) ni *le* (no es CI).

## Cómo se distingue del CC

**El CC es suprimible; el CRég no.**

> *Piensa **en el examen***
> → *\\*Piensa.* ❌ queda incompleta (o cambia de sentido a "razona")
> → **CRég**

> *Estudia **en la biblioteca***
> → *Estudia.* ✅ mantiene pleno sentido
> → **CCL**

**Segunda diferencia:** el CC responde a *cuándo, dónde, cómo, por qué*; el CRég no responde a ninguna de esas preguntas.

**Tercera diferencia:** el CC admite muchas preposiciones distintas (*estudia en / desde / hasta / durante*); el CRég solo admite **la suya**.

## Verbos frecuentes con CRég

*acordarse **de***, *alegrarse **de***, *arrepentirse **de***, *carecer **de***, *confiar **en***, *contar **con***, *convertir **en***, *depender **de***, *hablar **de***, *insistir **en***, *pensar **en***, *preocuparse **por***, *soñar **con***, *tratar **de***, *fijarse **en***, *renunciar **a***, *asistir **a***, *consistir **en***.

## Combinaciones que hay que saber ver

Un verbo puede llevar **CD y CRég a la vez**:
> *Convertí **el sótano** (CD) **en un taller** (CRég).*
> *Informé **a los alumnos** (CI) **del examen** (CRég).*

Y **CRég y CC** juntos:
> *Hablé **del asunto** (CRég) **con Ana** (CC de compañía).*

No des por hecho que solo hay uno.

## CRég con proposición

El término del CRég puede ser una **proposición subordinada sustantiva**:
> *Se acordó **de que era martes**.*
> *Insistió **en que viniéramos**.*

Prueba: *Se acordó **de eso*** ✅`,
    worked_example_markdown: `## Ejemplo guiado: distinguir CRég de CC en seis casos

### 1. *El artículo trata de la inteligencia artificial.*
- *Trata **de eso*** ✅
- *\\*El artículo trata.* ❌ (o cambia radicalmente de sentido)
→ **CRég**

### 2. *Nos hemos metido de cabeza en la tecnología.*
- *meterse **en*** exige la preposición: *\\*Nos hemos metido* queda incompleto
→ *en la tecnología* = **CRég**
- *de cabeza* → ¿cómo? y es suprimible → **CCM** (locución adverbial)
⚠️ Dos SPrep en la misma oración con funciones distintas.

### 3. *El viejo salió de la alcoba.*
- ¿Suprimible? *El viejo salió.* ✅ mantiene sentido
- Responde a *¿de dónde?*
→ **CCL**
⚠️ Lleva *de*, pero la preposición aporta significado locativo propio; no la exige el verbo. *Salir* admite *de, por, hacia, hasta*.

### 4. *Depende de sus padres para todo.*
- *Depende **de ellos*** ✅, e imposible suprimir
→ *de sus padres* = **CRég**
- *para todo* → suprimible → **CC**

### 5. *Se arrepintió de sus palabras.*
- *arrepentirse* es pronominal y exige *de*
→ **CRég**. El *se* es **morfema de verbo pronominal**, sin función.

### 6. *Trabaja en una fábrica.*
- *Trabaja.* ✅ suprimible; responde a *¿dónde?*
→ **CCL**

## La pregunta que lo resuelve todo

> **"¿La oración sigue teniendo sentido completo si lo quito?"**
> - **No** → CRég
> - **Sí** → CC

Y como comprobación: **¿podría cambiar la preposición?** Si sí, es CC; si la preposición es la única posible, es CRég.

## Análisis completo

**Oración:** *Tendemos a adoptarlas antes de entender sus efectos secundarios.* (modelo PAU 2026)

> **Suj:** omitido *(nosotros)*
> **SV/PV:** *Tendemos a adoptarlas antes de entender sus efectos secundarios*
> &nbsp;&nbsp;• **N (perífrasis):** *Tendemos a adoptar* ← ⚠️ perífrasis modal, **un solo núcleo**
> &nbsp;&nbsp;• ***las*** **/CD:** enclítico, remite a *las innovaciones*
> &nbsp;&nbsp;• **SPrep/CCT:** *antes de entender sus efectos secundarios*
> &nbsp;&nbsp;&nbsp;&nbsp;– **Enl:** *antes de*
> &nbsp;&nbsp;&nbsp;&nbsp;– **T:** proposición de infinitivo *entender sus efectos secundarios*
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;· **N:** *entender* · **SN/CD:** *sus efectos secundarios*

**Ojo:** aquí *a adoptar* **no** es CRég, porque *tender a* + infinitivo forma **perífrasis verbal**. La prueba: no puedes sustituir por *a eso* (*\\*Tendemos a eso* cambia el sentido) y el infinitivo no se sustituye por *lo*.`,
    practice_prompt: 'Indica si el sintagma preposicional es CRég o CC, justificándolo con la prueba de supresión y la de sustitución por "preposición + eso": (a) "Se arrepintió de sus palabras"; (b) "Trabaja en una fábrica"; (c) "Soñó con volver a casa"; (d) "Llegó por la mañana"; (e) "Convirtió el garaje en un estudio"; (f) "Habló del tema con su jefe".',
    alert_markdown: '⚠️ **Que lleve preposición no lo convierte en CRég.** *Salió **de** la alcoba* es CCL, porque el verbo no exige esa preposición concreta (admite *por*, *hacia*, *hasta*) y el complemento es suprimible. La clave siempre es: ¿lo exige el verbo? ¿puedo quitarlo?',
  },

  {
    sort_order: 21,
    title: 'Circunstancial, Predicativo y Agente',
    concept_markdown: `## Complemento circunstancial (CC)

Aporta información sobre las **circunstancias** en que se desarrolla la acción. Es **suprimible** y muy **móvil** dentro de la oración.

| Tipo | Pregunta | Ejemplo |
|---|---|---|
| **CCL** lugar | ¿dónde? | *en el corral* |
| **CCT** tiempo | ¿cuándo? | *a las nueve*, *ayer* |
| **CCM** modo | ¿cómo? | *a tientas*, *deprisa* |
| **CCC** cantidad | ¿cuánto? | *bastante*, *mucho* |
| **CCI** instrumento | ¿con qué? | *con las patas* |
| **CCCom** compañía | ¿con quién? | *con sus amigos* |
| **CCCau** causa | ¿por qué? | *por el frío* |
| **CCF** finalidad | ¿para qué? | *para dormir* |
| **CCNeg / CCAf** | — | *no*, *sí*, *tampoco* |
| **CCMat** materia | ¿de qué? | *de cemento* |

**Forma:** SAdv (*deprisa*), SPrep (*en el corral*), SN (*esta mañana*) o proposición.

## Complemento predicativo (CPvo)

Complemento que **modifica simultáneamente al verbo y a un sustantivo** —el sujeto o el CD—, con el que **concuerda** en género y número.

> *Los niños llegaron **cansados**.* → referido al **sujeto**
> *Nombraron **delegado** a Juan.* → referido al **CD**
> *Encontré a María **enfadada**.* → referido al **CD**

### Cómo se distingue

| De… | Por… |
|---|---|
| **Atributo** | El CPvo va con **verbo predicativo** (pleno) y **no** admite *lo* |
| **CCM** | El CPvo **concuerda** (cambia de género/número); el CCM es **invariable** |

**La prueba definitiva:** cambia el género del sustantivo.
> *Los niños llegaron cansad**os*** → *Las niñas llegaron cansad**as*** → **cambia** → **CPvo**
> *Los niños llegaron deprisa* → *Las niñas llegaron deprisa* → **no cambia** → **CCM**

## Complemento agente (CAg)

Aparece **exclusivamente en oraciones pasivas**. Designa quien realiza realmente la acción, y va introducido por la preposición ***por***.

> *La puerta fue raspada **por la perra**.*

**Comprobación:** al transformar a activa, el CAg se convierte en **sujeto**:
> *La perra raspó la puerta.* ✅

## La trampa del "por"

**No todo lo que lleva *por* es complemento agente.** Solo lo es en oraciones **pasivas**:

> *Lo hizo **por dinero***. → oración activa → **CC de causa/finalidad**
> *Pasea **por el parque***. → **CCL**
> *Fue detenido **por la policía***. → oración pasiva → **CAg** ✅

## Resumen de las pruebas

| Complemento | Prueba |
|---|---|
| **CD** | Sustituye por *lo/la/los/las* |
| **CI** | Sustituye por *le/les* |
| **CRég** | *Prep + eso*, no suprimible |
| **Atributo** | Sustituye por *lo* (verbo copulativo) |
| **CPvo** | **Concuerda** con sujeto o CD (verbo pleno) |
| **CAg** | Oración **pasiva**, con *por*, pasa a sujeto en activa |
| **CC** | **Suprimible**, responde a cuándo/dónde/cómo/por qué |

**Aplícalas siempre en ese orden.** El CC es el último porque es el cajón de sastre: lo que no encaja en ningún otro, es CC.`,
    worked_example_markdown: `## Ejemplo guiado: cinco oraciones resueltas

### 1. *A tientas, buscó el orinal debajo del camastro.*
- *A tientas* → ¿cómo? invariable → **CCM** (SPrep, locución adverbial)
- *el orinal* → *Lo buscó* → **CD**
- *debajo del camastro* → ¿dónde? suprimible → **CCL**
- **Suj:** omitido *(él)*

### 2. *El viejo salió del corral furioso.*
- *del corral* → ¿de dónde? suprimible → **CCL**
- *furioso* → ¿es atributo? *\\*Lo salió* ❌ no.
  ¿Concuerda? *La vieja salió furiosa* ✅ **sí** → **CPvo del sujeto**

### 3. *Los errores repetidos serán penalizados por el corrector.*
- *Los errores repetidos* → **Sujeto paciente**
- *serán penalizados* → **perífrasis pasiva**, núcleo del PV
- *por el corrector* → oración **pasiva** + *por* → **Complemento agente**
- **Comprobación:** *El corrector penalizará los errores repetidos.* ✅

### 4. *Encendió la lámpara de petróleo con mucho cuidado.*
- *la lámpara de petróleo* → *La encendió* → **CD**; dentro, *de petróleo* = **CN**
- *con mucho cuidado* → ¿cómo? invariable → **CCM**

### 5. *Eligieron presidenta a Marta.*
- *a Marta* → *La eligieron* ✅ → **CD** (persona determinada)
- *presidenta* → concuerda con *Marta* (*Eligieron president**e** a Juan*) → **CPvo del CD**

## Análisis completo de una oración con predicativo

**Oración:** *El niño la mira, mira.*

> **Suj:** *El niño* (SN → Det *El* + N *niño*)
> **SV/PV:** *la mira, mira*
> &nbsp;&nbsp;• ***la*** **/CD:** pronombre átono (remite a la luna)
> &nbsp;&nbsp;• **N:** *mira* (repetido por **geminación**, recurso estilístico)

**Clasificación:** *enunciativa afirmativa, predicativa activa transitiva.*

**Comentario:** la repetición del verbo no altera el análisis —sigue habiendo un solo predicado— pero sí tiene valor **expresivo**: produce un efecto de **tiempo suspendido** y fascinación. Señalar esto en un comentario de texto puntúa.

## El orden de aplicación de las pruebas

**Oración de prueba:** *Llegaron muy contentos a casa por la tarde.*

1. ¿CD? *\\*Los llegaron* ❌ → no hay CD (*llegar* es intransitivo)
2. ¿CI? *\\*Les llegaron* ❌
3. ¿CRég? ¿algo imprescindible? no
4. ¿Atributo? *\\*Lo llegaron* ❌
5. ¿CPvo? *muy contentos* → *Llegar**on** content**as*** ✅ **concuerda** → **CPvo del sujeto**
6. ¿CAg? no hay pasiva
7. Resto: *a casa* = **CCL**, *por la tarde* = **CCT**`,
    practice_prompt: 'Clasifica todos los complementos e identifica los predicativos aplicando la prueba de concordancia: (a) "Llegaron muy contentos a casa"; (b) "Trabaja los domingos por dinero"; (c) "Eligieron presidenta a Marta"; (d) "El acuerdo fue firmado por ambas partes"; (e) "Come la carne cruda"; (f) "Pasea por el parque cada tarde".',
    alert_markdown: '⚠️ **No todo lo que lleva *por* es complemento agente.** Solo lo es en oraciones **pasivas**. En *Lo hizo por dinero* (activa), *por dinero* es CC de causa o finalidad. Comprueba siempre que la oración es pasiva antes de marcar agente.',
  },

  {
    sort_order: 22,
    title: 'Clasificación de la Oración Simple',
    concept_markdown: `## Los dos criterios

En la PAU se pide clasificar la oración según **dos criterios simultáneos**, y hay que dar los dos.

## Criterio 1: la actitud del hablante (modalidad)

| Modalidad | Rasgo | Ejemplo |
|---|---|---|
| **Enunciativa** | Afirma o niega un hecho | *El viejo se incorporó* |
| **Interrogativa** | Pregunta | *¿Te llevas la bacinilla?* |
| **Exclamativa** | Expresa emoción | *¡Qué salvajito eres!* |
| **Exhortativa** o imperativa | Ordena, ruega, aconseja | *Ven aquí* |
| **Dubitativa** | Expresa duda | *Quizá llueva* |
| **Desiderativa** u optativa | Expresa deseo | *Ojalá apruebes* |

**Subdivisiones:**
- Enunciativa: **afirmativa** o **negativa**
- Interrogativa: **directa** (con signos) o **indirecta** (subordinada); **total** (respuesta sí/no) o **parcial** (con interrogativo)

## Criterio 2: la naturaleza del predicado

### A. Predicado nominal → oración **copulativa** o **atributiva**
Verbo *ser*, *estar* o *parecer* + atributo.

### B. Predicado verbal → oración **predicativa**, y dentro de ella:

**Según lleve o no CD:**
- **Transitiva**: lleva CD. *Soltó **una maldición***
- **Intransitiva**: no lo lleva. *El viejo **salió***

**Según la voz:**
- **Activa**: el sujeto es agente
- **Pasiva**: el sujeto es paciente
  - **Perifrástica**: *ser* + participio. *Fue penalizado*
  - **Refleja**: *se* + verbo concordando. *Se penalizarán los errores*

**Según la relación sujeto-acción:**
- **Reflexiva**: la acción recae sobre el propio sujeto (admite *a sí mismo*). *El viejo **se** lavó*
- **Recíproca**: dos o más sujetos intercambian la acción (admite *el uno al otro*). *Se saludaron*

**Sin sujeto:**
- **Impersonal**: meteorológica, gramaticalizada, refleja o eventual

## La fórmula de respuesta

> *Oración **[modalidad]**, **[naturaleza del predicado con todos sus matices]**.*

Ejemplos:
> *Oración **enunciativa afirmativa**, **predicativa activa transitiva**.*
> *Oración **exclamativa**, **copulativa**.*
> *Oración **enunciativa afirmativa**, **impersonal gramaticalizada**.*
> *Oración **interrogativa directa total**, **predicativa activa transitiva pronominal**.*

## Cuidado: no confundir criterios

**Modalidad ≠ modalidad textual ≠ modalización.** Aquí hablamos de la **actitud del hablante en la oración concreta**, no del tipo de texto ni de las marcas de subjetividad.`,
    worked_example_markdown: `## Ejemplo guiado: ocho oraciones clasificadas

### 1. *El viejo se incorporó hasta sentarse y soltó una maldición.*
Son **dos oraciones coordinadas copulativas** (nexo *y*).
- **1ª:** *enunciativa afirmativa, predicativa activa intransitiva pronominal* (*se* = morfema)
- **2ª:** *enunciativa afirmativa, predicativa activa transitiva* (*una maldición* = CD)

### 2. *¡Qué salvajito eres, mi niño!*
*Exclamativa, copulativa*, con sujeto omitido *(tú)* y vocativo *mi niño*.

### 3. *Se penalizarán los errores repetidos.*
*Enunciativa afirmativa, **pasiva refleja***.
Sujeto paciente: *los errores repetidos*.

### 4. *¿Te llevas la bacinilla?*
*Interrogativa directa total, predicativa activa transitiva pronominal*.
(**Total** porque se responde sí/no.)

### 5. *Hay cabras en el corral.*
*Enunciativa afirmativa, **impersonal gramaticalizada*** (verbo *haber*).
*Cabras* = CD, no sujeto.

### 6. *Quizá llueva mañana.*
*Dubitativa, **impersonal meteorológica***.

### 7. *Los dos hermanos se pegaban continuamente.*
*Enunciativa afirmativa, predicativa activa **recíproca***.
Admite *el uno al otro*. *Se* = CD.

### 8. *La novela fue escrita por Alexis Ravelo.*
*Enunciativa afirmativa, **pasiva perifrástica***.
Sujeto paciente: *La novela*. CAg: *por Alexis Ravelo*.

## Análisis completo con clasificación

**Oración:** *Mi madre se escandalizaría si viera estos garbanzos de bote.* (examen oficial de Madrid, 2022-23)

**Paso 1 — Verbos:** *escandalizaría* y *viera* → **dos proposiciones**.
**Paso 2 — Nexo:** *si* → subordinada **condicional**.

> **Proposición principal (apódosis):** *Mi madre se escandalizaría*
> &nbsp;&nbsp;• **SN/Suj:** *Mi madre* → Det *Mi* + N *madre*
> &nbsp;&nbsp;• **SV/PV:** *se escandalizaría*
> &nbsp;&nbsp;&nbsp;&nbsp;– ***se***: morfema de verbo pronominal (*escandalizarse*), sin función
> &nbsp;&nbsp;&nbsp;&nbsp;– **N:** *escandalizaría* (condicional simple)
>
> **Proposición subordinada (prótasis):** *si viera estos garbanzos de bote*
> &nbsp;&nbsp;• **Nx:** *si*
> &nbsp;&nbsp;• **Suj:** omitido *(ella)*
> &nbsp;&nbsp;• **N:** *viera*
> &nbsp;&nbsp;• **SN/CD:** *estos garbanzos de bote*
> &nbsp;&nbsp;&nbsp;&nbsp;– Det *estos* + N *garbanzos* + **SPrep/CN** *de bote*

**Clasificación completa:**
> *Oración compuesta por **subordinación adverbial condicional**. La proposición principal es **enunciativa afirmativa, predicativa activa intransitiva pronominal**; la subordinada, **transitiva**. El período condicional es **irreal o potencial** (imperfecto de subjuntivo + condicional simple).*

**Ese último matiz** —el tipo de período condicional— es un extra que muy poca gente añade y que demuestra dominio.`,
    practice_prompt: 'Clasifica según los dos criterios: (a) "Ojalá apruebes el examen"; (b) "Los alumnos se felicitaron mutuamente"; (c) "El libro fue publicado en 2025"; (d) "No me gustan las despedidas"; (e) "Se vive bien aquí"; (f) "¿Dónde has dejado las llaves?". Para las que tengan "se", indica además su valor.',
    alert_markdown: '⚠️ **Hay que dar los dos criterios, no uno.** "Oración transitiva" está incompleto; "oración **enunciativa afirmativa, predicativa activa transitiva**" es la respuesta. Y en las interrogativas, especifica si son **directas o indirectas** y **totales o parciales**.',
  },

  {
    sort_order: 23,
    title: 'La Oración Compuesta: Coordinación y Yuxtaposición',
    concept_markdown: `## Oración simple, compuesta y compleja

- **Simple:** un solo verbo en forma personal → una sola oración.
- **Compuesta:** dos o más verbos en forma personal → varias **proposiciones**.

**La regla de oro:** tantos **verbos en forma personal**, tantas proposiciones. Los infinitivos, gerundios y participios **no cuentan** como proposición independiente si forman **perífrasis**; sí cuentan si encabezan una **construcción** con sujeto propio.

## Coordinación

Dos o más proposiciones del **mismo nivel sintáctico**, unidas por una conjunción coordinante. **Ninguna depende de la otra**: cada una podría funcionar sola.

| Tipo | Nexos | Valor |
|---|---|---|
| **Copulativa** | *y, e, ni, que* | Suma |
| **Disyuntiva** | *o, u, o bien* | Alternativa, exclusión |
| **Adversativa** | *pero, mas, sino (que), aunque, sin embargo* | Oposición |
| **Distributiva** | *ya… ya, bien… bien, unos… otros, tan pronto… como* | Alternancia |
| **Explicativa** | *es decir, o sea, esto es* | Aclaración |

> *El viejo se incorporó **y** soltó una maldición.* → coordinada **copulativa**
> *Quería verlos, **pero** renunció.* → coordinada **adversativa**

### Adversativas: *pero* frente a *sino*
- ***Pero***: restringe lo anterior. *Es caro **pero** bueno.*
- ***Sino***: corrige una negación previa. *No es caro **sino** barato.*
  Exige que la primera proposición sea **negativa**.

## Yuxtaposición

Proposiciones unidas **sin nexo**, solo mediante signos de puntuación: **coma**, **punto y coma** o **dos puntos**.

> *No renunciaron a nada**:** renunciaron a mucho.*
> *La perra ladraba**,** las cabras balaban**,** el viejo maldecía.*

Se analizan como **proposiciones yuxtapuestas** (P1, P2, P3), aunque entre ellas exista una relación lógica implícita.

**Detalle que suma:** identificar **qué relación lógica implícita** hay. En *"No renunciaron a nada: renunciaron a mucho"* la relación es **adversativa**, y los dos puntos producen un efecto **más rotundo** que un *pero* explícito. Ese comentario estilístico puntúa en 1.1.b.

## Cómo distinguir coordinación de subordinación

**Prueba: ¿puede la proposición funcionar sola?**

> *Se incorporó* ✅ / *soltó una maldición* ✅ → **coordinación**
> *Perseguían un prestigio* ✅ / *que convertía cada logro…* ❌ → **subordinación**

En la subordinación, una proposición **desempeña una función sintáctica dentro de la otra** (sujeto, CD, CN, CC…). En la coordinación, no.

## La trampa de *aunque*

***Aunque*** puede ser:
- **Conjunción coordinante adversativa**, cuando equivale a *pero*: *Es listo, **aunque** vago.*
- **Conjunción subordinante concesiva**, lo más frecuente: ***Aunque** llueva, saldré.*

Criterio: si puedes sustituirlo por *pero* sin cambiar el sentido, es coordinante.

## Coordinación de sintagmas, no de proposiciones

Cuidado: *y* también coordina **sintagmas** dentro de una misma oración simple.
> *Compró **pan y leche**.* → **una sola oración** (un verbo), con CD coordinado.

Solo hay oración compuesta si hay **dos verbos en forma personal**.`,
    worked_example_markdown: `## Ejemplo guiado: seis casos resueltos

### 1. *El viejo vació sus orines y encendió una lámpara.*
Dos verbos personales → dos proposiciones. Nexo *y*.
→ **Coordinada copulativa.**
⚠️ Comparten sujeto omitido *(él)*, lo cual **no** impide la coordinación.

### 2. *Ditoseadis, cualquier día hago un sancocho de perra.*
Sin nexo, separadas por coma.
→ **Yuxtapuestas.** (La primera es una interjección lexicalizada.)

### 3. *No renunciaron a nada: renunciaron a mucho.*
Dos puntos, sin nexo → **yuxtapuestas**, con valor **adversativo implícito**.
**Comentario estilístico:** la yuxtaposición produce un efecto de sentencia más rotundo que un *pero* explícito, y el paralelismo sintáctico refuerza la **paradoja**.

### 4. *Quería verlos, pero renunció.*
Nexo *pero* → **coordinada adversativa**.

### 5. *La perra ladraba, las cabras balaban, el viejo maldecía.*
Tres proposiciones sin nexo → **yuxtapuestas**.
**Comentario:** el **asíndeton** acelera el ritmo y crea sensación de simultaneidad y agitación.

### 6. *Compró pan y leche en el mercado.*
**Un solo verbo** → **oración simple**. *pan y leche* es un CD con núcleos coordinados.
⚠️ La *y* coordina sintagmas, no proposiciones.

## Análisis completo de una compuesta

**Oración:** *El viejo se incorporó hasta sentarse y soltó una maldición al notar en los pies el frío suelo de cemento.*

**Paso 1 — Verbos en forma personal:** *incorporó*, *soltó* → **dos proposiciones**.
*(sentarse* y *notar* son infinitivos dentro de sintagmas preposicionales, no proposiciones independientes.)*

**Paso 2 — Nexo:** *y* → **coordinación copulativa**.

> **P1:** *El viejo se incorporó hasta sentarse*
> &nbsp;&nbsp;• **SN/Suj:** *El viejo*
> &nbsp;&nbsp;• **SV/PV:** *se incorporó hasta sentarse*
> &nbsp;&nbsp;&nbsp;&nbsp;– ***se***: morfema de verbo pronominal
> &nbsp;&nbsp;&nbsp;&nbsp;– **N:** *incorporó*
> &nbsp;&nbsp;&nbsp;&nbsp;– **SPrep/CC:** *hasta sentarse* → Enl *hasta* + T *sentarse*
>
> **Nx:** *y* (conjunción coordinante copulativa)
>
> **P2:** *soltó una maldición al notar en los pies el frío suelo de cemento*
> &nbsp;&nbsp;• **Suj:** omitido *(él)*
> &nbsp;&nbsp;• **SV/PV:**
> &nbsp;&nbsp;&nbsp;&nbsp;– **N:** *soltó*
> &nbsp;&nbsp;&nbsp;&nbsp;– **SN/CD:** *una maldición*
> &nbsp;&nbsp;&nbsp;&nbsp;– **SPrep/CCCausa:** *al notar en los pies el frío suelo de cemento*
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;· **Enl:** *al* · **T:** *notar en los pies el frío suelo de cemento*
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;· dentro: **N** *notar* + **SPrep/CCL** *en los pies* + **SN/CD** *el frío suelo de cemento*

**Clasificación:**
> *Oración compuesta por **coordinación copulativa**. Ambas proposiciones son **enunciativas afirmativas, predicativas activas**; la primera **intransitiva pronominal** y la segunda **transitiva**, con sujeto omitido en ambas.*`,
    practice_prompt: 'Indica si son coordinadas (di el tipo), yuxtapuestas o subordinadas, contando primero los verbos en forma personal: (a) "Llegó tarde, no encontró sitio"; (b) "Ni estudia ni trabaja"; (c) "Unos cantaban, otros bailaban"; (d) "Estaba cansado, es decir, no podía más"; (e) "Compró pan y queso"; (f) "No es caro sino barato". Para las yuxtapuestas, di qué relación lógica implícita hay.',
    alert_markdown: '⚠️ **Cuenta primero los verbos en forma personal: ese es el número de proposiciones.** Los infinitivos, gerundios y participios no cuentan si forman perífrasis o van dentro de un sintagma. *Compró pan y leche* tiene un solo verbo: es oración **simple**, por mucha *y* que lleve.',
  },
]

async function main() {
  console.log(`Reescribiendo ${cards.length} misiones (16-23, sintaxis) en profundidad…\n`)
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
