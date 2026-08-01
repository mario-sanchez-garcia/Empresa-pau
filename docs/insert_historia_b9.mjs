// Uso: node --env-file=.env.local docs/insert_historia_b9.mjs
// Bloque 9 — Crisis de la Restauración y la Dictadura: flashcards 80-88
// Partes 40-44 de los apuntes de Diego

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const SUBJECT = 'historia_espana'

const cards = [

  // ─── PARTE 40: REFORMISMO DE MAURA Y CANALEJAS ────────────────────────────────

  {
    sort_order: 80,
    block_key: 'Crisis de la Restauración y la Dictadura',
    block_slug: 'crisis-restauracion-dictadura',
    title: 'Alfonso XIII y el Reformismo: Maura y Canalejas',
    concept_markdown: `## Alfonso XIII y los Intentos de Reforma del Sistema (1902–1912)

Alfonso XIII asumió la jefatura del Estado el **17 de mayo de 1902** al cumplir 16 años. Desde el principio mostró un temperamento intervencionista que rompía con el papel arbitral diseñado por Cánovas para la Corona. Entre 1902 y 1923 se sucedieron **33 gobiernos distintos**, reflejo de la incapacidad del sistema para dar estabilidad.

### El Reformismo Conservador: Antonio Maura ("Revolución desde Arriba")

**Antonio Maura** fue el gran proyecto regeneracionista desde dentro del conservadurismo: modernizar el sistema antes de que el movimiento obrero y los nacionalismos lo desbordaran. En su **Gran Gobierno (1907–1909)** impulsó:
- **Ley Electoral de 1907:** limitó el fraude electoral con el voto obligatorio, pero el caciquismo la absorbió sin dificultades
- **Ley de Administración Local (1907):** descentralización hacia municipios y mancomunidades provinciales → bloqueada en el Senado por su reconocimiento implícito de las regiones
- **Instituto Nacional de Previsión (1908):** primer embrión de seguridad social en España
- **Ley de Represión del Terrorismo (1908):** tras el atentado de Mateo Morral contra Alfonso XIII (bomba en la calle Mayor, 31 mayo 1906, 23 muertos)

La **Semana Trágica de Barcelona (1909)** acabó con su gobierno.

### El Reformismo Liberal: José Canalejas (1910–1912)

**José Canalejas** fue el ala más progresista del liberalismo dinástico. Su gobierno fue el más ambicioso reformismo liberal de la Restauración:
- **Ley del Candado (1910):** prohibía temporalmente el establecimiento de nuevas órdenes religiosas → enorme hostilidad de la Iglesia
- **Ley de Mancomunidades (1913, póstuma):** permitió la **Mancomunitat de Catalunya** (1914), primer organismo de autogobierno catalán moderno
- **Supresión del impuesto de consumos (1911):** aliviaba a las clases populares
- **Servicio militar obligatorio (1912):** eliminó la "redención en metálico" (pagar para no ir al ejército)

Canalejas fue asesinado por el anarquista Manuel Pardiñas el **12 de noviembre de 1912** en la Puerta del Sol. Su muerte truncó el más serio intento de modernización del liberalismo español.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fue la "revolución desde arriba" de Maura? ¿Por qué fracasaron los intentos de reforma del sistema de la Restauración?*

**Maura:**
- Diagnóstico correcto: el sistema se pudre → hay que reformarlo desde arriba antes de que explote desde abajo
- Reformas: Ley Electoral (1907) + Administración Local + INP + Represión del Terrorismo
- Fracaso: la Semana Trágica (1909) → dimisión forzada
- El caciquismo absorbió la Ley Electoral sin que cambiara nada

**Canalejas:**
- Más progresista: Ley del Candado (contro Iglesia) + Mancomunidades (autonomía) + supresión impuesto consumos + servicio militar obligatorio
- Muerte: asesinado (1912) → proyecto truncado

**Conclusión:** Ambos fracasos demuestran que el sistema de la Restauración era irreformable desde dentro: el caciquismo, la Iglesia, el ejército y los partidos dinásticos bloqueaban cualquier cambio sustancial.`,
    practice_prompt: 'Describe los proyectos de reforma de Antonio Maura y José Canalejas. ¿Qué fue la "revolución desde arriba" de Maura? ¿Por qué fracasaron los intentos de modernización del sistema de la Restauración?',
    alert_markdown: null,
  },

  // ─── PARTE 41A: SEMANA TRÁGICA ────────────────────────────────────────────────

  {
    sort_order: 81,
    block_key: 'Crisis de la Restauración y la Dictadura',
    block_slug: 'crisis-restauracion-dictadura',
    title: 'La Semana Trágica de Barcelona (26 julio–2 agosto de 1909)',
    concept_markdown: `## La Semana Trágica de Barcelona (1909)

### Antecedentes: La Guerra de Marruecos

Tras el Desastre del 98, España reorientó su política colonial hacia el norte de África. El **Acta de Algeciras (1906)** repartió el Protectorado marroquí entre Francia y España. España recibía una franja norte árida y montañosa habitada por las cabilas rifeñas.

En el verano de 1909, las cabilas del Rif atacaron las obras del ferrocarril minero en los alrededores de Melilla. El gobierno Maura movilizó a los **reservistas** —muchos padres de familia— mientras los ricos seguían pudiendo pagar la *"cuota"* para evitar el servicio militar.

### El Estallido (26 julio 1909)

Cuando los barcos con reservistas zarparon del puerto de Barcelona, las mujeres comenzaron a arrojar medallas al mar en señal de protesta. El **25 de julio** se declaró una huelga general en Barcelona convocada por anarquistas y republicanos radicales de Lerroux. La huelga se transformó rápidamente en levantamiento popular:

- Quema de **más de 80 edificios religiosos** (conventos, iglesias, colegios) en Barcelona y su cinturón industrial
- Exhumación de cadáveres de monjas y exposición en las calles (anticlericalismo visceral, ampliamente fotografiado y difundido por la prensa europea)
- Combates callejeros entre manifestantes y el ejército
- El gobierno declaró el estado de guerra

### Represión y el "Caso Ferrer"

La represión fue severa: **5 civiles ejecutados**, centenares de detenidos. El más polémico fue **Francisco Ferrer Guardia**, pedagogo anarquista fundador de la *Escuela Moderna* de Barcelona, ejecutado el **13 de octubre de 1909** en el castillo de Montjuïc. Ferrer no había participado directamente, pero fue condenado como instigador moral.

Su ejecución desató protestas internacionales bajo el lema *"¡Maura, no!"* y provocó la caída del gobierno Maura, forzado a dimitir el **21 de octubre de 1909**.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Cuáles fueron las causas y consecuencias de la Semana Trágica de Barcelona (1909)?*

**Causas:**
1. Movilización de reservistas para Marruecos = injusta (los ricos se libran pagando)
2. Anticlericalismo popular acumulado en Barcelona
3. Agitación de anarquistas y republicanos radicales (Lerroux)

**Desarrollo:**
- 25-26 julio: huelga general → levantamiento popular
- Quema de 80 edificios religiosos + combates callejeros
- Estado de guerra → represión

**Consecuencias:**
1. "Caso Ferrer": ejecución de pedagogo inocente → escándalo internacional
2. "¡Maura, no!": oleada de protestas europeas
3. Dimisión forzada del gobierno Maura (21 octubre 1909)
4. Polarización política y social en Barcelona entre la izquierda anticlerical y la derecha conservadora`,
    practice_prompt: 'Describe las causas, desarrollo y consecuencias de la Semana Trágica de Barcelona (julio-agosto de 1909). ¿Qué fue el "caso Ferrer Guardia" y qué repercusiones tuvo en la política española?',
    alert_markdown: '⚠️ La Semana Trágica NO fue una revolución social organizada. Fue un estallido espontáneo de anticlericalismo y protesta contra la guerra. La quema de conventos fue más anticlericalismo visceral que proyecto político. Este matiz es importante para PAU.',
  },

  // ─── PARTE 41B: PRIMERA GUERRA MUNDIAL EN ESPAÑA ─────────────────────────────

  {
    sort_order: 82,
    block_key: 'Crisis de la Restauración y la Dictadura',
    block_slug: 'crisis-restauracion-dictadura',
    title: 'El Impacto de la Primera Guerra Mundial en España (1914–1918)',
    concept_markdown: `## España ante la Primera Guerra Mundial: Neutralidad y sus Consecuencias

### La Neutralidad Española

España se declaró **neutral** en la Primera Guerra Mundial (1914–1918) bajo el gobierno del liberal **Eduardo Dato**. Esta neutralidad fue una fuente de enormes beneficios económicos a corto plazo y de graves tensiones sociales a largo plazo.

### La División de la Opinión Pública

La sociedad española se fracturó profundamente:
- **"Aliadófilos":** liberales, republicanos, socialistas e intelectuales (Ortega y Gasset, Unamuno) simpatizaban con Francia y Gran Bretaña, identificadas con los valores democráticos
- **"Germanófilos":** conservadores, militares, carlistas e Iglesia simpatizaban con los Imperios Centrales, identificados con el orden, la autoridad y el catolicismo

### El Impacto Económico: El Boom y sus Contradicciones

La neutralidad permitió a España exportar masivamente a todos los países beligerantes:
- **Boom exportador:** productos agrícolas (trigo, aceite, vino), textiles catalanes, carbón asturiano y mineral vasco → las exportaciones se dispararon y las fortunas industriales y comerciales se multiplicaron
- **Inflación desbocada:** los productos que antes abastecían el mercado interior ahora se exportaban, generando escasez y una **inflación brutal** que redujo drásticamente el poder adquisitivo de los salarios obreros
- **Enriquecimiento de la burguesía** industrial y comercial frente al **empobrecimiento de las clases trabajadoras**

Esta brecha entre los beneficios de la guerra para las clases altas y el encarecimiento de la vida para las clases populares fue la mecha que encendió la **crisis de 1917**.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Cuál fue el impacto económico y social de la Primera Guerra Mundial en España, a pesar de ser un país neutral?*

**Respuesta modelo:**
1. España neutral → puede exportar a TODOS los beligerantes
2. Boom exportador: textiles catalanes + carbón asturiano + mineral vasco + productos agrícolas
3. Resultado: enriquecimiento de la burguesía industrial y agraria
4. Contradicción: los mismos productos que se exportan se escasean en el interior → inflación
5. Consecuencia social: los salarios reales caen mientras los precios suben → tensión obrera → crisis de 1917

**La paradoja de la neutralidad:** España se enriqueció económicamente pero esa riqueza se distribuyó de forma extremadamente desigual, creando las condiciones para la mayor crisis política del siglo XX español hasta ese momento.`,
    practice_prompt: 'Explica el impacto de la Primera Guerra Mundial en España. ¿Qué fue el debate entre "aliadófilos" y "germanófilos"? ¿Por qué la neutralidad española benefició a unos y perjudicó a otros?',
    alert_markdown: null,
  },

  // ─── PARTE 42A: CRISIS DE 1917 ────────────────────────────────────────────────

  {
    sort_order: 83,
    block_key: 'Crisis de la Restauración y la Dictadura',
    block_slug: 'crisis-restauracion-dictadura',
    title: 'La Crisis de 1917: Las Juntas de Defensa y la Asamblea de Parlamentarios',
    concept_markdown: `## La Crisis de 1917: Una Triple Crisis Simultánea

El año 1917 fue el momento de máxima tensión del sistema de la Restauración. Se produjo una crisis simultánea en tres frentes que, sin embargo, nunca llegaron a coordinarse para derribar el régimen.

### Frente 1: La Crisis Militar — Las Juntas de Defensa

Los oficiales del ejército de guarnición en la Península llevaban años resentidos por los bajos salarios, el exceso de oficiales en la escala, y los rápidos ascensos por méritos de guerra que obtenían los **"africanistas"** (oficiales que servían en Marruecos). Formaron las **Juntas de Defensa**: organismos de autodefensa gremial, similares a un sindicato militar.

En **junio de 1917**, las Juntas publicaron su manifiesto exigiendo mejoras salariales y el fin de los ascensos por méritos de guerra. El gobierno de Dato, ante el riesgo de pronunciamiento, cedió y **legalizó las Juntas**. Fue una humillación para el poder civil: el ejército había actuado como grupo de presión al margen de la legalidad y había ganado.

### Frente 2: La Crisis Política — La Asamblea de Parlamentarios

Los partidos excluidos del turno (republicanos, socialistas, catalanistas y reformistas) aprovecharon la debilidad del gobierno para exigir Cortes Constituyentes. Como el gobierno había suspendido las Cortes, los parlamentarios disidentes se reunieron por iniciativa de la **Lliga Regionalista** (Cambó) en la **Asamblea de Parlamentarios de Barcelona (19 de julio de 1917)**.

La asamblea reclamó un gobierno provisional y Cortes Constituyentes. El gobierno la disolvió y el ejército garantizó el orden. La asamblea no tuvo continuidad porque sus participantes no se pusieron de acuerdo en ir más lejos.

### Frente 3: La Crisis Obrera — La Huelga General de Agosto de 1917

PSOE, UGT y CNT convocaron una **huelga general revolucionaria** para el **13 de agosto de 1917**. El manifiesto exigía gobierno provisional y Cortes Constituyentes. La huelga tuvo gran seguimiento en Madrid, Barcelona, Bilbao, Valencia y Asturias. El ejército la reprimió duramente: **71 muertos, cientos de heridos y más de 2.000 detenidos**. Los líderes socialistas (Largo Caballero, Besteiro, Saborit, Anguiano) fueron condenados a cadena perpetua, aunque amnistiados en 1918 y elegidos diputados.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿En qué consistió la crisis de 1917? ¿Por qué fracasó a pesar de su gravedad?*

**Los tres frentes:**
1. **Juntas de Defensa** (junio 1917): militares actúan como sindicato → gobierno cede → humillación del poder civil
2. **Asamblea de Parlamentarios** (19 julio 1917): liderada por la Lliga → reclama Cortes Constituyentes → el gobierno la disuelve → sin continuidad
3. **Huelga general** (13 agosto 1917): PSOE + UGT + CNT → 71 muertos + 2.000 detenidos → reprimida por el ejército

**Por qué fracasó:**
- Los tres frentes actuaron por separado, nunca se coordinaron
- Las Juntas de Defensa (que podrían haber apoyado el cambio político) acabaron del lado del orden al reprimir la huelga obrera
- La asamblea burguesa no quiso llegar tan lejos como los obreros

**El sistema sobrevivió pero quedó gravemente deslegitimado.**`,
    practice_prompt: 'Explica la triple crisis de 1917 en España: la crisis militar (Juntas de Defensa), la crisis política (Asamblea de Parlamentarios) y la crisis obrera (huelga general de agosto). ¿Por qué fracasaron a pesar de su gravedad?',
    alert_markdown: '⚠️ La **CNT** (Confederación Nacional del Trabajo) fue fundada en **1910** como heredera de la FTRE anarquista. Es el sindicato anarquista que participó en la huelga de 1917. No confundir con el PSOE (partido) ni la UGT (sindicato socialista).',
  },

  // ─── PARTE 42B: DESASTRE DE ANNUAL ───────────────────────────────────────────

  {
    sort_order: 84,
    block_key: 'Crisis de la Restauración y la Dictadura',
    block_slug: 'crisis-restauracion-dictadura',
    title: 'El Desastre de Annual (1921) y el Expediente Picasso',
    concept_markdown: `## El Desastre de Annual (julio–agosto de 1921)

### La Guerra del Rif: El Contexto

Tras el Acta de Algeciras, España controlaba nominalmente el Protectorado del norte de Marruecos, pero las cabilas rifeñas apenas habían sido sometidas. El general **Manuel Fernández Silvestre** avanzó en 1921 de forma temeraria hacia el interior del Rif, sobreextendiendo peligrosamente las líneas españolas sin el apoyo logístico necesario.

### El Desastre (22 julio – agosto de 1921)

**Abd el-Krim**, líder de la cabila de los Beni Urriaguel, organizó una resistencia eficaz. El **22 de julio de 1921**, las fuerzas rifeñas atacaron la posición española de Annual. El ejército español sufrió un colapso fulminante: en pocas semanas se perdieron más de **12.000 soldados muertos**, numerosas posiciones y enorme armamento.

- El general Silvestre murió en Annual (posiblemente suicidado)
- El comandante general **Felipe Navarro** capituló en Monte Arruit el **9 de agosto de 1921**

Fue la **mayor derrota militar española desde el desastre del 98**.

### El Expediente Picasso: Las Responsabilidades Políticas

Las Cortes exigieron la creación de una **Comisión de Responsabilidades** para depurar culpables. El **"Expediente Picasso"** (instruido por el general Juan Picasso) amenazaba con señalar a:
- Los mandos militares que habían actuado con imprudencia
- El propio **Alfonso XIII**, de quien se rumoreaba que había alentado personalmente el avance temerario de Silvestre

El debate sobre el Expediente Picasso fue el **detonante directo del golpe de Estado de Primo de Rivera en 1923**: el golpe sirvió para cerrar el expediente antes de que llegase a sus conclusiones y salpicara a la institución militar y al rey.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fue el Desastre de Annual? ¿Qué relación tiene con el golpe de Primo de Rivera?*

**Annual (1921):**
- General Silvestre avanza temerariamente por el Rif sin apoyo logístico
- Abd el-Krim contraataca (22 julio 1921)
- Colapso: +12.000 muertos en semanas → la mayor derrota desde 1898
- Silvestre: muerto en Annual; Navarro: capitula en Monte Arruit (9 agosto)

**El Expediente Picasso:**
- Comisión parlamentaria para depurar responsabilidades
- Amenaza a mandos militares + Alfonso XIII
- El expediente se convierte en bomba política para el sistema

**Conexión con el golpe de 1923:**
Primo de Rivera da el golpe (septiembre 1923) → una de sus motivaciones es cerrar el Expediente Picasso antes de que llegue a señalar al rey y al ejército → el golpe de Estado es también una maniobra de autoprotección del estamento militar.`,
    practice_prompt: 'Describe el Desastre de Annual (1921). ¿Cuántas bajas tuvo España? ¿Qué fue el Expediente Picasso y por qué amenazaba al propio Alfonso XIII? ¿Qué relación existe entre el Desastre de Annual y el golpe de Estado de Primo de Rivera en 1923?',
    alert_markdown: '⚠️ El Desastre de Annual (+12.000 muertos en 1921) fue más grave que el del 98 en términos de vidas humanas, pero tuvo menos impacto internacional porque no enfrentó a España con una potencia mundial. Su impacto fue esencialmente interior: deslegitimó al ejército y a la monarquía.',
  },

  // ─── PARTE 43: GOLPE DE PRIMO DE RIVERA ──────────────────────────────────────

  {
    sort_order: 85,
    block_key: 'Crisis de la Restauración y la Dictadura',
    block_slug: 'crisis-restauracion-dictadura',
    title: 'El Golpe de Estado de Primo de Rivera (13 septiembre 1923)',
    concept_markdown: `## El Golpe de Estado de Primo de Rivera (13 de septiembre de 1923)

El **Capitán General de Cataluña, Miguel Primo de Rivera y Orbaneja** (marqués de Estella), se pronunció en Barcelona el **13 de septiembre de 1923** emitiendo un manifiesto que denunciaba el *"caciquismo"*, la *"inmoralidad política"*, el *"separatismo"* y la amenaza del *"comunismo"*, y anunciaba la constitución de un **Directorio Militar** que gobernaría España.

### El Rey Cómplice

**Alfonso XIII**, en lugar de defender la Constitución de 1876 y ordenar la resistencia al golpe, llamó a Primo de Rivera para encargarle la formación de gobierno. Con ello, el rey se convertía en **cómplice del golpe**, lo que hipotecó su propio futuro cuando la dictadura cayera.

### Las Causas del Golpe

- La amenaza del **Expediente Picasso** (responsabilidades de Annual), que podía salpicar al rey y al ejército
- La incapacidad del sistema parlamentario para dar estabilidad (33 gobiernos en 21 años)
- El ascenso de la conflictividad social (huelgas, **pistolerismo** en Barcelona entre la CNT y los sindicatos libres patronales)
- El triunfo bolchevique en Rusia (1917) y el miedo de las clases propietarias a una revolución
- La influencia del fascismo italiano de Mussolini (llegado al poder en octubre de 1922)

### La Reacción: Pasividad Total

La reacción política fue de una pasividad casi total:
- Los partidos dinásticos estaban agotados y no resistieron
- Los **socialistas** (PSOE) optaron por la **colaboración táctica**: Largo Caballero aceptó un puesto en el Consejo de Estado
- Solo republicanos, algunos liberales y la CNT se opusieron claramente

### El Directorio Militar (Sept. 1923 – Dic. 1925)

El gobierno formado exclusivamente por generales tomó estas medidas inmediatas:
- Suspensión de la **Constitución de 1876** y disolución de las Cortes
- Destitución de ayuntamientos y diputaciones → delegados gubernativos militares
- **Persecución del catalanismo:** prohibición del catalán en actos públicos, supresión de la **Mancomunitat de Catalunya (1925)**
- Represión de la CNT; colaboración con PSOE y UGT`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Cuáles fueron las causas del golpe de Estado de Primo de Rivera (1923)? ¿Por qué Alfonso XIII no lo resistió?*

**Causas (cinco factores):**
1. Expediente Picasso → amenaza al rey y al ejército → urge cerrar el asunto
2. Ingobernabilidad: 33 gobiernos en 21 años → el sistema ya no funciona
3. Conflictividad social: pistolerismo en Barcelona + huelgas
4. Miedo a la revolución: Rusia (1917) asusta a las clases propietarias
5. Modelo fascista italiano: Mussolini (oct. 1922) como ejemplo de solución "fuerte"

**Alfonso XIII:** no resiste → llama a Primo a gobernar → se convierte en cómplice → cuando la dictadura caiga (1930), la monarquía caerá con ella (1931)

**La pasividad socialista:** el PSOE colabora tácticamente con la dictadura (Largo Caballero en el Consejo de Estado). Estrategia pragmática que luego utilizarían como argumento sus críticos.`,
    practice_prompt: 'Explica las causas del golpe de Estado de Primo de Rivera (13 de septiembre de 1923). ¿Por qué Alfonso XIII no defendió la Constitución? ¿Cuáles fueron las primeras medidas del Directorio Militar?',
    alert_markdown: '⚠️ El golpe de Primo de Rivera fue el PRIMER golpe de Estado que triunfó en España desde la Restauración (1874). No confundir con los pronunciamientos del siglo XIX. Es también el primero influido directamente por el fascismo europeo (Mussolini, 1922).',
  },

  // ─── PARTE 44A: ALHUCEMAS ────────────────────────────────────────────────────

  {
    sort_order: 86,
    block_key: 'Crisis de la Restauración y la Dictadura',
    block_slug: 'crisis-restauracion-dictadura',
    title: 'El Desembarco de Alhucemas (1925): El Fin de la Guerra del Rif',
    concept_markdown: `## El Desembarco de Alhucemas (8 de septiembre de 1925)

### El Contexto: Abd el-Krim Ataca a Francia

**Abd el-Krim** había cometido el error estratégico de atacar también las posiciones francesas en el sur del Rif en **abril de 1925**, lo que convirtió a **Francia en aliada de España**. La colaboración hispano-francesa hizo posible la operación más audaz de la dictadura.

### La Operación

El **8 de septiembre de 1925**, una flota conjunta hispano-francesa realizó un desembarco anfibio en la **bahía de Alhucemas**, en el corazón del territorio de Abd el-Krim (los Beni Urriaguel). Fue uno de los **primeros desembarcos anfibios modernos de la historia**.

Las fuerzas desembarcadas incluían:
- La **Legión** (cuerpo de élite creado en 1920 por Millán Astray)
- Las unidades de **Regulares marroquíes**
- El mando de las tropas de vanguardia lo ejerció el entonces teniente coronel **Francisco Franco**

### El Resultado y su Importancia

La operación fue un éxito rotundo. **Abd el-Krim** se rindió a los franceses en **mayo de 1926** y fue deportado a la isla de Reunión. La **guerra de Marruecos había terminado**, y con ella el problema colonial que había sangrado a España durante décadas.

El desembarco de Alhucemas fue el **punto más alto de popularidad de Primo de Rivera** y el momento en que el nombre del teniente coronel Francisco Franco comenzó a ser conocido en toda España como un héroe militar.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fue el Desembarco de Alhucemas (1925) y qué importancia tuvo?*

**Respuesta modelo:**
1. Contexto: Abd el-Krim ataca a Francia (abril 1925) → Francia se alía con España
2. Operación: 8 septiembre 1925 → desembarco anfibio en la bahía de Alhucemas → corazón del territorio rifeño
3. Protagonistas: Legión + Regulares marroquíes → mando de Franco
4. Resultado: Abd el-Krim se rinde (mayo 1926) → deportado a isla Reunión
5. Fin de la guerra de Marruecos

**Importancia histórica:**
- Fue uno de los primeros desembarcos anfibios modernos (8 años antes de los desembarcos aliados de la II GM)
- Lanzó la carrera militar de **Franco** a la fama nacional
- Fue el mayor éxito de la dictadura de Primo de Rivera
- Cerró el problema marroquí que había desangrado a España desde 1909`,
    practice_prompt: 'Describe el Desembarco de Alhucemas (8 de septiembre de 1925). ¿Por qué fue posible la cooperación hispano-francesa? ¿Qué importancia tuvo para la dictadura de Primo de Rivera y para la carrera militar de Francisco Franco?',
    alert_markdown: null,
  },

  // ─── PARTE 44B: DIRECTORIO CIVIL ─────────────────────────────────────────────

  {
    sort_order: 87,
    block_key: 'Crisis de la Restauración y la Dictadura',
    block_slug: 'crisis-restauracion-dictadura',
    title: 'El Directorio Civil de Primo de Rivera: Política Económica (1925–1930)',
    concept_markdown: `## El Directorio Civil (diciembre 1925 – enero 1930)

Tras el éxito de Alhucemas, Primo de Rivera intentó institucionalizar su régimen transformando el Directorio Militar en un **Directorio Civil**, con ministros civiles técnicos. La figura clave fue **José Calvo Sotelo**, ministro de Hacienda.

### Política Económica: El Nacionalismo Económico

El Directorio Civil apostó por un modelo de **intervencionismo estatal y proteccionismo**, influido por el corporativismo económico fascista italiano:

**Creación de monopolios estatales:**
- **CAMPSA (1927):** Compañía Arrendataria del Monopolio de Petróleos. Arrebató el negocio petrolero a las empresas extranjeras (especialmente a la Standard Oil norteamericana)
- **Telefónica Nacional de España (1924):** creada en colaboración con la ITT norteamericana; revolucionó las comunicaciones en España

**Grandes obras públicas:**
- Construcción masiva de **carreteras** (de 56.000 km en 1923 a 70.000 km en 1930)
- **Embalses** y política hidráulica inspirada en Joaquín Costa
- Creación de las **Confederaciones Hidrográficas (1926)** para gestionar las cuencas fluviales
- **Ferrocarriles**

**Contexto favorable:** La dictadura coincidió con los **"felices años veinte"**, período de prosperidad internacional que impulsó el crecimiento español. El PIB creció, el desempleo fue bajo y la conflictividad social disminuyó.

**Intento de institucionalización: la Asamblea Nacional Consultiva (1927)**

Primo de Rivera intentó crear una base política estable con la **Asamblea Nacional Consultiva**: un órgano corporativo no electivo con representantes de ayuntamientos, corporaciones económicas y la **Unión Patriótica** (partido único del régimen, fundado en 1924). Debía elaborar una nueva constitución. El proyecto fracasó: el borrador de **1929** fue rechazado por todos los sectores políticos.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *Describe la política económica del Directorio Civil de Primo de Rivera. ¿Qué fue la CAMPSA?*

**Modelo económico:** intervencionismo estatal + proteccionismo + obras públicas → influencia del fascismo económico italiano

**CAMPSA (1927):** monopolio estatal del petróleo → echa a las empresas extranjeras → el Estado controla un sector estratégico

**Telefónica (1924):** modernización de las comunicaciones + colaboración con capital americano (ITT)

**Obras públicas:** carreteras (+14.000 km) + embalses + ferrocarriles → los "felices años 20" hacen que la economía crezca pero no se sabe cuánto es por la dictadura y cuánto por el contexto internacional favorable

**Fracaso político:** La Asamblea Nacional Consultiva (1927) → organismo corporativo no electo → borrador constitucional rechazado por todos → la dictadura no puede institucionalizarse`,
    practice_prompt: 'Describe la política económica del Directorio Civil de Primo de Rivera. ¿Qué fue la CAMPSA y qué importancia tuvo? ¿Qué fue la Asamblea Nacional Consultiva y por qué fracasó?',
    alert_markdown: null,
  },

  // ─── PARTE 44C: CAÍDA Y "DICTABLANDA" ────────────────────────────────────────

  {
    sort_order: 88,
    block_key: 'Crisis de la Restauración y la Dictadura',
    block_slug: 'crisis-restauracion-dictadura',
    title: 'La Caída de Primo de Rivera y la "Dictablanda" (1930–1931)',
    concept_markdown: `## La Caída de la Dictadura y el Final de la Monarquía (1930–1931)

### El Deterioro de la Dictadura (1928–1930)

A partir de 1928–1929, la dictadura entró en espiral de deterioro acelerado:
- **Crisis económica:** el crack de la Bolsa de Nueva York **(octubre de 1929)** golpeó la economía española → la peseta se depreció gravemente → Calvo Sotelo intentó estabilizarla sin éxito y dimitió
- **Oposición universitaria:** la equiparación de los títulos de universidades privadas (Deusto, El Escorial) a los de las públicas desató protestas estudiantiles. La **FUE** (Federación Universitaria Escolar) encabezó las protestas. **Ortega y Gasset** y **Unamuno** se convirtieron en símbolos de la resistencia intelectual
- **Oposición militar:** la política de ascensos enfrentó a Primo con la artillería y parte del ejército → conspiraciones militares (la *Sanjuanada*, junio 1926)
- **Oposición política:** el **Pacto de San Sebastián (agosto de 1930)** unió a republicanos, socialistas y catalanistas en un frente común contra la monarquía

Primo de Rivera consultó a los capitanes generales si contaba con su apoyo. La respuesta fue negativa. Dimitió el **28 de enero de 1930** y se exilió a París, donde murió el **16 de marzo de 1930**.

### La "Dictablanda" y el Final de la Monarquía

Alfonso XIII intentó salvar la monarquía con dos gobiernos de transición:
- **General Dámaso Berenguer** (enero 1930 – febrero 1931): gobierno tan lento e indeciso que se ganó el apodo de **"Dictablanda"**. Ortega y Gasset publicó su célebre artículo *"El error Berenguer"* (noviembre 1930), diagnosticando que la monarquía ya no tenía salvación
- **Almirante Juan Bautista Aznar** (febrero–abril 1931): convocó **elecciones municipales** para el **12 de abril de 1931** como paso previo a unas generales

Los republicanos barrieron en las capitales de provincia. Ante el resultado, **Alfonso XIII abandonó España el 14 de abril de 1931** sin abdicar formalmente. Ese mismo día se proclamó la **Segunda República Española**.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Por qué cayó la dictadura de Primo de Rivera? ¿Qué fue la "Dictablanda" y cómo se llegó a la proclamación de la II República?*

**Causas de la caída de Primo de Rivera:**
1. Crack del 29 → crisis económica → peseta deprecia → descrédito económico
2. Oposición universitaria → FUE + Ortega + Unamuno
3. Oposición militar → Sanjuanada + rechazo de los generales
4. Oposición política → Pacto de San Sebastián (1930)
5. Sin apoyos → dimite (28 enero 1930) → París → muere (16 marzo 1930)

**"Dictablanda" de Berenguer:** gobierno de transición sin rumbo → Ortega: "El error Berenguer" → la monarquía ya no tiene salvación

**Las elecciones del 12 de abril de 1931:**
- Municipales → los republicanos barren en las capitales
- Alfonso XIII interpreta el resultado como un plebiscito → abandona España
- **14 de abril de 1931:** proclamación de la II República

**Clave:** el 14 de abril de 1931 fue el resultado inevitable de la complicidad de Alfonso XIII con el golpe de 1923.`,
    practice_prompt: 'Explica las causas de la caída de la dictadura de Primo de Rivera. ¿Qué fue la "Dictablanda" de Berenguer? ¿Cómo se produjo la proclamación de la Segunda República el 14 de abril de 1931?',
    alert_markdown: '⚠️ El **14 de abril de 1931** es la fecha de proclamación de la II República. Las elecciones del 12 de abril fueron **municipales** (no generales), pero sus resultados se interpretaron como un plebiscito sobre la monarquía. Alfonso XIII no abdicó formalmente; simplemente se marchó.',
  },
]

const BATCH_SIZE = 5

async function main() {
  console.log(`Insertando ${cards.length} tarjetas del Bloque 9 (Crisis de la Restauración)…`)

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
    console.log(`\n✅ Bloque 9 insertado. Total filas historia_espana en tabla: ${count}`)
  }
}

main()
