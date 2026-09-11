-- El admin hoy solo puede responder a contact_messages saliendo de la app
-- (mailto:), y el alumno recibe la respuesta en su email normal, no dentro
-- de Kairo. Añadimos una respuesta del admin persistida en la propia fila
-- (modelo: mensaje del alumno -> una unica respuesta del admin -> fin, sin
-- hilo de ida y vuelta) para poder mostrarla dentro de Ayuda -> Contactanos.
alter table public.contact_messages
  add column if not exists respuesta text,
  add column if not exists respuesta_at timestamptz,
  add column if not exists respondido_por text,
  add column if not exists respuesta_leida boolean not null default false;

-- El alumno debe poder ver sus propios mensajes (y la respuesta, si la hay)
-- dentro de la app, pero nunca los de otro alumno. contact_messages no
-- guarda user_id (el formulario de /contacto es texto libre y no lo
-- tocamos), asi que la unica columna fiable para filtrar es el email de la
-- fila -- comparado contra el email VERIFICADO de la sesion via el JWT de
-- Supabase (auth.jwt() ->> 'email'), no un valor que el cliente controle.
-- Los inserts/updates de administracion siguen pasando por rutas con
-- createServiceClient() (bypassa RLS), igual que el resto de la tabla.
create policy "Students can read their own contact messages"
  on public.contact_messages
  for select
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

comment on column public.contact_messages.respuesta is
  'Respuesta unica del admin al mensaje. No editable una vez guardada.';
comment on column public.contact_messages.respuesta_at is
  'Cuando se guardo la respuesta.';
comment on column public.contact_messages.respondido_por is
  'Email del interno (INTERNAL_USER_EMAILS) que respondio.';
comment on column public.contact_messages.respuesta_leida is
  'El alumno ya vio la respuesta dentro de Ayuda -> Contactanos.';
