-- ════════════════════════════════════════
-- probabilidad:normal-tipificacion (slug existente)
-- Distribuciones de Probabilidad (Ch12)
INSERT INTO curriculum_content (subject, block_slug, topic_slug, content_markdown)
VALUES (
  'matematicas_ii',
  'probabilidad',
  'normal-tipificacion',
  $MDDOC$
## 1. Parámetros de una Distribución: Media, Varianza y Desviación Típica

    Toda distribución de probabilidad queda caracterizada numéricamente por indicadores de centralización y dispersión:
    
        
- **Media ($\mu$):** Valor esperado o centro de gravedad de la distribución.
        
- **Varianza ($\sigma^2$):** Promedio de los cuadrados de las desviaciones respecto a la media.
        
- **Desviación Típica ($\sigma$):** Raíz cuadrada de la varianza. Expresa la dispersión en las mismas unidades que la variable original.
    

### Caso Práctico: Cálculo de Parámetros de una Variable

    Una variable discreta toma los valores $1$ y $2$ con probabilidades $0.4$ y $0.6$ respectivamente. Halla su media y su desviación típica.
    
        
- Calculamos la media: $\mu = \sum [x_i \cdot P(x_i)] = 1(0.4) + 2(0.6) = 0.4 + 1.2 = \mathbf{1.6}$.
        
- Calculamos el valor esperado de los cuadrados: $\sum [x_i^2 \cdot P(x_i)] = 1^2(0.4) + 2^2(0.6) = 0.4 + 2.4 = 2.8$.
        
- Calculamos la varianza: $\sigma^2 = 2.8 - (1.6)^2 = 2.8 - 2.56 = 0.24$.
        
- Desviación típica: $\sigma = \sqrt{0.24} \approx \mathbf{0.49}$.
    

## 2. Distribución Binomial (Variable Discreta)

    Modela experimentos independientes repetidos $n$ veces donde solo hay dos resultados posibles: éxito ($p$) o fracaso ($q = 1-p$). Se expresa como $X \sim B(n, p)$.
    
        
- **Función de probabilidad:** Probabilidad de obtener exactamente $k$ éxitos:
        
$$
P(X = k) = \binom{n}{k} \cdot p^k \cdot q^{n-k}
$$

        
- **Parámetros directos:** $\mu = n \cdot p \quad \text{y} \quad \sigma = \sqrt{n \cdot p \cdot q}$.
    

### Caso Práctico: Cálculo Binomial

    Lanzamos una moneda equilibrada 4 veces. Calcula la probabilidad de obtener exactamente 3 caras.
    
        
- Identificamos los parámetros: $n = 4$, $p = 0.5$, $q = 0.5$. Sigue una ley $X \sim B(4, \ 0.5)$.
        
- Aplicamos la función para $k = 3$:
        
$$
P(X = 3) = \binom{4}{3} \cdot (0.5)^3 \cdot (0.5)^1 = 4 \cdot 0.125 \cdot 0.5 = \mathbf{0.25} \quad (25\%)
$$

    

## 3. Desigualdad de Chebycheff

    Teorema aplicable a cualquier variable estadística (sin importar su forma o distribución) que permite acotar la probabilidad de que los valores queden fuera de un intervalo simétrico alrededor de la media:
    
$$
P(|X - \mu| \ge k\sigma) \le \frac{1}{k^2}
$$

    Determina que la probabilidad de desviarse de la media una distancia mayor o igual a $k$ veces la desviación típica es como máximo $1/k^2$.

### Caso Práctico: Acotación de Chebycheff

    Una variable tiene $\mu = 50$ y $\sigma = 5$. Acota la probabilidad de que $X$ caiga fuera del rango $(40, 60)$.
    
        
- La distancia de desviación máxima permitida en el rango es de $10$ unidades respecto a $50$.
        
- Expresamos dicha distancia según las desviaciones típicas: $k \cdot \sigma = 10 \longrightarrow k \cdot 5 = 10 \longrightarrow k = 2$.
        
- Aplicamos la desigualdad: $P(|X - 50| \ge 10) \le \frac{1}{2^2} = \mathbf{0.25}$. Como máximo es del $25\%$.
    

## 4. Distribuciones de Probabilidad Continuas

    Son aquellas variables que pueden tomar cualquier valor real dentro de un intervalo. No se pueden asignar probabilidades a puntos aislados ($P(X=c) = 0$). Se definen mediante una **función de densidad** $f(x)$, donde la probabilidad de un tramo corresponde al área bajo la curva obtenida mediante integración:
    
$$
P(a \le X \le b) = \int_{a}^{b} f(x) \, dx
$$

### Caso Práctico: Probabilidad en Variables Continuas

    Dada la función de densidad uniforme $f(x) = 0.5$ definida en el intervalo $[0, 2]$, calcula $P(1 \le X \le 2)$.
    
        
- Planteamos la integral definida en la región solicitada:
        
$$
P(1 \le X \le 2) = \int_{1}^{2} 0.5 \, dx = [0.5x]_1^2 = 0.5(2) - 0.5(1) = \mathbf{0.5} \quad (50\%)
$$

    

## 5. Distribución Normal y Tipificación

    Es la distribución continua más importante, simétrica y con forma de campana de Gauss, denotada como $X \sim N(\mu, \sigma)$. Para calcular sus probabilidades usando la tabla estándar $N(0, 1)$, se aplica el proceso de **tipificación**:
    
$$
Z = \frac{X - \mu}{\sigma}
$$

### Caso Práctico: Uso de Tablas Normales

    Sea $X \sim N(10, 2)$, calcula la probabilidad acumulada $P(X \le 13)$.
    
        
- Tipificamos la variable restando la media y dividiendo por la desviación:
        
$$
P(X \le 13) = P\left(Z \le \frac{13 - 10}{2}\right) = P(Z \le 1.5)
$$

        
- Buscamos el valor $1.50$ en el cuerpo de la tabla estándar de la Normal $N(0,1)$:
        
$$
P(Z \le 1.50) = \mathbf{0.9332} \quad (93.32\%)
$$

    

## 6. Aproximación de la Binomial a la Normal (Moivre-Gauss)

    Si el número de repeticiones $n$ de una distribución binomial $X \sim B(n, p)$ es suficientemente grande, se puede aproximar mediante una curva normal continua si se cumplen los requisitos de control: $n \cdot p \ge 5$ y $n \cdot q \ge 5$.
    
        
- La nueva distribución normal tendrá como parámetros derivados:
        
$$
Y \sim N(n \cdot p, \ \sqrt{n \cdot p \cdot q})
$$

    

### Caso Práctico: Cambio de Parámetros de Control

    Aproxima la distribución binomial $X \sim B(100, \ 0.2)$ a una distribución normal.
    
        
- Comprobamos las restricciones: $100 \cdot 0.2 = 20 \ge 5$ y $100 \cdot 0.8 = 80 \ge 5$. Es válida.
        
- Calculamos la media de la campana: $\mu = n \cdot p = 100 \cdot 0.2 = 20$.
        
- Calculamos la desviación típica: $\sigma = \sqrt{100 \cdot 0.2 \cdot 0.8} = \sqrt{16} = 4$.
        
- La distribución aproximada es la variable continua: $\mathbf{Y \sim N(20, 4)}$.
$MDDOC$
)
ON CONFLICT (subject, block_slug, topic_slug)
DO UPDATE SET content_markdown = EXCLUDED.content_markdown;
