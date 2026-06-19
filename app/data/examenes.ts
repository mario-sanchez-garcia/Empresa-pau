export interface Pregunta {
  id: string
  bloque: string
  opcion: "A" | "B"
  enunciado: string
  puntuacion: number
  criterios: string
}

export interface Examen {
  id: number
  año: number
  tipo: "Ordinaria" | "Extraordinaria" | "Modelo"
  asignatura: string
  comunidad: string
  preguntas: Pregunta[]
}

const criteriosModeloMates = "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final, de acuerdo con los criterios oficiales del modelo."

const preguntaModelo = (
  id: string,
  bloque: string,
  opcion: "A" | "B",
  enunciado: string,
  puntuacion = 2.5
): Pregunta => ({
  id,
  bloque,
  opcion,
  enunciado,
  puntuacion,
  criterios: criteriosModeloMates
})

const examenesModeloMates: Examen[] = [
  {
    id: 101, año: 2026, tipo: "Modelo", asignatura: "Matemáticas II", comunidad: "Madrid",
    preguntas: [
      preguntaModelo("M2026-P1A", "Pregunta 1", "A", `Un equipo de ingenieros está trabajando en un nuevo modelo de dron para tomar fotografías del estado del tráfico. Elegido un sistema de coordenadas, el dron tiene $A(1,0,2)$ como punto de partida y un cierto tramo de autopista está contenido en el plano $\\pi: x+y+2z+1=0$. Las fotografías se deben tomar perpendicularmente al plano $\\pi$. Se toma el punto $C(0,-3,1)$ de $\\pi$ para calibrar el dron.

a) (1 punto) Determine la distancia del dron en el punto de partida $A$ al plano $\\pi$ y halle una ecuación del plano en el que el dron vuela manteniendo en todo momento la misma distancia al plano $\\pi$. Este plano recibe el nombre de plano de vuelo.

b) (1 punto) Responda solo a uno de los dos apartados siguientes:

b1) El dron se mueve en línea recta en el plano de vuelo desde el punto de partida $A$ al punto más cercano a $C$. Halle una ecuación de la recta que contiene la trayectoria lineal que recorre el dron para fotografiar $C$.

b2) La fotografía obtenida de $C$ a esa distancia no tiene buena definición. Se decide acercar el dron desde el punto de partida $A$ descendiendo perpendicularmente al plano $\\pi$ para situarse en $A'$, a la mitad de la distancia original. Calcule el ángulo formado por el plano $\\pi$ y la recta que pasa por $C$ y $A'$.`, 2),
      preguntaModelo("M2026-P2A", "Pregunta 2", "A", `Dada $f(x)=\\dfrac{x^2+1}{|x|+1}$, se pide:

a) (1 punto) Analizar la paridad y los extremos relativos de $f(x)$.

b) (1 punto) Hallar $\\displaystyle\\int_{-1}^{0} f(x)\\,dx$.`, 2),
      preguntaModelo("M2026-P3A", "Pregunta 3", "A", `Una envasadora de aceitunas comercializa bolsas con 12 aceitunas. La cosecha de este año ha sido atacada por el hongo *Sphaeropsis dalmatica* y una de cada veinte aceitunas presenta la enfermedad escudete. Se pide:

a) (1 punto) Calcular la probabilidad de que una bolsa no tenga aceitunas con la enfermedad.

b) (1 punto) Los controles sanitarios han fallado y se han distribuido 100 bolsas de aceitunas de esta cosecha. Calcular, aproximando por una distribución normal adecuada, la probabilidad de que al menos el 60% de las bolsas distribuidas tenga alguna aceituna con escudete.`, 2),
      preguntaModelo("M2026-P4A", "Pregunta 4", "A", `Sean $a\\in\\mathbb{R}$, $A=\\begin{pmatrix}2a&-2\\\\a&1\\end{pmatrix}$ y $B=\\begin{pmatrix}1&2\\\\-1&2\\end{pmatrix}$. Se pide:

a) (1 punto) Calcular, si existen, los valores de $a$ tales que la matriz $AA^t$ sea una matriz diagonal.

b) (1 punto) Calcular, si existen, los valores de $a$ tales que $(A-B)(A+B)=A^2-B^2$.`, 2),
      preguntaModelo("M2026-P4B", "Pregunta 4", "B", `Sea el sistema de ecuaciones

$$\\begin{cases}
x+2y-z=2\\\\
2x+\\lambda y+z=7\\\\
x+2y+\\lambda z=2
\\end{cases}$$

a) (1 punto) Discutir el sistema en función del parámetro real $\\lambda$.

b) (1 punto) Resolver el sistema si $\\lambda=-1$.`, 2),
      preguntaModelo("M2026-P5A", "Pregunta 5", "A", `Sea la función

$$f(x)=\\begin{cases}
\\dfrac{1}{2}(-8+\\cos x), & 0\\leq x<\\dfrac{\\pi}{2}\\\\
a\\,\\sin(x)+4, & \\dfrac{\\pi}{2}\\leq x<\\pi\\\\
2\\sin(2x)+b, & \\pi\\leq x\\leq 2\\pi
\\end{cases}$$

a) (1 punto) Halle los valores de $a$ y $b$ para que se verifiquen las hipótesis del Teorema de Bolzano en $[0,2\\pi]$.

b) (1 punto) Justifique razonadamente que la función $f(x)$ tiene una única raíz en el intervalo $(0,2\\pi)$ y calcule dicha raíz.`, 2),
      preguntaModelo("M2026-P5B", "Pregunta 5", "B", `Se considera la función

$$f(x)=\\begin{cases}
\\dfrac{\\ln(x^2+1)}{x}, & x\\neq 0\\\\
0, & x=0
\\end{cases}$$

a) (1 punto) Determinar si $f(x)$ es continua en todo $\\mathbb{R}$.

b) (1 punto) Determinar si $f(x)$ es derivable en el punto $x=0$ y, si existe, calcular la ecuación de la recta tangente a la gráfica de $f(x)$ para $x=0$.`, 2)
    ]
  },
  {
    id: 102, año: 2025, tipo: "Modelo", asignatura: "Matemáticas II", comunidad: "Madrid",
    preguntas: [
      preguntaModelo("M2025-1A", "Algebra", "A", `Sea $\\lambda$ un número real y considérese las matrices

$$A=\\begin{pmatrix}\\lambda&1&\\lambda\\\\0&\\lambda&-1\\end{pmatrix},\\qquad B=\\begin{pmatrix}1&\\lambda\\\\0&-1\\\\1&-\\lambda\\end{pmatrix}.$$

Se pide:

a) (0.5 puntos) Estudiar si existe algún valor de $\\lambda$ para el cual la matriz $AB$ no tenga inversa.

b) (1 punto) Estudiar el rango de la matriz $BA$ en función del parámetro $\\lambda$.

c) (1 punto) Para $\\lambda=1$, discutir el sistema $$(A^tA)\\begin{pmatrix}x\\\\y\\\\z\\end{pmatrix}=\\begin{pmatrix}a^2\\\\a^2\\\\2a\\end{pmatrix}$$ según los valores de $a$.`),
      preguntaModelo("M2025-1B", "Algebra", "B", `Se tienen garrafas de tres tamaños diferentes para llenar un aljibe. Con seis garrafas pequeñas y 2 L se llenan exactamente una garrafa mediana y una grande. Con dos garrafas grandes llenamos dos medianas, una pequeña y sobra 1 L. El aljibe se llena al completo bien con catorce garrafas pequeñas más seis medianas, bien con cinco medianas junto con cinco grandes. Se pide calcular la capacidad de cada tipo de garrafa y, una vez conocidas estas, la del aljibe.`),
      preguntaModelo("M2025-2A", "Analisis", "A", `Sea la función

$$f(x)=\\begin{cases}
x^2-6x+11, & x<2\\\\
\\sqrt{5x-1}, & x\\geq 2
\\end{cases}$$

a) (0.5 puntos) Estudie la continuidad de la función en $\\mathbb{R}$.

b) (1 punto) Estudie los extremos relativos de la función en el intervalo $(1,3)$.

c) (1 punto) Calcule el área encerrada por la función y el eje OX entre $x=1$ y $x=3$.`),
      preguntaModelo("M2025-2B", "Analisis", "B", `Dada la función $f(x)=\\sin\\left(\\dfrac{\\pi}{2}x\\right)$, se pide:

a) (0.5 puntos) Estudiar la paridad de la función $g(x)=f\\bigl(xf(x)\\bigr)$.

b) (1 punto) Calcular $\\displaystyle\\lim_{x\\to 0}\\dfrac{\\sqrt{4+3f(x)}-2}{x}$.

c) (1 punto) Calcular $\\displaystyle\\int_0^1 x f(x)\\,dx$.`),
      preguntaModelo("M2025-3A", "Geometria", "A", `Sean los puntos $A(0,0,0)$ y $B(1,1,1)$, y la recta $r\\equiv (x,y,z)=(\\lambda,\\lambda,\\lambda+1)$, $\\lambda\\in\\mathbb{R}$.

a) (1 punto) Halle una ecuación del plano respecto del cual los puntos $A$ y $B$ son simétricos.

b) (1 punto) Halle una ecuación del plano que contiene a la recta $r$ y pasa por el punto $B$.

c) (0.5 puntos) Halle una ecuación de una recta que sea paralela a $r$ y pase por $A$.`),
      preguntaModelo("M2025-3B", "Geometria", "B", `Dados los tres planos $\\pi_1:-2x-2y+z=0$, $\\pi_2:-2x+y-2z=0$ y $\\pi_3:x-2y-2z=0$, se pide:

a) (1 punto) Determinar el ángulo que forman los planos dos a dos. Determinar la intersección de los tres planos.

b) (1.5 puntos) Determinar el punto $P$ en el espacio del que se sabe que su proyección ortogonal sobre $\\pi_1$ es el punto $Q_1\\left(\\dfrac{1}{3},\\dfrac{4}{3},\\dfrac{10}{3}\\right)$ y que su proyección ortogonal sobre $\\pi_2$ es el punto $Q_2\\left(-\\dfrac{1}{3},\\dfrac{8}{3},\\dfrac{5}{3}\\right)$. Determinar la proyección ortogonal $Q_3$ del punto $P$ sobre el plano $\\pi_3$.`),
      preguntaModelo("M2025-4A", "Probabilidad", "A", `Según los datos de la Comunidad de Madrid, en la temporada 2021-2022 la cobertura de la vacuna de la gripe entre mayores de 65 años fue de un 73.2%.

a) (1.5 puntos) Ante una situación de brote epidémico, las autoridades deciden restringir aquellas reuniones en las que la probabilidad de que haya más de una persona no vacunada sea mayor de 0.5. Suponiendo que los asistentes a una reunión suponen una muestra aleatoria, ¿se deberían restringir las reuniones de 5 personas mayores de 65 años? ¿Y las reuniones de 7 personas mayores de 65 años?

b) (1 punto) Se toma una muestra aleatoria de 500 personas mayores de 65 años. Calcule, aproximando por la distribución normal adecuada, la probabilidad de que al menos 350 de ellos estén vacunados contra la gripe.`)
    ]
  },
  {
    id: 103, año: 2024, tipo: "Modelo", asignatura: "Matemáticas II", comunidad: "Madrid",
    preguntas: [
      preguntaModelo("M2024-1A", "Algebra", "A", `La primera interpretación en EE.UU. de la octava sinfonía de Mahler tuvo lugar en Filadelfia en 1916 con la participación de una orquesta, dos coros con el mismo número de miembros, un tercer coro infantil y, además, ocho cantantes solistas invitados especialmente y que no pertenecían a ninguno de los coros. La décima parte del número total de intérpretes de los tres coros era menor en 15 unidades al de miembros de la orquesta. Los miembros de cada uno de los dos coros no infantiles superaban en 140 unidades a la suma de componentes del coro infantil y los de la orquesta. El número de miembros de la orquesta excedía en 21 unidades a la doceava parte del total de intérpretes. ¿Cuántos intérpretes tenía la orquesta y cada uno de los coros? ¿Cuántos intérpretes había en total?`),
      preguntaModelo("M2024-2A", "Analisis", "A", `Sea la función $f(x)=x\\sqrt[3]{(x^2-1)^2}$.

a) (0.75 puntos) Halle $\\displaystyle\\lim_{x\\to 1}\\dfrac{f(x)}{(x-1)^{2/3}}$.

b) (1.75 puntos) Halle el área, en el primer cuadrante, comprendida entre la recta $y=x$ y la gráfica de la función $f(x)$.`),
      preguntaModelo("M2024-3A", "Geometria", "A", `Sea la recta

$$r\\equiv\\begin{cases}
x=\\lambda\\\\
y=0\\\\
z=0
\\end{cases}$$

y el plano $\\pi:z=0$.

a) (1 punto) Halle una ecuación de la recta paralela al plano $\\pi$ cuya dirección sea perpendicular a $r$ y que pase por el punto $(1,1,1)$.

b) (1.5 puntos) Halle una ecuación de una recta que forme un ángulo de $\\dfrac{\\pi}{4}$ radianes con la recta $r$, que esté contenida en el plano $\\pi$ y pase por el punto $(0,0,0)$.`),
      preguntaModelo("M2024-4A", "Probabilidad", "A", `La selección española competirá en la Copa Mundial Femenina de Fútbol 2023. En los dos primeros partidos de la fase de grupos, que consta de tres partidos, la probabilidad de ganar cada uno de ellos es del 80%. Sin embargo, debido al aumento en la moral de las jugadoras, si ganan los dos primeros partidos la probabilidad de ganar el tercero asciende al 90%. En caso contrario, la probabilidad de ganar el tercer partido se mantendrá en el 80%. Se pide:

a) (0.5 puntos) Determinar la probabilidad de que la selección española no gane ningún partido durante la fase de grupos.

b) (1 punto) Calcular la probabilidad de que la selección gane el tercer partido de la fase de grupos.

c) (1 punto) Si sabemos que la selección ha ganado el tercer partido, determinar la probabilidad de que no haya ganado alguno de los dos encuentros anteriores.`),
      preguntaModelo("M2024-1B", "Algebra", "B", `Consideremos las matrices reales

$$A=\\begin{pmatrix}m&1\\\\1&0\\\\m&3\\end{pmatrix},\\qquad B=\\begin{pmatrix}1&m&0\\\\m&0&1\\end{pmatrix}.$$

Se pide:

a) (0.75 puntos) Estudiar si existe algún valor de $m$ para el cual la matriz $BA$ tiene inversa.

b) (0.75 puntos) Estudiar el rango de la matriz $AB$ en función del parámetro $m$.

c) (1 punto) Para $m=1$, discutir el sistema $$(A^tA)\\begin{pmatrix}x\\\\y\\\\z\\end{pmatrix}=\\begin{pmatrix}a\\\\a\\\\a^2\\end{pmatrix}$$ según los valores de $a$.`),
      preguntaModelo("M2024-2B", "Analisis", "B", `Dada la función real de variable real $f(x)=x-\\dfrac{4}{(x-1)^2}$, se pide:

a) (0.75 puntos) Hallar el dominio de definición de $f(x)$ y determinar, en el caso de que existan, las ecuaciones de las asíntotas de su gráfica.

b) (1 punto) Determinar los extremos relativos de la función, así como sus intervalos de crecimiento y de decrecimiento.

c) (0.75 puntos) Calcular la ecuación de una recta tangente a la gráfica de $f(x)$ que sea paralela a la recta de ecuación $9x-8y=6$.`),
      preguntaModelo("M2024-3B", "Geometria", "B", `Dados los puntos $A(0,0,1)$, $B(1,1,0)$, $C(1,0,-1)$, $D(1,1,2)$, se pide:

a) (0.75 puntos) Comprobar que los puntos $A$, $B$, $C$ y $D$ no son coplanarios y hallar el volumen del tetraedro que forman.

b) (0.75 puntos) Hallar el área del triángulo que forman los puntos $B$, $C$ y $D$ y el ángulo $\\widehat{B}$ del mismo.

c) (1 punto) Hallar uno de los puntos $E$ del plano determinado por $A$, $B$ y $C$ tales que el cuadrilátero $ABCE$ sea un paralelogramo. Hallar el área de dicho paralelogramo.`),
      preguntaModelo("M2024-4B", "Probabilidad", "B", `En un espacio muestral se tienen dos sucesos incompatibles, $A_1$ de probabilidad 0.5 y $A_2$ de probabilidad 0.3 y se considera $A_3=A_1\\cup A_2$. De cierto suceso $B$ de probabilidad 0.4 se sabe que es independiente de $A_1$ y que la probabilidad del suceso $A_3\\cap B$ es 0.1. Con estos datos se pide:

a) (1 punto) Calcular la probabilidad de $A_3$.

b) (1.5 puntos) Decidir si $B$ y $A_2$ son independientes.`)
    ]
  },
  {
    id: 104, año: 2023, tipo: "Modelo", asignatura: "Matemáticas II", comunidad: "Madrid",
    preguntas: [
      preguntaModelo("M2023-1A", "Algebra", "A", `En la liga de fútbol profesional de Libertonia compiten veinte equipos. Cada equipo debe tener exactamente veinticinco jugadores de los que tres, y no más, han de ser porteros. Se sabe que la tercera parte del número de defensas coincide con la diferencia entre el número de centrocampistas y el número de delanteros. Por otro lado, la suma de la mitad del número de centrocampistas y el doble del número de delanteros excede en 25 unidades al número de defensas. Calcule el número de defensas, el número de centrocampistas y el número de delanteros que juegan en la liga.`),
      preguntaModelo("M2023-2A", "Analisis", "A", `Para la función

$$f(x)=\\begin{cases}
\\dfrac{e(x-1)}{e^x-e}, & x<1\\\\
\\dfrac{1}{4x-3}, & x\\geq 1
\\end{cases}$$

se pide:

a) (1 punto) Estudiar su continuidad en $\\mathbb{R}$ y determinar, en el caso de que existan, las ecuaciones de sus asíntotas.

b) (0.5 puntos) Para la función $g(x)=(e^x-e)f(x)$, calcular el valor de $g'(0)$.

c) (1 punto) Calcular $\\displaystyle\\int_1^5 \\sqrt{f(x)}\\,dx$.`),
      preguntaModelo("M2023-3A", "Geometria", "A", `Un depósito en forma de paralelepípedo, de base cuadrada $ABCD$, apoya completamente su base sobre una rampa en un local, quedando una arista superior pegada al techo. Se considera un sistema de ejes, con los semiejes positivos en un rincón del local. La arista inferior paralela a la que se apoya en el techo y no en su misma cara, tiene vértices de coordenadas $A(1,1,1)$ y $B(1,3,1)$. La ecuación del plano que contiene a la rampa es $4x-3z=1$ y el vértice sobre el punto $A$ es $A'(1,1,6)$. Se pide:

a) (0.5 puntos) Calcular una ecuación del plano que contiene a las aristas $AB$ y $AA'$.

b) (1 punto) Calcular los otros dos vértices, $C$ y $D$, de la base.

c) (1 punto) Calcular el volumen del depósito.`),
      preguntaModelo("M2023-4A", "Probabilidad", "A", `Una empresa complementa el sueldo de sus empleados según la consecución de ciertos objetivos valorados en función de una puntuación que sigue una distribución normal $N(100,35)$. Se pide:

a) (0.75 puntos) Calcular el porcentaje de empleados con una puntuación comprendida entre 100 y 140.

b) (0.75 puntos) Hallar la probabilidad de que un trabajador obtenga una puntuación inferior a 95 puntos.

c) (1 punto) Determinar la puntuación mínima necesaria para cobrar los objetivos si el 75.17% de la plantilla ha recibido dicho incentivo.`),
      preguntaModelo("M2023-1B", "Algebra", "B", `Dadas las matrices reales

$$A=\\begin{pmatrix}m&-1&1\\\\-2&0&m\\end{pmatrix},\\quad B=\\begin{pmatrix}2m&-1\\\\1&0\\end{pmatrix},\\quad C=\\begin{pmatrix}0&-1\\\\-2&1\\\\3&-1\\end{pmatrix},$$

se pide:

a) (0.75 puntos) Calcular, si existe, el valor de $m$ para el cual se verifica que $A^tB=C$.

b) (1 punto) Calcular, si existen, los valores de $m$ para los que existe la inversa de $AC$ y calcular para $m=0$ la inversa de $AC$.

c) (0.75 puntos) Calcular, si existe, el valor de $m$ para el cual se cumple que $B^2=B-I$, siendo $I$ la matriz identidad de orden 2.`),
      preguntaModelo("M2023-2B", "Analisis", "B", `Un ayuntamiento ha dividido en parcelas parte del terreno municipal no urbanizable y lo ha cedido a los vecinos para su cultivo. Uno de los vecinos ha decidido que en su parcela asignada utilizará como huerto una zona rectangular de 72 metros cuadrados, dejando el resto para plantar frutales e instalar una caseta donde guardar las herramientas necesarias. La zona de huerto estará dividida en dos partes: la parte dedicada al cultivo de hortalizas será un rectángulo interior separado de los lados que delimitan el huerto. La separación será de medio metro entre cada uno de los lados de mayor longitud y un metro entre cada uno de los lados de menor longitud. La franja que delimita la zona de hortalizas la dedicará al cultivo de flores y plantas aromáticas.

a) (2 puntos) Calcule las dimensiones del huerto para que el área de la zona para el cultivo de hortalizas sea máxima.

b) (0.5 puntos) Calcule el área de la zona de cultivo de hortalizas.`),
      preguntaModelo("M2023-3B", "Geometria", "B", `Se consideran las siguientes rectas:

- $r$, la recta que pasa por el punto $P(1,1,2)$ y tiene como vector director $\\vec{u}=(0,1,2)$.
- $s$, la recta de ecuaciones $$s\\equiv\\begin{cases}x+y-4=0\\\\x-2z+2=0\\end{cases}$$.
- $t$, la recta paralela a $s$ que contiene al punto $P$.

a) (0.75 puntos) Estudie la posición relativa de $r$ y $s$.

b) (0.75 puntos) Calcule el ángulo que forman las rectas $r$ y $t$.

c) (1 punto) Calcule la proyección ortogonal del punto $P$ sobre la recta $s$.`),
      preguntaModelo("M2023-4B", "Probabilidad", "B", `Sabiendo que $P(A\\cup B)=\\dfrac{4}{5}$, $P(\\overline{A})=\\dfrac{9}{20}$ y $P(\\overline{B})=\\dfrac{7}{20}$, se pide:

a) (0.75 puntos) Calcular razonadamente $P(\\overline{A}\\cap\\overline{B})$.

b) (0.75 puntos) Calcular razonadamente $P(\\overline{A}\\cup\\overline{B})$.

c) (0.5 puntos) Calcular razonadamente $P(A-B)$.

d) (0.5 puntos) Determinar si $A$ y $B$ son sucesos independientes.

Nota: $\\overline{A}$ y $A-B$ denotan, respectivamente, el suceso contrario de $A$ y el suceso diferencia de $A$ y $B$.`)
    ]
  },
  {
    id: 105, año: 2022, tipo: "Modelo", asignatura: "Matemáticas II", comunidad: "Madrid",
    preguntas: [
      preguntaModelo("M2022-1A", "Algebra", "A", `En una academia de idiomas se imparten clases de inglés, francés y alemán. Cada alumno está matriculado en un único idioma. El número de alumnos matriculados en inglés representa el 60% del total de alumnos de la academia. Si diez alumnos de francés se hubiesen matriculado en alemán, ambos idiomas tendrían el mismo número de alumnos. Además, la cuarta parte de los alumnos de inglés excede en ocho al doble de la diferencia entre los alumnos matriculados en francés y alemán. Calcule el número de alumnos matriculados en cada idioma.`),
      preguntaModelo("M2022-2A", "Analisis", "A", `Sea la función

$$f(x)=\\begin{cases}
\\dfrac{1-\\sin x}{x}, & x<0\\\\
xe^{4-x^2}, & x\\geq 0
\\end{cases}$$

a) (0.75 puntos) Estudie la continuidad y la derivabilidad de $f$ en $x=0$.

b) (1 punto) Determine los extremos relativos de $f(x)$ en $(0,\\infty)$.

c) (0.75 puntos) Calcule $\\displaystyle\\int_0^2 f(x)\\,dx$.`),
      preguntaModelo("M2022-3A", "Geometria", "A", `Una sonda planetaria se lanza desde el punto $P(1,0,2)$ y sigue una trayectoria rectilínea que pasa por el punto $Q(3,1,0)$ antes de impactar en una zona plana de la superficie del planeta, que tiene por ecuación $\\pi\\equiv 2x-y+2z+5=0$. Se pide:

a) (1.5 puntos) Calcular las coordenadas del punto de impacto y el coseno del ángulo entre la trayectoria de la sonda y el vector normal al plano $\\pi$.

b) (1 punto) Sabiendo que la alarma de proximidad se dispara antes de llegar a la superficie cuando la distancia al planeta es 1, determinar en qué punto estará la sonda al sonar la alarma.`),
      preguntaModelo("M2022-4A", "Probabilidad", "A", `Una urna contiene 7 bolas blancas y 12 bolas negras. Se extrae al azar una bola de la urna y se sustituye por dos del otro color. A continuación, se extrae una segunda bola de la urna. Se pide:

a) (1 punto) Calcular la probabilidad de que la segunda bola extraída sea blanca.

b) (0.75 puntos) Calcular la probabilidad de que la segunda bola extraída sea de distinto color que la primera.

c) (0.75 puntos) Calcular la probabilidad de que la primera bola extraída haya sido negra, sabiendo que la segunda bola fue blanca.`),
      preguntaModelo("M2022-1B", "Algebra", "B", `Sean las matrices

$$A=\\begin{pmatrix}0&1&a\\\\1&0&a\\\\a&1&0\\end{pmatrix},\\qquad B=\\begin{pmatrix}3\\\\-1\\\\-2\\end{pmatrix}.$$

Se pide:

a) (0.5 puntos) Calcular los valores de $a$ para los que la matriz $A$ no tiene inversa.

b) (1 punto) Para $a=1$, calcular la inversa de la matriz $A$.

c) (1 punto) Para $a=2$, resolver el sistema $A\\begin{pmatrix}x\\\\y\\\\z\\end{pmatrix}=B$.`),
      preguntaModelo("M2022-2B", "Analisis", "B", `Sea $f(x)=x+x^2$. Se pide:

a) (1 punto) Hallar el área de la región acotada que está limitada por la gráfica de $f$ y la recta $y=2x$.

b) (1.5 puntos) Una partícula en movimiento parte del origen y sigue la trayectoria determinada por la gráfica de $f$. En el punto $(1,f(1))$ la partícula sale despedida en la dirección de la recta tangente. Determinar en qué punto choca con la recta vertical $x=2$.`),
      preguntaModelo("M2022-3B", "Geometria", "B", `Dados los planos $\\pi_1\\equiv x-2y+3z=6$, $\\pi_2\\equiv 3x-z=2$ y el punto $A(1,7,1)$, se pide:

a) (0.5 puntos) Comprobar que $\\pi_1$ y $\\pi_2$ son perpendiculares.

b) (1 punto) Calcular el volumen de un cubo que tenga una cara en el plano $\\pi_1$, otra cara en el plano $\\pi_2$, y un vértice en el punto $A$.

c) (1 punto) Calcular el punto simétrico de $A$ respecto de $\\pi_1$.`),
      preguntaModelo("M2022-4B", "Probabilidad", "B", `Dos características genéticas $A$ y $B$ aparecen en una especie animal con probabilidades respectivas de 0.2 y 0.3. Sabiendo que la aparición de una de ellas es independiente de la aparición de la otra, se pide calcular:

a) (0.5 puntos) La probabilidad de que un individuo elegido al azar presente ambas características.

b) (0.5 puntos) La probabilidad de que no presente ninguna de ellas.

c) (0.75 puntos) La probabilidad de que presente solamente una de ellas.

d) (0.75 puntos) La probabilidad de que, si elegimos al azar 10 individuos, exactamente 3 de ellos presenten la característica $A$.`)
    ]
  },
  {
    id: 106, año: 2021, tipo: "Modelo", asignatura: "Matemáticas II", comunidad: "Madrid",
    preguntas: [
      preguntaModelo("M2021-1A", "Algebra", "A", `Dadas las matrices

$$A=\\begin{pmatrix}0&1&x\\\\1&0&x-1\\\\x+1&0&3\\end{pmatrix},\\qquad B=\\begin{pmatrix}0&\\frac{1}{3}&-\\frac{1}{3}\\\\0&1&0\\\\1&\\frac{2}{3}&-\\frac{2}{3}\\end{pmatrix},$$

se pide:

a) (0.5 puntos) Determinar los valores de $x\\in\\mathbb{R}$ para los cuales $A$ tiene inversa.

b) (0.75 puntos) Para $x=-1$, calcular la inversa de $A$.

c) (1.25 puntos) Para $x=1$, calcular $(AB^t)^{2020}$.`),
      preguntaModelo("M2021-2A", "Analisis", "A", `Sea la función

$$f(x)=\\begin{cases}
\\dfrac{2}{x+1}, & x\\leq 1\\\\
\\dfrac{\\ln x}{x-1}, & x>1
\\end{cases}$$

a) (0.5 puntos) Estudia la continuidad de $f$.

b) (1 punto) Halla las asíntotas de $f$.

c) (1 punto) Determina el valor de $x_0<1$ que verifica que la recta tangente a la gráfica de $f$ en el punto $(x_0,f(x_0))$ tiene pendiente $-\\dfrac{1}{2}$. Escribe la ecuación de dicha recta tangente.`),
      preguntaModelo("M2021-3A", "Geometria", "A", `Se consideran los puntos $A(3,1,2)$, $B(0,3,4)$ y $P(-1,1,0)$. Se pide:

a) (0.75 puntos) Determinar las coordenadas de un punto $Q$ sabiendo que los vectores $\\overrightarrow{AB}$ y $\\overrightarrow{PQ}$ son linealmente dependientes, tienen sentidos opuestos y tienen el mismo módulo.

b) (1 punto) Determinar las coordenadas del punto de intersección de la recta $r$ que contiene a $A$ y $P$, y de la recta $s$ que contiene a $B$ y al punto $C(2,-1,-2)$.

c) (0.75 puntos) Calcular el coseno del ángulo formado por $\\overrightarrow{PA}$ y $\\overrightarrow{PB}$.`),
      preguntaModelo("M2021-4A", "Probabilidad", "A", `En un instituto uno de cada cuatro alumnos practica baloncesto. Se eligen 6 alumnos al azar y se considera la variable aleatoria $X$ que representa el número de estudiantes entre estos 6 que practican baloncesto. Se pide:

a) (1 punto) Identificar la distribución de la variable aleatoria $X$ y calcular $P(X=0)$.

b) (0.75 puntos) Calcular la probabilidad de que al menos 5 de los 6 elegidos practiquen baloncesto.

c) (0.75 puntos) Calcular la probabilidad de que al menos 1 de los 6 practique baloncesto.`),
      preguntaModelo("M2021-1B", "Algebra", "B", `Dados la matriz

$$A=\\begin{pmatrix}0&1&-1\\\\a&-3&a\\\\a-1&-3&a\\end{pmatrix}$$

y el vector $B=\\begin{pmatrix}0\\\\1\\\\2\\end{pmatrix}$, determinar el valor o valores de $a$ para los que se verifica:

a) (0.5 puntos) $B^t(A+A^t)B=6$.

b) (1 punto) El sistema $AX=B$ no tiene solución.

c) (1 punto) $A=A^{-1}$.`),
      preguntaModelo("M2021-2B", "Analisis", "B", `Dada la función $f(x)=x^6-4x^4$, se pide:

a) (0.5 puntos) Estudiar sus intervalos de crecimiento y decrecimiento.

b) (1 punto) Encontrar sus máximos y mínimos locales, y determinar si son o no globales.

c) (1 punto) Hallar el área de la región acotada limitada por el eje $y=0$ y la gráfica de $f$.`),
      preguntaModelo("M2021-3B", "Geometria", "B", `Dadas las rectas

$$r:\\begin{cases}x+2z=1\\\\y+z=2\\end{cases},\\qquad s:\\begin{cases}x=-3+2\\lambda\\\\y=2-\\lambda\\\\z=1+\\lambda\\end{cases}$$

a) (0.75 puntos) Hallar la distancia del origen a la recta $s$.

b) (0.5 puntos) Determinar la posición relativa de $r$ y $s$.

c) (1.25 puntos) Escribir la ecuación de una recta perpendicular común a ambas rectas.`),
      preguntaModelo("M2021-4B", "Probabilidad", "B", `Una médico experto diagnostica posibles enfermos de una dolencia, fallando en reconocerla en el 5% de los casos que la padecen y diagnosticándola equivocadamente en el 10% de los sanos. Las estadísticas muestran que dicha enfermedad es padecida por 50 de cada diez mil personas. Si una persona al azar se somete a reconocimiento, calcule la probabilidad de:

a) (0.5 puntos) Que sea diagnosticada como enferma.

b) (1 punto) Que esté enferma si la diagnostican como tal.

c) (0.5 puntos) Que no esté enferma si la diagnostican sana.

d) (0.5 puntos) Que sea mal diagnosticada.`)
    ]
  },
  {
    id: 107, año: 2020, tipo: "Modelo", asignatura: "Matemáticas II", comunidad: "Madrid",
    preguntas: [
      preguntaModelo("M2020-1A", "Algebra", "A", `Se quiere construir un invernadero para el cultivo de semillas con ambiente controlado de temperatura, humedad y composición del aire. El aire que hay que suministrar debe contener un 78% de nitrógeno, un 21% de oxígeno y un 1% de argón.

a) (0.5 puntos) Si la capacidad del invernadero es 2000 litros, determine cuántos litros de nitrógeno, cuántos de oxígeno y cuántos de argón son necesarios.

b) (2 puntos) Para suministrar el aire se dispone de tres mezclas gaseosas $A$, $B$ y $C$, cuya composición se expresa en la tabla adjunta:

| Mezcla | Nitrógeno | Oxígeno | Argón |
| --- | ---: | ---: | ---: |
| A | 80% | 20% | 0% |
| B | 70% | 20% | 10% |
| C | 60% | 40% | 0% |

Obtenga la cantidad que hay que utilizar de cada mezcla para llenar el invernadero de aire con la composición requerida.`),
      preguntaModelo("M2020-2A", "Analisis", "A", `Dada la función $f(x)=e^{3x-2}$, se pide:

a) (1 punto) Determinar el punto en el que la tangente a la curva $y=f(x)$ tiene pendiente igual a $\\dfrac{3}{e}$ y escribir la ecuación de esta recta tangente.

b) (0.5 puntos) Calcular $\\displaystyle\\lim_{x\\to 2/3}\\dfrac{1-f(x)}{6x-4}$.

c) (1 punto) Calcular el área de la superficie acotada por la curva $y=f(x)$ y las rectas $x=0$, $y=1$.`),
      preguntaModelo("M2020-3A", "Geometria", "A", `Dadas las rectas

$$r_1\\equiv\\begin{cases}x=z-1\\\\y=2-3z\\end{cases},\\qquad r_2\\equiv\\begin{cases}x=4+5z\\\\y=4z-3\\end{cases},$$

se pide:

a) (1.5 puntos) Estudiar su posición relativa y hallar la distancia entre ellas.

b) (1 punto) Hallar el punto de corte entre la recta $r_2$ y el plano que contiene a $r_1$ y pasa por el origen de coordenadas.`),
      preguntaModelo("M2020-4A", "Probabilidad", "A", `Dados dos sucesos $A$ y $B$, se conocen las siguientes probabilidades: $P(A\\cup B)=0.55$, $P(\\overline{A}\\cup\\overline{B})=0.90$ y $P(B\\mid A)=0.25$. Se pide:

a) (2 puntos) Calcular $P(A\\cap B)$, $P(A)$, $P(B)$ y $P(B\\mid\\overline{A})$.

b) (0.5 puntos) Deducir de manera razonada si los sucesos $A$ y $B$ son independientes.`),
      preguntaModelo("M2020-1B", "Algebra", "B", `Dadas las matrices

$$A=\\begin{pmatrix}1&2+t\\\\5&10+3t\\\\-1&-2\\end{pmatrix},\\qquad X=\\begin{pmatrix}x\\\\y\\end{pmatrix},\\qquad B=\\begin{pmatrix}3\\\\9\\\\3t+3\\end{pmatrix},$$

se pide:

a) (1 punto) Calcular el rango de la matriz $A$ en función del parámetro $t$.

b) (1.5 puntos) Resolver el sistema $AX=B$, para los valores de $t$ que lo hagan compatible y determinado.`),
      preguntaModelo("M2020-2B", "Analisis", "B", `Dada la función $f(x)=\\dfrac{3}{x+1}$, se pide:

a) (1 punto) Calcular el área del triángulo formado por los ejes de coordenadas y la recta tangente a la curva $y=f(x)$ en $x=2$.

b) (0.75 puntos) Determinar las posibles asíntotas de la curva $y=f(x)$ y estudiar los intervalos de crecimiento y decrecimiento de $f(x)$.

c) (0.75 puntos) Calcular $\\displaystyle\\int_0^2 x f(x)\\,dx$.`),
      preguntaModelo("M2020-3B", "Geometria", "B", `Dados los puntos $A(1,1,-2)$, $B(3,-1,4)$ y la recta

$$r\\equiv\\begin{cases}x=1+3\\lambda\\\\y=-2+5\\lambda\\\\z=3\\end{cases}$$

se pide:

a) (1.5 puntos) Calcular el área del triángulo $OPQ$, siendo $O(0,0,0)$, $P$ el punto medio del segmento $AB$ y $Q$ la intersección de la recta que pasa por $A$ y $B$ y el plano $\\pi\\equiv z=7$.

b) (0.5 puntos) Hallar la ecuación del plano que pasa por $A$ y es perpendicular a la recta $r$.

c) (0.5 puntos) Calcular el coseno del ángulo que forman la recta $r$ y la recta que pasa por $A$ y $B$.`),
      preguntaModelo("M2020-4B", "Probabilidad", "B", `En cierta ciudad se estima que la temperatura máxima de cada día, en el mes de junio, sigue una distribución normal de media $30^{\\circ}\\mathrm{C}$ y varianza 25. Se pide:

a) (0.75 puntos) Calcular la probabilidad de que un día cualquiera del mes la temperatura máxima esté entre $28^{\\circ}\\mathrm{C}$ y $32^{\\circ}\\mathrm{C}$.

b) (1 punto) Calcular el número esperado de días del mes con máxima superior a $36^{\\circ}\\mathrm{C}$.

c) (0.75 puntos) Determinar la temperatura máxima alcanzada el día 10 de junio, sabiendo que dicha temperatura fue superada exactamente el 50% de los días del mes.`)
    ]
  },
  {
    id: 108, año: 2019, tipo: "Modelo", asignatura: "Matemáticas II", comunidad: "Madrid",
    preguntas: [
      preguntaModelo("M2019-1A", "Algebra", "A", `Para cada uno de los siguientes apartados, proponga un ejemplo de matriz cuadrada $A$, de dimensión $3\\times 3$, con todos sus números distintos de cero y con sus tres filas y columnas diferentes, que cumpla la condición pedida.

a) (0.5 puntos) El determinante de $A$ vale 0.

b) (0.5 puntos) El determinante de $A$ vale 1.

c) (0.5 puntos) La matriz $A$ coincide con su traspuesta.

d) (1 punto) Para una cierta matriz cuadrada $C$, distinta de la matriz nula y de la identidad, se verifica que $A\\cdot C=C\\cdot A$. Debe proponer ejemplos concretos para las dos matrices $A$ y $C$.`),
      preguntaModelo("M2019-2A", "Analisis", "A", `La contaminación por dióxido de nitrógeno, $NO_2$, en cierta estación de medición de una ciudad, durante el pasado mes de abril, se puede modelar por la función

$$c(t)=80-6t+\\dfrac{23t^2}{20}-\\dfrac{t^3}{30}\\ \\mathrm{mg/m^3},$$

donde $t\\in[0,30]$ representa el tiempo, expresado en días, transcurrido desde las 0 horas del día 1 de abril.

a) (0.5 puntos) ¿Qué nivel de $NO_2$ había a las 12 horas del día 10 de abril?

b) (1.25 puntos) ¿En qué momento se alcanzó el máximo nivel de $NO_2$?, ¿cuál fue ese nivel máximo?

c) (0.75 puntos) Calcule, mediante $\\displaystyle\\dfrac{1}{30}\\int_0^{30} c(t)\\,dt$, el nivel promedio del mes.`),
      preguntaModelo("M2019-3A", "Geometria", "A", `Dados los puntos $A(1,2,-3)$, $B(1,5,0)$, $C(5,6,-1)$ y $D(4,-1,3)$, se pide:

a) (1.5 puntos) Calcular el plano $\\pi$ que contiene a los puntos $A$, $B$, $C$ y la distancia del punto $D$ a dicho plano.

b) (0.5 puntos) Calcular el volumen del tetraedro definido por los cuatro puntos dados.

c) (0.5 puntos) Calcular el área del triángulo definido por $A$, $B$ y $C$.`),
      preguntaModelo("M2019-4A", "Probabilidad", "A", `El examen de oposición a la Administración Local de cierta ciudad consta de 300 preguntas, con respuesta verdadero o falso. Un opositor responde al azar todas las preguntas. Se considera la variable aleatoria $X$ = “número de respuestas acertadas” y se pide:

a) (1.5 puntos) Justificar que la variable $X$ se puede aproximar por una normal y obtener los parámetros correspondientes.

b) (1 punto) Utilizando la aproximación por la normal, hallar la probabilidad de que el opositor acierte a lo sumo 130 preguntas y la probabilidad de que acierte exactamente 160 preguntas.`),
      preguntaModelo("M2019-1B", "Algebra", "B", `Dado el sistema de ecuaciones

$$\\begin{cases}
x-my-z=0\\\\
mx-4y+(6-2m)z=-8m\\\\
-x+2y+z=6
\\end{cases}$$

se pide:

a) (2 puntos) Discutir el sistema en función de los valores del parámetro $m$.

b) (0.5 puntos) Resolver el sistema en el caso $m=6$.`),
      preguntaModelo("M2019-2B", "Analisis", "B", `a) (1 punto) A partir de la gráfica de la función $f$ incluida en el PDF oficial, determine los valores de $f'(-1)$, $\\displaystyle\\lim_{x\\to -2^+}f(x)$, $\\displaystyle\\lim_{x\\to -2^-}f(x)$ y $\\displaystyle\\lim_{x\\to 0}f(x)$.

b) (1.5 puntos) Calcule $\\displaystyle\\int_{-3}^{\\pi} g(x)\\,dx$, donde

$$g(x)=\\begin{cases}
x^2+2x+1, & -3\\leq x\\leq 0\\\\
1+\\sin x, & 0<x\\leq 4
\\end{cases}.$$`),
      preguntaModelo("M2019-3B", "Geometria", "B", `Dadas las rectas

$$r\\equiv\\begin{cases}x=2+\\lambda\\\\y=3+\\lambda\\\\z=1-\\lambda\\end{cases},\\qquad s\\equiv\\begin{cases}x-y=2\\\\y+z=1\\end{cases},$$

se pide:

a) (1 punto) Determinar la posición relativa de $r$ y $s$.

b) (1 punto) Obtener un plano que contenga a las dos rectas.

c) (0.5 puntos) Dado el punto $A(3,1,0)$, de la recta $s$, obtener un punto $B$, de la recta $r$, de modo que el vector $\\overrightarrow{AB}$ sea perpendicular a la recta $r$.`),
      preguntaModelo("M2019-4B", "Probabilidad", "B", `El grupo de WhatsApp, formado por los alumnos de una escuela de idiomas, está compuesto por un 60% de mujeres y el resto varones. Se sabe que el 30% del grupo estudia alemán y que la cuarta parte de las mujeres estudia alemán. Se recibe un mensaje en el grupo. Se pide:

a) (1.25 puntos) Calcular la probabilidad de que lo haya enviado una mujer, si se sabe que el o la remitente estudia alemán.

b) (1.25 puntos) Si en el mensaje no hay ninguna información sobre el sexo y estudios del remitente, calcular la probabilidad de que sea varón y estudie alemán.`)
    ]
  },
  {
    id: 109, año: 2018, tipo: "Modelo", asignatura: "Matemáticas II", comunidad: "Madrid",
    preguntas: [
      preguntaModelo("M2018-1A", "Algebra", "A", `Dadas las matrices

$$A=\\begin{pmatrix}0&1&1\\\\0&3&0\\\\0&-1&3\\end{pmatrix},\\qquad I=\\begin{pmatrix}1&0&0\\\\0&1&0\\\\0&0&1\\end{pmatrix},$$

se pide:

a) (1.5 puntos) Obtener los valores de $m$ para los que la matriz $A-mI$ admite inversa.

b) (1 punto) Calcular la matriz inversa de $A-2I$.`),
      preguntaModelo("M2018-2A", "Analisis", "A", `Dada la función $f(x)=2\\cos(x)+|x-1|$, se pide:

a) (0.5 puntos) Determinar el valor de $f'(0)$.

b) (1 punto) Calcular la ecuación de la recta tangente a la curva $y=f(x)$ en el punto de abscisa $x=\\pi$.

c) (1 punto) Hallar el área del recinto plano limitado por la curva $y=f(x)$, el eje OX y las rectas $x=\\pi$ y $x=2\\pi$.`),
      preguntaModelo("M2018-3A", "Geometria", "A", `Dados los planos $\\pi_1\\equiv 3x+y+2z-1=0$, $\\pi_2\\equiv 2x-y+3z-1=0$ y la recta

$$r\\equiv\\begin{cases}
x=1-2t\\\\
y=-1+t\\\\
z=1+t
\\end{cases}$$

se pide:

a) (1.5 puntos) Hallar los puntos de la recta $r$ equidistantes de $\\pi_1$ y $\\pi_2$.

b) (1 punto) Hallar el área del triángulo que forma el punto $P(-2,3,2)$ con los puntos de intersección de $r$ con $\\pi_1$ y $\\pi_2$.`),
      preguntaModelo("M2018-4A", "Probabilidad", "A", `Sabiendo que el peso de los estudiantes varones de segundo de bachillerato se puede aproximar por una variable aleatoria con distribución normal, de media 74 kg y desviación típica 6 kg, se pide:

a) (1 punto) Determinar el porcentaje de estudiantes varones cuyo peso está comprendido entre los 68 y 80 kg.

b) (0.5 puntos) Estimar cuántos de los 1500 estudiantes varones, que se han presentado a las pruebas de la EvAU en una cierta universidad, pesan más de 80 kg.

c) (1 punto) Si se sabe que uno de estos estudiantes pesa más de 76 kg, ¿cuál es la probabilidad de que pese más de 86 kg?`),
      preguntaModelo("M2018-1B", "Algebra", "B", `Dada la matriz $A$ y los vectores $X$ y $B$ siguientes:

$$A=\\begin{pmatrix}1&1&1\\\\m&1&m+1\\\\1&m&m\\end{pmatrix},\\qquad X=\\begin{pmatrix}x\\\\y\\\\z\\end{pmatrix},\\qquad B=\\begin{pmatrix}1\\\\1\\\\2+m\\end{pmatrix},$$

se pide:

a) (2 puntos) Discutir el sistema lineal $AX=B$ en función de los valores del parámetro $m$.

b) (0.5 puntos) Resolver el sistema lineal $AX=B$ cuando $m=-1$.`),
      preguntaModelo("M2018-2B", "Analisis", "B", `El dibujo adjunto del PDF oficial muestra la gráfica de la función

$$f(x)=(6-x)e^{\\frac{x-4}{3}}-1.$$

Se pide:

a) (1 punto) Calcular el área de la región sombreada.

b) (1 punto) Determinar la abscisa del punto de la gráfica donde la recta tangente tiene pendiente máxima.

c) (0.5 puntos) Efectuando los cálculos necesarios, obtener la ecuación de la asíntota que se muestra en el dibujo.`),
      preguntaModelo("M2018-3B", "Geometria", "B", `Dados los planos $\\pi_1\\equiv x+y=0$, $\\pi_2\\equiv x=0$ y el punto $B(-1,1,1)$, se pide:

a) (1 punto) Determinar el punto $B'$, simétrico de $B$ respecto del plano $\\pi_2$.

b) (1 punto) Obtener una ecuación de la recta $r$, contenida en el plano $\\pi_1$, paralela al plano $\\pi_2$ y que pasa por el punto $B$.

c) (0.5 puntos) Hallar el ángulo que forman los planos $\\pi_1$ y $\\pi_2$.`),
      preguntaModelo("M2018-4B", "Probabilidad", "B", `En una bolsa hay 10 caramelos de fresa, 15 de menta y 5 de limón. Se extraen sucesivamente de la bolsa dos caramelos. Se pide:

a) (1 punto) Determinar la probabilidad de que el segundo de ellos sea de fresa.

b) (0.5 puntos) Determinar la probabilidad de que los dos sean de fresa.

c) (1 punto) Sabiendo que el segundo ha sido de fresa, calcular la probabilidad de que lo haya sido también el primero.`)
    ]
  }
]

export const examenes: Examen[] = [
  ...examenesModeloMates,
  {
    id: 2, año: 2025, tipo: "Ordinaria", asignatura: "Matemáticas II", comunidad: "Madrid",
    preguntas: [
      { id: "2025-J-11", bloque: "Algebra", opcion: "A",
        enunciado: "En el baloncesto existen canastas que valen un punto, otras que valen dos y otras\nque valen tres puntos. Calcule el número de lanzamientos de uno, de dos y de tres puntos que realizó un equipo\nen un partido sabiendo que:\n• El equipo anotó 80 puntos con un acierto del 80% en tiros de uno, del 50% en tiros de dos y del 40% en tiros\nde tres.\n• La tercera parte del número de lanzamientos de dos fue igual a la quinta parte del resto de lanzamientos.\n• El doble del número de lanzamientos de tres es menor en cinco unidades al resto de lanzamientos.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2025-J-12", bloque: "Algebra", opcion: "B",
        enunciado: `Sean la matriz

$$
A = \\begin{pmatrix}
4 & 1 & 0 \\\\
2 & 3 & 0 \\\\
3 & 2 & 2
\\end{pmatrix}
$$

e $I$ la matriz identidad de orden $3$. Se pide:

a) (1.25 puntos) Calcular el polinomio $P(\\lambda) = \\det(A - \\lambda I)$ y hallar las raíces reales del polinomio.

b) (1.25 puntos) Para $\\lambda = 5$, calcular un vector no nulo

$$
\\vec{v} = \\begin{pmatrix}
x \\\\
y \\\\
z
\\end{pmatrix}
$$

que satisfaga que $(A - \\lambda I)\\vec{v} = \\vec{0}$.`,
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2025-J-2", bloque: "Analisis", opcion: "A",
        enunciado: `Un muro rectangular de la biblioteca pública del barrio se va a pintar con la ayuda de unos grafiteros. La dimensión del muro es de 3 metros de alto y 12 metros de largo. Colocando la esquina inferior izquierda del muro en el origen de coordenadas, se va a utilizar la curva $f(x) = \\cos\\left(\\dfrac{\\pi x}{9}\\right) + 2$ para diferenciar dos regiones del muro que serán pintadas con dos colores distintos. Se sabe que con un bote de spray se pueden pintar 3 metros cuadrados de superficie.

a) (0.75 puntos) Halle el valor máximo y el valor mínimo de la función $f(x)$ en el intervalo $[0, 12]$. ¿Está la curva en este intervalo $[0, 12]$ contenida completamente en el muro?

b) (1.25 puntos) Halle el área que tienen que pintar de cada color.

c) (0.5 puntos) ¿Cuántos botes de spray se tienen que comprar como mínimo para pintar toda el área bajo la curva $f(x)$?`,
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2025-J-31", bloque: "Geometria", opcion: "A",
        enunciado: `Dados la recta $r \\equiv \\dfrac{x-1}{2} = \\dfrac{y}{0} = \\dfrac{z-2}{1}$ y el plano $\\pi: x + 2y - 3z = 1$, se pide:

a) (0.75 puntos) Hallar una ecuación del plano que contiene a $r$ y es perpendicular a $\\pi$.

b) (0.75 puntos) Hallar una ecuación de la recta contenida en $\\pi$ que corta perpendicularmente a $r$.

c) (1 punto) Calcular los puntos de la recta $r$ cuya distancia al plano $\\pi$ es $\\sqrt{14}$.`,
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2025-J-32", bloque: "Geometria", opcion: "B",
        enunciado: "Sean el punto $P(0, 1, 1)$ y el plano $\\pi : x + y = 2$. Se pide:\n\na) (0.5 puntos) Hallar la distancia del punto $P$ al plano $\\pi$.\n\nb) (1 punto) Determinar el punto $Q$ del plano $\\pi$ cuya distancia a $P$ es igual que la distancia de $P$ a $\\pi$.\n\nc) (1 punto) Hallar el área del triángulo formado por $P$ y los puntos de corte del plano $\\pi$ con los ejes coordenados.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2025-J-41", bloque: "Probabilidad", opcion: "A",
        enunciado: `Sea $E = \\{2, 3, 5, 7, 11, 13, 17, 19\\}$ un espacio muestral y $P$ una medida de probabilidad en $E$ definida por: $P(7) = P(3) = \\dfrac{1}{4}$ y con el resto de sucesos elementales equiprobables.

Se consideran los sucesos $A = \\{7, 11, 13, 19\\}$, $B = \\{2, 5, 7, 13, 17\\}$ y $C = \\{3, 5, 7, 11, 13\\}$. Se pide calcular:

a) (1.25 puntos) $P\\bigl(\\overline{(A - C)} \\cap B\\bigr)$.

b) (1.25 puntos) $P\\bigl((A \\cap B) \\mid \\overline{C}\\bigr)$.`,
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2025-J-42", bloque: "Probabilidad", opcion: "B",
        enunciado: "Entre los ciudadanos de 14 años o más de cierto país, el 20% de la población tiene entre 14 y 24\naños, el 50% entre 25 y 64 y el resto más de 64 años. Según datos recogidos por el ministerio de cultura de ese\npaís, el 74% de sus ciudadanos de entre 14 y 24 es lector habitual, mientras que el porcentaje decrece hasta el\n65.8% entre los de 25 a 64 y al 53.7% entre los mayores de 64. Elegido un ciudadano al azar del país en cuestión\nde 14 años o más, se pide:\n\na) (1.25 puntos) Calcular la probabilidad de que sea lector habitual.\n\nb) (1.25 puntos) Si no es lector habitual, calcular la probabilidad de que tenga entre 25 y 64 años.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
    ]
  },
  {
    id: 3, año: 2025, tipo: "Extraordinaria", asignatura: "Matemáticas II", comunidad: "Madrid",
    preguntas: [
      { id:"2025-Jl-1A", bloque:"Algebra", opcion:"A",
        enunciado:`$A=\\begin{pmatrix}1&2&-1\\\\0&1&1\\\\2&1&0\\end{pmatrix}$.\n\na) $\\det(A)$\n\nb) $A^{-1}$\n\nc) $AX=\\begin{pmatrix}2\\\\1\\\\3\\end{pmatrix}$`,
        puntuacion:2.5, criterios:"Determinante (0.5 pts), inversa (1.25 pts), sistema (0.75 pts)." },
      { id:"2025-Jl-1B", bloque:"Algebra", opcion:"B",
        enunciado:`Sistema segun $\\lambda$:\n$$\\begin{cases} x+y+z=2 \\\\ x+\\lambda y+2z=3 \\\\ 2x+y+\\lambda z=4 \\end{cases}$$`,
        puntuacion:2.5, criterios:"Rouche-Frobenius (1 pt), discusion (1 pt), resolucion SCD (0.5 pts)." },
      { id:"2025-Jl-2A", bloque:"Analisis", opcion:"A",
        enunciado:`$f(x)=\\dfrac{\\ln x}{x}$ para $x>0$.\n\na) Asintotas.\n\nb) Extremos e inflexion.\n\nc) $\\displaystyle\\int_1^e \\dfrac{\\ln x}{x}\\,dx$`,
        puntuacion:2.5, criterios:"Asintotas (0.5 pts), extremos (1 pt), integral por sustitucion (1 pt)." },
      { id:"2025-Jl-2B", bloque:"Analisis", opcion:"B",
        enunciado:`Area entre $y=\\sin x$ e $y=\\cos x$ en $[0, \\pi]$.`,
        puntuacion:2.5, criterios:"Interseccion (0.5 pts), planteamiento con abs (0.75 pts), calculo (1 pt), resultado (0.25 pts)." },
      { id:"2025-Jl-3A", bloque:"Geometria", opcion:"A",
        enunciado:`Rectas $r: \\frac{x-1}{1}=\\frac{y}{2}=\\frac{z+1}{-1}$ y $s: \\frac{x}{2}=\\frac{y-1}{1}=\\frac{z}{1}$.\n\na) Posicion relativa.\n\nb) Distancia si se cruzan.`,
        puntuacion:2.5, criterios:"Paralelismo (0.5 pts), interseccion (0.75 pts), cruzadas (0.25 pts), distancia (1 pt)." },
      { id:"2025-Jl-3B", bloque:"Geometria", opcion:"B",
        enunciado:`Tetraedro $A(0,0,0)$, $B(1,0,0)$, $C(0,1,0)$, $D(0,0,1)$.\n\na) Volumen.\n\nb) Plano de la cara $BCD$.\n\nc) Distancia de $A$ al plano $BCD$.`,
        puntuacion:2.5, criterios:"Volumen (1 pt), plano BCD (0.75 pts), distancia (0.75 pts)." },
      { id:"2025-Jl-4A", bloque:"Probabilidad", opcion:"A",
        enunciado:`$X\\sim B(n=12, p=0{,}25)$.\n\na) $P(X=3)$\n\nb) $P(X\\leq 2)$\n\nc) Esperanza y varianza`,
        puntuacion:2.5, criterios:"Formula binomial (0.5 pts), a (0.75 pts), b (0.75 pts), E y V (0.5 pts)." },
      { id:"2025-Jl-4B", bloque:"Probabilidad", opcion:"B",
        enunciado:`$X\\sim N(80, 10)$.\n\na) $P(70<X<95)$\n\nb) $P(X<60)$\n\nc) $k$: $P(X>k)=0{,}05$`,
        puntuacion:2.5, criterios:"Tipificacion (0.5 pts), a (0.75 pts), b (0.75 pts), c (0.5 pts)." }
    ]
  },
  {
    id: 4, año: 2024, tipo: "Ordinaria", asignatura: "Matemáticas II", comunidad: "Madrid",
    preguntas: [
      { id: "2024-J-A1", bloque: "Algebra", opcion: "A",
        enunciado: "Se tienen listones de madera de tres longitudes diferentes: largos, intermedios y cortos. Puestos uno tras otro,\ntanto con dos listones largos y cuatro intermedios como con tres intermedios y quince cortos se consigue la\nmisma longitud total. Un listón largo supera en 17 cm la medida de uno intermedio más uno corto. Y con nueve\nlistones cortos hemos de añadir 7 cm para igualar la longitud de uno intermedio seguido por uno largo. Se pide\ncalcular la longitud de cada tipo de listón.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2024-J-A2", bloque: "Analisis", opcion: "A",
        enunciado: `Para la función $f(x) = x^4 + \\pi x^3 + \\pi^2 x^2 + \\pi^3 x + \\pi^4$, se pide:

a) (0.5 puntos) Calcular la ecuación de la recta tangente a la gráfica de $f(x)$ en $x = \\pi$.

b) (1 punto) Probar que $f(x)$ tiene, al menos, un punto con derivada nula en el intervalo $(-\\pi, 0)$ utilizando justificadamente el teorema de Rolle. Probar de nuevo la misma afirmación utilizando adecuadamente, esta vez, el teorema de Bolzano.

c) (1 punto) Si $g(x) = f(-x)$, calcular el área entre las gráficas de $f(x)$ y $g(x)$ en el intervalo $[0, \\pi]$.`,
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2024-J-A3", bloque: "Geometria", opcion: "A",
        enunciado: `Dados los puntos $A(0, 0, 1)$ y $B(1, 1, 0)$, se pide:

a) (1 punto) Hallar una ecuación del plano que pasa por los puntos $A$ y $B$ y es perpendicular al plano $z = 0$.

b) (1.5 puntos) Hallar ecuaciones de dos rectas paralelas, $r_1$ y $r_2$, que pasen por los puntos $A$ y $B$ respectivamente, estén en el plano $x + z = 1$ y tales que la distancia entre ellas sea $1$.`,
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2024-J-A4", bloque: "Probabilidad", opcion: "A",
        enunciado: `Sabiendo que $P(\\overline{A}) = \\dfrac{11}{20}$, $P(A|B) - P(B|A) = \\dfrac{1}{24}$ y $P(A \\cap \\overline{B}) = \\dfrac{3}{10}$, se pide:

a) (1.5 puntos) Calcular $P(A \\cap B)$ y $P(B)$.

b) (1 punto) Calcular $P(C)$, siendo $C$ otro suceso del espacio muestral, independiente de $A$ y que verifica que $P(A \\cup C) = \\dfrac{14}{25}$.`,
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2024-J-B1", bloque: "Algebra", opcion: "B",
        enunciado: `Consideremos las matrices reales

$$A = \\begin{pmatrix}3&-1&1\\\\1&1&1\\\\1&-1&3\\end{pmatrix}, \\quad B = \\begin{pmatrix}b&2b&b\\\\2b&3b&b\\\\b&b&b\\end{pmatrix}, \\quad C = \\begin{pmatrix}2&0&0\\\\0&2&0\\\\0&0&3\\end{pmatrix}$$

con $b \\neq 0$. Se pide:

a) (1.25 puntos) Encontrar todos los valores de $b$ para los que se verifica $BCB^{-1} = A$.

b) (0.75 puntos) Calcular el determinante de la matriz $AA^t$.

c) (0.5 puntos)

Resolver el sistema

$$B\\begin{pmatrix}x\\\\y\\\\z\\end{pmatrix} = \\begin{pmatrix}3\\\\-1\\\\1\\end{pmatrix}$$

para $b = 1$.`,
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2024-J-B2", bloque: "Analisis", opcion: "B",
        enunciado: `Calcule:

a) (1.25 puntos) $\\displaystyle\\int_1^e (x+2)\\ln x\,dx$.

b) (1.25 puntos) $\\displaystyle\\lim_{x \\to \\frac{\\pi}{2}} \\left(\\tan\\frac{x}{2}\\right)^{\\frac{1}{\\cos x}}$.`,
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2024-J-B3", bloque: "Geometria", opcion: "B",
        enunciado: `Al ordenador de una impresora 3D se le suministraron ayer las coordenadas de los cuatro vértices $P_1$, $P_2$, $P_3$ y $P_4$ de un tetraedro sólido, el cual construyó al momento. Se sabe que $P_1(1, 1, 1)$, $P_2(2, 1, 0)$ y $P_3(1, 3, 2)$, pero del cuarto punto $P_4(3, a, 3)$ hoy no estamos seguros del valor de su segunda coordenada.

a) (1.5 puntos) A partir de la cantidad de material utilizado por la impresora sabemos que el volumen del tetraedro es $V = 1$. También sabemos que la longitud de ninguna de sus aristas supera la altura de la impresora, que es de $10$. Determine los posibles valores de $a$.

b) (1 punto) Dado el punto $Q(3, 3, 3)$, se quiere imprimir ahora el paralelepípedo que tiene a los segmentos $P_1P_2$, $P_1P_3$ y $P_1Q$ como aristas. ¿Cuáles serían los valores de las coordenadas de los ocho vértices del paralelepípedo que habría que suministrar al ordenador?`,
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2024-J-B4", bloque: "Probabilidad", opcion: "B",
        enunciado: `Tenemos dos dados no trucados de seis caras, uno azul y uno rojo. Las caras están numeradas del $1$ al $6$. En un determinado juego, lanzamos los dos dados. Para calcular la puntuación obtenida, se sigue el siguiente procedimiento: si el número obtenido en el dado azul es par, se le suma el doble del número obtenido en el dado rojo; si el número obtenido en el dado azul es impar, se le suma el número obtenido en el dado rojo. Se pide:

a) (1 punto) Calcular la probabilidad de obtener una puntuación de $10$. Calcular la probabilidad de obtener una puntuación impar.

b) (1.5 puntos) Calcular la probabilidad de haber obtenido un número par en el dado azul sabiendo que la puntuación final ha sido $8$. Calcular la probabilidad de haber obtenido un número impar en el dado rojo sabiendo que la puntuación final ha sido un número par.`,
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
    ]
  },
  {
    id: 5, año: 2024, tipo: "Extraordinaria", asignatura: "Matemáticas II", comunidad: "Madrid",
    preguntas: [
      { id:"2024-Jl-1A", bloque:"Algebra", opcion:"A",
        enunciado:`Sistema segun $a$ y $b$:\n$$\\begin{cases} x+2y-z=1 \\\\ 2x+ay+z=3 \\\\ x+y+az=b \\end{cases}$$\nDiscute y resuelve para $a=1$.`,
        puntuacion:2.5, criterios:"Rouche-Frobenius (1 pt), discusion segun a (0.75 pts), resolucion a=1 (0.75 pts)." },
      { id:"2024-Jl-1B", bloque:"Algebra", opcion:"B",
        enunciado:`$A=\\begin{pmatrix}1&-1&0\\\\2&1&1\\\\0&1&-1\\end{pmatrix}$.\n\na) $\\det(A)$\n\nb) $A^{-1}$`,
        puntuacion:2.5, criterios:"Determinante (0.75 pts), cofactores (1 pt), inversa (0.75 pts)." },
      { id:"2024-Jl-2A", bloque:"Analisis", opcion:"A",
        enunciado:`$f(x)=xe^{-x}$: dominio, asintotas, monotonia, extremos, inflexion y grafica.`,
        puntuacion:2.5, criterios:"Dominio y asintotas (0.5 pts), monotonia y extremos (0.75 pts), inflexion (0.75 pts), grafica (0.5 pts)." },
      { id:"2024-Jl-2B", bloque:"Analisis", opcion:"B",
        enunciado:`$\\displaystyle\\int_1^e \\dfrac{\\ln x}{x}\\,dx$ y area de la region acotada.`,
        puntuacion:2.5, criterios:"Integral por sustitucion (1.5 pts), area (1 pt)." },
      { id:"2024-Jl-3A", bloque:"Geometria", opcion:"A",
        enunciado:`$P(2,1,-1)$ y $\\pi: x-2y+2z+3=0$.\n\na) Distancia de $P$ a $\\pi$.\n\nb) Punto simetrico.\n\nc) Recta perpendicular.`,
        puntuacion:2.5, criterios:"Distancia (0.75 pts), pie perpendicular (0.75 pts), simetrico (0.5 pts), recta (0.5 pts)." },
      { id:"2024-Jl-3B", bloque:"Geometria", opcion:"B",
        enunciado:`$A(1,0,1)$, $B(0,1,1)$, $C(1,1,0)$.\n\na) Plano por $A$, $B$, $C$.\n\nb) Area del triangulo $ABC$.\n\nc) Distancia del origen al plano.`,
        puntuacion:2.5, criterios:"Plano (1 pt), area (0.75 pts), distancia (0.75 pts)." },
      { id:"2024-Jl-4A", bloque:"Probabilidad", opcion:"A",
        enunciado:`Piezas defectuosas siguen Poisson $\\lambda=2$/hora.\n\na) P(exactamente 3 defectuosas en 1 h)\n\nb) P(maximo 2 en 1 h)\n\nc) En 8 h, P(mas de 20) — aproxima por normal`,
        puntuacion:2.5, criterios:"Poisson (0.5 pts), a (0.75 pts), b (0.75 pts), aproximacion normal (0.5 pts)." },
      { id:"2024-Jl-4B", bloque:"Probabilidad", opcion:"B",
        enunciado:`$X\\sim N(75, 8)$.\n\na) $P(67<X<91)$\n\nb) $P(X<60)$\n\nc) $k$: $P(X<k)=0{,}9$`,
        puntuacion:2.5, criterios:"Tipificacion (0.5 pts), a (0.75 pts), b (0.75 pts), c (0.5 pts)." }
    ]
  },
  {
    id: 6, año: 2023, tipo: "Ordinaria", asignatura: "Matemáticas II", comunidad: "Madrid",
    preguntas: [
      { id: "2023-J-A1", bloque: "Algebra", opcion: "A",
        enunciado: "En una obra, para transportar la tierra extraída para la construcción de los cimientos de un edificio, se usan tres\ntipos de camiones diferentes: A, B y C. Los camiones de tipo A tienen una capacidad de 14 toneladas, los de\ntipo B, de 24 toneladas y los de tipo C, de 28 toneladas. Habría que traer un camión más de tipo A para igualar\nal número de camiones restantes. El 10 % de la capacidad de todos los camiones tipo B supone un séptimo de la\nde los de mayor tonelaje. Hoy, realizando un único viaje cada camión a máxima capacidad, se han extraído de la\nobra 302 toneladas de tierra. ¿Cuánta tierra ha sido transportada hoy por los camiones de cada tipo?",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2023-J-A2", bloque: "Analisis", opcion: "A",
        enunciado: `Dada la función $f(x) = \\sqrt[3]{(x^2-1)^2}$, se pide:

a) (0.25 puntos) Estudiar si es par o impar.

b) (0.75 puntos) Estudiar su derivabilidad en el punto $x = 1$.

c) (1.5 puntos) Estudiar sus extremos relativos y absolutos.`,
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2023-J-A3", bloque: "Geometria", opcion: "A",
        enunciado: "Sean los puntos $A(1, -2, 3)$, $B(0, 2, -1)$ y $C(2, 1, 0)$. Se pide:\n\na) (1.25 puntos) Comprobar que forman un triángulo $T$ y hallar una ecuación del plano que los contiene.\n\nb) (0.75 puntos) Calcular el corte de la recta que pasa por los puntos $A$ y $B$ con el plano $z = 1$.\n\nc) (0.5 puntos) Determinar el perímetro del triángulo $T$.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2023-J-A4", bloque: "Probabilidad", opcion: "A",
        enunciado: "Se tiene un suceso A de probabilidad P (A) = 0.3.\n\na) (0.75 puntos) Un suceso B de probabilidad P (B) = 0.5 es independiente de A. Calcule P (A ∪ B).\n\nb) (0.75 puntos) Otro suceso C cumple P (C | A) = 0.5. Determine P (A ∩ C).\n\nc) (1 punto) Si se tiene un suceso D tal que P (A | D) = 0.2 y P (D | A) = 0.5, calcule P (D).",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2023-J-B1", bloque: "Algebra", opcion: "B",
        enunciado: `Dado el sistema
$$\\begin{cases}(a+1)x + 4y = 0 \\\\ (a-1)y + z = 3 \\\\ 4x + 2ay + z = 3\\end{cases}$$
se pide:

a) (1.25 puntos) Discutirlo en función del parámetro $a$.

b) (0.5 puntos) Resolverlo para $a = 3$.

c) (0.75 puntos) Resolverlo para $a = 5$.`,
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2023-J-B2", bloque: "Analisis", opcion: "B",
        enunciado: `Dada la función real de variable real definida sobre su dominio como
$$f(x) = \\begin{cases} \\dfrac{x^2}{2+x^2} & \\text{si } x \\leq -1 \\\\ \\dfrac{2x^2}{3} - 3x & \\text{si } x > -1 \\end{cases}$$
se pide:

a) (0.75 puntos) Estudiar la continuidad de la función en $\\mathbb{R}$.

b) (1 punto) Calcular el siguiente límite: $\\displaystyle\\lim_{x \\to -\\infty} f(x)^{2x^2-1}$.

c) (0.75 puntos) Calcular la siguiente integral: $\\displaystyle\\int_{-1}^{0} f(x)\,dx$.`,
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2023-J-B3", bloque: "Geometria", opcion: "B",
        enunciado: `Dada la recta $r \\equiv \\dfrac{x-1}{2} = \\dfrac{y}{1} = \\dfrac{z+1}{-2}$, el plano $\\pi: x - z = 2$ y el punto $A(1, 1, 1)$, se pide:

a) (0.75 puntos) Estudiar la posición relativa de $r$ y $\\pi$ y calcular su intersección, si existe.

b) (0.75 puntos) Calcular la proyección ortogonal del punto $A$ sobre el plano $\\pi$.

c) (1 punto) Calcular el punto simétrico del punto $A$ con respecto a la recta $r$.`,
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2023-J-B4", bloque: "Probabilidad", opcion: "B",
        enunciado: "La longitud de la sardina del Pacífico (Sardinops sagax) se puede considerar que es una variable aleatoria con\ndistribución normal de media 175 mm y desviación típica 25.75 mm.\n\na) (1 punto) Una empresa envasadora de esta variedad de sardinas solo admite como sardinas de calidad\naquellas con una longitud superior a 16 cm. ¿Qué porcentaje de las sardinas capturadas por un buque\npesquero serán de la calidad que espera la empresa envasadora?\n\nb) (0.5 puntos) Hallar una longitud t < 175 mm tal que entre t y 175 mm estén el 18 % de las sardinas cap-\nturadas.\n\nc) (1 punto) En altamar se procesan las sardinas en lotes de 10. Posteriormente se devuelven al mar las\nsardinas de cada lote que son menores de 15 cm por considerarlas pequeñas. ¿Cuál es la probabilidad de\nque en un lote haya al menos una sardina devuelta por pequeña?",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
    ]
  },
  {
    id: 7, año: 2023, tipo: "Extraordinaria", asignatura: "Matemáticas II", comunidad: "Madrid",
    preguntas: [
      { id:"2023-Jl-1A", bloque:"Algebra", opcion:"A",
        enunciado:`$A=\\begin{pmatrix}1&-1&0\\\\2&1&3\\\\0&1&-1\\end{pmatrix}$.\n\na) $\\det(A)$\n\nb) $A^{-1}$`,
        puntuacion:2.5, criterios:"Determinante (1 pt), inversa (1.5 pts)." },
      { id:"2023-Jl-1B", bloque:"Algebra", opcion:"B",
        enunciado:`Sistema segun $a$ y $b$:\n$$\\begin{cases} x+2y+z=3 \\\\ 2x-y+az=1 \\\\ x+y+2z=b \\end{cases}$$`,
        puntuacion:2.5, criterios:"Rouche-Frobenius (1 pt), discusion (1 pt), resolucion (0.5 pts)." },
      { id:"2023-Jl-2A", bloque:"Analisis", opcion:"A",
        enunciado:`Area acotada por $y=x^2$ e $y=2x$.`,
        puntuacion:2.5, criterios:"Interseccion (0.5 pts), integral (1.5 pts), resultado (0.5 pts)." },
      { id:"2023-Jl-2B", bloque:"Analisis", opcion:"B",
        enunciado:`$f(x)=x^3-3x^2+2$: extremos, inflexion, grafica y $\\displaystyle\\int_0^2 f(x)\\,dx$.`,
        puntuacion:2.5, criterios:"Extremos (0.75 pts), inflexion (0.5 pts), grafica (0.5 pts), integral (0.75 pts)." },
      { id:"2023-Jl-3A", bloque:"Geometria", opcion:"A",
        enunciado:`$r: \\frac{x-1}{1}=\\frac{y}{2}=\\frac{z+1}{-1}$ y $s: \\frac{x}{2}=\\frac{y-1}{1}=\\frac{z}{1}$.\n\na) Posicion relativa.\n\nb) Distancia si se cruzan.`,
        puntuacion:2.5, criterios:"Paralelismo (0.5 pts), interseccion (0.75 pts), cruzadas (0.25 pts), distancia (1 pt)." },
      { id:"2023-Jl-3B", bloque:"Geometria", opcion:"B",
        enunciado:`$P(1,-1,2)$ y $\\pi: 2x-y+2z-7=0$.\n\na) Distancia $P$ a $\\pi$.\n\nb) Simetrico de $P$.`,
        puntuacion:2.5, criterios:"Distancia (0.75 pts), pie perpendicular (0.75 pts), simetrico (1 pt)." },
      { id:"2023-Jl-4A", bloque:"Probabilidad", opcion:"A",
        enunciado:`$X\\sim B(n=10, p=0{,}3)$.\n\na) $P(X=3)$\n\nb) $P(X\\geq 2)$\n\nc) Esperanza y varianza`,
        puntuacion:2.5, criterios:"Binomial (0.5 pts), a (0.75 pts), b por complementario (0.75 pts), E y V (0.5 pts)." },
      { id:"2023-Jl-4B", bloque:"Probabilidad", opcion:"B",
        enunciado:`$X\\sim N(50,10)$.\n\na) $P(40<X<65)$\n\nb) $k$: $P(X>k)=0{,}1587$\n\nc) Con $n=25$, P(media $> 53$)`,
        puntuacion:2.5, criterios:"Tipificacion (0.5 pts), a (0.75 pts), b (0.75 pts), media muestral (0.5 pts)." }
    ]
  },
  {
    id: 8, año: 2022, tipo: "Ordinaria", asignatura: "Matemáticas II", comunidad: "Madrid",
    preguntas: [
      { id: "2022-J-A1", bloque: "Algebra", opcion: "A",
        enunciado: `Dado el siguiente sistema de ecuaciones lineales dependientes del parámetro real $m$:
$$\\begin{cases} x - 2my + z = 1 \\\\ mx + 2y - z = -1 \\\\ x - y + z = 1 \\end{cases}$$

a) (2 puntos) Discuta el sistema en función de los valores de $m$.

b) (0.5 puntos) Resuelva el sistema para el valor $m = \\dfrac{1}{2}$.`,
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2022-J-A2", bloque: "Analisis", opcion: "A",
        enunciado: `Sea la función
$$f(x) = \\begin{cases} x^3 e^{-1/x^2} & \\text{si } x \\neq 0 \\\\ 0 & \\text{si } x = 0 \\end{cases}$$

a) (1 punto) Estudie la continuidad y derivabilidad de $f(x)$ en $x = 0$.

b) (0.5 puntos) Estudie si $f(x)$ presenta algún tipo de simetría par o impar.

c) (1 punto) Calcule la siguiente integral: $\\displaystyle\\int_1^2 \\dfrac{f(x)}{x^6}\,dx$.`,
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2022-J-A3", bloque: "Geometria", opcion: "A",
        enunciado: `Con un dispositivo láser situado en el punto $P(1, 1, 1)$ se ha podido seguir la trayectoria de una partícula que se desplaza sobre la recta de ecuaciones $$r \\equiv \\begin{cases} 2x - y = 10 \\\\ x - z = -90 \\end{cases}$$.

a) (0.5 puntos) Calcule un vector director de $r$ y la posición de la partícula cuando su trayectoria incide con el plano $z = 0$.

b) (1.25 puntos) Calcule la posición más próxima de la partícula al dispositivo láser.

c) (0.75 puntos) Determine el ángulo entre el plano de ecuación $x + y = 2$ y la recta $r$.`,
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2022-J-A4", bloque: "Probabilidad", opcion: "A",
        enunciado: "Según el Instituto Nacional de Estadística, durante el último trimestre de 2020, el porcentaje de mujeres que\npertenecía al conjunto de Consejos de Administración de las empresas que componen el Ibex-35 fue del 27.7 %.\nSe reunieron 10 de estos consejeros.\n\na) (0.75 puntos) Halle la probabilidad de que la mitad fueran mujeres.\n\nb) (0.75 puntos) Calcule la probabilidad de que hubiese al menos un hombre.\n\nc) (1 punto) Determine, aproximando mediante una distribución normal, la probabilidad de que en un congreso\nde doscientos consejeros de estas empresas hubiera como mínimo un 35 % de representación femenina.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2022-J-B1", bloque: "Algebra", opcion: "B",
        enunciado: "Tres primos, Pablo, Alejandro y Alicia, se van a repartir un premio de 9450 euros de forma directamente propor-\ncional a sus edades. La suma de las edades de Pablo y Alejandro excede en tres años al doble de la edad de\nAlicia. Además, la edad de los tres primos juntos es de 45 años. Sabiendo que en el reparto del premio Pablo\nrecibe 420 euros más que Alicia, calcule las edades de los tres primos y el dinero que recibe cada uno por el\npremio.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2022-J-B2", bloque: "Analisis", opcion: "B",
        enunciado: `Sea la función $f(x) = \\dfrac{x}{x^2+1}$.

a) (0.5 puntos) Compruebe si $f(x)$ verifica las hipótesis del Teorema de Bolzano en el intervalo $[-1, 1]$.

b) (1 punto) Calcule y clasifique los extremos relativos de $f(x)$ en $\\mathbb{R}$.

c) (1 punto) Determine el área comprendida entre la gráfica de la función $f(x)$ y el eje $OX$ en el intervalo $[-1, 1]$.`,
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2022-J-B3", bloque: "Geometria", opcion: "B",
        enunciado: `Sean el plano $\\pi \\equiv x + y + z = 1$, la recta $$r_1 \\equiv \\begin{cases} x = 1 + \\lambda \\\\ y = 1 - \\lambda \\\\ z = -1 \\end{cases}$$, $\\lambda \\in \\mathbb{R}$, y el punto $P(0, 1, 0)$.

a) (0.5 puntos) Verifique que la recta $r_1$ está contenida en el plano $\\pi$ y que el punto $P$ pertenece al mismo plano.

b) (0.75 puntos) Halle una ecuación de la recta contenida en el plano $\\pi$ que pase por $P$ y sea perpendicular a $r_1$.

c) (1.25 puntos) Calcule una ecuación de la recta $r_2$ que pase por $P$ y sea paralela a $r_1$. Halle el área de un cuadrado que tenga dos de sus lados sobre las rectas $r_1$ y $r_2$.`,
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2022-J-B4", bloque: "Probabilidad", opcion: "B",
        enunciado: "De una cesta con 6 sombreros blancos y 3 negros se elige uno al azar. Si el sombrero es blanco, se toma, al azar,\nun pañuelo de un cajón que contiene 2 blancos, 2 negros y 5 con cuadros blancos y negros. Si el sombrero es\nnegro, se elige, al azar, un pañuelo de otro cajón que contiene 2 pañuelos blancos, 4 negros y 4 con cuadros\nblancos y negros. Se pide:\n\na) (1 punto) Calcular la probabilidad de que en el pañuelo aparezca algún color que no sea el del sombrero.\n\nb) (0.5 puntos) Calcular la probabilidad de que en al menos uno de los complementos (sombrero o pañuelo)\naparezca el color negro.\n\nc) (1 punto) Calcular la probabilidad de que el sombrero haya sido negro, sabiendo que el pañuelo ha sido de\ncuadros.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
    ]
  },
  {
    id: 9, año: 2022, tipo: "Extraordinaria", asignatura: "Matemáticas II", comunidad: "Madrid",
    preguntas: [
      { id:"2022-Jl-1A", bloque:"Algebra", opcion:"A",
        enunciado:`Familia $A_k=\\begin{pmatrix}k&1\\\\2&k-1\\end{pmatrix}$.\n\na) Valores de $k$ para los que $A_k$ no es invertible.\n\nb) Para $k=2$, resuelve $A_kX=\\begin{pmatrix}3\\\\1\\end{pmatrix}$.`,
        puntuacion:2.5, criterios:"Determinante en k (0.75 pts), valores k (0.75 pts), sistema k=2 (1 pt)." },
      { id:"2022-Jl-1B", bloque:"Algebra", opcion:"B",
        enunciado:`Sistema segun $m$:\n$$\\begin{cases}x+y-z=2\\\\x+my+z=m\\\\2x+y+mz=3\\end{cases}$$`,
        puntuacion:2.5, criterios:"Rouche-Frobenius (1 pt), discusion (1 pt), resolucion (0.5 pts)." },
      { id:"2022-Jl-2A", bloque:"Analisis", opcion:"A",
        enunciado:`$f(x)=\\dfrac{x^2}{x^2-4}$: dominio, asintotas, monotonia y grafica.`,
        puntuacion:2.5, criterios:"Dominio y asintotas (0.75 pts), monotonia (1 pt), grafica (0.75 pts)." },
      { id:"2022-Jl-2B", bloque:"Analisis", opcion:"B",
        enunciado:`Area entre $y=x^3$ e $y=x$.`,
        puntuacion:2.5, criterios:"Interseccion (0.5 pts), planteamiento (0.75 pts), calculo (1 pt), resultado (0.25 pts)." },
      { id:"2022-Jl-3A", bloque:"Geometria", opcion:"A",
        enunciado:`$\\pi_1:x-y+z=2$ y $\\pi_2:2x+y-z=1$.\n\na) Posicion relativa.\n\nb) Recta interseccion.\n\nc) Plano perp. a $\\pi_1$ por la recta.`,
        puntuacion:2.5, criterios:"Posicion (0.5 pts), recta (1 pt), plano (1 pt)." },
      { id:"2022-Jl-3B", bloque:"Geometria", opcion:"B",
        enunciado:`$A(1,2,0)$, $B(0,1,1)$, $C(2,0,1)$.\n\na) Plano por $ABC$.\n\nb) Area del triangulo.\n\nc) Distancia del origen al plano.`,
        puntuacion:2.5, criterios:"Plano (1 pt), area (0.75 pts), distancia (0.75 pts)." },
      { id:"2022-Jl-4A", bloque:"Probabilidad", opcion:"A",
        enunciado:`$X\\sim N(100,15)$.\n\na) $P(X>115)$\n\nb) $P(85<X<115)$\n\nc) $k$: $P(X<k)=0{,}9$`,
        puntuacion:2.5, criterios:"Tipificacion (0.5 pts), a (0.75 pts), b (0.75 pts), c (0.5 pts)." },
      { id:"2022-Jl-4B", bloque:"Probabilidad", opcion:"B",
        enunciado:`$X\\sim B(n=8, p=0{,}4)$.\n\na) $P(X=3)$\n\nb) $P(X\\geq 2)$\n\nc) Esperanza y varianza`,
        puntuacion:2.5, criterios:"Binomial (0.5 pts), a (0.75 pts), b (0.75 pts), E y V (0.5 pts)." }
    ]
  },
  {
    id: 10, año: 2021, tipo: "Ordinaria", asignatura: "Matemáticas II", comunidad: "Madrid",
    preguntas: [
      { id: "2021-J-A1", bloque: "Algebra", opcion: "A",
        enunciado: "Tres hermanos quieren repartirse de forma equitativa un total de 540 acciones valoradas en 1560 euros, que\ncorresponden a tres empresas A,B y C. Sabiendo que el valor actual en bolsa de la acción A es el triple que el de\nB y la mitad que el de C, que el número de acciones de C es la mitad que el de B y que el actual valor en bolsa\nde la acción B es 1 euro, encuentre el número de cada tipo de acción que le corresponde a cada hermano.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2021-J-A2", bloque: "Analisis", opcion: "A",
        enunciado: "Calcule el área de la región delimitada por las gráficas de las funciones\nf (x) = 2 + x − x2, g(x) = 2x2 − 4x.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2021-J-A3", bloque: "Geometria", opcion: "A",
        enunciado: `Sean la recta $$r \\equiv \\begin{cases} -x - y + z = 0 \\\\ 2x + 3y - z + 1 = 0 \\end{cases}$$ y el plano $\\pi \\equiv 2x + y - z + 3 = 0$. Se pide:

a) (0.75 puntos) Calcular el ángulo que forman $r$ y $\\pi$.

b) (1 punto) Hallar el simétrico del punto de intersección de la recta $r$ y el plano $\\pi$ con respecto al plano $z - y = 0$.

c) (0.75 puntos) Determinar la proyección ortogonal de la recta $r$ sobre el plano $\\pi$.`,
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2021-J-A4", bloque: "Probabilidad", opcion: "A",
        enunciado: "El tiempo de vida de los individuos de cierta especie animal tiene una distribución normal con una media de 8.8\nmeses y una desviación típica de 3 meses.\n\na) (1 punto) ¿Qué porcentaje de individuos de esta especie supera los 10 meses? ¿Qué porcentaje de indivi-\nduos ha vivido entre 7 y 10 meses?\n\nb) (1 punto) Si se toman al azar 4 especímenes, ¿cuál es la probabilidad de que al menos uno no supere los\n10 meses de vida?\n\nc) (0.5 puntos) ¿Qué valor de c es tal que el intervalo (8.8 − c, 8.8 + c) incluye el tiempo de vida (medido en\nmeses) del 98 % de los individuos de esta especie?",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2021-J-B1", bloque: "Algebra", opcion: "B",
        enunciado: `Se considera el siguiente sistema de ecuaciones dependientes del parámetro real $a$:
$$\\begin{cases} ax - 2y + (a-1)z = 4 \\\\ -2x + 3y - 6z = 2 \\\\ -ax + y - 6z = 6 \\end{cases}$$

a) (2 puntos) Discuta el sistema según los diferentes valores de $a$.

b) (0.5 puntos) Resuelva el sistema para $a = 1$.`,
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2021-J-B2", bloque: "Analisis", opcion: "B",
        enunciado: `Se considera la función
$$f(x) = \\begin{cases} \\sin x & \\text{si } x < 0 \\\\ x e^x & \\text{si } x \\geq 0 \\end{cases}$$

a) (0.75 puntos) Estudie la continuidad y la derivabilidad de $f$ en $x = 0$.

b) (1 punto) Estudie los intervalos de crecimiento y decrecimiento de $f$ restringida a $(-\\pi, 2)$. Demuestre que existe un punto $x_0 \\in [0, 1]$ de manera que $f(x_0) = 2$.

c) (0.75 puntos) Calcule $\\displaystyle\\int_{-\\pi/2}^{1} f(x)\,dx$.`,
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2021-J-B3", bloque: "Geometria", opcion: "B",
        enunciado: "Sean los planos $\\pi_1 \\equiv x + y = 1$ y $\\pi_2 \\equiv x + z = 1$.\n\na) (1.5 puntos) Halle los planos paralelos al plano $\\pi_1$ tales que su distancia al origen de coordenadas sea $2$.\n\nb) (0.5 puntos) Halle la recta que pasa por el punto $(0, 2, 0)$ y es perpendicular al plano $\\pi_2$.\n\nc) (0.5 puntos) Halle la distancia entre los puntos de intersección del plano $\\pi_1$ con los ejes $x$ e $y$.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2021-J-B4", bloque: "Probabilidad", opcion: "B",
        enunciado: "Una estación de medición de calidad del aire mide niveles de NO2 y de partículas en suspensión. La probabilidad\nde que en un día se mida un nivel de NO2 superior al permitido es 0.16. En los días en los que se supera el nivel\npermitido de NO2, la probabilidad de que se supere el nivel permitido de partículas es 0.33. En los días en los\nque no se supera el nivel de NO2, la probabilidad de que se supere el nivel de partículas es 0.08.\n\na) (0.5 puntos) ¿Cuál es la probabilidad de que en un día se superen los dos niveles permitidos?\n\nb) (0.75 puntos) ¿Cuál es la probabilidad de que se supere al menos uno de los dos?\n\nc) (0.5 puntos) ¿Son independientes los sucesos “en un día se supera el nivel permitido de NO2” y “en un día\nse supera el nivel permitido de partículas”?\n\nd) (0.75 puntos) ¿Cuál es la probabilidad de que en un día se supere el nivel permitido de NO2, sabiendo que\nno se ha superado el nivel permitido de partículas?",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
    ]
  },
  {
    id: 11, año: 2020, tipo: "Ordinaria", asignatura: "Matemáticas II", comunidad: "Madrid",
    preguntas: [
      { id: "2020-J-A1", bloque: "Algebra", opcion: "A",
        enunciado: `Se considera el siguiente sistema de ecuaciones dependientes del parámetro real $a$:
$$\\begin{cases} x + ay + z = a+1 \\\\ -ax + y - z = 2a \\\\ -y + z = a \\end{cases}$$

Se pide:

a) (2 puntos) Discutir el sistema según los diferentes valores de $a$.

b) (0.5 puntos) Resolver el sistema para $a = 0$.`,
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2020-J-A2", bloque: "Analisis", opcion: "A",
        enunciado: `Dadas las funciones $f(x) = x^3 + 3x^2 - 1$ y $g(x) = 6x$, se pide:

a) (0.5 puntos) Justificar, usando el teorema adecuado, que existe algún punto en el intervalo $[1, 10]$ en el que ambas funciones toman el mismo valor.

b) (1 punto) Calcular la ecuación de la recta tangente a la curva $y = f(x)$ con pendiente mínima.

c) (1 punto) Calcular $\\displaystyle\\int_1^2 \\dfrac{f(x)}{g(x)}\,dx$.`,
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2020-J-A3", bloque: "Geometria", opcion: "A",
        enunciado: `Dadas las rectas $$r \\equiv \\begin{cases} x - y = 2 \\\\ 3x - z = -1 \\end{cases}, \\qquad s \\equiv \\begin{cases} x = -1 + 2\\lambda \\\\ y = -4 - \\lambda \\\\ z = \\lambda \\end{cases}$$, se pide:

a) (1 punto) Calcular la posición relativa de las rectas $r$ y $s$.

b) (0.5 puntos) Hallar la ecuación del plano perpendicular a la recta $r$ y que pasa por el punto $P(2, -1, 5)$.

c) (1 punto) Encontrar la ecuación del plano paralelo a la recta $r$ que contiene a la recta $s$.`,
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2020-J-A4", bloque: "Probabilidad", opcion: "A",
        enunciado: "Un arquero aficionado dispone de 4 flechas y dispara a un globo colocado en el centro de una diana. La proba-\nbilidad de alcanzar el blanco en el primer tiro es del 30%. En los lanzamientos sucesivos la puntería se va\nafinando, de manera que en el segundo es del 40%, en el tercero del 50% y en el cuarto del 60%. Se pide:\n\na) (1 punto) Calcular la probabilidad de que el globo haya explotado sin necesidad de hacer el cuarto disparo.\n\nb) (0.5 puntos) Calcular la probabilidad de que el globo siga intacto tras el cuarto disparo.\n\nc) (1 punto) En una exhibición participan diez arqueros profesionales, que aciertan un 85% de sus lanzamien-\ntos. Calcular la probabilidad de que entre los 10 hayan explotado exactamente 6 globos al primer disparo.\nTodas las respuestas deberán estar debidamente justificadas.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2020-J-B1", bloque: "Algebra", opcion: "B",
        enunciado: "Según informa la Asociación Empresarial de Acuicultura de España, durante el año 2016 se comercializaron\nen España doradas, lubinas y rodaballos por un total de 275.8 millones de euros. En dicho informe figura que\nse comercializaron un total de 13740 toneladas de doradas y 23440 toneladas de lubinas. En cuanto a los\nrodaballos, se vendieron 7400 toneladas por un valor de 63.6 millones de euros. Sabiendo que el kilo de dorada\nfue 11 céntimos más caro que el kilo de lubina, se pide calcular el precio del kilo de cada uno de los tres tipos de\npescado anteriores.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2020-J-B2", bloque: "Analisis", opcion: "B",
        enunciado: `Sea la función
$$f(x) = \\begin{cases} (x-1)^2 & \\text{si } x \\leq 1 \\\\ (x-1)^3 & \\text{si } x > 1 \\end{cases}$$

a) (0.5 puntos) Estudie su continuidad en $[-4, 4]$.

b) (1 punto) Analice su derivabilidad y crecimiento en $[-4, 4]$.

c) (1 punto) Determine si la función $g(x) = f'(x)$ está definida, es continua y es derivable en $x = 1$.`,
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2020-J-B3", bloque: "Geometria", opcion: "B",
        enunciado: "Dados los puntos $P(-3, 1, 2)$ y $Q(-1, 0, 1)$ y el plano $\\pi$ de ecuación $x + 2y - 3z = 4$, se pide:\n\na) (1 punto) Hallar la proyección de $Q$ sobre $\\pi$.\n\nb) (0.5 puntos) Escribir la ecuación del plano paralelo a $\\pi$ que pasa por el punto $P$.\n\nc) (1 punto) Escribir la ecuación del plano perpendicular a $\\pi$ que contiene a los puntos $P$ y $Q$.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2020-J-B4", bloque: "Probabilidad", opcion: "B",
        enunciado: "Se consideran dos sucesos A y B tales que P (A) = 0.5, P (B) = 0.25 y P (A ∩ B) = 0.125. Responder de manera\nrazonada o calcular lo que se pide en los siguientes casos:\n\na) (0.5 puntos) Sea C otro suceso, incompatible con A y con B. ¿Son compatibles los sucesos C y A ∪ B?\n\nb) (0.5 puntos) ¿Son A y B independientes?\n\nc) (0.75 puntos) Calcular la probabilidad P ( ¯\tA ∩ ¯\tB) (donde ¯\tA denota el suceso complementario al suceso A).\n\nd) (0.75 puntos) Calcular P ( ¯\tB|A).",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
    ]
  },
  {
    id: 12, año: 2019, tipo: "Ordinaria", asignatura: "Matemáticas II", comunidad: "Madrid",
    preguntas: [
      { id: "2019-J-A1", bloque: "Algebra", opcion: "A",
        enunciado: `Dadas las matrices $A = \\begin{pmatrix}1&3&4&1\\\\1&a&2&2-a\\\\-1&2&a&a-2\\end{pmatrix}$ y $M = \\begin{pmatrix}1&0&0\\\\0&1&0\\\\0&0&0\\\\0&0&1\\end{pmatrix}$, se pide:

a) (1.5 puntos) Estudiar el rango de $A$ en función del parámetro real $a$.

b) (1 punto) Calcular, si es posible, la inversa de la matriz $AM$ para el caso $a = 0$.`,
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2019-J-A2", bloque: "Analisis", opcion: "A",
        enunciado: `Dada $f(x) = \\dfrac{\\ln x}{x}$, donde $\\ln$ denota el logaritmo neperiano, definida para $x > 0$, se pide:

a) (0.5 puntos) Calcular, en caso de que exista, una asíntota horizontal de la curva $y = f(x)$.

b) (1 punto) Encontrar un punto de la curva $y = f(x)$ en el que la recta tangente a dicha curva sea horizontal y analizar si dicho punto es un extremo relativo.

c) (1 punto) Calcular el área del recinto acotado limitado por la curva $y = f(x)$ y las rectas $y = 0$ y $x = e$.`,
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2019-J-A3", bloque: "Geometria", opcion: "A",
        enunciado: `Dadas la recta $r \\equiv \\dfrac{x-1}{2} = \\dfrac{y-3}{-2} = \\dfrac{z}{1}$ y la recta $s$ que pasa por el punto $(2, -5, 1)$ y tiene dirección $(-1, 0, -1)$, se pide:

a) (1 punto) Estudiar la posición relativa de las dos rectas.

b) (1 punto) Calcular un plano que sea paralelo a $r$ y contenga a $s$.

c) (0.5 puntos) Calcular un plano perpendicular a la recta $r$ y que pase por el origen de coordenadas.`,
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2019-J-A4", bloque: "Probabilidad", opcion: "A",
        enunciado: "La probabilidad de que un pez de una determinada especie sobreviva más de 5 años es del 10 %. Se pide:\n\na) (1 punto) Si en un acuario tenemos 10 peces de esta especie nacidos este año, hallar la probabilidad de\nque al menos dos de ellos sigan vivos dentro de 5 años.\n\nb) (1.5 puntos) Si en un tanque de una piscifactoría hay 200 peces de esta especie nacidos este mismo año,\nusando una aproximación mediante la distribución normal correspondiente, hallar la probabilidad de que al\ncabo de 5 años hayan sobrevivido al menos 10 de ellos.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2019-J-B1", bloque: "Algebra", opcion: "B",
        enunciado: "Una estudiante pidió en la cafetería 3 bocadillos, 2 refrescos y 2 bolsas de patatas y pagó un total de 19 euros.\nAl mirar la cuenta comprobó que le habían cobrado un bocadillo y una bolsa de patatas de más. Reclamó y le\ndevolvieron 4 euros.\nPara compensar el error, el vendedor le ofreció llevarse un bocadillo y un refresco por solo 3 euros, lo que suponía\nun descuento del 40 % respecto a sus precios originales. ¿Cuáles eran los respectivos precios sin descuento de\nun bocadillo, de un refresco y de una bolsa de patatas?",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2019-J-B2", bloque: "Analisis", opcion: "B",
        enunciado: `Dada la función $f(x) = \\sqrt{4x^2 - x^4}$, se pide:

a) (0.5 puntos) Determinar su dominio.

b) (1.5 puntos) Determinar sus intervalos de crecimiento y de decrecimiento.

c) (0.5 puntos) Calcular los límites laterales $\\displaystyle\\lim_{x \\to 0^-} \\dfrac{f(x)}{x}$ y $\\displaystyle\\lim_{x \\to 0^+} \\dfrac{f(x)}{x}$.`,
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2019-J-B3", bloque: "Geometria", opcion: "B",
        enunciado: `Dados el punto $A(2, 1, 0)$ y el plano $\\pi \\equiv 2x + 3y + 4z = 36$, se pide:

a) (0.75 puntos) Determinar la distancia del punto $A$ al plano $\\pi$.

b) (1 punto) Hallar las coordenadas del punto del plano $\\pi$ más próximo al punto $A$.

c) (0.75 puntos) Hallar el punto simétrico de $A$ respecto al plano $\\pi$.`,
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2019-J-B4", bloque: "Probabilidad", opcion: "B",
        enunciado: "Una compañía farmacéutica vende un medicamento que alivia la dermatitis atópica en un 80 % de los casos.\nSi un enfermo es tratado con un placebo, la probabilidad de mejoría espontánea es del 10 %. En un estudio\nexperimental, la mitad de los pacientes han sido tratados con el medicamento y la otra mitad con un placebo.\n\na) (1 punto) Determinar cuál es la probabilidad de que un paciente elegido al azar haya mejorado.\n\nb) (1.5 puntos) Si un paciente elegido al azar ha mejorado, hallar la probabilidad de que haya sido tratado con\nel medicamento.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
    ]
  },
  {
    id: 13, año: 2018, tipo: "Ordinaria", asignatura: "Matemáticas II", comunidad: "Madrid",
    preguntas: [
      { id: "2018-J-A1", bloque: "Algebra", opcion: "A",
        enunciado: `Dado el sistema de ecuaciones
$$\\begin{cases} x + my = 1 \\\\ -2x - (m+1)y + z = -1 \\\\ x + (2m-1)y + (m+2)z = 2+2m \\end{cases}$$
se pide:

a) (2 puntos) Discutir el sistema en función del parámetro $m$.

b) (0.5 puntos) Resolver el sistema en el caso $m = 0$.`,
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2018-J-A2", bloque: "Analisis", opcion: "A",
        enunciado: `a) (1.5 puntos) En un experimento en un laboratorio se han realizado 5 medidas del mismo objeto, que han dado los resultados siguientes: $m_1 = 0.92$, $m_2 = 0.94$, $m_3 = 0.89$, $m_4 = 0.90$, $m_5 = 0.91$. Se tomará como resultado el valor de $x$ tal que la suma de los cuadrados de los errores sea mínima. Es decir, el valor para el que la función $E(x) = (x-m_1)^2 + (x-m_2)^2 + \\cdots + (x-m_5)^2$ alcanza el mínimo. Calcule dicho valor $x$.

b) (1 punto) Aplique el método de integración por partes para calcular la integral $\\displaystyle\\int_1^2 x^2 \\ln(x)\,dx$, donde $\\ln$ significa logaritmo neperiano.`,
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2018-J-A3", bloque: "Geometria", opcion: "A",
        enunciado: "Dados los planos π1 ≡ 4x + 6y − 12z + 1 = 0, π2 ≡ −2x − 3y + 6z − 5 = 0, se pide:\n\na) (1 punto) Calcular el volumen de un cubo que tenga dos de sus caras en dichos planos.\n\nb) (1.5 puntos) Para el cuadrado de vértices consecutivos ABCD, con A(2, 1, 3) y B(1, 2, 3), calcular los\nvértices C y D, sabiendo que C pertenece a los planos π2 y π3 ≡ x − y + z = 2.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2018-J-A4", bloque: "Probabilidad", opcion: "A",
        enunciado: "El 60% de las ventas en unos grandes almacenes corresponden a artículos con precios rebajados. Los clientes\ndevuelven el 15% de los artículos que compran rebajados, porcentaje que disminuye al 8% si los artículos han\nsido adquiridos sin rebajas.\n\na) (1.25 puntos) Determine el porcentaje global de artículos devueltos.\n\nb) (1.25 puntos) ¿Qué porcentaje de artículos devueltos fueron adquiridos con precios rebajados?",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2018-J-B1", bloque: "Algebra", opcion: "B",
        enunciado: `Dadas las matrices $A = \\begin{pmatrix}m&0&2\\\\-2&4&m\\\\0&1&-1\\end{pmatrix}$ y $B = \\begin{pmatrix}-2\\\\0\\\\0\\end{pmatrix}$, se pide:

a) (1 punto) Obtener los valores del parámetro $m$ para los que la matriz $A$ admite inversa.

b) (1 punto) Para $m = 0$, calcular $A \\cdot B$ y $A^{-1} \\cdot B$.

c) (0.5 puntos) Calcular $B \\cdot B^t$ y $B^t \\cdot B$, donde $B^t$ denota la matriz traspuesta de $B$.`,
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2018-J-B2", bloque: "Analisis", opcion: "B",
        enunciado: `Dada la función $f(x) = \\dfrac{|x|}{\\sqrt{x^2+9}}$, se pide:

a) (0.5 puntos) Determinar, si existen, las asíntotas horizontales de $f(x)$.

b) (0.75 puntos) Calcular $f'(4)$.

c) (1.25 puntos) Hallar el área del recinto limitado por la curva $y = f(x)$, el eje $OX$ y las rectas $x = -1$ y $x = 1$.`,
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2018-J-B3", bloque: "Geometria", opcion: "B",
        enunciado: `Dados el punto $P(1, 1, 1)$ y las rectas $r \\equiv \\begin{cases} 2x + y = 2 \\\\ 5x + z = 6 \\end{cases}$ y $s \\equiv \\dfrac{x-2}{-1} = \\dfrac{y+1}{1} = \\dfrac{z-1}{1/3}$, se pide:

a) (1 punto) Hallar la distancia del punto $P$ a la recta $r$.

b) (1 punto) Estudiar la posición relativa de las rectas $r$ y $s$.

c) (0.5 puntos) Hallar el plano perpendicular a la recta $s$ y que pasa por el punto $P$.`,
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2018-J-B4", bloque: "Probabilidad", opcion: "B",
        enunciado: "En una fábrica se elaboran dos tipos de productos: A y B. El 75% de los productos fabricados son de tipo A y el\n25% de tipo B. Los productos de tipo B salen defectuosos un 5% de las veces, mientras que los de tipo A salen\ndefectuosos un 2.5% de las veces.\n\na) (1 punto) Si se fabrican 5000 productos en un mes, ¿cuántos de ellos se espera que sean defectuosos?\n\nb) (1.5 puntos) Un mes, por motivos logísticos, se cambió la producción, de modo que se fabricaron exclu-\nsivamente productos de tipo A. Sabiendo que se fabricaron 6000 unidades, determinar, aproximando la\ndistribución por una normal, la probabilidad de que haya más de 160 unidades defectuosas.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
    ]
  },
  {
    id: 14, año: 2017, tipo: "Ordinaria", asignatura: "Matemáticas II", comunidad: "Madrid",
    preguntas: [
      { id:"2017-J-1A", bloque:"Algebra", opcion:"A",
        enunciado:`$A=\\begin{pmatrix}2&1&-1\\\\1&0&1\\\\-1&1&2\\end{pmatrix}$. $\\det(A)$, $A^{-1}$, $AX=\\begin{pmatrix}1\\\\2\\\\0\\end{pmatrix}$.`,
        puntuacion:2.5, criterios:"Determinante (0.5 pts), inversa (1.25 pts), sistema (0.75 pts)." },
      { id:"2017-J-1B", bloque:"Algebra", opcion:"B",
        enunciado:`Sistema segun $a$:\n$$\\begin{cases}x+2y-z=1\\\\2x+ay+z=3\\\\x+y+az=2\\end{cases}$$`,
        puntuacion:2.5, criterios:"Rouche-Frobenius (1 pt), discusion (1 pt), resolucion SCD (0.5 pts)." },
      { id:"2017-J-2A", bloque:"Analisis", opcion:"A",
        enunciado:`$f(x)=x^4-8x^2$: simetria, extremos, inflexion y grafica.`,
        puntuacion:2.5, criterios:"Simetria (0.25 pts), extremos (1 pt), inflexion (0.75 pts), grafica (0.5 pts)." },
      { id:"2017-J-2B", bloque:"Analisis", opcion:"B",
        enunciado:`Area acotada por $y=\\ln x$, $y=0$, $x=e$.`,
        puntuacion:2.5, criterios:"Planteamiento (0.75 pts), integracion por partes (1 pt), resultado (0.75 pts)." },
      { id:"2017-J-3A", bloque:"Geometria", opcion:"A",
        enunciado:`$\\pi:2x-y+3z=6$, $P(1,2,-1)$.\n\na) Distancia $P$ a $\\pi$.\n\nb) Recta perpendicular.\n\nc) Simetrico de $P$.`,
        puntuacion:2.5, criterios:"Distancia (0.75 pts), recta (0.5 pts), pie (0.5 pts), simetrico (0.75 pts)." },
      { id:"2017-J-3B", bloque:"Geometria", opcion:"B",
        enunciado:`$A(0,0,0)$, $B(1,1,0)$, $C(1,0,1)$, $D(0,1,1)$.\n\na) Plano $BCD$.\n\nb) Distancia $A$ a $BCD$.\n\nc) Volumen tetraedro.`,
        puntuacion:2.5, criterios:"Plano BCD (1 pt), distancia A (0.75 pts), volumen (0.75 pts)." },
      { id:"2017-J-4A", bloque:"Probabilidad", opcion:"A",
        enunciado:`Caja $A$: 5 blancas, 3 negras. Caja $B$: 2 blancas, 6 negras. P(A)=0.4.\n\na) P(blanca)\n\nb) P($A$ | blanca)`,
        puntuacion:2.5, criterios:"Prob. total (1 pt), Bayes (1.5 pts)." },
      { id:"2017-J-4B", bloque:"Probabilidad", opcion:"B",
        enunciado:`$X\\sim N(500,50)$.\n\na) $P(450<X<600)$\n\nb) $P(X>550)$\n\nc) $k$: $P(X>k)=0{,}1$`,
        puntuacion:2.5, criterios:"Tipificacion (0.5 pts), a (0.75 pts), b (0.75 pts), c (0.5 pts)." }
    ]
  },
  {
    id: 15, año: 2016, tipo: "Ordinaria", asignatura: "Matemáticas II", comunidad: "Madrid",
    preguntas: [
      { id:"2016-J-1A", bloque:"Algebra", opcion:"A",
        enunciado:`$A=\\begin{pmatrix}1&-1&0\\\\2&1&1\\\\0&-1&2\\end{pmatrix}$. $\\det(A)$, $A^{-1}$, $AX=\\begin{pmatrix}0\\\\3\\\\1\\end{pmatrix}$.`,
        puntuacion:2.5, criterios:"Determinante (0.5 pts), inversa (1.25 pts), sistema (0.75 pts)." },
      { id:"2016-J-1B", bloque:"Algebra", opcion:"B",
        enunciado:`Sistema segun $m$:\n$$\\begin{cases}x+y-z=2\\\\x+my+z=m\\\\2x+y+mz=3\\end{cases}$$`,
        puntuacion:2.5, criterios:"Rouche-Frobenius (1 pt), discusion (1 pt), resolucion (0.5 pts)." },
      { id:"2016-J-2A", bloque:"Analisis", opcion:"A",
        enunciado:`$f(x)=\\dfrac{e^x}{1+e^x}$: dominio, asintotas, monotonia, inflexion y grafica.`,
        puntuacion:2.5, criterios:"Dominio y asintotas (0.75 pts), monotonia (0.75 pts), inflexion (0.5 pts), grafica (0.5 pts)." },
      { id:"2016-J-2B", bloque:"Analisis", opcion:"B",
        enunciado:`Area entre $y=e^x$, $y=e^{2-x}$ y $x=0$.`,
        puntuacion:2.5, criterios:"Interseccion (0.5 pts), planteamiento (0.75 pts), calculo (1 pt), resultado (0.25 pts)." },
      { id:"2016-J-3A", bloque:"Geometria", opcion:"A",
        enunciado:`$r:\\frac{x}{1}=\\frac{y-1}{2}=\\frac{z+1}{-1}$ y $\\pi:2x-y+z=4$.\n\na) Posicion relativa.\n\nb) Punto e angulo si se cortan.`,
        puntuacion:2.5, criterios:"Posicion (0.5 pts), punto (1 pt), angulo (1 pt)." },
      { id:"2016-J-3B", bloque:"Geometria", opcion:"B",
        enunciado:`$A(1,1,0)$, $B(0,1,1)$, $C(1,0,1)$.\n\na) Area del triangulo.\n\nb) Plano $ABC$.\n\nc) Distancia del origen al plano.`,
        puntuacion:2.5, criterios:"Area (1 pt), plano (0.75 pts), distancia (0.75 pts)." },
      { id:"2016-J-4A", bloque:"Probabilidad", opcion:"A",
        enunciado:`$X\\sim N(10,2)$.\n\na) $P(8<X<13)$\n\nb) $P(X>12)$\n\nc) $k$: $P(X<k)=0{,}975$`,
        puntuacion:2.5, criterios:"Tipificacion (0.5 pts), a (0.75 pts), b (0.75 pts), c (0.5 pts)." },
      { id:"2016-J-4B", bloque:"Probabilidad", opcion:"B",
        enunciado:`$M_1$ (30%, 2% defectos), $M_2$ (70%, 5% defectos).\n\na) P(defectuosa)\n\nb) P($M_1$ | defectuosa)`,
        puntuacion:2.5, criterios:"Prob. total (1 pt), Bayes (1.5 pts)." }
    ]
  },
  {
    id: 16, año: 2015, tipo: "Ordinaria", asignatura: "Matemáticas II", comunidad: "Madrid",
    preguntas: [
      { id:"2015-J-1A", bloque:"Algebra", opcion:"A",
        enunciado:`$A=\\begin{pmatrix}2&0&1\\\\1&-1&0\\\\0&1&2\\end{pmatrix}$. $\\det(A)$, $A^{-1}$, $AX=\\begin{pmatrix}1\\\\2\\\\1\\end{pmatrix}$.`,
        puntuacion:2.5, criterios:"Determinante (0.5 pts), inversa (1.25 pts), sistema (0.75 pts)." },
      { id:"2015-J-1B", bloque:"Algebra", opcion:"B",
        enunciado:`Sistema segun $a$:\n$$\\begin{cases}x+ay+z=1\\\\ax+y+z=1\\\\x+y+az=1\\end{cases}$$`,
        puntuacion:2.5, criterios:"Rouche-Frobenius (1 pt), casos a=1, a=-2, resto (1 pt), resolucion SCD (0.5 pts)." },
      { id:"2015-J-2A", bloque:"Analisis", opcion:"A",
        enunciado:`$f(x)=x^3-3x^2-9x+2$: extremos, inflexion y grafica.`,
        puntuacion:2.5, criterios:"Derivada (0.5 pts), extremos (0.75 pts), inflexion (0.5 pts), grafica (0.75 pts)." },
      { id:"2015-J-2B", bloque:"Analisis", opcion:"B",
        enunciado:`$\\displaystyle\\int_0^{\\pi} x\\sin x\\,dx$.`,
        puntuacion:2.5, criterios:"Integracion por partes (1.5 pts), evaluacion (0.75 pts), resultado (0.25 pts)." },
      { id:"2015-J-3A", bloque:"Geometria", opcion:"A",
        enunciado:`$r:\\frac{x-2}{1}=\\frac{y}{2}=\\frac{z+1}{-2}$ y $s:\\frac{x-1}{2}=\\frac{y-3}{1}=\\frac{z}{1}$.\n\na) Posicion relativa.\n\nb) Distancia si se cruzan.`,
        puntuacion:2.5, criterios:"Posicion (0.5 pts), cruzadas (0.5 pts), distancia (1.5 pts)." },
      { id:"2015-J-3B", bloque:"Geometria", opcion:"B",
        enunciado:`$A(2,1,0)$, $B(1,0,1)$, $C(0,2,1)$.\n\na) Plano $ABC$.\n\nb) Distancia de $D(1,1,1)$ al plano.\n\nc) ¿$D$ y origen en el mismo lado?`,
        puntuacion:2.5, criterios:"Plano (1 pt), distancia (0.75 pts), signo (0.75 pts)." },
      { id:"2015-J-4A", bloque:"Probabilidad", opcion:"A",
        enunciado:`$X\\sim N(50,5)$.\n\na) $P(45<X<60)$\n\nb) $P(X>55)$\n\nc) $k$: $P(X<k)=0{,}9772$`,
        puntuacion:2.5, criterios:"Tipificacion (0.5 pts), a (0.75 pts), b (0.75 pts), c (0.5 pts)." },
      { id:"2015-J-4B", bloque:"Probabilidad", opcion:"B",
        enunciado:`3 monedas. $X$ = num. de caras.\n\na) Tabla de distribucion.\n\nb) Esperanza y varianza.\n\nc) P(al menos 2 caras)`,
        puntuacion:2.5, criterios:"Tabla (1 pt), E y V (0.75 pts), P(X>=2) (0.75 pts)." }
    ]
  }
]

// ─── HISTORIA DE ESPAÑA ──────────────────────────────────────────────────────

export type TipoPreguntaHistoria =
  | 'cuestiones'
  | 'fuente'
  | 'fuente1'
  | 'fuente2'
  | 'tema'
  | 'texto'
  | 'comentario'
  | 'definicion'
  | 'corta'

export interface PreguntaHistoria {
  id: string
  tipo: TipoPreguntaHistoria
  label?: string
  enunciado: string
  puntuacion: number
  texto_fuente?: string
  imagen_url?: string
  imagenFuente?: string
  pdfFuente?: string
  paginaFuente?: number
  conceptos?: string[]
  criterios: string
}

export interface ExamenHistoria {
  id: number
  año: number
  tipo: "Ordinaria" | "Extraordinaria" | "Modelo"
  opcion: "A" | "B"
  dia?: "Lunes" | "Martes"
  asignatura: "Historia de España"
  comunidad: string
  preguntas: PreguntaHistoria[]
}

export const examenesHistoria: ExamenHistoria[] = [
  {
    id: 1, año: 2025, tipo: "Ordinaria", opcion: "A",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
{
        id: "h-2025-ordinaria-A-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "Responda a tres cuestiones, una por cada bloque de preguntas.\n1.-Responda a una de estas dos preguntas:\n-La Hispania romana.\n-La monarquía visigoda.\n2.-Responda a una de estas dos preguntas:\n-Al-Ándalus: economía, sociedad y cultura. El legado judío en la Península ibérica.\n-La Baja Edad Media en las Coronas de Castilla y de Aragón y en el Reino de Navarra.\n3.-Responda a una de estas dos preguntas:\n-Los Reyes Católicos: unión dinástica e instituciones de gobierno. La guerra de Granada.\n-Sociedad, economía y cultura del siglo XVIII.",
        puntuacion: 3,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
{
        id: "h-2025-ordinaria-A-fuente1",
        imagen_url: "/historia-imgs/24-25 ordinaria HE fuente 1.PNG",
        tipo: "fuente1",
        label: "Fuente 1",
        enunciado: "1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo al siguiente documento. (Puntuación máxima: 0,5 puntos).\n2. Relacione esta imagen con las transformaciones económicas en el franquismo. (Puntuación máxima: 2,5 puntos).\nFuente: Albert Carreras (ed.), Estadísticas históricas de España. Siglos XIX-XX (1989).",
        puntuacion: 3,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        pdfFuente: "/historia-pdfs/historia-2025.pdf",
        paginaFuente: 1,
      },
{
        id: "h-2025-ordinaria-A-fuente2",
        imagen_url: "/historia-imgs/24-25 ordinaria HE fuente 2.PNG",
        tipo: "fuente2",
        label: "Fuente 2",
        enunciado: "1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo al siguiente documento. (Puntuación máxima: 0,5 puntos).\n2. Relacione esta imagen con la Guerra Civil: Desarrollo de la guerra y consecuencias. (Puntuación máxima: 2,5 puntos).\nEl número 10 de la madrileña calle de Peironcely, en el distrito de Puente de Vallecas, fotografía de\nRobert Capa, noviembre de 1936",
        puntuacion: 3,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        pdfFuente: "/historia-pdfs/historia-2025.pdf",
        paginaFuente: 2,
      },
{
        id: "h-2025-ordinaria-A-texto",
        tipo: "texto",
        label: "Texto",
        enunciado: "ANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad el contenido del texto. (Puntuación máxima: 0,5 puntos).\n2. Señale y explique las ideas fundamentales del texto. (Puntuación máxima: 1 punto).\n3. Responda a la siguiente cuestión: El Sexenio Revolucionario: La Constitución de 1869. (Puntuación máxima: 2,5 puntos).",
        puntuacion: 4,
        criterios: "Se valorará la comprensión del texto, el resumen, la explicación de las ideas fundamentales y la contextualización histórica precisa.",
        texto_fuente: "“Constitución democrática de la Nación Española promulgada el día 6 de junio de 1869. La Nación española, y en su nombre las Cortes Constituyentes elegidas por sufragio universal, deseando afianzar la justicia, la libertad y la seguridad, y proveer al bien de cuantos vivan en España, decretan y sancionan la siguiente CONSTITUCIÓN.\nTítulo Primero De los españoles y sus derechos:\nArt. 2º. Ningún español ni extranjero podrá ser detenido ni preso sino por causa de delito.\nArt. 3º. Todo detenido será puesto en libertad o entregado a la Autoridad judicial dentro de las veinticuatro horas siguientes al acto de la detención. Toda detención se dejará sin efecto o elevará a prisión dentro de las setenta y dos horas de haber sido entregado el detenido al juez competente. […]\nArt. 4º. Ningún español podrá ser preso sino en virtud de mandamiento de juez competente. […]\nArt. 5º. Nadie podrá entrar en el domicilio de un español, o extranjero residente en España, sin su consentimiento, excepto en los casos urgentes de incendio, inundación u otro peligro análogo, o de agresión ilegítima procedente de dentro, o para auxiliar a persona que desde allí pida socorro. Fuera de estos casos, la entrada en el domicilio de un español, o extranjero residente en España, y el registro de sus papeles o efectos, sólo podrán decretarse por el Juez competente y ejecutarse de día. El registro de papeles y efectos tendrá siempre lugar a presencia del interesado o de un individuo de su familia, y, en su defecto, de dos testigos vecinos del mismo pueblo. Sin embargo, cuando un delincuente, hallado in fraganti y perseguido por la Autoridad o sus agentes, se refugiare en su domicilio, podrán éstos penetrar en él, sólo para el acto de la aprehensión. Si se refugiare en domicilio ajeno, procederá requerimiento al dueño de éste”.\n(Constitución Española de 1869)",
      },
{
        id: "h-2025-ordinaria-A-tema",
        tipo: "tema",
        label: "Tema",
        enunciado: "Desarrolle el tema: Las desamortizaciones. La España rural del siglo XIX. Industrialización, comercio y comunicaciones.",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, claridad y organización expositiva, referencias cronológicas y espaciales, y adecuación al tema planteado.",
      }
    ]
  },
  {
    id: 2, año: 2024, tipo: "Ordinaria", opcion: "A", dia: "Lunes",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
{
        id: "h-2024-Lunes-A-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "1. Los pueblos prerromanos y las colonizaciones de los pueblos del Mediterráneo.\n2. Al-Ándalus: evolución política.\n3. Los Reyes Católicos: unión dinástica e instituciones de gobierno. La guerra de Granada.\n4. Las reformas borbónicas en los virreinatos americanos.",
        puntuacion: 3,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
{
        id: "h-2024-Lunes-A-fuente",
        imagen_url: "/historia-imgs/23-24 ordinaria HE A lunes.PNG",
        tipo: "fuente",
        label: "Fuente",
        enunciado: "1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo al siguiente documento. (Puntuación máxima: 0,5 puntos).\n2. Relacione los datos con las transformaciones económicas y sociales del siglo XIX: La evolución de la población y de las ciudades. (Puntuación máxima: 2 puntos).\nCenso de la población de España según el recuento de 1860. Junta General de Estadística",
        puntuacion: 2.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        pdfFuente: "/historia-pdfs/historia-2024-lunes.pdf",
        paginaFuente: 1,
      },
{
        id: "h-2024-Lunes-A-tema",
        tipo: "tema",
        label: "Tema",
        enunciado: "Desarrolle el tema: El franquismo. Fundamentos ideológicos del régimen franquista en el contexto histórico europeo.",
        puntuacion: 4.5,
        criterios: "Se valorará la capacidad de síntesis, claridad y organización expositiva, referencias cronológicas y espaciales, y adecuación al tema planteado.",
      }
    ]
  },
  {
    id: 3, año: 2024, tipo: "Ordinaria", opcion: "B", dia: "Lunes",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
{
        id: "h-2024-Lunes-B-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "1. La monarquía visigoda.\n2. La Baja Edad Media en las Coronas de Castilla y de Aragón y en el Reino de Navarra.\n3. Sociedad, economía y cultura de los siglos XVI y XVII.\n4. La Guerra de Sucesión. La Paz de Utrecht. Los pactos de familia.",
        puntuacion: 3,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
{
        id: "h-2024-Lunes-B-fuente",
        imagen_url: "/historia-imgs/23-24 ordinaria HE B lunes.PNG",
        tipo: "fuente",
        label: "Fuente",
        enunciado: "1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo a la siguiente imagen. (Puntuación máxima: 0,5 puntos).\n2. Relacione la fuente con el impacto de los acontecimientos internacionales durante el reinado de\nAlfonso XIII: Marruecos. (Puntuación máxima: 2 puntos).\nCampaña del Rif, posición de Monte Arruit: capellán rezando ante los restos de españoles encontrados en el interior de la posición",
        puntuacion: 2.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        pdfFuente: "/historia-pdfs/historia-2024-lunes.pdf",
        paginaFuente: 2,
      },
{
        id: "h-2024-Lunes-B-texto",
        tipo: "texto",
        label: "Texto",
        enunciado: "ANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad el contenido del texto. (Puntuación máxima: 0,5 puntos).\n2. Señale y explique las ideas fundamentales del texto. (Puntuación máxima: 1 punto).\n3. Responda a la siguiente cuestión: Las Cortes de Cádiz. (Puntuación máxima: 3 puntos).",
        puntuacion: 4.5,
        criterios: "Se valorará la comprensión del texto, el resumen, la explicación de las ideas fundamentales y la contextualización histórica precisa.",
        texto_fuente: "“Atendiendo las Cortes generales y extraordinarias a que la facultad individual de los ciudadanos de publicar sus pensamientos e ideas políticas es, no solo un freno de la arbitrariedad de los que gobiernan, sino también un medio de ilustrar a la Nación en general, y el único camino para llevar al conocimiento de la verdadera opinión pública, han venido en decretar lo siguiente:\nArtículo I. Todos los cuerpos y personas particulares, de cualquiera condición y estado que sean, tienen libertad de escribir, imprimir y publicar sus ideas políticas sin necesidad de licencia, revisión o aprobación alguna anteriores a la publicación, bajo las restricciones y responsabilidades que se expresarán en el presente decreto.\nII. Por tanto quedan abolidos todos los actuales juzgados de Imprentas, y la censura de las obras políticas precedente a su impresión.\nIII. Los autores e impresores serán responsables respectivamente del abuso de esta libertad.\nIV. Los libelos infamatorios, los escritos calumniosos, los subversivos de las leyes fundamentales de la monarquía, los licenciosos y contrarios a la decencia pública y buenas costumbres serán castigados con la pena de la ley, y las que aquí se señalarán”.\n(Decreto IX de 10 de noviembre de 1810. En: Colección de los decretos y órdenes que han expedido las Cortes Generales y Extraordinarias desde su instalación en 24 de septiembre de 1810 hasta igual fecha de 1811, Cervantes Virtual).",
      }
    ]
  },
  {
    id: 4, año: 2024, tipo: "Ordinaria", opcion: "A", dia: "Martes",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
{
        id: "h-2024-Martes-A-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "1. El Paleolítico y el Neolítico.\n2. Los reinos cristianos: evolución de la conquista de la Península y organización política.\n3. Exploración, conquista y colonización de América (desde 1492 y durante el siglo XVI).\n4. La nueva Monarquía borbónica. Los decretos de Nueva Planta. Modelo de Estado y alcance de las reformas.",
        puntuacion: 3,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
{
        id: "h-2024-Martes-A-fuente",
        tipo: "fuente",
        label: "Fuente",
        enunciado: "1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo al siguiente documento. (Puntuación máxima: 0,5 puntos).\n2. Relacione esta imagen con las relaciones internacionales de la dictadura franquista (1939-1975).\n(Puntuación máxima: 2 puntos).\nFranco recibe en Madrid al presidente de Estados Unidos Dwight D. Eisenhower, en visita a España, diciembre de 1959.",
        puntuacion: 2.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        pdfFuente: "/historia-pdfs/historia-2024-martes.pdf",
        paginaFuente: 1,
      },
{
        id: "h-2024-Martes-A-tema",
        tipo: "tema",
        label: "Tema",
        enunciado: "Desarrolle el tema: El proceso de independencia de las colonias americanas. El legado español en\nAmérica.",
        puntuacion: 4.5,
        criterios: "Se valorará la capacidad de síntesis, claridad y organización expositiva, referencias cronológicas y espaciales, y adecuación al tema planteado.",
      }
    ]
  },
  {
    id: 5, año: 2024, tipo: "Ordinaria", opcion: "B", dia: "Martes",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
{
        id: "h-2024-Martes-B-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "1. La Hispania romana.\n2. Al-Ándalus: economía, sociedad y cultura. El legado judío en la Península ibérica.\n3. Los Austrias del siglo XVII. Política interior y exterior.\n4. Sociedad, economía y cultura del siglo XVIII.",
        puntuacion: 3,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
{
        id: "h-2024-Martes-B-fuente",
        tipo: "fuente",
        label: "Fuente",
        enunciado: "1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo al siguiente documento. (Puntuación máxima: 0,5 puntos).\n2. Relacione los datos con las transformaciones económicas del siglo XIX: Industrialización, comercio y comunicaciones. (Puntuación máxima: 2 puntos).\nProducción de algunos minerales, 1860-1894 (medias anuales en toneladas)\nPiritas de cobre\nPlomo Mercurio Hierro\n1860-1864 232 66 880 199\n1870-1874 459 77 1.267 596\n1880-1884 1.876 Sin datos 1.627 4.045\n1890-1894 2.549 164 1.707 5.415\nFuente: Comín, F., Martín Aceña, P., Muñoz Rubio, M. y Vidal Olivares, J. (1998): 150 años de historia de los ferrocarriles españoles.",
        puntuacion: 2.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        pdfFuente: "/historia-pdfs/historia-2024-martes.pdf",
        paginaFuente: 2,
      },
{
        id: "h-2024-Martes-B-texto",
        tipo: "texto",
        label: "Texto",
        enunciado: "ANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad el contenido del texto. (Puntuación máxima: 0,5 puntos).\n2. Señale y explique las ideas fundamentales del texto. (Puntuación máxima: 1 punto).\n3. Responda a la siguiente cuestión: La Segunda República: El Gobierno provisional y la Constitución de\n1931. (Puntuación máxima: 3 puntos).",
        puntuacion: 4.5,
        criterios: "Se valorará la comprensión del texto, el resumen, la explicación de las ideas fundamentales y la contextualización histórica precisa.",
        texto_fuente: "“(…) España, en uso de su soberanía y representada por las Cortes Constituyentes, decreta y sanciona esta Constitución.\nArt.1°. España es una República democrática de trabajadores de toda clase, que se organiza en régimen de Libertad y Justicia.\nLos poderes de todos sus órganos emanan del pueblo.\nLa República constituye un Estado integral, compatible con la autonomía de los Municipios y las\nRegiones. (…)\nArt. 2°. Todos los españoles son iguales ante la ley.\nArt. 3°. El Estado español no tiene religión oficial (…)\nArt. 6°. España renuncia a la guerra como instrumento de política nacional (…)\nArt 21. El derecho del Estado español prevalece sobre el de las regiones autónomas en todo lo que no esté atribuido a la exclusiva competencia de éstas en sus respectivos Estatutos (…)\nArt. 26. Todas las confesiones religiosas serán consideradas como Asociaciones sometidas a una ley especial. El Estado, las regiones, las provincias y los Municipios, no mantendrán, favorecerán ni auxiliarán económicamente a las Iglesias, Asociaciones e Instituciones religiosas.\nArt 27 (…) Los cementerios estarán exclusivamente sometidos a la jurisdicción civil. No podrá haber en ellos separación de recintos por motivos religiosos, (…) Todas las confesiones podrán ejercer sus cultos privadamente (…)\nArt. 44. Toda la riqueza del país, sea quien fuere su dueño, está subordinada a los intereses de la economía nacional (...)\nArt. 52. El Congreso de los Diputados se compone de los representantes elegidos por sufragio universal, igual, directo y secreto”.\n(Constitución de 1931. Fuente: De Esteban, J., Las Constituciones de España, Madrid, 1.983).",
      }
    ]
  },
  {
    id: 6, año: 2023, tipo: "Ordinaria", opcion: "A", dia: "Lunes",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
{
        id: "h-2023-Lunes-A-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "1. Los pueblos prerromanos. Las colonizaciones históricas: fenicios y griegos. Tartesos.\n2. Conquista y romanización de la Península Ibérica. Principales aportaciones romanas en los ámbitos social, económico y cultural.\n3. Al Ándalus: economía, sociedad y cultura.\n4. Los reinos cristianos en la Edad Media: organización política, régimen señorial y sociedad estamental.\n5. Los Austrias del siglo XVII: el gobierno de validos. La crisis de 1640.\n6. La nueva Monarquía Borbónica. Los Decretos de Nueva Planta. Modelo de Estado y alcance de las reformas.",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
{
        id: "h-2023-Lunes-A-fuente",
        imagen_url: "/historia-imgs/22-23 ordinaria HE A lunes.PNG",
        tipo: "fuente",
        label: "Fuente",
        enunciado: "1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo a la siguiente imagen. (Puntuación máxima: 0,5 puntos).\n2. Relacione esta imagen con la alternancia política: gobiernos del Partido Popular (Puntuación máxima: 1 punto).\nCelebración en la sede del Partido Popular de los resultados en las elecciones generales de marzo\n1996",
        puntuacion: 1.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        pdfFuente: "/historia-pdfs/historia-2023-lunes.pdf",
        paginaFuente: 1,
      },
{
        id: "h-2023-Lunes-A-tema",
        tipo: "tema",
        label: "Tema",
        enunciado: "Desarrolle el tema: Las Cortes de Cádiz. La Constitución de 1812.\nD",
        puntuacion: 4.5,
        criterios: "Se valorará la capacidad de síntesis, claridad y organización expositiva, referencias cronológicas y espaciales, y adecuación al tema planteado.",
      }
    ]
  },
  {
    id: 7, año: 2023, tipo: "Ordinaria", opcion: "B", dia: "Lunes",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
{
        id: "h-2023-Lunes-B-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "1. Sociedad y economía en el Paleolítico y Neolítico. La pintura rupestre.\n2. Al Ándalus: la conquista musulmana de la Península Ibérica. Emirato y califato de Córdoba.\n3. Los primeros núcleos de resistencia cristiana. Principales etapas de la Reconquista. Modelos de repoblación.\n4. El significado de 1492. La guerra de Granada y el descubrimiento de América.\n5. Principales factores de la crisis demográfica y económica del siglo XVII y sus consecuencias.\n6. La Guerra de Sucesión Española y el sistema de Utrecht. Los Pactos de Familia.",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
{
        id: "h-2023-Lunes-B-fuente",
        imagen_url: "/historia-imgs/22-23 ordinaria HE B lunes.PNG",
        tipo: "fuente",
        label: "Fuente",
        enunciado: "1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo al siguiente cuadro. (Puntuación máxima: 0,5 puntos).\n2. Explique el contexto histórico del turno de partidos durante la Restauración (Puntuación máxima:\n1 punto).\nResultados de las elecciones al Congreso en España 1876-1898\nPartido en el\nGobierno que convoca las elecciones\nDiputados del partido en el\nGobierno\nDiputados de las oposiciones\nTotal diputados\nCongreso\n1876 Conservador 333 58 391\n1879 Conservador 293 99 392\n1881 Liberal 297 95 392\n1884 Conservador 318 74 392\n1886 Liberal 278 114 392\n1891 Conservador 253 146 399\n1893 Liberal 281 119 400\n1896 Conservador 269 132 401\n1898 Liberal 266 135 401\nFuente: Martínez Cuadrado, Miguel, Elecciones y partidos políticos en España 1868-1931.",
        puntuacion: 1.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        pdfFuente: "/historia-pdfs/historia-2023-lunes.pdf",
        paginaFuente: 2,
      },
{
        id: "h-2023-Lunes-B-texto",
        tipo: "texto",
        label: "Texto",
        enunciado: "ANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad el contenido del texto. (Puntuación máxima: 0,5 puntos).\n2. Señale y explique las ideas fundamentales del texto. (Puntuación máxima: 1 punto).\n3. Responda a la siguiente cuestión: Fases militares de la Guerra Civil. La evolución política y económica en las dos zonas (Puntuación máxima: 3 puntos).",
        puntuacion: 4.5,
        criterios: "Se valorará la comprensión del texto, el resumen, la explicación de las ideas fundamentales y la contextualización histórica precisa.",
        texto_fuente: "“Artículo 1°. Falange Española y Requetés, con sus actuales servicios y elementos, se integran bajo Mi Jefatura, en una sola entidad política de carácter nacional, que de momento se denominará\nFalange Española Tradicionalista y de las JONS. Esta organización, intermedia entre la Sociedad y el\nEstado, tiene la misión principal de comunicar al Estado el aliento del pueblo y de llevar a este el pensamiento de aquél a través de las virtudes político-morales, de servicio, jerarquía y hermandad […]\nQuedan disueltas las demás organizaciones y partidos políticos.\nArtículo 2°. Serán órganos rectores de la nueva entidad política nacional el Jefe del Estado, un\nSecretariado o Junta Política y el Consejo Nacional […]\nArtículo 3°. Quedan fundidas en una sola Milicia Nacional las de Falange Española y de Requetés conservando sus emblemas y signos exteriores […]\nLa Milicia Nacional es auxiliar del Ejército. El Jefe del Estado es Jefe Supremo de la Milicia. […]”\n(Decreto de Unificación, dado en Salamanca a 19 de abril de 1937, Francisco Franco)",
      }
    ]
  },
  {
    id: 8, año: 2023, tipo: "Ordinaria", opcion: "A", dia: "Martes",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
{
        id: "h-2023-Martes-A-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "1. Los pueblos prerromanos. Las colonizaciones históricas: fenicios y griegos. Tartesos.\n2. Al Ándalus: economía, sociedad y cultura.\n3. Organización política de la Corona de Castilla, de la Corona de Aragón y del Reino de Navarra al final de la\nEdad Media.\n4. El Imperio de los Austrias: España bajo Carlos I. Política interior y conflictos europeos.\n5. Los Austrias del siglo XVII: el gobierno de los validos. La crisis de 1640.\n6. La Guerra de Sucesión Española y el sistema de Utrecht. Los Pactos de Familia.",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
{
        id: "h-2023-Martes-A-fuente",
        tipo: "fuente",
        label: "Fuente",
        enunciado: "1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo a la siguiente imagen. (Puntuación máxima: 0,5 puntos).\n2. Relacione esta imagen con el desarrollo del movimiento obrero español durante la Restauración\nBorbónica (1874-1902) (Puntuación máxima: 1 punto).\n“La Tejedora”, por Joan Planella y Rodríguez (1882). Barcelona, colección particular.",
        puntuacion: 1.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        pdfFuente: "/historia-pdfs/historia-2023-martes.pdf",
        paginaFuente: 1,
      },
{
        id: "h-2023-Martes-A-tema",
        tipo: "tema",
        label: "Tema",
        enunciado: "Desarrolle el tema: La oposición a la dictadura: principales grupos y evolución en el tiempo. La crisis del franquismo desde 1973 a la muerte de Franco.",
        puntuacion: 4.5,
        criterios: "Se valorará la capacidad de síntesis, claridad y organización expositiva, referencias cronológicas y espaciales, y adecuación al tema planteado.",
      }
    ]
  },
  {
    id: 9, año: 2023, tipo: "Ordinaria", opcion: "B", dia: "Martes",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
{
        id: "h-2023-Martes-B-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "1. El reino visigodo: origen y organización política. Los concilios.\n2. Al Ándalus: reinos de taifas. Reino nazarí.\n3. Los reinos cristianos en la Edad Media: organización política, régimen señorial y sociedad estamental.\n4. Los Reyes Católicos: unión dinástica e instituciones de gobierno.\n5. Principales factores de la crisis demográfica y económica del siglo XVII y sus consecuencias.\n6. La España del siglo XVIII. Expansión y transformaciones económicas: agricultura, industria y comercio con\nAmérica. Causas del despegue económico de Cataluña.",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
{
        id: "h-2023-Martes-B-fuente",
        tipo: "fuente",
        label: "Fuente",
        enunciado: "1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo al siguiente cuadro (Puntuación máxima: 0,5 puntos).\n2. Relacione estos datos con el final del reinado de Alfonso XIII (Puntuación máxima: 1 punto).\nResultados, en las capitales de provincia, de las elecciones municipales celebradas el 12 de abril de 1931\nConcejales Alcaldes\nRepublicanos y socialistas 1.062 39\nMonárquicos 467 10\nComunistas 3 0\nOtros 192 3\nFuente: Instituto Nacional de Estadística",
        puntuacion: 1.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        pdfFuente: "/historia-pdfs/historia-2023-martes.pdf",
        paginaFuente: 2,
      },
{
        id: "h-2023-Martes-B-texto",
        tipo: "texto",
        label: "Texto",
        enunciado: "ANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad el contenido del texto. (Puntuación máxima: 0,5 puntos).\n2. Señale y explique las ideas fundamentales del texto. (Puntuación máxima: 1 punto).\n3. Responda a la siguiente cuestión: El reinado de Isabel II (1833-1868): la primera guerra carlista (Puntuación máxima 3 puntos).",
        puntuacion: 4.5,
        criterios: "Se valorará la comprensión del texto, el resumen, la explicación de las ideas fundamentales y la contextualización histórica precisa.",
        texto_fuente: "“Convenio celebrado entre el Capitán General de los Ejércitos Nacionales D. Baldomero Espartero y el\nTeniente General D. Rafael Maroto.\nArt. 1º. El Capitán General D. Baldomero Espartero recomendará con interés al gobierno el cumplimiento de su oferta de comprometerse formalmente a proponer a las Cortes la concesión o modificación de los fueros.\nArt. 2º. Serán reconocidos los empleos, grados y condecoraciones de los generales, jefes y oficiales, y demás individuos dependientes del ejército del mando del teniente general D. Rafael Maroto, quien presentará las relaciones con expresión de las armas a que pertenecen, quedando en libertad de continuar sirviendo, defendiendo la Constitución de 1837, el trono de Isabel 2ª y la Regencia de su augusta Madre, o bien de retirarse a sus casas los que no quieran seguir con las armas de fuego […]\nArt. 4º. Los que prefieran retirarse a sus casas siendo generales y brigadieres obtendrán su cuartel para donde lo pidan con el sueldo por reglamento les corresponda: los jefes y oficiales obtendrán licencia limitada o su retiro según qué reglamento […]\nRatificado este documento en el cuartel general de Vergara, a 31 de agosto de 1839.”",
      }
    ]
  },
  {
    id: 10, año: 2022, tipo: "Ordinaria", opcion: "A", dia: "Lunes",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
{
        id: "h-2022-Lunes-A-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "1. Sociedad y economía en el Paleolítico y Neolítico. La pintura rupestre.\n2. Al Ándalus: economía, sociedad y cultura.\n3. Los reinos cristianos en la Edad Media: organización política, régimen señorial y sociedad estamental.\n4. Exploración y colonización de América. Consecuencias de los descubrimientos en España, Europa y\nAmérica.\n5. Los Austrias del siglo XVII: el gobierno de validos. La crisis de 1640.\n6. La Guerra de Sucesión Española y el sistema de Utrecht. Los Pactos de Familia.",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
{
        id: "h-2022-Lunes-A-fuente",
        imagen_url: "/historia-imgs/21-22 ordinaria HE A Lunes.PNG",
        tipo: "fuente",
        label: "Fuente",
        enunciado: "1. \tExplique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo a la siguiente tabla (Puntuación máxima: 0,5 puntos).\n2. \tRelacione estos datos con el restablecimiento de la democracia: las elecciones de junio de 1977\n(Puntuación máxima: 1 punto).\nResultados Elecciones Generales (Congreso de los Diputados) de 15-VI-1977",
        puntuacion: 1.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        pdfFuente: "/historia-pdfs/historia-2022-lunes.pdf",
        paginaFuente: 1,
      },
{
        id: "h-2022-Lunes-A-tema",
        tipo: "tema",
        label: "Tema",
        enunciado: "Desarrolle el tema: El reinado de Fernando VII: liberalismo frente a absolutismo. El proceso de independencia de las colonias americanas.\nPartido \tUnión de\nCentro\nDemocrático\nPartido\nSocialista\nObrero\nEspañol\nPartido\nComunista de España\nAlianza\nPopular\nPartido\nSocialista\nPopular\nPacte\nDemocratic\nPer\nCatalunya\nPartido\nNacionalista\nVasco\nEscaños \t165 \t118 \t20 \t16 \t6 \t11 \t8\n% votos \t34,4 \t29,3 \t9,3 \t8,2 \t4,4 \t2,8 \t1,6\nVotos \t6.310.391 \t5.371.866 \t1.709.890 \t1.504.771 \t816.582 \t514.647 \t296.193",
        puntuacion: 4.5,
        criterios: "Se valorará la capacidad de síntesis, claridad y organización expositiva, referencias cronológicas y espaciales, y adecuación al tema planteado.",
      }
    ]
  },
  {
    id: 11, año: 2022, tipo: "Ordinaria", opcion: "B", dia: "Lunes",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
{
        id: "h-2022-Lunes-B-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "1. El reino visigodo: origen y organización política. Los concilios.\n2. Al Ándalus: la conquista musulmana de la Península Ibérica. Emirato y califato de Córdoba.\n3. Organización política de la Corona de Castilla, de la Corona de Aragón y del Reino de Navarra al final de la Edad Media.\n4. El Imperio de los Austrias: España bajo Carlos I. Política interior y conflictos europeos.\n5. Principales factores de la crisis demográfica y económica del siglo XVII y sus consecuencias.\n6. La nueva Monarquía Borbónica. Los Decretos de Nueva Planta. Modelo de Estado y alcance de las reformas.",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
{
        id: "h-2022-Lunes-B-fuente",
        imagen_url: "/historia-imgs/21-22 ordinaria HE B lunes.PNG",
        tipo: "fuente",
        label: "Fuente",
        enunciado: "1. \tExplique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo a la siguiente imagen. (Puntuación máxima: 0,5 puntos).\n2. \tRelacione esta imagen con la Guerra de la Independencia: antecedentes y causas (Puntuación máxima: 1 punto).\nLevantamiento del 2 de mayo de 1808 en Madrid, pintura de Goya",
        puntuacion: 1.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        pdfFuente: "/historia-pdfs/historia-2022-lunes.pdf",
        paginaFuente: 2,
      },
{
        id: "h-2022-Lunes-B-texto",
        tipo: "texto",
        label: "Texto",
        enunciado: "ANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad el contenido del texto. (Puntuación máxima: 0,5 puntos).\n2. Señale y explique las ideas fundamentales del texto. (Puntuación máxima: 1 punto).\n3. Responda a la siguiente cuestión: La integración de España en Europa. Consecuencias económicas y sociales (Puntuación máxima: 3 puntos).",
        puntuacion: 4.5,
        criterios: "Se valorará la comprensión del texto, el resumen, la explicación de las ideas fundamentales y la contextualización histórica precisa.",
        texto_fuente: "“Majestad, \tseñores \tministros, \tseñor \tpresidente \tdel \tConsejo, \tseñores \tpresidentes \tde \tlas instituciones comunitarias, señores ministros, señoras y señores:\nHoy damos un paso de importancia histórica para España y para Europa. Al estampar nuestras firmas en el tratado de adhesión a las comunidades europeas, hemos conseguido un hito fundamental para completar la unidad de nuestro viejo continente, y también para superar el aislamiento secular de\nEspaña (...)\nIniciamos hoy una nueva etapa cargada de retos y promesas, una empresa que completa Europa, refuerza los lazos que unen nuestros dos pueblos que permitirá que, dentro de las instituciones comunitarias, acentuemos la proyección de Europa hacia los países de Iberoamérica y de África.\nEntendemos que la unidad europea no puede hacerse solo hacia dentro, sino también hacia fuera (...).\nCompartimos con otras naciones europeas la dimensión mediterránea. Con la ampliación, la comunidad estará aún más cerca de los países de la ribera sur del Mediterráneo.\nSupone un desafío de modernidad que exige un cambio de mentalidad y de estructuras. Será un esfuerzo de adaptación porque nos sumamos con retraso a un proceso en marcha”.\n(Extracto del discurso del presidente Felipe González en el acto de adhesión de España a la CEE,\n12 de junio de 1985)",
      }
    ]
  },
  {
    id: 12, año: 2022, tipo: "Ordinaria", opcion: "A", dia: "Martes",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
{
        id: "h-2022-Martes-A-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "1. Los pueblos prerromanos. Las colonizaciones históricas: fenicios y griegos. Tartesos.\n2. Al Ándalus: reinos de taifas. Reino nazarí.\n3. Los reinos cristianos en la Edad Media: organización política, régimen señorial y sociedad estamental.\n4. Los Reyes Católicos: unión dinástica e instituciones de gobierno.\n5. La guerra de los Treinta Años y la pérdida de la hegemonía española en Europa.\n6. Ideas fundamentales de la Ilustración. El despotismo ilustrado: Carlos III.",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
{
        id: "h-2022-Martes-A-fuente",
        tipo: "fuente",
        label: "Fuente",
        enunciado: "1. \tExplique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo a la siguiente tabla (Puntuación máxima: 0,5 puntos).\n2. \tRelacione este cuadro con el sistema de comunicaciones en el siglo XIX: el ferrocarril\n(Puntuación máxima: 1 punto).\nQuinquenios \tKm. nuevos ampliados \tTotal km. explotados final quinquenio\n1846-1850 \t28 \t28\n1851-1855 \t449 \t477\n1856-1860 \t1.441 \t1.918\n1861-1865 \t2.913 \t4.831\n1866-1870 \t641 \t5.472\n1871-1875 \t646 \t6.118\n1876-1880 \t1.360 \t7.478\n1881-1885 \t1.453 \t8.931\n1886-1890 \t1.069 \t10.000\n1891-1895 \t1.529 \t11.529\nFuente: El problema de los ferrocarriles españoles. Antecedentes, datos, soluciones, Madrid, 1933",
        puntuacion: 1.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        pdfFuente: "/historia-pdfs/historia-2022-martes.pdf",
        paginaFuente: 1,
      },
{
        id: "h-2022-Martes-A-tema",
        tipo: "tema",
        label: "Tema",
        enunciado: "Desarrolle el tema: Las etapas políticas de la democracia. Los gobiernos de la UCD. El golpe de\nEstado de 23 de febrero de 1981. La alternancia política: gobiernos socialistas y gobiernos del Partido\nPopular.",
        puntuacion: 4.5,
        criterios: "Se valorará la capacidad de síntesis, claridad y organización expositiva, referencias cronológicas y espaciales, y adecuación al tema planteado.",
      }
    ]
  },
  {
    id: 13, año: 2022, tipo: "Ordinaria", opcion: "B", dia: "Martes",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
{
        id: "h-2022-Martes-B-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "1. Conquista y romanización de la Península Ibérica. Principales aportaciones romanas en los ámbitos social, económico y cultural.\n2. Los primeros núcleos de resistencia cristiana. Principales etapas de la Reconquista. Modelos de repoblación.\n3. Organización política de la Corona de Castilla, de la Corona de Aragón y del Reino de Navarra al final de la Edad Media.\n4. El significado de 1492. La guerra de Granada y el descubrimiento de América.\n5. La Monarquía Hispánica de Felipe II. Gobierno y administración. Los problemas internos. Guerras y sublevación en Europa.\n6. La España del siglo XVIII. Expansión y transformaciones económicas: agricultura, industria y comercio con América. Causas del despegue económico de Cataluña.",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
{
        id: "h-2022-Martes-B-fuente",
        tipo: "fuente",
        label: "Fuente",
        enunciado: "1. \tExplique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo a la siguiente imagen. (Puntuación máxima: 0,5 puntos).\n2. \tRelacione esta imagen con la política económica del franquismo: la autarquía (Puntuación máxima: 1 punto).\nCartilla individual de racionamiento, 1944",
        puntuacion: 1.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        pdfFuente: "/historia-pdfs/historia-2022-martes.pdf",
        paginaFuente: 2,
      },
{
        id: "h-2022-Martes-B-texto",
        tipo: "texto",
        label: "Texto",
        enunciado: "ANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad el contenido del texto (Puntuación máxima: 0,5 puntos).\n2. Señale y explique las ideas fundamentales del texto (Puntuación máxima: 1 punto).\n3. Responda a la siguiente cuestión: El reinado de Fernando VII: liberalismo frente a absolutismo\n(Puntuación máxima: 3 puntos).",
        puntuacion: 4.5,
        criterios: "Se valorará la comprensión del texto, el resumen, la explicación de las ideas fundamentales y la contextualización histórica precisa.",
        texto_fuente: "“Españoles: Cuando vuestros heroicos esfuerzos lograron poner término al cautiverio en que me retuvo la más inaudita perfidia, todo cuanto vi y escuché, apenas pisé el suelo patrio, se reunió para persuadirme de que la nación deseaba ver resucitada su anterior forma de gobierno […]. Pero mientras\nYo meditaba maduramente con la solicitud propia de mi paternal corazón las variaciones de nuestro régimen fundamental, que parecían más adaptables al carácter nacional y al estado presente de las diversas porciones de la monarquía española, así como más análogas a la organización de los pueblos ilustrados, me habéis hecho entender vuestro anhelo de que se restableciese aquella Constitución que entre el estruendo de armas hostiles fue promulgada en Cádiz el año 1812, al propio tiempo que con asombro del mundo combatíais por la libertad de la patria. He oído vuestros votos, y cual tierno Padre he condescendido a lo que mis hijos reputan conducente a su felicidad.\nHe jurado esa Constitución por la cual suspirabais, y seré siempre su más firme apoyo. Ya he tomado las medidas oportunas para la propia convocatoria de las Cortes […]\nMarchemos francamente, y Yo el primero, por la senda constitucional […]\n(Palacio de Madrid, 10-3-1820, Gaceta extraordinaria de Madrid, 12 de marzo de 1820)",
      }
    ]
  },
  {
    id: 14, año: 2021, tipo: "Ordinaria", opcion: "A", dia: "Lunes",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
{
        id: "h-2021-Lunes-A-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "1. El reino visigodo: origen y organización política. Los concilios.\n2. Al Ándalus: la conquista musulmana de la Península Ibérica. Emirato y califato de Córdoba.\n3. Organización política de la Corona de Castilla, de la Corona de Aragón y del Reino de Navarra al final de la\nEdad Media.\n4. El significado de 1492. La guerra de Granada y el descubrimiento de América.\n5. La guerra de los Treinta Años y la pérdida de la hegemonía española en Europa.\n6. La Guerra de Sucesión Española y el sistema de Utrecht. Los Pactos de Familia.",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
{
        id: "h-2021-Lunes-A-fuente",
        imagen_url: "/historia-imgs/20-21 ordianria HE A lunes.PNG",
        tipo: "fuente",
        label: "Fuente",
        enunciado: "1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo a la siguiente imagen. (Puntuación máxima: 0,5 puntos).\n2. Explique el contexto histórico de la creación del Estado franquista. (Puntuación máxima: 1 punto).\nFranco llega a las Cortes, para presidir la sesión de apertura, 1943.",
        puntuacion: 1.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        pdfFuente: "/historia-pdfs/historia-2021-lunes.pdf",
        paginaFuente: 1,
      },
{
        id: "h-2021-Lunes-A-tema",
        tipo: "tema",
        label: "Tema",
        enunciado: "Desarrolle el tema: La Restauración Borbónica (1874-1902): Cánovas del Castillo y el turno de partidos.\nLa Constitución de 1876.\nFranco llega a las Cortes para presidir la sesió n de apertura (17-",
        puntuacion: 4.5,
        criterios: "Se valorará la capacidad de síntesis, claridad y organización expositiva, referencias cronológicas y espaciales, y adecuación al tema planteado.",
      }
    ]
  },
  {
    id: 15, año: 2021, tipo: "Ordinaria", opcion: "B", dia: "Lunes",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
{
        id: "h-2021-Lunes-B-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "1. Los pueblos prerromanos. Las colonizaciones históricas: fenicios y griegos. Tartesos.\n2. Al Ándalus: economía, sociedad y cultura.\n3. Los primeros núcleos de resistencia cristiana. Principales etapas de la Reconquista. Modelos de repoblación.\n4. El Imperio de los Austrias: España bajo Carlos I. Política interior y conflictos europeos.\n5. Los Austrias del siglo XVII: el gobierno de validos. La crisis de 1640.\n6. La España del siglo XVIII. Expansión y transformaciones económicas: agricultura, industria y comercio con\nAmérica. Causas del despegue económico de Cataluña.",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
{
        id: "h-2021-Lunes-B-fuente",
        imagen_url: "/historia-imgs/20-21 ordianria HE B lunes.PNG",
        tipo: "fuente",
        label: "Fuente",
        enunciado: "1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo a la siguiente imagen. (Puntuación máxima: 0,5 puntos).\n2. Explique el contexto histórico de la guerra entre España y Estados Unidos. (Puntuación máxima: 1 punto).\nSoldados españoles en Cuba (Fondo: Biblioteca Nacional)",
        puntuacion: 1.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        pdfFuente: "/historia-pdfs/historia-2021-lunes.pdf",
        paginaFuente: 2,
      },
{
        id: "h-2021-Lunes-B-texto",
        tipo: "texto",
        label: "Texto",
        enunciado: "ANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad el contenido del texto. (Puntuación máxima: 0,5 puntos).\n2. Señale las ideas fundamentales del texto. (Puntuación máxima: 1 punto).\n3. Responda a la siguiente cuestión (Puntuación máxima: 3 puntos): La integración de España en Europa.\nConsecuencias económicas y sociales.",
        puntuacion: 4.5,
        criterios: "Se valorará la comprensión del texto, el resumen, la explicación de las ideas fundamentales y la contextualización histórica precisa.",
        texto_fuente: "“Artículo 1. Con arreglo a la presente Acta:\n-Se entenderá por Tratados originarios, el Tratado constitutivo de la Comunidad Europea del Carbón y del\nAcero, el Tratado constitutivo de la Comunidad Económica Europea y el Tratado constitutivo de la Comunidad\nEuropea de la Energía Atómica, tal como han sido completados (…)\n-Se entenderá por Estados miembros actuales, el Reino de Bélgica, el Reino de Dinamarca, la República\nFederal de Alemania, la República Helénica, la República Francesa, Irlanda, la República Italiana, el Gran\nDucado de Luxemburgo, el Reino de los Países Bajos y el Reino Unido de Gran Bretaña e Irlanda del Norte;\n-Se entenderá por Comunidad en su composición actual, la Comunidad compuesta por los Estados miembros actuales;\n-Se entenderá por Comunidad en su composición ampliada, la Comunidad en su composición posterior tanto a la adhesión de 1972 como a la de 1979;\n-Se entenderá por nuevos Estados miembros, el Reino de España y la República Portuguesa”.\nActa relativa a las condiciones de adhesión de España y Portugal a la Comunidad Económica Europea y a las adaptaciones de los Tratados (1985).",
      }
    ]
  },
  {
    id: 16, año: 2021, tipo: "Ordinaria", opcion: "A", dia: "Martes",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
{
        id: "h-2021-Martes-A-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "1. El reino visigodo: origen y organización política. Los concilios.\n2. Al Ándalus: reinos de taifas. Reino nazarí.\n3. Organización política de la Corona de Castilla, de la Corona de Aragón y del Reino de Navarra al final de la\nEdad Media.\n4. El Imperio de los Austrias: España bajo Carlos I. Política interior y conflictos europeos.\n5. Exploración y colonización de América. Consecuencias de los descubrimientos en España, Europa y América.\n6. La nueva Monarquía Borbónica. Los Decretos de Nueva Planta. Modelo de Estado y alcance de las reformas.",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
{
        id: "h-2021-Martes-A-fuente",
        tipo: "fuente",
        label: "Fuente",
        enunciado: "1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo a la siguiente imagen. (Puntuación máxima: 0,5 puntos).\n2. Explique el contexto histórico de los orígenes de la Dictadura de Primo de Rivera. (Puntuación máxima: 1 punto).\nFotografía de Alfonso XIII con los miembros del Directorio Militar (Fuente ABC)",
        puntuacion: 1.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        pdfFuente: "/historia-pdfs/historia-2021-martes.pdf",
        paginaFuente: 1,
      },
{
        id: "h-2021-Martes-A-tema",
        tipo: "tema",
        label: "Tema",
        enunciado: "Desarrolle el tema: La Guerra de la Independencia: antecedentes y causas. Bandos en conflicto y fases de la guerra.",
        puntuacion: 4.5,
        criterios: "Se valorará la capacidad de síntesis, claridad y organización expositiva, referencias cronológicas y espaciales, y adecuación al tema planteado.",
      }
    ]
  },
  {
    id: 17, año: 2021, tipo: "Ordinaria", opcion: "B", dia: "Martes",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
{
        id: "h-2021-Martes-B-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "1. Conquista y romanización de la Península Ibérica. Principales aportaciones romanas en los ámbitos social, económico y cultural.\n2. Al Ándalus: la conquista musulmana de la Península Ibérica. Emirato y califato de Córdoba.\n3. Los reinos cristianos en la Edad Media: organización política, régimen señorial y sociedad estamental.\n4. La Monarquía Hispánica de Felipe II. Gobierno y administración. Los problemas internos. Guerras y sublevación en Europa.\n5. Los Austrias del siglo XVII: el gobierno de validos. La crisis de 1640.\n6. La Guerra de Sucesión Española y el sistema de Utrecht. Los Pactos de Familia.",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
{
        id: "h-2021-Martes-B-fuente",
        tipo: "fuente",
        label: "Fuente",
        enunciado: "1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo a la siguiente imagen. (Puntuación máxima: 0,5 puntos).\n2. Explique el contexto histórico de la evolución demográfica entre 1797 y 1833 (Puntuación máxima: 1 punto).\nFuente: Pérez Moreda, Vicente, en Sánchez Albornoz, N. (comp.), La modernización económica de España\n1830-1930, Madrid, Alianza, 1985, p. 26.",
        puntuacion: 1.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        pdfFuente: "/historia-pdfs/historia-2021-martes.pdf",
        paginaFuente: 2,
      },
{
        id: "h-2021-Martes-B-texto",
        tipo: "texto",
        label: "Texto",
        enunciado: "ANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad el contenido del texto. (Puntuación máxima: 0,5 puntos).\n2. Señale las ideas fundamentales del texto. (Puntuación máxima: 1 punto).\n3. Responda a la siguiente cuestión (Puntuación máxima: 3 puntos): La Transición: alternativas políticas tras la muerte de Franco. El papel del rey y el gobierno de Adolfo Suárez.",
        puntuacion: 4.5,
        criterios: "Se valorará la comprensión del texto, el resumen, la explicación de las ideas fundamentales y la contextualización histórica precisa.",
        texto_fuente: "“Señor Speaker, señor Presidente en funciones, miembros del Congreso, me honra sobremanera vuestra invitación a dirigir este mensaje al Congreso de los Estados Unidos y, a su través, al pueblo que vosotros representáis. Permitidme comenzar hablando del pasado de nuestros dos países, para luego pasar a examinar el presente y el futuro (…)\nLa Monarquía española se ha comprometido desde el primer día a ser una institución abierta en la que todos los ciudadanos tengan un sitio holgado para su participación política sin discriminación de ninguna clase y sin presiones indebidas de grupos sectarios y extremistas. La Corona ampara a la totalidad del pueblo y a cada uno de los ciudadanos, garantizando a través del derecho, y mediante el ejercicio de las libertades civiles, el imperio de la justicia.\nLa Monarquía hará que, bajo los principios de la democracia, se mantengan en España la paz social y la estabilidad política, a la vez que se asegure el acceso ordenado al poder de las distintas alternativas de gobierno, según los deseos del pueblo libremente expresados”.\nDiscurso del Rey Juan Carlos I, Washington, 2 de junio de 1976.",
      }
    ]
  },
  {
    id: 18, año: 2020, tipo: "Ordinaria", opcion: "A", dia: "Lunes",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
{
        id: "h-2020-Lunes-A-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "1. Sociedad y economía en el Paleolítico y Neolítico. La pintura rupestre.\n2. Al Ándalus: reinos de taifas. Reino nazarí.\n3. Los reinos cristianos en la Edad Media: organización política, régimen señorial y sociedad estamental.\n4. Los Austrias del siglo XVII: el gobierno de validos. La crisis de 1640.\n5. Crisis y decadencia de la Monarquía Hispánica: el reinado de Carlos II y el problema sucesorio.\n6. Ideas fundamentales de la Ilustración. El despotismo ilustrado: Carlos III.",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
{
        id: "h-2020-Lunes-A-fuente",
        imagen_url: "/historia-imgs/19-20 ordinaria HE A Lunes.PNG",
        tipo: "fuente",
        label: "Fuente",
        enunciado: "1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo a la siguiente imagen. (Puntuación máxima: 0,5 puntos).\n2. Explique el contexto histórico de la revolución industrial en la España del siglo XIX. El sistema de comunicaciones: el ferrocarril. (Puntuación máxima: 1 punto).\nLos directores de la línea Barcelona-Mataró (1861). Fuente: Ayuntamiento de Mataró.",
        puntuacion: 1.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        pdfFuente: "/historia-pdfs/historia-2020-lunes.pdf",
        paginaFuente: 1,
      },
{
        id: "h-2020-Lunes-A-tema",
        tipo: "tema",
        label: "Tema",
        enunciado: "Desarrolle el tema: La intervención en Marruecos. Repercusiones de la Primera Guerra Mundial en España. La crisis de 1917 y el Trienio Bolchevique.",
        puntuacion: 4.5,
        criterios: "Se valorará la capacidad de síntesis, claridad y organización expositiva, referencias cronológicas y espaciales, y adecuación al tema planteado.",
      }
    ]
  },
  {
    id: 19, año: 2020, tipo: "Ordinaria", opcion: "B", dia: "Lunes",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
{
        id: "h-2020-Lunes-B-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "1. Conquista y romanización de la Península Ibérica. Principales aportaciones romanas en los ámbitos social, económico y cultural.\n2. Al Ándalus: la conquista musulmana de la Península Ibérica. Emirato y califato de Córdoba.\n3. Los primeros núcleos de resistencia cristiana. Principales etapas de la Reconquista. Modelos de repoblación.\n4. El significado de 1492. La guerra de Granada y el descubrimiento de América.\n5. Principales factores de la crisis demográfica y económica del siglo XVII y sus consecuencias.\n6. La nueva Monarquía Borbónica. Los Decretos de Nueva Planta. Modelo de Estado y alcance de las reformas.",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
{
        id: "h-2020-Lunes-B-fuente",
        imagen_url: "/historia-imgs/19-20 ordinaria HE B Lunes.PNG",
        tipo: "fuente",
        label: "Fuente",
        enunciado: "1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo a la siguiente imagen. (Puntuación máxima: 0,5 puntos).\n2. Explique el contexto histórico del golpe de Estado de 23 de febrero de 1981. (Puntuación máxima: 1 punto).\nTeniente Coronel Antonio Tejero en el Congreso de los Diputados. Fuente: Agencia EFE.",
        puntuacion: 1.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        pdfFuente: "/historia-pdfs/historia-2020-lunes.pdf",
        paginaFuente: 2,
      },
{
        id: "h-2020-Lunes-B-texto",
        tipo: "texto",
        label: "Texto",
        enunciado: "ANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad el contenido del texto. (Puntuación máxima: 0,5 puntos).\n2. Señale las ideas fundamentales del texto. (Puntuación máxima: 1 punto).\n3. Responda a la siguiente cuestión: El Sexenio Democrático (1868-1874). Evolución política: el gobierno provisional. (Puntuación máxima: 3 puntos).",
        puntuacion: 4.5,
        criterios: "Se valorará la comprensión del texto, el resumen, la explicación de las ideas fundamentales y la contextualización histórica precisa.",
        texto_fuente: "¡Españoles! La ciudad de Cádiz, puesta en armas con toda su provincia, con la armada anclada en el puerto... declara solemnemente que niega su obediencia al gobierno que reside en Madrid, segura de que es leal intérprete de todos los ciudadanos que no hayan perdido el sentimiento de la dignidad, y resuelta a no deponer las armas hasta que la Nación recobre su soberanía, manifieste su voluntad y se cumpla.\nHollada (pisoteada) la ley fundamental, (…); corrompido el sufragio por la amenaza y el soborno; dependiente la seguridad individual, no del derecho propio sino de la irresponsable voluntad cualquiera de las autoridades, muerto el municipio, pasto la administración y la hacienda de la inmoralidad y del agio (negocio), tiranizada la enseñanza, muda la prensa... ¡Españoles!, ¿quién aborrece tanto que se atreva a exclamar: “así ha de ser siempre”? (…).\n(…) queremos vivir la vida de la honra y la libertad.\nQueremos que un gobierno provisional, que represente todas las fuerzas vivas del país, asegure el orden, en tanto que el sufragio universal echa los cimientos de nuestra regeneración social y política.\nContamos para realizarlo (…) con el concurso de todos los liberales, unánimes y compactos ante el común peligro; con el apoyo de las clases acomodadas (…) con los ardientes partidarios de las libertades individuales (…); con el apoyo de los ministros de altar, (…); con el pueblo (…) Acudid todos a las armas (…) con la solemne y poderosa serenidad con que la justicia empuña su espada. (…) ¡Viva\nEspaña con honra!\nEn Cádiz, 19 de septiembre de 1868. Prim, Topete, Dulce, Serrano, Primo de Rivera.",
      }
    ]
  },
  {
    id: 20, año: 2020, tipo: "Ordinaria", opcion: "A", dia: "Martes",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
{
        id: "h-2020-Martes-A-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "1. El reino visigodo: origen y organización política. Los concilios.\n2. Al Ándalus: reinos de taifas. Reino nazarí.\n3. Los reinos cristianos en la Edad Media: organización política, régimen señorial y sociedad estamental.\n4. La Monarquía Hispánica de Felipe II. Gobierno y administración. Los problemas internos.\nGuerras y sublevación en Europa.\n5. La guerra de los Treinta Años y la pérdida de la hegemonía española en Europa.\n6. La Guerra de la Sucesión Española y el sistema de Utrecht. Los Pactos de Familia.",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
{
        id: "h-2020-Martes-A-fuente",
        tipo: "fuente",
        label: "Fuente",
        enunciado: "1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo a la siguiente imagen. (Puntuación máxima: 0,5 puntos).\n2. Explique el contexto histórico de la Guerra de la Independencia (Puntuación máxima: 1 punto).\nCuadro. La rendición de Bailén. Autor: Casado del Alisal. Fuente: Museo del Prado.",
        puntuacion: 1.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        pdfFuente: "/historia-pdfs/historia-2020-martes.pdf",
        paginaFuente: 1,
      },
{
        id: "h-2020-Martes-A-tema",
        tipo: "tema",
        label: "Tema",
        enunciado: "Desarrolle el tema: La creación del Estado franquista. Grupos ideológicos y apoyos sociales. Etapas de la dictadura y principales características de cada una de ellas. El contexto internacional: del aislamiento al reconocimiento exterior.",
        puntuacion: 4.5,
        criterios: "Se valorará la capacidad de síntesis, claridad y organización expositiva, referencias cronológicas y espaciales, y adecuación al tema planteado.",
      }
    ]
  },
  {
    id: 21, año: 2020, tipo: "Ordinaria", opcion: "B", dia: "Martes",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
{
        id: "h-2020-Martes-B-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "1. Los pueblos prerromanos. Las colonizaciones históricas: fenicios y griegos. Tartesos.\n2. Al Ándalus: economía, sociedad y cultura.\n3. Los primeros núcleos de resistencia cristiana. Principales etapas de la Reconquista. Modelos de repoblación.\n4. Exploración y colonización de América. Consecuencias de los descubrimientos en España, Europa y América.\n5. Los Austrias del siglo XVII: el gobierno de validos. La crisis de 1640.\n6. La España del siglo XVIII. Expansión y transformaciones económicas: agricultura, industria y comercio con América. Causas del despegue económico de Cataluña.",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
{
        id: "h-2020-Martes-B-fuente",
        tipo: "fuente",
        label: "Fuente",
        enunciado: "1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo a la siguiente imagen. (Puntuación máxima: 0,5 puntos).\n2. Explique el contexto histórico de la Transición (Puntuación máxima: 1 punto).\nCuadro El Abrazo, Juan Genovés. Fuente: Museo Reina Sofía.",
        puntuacion: 1.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        pdfFuente: "/historia-pdfs/historia-2020-martes.pdf",
        paginaFuente: 2,
      },
{
        id: "h-2020-Martes-B-texto",
        tipo: "texto",
        label: "Texto",
        enunciado: "ANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad y concisión el contenido del texto. (Puntuación máxima: 0,5 puntos).\n2. Señale y explique las ideas fundamentales del texto. (Puntuación máxima: 1 punto).\n3. Responda a la siguiente cuestión: El reinado efectivo de Isabel II (1843-1868). Evolución política. La\nConstitución de 1845. (Puntuación máxima: 3 puntos).",
        puntuacion: 4.5,
        criterios: "Se valorará la comprensión del texto, el resumen, la explicación de las ideas fundamentales y la contextualización histórica precisa.",
        texto_fuente: "Artículo 12: La potestad de hacer las leyes reside en la Cortes con el Rey.\nArtículo 13: Las Cortes se componen de dos Cuerpos colegisladores, iguales en facultades: el Senado y el Congreso de los Diputados.\nArtículo 14: El número de Senadores es ilimitado: su nombramiento pertenece al Rey. (…).\nArtículo 20: El Congreso de los Diputados se compondrá de los que nombre las Juntas electorales en la forma que determine la ley. Se nombrará un Diputado a los menos por cada cincuenta mil almas de población. (…).\nArtículo 22: Para ser Diputado se requiere ser español, de estado seglar, haber cumplido veinte y cinco años, disfrutar la renta procedente de bienes raíces, o pagar por contribuciones directas la cantidad que la ley electoral exija, y tener las demás circunstancias que en la misma ley se prefijen.\nLas Cortes en la Constitución de la Monarquía española de 1845.",
      }
    ]
  },
  {
    id: 22, año: 2019, tipo: "Ordinaria", opcion: "A",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
{
        id: "h-2019-ordinaria-A-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "1. Los pueblos prerromanos. Las colonizaciones históricas: fenicios y griegos. Tartesos.\n2. Al Ándalus: economía, sociedad y cultura.\n3. Los reinos cristianos en la Edad Media: organización política, régimen señorial y sociedad estamental.\n4. El significado de 1492. La guerra de Granada y el descubrimiento de América.\n5. Los Austrias del siglo XVII: el gobierno de validos. La crisis de 1640.\n6. La Guerra de Sucesión Española y el sistema de Utrecht. Los Pactos de Familia.",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
{
        id: "h-2019-ordinaria-A-fuente",
        imagen_url: "/historia-imgs/18-19 ordinaria HE A.PNG",
        tipo: "fuente",
        label: "Fuente",
        enunciado: "Relacione esta fotografía con la integración de España en Europa.\nFelipe González firma el Tratado de Adhesión a la CEE el 12 de junio de 1985.",
        puntuacion: 1.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        pdfFuente: "/historia-pdfs/historia-2019.pdf",
        paginaFuente: 1,
      },
{
        id: "h-2019-ordinaria-A-tema",
        tipo: "tema",
        label: "Tema",
        enunciado: "Desarrolle el tema: El problema de Cuba y la guerra entre España y Estados Unidos. La crisis de 1898 y sus consecuencias económicas, políticas e ideológicas.",
        puntuacion: 4.5,
        criterios: "Se valorará la capacidad de síntesis, claridad y organización expositiva, referencias cronológicas y espaciales, y adecuación al tema planteado.",
      }
    ]
  },
  {
    id: 23, año: 2019, tipo: "Ordinaria", opcion: "B",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
{
        id: "h-2019-ordinaria-B-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "1. El reino visigodo: origen y organización política. Los concilios.\n2. Los primeros núcleos de resistencia cristiana. Principales etapas de la Reconquista. Modelos de repoblación.\n3. Organización política de la Corona de Castilla, de la Corona de Aragón y del Reino de Navarra al final de la Edad Media.\n4. La Monarquía Hispánica de Felipe II. Gobierno y administración. Los problemas internos. Guerras y sublevación en Europa.\n5. Principales factores de la crisis demográfica y económica del siglo XVII y sus consecuencias.\n6. La nueva Monarquía Borbónica. Los Decretos de Nueva Planta. Modelo de Estado y alcance de las reformas.",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
{
        id: "h-2019-ordinaria-B-fuente",
        imagen_url: "/historia-imgs/18-19 ordinaria HE B.PNG",
        tipo: "fuente",
        label: "Fuente",
        enunciado: "Relacione este gráfico con las Cortes de Cádiz (1812).\nLas Cortes de Cádiz: participación por grupos sociales.",
        puntuacion: 1.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        pdfFuente: "/historia-pdfs/historia-2019.pdf",
        paginaFuente: 2,
      },
{
        id: "h-2019-ordinaria-B-texto",
        tipo: "texto",
        label: "Texto",
        enunciado: "ANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad y concisión el contenido del texto. (Puntuación máxima: 0’5 puntos).\n2. Señale y explique las ideas fundamentales del texto. (Puntuación máxima: 1 punto).\n3. Responda a la siguiente cuestión. (Puntuación máxima: 3 puntos): La creación del estado franquista.\nGrupos ideológicos y apoyo social.",
        puntuacion: 4.5,
        criterios: "Se valorará la comprensión del texto, el resumen, la explicación de las ideas fundamentales y la contextualización histórica precisa.",
        texto_fuente: "“Llegada la guerra a un punto muy avanzado y próxima la hora victoriosa, urge ya acometer la gran tarea de la paz, cristalizando en el estado nuevo el pensamiento y el estilo de nuestra Revolución Nacional.\nUnidos por un pensamiento y una disciplina común, los españoles todos han de ocupar su puesto en la gran tarea. Esta unificación (...) precisa tener en cuenta que (...) Falange Española y Requetés han sido los dos exponentes auténticos del espíritu del alzamiento nacional iniciado por nuestro glorioso Ejército el diecisiete de julio. Como en otros países de régimen totalitario, la fuerza tradicional viene ahora en\nEspaña a integrarse en la fuerza nueva. Falange Española aportó con su programa masas juveniles, (...) los Requetés [aportaron], junto a su ímpetu guerrero, el sagrado depósito de la tradición española (...).\nPor todo lo expuesto, DISPONGO:\nArtículo 1º. Falange Española y Requetés, con sus actuales servicios y elementos, se integran, bajo Mi\nJefatura, en una sola entidad política de carácter nacional, que de momento se denominará Falange\nEspañola Tradicionalista y de las J.O.N.S. Esta organización, intermedia entre la sociedad y el Estado, tiene la misión principal de comunicar al Estado el aliento del pueblo y de llevar a éste el pensamiento de aquél a través de las virtudes político-morales, de servicio, jerarquía y hermandad (...). Quedan disueltas las demás organizaciones y partidos políticos”.\nDado en Salamanca a diecinueve de abril de mil novecientos treinta y siete.\nFrancisco Franco, Boletín Oficial del Estado (Burgos), 20 de Abril de 1937.",
      }
    ]
  },
  {
    id: 24, año: 2018, tipo: "Ordinaria", opcion: "A",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
{
        id: "h-2018-ordinaria-A-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "1. Sociedad y economía en el Paleolítico y Neolítico. La pintura rupestre.\n2. Al Ándalus: reinos de taifas. Reino nazarí.\n3. Organización política de la Corona de Castilla, de la Corona de Aragón y del Reino de Navarra al final de la Edad Media.\n4. La Monarquía Hispánica de Felipe II. Gobierno y administración. Los problemas internos. Guerras y sublevación en Europa.\n5. Crisis y decadencia de la Monarquía Hispánica: el reinado de Carlos II y el problema sucesorio.\n6. La nueva Monarquía Borbónica. Los Decretos de Nueva Planta. Modelo de Estado y alcance de las reformas.",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
{
        id: "h-2018-ordinaria-A-fuente",
        imagen_url: "/historia-imgs/17-18 ordinaria HE.PNG",
        tipo: "fuente",
        label: "Fuente",
        enunciado: "Relacione este gráfico con la crisis de 1917 y el trienio bolchevique.\nNúmero de huelgas en España entre 1905 y 1930.",
        puntuacion: 1.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        pdfFuente: "/historia-pdfs/historia-2018.pdf",
        paginaFuente: 1,
      },
{
        id: "h-2018-ordinaria-A-tema",
        tipo: "tema",
        label: "Tema",
        enunciado: "Desarrolle el tema: El reinado de Isabel II (1833-1868): la primera guerra carlista. Evolución política, partidos y conflictos. El Estatuto Real de 1834 y las Constituciones de 1837 y 1845.",
        puntuacion: 4.5,
        criterios: "Se valorará la capacidad de síntesis, claridad y organización expositiva, referencias cronológicas y espaciales, y adecuación al tema planteado.",
      }
    ]
  },
  {
    id: 25, año: 2018, tipo: "Ordinaria", opcion: "B",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
{
        id: "h-2018-ordinaria-B-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "1. Los pueblos prerromanos. Las colonizaciones históricas: fenicios y griegos. Tartesos.\n2. Al Ándalus: la conquista musulmana de la Península Ibérica. Emirato y califato de Córdoba.\n3. Los reinos cristianos en la Edad Media: organización política, régimen señorial y sociedad estamental.\n4. El Imperio de los Austrias: España bajo Carlos I. Política interior y conflictos europeos.\n5. La guerra de los Treinta Años y la pérdida de la hegemonía española en Europa.\n6. La España del siglo XVIII. Expansión y transformaciones económicas: agricultura, industria y comercio con América. Causas del despegue económico de Cataluña.",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
{
        id: "h-2018-ordinaria-B-fuente",
        imagen_url: "/historia-imgs/17-18 ordinaria HE B.PNG",
        tipo: "fuente",
        label: "Fuente",
        enunciado: "Relacione esta imagen con la evolución política en el Sexenio Democrático: el reinado de Amadeo de\nSaboya.\nAmadeo I frente al féretro del General Prim en 1871 (Por Antonio Gisbert)",
        puntuacion: 1.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        pdfFuente: "/historia-pdfs/historia-2018.pdf",
        paginaFuente: 2,
      },
{
        id: "h-2018-ordinaria-B-texto",
        tipo: "texto",
        label: "Texto",
        enunciado: "ANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Explique razonadamente el tipo de texto y resuma las ideas fundamentales del mismo (puntuación máxima: 1,5 puntos).\n2. Responda a la siguiente cuestión (puntuación máxima: 3 puntos): El gobierno radical cedista (1933-\n1935). La Revolución de Asturias.",
        puntuacion: 4.5,
        criterios: "Se valorará la comprensión del texto, el resumen, la explicación de las ideas fundamentales y la contextualización histórica precisa.",
        texto_fuente: "A todos los trabajadores:\nEl día 5 del mes en curso comenzó la insurrección gloriosa del proletariado contra la burguesía y después de probada la capacidad revolucionaria de las masas obreras para los objetivos de Gobierno ofreciendo alternativas de ataque y defensa ponderadas, estimamos necesaria una tregua en la lucha, deponiendo las armas en evitación de males mayores. Por ello, reunidos todos los Comités\nRevolucionarios con el provincial, se acordó la vuelta a la normalidad, encareciéndoos a todos os reintegréis de forma ordenada, consciente y serena, al trabajo.\nEsta retirada nuestra, camaradas, la consideramos honrosa por inevitable. La diferencia de medios de lucha, cuando nosotros hemos rendido tributo de ideales y hombría en el teatro de la guerra, y el enemigo cuenta con medios modernos de combate, nos llevó por ética revolucionaria a adoptar esta actitud extrema. Es un alto en el camino, un paréntesis, un descanso reparador después de tanto sobresfuerzo.\nNosotros, camaradas, os recordamos esta frase heroica: “Al proletariado se le puede derrotar, pero jamás vencer”.\nÚltima proclama del Comité Provincial Revolucionario de Asturias, 18 de octubre de 1934.",
      }
    ]
  }
]
// =============================================
// MATEMÀTIQUES II — PAU CATALUNYA
// =============================================
// Estructura: cada "pregunta" es un ejercicio individual
// Años disponibles: 2023 (S1, S5), 2024 (S1), 2025 (S1 ord, S3 ext)
// El alumno en 2023 respondía 4 de 6; en 2025, 4 obligatorios (ej4 con opción A/B)
// Tratamos cada ejercicio como pregunta independiente

export interface PreguntaCat {
  id: string;
  year: number;
  tipo: "Ordinaria" | "Extraordinaria";
  serie: string;
  ejercicio: number;
  opcion?: "A" | "B"; // solo para ejercicio 4 en 2025
  tema: string;
  enunciado: string;
  apartados: string[];
  criterios: string;
  puntuacion: number;
}

export const examenesCatMates: PreguntaCat[] = [

  // ─────────────────────────────────────────
  // 2023 · SÈRIE 1 · ORDINARIA
  // ─────────────────────────────────────────
  {
    id: "cat-mat-2023-ord-s1-1",
    year: 2023,
    tipo: "Ordinaria",
    serie: "Sèrie 1",
    ejercicio: 1,
    tema: "Derivadas y función cúbica",
    enunciado:
      "Calculeu els coeficients $a$, $b$, $c$ i $d$ de la funció $f(x) = ax^3 + bx^2 + cx + d$ si sabem que l'equació de la recta tangent a la gràfica de la funció $f$ en el punt d'inflexió $(1, 0)$ és $y = -3x + 3$ i que la funció té un extrem relatiu en el punt de la gràfica d'abscissa $x = 0$.",
    apartados: [
      "Calculeu els coeficients a, b, c i d. [2,5 punts]",
    ],
    criterios:
      "Se valora el planteamiento correcto de las condiciones (punto de inflexión, recta tangente y extremo relativo), el sistema de ecuaciones resultante y la resolución correcta de los coeficientes.",
    puntuacion: 2.5,
  },
  {
    id: "cat-mat-2023-ord-s1-2",
    year: 2023,
    tipo: "Ordinaria",
    serie: "Sèrie 1",
    ejercicio: 2,
    tema: "Matrices",
    enunciado:
      "Considereu les dues matrius $$A = \\begin{pmatrix}0 & 1 \\\\ 1 & 0\\end{pmatrix}$$ i $$B = \\begin{pmatrix}p^2 & 0 & -1 \\\\ 1 & -1 & 0\\end{pmatrix}$$ (vegeu enunciat original).\n\na) Calculeu les matrius $A\\cdot B$ i $B\\cdot A$.\nb) Siguin $C$ i $D$ dues matrius quadrades del mateix ordre que satisfan $C\\cdot D = C$ i $D\\cdot C = D$. Comproveu que les dues matrius, $C$ i $D$, són idempotents.\n\nNota: Una matriu quadrada s'anomena idempotent si coincideix amb el seu quadrat.",
    apartados: [
      "a) Calculeu les matrius $A\\cdot B$ i $B\\cdot A$. [1,5 punts]",
      "b) Demostreu que C i D són idempotents. [1 punt]",
    ],
    criterios:
      "(a) 0,75 punts por cada producto de matrices correcto. (b) 0,5 punts por $C^2=C$ y 0,5 punts por $D^2=D$, razonando a partir de las hipótesis $C\\cdot D=C$ y $D\\cdot C=D$.",
    puntuacion: 2.5,
  },
  {
    id: "cat-mat-2023-ord-s1-3",
    year: 2023,
    tipo: "Ordinaria",
    serie: "Sèrie 1",
    ejercicio: 3,
    tema: "Integral y función primitiva",
    enunciado:
      "Sigui $f'(x) = \\dfrac{x^2 - 4x + 3}{x - 2}$ la funció derivada d'una funció derivable $f(x)$ que passa pel punt $A = (0, 3)$.\n\na) Calculeu la funció $f(x)$.\nb) Calculeu l'equació de la recta tangent a la funció $f'(x)$ en el punt d'abscissa $x = 3$.",
    apartados: [
      "a) Calculeu la funció $f(x)$. [1,5 punts]",
      "b) Recta tangent a $f'(x)$ en $x = 3$. [1 punt]",
    ],
    criterios:
      "(a) 0,75 punts por el cálculo correcto de la primitiva y 0,75 punts por determinar la constante usando el punto A=(0,3). (b) 0,5 punts por f'(3) y la derivada de f', y 0,5 punts por la ecuación de la recta.",
    puntuacion: 2.5,
  },
  {
    id: "cat-mat-2023-ord-s1-4",
    year: 2023,
    tipo: "Ordinaria",
    serie: "Sèrie 1",
    ejercicio: 4,
    tema: "Sistemas de ecuaciones lineales",
    enunciado:
      "Sigui el sistema d'equacions lineals següent, que depèn del paràmetre real $\\lambda$:\n$$\\begin{cases}\\lambda x + y + z = 1 \\\\ x + \\lambda y + z = 1 \\\\ x + y + \\lambda z = 1\\end{cases}$$\n\na) Discutiu el sistema per als diferents valors del paràmetre $\\lambda$.\nb) Per al cas $\\lambda = -1$, resoleu el sistema, interpreteu-lo geomètricament i identifiqueu-ne la solució.",
    apartados: [
      "a) Discusión del sistema según $\\lambda$. [1,25 punts]",
      "b) Resolución e interpretación geométrica para $\\lambda = -1$. [1,25 punts]",
    ],
    criterios:
      "(a) 0,5 por el determinante, 0,25 por cada caso ($\\lambda\\neq1$, $\\lambda\\neq-2$, $\\lambda=1$, $\\lambda=-2$). (b) 0,5 por la resolución paramétrica y 0,75 por la interpretación geométrica correcta.",
    puntuacion: 2.5,
  },
  {
    id: "cat-mat-2023-ord-s1-5",
    year: 2023,
    tipo: "Ordinaria",
    serie: "Sèrie 1",
    ejercicio: 5,
    tema: "Optimización — recinto para perro",
    enunciado:
      "La Núria té un jardí rectangular i vol fer-hi un tancat (rectangular o quadrat) de $8\\ \\text{m}^2$ per al seu gos. Ha pensat de posar el tancat tocant al mur del jardí, per estalviar-se un dels quatre costats. El preu de la tanca és de $2{,}5\\ € / \\text{m}$.\n\na) Quines dimensions ha de tenir el tancat perquè el cost sigui mínim? Quin és aquest cost mínim?\nb) Si feu que un dels vèrtexs del jardí coincideixi amb un vèrtex del tancat, quants euros us podeu estalviar? Justifiqueu les dimensions de la vostra proposta.",
    apartados: [
      "a) Dimensiones para coste mínimo y valor del coste. [1,75 punts]",
      "b) Ahorro al colocar el tancat en una esquina del jardín. [0,75 punts]",
    ],
    criterios:
      "(a) 0,5 por plantear la función de coste, 0,5 por la derivada y punto crítico, 0,5 por justificar el mínimo, 0,25 por el coste final. (b) 0,75 por la propuesta justificada con cálculos.",
    puntuacion: 2.5,
  },
  {
    id: "cat-mat-2023-ord-s1-6",
    year: 2023,
    tipo: "Ordinaria",
    serie: "Sèrie 1",
    ejercicio: 6,
    tema: "Geometría — planos y rectas",
    enunciado:
      "Siguin els plans $\\pi_1: x + y = 3$ i $\\pi_2: x - z = -2$.\n\na) Trobeu l'equació general del pla $\\pi_3$, perpendicular a $\\pi_1$ i $\\pi_2$, que passa pel punt $P = (4, 1, 2)$.\nb) Sigui $r$ la recta d'intersecció de $\\pi_1$ i $\\pi_2$. Calculeu l'equació vectorial de la recta $r$.\nc) Calculeu el punt $Q$ de la recta $r$ que és més a prop del punt $P$.",
    apartados: [
      "a) Ecuación de $\\pi_3$. [0,75 punts]",
      "b) Ecuación vectorial de $r$. [0,75 punts]",
      "c) Punto Q más próximo a P. [1 punt]",
    ],
    criterios:
      "(a) 0,75 por el producto vectorial y la ecuación del plano. (b) 0,75 por la dirección de r y su ecuación vectorial. (c) 0,5 por el planteamiento y 0,5 por el cálculo del punto.",
    puntuacion: 2.5,
  },

  // ─────────────────────────────────────────
  // 2023 · SÈRIE 5 · ORDINARIA
  // ─────────────────────────────────────────
  {
    id: "cat-mat-2023-ord-s5-1",
    year: 2023,
    tipo: "Ordinaria",
    serie: "Sèrie 5",
    ejercicio: 1,
    tema: "Integral definida — área entre curvas",
    enunciado:
      "Considereu les funcions $f(x) = -x^2 + x + 6$ i $g(x) = -9x + 3x^2$.\n\na) Calculeu l'àrea de la regió delimitada per les dues funcions.\nb) Trobeu l'equació de la recta tangent a la funció $f(x)$ en el punt $(-2, 0)$. Representeu aquesta recta tangent i les funcions $f(x)$ i $g(x)$ en uns mateixos eixos de coordenades.",
    apartados: [
      "a) Área entre $f(x)$ y $g(x)$. [1,25 punts]",
      "b) Recta tangente a $f(x)$ en $(-2, 0)$ y representación. [1,25 punts]",
    ],
    criterios:
      "(a) 0,5 por los puntos de corte, 0,5 por el planteamiento de la integral y 0,25 por el cálculo. (b) 0,5 por la derivada y la recta tangente, 0,75 por la representación correcta.",
    puntuacion: 2.5,
  },
  {
    id: "cat-mat-2023-ord-s5-2",
    year: 2023,
    tipo: "Ordinaria",
    serie: "Sèrie 5",
    ejercicio: 2,
    tema: "Sistemas de ecuaciones lineales con parámetro",
    enunciado:
      "Considereu el sistema d'equacions lineals:\n$$\\begin{cases}x + y + z = 1 \\\\ kx + y - z = k \\\\ x - y + kz = 0\\end{cases}$$\non $k$ és un paràmetre real.\n\na) Discutiu el sistema en funció del valor de $k$.\nb) Resoleu el sistema per a $k = 0$ i per a $k = 1$.",
    apartados: [
      "a) Discusión según k. [1,5 punts]",
      "b) Resolución para $k = 0$ y $k = 1$. [1 punt]",
    ],
    criterios:
      "(a) 0,5 por el determinante, 0,25 por cada caso. (b) 0,5 por cada sistema resuelto correctamente.",
    puntuacion: 2.5,
  },
  {
    id: "cat-mat-2023-ord-s5-3",
    year: 2023,
    tipo: "Ordinaria",
    serie: "Sèrie 5",
    ejercicio: 3,
    tema: "Geometría — rectas en el espacio",
    enunciado:
      "Considereu les rectes a l'espai $r: x = -y = z + m$ i $s: \\dfrac{x-1}{2} = \\dfrac{y+1}{-1} = \\dfrac{z-2}{1}$, on $m$ és un paràmetre real.\n\na) Estudieu la posició relativa per als diferents valors del paràmetre $m$.\nb) Calculeu $m$ perquè la distància entre les rectes $r$ i $s$ sigui de $\\sqrt{6}/2$ unitats.",
    apartados: [
      "a) Posición relativa según m. [1,25 punts]",
      "b) Valor de $m$ para distancia $\\sqrt{6}/2$. [1,25 punts]",
    ],
    criterios:
      "(a) 0,5 por los vectores directores, 0,75 por el análisis completo de casos. (b) 0,5 por plantear la fórmula de distancia y 0,75 por el cálculo.",
    puntuacion: 2.5,
  },
  {
    id: "cat-mat-2023-ord-s5-4",
    year: 2023,
    tipo: "Ordinaria",
    serie: "Sèrie 5",
    ejercicio: 4,
    tema: "Optimización — torre de comunicaciones",
    enunciado:
      "En una carretera principal hi trobem el poble $A$. A $12\\ \\text{km}$ del poble $A$, hi ha un encreuament $O$ amb una carretera secundària que talla perpendicularment la carretera principal. A $9\\ \\text{km}$ de l'encreuament, a la carretera secundària, hi trobem el poble $B$. Es vol construir una torre de comunicacions $T$ en un punt de la carretera principal entre $A$ i $O$. Instal·lar el cable entre $T$ i $B$ costa $250\\ €/\\text{km}$ i entre $T$ i $A$ costa $125\\ €/\\text{km}$. Determineu la distància de $O$ a $T$ que minimitza el cost del cablejat i quin serà el cost mínim.",
    apartados: [
      "Distancia OT óptima y coste mínimo. [2,5 punts]",
    ],
    criterios:
      "0,5 por plantear la función de coste, 0,5 por la derivada, 0,5 por el punto crítico y justificación del mínimo, 0,5 por las dimensiones y 0,5 por el coste total.",
    puntuacion: 2.5,
  },
  {
    id: "cat-mat-2023-ord-s5-5",
    year: 2023,
    tipo: "Ordinaria",
    serie: "Sèrie 5",
    ejercicio: 5,
    tema: "Matrices — familia paramétrica",
    enunciado:
      "Considereu la família $S$ de matrius de la forma $$A = \\begin{pmatrix}a & b \\\\ 0 & 1\\end{pmatrix},$$ on $a, b \\in \\mathbb{R}$.\n\na) Calculeu $A^2$.\nb) Trobeu totes les matrius de la família $S$ que verifiquin $A^2 = I$, on $I$ és la matriu identitat d'ordre 2.",
    apartados: [
      "a) Cálculo de $A^2$. [1,25 punts]",
      "b) Matrices $A$ tales que $A^2 = I$. [1,25 punts]",
    ],
    criterios:
      "(a) 1,25 por el cálculo correcto de $A^2$. (b) 0,5 por plantear el sistema de ecuaciones y 0,75 por encontrar todos los casos.",
    puntuacion: 2.5,
  },
  {
    id: "cat-mat-2023-ord-s5-6",
    year: 2023,
    tipo: "Ordinaria",
    serie: "Sèrie 5",
    ejercicio: 6,
    tema: "Derivadas — extremos y parámetros",
    enunciado:
      "Sigui la funció $f(x) = \\dfrac{ax^2 + b}{x}$.\n\na) Calculeu els valors dels paràmetres $a$ i $b$ si sabem que la gràfica de la funció $f$ té un extrem relatiu en $x = -1$ i passa pel punt $(2, 5/2)$.\nb) Per al cas $a = b$, calculeu i classifiqueu els extrems relatius de la funció.",
    apartados: [
      "a) Determinación de a y b. [1,25 punts]",
      "b) Extremos relativos para a = b. [1,25 punts]",
    ],
    criterios:
      "(a) 0,5 por $f'(-1)=0$, 0,5 por $f(2)=5/2$ y 0,25 por la solución. (b) 0,5 por la derivada, 0,5 por los puntos críticos y 0,25 por la clasificación.",
    puntuacion: 2.5,
  },

  // ─────────────────────────────────────────
  // 2024 · SÈRIE 1 · ORDINARIA
  // ─────────────────────────────────────────
  {
    id: "cat-mat-2024-ord-s1-1",
    year: 2024,
    tipo: "Ordinaria",
    serie: "Sèrie 1",
    ejercicio: 1,
    tema: "Análisis — función logarítmica, asíntotas, tangente",
    enunciado:
      "Considereu la funció $f(x) = \\dfrac{2\\ln x}{x}$, definida per a $x > 0$.\n\na) Estudieu-ne els màxims i els mínims, i les zones de creixement i de decreixement.\nb) Aquesta funció té asímptotes? Feu un esbós de la seva gràfica.\nc) Calculeu l'equació de la recta tangent a la gràfica de $y = f(x)$ en el punt d'abscissa $x = 1$.",
    apartados: [
      "a) Máximos, mínimos y zonas de crecimiento/decrecimiento. [1 punt]",
      "b) Asíntotas y esbozo de la gráfica. [1 punt]",
      "c) Recta tangente en $x = 1$. [0,5 punts]",
    ],
    criterios:
      "(a) 0,5 por la derivada, 0,25 por el máximo y 0,25 por las zonas. (b) 0,25 por la asíntota vertical, 0,5 por la horizontal y 0,25 por el esbozo. (c) 0,5 por la recta tangente.",
    puntuacion: 2.5,
  },
  {
    id: "cat-mat-2024-ord-s1-2",
    year: 2024,
    tipo: "Ordinaria",
    serie: "Sèrie 1",
    ejercicio: 2,
    tema: "Sistemas de ecuaciones lineales con parámetro k",
    enunciado:
      "Considereu el sistema d'equacions lineals:\n$$\\begin{cases}4x + 2y - z = 4 \\\\ x - y + kz = 3 \\\\ 3x + 3y = 1\\end{cases}$$\non $k$ és un paràmetre real.\n\na) Discutiu el sistema per als diferents valors del paràmetre $k$, i resoleu-lo per a $k = 0$.\nb) Resoleu el sistema per a $k = -1$.\nc) Per a $k = -1$, modifiqueu la tercera equació de manera que el sistema esdevingui incompatible. Justifiqueu la resposta.",
    apartados: [
      "a) Discusión y resolución para k = 0. [1 punt]",
      "b) Resolución para $k = -1$. [0,75 punts]",
      "c) Modificar la tercera ecuación para incompatibilidad. [0,75 punts]",
    ],
    criterios:
      "(a) 0,25 por el determinante, 0,25 por la discusión y 0,5 por k=0. (b) 0,75 por la solución paramétrica. (c) 0,25 por la nueva ecuación y 0,5 por la justificación.",
    puntuacion: 2.5,
  },
  {
    id: "cat-mat-2024-ord-s1-3",
    year: 2024,
    tipo: "Ordinaria",
    serie: "Sèrie 1",
    ejercicio: 3,
    tema: "Integral definida — terreno de regadío",
    enunciado:
      "En Joan troba entre els papers del seu avi un esbós on es descriu un terreny de regadiu. La corba de la gràfica és $y = f(x)$, amb $f(x) = -x^3 + 7x^2 - 6x + 5$.\n\na) A partir de l'expressió de $f(x)$, calculeu les coordenades dels punts $P$, $Q$ i $R$ indicats a la figura ($P$ i $Q$ sobre $y = 5$, $R$ sobre l'eix $x$). Calculeu també l'equació de la recta $PR$.\nb) Calculeu la superfície del terreny (región delimitada por la curva y la recta $PR$).",
    apartados: [
      "a) Coordenadas de P, Q, R y ecuación de la recta PR. [1,25 punts]",
      "b) Superficie del terreno. [1,25 punts]",
    ],
    criterios:
      "(a) 0,25 por la ecuación, 0,25 por resolverla, 0,25 por las coordenadas y 0,5 por la recta. (b) 0,5 por el planteamiento y 0,75 por el cálculo.",
    puntuacion: 2.5,
  },
  {
    id: "cat-mat-2024-ord-s1-4",
    year: 2024,
    tipo: "Ordinaria",
    serie: "Sèrie 1",
    ejercicio: 4,
    tema: "Probabilidad — bolas y distribución binomial",
    enunciado:
      "L'Andreu posa les nou boles B, A, Y, E, S, F, A, N, S dins d'una bossa.\n\na) Treu dues boles a l'atzar sense reemplaçament. Calculeu la probabilitat que la primera bola sigui una A o una E. Calculeu la probabilitat que les dues boles siguin diferents.\nb) Torna a posar totes les boles i en treu cinc amb reemplaçament. Calculeu la probabilitat que no hagi tret cap A. Calculeu la probabilitat que hagi tret almenys dues A.",
    apartados: [
      "a) P(primera A o E) y P(dos bolas diferentes). [0,5 + 0,75 punts]",
      "b) P(ninguna A) y P(al menos dos A) con reemplazamiento. [0,5 + 0,75 punts]",
    ],
    criterios:
      "(a)(i) 0,5. (a)(ii) 0,5 por el planteamiento y 0,25 por el cálculo. (b)(i) 0,5. (b)(ii) 0,5 por el planteamiento y 0,25 por el cálculo.",
    puntuacion: 2.5,
  },
  {
    id: "cat-mat-2024-ord-s1-5",
    year: 2024,
    tipo: "Ordinaria",
    serie: "Sèrie 1",
    ejercicio: 5,
    tema: "Optimización — cobert de fusta",
    enunciado:
      "Volem construir un petit cobert de fusta de $6\\ \\text{m}^3$ de volum, en forma de prisma rectangular, adossat a la paret lateral d'una casa. Només cal construir el sostre i tres parets. El cobert ha de mesurar el triple d'amplària que de fondària. Cada $\\text{m}^2$ de paret costa $30\\ €$ i el sostre $50\\ €/\\text{m}^2$. Una porta té un cost fix de $35\\ €$.\n\na) Comproveu que el cost de construcció ve donat per $C(x) = \\dfrac{300}{x} + 150x^2 + 35$, on $x$ és la fondària en metres.\nb) Calculeu les dimensions per al cost mínim i justifiqueu-ho. Quin és aquest cost?",
    apartados: [
      "a) Deducción de la función de coste $C(x)$. [1,25 punts]",
      "b) Dimensiones óptimas y coste mínimo. [1,25 punts]",
    ],
    criterios:
      "(a) 0,25 por las variables, 0,5 por el volumen y 0,5 por la expresión final. (b) 0,25 por la derivada, 0,25 por el punto crítico, 0,25 por el mínimo, 0,25 por las dimensiones y 0,25 por el coste.",
    puntuacion: 2.5,
  },
  {
    id: "cat-mat-2024-ord-s1-6",
    year: 2024,
    tipo: "Ordinaria",
    serie: "Sèrie 1",
    ejercicio: 6,
    tema: "Geometría — plano mediatriz, distancias, triángulo",
    enunciado:
      "Considereu els punts $A = (1, 2, 3)$ i $B = (-3, -2, 3)$.\n\na) Calculeu l'equació del pla $\\pi$ perpendicular a la recta $AB$ que passa pel punt mitjà entre $A$ i $B$. Justifiqueu que $\\pi$ és el lloc geomètric dels punts equidistants d'$A$ i $B$.\nb) Calculeu les distàncies de $A$ i $B$ al pla $\\pi$ i comproveu que són iguals. És casualitat?\nc) Sigui $C = (-7, 6, 3)$. El triangle $ABC$ és isòsceles? Calculeu la seva àrea.",
    apartados: [
      "a) Ecuación de $\\pi$ y justificación como lugar geométrico. [1 punt]",
      "b) Distancias de $A$ y $B$ a $\\pi$. [0,75 punts]",
      "c) ¿Es isósceles ABC? Área. [0,75 punts]",
    ],
    criterios:
      "(a) 0,5 por la ecuación del plano y 0,5 por la justificación. (b) 0,25 por las distancias y 0,5 por la explicación. (c) 0,25 por isósceles, 0,25 por la altura y 0,25 por el área.",
    puntuacion: 2.5,
  },

  // ─────────────────────────────────────────
  // 2025 · SÈRIE 1 · ORDINARIA
  // ─────────────────────────────────────────
  {
    id: "cat-mat-2025-ord-s1-1",
    year: 2025,
    tipo: "Ordinaria",
    serie: "Sèrie 1",
    ejercicio: 1,
    tema: "Análisis — función racional, asíntotas, tangentes",
    enunciado:
      "Considereu la funció $f(x) = \\dfrac{x^2 - 2x}{x - 1}$.\n\na) Determineu els talls de la corba $y = f(x)$ amb els eixos de coordenades, i les equacions de les seves possibles asímptotes verticals, horitzontals i obliqües.\nb) Calculeu les equacions de les rectes tangents a la corba $y = f(x)$ en els punts $x = 0$ i $x = 2$. Aquestes dues rectes són paral·leles? Justifiqueu la resposta.\nc) Hi ha algun punt on la recta tangent a $f(x)$ tingui pendent $1$? En cas afirmatiu, trobeu-lo.",
    apartados: [
      "a) Cortes con ejes y asíntotas. [1 punt]",
      "b) Rectas tangentes en $x = 0$ y $x = 2$ y paralelismo. [1 punt]",
      "c) ¿Existe punto con tangente de pendiente 1? [0,5 punts]",
    ],
    criterios:
      "(a) 0,25 por los cortes, 0,25 por la asíntota vertical y 0,5 por la oblicua. (b) 0,25 por la derivada, 0,25 por cada recta y 0,25 por justificar el paralelismo. (c) 0,25 por plantear la ecuación y 0,25 por concluir que no tiene solución.",
    puntuacion: 2.5,
  },
  {
    id: "cat-mat-2025-ord-s1-2",
    year: 2025,
    tipo: "Ordinaria",
    serie: "Sèrie 1",
    ejercicio: 2,
    tema: "Sistemas de ecuaciones lineales con parámetro p",
    enunciado:
      "Considereu el sistema d'equacions lineals:\n$$\\begin{cases}y - z = p + 3 \\\\ p^2x - z = 5 \\\\ x - y = 3\\end{cases}$$\non $p$ és un paràmetre real.\n\na) Discutiu el sistema per als diferents valors del paràmetre $p$.\nb) Resoleu el sistema per al cas $p = -1$.\nc) Per al cas $p = -1$, hi ha alguna solució que compleixi, a més, $xy = 10$? En cas afirmatiu, indiqueu quantes n'hi ha i trobeu-les totes.",
    apartados: [
      "a) Discusión según p. [1,25 punts]",
      "b) Resolución para $p = -1$. [0,5 punts]",
      "c) Soluciones con $xy = 10$ para $p = -1$. [0,75 punts]",
    ],
    criterios:
      "(a) 0,25 por el determinante, 0,25 por los valores críticos y 0,25 por cada caso. (b) 0,5 por la solución paramétrica. (c) 0,25 por la ecuación cuadrática, 0,25 por resolverla y 0,25 por los puntos.",
    puntuacion: 2.5,
  },
  {
    id: "cat-mat-2025-ord-s1-3",
    year: 2025,
    tipo: "Ordinaria",
    serie: "Sèrie 1",
    ejercicio: 3,
    tema: "Probabilidad — piezas defectuosas y binomial",
    enunciado:
      "Una empresa produeix dos tipus de peces, de ferro i d'acer. El $60\\%$ de la producció total correspon a peces de ferro i la resta són d'acer. El $95\\%$ de les peces de ferro no tenen cap defecte, mentre que el $3\\%$ de les peces d'acer són defectuoses.\n\na) Si agafem una peça a l'atzar, quina és la probabilitat que sigui defectuosa?\nb) L'empresa produirà peces de titani en paquets de $5$, amb probabilitat de defecte $p$ (independiente). Comproveu que la probabilitat que en un paquet n'hi hagi exactament $4$ de defectuoses és $f(p) = 5(p^4 - p^5)$.\nc) Determineu el valor màxim que pren $f(p)$ quan $p \\geq 0$.",
    apartados: [
      "a) Probabilidad de pieza defectuosa. [0,75 punts]",
      "b) Demostración de $f(p) = 5(p^4 - p^5)$. [0,75 punts]",
      "c) Máximo de f(p) para p ≥ 0. [1 punt]",
    ],
    criterios:
      "(a) 0,25 por la ley de probabilidad total, 0,25 por los datos y 0,25 por el cálculo. (b) 0,5 por el planteamiento y 0,25 por el cálculo. (c) 0,25 por la derivada, 0,5 por el máximo absoluto y 0,25 por el valor.",
    puntuacion: 2.5,
  },
  {
    id: "cat-mat-2025-ord-s1-4a",
    year: 2025,
    tipo: "Ordinaria",
    serie: "Sèrie 1",
    ejercicio: 4,
    opcion: "A",
    tema: "Integral definida — vela de barco",
    enunciado:
      "OPCIÓ A: La vela major d'un veler té forma semiparabòlica i està delimitada per $f(x) = -x^2 + 25$, $y = 0$ i $x = 0$. La vela té dues parts separades per $y = 9$. La part superior s'empra amb niló ($50\\ €/u^2$) i la inferior amb polièster ($70\\ €/u^2$). Calculeu el cost total del material.",
    apartados: [
      "Cálculo del coste total de la vela. [2,5 punts]",
    ],
    criterios:
      "0,25 por los puntos de corte, 0,5 por el planteamiento del área inferior, 0,5 por su cálculo, 0,5 por el área superior, 0,5 por su cálculo y 0,25 por el coste final.",
    puntuacion: 2.5,
  },
  {
    id: "cat-mat-2025-ord-s1-4b",
    year: 2025,
    tipo: "Ordinaria",
    serie: "Sèrie 1",
    ejercicio: 4,
    opcion: "B",
    tema: "Geometría — plano perpendicular y recta mediatriz",
    enunciado:
      "OPCIÓ B: Considereu el pla $\\pi$ d'equació $x + y = 0$.\n\na) Calculeu l'equació del pla $\\pi'$ perpendicular a $\\pi$ i que conté els punts $P = (1, -1, 2)$ i $Q = (3, -3, 6)$.\nb) Calculeu l'equació paramètrica de la recta continguda en $\\pi'$ i que conté els punts de $\\pi'$ a la mateixa distància de $P$ que de $Q$.",
    apartados: [
      "a) Ecuación de $\\pi'$. [1 punt]",
      "b) Ecuación paramétrica de la recta mediatriz en $\\pi'$. [1,5 punts]",
    ],
    criterios:
      "(a) 0,5 por el planteamiento y 0,5 por la ecuación. (b) 0,75 por el plano perpendicular a PQ por el punto medio y 0,75 por la ecuación paramétrica.",
    puntuacion: 2.5,
  },

  // ─────────────────────────────────────────
  // 2025 · SÈRIE 3 · EXTRAORDINARIA
  // ─────────────────────────────────────────
  {
    id: "cat-mat-2025-ext-s3-1",
    year: 2025,
    tipo: "Extraordinaria",
    serie: "Sèrie 3",
    ejercicio: 1,
    tema: "Optimización — área mínima de triángulo",
    enunciado:
      "Una família vol comprar un terreny triangular envoltat de penya-segats que segueixen les rectes $y = 0$ i $y = 3x$. El tercer costat del triangle passa pel punt $P = (1, 1)$.\n\na) Plantegeu l'equació de la recta $r$ en funció del pendent $m$ i comproveu que l'àrea ve donada per $A(m) = \\dfrac{3}{2}\\cdot\\dfrac{m^2 - 2m + 1}{m^2 - 3m}$.\nb) Calculeu el valor de $m$ que fa que l'àrea sigui mínima. Quin és el valor d'aquesta àrea?",
    apartados: [
      "a) Ecuación de la recta $r$ y deducción de $A(m)$. [1 punt]",
      "b) Valor de m para área mínima y valor del área. [1,5 punts]",
    ],
    criterios:
      "(a) 0,25 por la ecuación del haz de rectas, 0,25 por la base, 0,25 por la altura y 0,25 por $A(m)$. (b) 0,5 por la derivada, 0,25 por los puntos críticos, 0,5 por justificar el mínimo y 0,25 por el valor del área.",
    puntuacion: 2.5,
  },
  {
    id: "cat-mat-2025-ext-s3-2",
    year: 2025,
    tipo: "Extraordinaria",
    serie: "Sèrie 3",
    ejercicio: 2,
    tema: "Sistemas de ecuaciones lineales con parámetro m",
    enunciado:
      "Considereu el sistema d'equacions lineals:\n$$\\begin{cases}x + 3y + z = 5 \\\\ mx + 2z = 0 \\\\ my - z = m\\end{cases}$$\non $m$ és un paràmetre real.\n\na) Discutiu el sistema per als diferents valors del paràmetre $m$.\nb) Resoleu el sistema per a $m = 1$.\nc) Resoleu el sistema quan aquest tingui infinites solucions.",
    apartados: [
      "a) Discusión según m. [1,25 punts]",
      "b) Resolución para m = 1. [0,5 punts]",
      "c) Resolución cuando tiene infinitas soluciones. [0,75 punts]",
    ],
    criterios:
      "(a) 0,25 por el determinante, 0,25 por los valores críticos y 0,25 por cada caso. (b) 0,5 por la resolución. (c) 0,25 por identificar m y 0,5 por la solución paramétrica.",
    puntuacion: 2.5,
  },
  {
    id: "cat-mat-2025-ext-s3-3",
    year: 2025,
    tipo: "Extraordinaria",
    serie: "Sèrie 3",
    ejercicio: 3,
    tema: "Probabilidad — sesamoïditis y función de beneficios",
    enunciado:
      "En una població d'esportistes, el $45\\%$ practiquen esports d'impacte. Entre aquests, un $10\\%$ pateixen sesamoïditis, mentre que entre els altres només un $3\\%$ la presenten.\n\na) Quina és la probabilitat que un esportista escollit a l'atzar pateixi sesamoïditis?\nb) Si l'esportista té sesamoïditis, quina és la probabilitat que practiqui esports d'impacte?\nc) Els beneficis d'una empresa de calçat segueixen $f(x) = ax^3 + bx^2 + cx$, on $x$ són els anys. El primer any es van obtenir el màxim de beneficis ($8.000\\ €$) i el segon any hi va haver un punt d'inflexió. Calculeu $a$, $b$ i $c$.",
    apartados: [
      "a) Probabilidad total de sesamoïditis. [0,75 punts]",
      "b) Probabilidad condicionada (Bayes). [0,75 punts]",
      "c) Cálculo de a, b y c. [1 punt]",
    ],
    criterios:
      "(a) 0,25 por la ley total, 0,25 por los datos y 0,25 por el cálculo. (b) 0,25 por Bayes y 0,5 por el cálculo. (c) 0,25 por f'(1)=0, 0,25 por f(1)=8, 0,25 por f''(2)=0 y 0,25 por el cálculo final.",
    puntuacion: 2.5,
  },
  {
    id: "cat-mat-2025-ext-s3-4a",
    year: 2025,
    tipo: "Extraordinaria",
    serie: "Sèrie 3",
    ejercicio: 4,
    opcion: "A",
    tema: "Integral definida — vitrall de la Sagrada Família",
    enunciado:
      "OPCIÓ A: Un vidrier repara un vitrall de la Sagrada Família amb forma delimitada per $y = 3\\sin(x/4)$ i $y = 3\\cos(x/4)$, on $x$ i $y$ estan en metres.\n\na) Raoneu a quina funció correspon cada gràfica i calculeu les coordenades dels punts $B$ i $C$ ($A$ és l'origen de coordenades).\nb) Calculeu el preu del vitrall sabent que costa $750\\ €/\\text{m}^2$.",
    apartados: [
      "a) Identificación de funciones y coordenadas de B y C. [1 punt]",
      "b) Precio del vitrall. [1,5 punts]",
    ],
    criterios:
      "(a) 0,5 por razonar las gráficas, 0,25 por B y 0,25 por C. (b) 0,25 por la integral, 0,5 por la primitiva, 0,5 por el área y 0,25 por el precio.",
    puntuacion: 2.5,
  },
  {
    id: "cat-mat-2025-ext-s3-4b",
    year: 2025,
    tipo: "Extraordinaria",
    serie: "Sèrie 3",
    ejercicio: 4,
    opcion: "B",
    tema: "Geometría — planos paralelos y distancias",
    enunciado:
      "OPCIÓ B: Considereu el pla $\\pi: 2x - y + z = 5$ i el punt $P = (0, 1, 3)$.\n\na) Comproveu que la distància del punt $P$ al pla $\\pi$ és $\\sqrt{6}/2$.\nb) Trobeu l'equació general d'un pla $\\pi_1$ paral·lel a $\\pi$ que passi pel punt $P$. Quina és la distància entre $\\pi_1$ i $\\pi$?\nc) Trobeu l'equació general d'un segon pla $\\pi_2$, diferent de $\\pi_1$, paral·lel a $\\pi$ i a distància $\\sqrt{6}/2$ de $\\pi$.",
    apartados: [
      "a) Verificación de la distancia. [0,5 punts]",
      "b) Plano $\\pi_1$ paralelo a $\\pi$ por $P$ y distancia. [0,75 punts]",
      "c) Segundo plano $\\pi_2$ a distancia $\\sqrt{6}/2$ de $\\pi$. [1,25 punts]",
    ],
    criterios:
      "(a) 0,5 por la verificación. (b) 0,5 por la ecuación y 0,25 por la distancia. (c) 0,5 por la proyección, 0,5 por el punto simétrico y 0,25 por la ecuación final.",
    puntuacion: 2.5,
  },
];
