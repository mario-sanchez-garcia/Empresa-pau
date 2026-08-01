// Uso: node --env-file=.env.local docs/insert_historia_b12.mjs
// Bloque 12 — La Dictadura Franquista: flashcards 107-118
// Partes 53-57 de los apuntes de Diego

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const SUBJECT = 'historia_espana'

const cards = [

  // ─── PARTE 53A: BASES IDEOLÓGICAS Y FAMILIAS ──────────────────────────────────

  {
    sort_order: 107,
    block_key: 'La Dictadura Franquista',
    block_slug: 'dictadura-franquista',
    title: 'Las Bases Ideológicas del Franquismo y las "Familias del Régimen"',
    concept_markdown: `## Las Bases Ideológicas del Franquismo

El franquismo no fue una ideología coherente y sistemática como el nazismo o el fascismo italiano, sino una **amalgama de ideas y familias políticas** unidas por la lealtad personal a Franco. Sus pilares fundamentales fueron:

- **Nacionalismo español exacerbado:** España como nación única e indivisible. Represión de las lenguas y culturas regionales (catalán, vasco, gallego fueron proscritos del espacio público). El lema *"España, Una, Grande y Libre"* resumía este ultranacionalismo.

- **Nacional-catolicismo:** identificación total del régimen con la Iglesia Católica. El catolicismo pasó a ser el elemento definitorio de la identidad española, el fundamento moral del Estado y el legitimador del régimen. La Iglesia obtuvo a cambio enormes privilegios: control de la enseñanza, presencia en los medios de comunicación, asignatura de Religión obligatoria, Concordato de **1953** que garantizaba financiación estatal y privilegios jurisdiccionales.

- **Anticomunismo y antiliberalismo:** rechazo de la democracia liberal, los partidos políticos, la lucha de clases y el marxismo. El régimen se presentó desde 1945 como el principal baluarte occidental contra el comunismo, lo que le fue de enorme utilidad durante la Guerra Fría.

- **Militarismo:** el ejército como institución vertebradora de la nación y garante del orden. Franco siempre vistió uniforme militar.

- **Caudillismo:** concentración de todo el poder en la persona de Franco. Por la Ley de Jefatura del Estado de **1938** y la Ley de Sucesión de **1947**, Franco acumuló poderes ejecutivos, legislativos y judiciales sin parangón en la historia española.

### Las Familias del Régimen

| Familia | Características | Momento de mayor influencia |
|---|---|---|
| *Militares* | Africanistas, garantes del orden | Todo el período |
| *Falangistas* | Fascismo español, sindicalismo vertical | 1939–1945 |
| *Carlistas/Requetés* | Tradición, catolicismo integrista | 1939–1945 |
| *Tecnócratas del Opus Dei* | Tecnocracia, modernización económica | 1957–1973 |
| *Democristianos* | Catolicismo moderado, aperturismo tardío | 1969–1975 |`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Cuáles fueron los fundamentos ideológicos del franquismo? ¿Qué fueron las "familias del régimen"?*

**Los cinco pilares:**
1. Nacionalismo exacerbado ("España, Una, Grande y Libre") → represión de catalán, vasco, gallego
2. Nacional-catolicismo → la Iglesia como legitimadora del régimen a cambio de privilegios
3. Anticomunismo + antiliberalismo → baluarte contra el comunismo en la Guerra Fría
4. Militarismo → el ejército como columna vertebral del Estado
5. Caudillismo → Franco con todos los poderes (ejecutivo + legislativo + judicial)

**Las familias:**
- El franquismo no era ideológicamente homogéneo → distintas "familias" se turnaban en el poder según el contexto
- Falangistas (1939-45) → Tecnócratas Opus Dei (1957-73) → la evolución refleja la adaptación del régimen al entorno internacional`,
    practice_prompt: '¿Cuáles fueron los pilares ideológicos del franquismo? ¿Qué fue el "nacional-catolicismo"? Explica qué fueron las "familias del régimen" y cuándo tuvo mayor influencia cada una.',
    alert_markdown: '⚠️ El **nacional-catolicismo** es el elemento más específico y original del franquismo respecto al fascismo italiano o el nazismo alemán. Esos regímenes eran paganos o anticristianos; el franquismo hizo de la Iglesia Católica su principal legitimador. Esta diferencia es clave para PAU.',
  },

  // ─── PARTE 53B: REPRESIÓN DE POSGUERRA ───────────────────────────────────────

  {
    sort_order: 108,
    block_key: 'La Dictadura Franquista',
    block_slug: 'dictadura-franquista',
    title: 'La Represión de Posguerra: Instrumentos Legales, Magnitud y Exilio (1939–1945)',
    concept_markdown: `## La Represión de Posguerra (1939–1945)

La posguerra española fue uno de los períodos de mayor represión política de la historia europea contemporánea fuera de los regímenes totalitarios de la URSS y la Alemania nazi.

### Instrumentos Legales de la Represión

- **Ley de Responsabilidades Políticas (9 de febrero de 1939):** con efectos retroactivos desde octubre de 1934, perseguía a todos los que hubieran *"contribuido a la subversión"*. Implicaba depuración profesional, confiscación de bienes e inhabilitación.
- **Ley de Represión de la Masonería y el Comunismo (1 de marzo de 1940):** penalizaba la mera pertenencia a estas organizaciones con penas de cárcel.
- **Ley de Seguridad del Estado (1941).**
- **Tribunales militares:** la mayor parte de los juicios políticos se celebraron ante consejos de guerra militares, con garantías procesales mínimas.

### La Magnitud de la Represión

Los estudios más rigurosos (Julián Casanova, Paul Preston) estiman:
- **Ejecuciones en posguerra (1939–1945):** entre **30.000 y 50.000** personas fueron fusiladas tras juicios sumarísimos o sin juicio. A estas hay que añadir las ejecutadas durante la guerra en zona nacional (~50.000–90.000 más).
- **Presos políticos:** en 1939, los campos de concentración y las prisiones albergaban entre **270.000 y 500.000 presos**.
- **Trabajo forzado:** el *Patronato de Redención de Penas por el Trabajo* utilizó a los presos como mano de obra en obras públicas: el **Valle de los Caídos** (construido entre 1940 y 1959), el Canal del Bajo Guadalquivir, la reconstrucción de ciudades bombardeadas.
- **Depuraciones profesionales:** maestros, profesores universitarios, jueces, médicos, funcionarios afines a la República fueron depurados y apartados de sus cargos.
- **Represión cultural:** censura total de libros, prensa, cine y teatro. Quema de libros en las primeras semanas de la posguerra.

### El Exilio Republicano

~500.000 exiliados en Francia (muchos de los cuales fueron deportados a campos de concentración nazis, especialmente a **Mauthausen**, donde murieron unos **5.000 españoles**), México, Argentina, URSS y otros países americanos. El exilio republicano incluía lo más granado de la intelectualidad, la ciencia y la política españolas.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Cuáles fueron los instrumentos y la magnitud de la represión franquista de posguerra?*

**Instrumentos legales:**
1. Ley de Responsabilidades Políticas (feb. 1939): retroactiva a 1934 → depuración + confiscación + inhabilitación
2. Ley de Represión Masonería y Comunismo (1940): la mera pertenencia → cárcel
3. Tribunales militares: sin garantías procesales
4. Trabajo forzado: "Patronato de Redención de Penas" → presos construyen el Valle de los Caídos

**Magnitud:**
- 30.000-50.000 fusilados en posguerra (+ 50.000-90.000 durante la guerra en zona nacional)
- 270.000-500.000 presos en 1939
- Mauthausen: 5.000 exiliados españoles muertos en campos nazis

**Conclusión:** la represión franquista no terminó en 1939 → continuó con menor intensidad hasta los años 50-60 y simbólicamente hasta 1975`,
    practice_prompt: 'Describe los instrumentos legales y la magnitud de la represión franquista en la posguerra (1939-1945). ¿Qué fue el "Valle de los Caídos" y cómo se construyó? ¿Qué les ocurrió a los exiliados republicanos que cayeron en manos nazis?',
    alert_markdown: '⚠️ El **Valle de los Caídos** fue construido con trabajo forzado de presos republicanos entre 1940 y 1959. Originalmente iba a ser el mausoleo de Franco (donde está enterrado) y de José Antonio. En 2019, los restos de Franco fueron exhumados y trasladados a Mingorrubio. Este dato es contemporáneo y aparece en prensa.',
  },

  // ─── PARTE 53C: AUTARQUÍA ECONÓMICA ──────────────────────────────────────────

  {
    sort_order: 109,
    block_key: 'La Dictadura Franquista',
    block_slug: 'dictadura-franquista',
    title: 'La Autarquía Económica (1939–1959): Principios, el INI y los "Años del Hambre"',
    concept_markdown: `## El Modelo Económico Autárquico (1939–1959)

La **autarquía** fue el modelo económico del primer franquismo: España debía bastarse a sí misma, sin depender del exterior. Inspirada en el fascismo económico italiano y alemán, la autarquía fue también una consecuencia del aislamiento internacional impuesto a España tras la Segunda Guerra Mundial.

### Principios de la Autarquía

- **Intervencionismo estatal máximo:** el Estado fijaba precios, racionaba productos, controlaba el comercio exterior y dirigía la inversión.
- **Industrialización forzada mediante empresas públicas:** el **INI (Instituto Nacional de Industria, fundado en 1941)** por el falangista Juan Antonio Suanzes creó empresas estatales en sectores estratégicos: SEAT (automóviles, 1950), ENDESA (electricidad, 1944), IBERIA (aviación, 1943), ENSIDESA (siderurgia, 1950).
- **Racionamiento de productos básicos:** el racionamiento de alimentos duró hasta **1952**. Las cartillas de racionamiento regulaban el consumo de pan, aceite, azúcar, café y otros alimentos básicos. El mercado negro (*estraperlo*) floreció de manera generalizada.
- **Autosuficiencia agrícola imposible:** la producción agraria no recuperó los niveles de 1935 hasta mediados de los años 50. La sequía de 1945–1946 fue catastrófica.

### Las Consecuencias: Los "Años del Hambre"

La autarquía fue un **fracaso económico** de primera magnitud:
- El PIB español de **1935** no se recuperó hasta **~1953**, es decir, España perdió casi 20 años de desarrollo económico.
- Los años 40 fueron los **"años del hambre"**: desnutrición generalizada, enfermedades asociadas a la miseria (tuberculosis, tifus) y una mortalidad infantil disparada.
- La producción industrial y agrícola estancada.
- Inflación crónica por la emisión de papel moneda sin respaldo.

A partir de **1951**, una tímida apertura exterior (acuerdos con EE.UU., fin del racionamiento en 1952) mejoró algo la situación, pero el modelo autárquico estaba agotado. La crisis de balanza de pagos de **1959** (España al borde de la quiebra) forzó el cambio radical de modelo económico.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fue la autarquía económica del franquismo? ¿Cuáles fueron sus consecuencias?*

**Qué fue:**
- Autosuficiencia económica total → España no depende del exterior
- Inspirada en el fascismo económico + consecuencia del aislamiento internacional
- Intervencionismo máximo: el Estado fija precios + raciona + controla comercio exterior

**El INI (1941):**
- Creado por Suanzes (falangista)
- Empresas estatales: SEAT (1950) + ENDESA (1944) + IBERIA (1943) + ENSIDESA (1950)

**Consecuencias (catástrofe):**
- PIB de 1935 no se recupera hasta 1953 → 20 años perdidos
- Racionamiento hasta 1952 → cartillas de racionamiento → estraperlo generalizado
- "Años del hambre": desnutrición + tuberculosis + mortalidad infantil
- Crisis de balanza de pagos (1959) → España al borde de la quiebra → cambio radical de modelo`,
    practice_prompt: '¿Qué fue la autarquía económica del primer franquismo? ¿Qué fue el INI y qué empresas creó? ¿Cuáles fueron las consecuencias económicas y sociales de la autarquía? ¿Por qué se habla de los "años del hambre"?',
    alert_markdown: null,
  },

  // ─── PARTE 54A: SEGUNDA GUERRA MUNDIAL, HENDAYA, DIVISIÓN AZUL ───────────────

  {
    sort_order: 110,
    block_key: 'La Dictadura Franquista',
    block_slug: 'dictadura-franquista',
    title: 'Franco y la Segunda Guerra Mundial: Hendaya y la División Azul (1939–1945)',
    concept_markdown: `## Franco y la Segunda Guerra Mundial (1939–1945)

España entró en la Segunda Guerra Mundial en una situación de **"no beligerancia"** (término acuñado por Mussolini, más comprometida que la neutralidad estricta pero sin llegar a la beligerancia). Franco era deudor del apoyo de Hitler y Mussolini en la Guerra Civil, y simpatizaba ideológicamente con el Eje.

### La Entrevista de Hendaya (23 de octubre de 1940)

Hitler y Franco se entrevistaron en la estación fronteriza de Hendaya durante nueve horas. Hitler quería la entrada de España en la guerra para atacar Gibraltar y cerrar el Mediterráneo occidental. Franco puso condiciones imposibles:
- Suministro de **400.000 toneladas de trigo** (España pasaba hambre).
- Entrega a España de **Marruecos francés, Orán y Guinea**.
- Armamento pesado moderno.

Hitler, que no podía satisfacer estas demandas sin comprometer sus relaciones con la Francia de Vichy, salió de Hendaya sin el acuerdo. Según la leyenda (probablemente apócrifa), Hitler dijo que prefería que le arrancaran cuatro muelas antes que volver a reunirse con Franco. Lo cierto es que Franco no quería entrar en la guerra si no estaba seguro de estar en el bando ganador, y en 1940–1941, tras el fracaso de la Batalla de Inglaterra, dudaba.

### La División Azul (1941–1943)

Como concesión a Hitler tras la invasión alemana de la URSS (*Operación Barbarroja, 22 de junio de 1941*), Franco envió la *División Española de Voluntarios*, conocida como la **División Azul** (por el color de las camisas falangistas), para combatir junto al ejército alemán en el frente del Este.
- Mandada por el general **Agustín Muñoz Grandes**.
- Unos **47.000 voluntarios** en total pasaron por el frente oriental entre 1941 y 1943.
- Combatieron principalmente en el frente de **Leningrado** (el largo asedio de la ciudad).
- Bajas: ~**5.000 muertos**, miles de heridos y prisioneros (algunos no regresaron hasta **1954**, tras largas negociaciones).

La División Azul fue un *balón de oxígeno político* para Franco: demostró a Hitler su lealtad sin comprometer formalmente a España, pero fue un grave lastre diplomático cuando Alemania empezó a perder la guerra. En **octubre de 1943**, Franco retiró la División Azul (aunque algunos voluntarios permanecieron en unidades alemanas hasta el fin de la guerra).`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fue la entrevista de Hendaya (1940) y qué fue la División Azul? ¿Por qué España no entró en la Segunda Guerra Mundial?*

**Hendaya (23 octubre 1940):**
- Hitler quiere a España en la guerra → para atacar Gibraltar
- Franco pide lo imposible: 400.000 t de trigo + Marruecos francés + Orán + Guinea + armamento moderno
- Hitler no puede dar nada de eso (Vichy se lo impide)
- Franco sospecha que el Eje no va a ganar → prefiere esperar
- Resultado: España sigue siendo "no beligerante"

**División Azul (1941-1943):**
- Concesión a Hitler tras la Operación Barbarroja (22 junio 1941)
- 47.000 voluntarios → frente de Leningrado → ~5.000 muertos
- Franco retira la División (octubre 1943) cuando Alemania empieza a perder
- El regreso de los últimos prisioneros: 1954

**Habilidad de Franco:** ni entra en la guerra (evita el desastre) ni rompe con Hitler (le debe la victoria en la GCE). Equilibrio calculado.`,
    practice_prompt: '¿Qué ocurrió en la entrevista de Hendaya entre Hitler y Franco (octubre de 1940)? ¿Por qué España no entró en la Segunda Guerra Mundial? ¿Qué fue la División Azul, dónde combatió y qué consecuencias tuvo?',
    alert_markdown: '⚠️ La posición oficial española durante la IIGM cambió: "**no beligerancia**" (1940-1943, favorable al Eje) → "**neutralidad**" (1943-1945, cuando el Eje empieza a perder). Este cambio terminológico es deliberado y refleja el oportunismo de Franco. Es un matiz que suele caer en PAU.',
  },

  // ─── PARTE 54B: AISLAMIENTO INTERNACIONAL ────────────────────────────────────

  {
    sort_order: 111,
    block_key: 'La Dictadura Franquista',
    block_slug: 'dictadura-franquista',
    title: 'El Aislamiento Internacional (1945–1953) y la Integración en la Guerra Fría',
    concept_markdown: `## El Aislamiento Internacional (1945–1953)

La derrota del Eje en 1945 convirtió a Franco en un **paria internacional**:
- **Conferencia de Potsdam (agosto de 1945):** Gran Bretaña, EE.UU. y la URSS acordaron que España no podría ingresar en la ONU mientras gobernara Franco.
- **Resolución de la ONU (12 de diciembre de 1946):** la Asamblea General recomendó a todos los países miembros **retirar sus embajadores de Madrid**. Solo Argentina (Perón), Portugal (Salazar) y la Santa Sede mantuvieron relaciones plenas. España quedó excluida del Plan Marshall.
- **Cierre de la frontera francesa (1946–1948).**

Franco respondió al aislamiento con la carta del anticomunismo y apelando al orgullo nacional herido. El régimen organizó una **manifestación en la Plaza de Oriente de Madrid (9 de diciembre de 1946)** con cientos de miles de personas en apoyo a Franco, como respuesta a la resolución de la ONU. El aislamiento, paradójicamente, reforzó la cohesión interna del régimen.

## La Integración en la Guerra Fría (1953–1955)

El estallido de la **Guerra Fría** y la **Guerra de Corea (1950–1953)** transformaron la posición internacional de España. Para EE.UU., el anticomunismo de Franco y la posición geográfica de España (el Atlántico y el Mediterráneo occidental) eran activos estratégicos que no podían desperdiciarse.

### Los Pactos de Madrid (26 de septiembre de 1953)

España y EE.UU. firmaron tres acuerdos bilaterales:
- EE.UU. obtenía el derecho a establecer **cuatro bases militares en España**: Torrejón de Ardoz (Madrid), Morón de la Frontera (Sevilla), Zaragoza y Rota (Cádiz).
- España obtenía a cambio **ayuda económica y militar** (unos 1.500 millones de dólares en total a lo largo de los años).
- Los acuerdos se renovaron periódicamente. España no ingresó en la OTAN (vetada por sus socios democráticos), pero quedó integrada *de facto* en el sistema de defensa occidental.

### El Concordato con la Santa Sede (27 de agosto de 1953)

Firmado semanas antes que los Pactos de Madrid, el Concordato con el Vaticano supuso el reconocimiento moral internacional del régimen. El Estado español garantizaba la enseñanza católica, la financiación del clero, privilegios jurisdiccionales para la Iglesia y el derecho del papa a vetar el nombramiento de obispos (aunque el Estado mantenía el *fuero de presentación*). La Iglesia, a cambio, legitimaba plenamente al régimen.

### Ingreso en la ONU (14 de diciembre de 1955)

España ingresó en la ONU en el marco de un acuerdo por el que entraron simultáneamente 16 países, superando el veto soviético e integrando a España en el bloque occidental. El aislamiento había terminado.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿En qué consistió el aislamiento internacional de España (1945-1953)? ¿Cómo logró Franco romperlo?*

**El aislamiento (1945-1953):**
- Potsdam (1945): España excluida de la ONU mientras Franco gobierne
- ONU (diciembre 1946): todos los países retiran embajadores → solo Argentina + Portugal + Vaticano
- España excluida del Plan Marshall
- Cierre frontera francesa (1946-48)
- Franco responde: manifestación Plaza de Oriente (9 dic. 1946) + carta del anticomunismo

**Ruptura del aislamiento (1953):**
- Guerra Fría + Guerra de Corea → EE.UU. necesita a España por su posición geográfica
- Pactos de Madrid (26 sept. 1953): 4 bases americanas (Torrejón + Morón + Zaragoza + Rota) → ayuda económica y militar
- Concordato con el Vaticano (27 agosto 1953): la Iglesia legitima el régimen
- ONU (14 diciembre 1955): España ingresa → fin del aislamiento`,
    practice_prompt: '¿En qué consistió el aislamiento internacional del franquismo (1945-1953)? ¿Cómo respondió Franco a la resolución de la ONU de 1946? ¿Qué fueron los Pactos de Madrid de 1953 y qué obtuvo cada parte? ¿Cuándo ingresó España en la ONU?',
    alert_markdown: '⚠️ Los **Pactos de Madrid (1953)** fueron un acuerdo bilateral EE.UU.-España, NO el ingreso en la OTAN. España no ingresó en la OTAN hasta **1982**, ya en democracia, bajo el gobierno de Calvo-Sotelo y confirmado en referéndum en 1986 bajo González. Esta distinción aparece frecuentemente en PAU.',
  },

  // ─── PARTE 55A: PLAN DE ESTABILIZACIÓN 1959 ──────────────────────────────────

  {
    sort_order: 112,
    block_key: 'La Dictadura Franquista',
    block_slug: 'dictadura-franquista',
    title: 'El Plan de Estabilización de 1959 y los Tecnócratas del Opus Dei',
    concept_markdown: `## El Plan de Estabilización de 1959 y el Giro Económico

### La Crisis de 1959

En **1959**, España estaba al borde de la quiebra técnica: las reservas de divisas eran casi nulas, la inflación superaba el 12% anual y el déficit de la balanza de pagos era insostenible. El FMI y la OCDE (de la que España era miembro desde 1948) condicionaron su ayuda a una reforma radical del modelo económico.

### El Plan de Estabilización y Liberalización (julio de 1959)

Diseñado por los ministros **tecnócratas del Opus Dei** (**Mariano Navarro Rubio** en Hacienda y **Alberto Ullastres** en Comercio), establecía:

- **Estabilización monetaria:** devaluación de la peseta (fijada en **60 pesetas por dólar**), restricción del crédito y equilibrio presupuestario.
- **Liberalización exterior:** apertura al comercio internacional, eliminación de aranceles proteccionistas, facilidades para la inversión extranjera.
- **Desmantelamiento parcial de los controles autárquicos:** liberalización de precios, reducción del intervencionismo estatal.

### El Coste Social Inmediato

La estabilización tuvo un **coste social inmediato**: recesión, desempleo, cierre de empresas ineficientes. La emigración a Europa se aceleró dramáticamente (entre 1960 y 1973 emigraron a Europa entre 1,5 y 2 millones de españoles, principalmente a Alemania Occidental, Francia, Suiza y Bélgica).

### Los Tecnócratas del Opus Dei

Los nuevos ministros pertenecían al **Opus Dei** (fundado por Josemaría Escrivá en 1928), una institución de la Iglesia Católica con un modelo peculiar de santificación a través del trabajo profesional. Los tecnócratas del Opus combinaban un catolicismo integrista en lo personal con una visión modernizadora y tecnocrática de la economía. Su objetivo era la prosperidad material como palanca de legitimación del régimen, sin democratización política.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fue el Plan de Estabilización de 1959? ¿Qué papel jugaron los tecnócratas del Opus Dei?*

**Contexto (1959):**
- España al borde de la quiebra: sin divisas + inflación 12% + déficit balanza de pagos
- FMI y OCDE: os ayudamos, pero a cambio de reformar el modelo económico

**Plan de Estabilización (julio 1959):**
- Navarro Rubio (Hacienda) + Ullastres (Comercio) → Opus Dei
- Devaluación peseta: 60 pts/$ → hace las exportaciones más baratas
- Apertura exterior: eliminar aranceles + facilitar inversión extranjera
- Reducir el intervencionismo autárquico

**Coste inmediato:** recesión + cierre de empresas → emigración masiva a Europa (1960-73)

**Los tecnócratas del Opus Dei:** católicos + pro-mercado + modernización económica SIN democratización → "desarrollismo tecnocrático"`,
    practice_prompt: '¿Qué situación económica forzó el Plan de Estabilización de 1959? Describe sus medidas principales. ¿Quiénes fueron los tecnócratas del Opus Dei y cuál era su proyecto político-económico?',
    alert_markdown: null,
  },

  // ─── PARTE 55B: DESARROLLISMO Y MILAGRO ECONÓMICO ────────────────────────────

  {
    sort_order: 113,
    block_key: 'La Dictadura Franquista',
    block_slug: 'dictadura-franquista',
    title: 'El Desarrollismo: los Planes de Desarrollo y el "Milagro Económico" (1960–1973)',
    concept_markdown: `## Los Planes de Desarrollo y el Milagro Económico (1960–1973)

Estabilizado el marco macroeconómico, el régimen apostó por la planificación indicativa al estilo francés, bajo la dirección del ministro de Planificación del Desarrollo **Laureano López Rodó** (Opus Dei):
- **I Plan de Desarrollo (1964–1967)**
- **II Plan de Desarrollo (1968–1971)**
- **III Plan de Desarrollo (1972–1975)**

Los planes seleccionaban **polos de desarrollo industrial** (Valladolid, Zaragoza, Burgos, Huelva, Vigo, La Coruña) para descentralizar industrialmente el país.

### Los Motores del Crecimiento

- **Turismo:** España se convirtió en el primer destino turístico del mundo. De **6 millones de turistas en 1960** a **34 millones en 1973**. El turismo generaba las divisas que financiaban las importaciones de bienes de equipo.
- **Remesas de emigrantes:** millones de españoles emigraron a Alemania, Francia, Suiza y Bélgica. Sus remesas supusieron una fuente crucial de divisas (unos **1.000 millones de dólares anuales** en el punto álgido).
- **Inversión extranjera directa:** capital estadounidense, alemán y francés acudió atraído por los bajos salarios españoles, la estabilidad política del régimen y los incentivos fiscales.

### Los Resultados del Desarrollismo

- El PIB español creció a una media del **7% anual** entre 1960 y 1973 (solo Japón creció más rápido en ese período).
- España pasó de ser un país agrario y subdesarrollado a la **décima potencia industrial del mundo** a principios de los años 70.
- **Producción de automóviles:** SEAT (con licencia FIAT) comenzó a producir el **SEAT 600 en 1957**, símbolo de la motorización española. En los años 60, el 600 se convirtió en el primer coche de millones de familias españolas.
- Producción de electrodomésticos, **construcción masiva de viviendas** (urbanización acelerada) y extensión del consumo de masas.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Cuáles fueron los motores del "milagro económico" español de los años 60? ¿Qué fueron los Planes de Desarrollo?*

**Planes de Desarrollo:**
- I (1964-67) + II (1968-71) + III (1972-75)
- Ministro López Rodó (Opus Dei)
- Polos de desarrollo industrial: Valladolid + Zaragoza + Burgos + Huelva + Vigo + La Coruña

**Los 3 motores del crecimiento:**
1. Turismo: 6 millones (1960) → 34 millones (1973) → divisas para importar maquinaria
2. Remesas de emigrantes: 1,5-2 millones de españoles en Europa → ~1.000 M$/año → divisas
3. Inversión extranjera: salarios bajos + estabilidad política → capital americano + alemán + francés

**Resultados:**
- 7% anual de crecimiento del PIB (1960-73) → solo superado por Japón
- España: 10ª potencia industrial mundial
- SEAT 600 (1957): símbolo del acceso popular al automóvil`,
    practice_prompt: 'Explica los Planes de Desarrollo del franquismo. ¿Cuáles fueron los tres grandes motores del "milagro económico" español de los años 60? ¿Qué papel tuvo el turismo? ¿Cuáles fueron los resultados del desarrollismo en términos de crecimiento económico?',
    alert_markdown: '⚠️ El "milagro económico" español (7% de crecimiento anual, 1960-73) coincide con los **"treinta gloriosos"** europeos (1945-1973), un período de prosperidad generalizada en Occidente. Una parte del éxito español se debe a ese viento de cola internacional, no solo a las políticas del régimen. El matiz es importante para PAU.',
  },

  // ─── PARTE 56A: TRANSFORMACIONES SOCIALES DEL DESARROLLISMO ──────────────────

  {
    sort_order: 114,
    block_key: 'La Dictadura Franquista',
    block_slug: 'dictadura-franquista',
    title: 'Las Transformaciones Sociales del Desarrollismo: Éxodo Rural, Emigración y Nueva Clase Media',
    concept_markdown: `## Las Transformaciones Sociales del Desarrollismo (1960–1975)

El desarrollismo transformó radicalmente la estructura social española en apenas una generación.

### Éxodo Rural y Urbanización

- Millones de campesinos abandonaron el campo para trabajar en las ciudades industriales: Barcelona, Madrid, Bilbao, Valencia, Zaragoza.
- La población urbana pasó del **57% en 1960** al **73% en 1975**.
- Surgieron los **polígonos de vivienda** (los *"barrios dormitorio"*) en las periferias de las grandes ciudades, construidos rápidamente y con escasos servicios.
- Regiones expulsoras de población: Extremadura, Castilla-La Mancha, Andalucía, Galicia. Regiones receptoras: Cataluña, País Vasco, Madrid.

### La Emigración Exterior

- Entre **1960 y 1973**, emigraron a Europa entre **1,5 y 2 millones de españoles**, principalmente a Alemania Occidental, Francia, Suiza y Bélgica.
- Las **remesas** enviadas por los emigrantes (unos **1.000 millones de dólares anuales** en el punto álgido) fueron fundamentales para financiar las importaciones de maquinaria y bienes de equipo.

### La Nueva Clase Media y el Consumo

- Aparición de una amplia **clase media urbana** con acceso al automóvil, los electrodomésticos, la televisión (en 1975 había ~8 millones de televisores) y las vacaciones.
- La **televisión española (TVE)**, inaugurada en 1956 y con cobertura nacional desde los años 60, se convirtió en el principal instrumento de homogeneización cultural y de propaganda del régimen.

### El Cambio en el Papel de la Mujer

- La incorporación masiva de la mujer al trabajo asalariado en los años 60 (especialmente en el sector servicios y la industria textil) transformó las relaciones de género, aunque la legislación franquista seguía discriminando a la mujer (necesitaba el permiso del marido —**licencia marital**— para trabajar, abrir una cuenta bancaria, obtener el pasaporte o realizar cualquier acto jurídico).
- La **Sección Femenina de Falange** (dirigida por Pilar Primo de Rivera desde 1934) impuso el modelo de mujer abnegada, madre, esposa y católica.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué transformaciones sociales produjo el desarrollismo franquista en España?*

**Éxodo rural:**
- Campo → ciudad: 57% urbano (1960) → 73% (1975)
- Regiones expulsoras: Extremadura + Andalucía + Castilla-La Mancha + Galicia
- Regiones receptoras: Cataluña + País Vasco + Madrid
- Resultado: barrios dormitorio en las periferias

**Emigración exterior (1960-73):**
- 1,5-2 millones a Alemania + Francia + Suiza + Bélgica
- Remesas: ~1.000 M$/año → divisas esenciales

**Nueva clase media:**
- Acceso al coche (SEAT 600) + electrodomésticos + TV + vacaciones
- TVE (1956): propaganda + homogeneización cultural → "el parte" de Franco

**La mujer:**
- Se incorpora al trabajo en los 60 → pero necesita "licencia marital" para todo
- Sección Femenina (Pilar Primo de Rivera): modelo de mujer sumisa, madre y católica`,
    practice_prompt: 'Describe las principales transformaciones sociales que produjo el desarrollismo franquista (1960-1975). ¿Qué fue el éxodo rural y adónde fueron los emigrantes? ¿Cómo cambió el papel de la mujer y qué fue la "licencia marital"?',
    alert_markdown: '⚠️ La **licencia marital** (permiso del marido obligatorio para que la mujer trabajara, abriera una cuenta bancaria u obtuviera el pasaporte) no fue abolida en España hasta **1975**, con la Ley de la Reforma Política. Es uno de los datos más impactantes de la legislación franquista sobre la mujer.',
  },

  // ─── PARTE 56B: OPOSICIÓN DEMOCRÁTICA ────────────────────────────────────────

  {
    sort_order: 115,
    block_key: 'La Dictadura Franquista',
    block_slug: 'dictadura-franquista',
    title: 'El Auge de la Oposición Democrática: CC.OO., Estudiantes, Iglesia y ETA',
    concept_markdown: `## El Auge de la Oposición Democrática (1960–1975)

Paradójicamente, el desarrollo económico generó las condiciones para el crecimiento de la oposición al franquismo.

### 1. El Movimiento Obrero: CC.OO. y las Huelgas

Las **Comisiones Obreras (CC.OO.)**, fundadas en las cuencas mineras de Asturias y en la industria catalana a partir de **1962**, fueron la organización sindical de oposición más importante. Su táctica fue infiltrarse en el sindicato vertical franquista (el *OSE, Organización Sindical Española*) para utilizar sus estructuras legales desde dentro.

Las huelgas se multiplicaron a partir de los años 60:
- **Huelgas de Asturias de 1962:** la más importante oleada huelguística del franquismo hasta entonces. El gobierno declaró el estado de excepción. El Comité de Libertades Sindicales de la OIT condenó a España.
- Las huelgas pasaron de ser puramente económicas (salarios, condiciones) a tener un carácter político creciente en los años 70.
- CC.OO. estuvo durante años bajo la influencia del **PCE** (Partido Comunista de España), que era la organización política antifranquista mejor organizada en el interior de España, dirigida desde el exilio por **Santiago Carrillo**.

### 2. El Movimiento Estudiantil

La universidad española, masificada por el crecimiento demográfico y el desarrollo económico, se convirtió en un foco permanente de oposición:
- En **1956**, disturbios universitarios en Madrid obligaron al gobierno a declarar el estado de excepción y a cesar al ministro de Educación, Joaquín Ruiz-Giménez (aperturista).
- El *SEU (Sindicato Español Universitario)*, sindicato oficial franquista, fue boicoteado y sustituido progresivamente por organismos estudiantiles democráticos.
- Detenciones y expedientes académicos a catedráticos y profesores: **Enrique Tierno Galván, Agustín García Calvo, José Luis Aranguren** fueron separados de sus cátedras en 1965.

### 3. La Oposición desde la Iglesia

El **Concilio Vaticano II (1962–1965)**, convocado por Juan XXIII, transformó la Iglesia católica mundial y tuvo enormes consecuencias en España:
- Los documentos conciliares (*Gaudium et Spes* y *Dignitatis Humanae*) afirmaban la libertad religiosa y los derechos humanos, en contradicción directa con el régimen franquista.
- En **1960**, **339 sacerdotes vascos** firmaron un documento denunciando la tortura de detenidos.
- Se creó la **prisión concordataria de Zamora** (*"el cura de Zamora"*), una cárcel especial para sacerdotes encarcelados por actividades políticas, que llegó a albergar a decenas de religiosos.
- El cardenal **Vicente Enrique y Tarancón**, arzobispo de Madrid desde 1971 y presidente de la Conferencia Episcopal, se convirtió en el símbolo de la distancia entre la Iglesia y el régimen. Los sectores ultraderechistas lo llamaban *"Tarancón al paredón"*.

### 4. Los Nacionalismos: ETA

**ETA (Euskadi Ta Askatasuna, "País Vasco y Libertad")** fue fundada en **1959** por jóvenes del PNV disconformes con la pasividad de la dirección del partido en el exilio. Adoptó la lucha armada como método en **1961**.

Su primer atentado mortal fue el asesinato del inspector de policía **Melitón Manzanas (2 de agosto de 1968)**, el represor más conocido de la policía política en el País Vasco.

El **Proceso de Burgos (diciembre de 1970)** fue un consejo de guerra contra 16 militantes de ETA (6 de ellos condenados a muerte). La presión internacional (el papa Pablo VI, gobiernos europeos, manifestaciones en todo el mundo) y las protestas internas forzaron a Franco a conmutar las penas de muerte. El proceso de Burgos fue un gran éxito propagandístico para ETA y un grave golpe para la imagen internacional del régimen.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué formas adoptó la oposición al franquismo durante el desarrollismo (años 60-70)?*

**1. CC.OO. (desde 1962):**
- Fundadas en Asturias y Cataluña → infiltran el sindicato vertical (OSE)
- Huelgas de Asturias (1962): estado de excepción + condena de la OIT
- Influencia del PCE (Carrillo)

**2. Movimiento estudiantil:**
- 1956: disturbios universitarios → estado de excepción
- Boicot al SEU → organizaciones democráticas propias
- Catedráticos depurados: Tierno Galván + Aranguren + García Calvo

**3. La Iglesia:**
- Vaticano II (1962-65): los documentos conciliares contradicen al franquismo
- 339 sacerdotes vascos denuncian la tortura (1960)
- Cárcel de Zamora: sacerdotes presos por actividades políticas
- Tarancón: símbolo de la Iglesia que se aleja del régimen

**4. ETA (1959-1975):**
- Fundada en 1959 → lucha armada desde 1961
- Primer atentado mortal: Melitón Manzanas (agosto 1968)
- Proceso de Burgos (dic. 1970): 6 condenas a muerte → presión internacional → Franco conmuta`,
    practice_prompt: 'Explica las cuatro principales formas de oposición al franquismo que surgieron durante el desarrollismo: el movimiento obrero (CC.OO.), el movimiento estudiantil, la oposición desde la Iglesia y el nacionalismo vasco (ETA). ¿Qué fue el Proceso de Burgos y qué consecuencias tuvo?',
    alert_markdown: '⚠️ **ETA** fue fundada en **1959** (no en los años 30 o 40). Es una organización creada dentro del franquismo, por jóvenes que consideraban que el PNV histórico era demasiado pasivo. Su contexto de origen es la dictadura franquista, no la Guerra Civil ni la República.',
  },

  // ─── PARTE 57A: CARRERO BLANCO Y CRISIS DEL PETRÓLEO ─────────────────────────

  {
    sort_order: 116,
    block_key: 'La Dictadura Franquista',
    block_slug: 'dictadura-franquista',
    title: 'El Asesinato de Carrero Blanco (1973) y la Crisis del Petróleo',
    concept_markdown: `## El Asesinato de Carrero Blanco (20 de diciembre de 1973)

El almirante **Luis Carrero Blanco** era la figura clave del tardofranquismo. Presidente del Gobierno desde **junio de 1973** (Franco, con 80 años y la enfermedad de Parkinson avanzada, separó por primera vez la Jefatura del Estado de la Presidencia del Gobierno), Carrero Blanco era el hombre destinado a garantizar la continuidad del régimen tras la muerte de Franco.

ETA llevó a cabo la operación **"Ogro"**: durante meses, un comando excavó un túnel bajo la calle Claudio Coello de Madrid (frente a la iglesia donde Carrero Blanco asistía a misa cada mañana) y colocó 80 kg de explosivos. El **20 de diciembre de 1973**, el coche oficial de Carrero Blanco fue proyectado por la explosión **por encima del edificio de cinco plantas de la iglesia**, aterrizando en un patio interior. Carrero murió en el acto.

El asesinato de Carrero Blanco fue de consecuencias incalculables: **eliminó al único hombre capaz de garantizar el franquismo sin Franco** y precipitó la descomposición del régimen. El sector aperturista del régimen ganó terreno frente al **"búnker"** (el sector inmovilista).

## La Crisis del Petróleo (1973) y sus Consecuencias en España

La **crisis del petróleo de octubre de 1973** (la OPEP cuadruplicó el precio del crudo en represalia por el apoyo occidental a Israel en la guerra del Yom Kipur) golpeó especialmente a España:
- La economía española era altamente dependiente del petróleo importado (que representaba el **70% de su consumo energético**).
- El crecimiento económico se frenó bruscamente: el PIB, que había crecido al 7% anual, creció solo el **1% en 1975**.
- La **inflación** se disparó hasta el **17% en 1974** y el **14% en 1975**.
- El **desempleo** comenzó a crecer.
- Las **remesas de los emigrantes** se redujeron al empezar los países europeos a expulsar trabajadores extranjeros.

La crisis económica llegó en el peor momento político posible: cuando el régimen ya daba señales de agotamiento y la sociedad demandaba cambios.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Por qué fue tan importante el asesinato de Carrero Blanco (1973)? ¿Qué consecuencias tuvo la crisis del petróleo en España?*

**Carrero Blanco (20 diciembre 1973):**
- Presidente del Gobierno desde junio 1973 (Franco ya no podía gobernar solo)
- "El hombre que garantizaría el franquismo sin Franco"
- Operación "Ogro": túnel + 80 kg de explosivos bajo la calle Claudio Coello
- El coche de Carrero Blanco salta por encima de un edificio de 5 plantas
- Consecuencia histórica: sin Carrero, el régimen pierde su principal activo de continuidad → aperturistas vs "búnker"

**Crisis del petróleo (octubre 1973):**
- OPEP cuadruplica el precio del petróleo (represalia por guerra del Yom Kipur)
- España depende del petróleo en un 70% de su energía
- Consecuencias: crecimiento PIB: 7% → 1% // inflación: 17% (1974) // desempleo sube // remesas bajan
- La prosperidad de los 60 termina justo cuando el régimen más necesitaba su legitimación económica`,
    practice_prompt: 'Explica quién era Carrero Blanco y por qué su asesinato (20 de diciembre de 1973) fue tan importante para la historia del franquismo. ¿Cómo llevó a cabo ETA el atentado? ¿Qué consecuencias tuvo la crisis del petróleo de 1973 en la economía española?',
    alert_markdown: null,
  },

  // ─── PARTE 57B: AGONÍA DEL FRANQUISMO Y MUERTE DE FRANCO ─────────────────────

  {
    sort_order: 117,
    block_key: 'La Dictadura Franquista',
    block_slug: 'dictadura-franquista',
    title: 'La Agonía del Franquismo: el Sáhara, los Fusilamientos de 1975 y la Muerte de Franco',
    concept_markdown: `## La Crisis Final del Franquismo (1974–1975)

### El Conflicto del Sáhara Occidental (1975)

El **Sáhara Español** era el último territorio colonial español en África, con importantes yacimientos de fosfatos (los más ricos del mundo) descubiertos en **1963**. El **Frente POLISARIO** (fundado en **1973** con apoyo de Argelia) reivindicaba la independencia del territorio.

En el contexto de descolonización de la ONU, el *Tribunal Internacional de Justicia* emitió en octubre de 1975 un dictamen que reconocía vínculos históricos entre el Sáhara y Marruecos y Mauritania, pero no la soberanía de ninguno de los dos, abriendo la puerta a la autodeterminación.

El rey **Hassan II de Marruecos**, aprovechando la agonía de Franco, organizó la **"Marcha Verde"** (noviembre de 1975): **350.000 civiles marroquíes** cruzaron la frontera con el Sáhara en una marcha organizada por el Estado para presionar a España. El gobierno franquista, incapaz de reaccionar con Franco agonizante, firmó los **Acuerdos de Madrid (14 de noviembre de 1975)** por los que cedía el Sáhara a Marruecos y Mauritania, traicionando al pueblo saharaui y contraviniendo las resoluciones de la ONU. **El conflicto del Sáhara continúa sin resolverse en la actualidad**.

### Los Fusilamientos del 27 de Septiembre de 1975

Cinco militantes de ETA y del FRAP (Frente Revolucionario Antifascista y Patriótico) fueron fusilados pese a las peticiones de clemencia del papa Pablo VI, los jefes de Estado europeos y manifestaciones en todo el mundo. Fue la **última ejecución masiva del régimen**. Como respuesta, casi todos los países europeos retiraron temporalmente a sus embajadores.

### La Muerte de Franco (20 de noviembre de 1975)

Los últimos años de Franco estuvieron marcados por su deterioro físico (enfermedad de Parkinson, tromboflebitis, úlcera de estómago).

Francisco Franco Bahamonde murió el **20 de noviembre de 1975**, a las 5:25 de la madrugada, víctima de un fallo multiorgánico tras semanas de agonía. Tenía **82 años** y llevaba **39 en el poder**. El príncipe **Juan Carlos de Borbón** fue proclamado rey de España el **22 de noviembre de 1975**, según lo previsto por la Ley de Sucesión de 1947 y la designación de Franco de **1969** (*"a título de rey"*).`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fue la "Marcha Verde" (1975)? ¿Cuáles fueron los últimos meses del franquismo?*

**La Marcha Verde (noviembre 1975):**
- Sáhara Español: último territorio colonial + fosfatos + Frente POLISARIO (desde 1973)
- El Tribunal Internacional de Justicia no otorga soberanía a Marruecos
- Hassan II organiza la marcha igualmente: 350.000 civiles cruzan la frontera
- Franco agonizante → el gobierno firma los Acuerdos de Madrid (14 noviembre 1975)
- España entrega el Sáhara a Marruecos y Mauritania → traición al pueblo saharaui

**Fusilamientos (27 septiembre 1975):**
- 5 ejecutados (ETA + FRAP) a pesar de la presión internacional
- Respuesta: países europeos retiran sus embajadores

**Muerte de Franco (20 noviembre 1975):**
- 82 años, 39 en el poder
- Juan Carlos I proclamado rey (22 noviembre 1975) → designado por Franco en 1969`,
    practice_prompt: '¿Qué fue la "Marcha Verde" marroquí (1975) y cómo respondió el gobierno franquista? ¿Por qué los fusilamientos del 27 de septiembre de 1975 causaron una crisis diplomática? ¿Cuándo murió Franco y quién le sucedió?',
    alert_markdown: '⚠️ El **20 de noviembre** es la fecha de la muerte de Franco (1975) pero también la del fusilamiento de José Antonio Primo de Rivera (1936). Ambas fechas coinciden. El franquismo tardío convirtió el 20 de noviembre en una conmemoración doble. El aniversario de la muerte de Franco sigue siendo una fecha de movilización de la extrema derecha española.',
  },

  // ─── SÍNTESIS DEL FRANQUISMO ─────────────────────────────────────────────────

  {
    sort_order: 118,
    block_key: 'La Dictadura Franquista',
    block_slug: 'dictadura-franquista',
    title: 'Síntesis y Cronología del Franquismo (1939–1975)',
    concept_markdown: `## Síntesis del Franquismo (1939–1975)

El franquismo fue la dictadura personal del general Francisco Franco Bahamonde que gobernó España durante casi cuatro décadas (1939–1975). Fue un régimen camaleónico que supo adaptarse a los cambios internacionales —desde la cercanía al Eje fascista hasta la alianza con Estados Unidos durante la Guerra Fría— sin modificar su esencia autoritaria.

### Las Leyes Fundamentales del Régimen (el Ordenamiento Jurídico Franquista)

El franquismo no tenía constitución sino **siete Leyes Fundamentales** que fueron aprobadas progresivamente:
1. **Fuero del Trabajo (1938):** carta laboral, sindicalismo vertical.
2. **Ley Constitutiva de las Cortes (1942):** Cortes sin elecciones libres, representación corporativa.
3. **Fuero de los Españoles (1945):** derechos individuales formales, sin garantías reales.
4. **Ley del Referéndum Nacional (1945):** franco podía consultar al pueblo directamente.
5. **Ley de Sucesión (1947):** España como "reino" aunque sin rey; Franco podía designar a su sucesor.
6. **Ley de Principios del Movimiento Nacional (1958):** los principios ideológicos inamovibles del régimen.
7. **Ley Orgánica del Estado (1966):** reforma del sistema institucional.

### La Evolución del Régimen en Tres Etapas

**Primera etapa (1939–1959): El Franquismo Autárquico**
- Pilar: las "familias" falangista y carlista dominan.
- Economía: autarquía → fracaso → "años del hambre".
- Política exterior: no beligerancia → aislamiento → Pactos de Madrid (1953) → ONU (1955).

**Segunda etapa (1959–1973): El Franquismo Desarrollista**
- Pilar: los tecnócratas del Opus Dei dominan.
- Economía: Plan de Estabilización (1959) → Planes de Desarrollo → milagro económico (7% anual).
- Sociedad: éxodo rural + emigración + nueva clase media + oposición creciente (CC.OO., ETA, Iglesia).

**Tercera etapa (1973–1975): La Agonía del Franquismo**
- Asesinato de Carrero Blanco (diciembre 1973).
- Crisis del petróleo (1973) → fin del milagro económico.
- Proceso de Burgos (1970) + fusilamientos de septiembre 1975 → aislamiento diplomático.
- Marcha Verde + Acuerdos de Madrid (noviembre 1975).
- Muerte de Franco (20 noviembre 1975) → Juan Carlos I (22 noviembre 1975).`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Cuáles fueron las principales etapas del franquismo y sus características?*

**1ª etapa (1939-1959): Autarquía**
- Familias dominantes: Falange + carlistas
- Represión + autarquía → "años del hambre" → aislamiento internacional → Pactos de Madrid + ONU

**2ª etapa (1959-1973): Desarrollismo**
- Opus Dei en el poder económico
- Plan de Estabilización (1959) → 7% PIB anual → 10ª potencia industrial
- Turismo + remesas + inversión extranjera como motores
- Oposición: CC.OO. + estudiantes + Iglesia + ETA

**3ª etapa (1973-1975): Agonía**
- Carrero Blanco muerto (dic. 1973) → el "plan de continuidad" se derrumba
- Crisis del petróleo: 7% → 1% PIB, inflación 17%
- Marcha Verde: España entrega el Sáhara (nov. 1975)
- Fusilamientos (sept. 1975) → crisis diplomática
- Franco muere (20 nov. 1975) → Juan Carlos I (22 nov.)`,
    practice_prompt: 'Elabora una síntesis de las tres grandes etapas del franquismo (1939-1959, 1959-1973, 1973-1975), indicando para cada una las características políticas, económicas e internacionales más importantes. ¿Qué fueron las Leyes Fundamentales del régimen?',
    alert_markdown: '⚠️ Las **siete Leyes Fundamentales** del franquismo son el equivalente a una constitución fragmentada. Es importante saber que el régimen franquista NO tuvo constitución: gobernó mediante leyes fundamentales aprobadas una a una, lo que le daba enorme flexibilidad para adaptarse a las circunstancias internacionales.',
  },
]

const BATCH_SIZE = 5

async function main() {
  console.log(`Insertando ${cards.length} tarjetas del Bloque 12 (La Dictadura Franquista)…`)

  for (let i = 0; i < cards.length; i += BATCH_SIZE) {
    const batch = cards.slice(i, i + BATCH_SIZE)
    const rows = batch.map(c => ({
      subject: SUBJECT,
      block_key: c.block_key,
      block_slug: c.block_slug,
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
      console.error(`Error en batch ${i + 1}–${Math.min(i + BATCH_SIZE, cards.length)}:`, error)
      process.exit(1)
    }
    console.log(`✓ Insertadas tarjetas ${i + 1}–${Math.min(i + BATCH_SIZE, cards.length)}`)
  }

  const { count, error: countErr } = await supabase
    .from('curriculum_content_v2')
    .select('*', { count: 'exact', head: true })
    .eq('subject', 'historia_espana')

  if (countErr) {
    console.error('Error al contar:', countErr)
  } else {
    console.log(`\n✅ Bloque 12 insertado. Total filas historia_espana en tabla: ${count}`)
  }
}

main()
