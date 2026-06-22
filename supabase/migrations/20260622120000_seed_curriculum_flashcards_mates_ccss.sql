-- Seed complementario: Matemáticas CCSS desde curriculum_flashcards.
-- Reutiliza el currículo editorial de Matemáticas II y excluye Geometría espacial.
-- Idempotente por unique (subject, region, sort_order).

insert into public.curriculum_flashcards
  (subject, region, chapter_number, chapter_title, block_key,
   order_label, sort_order, title, concept_latex,
   alert_title, alert_latex, worked_case_title, worked_case_latex)
select
  'matematicas_ccss',
  region,
  chapter_number,
  chapter_title,
  block_key,
  order_label,
  sort_order,
  title,
  concept_latex,
  alert_title,
  alert_latex,
  worked_case_title,
  worked_case_latex
from public.curriculum_flashcards
where subject = 'mates'
  and region = 'ambas'
  and block_key <> 'Geometría'
on conflict (subject, region, sort_order) do update set
  chapter_number = excluded.chapter_number,
  chapter_title = excluded.chapter_title,
  block_key = excluded.block_key,
  order_label = excluded.order_label,
  title = excluded.title,
  concept_latex = excluded.concept_latex,
  alert_title = excluded.alert_title,
  alert_latex = excluded.alert_latex,
  worked_case_title = excluded.worked_case_title,
  worked_case_latex = excluded.worked_case_latex;
