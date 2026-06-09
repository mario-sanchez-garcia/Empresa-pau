export type BloqueQuimica = "Pregunta1" | "Pregunta2" | "Pregunta3" | "Pregunta4" | "Pregunta5"

export interface PreguntaQuimica {
  id: string
  año: number
  convocatoria: "Ordinaria" | "Extraordinaria" | "Modelo"
  opcion: "A" | "B"
  bloque: BloqueQuimica
  label: string
  numero: string
  enunciado: string
  puntuacion: number
  criterios: string
  pdfFuente?: string
}

export interface ExamenQuimica {
  id: number
  año: number
  tipo: "Ordinaria" | "Extraordinaria" | "Modelo"
  asignatura: "Química"
  comunidad: "Madrid"
  preguntas: PreguntaQuimica[]
}

export const examenesQuimica: ExamenQuimica[] = 
[
  {
    id: 2018,
    año: 2018,
    tipo: "Ordinaria",
    asignatura: "Química",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "q-2018-A-1",
        año: 2018,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "A.1",
        enunciado: `Un elemento químico posee una configuración electrónica $1s^22s^22p^63s^23p^64s^23d^6$. Justifique
si son verdaderas o falsas las siguientes afirmaciones:
a) Pertenece al grupo 17 del Sistema Periódico.
b) Se encuentra situado en el tercer periodo.
c) Conduce la electricidad en estado sólido.
d) Los números cuánticos $(n=3, l=1, m_l=-2, m_s=+\\frac{1}{2})$ corresponden a un electrón de este elemento.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2018.pdf"
      },
      {
        id: "q-2018-A-2",
        año: 2018,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "A.2",
        enunciado: `Responda a las siguientes cuestiones:
a) Escriba los equilibrios de disociación en agua de $\\text{HNO}_2$, $\\text{NH}_3$ y $\\text{HSO}_4^-$ e indique si actúan como ácido o
como base.
b) Se dispone de una disolución de ácido acético 0,2 M y otra de igual concentración de ácido salicílico.
Justifique cuál de las dos tiene menor pH.
c) Calcule el pH de una disolución de amoniaco 0,45 M.
Datos. $K_a(\\text{HNO}_2) = 5{,}6 \\cdot 10^{-4}$; $K_a(\\text{HSO}_4^-) = 1{,}0 \\cdot 10^{-2}$; $K_a(\\text{ácido acético}) = 1{,}8 \\cdot 10^{-5}$; $K_a(\\text{ácido salicílico}) = 1{,}1 \\cdot 10^{-3}$; $K_b(\\text{amoniaco}) = 1{,}8 \\cdot 10^{-5}$.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2018.pdf"
      },
      {
        id: "q-2018-A-3",
        año: 2018,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "A.3",
        enunciado: `Responda a las siguientes cuestiones:
a) Escriba dos isómeros de función con la fórmula $\\text{C}_3\\text{H}_6\\text{O}$ y nómbrelos.
b) Formule la reacción, indique de qué tipo es, nombre la regla que se sigue para la obtención del producto
mayoritario y nombre el reactivo y el producto: $\\text{CH}_3-\\text{CHOH}-\\text{CH}_2-\\text{CH}_3 + \\text{H}_2\\text{SO}_4/\\text{calor} \\rightarrow$
c) Nombre y escriba la fórmula del producto de la reacción de $\\text{CH}_3-\\text{CH}_2-\\text{CH}_2-\\text{CHO}$ con un reductor.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2018.pdf"
      },
      {
        id: "q-2018-A-4",
        año: 2018,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "A.4",
        enunciado: `A 25 ºC se produce la reacción $\\text{AB}_3(g) \\rightleftharpoons \\text{AB}_2(g) + \\frac{1}{2}\\text{B}_2(g)$, cuando se alcanza el equilibrio
$\\text{AB}_3(g)$ está disociado al 65% con una presión total de 0,25 atm. Calcule:
a) Las presiones parciales de cada gas en el equilibrio.
b) $K_p$ y $K_c$.
Dato. $R = 0{,}082\\ \\text{atm}\\cdot\\text{L}\\cdot\\text{mol}^{-1}\\cdot\\text{K}^{-1}$.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2018.pdf"
      },
      {
        id: "q-2018-A-5",
        año: 2018,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "A.5",
        enunciado: `A partir de los potenciales de reducción que se adjuntan, conteste razonadamente:
a) ¿Qué metales de la lista se disolverán en una disolución de HCl 1 M?
b) Se dispone de tres recipientes con disoluciones de nitrato de plata, nitrato de cinc y nitrato de
manganeso (II). En cada uno se introduce una barra de hierro ¿en qué caso se formará una capa del
otro metal sobre la barra de hierro?
Datos. $E^0$(V): $\\text{Fe}^{2+}$/Fe $= -0{,}44$; $\\text{Zn}^{2+}$/Zn $= -0{,}76$; $\\text{Ag}^+$/Ag $= 0{,}80$; $\\text{Cu}^{2+}$/Cu $= 0{,}34$; $\\text{Na}^+$/Na $= -2{,}71$; $\\text{Mn}^{2+}$/Mn $= -1{,}18$.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2018.pdf"
      },
      {
        id: "q-2018-B-1",
        año: 2018,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "B.1",
        enunciado: `Considere los elementos Mg y Cl:
a) Escriba la configuración electrónica de $\\text{Mg}^{2+}$ y $\\text{Cl}^-$.
b) Indique los números cuánticos del electrón más externo del Mg.
c) Ordene los elementos por orden creciente de tamaño y justifique la respuesta.
d) Ordene los elementos por orden creciente de primera energía de ionización y justifique la respuesta.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2018.pdf"
      },
      {
        id: "q-2018-B-2",
        año: 2018,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "B.2",
        enunciado: `La reacción $3\\ \\text{A}(g) + \\text{B}(g) \\rightarrow 2\\ \\text{C}(g) + \\text{D}(g)$ es de orden 1 respecto de A y de orden 2
respecto de B.
a) Escriba la velocidad de la reacción en función de cada especie y justifique si la velocidad de
desaparición de B es doble de la velocidad de desaparición de A.
b) Obtenga las unidades de la constante de velocidad.
c) Razone si la reacción directa es endotérmica sabiendo que la energía de activación es $35\\ \\text{kJ}$ y la de la
reacción inversa es $62\\ \\text{kJ}$.
d) Explique cómo afecta a la velocidad de reacción un aumento de volumen a temperatura constante.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2018.pdf"
      },
      {
        id: "q-2018-B-3",
        año: 2018,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "B.3",
        enunciado: `En una celda electrolítica se introduce cloruro de sodio fundido, obteniéndose cloro molecular
y sodio metálico.
a) Escriba las reacciones que se producen en el ánodo y en el cátodo de la celda electrolítica.
b) Calcule el potencial necesario para que se produzca la electrolisis.
c) Calcule el tiempo requerido para que se desprenda 1 mol de $\\text{Cl}_2$ si se emplea una intensidad de 10 A.
Datos. $E^0$(V): $\\text{Cl}_2/\\text{Cl}^- = 1{,}36$; $\\text{Na}^+$/Na $= -2{,}71$; $F = 96485$ C.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2018.pdf"
      },
      {
        id: "q-2018-B-4",
        año: 2018,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "B.4",
        enunciado: `Se dispone de $\\text{H}_2\\text{SO}_4$ comercial de 96,4% de riqueza en masa y densidad $1{,}84\\ \\text{g}\\cdot\\text{mL}^{-1}$.
Calcule:
a) El volumen de ácido comercial que se necesita para preparar 200 mL de disolución 0,5 M.
b) El pH de la disolución resultante de mezclar 25 mL de disolución 0,1 M de $\\text{H}_2\\text{SO}_4$ con 50 mL de
disolución 0,5 M de $\\text{NaOH}$. Suponga los volúmenes aditivos.
Datos. Masas atómicas: H = 1; O =16; S = 32.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2018.pdf"
      },
      {
        id: "q-2018-B-5",
        año: 2018,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "B.5",
        enunciado: `Responda a las siguientes cuestiones:
a) Nombre los siguientes compuestos: $\\text{CH}_2\\text{OH}-\\text{CH}_2-\\text{CH}=\\text{CH}-\\text{CH}_3$ y $\\text{CH}_3-\\text{CO}-\\text{CH}_2-\\text{CO}-\\text{CH}_3$.
b) Formule la reacción, indique de qué tipo es, y nombre el reactivo y el producto obtenido:
$\\text{CH}_3-\\text{CHOH}-\\text{CH}_2-\\text{CH}_2-\\text{CH}_2-\\text{CH}_3 + \\text{KMnO}_4/\\text{H}^+ \\rightarrow$
c) Formule y nombre el monómero que ha dado lugar al siguiente polímero: $-(\\text{CH}_2-\\text{CH}_2)_n-$. Nombre el tipo
de reacción.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2018.pdf"
      }
    ]
  },
  {
    id: 2019,
    año: 2019,
    tipo: "Ordinaria",
    asignatura: "Química",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "q-2019-A-1",
        año: 2019,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "A.1",
        enunciado: "Considere los átomos: A (Z = 11), B (Z = 14) y C (Z = 17) y responda las siguientes preguntas:\na) Para cada uno de ellos, escriba la configuración electrónica, especifique el grupo y periodo del sistema\nperiódico al que pertenece e identifique con nombre y símbolo cada elemento.\nb) Ordene los elementos en orden creciente de su afinidad electrónica. Razone la respuesta.\nc) Formule los compuestos formados al unirse: n átomos de A, C con C y A con C. Indique el tipo de enlace\nen cada caso.\nd) ¿Por qué los átomos presentan espectros de líneas y no continuos?",
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2019.pdf"
      },
      {
        id: "q-2019-A-2",
        año: 2019,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "A.2",
        enunciado: `Justifique si el pH de las siguientes disoluciones es ácido, básico o neutro:
a) Cloruro de amonio 0,1 M.
b) Acetato de sodio 0,1 M.
c) 50 mL de ácido clorhídrico 0,2 M + 200 mL de hidróxido de sodio 0,05 M.
d) Hidróxido de bario 0,1 M.
Datos: $K_a(\\text{ácido acético}) = 1{,}8 \\cdot 10^{-5}$; $K_b(\\text{amoniaco}) = 1{,}8 \\cdot 10^{-5}$.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2019.pdf"
      },
      {
        id: "q-2019-A-3",
        año: 2019,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "A.3",
        enunciado: `Formule las reacciones propuestas, indicando de qué tipo son y nombrando los productos
mayoritarios obtenidos:
a) 2-metilbut-2-eno + $\\text{HBr}$ $\\rightarrow$
b) Etanol + $\\text{H}_2\\text{SO}_4$/calor $\\rightarrow$
c) Butan-1-ol + $\\text{HCl}$ $\\rightarrow$
d) Ácido etanoico + propan-1-ol $\\rightarrow$`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2019.pdf"
      },
      {
        id: "q-2019-A-4",
        año: 2019,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "A.4",
        enunciado: `En un reactor químico a 182 ºC y 1 atm de presión el $\\text{SbCl}_5$ está disociado en un 29,2% según
la reacción: $\\text{SbCl}_5(g) \\rightleftharpoons \\text{SbCl}_3(g) + \\text{Cl}_2(g)$.
a) Calcule las presiones parciales de cada gas en el equilibrio.
b) Calcule las constantes de equilibrio $K_p$ y $K_c$.
c) Justifique si se modifica el equilibrio al realizar la reacción a la misma temperatura y a una presión
menor de 1 atm.
d) Indique si se modifica el equilibrio al añadir un catalizador. Justifique la respuesta.
Datos: $R = 0{,}082\\ \\text{atm}\\cdot\\text{L}\\cdot\\text{mol}^{-1}\\cdot\\text{K}^{-1}$.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2019.pdf"
      },
      {
        id: "q-2019-A-5",
        año: 2019,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "A.5",
        enunciado: `El estaño metálico es oxidado por el ácido nítrico a óxido de estaño (IV) obteniéndose además
óxido de nitrógeno (IV) y agua.
a) Escriba y ajuste las semirreacciones de oxidación y reducción que tienen lugar.
b) Escriba la reacción iónica y la molecular global ajustadas por el método del ion electrón.
c) Calcule la masa obtenida de óxido de estaño (IV) si se hace reaccionar 100 g de estaño de riqueza 70%
en masa, sabiendo que el rendimiento de la reacción es del 90%.
Datos: $R = 0{,}082\\ \\text{atm}\\cdot\\text{L}\\cdot\\text{mol}^{-1}\\cdot\\text{K}^{-1}$; Masas atómicas: O = 16,0; Sn = 118,7.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2019.pdf"
      },
      {
        id: "q-2019-B-1",
        año: 2019,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "B.1",
        enunciado: `Para las moléculas $\\text{BCl}_3$ y $\\text{PCl}_3$.
a) Justifique el número de pares de electrones enlazantes y de pares libres del átomo central.
b) Indique su geometría molecular y la hibridación que presenta el átomo central.
c) Explique su polaridad.
d) Indique las fuerzas intermoleculares que presentan.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2019.pdf"
      },
      {
        id: "q-2019-B-2",
        año: 2019,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "B.2",
        enunciado: `Responda las siguientes cuestiones:
a) Formule el 1-cloropropano y nombre los isómeros de posición posibles.
b) Escriba la reacción de sustitución de cada uno de los isómeros del apartado a) con $\\text{NaOH}$. Nombre los
productos obtenidos.
c) Escriba las fórmulas semidesarrolladas de los compuestos orgánicos: 2-metilbutilamina, etanoato de
metilo y ácido 2,3-dihidroxibutanoico.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2019.pdf"
      },
      {
        id: "q-2019-B-3",
        año: 2019,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "B.3",
        enunciado: `La constante de solubilidad del dicloruro de plomo es $1{,}6 \\cdot 10^{-5}$.
a) Formule el equilibrio de solubilidad del dicloruro de plomo en agua.
b) Determine la solubilidad del dicloruro de plomo en agua en molaridad y g·L$^{-1}$.
c) Justifique cómo afecta a la solubilidad del dicloruro de plomo la adición de cloruro de potasio.
Datos. Masas atómicas: Cl = 35,5; Pb = 207,2.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2019.pdf"
      },
      {
        id: "q-2019-B-4",
        año: 2019,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "B.4",
        enunciado: `Se forma una pila galvánica con un electrodo de hierro y otro de plata. Teniendo en cuenta los
potenciales de reducción estándar que se adjuntan:
a) Escriba las semirreacciones que tienen lugar en el ánodo y en el cátodo de la pila galvánica e indique el
sentido del movimiento de los iones metálicos de las disoluciones con respecto a los electrodos metálicos.
b) Calcule el potencial de la pila formada.
c) Dibuje un esquema de la pila indicando sus componentes.
d) Razone qué ocurriría si introdujéramos una cuchara de plata en una disolución de $\\text{Fe}^{2+}$.
Datos. $E^0$(V): $\\text{Ag}^+$/Ag $= 0{,}80$; $\\text{Fe}^{2+}$/Fe $= -0{,}44$.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2019.pdf"
      },
      {
        id: "q-2019-B-5",
        año: 2019,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "B.5",
        enunciado: `Se quiere preparar 500 mL de disolución acuosa de amoniaco 0,1 M a partir de 1 L de amoniaco
comercial de 25% de riqueza en masa con una densidad del 0,9 g·cm$^{-3}$.
a) Determine el volumen de amoniaco comercial necesario para preparar dicha disolución.
b) Calcule el pH de la disolución de 500 mL de amoniaco 0,1 M inicial.
c) Justifique con las reacciones adecuadas el pH resultante (ácido, básico o neutro) al añadir 250 mL de
ácido clorhídrico 0,2 M a la disolución de 500 mL de amoniaco 0,1 M. Considere volúmenes aditivos.
Datos: $K_b(\\text{amoniaco}) = 1{,}8 \\cdot 10^{-5}$. Masas atómicas: H = 1; N = 14.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2019.pdf"
      }
    ]
  },
  {
    id: 2020,
    año: 2020,
    tipo: "Ordinaria",
    asignatura: "Química",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "q-2020-A-1",
        año: 2020,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "A.1",
        enunciado: `(2 puntos) Considere los elementos aluminio y magnesio.
a) Escriba la configuración electrónica de cada elemento.
b) Justifique qué elemento presenta mayor radio atómico.
c) Explique si la segunda energía de ionización del aluminio es mayor, igual o menor que la primera.
d) Sabiendo que la primera energía de ionización del magnesio es $738{,}1\\ \\text{kJ}\\cdot\\text{mol}^{-1}$, razone si es posible
ionizar un mol de átomos de magnesio gaseosos con una energía de $500\\ \\text{kJ}$.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2020.pdf"
      },
      {
        id: "q-2020-A-2",
        año: 2020,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "A.2",
        enunciado: `(2 puntos) Justifique si el pH de las siguientes disoluciones acuosas es ácido, básico o neutro. Escriba
las reacciones correspondientes y realice cálculos sólo cuando lo considere necesario.
a) 100 mL de ácido acético 0,2 M + 200 mL de hidróxido de sodio 0,1 M.
b) Amoniaco.
c) 100 mL de ácido clorhídrico 0,2 M + 150 mL de hidróxido de sodio 0,2 M.
d) Hipobromito de sodio.
Datos. $K_a(\\text{ácido acético}) = 1{,}8 \\cdot 10^{-5}$; $K_a(\\text{ácido hipobromoso}) = 2{,}3 \\cdot 10^{-9}$; $K_b(\\text{amoniaco}) = 1{,}8 \\cdot 10^{-5}$.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2020.pdf"
      },
      {
        id: "q-2020-A-3",
        año: 2020,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "A.3",
        enunciado: `(2 puntos) Formule las reacciones propuestas, indique de qué tipo son y nombre los productos orgánicos
obtenidos:
a) But-2-eno + $\\text{H}_2$/catalizador $\\rightarrow$
b) Pentan-1-ol + $\\text{KMnO}_4$ (oxidante fuerte) $\\rightarrow$
c) 2-clorobutano + hidróxido de sodio (medio acuoso) $\\rightarrow$
d) Ácido propanoico + metanol (medio ácido) $\\rightarrow$`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2020.pdf"
      },
      {
        id: "q-2020-A-4",
        año: 2020,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "A.4",
        enunciado: `(2 puntos) A 2600 K se introduce 1 mol de agua en un recipiente vacío de 100 L, alcanzándose el siguiente
equilibrio: 2 $\\text{H}_2$O (g) $\\rightleftharpoons$ 2 $\\text{H}_2$ (g) + $\\text{O}_2$ (g), con $K_p = 4{,}2 \\cdot 10^{-5}$.
a) Calcule $K_c$.
b) Calcule el número de moles de $\\text{O}_2$ en el equilibrio.
c) Justifique cómo se modifica el equilibrio al aumentar la presión total por disminución de volumen.
Dato. R = 0,082 atm·L·mol$^{-1}$·K$^{-1}$.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2020.pdf"
      },
      {
        id: "q-2020-A-5",
        año: 2020,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "A.5",
        enunciado: `(2 puntos) Responda las siguientes cuestiones:
a) Se construye una pila galvánica con los electrodos $\\text{Zn}^{2+}$/Zn y $\\text{Fe}^{2+}$/Fe. Escriba las semirreacciones que
tienen lugar en el ánodo y en el cátodo y calcule el potencial.
b) Se tratan 317,5 g de zinc, de 90% de riqueza en masa, con una disolución de ácido nítrico diluido. Ajuste
la reacción y calcule los litros de hidrógeno que se obtienen a 25 ºC y 1 atm, si el rendimiento es del
80%.
Datos. $E^0$(V): $\\text{Zn}^{2+}$/Zn $= -0{,}76$; $\\text{Fe}^{2+}$/Fe $= -0{,}44$. R = 0,082 atm·L·mol$^{-1}$·K$^{-1}$. Masa atómica: Zn = 65,4.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2020.pdf"
      },
      {
        id: "q-2020-B-1",
        año: 2020,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "B.1",
        enunciado: "(2 puntos) Para las moléculas H2O y PF3.\na) Justifique el número de pares de electrones enlazantes y los pares libres del átomo central.\nb) Indique la hibridación que presenta el átomo central y su geometría.\nc) Explique su polaridad.\nd) Indique el tipo de fuerzas intermoleculares.",
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2020.pdf"
      },
      {
        id: "q-2020-B-2",
        año: 2020,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "B.2",
        enunciado: `(2 puntos) Formule y nombre los reactivos y todos los productos orgánicos de las siguientes reacciones:
a) Deshidratación de pentan-2-ol con ácido sulfúrico y calor.
b) Reducción de propanona.
c) $\\text{CH}_3-\\text{CHOH}-\\text{CH}_3 + \\text{CH}_3-\\text{COOH} \\rightarrow$
d) $\\text{CH}_3-\\text{CH}=\\text{C}(\\text{CH}_3)-\\text{CH}_2-\\text{CH}_3 + \\text{HCl} \\rightarrow$`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2020.pdf"
      },
      {
        id: "q-2020-B-3",
        año: 2020,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "B.3",
        enunciado: `(2 puntos) Una disolución saturada de hidróxido de calcio presenta una solubilidad de $0{,}96\\ \\text{g}\\cdot\\text{L}^{-1}$.
a) Formule el equilibrio de solubilidad, indicando el estado de cada especie.
b) Calcule el producto de solubilidad del hidróxido de calcio.
c) Calcule el pH de la disolución.
d) ¿Cómo afecta a la solubilidad del hidróxido de calcio un aumento de pH?
Datos. Masas atómicas: H = 1,0; O = 16,0; Ca = 40,1.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2020.pdf"
      },
      {
        id: "q-2020-B-4",
        año: 2020,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "B.4",
        enunciado: `(2 puntos) Se hace reaccionar una disolución de cloruro de sodio con permanganato de potasio en medio
ácido sulfúrico obteniéndose sulfato de manganeso (II), cloro, sulfato de potasio, sulfato de sodio y agua.
a) Ajuste por el método del ion-electrón las semirreacciones de oxidación y reducción que tienen lugar, e
indique las especies que actúan como oxidante y como reductora.
b) Ajuste las reacciones iónica y molecular global.
c) Calcule la masa, en kg, de cloruro de sodio necesaria para obtener $1\\ \\text{m}^3$ de cloro, medido a 750 mm de
Hg y 30 ºC, sabiendo que el rendimiento de la reacción es del 80%.
Datos. Masas atómicas: Na = 23,0; Cl = 35,5. $R = 0{,}082\\ \\text{atm}\\cdot\\text{L}\\cdot\\text{mol}^{-1}\\cdot\\text{K}^{-1}$.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2020.pdf"
      },
      {
        id: "q-2020-B-5",
        año: 2020,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "B.5",
        enunciado: `(2 puntos) Se tiene una disolución de ácido peryódico 0,10 M.
a) Calcule el pH de la disolución.
b) Determine el volumen de la disolución del enunciado necesario para preparar 250 mL de disolución de
ácido peryódico 0,02 M.
c) A 200 mL de la disolución del enunciado se le añaden 125 mL de hidróxido de sodio 0,16 M. Justifique si
el pH resultante es ácido, básico o neutro.
Dato. $K_a(\\text{ácido peryódico}) = 2{,}3 \\cdot 10^{-2}$.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2020.pdf"
      }
    ]
  },
  {
    id: 2021,
    año: 2021,
    tipo: "Ordinaria",
    asignatura: "Química",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "q-2021-A-1",
        año: 2021,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "A.1",
        enunciado: "(2 puntos) Dados los elementos A (Z=17), B (Z=35), C (Z=19) y D (Z=11):\na) Escriba la configuración electrónica de cada uno de ellos.\nb) Justifique cuáles se encuentran en el mismo periodo.\nc) Razone si el elemento D (Z=11) presenta mayor afinidad electrónica que el A (Z=17).",
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2021.pdf"
      },
      {
        id: "q-2021-A-2",
        año: 2021,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "A.2",
        enunciado: `(2 puntos) Conteste razonadamente las siguientes preguntas para los ácidos: $\\text{HNO}_2$, HF y HCN.
a) Suponiendo disoluciones acuosas de igual concentración de cada uno de ellos, explique cuál presenta
menor pH.
b) Justifique y ordene de mayor a menor basicidad las bases conjugadas.
c) Obtenga el pH de una disolución acuosa 0,2 M de HCN.
Datos. $K_a(\\text{HNO}_2) = 4{,}5 \\cdot 10^{-4}$; $K_a(\\text{HF}) = 7{,}1 \\cdot 10^{-4}$; $K_a(\\text{HCN}) = 4{,}9 \\cdot 10^{-10}$.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2021.pdf"
      },
      {
        id: "q-2021-A-3",
        año: 2021,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "A.3",
        enunciado: `(2 puntos) Se mezclan 0,200 L de disolución de nitrato de bario 0,100 M con 0,100 L de disolución de
fluoruro de potasio 0,400 M. Considere los volúmenes aditivos.
a) Escriba el equilibrio de solubilidad que tiene lugar, detallando el estado de todas las especies.
b) Justifique numéricamente la precipitación del fluoruro de bario.
c) Explique si aumenta, disminuye o no varía la solubilidad del fluoruro de bario cuando se le añade una
disolución de ácido fluorhídrico.
Dato. $K_s(\\text{fluoruro de bario}) = 1{,}0 \\cdot 10^{-6}$.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2021.pdf"
      },
      {
        id: "q-2021-A-4",
        año: 2021,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "A.4",
        enunciado: `(2 puntos) Se construye una pila formada por un electrodo de zinc, sumergido en una disolución 1 M de
$\\text{Zn(NO}_3)_2$ y conectado por un puente salino con un electrodo de cobre, sumergido en una disolución 1 M de
$\\text{Cu(NO}_3)_2$.
a) Ajuste las reacciones que tienen lugar en el ánodo y en el cátodo, y la reacción iónica global.
b) Escriba la notación de la pila y detalle para qué sirve el puente salino.
c) Indique en qué sentido circula la corriente en el conductor eléctrico.
d) Indique en qué electrodo se deposita cobre.
Datos. $E^0$(V): $\\text{Zn}^{2+}$/Zn $= -0{,}76$; $\\text{Cu}^{2+}$/Cu $= 0{,}34$.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2021.pdf"
      },
      {
        id: "q-2021-A-5",
        año: 2021,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "A.5",
        enunciado: `(2 puntos) Conteste las siguientes cuestiones:
a) Nombre los siguientes compuestos: $\\text{CH}_3-\\text{CH}(\\text{CH}_3)-\\text{C}(\\text{CH}_3)=\\text{CH}-\\text{CH}_2-\\text{CH}_2-\\text{CH}_3$;
$\\text{CH}_3-\\text{CHOH}-\\text{CH}(\\text{C}_2\\text{H}_5)-\\text{CH}_2-\\text{OH}$.
b) Formule la reacción, indique de qué tipo es, y nombre los compuestos orgánicos implicados:
propan-2-ol + $\\text{H}_2\\text{SO}_4$/calor $\\rightarrow$
c) Formule la reacción, indique de qué tipo es, y nombre los compuestos orgánicos implicados:
pent-2-eno + $\\text{H}_2\\text{O}/\\text{H}^+$ $\\rightarrow$
d) Formule la reacción, indique de qué tipo es, y nombre los compuestos orgánicos implicados:
3-metilpentan-1-ol + $\\text{HBr}$ $\\rightarrow$`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2021.pdf"
      },
      {
        id: "q-2021-B-1",
        año: 2021,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "B.1",
        enunciado: `(2 puntos) Responda las siguientes cuestiones:
a) Justifique si la molécula $\\text{NH}_3$ es polar utilizando la teoría de hibridación y su geometría.
b) Explique si los siguientes compuestos presentan enlace de hidrógeno: $\\text{H}_2\\text{O}$, $\\text{CH}_4$ y $\\text{HCl}$.
c) Justifique por qué el bromuro de sodio tiene un punto de fusión menor que el cloruro de sodio.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2021.pdf"
      },
      {
        id: "q-2021-B-2",
        año: 2021,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "B.2",
        enunciado: `(2 puntos) La ecuación de velocidad de la reacción $\\text{CO}(g) + \\text{NO}_2(g) \\rightarrow \\text{CO}_2(g) + \\text{NO}(g)$ es $v = k[\\text{NO}_2]^2$.
Justifique si son verdaderas o falsas las siguientes afirmaciones:
a) La velocidad de desaparición de ambos reactivos es la misma.
b) Las unidades de la constante de velocidad son: $\\text{mol}\\cdot\\text{L}\\cdot\\text{s}^{-1}$.
c) La velocidad de la reacción aumenta al duplicar la concentración inicial de CO(g).
d) En esta reacción en particular, la constante de velocidad no depende de la temperatura, porque la
reacción se produce en fase gaseosa.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2021.pdf"
      },
      {
        id: "q-2021-B-3",
        año: 2021,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "B.3",
        enunciado: `(2 puntos) Se puede obtener cloro gaseoso en la oxidación del ácido clorhídrico con ácido nítrico,
produciéndose también dióxido de nitrógeno y agua.
a) Indique cuál es la especie oxidante y cuál la reductora. Ajuste la reacción iónica global y la reacción
molecular por el método del ion-electrón.
b) Sabiendo que el rendimiento de la reacción es del 82%, calcule el volumen de cloro que se obtiene a
25 °C y 1,0 atm, cuando reaccionan 600 mL de una disolución 2,00 M de $\\text{HCl}$ con ácido nítrico en exceso.
Dato. $R = 0{,}082\\ \\text{atm}\\cdot\\text{L}\\cdot\\text{mol}^{-1}\\cdot\\text{K}^{-1}$.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2021.pdf"
      },
      {
        id: "q-2021-B-4",
        año: 2021,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "B.4",
        enunciado: `(2 puntos) En un reactor de 25,00 L a 440 ºC, se introducen 5,00 mol de hidrógeno y 2,00 mol de
nitrógeno, obteniendo 50,0 g de $\\text{NH}_3$ (g) cuando se alcanza el equilibrio 3 $\\text{H}_2$ (g) + $\\text{N}_2$ (g) $\\rightleftharpoons$ 2 $\\text{NH}_3$ (g).
a) Exprese el número de moles en equilibrio de los reactivos y del producto, en función de x (cambio de
concentración en mol), y calcule sus valores.
b) Obtenga $K_c$ y $K_p$.
c) Razone cómo se modifica el equilibrio si la reacción transcurre a la misma temperatura, pero aumenta la
presión total.
Datos. R = 0,082 atm·L·mol$^{-1}$·K$^{-1}$. Masas atómicas: H = 1,0; N = 14,0.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2021.pdf"
      },
      {
        id: "q-2021-B-5",
        año: 2021,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "B.5",
        enunciado: `(2 puntos) La fórmula molecular $\\text{C}_4\\text{H}_8\\text{O}_2$, ¿a qué sustancia o sustancias de las propuestas a continuación
corresponde? Justifique la respuesta escribiendo en cada caso su fórmula semidesarrollada y molecular.
a) Ácido butanoico.
b) Butanodial.
c) Propanoato de metilo.
d) Ácido metilpropanoico.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2021.pdf"
      }
    ]
  },
  {
    id: 2022,
    año: 2022,
    tipo: "Ordinaria",
    asignatura: "Química",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "q-2022-A-1",
        año: 2022,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "A.1",
        enunciado: `Considere los elementos: A (Z = 9) y B (Z = 13).
a) (0,5 puntos) Escriba la configuración electrónica de cada uno.
b) (0,5 puntos) Identifique el nombre, símbolo, grupo y periodo de cada elemento.
c) (0,5 puntos) Justifique cuál es el elemento de menor energía de ionización.
d) (0,5 puntos) Formule el compuesto binario formado por los elementos A y B, nómbrelo e indique el tipo
de enlace que presenta.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2022.pdf"
      },
      {
        id: "q-2022-A-2",
        año: 2022,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "A.2",
        enunciado: `Responda las siguientes cuestiones:
a) (1 punto) Nombre los siguientes compuestos, escriba su fórmula molecular, indique cuáles son isómeros
entre sí y especifique el tipo de isomería que presentan: a1) $\\text{CH}_3-\\text{CO}-\\text{CH}_2-\\text{CH}(\\text{CH}_3)_2$;
a2) $\\text{CH}_3-\\text{CHOH}-\\text{CH}(\\text{CH}_3)-\\text{CH}_2-\\text{CH}_3$; a3) $\\text{CH}_3-\\text{C}(\\text{CH}_3)_2-\\text{CH}_2-\\text{CHO}$; a4) $\\text{CH}_3-(\\text{CH}_2)_2-\\text{O}-(\\text{CH}_2)_2-\\text{CH}_3$.
b) (1 punto) Se quiere sintetizar 3-bromohexano, como único producto, a partir de un alqueno. Formule la
correspondiente reacción, indique de qué tipo es, nombre la regla que sigue y nombre el alqueno de
partida.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2022.pdf"
      },
      {
        id: "q-2022-A-3",
        año: 2022,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "A.3",
        enunciado: `Sobre una disolución que contiene iones $\\text{Hg}^{2+}$ 0,010 M y $\\text{Ag}^+$ 0,020 M se va añadiendo gota a gota otra
disolución con iones $\\text{IO}_3^-$. Considere que la adición de las gotas de $\\text{IO}_3^-$ no produce cambio de volumen.
a) (0,5 puntos) Escriba los equilibrios de solubilidad ajustados de las dos sales de $\\text{IO}_3^-$, detallando el estado
de todas las especies.
b) (1 punto) Escriba la expresión de $K_s$ en función de la solubilidad y calcule la solubilidad molar de $\\text{Hg(IO}_3)_2$
y $\\text{AgIO}_3$.
c) (0,5 puntos) ¿Cómo varía la solubilidad de los yodatos de mercurio y plata al añadir un exceso de yodato
a la disolución?
Datos. $K_s(\\text{Hg(IO}_3)_2) = 2{,}0 \\cdot 10^{-19}$; $K_s(\\text{AgIO}_3) = 3{,}0 \\cdot 10^{-8}$.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2022.pdf"
      },
      {
        id: "q-2022-A-4",
        año: 2022,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "A.4",
        enunciado: `La reacción $\\text{CHCl}_3(g) + \\text{Cl}_2(g) \\rightarrow \\text{CCl}_4(g) + \\text{HCl}(g)$ es de primer orden con respecto a $\\text{CHCl}_3$ y de orden
$1/2$ con respecto a $\\text{Cl}_2$.
a) (0,5 puntos) Escriba la ecuación de velocidad y determine el orden total de la reacción.
b) (0,5 puntos) Deduzca las unidades de la constante de velocidad.
c) (0,5 puntos) Justifique cómo afecta a la velocidad de reacción un aumento de volumen a temperatura
constante.
d) (0,5 puntos) Justifique cómo afecta a la velocidad de reacción un aumento de temperatura.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2022.pdf"
      },
      {
        id: "q-2022-A-5",
        año: 2022,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "A.5",
        enunciado: `El clorato de potasio, en medio ácido, reacciona con aluminio formándose tricloruro de aluminio, cloro
molecular, cloruro de potasio y agua.
a) (0,5 puntos) Formule y ajuste las semirreacciones de oxidación y reducción que tienen lugar.
b) (0,75 puntos) Ajuste las reacciones iónica y molecular por el método del ion-electrón.
c) (0,75 puntos) Calcule el volumen de una disolución de clorato de potasio de concentración $1{,}67\\ \\text{g}\\cdot\\text{L}^{-1}$ que
se necesita para oxidar 0,54 g de aluminio.
Datos. Masas atómicas (u): O = 16,0; Al = 27,0; Cl = 35,5; K = 39,1.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2022.pdf"
      },
      {
        id: "q-2022-B-1",
        año: 2022,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "B.1",
        enunciado: "Dadas las siguientes especies: Fe, BH3, CHCl3 y MgF2.\na) (0,5 puntos) Justifique qué tipo de enlace presenta cada una de ellas.\nb) (0,5 puntos) Indique cuál/es conducirán la corriente en estado sólido y cuál/es lo harán en estado fundido.\nc) (1 punto) Para las especies covalentes: indique y represente la geometría molecular, diga la hibridación\ndel átomo central, y justifique su polaridad.",
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2022.pdf"
      },
      {
        id: "q-2022-B-2",
        año: 2022,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "B.2",
        enunciado: `Complete y ajuste las siguientes reacciones, formule y nombre todos los compuestos orgánicos que
intervienen e indique el tipo de reacción:
a) (0,5 puntos) Propano + oxígeno $\\rightarrow$
b) (0,5 puntos) Ácido butanoico + propan-1-amina $\\rightarrow$
c) (0,5 puntos) $n\\ \\text{CH}_2=\\text{CH}_2$ + catalizador $\\rightarrow$
d) (0,5 puntos) $\\text{CH}_3-\\text{CHOH}-\\text{CH}_3 + \\text{H}_2\\text{SO}_4$ (concentrado) $\\rightarrow$`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2022.pdf"
      },
      {
        id: "q-2022-B-3",
        año: 2022,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "B.3",
        enunciado: `El compuesto $\\text{NOBr}(g)$ descompone según la reacción:
$2\\ \\text{NOBr}(g) \\rightleftharpoons 2\\ \\text{NO}(g) + \\text{Br}_2(g)$ ($\\Delta H = +16{,}3\\ \\text{kJ}\\cdot\\text{mol}^{-1}$)
En un matraz de 1,0 L se introducen 2,0 mol de NOBr. Cuando se alcanza el equilibrio a 25 ºC, se observa
que se han formado 0,050 mol de $\\text{Br}_2$. Calcule:
a) (0,5 puntos) Las concentraciones de cada especie en el equilibrio.
b) (0,5 puntos) $K_c$ y $K_p$.
c) (0,5 puntos) La presión total.
d) (0,5 puntos) Justifique dos formas de favorecer la descomposición del NOBr.
Dato. $R = 0{,}082\\ \\text{atm}\\cdot\\text{L}\\cdot\\text{mol}^{-1}\\cdot\\text{K}^{-1}$.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2022.pdf"
      },
      {
        id: "q-2022-B-4",
        año: 2022,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "B.4",
        enunciado: `El agua de una piscina a la que se ha añadido ácido hipocloroso tiene un pH = 7,5.
a) (1 punto) Escriba la reacción y calcule la concentración inicial del ácido hipocloroso en la piscina.
b) (1 punto) Si observamos que el pH de la piscina ha aumentado hasta 7,8, justifique con las reacciones
adecuadas y sin hacer cálculos, cuál de los siguientes reactivos debemos añadir para restablecer el pH
a 7,5: NaOH; HCl; NaCl.
Dato. $K_a(\\text{ácido hipocloroso}) = 3{,}2 \\cdot 10^{-8}$.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2022.pdf"
      },
      {
        id: "q-2022-B-5",
        año: 2022,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "B.5",
        enunciado: `Responda las siguientes cuestiones:
a) (1 punto) Dibuje el esquema de una pila utilizando como electrodos una barra de cadmio y otra de plata.
Identifique todos los elementos que la forman, e indique el sentido del movimiento de los electrones.
b) (1 punto) Escriba las reacciones que tienen lugar en el cátodo y en el ánodo, y calcule el potencial de la
pila.
Datos. $E^0$(V): $\\text{Cd}^{2+}$/Cd $= -0{,}40$; $\\text{Ag}^+$/Ag $= 0{,}80$.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2022.pdf"
      }
    ]
  },
  {
    id: 2023,
    año: 2023,
    tipo: "Ordinaria",
    asignatura: "Química",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "q-2023-A-1",
        año: 2023,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "A.1",
        enunciado: `Los iones $\\text{X}^{2+}$ e $\\text{Y}^-$ presentan las siguientes configuraciones electrónicas: $\\text{X}^{2+}$ ($1s^22s^22p^63s^23p^6$) e $\\text{Y}^-$
($1s^22s^22p^63s^23p^6$). Responda a las siguientes cuestiones.
a) (0,5 puntos) Justifique el número atómico de los elementos X e Y, e indique su posición (periodo y grupo) en
el sistema periódico.
b) (0,5 puntos) Razone qué elemento, X o Y, tiene mayor radio atómico.
c) (0,5 puntos) Indique qué tipo de enlace presenta a temperatura ambiente cada una de las sustancias X e Y
por separado.
d) (0,5 puntos) Justifique la estequiometría y el tipo de enlace del compuesto que forma el elemento X con
el elemento Y.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2023.pdf"
      },
      {
        id: "q-2023-A-2",
        año: 2023,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "A.2",
        enunciado: `A, B, C, D y E son compuestos orgánicos que reaccionan de acuerdo a los siguientes procesos:
i) $\\text{A} + \\text{HBr} \\rightarrow$ 2-bromopropano; ii) $\\text{B} + \\text{C} \\rightarrow$ propanoato de etilo + agua;
iii) $\\text{D} + \\text{oxidante} \\rightarrow$ propanona; iv) $\\text{E} + \\text{H}_2\\text{SO}_4$ (concentrado) $\\rightarrow$ but-2-eno.
a) (0,5 puntos) Escriba las fórmulas semidesarrolladas de los productos orgánicos de cada una de las cuatro
reacciones del enunciado.
b) (0,5 puntos) Identifique, con sus fórmulas semidesarrolladas y su nombre, los compuestos A, B, C, D y E.
c) (0,5 puntos) Indique de qué tipo es cada reacción del enunciado.
d) (0,5 puntos) Diga si en alguna de estas reacciones se puede obtener más de un producto. Si es así,
escriba sus fórmulas semidesarrolladas y nombre dichos compuestos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2023.pdf"
      },
      {
        id: "q-2023-A-3",
        año: 2023,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "A.3",
        enunciado: `En un laboratorio se tiene un matraz A, que contiene 15 mL de una disolución acuosa de ácido clorhídrico
0,050 M, y otro matraz B, que contiene 15 mL de una disolución acuosa de ácido acético 0,050 M.
a) (1 punto) Determine el pH de cada disolución por separado.
b) (1 punto) Calcule la cantidad de agua que se debe añadir a la disolución más ácida para que el pH de las
dos disoluciones sea el mismo. Suponga volúmenes aditivos.
Dato. $K_a(\\text{ácido acético}) = 1{,}8 \\cdot 10^{-5}$.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2023.pdf"
      },
      {
        id: "q-2023-A-4",
        año: 2023,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "A.4",
        enunciado: "El pH de una disolución saturada de Ca(OH)2 en agua pura, a una cierta temperatura, es 9,36.\na) (0,5 puntos) Escriba el equilibrio de solubilidad ajustado, detallando el estado de todas las especies.\nb) (1 punto) Calcule la solubilidad molar del hidróxido de calcio y su producto de solubilidad.\nc) (0,5 puntos) Si sobre la disolución saturada de Ca(OH)2 en agua pura se adiciona nitrato de calcio, razone\nel efecto que produce sobre el equilibrio, la solubilidad y la cantidad de Ca(OH)2.",
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2023.pdf"
      },
      {
        id: "q-2023-A-5",
        año: 2023,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "A.5",
        enunciado: `Para depositar totalmente el cobre en una célula electrolítica que contiene 800 mL de una disolución
acuosa de sulfato de cobre(II), se hace pasar una corriente de 1,50 A durante 3 horas.
a) (0,5 puntos) Escriba la reacción que tiene lugar en el cátodo.
b) (0,75 puntos) Calcule los gramos de cobre depositados.
c) (0,75 puntos) Una vez depositado todo el cobre, calcule el pH de la disolución, sabiendo que la reacción
que tiene lugar es: $2\\ \\text{Cu}^{2+}(ac) + 2\\ \\text{H}_2\\text{O}(l) \\rightarrow 2\\ \\text{Cu}(s) + \\text{O}_2(g) + 4\\ \\text{H}^+$. Suponga que al finalizar la electrólisis
el volumen de la disolución se ha mantenido constante y que en el $\\text{H}_2\\text{SO}_4$ se disocian completamente los
dos protones.
Datos. $F = 96485\\ \\text{C}\\cdot\\text{mol}^{-1}$. Masa atómica (u): Cu = 63,5.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2023.pdf"
      },
      {
        id: "q-2023-B-1",
        año: 2023,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "B.1",
        enunciado: "Considere las sustancias Cl2, HBr, Fe y KI.\na) (0,5 puntos) Indique el tipo de enlace que presenta cada una de ellas.\nb) (0,5 puntos) Justifique si conducen la corriente eléctrica a temperatura ambiente.\nc) (0,5 puntos) Escriba las estructuras de Lewis de aquellas que sean covalentes.\nd) (0,5 puntos) Justifique si cada una de ellas es soluble en agua o no.",
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2023.pdf"
      },
      {
        id: "q-2023-B-2",
        año: 2023,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "B.2",
        enunciado: `Considere los pares de compuestos siguientes: (i) etanoato de etilo y ácido butanoico; (ii) pent-1-eno y
ciclopentano; (iii) but-1-eno y but-2-ino.
a) (1 punto) Escriba las fórmulas semidesarrolladas de los seis compuestos.
b) (0,5 puntos) Razone si alguno de los pares corresponde a dos compuestos isómeros. En caso afirmativo,
indique de qué tipo de isómeros se trata.
c) (0,5 puntos) Indique si cada uno de los compuestos del par (ii) reaccionará con agua en medio ácido. En
caso afirmativo, formule y nombre el producto mayoritario de la reacción.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2023.pdf"
      },
      {
        id: "q-2023-B-3",
        año: 2023,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "B.3",
        enunciado: `Se preparan disoluciones acuosas de igual concentración de las especies: ácido nítrico, cloruro de potasio,
cloruro de amonio e hidróxido de potasio. Responda razonadamente a las siguientes cuestiones:
a) (0,5 puntos) ¿Qué disolución tiene mayor pH?
b) (0,5 puntos) ¿Qué disolución no cambia su pH al diluirla con agua?
c) (0,5 puntos) ¿Qué reacción se producirá al mezclar volúmenes iguales de las disoluciones de cloruro de
amonio y de hidróxido de potasio?
d) (0,5 puntos) El pH de la disolución formada en el apartado c), ¿será ácido, básico o neutro?
Dato. $K_a(\\text{NH}_4^+) = 6{,}7 \\cdot 10^{-10}$.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2023.pdf"
      },
      {
        id: "q-2023-B-4",
        año: 2023,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "B.4",
        enunciado: `En un matraz de 3,00 L se introducen 4,38 g de $\\text{C}_2\\text{H}_6$. Se calienta a 627 ºC y se da el proceso:
$\\text{C}_2\\text{H}_6$ (g) $\\rightleftharpoons$ $\\text{C}_2\\text{H}_4$ (g) + $\\text{H}_2$ (g), cuya $K_p$ vale 0,050. Calcule:
a) (0,5 puntos) La presión inicial de $\\text{C}_2\\text{H}_6$.
b) (0,5 puntos) El valor de $K_c$.
c) (1 punto) Las concentraciones de todos los gases en el equilibrio.
Datos. R = 0,082 atm·L·mol$^{-1}$·K$^{-1}$. Masas atómicas (u): H = 1,0; C = 12,0.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2023.pdf"
      },
      {
        id: "q-2023-B-5",
        año: 2023,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "B.5",
        enunciado: `Una muestra que contiene sulfuro de calcio se trata con ácido nítrico concentrado hasta reacción completa,
según: $\\text{CaS} + \\text{HNO}_3 \\rightarrow \\text{NO} + \\text{SO}_2 + \\text{Ca(NO}_3)_2 + \\text{H}_2\\text{O}$
a) (1 punto) Escriba y ajuste por el método del ion electrón las reacciones de oxidación, reducción, iónica y
molecular.
b) (1 punto) Sabiendo que al tratar 35 g de la muestra con exceso de ácido se obtienen 20,3 L de NO,
medidos a 30 ºC y 780 mm Hg, calcule la riqueza en CaS de la muestra.
Datos. Masas atómicas (u): S = 32; Ca = 40. $R = 0{,}082\\ \\text{atm}\\cdot\\text{L}\\cdot\\text{mol}^{-1}\\cdot\\text{K}^{-1}$.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2023.pdf"
      }
    ]
  },
  {
    id: 2024,
    año: 2024,
    tipo: "Ordinaria",
    asignatura: "Química",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "q-2024-A-1",
        año: 2024,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "A.1",
        enunciado: "Considere los elementos A, B y C, con números atómicos Z, Z+1 y Z+2, respectivamente. Sabiendo que\nB es el gas noble del segundo periodo, responda a las siguientes preguntas:\na) (0,5 puntos) Para cada elemento identifique su nombre y símbolo, escriba su configuración electrónica, e\nindique cuántos electrones desapareados tiene.\nb) (0,5 puntos) Justifique cuál es el ion más estable de los elementos A y C, indicando el tipo de ion y el\nsímbolo.\nc) (0,5 puntos) Razone cuál de ellos tiene el mayor radio iónico.\nd) (0,5 puntos) Formule y nombre el compuesto formado con los elementos A y C, y explique qué tipo de\nenlace presenta.",
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2024.pdf"
      },
      {
        id: "q-2024-A-2",
        año: 2024,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "A.2",
        enunciado: `Responda a las siguientes cuestiones:
a) (0,75 puntos) Indique cuál o cuáles de los siguientes compuestos presenta isomería geométrica. Escriba
la fórmula desarrollada y el nombre de cada isómero.
i) Propeno ii) But-1-eno iii) Pent-2-eno iv) Propen-2-ol
b) (0,75 puntos) Complete las siguientes reacciones, nombre todos los compuestos orgánicos, e indique el
tipo de reacción.
i) Hex-1-eno + $\\text{HCl} \\rightarrow$ ii) Propan-2-ol + oxidante $\\rightarrow$
c) (0,5 puntos) Nombre los siguientes compuestos e indique cuál es el grupo característico principal.
i) $\\text{CH}_3-\\text{CH}=\\text{CH}-\\text{CHO}$ ii) $\\text{H}-\\text{COO}-\\text{CH}(\\text{CH}_3)-\\text{CH}_2-\\text{CH}_3$`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2024.pdf"
      },
      {
        id: "q-2024-A-3",
        año: 2024,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "A.3",
        enunciado: `La siguiente reacción es de orden 2 respecto al monóxido de carbono y de orden 1 respecto al cloro:
$2\\ \\text{NO}(g) + \\text{Cl}_2(g) \\rightarrow 2\\ \\text{NOCl}(g)$
a) (0,5 puntos) Escriba la ecuación de velocidad para dicha reacción, y deduzca las unidades de la constante
de velocidad si las concentraciones se miden en mol·L$^{-1}$ y el tiempo en s.
b) (0,5 puntos) A partir de la ecuación de Arrhenius, explique cómo afecta a la velocidad de la reacción un
aumento de temperatura.
c) (0,5 puntos) Determine la variación de energía de Gibbs estándar de la reacción a 25 ºC.
d) (0,5 puntos) Justifique si la reacción es espontánea o no a dicha temperatura.
Datos. A 25 ºC, $\\Delta H_f^\\circ$ (kJ·mol$^{-1}$): NOCl = 51,7; NO = 90,3; $S^\\circ$ (J·mol$^{-1}$·K$^{-1}$): NO = 210,6; $\\text{Cl}_2$ = 223,0; NOCl = 261,7.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2024.pdf"
      },
      {
        id: "q-2024-A-4",
        año: 2024,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "A.4",
        enunciado: `Se han preparado disoluciones acuosas 0,20 M de los siguientes compuestos a 25 ºC: hidróxido de
sodio, ácido propanoico, cloruro de amonio, cloruro de potasio y etanoato de sodio.
a) (1 punto) Calcule el pH de las disoluciones de hidróxido de sodio y ácido propanoico.
b) (1 punto) Ordene las disoluciones de cloruro de amonio, cloruro de potasio y etanoato de sodio de mayor
a menor carácter ácido. Justifique la respuesta formulando las reacciones de ionización de cada especie, y
las de hidrólisis del ion que lo requiera.
Datos. $pK_a$(ácido propanoico) = 4,9; $pK_a$(ácido acético) = 4,75; $pK_b$(amoníaco) = 4,75.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2024.pdf"
      },
      {
        id: "q-2024-A-5",
        año: 2024,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "A.5",
        enunciado: "El dicromato de potasio reacciona con el cloruro de hierro(II) en disolución de ácido clorhídrico,\nobteniéndose como productos: cloruro de cromo(III), cloruro de hierro(III), cloruro de potasio y agua.\na) (1 punto) Formule y ajuste por el método del ion electrón las semirreacciones de oxidación y reducción.\nIndique las especies oxidante y reductora. Ajuste la reacción iónica y la molecular.\nb) (1 punto) Determine qué masa de dicromato de potasio se necesitará para que reaccione completamente\ncon 50 mL de disolución de cloruro de hierro(II) 0,60 M.\nDatos. Masas atómicas (u): O = 16,0; K = 39,1; Cr = 52,0.",
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2024.pdf"
      },
      {
        id: "q-2024-B-1",
        año: 2024,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "B.1",
        enunciado: `Considere las moléculas: $\\text{PF}_3$ y $\\text{OCS}$, y responda a las siguientes cuestiones:
a) (0,75 puntos) Represente sus estructuras de Lewis e indique cuántos pares de electrones no enlazantes
tiene el átomo central.
b) (0,75 puntos) Indique y represente sus geometrías moleculares de acuerdo con la teoría RPECV, y escriba
la hibridación del átomo central.
c) (0,5 puntos) Justifique la polaridad de cada una.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2024.pdf"
      },
      {
        id: "q-2024-B-2",
        año: 2024,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "B.2",
        enunciado: `Responda a las siguientes preguntas:
a) (0,75 puntos) Escriba la fórmula semidesarrollada de los siguientes compuestos:
i) Ácido etanodioico ii) 2-metilbutanoato de propilo iii) 2,3,3-trimetilpentanal
b) (0,5 puntos) Formule una reacción de esterificación o condensación en la que se obtenga como producto
2-metilbutanoato de propilo, y nombre los reactivos.
c) (0,75 puntos) Formule y ajuste la reacción de combustión de etanol. A partir de ella, determine la riqueza
en etanol de una muestra de 17 g sabiendo que al reaccionar con exceso de oxígeno se obtienen 14,2 L
de dióxido de carbono medidos a 25 ºC y 785 mmHg.
Datos. $R = 0{,}082\\ \\text{atm}\\cdot\\text{L}\\cdot\\text{mol}^{-1}\\cdot\\text{K}^{-1}$. Masas atómicas (u): H = 1,0; C = 12,0; O = 16,0.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2024.pdf"
      },
      {
        id: "q-2024-B-3",
        año: 2024,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "B.3",
        enunciado: `Se introduce cierta cantidad de $\\text{COCl}_2$ en un recipiente de 1,0 L a 500 K y 0,94 atm, produciéndose su
descomposición según la reacción: $\\text{COCl}_2(g) \\rightleftharpoons \\text{CO}(g) + \\text{Cl}_2(g)$. Sabiendo que a dicha temperatura el valor
de $K_p$ es 0,19, calcule:
a) (0,5 puntos) La concentración molar inicial de $\\text{COCl}_2$.
b) (0,75 puntos) Las concentraciones molares de cada especie en el equilibrio.
c) (0,75 puntos) La presión parcial de cada uno de los gases en el equilibrio.
Dato. $R = 0{,}082\\ \\text{atm}\\cdot\\text{L}\\cdot\\text{mol}^{-1}\\cdot\\text{K}^{-1}$.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2024.pdf"
      },
      {
        id: "q-2024-B-4",
        año: 2024,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "B.4",
        enunciado: `Una muestra que está contaminada con $8{,}3\\cdot 10^{-4}\\ \\text{mg}\\cdot\\text{L}^{-1}$ de $\\text{Cd}^{2+}$, se hace reaccionar con un hidróxido
para eliminar parte del $\\text{Cd}^{2+}$, precipitándolo en forma de hidróxido de cadmio.
a) (0,75 puntos) Formule el equilibrio de solubilidad del hidróxido de cadmio en agua, detallando el estado
de agregación de cada especie. Escriba la expresión de la $K_s$.
b) (0,75 puntos) Calcule el pH mínimo necesario para que se inicie la precipitación del hidróxido.
c) (0,5 puntos) Tras la precipitación de cierta cantidad de hidróxido de cadmio, se añade cloruro de cadmio
a la disolución. Razone qué efecto tiene lugar y cómo afecta a la solubilidad del hidróxido.
Datos. $K_s(\\text{hidróxido de cadmio}) = 1{,}2\\cdot 10^{-14}$; Masa atómica (u): Cd = 112,4.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2024.pdf"
      },
      {
        id: "q-2024-B-5",
        año: 2024,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "B.5",
        enunciado: `Considere los potenciales de reducción que se indican y conteste razonadamente:
a) (1 punto) Combinando dos electrodos de los especificados, justifique cuales forman la pila con el potencial
más positivo. Escriba las reacciones que tienen lugar en el ánodo y en el cátodo, y calcule el potencial de
dicha pila.
b) (1 punto) Se dispone de dos recipientes con disoluciones de nitrato de plata y nitrato de manganeso(II) y
en cada uno se introduce una barra de hierro. ¿En cuál de ellos se formará una capa del otro metal sobre
la barra de hierro? Razone la respuesta.
Datos. $E°$(V): $\\text{Mn}^{2+}$/Mn $= -1{,}18$; $\\text{Fe}^{2+}$/Fe $= -0{,}44$; $\\text{Pb}^{2+}$/Pb $= -0{,}125$; $\\text{Ag}^+$/Ag $= 0{,}80$; $\\text{Au}^{3+}$/Au $= 1{,}52$.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2024.pdf"
      }
    ]
  },
  {
    id: 2025,
    año: 2025,
    tipo: "Ordinaria",
    asignatura: "Química",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "q-2025-A-1",
        año: 2025,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta1",
        label: "Termoquímica y cinética",
        numero: "1",
        enunciado: `Responda a las siguientes preguntas:
a) (0,75 puntos) El nitrato de amonio es un compuesto con muchas aplicaciones, cuya síntesis se realiza
por reacción directa de ácido nítrico y amoniaco. Escriba la reacción ajustada que se produce y, haciendo
uso de la Tabla, calcule $\\Delta G_r^\\circ$ a 300 K. Justifique la espontaneidad de la reacción.
b) (0,75 puntos) Una de las aplicaciones del nitrato de amonio es como explosivo, ya que en ciertas
condiciones (temperaturas por encima de 175 ºC) se produce de forma explosiva la reacción de
descomposición que da lugar a óxido de dinitrógeno y agua. Escriba la reacción ajustada y con los datos
de la Tabla calcule $\\Delta H_r^\\circ$ y $\\Delta S_r^\\circ$. Determine $\\Delta G_r^\\circ$ a 450 K para dicha reacción. Considere que $\\Delta H_r^\\circ$ y $\\Delta S_r^\\circ$
no cambian con la temperatura. Justifique si la reacción es exotérmica y espontánea.
c) (0,5 puntos) Escriba la ley de velocidad de la reacción de descomposición del nitrato de amonio
considerando que las unidades de su constante de velocidad son $\\text{s}^{-1}$, e indique el orden de la reacción.
d) (0,5 puntos) Explique cómo afecta a la velocidad de la reacción de descomposición del nitrato de amonio
una disminución de la temperatura.`,
        puntuacion: 2.5,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2025.pdf"
      },
      {
        id: "q-2025-A-2",
        año: 2025,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta2",
        label: "Estructura y enlace",
        numero: "2A",
        enunciado: `Dadas las configuraciones electrónicas de tres elementos en estado fundamental X: $[\\text{Ar}]4s^2$,
Y: $[\\text{Ne}]3s^23p^2$ y Z: $[\\text{He}]2s^22p^5$:
a) (0,5 puntos) Determine su posición en la tabla periódica (periodo y grupo).
b) (0,5 puntos) Indique nombre y símbolo de los elementos Y y Z.
c) (0,75 puntos) Justifique si es posible o no cada una de las siguientes combinaciones de números
cuánticos. En los casos afirmativos, razone si puede corresponder al electrón más externo de alguno de
los elementos del enunciado, indicando a cuál: $(n=2, l=1, m_l=0, m_s=+\\frac{1}{2})$; $(n=3, l=0, m_l=1, m_s=-\\frac{1}{2})$; $(n=3, l=2, m_l=0, m_s=+\\frac{1}{2})$; $(n=4, l=4, m_l=0, m_s=+\\frac{1}{2})$.
d) (0,75 puntos) Defina electronegatividad y justifique cuál de los elementos X, Y o Z es el más
electronegativo.`,
        puntuacion: 2.5,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2025.pdf"
      },
      {
        id: "q-2025-A-3",
        año: 2025,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta3",
        label: "Química orgánica",
        numero: "3A",
        enunciado: `Responda a las siguientes cuestiones:
a) (0,5 puntos) Nombre los siguientes compuestos, e indique a qué tipo de compuesto orgánico pertenecen:
i) $\\text{CH}_3-\\text{CH}(\\text{CH}_3)-\\text{CH}_2-\\text{C}(\\text{CH}_2\\text{CH}_3)(\\text{CH}_3)-\\text{CH}_2-\\text{CHO}$
ii) $\\text{CH}_2=\\text{CH}-\\text{O}-\\text{CH}_2-\\text{CH}_3$
b) (1 punto) Escriba la fórmula semidesarrollada de los siguientes compuestos, nombrando el/los grupo/s
funcional/es presente/s:
i) 3-etil-3,5-dimetilhexan-2-ol ii) ácido 4-etenilhept-2-enoico
iii) 4-etilhexan-3-ona iv) 3-etil-4-metilheptanamida
c) (1 punto) Formule y nombre dos isómeros de cadena no cíclicos del hexano.`,
        puntuacion: 2.5,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2025.pdf"
      },
      {
        id: "q-2025-A-4",
        año: 2025,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta4",
        label: "Equilibrio químico",
        numero: "4A",
        enunciado: `El ácido butanoico ($\\text{C}_3\\text{H}_7\\text{COOH}$) es un ácido monoprótico débil que se utiliza en muchas aplicaciones de
la vida cotidiana, por ejemplo para mantener la frescura del pan, como aromatizante en jarabes o para mejorar
la jugosidad de la carne, entre otras. A 25 ºC se preparan 250 mL de una disolución 0,250 M de este ácido
con pH = 2,72.
a) (1,5 puntos) Escriba ajustada la reacción de disociación en agua y calcule el porcentaje de disociación
del ácido y el $pK_a$.
b) (0,5 puntos) A 25 ºC se prepara una disolución de butanoato de sodio ($\\text{C}_3\\text{H}_7\\text{COONa}$). Razone, si su pH
será mayor, menor o igual que el de la disolución del enunciado.
c) (0,5 puntos) Justifique si se formaría una disolución reguladora al mezclar la disolución del enunciado con
una disolución de butanoato de sodio.`,
        puntuacion: 2.5,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2025.pdf"
      },
      {
        id: "q-2025-B-1",
        año: 2025,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta1",
        label: "Termoquímica y cinética",
        numero: "1",
        enunciado: `Responda a las siguientes preguntas:
a) (0,75 puntos) El nitrato de amonio es un compuesto con muchas aplicaciones, cuya síntesis se realiza
por reacción directa de ácido nítrico y amoniaco. Escriba la reacción ajustada que se produce y, haciendo
uso de la Tabla, calcule $\\Delta G_r^\\circ$ a 300 K. Justifique la espontaneidad de la reacción.
b) (0,75 puntos) Una de las aplicaciones del nitrato de amonio es como explosivo, ya que en ciertas
condiciones (temperaturas por encima de 175 ºC) se produce de forma explosiva la reacción de
descomposición que da lugar a óxido de dinitrógeno y agua. Escriba la reacción ajustada y con los datos
de la Tabla calcule $\\Delta H_r^\\circ$ y $\\Delta S_r^\\circ$. Determine $\\Delta G_r^\\circ$ a 450 K para dicha reacción. Considere que $\\Delta H_r^\\circ$ y $\\Delta S_r^\\circ$
no cambian con la temperatura. Justifique si la reacción es exotérmica y espontánea.
c) (0,5 puntos) Escriba la ley de velocidad de la reacción de descomposición del nitrato de amonio
considerando que las unidades de su constante de velocidad son $\\text{s}^{-1}$, e indique el orden de la reacción.
d) (0,5 puntos) Explique cómo afecta a la velocidad de la reacción de descomposición del nitrato de amonio
una disminución de la temperatura.`,
        puntuacion: 2.5,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2025.pdf"
      },
      {
        id: "q-2025-B-2",
        año: 2025,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta2",
        label: "Estructura y enlace",
        numero: "2B",
        enunciado: `Considere las siguientes moléculas, cuyas temperaturas de ebullición se indican entre paréntesis: $\\text{CH}_3\\text{OH}$
(338 K), $\\text{HCHO}$ (254 K) y $\\text{CH}_4$ (111 K):
a) (0,5 puntos) Dibuje la estructura de Lewis de los tres compuestos.
b) (0,75 puntos) Indique la hibridación del átomo de carbono y la geometría de cada una de las moléculas
del enunciado utilizando el modelo de RPECV.
c) (0,75 puntos) Justifique los diferentes valores de las temperaturas de ebullición indicadas.
d) (0,5 puntos) ¿Cuál/es es/son soluble/s en agua? Justifique la respuesta.`,
        puntuacion: 2.5,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2025.pdf"
      },
      {
        id: "q-2025-B-3",
        año: 2025,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta3",
        label: "Química orgánica",
        numero: "3B",
        enunciado: `Responda a las siguientes cuestiones:
a) (1 punto) Justifique si para el compuesto $\\text{CH}_3-\\text{CH}_2-\\text{CHOH}-\\text{CH}_3$ son verdaderas o falsas las siguientes
afirmaciones. Escriba las reacciones correspondientes si las hubiere, y nombre los productos:
i) Al reaccionar con $\\text{H}_2\\text{SO}_4$ concentrado da prioritariamente dos compuestos isómeros geométricos.
ii) Puede adicionar agua para dar butano.
b) (0,5 puntos) Formule, en cada caso, el compuesto que presente las siguientes condiciones:
i) Un aldehído de tres carbonos que contenga átomos con hibridación sp.
ii) Una amina secundaria de tres átomos de carbono, con el átomo de nitrógeno unido a un carbono con
hibridación sp3 y a otro carbono con hibridación sp2.
c) (1 punto) Dados los compuestos $\\text{CH}_3-\\text{CHOH}-\\text{CH}_3$ y $\\text{CH}_3-\\text{CH}_2-\\text{CH}_3$:
i) Justifique cuál tiene mayor temperatura de fusión.
ii) Formule la reacción de obtención de $\\text{CH}_3-\\text{CHOH}-\\text{CH}_3$ a partir del alqueno correspondiente, indicando
el medio en el que transcurre (ácido, básico), el tipo de reacción y si se trata del producto minoritario
y la regla que sigue.`,
        puntuacion: 2.5,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2025.pdf"
      },
      {
        id: "q-2025-B-4",
        año: 2025,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta4",
        label: "Equilibrio químico",
        numero: "4B",
        enunciado: `En un recipiente de 2,50 L se introducen 0,0200 mol de $\\text{N}_2$ y 0,0300 mol de $\\text{H}_2$. Se eleva la temperatura
hasta 400 ºC, y la reacción $\\text{N}_2$ (g) + 3 $\\text{H}_2$ (g) $\\rightleftharpoons$ 2 $\\text{NH}_3$ (g) alcanza el equilibrio, obteniéndose $\\Delta H_r < 0$ y una
concentración de $\\text{NH}_3$ (g) de 0,00375 mol·L$^{-1}$.
a) (1 punto) Calcule las presiones parciales de cada sustancia en el equilibrio y la presión total.
b) (0,5 puntos) Obtenga $K_p$ y $K_c$.
c) (0,5 puntos) Justifique si el rendimiento del proceso aumenta realizándolo a menor temperatura.
d) (0,5 puntos) Razone cómo varía la concentración de $\\text{N}_2$ cuando se añade al equilibrio un gas inerte como
el Ar a volumen y temperatura constantes.
Dato. R = 0,0820 atm·L·mol$^{-1}$·K$^{-1}$.`,
        puntuacion: 2.5,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2025.pdf"
      }
    ]
  }
]
