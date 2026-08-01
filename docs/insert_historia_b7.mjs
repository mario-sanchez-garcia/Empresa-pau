// Uso: node --env-file=.env.local docs/insert_historia_b7.mjs
// Bloque 7 — Crisis del Antiguo Régimen y Liberalismo: flashcards 53-70
// Partes 24-32 de los apuntes de Diego

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const SUBJECT = 'historia_espana'

const cards = [

  // ─── PARTE 24: CARLOS IV, GODOY, REVOLUCIÓN FRANCESA ─────────────────────────

  {
    sort_order: 53,
    block_key: 'Crisis del Antiguo Régimen y Liberalismo',
    block_slug: 'crisis-antiguo-regimen-liberalismo',
    title: 'Carlos IV, Godoy y el Impacto de la Revolución Francesa',
    concept_markdown: `## Carlos IV y Manuel Godoy: La Quiebra del Antiguo Régimen (1788–1808)

### El Pánico Ante la Revolución Francesa (1789)

La subida al trono de Carlos IV en 1788 coincidió con el estallido de la Revolución Francesa. El primer ministro **Conde de Floridablanca** ordenó el cierre hermético de las fronteras con Francia, prohibió la enseñanza del francés, impuso censura sobre la prensa y reactivó la Inquisición. Este aislamiento total se conoce como el **"Pánico de Floridablanca"**.

### Manuel Godoy: El Valido Impopular

En 1792, Carlos IV nombró primer ministro a un joven oficial de la guardia real llamado **Manuel Godoy**, cuyo rápido ascenso despertó el odio de la nobleza y del clero (que murmuraban sobre una relación con la reina María Luisa). Godoy ejerció un valimiento absoluto durante casi dos décadas.

**La Guerra de la Convención (1793):** Tras la ejecución del rey Luis XVI en la guillotina, España declaró la guerra a la República Francesa. España fue derrotada y firmó la **Paz de Basilea (1795)**, cediendo la parte española de Santo Domingo.

### La Sumisión a Napoleón

Arruinada financieramente, España regresó a la alianza con Francia firmando los **Tratados de San Ildefonso (1796 y 1800)**, convirtiéndose en un estado satélite de Napoleón:

- **Batalla de Trafalgar (1805):** La armada franco-española fue destruida por la flota británica del almirante Nelson. España perdió definitivamente su poder naval, dejando las colonias americanas incomunicadas
- **Tratado de Fontainebleau (1807):** Napoleón impuso a Godoy el ingreso y libre tránsito de sus ejércitos por España con el pretexto de invadir Portugal. Las tropas francesas ocuparon estratégicamente ciudades clave (Barcelona, Vitoria, Madrid) sin intención de avanzar hacia Portugal`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Cómo afectó la Revolución Francesa al reinado de Carlos IV? ¿Qué papel tuvo Godoy?*

**Estructura:**
1. El "Pánico de Floridablanca" (1789): aislamiento total de las ideas revolucionarias
2. Godoy: valido impopular → Guerra de la Convención (1793) → Paz de Basilea (1795)
3. Alianza con Francia: Tratados de San Ildefonso → España, satélite de Napoleón
4. Trafalgar (1805): destrucción del poder naval → colonias incomunicadas
5. Fontainebleau (1807): tropas francesas entran en España con pretexto de Portugal → trampa

**Clave:** La Batalla de Trafalgar (1805) es el momento en que España deja de ser una potencia naval para siempre. Sin marina, las colonias americanas son indefendibles.`,
    practice_prompt: 'Explica cómo afectó el impacto de la Revolución Francesa al reinado de Carlos IV. ¿Qué papel tuvo Manuel Godoy y qué consecuencias tuvieron los Tratados de San Ildefonso y la Batalla de Trafalgar?',
    alert_markdown: null,
  },

  {
    sort_order: 54,
    block_key: 'Crisis del Antiguo Régimen y Liberalismo',
    block_slug: 'crisis-antiguo-regimen-liberalismo',
    title: 'El Motín de Aranjuez y las Abdicaciones de Bayona (1808)',
    concept_markdown: `## Las Abdicaciones de Bayona: El Inicio de la Crisis

### El Motín de Aranjuez (19 de marzo de 1808)

El descontento popular y el odio de los privilegiados hacia Godoy se aglutinó en torno al príncipe heredero **Fernando**. El bando fernandino organizó el **Motín de Aranjuez**: un levantamiento popular que asaltó el palacio de Godoy. Carlos IV, aterrorizado, se vio obligado a:
1. Destituir a Godoy
2. **Abdicar la Corona en su hijo Fernando VII**

Fernando VII entró en Madrid como rey aclamado por el pueblo, que lo llamó "El Deseado".

### Las Abdicaciones de Bayona (mayo de 1808)

Napoleón, aprovechando la fractura total y la debilidad de la familia real española, convocó a padre e hijo en la ciudad francesa de **Bayona** con el pretexto de mediar en el conflicto familiar. Allí ocurrió lo siguiente:

1. Napoleón presionó psicológicamente a Fernando VII para que devolviera la corona a su padre
2. Fernando VII devolvió la corona a Carlos IV
3. Carlos IV se la entregó directamente a **Napoleón Bonaparte**
4. Napoleón nombró a su hermano **José I Bonaparte** (apodado popularmente "José Botella" o "Pepe Botella") como nuevo Rey de España

### El Estatuto de Bayona

Napoleón promulgó el **Estatuto de Bayona** (1808): una carta otorgada reformista de carácter moderado que abolía los señoríos, suprimía la Inquisición y otorgaba libertades civiles. Fue apoyado por los **afrancesados** (españoles que colaboraron con José I considerándolo una modernización necesaria). La mayoría del pueblo lo rechazó como una traición a la patria.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fueron las Abdicaciones de Bayona? ¿Qué consecuencias políticas tuvieron?*

**Cronología:**
1. Motín de Aranjuez (19 marzo 1808): Fernando VII sube al trono
2. Bayona (mayo 1808): Fernando devuelve la corona a Carlos IV → Carlos a Napoleón
3. José I Bonaparte = nuevo rey de España
4. Estatuto de Bayona: carta otorgada reformista → solo aceptada por los afrancesados

**Consecuencias:**
- Vacío de poder en España → las Juntas asumen la soberanía
- Guerra de la Independencia (2 mayo 1808 - 1814)
- Las Cortes de Cádiz legislan en nombre del rey cautivo Fernando VII

**Los afrancesados:** Españoles ilustrados que apoyaron a José I. No eran traidores per se, creían que José I traería la modernización que España necesitaba (como Napoleón en Francia).`,
    practice_prompt: 'Describe el Motín de Aranjuez y las Abdicaciones de Bayona (1808). ¿Quiénes fueron los "afrancesados" y por qué apoyaron a José I Bonaparte? ¿Por qué las abdicaciones supusieron un vacío de poder en España?',
    alert_markdown: '⚠️ Las Abdicaciones de Bayona son el inicio JURÍDICO de la crisis: el trono queda vacío → las Juntas asumen la soberanía → las Cortes de Cádiz pueden legislar → la Constitución de 1812 es posible. Sin Bayona, no hay Cádiz.',
  },

  // ─── PARTE 25: GUERRA DE INDEPENDENCIA ───────────────────────────────────────

  {
    sort_order: 55,
    block_key: 'Crisis del Antiguo Régimen y Liberalismo',
    block_slug: 'crisis-antiguo-regimen-liberalismo',
    title: 'El 2 de Mayo de 1808 y la Organización de la Resistencia',
    concept_markdown: `## El Levantamiento del 2 de Mayo y la Organización de la Resistencia

### El 2 de Mayo de 1808 en Madrid

Ante los rumores de que los franceses sacaban del Palacio Real de Madrid a los últimos miembros de la familia real, el pueblo de Madrid se alzó en armas de forma **espontánea** el **2 de mayo de 1808**. Los militares españoles **Daoíz y Velarde** se unieron a la rebelión popular defendiendo el Parque de Artillería de Monteleón.

El general francés **Murat** reprimió el levantamiento con crueldad extrema, ordenando fusilamientos masivos en la madrugada del **3 de mayo** (inmortalizado por Goya en su famoso cuadro *"Los fusilamientos del 3 de mayo de 1808"*).

### La Organización de la Resistencia: Las Juntas

La sublevación se extendió por todo el territorio. Ante el vacío de poder legítimo creado por las Abdicaciones de Bayona, los ciudadanos crearon de forma espontánea **Juntas Locales y Provinciales** para organizar la resistencia militar. Estas juntas locales se coordinaron bajo la **Junta Suprema Central**, presidida inicialmente por el Conde de Floridablanca, que asumió la soberanía nacional en nombre del rey cautivo **Fernando VII**.

La Junta Suprema Central tuvo que refugiarse en Cádiz, la única ciudad importante que no podía ser conquistada por los franceses al estar defendida por la flota británica. Desde Cádiz convocó las Cortes que promulgarían la Constitución de 1812.

### La Significación Histórica

El 2 de mayo representó un hecho político radicalmente nuevo: fue el **pueblo** (no el rey, no el ejército, no la Iglesia) quien se sublevó de forma espontánea contra un invasor extranjero, asumiendo la soberanía ante el vacío de poder real. Esto es el germen práctico del concepto de **soberanía nacional** que luego consagró la Constitución de 1812.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué significado histórico tuvo el levantamiento del 2 de mayo de 1808?*

**Respuesta modelo:**
1. Hecho: pueblo de Madrid vs. ejército francés de Murat → Daoíz y Velarde + artillería de Monteleón
2. Represión: fusilamientos del 3 de mayo → Goya los inmortaliza
3. Extensión: toda España se levanta → Juntas Locales → Junta Suprema Central
4. Significado profundo: ES EL PUEBLO quien asume la soberanía ante el vacío del rey → principio de soberanía nacional en la práctica
5. Cádiz: refugio de la Junta → convocatoria de las Cortes de Cádiz

**Daoíz y Velarde:** militares españoles que defendieron el Parque de Artillería de Monteleón. Daoíz murió en el combate. Son los héroes simbólicos del 2 de mayo.`,
    practice_prompt: 'Describe el levantamiento del 2 de mayo de 1808. ¿Qué fue la Junta Suprema Central y cómo se organizó la resistencia ante el vacío de poder creado por las Abdicaciones de Bayona?',
    alert_markdown: null,
  },

  {
    sort_order: 56,
    block_key: 'Crisis del Antiguo Régimen y Liberalismo',
    block_slug: 'crisis-antiguo-regimen-liberalismo',
    title: 'Las Fases Militares de la Guerra de la Independencia (1808–1814)',
    concept_markdown: `## Las Tres Fases de la Guerra de la Independencia

### Primera Fase (Mayo–Noviembre 1808): Éxito de la Resistencia

Las tropas francesas se vieron sorprendidas por la resistencia española. Se produjeron los heroicos **sitios de Zaragoza** (defendida por el General Palafox) y Gerona.

El gran hito histórico fue la **Batalla de Bailén (julio de 1808)**, donde un improvisado ejército español comandado por el **General Castaños** derrotó por primera vez en campo abierto a un cuerpo de ejército imperial de Napoleón (comandado por el General Dupont). **Fue la primera derrota de los ejércitos napoleónicos en Europa.** José I tuvo que huir de Madrid.

### Segunda Fase (1808–1812): Hegemonía de Napoleón

Enfurecido por la derrota de Bailén, el propio **Napoleón** entró en España al frente de la *Grande Armée* (250.000 soldados veteranos). Destruyó la resistencia regular española, tomó Madrid y restableció a su hermano en el trono. La Junta Suprema Central tuvo que refugiarse en Cádiz.

Ante la imposibilidad de resistir al ejército francés en campo abierto, el pueblo adoptó la táctica de la **guerrilla**: pequeños grupos de combatientes civiles que realizaban ataques sorpresa rápidos contra las líneas de suministro francesas.

### Tercera Fase (1812–1814): La Ofensiva Aliada y la Victoria

Napoleón retiró miles de soldados de España para emprender su catastrófica campaña en **Rusia (1812)**. La resistencia española coordinó sus fuerzas con el ejército británico y portugués del **Duque de Wellington**. Las fuerzas aliadas infligieron derrotas decisivas a los franceses en **Arapiles (1812)**, Vitoria y San Marcial (1813).

Napoleón firmó el **Tratado de Valençay (diciembre de 1813)**, reconociendo el fin de la guerra y devolviendo la corona de España a **Fernando VII**.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *Describe las tres fases militares de la Guerra de la Independencia. ¿Por qué la Batalla de Bailén fue tan importante?*

**Línea del tiempo:**
- Mayo 1808: Levantamiento popular → inicio de la guerra
- Julio 1808: **Bailén** → primera derrota napoleónica → José I huye de Madrid
- Noviembre 1808: Napoleón entra con la *Grande Armée* → destruye la resistencia regular
- 1808-1812: guerra de guerrillas → desgaste francés
- 1812: Napoleón retira tropas para Rusia → ofensiva aliada → Arapiles
- 1813: Vitoria y San Marcial → derrota definitiva
- Diciembre 1813: Tratado de Valençay → Fernando VII libre

**Importancia de Bailén:** Primera derrota de los ejércitos napoleónicos en Europa → destruye el mito de invencibilidad de Napoleón → inspira resistencias en toda Europa.`,
    practice_prompt: 'Describe las tres fases militares de la Guerra de la Independencia (1808-1814). ¿Qué importancia tuvo la Batalla de Bailén? ¿Por qué la tercera fase fue decisiva para la victoria aliada?',
    alert_markdown: '⚠️ **Bailén (1808)** = primera derrota de un ejército napoleónico en Europa. Este dato es fundamental. No es solo una batalla española — es el primer crack en el mito de invencibilidad de Napoleón.',
  },

  {
    sort_order: 57,
    block_key: 'Crisis del Antiguo Régimen y Liberalismo',
    block_slug: 'crisis-antiguo-regimen-liberalismo',
    title: 'La Guerra de Guerrillas: Táctica, Líderes y el Papel de Wellington',
    concept_markdown: `## La Guerrilla: La Táctica que Derrotó a Napoleón

### ¿Qué era la Guerrilla?

La **guerra de guerrillas** (del español *"guerrilla"* = pequeña guerra) fue la respuesta táctica del pueblo español ante la imposibilidad de enfrentar en campo abierto a los soldados veteranos de Napoleón. El concepto mismo entró en el vocabulario militar universal a partir de la Guerra de la Independencia española.

Consistía en grupos pequeños de **combatientes civiles locales** que:
- Atacaban las líneas de suministro y comunicación francesas
- Tendían emboscadas en zonas de terreno conocido
- Desaparecían en la población civil o en el monte antes de que el ejército regular pudiese reaccionar
- Ejecutaban a los colaboradores y aislaban a las guarniciones francesas del territorio

### Los Grandes Guerrilleros

- **Juan Martín Díez "El Empecinado"** (Castilla y Aragón): el más famoso y popular
- **Francisco Espoz y Mina** (Navarra): organizó un Estado paralelo anti-napoleónico en la montaña navarra con impuestos propios, justicia y reclutamiento
- **El Cura Merino** (Burgos): sacerdote convertido en guerrillero implacable
- **El Empecinado** volvería a ser ejecutado en la Década Ominosa por Fernando VII

### Wellington y la Estrategia Aliada

El **Duque de Wellington** comandó el ejército anglo-portugués que actuó como el componente de guerra convencional de la resistencia. Wellington comprendió que debía combinar la guerra regular con las guerrillas: mientras su ejército resistía en las líneas defensivas (las "Líneas de Torres Vedras" en Portugal), las guerrillas desgastaban a los franceses en el interior.

La clave del éxito fue que España era el **"segundo frente"** que agotó a Napoleón: cuando necesitó sus mejores tropas para Rusia (1812), el frente español colapsó.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fue la guerra de guerrillas y qué papel tuvo en el resultado de la Guerra de la Independencia?*

**Definición:** guerrilla = pequeña guerra irregular por civiles → hostigamiento y desgaste del ejército francés sin enfrentamiento directo

**Función táctica:**
1. Cortar las líneas de suministro francesas
2. Aislar guarniciones y ciudades francesas del territorio circundante
3. Impedir que los franceses "pacificasen" el territorio

**Guerrilleros clave:** El Empecinado + Espoz y Mina + El Cura Merino

**Papel de Wellington:** guerra convencional desde Portugal + coordinación con guerrillas → combinación que el ejército napoleónico no pudo resolver

**Conclusión:** La guerrilla no ganó la guerra sola, pero la hizo imposible de ganar para Napoleón. Spain fue su "úlcera española" (así la llamó él mismo).`,
    practice_prompt: 'Explica en qué consistió la guerra de guerrillas durante la Guerra de la Independencia. ¿Quiénes fueron sus principales líderes? ¿Qué papel tuvo el Duque de Wellington y cómo combinaron ambas estrategias?',
    alert_markdown: null,
  },

  // ─── PARTE 26: CORTES DE CÁDIZ Y CONSTITUCIÓN DE 1812 ────────────────────────

  {
    sort_order: 58,
    block_key: 'Crisis del Antiguo Régimen y Liberalismo',
    block_slug: 'crisis-antiguo-regimen-liberalismo',
    title: 'Las Cortes de Cádiz: Composición, Corrientes y Obra Legislativa',
    concept_markdown: `## Las Cortes de Cádiz: La Revolución Liberal (1810–1814)

Paralelamente a la guerra bélica, Cádiz fue el escenario de una auténtica revolución política liberal que destruyó jurídicamente los fundamentos del Antiguo Régimen en España.

### La Convocatoria y Composición

La **Junta Suprema Central** se disolvió en 1810 dando paso a un **Consejo de Regencia**, que convocó las **Cortes Generales y Extraordinarias en Cádiz**. A diferencia de las cortes tradicionales del Antiguo Régimen (divididas por estamentos con voto corporativo), las Cortes de Cádiz se organizaron como una **Asamblea única** donde cada diputado tenía un voto individual, triunfando el principio de soberanía nacional.

La composición social reflejaba la burguesía ilustrada: clérigos, abogados, funcionarios, militares y catedráticos. Apenas había representación popular.

### Las Tres Corrientes Políticas

- **Liberales:** Defensores de la soberanía nacional, división de poderes y una constitución que liquidara el absolutismo. Fueron el bando mayoritario y triunfante
- **Absolutistas ("Serviles"):** Partidarios de mantener el poder absoluto del rey y las viejas estructuras feudales y los privilegios de los estamentos
- **Jovellanistas:** Centristas que defendían una soberanía compartida entre el Rey y las Cortes tradicionales

### La Obra Legislativa (Más Allá de la Constitución)

Las Cortes aprobaron decretos que destruían las estructuras económicas del feudalismo:
- **Abolición de los Señoríos Jurisdiccionales (1811):** Los nobles perdieron la potestad de administrar justicia y cobrar tasas en sus tierras
- **Supresión del Tribunal de la Inquisición (1813)**
- **Libertad de Contratación y Comercio:** Abolición de los gremios medievales
- Primeros decretos de desamortización de tierras comunales e iglesia`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Cuál fue la composición de las Cortes de Cádiz y cuáles eran sus principales corrientes políticas?*

**Tres diferencias clave con las Cortes del Antiguo Régimen:**
1. **Unicameral** (una sola cámara, no tres estamentos)
2. **Voto individual** (no voto corporativo estamental)
3. **Soberanía nacional** (no soberanía real)

**Las tres corrientes:**
- Liberales (mayoría) → quieren constitución + fin del absolutismo
- Absolutistas/serviles (minoría) → quieren restaurar el Antiguo Régimen
- Jovellanistas/centristas → quieren monarquía moderada reformada

**Obra legislativa (fuera de la Constitución):**
1811: abolición señoríos jurisdiccionales
1813: supresión Inquisición
Libertad de contratación + abolición gremios`,
    practice_prompt: 'Describe la composición y las principales corrientes políticas de las Cortes de Cádiz. ¿En qué se diferenciaban de las cortes estamentales del Antiguo Régimen? ¿Cuál fue su obra legislativa además de la Constitución?',
    alert_markdown: null,
  },

  {
    sort_order: 59,
    block_key: 'Crisis del Antiguo Régimen y Liberalismo',
    block_slug: 'crisis-antiguo-regimen-liberalismo',
    title: 'La Constitución de 1812 ("La Pepa"): Principios Fundamentales',
    concept_markdown: `## La Constitución de 1812: "La Pepa"

Promulgada el **19 de marzo de 1812** (festividad de San José, de ahí el apodo popular de *"La Pepa"*), fue la primera constitución democrática de la historia de España.

### Los Principios Fundamentales (Obligatorio para PAU)

**1. Soberanía Nacional**
El poder supremo reside en la **Nación** (el conjunto de ciudadanos de ambos hemisferios, incluidos los americanos), y no en el Rey de origen divino. El rey reina pero no gobierna de forma absoluta.

**2. División de Poderes Estricta**
- **Poder Legislativo:** Reside en **las Cortes con el Rey**. Las Cortes tienen la potestad única de elaborar las leyes de forma soberana
- **Poder Ejecutivo:** Reside en el **Rey**, quien nombra a sus ministros, pero con poder de veto suspensivo solo por dos años
- **Poder Judicial:** Reside en los **Tribunales de Justicia** independientes, prohibiendo la intervención del rey o las Cortes

**3. Sufragio Universal Masculino Indirecto**
Derecho al voto para todos los hombres mayores de 25 años (no solo los que pagasen impuestos), estructurado en un complejo sistema de juntas parroquiales y provinciales.

**4. Declaración de Derechos y Libertades**
Igualdad jurídica ante la ley, inviolabilidad del domicilio, derecho de propiedad privada, **libertad de imprenta** (fin de la censura) y educación pública obligatoria.

**5. Confesionalidad del Estado**
Concesión obligada a los absolutistas: el Estado español se declaraba **estrictamente católico**, prohibiendo el ejercicio público de cualquier otra religión.

**6. Milicia Nacional**
Cuerpo de ciudadanos armados encargados de defender el orden constitucional frente a posibles golpes absolutistas.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *Describe los principios fundamentales de la Constitución de 1812. ¿Por qué fue revolucionaria para su época?*

**Los 6 principios clave:**
1. **Soberanía nacional** → el poder viene del pueblo, no del rey por derecho divino
2. **División de poderes** → legislativo (Cortes), ejecutivo (Rey), judicial (Tribunales)
3. **Sufragio universal masculino** (solo hombres, pero sin restricción de renta) → muy avanzado para 1812
4. **Derechos y libertades:** libertad de imprenta, inviolabilidad del domicilio, igualdad ante la ley
5. **Confesionalidad:** el único punto reaccionario → Estado católico
6. **Milicia Nacional:** garantía ciudadana del sistema constitucional

**¿Por qué es revolucionaria?** Porque en 1812, la mayoría de Europa sigue siendo absolutista. La única constitución comparable era la estadounidense (1787) y la francesa (1791, ya derogada). España fue pionera.`,
    practice_prompt: 'Explica los principios fundamentales de la Constitución de 1812. ¿Qué es la soberanía nacional? ¿En qué consistía la división de poderes que establecía? ¿Por qué la confesionalidad del Estado fue una concesión a los absolutistas?',
    alert_markdown: '⚠️ **La Pepa = 19 de marzo de 1812** (San José). Dato de fecha exacta obligatorio en PAU. Soberanía Nacional + División de Poderes + Sufragio Universal Masculino (indirecto) son los tres principios más importantes. La confesionalidad es el punto reaccionario.',
  },

  // ─── PARTE 27: FERNANDO VII ───────────────────────────────────────────────────

  {
    sort_order: 60,
    block_key: 'Crisis del Antiguo Régimen y Liberalismo',
    block_slug: 'crisis-antiguo-regimen-liberalismo',
    title: 'Fernando VII: El Sexenio Absolutista (1814–1820)',
    concept_markdown: `## El Sexenio Absolutista de Fernando VII (1814–1820)

### El Regreso de "El Deseado" y la Traición Liberal

Fernando VII, llamado "El Deseado" por sus admiradores populares, regresó a España en 1814 tras el Tratado de Valençay. Pronto quedó claro que no tenía ninguna intención de aceptar la Constitución de 1812.

Un grupo de 69 diputados absolutistas le entregó el **Manifiesto de los Persas** (llamado así por comenzar recordando una costumbre persa de celebrar el caos antes de restaurar el orden), un documento que le instaba a anular la obra de Cádiz y restaurar el absolutismo.

El **4 de mayo de 1814**, Fernando VII promulgó el **Decreto de Valencia**:
- Declaró nula y sin ningún valor la Constitución de 1812 y todos los decretos de las Cortes
- Restauró el absolutismo regio, la Inquisición, la Mesta y los privilegios señoriales
- Desató una feroz represión: encarcelamiento y ejecución de líderes liberales

### La Conspiración Liberal: Los Pronunciamientos

Los liberales supervivientes se vieron obligados a exiliarse a Inglaterra o integrarse en sociedades secretas (como la **Masonería**) para conspirar. El método político de los liberales fue el **pronunciamiento militar**: un oficial del ejército con simpatías liberales sublevaba a sus tropas, lanzaba un manifiesto político y esperaba que el ejército y la población se uniesen.

Entre 1814 y 1820 fracasaron múltiples intentos: **Mina (1814), Porlier (1815), Lacy (1817)**. Fernando VII los ejecutó a todos.

Hasta que en enero de 1820, uno triunfó.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fue el Sexenio Absolutista de Fernando VII (1814-1820)? ¿Qué fue el Manifiesto de los Persas?*

**Respuesta modelo:**
1. Fernando VII regresa (1814) → no acepta la Constitución
2. Manifiesto de los Persas: 69 diputados absolutistas piden la restauración del absolutismo
3. Decreto de Valencia (4 mayo 1814): nulidad de la Constitución y toda la obra de Cádiz
4. Represión: liberales encarcelados, ejecutados, exiliados
5. Los liberales responden con pronunciamientos militares (Mina, Porlier, Lacy) → todos fracasan
6. Resultado: 6 años de absolutismo feroz hasta el pronunciamiento de Riego (1820)

**Manifiesto de los Persas:** debe su nombre a la frase inicial que recordaba una costumbre persa de crear desorden antes de restaurar el orden. Es el documento más servil del reinado de Fernando VII.`,
    practice_prompt: 'Describe el Sexenio Absolutista de Fernando VII (1814-1820). ¿Qué fue el Manifiesto de los Persas y el Decreto de Valencia? ¿Cómo respondieron los liberales ante la restauración absolutista?',
    alert_markdown: null,
  },

  {
    sort_order: 61,
    block_key: 'Crisis del Antiguo Régimen y Liberalismo',
    block_slug: 'crisis-antiguo-regimen-liberalismo',
    title: 'El Trienio Liberal (1820–1823)',
    concept_markdown: `## El Trienio Liberal (1820–1823)

### El Pronunciamiento de Riego (1 de enero de 1820)

El **Teniente Coronel Rafael del Riego** se sublevó al frente de un ejército acantonado en **Las Cabezas de San Juan** (Sevilla), que estaba a punto de embarcar para sofocar las revueltas de independencia en América. El pronunciamiento se extendió por el país y obligó a Fernando VII a claudicar.

El monarca se vio forzado a jurar la Constitución de 1812, pronunciando la cínica frase: *"Marchemos francamente, y yo el primero, por la senda constitucional"*.

Se reinstauraron todas las libertades de Cádiz y la Constitución de 1812 volvió a estar vigente.

### La Inestabilidad del Trienio

El trienio fue un período de permanente inestabilidad provocada por tres frentes simultáneos:

**1. La Fractura Interna del Liberalismo:**
- **Moderados** (*"doceañistas"*): Partidarios de colaborar con el rey y reformar suavemente la constitución
- **Exaltados** (*"veinteañistas"*): Partidarios de aplicar la constitución radical y recortar drásticamente los poderes del rey

**2. La Oposición del Rey:**
Fernando VII saboteó sistemáticamente todas las leyes liberales usando su derecho de veto y conspiró secretamente con las potencias absolutistas europeas para recibir ayuda militar.

**3. La Resistencia Absolutista Rural:**
En zonas rurales de Navarra y Cataluña surgieron guerrillas absolutistas armadas (**Partidas Realistas**) que llegaron a crear la *Regencia de Urgel* (una junta absolutista rival en el norte de Cataluña).`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fue el Trienio Liberal? ¿Por qué fracasó?*

**Inicio:** Pronunciamiento de Riego en Las Cabezas de San Juan (1 enero 1820)
**Desarrollo:** Constitución de 1812 restaurada → 3 años de gobierno liberal

**Causas del fracaso:**
1. Fractura liberal: moderados vs. exaltados → inestabilidad gubernamental permanente
2. Sabotaje del rey: veto sistemático + conspiración secreta con potencias absolutistas
3. Resistencia rural absolutista: Partidas Realistas + Regencia de Urgel
4. Falta de apoyo popular: el campesinado mayoritariamente no era liberal

**Resultado:** las potencias absolutistas europeas decidieron intervenir → Cien Mil Hijos de San Luis (1823) → fin del Trienio`,
    practice_prompt: 'Explica las causas y el desarrollo del Trienio Liberal (1820-1823). ¿Qué fue el pronunciamiento de Riego? ¿Por qué fracasó el régimen liberal a pesar de restaurar la Constitución de 1812?',
    alert_markdown: null,
  },

  {
    sort_order: 62,
    block_key: 'Crisis del Antiguo Régimen y Liberalismo',
    block_slug: 'crisis-antiguo-regimen-liberalismo',
    title: 'Los Cien Mil Hijos de San Luis y la Década Ominosa (1823–1833)',
    concept_markdown: `## Los Cien Mil Hijos de San Luis y la Década Ominosa

### La Intervención de la Santa Alianza (1823)

Las potencias absolutistas europeas (Austria, Prusia, Rusia y Francia), organizadas en la **Santa Alianza**, se reunieron en el **Congreso de Verona (1822)** y decidieron intervenir militarmente en España para aplastar el régimen liberal que podía servir de ejemplo a otros pueblos europeos.

Francia envió un ejército de 100.000 soldados, conocidos popularmente como los **"Cien Mil Hijos de San Luis"** (1823), comandados por el Duque de Angulema. El régimen liberal, debilitado internamente y sin apoyo de las masas campesinas, colapsó rápidamente sin ofrecer apenas resistencia. Fernando VII fue liberado y restauró de forma implacable el absolutismo.

El **General Riego** fue capturado, juzgado y ejecutado en Madrid.

### La Década Ominosa (1823–1833): Represión y Crisis Final

Fue el período de la mayor represión política del reinado. Fernando VII ejecutó a figuras emblemáticas como **Juan Martín Díez "El Empecinado"**, **Mariana Pineda** y el general **Torrijos**.

Sin embargo, la total quiebra de la Hacienda real (sin ingresos americanos) obligó a aceptar algunas reformas económicas moderadas por parte de técnicos competentes:
- Creación del **Ministerio de Fomento**
- Primer **Presupuesto General del Estado (1828)**
- Primer **Código de Comercio**

Estas tímidas reformas enfurecieron a los absolutistas más radicales, quienes se agruparon en torno al hermano del rey, el infante **Carlos María Isidro**. En 1827 estalló en Cataluña la **Guerra de los Malcontents** (Agraviados), revuelta de absolutistas radicales contra el propio rey Fernando VII, preludio del carlismo.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fue la Década Ominosa? ¿Qué reformas económicas se introdujeron a pesar del absolutismo?*

**Estructura:**
1. Los Cien Mil Hijos de San Luis (1823): intervención francesa → fin del Trienio Liberal
2. Fernando VII restaura el absolutismo → represión (El Empecinado, Mariana Pineda, Torrijos)
3. Pero: quiebra de la Hacienda → necesidad de reformas económicas → Ministerio de Fomento, Presupuesto (1828), Código de Comercio
4. Paradoja: el absolutismo más feroz introduce las primeras reformas económicas modernas
5. Consecuencia: los absolutistas radicales se rebelan → "Guerra de los Malcontents" (1827) → anticipo del carlismo

**Dato clave:** La Década Ominosa termina en 1833 con la muerte de Fernando VII y el inicio de la Guerra Carlista.`,
    practice_prompt: 'Explica en qué consistió la intervención de los Cien Mil Hijos de San Luis (1823) y sus consecuencias para el liberalismo español. ¿Qué reformas económicas se introdujeron durante la Década Ominosa y por qué son paradójicas?',
    alert_markdown: '⚠️ **Mariana Pineda** fue ejecutada en Granada (1831) por bordar una bandera constitucional. Es el gran símbolo femenino del liberalismo español. Federico García Lorca le dedicó una obra de teatro.',
  },

  // ─── PARTE 28B: EMANCIPACIÓN AMERICANA ───────────────────────────────────────

  {
    sort_order: 63,
    block_key: 'Crisis del Antiguo Régimen y Liberalismo',
    block_slug: 'crisis-antiguo-regimen-liberalismo',
    title: 'La Emancipación de la América Española (1808–1824)',
    concept_markdown: `## La Independencia de la América Española (1808–1824)

### Causas de la Emancipación

El proceso de independencia latinoamericano fue protagonizado por los **criollos** (descendientes de españoles nacidos en América) que tenían el poder económico pero estaban excluidos de los cargos políticos coloniales, reservados a los peninsulares.

Las causas principales fueron:
- **Económicas:** El monopolio comercial español impedía a las colonias comerciar libremente con otras potencias → frustración de la burguesía criolla
- **Ideológicas:** La difusión de las ideas ilustradas y el ejemplo de la independencia de los EE.UU. (1776) y la Revolución Francesa
- **Políticas:** El vacío de poder creado por las Abdicaciones de Bayona (1808) → las juntas criollas asumen el gobierno

### Las Fases y los Libertadores

**Primera fase (1808–1815):** Las Juntas criollas se proclaman gobiernos autónomos en nombre de Fernando VII → el ejército real logra reconquistar temporalmente la mayoría de los territorios.

**Segunda fase (1816–1824):** La reconquista fracasa definitivamente. Dos grandes **libertadores** lideraron la independencia definitiva:
- **General José de San Martín** (Argentina, Chile, Perú): cruzó los Andes con su ejército y liberó Chile y el sur de Perú
- **Simón Bolívar** (Gran Colombia): liberó Venezuela, Colombia, Ecuador y el norte de Perú, soñando con crear una gran confederación latinoamericana

### El Fin del Imperio: Ayacucho (1824)

El ejército español sufrió su derrota irreversible en la **Batalla de Ayacucho (9 de diciembre de 1824)** en el Alto Perú (actual Bolivia). España perdió todo su Imperio continental americano, conservando únicamente las colonias insulares de **Cuba, Puerto Rico y Filipinas** (hasta 1898).`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Cuáles fueron las causas de la independencia de la América española? ¿Qué papel tuvieron San Martín y Bolívar?*

**Causas (tres dimensiones):**
1. **Económica:** monopolio comercial español → burguesía criolla frustrada
2. **Ideológica:** Ilustración + ejemplo EE.UU. (1776) + Revolución Francesa
3. **Política:** Bayona (1808) → vacío de poder → juntas criollas asumen el gobierno

**Los libertadores:**
- **San Martín:** Argentina (1816) → cruce de los Andes → Chile (1818) → Perú (1821)
- **Bolívar:** Venezuela → Colombia → Ecuador → Norte de Perú → Gran Colombia (sueño de unidad)

**Fin:** Ayacucho (9 diciembre 1824) = última gran batalla → independencia consolidada
España conserva Cuba + Puerto Rico + Filipinas (hasta 1898)`,
    practice_prompt: 'Explica las causas de la independencia de la América española. ¿Quiénes fueron los criollos y por qué lideraron el proceso? ¿Qué papeles jugaron San Martín y Bolívar? ¿Cuál fue la batalla definitiva?',
    alert_markdown: '⚠️ **Ayacucho (1824)** = fin definitivo del Imperio continental americano. No confundir con 1898 (pérdida de Cuba, Puerto Rico y Filipinas, las últimas colonias). Son dos fechas clave distintas del proceso de descolonización española.',
  },

  // ─── PARTE 29: CARLISMO ───────────────────────────────────────────────────────

  {
    sort_order: 64,
    block_key: 'Crisis del Antiguo Régimen y Liberalismo',
    block_slug: 'crisis-antiguo-regimen-liberalismo',
    title: 'El Problema Sucesorio y la Primera Guerra Carlista (1833–1840)',
    concept_markdown: `## La Primera Guerra Carlista (1833–1840)

### El Conflicto Sucesorio: La Pragmática Sanción

En España regía la **Ley Sálica** (introducida por Felipe V), que prohibía reinar a las mujeres. En 1830, ante el embarazo de su esposa **María Cristina de Borbón**, Fernando VII promulgó la **Pragmática Sanción** que derogaba la Ley Sálica y permitía reinar a su futura hija (la princesa **Isabel**).

Los sectores absolutistas radicales rechazaron la ley y mantuvieron su lealtad al hermano del rey, **Carlos María Isidro**. A la muerte de Fernando VII (1833), estalló la guerra civil.

### Los Dos Bandos

| **CARLISTAS** | **ISABELINOS/CRISTINOS** |
|---|---|
| "Dios, Patria, Rey y Fueros" | Monarquía constitucional liberal |
| Absolutismo + Iglesia + fueros | Centralismo + reforma |
| Campesinado rural, bajo clero, baja nobleza | Burguesía, ejército oficial, aristocracia liberal |
| País Vasco, Navarra, Maestrazgo, interior Cataluña | Ciudades, litoral, Madrid |

La reina madre **María Cristina** asumió la Regencia en nombre de su hija Isabel (3 años) y, para conseguir el apoyo militar del ejército liberal, tuvo que abrir una tímida vía de reformas.

### Desarrollo Bélico y el Convenio de Vergara (1839)

El general carlista **Tomás de Zumalacárregui** fue el gran estratega militar de la guerra: dominó el ámbito rural vasco con guerrillas pero murió durante el sitio de Bilbao (1835). Los carlistas organizaron la gran *Expedición Real* (1837), llegando a las puertas de Madrid, pero no tomaron la capital.

El sector moderado carlista (general **Rafael Maroto**) negoció la paz. El conflicto terminó con el **Convenio de Vergara (1839)** (*"Abrazo de Vergara"*) entre Maroto y el general isabelino **Baldomero Espartero**, que integraba a los oficiales carlistas en el ejército real y prometía mantener los fueros vascos.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Cuáles fueron las causas de la Primera Guerra Carlista? ¿Qué fue el Convenio de Vergara?*

**Causas:**
1. Cuestión dinástica: Pragmática Sanción (1830) → Isabel vs. Carlos María Isidro
2. Cuestión ideológica: liberalismo vs. absolutismo → la sucesión es solo el detonante
3. Cuestión social: cada bando tiene su base de apoyo diferente

**El Convenio de Vergara (1839):**
- Abrazo entre Maroto (carlista moderado) y Espartero (isabelino)
- Los oficiales carlistas se integran en el ejército isabelino
- Espartero promete recomendar el mantenimiento de los fueros vascos
- El general Cabrera (radical) rechaza el convenio → continúa en el Maestrazgo hasta 1840

**Importancia:** La promesa sobre los fueros vascos es el origen de la cuestión foral del siglo XIX.`,
    practice_prompt: 'Explica las causas de la Primera Guerra Carlista (1833-1840). ¿En qué se diferenciaban ideológicamente los carlistas de los isabelinos? ¿Qué fue el Convenio de Vergara y cuáles fueron sus consecuencias?',
    alert_markdown: '⚠️ El carlismo NO es solo un conflicto dinástico (quién debe ser rey). Es una guerra ideológica entre dos proyectos de España: el absolutismo tradicional (carlistas) vs. el liberalismo burgués (isabelinos). La sucesión es solo el detonante.',
  },

  // ─── PARTE 30: PARTIDOS DEL SIGLO XIX ────────────────────────────────────────

  {
    sort_order: 65,
    block_key: 'Crisis del Antiguo Régimen y Liberalismo',
    block_slug: 'crisis-antiguo-regimen-liberalismo',
    title: 'Los Partidos Políticos del Siglo XIX: Moderados y Progresistas',
    concept_markdown: `## El Sistema de Partidos Liberal del Siglo XIX

Durante el reinado de Isabel II se configuró el sistema parlamentario español, dominado por el ala liberal de la burguesía, dividida en dos grandes partidos que se alternaban en el poder.

### El Partido Moderado

Representaba al ala **conservadora** del liberalismo: alta burguesía financiera, terratenientes latifundistas y aristocracia. Líderes: **General Narváez** y Alejandro Mon.

Sus principios:
- **Soberanía Compartida** (Rey + Cortes): la Corona tiene amplios poderes políticos
- **Sufragio Censitario muy restringido:** solo votaban los varones con las rentas más altas (menos del 1% de la población)
- **Confesionalidad** y **centralismo** estrictos
- **Restricción de libertades** en favor del orden público

### El Partido Progresista

Representaba al ala **reformista** del liberalismo: mediana burguesía comercial, profesiones liberales, oficiales del ejército. Líderes: **Generales Espartero y Prim**, y políticos como Mendizábal y Madoz.

Sus principios:
- **Soberanía Nacional:** Las Cortes son el órgano legislativo supremo
- **Sufragio Censitario más amplio:** voto de la pequeña burguesía y clases medias
- **Derechos y libertades más amplias:** libertad de imprenta, mayor libertad religiosa
- **Autonomía Municipal** y defensa de la **Milicia Nacional**

### Las Nuevas Fuerzas Políticas (Desde 1840)

- **Unión Liberal (1854):** Partido centrista del **General O'Donnell**, entre moderados avanzados y progresistas templados
- **Partido Demócrata (1849):** Escisión radical progresista que exigía **sufragio universal masculino**, abolición de las quintas y libertad de cultos. Base social: obreros y artesanos urbanos`,
    worked_example_markup: `**Pregunta tipo PAU:** *Compara el Partido Moderado y el Partido Progresista durante el reinado de Isabel II.*

**Tabla comparativa:**

| Aspecto | **Moderados** | **Progresistas** |
|---|---|---|
| Base social | Alta burguesía + terratenientes | Mediana burguesía + profesionales |
| Soberanía | Compartida (Rey + Cortes) | Nacional (Cortes primero) |
| Sufragio | Muy restringido (<1%) | Censitario ampliado |
| Libertades | Limitadas (orden) | Más amplias (prensa, religión) |
| Municipios | Alcaldes nombrados por el rey | Alcaldes elegidos por vecinos |
| Líderes | Narváez, Mon | Espartero, Prim, Mendizábal |`,
    worked_example_markdown: `**Pregunta tipo PAU:** *Compara el Partido Moderado y el Partido Progresista durante el reinado de Isabel II.*

**Tabla comparativa:**

| Aspecto | **Moderados** | **Progresistas** |
|---|---|---|
| Base social | Alta burguesía + terratenientes | Mediana burguesía + profesionales |
| Soberanía | Compartida (Rey + Cortes) | Nacional (Cortes primero) |
| Sufragio | Muy restringido (<1%) | Censitario ampliado |
| Libertades | Limitadas (orden) | Más amplias (prensa, religión) |
| Municipios | Alcaldes nombrados por el rey | Alcaldes elegidos por vecinos |
| Líderes | Narváez, Mon | Espartero, Prim, Mendizábal |`,
    practice_prompt: 'Describe y compara el Partido Moderado y el Partido Progresista del siglo XIX. ¿Cuáles eran sus diferencias en cuanto a soberanía, sufragio y libertades? ¿Qué fue la Unión Liberal y el Partido Demócrata?',
    alert_markdown: null,
  },

  // ─── PARTE 31: REGENCIAS ──────────────────────────────────────────────────────

  {
    sort_order: 66,
    block_key: 'Crisis del Antiguo Régimen y Liberalismo',
    block_slug: 'crisis-antiguo-regimen-liberalismo',
    title: 'La Regencia de María Cristina y la Desamortización de Mendizábal (1836)',
    concept_markdown: `## La Regencia de María Cristina (1833–1840)

La reina madre **María Cristina** asumió la Regencia en nombre de su hija Isabel (3 años). Para defender el trono de su hija frente al carlismo, necesitó el apoyo del ejército liberal. Esto la obligó a abrir una progresiva vía de reformas.

### El Estatuto Real (1834) y la Crisis Progresista

El ministro moderado **Martínez de la Rosa** redactó el **Estatuto Real de 1834**: no era una constitución sino una carta otorgada (concedida por la reina) que convocaba Cortes estamentales bicamerales sin reconocer la soberanía nacional. Fue insuficiente para los progresistas.

El **Motín de los Sargentos de La Granja (1836)** — sublevación de la guarnición real que amenazó a la regente — forzó a María Cristina a restablecer la Constitución de 1812 y entregar el gobierno a los progresistas. Estos redactaron la **Constitución de 1837**, un texto de consenso que reconocía la soberanía nacional con derecho de veto de la Corona.

### La Desamortización de Mendizábal (1836)

El gran hito de la regencia fue la obra del ministro progresista **Juan Álvarez Mendizábal**: la expropiación forzosa de todos los bienes y tierras de las **órdenes religiosas** (clero regular), vendidas inmediatamente en pública subasta.

**Objetivos:**
- Obtener ingresos urgentes para sanear la deuda pública y financiar la Guerra Carlista
- Crear una masa social de compradores burgueses terratenientes que apoyasen la causa liberal

**Consecuencias:**
- Consolidó el **latifundismo agrario:** las tierras fueron compradas por la alta burguesía y nobles, empeorando la situación de los campesinos
- Destrucción masiva del **patrimonio artístico** de los monasterios (bibliotecas, frescos, retablos)
- La Iglesia se convirtió en enemiga permanente del liberalismo español`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fue la Desamortización de Mendizábal? ¿Cuáles fueron sus objetivos y consecuencias?*

**Respuesta modelo:**
1. Definición: expropiación forzosa de tierras del clero regular → venta en subasta pública (1836)
2. Objetivos: dinero para la guerra carlista + crear burguesía terrateniente liberal
3. Consecuencias NEGATIVAS:
   - No llegó al campesinado (las compró la alta burguesía y nobles) → latifundismo empeorado
   - Destrucción masiva del patrimonio artístico de los monasterios
   - Iglesia = enemiga permanente del liberalismo español
4. Consecuencias POSITIVAS:
   - Saneó temporalmente la Hacienda
   - Creó una clase de nuevos terratenientes burgueses con interés en defender el liberalismo

**La gran crítica:** La desamortización fue una oportunidad perdida de crear pequeña propiedad campesina (como en Francia). En vez de eso, reforzó el latifundismo.`,
    practice_prompt: 'Explica en qué consistió la Desamortización de Mendizábal (1836). ¿Cuáles eran sus objetivos? ¿Por qué se considera que tuvo consecuencias negativas para el campesinado y para el patrimonio cultural español?',
    alert_markdown: '⚠️ Hay DOS desamortizaciones grandes: **Mendizábal (1836)** afecta al clero REGULAR (órdenes religiosas). **Madoz (1855)** afecta al clero secular Y a los bienes comunales de los municipios. No confundirlas.',
  },

  {
    sort_order: 67,
    block_key: 'Crisis del Antiguo Régimen y Liberalismo',
    block_slug: 'crisis-antiguo-regimen-liberalismo',
    title: 'La Regencia del General Espartero (1840–1843)',
    concept_markdown: `## La Regencia del General Espartero (1840–1843)

### La Caída de María Cristina

El intento de la regente María Cristina de recortar el poder de los ayuntamientos (en favor del centralismo moderado) provocó una insurrección progresista que la obligó a abdicar y exiliarse.

El general **Baldomero Espartero** ("Duque de la Victoria"), héroe popular de la Guerra Carlista y líder del ejército progresista, asumió la Regencia en 1840. Fue el primer y único militar en ejercer la Regencia de España.

### El Gobierno de Espartero: El Autoritarismo Progresista

Espartero gobernó de forma **autoritaria y personalista**, sin escuchar a las Cortes ni a sus propios correligionarios progresistas. Perdió rápidamente sus apoyos políticos por su carácter intransigente.

### La Polémica Crisis con Cataluña (1842)

Su medida más controvertida fue firmar un **Tratado Comercial Librecambista con Inglaterra** que abría las fronteras españolas a los tejidos británicos de algodón. Esto arruinaba por completo a la incipiente industria textil catalana, que no podía competir con los precios del algodón inglés fabricado industrialmente.

**Barcelona se levantó en armas (1842)**. Espartero respondió bombardeando la ciudad desde el Castillo de Montjuïc con extrema dureza, ganándose el odio de los catalanes.

### La Caída de Espartero (1843)

Un pronunciamiento militar conjunto de moderados y progresistas, liderado por los generales **Narváez** y **Prim**, derrocó a Espartero en 1843. Para evitar una tercera regencia, las Cortes decidieron **adelantar la mayoría de edad de Isabel II a los 13 años**, proclamándola reina el 8 de noviembre de 1843.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Por qué fracasó la Regencia de Espartero? ¿Qué fue el conflicto con Cataluña de 1842?*

**Causas del fracaso:**
1. Carácter autoritario y personalista → pérdida de apoyo en las Cortes
2. Tratado librecambista con Inglaterra → destruye la industria textil catalana
3. Bombardeo de Barcelona (1842) → odio de Cataluña + escándalo nacional
4. Pronunciamiento de Narváez y Prim (1843) → fin de la regencia

**El bombardeo de Barcelona:** Un episodio que todavía hoy aparece en la memoria histórica catalana. Espartero (un liberal progresista) bombardeó una ciudad industrial indefensa por resistirse a un tratado económico que la arruinaba. La paradoja del liberalismo que defiende libertades pero destruye la industria nacional.`,
    practice_prompt: 'Describe la Regencia de Espartero (1840-1843). ¿Por qué fracasó? ¿Qué consecuencias tuvo el Tratado Comercial con Inglaterra y el bombardeo de Barcelona de 1842? ¿Cómo llegó Isabel II al trono?',
    alert_markdown: null,
  },

  // ─── PARTE 32: ISABEL II ──────────────────────────────────────────────────────

  {
    sort_order: 68,
    block_key: 'Crisis del Antiguo Régimen y Liberalismo',
    block_slug: 'crisis-antiguo-regimen-liberalismo',
    title: 'La Década Moderada: Constitución de 1845 y Creación de la Guardia Civil',
    concept_markdown: `## La Década Moderada (1844–1854): El Orden Conservador

Durante diez años, el **General Ramón María Narváez** gobernó España imponiendo el modelo del "liberalismo doctrinario": un Estado liberal en sus formas pero profundamente conservador en sus contenidos.

### La Constitución de 1845

El texto constitucional moderado por excelencia eliminaba los principios más avanzados de la Constitución de 1837:
- Suprimía la **soberanía nacional** e implantaba la **soberanía compartida** (Rey + Cortes)
- Eliminaba la **Milicia Nacional**
- Restringía el sufragio censitario al extremo
- Reforzaba los poderes de la Corona (nombramiento y destitución de gobiernos, disolución de las Cortes)

### Las Reformas Estructurales del Estado

**Ley de Mon y Santillán (1845):** Reforma fiscal integral que unificó y simplificó los impuestos en todo el país por primera vez.

**Creación de la Guardia Civil (1844):** Fundada por el **Duque de Ahumada**, era un cuerpo militarizado de seguridad pública para el ámbito rural. Su misión era:
- Sustituir a la Milicia Nacional liberal
- Proteger la propiedad privada de los terratenientes burgueses y nobles
- Combatir el bandolerismo y las revueltas campesinas

**El Concordato con la Santa Sede (1851):** Acuerdo diplomático que normalizó las relaciones con la Iglesia tras el trauma de la desamortización de Mendizábal. El Estado se comprometió a financiar los gastos del culto y del clero, y entregó a los obispos el control de la educación y la censura moral. A cambio, el Papa reconoció la legitimidad del Estado liberal español.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿En qué consistió la Constitución de 1845? ¿Qué fue la Guardia Civil y para qué se creó?*

**Constitución de 1845:**
- Soberanía compartida (no nacional) → la Corona tiene amplios poderes
- Sin Milicia Nacional → elimina la garantía ciudadana del liberalismo progresista
- Sufragio censitario muy restrictivo → menos del 1% vota
- Bicameral: Congreso (electo) + Senado (nombrado por el rey)

**La Guardia Civil (1844):**
- Fundador: Duque de Ahumada
- Objetivo: seguridad del ámbito rural → proteger la propiedad (latifundios) + combatir el bandolerismo
- Militarizada: disciplina militar para mayor efectividad
- Sustituyó a la Milicia Nacional (liberal) → símbolo del triunfo moderado

**Concordato (1851):** El Estado paga al clero + los obispos controlan la educación → alianza Iglesia-Estado liberal moderado.`,
    practice_prompt: 'Describe las principales reformas de la Década Moderada (1844-1854). ¿Cuáles eran las diferencias entre la Constitución de 1845 y la de 1837? ¿Qué fue la Guardia Civil y cuál fue su función social?',
    alert_markdown: null,
  },

  {
    sort_order: 69,
    block_key: 'Crisis del Antiguo Régimen y Liberalismo',
    block_slug: 'crisis-antiguo-regimen-liberalismo',
    title: 'El Bienio Progresista y la Desamortización de Madoz (1854–1856)',
    concept_markdown: `## El Bienio Progresista (1854–1856)

### La Vicalvarada y el Manifiesto de Manzanares

La corrupción y el desgaste del largo gobierno moderado desencadenaron la revolución de 1854. El pronunciamiento militar del general **O'Donnell** en **Vicálvaro** (La Vicalvarada, junio de 1854) fue un resultado militar dudoso, pero la situación se decantó gracias al **Manifiesto de Manzanares** (redactado por el joven abogado **Antonio Cánovas del Castillo**), que exigía reformas democráticas y fue un éxito popular arrollador.

La reina entregó el poder a los progresistas liderados por **Espartero** (presidente del Consejo) y **O'Donnell** (ministro de Guerra).

### Las Dos Grandes Medidas del Bienio

**La Desamortización General de Madoz (1855):**
El ministro progresista **Pascual Madoz** ejecutó la segunda gran desamortización, mucho más amplia que la de Mendizábal:
- Afectó no solo a los bienes del clero secular sino, especialmente, a los **bienes comunales y de propios de los Ayuntamientos** (bosques, dehesas, tierras del común)
- Su objetivo principal fue financiar la construcción del ferrocarril
- **Consecuencia más grave:** La venta de las tierras comunales supuso la ruina de millones de jornaleros y campesinos pobres que dependían de ellas para sobrevivir (recoger leña, pastorear, cazar)

**La Ley General de Ferrocarriles (1855):**
Ofreció inmensas ventajas fiscales y subvenciones estatales a compañías extranjeras (francesas y británicas) para construir de forma acelerada la red ferroviaria española. Se adoptó el definitivo **ancho de vía ibérico**, diferente al europeo (lo que hoy sigue imposibilitando el tránsito directo de trenes entre España y el resto de Europa).`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fue la Desamortización de Madoz (1855)? ¿En qué se diferenciaba de la de Mendizábal?*

**Comparación Mendizábal vs. Madoz:**

| | **Mendizábal (1836)** | **Madoz (1855)** |
|---|---|---|
| Bienes afectados | Clero regular (órdenes religiosas) | Clero secular + bienes comunales de municipios |
| Objetivo | Financiar la Guerra Carlista | Financiar la red ferroviaria |
| Consecuencia social | Latifundismo burgués | Ruina del campesinado pobre |

**La Ley de Ferrocarriles (1855):**
- Empresas extranjeras (francesas, británicas) construyen el ferrocarril con capital y tecnología foránea
- Se adopta el ancho de vía ibérico → diferente al europeo → España queda aislada ferroviariamente de Europa`,
    practice_prompt: 'Explica qué fue el Bienio Progresista (1854-1856). ¿En qué consistió la Desamortización de Madoz y en qué se diferenciaba de la de Mendizábal? ¿Cuáles fueron las consecuencias de la Ley General de Ferrocarriles de 1855?',
    alert_markdown: '⚠️ La Desamortización de **Madoz (1855)** es mucho más amplia y socialmente dañina que la de Mendizábal: afecta a los bienes **comunales** que eran el sustento de los campesinos más pobres. Es el origen de la gran miseria rural española del siglo XIX.',
  },

  {
    sort_order: 70,
    block_key: 'Crisis del Antiguo Régimen y Liberalismo',
    block_slug: 'crisis-antiguo-regimen-liberalismo',
    title: 'La Crisis Final del Sistema Isabelino y el Pacto de Ostende (1866)',
    concept_markdown: `## La Crisis Final del Sistema Isabelino y el Pacto de Ostende

### La Etapa de la Unión Liberal (1856–1866)

Tras el fin del Bienio Progresista, el **General O'Donnell y su Unión Liberal** gobernaron en una etapa de relativa estabilidad económica combinada con una agresiva **política exterior imperialista de prestigio**:
- **Guerra de Marruecos (1859–1860):** Éxito militar con el general **Prim** y la toma de Tetuán → gran entusiasmo popular → escasos beneficios reales
- **Expedición a Cochinchina (1858–1863, Vietnam actual)**
- **Intervención en México (1861–1862):** Junto con Francia e Inglaterra

Estas guerras de prestigio no resolvieron los problemas estructurales del país.

### La Crisis Total del Sistema (1866–1868)

A partir de 1866, el sistema isabelino entró en un colapso irreversible provocado por:
- **Crisis financiera internacional:** Quiebra masiva de las compañías ferroviarias → bancarrotas bancarias
- **Crisis de subsistencia:** Malas cosechas → hambre en el campo
- **Represión política:** Los últimos gobiernos moderados de Narváez aplastaron sangrientamente las protestas estudiantiles en la **Noche de San Daniel (1865)** y la sublevación militar del **Cuartel de San Gil (1866)**

### El Pacto de Ostende (1866): El Fin Anunciado

Toda la oposición al régimen (progresistas, demócratas, y la propia Unión Liberal tras la muerte de O'Donnell) firmó secretamente en la ciudad belga de **Ostende** un pacto con un único objetivo: **derrocar a Isabel II** y convocar unas Cortes Constituyentes por **sufragio universal** para decidir el futuro político de España.

El Pacto de Ostende (1866) anticipó la **Revolución de "La Gloriosa"** de septiembre de 1868, que forzó a Isabel II a exiliarse definitivamente a Francia.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Cuáles fueron las causas de la crisis final del sistema isabelino? ¿Qué fue el Pacto de Ostende?*

**Causas de la crisis:**
1. Económica: quiebra del ferrocarril → crisis financiera → desempleo
2. Social: malas cosechas → hambre rural
3. Política: represión (Noche de San Daniel 1865, Cuartel de San Gil 1866) → toda la oposición se une contra Isabel II
4. Personal: Isabel II era impopular por sus escándalos de corte y su dependencia de los moderados más reaccionarios

**Pacto de Ostende (1866):**
- Firmantes: progresistas + demócratas + Unión Liberal
- Objetivo único: derrocar a Isabel II
- Método: pronunciamiento militar + Cortes Constituyentes por sufragio universal

**Consecuencia:** La Gloriosa (septiembre 1868) → Isabel II se exilia → comienza el Sexenio Democrático (1868-1874)`,
    practice_prompt: 'Explica las causas de la crisis final del sistema isabelino entre 1866 y 1868. ¿Qué fue el Pacto de Ostende y qué fuerzas políticas lo firmaron? ¿Cuál fue su objetivo y qué consecuencias tuvo?',
    alert_markdown: null,
  },
]

const BATCH_SIZE = 5

async function main() {
  console.log(`Insertando ${cards.length} tarjetas del Bloque 7 (Crisis Antiguo Régimen y Liberalismo)…`)

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
    console.log(`\n✅ Bloque 7 insertado. Total filas historia_espana en tabla: ${count}`)
  }
}

main()
