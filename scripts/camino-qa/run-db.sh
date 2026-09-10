#!/bin/sh
set -eu
# Invariantes de Camino contra un PostgreSQL REAL, no un simulador.
#
# El contenedor se recrea en cada tanda a propósito: las migraciones no son
# reidempotentes (ni deben serlo), así que reutilizar el de la ejecución
# anterior fallaba con "relation already exists" y parecía que fallaban las
# invariantes. Desechable y con etiqueta propia para no tocar nada más.
container=kairo-camino-qa-0910
cd "$(dirname "$0")/../.."

docker rm -f "$container" >/dev/null 2>&1 || true
docker run -d --name "$container" --label purpose=kairo-camino-tests \
  -e POSTGRES_HOST_AUTH_METHOD=trust postgres:16-alpine >/dev/null
until docker exec "$container" pg_isready -U postgres >/dev/null 2>&1; do sleep 1; done

for sql in \
  scripts/camino-qa/bootstrap.sql \
  supabase/migrations/20260701120000_create_camino_tables.sql \
  supabase/migrations/20260717120000_camino_calendar_unique_constraint.sql \
  supabase/migrations/20260806160100_add_time_slots_to_camino_calendar.sql \
  supabase/migrations/20260919100000_camino_reliability.sql \
  scripts/camino-qa/reliability.sql
do
  docker exec -i "$container" psql -U postgres -v ON_ERROR_STOP=1 < "$sql" >/dev/null
done

echo "Camino database invariants passed"
docker rm -f "$container" >/dev/null 2>&1 || true
