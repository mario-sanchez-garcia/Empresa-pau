-- Hasta ahora solo completar una misión de Camino PAU daba XP de verdad.
-- Corregir un ejercicio de examen (Exámenes), un simulacro completo o una
-- práctica parcial ya cuentan como "día de estudio real" para la racha
-- (ver calcularRacha.ts), pero no daban ni un punto de XP — inconsistencia
-- que se corrige en el código a la vez que esta migración.

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
    'parcial_completion'
  ));
