\set ON_ERROR_STOP on
begin;
-- Invariantes de la telemetría de tramos de actividad contra PostgreSQL real.
--
-- Lo que se comprueba aquí no es que las migraciones corran —eso ya lo prueba
-- aplicarlas— sino que el CHECK de event_type quedó exactamente como el código
-- da por hecho. Dos suposiciones concretas que, si dejaran de cumplirse,
-- romperían la medición en silencio:
--
--  1. Que el MISMO segment_id sirva de idempotency_key para la apertura y para
--     el cierre sin colisionar. Depende de que event_type forme parte de la
--     clave única. Si alguien la estrechara, el cierre de cada tramo sería
--     rechazado como duplicado y toda medición quedaría en 'partial'.
--  2. Que un reintento del MISMO evento sí choque. De ahí depende la cola
--     offline: reenvía sin miedo porque el 23505 lo absorbe
--     recordMissionBehaviorEvent.

insert into auth.users values ('00000000-0000-0000-0000-000000000051');
insert into camino_calendar(id,user_id,subject,v2_sort_order,title,scheduled_date) values
 ('00000000-0000-0000-0000-000000000052','00000000-0000-0000-0000-000000000051','fisica',1,'Tema 1','2027-05-17');

do $$
declare
  u uuid = '00000000-0000-0000-0000-000000000051';
  m uuid = '00000000-0000-0000-0000-000000000052';
begin
  -- Los dos tipos nuevos entran, y comparten idempotency_key sin pisarse.
  insert into camino_mission_events(user_id,mission_id,event_type,idempotency_key,occurred_at)
    values (u,m,'activity_segment_opened','seg-1', now() - interval '30 minutes');
  insert into camino_mission_events(user_id,mission_id,event_type,idempotency_key,occurred_at)
    values (u,m,'activity_segment_closed','seg-1', now());
  if (select count(*) from camino_mission_events where user_id=u and idempotency_key='seg-1') <> 2 then
    raise exception 'apertura y cierre no conviven bajo el mismo segment_id';
  end if;

  -- occurred_at lo aporta quien observó el tramo, no el default now(): sin
  -- esto la medición volvería a ser hora de llegada al servidor.
  if (select occurred_at from camino_mission_events
        where user_id=u and event_type='activity_segment_opened') >= now() - interval '20 minutes' then
    raise exception 'occurred_at explicito ignorado';
  end if;

  -- Un reintento del mismo evento choca. La cola offline depende de ello.
  begin
    insert into camino_mission_events(user_id,mission_id,event_type,idempotency_key)
      values (u,m,'activity_segment_opened','seg-1');
    raise exception 'reintento duplicado aceptado';
  exception when unique_violation then null; end;

  -- Los cinco tipos originales siguen valiendo: ensanchar no es sustituir.
  insert into camino_mission_events(user_id,mission_id,event_type,idempotency_key) values
    (u,m,'started','started'),
    (u,m,'completed','completed'),
    (u,m,'postponed_manual','p1'),
    (u,m,'rescheduled_manual','r1'),
    (u,m,'rescheduled_conflict','c1');

  -- Y el CHECK sigue restringiendo: no se quedó permisivo al reescribirlo.
  begin
    insert into camino_mission_events(user_id,mission_id,event_type,idempotency_key)
      values (u,m,'tipo_inventado','x');
    raise exception 'el CHECK de event_type no restringe nada';
  exception when check_violation then null; end;
end $$;

rollback;
select 'Camino activity telemetry invariants passed' as result;
