-- P0-3: UNIQUE constraint on camino_calendar to prevent duplicate missions
-- Only applies to rows where v2_sort_order IS NOT NULL (algorithm-generated)
-- Partial missions (v2_sort_order = NULL) rely on their own delete-then-insert idempotency

-- Step 1: Remove duplicate rows, keeping the one with the lowest id
-- (or the completed one if any; here we keep lowest id for simplicity)
DELETE FROM public.camino_calendar
WHERE id IN (
  SELECT id FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY user_id, scheduled_date, subject, v2_sort_order
        ORDER BY
          CASE WHEN status = 'completed' THEN 0 ELSE 1 END,
          id
      ) AS rn
    FROM public.camino_calendar
    WHERE v2_sort_order IS NOT NULL
  ) t
  WHERE rn > 1
);

-- Step 2: Add the unique constraint
ALTER TABLE public.camino_calendar
  ADD CONSTRAINT camino_calendar_unique_mission
  UNIQUE (user_id, scheduled_date, subject, v2_sort_order);
