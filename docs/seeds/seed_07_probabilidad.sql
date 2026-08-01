-- ════════════════════════════════════════
-- probabilidad:probabilidad-combinatoria (slug NUEVO)
-- Probabilidad y Combinatoria (Ch11)
INSERT INTO curriculum_content (subject, block_slug, topic_slug, content_markdown)
VALUES (
  'matematicas_ii',
  'probabilidad',
  'probabilidad-combinatoria',
  $MDDOC$
## 1. Álgebra de Sucesos y Tipos de Experimentos

    Conceptos básicos de la teoría de conjuntos aplicados a la aleatoriedad:
    
        
- **Espacio Muestral ($\Omega$):** Conjunto de todos los resultados posibles.
        
- **Operaciones:** Unión ($A \cup B$, ocurre al menos uno), Intersección ($A \cap B$, ocurren ambos simultáneamente) y Contrario ($\bar{A}$, no ocurre $A$).
        
- **Leyes de Morgan:** $\overline{A \cup B} = \bar{A} \cap \bar{B}$ y $\overline{A \cap B} = \bar{A} \cup \bar{B}$.
    

### Caso Práctico: Aplicación de las Leyes de Morgan

    Sabiendo que $P(A \cup B) = 0.7$, halla la probabilidad de que no ocurra ni el suceso $A$ ni el suceso $B$, es decir, $P(\bar{A} \cap \bar{B})$.
    
        
- Por la primera Ley de Morgan, sabemos que $\bar{A} \cap \bar{B} = \overline{A \cup B}$.
        
- Aplicamos la propiedad del suceso contrario:
        
$$
P(\bar{A} \cap \bar{B}) = 1 - P(A \cup B) = 1 - 0.7 = \mathbf{0.3}
$$

    

## 2. Asignación de Probabilidades (Regla de Laplace)

    Si todos los resultados de un espacio muestral finito son equiprobables (tienen la misma probabilidad de ocurrir), la probabilidad de un suceso $A$ se calcula mediante la relación directa:
    
$$
P(A) = \frac{\text{Número de casos favorables}}{\text{Número de casos posibles}}
$$

    La probabilidad es siempre un valor numérico acotado en el intervalo $[0, 1]$.

### Caso Práctico: Regla de Laplace

    Calcula la probabilidad de obtener un número par al lanzar un dado regular de 6 caras.
    
        
- Casos posibles: $\Omega = \{1, 2, 3, 4, 5, 6\} \longrightarrow 6$ casos.
        
- Casos favorables (números pares): $A = \{2, 4, 6\} \longrightarrow 3$ casos.
        
- Aplicamos Laplace: $P(A) = \frac{3}{6} = \mathbf{0.5}$ (es decir, un $50\%$).
    

## 3. Definición Axiomática de Probabilidad (Kolmogorov)

    La probabilidad es una función que asigna a cada suceso un número real cumpliendo tres axiomas fundamentales:
    
        
- $P(A) \ge 0$ para cualquier suceso $A$.
        
- $P(\Omega) = 1$ (la probabilidad del suceso seguro es la unidad).
        
- Si $A$ y $B$ son sucesos incompatibles ($A \cap B = \emptyset$), entonces $P(A \cup B) = P(A) + P(B)$.
    
    De aquí se deduce la regla general para sucesos compatibles: $P(A \cup B) = P(A) + P(B) - P(A \cap B)$.

### Caso Práctico: Sucesos Compatibles

    Dados dos sucesos con $P(A) = 0.6$, $P(B) = 0.4$ y $P(A \cap B) = 0.2$, calcula $P(A \cup B)$.
    
        
- Aplicamos la fórmula deducida de los axiomas para sucesos con elementos comunes:
        
$$
P(A \cup B) = 0.6 + 0.4 - 0.2 = \mathbf{0.8}
$$

    

## 4. Diagramas de Árbol y Tablas de Contingencia

    Herramientas organizativas para experimentos compuestos de varias etapas:
    
        
- **Diagramas de Árbol:** Se ramifican las opciones secuenciales indicando las probabilidades en cada rama. La probabilidad de un camino es el producto de sus ramas.
        
- **Tablas de Contingencia:** Tablas cruzadas bidimensionales útiles para organizar conjuntos con dos características independientes (ej. género y aficiones).
    

### Caso Práctico: Tabla de Contingencia

    En un grupo de 60 mujeres y 40 hombres, 20 mujeres juegan al tenis. Sabiendo que hay 45 tenistas en total, halla la probabilidad de que un individuo elegido al azar sea un hombre que juega al tenis.
    
        
- Si hay 45 tenistas y 20 son mujeres, el número de hombres tenistas es $45 - 20 = 25$.
        
- El total de personas del experimento es $60 + 40 = 100$.
        
- Casos favorables (Hombres $\cap$ Tenis) = 25. Total de casos = 100.
        
- Probabilidad conjunta: $P(H \cap T) = \frac{25}{100} = \mathbf{0.25}$.
    

## 5. Teoremas de la Probabilidad Total y de Bayes

    Modelan la probabilidad condicionada avanzada en espacios muestrales partidos en sucesos discretos $A_i$:
    
        
- **Probabilidad Total:** Calcula la probabilidad de un suceso final $B$:
        
$$
P(B) = \sum [P(A_i) \cdot P(B | A_i)]
$$

        
- **Teorema de Bayes:** Calcula la probabilidad a posteriori (la causa $A_i$ dado el efecto $B$):
        
$$
P(A_i | B) = \frac{P(A_i) \cdot P(B | A_i)}{P(B)}
$$

    

### Caso Práctico: Teorema de Bayes

    Una enfermedad afecta al $1\%$ de la población. Un test da positivo en el $95\%$ de los enfermos, pero también da un $2\%$ de falsos positivos en personas sanas. Si una persona da positivo ($+$), ¿cuál es la probabilidad de que esté enferma ($E$)?
    
        
- Datos: $P(E) = 0.01$, $P(\bar{E}) = 0.99$, $P(+|E) = 0.95$, $P(+|\bar{E}) = 0.02$.
        
- Probabilidad Total de dar positivo: $P(+) = 0.01 \cdot 0.95 + 0.99 \cdot 0.02 = 0.0095 + 0.0198 = 0.0293$.
        
- Aplicamos el Teorema de Bayes:
        
$$
P(E | +) = \frac{0.01 \cdot 0.95}{0.0293} = \frac{0.0095}{0.0293} \approx \mathbf{0.324} \quad (32.4\%)
$$
$MDDOC$
)
ON CONFLICT (subject, block_slug, topic_slug)
DO UPDATE SET content_markdown = EXCLUDED.content_markdown;
