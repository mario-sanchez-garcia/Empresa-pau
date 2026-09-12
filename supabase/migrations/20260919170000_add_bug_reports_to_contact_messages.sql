-- Añade el reporte de bug (widget flotante global) sobre la tabla
-- contact_messages ya existente, en vez de crear una tabla nueva: comparte
-- validación, rate-limit y panel de admin con el formulario de /contacto
-- normal (ver app/api/contact/route.ts). report_type distingue ambos usos
-- sin tocar las filas existentes (default 'contact' las deja igual).
alter table public.contact_messages
  add column if not exists report_type text not null default 'contact',
  add column if not exists screenshot_path text;

alter table public.contact_messages
  drop constraint if exists contact_messages_report_type_check;
alter table public.contact_messages
  add constraint contact_messages_report_type_check
  check (report_type in ('contact', 'bug_report'));

comment on column public.contact_messages.report_type is
  'contact = formulario de /contacto; bug_report = widget flotante de reporte de bugs.';
comment on column public.contact_messages.screenshot_path is
  'Path en el bucket bug-report-screenshots (privado) de la captura adjunta al reporte, si la hay.';

-- Bucket privado para las capturas del widget de reporte de bugs. Mismo
-- patrón que zona-images (ver 20260608143000_create_zona_canvases.sql):
-- el alumno sube directo desde el navegador con el cliente Supabase
-- autenticado, con RLS por carpeta (una carpeta por auth.uid()) — el admin
-- lee con el service client (bypassa RLS) vía /api/admin/contact-messages.
insert into storage.buckets (id, name, public)
values ('bug-report-screenshots', 'bug-report-screenshots', false)
on conflict (id) do nothing;

create policy "Users can upload their bug report screenshots"
  on storage.objects
  for insert
  with check (
    bucket_id = 'bug-report-screenshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can read their bug report screenshots"
  on storage.objects
  for select
  using (
    bucket_id = 'bug-report-screenshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
