-- Durable resend cooldown for serverless deployments. Only service-role
-- routes can read/write this table; there are deliberately no client policies.
CREATE TABLE IF NOT EXISTS public.auth_email_attempts (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  ip TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('signup_confirmation')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS auth_email_attempts_email_action_created_at_idx
  ON public.auth_email_attempts (email, action, created_at DESC);
CREATE INDEX IF NOT EXISTS auth_email_attempts_ip_action_created_at_idx
  ON public.auth_email_attempts (ip, action, created_at DESC);

ALTER TABLE public.auth_email_attempts ENABLE ROW LEVEL SECURITY;
