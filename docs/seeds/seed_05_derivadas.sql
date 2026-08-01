-- ════════════════════════════════════════
-- analisis:derivadas-optimizacion (slug existente)
-- Derivadas y Representación de Funciones (Ch8, Ch9)
INSERT INTO curriculum_content (subject, block_slug, topic_slug, content_markdown)
VALUES (
  'matematicas_ii',
  'analisis',
  'derivadas-optimizacion',
  $MDDOC$
## 1. Concepto de Derivada en un Punto e Interpretación Geométrica

    La derivada de $f(x)$ en $x = c$ es la tasa de variación instantánea de la función:
    
$$
f'(c) = \lim_{h \to 0} \frac{f(c + h) - f(c)}{h}
$$

    
        
- **Interpretación Geométrica:** El valor de $f'(c)$ es la **pendiente** ($m$) de la recta tangente a la curva en el punto $(c, f(c))$.
        
- **Ecuación de la recta tangente:** $y - f(c) = f'(c) \cdot (x - c)$.
    

### Caso Práctico: Recta Tangente

    Halla la recta tangente a la curva $f(x) = x^2 + 1$ en el punto de abscisa $x = 2$.
    
        
- Calculamos la ordenada: $f(2) = 2^2 + 1 = 5$. El punto es $(2, 5)$.
        
- Derivamos la función de forma general: $f'(x) = 2x$.
        
- Evaluamos en el punto para hallar la pendiente: $m = f'(2) = 2(2) = 4$.
        
- Aplicamos la fórmula punto-pendiente: $y - 5 = 4(x - 2) \longrightarrow \mathbf{y = 4x - 3}$.
    

## 2. Cálculo de Derivadas y Regla de la Cadena

    Permite calcular derivadas mediante tablas de reglas algebraicas inmediatas:
    
        
- **Producto:** $(u \cdot v)' = u' \cdot v + u \cdot v'$
        
- **Cociente:** $\left(\frac{u}{v}\right)' = \frac{u' \cdot v - u \cdot v'}{v^2}$
        
- **Regla de la Cadena:** Para funciones compuestas $f(g(x))$, la derivada es el producto de la derivada exterior evaluada en la interior por la derivada de la interior:
        
$$
[f(g(x))]' = f'(g(x)) \cdot g'(x)
$$

    

### Caso Práctico: Regla de la Cadena

    Calcula la derivada de la función compuesta: $f(x) = \sin(5x^2)$.
    
        
- Derivada de la función externa (seno): $\cos(5x^2)$.
        
- Derivada de la función interna ($5x^2$): $10x$.
        
- Multiplicamos ambos componentes según la regla: $f'(x) = \mathbf{10x \cdot \cos(5x^2)}$.
    

## 3. Teoremas de Valor Medio (Rolle y del Valor Medio)

    Garantizan la existencia de puntos notables bajo condiciones de continuidad y derivabilidad:
    
        
- **Teorema de Rolle:** Si $f(x)$ es continua en $[a, b]$, derivable en $(a, b)$ y además $f(a) = f(b)$, entonces existe al menos un punto $c \in (a, b)$ tal que $f'(c) = 0$.
        
- **Teorema del Valor Medio (Lagrange):** Bajo las mismas condiciones de continuidad y derivabilidad, existe un punto $c \in (a, b)$ tal que:
        
$$
f'(c) = \frac{f(b) - f(a)}{b - a}
$$

    

### Caso Práctico: Teorema de Rolle

    Verifica si $f(x) = x^2 - 2x$ cumple el Teorema de Rolle en $[0, 2]$ y halla el punto $c$.
    
        
- Al ser polinómica, es continua en $[0, 2]$ y derivable en $(0, 2)$.
        
- Comprobamos los extremos: $f(0) = 0$ y $f(2) = 2^2 - 2(2) = 0$. Al ser iguales, se cumple el teorema.
        
- Derivamos e igualamos a cero: $f'(x) = 2x - 2 \longrightarrow 2c - 2 = 0 \longrightarrow \mathbf{c = 1}$. El punto $1$ pertenece al intervalo abierto $(0, 2)$.
    

## 1. Información Extraída de la Propia Función

    Antes de analizar las derivadas, se estudian los rasgos globales directos de la ecuación de $f(x)$:
    
        
- **Dominio:** Valores de $x$ para los que existe la función.
        
- **Cortes con los ejes:** Eje $OX$ haciendo $f(x) = 0$; Eje $OY$ haciendo $x = 0$.
        
- **Simetría:** Par si $f(-x) = f(x)$; Impar si $f(-x) = -f(x)$.
        
- **Periodicidad:** $f(x + T) = f(x)$.
        
- **Asíntotas:** Líneas de aproximación vertical ($x=k$), horizontal ($y=L$) u oblicua ($y=mx+n$).
    

### Caso Práctico: Asíntota Oblicua

    Halla la asíntota oblicua de la función racional: $f(x) = \frac{x^2 + 1}{x}$.
    
        
- Calculamos la pendiente $m$: $\lim_{x \to \infty} \frac{f(x)}{x} = \lim_{x \to \infty} \frac{x^2 + 1}{x^2} = 1$.
        
- Calculamos la ordenada en el origen $n$: $\lim_{x \to \infty} [f(x) - mx] = \lim_{x \to \infty} \left[\frac{x^2 + 1}{x} - x\right] = \lim_{x \to \infty} \frac{1}{x} = 0$.
        
- La ecuación de la asíntota oblicua es la recta: $\mathbf{y = x}$.
    

## 2. Información Extraída de la Primera y Segunda Derivada

    El signo de las derivadas sucesivas determina las variaciones geométricas locales de la curva:
    
        
- **Primera Derivada ($f'$):** Determina la monotonía. Si $f'(x) > 0$ la función crece; si $f'(x) < 0$ decrece. Los puntos donde $f'(x) = 0$ son puntos críticos.
        
- **Segunda Derivada ($f''$):** Determina la curvatura. Si $f''(x) > 0$ es convexa ($\cup$); si $f''(x) < 0$ es cóncava ($\cap$). Permite clasificar los extremos relativos y hallar los puntos de inflexión (donde $f''(x) = 0$ y cambia el signo de la curvatura).
    

### Caso Práctico: Determinación de Máximos y Mínimos

    Clasifica los puntos críticos de la función $f(x) = x^3 - 3x$.
    
        
- Calculamos la primera derivada e igualamos a cero: $3x^2 - 3 = 0 \longrightarrow x = 1, \ x = -1$.
        
- Calculamos la segunda derivada: $f''(x) = 6x$.
        
- Evaluamos $x = 1$: $f''(1) = 6 > 0 \longrightarrow$ Hay un **mínimo relativo** en $(1, -2)$.
        
- Evaluamos $x = -1$: $f''(-1) = -6 < 0 \longrightarrow$ Hay un **máximo relativo** en $(-1, 2)$.
$MDDOC$
)
ON CONFLICT (subject, block_slug, topic_slug)
DO UPDATE SET content_markdown = EXCLUDED.content_markdown;
