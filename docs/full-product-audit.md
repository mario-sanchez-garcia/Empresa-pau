# Pausia - Full Product Audit

Fecha de auditoria: 2026-06-10  
Modo de trabajo: solo lectura de producto y creacion de informe. No se tocaron datos oficiales, LaTeX, prompts, schema ni logica de la app.

## 1. Resumen ejecutivo

Pausia ya tiene una base muy potente para una beta privada: autentificacion con Supabase, banco de examenes por asignatura, simulacros con correccion IA, historial, planning, flashcards y un canvas tipo Miro. La amplitud de asignaturas y la integracion de examenes oficiales dan una sensacion de producto real, no demo.

El principal problema no es que falten ideas, sino que hay demasiadas piezas criticas viviendo juntas en archivos grandes y con poca proteccion operativa. En especial, `app/page.tsx` concentra seleccion de asignaturas, render de examenes, correccion, chat, historial y plan IA en mas de 2.000 lineas. Eso aumenta el riesgo de regresiones cuando se anaden asignaturas o se cambia el render de formulas.

La app parece adecuada para una beta privada controlada con pocos usuarios de confianza, pero todavia no la cobraria ni la presentaria a colegios sin poner limites de uso, limpiar algunos estados incongruentes y asegurar que todos los flujos criticos fallan de forma amable.

## 2. Top 10 prioridades ahora

1. Anadir limites de uso por usuario antes de abrir beta publica: correcciones, simulacros, chat y planning.
2. Arreglar la constraint de `flashcards`: la UI permite Ingles, pero la migracion final no incluye `ingles`.
3. Quitar logs con datos de usuario/respuestas, especialmente `SIMULACRO_INSERT_ROW`.
4. Proteger rutas IA del servidor con verificacion de sesion/propiedad cuando modifican registros.
5. Persistir inicio/tiempo de simulacros para que refrescar no reinicie el cronometro.
6. Guardar respuestas de simulacro en `beforeunload` o debounce corto para reducir perdida de respuestas.
7. Crear migraciones/documentacion para tablas usadas pero no versionadas: `historial_examenes`, `perfiles`, `tareas_completadas`, `progreso`.
8. Alinear landing con estado real del producto: Biologia aparece como no lista, y se promete cobertura "desde 2010" que no coincide con datasets auditados.
9. Separar `app/page.tsx` en componentes/logic hooks por seccion cuando termine el trabajo de LaTeX.
10. Crear una pagina/estado de error comun para llamadas IA: sin `alert`, sin spinners infinitos, sin correccion rota.

## 3. Bugs criticos detectados

- **Flashcards de Ingles probablemente fallan al guardar.** `components/zona/Flashcards.tsx` permite `subject: 'ingles'`, pero `supabase/migrations/20260609120000_allow_biologia_flashcards.sql` deja la constraint en `('mates', 'fisica', 'quimica', 'biologia', 'lengua', 'historia')`, sin `ingles`.
- **Riesgo de coste sin limites.** `/api/chat`, `/api/planning` y `/api/simulacro` no muestran rate limiting, cuotas por usuario, control de frecuencia ni bloqueo por plan.
- **Riesgo de modificacion indebida en simulacros.** `/api/simulacro/route.ts` puede usar `SUPABASE_SERVICE_ROLE_KEY` y actualiza por `id` sin comprobar en la API que el usuario autenticado es propietario del simulacro. El cliente filtra por usuario, pero el endpoint servidor debe validarlo tambien.
- **Timer de simulacro no persistente.** `app/simulacros/[id]/page.tsx` inicia siempre `TOTAL_SECONDS`, asi que refrescar puede reiniciar el tiempo visual.
- **Autosave de simulacros insuficiente.** Las respuestas se guardan cada 30s y en entrega, pero no hay guardado fiable al cerrar pestana. El estudiante puede perder los ultimos cambios.
- **Tablas Supabase no completamente versionadas.** El codigo usa `historial_examenes`, `perfiles`, `tareas_completadas` y `progreso`, pero las migraciones auditadas solo crean flashcards, canvases e historial de simulacros.
- **Landing no refleja producto real.** Biologia aparece `ready: false` aunque la app ya la ofrece; tambien se dice "desde 2010 hasta hoy", pero los datos contados empiezan en 2015 para Mates, 2018 para Historia/Fisica/Ingles, 2019 para Lengua, 2020 para Biologia.

## 4. Riesgos de confianza del usuario

- Si un alumno crea flashcards de Ingles y falla silenciosamente, siente que "la app no guarda".
- Si un simulacro falla por IA pero deja un estado raro, afecta mucho porque el usuario acaba de invertir 90 minutos.
- Si la landing promete anos/asignaturas que luego no aparecen, baja confianza antes de pagar.
- Si un enunciado depende de OCR parcial o imagen pendiente, debe avisarse de forma consistente, no solo en algunas tarjetas.
- Si el chat o correccion se queda cargando por error de API, el usuario no sabe si reintentar o si ha perdido la respuesta.
- Si el tiempo del simulacro se reinicia al recargar, el resultado pierde credibilidad academica.

## 5. Auditoria por seccion

### Examenes

Existe en `app/page.tsx`. Incluye seleccion de asignatura, comunidad autonoma, convocatoria, ano, bloque, opcion, respuesta por texto/foto, correccion IA, historial, chat y plan IA.

Fortalezas:
- Amplia cobertura de asignaturas.
- Render con `MathMarkdown` y KaTeX ya centralizado en `components/shared/MathMarkdown.tsx`.
- Buen fallback para filtros sin preguntas.
- Soporte de Madrid y Cataluna en varias asignaturas.

Problemas:
- `app/page.tsx` tiene 2.190 lineas y muchas responsabilidades.
- La correccion de ejercicios individuales usa `/api/chat`, no un endpoint dedicado con validacion/rate limit.
- `corregir`, `enviarChat` y `generarPlan` no tienen control robusto de errores de red.
- Hay estado compartido entre Historia, Lengua e Ingles (`diaHistoriaIdx`) que funciona, pero es facil de romper.

### Ingles

Existe como asignatura en datasets, sidebar, examenes, chat, planning y simulacros.

Fortalezas:
- Dataset Madrid contado: 26 variantes, 2018-2025, opciones A/B y sesiones 2025 `Unica`, 130 preguntas.
- La pantalla de Examenes muestra "Preguntas del apartado" antes del texto, lo cual mejora la usabilidad.

Problemas:
- En simulacros, `SimulacroOption` solo acepta A/B; los examenes 2025 `Unica` pueden quedar fuera.
- `THEME_ORDER.ingles` omite Q3, asi que vocabulario no entra en simulacros.
- Flashcards de Ingles probablemente chocan con la constraint SQL.
- Cataluna no tiene Ingles; el empty state existe, pero conviene explicarlo con lenguaje claro.

### Simulacros

Rutas principales: `app/simulacros/page.tsx`, `app/simulacros/[id]/page.tsx`, `app/simulacros/[id]/results/page.tsx`, `components/simulacros/data.ts`.

Fortalezas:
- Flujo completo: generar, guardar, responder, entregar, corregir, ver resultados.
- Resultados ya tienen fallbacks utiles por tab.
- Se evita doble submit con `submitting`.
- Stats basicos cuentan solo simulacros completados.

Problemas:
- Timer no persistente.
- Autosave cada 30s puede perder cambios recientes.
- Doble escritura: API actualiza el simulacro y cliente vuelve a actualizarlo al recibir resultado.
- `console.log('SIMULACRO_INSERT_ROW', row)` expone datos completos de simulacro/respuestas en consola.
- No hay cuotas ni control de coste.
- El endpoint servidor deberia verificar ownership antes de actualizar.

### Historial

En Examenes usa `historial_examenes`; en Simulacros usa `historial_simulacros`.

Fortalezas:
- Permite revisar correcciones y abrir chat contextual.
- Las estadisticas basicas del home ya agregan notas por asignatura.

Problemas:
- Hay dos historiales separados con esquemas distintos.
- No hay migracion auditada para `historial_examenes`.
- El historial de simulacros solo tiene stats basicos; falta progreso reciente y media por asignatura.

### Mi Plan

Dentro de `app/page.tsx` como seccion `planning`, genera plan semanal a partir de `historial_examenes`.

Fortalezas:
- Usa historial real del alumno.
- El prompt evita inventar asignaturas externas.

Problemas:
- Usa `/api/chat` con `max_tokens: 4000`, coste alto para una salida que podria usar modelo mas barato o endpoint especifico.
- No cachea planes ni detecta si no hubo cambios desde el ultimo plan.
- No hay limite semanal.

### Planning

Ruta independiente `app/planning/page.tsx`.

Fortalezas:
- Onboarding con fecha, horas y asignaturas flojas.
- Guarda tareas y replanifica tareas atrasadas.

Problemas:
- Endpoint `/api/planning` usa `claude-opus-4-5`; alto coste para planificacion frecuente.
- No hay migraciones auditadas para `perfiles`, `tareas_completadas` ni `progreso`.
- No hay cuota ni cache.
- El parser de JSON es basico; si el modelo devuelve algo raro, se queda en plan vacio.

### La Zona

Rutas `app/zona/page.tsx` y `app/zona/canvas/page.tsx`. Componentes en `components/zona`.

Fortalezas:
- Flashcards funcionales con flip, swipe y creacion manual.
- Canvas con herramientas, auto-save, storage de imagenes y exportacion.
- Buen potencial diferencial para estudiantes visuales.

Problemas:
- `components/zona/Flashcards.tsx` usa mucho estilo inline y mide 330 lineas.
- `components/zona/canvas/useCanvas.ts` mide 510 lineas; es un hook muy cargado.
- No hay generacion IA de flashcards ni limites de imagenes.
- Constraint SQL de flashcards desalineada con UI.
- El texto de empty state incluye icono Unicode; si se quiere mantener consistencia sobria, revisarlo.

### Chat

Seccion en `app/page.tsx`; API `app/api/chat/route.ts`.

Fortalezas:
- Admite texto e imagenes.
- Puede abrir contexto desde historial.

Problemas:
- Sin rate limit ni cuotas.
- Sin try/catch en route.
- El historial de conversacion se manda completo en texto, sin resumen ni limite fuerte.
- No hay persistencia de chats.

### Landing

Ruta `app/landing/page.tsx`.

Fortalezas:
- Se ve como producto comercial.
- Explica bien propuesta: examenes, IA, historial, planning, flashcards.

Problemas:
- Biologia marcada como no lista, pero en app esta activa.
- Promesa de anos "desde 2010" no coincide con datos auditados.
- README sigue siendo el default de Next.js; resta profesionalidad en demo tecnica/inversores.

### Sidebar y navegacion

Componente `app/components/Sidebar.tsx`; CCAA en `app/hooks/useCCAA.ts`.

Fortalezas:
- Navegacion clara y consistente.
- CCAA persistida en localStorage.
- Todas las asignaturas actuales aparecen.

Problemas:
- Hay dos conceptos parecidos: `Mi Plan` dentro de `/` y `Planning` en `/planning`; puede confundir.
- La CCAA vive solo en localStorage, no en perfil; en nuevo dispositivo vuelve a Madrid.
- En mobile, el sidebar pasa a bloque superior completo; puede ocupar mucho espacio.

## 6. Auditoria de datos oficiales

Recuento por archivos auditados:

- Madrid Matematicas II: `app/data/examenes.ts`, 16 examenes, anos 2015-2025, 127 preguntas.
- Madrid Historia: `app/data/examenes.ts`, 25 variantes, anos 2018-2025, 77 preguntas, dias Lunes/Martes en varios anos.
- Madrid Fisica: `app/data/fisica.ts`, 11 examenes agrupados, anos 2018-2025, 107 preguntas; tambien conserva `examenesF` raw.
- Madrid Quimica: `app/data/quimica.ts`, 8 examenes, anos 2018-2025, 78 preguntas.
- Madrid Biologia: `app/data/biologia.ts`, 6 examenes, anos 2020-2025, 59 preguntas.
- Madrid Ingles: `app/data/ingles.ts`, 26 variantes, anos 2018-2025, 130 preguntas.
- Madrid Lengua: `app/data/lengua.ts`, 10 examenes, anos 2019-2024, 30 preguntas.
- Cataluna Matematicas/Historia: `app/data/examenes_cataluna.ts`, objeto con 6 claves para Historia y `examenesCatMates` con 28 entradas 2023-2025.
- Cataluna Fisica: 10 examenes 2021-2025, 16 ejercicios.
- Cataluna Quimica: 8 examenes 2022-2025, 14 ejercicios.
- Cataluna Lengua: 9 examenes 2021-2025.

Riesgos:
- Algunas preguntas catalanas estan marcadas como OCR parcial/revision requerida.
- Simulacros no soportan todas las asignaturas en Cataluna; devuelven empty state para las no disponibles.
- Ingles 2025 con opcion `Unica` no encaja del todo con el tipo A/B de simulacros.
- El producto debe etiquetar claramente cuando una pregunta necesita imagen oficial o PDF.

## 7. Auditoria IA y costes

Entry points IA detectados:

- `app/api/chat/route.ts`
  - Modelo: `claude-sonnet-4-6`
  - `max_tokens`: 4000
  - Usos: correccion de ejercicios, chat tutor, plan IA del home, tarjetas catalanas.
  - Riesgo coste: alto.
  - User-triggered: si.
  - Spammable: si.
  - Rate limiting: no detectado.

- `app/api/simulacro/route.ts`
  - Modelo: `claude-sonnet-4-6`
  - `max_tokens`: 6000
  - Usos: correccion completa de simulacros.
  - Riesgo coste: muy alto.
  - User-triggered: si.
  - Spammable: parcialmente mitigado por doble submit en cliente, pero sin limite servidor.
  - Rate limiting: no detectado.

- `app/api/planning/route.ts`
  - Modelo: `claude-opus-4-5`
  - `max_tokens`: 2000
  - Usos: planning semanal de `/planning`.
  - Riesgo coste: alto por modelo caro.
  - User-triggered: si.
  - Spammable: si.
  - Rate limiting: no detectado.

Recomendacion de limites antes de beta:

- Free: 3 correcciones/dia, 1 simulacro/semana, 1 plan/semana, 20 mensajes chat/dia.
- Premium: 30 correcciones/dia, 5 simulacros/semana, 3 planes/semana, 150 mensajes chat/dia.
- Pro/colegios: limites por aula y dashboard docente, no ilimitado real.

Tablas recomendadas para control futuro:

- `usage_events`: `id`, `user_id`, `action_type`, `model`, `input_tokens`, `output_tokens`, `cost_estimate`, `metadata`, `created_at`.
- `user_limits`: `user_id`, `plan`, `daily_corrections`, `weekly_simulacros`, `weekly_plans`, `daily_chat_messages`, `updated_at`.
- `billing_profiles`: `user_id`, `stripe_customer_id`, `plan`, `status`, `current_period_end`.

## 8. Auditoria tecnica

Fortalezas:
- Next.js App Router.
- TypeScript en todos los archivos principales.
- Supabase Auth y RLS en migraciones nuevas.
- KaTeX integrado.
- Dynamic import con `ssr:false` para canvas, buena decision.
- Build actual se debe validar antes de commit.

Deuda tecnica:
- `app/page.tsx` demasiado grande.
- Muchas estructuras usan `any`, especialmente examenes y correcciones.
- Varias rutas cliente escriben directamente en Supabase.
- Falta capa de servicio para acciones IA/correcciones.
- Falta migracion de tablas antiguas.
- Falta test basico para `generateSimulacro`, `parseCorrectionJson`, stats y constraint de subjects.
- README no documenta Pausia ni deployment real.

## 9. Auditoria UX/UI

Lo fuerte:
- El look general es moderno y consistente.
- Las tarjetas de asignatura tienen identidad visual clara.
- Simulacros y resultados han mejorado mucho en claridad.
- La Zona aporta diferenciacion.

Inconsistencias:
- Hay mucho estilo inline mezclado con Tailwind.
- `Mi Plan` y `Planning` se sienten solapados.
- Landing, app y datasets no siempre cuentan la misma historia de disponibilidad.
- Algunas pantallas grandes pueden ser densas en mobile, especialmente sidebar, filtros y canvas.
- Los estados de error IA deben ser consistentes: misma caja, mismo copy, misma accion siguiente.

## 10. Plan de accion recomendado

### Antes de mostrar a usuarios

- P0, Flashcards: incluir `ingles` en constraint o esconder Ingles en flashcards. Dificultad baja. Importa porque rompe guardado.
- P0, IA: anadir cuotas simples por usuario en servidor. Dificultad media. Importa porque evita gasto accidental.
- P0, Simulacros: quitar logs con datos sensibles. Dificultad baja. Importa por privacidad.
- P0, Simulacros: validar ownership en `/api/simulacro`. Dificultad media. Importa por seguridad.
- P0, Landing: corregir Biologia y promesa de anos. Dificultad baja. Importa por confianza.

### Beta privada

- P1, Simulacros: persistir inicio/tiempo y autosave al cerrar pestana. Dificultad media.
- P1, Examenes: try/catch visual en correcciones, chat y plan. Dificultad media.
- P1, Supabase: versionar migraciones de tablas antiguas. Dificultad media.
- P1, Planning: cachear ultimo plan y limitar regeneracion. Dificultad media.
- P1, Ingles: decidir tratamiento de 2025 `Unica` en simulacros. Dificultad baja/media.

### Beta publica/premium

- P1, Billing: integrar plan Free/Premium con limites reales. Dificultad alta.
- P1, Observabilidad: logging de errores sin respuestas completas. Dificultad media.
- P2, Dashboard progreso: progreso por asignatura y bloque. Dificultad media.
- P2, Chat persistente: conversaciones guardadas por usuario. Dificultad media.
- P2, Refactor: extraer `app/page.tsx` por secciones. Dificultad alta, hacerlo tras estabilizar LaTeX/datos.

## 11. Quick wins

1. Corregir copy de landing y README.
2. Eliminar `console.log('SIMULACRO_INSERT_ROW', row)`.
3. Arreglar constraint de flashcards para Ingles.
4. Crear empty state especifico para Cataluna cuando una asignatura no existe aun.
5. Anadir try/catch y mensaje visual unico a `/api/chat` consumers.
6. Guardar `pausia_ccaa` tambien en perfil cuando exista.
7. Anadir `last_saved_at` visual en simulacros activos.

## 12. No tocar todavia

- No tocar datos oficiales mientras haya trabajo activo de extraccion/formato.
- No tocar `MathMarkdown`, `mathFormatting` o KaTeX mientras se esta estabilizando LaTeX.
- No hacer refactor grande de `app/page.tsx` hasta que terminen las tareas de formulas y datasets.
- No cambiar schema Supabase sin coordinar migraciones y entorno remoto.
- No activar cobros hasta tener cuotas, logs seguros y politicas de uso.

## 13. Comandos ejecutados

- `git pull --rebase --autostash origin main`
- `git status --short --branch`
- `find app components supabase -maxdepth 4 -type f | sort`
- `cat package.json`
- `sed` sobre rutas principales: `app/api/*`, `app/simulacros/*`, `app/zona/*`, `app/components/Sidebar.tsx`, `app/planning/page.tsx`, `app/login/page.tsx`, `app/landing/page.tsx`, `components/shared/MathMarkdown.tsx`, migraciones Supabase.
- `rg` para detectar usos de IA, Supabase, logs, placeholders, estados incompletos y navegacion.
- Script Node de solo lectura para contar datasets por asignatura/ano/opcion.
- `wc -l` para tamano de archivos clave.
- `npm run build` pasado correctamente con Next.js 16.2.7; compilacion y TypeScript OK.

## 14. Conclusion

Pausia esta cerca de una beta privada buena si se controla el acceso y se reduce el riesgo operativo. La propuesta es fuerte: examenes oficiales, IA correctora, simulacros, progreso y herramientas de estudio. Para cobrar o hacer demos a colegios, el siguiente salto no deberia ser anadir mas features, sino convertir lo que ya existe en un sistema fiable: cuotas, seguridad de endpoints IA, schema versionado, estados de error consistentes y una navegacion mas clara entre Mi Plan/Planning.

La recomendacion principal: cuando termine la tarea de LaTeX, trabajar primero en limites de IA y seguridad de simulacros, despues en coherencia de landing/README/schema, y solo despues en refactors grandes.
