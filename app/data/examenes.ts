export interface Pregunta {
  id: string
  bloque: string
  opcion: "A" | "B"
  enunciado: string
  imagenes?: string[]
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

$$A=\\begin{pmatrix}m&1&1\\\\0&m&3\\end{pmatrix},\\qquad B=\\begin{pmatrix}1&m\\\\0&m\\\\0&1\\end{pmatrix}.$$

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
      { id:"2025-Ext-11", bloque:"Algebra", opcion:"A",
        enunciado:`En una granja se crían conejos, gallinas y pavos. El coste diario de la comida por animal es de 1,50 euros si es conejo, de 4 céntimos de euro si es gallina, y de 30 céntimos de euro si se trata de un pavo. El coste diario en comida para estos animales en la granja asciende a 44 euros.

Se sabe que hay tantas gallinas como cuatro veces el número de pavos más la cuarta parte de los conejos. Además, el doble del número de gallinas es igual a la suma de conejos y pavos más diez veces el número de conejos.

Se pide averiguar el número de animales de cada tipo en la granja.`,
        puntuacion:2.5, criterios:"Por cada ecuación correctamente planteada: 0.5 pts. Resolución del sistema: 1 punto. Si una ecuación está mal planteada, pero el sistema resultante se resuelve correctamente, se podrá valorar la resolución hasta 0.5 pts." },
      { id:"2025-Ext-12", bloque:"Algebra", opcion:"B",
        enunciado:`Dadas las matrices reales

$$A=\\begin{pmatrix}0&1&2\\\\1&3&a\\\\a&0&0\\end{pmatrix},\\quad B=\\begin{pmatrix}1&3&0\\\\a&1&0\\\\0&0&1\\end{pmatrix}$$

se pide:

a) (1.25 puntos) Estudiar para qué valores del parámetro real $a$ se cumple que la matriz $AB$ tiene rango 3.

b) (1.25 puntos) Calcular la inversa de $B$ para los valores de $a$ para los que sea posible.`,
        puntuacion:2.5, criterios:"a) Planteamiento: 0.75 pts; resolución: 0.5 pts. b) Planteamiento: 0.75 pts; resolución: 0.5 pts." },
      { id:"2025-Ext-21", bloque:"Analisis", opcion:"A",
        enunciado:`Sean las funciones

$$f(x)=\\dfrac{e}{e^x-e},\\quad g(x)=\\dfrac{1}{x-1}.$$

Se pide:

a) (1 punto) Calcular $\\displaystyle\\lim_{x\\to 1}\\bigl(f(x)-g(x)\\bigr)$.

b) (0.75 puntos) Estudiar los intervalos de crecimiento y decrecimiento de $f$ en su dominio.

c) (0.75 puntos) Calcular las asíntotas de la función $g(x)+g(-x)$.`,
        puntuacion:2.5, criterios:"a) Planteamiento: 0.5 pts; resolución: 0.5 pts. b) Derivada: 0.25 pts; determinación del decrecimiento en el dominio: 0.5 pts. c) Cada asíntota: 0.25 pts." },
      { id:"2025-Ext-22", bloque:"Analisis", opcion:"B",
        enunciado:`Se considera la parábola $f(x)=-x^2+4$.

a) (1 punto) Calcular el área de la región limitada por la recta $y=0$ y la gráfica de $f$.

b) (1.5 puntos) Determinar las dimensiones del rectángulo de mayor área que puede construirse apoyado sobre el eje $OX$, inscrito bajo la parábola y con los lados paralelos a los ejes de coordenadas. Calcular también dicha área máxima.`,
        puntuacion:2.5, criterios:"a) Planteamiento: 0.5 pts; resolución: 0.5 pts. b) Función área de una variable: 0.5 pts; punto crítico: 0.5 pts; discusión de máximo local: 0.25 pts; área correcta: 0.25 pts." },
      { id:"2025-Ext-31", bloque:"Geometria", opcion:"A",
        enunciado:`Sean el punto $A(1,2,3)$, la recta

$$r\\equiv \\dfrac{x-1}{2}=\\dfrac{y}{0}=\\dfrac{z-2}{1}$$

y el plano $\\pi: x+2y-2z=1$. Se pide:

a) (0.75 puntos) Calcular la distancia de la recta $r$ al plano $\\pi$.

b) (0.75 puntos) Calcular la proyección ortogonal del punto $A$ sobre la recta $r$.

c) (1 punto) Calcular el volumen del tetraedro formado por el origen de coordenadas y los puntos de corte con los ejes de un plano que pasa por $A$ y es paralelo a $\\pi$.`,
        puntuacion:2.5, criterios:"a) Planteamiento: 0.5 pts; resolución: 0.25 pts. b) Planteamiento: 0.5 pts; resolución: 0.25 pts. c) Planteamiento: 0.5 pts; resolución: 0.5 pts." },
      { id:"2025-Ext-32", bloque:"Geometria", opcion:"B",
        enunciado:`Sea $S$ el segmento de extremos $A(0,1,0)$ y $B(1,0,1)$.

a) (1.5 puntos) Determinar el punto de $S$ cuya distancia a $A$ sea el doble de su distancia a $B$.

b) (1 punto) Hallar la ecuación del plano perpendicular a $S$ que pasa por el punto medio del segmento.`,
        puntuacion:2.5, criterios:"a) Planteamiento: 1 punto; resolución: 0.5 pts. Se penalizará con 0.25 pts si el punto obtenido no pertenece al segmento. b) Planteamiento: 0.5 pts; resolución: 0.5 pts." },
      { id:"2025-Ext-4A", bloque:"Probabilidad", opcion:"A",
        enunciado:`En una línea de tren, el 80% de los trenes llegan puntuales o con menos de 30 minutos de retraso, el 15% llegan con un retraso de entre 30 y 60 minutos, y el resto llega con más de una hora de retraso.

a) (1 punto) Un usuario realiza 40 viajes y en 10 de ellos el retraso fue superior a una hora. El usuario afirma que la probabilidad de que ocurra esto es menor que una entre un millón. ¿Ha calculado correctamente dicha probabilidad?

b) (1.5 puntos) En enero de 2025 un viajero hizo 6 trayectos diarios en esta línea. Aproximando mediante una distribución normal, calcular la probabilidad de que como mucho la sexta parte de sus viajes dieran derecho a devolución.`,
        puntuacion:2.5, criterios:"a) Planteamiento: 0.5 pts; resolución: 0.5 pts. b) Parámetros de la normal: 0.25 pts cada uno; probabilidad: 1 punto (planteamiento 0.5 pts, resolución 0.5 pts). Sin corrección por continuidad se penaliza 0.25 pts." },
      { id:"2025-Ext-4B", bloque:"Probabilidad", opcion:"B",
        enunciado:`En una línea de tren, el 80% de los trenes llegan puntuales o con menos de 30 minutos de retraso, el 15% llegan con un retraso de entre 30 y 60 minutos, y el resto llega con más de una hora de retraso.

a) (1 punto) Un usuario realiza 40 viajes y en 10 de ellos el retraso fue superior a una hora. El usuario afirma que la probabilidad de que ocurra esto es menor que una entre un millón. ¿Ha calculado correctamente dicha probabilidad?

b) (1.5 puntos) En enero de 2025 un viajero hizo 6 trayectos diarios en esta línea. Aproximando mediante una distribución normal, calcular la probabilidad de que como mucho la sexta parte de sus viajes dieran derecho a devolución.`,
        puntuacion:2.5, criterios:"Pregunta sin optatividad en el examen oficial. a) Planteamiento: 0.5 pts; resolución: 0.5 pts. b) Parámetros de la normal: 0.25 pts cada uno; probabilidad: 1 punto (planteamiento 0.5 pts, resolución 0.5 pts). Sin corrección por continuidad se penaliza 0.25 pts." }
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
        enunciado: `Se tiene un suceso $A$ de probabilidad $P(A) = 0.3$.\n\na) (0.75 puntos) Un suceso $B$ de probabilidad $P(B) = 0.5$ es independiente de $A$. Calcule $P(A \\cup B)$.\n\nb) (0.75 puntos) Otro suceso $C$ cumple $P(C \\mid A) = 0.5$. Determine $P(A \\cap C)$.\n\nc) (1 punto) Si se tiene un suceso $D$ tal que $P(A \\mid D) = 0.2$ y $P(D \\mid A) = 0.5$, calcule $P(D)$.`,
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
        enunciado: `Sean el plano $\\pi \\equiv x + y + z = 1$, la recta\n$$r_1 \\equiv \\begin{cases} x = 1 + \\lambda \\\\ y = 1 - \\lambda \\\\ z = -1 \\end{cases}, \\quad \\lambda \\in \\mathbb{R}$$\ny el punto $P(0, 1, 0)$.

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
      { id:"2022-Ext-A1", bloque:"Algebra", opcion:"A",
        enunciado:`En una estantería de una biblioteca hay ensayos, novelas y biografías. Tres de cada dieciséis libros de la estantería son ensayos. Las biografías junto con la tercera parte de los ensayos exceden en dos a las novelas. Si retiráramos la mitad de los ensayos y la quinta parte de las novelas quedarían ciento cinco libros.

Calcule el número de libros de cada clase que hay en la estantería.`,
        puntuacion:2.5, criterios:"Planteamiento correcto del sistema: 1.5 pts (0.5 por ecuación). Resolución: 0.5 pts. Interpretación del resultado: 0.5 pts. Si alguna ecuación está mal planteada pero se resuelve correctamente el sistema resultante, se podrá valorar la resolución hasta 0.5 pts." },
      { id:"2022-Ext-A2", bloque:"Analisis", opcion:"A",
        enunciado:`Sea la función

$$f(x)=\\begin{cases}\\dfrac{2x+1}{x} & \\text{si } x<0\\\\ x^2-4x+3 & \\text{si } x\\ge 0\\end{cases}$$

Se pide:

a) (0.75 puntos) Estudiar la continuidad de $f$ en $\\mathbb{R}$.

b) (0.25 puntos) Estudiar si $f$ es derivable en $x=0$.

c) (0.75 puntos) Calcular las asíntotas horizontales y verticales de $f$.

d) (0.75 puntos) Para $x\\in(0,+\\infty)$, hallar el punto de la gráfica en el que la recta tangente tiene pendiente nula, escribir la ecuación de dicha tangente y clasificar el extremo relativo correspondiente.`,
        puntuacion:2.5, criterios:"a) Continuidad: 0.75 pts. b) Derivabilidad en 0: 0.25 pts. c) Asíntotas: 0.75 pts. d) Punto de tangente horizontal, ecuación de la tangente y clasificación del extremo relativo: 0.75 pts." },
      { id:"2022-Ext-A3", bloque:"Geometria", opcion:"A",
        enunciado:`Sean el plano $\\pi\\equiv z=x$ y los puntos $A(0,-1,0)$ y $B(0,1,0)$, contenidos en $\\pi$.

a) (1.25 puntos) Si $A$ y $B$ son vértices contiguos de un cuadrado contenido en $\\pi$, determinar los posibles vértices restantes $C$ y $D$.

b) (1.25 puntos) Si $A$ y $B$ son vértices opuestos de un cuadrado contenido en $\\pi$, determinar los otros dos vértices.`,
        puntuacion:2.5, criterios:"Se valorará el planteamiento geométrico correcto en el plano dado, la construcción de vectores perpendiculares adecuados, los cálculos y la comprobación de que los vértices pertenecen al plano." },
      { id:"2022-Ext-A4", bloque:"Probabilidad", opcion:"A",
        enunciado:`Tres quintas partes de los estudiantes de Bachillerato de un instituto están matriculados en Matemáticas II. Se eligen al azar 6 estudiantes.

a) (0.75 puntos) Calcular la probabilidad de que exactamente 4 estén matriculados en Matemáticas II.

b) (0.75 puntos) Calcular la probabilidad de que al menos uno esté matriculado en Matemáticas II.

c) (1 punto) En el instituto hay 120 estudiantes de Bachillerato. Aproximando la distribución binomial por una normal, calcular la probabilidad de que más de 60 estén matriculados en Matemáticas II.`,
        puntuacion:2.5, criterios:"a) Identificación binomial y cálculo de probabilidad: 0.75 pts. b) Probabilidad complementaria o suma adecuada: 0.75 pts. c) Parámetros de la normal, aproximación y cálculo de la probabilidad: 1 punto." },
      { id:"2022-Ext-B1", bloque:"Algebra", opcion:"B",
        enunciado:`Sean las matrices

$$A=\\begin{pmatrix}1&-1&k\\\\k&1&-1\\end{pmatrix},\\quad B=\\begin{pmatrix}1&1\\\\1&-1\\\\1&0\\end{pmatrix}.$$

Se pide:

a) (1 punto) Calcular los valores de $k$ para los que la matriz $AB$ tiene inversa. Para $k=1$, calcular $(AB)^{-1}$.

b) (0.75 puntos) Calcular $BA$ y discutir su rango según los valores de $k$.

c) (0.75 puntos) Para $k=1$, escribir un sistema incompatible de 3 ecuaciones lineales con 3 incógnitas cuya matriz de coeficientes sea $BA$.`,
        puntuacion:2.5, criterios:"a) Cálculo de $AB$ y discusión de invertibilidad; inversa para $k=1$. b) Cálculo de $BA$ y discusión del rango por valores de $k$. c) Construcción justificada de un sistema incompatible con matriz de coeficientes $BA$ para $k=1$." },
      { id:"2022-Ext-B2", bloque:"Analisis", opcion:"B",
        enunciado:`Sea la función

$$f(x)=\\begin{cases}x & \\text{si } x\\le 0\\\\ x\\ln x & \\text{si } x>0\\end{cases}$$

Se pide:

a) (0.75 puntos) Estudiar la continuidad y la derivabilidad de $f$ en $x=0$.

b) (1 punto) Estudiar los intervalos de crecimiento y decrecimiento, así como sus máximos y mínimos relativos.

c) (0.75 puntos) Calcular $\\displaystyle\\int_1^2 f(x)\\,dx$.`,
        puntuacion:2.5, criterios:"a) Continuidad y derivabilidad en 0: 0.75 pts. b) Derivada, intervalos de crecimiento/decrecimiento y extremos relativos: 1 punto. c) Planteamiento y cálculo de la integral: 0.75 pts." },
      { id:"2022-Ext-B3", bloque:"Geometria", opcion:"B",
        enunciado:`Sean las rectas

$$r\\equiv\\begin{cases}x+y+2=0\\\\y-2z+1=0\\end{cases},\\quad s\\equiv\\begin{cases}x=2-2t\\\\y=5+2t\\\\z=t\\end{cases},\\quad t\\in\\mathbb{R}.$$

Se pide:

a) (1 punto) Estudiar la posición relativa de $r$ y $s$ y calcular la distancia entre ellas.

b) (0.75 puntos) Hallar la ecuación del plano $\\pi$ que contiene a $r$ y a $s$.

c) (0.75 puntos) Sean $P$ y $Q$ los puntos de $r$ y $s$, respectivamente, contenidos en el plano $z=0$. Hallar la ecuación de la recta que pasa por $P$ y $Q$.`,
        puntuacion:2.5, criterios:"a) Posición relativa y distancia: 1 punto. b) Plano que contiene ambas rectas: 0.75 pts. c) Puntos de corte con $z=0$ y recta que pasa por ellos: 0.75 pts." },
      { id:"2022-Ext-B4", bloque:"Probabilidad", opcion:"B",
        enunciado:`Una empresa fabrica productos de tres tipos, $A$, $B$ y $C$. Cuatro séptimas partes de los productos son de tipo $A$, dos séptimas partes son de tipo $B$ y el resto son de tipo $C$. Se exportan el 40% de los productos de tipo $A$, el 60% de los de tipo $B$ y el 20% de los de tipo $C$.

a) (1.25 puntos) Calcular la probabilidad de que un producto elegido al azar sea exportado.

b) (1.25 puntos) Calcular la probabilidad de que un producto sea de tipo $C$ sabiendo que ha sido exportado.`,
        puntuacion:2.5, criterios:"a) Probabilidad total de exportación: planteamiento y cálculo. b) Probabilidad condicionada mediante Bayes: planteamiento y cálculo." }
    ]
  },
  {
    id: 10, año: 2021, tipo: "Ordinaria", asignatura: "Matemáticas II", comunidad: "Madrid",
    preguntas: [
      { id: "2021-J-A1", bloque: "Algebra", opcion: "A",
        enunciado: "Tres hermanos quieren repartirse de forma equitativa un total de 540 acciones valoradas en 1560 euros, que\ncorresponden a tres empresas A,B y C. Sabiendo que el valor actual en bolsa de la acción A es el triple que el de\nB y la mitad que el de C, que el número de acciones de C es la mitad que el de B y que el actual valor en bolsa\nde la acción B es 1 euro, encuentre el número de cada tipo de acción que le corresponde a cada hermano.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2021-J-A2", bloque: "Analisis", opcion: "A",
        enunciado: "Calcule el área de la región delimitada por las gráficas de las funciones\n$$\nf(x)=2+x-x^{2},\\qquad g(x)=2x^{2}-4x.\n$$",
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
        enunciado: "Se consideran dos sucesos $A$ y $B$ tales que $P(A) = 0.5$, $P(B) = 0.25$ y $P(A \\cap B) = 0.125$. Responder de manera razonada o calcular lo que se pide en los siguientes casos:\n\na) (0.5 puntos) Sea $C$ otro suceso, incompatible con $A$ y con $B$. ¿Son compatibles los sucesos $C$ y $A \\cup B$?\n\nb) (0.5 puntos) ¿Son $A$ y $B$ independientes?\n\nc) (0.75 puntos) Calcular la probabilidad $P(\\bar{A} \\cap \\bar{B})$ (donde $\\bar{A}$ denota el suceso complementario al suceso $A$).\n\nd) (0.75 puntos) Calcular $P(\\bar{B} | A)$.",
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
        enunciado: "Dados los planos $\\pi_1 \\equiv 4x + 6y - 12z + 1 = 0$ y $\\pi_2 \\equiv -2x - 3y + 6z - 5 = 0$, se pide:\n\na) (1 punto) Calcular el volumen de un cubo que tenga dos de sus caras en dichos planos.\n\nb) (1.5 puntos) Para el cuadrado de vértices consecutivos $ABCD$, con $A(2, 1, 3)$ y $B(1, 2, 3)$, calcular los vértices $C$ y $D$, sabiendo que $C$ pertenece a los planos $\\pi_2$ y $\\pi_3 \\equiv x - y + z = 2$.",
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
        enunciado:`Caja $A$: 5 blancas, 3 negras. Caja $B$: 2 blancas, 6 negras. $P(A)=0.4$.\n\na) $P(\\text{blanca})$\n\nb) $P(A \\mid \\text{blanca})$`,
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
  },
  {
    id: 17, año: 2018, tipo: "Extraordinaria", asignatura: "Matemáticas II", comunidad: "Madrid",
    preguntas: [
      { id:"2018-Ext-1A", bloque:"Algebra", opcion:"A",
        enunciado:`Dadas las matrices $A=\\begin{pmatrix}14&0&10\\\\0&7&5\\\\3&4&5\\alpha\\end{pmatrix}$, $X=\\begin{pmatrix}x\\\\y\\\\z\\end{pmatrix}$ y $B=\\begin{pmatrix}2\\\\37/2\\\\11\\end{pmatrix}$, se pide:\n\na) (1.25 puntos) Discutir el rango de la matriz $A$, en función de los valores del parámetro $\\alpha$.\n\nb) (0.75 puntos) Para $\\alpha=0$, calcular, si es posible, $A^{-1}$.\n\nc) (0.5 puntos) Resolver, si es posible, el sistema $AX=B$, en el caso $\\alpha=1$.`,
        puntuacion:2.5, criterios:"a) Valor crítico α=1: 0.75 pts (planteamiento 0.5, resolución 0.25); rango en cada caso (α=1, α≠1): 0.25 pts cada uno. b) Procedimiento: 0.5 pts, cálculos: 0.25 pts. c) Procedimiento: 0.25 pts, cálculos: 0.25 pts." },
      { id:"2018-Ext-2A", bloque:"Analisis", opcion:"A",
        enunciado:`Se considera la función $f(x)=\\begin{cases}8e^{2x-4} & \\text{si } x\\le 2\\\\ \\dfrac{x^3-4x}{x-2} & \\text{si } x>2\\end{cases}$ y se pide:\n\na) (0.75 puntos) Estudiar la continuidad de $f$ en $x=2$.\n\nb) (1 punto) Calcular las asíntotas horizontales de $f(x)$. ¿Hay alguna asíntota vertical?\n\nc) (0.75 puntos) Calcular $\\displaystyle\\int_0^2 f(x)\\,dx$.`,
        puntuacion:2.5, criterios:"a) Planteamiento: 0.25 pts; cada límite lateral: 0.25 pts. b) Saber qué límites calcular: 0.25 pts, calcular cada uno: 0.25 pts, justificar que no hay A.V.: 0.25 pts. c) Sustituir f(x) adecuadamente: 0.25 pts, primitiva correcta: 0.25 pts, regla de Barrow: 0.25 pts." },
      { id:"2018-Ext-3A", bloque:"Geometria", opcion:"A",
        enunciado:`Se consideran los vectores $\\vec u=(-1,2,3)$, $\\vec v=(2,0,-1)$ y el punto $A(-4,4,7)$. Se pide:\n\na) (1 punto) Determinar un vector $\\vec w_1$ que sea ortogonal a $\\vec u$ y $\\vec v$, unitario y con tercera coordenada negativa.\n\nb) (0.75 puntos) Hallar un vector no nulo $\\vec w_2$ que sea combinación lineal de $\\vec u$ y $\\vec v$ y ortogonal a $\\vec v$.\n\nc) (0.75 puntos) Determinar los vértices del paralelogramo cuyos lados tienen las direcciones de los vectores $\\vec u$ y $\\vec v$ y una de sus diagonales es el segmento $\\overrightarrow{OA}$.`,
        puntuacion:2.5, criterios:"a) Dirección ortogonal: 0.5 pts, hacerlo unitario: 0.25 pts, elegir signo adecuado: 0.25 pts. b) Planteamiento: 0.5 pts, resolución: 0.25 pts. c) Planteamiento: 0.5 pts, resolución: 0.25 pts." },
      { id:"2018-Ext-4A", bloque:"Probabilidad", opcion:"A",
        enunciado:`Según los datos de la Fundación para la Diabetes, el 13.8% de los españoles mayores de 18 años tiene diabetes, aunque el 43% de ellos no sabe que la tiene. Se elige al azar un español mayor de 18 años.\n\na) (1 punto) ¿Cuál es la probabilidad de que sea diabético y lo sepa?, ¿cuál la de que no sea diabético o no sepa que lo es?\n\nb) (1.5 puntos) Cierto test diagnostica correctamente el 96% de los casos positivos de diabetes, pero da un 2% de falsos positivos. Si un español mayor de 18 años da positivo en el test, ¿cuál es la probabilidad de que realmente sea diabético?`,
        puntuacion:2.5, criterios:"a) Cada probabilidad pedida: 0.5 pts (resultado 0.25, justificación 0.25). b) Probabilidad de dar positivo en el test: 0.5 pts; probabilidad de diabético condicionado a positivo (Bayes): 1 punto (procedimiento 0.5, resultado 0.5)." },
      { id:"2018-Ext-1B", bloque:"Algebra", opcion:"B",
        enunciado:`Un grupo de estudiantes ha realizado un viaje por tres países (Francia, Alemania y Suiza). En los hoteles cada estudiante ha pagado: 20 euros diarios en Francia, 25 euros diarios en Alemania y 30 euros diarios en Suiza. En comidas cada uno ha gastado: 20 euros diarios en Francia, 15 euros diarios en Alemania y 25 euros diarios en Suiza. Además, el transportista les ha cobrado 8 euros diarios a cada uno. Sabiendo que el gasto total del viaje ha sido 765 euros por persona, que ha durado 15 días y que han estado en Francia el doble de días que en Suiza, obtenga el número de días que han estado en cada uno de los tres países.`,
        puntuacion:2.5, criterios:"Planteamiento correcto del sistema (3 ecuaciones): 1.5 pts (0.5 por ecuación). Resolución del sistema: 1 punto (procedimiento 0.5, cálculos 0.5). Si alguna ecuación está mal planteada pero se obtiene un sistema de 3x3, se califica la parte correspondiente a su resolución." },
      { id:"2018-Ext-2B", bloque:"Analisis", opcion:"B",
        enunciado:`El dibujo adjunto muestra la gráfica de una función $y=f(x)$: para $x\\in[-2,-1]$ un segmento que sube linealmente desde $(-2,0)$ hasta el pico $(-1,1)$; para $x\\in[-1,0]$ un segmento que baja linealmente desde $(-1,1)$ hasta $(0,0)$; y para $x\\in[0,2]$ un arco de parábola creciente (tipo $y=x^2$) que pasa por $(1,1)$ y llega hasta aproximadamente $(2,4)$. Usando la información de la figura, se pide:\n\na) (0.5 puntos) Indicar los valores de $f(-1)$ y $f'(1)$.\n\nb) (1 punto) Justificar, usando límites laterales, si $f$ es continua en los puntos $x=-1$ y $x=0$.\n\nc) (0.5 puntos) Indicar razonadamente si $f$ es derivable en los puntos $x=-1$ y $x=0$.\n\nd) (0.5 puntos) Determinar el valor de $\\displaystyle\\int_{-2}^0 f(x)\\,dx$.`,
        imagenes:["/mates-imgs/madrid/2018/extraordinaria/2018-extra-2b-grafica.png"],
        puntuacion:2.5, criterios:"a) Cada valor correcto: 0.25 pts. b) Estudiar continuidad en cada punto: 0.5 pts. c) Justificar no derivabilidad en cada punto: 0.25 pts. d) Resultado: 0.25 pts, justificación: 0.25 pts." },
      { id:"2018-Ext-3B", bloque:"Geometria", opcion:"B",
        enunciado:`Dados el punto $P(0,-1,1)$ y la recta $r$, que pasa por el punto $Q(1,0,1)$ y tiene como vector director $\\vec v=(0,1,2)$, se pide:\n\na) (0.5 puntos) Hallar la ecuación implícita del plano que contiene a $r$ y pasa por $P$.\n\nb) (0.5 puntos) Encontrar el punto $S$ contenido en $r$ tal que el vector $\\overrightarrow{SP}$ sea perpendicular a la recta $r$.\n\nc) (1.5 puntos) Hallar el área del triángulo cuyos vértices son el punto $P$ y dos puntos $T_1$, $T_2$, contenidos en la recta $r$, que están a distancia $\\sqrt{5}$ de $P$.`,
        puntuacion:2.5, criterios:"a) Planteamiento: 0.25 pts, resolución: 0.25 pts. b) Planteamiento: 0.25 pts, resolución: 0.25 pts. c) Hallar T1 y T2: 1 punto; área del triángulo: 0.5 pts." },
      { id:"2018-Ext-4B", bloque:"Probabilidad", opcion:"B",
        enunciado:`La variable aleatoria $X$ sigue una distribución normal de media $\\mu=8.5$ y desviación típica $\\sigma=2.5$. Se pide:\n\na) (1.25 puntos) Calcular el valor $a$ tal que $P(X\\le a)=0.05$.\n\nb) (1.25 puntos) Calcular la probabilidad de que la variable tome un valor comprendido entre 8 y 9.3.`,
        puntuacion:2.5, criterios:"a) Procedimiento: 0.75 pts, cálculos: 0.5 pts. b) Procedimiento: 0.75 pts, cálculos: 0.5 pts." }
    ]
  },
  {
    id: 18, año: 2019, tipo: "Extraordinaria", asignatura: "Matemáticas II", comunidad: "Madrid",
    preguntas: [
      { id:"2019-Ext-1A", bloque:"Algebra", opcion:"A",
        enunciado:`Dado el sistema de ecuaciones $\\begin{cases}kx+(k+1)y+z=0\\\\-x+ky-z=0\\\\(k-1)x-y=-(k+1)\\end{cases}$, se pide:\n\na) (2 puntos) Discutir el sistema según los valores del parámetro real $k$.\n\nb) (0.5 puntos) Resolver el sistema para $k=-1$.`,
        puntuacion:2.5, criterios:"a) Obtener valores críticos k=±1: 0.5 pts (planteamiento 0.25, resolución 0.25). Discutir cada uno de los tres casos (k=-1, k=1, k≠±1): 0.5 pts cada uno (resultado 0.25, justificación 0.25). b) Procedimiento: 0.25 pts, cálculos: 0.25 pts." },
      { id:"2019-Ext-2A", bloque:"Analisis", opcion:"A",
        enunciado:`a) (1.25 puntos) Sean $f$ y $g$ dos funciones derivables de las que se conocen los siguientes datos: $f(1)=1$, $f'(1)=2$, $g(1)=3$, $g'(1)=4$. Dada $h(x)=f((x+1)^2)$, use la regla de la cadena para calcular $h'(0)$. Dada $k(x)=\\dfrac{f(x)}{g(x)}$, calcule $k'(1)$.\n\nb) (1.25 puntos) Calcule la integral $\\displaystyle\\int (\\sin x)^4(\\cos x)^3\\,dx$ (se puede usar el cambio de variable $t=\\sin x$).`,
        puntuacion:2.5, criterios:"a) Calcular h'(0): 0.5 pts (regla de la cadena 0.25, resultado 0.25). Calcular k'(1): 0.75 pts (derivada del cociente 0.5, resultado 0.25). b) Planteamiento del cambio de variable: 0.5 pts, primitiva polinómica: 0.5 pts, deshacer el cambio: 0.25 pts." },
      { id:"2019-Ext-3A", bloque:"Geometria", opcion:"A",
        enunciado:`Dados los puntos $A(1,1,1)$, $B(1,3,-3)$ y $C(-3,-1,1)$, se pide:\n\na) (1 punto) Determinar la ecuación del plano que contiene a los tres puntos.\n\nb) (0.5 puntos) Obtener un punto $D$ (distinto de $A$, $B$ y $C$) tal que los vectores $\\overrightarrow{AB}$, $\\overrightarrow{AC}$ y $\\overrightarrow{AD}$ sean linealmente dependientes.\n\nc) (1 punto) Encontrar un punto $P$ del eje $OX$, de modo que el volumen del tetraedro de vértices $A$, $B$, $C$ y $P$ sea igual a 1.`,
        puntuacion:2.5, criterios:"a) Procedimiento: 0.5 pts, cálculos: 0.5 pts. b) Elección adecuada de D: 0.25 pts, justificación: 0.25 pts. c) Saber la forma de un punto del eje OX: 0.25 pts, planteamiento: 0.5 pts, resultado: 0.25 pts." },
      { id:"2019-Ext-4A", bloque:"Probabilidad", opcion:"A",
        enunciado:`Una empresa ha llevado a cabo un proceso de selección de personal.\n\na) (1.25 puntos) Se sabe que el 40% del total de aspirantes han sido seleccionados en el proceso. Si entre los aspirantes había un grupo de 8 amigos, calcule la probabilidad de que al menos 2 de ellos hayan sido seleccionados.\n\nb) (1.25 puntos) Las puntuaciones obtenidas por los aspirantes siguen una distribución normal, $X$, de media $5.6$ y desviación típica $\\sigma$. Sabiendo que la probabilidad de obtener una puntuación $X\\le 8.2$ es $0.67$, calcule $\\sigma$.`,
        puntuacion:2.5, criterios:"a) Identificar la variable binomial: 0.5 pts, calcular la probabilidad: 0.75 pts (proceso 0.5, cálculos 0.25). b) Planteamiento: 0.75 pts, resolución: 0.5 pts." },
      { id:"2019-Ext-1B", bloque:"Algebra", opcion:"B",
        enunciado:`Dadas las matrices $A=\\begin{pmatrix}1-a&1\\\\1&1+a\\end{pmatrix}$, $I=\\begin{pmatrix}1&0\\\\0&1\\end{pmatrix}$, se pide:\n\na) (1 punto) Calcular para qué valores $a\\in\\mathbb{R}$ se verifica $A^2-I=2A$.\n\nb) (0.75 puntos) Calcular los números reales $a$ para los que la matriz $A$ admite inversa y calcularla, cuando sea posible, en función del parámetro $a$.\n\nc) (0.75 puntos) Calcular, en función de $a$, el determinante de la matriz $(AA^t)^2$, donde $A^t$ denota la matriz traspuesta de $A$.`,
        puntuacion:2.5, criterios:"a) Calcular A²-I y 2A: 0.5 pts, obtener los valores de a: 0.5 pts. b) Obtener a: 0.25 pts, calcular la inversa en función del parámetro: 0.5 pts. c) Procedimiento: 0.5 pts, resultado: 0.25 pts." },
      { id:"2019-Ext-2B", bloque:"Analisis", opcion:"B",
        enunciado:`Un brote de una enfermedad se propaga a lo largo de unos días. El número de enfermos $t$ días después de iniciarse el brote viene dado por una función $F(t)$ tal que $F'(t)=t^2(10-t)$.\n\na) (1 punto) Sabiendo que inicialmente había 6 personas afectadas, calcule la función $F(t)$.\n\nb) (1 punto) Calcule cuántos días después de iniciarse el brote se alcanza el número máximo de enfermos y cuál es ese número.\n\nc) (0.5 puntos) Calcule, usando el teorema de Bolzano, cuántos días dura el brote.`,
        puntuacion:2.5, criterios:"a) Planteamiento: 0.25 pts, primitiva: 0.5 pts, ajustar la constante: 0.25 pts. b) Puntos críticos: 0.5 pts, justificar máximo en t=10: 0.25 pts, número máximo de enfermos: 0.25 pts. c) Planteamiento: 0.25 pts, aplicar Bolzano: 0.25 pts." },
      { id:"2019-Ext-3B", bloque:"Geometria", opcion:"B",
        enunciado:`Dados el plano $\\pi\\equiv 2x+3y-z=4$, y las rectas $r\\equiv\\begin{cases}x+y-z=0\\\\x+y+z=2\\end{cases}$ y $s\\equiv(x,y,z)=(1,2,3)+\\lambda(1,0,1)$, con $\\lambda\\in\\mathbb{R}$, se pide:\n\na) (1 punto) Calcular el punto simétrico de $P(1,2,3)$ respecto de $\\pi$.\n\nb) (1 punto) Hallar la ecuación de la recta perpendicular al plano $\\pi$, que pasa por el punto intersección de las rectas $r$ y $s$.\n\nc) (0.5 puntos) Calcular el ángulo que forman entre sí las rectas $r$ y $s$.`,
        puntuacion:2.5, criterios:"a) Planteamiento: 0.5 pts, resolución: 0.5 pts. b) Planteamiento: 0.5 pts, resolución: 0.5 pts. c) Planteamiento: 0.25 pts, resolución: 0.25 pts." },
      { id:"2019-Ext-4B", bloque:"Probabilidad", opcion:"B",
        enunciado:`Un concesionario dispone de vehículos de baja y alta gama, siendo los de alta gama 1/3 de las existencias. Entre los de baja gama, la probabilidad de tener un defecto de fabricación que obligue a revisarlos durante el rodaje es del 1.6%, mientras que para los de alta gama es del 0.9%. En un control de calidad preventa, se elige al azar un vehículo para examinarlo.\n\na) (1 punto) Calcule la probabilidad de que el vehículo elegido resulte defectuoso.\n\nb) (1.5 puntos) Si se comprueba que el vehículo elegido es defectuoso, calcule la probabilidad de que sea de gama baja.`,
        puntuacion:2.5, criterios:"a) Planteamiento: 0.5 pts, resolución: 0.5 pts. b) Planteamiento: 0.75 pts, resolución: 0.75 pts." }
    ]
  },
  {
    id: 19, año: 2020, tipo: "Extraordinaria", asignatura: "Matemáticas II", comunidad: "Madrid",
    preguntas: [
      { id:"2020-Ext-A1", bloque:"Algebra", opcion:"A",
        enunciado:`Sea $A$ una matriz de tamaño $3\\times4$ tal que sus dos primeras filas son $(1,1,1,1)$ y $(1,2,3,4)$, y sin ningún cero en la tercera fila. En cada uno de los apartados siguientes, se pide poner un ejemplo de matriz $A$ que verifique la condición pedida, justificándolo apropiadamente:\n\na) (0.5 puntos) La tercera fila de $A$ es combinación lineal de las dos primeras.\n\nb) (0.5 puntos) Las tres filas de $A$ son linealmente independientes.\n\nc) (0.5 puntos) $A$ es la matriz ampliada de un sistema compatible determinado.\n\nd) (0.5 puntos) $A$ es la matriz ampliada de un sistema compatible indeterminado.\n\ne) (0.5 puntos) $A$ es la matriz ampliada de un sistema incompatible.`,
        puntuacion:2.5, criterios:"En cada apartado: dar el ejemplo 0.25 pts, justificar que cumple la condición 0.25 pts." },
      { id:"2020-Ext-A2", bloque:"Analisis", opcion:"A",
        enunciado:`Dada la función $f(x)=\\begin{cases}\\dfrac{x-1}{x^2-1} & \\text{si } x<1,\\, x\\ne-1\\\\ \\dfrac{x^2+1}{4x} & \\text{si } x\\ge1\\end{cases}$, se pide:\n\na) (0.5 puntos) Calcular $f(0)$ y $(f\\circ f)(0)$.\n\nb) (1.25 puntos) Estudiar la continuidad y derivabilidad de $f(x)$ en $x=1$ y determinar si en dicho punto existe un extremo relativo.\n\nc) (0.75 puntos) Estudiar sus asíntotas.`,
        puntuacion:2.5, criterios:"a) Cada valor obtenido: 0.25 pts. b) Continuidad: 0.5 pts, derivabilidad: 0.5 pts, caracterizar el extremo: 0.25 pts. c) Cada asíntota: 0.25 pts." },
      { id:"2020-Ext-A3", bloque:"Geometria", opcion:"A",
        enunciado:`Dados el punto $P(3,3,0)$ y la recta $r\\equiv\\dfrac{x-2}{-1}=\\dfrac{y}{1}=\\dfrac{z+1}{0}$, se pide:\n\na) (0.75 puntos) Escribir la ecuación del plano que contiene al punto $P$ y a la recta $r$.\n\nb) (1 punto) Calcular el punto simétrico de $P$ respecto de $r$.\n\nc) (0.75 puntos) Hallar dos puntos $A$ y $B$ de $r$ tales que el triángulo $ABP$ sea rectángulo, tenga área $\\dfrac{3}{\\sqrt2}$ y el ángulo recto en $A$.`,
        puntuacion:2.5, criterios:"a) Planteamiento: 0.5 pts, resolución: 0.25 pts. b) Planteamiento: 0.5 pts, resolución: 0.5 pts. c) Planteamiento: 0.5 pts, encontrar una solución correcta: 0.25 pts." },
      { id:"2020-Ext-A4", bloque:"Probabilidad", opcion:"A",
        enunciado:`Se tienen tres urnas $A$, $B$ y $C$. La urna $A$ contiene 4 bolas rojas y 2 negras, la urna $B$ contiene 3 bolas de cada color y la urna $C$ contiene 6 bolas negras. Se elige una urna al azar y se extraen de ella dos bolas de manera consecutiva y sin reemplazamiento. Se pide:\n\na) (1 punto) Calcular la probabilidad de que la primera bola extraída sea roja.\n\nb) (1 punto) Calcular la probabilidad de que la primera bola extraída sea roja y la segunda sea negra.\n\nc) (0.5 puntos) Sabiendo que la primera bola extraída es roja, calcular la probabilidad de que la segunda sea negra.`,
        puntuacion:2.5, criterios:"a) Planteamiento: 0.5 pts, resolución: 0.5 pts. b) Planteamiento: 0.5 pts, resolución: 0.5 pts. c) Planteamiento: 0.25 pts, resolución: 0.25 pts." },
      { id:"2020-Ext-B1", bloque:"Algebra", opcion:"B",
        enunciado:`Sean las matrices $A=\\begin{pmatrix}0&-1&2\\\\2&1&-1\\\\1&0&1\\end{pmatrix}$, $I=\\begin{pmatrix}1&0&0\\\\0&1&0\\\\0&0&1\\end{pmatrix}$, $B=\\begin{pmatrix}2&-1\\\\1&0\\\\0&1\\end{pmatrix}$. Se pide:\n\na) (1 punto) Calcular, si es posible, la inversa de la matriz $A$.\n\nb) (0.5 puntos) Calcular la matriz $C=A^2-2I$.\n\nc) (1 punto) Calcular el determinante de la matriz $D=ABB^t$ (donde $B^t$ denota la matriz traspuesta de $B$).`,
        puntuacion:2.5, criterios:"a) Planteamiento: 0.5 pts, resolución: 0.5 pts. b) Planteamiento: 0.25 pts, resolución: 0.25 pts. c) Planteamiento: 0.5 pts, resolución: 0.5 pts." },
      { id:"2020-Ext-B2", bloque:"Analisis", opcion:"B",
        enunciado:`La potencia generada por una pila viene dada por la expresión $P(t)=25\\,t\\,e^{-t^2/4}$, donde $t>0$ es el tiempo de funcionamiento.\n\na) (0.5 puntos) Calcular hacia qué valor tiende la potencia generada por la pila si se deja en funcionamiento indefinidamente.\n\nb) (0.75 puntos) Determinar la potencia máxima que genera la pila y el instante en el que se alcanza.\n\nc) (1.25 puntos) La energía total generada por la pila hasta el instante $t$, $E(t)$, se relaciona con la potencia mediante $E'(t)=P(t)$, con $E(0)=0$. Calcular la energía producida por la pila entre el instante $t=0$ y el instante $t=2$.`,
        puntuacion:2.5, criterios:"a) Planteamiento: 0.25 pts, cálculo del límite: 0.25 pts. b) Planteamiento: 0.25 pts, cálculo del instante: 0.25 pts, cálculo del máximo: 0.25 pts. c) Planteamiento: 0.5 pts, primitiva: 0.5 pts, regla de Barrow: 0.25 pts." },
      { id:"2020-Ext-B3", bloque:"Geometria", opcion:"B",
        enunciado:`Del paralelogramo $ABCD$, se conocen los vértices consecutivos $A(1,0,-1)$, $B(2,1,0)$ y $C(4,3,-2)$. Se pide:\n\na) (1 punto) Calcular una ecuación de la recta que pasa por el punto medio del segmento $AC$ y es perpendicular a los segmentos $AC$ y $BC$.\n\nb) (1 punto) Hallar las coordenadas del vértice $D$ y el área del paralelogramo resultante.\n\nc) (0.5 puntos) Calcular el coseno del ángulo que forman los vectores $\\overrightarrow{AB}$ y $\\overrightarrow{AC}$.`,
        puntuacion:2.5, criterios:"a) Planteamiento: 0.5 pts, resolución: 0.5 pts. b) Determinar D: 0.5 pts, determinar el área: 0.5 pts. c) Planteamiento: 0.25 pts, resolución: 0.25 pts." },
      { id:"2020-Ext-B4", bloque:"Probabilidad", opcion:"B",
        enunciado:`En un experimento aleatorio hay dos sucesos independientes $X$, $Y$. Sabemos que $P(X)=0.4$ y que $P(X\\cap\\overline Y)=0.08$ (donde $\\overline Y$ es el suceso complementario de $Y$). Se pide:\n\na) (1 punto) Calcular $P(Y)$.\n\nb) (0.5 puntos) Calcular $P(X\\cup Y)$.\n\nc) (1 punto) Si $X$ es un resultado no deseado, de manera que consideramos que el experimento es un éxito cuando NO sucede $X$, y repetimos el experimento en 8 ocasiones, hallar la probabilidad de haber tenido éxito al menos 2 veces.`,
        puntuacion:2.5, criterios:"a) Planteamiento: 0.5 pts, resolución: 0.5 pts. b) Planteamiento: 0.25 pts, resolución: 0.25 pts. c) Identificar la binomial: 0.5 pts, resultado: 0.5 pts." }
    ]
  },
  {
    id: 20, año: 2021, tipo: "Extraordinaria", asignatura: "Matemáticas II", comunidad: "Madrid",
    preguntas: [
      { id:"2021-Ext-A1", bloque:"Algebra", opcion:"A",
        enunciado:`Tres amigas, Sara, Cristina y Jimena, tienen un total de 15000 seguidores en una red social. Si Jimena perdiera el 25% de sus seguidores todavía tendría el triple de seguidores que Sara. Además, la mitad de los seguidores de Sara más la quinta parte de los de Cristina suponen la cuarta parte de los seguidores de Jimena. Calcule cuántos seguidores tiene cada una de las tres amigas.`,
        puntuacion:2.5, criterios:"Plantear correctamente cada ecuación: 0.5 pts. Resolución correcta del sistema: 1 punto. Máximo 0.5 pts si se resuelve correctamente un sistema mal planteado." },
      { id:"2021-Ext-A2", bloque:"Analisis", opcion:"A",
        enunciado:`a) (1.25 puntos) Calcule, en caso de existir, el valor de los siguientes límites:\n\na.1) (0.5 puntos) $\\displaystyle\\lim_{x\\to0}\\dfrac{x^2(1-2x)}{x-2x^2-\\sin x}$\n\na.2) (0.75 puntos) $\\displaystyle\\lim_{x\\to\\infty}\\dfrac1x\\left(\\dfrac3x-\\dfrac{2}{\\sin\\frac1x}\\right)$ (indicación: use el cambio de variable $t=1/x$ donde sea necesario).\n\nb) (1.25 puntos) Calcule las siguientes integrales:\n\nb.1) (0.5 puntos) $\\displaystyle\\int\\dfrac{x}{x^2-1}\\,dx$\n\nb.2) (0.75 puntos) $\\displaystyle\\int_0^1 x^2e^{-x}\\,dx$`,
        puntuacion:2.5, criterios:"a.1) Cada aplicación correcta de L'Hôpital: 0.25 pts. a.2) Cambio de variable: 0.5 pts, aplicación de L'Hôpital: 0.25 pts. b.1) Resolver correctamente: 0.5 pts. b.2) Cada integración por partes correcta: 0.25 pts, regla de Barrow: 0.25 pts." },
      { id:"2021-Ext-A3", bloque:"Geometria", opcion:"A",
        enunciado:`Dado el punto $A(1,0,-1)$, la recta $r\\equiv x-1=y+1=\\dfrac{z-2}{2}$ y el plano $\\pi\\equiv x+y-z=6$, se pide:\n\na) (0.75 puntos) Hallar el ángulo que forman el plano $\\pi$ y el plano perpendicular a la recta $r$ que pasa por el punto $A$.\n\nb) (0.75 puntos) Determinar la distancia entre la recta $r$ y el plano $\\pi$.\n\nc) (1 punto) Calcular una ecuación de la recta que pasa por $A$, forma un ángulo recto con la recta $r$ y no corta al plano $\\pi$.`,
        puntuacion:2.5, criterios:"a) Planteamiento: 0.5 pts, resolución: 0.25 pts. b) Planteamiento: 0.5 pts, resolución: 0.25 pts. c) Planteamiento: 0.5 pts, resolución: 0.5 pts." },
      { id:"2021-Ext-A4", bloque:"Probabilidad", opcion:"A",
        enunciado:`En una urna hay dos bolas blancas y cuatro bolas negras. Se extrae una bola al azar. Si la bola extraída es blanca, se devuelve a la urna y se añade otra bola blanca; si es negra, no se devuelve a la urna. A continuación, se vuelve a extraer una bola al azar de la urna.\n\na) (1 punto) ¿Cuál es la probabilidad de que las dos bolas extraídas sean de distinto color?\n\nb) (1.5 puntos) ¿Cuál es la probabilidad de que la primera bola extraída fuera negra, sabiendo que la segunda ha sido blanca?`,
        puntuacion:2.5, criterios:"a) Planteamiento: 0.75 pts, resolución: 0.25 pts. b) Uso correcto del teorema de Bayes y probabilidad total: 1 punto, resolución: 0.5 pts." },
      { id:"2021-Ext-1B", bloque:"Algebra", opcion:"B",
        enunciado:`a) (0.75 puntos) Encuentre un único sistema de dos ecuaciones lineales en las variables $x$ e $y$, que tenga como soluciones $\\{x=1,y=2\\}$ y $\\{x=0,y=0\\}$.\n\nb) (1 punto) Encuentre un sistema de dos ecuaciones lineales en las variables $x$, $y$ y $z$ cuyas soluciones sean, en función del parámetro $\\lambda\\in\\mathbb{R}$: $\\begin{cases}x=\\lambda\\\\y=\\lambda-2\\\\z=\\lambda-1\\end{cases}$\n\nc) (0.75 puntos) Encuentre un sistema de tres ecuaciones lineales con dos incógnitas, $x$ e $y$, que solo tenga como solución a $x=1$ e $y=2$.`,
        puntuacion:2.5, criterios:"a) y c) Dar el ejemplo: 0.5 pts, justificación: 0.25 pts. b) Llegar al sistema: 0.75 pts, justificación: 0.25 pts." },
      { id:"2021-Ext-2B", bloque:"Analisis", opcion:"B",
        enunciado:`Sea la función $f(x)=x^3-|x|+2$.\n\na) (0.75 puntos) Estudie la continuidad y la derivabilidad de $f$ en $x=0$.\n\nb) (1 punto) Determine los extremos relativos de $f(x)$ en la recta real.\n\nc) (0.75 puntos) Calcule el área de la región delimitada por la gráfica de $f$, el eje de abcisas $y=0$, y las rectas $x=-1$ y $x=1$.`,
        puntuacion:2.5, criterios:"a) Continuidad: 0.25 pts, derivabilidad: 0.5 pts. b) Decidir que x=0 es extremo: 0.25 pts, hallar el otro punto crítico: 0.5 pts, demostrar que es mínimo: 0.25 pts. c) Primitiva: 0.25 pts, Barrow: 0.25 pts, resultado: 0.25 pts." },
      { id:"2021-Ext-3B", bloque:"Geometria", opcion:"B",
        enunciado:`Dadas las rectas $r\\equiv\\dfrac{x-2}{1}=\\dfrac{y+1}{1}=\\dfrac{z+4}{-3}$, $s\\equiv\\begin{cases}x+z=2\\\\-2x+y-2z=1\\end{cases}$\n\na) (1.5 puntos) Escriba una ecuación de la recta perpendicular común a $r$ y a $s$.\n\nb) (1 punto) Calcule la distancia entre $r$ y $s$.`,
        puntuacion:2.5, criterios:"a) Planteamiento: 1 punto, resolución: 0.5 pts. b) Planteamiento: 0.75 pts, resolución: 0.25 pts." },
      { id:"2021-Ext-4B", bloque:"Probabilidad", opcion:"B",
        enunciado:`Según las estadísticas meteorológicas, en una ciudad nórdica llueve un promedio del 45% de los días. Un climatólogo analiza los registros pluviométricos de 100 días elegidos al azar entre los de los últimos 50 años.\n\na) (1 punto) Exprese cómo calcular con exactitud la probabilidad de que en 40 de ellos haya llovido.\n\nb) (1.5 puntos) Calcule dicha probabilidad aproximándola mediante una normal.`,
        puntuacion:2.5, criterios:"a) Identificar la binomial: 0.5 pts, expresar la probabilidad: 0.5 pts. b) Cálculo de parámetros de la normal: 0.5 pts, cálculo de la probabilidad: 1 punto (planteamiento 0.5, resolución 0.5)." }
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
  dia?: "Lunes" | "Martes" | "Coincidencias"
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
  },
  {
    id: 8000,
    año: 2018,
    tipo: "Extraordinaria",
    opcion: "A",
    asignatura: "Historia de España",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2018-extra-a-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "1. Conquista y romanización de la Península Ibérica. Principales aportaciones romanas\nen los ámbitos social, económico y cultural.\n2. Al Ándalus: la conquista musulmana de la Península Ibérica. Emirato y califato de\nCórdoba.\n3. Los reinos cristianos en la Edad Media: organización política, régimen señorial y\nsociedad estamental.\n4. El Imperio de los Austrias: España bajo Carlos I. Política interior y conflictos europeos.\n5. La guerra de los Treinta Años y la pérdida de la hegemonía española en Europa.\n6. La nueva Monarquía Borbónica. Los Decretos de Nueva Planta. Modelo de Estado y\nalcance de las reformas.",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
      {
        id: "h-2018-extra-a-fuente",
        tipo: "fuente",
        label: "Fuente",
        imagen_url: "/historia-imgs/extraordinarias/historia-2018-extra-a-fuente.png",
        enunciado: "Relacione esta imagen con el reinado de Isabel II (1833-1868): la primera guerra carlista.\n\nAbrazo de Vergara en 1839. Grabado.",
        puntuacion: 1.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
      },
      {
        id: "h-2018-extra-a-tema",
        tipo: "tema",
        label: "Tema",
        enunciado: "La dictadura de Primo de Rivera. El final del reinado de Alfonso XIII.",
        puntuacion: 4.5,
        criterios: "Se valorará la capacidad de síntesis, claridad y organización expositiva, referencias cronológicas y espaciales, y adecuación al tema planteado.",
      }
    ]
  },
  {
    id: 8001,
    año: 2018,
    tipo: "Extraordinaria",
    opcion: "B",
    asignatura: "Historia de España",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2018-extra-b-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "1. El reino visigodo: origen y organización política. Los concilios.\n2. Al Ándalus: reinos de taifas. Reino nazarí.\n3. La Monarquía Hispánica de Felipe II. Gobierno y administración. Los problemas\ninternos. Guerras y     sublevación en Europa.\n4. Principales factores de la crisis demográfica y económica del siglo XVII y sus\nconsecuencias.\n5. La Guerra de Sucesión Española y el sistema de Utrecht. Los Pactos de Familia.\n6. La España del siglo XVIII. Expansión y transformaciones económicas: agricultura,\nindustria y comercio con América. Causas del despegue económico de Cataluña.",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
      {
        id: "h-2018-extra-b-fuente",
        tipo: "fuente",
        label: "Fuente",
        imagen_url: "/historia-imgs/extraordinarias/historia-2018-extra-b-fuente.png",
        enunciado: "Relacione esta imagen con el bienio reformista (1931-1933) en la Segunda República.\n\nCuarto gobierno republicano de Manuel Azaña, 1933.",
        puntuacion: 1.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
      },
      {
        id: "h-2018-extra-b-texto",
        tipo: "texto",
        label: "Texto",
        enunciado: "ANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Explique razonadamente el tipo de texto y resuma las ideas fundamentales del mismo.\n2. Responda a la cuestión histórica planteada en el texto.",
        texto_fuente: "Lo mismo si el sufragio es universal que restringido, nunca hay más que un solo elector, el\nMinistro de la Gobernación. Éste con sus gobernadores de provincia y el innumerable\nejército de empleados de todas clases (...) ejecuta y consuma las elecciones, de cualquier\nespecie que sean, desde el fondo de su despacho, situado en el centro de Madrid.\nPara hacer las listas de electores se ponen en ellas algunos nombres verdaderamente\nperdidos entre una multitud de imaginarios y, sobre todo, de difuntos. La representación de\nestos últimos se da siempre a agentes disfrazados de paisano para ir a votar. El autor de\nestas líneas, ha visto repetidas veces que su padre, fallecido ya hace algunos años, iba a\ndepositar su voto en la urna bajo la figura de un barrendero de la ciudad o de un sabueso de\npolicía, vestido con traje prestado. (...)\nEste sistema de elecciones por medio de la resurrección de los muertos y los agentes de\npolicía vestidos de paisano no es, sin embargo, lo peor de los medios empleados para\nfalsear el sufragio por nuestros pretendidos defensores del parlamentarismo y del sistema\nrepresentativo. Apresurémonos a decir que ordinariamente no se detienen en esas\napariencias de humano respeto, y que lo que hacen es pura y sencillamente aumentar el\nnúmero de votos hasta tener asegurada la elección del candidato adicto.\nValentí Almirall, España tal cual es (1886).\n\nANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Explique razonadamente el tipo de texto y resuma las ideas fundamentales del mismo\n(puntuación máxima: 1,5 puntos).\n2. Responda a la siguiente cuestión (puntuación máxima: 3 puntos): La Restauración\nBorbónica: Cánovas del Castillo y el turno de partidos.",
        puntuacion: 4.5,
        criterios: "Se valorará la comprensión del texto, el resumen, la explicación de las ideas fundamentales y la contextualización histórica precisa.",
      }
    ]
  },
  {
    id: 8002,
    año: 2019,
    tipo: "Extraordinaria",
    opcion: "A",
    asignatura: "Historia de España",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2019-extra-a-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "1. Conquista y romanización de la Península Ibérica. Principales aportaciones romanas en los ámbitos\nsocial, económico y cultural.\n2. Al Ándalus: la conquista musulmana de la Península Ibérica. Emirato y califato de Córdoba.\n3. Organización política de la Corona de Castilla, de la Corona de Aragón y del Reino de Navarra al final\nde la Edad Media.\n4. El significado de 1492. La guerra de Granada y el descubrimiento de América.\n5. Principales factores de la crisis demográfica y económica del siglo XVII y sus consecuencias.\n6. La España del siglo XVIII. Expansión y transformaciones económicas: agricultura, industria y comercio\ncon América. Causas del despegue económico de Cataluña.",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
      {
        id: "h-2019-extra-a-fuente",
        tipo: "fuente",
        label: "Fuente",
        imagen_url: "/historia-imgs/extraordinarias/historia-2019-extra-a-fuente.png",
        enunciado: "Relacione esta imagen con el Sexenio Democrático (1868-1874).\n\nCaricatura del golpe de estado del General Pavía en la revista La Madeja Política (enero de 1874).",
        puntuacion: 1.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
      },
      {
        id: "h-2019-extra-a-tema",
        tipo: "tema",
        label: "Tema",
        enunciado: "La proclamación de la Segunda República. La Constitución de 1931. El bienio reformista (1931-1933).",
        puntuacion: 4.5,
        criterios: "Se valorará la capacidad de síntesis, claridad y organización expositiva, referencias cronológicas y espaciales, y adecuación al tema planteado.",
      }
    ]
  },
  {
    id: 8003,
    año: 2019,
    tipo: "Extraordinaria",
    opcion: "B",
    asignatura: "Historia de España",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2019-extra-b-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "1. Sociedad y economía en el Paleolítico y Neolítico. La pintura rupestre.\n2. Al Ándalus: reinos de taifas. Reino nazarí.\n3. Los reinos cristianos en la Edad Media: organización política, régimen señorial y sociedad estamental.\n4. Los Austrias del siglo XVII: el gobierno de validos. La crisis de 1640.\n5. Crisis y decadencia de la Monarquía Hispánica: el reinado de Carlos II y el problema sucesorio.\n6. Ideas fundamentales de la Ilustración. El despotismo ilustrado: Carlos III.",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
      {
        id: "h-2019-extra-b-fuente",
        tipo: "fuente",
        label: "Fuente",
        imagen_url: "/historia-imgs/extraordinarias/historia-2019-extra-b-fuente.png",
        enunciado: "Relacione esta fotografía con el restablecimiento de la democracia: las elecciones de junio de 1977.\n\nEl Presidente del Gobierno Adolfo Suárez y su esposa Amparo Illana votan en las elecciones generales\nde 15 junio 1977.",
        puntuacion: 1.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
      },
      {
        id: "h-2019-extra-b-texto",
        tipo: "texto",
        label: "Texto",
        enunciado: "ANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Explique razonadamente el tipo de texto y resuma las ideas fundamentales del mismo.\n2. Responda a la cuestión histórica planteada en el texto.",
        texto_fuente: "Abdicaciones de Bayona (Francia), 5 de mayo de 1808\n\nDe Fernando VII en su padre:\n\n“Mi venerado padre y señor. Para dar a Vuestra Majestad una prueba de mi amor, de mi obediencia\ny de mi sumisión, y para acceder a los deseos que Vuestra Majestad me ha manifestado reiteradas veces,\nrenuncio mi corona a favor de Vuestra Majestad, deseando que Vuestra Majestad pueda gozarla por\nmuchos años. Recomiendo a Vuestra Majestad las personas que me han servido desde el 19 de marzo”.\n\nDe Carlos IV en Napoleón Bonaparte:\n\n“Su Majestad el rey Carlos, que no ha tenido en toda su vida otra mira que la felicidad de sus\nvasallos, constante en la idea de que todos los actos de un soberano deben únicamente dirigirse a este\nfin (...) ha resuelto ceder, como cede por el presente, todos sus derechos al trono de España y de las\nIndias a Su Majestad el emperador Napoleón, como único que, en el estado a que han llegado las cosas,\npuede restablecer el orden; entendiéndose que dicha cesión sólo ha de tener efecto para hacer gozar a\nsus vasallos de las condiciones siguientes:\n\n1º. La integridad del reino será mantenida: el príncipe que el emperador Napoleón juzgue debe\ncolocar en el trono de España será independiente y los límites de la España no sufrirán alteración alguna.\n\n2º. La religión católica, apostólica y romana será la única en España. No se tolerará en su territorio\nreligión alguna reformada y mucho menos infiel, según el uso establecido actualmente”.\n\nANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad y concisión el contenido del texto. (Puntuación máxima: 0’5 puntos).\n2. Señale y explique las ideas fundamentales del texto. (Puntuación máxima: 1 punto).\n3. Responda a la siguiente cuestión. (Puntuación máxima: 3 puntos): La Guerra de la Independencia:\nantecedentes y causas.",
        puntuacion: 4.5,
        criterios: "Se valorará la comprensión del texto, el resumen, la explicación de las ideas fundamentales y la contextualización histórica precisa.",
      }
    ]
  },
  {
    id: 8004,
    año: 2020,
    tipo: "Extraordinaria",
    opcion: "A",
    asignatura: "Historia de España",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2020-extra-a-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "A.1 (4 puntos) CUESTIONES:\n1. Los pueblos prerromanos. Las colonizaciones históricas: fenicios y griegos. Tartessos.\n2. Al Ándalus: la conquista musulmana de la Península Ibérica. Emirato y califato de Córdoba.\n3. Organización política de la Corona de Castilla, de la Corona de Aragón y del Reino de Navarra al final de\nla Edad Media.\n4. El significado de 1492. La guerra de Granada y el descubrimiento de América.\n5. Crisis y decadencia de la Monarquía Hispánica: el reinado de Carlos II y el problema sucesorio.\n6. La España del siglo XVIII. Expansión y transformaciones económicas: agricultura, industria y comercio\ncon América. Causas del despegue económico de Cataluña.",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
      {
        id: "h-2020-extra-a-fuente",
        tipo: "fuente",
        label: "Fuente",
        imagen_url: "/historia-imgs/extraordinarias/historia-2020-extra-a-fuente.png",
        enunciado: "A.2 (1,5 puntos) FUENTE:\n1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo a la\nsiguiente imagen. (Puntuación máxima: 0,5 puntos).\n2. Explique el contexto histórico de la Restauración Borbónica (1874-1902). (Puntuación máxima: 1 punto).\nLa llegada de Alfonso XII al trono, entrada a caballo en Madrid. Fuente: Casa Real de España.",
        puntuacion: 1.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
      },
      {
        id: "h-2020-extra-a-tema",
        tipo: "tema",
        label: "Tema",
        enunciado: "A.3 (4,5 puntos) TEMA:\nLa Guerra Civil: la sublevación militar y el estallido de la guerra. La dimensión internacional del\nconflicto.",
        puntuacion: 4.5,
        criterios: "Se valorará la capacidad de síntesis, claridad y organización expositiva, referencias cronológicas y espaciales, y adecuación al tema planteado.",
      }
    ]
  },
  {
    id: 8005,
    año: 2020,
    tipo: "Extraordinaria",
    opcion: "B",
    asignatura: "Historia de España",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2020-extra-b-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "B.1 (4 puntos) CUESTIONES:\n1. Conquista y romanización de la península Ibérica. Principales aportaciones romanas en los ámbitos\nsocial, económico y cultural.\n2. Al Ándalus: economía, sociedad y cultura.\n3. Los reinos cristianos en la Edad Media: organización política, régimen señorial y sociedad estamental.\n4. La Monarquía Hispánica de Felipe II. Gobierno y administración. Los problemas internos. Guerras y\nsublevación en Europa.\n5. Los Austrias del siglo XVII: el gobierno de validos. La crisis de 1640.\n6. Ideas fundamentales de la Ilustración. El despotismo ilustrado: Carlos III.",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
      {
        id: "h-2020-extra-b-fuente",
        tipo: "fuente",
        label: "Fuente",
        imagen_url: "/historia-imgs/extraordinarias/historia-2020-extra-b-fuente.png",
        enunciado: "B.2 (1,5 puntos) FUENTE:\n1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo a la\nsiguiente imagen. (Puntuación máxima: 0,5 puntos).\n2. Explique el contexto histórico de la política económica del franquismo: el desarrollismo. (Puntuación\nmáxima: 1 punto).\n\nCadena de montaje del Seat Seiscientos. Fuente: El Diario.es",
        puntuacion: 1.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
      },
      {
        id: "h-2020-extra-b-texto",
        tipo: "texto",
        label: "Texto",
        enunciado: "ANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad el contenido del texto.\n2. Señale y explique las ideas fundamentales del texto.\n3. Responda a la cuestión histórica planteada.",
        texto_fuente: "B.3 (4,5 puntos) TEXTO:\nPreámbulo\nDon Fernando Séptimo, por la gracia de Dios y la Constitución de la Monarquía española, Rey de las\nEspañas, y en su ausencia y cautividad la Regencia del reino, nombrada por las Cortes generales y\nextraordinarias, a todos los que las presentes vieren y entendieren, sabed: Que las mismas Cortes han\ndecretado y sancionado la siguiente\nCONSTITUCIÓN POLÍTICA DE LA MONARQUÍA ESPAÑOLA\nEn el nombre de Dios todopoderoso, Padre, Hijo y Espíritu Santo, autor y supremo legislador de la sociedad.\nLas Cortes generales y extraordinarias de la Nación española, bien convencidas, después del más detenido\nexamen y madura deliberación, de que las antiguas leyes fundamentales de esta Monarquía, acompañadas\nde las oportunas providencias y precauciones, que aseguren de un modo estable y permanente su entero\ncumplimiento, podrán llenar debidamente el grande objeto de promover la gloria, la prosperidad y el bien de\ntoda la Nación, decretan la siguiente Constitución política para el buen gobierno y recta administración del\nEstado.\nDado en Cádiz, 19 de marzo de 1812.\n\nANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad el contenido del texto. (Puntuación máxima: 0,5 puntos).\n2. Señale las ideas fundamentales del texto. (Puntuación máxima: 1 punto).\n3. Responda a la siguiente cuestión: La Constitución de 1812. (Puntuación máxima: 3 puntos).",
        puntuacion: 4.5,
        criterios: "Se valorará la comprensión del texto, el resumen, la explicación de las ideas fundamentales y la contextualización histórica precisa.",
      }
    ]
  },
  {
    id: 8006,
    año: 2020,
    tipo: "Extraordinaria",
    opcion: "A",
    dia: "Coincidencias",
    asignatura: "Historia de España",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2020-extra-coincidencias-a-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "A.1 (4 puntos) CUESTIONES:\n1. Los pueblos prerromanos. Las colonizaciones históricas: fenicios y griegos. Tartessos.\n2. Al Ándalus: economía, sociedad y cultura.\n3. Organización política de la Corona de Castilla, de la Corona de Aragón y del Reino de Navarra al final\nde la Edad Media.\n4. Los Reyes Católicos: unión dinástica e instituciones de gobierno.\n5. Los Austrias del siglo XVII: el gobierno de validos. La crisis de 1640.\n6. La nueva Monarquía Borbónica. Los Decretos de Nueva Planta. Modelo de Estado y alcance de las\nreformas.",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
      {
        id: "h-2020-extra-coincidencias-a-fuente",
        tipo: "fuente",
        label: "Fuente",
        imagen_url: "/historia-imgs/extraordinarias/historia-2020-extra-coincidencias-a-fuente.png",
        enunciado: "A.2 (1,5 puntos) FUENTE:\n1.\nExplique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo a la\nsiguiente imagen. (Puntuación máxima: 0,5 puntos).\n2.\nExplique el contexto histórico de la dictadura de Primo de Rivera. (Puntuación máxima: 1 punto).\nPrimer despacho de Miguel Primo de Rivera con Alfonso XIII. Fuente. El Mundo.",
        puntuacion: 1.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
      },
      {
        id: "h-2020-extra-coincidencias-a-tema",
        tipo: "tema",
        label: "Tema",
        enunciado: "A.3 (4,5 puntos) TEMA:\nEl reinado de Fernando VII: liberalismo frente a absolutismo. El proceso de independencia de las\ncolonias americanas.",
        puntuacion: 4.5,
        criterios: "Se valorará la capacidad de síntesis, claridad y organización expositiva, referencias cronológicas y espaciales, y adecuación al tema planteado.",
      }
    ]
  },
  {
    id: 8007,
    año: 2020,
    tipo: "Extraordinaria",
    opcion: "B",
    dia: "Coincidencias",
    asignatura: "Historia de España",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2020-extra-coincidencias-b-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "B.1 (4 puntos) CUESTIONES:\n1. Sociedad y economía en el Paleolítico y Neolítico. La pintura rupestre.\n2. Al Ándalus: reinos de taifas. Reino nazarí.\n3. Los primeros núcleos de resistencia cristiana. Principales etapas de la Reconquista. Modelos de\nrepoblación.\n4. La Monarquía Hispánica de Felipe II. Gobierno y administración. Los problemas internos. Guerras y\nsublevación en Europa.\n5. Principales factores de la crisis demográfica y económica del siglo XVII y sus consecuencias.\n6. La España del siglo XVIII. Expansión y transformaciones económicas: agricultura, industria y\ncomercio con América. Causas del despegue económico de Cataluña.",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
      {
        id: "h-2020-extra-coincidencias-b-fuente",
        tipo: "fuente",
        label: "Fuente",
        imagen_url: "/historia-imgs/extraordinarias/historia-2020-extra-coincidencias-b-fuente.png",
        enunciado: "B.2 (1,5 puntos) FUENTE:\n1.\nExplique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo a la\nsiguiente imagen. (Puntuación máxima: 0,5 puntos).\n2.\nExplique el contexto histórico del problema de Cuba y la guerra entre España y Estados Unidos.\n(Puntuación máxima: 1 punto).\nEjército de Operaciones en Cuba. 3ª compañía del primer batallón del regimiento de Navarra.\nFuente: Biblioteca Nacional.",
        puntuacion: 1.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
      },
      {
        id: "h-2020-extra-coincidencias-b-texto",
        tipo: "texto",
        label: "Texto",
        enunciado: "ANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad el contenido del texto.\n2. Señale y explique las ideas fundamentales del texto.\n3. Responda a la cuestión histórica planteada.",
        texto_fuente: "B.3 (4,5 puntos) TEXTO:\n“Creo modestamente que en esta nueva hora de España y al pedirles su voto no traigo mis\npapeles en blanco ni soy una incógnita. Prometimos devolverle la soberanía al pueblo español, y\nmañana la ejerce. Prometimos normalizar nuestra vida política, gestionar la transición en paz, construir\nla democracia desde la legalidad, y creemos que con las lógicas deficiencias lo hemos conseguido. (…)\nque todas las familias políticas pudieran tener un lugar en las Cortes, y el miércoles pueden lograrlo.\nPero si ustedes nos dan su voto,\nPuedo prometer y prometo que nuestros actos de gobierno constituirán un conjunto escalonado\nde medidas racionales y objetivas para la progresiva solución de nuestros problemas.\nPuedo prometer y prometo intentar elaborar una Constitución en colaboración con todos los\ngrupos representados en las Cortes, cualquiera que sea su número de escaños.\nPuedo prometer y prometo, porque después de las elecciones ya existirán los instrumentos\nnecesarios, dedicar todos los esfuerzos a lograr un entendimiento social que permita fijar las nuevas\nlíneas básicas que ha de seguir la economía española en los próximos años.\nPuedo prometer y prometo que los hombres de Unión de Centro Democrático promoverán una\nreforma fiscal que garantice, de una vez para todas, que pague más quien más tiene.\nPuedo prometer y prometo un marco legal para institucionalizar cada región según sus propias\ncaracterísticas. (…)”.\nAdolfo Suárez, 13 de junio de 1977.\nEspacio Electoral en Televisión Española de cara a las elecciones de 15 de junio de 1977.\nANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad el contenido del texto. (Puntuación máxima: 0,5 puntos).\n2. Señale las ideas fundamentales del texto. (Puntuación máxima: 1 punto).\n3. Responda a la siguiente cuestión: Las etapas políticas de la Democracia. Los gobiernos de la UCD.\n(Puntuación máxima: 3 puntos).",
        puntuacion: 4.5,
        criterios: "Se valorará la comprensión del texto, el resumen, la explicación de las ideas fundamentales y la contextualización histórica precisa.",
      }
    ]
  },
  {
    id: 8008,
    año: 2021,
    tipo: "Extraordinaria",
    opcion: "A",
    asignatura: "Historia de España",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2021-extra-a-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "A.1 (4 puntos) CUESTIONES:\n1. Sociedad y economía en el Paleolítico y Neolítico. La pintura rupestre.\n2. Al Ándalus: reinos de taifas. Reino nazarí.\n3. Los reinos cristianos en la Edad Media: organización política, régimen señorial y sociedad estamental.\n4. La Monarquía Hispánica de Felipe II. Gobierno y administración. Los problemas internos. Guerras y\nsublevación en Europa.\n5. La guerra de los Treinta Años y la pérdida de la hegemonía española en Europa.\n6. La España del siglo XVIII. Expansión y transformaciones económicas: agricultura, industria y comercio con\nAmérica. Causas del despegue económico de Cataluña.",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
      {
        id: "h-2021-extra-a-fuente",
        tipo: "fuente",
        label: "Fuente",
        imagen_url: "/historia-imgs/extraordinarias/historia-2021-extra-a-fuente.png",
        enunciado: "A.2 (1,5 puntos) FUENTE:\n1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo a la\nsiguiente imagen. (Puntuación máxima: 0,5 puntos).\n2. Explique el contexto histórico del inicio de la Guerra de la Independencia. (Puntuación máxima: 1\npunto).\nFrancisco de Goya, Los fusilamientos del 3 de mayo (Museo del Prado)",
        puntuacion: 1.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
      },
      {
        id: "h-2021-extra-a-tema",
        tipo: "tema",
        label: "Tema",
        enunciado: "A.3 (4,5 puntos) TEMA: Política económica del franquismo: de la autarquía al desarrollismo. Transformaciones\nsociales: causas y evolución.",
        puntuacion: 4.5,
        criterios: "Se valorará la capacidad de síntesis, claridad y organización expositiva, referencias cronológicas y espaciales, y adecuación al tema planteado.",
      }
    ]
  },
  {
    id: 8009,
    año: 2021,
    tipo: "Extraordinaria",
    opcion: "B",
    asignatura: "Historia de España",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2021-extra-b-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "B.1 (4 puntos) CUESTIONES:\n1. Conquista y romanización de la Península Ibérica. Principales aportaciones romanas en los ámbitos social,\neconómico y cultural.\n2. Al Ándalus: economía, sociedad y cultura.\n3. Organización política de la Corona de Castilla, de la Corona de Aragón y del Reino de Navarra al final de la\nEdad Media.\n4. Los Reyes Católicos: unión dinástica e instituciones de gobierno.\n5. Exploración y colonización de América. Consecuencias de los descubrimientos en España, Europa y América.\n6. Ideas fundamentales de la Ilustración. El despotismo ilustrado: Carlos III.",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
      {
        id: "h-2021-extra-b-fuente",
        tipo: "fuente",
        label: "Fuente",
        imagen_url: "/historia-imgs/extraordinarias/historia-2021-extra-b-fuente.png",
        enunciado: "B.2 (1,5 puntos) FUENTE:\n1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo a la\nsiguiente imagen. (Puntuación máxima: 0,5 puntos).\n2. Explique el contexto histórico de la alternancia política en 1982. (Puntuación máxima: 1 punto).\n\nPrimer gobierno del Partido Socialista Obrero Español, 1982-1986",
        puntuacion: 1.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
      },
      {
        id: "h-2021-extra-b-texto",
        tipo: "texto",
        label: "Texto",
        enunciado: "ANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad el contenido del texto.\n2. Señale y explique las ideas fundamentales del texto.\n3. Responda a la cuestión histórica planteada.",
        texto_fuente: "B.3 (4,5 puntos) TEXTO:\n\n“He recibido de España un gran número de felicitaciones con motivo de mi cumpleaños (...) Cuantos me\nhan escrito muestran igual convicción de que sólo el restablecimiento de la monarquía constitucional puede\nponer término a la opresión, a la incertidumbre y a las crueles perturbaciones que experimenta España (...) Por\nvirtud de la espontánea y solemne abdicación de mi augusta madre, soy el único representante del derecho\nmonárquico en España. Arranca éste de una legislación secular, confirmada por todos los precedentes históricos,\ny está indudablemente unida a todas las instituciones representativas (...)\nHuérfana la nación ahora de todo derecho público e indefinidamente privada de sus libertades, natural es\nque vuelva los ojos a su acostumbrado derecho constitucional (...) Por todo esto, sin duda, lo único que inspira ya\nconfianza en España es una Monarquía hereditaria y representativa, mirándola como irremplazable garantía de\nsus derechos e intereses desde las clases obreras a las más elevadas.\n(...) Sea lo que sea de mi propia suerte, ni dejaré de ser buen español, ni, como todos mis antepasados,\nbuen católico, ni, como hombre del siglo, verdaderamente liberal”.\n\nAlfonso de Borbón, Inglaterra, 1 de diciembre 1874.\n\nANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad el contenido del texto. (Puntuación máxima: 0,5 puntos).\n2. Señale las ideas fundamentales del texto. (Puntuación máxima: 1 punto).\n3. Responda a la siguiente cuestión (Puntuación máxima: 3 puntos): La Restauración Borbónica. Cánovas del\nCastillo y el turno de partidos.",
        puntuacion: 4.5,
        criterios: "Se valorará la comprensión del texto, el resumen, la explicación de las ideas fundamentales y la contextualización histórica precisa.",
      }
    ]
  },
  {
    id: 8010,
    año: 2021,
    tipo: "Extraordinaria",
    opcion: "A",
    dia: "Coincidencias",
    asignatura: "Historia de España",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2021-extra-coincidencias-a-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "A.1 (4 puntos) CUESTIONES:\n1. Conquista y romanización de la Península Ibérica. Principales aportaciones romanas en los ámbitos social,\neconómico y cultural.\n2. Al Ándalus: reinos de taifas. Reino nazarí.\n3. Los reinos cristianos en la Edad Media: organización política, régimen señorial y sociedad estamental.\n4. Los Reyes Católicos: unión dinástica e instituciones de gobierno.\n5. La guerra de los Treinta Años y la pérdida de la hegemonía española en Europa.\n6. La nueva Monarquía Borbónica. Los Decretos de Nueva Planta. Modelo de Estado y alcance de las reformas.",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
      {
        id: "h-2021-extra-coincidencias-a-fuente",
        tipo: "fuente",
        label: "Fuente",
        imagen_url: "/historia-imgs/extraordinarias/historia-2021-extra-coincidencias-a-fuente.png",
        enunciado: "A.2 (1,5 puntos) FUENTE:\n1.\nExplique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo a la\nsiguiente imagen. (Puntuación máxima: 0,5 puntos).\n2.\nExplique el contexto histórico de los inicios del desarrollismo en el Franquismo. (Puntuación máxima: 1\npunto).\nEmigrantes saliendo de la Estación de Francia, Barcelona, 1962 (Fotografía de Xavier Miserachs)",
        puntuacion: 1.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
      },
      {
        id: "h-2021-extra-coincidencias-a-tema",
        tipo: "tema",
        label: "Tema",
        enunciado: "A.3 (4,5 puntos) TEMA: Las Cortes de Cádiz. La Constitución de 1812.\nE i\nli\nd d l\nió d F\ni\nB\nl\n1962 (f",
        puntuacion: 4.5,
        criterios: "Se valorará la capacidad de síntesis, claridad y organización expositiva, referencias cronológicas y espaciales, y adecuación al tema planteado.",
      }
    ]
  },
  {
    id: 8011,
    año: 2021,
    tipo: "Extraordinaria",
    opcion: "B",
    dia: "Coincidencias",
    asignatura: "Historia de España",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2021-extra-coincidencias-b-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "B.1 (4 puntos) CUESTIONES:\n1. Los pueblos prerromanos. Las colonizaciones históricas: fenicios y griegos. Tartesos.\n2. Al Ándalus: la conquista musulmana de la Península Ibérica. Emirato y califato de Córdoba.\n3. Los primeros núcleos de resistencia cristiana. Principales etapas de la Reconquista. Modelos de repoblación.\n4. La Monarquía Hispánica de Felipe II. Gobierno y administración. Los problemas internos. Guerras y\nsublevación en Europa.\n5. Crisis y decadencia de la Monarquía Hispánica: el reinado de Carlos II y el problema sucesorio.\n6. Ideas fundamentales de la Ilustración. El despotismo ilustrado: Carlos III.",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
      {
        id: "h-2021-extra-coincidencias-b-fuente",
        tipo: "fuente",
        label: "Fuente",
        imagen_url: "/historia-imgs/extraordinarias/historia-2021-extra-coincidencias-b-fuente.png",
        enunciado: "B.2 (1,5 puntos) FUENTE:\n1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo a la\nsiguiente imagen. (Puntuación máxima: 0,5 puntos).\n2. Explique el contexto histórico de la década moderada durante el reinado de Isabel II. (Puntuación\nmáxima: 1 punto).\n(Fuente: A Carreras y X. Tafunell, Estadísticas históricas de España, siglos XIX y XX).",
        puntuacion: 1.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
      },
      {
        id: "h-2021-extra-coincidencias-b-texto",
        tipo: "texto",
        label: "Texto",
        enunciado: "ANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad el contenido del texto.\n2. Señale y explique las ideas fundamentales del texto.\n3. Responda a la cuestión histórica planteada.",
        texto_fuente: "B.3 (4,5 puntos) TEXTO:\n“Respecto a la serie de afirmaciones que se han hecho esta tarde contra el voto de la mujer, he de decir,\ncon toda la cordialidad necesaria, que no están apoyadas en la realidad. Tomemos al azar algunas de ellas. Que\n¿cuándo las mujeres se han levantado para protestar de la guerra de Marruecos? Primero: ¿y por qué no los\nhombres? Segundo: ¿quién protestó y se levantó en Zaragoza cuando la guerra de Cuba más que las mujeres?\n(Rumores).\n¡Las mujeres! ¿Cómo puede decirse que cuando las mujeres dan señales de vida por la República se las\nconcederá como premio el derecho a votar? ¿Es que no han luchado las mujeres por la República? (…) ¿No\npagan los impuestos para sostener al Estado en la misma forma que las otras y que los varones? ¿No refluye\nsobre ellas toda la consecuencia de la legislación que se elabora aquí para los dos sexos, pero solamente dirigida\ny matizada por uno? ¿Cómo puede decirse que la mujer no ha luchado y que necesita una época, largos años de\nRepública, para demostrar su capacidad? ¿Y por qué no los hombres? ¿Por qué el hombre, al advenimiento de la\nRepública, ha de tener sus derechos y ha de ponerse un lazadero a los de la mujer? (...)”\nIntervención de Clara Campoamor, Sesión de las Cortes Constituyentes, 1 de octubre de 1931.\nANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad el contenido del texto. (Puntuación máxima: 0,5 puntos).\n2. Señale las ideas fundamentales del texto. (Puntuación máxima: 1 punto).\n3. Responda a la siguiente cuestión (Puntuación máxima: 3 puntos): La proclamación de la Segunda República.\nLa Constitución de 1931.",
        puntuacion: 4.5,
        criterios: "Se valorará la comprensión del texto, el resumen, la explicación de las ideas fundamentales y la contextualización histórica precisa.",
      }
    ]
  },
  {
    id: 8012,
    año: 2022,
    tipo: "Extraordinaria",
    opcion: "A",
    asignatura: "Historia de España",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2022-extra-a-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "A.1 (4 puntos) CUESTIONES:\n1. Los pueblos prerromanos. Las colonizaciones históricas: fenicios y griegos. Tartesos.\n2. Al Ándalus: reinos de taifas. Reino nazarí.\n3. Los primeros núcleos de resistencia cristiana. Principales etapas de la Reconquista. Modelos de repoblación.\n4. El significado de 1492. La guerra de Granada y el descubrimiento de América.\n5. Crisis y decadencia de la Monarquía Hispánica: el reinado de Carlos II y el problema sucesorio.\n6. Ideas fundamentales de la Ilustración. El despotismo ilustrado: Carlos III.",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
      {
        id: "h-2022-extra-a-fuente",
        tipo: "fuente",
        label: "Fuente",
        imagen_url: "/historia-imgs/extraordinarias/historia-2022-extra-a-fuente.png",
        enunciado: "A.2 (1,5 puntos) FUENTE:\n1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo a la\nsiguiente imagen. (Puntuación máxima: 0,5 puntos).\n2. Relacione esta imagen con el contexto internacional del franquismo: el reconocimiento exterior\n(Puntuación máxima: 1 punto).\nFranco y el presidente de Estados Unidos, Eisenhower, durante su visita a España en 1959.",
        puntuacion: 1.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
      },
      {
        id: "h-2022-extra-a-tema",
        tipo: "tema",
        label: "Tema",
        enunciado: "A.3 (4,5 puntos) TEMA: El reinado de Isabel II (1833-1868): la primera guerra carlista. Evolución política, partidos\ny conflictos. El Estatuto Real de 1834 y las Constituciones de 1837 y 1845.",
        puntuacion: 4.5,
        criterios: "Se valorará la capacidad de síntesis, claridad y organización expositiva, referencias cronológicas y espaciales, y adecuación al tema planteado.",
      }
    ]
  },
  {
    id: 8013,
    año: 2022,
    tipo: "Extraordinaria",
    opcion: "B",
    asignatura: "Historia de España",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2022-extra-b-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "B.1 (4 puntos) CUESTIONES:\n1. El reino visigodo: origen y organización política. Los concilios.\n2. Al Ándalus: la conquista musulmana de la Península Ibérica. Emirato y califato de Córdoba.\n3. Al Ándalus: economía, sociedad y cultura.\n4. Los Reyes Católicos: unión dinástica e instituciones de gobierno.\n5. Principales factores de la crisis demográfica y económica del siglo XVII y sus consecuencias.\n6. La Guerra de Sucesión Española y el sistema de Utrecht. Los Pactos de Familia.",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
      {
        id: "h-2022-extra-b-fuente",
        tipo: "fuente",
        label: "Fuente",
        imagen_url: "/historia-imgs/extraordinarias/historia-2022-extra-b-fuente.png",
        enunciado: "B.2 (1,5 puntos) FUENTE:\n1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo a la\nsiguiente tabla (Puntuación máxima: 0,5 puntos).\n2. Relacione esta tabla con la evolución demográfica en el siglo XIX (Puntuación máxima: 1 punto).\nCrecimiento de la población española, 1717-1910\nAños\nPoblación (en miles)\nTasa media de crecimiento\n(%)\n1717\n7.500,0\n1768\n9.308,9\n0,42\n1787\n10.409,9\n0,59\n1797\n10.541,2\n0,13\n1860\n15.649,1\n0,63\n1887\n17.560,1\n0,43\n1900\n18.608,1\n0,45\n1910\n19.944,6\n0,70",
        puntuacion: 1.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
      },
      {
        id: "h-2022-extra-b-texto",
        tipo: "texto",
        label: "Texto",
        enunciado: "ANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad el contenido del texto.\n2. Señale y explique las ideas fundamentales del texto.\n3. Responda a la cuestión histórica planteada.",
        texto_fuente: "B.3 (4,5 puntos) TEXTO:\n“Españoles: Gracias por vuestra adhesión y por la serena y viril manifestación pública que me ofrecéis en\ndesagravio a las agresiones que han sido objeto varias de nuestras representaciones y establecimientos españoles\nen Europa, que nos demuestran, una vez más, lo que podemos esperar de determinados países corrompidos que\naclara perfectamente su política constante contra nuestros intereses.\nNo es la más importante, aunque se presenta en su apariencia, el asalto y destrucción de nuestra Embajada\nen Portugal, realizada en un estado de anarquía y de caos en que se debate la nación hermana y nadie más\ninteresado que nosotros en que pueda ser restablecido en ellos el orden y la autoridad.\nTodo obedece a una conspiración masónico-izquierdista en la clase política en contubernio con la subversión\ncomunista-terrorista en lo social, que, si a nosotros nos honra, a ellos les envilece.\nEstas manifestaciones demuestran, por otra parte, que el pueblo español no es un pueblo muerto, al que se\nle engaña; está despierto y vela sus razones y confía que la valía de las fuerzas guardadoras del orden público y\nsuprema garantía de la unidad de las Fuerzas de Tierra, Mar y Aire, respaldando la voluntad de la Nación, permiten\nal pueblo español descansar tranquilo.\nEvidentemente, el ser español ha vuelto a ser hoy algo en el mundo. ¡Arriba España!”\n(Último discurso de Francisco Franco, 1 de octubre de 1975, desde un balcón del Palacio Real sobre la Plaza\nde Oriente)\nANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad el contenido del texto (Puntuación máxima: 0,5 puntos).\n2. Señale y explique las ideas fundamentales del texto (Puntuación máxima: 1 punto).\n3. Responda a la siguiente cuestión: La crisis del franquismo desde 1973 a la muerte de Franco (Puntuación\nmáxima: 3 puntos).",
        puntuacion: 4.5,
        criterios: "Se valorará la comprensión del texto, el resumen, la explicación de las ideas fundamentales y la contextualización histórica precisa.",
      }
    ]
  },
  {
    id: 8014,
    año: 2022,
    tipo: "Extraordinaria",
    opcion: "A",
    dia: "Coincidencias",
    asignatura: "Historia de España",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2022-extra-coincidencias-a-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "A.1 (4 puntos) CUESTIONES:\n1. Los pueblos prerromanos. Las colonizaciones históricas: fenicios y griegos. Tartesos.\n2. Al Ándalus: economía, sociedad y cultura.\n3. Los reinos cristianos en la Edad Media: organización política, régimen señorial y sociedad estamental.\n4. La Monarquía Hispánica de Felipe II. Gobierno y administración. Los problemas internos. Guerras y\nsublevación en Europa.\n5. Los Austrias del siglo XVII: el gobierno de validos. La crisis de 1640.\n6. La España del siglo XVIII. Expansión y transformaciones económicas: agricultura, industria y comercio con\nAmérica. Causas del despegue económico de Cataluña.",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
      {
        id: "h-2022-extra-coincidencias-a-fuente",
        tipo: "fuente",
        label: "Fuente",
        imagen_url: "/historia-imgs/extraordinarias/historia-2022-extra-coincidencias-a-fuente.png",
        enunciado: "A.2 (1,5 puntos) FUENTE:\n1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo al siguiente\ncuadro. (Puntuación máxima: 0,5 puntos).\n2. Relacione este cuadro con las características principales de las desamortizaciones de Mendizábal y\nMadoz (Puntuación máxima: 1 punto).\nDesamortización de bienes raíces, censos y foros. Volumen total de las ventas\nEtapas\nFincas del clero\nFincas de propios\nOtras fincas\n1798-1808\n1.392.777\n0\n83.902\n1820-1823\n99.900\n0\n0\n1836-1849\n3.820.100\n0\n0\n1855-1856\n323.819\n159.773\n283.130\n1859-1867\n1.272.671\n2.028.673\n911.505\nFuente: Jordi Nadal, El fracaso de la revolución industrial en España, p. 56.",
        puntuacion: 1.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
      },
      {
        id: "h-2022-extra-coincidencias-a-tema",
        tipo: "tema",
        label: "Tema",
        enunciado: "A.3 (4,5 puntos) TEMA: La dictadura de Primo de Rivera. El final del reinado de Alfonso XIII.",
        puntuacion: 4.5,
        criterios: "Se valorará la capacidad de síntesis, claridad y organización expositiva, referencias cronológicas y espaciales, y adecuación al tema planteado.",
      }
    ]
  },
  {
    id: 8015,
    año: 2022,
    tipo: "Extraordinaria",
    opcion: "B",
    dia: "Coincidencias",
    asignatura: "Historia de España",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2022-extra-coincidencias-b-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "B.1 (4 puntos) CUESTIONES:\n1. Conquista y romanización de la Península Ibérica. Principales aportaciones romanas en los ámbitos social,\neconómico y cultural.\n2. Al Ándalus: reinos de taifas. Reino nazarí.\n3. Los primeros núcleos de resistencia cristiana. Principales etapas de la Reconquista. Modelos de repoblación.\n4. El Imperio de los Austrias: España bajo Carlos I. Política interior y conflictos europeos.\n5. Exploración y colonización de América. Consecuencias de los descubrimientos en España, Europa y América.\n6. La nueva Monarquía Borbónica. Los Decretos de Nueva Planta. Modelo de Estado y alcance de las reformas.",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
      {
        id: "h-2022-extra-coincidencias-b-fuente",
        tipo: "fuente",
        label: "Fuente",
        imagen_url: "/historia-imgs/extraordinarias/historia-2022-extra-coincidencias-b-fuente.png",
        enunciado: "B.2 (1,5 puntos) FUENTE:\n1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo a la\nsiguiente imagen (Puntuación máxima: 0,5 puntos).\n2. Relacione esta imagen con los costes humanos de la Guerra Civil (Puntuación máxima: 1 punto).\nExiliados españoles en Francia. Fotografía de Robert Capa (1939)",
        puntuacion: 1.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
      },
      {
        id: "h-2022-extra-coincidencias-b-texto",
        tipo: "texto",
        label: "Texto",
        enunciado: "ANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad el contenido del texto.\n2. Señale y explique las ideas fundamentales del texto.\n3. Responda a la cuestión histórica planteada.",
        texto_fuente: "B.3 (4,5 puntos) TEXTO:\n“Vizcaínos: una facción antirreligiosa y antimonárquica se ha apoderado del mando durante la larga\nenfermedad de nuestro difunto rey, y trata de ir adquiriendo ascendientes para exponeros sin defensa a los\nataques de la revolución y de la anarquía que combatimos en 1823. Sus partidarios aparentan que consideran\nlas leyes antiguas y fundamentales del reino abolidas por otras nuevas, y, después de haber alterado el orden\nde sucesión al trono con una audacia de que no presenta otro ejemplar la historia, quieren hacer a España\ncómplice de sus abominables maquinaciones que la propaganda revolucionaria inventa para destruir el orden\nsocial en Europa.\n[…] rompiendo las cadenas de la esclavitud que os querían imponer, habéis proclamado a vuestro legítimo\nsoberano el magnánimo y virtuoso D. Carlos María Isidro de Borbón, que se os ha presentado rodeado del amor\nde todos los españoles, para cicatrizar las llagas que el genio destructor del orden social os había causado.\nVizcaínos: perseverad como todos los buenos españoles en vuestra valerosa resolución”.\n(Proclama de la Diputación de Vizcaya, 1833)\nANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad el contenido del texto (Puntuación máxima: 0,5 puntos).\n2. Señale y explique las ideas fundamentales del texto (Puntuación máxima: 1 punto).\n3. Responda a la siguiente cuestión: El reinado de Isabel II (1833-1868): la primera guerra carlista. (Puntuación\nmáxima: 3 puntos).",
        puntuacion: 4.5,
        criterios: "Se valorará la comprensión del texto, el resumen, la explicación de las ideas fundamentales y la contextualización histórica precisa.",
      }
    ]
  },
  {
    id: 8016,
    año: 2023,
    tipo: "Extraordinaria",
    opcion: "A",
    asignatura: "Historia de España",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2023-extra-a-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "A.1 (4 puntos) CUESTIONES:\n1. Sociedad y economía en el Paleolítico y Neolítico. La pintura rupestre.\n2. Al Ándalus: economía, sociedad y cultura.\n3. Los Reyes Católicos: unión dinástica e instituciones de gobierno.\n4. La guerra de los Treinta Años y la pérdida de la hegemonía española en Europa.\n5. La Guerra de Sucesión Española y el sistema de Utrecht. Los Pactos de Familia.\n6. La España del siglo XVIII. Expansión y transformaciones económicas: agricultura, industria y comercio con\nAmérica. Causas del despegue económico de Cataluña.",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
      {
        id: "h-2023-extra-a-fuente",
        tipo: "fuente",
        label: "Fuente",
        imagen_url: "/historia-imgs/extraordinarias/historia-2023-extra-a-fuente.png",
        enunciado: "A.2 (1,5 puntos) FUENTE:\n1.\nExplique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo al siguiente\ncuadro. (Puntuación máxima: 0,5 puntos).\n2.\nRelacione los siguientes datos con el problema de Cuba y la guerra entre España y Estados Unidos\n(Puntuación máxima: 1 punto).\nBalance de las tropas españolas en la guerra de Cuba\nAño\nEfectivos a 1\nde enero\nIncorporados\nen el año\nFallecidos en\nla isla\nRepatriados a\nEspaña\n1895\n10.000\n67.354\n2.622\n3.799\n1896\n70.933\n83.727\n11.009\n6.233\n1897\n137.418\n13.634\n12.583\n25.197\n1898\n113.272\n15.797\n5.804\n74.987\n1899\n48.278\n227\n229\n48.276\nTotal\n180.739\n32.247\n158.492\nFuente: Maluquer de Motes, J., De la gran depresión a la modernización económica del siglo XIX, Barcelona,\nPenínsula, 1999, p. 42.",
        puntuacion: 1.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
      },
      {
        id: "h-2023-extra-a-tema",
        tipo: "tema",
        label: "Tema",
        enunciado: "A.3 (4,5 puntos) TEMA: La proclamación de la Segunda República. La Constitución de 1931. El bienio\nreformista (1931-1933).",
        puntuacion: 4.5,
        criterios: "Se valorará la capacidad de síntesis, claridad y organización expositiva, referencias cronológicas y espaciales, y adecuación al tema planteado.",
      }
    ]
  },
  {
    id: 8017,
    año: 2023,
    tipo: "Extraordinaria",
    opcion: "B",
    asignatura: "Historia de España",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2023-extra-b-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "B.1 (4 puntos) CUESTIONES:\n1. El reino visigodo: origen y organización política. Los concilios.\n2. Al Ándalus: reinos de taifas. Reino nazarí.\n3. Organización política de la Corona de Castilla, de la Corona de Aragón y del Reino de Navarra al final de la\nEdad Media.\n4. La Monarquía Hispánica de Felipe II. Gobierno y administración. Los problemas internos. Guerras y\nsublevación en Europa.\n5. Crisis y decadencia de la Monarquía Hispánica: el reinado de Carlos II y el problema sucesorio.\n6. Ideas fundamentales de la Ilustración. El despotismo ilustrado: Carlos III",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
      {
        id: "h-2023-extra-b-fuente",
        tipo: "fuente",
        label: "Fuente",
        imagen_url: "/historia-imgs/extraordinarias/historia-2023-extra-b-fuente.png",
        enunciado: "B.2 (1,5 puntos) FUENTE:\n1.\nExplique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo a la siguiente\nimagen. (Puntuación máxima: 0,5 puntos).\n2.\nRelacione esta imagen con la oposición a la dictadura franquista (Puntuación máxima: 1 punto).\nPolicía frente a estudiantes en la Universidad Complutense de Madrid, 1968",
        puntuacion: 1.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
      },
      {
        id: "h-2023-extra-b-texto",
        tipo: "texto",
        label: "Texto",
        enunciado: "ANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad el contenido del texto.\n2. Señale y explique las ideas fundamentales del texto.\n3. Responda a la cuestión histórica planteada.",
        texto_fuente: "B.3 (4,5 puntos) TEXTO:\n“Manifiesto que al Señor Don Fernando VII hacen en 12 de abril del año de 1814 los que suscriben como\ndiputados en las actuales Cortes ordinarias de su opinión acerca de la soberana autoridad, ilegitimidad con que\nse ha eludido la antigua Constitución Española, mérito de esta, nulidad de la nueva, y de cuantas disposiciones\ndieron las llamadas Cortes generales y extraordinarias de Cádiz […]\nLa monarquía absoluta (voz que por igual causa oye el Pueblo con harta equivocación) es una obra de la\nrazón y de la inteligencia: está subordinada a la ley divina, a la justicia y a las reglas fundamentales del Estado:\nfue establecida por derecho de conquista o por la sumisión voluntaria de los primeros hombres que eligieron sus\nReyes. Así que el Soberano absoluto no tiene facultad de usar sin razón de su autoridad (derecho que no quiso\ntener el mismo Dios): por esto ha sido necesario que el poder Soberano fuese absoluto, para prescribir a los\nsúbditos todo lo que mira al interés común, y obligar a la obediencia a los que se niegan a ella. Pero los que,\ndeclaman contra el Gobierno monárquico, confunden el poder absoluto con el arbitrario […] La única diferencia\nque hay entre el poder de un Rey y el de una República es que aquel puede ser limitado y el de esta no puede\nserlo: llamándose absoluto en razón de la fuerza con que pueda ejecutar la ley que constituye el interés de las\nsociedades civiles […]\nEl Soberano no puede disponer de la vida de sus súbditos, sino conformarse con el orden de justicia\nestablecido en su Estado. Hay entre el Príncipe y el Pueblo ciertas convenciones que se renuevan con juramento\nen la consagración de cada Rey: hay leyes, y cuanto se hace contra sus disposiciones es nulo en derecho.\nPóngase al lado de esta definición la antigua Constitución Española, y medítese la injusticia que se le hace”.\n(Manifiesto que algunos diputados dirigen a Fernando VII a su regreso a España)\nANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad el contenido del texto. (Puntuación máxima: 0,5 puntos).\n2. Señale y explique las ideas fundamentales del texto. (Puntuación máxima: 1 punto).\n3. Responda a la siguiente cuestión: El reinado de Fernando VII: liberalismo frente a absolutismo (Puntuación\nmáxima: 3 puntos).",
        puntuacion: 4.5,
        criterios: "Se valorará la comprensión del texto, el resumen, la explicación de las ideas fundamentales y la contextualización histórica precisa.",
      }
    ]
  },
  {
    id: 8018,
    año: 2023,
    tipo: "Extraordinaria",
    opcion: "A",
    dia: "Coincidencias",
    asignatura: "Historia de España",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2023-extra-coincidencias-a-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "A.1 (4 puntos) CUESTIONES:\n1. Sociedad y economía en el Paleolítico y Neolítico. La pintura rupestre.\n2. Al Ándalus: la conquista musulmana de la Península Ibérica. Emirato y califato de Córdoba.\n3. Organización política de la Corona de Castilla, de la Corona de Aragón y del Reino de Navarra al final de la\nEdad Media.\n4. El Imperio de los Austrias: España bajo Carlos I. Política interior y conflictos europeos.\n5. Principales factores de la crisis demográfica y económica del siglo XVII y sus consecuencias.\n6. La nueva Monarquía Borbónica. Los Decretos de Nueva Planta. Modelo de Estado y alcance de las reformas.",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
      {
        id: "h-2023-extra-coincidencias-a-fuente",
        tipo: "fuente",
        label: "Fuente",
        imagen_url: "/historia-imgs/extraordinarias/historia-2023-extra-coincidencias-a-fuente.png",
        enunciado: "A.2 (1,5 puntos) FUENTE:\n1.\nExplique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo al siguiente\ncuadro. (Puntuación máxima: 0,5 puntos).\n2.\nRelacione los datos con la política económica del franquismo (Puntuación máxima: 1 punto).\nEvolución de la población activa (en porcentaje) por sectores en 1940-1975\nAgricultura\nIndustria\nServicios\n1930\n45,5\n26,1\n28,0\n1940\n50,5\n22,1\n27,4\n1950\n47,6\n26,5\n25,9\n1960\n39,7\n33,0\n27,3\n1970\n29,1\n37,3\n33,6\n1975\n21,7\n38,0\n40,3\nFuente: Anuarios Estadísticos del INE",
        puntuacion: 1.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
      },
      {
        id: "h-2023-extra-coincidencias-a-tema",
        tipo: "tema",
        label: "Tema",
        enunciado: "A.3 (4,5 puntos) TEMA: La revolución industrial en la España del siglo XIX. El sistema de comunicaciones: el\nferrocarril. Proteccionismo y librecambismo. La aparición de la banca moderna.\nB",
        puntuacion: 4.5,
        criterios: "Se valorará la capacidad de síntesis, claridad y organización expositiva, referencias cronológicas y espaciales, y adecuación al tema planteado.",
      }
    ]
  },
  {
    id: 8019,
    año: 2023,
    tipo: "Extraordinaria",
    opcion: "B",
    dia: "Coincidencias",
    asignatura: "Historia de España",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2023-extra-coincidencias-b-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "B.1 (4 puntos) CUESTIONES:\n1. Conquista y romanización de la Península Ibérica. Principales aportaciones romanas en los ámbitos social,\neconómico y cultural.\n2. Al Ándalus: economía, sociedad y cultura.\n3. Los reinos cristianos en la Edad Media: organización política, régimen señorial y sociedad estamental.\n4. El significado de 1492. La guerra de Granada y el descubrimiento de América.\n5. Los Austrias del Siglo XVII: el gobierno de validos. La crisis de 1640.\n6. La España del siglo XVIII. Expansión y transformaciones económicas: agricultura, industria y comercio con\nAmérica. Causas del despegue económico de Cataluña.",
        puntuacion: 4,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
      {
        id: "h-2023-extra-coincidencias-b-fuente",
        tipo: "fuente",
        label: "Fuente",
        imagen_url: "/historia-imgs/extraordinarias/historia-2023-extra-coincidencias-b-fuente.png",
        enunciado: "B.2 (1,5 puntos) FUENTE:\n1.\nExplique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo a la siguiente\nimagen. (Puntuación máxima: 0,5 puntos).\n2.\nExplique el contexto histórico de las Cortes de Cádiz (Puntuación máxima: 1 punto).\nEl juramento de las Cortes de Cádiz en 1810. Cuadro de José Casado del Alisal",
        puntuacion: 1.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
      },
      {
        id: "h-2023-extra-coincidencias-b-texto",
        tipo: "texto",
        label: "Texto",
        enunciado: "ANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad el contenido del texto.\n2. Señale y explique las ideas fundamentales del texto.\n3. Responda a la cuestión histórica planteada.",
        texto_fuente: "B.3 (4,5 puntos) TEXTO:\n“A los obreros y a la opinión pública:\nHa llegado el momento de poner en práctica, sin vacilación alguna, los propósitos anunciados por los\nrepresentantes de la Unión General de Trabajadores y la Confederación General del Trabajo en el manifiesto\nsuscrito por estos organismos en el mes de marzo último.\nDurante el tiempo transcurrido desde esa fecha hasta el momento actual, la afirmación hecha por el\nproletariado al demandar como remedio a los males que padece España un cambio fundamental de régimen\npolítico, ha sido corroborada por la actitud que sucesivamente han ido adoptando importantes organismos\nnacionales, desde la enérgica afirmación de la existencia de las Juntas de defensa del arma de infantería, frente\na los intentos de disolución de esos organismos por los Poderes públicos, hasta la Asamblea de parlamentarios\ncelebrada en Barcelona el día 19 de julio, y la adhesión a las conclusiones de esa Asamblea de numerosos\nAyuntamientos, que dan público testimonio de las ansias de renovación que existen en todo el país […]\nPedimos la constitución de un Gobierno provisional que asuma los Poderes ejecutivo y moderador, y\nprepare, previas las modificaciones imprescindibles en una legislación viciada, la celebración de elecciones\nsinceras de unas Cortes Constituyentes que aborden, en plena libertad, los problemas fundamentales de la\nConstitución política del país. Mientras no se haya conseguido ese objetivo, la organización obrera se halla\nabsolutamente decidida a mantenerse en su actitud de huelga”.\n(Comités nacionales de la UGT y el PSOE, Madrid, 12 de agosto de 1917, publicado en El Socialista,\nmeses después).\nANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad el contenido del texto. (Puntuación máxima: 0,5 puntos).\n2. Señale y explique las ideas fundamentales del texto. (Puntuación máxima: 1 punto).\n3. Responda a la siguiente cuestión: Repercusiones de la Primera Guerra Mundial en España. La crisis de\n1917 y el trienio bolchevique (Puntuación máxima: 3 puntos).",
        puntuacion: 4.5,
        criterios: "Se valorará la comprensión del texto, el resumen, la explicación de las ideas fundamentales y la contextualización histórica precisa.",
      }
    ]
  },
  {
    id: 8020,
    año: 2024,
    tipo: "Extraordinaria",
    opcion: "A",
    asignatura: "Historia de España",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2024-extra-a-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "A.1 (3 puntos) CUESTIONES:\n1. Los pueblos prerromanos y las colonizaciones de los pueblos del Mediterráneo.\n2. Al-Ándalus: economía, sociedad y cultura. El legado judío en la Península ibérica.\n3. Los Reyes Católicos: unión dinástica e instituciones de gobierno. La guerra de Granada.\n4. La Guerra de Sucesión. La Paz de Utrecht. Los pactos de familia.",
        puntuacion: 3,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
      {
        id: "h-2024-extra-a-fuente",
        tipo: "fuente",
        label: "Fuente",
        imagen_url: "/historia-imgs/extraordinarias/historia-2024-extra-a-fuente.png",
        enunciado: "A.2 (2,5 puntos) FUENTE:\n1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo al\nsiguiente documento. (Puntuación máxima: 0,5 puntos).\n2. Relacione esta imagen con la Guerra de la Independencia. (Puntuación máxima: 2 puntos).\nFrancisco de Goya: El 3 de mayo en Madrid o Los fusilamientos (óleo sobre lienzo, Museo del Prado)",
        puntuacion: 2.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
      },
      {
        id: "h-2024-extra-a-tema",
        tipo: "tema",
        label: "Tema",
        enunciado: "A.3 (4,5 puntos) TEMA: La Dictadura de Primo de Rivera y el final del reinado de Alfonso XIII.",
        puntuacion: 4.5,
        criterios: "Se valorará la capacidad de síntesis, claridad y organización expositiva, referencias cronológicas y espaciales, y adecuación al tema planteado.",
      }
    ]
  },
  {
    id: 8021,
    año: 2024,
    tipo: "Extraordinaria",
    opcion: "B",
    asignatura: "Historia de España",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2024-extra-b-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "B.1 (3 puntos) CUESTIONES:\n1. La monarquía visigoda.\n2. Modelos de repoblación. Organización estamental en los reinos cristianos medievales.\n3. Sociedad, economía y cultura de los siglos XVI y XVII.\n4. Las reformas borbónicas en los virreinatos americanos.",
        puntuacion: 3,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
      {
        id: "h-2024-extra-b-fuente",
        tipo: "fuente",
        label: "Fuente",
        imagen_url: "/historia-imgs/extraordinarias/historia-2024-extra-b-fuente.png",
        enunciado: "B.2 (2,5 puntos) FUENTE:\n1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo a la\nsiguiente tabla. (Puntuación máxima: 0,5 puntos).\n2. Relacione los datos con La democracia (1982-2018): la normalización democrática. (Puntuación\nmáxima: 2 puntos).\nResultados de la votación para el Congreso de los Diputados en las elecciones legislativas celebradas\nen octubre de 1982.",
        puntuacion: 2.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
      },
      {
        id: "h-2024-extra-b-texto",
        tipo: "texto",
        label: "Texto",
        enunciado: "ANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad el contenido del texto.\n2. Señale y explique las ideas fundamentales del texto.\n3. Responda a la cuestión histórica planteada.",
        texto_fuente: "B.3 (4,5 puntos) TEXTO:\n\n“Título II-De las Cortes\n\nArt. 18. La potestad de hacer las leyes reside en las Cortes con el Rey.\n\nArt. 19. Las Cortes se componen de dos Cuerpos Colegisladores, iguales en facultades: el Senado\ny el Congreso de los Diputados.\n\nTítulo III-Del Senado\nArt. 20. El Senado se compone:\nPrimero. De Senadores por derecho propio.\nSegundo. De Senadores vitalicios nombrados por la Corona.\nTercero. De Senadores elegidos por las Corporaciones del Estado y mayores contribuyentes en\nla forma que determine la ley. El número de los Senadores por derecho propio y vitalicios no podrá exceder\nde 180. Este número será el de los Senadores electivos.\nArt. 21. Son Senadores por derecho propio:\n-Los hijos del Rey y del sucesor inmediato de la Corona, que hayan llegado a la mayoría de edad.\nLos grandes de España que lo fueren por sí (…). Los Capitanes generales del Ejército y el Almirante de\nla Armada. El Patriarca de las Indias y los Arzobispos. El Presidente del Consejo de Estado, el del Tribunal\nSupremo (…)\nTítulo IV – Del Congreso de los Diputados\nArt. 27. El Congreso de los Diputados se compondrá de los que nombren las Juntas electorales,\nen la forma que determine la ley. Se nombrará un Diputado a lo menos por cada 50.000 almas de\npoblación.\nArt. 29. Para ser elegido Diputado se requiere ser español, de estado seglar, mayor de edad, y\ngozar de todos los derechos civiles. La ley determinará con qué clase de funciones es incompatible el\ncargo de Diputado, y los casos de reelección”.\n(Constitución de 1876)\n\nANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad el contenido del texto. (Puntuación máxima: 0,5 puntos).\n2. Señale y explique las ideas fundamentales del texto. (Puntuación máxima: 1 punto).\n3. Responda a la siguiente cuestión: El sistema canovista: la Constitución de 1876 y el turno de partidos.\n(Puntuación máxima: 3 puntos).\n\nPartido\nPartido\nSocialista\nObrero\nEspañol\nAlianza\nPopular-\nPDP\nUnión de\nCentro\nDemocrático\nPartido\nComunista\nde\nEspaña\nConvergència\ni Unió\nCentro\nDemocrático\ny Social\nPartido\nNacionalista\nVasco-EAJ\nOtros\n\nEscaños\n202\n107\n11\n4\n12\n2\n8\n4\n% votos\n48,1\n26,3\n6,7\n4\n3,6\n2,8\n1,8\n\nVotos\n10.127.392\n5.548.107\n1.425.093\n846.515\n772.726\n604.309\n395.656",
        puntuacion: 4.5,
        criterios: "Se valorará la comprensión del texto, el resumen, la explicación de las ideas fundamentales y la contextualización histórica precisa.",
      }
    ]
  },
  {
    id: 8022,
    año: 2024,
    tipo: "Extraordinaria",
    opcion: "A",
    dia: "Coincidencias",
    asignatura: "Historia de España",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2024-extra-coincidencias-a-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "A.1 (3 puntos) CUESTIONES:\n1. La monarquía visigoda.\n2. La Baja Edad Media en las Coronas de Castilla y de Aragón y en el Reino de Navarra.\n3. Los Austrias del siglo XVII. Política interior y exterior.\n4. Sociedad, economía y cultura del siglo XVIII.",
        puntuacion: 3,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
      {
        id: "h-2024-extra-coincidencias-a-fuente",
        tipo: "fuente",
        label: "Fuente",
        imagen_url: "/historia-imgs/extraordinarias/historia-2024-extra-coincidencias-a-fuente.png",
        enunciado: "A.2 (2,5 puntos) FUENTE:\n1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo al\nsiguiente documento. (Puntuación máxima: 0,5 puntos).\n2. Relacione esta imagen con las transformaciones económicas durante la dictadura franquista (1939-\n1975). (Puntuación máxima: 2 puntos).\nSEAT alcanza la cifra de un millón de coches fabricados, 1969",
        puntuacion: 2.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
      },
      {
        id: "h-2024-extra-coincidencias-a-tema",
        tipo: "tema",
        label: "Tema",
        enunciado: "A.3 (4,5 puntos) TEMA: El reinado de Carlos IV. La Guerra de la Independencia.",
        puntuacion: 4.5,
        criterios: "Se valorará la capacidad de síntesis, claridad y organización expositiva, referencias cronológicas y espaciales, y adecuación al tema planteado.",
      }
    ]
  },
  {
    id: 8023,
    año: 2024,
    tipo: "Extraordinaria",
    opcion: "B",
    dia: "Coincidencias",
    asignatura: "Historia de España",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2024-extra-coincidencias-b-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "B.1 (3 puntos) CUESTIONES:\n1. El Paleolítico y el Neolítico.\n2. Al-Ándalus: economía, sociedad y cultura. El legado judío en la Península ibérica.\n3. Exploración, conquista y colonización de América (desde 1492 y durante el siglo XVI).\n4. La Guerra de Sucesión. La Paz de Utrecht. Los pactos de familia.",
        puntuacion: 3,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
      {
        id: "h-2024-extra-coincidencias-b-fuente",
        tipo: "fuente",
        label: "Fuente",
        imagen_url: "/historia-imgs/extraordinarias/historia-2024-extra-coincidencias-b-fuente.png",
        enunciado: "B.2 (2,5 puntos) FUENTE:\n1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo a la\nsiguiente imagen. (Puntuación máxima: 0,5 puntos).\n2. Relacione la imagen con el régimen de la Restauración (1874-1902): la oposición al sistema.\n(Puntuación máxima: 2 puntos).\nAsesinato de Cánovas por un anarquista en 1897. Ilustración de época",
        puntuacion: 2.5,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
      },
      {
        id: "h-2024-extra-coincidencias-b-texto",
        tipo: "texto",
        label: "Texto",
        enunciado: "ANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad el contenido del texto.\n2. Señale y explique las ideas fundamentales del texto.\n3. Responda a la cuestión histórica planteada.",
        texto_fuente: "B.3 (4,5 puntos) TEXTO:\n“Al dirigirme a todos los españoles con brevedad y concisión, en las circunstancias\nextraordinarias que en estos momentos estamos viviendo, pido a todos la mayor serenidad y confianza,\ny les hago saber que he cursado a los Capitanes Generales de las regiones militares, zonas marítimas y\nregiones aéreas la orden siguiente:\nAnte la situación creada por los sucesos desarrollados en el palacio del Congreso, y para evitar\ncualquier posible confusión, confirmo que he ordenado a las autoridades civiles y a la Junta de Jefes de\nEstado Mayor que tomen todas las medidas necesarias para mantener el orden constitucional dentro de\nla legalidad vigente.\nCualquier medida de carácter militar que, en su caso, hubiera de tomarse deberá contar con la\naprobación de la Junta de Jefes de Estado Mayor.\nLa Corona, símbolo de la permanencia y unidad de la Patria, no puede tolerar en forma alguna\nacciones o actitudes de personas que pretendan interrumpir por la fuerza el proceso democrático que la\nConstitución votada por el pueblo español determinó en su día a través de referéndum”.\n(Mensaje televisado a los españoles del rey Juan Carlos I en la noche del 23-24 de febrero de\n1981)\nANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad el contenido del texto. (Puntuación máxima: 0,5 puntos).\n2. Señale y explique las ideas fundamentales del texto. (Puntuación máxima: 1 punto).\n3. Responda a la siguiente cuestión: La Transición (1975-1982): retos, logros, dificultades y resistencias\nal establecimiento de la democracia. (Puntuación máxima: 3 puntos).",
        puntuacion: 4.5,
        criterios: "Se valorará la comprensión del texto, el resumen, la explicación de las ideas fundamentales y la contextualización histórica precisa.",
      }
    ]
  },
  {
    id: 8024,
    año: 2025,
    tipo: "Extraordinaria",
    opcion: "A",
    asignatura: "Historia de España",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2025-extra-a-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "A. (3 puntos) CUESTIONES:\nResponda a tres cuestiones, una por cada bloque de preguntas.\n1.-Responda a una de estas dos preguntas:\n-El Paleolítico y el Neolítico.\n-La monarquía visigoda.\n2.-Responda a una de estas dos preguntas:\n-Al-Ándalus: economía, sociedad y cultura. El legado judío en la Península ibérica.\n-Los reinos cristianos: evolución de la Reconquista y organización política.\n3.-Responda a una de estas dos preguntas:\n-Los Austrias del siglo XVI. Política interior y exterior.\n-La nueva Monarquía borbónica. Los decretos de Nueva Planta. Modelo de Estado y alcance de las\nreformas.",
        puntuacion: 3,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
      {
        id: "h-2025-extra-a-fuente",
        tipo: "fuente",
        label: "Fuente",
        imagen_url: "/historia-imgs/extraordinarias/historia-2025-extra-fuente-1.png",
        enunciado: "Fuente 1:\n1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo al\nsiguiente documento. (Puntuación máxima: 0,5 puntos).\n2. Relacione esta imagen con la Guerra de la Independencia. (Puntuación máxima: 2,5 puntos).\nDos de mayo, Joaquín Sorolla, óleo sobre lienzo (Museo Nacional del Prado)",
        puntuacion: 3,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
      },
      {
        id: "h-2025-extra-a-texto",
        tipo: "texto",
        label: "Texto",
        enunciado: "ANÁLISIS DE TEXTO O TEMA:\nElija entre el análisis de texto o el tema, y responda a las preguntas planteadas.",
        texto_fuente: "C. (4 puntos) ANÁLISIS DE TEXTO O TEMA:\nElija entre el análisis de texto o el tema, y responda a las preguntas.\n1.Análisis de texto:\n“Las elecciones celebradas el domingo me revelan claramente que no tengo hoy el amor de mi\npueblo. Mi conciencia dice que ese desvío no será definitivo, porque procuré siempre servir a España,\npuesto el único afán en el interés público hasta en las más críticas coyunturas.\nUn rey puede equivocarse, y, sin duda, erré yo alguna vez; pero sé bien que nuestra patria se\nmostró en todo momento generosa ante las culpas sin malicia.\nSoy el rey de todos los españoles, y también un español. Hallaría medios sobrados para mantener\nmi regia prerrogativa, en eficaz forcejeo con quienes la combaten. Pero, resueltamente, quiero apartarme\nde cuanto sea lanzar a un compatriota contra otro en fratricida guerra civil. No renuncio a ninguno de mis\nderechos, porque más que míos son depósito acumulado por la Historia, de cuya custodia ha de pedirme\nun día cuenta rigurosa.\nEspero a conocer la auténtica y adecuada expresión de la conciencia colectiva, y mientras habla\nla nación, suspendo deliberadamente el ejercicio del poder real y me aparto de España, reconociéndola\nasí como única señora de sus destinos. También ahora creo cumplir el deber que me dicta mi amor a la\nPatria. Pido a Dios que tan hondo como yo lo sientan y lo cumplan los demás españoles”.\nRenuncia del rey el 14 de abril de 1931 (La Voz, 16 de abril de 1931, p. 8).\nANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad el contenido del texto. (Puntuación máxima: 0,5 puntos).\n2. Señale y explique las ideas fundamentales del texto. (Puntuación máxima: 1 punto).\n3. Responda a la siguiente cuestión: El final del reinado de Alfonso XIII. (Puntuación máxima: 2,5 puntos).\n2.Tema: La dictadura franquista (1939-1975): Institucionalización del régimen. Relaciones internacionales\ny etapas políticas.",
        puntuacion: 4,
        criterios: "Se valorará la comprensión del texto, el resumen, la explicación de las ideas fundamentales y la contextualización histórica precisa.",
      }
    ]
  },
  {
    id: 8025,
    año: 2025,
    tipo: "Extraordinaria",
    opcion: "B",
    asignatura: "Historia de España",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2025-extra-b-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "A. (3 puntos) CUESTIONES:\nResponda a tres cuestiones, una por cada bloque de preguntas.\n1.-Responda a una de estas dos preguntas:\n-El Paleolítico y el Neolítico.\n-La monarquía visigoda.\n2.-Responda a una de estas dos preguntas:\n-Al-Ándalus: economía, sociedad y cultura. El legado judío en la Península ibérica.\n-Los reinos cristianos: evolución de la Reconquista y organización política.\n3.-Responda a una de estas dos preguntas:\n-Los Austrias del siglo XVI. Política interior y exterior.\n-La nueva Monarquía borbónica. Los decretos de Nueva Planta. Modelo de Estado y alcance de las\nreformas.",
        puntuacion: 3,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
      {
        id: "h-2025-extra-b-fuente",
        tipo: "fuente",
        label: "Fuente",
        imagen_url: "/historia-imgs/extraordinarias/historia-2025-extra-fuente-2.png",
        enunciado: "Fuente 2:\n1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo al siguiente\ndocumento. (Puntuación máxima: 0,5 puntos).\n2. Relacione esta imagen con la evolución de la población y de las ciudades en el siglo XIX. (Puntuación\nmáxima: 2,5 puntos).\nLa madrileña calle de Alcalá, finales del siglo XIX, fotografía de Mariano Moreno (Instituto de Patrimonio\nCultural de España)",
        puntuacion: 3,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
      },
      {
        id: "h-2025-extra-b-texto",
        tipo: "texto",
        label: "Texto",
        enunciado: "ANÁLISIS DE TEXTO O TEMA:\nElija entre el análisis de texto o el tema, y responda a las preguntas planteadas.",
        texto_fuente: "C. (4 puntos) ANÁLISIS DE TEXTO O TEMA:\nElija entre el análisis de texto o el tema, y responda a las preguntas.\n1.Análisis de texto:\n“Las elecciones celebradas el domingo me revelan claramente que no tengo hoy el amor de mi\npueblo. Mi conciencia dice que ese desvío no será definitivo, porque procuré siempre servir a España,\npuesto el único afán en el interés público hasta en las más críticas coyunturas.\nUn rey puede equivocarse, y, sin duda, erré yo alguna vez; pero sé bien que nuestra patria se\nmostró en todo momento generosa ante las culpas sin malicia.\nSoy el rey de todos los españoles, y también un español. Hallaría medios sobrados para mantener\nmi regia prerrogativa, en eficaz forcejeo con quienes la combaten. Pero, resueltamente, quiero apartarme\nde cuanto sea lanzar a un compatriota contra otro en fratricida guerra civil. No renuncio a ninguno de mis\nderechos, porque más que míos son depósito acumulado por la Historia, de cuya custodia ha de pedirme\nun día cuenta rigurosa.\nEspero a conocer la auténtica y adecuada expresión de la conciencia colectiva, y mientras habla\nla nación, suspendo deliberadamente el ejercicio del poder real y me aparto de España, reconociéndola\nasí como única señora de sus destinos. También ahora creo cumplir el deber que me dicta mi amor a la\nPatria. Pido a Dios que tan hondo como yo lo sientan y lo cumplan los demás españoles”.\nRenuncia del rey el 14 de abril de 1931 (La Voz, 16 de abril de 1931, p. 8).\nANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad el contenido del texto. (Puntuación máxima: 0,5 puntos).\n2. Señale y explique las ideas fundamentales del texto. (Puntuación máxima: 1 punto).\n3. Responda a la siguiente cuestión: El final del reinado de Alfonso XIII. (Puntuación máxima: 2,5 puntos).\n2.Tema: La dictadura franquista (1939-1975): Institucionalización del régimen. Relaciones internacionales\ny etapas políticas.",
        puntuacion: 4,
        criterios: "Se valorará la comprensión del texto, el resumen, la explicación de las ideas fundamentales y la contextualización histórica precisa.",
      }
    ]
  },
  {
    id: 8026,
    año: 2025,
    tipo: "Extraordinaria",
    opcion: "A",
    dia: "Coincidencias",
    asignatura: "Historia de España",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2025-extra-coincidencias-a-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "A. (3 puntos) CUESTIONES:\nResponda a tres cuestiones, una por cada bloque de preguntas.\n1.-Responda a una de estas dos preguntas:\n-El Paleolítico y el Neolítico.\n-Los pueblos prerromanos y las colonizaciones de los pueblos del Mediterráneo.\n2.-Responda a una de estas dos preguntas:\n-Al-Ándalus: evolución política.\n-Los reinos cristianos: evolución de la Reconquista y organización política.\n3.-Responda a una de estas dos preguntas:\n-Exploración y conquista de América. Incorporación del Nuevo Mundo a la Monarquía hispánica (desde\n1492 y durante el siglo XVI).\n-La nueva Monarquía borbónica. Los decretos de Nueva Planta. Modelo de Estado y alcance de las\nreformas.",
        puntuacion: 3,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
      {
        id: "h-2025-extra-coincidencias-a-fuente",
        tipo: "fuente",
        label: "Fuente",
        imagen_url: "/historia-imgs/extraordinarias/historia-2025-extra-coincidencias-fuente-1.png",
        enunciado: "Fuente 1:\n1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo al\nsiguiente documento. (Puntuación máxima: 0,5 puntos).\n2. Relacione esta imagen con las transformaciones económicas y sociales del siglo XIX: las\ndesamortizaciones. (Puntuación máxima: 2,5 puntos).\nEtapas\nFincas del clero\nFincas de propios\nOtras fincas\n1798-1808\n1.392.777\n0\n83.902\n1820-1823\n99.900\n0\n0\n1836-1849\n3.820.100\n0\n0\n1855-1856\n323.819\n159.773\n283.130\n1859-1867\n1.272.671\n2.028.673\n911.505\nDesamortización de bienes raíces, volumen de las ventas, en miles de reales de vellón. Fuente: Jordi\nNadal, El fracaso de la revolución industrial en España, 1814-1913 (1984)",
        puntuacion: 3,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
      },
      {
        id: "h-2025-extra-coincidencias-a-texto",
        tipo: "texto",
        label: "Texto",
        enunciado: "ANÁLISIS DE TEXTO O TEMA:\nElija entre el análisis de texto o el tema, y responda a las preguntas planteadas.",
        texto_fuente: "C. (4 puntos) ANÁLISIS DE TEXTO O TEMA:\nElija entre el análisis de texto o el tema, y responda a las preguntas.\n1.Análisis de texto:\n“Españoles: Al llegar para mí la hora de rendir la vida ante el Altísimo y comparecer ante su\ninapelable juicio, pido a Dios que me acoja benigno a su presencia, pues quise vivir y morir como católico.\n[…] Por el amor que siento por nuestra patria, os pido que perseveréis en la unidad y en la paz, y que\nrodeéis al futuro rey de España, don Juan Carlos de Borbón, del mismo afecto y lealtad que a mí me\nhabéis brindado […] No olvidéis que los enemigos de España y de la civilización cristiana están alerta.\nVelad también vosotros, y para ello deponed, frente a los supremos intereses de la patria y del pueblo\nespañol, toda mira personal. No cejéis en alcanzar la justicia social y la cultura para todos los hombres\nde España, y haced de ello vuestro primordial objetivo.\nMantened la unidad de las tierras de España, exaltando la rica multiplicidad de sus regiones como\nfuente de la fortaleza de la unidad de la Patria. Quisiera en mi último momento unir los nombres de Dios\ny España, y abrazaros a todos para gritar juntos por última vez, en los umbrales de mi muerte: ¡Arriba\nEspaña! ¡Viva España!”\n(Mensaje póstumo de Franco, 1975, en diario Informaciones, 20 de noviembre de 1975).\nANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad el contenido del texto. (Puntuación máxima: 0,5 puntos).\n2. Señale y explique las ideas fundamentales del texto. (Puntuación máxima: 1 punto).\n3. Responda a la siguiente cuestión: La evolución política tras la muerte de Franco. (Puntuación máxima:\n2,5 puntos).\n2.Tema: La proclamación de la Segunda República, el Gobierno provisional y la Constitución de 1931. El\nsufragio femenino.",
        puntuacion: 4,
        criterios: "Se valorará la comprensión del texto, el resumen, la explicación de las ideas fundamentales y la contextualización histórica precisa.",
      }
    ]
  },
  {
    id: 8027,
    año: 2025,
    tipo: "Extraordinaria",
    opcion: "B",
    dia: "Coincidencias",
    asignatura: "Historia de España",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2025-extra-coincidencias-b-cuestiones",
        tipo: "cuestiones",
        label: "Cuestiones",
        enunciado: "A. (3 puntos) CUESTIONES:\nResponda a tres cuestiones, una por cada bloque de preguntas.\n1.-Responda a una de estas dos preguntas:\n-El Paleolítico y el Neolítico.\n-Los pueblos prerromanos y las colonizaciones de los pueblos del Mediterráneo.\n2.-Responda a una de estas dos preguntas:\n-Al-Ándalus: evolución política.\n-Los reinos cristianos: evolución de la Reconquista y organización política.\n3.-Responda a una de estas dos preguntas:\n-Exploración y conquista de América. Incorporación del Nuevo Mundo a la Monarquía hispánica (desde\n1492 y durante el siglo XVI).\n-La nueva Monarquía borbónica. Los decretos de Nueva Planta. Modelo de Estado y alcance de las\nreformas.",
        puntuacion: 3,
        criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
      },
      {
        id: "h-2025-extra-coincidencias-b-fuente",
        tipo: "fuente",
        label: "Fuente",
        imagen_url: "/historia-imgs/extraordinarias/historia-2025-extra-coincidencias-fuente-2.png",
        enunciado: "Fuente 2:\n1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo al siguiente\ndocumento. (Puntuación máxima: 0,5 puntos).\n2. Relacione esta imagen con Isabel II: las Regencias. Los grupos políticos, el Estatuto Real de 1834 y la\nConstitución de 1837. (Puntuación máxima: 2,5 puntos).\nIsabel II, niña, hacia 1835, óleo sobre lienzo, colección Museo Nacional del Prado",
        puntuacion: 3,
        criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
      },
      {
        id: "h-2025-extra-coincidencias-b-texto",
        tipo: "texto",
        label: "Texto",
        enunciado: "ANÁLISIS DE TEXTO O TEMA:\nElija entre el análisis de texto o el tema, y responda a las preguntas planteadas.",
        texto_fuente: "C. (4 puntos) ANÁLISIS DE TEXTO O TEMA:\nElija entre el análisis de texto o el tema, y responda a las preguntas.\n1.Análisis de texto:\n“Españoles: Al llegar para mí la hora de rendir la vida ante el Altísimo y comparecer ante su\ninapelable juicio, pido a Dios que me acoja benigno a su presencia, pues quise vivir y morir como católico.\n[…] Por el amor que siento por nuestra patria, os pido que perseveréis en la unidad y en la paz, y que\nrodeéis al futuro rey de España, don Juan Carlos de Borbón, del mismo afecto y lealtad que a mí me\nhabéis brindado […] No olvidéis que los enemigos de España y de la civilización cristiana están alerta.\nVelad también vosotros, y para ello deponed, frente a los supremos intereses de la patria y del pueblo\nespañol, toda mira personal. No cejéis en alcanzar la justicia social y la cultura para todos los hombres\nde España, y haced de ello vuestro primordial objetivo.\nMantened la unidad de las tierras de España, exaltando la rica multiplicidad de sus regiones como\nfuente de la fortaleza de la unidad de la Patria. Quisiera en mi último momento unir los nombres de Dios\ny España, y abrazaros a todos para gritar juntos por última vez, en los umbrales de mi muerte: ¡Arriba\nEspaña! ¡Viva España!”\n(Mensaje póstumo de Franco, 1975, en diario Informaciones, 20 de noviembre de 1975).\nANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad el contenido del texto. (Puntuación máxima: 0,5 puntos).\n2. Señale y explique las ideas fundamentales del texto. (Puntuación máxima: 1 punto).\n3. Responda a la siguiente cuestión: La evolución política tras la muerte de Franco. (Puntuación máxima:\n2,5 puntos).\n2.Tema: La proclamación de la Segunda República, el Gobierno provisional y la Constitución de 1931. El\nsufragio femenino.",
        puntuacion: 4,
        criterios: "Se valorará la comprensión del texto, el resumen, la explicación de las ideas fundamentales y la contextualización histórica precisa.",
      }
    ]
  },
  {
    id: 1000, año: 2018, tipo: "Modelo", opcion: "A",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
        {
          id: "h-2018-modelo-A-cuestiones",
          tipo: "cuestiones",
          label: "Cuestiones",
          enunciado: "1) Conquista y romanización de la Península Ibérica. Principales aportaciones romanas en los ámbitos social,\neconómico y cultural.\n2) Al Ándalus: la conquista musulmana de la Península Ibérica. Emirato y califato de Córdoba.\n3) Los primeros núcleos de resistencia cristiana. Principales etapas de la Reconquista. Modelos de\nrepoblación.\n4) La Monarquía Hispánica de Felipe II. Gobierno y administración.  Los problemas internos. Guerras y\nsublevación en Europa.\n5) La Guerra de Sucesión Española y el sistema de Utrecht. Los Pactos de Familia.\n6) Ideas fundamentales de la Ilustración. El despotismo ilustrado: Carlos III.",
          puntuacion: 4,
          criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
        },
        {
          id: "h-2018-modelo-A-fuente",
          tipo: "fuente",
          label: "Fuente",
          imagen_url: "/historia-imgs/modelos/historia-2018-modelo-a-fuente.png",
          enunciado: "FUENTE HISTÓRICA: relacione esta imagen con las Cortes de Cádiz\n\"El Juramento de las Cortes de Cádiz en 1810\"pintado por José María Casado del Alisal (1862). Congreso de los Diputados",
          puntuacion: 1.5,
          criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        },
        {
          id: "h-2018-modelo-A-tema",
          tipo: "tema",
          label: "Tema",
          enunciado: "TEMA: La Transición: alternativas políticas tras la muerte de Franco. El papel del Rey y el gobierno de\nAdolfo Suárez. El restablecimiento de la democracia: las elecciones de junio de 1977. La Constitución\nde 1978. El estado de las autonomías. El terrorismo durante la transición.",
          puntuacion: 4.5,
          criterios: "Se valorará la capacidad de síntesis, claridad y organización expositiva, referencias cronológicas y espaciales, y adecuación al tema planteado.",
        }
    ]
  },
  {
    id: 1001, año: 2018, tipo: "Modelo", opcion: "B",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
        {
          id: "h-2018-modelo-B-cuestiones",
          tipo: "cuestiones",
          label: "Cuestiones",
          enunciado: "1) Los pueblos prerromanos. Las colonizaciones históricas: fenicios y griegos. Tartessos.\n2) Organización política de la Corona de Castilla, de la Corona de Aragón y del Reino de Navarra al final de la\nEdad Media.\n3) Los Reyes Católicos: unión dinástica e instituciones de gobierno.\n4) El Imperio de los Austrias: España bajo Carlos I.  Política interior y conflictos europeos.\n5) Exploración   y   colonización   de   América.   Consecuencias   de   los descubrimientos en España,\nEuropa y América.\n6) La nueva Monarquía Borbónica. Los Decretos de Nueva Planta. Modelo de Estado y alcance de las\nreformas.",
          puntuacion: 4,
          criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
        },
        {
          id: "h-2018-modelo-B-fuente",
          tipo: "fuente",
          label: "Fuente",
          imagen_url: "/historia-imgs/modelos/historia-2018-modelo-b-fuente.png",
          enunciado: "FUENTE HISTÓRICA: relacione la siguiente gráfica con la oposición a la dictadura franquista: principales grupos y\nevolución en el tiempo.\nCuantificación de huelgas, 1963-1972\nHuelgas\nNúmero de\nhuelguistas\nJornadas de trabajo\nperdidas\n1963\n241\n38.572\n124.598\n1964\n126\n119.290\n141.153\n1965\n150\n58.591\n189.548\n1966\n147\n36.977\n184.760\n1967\n513\n198.740\n235.962\n1968\n309\n130.742\n240.659\n1969\n439\n205.325\n559.551\n1970\n1.542\n440.114\n1.092.364\n1971\n549\n196.665\n859.693\n1972\n713\n277.806\n586.616\nFuente: M.Tuñón de Lara, España bajo la dictadura franquista",
          puntuacion: 1.5,
          criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        },
        {
          id: "h-2018-modelo-B-texto",
          tipo: "texto",
          label: "Texto",
          enunciado: "TEXTO:   Real Decreto declarando la Venta de bienes del Clero\nAtendiendo a la necesidad y conveniencia de disminuir la deuda pública consolidada, y de entregar al interés\nindividual la masa de bienes raíces, que han venido a ser propiedad de la Nación, a fin de que la agricultura y el\ncomercio saquen de ellos las ventajas que no podrían conseguirse por entero en su actual estado (...)\nconformándome con lo propuesto por el Consejo de Ministros, en nombre de mi excelsa hija la reina doña Isabel II,\nhe venido en decretar lo siguiente:\nArtículo 1º. Quedan declarados en venta desde ahora todos los bienes raíces de cualquier clase que hubiesen\npertenecido a las comunidades y corporaciones religiosas extinguidas y los demás que hayan sido adjudicados a la\nNación por cualquier título o motivo...\nArtículo 2º. Se exceptúan de esta medida general los edificios que el gobierno destine para el servicio público o para\nconservar monumentos de las artes, o para honrar la memoria de hazañas nacionales. El mismo gobierno publicará\nla lista de los edificios que con este objeto deben quedar excluidos de la venta pública.\nArtículo 4º. Que todos los medios rústicos susceptibles de división, sin menoscabo de su valor, o sin graves\ndificultades para su propia venta, se distribuyan en el mayor número de partes o suertes que se pudiere.\nArtículo 5º. Que estas suertes se pongan en venta con total separación, como si cada una hubiese compuesto una\npropiedad aislada.\nEn el Pardo a 19 de febrero de 1836. D. Juan Álvarez Mendizábal Gaceta de Madrid, 21 de febrero de 1836.\nANÁLISIS DEL TEXTO Y CUESTIÓN:\n1.\nExplique razonadamente el tipo de texto y resuma las ideas fundamentales del mismo (puntuación máxima:\n1,5 puntos).\n2.\nResponda a la siguiente cuestión (puntuación máxima: 3 puntos): El reinado de Isabel II (1833-1868): las\ndesamortizaciones de Mendizábal y Madoz.",
          puntuacion: 4.5,
          criterios: "Se valorará la comprensión del texto, el resumen, la explicación de las ideas fundamentales y la contextualización histórica precisa.",
        }
    ]
  },
  {
    id: 1002, año: 2019, tipo: "Modelo", opcion: "A",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
        {
          id: "h-2019-modelo-A-cuestiones",
          tipo: "cuestiones",
          label: "Cuestiones",
          enunciado: "1. El reino visigodo: origen y organización política. Los concilios.\n2. Al Ándalus: la conquista musulmana de la Península Ibérica. Emirato y califato de Córdoba.\n3. Los reinos cristianos en la Edad Media: organización política, régimen señorial y sociedad\nestamental.\n4. El significado de 1492. La guerra de Granada y el descubrimiento de América.\n5. La guerra de los Treinta Años y la pérdida de la hegemonía española en Europa.\n6. La España del siglo XVIII. Expansión y transformaciones económicas: agricultura, industria y\ncomercio con América. Causas del despegue económico de Cataluña.",
          puntuacion: 4,
          criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
        },
        {
          id: "h-2019-modelo-A-fuente",
          tipo: "fuente",
          label: "Fuente",
          imagen_url: "/historia-imgs/modelos/historia-2019-modelo-a-fuente.png",
          enunciado: "FUENTE HISTÓRICA:\n\nRelacione este mapa con la Guerra de la Independencia: bandos en conflicto y fases de la\nguerra.\n\nGuerra de la Independencia. Despliegue francés 1808-1809.",
          puntuacion: 1.5,
          criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        },
        {
          id: "h-2019-modelo-A-tema",
          tipo: "tema",
          label: "Tema",
          enunciado: "TEMA: Política económica del franquismo: de la autarquía al desarrollismo. Transformaciones\nsociales: causas y evolución.",
          puntuacion: 4.5,
          criterios: "Se valorará la capacidad de síntesis, claridad y organización expositiva, referencias cronológicas y espaciales, y adecuación al tema planteado.",
        }
    ]
  },
  {
    id: 1003, año: 2019, tipo: "Modelo", opcion: "B",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
        {
          id: "h-2019-modelo-B-cuestiones",
          tipo: "cuestiones",
          label: "Cuestiones",
          enunciado: "1. Conquista y romanización de la Península Ibérica. Principales aportaciones romanas en los\námbitos social, económico y cultural.\n2. Al Ándalus: reinos de taifas. Reino nazarí.\n3. Organización política de la Corona de Castilla, de la Corona de Aragón y del Reino de\nNavarra al final de la Edad Media.\n4. Principales factores de la crisis demográfica y económica del siglo XVII y sus\nconsecuencias.\n5. Crisis y decadencia de la Monarquía Hispánica: el reinado de Carlos II y el problema\nsucesorio.\n6. La nueva Monarquía Borbónica. Los Decretos de Nueva Planta. Modelo de Estado y\nalcance de las reformas.",
          puntuacion: 4,
          criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
        },
        {
          id: "h-2019-modelo-B-fuente",
          tipo: "fuente",
          label: "Fuente",
          imagen_url: "/historia-imgs/modelos/historia-2019-modelo-b-fuente.png",
          enunciado: "FUENTE HISTÓRICA:\nComente la imagen y su relación con la proclamación de la Segunda República.\n\nPeriódico “Heraldo de Madrid” de abril de 1931.",
          puntuacion: 1.5,
          criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        },
        {
          id: "h-2019-modelo-B-texto",
          tipo: "texto",
          label: "Texto",
          enunciado: "ANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad y concisión el contenido del texto. (Puntuación máxima: 0’5 puntos).\n2. Señale y explique las ideas fundamentales del texto. (Puntuación máxima: 1 punto).\n3. Responda a la siguiente cuestión. (Puntuación máxima: 3 puntos): El reinado de Amadeo\nde Saboya.",
          puntuacion: 4.5,
          criterios: "Se valorará la comprensión del texto, el resumen, la explicación de las ideas fundamentales y la contextualización histórica precisa.",
          texto_fuente: "TEXTO:\nAbdicación de Amadeo I\n«Al Congreso: Grande fue la honra que merecía la Nación española eligiéndome para\nocupar su trono, honra tanto más por mí apreciada cuanto se me ofrecía rodeada de las\ndificultades y peligros que lleva consigo la empresa de gobernar un país tan hondamente\nperturbado (…).\nConozco que me engañó mi buen deseo. Dos años ha que ciño la corona de España, y\nla España vive en constante lucha, viendo cada día más lejana la era de paz y ventura que\ntan ardientemente anhelo. Si fuesen extranjeros los enemigos de su dicha, entonces, al frente\nde estos soldados, tan valientes como sufridos, sería el primero en combatirlos, pero todos los\nque con la espada, con la pluma, con la palabra, agravan y perpetúan los males de la Nación\nson españoles; todos invocan el dulce nombre de la patria, todos pelean y se agitan por su\nbien, y entre el fragor del combate, entre el confuso, atronador y contradictorio clamor de los\npartidos, entre tantas y tan opuestas manifestaciones de la opinión pública, es imposible\natinar sobre cuál es la verdadera, y más importante aún, hallar el remedio para tamaños\nmales. Lo he buscado ávidamente dentro de la ley y no lo he hallado. Fuera de la ley no ha de\nbuscarlo quien ha prometido observarla. Nadie achacará a flaqueza de ánimo mi resolución\n(…)\nEstas son, señores diputados, las razones que me mueven a devolver a la Nación y en\nsu nombre a vosotros la Corona que me ofreció el voto nacional, haciendo de ella renuncia\npor mí, por mis hijos y sucesores»\nAmadeo, Palacio de Madrid, 11 de febrero de 1873.",
        }
    ]
  },
  {
    id: 1004, año: 2020, tipo: "Modelo", opcion: "A",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
        {
          id: "h-2020-modelo-A-cuestiones",
          tipo: "cuestiones",
          label: "Cuestiones",
          enunciado: "A.1 (4 puntos) CUESTIONES:\n1. El reino visigodo: origen y organización política. Los concilios.\n2. Los primeros núcleos de resistencia cristiana. Principales etapas de la Reconquista. Modelos de\nrepoblación.\n3. Organización política de la Corona de Castilla, de la Corona de Aragón y del Reino de Navarra al final\nde la Edad Media.\n4. La Monarquía Hispánica de Felipe II. Gobierno y administración. Los problemas internos. Guerras y\nsublevación en Europa.\n5. Principales factores de la crisis demográfica y económica del siglo XVII y sus consecuencias.\n6. La nueva Monarquía Borbónica. Los Decretos de Nueva Planta. Modelo de Estado y alcance de las\nreformas.",
          puntuacion: 4,
          criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
        },
        {
          id: "h-2020-modelo-A-fuente",
          tipo: "fuente",
          label: "Fuente",
          imagen_url: "/historia-imgs/modelos/historia-2020-modelo-a-fuente.png",
          enunciado: "A.2 (1,5 puntos) FUENTE:\n1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido. (Puntuación\nmáxima: 0´5 puntos).\n2. 2. Explique el contexto histórico de la Constitución de 1978. (Puntuación máxima: 1 punto).\n\nLos siete “padres” de la Constitución española de 1978.",
          puntuacion: 1.5,
          criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        },
        {
          id: "h-2020-modelo-A-tema",
          tipo: "tema",
          label: "Tema",
          enunciado: "A.3 (4,5 puntos) TEMA:\nEl Sexenio Democrático (1868-1874): la constitución de 1869. Evolución política: gobierno provisional,\nreinado de Amadeo de Saboya y Primera República.",
          puntuacion: 4.5,
          criterios: "Se valorará la capacidad de síntesis, claridad y organización expositiva, referencias cronológicas y espaciales, y adecuación al tema planteado.",
        }
    ]
  },
  {
    id: 1005, año: 2020, tipo: "Modelo", opcion: "B",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
        {
          id: "h-2020-modelo-B-cuestiones",
          tipo: "cuestiones",
          label: "Cuestiones",
          enunciado: "B.1 (4 puntos) CUESTIONES:\n1. Los pueblos prerromanos. Las colonizaciones históricas: fenicios y griegos. Tartesos.\n2. Al Ándalus: economía, sociedad y cultura.\n3. Los reinos cristianos en la Edad Media: organización política, régimen señorial y sociedad\nestamental.\n4. El significado de1492. La guerra de Granada y el descubrimiento de América.\n5. Los Austrias del siglo XVII: el gobierno de validos. La crisis de 1640.\n6. La Guerra de Sucesión Española y el sistema de Utrecht. Los Pactos de Familia.",
          puntuacion: 4,
          criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
        },
        {
          id: "h-2020-modelo-B-fuente",
          tipo: "fuente",
          label: "Fuente",
          imagen_url: "/historia-imgs/modelos/historia-2020-modelo-b-fuente.png",
          enunciado: "B.2 (1,5 puntos) FUENTE:\n1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido. (Puntuación\nmáxima: 0´5 puntos).\n2. Explique el contexto histórico del reinado de Isabel II (1833): la Constitución de 1837. (Puntuación\nmáxima: 1 punto).\n\nIsabel II jurando la Constitución de 1837 en su mayoría de edad. (Autor: José Castelaro y Perera. Título:\n“Isabel II jurando la Constitución”. 1844).",
          puntuacion: 1.5,
          criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        },
        {
          id: "h-2020-modelo-B-texto",
          tipo: "texto",
          label: "Texto",
          enunciado: "ANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad el contenido del texto. (Puntuación máxima: 0’5 puntos).\n2. Señale las ideas fundamentales del texto. (Puntuación máxima: 1 punto).\n3. Responda a la siguiente cuestión. (Puntuación máxima: 3 puntos): La creación del Estado franquista.\nEtapas de la Dictadura y principales características de cada una de ellas.",
          puntuacion: 4.5,
          criterios: "Se valorará la comprensión del texto, el resumen, la explicación de las ideas fundamentales y la contextualización histórica precisa.",
          texto_fuente: "B.3 (4,5 puntos) TEXTO:\n\nLa Junta de Defensa Nacional, creada por Decreto de veinticuatro de julio de 1936, y el régimen\nprovisional de Mandos combinados respondían a las más apremiantes necesidades de la liberación de\nEspaña (…)\n\nRazones de todo linaje señalan la alta conveniencia de concentrar en un solo poder todos\naquellos que han de conducir a la victoria final, y al establecimiento, consolidación y desarrollo del\nnuevo Estado, con la asistencia fervorosa de la Nación.\nEn consideración a los motivos expuestos, y segura de interpretar el verdadero sentir nacional, esta\nJunta, al servicio de España, promulga el siguiente Decreto:\n\nArtículo 1º El cumplimiento de acuerdo adoptado por la Junta de Defensa Nacional, se nombra\nJefe del Gobierno del Estado Español al Excmo. Sr. General de División D. Francisco Franco\nBahamonde, quien asumirá todos los poderes del nuevo Estado.\n\nArtículo 2º Se le nombra asimismo Generalísimo de las fuerzas nacionales de tierra, mar y aire, y\nse le confiere el cargo de General Jefe de los Ejércitos de operaciones.\n\n(Nombramiento del general Francisco Franco como Jefe del Gobierno del Estado y Generalísimo de\nlas fuerzas nacionales. Boletín Oficial de la Junta de Defensa Nacional, 29 de septiembre de 1936).",
        }
    ]
  },
  {
    id: 1006, año: 2021, tipo: "Modelo", opcion: "A",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
        {
          id: "h-2021-modelo-A-cuestiones",
          tipo: "cuestiones",
          label: "Cuestiones",
          enunciado: "A.1 (4 puntos) CUESTIONES:\n1. Los pueblos prerromanos. Las colonizaciones históricas: fenicios y griegos. Tartessos.\n2. Al Ándalus: economía, sociedad y cultura.\n3. Los reinos cristianos en la Edad Media: organización política, régimen señorial y sociedad estamental.\n4. Los Reyes Católicos: unión dinástica e instituciones de gobierno.\n5. Los Austrias del siglo XVII: el gobierno de validos. La crisis de 1640.\n6. La España del siglo XVIII. Expansión y transformaciones económicas: agricultura, industria y comercio\ncon América. Causas del despegue económico de Cataluña.",
          puntuacion: 4,
          criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
        },
        {
          id: "h-2021-modelo-A-fuente",
          tipo: "fuente",
          label: "Fuente",
          imagen_url: "/historia-imgs/modelos/historia-2021-modelo-a-fuente.png",
          enunciado: "A.2 (1,5 puntos) FUENTE:\n1.\nExplique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo a la\nsiguiente imagen. (Puntuación máxima: 0,5 puntos).\n2.\nExplique el contexto histórico del reinado de Isabel II: la primera guerra carlista. (Puntuación\nmáxima: 1 punto).\nUnidad carlista, cuadro del pintor Ferrer Dalmau.",
          puntuacion: 1.5,
          criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        },
        {
          id: "h-2021-modelo-A-tema",
          tipo: "tema",
          label: "Tema",
          enunciado: "A.3 (4,5 puntos) TEMA:\nLa Guerra Civil: la sublevación militar y el estallido de la guerra. La dimensión internacional del\nconflicto.",
          puntuacion: 4.5,
          criterios: "Se valorará la capacidad de síntesis, claridad y organización expositiva, referencias cronológicas y espaciales, y adecuación al tema planteado.",
        }
    ]
  },
  {
    id: 1007, año: 2021, tipo: "Modelo", opcion: "B",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
        {
          id: "h-2021-modelo-B-cuestiones",
          tipo: "cuestiones",
          label: "Cuestiones",
          enunciado: "B.1 (4 puntos) CUESTIONES:\n1. Sociedad y economía en el Paleolítico y Neolítico. La pintura rupestre.\n2. Al Ándalus: reinos de taifas. Reino nazarí.\n3. Organización política de la Corona de Castilla, de la Corona de Aragón y del Reino de Navarra al final\nde la Edad Media.\n4. La Monarquía Hispánica de Felipe II. Gobierno y administración. Los problemas internos. Guerras y\nsublevación en Europa.\n5. Crisis y decadencia de la Monarquía Hispánica: el reinado de Carlos II y el problema sucesorio.\n6. La nueva Monarquía Borbónica. Los Decretos de Nueva Planta. Modelo de Estado y alcance de las\nreformas.",
          puntuacion: 4,
          criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
        },
        {
          id: "h-2021-modelo-B-fuente",
          tipo: "fuente",
          label: "Fuente",
          imagen_url: "/historia-imgs/modelos/historia-2021-modelo-b-fuente.png",
          enunciado: "B.2 (1,5 puntos) FUENTE:\n1.\nExplique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo a la\nsiguiente imagen. (Puntuación máxima: 0,5 puntos).\n2.\nExplique el contexto histórico de la Segunda República. El Frente Popular. Las elecciones de\n1936 y el nuevo gobierno (Puntuación máxima: 1 punto).\n1 de mayo de 1936, Salamanca. Fuente: El País.",
          puntuacion: 1.5,
          criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        },
        {
          id: "h-2021-modelo-B-texto",
          tipo: "texto",
          label: "Texto",
          enunciado: "ANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad el contenido del texto. (Puntuación máxima: 0,5 puntos).\n2. Señale las ideas fundamentales del texto. (Puntuación máxima: 1 punto).\n3. Responda a la siguiente cuestión: El Sexenio Democrático (1868-1874): la Constitución de 1869.\nEvolución política: gobierno provisional. (Puntuación máxima: 3 puntos).",
          puntuacion: 4.5,
          criterios: "Se valorará la comprensión del texto, el resumen, la explicación de las ideas fundamentales y la contextualización histórica precisa.",
          texto_fuente: "B.3 (4,5 puntos) TEXTO:\nLa Nación española y en su nombre las Cortes Constituyentes, elegidas por sufragio universal (...)\ndecretan y sancionan la siguiente Constitución.\nArt. 16. Ningún español que se halle en el pleno goce de sus derechos civiles podrá ser privado del\nderecho de votar en las elecciones de senadores, diputados a Cortes, diputados provinciales y concejales.\nArt. 17. Tampoco podrá ser privado ningún español: Del derecho de emitir libremente sus ideas (...) Del\nderecho a reunirse pacíficamente. Del derecho de asociarse para todos los fines de la vida humana (...)\nArt. 21. La Nación se obliga a mantener el culto y los ministros de la religión católica. El ejercicio público\no privado de cualquier otro culto queda garantizado (...)\nArt. 32. La soberanía reside esencialmente en la Nación, de la cual emanan todos los poderes.\nArt. 33. La forma de Gobierno de la Nación española es la Monarquía.\nArt. 34. La potestad de hacer las leyes reside en las Cortes. El Rey sanciona y promulga las leyes.\nArt. 93. Se establecerá el juicio por jurados (...)\nArt. 108. Las Cortes Constituyentes reformarán el sistema actual del gobierno de las provincias de\nUltramar, cuando hayan tomado asiento los diputados de Cuba y Puerto Rico (…)\nArtículos de la Constitución de 1869.",
        }
    ]
  },
  {
    id: 1008, año: 2022, tipo: "Modelo", opcion: "A",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
        {
          id: "h-2022-modelo-A-cuestiones",
          tipo: "cuestiones",
          label: "Cuestiones",
          enunciado: "A.1 (4 puntos) CUESTIONES:\n1. Conquista y romanización de la Península Ibérica. Principales aportaciones romanas en los ámbitos social,\neconómico y cultural.\n2. Al Ándalus: reinos de taifas. Reino nazarí.\n3. Los reinos cristianos en la Edad Media: organización política, régimen señorial y sociedad estamental.\n4. El significado de 1492. La guerra de Granada y el descubrimiento de América.\n5. La guerra de los Treinta Años y la pérdida de la hegemonía española en Europa.\n6. La nueva Monarquía Borbónica. Los Decretos de Nueva Planta. Modelo de Estado y alcance de las\nreformas.",
          puntuacion: 4,
          criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
        },
        {
          id: "h-2022-modelo-A-fuente",
          tipo: "fuente",
          label: "Fuente",
          imagen_url: "/historia-imgs/modelos/historia-2022-modelo-a-fuente.png",
          enunciado: "A.2 (1,5 puntos) FUENTE:\n1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo a la\nsiguiente imagen. (Puntuación máxima: 0,5 puntos).\n2. Explique el contexto histórico de la dimensión internacional de la Guerra Civil Española (Puntuación\nmáxima: 1 punto).\nHomenaje de despedida de la FET y de las JONS a la Legión Cóndor en León (1939).",
          puntuacion: 1.5,
          criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        },
        {
          id: "h-2022-modelo-A-tema",
          tipo: "tema",
          label: "Tema",
          enunciado: "A.3 (4,5 puntos) TEMA: El reinado de Isabel II (1833-1868): las desamortizaciones de Mendizábal y Madoz.\nDe la sociedad estamental a la sociedad de clases.",
          puntuacion: 4.5,
          criterios: "Se valorará la capacidad de síntesis, claridad y organización expositiva, referencias cronológicas y espaciales, y adecuación al tema planteado.",
        }
    ]
  },
  {
    id: 1009, año: 2022, tipo: "Modelo", opcion: "B",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
        {
          id: "h-2022-modelo-B-cuestiones",
          tipo: "cuestiones",
          label: "Cuestiones",
          enunciado: "B.1 (4 puntos) CUESTIONES:\n1. El reino visigodo: origen y organización política. Los concilios.\n2. Los primeros núcleos de resistencia cristiana. Principales etapas de la Reconquista. Modelos de repoblación.\n3. Organización política de la Corona de Castilla, de la Corona de Aragón y del Reino de Navarra al final de la\nEdad Media.\n4. La Monarquía Hispánica de Felipe II. Gobierno y administración. Los problemas internos. Guerras y\nsublevación en Europa.\n5. Principales factores de la crisis demográfica y económica del siglo XVII y sus consecuencias.\n6. La España del siglo XVIII. Expansión y transformaciones económicas: agricultura, industria y comercio con\nAmérica. Causas del despegue económico de Cataluña.",
          puntuacion: 4,
          criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
        },
        {
          id: "h-2022-modelo-B-fuente",
          tipo: "fuente",
          label: "Fuente",
          imagen_url: "/historia-imgs/modelos/historia-2022-modelo-b-fuente.png",
          enunciado: "B.2 (1,5 puntos) FUENTE:\n1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo a la\nsiguiente imagen. (Puntuación máxima: 0,5 puntos).\n2. Relacione esta imagen con el movimiento obrero y campesino durante la Restauración Borbónica\n(Puntuación máxima: 1 punto).\n\nAsamblea en Barcelona de la sección española de la Asociación Internacional de Trabajadores.",
          puntuacion: 1.5,
          criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        },
        {
          id: "h-2022-modelo-B-texto",
          tipo: "texto",
          label: "Texto",
          enunciado: "ANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad el contenido del texto. (Puntuación máxima: 0,5 puntos).\n2. Señale y explique las ideas fundamentales del texto. (Puntuación máxima: 1 punto).\n3. Responda a la siguiente cuestión (Puntuación máxima: 3 puntos): Las elecciones de junio de 1977. La\nConstitución de 1978. El Estado de las Autonomías.\n\nC\nd\nl\nl\ni\nó l\nió",
          puntuacion: 4.5,
          criterios: "Se valorará la comprensión del texto, el resumen, la explicación de las ideas fundamentales y la contextualización histórica precisa.",
          texto_fuente: "B.3 (4,5 puntos) TEXTO:\n\n“Preámbulo.- La Nación española, deseando establecer la justicia, la libertad y la seguridad y promover el\nbien de cuantos la integran, en uso de su soberanía proclama su voluntad de:\n\nGarantizar la convivencia democrática dentro de la Constitución y de las leyes conforme a un orden\neconómico y social justo (…)\n\nArtículo 2\n\nLa Constitución se fundamenta en la indisoluble unidad de la Nación española, patria común e indivisible\nde todos los españoles y reconoce y garantiza el derecho a la autonomía de las nacionalidades y regiones que la\nintegran y la solidaridad entre todas ellas (…)\n\nArtículo 143.-En el ejercicio del derecho a la autonomía reconocido en el artículo 2 de la Constitución, las\nprovincias limítrofes con características históricas, culturales y económicas comunes, los territorios insulares y\nlas provincias con entidad regional histórica podrán acceder a su autogobierno y constituirse en Comunidades\nAutónomas con arreglo a lo previsto en este Título y en los respectivos estatutos”.\n\nConstitución de 1978 (Preámbulo, Título Preliminar y Título VIII)",
        }
    ]
  },
  {
    id: 1010, año: 2023, tipo: "Modelo", opcion: "A",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
        {
          id: "h-2023-modelo-A-cuestiones",
          tipo: "cuestiones",
          label: "Cuestiones",
          enunciado: "A.1. (4 puntos) CUESTIONES\n1.-El reino visigodo: origen y organización política. Los concilios.\n2.-Al Ándalus: reinos de taifas. Reino nazarí.\n3.-Organización política de la Corona de Castilla, de la Corona de Aragón y del Reino de Navarra al final de la\nEdad Media.\n4.-El Imperio de los Austrias: España bajo Carlos I. Política interior y conflictos europeos.\n5.-Exploración y colonización de América. Consecuencias de los descubrimientos en España, Europa y América.\n6.-La nueva Monarquía Borbónica. Los Decretos de Nueva Planta. Modelo de Estado y alcance de las reformas.",
          puntuacion: 4,
          criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
        },
        {
          id: "h-2023-modelo-A-fuente",
          tipo: "fuente",
          label: "Fuente",
          imagen_url: "/historia-imgs/modelos/historia-2023-modelo-a-fuente.png",
          enunciado: "A.2. (1.5 puntos) FUENTE\n1.-Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo a la siguiente\nimagen (Puntuación máxima: 0.5 puntos)\n2.-Explique el contexto histórico de la crisis de 1917 (Puntuación máxima: 1 punto)\n\nHuelga general revolucionaria de 1917 (Granada). Fuente: diario Ideal.",
          puntuacion: 1.5,
          criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        },
        {
          id: "h-2023-modelo-A-tema",
          tipo: "tema",
          label: "Tema",
          enunciado: "A.3. (4.5 puntos) TEMA: El reinado de Fernando VII: liberalismo frente a absolutismo. El proceso de\nindependencia de las colonias americanas.",
          puntuacion: 4.5,
          criterios: "Se valorará la capacidad de síntesis, claridad y organización expositiva, referencias cronológicas y espaciales, y adecuación al tema planteado.",
        }
    ]
  },
  {
    id: 1011, año: 2023, tipo: "Modelo", opcion: "B",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
        {
          id: "h-2023-modelo-B-cuestiones",
          tipo: "cuestiones",
          label: "Cuestiones",
          enunciado: "B.1. (4 puntos) CUESTIONES\n1.-Conquista y romanización de la Península Ibérica. Principales aportaciones romanas en los ámbitos social,\neconómico y cultural.\n2.-Al Ándalus: la conquista musulmana de la Península Ibérica. Emirato y califato de Córdoba.\n3.-Los reinos cristianos de la Edad Media: organización política, régimen señorial y sociedad estamental.\n4.-La Monarquía Hispánica de Felipe II. Gobierno y administración. Los problemas internos. Guerras y\nsublevación en Europa.\n5.-Los Austrias del siglo XVII: el gobierno de validos. La crisis de 1640.\n6.-La Guerra de Sucesión Española y el sistema de Utrecht. Los Pactos de Familia.",
          puntuacion: 4,
          criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
        },
        {
          id: "h-2023-modelo-B-fuente",
          tipo: "fuente",
          label: "Fuente",
          imagen_url: "/historia-imgs/modelos/historia-2023-modelo-b-fuente.png",
          enunciado: "B.2. (1.5 puntos) FUENTE\n1.-Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo a la siguiente\nimagen (Puntuación máxima: 0.5 puntos)\n2.-Relacione este mapa con la evolución demográfica en el siglo XIX (Puntuación máxima: 1 punto)",
          puntuacion: 1.5,
          criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        },
        {
          id: "h-2023-modelo-B-texto",
          tipo: "texto",
          label: "Texto",
          enunciado: "ANÁLISIS DEL TEXTO Y CUESTIONES:\n1.-Resuma con brevedad el contenido del texto (Puntuación máxima: 0.5 puntos).\n2.-Señale y explique las ideas fundamentales del texto (Puntuación máxima: 1 punto).\n3.-Responda a la siguiente cuestión (Puntuación máxima: 3 puntos): La Transición: alternativas políticas tras la\nmuerte de Franco. El papel del rey y el gobierno de Adolfo Suárez.",
          puntuacion: 4.5,
          criterios: "Se valorará la comprensión del texto, el resumen, la explicación de las ideas fundamentales y la contextualización histórica precisa.",
          texto_fuente: "B.3. (4.5 puntos) TEXTO:\n\n“La transición española y la portuguesa, como todos los procesos de cambio que transforman sistemas y\nregímenes políticos, tienen algunos elementos comunes, pero tienen unos evidentes elementos de diferenciación.\nEn el caso portugués, se habla de un proceso de ruptura y hundimiento del régimen anterior, todo ello con el inmenso\ncapital político que supone que fuera un cambio pacífico. En el caso español, se habla de consenso y de un proceso\nde cambio pactado. En Portugal hay una fecha y un símbolo del cambio. En España nadie sabe decir cuándo\nempieza la transición.\n\n(…) Al analizar la transición, seguimos anclados en la contraposición entre reforma y ruptura. No es tan\nsimple. Una buena parte de los que aprobaron la ley de Reforma Política creyeron que iban a pilotar el proceso de\ncambio reformando las leyes del franquismo, y creyeron –la mayoría seguramente de buena fe- que con la ley de\nReforma Política –que, sin duda, fue un elemento desencadenante de todo el proceso de cambio- se estaban\nreformando las Leyes Fundamentales del Movimiento, es decir, las del régimen de Franco. Sin embargo, lo que\nocurrió tras las primeras elecciones fue que se redactó una Constitución y, por cierto, por una asamblea que no fue\nelegida para ser constituyente, lo que hubiera sido ilegal teniendo como referencia la ley de Reforma Política”.\n\n(Intervención de Felipe González en el Encuentro celebrado en Lisboa los días 26 y 27 de septiembre de\n1998, publicado en Herrero de Miñón, M. (ed.), La transición democrática en España, Bilbao, Fundación BBV, 1999,\nvol. I).",
        }
    ]
  },
  {
    id: 1012, año: 2024, tipo: "Modelo", opcion: "A",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
        {
          id: "h-2024-modelo-A-cuestiones",
          tipo: "cuestiones",
          label: "Cuestiones",
          enunciado: "A.1 (3 puntos) CUESTIONES:\n1. La Hispania romana.\n2. Al-Ándalus: evolución política.\n3. Los Austrias del siglo XVI. Política interior y exterior.\n4. Sociedad, economía y cultura del siglo XVIII.",
          puntuacion: 3,
          criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
        },
        {
          id: "h-2024-modelo-A-fuente",
          tipo: "fuente",
          label: "Fuente",
          imagen_url: "/historia-imgs/modelos/historia-2024-modelo-a-fuente.png",
          enunciado: "A.2 (2,5 puntos) FUENTE:\n1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo al siguiente\ndocumento. (Puntuación máxima: 0,5 puntos).\n2. Relacione los datos con las transformaciones económicas durante la dictadura franquista. (Puntuación\nmáxima: 2 puntos).\n\nEvolución de la población activa (en porcentaje) por sectores en 1940-1975\n\nAgricultura\nIndustria\nServicios\n1930\n45,5\n26,1\n28,0\n1940\n50,5\n22,1\n27,4\n1950\n47,6\n26,5\n25,9\n1960\n39,7\n33,0\n27,3\n1970\n29,1\n37,3\n33,6\n1975\n21,7\n38,0\n40,3\nFuente: Anuarios Estadísticos del INE",
          puntuacion: 2.5,
          criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        },
        {
          id: "h-2024-modelo-A-tema",
          tipo: "tema",
          label: "Tema",
          enunciado: "A.3 (4,5 puntos) TEMA: Las guerras de Cuba, el conflicto bélico contra Estados Unidos y la crisis de 1898.",
          puntuacion: 4.5,
          criterios: "Se valorará la capacidad de síntesis, claridad y organización expositiva, referencias cronológicas y espaciales, y adecuación al tema planteado.",
        }
    ]
  },
  {
    id: 1013, año: 2024, tipo: "Modelo", opcion: "B",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
        {
          id: "h-2024-modelo-B-cuestiones",
          tipo: "cuestiones",
          label: "Cuestiones",
          enunciado: "B.1 (3 puntos) CUESTIONES:\n1. El Paleolítico y el Neolítico.\n2. Los reinos cristianos: evolución de la conquista de la Península y organización política.\n3. Exploración, conquista y colonización de América (desde 1492 y durante el siglo XVI).\n4. La Guerra de Sucesión. La Paz de Utrecht. Los Pactos de Familia.",
          puntuacion: 3,
          criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
        },
        {
          id: "h-2024-modelo-B-fuente",
          tipo: "fuente",
          label: "Fuente",
          imagen_url: "/historia-imgs/modelos/historia-2024-modelo-b-fuente.png",
          enunciado: "B.2 (2,5 puntos) FUENTE:\n1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo a la siguiente\nimagen. (Puntuación máxima: 0,5 puntos).\n2. Relacione esta imagen con las Cortes de Cádiz. (Puntuación máxima: 2 puntos).\n\nEl juramento de las Cortes de Cádiz en 1810 (pintura de José Casado del Alisal, realizada en 1863)",
          puntuacion: 2.5,
          criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        },
        {
          id: "h-2024-modelo-B-texto",
          tipo: "texto",
          label: "Texto",
          enunciado: "ANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad el contenido del texto. (Puntuación máxima: 0,5 puntos).\n\n2. Señale y explique las ideas fundamentales del texto. (Puntuación máxima: 1 punto).\n3. Responda a la siguiente cuestión: La crisis de la Restauración: La oposición al régimen. (Puntuación\nmáxima: 3 puntos).",
          puntuacion: 4.5,
          criterios: "Se valorará la comprensión del texto, el resumen, la explicación de las ideas fundamentales y la contextualización histórica precisa.",
          texto_fuente: "B.3 (4,5 puntos) TEXTO:\n“A los obreros y a la opinión pública:\nHa llegado el momento de poner en práctica, sin vacilación alguna, los propósitos anunciados por los\nrepresentantes de la Unión General de Trabajadores y la Confederación General del Trabajo en el manifiesto\nsuscrito por estos organismos en el mes de marzo último.\nDurante el tiempo transcurrido desde esa fecha hasta el momento actual, la afirmación hecha por el proletariado\nal demandar como remedio a los males que padece España un cambio fundamental de régimen político, ha sido\ncorroborada por la actitud que sucesivamente han ido adoptando importantes organismos nacionales, desde la\nenérgica afirmación de la existencia de las Juntas de defensa del arma de infantería, frente a los intentos de\ndisolución de esos organismos por los Poderes públicos, hasta la Asamblea de parlamentarios celebrada en\nBarcelona el día 19 de julio, y la adhesión a las conclusiones de esa Asamblea de numerosos Ayuntamientos,\nque dan público testimonio de las ansias de renovación que existen en todo el país […]\nPedimos la constitución de un Gobierno provisional que asuma los Poderes ejecutivo y moderador, y prepare,\nprevias las modificaciones imprescindibles en una legislación viciada, la celebración de elecciones sinceras de\nunas Cortes Constituyentes que aborden, en plena libertad, los problemas fundamentales de la Constitución\npolítica del país. Mientras no se haya conseguido ese objetivo, la organización obrera se halla absolutamente\ndecidida a mantenerse en su actitud de huelga”.\n(Comités nacionales de la UGT y el PSOE, Madrid, 12 de agosto de 1917, publicado en El Socialista, meses\ndespués).",
        }
    ]
  },
  {
    id: 1014, año: 2026, tipo: "Modelo", opcion: "A",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
        {
          id: "h-2026-modelo-A-cuestiones",
          tipo: "cuestiones",
          label: "Cuestiones",
          enunciado: "A. (3 puntos) CUESTIONES:\nResponda a tres cuestiones, una por cada bloque de preguntas.\n1.-Responda a una de estas dos preguntas:\n-Los pueblos prerromanos y las colonizaciones de los pueblos del Mediterráneo.\n-La monarquía visigoda.\n2.-Responda a una de estas dos preguntas:\n-Al-Ándalus: economía, sociedad y cultura. El legado judío en la Península ibérica.\n-La Baja Edad Media en las Coronas de Castilla y de Aragón y en el Reino de Navarra.\n3.-Responda a una de estas dos preguntas:\n-Sociedad, economía y cultura de los siglos XVI y XVII.\n-La Guerra de Sucesión. La Paz de Utrecht. Los pactos de familia.",
          puntuacion: 3,
          criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
        },
        {
          id: "h-2026-modelo-A-fuente",
          tipo: "fuente",
          label: "Fuente",
          imagen_url: "/historia-imgs/modelos/historia-2026-modelo-a-fuente.png",
          enunciado: "Fuente 1:\n1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo al\nsiguiente documento. (Puntuación máxima: 0,5 puntos).\n2. Relacione esta imagen con el bienio reformista de la Segunda República: Reformas estructurales y\nrealizaciones sociales y culturales. (Puntuación máxima: 2,5 puntos).\nEl presidente de la República Niceto Alcalá Zamora con el jefe del Gobierno Manuel Azaña, en la\nprimera Feria del Libro de Madrid (abril 1933). Archivo General de la Administración",
          puntuacion: 3,
          criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        },
        {
          id: "h-2026-modelo-A-texto",
          tipo: "texto",
          label: "Texto",
          enunciado: "ANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad el contenido del texto. (Puntuación máxima: 0,5 puntos).\n2. Señale y explique las ideas fundamentales del texto. (Puntuación máxima: 1 punto).\n3. Responda a la siguiente cuestión: El reinado de Fernando VII. (Puntuación máxima: 2,5 puntos).\n\n2.Tema: El sistema canovista: la Constitución de 1876 y el turno de partidos. La oposición al sistema.",
          puntuacion: 4,
          criterios: "Se valorará la comprensión del texto, el resumen, la explicación de las ideas fundamentales y la contextualización histórica precisa.",
          texto_fuente: "C. (4 puntos) ANÁLISIS DE TEXTO O TEMA:\nElija entre el análisis de texto o el tema, y responda a las preguntas.\n1.Análisis de texto:\n“Bien públicos y notorios fueron a todos mis vasallos los escandalosos sucesos que precedieron,\nacompañaron y siguieron al establecimiento de la democrática constitución de Cádiz en el mes de Marzo\nde 1820 [...]\nEl voto general clamó por todas partes contra la tiránica constitución; clamó por la cesación de un\ncódigo nulo en su origen, ilegal en su formación, injusto en su contenido; clamó finalmente por el\nsostenimiento de la Santa Religión de sus mayores, por la restitución de sus leyes fundamentales, y por\nla conservación de mis legítimos derechos que heredé de mis antepasados, que con la prevenida\nsolemnidad habían jurado mis vasallos. [...]\nLa Europa entera, conociendo profundamente mi cautiverio y el de toda mi Real Familia, la mísera\nsituación de mis vasallos fieles y leales, y las máximas perniciosas que profusamente esparcían a toda\ncosta los agentes españoles por todas partes, determinaron poner fin a un estado de cosas, que era el\nescándalo universal, que caminaba a trastornar todos los Tronos y todas las instituciones antiguas,\ncambiándolas en la irreligión y en la inmoralidad [...]\nHe venido en decretar lo siguiente:\nPrimero. Son nulos y de ningún valor todos los actos del Gobierno llamado constitucional (de\ncualquiera clase y condición que sean) que ha dominado a mis pueblos desde el 7 de Marzo de 1820\nhasta hoy día 1º de Octubre de 1823, declarando, como declaro, que en toda esta época he carecido de\nlibertad, obligado a sancionar las leyes y a expedir las órdenes, decretos y reglamentos que contra mi\nvoluntad se meditaban y expedían por el mismo Gobierno.”\n(Decreto de Fernando VII de 1 de octubre de 1823, en Gaceta de Madrid, 7 de octubre de 1823).",
        }
    ]
  },
  {
    id: 1015, año: 2026, tipo: "Modelo", opcion: "B",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
        {
          id: "h-2026-modelo-B-cuestiones",
          tipo: "cuestiones",
          label: "Cuestiones",
          enunciado: "A. (3 puntos) CUESTIONES:\nResponda a tres cuestiones, una por cada bloque de preguntas.\n1.-Responda a una de estas dos preguntas:\n-Los pueblos prerromanos y las colonizaciones de los pueblos del Mediterráneo.\n-La monarquía visigoda.\n2.-Responda a una de estas dos preguntas:\n-Al-Ándalus: economía, sociedad y cultura. El legado judío en la Península ibérica.\n-La Baja Edad Media en las Coronas de Castilla y de Aragón y en el Reino de Navarra.\n3.-Responda a una de estas dos preguntas:\n-Sociedad, economía y cultura de los siglos XVI y XVII.\n-La Guerra de Sucesión. La Paz de Utrecht. Los pactos de familia.",
          puntuacion: 3,
          criterios: "Se valorará la capacidad de síntesis, precisión histórica, referencias cronológicas y espaciales, y el uso de lenguaje histórico adecuado.",
        },
        {
          id: "h-2026-modelo-B-fuente",
          tipo: "fuente",
          label: "Fuente",
          imagen_url: "/historia-imgs/modelos/historia-2026-modelo-b-fuente.png",
          enunciado: "Fuente 2:\n1. Explique brevemente el tipo de fuente, la localización cronológica y el contenido atendiendo al siguiente\ndocumento. (Puntuación máxima: 0,5 puntos).\n2. Relacione esta imagen con: España en Europa. Consecuencias económicas y sociales del proceso de\nintegración en la Unión Europea. (Puntuación máxima: 2,5 puntos).\n\nColas en la sede del Banco de España en Barcelona para cambiar pesetas por euros, 2 de enero de\n2002 (Fotografía: Manuel S. Urbano, El País)",
          puntuacion: 3,
          criterios: "Se valorará la identificación del tipo de fuente, su localización cronológica, el contenido y la relación con el proceso histórico correspondiente.",
        },
        {
          id: "h-2026-modelo-B-texto",
          tipo: "texto",
          label: "Texto",
          enunciado: "ANÁLISIS DEL TEXTO Y CUESTIONES:\n1. Resuma con brevedad el contenido del texto. (Puntuación máxima: 0,5 puntos).\n2. Señale y explique las ideas fundamentales del texto. (Puntuación máxima: 1 punto).\n3. Responda a la siguiente cuestión: El reinado de Fernando VII. (Puntuación máxima: 2,5 puntos).\n\n2.Tema: El sistema canovista: la Constitución de 1876 y el turno de partidos. La oposición al sistema.",
          puntuacion: 4,
          criterios: "Se valorará la comprensión del texto, el resumen, la explicación de las ideas fundamentales y la contextualización histórica precisa.",
          texto_fuente: "C. (4 puntos) ANÁLISIS DE TEXTO O TEMA:\nElija entre el análisis de texto o el tema, y responda a las preguntas.\n1.Análisis de texto:\n“Bien públicos y notorios fueron a todos mis vasallos los escandalosos sucesos que precedieron,\nacompañaron y siguieron al establecimiento de la democrática constitución de Cádiz en el mes de Marzo\nde 1820 [...]\nEl voto general clamó por todas partes contra la tiránica constitución; clamó por la cesación de un\ncódigo nulo en su origen, ilegal en su formación, injusto en su contenido; clamó finalmente por el\nsostenimiento de la Santa Religión de sus mayores, por la restitución de sus leyes fundamentales, y por\nla conservación de mis legítimos derechos que heredé de mis antepasados, que con la prevenida\nsolemnidad habían jurado mis vasallos. [...]\nLa Europa entera, conociendo profundamente mi cautiverio y el de toda mi Real Familia, la mísera\nsituación de mis vasallos fieles y leales, y las máximas perniciosas que profusamente esparcían a toda\ncosta los agentes españoles por todas partes, determinaron poner fin a un estado de cosas, que era el\nescándalo universal, que caminaba a trastornar todos los Tronos y todas las instituciones antiguas,\ncambiándolas en la irreligión y en la inmoralidad [...]\nHe venido en decretar lo siguiente:\nPrimero. Son nulos y de ningún valor todos los actos del Gobierno llamado constitucional (de\ncualquiera clase y condición que sean) que ha dominado a mis pueblos desde el 7 de Marzo de 1820\nhasta hoy día 1º de Octubre de 1823, declarando, como declaro, que en toda esta época he carecido de\nlibertad, obligado a sancionar las leyes y a expedir las órdenes, decretos y reglamentos que contra mi\nvoluntad se meditaban y expedían por el mismo Gobierno.”\n(Decreto de Fernando VII de 1 de octubre de 1823, en Gaceta de Madrid, 7 de octubre de 1823).",
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
