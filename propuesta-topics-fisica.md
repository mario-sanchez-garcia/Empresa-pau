# Propuesta de topic_slug para ejercicios de Física (Comunidad de Madrid)

Generado a partir de `app/data/fisica.ts` (`examenesF`, 238 ejercicios reales, 2018-2026) y `curriculum_topics` filtrado por `subject = 'fisica'` en Supabase (62 temas: 57 finos ya vinculados a curriculum_content_v2 vía topic_id — ver commit de esta misma tarea — más 5 temas de resumen de bloque sin lección propia, uno por bloque).

**Esto es SOLO una propuesta para revisión — no se ha tocado `app/data/fisica.ts` ni se han aplicado los `topic_slug` a ningún ejercicio.** El `topic_id` de `curriculum_content_v2` SÍ se aplicó (57/57, ver informe de la tarea).

Cataluña (`app/data/fisica_cataluna.ts`) queda fuera de esta tarea: esquema de datos distinto e incompatible (`ejercicios`/`opciones` en vez de lista plana de preguntas), 17 ejercicios, 3 ya marcados `requiereRevision: true` en el propio archivo.

## Resumen

- Total ejercicios: **238**, en 5 bloques (`tipo`), que ya coinciden 1:1 con los 5 bloques de `curriculum_content_v2`/`curriculum_topics`
- Cada ejercicio se clasificó por dos vías: **reglas por palabra clave** sobre el enunciado + apartados (mayoría de los casos, terminología de física muy estandarizada) y **lectura manual completa** para los 17 casos que ninguna regla resolvió con claridad (marcados con nota explícita — revísalos con más atención, igual que hiciste con la sintaxis de Lengua)
- No hay ningún ejercicio sin `topic_slug` propuesto — a diferencia de "Obra leída" en Lengua, todo ejercicio de Física prueba un concepto de física identificable, aunque en unos pocos casos la identificación exacta requiere criterio experto

### Desglose de confianza por bloque

| Bloque (`tipo`) | ejercicios | alta | media | baja |
|---|---|---|---|---|
| Campo Gravitatorio (Gravitacion) | 48 | 32 | 16 | 0 |
| Campo Electromagnético (Electricidad) | 50 | 39 | 11 | 0 |
| Vibraciones y Ondas (Ondas) | 45 | 38 | 7 | 0 |
| Óptica Geométrica (Optica) | 46 | 31 | 15 | 0 |
| Física del Siglo XX (RadioactividadModerna) | 49 | 39 | 10 | 0 |
| **Total** | **238** | **179** | **59** | **0** |

## Cómo se hizo

1. **Filtrado por bloque primero**: el campo `tipo` de cada ejercicio (Gravitacion/Electricidad/Ondas/Optica/RadioactividadModerna) ya restringe la búsqueda a los 8-16 temas finos de ese único bloque de `curriculum_topics` — nunca hay que elegir entre los 57 temas completos, solo entre los de su propio bloque.
2. **Terminología estándar**: a diferencia de Lengua (frases de examen muy variadas) o Historia (fechas y nombres propios), la física de PAU usa un vocabulario muy fijo y técnico ("velocidad de escape", "fem inducida", "efecto fotoeléctrico", "ley de Snell"...) que casi siempre nombra literalmente el concepto que se está evaluando — esto hizo que el etiquetado por palabras clave funcionara mucho mejor aquí que en sintaxis de Lengua.
3. **Multi-etiqueta cuando el ejercicio realmente combina dos conceptos** (p. ej. un satélite en órbita que pide velocidad orbital Y energía mecánica en el mismo enunciado) — confianza `media` en esos casos, `alta` cuando el ejercicio prueba un único concepto claro.
4. **17 casos sin patrón de palabra clave reconocible** (mayoría en Electricidad: fem inducida por movimiento sin decir "inducción", campos de varias cargas sin nombrar la ley por su nombre, positrones/protones acelerados a velocidad relativista) se leyeron y clasificaron a mano — quedan marcados con nota explícita en su fila, y merecen tu revisión con más cuidado que el resto.
5. **18 temas finos del catálogo no aparecen en ningún ejercicio de este banco de 238** (p. ej. líneas de campo gravitatorio, efecto Doppler, modelo de Bohr, fisión/fusión nuclear) — comprobado explícitamente que no es un fallo de las reglas (no se menciona ese concepto en ningún enunciado de este archivo), simplemente esos exámenes reales de Madrid 2018-2026 no lo han preguntado todavía. No afecta al etiquetado de lo que sí existe.

## Campo Gravitatorio — `Gravitacion` (48 ejercicios)

| examen | ejercicio_id | enunciado (extracto) | topic_slug(s) propuesto(s) | confianza | nota |
|---|---|---|---|---|---|
| 2025 Ordinaria A | `f-2025-jun-1` | Eris es un planeta enano del sistema solar descubierto en enero de 2005 por un equipo del observatorio del Monte... | `velocidad-orbital`, `energia-mecanica-en-el-campo-gravitatorio`, `leyes-de-kepler` | media |  |
| 2024 Ordinaria A | `f-2024-jun-A1` | La distancia del satélite Halimede a Neptuno, planeta alrededor del cual orbita, varía entre 12 y 21 millones de km.... | `energia-mecanica-en-el-campo-gravitatorio`, `trabajo-y-caracter-conservativo-del-campo-gravitatorio` | media |  |
| 2024 Ordinaria B | `f-2024-jun-B1` | Un satélite de 200 kg de masa se mueve en una órbita cerrada alrededor de la Tierra. En un determinado... | `velocidad-orbital`, `momento-angular-y-fuerzas-centrales` | media |  |
| 2023 Ordinaria A | `f-2023-jun-A1` | Un satélite de la constelación OneWeb, de 150 kg de masa, se encuentra en una órbita circular alrededor de la... | `velocidad-orbital` | alta |  |
| 2023 Ordinaria B | `f-2023-jun-B1` | En la película Space Cowboys un amenazador satélite militar orbita alrededor de la Tierra a una altura de 1600 km... | `velocidad-orbital` | alta |  |
| 2022 Ordinaria A | `f-2022-jun-A1` | Una partícula de masa 20 kg permanece fija en el origen de coordenadas. a) Calcule el campo gravitatorio generado por... | `intensidad-del-campo-gravitatorio` | alta |  |
| 2022 Ordinaria B | `f-2022-jun-B1` | Marte posee la décima parte de la masa de la Tierra y la mitad de su diámetro. a) Encuentre la... | `velocidad-de-escape` | alta |  |
| 2021 Ordinaria A | `f-2021-jun-A1` | Una masa puntual de 50 g se encuentra situada en la posición m del plano . Calcule: a) El potencial... | `potencial-gravitatorio`, `trabajo-y-caracter-conservativo-del-campo-gravitatorio` | media |  |
| 2021 Ordinaria B | `f-2021-jun-B1` | Una sonda espacial de 3500 kg se encuentra en órbita circular alrededor de Saturno, realizando una revolución cada 36 horas.... | `velocidad-orbital`, `energia-mecanica-en-el-campo-gravitatorio` | media |  |
| 2020 Ordinaria A | `f-2020-jun-A1` | Un satélite sigue una órbita circular sincrónica (es decir, del mismo período que el de rotación del planeta) de radio... | `velocidad-orbital` | alta |  |
| 2020 Ordinaria B | `f-2020-jun-B1` | Se tiene un planeta de masa kg y radio 5500 km. Determine: a) El módulo de la aceleración de la... | `velocidad-de-escape`, `intensidad-del-campo-gravitatorio` | media |  |
| 2019 Ordinaria A | `f-2019-jun-A1` | Una masa puntual kg está situada en el punto m. a) Determine la intensidad del campo gravitatorio creado por la... | `trabajo-y-caracter-conservativo-del-campo-gravitatorio`, `intensidad-del-campo-gravitatorio` | media |  |
| 2019 Ordinaria B | `f-2019-jun-B1` | El Amazonas 5 es un satélite geoestacionario de comunicaciones de 5900 kg puesto en órbita en septiembre de 2017. Determine:... | `velocidad-orbital` | alta |  |
| 2025 Extraordinaria A | `f-2025-jul-2A` | Una nave alienígena se sitúa en una órbita circular de radio en torno a la Tierra. Los tripulantes observan que... | `velocidad-de-escape`, `velocidad-orbital` | media |  |
| 2025 Extraordinaria B | `f-2025-jul-2B` | Sean dos partículas idénticas de masas , situadas en los puntos m y m del plano .... | `trabajo-y-caracter-conservativo-del-campo-gravitatorio`, `intensidad-del-campo-gravitatorio` | media |  |
| 2021 Extraordinaria A | `f-2021-jul-A1` | Una nave espacial queda atrapada en una órbita circular alrededor de un planeta esférico desconocido. Su velocidad orbital es y... | `velocidad-orbital` | alta |  |
| 2021 Extraordinaria B | `f-2021-jul-B1` | Una partícula de masa está en el origen. La componente del campo gravitatorio creado en el punto m es .... | `intensidad-del-campo-gravitatorio` | alta |  |
| 2020 Extraordinaria A | `f-2020-jul-A1` | Calisto, satélite de Júpiter, tiene densidad y radio km. Da una revolución alrededor de Júpiter cada días.... | `energia-mecanica-en-el-campo-gravitatorio` | alta |  |
| 2020 Extraordinaria B | `f-2020-jul-B1` | La sonda Mars Reconnaissance Orbiter se situó en 2006 en una órbita circular alrededor de Marte a km de altura.... | `velocidad-orbital` | alta |  |
| 2019 Extraordinaria A | `f-2019-jul-A1` | Los satélites LAGEOS son cuerpos esféricos de masa kg en órbita circular alrededor de la Tierra a km sobre su... | `velocidad-orbital` | alta |  |
| 2019 Extraordinaria B | `f-2019-jul-B1` | El satélite Europa describe una órbita circular alrededor de Júpiter de radio km y periodo días terrestres.... | `velocidad-de-escape`, `velocidad-orbital` | media |  |
| 2018 Extraordinaria A | `f-2018-jul-A1` | La masa de un objeto en la superficie terrestre es de kg.... | `intensidad-del-campo-gravitatorio` | alta |  |
| 2018 Extraordinaria B | `f-2018-jul-B1` | Un satélite artificial de masa kg describe una órbita circular alrededor de la Tierra a km de altura.... | `velocidad-orbital` | alta |  |
| 2024 Extraordinaria A | `f-2024-jul-A1` | Un satélite de comunicaciones orbita alrededor de la Tierra en una trayectoria elíptica cuyo apogeo se encuentra a 39700 km... | `velocidad-orbital` | alta |  |
| 2024 Extraordinaria B | `f-2024-jul-B1` | Dos planetas de masas iguales orbitan en torno a una estrella. El primero tiene una órbita circular de radio 1,2·10¹¹... | `velocidad-orbital`, `energia-mecanica-en-el-campo-gravitatorio` | media |  |
| 2022 Extraordinaria A | `f-2022-jul-A1` | Una partícula de masa 20 kg permanece fija en el origen de coordenadas.... | `intensidad-del-campo-gravitatorio` | alta |  |
| 2022 Extraordinaria B | `f-2022-jul-B1` | Marte posee la décima parte de la masa de la Tierra y la mitad de su diámetro.... | `velocidad-de-escape` | alta |  |
| 2023 Extraordinaria A | `f-2023-jul-A1` | El satélite UPM-Sat2 se lanzó el 3 de septiembre de 2020 a una órbita circular con un período de 5710... | `velocidad-orbital` | alta |  |
| 2023 Extraordinaria B | `f-2023-jul-B1` | En su aproximación al planeta Fomalhaut II, el astronauta Rocannon avista Fomalhautillo según un ángulo α = 53,13° con respecto... | `ley-de-gravitacion-universal` | media | Distancia a partir de la fuerza gravitatoria total (componentes dadas) — aplicación directa de F=GMm/r². (clasificado a mano, no por palabra clave — revisar.) |
| 2018 Ordinaria A | `f-2018-jun-A1` | Dos masas m₁ = 10 kg y m₂ = 20 kg cuelgan del techo y están separadas 1 m de... | `ley-de-gravitacion-universal` | alta |  |
| 2018 Ordinaria B | `f-2018-jun-B1` | Satélite de masa 10³ kg que orbita alrededor de la Tierra en una órbita circular geoestacionaria.... | `velocidad-orbital` | alta |  |
| 2026 Modelo A | `f-2026-modelo-2A` | Consideremos el planeta extrasolar G-876d, que tiene una masa igual a 6 veces la masa de la Tierra y un... | `intensidad-del-campo-gravitatorio` | alta |  |
| 2026 Modelo B | `f-2026-modelo-2B` | Plutón es un planeta enano del sistema solar que describe una órbita con un periodo de 248 años terrestres. Sabiendo... | `leyes-de-kepler` | alta |  |
| 2025 Modelo A | `f-2025-modelo-1` | Un equipo de astronautas se dirige a un planeta de masa desconocida. Con el objetivo de poder determinar su masa... | `intensidad-del-campo-gravitatorio` | alta |  |
| 2018 Modelo A | `f-2018-modelo-A1` | Dos partículas puntuales de masas m₁ = 2 kg y m₂ = 10 kg están situadas en el eje X:... | `potencial-gravitatorio` | alta |  |
| 2018 Modelo B | `f-2018-modelo-B1` | Un sistema doble formado por una estrella y un planeta: el planeta gira en órbita circular con periodo de 210... | `introduccion-a-la-cosmologia-y-astrofisica` | alta |  |
| 2019 Modelo A | `f-2019-modelo-A1` | Un satélite de 150 kg describe una órbita circular con un periodo de 30 min cuando se mueve con una... | `velocidad-orbital` | alta |  |
| 2019 Modelo B | `f-2019-modelo-B1` | El planeta Cibeles tiene un radio Rc = 8,5·10³ km y gira en torno a una estrella Aya describiendo una... | `introduccion-a-la-cosmologia-y-astrofisica` | alta |  |
| 2020 Modelo A | `f-2020-modelo-A1` | El satélite UARS se puso en órbita en 1991 para estudiar la entrada y salida de energía en la atmósfera... | `velocidad-orbital` | alta |  |
| 2020 Modelo B | `f-2020-modelo-B1` | Unos astrónomos han descubierto un nuevo sistema solar formado por una estrella de masa 6,0·10³⁰ kg y un planeta que... | `velocidad-de-escape`, `velocidad-orbital` | media |  |
| 2021 Modelo A | `f-2021-modelo-A1` | El Sol orbita alrededor del centro galáctico siguiendo una órbita circular de radio 2,4·10¹⁷ km y periodo de 203 millones... | `velocidad-orbital` | alta |  |
| 2021 Modelo B | `f-2021-modelo-B1` | Un planeta esférico tiene una masa igual a 360 veces la masa de la Tierra, y la velocidad de escape... | `velocidad-de-escape`, `intensidad-del-campo-gravitatorio` | media |  |
| 2022 Modelo A | `f-2022-modelo-A1` | La distancia de la Tierra al Sol varía a lo largo de su órbita entre 1,52·10¹¹ m en el afelio... | `energia-mecanica-en-el-campo-gravitatorio`, `trabajo-y-caracter-conservativo-del-campo-gravitatorio` | media |  |
| 2022 Modelo B | `f-2022-modelo-B1` | En un experimento similar al de Cavendish, una pequeña esfera A de masa m se sitúa ante dos esferas B... | `ley-de-gravitacion-universal` | alta |  |
| 2023 Modelo A | `f-2023-modelo-A1` | Un satélite de 400 kg orbita alrededor de la Tierra describiendo una órbita circular a una altura de 15000 km.... | `velocidad-orbital` | alta |  |
| 2023 Modelo B | `f-2023-modelo-B1` | Dos masas m₁ = 10 kg y m₂ = 15 kg se encuentran en los puntos (0,0) m y (2,0)... | `trabajo-y-caracter-conservativo-del-campo-gravitatorio`, `intensidad-del-campo-gravitatorio` | media |  |
| 2024 Modelo A | `f-2024-modelo-A1` | La sonda Parker de la NASA describe una órbita elíptica alrededor del Sol con un afelio de 1,1·10⁸ km y... | `leyes-de-kepler` | alta |  |
| 2024 Modelo B | `f-2024-modelo-B1` | Un astronauta aterriza sobre un planeta esférico de radio 1800 km. En su superficie deja caer un objeto desde 2... | `intensidad-del-campo-gravitatorio` | alta |  |

## Campo Electromagnético — `Electricidad` (50 ejercicios)

| examen | ejercicio_id | enunciado (extracto) | topic_slug(s) propuesto(s) | confianza | nota |
|---|---|---|---|---|---|
| 2025 Ordinaria A | `f-2025-jun-2A` | Un electrón de carga y un positrón de carga se encuentran inicialmente fijos en el plano en las posiciones nm... | `movimiento-de-cargas-en-campos-uniformes` | alta |  |
| 2025 Ordinaria B | `f-2025-jun-2B` | Una espira conductora circular de radio 20 cm se en- cuentra en el seno de un campo magnético homogéneo perpendicular... | `flujo-magnetico-e-induccion-electromagnetica` | alta |  |
| 2024 Ordinaria A | `f-2024-jun-A3` | Un hilo conductor de longitud indefinida se extiende a lo largo del eje . Otro hilo de longitud indefinida paralelo... | `fuerza-magnetica-sobre-una-corriente-y-momento-sobre-una-espira` | alta |  |
| 2024 Ordinaria B | `f-2024-jun-B3` | Dos partículas situadas en los puntos mm y mm del plano poseen cargas iguales de nC. Obtenga el potencial eléctrico... | `potencial-electrico` | alta |  |
| 2023 Ordinaria A | `f-2023-jun-A3` | Tres cargas , y se encuentran situadas en los puntos del plano , y , respectivamente, tal y como se... | `intensidad-del-campo-electrico`, `trabajo-y-caracter-conservativo-del-campo-electrico` | media | Fuerza electrostática sobre una carga en presencia de otras + trabajo para traerla desde el infinito. (clasificado a mano, no por palabra clave — revisar.) |
| 2023 Ordinaria B | `f-2023-jun-B3` | Un ion de He se sitúa inicialmente en reposo dentro de una región del espacio donde existe un campo eléctrico... | `intensidad-del-campo-electrico` | alta |  |
| 2022 Ordinaria A | `f-2022-jun-A3` | La figura representa una varilla metálica de 20 cm de longitud, cuyos extremos deslizan sin rozamiento sobre unos raíles horizontales,... | `flujo-magnetico-e-induccion-electromagnetica` | media | Varilla que desliza sobre raíles en un campo magnético — fem inducida por movimiento (Faraday). (clasificado a mano, no por palabra clave — revisar.) |
| 2022 Ordinaria B | `f-2022-jun-B3` | Una carga puntual positiva está situada en el punto m del plano . En otro punto del plano se coloca... | `ley-de-coulomb` | alta |  |
| 2021 Ordinaria A | `f-2021-jun-A3` | Una carga puntual de 2 μC se encuentra situada en el origen de coordenadas. a) Aplicando el teorema de Gauss,... | `teorema-de-gauss` | alta |  |
| 2021 Ordinaria B | `f-2021-jun-B3` | Un hilo conductor rectilíneo indefinido situado a lo largo del eje transporta una corriente de 25 A en sentido positivo... | `campo-magnetico-creado-por-corrientes` | alta |  |
| 2020 Ordinaria A | `f-2020-jun-A3` | Una barra conductora, de 30 cm de longitud y paralela al eje , se mueve en el plano con una... | `flujo-magnetico-e-induccion-electromagnetica` | media | Barra conductora en movimiento dentro de un campo magnético — pide explícitamente la fem inducida. (clasificado a mano, no por palabra clave — revisar.) |
| 2020 Ordinaria B | `f-2020-jun-B3` | Se tienen cuatro cargas cuyo valor absoluto es C, situadas en los vértices de un cuadrado de lado cm, que... | `ley-de-coulomb` | alta |  |
| 2019 Ordinaria A | `f-2019-jun-A3` | Se tienen dos hilos conductores rectilíneos, indefinidos y paralelos al eje que cortan al plano en los puntos y cm.... | `campo-magnetico-creado-por-corrientes`, `fuerza-magnetica-sobre-una-corriente-y-momento-sobre-una-espira` | media | Dos hilos con corriente: campo magnético creado + fuerza por unidad de longitud entre ellos. (clasificado a mano, no por palabra clave — revisar.) |
| 2019 Ordinaria B | `f-2019-jun-B3` | Dos cargas puntuales, con valores nC y nC respectivamente, están situadas en los puntos y (coordenadas en centímetros). Determine: a)... | `potencial-electrico` | alta |  |
| 2025 Extraordinaria A | `f-2025-jul-4A` | Un espectrómetro de masas consta de un selector de velocidades y de un detector de iones. En el selector hay... | `fuerza-de-lorentz` | alta |  |
| 2025 Extraordinaria B | `f-2025-jul-4B` | Un hilo rectilíneo infinito paralelo al eje pasa por el punto cm y transporta una corriente A en el sentido... | `campo-magnetico-creado-por-corrientes` | alta |  |
| 2021 Extraordinaria A | `f-2021-jul-A3` | Se tienen tres hilos indefinidos de corriente. Los hilos de intensidades A e A son paralelos al eje y pasan... | `campo-magnetico-creado-por-corrientes` | alta |  |
| 2021 Extraordinaria B | `f-2021-jul-B3` | Un espectrómetro de masas selecciona iones positivos de oxígeno mediante un selector con campos perpendiculares y . Después pasan a... | `fuerza-de-lorentz` | alta |  |
| 2020 Extraordinaria A | `f-2020-jul-A3` | Dos cargas puntuales nC y nC están en cm y cm.... | `intensidad-del-campo-electrico` | alta |  |
| 2020 Extraordinaria B | `f-2020-jul-B3` | Una espira circular de radio cm, inicialmente en el plano , está inmersa en un campo magnético homogéneo dirigido según... | `flujo-magnetico-e-induccion-electromagnetica` | alta |  |
| 2019 Extraordinaria A | `f-2019-jul-A3` | Una carga C está en el origen y otra carga C en m.... | `intensidad-del-campo-electrico`, `trabajo-y-caracter-conservativo-del-campo-electrico` | media | Punto de campo eléctrico nulo entre dos cargas + trabajo del campo al mover un electrón. (clasificado a mano, no por palabra clave — revisar.) |
| 2019 Extraordinaria B | `f-2019-jul-B3` | Un positrón se acelera mediante una diferencia de potencial y entra en una región con un campo magnético T perpendicular... | `trabajo-y-caracter-conservativo-del-campo-electrico` | alta |  |
| 2018 Extraordinaria A | `f-2018-jul-A3` | Dos cargas positivas e iguales situadas en m y m generan en m un campo de módulo .... | `trabajo-y-caracter-conservativo-del-campo-electrico` | alta |  |
| 2018 Extraordinaria B | `f-2018-jul-B3` | Dos hilos rectilíneos indefinidos y paralelos al eje están en el plano . Uno pasa por cm con A en... | `campo-magnetico-creado-por-corrientes` | alta |  |
| 2024 Extraordinaria A | `f-2024-jul-A3` | Una partícula con carga 2 nC está situada en el origen de coordenadas y una segunda partícula con carga 4... | `intensidad-del-campo-electrico`, `trabajo-y-caracter-conservativo-del-campo-electrico` | media | Campo eléctrico de dos cargas + punto de fuerza nula + trabajo para traer una carga desde el infinito. (clasificado a mano, no por palabra clave — revisar.) |
| 2024 Extraordinaria B | `f-2024-jul-B3` | Dos hilos indefinidos paralelos al eje z llevan intensidades iguales I₁ = I₂ = 2 A y cortan el plano... | `campo-magnetico-creado-por-corrientes` | alta |  |
| 2022 Extraordinaria A | `f-2022-jul-A3` | Una varilla metálica de 20 cm de longitud cuyos extremos deslizan sobre unos raíles horizontales. La varilla tiene velocidad v... | `flujo-magnetico-e-induccion-electromagnetica` | alta |  |
| 2022 Extraordinaria B | `f-2022-jul-B3` | Una carga puntual positiva está situada en el punto (3, 4) m del plano xy. En otro punto del plano... | `intensidad-del-campo-electrico`, `potencial-electrico` | media | Dos cargas cuyo campo se anula en un punto + valor del potencial en ese punto. (clasificado a mano, no por palabra clave — revisar.) |
| 2023 Extraordinaria A | `f-2023-jul-A3` | Una carga situada en un punto del plano xy da lugar a un potencial de 54 V y a un... | `trabajo-y-caracter-conservativo-del-campo-electrico` | alta |  |
| 2023 Extraordinaria B | `f-2023-jul-B3` | Dos hilos rectilíneos indefinidos, paralelos al eje y, están en x = −0,1 m y x = 0,1 m. El... | `campo-magnetico-creado-por-corrientes` | alta |  |
| 2018 Ordinaria A | `f-2018-jun-A3` | Campo magnético uniforme B = −B₀k̂ con B₀ = 0,3 T. En el plano xy hay una espira rectangular con... | `flujo-magnetico-e-induccion-electromagnetica` | alta |  |
| 2018 Ordinaria B | `f-2018-jun-B3` | Carga q₁ = 6 μC situada en el origen de coordenadas.... | `trabajo-y-caracter-conservativo-del-campo-electrico` | alta |  |
| 2026 Modelo A | `f-2026-modelo-3A` | Una partícula con carga nC está situada en el punto m del plano . Otra partícula con carga nC está... | `potencial-electrico`, `trabajo-y-caracter-conservativo-del-campo-electrico` | media |  |
| 2026 Modelo B | `f-2026-modelo-3B` | Una espira cuadrada de lado cm está situada en el plano y penetra en un campo magnético uniforme con una... | `flujo-magnetico-e-induccion-electromagnetica` | alta |  |
| 2025 Modelo A | `f-2025-modelo-2A` | Sea una distribución de tres cargas puntuales fijas, situadas en los vértices de un triángulo equilátero, en el plano :... | `ley-de-coulomb` | alta |  |
| 2025 Modelo B | `f-2025-modelo-2B` | Un hilo rectilíneo infinito situado paralelo al eje , que pasa por el punto cm, transporta una corriente A en... | `fuerza-magnetica-sobre-una-corriente-y-momento-sobre-una-espira`, `campo-magnetico-creado-por-corrientes` | media |  |
| 2018 Modelo A | `f-2018-modelo-A3` | Una carga puntual q = 5 nC está situada en el centro de una esfera de radio R = 10... | `trabajo-y-caracter-conservativo-del-campo-electrico` | alta |  |
| 2018 Modelo B | `f-2018-modelo-B3` | Una varilla conductora desliza sin rozamiento por dos alambres conductores paralelos separados L = 5 cm, cerrando un circuito con... | `flujo-magnetico-e-induccion-electromagnetica` | alta |  |
| 2019 Modelo A | `f-2019-modelo-A3` | Un hilo conductor indefinido situado a lo largo del eje z transporta una corriente de 20 mA en sentido positivo... | `campo-magnetico-creado-por-corrientes` | alta |  |
| 2019 Modelo B | `f-2019-modelo-B3` | Considérese una carga puntual q en el origen de coordenadas.... | `teorema-de-gauss` | alta |  |
| 2020 Modelo A | `f-2020-modelo-A3` | Un electrón, situado inicialmente en el origen de coordenadas, se mueve con una velocidad inicial v₀ = 2î m s⁻¹,... | `movimiento-de-cargas-en-campos-uniformes` | alta |  |
| 2020 Modelo B | `f-2020-modelo-B3` | Dos cargas puntuales de +10 nC y −10 nC se encuentran situadas en el plano xy en las posiciones (0,−6)... | `trabajo-y-caracter-conservativo-del-campo-electrico` | alta |  |
| 2021 Modelo A | `f-2021-modelo-A3` | Dos cargas puntuales iguales de 5 nC se encuentran en el plano (x,y) en los puntos (0,3) m y (0,−3)... | `intensidad-del-campo-electrico` | alta |  |
| 2021 Modelo B | `f-2021-modelo-B3` | En una región del espacio existe un campo magnético uniforme de 0,5 T perpendicular al plano del papel. Se sitúa... | `flujo-magnetico-e-induccion-electromagnetica` | media | Varilla en un circuito en U dentro de un campo magnético — velocidad necesaria para inducir una corriente dada. (clasificado a mano, no por palabra clave — revisar.) |
| 2022 Modelo A | `f-2022-modelo-A3` | Dos hilos indefinidos, paralelos al eje z, están recorridos por una intensidad I = 2 A. El hilo 1 corta... | `campo-magnetico-creado-por-corrientes` | alta |  |
| 2022 Modelo B | `f-2022-modelo-B3` | Una espira cuadrada de lado a = 30 cm penetra con velocidad constante v = 3î cm s⁻¹ en una... | `flujo-magnetico-e-induccion-electromagnetica` | alta |  |
| 2023 Modelo A | `f-2023-modelo-A3` | Una corteza esférica hueca de radio 3 cm, centrada en el origen, está cargada con densidad superficial homogénea σ =... | `trabajo-y-caracter-conservativo-del-campo-electrico` | alta |  |
| 2023 Modelo B | `f-2023-modelo-B3` | Por un hilo rectilíneo infinito sobre el eje x circula una corriente de 3 A en sentido positivo. Una segunda... | `campo-magnetico-creado-por-corrientes` | alta |  |
| 2024 Modelo A | `f-2024-modelo-A3` | Dos cargas de 2 nC cada una están fijas en (0,0) m y (4,0) m del plano xy.... | `trabajo-y-caracter-conservativo-del-campo-electrico`, `intensidad-del-campo-electrico` | media | Trabajo del campo para traer una carga desde el infinito + punto de fuerza neta nula. (clasificado a mano, no por palabra clave — revisar.) |
| 2024 Modelo B | `f-2024-modelo-B3` | Por un solenoide infinitamente largo de 250 espiras por metro, con eje en z, circula una corriente variable en el... | `flujo-magnetico-e-induccion-electromagnetica` | alta |  |

## Vibraciones y Ondas — `Ondas` (45 ejercicios)

| examen | ejercicio_id | enunciado (extracto) | topic_slug(s) propuesto(s) | confianza | nota |
|---|---|---|---|---|---|
| 2025 Ordinaria A | `f-2025-jun-3A` | Una ballena sumergida en el mar a una cierta profundidad emite un potente sonido grave de 60 Hz y 25... | `el-sonido-velocidad-y-cualidades` | alta |  |
| 2024 Ordinaria A | `f-2024-jun-A2` | Por una cuerda tensa dispuesta a lo largo del eje se propaga, a una velocidad de 200 m s en... | `movimiento-armonico-simple-mas-elongacion-y-ecuacion` | alta |  |
| 2024 Ordinaria B | `f-2024-jun-B2` | El campanario de una iglesia medieval, situado a 35 m de altura, consta de 4 campanas. Cada una de ellas... | `el-sonido-velocidad-y-cualidades` | alta |  |
| 2023 Ordinaria A | `f-2023-jun-A2` | A lo largo de una cuerda se propaga en el sentido una onda transversal. El periodo de oscilación y la... | `movimiento-armonico-simple-mas-elongacion-y-ecuacion` | alta |  |
| 2023 Ordinaria B | `f-2023-jun-B2` | Un observador que se encuentra a 3 m de una fuente puntual sonora que emite en todas direcciones mide un... | `el-sonido-velocidad-y-cualidades` | alta |  |
| 2022 Ordinaria A | `f-2022-jun-A2` | Por una cuerda dispuesta a lo largo del eje viaja una onda armónica que desplaza los elementos de la cuerda... | `ecuacion-de-una-onda-armonica` | alta |  |
| 2022 Ordinaria B | `f-2022-jun-B2` | Un foco sonoro de potencia se coloca a una altura sobre el suelo, como ilustra la figura. El nivel de... | `el-sonido-velocidad-y-cualidades` | alta |  |
| 2021 Ordinaria A | `f-2021-jun-A2` | Al explotar, un cohete de fuegos artificiales genera una onda sonora esférica con una potencia sonora de 20 mW. Un... | `el-sonido-velocidad-y-cualidades` | alta |  |
| 2021 Ordinaria B | `f-2021-jun-B2` | El valor del campo eléctrico asociado a una onda electromagnética que se propaga en un medio material en la dirección... | `ecuacion-de-una-onda-armonica` | alta |  |
| 2020 Ordinaria A | `f-2020-jun-A2` | Una onda armónica unidimensional, que se propaga en un medio con una velocidad de 400 m s, está descrita por... | `ecuacion-de-una-onda-armonica` | alta |  |
| 2020 Ordinaria B | `f-2020-jun-B2` | A una distancia de 10 m, el nivel de intensidad sonora producida por un foco puntual es de 20 dB.... | `el-sonido-velocidad-y-cualidades` | alta |  |
| 2019 Ordinaria A | `f-2019-jun-A2` | Un detector situado a cierta distancia de una fuente sonora puntual mide un nivel de intensidad sonora de 80 dB.... | `el-sonido-velocidad-y-cualidades`, `energia-e-intensidad-de-una-onda` | media |  |
| 2019 Ordinaria B | `f-2019-jun-B2` | Una onda armónica transversal de frecuencia Hz y longitud de onda m se propaga en el sentido positivo del eje... | `movimiento-armonico-simple-mas-elongacion-y-ecuacion` | alta |  |
| 2025 Extraordinaria A | `f-2025-jul-3A` | Un muelle de constante elástica tiene uno de sus extremos unido a una pared y el otro a un bloque... | `dinamica-del-mas-fuerza-recuperadora` | alta |  |
| 2021 Extraordinaria A | `f-2021-jul-A2` | Anacleto graba con un teléfono inteligente, a través de una pared, una conversación situada a m. Por efecto de la... | `el-sonido-velocidad-y-cualidades` | alta |  |
| 2021 Extraordinaria B | `f-2021-jul-B2` | Una onda transversal se propaga por una cuerda en el sentido positivo del eje . En los instantes s y... | `ecuacion-de-una-onda-armonica` | alta |  |
| 2020 Extraordinaria A | `f-2020-jul-A2` | Un violín emite ondas sonoras con una potencia de W al tocar la nota Fa de Hz.... | `el-sonido-velocidad-y-cualidades` | alta |  |
| 2020 Extraordinaria B | `f-2020-jul-B2` | Un oscilador de frecuencia Hz genera en una cuerda una onda transversal que se propaga en sentido positivo del eje... | `ecuacion-de-una-onda-armonica` | alta |  |
| 2019 Extraordinaria A | `f-2019-jul-A2` | Un detector situado a m de una sirena mide dB. Suponga que la sirena emite como fuente puntual.... | `el-sonido-velocidad-y-cualidades` | alta |  |
| 2019 Extraordinaria B | `f-2019-jul-B2` | Una onda transversal que se propaga por el eje viene dada por en unidades SI.... | `ecuacion-de-una-onda-armonica` | alta |  |
| 2018 Extraordinaria A | `f-2018-jul-A2` | El nivel de intensidad sonora de la sirena de un barco es dB a m. Suponga que la sirena es... | `el-sonido-velocidad-y-cualidades` | alta |  |
| 2018 Extraordinaria B | `f-2018-jul-B2` | Una onda armónica transversal de periodo s se propaga en el sentido positivo del eje . En , , con... | `ecuacion-de-una-onda-armonica`, `velocidad-y-aceleracion-en-el-mas` | media |  |
| 2024 Extraordinaria A | `f-2024-jul-A2` | Dos focos sonoros puntuales F₁ y F₂ están situados en las posiciones (0, 3) m y (4, 0) m del... | `el-sonido-velocidad-y-cualidades` | alta |  |
| 2024 Extraordinaria B | `f-2024-jul-B2` | En la figura se representa la elongación de una onda transversal en t = 0 en función de la posición... | `ecuacion-de-una-onda-armonica` | alta |  |
| 2022 Extraordinaria A | `f-2022-jul-A2` | Por una cuerda dispuesta a lo largo del eje x viaja una onda armónica. Los elementos A (xA = 0... | `ecuacion-de-una-onda-armonica` | media | Onda en una cuerda: pide la velocidad de propagación y la expresión matemática de la onda. (clasificado a mano, no por palabra clave — revisar.) |
| 2022 Extraordinaria B | `f-2022-jul-B2` | Un foco sonoro de potencia P se coloca a una altura h sobre el suelo. El nivel de intensidad vale... | `el-sonido-velocidad-y-cualidades` | alta |  |
| 2023 Extraordinaria A | `f-2023-jul-A2` | Por una cuerda dispuesta a lo largo del eje x viaja una onda armónica transversal con velocidad de propagación v... | `ecuacion-de-una-onda-armonica` | alta |  |
| 2023 Extraordinaria B | `f-2023-jul-B2` | Dos focos sonoros puntuales F₁ y F₂ están respectivamente en los puntos (−6, 0) m y (6, 0) m. En... | `el-sonido-velocidad-y-cualidades` | alta |  |
| 2018 Ordinaria A | `f-2018-jun-A2` | Dos altavoces de 60 W y 40 W de potencia están situados respectivamente en los puntos (0, 0, 0) y... | `el-sonido-velocidad-y-cualidades` | alta |  |
| 2018 Ordinaria B | `f-2018-jun-B2` | Onda armónica transversal que se propaga en el sentido positivo del eje x. De las gráficas se obtiene: amplitud 3... | `ecuacion-de-una-onda-armonica` | alta |  |
| 2025 Modelo A | `f-2025-modelo-3A` | Sean dos fuentes sonoras puntuales de potencias y separadas 8 m. La suma de sus potencias es de 50 W.... | `el-sonido-velocidad-y-cualidades` | alta |  |
| 2018 Modelo A | `f-2018-modelo-A2` | Disponemos de n altavoces iguales que emiten como fuentes puntuales. En un punto P situado a una distancia r, el... | `el-sonido-velocidad-y-cualidades` | alta |  |
| 2018 Modelo B | `f-2018-modelo-B2` | En el extremo izquierdo de una cuerda tensa y horizontal se aplica un movimiento armónico simple perpendicular a la cuerda,... | `ecuacion-de-una-onda-armonica` | alta |  |
| 2019 Modelo A | `f-2019-modelo-A2` | En una mina a cielo abierto se provoca una explosión de forma que un detector situado a 20 m del... | `el-sonido-velocidad-y-cualidades`, `energia-e-intensidad-de-una-onda` | media |  |
| 2019 Modelo B | `f-2019-modelo-B2` | Una onda armónica transversal se propaga por una cuerda tensa en el sentido positivo del eje y con longitud de... | `ecuacion-de-una-onda-armonica` | alta |  |
| 2020 Modelo A | `f-2020-modelo-A2` | Una onda armónica unidimensional se propaga a lo largo del sentido positivo del eje x con una velocidad de propagación... | `ecuacion-de-una-onda-armonica` | alta |  |
| 2020 Modelo B | `f-2020-modelo-B2` | Se mide el nivel de intensidad sonora de una sirena, considerada foco puntual, a una distancia r, alcanzando un valor... | `el-sonido-velocidad-y-cualidades`, `energia-e-intensidad-de-una-onda` | media |  |
| 2021 Modelo A | `f-2021-modelo-A2` | La potencia media transferida por una onda armónica en una cuerda viene dada por P = ½μω²A²v, donde μ es... | `energia-e-intensidad-de-una-onda`, `ecuacion-de-una-onda-armonica` | media |  |
| 2021 Modelo B | `f-2021-modelo-B2` | La gráfica adjunta representa las curvas de umbral de audición y umbral de dolor del oído humano medio en función... | `el-sonido-velocidad-y-cualidades` | alta |  |
| 2022 Modelo A | `f-2022-modelo-A2` | Una onda transversal que se propaga en el sentido positivo del eje x, con velocidad de propagación 4/3 m s⁻¹,... | `ecuacion-de-una-onda-armonica` | alta |  |
| 2022 Modelo B | `f-2022-modelo-B2` | En el centro de una pista de circo circular hay un sonómetro. Un faquir actúa a 5 m del centro... | `el-sonido-velocidad-y-cualidades` | alta |  |
| 2023 Modelo A | `f-2023-modelo-A2` | Una onda transversal se propaga en el sentido negativo del eje x con velocidad 2 m s⁻¹. En el origen... | `ecuacion-de-una-onda-armonica` | alta |  |
| 2023 Modelo B | `f-2023-modelo-B2` | Un foco sonoro puntual emite ondas esféricas: a una distancia desconocida x el nivel de intensidad es 60 dB, y... | `el-sonido-velocidad-y-cualidades` | alta |  |
| 2024 Modelo A | `f-2024-modelo-A2` | Un objeto de masa desconocida cuelga de un muelle de constante elástica 750 N m⁻¹, oscilando según el eje y... | `ondas-definicion-y-tipos` | alta |  |
| 2024 Modelo B | `f-2024-modelo-B2` | Un foco sonoro puntual F₁ emite ondas esféricas: el nivel de intensidad percibido por un observador a 3 m es... | `el-sonido-velocidad-y-cualidades`, `energia-e-intensidad-de-una-onda` | media |  |

## Óptica Geométrica — `Optica` (46 ejercicios)

| examen | ejercicio_id | enunciado (extracto) | topic_slug(s) propuesto(s) | confianza | nota |
|---|---|---|---|---|---|
| 2025 Ordinaria B | `f-2025-jun-3B` | Considere la imagen formada por una lente delgada de distancia focal de un objeto situado a una distancia a la... | `aumento-lateral-en-lentes-y-espejos`, `lentes-delgadas-ecuacion-fundamental` | media |  |
| 2024 Ordinaria A | `f-2024-jun-A4` | Un objeto de 4 mm de altura está situado 20 cm a la izquierda de una lente delgada. La imagen... | `lentes-delgadas-ecuacion-fundamental` | alta |  |
| 2024 Ordinaria B | `f-2024-jun-B4` | El prisma de sección triangular mostrado en la figura está hecho de un material con índice de refracción np. Se... | `reflexion-total-y-angulo-limite`, `refraccion-y-ley-de-snell` | media |  |
| 2023 Ordinaria A | `f-2023-jun-A4` | Un objeto de 2 cm de altura se sitúa a 18 cm a la izquierda de una pantalla. Entre la... | `lentes-delgadas-ecuacion-fundamental` | alta |  |
| 2023 Ordinaria B | `f-2023-jun-B4` | Un rayo de luz incide sobre la cara izquierda del prisma de la figura, el cual está construido con un... | `lentes-delgadas-ecuacion-fundamental`, `reflexion-total-y-angulo-limite`, `refraccion-y-ley-de-snell` | media |  |
| 2022 Ordinaria A | `f-2022-jun-A4` | Dos lentes convergentes idénticas están separadas 16 cm. Cuando un objeto se sitúa a una cierta distancia a la izquierda... | `lentes-delgadas-ecuacion-fundamental` | alta |  |
| 2022 Ordinaria B | `f-2022-jun-B4` | Una lámina de vidrio se halla sobre un líquido de índice de refracción desconocido. La longitud de onda de la... | `refraccion-y-ley-de-snell` | alta |  |
| 2021 Ordinaria A | `f-2021-jun-A4` | Un objeto vertical de 2 mm de altura se encuentra situado 15 cm a la izquierda de una lente convergente... | `lentes-delgadas-ecuacion-fundamental` | alta |  |
| 2021 Ordinaria B | `f-2021-jun-B4` | Un rayo láser, que emite luz de longitud de onda de 488 nm en el vacío, incide desde el aire... | `reflexion-total-y-angulo-limite`, `refraccion-y-ley-de-snell` | media |  |
| 2020 Ordinaria A | `f-2020-jun-A4` | Un objeto está situado en una posición s1 a la izquierda de una lente convergente de distancia focal 50 mm,... | `lentes-delgadas-ecuacion-fundamental`, `aumento-lateral-en-lentes-y-espejos` | media | Lente convergente con imagen de tamaño doble (real e virtual) — ecuación de la lente + aumento lateral. (clasificado a mano, no por palabra clave — revisar.) |
| 2020 Ordinaria B | `f-2020-jun-B4` | Una placa de vidrio de 4 cm de espesor y de índice de refracción 1,5 se encuentra sumergida entre dos... | `reflexion-total-y-angulo-limite`, `refraccion-y-ley-de-snell` | media |  |
| 2019 Ordinaria A | `f-2019-jun-A4` | a) Determine a qué distancia debe colocarse un objeto delante de una lente convergente de 0,30 m de distancia focal,... | `lentes-delgadas-ecuacion-fundamental` | alta |  |
| 2019 Ordinaria B | `f-2019-jun-B4` | Un rayo de luz se propaga según muestra el esquema de la figura. Primero incide con un ángulo i₁ desde... | `refraccion-y-ley-de-snell` | alta |  |
| 2025 Extraordinaria B | `f-2025-jul-3B` | Se sitúa a la izquierda de una lente convergente un objeto de cm de altura, formándose una imagen real de... | `lentes-delgadas-ecuacion-fundamental` | alta |  |
| 2021 Extraordinaria A | `f-2021-jul-A4` | Sistema óptico formado por dos lentes convergentes: una lente A de distancia focal y otra lente B, situada cm a... | `lentes-delgadas-ecuacion-fundamental` | alta |  |
| 2021 Extraordinaria B | `f-2021-jul-B4` | Dos medios A y B tienen índices y . Un rayo de frecuencia Hz incide desde A hacia B. El... | `reflexion-total-y-angulo-limite`, `refraccion-y-ley-de-snell` | media |  |
| 2020 Extraordinaria A | `f-2020-jul-A4` | Sobre la cara A de un prisma transparente incide perpendicularmente desde el aire un rayo de luz a cm del... | `refraccion-y-ley-de-snell` | alta |  |
| 2020 Extraordinaria B | `f-2020-jul-B4` | Determine las posiciones donde debe colocarse un objeto real a la izquierda de una lente convergente de potencia dioptrías para... | `lentes-delgadas-ecuacion-fundamental` | alta |  |
| 2019 Extraordinaria A | `f-2019-jul-A4` | Una lente convergente de cm de distancia focal forma la imagen de un objeto de tamaño cm. Se quiere que... | `lentes-delgadas-ecuacion-fundamental` | media | Lente convergente, distancia focal y posición de la imagen — ecuación fundamental de la lente. (clasificado a mano, no por palabra clave — revisar.) |
| 2019 Extraordinaria B | `f-2019-jul-B4` | Desde lo alto de un trampolín, Carlos ve a Laura en el fondo de la piscina mirando con un ángulo... | `reflexion-total-y-angulo-limite` | alta |  |
| 2018 Extraordinaria A | `f-2018-jul-A4` | Un sistema óptico centrado está formado por dos lentes delgadas divergentes iguales, de distancia focal cm, separadas cm. Un objeto... | `lentes-delgadas-ecuacion-fundamental` | alta |  |
| 2018 Extraordinaria B | `f-2018-jul-B4` | Un material transparente de índice está en aire y limitado por dos superficies planas no paralelas que forman un ángulo... | `reflexion-total-y-angulo-limite` | alta |  |
| 2024 Extraordinaria A | `f-2024-jul-A4` | Dos cristales de grosor 10 cm e índices de refracción n₁ = 1,40 y n₂ = 1,50 están separados por... | `refraccion-y-ley-de-snell` | alta |  |
| 2024 Extraordinaria B | `f-2024-jul-B4` | Un objeto se encuentra a una distancia de 4 m de una pantalla. Entre el objeto y la pantalla se... | `lentes-delgadas-ecuacion-fundamental` | alta |  |
| 2022 Extraordinaria A | `f-2022-jul-A4` | Dos lentes convergentes idénticas están separadas 16 cm. Cuando un objeto se sitúa a cierta distancia de la primera lente,... | `lentes-delgadas-ecuacion-fundamental` | alta |  |
| 2022 Extraordinaria B | `f-2022-jul-B4` | Una lámina de vidrio se halla sobre un líquido de índice desconocido. La longitud de onda de la luz en... | `refraccion-y-ley-de-snell` | alta |  |
| 2023 Extraordinaria A | `f-2023-jul-A4` | Un observador está situado al borde de un estanque de profundidad H = 2 m. Su visual está a H'... | `refraccion-y-ley-de-snell` | alta |  |
| 2023 Extraordinaria B | `f-2023-jul-B4` | Un objeto situado 30 cm a la izquierda de una lente produce una imagen con un aumento lateral de −2.... | `aumento-lateral-en-lentes-y-espejos`, `lentes-delgadas-ecuacion-fundamental` | media |  |
| 2018 Ordinaria A | `f-2018-jun-A4` | Un sistema óptico está constituido por dos lentes separadas 50 cm. La primera es de 10 dioptrías y la segunda... | `lentes-delgadas-ecuacion-fundamental` | alta |  |
| 2018 Ordinaria B | `f-2018-jun-B4` | En un medio de índice de refracción n₁ = 1 se propaga un rayo luminoso de frecuencia f₁ = 6·10¹⁴... | `refraccion-y-ley-de-snell` | alta |  |
| 2026 Modelo A | `f-2026-modelo-1` | Un sistema óptico está compuesto por un foco luminoso, un objeto iluminado por éste, una lente y una pantalla. Se... | `aumento-lateral-en-lentes-y-espejos`, `lentes-delgadas-ecuacion-fundamental` | media |  |
| 2025 Modelo B | `f-2025-modelo-3B` | Se desea fabricar un espejo convexo tal que, al situar un objeto a la izquierda del espejo a 12 cm... | `reflexion-de-la-luz-y-espejos` | alta |  |
| 2018 Modelo A | `f-2018-modelo-A4` | Una lente convergente forma de un objeto real una imagen real aumentada dos veces. Al desplazar el objeto 20 cm... | `lentes-delgadas-ecuacion-fundamental` | alta |  |
| 2018 Modelo B | `f-2018-modelo-B4` | Sobre un material transparente limitado por dos superficies planas que forman un ángulo de 60°, incide desde el aire un... | `refraccion-y-ley-de-snell` | alta |  |
| 2019 Modelo A | `f-2019-modelo-A4` | Una persona con presbicia (vista cansada) tiene su punto próximo situado a 1 m y quiere leer a una distancia... | `lentes-delgadas-ecuacion-fundamental` | alta |  |
| 2019 Modelo B | `f-2019-modelo-B4` | Un pez se encuentra dentro del agua de un estanque observando lo que hay fuera del agua. El índice de... | `refraccion-y-ley-de-snell` | alta |  |
| 2020 Modelo A | `f-2020-modelo-A4` | Un objeto real está situado 20 cm delante de una lente delgada planoconvexa de 10 dioptrías de potencia e índice... | `defectos-visuales-e-instrumentos-opticos`, `lentes-delgadas-ecuacion-fundamental`, `refraccion-y-ley-de-snell` | media |  |
| 2020 Modelo B | `f-2020-modelo-B4` | Un rayo de luz monocromático que se propaga por el medio 1 (n₁ = 1,6) con longitud de onda 460... | `reflexion-total-y-angulo-limite`, `refraccion-y-ley-de-snell` | media |  |
| 2021 Modelo A | `f-2021-modelo-A4` | Un sistema óptico está formado por dos lentes convergentes idénticas de distancia focal 20 cm, separadas una cierta distancia desconocida.... | `lentes-delgadas-ecuacion-fundamental` | alta |  |
| 2021 Modelo B | `f-2021-modelo-B4` | Sobre la cara AB de un prisma incide perpendicularmente desde el aire un haz de luz monocromática de frecuencia 4,6·10¹⁴... | `refraccion-y-ley-de-snell` | alta |  |
| 2022 Modelo A | `f-2022-modelo-A4` | Se sitúa un objeto a la izquierda de una lente convergente, colocado verticalmente sobre el eje óptico. Determine el aumento... | `aumento-lateral-en-lentes-y-espejos`, `lentes-delgadas-ecuacion-fundamental` | media |  |
| 2022 Modelo B | `f-2022-modelo-B4` | Un haz de luz con dos rayos monocromáticos incide desde el aire con ángulo de 40° sobre un vidrio de... | `refraccion-y-ley-de-snell` | alta |  |
| 2023 Modelo A | `f-2023-modelo-A4` | A 15 cm a la izquierda de una lente se sitúa un objeto, cuya imagen se forma 30 cm a... | `aumento-lateral-en-lentes-y-espejos`, `lentes-delgadas-ecuacion-fundamental` | media |  |
| 2023 Modelo B | `f-2023-modelo-B4` | Un rayo de luz de frecuencia f = 2,94·10¹⁴ Hz incide desde el medio A hacia el medio B, reflejándose... | `refraccion-y-ley-de-snell` | alta |  |
| 2024 Modelo A | `f-2024-modelo-A4` | Un espejo esférico cóncavo de 60 cm de radio de curvatura tiene situado a 80 cm frente a él, sobre... | `reflexion-de-la-luz-y-espejos` | alta |  |
| 2024 Modelo B | `f-2024-modelo-B4` | Un rayo de luz incide desde el aire sobre la superficie lateral de un paralelepípedo a mitad de altura. La... | `reflexion-total-y-angulo-limite`, `refraccion-y-ley-de-snell` | media |  |

## Física del Siglo XX — `RadioactividadModerna` (49 ejercicios)

| examen | ejercicio_id | enunciado (extracto) | topic_slug(s) propuesto(s) | confianza | nota |
|---|---|---|---|---|---|
| 2025 Ordinaria A | `f-2025-jun-4A` | Las moléculas de ozono absorben luz ultravioleta (UV) de alta energía, lo que evita que llegue a la superficie de... | `hipotesis-de-planck-y-cuantizacion-de-la-energia` | alta |  |
| 2025 Ordinaria B | `f-2025-jun-4B` | El mineral de cuarzo (SiO) sobre la superficie de la Tierra contiene impurezas de aluminio, con una cantidad de 0,1... | `ley-de-desintegracion-radiactiva` | alta |  |
| 2024 Ordinaria A | `f-2024-jun-A5` | Una placa de cobalto se expone a luz de una determinada intensidad y de frecuencia igual a 1,2 veces la... | `efecto-fotoelectrico` | alta |  |
| 2024 Ordinaria B | `f-2024-jun-B5` | Dos muestras, cada una de un radioisótopo distinto (radioisótopo 1 y radioisótopo 2) contienen en el momento de su preparación... | `ley-de-desintegracion-radiactiva`, `efecto-fotoelectrico` | media |  |
| 2023 Ordinaria A | `f-2023-jun-A5` | Se sospecha que un acuífero recibe aportes intermitentes de radón (Rn). Para comprobarlo, se toman semanalmente medidas de la actividad... | `ley-de-desintegracion-radiactiva` | alta |  |
| 2023 Ordinaria B | `f-2023-jun-B5` | Para estudiar el efecto fotoeléctrico se registra la intensidad de corriente entre un cierto metal emisor de fotoelectrones y una... | `ley-de-desintegracion-radiactiva`, `efecto-fotoelectrico` | media |  |
| 2022 Ordinaria A | `f-2022-jun-A5` | Una muestra contiene inicialmente una masa de 30 mg de Po. Sabiendo que su período de semidesintegración es de 138,38... | `ley-de-desintegracion-radiactiva` | alta |  |
| 2022 Ordinaria B | `f-2022-jun-B5` | Un electrón relativista ha llegado a adquirir una energía cinética equivalente a la energía de un fotón de m de... | `hipotesis-de-planck-y-cuantizacion-de-la-energia` | alta |  |
| 2021 Ordinaria A | `f-2021-jun-A5` | Un material posee un sistema de tres niveles energéticos electrónicos (nivel fundamental, primer nivel, y segundo nivel). Para que un... | `hipotesis-de-planck-y-cuantizacion-de-la-energia` | alta |  |
| 2021 Ordinaria B | `f-2021-jun-B5` | Un isótopo de una muestra radiactiva posee un periodo de semidesintegración de 5730 años. a) Obtenga la vida media y... | `ley-de-desintegracion-radiactiva` | alta |  |
| 2020 Ordinaria A | `f-2020-jun-A5` | Se tienen dos fuentes radiactivas cuya actividad a día de hoy es la misma. Se sabe que dentro de 10... | `ley-de-desintegracion-radiactiva` | alta |  |
| 2020 Ordinaria B | `f-2020-jun-B5` | Se hace incidir un haz de fotones de frecuencia variable sobre una lámina de material metálico, de manera que se... | `hipotesis-de-de-broglie-dualidad-onda-corpusculo`, `efecto-fotoelectrico` | media |  |
| 2019 Ordinaria A | `f-2019-jun-A5` | a) La longitud de onda umbral de un metal para el efecto fotoeléctrico es 579 nm. Calcule el trabajo de... | `efecto-fotoelectrico` | alta |  |
| 2019 Ordinaria B | `f-2019-jun-B5` | Se dispone de una muestra de 10 mg de Pu cuyo período de semidesintegración es de 87,7 años y su... | `ley-de-desintegracion-radiactiva` | alta |  |
| 2025 Extraordinaria A | `f-2025-jul-1` | En Lund, Suecia, se está construyendo la futura Fuente Europea de Neutrones por Espalación. En sus instalaciones se aceleran protones,... | `hipotesis-de-de-broglie-dualidad-onda-corpusculo` | alta |  |
| 2021 Extraordinaria A | `f-2021-jul-A5` | En un acelerador se originan un electrón relativista de velocidad y un fotón de MeV.... | `hipotesis-de-de-broglie-dualidad-onda-corpusculo` | alta |  |
| 2021 Extraordinaria B | `f-2021-jul-B5` | El patrón del kilogramo es un cilindro de platino-iridio con un en masa de Pt. El isótopo Pt es radiactivo,... | `ley-de-desintegracion-radiactiva` | alta |  |
| 2020 Extraordinaria A | `f-2020-jul-A5` | Para obtener imágenes del corazón se utiliza Tl, que emite rayos gamma con periodo de semidesintegración de días. Se recomienda... | `ley-de-desintegracion-radiactiva` | alta |  |
| 2020 Extraordinaria B | `f-2020-jul-B5` | Un sistema atómico de tres niveles energéticos se utiliza para obtener radiación láser. Respecto al fundamental, el segundo y tercer... | `hipotesis-de-planck-y-cuantizacion-de-la-energia` | alta |  |
| 2019 Extraordinaria A | `f-2019-jul-A5` | Al iluminar un material con luz de nm se liberan electrones con energía cinética máxima eV; con luz ultravioleta de... | `hipotesis-de-de-broglie-dualidad-onda-corpusculo`, `efecto-fotoelectrico` | media |  |
| 2019 Extraordinaria B | `f-2019-jul-B5` | Una muestra de madera de un sarcófago se ha datado por C con edad de años. En la muestra se... | `ley-de-desintegracion-radiactiva` | alta |  |
| 2018 Extraordinaria A | `f-2018-jul-A5` | El C tiene un periodo de semidesintegración de años. Inicialmente se tiene una muestra de mg.... | `ley-de-desintegracion-radiactiva` | alta |  |
| 2018 Extraordinaria B | `f-2018-jul-B5` | Al iluminar un metal con luz de longitud de onda en el vacío nm, se emiten electrones con energía cinética... | `efecto-fotoelectrico` | alta |  |
| 2024 Extraordinaria A | `f-2024-jul-A5` | Para una prueba diagnóstica se utiliza el isótopo ⁹⁹Tc cuyo tiempo de semidesintegración es de 6 h. La actividad de... | `ley-de-desintegracion-radiactiva` | alta |  |
| 2024 Extraordinaria B | `f-2024-jul-B5` | Al hacer incidir fotones de frecuencia variable sobre un material se obtiene la recta: V(V) = 4,16·10⁻¹⁵ f(Hz) − 2,16.... | `efecto-fotoelectrico` | alta |  |
| 2022 Extraordinaria A | `f-2022-jul-A5` | Una muestra contiene inicialmente 30 mg de ²¹⁰Po. Su período de semidesintegración es de 138,38 días.... | `ley-de-desintegracion-radiactiva` | alta |  |
| 2022 Extraordinaria B | `f-2022-jul-B5` | Un electrón relativista ha llegado a adquirir una energía cinética equivalente a la energía de un fotón de 5·10⁻¹² m... | `hipotesis-de-planck-y-cuantizacion-de-la-energia` | alta |  |
| 2023 Extraordinaria A | `f-2023-jul-A5` | En un laboratorio de preparación de radiofármacos se rompe accidentalmente una ampolla de una solución que contenía ¹⁸F con una... | `ley-de-desintegracion-radiactiva` | media | Actividad de una fuente radiactiva y tiempo hasta que se reduce a un valor dado — ley de desintegración. (clasificado a mano, no por palabra clave — revisar.) |
| 2023 Extraordinaria B | `f-2023-jul-B5` | Una placa metálica es irradiada con luz de 400 nm. La máxima corriente eléctrica debida al efecto fotoeléctrico es de... | `efecto-fotoelectrico` | alta |  |
| 2018 Ordinaria A | `f-2018-jun-A5` | Efecto fotoeléctrico y trabajo de extracción.... | `efecto-fotoelectrico` | alta |  |
| 2018 Ordinaria B | `f-2018-jun-B5` | Longitud de onda de de Broglie y energía relativista.... | `hipotesis-de-de-broglie-dualidad-onda-corpusculo` | alta |  |
| 2026 Modelo A | `f-2026-modelo-4A` | El isótopo del cobalto Co tiene un periodo de semidesintegración de 1925,2 días y una masa atómica de 59,94 u.... | `ley-de-desintegracion-radiactiva` | alta |  |
| 2026 Modelo B | `f-2026-modelo-4B` | Dentro del complejo de aceleradores que suministran protones al LHC (Large Hadron Collider) está el PS Booster, un acelerador circular... | `equivalencia-masa-energia`, `energia-y-cantidad-de-movimiento-relativistas` | media | Masa relativista y velocidad de protones a partir de su energía cinética — relatividad, régimen de altas energías. (clasificado a mano, no por palabra clave — revisar.) |
| 2025 Modelo A | `f-2025-modelo-4A` | Un protón tiene una masa en reposo equivalente a una energía de 938,2 MeV. El protón es acelerado hasta alcanzar... | `equivalencia-masa-energia`, `energia-y-cantidad-de-movimiento-relativistas` | media | Masa en reposo (equivalencia masa-energía) y energía cinética relativista a partir de la velocidad. (clasificado a mano, no por palabra clave — revisar.) |
| 2025 Modelo B | `f-2025-modelo-4B` | En el interior del recinto de la central nuclear de Springfield, en una zona contaminada permanentemente con Th, ha crecido... | `ley-de-desintegracion-radiactiva` | alta |  |
| 2018 Modelo A | `f-2018-modelo-A5` | Un electrón posee una energía cinética de 40 eV y, en otro caso, alcanza en un ciclotrón una energía cinética... | `hipotesis-de-de-broglie-dualidad-onda-corpusculo` | alta |  |
| 2018 Modelo B | `f-2018-modelo-B5` | Un metal es iluminado con luz de frecuencia 9·10¹⁴ Hz, emitiendo por efecto fotoeléctrico electrones que pueden ser detenidos con... | `efecto-fotoelectrico` | alta |  |
| 2019 Modelo A | `f-2019-modelo-A5` | Una pelota de 20 g de masa posee una energía cinética de 4 J. Los electrones ultrarelativistas en el Acelerador... | `hipotesis-de-de-broglie-dualidad-onda-corpusculo` | alta |  |
| 2019 Modelo B | `f-2019-modelo-B5` | El período de semidesintegración del isótopo más estable del radio, ²²⁶Ra, es de 1602 años. Se dispone inicialmente de una... | `ley-de-desintegracion-radiactiva` | alta |  |
| 2020 Modelo A | `f-2020-modelo-A5` | Un haz luminoso monocromático de 400 nm de longitud de onda incide sobre un material cuyo trabajo de extracción para... | `hipotesis-de-de-broglie-dualidad-onda-corpusculo`, `efecto-fotoelectrico` | media |  |
| 2020 Modelo B | `f-2020-modelo-B5` | Un isótopo radiactivo utilizado en medicina nuclear tiene una vida media de 6 h. Se inyecta inicialmente a un paciente... | `ley-de-desintegracion-radiactiva` | alta |  |
| 2021 Modelo A | `f-2021-modelo-A5` | Cuando un haz de luz de longitud de onda 150 nm incide sobre una lámina de oro, se emiten electrones... | `hipotesis-de-de-broglie-dualidad-onda-corpusculo`, `efecto-fotoelectrico` | media |  |
| 2021 Modelo B | `f-2021-modelo-B5` | El tecnecio 99 es un isótopo radiactivo empleado en radiodiagnóstico, con un período de semidesintegración de 6 horas.... | `ley-de-desintegracion-radiactiva` | alta |  |
| 2022 Modelo A | `f-2022-modelo-A5` | Al iluminar un metal con luz de 120 nm de longitud de onda se emiten electrones frenados por un potencial... | `efecto-fotoelectrico` | alta |  |
| 2022 Modelo B | `f-2022-modelo-B5` | Un trozo de madera con 25 g de carbono, tallado como empuñadura, se encontró en ruinas antiguas con una actividad... | `ley-de-desintegracion-radiactiva` | alta |  |
| 2023 Modelo A | `f-2023-modelo-A5` | Un positrón en reposo se acelera en un acelerador lineal a través de una diferencia de potencial de 3 MV.... | `trabajo-y-caracter-conservativo-del-campo-electrico`, `energia-y-cantidad-de-movimiento-relativistas` | media | Positrón acelerado por una diferencia de potencial hasta velocidad relativista — energía cinética clásica vs. relativista. (clasificado a mano, no por palabra clave — revisar.) |
| 2023 Modelo B | `f-2023-modelo-B5` | En la figura se presenta la evolución temporal de la actividad de una muestra que contiene Yodo-131. ![Gráfica de actividad... | `ley-de-desintegracion-radiactiva` | alta |  |
| 2024 Modelo A | `f-2024-modelo-A5` | El isótopo ¹⁹⁸Au reduce su actividad a la sexta parte en el transcurso de una semana.... | `ley-de-desintegracion-radiactiva` | alta |  |
| 2024 Modelo B | `f-2024-modelo-B5` | En la gráfica se representa el potencial de frenado para el cobre al iluminarlo con fotones de longitudes de onda... | `efecto-fotoelectrico` | alta |  |

## REQUIERE REVISIÓN MANUAL (clasificados a mano, sin patrón de palabra clave)

Estos 17 ejercicios no encajaron con ninguna regla automática — se leyeron completos y se clasificaron con criterio de física, pero merecen que los repases tú antes de aplicarlos, igual que hiciste con las correcciones de sintaxis de Lengua.

| examen | ejercicio_id | enunciado (extracto) | topic_slug(s) propuesto(s) | confianza | nota |
|---|---|---|---|---|---|
| 2023 Ordinaria A | `f-2023-jun-A3` | Tres cargas , y se encuentran situadas en los puntos del plano , y , respectivamente, tal y como se... | `intensidad-del-campo-electrico`, `trabajo-y-caracter-conservativo-del-campo-electrico` | media | Fuerza electrostática sobre una carga en presencia de otras + trabajo para traerla desde el infinito. (clasificado a mano, no por palabra clave — revisar.) |
| 2022 Ordinaria A | `f-2022-jun-A3` | La figura representa una varilla metálica de 20 cm de longitud, cuyos extremos deslizan sin rozamiento sobre unos raíles horizontales,... | `flujo-magnetico-e-induccion-electromagnetica` | media | Varilla que desliza sobre raíles en un campo magnético — fem inducida por movimiento (Faraday). (clasificado a mano, no por palabra clave — revisar.) |
| 2020 Ordinaria A | `f-2020-jun-A3` | Una barra conductora, de 30 cm de longitud y paralela al eje , se mueve en el plano con una... | `flujo-magnetico-e-induccion-electromagnetica` | media | Barra conductora en movimiento dentro de un campo magnético — pide explícitamente la fem inducida. (clasificado a mano, no por palabra clave — revisar.) |
| 2020 Ordinaria A | `f-2020-jun-A4` | Un objeto está situado en una posición s1 a la izquierda de una lente convergente de distancia focal 50 mm,... | `lentes-delgadas-ecuacion-fundamental`, `aumento-lateral-en-lentes-y-espejos` | media | Lente convergente con imagen de tamaño doble (real e virtual) — ecuación de la lente + aumento lateral. (clasificado a mano, no por palabra clave — revisar.) |
| 2019 Ordinaria A | `f-2019-jun-A3` | Se tienen dos hilos conductores rectilíneos, indefinidos y paralelos al eje que cortan al plano en los puntos y cm.... | `campo-magnetico-creado-por-corrientes`, `fuerza-magnetica-sobre-una-corriente-y-momento-sobre-una-espira` | media | Dos hilos con corriente: campo magnético creado + fuerza por unidad de longitud entre ellos. (clasificado a mano, no por palabra clave — revisar.) |
| 2019 Extraordinaria A | `f-2019-jul-A3` | Una carga C está en el origen y otra carga C en m.... | `intensidad-del-campo-electrico`, `trabajo-y-caracter-conservativo-del-campo-electrico` | media | Punto de campo eléctrico nulo entre dos cargas + trabajo del campo al mover un electrón. (clasificado a mano, no por palabra clave — revisar.) |
| 2019 Extraordinaria A | `f-2019-jul-A4` | Una lente convergente de cm de distancia focal forma la imagen de un objeto de tamaño cm. Se quiere que... | `lentes-delgadas-ecuacion-fundamental` | media | Lente convergente, distancia focal y posición de la imagen — ecuación fundamental de la lente. (clasificado a mano, no por palabra clave — revisar.) |
| 2024 Extraordinaria A | `f-2024-jul-A3` | Una partícula con carga 2 nC está situada en el origen de coordenadas y una segunda partícula con carga 4... | `intensidad-del-campo-electrico`, `trabajo-y-caracter-conservativo-del-campo-electrico` | media | Campo eléctrico de dos cargas + punto de fuerza nula + trabajo para traer una carga desde el infinito. (clasificado a mano, no por palabra clave — revisar.) |
| 2022 Extraordinaria A | `f-2022-jul-A2` | Por una cuerda dispuesta a lo largo del eje x viaja una onda armónica. Los elementos A (xA = 0... | `ecuacion-de-una-onda-armonica` | media | Onda en una cuerda: pide la velocidad de propagación y la expresión matemática de la onda. (clasificado a mano, no por palabra clave — revisar.) |
| 2022 Extraordinaria B | `f-2022-jul-B3` | Una carga puntual positiva está situada en el punto (3, 4) m del plano xy. En otro punto del plano... | `intensidad-del-campo-electrico`, `potencial-electrico` | media | Dos cargas cuyo campo se anula en un punto + valor del potencial en ese punto. (clasificado a mano, no por palabra clave — revisar.) |
| 2023 Extraordinaria A | `f-2023-jul-A5` | En un laboratorio de preparación de radiofármacos se rompe accidentalmente una ampolla de una solución que contenía ¹⁸F con una... | `ley-de-desintegracion-radiactiva` | media | Actividad de una fuente radiactiva y tiempo hasta que se reduce a un valor dado — ley de desintegración. (clasificado a mano, no por palabra clave — revisar.) |
| 2023 Extraordinaria B | `f-2023-jul-B1` | En su aproximación al planeta Fomalhaut II, el astronauta Rocannon avista Fomalhautillo según un ángulo α = 53,13° con respecto... | `ley-de-gravitacion-universal` | media | Distancia a partir de la fuerza gravitatoria total (componentes dadas) — aplicación directa de F=GMm/r². (clasificado a mano, no por palabra clave — revisar.) |
| 2026 Modelo B | `f-2026-modelo-4B` | Dentro del complejo de aceleradores que suministran protones al LHC (Large Hadron Collider) está el PS Booster, un acelerador circular... | `equivalencia-masa-energia`, `energia-y-cantidad-de-movimiento-relativistas` | media | Masa relativista y velocidad de protones a partir de su energía cinética — relatividad, régimen de altas energías. (clasificado a mano, no por palabra clave — revisar.) |
| 2025 Modelo A | `f-2025-modelo-4A` | Un protón tiene una masa en reposo equivalente a una energía de 938,2 MeV. El protón es acelerado hasta alcanzar... | `equivalencia-masa-energia`, `energia-y-cantidad-de-movimiento-relativistas` | media | Masa en reposo (equivalencia masa-energía) y energía cinética relativista a partir de la velocidad. (clasificado a mano, no por palabra clave — revisar.) |
| 2021 Modelo B | `f-2021-modelo-B3` | En una región del espacio existe un campo magnético uniforme de 0,5 T perpendicular al plano del papel. Se sitúa... | `flujo-magnetico-e-induccion-electromagnetica` | media | Varilla en un circuito en U dentro de un campo magnético — velocidad necesaria para inducir una corriente dada. (clasificado a mano, no por palabra clave — revisar.) |
| 2023 Modelo A | `f-2023-modelo-A5` | Un positrón en reposo se acelera en un acelerador lineal a través de una diferencia de potencial de 3 MV.... | `trabajo-y-caracter-conservativo-del-campo-electrico`, `energia-y-cantidad-de-movimiento-relativistas` | media | Positrón acelerado por una diferencia de potencial hasta velocidad relativista — energía cinética clásica vs. relativista. (clasificado a mano, no por palabra clave — revisar.) |
| 2024 Modelo A | `f-2024-modelo-A3` | Dos cargas de 2 nC cada una están fijas en (0,0) m y (4,0) m del plano xy.... | `trabajo-y-caracter-conservativo-del-campo-electrico`, `intensidad-del-campo-electrico` | media | Trabajo del campo para traer una carga desde el infinito + punto de fuerza neta nula. (clasificado a mano, no por palabra clave — revisar.) |

