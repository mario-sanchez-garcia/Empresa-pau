CREATE TABLE signup_attempts (
  id BIGSERIAL PRIMARY KEY,
  ip TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON signup_attempts (ip, created_at);

ALTER TABLE signup_attempts ENABLE ROW LEVEL SECURITY;
