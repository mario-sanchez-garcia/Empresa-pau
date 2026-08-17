// Uso: node --env-file=.env.local docs/update_lengua_b3_lit2.mjs
//
// REESCRITURA en profundidad de las misiones 51-60 (Educación literaria).
// Continúa el criterio de docs/update_lengua_b3_lit1.mjs: apuntes extensos
// en concept_markdown, ejemplo desarrollado en worked_example_markdown y
// "inténtalo" en practice_prompt, siguiendo el modelo de Historia de España.

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY
)

const SUBJECT = 'lengua'

const cards = [
  {
    sort_order: 51,
    title: 'Los Poetas del 27: Trayectorias Individuales',
    concept_markdown: `## Por qué hay que saber esto

El tema del 27 se responde mal cuando solo se enumeran nombres. Lo que puntúa es asociar cada poeta con **su tema central, su estilo y una obra fechada**. Aquí está esa asociación, poeta a poeta.

## Pedro Salinas (1891-1951) — el poeta del amor

Catedrático y profesor, es el más **intelectual y conceptual** en el tratamiento del sentimiento. Su gran tema es el **amor**, entendido no como pasión sino como **fuerza de conocimiento**: amar es descubrir la realidad auténtica que se esconde tras las apariencias del ser amado.

**Estilo:** aparente sencillez, léxico común, verso corto sin rima, abundancia de **pronombres** (*tú*, *yo*) en lugar de nombres, paradojas y juegos conceptuales de raíz barroca.

**Obras:** la trilogía amorosa ***La voz a ti debida*** (1933) —el título procede de Garcilaso—, *Razón de amor* (1936) y *Largo lamento*. En el exilio, *El contemplado* y *Todo más claro*.

> *"Para vivir no quiero / islas, palacios, torres. / ¡Qué alegría más alta: / vivir en los pronombres!"*

## Jorge Guillén (1893-1984) — la poesía pura

El más **fiel al ideal de poesía pura** de Juan Ramón y el más intelectual del grupo. Toda su obra lírica se agrupa bajo el título único de ***Cántico*** (cuatro ediciones crecientes entre 1928 y 1950), un canto de **entusiasmo ante la perfección del mundo**: el asombro gozoso ante el simple hecho de **ser**.

**Estilo:** verso **ceñido, denso y esencial**; nominalización, exclamaciones, décimas y estrofas breves; eliminación de todo lo anecdótico. Es el poeta más difícil del grupo.

> *"El aire se serena / y viste de hermosura y luz no usada"* (eco de fray Luis de León)
> *"Ser, nada más. Y basta. / Es la absoluta dicha."*

Más tarde, ***Clamor*** (1957-63) introduce el **dolor, la muerte y el desorden histórico** que *Cántico* había dejado fuera; y *Homenaje* (1967) cierra su obra.

## Gerardo Diego (1896-1987) — la versatilidad

El más **camaleónico**. Alterna sin conflicto dos líneas paralelas:
- **Poesía de vanguardia** (creacionista y ultraísta): *Imagen* (1922), *Manual de espumas* (1924).
- **Poesía tradicional** en formas clásicas: *Versos humanos* (1925), *Alondra de verdad* (1941), sonetos de tema religioso y taurino.

Fue además **antólogo decisivo**: su antología *Poesía española contemporánea* (1932) fijó la nómina del grupo tal como hoy la conocemos.

## Vicente Aleixandre (1898-1984) — el surrealista telúrico

Su poesía es una **visión panteísta del cosmos**: el hombre aspira a fundirse con la naturaleza elemental, de la que se ha separado. El **amor** aparece como fuerza a la vez creadora y **destructora**, identificada con la muerte.

**Estilo:** **verso libre** amplio y torrencial, imágenes surrealistas encadenadas, uso característico de la conjunción **"o" con valor identificativo** (*"La destrucción **o** el amor"*: no es alternativa, es equivalencia).

**Obras:** *Espadas como labios* (1932), ***La destrucción o el amor*** (1935, Premio Nacional), *Sombra del paraíso* (1944). Permaneció en España tras la guerra y su casa de Velintonia fue refugio de los poetas jóvenes. **Premio Nobel en 1977**.

## Luis Cernuda (1902-1963) — la realidad y el deseo

Toda su obra poética se titula ***La realidad y el deseo***, y ese título **es** su tema: el choque permanente entre el **deseo del individuo** —de amor, de belleza, de libertad— y una **realidad que lo frustra**, incluida la sociedad que marginaba su **homosexualidad**.

**Etapas:** de un inicio de poesía pura pasa al **surrealismo** (*Un río, un amor*, 1929; *Los placeres prohibidos*, 1931), luego a la meditación romántica (*Donde habite el olvido*, 1933, título tomado de Bécquer), y en el exilio a un tono cada vez más **reflexivo, amargo e irónico** (*Desolación de la Quimera*, 1962).

**Estilo:** rechazo de la rima y de la musicalidad fácil, verso **próximo a la prosa**, tono **confesional** y **conversacional**, ironía. Es el poeta del 27 de mayor influencia sobre la poesía española de la segunda mitad del siglo XX.

## Rafael Alberti (1902-1999) — el poeta proteico

El de registro más amplio. Cuatro líneas sucesivas:
1. **Neopopularismo**: ***Marinero en tierra*** (1925, Premio Nacional), canciones breves de nostalgia del mar gaditano desde el Madrid interior.
2. **Gongorismo y vanguardia**: *Cal y canto* (1929).
3. **Surrealismo**: ***Sobre los ángeles*** (1929), su obra maestra, escrita durante una profunda crisis personal y religiosa; los ángeles son símbolos de estados interiores de vacío y desolación.
4. **Poesía política y de compromiso**: *El poeta en la calle* (1936), poesía de guerra.
En el **exilio** (Argentina, Roma) domina la **nostalgia**: *Retornos de lo vivo lejano*, *Roma, peligro para caminantes*.

## Dámaso Alonso (1898-1990)

Sobre todo **crítico y filólogo** (sus *Estudios y ensayos gongorinos* rehabilitaron a Góngora), es también poeta. Su obra capital, ***Hijos de la ira*** (1944), es un **grito existencial** de posguerra que abre la **poesía desarraigada**: verso libre, lenguaje áspero, imprecación a Dios.

> *"Madrid es una ciudad de más de un millón de cadáveres (según las últimas estadísticas)."*

## Emilio Prados y Manuel Altolaguirre

Los poetas **malagueños** del grupo, fundadores de la revista ***Litoral***, plataforma esencial del 27. Prados evolucionó del intimismo al compromiso; Altolaguirre cultivó una poesía intimista y fue además impresor de gran parte de los libros del grupo. Ambos murieron en el exilio mexicano.

## Federico García Lorca

*Ver misiones 52 y 53, dedicadas por completo a su poesía y a su teatro.*`,
    worked_example_markdown: `## Ejemplo guiado: comentario de "Insomnio", de Dámaso Alonso

Es el poema que apareció literalmente en el modelo oficial de PAU 2026.

> *"Madrid es una ciudad de más de un millón de cadáveres (según las últimas estadísticas).*
> *A veces en la noche yo me revuelvo y me incorporo en este nicho en el que hace 45 años que me pudro,*
> *y paso largas horas oyendo gemir al huracán, o ladrar los perros, o fluir blandamente la luz de la luna.*
> *Y paso largas horas preguntándole a Dios, preguntándole por qué se pudre lentamente mi alma."*

**Pregunta del examen:** *¿A qué alude el poeta con la imagen de cadáveres que se pudren?*

**Paso 1 — Descarta la lectura literal.**
No habla de muertos reales. Madrid tenía en 1944 aproximadamente un millón de habitantes: los "cadáveres" son **los vivos**. La metáfora identifica **población** con **cadáveres**.

**Paso 2 — Interpreta la metáfora en su contexto histórico.**
*Hijos de la ira* se publica en **1944**, cinco años después de la Guerra Civil. La imagen alude a una sociedad **moralmente aniquilada**: derrotada, silenciada por la represión y reducida a una existencia vegetativa. La ciudad entera es un **cementerio de vivos**.

**Paso 3 — Analiza el recurso que la sostiene: el contraste de registros.**
El paréntesis "**(según las últimas estadísticas)**" introduce un lenguaje **burocrático y administrativo** dentro del poema. El efecto es doble: **cosifica** a las personas, convertidas en cifra de un censo, y produce un **choque brutal** con la carga trágica de "cadáveres". La frialdad del dato agrava el horror.

**Paso 4 — Observa que el yo se incluye.**
"Este nicho en el que **hace 45 años que me pudro**" — Dámaso Alonso tenía 46 años al publicar el libro. El poeta **no observa desde fuera**: se cuenta entre los cadáveres. La angustia es compartida, no denunciada desde una posición de superioridad moral.

**Paso 5 — Identifica la dimensión religiosa.**
"Preguntándole a Dios… por qué se pudre lentamente mi alma" convierte el poema en una **imprecación**. No es ateísmo: es un Dios al que se interpela y que no responde. Esa relación agónica con la divinidad es marca de la poesía desarraigada.

**Paso 6 — Sitúa la obra en su corriente.**
*Hijos de la ira* inaugura la **poesía desarraigada**, que frente al **garcilasismo** —poesía arraigada de los años cuarenta, formalista, de mundo ordenado y sereno— presenta un mundo **caótico y angustioso**, en **verso libre** y con lenguaje deliberadamente áspero y antipoético.

**Redacción final (200 palabras):**
> *La imagen de los cadáveres que se pudren constituye una **metáfora de la condición existencial y moral de la España de posguerra**. Los "más de un millón de cadáveres" no son muertos literales sino **los propios habitantes de Madrid**, una población aniquilada por la guerra y reducida por la represión a una existencia meramente vegetativa: la ciudad se convierte así en un cementerio de vivos.*
>
> *La eficacia del verso reside en el **contraste de registros**. El paréntesis "(según las últimas estadísticas)" introduce un lenguaje burocrático que **cosifica** a las personas, transformadas en cifra censal, y choca violentamente con la carga trágica del término "cadáveres".*
>
> *El poeta, además, **se incluye** entre ellos —"este nicho en el que hace 45 años que me pudro"—, de modo que la angustia no se contempla desde fuera. La reiterada interpelación a Dios, que no responde, otorga al poema una dimensión **religiosa agónica**.*
>
> *Con esta obra, Dámaso Alonso inaugura en 1944 la **poesía desarraigada**, que frente al formalismo sereno del garcilasismo expresa el desconcierto ante un mundo percibido como caos, en verso libre y con lenguaje deliberadamente áspero.*`,
    practice_prompt: 'Construye una tabla asociando a cada poeta del 27 (Salinas, Guillén, Diego, Aleixandre, Cernuda, Alberti y Dámaso Alonso) con su tema central, un rasgo de estilo y una obra fechada. Después explica qué significa el título "La realidad y el deseo" de Cernuda y por qué resume toda su obra.',
    alert_markdown: '⚠️ **Las Sinsombrero formaron parte del 27.** Maruja Mallo, Concha Méndez, Ernestina de Champourcín, Rosa Chacel o María Zambrano participaron plenamente del grupo y fueron borradas de las antologías durante décadas. Mencionarlas demuestra una visión actualizada y se valora cada vez más.',
  },

  {
    sort_order: 52,
    title: 'Federico García Lorca: La Poesía',
    concept_markdown: `## La figura

**Federico García Lorca (Fuente Vaqueros, Granada, 1898 – Víznar, agosto de 1936)** es el autor español más universal del siglo XX. Formado en la **Residencia de Estudiantes**, donde convivió con **Dalí** y **Buñuel**, fue también dramaturgo, músico, dibujante y director de la compañía teatral universitaria **La Barraca**. Fue **asesinado** al comienzo de la Guerra Civil.

## El mito personal

Toda su obra se organiza sobre una constante: el **destino trágico**. Sus criaturas están marcadas por una **frustración** insalvable y por el choque entre el **deseo individual** y un **orden social represivo** que lo prohíbe. El desenlace es siempre la muerte o la esterilidad.

## Los temas

**1. El amor imposible o insatisfecho.** El deseo nunca se realiza: o es prohibido, o llega tarde, o conduce a la muerte.

**2. La muerte.** Está presente desde el primer verso de cualquier poema. No es un final, es una **presencia continua** que acecha.

**3. La frustración vital.** Sus protagonistas son **seres marginados** —gitanos, negros, mujeres, homosexuales, niños— condenados por una sociedad que los excluye. Lorca se identifica con ellos.

**4. La naturaleza y la infancia perdida**, especialmente la Vega de Granada.

## Los símbolos lorquianos

Son imprescindibles para comentar cualquier texto suyo, en verso o en teatro:

| Símbolo | Significado |
|---|---|
| **La luna** | La **muerte**. Es el símbolo más frecuente y constante |
| **El agua** | Si **corre**: vida, erotismo. Si está **estancada**: muerte |
| **La sangre** | Vida derramada, pasión, muerte violenta, linaje |
| **El caballo** | Pasión desbordada, erotismo, muerte que se acerca |
| **Los metales** (cuchillo, puñal, navaja) | Tragedia, muerte violenta |
| **Las hierbas** | Muerte, cementerio |
| **El verde** | Deseo frustrado, muerte |
| **El toro** | Virilidad, sacrificio |
| **El espejo** | El hogar, lo estático frente al viaje |

## Las obras

### Etapa de juventud y neopopularismo

**Libro de poemas** (1921), *Canciones* (1927) y ***Poema del cante jondo*** (escrito en 1921, publicado en 1931), donde asimila la **raíz andaluza y flamenca**: la siguiriya, la soleá, el llanto, con extraordinaria capacidad de síntesis.

### ***Romancero gitano*** (1928)

Su obra más famosa y un éxito editorial sin precedentes. Reúne **dieciocho romances** en los que el **gitano** funciona como **símbolo del ser humano perseguido**, no como asunto folclórico: es el pueblo marginado, libre e instintivo, aplastado por el orden social que encarna la **Guardia Civil**.

**Procedimiento:** injerta **metáforas de audacia vanguardista** sobre el molde métrico más tradicional, el **romance** (octosílabos con rima asonante en los pares). Esa fusión de culto y popular es la esencia del 27.

**Poemas capitales:** "Romance sonámbulo" ("Verde que te quiero verde"), "La casada infiel", "Romance de la luna, luna" (donde la luna baja a la fragua y se lleva al niño), "Romance de la Guardia Civil española", "Prendimiento de Antoñito el Camborio".

Lorca llegó a **incomodarse** con el éxito del libro, porque temía que se le encasillara como poeta gitanista: *"me va molestando un poco mi mito de gitanería"*.

### ***Poeta en Nueva York*** (escrito 1929-30, publicado póstumo en 1940)

Fruto de su estancia en la Universidad de Columbia, coincidiendo con el **crac del 29**. Es una obra radicalmente distinta:

- **Verso libre**, extenso y torrencial; desaparece la métrica tradicional.
- **Imágenes surrealistas** violentas e irracionales.
- **Temas:** la **deshumanización** de la civilización capitalista, la ciudad como monstruo de hierro y cemento, la **injusticia social**, la soledad del hombre moderno, la angustia personal.
- **Solidaridad con los negros de Harlem**, a quienes ve como los gitanos de Nueva York: pueblo con raíz, dignidad y dolor, oprimido por la máquina económica ("Oda al rey de Harlem").
- Denuncia del dinero y de Wall Street ("Danza de la muerte", "Nueva York. Oficina y denuncia").

### Etapa final

- ***Llanto por Ignacio Sánchez Mejías*** (1935), elegía por el torero amigo muerto en la plaza. Es una de las grandes elegías de la lengua española, en cuatro partes con métricas distintas, con el verso obsesivo *"a las cinco de la tarde"*.
- ***Diván del Tamarit*** (1936), inspirado en la poesía arábigo-andaluza (casidas y gacelas).
- ***Sonetos del amor oscuro*** (1935-36), sonetos clásicos de tema amoroso, no publicados hasta 1984.

## El "duende"

Concepto lorquiano expuesto en su conferencia *Juego y teoría del duende* (1933). El **duende** es la fuerza misteriosa, telúrica y oscura que estremece al artista y al público; se opone a la musa (inspiración) y al ángel (gracia). Está ligado a la **muerte** y a la raíz popular andaluza.`,
    worked_example_markdown: `## Ejemplo guiado: comentario del "Romance de la luna, luna"

> *"La luna vino a la fragua*
> *con su polisón de nardos.*
> *El niño la mira, mira.*
> *El niño la está mirando.*
> *En el aire conmovido*
> *mueve la luna sus brazos*
> *y enseña, lúbrica y pura,*
> *sus senos de duro estaño."*

**Paso 1 — Identifica el símbolo central.**
La **luna** es, en Lorca, la **muerte**. El poema entero narra cómo la muerte, personificada en una mujer seductora, viene a llevarse a un niño gitano. Sabiendo esto, todo el romance se descifra: no es una escena mágica, es una **agonía infantil**.

**Paso 2 — Analiza la personificación.**
La luna lleva "**polisón de nardos**" (prenda femenina del XIX + flor blanca, funeraria), "mueve los brazos", "enseña sus senos". Se comporta como una **bailarina que seduce**. La muerte no llega como amenaza sino como **atracción irresistible**, lo que la hace más terrible.

**Paso 3 — Fíjate en el oxímoron.**
"**Lúbrica y pura**" reúne dos adjetivos contradictorios: lasciva y casta a la vez. Condensa la ambigüedad de la muerte lorquiana, que es simultáneamente **erótica y virginal**, deseable y helada.

**Paso 4 — Observa el material.**
"Senos de **duro estaño**": el metal aporta **frialdad, dureza y brillo**. Los metales en Lorca anuncian tragedia. Un seno debería ser cálido y blando; siendo de estaño, es ya un seno **muerto**.

**Paso 5 — Analiza la repetición.**
"El niño la mira, mira. / El niño la está mirando." La **reiteración** y el cambio a perífrasis durativa ("está mirando") producen el efecto de un **tiempo suspendido y de fascinación hipnótica**. El niño no puede apartar la vista: ya está atrapado.

**Paso 6 — Comprueba la forma.**
**Romance**: octosílabos con rima asonante á-o en los pares. Molde **tradicional** que hace el poema memorable y oral, cargado de **imágenes vanguardistas** (el polisón de nardos, los senos de estaño). De nuevo, la **síntesis del 27**.

**Redacción final (200 palabras):**
> *El fragmento inicial del "Romance de la luna, luna", de* Romancero gitano *(1928), muestra el sistema simbólico lorquiano en pleno funcionamiento. La **luna**, símbolo constante de la **muerte** en su obra, aparece **personificada** como una mujer seductora que baja a la fragua a llevarse al niño gitano: viste "polisón de nardos" —prenda femenina y flor de connotaciones funerarias—, mueve los brazos y exhibe su cuerpo. La muerte no se presenta, así, como amenaza sino como **fascinación**, lo que intensifica su carácter trágico.*
>
> *El **oxímoron** "lúbrica y pura" condensa esa ambigüedad esencial, a la vez erótica y virginal, mientras que los "senos de duro **estaño**" incorporan el **metal**, elemento que en Lorca anuncia siempre la tragedia: la frialdad y dureza del material convierten un atributo de vida en signo de muerte.*
>
> *La **reiteración** "la mira, mira… la está mirando", con paso a perífrasis durativa, crea un tiempo suspendido de fascinación hipnótica. Todo ello se vierte en el molde del **romance** tradicional, sobre el que Lorca injerta imágenes de audacia vanguardista, procedimiento característico de la Generación del 27.*

## Diferencias entre *Romancero gitano* y *Poeta en Nueva York*

| | *Romancero gitano* (1928) | *Poeta en Nueva York* (1929-30) |
|---|---|---|
| **Métrica** | Romance tradicional, octosílabo | **Verso libre** extenso |
| **Imágenes** | Metáfora audaz pero descifrable | **Surrealistas**, irracionales |
| **Espacio** | Andalucía rural y mítica | **Ciudad** industrial, Harlem, Wall Street |
| **Marginado** | El **gitano** | El **negro** |
| **Tono** | Trágico, musical | Angustiado, violento, profético |`,
    practice_prompt: 'Explica el significado de seis símbolos lorquianos y localiza un ejemplo de cada uno en poemas del "Romancero gitano". Después señala cuatro diferencias entre "Romancero gitano" y "Poeta en Nueva York" en métrica, imágenes, espacio y tema, y explica a qué se debe el cambio.',
    alert_markdown: '⚠️ **El "Romancero gitano" no es folclore andaluz.** El propio Lorca protestaba contra esa lectura. El gitano es un **símbolo del ser humano perseguido y marginado**, y el libro es una obra de altísima elaboración culta, no una recopilación de poesía popular.',
  },

  {
    sort_order: 53,
    title: 'El Teatro de Lorca',
    concept_markdown: `## La concepción del teatro

Lorca definió el teatro como *"poesía que se levanta del libro y se hace humana"*. Para él no era un género menor ni un complemento de su obra lírica: comparte con ella **temas, símbolos y visión del mundo**.

Su compromiso con la escena fue también social: dirigió ***La Barraca*** (1932-1936), compañía universitaria financiada por la República que recorría los pueblos de España representando a **Lope, Calderón y Cervantes** para un público que nunca había visto teatro.

## El conflicto único

Todo el teatro lorquiano desarrolla un mismo enfrentamiento:

> **El principio de autoridad** (la norma social, la moral establecida, la honra, la tradición, el "qué dirán")
> **contra**
> **el principio de libertad** (el deseo individual, el instinto, el amor, la voluntad de vivir).

El deseo **nunca se realiza**. El desenlace es siempre **trágico**: muerte, esterilidad o encierro.

## Elementos característicos

**1. Protagonismo femenino.** Sus grandes personajes son **mujeres**: frustradas, estériles, encerradas, sometidas a un código social que las anula. Lorca ve en la mujer de la España rural la víctima máxima de la represión.

**2. Símbolos** compartidos con su poesía: la **luna** (muerte), el **agua** (vida o muerte según corra o esté estancada), la **sangre**, el **caballo** (pasión, erotismo), el **cuchillo** y los metales (tragedia), el **color verde**, el **blanco y el negro**.

**3. Mezcla de prosa y verso.** El verso irrumpe en los momentos de mayor intensidad lírica o ritual.

**4. Elementos corales** de raíz clásica: lavanderas, segadores, criadas, que comentan la acción como el coro de la tragedia griega y anticipan el destino.

**5. Presencia constante de la muerte**, a menudo personificada (la Mendiga en *Bodas de sangre*).

**6. Ambientación rural andaluza**, no costumbrista sino **estilizada y simbólica**, elevada a categoría de tragedia universal.

## Trayectoria

### 1. Primeras obras y farsas
- *El maleficio de la mariposa* (1920), fracaso absoluto.
- ***Mariana Pineda*** (1927), drama histórico en verso sobre la heroína liberal granadina.
- Farsas sobre **matrimonios desiguales por interés**: ***La zapatera prodigiosa*** (1930) y *Amor de don Perlimplín con Belisa en su jardín*.

### 2. El teatro "imposible" o vanguardista
Obras influidas por el **surrealismo**, que Lorca sabía irrepresentables en su época:
- ***El público*** (1930), sobre la **libertad amorosa**, la homosexualidad y la naturaleza misma del teatro.
- *Así que pasen cinco años* (1931).

### 3. La trilogía trágica rural — su cumbre

| Obra | Año | Conflicto y desenlace |
|---|---|---|
| ***Bodas de sangre*** | 1933 | La Novia huye con **Leonardo** el día de su boda. El Novio los persigue y ambos hombres se matan. Choque entre la **pasión** y el código del **honor** y la propiedad |
| ***Yerma*** | 1934 | Yerma no consigue tener hijos. Su ansia de **maternidad** frustrada y la honra la llevan a **estrangular a su marido** Juan, con lo que se condena a la esterilidad definitiva |
| ***La casa de Bernarda Alba*** | 1936 | Bernarda impone **ocho años de luto** a sus cinco hijas. **Adela** se rebela por Pepe el Romano y, creyéndolo muerto, se **suicida**. Bernarda impone el silencio y la falsa virginidad |

**En *Bodas de sangre*** aparecen la Luna y la Mendiga (la Muerte) como personajes alegóricos en verso, y el coro de leñadores.

**En *Yerma*** destaca el coro de lavanderas y la romería final, ritual de fecundidad.

### ***La casa de Bernarda Alba*** en detalle

Terminada en **junio de 1936**, dos meses antes de su asesinato; nunca la vio representada. Lleva el subtítulo ***"drama de mujeres en los pueblos de España"*** y una acotación reveladora: *"El poeta advierte que estos tres actos tienen la intención de un documental fotográfico"*.

- **Prescinde casi por completo del verso**: es su obra más despojada y realista en la forma, aunque profundamente simbólica en el fondo.
- **Símbolos:** el **bastón** de Bernarda (autoridad, que Adela rompe), el **color blanco** de los muros que se va ensuciando acto a acto, el **negro** del luto, el **calor** asfixiante, el **caballo garañón** que cocea en el establo (deseo reprimido), el **vestido verde** de Adela, el **agua** (el pozo, la sed).
- **Personajes:** Bernarda (autoridad), Adela (libertad), María Josefa (la abuela loca, que dice la verdad que nadie se atreve a decir), La Poncia (criada, contrapunto popular), Angustias, Magdalena, Amelia, Martirio (la envidia).
- **Espacio:** el **encierro**. La casa es una cárcel, y Pepe el Romano —motor de toda la acción— **nunca aparece en escena**.
- **Final:** Bernarda impone el silencio con su grito reiterado *"¡Silencio!"*, imponiendo la apariencia sobre la verdad.

## Trascendencia

Lorca devolvió al teatro español la **altura trágica** que no tenía desde el Siglo de Oro y lo conectó con las vanguardias europeas. Es, junto con Valle-Inclán, el gran renovador dramático del siglo XX.`,
    worked_example_markdown: `## Ejemplo guiado: el conflicto autoridad/libertad en *La casa de Bernarda Alba*

Diálogo del acto tercero:

> *ADELA: (Haciéndole frente) ¡Aquí se acabaron las voces de presidio! (Adela arrebata un bastón a su madre y lo parte en dos.) Esto hago yo con la vara de la dominadora. No dé usted un paso más. ¡En mí no manda nadie más que Pepe!*

**Paso 1 — Identifica el símbolo y su destrucción.**
El **bastón** de Bernarda es, desde la primera escena, el símbolo de su **autoridad**. Que Adela lo **parta en dos** es el momento culminante de la obra: la rebelión no se enuncia, **se escenifica** en un objeto. Todo el conflicto de la obra cabe en ese gesto.

**Paso 2 — Analiza el léxico del encierro.**
"Voces de **presidio**", "la **dominadora**": Adela nombra por fin lo que la casa es en realidad, una **cárcel**, y a su madre, una **carcelera**. Durante dos actos ese contenido estaba solo sugerido por el espacio y el luto; aquí se hace explícito.

**Paso 3 — Observa la ironía trágica.**
"En mí no manda nadie más que Pepe". Adela cree liberarse, pero **sustituye una sumisión por otra**: pasa del dominio de la madre al del hombre. Lorca no ofrece una salida real: en esa sociedad, la libertad de la mujer no existe en ninguna dirección. Ese matiz es esencial y casi nadie lo señala.

**Paso 4 — Conecta con el desenlace.**
Martirio miente diciendo que Pepe ha muerto; Adela se ahorca. Bernarda, sobre el cadáver, proclama que su hija ha muerto **virgen** y ordena silencio. Vence, por tanto, el **principio de autoridad**, pero solo en la **apariencia**: la verdad se sacrifica para salvar la honra.

**Paso 5 — Formula el sentido global.**
La obra plantea que la **honra** —el "qué dirán"— es una fuerza tan poderosa que puede **matar** y luego **falsificar** la muerte. Es el conflicto de todo el teatro lorquiano llevado a su formulación más desnuda.

**Redacción final (200 palabras):**
> *La escena constituye el clímax del conflicto que estructura todo el teatro de Lorca: el enfrentamiento entre el **principio de autoridad** y el **principio de libertad**.*
>
> *Adela **parte en dos el bastón** de su madre, objeto que desde la primera escena simboliza el poder de Bernarda. La rebelión no se argumenta: **se escenifica** en un gesto, procedimiento característico del teatro simbólico lorquiano. El léxico confirma la lectura de la casa como prisión —"voces de presidio", "la dominadora"—, haciendo explícito lo que el espacio cerrado, el luto y el calor asfixiante venían sugiriendo.*
>
> *Existe, sin embargo, una **ironía trágica** decisiva: al proclamar "en mí no manda nadie más que Pepe", Adela **sustituye una sumisión por otra**. Lorca no concede a la mujer una salida real dentro de esa sociedad.*
>
> *El desenlace lo confirma: Adela se suicida y Bernarda, sobre su cadáver, proclama que ha muerto virgen e impone el silencio. Vence la autoridad, pero solo en la **apariencia**: la honra se salva falsificando la verdad, y con ello Lorca formula su crítica más severa a la moral de la España rural.*`,
    practice_prompt: 'Explica el conflicto central del teatro lorquiano e identifica qué personajes encarnan cada polo en "La casa de Bernarda Alba". Después analiza cinco símbolos de la obra (bastón, colores, calor, caballo, agua) y explica el sentido del "¡Silencio!" final de Bernarda.',
    alert_markdown: '⚠️ **La trilogía rural son exactamente tres obras: *Bodas de sangre*, *Yerma* y *La casa de Bernarda Alba*.** Incluir en ella *La zapatera prodigiosa* o *Doña Rosita la soltera* es un error frecuente: son farsas y drama urbano, de línea distinta.',
  },

  {
    sort_order: 54,
    title: 'La Poesía de 1939 a la Actualidad',
    concept_markdown: `## El punto de partida: la ruptura de 1939

La Guerra Civil arrasa el panorama poético español:
- **Lorca ha sido asesinado** (1936).
- **Machado muere en el exilio** (1939).
- **Miguel Hernández** muere en la cárcel de Alicante en **1942**.
- Se exilian **Juan Ramón**, **Salinas**, **Guillén**, **Cernuda**, **Alberti**, **Prados**, **Altolaguirre**.
- Permanecen en España **Dámaso Alonso**, **Aleixandre** y **Gerardo Diego**.

### Miguel Hernández (1910-1942)
Llamado **"genial epígono" del 27** por Dámaso Alonso, es figura puente entre el 27 y la posguerra. Pastor autodidacta de Orihuela, evoluciona desde el gongorismo de *Perito en lunas* (1933) al **soneto amoroso** de ***El rayo que no cesa*** (1936), con su célebre "Elegía a Ramón Sijé"; después a la **poesía de guerra** comprometida (*Viento del pueblo*, 1937) y finalmente al desgarro íntimo y desnudo del ***Cancionero y romancero de ausencias***, escrito en prisión y publicado póstumamente, donde están las "Nanas de la cebolla".

## Años 40: arraigada y desarraigada

| | **Poesía arraigada** | **Poesía desarraigada** |
|---|---|---|
| **Revistas** | *Escorial*, *Garcilaso* | *Espadaña* (León, 1944) |
| **Visión del mundo** | Ordenado, armónico, coherente | **Caótico y angustioso** |
| **Temas** | Amor, paisaje, familia, sentimiento religioso sereno | **Angustia existencial**, muerte, Dios ausente, desesperación |
| **Forma** | **Soneto** y métrica clásica (**garcilasismo**) | **Verso libre**, lenguaje áspero |
| **Autores** | Luis Rosales, Leopoldo Panero, Luis Felipe Vivanco, Dionisio Ridruejo | **Dámaso Alonso**, Blas de Otero, Victoriano Crémer, Eugenio de Nora |
| **Obras** | *La casa encendida* (Rosales, 1949) | ***Hijos de la ira*** (Dámaso, 1944), *Ángel fieramente humano* (Otero, 1950) |

El **garcilasismo** —vuelta a las formas clásicas del XVI— fue la poesía oficial del régimen; la **desarraigada** expresa el desgarro de quienes no podían aceptar ese mundo ordenado.

Aparte queda el **postismo**, vanguardia tardía y lúdica de **Carlos Edmundo de Ory**.

## Años 50: la poesía social

La poesía se concibe como **instrumento de transformación de la realidad**. Se rechaza el esteticismo: importa **qué** se dice, no cómo.

**Rasgos:**
- Destinatario **colectivo**: se escribe "**a la inmensa mayoría**" (Blas de Otero), invirtiendo el "a la inmensa minoría" de Juan Ramón.
- Temas **colectivos**: España, la injusticia social, el trabajo, la solidaridad, la libertad.
- **Lenguaje sencillo y directo**, con tono coloquial y a veces prosaico.
- El poeta se siente **testigo y portavoz**.

**Autores y obras:**
- **Blas de Otero**: ***Pido la paz y la palabra*** (1955), *Que trata de España*. Evoluciona del existencialismo a lo social.
- **Gabriel Celaya**: *Cantos iberos* (1955), con el verso-manifiesto *"la poesía es un arma cargada de futuro"*.
- **José Hierro**: *Quinta del 42*, entre lo social y lo existencial.

## Años 60: la generación del medio siglo

Reacción contra el prosaísmo y la simplificación de la poesía social, sin abandonar del todo la preocupación ética.

**Rasgos:**
- Vuelta a la **experiencia personal**: la infancia, la adolescencia, el amor, la amistad, el paso del tiempo.
- **Escepticismo** e **ironía**; tono conversacional y antirretórico.
- Renovada **exigencia con el lenguaje**: la poesía vuelve a ser conocimiento, no propaganda.
- Uso frecuente del **monólogo dramático** y de la **distancia irónica** hacia el propio yo.

**Autores:** **Jaime Gil de Biedma** (*Moralidades*, 1966; *Poemas póstumos*), **Ángel González** (*Áspero mundo*), **José Ángel Valente**, **Claudio Rodríguez** (*Don de la ebriedad*, escrito a los 19 años), **Francisco Brines**, **Carlos Barral**, **José Agustín Goytisolo**.

## Años 70: los novísimos

La antología ***Nueve novísimos poetas españoles*** (1970), de **José María Castellet**, marca la ruptura.

**Rasgos:**
- **Culturalismo**: abundantes referencias a la alta cultura (mitología, arte, literatura extranjera) — el llamado "venecianismo".
- Incorporación de la **cultura de masas**: cine, cómic, música pop, publicidad.
- **Experimentación** formal: collage, escritura automática, ruptura sintáctica.
- **Esteticismo** y rechazo explícito del realismo social anterior.

**Autores:** **Pere Gimferrer** (*Arde el mar*, 1966), **Guillermo Carnero**, **Leopoldo María Panero**, **Manuel Vázquez Montalbán**, **Ana María Moix**.

## De 1980 a la actualidad

Predomina el **eclecticismo**. Las líneas principales:

- **Poesía de la experiencia**: vuelta a la **claridad**, el tono conversacional, la anécdota cotidiana y el marco **urbano**. Es la corriente dominante en los 80 y 90. **Luis García Montero** (*Habitaciones separadas*), **Felipe Benítez Reyes**, **Carlos Marzal**.
- **Poesía del silencio** o minimalista: esencialidad, depuración extrema, herencia de Valente. **Jaime Siles**, **Andrés Sánchez Robayna**.
- **Neosurrealismo** y poesía visionaria: **Blanca Andreu**.
- **Poesía erótica y de voz femenina**: **Ana Rossetti**, **Luisa Castro**, **Chantal Maillard**.
- **Poesía de la conciencia crítica** y, ya en el siglo XXI, la difusión masiva a través de **redes sociales**, con el debate sobre la calidad que ello ha abierto.`,
    worked_example_markdown: `## Ejemplo guiado: cómo se reconoce cada etapa

**Texto A** — Blas de Otero, *Pido la paz y la palabra* (1955):
> *"Escribo / en defensa del reino / del hombre y su justicia. Pido / la paz y la palabra."*

**Análisis:**
- **Destinatario colectivo** y propósito explícito: "en defensa del reino del hombre".
- **Léxico común**, sin ornamento; sintaxis sencilla.
- El **encabalgamiento** abrupto ("Escribo / en defensa") da tono de urgencia, casi de proclama.
- Tema **social y ético**: justicia, paz, libertad de expresión ("la palabra" en plena censura).
→ **Poesía social de los años 50.**

**Texto B** — Jaime Gil de Biedma, *Poemas póstumos* (1968):
> *"Que la vida iba en serio / uno lo empieza a comprender más tarde / —como todos los jóvenes, yo vine / a llevarme la vida por delante."*

**Análisis:**
- **Experiencia personal** y biográfica; tema del **paso del tiempo**.
- Tono **conversacional**: "uno lo empieza a comprender", "llevarme la vida por delante" son giros del habla.
- **Ironía** y distancia hacia el propio yo juvenil ("como todos los jóvenes").
- Verso libre de ritmo próximo a la prosa, sin rima.
→ **Generación del medio siglo (años 60).**

**Texto C** — Pere Gimferrer, *Arde el mar* (1966):
> *"Como en el cine cuando la pantalla / se ilumina de pronto y el patio de butacas / es un lago de sombras…"*

**Análisis:**
- Referencia a la **cultura de masas** (el cine) integrada como material poético.
- **Esteticismo** y sensualidad de la imagen; sin denuncia social.
- **Culturalismo** y voluntad de brillo verbal.
→ **Novísimos (años 70).**

## Esquema para responder el tema completo (2 puntos)

Una frase por etapa, con **autor y obra fechada**. Esta plantilla cubre el tema entero:

> *Tras la ruptura de 1939, la poesía española recorre las siguientes etapas.*
>
> *En los **años 40** conviven la **poesía arraigada**, de visión serena y métrica clásica (**Rosales**, *La casa encendida*, 1949), y la **desarraigada**, que expresa la angustia existencial en verso libre y lenguaje áspero, inaugurada por* **Hijos de la ira** *de **Dámaso Alonso** (1944).*
>
> *En los **años 50** se impone la **poesía social**, concebida como instrumento de denuncia y dirigida "a la inmensa mayoría": **Blas de Otero**, *Pido la paz y la palabra* (1955), y **Gabriel Celaya**, para quien "la poesía es un arma cargada de futuro".*
>
> *En los **años 60**, la **generación del medio siglo** recupera la experiencia personal, la ironía y el rigor verbal: **Gil de Biedma**, **Ángel González**, **Claudio Rodríguez**.*
>
> *En los **70**, los **novísimos** de la antología de **Castellet** (1970) practican el culturalismo, la experimentación y la incorporación de la cultura de masas: **Pere Gimferrer**.*
>
> *Desde **1980** domina el eclecticismo, con la **poesía de la experiencia** como corriente principal (**Luis García Montero**), junto a la poesía del silencio y nuevas voces femeninas.*`,
    practice_prompt: 'Redacta el tema "La poesía de 1939 hasta la actualidad" en 200 palabras, dedicando una frase a cada etapa con un autor y una obra fechada. Después explica la diferencia entre poesía arraigada y desarraigada y localiza en dos textos breves los rasgos que permiten datarlos en su etapa.',
    alert_markdown: '⚠️ **Miguel Hernández no pertenece al 27 ni a la posguerra exactamente.** Dámaso Alonso lo llamó **"genial epígono" del 27**: nace en 1910, es más joven que el grupo, y murió en la cárcel de Alicante en **1942**. Su *Cancionero y romancero de ausencias* es póstumo.',
  },

  {
    sort_order: 55,
    title: 'La Novela Española de 1939 a 1974',
    concept_markdown: `## El punto de partida

La Guerra Civil deja la novela española en una situación de **absoluta precariedad**: exiliados los grandes narradores (**Max Aub**, **Ramón J. Sender**, **Francisco Ayala**, **Rosa Chacel**), instalada la **censura**, roto el contacto con la literatura europea y americana. La novela debe empezar casi de cero, y su evolución va **paralela a las etapas históricas del franquismo**.

## Años 40: la novela existencial y el tremendismo

**Contexto:** represión política, aislamiento internacional, autarquía económica, cartillas de racionamiento.

Junto a la novela **triunfalista** (que narra la guerra desde la óptica de los vencedores) y la de **evasión** (sentimental, de aventuras), aparece una corriente que refleja la **amargura y la desorientación** del momento.

**Rasgos de la novela existencial:**
- Personajes **marginados, desorientados o violentos**.
- Temas: la **angustia**, la frustración, la soledad, la muerte, la falta de sentido.
- Ambientes **sórdidos**; visión pesimista.
- Narración a menudo en **primera persona**.

**Obras clave:**

***La familia de Pascual Duarte*** (1942), de **Camilo José Cela**. Inaugura el **tremendismo**, corriente que se caracteriza por:
- **Acumulación de episodios violentos, crueles y desagradables**.
- Personajes **primarios**, dominados por instintos elementales, a menudo **animalizados**.
- **Determinismo del medio**: el ambiente rural, miserable y brutal condiciona el destino del protagonista.
- Lenguaje **popular y directo** que contrasta con la brutalidad de lo narrado.
Pascual Duarte narra desde la cárcel, en primera persona, la cadena de crímenes de su vida, que culmina en el asesinato de su propia madre.

***Nada*** (1945), de **Carmen Laforet**, Premio Nadal. Andrea llega a la Barcelona de posguerra para estudiar y encuentra una familia degradada por el hambre, la violencia y la locura en el piso de la calle Aribau. **Novela existencial** por excelencia: el vacío, la desilusión y el desajuste entre expectativa y realidad.

También *La sombra del ciprés es alargada* (1948), de **Miguel Delibes**, Premio Nadal.

## Años 50: el realismo social

**Contexto:** fin del aislamiento (acuerdos con EE. UU. y concordato con el Vaticano, 1953), leve apertura, aparición de la **Generación del medio siglo**, que vivió la guerra siendo niña.

La novela se concibe como **testimonio y denuncia**: mostrar la realidad para que el lector tome conciencia de la injusticia y contribuya a cambiarla. Es la aplicación narrativa del **compromiso**.

**Rasgos técnicos:**
- **Protagonista colectivo**: no un individuo, sino un grupo social entero.
- **Objetivismo o conductismo**: el narrador **desaparece**, se limita a registrar lo que se ve y se oye, como una **cámara**. No entra en la conciencia de los personajes ni los juzga.
- **Concentración espacial y temporal**: la acción transcurre en pocas horas o días y en un espacio único.
- Predominio del **diálogo**, que reproduce el habla coloquial.
- **Lenguaje sencillo**, sin experimentación.

**Obras clave:**

***La colmena*** (1951, publicada en Buenos Aires por la censura), de **Cela**. Más de **300 personajes** en el Madrid de 1943, durante tres días. **Protagonista colectivo** y estructura **caleidoscópica**: 213 secuencias breves que saltan de un personaje a otro y rompen la linealidad temporal. El hambre, la prostitución, la sordidez y el miedo del Madrid de posguerra.

***El Jarama*** (1955), de **Rafael Sánchez Ferlosio**, Premio Nadal. Un domingo de once jóvenes madrileños junto al río Jarama; al final, una de ellas se ahoga. **Objetivismo radical**: casi todo es diálogo transcrito, sin que el narrador interprete nada. Se ha comparado con una **grabación magnetofónica**.

**Otras obras y autores:** **Miguel Delibes**, *El camino* (1950) y *Las ratas* (1962), retrato del mundo rural con estilo sobrio; **Ana María Matute**, *Los hijos muertos*; **Juan Goytisolo**, *Juegos de manos*; **Ignacio Aldecoa**, *El fulgor y la sangre*; **Carmen Martín Gaite**, *Entre visillos* (1957), sobre la vida de las jóvenes de provincias; **Jesús Fernández Santos**, *Los bravos*.

## Años 60 y primeros 70: la novela experimental

**Contexto:** desarrollismo económico, turismo, emigración, suavización relativa de la censura, llegada de las traducciones de **Joyce, Faulkner, Kafka, Proust** y del **boom hispanoamericano**.

Agotado el realismo social —que había llegado a ser previsible y a descuidar la forma—, la novela se renueva **técnicamente**. Ya no basta con contar la realidad: hay que **indagar en la conciencia** y **experimentar con el lenguaje**.

**Rasgos técnicos:**
- Ruptura de la **linealidad temporal**: saltos, contrapunto, simultaneísmo.
- **Monólogo interior** y **segunda persona narrativa** (el personaje se habla a sí mismo).
- **Narrador cambiante** o múltiple; perspectivismo.
- Desaparece el capítulo tradicional, sustituido por **secuencias** separadas por blancos.
- Desorden sintáctico, **ausencia de puntuación**, párrafos-río.
- Incorporación de **materiales ajenos**: recortes de prensa, anuncios, informes (**collage**).
- **Digresiones ensayísticas** del narrador.
- Menor importancia del **argumento**; el protagonista suele ser un individuo **en conflicto** consigo mismo.

**Obras clave:**

***Tiempo de silencio*** (1962), de **Luis Martín-Santos**. La obra **bisagra** que abre la etapa. Pedro, joven investigador del cáncer, se ve arrastrado a una tragedia en los suburbios de Madrid tras practicar un aborto fallido. Combina **crítica social** (una radiografía despiadada de todas las clases de la España de los 50) con **innovación formal**: monólogo interior, digresiones ensayísticas, ironía, lenguaje culto, científico y barroco.

***Cinco horas con Mario*** (1966), de **Delibes**. Carmen vela el cadáver de su marido y le dirige un **monólogo interior** de reproches durante toda una noche, a partir de los versículos bíblicos que él había subrayado. Retrato de las **dos Españas** irreconciliables a través de una sola voz.

**Otras obras:** *Señas de identidad* (1966) de **Juan Goytisolo**; *Volverás a Región* (1967) de **Juan Benet**, de gran dificultad y territorio mítico propio; *San Camilo, 1936* de **Cela**; *Los gozos y las sombras* de **Gonzalo Torrente Ballester**; *Últimas tardes con Teresa* (1966) de **Juan Marsé**; *Retahílas* de **Carmen Martín Gaite**.

## La novela del exilio

No debe olvidarse: **Ramón J. Sender** (*Réquiem por un campesino español*, 1953), **Max Aub** (*El laberinto mágico*, sobre la guerra), **Francisco Ayala**, **Rosa Chacel**, **Arturo Barea** (*La forja de un rebelde*).`,
    worked_example_markdown: `## Ejemplo guiado: los rasgos del tremendismo en un texto

Es la pregunta que cayó **literalmente** en el modelo oficial de PAU 2026.

Fragmento de ***La familia de Pascual Duarte*** (1942):

> *"De mi niñez no son precisamente buenos recuerdos los que guardo. Mi padre se llamaba Esteban Duarte Diniz, y era portugués, cuarentón cuando yo niño, y alto y gordo como un monte. […] Cuando se enfurecía, cosa que le ocurría con mayor frecuencia de lo que se necesitaba, nos pegaba a mi madre y a mí las grandes palizas por cualquier cosa, palizas que mi madre procuraba devolverle por ver de corregirlo, pero ante las cuales a mí no me quedaba sino resignación dados mis pocos años. ¡Se tienen las carnes muy tiernas a tan corta edad!"*

**Pregunta:** *Escriba cuatro rasgos de la novela tremendista y ejemplifique, con citas, su presencia en el texto.*

**Rasgo 1 — La violencia presentada como cotidiana.**
El tremendismo acumula episodios brutales narrados **sin dramatismo**, como si fueran normales. Cita: *"nos pegaba a mi madre y a mí las grandes palizas por cualquier cosa"*. El maltrato aparece como rutina doméstica, y esa **naturalidad** lo hace más estremecedor que cualquier énfasis.

**Rasgo 2 — Personajes primarios y animalizados.**
Los seres humanos quedan reducidos a **corpulencia e instinto**. Cita: *"alto y gordo como un monte"*, símil que despoja al padre de todo rasgo moral o psicológico para dejar solo la **masa física**; y *"cuando se enfurecía, cosa que le ocurría con mayor frecuencia de lo que se necesitaba"*, donde la furia se presenta como un mecanismo automático, no como una decisión.

**Rasgo 3 — Determinismo del medio.**
El ambiente familiar **condiciona** el destino criminal del protagonista, anticipado desde la primera línea. Cita: *"De mi niñez no son precisamente buenos recuerdos los que guardo"*. El lector sabe desde el arranque que de ese origen no puede salir nada bueno: es el determinismo de raíz naturalista.

**Rasgo 4 — Narrador autobiográfico y lenguaje popular.**
Pascual escribe **en primera persona desde la cárcel**, con expresión llana, giros coloquiales y sintaxis del habla. Cita: *"¡Se tienen las carnes muy tiernas a tan corta edad!"*, exclamación de tono casi tierno que **contrasta brutalmente** con el contenido —las palizas a un niño—. Ese choque entre la ternura de la forma y el horror del contenido es una de las claves del estilo de Cela.

**Formato de la respuesta:** cada rasgo con su **nombre técnico** + su **cita literal entre comillas** + la **explicación del efecto**. Cuatro rasgos, cuatro citas. Sin citas, la respuesta no puntúa.

## Cómo se distinguen las tres etapas en un texto

| Si ves… | Es de… |
|---|---|
| Narrador en 1ª persona, violencia, ambiente sórdido, personaje marginal | **Años 40** (existencial / tremendismo) |
| Todo diálogo, narrador ausente, muchos personajes, un solo día | **Años 50** (realismo social) |
| Monólogo interior, saltos temporales, sin puntuación, digresiones cultas | **Años 60** (experimental) |`,
    practice_prompt: 'Explica las tres etapas de la novela de 1939 a 1974 con dos obras fechadas de cada una y tres rasgos técnicos por etapa. Después coge el fragmento de "La familia de Pascual Duarte" y escribe cuatro rasgos del tremendismo, cada uno con su cita literal y la explicación de su efecto.',
    alert_markdown: '⚠️ ***Tiempo de silencio* (1962) es la obra bisagra.** Marca el agotamiento del realismo social y el arranque de la experimentación. Si te preguntan por la novela de los sesenta y no la citas, falta lo esencial del tema.',
  },

  {
    sort_order: 56,
    title: 'La Novela Española de 1975 a la Actualidad',
    concept_markdown: `## El cambio de contexto

La muerte de **Franco** (noviembre de 1975), la **Transición** y la **Constitución de 1978** traen la **desaparición de la censura**, la recuperación de los autores prohibidos y del exilio, la normalización de la vida cultural y la incorporación plena de España al circuito editorial internacional.

En lo literario ocurre además otra cosa: el **experimentalismo** de los años sesenta había llegado a un punto de dificultad tal que la novela perdía lectores. La reacción es una **vuelta al placer de contar**.

## El giro: la recuperación de la narratividad

La novela **recupera la trama, el personaje y el interés del lector**. Vuelven el argumento con planteamiento y desenlace, la intriga, los géneros populares. No se renuncia a las conquistas técnicas anteriores, pero se ponen **al servicio de la historia** y no al revés.

Suele señalarse como **punto de inflexión** ***La verdad sobre el caso Savolta*** (1975), de **Eduardo Mendoza**, que mezcla novela policíaca, novela histórica sobre la Barcelona del pistolerismo de 1917 y técnicas experimentales (documentos, informes, cambios de narrador), pero con una **trama apasionante**.

## Rasgos generales del periodo

**1. Eclecticismo.** Es el rasgo definitorio: conviven todas las tendencias sin que ninguna se imponga. No hay escuelas, ni manifiestos, ni grupos generacionales.

**2. Individualismo.** Cada autor sigue su propio camino; se acabaron las poéticas colectivas.

**3. Vuelta a la narratividad** y a la estructura clara.

**4. Peso creciente del mercado editorial**, de los **premios literarios** y de la promoción.

**5. Incorporación plena de las escritoras** al centro del canon.

**6. Auge del **relato corto** y de la novela de géneros antes considerados menores.

## Las tendencias

### Novela histórica
Reconstrucción documentada del pasado, a veces con clave sobre el presente.
- **Delibes**, *El hereje* (1998), sobre los protestantes vallisoletanos del XVI.
- **Arturo Pérez-Reverte**, serie del *Capitán Alatriste*, *El maestro de esgrima*.
- **Umberto Eco** como referencia europea del auge del género.

### Novela policíaca y negra
La investigación funciona como **radiografía social** de la España del momento.
- **Manuel Vázquez Montalbán**, serie del detective **Pepe Carvalho** (*Los mares del sur*, 1979), crónica crítica de la Transición y de la Barcelona olímpica.
- **Lorenzo Silva** (serie Bevilacqua), **Alicia Giménez Bartlett** (serie Petra Delicado).

### Metanovela o novela sobre la novela
La obra reflexiona sobre la propia escritura o incorpora un escritor como protagonista.
- **Antonio Muñoz Molina**, *Beatus Ille* (1986).
- **Enrique Vila-Matas**, *Bartleby y compañía*, *El mal de Montano*.
- **Javier Marías**, *Corazón tan blanco* (1992), *Mañana en la batalla piensa en mí*, de larga frase digresiva y reflexión moral.

### Novela intimista y lírica
Búsqueda personal, memoria, soledad, con predominio del tono sobre la acción.
- **Julio Llamazares**, *La lluvia amarilla* (1988), monólogo del último habitante de un pueblo abandonado del Pirineo.
- **Luis Landero**, *Juegos de la edad tardía* (1989).
- **Soledad Puértolas**, **Álvaro Pombo**.

### Novela de la memoria histórica
Cobra fuerza sobre todo a partir de los años noventa y del cambio de siglo: revisión de la **Guerra Civil**, la posguerra y la represión desde la distancia generacional.
- **Javier Cercas**, *Soldados de Salamina* (2001).
- **Dulce Chacón**, *La voz dormida* (2002), sobre las presas republicanas.
- **Almudena Grandes**, serie *Episodios de una guerra interminable* (*El corazón helado*, *Inés y la alegría*).
- **Alberto Méndez**, *Los girasoles ciegos* (2004).

### Novela de la experiencia urbana y generacional
Retrato de la juventud contemporánea, lenguaje coloquial y referencias a la cultura pop.
- **José Ángel Mañas**, *Historias del Kronen* (1994).
- **Ray Loriga**, *Héroes*.

### Otras líneas
Novela **culturalista**, novela de **humor** (Eduardo Mendoza, *Sin noticias de Gurb*, 1991), **autoficción** y **novela de no ficción**.

## Autores consolidados imprescindibles

**Eduardo Mendoza** (*La ciudad de los prodigios*, 1986, gran novela sobre la Barcelona de las Exposiciones), **Antonio Muñoz Molina** (*El jinete polaco*, 1991, Premio Planeta y Nacional), **Javier Marías**, **Almudena Grandes**, **Rosa Montero** (*La hija del caníbal*), **Arturo Pérez-Reverte**, **Javier Cercas**, **Enrique Vila-Matas**, **Luis Mateo Díez**, **Manuel Rivas**.

## En el siglo XXI

Continúan el eclecticismo y la memoria histórica, y se suman la influencia de la **narrativa hispanoamericana contemporánea**, la **autoficción** (**Marta Sanz**, **Sara Mesa**), la escritura desde lo rural (**la "España vaciada"**) y la presencia creciente de voces femeninas y de nuevos formatos digitales.`,
    worked_example_markdown: `## Ejemplo guiado: identificar la tendencia a partir de un texto

**Texto A** — *La lluvia amarilla* (1988), de Julio Llamazares:
> *"Cuando la nieve caiga sobre mi cuerpo y el musgo se apodere de mi memoria, ya nadie recordará que existió este pueblo…"*

**Análisis:**
- **Monólogo** de un narrador solitario, sin apenas acción externa.
- **Tono lírico**, con predominio de la imagen y el ritmo sobre el argumento.
- Temas: **memoria**, muerte, abandono, desaparición de un mundo rural.
→ **Novela intimista y lírica.**

**Texto B** — *Soldados de Salamina* (2001), de Javier Cercas:
> *"Fue en el verano de 1994, hace ahora más de seis años, cuando oí hablar por primera vez del fusilamiento de Rafael Sánchez Mazas…"*

**Análisis:**
- Narrador que se presenta como **periodista-escritor** y que investiga un episodio real de la Guerra Civil.
- Mezcla de **ficción y documento**, con personajes históricos reales.
- Tema: la **recuperación de la memoria** de la guerra desde el presente.
→ **Novela de la memoria histórica**, con componente **metaficcional** (el libro cuenta cómo se escribió el libro).

**Texto C** — *Los mares del sur* (1979), de Vázquez Montalbán:
> *"Carvalho contempló el cadáver con la misma expresión con que contemplaba las cartas de un restaurante caro…"*

**Análisis:**
- **Detective** protagonista y crimen que investigar.
- **Ironía** y crítica social implícita en la comparación.
- La investigación servirá de excusa para recorrer la sociedad barcelonesa.
→ **Novela policíaca o negra.**

## Plantilla de respuesta para el tema (2 puntos)

> *La desaparición de la censura tras 1975 y el agotamiento del experimentalismo de los sesenta —que había alejado a los lectores— producen un giro decisivo: la novela **recupera el placer de narrar**, con tramas reconocibles y personajes definidos, sin renunciar a las conquistas técnicas anteriores. Suele señalarse como punto de partida* **La verdad sobre el caso Savolta** *(1975), de **Eduardo Mendoza**.*
>
> *El rasgo dominante del periodo es el **eclecticismo**: conviven múltiples tendencias sin que ninguna se imponga, y desaparecen los grupos y manifiestos generacionales.*
>
> *La **novela histórica** reconstruye el pasado con rigor documental (*El hereje*, Delibes, 1998). La **novela policíaca** emplea la investigación como radiografía social, según muestra la serie de Pepe Carvalho de **Vázquez Montalbán**. La **metanovela** reflexiona sobre la propia escritura (*Beatus Ille*, **Muñoz Molina**, 1986). La **novela intimista** explora la memoria y la soledad (*La lluvia amarilla*, **Llamazares**, 1988).*
>
> *Desde los años noventa cobra especial fuerza la **recuperación de la memoria histórica**, con* **Soldados de Salamina** *(2001) de **Javier Cercas** y* La voz dormida *(2002) de **Dulce Chacón**. Caracterizan además al periodo la incorporación plena de las escritoras al canon y el peso creciente del mercado editorial.*`,
    practice_prompt: 'Enumera seis tendencias de la novela española desde 1975 con una obra fechada representativa de cada una. Después explica por qué "La verdad sobre el caso Savolta" se considera el punto de inflexión y qué se entiende por "recuperación de la narratividad".',
    alert_markdown: '⚠️ **El eclecticismo es la respuesta, no una excusa.** Si te preguntan por este periodo, lo primero que hay que decir es que **no hay una tendencia dominante**: eso es precisamente lo que lo caracteriza, frente a las etapas anteriores, claramente definidas.',
  },

  {
    sort_order: 57,
    title: 'El Teatro de 1939 a la Actualidad',
    concept_markdown: `## El punto de partida: un género doblemente condicionado

El teatro es el género que peor sale de la guerra, por tres razones:
1. **Muertos y exiliados sus renovadores**: Valle-Inclán muere en 1936, Lorca es asesinado ese mismo año; se exilian Alberti, Max Aub y Casona.
2. **La censura** es más severa que en la novela o la poesía, porque el teatro es un espectáculo **público y colectivo**.
3. **La presión comercial**: depende de empresarios que necesitan llenar la sala y de un público burgués que quiere entretenimiento.

El resultado es una escisión permanente entre el **teatro que se estrena** y el **teatro que se escribe**, al que se ha llamado **"teatro soterrado"**.

## Años 40: comedia burguesa y teatro de humor

**El drama burgués**, continuación de la comedia benaventina: obras bien construidas, diálogo elegante y conflictos inocuos. **Joaquín Calvo Sotelo**, **José María Pemán**, el propio **Benavente**.

**El teatro de humor**, que sí aporta una renovación real:
- **Enrique Jardiel Poncela**: humor **inverosímil** y situaciones disparatadas, con un lenguaje muy trabajado. *Eloísa está debajo de un almendro* (1940), *Los ladrones somos gente honrada*.
- **Miguel Mihura**: ***Tres sombreros de copa***, escrita en **1932** y estrenada en **1952**, veinte años después. Dionisio, la víspera de su boda de conveniencia, conoce en un hotel de provincias a Paula y a una troupe de music-hall, y descubre una vida distinta, libre y poética; al final **renuncia** y se somete a la convención. Su **humor absurdo**, basado en el diálogo ilógico y en la ternura, **anticipa el teatro europeo del absurdo** (Ionesco, Beckett) en dos décadas. Mihura escribiría después comedias más convencionales (*Maribel y la extraña familia*).

## Años 50: el teatro existencial y social

La década se abre con dos obras decisivas: ***Historia de una escalera*** (1949) de **Buero Vallejo** y ***Escuadra hacia la muerte*** (1953) de **Alfonso Sastre**. El teatro pasa del existencialismo a la **preocupación social**: obreros, gente humilde, desigualdad, injusticia.

### Antonio Buero Vallejo (1916-2000)
Condenado a muerte tras la guerra y con la pena conmutada, es el gran dramaturgo español de la segunda mitad del siglo.

**Rasgos:**
- Su género es la **tragedia**, que busca la **catarsis** del espectador: conmoverlo para moverlo a la acción.
- Personajes con **limitaciones físicas simbólicas**: ciegos, sordos, locos. La ceguera representa la incapacidad de ver la verdad.
- Los **"efectos de inmersión"**: el espectador percibe la realidad desde la limitación del personaje (en *El concierto de San Ovidio* o *La Fundación*, vemos y oímos lo que el protagonista cree ver y oír).
- Esperanza trágica: sus obras son sombrías, pero nunca niegan la posibilidad de cambio.

**Obras:** ***Historia de una escalera*** (1949): tres generaciones de vecinos fracasan sucesivamente en el mismo rellano; el espacio único simboliza la **imposibilidad de ascenso social**, y en el tercer acto los hijos repiten literalmente las promesas de los padres. *El tragaluz* (1967), *La Fundación* (1974), *El sueño de la razón* (sobre Goya), *Un soñador para un pueblo*.

### Alfonso Sastre y la polémica del posibilismo
**Sastre** defiende un teatro de **denuncia radical**, sin concesiones a la censura. Sus obras apenas se estrenan.

**La polémica** (1960) es un concepto que hay que saber:
- **Buero: posibilismo.** Hay que escribir lo máximo que la censura permita estrenar, porque un teatro no representado no transforma nada.
- **Sastre: imposibilismo.** Aceptar los límites de la censura es colaborar con ella; hay que escribir con libertad total aunque no se estrene.

## Años 60 y 70: el teatro experimental y los grupos independientes

Nueva generación que rechaza el realismo y busca un lenguaje escénico **simbólico y vanguardista**, influida por el **teatro del absurdo**, por **Brecht** y por **Artaud**.

- **Fernando Arrabal**: crea el **"teatro pánico"**, mezcla de ceremonia, crueldad, humor y absurdo. *El cementerio de automóviles*, *Pic-Nic*. Desarrolló su carrera sobre todo en Francia.
- **Francisco Nieva**: "teatro furioso", de gran barroquismo verbal.
- **Antonio Gala**: teatro poético y de éxito comercial (*Anillos para una dama*).
- **Los grupos independientes**, fenómeno capital del periodo: trabajan con **creación colectiva**, al margen del circuito comercial y a menudo perseguidos. **Els Joglars**, **Els Comediants**, **La Cuadra de Sevilla**, **Tábano**, **Los Goliardos**, **La Fura dels Baus** (ya en los 80).

## De 1975 a la actualidad

Con la democracia llegan la **desaparición de la censura**, la recuperación de los autores prohibidos y del exilio, y la creación de **instituciones públicas**: el **Centro Dramático Nacional** (1978), la **Compañía Nacional de Teatro Clásico** (1986), los festivales (**Almagro**, **Mérida**).

**Autores:**
- **José Luis Alonso de Santos**: ***Bajarse al moro*** (1985), comedia sobre jóvenes de la movida madrileña que trafican con hachís; lenguaje coloquial y ternura bajo la comicidad. También *La estanquera de Vallecas*.
- **José Sanchis Sinisterra**: ***¡Ay, Carmela!*** (1987), sobre dos cómicos de variedades atrapados en el bando franquista durante la guerra. Memoria histórica, metateatro y emoción.
- **Fermín Cabal**, **Ignacio Amestoy**, **Paloma Pedrero**, **Lluïsa Cunillé**.
- **Juan Mayorga**, el dramaturgo español de referencia actual, miembro de la RAE: *Himmelweg*, *El chico de la última fila*, *La lengua en pedazos*, *Reikiavik*. Teatro de ideas, de gran rigor y densidad moral.

**Tendencias actuales:** teatro de la memoria, teatro documental, teatro **posdramático**, microteatro, y una fuerte presencia de la **dramaturgia escrita por mujeres**.`,
    worked_example_markdown: `## Ejemplo guiado: el espacio como símbolo en *Historia de una escalera*

Acotación inicial de la obra (1949):

> *"Un tramo de escalera con dos rellanos… Es una escalera pobre, de un barrio humilde. Los escalones están gastados. Las paredes, sucias…"*

Y en el **acto tercero**, treinta años después, Fernando hijo y Carmina hija:

> *"FERNANDO, HIJO: Carmina, yo haré cosas grandes. […] Y saldremos de aquí.*
> *CARMINA, HIJA: ¡Fernando!"*

Que es, **palabra por palabra**, lo que Fernando padre y Carmina madre se decían en el **acto primero**.

**Paso 1 — Interpreta el espacio único.**
La obra transcurre **entera** en la escalera: nunca vemos el interior de las casas ni la calle. La escalera es un espacio de **tránsito** —sirve para subir y bajar—, pero aquí **nadie llega a ninguna parte**. Es el símbolo perfecto del **inmovilismo social**.

**Paso 2 — Analiza el deterioro.**
Entre el primer acto y el tercero pasan **treinta años**, y lo único que cambia es que la escalera está **más gastada**. El tiempo transcurre sin producir progreso: solo desgaste.

**Paso 3 — Identifica la estructura circular.**
La repetición literal del diálogo de los padres en boca de los hijos es el hallazgo dramático de la obra. Lo que en el acto primero sonaba a **promesa** suena en el tercero a **condena**: el espectador ya sabe cómo termina. La **estructura circular** demuestra que la frustración **se hereda**.

**Paso 4 — Extrae la tesis social.**
Buero no acusa a los personajes de falta de voluntad: sugiere que las **condiciones sociales** son las que impiden el ascenso. Estrenada en **1949**, en plena posguerra y con censura, la obra transmite esa idea **sin enunciarla nunca de forma explícita**. Ahí está el **posibilismo**: la crítica pasa la censura porque está en la estructura, no en los diálogos.

**Paso 5 — Relaciónalo con la catarsis.**
El espectador sale del teatro **conmovido y desasosegado**. Buero pretende que esa emoción trágica lo empuje a no resignarse. La tragedia, para él, no es fatalista: es un aviso.

**Redacción final (200 palabras):**
> *En* Historia de una escalera *(1949), de **Buero Vallejo**, el **espacio** constituye el principal recurso simbólico. La acción transcurre íntegramente en el rellano de una escalera, espacio de tránsito en el que, sin embargo, **nadie llega a ninguna parte**: durante los treinta años que separan el primer acto del tercero, lo único que cambia es su deterioro. El tiempo pasa sin producir progreso.*
>
> *El hallazgo dramático decisivo es la **estructura circular**: en el tercer acto, los hijos repiten literalmente las promesas de ascenso que sus padres se habían hecho en el primero. Lo que antes sonaba a esperanza suena ahora a condena, porque el espectador ya conoce el desenlace. La frustración, sugiere Buero, **se hereda**.*
>
> *La crítica social se transmite así **sin enunciarse explícitamente**, lo que permitió a la obra superar la censura de 1949: es el **posibilismo** que Buero defendería frente al imposibilismo de Alfonso Sastre. Y responde a su concepción de la tragedia como instrumento de **catarsis**: conmover al espectador para moverlo a no resignarse.*

## El concepto que siempre cae

**Posibilismo (Buero)** frente a **imposibilismo (Sastre)**: escribir dentro de los límites de la censura para poder estrenar y llegar al público, frente a escribir con libertad total aunque la obra no llegue nunca a los escenarios.`,
    practice_prompt: 'Redacta el tema "El teatro de 1939 hasta la actualidad" en 200 palabras, con una tendencia por década y autor y obra fechada. Después explica la polémica entre posibilismo e imposibilismo y ordena cronológicamente: "Historia de una escalera", "Tres sombreros de copa" (escritura y estreno), "Bajarse al moro" y "¡Ay, Carmela!".',
    alert_markdown: '⚠️ **"Tres sombreros de copa" tiene dos fechas y ambas importan: escrita en 1932, estrenada en 1952.** Ese desfase de veinte años es justamente lo que demuestra que Mihura se adelantó al teatro del absurdo europeo, y es el dato que más se pregunta sobre él.',
  },

  {
    sort_order: 58,
    title: 'La Literatura Hispanoamericana del Siglo XX',
    concept_markdown: `## Por qué importa

Durante el siglo XX la literatura hispanoamericana pasa de ser considerada **periférica** a ocupar el **centro** de la literatura en lengua española. En la segunda mitad del siglo, la mayoría de los grandes novelistas en español son americanos.

## La poesía

Tras el **Modernismo** de **Rubén Darío**, que había invertido por primera vez la dirección de la influencia (de América a España), la poesía hispanoamericana se renueva con las vanguardias.

**César Vallejo (Perú, 1892-1938)**
Uno de los grandes poetas del siglo en cualquier lengua. Evoluciona del modernismo de *Los heraldos negros* (1918) —con su verso inicial: *"Hay golpes en la vida, tan fuertes… ¡Yo no sé!"*— a la ruptura radical de ***Trilce*** (1922): desarticulación de la sintaxis, invención de palabras, alteración de la ortografía, para expresar el **dolor humano** y la orfandad. En *Poemas humanos* y *España, aparta de mí este cáliz* (sobre la Guerra Civil española) alcanza un tono de solidaridad y compasión únicos.

**Pablo Neruda (Chile, 1904-1973)**
El poeta hispanoamericano más leído. Su trayectoria:
- **Etapa amorosa e intimista**: ***Veinte poemas de amor y una canción desesperada*** (1924), de enorme éxito popular.
- **Etapa surrealista**: *Residencia en la tierra* (1933-35), poesía hermética y angustiada sobre la desintegración del mundo.
- **Etapa comprometida**: tras vivir la Guerra Civil española y la muerte de Lorca, escribe *España en el corazón* y después ***Canto general*** (1950), gran epopeya de América: su geografía, su historia, sus pueblos originarios, la denuncia del colonialismo.
- **Etapa final**, de sencillez deliberada: *Odas elementales* (1954), sobre la cebolla, el tomate, los calcetines.
**Nobel en 1971.**

**Octavio Paz (México, 1914-1998)**
Poeta y ensayista. Poesía de raíz surrealista y de reflexión sobre el lenguaje y el tiempo (*Libertad bajo palabra*, *Piedra de sol*). Como ensayista, ***El laberinto de la soledad*** (1950) es un análisis clásico de la identidad mexicana. **Nobel en 1990**.

**Otros:** **Vicente Huidobro** (creacionismo, *Altazor*), **Gabriela Mistral** (Chile, **Nobel 1945**, primera mujer hispanoamericana en obtenerlo), **Nicolás Guillén** (Cuba, poesía negra y son), **Mario Benedetti** (Uruguay).

## La narrativa: tres etapas

### 1. La novela regionalista (años 20-30)

También llamada **"novela de la tierra"**. La **naturaleza americana** es la protagonista real: selva, llanura, pampa, río. Aparece como fuerza desmesurada que **devora al hombre** o lo pone a prueba. Realismo con voluntad de denuncia social.

- **José Eustasio Rivera** (Colombia), *La vorágine* (1924): la selva amazónica y la explotación del caucho. Termina con la frase: *"¡Se los tragó la selva!"*.
- **Rómulo Gallegos** (Venezuela), ***Doña Bárbara*** (1929): el llano venezolano y el conflicto entre **civilización y barbarie**.
- **Ricardo Güiraldes** (Argentina), *Don Segundo Sombra* (1926): la pampa y el gaucho.

También la **novela indigenista** (denuncia de la explotación del indio: **Ciro Alegría**, **Jorge Icaza**) y la **novela de la Revolución mexicana** (**Mariano Azuela**, *Los de abajo*).

### 2. La renovación y el realismo mágico (años 40-50)

Se incorporan las técnicas de la novela europea y norteamericana (**Joyce, Faulkner, Kafka, Proust**) y el legado del **surrealismo**. Lo fantástico se integra en lo cotidiano.

**Jorge Luis Borges (Argentina, 1899-1986)**
Maestro del **cuento intelectual**. Sus relatos son laberintos conceptuales que juegan con el tiempo circular, los espejos, los dobles, la biblioteca infinita, la enciclopedia, el sueño. Prosa de precisión extrema y erudición fingida.
- ***Ficciones*** (1944): "El jardín de senderos que se bifurcan", "Pierre Menard, autor del Quijote", "La biblioteca de Babel".
- ***El Aleph*** (1949).

**Alejo Carpentier (Cuba, 1904-1980)**
Teoriza **"lo real maravilloso americano"** en el prólogo a ***El reino de este mundo*** (1949): lo maravilloso no es una invención del escritor, **está en la realidad misma de América**, en su naturaleza, su historia y sus mitos. Estilo **barroco**. *Los pasos perdidos*, *El siglo de las luces*.

**Juan Rulfo (México, 1917-1986)**
Con solo dos libros se convirtió en clásico: *El llano en llamas* (1953, cuentos) y ***Pedro Páramo*** (1955). En esta última, Juan Preciado llega a **Comala** buscando a su padre y descubre que el pueblo entero **está habitado por muertos** que susurran. Estructura fragmentada, voces sin identificar, tiempo desarticulado. Es el antecedente directo del realismo mágico.

**Miguel Ángel Asturias** (Guatemala, Nobel 1967), *El señor Presidente*; **Ernesto Sábato** (Argentina), *El túnel*.

### 3. El *boom* (años 60)

Explosión editorial e internacional de la narrativa hispanoamericana, impulsada desde **Barcelona** (editorial Seix Barral, la agente Carmen Balcells) y por el interés que despertó la **Revolución cubana**.

**Rasgos:**
- **Realismo mágico**: lo maravilloso y lo sobrenatural se narran **con absoluta naturalidad**, sin que narrador ni personajes se sorprendan.
- **Experimentación técnica**: ruptura del orden temporal, narradores múltiples, monólogo interior, saltos de punto de vista.
- Fusión de lo **local** (mitos, historia y habla americanos) y lo **universal**.
- **Riqueza y libertad del lenguaje**; humor, exuberancia verbal.
- Compromiso político, con frecuencia de izquierdas.

**Obras capitales:**
- ***Cien años de soledad*** (1967), de **Gabriel García Márquez** (Colombia, **Nobel 1982**). Siete generaciones de la familia **Buendía** en el pueblo mítico de **Macondo**, desde su fundación hasta su desaparición. Síntesis perfecta del realismo mágico: ascensiones al cielo, lluvias de cuatro años, un hilo de sangre que recorre el pueblo, todo narrado con la naturalidad de una crónica.
- ***Rayuela*** (1963), de **Julio Cortázar** (Argentina). Novela de **lectura no lineal**: el autor propone dos itinerarios posibles, uno lineal y otro "salteado" siguiendo un tablero de dirección. Cuestiona la propia forma de leer.
- ***La ciudad y los perros*** (1963) y *La casa verde*, de **Mario Vargas Llosa** (Perú, **Nobel 2010**), de compleja arquitectura narrativa.
- ***La muerte de Artemio Cruz*** (1962), de **Carlos Fuentes** (México), con sus tres voces narrativas (yo, tú, él).

**Después del boom:** **Manuel Puig** (*El beso de la mujer araña*), **Isabel Allende** (*La casa de los espíritus*, 1982), **Roberto Bolaño** (*Los detectives salvajes*, *2666*), y las voces actuales de **Mariana Enríquez**, **Samanta Schweblin** o **Fernanda Melchor**.`,
    worked_example_markdown: `## Ejemplo guiado: cómo se reconoce el realismo mágico

Fragmento del comienzo de ***Cien años de soledad*** (1967):

> *"Muchos años después, frente al pelotón de fusilamiento, el coronel Aureliano Buendía había de recordar aquella tarde remota en que su padre lo llevó a conocer el hielo."*

**Paso 1 — Analiza la estructura temporal.**
En una sola frase conviven **tres tiempos**: un futuro ("muchos años después"), un presente narrativo implícito y un pasado remoto ("aquella tarde"). El tiempo de la novela es **circular**, no lineal: el final está anunciado desde el principio. Es un procedimiento aprendido de Faulkner.

**Paso 2 — Localiza la inversión de lo asombroso.**
Lo que resulta **maravilloso** para los personajes no es lo sobrenatural, sino **el hielo**: un objeto banal para el lector. A la inversa, más adelante la novela narrará ascensiones al cielo y muertos que conversan como si fueran hechos rutinarios.

**Esa inversión es exactamente el realismo mágico**: lo extraordinario se cuenta con naturalidad y lo ordinario provoca asombro.

**Paso 3 — Observa el tono.**
El registro es el de la **crónica** o el mito: solemne, distante, con vocación de relato fundacional ("había de recordar" en lugar de "recordaría"). Ese tono es el que hace verosímil lo increíble: el narrador **no comenta ni justifica** nada.

**Paso 4 — Define bien el concepto.**

> El **realismo mágico** no consiste en introducir fantasía en una novela realista. Consiste en **narrar lo extraordinario como si fuera cotidiano**, sin que el narrador ni los personajes manifiesten sorpresa alguna. La ausencia de asombro es la clave técnica.

**Paso 5 — Distínguelo de "lo real maravilloso".**

| | **Lo real maravilloso** (Carpentier) | **Realismo mágico** |
|---|---|---|
| **Naturaleza** | Concepto **ontológico**: lo maravilloso **está** en la realidad americana | Procedimiento **narrativo**: forma de contar |
| **Origen** | La historia, la naturaleza y los mitos de América lo son de por sí | El narrador elige no distinguir lo real de lo sobrenatural |
| **Texto** | *El reino de este mundo* (1949) | *Cien años de soledad* (1967) |

**Redacción para el examen:**
> *La primera frase de* Cien años de soledad *condensa dos rasgos esenciales del **boom**. En lo **temporal**, superpone tres momentos —un futuro anunciado, el presente de la narración y un pasado remoto—, estableciendo una concepción **circular** del tiempo en la que el desenlace se conoce desde el comienzo, procedimiento de raíz faulkneriana. En lo **conceptual**, invierte la jerarquía de lo asombroso: lo que maravilla a los personajes es el **hielo**, objeto trivial, mientras que a lo largo de la novela los prodigios se narrarán con absoluta naturalidad. En esa inversión reside el **realismo mágico**, que no consiste en añadir fantasía a un relato realista, sino en **contar lo extraordinario sin manifestar sorpresa**, sostenido aquí por un tono de crónica fundacional que confiere verosimilitud a lo increíble.*`,
    practice_prompt: 'Define el realismo mágico y diferéncialo de "lo real maravilloso" de Carpentier. Después redacta el tema "La literatura hispanoamericana contemporánea" en 200 palabras, con las tres etapas narrativas (regionalismo, renovación y boom), tres autores del boom con obra fechada y dos poetas con su aportación.',
    alert_markdown: '⚠️ **El realismo mágico no es fantasía.** La diferencia está en la **reacción**: en una novela fantástica, lo sobrenatural provoca asombro o miedo; en el realismo mágico, **nadie se sorprende**. Esa ausencia de asombro es el rasgo técnico definitorio.',
  },

  {
    sort_order: 59,
    title: 'El Comentario de un Fragmento Literario (Pregunta 3.1)',
    concept_markdown: `## Qué te piden exactamente

En la pregunta **3.1 (2 puntos)** te dan un **fragmento** —un poema, un pasaje narrativo o una escena teatral— con su autor y su obra ya identificados, y te piden una tarea **muy concreta**. Las más frecuentes:

- *"Escriba cuatro rasgos de [la corriente] y ejemplifique, con citas, su presencia en el texto."*
- *"¿A qué alude el poeta con la imagen de…? Justifique su respuesta."*
- *"Comente los rasgos de [movimiento] presentes en el fragmento."*

**No es un comentario libre.** No te piden métrica exhaustiva, ni biografía del autor, ni resumen del argumento. Se responde **exactamente lo que se pregunta**.

## El método en cuatro pasos

### 1. Sitúa el fragmento (una frase)
Autor, obra, fecha y, sobre todo, **corriente o movimiento**. Es la frase que demuestra que sabes dónde estás:
> *"El fragmento pertenece a* Hijos de la ira *(1944), de Dámaso Alonso, obra que inaugura la poesía desarraigada de posguerra."*

### 2. Cuenta lo que te piden
Si piden **cuatro rasgos**, da **exactamente cuatro** y **numéralos**. Dar tres deja un cuarto de la nota sin recoger; dar ocho mal explicados puntúa menos que cuatro desarrollados.

### 3. Cita siempre
**Cada afirmación va acompañada de una cita literal entre comillas.** Es la regla de oro: sin cita, la afirmación no vale. El corrector necesita ver que lo has localizado **en ese texto**, no que lo has memorizado del tema.

### 4. Interpreta el efecto
No basta con identificar. Hay que explicar **qué produce** ese rasgo: qué sensación, qué idea, qué relación con el sentido global de la obra.

## La plantilla de cada rasgo

> ***[Nombre técnico del rasgo].*** *[Explicación de en qué consiste]. Se observa en "[cita literal]", donde [interpretación del efecto].*

Esas tres partes —**nombre**, **cita**, **efecto**— son las tres cosas que puntúan. Omitir la tercera es el error más común.

## Qué buscar según el género

**Si es un POEMA:**
- **Símbolos** característicos del autor (la luna en Lorca, la tarde en Machado)
- **Imágenes y metáforas**: ¿son lógicas o irracionales?
- **Métrica**: tipo de verso y estrofa, y si es tradicional o libre
- **Recursos**: anáfora, paralelismo, antítesis, encabalgamiento
- **Tono**: elegíaco, exaltado, irónico

**Si es NARRATIVA:**
- **Narrador**: ¿en qué persona?, ¿omnisciente u oculto?
- **Personajes**: ¿tipos sociales o conciencias individuales?
- **Espacio y tiempo**: ¿concentrados o dispersos?
- **Estilo**: ¿frase larga o corta?, ¿culto o popular?, ¿diálogo o descripción?

**Si es TEATRO:**
- **Conflicto**: qué se enfrenta a qué
- **Acotaciones**: ¿son funcionales o literarias?
- **Espacio escénico** y su valor simbólico
- **Lenguaje** de los personajes: ¿los caracteriza socialmente?

## Si te fijan la extensión

Los modelos recientes piden **200 palabras**. Respétalas: es un criterio de corrección explícito.`,
    worked_example_markdown: `## Ejemplo guiado completo

**Fragmento dado:** el inicio de *La familia de Pascual Duarte* (1942), de Cela.
**Pregunta:** *Escriba cuatro rasgos de la novela tremendista y ejemplifique, con citas, su presencia en el texto.*

### Aplicación de la plantilla, rasgo a rasgo

**[Situación — una frase]**
> *El fragmento pertenece a* La familia de Pascual Duarte *(1942), de Camilo José Cela, novela que inaugura el **tremendismo** en la narrativa española de posguerra.*

**[Rasgo 1]**
> ***Presentación cruda de la violencia como algo cotidiano.*** *El tremendismo acumula episodios brutales narrados sin dramatismo ni condena explícita. Se observa en "**nos pegaba a mi madre y a mí las grandes palizas por cualquier cosa**", donde el maltrato se refiere como rutina doméstica; esa naturalidad resulta más estremecedora que cualquier énfasis.*

**[Rasgo 2]**
> ***Personajes primarios y animalizados.*** *Los seres humanos quedan reducidos a corpulencia e instinto, sin dimensión moral. Se observa en el símil "**alto y gordo como un monte**", que despoja al padre de todo rasgo psicológico para dejar únicamente la masa física.*

**[Rasgo 3]**
> ***Determinismo del medio.*** *El ambiente condiciona irremediablemente el destino del protagonista, anticipado desde la primera línea: "**De mi niñez no son precisamente buenos recuerdos los que guardo**". El lector sabe desde el arranque que de ese origen no puede surgir nada distinto de la tragedia.*

**[Rasgo 4]**
> ***Narrador autobiográfico y lenguaje popular.*** *Pascual escribe en primera persona desde la cárcel, con giros coloquiales y sintaxis del habla. La exclamación "**¡Se tienen las carnes muy tiernas a tan corta edad!**" produce un contraste brutal entre la ternura de la expresión y el horror de lo narrado, rasgo característico del estilo de Cela.*

### Comprobación final

| Requisito | ¿Cumplido? |
|---|---|
| Situar el fragmento | ✅ una frase |
| Exactamente **cuatro** rasgos | ✅ numerados |
| Nombre técnico de cada uno | ✅ en negrita |
| **Cita literal** por rasgo | ✅ entre comillas |
| **Interpretación** del efecto | ✅ tras cada cita |

## El mismo método sobre un poema

**Fragmento:** *"Verde que te quiero verde. / Verde viento. Verdes ramas."*
**Pregunta:** *Comente los rasgos de la Generación del 27 presentes en el texto.*

> ***Síntesis de tradición y vanguardia.*** *Es el rasgo definitorio del grupo. Del lado tradicional, el poema adopta la forma del **romance** —octosílabos con rima asonante en los pares—; del vanguardista, la **sinestesia** "**verde viento**" atribuye color a lo incorpóreo, imagen impensable en la lírica tradicional.*
>
> ***Uso simbólico e irracional del color.*** *El **verde**, repetido en anáfora, no designa un color concreto: sugiere simultáneamente deseo, frustración y muerte, con una lógica emocional de raíz surrealista.*
>
> ***Recursos de la lírica popular.*** *La **repetición** obsesiva y el **paralelismo** proceden del cancionero tradicional y confieren al poema una musicalidad memorable, casi oral.*`,
    practice_prompt: 'Coge un fragmento de una obra que hayas leído y aplica el método completo: sitúalo en una frase y desarrolla cuatro rasgos de su corriente, cada uno con nombre técnico, cita literal entre comillas e interpretación del efecto. Comprueba al final que cumples los cinco requisitos de la tabla.',
    alert_markdown: '⚠️ **Sin cita literal, el rasgo no puntúa.** Escribir "hay determinismo del medio" vale la mitad que "hay determinismo del medio, como muestra *[cita]*, donde…". El corrector debe comprobar que lo has localizado **en ese texto concreto**.',
  },

  {
    sort_order: 60,
    title: 'Cómo Comentar la Obra Leída (Preguntas 3.3 y 3.4)',
    concept_markdown: `## Qué te piden

> **3.3.** *Comente los aspectos más relevantes de la **obra española que haya leído escrita entre 1875 y 1936**, en relación con su contexto sociohistórico y la tradición literaria.*
> **3.4.** *Ídem, escrita **entre 1937 y 1974**.*

Vale **1 punto** y solo hay que responder **una de las dos**.

## El dato clave: no hay lista cerrada

El modelo vigente **no impone títulos obligatorios**. **Tú eliges** la obra, con dos condiciones: que sea **española** y que esté dentro del **rango de fechas**. Esto es una ventaja enorme si la aprovechas: puedes preparar **una sola obra por periodo** y llevarla perfectamente trabajada.

*(En modelos de otros años el rango ha variado —1900-1939, por ejemplo—, así que comprueba siempre el enunciado concreto antes de elegir.)*

## Los tres apartados que hay que tratar

El enunciado dice exactamente qué se valora. Son tres cosas y **las tres puntúan**:

**1. Aspectos más relevantes de la obra**
Temas, personajes, estructura, estilo, símbolos. **No el argumento completo.**

**2. Contexto sociohistórico**
Qué ocurría en España cuando se escribió y **cómo se refleja** en la obra. No basta con datar: hay que **relacionar**.

**3. Tradición literaria**
A qué movimiento pertenece, con qué obras anteriores dialoga, qué influencias recibe y qué influencia ejerce.

## Estructura de respuesta (200 palabras)

| Parte | Extensión | Contenido |
|---|---|---|
| **Presentación** | 1 frase | Obra, autor, fecha, género |
| **Aspectos relevantes** | 4-5 frases | Tema central, conflicto, personajes, un símbolo o rasgo de estilo |
| **Contexto sociohistórico** | 3 frases | Situación de España + cómo aparece en la obra |
| **Tradición literaria** | 3 frases | Movimiento, influencias recibidas, influencia ejercida |
| **Cierre** | 1 frase | Valoración o trascendencia |

**Truco de presentación:** marca los tres apartados con conectores explícitos (*"En cuanto a los aspectos más relevantes…"*, *"Por lo que respecta al contexto…"*, *"En relación con la tradición literaria…"*). El corrector los está buscando, y así los encuentra de inmediato.

## Obras rentables por periodo

**1875-1936** *(elige una y prepárala a fondo)*
- ***San Manuel Bueno, mártir*** (Unamuno, 1931) — la más rentable: corta, densa, con contexto y tradición clarísimos
- *Luces de bohemia* (Valle-Inclán, 1920)
- *El árbol de la ciencia* (Baroja, 1911)
- *La Regenta* (Clarín, 1884-85)
- *Los pazos de Ulloa* (Pardo Bazán, 1886)
- *Romancero gitano* (Lorca, 1928)
- *La casa de Bernarda Alba* (Lorca, **1936** — cuidado: entra en este periodo, no en el siguiente)

**1937-1974**
- ***La familia de Pascual Duarte*** (Cela, 1942)
- *Nada* (Laforet, 1945)
- *Historia de una escalera* (Buero Vallejo, 1949)
- *La colmena* (Cela, 1951)
- *El Jarama* (Sánchez Ferlosio, 1955)
- *Tiempo de silencio* (Martín-Santos, 1962)
- *Cinco horas con Mario* (Delibes, 1966)
- *Hijos de la ira* (Dámaso Alonso, 1944)

## El error que arruina la respuesta

**Contar el argumento.** Es lo que hace casi todo el mundo: se resume la trama, se agotan las 200 palabras y quedan sin tratar el contexto y la tradición, que son **dos tercios** de lo que se pregunta. El argumento debe ocupar **una frase**, no un párrafo.`,
    worked_example_markdown: `## Ejemplo guiado 1: periodo 1875-1936

**Obra elegida:** *San Manuel Bueno, mártir* (Unamuno, 1931).

> ***[Presentación]*** *San Manuel Bueno, mártir*, *novela breve de **Miguel de Unamuno** publicada en **1931**, constituye la síntesis más lograda de las preocupaciones que recorren toda su obra.*
>
> ***[Aspectos relevantes]*** *Narra, a través del manuscrito de Ángela Carballino, la vida de don Manuel, párroco de Valverde de Lucerna, venerado como santo por su pueblo pese a **haber perdido la fe**: no cree en la resurrección, pero finge creer para no arrebatar a sus feligreses el consuelo que los sostiene. El tema central es el **conflicto entre fe y razón** y el **ansia de inmortalidad**, junto con la cuestión de si la verdad debe prevalecer sobre la felicidad. Son esenciales los símbolos del **lago** —que oculta bajo su superficie una villa sumergida— y la **montaña**, imágenes de la permanencia frente al tiempo histórico.*
>
> ***[Contexto sociohistórico]*** *Se publica en el año de la proclamación de la **Segunda República**, en una España atravesada por el debate sobre el papel de la religión y la secularización del Estado. La obra refleja además la **intrahistoria** unamuniana: Valverde de Lucerna vive al margen de los acontecimientos históricos, en la vida callada y permanente de las gentes anónimas.*
>
> ***[Tradición literaria]*** *Se inscribe en la **Generación del 98** por su preocupación existencial y su estilo sobrio y antirretórico, y culmina la fórmula de la **nivola**: escasa acción, predominio del diálogo y del conflicto interior. Enlaza con la tradición del **pensamiento agónico** de Kierkegaard y Pascal, y su planteamiento del sacerdote sin fe influirá en la narrativa europea posterior.*
>
> ***[Cierre]*** *Es, en suma, el testamento literario de Unamuno y una de las obras más hondas de la literatura española del siglo XX.*

**199 palabras.** Fíjate en que el **argumento ocupa una sola frase**.

## Ejemplo guiado 2: periodo 1937-1974

**Obra elegida:** *Historia de una escalera* (Buero Vallejo, 1949).

> ***[Presentación]*** *Historia de una escalera*, *drama en tres actos de **Antonio Buero Vallejo** estrenado en **1949**, marca el inicio del teatro español de posguerra comprometido.*
>
> ***[Aspectos relevantes]*** *Presenta a tres generaciones de vecinos de un mismo inmueble a lo largo de treinta años. Fernando y Urbano sueñan con prosperar y salir de allí, pero en el tercer acto sus hijos repiten **literalmente** las mismas promesas. El tema es la **frustración** y la imposibilidad de progreso social; el hallazgo dramático, la **estructura circular**, que demuestra que el fracaso se hereda. La **escalera**, espacio único de tránsito en el que nadie llega a ninguna parte, funciona como símbolo del inmovilismo.*
>
> ***[Contexto sociohistórico]*** *Se estrena en plena posguerra, en una España de miseria material, aislamiento internacional y censura férrea. Buero practica un **teatro posibilista**: acepta los límites impuestos para poder estrenar, de modo que la crítica social se transmite a través de la estructura y no de los diálogos, lo que le permitió superar la censura.*
>
> ***[Tradición literaria]*** *Enlaza con el **drama social europeo** de Ibsen y Chéjov y recupera la línea de teatro comprometido truncada por la guerra, la de Valle-Inclán y Lorca. Su concepción de la tragedia como instrumento de **catarsis** procede directamente de los clásicos griegos.*
>
> ***[Cierre]*** *Su estreno abrió el camino al teatro existencial y social de los años cincuenta.*`,
    practice_prompt: 'Elige una obra de cada periodo (1875-1936 y 1937-1974) y redacta para cada una una respuesta de 200 palabras con los cinco bloques: presentación, aspectos relevantes, contexto sociohistórico, tradición literaria y cierre. Marca cada apartado con un conector explícito y comprueba que el argumento no ocupa más de una frase.',
    alert_markdown: '⚠️ **Prepara UNA obra por periodo, no diez.** Como eliges tú el título, no necesitas dominar el catálogo entero: te basta con llevar dos obras perfectamente trabajadas en sus tres apartados. Es la pregunta más rentable del examen en relación esfuerzo/nota.',
  },
]

async function main() {
  console.log(`Reescribiendo ${cards.length} misiones (51-60) con apuntes en profundidad…\n`)
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
    console.log(`✓ ${String(c.sort_order).padStart(2)}. ${c.title.padEnd(52)} teoría ${String(c.concept_markdown.length).padStart(4)} · caso ${String(c.worked_example_markdown.length).padStart(4)}`)
  }

  const avg = Math.round(cards.reduce((a, c) => a + c.concept_markdown.length, 0) / cards.length)
  console.log(`\n✅ ${cards.length} misiones actualizadas. Teoría media: ${avg} caracteres.`)
}

main()
