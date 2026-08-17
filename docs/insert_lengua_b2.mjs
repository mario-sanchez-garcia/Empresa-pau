// Uso: node --env-file=.env.local docs/insert_lengua_b2.mjs
// Bloque 2 — Reflexión sobre la lengua: cards 16-40
//
// El reparto de misiones replica la frecuencia real medida sobre los 45 exámenes
// oficiales de Madrid (2018-2026) en app/data/lengua.ts:
//   sintaxis (analice sintácticamente) ... 57 apariciones → 15 misiones
//   morfología (categoría + estructura) ... 25 apariciones →  5 misiones
//   semántica (relaciones de significado)  24 apariciones →  4 misiones
//   variedades / lenguas de España .......  2 apariciones →  1 misión
// La sintaxis es la pregunta de 1,4 puntos (2.1); morfología y semántica son las
// de 0,8 puntos (2.3, 2.4, 2.5), de las que hay que responder dos.

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY
)

const SUBJECT = 'lengua'
const BLOCK_KEY = 'Reflexión sobre la lengua'
const BLOCK_SLUG = 'reflexion-lengua'

const cards = [
  // ─── SINTAXIS (16-30) ───────────────────────────────────────────────────────

  {
    sort_order: 16,
    title: 'El Sintagma: Tipos y Estructura',
    concept_markdown: `## El sintagma

Palabra o grupo de palabras organizado en torno a un **núcleo** que desempeña una **función sintáctica** dentro de la oración.

### Estructura general
> **(Determinante) + NÚCLEO + (Complementos)**

### Los cinco tipos

| Sintagma | Núcleo | Ejemplo |
|---|---|---|
| **Nominal (SN)** | Sustantivo o pronombre | *el frío suelo de cemento* |
| **Adjetival (SAdj)** | Adjetivo | *muy difícil de entender* |
| **Adverbial (SAdv)** | Adverbio | *bastante lejos de aquí* |
| **Verbal (SV)** | Verbo | *soltó una maldición* |
| **Preposicional (SPrep)** | Enlace + término | *de cemento*, *con sus amigos* |

### El sintagma preposicional es distinto
No tiene núcleo propio: se compone de **preposición (enlace) + un sintagma (término)**, normalmente nominal.
> *en **los pies*** → Enl (*en*) + T (SN: *los pies*)

### Por qué importa
El **tipo de sintagma condiciona la función posible**. Un CD solo puede ser un SN (o SPrep con *a* si es de persona); un complemento de régimen es siempre un SPrep con la preposición exigida por el verbo.`,
    worked_example_markdown: `**Analiza la estructura de los sintagmas de:** *El viejo se incorporó hasta sentarse.*

**SN Sujeto:** *El viejo*
- **Det:** *El*
- **N:** *viejo* (sustantivo)

**SV Predicado:** *se incorporó hasta sentarse*
- **N:** *incorporó* (verbo, con *se* como morfema pronominal)
- **SPrep / CC:** *hasta sentarse*
  - **Enl:** *hasta*
  - **T:** *sentarse* (infinitivo con valor nominal)

**Otro ejemplo con un SN complejo:** *el frío suelo de cemento*
- **Det:** *el*
- **SAdj / CN:** *frío*
- **N:** *suelo*
- **SPrep / CN:** *de cemento* → Enl (*de*) + T (SN: *cemento*)

**Regla práctica:** identifica primero el **núcleo** (la palabra imprescindible); todo lo demás depende de él.`,
    practice_prompt: 'Identifica y analiza internamente todos los sintagmas de esta oración, indicando tipo y núcleo de cada uno: "La perra raspaba la puerta del corral con las patas".',
    alert_markdown: '⚠️ **No confundas tipo con función.** *De cemento* es un **SPrep** (tipo) que funciona como **CN** (función). En el examen hay que indicar siempre las dos cosas.',
  },

  {
    sort_order: 17,
    title: 'El Sujeto: Cómo Identificarlo sin Fallar',
    concept_markdown: `## El sujeto

Sintagma nominal que **concuerda en número y persona con el verbo**. Es de quien se dice algo en el predicado.

### La prueba infalible
**Cambia el número del verbo.** Lo que cambie con él es el sujeto:
> *El viejo **soltó** una maldición* → *Los viejo**s soltaron** una maldición* ✅ *El viejo* es sujeto.
> (*una maldición* no cambió → no es sujeto)

### Tipos de sujeto
- **Léxico o expreso:** aparece escrito.
- **Omitido o elíptico:** no aparece pero se deduce por la desinencia verbal. **Se indica siempre:** *Suj. omitido (él)*.

### Oraciones sin sujeto: impersonales

| Tipo | Cómo se reconoce | Ejemplo |
|---|---|---|
| **Meteorológicas** | Verbos de fenómenos naturales | *Llovía sobre el patio* |
| **Gramaticalizadas** | *haber*, *hacer*, *ser* en 3ª sing. | ***Hay** cabras en el corral* |
| **Refleja con SE** | *se* + verbo 3ª persona, sin sujeto posible | *Se vive bien aquí* |
| **Eventual** | 3ª persona del plural sin referente | *Llaman a la puerta* |

### El error más caro
En *Hay cabras*, muchos marcan *cabras* como sujeto. **No lo es:** el verbo *haber* impersonal no admite plural (*\\*Habían cabras* es incorrecto). *Cabras* es **CD**.`,
    worked_example_markdown: `**Localiza el sujeto en cada caso:**

**1.** *Los balidos de las cabras arreciaron.*
> Prueba: *El balido… arreció*. Cambia todo el sintagma → **Suj:** *Los balidos de las cabras* (SN).

**2.** *A tientas, buscó el orinal debajo del camastro.*
> No hay SN que concuerde. La desinencia indica 3ª persona del singular → **Suj. omitido (él, el viejo)**.

**3.** *Me gustan las novelas de Ravelo.*
> Prueba: *Me gusta la novela*. Cambia *las novelas* → **Suj:** *las novelas de Ravelo*.
> *Me* es **CI**. ⚠️ Con *gustar*, *doler*, *encantar*, el sujeto va detrás y quien experimenta es el CI.

**4.** *Se penalizarán los errores repetidos.*
> Prueba: *Se penalizará el error repetido*. Concuerda → **pasiva refleja**, y *los errores repetidos* es **sujeto paciente**.

**5.** *Había más de un millón de cadáveres.*
> *haber* impersonal → **oración impersonal, sin sujeto**. *Más de un millón de cadáveres* es **CD**.`,
    practice_prompt: 'Localiza el sujeto (o indica que la oración es impersonal) en estas cinco oraciones: (a) "Hace frío en la alcoba"; (b) "Le duelen los pies"; (c) "Se venden pisos"; (d) "Han llamado por teléfono"; (e) "Las cabras balaban sin parar".',
    alert_markdown: '⚠️ **El sujeto no es "quien hace la acción".** En *Juan fue detenido por la policía*, el sujeto es *Juan* aunque no haga nada. La única definición fiable es la **concordancia con el verbo**.',
  },

  {
    sort_order: 18,
    title: 'Predicado Nominal y Atributo: Las Copulativas',
    concept_markdown: `## Predicado nominal (PN)

Se construye con los **verbos copulativos** *ser*, *estar* y *parecer*, que carecen de significado pleno y funcionan como un puente entre el sujeto y el **atributo**.

> *El Cagarruta **es** un salvaje.* → PN

### El atributo (Atrib)
Es el elemento que **atribuye una cualidad o clasificación al sujeto**. Puede ser:
- **SAdj:** *La perra está **furiosa***
- **SN:** *Alexis Ravelo es **un novelista canario***
- **SPrep:** *El orinal es **de loza***

### La prueba decisiva: la sustitución por LO
El atributo **siempre se sustituye por el pronombre *lo***, sea cual sea su género y número:
> *La perra está furiosa* → *La perra **lo** está* ✅
> *Ravelo es un novelista canario* → *Ravelo **lo** es* ✅

### Ojo: *ser*, *estar* y *parecer* no siempre son copulativos
Cuando tienen significado pleno (*existir*, *hallarse*), el predicado es **verbal** y lo que sigue es un CC:
> *La reunión **es** en el patio* = *se celebra* → PV, *en el patio* es **CCL**.
> *El viejo **está** en el corral* = *se halla* → PV, *en el corral* es **CCL**.

Prueba: *\\*La reunión lo es* ❌ → no es atributo.`,
    worked_example_markdown: `**Distingue predicado nominal de predicado verbal:**

**1.** *El suelo de cemento estaba frío.*
> *El suelo **lo** estaba* ✅ → **PN**. *frío* = **Atributo** (SAdj).

**2.** *El viejo estaba en el corral.*
> *\\*El viejo lo estaba* ❌ → **PV** (*estar* = hallarse). *en el corral* = **CCL**.

**3.** *Quiterita parece cansada.*
> *Quiterita **lo** parece* ✅ → **PN**. *cansada* = **Atributo**.

**4.** *La novela fue escrita por Ravelo.*
> *\\*La novela lo fue* ❌ → **PV en voz pasiva**. *escrita* forma parte de la perífrasis pasiva y *por Ravelo* es **complemento agente**.

**5.** *Hoy es martes.*
> *Hoy **lo** es* ✅ → **PN**. *martes* = **Atributo** (SN).

**Resumen del método:** intenta sustituir por *lo*. Si funciona, es atributo y el predicado es nominal.`,
    practice_prompt: 'Indica si el predicado es nominal o verbal en cada oración y justifica con la prueba del "lo": (a) "El examen es a las nueve"; (b) "El examen es difícil"; (c) "Mi hermano está enfermo"; (d) "Mi hermano está en Madrid".',
    alert_markdown: '⚠️ **Atributo ≠ complemento predicativo.** El atributo va con verbo copulativo y se sustituye por *lo*; el **predicativo** va con verbo predicativo y concuerda con el sujeto o el CD (*Los niños llegaron **cansados***), y **no** admite *lo*.',
  },

  {
    sort_order: 19,
    title: 'Complemento Directo y Complemento Indirecto',
    concept_markdown: `## Complemento directo (CD)

Completa el significado de un **verbo transitivo**, señalando sobre qué recae la acción.

### Cómo identificarlo — dos pruebas
1. **Sustitución por *lo, la, los, las***:
   > *Buscó **el orinal*** → *Lo buscó* ✅
2. **Transformación a pasiva**: el CD pasa a sujeto paciente.
   > *El viejo encendió **una lámpara*** → *Una lámpara **fue encendida** por el viejo* ✅

### Forma
SN (*Soltó **una maldición***) o SPrep con ***a*** si es de **persona determinada** (*Vio **a la Rubia***).

## Complemento indirecto (CI)

Designa el **destinatario o beneficiario** de la acción.

### Cómo identificarlo
1. **Sustitución por *le, les*** (que pasan a *se* ante otro pronombre):
   > *Dio uso **al orinal*** → *Le dio uso* ✅
2. **Va siempre precedido de *a*** (o *para*).

### La prueba conjunta
> *El viejo **le** dio **la bacinilla** a Quiterita.*
> *la bacinilla* → *La dio* = **CD**
> *a Quiterita* → *Le dio* = **CI**

### Cuidado con el leísmo
*Le vi* (por *Lo vi*) está admitido solo para CD **masculino de persona singular**. *Les vi* por *Los vi* es incorrecto.`,
    worked_example_markdown: `**Analiza los complementos:**

**1.** *El viejo vació sus orines en la letrina.*
> *sus orines* → *Los vació* ✅ **CD**
> *en la letrina* → ni *lo* ni *le* → **CCL**

**2.** *Le preguntó a Quiterita si se llevaba la bacinilla.*
> *a Quiterita* → *Le preguntó* ✅ **CI**
> *si se llevaba la bacinilla* → *Lo preguntó* ✅ **CD** (proposición subordinada sustantiva)

**3.** *Se lo dijo ayer.*
> *se* = **CI** (es *le* transformado ante *lo*)
> *lo* = **CD**
> *ayer* = **CCT**

**4.** *La perra intentaba meter el hocico por debajo.*
> *el hocico* → *Lo intentaba meter* ✅ **CD**
> *por debajo* → **CCL**

**Truco de oro:** si dudas entre CD y CI con un SPrep encabezado por *a*, sustituye. *Lo/la* → CD. *Le* → CI.`,
    practice_prompt: 'Identifica el CD y el CI en estas oraciones, justificando con la sustitución pronominal: (a) "Regaló un libro a su hermana"; (b) "Vio a los niños en el patio"; (c) "Les explicó la lección a los alumnos"; (d) "Compré el pan esta mañana".',
    alert_markdown: '⚠️ **Un SPrep con *a* no es automáticamente CI.** *Vio **a la Rubia*** lleva *a* porque es CD de persona determinada: *La vio* ✅, no *\\*Le vio la Rubia*. Siempre hay que hacer la sustitución.',
  },

  {
    sort_order: 20,
    title: 'El Complemento de Régimen (Suplemento)',
    concept_markdown: `## Complemento de régimen (CRég)

Complemento **exigido por el verbo** mediante una **preposición fija**. También se llama **suplemento**.

> *La perra **carecía de** miedo.*
> *El texto **habla de** tecnología.*

### Qué lo caracteriza
1. La preposición **la impone el verbo**, no el sentido: *acordarse **de***, *confiar **en***, *insistir **en***, *depender **de***, *arrepentirse **de***.
2. **No se puede suprimir** sin que la oración quede coja o cambie de significado.

### Cómo identificarlo — la prueba
**Sustituye por *preposición + pronombre tónico* (eso, ello, él):**
> *Se acordó **de su infancia*** → *Se acordó **de eso*** ✅ → **CRég**

Y comprueba que **no** admite *lo/la* (no es CD) ni *le* (no es CI).

### Cómo se distingue del CC
El **CC es suprimible** y responde a *cuándo, dónde, cómo*; el **CRég no se puede quitar**:
> *Piensa **en el examen*** → *\\*Piensa* ❌ (queda incompleta) → **CRég**
> *Estudia **en la biblioteca*** → *Estudia* ✅ (sigue teniendo sentido) → **CCL**

### Verbos frecuentes con CRég
*acordarse de, alegrarse de, arrepentirse de, carecer de, confiar en, contar con, depender de, hablar de, insistir en, pensar en, preocuparse por, soñar con, tratar de*.`,
    worked_example_markdown: `**Distingue CRég de otros complementos:**

**1.** *El artículo trata de la inteligencia artificial.*
> *Trata **de eso*** ✅ / *\\*Lo trata* (con otro sentido) → **CRég**

**2.** *Nos hemos metido de cabeza en la tecnología.*
> *meterse **en*** exige la preposición; *\\*Nos hemos metido* queda incompleto → **CRég**

**3.** *El viejo salió de la alcoba.*
> ¿Suprimible? *El viejo salió* ✅ mantiene sentido → **CCL**
> (Aunque lleve *de*, aquí la preposición aporta significado locativo, no la exige el verbo.)

**4.** *Depende de sus padres para todo.*
> *Depende **de ellos*** ✅, e imposible suprimir → **CRég**

**5.** *Confío en ti.*
> *Confío **en eso/en ella*** ✅ → **CRég**

**La pregunta que lo resuelve:** *"¿La oración sigue teniendo sentido completo si lo quito?"* Si no → CRég. Si sí → CC.`,
    practice_prompt: 'Indica si el sintagma preposicional subrayado es CRég o CC y justifícalo con la prueba de supresión: (a) "Se arrepintió de sus palabras"; (b) "Trabaja en una fábrica"; (c) "Soñó con volver"; (d) "Llegó por la mañana".',
    alert_markdown: '⚠️ **Un verbo puede llevar CD y CRég a la vez:** *Hablé **del asunto** (CRég) **con Ana** (CC de compañía)*, o *Convertí **el sótano** (CD) **en un taller** (CRég)*. No des por hecho que solo hay uno.',
  },

  {
    sort_order: 21,
    title: 'Circunstancial, Predicativo y Agente',
    concept_markdown: `## Complemento circunstancial (CC)

Aporta información sobre las **circunstancias** de la acción. Es **suprimible** y muy móvil.

| Tipo | Pregunta | Ejemplo |
|---|---|---|
| **CCL** lugar | ¿dónde? | *en el corral* |
| **CCT** tiempo | ¿cuándo? | *a las nueve* |
| **CCM** modo | ¿cómo? | *a tientas* |
| **CCC** cantidad | ¿cuánto? | *bastante* |
| **CCI** instrumento | ¿con qué? | *con las patas* |
| **CCCom** compañía | ¿con quién? | *con sus amigos* |
| **CCCausa** | ¿por qué? | *por el frío* |
| **CCF** finalidad | ¿para qué? | *para dormir* |

## Complemento predicativo (CPvo)

Complemento que **modifica a la vez al verbo y a un sustantivo** (sujeto o CD), **concordando** con él en género y número.

> *Los niños llegaron **cansados**.* (concuerda con el sujeto)
> *Nombraron **delegado** a Juan.* (referido al CD)

**Diferencia con el atributo:** el CPvo va con **verbo predicativo** (con significado pleno) y **no** admite sustitución por *lo*.
**Diferencia con el CCM:** el CPvo **concuerda** (*llegaron cansad**os***); el CCM es invariable (*llegaron **deprisa***).

## Complemento agente (CAg)

Solo en **oraciones pasivas**. Designa quien realiza realmente la acción, introducido por ***por***.
> *La puerta fue raspada **por la perra**.*
Al pasar a activa, se convierte en **sujeto**.`,
    worked_example_markdown: `**Analiza los complementos de estas oraciones:**

**1.** *A tientas, buscó el orinal debajo del camastro.*
> *A tientas* → ¿cómo? **CCM**
> *el orinal* → *Lo buscó* **CD**
> *debajo del camastro* → ¿dónde? **CCL**

**2.** *El viejo salió del corral furioso.*
> *furioso* concuerda con *el viejo* (masc. sing.) y el verbo es predicativo → **CPvo del sujeto**
> Prueba: *\\*Lo salió* ❌ (no es atributo); *furiosa* si fuera ella → concuerda, luego no es CCM.

**3.** *Los errores repetidos serán penalizados por el corrector.*
> *Los errores repetidos* → **Sujeto paciente**
> *serán penalizados* → **PV** (perífrasis pasiva)
> *por el corrector* → **Complemento agente**

**4.** *Encendió la lámpara con cuidado.*
> *la lámpara* → **CD**
> *con cuidado* → ¿cómo? y es invariable → **CCM**

**Truco para el CPvo:** cambia el género del sustantivo al que parece referirse. Si el complemento también cambia, es **predicativo**; si no cambia, es **circunstancial**.`,
    practice_prompt: 'Clasifica los complementos circunstanciales y localiza los predicativos: (a) "Llegaron muy contentos a casa"; (b) "Trabaja los domingos por dinero"; (c) "Eligieron presidenta a Marta"; (d) "El acuerdo fue firmado por ambas partes".',
    alert_markdown: '⚠️ **Todo lo que va con *por* no es complemento agente.** Solo lo es en oraciones **pasivas**. En *Lo hizo por dinero*, *por dinero* es **CC de causa/finalidad**.',
  },

  {
    sort_order: 22,
    title: 'Clasificación de la Oración Simple',
    concept_markdown: `## Cómo se clasifica una oración

En la PAU se pide clasificar **según dos criterios simultáneos**.

### 1. Según la actitud del hablante (modalidad)

| Modalidad | Rasgo |
|---|---|
| **Enunciativa** | Afirma o niega (afirmativa / negativa) |
| **Interrogativa** | Pregunta (directa / indirecta, total / parcial) |
| **Exclamativa** | Expresa emoción |
| **Exhortativa** (imperativa) | Ordena, ruega |
| **Dubitativa** | Duda (*quizá, tal vez*) |
| **Desiderativa** (optativa) | Desea (*ojalá*) |

### 2. Según la naturaleza del predicado

**A. Predicado nominal** → **copulativa** (*ser, estar, parecer* + atributo)

**B. Predicado verbal** → **predicativa**, y dentro de ella:
- **Transitiva** (lleva CD) / **intransitiva** (no lo lleva)
- **Activa** / **pasiva** (perifrástica o refleja)
- **Reflexiva** (la acción recae en el propio sujeto: *se lava*)
- **Recíproca** (dos sujetos que se intercambian la acción: *se saludan*)
- **Impersonal** (sin sujeto)

### La fórmula de respuesta
> *Oración **enunciativa afirmativa**, **predicativa activa transitiva**.*

Se nombran ambos criterios, en ese orden.`,
    worked_example_markdown: `**Clasifica cada oración:**

**1.** *El viejo se incorporó hasta sentarse y soltó una maldición.*
> Son **dos** oraciones coordinadas copulativas. La primera: *enunciativa afirmativa, predicativa activa intransitiva pronominal*. La segunda: *enunciativa afirmativa, predicativa activa transitiva* (*una maldición* = CD).

**2.** *¡Qué salvajito eres, mi niño!*
> **Exclamativa**, **copulativa** (*ser* + atributo *qué salvajito*).

**3.** *Se penalizarán los errores repetidos.*
> **Enunciativa afirmativa**, **pasiva refleja** (*los errores repetidos* = sujeto paciente).

**4.** *¿Te llevas la bacinilla?*
> **Interrogativa directa total**, **predicativa activa transitiva pronominal**.

**5.** *Hay cabras en el corral.*
> **Enunciativa afirmativa**, **impersonal gramaticalizada** (verbo *haber*).

**6.** *Quizá llueva mañana.*
> **Dubitativa**, **impersonal meteorológica**.`,
    practice_prompt: 'Clasifica según los dos criterios (modalidad y naturaleza del predicado): (a) "Ojalá apruebes el examen"; (b) "Los alumnos se felicitaron mutuamente"; (c) "El libro fue publicado en 2025"; (d) "No me gustan las despedidas".',
    alert_markdown: null,
  },

  {
    sort_order: 23,
    title: 'La Oración Compuesta: Coordinación y Yuxtaposición',
    concept_markdown: `## Coordinación

Dos o más proposiciones del **mismo nivel sintáctico**, unidas por una conjunción coordinante. Ninguna depende de la otra.

| Tipo | Nexos | Valor |
|---|---|---|
| **Copulativa** | *y, e, ni* | Suma |
| **Disyuntiva** | *o, u, o bien* | Alternativa |
| **Adversativa** | *pero, sino, mas, sin embargo* | Oposición |
| **Distributiva** | *ya… ya, bien… bien, unos… otros* | Alternancia |
| **Explicativa** | *es decir, o sea, esto es* | Aclaración |

> *El viejo se incorporó **y** soltó una maldición.* → coordinada copulativa

## Yuxtaposición

Proposiciones unidas **sin nexo**, mediante signos de puntuación (**coma, punto y coma, dos puntos**).

> *No renunciaron a nada**:** renunciaron a mucho.*

Se analizan como **proposiciones yuxtapuestas** (P1, P2), aunque entre ellas exista una relación lógica implícita (aquí, adversativa).

## Cómo se diferencia de la subordinación
Prueba: **¿puede una proposición funcionar sola?**
- *Se incorporó* ✅ y *soltó una maldición* ✅ → **coordinación**
- *Perseguían un prestigio* ✅ pero *que convertía cada logro…* ❌ → **subordinación**

En la subordinación, una proposición **desempeña una función sintáctica dentro de la otra**.`,
    worked_example_markdown: `**Analiza el tipo de relación entre proposiciones:**

**1.** *El viejo vació sus orines y encendió una lámpara.*
> Dos proposiciones independientes unidas por *y* → **coordinada copulativa**.
> Nótese que comparten sujeto omitido (*él*), lo que no impide la coordinación.

**2.** *Ditoseadis, cualquier día hago un sancocho de perra.*
> Sin nexo, separadas por coma → **yuxtapuestas**.

**3.** *No renunciaron a nada: renunciaron a mucho.*
> Dos puntos, sin nexo → **yuxtapuestas** con valor adversativo implícito.
> Comentario estilístico: la yuxtaposición produce un efecto de **sentencia** más rotundo que *pero*.

**4.** *Quería verlos, pero renunció.*
> Nexo *pero* → **coordinada adversativa**.

**5.** *La perra ladraba, las cabras balaban, el viejo maldecía.*
> Tres proposiciones sin nexo → **yuxtapuestas**. El asíndeton acelera el ritmo.

**Método:** localiza primero **cuántos verbos en forma personal** hay. Tantos verbos, tantas proposiciones.`,
    practice_prompt: 'Indica si estas oraciones son coordinadas (di el tipo) o yuxtapuestas: (a) "Llegó tarde, no encontró sitio"; (b) "Ni estudia ni trabaja"; (c) "Unos cantaban, otros bailaban"; (d) "Estaba cansado, es decir, no podía más".',
    alert_markdown: '⚠️ **Cuenta los verbos en forma personal.** Ese es el número de proposiciones. Los infinitivos, gerundios y participios **no** cuentan como proposición independiente: forman perífrasis o construcciones no personales.',
  },

  {
    sort_order: 24,
    title: 'Subordinadas Sustantivas: Funciones',
    concept_markdown: `## Proposiciones subordinadas sustantivas

Desempeñan **la misma función que un sintagma nominal**. La prueba definitiva: **se sustituyen por *esto*, *eso* o *algo***.

### Nexos
- **Conjunción *que***: *Dijo **que** vendría*
- **Conjunción *si*** (interrogativa indirecta total): *Preguntó **si** llovía*
- **Interrogativos** *qué, quién, cuándo, dónde, cómo* (interrogativa indirecta parcial)
- **Infinitivo** sin nexo: *Quiero **estudiar***

### Funciones que pueden desempeñar

| Función | Ejemplo |
|---|---|
| **Sujeto** | ***Que llegues tarde** me molesta* → *Eso me molesta* |
| **CD** | *Dijo **que vendría*** → *Dijo eso* |
| **Atributo** | *Mi deseo es **que apruebes*** |
| **CRég** | *Se acordó de **que era martes*** |
| **CN** | *Tengo la esperanza de **que venga*** |
| **CAdj** | *Estoy seguro de **que vendrá*** |

### El método
1. Sustituye la proposición por **eso**.
2. Si funciona → es sustantiva.
3. Aplica ahora las pruebas de función habituales (*lo* para CD, concordancia para sujeto…).`,
    worked_example_markdown: `**Analiza la función de cada subordinada sustantiva:**

**1.** *Le preguntó si se llevaba la bacinilla.*
> Sustitución: *Le preguntó **eso*** ✅ → sustantiva.
> Función: *Lo preguntó* ✅ → **CD**. Nexo: *si* (interrogativa indirecta total).

**2.** *Me molesta que no me escuches.*
> *Me molesta **eso*** ✅. Prueba de sujeto: *Me molestan **esas cosas*** → concuerda → **Sujeto**.

**3.** *Tendemos a adoptarlas antes de entender sus efectos.*
> *entender sus efectos* → *antes de **eso*** ✅ → sustantiva de **infinitivo**, término del SPrep que funciona como **CCT**.

**4.** *No sabemos si es deseable.*
> *No sabemos **eso*** ✅ → **CD**. Interrogativa indirecta total.

**5.** *El problema es que nadie responde.*
> *El problema es **eso*** ✅ → sustituible por *lo*: *El problema **lo** es* → **Atributo**.

**Cuidado con el sujeto:** las sustantivas de sujeto son frecuentes con verbos como *gustar, molestar, parecer, convenir, ser* + adjetivo (*Es evidente que…*).`,
    practice_prompt: 'Identifica la proposición subordinada sustantiva y su función en: (a) "Me alegra que hayas venido"; (b) "Ignoro dónde vive"; (c) "Tengo ganas de que llegue el verano"; (d) "Su intención era ayudarnos".',
    alert_markdown: '⚠️ **No todo *que* introduce una sustantiva.** Si *que* es **pronombre relativo** (se puede sustituir por *el cual* y tiene antecedente), la proposición es **adjetiva**, no sustantiva. Prueba: sustituye por *eso*; si no funciona, no es sustantiva.',
  },

  {
    sort_order: 25,
    title: 'Subordinadas Adjetivas o de Relativo',
    concept_markdown: `## Proposiciones subordinadas adjetivas

Funcionan como un **adjetivo**: complementan a un sustantivo llamado **antecedente**. Siempre desempeñan la función de **CN** (complemento del nombre).

> *Perseguían un prestigio **que convertía cada logro en un impulso**.*
> (antecedente: *un prestigio*)

### Los nexos: pronombres, determinantes y adverbios relativos
*que, el cual, quien, cuyo, donde, cuando, como*

### La clave que casi nadie hace bien
El relativo **desempeña una función sintáctica dentro de su propia proposición**. Hay que indicarla siempre.

Para averiguarla, **sustituye el relativo por su antecedente**:
> *…que convertía cada logro…* → *el prestigio convertía cada logro* → *que* es **Sujeto**.
> *El libro **que** leí* → *leí el libro* → *que* es **CD**.
> *La casa **en la que** vivo* → *vivo en la casa* → **CCL**.

### Especificativas vs. explicativas

| | Especificativa | Explicativa |
|---|---|---|
| **Comas** | Sin comas | **Entre comas** |
| **Función** | Restringe el antecedente | Añade información |
| **Ejemplo** | *Los alumnos **que estudian** aprueban* (solo esos) | *Los alumnos, **que estudian**, aprueban* (todos) |

### Adjetivas sustantivadas
Sin antecedente expreso, van precedidas de artículo y funcionan como un SN:
> ***El que* madruga** ayuda. → Sujeto`,
    worked_example_markdown: `**Analiza estas subordinadas adjetivas:**

**1.** *Perseguían un prestigio que convertía cada logro en un impulso.*
> Antecedente: *un prestigio*. Nexo: *que*.
> Función de la proposición: **CN** de *prestigio*.
> Función del relativo: *el prestigio convertía…* → **Sujeto**.
> Tipo: **especificativa** (sin comas).

**2.** *Su compañía Meta, que lleva veinte años en el mercado, es un ejemplo.*
> Antecedente: *Meta*. Entre comas → **explicativa**.
> Función del relativo: *Meta lleva veinte años* → **Sujeto**.

**3.** *La ideología es lo que no se ve.*
> *lo que* → adjetiva **sustantivada** (sin antecedente expreso).
> Función: **Atributo** de *es*.

**4.** *La cueva donde se refugiaban estaba cerca.*
> Antecedente: *la cueva*. Nexo: *donde* (adverbio relativo).
> Función del relativo: *se refugiaban **en la cueva*** → **CCL**.

**5.** *El autor cuyo artículo leímos es periodista.*
> *cuyo* = determinante relativo posesivo. Función: **Det/CN** dentro del SN *cuyo artículo*, que es **CD** de *leímos*.`,
    practice_prompt: 'Analiza estas subordinadas adjetivas indicando antecedente, tipo (especificativa/explicativa) y función sintáctica del relativo dentro de su proposición: (a) "El coche que compré es rojo"; (b) "Mi hermano, que vive en Roma, vendrá"; (c) "La ciudad donde nací es pequeña".',
    alert_markdown: '⚠️ **Siempre hay que decir la función del relativo.** Escribir solo "subordinada adjetiva, CN de *prestigio*" deja media pregunta sin responder. El relativo *que* puede ser Sujeto, CD, CI, CC… dentro de su proposición.',
  },

  {
    sort_order: 26,
    title: 'Subordinadas Adverbiales Propias: Tiempo, Lugar y Modo',
    concept_markdown: `## Adverbiales propias

Son las que **equivalen a un adverbio** y funcionan como **complemento circunstancial** del verbo principal. Se llaman "propias" porque sí pueden sustituirse por un adverbio.

### 1. Temporales (CCT)
Indican **cuándo**. Se sustituyen por *entonces*.
**Nexos:** *cuando, mientras, apenas, en cuanto, antes de que, después de que, tan pronto como*
> *Se levantó **cuando notó el frío**.* → *Se levantó **entonces***

Pueden expresar **anterioridad** (*antes de que*), **simultaneidad** (*mientras*) o **posterioridad** (*después de que*).

### 2. Locativas (CCL)
Indican **dónde**. Se sustituyen por *allí*.
**Nexo:** *donde* (con o sin preposición)
> *Fue **donde estaban las cabras**.* → *Fue **allí***

### 3. Modales (CCM)
Indican **cómo**. Se sustituyen por *así*.
**Nexos:** *como, según, conforme, como si*
> *Lo hizo **como le habían enseñado**.* → *Lo hizo **así***

### El truco definitivo
**Sustituye por el adverbio correspondiente** (*entonces / allí / así*). Si la sustitución funciona, es adverbial propia y su función es la del CC correspondiente.`,
    worked_example_markdown: `**Analiza estas adverbiales propias:**

**1.** *Cuando notó que el viejo salía, le preguntó por la bacinilla.*
> Sustitución: ***Entonces**, le preguntó…* ✅
> **Subordinada adverbial temporal**, función **CCT**. Nexo: *cuando*.

**2.** *Al acercarse, vio a la Rubia.*
> *Al* + infinitivo con valor temporal → *Entonces vio a la Rubia* ✅
> **Adverbial temporal**, **CCT**.

**3.** *Volvió atrás en la oscuridad donde había dejado el recipiente.*
> *…**allí*** ✅ → **adverbial locativa**, **CCL**.

**4.** *La perra gruñía como si quisiera entrar.*
> *Gruñía **así*** ✅ → **adverbial modal**, **CCM**. Nexo: *como si* (con matiz irreal, verbo en subjuntivo).

**5.** *Mientras el viejo cruzaba el patio, la perra raspaba la puerta.*
> **Adverbial temporal de simultaneidad**, **CCT**.

**Ojo con *donde* y *cuando*:** si tienen **antecedente expreso**, son **adjetivas** (*la casa **donde** vivo*); si **no** lo tienen, son **adverbiales** (*Vive **donde** quiere*).`,
    practice_prompt: 'Clasifica estas adverbiales propias y sustitúyelas por el adverbio equivalente: (a) "Llegó cuando ya habíamos cenado"; (b) "Aparcó donde pudo"; (c) "Actúa según le conviene"; (d) "En cuanto lo supo, llamó".',
    alert_markdown: '⚠️ **Antecedente = adjetiva; sin antecedente = adverbial.** *Iré al pueblo **donde** naciste* → adjetiva (antecedente *pueblo*). *Iré **donde** quieras* → adverbial locativa. Es la distinción que más se falla.',
  },

  {
    sort_order: 27,
    title: 'Subordinadas Adverbiales Impropias',
    concept_markdown: `## Adverbiales impropias

**No** equivalen a un adverbio: expresan relaciones lógicas entre proposiciones. Muchas gramáticas las tratan como **circunstanciales de causa/fin** o como estructuras independientes, pero en la PAU se piden por su nombre.

| Tipo | Nexos | Ejemplo |
|---|---|---|
| **Causal** | *porque, ya que, puesto que, como, dado que* | *No salió **porque llovía*** |
| **Final** | *para que, a fin de que, a que* + subj. | *Vino **para que lo ayudaras*** |
| **Consecutiva** | *tan/tanto… que, así que, luego, por tanto* | *Gritó **tanto que se quedó ronco*** |
| **Condicional** | *si, siempre que, con tal de que, a menos que* | ***Si estudias**, aprobarás* |
| **Concesiva** | *aunque, a pesar de que, por más que, si bien* | ***Aunque llovía**, salió* |
| **Comparativa** | *más… que, menos… que, tan… como* | *Es **más alto que su hermano*** |

### Las que más se confunden

**Causal vs. final:** la causa es **anterior** al hecho y va en indicativo; la finalidad es **posterior** y va en **subjuntivo**.
> *Vino **porque lo llamaste*** (causa, indicativo)
> *Vino **para que lo llamaras*** (fin, subjuntivo)

**Condicional vs. concesiva:** la condicional pone un **requisito**; la concesiva expresa un **obstáculo que no impide** el cumplimiento.
> ***Si** llueve, no salgo* (requisito)
> ***Aunque** llueva, salgo* (obstáculo superado)`,
    worked_example_markdown: `**Analiza estas adverbiales impropias:**

**1.** *Soltó una maldición al notar en los pies el frío suelo.*
> *al notar* = causa (*porque notó*) → **adverbial causal**.

**2.** *Volvió atrás para coger el recipiente de loza.*
> *para* + infinitivo → **adverbial final**, **CCF**.

**3.** *La perra rabió tanto que despertó a todos.*
> *tanto… que* → **adverbial consecutiva**. La consecuencia se deriva de la intensidad.

**4.** *Si partimos de la base de que a todos nos han construido otros, el todo es relativo.*
> *Si* → **adverbial condicional**. La proposición condicional es la **prótasis**; la principal, la **apódosis**.

**5.** *Aunque tenía muchas ganas de verlos, renunció a la comida.*
> *Aunque* → **adverbial concesiva**. Expresa una objeción que no impide el cumplimiento de la principal.

**6.** *No renunciaron a nada: renunciaron a mucho.*
> Aquí **no** hay subordinación: son **yuxtapuestas** con valor adversativo. Cuidado con leer relaciones lógicas donde no hay nexo subordinante.`,
    practice_prompt: 'Clasifica estas adverbiales impropias: (a) "Como no vino, empezamos sin él"; (b) "Trabaja para que sus hijos estudien"; (c) "Estaba tan cansado que se durmió"; (d) "Por más que insistas, no iré"; (e) "Te ayudaré siempre que me lo pidas".',
    alert_markdown: '⚠️ ***Como* tiene tres valores.** Modal (*Hazlo **como** te dije*), causal (***Como** llovía, no salí* — al principio y con coma) y condicional (***Como** no vengas, me enfado* — con subjuntivo). El contexto lo decide.',
  },

  {
    sort_order: 28,
    title: 'Los Valores de SE',
    concept_markdown: `## Los ocho valores de SE

Pregunta clásica de PAU. La clave es preguntarse siempre: **¿tiene función sintáctica o no?**

### A. SE con función sintáctica (es un pronombre)

**1. CI (variante de *le/les*)**
Cuando va seguido de otro pronombre de CD.
> *Le di el libro → **Se** lo di.* → **CI**

**2. Reflexivo**
El sujeto realiza y recibe la acción. Admite *a sí mismo*.
> *El viejo **se** lavó (a sí mismo).* → **CD** (o **CI** si hay otro CD: *Se lavó las manos*)

**3. Recíproco**
Dos o más sujetos intercambian la acción. Admite *el uno al otro*.
> *Los amigos **se** saludaron.* → **CD**

### B. SE sin función sintáctica

**4. Morfema de verbo pronominal**
El verbo lo exige siempre: *arrepentirse, atreverse, quejarse*.
> *Quiterita **se** quejó.* → **morfema**, sin función.

**5. Dativo ético o de interés**
Aporta énfasis y **se puede suprimir**.
> *Se comió toda la tarta* → *Comió toda la tarta* ✅ → **dativo ético**

**6. Pasiva refleja**
*se* + verbo en 3ª persona **que concuerda con un sujeto paciente** (normalmente inanimado).
> ***Se penalizarán** los errores.* (= los errores serán penalizados) → **morfema de pasiva refleja**

**7. Impersonal refleja**
*se* + verbo en **3ª persona del singular** sin sujeto posible.
> ***Se vive** bien aquí.* → **morfema de impersonalidad**

### Pasiva refleja vs. impersonal: la prueba
Ponlo en **plural**. Si el verbo concuerda, es **pasiva refleja**; si no puede, es **impersonal**.
> *Se vende **piso*** → *Se vend**en** pisos* ✅ → pasiva refleja
> *Se habla de política* → *\\*Se hablan de políticas* ❌ → impersonal`,
    worked_example_markdown: `**Identifica el valor de SE:**

**1.** *El viejo se incorporó hasta sentarse.*
> *incorporarse* funciona como pronominal aquí (cambio de postura) → **morfema de verbo pronominal**, sin función sintáctica.

**2.** *Se lo dijo a su mujer.*
> Va seguido de *lo* (CD) → *se* = *le* → **CI**.

**3.** *Se penalizarán los errores repetidos.*
> Plural: el verbo concuerda con *los errores* → **pasiva refleja**. *Los errores* = sujeto paciente.

**4.** *Se contabilizará desde la primera falta.*
> Sujeto singular implícito o construcción impersonal; no admite plural con sentido → **impersonal refleja**.

**5.** *Los dos hermanos se pegaban continuamente.*
> Admite *el uno al otro* → **recíproco**, función **CD**.

**6.** *Quiterita se quejó del ruido.*
> *quejarse* es siempre pronominal → **morfema**, sin función.

**7.** *Se puso las botas.*
> Reflexivo con otro CD (*las botas*) → *se* = **CI** (se las puso a sí mismo).

**El orden en que hay que preguntarse:** ¿va con otro pronombre? (CI) → ¿admite *a sí mismo*? (reflexivo) → ¿*el uno al otro*? (recíproco) → ¿el verbo lo exige siempre? (morfema) → ¿se puede suprimir? (dativo) → ¿concuerda en plural? (pasiva refleja) → si no, impersonal.`,
    practice_prompt: 'Indica el valor de SE en cada oración y su función sintáctica si la tiene: (a) "Se arrepintió de todo"; (b) "Se venden coches usados"; (c) "María se peina"; (d) "Se lo entregué ayer"; (e) "Se come muy bien en este bar"; (f) "Se bebió tres cafés".',
    alert_markdown: '⚠️ **Pasiva refleja e impersonal se distinguen por la concordancia, no por el sentido.** *Se buscan camareros* (concuerda → pasiva refleja, *camareros* es sujeto). *Se busca a los culpables* (no concuerda, lleva *a* → impersonal, *a los culpables* es CD).',
  },

  {
    sort_order: 29,
    title: 'Las Perífrasis Verbales',
    concept_markdown: `## Perífrasis verbal

Unión de un **verbo auxiliar** (que pierde su significado pleno) + **nexo opcional** + un **verbo en forma no personal** (infinitivo, gerundio o participio). Entre los dos forman **un solo núcleo del predicado**.

> ***Tendemos a adoptar** las innovaciones.* → un solo núcleo: *tendemos a adoptar*

### Cómo se reconoce
El verbo auxiliar **no significa lo que significaría solo**:
> *Voy a estudiar* → no hay movimiento (perífrasis)
> *Voy a Madrid* → sí hay movimiento (verbo pleno + CCL)

### Clasificación

**A. Modales** (expresan actitud del hablante)

| Valor | Perífrasis |
|---|---|
| **Obligación** | *tener que + inf.*, *deber + inf.*, *haber de + inf.*, *hay que + inf.* |
| **Probabilidad** | *deber de + inf.*, *poder + inf.* |
| **Posibilidad/capacidad** | *poder + inf.* |

**B. Aspectuales** (expresan el desarrollo de la acción)

| Valor | Perífrasis |
|---|---|
| **Ingresiva** (a punto de) | *ir a + inf.*, *estar a punto de + inf.* |
| **Incoativa** (inicio) | *empezar a + inf.*, *ponerse a + inf.* |
| **Durativa** (en curso) | *estar + ger.*, *seguir + ger.*, *andar + ger.* |
| **Terminativa** (fin) | *acabar de + inf.*, *dejar de + inf.*, *terminar de + inf.* |
| **Reiterativa** | *volver a + inf.* |
| **Resultativa** | *tener + part.*, *llevar + part.*, *dejar + part.* |

### La distinción crítica
***Deber + infinitivo*** = obligación (*Debes estudiar*).
***Deber de + infinitivo*** = probabilidad (*Debe de tener veinte años*).`,
    worked_example_markdown: `**Distingue perífrasis de construcciones libres:**

**1.** *Tendemos a adoptarlas a toda prisa.*
> *tender a* no significa "extender" → **perífrasis modal**. Núcleo: *tendemos a adoptar*.

**2.** *Volvió atrás para coger el recipiente.*
> *volver* mantiene su significado de movimiento → **no es perífrasis**. *atrás* = CCL.

**3.** *Volvió a llamar por teléfono.*
> *volver a* = repetición, no movimiento → **perífrasis reiterativa**.

**4.** *La perra continuó ladrando.*
> **Perífrasis aspectual durativa**. Núcleo: *continuó ladrando*.

**5.** *Se puso a dar saltos.*
> **Perífrasis incoativa**. Ojo: *dar saltos* dentro de ella es una locución verbal.

**6.** *Hay que entender sus efectos.*
> **Perífrasis modal de obligación impersonal**.

**7.** *Está cansado.*
> *estar* + adjetivo, no participio verbal → **no es perífrasis**: es predicado nominal con atributo.

**La prueba definitiva:** si puedes sustituir la forma no personal por un pronombre (*lo*), **no** es perífrasis: *Quiero **estudiar*** → *Lo quiero* ✅ (no es perífrasis, es CD). *Tengo que **estudiar*** → *\\*Lo tengo que* ❌ (sí es perífrasis).`,
    practice_prompt: 'Localiza las perífrasis verbales y clasifícalas: (a) "Debes de estar cansado"; (b) "Acabo de llegar"; (c) "Voy a la biblioteca"; (d) "Sigue lloviendo"; (e) "Tengo escritos tres capítulos"; (f) "Empezó a llover".',
    alert_markdown: '⚠️ **La perífrasis es UN SOLO núcleo del predicado.** En el análisis sintáctico no se separan: *tenía que estudiar* se subraya entero como núcleo. Partirlo es uno de los errores que más penalizan.',
  },

  {
    sort_order: 30,
    title: 'Método Completo de Análisis Sintáctico',
    concept_markdown: `## El orden que hay que seguir siempre

La pregunta 2.1 vale **1,4 puntos**: es la más cara del bloque 2 y aparece en 57 de los exámenes analizados. Se resuelve con un método fijo.

### Los siete pasos

**1. Localiza los verbos en forma personal.**
Tantos verbos → tantas proposiciones. Marca las **perífrasis** como un solo núcleo.

**2. Localiza los nexos.**
Conjunciones, relativos, interrogativos. Delimita dónde empieza y acaba cada proposición.

**3. Decide el tipo de relación.**
¿Coordinación, yuxtaposición o subordinación?

**4. En la principal, busca el sujeto.**
Cambia el número del verbo. Si no hay, indica *Suj. omitido* o *impersonal*.

**5. Analiza el predicado.**
¿Nominal (copulativo + atributo) o verbal?

**6. Identifica los complementos por orden de pruebas:**
> CD (*lo/la*) → CI (*le*) → CRég (*prep. + eso*, no suprimible) → Atrib (*lo*) → CPvo (concuerda) → CAg (pasiva, *por*) → CC (suprimible)

**7. Clasifica la oración completa** según modalidad y naturaleza del predicado.

### Cómo se presenta
Marca los sintagmas con corchetes y escribe **debajo** de cada uno su **función**, y **encima** su **tipo**. Termina con la clasificación en una frase.`,
    worked_example_markdown: `**Analiza:** *Perseguían un prestigio que convertía cada logro en un impulso.*

**Paso 1 — verbos:** *perseguían* y *convertía* → **dos proposiciones**.

**Paso 2 — nexo:** *que*, pronombre relativo con antecedente *un prestigio*.

**Paso 3 — relación:** **subordinación adjetiva**.

**Paso 4-6 — análisis:**

**Proposición principal:** *Perseguían un prestigio [que convertía…]*
- **Suj:** omitido (*ellos*)
- **SV / Predicado Verbal:** *Perseguían un prestigio que convertía cada logro en un impulso*
  - **N:** *Perseguían*
  - **SN / CD:** *un prestigio que convertía cada logro en un impulso*
    - **Det:** *un*
    - **N:** *prestigio*
    - **Prop. Sub. Adjetiva / CN:** *que convertía cada logro en un impulso*

**Dentro de la subordinada:**
- **Nx / Suj:** *que* (= *el prestigio*, por eso es sujeto)
- **N:** *convertía*
- **SN / CD:** *cada logro*
- **SPrep / CRég:** *en un impulso* (*convertir **en*** exige la preposición)

**Paso 7 — clasificación:**
> *Oración compuesta por subordinación adjetiva especificativa. La principal es **enunciativa afirmativa, predicativa activa transitiva**, con sujeto omitido.*`,
    practice_prompt: 'Analiza sintácticamente siguiendo los siete pasos: "El viejo se incorporó hasta sentarse y soltó una maldición al notar en los pies el frío suelo de cemento". Indica tipo y función de cada sintagma y clasifica la oración.',
    alert_markdown: '⚠️ **Empieza siempre por contar los verbos, nunca por el principio de la frase.** Analizar linealmente de izquierda a derecha es lo que hace que la gente se pierda en oraciones largas.',
  },

  // ─── MORFOLOGÍA (31-35) ─────────────────────────────────────────────────────

  {
    sort_order: 31,
    title: 'Las Categorías Gramaticales (Clases de Palabras)',
    concept_markdown: `## Las nueve categorías

Pregunta habitual de 0,8 puntos: *"Indique a qué categoría gramatical pertenece X"*.

### Variables (admiten morfemas flexivos)

| Categoría | Qué expresa | Flexión |
|---|---|---|
| **Sustantivo** | Entidades | Género y número |
| **Adjetivo** | Cualidades | Género, número, grado |
| **Determinante** | Actualiza al sustantivo | Género y número |
| **Pronombre** | Sustituye al SN | Género, número, persona, caso |
| **Verbo** | Acciones, estados | Persona, número, tiempo, modo, aspecto |

### Invariables

| Categoría | Función |
|---|---|
| **Adverbio** | Modifica verbo, adjetivo u otro adverbio |
| **Preposición** | Enlace subordinante |
| **Conjunción** | Enlace coordinante o subordinante |
| **Interjección** | Expresa emoción o apela |

### El método para acertar
No te fíes del significado: fíjate en el **comportamiento**.
1. ¿Admite **artículo** delante? → sustantivo
2. ¿Admite **muy** delante o *-ísimo*? → adjetivo o adverbio
3. ¿**Concuerda** con un sustantivo? → adjetivo o determinante
4. ¿Es **invariable** y modifica al verbo? → adverbio

### Trampa frecuente: la misma palabra, distinta categoría
> ***Bajo*** *el puente* → preposición
> *Un tono **bajo*** → adjetivo
> *Yo **bajo** la escalera* → verbo
> *Habla **bajo*** → adverbio`,
    worked_example_markdown: `**Pregunta tipo PAU:** *Indique a qué categoría gramatical pertenece "predominante", analice su estructura morfológica y señale a qué proceso de formación de palabras responde.*

**Respuesta completa:**

> ***Categoría gramatical:*** *"Predominante" es un **adjetivo** calificativo. Lo demuestra que concuerda en número con el sustantivo al que acompaña y que admite gradación (*muy predominante*).*
>
> ***Estructura morfológica:*** *se descompone en el lexema **domin-**, más el prefijo **pre-** y el sufijo **-ante**, que forma adjetivos a partir de verbos con valor de agente o de acción en curso: **pre- + domin- + -ante**.*
>
> ***Proceso de formación:*** *responde a la **parasíntesis** por prefijación y sufijación simultáneas, ya que no existen en español ni \\*predominar sin el sufijo como adjetivo ni \\*dominante con el mismo valor derivado directamente. Alternativamente, puede analizarse como **derivación** a partir del verbo *predominar* mediante el sufijo *-ante*.*

**Fíjate:** la pregunta tiene **tres partes** y cada una puntúa. Responder solo "es un adjetivo" deja dos tercios sin contestar.`,
    practice_prompt: 'Indica la categoría gramatical de la palabra "bajo" en cada contexto y justifícala: (a) "El niño es bajo"; (b) "Está bajo la mesa"; (c) "Bajo las escaleras corriendo"; (d) "Habla más bajo".',
    alert_markdown: '⚠️ **La categoría depende del contexto, no de la palabra aislada.** Nunca respondas de memoria: comprueba cómo funciona *en esa frase concreta*.',
  },

  {
    sort_order: 32,
    title: 'Estructura Morfológica: Lexema y Morfemas',
    concept_markdown: `## Los componentes de la palabra

### Lexema (o raíz)
Aporta el **significado léxico**. Es la parte común a toda una familia:
> *pan*, *panadero*, *panadería*, *empanada* → lexema **pan-**

### Morfemas
Aportan significado gramatical. Se dividen en dos grandes grupos:

**A. Flexivos (desinencias)**
**No** crean palabras nuevas, solo variantes de la misma:
- **De género:** *niñ-**o*** / *niñ-**a***
- **De número:** *niño-**s***
- **Verbales:** vocal temática + tiempo/modo + persona/número: *cant-**a-ba-mos***

**B. Derivativos (afijos)**
**Sí** crean palabras nuevas:
- **Prefijos** (delante): ***re**-leer*, ***in**-útil*, ***pre**-ver*
- **Sufijos** (detrás): *pan-**adero***, *libr-**ería***
- **Interfijos** (de enlace, sin significado): *pan-**ec**-illo*, *polv-**ar**-eda*

### Los sufijos apreciativos
No cambian la categoría, añaden **valoración**:
- **Diminutivos:** *-ito, -illo, -ín* → *salvaj-**ito*** (afectivo)
- **Aumentativos:** *-ón, -azo, -ote*
- **Despectivos:** *-ucho, -aco, -ejo*

Comentarlos suma en el bloque 1: revelan la **subjetividad** del emisor.

### Cómo se presenta el análisis
> ***Desafortunadamente*** *= des- (pref.) + a- (pref.) + fortun- (lexema) + -ada (suf.) + -mente (suf.)*`,
    worked_example_markdown: `**Analiza la estructura morfológica de estas palabras:**

**1. *Salvajito***
> *salvaj-* (lexema) + *-ito* (sufijo apreciativo diminutivo) + *-o* (morfema flexivo de género masculino)
> **Valor:** el diminutivo no indica tamaño sino **afecto**; Quiterita reprocha con cariño.

**2. *Inteligencia***
> *intelig-* (lexema) + *-encia* (sufijo derivativo que forma sustantivos abstractos) + *-a* (flexivo de género)

**3. *Enarbolan***
> *en-* (prefijo) + *arbol-* (lexema) + *-a-* (vocal temática, 1ª conjugación) + *-n* (flexivo de 3ª persona plural, presente indicativo)

**4. *Desconocimiento***
> *des-* (prefijo negativo) + *conoc-* (lexema) + *-i-* (vocal temática) + *-miento* (sufijo nominalizador)

**5. *Panecillo***
> *pan-* (lexema) + *-ec-* (**interfijo**, sin significado, solo enlaza) + *-illo* (sufijo diminutivo) + *-o* (flexivo)

**Regla para no fallar:** localiza primero el **lexema** buscando palabras de la misma familia. Lo que queda a la izquierda son prefijos; a la derecha, sufijos y desinencias.`,
    practice_prompt: 'Analiza la estructura morfológica indicando lexema, prefijos, sufijos, interfijos y morfemas flexivos: (a) "reconstrucción"; (b) "cabecita"; (c) "antinaturales"; (d) "corríamos".',
    alert_markdown: '⚠️ **Flexivo ≠ derivativo.** *Niñas* y *niño* son **la misma palabra** (morfemas flexivos); *niñera* es una **palabra nueva** (morfema derivativo). En el diccionario solo aparece una entrada para los flexivos.',
  },

  {
    sort_order: 33,
    title: 'La Derivación',
    concept_markdown: `## Derivación

Proceso de formación de palabras que añade **afijos derivativos** a un lexema. Es el mecanismo más productivo del español.

### Por prefijación
El prefijo va delante y **no suele cambiar la categoría**:

| Prefijo | Valor | Ejemplo |
|---|---|---|
| *in-, des-, a-* | Negación | *in-útil*, *des-hacer* |
| *re-* | Repetición | *re-leer* |
| *pre-, ante-* | Anterioridad | *pre-ver* |
| *pos-* | Posterioridad | *pos-guerra* |
| *sub-, infra-* | Inferioridad | *sub-suelo* |
| *super-, sobre-* | Superioridad | *super-dotado* |
| *anti-, contra-* | Oposición | *anti-virus* |
| *co-* | Compañía | *co-autor* |

### Por sufijación
El sufijo va detrás y **normalmente sí cambia la categoría**:

| Sufijo | Crea | Ejemplo |
|---|---|---|
| *-ción, -miento, -dad, -ez, -ura* | Sustantivos | *creación*, *bondad* |
| *-oso, -able, -al, -ante* | Adjetivos | *famoso*, *amable* |
| *-mente* | Adverbios | *rápidamente* |
| *-izar, -ificar, -ear* | Verbos | *modernizar* |

### Los cuatro tipos de sustantivos derivados
- **Deverbales** (de verbo): *construc-ción*
- **Deadjetivales** (de adjetivo): *bell-eza*
- **Denominales** (de sustantivo): *pan-adería*

### Cómo se responde
Indica **de qué palabra deriva**, **qué afijo** se añade y **qué categoría** resulta:
> *"Innovación" deriva del verbo* innovar *mediante el sufijo* -ción*, que forma sustantivos deverbales de acción.*`,
    worked_example_markdown: `**Analiza el proceso de derivación:**

**1. *Disruptivo***
> Deriva del sustantivo latino *disrupción* / de la base *disrupt-* mediante el sufijo **-ivo**, que forma **adjetivos** a partir de bases verbales o nominales indicando "que produce" o "relativo a".

**2. *Precipitada***
> Base verbal *precipitar* + sufijo de **participio -ada**, que aquí funciona como **adjetivo**. Nótese que *precipitar* ya contiene el prefijo *pre-* lexicalizado.

**3. *Autodeterminación***
> *auto-* (prefijo de origen griego, 'por sí mismo') + *determin-* (lexema) + *-ción* (sufijo nominalizador deverbal).
> Doble proceso: **prefijación + sufijación**.

**4. *Fulgurante***
> Del verbo *fulgurar* + sufijo **-ante**, que forma adjetivos con valor de agente o acción en curso ("que fulgura").

**5. *Sancocho*** (del texto de Ravelo)
> De *cocho* (part. de *cocer*) + prefijo intensificador. Ejemplo de derivación con base verbal patrimonial.

**El formato de respuesta que puntúa:** *"X deriva de [palabra base, indicando su categoría] mediante [afijo], que forma [categoría resultante] con valor de [significado]".*`,
    practice_prompt: 'Explica el proceso de derivación de estas palabras indicando base, afijo, categoría de origen y categoría resultante: (a) "envejecimiento"; (b) "imprescindible"; (c) "claramente"; (d) "informatizar".',
    alert_markdown: null,
  },

  {
    sort_order: 34,
    title: 'Composición, Parasíntesis y Otros Procesos',
    concept_markdown: `## Composición

Unión de **dos o más lexemas** en una sola palabra.

| Tipo | Ejemplo |
|---|---|
| **Propia** (gráficamente unidas) | *saca + corchos* → *sacacorchos* |
| **Sintagmática** (separadas o con guion) | *guardia civil*, *físico-químico* |
| **Culta** (lexemas griegos o latinos) | *biblio + teca*, *tele + visión* |

## Parasíntesis

Hay **dos casos distintos** y ambos caen en PAU:

**1. Prefijo + lexema + sufijo simultáneamente**, sin que existan los pasos intermedios:
> *en- + roj- + -ecer* → ***enrojecer***
> (no existen *\\*enrojo* ni *\\*rojecer*)

**2. Composición + derivación a la vez:**
> *pica + pedr- + -ero* → ***picapedrero***

### La prueba de la parasíntesis
Quita el prefijo: ¿existe la palabra? Quita el sufijo: ¿existe?
Si **ninguna de las dos** existe → **parasíntesis**.
> *desalmado*: ¿*\\*desalma*? ❌ ¿*\\*almado*? ❌ → parasintética
> *desconfianza*: ¿*confianza*? ✅ → solo derivación por prefijación

## Otros procesos

| Proceso | En qué consiste | Ejemplo |
|---|---|---|
| **Acronimia** | Fusión de segmentos de dos palabras | *ofi(cina) + (in)formática* → *ofimática* |
| **Siglas** | Iniciales que se leen letra a letra | *ONG*, *IA* |
| **Acrónimo (sigla)** | Siglas leídas como palabra | *ovni*, *OTAN*, *láser* |
| **Acortamiento** | Reducción de la palabra | *profe*, *bici*, *insti* |
| **Préstamo** | Palabra tomada de otra lengua | *cool*, *software* |
| **Calco** | Traducción literal de un préstamo | *rascacielos* < *skyscraper* |`,
    worked_example_markdown: `**Identifica el proceso de formación:**

**1. *IA*** (del texto sobre inteligencia artificial)
> **Sigla**, formada por las iniciales de *inteligencia artificial*, que se lee deletreando.

**2. *Ofimática***
> **Acronimia**: fusión de *ofi(cina)* + *(infor)mática*.

**3. *Sancocho***
> **Composición** (*san-* < *salcochar*, de *sal* + *cocho*), lexicalizada.

**4. *Enrojecer***
> **Parasíntesis**: *en-* + *roj-* + *-ecer*, sin formas intermedias.

**5. *Cool*** (en "ser muy cool")
> **Préstamo** (anglicismo) no adaptado. Comentario estilístico: su uso en el texto es **irónico**, marca el registro de quienes emplean "disruptivo" como moda.

**6. *Bienestar*** (en "ley del bienestar animal")
> **Composición propia**: *bien* (adverbio) + *estar* (verbo).

**7. *Multimodal***
> **Derivación por prefijación**: prefijo culto *multi-* + adjetivo *modal*.

**Cuidado con la parasíntesis:** *desalmado* ✅ es parasintética; *desagradable* ❌ no lo es, porque *agradable* existe.`,
    practice_prompt: 'Indica el proceso de formación de: (a) "sacapuntas"; (b) "aterrizar"; (c) "ovni"; (d) "boli"; (e) "malhumorado"; (f) "wifi". Justifica los casos de parasíntesis con la prueba de los pasos intermedios.',
    alert_markdown: '⚠️ **La prueba de la parasíntesis es obligatoria.** No basta con decir "es parasintética": hay que demostrar que **ni** la forma con solo prefijo **ni** la forma con solo sufijo existen en español.',
  },

  {
    sort_order: 35,
    title: 'Análisis Morfológico Completo: Método',
    concept_markdown: `## Cómo se responde la pregunta de morfología (0,8 puntos)

El enunciado típico encadena **tres tareas**:
> *"Indique a qué categoría gramatical pertenece X, analice su estructura morfológica y señale a qué proceso de formación responde."*

### Los tres pasos, en orden

**Paso 1 — Categoría gramatical**
Di la categoría **y justifícala por su comportamiento**, no por su significado:
> *"Es un **adjetivo**, pues concuerda en género y número con el sustantivo y admite gradación."*

**Paso 2 — Estructura morfológica**
Segmenta la palabra separando cada elemento con guiones e **identifica cada uno**:
> *"in- (prefijo negativo) + oper- (lexema) + -ante (sufijo adjetivador) + -s (morfema flexivo de número)"*

**Paso 3 — Proceso de formación**
Nombra el proceso **y demuéstralo**:
> *"Responde a la **derivación** por prefijación y sufijación. No es parasíntesis porque *operante* existe de forma independiente."*

### La checklist mental
1. ¿Cuál es el **lexema**? (busca palabras de la misma familia)
2. ¿Qué hay a la **izquierda**? → prefijos
3. ¿Qué hay a la **derecha**? → sufijos derivativos + morfemas flexivos
4. ¿Hay **dos lexemas**? → composición
5. ¿Prefijo y sufijo **a la vez** e imprescindibles? → parasíntesis`,
    worked_example_markdown: `**Pregunta:** *Indique la categoría gramatical de "desconcierto", analice su estructura morfológica y el proceso de formación.*

**Respuesta modelo:**

> ***Categoría:*** *"Desconcierto" es un **sustantivo** común, abstracto y masculino. Lo prueba que admite determinante (*el desconcierto*) y que puede desempeñar funciones propias del SN.*
>
> ***Estructura morfológica:*** *des- (prefijo de negación o inversión) + concert-/conciert- (lexema, con diptongación) + -o (morfema flexivo de género masculino, aquí también marca de sustantivo deverbal).*
>
> ***Proceso de formación:*** *se trata de **derivación**, concretamente de un **sustantivo deverbal** formado por **derivación regresiva** a partir del verbo *desconcertar*: en lugar de añadir un sufijo, se acorta la base verbal. No es parasíntesis, ya que *concierto* existe como palabra autónoma.*

**Otro ejemplo — *reflexión* (del bloque "Reflexión sobre la lengua"):**
> **Categoría:** sustantivo abstracto femenino.
> **Estructura:** *re-* (prefijo de reiteración, lexicalizado) + *flexi-* (lexema, del latín *flectere*) + *-ón* (sufijo nominalizador deverbal).
> **Proceso:** derivación por sufijación a partir de base verbal culta.

**Lo que distingue una respuesta de 0,8 de una de 0,4:** justificar cada uno de los tres apartados en vez de limitarse a nombrarlos.`,
    practice_prompt: 'Responde por completo (categoría + estructura + proceso) para las palabras "insoportable", "guardacostas" y "envejecimiento", justificando cada apartado como en el modelo.',
    alert_markdown: null,
  },

  // ─── SEMÁNTICA (36-39) ──────────────────────────────────────────────────────

  {
    sort_order: 36,
    title: 'Sinonimia y Antonimia',
    concept_markdown: `## Sinonimia

Relación entre palabras de **significante distinto y significado igual o muy parecido**.

### Tipos
- **Total (absoluta):** intercambiables en cualquier contexto. Es **rarísima**: *esposo / marido*, *burro / asno*.
- **Parcial (contextual):** solo son equivalentes en algunos contextos. Es la habitual.
> *listo / inteligente* ✅ en *un chico listo*
> ❌ en *estoy listo* (= preparado)

### Sinonimia referencial
Dos expresiones que designan la misma realidad sin significar lo mismo: *el autor de Hijos de la ira / Dámaso Alonso*.

## Antonimia

Relación de **oposición de significado**. Hay **tres tipos** y distinguirlos es lo que se pregunta:

| Tipo | En qué consiste | Ejemplo |
|---|---|---|
| **Graduales** | Admiten términos intermedios | *frío / (templado) / caliente* |
| **Complementarios** | Negar uno implica el otro; no hay grados | *vivo / muerto*, *legal / ilegal* |
| **Recíprocos** (inversos) | Uno implica al otro desde la perspectiva contraria | *comprar / vender*, *padre / hijo* |

### La prueba
- ¿Puedo poner *muy* o un término intermedio? → **gradual**
- ¿*No X* significa necesariamente *Y*? → **complementario**
- ¿Uno no puede existir sin el otro? → **recíproco**`,
    worked_example_markdown: `**Pregunta tipo PAU:** *Defina el concepto de antonimia y clasifique los siguientes pares.*

**Respuesta modelo:**

> *La **antonimia** es la relación semántica de oposición entre dos unidades léxicas. Se distinguen tres clases:*
>
> ***1. Frío / caliente*** *→ **antónimos graduales**, pues entre ambos existen términos intermedios (*templado*, *tibio*) y admiten gradación (*muy frío*, *bastante caliente*).*
>
> ***2. Vivo / muerto*** *→ **antónimos complementarios**: la negación de uno implica necesariamente la afirmación del otro (*no está vivo* = *está muerto*) y no admiten grados intermedios.*
>
> ***3. Comprar / vender*** *→ **antónimos recíprocos o inversos**: designan la misma acción desde perspectivas opuestas; si A compra a B, necesariamente B vende a A.*

**Aplicado a un texto:** en el artículo sobre la renuncia, *"No renunciaron a nada: renunciaron a mucho"* juega con la **antonimia gradual** *nada / mucho* para construir una **paradoja** que condensa la tesis. Relacionar semántica con figuras retóricas siempre suma.`,
    practice_prompt: 'Clasifica estos pares de antónimos justificando el tipo: (a) "alto/bajo"; (b) "presente/ausente"; (c) "profesor/alumno"; (d) "posible/imposible"; (e) "dar/recibir".',
    alert_markdown: '⚠️ **La sinonimia total casi no existe.** Si te piden un sinónimo, ofrece uno **y matiza el contexto** en que funciona. Decir que *cara* y *rostro* son sinónimos totales es inexacto: difieren en registro.',
  },

  {
    sort_order: 37,
    title: 'Polisemia y Homonimia',
    concept_markdown: `## Polisemia

**Una sola palabra** que ha desarrollado **varios significados relacionados** entre sí a partir de un origen común.

> ***Artículo***: 1) escrito periodístico, 2) mercancía, 3) categoría gramatical, 4) apartado de una ley.

Todos comparten un origen etimológico (*articulus*, 'parte, división').

**En el diccionario:** aparece **una sola entrada** con las acepciones numeradas.

## Homonimia

**Dos palabras distintas**, de **origen diferente**, que han coincidido en su forma.

> ***Banco*** (asiento, del germánico) / ***banco*** (entidad financiera, del italiano)
> ***Vino*** (bebida, de *vinum*) / ***vino*** (del verbo *venir*)

**En el diccionario:** aparecen **dos entradas distintas**.

### Tipos de homonimia

| Tipo | Definición | Ejemplo |
|---|---|---|
| **Homógrafas** | Se escriben **e** suenan igual | *haya* (árbol) / *haya* (verbo haber) |
| **Homófonas** | Suenan igual, se escriben distinto | *vaya / valla / baya*; *hola / ola* |

### Cómo se distinguen polisemia y homonimia
**El criterio es el origen etimológico**, no la intuición:
- ¿Los significados están **relacionados**? → **polisemia**
- ¿Vienen de **palabras distintas** que coincidieron? → **homonimia**

Prueba práctica: **consulta el diccionario**. Una entrada con varias acepciones = polisemia. Varias entradas numeradas = homonimia.`,
    worked_example_markdown: `**Pregunta real de PAU 2026:** *Defina el concepto de polisemia y ejemplifíquelo con la palabra "artículo".*

**Respuesta modelo:**

> *La **polisemia** es el fenómeno semántico por el cual **una misma palabra** posee **varios significados relacionados entre sí**, surgidos por evolución a partir de un origen etimológico común. Se diferencia de la homonimia en que en esta última coinciden formalmente palabras de **procedencia distinta**.*
>
> *La palabra **"artículo"** es un claro ejemplo de polisemia, pues presenta al menos cuatro acepciones vinculadas entre sí:*
> 1. ***Escrito publicado en un periódico***: "el artículo de Juan Soto Ivars".
> 2. ***Mercancía u objeto de comercio***: "artículos de primera necesidad".
> 3. ***Clase de palabra que determina al sustantivo***: "el artículo determinado".
> 4. ***Cada una de las divisiones de una ley o reglamento***: "el artículo 27 de la Constitución".
>
> *Todas proceden del latín* articulus *('pequeña articulación, parte, división'), de donde deriva la idea común de **parte o unidad de un conjunto**, presente en las cuatro acepciones.*

**Lo que puntúa:** definir, **contrastar con la homonimia**, dar varias acepciones y **explicar el vínculo etimológico** que las une.`,
    practice_prompt: 'Explica si estos casos son de polisemia u homonimia y justifícalo: (a) "hoja" (de árbol / de papel); (b) "llama" (fuego / animal / verbo llamar); (c) "sierra" (herramienta / montaña); (d) "cabo" (militar / geográfico / extremo).',
    alert_markdown: '⚠️ **Explica siempre el vínculo entre las acepciones.** Enumerar los cuatro significados de *artículo* sin decir que todos vienen de la idea de "parte" no demuestra que has entendido qué es la polisemia.',
  },

  {
    sort_order: 38,
    title: 'Hiperonimia, Hiponimia y Campo Semántico',
    concept_markdown: `## Hiperonimia e hiponimia

Relación **jerárquica de inclusión** entre significados.

- **Hiperónimo:** término **general** que engloba a otros. Su significado está **incluido en** el de sus hipónimos.
- **Hipónimo:** término **específico** incluido en el anterior.
- **Cohipónimos:** hipónimos que comparten el mismo hiperónimo.

> **Hiperónimo:** *animal*
> **Hipónimos:** *perro*, *cabra*, *caballo* (cohipónimos entre sí)

### La prueba
> *"Un perro es un tipo de animal"* ✅ → *animal* es hiperónimo de *perro*
> *"Un animal es un tipo de perro"* ❌

### Es relativo
Una palabra puede ser hiperónimo e hipónimo a la vez según con qué se compare:
> *ser vivo* > **animal** > *perro* > *galgo*

### Para qué sirve en el comentario
La sustitución de un término por su hiperónimo es un **mecanismo de cohesión** (recurrencia semántica) que evita la repetición:
> *La **Rubia** ladraba. El **animal** no se calmaba.*

## Campo semántico

Conjunto de palabras de la **misma categoría gramatical** que comparten un rasgo de significado (**sema**) y se reparten un área de la realidad.
> *Campo del mobiliario:* silla, mesa, sofá, taburete

## Familia léxica (no confundir)
Palabras que comparten el **mismo lexema**, aunque sean de distinta categoría:
> *pan, panadero, panadería, empanar*`,
    worked_example_markdown: `**Pregunta tipo PAU:** *Localice en el texto dos ejemplos de hiponimia e indique cuál es su hiperónimo.*

**Aplicado al fragmento de Ravelo (la perra, las cabras, el corral):**

> *En el texto aparecen los hipónimos **"perra"** y **"cabras"**, cuyo **hiperónimo** común es **"animal"**: el significado de ambos incluye todos los rasgos de *animal* más los rasgos específicos que los distinguen (*canino/doméstico* frente a *caprino/de granja*). Son, por tanto, **cohipónimos** entre sí.*
>
> *Puede señalarse también el par **"orinal" / "bacinilla"**, que en este caso no constituye hiponimia sino **sinonimia parcial** con diferencia de registro, mecanismo con el que el autor caracteriza el habla de los personajes.*

**Otro ejemplo, distinguiendo campo semántico de familia léxica:**
> *Campo semántico de la vivienda rural en el texto:* alcoba, patio, corral, letrina, camastro *(todos sustantivos, comparten el sema 'parte de la vivienda').*
> *Familia léxica de* orina*:* orinal, orinar, orines *(comparten el lexema* orin-*).*

**El error a evitar:** confundir campo semántico (mismo **significado** compartido, distinto lexema) con familia léxica (mismo **lexema**, distinto significado).`,
    practice_prompt: 'Localiza en un texto narrativo tres hipónimos y determina su hiperónimo. Después construye un campo semántico de cinco palabras y una familia léxica de cuatro, explicando la diferencia entre ambos conceptos.',
    alert_markdown: '⚠️ **Campo semántico ≠ familia léxica.** *Silla, mesa, sofá* forman un **campo semántico** (mismo ámbito, lexemas distintos). *Pan, panadero, panadería* forman una **familia léxica** (mismo lexema). Es una confusión que se penaliza siempre.',
  },

  {
    sort_order: 39,
    title: 'Denotación, Connotación y Cambios de Significado',
    concept_markdown: `## Denotación y connotación

- **Denotación:** significado **objetivo**, el del diccionario, común a todos los hablantes.
- **Connotación:** significados **añadidos** de carácter subjetivo, afectivo o cultural.

> ***Perro***
> **Denotación:** mamífero cánido doméstico.
> **Connotación:** fidelidad (positiva) / desprecio en *"vida de perros"* (negativa).

### Por qué importa en el comentario
El **lenguaje connotativo** es la marca de la subjetividad. En un texto argumentativo, señalar que el autor elige términos connotados en vez de neutros es un hallazgo que puntúa:
> *"El autor no dice* empresas *sino* gigantes tecnológicos*, término con connotaciones de desmesura y amenaza."*

## Cambios semánticos

Los significados evolucionan. Las causas y los mecanismos también se preguntan:

### Causas
- **Históricas:** la realidad cambia pero la palabra permanece (*pluma* de ave → de escribir)
- **Sociales:** una palabra pasa de un grupo a otro (*faena* del campo → del toreo)
- **Psicológicas:** **tabú** y **eufemismo** (*morir* → *fallecer*, *pasar a mejor vida*)

### Mecanismos
- **Metáfora:** por semejanza (*la **falda** de la montaña*)
- **Metonimia:** por contigüidad (*tomar una **copa*** = su contenido)
- **Sinécdoque:** la parte por el todo (*diez **cabezas** de ganado*)
- **Elipsis:** *(teléfono) móvil*

### Ampliación y restricción
- **Ampliación:** el término gana significados (*azafata*: criada de la reina → de vuelo, de congresos)
- **Restricción:** los pierde (*sabor*: cualquier sensación → solo gustativa)`,
    worked_example_markdown: `**Análisis de connotación en un texto:**

> *El autor emplea el término **"disruptivo"** aprovechando el choque entre su **denotación** —"que produce rotura o interrupción brusca", según la RAE— y las **connotaciones positivas** que ha adquirido en el discurso empresarial, donde funciona como sinónimo de innovación y vanguardia.*
>
> *Precisamente en esa distancia se sustenta la **ironía** del texto: al recordar el significado denotativo, el autor desactiva las connotaciones favorables y revela que se está celebrando, literalmente, la capacidad de romper cosas.*
>
> *Refuerza este juego el uso de **comillas** en "disruptivo", marca tipográfica de distancia crítica, y el anglicismo **"cool"**, cuyas connotaciones de modernidad superficial el autor emplea con evidente sarcasmo.*

**Ejemplos de cambio semántico en el mismo texto:**
- ***Vanguardia***: militar ('parte delantera del ejército') → artística e ideológica. **Metáfora**.
- ***Meta*** (empresa): del griego 'más allá'. **Préstamo culto con ampliación**.
- ***Algoritmo***: matemático → sistema de recomendación digital. **Ampliación de significado** por causa histórica.

**El patrón de análisis:** denotación → connotación → **efecto buscado por el autor**.`,
    practice_prompt: 'Analiza las connotaciones de estas palabras en un texto periodístico: "régimen", "recorte", "ajuste", "flexibilización". Explica por qué un emisor elegiría unas u otras para referirse a la misma realidad.',
    alert_markdown: '⚠️ **El eufemismo es una decisión ideológica.** Cuando un texto dice *flexibilización laboral* en vez de *despido más barato*, señalarlo demuestra lectura crítica. Es el tipo de observación que distingue un comentario notable.',
  },

  // ─── VARIEDADES (40) ────────────────────────────────────────────────────────

  {
    sort_order: 40,
    title: 'Las Lenguas de España y las Variedades del Español',
    concept_markdown: `## Las lenguas oficiales de España

Según el **artículo 3 de la Constitución de 1978**, el **castellano** es la lengua oficial del Estado. Las demás lenguas españolas son **cooficiales** en sus respectivas comunidades:

| Lengua | Territorio |
|---|---|
| **Catalán** | Cataluña, Islas Baleares, Comunidad Valenciana (como *valenciano*) |
| **Gallego** | Galicia |
| **Euskera** | País Vasco y norte de Navarra |
| **Aranés** (occitano) | Valle de Arán (Cataluña) |

**Clave histórica:** catalán, gallego y castellano son **lenguas románicas** (proceden del latín); el **euskera no lo es**: es una lengua preindoeuropea de origen desconocido, la única que **sobrevivió a la romanización**.

### Dialectos, no lenguas
El **astur-leonés** (bable) y el **aragonés** (fabla) son **dialectos históricos del latín**, no lenguas oficiales.

## Bilingüismo y diglosia
- **Bilingüismo:** dos lenguas conviven **en igualdad** de prestigio y usos.
- **Diglosia:** una lengua (**variedad alta**) se reserva para usos formales y la otra (**variedad baja**) para lo familiar. Implica **desequilibrio**.

## Variedades del castellano

### Dialectos septentrionales
Castellano del norte. Rasgos: **distinción** *s/z*, **leísmo**, *laísmo*.

### Dialectos meridionales
**Andaluz, extremeño, murciano, canario**:
- **Seseo** (*casa* y *caza* con /s/) y **ceceo** (ambos con /θ/)
- **Yeísmo**
- **Aspiración o pérdida de /-s/** final
- **Confusión de /l/ y /r/** implosivas

### Español de América
Seseo generalizado, **voseo** (*vos tenés*), *ustedes* por *vosotros*, léxico propio e indigenismos.`,
    worked_example_markdown: `**Pregunta real de PAU:** *Enumere las lenguas de España que tienen la consideración de oficiales.*

**Respuesta modelo:**

> *De acuerdo con el **artículo 3 de la Constitución española de 1978**, el **castellano** es la lengua española oficial del Estado y todos los españoles tienen el deber de conocerla y el derecho a usarla. Las demás lenguas españolas son también oficiales en sus respectivas Comunidades Autónomas conforme a sus Estatutos:*
>
> - ***Catalán***, *cooficial en Cataluña y las Islas Baleares, y en la Comunidad Valenciana bajo la denominación de **valenciano**.*
> - ***Gallego***, *cooficial en Galicia.*
> - ***Euskera***, *cooficial en el País Vasco y en la zona vascófona de Navarra.*
> - ***Aranés***, *variedad del occitano, oficial en el Valle de Arán.*
>
> *Debe precisarse que el **euskera** es la única de ellas que **no procede del latín**: se trata de una lengua preindoeuropea de origen incierto, la única lengua prerromana que sobrevivió al proceso de romanización de la Península.*

**Y si te preguntan por rasgos dialectales en un texto:** localiza **dos ejemplos literales** y nómbralos. En el fragmento de Ravelo (autor canario), *"mi niño"* como vocativo afectivo y *"Ditoseadis"* (por *Dios te ayude*) reflejan el habla popular meridional.`,
    practice_prompt: 'Enumera las lenguas cooficiales de España indicando su territorio y su origen (románico o no). Después explica la diferencia entre bilingüismo y diglosia con un ejemplo de cada uno.',
    alert_markdown: '⚠️ **Seseo y ceceo no son lo mismo.** El **seseo** pronuncia /s/ tanto en *casa* como en *caza*; el **ceceo** pronuncia /θ/ en ambas. El seseo está plenamente aceptado en la norma culta (es el general en América); el ceceo es más local.',
  },
]

const BATCH_SIZE = 20

async function main() {
  console.log(`Insertando ${cards.length} tarjetas del Bloque 2 (${BLOCK_KEY})…`)

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
  else console.log(`\n✅ Bloque 2 insertado. Total filas ${SUBJECT} en tabla: ${count}`)
}

main()
