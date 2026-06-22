ALTER TABLE signup_attempts
ADD COLUMN IF NOT EXISTS email TEXT;

UPDATE signup_attempts
SET email = 'unknown'
WHERE email IS NULL;

ALTER TABLE signup_attempts
ALTER COLUMN email SET NOT NULL;

CREATE INDEX IF NOT EXISTS signup_attempts_email_created_at_idx
ON signup_attempts (email, created_at);
