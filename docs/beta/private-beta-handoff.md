# Pausia · Private Beta Handoff

> Estado: lista para beta privada controlada (2-3 usuarios reales)  
> Fecha: junio 2026

---

## Qué está listo

### Camino PAU
Motor de misiones diarias con 38 semanas de currículum PAU. Rutas: Completa, Ajustada, Acelerada, Intensiva. XP, racha, niveles por asignatura. Sync con Supabase + fallback local.

### Onboarding Day 1
Wizard completo (comunidad → asignaturas → tiempo → modo de inicio). Pantalla "Creando tu Camino". Primera misión de activación (3 tareas). Tiny win con XP. Módulo de parent link.

### Primera misión y XP
3 tareas de activación (flashcard, test, respuesta corta). XP solo se suma si la API confirma. Errores visibles si algo falla.

### Magic Parent Checkout
Padre/madre recibe enlace tokenizado. Paga con Stripe. Webhook activa el entitlement del alumno. Token almacenado solo como SHA-256 hash.

### Stripe test
Webhook hardeneado: crea entitlement ANTES de marcar link como `paid`. Si falla la creación del entitlement → Stripe reintenta (500). Idempotencia via `stripe_checkout_session_id`.

### Legal / copy mínimo
- `/legal/privacidad` — política de privacidad
- `/legal/terminos` — términos de uso
- `/legal/reembolsos` — política de reembolsos + garantía 7 días
- `/legal/ia` — uso de IA y carácter orientativo de correcciones
- `/contacto` — 5 canales de contacto con `hola@pausia.es`
- Footers legales en checkout, success page y pricing
- Copy revisado: sin "ilimitado/ilimitadas", sin "sin preguntas", sin promesas de nota

### QA docs
- `docs/qa/beta-private-qa.md` — checklist completo + guía de incidencias
- `docs/ops/vercel-env-checklist.md` — variables de entorno necesarias

---

## Qué NO está listo

### Cobro real (live mode)
El webhook de Stripe solo está probado en test mode. No activar live keys hasta:
1. Verificar en producción que el webhook crea entitlements correctamente.
2. Tener legal definitivo (empresa constituida, NIF, domicilio).
3. Completar KYC en Stripe.

### Legal definitivo
Las páginas legales son mínimas y adecuadas para beta privada. No son válidas para comercio real sin revisión por abogado.

### Lint limpio
Hay deuda de lint heredada en archivos de ejercicios y datos. No es bloqueante para beta.

### Rate limiting perfecto
Hay rate limiting en `/api/simulacro` y `/api/chat` pero no es watertight. Suficiente para beta privada.

### XP anti-manipulación
Un usuario autenticado podría repetir llamadas a `/api/camino/complete-task`. Mitigación pendiente para beta mayor.

### Simulacros 100% robustos
La corrección IA puede fallar si el modelo da un JSON malformado. Hay manejo de errores pero la respuesta puede variar. Suficiente para beta privada.

---

## Cómo probar antes de invitar un usuario

1. `npm run build` debe pasar limpio.
2. Variables de entorno correctas en Vercel (ver `docs/ops/vercel-env-checklist.md`).
3. Stripe en modo test activo.
4. Ejecutar smoke test de `docs/qa/beta-private-qa.md` sección 8.

---

## Flujo que enseñar a usuarios

```
/onboarding → primera misión → /camino → módulo parent link → padre recibe enlace → paga en test
```

Paso a paso:
1. El alumno va a `/onboarding` y configura su ruta.
2. Completa las 3 tareas de activación.
3. Ve la pantalla tiny win con su XP.
4. Hace clic en "Ver mi Camino".
5. En `/camino`, el módulo ParentLinkModule está visible en la sección tiny win y al final de la página.
6. Copia el enlace y se lo envía a su padre/madre.
7. El padre/madre abre el enlace en cualquier dispositivo.
8. Ve la página de checkout con los datos del alumno.
9. Paga con tarjeta de test: `4242 4242 4242 4242` exp `12/26` cvv `123`.
10. El webhook activa el Pack Curso PAU en la cuenta del alumno.

---

## Qué observar durante la sesión

### Con el alumno
- ¿Entiende qué es Pausia sin que le expliques nada?
- ¿Completa el onboarding sin ayuda?
- ¿Entiende qué son las misiones?
- ¿Vuelve a `/camino` de forma natural?
- ¿Le parece natural enviar el enlace a sus padres?
- ¿El móvil funciona bien?

### Con el padre/madre
- ¿Entiende qué está comprando?
- ¿Confía en el checkout?
- ¿Qué le frenaría para pagar?
- ¿Encuentra el precio razonable?

---

## Preguntas para alumno

1. ¿Qué crees que hace Pausia?
2. ¿Qué harías mañana al volver?
3. ¿Qué parte te ha dado más confianza?
4. ¿Qué parte parecía falsa o rara?
5. ¿Enviarías esto a tus padres?
6. ¿Qué pagarías por esto?

## Preguntas para padre/madre

1. ¿Qué crees que estás comprando?
2. ¿Te da confianza el proceso de pago?
3. ¿Qué te frenaría para pagar?
4. ¿Te parece claro el precio?
5. ¿Qué necesitarías saber antes de pagar?

---

## Señales de éxito

- Completan onboarding sin ayuda en menos de 5 minutos.
- Entienden qué es Camino y qué deben hacer mañana.
- Piden seguir usando Pausia después de la sesión.
- El padre/madre entiende el checkout y confía en el proceso.
- No hay bugs que interrumpan el flujo principal.
- El móvil se ve bien.

## Señales de alerta

- No entienden la diferencia entre "Camino PAU" y "ejercicios sueltos".
- Creen que es solo otra app de ejercicios sin estructura.
- No confían en las correcciones de IA ("¿esto es fiable?").
- Les preocupa la privacidad de sus respuestas.
- El checkout parece poco profesional o da sensación de inseguridad.
- El móvil rompe el layout o algún botón no funciona.
- Ven el badge "Beta interna" y les genera desconfianza.

---

## Notas de producto

- Los simulacros están disponibles pero la corrección puede tardar 15-30 segundos. Preparar al usuario para la espera.
- La "corrección IA" de respuestas abiertas en las tareas de activación del onboarding no genera feedback real-time todavía — guarda el texto y da un mensaje genérico. Está documentado como esperado.
- El badge "En vivo" en `/camino` significa que el progreso está sincronizado en Supabase. El badge "Beta interna" significa modo local. No es un error.
- Si el usuario ve XP = 0 en Camino después de completar onboarding: posible problema de sincronización. Ver guía de incidencias en `docs/qa/beta-private-qa.md`.
