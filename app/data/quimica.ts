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
        enunciado: `![Tabla de datos termodinámicos a 300K](/quimica-imgs/2025-ordinaria/pregunta-1-tabla-termodinamica.png)

Responda a las siguientes preguntas:
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
        enunciado: `![Tabla de datos termodinámicos a 300K](/quimica-imgs/2025-ordinaria/pregunta-1-tabla-termodinamica.png)

Responda a las siguientes preguntas:
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
  },
  {
    id: 20181,
    año: 2018,
    tipo: "Extraordinaria",
    asignatura: "Química",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "q-2018-extra-A-1",
        año: 2018,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "A.1",
        enunciado: `Responda justificadamente a las siguientes preguntas:
a) Para los átomos A (Z = 7) y B (Z = 26) escriba la configuración electrónica, indique el número de
electrones desapareados y los orbitales en los que se encuentran.
b) Los iones K+ y Cl− tienen aproximadamente el mismo valor de sus radios iónicos, alrededor de
0,134 nm. Justifique si sus radios atómicos serán mayores, menores o iguales a 0,134 nm.
c) Calcule la menor longitud de onda en nm de la radiación absorbida del espectro de hidrógeno.
Datos. RH = 1,097·107 m−1.
Puntuación máxima por apartado: 0,75 puntos apartados a) y c); 0,5 puntos apartado b).`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2018-extraordinaria.pdf"
      },
      {
        id: "q-2018-extra-A-2",
        año: 2018,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "A.2",
        enunciado: `Razone si el pH que resulta al mezclar las disoluciones indicadas es ácido, básico o neutro.
a) 50 mL de ácido acético 0,1 M + 50 mL de hidróxido de sodio 0,1 M.
b) 50 mL de ácido clorhídrico 0,1 M + 100 mL de hidróxido de sodio 0,05 M.
c) 50 mL de ácido clorhídrico 0,1 M + 50 mL de hidróxido de sodio 0,05 M.
d) 50 mL de ácido clorhídrico 0,1 M + 50 mL de amoniaco 0,1 M.
Datos: pKa (ácido acético) = 5; pKb (amoniaco) = 5.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2018-extraordinaria.pdf"
      },
      {
        id: "q-2018-extra-A-3",
        año: 2018,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "A.3",
        enunciado: `Escriba las reacciones propuestas, indicando de qué tipo son y nombrando los productos
mayoritarios obtenidos:
a) Butan-2-ol + ácido sulfúrico/calor.
b) Propan-2-ol + permanganato de potasio (oxidante).
c) Propan-1-ol + ácido etanoico.
d) Cloroetano + hidróxido de sodio.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2018-extraordinaria.pdf"
      },
      {
        id: "q-2018-extra-A-4",
        año: 2018,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "A.4",
        enunciado: `En un reactor de 20 L, una mezcla gaseosa constituida inicialmente por 7 mol de hidrógeno y
5 mol de yodo, se calienta a 350 ºC. En el equilibrio, H2(g) + I2(g) ⇌ 2 HI(g), hay 8,6 mol de yoduro de
hidrógeno gaseoso. La entalpía de la reacción es ΔH = −10,83 kJ.
a) Indique cómo se modifica el equilibrio al aumentar la temperatura.
b) Calcule la constante de equilibrio Kc.
c) Calcule la presión parcial de hidrógeno en el equilibrio.
Datos: R = 0,082 atm·L·mol−1·K−1
Puntuación máxima por apartado: 0,5 puntos apartado a); 0,75 puntos apartados b) y c).`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2018-extraordinaria.pdf"
      },
      {
        id: "q-2018-extra-A-5",
        año: 2018,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "A.5",
        enunciado: `Una muestra de dióxido de manganeso reacciona con ácido clorhídrico comercial de
densidad 1,18 kg·L−1 y una riqueza del 38% en masa, obteniéndose cloro gaseoso, cloruro de manganeso(II)
y agua.
a) Escriba y ajuste las semirreacciones de oxidación y reducción.
b) Escriba la reacción molecular global ajustada por el método del ion electrón.
c) Calcule la masa de dióxido de manganeso de la muestra si se obtienen 7,3 L de gas cloro, medidos a
1 atm y 20 ºC.
d) Calcule el volumen de ácido clorhídrico comercial que se consume en la reacción.
Datos. R = 0,082 atm·L·mol−1·K−1; Masas atómicas: H = 1,0; O = 16,0; Cl = 35,5; Mn = 55,0.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2018-extraordinaria.pdf"
      },
      {
        id: "q-2018-extra-B-1",
        año: 2018,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "B.1",
        enunciado: `Para las moléculas NH3 y CO2:
a) Justifique el número de pares de electrones enlazantes y los pares libres del átomo central.
b) Indique su geometría y la hibridación que presenta el átomo central.
c) Justifique las fuerzas intermoleculares que presentan.
d) Explique su polaridad.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2018-extraordinaria.pdf"
      },
      {
        id: "q-2018-extra-B-2",
        año: 2018,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "B.2",
        enunciado: `Se tiene un compuesto A de fórmula C3H6O.
a) Sabiendo que A por reducción da lugar a un alcohol primario B, formule y nombre ambos compuestos.
b) Escriba la reacción de A con un oxidante y nombre el producto obtenido C.
c) Escriba la reacción que se produce entre B y C y nombre el producto obtenido.
d) Formule y nombre un isómero de función de A.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2018-extraordinaria.pdf"
      },
      {
        id: "q-2018-extra-B-3",
        año: 2018,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "B.3",
        enunciado: `Se tiene una disolución acuosa de nitrato de plata y nitrato de bario sobre la que se va
añadiendo otra que contiene iones sulfato.
a) Formule los equilibrios de precipitación resultantes.
b) Determine la solubilidad de ambos sulfatos en M y g·L−1.
c) Justifique cómo afecta a la solubilidad del Ag2SO4 la adición de sulfato de potasio.
Datos. Ks: Ag2SO4 = 1,6·10−5; BaSO4 = 1,1·10−10. Masas atómicas: O = 16; S = 32; Ag = 108; Ba = 137.
Puntuación máxima por apartado: 0,5 puntos apartado a) y c); 1 punto apartado b).`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2018-extraordinaria.pdf"
      },
      {
        id: "q-2018-extra-B-4",
        año: 2018,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "B.4",
        enunciado: `A partir de los potenciales de reducción estándar que se adjuntan:
a) Explique detalladamente cómo construir una pila Daniell.
b) Escriba las semirreacciones que tienen lugar en el ánodo y en el cátodo de la pila Daniell e indique el
sentido del movimiento de los iones metálicos en sus respectivas disoluciones.
c) Razone si en un recipiente de Pb se produce alguna reacción química cuando se adiciona una
disolución de Cu2+.
Datos. E0 (V): Pb2+/Pb = 0,13; Cu2+/Cu = 0,34; Zn2+/Zn = − 0,76.
Puntuación máxima por apartado: 0,75 puntos apartados a) y c); 0,5 puntos apartado b).`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2018-extraordinaria.pdf"
      },
      {
        id: "q-2018-extra-B-5",
        año: 2018,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "B.5",
        enunciado: `Se disuelven 0,675 gramos de ácido cianhídrico en agua hasta completar 500 mL de
disolución.
a) Determine su concentración molar.
b) Calcule su pH.
c) Calcule la concentración que debe tener una disolución de ácido clorhídrico para que tenga el mismo pH
que la disolución de ácido cianhídrico.
Datos: pKa (ácido cianhídrico) = 9,2. Masas atómicas: H = 1; C = 12; N = 14.
Puntuación máxima por apartado: 0,5 puntos apartado a); 0,75 puntos apartados b) y c).`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2018-extraordinaria.pdf"
      }
    ]
  },
  {
    id: 20191,
    año: 2019,
    tipo: "Extraordinaria",
    asignatura: "Química",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "q-2019-extra-A-1",
        año: 2019,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "A.1",
        enunciado: `Considere los elementos con números atómicos: Z = 4, Z = 8 y Z = 13.
a) Escriba sus configuraciones electrónicas e identifíquelos con su nombre y su símbolo.
b) Razone para cada uno de los elementos cuál es su ion más estable.
c) Justifique si el ion más estable del elemento Z = 4 tendrá mayor o menor radio que el de su átomo.
d) Identifique el compuesto que se forma entre los elementos con Z = 8 y Z = 13, indicando su fórmula,
nombre y tipo de enlace.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2019-extraordinaria.pdf"
      },
      {
        id: "q-2019-extra-A-2",
        año: 2019,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "A.2",
        enunciado: `Formule la reacción química, nombre todos los productos orgánicos e indique el tipo de
reacción:
a) Ácido benzoico + etanol (en medio ácido) →
b) Propeno + HCl →
c) 3-Metilbutan-2-ol + H2SO4 (caliente) →
d) 1-Bromobutano + NaOH →
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2019-extraordinaria.pdf"
      },
      {
        id: "q-2019-extra-A-3",
        año: 2019,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "A.3",
        enunciado: `Sabiendo que la ecuación de velocidad v = k[A]2 corresponde a la reacción ajustada:
A + 2 B → C, conteste razonadamente.
a) ¿Cuáles son los órdenes parciales de reacción respecto a cada reactivo? ¿Y el orden total de la reacción?
b) Deduzca las unidades de la constante de velocidad.
c) Indique cómo se modifica la velocidad de la reacción al duplicar la concentración inicial de B.
d) Explique cómo afecta a la velocidad de la reacción una disminución de la temperatura.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2019-extraordinaria.pdf"
      },
      {
        id: "q-2019-extra-A-4",
        año: 2019,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "A.4",
        enunciado: `El HNO3 reacciona con Cl2, para dar HClO3, NO2, y H2O.
a) Nombre todos los compuestos implicados en la reacción.
b) Escriba y ajuste las semirreacciones de oxidación y reducción que tienen lugar, por el método ion-electrón,
indicando la especie que actúa como oxidante y la que actúa como reductora.
c) Escriba las reacciones iónica y molecular globales ajustadas.
d) Calcule cuántos gramos de HClO3 se obtienen cuando se hacen reaccionar 15 g de Cl2 del 80% de riqueza
en masa, con un exceso de HNO3.
Datos. Masas atómicas: H = 1,0; O = 16,0; Cl = 35,5.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2019-extraordinaria.pdf"
      },
      {
        id: "q-2019-extra-A-5",
        año: 2019,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "A.5",
        enunciado: `Cuando se calienta SOCl2 en un recipiente de 1 L a 375 K, se establece el equilibrio:
SOCl2(g) Δ SO(g) + Cl2(g), encontrándose 0,037 mol de SO y una presión total de 3 atm.
a) Calcule la concentración inicial de SOCl2 expresada en molaridad.
b) Determine el valor de Kc y Kp.
c) Explique si se modifica el equilibrio por un aumento de la presión total, debido a una disminución del
volumen y manteniendo la temperatura constante.
Dato. R = 0,082 atm·L·mol−1·K−1.
Puntuación máxima por apartado: 0,75 puntos apartados a) y b); 0,5 puntos apartado c).`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2019-extraordinaria.pdf"
      },
      {
        id: "q-2019-extra-B-1",
        año: 2019,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "B.1",
        enunciado: `Para cada una de las siguientes moléculas: BF3 y CH3Cl.
a) Dibuje su estructura de Lewis.
b) Justifique el número de pares de electrones enlazantes y el de pares libres del átomo central.
c) Dibuje e indique su geometría molecular aplicando el método de repulsión de pares de electrones de la
capa de valencia (RPECV).
d) Justifique su polaridad.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2019-extraordinaria.pdf"
      },
      {
        id: "q-2019-extra-B-2",
        año: 2019,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "B.2",
        enunciado: `El dióxido de nitrógeno se obtiene mediante la reacción exotérmica:
2 NO(g) + O2(g) ⇌ 2 NO2(g). En un reactor se introducen los reactivos a una determinada presión y
temperatura. Justifique si son verdaderas o falsas las siguientes afirmaciones:
a) La cantidad de NO2 formado es menor al disminuir la temperatura.
b) La oxidación está favorecida a presiones altas.
c) Debido a la estequiometría de la reacción, la presión en el reactor aumenta a medida que se forma NO2.
d) Un método para obtener mayor cantidad de dióxido de nitrógeno es aumentar la presión parcial de
oxígeno.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2019-extraordinaria.pdf"
      },
      {
        id: "q-2019-extra-B-3",
        año: 2019,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "B.3",
        enunciado: `Formule y nombre los siguientes compuestos orgánicos:
a) Dos hidrocarburos saturados, isómeros de cadena, de fórmula molecular C4H10.
b) Dos aminas primarias, isómeras de posición, de fórmula molecular C3H9N.
c) Dos compuestos, isómeros de función (monofuncional), de fórmula molecular C3H6O2.
d) Un hidrocarburo aromático de fórmula molecular C7H8.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2019-extraordinaria.pdf"
      },
      {
        id: "q-2019-extra-B-4",
        año: 2019,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "B.4",
        enunciado: `Se dispone de 100 mL de una disolución que contiene 0,194 g de K2CrO4 a la que se añade
100 mL de otra disolución que contiene iones Ag+. Considere que los volúmenes son aditivos.
a) Calcule la concentración inicial, expresada en molaridad, de iones cromato, presentes en la disolución
antes de que se alcance el equilibrio de precipitación. Escriba el equilibrio de precipitación.
b) Determine la solubilidad de la sal formada en mol·L−1 y g·L−1.
c) Calcule la concentración mínima de iones Ag+ necesaria para que precipite la sal.
d) Si a una disolución que contiene la misma concentración de iones SO42− e iones CrO42− se le añaden
iones Ag+, justifique, sin hacer cálculos, qué sal precipitará primero.
Datos. Ks (Ag2CrO4) = 1,9·10−12; Ks (Ag2SO4) = 1,6·10−5. Masas atómicas: O = 16; K = 39; Cr = 52; Ag = 108.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2019-extraordinaria.pdf"
      },
      {
        id: "q-2019-extra-B-5",
        año: 2019,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "B.5",
        enunciado: `Se preparan 250 mL de una disolución acuosa de ácido acético cuyo pH es 2,9.
a) Calcule la concentración inicial del ácido acético.
b) Obtenga el grado de disociación del ácido acético.
c) Determine el volumen de ácido acético de densidad 1,15 g·mL−1 que se han necesitado para preparar
250 mL de la disolución inicial.
d) Si a la disolución inicialmente preparada se adicionan otros 250 mL de agua, calcule el nuevo valor de
pH. Suponga volúmenes aditivos.
Datos. Masas atómicas: H = 1; C = 12; O = 16; Ka (CH3COOH) = 1,8·10−5.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2019-extraordinaria.pdf"
      }
    ]
  },
  {
    id: 20201,
    año: 2020,
    tipo: "Extraordinaria",
    asignatura: "Química",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "q-2020-extra-A-1",
        año: 2020,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "A.1",
        enunciado: `Considere los siguientes elementos: A (nitrogenoide del periodo 3), B (Z = 11), C (subnivel 3p
con solo dos electrones) y D (periodo 2, grupo 15).
a) Identifique cada elemento con su nombre y símbolo.
b) Determine la configuración electrónica de cada elemento.
c) Justifique si la segunda energía de ionización del elemento A es menor que la del B.
d) Formule el compuesto formado por los elementos A y B y razone si presenta conductividad eléctrica en
estado fundido.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2020-extraordinaria.pdf"
      },
      {
        id: "q-2020-extra-A-2",
        año: 2020,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "A.2",
        enunciado: `Se preparan las siguientes disoluciones acuosas: NH4+, CH3COO−, HClO4 y KCN.
a) Escriba las reacciones de disociación en agua de cada una de las especies.
b) Justifique sin hacer cálculos si el pH de cada disolución es ácido, básico o neutro.
c) Si se parte de la misma concentración inicial, explique cuál de las disoluciones tiene mayor basicidad.
Datos. Ka (ácido acético) = 1,8·10−5; Ka (ácido cianhídrico) = 4,9·10−10; Kb (amoniaco) = 1,8·10−5.
Puntuación máxima por apartado: 0,5 puntos apartado a); 0,75 puntos apartados b) y c).`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2020-extraordinaria.pdf"
      },
      {
        id: "q-2020-extra-A-3",
        año: 2020,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "A.3",
        enunciado: `Se mezclan 0,250 L de disolución de sulfato de potasio 3,00·10−2 M con 0,250 L de disolución
de nitrato de bario 2,00·10−3 M. Considere los volúmenes aditivos.
a) Escriba el equilibrio de solubilidad que tiene lugar.
b) Justifique numéricamente si se forma algún precipitado.
c) Explique cómo varía la solubilidad del sulfato de bario cuando se le añade una disolución de sulfato de
amonio.
Dato. Ks (sulfato de bario) = 1,1·10−10.
Puntuación máxima por apartado: 0,5 puntos apartados a) y c); 1 punto apartado b).`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2020-extraordinaria.pdf"
      },
      {
        id: "q-2020-extra-A-4",
        año: 2020,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "A.4",
        enunciado: `Considere los electrodos: Sn2+/Sn, MnO4−/Mn2+ (en medio ácido clorhídrico), Zn2+/Zn y
Ce4+/Ce3+.
a) Razone qué dos electrodos forman la pila a la que corresponde el proceso con menor ΔG0.
b) Haga los cálculos pertinentes que le permitan razonar si un recipiente de zinc se deteriora al almacenar
en él una disolución de KMnO4 en medio ácido.
c) Ajuste por el método del ion-electrón la ecuación iónica y molecular del proceso redox del apartado b).
Datos. E0(V): Zn2+/Zn = −0,76; Sn2+/Sn = −0,14; MnO4−/Mn2+ = 1,51; Ce4+/Ce3+ = 1,61.
Puntuación máxima por apartado: 0,75 puntos apartados a) y c); 0,5 puntos apartado b).`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2020-extraordinaria.pdf"
      },
      {
        id: "q-2020-extra-A-5",
        año: 2020,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "A.5",
        enunciado: `Considere los compuestos propan−2−ol, propanal, etil metil éter y ácido propanoico:
a) Formúlelos con su fórmula semidesarrollada.
b) Escriba la reacción de formación de un éster a partir de algún o algunos de los compuestos del enunciado y
nombre el producto.
c) Escriba la reacción de formación de un alqueno a partir de algún compuesto del enunciado y utilizando
ácido sulfúrico en caliente. Nombre el alqueno y el tipo de reacción.
d) Indique cuáles son isómeros de función.
Puntuación máxima por apartado: 0,5 puntos`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2020-extraordinaria.pdf"
      },
      {
        id: "q-2020-extra-B-1",
        año: 2020,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "B.1",
        enunciado: `Responda las siguientes cuestiones:
a) Para la molécula NF3, indique la hibridación del átomo central, número de orbitales híbridos y número de
electrones en cada orbital híbrido.
b) Justifique si la molécula NF3 es polar o apolar.
c) Explique la solubilidad del propan−2−ol en agua en función de las fuerzas intermoleculares existentes.
Puntuación máxima por apartado: 0,75 puntos apartados a) y b); 0,5 puntos apartado c).`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2020-extraordinaria.pdf"
      },
      {
        id: "q-2020-extra-B-2",
        año: 2020,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "B.2",
        enunciado: `Se ha llevado a cabo la reacción: A (g) + 2 B (g) → 2 C (g) en dos condiciones experimentales
diferentes, obteniéndose la ecuación de velocidad v = k[B] y los siguientes valores de energías:
Experimento Ea / kJ·mol−1
ΔH / kJ·mol−1
1
2
−0,3
2
0,5
−0,3
a) Justifique en cuál de los experimentos la reacción es más lenta.
b) Explique cómo se modifica la velocidad de la reacción al duplicar la concentración inicial de A.
c) Determine el orden total de la reacción y las unidades de la constante de velocidad.
d) Justifique cómo afecta a la velocidad de reacción un aumento de temperatura.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2020-extraordinaria.pdf"
      },
      {
        id: "q-2020-extra-B-3",
        año: 2020,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "B.3",
        enunciado: `En medio ácido sulfúrico, reaccionan una disolución de dicromato de potasio con una
disolución de sulfato de hierro (II), y se obtiene sulfato de cromo (III), sulfato de hierro (III), sulfato de potasio
y agua.
a) Ajuste la reacción iónica global por el método del ion-electrón e indique cuál es la especie oxidante y cuál
la reductora.
b) Ajuste la reacción molecular por el método del ion-electrón.
c) Calcule el rendimiento con el que transcurre esta reacción si a partir de 4,0 g de dicromato de potasio se
obtienen 12,0 g de sulfato de hierro (III).
Datos. Masas atómicas: O = 16,0; S = 32,1; K = 39,1; Cr = 52,0; Fe = 55,8.
Puntuación máxima por apartado: 0,75 puntos apartados a) y c); 0,5 puntos apartado b).`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2020-extraordinaria.pdf"
      },
      {
        id: "q-2020-extra-B-4",
        año: 2020,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "B.4",
        enunciado: `A 30 ºC se introducen 138 g de N2O4 en un matraz de 50,0 L, transcurriendo la siguiente
reacción: N2O4 (g) ⇌ 2 NO2 (g), con Kp = 0,21.
a) Escriba equilibrio y exprese el número de moles en equilibrio de cada compuesto en función del grado de
disociación.
b) Obtenga el grado de disociación.
c) Justifique, sin realizar cálculos, si el grado de disociación aumenta, disminuye o permanece constante
cuando la reacción tiene lugar a la misma temperatura, pero a menor presión.
Datos. Masas atómicas: N = 14; O = 16. R = 0,082 atm·L·mol−1·K−1.
Puntuación máxima por apartado: 0,5 puntos apartado a); 0,75 puntos apartados b) y c).`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2020-extraordinaria.pdf"
      },
      {
        id: "q-2020-extra-B-5",
        año: 2020,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "B.5",
        enunciado: `Responda las siguientes cuestiones:
a) Formule o nombre los siguientes compuestos, según proceda:
CH3−CHOH−C≡C−CH3; 1,3−pentanodiamina; ácido propanodioico.
b) Formule la reacción, indique de qué tipo es, y nombre los compuestos orgánicos implicados:
CH3−CH2−CHO + oxidante →
c) Formule la reacción, indique de qué tipo es, y nombre los compuestos orgánicos implicados:
CH3−CH2−CH2OH + CH3−COOH (en medio ácido) →
Puntuación máxima por apartado: 0,75 puntos apartados a) y c); 0,5 puntos apartado b).`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2020-extraordinaria.pdf"
      }
    ]
  },
  {
    id: 20211,
    año: 2021,
    tipo: "Extraordinaria",
    asignatura: "Química",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "q-2021-extra-A-1",
        año: 2021,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "A.1",
        enunciado: `Responda las siguientes cuestiones:
a) Considere los elementos: A (1s22s22p63s2), B (1s22s22p2) y C (1s22s22p63s23p4). Identifique cada elemento
y especifique el grupo y el periodo al que pertenece.
b) Considere los elementos D (1s22s1) y E (1s22s22p6). La primera energía de ionización de uno de ellos es
2080,7 kJ·mol−1 y la del otro 520,2 kJ·mol−1. Justifique qué valor de la energía de ionización corresponde
a cada uno.
c) ¿Cuántos electrones desapareados existen en los átomos de Na, N y Ne?
Puntuación máxima por apartado: 0,75 puntos apartados a) y c); 0,5 puntos apartado b).`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2021-extraordinaria.pdf"
      },
      {
        id: "q-2021-extra-A-2",
        año: 2021,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "A.2",
        enunciado: `Para la reacción en fase gaseosa 2 NO2 (g) + F2 (g) → 2 NO2F (g) la ecuación de velocidad es
v = k [NO2] [F2]. Responda las siguientes cuestiones:
a) Indique los órdenes parciales respecto de los reactivos y el orden total de la reacción.
b) Razone si es una reacción elemental.
c) Determine las unidades de la constante de velocidad.
d) Justifique, mediante la ecuación de Arrhenius, cómo afecta un aumento de temperatura a la velocidad de
reacción.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2021-extraordinaria.pdf"
      },
      {
        id: "q-2021-extra-A-3",
        año: 2021,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "A.3",
        enunciado: `Se hacen reaccionar dicromato de potasio y yoduro de potasio en presencia de ácido sulfúrico,
dando lugar a sulfato de cromo (III), yodo y sulfato de potasio.
a) Formule las semirreacciones de oxidación y reducción e indique las especies oxidante y reductora.
b) Ajuste la reacción iónica y molecular global por el método del ion-electrón.
c) Determine el volumen de una disolución 0,25 M de dicromato de potasio que se necesita para obtener
5,0 g de yodo.
Dato. Masa atómica: I = 127.
Puntuación máxima por apartado: 0,75 puntos apartados a) y c); 0,5 puntos apartado b).`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2021-extraordinaria.pdf"
      },
      {
        id: "q-2021-extra-A-4",
        año: 2021,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "A.4",
        enunciado: `Justifique si las siguientes afirmaciones son verdaderas o falsas.
a) El propanoato de metilo se obtiene mediante una reacción de esterificación a partir de ácido propanoico
y etanol.
b) En la reacción de eliminación del compuesto butan−2−ol se obtiene como producto mayoritario
but−1−eno.
c) El compuesto prop−2−en−1−ol es un isómero de función de la propanona.
d) El compuesto pent−2−eno en presencia de Br2 da lugar a 2,3−dibromopentano.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2021-extraordinaria.pdf"
      },
      {
        id: "q-2021-extra-A-5",
        año: 2021,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "A.5",
        enunciado: `Se prepara una disolución de ácido nitroso de pH = 2,42.
a) Determine la concentración inicial del ácido.
b) Calcule el grado de disociación del ácido.
c) A 200 mL de la disolución del enunciado se le adicionan 500 mg de NaOH. Escriba la reacción que
transcurre y justifique si el pH de la disolución resultante es ácido, básico o neutro.
Datos. Ka (ácido nitroso) = 4,5·10−4. Masas atómicas: H = 1; O = 16; Na = 23.
Puntuación máxima por apartado: 0,75 puntos apartados a) y c); 0,5 puntos apartado b).`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2021-extraordinaria.pdf"
      },
      {
        id: "q-2021-extra-B-1",
        año: 2021,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "B.1",
        enunciado: `Considere las moléculas NCl3 y AlCl3.
a) Dibuje sus estructuras de Lewis.
b) Justifique las fuerzas intermoleculares presentes en el compuesto que forma cada molécula.
c) Indique la hibridación y el número de pares de electrones enlazantes y libres del átomo central de cada
una de ellas.
Puntuación máxima por apartado: 0,5 puntos apartado a); 0,75 puntos apartados b) y c).`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2021-extraordinaria.pdf"
      },
      {
        id: "q-2021-extra-B-2",
        año: 2021,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "B.2",
        enunciado: `Responda las siguientes cuestiones:
a) Formule la reacción que permite obtener metilbenceno (tolueno) a partir de clorometano e indique de qué
tipo es.
b) Formule
los
siguientes
compuestos:
penta−2,4−dien−1,4−diol,
but−3−in−2−ona
y
4−fenil−2−metilpentan−1−ol.
c) Nombre y formule dos compuestos, isómeros de función, de fórmula molecular C3H6O.
Puntuación máxima por apartado: 0,75 puntos apartados a) y b); 0,5 puntos apartado c).`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2021-extraordinaria.pdf"
      },
      {
        id: "q-2021-extra-B-3",
        año: 2021,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "B.3",
        enunciado: `Responda las siguientes cuestiones:
a) Ordene por orden creciente de pH las disoluciones acuosas de igual concentración de los siguientes
compuestos: HF, NH3, HCN y NaCl. Razone la respuesta.
b) Calcule la concentración de una disolución de ácido acético sabiendo que 75 mL de esta disolución se
neutralizan con 100 mL de una disolución de hidróxido de potasio 0,15 M.
Datos. Ka (HF) = 1,4·10−4; Kb (NH3) = 1,8·10−5; Ka (HCN) = 4,9·10−10.
Puntuación máxima por apartado: 1 punto.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2021-extraordinaria.pdf"
      },
      {
        id: "q-2021-extra-B-4",
        año: 2021,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "B.4",
        enunciado: `En un recipiente de 1,0 L a 300 ºC se introducen 5,0 g de PCl5. La presión final cuando se
alcanza el equilibrio PCl5 (g) ⇌ PCl3 (g) + Cl2 (g) es de 2,0 atm.
a) Calcule el grado de disociación del PCl5.
b) Determine la presión parcial de cada uno de los gases en el equilibrio.
c) Calcule Kc y Kp.
Datos. R = 0,082 atm·L·K−1·mol−1. Masas atómicas: P = 31,0; Cl = 35,5.
Puntuación máxima por apartado: 0,75 puntos apartados a) y c); 0,5 puntos apartado b).`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2021-extraordinaria.pdf"
      },
      {
        id: "q-2021-extra-B-5",
        año: 2021,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "B.5",
        enunciado: `Responda las siguientes cuestiones a partir de la reacción de oxidación-reducción (no
ajustada): Cu2+ (ac) + H2O → Cu (s) + O2 (g).
a) Razone si la reacción se produce de forma espontánea.
b) Escriba las semirreacciones de oxidación y reducción, indicando en qué electrodo se deposita el cobre
y en cuál se desprende oxígeno.
c) Determine cuánto cobre se deposita si se hace pasar una corriente de 0,50 amperios a través de 1,0 L
de disolución de CuSO4 0,2 M durante 4 horas.
Datos. E0(V): Cu2+/Cu = 0,34; O2/H2O = 1,23. F = 96485 C. Masa atómica: Cu = 63,5.
Puntuación máxima por apartado: 0,5 puntos apartado a); 0,75 puntos apartados b) y c).`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2021-extraordinaria.pdf"
      }
    ]
  },
  {
    id: 20221,
    año: 2022,
    tipo: "Extraordinaria",
    asignatura: "Química",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "q-2022-extra-A-1",
        año: 2022,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "A.1",
        enunciado: `Considere los elementos A (un halógeno cuyo anión contiene 18 e−), B (un metal alcalinotérreo del tercer
periodo) y C (un elemento del grupo 16 que contiene 16 e−).
a) (1 punto) Identifique los elementos A, B y C con su nombre y símbolo, y escriba la configuración
electrónica de cada uno de ellos en su estado fundamental.
b) (1 punto) Justifique si las siguientes afirmaciones son verdaderas o falsas:
b.1. El elemento C es el que presenta una mayor energía de ionización.
b.2. El elemento con mayor radio atómico es el B.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2022-extraordinaria.pdf"
      },
      {
        id: "q-2022-extra-A-2",
        año: 2022,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "A.2",
        enunciado: `Razone si las siguientes afirmaciones son verdaderas o falsas y responda a las cuestiones:
a) (0,5 puntos) Los compuestos butanal y butanona son isómeros de función del but−3−en−1−ol. Escriba la
fórmula semidesarrollada y nombre y señale el grupo funcional de cada uno de los tres compuestos.
b) (0,5 puntos) En la reacción de adición del ácido bromhídrico al propeno se obtiene como producto
mayoritario 1−bromopropano. Formule la reacción e indique la regla que sigue.
c) (0,5 puntos) En la reacción de eliminación del pentan−2−ol con ácido sulfúrico y calor se obtiene como
producto mayoritario pent−2−eno. Formule la reacción e indique la regla que sigue.
d) (0,5 puntos) El policloruro de vinilo (PVC) se obtiene a partir de cloroeteno o cloruro de vinilo mediante
una reacción de polimerización por condensación.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2022-extraordinaria.pdf"
      },
      {
        id: "q-2022-extra-A-3",
        año: 2022,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "A.3",
        enunciado: `Para la reacción 2 NO (g) + 2 H2 (g) → N2 (g) + 2 H2O (g) el orden parcial de cada reactivo es uno.
a) (0,5 puntos) Escriba una expresión para su ecuación de velocidad y calcule el orden total de la reacción.
b) (0,75 puntos) Para un valor inicial de [NO] y [H2] de 0,0025 mol·L−1 y 0,075 mol·L−1, respectivamente, la
velocidad es 4,5·10−4 mol·L−1·s−1. Determine la constante de velocidad y sus unidades.
c) (0,75 puntos) Razone cómo afectará la presencia de un catalizador a la velocidad de la reacción, la
energía de activación, ΔH, ΔS y ΔG.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2022-extraordinaria.pdf"
      },
      {
        id: "q-2022-extra-A-4",
        año: 2022,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "A.4",
        enunciado: `Una disolución acuosa de ácido benzoico (C6H5−COOH) 0,100 M tiene un grado de disociación del 2,5%.
a) (0,75 puntos) Determine la constante de disociación del ácido y la constante de basicidad de su base
conjugada.
b) (0,5 puntos) Calcule el pH de la disolución.
c) (0,75 puntos) Determine el volumen de disolución de NaOH 0,0500 M que habría que añadir a 50,0 mL
de la disolución del ácido para neutralizarlo completamente. Razone si el pH final será ácido, básico o
neutro.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2022-extraordinaria.pdf"
      },
      {
        id: "q-2022-extra-A-5",
        año: 2022,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "A.5",
        enunciado: `El permanganato de potasio reacciona con el ácido clorhídrico produciendo cloruro de potasio, cloruro de
manganeso(II), agua y cloro molecular.
a) (1 punto) Ajuste las reacciones iónica y molecular utilizando el método del ion-electrón. Indique las
especies oxidante y reductora.
b) (1 punto) Determine el volumen de ácido clorhídrico comercial del 36% de riqueza en peso y densidad
1,18 g·mL-1 que se necesitará para que reaccionen completamente 5,00 g de permanganato de potasio.
Datos. Masas atómicas (u): H = 1,0; O = 16,0; Cl = 35,5; K = 39,1; Mn = 55,0.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2022-extraordinaria.pdf"
      },
      {
        id: "q-2022-extra-B-1",
        año: 2022,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "B.1",
        enunciado: `Considere las moléculas NaBr, NH3, CH4 y HCl.
a) (1 punto) Justifique, mediante el tipo de enlace y las distintas fuerzas intermoleculares presentes, qué
punto de ebullición corresponde a cada molécula: −33,3 °C, −85,1 °C, 1396 °C y −161,6 °C.
b) (1 punto) Indique la hibridación del átomo central y la geometría de las moléculas NH3 y CH4.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2022-extraordinaria.pdf"
      },
      {
        id: "q-2022-extra-B-2",
        año: 2022,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "B.2",
        enunciado: `Escriba todos los productos de las siguientes reacciones orgánicas, indique el tipo de reacción y nombre
los compuestos orgánicos implicados.
a) (0,5 puntos) CH3−CH2−CH2−CH2−Cl + NaOH →
b) (0,5 puntos) CH3−CHO + H2 →
c) (0,5 puntos)
−COOH + CH3−CH2−OH →
d) (0,5 puntos) CH3−C(OH)(CH3)−CH2−CH2−CH3 + H2SO4/calor →`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2022-extraordinaria.pdf"
      },
      {
        id: "q-2022-extra-B-3",
        año: 2022,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "B.3",
        enunciado: `En un reactor se introducen 0,46 mol de N2 y 0,77 mol de H2. Cuando se alcanza el equilibrio a 800 K:
N2 (g) + 3 H2 (g) ⇌ 2 NH3 (g) (ΔH = −107,2 kJ), se han formado 0,012 mol de amoníaco y la presión total del
recipiente es 13,1 atm.
a) (1 punto) Calcule el valor de Kc.
b) (0,5 puntos) Determine el valor de Kp.
c) (0,5 puntos) Razone cómo se modificará el rendimiento de la reacción si se realiza a 1200 K.
Dato. R = 0,082 atm·L·K−1·mol−1.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2022-extraordinaria.pdf"
      },
      {
        id: "q-2022-extra-B-4",
        año: 2022,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "B.4",
        enunciado: `Responda razonadamente a las siguientes cuestiones:
a) (1 punto) Tras la adición de hidróxido de sodio 0,20 M a 100 mL de ácido nítrico 0,050 M se obtiene una
disolución de pH neutro. Escriba la reacción que tiene lugar y calcule el volumen que se añade de la
base.
b) (1 punto) El ácido láctico (HA) es un compuesto orgánico con una constante de acidez de 1,38·10−4 y
masa molecular 90,0 g·mol−1. Se preparan 100 mL de una disolución de ácido láctico cuyo pH es el
mismo que el de otra disolución de HCl 0,0200 M. Determine los gramos de ácido láctico necesarios para
preparar la disolución.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2022-extraordinaria.pdf"
      },
      {
        id: "q-2022-extra-B-5",
        año: 2022,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "B.5",
        enunciado: `Una pila en medio básico tiene la siguiente notación:
Mn2+(ac, 1 M) │MnO2(s) ││ Au3+(ac, 1 M) │ Au(s)
a) (1 punto) Escriba ajustadas por el método ion-electrón las semirreacciones de oxidación y reducción,
indicando el ánodo, el cátodo y qué especies actúan como oxidante y reductora.
b) (1 punto) Determine el potencial de la pila y prediga la espontaneidad del proceso redox.
Datos. E0 (V): MnO2/Mn2+ = 1,23; Au3+/Au = 1,50.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2022-extraordinaria.pdf"
      }
    ]
  },
  {
    id: 20231,
    año: 2023,
    tipo: "Extraordinaria",
    asignatura: "Química",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "q-2023-extra-A-1",
        año: 2023,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "A.1",
        enunciado: `Considere los elementos: A (Z = 17) y B (Z = 12).
a) (0,5 puntos) Escriba la configuración electrónica e indique el nombre, símbolo, grupo y periodo de ambos.
b) (0,5 puntos) Justifique cuál es el elemento de mayor energía de ionización.
c) (0,5 puntos) Justifique cuál es el ion más estable de cada elemento y escriba sus configuraciones
electrónicas.
d) (0,5 puntos) Explique si el radio del ion más estable de cada elemento es mayor o menor que el de su
respectivo átomo neutro.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2023-extraordinaria.pdf"
      },
      {
        id: "q-2023-extra-A-2",
        año: 2023,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "A.2",
        enunciado: `Responda a las siguientes cuestiones:
a) (0,5 puntos) Formule el compuesto 3−bromo−4−metilpentanal. Formule y nombre un isómero de función.
b) (0,5 puntos) Formule y nombre dos isómeros de posición del éter con fórmula molecular C4H10O.
c) (0,5 puntos) Escriba y ajuste la reacción de combustión del compuesto etino.
d) (0,5 puntos) Escriba la reacción de obtención del ácido 2−metilbutanoico a partir del aldehído necesario,
indicando el tipo de reacción que se produce y nombrando dicho aldehido.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2023-extraordinaria.pdf"
      },
      {
        id: "q-2023-extra-A-3",
        año: 2023,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "A.3",
        enunciado: `Responda a las siguientes cuestiones:
a) (0,5 puntos) Formule el equilibrio de solubilidad del fluoruro de magnesio, indicando el estado de cada
especie. Escriba la expresión para Ks en función de la solubilidad.
b) (0,5 puntos) Determine el valor de la solubilidad del fluoruro de magnesio en mol·L−1 y en g·L−1.
c) (0,5 puntos) Determine la concentración de ion fluoruro en una disolución saturada de fluoruro de
magnesio.
d) (0,5 puntos) Justifique cómo varía la solubilidad del fluoruro de magnesio al añadirle un exceso de ácido
fluorhídrico.
Datos. Ks (fluoruro de magnesio) = 5,2·10−11; Masas atómicas (u): F = 19,0; Mg = 24,3.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2023-extraordinaria.pdf"
      },
      {
        id: "q-2023-extra-A-4",
        año: 2023,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "A.4",
        enunciado: `La reacción en fase gaseosa 2 A → 2 B + C es de segundo orden. Cuando la concentración de A es 0,050
M presenta una velocidad de 7,8·10−4 mol·L−1·s−1.
a) (0,5 puntos) Escriba la ecuación de velocidad y deduzca las unidades de la constante de velocidad.
b) (0,5 puntos) Determine la constante de velocidad y calcule la velocidad cuando la concentración de A sea
0,090 M.
c) (0,5 puntos) Justifique cómo afecta a la velocidad de la reacción la presencia de un catalizador.
d) (0,5 puntos) Justifique, mediante la ecuación de Arrhenius, cómo afecta a la constante de velocidad un
aumento de la temperatura.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2023-extraordinaria.pdf"
      },
      {
        id: "q-2023-extra-A-5",
        año: 2023,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "A.5",
        enunciado: `La reacción entre dióxido de azufre y sulfato de cobre(II), en presencia de cloruro de sodio, permite
preparar cloruro de cobre(I), produciéndose también sulfato de sodio y ácido sulfúrico.
a) (0,75 puntos) Formule y ajuste por el método del ion electrón las semirreacciones de oxidación y reducción
que tienen lugar. Indique las especies que actúan como oxidante y reductora.
b) (0,75 puntos) Ajuste las reacciones iónica y molecular.
c) (0,5 puntos) Calcule el volumen de SO2 que reacciona con 7,0 g de sulfato de cobre(II), a 1,0 atm y 25 °C.
Datos. Masas atómicas (u): O = 16,0; S = 32,0; Cu = 63,5. R = 0,082 atm·L·mol−1·K−1.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2023-extraordinaria.pdf"
      },
      {
        id: "q-2023-extra-B-1",
        año: 2023,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "B.1",
        enunciado: `Para las moléculas: NH3 y SH2.
a) (0,5 puntos) Indique y represente la geometría molecular aplicando el método de repulsión de pares de
electrones de la capa de valencia (RPECV).
b) (0,5 puntos) Indique la hibridación del átomo central.
c) (0,5 puntos) Justifique su polaridad.
d) (0,5 puntos) Justifique la fuerza intermolecular más importante que presenta cada una de ellas.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2023-extraordinaria.pdf"
      },
      {
        id: "q-2023-extra-B-2",
        año: 2023,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "B.2",
        enunciado: `Formule los reactivos y el producto mayoritario de las siguientes reacciones. Indique el tipo de reacción,
la regla que sigue si es el caso, y nombre los productos.
a) (0,75 puntos) 3−metilpent−2−eno + HCl →
b) (0,75 puntos) 3−metilpentan−2−ol + H2SO4(concentrado) →
c) (0,5 puntos) Ácido pentanoico + etanol →`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2023-extraordinaria.pdf"
      },
      {
        id: "q-2023-extra-B-3",
        año: 2023,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "B.3",
        enunciado: `Cuando se calientan 0,20 mol de HCONH2 a 127 ºC en un reactor de 5,0 L, tiene lugar la siguiente
reacción:
HCONH2 (g) ⇆ NH3 (g) + CO (g)
(ΔH = + 29,4 kJ·mol−1)
alcanzándose en el equilibrio una presión total de 1,6 atm.
a) (0,75 puntos) Calcule las concentraciones de cada especie en el equilibrio.
b) (0,75 puntos) Calcule Kc, Kp y la fracción molar del reactivo que queda sin descomponer.
c) (0,5 puntos) Justifique lo que ocurrirá en el equilibrio al aumentar la temperatura.
Dato. R = 0,082 atm·L·mol−1·K−1.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2023-extraordinaria.pdf"
      },
      {
        id: "q-2023-extra-B-4",
        año: 2023,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "B.4",
        enunciado: `Responda a las siguientes cuestiones:
a) (1 punto) La biotina es un ácido monoprótico, HA. Una disolución de biotina 0,010 M tiene un pH de 3,3.
Determine la constante de disociación y el grado de disociación.
b) (1 punto) Determine el volumen de una disolución de hidróxido de sodio 0,050 M necesario para
neutralizar 100 mL de la disolución de HA.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2023-extraordinaria.pdf"
      },
      {
        id: "q-2023-extra-B-5",
        año: 2023,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "B.5",
        enunciado: `A través de una celda electrolítica que contiene una disolución acuosa de CdSO4, se hace pasar una
corriente de 2,50 A durante 90 minutos, observándose que se deposita Cd y se desprende oxígeno molecular.
a) (1 punto) Escriba las reacciones que se producen en el ánodo y en el cátodo, y la reacción iónica y
molecular, ajustadas por el método del ion electrón, indicando el estado de las especies.
b) (1 punto) Calcule los gramos de Cd depositados.
Datos. E0(V): Cd2+/Cd = − 0,40; O2/H2O = 1,23. F = 96485 C·mol−1. Masa atómica (u): Cd = 112,4.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2023-extraordinaria.pdf"
      }
    ]
  },
  {
    id: 20241,
    año: 2024,
    tipo: "Extraordinaria",
    asignatura: "Química",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "q-2024-extra-A-1",
        año: 2024,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "A.1",
        enunciado: `Dados cuatro elementos: A, B, C y D, cuyos electrones de mayor energía poseen una configuración en
su estado fundamental de: 3s1, 3p1, 3p4 y 3p5, respectivamente:
a) (0,5 puntos) Identifique cada elemento con su configuración electrónica, nombre, símbolo, grupo y
periodo.
b) (0,5 puntos) Justifique cuál presenta mayor energía de ionización.
c) (0,5 puntos) Escriba el símbolo de sus iones más estables y ordene esos iones en orden decreciente de
su tamaño, justificando la respuesta.
d) (0,5 puntos) Indique qué tipo de enlace se establece entre A y C y entre D con D. Escriba las fórmulas de
las especies formadas.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2024-extraordinaria.pdf"
      },
      {
        id: "q-2024-extra-A-2",
        año: 2024,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "A.2",
        enunciado: `Se lleva a cabo la siguiente secuencia de reacciones: 2−bromopropano + KOH / EtOH → A (alqueno);
A + H2O / H+ → B; B + oxidante (Cr2O72−) / H+ → C.
a) (1 punto) Formule y nombre los compuestos orgánicos mayoritarios obtenidos: A, B y C, indique el tipo
de reacción y en su caso, indique cuando se cumple la regla de Markovnikov.
b) (0,5 puntos) ¿Son isómeros los compuestos B y C? ¿El compuesto A podría ser un posible isómero
geométrico? Justifique las respuestas.
c) (0,5 puntos) Para la siguiente reacción en medio ácido, formule y nombre los compuestos implicados, e
indique el tipo de reacción: B + ácido etanoico → ……..`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2024-extraordinaria.pdf"
      },
      {
        id: "q-2024-extra-A-3",
        año: 2024,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "A.3",
        enunciado: `Responda a las siguientes cuestiones:
a) (0,75 puntos) Calcule el grado de disociación y el pH de una disolución 0,10 M de ácido hipobromoso, a
25 ºC, si su constante de disociación, a dicha temperatura, vale 2,3·10−9.
b) (0,75 puntos) Calcule la molaridad que debería tener una disolución de ácido sulfúrico para que su pH
fuera igual al de la disolución anterior de ácido hipobromoso. Considere disociación completa del H2SO4.
c) (0,5 puntos) Dados los siguientes ácidos: ácido hipobromoso (Ka = 2,3·10−9) y ácido fluorhídrico (Ka =
7·10−4), escriba la fórmula y el nombre de sus respectivas bases conjugadas, ordenándolas
justificadamente según su fuerza creciente como bases.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2024-extraordinaria.pdf"
      },
      {
        id: "q-2024-extra-A-4",
        año: 2024,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "A.4",
        enunciado: `La síntesis industrial del metanol viene dada por: CO (g) + 2 H2 (g) ⇆ CH3OH (g). La reacción tiene lugar
en un recipiente de 5,0 L y a 510 ºC se alcanza el equilibrio, obteniéndose 0,78 mol de metanol. Calcule:
a) (0,75 puntos) Las concentraciones de cada especie en el equilibrio, si se ha partido de 1,0 mol de CO y
2,0 mol de H2.
b) (0,75 puntos) Las constantes de equilibrio, Kc y Kp.
c) (0,5 puntos) La entalpía de reacción estándar (suponer constante a cualquier temperatura).
Datos. R = 0,082 atm·L·mol−1·K−1. Entalpías de formación estándar a 25 ºC (kJ·mol−1): CO (g) = −110,5;
CH3OH (g) = −238,7.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2024-extraordinaria.pdf"
      },
      {
        id: "q-2024-extra-A-5",
        año: 2024,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "A.5",
        enunciado: `Se electroliza 1,0 L de disolución acuosa de nitrato de plata 0,10 M haciendo pasar, a través de ella, una
corriente de 0,50 A y obteniéndose una masa de plata de 4,03 g, depositada en el cátodo.
a) (0,5 puntos) Sabiendo que en el ánodo se desprende O2, escriba las reacciones que tienen lugar en el
cátodo y en el ánodo y la reacción molecular.
b) (1 punto) Calcule cuál ha sido el tiempo de duración de la electrólisis, expresado en horas, así como la
concentración molar de iones plata que quedan en disolución, una vez finalizada la electrólisis. Suponga
que el volumen de la disolución no varía durante la electrólisis.
c) (0,5 puntos) Determine el volumen de oxígeno, en mL, obtenido en el ánodo, durante la electrólisis,
medido en condiciones de presión y temperatura de 1,0 atm y 0 ºC, respectivamente.
Datos. R = 0,082 atm·L·mol−1·K−1; F = 96485 C·mol−1; Masas atómica (u): Ag = 108,0.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2024-extraordinaria.pdf"
      },
      {
        id: "q-2024-extra-B-1",
        año: 2024,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "B.1",
        enunciado: `Para cada una de las moléculas PF3 y BCl3
a) (0,5 puntos) Indique su geometría molecular según la teoría RPECV.
b) (0,5 puntos) Indique la hibridación que presenta el átomo central.
c) (0,5 puntos) Justifique su polaridad y escriba el tipo de fuerzas intermoleculares que presenta.
d) (0,5 puntos) Razone cuál de ellas es más soluble en agua.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2024-extraordinaria.pdf"
      },
      {
        id: "q-2024-extra-B-2",
        año: 2024,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "B.2",
        enunciado: `Responda a las siguientes cuestiones:
a) (0,5 puntos) Formule y nombre los posibles isómeros de fórmula C2H6O.
b) (0,5 puntos) De los compuestos: 1,2−dicloroeteno y 1,1−dicloroeteno, indique de forma razonada, cuál o
cuáles presentan isomería geométrica, e identifique cada isómero geométrico con su nombre completo.
c) (1 punto) El etanol, el 1,2−dibromoetano, el cloroetano y el etano pueden obtenerse a partir del mismo
compuesto. Indique de qué compuesto se trata, escriba las reacciones, condiciones, reactivos
correspondientes, e indique el tipo de reacción que lleva a la obtención de cada uno de esos cuatro
compuestos químicos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2024-extraordinaria.pdf"
      },
      {
        id: "q-2024-extra-B-3",
        año: 2024,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "B.3",
        enunciado: `A la temperatura de 45 ºC se produce la reacción: 2 N2O5 (g) → 4 NO2 (g) + O2 (g), con una velocidad de
descomposición del N2O5 de 2,5·10−6 mol·L−1·s−1.
a) (0,75 puntos) Determine, en esas mismas condiciones, la velocidad a la que se forma el NO2 y el O2.
b) (0,75 puntos) Sabiendo que la constante de velocidad a 45 ºC, es 6,08·10−4 s−1, escriba justificadamente
la ecuación de velocidad de la reacción y calcule la velocidad de reacción cuando la concentración de
N2O5 es 0,10 mol·L−1.
c) (0,5 puntos) Utilizando la ecuación de Arrhenius, justifique si es verdadera la siguiente afirmación: “La
velocidad de una reacción puede aumentar si se lleva a cabo por un mecanismo diferente en el que se
rebaje su energía de activación, por el uso de un catalizador adecuado”.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2024-extraordinaria.pdf"
      },
      {
        id: "q-2024-extra-B-4",
        año: 2024,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "B.4",
        enunciado: `Se mezclan 10 mL de cloruro de bario 0,10 M con 40 mL de sulfato de sodio 0,10 M.
a) (0,75 puntos) Escriba la ecuación de la reacción entre ambas sales y la del equilibrio de solubilidad de la
sal precipitante, detallando el estado de todas las especies. Calcule si precipitará sulfato de bario.
Suponga volúmenes aditivos.
b) (0,75 puntos) Calcule la concentración, en g·mL−1, de SO42−, una vez alcanzado el equilibrio de
precipitación.
c) (0,5 puntos) Razone cómo varía la solubilidad de una disolución saturada de sulfato de bario en agua, si
se le adicionan unas gotas de disolución acuosa diluida de ácido sulfúrico.
Datos. Ks (BaSO4) = 1,5·10−9. Masas atómicas (u): O = 16,0; S = 32,0.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2024-extraordinaria.pdf"
      },
      {
        id: "q-2024-extra-B-5",
        año: 2024,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "B.5",
        enunciado: `La reacción de oxidación del sulfato de hierro(II) con el dicromato de potasio, en medio ácido sulfúrico,
produce sulfato de hierro(III), sulfato de cromo(III), sulfato de potasio y agua.
a) (1 punto) Utilizando el método del ion electrón escriba ajustadas las semirreacciones de oxidación y
reducción y las reacciones iónica y molecular.
b) (1 punto) Calcule los mL de disolución 0,050 M de K2Cr2O7 que son necesarios para oxidar 50 mL de una
disolución 0,30 M de sulfato de hierro(II).`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2024-extraordinaria.pdf"
      }
    ]
  },
  {
    id: 20212,
    año: 2021,
    tipo: "Modelo",
    asignatura: "Química",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "q-2021-coincidentes-A-1",
        año: 2021,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "A.1",
        enunciado: `(2 puntos) Considere la configuración electrónica $1s^22s^22p^6$.
a) Si perteneciese a un átomo neutro, identifíquelo indicando grupo, período, símbolo y nombre.
b) Justifique qué dos cationes, uno con carga +1 y otro con carga +2, la presentan. Identifíquelos con nombre
y símbolo.
c) Justifique qué dos aniones, uno con carga −1 y otro con carga −2, la presentan. Identifíquelos con nombre
y símbolo.
Puntuación máxima por apartado: 0,5 puntos apartado a); 0,75 puntos apartados b) y c).`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2021-coincidentes.pdf"
      },
      {
        id: "q-2021-coincidentes-A-2",
        año: 2021,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "A.2",
        enunciado: `(2 puntos) Considere la fórmula empírica $\\text{C}_4\\text{H}_8\\text{O}$:
a) Formule y nombre dos isómeros de grupo funcional carbonilo que correspondan a la fórmula anterior.
b) Formule y nombre dos aldehídos isómeros de cadena que correspondan a la fórmula anterior.
c) Formule y nombre un alcohol primario de cadena lineal con doble enlace que corresponda a la fórmula
anterior.
d) Justifique mediante su formulación si etenil etil éter corresponde a la fórmula anterior.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2021-coincidentes.pdf"
      },
      {
        id: "q-2021-coincidentes-A-3",
        año: 2021,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "A.3",
        enunciado: `(2 puntos) La reacción en fase gaseosa $2\\ \\text{A} + \\text{B} \\rightarrow \\text{C} + \\text{D}$ tiene como ley de velocidad: $v = k[\\text{A}][\\text{B}]$.
a) Indique los órdenes parciales de reacción respecto de A y de B, el orden total de reacción, y las unidades
de la constante de velocidad.
b) Justifique cuál de los dos reactivos se consume más rápido.
c) Justifique con las fórmulas adecuadas cómo afecta a la velocidad de reacción que el volumen del
recipiente donde se produce la reacción se reduzca a la mitad.
d) Justifique, mediante la ecuación de Arrhenius, cómo afecta a la velocidad de reacción un aumento de la
temperatura.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2021-coincidentes.pdf"
      },
      {
        id: "q-2021-coincidentes-A-4",
        año: 2021,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "A.4",
        enunciado: `(2 puntos) El hidróxido de calcio es muy insoluble en agua. Responda las siguientes cuestiones:
a) Formule el equilibrio de solubilidad del hidróxido de calcio, detallando el estado de cada especie, y escriba
la expresión para $K_s$ en función de la solubilidad.
b) Determine el valor de la solubilidad del hidróxido de calcio en $\\text{mol}\\cdot\\text{L}^{-1}$ y en $\\text{g}\\cdot\\text{L}^{-1}$.
c) Determine la $[\\text{OH}^-]$ y el pH de una disolución saturada de hidróxido de calcio.
d) Justifique si la adición de unas gotas de HCl aumenta o disminuye la cantidad de hidróxido de calcio
disuelto.
Datos. Masas atómicas: H = 1,0; O = 16,0; Ca = 40,1. $K_s(\\text{hidróxido de calcio}) = 5{,}0 \\cdot 10^{-6}$.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2021-coincidentes.pdf"
      },
      {
        id: "q-2021-coincidentes-A-5",
        año: 2021,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "A.5",
        enunciado: `(2 puntos) Se introduce 1 mol de $\\text{NO}_2$ en un recipiente a 288 K y 1 atm, y se alcanza el equilibrio:
$2\\ \\text{NO}_2(g) \\rightleftharpoons \\text{N}_2\\text{O}_4(g)$, con $\\Delta H^\\circ = -60\\ \\text{kJ/mol}$.
a) Determine la fracción molar de cada gas en el equilibrio.
b) Calcule a qué presión se tiene la mezcla equimolar.
c) Justifique, sin hacer cálculos, cómo varían las fracciones molares calculadas en a) si aumenta la
temperatura.
Datos. $R = 0{,}082\\ \\text{atm}\\cdot\\text{L}\\cdot\\text{mol}^{-1}\\cdot\\text{K}^{-1}$. $K_p = 15{,}0$.
Puntuación máxima por apartado: 0,75 puntos apartados a) y b); 0,5 puntos apartado c).`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2021-coincidentes.pdf"
      },
      {
        id: "q-2021-coincidentes-B-1",
        año: 2021,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "B.1",
        enunciado: `(2 puntos) Considere los siguientes compuestos de carbono: $\\text{CH}_4$, $\\text{CCl}_4$, $\\text{CO}_2$.
a) ¿En cuál/es el C tiene hibridación $sp^3$? Indique la geometría molecular para dicho/s compuesto/s.
b) ¿Cuál/es tiene/n geometría lineal? Justifique la respuesta.
c) ¿Cuál/es es/son apolar/es? Justifique la respuesta.
Puntuación máxima por apartado: 0,75 puntos apartados a) y b); 0,5 puntos apartado c).`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2021-coincidentes.pdf"
      },
      {
        id: "q-2021-coincidentes-B-2",
        año: 2021,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "B.2",
        enunciado: `(2 puntos) Considere la reacción endotérmica de descomposición: $\\text{A}(s) \\rightleftharpoons \\text{C}(g) + \\text{D}(g)$.
a) Escriba la expresión de $K_p$ en términos de presiones parciales y de fracciones molares.
b) Justifique si A(s) es más estable a temperaturas altas o bajas.
c) Justifique si A(s) se descompone más al aumentar la presión total.
d) Justifique cómo se desplaza el equilibrio al duplicar la cantidad de A(s).
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2021-coincidentes.pdf"
      },
      {
        id: "q-2021-coincidentes-B-3",
        año: 2021,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "B.3",
        enunciado: `(2 puntos) Considere el compuesto but-2-eno.
a) Escriba su fórmula empírica y semidesarrollada.
b) Escriba y ajuste su reacción de combustión.
c) Escriba su reacción con ioduro de hidrógeno. Formule y nombre el producto resultante.
d) Escriba su reacción de obtención a partir de un alcohol. Formule y nombre dicho alcohol.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2021-coincidentes.pdf"
      },
      {
        id: "q-2021-coincidentes-B-4",
        año: 2021,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "B.4",
        enunciado: `(2 puntos) A 50 mL de una disolución de $\\text{AgNO}_3$ 0,5 M se le añaden 0,35 g de Al obteniéndose Ag y
$\\text{Al(NO}_3)_3$.
a) Escriba y ajuste por el método del ion-electrón las semirreacciones de oxidación y reducción, y las
reacciones iónica global y molecular. Indique cuál es la especie oxidante y cuál es la reductora.
b) Justifique la espontaneidad de la reacción.
c) Calcule la masa total de Ag que se obtiene.
Datos. Masas atómicas: H = 1, N = 14, Al = 27, Ag = 108. $E^0(V)$: $\\text{Al}^{3+}/\\text{Al} = -1{,}7$; $\\text{Ag}^+/\\text{Ag} = 0{,}8$.
Puntuación máxima por apartado: 0,75 puntos apartados a) y c); 0,5 puntos apartado b).`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2021-coincidentes.pdf"
      },
      {
        id: "q-2021-coincidentes-B-5",
        año: 2021,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "B.5",
        enunciado: `(2 puntos) Una disolución de ácido débil HX tiene un grado de disociación $\\alpha = 0{,}015$. Calcule:
a) La molaridad inicial de la disolución de HX y su pH.
b) La masa de KOH necesaria para preparar 100 mL de una disolución 0,75 M, y el volumen de dicha
disolución que se utilizará para valorar 15 mL de HX.
c) Justifique, sin realizar cálculos, si el pH en el punto de equivalencia de la valoración realizada en el
apartado b) es ácido, básico o neutro.
Datos. $K_a(\\text{HX}) = 5{,}0 \\cdot 10^{-4}$. Masas atómicas: H = 1,0; O = 16,0; K = 39,1.
Puntuación máxima por apartado: 0,75 puntos apartados a) y b); 0,5 puntos apartado c).`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2021-coincidentes.pdf"
      }
    ]
  },
  {
    id: 20232,
    año: 2023,
    tipo: "Modelo",
    asignatura: "Química",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "q-2023-coincidentes-A-1",
        año: 2023,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "A.1",
        enunciado: `Dados los siguientes elementos: A (Z = 11), B (Z = 13) y C (Z = 17).
a) (0,5 puntos) Identifique cada uno de ellos con su configuración electrónica, nombre, símbolo, grupo y
periodo.
b) (0,5 puntos) Defina qué es la electronegatividad y ordene los elementos en orden creciente de
electronegatividad.
c) (0,5 puntos) Escriba los iones positivos más estables de los anteriores elementos y ordénelos de menor
a mayor tamaño. Justifique la respuesta.
d) (0,5 puntos) Indique qué tipo de enlace se establece entre C y A y entre C con C. Escriba las fórmulas de
las especies formadas.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2023-coincidentes.pdf"
      },
      {
        id: "q-2023-coincidentes-A-2",
        año: 2023,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "A.2",
        enunciado: `Complete las siguientes reacciones, formule los reactivos orgánicos, formule y nombre los productos
orgánicos mayoritarios obtenidos, y en su caso, la regla que siguen, e indique el tipo de reacción:
a) (0,5 puntos) Propeno + $\\text{H}_2\\text{O}/\\text{H}^+$ $\\rightarrow$
b) (0,5 puntos) Butan-2-ol + $\\text{H}_2\\text{SO}_4$/calor $\\rightarrow$
c) (0,5 puntos) Cloroetano + $\\text{Ag(OH)}$ $\\rightarrow$
d) (0,5 puntos) Etanol + ácido metanoico $\\rightarrow$`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2023-coincidentes.pdf"
      },
      {
        id: "q-2023-coincidentes-A-3",
        año: 2023,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "A.3",
        enunciado: `Responda a las siguientes cuestiones:
a) (1 punto) Calcule la constante de disociación del ácido hipocloroso a 25 ºC y su grado de disociación,
sabiendo que una disolución acuosa 0,300 M de este ácido tiene un pH de 4,02 a dicha temperatura.
b) (1 punto) Organice las siguientes disoluciones acuosas de igual concentración, en orden creciente de su
pH: ácido hipocloroso, hipoclorito de sodio, ácido nítrico, nitrato de potasio, hidróxido de sodio. Justifique
la respuesta.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2023-coincidentes.pdf"
      },
      {
        id: "q-2023-coincidentes-A-4",
        año: 2023,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "A.4",
        enunciado: `A 73 ºC se introducen 2,0 mol de A (g) en un recipiente de 2,0 L, alcanzándose el equilibrio
$\\text{A}(g) \\rightleftharpoons \\text{B}(g) + \\text{C}(g)$, y obteniéndose una presión de 7,3 atm de la especie C (g). Calcule:
a) (1 punto) Las concentraciones de cada especie en el equilibrio.
b) (0,5 puntos) $K_c$ y $K_p$.
c) (0,5 puntos) Sabiendo que el proceso es exotérmico, razone cómo se modificará el rendimiento de la
reacción si se realiza a 1000 K.
Dato. $R = 0{,}082\\ \\text{atm}\\cdot\\text{L}\\cdot\\text{mol}^{-1}\\cdot\\text{K}^{-1}$.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2023-coincidentes.pdf"
      },
      {
        id: "q-2023-coincidentes-A-5",
        año: 2023,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "A.5",
        enunciado: `Se construye una pila formada por un electrodo de Cr (s) sumergido en una disolución de $\\text{Cr}^{3+}$ (ac), un
electrodo de Ni (s) sumergido en una disolución de $\\text{Ni}^{2+}$ (ac) y un puente salino:
a) (0,5 puntos) Escriba las reacciones que tienen lugar en el ánodo y en el cátodo, y la reacción iónica final.
b) (0,5 puntos) Escriba la notación de la pila e indique en qué sentido circula la corriente en el conductor
eléctrico.
c) (0,5 puntos) Determine el potencial de dicha pila y explique para qué sirve el puente salino.
d) (0,5 puntos) Razone si es una buena elección utilizar una varilla de Cr(s) para agitar una disolución de
$\\text{NiSO}_4$.
Datos. $E^0(V)$: $\\text{Cr}^{3+}/\\text{Cr} = -0{,}74$; $\\text{Ni}^{2+}/\\text{Ni} = -0{,}25$.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2023-coincidentes.pdf"
      },
      {
        id: "q-2023-coincidentes-B-1",
        año: 2023,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "B.1",
        enunciado: `Para las moléculas $\\text{CO}_2$ y $\\text{H}_2\\text{O}$
a) (0,5 puntos) Indique su geometría molecular según la teoría RPECV.
b) (0,5 puntos) Indique la hibridación que presenta el átomo central.
c) (1 punto) Justifique su polaridad y diga el tipo de fuerzas intermoleculares que presentan.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2023-coincidentes.pdf"
      },
      {
        id: "q-2023-coincidentes-B-2",
        año: 2023,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "B.2",
        enunciado: `Formule los siguientes compuestos, indique qué tipo/s de isomería/s presentan.
a) (0,5 puntos) Butano y metilpropano.
b) (0,5 puntos) Pent-2-en-1-ol y 3-metilbut-2-en-2-ol.
c) (0,5 puntos) Propanal y propanona.
d) (0,5 puntos) Etilmetil éter y propan-2-ol.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2023-coincidentes.pdf"
      },
      {
        id: "q-2023-coincidentes-B-3",
        año: 2023,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "B.3",
        enunciado: `A una temperatura determinada la constante cinética de la reacción en fase gaseosa $\\text{A} \\rightarrow \\text{P}$ es
$k = 5\\ \\text{L}\\cdot\\text{mol}^{-1}\\cdot\\text{s}^{-1}$.
a) (0,5 puntos) Determine el orden total de la reacción y justifique si se trata de una reacción elemental.
b) (0,5 puntos) Escriba la ecuación cinética y calcule la velocidad de la reacción cuando [A] = 0,1 M.
c) (0,5 puntos) Si las energías de activación de las reacciones directa e inversa son $E_a^d = 130\\ \\text{kJ}$ y
$E_a^i = 450\\ \\text{kJ}$, justifique si la reacción directa es exotérmica o endotérmica.
d) (0,5 puntos) Justifique, utilizando la ecuación de Arrhenius, cómo afecta a la constante cinética y a la
velocidad de la reacción un aumento de temperatura.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2023-coincidentes.pdf"
      },
      {
        id: "q-2023-coincidentes-B-4",
        año: 2023,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "B.4",
        enunciado: `Para la sal acetato de plata, $\\text{AgCH}_3\\text{COO}$:
a) (0,5 puntos) Formule el equilibrio de solubilidad, detallando el estado de las especies, y calcule la
solubilidad en $\\text{mol}\\cdot\\text{L}^{-1}$.
b) (0,5 puntos) Razone cómo varía la solubilidad de una disolución saturada de acetato de plata en agua si
se le adicionan unas gotas de disolución de sulfato de plata.
c) (1 punto) Calcule si precipitará acetato de plata al mezclar 100 mL de disolución de nitrato de plata 1,5 M
con 50 mL de ácido acético 1,5 M. Suponga volúmenes aditivos.
Datos. $K_s(\\text{AgCH}_3\\text{COO}) = 2{,}3 \\cdot 10^{-3}$; $K_a(\\text{CH}_3\\text{COOH}) = 1{,}8 \\cdot 10^{-5}$.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2023-coincidentes.pdf"
      },
      {
        id: "q-2023-coincidentes-B-5",
        año: 2023,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "B.5",
        enunciado: `La siguiente reacción redox tiene lugar en medio ácido: $\\text{MnO}_4^- + \\text{Ag} + \\text{H}^+ \\rightarrow \\text{Mn}^{2+} + \\text{Ag}^+ + \\text{H}_2\\text{O}$
a) (1 punto) Utilizando el método del ion electrón escriba ajustadas las semirreacciones de oxidación y
reducción y la reacción iónica.
b) (1 punto) Calcule los gramos de plata metálica que podrían ser oxidados por 50 mL de una disolución
acuosa de $\\text{MnO}_4^-$ 0,20 M.
Dato. Masa atómica (u): Ag = 107,9.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2023-coincidentes.pdf"
      }
    ]
  },
  {
    id: 2026,
    año: 2026,
    tipo: "Ordinaria",
    asignatura: "Química",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "q-2026-A-1",
        año: 2026,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta1",
        label: "Redox, electroquímica y solubilidad",
        numero: "1",
        enunciado: `En un laboratorio de materiales se estudia la corrosión del cobre en presencia de ácido nítrico diluido,
porque esta reacción es la responsable tanto de la disolución de cobre metálico en procesos industriales
como de la generación de óxidos de nitrógeno contaminantes. En el proceso de corrosión, el cobre metálico
reacciona con el ácido nítrico dando lugar a nitrato de cobre(II), óxido de nitrógeno(II) y agua.
a) (1 punto) Ajuste la reacción molecular por el método del ion electrón, indicando cuáles son las
semirreacciones de oxidación y reducción.
b) (0,5 puntos) A partir de la reacción del apartado anterior, un estudiante propone reproducir el proceso
de corrosión del cobre en una celda electroquímica formada por un electrodo de Cu y otro electrodo
inerte de platino, ambos sumergidos en una disolución de $\\text{HNO}_3$ 1 M. Identifique el ánodo y el cátodo
especificando en qué electrodo tiene lugar la oxidación y en cuál la reducción y calcule el potencial
estándar de la pila.
c) (1 punto) Por motivos medioambientales, es importante reducir la cantidad de iones $\\text{Cu}^{2+}$ presentes en
disoluciones acuosas. Se sabe que si añadimos una disolución de NaOH de pH = 9,0, se puede formar
un precipitado de $\\text{Cu(OH)}_2$, lo que permite eliminar el cobre por filtración.
Escriba la ecuación química del equilibrio de solubilidad de $\\text{Cu(OH)}_2$, indicando el estado físico de cada
especie. Determine la concentración molar de iones $\\text{Cu}^{2+}$ a partir de la cual comienza a precipitar
$\\text{Cu(OH)}_2$ al añadir la disolución de NaOH de pH = 9,0 a 25 ºC.
Datos. $E^\\circ(V)$: $(\\text{Cu}^{2+}/\\text{Cu}) = 0{,}34$; $(\\text{NO}_3^-/\\text{NO}) = 0{,}96$. A 25 ºC, $K_s(\\text{Cu(OH)}_2) = 2{,}2 \\cdot 10^{-20}$.`,
        puntuacion: 2.5,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2026.pdf"
      },
      {
        id: "q-2026-A-2",
        año: 2026,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta2",
        label: "Enlace químico",
        numero: "2A",
        enunciado: `Considere los siguientes compuestos: LiF, $\\text{PCl}_3$, $\\text{CH}_3\\text{Br}$ y LiI.
a) (1 punto) Para los compuestos covalentes, indique la geometría molecular según la teoría de repulsión
de los pares de electrones de la capa de valencia (TRPECV), y la hibridación del átomo central.
Justifique la polaridad.
b) (1 punto) Justifique cuál de los sólidos iónicos tiene mayor energía de red, suponiendo que todos
cristalizan con el mismo tipo de red.
c) (0,5 puntos) Explique razonadamente qué tipo de interacciones hay que vencer en cada uno de los
siguientes procesos: i) ebullición del $\\text{CH}_3\\text{Br}$, ii) fusión del LiF.`,
        puntuacion: 2.5,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2026.pdf"
      },
      {
        id: "q-2026-A-3",
        año: 2026,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta3",
        label: "Química orgánica",
        numero: "3A",
        enunciado: `Conteste de forma razonada las siguientes cuestiones:
a) (1 punto) Nombre los siguientes compuestos e identifique el grupo funcional principal.
(1) $\\text{CH}_3-\\text{CH}_2-\\text{CH}_2\\text{OH}$  (3) $\\text{CH}_3-\\text{COO}-\\text{CH}_3$  (5) $\\text{CH}_3-\\text{CH}_2-\\text{CHO}$
(2) $(\\text{CH}_3)_3-\\text{N}$  (4) $\\text{CH}_3-\\text{CH}=\\text{CH}_2$
b) (1 punto) Escriba las reacciones correspondientes a los procesos siguientes:
i) Obtención del compuesto (1) a partir de un aldehído.
ii) Obtención del compuesto (4) a partir de un alcohol primario.
iii) Obtención del compuesto (3).
iv) Obtención de un polímero a partir del compuesto (4).
c) (0,5 puntos) Formule y nombre los dos isómeros geométricos cis y trans con la misma fórmula molecular
que la del compuesto (5).`,
        puntuacion: 2.5,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2026.pdf"
      },
      {
        id: "q-2026-A-4",
        año: 2026,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta4",
        label: "Termodinámica y cinética",
        numero: "4A",
        enunciado: `Se pretende sintetizar metanol líquido, $\\text{CH}_3\\text{OH}$, mediante la reacción del monóxido de carbono con
hidrógeno molecular.
a) (1 punto) Escriba la ecuación química ajustada detallando el estado de las especies, y calcule la energía
de Gibbs estándar de la reacción a 25 °C.
b) (0,5 puntos) A 25 °C, la reacción de síntesis de metanol es termodinámicamente posible, pero
cinéticamente muy lenta. Justifique razonadamente cuál o cuáles de las siguientes propuestas aumentan
la velocidad de reacción:
i) Uso de un catalizador adecuado.
ii) Aumento de la temperatura de operación.
iii) Aumento de las presiones parciales de los reactivos.
c) (1 punto) En un experimento se han sintetizado 145 mL de metanol de densidad $0{,}786\\ \\text{g}\\cdot\\text{cm}^{-3}$.
Suponiendo que el rendimiento de la reacción es del 87,0 %, calcule el volumen de hidrógeno que ha
reaccionado, medido a 25 ºC y 0,980 atm.
Datos. A 298 K, $\\Delta H_f^\\circ(\\text{kJ}\\cdot\\text{mol}^{-1})$: $\\text{CH}_3\\text{OH}(l) = -238{,}7$; $\\text{CO}(g) = -110{,}5$. $S^\\circ(\\text{J}\\cdot\\text{mol}^{-1}\\cdot\\text{K}^{-1})$:
$\\text{CH}_3\\text{OH}(l) = 126{,}8$; $\\text{CO}(g) = 197{,}7$; $\\text{H}_2(g) = 130{,}7$. $R = 0{,}0820\\ \\text{atm}\\cdot\\text{L}\\cdot\\text{mol}^{-1}\\cdot\\text{K}^{-1}$.
Masas atómicas (u): H = 1,0; C = 12,0; O = 16,0.`,
        puntuacion: 2.5,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2026.pdf"
      },
      {
        id: "q-2026-B-1",
        año: 2026,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta1",
        label: "Redox, electroquímica y solubilidad",
        numero: "1",
        enunciado: `En un laboratorio de materiales se estudia la corrosión del cobre en presencia de ácido nítrico diluido,
porque esta reacción es la responsable tanto de la disolución de cobre metálico en procesos industriales
como de la generación de óxidos de nitrógeno contaminantes. En el proceso de corrosión, el cobre metálico
reacciona con el ácido nítrico dando lugar a nitrato de cobre(II), óxido de nitrógeno(II) y agua.
a) (1 punto) Ajuste la reacción molecular por el método del ion electrón, indicando cuáles son las
semirreacciones de oxidación y reducción.
b) (0,5 puntos) A partir de la reacción del apartado anterior, un estudiante propone reproducir el proceso
de corrosión del cobre en una celda electroquímica formada por un electrodo de Cu y otro electrodo
inerte de platino, ambos sumergidos en una disolución de $\\text{HNO}_3$ 1 M. Identifique el ánodo y el cátodo
especificando en qué electrodo tiene lugar la oxidación y en cuál la reducción y calcule el potencial
estándar de la pila.
c) (1 punto) Por motivos medioambientales, es importante reducir la cantidad de iones $\\text{Cu}^{2+}$ presentes en
disoluciones acuosas. Se sabe que si añadimos una disolución de NaOH de pH = 9,0, se puede formar
un precipitado de $\\text{Cu(OH)}_2$, lo que permite eliminar el cobre por filtración.
Escriba la ecuación química del equilibrio de solubilidad de $\\text{Cu(OH)}_2$, indicando el estado físico de cada
especie. Determine la concentración molar de iones $\\text{Cu}^{2+}$ a partir de la cual comienza a precipitar
$\\text{Cu(OH)}_2$ al añadir la disolución de NaOH de pH = 9,0 a 25 ºC.
Datos. $E^\\circ(V)$: $(\\text{Cu}^{2+}/\\text{Cu}) = 0{,}34$; $(\\text{NO}_3^-/\\text{NO}) = 0{,}96$. A 25 ºC, $K_s(\\text{Cu(OH)}_2) = 2{,}2 \\cdot 10^{-20}$.`,
        puntuacion: 2.5,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2026.pdf"
      },
      {
        id: "q-2026-B-2",
        año: 2026,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta2",
        label: "Estructura atómica",
        numero: "2B",
        enunciado: `La configuración electrónica de un elemento X es $[\\text{Ne}]ns^1$.
a) (1 punto) Indique el valor de "n", el nombre y símbolo del elemento X, así como el grupo y el período a
los que pertenece. Razone cómo varía la energía de ionización a lo largo de un grupo de la tabla periódica.
b) (0,5 puntos) Justifique cuál es el catión más estable que puede formar el elemento X. Indique un catión
divalente, un elemento neutro y un anión monovalente que sean isoelectrónicos con el catión más estable
del elemento X.
c) (0,5 puntos) Si el electrón más externo del elemento X es excitado del orbital ns al orbital np, ¿cómo
cambian sus números cuánticos? Explique si se trata de una absorción o de una emisión.
d) (0,5 puntos) Calcule la energía, en electronvoltios, asociada a la transición electrónica anterior, sabiendo
que la longitud de onda de la radiación implicada es de 766,5 nm.
Datos. $h = 6{,}626 \\cdot 10^{-34}\\ \\text{J}\\cdot\\text{s}^{-1}$; $c = 3{,}00 \\cdot 10^{8}\\ \\text{m}\\cdot\\text{s}^{-1}$; $1\\ \\text{eV} = 1{,}602 \\cdot 10^{-19}\\ \\text{J}$.`,
        puntuacion: 2.5,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2026.pdf"
      },
      {
        id: "q-2026-B-3",
        año: 2026,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta3",
        label: "Química orgánica",
        numero: "3B",
        enunciado: `Responda a las siguientes cuestiones:
a) (1 punto) Escriba la reacción de polimerización del alqueno obtenido en la reacción entre el etino y el
HCl. Nombre el monómero y el polímero.
b) (1,5 puntos) Complete las siguientes reacciones con el producto mayoritario, formulando los compuestos
de partida, y nombrando y formulando los compuestos orgánicos A, B, C, D y E.
i) Propan-1-ol $\\rightarrow$ A (oxidación) $\\rightarrow$ B (oxidación)
ii) Etanol + B $\\rightarrow$ C
iii) Butan-2-ol $+ \\text{H}_2\\text{SO}_4$ conc./calor $\\rightarrow$ D $+ \\text{HBr} \\rightarrow$ E`,
        puntuacion: 2.5,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2026.pdf"
      },
      {
        id: "q-2026-B-4",
        año: 2026,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta4",
        label: "Equilibrio ácido-base",
        numero: "4B",
        enunciado: `Conteste a las siguientes cuestiones:
a) (0,5 puntos) En una planta industrial de síntesis de amoniaco se preparan disoluciones para su
comercialización mezclándolo con agua. Calcule la molaridad de la disolución de amoniaco comercial
preparada sabiendo que se almacena en botellas de 1,0 L, al 8,0% en masa, y siendo la densidad de la
disolución de $0{,}85\\ \\text{g}\\cdot\\text{cm}^{-3}$.
b) (1 punto) Calcule el pH y el grado de disociación de la disolución del apartado anterior.
c) (1 punto) Se hacen reaccionar 15,00 mL de una disolución acuosa de HCl 2,50 M con 25,00 mL de otra
disolución acuosa de NaOH 1,70 M, ambas a 25 °C. Escriba la ecuación de la reacción que ocurre y calcule
el pH de la disolución resultante. Considere volúmenes aditivos.
Datos. A 25 ºC, $K_b(\\text{NH}_3) = 1{,}8 \\cdot 10^{-5}$. Masas atómicas (u): H = 1,0; N = 14,0.`,
        puntuacion: 2.5,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2026.pdf"
      }
    ]
  },
  {
    id: 20183,
    año: 2018,
    tipo: "Modelo",
    asignatura: "Química",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "q-2018-modelo-A-1",
        año: 2018,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "A.1",
        enunciado: `Considere las sustancias $\\text{I}_2$, Cu y CaO y conteste razonadamente:
a) Qué tipo de enlace presenta cada una de ellas.
b) Cuál tiene menor punto de fusión.
c) Cuál conduce la electricidad cuando está fundido pero es aislante en estado sólido.
d) Si cada una de las sustancias del enunciado es o no soluble en agua.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2018-modelo.pdf"
      },
      {
        id: "q-2018-modelo-A-2",
        año: 2018,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "A.2",
        enunciado: `La solubilidad del carbonato de plata, a 25 °C, es 0,0318 g·L$^{-1}$.
a) Escriba el equilibrio de solubilidad de esta sal en agua.
b) Calcule la concentración molar de ion plata en una disolución saturada de carbonato de plata, a 25 °C.
c) Calcule la constante del producto de solubilidad del carbonato de plata a 25 °C.
d) Explique, con un ejemplo, cómo variará la solubilidad de esta sal por efecto de un ion común.
Datos. Masas atómicas: C = 12,0; O = 16,0; Ag = 107,9.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2018-modelo.pdf"
      },
      {
        id: "q-2018-modelo-A-3",
        año: 2018,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "A.3",
        enunciado: `Escriba la fórmula semidesarrollada y el nombre de dos posibles compuestos que tengan 4 carbonos y contengan en su estructura:
a) Un grupo éter.
b) Un grupo alcohol en un cicloalcano.
c) Un grupo ester.
d) Un grupo halógeno y un triple enlace en una cadena lineal.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2018-modelo.pdf"
      },
      {
        id: "q-2018-modelo-A-4",
        año: 2018,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "A.4",
        enunciado: `Se hace pasar una corriente de 1,8 A durante 1,5 horas a través de 500 mL de una disolución de yoduro de cobalto(II) 0,3 M. Se observa que se deposita metal y se forma yodo molecular.
a) Escriba las semirreacciones de oxidación y reducción que se producen en el cátodo y en el ánodo.
b) Calcule la masa de metal depositada.
c) Calcule la concentración de $\\text{Co}^{2+}$ que queda en disolución.
d) Calcule la masa de yodo molecular obtenida.
Datos. F = 96485 C. Masas atómicas: Co = 59; I = 127.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2018-modelo.pdf"
      },
      {
        id: "q-2018-modelo-A-5",
        año: 2018,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "A.5",
        enunciado: `Se dispone de una disolución de ácido metanoico 0,5 M. Calcule:
a) El pH de la disolución.
b) El grado de disociación de la base BOH 0,3 M que presenta un pOH igual que el pH de la disolución de ácido metanoico.
c) El volumen de base BOH 0,3 M necesario para neutralizar una disolución de ácido metanoico obtenida al mezclar 50 mL de la disolución del enunciado con 150 mL de agua.
Dato. $K_a = 1{,}85 \\cdot 10^{-5}$.
Puntuación máxima por apartado: 0,75 puntos apartados a) y b); 0,5 puntos apartado c).`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2018-modelo.pdf"
      },
      {
        id: "q-2018-modelo-B-1",
        año: 2018,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "B.1",
        enunciado: `Considere los cuatro elementos con la siguiente configuración electrónica en los niveles de energía más externos: A: $2s^22p^4$; B: $2s^2$; C: $3s^23p^2$; D: $3s^23p^5$.
a) Identifique los cuatro elementos con nombre y símbolo. Indique grupo y periodo al que pertenecen.
b) Indique un catión y un anión que sean isoelectrónicos con $\\text{A}^{2-}$.
c) Justifique si la segunda energía de ionización para el elemento A es superior o inferior a la primera.
d) En el espectro del átomo hidrógeno hay una línea situada a 434 nm. Calcule $\\Delta E$, en kJ·mol$^{-1}$, para la transición asociada a esa línea.
Datos. $h = 6{,}62 \\cdot 10^{-34}$ J·s; $N_A = 6{,}023 \\cdot 10^{23}$; $c = 3{,}00 \\cdot 10^8$ m·s$^{-1}$.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2018-modelo.pdf"
      },
      {
        id: "q-2018-modelo-B-2",
        año: 2018,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "B.2",
        enunciado: `Sabiendo que la reacción ajustada $2\\text{A} + \\text{B} \\rightarrow \\text{P}$ es elemental:
a) Escriba la ley de velocidad para dicha reacción.
b) Determine los órdenes parciales de reacción respecto a ambos reactivos, el orden total y las unidades de la constante cinética.
c) ¿Cuál es la molecularidad de la reacción?
d) Explique cómo afecta a la velocidad de la reacción un aumento de la temperatura.
Puntuación máxima por apartado: 0,5 puntos cada apartado.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2018-modelo.pdf"
      },
      {
        id: "q-2018-modelo-B-3",
        año: 2018,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "B.3",
        enunciado: `Escriba las reacciones que tendrían lugar entre but–3–en–1–ol y cada uno de los siguientes reactivos. Indique en cada caso de qué tipo de reacción se trata y nombre los productos obtenidos.
a) Ácido sulfúrico y calor.
b) Ácido clorhídrico.
c) $\\text{KMnO}_4$ (oxidante).
d) Ácido etanoico en medio ácido.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2018-modelo.pdf"
      },
      {
        id: "q-2018-modelo-B-4",
        año: 2018,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "B.4",
        enunciado: `Cuando se introducen 2 mol de A y 2 mol de B en un recipiente de 20 L y se calienta a 600 ºC, se establece el siguiente equilibrio: $\\text{A}(g) + \\text{B}(g) \\rightleftharpoons \\text{C}(g)$, con una constante $K_p = 0{,}42$. Calcule:
a) La constante $K_c$.
b) Las concentraciones de A, B y C en el equilibrio.
c) Las presiones parciales de A, B y C en el equilibrio.
d) Justifique hacia dónde se desplazaría el equilibrio si aumentase la presión total.
Dato. $R = 0{,}082$ atm·L·K$^{-1}$·mol$^{-1}$.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2018-modelo.pdf"
      },
      {
        id: "q-2018-modelo-B-5",
        año: 2018,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "B.5",
        enunciado: `Cuando el yodo molecular reacciona con el ácido nítrico se produce $\\text{HIO}_3$, dióxido de nitrógeno y agua.
a) Escriba y ajuste las semirreacciones de oxidación y reducción que tienen lugar.
b) Escriba, ajustadas, la reacción iónica global y la reacción molecular global.
c) Calcule el volumen de ácido nítrico del 65% de riqueza en masa y densidad 1,5 g·cm$^{-3}$ que reacciona con 25,4 g de yodo molecular.
d) Calcule el volumen de dióxido de nitrógeno gaseoso que se produce con los datos del apartado anterior, medido a 20 ºC y 684 mm de Hg.
Datos. $R = 0{,}082$ atm·L·K$^{-1}$·mol$^{-1}$. Masas atómicas: H = 1; N = 14; O = 16; I = 127.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2018-modelo.pdf"
      }
    ]
  },
  {
    id: 20193,
    año: 2019,
    tipo: "Modelo",
    asignatura: "Química",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "q-2019-modelo-A-1",
        año: 2019,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "A.1",
        enunciado: `Considere las sustancias $\\text{Cl}_2$, $\\text{NH}_3$, Mg y NaBr.
a) Justifique el tipo de enlace presente en cada una de ellas.
b) Explique si conducen la corriente eléctrica a temperatura ambiente.
c) Escriba las estructuras de Lewis de aquellas que sean covalentes.
d) Justifique si $\\text{NH}_3$ puede formar enlace de hidrógeno.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2019-modelo.pdf"
      },
      {
        id: "q-2019-modelo-A-2",
        año: 2019,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "A.2",
        enunciado: `La solubilidad del cromato de plata en agua a 25ºC es 0,00435 g/100 mL.
a) Escriba el equilibrio de solubilidad en agua del cromato de plata, indicando los estados de cada especie.
b) Calcule el producto de solubilidad de la sal a 25 ºC.
c) Calcule si se formará precipitado cuando se mezclan 20 mL de cromato de sodio 0,8 M con 300 mL de nitrato de plata 0,5 M. Considere los volúmenes aditivos.
Datos: Masas atómicas: O = 16,0; Cr = 52,0; Ag = 107,8.
Puntuación máxima por apartado: 0,5 puntos a); 0,75 puntos b) y c).`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2019-modelo.pdf"
      },
      {
        id: "q-2019-modelo-A-3",
        año: 2019,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "A.3",
        enunciado: `Se toman 2 mL de una disolución de ácido nítrico 0,1 M y se añade el agua necesaria para preparar 250 mL de una nueva disolución. Calcule:
a) El pH de esta nueva disolución.
b) La concentración de una disolución de ácido etanoico que tiene el mismo pH que la disolución del apartado anterior.
c) El volumen de una disolución de hidróxido de sodio 0,2 M que se necesita para neutralizar 10 mL de la disolución de ácido nítrico 0,1 M.
Datos: $pK_a$ (ácido etanoico) = 4,74.
Puntuación máxima por apartado: 0,75 puntos a) y b); 0,5 puntos c).`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2019-modelo.pdf"
      },
      {
        id: "q-2019-modelo-A-4",
        año: 2019,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "A.4",
        enunciado: `El aminoácido valina es el ácido 2−amino−3−metilbutanoico.
a) Escriba su fórmula semidesarrollada.
b) Formule y nombre un compuesto que sea isómero de cadena de la valina.
c) Escriba la reacción de la valina con el metanol, nombre el producto orgánico formado e indique a qué tipo de reacción corresponde.
d) Formule y nombre el compuesto que resulta al sustituir el grupo amino por un grupo hidroxilo en la valina.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2019-modelo.pdf"
      },
      {
        id: "q-2019-modelo-A-5",
        año: 2019,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "A.5",
        enunciado: `En una celda electrolítica conteniendo $\\text{CuCl}_2$ fundido se hace pasar una cierta cantidad de corriente durante 2 horas, observándose que se deposita cobre metálico y se desprende cloro.
a) Disocie la sal y escriba ajustadas las reacciones que se producen en el ánodo y en el cátodo.
b) Determine la intensidad de corriente necesaria para depositar 15,9 g de cobre.
c) Calcule el volumen de cloro obtenido a 25 ºC y 1 atm.
Datos. Masa atómica: Cu = 63,5. F = 96485 C. $R = 0{,}082$ atm·L·mol$^{-1}$·K$^{-1}$.
Puntuación máxima por apartado: 0,5 puntos a); 0,75 puntos b) y c).`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2019-modelo.pdf"
      },
      {
        id: "q-2019-modelo-B-1",
        año: 2019,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "B.1",
        enunciado: `Considere las configuraciones electrónicas de tres elementos A: $1s^22s^22p^63s^23p^4$; B: $1s^22s^22p^63s^23p^5$ y C: $1s^22s^22p^63s^1$.
a) Indique para cada elemento el grupo, el periodo, el nombre y el símbolo.
b) Defina primera energía de ionización y justifique en cuál de los tres elementos es menor.
c) En el espectro de emisión del átomo de hidrógeno hay una línea situada en la zona visible cuya energía asociada es 291,87 kJ·mol$^{-1}$. Calcule a qué transición corresponde.
Datos. $h = 6{,}626 \\cdot 10^{-34}$ J·s; $N_A = 6{,}022 \\cdot 10^{23}$ mol$^{-1}$; $R_H = 2{,}180 \\cdot 10^{-18}$ J; $R_H = 1{,}097 \\cdot 10^7$ m$^{-1}$; $c = 3 \\cdot 10^8$ m·s$^{-1}$.
Puntuación máxima por apartado: 0,75 puntos a) y c); 0,5 puntos b).`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2019-modelo.pdf"
      },
      {
        id: "q-2019-modelo-B-2",
        año: 2019,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "B.2",
        enunciado: `Complete las siguientes reacciones formulando los reactivos y el producto mayoritario. Nombre el producto e identifique el tipo de reacción al que corresponden.
a) Metilbut−2−eno + HBr →
b) Ácido metanoico + propan−2−ol →
c) Ácido butanoico + reductor fuerte/ácido →
d) Pentan−2−ol + $\\text{H}_2\\text{SO}_4$/calor →
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2019-modelo.pdf"
      },
      {
        id: "q-2019-modelo-B-3",
        año: 2019,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "B.3",
        enunciado: `Tras estudiar la reacción en fase gaseosa $\\text{A} + 2\\text{B} \\rightarrow 2\\text{C}$, se ha determinado que si se duplica la concentración de A, manteniendo constante la de B, la velocidad se duplica y si se duplica la concentración de B, manteniendo constante la de A, la velocidad se multiplica por 4.
a) Obtenga razonadamente la ecuación de velocidad para dicha reacción.
b) Justifique si la reacción puede ser elemental.
c) Obtenga las unidades de la constante de velocidad.
d) Explique cómo afecta a la velocidad de la reacción la presencia de un catalizador.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2019-modelo.pdf"
      },
      {
        id: "q-2019-modelo-B-4",
        año: 2019,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "B.4",
        enunciado: `En medio básico el permanganato de potasio reacciona con el sulfito de potasio, dando dióxido de manganeso, sulfato de potasio e hidróxido de potasio.
a) Escriba las semirreacciones ajustadas que tienen lugar e indique cuál es el oxidante y cuál el reductor.
b) Escriba ajustadas la reacción iónica global y la reacción molecular global.
c) Calcule el volumen de una disolución de permanganato de potasio 0,25 M que reacciona con 20 mL de una disolución de sulfito de potasio 0,33 M.
Puntuación máxima por apartado: 0,75 puntos a) y c); 0,5 puntos b).`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2019-modelo.pdf"
      },
      {
        id: "q-2019-modelo-B-5",
        año: 2019,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "B.5",
        enunciado: `En un recipiente cerrado, se calienta a 182 ºC pentacloruro de arsénico gaseoso que se disocia en tricloruro de arsénico gaseoso y en cloro molecular. En el equilibrio y a una presión total de 1 atm, el pentacloruro de arsénico se disocia un 29,2 %. Calcule:
a) Las presiones parciales de los tres gases en el equilibrio.
b) $K_c$ y $K_p$.
c) Las concentraciones molares de todas las sustancias en el equilibrio.
Dato: $R = 0{,}082$ atm·L·mol$^{-1}$·K$^{-1}$.
Puntuación máxima por apartado: 0,75 puntos a) y b); 0,5 puntos c).`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2019-modelo.pdf"
      }
    ]
  },
  {
    id: 20203,
    año: 2020,
    tipo: "Modelo",
    asignatura: "Química",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "q-2020-modelo-A-1",
        año: 2020,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "A.1",
        enunciado: `Considere los elementos X (Z = 9), Y (Z = 12) y Z (Z = 16).
a) Escriba su configuración electrónica e indique el número de electrones de la capa de valencia.
b) Identifíquelos con su nombre y símbolo. Determine grupo y periodo de cada elemento e indique si se trata de un metal o no metal.
c) Para cada uno de los elementos, justifique cuál es su ion más estable.
d) Formule el compuesto binario formado por los elementos X e Y, nómbrelo e indique el tipo de enlace que presenta.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2020-modelo.pdf"
      },
      {
        id: "q-2020-modelo-A-2",
        año: 2020,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "A.2",
        enunciado: `Para los ácidos cloroetanoico, benzoico y propanoico:
a) Escriba la fórmula semidesarrollada de cada uno de los ácidos indicados.
b) Justifique cuál de los tres es el ácido más fuerte.
c) Justifique si la disolución formada tras valorar cada uno de los ácidos con NaOH tiene pH ácido, básico o neutro.
d) Calcule el pH de una disolución 0,2 M de ácido benzoico.
Datos. $K_a$ (ácido cloroetanoico) = $1{,}3 \\cdot 10^{-3}$; $K_a$ (ácido benzoico) = $6{,}3 \\cdot 10^{-5}$; $K_a$ (ácido propanoico) = $1{,}3 \\cdot 10^{-5}$.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2020-modelo.pdf"
      },
      {
        id: "q-2020-modelo-A-3",
        año: 2020,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "A.3",
        enunciado: `Se establece el equilibrio $\\text{PCl}_5(g) \\rightleftharpoons \\text{PCl}_3(g) + \\text{Cl}_2(g)$ calentando 10,4 g de pentacloruro de fósforo a 150 ºC en un recipiente de 1 L y se observa que la presión total que se alcanza en el equilibrio es 1,91 atm.
a) Calcule las concentraciones molares de todas las especies en el equilibrio.
b) Calcule las constantes del equilibrio $K_c$ y $K_p$.
c) Justifique cómo afecta a la disociación de $\\text{PCl}_5$ un aumento de la presión del sistema, por reducción de volumen, a temperatura constante.
Datos. $R = 0{,}082$ atm·L·mol$^{-1}$·K$^{-1}$. Masas atómicas: P = 31,0; Cl = 35,5.
Puntuación máxima por apartado: 0,75 puntos apartados a) y b); 0,5 puntos apartado c).`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2020-modelo.pdf"
      },
      {
        id: "q-2020-modelo-A-4",
        año: 2020,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "A.4",
        enunciado: `Partiendo del but−1−eno se lleva a cabo la siguiente serie de reacciones:
i. But−1−eno + agua (ácido sulfúrico diluido) → B (mayoritario) + C (minoritario)
ii. B + oxidante → D
iii. C + ácido etanoico → E
a) Formule cada una de las reacciones y nombre los productos orgánicos formados.
b) Nombre y explique la regla que sigue la primera reacción para que el producto B sea mayoritario.
c) Indique el tipo de reacción en cada caso.
Puntuación máxima por apartado: 1 punto apartado a); 0,5 puntos apartados b) y c).`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2020-modelo.pdf"
      },
      {
        id: "q-2020-modelo-A-5",
        año: 2020,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "A.5",
        enunciado: `Una disolución de permanganato de potasio en medio ácido sulfúrico, oxida al agua oxigenada formándose oxígeno, sulfato de manganeso (II), sulfato de potasio y agua.
a) Formule y ajuste las semirreacciones de oxidación y reducción que tienen lugar.
b) Ajuste las reacciones iónica y molecular globales por el método del ion-electrón.
c) Calcule el volumen de $\\text{O}_2$, medido a 21ºC y 720 mm Hg, que se libera al añadir permanganato de potasio en exceso a 200 mL de peróxido de hidrógeno 0,01 mol·L$^{-1}$.
Datos. $R = 0{,}082$ atm·L·mol$^{-1}$·K$^{-1}$.
Puntuación máxima por apartado: 0,5 puntos apartado a); 0,75 puntos apartados b) y c).`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2020-modelo.pdf"
      },
      {
        id: "q-2020-modelo-B-1",
        año: 2020,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "B.1",
        enunciado: `Dados los siguientes compuestos: $\\text{BCl}_3$, KI y $\\text{NH}_3$.
a) Justifique el tipo de enlace intramolecular presente en cada uno de ellos.
b) Explique si conducen la corriente eléctrica a temperatura ambiente.
c) Dibuje las estructuras de Lewis de aquellos que sean covalentes, e indique su geometría molecular.
d) Justifique si alguno de los tres compuestos forma enlace de hidrógeno.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2020-modelo.pdf"
      },
      {
        id: "q-2020-modelo-B-2",
        año: 2020,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "B.2",
        enunciado: `Dados los compuestos orgánicos: A (cloroeteno), B (1,6-hexanodiamina), C (ácido hexanodioico).
a) Formule los compuestos orgánicos indicados.
b) Formule y nombre el compuesto que resulta de la polimerización de A.
c) Formule y nombre el compuesto que resulta de la polimerización de B con C.
d) Justifique si se trata de polímeros de adición o condensación en cada caso.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2020-modelo.pdf"
      },
      {
        id: "q-2020-modelo-B-3",
        año: 2020,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "B.3",
        enunciado: `Para la reacción endotérmica: $\\text{Sb}_2\\text{O}_5(g) \\rightleftharpoons \\text{Sb}_2\\text{O}_3(g) + \\text{O}_2(g)$, explique cómo evoluciona el equilibrio en cada caso.
a) Disminución de la presión a temperatura constante.
b) Adición de $\\text{Sb}_2\\text{O}_3$ a volumen y temperatura constantes.
c) Adición de un catalizador a presión y temperatura constantes.
d) Aumento de la temperatura.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2020-modelo.pdf"
      },
      {
        id: "q-2020-modelo-B-4",
        año: 2020,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "B.4",
        enunciado: `Se lleva a cabo la electrólisis de una disolución acuosa de sulfato de cobre (II) de concentración $4 \\cdot 10^{-2}$ mol·L$^{-1}$ para obtener cobre metálico.
a) Escriba los procesos que ocurren en el ánodo y en el cátodo y el proceso global ajustado sabiendo que en el ánodo el $\\text{H}_2\\text{O}$ se descompone en $\\text{H}^+$ y $\\text{O}_2$.
b) Calcule el tiempo necesario para depositar todo el cobre contenido en 250 mL de dicha disolución al pasar una corriente de 1,2 A.
c) Determine el volumen de gas desprendido en el ánodo en el proceso del apartado anterior, a 25 ºC y 1,5 atm.
Datos. $R = 0{,}082$ atm·L·mol$^{-1}$·K$^{-1}$; $F = 96485$ C.
Puntuación máxima por apartado: 0,5 puntos apartado a); 0,75 puntos apartados b) y c).`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2020-modelo.pdf"
      },
      {
        id: "q-2020-modelo-B-5",
        año: 2020,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "B.5",
        enunciado: `Una disolución contiene iones fluoruro y sulfato en concentración de $10^{-2}$ mol·L$^{-1}$ de cada ion. A dicha disolución se añade progresivamente otra que contiene iones bario.
a) Escriba los equilibrios de solubilidad de cada sal.
b) Calcule la solubilidad de cada una de ellas en g·L$^{-1}$.
c) Calcule la concentración de iones bario que debe haber en la disolución para que empiece a precipitar cada sal.
d) Indique, razonadamente, cuál será el orden de precipitación.
Datos. $K_s$ (fluoruro de bario) = $2 \\cdot 10^{-6}$; $K_s$ (sulfato de bario) = $10^{-10}$. Masas atómicas: O = 16,0; F = 19,0; S = 32,0; Ba = 137,3.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2020-modelo.pdf"
      }
    ]
  },
  {
    id: 20213,
    año: 2021,
    tipo: "Modelo",
    asignatura: "Química",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "q-2021-modelo-A-1",
        año: 2021,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "A.1",
        enunciado: `Considere los elementos cuyas configuraciones electrónicas son: A: $1s^22s^22p^4$; B: $1s^22s^2$; C: $1s^22s^22p^63s^23p^2$; D: $1s^22s^22p^63s^23p^5$.
a) Identifique el nombre y símbolo de cada elemento, e indique el grupo y periodo a los que pertenece.
b) Para los elementos A y B, justifique cuál de ellos tiene mayor radio atómico.
c) Indique el estado o estados de oxidación más probable(s) de cada elemento.
d) Justifique qué elemento, C ó D, tiene mayor energía de ionización.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2021-modelo.pdf"
      },
      {
        id: "q-2021-modelo-A-2",
        año: 2021,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "A.2",
        enunciado: `Se introducen 46,0 g de tetraóxido de dinitrógeno en un recipiente de 1,00 L a 359,5 K y se cierra. Cuando se alcanza el equilibrio, $\\text{N}_2\\text{O}_4(g) \\rightleftharpoons 2\\text{NO}_2(g)$, la presión parcial de $\\text{NO}_2$ es 10,0 atm.
a) Calcule la presión total de la mezcla en el equilibrio.
b) Calcule $K_p$ y $K_c$.
c) Si aumenta la presión, por disminución de volumen, ¿en qué sentido se desplaza el equilibrio?
Datos. Masas atómicas: N = 14; O = 16. $R = 0{,}082$ atm·L·mol$^{-1}$·K$^{-1}$.
Puntuación máxima por apartado: 0,75 puntos apartados a) y b); 0,5 puntos apartado c).`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2021-modelo.pdf"
      },
      {
        id: "q-2021-modelo-A-3",
        año: 2021,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "A.3",
        enunciado: `Justifique si las siguientes afirmaciones son verdaderas o falsas.
a) La deshidratación de un alcohol con ácido sulfúrico en caliente conduce a un alquino.
b) La oxidación de propanal con dicromato de potasio conduce a propan−1−ol.
c) Las amidas se producen por reacción de amoniaco y un compuesto ácido.
d) La polimerización de cloruro de vinilo (cloroeteno) produce polietileno y cloro.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2021-modelo.pdf"
      },
      {
        id: "q-2021-modelo-A-4",
        año: 2021,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "A.4",
        enunciado: `Se disuelven 23,0 g de ácido metanoico en agua hasta obtener 10,0 L de disolución, cuyo pH es 2,52. Calcule:
a) El grado de disociación del ácido metanoico.
b) $K_a$ del ácido metanoico.
c) $K_b$ de la especie conjugada.
d) El volumen de una disolución de hidróxido de potasio 0,20 mol·L$^{-1}$ necesario para neutralizar 10,0 mL de la disolución de ácido metanoico.
Datos. Masas atómicas: H = 1; C = 12; O = 16.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2021-modelo.pdf"
      },
      {
        id: "q-2021-modelo-A-5",
        año: 2021,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "A.5",
        enunciado: `Se construye una celda galvánica con un electrodo de manganeso y un electrodo de plata.
a) Formule las semirreacciones de oxidación y reducción que se producen. Ajuste la reacción global por el método del ion-electrón.
b) Determine el potencial de la celda galvánica.
c) Justifique qué ocurre si se introduce una barra de plata en una disolución de manganeso (II).
Datos. $E^0(V)$: $\\text{Mn}^{2+}/\\text{Mn} = -1{,}18$; $\\text{Ag}^+/\\text{Ag} = 0{,}80$.
Puntuación máxima por apartado: 0,75 puntos apartados a) y c); 0,5 puntos apartado b).`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2021-modelo.pdf"
      },
      {
        id: "q-2021-modelo-B-1",
        año: 2021,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "B.1",
        enunciado: `Considere las moléculas $\\text{BF}_3$ y $\\text{NH}_3$.
a) Escriba su estructura de Lewis.
b) Indique su geometría molecular utilizando la teoría de repulsión de pares de electrones de la capa de valencia.
c) Indique cuál es la hibridación del átomo central de cada una de ellas.
d) Explique la polaridad de ambas moléculas.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2021-modelo.pdf"
      },
      {
        id: "q-2021-modelo-B-2",
        año: 2021,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "B.2",
        enunciado: `Para una reacción del tipo $2\\text{A}(g) + \\text{B}(g) \\rightarrow \\text{C}(g)$ a una temperatura determinada, se han obtenido los siguientes datos:
Experimento 1: $[A]_{inicial} = 0{,}020$ mol·L$^{-1}$; $[B]_{inicial} = 0{,}010$ mol·L$^{-1}$; velocidad inicial $= 0{,}028$ mol·L$^{-1}$·s$^{-1}$.
Experimento 2: $[A]_{inicial} = 0{,}020$ mol·L$^{-1}$; $[B]_{inicial} = 0{,}020$ mol·L$^{-1}$; velocidad inicial $= 0{,}057$ mol·L$^{-1}$·s$^{-1}$.
Experimento 3: $[A]_{inicial} = 0{,}040$ mol·L$^{-1}$; $[B]_{inicial} = 0{,}020$ mol·L$^{-1}$; velocidad inicial $= 0{,}224$ mol·L$^{-1}$·s$^{-1}$.
a) Determine el orden total de la reacción y escriba su ley de velocidad.
b) Calcule la constante de velocidad.
c) Justifique, mediante la ecuación de Arrhenius, cómo afecta a la velocidad de reacción una disminución de temperatura.
d) Explique cómo modifica la energía de activación la adición de un catalizador.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2021-modelo.pdf"
      },
      {
        id: "q-2021-modelo-B-3",
        año: 2021,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "B.3",
        enunciado: `Justifique si el pH de cada una de las disoluciones obtenidas al disolver en agua las siguientes sustancias es ácido, básico o neutro.
a) Fluoruro de amonio.
b) Nitrito de sodio.
c) Nitrato de potasio.
d) Cloruro de amonio.
Datos. $K_a$ (HF) = $6{,}8 \\cdot 10^{-4}$; $K_a$ ($\\text{HNO}_2$) = $4{,}4 \\cdot 10^{-4}$; $K_b$ ($\\text{NH}_3$) = $1{,}8 \\cdot 10^{-5}$.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2021-modelo.pdf"
      },
      {
        id: "q-2021-modelo-B-4",
        año: 2021,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "B.4",
        enunciado: `Nombre y formule los siguientes compuestos:
a) Dos hidrocarburos saturados, isómeros de cadena, de fórmula molecular $\\text{C}_5\\text{H}_{12}$.
b) Dos alcoholes, isómeros de posición, de fórmula molecular $\\text{C}_4\\text{H}_{10}\\text{O}$.
c) Dos isómeros lineales, de fórmula molecular $\\text{C}_4\\text{H}_8\\text{O}_2$ y con un grupo carboxilato.
d) Dos hidrocarburos aromáticos de fórmula molecular $\\text{C}_8\\text{H}_{10}$.
Puntuación máxima por apartado: 0,5 puntos.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2021-modelo.pdf"
      },
      {
        id: "q-2021-modelo-B-5",
        año: 2021,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "B.5",
        enunciado: `En presencia de ácido sulfúrico, el óxido de manganeso (IV) reacciona con el yoduro de potasio y se forma yodo molecular, sulfato de manganeso (II), sulfato de potasio y agua.
a) Escriba y ajuste por el método del ion-electrón las reacciones iónica y molecular.
b) Calcule la masa, en gramos, de yodo molecular que se obtiene si reaccionan 2,0 kg de pirolusita, mineral que contiene un 75% en masa de óxido de manganeso (IV).
Datos. Masas atómicas: O = 16; Mn = 55; I = 127.
Puntuación máxima por apartado: 1 punto.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2021-modelo.pdf"
      }
    ]
  },
  {
    id: 20223,
    año: 2022,
    tipo: "Modelo",
    asignatura: "Química",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "q-2022-modelo-A-1",
        año: 2022,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "A.1",
        enunciado: `Considere los elementos A (Z = 11), B (Z = 15) y C (Z = 17).
a) (0,5 puntos) Escriba la configuración electrónica de cada elemento.
b) (0,5 puntos) Identifíquelos con su nombre, símbolo, grupo y periodo.
c) (0,5 puntos) Justifique cuál es el elemento que tiene menor energía de ionización.
d) (0,5 puntos) Formule y nombre un compuesto binario formado por los elementos B y C en su menor estado de oxidación, e indique el tipo de enlace que presenta.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2022-modelo.pdf"
      },
      {
        id: "q-2022-modelo-A-2",
        año: 2022,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "A.2",
        enunciado: `Responda las siguientes cuestiones:
a) (1 punto) Obtenga el porcentaje de riqueza en masa de una muestra de hidróxido de sodio, sabiendo que 100 g de muestra son neutralizados con 100 mL de una disolución de ácido clorhídrico 12 M.
b) (1 punto) Calcule el pH de una disolución preparada al añadir 22 g de la muestra de hidróxido de sodio del apartado anterior, a 200 mL de una disolución de ácido clorhídrico 2,0 M. Considere que no hay cambio de volumen.
Datos. Masas atómicas (u): H = 1; O = 16; Na = 23.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2022-modelo.pdf"
      },
      {
        id: "q-2022-modelo-A-3",
        año: 2022,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "A.3",
        enunciado: `La reacción en fase gaseosa $\\text{A} + \\text{B} \\rightarrow \\text{C} + \\text{D}$ es exotérmica y su ecuación cinética es $v = k[A]^2$. Justifique si las siguientes afirmaciones son verdaderas o falsas:
a) (0,5 puntos) El reactivo A se consume más deprisa que el B.
b) (0,5 puntos) Un aumento de la presión total produce un aumento en la velocidad de la reacción.
c) (0,5 puntos) Una vez iniciada la reacción, la velocidad es constante si la temperatura no varía.
d) (0,5 puntos) Un aumento de la temperatura disminuye la velocidad de reacción.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2022-modelo.pdf"
      },
      {
        id: "q-2022-modelo-A-4",
        año: 2022,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "A.4",
        enunciado: `Para cada una de las siguientes reacciones, formule y nombre todos los compuestos orgánicos que intervengan:
a) (0,5 puntos) $\\text{CH}_3-\\text{CH}_2-\\text{CHOH}-\\text{CH}_3 + \\text{H}_2\\text{SO}_4$/calor →
b) (0,5 puntos) $\\text{CH}_3\\text{OH} + \\text{CH}_3\\text{COOH} + \\text{H}^+$ →
c) (0,5 puntos) $\\text{CH}_3-\\text{CH}=\\text{CH}-\\text{CH}_3 + \\text{HCl}$ →
d) (0,5 puntos) $\\text{CH}_3-\\text{CH}_2-\\text{COOH} + \\text{NH}_2-\\text{CH}_2-\\text{CH}_3$ →`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2022-modelo.pdf"
      },
      {
        id: "q-2022-modelo-A-5",
        año: 2022,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "A.5",
        enunciado: `Una disolución de dicromato de potasio en medio ácido sulfúrico, reacciona con plata y se forma sulfato de cromo (III), sulfato de plata y sulfato de potasio.
a) (0,5 puntos) Formule y ajuste las semirreacciones de oxidación y reducción que tienen lugar.
b) (0,75 puntos) Ajuste las reacciones iónica y molecular globales por el método del ion-electrón.
c) (0,75 puntos) Calcule el volumen de disolución de ácido sulfúrico de concentración 1,47 g·L$^{-1}$ que se necesita para oxidar 2,16 g de plata.
Datos. Masas atómicas (u): H = 1,0; O = 16,0; S = 32,1; Ag = 107,9.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2022-modelo.pdf"
      },
      {
        id: "q-2022-modelo-B-1",
        año: 2022,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "B.1",
        enunciado: `Para cada una de las siguientes moléculas: $\\text{BCl}_3$, $\\text{BeF}_2$ y $\\text{PH}_3$.
a) (0,5 puntos) Dibuje su estructura de Lewis.
b) (0,5 puntos) Indique la geometría según la TRPEV.
c) (0,5 puntos) Indique la hibridación del átomo central.
d) (0,5 puntos) Justifique su polaridad.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2022-modelo.pdf"
      },
      {
        id: "q-2022-modelo-B-2",
        año: 2022,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "B.2",
        enunciado: `Responda las siguientes cuestiones:
a) (1 punto) Formule la siguiente reacción, indique de qué tipo es, y nombre el producto orgánico obtenido: ácido hexanoico + hexan−1−amina →
b) (1 punto) El nailon 6,6 es una poliamida que se obtiene según la reacción: n(ácido hexanodioico) + n(hexano−1,6−diamina) → Poliamida + $2n\\text{H}_2\\text{O}$.
Nombre el tipo de reacción y detalle el nombre de los grupos funcionales que intervienen en su síntesis.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2022-modelo.pdf"
      },
      {
        id: "q-2022-modelo-B-3",
        año: 2022,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "B.3",
        enunciado: `En un recipiente de 20 L y a 900 ºC, se mezclan 5,0 mol de CO y 10,0 mol de $\\text{H}_2\\text{O}$. Transcurre la reacción $\\text{CO}(g) + \\text{H}_2\\text{O}(g) \\rightleftharpoons \\text{H}_2(g) + \\text{CO}_2(g)$, obteniéndose 4,5 mol de $\\text{CO}_2$. Calcule:
a) (0,5 puntos) Las concentraciones de cada especie en el equilibrio.
b) (0,5 puntos) La presión total.
c) (0,5 puntos) $K_c$ y $K_p$.
d) (0,5 puntos) Explique sin realizar cálculos, cómo se modifica el equilibrio si se añade $\\text{H}_2(g)$.
Dato. $R = 0{,}082$ atm·L·mol$^{-1}$·K$^{-1}$.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2022-modelo.pdf"
      },
      {
        id: "q-2022-modelo-B-4",
        año: 2022,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "B.4",
        enunciado: `Se lleva a cabo la electrólisis de una disolución acuosa de cobre (II).
a) (1 punto) Escriba las reacciones que se producen en el cátodo y en el ánodo y calcule la carga necesaria para depositar 7,5 g de cobre.
b) (1 punto) Si se utiliza la misma carga del apartado anterior para llevar a cabo la electrólisis del agua, ¿qué volumen de hidrógeno se desprende a 33 ºC y 726 mmHg?
Datos. $R = 0{,}082$ atm·L·mol$^{-1}$·K$^{-1}$. $F = 96485$ C·mol$^{-1}$. Masa atómica (u): Cu = 63,5.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2022-modelo.pdf"
      },
      {
        id: "q-2022-modelo-B-5",
        año: 2022,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "B.5",
        enunciado: `Considere disoluciones acuosas de idéntica concentración de los compuestos: HCl, $\\text{NH}_4\\text{I}$, NaBr y KCN.
a) (1 punto) Deduzca, sin hacer cálculos, si las disoluciones son ácidas, básicas o neutras. Escriba las reacciones correspondientes.
b) (1 punto) Ordénelas, razonadamente, en orden creciente de pH.
Datos. $K_a$ (HCN) = $4{,}9 \\cdot 10^{-10}$; $K_b$ ($\\text{NH}_3$) = $1{,}8 \\cdot 10^{-5}$.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2022-modelo.pdf"
      }
    ]
  },
  {
    id: 20233,
    año: 2023,
    tipo: "Modelo",
    asignatura: "Química",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "q-2023-modelo-A-1",
        año: 2023,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "A.1",
        enunciado: `Responda las siguientes cuestiones.
a) (0,75 puntos) Para las moléculas: $\\text{BCl}_3$ y $\\text{NCl}_3$, indique la hibridación del átomo central y su geometría, y justifique su polaridad.
b) (0,75 puntos) Explique los conceptos de sustancias moleculares y sólidos covalentes describiendo los tipos de enlaces y fuerzas intermoleculares que intervienen.
c) (0,5 puntos) Justifique si el bromo tiene mayor punto de fusión que el bromuro de potasio.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2023-modelo.pdf"
      },
      {
        id: "q-2023-modelo-A-2",
        año: 2023,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "A.2",
        enunciado: `Responda las siguientes cuestiones:
a) (0,5 puntos) Formule los siguientes compuestos: 2−cloro−4−metilhexanamida; etinilmetil éter.
b) (1 punto) Complete las siguientes reacciones, diga de qué tipo son, y en su caso, la regla que siguen, y nombre el/los producto/s orgánico/s obtenido/s.
$\\text{CH}_3-\\text{CH}_2-\\text{CH}_2\\text{OH} + \\text{H}_2\\text{SO}_4$/calor →
$\\text{CH}_3-\\text{CH}_2-\\text{CHOH}-\\text{CH}_3 + \\text{H}_2\\text{SO}_4$/calor →
c) (0,5 puntos) Indique el nombre del polímero que se obtiene a partir de cloroeteno, diga el tipo de reacción por la que se forma y formule la unidad repetitiva del polímero.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2023-modelo.pdf"
      },
      {
        id: "q-2023-modelo-A-3",
        año: 2023,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "A.3",
        enunciado: `Responda las siguientes cuestiones:
a) (0,5 puntos) Para las sustancias $\\text{NH}_4^+$, $\\text{Cl}^-$ y HClO, justifique cuáles son sus bases o ácidos conjugados, escribiendo el equilibrio correspondiente según la teoría de Brönsted-Lowry.
b) (0,5 puntos) Para las sustancias $\\text{NH}_4^+$, $\\text{Cl}^-$ y HClO justifique y ordene de menor a mayor basicidad las que son bases y las bases conjugadas de las que son ácidos.
c) (1 punto) Calcule el volumen de disolución acuosa preparada con 2,0 g de HClO para que el pH sea 2.
Datos. $K_a$ (HClO) = $3{,}2 \\cdot 10^{-8}$; $K_b$ ($\\text{NH}_3$) = $1{,}8 \\cdot 10^{-5}$. Masas atómicas (u): H = 1,0; O = 16,0; Cl = 35,5.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2023-modelo.pdf"
      },
      {
        id: "q-2023-modelo-A-4",
        año: 2023,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "A.4",
        enunciado: `Se coloca una muestra de 7,2 g de $\\text{NH}_4\\text{HS}(s)$ en un recipiente de 4,0 L, cerrado al vacío y a 23 ºC. La muestra se descompone alcanzando el equilibrio: $\\text{NH}_4\\text{HS}(s) \\rightleftharpoons \\text{NH}_3(g) + \\text{H}_2\\text{S}(g)$, siendo la presión total de 0,80 atm.
a) (1 punto) Determine la cantidad en mol de cada especie en el equilibrio.
b) (0,5 puntos) Obtenga $K_c$ y $K_p$.
c) (0,5 puntos) Calcule el porcentaje de sólido descompuesto.
Datos. $R = 0{,}082$ atm·L·mol$^{-1}$·K$^{-1}$. Masas atómicas (u): H = 1,0; N = 14,0; S = 32,0.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2023-modelo.pdf"
      },
      {
        id: "q-2023-modelo-A-5",
        año: 2023,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "A.5",
        enunciado: `Se lleva a cabo la electrólisis de bromuro de plomo (II) fundido, utilizando una corriente de 12 A.
a) (0,75 puntos) Ajuste las semirreacciones que tienen lugar en el ánodo, en el cátodo y la reacción iónica global, identificando el electrodo positivo y negativo.
b) (0,5 puntos) Calcule la fuerza electromotriz necesaria para llevar a cabo la electrólisis.
c) (0,75 puntos) Determine el tiempo que debe mantenerse la corriente para obtener 10,0 g de plomo.
Datos. $F = 96485$ C·mol$^{-1}$. Masa atómica (u): Pb = 207,2. $E^0(V)$: $\\text{Br}_2/\\text{Br}^- = 1{,}09$; $\\text{Pb}^{2+}/\\text{Pb} = -0{,}13$.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2023-modelo.pdf"
      },
      {
        id: "q-2023-modelo-B-1",
        año: 2023,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "B.1",
        enunciado: `Responda las siguientes cuestiones:
a) (0,5 puntos) Para el átomo de hidrógeno, calcule la energía del electrón en la segunda órbita, según el modelo atómico de Bohr. Justifique el significado del signo.
b) (1 punto) Haciendo uso de los números cuánticos obtenga razonadamente el número máximo de subniveles, orbitales y electrones que hay en el tercer nivel energético de un átomo.
c) (0,5 puntos) Escriba la configuración electrónica en el estado fundamental del elemento A (Z = 29) y de su ion más estable.
Dato. $R_H = 2{,}18 \\cdot 10^{-18}$ J.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2023-modelo.pdf"
      },
      {
        id: "q-2023-modelo-B-2",
        año: 2023,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "B.2",
        enunciado: `Responda las siguientes cuestiones:
a) (1 punto) Nombre los siguientes compuestos: $\\text{CH}_2=\\text{C}(\\text{CH}_2-\\text{CH}_3)-\\text{CH}(\\text{CH}_3)-\\text{CH}_3$; $\\text{CH}_3-\\text{CH}_2-\\text{NH}_2$; $\\text{CH}_3-\\text{C}(\\text{CH}_3)_2-\\text{CHOH}-\\text{CH}_3$; $\\text{CH}_3-\\text{CO}-\\text{O}-\\text{C}_6\\text{H}_5$.
b) (0,5 puntos) Formule la siguiente reacción, indique de qué tipo es, el nombre de la regla que sigue y del/de los producto/s orgánico/s obtenido/s: $\\text{CH}_3-\\text{CH}=\\text{CH}_2 + \\text{HBr}$ →
c) (0,5 puntos) Esquematice y ajuste la reacción que tiene lugar por la unión sucesiva del monómero etanodiol con el monómero ácido pentanodioico. Detalle como producto la unidad repetitiva. Nombre el tipo de reacción y la clase de polímero que se obtiene.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2023-modelo.pdf"
      },
      {
        id: "q-2023-modelo-B-3",
        año: 2023,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "B.3",
        enunciado: `En la tabla se detallan los resultados experimentales que se obtienen de la velocidad inicial para la reacción: $\\text{A}(ac) + \\text{B}(ac) \\rightarrow \\text{C}(ac)$, con diferentes concentraciones de los reactivos.
Experimento 1: [A] = 0,1 M; [B] = 0,1 M; $v_0 = 4{,}0 \\cdot 10^{-4}$ mol·L$^{-1}$·s$^{-1}$.
Experimento 2: [A] = 0,2 M; [B] = 0,1 M; $v_0 = 1{,}6 \\cdot 10^{-3}$ mol·L$^{-1}$·s$^{-1}$.
Experimento 3: [A] = 0,5 M; [B] = 0,1 M; $v_0 = 1{,}0 \\cdot 10^{-2}$ mol·L$^{-1}$·s$^{-1}$.
Experimento 4: [A] = 0,5 M; [B] = 0,5 M; $v_0 = 1{,}0 \\cdot 10^{-2}$ mol·L$^{-1}$·s$^{-1}$.
a) (1 punto) Calcule los órdenes parciales y total de la reacción.
b) (1 punto) Escriba la ecuación de velocidad y obtenga la constante de velocidad y sus unidades.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2023-modelo.pdf"
      },
      {
        id: "q-2023-modelo-B-4",
        año: 2023,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "B.4",
        enunciado: `Responda las siguientes cuestiones justificando la respuesta:
a) (0,5 puntos) ¿Qué tipo de reacciones tienen $K_c = K_p$?
b) (0,5 puntos) ¿La constante de equilibrio de una reacción aumenta o disminuye por un aumento de temperatura?
c) (0,5 puntos) Escriba la expresión de la constante de equilibrio $K_c$ en función de concentraciones y $K_p$ en función de presiones para la reacción: $2\\text{CaSO}_4(s) \\rightleftharpoons 2\\text{CaO}(s) + 2\\text{SO}_2(g) + \\text{O}_2(g)$.
d) (0,5 puntos) ¿Se modifica el equilibrio de la reacción del apartado c) al realizar la reacción en presencia de un catalizador?`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2023-modelo.pdf"
      },
      {
        id: "q-2023-modelo-B-5",
        año: 2023,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "B.5",
        enunciado: `Se hacen reaccionar 3,3 g de azufre sólido con 15 g de $\\text{K}_2\\text{Cr}_2\\text{O}_7$ en medio básico, para dar $\\text{SO}_2$, $\\text{Cr}_2\\text{O}_3$ y KOH.
a) (0,75 puntos) Ajuste por el método del ion-electrón las semirreacciones de oxidación y reducción, así como las reacciones iónica y molecular.
b) (0,5 puntos) Indique las especies que actúan como oxidante y reductora.
c) (0,75 puntos) Determine cuál es el reactivo limitante de la reacción y calcule el volumen de dióxido de azufre $\\text{SO}_2$ que se obtendrá, medido a 1 atm y 25 °C.
Datos. Masas atómicas (u): H = 1,0; O = 16,0; S = 32,1; K = 39,1; Cr = 52,0; $R = 0{,}082$ atm·L·mol$^{-1}$·K$^{-1}$.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2023-modelo.pdf"
      }
    ]
  },
  {
    id: 20243,
    año: 2024,
    tipo: "Modelo",
    asignatura: "Química",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "q-2024-modelo-A-1",
        año: 2024,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "A.1",
        enunciado: `Considere los elementos A (Z = 11), B (Z = 13) y C (Z = 16):
a) (0,5 puntos) Escriba su configuración electrónica.
b) (0,5 puntos) Identifíquelos con el nombre, símbolo, grupo y periodo.
c) (0,5 puntos) Razone cuál es el ion más estable de cada elemento, indicando símbolo y carga.
d) (0,5 puntos) Razone qué elemento tiene el menor radio atómico.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2024-modelo.pdf"
      },
      {
        id: "q-2024-modelo-A-2",
        año: 2024,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "A.2",
        enunciado: `Complete las siguientes reacciones, nombre todos los compuestos orgánicos e indique el tipo de reacción:
a) (0,5 puntos) $\\text{CH}_3-\\text{CH}_2-\\text{CHOH}-\\text{CH}_2-\\text{CH}_3 + \\text{H}_2\\text{SO}_4$ / calor →
b) (0,5 puntos) $\\text{CH}_3-\\text{COOH} + \\text{CH}_3-\\text{CHOH}-\\text{CH}_3 + \\text{H}^+$ →
c) (0,5 puntos) $\\text{CH}_3-\\text{CHBr}-\\text{CH}_3 + \\text{NaOH}$ / EtOH →
d) (0,5 puntos) $\\text{CH}_3-\\text{CH}=\\text{CH}_2 + \\text{H}_2\\text{O}$ / $\\text{H}^+$ →`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2024-modelo.pdf"
      },
      {
        id: "q-2024-modelo-A-3",
        año: 2024,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "A.3",
        enunciado: `El clorato de potasio (sólido) se descompone para dar cloruro de potasio (sólido) y oxígeno molecular (gas). Para esta reacción de descomposición a 25 ºC, calcule:
a) (0,5 puntos) La variación de entalpía estándar.
b) (0,5 puntos) La variación de entropía estándar.
c) (0,5 puntos) La variación de energía de Gibbs estándar, y razone si la reacción es espontánea.
d) (0,5 puntos) Determine si a 100 ºC la reacción es espontánea o no. Considere $H^0$ e $S^0$ constantes con la temperatura.
Propiedades termodinámicas a 25 ºC: $\\text{KClO}_3(s)$: $\\Delta H_f^0 = -391{,}2$ kJ·mol$^{-1}$, $\\Delta G_f^0 = -289{,}9$ kJ·mol$^{-1}$, $S^0 = 143{,}0$ J·mol$^{-1}$·K$^{-1}$; $\\text{KCl}(s)$: $\\Delta H_f^0 = -435{,}9$ kJ·mol$^{-1}$, $\\Delta G_f^0 = -408{,}3$ kJ·mol$^{-1}$, $S^0 = 82{,}7$ J·mol$^{-1}$·K$^{-1}$; $\\text{O}_2(g)$: $\\Delta H_f^0 = 0$, $\\Delta G_f^0 = 0$, $S^0 = 205{,}0$ J·mol$^{-1}$·K$^{-1}$.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2024-modelo.pdf"
      },
      {
        id: "q-2024-modelo-A-4",
        año: 2024,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "A.4",
        enunciado: `Para el equilibrio: $\\text{A}_2(g) + \\text{B}_2(g) \\rightleftharpoons 2\\text{AB}(g)$, $K_p = 5$ a 25 ºC y $K_p = 36$ a 300 ºC.
A la temperatura de 300 ºC, en un recipiente de 5,0 L, calentamos 2,0 mol de $\\text{A}_2$ y 2,0 mol de $\\text{B}_2$.
a) (0,5 puntos) Razone si la formación de AB es exotérmica o endotérmica.
b) (1 punto) Calcule las concentraciones de todas las sustancias implicadas en el equilibrio a 300ºC.
c) (0,5 puntos) Con los datos disponibles, calcule $K_p$ a 300 ºC para el equilibrio: $\\frac{1}{2}\\text{A}_2(g) + \\frac{1}{2}\\text{B}_2(g) \\rightleftharpoons \\text{AB}(g)$.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2024-modelo.pdf"
      },
      {
        id: "q-2024-modelo-A-5",
        año: 2024,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "A.5",
        enunciado: `El dicromato de potasio en presencia de ácido clorhídrico reacciona con el cloruro de estaño(II), obteniéndose cloruro de estaño(IV) y cloruro de cromo(III).
a) (1 punto) Formule y ajuste las semirreacciones de oxidación y reducción utilizando el método del ion electrón, indicando cuál es el cátodo y el ánodo y las especies oxidante y reductora. Escriba la reacción completa iónica y molecular.
b) (1 punto) Determine la riqueza en % masa de la disolución de HCl comercial de densidad 1,18 g·mL$^{-1}$ que se ha utilizado para preparar el ácido clorhídrico empleado en la reacción sabiendo que 25,0 mL de la disolución de ácido clorhídrico reaccionan con 12,0 g de cloruro de estaño(II).
Datos. Masas atómicas (u): H = 1,0; Cl = 35,5; Sn = 118,7.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2024-modelo.pdf"
      },
      {
        id: "q-2024-modelo-B-1",
        año: 2024,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "B.1",
        enunciado: `Para las siguientes moléculas: $\\text{CCl}_4$, $\\text{NF}_3$ y $\\text{H}_2\\text{O}$.
a) (0,5 puntos) Dibuje sus estructuras de Lewis.
b) (0,5 puntos) Escriba el tipo de geometría molecular que presentan según la TRPECV.
c) (0,5 puntos) Indique la hibridación del átomo central.
d) (0,5 puntos) Justifique su polaridad.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2024-modelo.pdf"
      },
      {
        id: "q-2024-modelo-B-2",
        año: 2024,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "B.2",
        enunciado: `Para los compuestos: dietil éter, but–2–eno, butan–2–ol y butanal, conteste las siguientes cuestiones utilizando siempre las fórmulas semidesarrolladas de todos los compuestos orgánicos implicados.
a) (0,5 puntos) ¿Cuáles son isómeros de función? Indique el/los tipo/s de compuesto/s implicado/s y su fórmula molecular.
b) (0,5 puntos) ¿Cuál presenta isomería geométrica? Justifique la respuesta escribiendo la fórmula desarrollada y asignando el nombre preciso para cada isómero.
c) (0,5 puntos) ¿Cuál puede dar un alqueno al tratarlo con ácido sulfúrico? Escriba la reacción y nombre los posibles productos indicando el mayoritario.
d) (0,5 puntos) ¿Cuál puede dar un ácido por oxidación? Escriba la fórmula y el nombre del ácido.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2024-modelo.pdf"
      },
      {
        id: "q-2024-modelo-B-3",
        año: 2024,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "B.3",
        enunciado: `El cloruro de oro(III) es una sal muy poco soluble en agua. Responda a las siguientes cuestiones:
a) (0,5 puntos) Escriba el equilibrio de solubilidad del cloruro de oro(III) en agua, detallando el estado de las especies, y la expresión de $K_s$ en función de su solubilidad.
b) (0,75 puntos) Sabiendo que la sal presenta una solubilidad de 0,010 mg en 100 mL de agua a 20 ºC, calcule la constante del producto de solubilidad a esa temperatura.
c) (0,75 puntos) Calcule la nueva solubilidad si se añade sulfuro de oro(III) a la disolución del enunciado, hasta alcanzar una concentración total de Au(III) de 0,1 M. Razone y explique el efecto que tiene lugar.
Datos. Masas atómicas (u): Cl = 35,5; Au = 197,0.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2024-modelo.pdf"
      },
      {
        id: "q-2024-modelo-B-4",
        año: 2024,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "B.4",
        enunciado: `A partir de los valores de potenciales normales de reducción, responda razonadamente a las siguientes cuestiones:
a) (0,75 puntos) Determine el potencial de una pila galvánica formada por un electrodo de platino sumergido en una disolución de permanganato de potasio en medio ácido sulfúrico y un electrodo de plomo sumergido en una disolución de nitrato de plomo(II). Ajuste las semirreacciones de oxidación y reducción, indicando el ánodo y el cátodo.
b) (0,5 puntos) Ordene las especies $\\text{MnO}_4^-$, $\\text{Pb}^{2+}$, $\\text{Cu}^+$ y $\\text{Fe}^{2+}$ de menor a mayor poder oxidante.
c) (0,75 puntos) Explique el proceso que tiene lugar si una pieza de hierro metálico se introduce en una disolución de cobre(I). Razone su espontaneidad.
Datos. $E^0(V)$: $\\text{Fe}^{2+}/\\text{Fe} = -0{,}44$; $\\text{Pb}^{2+}/\\text{Pb} = -0{,}13$; $\\text{Cu}^+/\\text{Cu} = 0{,}52$; $\\text{MnO}_4^-/\\text{Mn}^{2+} = 1{,}52$.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2024-modelo.pdf"
      },
      {
        id: "q-2024-modelo-B-5",
        año: 2024,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "B.5",
        enunciado: `Se preparan disoluciones acuosas de igual concentración de los siguientes compuestos a 25ºC: ácido metanoico, cloruro de potasio, cianuro de sodio y nitrato de amonio.
a) (0,75 punto) Sin hacer cálculo, justifique el carácter ácido, básico o neutro de cada una. Escriba las reacciones de ionización para cada uno de ellos, y las de hidrólisis del ion que lo requiera.
b) (0,5 punto) Haciendo uso de los datos de las constantes de acidez y basicidad, justifique cuál es la disolución más ácida y la más básica, y escriba la reacción que se produce al mezclar ambas.
c) (0,75 puntos) Calcule el pH de una disolución 0,125 M de ácido metanoico.
Datos. $K_a$ (ácido cianhídrico) = $10^{-11}$; $K_b$ (amoniaco) = $10^{-5}$; $K_a$ (ácido metanoico) = $10^{-4}$.`,
        puntuacion: 2,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2024-modelo.pdf"
      }
    ]
  },
  {
    id: 20253,
    año: 2025,
    tipo: "Modelo",
    asignatura: "Química",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "q-2025-modelo-A-1",
        año: 2025,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "1",
        enunciado: `Responda a las siguientes cuestiones:
a) (1 punto) En el laboratorio se dispone de una disolución acuosa de $\\text{Ag}^+$ 1 M y varios electrodos, cuyos potenciales de reducción se indican en la Tabla 1. Utilizando estos datos, razone qué electrodo/s puede/n actuar de ánodo para que en el cátodo se obtenga plata metálica de forma espontánea. Para el/los procesos redox seleccionado/s, escriba las reacciones que tienen lugar en el ánodo y en el cátodo, y calcule el potencial de la pila formada.
b) (0,75 puntos) A partir de los datos de la Tabla 1, razone si se disuelve plata metálica en una disolución de ácido nítrico 1 M. Formule y ajuste por el método del ion electrón las semirreacciones de oxidación, reducción y la reacción iónica.
c) (0,75 puntos) La galvanostegia es un proceso electrolítico mediante el cual se recubre un objeto metálico con una lámina de otro metal; esta técnica se emplea, por ejemplo, para el cromado, dorado o plateado de metales menos nobles. Se ha preparado una disolución de nitrato de plata y se quiere utilizar para recubrir de plata una cucharilla metálica. Calcule durante cuántos minutos debe ser aplicada una corriente de 5,00 A a la disolución de nitrato de plata para depositar 10,1 g de plata metálica sobre la cucharilla.
Tabla 1. Potenciales de reducción $E^0(V)$: $\\text{Au}^{3+}/\\text{Au} = 1{,}52$; $\\text{NO}_3^-/\\text{NO} = 0{,}96$; $\\text{Ag}^+/\\text{Ag} = 0{,}80$; $\\text{Cu}^{2+}/\\text{Cu} = 0{,}34$; $\\text{Fe}^{2+}/\\text{Fe} = -0{,}44$.
Datos. Masa atómica (u): Ag = 107,9. $F = 96485$ C·mol$^{-1}$.`,
        puntuacion: 2.5,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2025-modelo.pdf"
      },
      {
        id: "q-2025-modelo-A-2",
        año: 2025,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta2",
        label: "Estructura atómica y enlace",
        numero: "2A",
        enunciado: `Dados los elementos: A (Z = 11), B (Z = 16) y C (Z = 17), responda a las siguientes cuestiones:
a) (1 punto) Identifique su nombre, símbolo y escriba su configuración electrónica. Indique y explique de forma razonada cuál es su ion más estable.
b) (1 punto) Justifique qué elemento presenta mayor radio atómico, mayor energía de ionización y mayor afinidad electrónica.
c) (0,5 puntos) Considere los compuestos que se obtienen cuando se combina A: i) consigo mismo y ii) con el elemento C. Para cada uno de ellos escriba su fórmula y explique el tipo de enlace más probable.`,
        puntuacion: 2.5,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2025-modelo.pdf"
      },
      {
        id: "q-2025-modelo-A-3",
        año: 2025,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta3",
        label: "Química orgánica",
        numero: "3A",
        enunciado: `Responda a las siguientes cuestiones:
a) (1,25 puntos) Indique el producto mayoritario de reacción, y nombre y explique la regla que lo produce. Escriba los nombres de reactivos y productos de los compuestos orgánicos, indicando cis y trans para los isómeros geométricos cuando existan:
i) Etenilciclohexano + HCl → ii) $\\text{CH}_3-\\text{CHOH}-(\\text{CH}_2)_2-\\text{CH}_3 + \\text{H}_2\\text{SO}_4$ / calor →
b) (1,25 puntos) Complete las siguientes reacciones identificando las sustancias A, B, C y D (fórmula y nombre): i) etanol + $\\text{H}_2\\text{SO}_4$/calor → A; ii) etanol + oxidante (frío) → B; iii) B + oxidante → C; iv) n A (polimerización) → D.`,
        puntuacion: 2.5,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2025-modelo.pdf"
      },
      {
        id: "q-2025-modelo-A-4",
        año: 2025,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta4",
        label: "Equilibrio químico",
        numero: "4A",
        enunciado: `Para las siguientes reacciones en equilibrio, responda a las preguntas:
a) (1,25 puntos) $\\text{H}_2\\text{S}(g) + \\text{I}_2(s) \\rightleftharpoons 2\\text{HI}(g) + \\text{S}(s)$ a 60 ºC. Calcule $K_p$ y $K_c$ si las presiones parciales en el equilibrio para HI y $\\text{H}_2\\text{S}$ son $3{,}65 \\cdot 10^{-3}$ atm y 0,99 atm, respectivamente.
b) (1,25 puntos) $\\text{SO}_2(g) + \\frac{1}{2}\\text{O}_2(g) \\rightleftharpoons \\text{SO}_3(g)$. Utilizando las entalpías de formación, determine hacia dónde se desplazará el equilibrio al aumentar la temperatura.
Datos. $R = 0{,}082$ atm·L·mol$^{-1}$·K$^{-1}$; $\\Delta H_f^0(\\text{SO}_3, g) = -395{,}7$ kJ·mol$^{-1}$; $\\Delta H_f^0(\\text{SO}_2, g) = -296{,}8$ kJ·mol$^{-1}$.`,
        puntuacion: 2.5,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2025-modelo.pdf"
      },
      {
        id: "q-2025-modelo-B-1",
        año: 2025,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "1",
        enunciado: `Responda a las siguientes cuestiones:
a) (1 punto) En el laboratorio se dispone de una disolución acuosa de $\\text{Ag}^+$ 1 M y varios electrodos, cuyos potenciales de reducción se indican en la Tabla 1. Utilizando estos datos, razone qué electrodo/s puede/n actuar de ánodo para que en el cátodo se obtenga plata metálica de forma espontánea. Para el/los procesos redox seleccionado/s, escriba las reacciones que tienen lugar en el ánodo y en el cátodo, y calcule el potencial de la pila formada.
b) (0,75 puntos) A partir de los datos de la Tabla 1, razone si se disuelve plata metálica en una disolución de ácido nítrico 1 M. Formule y ajuste por el método del ion electrón las semirreacciones de oxidación, reducción y la reacción iónica.
c) (0,75 puntos) La galvanostegia es un proceso electrolítico mediante el cual se recubre un objeto metálico con una lámina de otro metal; esta técnica se emplea, por ejemplo, para el cromado, dorado o plateado de metales menos nobles. Se ha preparado una disolución de nitrato de plata y se quiere utilizar para recubrir de plata una cucharilla metálica. Calcule durante cuántos minutos debe ser aplicada una corriente de 5,00 A a la disolución de nitrato de plata para depositar 10,1 g de plata metálica sobre la cucharilla.
Tabla 1. Potenciales de reducción $E^0(V)$: $\\text{Au}^{3+}/\\text{Au} = 1{,}52$; $\\text{NO}_3^-/\\text{NO} = 0{,}96$; $\\text{Ag}^+/\\text{Ag} = 0{,}80$; $\\text{Cu}^{2+}/\\text{Cu} = 0{,}34$; $\\text{Fe}^{2+}/\\text{Fe} = -0{,}44$.
Datos. Masa atómica (u): Ag = 107,9. $F = 96485$ C·mol$^{-1}$.`,
        puntuacion: 2.5,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2025-modelo.pdf"
      },
      {
        id: "q-2025-modelo-B-2",
        año: 2025,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta2",
        label: "Enlace químico",
        numero: "2B",
        enunciado: `A temperatura ambiente, la sal común, NaCl, es un sólido cristalino y el $\\text{COCl}_2$ es un gas.
a) (0,75 puntos) Explique el tipo de enlace intramolecular para cada una de las sustancias.
b) (0,75 puntos) Dibuje la estructura de Lewis y nombre y dibuje la geometría molecular de $\\text{COCl}_2$ utilizando el modelo de repulsión de pares de electrones de la capa de valencia. Indique la hibridación del átomo de C.
c) (1 punto) Represente el ciclo de Born-Haber para la formación de NaCl (s): $\\text{Na}(s) + \\frac{1}{2}\\text{Cl}_2(g) \\rightarrow \\text{NaCl}(s)$, indicando el nombre de las energías implicadas en cada etapa.`,
        puntuacion: 2.5,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2025-modelo.pdf"
      },
      {
        id: "q-2025-modelo-B-3",
        año: 2025,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta3",
        label: "Verdadero o falso",
        numero: "3B",
        enunciado: `Indique si cada una de las siguientes afirmaciones es verdadera o falsa y justifique las respuestas formulando la reacción a la que se alude.
a) (0,75 puntos) La adición de hidrógeno molecular, en presencia de un catalizador, al doble enlace del trans−but−2−eno permite obtener el alcano correspondiente.
b) (0,75 puntos) La reducción del butanal conduce al ácido carboxílico con el mismo número de átomos de carbono.
c) (0,5 puntos) La etilamina se comporta como base en una disolución acuosa.
d) (0,5 puntos) La deshidratación del etanol, por el ácido sulfúrico, produce etino.`,
        puntuacion: 2.5,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2025-modelo.pdf"
      },
      {
        id: "q-2025-modelo-B-4",
        año: 2025,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta4",
        label: "Ácido-base",
        numero: "4B",
        enunciado: `Se dispone de 3 disoluciones acuosas a 25 °C: i) $\\text{HNO}_3$ con pH = 1; ii) ácido acetilsalicílico ($\\text{C}_8\\text{H}_7\\text{O}_2\\text{COOH}$) con pH = 2,24; iii) NaOH con pH = 12.
a) (1,25 puntos) Para cada disolución, escriba los equilibrios de disociación en agua y calcule su concentración inicial.
b) (1,25 puntos) Explique, sin hacer cálculos, si al combinar volúmenes iguales de las disoluciones anteriores de $\\text{HNO}_3$ y de NaOH, el pH será igual, superior o inferior a 7.
Dato. $K_a(\\text{C}_8\\text{H}_7\\text{O}_2\\text{COOH}) = 3{,}1 \\cdot 10^{-4}$.`,
        puntuacion: 2.5,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2025-modelo.pdf"
      }
    ]
  },
  {
    id: 20263,
    año: 2026,
    tipo: "Modelo",
    asignatura: "Química",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "q-2026-modelo-A-1",
        año: 2026,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta1",
        label: "Enlace químico y ácido-base",
        numero: "1",
        enunciado: `Los fertilizantes son productos que se utilizan para enriquecer el suelo y mejorar la calidad de las plantas. Contienen nutrientes esenciales como nitrógeno, fósforo y potasio, y micronutrientes como hierro, cobre y zinc, todos ellos necesarios para su buen estado y crecimiento.
El primer fertilizante nitrogenado sólido que se ha producido a gran escala es el nitrato de amonio ($\\text{NH}_4\\text{NO}_3$) y se obtiene por reacción de $\\text{NH}_3$ con $\\text{HNO}_3$. El fertilizante de potasio más utilizado es el KCl, debido a su bajo coste, su alta concentración en potasio y su buena solubilidad.
a) (1 punto) Justifique el tipo de enlace en las siguientes sustancias: KCl, Cu, $\\text{NH}_4^+$ y $\\text{NH}_3$.
b) (0,5 puntos) Escriba las estructuras de Lewis de $\\text{NH}_3$ y $\\text{NH}_4^+$ e indique si alguna de las sustancias presenta un enlace de coordinación (covalente dativo).
c) (0,5 puntos) Indique y dibuje la geometría de la molécula de amoniaco y del ion amonio mediante la teoría de repulsión de pares de electrones de la capa de valencia (RPECV).
d) (0,5 puntos) El pH del suelo afecta a la disponibilidad de los nutrientes vegetales. Sabiendo que en un determinado suelo se utiliza como fertilizante el nitrato de amonio, justifique si la mayor parte de los nutrientes de ese suelo son más solubles en medio ácido, neutro o básico. Escriba las reacciones necesarias para justificarlo.
Dato. $pK_b$(amoniaco) = 4,75.`,
        puntuacion: 2.5,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2026-modelo.pdf"
      },
      {
        id: "q-2026-modelo-A-2",
        año: 2026,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta2",
        label: "Estructura atómica",
        numero: "2A",
        enunciado: `Considere los elementos A, B y C. El electrón más externo del elemento A está en un orbital con los tres primeros números cuánticos (3,0,0) y su ion más estable es $\\text{A}^+$; el elemento B pertenece al grupo de los alcalinotérreos y su electrón más externo está en un orbital (3,0,0); el ion más estable del elemento C es $\\text{C}^-$ y su electrón más externo está en un orbital 3p.
a) (1 punto) Identifique cada elemento con su nombre, símbolo, configuración electrónica, grupo y periodo.
b) (0,5 puntos) Justifique qué elemento presenta menor energía de ionización.
c) (0,5 puntos) Escriba el nombre del número cuántico $m_l$. Indique cuántos electrones con $m_l = 0$ hay en los átomos A y B.
d) (0,5 puntos) La segunda energía de ionización del elemento A es 4560 kJ·mol$^{-1}$ mientras que la del elemento B es 1451 kJ·mol$^{-1}$. Justifique por qué es mayor la del elemento A.`,
        puntuacion: 2.5,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2026-modelo.pdf"
      },
      {
        id: "q-2026-modelo-A-3",
        año: 2026,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta3",
        label: "Química orgánica",
        numero: "3A",
        enunciado: `Responda a las siguientes cuestiones:
a) (1,5 puntos) Nombre los siguientes compuestos, indique para cada pareja si son isómeros y el tipo de isomería que presentan y escriba su fórmula molecular.
i) $\\text{CH}_3-\\text{CO}-\\text{NH}-\\text{CH}_3$ y $\\text{CH}_3-\\text{CH}_2-\\text{CO}-\\text{NH}_2$
ii) $\\text{CH}_3-\\text{CH}(\\text{CH}_3)-\\text{COO}-\\text{CH}_2-\\text{CH}_3$ y $\\text{CH}_3-(\\text{CH}_2)_2-\\text{CH}(\\text{CH}_3)-\\text{COOH}$
iii) cis−1−cloro−2−metilprop−1−eno y trans−1−cloro−2−metilprop−1−eno (mismo compuesto, ver figura del enunciado original).
b) (1 punto) Complete las siguientes reacciones, formule y nombre todos los compuestos orgánicos, e indique el tipo de reacción.
i) But−2−eno + HCl → ii) $\\text{CH}_3-\\text{CH}_2-\\text{CH}_2-\\text{CHOH}-\\text{CH}_3$ + oxidante (débil) →
iii) A + etanol → $\\text{HCOO}-\\text{CH}_2-\\text{CH}_3 + \\text{H}_2\\text{O}$ iv) cis−pent−2−eno + $\\text{H}_2$/Pt →
v) $\\text{CH}_3-\\text{CH}=\\text{CH}-(\\text{CH}_2)_2-\\text{CH}_3 + \\text{H}_2\\text{O}$/$\\text{H}^+$ →`,
        puntuacion: 2.5,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2026-modelo.pdf"
      },
      {
        id: "q-2026-modelo-A-4",
        año: 2026,
        convocatoria: "Modelo",
        opcion: "A",
        bloque: "Pregunta4",
        label: "Equilibrio químico",
        numero: "4A",
        enunciado: `En la tabla se recogen los valores de $K_p$ para el equilibrio $\\text{A}(g) \\rightleftharpoons 2\\text{B}(g)$ a distintas temperaturas. Además, se sabe que a 789 K el compuesto A está disociado un 40%:
Tabla. Valores de $K_p$: 727 K, $K_p = 1{,}860$; 789 K, $K_p = 0{,}956$; 830 K, $K_p = 0{,}130$.
a) (0,5 puntos) Razone cómo afecta a la presión parcial de A un aumento de la temperatura.
b) (1 punto) Calcule las fracciones molares de A y B en el equilibrio a 789 K.
c) (0,5 puntos) Calcule la presión total del sistema a 789 K.
d) (0,5 puntos) Justifique cómo afecta al equilibrio la adición de gas helio manteniendo el volumen y la temperatura constantes.`,
        puntuacion: 2.5,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2026-modelo.pdf"
      },
      {
        id: "q-2026-modelo-B-1",
        año: 2026,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta1",
        label: "Enlace químico y ácido-base",
        numero: "1",
        enunciado: `Los fertilizantes son productos que se utilizan para enriquecer el suelo y mejorar la calidad de las plantas. Contienen nutrientes esenciales como nitrógeno, fósforo y potasio, y micronutrientes como hierro, cobre y zinc, todos ellos necesarios para su buen estado y crecimiento.
El primer fertilizante nitrogenado sólido que se ha producido a gran escala es el nitrato de amonio ($\\text{NH}_4\\text{NO}_3$) y se obtiene por reacción de $\\text{NH}_3$ con $\\text{HNO}_3$. El fertilizante de potasio más utilizado es el KCl, debido a su bajo coste, su alta concentración en potasio y su buena solubilidad.
a) (1 punto) Justifique el tipo de enlace en las siguientes sustancias: KCl, Cu, $\\text{NH}_4^+$ y $\\text{NH}_3$.
b) (0,5 puntos) Escriba las estructuras de Lewis de $\\text{NH}_3$ y $\\text{NH}_4^+$ e indique si alguna de las sustancias presenta un enlace de coordinación (covalente dativo).
c) (0,5 puntos) Indique y dibuje la geometría de la molécula de amoniaco y del ion amonio mediante la teoría de repulsión de pares de electrones de la capa de valencia (RPECV).
d) (0,5 puntos) El pH del suelo afecta a la disponibilidad de los nutrientes vegetales. Sabiendo que en un determinado suelo se utiliza como fertilizante el nitrato de amonio, justifique si la mayor parte de los nutrientes de ese suelo son más solubles en medio ácido, neutro o básico. Escriba las reacciones necesarias para justificarlo.
Dato. $pK_b$(amoniaco) = 4,75.`,
        puntuacion: 2.5,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2026-modelo.pdf"
      },
      {
        id: "q-2026-modelo-B-2",
        año: 2026,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta2",
        label: "Verdadero o falso",
        numero: "2B",
        enunciado: `Justifique si son verdaderas o falsas las siguientes afirmaciones.
a) (0,5 puntos) La energía de red del LiF es mayor que la del KF, suponiendo que ambos compuestos cristalizan con el mismo tipo de red.
b) (0,5 puntos) En estado fundido los compuestos covalentes sí conducen la electricidad.
c) (0,5 puntos) La hibridación del átomo de boro en el $\\text{BF}_3$ es $sp^3$.
d) (0,5 puntos) La temperatura de ebullición del $\\text{H}_2\\text{S}$ es mayor que la del $\\text{H}_2\\text{O}$.
e) (0,5 puntos) Las fuerzas intermoleculares más fuertes que presenta el $\\text{PH}_3$ son debidas a enlaces de hidrógeno.`,
        puntuacion: 2.5,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2026-modelo.pdf"
      },
      {
        id: "q-2026-modelo-B-3",
        año: 2026,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta3",
        label: "Química orgánica",
        numero: "3B",
        enunciado: `Responda a las siguientes cuestiones:
a) (1 punto) Formule las siguientes reacciones para el propan−1−ol. Escriba el nombre de todos los reactivos y productos orgánicos, e indique el tipo de reacción.
i) propan−1−ol + HBr → ii) propan−1−ol + oxidante (fuerte) →
iii) propan−1−ol + $\\text{CH}_3-\\text{CH}(\\text{CH}_3)-(\\text{CH}_2)_2-\\text{COOH}$ → iv) propan−1−ol + $\\text{H}_2\\text{SO}_4$/calor →
b) (0,5 puntos) Nombre los siguientes compuestos orgánicos e indique a qué tipo de compuesto orgánico pertenecen:
i) $\\text{CH}_3-\\text{CH}(\\text{CH}_3)-\\text{C}(\\text{CH}_3)_2-\\text{CHO}$
ii) $\\text{CH}_3-\\text{CH}_2-\\text{CH}(\\text{CH}_3)-\\text{CH}(\\text{CH}_3)-\\text{C}\\equiv\\text{C}-\\text{CH}_3$
iii) cis−5−metilhex−2−eno.
c) (1 punto) Formule y ajuste la reacción de combustión de butano indicando el estado de las especies, a 298 K y 1,00 atm. Calcule la cantidad de calor que se desprende en la combustión de 12,0 L de butano en esas condiciones.
Datos. A 298 K, $\\Delta H_f^0$ (kJ·mol$^{-1}$): $\\text{C}_4\\text{H}_{10}(g) = -125{,}7$; $\\text{H}_2\\text{O}(l) = -285{,}8$; $\\text{CO}_2(g) = -393{,}5$. $R = 0{,}0820$ atm·L·mol$^{-1}$·K$^{-1}$.`,
        puntuacion: 2.5,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2026-modelo.pdf"
      },
      {
        id: "q-2026-modelo-B-4",
        año: 2026,
        convocatoria: "Modelo",
        opcion: "B",
        bloque: "Pregunta4",
        label: "Redox y ácido-base",
        numero: "4B",
        enunciado: `El cromato de potasio reacciona con ácido clorhídrico produciendo cloruro de cromo(III), cloruro de potasio, agua y cloro.
a) (1 punto) Escriba las semirreacciones de oxidación y reducción ajustadas por el método de ion electrón, la reacción iónica y la molecular.
b) (0,5 puntos) Se sabe que el cromato de potasio comercial tiene una riqueza del 70,0% en masa. Calcule la masa de cromato de potasio comercial necesaria para obtener 60,0 g de cloruro de cromo(III).
c) (0,5 puntos) El ácido clorhídrico empleado en el proceso tiene una concentración de $1{,}25 \\cdot 10^{-2}$ M. Calcule su pH.
d) (0,5 puntos) Calcule la concentración que debe tener una disolución de ácido acético (ácido etanoico) para que tenga el mismo pH que la disolución de ácido clorhídrico del apartado c).
Datos. $K_a$ (ácido acético) = $1{,}8 \\cdot 10^{-5}$. Masas atómicas (u): O = 16,0; Cl = 35,5; K = 39,1; Cr = 52,0.`,
        puntuacion: 2.5,
        criterios: "Se valorará la claridad, formulación y nomenclatura correctas, el planteamiento químico, el desarrollo razonado, los cálculos, las unidades y la respuesta final.",
        pdfFuente: "/quimica-pdfs/quimica-2026-modelo.pdf"
      }
    ]
  }

]
