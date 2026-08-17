// Uso: node --env-file=.env.local docs/update_lengua_b1_com2.mjs
//
// REESCRITURA en profundidad de las misiones 9-15 (Comunicación).
// Continúa docs/update_lengua_b1_com1.mjs. Los ejemplos guiados usan los textos
// reales de los exámenes oficiales de Madrid guardados en app/data/lengua.ts.

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY
)

const SUBJECT = 'lengua'

const cards = [
  {
    sort_order: 9,
    title: 'La Cohesión: Los Mecanismos que Enlazan el Texto',
    concept_markdown: `## Qué es la cohesión

Conjunto de **mecanismos lingüísticos** que enlazan unas partes del texto con otras y hacen que se perciba como un tejido y no como una sucesión de frases sueltas. Opera en el nivel de la **forma** (frente a la coherencia, que opera en el del **contenido**).

## 1. La recurrencia (repetición)

**Recurrencia léxica.** Se repite **la misma palabra**. Cuando es excesiva se considera pobreza, pero cuando es deliberada tiene valor expresivo (insistencia, obsesión).

**Recurrencia semántica.** Se repite el **significado** con otra palabra:
- **Sinónimos**: *perro* → *can*
- **Hiperónimos**: *perro* → *animal* (el más frecuente en prensa)
- **Antónimos**: por oposición
- **Perífrasis o antonomasia**: *Cervantes* → *el autor del Quijote*

**Recurrencia sintáctica (paralelismo).** Se repite una **estructura**: *"en perseguir tus sueños, en cumplir tus metas, en alcanzar la autodeterminación"*.

**Recurrencia fónica.** Rima, aliteración, ritmo. Más propia del texto literario.

## 2. La sustitución

Un elemento **reemplaza** a otro ya aparecido para evitar repetirlo:
- **Pronominal**: *La perra ladraba. **Esta** no paraba.*
- **Léxica**: por sinónimo o hiperónimo.
- **Por proformas**: palabras de significado muy general que valen para casi todo: *hacer*, *cosa*, *asunto*, *hecho*, *problema*.

## 3. La elipsis

Se **omite** un elemento que el lector puede recuperar por el contexto:
> *Juan llegó tarde y ∅ se disculpó.* (elipsis del sujeto)
> *Yo pedí café y ella ∅ té.* (elipsis del verbo)

Evita la redundancia y agiliza el ritmo.

## 4. La deixis

Palabras que **señalan** hacia algo del contexto:
- **Personal**: *yo, tú, nosotros, mi, tu*
- **Espacial**: *aquí, allí, este, aquel*
- **Temporal**: *hoy, ayer, entonces, ahora*

Según hacia dónde apunten dentro del texto:
- **Anáfora**: remite a algo **ya dicho**. *Compré un libro y **lo** leí.*
- **Catáfora**: anuncia algo **que vendrá**. *Te diré **esto**: no vengas.*

## 5. Los marcadores discursivos

Conectan ideas y guían la interpretación: *sin embargo*, *por tanto*, *en primer lugar*. *(Ver misión 10, dedicada a ellos.)*

## 6. Las isotopías o campos semánticos

Conjunto de palabras del **mismo ámbito de significado** que recorren el texto y refuerzan su unidad temática. Es de los hallazgos que más puntúan, porque exige leer el texto entero y no frase a frase.

## 7. La cohesión verbal

La **coherencia de tiempos verbales**: un texto narrativo mantiene el pasado, uno expositivo el presente. Los cambios injustificados rompen la cohesión; los justificados (un salto al presente para actualizar) son recurso estilístico.

## Cuidado con "anáfora"

Tiene **dos significados** distintos:
- Como **mecanismo de cohesión**: elemento que remite a algo ya mencionado.
- Como **figura retórica**: **repetición al principio** de varios versos u oraciones.

En el comentario, **aclara en qué sentido la usas** para que el corrector vea que conoces la diferencia.`,
    worked_example_markdown: `## Ejemplo guiado: los mecanismos de cohesión del texto de Laura G. de Rivera

**Pregunta:** *Analice los mecanismos de cohesión presentes en el texto.*

### Respuesta modelo

> *El texto se cohesiona mediante varios mecanismos que operan simultáneamente.*
>
> ***Isotopía o campo semántico dominante.*** *Recorre el texto de principio a fin el campo de la **tecnología y la innovación**: "disruptivo", "innovación", "vanguardia", "tecnología", "inteligencia artificial", "IA generativa", "productos". Esta recurrencia semántica es el principal factor de unidad temática y permite que el lector no pierda el hilo pese a los saltos entre el análisis léxico, el ejemplo empresarial y el dato estadístico.*
>
> *Se opone a él un segundo campo, el de la **ruptura y el daño**: "rotura", "interrupción brusca", "rompe cosas", "no seguros", "exponer", "consecuencias". La **tensión entre ambos campos** —lo que se presenta como progreso frente a lo que en realidad produce— sostiene toda la argumentación.*
>
> ***Sustitución pronominal.*** *En "tendemos a adoptar**las** a toda prisa", el pronombre **las** remite anafóricamente a "innovaciones", evitando la repetición. Del mismo modo, "**eso** se traduce en sacar productos no seguros" sustituye mediante el demostrativo neutro a toda la idea anterior, procedimiento de **anáfora conceptual** que condensa una oración completa en una sola palabra.*
>
> ***Deixis personal.*** *El uso reiterado de la **primera persona del plural** ("**nos** hemos metido", "**no lo sabemos**", "**tendemos** a") mantiene la cohesión entre emisor y receptor a lo largo del texto y construye un sujeto colectivo que actúa como hilo conductor.*
>
> ***Recurrencia por hiperónimo.*** *"Su compañía Facebook Meta" se recupera después como "**su modus operandi**" y se generaliza en "**el habitual en el campo de las innovaciones**", pasando del caso concreto a la categoría general mediante sustitución léxica ascendente.*
>
> ***Marcadores discursivos.*** *"**Quizá**" introduce una matización dubitativa; "**Lo mismo** nos pasa a la gente de a pie" establece una relación de semejanza que conecta el comportamiento de las empresas con el de los ciudadanos, articulando así las dos mitades del texto.*

## El esquema que se repite

Cada mecanismo lleva **tres partes**:

| Paso | Ejemplo |
|---|---|
| **Nombrar** el mecanismo | *sustitución pronominal* |
| **Citar** literalmente | *"tendemos a adoptarlas"* |
| **Decir qué enlaza con qué** | *"las" remite a "innovaciones"* |

El tercer paso es el que demuestra que lo has localizado de verdad. Decir "hay sustitución pronominal" sin señalar **qué sustituye a qué** no puntúa.

## El hallazgo que sube la nota

Detectar **dos campos semánticos en oposición** (progreso / daño) y explicar que su tensión sostiene la argumentación es el tipo de observación que distingue un comentario notable. Exige haber leído el texto completo antes de escribir, no ir localizando cosas sobre la marcha.`,
    practice_prompt: 'Localiza en un texto argumentativo un ejemplo de cada mecanismo: recurrencia léxica, sustitución pronominal, elipsis, deixis, campo semántico y marcador discursivo. Para cada uno indica exactamente qué elemento enlaza con cuál. Después intenta identificar dos campos semánticos en oposición y explica qué aporta esa tensión a la argumentación.',
    alert_markdown: '⚠️ **"Anáfora" significa dos cosas.** Como mecanismo de **cohesión**, es un elemento que remite a algo ya mencionado (*Compré un libro y **lo** leí*). Como **figura retórica**, es la repetición al inicio de varios versos. Especifica siempre en qué sentido la empleas.',
  },

  {
    sort_order: 10,
    title: 'Los Marcadores Discursivos: Clasificación y Uso',
    concept_markdown: `## Qué son

Palabras o locuciones **invariables** que **no desempeñan función sintáctica** dentro de la oración, sino que **guían la interpretación** del discurso señalando la relación lógica entre las ideas.

Son unidades **extraoracionales**: operan entre oraciones o entre párrafos, no dentro de la oración.

## Cómo se reconocen

**1. Son móviles.** Pueden cambiar de posición sin alterar el significado:
> *Sin embargo, llegó tarde.* / *Llegó, sin embargo, tarde.* / *Llegó tarde, sin embargo.*

**2. Van entre pausas** (comas) en la escritura.

**3. Se pueden suprimir** sin que la oración quede agramatical: solo se pierde la indicación de la relación lógica.

**4. No admiten complementos** ni se coordinan.

## La clasificación

| Tipo | Función | Ejemplos |
|---|---|---|
| **Estructuradores de la información** | Ordenan y distribuyen | *en primer lugar, por una parte, por otro lado, a continuación, finalmente* |
| **Conectores aditivos** | Suman argumentos en la misma dirección | *además, asimismo, encima, incluso, es más* |
| **Conectores consecutivos** | Expresan consecuencia | *por tanto, por consiguiente, así pues, en consecuencia, de ahí que, entonces* |
| **Conectores contraargumentativos** | Oponen o restringen | *sin embargo, no obstante, ahora bien, en cambio, por el contrario, con todo* |
| **Reformuladores explicativos** | Reexplican lo dicho | *es decir, o sea, esto es, en otras palabras* |
| **Reformuladores recapitulativos** | Resumen y cierran | *en definitiva, en suma, en resumen, en conclusión, total* |
| **Reformuladores rectificativos** | Corrigen | *mejor dicho, más bien, o sea* |
| **Operadores de refuerzo** | Apoyan lo dicho | *de hecho, en realidad, en el fondo* |
| **Operadores de concreción** | Ejemplifican | *por ejemplo, en concreto, en particular, pongamos por caso* |
| **Marcadores conversacionales** | Regulan el diálogo | *bueno, claro, hombre, oye, mira, vamos* |

## Por qué importan en el comentario

Los marcadores **revelan el tipo de argumentación** del texto:

- Abundancia de **contraargumentativos** → texto **dialógico**, que discute con una postura contraria que da por conocida. Es señal de argumentación madura.
- Abundancia de **consecutivos** → razonamiento **lógico encadenado**, de tipo demostrativo.
- Abundancia de **estructuradores** → texto **didáctico**, que quiere ser seguido con facilidad.
- Abundancia de **reformuladores** → voluntad de **claridad**, propia de un autor que teme no ser entendido.

Extraer esa conclusión global —y no solo enumerar marcadores— es lo que convierte el inventario en análisis.

## Marcador y conjunción no son lo mismo

La **conjunción** tiene función de **nexo dentro de la oración** y no es móvil:
> *Llegó tarde **pero** aprobó.* → conjunción coordinante adversativa; no puedes decir *"Llegó tarde aprobó pero"*.

El **marcador** es extraoracional y móvil:
> *Llegó tarde. **Sin embargo**, aprobó.* → marcador.

Esta distinción se pregunta con frecuencia en el análisis sintáctico: si te preguntan la función de *sin embargo* en una oración, la respuesta es que **no desempeña ninguna**.`,
    worked_example_markdown: `## Ejemplo guiado: los marcadores del texto de Juan Soto Ivars

**Texto** (modelo PAU 2026):
> *"Un tipo de entrevista se hace cada vez más común en los periódicos: es gente rica o famosa que ha cumplido años y piensa que su vida está incompleta. […] No renunciaron a nada: renunciaron a mucho. La ideología es lo que no se ve […] **También dice, la ideología**, que se puede tener todo sin renunciar a nada: **pero** el todo al que se refiere la ideología es un todo sin los otros, un todo independiente, autodeterminado, **es decir**: relativo como mínimo, **si partimos de la base de que** a todos nos han construido otros."*

### Respuesta modelo

> *Los marcadores organizan la progresión argumentativa del tramo final del texto, que es donde se formula la tesis.*
>
> ***Conector aditivo.*** *"**También** dice, la ideología, que…" suma una segunda característica a la caracterización de la ideología iniciada antes. Su posición inicial y el inciso entre comas —"la ideología"— refuerzan el carácter de enumeración de rasgos.*
>
> ***Conector contraargumentativo.*** *"**Pero** el todo al que se refiere la ideología es un todo sin los otros" marca el **giro decisivo** del texto: hasta aquí el autor ha expuesto lo que la ideología promete; a partir de aquí desmonta esa promesa. Es el punto exacto donde arranca su propia argumentación, y no es casual que la tesis venga inmediatamente después.*
>
> ***Reformulador explicativo.*** *"**Es decir**: relativo como mínimo" reexplica en términos más precisos lo que acaba de afirmarse. Su presencia revela la voluntad del autor de **no ser malinterpretado** en el momento culminante del razonamiento.*
>
> ***Marcador condicional argumentativo.*** *"**Si partimos de la base de que** a todos nos han construido otros" introduce la premisa sobre la que se sostiene toda la conclusión. Al presentarla como punto de partida compartido y no como afirmación discutible, el autor logra que el lector la acepte sin someterla a examen: es una estrategia persuasiva de gran eficacia.*
>
> ***Conclusión global.*** *El predominio de **contraargumentativos y reformuladores** revela un texto **dialógico**, construido rebatiendo una postura previa —la ideología de la autorrealización— que se da por conocida y compartida por el lector. No se trata de una exposición neutra, sino de una réplica.*

## Lo que hace que esta respuesta valga

El **último párrafo**. Los cuatro anteriores son un inventario correcto; el quinto **extrae una conclusión** sobre el tipo de texto a partir del conjunto. Esa es la diferencia entre listar y analizar.

## Error frecuente

**❌** *"Hay marcadores como *pero*, *es decir* y *también*, que sirven para unir las ideas."*

Es cierto pero vacío: no clasifica, no explica qué relación establece cada uno ni qué revela su conjunto. Vale muy poco.

**✅** *"El **contraargumentativo** *pero* marca el giro entre lo que la ideología promete y lo que el autor denuncia, y es el punto donde arranca la tesis."*`,
    practice_prompt: 'Localiza seis marcadores discursivos en un artículo de opinión, clasifícalos por tipo y explica qué relación lógica establece cada uno entre las ideas que une. Después escribe un párrafo final extrayendo una conclusión global: ¿qué tipo de argumentación revela el conjunto de marcadores del texto?',
    alert_markdown: '⚠️ **Un marcador no tiene función sintáctica.** Si en el análisis sintáctico te preguntan la función de *sin embargo* o *por tanto*, la respuesta correcta es que **no desempeña ninguna**: son elementos extraoracionales, no complementos circunstanciales.',
  },

  {
    sort_order: 11,
    title: 'La Adecuación y el Registro',
    concept_markdown: `## Qué es la adecuación

Propiedad textual por la que un texto **se ajusta a su situación comunicativa**. Un texto adecuado emplea el registro, el tono y la estructura que corresponden a su emisor, su receptor, su canal y su intención.

Es la tercera propiedad textual, junto con la **coherencia** (unidad de sentido) y la **cohesión** (enlaces formales).

## Qué hay que analizar

### 1. Emisor
¿Quién escribe y desde qué autoridad? En la PAU suele ser un **periodista, escritor o especialista** que firma con su nombre y escribe desde su prestigio personal.

### 2. Receptor
¿A quién se dirige? En prensa generalista, un **lector medio culto**, no especializado pero informado. Eso condiciona que se expliquen los tecnicismos y se eviten los sobreentendidos.

### 3. Intención comunicativa
Informar, **persuadir**, denunciar, entretener, emocionar. En los textos de la PAU casi siempre **persuadir**.

### 4. Canal y ámbito
Escrito, medio de comunicación de masas, **ámbito periodístico**. El canal impone brevedad, párrafos cortos y titulación.

### 5. Registro

| Registro | Rasgos | Dónde aparece |
|---|---|---|
| **Culto / formal** | Sintaxis compleja, subordinación, léxico preciso, tecnicismos, cultismos | Ensayo, texto científico |
| **Estándar** | Norma común, accesible, sin vulgarismos ni tecnicismos | Prensa, divulgación |
| **Coloquial** | Espontaneidad, frases hechas, elipsis, apelaciones, léxico común | Conversación, diálogo literario |
| **Vulgar** | Incorrecciones, vulgarismos, tacos | Habla descuidada, caracterización de personajes |

## El registro típico de la PAU

Los textos suelen ser **estándar culto con rasgos coloquiales deliberados**. Ese contraste **siempre es comentable** y casi nadie lo aprovecha.

El autor mezcla:
- **Léxico preciso y tecnicismos** del ámbito del que habla (*IA generativa*, *modus operandi*, *autodeterminación*)
- con **expresiones coloquiales** (*la gente de a pie*, *meterse de cabeza*, *muy cool*, *críos*)

**Lo importante: no lo señales como defecto, explícalo como estrategia.** La mezcla busca:
- **Acercar** un tema complejo a un lector no especialista.
- **Crear complicidad** y reducir la distancia entre autor y lector.
- A veces, **ironizar**: el coloquialismo introduce distancia crítica respecto a lo que se nombra.

## Otros factores de adecuación

- **Extensión y formato** ajustados al medio.
- **Grado de cortesía** y tratamiento (tú / usted).
- **Presuposiciones**: lo que el autor da por sabido revela qué receptor imagina.
- **Uso de la variedad estándar** frente a dialectalismos.

## Cómo se relaciona con las otras propiedades

| Propiedad | Pregunta que responde | Nivel |
|---|---|---|
| **Adecuación** | ¿Encaja con su situación? | Pragmático |
| **Coherencia** | ¿Tiene sentido unitario? | Semántico |
| **Cohesión** | ¿Están enlazadas las partes? | Gramatical |`,
    worked_example_markdown: `## Ejemplo guiado: adecuación del texto de Laura G. de Rivera

### Respuesta modelo

> *El texto resulta plenamente **adecuado** a su situación comunicativa.*
>
> ***Emisor y receptor.*** *La emisora es una periodista especializada que escribe desde la autoridad que le confiere su condición de autora de un ensayo sobre el tema —*Esclavos del algoritmo*—. El receptor previsto es un **lector medio culto** de prensa generalista, al que se presupone familiarizado con el debate público sobre la inteligencia artificial pero no experto: de ahí que se expliquen los términos y se citen las fuentes.*
>
> ***Intención.*** *Es claramente **persuasiva**. El texto no se limita a informar sobre el uso de la palabra "disruptivo", sino que busca **modificar la actitud acrítica** del lector ante la adopción de las nuevas tecnologías.*
>
> ***Registro y su mezcla deliberada.*** *El registro dominante es el **estándar culto**: léxico preciso y tecnicismos propios del ámbito digital ("IA generativa", "equipos de seguridad"), latinismo incorporado ("modus operandi") y sintaxis elaborada. Sin embargo, se combina de forma sistemática con **expresiones coloquiales**: "ser muy **cool**", "la gente **de a pie**", "nos hemos metido **de cabeza**".*
>
> ***Interpretación de esa mezcla.*** *Esta alternancia no constituye una inadecuación sino una **estrategia deliberada** con tres efectos. En primer lugar, **acerca** un asunto técnico a un lector no especializado. En segundo lugar, refuerza el **plural inclusivo** con el que la autora se sitúa al mismo nivel que su público, evitando el tono de sermón. Y en tercer lugar, el anglicismo "cool", entrecomillado, funciona **irónicamente**: al reproducir el registro de quienes emplean "disruptivo" como moda, la autora lo ridiculiza sin necesidad de criticarlo explícitamente.*

## La clave del comentario de adecuación

Cuando detectes una **mezcla de registros**, no la presentes nunca como error. Pregúntate:

1. ¿**Acerca** el texto al lector?
2. ¿Crea **complicidad**?
3. ¿Sirve para **ironizar** sobre algo o alguien?

Casi siempre la respuesta es una de esas tres, y explicarla es lo que puntúa.

## Contraste: un texto inadecuado

> *"Oye tío, la sentencia del Tribunal Supremo esa mola un montón, la verdad."*

**Inadecuado** porque el registro coloquial-vulgar (*tío*, *mola*) choca con el ámbito jurídico y con el receptor previsto de un texto sobre jurisprudencia. Aquí la mezcla **no** es estrategia: es desajuste.

La diferencia con el texto de Rivera está en la **intencionalidad** y en la **coherencia del efecto**: allí el coloquialismo cumple una función identificable; aquí, no.`,
    practice_prompt: 'Analiza la adecuación de un artículo de opinión identificando emisor, receptor, intención, canal, ámbito y registro. Localiza al menos tres expresiones coloquiales dentro de un texto de registro culto y explica, para cada una, cuál de los tres efectos busca: acercamiento, complicidad o ironía.',
    alert_markdown: '⚠️ **Una mezcla de registros no es un error del autor.** En los textos periodísticos de la PAU siempre es deliberada. Señalarla como "incorrección" es un fallo de comprensión; explicarla como estrategia de acercamiento o de ironía es exactamente lo que se espera.',
  },

  {
    sort_order: 12,
    title: 'Las Figuras Retóricas Rentables en el Comentario',
    concept_markdown: `## Cuáles hay que saber de verdad

No necesitas el catálogo completo. En los textos periodísticos y literarios de la PAU se repiten siempre las mismas, y vale mucho más comentar tres bien que enumerar quince.

## Figuras de repetición

- **Anáfora:** repetición de una o varias palabras **al principio** de secuencias sucesivas.
> *"en perseguir tus sueños, en cumplir tus metas, en alcanzar la autodeterminación"*
- **Epífora:** repetición al final.
- **Paralelismo:** repetición de la misma **estructura sintáctica**.
> *"El barco sobre la mar / y el caballo en la montaña"*
- **Políptoton:** repetición de una palabra con distintos morfemas flexivos.
> *"se hace camino al andar… caminante… camino"*
- **Enumeración:** serie de elementos. Si es larga y desordenada, **acumulación**.
- **Polisíndeton:** repetición innecesaria de conjunciones (efecto de lentitud, solemnidad).
- **Asíndeton:** supresión de conjunciones (efecto de rapidez, agitación).

## Figuras de significado (tropos)

- **Metáfora:** identificación de dos realidades por semejanza. *"la ideología… un suelo de marisma"*
- **Símil o comparación:** con nexo explícito (*como*, *cual*, *parece*). *"alto y gordo como un monte"*
- **Personificación o prosopopeya:** atribuir rasgos humanos a lo no humano. *"también dice, la ideología"*
- **Metonimia:** designar algo por una relación de **contigüidad** (causa-efecto, continente-contenido, autor-obra). *"tomar una copa"*, *"leer a Cervantes"*
- **Sinécdoque:** la **parte por el todo** o viceversa. *"diez cabezas de ganado"*
- **Hipérbole:** exageración desmesurada.
- **Sinestesia:** mezcla de sensaciones de sentidos distintos. *"verde viento"*, *"sonoro marfil"*
- **Ironía:** decir lo contrario de lo que se piensa, con marcas que lo hacen detectable (comillas, contexto).
- **Antonomasia:** sustituir un nombre por una perífrasis identificadora. *"el Manco de Lepanto"*

## Figuras de construcción y pensamiento

- **Antítesis:** contraposición de dos ideas. *"No renunciaron a nada: renunciaron a mucho"*
- **Paradoja:** contradicción **aparente** que encierra una verdad. *"vivir en los pronombres"*
- **Oxímoron:** dos términos contradictorios **juntos**. *"lúbrica y pura"*
- **Interrogación retórica:** pregunta que no espera respuesta.
- **Hipérbaton:** alteración del orden sintáctico habitual.
- **Elipsis:** supresión de un elemento recuperable.
- **Gradación:** serie en intensidad creciente o decreciente.
- **Apóstrofe:** invocación vehemente a alguien o algo.

## Antítesis, paradoja y oxímoron: la distinción que se falla

| Figura | En qué consiste | Ejemplo |
|---|---|---|
| **Antítesis** | Dos ideas **opuestas** contrapuestas, ambas verdaderas | *"ayer dominadora… hoy miserable"* |
| **Paradoja** | Afirmación que **parece** contradecirse pero es verdadera | *"No renunciaron a nada: renunciaron a mucho"* |
| **Oxímoron** | Dos palabras contradictorias **en el mismo sintagma** | *"un silencio atronador"* |

## Los tres pasos obligatorios

Comentar una figura exige siempre:

1. **Nombrarla** con su término técnico y **citarla** literalmente.
2. **Explicar** en qué consiste la identificación, la oposición o el juego.
3. **Interpretar** qué aporta al **sentido del texto**.

**El paso 3 es el que casi nadie da y el que decide la nota.**`,
    worked_example_markdown: `## Ejemplo guiado: comentar una metáfora bien y mal

**Texto:** *"La ideología es lo que no se ve, lo que está debajo de las piedras. Soporta encima las ideas como un suelo de marisma y debido a sus ondulaciones salen inclinados los principios morales."* (Juan Soto Ivars, modelo PAU 2026)

**❌ Comentario insuficiente**
> *Hay una metáfora en "un suelo de marisma".*

Solo identifica. Vale casi nada.

**✅ Comentario completo**
> *El autor recurre a una **metáfora** de gran plasticidad al describir la ideología como **"un suelo de marisma"** sobre el que se apoyan las ideas. La imagen resulta especialmente eficaz porque la marisma es un terreno **inestable y movedizo**, de apariencia firme pero incapaz de sostener peso: sugiere así que los principios morales que creemos asentados sobre bases sólidas descansan en realidad sobre un suelo que cede, de ahí que —según prosigue el texto— "salgan inclinados". La figura **condensa la tesis del artículo en una sola imagen**: aquello que damos por evidente e indiscutible es precisamente lo que menos hemos examinado.*

## Por qué el segundo vale mucho más

| Paso | ¿Está? |
|---|---|
| Nombra la figura y la cita | ✅ *metáfora*, *"un suelo de marisma"* |
| Explica la identificación | ✅ terreno inestable, apariencia firme |
| **Interpreta el sentido** | ✅ los principios morales carecen de base firme |
| **Conecta con la tesis** | ✅ condensa la idea central del texto |

## Segundo ejemplo: la paradoja

**Texto:** *"No renunciaron a nada: renunciaron a mucho."*

> *La sentencia constituye una **paradoja**, pues afirma y niega simultáneamente la misma acción. La contradicción es solo aparente y se resuelve al distinguir dos sentidos de "renunciar": quienes persiguieron el éxito **no renunciaron a ninguna de sus metas profesionales**, pero al hacerlo **renunciaron a todo lo demás** —vínculos, tiempo compartido, vida en común—. La figura resulta doblemente eficaz: por su **concisión sentenciosa**, que la hace memorable, y por su construcción en **antítesis** ("nada" / "mucho") reforzada por el **paralelismo** sintáctico y por los **dos puntos**, que sustituyen a un conector adversativo y producen un efecto más rotundo que un simple "pero".*

Fíjate en que aquí se comentan **tres figuras entrelazadas** (paradoja, antítesis, paralelismo) más un recurso de puntuación, mostrando cómo colaboran. Eso es análisis, no inventario.

## La regla que hay que recordar

**Tres figuras bien interpretadas puntúan más que quince enumeradas.** El corrector busca comprensión del texto, no memoria del catálogo de retórica.`,
    practice_prompt: 'Localiza cuatro figuras retóricas distintas en un artículo de opinión. Para cada una aplica los tres pasos: nómbrala y cítala literalmente, explica en qué consiste el juego, e interpreta qué aporta al sentido del texto. Después intenta encontrar dos figuras que colaboren en el mismo fragmento y explica cómo se refuerzan.',
    alert_markdown: '⚠️ **No hagas listas de figuras.** Enumerar diez sin interpretarlas puntúa menos que comentar tres bien. Y comprueba siempre que la que nombras es la correcta: **antítesis** (ideas opuestas), **paradoja** (contradicción aparente pero verdadera) y **oxímoron** (dos palabras contradictorias juntas) se confunden constantemente.',
  },

  {
    sort_order: 13,
    title: 'Características Lingüísticas y Estilísticas: El Método Completo (1,3 puntos)',
    concept_markdown: `## La pregunta mejor pagada del examen

**1,3 puntos.** Más que cualquier otra pregunta individual salvo el tema de literatura, y con la ventaja de que **no hay que memorizar nada**: todo está en el texto.

Se responde recorriendo el texto por **niveles lingüísticos**, de menor a mayor. Ese orden es el que el corrector espera encontrar.

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

**Cuatro párrafos, uno por nivel.** Es la plantilla que garantiza no dejarse nada y que el corrector localice todo de inmediato. En cada párrafo: **dos o tres rasgos**, cada uno con **cita** e **interpretación**.

Y un **párrafo de cierre** que relacione los niveles entre sí y conecte con la intención global del texto.`,
    worked_example_markdown: `## Ejemplo guiado: respuesta completa sobre el texto de Juan Soto Ivars

**Pregunta:** *Detalle las características lingüísticas y estilísticas más sobresalientes del texto (1,3 puntos).*

### Respuesta modelo

> ***Nivel morfológico.*** *Destaca la abundancia de **sustantivos abstractos** —"ideología", "prestigio", "autodeterminación", "principios"—, coherente con el carácter reflexivo del texto y con su propósito de trascender la anécdota inicial. Sobresale asimismo el uso del **presente de indicativo con valor gnómico** en "la ideología **es** lo que no se ve", mediante el cual el autor presenta su opinión personal como si se tratase de una verdad general e incontestable. Conviven con ellos las formas de **primera persona del singular** del arranque ("he renunciado", "me quedé pensando"), que anclan la reflexión en la experiencia vivida.*
>
> ***Nivel sintáctico.*** *El texto alterna deliberadamente **oraciones simples de gran brevedad**, que funcionan como sentencias —"No renunciaron a nada: renunciaron a mucho"—, con **períodos subordinados extensos** en los que se desarrolla el razonamiento —"un todo sin los otros, un todo independiente, autodeterminado, es decir: relativo como mínimo, si partimos de la base de que…"—. Este **contraste rítmico** impide la monotonía y, sobre todo, **destaca las conclusiones** por aislamiento: tras un período largo, la frase breve golpea. Son igualmente relevantes las **interrogaciones retóricas** ("¿he renunciado hoy a algo?"), que introducen la modalidad interrogativa en un texto por lo demás enunciativo.*
>
> ***Nivel léxico-semántico.*** *Se articulan dos **campos semánticos en oposición**: el de la **realización personal** ("sueños", "metas", "autodeterminación", "dueño de uno mismo") y el de la **renuncia y el vínculo** ("renunciar", "freno", "los otros", "nos han construido"). La tensión entre ambos sostiene toda la argumentación. Junto al léxico abstracto aparecen **coloquialismos** deliberados ("críos", "de mentirijilla") que rebajan el tono y refuerzan la impresión de confidencia.*
>
> ***Nivel pragmático-textual.*** *El texto está intensamente **modalizado** mediante la primera persona y las interrogaciones, que trasladan al lector el proceso mismo de reflexión. Predominan las funciones **expresiva** y **apelativa**. Su **estructura es inductiva**: de la anécdota doméstica a la tesis general. Y las **figuras** no son ornamentales sino argumentativas: la **metáfora** "un suelo de marisma" materializa la inestabilidad de los principios morales, y la **paradoja** "No renunciaron a nada: renunciaron a mucho" condensa la tesis en una sola sentencia memorable.*
>
> ***Cierre.*** *Todos los niveles convergen en una misma estrategia: **partir de lo íntimo y concreto para llegar a lo abstracto y colectivo**, de modo que el lector acepte una conclusión filosófica exigente por haberla recorrido desde una experiencia en la que puede reconocerse.*

## Analiza la plantilla

| Párrafo | Rasgos | Cada uno con |
|---|---|---|
| Morfológico | 3 | cita + interpretación |
| Sintáctico | 3 | cita + interpretación |
| Léxico-semántico | 2 | cita + interpretación |
| Pragmático | 4 | cita + interpretación |
| **Cierre** | — | **relaciona todos los niveles** |

**El cierre es lo que casi nadie escribe** y lo que demuestra que has entendido el texto como un todo y no como una cantera de ejemplos.

## Si vas mal de tiempo

Prioriza en este orden: **léxico-semántico** (campos semánticos) → **pragmático** (modalización y figuras) → **sintáctico** → **morfológico**. Los dos primeros son los que más contenido dan por línea escrita.`,
    practice_prompt: 'Comenta las características lingüísticas y estilísticas de un artículo de opinión siguiendo la plantilla de cuatro niveles más cierre. Dedica un párrafo a cada nivel con dos o tres rasgos, cada uno con su cita literal y su interpretación. Escribe después el párrafo de cierre relacionando todos los niveles con la intención global del texto.',
    alert_markdown: '⚠️ **Es la pregunta que más puntúa (1,3) y la que más gente improvisa.** Llevar memorizado el esquema de los cuatro niveles convierte una pregunta difícil en una plantilla que solo hay que rellenar con ejemplos del texto que tienes delante. No memorizas contenido: memorizas un orden.',
  },

  {
    sort_order: 14,
    title: 'El Texto Argumentativo: Estructura de la Respuesta (1,4 puntos)',
    concept_markdown: `## Qué te piden

**100-150 palabras** manifestando **acuerdo o desacuerdo** con alguna idea del texto. Vale **1,4 puntos**, la segunda pregunta mejor pagada del bloque.

**No es un resumen ni un comentario.** Es **tu argumentación**. El resumen ya lo has hecho en 1.2.

## Qué se valora

1. Que tomes **postura clara** desde el principio.
2. Que la **argumentes**, no que la repitas ni la adornes.
3. **Coherencia, cohesión y corrección** en la redacción.
4. La **extensión** pedida.
5. **Madurez**: matizar, conceder, evitar el maniqueísmo.

## La estructura recomendada

| Parte | Extensión | Contenido |
|---|---|---|
| **Introducción** | 1-2 frases | Enuncias el asunto y **tu tesis** |
| **Argumento 1** | 2 frases | Razón + ejemplo o dato |
| **Argumento 2** | 2 frases | Razón + **concesión** al contrario |
| **Conclusión** | 1 frase | Cierras reforzando o matizando la tesis |

## Los recursos que suman

**1. Marcadores que ordenen.** *En primer lugar… Por otra parte… En definitiva…* El corrector ve la estructura de un vistazo.

**2. La concesión.** Es el recurso más rentable y el que menos se usa:
> *Si bien es cierto que…, no obstante…*
> *Ciertamente…, pero conviene recordar que…*
> *Es innegable que…; ahora bien…*

Demuestra que **conoces la postura contraria** y la has considerado. Es la marca de la argumentación madura.

**3. Ejemplos concretos y actuales.** Un dato, una ley, un caso reciente. Mucho mejor que la generalidad.

**4. Matizar la tesis.** *"Comparto la advertencia, aunque considero que el problema no está en X sino en Y"* es más maduro que un sí o un no rotundo.

## Lo que resta

- **Generalidades vacías**: *"desde el principio de los tiempos"*, *"la sociedad actual"*, *"hoy en día todos sabemos"*.
- **Tópicos** y frases hechas.
- **Parafrasear el texto** sin aportar nada propio. **Es el error más frecuente.**
- **Datos inventados**: si no estás seguro de una cifra, no la pongas.
- **Primera persona en exceso**: *"yo pienso que yo creo que a mí me parece"*.
- **Pasarse o quedarse corto** de palabras.

## Sobre la primera persona

Está permitida y es natural en un texto de opinión, pero **con moderación**. Alternativas más elegantes:
- *Cabe señalar que…*
- *Resulta discutible que…*
- *Conviene recordar que…*
- *A mi juicio…* (una vez, no cinco)`,
    worked_example_markdown: `## Ejemplo guiado: dos respuestas al mismo enunciado

**Enunciado real (modelo PAU 2026):** *Elabore un texto argumentativo de entre 100 y 150 palabras sobre el contenido del texto, manifestando acuerdo o desacuerdo con alguna de las ideas que refleja.*

**Texto de partida:** el artículo sobre la adopción acrítica de la inteligencia artificial.

### ❌ Respuesta débil (112 palabras)

> *Estoy de acuerdo con la autora. Hoy en día la tecnología avanza muy rápido y la gente no se para a pensar en las consecuencias. Como dice el texto, la palabra "disruptivo" significa romper, pero se usa como algo bueno. Mark Zuckerberg dijo "muévete rápido y rompe cosas" y su empresa saca productos que no son seguros. También el estudio de Cisco dice que el 91 % usa IA sin entenderla. Desde el principio de los tiempos el ser humano ha temido a las máquinas, pero ahora es diferente. En conclusión, creo que deberíamos pensar más antes de usar la tecnología.*

**Qué falla:**
- **Parafrasea el texto** en vez de argumentar: los ejemplos son todos del artículo.
- **Tópico vacío**: *"desde el principio de los tiempos"*.
- **Sin concesión** ni matiz: adhesión total y plana.
- La conclusión no aporta nada (*"deberíamos pensar más"*).
- *"Como dice el texto"* delata que no hay aportación propia.

### ✅ Respuesta sólida (134 palabras)

> *Comparto la advertencia del texto sobre la adopción irreflexiva de la tecnología, si bien considero que el problema no reside en la innovación misma, sino en el vacío regulatorio que la acompaña.*
>
> *En primer lugar, la velocidad del desarrollo tecnológico supera con mucho la capacidad de respuesta legislativa: cuando el Reglamento europeo de inteligencia artificial comenzó a aplicarse, los modelos generativos llevaban ya años instalados en millones de dispositivos y habían modificado hábitos difíciles de revertir.*
>
> *Por otra parte, responsabilizar únicamente al usuario resulta injusto. Es cierto que existe una adopción acrítica por parte del público; ahora bien, no puede exigirse a un ciudadano que evalúe riesgos que las propias empresas desarrolladoras admiten no comprender del todo.*
>
> *En definitiva, el problema no es movernos rápido, sino hacerlo sin que nadie responda de lo que se rompe.*

**Por qué funciona:**

| Elemento | Dónde |
|---|---|
| **Tesis matizada** desde la primera frase | *"si bien considero que el problema no reside en…"* |
| **Argumento 1 con dato propio** | el Reglamento europeo, no citado en el texto |
| **Argumento 2 con concesión** | *"Es cierto que…; ahora bien, no puede exigirse…"* |
| **Marcadores estructuradores** | *En primer lugar / Por otra parte / En definitiva* |
| **Conclusión que reformula el texto** | juega con el lema "rompe cosas" y lo redirige |
| **Extensión** | 134 palabras, dentro del rango |

## El cierre que distingue

La última frase —*"el problema no es movernos rápido, sino hacerlo sin que nadie responda de lo que se rompe"*— **retoma el lema citado en el artículo y lo reorienta** hacia la tesis propia. Es un recurso muy eficaz: demuestra que has leído el texto con atención y cierra con una imagen memorable, sin limitarte a repetirlo.`,
    practice_prompt: 'Escribe un texto argumentativo de 100-150 palabras manifestando acuerdo o desacuerdo con esta idea: "las redes sociales han empobrecido el debate público". Estructúralo con tesis matizada, dos argumentos (uno con dato o ejemplo propio y otro con concesión) y una conclusión que no repita la tesis literalmente. Cuenta las palabras al terminar.',
    alert_markdown: '⚠️ **No vuelvas a resumir el texto.** Es el error más frecuente de esta pregunta: usar los ejemplos y datos del propio artículo como si fueran argumentos tuyos. Te piden **tu postura argumentada con material propio**; el resumen ya lo entregaste en 1.2.',
  },

  {
    sort_order: 15,
    title: 'Los Tipos de Argumentos',
    concept_markdown: `## Para qué sirve saberlos

Sirve para **dos preguntas** distintas:
- Para **analizar** cómo argumenta el autor (parte de 1.1.b).
- Para **construir** tu propio texto argumentativo (1.3).

## Los argumentos válidos

| Argumento | En qué consiste | Ejemplo |
|---|---|---|
| **De autoridad** | Se apoya en un experto o institución reconocida | *Según la RAE…*, *la OMS advierte de…* |
| **De datos o hechos** | Cifras, estudios, estadísticas | *Un estudio de Cisco señalaba que el 91 %…* |
| **Ejemplificación** | Un caso concreto ilustra la tesis | *El lema de Zuckerberg, "muévete rápido y rompe cosas"…* |
| **De experiencia personal** | El emisor apela a lo vivido | *Hoy he renunciado a una comida…* |
| **Analógico** | Compara con un caso semejante | *Igual que ocurrió con el tabaco en los años setenta…* |
| **Causa-consecuencia** | Encadena razones y efectos | *Como no existe regulación, se producen abusos* |
| **De lo general a lo particular** (deductivo) | De un principio se deriva un caso | — |
| **De lo particular a lo general** (inductivo) | De varios casos se infiere una regla | — |
| **Argumento ético o de valores** | Apela a principios morales compartidos | *Ningún beneficio justifica poner en riesgo la salud* |
| **Argumento estético** | Apela a la belleza | — |
| **De cantidad o de la mayoría** | Lo que muchos aceptan | *Nadie discute hoy que…* |
| **Argumento de las consecuencias** | Advierte de lo que pasará | *De seguir así, acabaremos…* |

## Las falacias (argumentos inválidos)

Conviene conocerlas para **detectarlas** en el texto ajeno y **evitarlas** en el propio:

- ***Ad hominem***: atacar a quien defiende la idea en lugar de a la idea.
- ***Ad populum***: "lo hace todo el mundo, luego está bien".
- ***Ad baculum***: apelar a la amenaza o a la fuerza.
- **Falsa analogía**: comparar cosas que no son comparables.
- **Falso dilema**: presentar solo dos opciones cuando hay más.
- **Generalización precipitada**: sacar una regla de uno o dos casos.
- **Pendiente resbaladiza**: encadenar consecuencias catastróficas sin justificar los pasos.

## La contraargumentación

Un texto argumentativo maduro **anticipa la objeción** del contrario y la rebate:

> *Se dirá que la tecnología siempre ha despertado recelo. **Sin embargo**, nunca antes una innovación se había difundido a esta velocidad ni había sido reconocida como incomprensible por sus propios creadores.*

Estructura: **concesión** (reconozco lo que dice el contrario) + **refutación** (pero no se sostiene porque…).

Detectar esta estrategia en el texto de la PAU **siempre puntúa**, porque demuestra que has entendido la arquitectura del razonamiento y no solo su contenido.

## Cómo se combinan

Los textos eficaces **encadenan tipos distintos**: una autoridad para dar credibilidad, un dato para objetivar, un ejemplo para hacerlo tangible. Señalar esa **combinación** y explicar qué aporta cada pieza es más valioso que identificar los argumentos por separado.`,
    worked_example_markdown: `## Ejemplo guiado: los argumentos del texto de Laura G. de Rivera

**Pregunta:** *Analice los tipos de argumentos que emplea la autora.*

### Respuesta modelo

> *La autora construye su argumentación combinando tres tipos de argumentos que se refuerzan mutuamente.*
>
> ***Argumento de autoridad.*** *Cita la definición de la **RAE** —"que produce rotura o interrupción brusca"— y la matización de la **Fundéu**. Con ello apoya su crítica en dos instituciones normativas de prestigio indiscutible, lo que impide que su postura se perciba como un capricho personal: no es que a la autora le disguste la palabra, es que la palabra **significa** otra cosa. Es, además, un argumento especialmente eficaz porque el lector no puede rebatir un diccionario.*
>
> ***Ejemplificación.*** *El lema de Mark Zuckerberg, "muévete rápido y rompe cosas", funciona como **caso concreto** que hace tangible una crítica que de otro modo resultaría abstracta. La elección no es inocente: se trata de una figura reconocible universalmente y de una frase que **el propio criticado formuló**, de modo que la denuncia se sostiene con las palabras del denunciado.*
>
> ***Argumento de datos.*** *El estudio de **Cisco de 2024** aporta la prueba objetiva: el 91 % de los equipos de seguridad emplea IA generativa mientras el 70 % de los profesionales no comprende del todo sus implicaciones. El **contraste entre ambas cifras** es lo que argumenta —no el dato aislado—, pues cuantifica exactamente la distancia entre uso y comprensión que constituye la tesis del artículo.*
>
> ***Efecto de la combinación.*** *La sucesión **autoridad → ejemplo → dato** confiere a la argumentación una solidez que trasciende la mera opinión: la autoridad legitima, el ejemplo ilustra y el dato demuestra. La autora completa el recorrido con un giro final hacia la **experiencia compartida** ("lo mismo nos pasa a la gente de a pie"), que traslada el problema desde las corporaciones hasta el lector e impide que este se sitúe como espectador ajeno.*

## Lo que hace destacar esta respuesta

1. No solo **nombra** los argumentos: explica **por qué cada uno es eficaz**.
2. Observa que en el argumento de datos **lo que argumenta es el contraste**, no el dato suelto.
3. El párrafo final analiza la **secuencia** y su lógica acumulativa.

## Aplicación a tu propio texto (pregunta 1.3)

Cuando escribas tu argumentación, **usa al menos dos tipos distintos**:

| Combinación | Efecto |
|---|---|
| **Dato + concesión** | Objetividad y madurez |
| **Autoridad + ejemplo** | Credibilidad y concreción |
| **Analogía + consecuencias** | Persuasión emocional razonada |

**Evita** apoyarte solo en la experiencia personal: es el argumento más débil si va solo, porque siempre se puede responder "a mí me pasó lo contrario".`,
    practice_prompt: 'Identifica los tipos de argumentos que emplea un artículo de opinión, explicando para cada uno por qué es eficaz y no solo cuál es. Añade un párrafo final sobre qué aporta la combinación. Después escribe tú un párrafo defendiendo la tesis contraria usando un argumento de autoridad y otro de datos, y localiza si has cometido alguna falacia.',
    alert_markdown: '⚠️ **En el argumento de datos, lo que argumenta suele ser el contraste, no la cifra.** "El 91 % usa IA" por sí solo no dice nada; "el 91 % la usa pero el 70 % no la entiende" es el argumento. Señalar esa relación demuestra que has entendido cómo funciona la prueba.',
  },
]

async function main() {
  console.log(`Reescribiendo ${cards.length} misiones (9-15, Comunicación) en profundidad…\n`)
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
