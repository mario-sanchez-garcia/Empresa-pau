-- Backfill de topic_id para las 49 lecciones reales de Economía de la Empresa
-- (curriculum_content_v2, ya publicadas) — curriculum_topics tenía 0 filas para este
-- subject, nunca se hizo esta migración cuando se creó el contenido. 1 topic por
-- lección (mismo criterio que Química), block_key/block_title tomados de los 7
-- bloques reales ya usados en las propias filas (La Empresa y su Entorno, Desarrollo y
-- Crecimiento, Organización y Dirección, La Función Productiva, La Función Comercial:
-- El Marketing, La Información en la Empresa: Contabilidad y Fiscalidad, La Función
-- Financiera). NO se toca ningún dato de las 7 asignaturas ya trabajadas.

INSERT INTO curriculum_topics (id, subject, block_key, block_title, topic_slug, title, "order") VALUES
  ('88fda424-73f9-47fb-a83a-bcc0f4925466'::uuid, 'economia', 'la-empresa-y-su-entorno', 'La Empresa y su Entorno', 'concepto-de-empresa-elementos-y-funciones', 'Concepto de Empresa: Elementos y Funciones', 1),
  ('b0476c14-790f-4cca-966b-7de70b3e5e73'::uuid, 'economia', 'la-empresa-y-su-entorno', 'La Empresa y su Entorno', 'clasificacion-de-las-empresas', 'Clasificación de las Empresas', 2),
  ('ff1d5c94-81ae-484e-9be2-8f670908b3a8'::uuid, 'economia', 'la-empresa-y-su-entorno', 'La Empresa y su Entorno', 'el-empresario-individual-autonomo', 'El Empresario Individual (Autónomo)', 3),
  ('44dc7952-39a7-417e-82df-ad9225815beb'::uuid, 'economia', 'la-empresa-y-su-entorno', 'La Empresa y su Entorno', 'formas-juridicas-societarias-s-l-y-s-a', 'Formas Jurídicas Societarias: S.L. y S.A.', 4),
  ('1a33010b-664c-499c-9fc4-951bc5e57eb9'::uuid, 'economia', 'la-empresa-y-su-entorno', 'La Empresa y su Entorno', 'la-sociedad-cooperativa-y-la-economia-social', 'La Sociedad Cooperativa y la Economía Social', 5),
  ('9ca7c3be-cead-4fde-91f4-da56eeb6baaa'::uuid, 'economia', 'la-empresa-y-su-entorno', 'La Empresa y su Entorno', 'los-objetivos-de-la-empresa', 'Los Objetivos de la Empresa', 6),
  ('3d9227ee-15a7-4cd0-8bb6-1399ff29a5a1'::uuid, 'economia', 'la-empresa-y-su-entorno', 'La Empresa y su Entorno', 'la-responsabilidad-social-corporativa-rsc', 'La Responsabilidad Social Corporativa (RSC)', 7),
  ('17b75201-343e-47f1-b5a3-49686415c56b'::uuid, 'economia', 'la-empresa-y-su-entorno', 'La Empresa y su Entorno', 'el-entorno-general-de-la-empresa-analisis-pest', 'El Entorno General de la Empresa: Análisis PEST', 8),
  ('1ee46eac-4098-40cc-9601-d865ad00dbb0'::uuid, 'economia', 'la-empresa-y-su-entorno', 'La Empresa y su Entorno', 'el-entorno-especifico-las-cinco-fuerzas-de-porter', 'El Entorno Específico: Las Cinco Fuerzas de Porter', 9),
  ('e7288d36-c125-497c-8b42-078f33a6330f'::uuid, 'economia', 'la-empresa-y-su-entorno', 'La Empresa y su Entorno', 'el-analisis-dafo', 'El Análisis DAFO', 10),
  ('9eeb345d-5398-4b67-9346-788d670ddc21'::uuid, 'economia', 'desarrollo-y-crecimiento-de-la-empresa', 'Desarrollo y Crecimiento de la Empresa', 'la-localizacion-de-la-empresa', 'La Localización de la Empresa', 11),
  ('d6b5082b-130c-4e45-8f64-9b871be0505c'::uuid, 'economia', 'desarrollo-y-crecimiento-de-la-empresa', 'Desarrollo y Crecimiento de la Empresa', 'la-dimension-de-la-empresa', 'La Dimensión de la Empresa', 12),
  ('e9bfdf98-df6b-4132-9a53-b26c594bfdb7'::uuid, 'economia', 'desarrollo-y-crecimiento-de-la-empresa', 'Desarrollo y Crecimiento de la Empresa', 'estrategias-de-crecimiento-especializacion-y-diversificacion', 'Estrategias de Crecimiento: Especialización y Diversificación', 13),
  ('b2324e85-b1ed-40a5-adca-56a60dc22596'::uuid, 'economia', 'desarrollo-y-crecimiento-de-la-empresa', 'Desarrollo y Crecimiento de la Empresa', 'crecimiento-interno-vs-crecimiento-externo', 'Crecimiento Interno vs. Crecimiento Externo', 14),
  ('0c9bdb88-64b6-4cc0-b286-6d4f5b22482f'::uuid, 'economia', 'desarrollo-y-crecimiento-de-la-empresa', 'Desarrollo y Crecimiento de la Empresa', 'la-cooperacion-entre-empresas', 'La Cooperación entre Empresas', 15),
  ('b35995f2-4217-4f6c-8d3d-888ee417f1eb'::uuid, 'economia', 'desarrollo-y-crecimiento-de-la-empresa', 'Desarrollo y Crecimiento de la Empresa', 'la-importancia-de-las-pymes', 'La Importancia de las PYMES', 16),
  ('becf8d79-6ca3-45e8-b41b-62b386d78957'::uuid, 'economia', 'desarrollo-y-crecimiento-de-la-empresa', 'Desarrollo y Crecimiento de la Empresa', 'la-empresa-multinacional-y-la-globalizacion', 'La Empresa Multinacional y la Globalización', 17),
  ('518043a1-6897-49df-95ed-04b06354eab9'::uuid, 'economia', 'organizacion-y-direccion-de-la-empresa', 'Organización y Dirección de la Empresa', 'las-funciones-del-proceso-de-administracion', 'Las Funciones del Proceso de Administración', 18),
  ('a9b7032c-418d-4e2e-8738-5afaa367f843'::uuid, 'economia', 'organizacion-y-direccion-de-la-empresa', 'Organización y Dirección de la Empresa', 'la-planificacion-estrategica', 'La Planificación Estratégica', 19),
  ('7da1d588-0200-4d5a-a99e-65f45d5bbffc'::uuid, 'economia', 'organizacion-y-direccion-de-la-empresa', 'Organización y Dirección de la Empresa', 'estructuras-organizativas-organigramas', 'Estructuras Organizativas: Organigramas', 20),
  ('e5b46117-803a-4e47-aae5-8b4eac071c91'::uuid, 'economia', 'organizacion-y-direccion-de-la-empresa', 'Organización y Dirección de la Empresa', 'estilos-de-direccion-y-liderazgo', 'Estilos de Dirección y Liderazgo', 21),
  ('8e581ab5-c6ab-4dc8-bcec-a5f765dfa95d'::uuid, 'economia', 'organizacion-y-direccion-de-la-empresa', 'Organización y Dirección de la Empresa', 'la-gestion-de-los-recursos-humanos', 'La Gestión de los Recursos Humanos', 22),
  ('dc2a36c4-283d-414c-8152-a018acfffd46'::uuid, 'economia', 'organizacion-y-direccion-de-la-empresa', 'Organización y Dirección de la Empresa', 'teorias-de-la-motivacion-laboral-maslow-y-herzberg', 'Teorías de la Motivación Laboral: Maslow y Herzberg', 23),
  ('d8d11d43-e7cd-4aaf-88b4-e3d5567f78d7'::uuid, 'economia', 'organizacion-y-direccion-de-la-empresa', 'Organización y Dirección de la Empresa', 'el-conflicto-y-la-negociacion-laboral', 'El Conflicto y la Negociación Laboral', 24),
  ('1ed74f87-d517-43d7-bfd2-9f4099be1274'::uuid, 'economia', 'la-funcion-productiva', 'La Función Productiva', 'el-proceso-de-produccion', 'El Proceso de Producción', 25),
  ('31644214-18c6-40d3-a3b3-63e9b5f366a9'::uuid, 'economia', 'la-funcion-productiva', 'La Función Productiva', 'la-productividad-y-su-calculo', 'La Productividad y su Cálculo', 26),
  ('bf4e3d65-0a78-4616-8b9b-7077effd9315'::uuid, 'economia', 'la-funcion-productiva', 'La Función Productiva', 'costes-de-la-empresa-fijos-y-variables', 'Costes de la Empresa: Fijos y Variables', 27),
  ('4600bf0a-f1ef-4eb0-917a-24ae811dbc69'::uuid, 'economia', 'la-funcion-productiva', 'La Función Productiva', 'el-umbral-de-rentabilidad-o-punto-muerto', 'El Umbral de Rentabilidad o Punto Muerto', 28),
  ('990d21d8-4e8d-4df4-b112-203e8d21f882'::uuid, 'economia', 'la-funcion-productiva', 'La Función Productiva', 'la-i-d-i-y-el-cambio-tecnologico', 'La I+D+i y el Cambio Tecnológico', 29),
  ('ba67462b-9aa0-4148-8598-a6ef76b2b487'::uuid, 'economia', 'la-funcion-productiva', 'La Función Productiva', 'la-gestion-de-existencias-el-stock', 'La Gestión de Existencias: El Stock', 30),
  ('25ae5dd9-6c11-4b61-941a-f64667d8edb7'::uuid, 'economia', 'la-funcion-comercial-el-marketing', 'La Función Comercial: El Marketing', 'el-mercado-concepto-y-clases', 'El Mercado: Concepto y Clases', 31),
  ('9836e560-46f9-4189-bb04-e3abe34c4719'::uuid, 'economia', 'la-funcion-comercial-el-marketing', 'La Función Comercial: El Marketing', 'la-investigacion-de-mercados', 'La Investigación de Mercados', 32),
  ('3a7201f6-0eb8-42e8-bb89-fd3d24844397'::uuid, 'economia', 'la-funcion-comercial-el-marketing', 'La Función Comercial: El Marketing', 'la-segmentacion-de-mercados', 'La Segmentación de Mercados', 33),
  ('93af51fc-9d8f-4f86-84b9-f92649aa35f3'::uuid, 'economia', 'la-funcion-comercial-el-marketing', 'La Función Comercial: El Marketing', 'el-marketing-mix-producto-y-precio', 'El Marketing Mix: Producto y Precio', 34),
  ('ae6d94ee-ee3a-43b2-bce6-f9a962b44c9b'::uuid, 'economia', 'la-funcion-comercial-el-marketing', 'La Función Comercial: El Marketing', 'el-marketing-mix-distribucion-y-comunicacion', 'El Marketing Mix: Distribución y Comunicación', 35),
  ('f0180ffe-aa17-4e92-b5d9-b30d0c8b586a'::uuid, 'economia', 'la-funcion-comercial-el-marketing', 'La Función Comercial: El Marketing', 'el-ciclo-de-vida-del-producto', 'El Ciclo de Vida del Producto', 36),
  ('9c4fcb77-aaad-4fdd-b38f-0c9da9cb4331'::uuid, 'economia', 'la-informacion-en-la-empresa-contabilidad-y-fiscalidad', 'La Información en la Empresa: Contabilidad y Fiscalidad', 'el-patrimonio-empresarial-masas-patrimoniales', 'El Patrimonio Empresarial: Masas Patrimoniales', 37),
  ('fa50460c-093f-4d84-b635-8ab279e8418d'::uuid, 'economia', 'la-informacion-en-la-empresa-contabilidad-y-fiscalidad', 'La Información en la Empresa: Contabilidad y Fiscalidad', 'el-balance-de-situacion', 'El Balance de Situación', 38),
  ('1832ff3c-3cd3-4311-93e1-6b3d33d11aef'::uuid, 'economia', 'la-informacion-en-la-empresa-contabilidad-y-fiscalidad', 'La Información en la Empresa: Contabilidad y Fiscalidad', 'la-cuenta-de-perdidas-y-ganancias', 'La Cuenta de Pérdidas y Ganancias', 39),
  ('749443c2-61ef-43a2-81bf-3e206928bc4a'::uuid, 'economia', 'la-informacion-en-la-empresa-contabilidad-y-fiscalidad', 'La Información en la Empresa: Contabilidad y Fiscalidad', 'el-fondo-de-maniobra', 'El Fondo de Maniobra', 40),
  ('61dc2bf0-799c-4536-8fb8-859e28e10e05'::uuid, 'economia', 'la-informacion-en-la-empresa-contabilidad-y-fiscalidad', 'La Información en la Empresa: Contabilidad y Fiscalidad', 'ratios-de-liquidez-tesoreria-y-garantia', 'Ratios de Liquidez, Tesorería y Garantía', 41),
  ('65dbd041-df4b-4d82-8734-38c0b92abbad'::uuid, 'economia', 'la-informacion-en-la-empresa-contabilidad-y-fiscalidad', 'La Información en la Empresa: Contabilidad y Fiscalidad', 'ratios-de-endeudamiento-y-rentabilidad-roa-y-roe', 'Ratios de Endeudamiento y Rentabilidad (ROA y ROE)', 42),
  ('7bd52750-9824-4cc5-b744-b4eb61f6083b'::uuid, 'economia', 'la-informacion-en-la-empresa-contabilidad-y-fiscalidad', 'La Información en la Empresa: Contabilidad y Fiscalidad', 'la-fiscalidad-de-la-empresa', 'La Fiscalidad de la Empresa', 43),
  ('9f9cdc86-e834-4f88-8267-1aa18b1599d4'::uuid, 'economia', 'la-funcion-financiera', 'La Función Financiera', 'la-estructura-economica-y-financiera-de-la-empresa', 'La Estructura Económica y Financiera de la Empresa', 44),
  ('1b719290-3431-4bf3-af44-4b6d30af2c04'::uuid, 'economia', 'la-funcion-financiera', 'La Función Financiera', 'las-inversiones-y-su-clasificacion', 'Las Inversiones y su Clasificación', 45),
  ('49208d9e-e559-4d2d-bbf4-975158422f02'::uuid, 'economia', 'la-funcion-financiera', 'La Función Financiera', 'las-fuentes-de-financiacion-propias-y-ajenas', 'Las Fuentes de Financiación: Propias y Ajenas', 46),
  ('a6ba5096-eefe-43b0-8938-9c2190d8c054'::uuid, 'economia', 'la-funcion-financiera', 'La Función Financiera', 'el-leasing-y-el-factoring', 'El Leasing y el Factoring', 47),
  ('f0b74096-5fa6-4d43-bf2d-e97f34f76634'::uuid, 'economia', 'la-funcion-financiera', 'La Función Financiera', 'la-valoracion-de-inversiones-el-metodo-del-van', 'La Valoración de Inversiones: El Método del VAN', 48),
  ('dc9ff72c-cb53-45ae-8842-4b3b03f9e2c8'::uuid, 'economia', 'la-funcion-financiera', 'La Función Financiera', 'la-valoracion-de-inversiones-tir-y-payback', 'La Valoración de Inversiones: TIR y Payback', 49);

UPDATE curriculum_content_v2 SET topic_id = '88fda424-73f9-47fb-a83a-bcc0f4925466'::uuid WHERE id = 319;
UPDATE curriculum_content_v2 SET topic_id = 'b0476c14-790f-4cca-966b-7de70b3e5e73'::uuid WHERE id = 320;
UPDATE curriculum_content_v2 SET topic_id = 'ff1d5c94-81ae-484e-9be2-8f670908b3a8'::uuid WHERE id = 321;
UPDATE curriculum_content_v2 SET topic_id = '44dc7952-39a7-417e-82df-ad9225815beb'::uuid WHERE id = 322;
UPDATE curriculum_content_v2 SET topic_id = '1a33010b-664c-499c-9fc4-951bc5e57eb9'::uuid WHERE id = 323;
UPDATE curriculum_content_v2 SET topic_id = '9ca7c3be-cead-4fde-91f4-da56eeb6baaa'::uuid WHERE id = 324;
UPDATE curriculum_content_v2 SET topic_id = '3d9227ee-15a7-4cd0-8bb6-1399ff29a5a1'::uuid WHERE id = 325;
UPDATE curriculum_content_v2 SET topic_id = '17b75201-343e-47f1-b5a3-49686415c56b'::uuid WHERE id = 326;
UPDATE curriculum_content_v2 SET topic_id = '1ee46eac-4098-40cc-9601-d865ad00dbb0'::uuid WHERE id = 327;
UPDATE curriculum_content_v2 SET topic_id = 'e7288d36-c125-497c-8b42-078f33a6330f'::uuid WHERE id = 328;
UPDATE curriculum_content_v2 SET topic_id = '9eeb345d-5398-4b67-9346-788d670ddc21'::uuid WHERE id = 329;
UPDATE curriculum_content_v2 SET topic_id = 'd6b5082b-130c-4e45-8f64-9b871be0505c'::uuid WHERE id = 330;
UPDATE curriculum_content_v2 SET topic_id = 'e9bfdf98-df6b-4132-9a53-b26c594bfdb7'::uuid WHERE id = 331;
UPDATE curriculum_content_v2 SET topic_id = 'b2324e85-b1ed-40a5-adca-56a60dc22596'::uuid WHERE id = 332;
UPDATE curriculum_content_v2 SET topic_id = '0c9bdb88-64b6-4cc0-b286-6d4f5b22482f'::uuid WHERE id = 333;
UPDATE curriculum_content_v2 SET topic_id = 'b35995f2-4217-4f6c-8d3d-888ee417f1eb'::uuid WHERE id = 334;
UPDATE curriculum_content_v2 SET topic_id = 'becf8d79-6ca3-45e8-b41b-62b386d78957'::uuid WHERE id = 335;
UPDATE curriculum_content_v2 SET topic_id = '518043a1-6897-49df-95ed-04b06354eab9'::uuid WHERE id = 336;
UPDATE curriculum_content_v2 SET topic_id = 'a9b7032c-418d-4e2e-8738-5afaa367f843'::uuid WHERE id = 337;
UPDATE curriculum_content_v2 SET topic_id = '7da1d588-0200-4d5a-a99e-65f45d5bbffc'::uuid WHERE id = 338;
UPDATE curriculum_content_v2 SET topic_id = 'e5b46117-803a-4e47-aae5-8b4eac071c91'::uuid WHERE id = 339;
UPDATE curriculum_content_v2 SET topic_id = '8e581ab5-c6ab-4dc8-bcec-a5f765dfa95d'::uuid WHERE id = 340;
UPDATE curriculum_content_v2 SET topic_id = 'dc2a36c4-283d-414c-8152-a018acfffd46'::uuid WHERE id = 341;
UPDATE curriculum_content_v2 SET topic_id = 'd8d11d43-e7cd-4aaf-88b4-e3d5567f78d7'::uuid WHERE id = 342;
UPDATE curriculum_content_v2 SET topic_id = '1ed74f87-d517-43d7-bfd2-9f4099be1274'::uuid WHERE id = 343;
UPDATE curriculum_content_v2 SET topic_id = '31644214-18c6-40d3-a3b3-63e9b5f366a9'::uuid WHERE id = 344;
UPDATE curriculum_content_v2 SET topic_id = 'bf4e3d65-0a78-4616-8b9b-7077effd9315'::uuid WHERE id = 345;
UPDATE curriculum_content_v2 SET topic_id = '4600bf0a-f1ef-4eb0-917a-24ae811dbc69'::uuid WHERE id = 346;
UPDATE curriculum_content_v2 SET topic_id = '990d21d8-4e8d-4df4-b112-203e8d21f882'::uuid WHERE id = 347;
UPDATE curriculum_content_v2 SET topic_id = 'ba67462b-9aa0-4148-8598-a6ef76b2b487'::uuid WHERE id = 348;
UPDATE curriculum_content_v2 SET topic_id = '25ae5dd9-6c11-4b61-941a-f64667d8edb7'::uuid WHERE id = 349;
UPDATE curriculum_content_v2 SET topic_id = '9836e560-46f9-4189-bb04-e3abe34c4719'::uuid WHERE id = 350;
UPDATE curriculum_content_v2 SET topic_id = '3a7201f6-0eb8-42e8-bb89-fd3d24844397'::uuid WHERE id = 351;
UPDATE curriculum_content_v2 SET topic_id = '93af51fc-9d8f-4f86-84b9-f92649aa35f3'::uuid WHERE id = 352;
UPDATE curriculum_content_v2 SET topic_id = 'ae6d94ee-ee3a-43b2-bce6-f9a962b44c9b'::uuid WHERE id = 353;
UPDATE curriculum_content_v2 SET topic_id = 'f0180ffe-aa17-4e92-b5d9-b30d0c8b586a'::uuid WHERE id = 354;
UPDATE curriculum_content_v2 SET topic_id = '9c4fcb77-aaad-4fdd-b38f-0c9da9cb4331'::uuid WHERE id = 355;
UPDATE curriculum_content_v2 SET topic_id = 'fa50460c-093f-4d84-b635-8ab279e8418d'::uuid WHERE id = 356;
UPDATE curriculum_content_v2 SET topic_id = '1832ff3c-3cd3-4311-93e1-6b3d33d11aef'::uuid WHERE id = 357;
UPDATE curriculum_content_v2 SET topic_id = '749443c2-61ef-43a2-81bf-3e206928bc4a'::uuid WHERE id = 358;
UPDATE curriculum_content_v2 SET topic_id = '61dc2bf0-799c-4536-8fb8-859e28e10e05'::uuid WHERE id = 359;
UPDATE curriculum_content_v2 SET topic_id = '65dbd041-df4b-4d82-8734-38c0b92abbad'::uuid WHERE id = 360;
UPDATE curriculum_content_v2 SET topic_id = '7bd52750-9824-4cc5-b744-b4eb61f6083b'::uuid WHERE id = 361;
UPDATE curriculum_content_v2 SET topic_id = '9f9cdc86-e834-4f88-8267-1aa18b1599d4'::uuid WHERE id = 362;
UPDATE curriculum_content_v2 SET topic_id = '1b719290-3431-4bf3-af44-4b6d30af2c04'::uuid WHERE id = 363;
UPDATE curriculum_content_v2 SET topic_id = '49208d9e-e559-4d2d-bbf4-975158422f02'::uuid WHERE id = 364;
UPDATE curriculum_content_v2 SET topic_id = 'a6ba5096-eefe-43b0-8938-9c2190d8c054'::uuid WHERE id = 365;
UPDATE curriculum_content_v2 SET topic_id = 'f0b74096-5fa6-4d43-bf2d-e97f34f76634'::uuid WHERE id = 366;
UPDATE curriculum_content_v2 SET topic_id = 'dc9ff72c-cb53-45ae-8842-4b3b03f9e2c8'::uuid WHERE id = 367;
