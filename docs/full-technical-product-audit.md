# Auditoría completa de Pausia

> Fecha: 2026-06-11 — Build: ✅ passed — Rama: main — Commit: e07d07b

---

## 1. Resumen ejecutivo

Pausia es un MVP funcional con una base técnica sólida y una propuesta de valor clara: practicar exámenes oficiales de la EBAU con corrección IA. El build pasa, las rutas principales funcionan, los límites de IA están implementados y el LaTeX se renderiza correctamente tras las últimas correcciones.

**Está cerca de beta privada** con 4–5 días de trabajo enfocado. No está lista para beta pública por problemas de cobertura de datos, un bug crítico de datos no migrados, UX incompleta en móvil y ausencia de onboarding.

**Fortalezas:**
- Motor de corrección IA con JSON estructurado, fallback robusto y parsing de LaTeX mejorado
- Límites por ruta implementados con mensajes amigables
- Tracking de uso de IA por usuario y ruta
- Comunidad Cataluña implementada para la mayoría de asignaturas
- Precio y promesa claros: no se cobran pagos activos

**Riesgos principales:**
- `historial_examenes` no tiene migración versionada — la tabla existe en producción pero si se destruye no hay forma de recrearla
- `enunciado` y `respuesta` se truncan a 500/1000 caracteres en el historial — datos guardados están incompletos para ejercicios largos
- Sidebar dice "EBAU Madrid" siempre, incluso para usuarios de Cataluña
- Ejercicios con `requiereRevision: true` en Física y Química Cataluña se muestran sin advertencia
- "Mi Plan" de la sección de home usa `/api/chat` (límite 20/día) en lugar de `/api/planning` (límite 1/semana) — inconsistencia de límites

---

## 2. Diagnóstico rápido

| Área | Estado | Riesgo | Prioridad | Comentario |
|---|---|---|---|---|
| Exámenes Madrid | ✅ Funcional | Bajo | Mantenimiento | Buena cobertura 2015-2025 en Mates; Física desde 2018 |
| Exámenes Cataluña | ⚠️ Parcial | Medio | Alta | requiereRevision sin warning en Física/Química |
| Inglés | ⚠️ Parcial | Medio | Media | Sin Extraordinaria, solo 2018-2025 |
| Química | ✅ Buena | Bajo | Mantenimiento | Mejor cobertura del repo (2994 líneas) |
| Física | ⚠️ Parcial | Medio | Media | Sin años 2015-2017 en Madrid |
| LaTeX | ✅ Corregido | Bajo | Monitorizar | Fix reciente (e07d07b, 2fe3155) |
| Historial | ⚠️ Riesgo datos | Alto | Crítica | Tabla sin migración, datos truncados en BD |
| Simulacros | ✅ Funcional | Bajo | Media | null guard correcto; falta Filosofía |
| Mi Plan (home) | ⚠️ Límites | Medio | Alta | Usa /api/chat, no /api/planning |
| Planning (página) | ✅ Funcional | Bajo | Media | Usa /api/planning con límite 1/semana |
| Predicción de nota | ✅ Sólido | Bajo | Monitorizar | Fórmula conservadora, label "No oficial" |
| Límites IA | ✅ Implementados | Bajo | Mantenimiento | Todos los endpoints con rate limit |
| Pricing | ✅ Honest | Bajo | Mantenimiento | Dice explícitamente que no hay pagos |
| Landing | ✅ Presentable | Bajo | Media | Hardcodea "EBAU Madrid" en algunos textos |
| Supabase RLS | ✅ Activo | Medio | Monitorizar | historial_examenes: sin migración |
| Costes IA | ⚠️ Aceptables | Medio | Media | /api/chat max_tokens=4000, sin cost tracking |
| Beta privada | ⚠️ Casi | Medio | Ahora | 4-5 días para cerrar bloqueantes |
| Beta pública | ❌ No | Alto | En 2-3 semanas | Onboarding, mobile, datos completos |

---

## 3. Top 15 prioridades

### P1 — Crear migración para `historial_examenes`
**Problema:** La tabla `historial_examenes` es la más usada del producto (exámenes, historial, Mi Plan), pero NO tiene migración en `supabase/migrations/`. Existe en producción pero fue creada manualmente.  
**Impacto:** Si la BD se recrea o se migra, todos los historiales de correcciones se pierden sin posibilidad de recuperación estructurada.  
**Archivos:** `supabase/migrations/` — crear nuevo archivo  
**Dificultad:** Baja  
**Riesgo:** Alto  
**Recomendación:** Hacer `SELECT * FROM information_schema.columns WHERE table_name='historial_examenes'` en producción y crear la migración inmediatamente.  
**Validación:** `npm run build` + verificar que el archivo describe fielmente la tabla real

---

### P2 — "Mi Plan" en home usa el límite equivocado
**Problema:** `generarPlan()` en `app/page.tsx:1329` llama a `/api/chat`, no a `/api/planning`. El límite de `/api/chat` es 20/día para texto; el de `/api/planning` es 1/semana. Los usuarios pueden generar planes ilimitados desde home.  
**Impacto:** Coste IA descontrolado; incoherencia de UX (el usuario llega a planning page y ve "ya usaste tu plan" pero en home puede generar otro).  
**Archivos:** `app/page.tsx:1329`  
**Dificultad:** Baja (cambiar endpoint)  
**Riesgo:** Medio  
**Recomendación:** Mover `generarPlan()` a `/api/planning` o eliminar el generador de plan de home y redirigir a `/planning`.  
**Validación:** Generar un plan en home y verificar que se cuenta en el mismo límite que en `/planning`

---

### P3 — Sidebar dice "EBAU Madrid" siempre
**Problema:** `app/components/Sidebar.tsx:116` tiene hardcodeado "EBAU Madrid · practica mejor" independientemente de si el usuario usa Cataluña. Además `app/page.tsx:1915` muestra "EBAU Madrid {año}" en el header del ejercicio activo, incluso en asignaturas Madrid cuando el usuario tiene CCAA=Cataluña seleccionada.  
**Impacto:** Riesgo de confianza para estudiantes de Cataluña que ven "EBAU Madrid" en sus exámenes PAU Catalunya.  
**Archivos:** `app/components/Sidebar.tsx:116`, `app/page.tsx:1915`  
**Dificultad:** Baja  
**Riesgo:** Bajo-Medio  
**Recomendación:** Usar `useCCAA()` en Sidebar para mostrar "EBAU Madrid" o "PAU Catalunya". En page.tsx adaptar el label del header al ccaa activo.  
**Validación:** Cambiar a Cataluña → revisar sidebar y header de ejercicio

---

### P4 — `requiereRevision: true` sin warning en UI
**Problema:** `app/data/fisica_cataluna.ts` (3 ejercicios) y `app/data/quimica_cataluna.ts` (2 ejercicios) tienen `requiereRevision: true`, indicando que los enunciados necesitan revisión. Sin embargo el flag no se usa en ningún componente UI: los ejercicios aparecen exactamente igual que los validados.  
**Impacto:** Estudiantes podrían practicar con enunciados potencialmente incorrectos o incompletos sin saberlo.  
**Archivos:** `app/components/CatFisicaEjercicioCard.tsx`, `app/components/CatEjercicioCard.tsx`  
**Dificultad:** Baja  
**Riesgo:** Medio  
**Recomendación:** Mostrar un banner "Este ejercicio está pendiente de revisión editorial" cuando `requiereRevision === true`.  
**Validación:** Física Cataluña 2021 → ver si los ejercicios marcados muestran el banner

---

### P5 — `enunciado` y `respuesta` truncados en historial
**Problema:** `app/page.tsx:1247-1248` guarda `enunciado: enunciadoActivo?.substring(0, 500)` y `respuesta: respuesta?.substring(0, 1000)`. Para exámenes con enunciados largos (Inglés reading, Lengua texto) se almacenan truncados. El historial modal (línea 2233) muestra este enunciado incompleto.  
**Impacto:** El historial muestra enunciados cortados sin indicar que están incompletos. El contexto de chat sobre correcciones (línea 1288) también usa datos truncados.  
**Archivos:** `app/page.tsx:1247-1248`  
**Dificultad:** Baja  
**Riesgo:** Medio  
**Recomendación:** Ampliar los límites a 2000/4000 chars o guardar sin límite usando TEXT en Supabase. Si la columna es TEXT ya, el límite es innecesario.  
**Validación:** Corregir un ejercicio de Inglés → ver historial → enunciado completo

---

### P6 — Física Madrid sin datos 2015-2017
**Problema:** `app/data/fisica.ts` contiene años 2018-2024 (Ordinaria) y 2022-2024 (Extraordinaria). Faltan 2015, 2016, 2017.  
**Impacto:** Dificultad "Fácil" en simulacros (`years: [2015, 2016, 2017, 2018]`) puede no encontrar suficientes preguntas y el simulacro puede fallar o tener menos bloques de lo esperado.  
**Archivos:** `app/data/fisica.ts`, `components/simulacros/data.ts:25`  
**Dificultad:** Alta (datos)  
**Riesgo:** Medio  
**Recomendación:** Añadir exámenes 2015-2017 de Física Madrid o ajustar los rangos de años del nivel "Fácil" para reflejar la cobertura real.  
**Validación:** Simulacro Física Fácil Madrid → recibe 4 bloques sin error

---

### P7 — Inglés texto_fuente con normalización incorrecta
**Problema:** `app/page.tsx:1946` y `:1954` usan `<MathMarkdown text={texto_fuente} />` sin `format={false}`, aplicando `normalizeExamStatement` (que incluye `normalizeSoftLineBreaks`). `normalizeSoftLineBreaks` une párrafos separados por un solo newline, lo que destruye los saltos de párrafo de los textos de lectura de Inglés.  
**Impacto:** Los textos de Inglés (Q1, Q2) pueden aparecer como un bloque continuo de texto sin separación de párrafos, haciendo difícil la lectura.  
**Archivos:** `app/page.tsx:1946, 1954`  
**Dificultad:** Baja  
**Riesgo:** Medio  
**Recomendación:** Añadir `format={false}` a esas dos instancias de MathMarkdown para textos de Inglés.  
**Validación:** Abrir Q1 Inglés 2024 → texto fuente con párrafos correctamente separados

---

### P8 — `historial_examenes` se escribe desde cliente sin ruta server
**Problema:** La escritura a `historial_examenes` se hace directamente con `supabase.from('historial_examenes').insert(...)` desde componentes cliente, usando la anon key. Sin server route, la validación de `user_id` depende únicamente de RLS.  
**Impacto:** Sin RLS correcta, un usuario podría escribir registros con el user_id de otro. Si la política RLS tiene un bug, hay exposición.  
**Archivos:** `app/page.tsx:1243`, `app/components/CatPreguntaCard.tsx:112`, etc.  
**Dificultad:** Media  
**Riesgo:** Medio  
**Recomendación:** Verificar que la RLS tiene `WITH CHECK (auth.uid() = user_id)` para INSERT. Si no, añadir policy. A largo plazo considerar server route.  
**Validación:** Intentar insertar con un user_id distinto al autenticado → Supabase debe rechazar

---

### P9 — Pricing no guarda emails de interés
**Problema:** `app/pricing/page.tsx:71-73` el botón "Quiero acceso premium" llama a `registerInterest(planName)` que solo actualiza estado local con un mensaje. No hay ninguna llamada a API, no se guarda el email en ninguna base de datos ni servicio externo.  
**Impacto:** Los usuarios interesados en Premium no quedan registrados. No hay lista de espera real.  
**Archivos:** `app/pricing/page.tsx:71-73`  
**Dificultad:** Baja-Media  
**Riesgo:** Bajo (pero oportunidad perdida)  
**Recomendación:** Guardar el email del usuario autenticado + timestamp en una tabla `premium_interest` de Supabase, o integrar un servicio como Resend/Mailchimp.  
**Validación:** Click "Quiero acceso premium" → email guardado en BD

---

### P10 — Duplicate `calcMedia` en `app/page.tsx`
**Problema:** `calcMedia` se define dos veces: a nivel de módulo (línea 454) con lógica simple, y dentro del componente Home (línea 1358) con lógica diferente. La definición interna shadowa la externa. Ambas producen resultados distintos para datos nulos.  
**Impacto:** Bug potencial silencioso. La función externa no se usa (dead code). La interna puede producir resultados ligeramente diferentes.  
**Archivos:** `app/page.tsx:454` y `app/page.tsx:1358`  
**Dificultad:** Baja  
**Riesgo:** Bajo  
**Recomendación:** Eliminar la definición externa (línea 454) o unificarlas.  
**Validación:** No hay cambio de comportamiento visible pero el código queda limpio

---

### P11 — `historia_filosofia` no tiene flashcards permitidas en BD
**Problema:** La última migración de flashcards (`allow_ingles_flashcards.sql`) permite: `mates, fisica, quimica, biologia, ingles, lengua, historia`. No incluye `historia_filosofia`. Si algún componente intenta insertar flashcards de `historia_filosofia`, la constraint de BD rechazará el insert.  
**Archivos:** `supabase/migrations/20260610020000_allow_ingles_flashcards.sql`  
**Dificultad:** Baja  
**Riesgo:** Bajo  
**Recomendación:** Nueva migración para añadir `historia_filosofia` al CHECK. Verificar si hay intento de crear flashcards de filosofía.  
**Validación:** Zona con filosofía → crear flashcard → no error

---

### P12 — Chat system prompt hardcodea "EBAU Madrid"
**Problema:** `app/page.tsx:1271` el prompt del chat dice "Eres Pausia, tutor EBAU Madrid" y `app/page.tsx:1306` el prompt de planificación dice "EBAU Madrid". Para usuarios de Cataluña, Pausia se presenta como tutor EBAU Madrid.  
**Impacto:** Respuestas del chat podrían dar criterios incorrectos (Madrid vs Cataluña) para preguntas sobre exámenes.  
**Archivos:** `app/page.tsx:1271, 1306`  
**Dificultad:** Baja  
**Riesgo:** Medio  
**Recomendación:** Incluir `ccaa` en el system prompt: "Eres Pausia, tutor EBAU ${ccaa === 'Cataluña' ? 'PAU Catalunya' : 'Madrid'}."  
**Validación:** Cataluña → chat → pregunta sobre criterios → responde según Cataluña

---

### P13 — Zona Canvas no tiene navegación en Sidebar
**Problema:** `/zona/canvas` existe y es funcional, pero el Sidebar no tiene enlace directo. Solo se puede llegar desde la propia página `/zona`.  
**Impacto:** UX degradada. Los usuarios no descubren el canvas.  
**Archivos:** `app/components/Sidebar.tsx`  
**Dificultad:** Baja  
**Riesgo:** Bajo  
**Recomendación:** Añadir sub-enlace "Canvas" en "La Zona" del sidebar, o añadir botón de acceso directo en la página de zona.  
**Validación:** Ver canvas desde sidebar sin pasar por /zona

---

### P14 — Sin onboarding ni selección de CCAA inicial
**Problema:** Un usuario nuevo que inicia sesión llega directamente a Exámenes > Matemáticas II > Madrid sin ninguna configuración. Si es de Cataluña, ve exámenes Madrid hasta que descubra el selector en el sidebar.  
**Impacto:** Confusion en primer uso, posibles correcciones aplicando criterios equivocados.  
**Archivos:** `app/page.tsx`, `app/login/page.tsx`  
**Dificultad:** Media  
**Riesgo:** Medio  
**Recomendación:** Modal de onboarding al primer login: "¿Qué CCAA vas a examinar?" + asignatura principal.  
**Validación:** Primer login → modal → selección persistida en localStorage

---

### P15 — `app/page.tsx` es un monolito de 2258 líneas
**Problema:** Todo el estado, filtros, lógica de corrección, historial, chat, planning y renderizado de 8 asignaturas está en un único archivo. Hay funciones duplicadas, componentes inline y props drilling masivo.  
**Impacto:** Muy alta dificultad para mantener y añadir funcionalidades. Mayor riesgo de regresiones al tocar código.  
**Archivos:** `app/page.tsx`  
**Dificultad:** Alta  
**Riesgo:** Alto si no se aborda  
**Recomendación:** No refactorizar ahora (beta privada primero). Marcar como deuda técnica para después de beta privada.  
**Validación:** No aplica aún

---

## 4. Bugs críticos

| # | Bug | Donde | Efecto visible |
|---|---|---|---|
| B1 | `historial_examenes` sin migración | Supabase | Si se recrea BD, datos perdidos sin forma de recuperar estructura |
| B2 | Datos truncados en historial (500/1000 chars) | `app/page.tsx:1247-1248` | Enunciados y respuestas cortados en historial y contexto de chat |
| B3 | "EBAU Madrid" hardcoded para Cataluña | `Sidebar.tsx:116`, `page.tsx:1915` | Confunde a usuarios de Cataluña |
| B4 | `requiereRevision` sin indicador en UI | `CatFisicaEjercicioCard`, `CatEjercicioCard` | Ejercicios pendientes de verificar sin aviso |
| B5 | Inglés texto_fuente sin `format={false}` | `page.tsx:1946,1954` | Párrafos del reading unidos en un bloque |
| B6 | Mi Plan home usa límite de chat (20/día) no de planning (1/semana) | `page.tsx:1329` | Incoherencia de límites; costes descontrolados |
| B7 | Chat prompt dice "EBAU Madrid" para todos | `page.tsx:1271,1306` | Pausia responde con criterios Madrid a usuarios de Cataluña |
| B8 | `calcMedia` definida dos veces (shadow) | `page.tsx:454,1358` | Comportamiento inconsistente en notas medias |
| B9 | Pricing no guarda emails de interés | `pricing/page.tsx:71` | Lista de espera perdida |
| B10 | Canvas sin enlace en sidebar | `Sidebar.tsx` | Feature descubierta accidentalmente |

---

## 5. Riesgos de confianza del usuario

1. **"EBAU Madrid" para estudiantes de Cataluña** — Un alumno de Cataluña ve "EBAU Madrid" en el ejercicio que está practicando. Pierde confianza al instante.

2. **Enunciados truncados en historial** — El historial muestra preguntas cortadas en mitad de la frase. El usuario no entiende qué ejercicio practicó.

3. **Ejercicios con `requiereRevision` sin aviso** — El alumno practica con un ejercicio potencialmente incorrecto y recibe una corrección IA basada en datos erróneos.

4. **Física Madrid sin años 2015-2017** — El simulacro en nivel "Fácil" puede generar menos de 4 bloques o repetir años. Si el alumno lo nota, pierde confianza en la integridad de los datos.

5. **Inglés: reading blocks sin párrafos** — Un texto de lectura de Inglés que aparece como un bloque único de texto parece un error del producto.

6. **Mi Plan hardcodea EBAU Madrid** — El plan generado menciona "EBAU Madrid" para estudiantes catalanes y puede recomendar contenido incorrecto.

7. **Formulario de interés Premium que no hace nada** — Si un alumno da clic en "Quiero acceso premium" y no recibe email ni confirmación, asume que el producto está roto.

8. **Nota estimada con pocos datos** — Si el alumno tiene 1-2 correcciones, puede ver una estimación de nota con confianza "baja" que puede ser muy alejada de la realidad y desanimar.

---

## 6. Auditoría por sección

### Exámenes (general)
- **Estado:** Funcional para Madrid (todas las asignaturas). Cataluña: funcional pero incompleta.
- **Filtros:** Ordinaria / Extraordinaria / Modelo (Modelo solo Madrid), año, bloque, opción A/B — correctos.
- **Comunidad:** El selector de CCAA en sidebar funciona. `useCCAA()` correcto. Los datos se filtran por `comunidad === ccaa`.
- **Empty state:** Existe `EmptyQuestionsState` que muestra mensaje amigable cuando no hay preguntas para el filtro.
- **Fallback peligroso:** Si `examen` es undefined, se usa `examenesFiltrados[0]` — puede mostrar año incorrecto silenciosamente.

### Matemáticas II
- **Madrid:** 2015-2025, Ordinaria + Extraordinaria + Modelo. La cobertura más completa del repo.
- **Cataluña:** Exámenes de 2022-2025 en formato diferente (CatPreguntaCard).
- **LaTeX:** Fracciones, raíces, sistemas de ecuaciones — buenos enunciados.
- **Corrección:** USA `/api/chat` para ejercicios individuales (no simulacro) — límite 20/día texto, 5/día imagen.

### Física
- **Madrid:** 2018-2024 Ordinaria, 2022-2024 Extraordinaria. **Sin 2015-2017.**
- **Cataluña:** Parcial, algunos ejercicios con `requiereRevision: true`.
- **LaTeX:** Fórmulas físicas (campos, ondas, óptica) con LaTeX inline y bloque — funcional.
- **Datos:** La estructura usa `CatFisicaEjercicioCard` para Cataluña con aparados específicos.

### Química
- **Madrid:** 2018-2025, Ordinaria + algo de Extraordinaria. El archivo más grande (2994 líneas).
- **Cataluña:** Parcial, `requiereRevision` en algunos ejercicios.
- **LaTeX:** Fórmulas moleculares, reacciones, estequiometría. Bien estructurado.
- **PDFs:** `public/quimica-pdfs/` tiene PDFs de años 2018-2024.

### Inglés
- **Madrid:** 2018-2025, Ordinaria SOLO. Sin Extraordinaria.
- **Estructura:** Q1 (True/False), Q2 (comprensión), Q3 (vocabulario), Q4 (gramática), Q5 (redacción).
- **Bug:** `texto_fuente` renderizado con `format=true` — posible destrucción de párrafos del reading.
- **Criterios:** Bien diferenciados pre-2024 y 2024-2025 en `correctionPrompt.ts`.
- **Simulacros:** Incluye Q1, Q2, Q4, Q5 (no Q3 en THEME_ORDER).

### Lengua Castellana
- **Madrid:** Varios años, con opción de día/versión.
- **Cataluña:** Año 2019-2024, con opciones, bloques y partes comunes/obligatorias bien estructuradas.
- **CatEjercicioCard:** Maneja bloques complejos incluyendo texto, fuente, instrucciones y apartados.

### Historia de España
- **Madrid:** 2022-2025 con día (Lunes/Martes/Coincidencia) + A/B. Imágenes de fuentes históricas en `/public/historia-imgs/`.
- **PDFs:** `public/historia-pdfs/` tiene 2018-2024.
- **Cataluña:** Datos con ejercicios de tipos: `analisis_fuentes`, `redaccion_terminos`, `exposicion_tema`, `test`.
- **Imagen:** Muchas preguntas requieren imagen PNG como fuente histórica — se muestran correctamente.

### Historia de la Filosofía
- **Madrid:** `examenesHistoriaFilosofiaMadrid` con años 2021-2025, Ordinaria + Extraordinaria.
- **Cataluña:** `examenesHistoriaFilosofiaCataluna` presente.
- **Implementación:** Usa `PhilosophyExamWorkspace` separado, bien encapsulado.
- **Simulacros:** NO disponible (no está en `SUBJECTS` de simulacros).
- **Flashcards:** No permitidas en BD (constraint no incluye `historia_filosofia`).

### Biología
- **Madrid:** Cobertura limitada (~1075 líneas). Usa `BIOLOGIA_TOPICS` como fallback de bloques.
- **Simulacros:** `available: true` pero puede tener pocos años para nivel Difícil.
- **Datos:** Sin Extraordinaria visible.

### Simulacros
- **Generación:** `generateSimulacro()` en `components/simulacros/data.ts` maneja Madrid y Cataluña, genera 4 bloques.
- **Guard:** Retorna `null` si no hay bloques, página muestra error amigable.
- **Doble submit:** No hay guard explícito contra doble clic, pero `loading` state previene.
- **Guardado:** Se guarda en `historial_simulacros` con RLS.
- **Corrección:** `/api/simulacro` con validación de ownership por `user_id + id`.
- **Límite:** 1 simulacro/día para usuarios normales. Bypass para internos.
- **JSON parse:** Fix de e07d07b — `parseCorrectionJson` con backslash repair + `restoreLatexEscapes`.

### Historial
- **Listado:** Últimas 50 correcciones, ordenadas por fecha. Suficiente para beta.
- **Modal:** Muestra enunciado, respuesta, corrección con `MathMarkdown format={false}`.
- **Datos truncados:** enunciado 500 chars, respuesta 1000 chars — riesgo confianza.
- **LaTeX:** Fix reciente (2fe3155) — `normalizeCorrectionText` funciona para correcciones IA.
- **Tabla sin migración:** La mayor deuda técnica del proyecto.

### Mi Plan (home `/`)
- **Funcionamiento:** Genera plan usando historial de últimas 20 correcciones.
- **API:** Usa `/api/chat` — límite 20/día, no el especializado `/api/planning` (1/semana).
- **Formato:** Markdown limpio, sin emojis, con días de semana. Bien diseñado.
- **Coste:** Cada generación = ~1000-2000 tokens de input + 2000 output ≈ $0.006/plan.

### Planning (`/planning`)
- **Funcionamiento:** Implementación separada con más contexto (perfil, asignaturas, nota objetivo).
- **API:** Usa `/api/planning` correctamente — límite 1/semana.
- **Grade Prediction:** Integra `GradePredictionCard` con predicción de nota por asignatura.
- **Datos:** Lee `historial_examenes` + `historial_simulacros`.

### Predicción de nota
- **Fórmula:** Simulacros (peso 70%) + correcciones (peso 30%). Últimos 3 simulacros con pesos decrecientes (0.5, 0.3, 0.2). Trend adjustment pequeño.
- **Confianza:** `none`/`baja`/`media`/`alta` según número de evidencias.
- **Labels:** "No oficial", "Estimación orientativa" — correcto, no promete nota exacta.
- **Empty state:** "Todavía no hay datos suficientes" — bien gestionado.
- **Rango:** min/max calculados del confidence level. No puede salir de [0,10].
- **Riesgo NaN:** `clampGrade` protege. `getScore10` devuelve null si el score es inválido. Robusto.

### Chat con Pausia
- **Endpoint:** `/api/chat` con claude-sonnet-4-6, max_tokens=4000.
- **Límites:** 5/día imagen, 20/día texto.
- **Contexto:** Historial de mensajes de la sesión (solo sesión actual, no persiste).
- **Sistema prompt:** "tutor EBAU Madrid" — bug para Cataluña.
- **Seguridad:** Auth check con Bearer token. No injection risks obvios.
- **Sin streaming:** Respuesta completa antes de mostrar — puede parecer lento en respuestas largas.

### La Zona / Flashcards
- **Flashcards:** CRUD completo con Supabase. Asignaturas: mates, fisica, quimica, biologia, ingles, lengua, historia.
- **Canvas:** Funcional en `/zona/canvas`. Sin enlace en sidebar.
- **Filosofía:** No permitida en BD para flashcards.
- **Recomendadas:** `recommendedFlashcards.ts` — lista estática hardcodeada.

### Pricing
- **Honestidad:** Excelente. Dice claramente "Los pagos todavía no están activos".
- **Planes:** Free beta, Premium previsto (7,99 €/mes), Pack PAU (19,99 € · 3 meses).
- **Interés Premium:** Botón → solo estado local, no persiste email.
- **Sin Stripe:** Correcto para beta.

### Landing
- **Estado:** Presentable. Diseño moderno, features claras.
- **Promesa:** "Corrección IA paso a paso", "Historial de progreso", "Plan de estudio personalizado" — todo existe.
- **CTA:** Login/Entrar → bien.
- **Sin screenshots** de la app real — oportunidad perdida de mostrar producto.

### Sidebar / Navegación
- **Items:** Exámenes, Simulacros, La Zona, Chat, Historial, Mi Plan, Ajustes.
- **Asignaturas:** Todas las 8 disponibles con enlace directo.
- **CCAA:** Selector en pie del sidebar, persistido en localStorage.
- **Bug:** Hardcodea "EBAU Madrid" en el header del logo.
- **Mobile:** `max-lg:block` layout básico — no hay hamburger menu ni collapsible sidebar.

---

## 7. Auditoría técnica

### Archivos más críticos
| Archivo | Líneas | Riesgo | Comentario |
|---|---|---|---|
| `app/page.tsx` | 2258 | Alto | Monolito total. Todo el estado principal |
| `app/lib/correctionPrompt.ts` | 364 | Medio | Parsing JSON + LaTeX fix reciente |
| `app/lib/mathFormatting.ts` | ~600 | Medio | Pipeline OCR + normalización |
| `app/data/quimica.ts` | 2994 | Bajo | Datos más grandes del repo |
| `app/lib/aiUsage.ts` | 148 | Medio | Rate limiting + tracking |

### Deuda técnica principal
1. **`app/page.tsx` monolito** — 2258 líneas con todo mezclado. Necesita extracción de secciones en subcomponentes.
2. **Funciones duplicadas en page.tsx** — `normalizePdfGlyphs`, `formatScientificNotation`, `normalizeSoftLineBreaks`, `formatBrokenMathBlocks` están definidas localmente en `page.tsx` (líneas 215-251) pero también en `mathFormatting.ts`. Las locales son dead code.
3. **calcMedia duplicada** — líneas 454 y 1358, shadow variable.
4. **`any` types masivos** — Casi todos los tipos en page.tsx son `any`. Dificulta refactoring seguro.
5. **Sin tests** — No hay ningún test unitario o de integración visible en el repo.

### Estado del build
- Build pasa limpio. TypeScript sin errores críticos.
- 15 rutas: 10 estáticas, 5 dinámicas (APIs + simulacro/[id]).
- `maxDuration = 60` en `/api/simulacro` — correcto para Vercel serverless.

### Riesgos de conflictos futuros
- El agente Codex tiene zona de trabajo restringida (`app/planning/page.tsx`, `app/lib/gradePrediction.ts`, `components/grade/*`). Cualquier cambio en page.tsx puede interferir si Codex actualiza imports.

---

## 8. Auditoría IA y costes

| Ruta | Archivo | Modelo | max_tokens | Límite normal | Límite interno | Tracking | Riesgo coste |
|---|---|---|---|---|---|---|---|
| `/api/chat` (texto) | `app/api/chat/route.ts` | claude-sonnet-4-6 | 4000 | 20/día | Sin límite | ✅ | Medio |
| `/api/chat` (imagen) | `app/api/chat/route.ts` | claude-sonnet-4-6 | 4000 | 5/día | Sin límite | ✅ | Medio |
| `/api/simulacro` | `app/api/simulacro/route.ts` | claude-sonnet-4-6 | 6000 | 1/día | Sin límite | ✅ | Bajo-Medio |
| `/api/planning` | `app/api/planning/route.ts` | claude-sonnet-4-6 | 2000 | 1/semana | Sin límite | ✅ | Bajo |
| Mi Plan (home) | `app/page.tsx:1329` | (vía `/api/chat`) | 4000 | 20/día chat | Sin límite | ✅ | **Alto** |

**Notas importantes:**
- El coste no se calcula en EUR — `estimated_cost_eur` siempre se inserta como `null`. Se podría añadir: `input_tokens * 0.000003 + output_tokens * 0.000015` para claude-sonnet-4-6.
- El `/api/simulacro` envía imágenes de respuesta + prompt largo (~3000 tokens mínimo) → los simulacros con imagen pueden costar $0.05-0.15 cada uno.
- Con 100 usuarios activos en beta, el gasto estimado máximo: 100 × (20 chats × $0.01 + 1 simulacro × $0.08) = $28/día.

**Límites beta razonables:**
- Chat texto: 20/día ✅ (actual)
- Chat imagen (corrección ejercicio): 5/día ✅ (actual)  
- Simulacro: 1/día ✅ (actual)
- Planning: 1/semana ✅ (actual)
- Mi Plan (home): debería usar /api/planning (1/semana) no chat

**Qué medir:**
- Total tokens/día por usuario
- Coste estimado diario (añadir campo `estimated_cost_eur`)
- Tasa de `parseCorrectionJson` fallando (monitorizar logs `SIMULACRO_CORRECTION_PARSE_ERROR_RAW`)
- Ratio imagen vs texto en correcciones

---

## 9. Auditoría Supabase y datos

### Tablas en migraciones (versionadas)
| Tabla | Migración | RLS | Notas |
|---|---|---|---|
| `flashcards` | 20260608131500 | ✅ | 4 políticas CRUD completas |
| `zona_canvases` | 20260608143000 | ? | No verificado en auditoría |
| `historial_simulacros` | 20260608152000 | ✅ | 4 políticas CRUD |
| `ai_usage_events` | 20260610133914 | ✅ (solo lectura propia) | INSERT solo desde server con service role |

### Tablas sin migración (riesgo)
| Tabla | Dónde se usa | Riesgo |
|---|---|---|
| `historial_examenes` | 7+ archivos del proyecto | **CRÍTICO** — Sin migración |

### Datos guardados
- Correcciones: enunciado (500 chars), respuesta (1000 chars), corrección completa, nota, nota_maxima
- Simulacros: bloques en JSON, respuestas parciales, resultado_json completo, nota_final, tiempo
- Flashcards: frente/reverso, asignatura, tema
- AI usage: tokens, modelo, ruta, status, metadata

### Riesgos de user_id/ownership
- `historial_examenes`: INSERT client-side con `user_id: usuario.id` — depende de RLS con `WITH CHECK`
- `historial_simulacros`: UPDATE server-side con `.eq('user_id', authContext.user.id)` — ✅ correcto
- `flashcards`, `zona_canvases`: client-side con RLS

### Mejoras futuras (sin prisa)
- Añadir migration para `historial_examenes` (urgente de hecho)
- Índice en `historial_examenes` por `user_id, created_at` para queries frecuentes
- Política de retención/exportación de datos personales (RGPD)

---

## 10. Auditoría de datos oficiales

### Cobertura por asignatura
| Asignatura | Madrid | Cataluña | Años | Extraordinaria | PDFs | Estado |
|---|---|---|---|---|---|---|
| Matemáticas II | ✅ Completo | ✅ Parcial | 2015-2025 | ✅ | No | Bueno |
| Física | ⚠️ 2018-2024 | ⚠️ Parcial+revisión | 2018-2024 | ⚠️ Solo 2022-2024 | No | Incompleto |
| Química | ✅ Bueno | ⚠️ Parcial+revisión | 2018-2025 | ✅ Parcial | ✅ | Bueno |
| Biología | ⚠️ Limitado | ❌ No | ? | ❌ No | No | Básico |
| Inglés | ✅ 2018-2025 | ❌ No | 2018-2025 | ❌ No | No | Sin Extraordinaria |
| Lengua | ✅ Existe | ✅ 2019-2024 | Varios | ❌ No | No | Aceptable |
| Historia España | ✅ 2022-2025 | ✅ Parcial | 2022-2025 | ❌ No | ✅ 2018-2024 | Aceptable |
| Historia Filosofía | ✅ 2021-2025 | ✅ Existe | 2021-2025 | ✅ | No | Bueno |

### Placeholders / revisión pendiente
- `fisica_cataluna.ts`: 3 ejercicios con `requiereRevision: true`
- `quimica_cataluna.ts`: 2 ejercicios con `requiereRevision: true`
- Biología sin Extraordinaria ni Cataluña

### Riesgos de contenido inventado
- Todos los enunciados son hardcodeados en TypeScript — no son generados por IA.
- Las respuestas de corrección SÍ son generadas por IA — el prompt incluye criterios oficiales como guía.
- Riesgo real: la IA puede aplicar criterios ligeramente incorrectos si los criterios en el prompt no están actualizados con la convocatoria exacta.

---

## 11. Auditoría UX/UI

### Diseño general
- Diseño limpio, paleta azul consistente, tipografía sólida. Aspecto profesional.
- Micro-interacciones CSS bien implementadas (hover, translate).
- Cards con sombras y bordes suaves — sensación premium para un MVP.

### Consistencia
- La home usa inline styles masivamente. Componentes en `/components/` usan Tailwind.
- Inconsistencia de approach entre `app/page.tsx` (inline styles) y el resto.

### Mobile
- Sidebar: `max-lg:relative max-lg:h-auto max-lg:w-full` — se aplana pero no es colapsable.
- Sin hamburger menu. En móvil la sidebar ocupa toda la pantalla antes del contenido.
- Muchos filtros en fila pueden desbordar en pantallas pequeñas.
- **No está lista para mobile como experiencia principal.**

### Empty states
- `EmptyQuestionsState` existe y es bonito.
- Flashcards: necesita verificar empty state.
- Planning sin datos: bien manejado.

### Mensajes de error
- Rate limits: mensajes amigables en español con `rateLimitMessages.ts`.
- Errores de red: mensajes genéricos pero funcionales.
- Sin estado de loading en algunos lugares (ej. historial al abrir modal).

### Onboarding
- **No existe.** El usuario llega y ve exámenes sin contexto.

---

## 12. Plan de acción

### Próximas 24 horas
- [ ] **Crear migración `historial_examenes`** — inspeccionar columnas en producción y versionarlas en `/supabase/migrations/`
- [ ] **Fix Mi Plan home → `/api/planning`** — cambiar endpoint en `app/page.tsx:1329`
- [ ] **Fix `format={false}` en texto_fuente de Inglés** — `app/page.tsx:1946,1954`
- [ ] **Fix CCAA en chat prompt** — incluir `ccaa` en system prompts de `app/page.tsx:1271,1306`
- [ ] **Eliminar `calcMedia` duplicada** — `app/page.tsx:454`

### Próximos 3 días
- [ ] **Banner `requiereRevision`** — `CatFisicaEjercicioCard`, `CatEjercicioCard`
- [ ] **Fix Sidebar "EBAU Madrid"** — hacerlo dinámico según `ccaa`
- [ ] **Ampliar truncación historial** — 500→2000 chars para enunciado, 1000→4000 para respuesta
- [ ] **Pricing: guardar email de interés** — tabla `premium_interest` en Supabase
- [ ] **Historia Filosofía en flashcards** — nueva migración

### Próximas 2 semanas (antes de beta privada)
- [ ] **Mobile UX básico** — sidebar colapsable, filtros responsive
- [ ] **Onboarding mínimo** — modal de CCAA en primer login
- [ ] **Añadir datos Física Madrid 2015-2017** — o ajustar rangos de dificultad
- [ ] **Inglés Extraordinaria** — si hay datos oficiales disponibles
- [ ] **Biología cobertura mínima** — añadir años faltantes
- [ ] **Cálculo coste EUR en ai_usage_events** — añadir `estimated_cost_eur` calculado
- [ ] **Tests básicos** — al menos para `parseCorrectionJson` y `calculateGradePredictions`
- [ ] **Eliminar dead code en page.tsx** — funciones duplicadas de mathFormatting

### Antes de beta pública
- [ ] Refactorizar `app/page.tsx` en componentes separados
- [ ] Onboarding completo con tutorial
- [ ] Mobile nativo (hamburger menu, sidebar colapsable)
- [ ] Política de privacidad y términos de uso
- [ ] Exportación de datos personales (RGPD)
- [ ] Stripe integration para Premium
- [ ] Analytics básicos (eventos clave: corrección, simulacro, plan generado)
- [ ] Datos Física completos (2015-2017)
- [ ] Error monitoring (Sentry o equivalente)

---

## 13. Checklist beta privada

- [ ] Exámenes Madrid probados (Mates, Física, Química, Biología, Inglés, Lengua, Historia)
- [ ] Exámenes Cataluña probados (Mates, Física, Química, Historia, Lengua)
- [ ] Filosofía Madrid + Cataluña probados
- [ ] `requiereRevision` con banner visible
- [ ] Inglés: reading texts con párrafos correctos
- [ ] Simulacro Madrid generado correctamente para las 7 asignaturas disponibles
- [ ] Simulacro Cataluña generado correctamente
- [ ] Simulacro "Fácil" Física Madrid genera 4 bloques (o mensaje claro si no hay suficientes)
- [ ] Corrección ejercicio sin JSON crudo en pantalla
- [ ] Corrección con LaTeX renderizado (fracciones anidadas, raíces)
- [ ] Historial muestra enunciados completos (no truncados)
- [ ] Historial LaTeX funciona en correcciones
- [ ] Predicción de nota sin NaN ni valores fuera de [0,10]
- [ ] Mi Plan (home) cuenta en límite de planning (1/semana)
- [ ] Mi Plan de /planning página funciona
- [ ] Límites usuario normal funcionan (20 chats, 1 simulacro, 1 plan)
- [ ] Usuario interno sin límite
- [ ] Pricing no promete pagos activos ✅ (ya correcto)
- [ ] Build pasa ✅
- [ ] Sidebar dice CCAA correcta (no hardcoded Madrid)
- [ ] Chat responde con criterios según CCAA
- [ ] Tabla `historial_examenes` tiene migración versionada
- [ ] No hay contenido inventado en enunciados (todos son datos hardcodeados)

---

## 14. Qué NO tocar todavía

- **Pagos reales / Stripe** — No hasta tener usuarios de pago confirmados en lista de espera
- **Más comunidades (Andalucía, Valencia, etc.)** — Demasiado coste de datos para beta
- **Rankings reales / comparativa entre usuarios** — Requiere más masa crítica y cuidado con datos personales
- **ML propio / modelo personalizado** — Innecesario con Claude. No añade valor aún
- **Refactor masivo de `app/page.tsx`** — Hacerlo durante beta privada romperá features. Esperará
- **App móvil nativa** — La web funciona en móvil básicamente. iOS/Android post-beta pública
- **Integraciones con colegios/institutos** — Requiere contrato, datos, soporte, RGPD específico
- **Migraciones grandes de Supabase** — El schema actual funciona. No cambiar durante beta
- **Historia del Arte, Geografía, Latín** — No hay datos. Anunciarlo cuando esté
- **Streaming de respuestas IA** — Mejora UX pero no es bloqueante para beta

---

## 15. Ideas de futuro 10/10

1. **Predicción de nota avanzada** — Modelo propio con datos históricos de Pausia, percentiles reales de EBAU vs nota del alumno
2. **Plan diario inteligente** — Hoy toca tal ejercicio según calendario de PAU y rendimiento. Notificación push.
3. **Mapa de puntos débiles visual** — Heatmap: cuáles bloques el alumno falla más, en qué años
4. **Ranking anónimo** — Ver cómo estás respecto a otros alumnos de Pausia (sin identificación)
5. **Percentiles por asignatura** — "Tu nota en Química te sitúa en el percentil 72 de los usuarios de Pausia"
6. **Mapa de temas más frecuentes** — Por año y convocatoria: qué ha salido más en cada asignatura
7. **Panel de profesor** — Un profesor puede ver el progreso de sus alumnos
8. **Informes semanales PDF** — Resumen de progreso de la semana exportable
9. **Modo hábito tipo Duolingo** — Streaks, días consecutivos de práctica, recordatorios
10. **Licencias para institutos** — Pack de N licencias para alumnos de un centro, con panel de control para el profesor

---

## 16. Conclusión

### ¿Qué tan cerca está Pausia de beta privada?
**A 4-5 días de trabajo enfocado.** Los bloqueantes son conocidos, acotados y ninguno requiere rediseño arquitectural.

### ¿Qué bloquea beta privada?
1. Migración de `historial_examenes` (riesgo de pérdida de datos)
2. Mi Plan usando límite equivocado (/api/chat vs /api/planning)
3. Sidebar "EBAU Madrid" hardcodeado para Cataluña
4. Inglés texto_fuente sin `format={false}`
5. `requiereRevision` sin warning en UI

### ¿Qué harías tú primero?
Crear la migración de `historial_examenes` hoy mismo — es el único riesgo que puede hacer perder datos permanentemente de usuarios reales. Lo demás son bugs de UX solucionables en horas.

### ¿Cuál es el mayor riesgo?
La pérdida de datos de `historial_examenes` si la BD necesita ser recreada o migrada. Seguido de la desconfianza que genera "EBAU Madrid" para alumnos de Cataluña, que es el público que Pausia ha invertido más en servir.

### ¿Cuál es la mayor oportunidad?
El sistema de simulacros + corrección IA es genuinamente bueno. La fórmula "examen oficial + corrección con criterios reales + historial" no existe en el mercado español con este nivel de calidad técnica. Si se completan los datos de Física y Biología y se arregla la UX móvil, Pausia puede captar rápidamente estudiantes en la recta final de la PAU (mayo-julio).
