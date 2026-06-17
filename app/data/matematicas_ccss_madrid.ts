import type { Examen, Pregunta } from './examenes'

export const MATEMATICAS_CCSS_LABEL = 'Matemáticas Aplicadas a las Ciencias Sociales'

export const fuentesMatematicasCCSSMadrid = [
  { año: 2018, tipo: 'Ordinaria', archivo: 'Examen Matemáticas Aplicadas a las Ciencias Sociales de la Comunidad de Madrid (Ordinaria de 2018) [www.examenesdepau.com].pdf' },
  { año: 2018, tipo: 'Extraordinaria', archivo: 'Examen Matemáticas Aplicadas a las Ciencias Sociales de la Comunidad de Madrid (Extraordinaria de 2018) [www.examenesdepau.com].pdf' },
  { año: 2019, tipo: 'Ordinaria', archivo: 'Examen Matemáticas Aplicadas a las Ciencias Sociales de la Comunidad de Madrid (Ordinaria de 2019) [www.examenesdepau.com].pdf' },
  { año: 2019, tipo: 'Extraordinaria', archivo: 'Examen Matemáticas Aplicadas a las Ciencias Sociales de la Comunidad de Madrid (Extraordinaria de 2019) [www.examenesdepau.com].pdf' },
  { año: 2020, tipo: 'Ordinaria', archivo: 'Examen Matemáticas Aplicadas a las Ciencias Sociales de la Comunidad de Madrid (Ordinaria de 2020) [www.examenesdepau.com].pdf' },
  { año: 2020, tipo: 'Extraordinaria', archivo: 'Examen Matemáticas Aplicadas a las Ciencias Sociales de la Comunidad de Madrid (Extraordinaria de 2020) [www.examenesdepau.com].pdf' },
  { año: 2021, tipo: 'Ordinaria', archivo: 'Examen Matemáticas Aplicadas a las Ciencias Sociales de la Comunidad de Madrid (Ordinaria de 2021) [www.examenesdepau.com].pdf' },
  { año: 2021, tipo: 'Extraordinaria', archivo: 'Examen Matemáticas Aplicadas a las Ciencias Sociales de la Comunidad de Madrid (Extraordinaria de 2021) [www.examenesdepau.com].pdf' },
  { año: 2022, tipo: 'Ordinaria', archivo: 'Examen Matemáticas Aplicadas a las Ciencias Sociales de la Comunidad de Madrid (Ordinaria de 2022) [www.examenesdepau.com].pdf' },
  { año: 2022, tipo: 'Extraordinaria', archivo: 'Examen Matemáticas Aplicadas a las Ciencias Sociales de la Comunidad de Madrid (Extraordinaria de 2022) [www.examenesdepau.com].pdf' },
  { año: 2023, tipo: 'Ordinaria', archivo: 'Examen Matemáticas Aplicadas a las Ciencias Sociales de la Comunidad de Madrid (Ordinaria de 2023) [www.examenesdepau.com].pdf' },
  { año: 2023, tipo: 'Extraordinaria', archivo: 'Examen Matemáticas Aplicadas a las Ciencias Sociales de la Comunidad de Madrid (Extraordinaria de 2023) [www.examenesdepau.com].pdf' },
  { año: 2024, tipo: 'Ordinaria', archivo: 'Examen Matemáticas Aplicadas a las Ciencias Sociales de la Comunidad de Madrid (Ordinaria de 2024) [www.examenesdepau.com].pdf' },
  { año: 2024, tipo: 'Extraordinaria', archivo: 'Examen Matemáticas Aplicadas a las Ciencias Sociales de la Comunidad de Madrid (Extraordinaria de 2024) [www.examenesdepau.com].pdf' },
  { año: 2025, tipo: 'Ordinaria', archivo: 'Examen Matemáticas Aplicadas a las Ciencias Sociales de la Comunidad de Madrid (Ordinaria de 2025) [www.examenesdepau.com].pdf' },
  { año: 2025, tipo: 'Extraordinaria', archivo: 'Examen Matemáticas Aplicadas a las Ciencias Sociales de la Comunidad de Madrid (Extraordinaria de 2025) [www.examenesdepau.com].pdf' },
] as const

const criteriosGeneralesCCSS = `Fuente: Examen Matemáticas Aplicadas a las Ciencias Sociales de la Comunidad de Madrid (Ordinaria de 2025) [www.examenesdepau.com].pdf.
Se valorará el planteamiento correcto, la justificación razonada, el desarrollo matemático, los cálculos y la respuesta final contextualizada. La calificación debe hacerse en múltiplos de 0,25 puntos.`

const preguntaCCSS = (
  id: string,
  bloque: string,
  opcion: 'A' | 'B',
  enunciado: string,
  criterios: string,
  puntuacion = 2.5
): Pregunta => ({
  id,
  bloque,
  opcion,
  enunciado,
  puntuacion,
  criterios: `${criteriosGeneralesCCSS}\n\n${criterios}`,
})

const examenMadrid2025Ordinaria: Examen = {
  id: 7014,
  año: 2025,
  tipo: 'Ordinaria',
  asignatura: MATEMATICAS_CCSS_LABEL,
  comunidad: 'Madrid',
  preguntas: [
    preguntaCCSS(
      'CCSS-2025-O-1',
      'Ejercicio 1',
      'A',
      `**Ejercicio 1 (2,5 puntos). Responda los dos apartados. Este ejercicio no tiene opcionalidad.**

El dueño de una frutería quiere alquilar una cámara frigorífica para la campaña de sandías del verano. Entre las diferentes cámaras que puede alquilar cercanas a su frutería, la que más le convence es una que tiene capacidad para guardar 2700 kilos de sandía que es, según sus datos de años anteriores, la cantidad de kilos que vende cualquier semana de la campaña.

Las sandías que vende son de tres variedades: sandía verde rayada, sandía negra sin pepitas y sandía negra con pepitas. La sandía rayada es la menos apreciada por su clientela, por ello decide ponerle el precio más bajo y la venderá a 1,25 euros el kilo. Las sandías negras son las más demandadas entre su clientela, pero entre estas dos variedades es más fácil vender la variedad sin pepitas. Por esta razón, determina que el precio de la sandía negra sin pepitas sea de 2,75 euros el kilo y el precio con pepitas de 2,25 euros el kilo.

El dueño de la frutería quiere que, en cualquier circunstancia, el número de kilos de sandía negra con pepitas vendidos sea un tercio del total de kilos de sandías sin pepitas y sandías rayadas.

a) (1,25 puntos) El frutero considera que para poder pagar el alquiler y obtener beneficio, debe recaudar de la venta 5400 euros cualquier semana de la campaña. Si se venden todas las sandías almacenadas para la semana, ¿cuántos kilos debería vender de cada variedad para recaudar exactamente ese importe?

b) (1,25 puntos) Con la idea de simplificar el etiquetado, el frutero necesita saber si es posible poner el mismo precio a todas las variedades de sandías y seguir recaudando 5400 euros a la semana vendiendo los 2700 kilos. Si fuera posible, ¿cuál sería el precio de venta del kilo de sandía?, ¿cuál sería la cantidad de kilos de cada variedad que debería vender? Justifique si dichas cantidades serían únicas.`,
      `Apartado a): descripción adecuada de las tres incógnitas (0,25), planteamiento y resolución correcta del sistema de ecuaciones (0,75), obtención correcta de la solución contextualizada (0,25).

Apartado b): planteamiento correcto del sistema de ecuaciones (0,50), obtención correcta del precio de venta pedido (0,25), justificación de la no unicidad de la solución (0,25), obtención correcta de la solución contextualizada (0,25).

Solución orientativa: si $x$ son los kilos de sandía rayada, $y$ los de sandía negra con pepitas y $z$ los de sandía negra sin pepitas, en el apartado a) se plantea
$$
\\begin{cases}
x+y+z=2700\\\\
x-3y+z=0\\\\
1,25x+2,25y+2,75z=5400
\\end{cases}
$$
y se obtiene $x=1125$, $y=675$, $z=900$. En el apartado b), el precio común debe ser $2$ euros/kg; la solución no es única: $y=675$ y $x+z=2025$.`
    ),
    preguntaCCSS(
      'CCSS-2025-O-2A',
      'Ejercicio 2',
      'A',
      `**Ejercicio 2. Pregunta 2.1 (2,5 puntos).**

Se considera la función real de variable real definida por
$$
f(x)=
\\begin{cases}
\\dfrac{x^2+1}{x-1}, & x\\leq 0,\\\\
\\dfrac{x+a}{x+1}, & x>0,
\\end{cases}
\\qquad a\\in\\mathbb{R}.
$$

a) (1 punto) Determine el valor del parámetro real $a$ para que la función sea continua en $x=0$.

b) (1,5 puntos) Calcule las asíntotas de $f(x)$.`,
      `Apartado a): aplicación correcta de la definición de continuidad en $x=0$ (0,75), cálculo correcto del valor de $a$ (0,25).

Apartado b): justificación correcta de la no existencia de asíntotas verticales (0,25), cálculo correcto de la asíntota horizontal en $+\\infty$ (0,50), cálculo correcto de la asíntota oblicua en $-\\infty$ (0,75).

Solución orientativa: $f(0)=-1$, $\\lim_{x\\to0^-}f(x)=-1$ y $\\lim_{x\\to0^+}f(x)=a$, por tanto $a=-1$. No hay asíntotas verticales. En $+\\infty$, $y=1$ es asíntota horizontal. En $-\\infty$, la asíntota oblicua es $y=x+1$.`
    ),
    preguntaCCSS(
      'CCSS-2025-O-2B',
      'Ejercicio 2',
      'B',
      `**Ejercicio 2. Pregunta 2.2 (2,5 puntos).**

Se considera la función real de variable real
$$
f(x)=e^x(-x^2+3).
$$

a) (1,25 puntos) Determine los intervalos de crecimiento y decrecimiento de la función y clasifique, si procede, sus extremos relativos.

b) (1,25 puntos) Halle el valor de la integral definida
$$
\\int_1^2 \\frac{f(x)}{xe^x}\\,dx.
$$`,
      `Apartado a): cálculo correcto de la derivada (0,50), cálculo de los intervalos de crecimiento y decrecimiento (0,50), determinación del máximo y mínimo relativos, basta con la abscisa (0,25).

Apartado b): obtención de la integral (0,75), cálculo correcto del valor de la integral definida (0,50).

Solución orientativa: $f'(x)=e^x(-x^2-2x+3)$, que se anula en $x=-3$ y $x=1$. La función decrece en $(-\\infty,-3)$ y $(1,\\infty)$, crece en $(-3,1)$, tiene mínimo relativo en $x=-3$ y máximo relativo en $x=1$. Además,
$$
\\int_1^2 \\frac{f(x)}{xe^x}\\,dx=\\int_1^2\\frac{-x^2+3}{x}\\,dx=\\left[-\\frac{x^2}{2}+3\\ln|x|\\right]_1^2=-\\frac32+3\\ln 2.
$$`
    ),
    preguntaCCSS(
      'CCSS-2025-O-3A',
      'Ejercicio 3',
      'A',
      `**Ejercicio 3. Pregunta 3.1 (2,5 puntos).**

Para poder participar en el concurso "Mejor Jabón Artesano del año" es necesario pasar un control de calidad muy exigente. Un maestro jabonero sabe que el 90% de sus pastillas de jabón hechas a mano pasarían sin problemas este control de calidad.

a) (1 punto) La empresa organizadora del concurso elegirá en el taller de cada participante una muestra aleatoria simple de pastillas de jabón para obtener una estimación de la proporción de ellas que superan el control de calidad. Suponiendo cierta la creencia del maestro jabonero sobre la calidad de sus pastillas, determine el tamaño mínimo necesario de la muestra de pastillas de jabón que la empresa organizadora debe tomar en el taller de este artesano para garantizar, con un nivel de confianza del 95%, que el margen de error en la estimación sea inferior al 5%.

b) (1,5 puntos) Si finalmente la organización decide seleccionar una muestra aleatoria simple de 140 pastillas de jabón de este artesano, calcule, aproximando por la distribución normal adecuada, la probabilidad de que al menos 120 pastillas de jabón superen el control de calidad.`,
      `Apartado a): determinación del valor crítico $z_{\\alpha/2}$ (0,25), planteamiento con la fórmula del error (0,25), cálculo correcto del tamaño mínimo de la muestra (0,50).

Apartado b): aproximación correcta y justificada a la distribución normal (0,75), cálculo correcto de la probabilidad pedida (0,75).

Solución orientativa: con confianza del 95%, $z_{\\alpha/2}=1,96$. Usando $p=0,90$, $q=0,10$ y $E<0,05$, se obtiene $n>138,2976$, luego el tamaño mínimo es $139$. Para $n=140$, $X\\sim B(140,0,90)$ se aproxima por $Y\\sim N(126,3,55)$. Con corrección de Yates,
$$
P(X\\geq120)\\approx P\\left(Z\\geq\\frac{119,5-126}{3,55}\\right)=P(Z\\geq -1,83)=0,9664.
$$`
    ),
    preguntaCCSS(
      'CCSS-2025-O-3B',
      'Ejercicio 3',
      'B',
      `**Ejercicio 3. Pregunta 3.2 (2,5 puntos).**

Para poder participar en el concurso "Mejor Jabón Artesano del año" es necesario pasar un control de calidad muy exigente. El peso de las pastillas de jabón de este artesano se puede aproximar por una variable aleatoria con distribución normal de media $\\mu$ gramos y desviación típica 30 gramos.

a) (1,25 puntos) La empresa organizadora del concurso seleccionó 140 pastillas de jabón de este artesano y obtuvo que el peso total fue de 17500 gramos. Obtenga un intervalo de confianza del 99% para estimar el peso medio $\\mu$ de las pastillas de jabón de este artesano.

b) (1,25 puntos) Si el verdadero valor de $\\mu$ fuera igual a 100 gramos, ¿cuál sería la probabilidad de que el peso medio de 64 pastillas de jabón de una muestra aleatoria simple fuera superior a 110 gramos?`,
      `Apartado a): determinación del peso medio muestral (0,25), determinar el valor $z_{\\alpha/2}$ (0,25), aplicación de la fórmula del error y obtención del mismo (0,50), determinación correcta del intervalo de confianza (0,25).

Apartado b): determinación de la distribución de la media (0,25), planteamiento de la probabilidad pedida (0,25), cálculo correcto de la probabilidad (0,75).

Solución orientativa: $\\bar{x}=17500/140=125$ y, para confianza del 99%, $z_{\\alpha/2}=2,575$. El intervalo es
$$
\\left(125-2,575\\frac{30}{\\sqrt{140}},\\ 125+2,575\\frac{30}{\\sqrt{140}}\\right)=(118,47,\\ 131,53).
$$
Si $\\mu=100$ y $n=64$, entonces $\\bar X\\sim N(100,30/8)$ y
$$
P(\\bar X>110)=P\\left(Z>\\frac{110-100}{3,75}\\right)=1-0,9962=0,0038.
$$`
    ),
    preguntaCCSS(
      'CCSS-2025-O-4A',
      'Ejercicio 4',
      'A',
      `**Ejercicio 4. Pregunta 4.1 (2,5 puntos).**

En un concesionario el 50% de sus ventas son de automóviles microhíbridos, el 35% híbridos y el resto eléctricos enchufables. El acabado más alto de gama se vende en el 80% de los eléctricos enchufables, el 60% de los híbridos y el 45% de los microhíbridos. Se selecciona una operación de venta al azar.

a) (1,25 puntos) Calcule la probabilidad de que el coche vendido en esa operación no tenga el acabado más alto de la gama.

b) (1,25 puntos) Si el coche correspondiente a la operación de venta seleccionada tiene el acabado más alto de la gama, determine la probabilidad de que sea eléctrico enchufable.`,
      `Apartado a): planteamiento correcto de la probabilidad (0,75), cálculo correcto de la probabilidad (0,50).

Apartado b): planteamiento correcto de la probabilidad (0,75), cálculo correcto de la probabilidad (0,50). La no definición de los sucesos se penalizará con 0,25 puntos en la puntuación total de la pregunta.

Solución orientativa: si $G$ es el suceso "acabado más alto", entonces
$$
P(G)=0,45\\cdot0,50+0,60\\cdot0,35+0,80\\cdot0,15=0,555,
$$
así que $P(\\overline G)=0,445$. Además,
$$
P(\\text{eléctrico enchufable}\\mid G)=\\frac{0,80\\cdot0,15}{0,555}=0,2162.
$$`
    ),
    preguntaCCSS(
      'CCSS-2025-O-4B',
      'Ejercicio 4',
      'B',
      `**Ejercicio 4. Pregunta 4.2 (2,5 puntos).**

De tres sucesos $A$, $B$ y $C$ se sabe que $A$ y $C$ son sucesos disjuntos, $A$ y $B$ son independientes y se tienen las siguientes probabilidades:
$$
P(A)=0,25,\\qquad P(B)=0,2,\\qquad P(B\\cap C)=0,05.
$$

a) (1 punto) Calcule la probabilidad de que ocurra al menos uno de los sucesos $A$ o $B$.

b) (1 punto) Calcule $P(\\overline{B}\\cup\\overline{C})$.

c) (0,5 puntos) ¿Pueden ser independientes los sucesos $A$ y $C$?`,
      `Apartado a): planteamiento correcto de la probabilidad (0,50), cálculo correcto de la probabilidad (0,50).

Apartado b): planteamiento correcto de la probabilidad (0,50), cálculo correcto de la probabilidad (0,50).

Apartado c): justificación correcta de la dependencia de los sucesos (0,50).

Solución orientativa: como $A$ y $B$ son independientes, $P(A\\cap B)=P(A)P(B)=0,25\\cdot0,2=0,05$. Por tanto,
$$
P(A\\cup B)=P(A)+P(B)-P(A\\cap B)=0,4.
$$
Por De Morgan, $P(\\overline B\\cup\\overline C)=1-P(B\\cap C)=0,95$. Como $A$ y $C$ son disjuntos, $P(A\\cap C)=0$; al ser $P(A)>0$ y $P(C)>0$, no pueden ser independientes.`
    ),
  ],
}

export const examenesMatematicasCCSSMadrid: Examen[] = fuentesMatematicasCCSSMadrid.map((fuente, index) =>
  fuente.año === 2025 && fuente.tipo === 'Ordinaria'
    ? examenMadrid2025Ordinaria
    : {
        id: 7000 + index,
        año: fuente.año,
        tipo: fuente.tipo,
        asignatura: MATEMATICAS_CCSS_LABEL,
        comunidad: 'Madrid',
        preguntas: [],
      }
)
