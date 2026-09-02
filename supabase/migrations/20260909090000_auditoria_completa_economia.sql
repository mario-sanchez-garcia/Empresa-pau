-- Auditoría completa de Economía de la Empresa / "Empresa y Diseño de Modelos
-- de Negocio" PAU Madrid (25 de 49 topics corregidos). Correcciones legales/
-- fiscales (capital mínimo S.L. 1€ con régimen especial de reserva legal y
-- responsabilidad hasta 3.000€ mientras capital+reserva<3.000€, protección
-- de vivienda habitual del ERL, umbrales UE de PYME por Recomendación
-- 2003/361/CE, Impuesto de Sociedades con tipos reducidos según entidad en
-- vez de "25% sin matiz"), errores conceptuales prioritarios (balance:
-- pasivo ordenado de MENOR a MAYOR exigibilidad, no al revés; ROE>ROA no
-- implica por sí solo apalancamiento financiero positivo sin conocer el
-- coste de la deuda), Maslow/Herzberg presentadas como teorías no como
-- hechos, ratios financieros marcados explícitamente como orientativos,
-- amortización como retención de recursos (no generación de efectivo),
-- eliminación de consejo fiscal simplista autónomo-vs-sociedad, y relleno
-- de tres huecos curriculares ampliando fichas ya existentes (integración
-- vertical/horizontal dentro de crecimiento externo, productividad global
-- y tasa de variación dentro de productividad, valoración FIFO/PMP dentro
-- de gestión de existencias) sin crear topics nuevos. El resto de topics
-- (24) se revisaron y se mantienen sin cambios. Se detectó un hueco
-- curricular adicional (Periodo Medio de Maduración) que requeriría crear
-- un topic nuevo — no se crea en esta migración, queda documentado en el
-- informe de auditoría para decisión humana. Ya aplicado en directo contra
-- Supabase con SUPABASE_SERVICE_ROLE_KEY antes de este commit; esta
-- migración deja constancia reproducible del cambio.

UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Una **empresa** es una unidad económico-social, formada por elementos humanos, materiales, inmateriales y financieros, organizada y dirigida por el empresario para producir bienes y/o prestar servicios, con el objetivo de alcanzar fines económicos (obtener beneficio) y/o sociales, según su naturaleza y forma jurídica (por ejemplo, una cooperativa o una empresa pública no persiguen necesariamente el lucro como fin último, aunque también deben ser viables económicamente).

**Elementos de la empresa:**
- **Elemento humano:** propietarios, directivos y trabajadores.
- **Elemento material:** instalaciones, maquinaria, materias primas y demás bienes tangibles.
- **Elemento inmaterial (organización):** relaciones entre los elementos, cultura empresarial, marca, know-how.
- **Elemento financiero:** capital y recursos financieros necesarios para adquirir el resto de elementos.
- **Entorno:** conjunto de factores externos que influyen sobre la empresa.

**Funciones básicas:** coordinar los factores de producción, crear o aumentar la utilidad de los bienes, asumir riesgos y generar valor añadido.$mkd$, worked_example_markdown = $mkd$**Pregunta tipo PAU:** *Explica los elementos que integran la empresa y relaciónalos con un ejemplo real (por ejemplo, una panadería).*

**Clave de respuesta:**
1. Elemento humano → panadero, dependientas, propietario.
2. Elemento material → horno, local, harina, furgoneta de reparto.
3. Elemento inmaterial → la forma en que se organiza el trabajo, la marca, la reputación.
4. Elemento financiero → el capital inicial aportado para abrir el negocio, un préstamo bancario para comprar el horno.
5. Entorno → proveedores de harina, competencia, clientes del barrio, normativa sanitaria.$mkd$ WHERE subject = 'economia' AND sort_order = 1;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Las empresas se pueden clasificar según varios criterios:

| Criterio | Tipos |
|---|---|
| **Sector de actividad** | Primario (extracción), secundario (industria) y terciario (servicios) |
| **Tamaño** | Microempresa, pequeña, mediana y gran empresa (según nº de trabajadores, facturación y activo) |
| **Titularidad del capital** | Privada, pública o mixta |
| **Ámbito geográfico** | Local, regional, nacional o multinacional |
| **Forma jurídica** | Individual (autónomo) o societaria (S.L., S.A., cooperativa...) |

El criterio de **tamaño** en la Unión Europea combina el número de trabajadores con la cifra de negocio o el balance anual (Recomendación 2003/361/CE de la Comisión Europea, vigente en 2026 sin cambios sustanciales):

| Categoría | Trabajadores | y además Facturación anual | o Balance anual |
|---|---|---|---|
| Microempresa | < 10 | ≤ 2 M€ | ≤ 2 M€ |
| Pequeña empresa | < 50 | ≤ 10 M€ | ≤ 10 M€ |
| Mediana empresa | < 250 | ≤ 50 M€ | ≤ 43 M€ |

El criterio de trabajadores es siempre obligatorio; basta con cumplir UNO de los dos criterios financieros (facturación o balance), no ambos. Una empresa con 200 trabajadores pero una facturación muy elevada podría no ser PYME si supera también el umbral de balance — nunca se clasifica el tamaño solo por el número de trabajadores.$mkd$ WHERE subject = 'economia' AND sort_order = 2;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$El **empresario individual o autónomo** es una persona física que realiza en nombre propio una actividad económica, asumiendo todo el riesgo.

**Ventajas:** trámites de constitución sencillos y baratos, control total del negocio, no requiere capital mínimo.

**Inconvenientes:** **responsabilidad ilimitada** (responde con su patrimonio personal presente y futuro de las deudas del negocio, con matices legales — ver ejemplo guiado), difícil acceso a grandes financiaciones, la empresa desaparece si desaparece el titular.

Es una de las formas jurídicas más habituales en España, especialmente en negocios de pequeño tamaño (comercio, hostelería, profesionales liberales), junto con la Sociedad Limitada.$mkd$, worked_example_markdown = $mkd$**Pregunta tipo PAU:** *¿Qué significa que el empresario individual tiene responsabilidad ilimitada? Pon un ejemplo.*

**Clave de respuesta:**
Significa que, con carácter general, no existe separación entre el patrimonio de la empresa y el patrimonio personal del empresario. Si el negocio genera deudas que no puede pagar con los activos de la empresa, los acreedores pueden reclamar también sus bienes personales (ahorros, coche, otros inmuebles...).

Existen, no obstante, protecciones legales parciales: acogiéndose a la figura del **Emprendedor de Responsabilidad Limitada (ERL)** (Ley 14/2013), el autónomo puede excluir de embargo su vivienda habitual hasta un determinado valor (300.000 €, o 450.000 € en poblaciones de más de un millón de habitantes), siempre que la inscriba en el Registro Mercantil y no la haya vinculado a la actividad empresarial en sus cuentas. Esta protección no aplica a deudas anteriores a la inscripción ni a deudas con Hacienda o la Seguridad Social.

Ejemplo: un fontanero autónomo que quiebra debiendo 20.000 € deberá responder con sus bienes personales si los activos del negocio no cubren la deuda, salvo que se hubiera acogido previamente a la protección de la vivienda habitual como ERL.$mkd$ WHERE subject = 'economia' AND sort_order = 3;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Cuando varias personas se asocian para crear una empresa, o se busca **responsabilidad limitada**, se constituye una sociedad.

**Sociedad de Responsabilidad Limitada (S.L.):**
- Capital mínimo legal: 1 € (desde la reforma de la Ley 18/2022 «Crea y Crece», antes 3.000 €). Mientras el capital social más la reserva legal sean inferiores a 3.000 €, la ley exige destinar al menos el **20 % del beneficio** a reserva legal cada año, y establece un **régimen especial de responsabilidad**: en caso de liquidación, si el patrimonio social es insuficiente para pagar las obligaciones, los socios y administradores responden **solidariamente** de la diferencia entre 3.000 € y la cifra de capital suscrito (art. 4 LSC; el antiguo art. 4 bis, que regulaba la "formación sucesiva", quedó derogado por la misma reforma al perder sentido con el capital de 1 €). Es decir, el capital de 1 € no equivale a una responsabilidad limitada sin matices mientras no se alcance ese umbral de 3.000 €.
- Capital dividido en **participaciones sociales**; su transmisión suele estar sujeta a restricciones legales (derecho de adquisición preferente de los demás socios) salvo que los estatutos dispongan otra cosa.
- Responsabilidad de los socios limitada al capital aportado (con la salvedad anterior mientras capital + reserva legal sean inferiores a 3.000 €).
- Adecuada para PYMES.

**Sociedad Anónima (S.A.):**
- Capital mínimo: 60.000 € (desembolsado al menos el 25 % en la constitución).
- Capital dividido en **acciones**; su transmisión es, por regla general, libre, aunque los estatutos pueden establecer restricciones limitadas (no puede eliminarse por completo la transmisibilidad).
- Responsabilidad limitada al capital aportado.
- Adecuada para grandes empresas que necesitan captar mucho capital (puede cotizar en bolsa).$mkd$, worked_example_markdown = $mkd$**Pregunta tipo PAU:** *Compara la S.L. y la S.A. en cuanto a capital mínimo, división del capital y responsabilidad de los socios.*

| | S.L. | S.A. |
|---|---|---|
| Capital mínimo | 1 € (régimen especial de reserva legal y responsabilidad mientras capital + reserva legal < 3.000 €) | 60.000 € |
| División del capital | Participaciones | Acciones |
| Transmisión | Restringida por defecto (derecho de adquisición preferente), salvo pacto estatutario en contrario | Libre por regla general, salvo restricciones estatutarias limitadas |
| Responsabilidad | Limitada al capital aportado (con matices si capital + reserva legal < 3.000 €) | Limitada al capital aportado |

Ambas comparten la responsabilidad limitada, que es la principal diferencia frente al empresario individual.$mkd$ WHERE subject = 'economia' AND sort_order = 4;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Una **cooperativa** es una sociedad constituida por personas que se asocian, en régimen de libre adhesión, para realizar una actividad empresarial dirigida a satisfacer sus necesidades comunes, con estructura y funcionamiento democrático.

**Características clave:**
- Principio de **"una persona, un voto"** como regla general (no depende del capital aportado, a diferencia de la S.A.), aunque la normativa de cooperativas admite matices en supuestos concretos (por ejemplo, ponderaciones limitadas del voto en función de la actividad cooperativizada, o reglas específicas en cooperativas de segundo grado).
- Los socios son a la vez propietarios y, normalmente, trabajadores o usuarios.
- Los beneficios (retornos cooperativos) se reparten en función de la actividad realizada por cada socio, no del capital.
- Forma parte de la **economía social**, junto con mutualidades y sociedades laborales.

Ejemplos conocidos: Mondragón Corporación, cooperativas agrarias.$mkd$ WHERE subject = 'economia' AND sort_order = 5;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$La **Responsabilidad Social Corporativa (RSC)** es el compromiso voluntario de las empresas con el desarrollo social, económico y ambiental, más allá de las exigencias legales mínimas, que integra el impacto de su actividad sobre los distintos **grupos de interés (stakeholders)**: trabajadores, clientes, proveedores, accionistas, comunidad local y medioambiente.

**Ámbitos de la RSC:**
- **Económico:** transparencia, pago justo a proveedores, creación sostenible de valor.
- **Social:** condiciones laborales dignas, igualdad, conciliación, acción social.
- **Ambiental:** reducción de emisiones, reciclaje, uso de energías renovables.
- **Gobierno corporativo:** buenas prácticas de gestión, transparencia ante los accionistas, códigos éticos, prevención de la corrupción.

**Instrumentos:** código ético, memoria de sostenibilidad (informes ESG), certificaciones (ISO 14001, comercio justo).

La RSC no es filantropía puntual, sino una forma de gestionar la empresa integrando estos criterios en la estrategia y en el día a día, teniendo en cuenta a todos los grupos de interés y no solo a los accionistas.$mkd$ WHERE subject = 'economia' AND sort_order = 7;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$El **análisis DAFO** (Debilidades, Amenazas, Fortalezas, Oportunidades) es una herramienta que resume la situación estratégica de la empresa cruzando el análisis interno con el externo:

| | Interno | Externo |
|---|---|---|
| **Positivo** | **F**ortalezas | **O**portunidades |
| **Negativo** | **D**ebilidades | **A**menazas |

- **Fortalezas/Debilidades:** dependen de la propia empresa (recursos, capacidades); son factores **internos** sobre los que la empresa tiene mayor capacidad de actuación directa (no siempre son totalmente controlables a corto plazo, pero pueden modificarse con decisiones internas).
- **Oportunidades/Amenazas:** provienen del entorno (general y específico); son factores **externos** sobre los que la empresa tiene poca o ninguna capacidad de actuación directa.

El objetivo del DAFO es diseñar una estrategia que aproveche fortalezas y oportunidades, y corrija debilidades y se proteja de las amenazas.$mkd$ WHERE subject = 'economia' AND sort_order = 10;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$La **dimensión** es la capacidad productiva de la empresa. Determinarla correctamente es clave: una dimensión excesiva genera costes fijos innecesarios (capacidad ociosa); una dimensión insuficiente impide aprovechar oportunidades de mercado.

**Economías de escala:** al aumentar la dimensión, el **coste fijo medio** por unidad producida disminuye, porque los mismos costes fijos se reparten entre más unidades; además, el coste variable medio también puede reducirse por compras al por mayor o mayor especialización, aunque esto último no es automático. Solo cuando ambos efectos se dan conjuntamente baja también el coste TOTAL medio.

**Deseconomías de escala:** a partir de cierto tamaño, un crecimiento excesivo puede generar problemas de coordinación, burocracia y pérdida de eficiencia, aumentando el coste medio.$mkd$, worked_example_markdown = $mkd$**Pregunta tipo PAU:** *Explica el concepto de economías de escala con un ejemplo numérico sencillo.*

**Clave de respuesta:**
Si una fábrica tiene 100.000 € de costes fijos y produce 10.000 unidades, el coste fijo medio es 10 €/unidad. Si duplica su producción a 20.000 unidades sin aumentar los costes fijos, el coste fijo medio baja a 5 €/unidad. Esa reducción del coste medio al crecer es una economía de escala.

Nótese que este ejemplo demuestra concretamente la bajada del **coste fijo medio**. Para que el coste TOTAL medio también baje, además el coste variable unitario no debe aumentar al crecer la producción (lo habitual si se mantienen las condiciones de compra y producción, pero no ocurre siempre: por ejemplo, si para producir mucho más hay que pagar horas extra o materias primas más caras por escasez, el coste variable medio podría subir y compensar parte del ahorro en costes fijos).$mkd$ WHERE subject = 'economia' AND sort_order = 12;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$La empresa puede crecer de dos formas:

- **Crecimiento interno (orgánico):** la empresa invierte en sus propios recursos (nuevas plantas, más personal, más maquinaria) para aumentar su capacidad productiva. Es más lento pero más controlable y no depende de otras empresas.
- **Crecimiento externo:** la empresa crece adquiriendo o uniéndose a otras empresas ya existentes. Es más rápido y permite acceder a mercados o tecnologías nuevas de inmediato.

El crecimiento externo, además de clasificarse según el procedimiento jurídico empleado, también se clasifica según la relación entre la actividad de la empresa adquirida y la propia:

- **Integración horizontal:** la empresa se une o adquiere otras empresas que realizan la MISMA actividad o fase del proceso productivo (normalmente competidoras), con el objetivo de aumentar su cuota de mercado y tamaño en el mismo eslabón de la cadena de valor.
- **Integración vertical:** la empresa incorpora fases del proceso productivo distintas a la suya, que antes realizaban otras empresas (proveedores o clientes), dentro de su propia cadena de valor.
  - **Hacia atrás (aguas arriba):** la empresa asume fases previas, como las de sus proveedores (ej. un fabricante de coches que compra una fábrica de componentes).
  - **Hacia adelante (aguas abajo):** la empresa asume fases posteriores, más cercanas al cliente final (ej. un fabricante que abre sus propias tiendas de venta al público).

Tanto la integración horizontal como la vertical pueden llevarse a cabo mediante cualquiera de estas **formas jurídicas de crecimiento externo**:
- **Fusión:** dos o más empresas desaparecen para crear una nueva.
- **Absorción:** una empresa (absorbente) incorpora a otra (absorbida), que desaparece.
- **Participación/toma de control:** una empresa compra acciones o participaciones de otra sin que ninguna desaparezca.$mkd$, worked_example_markdown = $mkd$**Pregunta tipo PAU:** *Diferencia fusión de absorción, y clasifica como integración vertical u horizontal: (a) una cadena de supermercados compra a otra cadena de supermercados competidora; (b) un fabricante de zumos compra una finca de naranjos para asegurarse el suministro de fruta.*

**Clave de respuesta:**
En la **fusión**, las empresas originales desaparecen y nace una empresa completamente nueva. En la **absorción**, una empresa mantiene su personalidad jurídica y la otra desaparece integrada en ella.

(a) **Integración horizontal**: ambas cadenas realizan la misma actividad (venta minorista), y la operación busca aumentar cuota de mercado en el mismo eslabón.
(b) **Integración vertical hacia atrás**: el fabricante de zumos asume una fase previa de su cadena de valor (el cultivo de la materia prima), antes realizada por un proveedor externo.$mkd$ WHERE subject = 'economia' AND sort_order = 14;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Además de crecer en solitario, las empresas pueden **cooperar** con otras manteniendo su independencia jurídica, para compartir riesgos, costes o conocimiento:

- **Joint venture:** dos o más empresas crean una nueva sociedad conjunta para un proyecto específico.
- **Cártel:** acuerdo entre empresas del mismo sector para fijar precios, limitar la producción o repartirse el mercado. Constituye una práctica restrictiva de la competencia generalmente **prohibida** por la legislación de defensa de la competencia (en España puede ser sancionada por la CNMC); por tanto, a diferencia de la joint venture, la franquicia o el clúster, el cártel NO es una forma legítima de cooperación empresarial.
- **Franquicia:** el franquiciador cede al franquiciado el derecho a usar su marca y modelo de negocio a cambio de un canon.
- **Clúster:** concentración geográfica de empresas de un mismo sector que cooperan y compiten a la vez, compartiendo proveedores y conocimiento.$mkd$ WHERE subject = 'economia' AND sort_order = 15;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Las **PYMES** (pequeñas y medianas empresas) representan la inmensa mayoría del tejido empresarial español —la práctica totalidad de las empresas activas— y son las principales generadoras de empleo del país. El peso exacto en número de empresas y en empleo varía ligeramente cada año según los datos oficiales (INE, DIRCE), pero la proporción se mantiene estructuralmente muy elevada.

**Ventajas de las PYMES:**
- Mayor flexibilidad y capacidad de adaptación a cambios del mercado.
- Trato más cercano y personalizado con el cliente.
- Estructura organizativa más sencilla, decisiones más rápidas.

**Inconvenientes de las PYMES:**
- Menor capacidad de negociación con proveedores y bancos.
- Dificultad para acceder a economías de escala.
- Menores recursos para I+D+i e internacionalización.$mkd$ WHERE subject = 'economia' AND sort_order = 16;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$La planificación se estructura en distintos niveles y horizontes temporales:

- **Planes estratégicos:** largo plazo (orientativamente, más de 3-5 años, aunque el horizonte concreto depende del sector y de cada empresa), afectan a toda la empresa, los fija la alta dirección (ej. entrar en un nuevo país).
- **Planes tácticos:** medio plazo, afectan a un departamento (ej. plan de marketing anual).
- **Planes operativos:** corto plazo, muy concretos (ej. turnos de trabajo de la semana).

**Etapas del proceso de planificación:** análisis de la situación (interno y externo, DAFO) → fijación de objetivos → generación y evaluación de alternativas → elección del plan → control de su ejecución.$mkd$ WHERE subject = 'economia' AND sort_order = 19;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$**Teoría de la pirámide de necesidades de Maslow:** según este modelo motivacional, las personas se motivan satisfaciendo necesidades en orden jerárquico: 1) fisiológicas, 2) seguridad, 3) sociales/afiliación, 4) estima/reconocimiento, 5) autorrealización. Según esta teoría, una necesidad ya satisfecha deja de motivar y pasa a motivar la siguiente escala pendiente. Es un modelo influyente y muy usado en gestión de RRHH, pero no una ley empírica universal del comportamiento: no todos los estudios posteriores confirman que las necesidades se satisfagan siempre en ese orden estricto.

**Teoría de los dos factores de Herzberg:** según este modelo:
- **Factores higiénicos** (salario, condiciones de trabajo, seguridad): su ausencia genera insatisfacción, pero su presencia no motiva por sí sola, solo evita el descontento.
- **Factores motivadores** (reconocimiento, logro, responsabilidad, desarrollo profesional): su presencia sí genera motivación real y satisfacción en el trabajo, según esta teoría.$mkd$ WHERE subject = 'economia' AND sort_order = 23;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$La **productividad** mide la relación entre la producción obtenida y los factores empleados para obtenerla.

**Productividad de un factor** (por ejemplo, del trabajo):

$$\text{Productividad}_{trabajo} = \dfrac{\text{Unidades producidas}}{\text{Nº de trabajadores (u horas trabajadas)}}$$

**Productividad global:** relaciona el **valor** total de la producción con el **valor** de TODOS los factores empleados (trabajo, materias primas, capital, energía...), usando precios constantes para poder comparar periodos distintos:

$$\text{Productividad global} = \dfrac{\text{Valor de la producción total}}{\text{Valor de todos los factores empleados}}$$

**Tasa de variación de la productividad:** mide el cambio porcentual de la productividad (del trabajo, o global) entre dos periodos:

$$\Delta\%\ \text{Productividad} = \dfrac{Productividad_{2} - Productividad_{1}}{Productividad_{1}}\times100$$

Es importante no confundir la **productividad del trabajo** (relaciona la producción con un único factor) con la **productividad global** (relaciona el valor de toda la producción con el valor de TODOS los factores). Ambas pueden evolucionar de forma distinta: por ejemplo, la productividad del trabajo puede aumentar por automatización mientras la productividad global baja si el coste de la nueva maquinaria supera el ahorro en mano de obra.

Aumentar la productividad (mejor tecnología, formación, organización) es clave para la **competitividad** de la empresa, porque permite producir más al mismo coste o el mismo output a menor coste.$mkd$, worked_example_markdown = $mkd$**Ejercicio numérico (productividad del trabajo):** Una fábrica produce 4.800 unidades al mes con 20 trabajadores. El mes siguiente, tras automatizar una línea, produce 5.400 unidades con 18 trabajadores. Calcula la productividad del trabajo en ambos meses y su variación.

1. Productividad mes 1: $\dfrac{4.800}{20} = 240$ unidades/trabajador
2. Productividad mes 2: $\dfrac{5.400}{18} = 300$ unidades/trabajador
3. Variación: $\dfrac{300-240}{240}\times100$
4. Resultado: la productividad del trabajo **aumenta un 25 %**

**Productividad global (ejemplo adicional, misma fábrica):** en el mes 1, el valor de toda la producción fue de 240.000 € empleando factores (mano de obra, materias primas, energía, capital) por valor de 200.000 €. En el mes 2, el valor de la producción ascendió a 270.000 € con factores empleados por valor de 216.000 € (a precios constantes, para que la comparación sea válida).

1. Productividad global mes 1: $\dfrac{240.000}{200.000} = 1{,}2$
2. Productividad global mes 2: $\dfrac{270.000}{216.000} = 1{,}25$
3. Variación: $\dfrac{1{,}25-1{,}2}{1{,}2}\times100 \approx \mathbf{4{,}17\%}$

Nótese que la productividad del trabajo subió un 25 % mientras que la productividad global solo mejoró un 4,17 %: el mayor coste de los factores materiales y de capital compensó buena parte de la ganancia de eficiencia en mano de obra. Esto ilustra por qué no deben confundirse ambos indicadores.$mkd$ WHERE subject = 'economia' AND sort_order = 26;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$El **stock o existencias** son los materiales y productos almacenados por la empresa: materias primas, productos en curso y productos terminados.

**¿Por qué mantener stock?**
- Evitar rupturas de suministro y desabastecimiento a los clientes.
- Aprovechar compras a gran escala (descuentos por volumen).
- Anticiparse a subidas de precio o a fluctuaciones estacionales de la demanda.

**Costes asociados al stock:**
- **Coste de almacenamiento:** alquiler del almacén, seguros, deterioro, obsolescencia.
- **Coste de pedido:** gestión administrativa de cada pedido realizado.
- **Coste de ruptura:** pérdida de ventas o clientes por no tener stock disponible.

El **modelo de Wilson** calcula el tamaño óptimo de pedido que minimiza la suma de estos costes.

**Valoración de las existencias cuando no todas las unidades se compraron al mismo precio:**
- **FIFO (First In, First Out — "primera entrada, primera salida"):** se supone que las primeras unidades que entraron en el almacén son las primeras en salir; el valor de las existencias que quedan al final coincide con el precio de las compras más recientes.
- **Precio Medio Ponderado (PMP):** se recalcula un precio medio cada vez que entra mercancía nueva, ponderando por las unidades de cada lote; tanto las salidas como las existencias finales se valoran a ese precio medio.$mkd$, worked_example_markdown = $mkd$**Pregunta tipo PAU:** *¿Por qué mantener un exceso de stock puede ser tan perjudicial para la empresa como tener demasiado poco?*

**Clave de respuesta:**
Un exceso de stock **inmoviliza capital** que podría usarse en otra inversión, y genera costes de almacenamiento, seguros y riesgo de obsolescencia o deterioro. Un stock insuficiente, en cambio, provoca **roturas de stock**: pérdida de ventas y clientes insatisfechos. La gestión de existencias busca el equilibrio óptimo entre ambos extremos.

**Ejercicio numérico (FIFO vs. PMP):** una empresa parte de 100 unidades en almacén a 10 €/unidad. El día 10 compra 200 unidades a 12 €/unidad. El día 20 vende 150 unidades. Calcula el valor de las 150 unidades que quedan en almacén (100+200-150=150) según FIFO y según PMP.

- **FIFO:** se considera que las 150 unidades vendidas son las más antiguas (las 100 iniciales + 50 de la compra); quedan en almacén 150 unidades de la compra más reciente, a 12 €/unidad → valor existencias finales $= 150\times12 = \mathbf{1.800\ €}$.
- **PMP:** precio medio ponderado $= \dfrac{100\times10 + 200\times12}{100+200} = \dfrac{3.400}{300} \approx 11{,}33$ €/unidad → valor existencias finales $= 150\times11{,}33 \approx \mathbf{1.700\ €}$.

Con FIFO, al valorar las existencias finales al precio de la compra más reciente (más alta en este caso, por tratarse de una compra a precio creciente), el valor resulta mayor que con el PMP.$mkd$ WHERE subject = 'economia' AND sort_order = 30;
UPDATE curriculum_content_v2 SET worked_example_markdown = $mkd$**Pregunta tipo PAU:** *Clasifica según el número de competidores: (a) suministro eléctrico en una zona sin competencia, (b) mercado de zapatillas deportivas de marca, (c) mercado de trigo.*

**Clave de respuesta:**
(a) Monopolio · (b) Competencia monopolística (muchas marcas, productos diferenciados por diseño/imagen) · (c) Competencia perfecta, en un sentido aproximado: el mercado de trigo se usa como ejemplo clásico cercano al modelo teórico (muchos productores, producto relativamente homogéneo), aunque en la práctica factores como las políticas agrarias (por ejemplo la PAC europea), los aranceles o las diferencias de calidad hacen que ningún mercado real cumpla de forma perfecta las condiciones teóricas de la competencia perfecta.$mkd$ WHERE subject = 'economia' AND sort_order = 31;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$El **balance de situación** es el documento contable que refleja el patrimonio de la empresa en un momento concreto (una "foto fija"), estructurado en dos columnas que siempre deben coincidir en su total:

| **ACTIVO** | **PASIVO + PATRIMONIO NETO** |
|---|---|
| Activo no corriente | Patrimonio neto |
| Activo corriente | Pasivo no corriente |
| | Pasivo corriente |
| **TOTAL ACTIVO** | **TOTAL PN + PASIVO** |

Dentro del activo, las partidas se ordenan de menor a mayor liquidez (de arriba abajo): primero el activo no corriente (menos líquido) y después el activo corriente (más líquido).

Dentro del pasivo (incluyendo el patrimonio neto), el orden habitual de arriba abajo es de **MENOR a MAYOR exigibilidad**: primero el patrimonio neto (no exigible, son recursos propios que no hay que devolver), después el pasivo no corriente (exigible a largo plazo) y por último el pasivo corriente (exigible a corto plazo, el más próximo a vencer). El balance permite analizar la situación financiera de la empresa en un instante concreto.$mkd$ WHERE subject = 'economia' AND sort_order = 38;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$La **cuenta de Pérdidas y Ganancias (PyG)** o **cuenta de resultados** recoge los ingresos y gastos de un periodo (normalmente un año), a diferencia del balance, que es una foto fija. Su resultado final es el **beneficio o pérdida** del ejercicio.

**Estructura simplificada (habitual en ejercicios PAU):**

$$\text{Ingresos de explotación (ventas y otros)} - \text{Gastos de explotación} = \text{Resultado de explotación (BAII)}$$
$$\text{BAII} + \text{Ingresos financieros} - \text{Gastos financieros} = \text{Resultado antes de impuestos (BAI)}$$
$$\text{BAI} - \text{Impuesto de sociedades} = \text{Resultado del ejercicio (beneficio neto)}$$

En un enunciado real, los "gastos de explotación" suelen venir desglosados en varias partidas (coste de las materias primas o mercaderías consumidas, gastos de personal, amortizaciones, otros gastos de explotación), que hay que sumar antes de restarlas de los ingresos de explotación; y el resultado financiero puede incluir tanto ingresos financieros como gastos financieros, no solo estos últimos.$mkd$ WHERE subject = 'economia' AND sort_order = 39;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$El **fondo de maniobra (FM)**, también llamado capital circulante, es la parte del activo corriente financiada con recursos a largo plazo (pasivo no corriente + patrimonio neto), y actúa como "colchón de seguridad" financiero.

$$FM = Activo\ Corriente - Pasivo\ Corriente$$

- **FM positivo:** el activo corriente cubre de sobra el pasivo corriente; en principio indica una situación de equilibrio financiero saludable a corto plazo, aunque no lo garantiza por sí solo: conviene comprobar la composición real del activo corriente (existencias obsoletas o de difícil venta, clientes con riesgo de impago) y compararlo con lo habitual en el sector.
- **FM negativo:** el activo corriente no cubre el pasivo corriente; riesgo de **suspensión de pagos** si no se toman medidas (salvo casos particulares como grandes supermercados, con cobro muy rápido y pago aplazado a proveedores).
- **FM = 0:** situación de equilibrio muy ajustado, cualquier retraso en un cobro puede generar problemas de liquidez.$mkd$ WHERE subject = 'economia' AND sort_order = 40;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Los **ratios financieros** son cocientes entre partidas del balance que permiten analizar la salud económico-financiera de la empresa.

**Ratio de liquidez (o de solvencia a corto plazo):**
$$Liquidez = \dfrac{Activo\ Corriente}{Pasivo\ Corriente}$$
Valor orientativo en torno a 1,5-2 (no es una norma fija: depende del sector y del ciclo de caja de la empresa). Si es muy inferior a 1, riesgo de impago a corto plazo; si es muy superior, puede indicar exceso de activos ociosos (mal aprovechados).

**Ratio de tesorería (acid test):**
$$Tesorer\text{í}a = \dfrac{Activo\ Corriente - Existencias}{Pasivo\ Corriente}$$
Excluye las existencias (menos líquidas). Valor orientativo en torno a 1 (tampoco es una norma fija).

**Ratio de garantía (o de distancia a la quiebra):**
$$Garant\text{í}a = \dfrac{Activo\ Total}{Pasivo\ Exigible\ Total}$$
Debe ser claramente mayor que 1: cuanto más alto, mayor garantía frente a los acreedores.$mkd$ WHERE subject = 'economia' AND sort_order = 41;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$**Ratio de endeudamiento:**
$$Endeudamiento = \dfrac{Pasivo\ Exigible\ Total}{Patrimonio\ Neto + Pasivo}$$
Valor orientativo en torno a 0,4-0,6 (no es una norma fija). Muy alto implica dependencia excesiva de la financiación ajena (riesgo); muy bajo puede indicar que no se aprovecha el "efecto apalancamiento" de la deuda.

**Rentabilidad económica (ROA):** mide el rendimiento generado por el activo, con independencia de cómo se financia.
$$ROA = \dfrac{BAII}{Activo\ Total}\times100$$

**Rentabilidad financiera (ROE):** mide el rendimiento que obtienen los propietarios sobre los recursos que han aportado.
$$ROE = \dfrac{Beneficio\ Neto}{Patrimonio\ Neto}\times100$$

**Efecto apalancamiento financiero:** se dice que el apalancamiento es positivo cuando el coste medio de la deuda (tipo de interés, $i$) es inferior a la rentabilidad económica (ROA), de modo que endeudarse eleva la rentabilidad financiera (ROE) por encima del ROA. Comparar solo el ROA y el ROE, sin conocer el coste de la deuda ni el nivel de endeudamiento, no permite concluir con seguridad el signo del apalancamiento: que ROE sea mayor que ROA es **compatible** con un apalancamiento positivo, pero no lo demuestra por sí solo.$mkd$, worked_example_markdown = $mkd$**Ejercicio numérico:** Una empresa tiene un activo total de 200.000 €, un BAII de 30.000 €, un patrimonio neto de 100.000 € y un beneficio neto de 18.000 €. Calcula el ROA y el ROE.

1. ROA: $\dfrac{30.000}{200.000}\times100$ → Resultado: $ROA = \mathbf{15\%}$
2. ROE: $\dfrac{18.000}{100.000}\times100$ → Resultado: $ROE = \mathbf{18\%}$
3. Interpretación: la rentabilidad para el accionista (ROE, 18 %) es superior a la rentabilidad del activo (ROA, 15 %). Este dato es **compatible** con un efecto de apalancamiento financiero positivo, pero para afirmarlo con seguridad haría falta conocer también el coste medio de la deuda (tipo de interés $i$) y el nivel de endeudamiento: el apalancamiento es positivo cuando $ROA > i$. Con solo el ROA y el ROE no se puede concluir el signo del apalancamiento sin más datos.$mkd$ WHERE subject = 'economia' AND sort_order = 42;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Las empresas están sujetas a distintos impuestos según su actividad y forma jurídica:

- **Impuesto sobre Sociedades (IS):** grava el beneficio de las personas jurídicas (sociedades). Tipo general del 25 % (vigente en 2026), pero con **tipos reducidos y regímenes especiales** según el tipo de entidad: empresas de nueva creación (15 % durante los dos primeros ejercicios con base imponible positiva), microempresas y entidades de reducida dimensión (tipos reducidos, en transición progresiva según la normativa vigente cada año), cooperativas fiscalmente protegidas, etc. Estos porcentajes concretos pueden cambiar con las leyes de presupuestos o reformas fiscales; en los ejercicios de PAU se aplica siempre el tipo indicado explícitamente en el enunciado.
- **IRPF:** el empresario individual (autónomo) no paga Impuesto de Sociedades; tributa por su beneficio empresarial dentro del IRPF, con tipos progresivos según su renta total.
- **IVA (Impuesto sobre el Valor Añadido):** impuesto indirecto que recae sobre el consumo; la empresa lo repercute al cliente y lo liquida periódicamente con Hacienda (diferencia entre IVA repercutido en ventas e IVA soportado en compras).
- Además, las empresas cotizan a la Seguridad Social por sus trabajadores y por el propio empresario si es autónomo.$mkd$, worked_example_markdown = $mkd$**Pregunta tipo PAU:** *Explica por qué un mismo nivel de beneficio puede tributar de forma distinta si la actividad se ejerce como empresario individual o como Sociedad Limitada.*

**Clave de respuesta:**
El **empresario individual** tributa por su beneficio dentro del **IRPF**, con tipos **progresivos** que pueden superar el 25 % a partir de ciertos niveles de renta. La **S.L.**, en cambio, tributa por el **Impuesto de Sociedades**, cuyo tipo general es del 25 % (con posibles tipos reducidos según el tipo de entidad), en principio independiente de la cuantía del beneficio dentro de ese régimen.

Esta diferencia de tipos hace que, según el nivel de beneficio y las circunstancias personales de cada caso (otras rentas del titular, deducciones aplicables, necesidad de repartir o reinvertir beneficios, costes de constitución y gestión de la sociedad, etc.), una u otra forma jurídica pueda resultar fiscalmente más ventajosa. No existe una regla general válida para todos los casos: la decisión debe evaluarse con datos concretos y, en la práctica, con asesoramiento fiscal.$mkd$ WHERE subject = 'economia' AND sort_order = 43;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$La **financiación** son los recursos que la empresa obtiene para realizar sus inversiones. Se clasifica según su procedencia:

**Financiación propia (o recursos propios):**
- **Interna (autofinanciación):** beneficios no distribuidos que se reinvierten (reservas) y los fondos retenidos mediante las amortizaciones. La amortización no "genera" dinero por sí misma: es un gasto contable que refleja la pérdida de valor del inmovilizado y que, al no suponer una salida de caja en el momento de contabilizarlo, permite retener dentro de la empresa recursos que de otro modo podrían haberse repartido como beneficio.
- **Externa:** aportaciones de los socios (capital social) al constituir la empresa o en ampliaciones de capital.

**Financiación ajena (recursos exigibles, hay que devolverlos):**
- A **corto plazo:** créditos de proveedores, préstamos y créditos bancarios a corto plazo, descuento de efectos, factoring.
- A **largo plazo:** préstamos bancarios a largo plazo, emisión de obligaciones/bonos, leasing.

La financiación propia no exige devolución ni intereses fijos, pero suele ser más limitada; la financiación ajena permite crecer más rápido, pero genera obligación de devolución y coste financiero (intereses).$mkd$ WHERE subject = 'economia' AND sort_order = 46;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Dos instrumentos habituales de financiación ajena para PYMES:

**Leasing (arrendamiento financiero):** contrato por el cual una empresa de leasing compra un bien (maquinaria, vehículo) y lo cede en alquiler a la empresa a cambio de cuotas periódicas, con opción de compra al final del contrato por un valor residual. Permite usar activos sin un gran desembolso inicial.

**Factoring:** la empresa cede sus derechos de cobro sobre clientes (facturas pendientes) a una entidad financiera (factor), que le adelanta el dinero (descontando una comisión) a cambio de encargarse del cobro. Permite convertir en liquidez inmediata las ventas a crédito, aunque tiene un coste (comisión) más elevado que otras fuentes. Existen dos modalidades según quién asume el riesgo de impago del cliente:
- **Factoring sin recurso:** el factor asume el riesgo de insolvencia del cliente; si este no paga, la empresa cedente no tiene que devolver el anticipo (coste más alto).
- **Factoring con recurso:** la empresa cedente sigue asumiendo el riesgo de insolvencia; si el cliente no paga, debe devolver el anticipo al factor (coste más bajo).$mkd$ WHERE subject = 'economia' AND sort_order = 47;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$El **Valor Actual Neto (VAN)** mide, en términos actuales, la riqueza neta que generaría un proyecto de inversión según las estimaciones utilizadas, descontando los flujos de caja futuros a un tipo de interés (k) que representa el coste de oportunidad del dinero.

$$VAN = -A + \dfrac{Q_1}{(1+k)^1} + \dfrac{Q_2}{(1+k)^2} + \dots + \dfrac{Q_n}{(1+k)^n}$$

donde $A$ es el desembolso inicial, $Q_i$ los flujos de caja de cada año y $k$ el tipo de descuento.

**Criterio de decisión:**
- $VAN > 0$: según las estimaciones de flujos de caja y el tipo de descuento utilizados, el proyecto crearía valor; se acepta. El resultado depende de que esas estimaciones se cumplan — el VAN no es una garantía de resultado futuro, sino una valoración basada en hipótesis.
- $VAN = 0$: el proyecto ni gana ni pierde valor (indiferente), según esas mismas estimaciones.
- $VAN < 0$: el proyecto destruiría valor según las estimaciones utilizadas; se rechaza.
- Entre varios proyectos **comparables** (mismo desembolso inicial, horizonte temporal y tipo de descuento), y todos con VAN positivo, se prefiere el de **mayor VAN**; si los proyectos no son comparables en esos términos, comparar directamente el VAN puede no ser válido.$mkd$ WHERE subject = 'economia' AND sort_order = 48;
