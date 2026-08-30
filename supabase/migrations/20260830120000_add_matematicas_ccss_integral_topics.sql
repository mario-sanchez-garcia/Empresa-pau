-- Amplía el Curso de Matemáticas CCSS con 2 lecciones de cálculo integral,
-- hueco de catálogo real detectado en propuesta-topics-matematicas-ccss.md:
-- el examen oficial más reciente disponible (Ordinaria 2025-2026, Madrid, no
-- un modelo) confirma que primitivas/integral definida SIGUEN evaluándose —
-- contradice la asunción inicial de que LOMLOE lo había retirado de CCSS.
-- 26 de los 245 ejercicios reales necesitan este contenido.
--
-- Se insertan al final del bloque Análisis (order/sort_order 40 y 41,
-- después de los 22 temas existentes de ese bloque, antes de que empiece
-- Probabilidad en 23) — el order/sort_order no necesita ser contiguo con el
-- resto del bloque para agruparse correctamente: la UI agrupa primero por
-- block_key y luego ordena dentro del grupo, así que 40/41 aparecen al
-- final de "Análisis" sin tocar la numeración de los 39 temas existentes.
--
-- review_status='draft', igual que los 39 anteriores — NO se publican
-- todavía. topic_id ya poblado desde el insert, sin backfill posterior.

INSERT INTO curriculum_topics (id, subject, block_key, block_title, topic_slug, title, "order") VALUES
  ('5ac6c8aa-9a2a-45be-8e1e-b89aeff9b679'::uuid, 'matematicas_ccss', 'analisis', 'Análisis', 'primitiva-de-una-funcion-y-la-integral-indefinida', 'Primitiva de una Función y la Integral Indefinida', 40),
  ('dbfe96cb-d8a0-4df0-8ab8-47995abca496'::uuid, 'matematicas_ccss', 'analisis', 'Análisis', 'la-integral-definida-regla-de-barrow-y-areas', 'La Integral Definida: Regla de Barrow y Cálculo de Áreas', 41);

INSERT INTO curriculum_content_v2 (subject, block_key, block_slug, sort_order, title, concept_markdown, worked_example_markdown, practice_prompt, alert_markdown, topic_id, review_status) VALUES
  ('matematicas_ccss', 'Análisis', 'analisis', 40, 'Primitiva de una Función y la Integral Indefinida', $mkd$Una función $F(x)$ es una **primitiva** de $f(x)$ si $F'(x)=f(x)$ — es decir, derivar $F$ te devuelve $f$. Una misma función $f(x)$ tiene infinitas primitivas, todas ellas diferenciándose en una constante: si $F(x)$ es una primitiva, también lo es $F(x)+C$ para cualquier número $C$, ya que la derivada de una constante es 0.

Al conjunto de todas las primitivas se le llama **integral indefinida**, y se escribe $\displaystyle\int f(x)\,dx=F(x)+C$.

Reglas básicas: $\displaystyle\int x^n\,dx=\dfrac{x^{n+1}}{n+1}+C$ (si $n\neq-1$), $\displaystyle\int e^x\,dx=e^x+C$, y la integral de una suma (o de una constante por una función) se calcula término a término.

Para obtener **una** primitiva concreta (no toda la familia), hace falta un dato adicional, como el valor de $F$ en un punto.$mkd$, $mkd$Halla la función $F(x)$ tal que $F'(x)=3x^2-2$ y $F(0)=5$.

1. Buscamos la primitiva general: $\displaystyle\int(3x^2-2)\,dx=x^3-2x+C$.
2. Usamos el dato $F(0)=5$ para hallar $C$: $F(0)=0^3-2\cdot0+C=C=5$.
3. La primitiva buscada es $F(x)=x^3-2x+5$.$mkd$, $mkd$Halla la función $F(x)$ tal que $F'(x)=4x+1$ y $F(1)=3$.$mkd$, NULL, '5ac6c8aa-9a2a-45be-8e1e-b89aeff9b679'::uuid, 'draft'),
  ('matematicas_ccss', 'Análisis', 'analisis', 41, 'La Integral Definida: Regla de Barrow y Cálculo de Áreas', $mkd$La **integral definida** $\displaystyle\int_a^b f(x)\,dx$ se calcula con la **regla de Barrow**: se busca una primitiva $F(x)$ de $f(x)$, y el resultado es $F(b)-F(a)$.

Cuando $f(x)\geq0$ en todo el intervalo $[a,b]$, esta integral coincide con el **área** de la región entre la curva y el eje $OX$ en ese intervalo. Si la curva corta al eje (parte por encima, parte por debajo), la integral directa puede dar un resultado menor que el área real, o incluso negativo, porque las partes por debajo del eje restan en vez de sumar.

Procedimiento habitual para hallar un área acotada por una curva y el eje $OX$: primero se calculan los puntos de corte con el eje (resolviendo $f(x)=0$), y esos puntos son los límites de integración.$mkd$, $mkd$Calcula el área de la región limitada por $f(x)=4-x^2$ y el eje $OX$.

1. Puntos de corte con el eje: $4-x^2=0\Rightarrow x=\pm2$.
2. Primitiva: $F(x)=4x-\dfrac{x^3}{3}$.
3. Como $f(x)\geq0$ en $[-2,2]$, el área es directamente la integral:

$$\text{Área}=\int_{-2}^{2}(4-x^2)\,dx=F(2)-F(-2)=\left(8-\dfrac{8}{3}\right)-\left(-8+\dfrac{8}{3}\right)=\dfrac{16}{3}+\dfrac{16}{3}=\dfrac{32}{3}$$$mkd$, $mkd$Calcula el área de la región limitada por $f(x)=9-x^2$ y el eje $OX$.$mkd$, $mkd$⚠️ **Comprueba siempre el signo de $f(x)$ en el intervalo.** Si la curva pasa por debajo del eje $OX$ en alguna parte del intervalo, esa parte de la integral sale negativa — para el ÁREA (que siempre es positiva) hay que tomar el valor absoluto de cada tramo por separado, no sumarlos directamente.$mkd$, 'dbfe96cb-d8a0-4df0-8ab8-47995abca496'::uuid, 'draft');
