import type { CaminoCurriculumTopic } from './caminoCurriculumPlan'

export const PRIVATE_BETA_SUBJECTS = [
  'matematicas_ii',
  'matematicas_ccss',
  'lengua',
  'historia_espana',
  'fisica',
  'quimica',
] as const

export type PrivateBetaSubject = typeof PRIVATE_BETA_SUBJECTS[number]

export function isPrivateBetaSubject(subject: string): subject is PrivateBetaSubject {
  return (PRIVATE_BETA_SUBJECTS as readonly string[]).includes(subject)
}

type TopicInput = {
  subject: PrivateBetaSubject
  blockSlug: string
  blockTitle: string
  topicSlug: string
  title: string
  orderIndex: number
  tags: string[]
  prerequisites?: string[]
  minutes?: number
}

type TopicLessonContent = {
  guidedExample: string
  practicePrompt: string
  appliedExercise: string
  referenceSolution: string
  commonMistakes: string[]
}

const md = String.raw

function theoryText(item: TopicInput) {
  if (item.topicSlug.includes('producto-por-un-escalar')) {
    return md`Multiplicar una matriz por un número significa multiplicar cada entrada por ese número. Si \(A=(a_{ij})\), entonces \((kA)_{ij}=k\cdot a_{ij}\). La dimensión de la matriz no cambia.`
  }
  if (item.topicSlug.includes('multiplicacion-de-matrices')) {
    return md`El producto \(A\cdot B\) solo existe si el número de columnas de \(A\) coincide con el número de filas de \(B\). Si \(A\in M_{m\times n}\) y \(B\in M_{n\times p}\), entonces \(AB\in M_{m\times p}\). Cada entrada se obtiene multiplicando una fila por una columna.`
  }
  if (item.topicSlug.includes('matrices-operaciones') || item.topicSlug.includes('matrices-sistemas')) {
    return md`Una matriz es una tabla ordenada de números colocados en filas y columnas. Su dimensión se escribe \(m\times n\): \(m\) filas y \(n\) columnas. Dos matrices solo se suman si tienen la misma dimensión, y la regla es sumar posición a posición: \((A+B)_{ij}=a_{ij}+b_{ij}\).`
  }
  if (item.topicSlug.includes('determinantes')) {
    return md`El determinante es un número asociado a una matriz cuadrada. En \(2\times2\), \(\det\begin{pmatrix}a & b\\c & d\end{pmatrix}=ad-bc\). Si el determinante no es cero, la matriz tiene inversa.`
  }
  if (item.topicSlug.includes('sistemas') || item.topicSlug.includes('gauss')) {
    return md`Un sistema reúne varias ecuaciones que deben cumplirse a la vez. El método de Gauss transforma el sistema en otro equivalente más sencillo usando operaciones elementales, hasta poder despejar las incógnitas sin cambiar las soluciones.`
  }
  if (item.topicSlug.includes('vectores')) {
    return md`Un vector representa dirección, sentido y módulo. El producto escalar mide alineación entre vectores y permite estudiar ángulos y perpendicularidad; si \(\vec u\cdot\vec v=0\), los vectores son perpendiculares.`
  }
  if (item.topicSlug.includes('rectas-planos')) {
    return md`En geometría analítica, rectas y planos se describen con puntos y vectores. Comparar vectores directores y normales permite decidir si dos objetos son paralelos, se cortan o coinciden.`
  }
  if (item.topicSlug.includes('limites')) {
    return md`Un límite describe a qué valor se acerca una función cuando \(x\) se aproxima a un punto. Antes de sustituir, conviene detectar indeterminaciones y simplificar la expresión si aparece \(0/0\).`
  }
  if (item.topicSlug.includes('derivadas')) {
    return md`La derivada mide la variación instantánea de una función. En PAU se usa para hallar rectas tangentes, crecimiento, máximos, mínimos y problemas de optimización.`
  }
  if (item.topicSlug.includes('primitivas') || item.topicSlug.includes('integrales')) {
    return md`Una integral permite recuperar una función a partir de su derivada o calcular áreas bajo una curva. En primitivas siempre aparece una constante \(C\), porque muchas funciones tienen la misma derivada.`
  }
  if (item.topicSlug.includes('probabilidad') || item.topicSlug.includes('bayes') || item.topicSlug.includes('sucesos')) {
    return md`La probabilidad mide la posibilidad de que ocurra un suceso. En árboles y tablas es clave distinguir \(P(A)\), \(P(B|A)\) y \(P(A\cap B)\), porque no significan lo mismo.`
  }
  if (item.topicSlug.includes('programacion-lineal')) {
    return md`La programación lineal busca maximizar o minimizar una función objetivo con restricciones. La solución óptima aparece en un vértice de la región factible.`
  }
  if (item.topicSlug.includes('intervalos') || item.topicSlug.includes('contrastes')) {
    return md`La inferencia usa datos de una muestra para estimar o contrastar una afirmación sobre la población. El margen de error depende del nivel de confianza, el tamaño muestral y la variabilidad.`
  }
  if (item.subject === 'lengua') {
    return 'En Lengua no basta con decir de qué habla el texto: hay que formular la idea central con precisión, resumir sin copiar y construir una valoración propia con argumentos claros.'
  }
  return 'En Historia no basta con memorizar hechos: una respuesta PAU debe situar el tema en contexto, explicar causas, desarrollar hechos principales y cerrar con consecuencias.'
}

function mathContent(item: TopicInput): TopicLessonContent {
  const defaults = {
    commonMistakes: [
      'Escribir solo el resultado sin justificar la operación.',
      'Copiar mal signos o dimensiones en una matriz.',
      'No interpretar si el resultado responde al enunciado PAU.',
    ],
  }

  if (item.topicSlug.includes('matrices-operaciones')) {
    const practice = md`Dadas

$$
A=\begin{pmatrix}2 & -1\\0 & 3\end{pmatrix},
\qquad
B=\begin{pmatrix}1 & 4\\-2 & 5\end{pmatrix}
$$

calcula \(A+B\) y explica por qué la operación se puede realizar.`
    return {
      guidedExample: md`Dadas las matrices

$$
A=\begin{pmatrix}1 & 2\\3 & 4\end{pmatrix},
\qquad
B=\begin{pmatrix}2 & 0\\1 & -1\end{pmatrix}
$$

calcula \(A+B\).

**Paso 1.** Comprueba dimensiones: \(A,B\in M_{2\times 2}\), luego se pueden sumar.

**Paso 2.** Suma elemento a elemento:

$$
A+B=\begin{pmatrix}1+2 & 2+0\\3+1 & 4+(-1)\end{pmatrix}
=\begin{pmatrix}3 & 2\\4 & 3\end{pmatrix}
$$

**Conclusión.** La suma existe porque ambas matrices tienen la misma dimensión.`,
      practicePrompt: practice,
      appliedExercise: practice,
      referenceSolution: md`La suma se hace elemento a elemento:

$$
A+B=\begin{pmatrix}3 & 3\\-2 & 8\end{pmatrix}
$$

Se puede realizar porque ambas matrices son \(2\times 2\).`,
      ...defaults,
    }
  }

  if (item.topicSlug.includes('producto-por-un-escalar')) {
    const practice = md`Dada

$$
A=\begin{pmatrix}2 & -1\\0 & 3\end{pmatrix}
$$

calcula \(3A\) y explica qué ocurre con la dimensión de la matriz.`
    return {
      guidedExample: md`Dada la matriz

$$
A=\begin{pmatrix}1 & -2\\3 & 0\end{pmatrix}
$$

calcula \(2A\).

**Paso 1.** Multiplica cada entrada de \(A\) por \(2\):

$$
2A=\begin{pmatrix}2\cdot1 & 2\cdot(-2)\\2\cdot3 & 2\cdot0\end{pmatrix}
$$

**Paso 2.** Opera cada elemento:

$$
2A=\begin{pmatrix}2 & -4\\6 & 0\end{pmatrix}
$$

**Conclusión.** La dimensión sigue siendo \(2\times2\); solo cambian los valores de las entradas.`,
      practicePrompt: practice,
      appliedExercise: practice,
      referenceSolution: md`Se multiplica cada entrada por \(3\):

$$
3A=\begin{pmatrix}6 & -3\\0 & 9\end{pmatrix}
$$

La dimensión no cambia: sigue siendo \(2\times2\).`,
      ...defaults,
    }
  }

  if (item.topicSlug.includes('multiplicacion-de-matrices')) {
    const practice = md`Dadas

$$
A=\begin{pmatrix}1 & 0 & 2\\-1 & 3 & 1\end{pmatrix},
\qquad
B=\begin{pmatrix}2 & 1\\0 & -1\\4 & 3\end{pmatrix}
$$

calcula \(AB\) y justifica por qué el producto existe.`
    return {
      guidedExample: md`Dadas las matrices

$$
A=\begin{pmatrix}1 & 2\\3 & 4\end{pmatrix},
\qquad
B=\begin{pmatrix}2 & 0\\1 & -1\end{pmatrix}
$$

calcula \(AB\).

**Paso 1.** Comprueba dimensiones: \(A\in M_{2\times2}\) y \(B\in M_{2\times2}\). El producto existe porque las columnas de \(A\) coinciden con las filas de \(B\).

**Paso 2.** Multiplica filas por columnas:

$$
AB=\begin{pmatrix}
1\cdot2+2\cdot1 & 1\cdot0+2\cdot(-1)\\
3\cdot2+4\cdot1 & 3\cdot0+4\cdot(-1)
\end{pmatrix}
=\begin{pmatrix}4 & -2\\10 & -4\end{pmatrix}
$$

**Conclusión.** El resultado es una matriz \(2\times2\).`,
      practicePrompt: practice,
      appliedExercise: practice,
      referenceSolution: md`El producto existe porque \(A\) es \(2\times3\) y \(B\) es \(3\times2\). Por tanto, \(AB\) será \(2\times2\).

$$
AB=\begin{pmatrix}
1\cdot2+0\cdot0+2\cdot4 & 1\cdot1+0\cdot(-1)+2\cdot3\\
(-1)\cdot2+3\cdot0+1\cdot4 & (-1)\cdot1+3\cdot(-1)+1\cdot3
\end{pmatrix}
=\begin{pmatrix}10 & 7\\2 & -1\end{pmatrix}
$$`,
      ...defaults,
    }
  }

  if (item.topicSlug.includes('determinantes')) {
    const practice = md`Calcula el determinante de

$$
A=\begin{pmatrix}2 & -1\\5 & 3\end{pmatrix}
$$

y explica si la matriz es invertible.`
    return {
      guidedExample: md`Para

$$
A=\begin{pmatrix}1 & 2\\3 & 4\end{pmatrix}
$$

calcula \(\det(A)\).

**Paso 1.** En una matriz \(2\times 2\), si \(A=\begin{pmatrix}a & b\\c & d\end{pmatrix}\), entonces \(\det(A)=ad-bc\).

**Paso 2.** Sustituye:

$$
\det(A)=1\cdot 4-2\cdot 3=4-6=-2
$$

**Conclusión.** Como \(\det(A)\neq 0\), la matriz es invertible.`,
      practicePrompt: practice,
      appliedExercise: practice,
      referenceSolution: md`\(\det(A)=2\cdot 3-(-1)\cdot 5=6+5=11\). Como \(11\neq 0\), la matriz es invertible.`,
      ...defaults,
    }
  }

  if (item.topicSlug.includes('sistemas') || item.topicSlug.includes('gauss')) {
    const practice = md`Resuelve por eliminación:

$$
\begin{cases}
2x+y=7\\
x-y=1
\end{cases}
$$

Explica cada operación elemental que uses.`
    return {
      guidedExample: md`Resuelve el sistema

$$
\begin{cases}
x+y=3\\
2x-y=0
\end{cases}
$$

**Paso 1.** Suma las dos ecuaciones para eliminar \(y\):

$$
3x=3
$$

**Paso 2.** Despeja \(x=1\). Sustituye en \(x+y=3\):

$$
1+y=3 \Rightarrow y=2
$$

**Resultado.** La solución es \((x,y)=(1,2)\).`,
      practicePrompt: practice,
      appliedExercise: practice,
      referenceSolution: md`Sumando las ecuaciones se obtiene \(3x=8\), por tanto \(x=\frac{8}{3}\). Al sustituir en \(x-y=1\), \(y=\frac{5}{3}\).`,
      ...defaults,
    }
  }

  if (item.topicSlug.includes('vectores')) {
    const practice = md`Dados \(\vec u=(1,2,0)\) y \(\vec v=(3,-1,2)\), calcula \(\vec u\cdot\vec v\) e interpreta si son perpendiculares.`
    return {
      guidedExample: md`Dados \(\vec u=(1,0,2)\) y \(\vec v=(3,-1,4)\), calcula el producto escalar.

$$
\vec u\cdot\vec v=1\cdot3+0\cdot(-1)+2\cdot4=11
$$

Como el producto escalar no es \(0\), los vectores no son perpendiculares.`,
      practicePrompt: practice,
      appliedExercise: practice,
      referenceSolution: md`\(\vec u\cdot\vec v=1\cdot3+2\cdot(-1)+0\cdot2=1\). No son perpendiculares.`,
      ...defaults,
    }
  }

  if (item.topicSlug.includes('rectas-planos')) {
    const practice = md`Estudia si las rectas con vectores directores \(\vec u=(1,2,1)\) y \(\vec v=(2,4,2)\) pueden ser paralelas. Justifica la respuesta.`
    return {
      guidedExample: md`Si dos rectas tienen vectores directores proporcionales, pueden ser paralelas o coincidentes.

Para \(\vec u=(1,2,1)\) y \(\vec v=(2,4,2)\):

$$
\vec v=2\vec u
$$

Los vectores son proporcionales, así que las rectas tienen la misma dirección.`,
      practicePrompt: practice,
      appliedExercise: practice,
      referenceSolution: md`Sí. Como \((2,4,2)=2(1,2,1)\), los vectores directores son proporcionales y las rectas tienen direcciones paralelas.`,
      ...defaults,
    }
  }

  if (item.topicSlug.includes('limites')) {
    const practice = md`Calcula

$$
\lim_{x\to 2}\frac{x^2-4}{x-2}
$$

factorizando antes de sustituir.`
    return {
      guidedExample: md`Calcula

$$
\lim_{x\to 0}\frac{\sin x}{x}
$$

Este es un límite notable:

$$
\lim_{x\to 0}\frac{\sin x}{x}=1
$$

En PAU se usa para reconocer indeterminaciones y simplificar expresiones trigonométricas.`,
      practicePrompt: practice,
      appliedExercise: practice,
      referenceSolution: md`\(\frac{x^2-4}{x-2}=\frac{(x-2)(x+2)}{x-2}=x+2\). Por tanto, el límite vale \(4\).`,
      ...defaults,
    }
  }

  if (item.topicSlug.includes('derivadas')) {
    const practice = md`Para \(f(x)=x^3-3x^2+2\), calcula \(f'(x)\), estudia los puntos críticos y clasifícalos.`
    return {
      guidedExample: md`Sea

$$
f(x)=x^3-3x^2+2
$$

**Paso 1.** Deriva:

$$
f'(x)=3x^2-6x=3x(x-2)
$$

**Paso 2.** Igualamos a cero:

$$
3x(x-2)=0 \Rightarrow x=0,\;x=2
$$

Estos son los candidatos a máximo o mínimo.`,
      practicePrompt: practice,
      appliedExercise: practice,
      referenceSolution: md`\(f'(x)=3x^2-6x\). Los puntos críticos son \(x=0\) y \(x=2\). Con \(f''(x)=6x-6\), en \(x=0\) hay máximo relativo y en \(x=2\) mínimo relativo.`,
      ...defaults,
    }
  }

  if (item.topicSlug.includes('primitivas') || item.topicSlug.includes('integrales')) {
    const practice = md`Calcula

$$
\int (3x^2-4x+1)\,dx
$$

indicando la constante de integración.`
    return {
      guidedExample: md`Calcula una primitiva de \(2x+3\).

$$
\int (2x+3)\,dx=\int 2x\,dx+\int 3\,dx
$$

$$
\int (2x+3)\,dx=x^2+3x+C
$$

La constante \(C\) aparece porque hay infinitas primitivas.`,
      practicePrompt: practice,
      appliedExercise: practice,
      referenceSolution: md`\(\int (3x^2-4x+1)\,dx=x^3-2x^2+x+C\).`,
      ...defaults,
    }
  }

  if (item.topicSlug.includes('probabilidad') || item.topicSlug.includes('bayes') || item.topicSlug.includes('sucesos')) {
    const practice = md`En una clase, \(P(A)=0.5\), \(P(B|A)=0.6\) y \(P(B|A^c)=0.2\). Calcula \(P(B)\).`
    return {
      guidedExample: md`Si \(P(A)=0.4\), \(P(B|A)=0.7\) y \(P(B|A^c)=0.2\), aplica probabilidad total:

$$
P(B)=P(A)\cdot P(B|A)+P(A^c)\cdot P(B|A^c)
$$

$$
P(B)=0.4\cdot 0.7+0.6\cdot 0.2=0.28+0.12=0.40
$$`,
      practicePrompt: practice,
      appliedExercise: practice,
      referenceSolution: md`\(P(B)=0.5\cdot0.6+0.5\cdot0.2=0.4\).`,
      ...defaults,
    }
  }

  if (item.topicSlug.includes('programacion-lineal')) {
    const practice = md`Maximiza \(Z=3x+2y\) con \(x+y\le 6\), \(x\le 4\), \(y\le 5\), \(x,y\ge0\). Evalúa los vértices.`
    return {
      guidedExample: md`Maximiza \(Z=2x+3y\) sujeto a:

$$
x+y\le 4,\quad x\le 3,\quad y\le 2,\quad x,y\ge0
$$

Los vértices factibles son \((0,0)\), \((3,0)\), \((3,1)\), \((2,2)\), \((0,2)\).

$$
Z(0,0)=0,\quad Z(3,0)=6,\quad Z(3,1)=9,\quad Z(2,2)=10,\quad Z(0,2)=6
$$

El máximo se alcanza en \((2,2)\).`,
      practicePrompt: practice,
      appliedExercise: practice,
      referenceSolution: md`Los vértices principales son \((0,0)\), \((4,0)\), \((4,2)\), \((1,5)\), \((0,5)\). Los valores son \(0,12,16,13,10\); máximo en \((4,2)\).`,
      ...defaults,
    }
  }

  if (item.topicSlug.includes('intervalos') || item.topicSlug.includes('contrastes')) {
    const practice = md`Con \(\hat p=0.62\), \(n=400\) y \(z_{0.975}=1.96\), calcula el margen de error de un intervalo al 95%.`
    return {
      guidedExample: md`Para una proporción muestral \(\hat p=0.60\), \(n=100\) y \(z_{0.975}=1.96\):

$$
E=z\sqrt{\frac{\hat p(1-\hat p)}{n}}
=1.96\sqrt{\frac{0.6\cdot0.4}{100}}
\approx 0.096
$$

El intervalo es aproximadamente \((0.504,0.696)\).`,
      practicePrompt: practice,
      appliedExercise: practice,
      referenceSolution: md`\(E=1.96\sqrt{\frac{0.62\cdot0.38}{400}}\approx0.0476\).`,
      ...defaults,
    }
  }

  return {
    guidedExample: md`Resuelve \(2x+3=7\). Restamos \(3\) en ambos lados y queda \(2x=4\); después dividimos entre \(2\), luego \(x=2\).`,
    practicePrompt: md`Resuelve \(3x-5=10\) justificando cada transformación algebraica.`,
    appliedExercise: md`Resuelve \(3x-5=10\) justificando cada transformación algebraica.`,
    referenceSolution: md`\(3x-5=10 \Rightarrow 3x=15 \Rightarrow x=5\).`,
    ...defaults,
  }
}

function lenguaContent(): TopicLessonContent {
  const text = 'El uso excesivo del móvil ha transformado la forma en que muchos adolescentes se relacionan. Aunque facilita la comunicación inmediata, también puede reducir la conversación cara a cara y aumentar la dependencia de la aprobación externa.'
  const practice = `Lee este fragmento:

> La lectura diaria no solo mejora el vocabulario, sino que también ayuda a ordenar el pensamiento y a comprender mejor los problemas complejos.

Formula:

1. el tema;
2. un resumen de 3-4 líneas;
3. una tesis para un comentario crítico.`

  return {
    guidedExample: `Texto breve: “${text}”

**Tema posible:** crítica al impacto del uso excesivo del móvil en las relaciones personales de los jóvenes.

**Resumen modelo:** El texto plantea que el móvil ha cambiado la comunicación adolescente. Reconoce su utilidad para comunicarse con rapidez, pero advierte de que puede empobrecer el trato directo y generar dependencia de la validación social.

**Tesis para comentario crítico:** La tecnología es útil si se usa con criterio, pero no debería sustituir los vínculos presenciales ni convertirse en medida de autoestima.`,
    practicePrompt: practice,
    appliedExercise: practice,
    referenceSolution: `Tema posible: defensa de la lectura diaria como hábito que mejora expresión y pensamiento. Resumen: el fragmento afirma que leer cada día amplía el vocabulario, estructura las ideas y permite afrontar cuestiones complejas con más claridad. Tesis: la lectura sigue siendo una herramienta esencial para formar ciudadanos críticos.`,
    commonMistakes: [
      'Confundir tema con resumen: el tema debe ser breve y abstracto.',
      'Copiar literalmente frases del texto en el resumen.',
      'Hacer un comentario crítico sin tesis clara.',
    ],
  }
}

function historiaContent(item: TopicInput): TopicLessonContent {
  if (item.topicSlug.includes('origenes')) {
    const practice = 'Redacta una respuesta breve sobre las diferencias entre arte rupestre cantábrico y levantino.'
    return {
      guidedExample: `Pregunta: explica las características principales del arte rupestre cantábrico.

**Respuesta modelo:**

El arte rupestre cantábrico se desarrolló durante el Paleolítico superior y se localiza principalmente en cuevas del norte peninsular, como Altamira. Sus pinturas representan animales aislados, sobre todo bisontes, caballos y ciervos, con gran realismo y policromía. Se interpreta como un arte relacionado con rituales de caza o creencias simbólicas.

**Cómo está construida la respuesta:**

1. Sitúa cronología y localización.
2. Describe rasgos visuales.
3. Da ejemplos.
4. Añade interpretación.`,
      practicePrompt: practice,
      appliedExercise: practice,
      referenceSolution: `El arte cantábrico es paleolítico, se sitúa en cuevas profundas del norte y representa animales aislados con realismo y policromía. El levantino es posterior, aparece en abrigos al aire libre del área mediterránea, incluye figuras humanas y escenas dinámicas de caza, danza o recolección.`,
      commonMistakes: [
        'Mezclar arte cantábrico y levantino sin comparar criterios claros.',
        'Olvidar cronología y localización.',
        'Responder solo con ejemplos sin explicar rasgos.',
      ],
    }
  }

  const practice = `Redacta una respuesta PAU de 8-10 líneas sobre ${item.title}, incorporando al menos tres conceptos: ${item.tags.slice(0, 3).join(', ')}.`
  return {
    guidedExample: `Pregunta: explica la importancia histórica de ${item.title}.

**Respuesta modelo breve:**

${item.title} debe situarse dentro del bloque de ${item.blockTitle}. Para responder bien conviene ordenar la explicación en contexto, causas, desarrollo y consecuencias. En una respuesta PAU deben aparecer conceptos como ${item.tags.slice(0, 3).join(', ')}, conectados con una idea central y no como una lista suelta.

**Estructura recomendada:**

1. Presenta el marco cronológico.
2. Explica dos rasgos o causas.
3. Añade consecuencias.
4. Cierra con una frase de síntesis.`,
    practicePrompt: practice,
    appliedExercise: practice,
    referenceSolution: `Una respuesta válida sitúa ${item.title} en ${item.blockTitle}, usa correctamente ${item.tags.slice(0, 3).join(', ')} y organiza causas, desarrollo y consecuencias con redacción histórica.`,
    commonMistakes: [
      'Responder con una lista de conceptos sin relación causal.',
      'No situar el tema en su periodo histórico.',
      'Olvidar consecuencias o valoración final.',
    ],
  }
}

function topicLessonContent(item: TopicInput): TopicLessonContent {
  if (item.subject === 'matematicas_ii' || item.subject === 'matematicas_ccss') return mathContent(item)
  if (item.subject === 'lengua') return lenguaContent()
  return historiaContent(item)
}

function compactLesson(item: TopicInput) {
  const tags = item.tags.slice(0, 4).join(', ')
  const content = topicLessonContent(item)
  return {
    explanation: [
      `Qué es: ${item.title} es una unidad de ${item.blockTitle} que debes reconocer antes de pasar a práctica PAU.`,
      `Teoría rápida: ${theoryText(item)}`,
      `Para qué sirve: te ayuda a resolver ejercicios donde aparecen ${tags}.`,
      `Cuándo se usa en PAU: cuando el enunciado pide explicar, calcular, justificar o redactar una respuesta del bloque ${item.blockTitle}.`,
      `Error típico: aprender el nombre del tema sin conectar el procedimiento con el tipo de pregunta.`,
    ].join('\n\n'),
    guidedExample: content.guidedExample,
    practicePrompt: content.practicePrompt,
    appliedExercise: content.appliedExercise,
    referenceSolution: content.referenceSolution,
    commonMistakes: content.commonMistakes,
    rawLatex: '',
  }
}

function topic(input: TopicInput): CaminoCurriculumTopic {
  const lesson = compactLesson(input)
  return {
    ...input,
    contentStatus: 'latex_notes',
    ...lesson,
    evauPracticeQuery: {
      subject: input.subject === 'matematicas_ii' ? 'mates' : input.subject === 'matematicas_ccss' ? 'matematicas_ccss' : input.subject === 'lengua' ? 'lengua' : input.subject === 'historia_espana' ? 'historia' : input.subject,
      block: input.blockSlug,
      topic: input.topicSlug,
    },
    progressCriteria: {
      seen: 'El alumno abre la explicación del curso.',
      practiced: 'El alumno entrega el ejercicio aplicado.',
      completed: 'El ejercicio aplicado queda corregido con Kairo.',
      mastered: 'El alumno completa ejercicio aplicado y PAU del mismo tema con nota suficiente.',
    },
    examTags: input.tags,
    estimatedMinutes: input.minutes ?? 25,
    source: 'private_beta_latex_pack',
    compatibleSubjects: [input.subject],
    v2SortOrder: input.orderIndex,
  }
}

export const PRIVATE_BETA_CURRICULUM_TOPICS: CaminoCurriculumTopic[] = [
  topic({ subject: 'matematicas_ii', orderIndex: 1, blockSlug: 'algebra', blockTitle: 'Álgebra', topicSlug: 'matrices-operaciones', title: 'Matrices y operaciones básicas', tags: ['matrices', 'operaciones', 'producto', 'inversa'] }),
  topic({ subject: 'matematicas_ii', orderIndex: 2, blockSlug: 'algebra', blockTitle: 'Álgebra', topicSlug: 'producto-por-un-escalar', title: 'Producto por un Escalar', tags: ['matrices', 'producto escalar', 'número por matriz'], prerequisites: ['matrices-operaciones'] }),
  topic({ subject: 'matematicas_ii', orderIndex: 3, blockSlug: 'algebra', blockTitle: 'Álgebra', topicSlug: 'multiplicacion-de-matrices', title: 'Multiplicación de Matrices (A · B)', tags: ['matrices', 'producto', 'filas por columnas', 'dimensiones'], prerequisites: ['producto-por-un-escalar'] }),
  topic({ subject: 'matematicas_ii', orderIndex: 4, blockSlug: 'algebra', blockTitle: 'Álgebra', topicSlug: 'determinantes-inversa-rango', title: 'Determinantes, inversa y rango', tags: ['determinantes', 'Sarrus', 'inversa', 'rango'], prerequisites: ['multiplicacion-de-matrices'] }),
  topic({ subject: 'matematicas_ii', orderIndex: 5, blockSlug: 'algebra', blockTitle: 'Álgebra', topicSlug: 'sistemas-gauss-rouche', title: 'Sistemas, Gauss y Rouché-Frobenius', tags: ['sistemas', 'Gauss', 'Rouché-Frobenius', 'parámetros'], prerequisites: ['determinantes-inversa-rango'] }),
  topic({ subject: 'matematicas_ii', orderIndex: 6, blockSlug: 'geometria-3d', blockTitle: 'Geometría', topicSlug: 'vectores-productos', title: 'Vectores, producto escalar y vectorial', tags: ['vectores', 'producto escalar', 'producto vectorial', 'perpendicularidad'] }),
  topic({ subject: 'matematicas_ii', orderIndex: 7, blockSlug: 'geometria-3d', blockTitle: 'Geometría', topicSlug: 'rectas-planos-posiciones', title: 'Rectas, planos y posiciones relativas', tags: ['rectas', 'planos', 'intersección', 'posición relativa'], prerequisites: ['vectores-productos'] }),
  topic({ subject: 'matematicas_ii', orderIndex: 8, blockSlug: 'analisis', blockTitle: 'Análisis', topicSlug: 'limites-continuidad-asintotas', title: 'Límites, continuidad y asíntotas', tags: ['límites', 'continuidad', 'asíntotas', 'indeterminaciones'] }),
  topic({ subject: 'matematicas_ii', orderIndex: 9, blockSlug: 'analisis', blockTitle: 'Análisis', topicSlug: 'derivadas-tangente-optimizacion', title: 'Derivadas, tangente y optimización', tags: ['derivadas', 'recta tangente', 'Rolle', 'optimización'], prerequisites: ['limites-continuidad-asintotas'] }),
  topic({ subject: 'matematicas_ii', orderIndex: 10, blockSlug: 'integrales', blockTitle: 'Integrales', topicSlug: 'primitivas-barrow-areas', title: 'Primitivas, Barrow y áreas', tags: ['integrales', 'primitivas', 'Barrow', 'áreas'], prerequisites: ['derivadas-tangente-optimizacion'] }),
  topic({ subject: 'matematicas_ii', orderIndex: 11, blockSlug: 'probabilidad', blockTitle: 'Probabilidad', topicSlug: 'condicionada-total-bayes-binomial-normal', title: 'Condicionada, total, Bayes, binomial y normal', tags: ['condicionada', 'total', 'Bayes', 'binomial', 'normal'] }),

  topic({ subject: 'matematicas_ccss', orderIndex: 1, blockSlug: 'algebra', blockTitle: 'Álgebra', topicSlug: 'matrices-sistemas-gauss', title: 'Matrices, sistemas y Gauss', tags: ['matrices', 'sistemas', 'Gauss', 'inversa'] }),
  topic({ subject: 'matematicas_ccss', orderIndex: 2, blockSlug: 'algebra', blockTitle: 'Álgebra', topicSlug: 'programacion-lineal', title: 'Programación lineal', tags: ['restricciones', 'región factible', 'función objetivo', 'optimización'] }),
  topic({ subject: 'matematicas_ccss', orderIndex: 3, blockSlug: 'analisis', blockTitle: 'Análisis', topicSlug: 'limites-asintotas-continuidad', title: 'Límites, asíntotas y continuidad', tags: ['límites', 'asíntotas', 'continuidad', 'funciones a trozos'] }),
  topic({ subject: 'matematicas_ccss', orderIndex: 4, blockSlug: 'analisis', blockTitle: 'Análisis', topicSlug: 'derivadas-optimizacion-economica', title: 'Derivadas y optimización económica', tags: ['derivadas', 'costes', 'ingresos', 'beneficios', 'inflexión'], prerequisites: ['limites-asintotas-continuidad'] }),
  topic({ subject: 'matematicas_ccss', orderIndex: 5, blockSlug: 'probabilidad', blockTitle: 'Probabilidad', topicSlug: 'sucesos-tablas-bayes', title: 'Sucesos, tablas, árboles y Bayes', tags: ['Laplace', 'condicionada', 'árboles', 'Bayes'] }),
  topic({ subject: 'matematicas_ccss', orderIndex: 6, blockSlug: 'inferencia', blockTitle: 'Inferencia', topicSlug: 'intervalos-confianza-contrastes', title: 'Intervalos de confianza y contraste', tags: ['muestra', 'proporciones', 'error máximo', 'contraste'] }),

  topic({ subject: 'lengua', orderIndex: 1, blockSlug: 'comentario-texto-pau', blockTitle: 'Comentario de texto PAU', topicSlug: 'organizacion-ideas', title: 'Organización de ideas', tags: ['estructura', 'tesis', 'argumentos', 'partes'] }),
  topic({ subject: 'lengua', orderIndex: 2, blockSlug: 'comentario-texto-pau', blockTitle: 'Comentario de texto PAU', topicSlug: 'tema-resumen', title: 'Tema y resumen', tags: ['tema', 'resumen', 'objetividad', 'síntesis'] }),
  topic({ subject: 'lengua', orderIndex: 3, blockSlug: 'comentario-texto-pau', blockTitle: 'Comentario de texto PAU', topicSlug: 'comentario-critico', title: 'Comentario crítico', tags: ['tesis propia', 'argumentación', 'conectores', 'valoración'] }),
  topic({ subject: 'lengua', orderIndex: 4, blockSlug: 'comentario-texto-pau', blockTitle: 'Comentario de texto PAU', topicSlug: 'adecuacion-coherencia-cohesion', title: 'Adecuación, coherencia y cohesión', tags: ['registro', 'progresión', 'cohesión', 'marcadores'] }),
  topic({ subject: 'lengua', orderIndex: 5, blockSlug: 'gramatica-lexico', blockTitle: 'Gramática y léxico', topicSlug: 'valores-se', title: 'Valores de SE', tags: ['se reflexivo', 'pasiva refleja', 'impersonal', 'dativo'] }),
  topic({ subject: 'lengua', orderIndex: 6, blockSlug: 'gramatica-lexico', blockTitle: 'Gramática y léxico', topicSlug: 'oracion-compuesta', title: 'Oración compuesta', tags: ['subordinadas', 'coordinadas', 'nexos', 'funciones'] }),
  topic({ subject: 'lengua', orderIndex: 7, blockSlug: 'literatura', blockTitle: 'Literatura', topicSlug: 'modernismo-generacion-98', title: 'Modernismo y Generación del 98', tags: ['Modernismo', '98', 'Rubén Darío', 'Unamuno'] }),
  topic({ subject: 'lengua', orderIndex: 8, blockSlug: 'literatura', blockTitle: 'Literatura', topicSlug: 'vanguardias-generacion-27', title: 'Vanguardias y Generación del 27', tags: ['vanguardias', 'Generación del 27', 'Lorca', 'poesía'] }),

  topic({ subject: 'historia_espana', orderIndex: 1, blockSlug: 'raices-historicas', blockTitle: 'Raíces históricas', topicSlug: 'origenes-reino-visigodo', title: 'De los orígenes al reino visigodo', tags: ['prehistoria', 'romanización', 'visigodos', 'pueblos prerromanos'] }),
  topic({ subject: 'historia_espana', orderIndex: 2, blockSlug: 'edad-media', blockTitle: 'Edad Media', topicSlug: 'edad-media-peninsular', title: 'La Península en la Edad Media', tags: ['Al-Ándalus', 'reinos cristianos', 'taifas', 'Reconquista'] }),
  topic({ subject: 'historia_espana', orderIndex: 3, blockSlug: 'edad-moderna', blockTitle: 'Edad Moderna', topicSlug: 'edad-moderna', title: 'España en la Edad Moderna', tags: ['Reyes Católicos', 'Austrias', 'Borbones', 'América'] }),
  topic({ subject: 'historia_espana', orderIndex: 4, blockSlug: 'crisis-antiguo-regimen', blockTitle: 'Crisis del Antiguo Régimen', topicSlug: 'crisis-antiguo-regimen', title: 'La crisis del Antiguo Régimen en España', tags: ['1808', 'Guerra de Independencia', 'Cádiz', 'Fernando VII'] }),
  topic({ subject: 'historia_espana', orderIndex: 5, blockSlug: 'estado-liberal', blockTitle: 'Estado liberal', topicSlug: 'construccion-estado-liberal', title: 'La construcción del Estado liberal', tags: ['Isabel II', 'carlismo', 'moderados', 'progresistas'] }),
  topic({ subject: 'historia_espana', orderIndex: 6, blockSlug: 'restauracion', blockTitle: 'Restauración', topicSlug: 'restauracion', title: 'El régimen de la Restauración', tags: ['Cánovas', 'turnismo', 'caciquismo', 'Constitución de 1876'] }),
  topic({ subject: 'historia_espana', orderIndex: 7, blockSlug: 'siglo-xx', blockTitle: 'Siglo XX', topicSlug: 'segunda-republica', title: 'La II República', tags: ['Constitución de 1931', 'reformas', 'Azaña', 'conflicto social'] }),
  topic({ subject: 'historia_espana', orderIndex: 8, blockSlug: 'siglo-xx', blockTitle: 'Siglo XX', topicSlug: 'guerra-civil', title: 'La Guerra Civil', tags: ['sublevación', 'bandos', 'no intervención', 'consecuencias'] }),
  topic({ subject: 'historia_espana', orderIndex: 9, blockSlug: 'franquismo-democracia', blockTitle: 'Franquismo y democracia', topicSlug: 'franquismo', title: 'El franquismo', tags: ['dictadura', 'autarquía', 'desarrollismo', 'oposición'] }),
  topic({ subject: 'historia_espana', orderIndex: 10, blockSlug: 'franquismo-democracia', blockTitle: 'Franquismo y democracia', topicSlug: 'transicion-democracia', title: 'La Transición y la Constitución de 1978', tags: ['Transición', 'Constitución de 1978', 'autonomías', 'democracia'] }),

  topic({ subject: 'fisica', orderIndex: 1, blockSlug: 'campo-gravitatorio', blockTitle: 'Campo Gravitatorio', topicSlug: 'campo-gravitatorio', title: 'Campo Gravitatorio', tags: ['gravitación', 'campo gravitatorio', 'energía potencial', 'velocidad orbital'] }),
  topic({ subject: 'fisica', orderIndex: 2, blockSlug: 'campo-electromagnetico', blockTitle: 'Campo Electromagnético', topicSlug: 'campo-electromagnetico', title: 'Campo Electromagnético', tags: ['campo eléctrico', 'ley de Coulomb', 'fuerza de Lorentz', 'inducción electromagnética'], prerequisites: ['campo-gravitatorio'] }),
  topic({ subject: 'fisica', orderIndex: 3, blockSlug: 'vibraciones-ondas', blockTitle: 'Vibraciones y Ondas', topicSlug: 'vibraciones-ondas', title: 'Vibraciones y Ondas', tags: ['MAS', 'ondas', 'sonido', 'efecto Doppler'] }),
  topic({ subject: 'fisica', orderIndex: 4, blockSlug: 'optica-geometrica', blockTitle: 'Óptica Geométrica', topicSlug: 'optica-geometrica', title: 'Óptica Geométrica', tags: ['refracción', 'ley de Snell', 'lentes', 'espejos'], prerequisites: ['vibraciones-ondas'] }),
  topic({ subject: 'fisica', orderIndex: 5, blockSlug: 'fisica-siglo-xx', blockTitle: 'Física del Siglo XX', topicSlug: 'fisica-siglo-xx', title: 'Física del Siglo XX', tags: ['relatividad', 'efecto fotoeléctrico', 'modelo de Bohr', 'radiactividad'] }),

  topic({ subject: 'quimica', orderIndex: 1, blockSlug: 'estequiometria', blockTitle: 'Estequiometría', topicSlug: 'estequiometria', title: 'Estequiometría', tags: ['mol', 'Avogadro', 'leyes ponderales', 'cálculos estequiométricos'] }),
  topic({ subject: 'quimica', orderIndex: 2, blockSlug: 'estructura-atomica', blockTitle: 'Estructura Atómica y Clasificación Periódica', topicSlug: 'estructura-atomica', title: 'Estructura Atómica y Clasificación Periódica', tags: ['configuración electrónica', 'tabla periódica', 'propiedades periódicas'], prerequisites: ['estequiometria'] }),
  topic({ subject: 'quimica', orderIndex: 3, blockSlug: 'enlace-quimico', blockTitle: 'Enlace Químico y Propiedades de las Sustancias', topicSlug: 'enlace-quimico', title: 'Enlace Químico y Propiedades de las Sustancias', tags: ['enlace iónico', 'enlace covalente', 'enlace metálico', 'fuerzas intermoleculares'], prerequisites: ['estructura-atomica'] }),
  topic({ subject: 'quimica', orderIndex: 4, blockSlug: 'termoquimica', blockTitle: 'Termoquímica', topicSlug: 'termoquimica', title: 'Termoquímica', tags: ['entalpía', 'ley de Hess', 'espontaneidad', 'entropía'] }),
  topic({ subject: 'quimica', orderIndex: 5, blockSlug: 'equilibrio-cinetica', blockTitle: 'Equilibrio Químico y Cinética', topicSlug: 'equilibrio-cinetica', title: 'Equilibrio Químico y Cinética', tags: ['Kc', 'Kp', 'Le Chatelier', 'velocidad de reacción'], prerequisites: ['termoquimica'] }),
  topic({ subject: 'quimica', orderIndex: 6, blockSlug: 'acido-base', blockTitle: 'Ácido-Base', topicSlug: 'acido-base', title: 'Ácido-Base', tags: ['pH', 'Ka', 'Kb', 'valoraciones ácido-base'], prerequisites: ['equilibrio-cinetica'] }),
  topic({ subject: 'quimica', orderIndex: 7, blockSlug: 'electroquimica', blockTitle: 'Electroquímica', topicSlug: 'electroquimica', title: 'Electroquímica', tags: ['redox', 'pilas', 'electrólisis', 'potenciales de reducción'] }),
  topic({ subject: 'quimica', orderIndex: 8, blockSlug: 'quimica-organica', blockTitle: 'Química Orgánica', topicSlug: 'quimica-organica', title: 'Química Orgánica', tags: ['grupos funcionales', 'nomenclatura orgánica', 'isomería', 'reacciones orgánicas'] }),
].map(item => ({
  ...item,
  orderIndex: item.subject === 'matematicas_ii'
    ? item.orderIndex
    : item.orderIndex + subjectOffset(item.subject as PrivateBetaSubject),
}))

function subjectOffset(subject: PrivateBetaSubject) {
  if (subject === 'matematicas_ccss') return 1000
  if (subject === 'lengua') return 2000
  if (subject === 'historia_espana') return 3000
  if (subject === 'fisica') return 4000
  if (subject === 'quimica') return 5000
  return 0
}
