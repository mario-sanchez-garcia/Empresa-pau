-- email_events: append-only ledger for every email sent (or attempted) by the platform.
-- Unique constraint on (user_id, email_type, dedupe_key) is the primary dedup primitive:
--   • welcome email   → dedupe_key = 'once'
--   • daily-reminder  → dedupe_key = Madrid date (YYYY-MM-DD)
-- Only service-role reads/writes; no RLS policies needed.

CREATE TABLE public.email_events (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid        NOT NULL,
  email_type          text        NOT NULL,
  dedupe_key          text        NOT NULL,
  status              text        NOT NULL CHECK (status IN ('sent', 'failed', 'skipped')),
  resend_message_id   text,
  metadata            jsonb       NOT NULL DEFAULT '{}',
  sent_at             timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, email_type, dedupe_key)
);

CREATE INDEX email_events_user_sent_idx ON public.email_events (user_id, sent_at DESC);
CREATE INDEX email_events_type_sent_idx ON public.email_events (email_type, sent_at DESC);

ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;
-- Sin policies: solo service role escribe/lee.
