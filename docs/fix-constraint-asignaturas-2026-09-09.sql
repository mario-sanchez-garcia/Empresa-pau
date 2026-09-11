alter table public.user_learning_queue drop constraint if exists user_learning_queue_subject_check;
alter table public.user_learning_queue add constraint user_learning_queue_subject_check check (subject in ('matematicas_ii','matematicas_ccss','lengua','historia_espana','fisica','quimica','ingles','historia_filosofia','economia')) not valid;
