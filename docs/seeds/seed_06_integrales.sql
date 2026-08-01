-- ════════════════════════════════════════
-- integrales:areas-integrales (slug existente)
-- Integrales (Ch10)
INSERT INTO curriculum_content (subject, block_slug, topic_slug, content_markdown)
VALUES (
  'matematicas_ii',
  'integrales',
  'areas-integrales',
  $MDDOC$
## 1. Primitiva de una Función y la Integral Indefinida

    Una función $F(x)$ es una primitiva de $f(x)$ si se cumple que $F'(x) = f(x)$. 
    
        
- **Integral Indefinida:** Es el conjunto de todas las funciones primitivas posibles de una función y se expresa añadiendo una constante de integración real $C$:
        
$$
\int f(x) \, dx = F(x) + C
$$

        
- Sigue propiedades de linealidad: permite extraer constantes multiplicativas y separar sumas o restas de funciones.
    

### Caso Práctico: Propiedades de Linealidad

    Resuelve la siguiente integral indefinida combinada: $\int (3x^2 + 2x) \, dx$.
    
        
- Separamos la integral aplicando la suma y extraemos las constantes numéricas:
        
$$
3 \int x^2 \, dx + 2 \int x \, dx = 3 \left(\frac{x^3}{3}\right) + 2 \left(\frac{x^2}{2}\right) + C = \mathbf{x^3 + x^2 + C}
$$

    

## 2. Integrales de Funciones Elementales (Inmediatas)

    Son integrales que se obtienen de forma directa aplicando de manera inversa la tabla estándar de las derivadas de las funciones más sencillas:
    
        
- **Potenciales:** $\int x^n \, dx = \frac{x^{n+1}}{n+1} + C \quad (n \neq -1)$
        
- **Logarítmicas:** $\int \frac{1}{x} \, dx = \ln|x| + C$
        
- **Exponenciales:** $\int e^x \, dx = e^x + C$
        
- **Trigonométricas:** $\int \cos x \, dx = \sin x + C$
    

### Caso Práctico: Integral Inmediata Compuesta

    Resuelve la integral racional inmediata: $\int \frac{5}{x} \, dx$.
    
        
- Extraemos la constante multiplicativa fuera del símbolo de integración: $5 \int \frac{1}{x} \, dx$.
        
- Aplicamos directamente la regla de la primitiva logarítmica: $\mathbf{5 \ln|x| + C}$.
    

## 3. Métodos de Integración

    Estrategias analíticas algebraicas para transformar integrales complejas en formas inmediatas:
    
        
- **Cambio de Variable:** Se introduce una nueva variable $t = g(x)$, calculando su diferencial $dt = g'(x)dx$.
        
- **Por Partes:** Se emplea para productos de funciones heterogéneas, siguiendo la regla mnemotécnica ALPES para asignar las variables:
        
$$
\int u \, dv = u \cdot v - \int v \, du
$$

        
- **Racionales:** Integración de $\frac{P(x)}{Q(x)}$ mediante descomposición en fracciones simples si el grado de $P(x)$ es menor que el de $Q(x)$.
    

### Caso Práctico: Integración por Partes

    Calcula la integral: $\int x \cdot \cos x \, dx$.
    
        
- Elegimos las variables por prioridad ALPES: $u = x \rightarrow du = dx$; $dv = \cos x \, dx \rightarrow v = \sin x$.
        
- Aplicamos la fórmula fundamental:
        
$$
\int x \cdot \cos x \, dx = x \cdot \sin x - \int \sin x \, dx
$$

        
- Resolvemos la integral restante: $\mathbf{x \cdot \sin x + \cos x + C}$.
    

## 4. La Integral Definida (Regla de Barrow y Áreas)

    La integral definida calcula el valor neto del área encerrada por una curva en un intervalo cerrado:
    
        
- **Regla de Barrow:** Si $F(x)$ es una primitiva de $f(x)$ en el intervalo $[a, b]$, entonces:
        
$$
\int_{a}^{b} f(x) \, dx = [F(x)]_a^b = F(b) - F(a)
$$

        
- **Cálculo de Áreas:** Para evitar que las áreas situadas por debajo del eje horizontal se resten, se calculan las raíces de la función en el intervalo y se integra aplicando valores absolutos por tramos.
    

### Caso Práctico: Cálculo de Área con Barrow

    Halla el área encerrada por $f(x) = x^2$ entre las rectas verticales $x = 0$ y $x = 3$.
    
        
- Planteamos la integral definida: $\int_{0}^{3} x^2 \, dx$.
        
- Hallamos la primitiva de la función: $F(x) = \frac{x^3}{3}$.
        
- Evaluamos los límites aplicando la Regla de Barrow:
        
$$
\int_{0}^{3} x^2 \, dx = \left[ \frac{x^3}{3} \right]_0^3 = \frac{3^3}{3} - \frac{0^3}{3} = 9 - 0 = \mathbf{9 \text{ u}^2}
$$
$MDDOC$
)
ON CONFLICT (subject, block_slug, topic_slug)
DO UPDATE SET content_markdown = EXCLUDED.content_markdown;
