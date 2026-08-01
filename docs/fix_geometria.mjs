// Uso: node --env-file=.env.local docs/fix_geometria.mjs
// Corrige el markdown de producto-vectorial:
//   - \n dentro de headings ## (partían el título del acordeón)
//   - ** cerrado dentro de $...$ (corrompía bold + math)
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
)

const content_markdown = `
## 1. Repaso: Puntos y Vectores en el Plano ($\\mathbb{R}^2$)

Un punto representa una posición en el plano. Un vector representa un desplazamiento (dirección, sentido y longitud) entre dos puntos.

- **Vector entre dos puntos:** Dados $A(x_1, y_1)$ y $B(x_2, y_2)$, el vector $\\overrightarrow{AB}$ se calcula restando el destino menos el origen:

$$
\\overrightarrow{AB} = B - A = (x_2 - x_1, \\ y_2 - y_1)
$$

- **Punto medio:** El punto medio $M$ de un segmento $AB$ es la media aritmética de sus coordenadas: $M = \\left(\\frac{x_1+x_2}{2}, \\frac{y_1+y_2}{2}\\right)$.

### Caso Práctico: Vector y Punto Medio

Dados los puntos $A(-1, 4)$ y $B(3, 2)$ en el plano:

- **Vector $\\overrightarrow{AB}$:** $B - A = (3 - (-1), \\ 2 - 4) = \\mathbf{(4, \\ -2)}$
- **Punto medio $M$:** $M = \\left(\\frac{-1+3}{2}, \\ \\frac{4+2}{2}\\right) = \\left(\\frac{2}{2}, \\ \\frac{6}{2}\\right) = \\mathbf{(1, \\ 3)}$

## 2. Vectores en el Espacio ($\\mathbb{R}^3$)

En el espacio tridimensional trabajamos con tres ejes perpendiculares ($X$, $Y$, $Z$). Un vector en el espacio viene definido por tres componentes: $\\vec{u} = (u_1, u_2, u_3)$.

- **Módulo de un vector ($||\\vec{u}||$):** Es la longitud o tamaño del vector. Se calcula con el teorema de Pitágoras tridimensional:

$$
||\\vec{u}|| = \\sqrt{(u_1)^2 + (u_2)^2 + (u_3)^2}
$$

### Caso Práctico: Módulo de un Vector

Calcula la longitud (módulo) del vector en el espacio $\\vec{u} = (1, \\ -2, \\ 2)$:

$$
||\\vec{u}|| = \\sqrt{1^2 + (-2)^2 + 2^2} = \\sqrt{1 + 4 + 4} = \\sqrt{9} = \\mathbf{3}
$$

## 3. Operaciones Elementales con Vectores

Se realizan de forma intuitiva, componente a componente:

- **Suma y Resta:** $\\vec{u} \\pm \\vec{v} = (u_1 \\pm v_1, \\ u_2 \\pm v_2, \\ u_3 \\pm v_3)$
- **Producto por un número (Escalar):** $k \\cdot \\vec{u} = (k \\cdot u_1, \\ k \\cdot u_2, \\ k \\cdot u_3)$
- **Vectores paralelos:** Dos vectores son paralelos (tienen la misma dirección) si sus componentes son proporcionales: $\\frac{u_1}{v_1} = \\frac{u_2}{v_2} = \\frac{u_3}{v_3} = k$.

### Caso Práctico: Combinación Lineal y Paralelismo

Sean $\\vec{u} = (2, \\ 0, \\ -1)$ y $\\vec{v} = (1, \\ 3, \\ 4)$. Calcula la combinación $3\\vec{u} - 2\\vec{v}$:

$$
3\\vec{u} - 2\\vec{v} = 3(2, \\ 0, \\ -1) - 2(1, \\ 3, \\ 4) = (6, \\ 0, \\ -3) - (2, \\ 6, \\ 8) = \\mathbf{(4, \\ -6, \\ -11)}
$$

## 4. Dependencia Lineal y Rango de Vectores

Sirve para saber si un conjunto de vectores aporta información nueva o si están "repetidos" (son paralelos o combinaciones de otros).

- **Linealmente Dependientes (L.D.):** Uno de ellos se puede escribir como combinación de los demás. Si metemos los vectores en una matriz, su determinante dará **cero**.
- **Linealmente Independientes (L.I.):** Ninguno se puede obtener a partir de los otros. Su determinante asociado es **distinto de cero**.
- **Rango del conjunto:** Es el número máximo de vectores L.I. que contiene. Se calcula buscando el rango de la matriz que forman.

### Caso Práctico: Estudiar Independencia Lineal

Estudia si los vectores $\\vec{u}=(1,0,2)$, $\\vec{v}=(0,1,1)$ y $\\vec{w}=(1,1,3)$ son L.I. o L.D.:

- Planteamos el determinante con los vectores colocados por filas:

$$
\\begin{vmatrix} 1 & 0 & 2 \\\\ 0 & 1 & 1 \\\\ 1 & 1 & 3 \\end{vmatrix} = (3 + 0 + 0) - (2 + 1 + 0) = 3 - 3 = \\mathbf{0}
$$

- Como el determinante es **igual a 0**, los vectores son **Linealmente Dependientes (L.D.)**. No forman una base del espacio.

## 5. Base y Sistema de Referencia en el Espacio

- **Base:** Tres vectores cualesquiera del espacio que sean **Linealmente Independientes** forman una base. Esto significa que cualquier otro vector se puede escribir como combinación de ellos de forma única.
- **Base Canónica:** Es la base estándar formada por los vectores unitarios y perpendiculares de los ejes coordenados: $\\vec{i}=(1,0,0)$, $\\vec{j}=(0,1,0)$, $\\vec{k}=(0,0,1)$.
- **Sistema de Referencia ($R$):** Formado por un punto origen $O(0,0,0)$ y una base. Nos permite localizar cualquier punto del espacio mediante coordenadas.

### Caso Práctico: Expresar en la Base Canónica

Si un vector tiene componentes $\\vec{v} = (5, \\ -3, \\ 8)$, escribir su expresión analítica usando los vectores de la base canónica:

$$
\\vec{v} = 5\\vec{i} - 3\\vec{j} + 8\\vec{k}
$$

## 6. Producto Escalar de dos Vectores ($\\vec{u} \\cdot \\vec{v}$)

**¡Cuidado!:** El resultado del producto escalar es un **NÚMERO**, no un vector.

- **Fórmula analítica:** Multiplicar componente a componente y sumar:

$$
\\vec{u} \\cdot \\vec{v} = u_1 \\cdot v_1 + u_2 \\cdot v_2 + u_3 \\cdot v_3
$$

- **Fórmula geométrica:** $\\vec{u} \\cdot \\vec{v} = ||\\vec{u}|| \\cdot ||\\vec{v}|| \\cdot \\cos(\\alpha)$ (donde $\\alpha$ es el ángulo entre ambos).
- **Cálculo del Ángulo:** $\\cos(\\alpha) = \\frac{\\vec{u} \\cdot \\vec{v}}{||\\vec{u}|| \\cdot ||\\vec{v}||}$
- **Condición de Perpendicularidad ($\\vec{u} \\perp \\vec{v}$):** Dos vectores son perpendiculares si y solo si su producto escalar es **CERO** ($\\vec{u} \\cdot \\vec{v} = 0$).

### Caso Práctico: Producto Escalar y Perpendicularidad

Determina si los vectores $\\vec{u} = (2, \\ 3, \\ -1)$ y $\\vec{v} = (5, \\ -2, \\ 4)$ son perpendiculares:

- Calculamos el producto escalar:

$$
\\vec{u} \\cdot \\vec{v} = 2 \\cdot 5 + 3 \\cdot (-2) + (-1) \\cdot 4 = 10 - 6 - 4 = \\mathbf{0}
$$

- Como el resultado es **0**, concluimos que los vectores son **perpendiculares** ($\\vec{u} \\perp \\vec{v}$).

## 7. Producto Vectorial ($\\vec{u} \\times \\vec{v}$)

**¡Cuidado!:** El resultado del producto vectorial es un **VECTOR**. Este vector resultante tiene la propiedad de ser **perpendicular a la vez** a los dos vectores originales.

- **Cómo se calcula:** Se resuelve planteando un determinante ficticio donde la primera fila son los vectores de la base canónica $\\vec{i}, \\vec{j}, \\vec{k}$:

$$
\\vec{u} \\times \\vec{v} = \\begin{vmatrix} \\vec{i} & \\vec{j} & \\vec{k} \\\\ u_1 & u_2 & u_3 \\\\ v_1 & v_2 & v_3 \\end{vmatrix}
$$

- **Aplicación geométrica:** El módulo del producto vectorial $||\\vec{u} \\times \\vec{v}||$ mide exactamente el **Área del Paralelogramo** que forman ambos vectores.
- El **Área del Triángulo** será la mitad: $\\text{Área} = \\frac{1}{2} ||\\vec{u} \\times \\vec{v}||$.

### Caso Práctico: Calcular Producto Vectorial y Área

Halla el área del triángulo determinado por los vectores $\\vec{u} = (1, \\ 2, \\ 0)$ y $\\vec{v} = (0, \\ 3, \\ 1)$:

- **Cálculo de $\\vec{u} \\times \\vec{v}$ por Sarrus:**

$$
\\begin{vmatrix} \\vec{i} & \\vec{j} & \\vec{k} \\\\ 1 & 2 & 0 \\\\ 0 & 3 & 1 \\end{vmatrix} = (2\\vec{i} + 0 + 3\\vec{k}) - (0 + 0 + 1\\vec{j}) = 2\\vec{i} - 1\\vec{j} + 3\\vec{k} \\rightarrow \\mathbf{(2, \\ -1, \\ 3)}
$$

- **Módulo del vector resultante (Área del paralelogramo):**

$$
||\\vec{u} \\times \\vec{v}|| = \\sqrt{2^2 + (-1)^2 + 3^2} = \\sqrt{4 + 1 + 9} = \\sqrt{14}
$$

- **Área del triángulo:** $\\frac{\\sqrt{14}}{2} \\approx \\mathbf{1.87}$.

## 8. Producto Mixto

Combina el producto escalar y el vectorial de tres vectores. El resultado es un **NÚMERO**.

- **Cómo se calcula:** Es sencillamente el determinante de la matriz formada por los tres vectores colocados en filas:

$$
[\\vec{u}, \\vec{v}, \\vec{w}] = \\begin{vmatrix} u_1 & u_2 & u_3 \\\\ v_1 & v_2 & v_3 \\\\ w_1 & w_2 & w_3 \\end{vmatrix}
$$

- **Aplicación geométrica:** El valor absoluto del producto mixto representa el **Volumen del Paralelepípedo** (caja tridimensional) que forman los tres vectores.
- El **Volumen del Tetraedro** (pirámide triangular) que forman es la sexta parte: $\\text{Volumen} = \\frac{1}{6} |[\\vec{u}, \\vec{v}, \\vec{w}]|$.

### Caso Práctico: Volumen de un Tetraedro

Calcula el volumen del tetraedro delimitado por los vectores $\\vec{u}=(1,1,0)$, $\\vec{v}=(0,2,1)$ y $\\vec{w}=(2,0,3)$:

- **Calculamos el determinante del Producto Mixto:**

$$
[\\vec{u}, \\vec{v}, \\vec{w}] = \\begin{vmatrix} 1 & 1 & 0 \\\\ 0 & 2 & 1 \\\\ 2 & 0 & 3 \\end{vmatrix} = (6 + 2 + 0) - (0 + 0 + 0) = \\mathbf{8}
$$

- **Aplicamos la fórmula del volumen del tetraedro:**

$$
\\text{Volumen} = \\frac{1}{6} \\cdot |8| = \\frac{8}{6} = \\mathbf{\\frac{4}{3} \\approx 1.33}
$$

## 9. La Recta en el Espacio (Ecuaciones)

Una recta se define con un punto $A(x_0, y_0, z_0)$ y un vector director $\\vec{v}(v_1, v_2, v_3)$:

- **Vectorial:** $(x, y, z) = (x_0, y_0, z_0) + \\lambda(v_1, v_2, v_3)$
- **Paramétricas:** $\\begin{cases} x = x_0 + \\lambda v_1 \\\\ y = y_0 + \\lambda v_2 \\\\ z = z_0 + \\lambda v_3 \\end{cases}$
- **Continua:** $\\frac{x - x_0}{v_1} = \\frac{y - y_0}{v_2} = \\frac{z - z_0}{v_3}$
- **Implícitas / Cartesianas:** Intersección de dos planos $\\begin{cases} Ax + By + Cz + D = 0 \\\\ A'x + B'y + C'z + D' = 0 \\end{cases}$

### Caso Práctico: Ecuaciones de la Recta

Halla las ecuaciones de la recta que pasa por $A(1, -2, 3)$ con dirección $\\vec{v}(4, 0, -1)$:

- **Continua:** $\\frac{x - 1}{4} = \\frac{y + 2}{0} = \\frac{z - 3}{-1}$
- **Paramétricas:** $\\begin{cases} x = 1 + 4\\lambda \\\\ y = -2 \\\\ z = 3 - \\lambda \\end{cases}$

## 10. El Plano en el Espacio

Un plano se genera con un punto $A(x_0, y_0, z_0)$ y dos vectores directores, o bien mediante un **vector normal** $\\vec{n}(A, B, C)$ perpendicular a la superficie.

- **Ecuación General o Implícita:** $Ax + By + Cz + D = 0$
- Si nos dan tres puntos ($A$, $B$ y $C$), calculamos los vectores $\\overrightarrow{AB}$ y $\\overrightarrow{AC}$, resolviendo el determinante:

$$
\\begin{vmatrix} x - x_0 & y - y_0 & z - z_0 \\\\ u_1 & u_2 & u_3 \\\\ v_1 & v_2 & v_3 \\end{vmatrix} = 0
$$

### Caso Práctico: Ecuación del Plano

Determina la ecuación del plano que pasa por $A(2, 0, 1)$ y tiene como vector normal $\\vec{n}(1, -3, 2)$:

- Usamos los componentes de $\\vec{n}$ para el inicio de la ecuación: $1x - 3y + 2z + D = 0$.
- Sustituimos el punto $A$ para despejar $D$: $1(2) - 3(0) + 2(1) + D = 0 \\longrightarrow 2 + 2 + D = 0 \\longrightarrow D = -4$.
- **Resultado:** $x - 3y + 2z - 4 = 0$.

## 11. Posiciones Relativas (Apartados 3 y 4 del PDF)

Estudio de la disposición de los elementos en el espacio analizando sus vectores directores ($\\vec{u}, \\vec{v}$) o normales ($\\vec{n}$):

- **Entre dos rectas:** Si sus directores son proporcionales, son **paralelas** o **coincidentes**. Si no lo son, calculamos el determinante con el vector puente $\\overrightarrow{AB}$: si da cero **se cortan**, si no da cero **se cruzan**.
- **Entre recta y plano:** Calculamos el producto escalar $\\vec{v} \\cdot \\vec{n}$. Si es distinto de cero, son **secantes** (se cortan). Si da cero, la recta es **paralela** o está **contenida**.

### Caso Práctico: Recta y Plano

Estudia la posición de la recta con director $\\vec{v}(1, 2, -1)$ y el plano de ecuación normal $2x - y + 3z - 1 = 0$:

- Identificamos el vector normal del plano: $\\vec{n}(2, -1, 3)$.
- Realizamos el producto escalar: $\\vec{v} \\cdot \\vec{n} = 1(2) + 2(-1) + (-1)(3) = 2 - 2 - 3 = -3$.
- Como $-3 \\neq 0$, la recta y el plano son **secantes** y se cortan en un único punto.

## 12. Ángulos en el Espacio (Apartado 1 del PDF)

Todos se resuelven con el producto escalar en valor absoluto (para asegurar el ángulo agudo):

- **Dos rectas o dos planos:** Se aplica la función coseno habitual:

$$
\\cos(\\alpha) = \\frac{|\\vec{u} \\cdot \\vec{v}|}{||\\vec{u}|| \\cdot ||\\vec{v}||}
$$

- **Entre recta y plano:** Al combinar un vector de dirección con uno normal, la fórmula del ángulo cambia a la función **SENO**:

$$
\\sin(\\alpha) = \\frac{|\\vec{v} \\cdot \\vec{n}|}{||\\vec{v}|| \\cdot ||\\vec{n}||}
$$

### Caso Práctico: Ángulo Recta-Plano

Halla el ángulo entre la recta con director $\\vec{v}(1, 0, 1)$ y el plano con normal $\\vec{n}(1, 1, 0)$:

- $\\vec{v} \\cdot \\vec{n} = 1(1) + 0(1) + 1(0) = 1$
- $||\\vec{v}|| = \\sqrt{1^2+0^2+1^2} = \\sqrt{2}; \\quad ||\\vec{n}|| = \\sqrt{1^2+1^2+0^2} = \\sqrt{2}$
- Aplicamos la fórmula del seno: $\\sin(\\alpha) = \\frac{1}{\\sqrt{2} \\cdot \\sqrt{2}} = \\frac{1}{2}$
- Calculamos el arcoseno: $\\alpha = \\arcsin(0.5) = \\mathbf{30^\\circ}$.

## 13. Proyecciones Ortogonales y Puntos Simétricos (Apartado 2)

Conceptos clave para resolver figuras simétricas y reflexiones en el espacio:

- **Proyección de un punto $P$ sobre un plano $\\pi$:** Es el punto $M$ donde la recta perpendicular a $\\pi$ que pasa por $P$ corta al propio plano.
- **Punto Simétrico $P'$ respecto a un plano:** El punto de proyección $M$ actúa como el punto medio exacto del segmento que une $P$ con su simétrico $P'$. Por tanto:

$$
P' = 2M - P
$$

### Caso Práctico: Punto Simétrico respecto a un Plano

Halla el punto simétrico de $P(1, 0, 3)$ respecto al plano $\\pi: x + y + z - 1 = 0$:

- Creamos la recta perpendicular a $\\pi$ que pasa por $P$: $\\begin{cases} x = 1 + \\lambda \\\\ y = \\lambda \\\\ z = 3 + \\lambda \\end{cases}$
- Buscamos la proyección $M$ sustituyendo la recta en el plano: $(1+\\lambda) + (\\lambda) + (3+\\lambda) - 1 = 0 \\longrightarrow 3\\lambda + 3 = 0 \\longrightarrow \\lambda = -1$.
- Calculamos las coordenadas de $M$: $M(1-1, -1, 3-1) = M(0, -1, 2)$.
- Calculamos el punto simétrico $P'$: $P' = 2(0, -1, 2) - (1, 0, 3) = \\mathbf{(-1, -2, 1)}$.

## 14. Distancias en el Espacio (Apartado 3 del PDF)

Ecuaciones directas para calcular longitudes mínimas entre elementos métricos:

- **De Punto a Plano:** $d(P, \\pi) = \\frac{|Ax_0 + By_0 + Cz_0 + D|}{\\sqrt{A^2 + B^2 + C^2}}$
- **De Punto a Recta:** Usamos el módulo del producto vectorial:

$$
d(P, r) = \\frac{||\\overrightarrow{AP} \\times \\vec{v}||}{||\\vec{v}||}
$$

- **Entre dos rectas que se cruzan:** Dividimos el determinante del producto mixto entre el módulo del vectorial:

$$
d(r, s) = \\frac{|\\det(\\vec{u}, \\vec{v}, \\overrightarrow{AB})|}{||\\vec{u} \\times \\vec{v}||}
$$

### Caso Práctico: Distancia de Punto a Plano

Calcula la distancia desde el origen de coordenadas $O(0, 0, 0)$ al plano $\\pi: 3x - 4y + 5 = 0$:

- Aplicamos los valores en la fórmula correspondiente:

$$
d(O, \\pi) = \\frac{|3(0) - 4(0) + 5|}{\\sqrt{3^2 + (-4)^2 + 0^2}}
$$

- Resolvemos la expresión: $d(O, \\pi) = \\frac{5}{\\sqrt{9+16}} = \\frac{5}{\\sqrt{25}} = \\frac{5}{5} = \\mathbf{1 \\text{ unidad}}$.

## 15. Áreas y Volúmenes (Apartado 4 del PDF)

Aplicaciones geométricas definitivas de los productos vectoriales y mixtos:

- **Área de un Triángulo:** Mitad del módulo del producto vectorial de dos de sus vectores: $\\text{Área} = \\frac{1}{2} ||\\vec{u} \\times \\vec{v}||$.
- **Volumen de un Tetraedro:** La sexta parte del valor absoluto del determinante del producto mixto:

$$
\\text{Volumen} = \\frac{1}{6} |\\det(\\vec{u}, \\vec{v}, \\vec{w})|
$$

### Caso Práctico: Área de un Triángulo

Calcula el área del triángulo determinado por los vectores del espacio $\\vec{u}(2, 0, 0)$ y $\\vec{v}(0, 3, 0)$:

- Calculamos el producto vectorial de las direcciones:

$$
\\vec{u} \\times \\vec{v} = \\begin{vmatrix} \\vec{i} & \\vec{j} & \\vec{k} \\\\ 2 & 0 & 0 \\\\ 0 & 3 & 0 \\end{vmatrix} = 6\\vec{k} \\longrightarrow (0, 0, 6)
$$

- Obtenemos el módulo del vector resultante: $||(0, 0, 6)|| = \\sqrt{0^2+0^2+6^2} = 6$.
- Dividimos entre dos para hallar el área triangular: $\\text{Área} = \\frac{6}{2} = \\mathbf{3 \\text{ u}^2}$.
`

const { data, error } = await supabase
  .from('curriculum_content')
  .update({ content_markdown })
  .eq('subject', 'matematicas_ii')
  .eq('block_slug', 'geometria-3d')
  .eq('topic_slug', 'producto-vectorial')
  .select('topic_slug')

if (error) {
  console.error('[ERROR]', error.message)
} else {
  console.log('[OK]    producto-vectorial —', data?.length ?? 0, 'row(s) updated')
}
