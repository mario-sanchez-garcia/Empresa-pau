# Auditoria completa de Pausia

Fecha: 2026-06-10  
Alcance: auditoria de producto, UX, arquitectura, datos, IA, costes y riesgos antes de beta.  
Regla de trabajo: solo se modifica este documento. No se toca codigo de produccion, datos oficiales, Supabase, package.json, prompts ni LaTeX.

## 1. Resumen ejecutivo

Pausia esta bastante mas cerca de una beta privada de lo que suele estar una app en esta fase. Ya no es una maqueta: tiene login, sidebar, asignaturas, banco de examenes, correccion con IA, simulacros, historial, plan de estudio, planning, flashcards y un canvas de estudio. Ademas, se ha avanzado mucho en la cobertura de asignaturas: Matematicas II, Fisica, Quimica, Biologia, Ingles, Lengua e Historia.

Lo mejor del producto es que la propuesta se entiende rapido: el alumno entra, elige una asignatura, practica con ejercicios oficiales y recibe feedback. Eso es exactamente el nucleo de valor para EBAU/PAU. Tambien es muy positivo que ya exista separacion entre practica normal y simulacros, porque son dos modos de estudio distintos: uno para aprender y otro para ponerse a prueba.

La parte peligrosa no es la idea ni el diseno. La parte peligrosa es la fiabilidad operativa. Hay muchas funciones criticas apoyadas en IA, Supabase y datos oficiales, pero todavia faltan limites de uso, protecciones de coste, validacion fuerte en endpoints, estados de error consistentes y pruebas manuales ordenadas por asignatura/comunidad. Si se abre a muchos usuarios sin limites, el riesgo principal es gastar demasiado en IA o que un alumno se encuentre una experiencia rota justo despues de dedicar tiempo a un simulacro.

Mi conclusion: Pausia si esta cerca de beta privada, pero no la abriria todavia como beta publica ni como producto de pago. Para ensenarla a alumnos reales hace falta cerrar los P0: limites IA, seguridad de simulacros, verificacion de flujos basicos Madrid/Cataluna, landing honesta, y estados de error claros. Para cobrar, ademas hacen falta cuotas, observabilidad, billing/planes y una politica clara de uso.

## 2. Que esta bien

- **Diseno:** el producto tiene una identidad visual clara. El sidebar, las tarjetas, los colores por asignatura y las pantallas de simulacro transmiten producto serio.
- **Asignaturas:** ya hay una base amplia: Mates, Fisica, Quimica, Biologia, Ingles, Lengua e Historia. Esto da sensacion de plataforma completa.
- **Simulacros:** el flujo de crear, responder, entregar y ver resultado esta montado. Es una pieza diferencial porque acerca al alumno a condiciones reales.
- **Madrid/Cataluna:** el selector de comunidad ya existe y se usa en examenes y simulacros. Es una buena base para escalar por comunidades sin mezclar todo.
- **Ingles:** esta integrado como asignatura real, con readings, preguntas, opciones y sesiones. Es importante porque no es una asignatura numerica y prueba que el sistema soporta formatos distintos.
- **IA:** hay correccion de ejercicios, chat tutor, plan de estudio y correccion de simulacros. La app ya aprovecha IA en varios puntos de valor.
- **Historial:** guardar correcciones permite progreso, estadisticas y contexto para chat. Es clave para que Pausia no sea solo un corrector suelto.
- **Mi Plan / Planning:** hay dos vias de planificacion. Aunque deben simplificarse, muestran una intencion clara de convertir errores en estudio accionable.
- **La Zona:** flashcards y canvas hacen que Pausia no dependa solo de "hacer examenes"; aporta espacio de repaso y organizacion visual.
- **Estructura tecnica:** Next.js App Router, TypeScript, Supabase, migraciones recientes, KaTeX/MathMarkdown y componentes separados en algunas areas nuevas.
- **Build:** el build de produccion pasa en el estado auditado, lo cual es una senal importante de salud tecnica.

## 3. Que falla o puede fallar

- **Filtros por comunidad:** Madrid/Cataluna funcionan en varias rutas, pero no todas las asignaturas tienen datos para Cataluna. Si el usuario cambia comunidad y no entiende por que desaparecen preguntas, puede parecer bug.
- **Simulacros:** el timer se gestiona en cliente y puede reiniciarse si se recarga. El guardado existe, pero no es todavia tan robusto como deberia para un examen de 90 minutos.
- **Ingles:** funciona, pero tiene casos especiales: sesiones `Unica` en 2025, dias Lunes/Martes/horas, readings y writing. Eso exige pruebas manuales especificas. En simulacros, el modelo A/B puede dejar fuera parte del formato unico.
- **Tabs de ejercicios:** los distintos tipos de pregunta no siempre encajan igual por asignatura. Ingles, Lengua e Historia necesitan mucho cuidado porque tienen textos fuente, dias/versiones y preguntas largas.
- **Puntuacion oficial:** la app ha mejorado el soporte de `puntos`, `pts` y puntuacion por bloque, pero sigue siendo una zona sensible. Si una pregunta muestra mal los puntos, el alumno pierde confianza en la correccion.
- **Datos incompletos:** hay datasets con OCR parcial, imagenes pendientes o ejercicios que necesitan PDF/imagen oficial. Eso debe estar senalizado siempre.
- **IDs duplicados:** no he confirmado un bug concreto de IDs duplicados, pero al haber datasets generados y mezclas de anos/opciones, conviene auditar IDs antes de beta para evitar keys repetidas o historiales ambiguos.
- **Estados vacios:** existen algunos empty states, pero deben ser mas especificos. No es lo mismo "no hay datos" que "esta asignatura no existe aun para Cataluna".
- **Errores de build:** en el estado auditado `npm run build` pasa. El riesgo historico esta en edits amplios de `app/page.tsx`, donde una pequena rotura JSX puede tumbar Vercel.
- **Coste IA:** este es el riesgo mas grande. Chat, correcciones, simulacros y planning pueden ser spameados si no hay limites servidor.
- **Doble submit:** simulacros ya evita doble submit en cliente, pero los endpoints deben protegerse tambien a nivel servidor.
- **Supabase:** hay tablas usadas por codigo que no aparecen completamente versionadas en migraciones auditadas antiguas. Esto puede romper deploys limpios o entornos nuevos.
- **Logs/debug en produccion:** se detecto y se quito un log sensible de simulacros, pero conviene hacer una pasada final antes de beta.
- **Archivos monoliticos:** `app/page.tsx` es demasiado grande. No urge refactor masivo ahora, pero si es el mayor riesgo de mantenimiento.

## 4. Auditoria por seccion

### Examenes

Funciona como la pantalla principal del producto. Permite elegir asignatura, ano, convocatoria, bloque, opcion y comunidad. Tambien permite escribir respuesta, subir imagen y pedir correccion con Pausia.

Lo bueno es que concentra el valor principal: practicar con examenes oficiales. Ademas, el render con `MathMarkdown` y KaTeX ya hace que las formulas se vean mucho mejor que texto plano.

Lo que revisaria es la robustez: si falla `/api/chat`, si la IA devuelve algo raro, si hay una imagen pendiente, si no hay datos de una comunidad, o si el alumno cambia filtros con una respuesta escrita. En una beta, el alumno no debe sentir que puede perder trabajo por cambiar de bloque o filtro.

Archivos probables: `app/page.tsx`, `components/shared/MathMarkdown.tsx`, `app/lib/mathFormatting.ts`, `app/lib/correctionPrompt.ts`.

### Ingles

Ingles esta bastante avanzado. Hay datos Madrid 2018-2025, con opciones A/B, dias Lunes/Martes y sesiones 2025 por hora. La UI ya distingue el texto oficial de las preguntas del apartado, que es importante porque en Ingles el alumno suele necesitar mirar el reading mientras contesta.

Los riesgos son de formato. Ingles no se comporta como Mates: tiene reading, true/false, comprehension, grammar, writing, sesiones con opcion unica y puntuaciones distintas. En simulacros, conviene decidir si Q3 entra o no, y como tratar 2025 `Unica` sin forzarlo a A/B.

Madrid funciona como base. Cataluna no tiene Ingles cargado, asi que la app debe explicarlo claramente cuando el usuario este en Cataluna.

Archivos probables: `app/data/ingles.ts`, `app/page.tsx`, `components/simulacros/data.ts`.

### Simulacros

Simulacros es una de las piezas mas importantes para beta. Ya hay generacion de simulacro, guardado en Supabase, pantalla activa, timer, entrega, correccion IA y resultados por tabs.

Lo bueno: el flujo completo existe y el resultado ya intenta mostrar resumen, detalle, plan y bloques. Tambien se guarda `historial_simulacros`, lo que permite estadisticas.

Lo que falta: persistir el tiempo real de inicio, guardar respuestas con mas seguridad, validar en el endpoint que el usuario es propietario del simulacro, evitar coste excesivo y comprobar todos los formatos por asignatura/comunidad. Tambien revisaria que un fallo de IA no convierta una entrega real en una experiencia frustrante.

Archivos probables: `app/simulacros/page.tsx`, `app/simulacros/[id]/page.tsx`, `app/simulacros/[id]/results/page.tsx`, `app/api/simulacro/route.ts`, `components/simulacros/data.ts`.

### Historial

El historial es clave para que Pausia tenga memoria. En Examenes se usa `historial_examenes`; en Simulacros se usa `historial_simulacros`. Esto permite ver correcciones pasadas y generar contexto para chat/plan.

El riesgo es que hay dos historiales con formas distintas. Para beta esta bien, pero antes de cobrar conviene unificar lectura de historial o crear una capa de servicio que normalice datos. Tambien hay que asegurar que todas las asignaturas nuevas se muestran con nombre correcto, nota correcta y puntuacion maxima correcta.

Archivos probables: `app/page.tsx`, `app/simulacros/page.tsx`, `app/simulacros/[id]/results/page.tsx`.

### Mi Plan / Planning

Hay dos conceptos parecidos: "Mi Plan" dentro del home y `Planning` como ruta separada. Ambos buscan organizar estudio, pero pueden confundir al usuario porque no queda claro cual es el plan principal.

Mi Plan usa historial de correcciones para crear una guia semanal. Planning tiene onboarding con fecha de examen, horas de estudio y asignaturas flojas. Los dos son utiles, pero antes de beta conviene decidir si se fusionan o si uno queda como "Plan IA" y otro como "Tareas".

Riesgo principal: coste. Planning usa IA y puede regenerarse. Sin limite semanal o cache, puede gastar mas de lo necesario.

Archivos probables: `app/page.tsx`, `app/planning/page.tsx`, `app/api/planning/route.ts`.

### La Zona / Flashcards

La Zona esta bien pensada: estudiar no es solo corregir examenes. Flashcards permiten repaso rapido y Mi Espacio permite esquemas visuales.

Flashcards tiene creacion manual, filtros por asignatura/tema, giro de tarjeta y repeticion simple. Se corrigio el desajuste mas importante detectado: la UI permite Ingles y la migracion nueva ya incluye `ingles` en la constraint. Tambien hay mensaje visible si falla guardar una flashcard.

Lo que falta es contenido real inicial. Si no hay flashcards precargadas ni generacion IA, el usuario entra y debe crear todo desde cero. Para beta privada puede valer, pero para retencion conviene ofrecer mazos base por asignatura o generacion controlada.

Archivos probables: `app/zona/page.tsx`, `components/zona/Flashcards.tsx`, `components/zona/types.ts`, migraciones de flashcards.

### Chat con Pausia

El chat es potente porque puede resolver dudas y usar contexto de correcciones. Tambien puede recibir imagenes a traves de `/api/chat`.

El problema es que es el punto mas facil de spamear. Si un usuario manda 100 mensajes largos o imagenes, el coste sube rapido. Tambien falta persistencia de conversaciones y un limite claro del historial enviado a la IA.

Antes de beta publica, el chat necesita cuotas por usuario, manejo de errores y posiblemente un modelo mas barato para dudas simples.

Archivos probables: `app/page.tsx`, `app/api/chat/route.ts`.

### Landing

La landing tiene buen aspecto comercial y explica bien el producto. Eso ayuda mucho para demos.

El problema es la precision. Si la landing promete "desde 2010" pero los datos reales empiezan mas tarde en varias asignaturas, se crea una brecha de confianza. Tambien debe reflejar que Biologia ya esta activa si lo esta en la app. La landing debe vender, pero sin prometer mas de lo que el producto cumple.

Archivos probables: `app/landing/page.tsx`, `README.md`.

### Sidebar / navegacion

El sidebar es uno de los puntos fuertes. Tiene navegacion, asignaturas, comunidad autonoma, email de usuario y logout. La app se entiende bastante bien desde ahi.

Lo que revisaria es la duplicidad `Mi Plan` / `Planning` y el comportamiento mobile. En pantallas pequenas el sidebar puede ocupar mucho espacio. Tambien guardaria la comunidad en perfil de usuario, no solo en localStorage, para que el alumno no pierda su preferencia en otro dispositivo.

Archivos probables: `app/components/Sidebar.tsx`, `app/hooks/useCCAA.ts`.

### Supabase

Supabase se usa para auth, historial, simulacros, planning, flashcards, canvases e imagenes. Las migraciones nuevas tienen RLS en flashcards, canvases y simulacros, lo cual es buena senal.

Riesgos:
- Algunas tablas usadas por codigo no estan completamente representadas en las migraciones auditadas.
- Las rutas IA que actualizan datos deben verificar ownership en servidor.
- Hay que evitar guardar imagenes enormes en JSON cuando seria mejor storage.
- Las politicas RLS y el uso de service role deben revisarse antes de beta publica.

Archivos probables: `app/lib/supabase.ts`, `supabase/migrations/*`, rutas API y paginas que llaman `.from(...)`.

### IA y costes

IA se usa en:
- Correccion de ejercicios via `/api/chat`.
- Chat tutor via `/api/chat`.
- Mi Plan via `/api/chat`.
- Planning via `/api/planning`.
- Correccion de simulacros via `/api/simulacro`.

Riesgos:
- No hay limites diarios/semanales fuertes.
- No hay tracking de coste por usuario.
- Simulacros usan muchos tokens.
- Planning con modelo caro puede ser innecesario para regeneraciones frecuentes.
- Imagenes aumentan coste y payload.

Antes de beta publica, esto es P0.

### Datos oficiales

La cobertura es buena, pero hay que tratarla como contenido sensible. Si una pregunta no es oficial, esta incompleta, tiene OCR parcial o necesita imagen/PDF, debe estar marcado claramente.

Cobertura auditada previamente:
- Madrid Mates: 2015-2025.
- Madrid Historia: 2018-2025.
- Madrid Fisica: 2018-2025.
- Madrid Quimica: 2018-2025.
- Madrid Biologia: 2020-2025.
- Madrid Ingles: 2018-2025.
- Madrid Lengua: 2019-2024.
- Cataluna: disponible parcialmente en Mates/Historia/Fisica/Quimica/Lengua.

El punto clave no es tener absolutamente todo, sino no hacer creer al alumno que algo esta completo si no lo esta.

### LaTeX

LaTeX y formulas son una zona sensible. Ya existe `MathMarkdown`, `remark-math`, `rehype-katex` y normalizacion de enunciados. Eso es bueno.

El riesgo es que un cambio global de formato rompa enunciados de varias asignaturas. Mates, Fisica y Quimica son especialmente sensibles. Lengua, Historia e Ingles tambien pueden verse afectadas si el parser transforma texto normal como si fuera formula.

Recomendacion: no tocar LaTeX de forma amplia hasta tener una lista de ejemplos de prueba por asignatura: matrices, integrales, limites, vectores, unidades, exponentes, reacciones quimicas, textos largos y preguntas con imagen.

## 5. Top prioridades ahora

1. **Limites IA por usuario**
   - Problema: el usuario puede disparar muchas correcciones, chats, planes y simulacros.
   - Por que importa: es el mayor riesgo economico antes de beta.
   - Archivos probables: `app/api/chat/route.ts`, `app/api/simulacro/route.ts`, `app/api/planning/route.ts`, Supabase migrations futuras.
   - Dificultad: media.
   - Riesgo: alto.
   - Que haria: crear tabla `usage_events`, helper servidor `checkUsageLimit`, cuotas Free/Beta, y bloquear cuando se supere el limite.

2. **Validar ownership en `/api/simulacro`**
   - Problema: el endpoint actualiza historial por id y debe comprobar usuario propietario en servidor.
   - Por que importa: seguridad y privacidad.
   - Archivos probables: `app/api/simulacro/route.ts`.
   - Dificultad: media.
   - Riesgo: alto.
   - Que haria: leer sesion/token, consultar simulacro por `id + user_id`, y solo entonces corregir/actualizar.

3. **Persistir tiempo real de simulacro**
   - Problema: refrescar puede reiniciar el timer visual.
   - Por que importa: un simulacro debe ser creible.
   - Archivos probables: `app/simulacros/page.tsx`, `app/simulacros/[id]/page.tsx`, migracion futura.
   - Dificultad: media.
   - Riesgo: medio.
   - Que haria: guardar `started_at` y calcular tiempo con servidor/fecha, no solo estado React.

4. **Autosave mas seguro en simulacros**
   - Problema: se pueden perder cambios recientes si se cierra la pestana antes del autosave.
   - Por que importa: perder respuestas destruye confianza.
   - Archivos probables: `app/simulacros/[id]/page.tsx`.
   - Dificultad: media.
   - Riesgo: medio.
   - Que haria: debounce 2-5s, indicador "guardado", y `beforeunload`/flush cuando sea posible.

5. **Revisar landing para no prometer de mas**
   - Problema: disponibilidad y anos no coinciden siempre con datasets.
   - Por que importa: confianza y conversion.
   - Archivos probables: `app/landing/page.tsx`.
   - Dificultad: baja.
   - Riesgo: bajo.
   - Que haria: cambiar copy a "examenes oficiales cargados progresivamente" y marcar asignaturas reales.

6. **Unificar error UI de IA**
   - Problema: cada llamada IA falla distinto.
   - Por que importa: beta necesita errores entendibles.
   - Archivos probables: consumidores de `/api/chat`, `/api/planning`, `/api/simulacro`.
   - Dificultad: media.
   - Riesgo: medio.
   - Que haria: componente pequeno `AiErrorState` y mensajes de reintento.

7. **Auditar puntuaciones oficiales**
   - Problema: puntos por pregunta/bloque deben ser exactos.
   - Por que importa: la nota es el centro del producto.
   - Archivos probables: `app/data/*`, `components/simulacros/data.ts`, `app/page.tsx`.
   - Dificultad: alta.
   - Riesgo: alto.
   - Que haria: script de solo lectura que liste puntos por asignatura/ano/opcion y detectar nulls/raros.

8. **Resolver `Mi Plan` vs `Planning`**
   - Problema: dos secciones parecidas confunden.
   - Por que importa: navegacion y valor percibido.
   - Archivos probables: `app/page.tsx`, `app/planning/page.tsx`, `app/components/Sidebar.tsx`.
   - Dificultad: media.
   - Riesgo: medio.
   - Que haria: definir una como plan semanal IA y otra como tareas, o fusionarlas.

9. **Versionar tablas Supabase antiguas**
   - Problema: algunas tablas usadas no estan claras en migraciones.
   - Por que importa: deploys limpios y nuevos entornos.
   - Archivos probables: `supabase/migrations/*`.
   - Dificultad: media.
   - Riesgo: alto.
   - Que haria: documentar schema real remoto y crear migraciones idempotentes.

10. **Reducir riesgo de `app/page.tsx`**
    - Problema: archivo monolitico de alto riesgo.
    - Por que importa: cualquier cambio pequeno puede romper muchas secciones.
    - Archivos probables: `app/page.tsx`, futuros hooks/componentes.
    - Dificultad: alta.
    - Riesgo: medio.
    - Que haria: no refactor masivo ahora; extraer primero funciones puras y componentes pequenos cuando LaTeX/datos esten estables.

## 6. Plan de accion

### Proximas 24 horas

- Probar manualmente un flujo completo Madrid: elegir asignatura, corregir ejercicio, guardar historial, abrir chat contextual.
- Probar un simulacro Madrid completo con respuesta breve y entrega.
- Probar un simulacro Cataluna de una asignatura soportada.
- Revisar landing y corregir promesas de anos/asignaturas si no coinciden.
- Confirmar que flashcards guardan en todas las asignaturas visibles.
- Quitar cualquier log sensible restante si aparece en una busqueda puntual.

### Proximos 3 dias

- Implementar limites IA simples en servidor.
- Persistir `started_at` o equivalente para simulacros.
- Mejorar autosave de respuestas en simulacros.
- Crear una pantalla/error UI comun para fallos de IA.
- Hacer checklist manual por asignatura: Mates, Fisica, Quimica, Biologia, Ingles, Lengua, Historia.
- Documentar schema Supabase real y compararlo con migraciones.

### Proximas 2 semanas

- Preparar beta privada con 5-20 usuarios.
- Medir coste por usuario en correcciones, simulacros, chat y planning.
- Crear dashboard interno minimo: usuarios activos, llamadas IA, coste aproximado, errores IA.
- Pulir mobile en sidebar, filtros y simulacros.
- Crear mazos base de flashcards o generacion controlada.
- Hacer pruebas de regresion visual para enunciados con formulas.

### Antes de beta publica

- Plan Free/Premium con cuotas reales.
- Billing o lista de espera si aun no se cobra.
- Terminos basicos: IA puede equivocarse, datos oficiales revisados, privacidad.
- Observabilidad: errores API, errores Supabase, costes por dia.
- Seguridad: ownership en endpoints, RLS revisado, service role solo donde toque.
- Refactor progresivo de `app/page.tsx`.

## 7. Limites IA recomendados

Para beta privada:

- Correcciones de ejercicios: 5 por dia por usuario.
- Simulacros: 1 por dia y 3 por semana por usuario.
- Chat: 30 mensajes por dia.
- Planning IA: 1 por semana.
- Imagenes: maximo 3 imagenes por correccion y limite de tamano.

Para free publico:

- Correcciones de ejercicios: 3 por dia.
- Simulacros: 1 por semana.
- Chat: 20 mensajes por dia.
- Planning IA: 1 por semana.
- Flashcards manuales: ilimitadas razonables.

Para premium:

- Correcciones de ejercicios: 30 por dia.
- Simulacros: 5 por semana.
- Chat: 150 mensajes por dia.
- Planning IA: 3 por semana.
- Exportaciones/canvas/flashcards avanzadas desbloqueadas.

Que guardar/cachear:

- Correcciones ya generadas por `user_id + pregunta_id + respuesta_hash`.
- Ultimo plan IA y fecha de generacion.
- Resumen del historial en vez de mandar todas las correcciones completas al chat.
- Tokens/coste aproximado por llamada IA.
- Estado de error de correccion para permitir reintento sin perder respuestas.

Que bloquear:

- Doble click/submit en cliente y servidor.
- Regenerar planning si no cambio historial.
- Correcciones sin respuesta.
- Imagenes demasiado pesadas.
- Llamadas IA de usuarios no autenticados.
- Simulacros repetidos en bucle en menos de X minutos.

## 8. Checklist antes de ensenar a alumnos

- [ ] Examenes Madrid probados.
- [ ] Examenes Cataluna probados.
- [ ] Ingles tabs probados.
- [ ] Simulacro Madrid probado.
- [ ] Simulacro Cataluna probado.
- [ ] Historial probado.
- [ ] Correccion IA probada.
- [ ] Puntuaciones oficiales revisadas.
- [ ] Build pasa.
- [ ] No hay contenido inventado.
- [ ] Costes IA controlados.
- [ ] Flashcards guardan en todas las asignaturas visibles.
- [ ] Landing no promete anos/asignaturas no disponibles.
- [ ] Estados vacios explican la causa.
- [ ] Fallos IA muestran mensaje claro y no pierden respuestas.

## 9. Que NO tocar todavia

- No meter pagos todavia. Primero limites y coste real.
- No anadir mas comunidades hasta estabilizar Madrid/Cataluna.
- No anadir mas asignaturas antes de revisar calidad de las actuales.
- No hacer rediseno grande. El diseno ya funciona.
- No hacer refactor masivo de `app/page.tsx` mientras LaTeX/datos cambian.
- No crear migraciones innecesarias sin comparar schema remoto.
- No activar features nuevas de IA sin tracking de coste.
- No prometer "todo oficial completo" si hay huecos, OCR parcial o imagenes pendientes.
- No cambiar LaTeX global sin fixtures de prueba.

## 10. Conclusion clara

**Esta Pausia cerca de beta privada?**  
Si. Esta cerca de una beta privada controlada. Tiene suficiente producto real para que un grupo pequeno de alumnos pruebe examenes, simulacros, feedback, historial y zona de estudio.

**Que falta para beta privada?**  
Faltan pruebas manuales guiadas, limites IA basicos, errores claros, seguridad del endpoint de simulacros y confirmar que los flujos de Madrid/Cataluna no se rompen. Tambien conviene limpiar cualquier promesa exagerada de landing.

**Que falta para beta publica?**  
Faltan cuotas por plan, tracking de costes, billing o estrategia premium, observabilidad, schema Supabase bien versionado, soporte de errores serio y una decision clara sobre Mi Plan/Planning.

**Que haria primero?**  
Primero pondria limites IA y seguridad en simulacros. Despues persistiria timer/autosave. Luego haria una ronda de QA manual por asignatura/comunidad. Solo despues pensaria en mas features o refactors grandes.

## Comandos ejecutados

- `git status`
- Lectura de `docs/full-product-audit.md`
- Modificacion exclusiva de `docs/full-product-audit.md`
- `npm run build` ejecutado correctamente tras esta actualizacion
