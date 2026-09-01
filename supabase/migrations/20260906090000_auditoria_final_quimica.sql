-- Auditoría pedagógica final de los 68 topics de Química (segunda revisión
-- independiente). 20 de 68 corregidos por precisión conceptual (Bohr, sistema
-- periódico, afinidad electrónica, Born-Haber, fuerzas de London, estado estándar,
-- entropía, Gibbs, Kp, presión/equilibrio, etapa determinante, Arrhenius, ácidos/bases
-- fuertes y débiles, valoraciones, espontaneidad redox, hibridación del carbono,
-- prioridad de grupos funcionales, sustitución y eliminación orgánicas) — ver informe
-- de auditoría para el detalle de cada corrección. Los 48 restantes se revisaron y se
-- mantienen sin cambios (correctos, cálculos numéricos verificados).
--
-- Solo UPDATE de concept_markdown/worked_example_markdown/practice_prompt sobre filas
-- ya existentes — no se toca topic_id, review_status, orden ni ningún ejercicio real.

UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Bohr propuso que los electrones solo pueden ocupar **órbitas permitidas**, cada una con una energía fija. Un electrón no irradia energía mientras permanece en su órbita, pero puede saltar entre ellas absorbiendo o emitiendo un fotón.

La variación de energía del átomo es $\Delta E_{\text{átomo}} = E_{final} - E_{inicial}$. En una **emisión**, el electrón cae a un nivel más bajo: $E_{final}<E_{inicial}$, así que $\Delta E_{\text{átomo}}<0$ (el átomo pierde energía). En una **absorción**, sube a un nivel más alto: $\Delta E_{\text{átomo}}>0$ (el átomo gana esa energía a partir del fotón absorbido). El fotón implicado siempre tiene una energía positiva, igual al valor absoluto de esa variación:

$$E_{\text{fotón}} = |\Delta E_{\text{átomo}}| = h\cdot f$$

Este modelo explica por qué los átomos emiten o absorben luz solo en determinadas frecuencias (espectros de líneas), no en un espectro continuo.$mkd$, worked_example_markdown = $mkd$Un electrón del hidrógeno cae de un nivel $E_{inicial}=-3{,}4$ eV (n=2) a otro $E_{final}=-13{,}6$ eV (n=1). Calcula la energía del fotón emitido.

1. Es una **emisión** (el electrón cae a un nivel más bajo): $\Delta E_{\text{átomo}} = E_{final}-E_{inicial} = -13{,}6-(-3{,}4) = -10{,}2$ eV
2. El signo negativo confirma que el átomo pierde energía, que se emite como fotón.
3. Resultado: $E_{\text{fotón}} = |\Delta E_{\text{átomo}}| = \mathbf{10{,}2\ \text{eV}}$$mkd$, practice_prompt = $mkd$Un electrón absorbe un fotón y salta de $E_{inicial}=-13{,}6$ eV a $E_{final}=-1{,}5$ eV. Calcula $\Delta E_{\text{átomo}}$ (con su signo) y la energía del fotón absorbido.$mkd$, alert_markdown = NULL WHERE subject = 'quimica' AND sort_order = 10;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Los elementos se ordenan por **número atómico creciente** en filas (**periodos**) y columnas (**grupos**). En los elementos **representativos** (bloques s y p), los de un mismo grupo tienen el mismo número de electrones de valencia y, por eso, propiedades químicas parecidas; el grupo se puede deducir directamente contando esos electrones.

El número de periodo coincide con el nivel de energía más externo ($n$) ocupado. Esta relación directa entre grupo y electrones de valencia es clara para los elementos representativos, pero en los **metales de transición** (bloque d) es más compleja, porque el número de grupo no se obtiene de la misma forma sencilla.$mkd$, worked_example_markdown = $mkd$El elemento con configuración $[Ar]\ 4s^2\ 3d^{10}\ 4p^3$ ¿en qué periodo y grupo se encuentra?

1. El nivel más externo ocupado es $n=4$ → periodo 4
2. Es un elemento representativo (bloque p); sus electrones de valencia ($4s^2\ 4p^3$) corresponden al grupo 15 (familia del nitrógeno)
3. Resultado: **periodo 4, grupo 15** — es el arsénico (As)$mkd$, practice_prompt = $mkd$Indica el periodo y el grupo del elemento con configuración $[Ne]\ 3s^2\ 3p^4$, y di de qué elemento se trata.$mkd$, alert_markdown = NULL WHERE subject = 'quimica' AND sort_order = 13;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$La **energía de ionización** ($E_i$) es la energía necesaria para arrancar un electrón de un átomo neutro en estado gaseoso. Sigue una tendencia periódica clara y bastante regular: aumenta hacia arriba en un grupo y hacia la derecha en un periodo (con algunas excepciones puntuales).

La **afinidad electrónica** ($AE$) es la energía que se libera (o absorbe) cuando un átomo gaseoso capta un electrón. Sigue una tendencia general parecida (más favorable —más energía liberada— hacia la derecha y hacia arriba), pero con **muchas más excepciones** que la energía de ionización: por ejemplo, los gases nobles y los elementos con subniveles semillenos o llenos rompen la regularidad. Para PAU basta con conocer la tendencia general y no aplicarla de forma mecánica.$mkd$, worked_example_markdown = $mkd$¿Por qué la energía de ionización del flúor es mayor que la del yodo, si ambos son halógenos (grupo 17)?

1. El flúor está más arriba en el grupo: su radio atómico es menor.
2. Al ser más pequeño, sus electrones de valencia están más cerca del núcleo y más atraídos.
3. Resultado: hace falta **más energía** para arrancar un electrón del flúor que del yodo.$mkd$, practice_prompt = $mkd$Explica por qué los metales alcalinos (grupo 1) tienen energías de ionización muy bajas comparadas con los gases nobles (grupo 18).$mkd$, alert_markdown = NULL WHERE subject = 'quimica' AND sort_order = 15;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$La **energía reticular** ($U$) mide lo fuerte que es un enlace iónico. No se puede medir directamente, así que se calcula mediante el **Ciclo de Born-Haber**: un camino alternativo de varias etapas (sublimación, ionización, disociación, afinidad electrónica...) que, según la Ley de Hess, debe dar el mismo resultado que la formación directa del compuesto.

**Convención de signo usada aquí:** $U$ es la entalpía del proceso $\text{ion positivo (g)} + \text{ion negativo (g)} \to \text{red cristalina (s)}$ — formación de la red a partir de iones gaseosos. Al ser un proceso que libera energía, $U$ sale **negativa**. (Existe también la convención contraria, energía necesaria para separar la red en iones gaseosos, con signo positivo; si un ejercicio da $U$ en positivo, se está usando esa otra convención — hay que fijarse siempre en qué proceso define el enunciado.)$mkd$, worked_example_markdown = $mkd$En el ciclo de Born-Haber del NaCl, la entalpía de formación es $-411$ kJ/mol y la suma del resto de etapas (sin la reticular) es $+536$ kJ/mol. Calcula la energía reticular (formación de la red desde iones gaseosos).

1. Por la Ley de Hess: $\Delta H_f = \text{(resto de etapas)} + U$
2. Despejamos: $U = \Delta H_f - \text{(resto)} = -411-536$
3. Resultado: $U = \mathbf{-947\ \text{kJ/mol}}$ (negativa: se libera energía al formar la red)$mkd$, practice_prompt = $mkd$Explica por qué la energía reticular del MgO es mucho mayor (en valor absoluto) que la del NaCl, teniendo en cuenta las cargas de los iones.$mkd$, alert_markdown = NULL WHERE subject = 'quimica' AND sort_order = 18;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Además de los enlaces (iónico, covalente, metálico), existen fuerzas más débiles **entre moléculas** que determinan propiedades como el punto de fusión o ebullición:

- **Fuerzas de Van der Waals (London):** presentes en todas las moléculas. Su intensidad aumenta con la **polarizabilidad** de la molécula (lo fácil que es deformar su nube electrónica) — en la práctica, esto suele ir asociado a más electrones, mayor tamaño molecular y mayor superficie de contacto entre moléculas.
- **Fuerzas dipolo-dipolo:** entre moléculas polares.
- **Enlace o puente de hidrógeno:** el más intenso de los tres, se da cuando el H está unido a F, O o N.

Cuanto más intensas son estas fuerzas, mayor es el punto de fusión/ebullición de la sustancia.$mkd$, worked_example_markdown = $mkd$Explica por qué el agua ($H_2O$, $M=18$) tiene un punto de ebullición mucho mayor que el metano ($CH_4$, $M=16$), a pesar de tener masas moleculares parecidas.

1. El agua tiene enlaces O-H: puede formar **puentes de hidrógeno** entre sus moléculas.
2. El metano es apolar y solo tiene fuerzas de Van der Waals, mucho más débiles.
3. Resultado: el agua necesita mucha más energía para romper esas fuerzas y hervir.$mkd$, practice_prompt = $mkd$El HF tiene un punto de ebullición mucho más alto que el HCl, aunque el HCl tiene mayor masa molecular. Explica este hecho a partir de las fuerzas intermoleculares presentes en cada caso.$mkd$, alert_markdown = NULL WHERE subject = 'quimica' AND sort_order = 23;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$La mayoría de las reacciones químicas ocurren a presión constante (por ejemplo, en un vaso abierto al aire). En esas condiciones, es más útil trabajar con la **entalpía** ($H$), una magnitud que incluye el calor intercambiado a presión constante:

$$\Delta H = Q_p$$

Si $\Delta H<0$, la reacción es **exotérmica** (desprende calor); si $\Delta H>0$, es **endotérmica** (absorbe calor). La entalpía estándar de reacción ($\Delta H^0$) se define a la presión estándar de **1 bar**; los datos suelen tabularse además a 298,15 K (25°C), pero la temperatura debe indicarse aparte — no forma parte de la definición de estado estándar.$mkd$, worked_example_markdown = $mkd$Una reacción tiene $\Delta H = -150$ kJ. ¿Es exotérmica o endotérmica? ¿Qué le pasa a la temperatura del entorno?

1. Como $\Delta H<0$, la reacción es **exotérmica**: libera calor al entorno.
2. Ese calor liberado hace que la **temperatura del entorno aumente**.$mkd$, practice_prompt = $mkd$La reacción de descomposición del carbonato de calcio tiene $\Delta H = +178$ kJ/mol. Explica si es exotérmica o endotérmica y qué habría que hacer para que se produzca.$mkd$, alert_markdown = NULL WHERE subject = 'quimica' AND sort_order = 26;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$La **entropía** ($S$) está relacionada con el número de formas (configuraciones microscópicas) en las que se puede organizar la energía y las partículas de un sistema; "desorden" es solo una imagen intuitiva de esta idea, útil pero no literal.

El Segundo Principio de la Termodinámica establece que, en un proceso espontáneo, la entropía del universo (sistema + entorno) aumenta: $\Delta S_{\text{universo}}>0$. En el límite ideal de un proceso reversible, $\Delta S_{\text{universo}}=0$. Ojo: esto se refiere al universo, no necesariamente al sistema — un sistema puede **disminuir** su propia entropía en un proceso espontáneo, si el entorno la aumenta todavía más.

En general, la entropía de una sustancia aumenta al pasar de sólido a líquido a gas, y también aumenta cuando el número de moles de gas aumenta en una reacción.$mkd$, worked_example_markdown = $mkd$Predice si la entropía del sistema aumenta o disminuye en la reacción $N_2(g)+3H_2(g)\to 2NH_3(g)$.

1. Contamos moles de gas: 4 mol de reactivos (1+3) frente a 2 mol de productos.
2. El número de moles de gas disminuye.
3. Resultado: la entropía del sistema **disminuye** ($\Delta S_{\text{sistema}}<0$) — y aun así la reacción puede ser espontánea si el entorno gana suficiente entropía (por ejemplo, al ser una reacción exotérmica).$mkd$, practice_prompt = $mkd$Predice si la entropía aumenta o disminuye cuando el agua líquida se congela para formar hielo, y explica por qué.$mkd$, alert_markdown = NULL WHERE subject = 'quimica' AND sort_order = 29;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Para saber si una reacción ocurre espontáneamente no basta con mirar la entalpía ni la entropía por separado: a presión y temperatura constantes, hay que combinarlas en la **energía libre de Gibbs**:

$$\Delta G = \Delta H - T\Delta S$$

Si $\Delta G<0$, la reacción es **espontánea**; si $\Delta G>0$, no lo es; si $\Delta G=0$, el sistema está en equilibrio (siempre a $P$ y $T$ constantes). El signo de $\Delta G$ puede depender de la temperatura cuando $\Delta H$ y $\Delta S$ tienen el mismo signo.$mkd$, worked_example_markdown = $mkd$Una reacción tiene $\Delta H=-50$ kJ y $\Delta S=-100$ J/K a $T=300$ K (presión constante). ¿Es espontánea?

1. Pasamos $\Delta S$ a kJ/K: $-0{,}1$ kJ/K
2. Aplicamos: $\Delta G = -50 - 300\times(-0{,}1)$
3. Calculamos: $\Delta G = -50+30$
4. Resultado: $\Delta G = \mathbf{-20\ \text{kJ}}$ — la reacción **es espontánea** a esta temperatura$mkd$, practice_prompt = $mkd$La misma reacción del ejemplo ($\Delta H=-50$ kJ, $\Delta S=-100$ J/K), ¿sigue siendo espontánea a $T=600$ K? Calcula $\Delta G$ y comprueba si cambia el resultado.$mkd$, alert_markdown = NULL WHERE subject = 'quimica' AND sort_order = 30;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$El equilibrio se puede expresar en presiones parciales usando la constante $K_p$, que utiliza las **presiones parciales de las especies gaseosas** presentes en el equilibrio:

$$K_p = \dfrac{p_C^c\cdot p_D^d}{p_A^a\cdot p_B^b}$$

Un equilibrio puede contener también sólidos o líquidos puros: estos no aparecen en la expresión de $K_p$ (ni en la de $K_c$), igual que ocurre en los equilibrios heterogéneos.

$K_p$ y $K_c$ están relacionadas mediante $K_p = K_c(RT)^{\Delta n}$, donde $\Delta n$ se calcula **solo con las especies gaseosas**: $\Delta n = (\text{mol de gas en productos}) - (\text{mol de gas en reactivos})$.$mkd$, worked_example_markdown = $mkd$Calcula $K_p$ a $T=500$ K para el equilibrio $N_2(g)+3H_2(g)\rightleftharpoons2NH_3(g)$ ($K_c=0{,}08$; $\Delta n=2-4=-2$).

1. Aplicamos: $K_p = K_c(RT)^{\Delta n} = 0{,}08\times(0{,}082\times500)^{-2}$
2. Calculamos $(0{,}082\times500)=41$; $41^{-2}\approx 0{,}000595$
3. Resultado: $K_p \approx 0{,}08\times0{,}000595 \approx \mathbf{4{,}76\times10^{-5}}$$mkd$, practice_prompt = $mkd$Calcula $\Delta n$ y la relación entre $K_p$ y $K_c$ para el equilibrio $2SO_2(g)+O_2(g)\rightleftharpoons2SO_3(g)$.$mkd$, alert_markdown = NULL WHERE subject = 'quimica' AND sort_order = 33;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Dos factores muy preguntados en el Principio de Le Chatelier:

- **Reducir el volumen del recipiente (lo que aumenta la presión):** el equilibrio se desplaza hacia el lado con **menos moles de gas**, porque así se contrarresta parcialmente el aumento de presión. Ojo: esto se debe a que cambian las **concentraciones/presiones parciales** de las especies reaccionantes al reducir el volumen — si en cambio se añade un gas inerte a volumen constante, las presiones parciales de las especies del equilibrio no cambian, y el equilibrio **no se desplaza**.
- **Temperatura:** al aumentar la temperatura, el equilibrio se desplaza en el sentido **endotérmico**; al enfriar, en el sentido **exotérmico**.

A diferencia de la concentración o la presión, cambiar la temperatura sí modifica el valor de la constante de equilibrio.$mkd$, worked_example_markdown = $mkd$En $N_2+3H_2\rightleftharpoons2NH_3$ (4 mol de gas → 2 mol de gas), ¿hacia dónde se desplaza si reducimos el volumen del recipiente (aumentando la presión)?

1. El lado de los productos tiene menos moles de gas (2 frente a 4).
2. Al reducir el volumen aumentan todas las presiones parciales; el sistema se desplaza para reducir el número de moles de gas.
3. Resultado: el equilibrio se desplaza hacia la **derecha** (más $NH_3$).$mkd$, practice_prompt = $mkd$Explica qué le pasaría al mismo equilibrio si redujéramos la presión aumentando el volumen del recipiente. ¿Y si, a volumen constante, añadiéramos un gas inerte que no participa en la reacción?$mkd$, alert_markdown = NULL WHERE subject = 'quimica' AND sort_order = 37;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Muchas reacciones no ocurren en un solo paso, sino a través de varias **etapas elementales** que forman el **mecanismo de reacción**. Como aproximación introductoria, se suele decir que la etapa más lenta (la **etapa determinante**) marca la velocidad global — pero esto no es una ley universal: la ley de velocidad real depende del mecanismo completo, y solo en los mecanismos donde existe una etapa claramente más lenta que las demás esa etapa controla la velocidad global.

Un **catalizador** acelera la reacción ofreciendo un mecanismo alternativo con menor energía de activación, sin alterar $\Delta H$ ni consumirse en el proceso. Los catalizadores no desplazan la posición del equilibrio, solo hacen que se alcance más rápido.$mkd$, worked_example_markdown = $mkd$Explica por qué un catalizador no cambia el rendimiento final de una reacción en equilibrio, solo la rapidez con la que se alcanza.

1. Un catalizador acelera **por igual** la reacción directa y la inversa (reduce $E_a$ en ambos sentidos).
2. Como acelera ambas por igual, la constante de equilibrio $K_c$ no cambia.
3. Resultado: se llega antes al mismo equilibrio, pero las concentraciones finales son las mismas.$mkd$, practice_prompt = $mkd$Explica la diferencia entre un catalizador homogéneo (misma fase que los reactivos) y uno heterogéneo (fase distinta, como un sólido en contacto con gases). Pon un ejemplo de cada uno.$mkd$, alert_markdown = NULL WHERE subject = 'quimica' AND sort_order = 42;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Existen varias formas de definir qué es un ácido y una base:

- **Arrhenius:** un ácido es una sustancia que en agua aumenta la concentración de $H_3O^+$; una base aumenta la de $OH^-$. Es la definición más limitada (solo funciona en agua). El protón $H^+$ no existe libre en disolución acuosa —siempre está unido a una molécula de agua como $H_3O^+$—, aunque en muchas ecuaciones se use "$H^+$" como abreviatura habitual.
- **Brønsted-Lowry:** un ácido es una sustancia que **cede** un protón ($H^+$); una base es la que lo **acepta**. Funciona en cualquier disolvente.

Cuando un ácido cede un protón, se transforma en su **base conjugada**; cuando una base acepta un protón, se transforma en su **ácido conjugado**.$mkd$, worked_example_markdown = $mkd$En la reacción $HCl+H_2O\rightleftharpoons H_3O^++Cl^-$, identifica el ácido, la base y sus conjugados según Brønsted-Lowry.

1. El $HCl$ cede un protón al agua: es el **ácido**.
2. El $H_2O$ acepta ese protón: es la **base**.
3. Resultado: $Cl^-$ es la **base conjugada** del $HCl$; $H_3O^+$ es el **ácido conjugado** del agua.$mkd$, practice_prompt = $mkd$En la reacción $NH_3+H_2O\rightleftharpoons NH_4^++OH^-$, identifica el ácido, la base y sus conjugados según Brønsted-Lowry.$mkd$, alert_markdown = NULL WHERE subject = 'quimica' AND sort_order = 43;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Los ácidos y bases fuertes se disocian completamente en agua. Para los ácidos y bases fuertes **monopróticos** habituales en PAU ($HCl$, $HNO_3$, $NaOH$...), la concentración de $H_3O^+$ (o $OH^-$) coincide directamente con la concentración inicial. Para un ácido fuerte que libera más de un protón, no se puede suponer sin más que $[H_3O^+]$ sea el doble (o el triple) de la concentración inicial: cada disociación es un proceso distinto y hay que analizarlo según el caso concreto. En PAU, salvo que el enunciado indique lo contrario, trabaja con los ácidos/bases fuertes monopróticos habituales.$mkd$, worked_example_markdown = $mkd$Calcula el pH de una disolución de $HCl$ 0,01 M (ácido fuerte, monoprótico).

1. Como es fuerte y monoprótico, $[H_3O^+] = 0{,}01$ mol/L (se disocia al 100%)
2. Aplicamos: $pH = -\log(0{,}01) = -\log(10^{-2})$
3. Resultado: $pH = \mathbf{2}$$mkd$, practice_prompt = $mkd$Calcula el pH de una disolución de $NaOH$ 0,001 M (base fuerte).$mkd$, alert_markdown = NULL WHERE subject = 'quimica' AND sort_order = 46;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Para un ácido débil, no toda la concentración inicial se disocia: hay que plantear el equilibrio con $K_a$ y, normalmente, aproximar suponiendo que lo disociado ($x$) es mucho menor que la concentración inicial ($x\ll C_0$):

$$K_a \approx \dfrac{x^2}{C_0} \implies x = [H_3O^+] \approx \sqrt{K_a\cdot C_0}$$

Esta aproximación es válida si $x$ resulta menor que aproximadamente el 5% de $C_0$; si no se cumple, hay que resolver la ecuación de segundo grado completa sin despreciar $x$ frente a $C_0$.$mkd$, worked_example_markdown = $mkd$Calcula el pH de una disolución 0,1 M de ácido acético ($K_a=1{,}8\times10^{-5}$).

1. Aplicamos la aproximación: $[H_3O^+] \approx \sqrt{K_a\cdot C_0} = \sqrt{1{,}8\times10^{-5}\times0{,}1}$
2. Calculamos: $[H_3O^+] \approx \sqrt{1{,}8\times10^{-6}} \approx 1{,}34\times10^{-3}$
3. Comprobamos: $x/C_0 = 1{,}34\times10^{-3}/0{,}1 \approx 1{,}3\%$, menor del 5% → aproximación válida
4. Resultado: $pH = -\log(1{,}34\times10^{-3}) \approx \mathbf{2{,}87}$$mkd$, practice_prompt = $mkd$Calcula el pH de una disolución 0,2 M de ácido fórmico ($K_a=1{,}8\times10^{-4}$), y comprueba si la aproximación $x\ll C_0$ es válida.$mkd$, alert_markdown = NULL WHERE subject = 'quimica' AND sort_order = 47;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Una **valoración ácido-base** consiste en añadir, gota a gota, una disolución de concentración conocida (valorante) sobre otra de concentración desconocida, hasta alcanzar el **punto de equivalencia**: el momento en que las cantidades de ácido y base añadidas son químicamente equivalentes. En ese punto (para reacciones 1:1):

$$M_{ácido}\cdot V_{ácido} = M_{base}\cdot V_{base}$$

El **punto final** es el momento en que observamos el cambio de color del indicador durante la valoración real. Idealmente el punto final coincide con el punto de equivalencia, pero son conceptos distintos: el punto final depende del indicador elegido y puede no coincidir exactamente con el punto de equivalencia real.$mkd$, worked_example_markdown = $mkd$Se necesitan 25 mL de $NaOH$ 0,1 M para neutralizar 20 mL de una disolución de $HCl$ de concentración desconocida. Calcula la concentración del $HCl$.

1. Aplicamos: $M_{HCl}\times20 = 0{,}1\times25$
2. Despejamos: $M_{HCl} = \dfrac{0{,}1\times25}{20}$
3. Resultado: $M_{HCl} = \mathbf{0{,}125\ \text{M}}$$mkd$, practice_prompt = $mkd$Se necesitan 15 mL de $HCl$ 0,2 M para neutralizar 30 mL de una disolución de $NaOH$. Calcula la concentración del $NaOH$.$mkd$, alert_markdown = NULL WHERE subject = 'quimica' AND sort_order = 50;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$El signo de $E^0_{pila}$ indica si una reacción redox es espontánea:

- Si $E^0_{pila}>0$: la reacción **es espontánea** tal como está escrita.
- Si $E^0_{pila}<0$: la reacción **no es espontánea** (sería espontánea la inversa).

Esta idea sirve para predecir si una especie puede oxidar o reducir a otra sin necesidad de montar una pila: basta comparar sus potenciales estándar — siempre que se use el par redox correcto para cada especie (por ejemplo, para saber si algo oxida a $Fe^{2+}$ hasta $Fe^{3+}$ hace falta el potencial del par $Fe^{3+}/Fe^{2+}$, no el de $Fe^{2+}/Fe$).$mkd$, worked_example_markdown = $mkd$¿Puede el $Zn$ metálico reducir al $Cu^{2+}$ espontáneamente? ($E^0(Cu^{2+}/Cu)=+0{,}34$ V, $E^0(Zn^{2+}/Zn)=-0{,}76$ V)

1. Para que el Zn reduzca al $Cu^{2+}$, el Zn debe oxidarse y el $Cu^{2+}$ reducirse.
2. $E^0_{pila} = 0{,}34-(-0{,}76) = 1{,}1$ V
3. Resultado: como $E^0_{pila}>0$, la reacción **sí es espontánea**.$mkd$, practice_prompt = $mkd$¿Puede el $Ag^+$ oxidar espontáneamente al $Fe$ metálico? Usa $E^0(Ag^+/Ag)=+0{,}80$ V y $E^0(Fe^{2+}/Fe)=-0{,}44$ V para justificarlo.$mkd$, alert_markdown = NULL WHERE subject = 'quimica' AND sort_order = 55;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$El carbono es el elemento central de la química orgánica porque puede formar hasta 4 enlaces covalentes muy estables, incluso consigo mismo. En los hidrocarburos, según su hibridación:

- **Hibridación $sp^3$:** 4 enlaces simples, geometría tetraédrica (109,5°) — alcanos.
- **Hibridación $sp^2$:** 1 enlace doble y 2 simples, geometría trigonal plana (120°) — alquenos.
- **Hibridación $sp$:** 1 enlace triple (o 2 dobles) y 1 simple, geometría lineal (180°) — alquinos.

Esta relación es la que necesitas para los hidrocarburos de PAU; no es una definición general de la hibridación válida para cualquier átomo o situación, sino el patrón típico del carbono en estos compuestos.$mkd$, worked_example_markdown = $mkd$Indica la hibridación del carbono en el eteno ($CH_2=CH_2$) y el ángulo de enlace esperado.

1. El eteno tiene un doble enlace $C=C$: hibridación $sp^2$
2. La geometría $sp^2$ es trigonal plana.
3. Resultado: hibridación **$sp^2$**, ángulos de enlace de aproximadamente **120°**$mkd$, practice_prompt = $mkd$Indica la hibridación del carbono en el etino o acetileno ($CH\equiv CH$) y su geometría.$mkd$, alert_markdown = NULL WHERE subject = 'quimica' AND sort_order = 59;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Un **grupo funcional** es un átomo o conjunto de átomos que le da a la molécula sus propiedades químicas características. Para la nomenclatura de PAU, algunos de los grupos más importantes, de mayor a menor prioridad, son: ácidos carboxílicos ($-COOH$), ésteres, amidas, nitrilos, aldehídos ($-CHO$), cetonas ($-CO-$), alcoholes ($-OH$), aminas ($-NH_2$), e hidrocarburos — sin que esta lista agote todos los grupos funcionales que existen.

El grupo de mayor prioridad presente en la molécula se nombra como **sufijo**; el resto como prefijos (hidroxi-, oxo-, amino-...).$mkd$, worked_example_markdown = $mkd$¿Qué grupo funcional tiene prioridad si una molécula contiene a la vez un alcohol y un ácido carboxílico?

1. Comparamos su posición en el orden de prioridad: ácido carboxílico > alcohol.
2. Resultado: la molécula se nombrará como **ácido**, y el grupo -OH se indicará como prefijo **hidroxi-**.$mkd$, practice_prompt = $mkd$¿Qué grupo funcional tiene prioridad si una molécula contiene a la vez una cetona y una amina?$mkd$, alert_markdown = NULL WHERE subject = 'quimica' AND sort_order = 60;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$En una reacción de **sustitución**, un átomo o grupo de una molécula orgánica es reemplazado por otro, sin que cambie el grado de saturación de la cadena. Aparece en dos contextos habituales en PAU:

- **Alcanos y aromáticos:** sustitución de un H por un halógeno, $R{-}H + X_2 \to R{-}X + HX$, que suele requerir condiciones especiales (como luz ultravioleta) porque los enlaces C-H y C-C son poco reactivos.
- **Haloalcanos:** el halógeno es sustituido por otro grupo, por ejemplo por $OH^-$ para dar un alcohol: $R{-}X + NaOH \to R{-}OH + NaX$.$mkd$, worked_example_markdown = $mkd$Escribe la reacción de sustitución del metano con cloro (cloración).

1. Un átomo de H del metano es reemplazado por un átomo de Cl.
2. Se libera HCl como subproducto.
3. Resultado: $\mathbf{CH_4 + Cl_2 \to CH_3Cl + HCl}$$mkd$, practice_prompt = $mkd$Escribe la reacción de sustitución del 1-cloropropano con $NaOH$, indicando qué compuesto se obtiene.$mkd$, alert_markdown = NULL WHERE subject = 'quimica' AND sort_order = 64;
UPDATE curriculum_content_v2 SET concept_markdown = $mkd$Las reacciones de **eliminación** son el proceso contrario a la adición: a partir de un compuesto saturado se eliminan dos átomos o grupos (normalmente de carbonos adyacentes) para formar un enlace múltiple nuevo.

Ejemplos habituales: **deshidrogenación** (se elimina $H_2$ de un alcano), **deshidrohalogenación** (se elimina un halogenuro de hidrógeno de un haloalcano, típicamente con una base como $KOH$ en disolución alcohólica) y **deshidratación** (se elimina $H_2O$ de un alcohol para dar un alqueno, con catalizador ácido y calor).$mkd$, worked_example_markdown = $mkd$Escribe la reacción de deshidratación del etanol para formar eteno.

1. Se elimina una molécula de agua del etanol (con catalizador ácido y calor).
2. Se forma un doble enlace entre los dos carbonos.
3. Resultado: $\mathbf{CH_3-CH_2OH \to CH_2=CH_2 + H_2O}$$mkd$, practice_prompt = $mkd$Escribe la reacción de deshidrohalogenación del cloroetano con $KOH$ en disolución alcohólica para formar eteno, indicando los dos productos que se obtienen además del alqueno.$mkd$, alert_markdown = NULL WHERE subject = 'quimica' AND sort_order = 66;
