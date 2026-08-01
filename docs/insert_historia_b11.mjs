// Uso: node --env-file=.env.local docs/insert_historia_b11.mjs
// Bloque 11 — La Guerra Civil: flashcards 98-106
// Partes 49-52 de los apuntes de Diego

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const SUBJECT = 'historia_espana'

const cards = [

  // ─── PARTE 49A: EL ALZAMIENTO Y EL PUENTE AÉREO ──────────────────────────────

  {
    sort_order: 98,
    block_key: 'La Guerra Civil',
    block_slug: 'guerra-civil',
    title: 'El Alzamiento de Julio de 1936 y el Puente Aéreo de Marruecos',
    concept_markdown: `## El Alzamiento del 17–18 de julio de 1936 y el Puente Aéreo

### El Golpe (17–18 julio 1936)

El golpe comenzó en **Marruecos** en la tarde del **17 de julio de 1936**, cuando la guarnición de Melilla se sublevó anticipándose al plan (se había descubierto la conspiración). El 18 de julio se generalizó en la Península.

**Dónde triunfó el golpe:**
- Marruecos (completamente)
- Navarra (fervientemente carlista; el general Mola dominó la situación desde Pamplona)
- Castilla la Vieja (Burgos, Valladolid, Salamanca, Segovia, Ávila)
- Galicia
- Canarias, Baleares (salvo Menorca)
- Enclaves en Andalucía occidental: Sevilla (Queipo de Llano), Córdoba, Granada

**Dónde fracasó el golpe:**
- Madrid, Barcelona, Valencia, Bilbao, Santander, Málaga, Almería
- Las zonas industriales del País Vasco y Cataluña
- La Marina de guerra (la marinería fusiló a la mayoría de sus oficiales sublevados)
- La Aviación (mayoritariamente leal)

El fracaso del golpe en las grandes ciudades convirtió lo que debía ser un pronunciamiento de 48 horas en una **guerra civil larga**.

### El Puente Aéreo de Marruecos (julio–agosto 1936)

El mayor problema inicial de los sublevados fue cruzar el **Ejército de África** (la fuerza más profesional y veterana de España: ~35.000 hombres entre legionarios y Regulares marroquíes) a la Península, ya que la Marina era mayoritariamente republicana y bloqueaba el Estrecho de Gibraltar.

La solución vino de **Hitler** y **Mussolini**: el **20 de julio de 1936**, Franco solicitó aviones de transporte a Alemania e Italia. Hitler envió **20 Junkers Ju-52** y Mussolini **12 Savoia-Marchetti SM.81**. Entre julio y octubre de 1936 se realizó el primer puente aéreo masivo de la historia, transportando a unos **14.000 soldados** del Ejército de África a la Península. Sin este apoyo, la sublevación habría sido aplastada.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Por qué el golpe del 17-18 de julio de 1936 no fue un pronunciamiento exitoso y se convirtió en guerra civil?*

**El alzamiento:**
- 17 julio: Melilla (Marruecos) se anticipa → 18 julio: se generaliza en la Península
- Triunfa en: Marruecos + Navarra + Castilla la Vieja + Galicia + enclaves andaluces
- Fracasa en: Madrid + Barcelona + Valencia + País Vasco + la Marina + la Aviación

**Por qué se convirtió en guerra civil:**
Ninguno de los dos bandos podía vencer rápidamente → España quedó dividida → guerra inevitable

**El puente aéreo:**
- Problema: el Ejército de África (35.000 hombres, los mejores soldados) está en Marruecos y la Marina republicana bloquea el Estrecho
- Solución: Franco pide ayuda a Hitler (20 Ju-52) y Mussolini (12 SM.81) → 14.000 soldados cruzados por aire
- Sin el puente aéreo → el golpe habría fracasado`,
    practice_prompt: '¿Dónde triunfó y dónde fracasó el golpe militar del 17-18 de julio de 1936? ¿Por qué el fracaso parcial del golpe derivó en guerra civil? ¿Qué fue el "puente aéreo de Marruecos" y qué papel jugaron Alemania e Italia en él?',
    alert_markdown: '⚠️ El puente aéreo de julio-agosto de 1936 fue el **primer puente aéreo masivo de la historia militar**, 12 años antes del famoso puente aéreo de Berlín (1948). Es un dato que sorprende y aparece en exámenes de historia militar comparada.',
  },

  // ─── PARTE 49B: FASES MILITARES (MADRID Y NORTE) ─────────────────────────────

  {
    sort_order: 99,
    block_key: 'La Guerra Civil',
    block_slug: 'guerra-civil',
    title: 'Las Fases Militares de la Guerra Civil: El Frente de Madrid y la Campaña del Norte (1936–1937)',
    concept_markdown: `## Las Fases Militares de la Guerra Civil (1936–1937)

### Fase 1: El Avance del Ejército de África y el Asedio de Madrid (julio–noviembre 1936)

El general **Francisco Franco** comandó la columna del sur, que avanzó por Extremadura hacia Madrid. El **27 de septiembre de 1936**, Franco desvió su marcha para levantar el asedio del **Alcázar de Toledo** (donde el coronel Moscardó resistía con ~1.200 personas desde julio): decisión tácticamente discutible pero propagandísticamente genial.

El **1 de octubre de 1936**, en Burgos, los generales sublevados nombraron a Franco **Generalísimo y Jefe del Gobierno del Estado Español**. Franco se convirtió en el mando único del bando nacional.

El Ejército de África llegó a las puertas de Madrid en **noviembre de 1936**. La ofensiva sobre Madrid se lanzó el **6 de noviembre**, coincidiendo con la huida del gobierno republicano a Valencia. La defensa de Madrid fue organizada por el general **José Miaja** y el coronel **Vicente Rojo**, con el apoyo crucial de las **Brigadas Internacionales** (cuya primera unidad entró en combate el 8 de noviembre) y los tanques soviéticos. **Madrid resistió**.

**Batallas en los accesos a Madrid:**
- **Batalla del Jarama (febrero 1937):** ofensiva nacional para cortar la carretera Madrid-Valencia. Fracaso.
- **Batalla de Guadalajara (marzo 1937):** ofensiva italiana (Corpo Truppe Volontarie, CTV) por el norte. Gran derrota italiana, que supuso la primera victoria significativa de la República.

### Fase 2: La Campaña del Norte (marzo–octubre 1937)

Ante el estancamiento en Madrid, Franco optó por conquistar la España republicana del norte (País Vasco, Cantabria, Asturias), zona industrial rica en carbón y acero pero aislada del resto de la República.

- **Bombardeo de Guernica (26 de abril de 1937):** la Legión Cóndor alemana (con participación italiana) bombardeó la ciudad vasca de Guernica durante un día de mercado. Murieron entre 150 y 1.600 personas (las cifras son debatidas). Guernica era la ciudad simbólica de las libertades vascas. El bombardeo fue inmortalizado por el cuadro de **Pablo Picasso**, *Guernica*, encargado por la República para la Exposición Universal de París de 1937.
- **Caída de Bilbao (junio 1937), Santander (agosto 1937) y Gijón (octubre 1937).**`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fue el Bombardeo de Guernica (1937) y por qué tuvo tanta repercusión? ¿Cómo se defendió Madrid en noviembre de 1936?*

**Defensa de Madrid (noviembre 1936):**
- Gobierno huye a Valencia (6 nov.) → Miaja + Vicente Rojo organizan la defensa
- Brigadas Internacionales entran en combate (8 nov.)
- Tanques soviéticos T-26 → Madrid resiste → Franco no pudo tomarlo en toda la guerra

**Guernica (26 abril 1937):**
- Legión Cóndor alemana + aviación italiana bombardean la ciudad vasca
- Día de mercado → máximas víctimas civiles
- 150-1.600 muertos (debate historiográfico)
- Guernica = símbolo de las libertades vascas → enorme impacto internacional
- Picasso pinta "Guernica" (encargo de la República) → icono universal del horror de la guerra

**Campaña del Norte (1937):** Franco conquista País Vasco + Cantabria + Asturias → se apodera de la industria norteña → equilibrio de fuerzas se rompe`,
    practice_prompt: 'Describe las dos primeras fases militares de la Guerra Civil española (1936-1937): el asedio de Madrid y la campaña del Norte. ¿Por qué Madrid resistió en noviembre de 1936? ¿Qué fue el bombardeo de Guernica y qué repercusión tuvo?',
    alert_markdown: null,
  },

  // ─── PARTE 49C: FASES MILITARES (EBRO Y FIN) ─────────────────────────────────

  {
    sort_order: 100,
    block_key: 'La Guerra Civil',
    block_slug: 'guerra-civil',
    title: 'Las Fases Militares: La Batalla del Ebro y el Fin de la Guerra (1937–1939)',
    concept_markdown: `## Las Fases Militares Finales de la Guerra Civil (1937–1939)

### Fase 3: Ofensivas Republicanas y el Frente del Este (1937–1938)

La República intentó aliviar la presión sobre el norte mediante ofensivas:
- **Batalla de Brunete (julio 1937):** ofensiva republicana al oeste de Madrid, inicial éxito que se convirtió en un sangriento empate con enormes bajas.
- **Batalla de Belchite (agosto–septiembre 1937):** ofensiva en Aragón con similares resultados.
- **Batalla de Teruel (diciembre 1937–febrero 1938):** la República tomó Teruel en pleno invierno, pero Franco la reconquistó en febrero de 1938.

### Fase 4: La Ofensiva de Aragón y la Batalla del Ebro (1938)

Tras Teruel, Franco lanzó la gran ofensiva de Aragón *(marzo–abril 1938)*: las tropas nacionales avanzaron hasta el Mediterráneo, partiendo en dos el territorio republicano el **15 de abril de 1938** al llegar a Vinaròs (Castellón).

La República respondió con la mayor batalla de la guerra: la **Batalla del Ebro (25 de julio – 16 de noviembre de 1938)**. El general **Vicente Rojo** cruzó el río Ebro con ~80.000 soldados para reconectar Cataluña con el resto de la zona republicana. Cuatro meses de combates encarnizados con enormes pérdidas en ambos lados. El Ejército Popular del Ebro fue destruido. La República quedó sin reservas.

### Fase 5: La Caída de Cataluña y el Fin de la Guerra (1939)

- **Ofensiva de Cataluña (diciembre 1938–febrero 1939):** Barcelona cayó el **26 de enero de 1939**. Cientos de miles de refugiados cruzaron la frontera hacia Francia (la **Retirada**): ~470.000 personas.
- El gobierno republicano, presidido por **Juan Negrín**, intentó resistir en la zona central (Madrid, Valencia, Murcia) esperando que el estallido de la Segunda Guerra Mundial cambiara la situación internacional.
- El **5 de marzo de 1939**, el coronel **Segismundo Casado** (apoyado por socialistas moderados y anarquistas) dio un golpe de Estado contra Negrín en Madrid, con el objetivo de negociar una paz con Franco. Franco rechazó cualquier negociación que no fuera la rendición incondicional.
- **Madrid cayó el 28 de marzo de 1939**. El 1 de abril de 1939, Franco firmó el último parte de guerra: *"En el día de hoy, cautivo y desarmado el ejército rojo, han alcanzado las tropas nacionales sus últimos objetivos militares. La guerra ha terminado."*`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fue la Batalla del Ebro (1938)? ¿Cómo terminó la Guerra Civil?*

**Batalla del Ebro (julio-nov. 1938):**
- Contexto: Franco ha partido en dos la zona republicana al llegar al Mediterráneo (abril 1938)
- La República responde: Vicente Rojo cruza el Ebro con 80.000 soldados
- Objetivo: reconectar Cataluña con el resto + demostrar capacidad de resistencia
- Resultado: 4 meses de combates → el Ejército Popular del Ebro queda destruido → la República sin reservas

**El fin (1939):**
1. Cataluña cae: Barcelona (26 enero 1939) → 470.000 refugiados huyen a Francia (la Retirada)
2. Golpe de Casado (5 marzo 1939): golpe contra Negrín en Madrid para negociar la paz → Franco exige rendición incondicional
3. Madrid cae (28 marzo 1939)
4. Último parte de guerra: 1 abril 1939`,
    practice_prompt: 'Explica la Batalla del Ebro (julio-noviembre de 1938): ¿cuál era su objetivo estratégico y cuál fue su resultado? ¿Cómo terminó la Guerra Civil? ¿Qué fue la Retirada y el golpe del coronel Casado?',
    alert_markdown: '⚠️ La Batalla del Ebro fue la **mayor batalla de la historia de España**, con unos 80.000 soldados republicanos y enormes fuerzas nacionales. Duró 4 meses (julio-noviembre 1938). Su fracaso hizo inevitable la caída de Cataluña y el fin de la guerra.',
  },

  // ─── PARTE 50A: REVOLUCIÓN SOCIAL Y TERROR ROJO ──────────────────────────────

  {
    sort_order: 101,
    block_key: 'La Guerra Civil',
    block_slug: 'guerra-civil',
    title: 'La Revolución Social en la Zona Republicana y el Terror Rojo (1936)',
    concept_markdown: `## La Revolución Social de 1936 en la Zona Republicana

El fracaso parcial del golpe en julio de 1936 desató en la zona republicana una **revolución social espontánea** que el gobierno republicano no pudo o no quiso controlar inicialmente. El poder del Estado se desintegró en milicias armadas controladas por partidos y sindicatos.

### Las Colectivizaciones

**Cataluña:** la CNT-FAI, con 1,5 millones de afiliados, fue la fuerza hegemónica. Se colectivizaron las grandes empresas industriales (textil, transporte, servicios públicos) y se crearon comunas libertarias en el campo. El **Decreto de Colectivizaciones (octubre de 1936)** de la Generalitat legalizó muchas de estas colectivizaciones.

**Aragón:** el **Consejo de Aragón**, controlado por la CNT, organizó centenares de colectividades agrarias. El Consejo fue disuelto por decreto en **agosto de 1937** por el gobierno de Negrín.

**Levante y Castilla:** colectividades agrarias de la UGT y CNT.

### El Terror Rojo

Los primeros meses de la guerra fueron también de una violencia política brutal en la retaguardia republicana. **Checas** (cárceles clandestinas controladas por milicias) ejecutaron a miles de personas acusadas de derechistas, fascistas o quintacolumnistas.

La **matanza de Paracuellos** (noviembre de 1936): entre **2.000 y 4.000 presos políticos** de las cárceles madrileñas fueron ejecutados en los alrededores de Madrid, en un operativo en el que estuvo implicado el dirigente comunista **Santiago Carrillo**.

### El Terror Blanco

En el bando nacional, las ejecuciones masivas de opositores en la retaguardia fueron igualmente brutales. Las cifras oscilan entre **50.000 y 150.000 ejecuciones** durante la guerra (incluyendo la posguerra). Las depuraciones afectaron a maestros, profesores, funcionarios, sindicalistas y políticos de izquierda.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fue la revolución social que se produjo en la zona republicana durante la Guerra Civil? ¿Qué fueron las checas y la matanza de Paracuellos?*

**La revolución social (julio-agosto 1936):**
- El Estado republicano se desintegra → milicias de partidos y sindicatos toman el control
- CNT-FAI en Cataluña: colectiviza empresas industriales + comunas libertarias en el campo
- Decreto de Colectivizaciones (oct. 1936) de la Generalitat: legaliza las colectivizaciones

**Terror rojo:**
- Checas: cárceles clandestinas de milicias → ejecuciones de derechistas y sospechosos
- Matanza de Paracuellos (nov. 1936): 2.000-4.000 presos políticos ejecutados en Madrid → implicación de Santiago Carrillo (PCE)

**Contexto:** la violencia republicana fue mayor en los primeros meses del golpe → después el gobierno fue recuperando el control → la violencia franquista fue más sistemática y prolongada (décadas)`,
    practice_prompt: 'Explica la revolución social que se produjo en la zona republicana durante los primeros meses de la Guerra Civil. ¿Qué fueron las colectivizaciones? ¿Qué fue el "terror rojo" y la matanza de Paracuellos?',
    alert_markdown: '⚠️ "Terror rojo" y "terror blanco" son conceptos simétricos pero NO equivalentes en escala ni duración: la represión franquista fue más sistemática, institucionalizada y prolongada (hasta los años 50). El "terror rojo" fue mayoritariamente espontáneo y se redujo al avanzar la guerra. Este matiz es importante para no caer en falsas equivalencias.',
  },

  // ─── PARTE 50B: GOBIERNOS REPUBLICANOS Y MAYO 1937 ───────────────────────────

  {
    sort_order: 102,
    block_key: 'La Guerra Civil',
    block_slug: 'guerra-civil',
    title: 'Los Gobiernos Republicanos de Guerra y los Sucesos de Mayo de 1937 en Barcelona',
    concept_markdown: `## Los Gobiernos Republicanos durante la Guerra Civil

### Los Tres Gobiernos de Guerra

**Gobierno de José Giral (julio–septiembre 1936):**
Entregó armas a las milicias populares. Gobierno de republicanos sin socialistas ni comunistas. Incapaz de restaurar el orden y gestionar la guerra.

**Gobierno de Francisco Largo Caballero (septiembre 1936 – mayo 1937):**
Primer gobierno con participación de socialistas, comunistas y —por primera vez en la historia de España y de Europa occidental— **cuatro ministros anarquistas de la CNT** (entre ellos la ministra de Sanidad **Federica Montseny**, primera mujer ministra de la historia española). Su objetivo era militarizar las milicias y crear un ejército regular (el *Ejército Popular de la República*).

**Gobierno de Juan Negrín (mayo 1937 – abril 1939):**
Socialista moderado, doctor en fisiología, apoyado por el PCE y la URSS. Apostó por la resistencia a ultranza esperando que el conflicto internacional (la expansión nazi) cambiara la situación. Sus **13 Puntos (mayo de 1938)** fueron un programa de paz que Franco ignoró.

### Los Sucesos de Mayo de 1937 en Barcelona

Las tensiones internas en la zona republicana entre **revolucionarios** (CNT-FAI, POUM) y **contrarrevolucionarios** (PCE, PSUC, republicanos burgueses) estallaron en Barcelona en los primeros días de mayo de 1937.

El detonante fue el intento de la Generalitat (apoyada por el PSUC comunista) de recuperar el control de la **Telefónica de Barcelona**, que estaba en manos de la CNT desde julio de 1936. El **3 de mayo de 1937**, guardias de asalto intentaron tomar el edificio de la Telefónica. La CNT y el POUM respondieron con barricadas en toda la ciudad.

Durante **cinco días de combates** en las calles de Barcelona murieron entre 400 y 500 personas. El gobierno central envió fuerzas de orden público. La CNT aceptó el cese del fuego.

**Consecuencias políticas:**
- Largo Caballero, que se negó a ilegalizar el POUM, fue forzado a dimitir y sustituido por Negrín.
- El **POUM fue ilegalizado** por el gobierno de Negrín (acusado falsamente de ser una organización trotskista al servicio del fascismo). Su líder, **Andreu Nin**, fue detenido por agentes del NKVD soviético y asesinado en junio de 1937.
- La CNT fue marginada del poder efectivo.
- El **PCE**, con el respaldo soviético, se convirtió en la fuerza hegemónica dentro de la coalición republicana.

George Orwell, que combatió en las milicias del POUM, narró estos hechos en *Homenaje a Cataluña (1938)*.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Cuáles fueron los tres gobiernos republicanos durante la Guerra Civil? ¿Qué fueron los "Sucesos de Mayo" de 1937?*

**Tres gobiernos:**
1. Giral (jul-sept 1936): entrega armas a milicias → no controla la situación
2. Largo Caballero (sept 1936-mayo 1937): incluye 4 ministros anarquistas (CNT) + Federica Montseny (1ª mujer ministra de España) → militariza las milicias → Ejército Popular
3. Negrín (mayo 1937-abril 1939): PCE + URSS → resistencia a ultranza → 13 Puntos (1938) → Franco los ignora

**Sucesos de mayo 1937:**
- CNT controla la Telefónica de Barcelona desde julio 1936
- Guardias de asalto intentan recuperarla (3 mayo 1937) → CNT + POUM ponen barricadas
- 5 días de combates → 400-500 muertos
- Consecuencias: Largo Caballero dimite → Negrín al poder → POUM ilegalizado → Andreu Nin asesinado por el NKVD → PCE hegemónico`,
    practice_prompt: '¿Cuáles fueron los tres gobiernos republicanos durante la Guerra Civil y cuáles eran sus características? Explica los "Sucesos de Mayo de 1937" en Barcelona: ¿cuál fue su causa, cómo se desarrollaron y qué consecuencias políticas tuvieron para la izquierda republicana?',
    alert_markdown: '⚠️ **Federica Montseny** (CNT, ministra de Sanidad con Largo Caballero) fue la **primera mujer ministra de la historia de España** y de toda Europa occidental. Es un dato habitual en PAU. El POUM era el partido comunista disidente (trotskista) de **Andreu Nin**, no el partido comunista oficial (PCE).',
  },

  // ─── PARTE 51: ZONA NACIONAL — FRANCO Y UNIFICACIÓN ──────────────────────────

  {
    sort_order: 103,
    block_key: 'La Guerra Civil',
    block_slug: 'guerra-civil',
    title: 'La Zona Nacional: Franco Generalísimo, la Unificación y la Construcción del Nuevo Estado',
    concept_markdown: `## La Zona Nacional: Concentración del Poder y Construcción del Nuevo Estado

### La Concentración del Poder en Franco

El bando sublevado comenzó la guerra con una **Junta de Defensa Nacional** (presidida inicialmente por el general Cabanellas) sin mando único. La muerte de Sanjurjo (20 julio 1936) dejó acéfala la conspiración.

El **21 de septiembre de 1936**, los generales sublevados se reunieron en el aeródromo de Salamanca y nombraron a **Francisco Franco Bahamonde** *Generalísimo de los Ejércitos* y *Jefe del Gobierno del Estado Español*. El decreto del **1 de octubre de 1936** le atribuyó además *"todos los poderes del nuevo Estado"*, una concentración de poder sin precedentes.

**Las razones de la elección de Franco:**
- Era el general más joven (44 años) y de mayor prestigio militar (el primer general más joven de Europa desde Napoleón).
- Comandaba el Ejército de África, la fuerza más eficaz.
- Tenía los contactos directos con Hitler y Mussolini para obtener ayuda.
- Era el más hábil políticamente de los generales: jugó sus bazas con maestría durante las semanas previas.

Franco acumuló los títulos de: *Generalísimo, Jefe del Estado, Jefe del Gobierno y Jefe Nacional del Movimiento*. El **"Caudillo"** (equivalente español del Führer y el Duce) gobernó por decreto durante casi cuatro décadas.

### La Unificación: FET y de las JONS (19 de abril de 1937)

El bando nacional estaba formado por familias políticas heterogéneas: falangistas, carlistas (Requetés), monárquicos alfonsinos, católicos de la CEDA, militares africanistas. Para construir el **partido único** del nuevo Estado, Franco promulgó el **Decreto de Unificación del 19 de abril de 1937**, que fusionó por decreto:
- La **Falange Española** (movimiento fascista fundado por José Antonio Primo de Rivera en octubre de 1933, fusilado en Alicante el **20 de noviembre de 1936**).
- La **Comunión Tradicionalista** (carlistas).

En la nueva organización, **FET y de las JONS** (*Falange Española Tradicionalista y de las Juntas de Ofensiva Nacional Sindicalista*), Franco asumió el cargo de *Jefe Nacional*. Los sectores más radicales de la Falange (los *"camisas viejas"*) y del carlismo protestaron, pero fueron neutralizados.

### La Construcción del Nuevo Estado

Desde Burgos (capital del bando nacional durante la guerra), Franco fue construyendo las instituciones del nuevo régimen:
- **Primer gobierno regular de Franco (30 de enero de 1938):** con ministros de todas las familias del régimen.
- **Fuero del Trabajo (9 de marzo de 1938):** carta laboral de inspiración fascista italiana, establecía el sindicalismo vertical (un solo sindicato que agrupaba a trabajadores y empresarios bajo control del Estado).
- **Ley de Prensa (22 de abril de 1938):** censura total de la prensa.
- **Ley de Responsabilidades Políticas (9 de febrero de 1939):** perseguía retroactivamente a todos los que hubieran *"contribuido a la subversión"* desde octubre de 1934.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Cómo concentró Franco el poder en el bando nacional? ¿Qué fue el Decreto de Unificación de 1937 y qué fue FET y de las JONS?*

**Franco Generalísimo (1 octubre 1936):**
- Reunión en Salamanca (21 sept. 1936): generales nombran a Franco
- Razones: más joven + más prestigio + manda el Ejército de África + tiene contactos con Hitler y Mussolini + es el más hábil políticamente
- Acumula: Generalísimo + Jefe del Estado + Jefe del Gobierno + Jefe Nacional del Movimiento = "Caudillo"

**Decreto de Unificación (19 abril 1937):**
- Fusiona por decreto: Falange (fascistas) + Carlistas (Comunión Tradicionalista)
- Nueva organización: FET y de las JONS → Franco como Jefe Nacional
- José Antonio ya había sido fusilado (20 noviembre 1936)
- Protesta de "camisas viejas" → neutralizados

**Nuevo Estado:**
- Fuero del Trabajo (1938): sindicalismo vertical (trabajadores + empresarios en el mismo sindicato estatal)
- Ley de Prensa (1938): censura total
- Ley de Responsabilidades Políticas (1939): persecución retroactiva desde 1934`,
    practice_prompt: '¿Por qué fueron elegido Franco como Generalísimo el 1 de octubre de 1936? ¿Qué fue el Decreto de Unificación de abril de 1937 y qué creó FET y de las JONS? Describe las primeras leyes del nuevo Estado franquista aprobadas durante la guerra.',
    alert_markdown: '⚠️ **José Antonio Primo de Rivera** (fundador de Falange, hijo del dictador) fue fusilado en Alicante el **20 de noviembre de 1936**, antes de que Franco decretara la Unificación. Franco usó intencionadamente su figura como mártir del Movimiento, manteniéndolo presente en la retórica franquista durante décadas ("el Ausente").',
  },

  // ─── PARTE 52A: NO INTERVENCIÓN Y AYUDA NAZI-FASCISTA ────────────────────────

  {
    sort_order: 104,
    block_key: 'La Guerra Civil',
    block_slug: 'guerra-civil',
    title: 'La Dimensión Internacional: El Comité de No Intervención y el Apoyo Nazi-Fascista',
    concept_markdown: `## La Dimensión Internacional de la Guerra Civil: El Comité de No Intervención y el Apoyo al Bando Nacional

### El Contexto Internacional

La Guerra Civil española se desarrolló en un contexto europeo de ascenso del fascismo (Hitler en Alemania desde 1933, Mussolini en Italia desde 1922) y de **política de apaciguamiento** de las democracias occidentales (Francia y Gran Bretaña), aterradas ante la perspectiva de una nueva guerra europea.

### El Comité de No Intervención (septiembre de 1936)

A iniciativa de Francia (gobierno del Frente Popular de Léon Blum, que inicialmente apoyó a la República pero cedió ante las presiones de Gran Bretaña) y Gran Bretaña (gobierno conservador de Baldwin y luego Chamberlain), se creó en **Londres en septiembre de 1936** el **Comité de No Intervención**, al que se adhirieron 27 países, incluyendo Alemania, Italia y la URSS.

El Comité fue una **farsa monumental**: mientras fingía controlar que ninguna potencia intervenía en España, Alemania e Italia seguían enviando tropas y material al bando franquista, y la URSS enviaba ayuda a la República. El Comité lo sabía y miraba para otro lado. Para Gran Bretaña, lo importante era evitar que el conflicto español se convirtiera en una guerra europea generalizada.

### El Apoyo al Bando Nacional: Alemania e Italia

**Alemania (Tercer Reich de Adolf Hitler):**
Hitler decidió intervenir el **25 de julio de 1936**, motivado por:
- Evitar un gobierno del Frente Popular en España (temor al "cerco" comunista).
- Probar en condiciones reales su nuevo material bélico y la eficacia de la *Blitzkrieg*.
- Distraer la atención internacional mientras consolidaba su posición en Europa central.
- Acceder a las materias primas españolas (hierro, pirita, wolframio).

Aportación alemana:
- **Legión Cóndor:** unidad aérea de ~5.000 efectivos rotativos, con los más modernos aviones de la *Luftwaffe* (cazas Messerschmitt Bf 109, bombarderos Junkers Ju-87 Stuka y Heinkel He 111). Actuó en las batallas más importantes y bombardeó Guernica.
- Tanques Panzer I, artillería antiaérea y asesores militares.
- En total, Alemania envió material valorado en ~500 millones de Reichsmarks.

**Italia (Mussolini):**
Mussolini intervino por razones ideológicas (solidaridad fascista) y estratégicas (control del Mediterráneo occidental, *"mare nostrum"* italiano):
- **Corpo Truppe Volontarie (CTV):** hasta ~70.000 soldados italianos en total, con material motorizado abundante (pero de calidad mediocre).
- Aviación, artillería, submarinos (que atacaron barcos que llevaban material soviético a la República, en la llamada *"guerra de los submarinos"*).
- Italia sufrió la humillación de la **Batalla de Guadalajara (marzo 1937)**, primera derrota italiana frente al Ejército Popular.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fue el Comité de No Intervención? ¿Por qué intervinieron Alemania e Italia en la Guerra Civil española?*

**Comité de No Intervención (sept. 1936):**
- 27 países firman, incluyendo Alemania, Italia y URSS
- En teoría: nadie interviene
- En práctica: Alemania e Italia siguen ayudando a Franco, URSS sigue ayudando a la República
- El Comité lo sabe y lo permite → "farsa monumental"
- Objetivo real de Gran Bretaña: evitar que España desencadene una guerra europea

**Alemania:**
- Motivos: evitar Frente Popular + probar la Blitzkrieg + distraer atención + materias primas
- Legión Cóndor: ~5.000 efectivos + Messerschmitt + Stuka + Heinkel → bombardean Guernica

**Italia:**
- Motivos: solidaridad fascista + control del Mediterráneo
- CTV: ~70.000 soldados (pero malos) → derrota en Guadalajara (marzo 1937)`,
    practice_prompt: '¿Qué fue el Comité de No Intervención y por qué se considera una "farsa"? ¿Cuáles fueron las razones y la aportación militar de Alemania e Italia al bando franquista durante la Guerra Civil española?',
    alert_markdown: '⚠️ La **Legión Cóndor** era una unidad AÉREA alemana, no una legión de infantería. Su nombre puede confundirse con la Legión (Tercio de Extranjeros) española. La Legión Cóndor bombardeó Guernica y fue el laboratorio de la aviación táctica de la Luftwaffe que luego usaría Hitler en la Segunda Guerra Mundial.',
  },

  // ─── PARTE 52B: URSS Y BRIGADAS INTERNACIONALES ──────────────────────────────

  {
    sort_order: 105,
    block_key: 'La Guerra Civil',
    block_slug: 'guerra-civil',
    title: 'El Apoyo Soviético, las Brigadas Internacionales y el "Oro de Moscú"',
    concept_markdown: `## El Apoyo a la República: La URSS y las Brigadas Internacionales

### La Intervención Soviética

La **Unión Soviética** de Stalin decidió intervenir en octubre de 1936, motivada por:
- Oponerse al fascismo alemán e italiano.
- Ganar influencia en España y en el movimiento comunista internacional.
- Obtener el oro del Banco de España como pago por la ayuda.

**Aportación soviética:**
- **Tanques T-26** y BT-5, superiores a los Panzer I alemanes.
- **Aviones Polikarpov I-15 e I-16** (el primer caza monoplano del mundo, llamado *"Mosca"* por los republicanos).
- **Asesores militares** (hasta ~700 en el punto álgido) que influyeron decisivamente en la estrategia republicana y en la política interna.
- **Agentes del NKVD** (policía secreta soviética) que organizaron la represión interna contra el POUM y los disidentes.

**El pago: el "Oro de Moscú"**
El gobierno de Largo Caballero envió a la URSS **510 toneladas de oro** del Banco de España (el *"oro de Moscú"*, septiembre-octubre de 1936), equivalente al **72,6% de las reservas de oro españolas**. Stalin lo cobró íntegro; la República obtuvo armamento por valor inferior.

### Las Brigadas Internacionales

Las **Brigadas Internacionales** fueron unidades de voluntarios extranjeros (comunistas, socialistas, antifascistas de todas las tendencias) organizadas por la **Internacional Comunista (Komintern)** para combatir junto a la República.
- Llegaron a España a partir de **octubre de 1936**, participando decisivamente en la defensa de Madrid.
- En total pasaron por España entre **32.000 y 40.000 voluntarios** de más de 50 países (franceses, alemanes antinazis, italianos antifascistas, británicos, norteamericanos, polacos, húngaros…).
- Las más conocidas: **Brigada Lincoln** (estadounidenses), **Brigada Garibaldi** (italianos), **Brigada Thälmann** (alemanes y austriacos).
- Fueron disueltas por el gobierno Negrín en **septiembre de 1938**, como gesto ante el Comité de No Intervención en un intento (fallido) de forzar la retirada de alemanes e italianos.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Qué fue el "oro de Moscú"? ¿Qué fueron las Brigadas Internacionales y cuál fue su papel en la defensa de la República?*

**La URSS:**
- Interviene desde octubre 1936: T-26 + aviones Polikarpov I-16 ("Mosca") + 700 asesores + agentes NKVD
- "Oro de Moscú": 510 toneladas (72,6% de las reservas del Banco de España) → pago anticipado por la ayuda
- Stalin cobra íntegro; la República recibe armamento por valor inferior → el NKVD además reprime el POUM internamente

**Brigadas Internacionales:**
- Organizadas por el Komintern (Internacional Comunista)
- 32.000-40.000 voluntarios de +50 países
- Brigada Lincoln (EE.UU.) + Garibaldi (Italia) + Thälmann (Alemania/Austria)
- Llegan oct. 1936 → defensa de Madrid (8 noviembre 1936)
- Disueltas por Negrín (sept. 1938) como gesto ante el Comité de No Intervención → sin efecto`,
    practice_prompt: '¿Por qué y cómo intervino la URSS en la Guerra Civil española? ¿Qué fue el "oro de Moscú"? ¿Qué fueron las Brigadas Internacionales, quiénes las integraban y qué papel tuvieron en la defensa de Madrid?',
    alert_markdown: null,
  },

  // ─── PARTE 52C: CONSECUENCIAS DE LA GUERRA CIVIL ─────────────────────────────

  {
    sort_order: 106,
    block_key: 'La Guerra Civil',
    block_slug: 'guerra-civil',
    title: 'Las Consecuencias de la Guerra Civil Española (1939)',
    concept_markdown: `## Las Consecuencias de la Guerra Civil (1939)

### Consecuencias Humanas

- Entre **500.000 y 1.000.000 de muertos** (combates, bombardeos, represión en ambas zonas, epidemias y hambre).
- **~500.000 exiliados** al final de la guerra (el **exilio republicano**): intelectuales, políticos, militares, obreros. Se establecieron principalmente en:
  - **Francia** (la mayoría inicial, internados en campos como Argelès-sur-Mer y Saint-Cyprien)
  - **México** (que acogió al mayor número de forma permanente gracias al presidente **Lázaro Cárdenas**)
  - Argentina, la URSS (los *"niños de la guerra"*, evacuados durante el conflicto)
- La **represión franquista de posguerra:** decenas de miles de ejecuciones entre 1939 y los años 40, campos de concentración, trabajo forzado de prisioneros en obras públicas (el Valle de los Caídos, el Canal del Bajo Guadalquivir).

### Consecuencias Materiales

- Destrucción masiva de infraestructuras, ciudades (Guernica, Belchite, Teruel), industria y agricultura.
- El PIB español en 1939 era inferior al de 1914. **La recuperación del nivel de renta de 1935 no se alcanzó hasta ~1953**.

### Consecuencias Políticas

- Instauración de la **dictadura franquista (1939–1975)**, que supuso la supresión de todos los derechos y libertades conquistados durante la República.
- La guerra española fue el **preludio y el laboratorio de la Segunda Guerra Mundial (1939–1945)**: Alemania e Italia probaron tácticas y material; la política de no intervención demostró el fracaso del apaciguamiento.
- El exilio republicano enriqueció culturalmente a México, Argentina y Francia, pero supuso una **sangría intelectual** para España: **Picasso, Buñuel, Alberti, María Zambrano, León Felipe, Pau Casals, Juan Ramón Jiménez** (Nobel de Literatura en 1956), entre miles más.`,
    worked_example_markdown: `**Pregunta tipo PAU:** *¿Cuáles fueron las principales consecuencias de la Guerra Civil española (1939)?*

**Humanas:**
- 500.000 - 1.000.000 de muertos (combates + represión + enfermedad + hambre)
- ~500.000 exiliados: Francia + México (Lázaro Cárdenas) + Argentina + URSS
- Represión franquista de posguerra: ejecuciones + campos + trabajo forzado (Valle de los Caídos)

**Materiales:**
- Destrucción de infraestructuras, ciudades, industria
- PIB de 1939 = inferior al de 1914 → recuperación del nivel de 1935 no hasta ~1953

**Políticas:**
- Dictadura franquista (1939-1975): 36 años sin libertades
- La GCE = laboratorio de la 2ª Guerra Mundial: Legión Cóndor probó la Blitzkrieg + el apaciguamiento demostró su fracaso
- Exilio = sangría intelectual: Picasso + Buñuel + Juan Ramón Jiménez (Nobel 1956) + Alberti + Zambrano…`,
    practice_prompt: 'Analiza las principales consecuencias de la Guerra Civil española (1939): humanas, materiales y políticas. ¿Qué fue el exilio republicano y a qué países fue? ¿Por qué se dice que la Guerra Civil española fue el "preludio" de la Segunda Guerra Mundial?',
    alert_markdown: '⚠️ **Juan Ramón Jiménez** (Nobel de Literatura 1956) era español exiliado en Puerto Rico. **Pablo Picasso** vivía en París desde antes de la guerra y nunca regresó mientras vivió Franco (murió en 1973). Estos son dos de los exiliados más conocidos que suelen aparecer en exámenes sobre la cultura del exilio.',
  },
]

const BATCH_SIZE = 5

async function main() {
  console.log(`Insertando ${cards.length} tarjetas del Bloque 11 (La Guerra Civil)…`)

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
    console.log(`\n✅ Bloque 11 insertado. Total filas historia_espana en tabla: ${count}`)
  }
}

main()
