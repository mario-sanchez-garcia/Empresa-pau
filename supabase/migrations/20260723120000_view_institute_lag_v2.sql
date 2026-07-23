-- Ritmo de Instituto Fase 1.5: curated view_institute_lag.
--
-- Replaces view_institute_lag with a version that excludes stale not_taught_yet
-- signals: if the student completed that same topic AFTER emitting the signal,
-- the signal is no longer informative and must not inflate the lag counter.
--
-- Topic identity: both pace_signals and camino_calendar carry (subject,
-- v2_sort_order) and (subject, block_slug). We use v2_sort_order when both
-- sides have it (primary), falling back to block_slug when v2_sort_order is
-- NULL on either side. topic_slug is NOT available on camino_calendar.
--
-- pace_signals ledger: NOT modified; signals are append-only.
-- Threshold (≥ 3 unique students) and 30-day window: unchanged.

create or replace view public.view_institute_lag as
select
  ps.institute_id,
  ps.subject,
  ps.block_slug,
  ps.topic_slug,
  ps.v2_sort_order,
  count(distinct ps.user_id)  as unique_students,
  max(ps.created_at)          as last_signal_at
from public.pace_signals ps
where ps.signal_type = 'not_taught_yet'
  and ps.created_at >= now() - interval '30 days'
  -- Exclude: student completed this topic *after* the signal was emitted.
  -- That means the topic was subsequently taught — signal is no longer valid.
  and not exists (
    select 1
    from public.camino_calendar cc
    where cc.user_id    = ps.user_id
      and cc.subject    = ps.subject
      and cc.status     = 'completed'
      and cc.completed_at > ps.created_at
      and (
        -- Preferred: match by v2_sort_order (unique per topic within a subject)
        (ps.v2_sort_order is not null
         and cc.v2_sort_order is not null
         and cc.v2_sort_order = ps.v2_sort_order)
        or
        -- Fallback: match by block_slug when v2_sort_order is unavailable
        (ps.v2_sort_order is null
         and ps.block_slug is not null
         and cc.block_slug  is not null
         and cc.block_slug  = ps.block_slug)
      )
  )
group by ps.institute_id, ps.subject, ps.block_slug, ps.topic_slug, ps.v2_sort_order
having count(distinct ps.user_id) >= 3;

-- Keep the view restricted to service-role / admin; authenticated users read
-- indirectly through the API layer.
revoke all on public.view_institute_lag from anon, authenticated;
