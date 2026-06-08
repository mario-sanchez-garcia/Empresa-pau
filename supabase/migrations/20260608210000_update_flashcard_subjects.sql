alter table public.flashcards
  drop constraint if exists flashcards_subject_check;

alter table public.flashcards
  add constraint flashcards_subject_check
  check (subject in ('mates', 'fisica', 'quimica', 'lengua', 'historia'));
