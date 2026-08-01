// Uso: node --env-file=.env.local docs/insert_historia_b8.mjs
// Bloque 8 — La Restauración (1874–1902): flashcards 71-79
// Partes 33-39 de los apuntes de Diego

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const SUBJECT = 'historia_espana'

const cards = [

  // ─── EL SISTEMA CANOVISTA ────────────────────────────────────────────────────

  {
    sort_order: 71,
    block_key: 'La Restauración',
    block_slug: 'restauracion',
    title: 'El Sistema Canovista: Constitución de 1876 y el Turno de Partidos',
    concept_markdown: `## El Sistema Canovista: La Restauración Borbónica (1874–1902)

La Restauración borbónica supuso el retorno de la monarquía constitucional tras el fracaso del Sexenio Democrático (1868–1874). Su arquitecto fue **Antonio Cánovas del Castillo**, quien diseñó un sistema bipartidista estable pero profundamente viciado por el fraude electoral.

### El Manifiesto de Sandhurst (1 de diciembre de 1874)

Antes del pronunciamiento militar del General Martínez Campos en Sagunto (29 de diciembre de 1874), Cánovas preparó el terreno político mediante el *Manifiesto de Sandhurst*: carta redactada por él mismo pero firmada por el príncipe **Alfonso de Borbón** desde la academia militar británica donde estudiaba. Sus puntos:
- Legitimidad dinástica de Alfonso frente a la revolución y el carlismo
- Promesa de monarquía constitucional y católica
- Reconciliación nacional integrando a liberales y conservadores

Alfonso XII fue proclamado rey con solo 17 años.

### La Constitución de 1876

Aprobada el 30 de junio de 1876, fue la constitución de **mayor vigencia en la historia de España** (hasta 1923). Sus rasgos:
- **Soberanía compartida** entre el Rey y las Cortes
- **Cortes bicamerales:** Senado (designación real y vitalicios) + Congreso (electo)
- **Sufragio flexible:** censitario hasta 1890, luego universal masculino (Ley Electoral de 1890)
- **Confesionalidad católica** con tolerancia privada de otros cultos (art. 11)
- El **Rey** como eje del sistema: nombraba y cesaba ministros, disolvía las Cortes

### El Turno de Partidos (Bipartidismo Canovista)

El gran ingenio político de Cánovas fue el **turno pacífico**: acuerdo tácito entre dos partidos dinásticos para alternarse en el poder de forma ordenada:

| Partido | Líder | Base social |
|---|---|---|
| **Conservador** | Antonio Cánovas del Castillo | Nobleza, burguesía tradicional, clero |
| **Liberal** | Práxedes Mateo Sagasta | Burguesía industrial, clases medias |

Cuando un gobierno se desgastaba, el rey llamaba al partido de la oposición, que luego *fabricaba* las elecciones para obtener su mayoría parlamentaria. Los liberales de Sagasta introdujeron reformas clave: Ley de Asociaciones (1887), Código Civil (1889), sufragio universal masculino (1890) y juicio por jurado.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿En qué consistió el sistema político de la Restauración? ¿Qué fue el turno de partidos?*

**Estructura:**
1. Cánovas: arquitecto del sistema → Manifiesto de Sandhurst (1874) + Constitución de 1876
2. Constitución de 1876: soberanía compartida + bicameralismo + flexibilidad en el sufragio
3. Turno de partidos: Conservadores (Cánovas) + Liberales (Sagasta) → alternancia pactada
4. Mecánica real: el rey llama al partido de la oposición → este fabrica las elecciones → estabilidad ficticia
5. Aportaciones de Sagasta: sufragio universal masculino (1890), Código Civil, juicio por jurado

**Clave PAU:** El turno de partidos NO era una democracia real. Las elecciones estaban fabricadas mediante el caciquismo. Es un sistema de apariencia liberal con funcionamiento oligárquico.`,
    practice_prompt: 'Explica el sistema político de la Restauración. ¿Qué fue el Manifiesto de Sandhurst? ¿En qué consistía el turno de partidos? ¿Cómo se diferenciaban el Partido Conservador y el Partido Liberal de Sagasta?',
    alert_markdown: '⚠️ La Constitución de 1876 fue la de **mayor duración** de la historia española (1876–1923 = 47 años). No confundir con la de 1978 (la actual), que ya la supera. La clave de su duración: la soberanía compartida la hacía aceptable tanto para conservadores como para liberales.',
  },

  // ─── FRAUDE ELECTORAL ─────────────────────────────────────────────────────────

  {
    sort_order: 72,
    block_key: 'La Restauración',
    block_slug: 'restauracion',
    title: 'El Fraude Electoral: Caciquismo, Encasillado y Pucherazo',
    concept_markdown: `## El Fraude Electoral: La Mecánica del Sistema Canovista

El turno de partidos solo funcionaba gracias a una maquinaria de fraude perfectamente engrasada. Como se decía en la época: *"en España las elecciones no se ganan, se hacen"*.

### 1. El Encasillado

Antes de celebrar cualquier elección, el **Ministerio de la Gobernación** elaboraba la *"casilla"*: una lista con los candidatos que debían ganar en cada distrito electoral del país. Este documento se enviaba a los gobernadores civiles de cada provincia, quienes a su vez lo transmitían a los **caciques** locales con sus instrucciones.

### 2. El Caciquismo

El **cacique** era el hombre fuerte local —un terrateniente, un abogado influyente, el alcalde o el párroco— que controlaba la vida económica y social de un municipio o comarca. Su función en el sistema electoral era garantizar que su distrito votara al candidato encasillado a cambio de **favores del gobierno central**: obras públicas, empleos, indultos, licencias comerciales.

**Joaquín Costa** los describió como los operadores de *"oligarquía y caciquismo"*, su célebre obra de 1901.

### 3. El Pucherazo

Si la presión social del cacique no bastaba para asegurar el resultado, se recurría al fraude directo o **pucherazo**:
- Alteración de las actas electorales
- Votación de difuntos ("muertos que votan", los llamados *cuneros*)
- Compra directa de votos
- Intimidación de electores
- Falsificación de resultados en las actas

**El circuito del fraude:**
*Decreto de convocatoria → Encasillado (Gobernación) → Cacique local → Pucherazo → Mayoría fabricada*`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fue el caciquismo? ¿Cómo funcionaba el fraude electoral durante la Restauración?*

**Respuesta modelo:**
1. El encasillado: el Ministerio de la Gobernación fija de antemano quién debe ganar en cada distrito
2. El cacique: intermediario local entre el poder central y los votantes → trabaja con presión social + favores
3. El pucherazo: fraude directo cuando la presión no basta → difuntos que votan, actas falsificadas
4. Resultado: el pueblo vota pero el resultado ya está decidido de antemano → democracia de fachada

**Crítica contemporánea:** Joaquín Costa lo llamó "oligarquía y caciquismo" = el poder real está en manos de una oligarquía, no del pueblo. El sufragio universal de 1890 no cambió nada porque el mecanismo del fraude lo hacía inútil.`,
    practice_prompt: 'Explica cómo funcionaba el fraude electoral durante la Restauración. ¿Qué eran el encasillado, el caciquismo y el pucherazo? ¿Por qué el sufragio universal masculino de 1890 no supuso una democratización real del sistema?',
    alert_markdown: null,
  },

  // ─── OPOSICIÓN AL SISTEMA ─────────────────────────────────────────────────────

  {
    sort_order: 73,
    block_key: 'La Restauración',
    block_slug: 'restauracion',
    title: 'La Oposición al Sistema: Republicanos, Carlistas y Nacionalismos Periféricos',
    concept_markdown: `## Las Fuerzas de Oposición al Sistema de la Restauración

Fuera del bipartidismo dinástico (conservadores y liberales) existían fuerzas políticas que rechazaban el sistema canovista por razones muy distintas.

### Los Republicanos

Herederos del Sexenio Democrático (1868–1874), estuvieron permanentemente divididos en múltiples facciones: los *posibilistas* de Castelar, los *federales* de Pi i Margall, los *centralistas* de Salmerón y los *radicales* de Ruiz Zorrilla. Su principal debilidad fue precisamente esta **fragmentación permanente**. En 1903, Alejandro Lerroux fundó el Partido Republicano Radical con gran implantación en Barcelona.

### Los Carlistas

Tras la derrota en la **Tercera Guerra Carlista (1872–1876)** con la toma de Estella, el carlismo se retiró a la actividad política legal. Don Carlos VII se exilió y el movimiento continuó como fuerza antiliberal, ultracatólica y fuerista, con implantación en Navarra, País Vasco y Cataluña.

### Los Nacionalismos Periféricos

La Restauración coincidió con el nacimiento de los modernos nacionalismos periféricos:

**Catalanismo:** La *Renaixença* cultural (movimiento de recuperación de la lengua y cultura catalanas) derivó hacia el político. En 1892 se aprobaron las **Bases de Manresa**, primer programa político catalanista que reclamaba la autonomía de Cataluña. En 1901 se fundó la **Lliga Regionalista** (Prat de la Riba, Cambó), partido burgués catalanista que se convertiría en la fuerza hegemónica en Cataluña.

**Nacionalismo Vasco:** **Sabino Arana y Goiri** fundó el **Partido Nacionalista Vasco (PNV)** en 1895, con un ideario de raíz racial, católica y antiespañola, reivindicando la restauración de los fueros abolidos en 1876. Su lema: *"Jaungoikoa eta Lagi Zarra"* (Dios y Ley Vieja).

**Regionalismo Gallego:** De carácter más cultural que político, vinculado al movimiento *Rexurdimento*.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Cuáles fueron las principales fuerzas de oposición al sistema de la Restauración? ¿Cómo surgieron los nacionalismos periféricos?*

**Estructura:**
1. Republicanos: herederos del Sexenio → fragmentados en facciones → debilidad permanente
2. Carlistas: tras derrota de 1876 → actividad política legal → País Vasco, Navarra, Cataluña
3. Catalanismo: Renaixença cultural → Bases de Manresa (1892) → Lliga Regionalista (1901)
4. PNV (1895): Sabino Arana → raíz racial + católica + fuerista → contra la abolición de fueros de 1876
5. Regionalismo gallego: Rexurdimento (más cultural que político)

**Clave:** Los nacionalismos periféricos nacen en la Restauración en parte como reacción al centralismo canovista y a la abolición de los fueros vascos (1876) y las constituciones catalanas (1716).`,
    practice_prompt: 'Describe las principales fuerzas de oposición al sistema de la Restauración: republicanos, carlistas y nacionalismos periféricos. ¿Cuándo y cómo surgieron el catalanismo político y el PNV? ¿Cuáles eran sus reivindicaciones principales?',
    alert_markdown: '⚠️ El **PNV** fue fundado por Sabino Arana en **1895**, NO en la Transición. Es uno de los partidos más antiguos de España. Sus primeros textos tienen un contenido racial que el partido moderno ha abandonado completamente.',
  },

  // ─── MOVIMIENTO OBRERO: ANARQUISMO ───────────────────────────────────────────

  {
    sort_order: 74,
    block_key: 'La Restauración',
    block_slug: 'restauracion',
    title: 'El Anarquismo en España: La FTRE y la "Propaganda por el Hecho"',
    concept_markdown: `## El Anarquismo en España durante la Restauración

### Contexto: La Industrialización Desigual

La industrialización española fue **tardía y desigual**, concentrada en Cataluña (textil) y el País Vasco (siderurgia y minería). Las condiciones laborales eran brutales: jornadas de 12–14 horas, trabajo infantil, salarios de miseria y nula protección social.

La **I Internacional (AIT)** llegó a España en 1868 de la mano de **Giuseppe Fanelli**, enviado de Bakunin, lo que explica el predominio inicial del **anarquismo** (no del socialismo marxista) en España.

### La FTRE (1881)

Tras la ilegalización de la AIT durante la República (1874), el movimiento anarquista se reorganizó como **Federación de Trabajadores de la Región Española (FTRE)**, fundada en el Congreso de Barcelona de **1881**, durante el gobierno liberal de Sagasta.

Sus principios fundamentales:
- **Acción directa** frente a la participación política electoral (considerada una trampa del Estado burgués)
- **Antipoliticismo** radical: rechazo del Estado, los partidos y las elecciones
- **Colectivismo:** propiedad colectiva de los medios de producción
- **Federalismo:** organización desde abajo hacia arriba, sin jerarquías

La FTRE tuvo gran fuerza en **Andalucía** (jornaleros agrícolas) y **Cataluña** (obreros industriales), alcanzando cerca de 60.000 afiliados en su apogeo (1882).

### La "Propaganda por el Hecho": El Terrorismo Anarquista

En la década de 1890, una parte del anarquismo derivó hacia los atentados terroristas:
- **Atentado del Liceo de Barcelona (1893):** Santiago Salvador lanzó dos bombas desde el gallinero → 20 muertos
- **Atentado en la procesión del Corpus Christi (calle Cambios Nuevos, Barcelona, 1896)**
- **Asesinato de Cánovas del Castillo (8 de agosto de 1897)** en el balneario de Santa Águeda, por el anarquista italiano Michele Angiolillo`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Por qué el anarquismo predominó sobre el socialismo en España a finales del siglo XIX? ¿Qué fue la FTRE?*

**Razón del predominio anarquista:**
- La I Internacional llegó a España de la mano de Fanelli (enviado de Bakunin, anarquista), no de Marx
- El contexto español (jornaleros sin tierra en Andalucía, anarquismo rural) era más receptivo al anarquismo que al socialismo marxista (más urbano e industrial)

**FTRE (1881):**
- Heredera de la AIT ilegalizada
- Principios: acción directa + antipoliticismo + colectivismo + federalismo
- Bases geográficas: Andalucía (jornaleros) y Cataluña (obreros industriales)
- Diferencia clave con el socialismo: RECHAZO a participar en elecciones

**Terrorismo de la década de 1890:** Liceo (1893) + Corpus Christi (1896) + asesinato de Cánovas (1897)`,
    practice_prompt: 'Explica el origen y los principios del anarquismo en España. ¿Qué fue la FTRE y cuáles eran sus características? ¿En qué consistió la "propaganda por el hecho" y cuáles fueron sus principales atentados?',
    alert_markdown: '⚠️ El **asesinato de Cánovas del Castillo** (1897) por un anarquista italiano es un dato PAU muy específico. Junto con el asesinato de Canalejas (1912) por otro anarquista, son los dos grandes asesinatos políticos del anarquismo español de la Restauración.',
  },

  // ─── MOVIMIENTO OBRERO: SOCIALISMO ───────────────────────────────────────────

  {
    sort_order: 75,
    block_key: 'La Restauración',
    block_slug: 'restauracion',
    title: 'El Socialismo en España: El PSOE y la UGT (1879–1888)',
    concept_markdown: `## El Socialismo Marxista en España: PSOE y UGT

### El Fundador: Pablo Iglesias Posse

El socialismo marxista llegó a España de la mano de **Paul Lafargue** (yerno de Karl Marx), pero su verdadero organizador y fundador fue el tipógrafo madrileño **Pablo Iglesias Posse**.

### El PSOE (2 de mayo de 1879)

El **Partido Socialista Obrero Español (PSOE)** fue fundado en Madrid el **2 de mayo de 1879** en la trastienda de una taberna de la calle del Desengaño. Celebró su **I Congreso en 1888** en Barcelona.

Sus principios:
- **Lucha de clases:** El capitalismo explota al proletariado y debe ser superado
- **Conquista del poder político** por el proletariado mediante la acción parlamentaria
- **Colectivización** de los medios de producción

### La UGT (1888)

La **Unión General de Trabajadores (UGT)** fue el sindicato socialista fundado también en **1888** en Barcelona, en el mismo Congreso que el PSOE. A diferencia de los anarquistas, la UGT apostaba por la **negociación colectiva** y la **acción parlamentaria**.

Pablo Iglesias obtuvo el **primer escaño socialista** en el Congreso de los Diputados en **1910**, en coalición con los republicanos.

### Anarquismo vs. Socialismo

| | **Anarquismo (FTRE/CNT)** | **Socialismo (PSOE/UGT)** |
|---|---|---|
| Fundación | FTRE: 1881 | PSOE: 1879 / UGT: 1888 |
| Referente | Bakunin / Kropotkin | Marx / Engels |
| Geografía | Andalucía y Cataluña | Madrid y País Vasco |
| Táctica | Acción directa, huelga general | Acción política y sindical |
| Estado | Abolición inmediata | Conquista y transformación |`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Cuándo y cómo nació el PSOE? ¿En qué se diferenciaba del anarquismo?*

**PSOE:**
- Fundación: 2 mayo 1879, Madrid, trastienda taberna calle del Desengaño
- Fundador: Pablo Iglesias Posse
- I Congreso: 1888, Barcelona (mismo que funda la UGT)
- Primer escaño en el Congreso: 1910 (en coalición con republicanos)

**UGT:**
- Sindicato socialista, 1888, Barcelona
- Diferencia clave del anarquismo: apuesta por negociación colectiva + acción parlamentaria

**La gran diferencia con el anarquismo:**
- Anarquismo: rechaza el Estado y las elecciones → huelga general + acción directa
- Socialismo: usa el Estado y las elecciones para conquistar el poder y transformar la sociedad`,
    practice_prompt: 'Describe el nacimiento del PSOE y la UGT. ¿Quién fue Pablo Iglesias? ¿En qué se diferenciaban el socialismo y el anarquismo en sus principios, táctica y base geográfica?',
    alert_markdown: null,
  },

  // ─── PARTE 39: CRISIS DEL 98 ──────────────────────────────────────────────────

  {
    sort_order: 76,
    block_key: 'La Restauración',
    block_slug: 'restauracion',
    title: 'La Guerra de Cuba y Filipinas (1895–1898)',
    concept_markdown: `## Las Guerras Coloniales: Cuba y Filipinas (1895–1898)

### Antecedentes: El Imperio Colonial en 1895

Tras la independencia de la América continental (1824), España conservaba **Cuba, Puerto Rico, Filipinas** y las islas Marianas, Carolinas y Palaos. Cuba era la "joya de la corona": su producción azucarera y tabacalera representaba una parte esencial del comercio exterior español.

### La Guerra de Cuba (1895–1898)

La independencia cubana ya había tenido un primer intento en la **Guerra de los Diez Años (1868–1878)**, concluida con la **Paz de Zanjón (1878)** que prometió reformas que nunca llegaron.

La insurrección definitiva estalló el **24 de febrero de 1895** con el **Grito de Baire**, liderada por el **Partido Revolucionario Cubano** fundado por **José Martí** (quien murió en combate en Dos Ríos el 19 de mayo de 1895). Los principales jefes militares cubanos eran **Máximo Gómez** y **Antonio Maceo**.

España envió al General **Valeriano Weyler** (1896), quien aplicó la brutal **política de reconcentración**: concentrar a la población campesina en campos vigilados para aislar a los insurrectos. Murieron decenas de miles de civiles cubanos por hambre y enfermedades, generando una ola de indignación internacional alimentada por la **prensa amarilla** (sensacionalista) de Hearst y Pulitzer en EE.UU.

El **15 de febrero de 1898**, el acorazado estadounidense **USS Maine** explotó en el puerto de La Habana (260 muertos). La prensa norteamericana culpó a España sin pruebas. El **25 de abril de 1898**, Estados Unidos declaró la guerra a España.

### La Guerra de Filipinas (1896–1898)

Casi simultáneamente estalló en Filipinas la insurrección del **Katipunan** (Andrés Bonifacio y luego **Emilio Aguinaldo**). España firmó el **Pacto de Biak-na-Bato (1897)** por el que los insurgentes se exiliaban a cambio de dinero, pero el acuerdo fue papel mojado. El Comodoro **George Dewey** destruyó la flota española del Pacífico en la batalla de **Cavite (1 de mayo de 1898)** sin perder un solo hombre.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Cuáles fueron las causas del conflicto entre España y Estados Unidos en 1898? Describe las guerras de Cuba y Filipinas.*

**Cuba:**
- Antecedentes: Guerra de los Diez Años (1868-1878) → Paz de Zanjón → reformas incumplidas
- Inicio: Grito de Baire (24 febrero 1895) → Martí + Gómez + Maceo
- España: Weyler + reconcentración → escándalo internacional
- Detonante americano: USS Maine explotado en La Habana (15 febrero 1898) → prensa amarilla → declaración de guerra (25 abril)

**Filipinas:**
- Katipunan → Aguinaldo → Pacto de Biak-na-Bato (1897, no respetado)
- Cavite (1 mayo 1898): Dewey destruye flota española del Pacífico sin bajas americanas

**Clave:** El USS Maine fue el pretexto, no la causa. EE.UU. llevaba años queriendo controlar Cuba por sus intereses comerciales y estratégicos.`,
    practice_prompt: 'Explica las causas de la guerra de Cuba y Filipinas (1895-1898). ¿Qué fue el Grito de Baire y qué papel tuvo José Martí? ¿Qué fue la "política de reconcentración" de Weyler y cuáles fueron sus consecuencias internacionales?',
    alert_markdown: '⚠️ El **USS Maine** explotó probablemente por causas accidentales internas (incendio en el pañol de municiones), NO por un ataque español. Pero la prensa americana usó el incidente para justificar la guerra. Es uno de los primeros ejemplos de posverdad en la historia del periodismo.',
  },

  {
    sort_order: 77,
    block_key: 'La Restauración',
    block_slug: 'restauracion',
    title: 'El Desastre de 1898: Santiago de Cuba y el Tratado de París',
    concept_markdown: `## El Desastre Naval y el Tratado de París (1898)

### El Desastre Naval: Santiago de Cuba (3 de julio de 1898)

La escuadra española del Atlántico, al mando del almirante **Pascual Cervera**, quedó bloqueada en el puerto de **Santiago de Cuba** por la armada norteamericana. Ante la inminente caída de la ciudad por tierra, Cervera recibió la orden de salir al mar y forzar el bloqueo.

La escuadra española fue destruida completamente por la armada norteamericana el **3 de julio de 1898**. España no tenía ya nada con qué negociar.

### El Tratado de París (10 de diciembre de 1898)

Firmado en París el **10 de diciembre de 1898** entre España y Estados Unidos. Las colonias —Cuba, Puerto Rico, Filipinas— no enviaron representantes ni participaron en las negociaciones.

Sus cláusulas:
- **Cuba** obtenía la independencia formal, pero quedaba bajo tutela estadounidense (Enmienda Platt, 1901): EE.UU. podía intervenir militarmente en Cuba cuando lo considerase necesario
- **Puerto Rico** y la isla de **Guam** pasaban a soberanía estadounidense
- **Filipinas** eran cedidas a EE.UU. a cambio de **20 millones de dólares**

Poco después, en **1899**, España vendió a **Alemania** las Islas Marianas (excepto Guam), las Carolinas y las Palaos por 25 millones de pesetas (Tratado de Berlín). El Imperio colonial español había desaparecido por completo.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué estableció el Tratado de París de 1898? ¿Cuáles fueron las consecuencias para España?*

**Santiago de Cuba (3 julio 1898):** destrucción total de la escuadra de Cervera → España sin argumentos militares

**Tratado de París (10 diciembre 1898):**
- Cuba: independencia formal + Enmienda Platt (tutela americana)
- Puerto Rico + Guam: soberanía de EE.UU.
- Filipinas: cedidas a EE.UU. por 20 millones de dólares

**Consecuencias para España:**
1. Pérdida de los últimos restos del Imperio colonial
2. Crisis de conciencia nacional profunda → Regeneracionismo
3. Pérdida de ingresos coloniales → crisis económica
4. Desprestigio del sistema político → aceleración de los movimientos de oposición

**1899 (dato secundario pero importante):** España vende Marianas, Carolinas y Palaos a Alemania por 25 millones de pesetas. El Imperio desaparece completamente.`,
    practice_prompt: 'Describe el desastre naval de Santiago de Cuba (3 de julio de 1898) y las cláusulas del Tratado de París (10 de diciembre de 1898). ¿Qué fue la Enmienda Platt? ¿Cuáles fueron las consecuencias para España?',
    alert_markdown: '⚠️ Fecha exacta obligatoria: **Tratado de París = 10 de diciembre de 1898**. España perdió Cuba (que queda bajo tutela de EE.UU., no plenamente independiente), Puerto Rico y Filipinas. No confundir con otros Tratados de París (1763, 1783, 1856, 1919…).',
  },

  // ─── REGENERACIONISMO ────────────────────────────────────────────────────────

  {
    sort_order: 78,
    block_key: 'La Restauración',
    block_slug: 'restauracion',
    title: 'El Regeneracionismo y la Crisis de Conciencia Nacional del 98',
    concept_markdown: `## El Regeneracionismo: La Respuesta Intelectual al Desastre del 98

La derrota de 1898 provocó en España una **profunda crisis de conciencia nacional**. El movimiento intelectual y político que intentó diagnosticar y remediar los males del país se conoce como **Regeneracionismo**.

### Joaquín Costa: La Figura Central

**Joaquín Costa** (1846–1911) fue el regeneracionista más emblemático. En su obra *"Oligarquía y caciquismo"* (1901) analizó la corrupción del sistema de la Restauración y propuso una política de **"escuela y despensa"**: modernización educativa y económica frente a los discursos vacíos del caciquismo. Su fórmula más célebre: *"doble llave al sepulcro del Cid"*: dejar atrás el pasado imperial y mirar hacia Europa.

### La Generación del 98 (Literaria)

Aunque no eran regeneracionistas en sentido estricto, los escritores de la **Generación del 98** compartían la misma angustia nacional: **Unamuno, Azorín, Baroja, Valle-Inclán, Machado y Maeztu** reflexionaron sobre la identidad española y el "problema de España" desde la literatura y el ensayo.

### El Regeneracionismo Político

Influyó en los gobiernos de **Francisco Silvela** (1899–1900) y posteriormente en **Antonio Maura** y **José Canalejas**, que intentaron reformar el sistema desde dentro con la llamada *"revolución desde arriba"*.

### Las Consecuencias del 98

El Desastre de 1898 aceleró:
- El crecimiento de los **nacionalismos periféricos** (catalán y vasco) al deslegitimar al Estado liberal de la Restauración
- El crecimiento del **movimiento obrero** (PSOE y anarcosindicalismo)
- El debate sobre la **identidad española** que marcaría la política del siglo XX`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fue el Regeneracionismo? ¿Quién fue Joaquín Costa y cuáles fueron sus propuestas?*

**Definición:** El Regeneracionismo fue un movimiento intelectual y político que, tras el Desastre del 98, intentó diagnosticar los males de España y proponer soluciones modernizadoras.

**Joaquín Costa:**
- Obra clave: *"Oligarquía y caciquismo"* (1901)
- Diagnóstico: el caciquismo y la oligarquía han podrido el sistema político
- Propuesta: "escuela y despensa" = educación + modernización económica
- Frase más famosa: "doble llave al sepulcro del Cid" = olvidar el pasado imperial, mirar a Europa

**Generación del 98 (literaria):** Unamuno, Azorín, Baroja, Valle-Inclán, Machado → misma angustia, diferente medio de expresión (literatura, no política)

**Regeneracionismo político:** Silvela → Maura → Canalejas → "revolución desde arriba"`,
    practice_prompt: 'Explica en qué consistió el Regeneracionismo. ¿Quién fue Joaquín Costa y cuáles eran sus propuestas? ¿En qué se diferenciaban el regeneracionismo político y la Generación del 98?',
    alert_markdown: null,
  },

  // ─── SEXENIO DEMOCRÁTICO (comprimido) ────────────────────────────────────────

  {
    sort_order: 79,
    block_key: 'La Restauración',
    block_slug: 'restauracion',
    title: 'El Sexenio Democrático (1868–1874): La Gloriosa y sus Fracasos',
    concept_markdown: `## El Sexenio Democrático (1868–1874): El Antecedente de la Restauración

El Sexenio Democrático fue el período entre el derrocamiento de Isabel II y la Restauración borbónica. Fue un experimento político que fracasó en todos sus intentos de estabilizar España bajo un régimen democrático.

### La Revolución "La Gloriosa" (septiembre de 1868)

El **Pacto de Ostende (1866)** entre progresistas, demócratas y la Unión Liberal desembocó en el pronunciamiento naval del almirante **Topete** en Cádiz (18 de septiembre de 1868), apoyado por los generales Prim y Serrano. La batalla de **Alcolea** derrotó a las tropas reales y **Isabel II se exilió definitivamente a Francia**.

Las Cortes Constituyentes (elegidas por sufragio universal masculino por primera vez) aprobaron la **Constitución de 1869**: la más democrática hasta entonces, con soberanía nacional, sufragio universal masculino, amplia declaración de derechos y monarquía constitucional.

### Los Fracasos del Sexenio

El Sexenio fue incapaz de estabilizarse a pesar de las reformas, enfrentándose a cuatro problemas simultáneos:
- **La I República (1873–1874):** El rey Amadeo I (de la Casa de Saboya), incapaz de gobernar, abdicó. Las Cortes proclamaron la I República, que pasó por cuatro presidentes en once meses (Figueras, Pi i Margall, Salmerón, Castelar) y un fallido intento de república federal
- **La Tercera Guerra Carlista (1872–1876):** Carlos VII invadió el norte
- **La guerra de los Diez Años en Cuba (1868–1878)**
- **El cantón de Cartagena (1873):** insurrección independentista local del federalismo radical

El **Pronunciamiento de Pavía** (3 de enero de 1874) disolvió por la fuerza las Cortes. El General Serrano gobernó dictatorialmente hasta el pronunciamiento de Martínez Campos en Sagunto (29 de diciembre de 1874), que proclamó a Alfonso XII rey de España.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fue el Sexenio Democrático? ¿Por qué fracasó?*

**Cronología del Sexenio:**
- Sep 1868: "La Gloriosa" → Isabel II al exilio
- 1869: Constitución democrática (sufragio universal masculino)
- 1871-1873: Amadeo I (Saboya) → abdica
- Feb 1873: I República → 4 presidentes en 11 meses
- Ene 1874: Golpe de Pavía → fin de la República
- Dic 1874: Pronunciamiento de Sagunto → Alfonso XII → Restauración

**Causas del fracaso:**
1. Dificultad de mantener el orden con tantos frentes: carlistas + Cuba + cantones
2. La I República: fragmentación federal extrema → ingobernable
3. El ejército no respetó el poder civil
4. El pueblo español era mayoritariamente rural y conservador → sin base social para la democracia radical`,
    practice_prompt: 'Describe el Sexenio Democrático (1868-1874). ¿Qué fue "La Gloriosa"? ¿Por qué fracasó la I República? ¿Cómo se produjo la Restauración borbónica de 1874?',
    alert_markdown: '⚠️ La **I República española (1873-1874)** duró solo 11 meses y tuvo 4 presidentes. No confundir con la **II República (1931-1939)**. La I fracasó por el cantonal ismo (insurrección de cantones federales) y las guerras carlista y cubana.',
  },
]

const BATCH_SIZE = 5

async function main() {
  console.log(`Insertando ${cards.length} tarjetas del Bloque 8 (La Restauración)…`)

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
    console.log(`\n✅ Bloque 8 insertado. Total filas historia_espana en tabla: ${count}`)
  }
}

main()
