-- Guarda los mensajes del formulario de /contacto además de enviarlos por
-- email (ver app/lib/email/sendContactMessage.ts): antes solo llegaban a la
-- bandeja de soporte, sin ningún registro consultable desde la app. Solo se
-- lee/escribe desde rutas server-side con service-role (POST /api/contact,
-- GET/PATCH /api/admin/contact-messages) — igual que camino_calendar o
-- user_learning_queue, sin política para authenticated/anon porque nadie
-- debe poder leer mensajes de otra persona ni marcar los suyos como leídos.

CREATE TABLE IF NOT EXISTS contact_messages (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  is_read boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx ON contact_messages (created_at DESC);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Sin políticas a propósito: todo el acceso pasa por rutas API con
-- createServiceClient() (bypassa RLS), nunca directamente desde el cliente.
