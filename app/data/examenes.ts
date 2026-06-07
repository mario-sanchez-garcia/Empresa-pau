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
      { id:"2025-J-1A", bloque:"Algebra", opcion:"A",
        enunciado:`Se considera la matriz $A = \\begin{pmatrix} 1 & 2 \\\\ 3 & k \\end{pmatrix}$.\n\na) Halla los valores de $k$ para los que $A$ no es invertible.\n\nb) Para $k=5$, calcula $A^{-1}$.\n\nc) Resuelve $A\\cdot X = \\begin{pmatrix} 1 \\\\ 2 \\end{pmatrix}$ para $k=5$.`,
        puntuacion:2.5, criterios:"Determinante e igualacion a cero (0.5 pts), inversa k=5 (1 pt), sistema (1 pt)." },
      { id:"2025-J-1B", bloque:"Algebra", opcion:"B",
        enunciado:`Discute segun $a$ y resuelve para $a=0$:\n$$\\begin{cases} x+2y-z=3 \\\\ 2x-y+z=1 \\\\ x+ay+2z=b \\end{cases}$$`,
        puntuacion:2.5, criterios:"Rouche-Frobenius (1 pt), discusion (0.75 pts), resolucion a=0 (0.75 pts)." },
      { id:"2025-J-2A", bloque:"Analisis", opcion:"A",
        enunciado:`$f(x)=\\dfrac{x^2-1}{x-1}$ si $x\\neq 1$, $f(1)=a$.\n\na) Continuidad en $x=1$ segun $a$.\n\nb) Para el $a$ que la hace continua, estudia derivabilidad.\n\nc) Grafica.`,
        puntuacion:2.5, criterios:"Limite en x=1 (0.75 pts), continuidad (0.5 pts), derivabilidad (0.75 pts), grafica (0.5 pts)." },
      { id:"2025-J-2B", bloque:"Analisis", opcion:"B",
        enunciado:`$f(x)=x^3-3x+2$.\n\na) Crecimiento, decrecimiento y extremos.\n\nb) $\\displaystyle\\int_0^2 f(x)\\,dx$ e interpretacion.`,
        puntuacion:2.5, criterios:"f'(x) e intervalos (0.75 pts), extremos (0.5 pts), integral (0.75 pts), interpretacion (0.5 pts)." },
      { id:"2025-J-3A", bloque:"Geometria", opcion:"A",
        enunciado:`$A(1,0,2)$, $B(3,1,0)$, $C(0,2,1)$.\n\na) Plano $\\pi$ por $A$, $B$, $C$.\n\nb) Distancia de $D(2,2,2)$ a $\\pi$.\n\nc) ¿$D$ y origen en el mismo lado?`,
        puntuacion:2.5, criterios:"Vectores y vectorial (1 pt), plano (0.5 pts), distancia (0.75 pts), signo (0.25 pts)." },
      { id:"2025-J-3B", bloque:"Geometria", opcion:"B",
        enunciado:`$r: \\dfrac{x-2}{1}=\\dfrac{y}{-1}=\\dfrac{z+1}{2}$ y $\\pi: x+y-z+1=0$.\n\na) Posicion relativa.\n\nb) Punto de interseccion.\n\nc) Angulo recta-plano.`,
        puntuacion:2.5, criterios:"Posicion (0.5 pts), interseccion (1 pt), angulo (1 pt)." },
      { id:"2025-J-4A", bloque:"Probabilidad", opcion:"A",
        enunciado:`60% usa transporte publico: 20% llega tarde. El 40% restante: 5% llega tarde.\n\na) P(llega tarde)\n\nb) P(usa transporte | tarde) — Bayes\n\nc) De 10 personas, P(exactamente 3 lleguen tarde)`,
        puntuacion:2.5, criterios:"Prob. total (0.75 pts), Bayes (0.75 pts), binomial (1 pt)." },
      { id:"2025-J-4B", bloque:"Probabilidad", opcion:"B",
        enunciado:`$X\\sim N(70,8)$.\n\na) $P(62<X<86)$\n\nb) $k$: $P(X>k)=0{,}2$\n\nc) Con $n=16$, P(media $> 72$)`,
        puntuacion:2.5, criterios:"Tipificacion (0.5 pts), a (0.75 pts), b (0.75 pts), media muestral (0.5 pts)." }
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
      { id:"2024-J-1A", bloque:"Algebra", opcion:"A",
        enunciado:`$A=\\begin{pmatrix}2&1&0\\\\1&-1&1\\\\0&1&2\\end{pmatrix}$.\n\na) $\\det(A)$\n\nb) $A^{-1}$\n\nc) $2x+y=3$, $x-y+z=0$, $y+2z=1$`,
        puntuacion:2.5, criterios:"Determinante (0.5 pts), inversa (1.25 pts), sistema (0.75 pts)." },
      { id:"2024-J-1B", bloque:"Algebra", opcion:"B",
        enunciado:`Sistema segun $a$ y $b$:\n$$\\begin{cases} x+y+z=4 \\\\ 2x-y+z=2 \\\\ x+2y+az=b \\end{cases}$$\nResuelve para $a=3$, $b=5$.`,
        puntuacion:2.5, criterios:"Rouche-Frobenius (1 pt), discusion (0.5 pts), resolucion (1 pt)." },
      { id:"2024-J-2A", bloque:"Analisis", opcion:"A",
        enunciado:`$f(x)=x^3-3x^2-9x+2$.\n\na) Crecimiento y decrecimiento.\n\nb) Maximos y minimos.\n\nc) $\\displaystyle\\int_0^3 f(x)\\,dx$`,
        puntuacion:2.5, criterios:"Derivada (0.5 pts), intervalos (0.5 pts), extremos (0.5 pts), integral (0.75 pts), interpretacion (0.25 pts)." },
      { id:"2024-J-2B", bloque:"Analisis", opcion:"B",
        enunciado:`Area acotada por $y=x^2-2x$ e $y=x$.`,
        puntuacion:2.5, criterios:"Interseccion (0.5 pts), integral (0.75 pts), calculo (1 pt), resultado (0.25 pts)." },
      { id:"2024-J-3A", bloque:"Geometria", opcion:"A",
        enunciado:`$r: \\dfrac{x-1}{2}=\\dfrac{y+1}{1}=\\dfrac{z}{-1}$ y $\\pi: x-2y+z-3=0$.\n\na) Posicion relativa.\n\nb) Interseccion.\n\nc) Angulo.`,
        puntuacion:2.5, criterios:"Posicion (0.5 pts), interseccion (1 pt), angulo (1 pt)." },
      { id:"2024-J-3B", bloque:"Geometria", opcion:"B",
        enunciado:`Tetraedro $A(0,0,0)$, $B(2,0,0)$, $C(0,2,0)$, $D(0,0,2)$.\n\na) Volumen.\n\nb) Plano $BCD$.\n\nc) Distancia $A$ a $BCD$.`,
        puntuacion:2.5, criterios:"Volumen (1 pt), plano BCD (0.75 pts), distancia (0.75 pts)." },
      { id:"2024-J-4A", bloque:"Probabilidad", opcion:"A",
        enunciado:`$X\\sim N(50,10)$.\n\na) $P(40<X<65)$\n\nb) $k$: $P(X>k)=0{,}1587$\n\nc) Con $n=25$, P(media $> 53$)`,
        puntuacion:2.5, criterios:"Tipificacion (0.5 pts), a (0.75 pts), b (0.75 pts), media muestral (0.5 pts)." },
      { id:"2024-J-4B", bloque:"Probabilidad", opcion:"B",
        enunciado:`$M_1$ (20%), $M_2$ (30%), $M_3$ (50%). Defectos: 1%, 2%, 3%.\n\na) P(defectuosa)\n\nb) P($M_3$ | defectuosa)`,
        puntuacion:2.5, criterios:"Prob. total (1 pt), Bayes (1.5 pts)." }
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
      { id:"2023-J-1A", bloque:"Algebra", opcion:"A",
        enunciado:`$A=\\begin{pmatrix}2&1\\\\3&2\\end{pmatrix}$. Calcula $A^{-1}$ y comprueba $A\\cdot A^{-1}=I$.`,
        puntuacion:2.5, criterios:"Determinante (0.5 pts), adjunta (1 pt), division (0.5 pts), comprobacion (0.5 pts)." },
      { id:"2023-J-1B", bloque:"Algebra", opcion:"B",
        enunciado:`Sistema con $m$:\n$$\\begin{cases} mx+y=m \\\\ x+my=1 \\end{cases}$$\nDiscute y resuelve para $m=2$.`,
        puntuacion:2.5, criterios:"Determinante (0.75 pts), casos m=1, m=-1, resto (1 pt), resolucion m=2 (0.75 pts)." },
      { id:"2023-J-2A", bloque:"Analisis", opcion:"A",
        enunciado:`Continuidad y derivabilidad en $x=0$:\n$$f(x)=\\begin{cases}x^2+1 & x\\leq 0 \\\\ \\cos x & x>0\\end{cases}$$`,
        puntuacion:2.5, criterios:"Limites laterales (1 pt), derivadas laterales (1 pt), conclusion (0.5 pts)." },
      { id:"2023-J-2B", bloque:"Analisis", opcion:"B",
        enunciado:`Area acotada por $y=x^2$ e $y=2x$.`,
        puntuacion:2.5, criterios:"Interseccion (0.5 pts), integral (1 pt), resultado (1 pt)." },
      { id:"2023-J-3A", bloque:"Geometria", opcion:"A",
        enunciado:`$\\vec{u}=(1,2,-1)$, $\\vec{v}=(2,-1,3)$.\n\na) $\\vec{u}\\cdot\\vec{v}$\n\nb) $\\vec{u}\\times\\vec{v}$\n\nc) Angulo`,
        puntuacion:2.5, criterios:"Escalar (0.5 pts), vectorial (1 pt), angulo (1 pt)." },
      { id:"2023-J-3B", bloque:"Geometria", opcion:"B",
        enunciado:`Plano por $A(1,0,2)$, $B(2,1,0)$, $C(0,3,1)$. Distancia del origen.`,
        puntuacion:2.5, criterios:"Vectores (0.5 pts), vectorial (0.75 pts), plano (0.75 pts), distancia (0.5 pts)." },
      { id:"2023-J-4A", bloque:"Probabilidad", opcion:"A",
        enunciado:`Urna: 4 rojas, 6 azules. 2 sin reemplazo.\n\na) P(dos rojas)\n\nb) P(distinto color)\n\nc) P(al menos una azul)`,
        puntuacion:2.5, criterios:"a (0.75 pts), b (0.75 pts), c (1 pt)." },
      { id:"2023-J-4B", bloque:"Probabilidad", opcion:"B",
        enunciado:`$X\\sim N(100,15)$.\n\na) $P(X>115)$\n\nb) $P(85<X<115)$\n\nc) $k$: $P(X<k)=0{,}9$`,
        puntuacion:2.5, criterios:"Tipificacion (0.5 pts), a (0.75 pts), b (0.75 pts), c (0.5 pts)." }
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
      { id:"2022-J-1A", bloque:"Algebra", opcion:"A",
        enunciado:`Cramer:\n$$\\begin{cases}2x+y-z=3\\\\x-y+2z=1\\\\3x+2y+z=4\\end{cases}$$`,
        puntuacion:2.5, criterios:"Det. principal (0.5 pts), dets. secundarios (1.5 pts), solucion (0.5 pts)." },
      { id:"2022-J-1B", bloque:"Algebra", opcion:"B",
        enunciado:`$A=\\begin{pmatrix}1&0&-1\\\\2&1&0\\\\-1&1&2\\end{pmatrix}$. $\\det(A)$, $A^{-1}$, resuelve $AX=\\begin{pmatrix}1\\\\0\\\\2\\end{pmatrix}$.`,
        puntuacion:2.5, criterios:"Determinante (0.5 pts), inversa (1 pt), sistema (1 pt)." },
      { id:"2022-J-2A", bloque:"Analisis", opcion:"A",
        enunciado:`$\\displaystyle\\int_0^2(x^3-2x+1)\\,dx$ e interpretacion geometrica.`,
        puntuacion:2.5, criterios:"Primitiva (1 pt), limites (1 pt), interpretacion (0.5 pts)." },
      { id:"2022-J-2B", bloque:"Analisis", opcion:"B",
        enunciado:`$f(x)=xe^{-x}$: dominio, asintotas, extremos, inflexion y grafica.`,
        puntuacion:2.5, criterios:"Dominio y asintotas (0.5 pts), monotonia y extremos (0.75 pts), concavidad (0.75 pts), grafica (0.5 pts)." },
      { id:"2022-J-3A", bloque:"Geometria", opcion:"A",
        enunciado:`Plano por $A(1,0,2)$, $B(2,1,0)$, $C(0,3,1)$.`,
        puntuacion:2.5, criterios:"Vectores (0.5 pts), vectorial (1 pt), ecuacion (1 pt)." },
      { id:"2022-J-3B", bloque:"Geometria", opcion:"B",
        enunciado:`$\\pi_1:2x-y+z=4$ y $\\pi_2:x+y-z=1$.\n\na) Posicion relativa.\n\nb) Recta interseccion.\n\nc) Plano perp. a $\\pi_1$ por la recta.`,
        puntuacion:2.5, criterios:"Posicion (0.5 pts), recta (1 pt), plano perpendicular (1 pt)." },
      { id:"2022-J-4A", bloque:"Probabilidad", opcion:"A",
        enunciado:`$X\\sim N(100,15)$.\n\na) $P(X>115)$\n\nb) $P(85<X<115)$\n\nc) $k$: $P(X<k)=0{,}9$`,
        puntuacion:2.5, criterios:"Tipificacion (0.5 pts), a (0.75 pts), b (0.75 pts), c (0.5 pts)." },
      { id:"2022-J-4B", bloque:"Probabilidad", opcion:"B",
        enunciado:`Test 20 preguntas, 4 opciones, al azar.\n\na) P(5 aciertos)\n\nb) P(mas de 3)\n\nc) Esperanza`,
        puntuacion:2.5, criterios:"Binomial p=0.25 (0.5 pts), a (0.75 pts), b (0.75 pts), esperanza (0.5 pts)." }
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
      { id:"2021-J-1A", bloque:"Algebra", opcion:"A",
        enunciado:`Sistema segun $a$ y $b$:\n$$\\begin{cases}x+y+z=6\\\\x+2y+3z=14\\\\x+4y+az=b\\end{cases}$$`,
        puntuacion:2.5, criterios:"Rouche-Frobenius (1 pt), discusion (1 pt), resolucion (0.5 pts)." },
      { id:"2021-J-1B", bloque:"Algebra", opcion:"B",
        enunciado:`$A=\\begin{pmatrix}2&1&-1\\\\0&1&2\\\\1&-1&0\\end{pmatrix}$. $\\det(A)$, $A^{-1}$, $AX=\\begin{pmatrix}1\\\\3\\\\0\\end{pmatrix}$.`,
        puntuacion:2.5, criterios:"Determinante (0.5 pts), inversa (1.25 pts), sistema (0.75 pts)." },
      { id:"2021-J-2A", bloque:"Analisis", opcion:"A",
        enunciado:`Area acotada por $y=4-x^2$ e $y=x+2$.`,
        puntuacion:2.5, criterios:"Interseccion (0.5 pts), integral (1 pt), resultado (1 pt)." },
      { id:"2021-J-2B", bloque:"Analisis", opcion:"B",
        enunciado:`$f(x)=\\dfrac{x^2}{x^2-4}$: dominio, asintotas, monotonia y grafica.`,
        puntuacion:2.5, criterios:"Dominio y asintotas (0.75 pts), monotonia (1 pt), grafica (0.75 pts)." },
      { id:"2021-J-3A", bloque:"Geometria", opcion:"A",
        enunciado:`$A(1,2,3)$, $B(2,0,1)$ y $r:\\frac{x-1}{1}=\\frac{y}{-1}=\\frac{z-1}{2}$.\n\na) Plano por $A$, $B$ paralelo al vector director de $r$.\n\nb) Distancia de $r$ al plano.`,
        puntuacion:2.5, criterios:"Plano (1 pt), distancia recta-plano (1.5 pts)." },
      { id:"2021-J-3B", bloque:"Geometria", opcion:"B",
        enunciado:`Rectas $r:\\frac{x-1}{1}=\\frac{y}{2}=\\frac{z+1}{-1}$ y $s:\\frac{x}{2}=\\frac{y-1}{1}=\\frac{z}{1}$.\n\na) Posicion relativa.\n\nb) Distancia si se cruzan.`,
        puntuacion:2.5, criterios:"Posicion (0.5 pts), cruzadas (0.5 pts), distancia (1.5 pts)." },
      { id:"2021-J-4A", bloque:"Probabilidad", opcion:"A",
        enunciado:`$M_1$ (20%), $M_2$ (30%), $M_3$ (50%). Defectos: 1%, 2%, 3%.\n\na) P(defectuosa)\n\nb) P($M_3$ | defectuosa)`,
        puntuacion:2.5, criterios:"Prob. total (1 pt), Bayes (1.5 pts)." },
      { id:"2021-J-4B", bloque:"Probabilidad", opcion:"B",
        enunciado:`$X\\sim B(10,0{,}3)$.\n\na) $P(X=3)$\n\nb) $P(X\\geq 2)$\n\nc) Esperanza y varianza`,
        puntuacion:2.5, criterios:"Binomial (0.5 pts), a (0.75 pts), b (0.75 pts), E y V (0.5 pts)." }
    ]
  },
  {
    id: 11, año: 2020, tipo: "Ordinaria", asignatura: "Matemáticas II", comunidad: "Madrid",
    preguntas: [
      { id:"2020-J-1A", bloque:"Algebra", opcion:"A",
        enunciado:`$A=\\begin{pmatrix}1&0&-1\\\\2&1&0\\\\-1&1&2\\end{pmatrix}$. $\\det(A)$, $A^{-1}$, $AX=\\begin{pmatrix}1\\\\0\\\\2\\end{pmatrix}$.`,
        puntuacion:2.5, criterios:"Determinante (0.5 pts), inversa (1 pt), sistema (1 pt)." },
      { id:"2020-J-1B", bloque:"Algebra", opcion:"B",
        enunciado:`Sistema segun $a$ y $b$:\n$$\\begin{cases}x-y+2z=1\\\\2x+y-z=3\\\\x+2y+az=b\\end{cases}$$`,
        puntuacion:2.5, criterios:"Rouche-Frobenius (1 pt), discusion (1 pt), resolucion (0.5 pts)." },
      { id:"2020-J-2A", bloque:"Analisis", opcion:"A",
        enunciado:`$f(x)=\\dfrac{x^2}{x^2-4}$: dominio, asintotas, monotonia y grafica.`,
        puntuacion:2.5, criterios:"Dominio y asintotas (0.75 pts), monotonia (1 pt), grafica (0.75 pts)." },
      { id:"2020-J-2B", bloque:"Analisis", opcion:"B",
        enunciado:`$f(x)=x^3-6x^2+9x-4$: extremos, inflexion y grafica.`,
        puntuacion:2.5, criterios:"Extremos (0.75 pts), inflexion (0.5 pts), grafica (0.75 pts), derivada (0.5 pts)." },
      { id:"2020-J-3A", bloque:"Geometria", opcion:"A",
        enunciado:`$P(1,-1,2)$ y $\\pi:2x-y+2z-7=0$.\n\na) Distancia $P$ a $\\pi$.\n\nb) Simetrico.\n\nc) Recta perpendicular.`,
        puntuacion:2.5, criterios:"Distancia (0.75 pts), simetrico (1 pt), recta (0.75 pts)." },
      { id:"2020-J-3B", bloque:"Geometria", opcion:"B",
        enunciado:`$A(0,1,2)$, $B(1,-1,0)$, $C(2,0,3)$.\n\na) Recta $AB$.\n\nb) Plano $ABC$.\n\nc) ¿$D(3,1,4)$ en el plano?`,
        puntuacion:2.5, criterios:"Recta AB (0.5 pts), plano (1.25 pts), D (0.75 pts)." },
      { id:"2020-J-4A", bloque:"Probabilidad", opcion:"A",
        enunciado:`Bombillas $X\\sim N(1000,50)$.\n\na) % duran mas de 1080 h.\n\nb) % entre 950 y 1050.\n\nc) $k$: 95% dura mas de $k$.`,
        puntuacion:2.5, criterios:"Tipificacion (0.5 pts), a (0.75 pts), b (0.75 pts), c (0.5 pts)." },
      { id:"2020-J-4B", bloque:"Probabilidad", opcion:"B",
        enunciado:`100 estudiantes: 60 Mates, 50 Fisica, 30 ambas.\n\na) P(Mates o Fisica)\n\nb) ¿Independientes?\n\nc) P(Mates | Fisica)`,
        puntuacion:2.5, criterios:"Union (0.75 pts), independencia (0.75 pts), condicionada (1 pt)." }
    ]
  },
  {
    id: 12, año: 2019, tipo: "Ordinaria", asignatura: "Matemáticas II", comunidad: "Madrid",
    preguntas: [
      { id:"2019-J-1A", bloque:"Algebra", opcion:"A",
        enunciado:`Sistema con $m$:\n$$\\begin{cases}mx+y=1\\\\x+my=1\\end{cases}$$\n\na) Discute segun $m$.\n\nb) Resuelve para $m=2$.`,
        puntuacion:2.5, criterios:"Determinante en m (0.75 pts), casos (1 pt), resolucion m=2 (0.75 pts)." },
      { id:"2019-J-1B", bloque:"Algebra", opcion:"B",
        enunciado:`$A=\\begin{pmatrix}2&-1&0\\\\1&1&2\\\\0&1&-1\\end{pmatrix}$. $\\det(A)$ y $A^{-1}$.`,
        puntuacion:2.5, criterios:"Determinante (0.75 pts), cofactores (1 pt), inversa (0.75 pts)." },
      { id:"2019-J-2A", bloque:"Analisis", opcion:"A",
        enunciado:`$f(x)=x^3-6x^2+9x-4$: extremos, inflexion y grafica.`,
        puntuacion:2.5, criterios:"f'(x) (0.75 pts), extremos (0.75 pts), inflexion (0.5 pts), grafica (0.5 pts)." },
      { id:"2019-J-2B", bloque:"Analisis", opcion:"B",
        enunciado:`$\\displaystyle\\int_1^e\\dfrac{\\ln x}{x}\\,dx$ y area de la region acotada por $y=\\dfrac{\\ln x}{x}$, eje $OX$, $x=1$ y $x=e$.`,
        puntuacion:2.5, criterios:"Integral por sustitucion (1.5 pts), area (1 pt)." },
      { id:"2019-J-3A", bloque:"Geometria", opcion:"A",
        enunciado:`$A(0,1,2)$, $B(1,-1,0)$, $C(2,0,3)$.\n\na) Recta $AB$.\n\nb) Plano $ABC$.\n\nc) ¿$D(3,1,4)$ en el plano?`,
        puntuacion:2.5, criterios:"Recta AB (0.5 pts), plano (1.25 pts), D (0.75 pts)." },
      { id:"2019-J-3B", bloque:"Geometria", opcion:"B",
        enunciado:`$P(1,-1,2)$ y $\\pi:2x-y+2z-7=0$.\n\na) Distancia.\n\nb) Simetrico.`,
        puntuacion:2.5, criterios:"Distancia (0.75 pts), pie perpendicular (0.75 pts), simetrico (1 pt)." },
      { id:"2019-J-4A", bloque:"Probabilidad", opcion:"A",
        enunciado:`100 estudiantes: 60 Mates, 50 Fisica, 30 ambas.\n\na) P(Mates o Fisica)\n\nb) ¿Independientes?\n\nc) P(Mates | Fisica)`,
        puntuacion:2.5, criterios:"Union (0.75 pts), independencia (0.75 pts), condicionada (1 pt)." },
      { id:"2019-J-4B", bloque:"Probabilidad", opcion:"B",
        enunciado:`$X\\sim N(50,10)$.\n\na) $P(40<X<65)$\n\nb) $k$: $P(X>k)=0{,}1587$\n\nc) Con $n=25$, P(media $> 53$)`,
        puntuacion:2.5, criterios:"Tipificacion (0.5 pts), a (0.75 pts), b (0.75 pts), media muestral (0.5 pts)." }
    ]
  },
  {
    id: 13, año: 2018, tipo: "Ordinaria", asignatura: "Matemáticas II", comunidad: "Madrid",
    preguntas: [
      { id:"2018-J-1A", bloque:"Algebra", opcion:"A",
        enunciado:`$A=\\begin{pmatrix}1&2&0\\\\0&1&-1\\\\2&1&1\\end{pmatrix}$. $\\det(A)$, $A^{-1}$, $AX=\\begin{pmatrix}2\\\\1\\\\3\\end{pmatrix}$.`,
        puntuacion:2.5, criterios:"Determinante (0.5 pts), inversa (1.25 pts), sistema (0.75 pts)." },
      { id:"2018-J-1B", bloque:"Algebra", opcion:"B",
        enunciado:`Sistema segun $\\lambda$:\n$$\\begin{cases}x+y+z=3\\\\x+\\lambda y+z=\\lambda\\\\x+y+\\lambda z=3\\end{cases}$$`,
        puntuacion:2.5, criterios:"Rouche-Frobenius (1 pt), discusion (1 pt), resolucion SCD (0.5 pts)." },
      { id:"2018-J-2A", bloque:"Analisis", opcion:"A",
        enunciado:`$f(x)=\\dfrac{x^2+1}{x}$: dominio, asintotas, monotonia, extremos y grafica.`,
        puntuacion:2.5, criterios:"Dominio y asintotas (0.75 pts), monotonia y extremos (1 pt), grafica (0.75 pts)." },
      { id:"2018-J-2B", bloque:"Analisis", opcion:"B",
        enunciado:`Area entre $y=x^3$ e $y=x$.`,
        puntuacion:2.5, criterios:"Interseccion (0.5 pts), planteamiento (0.75 pts), calculo (1 pt), resultado (0.25 pts)." },
      { id:"2018-J-3A", bloque:"Geometria", opcion:"A",
        enunciado:`$r:\\frac{x-1}{2}=\\frac{y+2}{1}=\\frac{z}{-1}$ y $s:\\frac{x}{1}=\\frac{y-1}{-1}=\\frac{z+1}{2}$.\n\na) Posicion relativa.\n\nb) Interseccion si existe.`,
        puntuacion:2.5, criterios:"Paralelismo (0.5 pts), interseccion (1 pt), conclusion (1 pt)." },
      { id:"2018-J-3B", bloque:"Geometria", opcion:"B",
        enunciado:`$A(1,0,-1)$, $B(2,1,0)$, $C(0,-1,1)$.\n\na) Plano $ABC$.\n\nb) Recta perpendicular al plano por el origen.\n\nc) Interseccion recta-plano.`,
        puntuacion:2.5, criterios:"Plano (1 pt), recta perpendicular (0.75 pts), interseccion (0.75 pts)." },
      { id:"2018-J-4A", bloque:"Probabilidad", opcion:"A",
        enunciado:`$X\\sim N(200,20)$.\n\na) $P(180<X<230)$\n\nb) $P(X>240)$\n\nc) $k$: $P(X<k)=0{,}95$`,
        puntuacion:2.5, criterios:"Tipificacion (0.5 pts), a (0.75 pts), b (0.75 pts), c (0.5 pts)." },
      { id:"2018-J-4B", bloque:"Probabilidad", opcion:"B",
        enunciado:`Dos urnas: $U_1$ (3 rojas, 2 azules), $U_2$ (1 roja, 4 azules). Se elige al azar.\n\na) P(roja)\n\nb) P($U_1$ | roja)`,
        puntuacion:2.5, criterios:"Prob. total (1 pt), Bayes (1.5 pts)." }
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
