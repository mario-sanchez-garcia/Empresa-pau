-- Auditoría científica/matemática final de Física (23 de 57 topics corregidos) y
-- Matemáticas II (18 de 63 topics corregidos) PAU Madrid — segunda revisión
-- independiente (ver informe de auditoría para el detalle de cada corrección:
-- líneas de campo gravitatorio, 3ª Ley de Kepler con semieje mayor, agujeros
-- negros/Relatividad General, Gauss/Jaula de Faraday con cavidad cargada, campo
-- electrostático vs inducido, Fuerza de Lorentz con |q|, Ampère histórico,
-- Faraday con N espiras, péndulo con amplitud pequeña, tipos de ondas, sonido,
-- refracción, instrumentos ópticos, relatividad especial, efecto fotoeléctrico,
-- De Broglie, Heisenberg, Bohr, desintegración beta, fusión nuclear, redondeo en
-- gravitación y equivalencia masa-energía; rango y filas nulas, inversa por
-- adjuntos, Gauss sin orden obligatorio, paralelismo de vectores, dependencia
-- lineal, sistema de referencia, ecuación continua de la recta sin división
-- entre cero, asíntotas verticales, indeterminaciones infinito/infinito y 1^inf,
-- continuidad evitable, primitiva/integral definida, tablas de contingencia,
-- Bayes con partición, Chebyshev, aproximación binomial-normal). El resto de
-- topics se revisaron y se mantienen sin cambios (correctos, cálculos
-- numéricos verificados).
--
-- Solo UPDATE de concept_markdown/worked_example_markdown/practice_prompt sobre
-- filas ya existentes (solo los campos indicados en cada UPDATE) — no se toca
-- topic_id, review_status, alert_markdown, orden ni ningún ejercicio real.
-- Aplicado en directo contra Supabase con SUPABASE_SERVICE_ROLE_KEY antes de
-- crear esta migración; este archivo deja constancia reproducible del cambio.

UPDATE curriculum_content_v2 SET worked_example_markdown = $mkd$Calcula la fuerza de atracción gravitatoria entre la Tierra ($M=5{,}97\times10^{24}$ kg) y un satélite de $m=800$ kg situado a $r=7000$ km del centro de la Tierra.

1. Convertimos $r$ a metros: $r = 7\times10^6$ m.
2. Aplicamos la fórmula: $F = G\dfrac{M\cdot m}{r^2} = 6{,}674\times10^{-11}\cdot\dfrac{5{,}97\times10^{24}\cdot 800}{(7\times10^6)^2}$
3. Calculamos: $F \approx 6{,}674\times10^{-11}\cdot\dfrac{4{,}776\times10^{27}}{4{,}9\times10^{13}} \approx \mathbf{6505\ \text{N}}$$mkd$ WHERE subject = 'fisica' AND sort_order = 1;
UPDATE curriculum_content_v2 SET worked_example_markdown = $mkd$Explica por qué las líneas de campo gravitatorio de la Tierra son más densas cerca de la superficie.

1. Las líneas apuntan radialmente **hacia el centro** de la Tierra desde todos los puntos del espacio (convergen hacia la masa, no emanan de ella).
2. Cerca de la superficie, las líneas están más juntas porque $g$ es mayor (recuerda que $g$ decrece con $r^2$); lejos de la Tierra, las líneas se separan porque el campo se debilita.$mkd$ WHERE subject = 'fisica' AND sort_order = 3;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Johannes Kepler formuló tres leyes empíricas sobre el movimiento planetario, que más tarde Newton explicó con su ley de gravitación:

1. **1ª Ley (Órbitas):** Los planetas describen órbitas elípticas con el Sol en uno de los focos.
2. **2ª Ley (Áreas):** El radio vector que une el Sol con el planeta barre áreas iguales en tiempos iguales (consecuencia directa de la conservación del momento angular).
3. **3ª Ley (Periodos):** El cuadrado del periodo orbital es proporcional al cubo del semieje mayor $a$ de la órbita elíptica:

$$T^2 = \dfrac{4\pi^2}{GM}a^3$$

Para una órbita **circular**, el semieje mayor coincide con el radio: $a=r$, y la fórmula se puede escribir con $r$ directamente.$mkd$, worked_example_markdown = $mkd$La Luna orbita la Tierra a una distancia media (semieje mayor) $a=3{,}84\times10^8$ m. Calcula su periodo orbital $T$ (sabiendo $M_T=5{,}97\times10^{24}$ kg).

1. Aplicamos la 3ª Ley de Kepler: $T^2 = \dfrac{4\pi^2}{GM_T}a^3$
2. Sustituimos: $T^2 = \dfrac{4\pi^2}{6{,}674\times10^{-11}\cdot 5{,}97\times10^{24}}\cdot(3{,}84\times10^8)^3$
3. Calculamos $T \approx 2{,}36\times10^6$ s $\approx \mathbf{27{,}3\ \text{días}}$ (coincide con el periodo lunar real).$mkd$, practice_prompt = $mkd$Un satélite geoestacionario describe una órbita circular con periodo $T=24$ horas. Calcula el radio de su órbita usando la 3ª Ley de Kepler ($M_T=5{,}97\times10^{24}$ kg).$mkd$ WHERE subject = 'fisica' AND sort_order = 5;
UPDATE curriculum_content_v2 SET practice_prompt = $mkd$Investiga y explica brevemente qué es un agujero negro. Usando solo mecánica newtoniana, ¿qué pasaría si la velocidad de escape de un cuerpo superara la velocidad de la luz? (Esta es una forma histórica e intuitiva de aproximarse a la idea; la descripción físicamente correcta de un agujero negro pertenece a la Relatividad General de Einstein, que no forma parte de este bloque.)$mkd$ WHERE subject = 'fisica' AND sort_order = 12;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$El Teorema de Gauss relaciona el flujo del campo eléctrico a través de una superficie cerrada con la carga total encerrada:

$$\Phi_E = \oint \vec E\cdot d\vec S = \dfrac{Q_{encerrada}}{\varepsilon_0}$$

Es especialmente útil para calcular el campo en distribuciones con mucha simetría (esferas, láminas, cilindros), eligiendo una superficie gaussiana adecuada. Una aplicación práctica es la **Jaula de Faraday**: dentro del material de un conductor en equilibrio electrostático, el campo eléctrico es siempre nulo. Si el conductor es hueco y no hay carga en la cavidad interior, esa cavidad queda apantallada de los campos externos (por eso protege de campos eléctricos de fuera); pero si hay una carga dentro de la cavidad, no puede afirmarse que el campo sea cero en todo su interior.$mkd$ WHERE subject = 'fisica' AND sort_order = 16;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Al igual que el campo gravitatorio, el campo **electrostático** (el creado por cargas en reposo) es **conservativo**: el trabajo para mover una carga entre dos puntos no depende del camino, solo de las posiciones inicial y final:

$$W_{A\to B} = -\Delta E_p = E_{p,A} - E_{p,B} = q(V_A - V_B)$$

Si la carga recorre una trayectoria cerrada, el trabajo total es **cero**. Ojo: esto es válido para el campo electrostático — un campo eléctrico inducido por un campo magnético variable (que veremos con la Ley de Faraday) **no** es conservativo.$mkd$ WHERE subject = 'fisica' AND sort_order = 17;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Una carga $q$ que se mueve con velocidad $\vec v$ dentro de un campo magnético $\vec B$ experimenta una fuerza:

$$\vec F = q\vec v\times\vec B \qquad F = |q|vB\sin\theta$$

Esta fuerza es siempre **perpendicular** a $\vec v$ y a $\vec B$, por lo que no realiza trabajo sobre la carga (no cambia su energía cinética, solo su dirección). Si la carga entra perpendicularmente a $\vec B$, describe una trayectoria **circular** con radio $r=\dfrac{mv}{|q|B}$. El signo de $q$ no cambia el radio (que siempre es positivo): determina el **sentido** en el que gira la carga, no un "radio negativo".$mkd$ WHERE subject = 'fisica' AND sort_order = 20;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Un conductor rectilíneo de longitud $L$ por el que circula una corriente $I$, situado en un campo magnético $\vec B$, experimenta una fuerza:

$$\vec F = I\vec L\times\vec B \qquad F = ILB\sin\theta$$

Dos conductores paralelos por los que circulan corrientes se atraen (si van en el mismo sentido) o se repelen (si van en sentidos opuestos). Esta fuerza fue históricamente la base de la definición del amperio en el Sistema Internacional; desde la redefinición de 2019, el amperio se define a partir del valor fijado de la carga elemental, aunque el efecto de atracción/repulsión entre corrientes paralelas sigue siendo real y observable. Además, una espira de corriente en un campo magnético experimenta un **momento de fuerzas** que tiende a alinearla con $\vec B$: $\vec\tau = \vec m\times\vec B$, donde $\vec m = I\vec S$ es el momento magnético de la espira.$mkd$ WHERE subject = 'fisica' AND sort_order = 21;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$El flujo magnético a través de una superficie es:

$$\Phi_B = \vec B\cdot\vec S = B\cdot S\cdot\cos\theta$$

Se mide en weber (Wb). La **Ley de Faraday-Henry** establece que una variación del flujo magnético induce una fuerza electromotriz (FEM). Para una bobina de $N$ espiras (o $N=1$ si es una sola espira):

$$\varepsilon = -N\dfrac{d\Phi_B}{dt}$$

El signo negativo es la **Ley de Lenz**: la corriente inducida se opone siempre a la causa que la produce (a la variación de flujo). Este principio es la base del funcionamiento de generadores y transformadores, y de algunos tipos de motores; el efecto motor más básico (la fuerza sobre una corriente en un campo magnético) se explica directamente con la fuerza magnética, sin necesidad de inducción.$mkd$, worked_example_markdown = $mkd$Una espira única ($N=1$) de área $S=0{,}02\ \text{m}^2$ está en un campo magnético que varía de $B_1=0{,}5$ T a $B_2=0{,}1$ T en $\Delta t=0{,}2$ s, perpendicular a la espira. Calcula la FEM inducida.

1. Calculamos la variación de flujo: $\Delta\Phi_B = (B_2-B_1)\cdot S = (0{,}1-0{,}5)\cdot 0{,}02 = -0{,}008$ Wb.
2. Aplicamos la Ley de Faraday-Henry con $N=1$: $\varepsilon = -\dfrac{\Delta\Phi_B}{\Delta t} = -\dfrac{-0{,}008}{0{,}2}$
3. Resultado: $\varepsilon = \mathbf{0{,}04\ \text{V}}$$mkd$ WHERE subject = 'fisica' AND sort_order = 22;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Un péndulo simple (una masa colgada de un hilo) realiza un MAS **solo para ángulos pequeños** (menos de unos 10°). Dentro de esa aproximación, su periodo es:

$$T = 2\pi\sqrt{\dfrac{L}{g}}$$

y **no depende de la masa ni de la amplitud**, solo de la longitud $L$ del hilo y de la gravedad $g$. Para amplitudes grandes, esta independencia deja de cumplirse y el periodo real empieza a depender también de la amplitud — pero eso queda fuera de la aproximación de ángulo pequeño que se usa en PAU.$mkd$ WHERE subject = 'fisica' AND sort_order = 28;
UPDATE curriculum_content_v2 SET practice_prompt = $mkd$Clasifica estas ondas según necesiten medio material y según la dirección de vibración: una onda en una cuerda tensa, una onda sísmica de tipo P, y una señal de wifi.$mkd$ WHERE subject = 'fisica' AND sort_order = 29;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$El sonido es una onda mecánica longitudinal que necesita un medio para propagarse (no existe en el vacío). Su velocidad depende del medio: es mayor en sólidos que en líquidos, y mayor en líquidos que en gases (en aire, a 20°C, $v\approx 340$ m/s).

Tiene tres cualidades perceptivas:
- **Tono:** lo determina la frecuencia (agudo = frecuencia alta, grave = frecuencia baja).
- **Intensidad (sonoridad):** físicamente, la intensidad de la onda es proporcional al cuadrado de la amplitud ($I\propto A^2$); la sonoridad que percibimos depende principalmente de esa intensidad, pero también de la frecuencia y de la respuesta del oído humano (no es una relación exclusiva con la amplitud).
- **Timbre:** lo que distingue a un mismo sonido tocado por instrumentos distintos.$mkd$ WHERE subject = 'fisica' AND sort_order = 32;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$El índice de refracción de un medio indica cuánto se frena la luz al atravesarlo, comparado con el vacío:

$$n = \dfrac{c}{v}$$

Siempre es $n\geq 1$ (nunca la luz va más rápido que en el vacío). Cuanto **mayor** es $n$, más **denso ópticamente** es el medio y más se frena la luz al entrar en él. Cuánto se desvía el rayo (el ángulo de refracción) no depende solo de $n$: depende de los índices de ambos medios y del ángulo de incidencia, como se ve con la Ley de Snell en la siguiente ficha.$mkd$ WHERE subject = 'fisica' AND sort_order = 35;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$El ojo humano funciona como un sistema de lentes. Cuando no enfoca bien, aparecen defectos que se corrigen con lentes graduadas:

- **Miopía:** el ojo enfoca antes de la retina (ve mal de lejos) → se corrige con lente **divergente**.
- **Hipermetropía:** el ojo enfoca después de la retina (ve mal de cerca) → se corrige con lente **convergente**.
- **Presbicia:** pérdida de capacidad de enfoque cercano por la edad → lente convergente (como la hipermetropía).

Instrumentos como el microscopio o el telescopio suelen combinar varias lentes (o incluso espejos, en telescopios reflectores) para ampliar objetos lejanos o diminutos; la lupa, en cambio, normalmente es una única lente convergente.$mkd$ WHERE subject = 'fisica' AND sort_order = 41;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Cada observador mide el tiempo con su propio reloj. El **tiempo propio** $t_0$ es el que mide un observador que viaja junto al reloj (en su mismo sistema de referencia); el tiempo $t$ que mide un observador **respecto al cual ese reloj se mueve** es siempre mayor:

$$t = \dfrac{t_0}{\sqrt{1-v^2/c^2}} = \gamma\cdot t_0$$

Cuanto más cerca esté $v$ de $c$, mayor es $\gamma$ y más se dilata el tiempo medido por ese observador externo ($t>t_0$, porque $\gamma>1$). No hay un reloj que "realmente" vaya más lento en términos absolutos: cada observador mide el tiempo propio del otro como dilatado, porque el movimiento es siempre relativo entre dos sistemas de referencia.$mkd$ WHERE subject = 'fisica' AND sort_order = 43;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$La **longitud propia** $L_0$ es la longitud de un objeto medida por un observador en reposo respecto a él. Un observador respecto al cual ese objeto se mueve mide una longitud menor (en la dirección del movimiento):

$$L = L_0\sqrt{1-v^2/c^2} = \dfrac{L_0}{\gamma}$$

Al contrario que el tiempo, aquí la longitud medida **disminuye**: $L<L_0$ siempre que $v>0$. No existe una "longitud real" absoluta más allá de la propia: $L_0$ es simplemente la longitud en el sistema de referencia donde el objeto está en reposo. Solo es apreciable a velocidades cercanas a la de la luz.$mkd$, worked_example_markdown = $mkd$Una nave tiene $L_0=100$ m en su propio sistema de referencia (en reposo) y viaja a $v=0{,}8c$ ($\gamma=1{,}667$) respecto a la Tierra. ¿Qué longitud mide un observador en Tierra?

1. Aplicamos: $L = \dfrac{L_0}{\gamma} = \dfrac{100}{1{,}667}$
2. Resultado: $L \approx \mathbf{60\ \text{m}}$ para el observador terrestre — menor que la longitud propia $L_0$.$mkd$ WHERE subject = 'fisica' AND sort_order = 44;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Cuando la luz incide sobre un metal, puede arrancar electrones de su superficie, pero solo si su **frecuencia** supera un valor mínimo llamado **frecuencia umbral** $f_0$. Einstein explicó esto interpretando la luz como un chorro de fotones, cada uno con energía $E=hf$:

$$hf = W_0 + E_{c,max}$$

donde $W_0=hf_0$ es el **trabajo de extracción** y $E_{c,max}$ la energía cinética máxima del electrón arrancado. Si $f<f_0$, no se arranca ningún electrón, por mucho que se aumente la intensidad. Una vez que $f>f_0$: aumentar la **intensidad** de la luz aumenta el número de electrones arrancados, pero NO su energía cinética; solo aumentar la **frecuencia** consigue electrones más energéticos.$mkd$ WHERE subject = 'fisica' AND sort_order = 48;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Si la luz (una onda) se comporta a veces como partícula (fotones), Louis de Broglie propuso lo contrario: toda partícula con cantidad de movimiento $p$ lleva asociada una onda de longitud:

$$\lambda = \dfrac{h}{p}$$

Esta es la fórmula general. Cuando la partícula se mueve a velocidades mucho menores que $c$ (el caso habitual en PAU), su momento se puede aproximar por la expresión clásica $p=mv$, y entonces $\lambda = \dfrac{h}{mv}$. Esta **dualidad onda-corpúsculo** es uno de los pilares de la física cuántica: electrones, protones e incluso objetos cotidianos tienen "asociada" una onda, aunque para objetos grandes $\lambda$ es tan diminuta que resulta indetectable.$mkd$ WHERE subject = 'fisica' AND sort_order = 49;
UPDATE curriculum_content_v2 SET worked_example_markdown = $mkd$Este principio también se aplica a la posición y el momento de un electrón en un átomo: no tiene sentido hablar de una "trayectoria" del electrón con posición y velocidad exactas y simultáneas, como sí ocurre en la mecánica clásica. Por eso el modelo de órbitas bien definidas (como el de Bohr) es, en el fondo, una simplificación: lo que describe la mecánica cuántica es una **probabilidad de encontrar** al electrón en cada región del espacio, no una trayectoria precisa.$mkd$ WHERE subject = 'fisica' AND sort_order = 50;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Niels Bohr propuso que los electrones de un átomo solo pueden ocupar ciertas **órbitas permitidas**, con energías fijas (cuantizadas). Un electrón no emite energía mientras permanece en una órbita, pero puede saltar entre órbitas absorbiendo o emitiendo un fotón.

La variación de energía del átomo es $\Delta E_{\text{átomo}} = E_{final} - E_{inicial}$. En una **emisión** (el electrón cae a un nivel más bajo), $\Delta E_{\text{átomo}}<0$; en una **absorción** (sube a un nivel más alto), $\Delta E_{\text{átomo}}>0$. El fotón implicado siempre tiene energía positiva, igual al valor absoluto de esa variación:

$$E_{\text{fotón}} = |\Delta E_{\text{átomo}}| = hf$$

Este modelo explica por qué los átomos solo emiten o absorben luz en **espectros discretos** (líneas concretas), no en un espectro continuo.$mkd$, worked_example_markdown = $mkd$Un electrón cae de un nivel $E_{inicial}=-3{,}4$ eV a otro $E_{final}=-13{,}6$ eV. Calcula la energía del fotón emitido.

1. Es una **emisión**: $\Delta E_{\text{átomo}} = E_{final}-E_{inicial} = -13{,}6-(-3{,}4) = -10{,}2$ eV
2. El signo negativo confirma que el átomo pierde energía, que se emite como fotón.
3. Resultado: $E_{\text{fotón}} = |\Delta E_{\text{átomo}}| = \mathbf{10{,}2\ \text{eV}}$$mkd$, practice_prompt = $mkd$Un electrón absorbe un fotón y salta de $E_{inicial}=-13{,}6$ eV a $E_{final}=-1{,}5$ eV. Calcula $\Delta E_{\text{átomo}}$ (con su signo) y la energía del fotón absorbido.$mkd$ WHERE subject = 'fisica' AND sort_order = 51;
UPDATE curriculum_content_v2 SET worked_example_markdown = $mkd$Calcula la energía equivalente a $m=1$ g $=10^{-3}$ kg de masa.

1. Aplicamos: $E_0 = 10^{-3}\cdot(3\times10^8)^2$
2. Resultado: $E_0 = \mathbf{9\times10^{13}\ \text{J}}$ — del mismo orden de magnitud que la energía liberada por una bomba atómica de las usadas en la Segunda Guerra Mundial.$mkd$ WHERE subject = 'fisica' AND sort_order = 45;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Algunos núcleos son inestables y se transforman espontáneamente emitiendo radiación, buscando llegar a una configuración más estable:

- **Desintegración alfa ($\alpha$):** emite un núcleo de helio ($^4_2\text{He}$); el núcleo pierde 4 en $A$ y 2 en $Z$.
- **Desintegración beta ($\beta^-$):** un neutrón se convierte en protón, emitiendo un electrón y un antineutrino electrónico ($n\to p+e^-+\bar\nu_e$); $Z$ aumenta en 1, $A$ no cambia.
- **Desintegración gamma ($\gamma$):** el núcleo emite un fotón de alta energía para liberar el exceso de energía, sin cambiar ni $Z$ ni $A$.$mkd$ WHERE subject = 'fisica' AND sort_order = 54;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Es la unión de dos núcleos ligeros (como isótopos de hidrógeno) para formar uno más pesado, liberando una energía todavía mayor que la fisión por cada kilogramo de combustible. Es el proceso que da energía al Sol y a las estrellas:

$$^2_1\text{H} + {}^3_1\text{H} \to {}^4_2\text{He} + n$$ + energía

El gran reto tecnológico es conseguir la temperatura y el confinamiento adecuados (millones de grados) para vencer la repulsión eléctrica entre los núcleos, algo que hoy solo se consigue de forma experimental.$mkd$, worked_example_markdown = $mkd$La fusión presenta, en general, un perfil de residuos distinto al de la fisión: no genera productos de fisión de alta actividad ni requiere gestionar grandes cantidades de combustible fisible. Aun así, no está libre de residuos: la reacción D-T libera neutrones muy energéticos que pueden activar (hacer radiactivos) los materiales estructurales del reactor, y requiere gestionar el tritio, que también es radiactivo. Por eso es un objetivo de investigación energética muy activo (por ejemplo, en el reactor experimental ITER), pero no una fuente de energía sin ningún residuo.$mkd$ WHERE subject = 'fisica' AND sort_order = 57;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$El rango es el número de filas independientes. Usamos el método de Gauss haciendo operaciones entre filas para conseguir que los elementos por debajo de la diagonal principal sean ceros (escalonar).

Una fila que queda completamente a cero ($0, 0, ..., 0$) después de escalonar **no es independiente**: no aporta información nueva y no cuenta para el rango. Por eso, el rango final es simplemente el número de filas que sobreviven sin quedar todo ceros.

**Nota:** Si aplicas esto a la matriz ampliada $(A|B)$ de un sistema y una fila queda como $(0\ 0\ 0 \mid 0)$, esa fila se elimina por no aportar información — pero eso **por sí solo no determina** el tipo de sistema. Para decidir si es Compatible Determinado (SCD), Compatible Indeterminado (SCI) o Incompatible (SI) hay que comparar $\text{rg}(A)$, $\text{rg}(A^*)$ y el número de incógnitas (ver la ficha "Análisis de Sistemas por el Método de Gauss").$mkd$ WHERE subject = 'matematicas_ii' AND sort_order = 7;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$**Idea clave:** $A^{-1}$ se lee "la inversa de $A$": el exponente $-1$ es solo la notación que indica "matriz inversa", no una potencia real.

Es el método alternativo a Gauss-Jordan, ideal para matrices $3\times3$. La fórmula es:

$$A^{-1} = \frac{1}{|A|}\cdot\text{adj}(A)$$

donde $\text{adj}(A) = C^t$ es la **matriz adjunta** (la traspuesta de la matriz de cofactores $C$). ¡Cuidado! Cada cofactor lleva un signo $(-1)^{i+j}$ que cambia los signos en forma de tablero de ajedrez: $\begin{pmatrix} + & - & + \\ - & + & - \\ + & - & + \end{pmatrix}$.$mkd$, worked_example_markdown = $mkd$Calcular la inversa de $A = \begin{pmatrix} 1 & 2 \\ 3 & 8 \end{pmatrix}$:

1. Determinante: $|A| = (1\cdot8)-(2\cdot3) = 8-6 = 2$. (Como es $\neq 0$, tiene inversa).
2. Matriz de cofactores $C$ (tachar fila y columna de cada elemento, aplicando el signo): $C = \begin{pmatrix} 8 & -3 \\ -2 & 1 \end{pmatrix}$
3. Matriz adjunta $\text{adj}(A) = C^t$ (trasponemos $C$): $\text{adj}(A) = \begin{pmatrix} 8 & -2 \\ -3 & 1 \end{pmatrix}$
4. Dividir entre el determinante ($|A|=2$):

$$A^{-1} = \frac{1}{2}\begin{pmatrix} 8 & -2 \\ -3 & 1 \end{pmatrix} = \begin{pmatrix} 4 & -1 \\ -1{,}5 & 0{,}5 \end{pmatrix}$$$mkd$ WHERE subject = 'matematicas_ii' AND sort_order = 13;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$El objetivo es **escalonar la matriz**: hacer un triángulo de **ceros** por debajo de la diagonal principal.

Una **estrategia recomendada** (no la única válida) para hacer los ceros de forma ordenada es:

$$\begin{pmatrix} \bullet & \bullet & \bullet \\ 1^\circ & \bullet & \bullet \\ 2^\circ & 3^\circ & \bullet \end{pmatrix}$$

- Paso 1: Hacer cero el $1^\circ$ (Fila 2, Columna 1) → usando la Fila 1.
- Paso 2: Hacer cero el $2^\circ$ (Fila 3, Columna 1) → usando la Fila 1.
- Paso 3: Hacer cero el $3^\circ$ (Fila 3, Columna 2) → conviene usar el nuevo pivote de la Fila 2, para no romper los ceros ya conseguidos.

> **Truco "Multiplicar Cruzado"**: Si quieres hacer un cero entre dos filas, multiplica cada fila por el primer número de la otra fila. Es una forma práctica de trabajar, pero cualquier combinación de operaciones elementales entre filas que llegue a la forma escalonada es igualmente válida.$mkd$ WHERE subject = 'matematicas_ii' AND sort_order = 18;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Para analizar y resolver cualquier sistema (tenga las ecuaciones e incógnitas que tenga) usando Gauss, seguimos estos pasos:

1. Escribir la matriz ampliada $(A|B)$ con los coeficientes y los términos independientes.
2. Hacer ceros (escalonar) por debajo de la diagonal principal usando operaciones elementales entre filas (igual que hacíamos en las matrices).
3. Analizar el resultado (Discusión), comparando $\text{rg}(A)$, $\text{rg}(A^*)$ y el número de incógnitas $n$:
   - Si aparece una fila del tipo $(0\ 0\ 0 \mid \text{Número})$ con Número $\neq 0$: $\text{rg}(A) < \text{rg}(A^*)$ → Sistema Incompatible (SI), no tiene solución.
   - Si $\text{rg}(A) = \text{rg}(A^*) = n$ (número de incógnitas): Sistema Compatible Determinado (SCD), solución única.
   - Si $\text{rg}(A) = \text{rg}(A^*) < n$ (por ejemplo, porque una fila quedó $(0\ 0\ 0\mid 0)$ y ya no aporta ecuaciones independientes): Sistema Compatible Indeterminado (SCI), infinitas soluciones. Una fila nula por sí sola no basta: hay que confirmar que los rangos coinciden y son menores que $n$.
4. Resolver de abajo hacia arriba una vez que el sistema está limpio y escalonado.$mkd$, worked_example_markdown = $mkd$Resuelve y analiza por el método de Gauss el siguiente sistema de 3 ecuaciones con 3 incógnitas:

$$\begin{cases} x+y+z=2 \\ 2x+3y+5z=11 \\ 1x-5y+6z=29 \end{cases}$$

1. Escribimos la matriz ampliada inicial:

$$\left(\begin{array}{ccc|c} 1 & 1 & 1 & 2 \\ 2 & 3 & 5 & 11 \\ 1 & -5 & 6 & 29 \end{array}\right)$$

2. Primeros ceros en la columna 1 (usando la Fila 1):
   - Para la fila 2: $F_2 \to F_2 - 2F_1 = (2-2(1),\ 3-2(1),\ 5-2(1) \mid 11-2(2)) = (0,1,3 \mid 7)$
   - Para la fila 3: $F_3 \to F_3 - F_1 = (1-1,\ -5-1,\ 6-1 \mid 29-2) = (0,-6,5 \mid 27)$

La matriz intermedia queda así:

$$\left(\begin{array}{ccc|c} 1 & 1 & 1 & 2 \\ 0 & 1 & 3 & 7 \\ 0 & -6 & 5 & 27 \end{array}\right)$$

3. Último cero en la columna 2 (usando el pivote de la Fila 2):
   Operación: $F_3 \to F_3 + 6F_2 \to (0,0,\ 5+6(3) \mid 27+6(7)) \to (0,0,23 \mid 69)$

La matriz final escalonada por Gauss es:

$$\left(\begin{array}{ccc|c} 1 & 1 & 1 & 2 \\ 0 & 1 & 3 & 7 \\ 0 & 0 & 23 & 69 \end{array}\right)$$

4. Discusión y Resolución (De abajo a arriba):

$\text{rg}(A)=\text{rg}(A^*)=3=n$ (número de incógnitas): el sistema es **Compatible Determinado (SCD)** y tiene una única solución.

- Fila 3: $23z=69 \to z = \dfrac{69}{23} \to z=3$
- Fila 2: $y+3z=7 \to y+3(3)=7 \to y+9=7 \to y=-2$
- Fila 1: $x+y+z=2 \to x+(-2)+3=2 \to x+1=2 \to x=1$

Solución del sistema: $x=1,\ y=-2,\ z=3$.$mkd$ WHERE subject = 'matematicas_ii' AND sort_order = 19;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Recuerda que un vector se expresa por sus componentes, $\vec u = (u_1,u_2,u_3)$ y $\vec v = (v_1,v_2,v_3)$. Las operaciones se realizan de forma intuitiva, componente a componente:

- Suma y Resta: $\vec u \pm \vec v = (u_1\pm v_1,\ u_2\pm v_2,\ u_3\pm v_3)$
- Producto por un número (Escalar): $k\cdot \vec u = (k\cdot u_1,\ k\cdot u_2,\ k\cdot u_3)$
- Vectores paralelos: Dos vectores son paralelos (misma dirección) si existe un escalar $\lambda$ tal que $\vec u = \lambda\vec v$. Si ningún componente de $\vec v$ es cero, esto equivale a la razón $\dfrac{u_1}{v_1} = \dfrac{u_2}{v_2} = \dfrac{u_3}{v_3}$; pero si algún componente de $\vec v$ es cero, no se puede dividir por él — hay que comprobar directamente si $\vec u = \lambda\vec v$ componente a componente.$mkd$ WHERE subject = 'matematicas_ii' AND sort_order = 22;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Sirve para saber si un conjunto de vectores aporta información nueva o si están "repetidos" (son paralelos o combinaciones de otros).

- Linealmente Dependientes (L.D.): Uno de ellos se puede escribir como combinación de los demás.
- Linealmente Independientes (L.I.): Ninguno se puede obtener a partir de los otros.
- Para **tres vectores en $\mathbb{R}^3$**: se colocan como filas de una matriz $3\times3$ y se calcula su determinante. Si $\det \neq 0$ → L.I. (forman un volumen real, una base del espacio). Si $\det = 0$ → L.D. (los tres "viven" en un mismo plano).
- Para un número distinto de vectores, o en otra dimensión, el determinante ya no aplica directamente (no es una matriz cuadrada): hay que usar el rango de la matriz que forman (método de Gauss). El Rango del conjunto es el número máximo de vectores L.I. que contiene.$mkd$ WHERE subject = 'matematicas_ii' AND sort_order = 23;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$- Base: Tres vectores cualesquiera del espacio que sean Linealmente Independientes forman una base. Esto significa que cualquier otro vector se puede escribir como combinación de ellos de forma única.
- Base Canónica: Es la base estándar formada por los vectores unitarios y perpendiculares de los ejes coordenados: $\vec i = (1,0,0)$, $\vec j = (0,1,0)$, $\vec k = (0,0,1)$.
- Sistema de Referencia ($R$): Formado por un punto origen $O$ y una base. El sistema de referencia cartesiano habitual toma $O(0,0,0)$ junto con la base canónica, pero un sistema de referencia (afín) puede tomar como origen cualquier punto $O$ del espacio, combinado con cualquier base. Nos permite localizar cualquier punto del espacio mediante coordenadas relativas a ese origen y esa base.$mkd$ WHERE subject = 'matematicas_ii' AND sort_order = 24;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Una recta se define con un punto $A(x_0,y_0,z_0)$ y un vector director $\vec v(v_1,v_2,v_3)$:

- Vectorial: $(x,y,z) = (x_0,y_0,z_0) + \lambda(v_1,v_2,v_3)$
- Paramétricas: $\begin{cases} x=x_0+\lambda v_1 \\ y=y_0+\lambda v_2 \\ z=z_0+\lambda v_3 \end{cases}$
- Continua: $\dfrac{x-x_0}{v_1} = \dfrac{y-y_0}{v_2} = \dfrac{z-z_0}{v_3}$ — **solo válida si $v_1, v_2, v_3$ son todos distintos de cero** (no se puede dividir entre 0).
- Implícitas / Cartesianas: Intersección de dos planos $\begin{cases} Ax+By+Cz+D=0 \\ A'x+B'y+C'z+D'=0 \end{cases}$

Si algún componente del vector director es cero, esa coordenada es constante y se escribe aparte (por ejemplo, si $v_2=0$ entonces $y=y_0$), combinando la igualdad constante con la ecuación continua de las otras dos coordenadas — o, más simple, usando directamente las ecuaciones paramétricas.$mkd$, worked_example_markdown = $mkd$Halla las ecuaciones de la recta que pasa por $A(1,-2,3)$ con dirección $\vec v(4,0,-1)$:

Como $v_2=0$, **no se puede** escribir $\dfrac{y+2}{0}$ (división entre cero). La forma correcta es:

- Continua (combinada con la coordenada constante): $\dfrac{x-1}{4} = \dfrac{z-3}{-1}$, junto con $y=-2$.
- Paramétricas (siempre válidas, es la forma más segura en estos casos): $\begin{cases} x=1+4\lambda \\ y=-2 \\ z=3-\lambda \end{cases}$$mkd$ WHERE subject = 'matematicas_ii' AND sort_order = 28;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Describe situaciones donde los valores de la función o de la variable crecen o decrecen sin límite:

- En un punto finito: $\lim_{x\to c} f(x) = \pm\infty$ indica una asíntota vertical (AV) en $x=c$. Basta con que **uno solo** de los límites laterales ($x\to c^-$ o $x\to c^+$) sea infinito para que $x=c$ sea asíntota vertical; no hace falta que ambos lo sean, ni que coincidan en signo.
- En el infinito: $\lim_{x\to\pm\infty} f(x) = L$ (indica una asíntota horizontal) o $\lim_{x\to\pm\infty} f(x) = \pm\infty$ (ramas parabólicas).$mkd$ WHERE subject = 'matematicas_ii' AND sort_order = 38;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Aparece en límites en el infinito con un cociente de polinomios (u otras funciones que crecen sin límite). Se resuelve comparando los **grados** del numerador y denominador:

- Si el grado del numerador es **menor**: el límite es $0$.
- Si son **iguales**: el límite es el cociente de los coeficientes principales.
- Si el grado del numerador es **mayor**: el límite diverge en valor absoluto ($\infty$), pero el signo concreto (si es $+\infty$ o $-\infty$) depende del signo de los coeficientes principales, de la paridad de la diferencia de grados y de si $x\to+\infty$ o $x\to-\infty$ — no se puede afirmar sin más "grado mayor → $+\infty$" sin analizar esos detalles.

Esto funciona porque, cuando $x$ es muy grande, el término de mayor grado "domina" sobre los demás — son los que crecen más deprisa y determinan el comportamiento del límite.$mkd$ WHERE subject = 'matematicas_ii' AND sort_order = 40;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Aparece cuando la base de una potencia tiende a $1$ y el exponente tiende a $\infty$. El método general y seguro (válido siempre que $f(x)>0$ cerca del límite) es escribir la potencia como exponencial:

$$f(x)^{g(x)} = e^{g(x)\ln f(x)} \quad\Rightarrow\quad L = e^{\lim g(x)\ln f(x)}$$

Cuando además $f(x)\to1$, existe un atajo equivalente basado en el número $e$: $\lim f(x)^{g(x)} = e^{\lim g(x)\cdot(f(x)-1)}$. Es un atajo útil en ese caso concreto, no una fórmula universal para cualquier potencia.$mkd$, worked_example_markdown = $mkd$Calcula el límite: $\lim_{x\to\infty} \left(\dfrac{x+3}{x+1}\right)^x$.

1. Al sustituir, la base tiende a 1 y el exponente a $\infty$, generando la forma $1^\infty$.
2. Como $f(x)\to1$, usamos el atajo del número $e$: $e^{\lim_{x\to\infty} x\cdot\left(\frac{x+3}{x+1}-1\right)}$.
3. Operamos la fracción interna: $\dfrac{x+3-(x+1)}{x+1} = \dfrac{x+3-x-1}{x+1} = \dfrac{2}{x+1}$.
4. Resolvemos el límite del exponente: $\lim_{x\to\infty}\dfrac{2x}{x+1} = 2$. Resultado final: $e^2$.$mkd$ WHERE subject = 'matematicas_ii' AND sort_order = 42;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Una función $f(x)$ es continua en un punto $x=c$ si se cumplen tres condiciones: existe $f(c)$, existe $\lim_{x\to c}f(x)$ y ambos valores coinciden. Si no se cumple, la discontinuidad puede ser:

- Evitable: Existe el límite finito, pero o bien la función no está definida en $x=c$, o bien está definida con un valor distinto al del límite.
- Inevitable de salto finito: Los límites laterales son finitos pero distintos.
- Inevitable de salto infinito: Al menos uno de los límites laterales es $\pm\infty$.$mkd$ WHERE subject = 'matematicas_ii' AND sort_order = 43;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$De forma intuitiva, integrar es la operación inversa de derivar — y, más adelante, verás que la integral definida permite calcular el área bajo una función (con algunos matices sobre el signo que se explican en esa ficha). Una función $F(x)$ es una primitiva de $f(x)$ si se cumple que $F'(x) = f(x)$.$mkd$ WHERE subject = 'matematicas_ii' AND sort_order = 49;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$La integral definida $\int_a^b f(x)\,dx$ es un **valor algebraico** (puede ser negativo si $f(x)<0$ en el intervalo): representa el área con signo, sumando lo que queda por encima del eje y restando lo que queda por debajo.

Regla de Barrow: Si $F(x)$ es una primitiva de $f(x)$ en el intervalo $[a,b]$, entonces:

$$\int_a^b f(x)\,dx = [F(x)]_a^b = F(b)-F(a)$$

Cálculo del Área geométrica (siempre positiva): Para evitar que las áreas situadas por debajo del eje horizontal se resten, se calculan las raíces de la función en el intervalo y se integra aplicando valores absolutos por tramos.$mkd$ WHERE subject = 'matematicas_ii' AND sort_order = 52;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Herramientas organizativas para experimentos compuestos de varias etapas:

- Diagramas de Árbol: Se ramifican las opciones secuenciales indicando las probabilidades en cada rama. La probabilidad de un camino es el producto de sus ramas.
- Tablas de Contingencia: Tablas cruzadas bidimensionales útiles para organizar dos variables o características (ej. género y aficiones), sean o no independientes entre sí — precisamente sirven también para estudiar si existe asociación (dependencia) entre ellas.$mkd$ WHERE subject = 'matematicas_ii' AND sort_order = 56;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Modelan la probabilidad condicionada avanzada cuando el espacio muestral se divide en sucesos $A_1, A_2, \dots, A_n$ que forman una **partición**: son incompatibles dos a dos (no se solapan), su unión es todo el espacio muestral $\Omega$, y cada $P(A_i)$ es no nula.

- Probabilidad Total: Calcula la probabilidad de un suceso final $B$: $P(B) = \sum[P(A_i)\cdot P(B|A_i)]$
- Teorema de Bayes: Calcula la probabilidad a posteriori (la causa $A_i$ dado el efecto $B$): $P(A_i|B) = \dfrac{P(A_i)\cdot P(B|A_i)}{P(B)}$$mkd$ WHERE subject = 'matematicas_ii' AND sort_order = 57;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Teorema aplicable a cualquier variable estadística que tenga **media y varianza finitas** (sin importar su forma o distribución concreta), que permite acotar la probabilidad de que los valores queden fuera de un intervalo simétrico alrededor de la media:

$$P(|X-\mu| \geq k\sigma) \leq \frac{1}{k^2} \quad (k>0)$$

Determina que la probabilidad de desviarse de la media una distancia mayor o igual a $k$ veces la desviación típica es como máximo $1/k^2$.$mkd$ WHERE subject = 'matematicas_ii' AND sort_order = 60;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Si el número de repeticiones $n$ de una distribución binomial $X\sim B(n,p)$ es suficientemente grande, se puede aproximar mediante una curva normal continua si se cumplen los requisitos de control: $n\cdot p\geq5$ y $n\cdot q\geq5$.

La nueva distribución normal tendrá como parámetros derivados:

$$Y \sim N(n\cdot p,\ \sqrt{n\cdot p\cdot q})$$

**Importante:** como pasamos de una variable discreta ($X$) a una continua ($Y$), al calcular probabilidades hay que aplicar la **corrección de continuidad**: $P(X\leq k)\to P(Y\leq k+0{,}5)$; $P(X\geq k)\to P(Y\geq k-0{,}5)$; $P(a\leq X\leq b)\to P(a-0{,}5\leq Y\leq b+0{,}5)$.$mkd$ WHERE subject = 'matematicas_ii' AND sort_order = 63;
