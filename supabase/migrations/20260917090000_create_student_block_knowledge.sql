-- Estado de conocimiento por bloque: distingue DECLARADO de CON EVIDENCIA de
-- DOMINADO.
--
-- El onboarding pregunta por dónde va el alumno en cada asignatura, pero una
-- declaración es una autoevaluación, no una demostración. Hasta ahora lo
-- declarado entraba como repaso express y ahí se quedaba: nada comprobaba si
-- era cierto. Esta tabla guarda las tres cosas por separado para que el
-- Camino pueda ajustar su punto de entrada con evidencia real.
--
-- Lo que NUNCA representa esta tabla: temario completado. Un tema se completa
-- haciéndolo (camino_calendar/user_learning_queue), jamás declarándolo ni
-- aprobando un microdiagnóstico de dos ejercicios.
create table if not exists public.student_block_knowledge (
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  block_slug text not null,

  -- declarado    : el alumno dijo que lo había dado en clase. Sin evidencia.
  -- con_evidencia: hizo el microdiagnóstico y lo superó.
  -- refutado     : hizo el microdiagnóstico y NO lo superó.
  -- dominado     : rendimiento sostenido posterior. NUNCA lo produce un
  --                diagnóstico (ver app/lib/camino/knowledgeState.ts).
  state text not null default 'declarado',

  -- Modo declarado en onboarding que originó esta fila (first_block/mid/review).
  declared_start_mode text,

  -- Evidencia acumulada. `evidence_attempts` cuenta SOLO intentos reales de
  -- ejercicios, y `mastery_attempts` excluye además los diagnósticos: la
  -- promoción a 'dominado' se mide solo sobre trabajo normal del alumno.
  evidence_attempts integer not null default 0,
  evidence_avg_score numeric,
  mastery_attempts integer not null default 0,
  last_evidence_at timestamptz,

  -- Goteo del microdiagnóstico.
  diagnostic_mission_id uuid,
  diagnostic_offered_at timestamptz,
  diagnostic_completed_at timestamptz,
  diagnostic_skipped_count integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  primary key (user_id, subject, block_slug)
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'student_block_knowledge_state_check'
      and conrelid = 'public.student_block_knowledge'::regclass
  ) then
    alter table public.student_block_knowledge
      add constraint student_block_knowledge_state_check
      check (state in ('declarado', 'con_evidencia', 'refutado', 'dominado'));
  end if;
end
$$;

create index if not exists student_block_knowledge_user_state_idx
  on public.student_block_knowledge (user_id, state);

alter table public.student_block_knowledge enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'student_block_knowledge'
      and policyname = 'student_block_knowledge_select_own'
  ) then
    create policy student_block_knowledge_select_own
      on public.student_block_knowledge for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'student_block_knowledge'
      and policyname = 'student_block_knowledge_write_own'
  ) then
    create policy student_block_knowledge_write_own
      on public.student_block_knowledge for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end
$$;

comment on table public.student_block_knowledge is
  'Conocimiento por bloque separado en declarado / con evidencia / dominado. Nunca representa temario completado.';
comment on column public.student_block_knowledge.mastery_attempts is
  'Intentos que cuentan para dominio: excluye los microdiagnósticos a propósito, para que un diagnóstico no pueda promover a dominado.';
