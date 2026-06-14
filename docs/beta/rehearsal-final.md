# Pausia · Rehearsal Final Beta Privada

> Ejecutado: 14 junio 2026 — noche anterior a primeros usuarios reales  
> Autor: Claude Code (rehearsal autónoma)

---

## Estado técnico

- **Build**: PASA — 28 rutas, 0 errores TypeScript después de fixes
- **Git branch**: `main`
- **Commit final**: ver `git log --oneline -1` al despertar
- **Push**: SÍ — cambios subidos a `origin/main`
- **Lint**: no ejecutado (deuda heredada, no bloqueante)

---

## Qué está listo

### Rutas críticas
Todas presentes y compilando:
- `/` (simulacros/práctica) ✓
- `/login` ✓
- `/pricing` ✓
- `/onboarding` ✓
- `/camino` ✓
- `/simulacros` + `/simulacros/[id]` + `/simulacros/[id]/results` ✓
- `/parent-checkout/[token]` + `/parent-checkout/success` ✓
- `/legal/privacidad` + `/legal/terminos` + `/legal/reembolsos` + `/legal/ia` ✓
- `/contacto` ✓
- `/admin` ✓

### Onboarding
- Wizard 4 pasos (comunidad → asignaturas → tiempo → modo inicio) funcional
- Estado "Ya lo hice" detecta correctamente si el onboarding está completado
- Primera misión de activación (3 tareas) con XP visible
- Tiny win con XP total y CTA hacia Camino
- Errores de sync visibles como banners amber
- Módulo ParentLinkModule presente al final del onboarding

### Camino PAU
- Métricas: racha, XP, nivel, progreso visible con skeleton de carga
- Sync badge "En vivo" / "Beta interna" visible y explicado
- Error de sync visible con mensaje amber
- Tareas del día cargan con skeleton mientras el hook fetchea
- Misión completada detectada correctamente
- RouteCard y NextObjectives estables
- ParentLinkModule con estados: idle / loading / ready (copy + URL) / shared / error
- "Opciones de demo" visible solo como UI interna (resetea solo estado local)

### Primera misión
- XP solo se suma si la API confirma (no doble suma)
- Error de red visible al usuario
- loadingTask específico por tarea (no bloquea otras)

### Parent Checkout
- Página pública clara: nombre del plan, precio, qué incluye
- Garantía 7 días con enlace a política de reembolsos ✓
- Disclaimer IA con enlace a política ✓
- "Pago procesado por Stripe · Datos cifrados" visible ✓
- Error visible si falla la redirección a Stripe ✓
- finally en handleCheckout → botón nunca queda bloqueado ✓
- Footer con todos los links legales ✓
- No promete "IA ilimitada" ni "garantizado" ✓

### Stripe test
- Webhook idempotente ✓
- Entitlement se crea ANTES de marcar paid ✓
- Token almacenado como SHA-256 ✓
- Success page pasiva (no activa entitlement) ✓

### Legal / copy
- 4 páginas legales completas y enlazadas entre sí ✓
- Página de contacto con 5 canales a hola@pausia.es ✓
- Pricing con disclaimer "pagos no activos aún" ✓
- Copy revisado: sin "ilimitadas", sin "garantizado", sin "aprobar seguro" ✓

### Simulacros
- Botón "Entregar examen" con spinner y fase visible ✓
- Error en catch ahora protegido (doble try-catch) ✓
- Resultados normalizados con fallbacks para corrección fallida ✓

### Contacto / feedback beta
- Página /contacto accesible desde footer de todas las páginas principales ✓
- 5 tarjetas de contacto con mailto: prefilled ✓

---

## Qué NO está listo

- **Cobro real (live)**: solo probado en Stripe test mode
- **Legal definitivo**: páginas mínimas, sin revisión de abogado
- **Lint limpio**: deuda heredada en archivos de datos y ejercicios
- **XP anti-manipulación**: un usuario autenticado podría abusar de `/api/camino/complete-task`
- **Rate limiting watertight**: protección básica, no hermética
- **Simulacros 100% robustos**: la corrección IA puede dar JSON malformado, el manejo existe pero el tiempo de espera puede ser 15-30s
- **"Opciones de demo" ocultas**: el botón "Reiniciar demo local" es visible a todos los usuarios (solo resetea estado local, no Supabase)
- **Badge "Beta interna"**: puede generar dudas en usuarios reales si ven esa etiqueta en Camino

---

## Checklist manual cuando vuelvas

Ejecutar en este orden:

1. `/onboarding` — completar los 4 pasos sin ayuda
2. Completar las 3 tareas de activación (incluyendo la de respuesta abierta)
3. Ver pantalla tiny win y XP
4. Ir a `/camino` — verificar métricas, tareas del día, racha
5. Generar parent link — copiar URL
6. Abrir URL en incógnito — verificar página de checkout
7. Pagar con tarjeta Stripe test (`4242 4242 4242 4242` exp `12/26` cvv `123`)
8. Verificar redirect a `/parent-checkout/success`
9. En Supabase: verificar que el entitlement existe en tabla `user_entitlements`
10. En Camino: verificar badge "Pack Curso PAU activo"
11. Abrir `/pricing` — verificar coherencia nombre plan y precio
12. Abrir `/legal/privacidad`, `/legal/terminos`, `/legal/reembolsos`, `/legal/ia`
13. Abrir `/contacto` — verificar que los mailto: funcionan
14. Crear un simulacro — entregarlo — ver corrección (verificar que no queda en loading)
15. Probar en móvil: onboarding, camino, checkout

---

## Bugs arreglados esta noche

| Bug | Archivo | Impacto |
|-----|---------|---------|
| `SidebarSubjectId` inexistente → build roto | `app/page.tsx:10` | CRÍTICO — build fallaba |
| `ReactMarkdown` sin importar → build roto | `app/page.tsx:1400` | CRÍTICO — build fallaba |
| `NAV_ITEMS` dead code → TypeScript error | `app/page.tsx:843` | Menor |
| `corregir()` sin try-catch → botón loading infinito | `app/page.tsx:706` | P1 — botón bloqueado en error de red |
| `submitExam()` catch puede lanzar → `setSubmitting` nunca a false | `app/simulacros/[id]/page.tsx:194` | P1 — botón bloqueado si Supabase falla en catch |

---

## Riesgos pendientes

### P0
Ninguno detectado. Los dos bugs de loading infinito han sido corregidos.

### P1

- **Corrección IA lenta**: la API `/api/simulacro` puede tardar 15-60s. Si Vercel tiene timeout < 60s el usuario ve error. `maxDuration = 60` está configurado pero requiere Vercel Pro/Hobby con función serverless larga.
- **Stripe live no probado**: el webhook fue probado solo en test mode. NO activar live keys sin smoke test completo.
- **Badge "Beta interna"**: si el usuario ve esa etiqueta en Camino puede generar desconfianza. Es el fallback cuando Supabase no responde.

### P2

- **"Opciones de demo"** visible en Camino para todos los usuarios (botón "Reiniciar demo local")
- **XP duplicable** si el usuario llama `/api/camino/complete-task` repetidamente — mitigable en beta controlada
- **Lint heredado** en archivos de datos — no afecta funcionalidad
- **Legal sin abogado** — suficiente para beta privada, no para comercio real
- **Rate limiting** en correcciones y simulacros — suficiente para 2-3 usuarios

---

## Veredicto

**GO WITH CAVEATS**

Pausia está lista para enseñar a 2-3 usuarios reales en sesión controlada. Los bugs de loading infinito en las correcciones han sido corregidos esta noche. El build pasa limpio. Los flujos críticos (onboarding → camino → parent checkout) están sólidos. Las páginas legales están completas y enlazadas. El copy no hace promesas peligrosas.

Las caveats son: usar Stripe en test mode, no activar cobro real, preparar al usuario para que la corrección de simulacros puede tardar 15-30 segundos, y monitorizar los logs en Vercel durante la sesión.
