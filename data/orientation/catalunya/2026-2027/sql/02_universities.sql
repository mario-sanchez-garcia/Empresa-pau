-- Generated, idempotent Catalunya 2026-2027 seed chunk. Apply after migration 20260913120000.
insert into public.orientation_universities (id, name, acronym, stable_code, community, official_url, active) values
  ('7d29a9ad-8802-5a48-a79b-d502e03645f9', 'Universitat Autònoma de Barcelona', 'UAB', 'CAT:UAB', 'Cataluña', 'https://www.uab.cat/', true),
  ('6c0c27cb-6f92-5e61-bad4-7e2b6a1d205c', 'Universitat de Barcelona', 'UB', 'CAT:UB', 'Cataluña', 'https://www.ub.edu/', true),
  ('339c90d6-3ed0-5ca0-9747-26fd6e9be51a', 'Universitat Politècnica de Catalunya', 'UPC', 'CAT:UPC', 'Cataluña', 'https://www.upc.edu/', true),
  ('22397b4d-d31b-5a90-b8ec-0e20cebfa63d', 'Universitat Pompeu Fabra', 'UPF', 'CAT:UPF', 'Cataluña', 'https://www.upf.edu/', true),
  ('6abf2009-f5d2-5682-9644-7b9c8e40cd16', 'Universitat Rovira i Virgili', 'URV', 'CAT:URV', 'Cataluña', 'https://www.urv.cat/', true),
  ('6989ada0-00da-5f81-8e82-de056967fb43', 'Universitat de Vic - Universitat Central de Catalunya', 'UVic-UCC', 'CAT:UVic-UCC', 'Cataluña', 'https://www.uvic.cat/', true),
  ('6150910c-b723-5bcc-a78a-0d4e82278b84', 'Universitat de Girona', 'UdG', 'CAT:UdG', 'Cataluña', 'https://www.udg.edu/', true),
  ('333abb23-ecb5-57d4-b1cf-f803fc229043', 'Universitat de Lleida', 'UdL', 'CAT:UdL', 'Cataluña', 'https://www.udl.cat/', true)
on conflict (id) do update set name=excluded.name, acronym=excluded.acronym, stable_code=excluded.stable_code, community=excluded.community, official_url=excluded.official_url, active=excluded.active;
