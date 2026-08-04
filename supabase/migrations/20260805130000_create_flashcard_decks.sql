-- Mazos de flashcards en La Zona: hoy "mazo" es solo un filtro ad-hoc de
-- flashcards por subject+topic en el cliente, sin persistencia de sesiones
-- de estudio. Esto añade una entidad real de mazo (tamaño configurable,
-- publicación pública) más el historial de intentos que necesitan las
-- estadísticas por mazo y el ranking — sin tocar la tabla flashcards salvo
-- por la nueva columna deck_id, nullable, para no romper las tarjetas
-- sueltas ya creadas.

create table if not exists public.flashcard_decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null check (subject in (
    'mates',
    'fisica',
    'quimica',
    'biologia',
    'ingles',
    'lengua',
    'historia',
    'historia_filosofia'
  )),
  topic text not null,
  title text not null,
  is_public boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists flashcard_decks_user_idx
  on public.flashcard_decks (user_id);

create index if not exists flashcard_decks_public_idx
  on public.flashcard_decks (is_public)
  where is_public;

alter table public.flashcards
  add column if not exists deck_id uuid references public.flashcard_decks(id) on delete set null;

create index if not exists flashcards_deck_idx
  on public.flashcards (deck_id);

-- Un intento = una sesión de estudio completada de un mazo por un usuario
-- (el propio autor u otro alumno resolviendo un mazo público). Base de las
-- estadísticas por mazo (aciertos a la primera, tiempo total, historial) y
-- del ranking por mazo.
create table if not exists public.flashcard_deck_attempts (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.flashcard_decks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  total_cards integer not null,
  correct_first_try integer not null default 0,
  duration_seconds integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists flashcard_deck_attempts_deck_idx
  on public.flashcard_deck_attempts (deck_id, created_at desc);

create index if not exists flashcard_deck_attempts_user_idx
  on public.flashcard_deck_attempts (user_id);

alter table public.flashcard_decks enable row level security;
alter table public.flashcard_deck_attempts enable row level security;

create policy "Users can read their own decks"
  on public.flashcard_decks
  for select
  using (auth.uid() = user_id);

create policy "Anyone can read public decks"
  on public.flashcard_decks
  for select
  using (is_public = true);

create policy "Users can create their own decks"
  on public.flashcard_decks
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own decks"
  on public.flashcard_decks
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own decks"
  on public.flashcard_decks
  for delete
  using (auth.uid() = user_id);

-- Las tarjetas ya tenían política de solo-lectura-propia; esta se suma (las
-- políticas permisivas se combinan con OR) para permitir leer las tarjetas
-- de un mazo público sin tocar el acceso de escritura, que sigue siendo
-- exclusivo del dueño.
create policy "Anyone can read cards in a public deck"
  on public.flashcards
  for select
  using (
    deck_id is not null
    and exists (
      select 1 from public.flashcard_decks d
      where d.id = flashcards.deck_id and d.is_public = true
    )
  );

create policy "Users can read their own attempts"
  on public.flashcard_deck_attempts
  for select
  using (auth.uid() = user_id);

create policy "Deck owners can read attempts on their own deck"
  on public.flashcard_deck_attempts
  for select
  using (
    exists (
      select 1 from public.flashcard_decks d
      where d.id = flashcard_deck_attempts.deck_id and d.user_id = auth.uid()
    )
  );

create policy "Anyone can read attempts on a public deck"
  on public.flashcard_deck_attempts
  for select
  using (
    exists (
      select 1 from public.flashcard_decks d
      where d.id = flashcard_deck_attempts.deck_id and d.is_public = true
    )
  );

-- Solo se puede registrar un intento propio, y solo sobre un mazo accesible
-- (el propio o uno público) — evita registrar intentos-fantasma sobre mazos
-- privados ajenos.
create policy "Users can record attempts on accessible decks"
  on public.flashcard_deck_attempts
  for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.flashcard_decks d
      where d.id = flashcard_deck_attempts.deck_id
        and (d.user_id = auth.uid() or d.is_public = true)
    )
  );

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
    'flashcard_deck_author_bonus'
  ));
