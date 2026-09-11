# Análisis de contribuciones — Kairo

**Fecha:** 17 de agosto de 2026
**Repositorio:** `msanchezieu2024-cmyk/Empresa-pau`
**Periodo analizado:** 7 de junio – 17 de agosto de 2026 (72 días naturales)
**Método:** `git log`, `git blame` sobre HEAD, y clasificación por sistema

> **Nota sobre identidades.** Marco aparecía en git con dos identidades distintas
> (`marcoedmundo33-cell` y `Marco Edmundo Martinez Mira`). En todo este documento
> están unificadas. Sin unificar, su contribución aparecería partida por la mitad
> en cualquier herramienta de estadísticas de GitHub.

---

## 1. Resumen ejecutivo

| | Commits | Líneas + | Líneas − | Neto | Ficheros | Días activos |
|---|---|---|---|---|---|---|
| **Mario** | 759 | 173.580 | 53.100 | 120.480 | 459 | 50 |
| **Marco** | 209 | 42.578 | 5.907 | 36.671 | 215 | 29 |
| **Alejandro** | 41 | 7.469 | 2.948 | 4.521 | 103 | 9 |
| **Diego** | 8 | 3.176 | 128 | 3.048 | 14 | 3 |

**Reparto por líneas añadidas:** Mario 76,5 % · Marco 18,8 % · Alejandro 3,3 % · Diego 1,4 %

**Reparto por código vivo hoy** (lo que de verdad está en producción):
Mario 69,5 % · Marco 27,4 % · Alejandro 3,0 % · Diego 0,1 %

La segunda cifra es la honesta. La primera cuenta líneas que se escribieron y
luego se borraron o reescribieron.

---

## 2. Propiedad por sistema

Porcentaje de **líneas vivas hoy** en cada área funcional. Es la tabla más
importante del documento: dice quién puede arreglar qué cuando algo se rompe.

| Sistema | Líneas | Mario | Marco | Alejandro | Diego |
|---|---|---|---|---|---|
| **Seguridad y auth** | 1.633 | **97 %** | 2 % | 1 % | 0 % |
| **Onboarding** | 5.228 | **95 %** | 5 % | 0 % | 0 % |
| **Landing y marketing** | 1.394 | **94 %** | 4 % | 2 % | — |
| **Emails y crons** | 1.775 | **88 %** | 12 % | — | — |
| **Pagos y facturación** | 2.649 | **87 %** | 13 % | 0 % | — |
| **IA: corrección y prompts** | 3.100 | **75 %** | 23 % | 2 % | — |
| **Esquema BD (migraciones)** | 3.271 | **68 %** | 32 % | 0 % | 0 % |
| **Gamificación (ligas/XP)** | 1.162 | **62 %** | 38 % | — | — |
| **Datos de exámenes** | 33.266 | **59 %** | 35 % | 5 % | — |
| **Motor del Camino** | 5.698 | 41 % | **58 %** | 0 % | 0 % |

Hay **un solo sistema** que no controla Mario: el motor del Camino, donde Marco
es mayoritario.

---

## 3. Perfil por colaborador

### Mario Sánchez — fundador y responsable técnico

**759 commits · 50 días activos · 15,2 commits/día · 459 ficheros tocados**

Ventana: 7 de junio → 17 de agosto (el único presente de principio a fin).

**Qué construyó en exclusiva:**

- **Toda la infraestructura crítica.** Seguridad al 97 %, pagos al 87 %, emails
  al 88 %. El webhook de Stripe, la verificación de firma, el enlace de pago
  para padres, los tokens HMAC firmados, el rate limiting, el detector de
  deriva de esquema. Si algo de esto falla, es el único que sabe por qué.
- **El onboarding completo** (95 %) — las once pantallas, la lógica de pasos,
  la validación de username, el flujo de registro.
- **La mayoría del contenido de exámenes** — Química, Física, Inglés,
  Historia de la Filosofía, Matemáticas CCSS, transcritos y estructurados.
- **189 ficheros donde es el único autor que ha tocado una línea.**

**Reparto de sus commits:** 352 `fix` · 221 `feat` · 126 sin prefijo ·
16 `chore` · 6 `docs` · 2 `refactor`

Más arreglos que funcionalidades nuevas (352 vs 221). Es el patrón de quien
mantiene el sistema en producción además de construirlo.

**Supervivencia de su código: 45 %.** De 173.580 líneas escritas, 78.520 siguen
vivas. Es la tasa más baja de todos, y no es algo malo: refleja que reescribe
su propio trabajo constantemente. Los sistemas que más ha iterado —onboarding,
Camino, landing— han pasado por varias versiones completas.

**Uso de IA: 55 % de sus commits** llevan co-autoría de Claude o Codex.

---

### Marco Martínez — dueño del motor del Camino

**209 commits · 29 días activos · 7,2 commits/día · 215 ficheros tocados**

Ventana: 8 de junio → 10 de agosto, pero la densidad real está entre el 28 de
julio y el 10 de agosto.

**Qué construyó:**

- **El motor del Camino: 58 % de las líneas vivas.** El generador de calendario,
  el sistema de XP, la personalización por días y minutos. Es la pieza más
  compleja del producto después de la corrección con IA, y es suya.
- **Un tercio del esquema de base de datos** (32 % de las migraciones). No son
  tablas menores: entran aquí las de ligas, rondas y buena parte de Camino.
- **38 % de la gamificación** — ligas, rankings, rondas mensuales.
- **Todo el contenido de Cataluña** — Biología, Lengua e Inglés catalanes son
  suyos al 100 %.
- **68 ficheros en exclusiva.**

**Reparto de sus commits:** 98 `fix` · 36 `feat` · 74 sin prefijo · 1 `docs`

**Supervivencia de su código: 73 %.** La más alta con diferencia. De 42.578
líneas, 30.968 siguen intactas. Su trabajo entra y se queda — o porque acierta
a la primera, o porque nadie más ha entrado a reescribir lo que hace.

**Uso de IA: 33 % de sus commits.**

**Riesgo asociado:** es la única persona además de Mario con conocimiento
profundo de una pieza central, y esa pieza —el generador— es justo la que tiene
pendiente la tarea de unificación (tarea #5). Si Marco desaparece, el motor del
Camino queda sin dueño.

---

### Alejandro Amigo — frontend puntual

**41 commits · 9 días activos · 4,6 commits/día · 103 ficheros tocados**

Ventana: 8 de junio → 10 de agosto, pero solo 9 días con actividad repartidos
en dos meses. Contribución intermitente, no sostenida.

**Qué construyó:**

- **5.238 de sus 7.469 líneas son frontend** (70 %). Componentes, estilos,
  ajustes de interfaz.
- 1.842 líneas de datos de exámenes.
- **Solo 4 ficheros en exclusiva**, y manda en 6 del total del repo.

**Reparto de sus commits:** los 41 sin prefijo convencional. Ninguno usa
`feat:`, `fix:` ni ningún otro — estilo de trabajo distinto al del resto.

**Supervivencia: 46 %.** De 7.469 líneas, 3.399 vivas.

**Uso de IA: 0 %.** El único colaborador sin ningún commit con co-autoría de IA.
Escribe a mano.

**Lectura:** aporta en superficie, no en arquitectura. No es dueño de ningún
sistema. Su marcha no dejaría ningún área huérfana.

---

### Diego García — datos, incorporación reciente

**8 commits · 3 días activos · 14 ficheros tocados**

Ventana: 9 → 14 de agosto. El más reciente de todos, una semana en el proyecto.

**Qué construyó:**

- **2.997 de sus 3.176 líneas son datos** (94 %) — contenido de exámenes.
- Aportaciones marginales en lib (35 líneas), API (90) y migraciones (10).
- 1 fichero en exclusiva.

**Reparto de sus commits:** 4 `feat` · 3 `fix` · 1 sin prefijo.

**Supervivencia: 5 %.** De 3.176 líneas escritas, solo 168 siguen vivas. Es la
tasa más baja con mucha diferencia — sus datos han sido reemplazados o
reestructurados casi por completo en la semana siguiente.

**Uso de IA: 88 %** (7 de 8 commits). El porcentaje más alto del equipo.

**Lectura:** demasiado reciente para valorar. El 5 % de supervivencia sugiere
que su trabajo se solapó con una reestructuración de los datos, no
necesariamente que estuviera mal hecho.

---

## 4. Ficheros más grandes y quién manda en ellos

| Líneas | Dueño | % | Fichero |
|---|---|---|---|
| 6.859 | Mario | 92 % | `app/page-client.tsx` |
| 5.208 | Mario | 100 % | `app/data/quimica.ts` |
| 4.480 | Mario | 89 % | `app/data/examenes.ts` |
| 4.065 | Mario | 55 % | `app/components/camino/CaminoCalendarClient.tsx` |
| 3.114 | Mario | 97 % | `app/data/fisica.ts` |
| 3.091 | Mario | 100 % | `app/data/ingles.ts` |
| 2.505 | **Marco** | 100 % | `app/data/biologia_cataluna.ts` |
| 2.353 | Mario | 80 % | `app/data/historia_filosofia_madrid.ts` |
| 2.121 | Mario | 71 % | `app/data/matematicas_ccss_madrid.ts` |
| 1.957 | Mario | 90 % | `app/components/onboarding/OnboardingFlow.tsx` |
| 1.856 | **Marco** | 100 % | `app/data/lengua_cataluna.ts` |
| 1.791 | **Marco** | 100 % | `app/data/ingles_cataluna.ts` |

`CaminoCalendarClient.tsx` es el fichero más compartido del proyecto
(55 % Mario / 45 % Marco) y también uno de los más grandes. Es el punto de
fricción natural entre los dos.

---

## 5. Lo que estos números NO miden

Es importante para cualquier uso formal de este documento.

**Las variables de entorno no dejan rastro.** `.env.local` está en `.gitignore`
y la configuración de Vercel, Supabase, Stripe y Resend vive en paneles web.
Quien haya configurado esos servicios ha hecho trabajo real que aquí es
invisible.

**Los apuntes y datos inflan mucho.** De las 173.580 líneas de Mario, 29.610
son documentación y 47.100 son datos de exámenes: el 44 % de su total. Es
trabajo legítimo —transcribir exámenes oficiales lleva horas— pero no equivale
a escribir el webhook de Stripe.

**Una línea de migración no vale lo mismo que una de CSS.** Las migraciones son
3.271 líneas de 113.055 (2,9 %), y definen la estructura completa de datos del
producto.

**El trabajo de diagnóstico no aparece.** Encontrar que seis semanas de
migraciones no se habían aplicado no produjo líneas de código hasta que se
construyó el detector.

**La revisión de código no aparece.** Ni las decisiones de producto, ni las
conversaciones de arquitectura, ni las pruebas manuales.

---

## 6. Conclusiones

**Kairo es un proyecto de una persona con un colaborador significativo.**
Mario y Marco suman el 96,9 % del código vivo. Alejandro y Diego juntos son el
3,1 %.

**La concentración de conocimiento es el riesgo estructural.** Mario es el único
que entiende pagos, seguridad y esquema de datos —tres áreas donde supera el
87 %— y son exactamente las tres que más daño hacen si fallan con usuarios
reales dentro. No hay ninguna redundancia.

**Marco es un colaborador real, no puntual.** Ser dueño del 58 % del motor del
Camino y del 32 % del esquema, con la mayor tasa de supervivencia del equipo
(73 %), lo sitúa en otra categoría respecto a Alejandro y Diego.

**Si estos números se usan para algo formal** —un reparto de participación, por
ejemplo— la tabla de la sección 2 (propiedad por sistema) es mucho más
representativa que cualquier porcentaje global de líneas.
