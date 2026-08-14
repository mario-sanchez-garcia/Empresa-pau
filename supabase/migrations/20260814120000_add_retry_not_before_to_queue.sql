-- "No lo he dado en clase" a mitad de un bloque (no en su primera tarjeta):
-- en vez de saltarse el resto del bloque, Camino reintenta la MISMA tarjeta
-- pasados unos días lectivos, mientras tanto rota a otras asignaturas. Esta
-- columna es la puerta que usa ensureCaminoCalendar: mientras
-- retry_not_before sea una fecha futura, el item permanece 'pending' en la
-- cola (no se marca postponed) pero no se programa. Ver
-- app/api/camino/postpone-mission/route.ts para quién la escribe y
-- app/lib/ensureCaminoCalendar.ts para quién la respeta.
alter table public.user_learning_queue
  add column if not exists retry_not_before date;
