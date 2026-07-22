# Auditoría de cambios de Kairo — 2026-06-11

## 1. Resumen ejecutivo

* **Estado general:** Kairo está mejor que ayer para beta privada: el build pasa, hay menos JSON crudo, las correcciones se guardan completas y se ha añadido un panel interno útil. Aun así, no está lista para beta pública ni para cobrar.
* **Build:** `npm run build` pasado el 2026-06-11. Next compiló correctamente en 4.7s y TypeScript terminó en 6.2s.
* **Riesgo global:** 🟡 Medio-alto. El producto ha avanzado, pero quedan dos riesgos estructurales: `historial_examenes` sigue sin migración/RLS versionada y `app/page.tsx` sigue siendo un monolito frágil de 2320 líneas.
* **Comparación con ayer:** Mejor en correcciones, admin, simulacros, render de enunciados y navegación de La Zona. Igual o peor en deuda de Supabase, duplicación interna y cobertura móvil.
* **Conclusión clara:** apta para una beta privada controlada con usuarios conocidos, no para beta pública abierta ni usuarios de pago.

Evidencia principal:

* `git pull --rebase --autostash origin main`: `Already up to date.`
* `git status --short`: limpio antes de crear este documento.
* Baseline usado: `e07d07b18434b727f9e2016d3814784176490049`.
* `git diff --stat e07d07b..HEAD`: 44 archivos, 9642 inserciones, 351 borrados.
* `npm run build`: passed.

## 2. Cambios detectados hoy

| Commit | Mensaje | Archivos | Área | Riesgo | Comentario |
|---|---|---|---|---|---|
| `fa80afc` | improve internal admin dashboard phase 2 | `app/admin/page.tsx`, `app/api/admin/me/route.ts`, `app/components/Sidebar.tsx`, `app/lib/adminMetrics.ts`, `docs/admin-panel.md` | Admin | Medio | Mejora control interno; toca Sidebar, archivo sensible por navegación. |
| `cd02d71` | Add biology exam data and workflow | `app/data/biologia.ts`, `app/data/biologia_cataluna.ts`, `app/lib/correctionPrompt.ts`, `app/page.tsx` | Biología / Exámenes | Alto | Añade mucha data y toca `app/page.tsx`; requiere QA manual. |
| `342f179` | Unificar filtros y apartados de examenes | `app/page.tsx`, cards Cataluña, Sidebar, planning, grade, zona | Exámenes / UI | Alto | Cambio transversal de filtros; puede pisar otros arreglos. |
| `1384a9c` | Add English exam data and workflow | `app/data/ingles.ts`, `app/data/ingles_cataluna.ts`, `app/lib/correctionPrompt.ts`, `app/page.tsx` | Inglés | Alto | Añade asignatura y toca prompt/page; requiere revisar readings y simulacros. |
| `8a993a1` | add internal admin dashboard at /admin | `app/admin/page.tsx`, `app/api/admin/metrics/route.ts`, `app/lib/adminMetrics.ts`, `docs/admin-panel.md` | Admin | Medio | Nueva superficie privada; API protegida con Bearer + internal users. |
| `67b8c20` | add Matemáticas modelo exams | `app/data/examenes.ts` | Matemáticas Modelo | Medio | Añade modelos 2018-2026; contiene LaTeX complejo, requiere visual QA. |
| `eda024d` | Unify Catalonia exam layout with Madrid | Cards Cataluña, `PhilosophyExamWorkspace`, `ExamPracticeUI` | Enunciados | Alto | Unifica layout; toca render sensible. |
| `e714620` | Improve canvas zoom and study tools | `components/zona/canvas/*`, `components/zona/types.ts` | La Zona | Medio | Canvas quedó modular; requiere prueba manual de interacción. |
| `94130c5` | Improve highlight deletion UX | `app/globals.css`, `components/shared/ExamStatement.tsx` | Enunciados | Medio | Mejora subrayado; riesgo por manipulación DOM. |
| `abf9b80` | restore formatted correction rendering | Cards, `correctionParsing`, `CorrectionResultCard`, `app/page.tsx` | Correcciones | Alto | Arreglo crítico contra JSON crudo; se debe proteger con tests. |
| `bbd9af6` | Ajustar enunciados y subrayado | Cards, Sidebar, CSS, `ExamStatement`, page | Enunciados/UI | Alto | Cambio transversal en UI de ejercicios. |
| `d40263a` | Mejorar lectura y subrayado de enunciados | Cards, Sidebar, mathFormatting, simulacros, grade | Enunciados/Math | Alto | Toca render matemático; riesgo de regresiones visuales. |
| `fb23c53` | Fix layout overlap issues | Cards, Sidebar, page, SimulacroShell | Layout | Medio | Mejora solapes; requiere móvil. |
| `bfc612f` | Fix CCAA labels planning warnings and history length | Cards, Sidebar, page | Comunidad/Historial | Alto | Ataca bugs reales, pero toca `app/page.tsx`. |
| `40aeddc` | add full technical product audit | docs | Documentación | Bajo | Baseline documental. |
| `6998784` | add Química extraordinaria exams | `app/data/quimica.ts`, PDFs public | Química | Medio | Añade oficiales Extraordinaria; requiere comprobar filtro y PDF. |
| `993304c` | stop truncating saved corrections | Cards, Philosophy, `app/page.tsx` | Historial | Alto | Soluciona corrección truncada, pero enunciado/respuesta siguen limitados. |

Archivos con más riesgo por concurrencia: `app/page.tsx`, `app/components/Sidebar.tsx`, `app/components/Cat*.tsx`, `components/shared/ExamStatement.tsx`, `app/data/*`.

## 3. Qué se ha solucionado respecto a ayer

| Problema | Estado | Evidencia | Riesgo restante |
|---|---|---|---|
| 1. `historial_examenes` sin migración versionada | 🔴 Pendiente | `find supabase/migrations` no muestra migración de `historial_examenes`; `docs/admin-panel.md` lo llama “sin migración formal”. | Crítico: no se puede recrear BD ni verificar RLS desde Git. |
| 2. Mi Plan de home usando `/api/chat` | ✅ Solucionado en home | `app/page.tsx:1349` ahora redirige a `/planning`; `app/planning/page.tsx:204` usa `/api/planning`. | `app/planning/page.tsx:208` sigue diciendo “EBAU de Madrid” en prompt. |
| 3. Textos hardcodeados “EBAU Madrid” | 🟡 Parcial | `Sidebar.tsx:128` usa Madrid/Cataluña; `app/page.tsx:180-182` tiene `examSystemLabel`. | Landing/login/layout aún hardcodean Madrid: `app/landing/page.tsx`, `app/login/page.tsx:78`, `app/layout.tsx:18`. |
| 4. `requiereRevision: true` sin aviso | 🟡 Parcial | Banner existe en `CatFisicaEjercicioCard.tsx:213` y `CatEjercicioCard.tsx:245`. | `CatHistoriaEjercicioCard.tsx` no tiene banner equivalente; quizá no lo necesita, requiere revisar data. |
| 5. Truncado `enunciado`/`respuesta` en historial | 🟡 Parcial | No hay `substring(0, 500)` ni `substring(0, 1000)`. Corrección completa ya no se trunca. | Persisten límites: `enunciado.substring(0, 2000)` y `respuesta.substring(0, 4000)` en varias cards. |
| 6. Física Madrid sin 2015-2017 | 🟡 Parcial | `app/data/fisica.ts` declara 2018-2025; no aparecen `año: 2015/2016/2017`. | `DIFFICULTIES` sigue diciendo Fácil 2015-2018; en Física Fácil solo hay 2018 real. |
| 7. Inglés `texto_fuente` sin `format={false}` | ✅ Solucionado | `app/page.tsx:1965-1972` renderiza `ExamStatement` con `format={false}` para `texto_fuente`. | 🧪 Requiere prueba manual de readings largos en Madrid/Cataluña. |
| 8. RLS de `historial_examenes` | 🔴 Pendiente | No hay migración; no se puede verificar `WITH CHECK`. Código sigue insertando desde cliente (`app/page.tsx:1296`, cards). | Riesgo de seguridad/datos depende de producción manual. |
| 9. Pricing no guarda interés real | 🔴 Pendiente | `app/pricing/page.tsx:70-71` solo `setInterest(...)`. No hay API/tabla `premium_interest`. | Se pierden leads de pago. |
| 10. `calcMedia` duplicada | 🔴 Pendiente | `app/page.tsx:476` y `app/page.tsx:1368` definen `calcMedia`. | Deuda pequeña pero señal de fragilidad en historial. |
| 11. `historia_filosofia` no permitida en flashcards | ❌ Roto | UI/tipos incluyen `historia_filosofia`, pero última migration de flashcards (`20260610020000`) no la incluye en `CHECK`. | Crear flashcards de Filosofía probablemente falla en Supabase. |
| 12. Prompts chat/planning hardcodeados a Madrid | 🟡 Parcial | `/api/chat` ya dice España/comunidad indicada; home chat usa `examSystemLabel(ccaa)`. | `/api/simulacro` system sigue “EvAU Madrid”; planning page prompt dice “EBAU de Madrid”. |
| 13. Canvas sin navegación visible | ✅ Solucionado | Sidebar tiene `La Zona`; `app/zona/page.tsx:67` enlaza `/zona/canvas`. | 🧪 Probar canvas en móvil y guardado Supabase. |
| 14. Falta onboarding inicial | 🔴 Pendiente | Hay ajustes y `useCCAA`, pero no modal inicial de CCAA/asignaturas/objetivo. | Riesgo fuerte para alumnos catalanes nuevos. |
| 15. `app/page.tsx` monolito | 🔴 Pendiente | `wc -l app/page.tsx` = 2320 líneas. Hoy se volvió a tocar en muchos commits. | Fragilidad alta ante trabajo concurrente. |
| 16. JSON crudo en correcciones | ✅ Solucionado funcionalmente | `CorrectionResultCard` usa `correctionPayloadToMarkdown`; `correctionParsing` oculta `simulacro_id`, `raw`, etc. No hay `<pre>` en rg. | 🧪 Requiere prueba manual con correcciones reales nuevas y antiguas. |
| 17. Correcciones completas en historial | ✅ Solucionado para `correccion` | Comentarios `Do not truncate full correction` y campo `correccion: visible/correccionVisible` sin substring. | Correcciones antiguas ya truncadas no se recuperan automáticamente. |
| 18. Fallback peligroso en Exámenes | 🟡 Parcial | Sigue `const examen = ... ?? examenesFiltrados[0]` en `app/page.tsx:787`; Filosofía usa fallbacks similares. | Puede mostrar otro examen si estado queda desincronizado. |
| 19. Cobertura de asignaturas | 🟡 Parcial | Se añadieron Inglés, Biología, modelos Mates, Química Extraordinaria. | Física 2015-2017 ausente; Filosofía no está en simulacros; Biología/Química Cataluña tienen muchos `requiereRevision`. |
| 20. UX móvil floja | 🟡 Parcial | Hay `max-lg`, `max-sm`, `auto-fit` en Sidebar, Simulacros y Pricing. | No hay evidencia de test visual móvil; Sidebar no es drawer real. |
| 21. Medición de costes IA | 🟡 Parcial | `ai_usage_events`, `app/lib/aiUsage.ts`, `app/lib/adminMetrics.ts` existen; admin recalcula costes. | `estimated_cost_eur` se inserta null; tracking depende de service role o falla abierto. |
| 22. Simulacros | 🟡 Parcial | Guardado/autosave y stats existen; resultados tienen fallbacks. | Filosofía no existe en `SimulacroSubject`; Física Fácil usa 2018 aunque label dice 2015-2018. |
| 23. Historial | 🟡 Parcial | Modal usa `CorrectionResultCard`; corrección completa nueva se guarda. | Tabla sin migración/RLS; enunciado/respuesta se siguen truncando a 2000/4000. |
| 24. Landing sin screenshots reales | 🔴 Pendiente | No se detectan screenshots reales; landing sigue copy comercial con Madrid. | Riesgo de conversión/confianza. |
| 25. Tests básicos inexistentes | 🔴 Pendiente | `find` excluyendo `node_modules` no devuelve tests; `package.json` no tiene script `test`. | Regresiones probables en render/parsing/simulacros. |
| 26. Cosas que no se debían tocar | 🟡 Parcial | No hay Stripe/pagos reales ni app nativa. | Sí se añadieron más asignaturas/datos y admin, aumentando superficie. |
| 27. Checklist beta privada | 🟡 Parcial | Avanzan LaTeX, límites, usuarios internos, pricing honesto, admin. | Falta migración historial, onboarding, test manual y RLS verificable. |
| 28. Admin panel `/admin` | ✅ Solucionado funcionalmente | `app/admin/page.tsx`, `/api/admin/me`, `/api/admin/metrics`, `adminMetrics` y `docs/admin-panel.md`. API exige Bearer + `isInternalUser`. | Si falta service role, panel degrada a anon/RLS y puede mostrar menos datos. |
| 29. Riesgo de trabajo concurrente | ⚠️ Riesgo nuevo | Muchos commits de varios autores tocaron los mismos archivos: `app/page.tsx`, `Sidebar`, cards, `ExamStatement`, datos. | Requiere ramas cortas, PRs y pull/rebase antes de tocar. |
| 30. Veredicto final de ayer | 🟡 Parcial | Está mejor para beta privada; no resuelve deuda crítica de DB ni onboarding. | No apta para beta pública. |

## 4. Qué sigue pendiente

| Problema | Prioridad | Por qué importa | Archivo(s) |
|---|---|---|---|
| Crear migración real de `historial_examenes` con RLS e índices | P0 | Es la tabla clave de historial/correcciones/plan/nota estimada. | `supabase/migrations/*`, producción Supabase |
| Añadir `historia_filosofia` al CHECK de flashcards | P0 | La UI permite la asignatura, pero DB puede rechazar inserts. | `supabase/migrations/*`, `components/zona/Flashcards.tsx` |
| Corregir prompts Madrid en planning/simulacro | P0 | Cataluña puede recibir criterios incorrectos. | `app/planning/page.tsx:208`, `app/api/simulacro/route.ts:198` |
| Resolver duplicación `calcMedia` | P1 | Evita inconsistencias de media en historial. | `app/page.tsx` |
| Quitar fallback silencioso de examen | P1 | Evita mostrar una pregunta equivocada. | `app/page.tsx`, `PhilosophyExamWorkspace.tsx` |
| Ajustar Física Fácil o añadir 2015-2017 | P1 | Simulacros fáciles de Física son poco variados. | `app/data/fisica.ts`, `components/simulacros/data.ts` |
| Guardar leads de pricing | P1 | Se pierden usuarios interesados en pagar. | `app/pricing/page.tsx`, futura tabla/API |
| Onboarding CCAA/asignaturas | P1 | Primera impresión y comunidad correcta. | nueva UI ligera, `useCCAA`, `settings` |
| Añadir tests de parser/render/rate limit | P1 | Evita regresiones recurrentes. | tests nuevos, sin tocar data oficial |
| QA móvil real | P2 | Muchos alumnos usarán móvil. | Sidebar, filtros, simulacros, historial, admin |

## 5. Qué se ha roto nuevo

| Nuevo problema | Impacto | Dónde | Prioridad |
|---|---|---|---|
| Flashcards de Filosofía están expuestas en UI pero no permitidas por constraint | Insert fallará para usuarios que creen tarjetas de Filosofía. | `components/zona/types.ts`, `Flashcards.tsx`, migrations flashcards | P0 |
| `ai_usage_events` no tiene policy de insert para anon y el helper falla abierto | Si falta service role, no hay tracking fiable ni límites estrictos. | `supabase/migrations/20260610133914_create_ai_usage_events.sql`, `app/lib/aiUsage.ts` | P1 |
| Planning sigue con prompt “EBAU de Madrid” | Confianza baja para Cataluña; posible contenido incorrecto. | `app/planning/page.tsx:208` | P0 |
| Simulacros no incluyen Filosofía | Inconsistencia con asignaturas principales. | `components/simulacros/types.ts`, `components/simulacros/data.ts` | P2 |

No he detectado un build roto: `npm run build` pasa.

## 6. Auditoría de correcciones e historial

* **JSON crudo:** ✅ mejorado. `components/shared/CorrectionResultCard.tsx` delega en `correctionPayloadToMarkdown`; `app/lib/correctionParsing.ts` oculta claves técnicas como `simulacro_id`, `raw`, `user_id`, `model` y detecta JSON crudo.
* **Render bonito:** ✅ el modal de historial en `app/page.tsx` usa `CorrectionResultCard` para `itemSeleccionado.correccion`.
* **LaTeX:** ✅/🧪 `CorrectionResultCard` usa `MathMarkdown format={false}`; `mathFormatting.ts` contiene normalizaciones para `frac`, `sqrt`, `lambda`, `mathbbR`, `displaystylelim`. Requiere prueba manual con matrices, fracciones, sistemas y química.
* **Truncado:** ✅ para corrección completa; 🟡 para enunciado/respuesta. La corrección ya no se corta, pero `enunciado` se limita a 2000 y `respuesta` a 4000 en varias inserciones.
* **Historial completo:** 🟡 nuevas correcciones completas sí; datos antiguos cortados no se pueden recuperar sin regenerar.
* **Riesgo de RLS:** 🔴 `historial_examenes` sigue sin migración versionada; `app/page.tsx:584` lee `historial_examenes` sin `.eq('user_id', usuario.id)`, confiando en RLS de producción.

## 7. Auditoría de enunciados y Matemáticas Modelo

* **Diseño nuevo:** ✅ hay `ExamStatement`, subrayado y tarjetas compartidas. El build confirma que compila.
* **LaTeX:** 🧪 hay mucho LaTeX nuevo en `app/data/examenes.ts`; `rg` encuentra matrices, `\frac`, `\sqrt`, `\lambda`, `\begin{cases}`. Necesita recorrido manual por años/opciones.
* **Contenido oficial:** 🟡 modelos de Mates 2018-2026 añadidos en `app/data/examenes.ts`; algunos enunciados incluyen placeholders tipo “gráfica incluida en PDF oficial”, correcto como cautela pero visualmente limitado.
* **Filtros:** ✅ `app/page.tsx:1652` muestra `Modelo` para Madrid; Cataluña oculta Modelo.
* **Riesgo:** Alto por tocar `app/data/examenes.ts` con muchas fórmulas y por `app/page.tsx` monolítico.

## 8. Auditoría del admin panel

* **Existencia:** ✅ `/admin`, `/api/admin/me`, `/api/admin/metrics`, `app/lib/adminMetrics.ts`, `docs/admin-panel.md` existen.
* **Seguridad:** ✅ API admin exige Bearer token y `isInternalUser(email)`. El Sidebar solo muestra “Panel interno” si `/api/admin/me` responde `isAdmin: true`.
* **Service role:** ✅ se usa server-side en `adminMetrics.ts`; no se expone en cliente.
* **Métricas:** 🟡 calcula llamadas, tokens, coste estimado, errores, usuarios top, simulacros y actividad reciente.
* **Coste:** 🟡 profesional como estimación; `estimated_cost_eur` no se persiste, se recalcula.
* **Usuarios:** 🟡 enmascara user_id (`maskUserId`), bien para privacidad básica.
* **Mejoras recomendadas:** mostrar aviso si falta service role, añadir filtros por usuario/ruta, export CSV, y documentar umbrales de coste.

## 9. Auditoría de Supabase y RLS

* **`historial_examenes`:** 🔴 sin migración versionada. Es el mayor riesgo de producción.
* **`historial_simulacros`:** ✅ migración con RLS, SELECT/INSERT/UPDATE/DELETE, `WITH CHECK (auth.uid() = user_id)` e índice `user_id, created_at desc`.
* **`ai_usage_events`:** 🟡 migración con tabla, índices y policy de SELECT propia. No hay INSERT policy para anon; escritura fiable requiere `SUPABASE_SERVICE_ROLE_KEY`.
* **`flashcards`:** 🟡 RLS correcta, pero constraint final no incluye `historia_filosofia` pese a que UI/tipos sí.
* **Service role:** 🟡 usado solo server-side en `app/lib/adminMetrics.ts`, `app/lib/aiUsage.ts` y `/api/simulacro`. Riesgo: fallback a anon en helpers puede degradar límites/tracking.
* **Policies:** ✅ para canvases, flashcards y simulacros; 🔴 no verificable para historial_examenes.

## 10. Auditoría de IA y costes

* **Rutas IA detectadas:** `/api/chat`, `/api/planning`, `/api/simulacro`.
* **Modelos:** `claude-sonnet-4-6` en las tres rutas.
* **Tokens:** chat `max_tokens: 4000`, planning `2000`, simulacro `6000`.
* **Auth:** ✅ las tres rutas exigen Authorization Bearer token.
* **Límites:** chat 20/día, imagen 5/día, planning 1/semana, simulacro 1/día para usuarios normales. Internos saltan límite con `INTERNAL_USER_EMAILS`.
* **Tracking:** 🟡 `logAiUsageEvent` guarda route/action/model/tokens/status; no guarda coste en DB.
* **Coste:** 🟡 admin lo estima con constantes internas. Suficiente para beta, no para facturación.
* **Riesgo de coste descontrolado:** Medio. Si `ai_usage_events` falla, `checkAiRateLimit` devuelve `allowed: true`; es bueno para UX, malo para control estricto.
* **Mi Plan:** ✅ usa endpoint correcto en `/planning`; 🟡 prompt aún Madrid.

## 11. Auditoría UX/UI

* **Confianza:** mejora con correcciones formateadas, banner de revisión y admin interno.
* **Mobile:** 🟡 hay clases `max-lg`, `max-sm`, grids responsive y `auto-fit`, pero falta prueba visual real. Sidebar pasa a ancho completo, no drawer.
* **Comunidad:** 🟡 experiencia principal usa Madrid/Cataluña; landing/login/metadata siguen Madrid.
* **Sidebar:** ✅ más completa, incluye Simulacros, La Zona, Ajustes y panel interno condicional. Riesgo por tocarla varios commits.
* **Empty states:** 🟡 existen en Simulacros, Zona y resultados; menos claro en historial si RLS/tabla falla.
* **Lo que puede romper confianza:** errores de comunidad Madrid en planning, flashcards Filosofía fallando, historial incompleto antiguo, y falta de onboarding inicial.

## 12. Riesgos por trabajo concurrente

Archivos tocados por varias personas hoy:

* `app/page.tsx`: exámenes, historial, chat, planning, datos, render y navegación.
* `app/components/Sidebar.tsx`: navegación, comunidad, admin.
* `app/components/CatEjercicioCard.tsx`, `CatFisicaEjercicioCard.tsx`, `CatHistoriaEjercicioCard.tsx`, `CatPreguntaCard.tsx`: render, corrección, historial.
* `components/shared/ExamStatement.tsx`: subrayado y MathMarkdown.
* `app/data/*`: muchas asignaturas nuevas o ampliadas.
* `components/simulacros/data.ts`: generación de simulacros por asignatura/comunidad.

Recomendaciones:

1. Antes de tocar: `git pull --rebase --autostash origin main` siempre.
2. Congelar `app/page.tsx` salvo bugs P0; mover cambios a componentes pequeños.
3. Una tarea por commit, evitando commits mixtos de data + UI + prompt.
4. Crear tests para parsing de corrección y generación de simulacros.
5. No añadir más asignaturas hasta cerrar migración de historial y onboarding.

## 13. Top 20 prioridades actualizadas

1. **P0 / Alto / Medio / Supabase:** crear migración de `historial_examenes` con RLS e índices.
2. **P0 / Alto / Bajo / Flashcards:** permitir `historia_filosofia` en constraint.
3. **P0 / Alto / Bajo / Planning:** cambiar prompt hardcoded Madrid a comunidad dinámica.
4. **P0 / Alto / Bajo / Simulacro API:** cambiar system “EvAU Madrid” por comunidad dinámica.
5. **P1 / Alto / Medio / `app/page.tsx`:** eliminar fallback silencioso `examenesFiltrados[0]` con empty state.
6. **P1 / Alto / Medio / Historial:** filtrar lectura por `user_id` además de RLS.
7. **P1 / Medio / Bajo / Historial:** decidir si `enunciado/respuesta` deben guardarse completos o con preview separado.
8. **P1 / Alto / Medio / Onboarding:** modal inicial de CCAA, asignaturas, objetivo y examen.
9. **P1 / Medio / Bajo / Simulacros:** ajustar dificultad Física Fácil o añadir 2015-2017 oficiales.
10. **P1 / Medio / Bajo / Simulacros:** documentar o añadir Filosofía.
11. **P1 / Alto / Medio / Tests:** tests de `correctionParsing`, `mathFormatting`, simulacros por CCAA.
12. **P1 / Medio / Bajo / Pricing:** guardar interés premium en DB/API.
13. **P1 / Medio / Medio / IA:** hacer límites fail-closed configurable cuando falte tracking.
14. **P1 / Medio / Bajo / Admin:** aviso visible si no hay service role.
15. **P2 / Medio / Alto / UI:** QA móvil completa.
16. **P2 / Medio / Medio / Landing:** screenshots reales y copy multi-CCAA.
17. **P2 / Bajo / Bajo / `calcMedia`:** quitar duplicado.
18. **P2 / Medio / Medio / Admin:** exportar métricas o CSV.
19. **P2 / Bajo / Medio / Canvas:** prueba manual de imagen/export/zoom.
20. **P2 / Medio / Alto / Arquitectura:** extraer `app/page.tsx` gradualmente.

## 14. Checklist antes de beta privada

* [ ] P0 Crear migración de `historial_examenes` con RLS real.
* [ ] P0 Arreglar flashcards Filosofía.
* [ ] P0 Quitar prompts hardcoded Madrid en planning/simulacro.
* [ ] P0 Probar manualmente correcciones nuevas de Mates, Física, Química, Inglés y Filosofía.
* [ ] P1 Verificar que `historial_examenes` tiene RLS en producción.
* [ ] P1 QA simulacros: crear, autosave, entregar, fallo IA, rate limit.
* [ ] P1 QA Comunidad: Madrid/Cataluña en Sidebar, filtros, prompts y resultados.
* [ ] P1 QA móvil básica en iPhone ancho pequeño.
* [ ] P1 Validar pricing honesto sin prometer Premium real.
* [ ] P1 Revisar admin con usuario interno y usuario normal.

## 15. Checklist antes de beta pública

* [ ] P0 Onboarding inicial para comunidad/asignaturas/objetivo.
* [ ] P0 Tests mínimos para parser, render y simulacros.
* [ ] P0 Métricas IA robustas y alertas de gasto.
* [ ] P1 Landing multi-CCAA con screenshots reales.
* [ ] P1 Captura de leads premium real.
* [ ] P1 Política clara de límites Free/Premium.
* [ ] P1 Refactor parcial de `app/page.tsx`.
* [ ] P1 Cobertura de asignaturas documentada en UI.
* [ ] P2 Mejoras mobile: sidebar drawer, filtros compactos, historial modal.
* [ ] P2 Admin exportable y monitorización básica.

## 16. Qué NO tocar todavía

* Stripe/pagos reales.
* Más comunidades autónomas.
* Rankings públicos.
* ML propio.
* App móvil nativa.
* Integraciones con colegios/institutos.
* Refactor masivo de toda la app.
* Más asignaturas sin cerrar migraciones, onboarding y QA.
* Cambios grandes de Supabase sin inspeccionar producción.
* Reescritura completa de `app/page.tsx`.

## 17. Veredicto final

* **¿Está mejor que ayer?** Sí. El build pasa, las correcciones están mejor formateadas, el historial nuevo guarda corrección completa, hay admin interno y más cobertura de exámenes.
* **¿Qué se arregló de verdad?** JSON crudo en correcciones, corrección completa no truncada, navegación de Canvas, endpoint correcto de Mi Plan, auth/límites IA, admin interno y parte de comunidad Madrid/Cataluña.
* **¿Qué sigue siendo crítico?** `historial_examenes` sin migración/RLS versionada, flashcards Filosofía bloqueadas por constraint, prompts Madrid en planning/simulacro, falta de onboarding y falta de tests.
* **¿Qué se rompió nuevo?** No hay build roto. El riesgo nuevo más claro es la incoherencia Filosofía en flashcards: UI sí, DB no. También aumentó el riesgo de concurrencia por cambios masivos en archivos compartidos.
* **¿Qué haría primero mañana?** Crear/verificar migración de `historial_examenes`, arreglar flashcards Filosofía, quitar prompts Madrid, y hacer QA manual de correcciones/historial con 5 asignaturas.
* **¿Lista para beta privada?** Sí, con usuarios internos y pocas invitaciones, avisando que sigue en beta.
* **¿Lista para beta pública?** No. Falta cerrar datos/RLS, onboarding, móvil, tests y consistencia de comunidad.
