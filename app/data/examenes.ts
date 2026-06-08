export interface Pregunta {
  id: string
  bloque: "Algebra" | "Analisis" | "Geometria" | "Probabilidad"
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

export const examenes: Examen[] = [
  {
    id: 1, año: 2025, tipo: "Modelo", asignatura: "Matemáticas II", comunidad: "Madrid",
    preguntas: [
      { id:"M2025-1A", bloque:"Algebra", opcion:"A",
        enunciado:`Se considera la matriz $A = \\begin{pmatrix} 2 & 1 & 0 \\\\ 1 & -1 & 1 \\\\ 0 & 1 & 2 \\end{pmatrix}$.\n\na) Calcula $\\det(A)$.\n\nb) Halla $A^{-1}$.\n\nc) Resuelve el sistema $AX = \\begin{pmatrix} 1 \\\\ 0 \\\\ 1 \\end{pmatrix}$.`,
        puntuacion:2.5, criterios:"Determinante (0.5 pts), inversa (1.25 pts), sistema (0.75 pts)." },
      { id:"M2025-1B", bloque:"Algebra", opcion:"B",
        enunciado:`Discute segun $a$ y $b$:\n$$\\begin{cases} x+y+2z=1 \\\\ 2x-y+z=2 \\\\ x+2y+az=b \\end{cases}$$\nResuelve cuando sea SCD.`,
        puntuacion:2.5, criterios:"Rouche-Frobenius (1 pt), discusion (1 pt), resolucion SCD (0.5 pts)." },
      { id:"M2025-2A", bloque:"Analisis", opcion:"A",
        enunciado:`$f(x) = \\dfrac{x^2-4}{x-1}$: dominio, asintotas, monotonia, extremos y grafica.`,
        puntuacion:2.5, criterios:"Dominio y asintotas (0.75 pts), monotonia y extremos (1 pt), grafica (0.75 pts)." },
      { id:"M2025-2B", bloque:"Analisis", opcion:"B",
        enunciado:`Calcula el area de la region acotada por $y=x^2-1$ e $y=x+1$.`,
        puntuacion:2.5, criterios:"Interseccion (0.5 pts), integral (1 pt), resultado (1 pt)." },
      { id:"M2025-3A", bloque:"Geometria", opcion:"A",
        enunciado:`$r: \\dfrac{x-1}{2}=\\dfrac{y}{1}=\\dfrac{z+1}{-1}$ y $\\pi: x-y+2z=3$.\n\na) Posicion relativa.\n\nb) Punto de interseccion.\n\nc) Angulo recta-plano.`,
        puntuacion:2.5, criterios:"Posicion (0.5 pts), interseccion (1 pt), angulo (1 pt)." },
      { id:"M2025-3B", bloque:"Geometria", opcion:"B",
        enunciado:`$A(1,0,0)$, $B(0,1,0)$, $C(0,0,1)$.\n\na) Plano por $A$, $B$, $C$.\n\nb) Distancia del origen al plano.\n\nc) Volumen del tetraedro con vertice $O(0,0,0)$.`,
        puntuacion:2.5, criterios:"Plano (1 pt), distancia (0.75 pts), volumen (0.75 pts)." },
      { id:"M2025-4A", bloque:"Probabilidad", opcion:"A",
        enunciado:`$X\\sim N(\\mu=60, \\sigma=12)$.\n\na) $P(48<X<78)$\n\nb) $k$: $P(X>k)=0{,}1587$\n\nc) Con $n=36$, P(media muestral $> 63$)`,
        puntuacion:2.5, criterios:"Tipificacion (0.5 pts), a (0.75 pts), b (0.75 pts), media muestral (0.5 pts)." },
      { id:"M2025-4B", bloque:"Probabilidad", opcion:"B",
        enunciado:`Tres proveedores: $P_1$ (50%), $P_2$ (30%), $P_3$ (20%). Defectos: 2%, 4%, 6%.\n\na) P(pieza defectuosa)\n\nb) P($P_1$ | defectuosa)`,
        puntuacion:2.5, criterios:"Probabilidad total (1 pt), Bayes (1.5 pts)." }
    ]
  },
  {
    id: 2, año: 2025, tipo: "Ordinaria", asignatura: "Matemáticas II", comunidad: "Madrid",
    preguntas: [
      { id: "2025-J-11", bloque: "Algebra", opcion: "A",
        enunciado: "En el baloncesto existen canastas que valen un punto, otras que valen dos y otras\nque valen tres puntos. Calcule el número de lanzamientos de uno, de dos y de tres puntos que realizó un equipo\nen un partido sabiendo que:\n• El equipo anotó 80 puntos con un acierto del 80% en tiros de uno, del 50% en tiros de dos y del 40% en tiros\nde tres.\n• La tercera parte del número de lanzamientos de dos fue igual a la quinta parte del resto de lanzamientos.\n• El doble del número de lanzamientos de tres es menor en cinco unidades al resto de lanzamientos.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2025-J-12", bloque: "Algebra", opcion: "B",
        enunciado: "Sean la matriz A =\n\n\n4 1 0\n2 3 0\n3 2 2\n\n e I la matriz identidad de orden 3. Se pide:\n\na) (1.25 puntos) Calcular el polinomio P (λ) = det (A − λ I) y hallar las raíces reales del polinomio.\n\nb) (1.25 puntos) Para λ = 5, calcular un vector no nulo −\t→\tv =\n\n\nx\ny\nz\n\n que satisfaga que (A − λI)−\t→\tv = −\t→\n0 .",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2025-J-2", bloque: "Analisis", opcion: "A",
        enunciado: "Un muro rectangular de la biblioteca pública del barrio se va a pintar con la ayuda de unos grafiteros.\nLa dimensión del muro es de 3 metros de alto y 12 metros de largo. Colocando la esquina inferior izquierda del\nmuro en el origen de coordenadas, se va a utilizar la curva f (x) = cos\n( πx\n9\n)\n+ 2 para diferenciar dos regiones del\nmuro que serán pintadas con dos colores distintos. Se sabe que con un bote de spray se pueden pintar 3 metros\ncuadrados de superficie.\n\na) (0.75 puntos) Halle el valor máximo y el valor mínimo de la función f (x) en el intervalo [0, 12]. ¿Está la curva\nen este intervalo [0, 12] contenida completamente en el muro?\n\nb) (1.25 puntos) Halle el área que tienen que pintar de cada color.\n\nc) (0.5 puntos) ¿Cuántos botes de spray se tienen que comprar como mínimo para pintar toda el área bajo la\ncurva f (x)?",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2025-J-31", bloque: "Geometria", opcion: "A",
        enunciado: "Dados la recta r ≡ x − 1\n2 = y\n0 = z − 2\n1 y el plano π : x + 2y − 3z = 1, se pide:\n\na) (0.75 puntos) Hallar una ecuación del plano que contiene a r y es perpendicular a π.\n\nb) (0.75 puntos) Hallar una ecuación de la recta contenida en π que corta perpendicularmente a r.\n\nc) (1 punto) Calcular los puntos de la recta r cuya distancia al plano π es √14.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2025-J-32", bloque: "Geometria", opcion: "B",
        enunciado: "Sean el punto P (0, 1, 1) y el plano π : x + y = 2. Se pide:\n\na) (0.5 puntos) Hallar la distancia del punto P al plano π.\n\nb) (1 punto) Determinar el punto Q del plano π cuya distancia a P es igual que la distancia de P a π.\n\nc) (1 punto) Hallar el área del triángulo formado por P y los puntos de corte del plano π con los ejes coorde-\nnados.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2025-J-41", bloque: "Probabilidad", opcion: "A",
        enunciado: "Sea E = {2, 3, 5, 7, 11, 13, 17, 19} un espacio muestral y P una medida de probabilidad en E definida\npor: P (7) = P (3) = 1\n4 y con el resto de sucesos elementales equiprobables.\nSe consideran los sucesos A = {7, 11, 13, 19}, B = {2, 5, 7, 13, 17} y C = {3, 5, 7, 11, 13}. Se pide calcular:\n\na) (1.25 puntos) P\n(\n(A − C) ∩ B\n)\n.\n\nb) (1.25 puntos) P ((A ∩ B) | C).",
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
        enunciado: "Para la función f (x) = x4 + πx3 + π2x2 + π3x + π4, se pide:\n\na) (0.5 puntos) Calcular la ecuación de la recta tangente a la gráfica de f (x) en x = π.\n\nb) (1 punto) Probar que f (x) tiene, al menos, un punto con derivada nula en el intervalo (−π, 0) utilizando\njustificadamente el teorema de Rolle. Probar de nuevo la misma afirmación utilizando adecuadamente, esta\nvez, el teorema de Bolzano.\n\nc) (1 punto) Si g(x) = f (−x), calcular el área entre las gráficas de f (x) y g(x) en el intervalo [0, π].",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2024-J-A3", bloque: "Geometria", opcion: "A",
        enunciado: "Dados los puntos A(0, 0, 1) y B(1, 1, 0), se pide:\n\na) (1 punto) Hallar una ecuación del plano que pasa por los puntos A y B y es perpendicular al plano z = 0.\n\nb) (1.5 puntos) Hallar ecuaciones de dos rectas paralelas, r1 y r2, que pasen por los puntos A y B respectiva-\nmente, estén en el plano x + z = 1 y tales que la distancia entre ellas sea 1.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2024-J-A4", bloque: "Probabilidad", opcion: "A",
        enunciado: "Sabiendo que P (A) = 11\n20 , P (A|B) − P (B|A) = 1\n24 y P (A ∩ B) = 3\n10 , se pide:\n\na) (1.5 puntos) Calcular P (A ∩ B) y P (B).\n\nb) (1 punto) Calcular P (C), siendo C otro suceso del espacio muestral, independiente de A y que verifica que\nP (A ∪ C) = 14\n25 .",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2024-J-B1", bloque: "Algebra", opcion: "B",
        enunciado: "Consideremos las matrices reales A =\n\n 3 −1 1\n1 1 1\n1 −1 3\n\n, B =\n\n b 2b b\n2b 3b b\nb b b\n\n y C =\n\n 2 0 0\n0 2 0\n0 0 3\n\n, con b ≠ 0.\nSe pide:\n\na) (1.25 puntos) Encontrar todos los valores de b para los que se verifica BCB−1 = A.\n\nb) (0.75 puntos) Calcular el determinante de la matriz AAt.\n\nc) (0.5 puntos) Resolver el sistema B\n\n x\ny\nz\n\n =\n\n 3\n−1\n1\n\n para b = 1.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2024-J-B2", bloque: "Analisis", opcion: "B",
        enunciado: "Calcule:\n\na) (1.25 puntos)\n∫ e\n1\n(x + 2) ln xdx.\n\nb) (1.25 puntos) lim\nx→ π\n2\n(\ntg x\n2\n)( 1\ncos x ).",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2024-J-B3", bloque: "Geometria", opcion: "B",
        enunciado: "Al ordenador de una impresora 3D se le suministraron ayer las coordenadas de los cuatro vértices P1, P2, P3 y\nP4 de un tetraedro sólido, el cual construyó al momento. Se sabe que P1(1, 1, 1), P2(2, 1, 0) y P3(1, 3, 2), pero del\ncuarto punto P4(3, a, 3) hoy no estamos seguros del valor de su segunda coordenada.\n\na) (1.5 puntos) A partir de la cantidad de material utilizado por la impresora sabemos que el volumen del\ntetraedro es V = 1. También sabemos que la longitud de ninguna de sus aristas supera la altura de la\nimpresora, que es de 10. Determine los posibles valores de a.\n\nb) (1 punto) Dado el punto Q(3, 3, 3), se quiere imprimir ahora el paralelepípedo que tiene a los segmentos\nP1P2, P1P3 y P1Q como aristas. ¿Cuáles serían los valores de las coordenadas de los ocho vértices del\nparalelepípedo que habría que suministrar al ordenador?",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2024-J-B4", bloque: "Probabilidad", opcion: "B",
        enunciado: "Tenemos dos dados no trucados de seis caras, uno azul y uno rojo. Las caras están numeradas del 1 al 6.\nEn un determinado juego, lanzamos los dos dados. Para calcular la puntuación obtenida, se sigue el siguiente\nprocedimiento: si el número obtenido en el dado azul es par, se le suma el doble del número obtenido en el dado\nrojo; si el número obtenido en el dado azul es impar, se le suma el número obtenido en el dado rojo. Se pide:\n\na) (1 punto) Calcular la probabilidad de obtener una puntuación de 10. Calcular la probabilidad de obtener una\npuntuación impar.\n\nb) (1.5 puntos) Calcular la probabilidad de haber obtenido un número par en el dado azul sabiendo que la\npuntuación final ha sido 8. Calcular la probabilidad de haber obtenido un número impar en el dado rojo\nsabiendo que la puntuación final ha sido un número par.",
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
        enunciado: "Dada la función f (x) = 3\np(x2 − 1)2, se pide:\n\na) (0.25 puntos) Estudiar si es par o impar.\n\nb) (0.75 puntos) Estudiar su derivabilidad en el punto x = 1.\n\nc) (1.5 puntos) Estudiar sus extremos relativos y absolutos.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2023-J-A3", bloque: "Geometria", opcion: "A",
        enunciado: "Sean los puntos A(1, −2, 3), B(0, 2, −1) y C(2, 1, 0). Se pide:\n\na) (1.25 puntos) Comprobar que forman un triángulo T y hallar una ecuación del plano que los contiene.\n\nb) (0.75 puntos) Calcular el corte de la recta que pasa por los puntos A y B con el plano z = 1.\n\nc) (0.5 puntos) Determinar el perímetro del triángulo T .",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2023-J-A4", bloque: "Probabilidad", opcion: "A",
        enunciado: "Se tiene un suceso A de probabilidad P (A) = 0.3.\n\na) (0.75 puntos) Un suceso B de probabilidad P (B) = 0.5 es independiente de A. Calcule P (A ∪ B).\n\nb) (0.75 puntos) Otro suceso C cumple P (C | A) = 0.5. Determine P (A ∩ C).\n\nc) (1 punto) Si se tiene un suceso D tal que P (A | D) = 0.2 y P (D | A) = 0.5, calcule P (D).",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2023-J-B1", bloque: "Algebra", opcion: "B",
        enunciado: "Dado el sistema\n\n\n\n(a + 1)x + 4y = 0\n(a − 1)y + z = 3\n4x + 2ay + z = 3\n, se pide:\n\na) (1.25 puntos) Discutirlo en función del parámetro a.\n\nb) (0.5 puntos) Resolverlo para a = 3.\n\nc) (0.75 puntos) Resolverlo para a = 5.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2023-J-B2", bloque: "Analisis", opcion: "B",
        enunciado: "Dada la función real de variable real definida sobre su dominio como f (x) =\n\n\t\t\t\n\t\t\t\nx2\n2 + x2 si x ≤ −1\n2x2\n3 − 3x si x > −1\n, se pide:\n\na) (0.75 puntos) Estudiar la continuidad de la función en R.\n\nb) (1 punto) Calcular el siguiente límite: lim\nx→−∞ f (x)2x2−1.\n\nc) (0.75 puntos) Calcular la siguiente integral:\nZ 0\n−1\nf (x)dx.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2023-J-B3", bloque: "Geometria", opcion: "B",
        enunciado: "Dada la recta r ≡ x − 1\n2 = y\n1 = z + 1\n−2 , el plano π : x − z = 2 y el punto A(1, 1, 1), se pide:\n\na) (0.75 puntos) Estudiar la posición relativa de r y π y calcular su intersección, si existe.\n\nb) (0.75 puntos) Calcular la proyección ortogonal del punto A sobre el plano π.\n\nc) (1 punto) Calcular el punto simétrico del punto A con respecto a la recta r.",
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
        enunciado: "Dado el siguiente sistema de ecuaciones lineales dependientes del parámetro real m:\n\n\n\nx − 2my + z = 1\nmx + 2y − z = −1\nx − y + z = 1\n.\n\na) (2 puntos) Discuta el sistema en función de los valores de m.\n\nb) (0.5 puntos) Resuelva el sistema para el valor m = 1\n2 .",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2022-J-A2", bloque: "Analisis", opcion: "A",
        enunciado: "Sea la función f (x) =\n{ x3e−1/x2\nsi x̸ = 0\n0 si x = 0 .\n\na) (1 punto) Estudie la continuidad y derivabilidad de f (x) en x = 0.\n\nb) (0.5 puntos) Estudie si f (x) presenta algún tipo de simetría par o impar.\n\nc) (1 punto) Calcule la siguiente integral:\nZ 2\n1\nf (x)\nx6 dx.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2022-J-A3", bloque: "Geometria", opcion: "A",
        enunciado: "Con un dispositivo láser situado en el punto P (1, 1, 1) se ha podido seguir la trayectoria de una partícula que se\ndesplaza sobre la recta de ecuaciones r ≡\n{ 2x − y = 10\nx − z = −90 .\n\na) (0.5 puntos) Calcule un vector director de r y la posición de la partícula cuando su trayectoria incide con el\nplano z = 0.\n\nb) (1.25 puntos) Calcule la posición más próxima de la partícula al dispositivo láser.\n\nc) (0.75 puntos) Determine el ángulo entre el plano de ecuación x + y = 2 y la recta r.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2022-J-A4", bloque: "Probabilidad", opcion: "A",
        enunciado: "Según el Instituto Nacional de Estadística, durante el último trimestre de 2020, el porcentaje de mujeres que\npertenecía al conjunto de Consejos de Administración de las empresas que componen el Ibex-35 fue del 27.7 %.\nSe reunieron 10 de estos consejeros.\n\na) (0.75 puntos) Halle la probabilidad de que la mitad fueran mujeres.\n\nb) (0.75 puntos) Calcule la probabilidad de que hubiese al menos un hombre.\n\nc) (1 punto) Determine, aproximando mediante una distribución normal, la probabilidad de que en un congreso\nde doscientos consejeros de estas empresas hubiera como mínimo un 35 % de representación femenina.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2022-J-B1", bloque: "Algebra", opcion: "B",
        enunciado: "Tres primos, Pablo, Alejandro y Alicia, se van a repartir un premio de 9450 euros de forma directamente propor-\ncional a sus edades. La suma de las edades de Pablo y Alejandro excede en tres años al doble de la edad de\nAlicia. Además, la edad de los tres primos juntos es de 45 años. Sabiendo que en el reparto del premio Pablo\nrecibe 420 euros más que Alicia, calcule las edades de los tres primos y el dinero que recibe cada uno por el\npremio.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2022-J-B2", bloque: "Analisis", opcion: "B",
        enunciado: "Sea la función f (x) = x\nx2 + 1 .\n\na) (0.5 puntos) Compruebe si f (x) verifica las hipótesis del Teorema de Bolzano en el intervalo [−1, 1].\n\nb) (1 punto) Calcule y clasifique los extremos relativos de f (x) en R.\n\nc) (1 punto) Determine el área comprendida entre la gráfica de la función f (x) y el eje OX en el intervalo\n[−1, 1].",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2022-J-B3", bloque: "Geometria", opcion: "B",
        enunciado: "Sean el plano π ≡ x + y + z = 1, la recta r1 ≡\n\n\n\nx = 1 + λ\ny = 1 − λ,\nz = −1\nλ ∈ R y el punto P (0, 1, 0).\n\na) (0.5 puntos) Verifique que la recta r1 está contenida en el plano π y que el punto P pertenece al mismo\nplano.\n\nb) (0.75 puntos) Halle una ecuación de la recta contenida en el plano π que pase por P y sea perpendicular a\nr1.\n\nc) (1.25 puntos) Calcule una ecuación de la recta, r2, que pase por P y sea paralela a r1. Halle el área de un\ncuadrado que tenga dos de sus lados sobre las rectas r1 y r2.",
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
        enunciado: "Sean la recta r ≡\n{ −x − y + z = 0\n2x + 3y − z + 1 = 0 y el plano π ≡ 2x + y − z + 3 = 0. Se pide:\n\na) (0.75 puntos) Calcular el ángulo que forman r y π.\n\nb) (1 punto) Hallar el simétrico del punto de intersección de la recta r y el plano π con respecto al plano\nz − y = 0.\n\nc) (0.75 puntos) Determinar la proyección ortogonal de la recta r sobre el plano π.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2021-J-A4", bloque: "Probabilidad", opcion: "A",
        enunciado: "El tiempo de vida de los individuos de cierta especie animal tiene una distribución normal con una media de 8.8\nmeses y una desviación típica de 3 meses.\n\na) (1 punto) ¿Qué porcentaje de individuos de esta especie supera los 10 meses? ¿Qué porcentaje de indivi-\nduos ha vivido entre 7 y 10 meses?\n\nb) (1 punto) Si se toman al azar 4 especímenes, ¿cuál es la probabilidad de que al menos uno no supere los\n10 meses de vida?\n\nc) (0.5 puntos) ¿Qué valor de c es tal que el intervalo (8.8 − c, 8.8 + c) incluye el tiempo de vida (medido en\nmeses) del 98 % de los individuos de esta especie?",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2021-J-B1", bloque: "Algebra", opcion: "B",
        enunciado: "Se considera el siguiente sistema de ecuaciones dependientes del parámetro real a:\nax − 2y + (a − 1)z = 4\n−2x + 3y − 6z = 2\n−ax + y − 6z = 6\n\n\t\n\t\n\na) (2 puntos) Discuta el sistema según los diferentes valores de a.\n\nb) (0.5 puntos) Resuelva el sistema para a = 1.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2021-J-B2", bloque: "Analisis", opcion: "B",
        enunciado: "Se considera la función\nf (x) =\n{ sen x si x < 0\nx ex si x ≥ 0\n\na) (0.75 puntos) Estudie la continuidad y la derivabilidad de f en x = 0.\n\nb) (1 punto) Estudie los intervalos de crecimiento y decrecimiento de f restringida a (−π, 2). Demuestre que\nexiste un punto x0 ∈ [0, 1] de manera que f (x0) = 2.\n\nc) (0.75 puntos) Calcule ∫ 1\n− π\n2\nf (x)dx.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2021-J-B3", bloque: "Geometria", opcion: "B",
        enunciado: "Sean los planos π1 ≡ x + y = 1 y π2 ≡ x + z = 1.\n\na) (1.5 puntos) Halle los planos paralelos al plano π1 tales que su distancia al origen de coordenadas sea 2.\n\nb) (0.5 puntos) Halle la recta que pasa por el punto (0, 2, 0) y es perpendicular al plano π2.\n\nc) (0.5 puntos) Halle la distancia entre los puntos de intersección del plano π1 con los ejes x e y.",
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
        enunciado: "Se considera el siguiente sistema de ecuaciones dependientes del parámetro real a:\nx + ay + z = a + 1\n−ax + y − z = 2a\n−y + z = a\n\n\t\n\t\nSe pide:\n\na) (2 puntos) Discutir el sistema según los diferentes valores de a.\n\nb) (0.5 puntos) Resolver el sistema para a = 0.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2020-J-A2", bloque: "Analisis", opcion: "A",
        enunciado: "Dadas las funciones f (x) = x3 + 3x2 − 1 y g(x) = 6x, se pide:\n\na) (0.5 puntos) Justificar, usando el teorema adecuado, que existe algún punto en el intervalo [1, 10] en el que\nambas funciones toman el mismo valor.\n\nb) (1 punto) Calcular la ecuación de la recta tangente a la curva y = f (x) con pendiente mínima.\n\nc) (1 punto) Calcular\n∫ 2\n1\nf (x)\ng(x) dx.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2020-J-A3", bloque: "Geometria", opcion: "A",
        enunciado: "Dadas las rectas r ≡\n{ x − y = 2\n3x − z = −1 , s ≡\n\n\t\n\t\nx = −1 + 2λ\ny = −4 − λ\nz = λ\n,\nse pide:\n\na) (1 punto) Calcular la posición relativa de las rectas r y s.\n\nb) (0.5 puntos) Hallar la ecuación del plano perpendicular a la recta r y que pasa por el punto P (2, −1, 5).\n\nc) (1 punto) Encontrar la ecuación del plano paralelo a la recta r que contiene a la recta s.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2020-J-A4", bloque: "Probabilidad", opcion: "A",
        enunciado: "Un arquero aficionado dispone de 4 flechas y dispara a un globo colocado en el centro de una diana. La proba-\nbilidad de alcanzar el blanco en el primer tiro es del 30%. En los lanzamientos sucesivos la puntería se va\nafinando, de manera que en el segundo es del 40%, en el tercero del 50% y en el cuarto del 60%. Se pide:\n\na) (1 punto) Calcular la probabilidad de que el globo haya explotado sin necesidad de hacer el cuarto disparo.\n\nb) (0.5 puntos) Calcular la probabilidad de que el globo siga intacto tras el cuarto disparo.\n\nc) (1 punto) En una exhibición participan diez arqueros profesionales, que aciertan un 85% de sus lanzamien-\ntos. Calcular la probabilidad de que entre los 10 hayan explotado exactamente 6 globos al primer disparo.\nTodas las respuestas deberán estar debidamente justificadas.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2020-J-B1", bloque: "Algebra", opcion: "B",
        enunciado: "Según informa la Asociación Empresarial de Acuicultura de España, durante el año 2016 se comercializaron\nen España doradas, lubinas y rodaballos por un total de 275.8 millones de euros. En dicho informe figura que\nse comercializaron un total de 13740 toneladas de doradas y 23440 toneladas de lubinas. En cuanto a los\nrodaballos, se vendieron 7400 toneladas por un valor de 63.6 millones de euros. Sabiendo que el kilo de dorada\nfue 11 céntimos más caro que el kilo de lubina, se pide calcular el precio del kilo de cada uno de los tres tipos de\npescado anteriores.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2020-J-B2", bloque: "Analisis", opcion: "B",
        enunciado: "Sea la función\nf (x) =\n\n\n\n(x − 1)2 si x ≤ 1\n(x − 1)3 si x > 1\n\na) (0.5 puntos) Estudie su continuidad en [−4, 4].\n\nb) (1 punto) Analice su derivabilidad y crecimiento en [−4, 4].\n\nc) (1 punto) Determine si la función g(x) = f ′(x) está definida, es continua y es derivable en x = 1.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2020-J-B3", bloque: "Geometria", opcion: "B",
        enunciado: "Dados los puntos P (−3, 1, 2) y Q(−1, 0, 1) y el plano π de ecuación x + 2y − 3z = 4, se pide:\n\na) (1 punto) Hallar la proyección de Q sobre π.\n\nb) (0.5 puntos) Escribir la ecuación del plano paralelo a π que pasa por el punto P .\n\nc) (1 punto) Escribir la ecuación del plano perpendicular a π que contiene a los puntos P y Q.",
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
        enunciado: "Dadas la matrices A =\n\n\n1 3 4 1\n1 a 2 2 − a\n−1 2 a a − 2\n\n y M =\n\n\n\n\n1 0 0\n0 1 0\n0 0 0\n0 0 1\n\n\n\n , se pide:\n\na) (1.5 puntos) Estudiar el rango de A en función del parámetro real a.\n\nb) (1 punto) Calcular, si es posible, la inversa de la matriz AM para el caso a = 0.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2019-J-A2", bloque: "Analisis", opcion: "A",
        enunciado: "Dada f (x) = ln(x)\nx , donde ln denota el logaritmo neperiano, definida para x > 0, se pide:\n\na) (0.5 puntos) Calcular, en caso de que exista, una asíntota horizontal de la curva y = f (x).\n\nb) (1 punto) Encontrar un punto de la curva y = f (x) en el que la recta tangente a dicha curva sea horizontal\ny analizar si dicho punto es un extremo relativo.\n\nc) (1 punto) Calcular el área del recinto acotado limitado por la curva y = f (x) y las rectas y = 0 y x = e.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2019-J-A3", bloque: "Geometria", opcion: "A",
        enunciado: "Dadas la recta r ≡ x − 1\n2 = y − 3\n−2 = z y la recta s que pasa por el punto (2, −5, 1) y tiene dirección (−1, 0, −1), se\npide:\n\na) (1 punto) Estudiar la posición relativa de las dos rectas.\n\nb) (1 punto) Calcular un plano que sea paralelo a r y contenga a s.\n\nc) (0.5 puntos) Calcular un plano perpendicular a la recta r y que pase por el origen de coordenadas.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2019-J-A4", bloque: "Probabilidad", opcion: "A",
        enunciado: "La probabilidad de que un pez de una determinada especie sobreviva más de 5 años es del 10 %. Se pide:\n\na) (1 punto) Si en un acuario tenemos 10 peces de esta especie nacidos este año, hallar la probabilidad de\nque al menos dos de ellos sigan vivos dentro de 5 años.\n\nb) (1.5 puntos) Si en un tanque de una piscifactoría hay 200 peces de esta especie nacidos este mismo año,\nusando una aproximación mediante la distribución normal correspondiente, hallar la probabilidad de que al\ncabo de 5 años hayan sobrevivido al menos 10 de ellos.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2019-J-B1", bloque: "Algebra", opcion: "B",
        enunciado: "Una estudiante pidió en la cafetería 3 bocadillos, 2 refrescos y 2 bolsas de patatas y pagó un total de 19 euros.\nAl mirar la cuenta comprobó que le habían cobrado un bocadillo y una bolsa de patatas de más. Reclamó y le\ndevolvieron 4 euros.\nPara compensar el error, el vendedor le ofreció llevarse un bocadillo y un refresco por solo 3 euros, lo que suponía\nun descuento del 40 % respecto a sus precios originales. ¿Cuáles eran los respectivos precios sin descuento de\nun bocadillo, de un refresco y de una bolsa de patatas?",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2019-J-B2", bloque: "Analisis", opcion: "B",
        enunciado: "Dada la función f (x) = √4x2 − x4, se pide:\n\na) (0.5 puntos) Determinar su dominio.\n\nb) (1.5 puntos) Determinar sus intervalos de crecimiento y de decrecimiento.\n\nc) (0.5 puntos) Calcular los límites laterales lim\nx→0−\nf (x)\nx , lim\nx→0+\nf (x)\nx .",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2019-J-B3", bloque: "Geometria", opcion: "B",
        enunciado: "Dados el punto A(2, 1, 0) y el plano π ≡ 2x + 3y + 4z = 36, se pide:\n\na) (0.75 puntos) Determinar la distancia del punto A al plano π.\n\nb) (1 punto) Hallar las coordenadas del punto del plano π más próximo al punto A.\n\nc) (0.75 puntos) Hallar el punto simétrico de A respecto al plano π.",
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
        enunciado: "Dado el sistema de ecuaciones\n\n\n\nx + my = 1\n−2x − (m + 1)y + z = −1\nx + (2m − 1)y + (m + 2)z = 2 + 2m,\nse pide:\n\na) (2 puntos) Discutir el sistema en función del parámetro m.\n\nb) (0.5 puntos) Resolver el sistema en el caso m = 0.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2018-J-A2", bloque: "Analisis", opcion: "A",
        enunciado: "a) (1.5 puntos) En un experimento en un laboratorio se han realizado 5 medidas del mismo objeto, que han\ndado los resultados siguientes: m1 = 0.92, m2 = 0.94, m3 = 0.89, m4 = 0.90, m5 = 0.91.\nSe tomará como resultado el valor de x tal que la suma de los cuadrados de los errores sea mínima. Es\ndecir, el valor para el que la función E(x) = (x − m1)2 + (x − m2)2 + · · · + (x − m5)2 alcanza el mínimo.\nCalcule dicho valor x.\n\nb) (1 punto) Aplique el método de integración por partes para calcular la integral\n∫ 2\n1\nx2 ln(x)dx, donde ln\nsignifica logaritmo neperiano.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2018-J-A3", bloque: "Geometria", opcion: "A",
        enunciado: "Dados los planos π1 ≡ 4x + 6y − 12z + 1 = 0, π2 ≡ −2x − 3y + 6z − 5 = 0, se pide:\n\na) (1 punto) Calcular el volumen de un cubo que tenga dos de sus caras en dichos planos.\n\nb) (1.5 puntos) Para el cuadrado de vértices consecutivos ABCD, con A(2, 1, 3) y B(1, 2, 3), calcular los\nvértices C y D, sabiendo que C pertenece a los planos π2 y π3 ≡ x − y + z = 2.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2018-J-A4", bloque: "Probabilidad", opcion: "A",
        enunciado: "El 60% de las ventas en unos grandes almacenes corresponden a artículos con precios rebajados. Los clientes\ndevuelven el 15% de los artículos que compran rebajados, porcentaje que disminuye al 8% si los artículos han\nsido adquiridos sin rebajas.\n\na) (1.25 puntos) Determine el porcentaje global de artículos devueltos.\n\nb) (1.25 puntos) ¿Qué porcentaje de artículos devueltos fueron adquiridos con precios rebajados?",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2018-J-B1", bloque: "Algebra", opcion: "B",
        enunciado: "Dadas las matrices A =\n\n\nm 0 2\n−2 4 m\n0 1 −1\n\n y B =\n\n\n−2\n0\n0\n\n, se pide:\n\na) (1 punto) Obtener los valores del parámetro m para los que la matriz A admite inversa.\n\nb) (1 punto) Para m = 0, calcular A · B y A−1 · B.\n\nc) (0.5 puntos) Calcular B · Bt y Bt · B, donde Bt denota la matriz traspuesta de B.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2018-J-B2", bloque: "Analisis", opcion: "B",
        enunciado: "Dada la función f (x) = |x|\n√x2 + 9 , se pide:\n\na) (0.5 puntos) Determinar, si existen, las asíntotas horizontales de f (x).\n\nb) (0.75 puntos) Calcular f ′(4).\n\nc) (1.25 puntos) Hallar el área del recinto limitado por la la curva y = f (x), el eje OX y las rectas x = −1 y\nx = 1.",
        puntuacion: 2.5, criterios: "Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final." },
      { id: "2018-J-B3", bloque: "Geometria", opcion: "B",
        enunciado: "Dados el punto P (1, 1, 1) y las rectas r ≡\n{ 2x + y = 2\n5x + z = 6 , s ≡ x − 2\n−1 = y + 1\n1 = z − 1\n1/3 , se pide:\n\na) (1 punto) Hallar la distancia del punto P a la recta r.\n\nb) (1 punto) Estudiar la posición relativa de las rectas r y s.\n\nc) (0.5 puntos) Hallar el plano perpendicular a la recta s y que pasa por el punto P .",
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

export type TipoPreguntaHistoria = 'tema' | 'comentario' | 'definicion' | 'corta'

export interface PreguntaHistoria {
  id: string
  tipo: TipoPreguntaHistoria
  enunciado: string
  puntuacion: number
  texto_fuente?: string
  conceptos?: string[]
  criterios: string
}

export interface ExamenHistoria {
  id: number
  año: number
  tipo: "Ordinaria" | "Extraordinaria" | "Modelo"
  opcion: "A" | "B"
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
        id: "h-2025-J-A-1", tipo: "tema",
        enunciado: "Desarrolle el tema: La Segunda República Española (1931-1936): etapas políticas y reformas.",
        puntuacion: 4,
        criterios: "Se valorará: contexto histórico y proclamación (0.5 pts), Bienio Reformista y reformas clave (1 pt), Bienio Radical-Cedista y contrarreformas (1 pt), Frente Popular y crisis de 1936 (1 pt), conclusión y valoración histórica (0.5 pts)."
      },
      {
        id: "h-2025-J-A-2", tipo: "comentario",
        enunciado: "Realice el comentario de la siguiente fuente histórica: identifique la naturaleza del texto, analice sus ideas principales y explique el contexto histórico.",
        texto_fuente: "«El Gobierno de la República, al dirigirse por primera vez al país en la plenitud de sus funciones, quiere ante todo afirmar su decidido propósito de respetar escrupulosamente la conciencia individual mediante la libertad de creencias y la práctica de cultos, sin que el Estado en momento alguno pueda pedir al ciudadano revelación de sus convicciones religiosas.» — Constitución de la República Española, 1931.",
        puntuacion: 3,
        criterios: "Naturaleza del texto: tipo, autor, fecha, destinatario (0.5 pts), ideas principales: laicidad, libertad religiosa, separación Iglesia-Estado (1 pt), contexto histórico: proclamación República, debate constitucional, conflicto clerical (1 pt), valoración crítica (0.5 pts)."
      },
      {
        id: "h-2025-J-A-3", tipo: "definicion",
        enunciado: "Defina brevemente (máximo 5 líneas) tres de los siguientes cinco conceptos:",
        conceptos: ["Caciquismo", "Regeneracionismo", "Lerrouxismo", "Anarcosindicalismo", "Frente Popular"],
        puntuacion: 1.5,
        criterios: "0.5 puntos por cada definición correcta. Se valorará precisión histórica, contextualización temporal y claridad expositiva."
      },
      {
        id: "h-2025-J-A-4", tipo: "corta",
        enunciado: "Explique brevemente las causas y consecuencias de la crisis de 1898 en España.",
        puntuacion: 1.5,
        criterios: "Causas: conflictos coloniales, desastre militar, debilidad del sistema restauracionista (0.75 pts). Consecuencias: pérdida de colonias, crisis moral, surgimiento del regeneracionismo y los nacionalismos periféricos (0.75 pts)."
      }
    ]
  },
  {
    id: 2, año: 2025, tipo: "Ordinaria", opcion: "B",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2025-J-B-1", tipo: "tema",
        enunciado: "Desarrolle el tema: La Guerra Civil Española (1936-1939): causas, desarrollo y consecuencias.",
        puntuacion: 4,
        criterios: "Causas políticas, sociales y económicas (0.75 pts), sublevación militar y dimensión internacional (0.75 pts), desarrollo bélico y zonas (1 pt), consecuencias políticas, sociales y culturales (1 pt), valoración histórica (0.5 pts)."
      },
      {
        id: "h-2025-J-B-2", tipo: "comentario",
        enunciado: "Realice el comentario de la siguiente fuente histórica: naturaleza, ideas principales y contexto histórico.",
        texto_fuente: "«Españoles: Francisco Franco acaba de ser elegido Jefe del Gobierno del Estado Español... En sus manos ponemos el destino de la Patria con la absoluta confianza de que su mando sabrá conducirla a la victoria definitiva.» — Junta de Defensa Nacional, Burgos, octubre de 1936.",
        puntuacion: 3,
        criterios: "Naturaleza: proclama militar, bando nacional, 1936 (0.5 pts), ideas: legitimación del mando único, retórica patriótica (1 pt), contexto: inicio de la guerra, unificación del bando sublevado, internacionalización (1 pt), valoración (0.5 pts)."
      },
      {
        id: "h-2025-J-B-3", tipo: "definicion",
        enunciado: "Defina brevemente (máximo 5 líneas) tres de los siguientes cinco conceptos:",
        conceptos: ["Pronunciamiento", "Carlismo", "Anarquismo", "Brigadas Internacionales", "Franquismo"],
        puntuacion: 1.5,
        criterios: "0.5 puntos por cada definición correcta. Se valorará precisión histórica, contextualización y claridad."
      },
      {
        id: "h-2025-J-B-4", tipo: "corta",
        enunciado: "Explique el proceso de transición política española tras la muerte de Franco (1975-1978).",
        puntuacion: 1.5,
        criterios: "Muerte de Franco y proclamación de Juan Carlos I (0.25 pts), Ley para la Reforma Política y primeras elecciones (0.5 pts), Constitución de 1978 y consenso (0.75 pts)."
      }
    ]
  },
  {
    id: 3, año: 2024, tipo: "Ordinaria", opcion: "A",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2024-J-A-1", tipo: "tema",
        enunciado: "Desarrolle el tema: La Restauración Borbónica (1874-1902): el sistema canovista y el turnismo.",
        puntuacion: 4,
        criterios: "Contexto y restauración de Alfonso XII (0.5 pts), sistema canovista y Constitución de 1876 (1 pt), turnismo y partidos dinásticos (1 pt), caciquismo y fraude electoral (1 pt), valoración y crisis del sistema (0.5 pts)."
      },
      {
        id: "h-2024-J-A-2", tipo: "comentario",
        enunciado: "Realice el comentario de la siguiente fuente histórica.",
        texto_fuente: "«La soberanía reside esencialmente en la Nación, y por lo mismo pertenece a esta exclusivamente el derecho de establecer sus leyes fundamentales.» — Constitución de Cádiz, 1812.",
        puntuacion: 3,
        criterios: "Naturaleza: constitución liberal, Cortes de Cádiz, 1812 (0.5 pts), ideas: soberanía nacional, liberalismo, ruptura con el Antiguo Régimen (1 pt), contexto: Guerra de Independencia, crisis del Antiguo Régimen (1 pt), valoración histórica (0.5 pts)."
      },
      {
        id: "h-2024-J-A-3", tipo: "definicion",
        enunciado: "Defina brevemente tres de los siguientes cinco conceptos:",
        conceptos: ["Absolutismo", "Desamortización", "Sufragio censitario", "Turnismo", "Regeneracionismo"],
        puntuacion: 1.5,
        criterios: "0.5 puntos por definición. Precisión histórica y contextualización temporal."
      },
      {
        id: "h-2024-J-A-4", tipo: "corta",
        enunciado: "Explique las causas del pronunciamiento militar de 1936 que desencadenó la Guerra Civil.",
        puntuacion: 1.5,
        criterios: "Polarización política (0.5 pts), conflictividad social y económica (0.5 pts), intervención del ejército (0.5 pts)."
      }
    ]
  },
  {
    id: 4, año: 2024, tipo: "Ordinaria", opcion: "B",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2024-J-B-1", tipo: "tema",
        enunciado: "Desarrolle el tema: La dictadura de Primo de Rivera (1923-1930): causas, etapas y caída.",
        puntuacion: 4,
        criterios: "Causas: crisis de la Restauración, problema de Marruecos, conflictividad social (1 pt), directorio militar (1 pt), directorio civil y fracaso (1 pt), caída y consecuencias (1 pt)."
      },
      {
        id: "h-2024-J-B-2", tipo: "comentario",
        enunciado: "Realice el comentario de la siguiente fuente histórica.",
        texto_fuente: "«Al País y al Ejército: Españoles: Ha llegado para nosotros el momento más temido que esperado de recoger las ansias, de atender el clamoroso requerimiento de cuantos amando la Patria no ven para ella otra salvación que liberarla de los profesionales de la política...» — Manifiesto de Primo de Rivera, 13 de septiembre de 1923.",
        puntuacion: 3,
        criterios: "Naturaleza: manifiesto militar, golpe de estado, 1923 (0.5 pts), ideas: antiparlamentarismo, regeneracionismo autoritario, llamada al ejército (1 pt), contexto: crisis de la Restauración, desastre de Annual, huelgas (1 pt), valoración (0.5 pts)."
      },
      {
        id: "h-2024-J-B-3", tipo: "definicion",
        enunciado: "Defina brevemente tres de los siguientes cinco conceptos:",
        conceptos: ["Caciquismo", "Pistolerismo", "Directorio", "Anarcosindicalismo", "Catalanismo"],
        puntuacion: 1.5,
        criterios: "0.5 puntos por definición correcta."
      },
      {
        id: "h-2024-J-B-4", tipo: "corta",
        enunciado: "Explique las principales reformas del Bienio Reformista de la Segunda República (1931-1933).",
        puntuacion: 1.5,
        criterios: "Reforma agraria (0.5 pts), reforma militar (0.5 pts), reformas educativas y laicización (0.5 pts)."
      }
    ]
  },
  {
    id: 5, año: 2023, tipo: "Ordinaria", opcion: "A",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2023-J-A-1", tipo: "tema",
        enunciado: "Desarrolle el tema: La Transición española a la democracia (1975-1982).",
        puntuacion: 4,
        criterios: "Muerte de Franco y contexto (0.5 pts), Ley para la Reforma Política y Suárez (1 pt), Constitución de 1978 y consenso (1 pt), autonomías y primeras elecciones (0.75 pts), consolidación democrática y 23-F (0.75 pts)."
      },
      {
        id: "h-2023-J-A-2", tipo: "comentario",
        enunciado: "Realice el comentario de la siguiente fuente histórica.",
        texto_fuente: "«Queda derogada la Ley de 4 de enero de 1977, de Reforma Política... Se reconoce a los partidos políticos el derecho a organizarse libremente para concurrir a las elecciones...» — Real Decreto-ley de noviembre de 1977 sobre amnistía y partidos políticos.",
        puntuacion: 3,
        criterios: "Naturaleza: decreto-ley, Transición democrática, 1977 (0.5 pts), ideas: legalización de partidos, amnistía, ruptura pactada (1 pt), contexto: muerte de Franco, reforma política, presión democrática (1 pt), valoración (0.5 pts)."
      },
      {
        id: "h-2023-J-A-3", tipo: "definicion",
        enunciado: "Defina brevemente tres de los siguientes cinco conceptos:",
        conceptos: ["Franquismo", "Technocracy", "Opus Dei", "PCE", "Ruptura democrática"],
        puntuacion: 1.5,
        criterios: "0.5 puntos por definición correcta."
      },
      {
        id: "h-2023-J-A-4", tipo: "corta",
        enunciado: "Explique el papel del ejército durante la Transición española.",
        puntuacion: 1.5,
        criterios: "Posición inicial del ejército franquista (0.5 pts), intentonas golpistas y 23-F (0.5 pts), integración en la democracia y OTAN (0.5 pts)."
      }
    ]
  },
  {
    id: 6, año: 2023, tipo: "Ordinaria", opcion: "B",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2023-J-B-1", tipo: "tema",
        enunciado: "Desarrolle el tema: El reinado de Alfonso XIII y la crisis del sistema de la Restauración (1902-1923).",
        puntuacion: 4,
        criterios: "Contexto y subida al trono (0.5 pts), crisis del turnismo y regeneracionismo (1 pt), Semana Trágica y conflictividad social (1 pt), crisis de 1917 y desastre de Annual (1 pt), conclusión (0.5 pts)."
      },
      {
        id: "h-2023-J-B-2", tipo: "comentario",
        enunciado: "Realice el comentario de la siguiente fuente histórica.",
        texto_fuente: "«La neutralidad de España en la guerra europea es la única política posible para nuestro país en estos momentos. España carece de la preparación militar y económica necesaria para intervenir en un conflicto de estas proporciones.» — Declaración del gobierno español, agosto de 1914.",
        puntuacion: 3,
        criterios: "Naturaleza: declaración gubernamental, neutralidad española, 1914 (0.5 pts), ideas: debilidad militar y económica, pragmatismo político (1 pt), contexto: inicio de la I Guerra Mundial, España dividida entre aliadófilos y germanófilos (1 pt), valoración (0.5 pts)."
      },
      {
        id: "h-2023-J-B-3", tipo: "definicion",
        enunciado: "Defina brevemente tres de los siguientes cinco conceptos:",
        conceptos: ["Regeneracionismo", "Semana Trágica", "Crisis de 1917", "Juntas de Defensa", "Desastre de Annual"],
        puntuacion: 1.5,
        criterios: "0.5 puntos por definición correcta."
      },
      {
        id: "h-2023-J-B-4", tipo: "corta",
        enunciado: "Explique las consecuencias de la Primera Guerra Mundial para España.",
        puntuacion: 1.5,
        criterios: "Beneficios económicos de la neutralidad (0.5 pts), división social y política entre aliadófilos y germanófilos (0.5 pts), inflación y conflictividad social (0.5 pts)."
      }
    ]
  },
  {
    id: 7, año: 2022, tipo: "Ordinaria", opcion: "A",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2022-J-A-1", tipo: "tema",
        enunciado: "Desarrolle el tema: El franquismo (1939-1975): etapas y evolución política.",
        puntuacion: 4,
        criterios: "Autarquía y represión (0.75 pts), aperturismo y tecnocracia (0.75 pts), desarrollismo y cambio social (1 pt), crisis final y tardofranquismo (0.75 pts), valoración histórica (0.75 pts)."
      },
      {
        id: "h-2022-J-A-2", tipo: "comentario",
        enunciado: "Realice el comentario de la siguiente fuente histórica.",
        texto_fuente: "«España es una unidad de destino en lo universal. El servicio a la unidad nacional y a la continuidad histórica de España es deber supremo y tarea colectiva de todos los españoles. Todos los españoles participarán en el Estado a través de la familia, el municipio y el sindicato.» — Fuero de los Españoles, 1945.",
        puntuacion: 3,
        criterios: "Naturaleza: ley fundamental, régimen franquista, 1945 (0.5 pts), ideas: nacionalismo, organicismo, rechazo de la democracia liberal (1 pt), contexto: final de la II Guerra Mundial, apertura internacional del franquismo (1 pt), valoración (0.5 pts)."
      },
      {
        id: "h-2022-J-A-3", tipo: "definicion",
        enunciado: "Defina brevemente tres de los siguientes cinco conceptos:",
        conceptos: ["Autarquía", "Falangismo", "Plan de Estabilización", "Oposición interior", "Aperturismo"],
        puntuacion: 1.5,
        criterios: "0.5 puntos por definición correcta."
      },
      {
        id: "h-2022-J-A-4", tipo: "corta",
        enunciado: "Explique las causas del aislamiento internacional de España tras la Segunda Guerra Mundial.",
        puntuacion: 1.5,
        criterios: "Vinculación con el Eje (0.5 pts), condena de la ONU (0.5 pts), fin del aislamiento y Pactos de Madrid (0.5 pts)."
      }
    ]
  },
  {
    id: 8, año: 2022, tipo: "Ordinaria", opcion: "B",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2022-J-B-1", tipo: "tema",
        enunciado: "Desarrolle el tema: La industrialización en España durante el siglo XIX.",
        puntuacion: 4,
        criterios: "Contexto europeo y retraso español (0.5 pts), industria textil catalana (1 pt), siderurgia vasca y minería (1 pt), ferrocarril y sus efectos (1 pt), valoración del proceso industrializador (0.5 pts)."
      },
      {
        id: "h-2022-J-B-2", tipo: "comentario",
        enunciado: "Realice el comentario de la siguiente fuente histórica.",
        texto_fuente: "«La revolución de septiembre de 1868 ha derrocado para siempre la dinastía de los Borbones... El pueblo español quiere una monarquía democrática con sufragio universal, libertad de cultos, libertad de enseñanza y libertad de imprenta.» — Manifiesto de la Junta Revolucionaria de Madrid, 1868.",
        puntuacion: 3,
        criterios: "Naturaleza: manifiesto revolucionario, La Gloriosa, 1868 (0.5 pts), ideas: antiborbonicismo, democracia, libertades (1 pt), contexto: crisis del liberalismo moderado, unionismo (1 pt), valoración (0.5 pts)."
      },
      {
        id: "h-2022-J-B-3", tipo: "definicion",
        enunciado: "Defina brevemente tres de los siguientes cinco conceptos:",
        conceptos: ["Carlismo", "Progresismo", "Sexenio Democrático", "Cantón", "Restauración"],
        puntuacion: 1.5,
        criterios: "0.5 puntos por definición correcta."
      },
      {
        id: "h-2022-J-B-4", tipo: "corta",
        enunciado: "Explique el proceso de desamortización en España durante el siglo XIX.",
        puntuacion: 1.5,
        criterios: "Desamortización de Mendizábal (0.5 pts), Desamortización de Madoz (0.5 pts), consecuencias sociales y económicas (0.5 pts)."
      }
    ]
  },
  {
    id: 9, año: 2021, tipo: "Ordinaria", opcion: "A",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2021-J-A-1", tipo: "tema",
        enunciado: "Desarrolle el tema: La crisis del Antiguo Régimen en España (1788-1833).",
        puntuacion: 4,
        criterios: "Carlos IV y Godoy (0.5 pts), Guerra de Independencia y Cortes de Cádiz (1 pt), Constitución de 1812 (0.75 pts), Fernando VII y absolutismo (1 pt), emancipación americana (0.75 pts)."
      },
      {
        id: "h-2021-J-A-2", tipo: "comentario",
        enunciado: "Realice el comentario de la siguiente fuente histórica.",
        texto_fuente: "«La Nación española es la reunión de todos los españoles de ambos hemisferios. La Nación española es libre e independiente, y no es ni puede ser patrimonio de ninguna familia ni persona. La soberanía reside esencialmente en la Nación.» — Constitución de 1812, artículos 1-3.",
        puntuacion: 3,
        criterios: "Naturaleza: constitución liberal, Cortes de Cádiz, 1812 (0.5 pts), ideas: soberanía nacional, liberalismo, nación inclusiva (1 pt), contexto: Guerra de Independencia, influencia francesa, crisis del absolutismo (1 pt), valoración (0.5 pts)."
      },
      {
        id: "h-2021-J-A-3", tipo: "definicion",
        enunciado: "Defina brevemente tres de los siguientes cinco conceptos:",
        conceptos: ["Ilustración", "Afrancesado", "Guerrilla", "Absolutismo", "Liberalismo"],
        puntuacion: 1.5,
        criterios: "0.5 puntos por definición correcta."
      },
      {
        id: "h-2021-J-A-4", tipo: "corta",
        enunciado: "Explique las causas y consecuencias de la Guerra de Independencia española (1808-1814).",
        puntuacion: 1.5,
        criterios: "Causas: invasión napoleónica, crisis dinástica (0.75 pts), consecuencias: devastación, Constitución de 1812, inicio del liberalismo (0.75 pts)."
      }
    ]
  },
  {
    id: 10, año: 2021, tipo: "Ordinaria", opcion: "B",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2021-J-B-1", tipo: "tema",
        enunciado: "Desarrolle el tema: Los nacionalismos periféricos en España (finales del XIX - principios del XX).",
        puntuacion: 4,
        criterios: "Contexto general del nacionalismo europeo (0.5 pts), catalanismo político: de la Renaixença al regionalismo (1 pt), nacionalismo vasco: Sabino Arana y el PNV (1 pt), galleguismo y otros regionalismos (0.75 pts), impacto político (0.75 pts)."
      },
      {
        id: "h-2021-J-B-2", tipo: "comentario",
        enunciado: "Realice el comentario de la siguiente fuente histórica.",
        texto_fuente: "«Bizkaya por su independencia. El árbol de Gernika y la ley vieja... Lema del Partido Nacionalista Vasco, fundado por Sabino Arana en 1895.»",
        puntuacion: 3,
        criterios: "Naturaleza: lema político, PNV, 1895 (0.5 pts), ideas: independentismo vasco, foralismo, identidad étnica y religiosa (1 pt), contexto: industrialización del País Vasco, inmigración, crisis de 1898 (1 pt), valoración (0.5 pts)."
      },
      {
        id: "h-2021-J-B-3", tipo: "definicion",
        enunciado: "Defina brevemente tres de los siguientes cinco conceptos:",
        conceptos: ["Renaixença", "Foralismo", "Lliga Regionalista", "PNV", "Catalanismo"],
        puntuacion: 1.5,
        criterios: "0.5 puntos por definición correcta."
      },
      {
        id: "h-2021-J-B-4", tipo: "corta",
        enunciado: "Explique el impacto del Desastre del 98 en la política española.",
        puntuacion: 1.5,
        criterios: "Pérdida de las últimas colonias (0.5 pts), crisis moral y política (0.5 pts), surgimiento del regeneracionismo (0.5 pts)."
      }
    ]
  },
  {
    id: 11, año: 2020, tipo: "Ordinaria", opcion: "A",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2020-J-A-1", tipo: "tema",
        enunciado: "Desarrolle el tema: La España del siglo XVIII: los Borbones y las reformas ilustradas.",
        puntuacion: 4,
        criterios: "Cambio dinástico y Guerra de Sucesión (0.5 pts), Decretos de Nueva Planta y centralización (1 pt), reformas económicas y sociales (1 pt), Carlos III y el despotismo ilustrado (1 pt), valoración (0.5 pts)."
      },
      {
        id: "h-2020-J-A-2", tipo: "comentario",
        enunciado: "Realice el comentario de la siguiente fuente histórica.",
        texto_fuente: "«Todo para el pueblo pero sin el pueblo.» — Frase atribuida al despotismo ilustrado del siglo XVIII.",
        puntuacion: 3,
        criterios: "Naturaleza: aforismo político, Ilustración, siglo XVIII (0.5 pts), ideas: paternalismo reformista, exclusión popular, reformismo desde arriba (1 pt), contexto: Ilustración europea, reformas borbónicas, límites del absolutismo ilustrado (1 pt), valoración crítica (0.5 pts)."
      },
      {
        id: "h-2020-J-A-3", tipo: "definicion",
        enunciado: "Defina brevemente tres de los siguientes cinco conceptos:",
        conceptos: ["Decreto de Nueva Planta", "Regalismo", "Ilustración", "Sociedades Económicas", "Despotismo ilustrado"],
        puntuacion: 1.5,
        criterios: "0.5 puntos por definición correcta."
      },
      {
        id: "h-2020-J-A-4", tipo: "corta",
        enunciado: "Explique las causas y consecuencias de la Guerra de Sucesión española (1701-1713).",
        puntuacion: 1.5,
        criterios: "Causas: muerte de Carlos II, rivalidad Francia-Austria (0.75 pts), consecuencias: entronización de los Borbones, Tratado de Utrecht, pérdidas territoriales (0.75 pts)."
      }
    ]
  },
  {
    id: 12, año: 2020, tipo: "Ordinaria", opcion: "B",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2020-J-B-1", tipo: "tema",
        enunciado: "Desarrolle el tema: El liberalismo español durante el reinado de Isabel II (1833-1868).",
        puntuacion: 4,
        criterios: "Regencias y primera guerra carlista (0.5 pts), Moderados y Constitución de 1845 (1 pt), Progresistas y Constitución de 1837 (1 pt), Unión Liberal y alternancia (0.75 pts), crisis final del reinado (0.75 pts)."
      },
      {
        id: "h-2020-J-B-2", tipo: "comentario",
        enunciado: "Realice el comentario de la siguiente fuente histórica.",
        texto_fuente: "«Doña Isabel Segunda, por la gracia de Dios y la Constitución de la Monarquía española, Reina de las Españas... Los españoles elegirán a sus representantes por sufragio directo...» — Constitución de 1837.",
        puntuacion: 3,
        criterios: "Naturaleza: constitución liberal, regencia de Espartero, 1837 (0.5 pts), ideas: soberanía compartida, sufragio directo, monarquía constitucional (1 pt), contexto: guerra carlista, consolidación del liberalismo, revolución liberal (1 pt), valoración (0.5 pts)."
      },
      {
        id: "h-2020-J-B-3", tipo: "definicion",
        enunciado: "Defina brevemente tres de los siguientes cinco conceptos:",
        conceptos: ["Carlismo", "Moderantismo", "Progresismo", "Pronunciamiento", "Desamortización"],
        puntuacion: 1.5,
        criterios: "0.5 puntos por definición correcta."
      },
      {
        id: "h-2020-J-B-4", tipo: "corta",
        enunciado: "Explique las principales características del Carlismo.",
        puntuacion: 1.5,
        criterios: "Base social y geográfica (0.5 pts), ideología tradicionalista y foralismo (0.5 pts), tres guerras carlistas (0.5 pts)."
      }
    ]
  },
  {
    id: 13, año: 2019, tipo: "Ordinaria", opcion: "A",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2019-J-A-1", tipo: "tema",
        enunciado: "Desarrolle el tema: La Segunda República Española: el Bienio Reformista (1931-1933).",
        puntuacion: 4,
        criterios: "Proclamación de la República y constitución (0.75 pts), reformas laicas y educativas (0.75 pts), reforma agraria (1 pt), reforma militar (0.75 pts), oposición y crisis del bienio (0.75 pts)."
      },
      {
        id: "h-2019-J-A-2", tipo: "comentario",
        enunciado: "Realice el comentario de la siguiente fuente histórica.",
        texto_fuente: "«España se constituye en República democrática de trabajadores de toda clase, que se organiza en régimen de Libertad y de Justicia. Los poderes de todos sus órganos emanan del pueblo. La República protege igualmente a todos los ciudadanos ante la ley.» — Constitución española de 1931, artículo 1.",
        puntuacion: 3,
        criterios: "Naturaleza: constitución republicana, 1931 (0.5 pts), ideas: república democrática, soberanía popular, igualdad jurídica (1 pt), contexto: proclamación de la República, caída de la monarquía, debate constituyente (1 pt), valoración (0.5 pts)."
      },
      {
        id: "h-2019-J-A-3", tipo: "definicion",
        enunciado: "Defina brevemente tres de los siguientes cinco conceptos:",
        conceptos: ["Sufragio universal", "Estatuto de Autonomía", "Reforma agraria", "Laicismo", "Azañismo"],
        puntuacion: 1.5,
        criterios: "0.5 puntos por definición correcta."
      },
      {
        id: "h-2019-J-A-4", tipo: "corta",
        enunciado: "Explique las causas de la caída de la monarquía de Alfonso XIII.",
        puntuacion: 1.5,
        criterios: "Crisis política y desprestigio (0.5 pts), dictadura de Primo de Rivera (0.5 pts), resultados electorales de abril de 1931 (0.5 pts)."
      }
    ]
  },
  {
    id: 14, año: 2019, tipo: "Ordinaria", opcion: "B",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2019-J-B-1", tipo: "tema",
        enunciado: "Desarrolle el tema: La España de la posguerra: la autarquía franquista (1939-1959).",
        puntuacion: 4,
        criterios: "Contexto de la posguerra y represión (0.75 pts), autarquía económica y sus consecuencias (1 pt), aislamiento internacional y supervivencia (0.75 pts), pilares del régimen (1 pt), agotamiento del modelo autárquico (0.5 pts)."
      },
      {
        id: "h-2019-J-B-2", tipo: "comentario",
        enunciado: "Realice el comentario de la siguiente fuente histórica.",
        texto_fuente: "«La ONU condena el régimen de Franco en España y recomienda que los Estados miembros retiren sus embajadores de Madrid.» — Resolución de la Asamblea General de la ONU, diciembre de 1946.",
        puntuacion: 3,
        criterios: "Naturaleza: resolución internacional, condena del franquismo, 1946 (0.5 pts), ideas: rechazo del fascismo, aislamiento diplomático, democracia internacional (1 pt), contexto: fin de la II Guerra Mundial, victoria aliada, Franco y el Eje (1 pt), valoración: supervivencia del franquismo pese al aislamiento (0.5 pts)."
      },
      {
        id: "h-2019-J-B-3", tipo: "definicion",
        enunciado: "Defina brevemente tres de los siguientes cinco conceptos:",
        conceptos: ["Autarquía", "Estraperlo", "Movimiento Nacional", "Sindicato Vertical", "Maquis"],
        puntuacion: 1.5,
        criterios: "0.5 puntos por definición correcta."
      },
      {
        id: "h-2019-J-B-4", tipo: "corta",
        enunciado: "Explique los Pactos de Madrid de 1953 y su significado para el franquismo.",
        puntuacion: 1.5,
        criterios: "Acuerdos con EE.UU. y el Vaticano (0.5 pts), fin del aislamiento (0.5 pts), bases militares americanas y legitimación internacional (0.5 pts)."
      }
    ]
  },
  {
    id: 15, año: 2018, tipo: "Ordinaria", opcion: "A",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2018-J-A-1", tipo: "tema",
        enunciado: "Desarrolle el tema: El reinado de los Reyes Católicos (1474-1516): política interior y exterior.",
        puntuacion: 4,
        criterios: "Unión dinástica y consolidación (0.5 pts), política interior: pacificación y centralización (1 pt), expansión exterior: conquista de Granada y Navarra (0.75 pts), descubrimiento de América (0.75 pts), valoración del legado (1 pt)."
      },
      {
        id: "h-2018-J-A-2", tipo: "comentario",
        enunciado: "Realice el comentario de la siguiente fuente histórica.",
        texto_fuente: "«Yo, el Rey. Por cuanto el Almirante don Cristóbal Colón... descubrió e ganó con sus naos y con la gente que llevó ciertas islas e tierra firme en el mar Océano... por ende es mi merced y voluntad que vos el dicho don Cristóbal Colón seáis Almirante del mar Océano.» — Capitulaciones de Santa Fe, 1492.",
        puntuacion: 3,
        criterios: "Naturaleza: capitulaciones, Reyes Católicos, 1492 (0.5 pts), ideas: acuerdo previo al descubrimiento, títulos y privilegios de Colón (1 pt), contexto: final de la Reconquista, búsqueda de ruta a Asia, proyecto colombino (1 pt), valoración histórica (0.5 pts)."
      },
      {
        id: "h-2018-J-A-3", tipo: "definicion",
        enunciado: "Defina brevemente tres de los siguientes cinco conceptos:",
        conceptos: ["Reconquista", "Santa Hermandad", "Inquisición española", "Conquista de América", "Política matrimonial"],
        puntuacion: 1.5,
        criterios: "0.5 puntos por definición correcta."
      },
      {
        id: "h-2018-J-A-4", tipo: "corta",
        enunciado: "Explique la importancia del descubrimiento de América para España.",
        puntuacion: 1.5,
        criterios: "Impacto económico: metales preciosos (0.5 pts), construcción del Imperio colonial (0.5 pts), consecuencias demográficas y culturales (0.5 pts)."
      }
    ]
  },
  {
    id: 16, año: 2018, tipo: "Ordinaria", opcion: "B",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2018-J-B-1", tipo: "tema",
        enunciado: "Desarrolle el tema: El desarrollismo franquista y el cambio social en España (1959-1975).",
        puntuacion: 4,
        criterios: "Plan de Estabilización de 1959 (0.75 pts), planes de desarrollo y crecimiento económico (1 pt), éxodo rural y cambio demográfico (0.75 pts), aperturismo y cambio social (0.75 pts), oposición y crisis final del franquismo (0.75 pts)."
      },
      {
        id: "h-2018-J-B-2", tipo: "comentario",
        enunciado: "Realice el comentario de la siguiente fuente histórica.",
        texto_fuente: "«El Plan de Estabilización tiene por objeto restablecer el equilibrio de la economía española... suprimir los obstáculos que se oponen a una mayor productividad... y hacer posible la integración de la economía española en los grandes mercados internacionales.» — Decreto-ley del Plan de Estabilización, julio de 1959.",
        puntuacion: 3,
        criterios: "Naturaleza: decreto económico, franquismo, 1959 (0.5 pts), ideas: apertura económica, fin de la autarquía, integración internacional (1 pt), contexto: agotamiento del modelo autárquico, presión del FMI, tecnocracia del Opus Dei (1 pt), valoración (0.5 pts)."
      },
      {
        id: "h-2018-J-B-3", tipo: "definicion",
        enunciado: "Defina brevemente tres de los siguientes cinco conceptos:",
        conceptos: ["Tecnocracia", "Opus Dei", "Emigración interior", "Turismo de masas", "ETA"],
        puntuacion: 1.5,
        criterios: "0.5 puntos por definición correcta."
      },
      {
        id: "h-2018-J-B-4", tipo: "corta",
        enunciado: "Explique el origen y la evolución de ETA durante el franquismo.",
        puntuacion: 1.5,
        criterios: "Fundación de ETA en 1959 (0.5 pts), ideología nacionalista vasca y antifranquismo (0.5 pts), atentado de Carrero Blanco y represión (0.5 pts)."
      }
    ]
  },
  {
    id: 17, año: 2017, tipo: "Ordinaria", opcion: "A",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2017-J-A-1", tipo: "tema",
        enunciado: "Desarrolle el tema: La España del Siglo de Oro: los Austrias mayores (Carlos I y Felipe II).",
        puntuacion: 4,
        criterios: "Carlos I: herencia y política imperial (1 pt), conflictos internos: comuneros y germanías (0.75 pts), Felipe II: monarquía hispánica y hegemonía (1 pt), conflictos religiosos y crisis (0.75 pts), valoración del Imperio (0.5 pts)."
      },
      {
        id: "h-2017-J-A-2", tipo: "comentario",
        enunciado: "Realice el comentario de la siguiente fuente histórica.",
        texto_fuente: "«En el nombre de Dios Todopoderoso, Padre, Hijo y Espíritu Santo... Los Reyes Católicos de España han sometido a su obediencia tierras e islas que no eran conocidas... Nos, Alejandro VI... hacemos donación a vos y a vuestros herederos de todas las islas y tierras firmes descubiertas...» — Bula Inter Caetera, Alejandro VI, 1493.",
        puntuacion: 3,
        criterios: "Naturaleza: bula papal, reparto colonial, 1493 (0.5 pts), ideas: legitimación papal de la conquista, reparto entre España y Portugal (1 pt), contexto: descubrimiento de América, rivalidad hispano-portuguesa, política de los Reyes Católicos (1 pt), valoración (0.5 pts)."
      },
      {
        id: "h-2017-J-A-3", tipo: "definicion",
        enunciado: "Defina brevemente tres de los siguientes cinco conceptos:",
        conceptos: ["Comuneros", "Moriscos", "Hegemonía", "Inquisición", "Erasmismo"],
        puntuacion: 1.5,
        criterios: "0.5 puntos por definición correcta."
      },
      {
        id: "h-2017-J-A-4", tipo: "corta",
        enunciado: "Explique las causas y consecuencias de la rebelión de los comuneros (1520-1521).",
        puntuacion: 1.5,
        criterios: "Causas: llegada de Carlos I, cargos flamencos, fiscalidad (0.75 pts), consecuencias: derrota comunera, reforzamiento del poder real (0.75 pts)."
      }
    ]
  },
  {
    id: 18, año: 2017, tipo: "Ordinaria", opcion: "B",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2017-J-B-1", tipo: "tema",
        enunciado: "Desarrolle el tema: La España democrática (1982-2000): los gobiernos del PSOE y el PP.",
        puntuacion: 4,
        criterios: "Victoria del PSOE en 1982 y modernización (0.75 pts), integración en la CEE y la OTAN (0.75 pts), escándalos y crisis del PSOE (0.75 pts), victoria del PP y alternancia (0.75 pts), consolidación democrática (1 pt)."
      },
      {
        id: "h-2017-J-B-2", tipo: "comentario",
        enunciado: "Realice el comentario de la siguiente fuente histórica.",
        texto_fuente: "«El PSOE ha ganado las elecciones generales del 28 de octubre de 1982 con una mayoría absoluta histórica... Felipe González se convierte en el primer presidente socialista de la democracia española...» — Periódico El País, 29 de octubre de 1982.",
        puntuacion: 3,
        criterios: "Naturaleza: noticia periodística, elecciones 1982 (0.5 pts), ideas: mayoría socialista, cambio político, fin de la UCD (1 pt), contexto: consolidación democrática, desencanto con la UCD, 23-F (1 pt), valoración (0.5 pts)."
      },
      {
        id: "h-2017-J-B-3", tipo: "definicion",
        enunciado: "Defina brevemente tres de los siguientes cinco conceptos:",
        conceptos: ["Estado de las Autonomías", "OTAN", "CEE", "Reconversión industrial", "Pactos de la Moncloa"],
        puntuacion: 1.5,
        criterios: "0.5 puntos por definición correcta."
      },
      {
        id: "h-2017-J-B-4", tipo: "corta",
        enunciado: "Explique el proceso de integración de España en la Comunidad Económica Europea.",
        puntuacion: 1.5,
        criterios: "Solicitud de adhesión (0.5 pts), negociaciones y condiciones (0.5 pts), entrada en 1986 y consecuencias (0.5 pts)."
      }
    ]
  },
  {
    id: 19, año: 2016, tipo: "Ordinaria", opcion: "A",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2016-J-A-1", tipo: "tema",
        enunciado: "Desarrolle el tema: La Primera República española (1873-1874): etapas y fracaso.",
        puntuacion: 4,
        criterios: "Proclamación y contexto (0.5 pts), presidentes y inestabilidad (1 pt), cantonalismo y guerra carlista (1 pt), golpe de Pavía y final (0.75 pts), valoración histórica (0.75 pts)."
      },
      {
        id: "h-2016-J-A-2", tipo: "comentario",
        enunciado: "Realice el comentario de la siguiente fuente histórica.",
        texto_fuente: "«La República ha nacido para resolver los grandes problemas sociales. El primer problema es el hambre. El segundo es el problema regional. La República ha de ser federal o no será.» — Pi i Margall, presidente de la Primera República, 1873.",
        puntuacion: 3,
        criterios: "Naturaleza: discurso político, Primera República, 1873 (0.5 pts), ideas: federalismo, problema social, cuestión regional (1 pt), contexto: Sexenio Democrático, tensiones sociales y territoriales (1 pt), valoración (0.5 pts)."
      },
      {
        id: "h-2016-J-A-3", tipo: "definicion",
        enunciado: "Defina brevemente tres de los siguientes cinco conceptos:",
        conceptos: ["Federalismo", "Cantonalismo", "Internacionalismo obrero", "Carlismo", "Pronunciamiento"],
        puntuacion: 1.5,
        criterios: "0.5 puntos por definición correcta."
      },
      {
        id: "h-2016-J-A-4", tipo: "corta",
        enunciado: "Explique las causas del fracaso de la Primera República española.",
        puntuacion: 1.5,
        criterios: "Inestabilidad política (0.5 pts), conflictos internos: cantonalismo y carlismo (0.5 pts), falta de apoyo social y pronunciamiento de Pavía (0.5 pts)."
      }
    ]
  },
  {
    id: 20, año: 2016, tipo: "Ordinaria", opcion: "B",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2016-J-B-1", tipo: "tema",
        enunciado: "Desarrolle el tema: La España de los Austrias menores: decadencia del Imperio (siglo XVII).",
        puntuacion: 4,
        criterios: "Felipe III y el valido Lerma (0.75 pts), Felipe IV y el Conde-Duque de Olivares (1 pt), crisis de 1640: Portugal y Cataluña (1 pt), Carlos II y el problema sucesorio (0.75 pts), valoración de la decadencia (0.5 pts)."
      },
      {
        id: "h-2016-J-B-2", tipo: "comentario",
        enunciado: "Realice el comentario de la siguiente fuente histórica.",
        texto_fuente: "«Esta Monarquía está tan apretada de necesidades que la menor cosa la puede acabar... Los enemigos son muchos y los medios pocos. No hay dinero, no hay crédito, no hay gente, no hay armas...» — Memorial del Conde-Duque de Olivares, 1643.",
        puntuacion: 3,
        criterios: "Naturaleza: memorial político, valido de Felipe IV, 1643 (0.5 pts), ideas: crisis financiera, agotamiento militar, multiplicidad de frentes (1 pt), contexto: Guerra de los Treinta Años, revueltas de 1640, decadencia imperial (1 pt), valoración (0.5 pts)."
      },
      {
        id: "h-2016-J-B-3", tipo: "definicion",
        enunciado: "Defina brevemente tres de los siguientes cinco conceptos:",
        conceptos: ["Valido", "Unión de Armas", "Pax Hispánica", "Moriscos", "Picaresca"],
        puntuacion: 1.5,
        criterios: "0.5 puntos por definición correcta."
      },
      {
        id: "h-2016-J-B-4", tipo: "corta",
        enunciado: "Explique las causas y consecuencias de la expulsión de los moriscos (1609).",
        puntuacion: 1.5,
        criterios: "Causas: presión religiosa y política, temor a quinta columna (0.75 pts), consecuencias: despoblación de Valencia y Aragón, pérdidas económicas (0.75 pts)."
      }
    ]
  },
  {
    id: 21, año: 2015, tipo: "Ordinaria", opcion: "A",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2015-J-A-1", tipo: "tema",
        enunciado: "Desarrolle el tema: La Guerra de la Independencia española (1808-1814) y las Cortes de Cádiz.",
        puntuacion: 4,
        criterios: "Causas: invasión napoleónica, abdicaciones de Bayona (0.75 pts), guerra: guerrillas y apoyo inglés (1 pt), Cortes de Cádiz y Constitución de 1812 (1 pt), fin de la guerra y retorno de Fernando VII (0.75 pts), valoración histórica (0.5 pts)."
      },
      {
        id: "h-2015-J-A-2", tipo: "comentario",
        enunciado: "Realice el comentario de la siguiente fuente histórica.",
        texto_fuente: "«Pueblo de Madrid: cuando llegué a esta ciudad encontré al ejército francés apoderándose de sus plazas. El honor español me llama a la defensa de la patria... ¡Viva Fernando VII! ¡Muera el traidor Godoy!» — Proclama del Dos de Mayo, 1808.",
        puntuacion: 3,
        criterios: "Naturaleza: proclama popular, Dos de Mayo, 1808 (0.5 pts), ideas: resistencia antifrancesa, legitimismo fernandino, patriotismo (1 pt), contexto: crisis de la monarquía española, Motín de Aranjuez, abdicaciones de Bayona (1 pt), valoración (0.5 pts)."
      },
      {
        id: "h-2015-J-A-3", tipo: "definicion",
        enunciado: "Defina brevemente tres de los siguientes cinco conceptos:",
        conceptos: ["Afrancesado", "Guerrilla", "Soberanía nacional", "Absolutismo", "Ilustración"],
        puntuacion: 1.5,
        criterios: "0.5 puntos por definición correcta."
      },
      {
        id: "h-2015-J-A-4", tipo: "corta",
        enunciado: "Explique las principales aportaciones de la Constitución de 1812.",
        puntuacion: 1.5,
        criterios: "Soberanía nacional y sufragio (0.5 pts), separación de poderes y monarquía constitucional (0.5 pts), derechos y libertades individuales (0.5 pts)."
      }
    ]
  },
  {
    id: 22, año: 2015, tipo: "Ordinaria", opcion: "B",
    asignatura: "Historia de España", comunidad: "Madrid",
    preguntas: [
      {
        id: "h-2015-J-B-1", tipo: "tema",
        enunciado: "Desarrolle el tema: La dictadura franquista: estructura política y bases sociales (1939-1959).",
        puntuacion: 4,
        criterios: "Bases del régimen: Ejército, Iglesia, Falange y Monarquía (1 pt), pilares ideológicos: nacionalcatolicismo (1 pt), represión y control social (1 pt), bases sociales y apoyos (0.75 pts), valoración (0.25 pts)."
      },
      {
        id: "h-2015-J-B-2", tipo: "comentario",
        enunciado: "Realice el comentario de la siguiente fuente histórica.",
        texto_fuente: "«España es una unidad de destino en lo universal. El servicio a la unidad nacional y a la continuidad histórica de España es deber supremo y tarea colectiva de todos los españoles. Todos los españoles participarán en el Estado a través de la familia, el municipio y el sindicato.» — Principios del Movimiento Nacional, 1958.",
        puntuacion: 3,
        criterios: "Naturaleza: ley fundamental, tardofranquismo, 1958 (0.5 pts), ideas: organicismo, rechazo del liberalismo y del marxismo, participación controlada (1 pt), contexto: reformismo tecnocrático, apertura internacional, fin de la autarquía (1 pt), valoración (0.5 pts)."
      },
      {
        id: "h-2015-J-B-3", tipo: "definicion",
        enunciado: "Defina brevemente tres de los siguientes cinco conceptos:",
        conceptos: ["Nacionalcatolicismo", "Falangismo", "Represión franquista", "Exilio republicano", "Autarquía"],
        puntuacion: 1.5,
        criterios: "0.5 puntos por definición correcta."
      },
      {
        id: "h-2015-J-B-4", tipo: "corta",
        enunciado: "Explique las principales características del exilio republicano español.",
        puntuacion: 1.5,
        criterios: "Causas y destinos del exilio (0.5 pts), perfil de los exiliados: intelectuales y políticos (0.5 pts), actividad política y cultural en el exilio (0.5 pts)."
      }
    ]
  }
]
