import type { ExamenBiologia } from "./biologia"

const criteriosGenericosExtraordinaria =
  "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación."

export const examenesBiologiaExtraordinaria: ExamenBiologia[] = [
  {
    id: 20252,
    año: 2025,
    tipo: "Extraordinaria",
    asignatura: "Biología",
    comunidad: "Madrid",
    fuenteDocumento: "2024-2025 Extraordinaria Soluciones Biología.pdf",
    preguntas: [
      {
        id: "bio-extra-2025-1",
        año: 2025,
        convocatoria: "Extraordinaria",
        opcion: "Única",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "1",
        tema: "Sistema inmunitario y biotecnología",
        enunciado: `Con respecto al sistema inmunitario y la biotecnología:

En la enfermedad conocida como Síndrome de DiGeorge completo, el timo no se desarrolla de forma normal durante el proceso embrionario y es funcionalmente muy deficiente, de manera que sin tratamiento es letal, ya que la respuesta inmunitaria está muy afectada, además de presentarse otras anomalías. El tratamiento consistiría en el trasplante de tejido de timo cultivado procedente de un individuo compatible.

Por otra parte, la diabetes mellitus tipo 1 es una enfermedad debida a factores genéticos y ambientales en la que el individuo no produce insulina, ya que las células beta productoras de esta hormona en el páncreas son destruidas por el sistema inmune. En este caso, el tratamiento se centra en controlar la cantidad de glucosa en sangre mediante aplicación exógena de insulina.

a) Indique a qué tipo de patología del sistema inmunitario da lugar el Síndrome de DiGeorge. Razone la respuesta explicando la manera en que se ve afectado el sistema inmunitario (0,5 puntos).

b) Indique qué tipo de respuesta inmune específica se ve afectada esencialmente en el Síndrome de DiGeorge. Explique brevemente por qué (0,25 puntos).

c) Explique a qué tipo de trasplante se hace referencia en el texto anterior, en función de la relación existente entre el donante y el receptor (0,25 puntos).

d) Explique en qué tipo de patología del sistema inmunitario se encuadra la diabetes mellitus tipo I (0,25 puntos).

e) Describa brevemente cuáles son los principales pasos en el proceso de producción de insulina humana mediante la utilización de las técnicas de ingeniería genética (0,75 puntos).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2025-2-A",
        año: 2025,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "2.A",
        tema: "Biomoléculas y ADN",
        enunciado: `En relación con las biomoléculas:

En 1962 Watson, Crick y Wilkins compartieron el Premio Nobel de Fisiología y Medicina por su contribución al conocimiento del ADN.

a) Cite los monómeros que forman esta biomolécula y explique la composición de los mismos. Nombre el modelo que explica la estructura del ADN bicatenario (0,75 puntos).

b) ¿Mediante qué tipo de enlace se unen estos monómeros para formar la biomolécula en cuestión? Explique cómo se forma este enlace (0,75 puntos).

c) Si una molécula de ADN presenta en su composición un 17% de Adenina, indique el porcentaje de las restantes bases nitrogenadas que posee. Razone la respuesta (0,5 puntos).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2025-2-B",
        año: 2025,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "2.B",
        tema: "Biomoléculas e información nutricional",
        enunciado: `En relación con las biomoléculas:

En dos envases de distintos tipos de galletas aparece la información nutricional que se muestra en las siguientes tablas:

![Información nutricional de galletas de avena y chocolate](/biologia-imgs/madrid/2025/extraordinaria/pregunta-2B-info-nutricional-galletas.png)

a) Compare la información nutricional de los dos tipos de galletas y determine cuál de ellas tiene mayor valor energético y cuál mayor contenido en sal por cada 100 g (0,5 puntos).

b) Los hidratos de carbono presentes en la galleta son de varios tipos. Según la AESAN (Agencia Española de Seguridad Alimentaria y Nutrición), el término azúcares añadidos hace referencia a monosacáridos y disacáridos. Ponga cuatro ejemplos de estos tipos de hidratos de carbono (0,5 puntos).

c) El otro tipo de hidrato de carbono presente es la fibra alimentaria. Indique cuál es el componente principal de la fibra y señale qué efecto beneficioso tiene en el organismo (0,5 puntos).

d) Teniendo en cuenta las cantidades de los distintos tipos de grasas saturadas e insaturadas presentes, explique cuál de los dos tipos de galletas sería menos perjudicial para una persona que quiera disminuir el riesgo de padecer enfermedades cardiovasculares (0,5 puntos).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2025-3-A",
        año: 2025,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "3.A",
        tema: "Genética molecular",
        enunciado: `En relación con la genética molecular:

Razone por qué son falsas las siguientes afirmaciones:

a) El proceso de corte y empalme o splicing del ARN consiste en cortar los exones y empalmar los intrones para generar ARNm y se produce en el citosol de células eucariotas (0,5 puntos).

b) El inicio de la transcripción en procariotas está regulado por la unión de factores de iniciación a los ribosomas (0,5 puntos).

c) Los telómeros de procariotas se acortan tras cada replicación del ADN (0,5 puntos).

d) El código genético es degenerado porque a cada aminoácido sólo le corresponde un codón (0,5 puntos).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2025-3-B",
        año: 2025,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "3.B",
        tema: "Mutaciones",
        enunciado: `En relación con la genética molecular:

a) Razone por qué algunas mutaciones puntuales son silenciosas (0,5 puntos).

b) Indique cuál es la diferencia entre poliploidías y aneuploidías (0,5 puntos).

c) Indique cuál es la diferencia entre mutaciones espontáneas e inducidas (0,5 puntos).

d) Razone la relación existente entre las mutaciones y el cáncer (0,5 puntos).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2025-4-A",
        año: 2025,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "4.A",
        tema: "Biología celular y meiosis",
        enunciado: `En relación con la biología celular:

a) Cite las fases principales del ciclo celular y explique brevemente qué ocurre en cada una de ellas (1 punto).

b) Cite dos procesos que contribuyan a producir variabilidad genética durante la meiosis e indique las fases de la meiosis en las que se producen. Justifique brevemente su respuesta (0,5 puntos).

c) Nombre cada una de las fases de la reproducción celular de un organismo 2n=4 representadas a continuación (0,5 puntos).

![Fases de división celular](/biologia-imgs/madrid/2025/extraordinaria/pregunta-4A-division-celular.png)`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2025-4-B",
        año: 2025,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "4.B",
        tema: "Membranas biológicas",
        enunciado: `En relación con las membranas biológicas:

a) Relacione cada característica de la columna de la izquierda con un único concepto de entre los de la derecha (no hace falta que copie el texto, solo que empareje los números y letras que identifican cada opción) (1 punto).

![Relación de transportes de membrana](/biologia-imgs/madrid/2025/extraordinaria/pregunta-4B-transporte-membrana.png)

b) Indique dos funciones de las membranas distintas de la permeabilidad selectiva y el transporte de compuestos (0,5 puntos).

c) Indique los tres componentes principales de la membrana plasmática y describa brevemente su localización en la misma (0,5 puntos).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2025-5-A",
        año: 2025,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "5.A",
        tema: "Metabolismo celular",
        enunciado: `En relación con el metabolismo celular:

a) Respecto a la respiración celular y la fermentación láctica, indique: 1) qué metabolito tienen en común estos dos procesos, 2) qué las diferencia respecto al requerimiento de oxígeno para que se produzcan, 3) cuáles son los productos finales de estos procesos y 4) a qué se debe la diferencia en la producción de ATP entre ambas (1 punto).

b) Indique en qué orgánulo y, dentro del mismo, en qué compartimento ocurre la beta-oxidación de los ácidos grasos y cuáles son los tres productos finales de esta vía metabólica (1 punto).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2025-5-B",
        año: 2025,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "5.B",
        tema: "Metabolismo de los seres vivos",
        enunciado: `Respecto al metabolismo de los seres vivos:

a) En relación con el ATP: 1) indique el nombre de dos tipos de reacciones metabólicas en las que se produce; 2) cite en qué orgánulo/s membranoso/s de la célula vegetal se puede sintetizar; 3) indique una función de este en el metabolismo celular (0,75 puntos).

b) Explique brevemente la relación del ciclo de Krebs con la cadena de transporte electrónico mitocondrial (0,5 puntos).

c) Si en un laboratorio se miden los productos generados por un cultivo de cianobacterias en H2O, se observa que uno de ellos es un gas. Responda razonadamente qué gas se genera a partir de este cultivo. Explique si este gas se produciría si el cultivo se realizara a 70°C (0,75 puntos).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
    ],
  },
  {
    id: 20242,
    año: 2024,
    tipo: "Extraordinaria",
    asignatura: "Biología",
    comunidad: "Madrid",
    fuenteDocumento: "2023-2024 Extraordinaria Soluciones Biología.pdf",
    preguntas: [
      {
        id: "bio-extra-2024-A-1",
        año: 2024,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "A.1",
        tema: "Sistema inmune",
        enunciado: `Con respecto al sistema inmune:

En el dibujo siguiente se muestra una célula (A) implicada en reacciones alérgicas, con anticuerpos en su superficie, y en (B) las consecuencias de la unión de un antígeno a ese anticuerpo.

![Célula implicada en reacciones alérgicas](/biologia-imgs/madrid/2024/extraordinaria/pregunta-1A-respuesta-inmune.png)

a) Nombre la célula representada e indique una sustancia que se libera de sus gránulos (0,5 puntos).

b) ¿Qué tipo de inmunoglobulina interviene en esta respuesta? ¿Qué nombre recibe el antígeno que la desencadena? (0,5 puntos).

c) Explique el concepto de memoria inmunológica (0,5 puntos).

d) Razone si la célula representada en la figura interviene en una respuesta inmunitaria primaria o secundaria (0,5 puntos).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2024-A-2",
        año: 2024,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "A.2",
        tema: "Mutaciones",
        enunciado: `En relación con las mutaciones:

a) Relacione cada uno de los conceptos indicados con números con solo uno de los indicados con letras (1,5 puntos).

1) poliploidía, 2) translocación, 3) monosomía, 4) inserción, 5) duplicación, 6) transversión.

A) mutación genómica, B) mutación cromosómica, C) mutación génica.

b) Describa brevemente la diferencia entre mutación génica y mutación genómica (0,5 puntos).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2024-A-3",
        año: 2024,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "A.3",
        tema: "Lípidos",
        enunciado: `En relación con los lípidos:

El exceso de grasas saturadas en la dieta puede aumentar la biosíntesis de colesterol y tener efectos perjudiciales para la salud.

a) Indique la principal función estructural del colesterol en las células (0,5 puntos).

b) Cite dos moléculas derivadas del colesterol (0,5 puntos).

c) Defina ácido graso. Indique la diferencia entre ácido graso saturado e insaturado (0,5 puntos).

d) Indique de entre los siguientes ácidos grasos cuál tiene mayor temperatura de fusión y cuál menor temperatura de fusión: ácido palmítico 16 carbonos, sin dobles enlaces; ácido láurico 12 carbonos, sin dobles enlaces; ácido oleico 18 carbonos, 1 doble enlace (0,5 puntos).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2024-A-4",
        año: 2024,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "A.4",
        tema: "Fotosíntesis",
        enunciado: `Referente al proceso fotosintético en una célula eucariota:

a) Indique cuál es la finalidad del ciclo de Calvin. Mencione en qué orgánulo y, dentro del mismo, en qué compartimento ocurre (0,5 puntos).

b) Mencione las principales etapas del ciclo de Calvin (0,75 puntos).

c) Indique cuatro de los componentes principales de un cloroplasto y especifique dos tipos de pigmentos que se pueden localizar en dicho orgánulo (0,75 puntos).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2024-A-5",
        año: 2024,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "A.5",
        tema: "Biología celular e inmunidad",
        enunciado: `En relación con la biología celular:

a) Indique en qué estructura celular se encuentra el complejo mayor de histocompatibilidad (MHC) de los macrófagos. Explique brevemente qué función desempeña en esa localización celular (0,5 puntos).

b) Cuando una célula inmunitaria fagocita un antígeno proteico lo degrada en su interior hasta formar pequeños péptidos que luego son transportados a la superficie celular. ¿Qué orgánulo realiza esa degradación y qué tipo de enzimas utiliza para ello? (0,5 puntos).

c) ¿En qué consiste la fagocitosis? ¿Qué tipo de estructura celular se observa después de un proceso fagocítico? ¿Qué tipo de microscopio utilizaría para tomar microfotografías en color de este proceso? Indique un ejemplo o tipo de célula que realice la fagocitosis en los animales (1 punto).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2024-B-1",
        año: 2024,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "B.1",
        tema: "Expresión génica",
        enunciado: `Respecto a los mecanismos de expresión génica:

![Esquema de expresión génica](/biologia-imgs/madrid/2024/extraordinaria/pregunta-1B-expresion-genica.png)

a) Nombre los procesos representados en el esquema adjunto con las letras “A” y “B” (0,5 puntos).

b) Indique el nombre de las moléculas, los componentes y los procesos numerados del “1” al “8” (1 punto).

c) Razone brevemente si la información genética del ADN y las proteínas expresadas en una célula epitelial y en una célula pancreática serán las mismas (0,5 puntos).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2024-B-2",
        año: 2024,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "B.2",
        tema: "Biología celular y ósmosis",
        enunciado: `En relación con la biología celular:

Al colocar eritrocitos en tres medios (A, B y C) con diferentes concentraciones de glucosa, se observa lo que se representa en la gráfica adjunta.

![Variación de volumen celular en medios con glucosa](/biologia-imgs/madrid/2024/extraordinaria/pregunta-2B-volumen-celular.png)

a) ¿Cómo se denominan a cada uno de los medios en relación con la concentración de glucosa? (0,75 puntos).

b) Nombre el proceso que tiene lugar y explíquelo brevemente, indicando la molécula implicada y el tipo de transporte por el que ocurre (0,75 puntos).

c) Indique dos tipos de transporte a través de la membrana sin gasto de energía y cite un ejemplo de sustancia transportada en cada uno de ellos (0,5 puntos).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2024-B-3",
        año: 2024,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "B.3",
        tema: "Biomoléculas",
        enunciado: `En relación con las biomoléculas:

Todos los enlaces de unión entre monómeros para constituir los cuatro grupos principales de biomoléculas son enlaces de condensación, en los que se produce la liberación de una molécula de agua.

a) Indique cómo se llama el enlace y qué grupos funcionales se unen para formar un disacárido (0,5 puntos).

b) Indique cómo se llama el enlace y qué grupos funcionales se unen para formar un triglicérido (0,5 puntos).

c) Indique cómo se llama el enlace y qué grupos funcionales se unen para formar un dipéptido (0,5 puntos).

d) Indique cómo se llama el enlace y qué grupos funcionales se unen para formar un dinucleótido (0,5 puntos).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2024-B-4",
        año: 2024,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "B.4",
        tema: "Biotecnología e industrias alimentarias",
        enunciado: `Con relación a la biotecnología y las industrias alimentarias:

a) Indique dos procesos industriales en los que esté implicada la levadura Saccharomyces cerevisiae, mencionando el tipo concreto de reacción que lleva a cabo este microorganismo y el sustrato de esa reacción (1 punto).

b) Indique dos procesos industriales en los que estén implicadas bacterias del género Lactobacillus, mencionando el tipo concreto de reacción que llevan a cabo estos microorganismos y el sustrato de esa reacción (1 punto).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2024-B-5",
        año: 2024,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "B.5",
        tema: "Metabolismo celular",
        enunciado: `Con referencia al metabolismo celular:

a) Indique dos semejanzas y dos diferencias entre la cadena de transporte de electrones respiratoria y la cadena de transporte de electrones fotosintética (1 punto).

b) Explique razonadamente si la beta-oxidación es un proceso anabólico o catabólico. Indique cuáles son los productos de este proceso metabólico, así como su localización a nivel celular (1 punto).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
    ],
  },
  {
    id: 20232,
    año: 2023,
    tipo: "Extraordinaria",
    asignatura: "Biología",
    comunidad: "Madrid",
    fuenteDocumento: "2022-2023 Extraordinaria Soluciones Biología.pdf",
    preguntas: [
      {
        id: "bio-extra-2023-A-1",
        año: 2023,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "A.1",
        tema: "Morfología y fisiología celular",
        enunciado: `Respecto a la morfología y fisiología celular:

![Esquema de célula eucariota](/biologia-imgs/madrid/2023/extraordinaria/pregunta-1A-celula-eucariota.png)

a) Nombre las estructuras señaladas del 1 al 6 en el esquema adjunto (0,75 puntos).

b) Indique cuáles, de las estructuras señaladas en el esquema, están implicadas en: (a) organización del huso mitótico, (b) formación del fragmoplasto, (c) síntesis de ARNr, (d) endocitosis, (e) formación de lisosomas primarios, (f) fosforilación oxidativa (0,75 puntos).

c) Razone qué tipo de célula eucariota está representada en el esquema (0,5 puntos).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2023-A-2",
        año: 2023,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "A.2",
        tema: "Genética mendeliana",
        enunciado: `En relación con la genética mendeliana:

La raza de gatos conocida como sphinx se caracteriza por no tener pelo. El motivo de la calvicie de los gatos sphinx es que los gatos de esta raza portan en homocigosis un gen mutante autosómico recesivo de deficiencia de pelo (h). Por el contrario, los gatos de pelaje normal portan el gen dominante (H). Otra mutación diferente, también autosómica, es el albinismo (m), frente a la pigmentación normal (M).

a) Indique cómo será el genotipo de un gato dihíbrido con pelo y pigmentación normales, así como los gametos que formará (0,5 puntos).

b) Indique la proporción de los genotipos y fenotipos de los descendientes resultantes del cruce entre un gato doble homocigoto con pelo y pigmentación normales con una gata sphinx albina (0,5 puntos).

c) Realice un diagrama o cuadro de Punnett que muestre los genotipos de los descendientes del cruce entre dos gatos cualquiera, obtenidos del cruce del apartado b), e indique los fenotipos obtenidos y sus proporciones (1 punto).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2023-A-3",
        año: 2023,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "A.3",
        tema: "Base físico-química de la vida",
        enunciado: `En relación con la base físico-química de la vida:

a) Defina qué es un enlace por puente de hidrógeno. Nombre dos moléculas cuya estabilidad dependa de la formación de puentes de hidrógeno (1 punto).

b) Indique un ejemplo de cada una de las biomoléculas siguientes: lípido con función de reserva energética, lípido con función antioxidante, proteína con función estructural, proteína con función hormonal (1 punto).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2023-A-4",
        año: 2023,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "A.4",
        tema: "Microorganismos beneficiosos",
        enunciado: `En relación con los microorganismos beneficiosos:

a) Defina biorremediación y biodegradación. Cite un tipo de microorganismo que lleve a cabo cada una de ellas (1 punto).

b) Señale dos microorganismos útiles en biotecnología, indique su tipo de organización celular y su aplicación biotecnológica (1 punto).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2023-A-5",
        año: 2023,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "A.5",
        tema: "División celular y reproducción",
        enunciado: `En relación con la división celular y la reproducción:

a) Defina brevemente los siguientes términos relacionados con la primera división meiótica: tétrada, sobrecruzamiento, quiasma y sinapsis. Ordene los términos anteriores de forma secuencial (1,5 puntos).

b) Indique una ventaja y una desventaja de la reproducción sexual sobre la asexual (0,5 puntos).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2023-B-1",
        año: 2023,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "B.1",
        tema: "Traducción del ARNm",
        enunciado: `En relación con la traducción del ARNm:

a) Indique qué molécula es la portadora del codón, qué molécula es la portadora del anticodón y en qué sitio del ribosoma sucede la interacción entre ambos durante la elongación (0,75 puntos).

b) ¿Es correcto decir que un polisoma o polirribosoma es la unión entre un ARNm y un único ribosoma? Justifique la respuesta. Indique en qué tipo celular pueden aparecer los polisomas (0,5 puntos).

c) Un ARNm de 485 nucleótidos de longitud tiene un segmento 5’ no codificante de 62 nucleótidos y un segmento 3’ no codificante de 153 nucleótidos. Indique el número de nucleótidos de su marco de lectura abierto y el número de aminoácidos que codificará. Justifique las respuestas (0,75 puntos).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2023-B-2",
        año: 2023,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "B.2",
        tema: "Sistema inmune",
        enunciado: `Con respecto al sistema inmune:

a) ¿Qué es la inflamación? Cite dos tipos de agentes que pueden desencadenarla (0,5 puntos).

b) Indique dos manifestaciones clínicas de la inflamación. Mencione dos de los procesos implicados en la respuesta inflamatoria (1 punto).

c) Señale dos funciones que realizan los macrófagos (0,5 puntos).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2023-B-3",
        año: 2023,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "B.3",
        tema: "Metabolismo",
        enunciado: `Respecto al metabolismo de los seres vivos:

a) Identifique a qué proceso metabólico corresponde cada una de las siguientes reacciones generales e indique para cada una de ellas si se puede realizar en ausencia de oxígeno (1 punto).

![Reacciones metabólicas generales](/biologia-imgs/madrid/2023/extraordinaria/pregunta-3B-reacciones-metabolicas.png)

b) Indique cómo se denomina la ruta de degradación de los ácidos grasos. Cite los productos de esta ruta y en qué compartimento subcelular ocurre (1 punto).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2023-B-4",
        año: 2023,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "B.4",
        tema: "Proteínas",
        enunciado: `En relación con las proteínas:

a) Nombre el enlace entre aminoácidos para formar una cadena de proteína e indique los grupos implicados en su formación (0,75 puntos).

b) ¿Cómo se llama el proceso que sufre una proteína con función enzimática sometida a altas temperaturas? ¿Es este un proceso reversible? (0,5 puntos).

c) Indique cuál o cuáles de las siguientes características se verán afectadas por el proceso del apartado b) y cuál o cuáles no se verán afectadas: estructura tridimensional, secuencia de aminoácidos, actividad enzimática (0,75 puntos).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2023-B-5",
        año: 2023,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "B.5",
        tema: "Microbiología",
        enunciado: `En relación con la Microbiología:

a) Señale dos enfermedades causadas por bacterias y dos causadas por virus e indique la vía de contagio (1 punto).

b) Señale cuatro enfermedades causadas por agentes que no sean bacterias o virus e indique la vía de contagio (1 punto).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
    ],
  },
  {
    id: 20222,
    año: 2022,
    tipo: "Extraordinaria",
    asignatura: "Biología",
    comunidad: "Madrid",
    fuenteDocumento: "2021-2022 Extraordinaria Soluciones Biología.pdf",
    preguntas: [
      {
        id: "bio-extra-2022-A-1",
        año: 2022,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "A.1",
        tema: "Respuesta inmune y grupos sanguíneos",
        enunciado: `Con relación a la respuesta inmune:

Para evitar una reacción de rechazo inmunitario, antes de realizar una transfusión sanguínea se comprueba la compatibilidad entre la sangre del donante y la del paciente que la va a recibir. Con respecto al sistema AB0 de grupos sanguíneos:

a) Indique qué grupo sanguíneo es conocido como “Donante universal”. Razone la respuesta (0,5 puntos).

b) Indique los antígenos que intervienen en el sistema AB0 de los grupos sanguíneos. ¿Cuántos alelos pueden participar en la herencia del grupo sanguíneo dentro de este sistema? (0,5 puntos).

c) La tabla siguiente representa los resultados de las pruebas para determinar el grupo sanguíneo dentro del sistema AB0. La muestra de sangre de cuatro sujetos (1 a 4) se mezcla con anticuerpos anti-A, anticuerpos anti-B y anticuerpos anti-A y anti-B. Deduzca el grupo sanguíneo de cada individuo observando en la tabla la presencia de aglutinación (+) o su ausencia (—) (1 punto).

![Tabla de grupos sanguíneos AB0](/biologia-imgs/madrid/2022/extraordinaria/pregunta-1A-grupos-sanguineos.png)`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2022-A-2",
        año: 2022,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "A.2",
        tema: "Microorganismos",
        enunciado: `En relación con los microorganismos:

a) Defina los términos siguientes: epidemia, enfermedad endémica, pandemia y zoonosis (1 punto).

b) Defina los términos siguientes: toxina, infección, patógeno oportunista y enfermedad infecciosa (1 punto).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2022-A-3",
        año: 2022,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "A.3",
        tema: "Mitosis y meiosis",
        enunciado: `En relación con los procesos de mitosis y meiosis:

a) Relacione cada uno de los epígrafes de la izquierda con los procesos indicados en la columna derecha (1 punto):

![Relación entre mitosis y meiosis](/biologia-imgs/madrid/2022/extraordinaria/pregunta-3A-mitosis-meiosis.png)

b) Describa brevemente la relación entre herencia genética y reproducción sexual con los procesos de adaptación y especiación (1 punto).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2022-A-4",
        año: 2022,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "A.4",
        tema: "Enzimas",
        enunciado: `En relación con las enzimas:

a) Indique los modelos o teorías que explican la unión enzima-sustrato (0,5 puntos).

b) Enumere dos factores que influyen en la velocidad de las reacciones enzimáticas y explique brevemente su efecto (1 punto).

c) Explique brevemente el mecanismo de inhibición no competitiva en las enzimas (0,5 puntos).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2022-A-5",
        año: 2022,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "A.5",
        tema: "Mutaciones puntuales",
        enunciado: `Respecto a las mutaciones puntuales en la secuencia del ADN:

a) Indique las causas por las que pueden generarse sustituciones en el ADN. Describa las sustituciones de tipo transición y de tipo transversión (1 punto).

b) Describa las consecuencias que pueden tener en la cadena de aminoácidos: 1) una mutación puntual por sustitución; y 2) una mutación puntual por inserción/deleción (indel) en el ADN codificante (1 punto).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2022-B-1",
        año: 2022,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "B.1",
        tema: "Mendel y herencia",
        enunciado: `En relación con las aportaciones de Mendel al estudio de la herencia:

El esquema adjunto muestra la transmisión de un carácter en una familia, representado por los símbolos oscuros, producido por un solo gen autosómico con dos alelos, a través de tres generaciones.

![Pedigrí de transmisión hereditaria](/biologia-imgs/madrid/2022/extraordinaria/pregunta-B1-pedigri.png)

a) Indique si el carácter presenta herencia dominante o recesiva. Razone la respuesta (0,75 puntos).

b) Indique los genotipos de los individuos I.1, I.3, II.2, II.4, II.5, y III.2, utilizando “A” para el alelo dominante y “a” para el alelo recesivo (0,75 puntos).

c) Indique las proporciones genotípicas de la descendencia entre el individuo III.1 con otro individuo que manifieste el carácter asociado con el símbolo oscuro. ¿El carácter se manifiesta en la descendencia? (0,5 puntos).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2022-B-2",
        año: 2022,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "B.2",
        tema: "Material genético",
        enunciado: `Con referencia al material genético de la célula:

Explique por qué son falsas todas las afirmaciones siguientes:

a) El ADN eucariota se encuentra unido a histonas y a otras proteínas, y además presenta su máximo grado de compactación cuando se encuentra en forma de eucromatina (0,5 puntos).

b) Los cromosomas se clasifican en metacéntricos cuando tienen sus cromátidas hermanas de igual longitud (0,5 puntos).

c) Las células procariotas poseen varios cromosomas lineales en la región del nucleoide, además de poder presentar plásmidos en el citoplasma (0,5 puntos).

d) Los cromosomas metafásicos presentan un centrómero con dos cinetocoros, dos brazos cromosómicos y una cromátida (0,5 puntos).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2022-B-3",
        año: 2022,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "B.3",
        tema: "Virus",
        enunciado: `En relación con los virus:

a) Indique cuatro características que describen a los virus (0,5 puntos).

b) Explique brevemente los tres componentes principales que puede presentar un virus (0,75 puntos).

c) Nombre y describa brevemente los dos ciclos de multiplicación vírica que se pueden producir cuando un virión infecta a una bacteria (0,75 puntos).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2022-B-4",
        año: 2022,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "B.4",
        tema: "Metabolismo celular",
        enunciado: `En relación con el metabolismo celular:

a) Dadas las moléculas de la tabla, relaciónelas con la respiración celular aerobia y con la fotosíntesis, indicando en cada caso si son un sustrato o un producto de dichos procesos metabólicos (1 punto).

![Tabla de moléculas en respiración celular y fotosíntesis](/biologia-imgs/madrid/2022/extraordinaria/pregunta-B4-respiracion-fotosintesis.png)

b) Relacione cada proceso metabólico de la columna de la izquierda con el orgánulo o compartimento celular de la columna de la derecha que le corresponda (1 punto).

![Relación de procesos metabólicos y orgánulos](/biologia-imgs/madrid/2022/extraordinaria/pregunta-B4-fotofosforilacion-organulos.png)`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2022-B-5",
        año: 2022,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "B.5",
        tema: "Lípidos",
        enunciado: `En relación con los lípidos:

a) Explique qué es el carácter anfipático de los ácidos grasos y a qué es debido (0,75 puntos).

b) Formule la reacción que tiene lugar entre un ácido graso y un alcohol y nombre los productos resultantes (0,75 puntos).

c) ¿Qué tipo de lípido es el constituyente mayoritario de las membranas celulares? Explique su disposición en dicha estructura (0,5 puntos).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
    ],
  },
  {
    id: 20212,
    año: 2021,
    tipo: "Extraordinaria",
    asignatura: "Biología",
    comunidad: "Madrid",
    fuenteDocumento: "2020-2021 Extraordinaria Soluciones Biología.pdf",
    preguntas: [
      {
        id: "bio-extra-2021-A-1",
        año: 2021,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "A.1",
        tema: "Mendel y herencia",
        enunciado: `Con relación a las aportaciones de Mendel al estudio de la herencia:

La genealogía adjunta muestra la transmisión de una enfermedad monogénica y autosómica en una familia. En negro se muestran los individuos afectados y en blanco los sanos (los hombres se representan con un cuadrado y las mujeres con un círculo).

![Genealogía de enfermedad monogénica autosómica](/biologia-imgs/madrid/2021/extraordinaria/pregunta-A1-pedigri.png)

a) Indique si el alelo que determina la presencia de la enfermedad es dominante o recesivo. Razone la respuesta (0,5 puntos).

b) Indique los genotipos de los individuos I.1, I.2, II.7 y III.11, utilizando “A” para el alelo dominante y “a” para el recesivo (1 punto).

c) Defina qué es un cruzamiento prueba y para qué se emplea (0,5 puntos).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2021-A-2",
        año: 2021,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "A.2",
        tema: "Moléculas de los seres vivos",
        enunciado: `En relación con las moléculas de los seres vivos:

a) Defina polisacárido. Indique tres propiedades de los polisacáridos que les diferencien de glúcidos más sencillos (1 punto).

b) Explique las diferencias entre los lípidos saponificables y los insaponificables. Cite dos ejemplos de cada uno de ellos (1 punto).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2021-A-3",
        año: 2021,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "A.3",
        tema: "Microorganismos y ciclos de materia",
        enunciado: `En relación con los microorganismos y su intervención en los ciclos de materia:

Razone por qué son falsas cada una de las siguientes afirmaciones indicando la afirmación correcta:

a) Las bacterias nitrificantes contribuyen al ciclo del nitrógeno convirtiendo el nitrógeno atmosférico en amoniaco (0,5 puntos).

b) Las bacterias desnitrificantes contribuyen al ciclo del nitrógeno convirtiendo el nitrógeno atmosférico en nitrato (0,5 puntos).

c) Los mamíferos contribuyen al ciclo del nitrógeno convirtiendo compuestos orgánicos nitrogenados en nitratos (0,5 puntos).

d) Las cianobacterias contribuyen al ciclo del carbono convirtiendo metano en CO2 (0,5 puntos).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2021-A-4",
        año: 2021,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "A.4",
        tema: "Lisosomas",
        enunciado: `Respecto a los lisosomas:

a) Indique dónde y cómo se originan (0,5 puntos).

b) Explique brevemente su función principal (0,5 puntos).

c) Indique qué tipo de enzimas son abundantes en los lisosomas (0,5 puntos).

d) Indique las diferencias entre el contenido de los lisosomas primarios y secundarios (0,5 puntos).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2021-A-5",
        año: 2021,
        convocatoria: "Extraordinaria",
        opcion: "A",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "A.5",
        tema: "Respuesta inmune",
        enunciado: `En relación con la respuesta inmune:

Los cacahuetes son una de las causas más frecuentes de alergia alimentaria. La reacción de hipersensibilidad aparece a los pocos minutos de la ingestión de este fruto seco.

a) ¿Qué es una reacción de hipersensibilidad? ¿Cuál es la diferencia entre antígeno y alérgeno? (1 punto).

b) Describa los procesos que ocurren durante una reacción de hipersensibilidad inmediata utilizando los términos siguientes en el orden adecuado: mastocito, alérgeno, histamina, IgE (1 punto).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2021-B-1",
        año: 2021,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "B.1",
        tema: "ARN mensajero",
        enunciado: `Respecto a la síntesis y características del ARN mensajero:

a) Relacione los conceptos de la columna izquierda con los de la columna derecha (1 punto).

![Relación sobre síntesis y características del ARN mensajero](/biologia-imgs/madrid/2021/extraordinaria/pregunta-B1-expresion-genica.png)

b) Explique en qué consiste el “corte y empalme” o splicing del pre-ARN mensajero y en qué proceso ocurre. Indique en qué tipo de organismo sucede y en qué parte de la célula tiene lugar (1 punto).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2021-B-2",
        año: 2021,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "B.2",
        tema: "Metabolismo eucariota",
        enunciado: `En relación con los procesos metabólicos de los eucariotas:

a) Nombre las moléculas del esquema adjunto representadas por los números del 1 al 6, y los procesos representados por las letras A, B, y C (1,5 puntos).

b) Explique brevemente la teoría quimiosmótica y su función (0,5 puntos).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2021-B-3",
        año: 2021,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "B.3",
        tema: "Enfermedades infecciosas",
        enunciado: `En relación con las enfermedades infecciosas:

a) Describa brevemente las vías por las que se pueden transmitir las enfermedades infecciosas (1 punto).

b) Indique el tipo de agente causante y la vía de transmisión preferente de las siguientes enfermedades infecciosas: Covid-19, rabia, cólera, paludismo (1 punto).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2021-B-4",
        año: 2021,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "B.4",
        tema: "Ciclo celular",
        enunciado: `Con relación al ciclo celular:

a) Considerando una célula somática animal, ordene la secuencia de los siguientes procesos del ciclo celular numerados del 1 al 6, comenzando por el número 3. Indique la fase concreta a la que corresponde cada proceso (no es necesario que copie los procesos, solo que asocie los números con la fase) (1 punto):

1- cromosomas dispuestos en el plano ecuatorial
2- descondensación de los cromosomas y reconstrucción de la envoltura nuclear
3- replicación del ADN nuclear
4- separación de dos juegos de cromosomas hacia los polos
5- actividad metabólica y crecimiento celular
6- desintegración de la envoltura nuclear y condensación de los cromosomas

b) Indique si los cromosomas se encuentran constituidos por una o por dos cromátidas durante las fases de los procesos 1, 4, 5 y 6 (0,5 puntos).

c) Explique brevemente cuál es el significado biológico de la mitosis en un organismo animal (0,5 puntos).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
      {
        id: "bio-extra-2021-B-5",
        año: 2021,
        convocatoria: "Extraordinaria",
        opcion: "B",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "B.5",
        tema: "Biomoléculas",
        enunciado: `En relación con las biomoléculas:

a) Indique qué papel juegan las vitaminas en el metabolismo (0,5 puntos).

b) Explique por qué es necesario que los seres humanos tomemos vitaminas en la dieta y si esto les ocurre a todos los organismos (0,5 puntos).

c) Indique el tipo de biomolécula asociándolo con su función: hemoglobina, actina, NADH, quitina (1 punto).`,
        puntuacion: 2,
        criterios: criteriosGenericosExtraordinaria,
      },
    ],
  },
]
