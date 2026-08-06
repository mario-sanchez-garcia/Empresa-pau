-- "Itinerario tipo Smartick": el alumno puede repetir un simulacro, examen o
-- tema de Curso ya hecho para intentar mejorar su nota (Kairo lo sugiere
-- cuando la nota está por debajo del umbral configurable — ver
-- perfiles.grade_threshold en la migración siguiente — pero SIEMPRE con
-- confirmación del alumno, nunca solo). Cada repetición sigue el mismo
-- patrón que un intento nuevo hoy: una fila nueva en historial_simulacros o
-- historial_examenes con su propio id — repeated_from_id solo añade la
-- trazabilidad de "esto es una mejora de aquello", para poder comparar la
-- nota nueva contra la de referencia y decidir cuánto XP reducido otorgar.
--
-- Deliberadamente NO toca camino_calendar: la cronología de Camino ya
-- arreglada (un día pasado nunca se recalcula) queda intacta. Repetir para
-- mejorar vive enteramente en el historial, nunca reprograma ni reescribe
-- una misión diaria.

alter table public.historial_simulacros
  add column if not exists repeated_from_id uuid references public.historial_simulacros(id) on delete set null;

alter table public.historial_examenes
  add column if not exists repeated_from_id uuid references public.historial_examenes(id) on delete set null,
  -- Solo se rellena para correcciones de un tema de Camino/Cursos
  -- (tipo='Camino PAU'): enlaza la fila de historial con el sort_order
  -- exacto del tema en curriculum_content_v2, para poder mostrar "nota
  -- obtenida" y "repetir para mejorar" en La Zona → Mis Cursos sin tener que
  -- adivinar el tema por texto del enunciado.
  add column if not exists v2_sort_order integer;

create index if not exists historial_examenes_user_subject_v2_idx
  on public.historial_examenes (user_id, asignatura, v2_sort_order);

create index if not exists historial_simulacros_repeated_from_idx
  on public.historial_simulacros (repeated_from_id) where repeated_from_id is not null;

create index if not exists historial_examenes_repeated_from_idx
  on public.historial_examenes (repeated_from_id) where repeated_from_id is not null;

-- XP de una repetición mejorada: nunca reutiliza el sourceType del intento
-- original (evita cualquier ambigüedad con el ledger, aunque el sourceId ya
-- sea distinto por ser una fila nueva) y queda aparte para poder medir
-- cuánto XP viene de mejoras frente a intentos nuevos.
alter table public.camino_xp_events
  drop constraint if exists camino_xp_events_source_type_check;

alter table public.camino_xp_events
  add constraint camino_xp_events_source_type_check
  check (source_type in (
    'task_completion',
    'mission_completion',
    'streak_bonus',
    'exam_correction',
    'simulacro_completion',
    'parcial_completion',
    'flashcard_deck_completion',
    'flashcard_deck_author_bonus',
    'repeat_improvement'
  ));
