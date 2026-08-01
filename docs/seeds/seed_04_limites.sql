-- ════════════════════════════════════════
-- analisis:limites-continuidad (slug NUEVO)
-- Límites y Continuidad (Ch7)
INSERT INTO curriculum_content (subject, block_slug, topic_slug, content_markdown)
VALUES (
  'matematicas_ii',
  'analisis',
  'limites-continuidad',
  $MDDOC$
## 1. Idea Intuitiva de Límite

    El límite de una función $f(x)$ en un punto $c$ es el valor $L$ al que se aproximan las imágenes de la función a medida que los valores de $x$ se acercan a $c$. No importa lo que ocurra exactamente en el punto $x = c$ (puede no estar definido), sino el comportamiento en sus cercanías inmediatas.

### Caso Práctico: Idea Intuitiva

    Observa el comportamiento de $f(x) = x + 2$ cuando $x$ se aproxima a $3$.
    
        
- Evaluamos valores próximos por la izquierda: $f(2.9) = 4.9$; $f(2.99) = 4.99$.
        
- Evaluamos valores próximos por la derecha: $f(3.1) = 5.1$; $f(3.01) = 5.01$.
        
- En ambos casos las imágenes se acercan a $5$. Por tanto, $\lim_{x \to 3} (x + 2) = \mathbf{5}$.
    

## 2. Definición Matemática de Límite y Límites Laterales

    Formalmente, $\lim_{x \to c} f(x) = L$ si para todo $\varepsilon > 0$ existe un $\delta > 0$ tal que si $0 < |x - c| < \delta$, entonces $|f(x) - L| < \varepsilon$.
    
        
- **Límites Laterales:** El límite global existe si y solo si los límites por la izquierda y por la derecha existen y valen lo mismo:
        
$$
\lim_{x \to c^-} f(x) = \lim_{x \to c^+} f(x) = L
$$

    

### Caso Práctico: Límites Laterales en Funciones a Trozos

    Determina si existe el límite en $x = 1$ de: $f(x) = \begin{cases} 2x & \text{si } x < 1 \\ 4 - x & \text{si } x \ge 1 \end{cases}$
    
        
- Límite por la izquierda: $\lim_{x \to 1^-} 2x = 2(1) = 2$.
        
- Límite por la derecha: $\lim_{x \to 1^+} (4 - x) = 4 - 1 = 3$.
        
- Como $\lim_{x \to 1^-} f(x) \neq \lim_{x \to 1^+} f(x)$, el límite global **no existe**.
    

## 3. Operaciones con Límites

    Si existen $\lim_{x \to c} f(x) = L$ y $\lim_{x \to c} g(x) = M$, se cumplen las siguientes propiedades algebraicas básicas:
    
        
- **Suma/Resta:** $\lim [f(x) \pm g(x)] = L \pm M$
        
- **Producto:** $\lim [f(x) \cdot g(x)] = L \cdot M$
        
- **Cociente:** $\lim [f(x) / g(x)] = L / M$ (siempre que $M \neq 0$)
        
- **Potencia:** $\lim [f(x)^{g(x)}] = L^M$ (si $L > 0$)
    

### Caso Práctico: Aplicación de Propiedades

    Sabiendo que $\lim_{x \to c} f(x) = 4$ y $\lim_{x \to c} g(x) = 2$, calcula $\lim_{x \to c} \frac{f(x) + 3}{g(x)^2}$.
    
        
- Aplicamos las propiedades de la suma, cociente y potencia de límites:
        
$$
\lim_{x \to c} \frac{f(x) + 3}{g(x)^2} = \frac{\lim f(x) + 3}{(\lim g(x))^2} = \frac{4 + 3}{2^2} = \mathbf{\frac{7}{4}}
$$

    

## 4. Límites Infinitos

    Describe situaciones donde los valores de la función o de la variable crecen o decrecen sin límite:
    
        
- **En un punto finito:** $\lim_{x \to c} f(x) = \pm\infty$ (indica la presencia de una asíntota vertical).
        
- **En el infinito:** $\lim_{x \to \pm\infty} f(x) = L$ (indica una asíntota horizontal) o $\lim_{x \to \pm\infty} f(x) = \pm\infty$ (ramas parabólicas).
    

### Caso Práctico: Límite Infinito en un Punto

    Calcula el límite: $\lim_{x \to 2^+} \frac{1}{x - 2}$.
    
        
- Al sustituir, el denominador se aproxima a $0$ a través de valores positivos (ej. $2.01 - 2 = 0.01$).
        
- Una constante positiva dividida por un número positivo extremadamente pequeño da como resultado: $\mathbf{+\infty}$.
    

## 5. Cálculo de Límites e Indeterminaciones

    Al evaluar límites directos podemos encontrarnos con expresiones matemáticas cuyo resultado no está determinado de forma inmediata. Las principales son:
    
        
- $\frac{0}{0}$ (se resuelve factorizando o usando conjugados).
        
- $\frac{\infty}{\infty}$ (se resuelve comparando los grados de los términos principales).
        
- $\infty - \infty$ (se opera combinando fracciones o racionalizando).
        
- $1^\infty$ (se aplica la fórmula directa basada en el número $e$).
    

### Caso Práctico: Indeterminación Uno elevado a Infinito

    Calcula el límite: $\lim_{x \to \infty} \left(\frac{x + 3}{x + 1}\right)^x$.
    
        
- Al sustituir la base tiende a $1$ y el exponente a $\infty$, generando la forma $1^\infty$.
        
- Aplicamos la fórmula del número $e$: $e^{\lim_{x \to \infty} x \cdot \left(\frac{x + 3}{x + 1} - 1\right)}$.
        
- Operamos la fracción interna: $\frac{x + 3 - (x + 1)}{x + 1} = \frac{2}{x + 1}$.
        
- Resolvemos el límite del exponente: $\lim_{x \to \infty} \frac{2x}{x + 1} = 2$. Resultado final: $\mathbf{e^2}$.
    

## 6. Continuidad de una Función y Tipos de Discontinuidad

    Una función $f(x)$ es continua en un punto $x = c$ si se cumplen tres condiciones: existe $f(c)$, existe $\lim_{x \to c} f(x)$ y ambos valores coinciden. Si no se cumple, la discontinuidad puede ser:
    
        
- **Evitable:** Existe el límite finito pero no coincide con el valor de la función.
        
- **Inevitable de salto finito:** Los límites laterales son finitos pero distintos.
        
- **Inevitable de salto infinito:** Al menos uno de los límites laterales es $\pm\infty$.
    

### Caso Práctico: Clasificación de una Discontinuidad

    Estudia la continuidad de $f(x) = \frac{x^2 - 1}{x - 1}$ en el punto crítico $x = 1$.
    
        
- $f(1) = \frac{0}{0}$, por lo que la función no está definida en ese punto.
        
- Calculamos el límite simplificando la expresión:
        
$$
\lim_{x \to 1} \frac{(x - 1)(x + 1)}{x - 1} = \lim_{x \to 1} (x + 1) = 2
$$

        
- Como el límite es un número real pero la función no existe en el punto, es una **discontinuidad evitable** en $x = 1$.
$MDDOC$
)
ON CONFLICT (subject, block_slug, topic_slug)
DO UPDATE SET content_markdown = EXCLUDED.content_markdown;
