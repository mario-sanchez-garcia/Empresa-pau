-- ════════════════════════════════════════
-- algebra-lineal:sistemas-gauss (slug existente)
-- Sistemas de Ecuaciones (Ch3)
INSERT INTO curriculum_content (subject, block_slug, topic_slug, content_markdown)
VALUES (
  'matematicas_ii',
  'algebra-lineal',
  'sistemas-gauss',
  $MDDOC$
## 12. Expresión Matricial de un Sistema

    Cualquier sistema de ecuaciones lineales se puede escribir de forma compacta como:
    
$$
A \cdot X = B
$$

    Donde **$A$** es la matriz de coeficientes, **$X$** es el vector de incógnitas $\begin{pmatrix} x \\ y \\ z \end{pmatrix}$ y **$B$** es el vector de términos independientes. La matriz ampliada se denota como **$A^*$** o **$(A|B)$**.

### Caso Práctico: Convertir a Matriz

    Dado el sistema: $\begin{cases} x + 2y - z = 3 \\ 3x - y = 1 \end{cases}$ su escritura matricial es:
    
$$
\underbrace{\begin{pmatrix} 1 & 2 & -1 \\ 3 & -1 & 0 \end{pmatrix}}_{A} \cdot \underbrace{\begin{pmatrix} x \\ y \\ z \end{pmatrix}}_{X} = \underbrace{\begin{pmatrix} 3 \\ 1 \end{pmatrix}}_{B} \quad \rightarrow \quad A^* = \left(\begin{array}{ccc|c} 1 & 2 & -1 & 3 \\ 3 & -1 & 0 & 1 \end{array}\right)
$$

## 13. Teorema de Rouché-Frobenius (Discusión)

    Sirve para saber cuántas soluciones tiene un sistema calculando el rango de la matriz normal ($A$) y de la ampliada ($A^*$):
    
        
- **Rango($A$) $\neq$ Rango($A^*$)** $\longrightarrow$ **Sistema Incompatible (SI):** No tiene solución.
        
- **Rango($A$) $=$ Rango($A^*$) $=$ nº incógnitas** $\longrightarrow$ **Sistema Compatible Determinado (SCD):** Solución única.
        
- **Rango($A$) $=$ Rango($A^*$) $<$ nº incógnitas** $\longrightarrow$ **Sistema Compatible Indeterminado (SCI):** Infinitas soluciones.
    

### Caso Práctico: Discusión de un Sistema

    Discutir el sistema cuya matriz ampliada escalonada por Gauss es $A^* = \left(\begin{array}{cc|c} 1 & 2 & 5 \\ 0 & 0 & 3 \end{array}\right)$ con incógnitas $x, y$:
    
        
- Mirando solo la izquierda de la barra, la fila de ceros hace que el **Rango($A$) = 1**.
        
- Mirando la matriz completa, el término independiente $3$ cuenta como fila activa, por tanto **Rango($A^*$) = 2**.
        
- Como **Rango($A$) $\neq$ Rango($A^*$)** ($1 \neq 2$), el sistema es **Incompatible (SI)** (no tiene solución).
    

## 13b. Sistemas Homogéneos

    Un sistema es **homogéneo** cuando todos sus términos independientes son cero ($A \cdot X = \mathbf{0}$). 
    
        
- **¡Ventaja!:** Siempre son **Compatibles** (siempre tienen solución), ya que el Rango($A$) siempre va a ser igual al Rango($A^*$).
        
- **Solución Trivial:** Siempre admiten la solución $x=0, y=0, z=0$.
        
- Si es **SCD** (Rango = nº incógnitas) $\rightarrow$ Solo tiene la solución trivial ($0,0,0$).
        
- Si es **SCI** (Rango < nº incógnitas) $\rightarrow$ Tiene infinitas soluciones además de la $(0,0,0)$.
    

### Caso Práctico: Sistema Homogéneo

    Discute el siguiente sistema sin resolverlo: $\begin{cases} x + 2y = 0 \\ 3x + 6y = 0 \end{cases}$
    
        
- Escribimos su matriz de coeficientes: $A = \begin{pmatrix} 1 & 2 \\ 3 & 6 \end{pmatrix}$.
        
- Calculamos su determinante para ver el rango: $|A| = (1\cdot6) - (2\cdot3) = 6 - 6 = 0$.
        
- Como el determinante da 0, el Rango($A$) no es 2, es **Rango($A$) = 1**.
        
- Al ser menor que el número de incógnitas ($1 < 2$), el sistema es **Compatible Indeterminado (SCI)**. Tiene infinitas soluciones además de la $(0,0)$.
    

## 14. Resolución por la Regla de Cramer

    Válido solo para sistemas **Compatibles Determinados (SCD)** que tengan el mismo número de ecuaciones que de incógnitas.
    Cada incógnita se calcula dividiendo el determinante de una matriz modificada entre el determinante de la matriz general $|A|$:
    
$$
x = \frac{|A_x|}{|A|}, \quad y = \frac{|A_y|}{|A|}, \quad z = \frac{|A_z|}{|A|}
$$

    Donde $A_x$ consiste en cambiar la columna de las $x$ por la columna de términos independientes ($B$).

### Caso Práctico: Método de Cramer

    Resolver el sistema: $\begin{cases} 1x + 2y = 5 \\ 3x + 7y = 17 \end{cases}$
    
        
- **Determinante principal:** $|A| = \begin{vmatrix} 1 & 2 \\ 3 & 7 \end{vmatrix} = (1\cdot7) - (2\cdot3) = 1$.
        
- **Calcular $|A_x|$ (sustituyendo la 1ª columna por $\begin{pmatrix** 5 \\ 17 \end{pmatrix}$):}
        
$$
|A_x| = \begin{vmatrix} \mathbf{5} & 2 \\ \mathbf{17} & 7 \end{vmatrix} = (5\cdot7) - (2\cdot17) = 35 - 34 = 1 \quad \rightarrow \quad x = \frac{|A_x|}{|A|} = \frac{1}{1} = 1
$$

        
- **Calcular $|A_y|$ (sustituyendo la 2ª columna por $\begin{pmatrix** 5 \\ 17 \end{pmatrix}$):}
        
$$
|A_y| = \begin{vmatrix} 1 & \mathbf{5} \\ 3 & \mathbf{17} \end{vmatrix} = (1\cdot17) - (5\cdot3) = 17 - 15 = 2 \quad \rightarrow \quad y = \frac{|A_y|}{|A|} = \frac{2}{1} = 2
$$

    
    **Solución única:** $x = 1, \ y = 2$.

## El Método de Gauss: Paso a Paso

    El objetivo es **escalonar la matriz**: hacer un triángulo de **ceros** por debajo de la diagonal principal.
    
    **El orden obligatorio para hacer los ceros es:**
    
$$
\begin{pmatrix}
    \bullet & \bullet & \bullet \\
    \mathbf{1^\circ} & \bullet & \bullet \\
    \mathbf{2^\circ} & \mathbf{3^\circ} & \bullet
    \end{pmatrix}
$$

    
        
- ****Paso 1:**** Hacer cero el $\mathbf{1^\circ}$ (Fila 2, Columna 1) $\rightarrow$ usando la **Fila 1**.
        
- ****Paso 2:**** Hacer cero el $\mathbf{2^\circ}$ (Fila 3, Columna 1) $\rightarrow$ usando la **Fila 1**.
        
- ****Paso 3:**** Hacer cero el $\mathbf{3^\circ}$ (Fila 3, Columna 2) $\rightarrow$ usando **SÓLO la Fila 2** (para no romper los ceros anteriores).
    

    **Truco "Multiplicar Cruzado":** Si quieres hacer un cero entre dos filas, multiplica cada fila por el primer número de la otra fila.

### Caso Práctico Paso a Paso

    Escalonar la matriz $A = \begin{pmatrix} 1 & 2 & -1 \\ 2 & 1 & 3 \\ 3 & 2 & 1 \end{pmatrix}$:
    
    
        
- **Primer Cero (en el 2):** Hacemos la operación $F_2 \rightarrow F_2 - 2F_1$.
        
$$
F_2 = (2, 1, 3) - 2 \cdot (1, 2, -1) = (2-2, 1-4, 3+2) = \mathbf{(0, -3, 5)}
$$

        
        
- **Segundo Cero (en el 3):** Hacemos la operación $F_3 \rightarrow F_3 - 3F_1$.
        
$$
F_3 = (3, 2, 1) - 3 \cdot (1, 2, -1) = (3-3, 2-6, 1+3) = \mathbf{(0, -4, 4)}
$$

        La matriz va quedando así: $\begin{pmatrix} 1 & 2 & -1 \\ 0 & -3 & 5 \\ 0 & -4 & 4 \end{pmatrix}$
        
        
- **Tercer Cero (en el -4):** Usamos cruzados los números de $F_2$ ($-3$) y $F_3$ ($-4$). Operación: $F_3 \rightarrow 3F_3 - 4F_2$.
        
$$
3F_3 - 4F_2 = 3 \cdot (0, -4, 4) - 4 \cdot (0, -3, 5) = (0, -12+12, 12-20) = \mathbf{(0, 0, -8)}
$$

    
    
    **Resultado final (Matriz Escalonada):**
    
$$
\begin{pmatrix} 1 & 2 & -1 \\ 0 & -3 & 5 \\ \mathbf{0} & \mathbf{0} & -8 \end{pmatrix} \quad \longrightarrow \quad \text{**Rango** = 3 (hay 3 filas vivas).}
$$

## Análisis de Sistemas por el Método de Gauss

    Para analizar y resolver cualquier sistema (tenga las ecuaciones e incógnitas que tenga) usando Gauss, seguimos estos pasos:
    
        
- **Escribir la matriz ampliada** $(A|B)$ con los coeficientes y los términos independientes.
        
- **Hacer ceros (escalonar)** por debajo de la diagonal principal usando operaciones elementales entre filas (igual que hacíamos en las matrices).
        
- **Analizar la última fila (Discusión):**
        
            
- Si queda una fila del tipo $\mathbf{(0 \quad 0 \quad 0 \mid \text{Número})}$, significa $0 = \text{Número} \rightarrow$ **Sistema Incompatible (SI)**, no tiene solución.
            
- Si queda una fila del tipo $\mathbf{(0 \quad 0 \quad 0 \mid 0)}$, esa fila se elimina porque no aporta información ($0=0$).
        
        
- **Resolver de abajo hacia arriba** una vez que el sistema está limpio y escalonado.
    

### Caso Práctico Resuelto (Método de Gauss en Sistemas)

    Resuelve y analiza por el método de Gauss el siguiente sistema de 3 ecuaciones con 3 incógnitas:
    
$$
\begin{cases} x + y + z = 2 \\ 2x + 3y + 5z = 11 \\ 1x - 5y + 6z = 29 \end{cases}
$$

    
    
        
- **Escribimos la matriz ampliada inicial:**
        
$$
\left(\begin{array}{ccc|c} 1 & 1 & 1 & 2 \\ 2 & 3 & 5 & 11 \\ 1 & -5 & 6 & 29 \end{array}\right)
$$

        
        
- **Primeros ceros en la columna 1** (usando la Fila 1):
        
            
- Para la fila 2: $F_2 \rightarrow F_2 - 2F_1 \quad \rightarrow \quad (0, \ 1, \ 3 \ \mid \ 7)$
            
- Para la fila 3: $F_3 \rightarrow F_3 - F_1 \quad \rightarrow \quad (0, \ -6, \ 5 \ \mid \ 27)$
        
        La matriz intermedia queda así:
        
$$
\left(\begin{array}{ccc|c} 1 & 1 & 1 & 2 \\ 0 & 1 & 3 & 7 \\ 0 & -6 & 5 & 27 \end{array}\right)
$$

        
        
- **Último cero en la columna 2** (en el $-6$, usando obligatoriamente la Fila 2):
        
            
- Operación: $F_3 \rightarrow F_3 + 6F_2 \quad \rightarrow \quad (0, \ 0, \ 5+6(3) \ \mid \ 27+6(7)) \rightarrow \mathbf{(0, \ 0, \ 23 \ \mid \ 69)}$
        
        La matriz final escalonada por Gauss es:
        
$$
\left(\begin{array}{ccc|c} 1 & 1 & 1 & 2 \\ 0 & 1 & 3 & 7 \\ 0 & 0 & \mathbf{23} & \mathbf{69} \end{array}\right)
$$

        
        
- **Discusión y Resolución (De abajo a arriba):**
        
            
- Como no hay ninguna fila absurda, el sistema es **Compatible Determinado (SCD)** y tiene una única solución.
            
- **Fila 3:** $23z = 69 \longrightarrow z = \frac{69}{23} \longrightarrow \mathbf{z = 3}$
            
- **Fila 2:** $y + 3z = 7 \longrightarrow y + 3(3) = 7 \longrightarrow y + 9 = 7 \longrightarrow \mathbf{y = -2}$
            
- **Fila 1:** $x + y + z = 2 \longrightarrow x + (-2) + 3 = 2 \longrightarrow x + 1 = 2 \longrightarrow \mathbf{x = 1}$
        
    
    
    **Solución del sistema:** $x = 1, \ y = -2, \ z = 3$.
$MDDOC$
)
ON CONFLICT (subject, block_slug, topic_slug)
DO UPDATE SET content_markdown = EXCLUDED.content_markdown;
