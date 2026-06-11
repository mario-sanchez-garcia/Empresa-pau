-- Keep flashcard subject validation aligned with the subjects exposed in La Zona.

alter table public.flashcards
  drop constraint if exists flashcards_subject_check;

alter table public.flashcards
  add constraint flashcards_subject_check
  check (subject in (
    'mates',
    'fisica',
    'quimica',
    'biologia',
    'ingles',
    'lengua',
    'historia',
    'historia_filosofia'
  ));
