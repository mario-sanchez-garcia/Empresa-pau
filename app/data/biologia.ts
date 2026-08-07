import { examenesBiologiaCataluna } from "./biologia_cataluna"

export type BloqueBiologia = "Pregunta1" | "Pregunta2" | "Pregunta3" | "Pregunta4" | "Pregunta5" | `Ejercicio${number}${"" | "A" | "B"}`

export interface PreguntaBiologia {
  id: string
  año: number
  convocatoria: "Ordinaria" | "Extraordinaria" | "Modelo"
  opcion: "A" | "B" | "Única"
  bloque: BloqueBiologia
  label: string
  numero: string
  tema: string
  enunciado: string
  textoDespuesImagen?: string
  puntuacion: number
  criterios: string
  imagenes?: string[]
  requiereImagen?: boolean
  requiereRevision?: boolean
  pdfFuente?: string
}

export interface ExamenBiologia {
  id: number
  año: number
  tipo: "Ordinaria" | "Extraordinaria" | "Modelo"
  asignatura: "Biología"
  comunidad: "Madrid" | "Cataluña"
  dia?: `Sèrie ${number}`
  fuenteDocumento?: string
  preguntas: PreguntaBiologia[]
}

export const BIOLOGIA_TOPICS: Array<{ tipo: BloqueBiologia; label: string; pts: number }> = [
  { tipo: "Pregunta1", label: "Pregunta 1", pts: 2 },
  { tipo: "Pregunta2", label: "Pregunta 2", pts: 2 },
  { tipo: "Pregunta3", label: "Pregunta 3", pts: 2 },
  { tipo: "Pregunta4", label: "Pregunta 4", pts: 2 },
  { tipo: "Pregunta5", label: "Pregunta 5", pts: 2 }
]

export const examenesBiologia: ExamenBiologia[] = [
  {
    id: 2025,
    año: 2025,
    tipo: "Ordinaria",
    asignatura: "Biología",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "bio-2025-comun-1",
        año: 2025,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "1",
        tema: "En relación con la Inmunología y las Biomoléculas: La celiaquía es una",
        enunciado: `En relación con la Inmunología y las Biomoléculas: La celiaquía es una enfermedad que se desencadena por la intolerancia a la ingestión de gluten. El gluten es la principal proteína de almacenamiento que se encuentra en los granos de trigo, formado principalmente por gliadinas y gluteninas que pueden funcionar como epítopos inmunológicos. En los individuos que presentan esta enfermedad, la ingesta de gluten provoca altos niveles de IgA y la destrucción de las microvellosidades intestinales, alterando la absorción de nutrientes y ocasionando graves deficiencias nutricionales en vitaminas B6, B12 y D, fibra, calcio, hierro, ácido fólico, ácidos grasos omega-3, etc. 
a) Razone si la celiaquía pertenece al tipo de patología del sistema inmune denominado inmunodeficiencia o al de autoinmunidad, explicando la razón por la que considera que no pertenece al otro tipo (0,5 puntos).
b) Indique el tipo de molécula al que pertenece la IgA y describa brevemente su estructura (0,75 puntos).
c) Explique por qué las vitaminas son consideradas nutrientes esenciales. Indique el tipo de vitaminas al que pertenecen la vitamina B12 y la vitamina D (0,5 puntos).
d) Explique la importancia que tiene una ingesta apropiada de ácidos grasos omega-3 (poliinsaturados) para la salud (0,25 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2025-A-2",
        año: 2025,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "2.A",
        tema: "En relación con la información genética de los seres vivos",
        enunciado: `En relación con la información genética de los seres vivos:`,
        textoDespuesImagen: `a) Siendo 3’-GCTTTACCATACCCCAGAATGTGGAATCTTC-5’ la secuencia de la cadena molde de un fragmento de $ADN$, indique la secuencia, polaridad y porcentajes de purinas y pirimidinas de la hebra codificante (0,5 puntos).
b) Indique la secuencia y polaridad del $ARNm$ que corresponde al ADN de doble hebra del apartado a). Indique la secuencia y sentido de la proteína codificada por este $ARNm$ desde el codón de inicio, Cite el nombre del enlace característico que une los aminoácidos entre sí (0,75 puntos).
c) Describa brevemente los principales eventos que suceden en cada una de las tres fases de la traducción del mensaje genético (0,75 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
        requiereImagen: true,
        imagenes: ["/biologia-imgs/madrid/2025/ordinaria/pregunta-2A-codigo-genetico.png"],
      },
      {
        id: "bio-2025-B-2",
        año: 2025,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "2.B",
        tema: "En relación con las mutaciones",
        enunciado: `En relación con las mutaciones:
a) Defina brevemente cada uno de los cuatro tipos principales de mutación cromosómica y la consecuencia en la ganancia o pérdida, si la hubiera, de material genético de cada una de ellas (1 punto).
b) Defina qué es una mutación espontánea y cómo puede aparecer en el genoma. Indique los tres tipos de agentes mutagénicos responsables de las mutaciones inducidas y ponga un ejemplo de cada uno de ellos (1 punto).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2025-A-3",
        año: 2025,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "3.A",
        tema: "En relación con la biología celular: George Palade describió por primera vez",
        enunciado: `En relación con la biología celular: George Palade describió por primera vez los ribosomas asociados al retículo endoplásmico en 1955 y en 1974 recibió el premio Nobel de Fisiología. 
a) Describa la estructura general de un ribosoma e indique los tipos de biomoléculas que lo componen (0,5 puntos).
b) Describa el proceso de formación o biogénesis de los ribosomas en las células eucarióticas (0,5 puntos).
c) Indique todos los compartimentos de una célula eucariótica vegetal que contienen ribosomas (0,5 puntos).
d) Describa la función de los ribosomas, en relación con el dogma central de la biología molecular. Indique que diferencias existen en el destino de los productos de su actividad, según estén libres en el citosol o asociados al retículo endoplásmico (0,5 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2025-B-3",
        año: 2025,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "3.B",
        tema: "En relación con la biología celular",
        enunciado: `En relación con la biología celular:
a) Un paciente con una enfermedad mitocondrial experimenta fatiga crónica y debilidad muscular. Se proponen varias líneas de investigación para descubrir una terapia para esta enfermedad mitocondrial. Seleccione la que le parezca más adecuada y justifique su respuesta (0,25 puntos).
- Investigación de una terapia basada en activadores de la glicosilación.
- Investigación de una terapia basada en las enzimas de la glucolisis.
- Investigación de una terapia basada en activadores del complejo $ATP$ sintasa.
- Investigación de una terapia basada en fármacos que modifiquen la funcionalidad de los receptores HLA.
b) Indique las principales características estructurales y funcionales, específicas de la membrana mitocondrial interna (0,5 puntos).
c) En un experimento se van a utilizar tres vesículas artificiales con distinta composición en su membrana:
- Vesícula A: con ácidos grasos saturados y sin colesterol.
- Vesícula B: con ácidos grasos insaturados y sin colesterol.
- Vesícula C : con ácidos grasos saturados y con colesterol. Justifique cuál de ellas es la más fluida. Justifique cuál será la más apta para realizar la endocitosis y la exocitosis (0,75 puntos). 
d) Algunas sustancias tóxicas de origen vegetal implican la pérdida de la función de los centriolos. Explique brevemente dos consecuencias que tendría sobre una célula animal la exposición a este tipo de sustancias (0,5 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2025-A-4",
        año: 2025,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "4.A",
        tema: "En relación con el metabolismo: Los camellos y dromedarios son animales",
        enunciado: `En relación con el metabolismo: Los camellos y dromedarios son animales adaptados a la vida en climas áridos. Ambas especies pueden sobrevivir en los desiertos sin beber durante largos periodos de tiempo y su alimentación, frecuentemente se compone de vegetales salobres o con poca cantidad de agua. En un estudio sobre estos animales se han obtenido los siguientes datos sobre su metabolismo a partir de diferentes nutrientes:`,
        textoDespuesImagen: `a) Justifique por qué se produce mayor cantidad de agua a partir de los lípidos que de los glúcidos (0,5 puntos).
b) Con los datos de la tabla, justifique por qué los camellos pueden estar sin beber durante largos periodos de tiempo (0,25 puntos).
c) Explique en qué fase de la respiración celular se produce la mayor cantidad de $H_2O$ (0,5 puntos).
d) Indique la vía metabólica específica del catabolismo de los ácidos grasos (0,25 puntos).
e) Explique la razón por qué el catabolismo de los ácidos grasos consume una mayor cantidad de oxígeno que la de otros nutrientes (0,5 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
        requiereImagen: true,
        imagenes: ["/biologia-imgs/madrid/2025/ordinaria/pregunta-4A-tabla-nutrientes.png"],
      },
      {
        id: "bio-2025-B-4",
        año: 2025,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "4.B",
        tema: "En relación con el metabolismo: La siguiente gráfica muestra la actividad",
        enunciado: `En relación con el metabolismo: La siguiente gráfica muestra la actividad enzimática de dos enzimas a diferentes temperaturas.`,
        textoDespuesImagen: `a) Razone cuál de las dos enzimas pertenece a un organismo termófilo (0,5 puntos).
b) Explique la disminución de la actividad de la enzima B a la izquierda y a la derecha de su temperatura óptima (0,5 puntos).
c) Indique otro factor físico-químico distinto a la temperatura que puede afectar a la actividad de la enzima. Explique cómo lo hace (0,5 puntos).
d) Indique cómo se denomina el lugar específico de la enzima al que se une el sustrato (0,25 puntos).
e) Defina coenzima (0,25 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
        requiereImagen: true,
        imagenes: ["/biologia-imgs/madrid/2025/ordinaria/pregunta-4B-enzimas.png"],
      },
      {
        id: "bio-2025-A-5",
        año: 2025,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "5.A",
        tema: "Respecto a las técnicas de ingeniería genética y sus aplicaciones",
        enunciado: `Respecto a las técnicas de ingeniería genética y sus aplicaciones:
a) El término CRISPR hace referencia a determinadas secuencias de $ADN$ distribuidas en el genoma de los organismos procariotas. Indique cuál es la función de dichas secuencias dentro de las células bacterianas (0,25 puntos).
b) Qué función tienen las proteínas Cas en el sistema CRISPR-Cas de las bacterias (0,25 puntos).
c) El sistema CRISPR-Cas ha sido adaptado y convertido en una nueva tecnología de ingeniería genética para ser utilizada en células eucariotas. Indique qué permite hacer esta nueva herramienta biotecnológica y mencione una aplicación de la misma en medicina (0,5 puntos).
d) En la tecnología del $ADN$ recombinante se requiere el uso de enzimas de restricción. Defina “sitio de restricción” e indique en qué pasos del proceso de clonación de un fragmento de $ADN$ tendrían que utilizarse enzimas de restricción (0,5 puntos).
e) Mencione dos aplicaciones de la tecnología del $ADN$ recombinante en la industria farmacéutica y otras dos en agricultura (0,5 puntos ).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2025-B-5",
        año: 2025,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "5.B",
        tema: "Con respecto a la biotecnología y las industrias alimentarias",
        enunciado: `Con respecto a la biotecnología y las industrias alimentarias:
a) Indique dos similitudes y dos diferencias entre las reacciones de la fermentación alcohólica y las de la láctica, empleadas habitualmente en la industria alimentaria (1 punto).
b) Para elaborar un yogur casero, la reacción de fermentación se suele llevar a cabo a una temperatura de 35-40 °C durante unas ocho horas. Explique qué sucedería si dicho proceso se realizase a una temperatura de 70-75 °C (0,5 puntos).
c) Razone qué ocurriría en el caso de que la fermentación se realizase a 10-15 °C (0,5 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      }
    ]
  },
  {
    id: 2024,
    año: 2024,
    tipo: "Ordinaria",
    asignatura: "Biología",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "bio-2024-A-1",
        año: 2024,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "A.1",
        tema: "Con respecto al sistema inmune: El esquema adjunto representa la administración",
        enunciado: `Con respecto al sistema inmune: El esquema adjunto representa la administración de un antígeno (A) y una respuesta inmunitaria que produce (B).
a) ¿Qué tipo de inmunización se lleva a cabo en A? ¿Qué tipo de respuesta inmune está representada en B? (0,5 puntos).
b) Mencione otro tipo de respuesta inmune e indique si también se produciría en este caso (0,5 puntos).
c) El vial representado en C se ha obtenido a partir de la sangre del animal inmunizado. Explique qué utilidad puede tener la administración de su contenido a otro animal infectado con el mismo antígeno (0.5 puntos).
d) ¿Qué tipo de inmunidad proporciona la administración mencionada en el apartado c? ¿Cómo se denomina este tipo de tratamiento? (0,5 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
        requiereImagen: true,
        imagenes: [],
      },
      {
        id: "bio-2024-A-2",
        año: 2024,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "A.2",
        tema: "En relación con la biología celular",
        enunciado: `En relación con la biología celular:
a) Indique qué son los plásmidos, su estructura y naturaleza química, qué función tienen y dónde se encuentran (1 punto).
b) Indique dos diferencias entre el flagelo de las células procariotas y el de las eucariotas (0,5 puntos).
c) Cite el componente principal e indique una función de la pared celular procariota (0,5 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2024-A-3",
        año: 2024,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "A.3",
        tema: "Respecto a la genética molecular",
        enunciado: `Respecto a la genética molecular:
a) Indique los distintos tipos de ARN que participan en la síntesis de proteínas y la función de cada uno de ellos (0,75 puntos).
b) Al someter dos moléculas de $ADN$ (“1” y “2”) de doble cadena y de la misma longitud a altas temperaturas, se observa que el $ADN$ “1” se desnaturaliza antes que el $ADN$ “2”. Razone brevemente a qué se debe este resultado (0,5 puntos).
c) Defina brevemente el concepto de mutación e indique un agente mutagénico físico y uno químico (0,75 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2024-A-4",
        año: 2024,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "A.4",
        tema: "Con relación a los procesos metabólicos",
        enunciado: `Con relación a los procesos metabólicos:
a) Explique la diferencia entre fotosíntesis oxigénica y anoxigénica. Indique un tipo de organismo que realice cada una de ellas (1 punto).
b) Explique en qué consiste el proceso de la quimiosíntesis, indicando cuál es la fuente de energía y la fuente de carbono (0,5 puntos).
c) Indique la localización cloroplástica de la cadena transportadora de electrones y cite los tres productos finales que se obtienen en la fase dependiente de la luz de la fotosíntesis (0,5 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2024-A-5",
        año: 2024,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "A.5",
        tema: "En relación con la base físico-química de la vida",
        enunciado: `En relación con la base físico-química de la vida:
a) Indique qué tipo de interacciones se producen entre las moléculas de agua y las sales minerales, explicando cómo facilitan la disolución de estas (0,5 puntos).
b) Indique los componentes de un nucleótido. Cite los enlaces que unen dichos componentes (0,5 puntos).
c) Explique dos funciones biológicas de los nucleótidos y cite un ejemplo de cada una (1 punto).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2024-B-1",
        año: 2024,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "B.1",
        tema: "Con relación a las biomoléculas: El índice glucémico (IG) es una medida de la",
        enunciado: `Con relación a las biomoléculas: El índice glucémico (IG) es una medida de la rapidez con la que un alimento puede elevar el nivel de glucosa en la sangre. Los alimentos con un alto índice glucémico pueden dificultar el control de los niveles de glucosa en sangre. 
a) Cite una enfermedad relacionada con el control del nivel de glucosa en sangre. Indique en qué células y en qué forma molecular se almacena la glucosa en el organismo humano (0,75 puntos).
b) ¿Qué grupo funcional químico caracteriza a los monosacáridos y cómo se clasifican en función de dicho grupo? (0,5 puntos).
c) Indique una similitud y dos diferencias entre el glucógeno y el almidón (0,75 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2024-B-2",
        año: 2024,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "B.2",
        tema: "En relación con la información genética de los seres vivos",
        enunciado: `En relación con la información genética de los seres vivos:
a) Relacione cada uno de los conceptos de la columna izquierda con solo uno de los de la columna derecha (1 punto). (1) Proceso de splicing (2) Hebra retardada (3) Sitio P (A) Replicación (4) Caja TATA (B) Transcripción (5) $ARNt$ (C) Traducción (6) Secuencia oriC (7) Código genético (8) $ADN$ polimerasas
b) Defina brevemente el proceso de replicación del $ADN$ e indique por qué la replicación es semiconservativa (0,5 puntos).
c) Indique en qué compartimentos celulares sucede la replicación en células eucariotas (0,5 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2024-B-3",
        año: 2024,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "B.3",
        tema: "En relación con la biología celular",
        enunciado: `En relación con la biología celular:
a) Cite una estructura membranosa y una estructura no membranosa que se puede encontrar en el estroma de los cloroplastos (0,5 puntos).
b) Cite otros dos tipos de plastos e indique sus funciones (0,5 puntos).
c) Cite los componentes de la cromatina (0,5 puntos).
d) Explique qué diferencia hay entre la eucromatina y la heterocromatina en una célula eucariota (0,5 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2024-B-4",
        año: 2024,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "B.4",
        tema: "Respecto a las enzimas",
        enunciado: `Respecto a las enzimas:
a) Defina los términos enzima y centro activo (1 punto).
b) En una reacción química en la que un sustrato “A” se transforma en un producto “B” se liberan 5 kJ/mol por molécula de sustrato. Razone cuánta energía se liberaría si la reacción estuviese catalizada por una enzima (0,5 puntos).
c) El estudio del efecto de la temperatura sobre la actividad de una enzima, medida en velocidad de la reacción V ($\\mu mol/min$), dio lugar a los valores mostrados en la tabla. Razone a qué se deben estos resultados (0,5 puntos). Tª (°C) 10º 15º 20º 25º 30º 35º 40º 45º 50º 55º 60º V($\\mu mol/min$) 0,4 0,8 1,4 2 2,8 3,4 3,8 3,4 2,4 0,8 0`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2024-B-5",
        año: 2024,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "B.5",
        tema: "Con respecto a la biotecnología aplicada a la industria alimentaria",
        enunciado: `Con respecto a la biotecnología aplicada a la industria alimentaria:
a) Indique qué tipo de microorganismo interviene en el proceso de fabricación del vino y el tipo de reacción que lleva a cabo, así como los productos finales generados en dicha reacción (0,75 puntos).
b) Indique qué tipo de microorganismo interviene en el proceso de fabricación del queso y el tipo de reacción que lleva a cabo, así como el producto final generado en dicha reacción (0,75 puntos).
c) Si comparamos los dos procesos anteriores, indique en cuál de ellos encontraremos el medio de cultivo con un pH más ácido. Razone la respuesta (0,5 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      }
    ]
  },
  {
    id: 2023,
    año: 2023,
    tipo: "Ordinaria",
    asignatura: "Biología",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "bio-2023-A-1",
        año: 2023,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "A.1",
        tema: "En relación con la genética mendeliana: Cuando se cruzan gallos de plumaje",
        enunciado: `En relación con la genética mendeliana: Cuando se cruzan gallos de plumaje blanco (B) y gallinas de plumaje negro (N), siempre se obtienen ejemplares de un plumaje azulado. Cuando estos ejemplares azulados se cruzan entre sí, se obtienen individuos negros, blancos y azulados. 
a) ¿Qué tipo de herencia explica la aparición del color azulado? Razone su respuesta (0,5 puntos).
b) Represente los dos cruces citados, indicando las proporciones de los genotipos y fenotipos de los descendientes (0,5 puntos).
c) Represente el cruce entre un gallo blanco y una gallina azulada, indicando las proporciones de los genotipos y fenotipos de los descendientes. Indique también qué cruzamiento debería realizarse para obtener ejemplares de plumaje negro a partir de descendientes del cruce entre un gallo blanco y una gallina azulada (0,5 puntos).
d) Razone si mediante selección sería posible criar exclusivamente gallinas azules (0,5 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2023-A-2",
        año: 2023,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "A.2",
        tema: "Con relación a la respuesta inmune",
        enunciado: `Con relación a la respuesta inmune:
a) El esquema adjunto representa la estructura básica de un anticuerpo. Identifique todas las partes señaladas con letras (0,75 puntos).
b) Indique tres características de la unión antígeno-anticuerpo (0,75 puntos).
c) Indique cuál es la inmunoglobulina implicada en los procesos alérgicos y cite una sustancia liberada por los mastocitos en la respuesta a un alergeno (0,5 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
        requiereImagen: true,
        imagenes: [],
      },
      {
        id: "bio-2023-A-3",
        año: 2023,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "A.3",
        tema: "Con relación a la reproducción bacteriana",
        enunciado: `Con relación a la reproducción bacteriana:
a) Indique y describa brevemente los mecanismos de recombinación bacteriana (0,75 puntos).
b) Explique las principales diferencias que existen entre la reproducción asexual y los mecanismos de recombinación en bacterias (0,5 puntos).
c) Explique las ventajas ecológicas y evolutivas de los dos procesos indicados en el apartado b). Indique cual sería el inconveniente de la reproducción asexual (0,75 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2023-A-4",
        año: 2023,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "A.4",
        tema: "Respecto a los sustratos y los productos del metabolismo celular",
        enunciado: `Respecto a los sustratos y los productos del metabolismo celular:
a) Indique las fuentes de carbono y energía que utilizan los seres fotoautótrofos y los quimioheterótrofos (0,5 puntos).
b) ¿Qué producto común se produce en la glucolisis y en la beta-oxidación? Cite otra vía en la que también se forma este producto. Indique dos destinos metabólicos en los que se puede consumir este producto (0,5 puntos).
c) Indique los sustratos de la fotofosforilación acíclica y los productos del Ciclo de Calvin (1 punto).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2023-A-5",
        año: 2023,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "A.5",
        tema: "En relación con los ácidos nucleicos",
        enunciado: `En relación con los ácidos nucleicos:
a) Nombre el enlace entre los distintos nucleótidos para formar una cadena de ácido nucleico, indicando los grupos implicados (1 punto).
b) Se ha analizado parcialmente la estructura del ácido nucleico de un virus, obteniendo una concentración de un 25% de Guanina, un 20% de Citosina y un 25% de Adenina. Razone cuál es el tipo de ácido nucleico de este virus. Indique cuál es la base nitrogenada que falta y cuál sería su porcentaje en la composición (1 punto).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2023-B-1",
        año: 2023,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "B.1",
        tema: "Respecto a los mecanismos de transmisión de la información genética",
        enunciado: `Respecto a los mecanismos de transmisión de la información genética:
a) Relacione cada enzima de la columna izquierda con un solo proceso de la columna derecha (1,5 puntos). (1) Primasa (2) Aminoacil-$ARNt$ sintetasa (A) Transcripción del $ADN$ (3) Telomerasa (B) Replicación del $ADN$ (4) $ARN$ polimerasa (C) Traducción del $ARN$ (5) $ADN$ ligasa (6) $ADN$ polimerasa I
b) Describa brevemente en qué consiste el proceso de corte y empalme ( splicing) dentro del proceso de maduración del $ARNm$ en las células eucariotas. Indique en qué compartimento celular ocurre (0,5 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2023-B-2",
        año: 2023,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "B.2",
        tema: "Con relación a las envolturas celulares",
        enunciado: `Con relación a las envolturas celulares:
a) Indique en orden los nombres de las tres capas que componen la estructura de la pared celular vegetal, comenzando por la más alejada de la membrana celular. Cite los principales componentes de cada una de las capas (1,25 puntos).
b) Nombre el principal componente de la pared celular bacteriana e indique en qué tipo de organismos procarióticos no encontramos dicho componente en su pared celular. Mencione una diferencia estructural relevante entre las paredes de bacterias gram-negativas y gram-positivas (0,75 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2023-B-3",
        año: 2023,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "B.3",
        tema: "En relación con los procesos de división celular",
        enunciado: `En relación con los procesos de división celular:
a) Para un organismo diploide con $2n = 10$ cromosomas, indique el número de cromosomas y cro mátidas que habría en cada una de las siguientes fases:(1) fase G1; (2) fase G2; (3) telofase; (4) telofase I; (5) telofase II; (6) metafase I (1,5 puntos).
b) Cite dos diferencias entre la división de una célula animal y la de una célula vegetal (0,5 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2023-B-4",
        año: 2023,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "B.4",
        tema: "En relación con los microorganismos",
        enunciado: `En relación con los microorganismos:
a) Defina brevemente los conceptos de enfermedad endémica, de epidemia y de pandemia (0,75 puntos).
b) Indique el tipo de agente patógeno (virus, bacteria, protozoo u hongo) que causa cada una de las siguientes enfermedades: tuberculosis, rabia, paludismo, candidiasis y hepatitis (1,25 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2023-B-5",
        año: 2023,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "B.5",
        tema: "En relación con la estructura de las biomoléculas",
        enunciado: `En relación con la estructura de las biomoléculas:
a) Defina ácido graso, triacilglicérido y fosfoglicérido (1,5 puntos).
b) Nombre dos enlaces o interacciones que estabilizan la estructura terciaria de las proteínas (0,5 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      }
    ]
  },
  {
    id: 2022,
    año: 2022,
    tipo: "Ordinaria",
    asignatura: "Biología",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "bio-2022-A-1",
        año: 2022,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "A.1",
        tema: "En relación con el transporte y movimiento celular",
        enunciado: `En relación con el transporte y movimiento celular: 
a) Indique el mecanismo de transporte que aparece representado en el esquema adjunto. Nombre las estructuras y orgánulos señalados del 1 al 4 (0,75 puntos).
b) Indique dos diferencias entre transporte activo y pasivo a través de la membrana. Ponga un ejemplo de transporte activo (0,75 puntos).
c) Cite dos ejemplos concretos en los que el citoesqueleto pueda contribuir a los movimientos celulares (0,5 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
        requiereImagen: true,
        imagenes: [],
      },
      {
        id: "bio-2022-A-2",
        año: 2022,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "A.2",
        tema: "Con relación al estudio de la herencia",
        enunciado: `Con relación al estudio de la herencia: 
a) Defina codominancia y cite un ejemplo (0,5 puntos).
b) Defina herencia ligada al sexo y cite un ejemplo (0,5 puntos).
c) Relacione cada concepto de la columna izquierda con una definición de la columna derecha (1 punto).
1. Genotipo A. Determinan el sexo en la especie humana
2. Alelo B. Alelos heredados para un gen
3. Alelismo múltiple C. Formas alternativas que puede presentar un gen
4. Heterocromosomas D. Existencia de más de dos alelos diferentes de un mismo gen`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2022-A-3",
        año: 2022,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "A.3",
        tema: "En relación con los ácidos nucleicos",
        enunciado: `En relación con los ácidos nucleicos: 
a) Indique las moléculas constituyentes de los nucleótidos (0,5 puntos).
b) Indique qué enlace se produce entre dos nucleótidos para formar una cadena lineal y a partir de qué grupos funcionales se forma (0,5 puntos).
c) Indique los principales tipos de $ARN$ y la función de cada uno de ellos (1 punto).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2022-A-4",
        año: 2022,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "A.4",
        tema: "Con relación a la nutrición de los procariotas",
        enunciado: `Con relación a la nutrición de los procariotas: 
a) Cite los cuatro tipos principales de nutrición de las células procariotas e indique un ejemplo de cada uno de ellos (1 punto).
b) Indique la fuente de energía y la fuente de carbono que se utiliza en cada tipo de nutrición citado en el apartado anterior (1 punto).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2022-A-5",
        año: 2022,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "A.5",
        tema: "En relación con la división y el ciclo celular",
        enunciado: `En relación con la división y el ciclo celular: 
a) Haga un esquema rotulado de la anafase mitótica de una célula con $2n = 4$ cromosomas (0,5 puntos).
b) Indique cuatro procesos que caracterizan la profase mitótica (1 punto).
c) Describa brevemente las diferencias en el proceso de división del citoplasma (citocinesis) entre células eucarióticas animales y vegetales (0,5 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2022-B-1",
        año: 2022,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "B.1",
        tema: "En relación con las mutaciones",
        enunciado: `En relación con las mutaciones: 
a) Relacione los conceptos de la columna izquierda con los de la columna derecha (1,5 puntos).
1. Traslocación
2. Haploidía A. Mutación genómica
3. Inversión B. Mutación cromosómica
4. Transversión C. Mutación génica
5. Aneuploidía
6. Transición
b) Describa brevemente la diferencia entre mutación cromosómica y mutación genómica (0,5 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2022-B-2",
        año: 2022,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "B.2",
        tema: "En relación con la respuesta inmune: La gráfica adjunta representa la respuesta",
        enunciado: `En relación con la respuesta inmune: La gráfica adjunta representa la respuesta inmune primaria (A) y secundaria (B) de un individuo que recibe dos dosis de la misma vacuna frente a un microorganismo patógeno: 
a) A la vista de la gráfica, explique la necesidad de revacunación frente a este microorganismo (0,5 puntos).
b) Explique a qué se debe que la segunda dosis de vacuna desencadene una respuesta inmune más rápida y mayor (0,5 puntos).
c) Indique el tipo de anticuerpo mayoritario de la respuesta inmune primaria (A) y el de la respuesta inmune secundaria (B) (0,5 puntos).
d) Indique el nombre que recibe la inmunidad conseguida mediante vacunas (0,5 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
        requiereImagen: true,
        imagenes: [],
      },
      {
        id: "bio-2022-B-3",
        año: 2022,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "B.3",
        tema: "Con relación a los procesos metabólicos celulares",
        enunciado: `Con relación a los procesos metabólicos celulares: 
a) Relacione cada concepto de la columna de la izquierda con uno o más de los procesos metabólicos de la columna de la derecha (1,5 puntos).
1. Obtención de $ATP$ y poder reductor A. Fermentación
2. Oxidación de $NADH$ B. Ciclo de Calvin
3. Fijación de $CO_2$ C. Ciclo de Krebs
4. Gasto de $ATP$ y poder reductor D. Cadena de transporte electrónico fotosintético
5. Reducción de NADP+
b) Con respecto a la cadena de transporte electrónico mitocondrial, indique en qué parte de la mitocondria tiene lugar y cuál es la molécula aceptora final de electrones (0,5 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2022-B-4",
        año: 2022,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "B.4",
        tema: "En relación con la molécula del agua",
        enunciado: `En relación con la molécula del agua: 
a) Explique la polaridad de las moléculas de agua e indique a qué es debida (0,5 puntos).
b) ¿Qué interacción se produce entre las moléculas de agua? Indique una característica de esta interacción (0,5 puntos).
c) Indique y explique brevemente otras dos propiedades de esta molécula (1 punto).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2022-B-5",
        año: 2022,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "B.5",
        tema: "En relación con la Biotecnología, indique",
        enunciado: `En relación con la Biotecnología, indique: 
a) Tres aplicaciones en la industria agropecuaria (0,75 puntos).
b) Tres aplicaciones en la industria farmacéutica (0,75 puntos).
c) Dos aplicaciones en la industria alimentaria (0,5 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      }
    ]
  },
  {
    id: 2021,
    año: 2021,
    tipo: "Ordinaria",
    asignatura: "Biología",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "bio-2021-A-1",
        año: 2021,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "A.1",
        tema: "En relación con la base fisicoquímica de la vida",
        enunciado: `En relación con la base fisicoquímica de la vida:
a) Indique una función biológica en los seres vivos de los siguientes bioelementos: calcio y sodio (0,5 puntos).
b) Explique razonadamente el proceso que ocurriría en una célula vegetal al introducirla en un medio extracelular hipotónico (0,5 puntos).
c) Explique razonadamente el proceso que ocurriría en un glóbulo rojo al introducirlo en un medio extracelular hipertónico (0,5 puntos).
d) Explique qué le sucedería a una planta si se riega con agua salada (0,5 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2021-A-2",
        año: 2021,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "A.2",
        tema: "En relación con los intercambios energéticos de los procesos metabólicos",
        enunciado: `En relación con los intercambios energéticos de los procesos metabólicos: 
a) La siguiente gráfica representa la energía de una reacción metabólica. Identifique los compuestos A y C y la variable B . Justifique si se trata de una reacción endergónica o exergónica (1 punto).
b) Defina catabolismo y anabolismo. Indique un ejemplo de una ruta metabólica de cada uno de estos procesos (1 punto).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
        requiereImagen: true,
        imagenes: [],
      },
      {
        id: "bio-2021-A-3",
        año: 2021,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "A.3",
        tema: "En relación con el flujo de información genética: El esquema representa el",
        enunciado: `En relación con el flujo de información genética: El esquema representa el dogma central de la biología molecular. 
a) Indique qué moléculas se corresponden con los números 1, 2 y 3 y qué procesos se corresponden con las letras A, B, C y D (1,25 puntos).
b) Indique la enzima clave en cada uno de los procesos A, B y C (0,75 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
        requiereImagen: true,
        imagenes: [],
      },
      {
        id: "bio-2021-A-4",
        año: 2021,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "A.4",
        tema: "Con referencia al citoesqueleto de la célula",
        enunciado: `Con referencia al citoesqueleto de la célula:
a) Indique el elemento del citoesqueleto que se relaciona con cada uno de los enunciados siguientes (1 punto):
1. Creación de estructuras como los centriolos.
2. Movimiento contráctil de las células musculares, formación de pseudópodos, formación de las microvellosidades en las células intestinales.
3. Estructuras cilíndricas y huecas formadas por protofilamentos constituidos por dímeros proteicos.
4. Filamentos de queratina en las células epiteliales y neurofilamentos de las neuronas.
b) Describa brevemente la estructura interna del tallo o axonema de los cilios y flagelos (0,5 puntos).
c) Cite la principal diferencia entre cilios y flagelos. Indique si los cilios se hallan presentes en todas las células animales y vegetales (0,5 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2021-A-5",
        año: 2021,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "A.5",
        tema: "En relación con las características de microorganismos y otras formas acelulares",
        enunciado: `En relación con las características de microorganismos y otras formas acelulares:
a) Defina capsómero, profago, virión, nucleoide (1 punto).
b) Indique dos semejanzas y dos diferencias entre Arqueobacterias y Eubacterias (1 punto). Tiempo ESTADO INTERMEDIO B C A`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2021-B-1",
        año: 2021,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "B.1",
        tema: "En relación con la respuesta inmune: Las investigaciones sobre la infección por",
        enunciado: `En relación con la respuesta inmune: Las investigaciones sobre la infección por el Coronavirus SARS-CoV-2 parecen indicar que la inmunidad celular puede tener más importancia ante este virus que en otras infecciones víricas. 
a) Indique cuáles son las células implicadas en la inmunidad celular y cómo actúan sobre las células infectadas (0,5 puntos).
b) El otro tipo de respuesta inmune específica es la humoral. Indique cómo se puede comprobar si se ha desencadenado la respuesta inmune humoral ante esta infección. Razone por qué resulta más complicado medir la respuesta inmune celular que la respuesta inmune humoral (0,75 puntos).
c) Indique tres funciones de los linfocitos T colaboradores (Th o CD4+) (0,75 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2021-B-2",
        año: 2021,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "B.2",
        tema: "Referente a las biomoléculas",
        enunciado: `Referente a las biomoléculas:
a) Indique las biomoléculas con las que relacionaría los siguientes tipos de enlace: éster, glucosídico, fosfodiéster, peptídico (1 punto).
b) Defina estructura terciaria de una proteína e indique tres tipos de enlaces que mantienen dicha estructura (1 punto).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2021-B-3",
        año: 2021,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "B.3",
        tema: "En relación con los microorganismos",
        enunciado: `En relación con los microorganismos:
a) Copie la siguiente tabla y complete los datos para cada uno de los microorganismos indicados (1,25 puntos): Reino Tipo de nutrición Cianobacterias Bacterias nitrificantes Diatomeas Plasmodium Saccharomyces cerevisiae 
b) Indique cuáles de los microorganismos de la tabla anterior presentan pared celular y cuál es su principal componente en cada caso (0,75 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2021-B-4",
        año: 2021,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "B.4",
        tema: "Respecto a la mitosis: Para un organismo animal con $2n = 46$ cromosomas,",
        enunciado: `Respecto a la mitosis: Para un organismo animal con $2n = 46$ cromosomas, explique por qué son falsas cada una de las siguientes afirmaciones: 
a) Una célula en profase mitótica presenta 46 cromosomas, cada uno con dos cromátidas, condensándose progresivamente y organizándose en parejas de cromosomas homólogos (0,5 puntos).
b) En una célula en metafase mitótica observamos 46 cromosomas constituidos por una cromátida y dispuestos en el plano ecuatorial (0,5 puntos).
c) En anafase mitótica se observan 23 cromosomas con una cromátida migrando hacia un polo de la célula y otros 23 hacia el polo opuesto (0,5 puntos).
d) Durante la telofase mitótica se produce la descondensación progresiva de 23 cromosomas, constituidos por dos cromátidas, en cada uno de los dos núcleos hijos que se están reconstruyendo (0,5 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2021-B-5",
        año: 2021,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "B.5",
        tema: "Con relación a las aportaciones de Mendel al estudio de la herencia: En una",
        enunciado: `Con relación a las aportaciones de Mendel al estudio de la herencia: En una raza de conejos, el pelo corto “A” es dominante sobre el pelo largo “a”. Se llevan a cabo cuatro cruzamientos que dan lugar a los siguientes porcentajes de fenotipos en sus progenies: Parentales Progenie 1 pelo corto x pelo largo 50% pelo corto y 50% pelo largo 2 pelo largo x pelo largo 100% pelo largo 3 pelo corto x pelo largo 100% pelo corto 4 pelo corto x pelo corto 100% pelo corto 
a) Indique los genotipos posibles de los parentales y de la progenie de cada uno de los cruzamientos (1 punto).
b) Defina locus y fenotipo (0,5 puntos).
c) Razone si en el caso de dos genes ligados se cumple la tercera ley de Mendel en ausencia de recombinación (0,5 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      }
    ]
  },
  {
    id: 2020,
    año: 2020,
    tipo: "Ordinaria",
    asignatura: "Biología",
    comunidad: "Madrid",
    preguntas: [
      {
        id: "bio-2020-A-1",
        año: 2020,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "A.1",
        tema: "Referente a los virus como agentes causantes de enfermedades",
        enunciado: `(2 puntos) Referente a los virus como agentes causantes de enfermedades: 
a) Nombre el proceso de infección representado en la figura adjunta . Identifique las fases señaladas con letras (1,5 puntos).
b) Cite dos tipos de agentes acelulares no víricos y el tipo de organismos al que afectan (0,5 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
        requiereImagen: true,
        imagenes: [],
      },
      {
        id: "bio-2020-A-2",
        año: 2020,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "A.2",
        tema: "Respecto a la célula eucariota vegetal",
        enunciado: `(2 puntos) Respecto a la célula eucariota vegetal:
a) Indique cuál es el componente mayoritario de la pared celular vegetal y cómo se llaman las conexiones entre células vegetales adyacentes (0,5 puntos).
b) Cite los orgánulos de la célula vegetal que contienen ribosomas (0,5 puntos).
c) Explique brevemente el origen y formación del fragmoplasto (0,5 puntos).
d) Indique la localización de la cadena de transporte de electrones fotosintética y el compartimento en que tiene lugar el ciclo de Calvin (0,5 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2020-A-3",
        año: 2020,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "A.3",
        tema: "En relación a la base molecular y fisicoquímica de la vida",
        enunciado: `(2 puntos) En relación a la base molecular y fisicoquímica de la vida:
a) Indique dos formas en que se pueden encontrar las sales minerales en los seres vivos y ponga un ejemplo de cada caso (0,5 puntos).
b) Indique una función biológica en los seres vivos de los siguientes bioelementos: potasio, calcio, hierro y cobalto (1 punto).
c) Indique una función biológica de dos tipos de sales minerales sólidas (0,5 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2020-A-4",
        año: 2020,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "A.4",
        tema: "En relación con la respuesta inmune",
        enunciado: `(2 puntos) En relación con la respuesta inmune:
a) ¿Qué es y para qué sirve el interferón? (0,5 puntos).
b) Indique qué entiende por opsonización y cite dos tipos de moléculas capaces de llevarla a cabo (0,75 puntos).
c) ¿Qué quiere decir que una célula tiene actividad citotóxica? Cite dos ejemplos de células que posean esta actividad (0,75 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2020-A-5",
        año: 2020,
        convocatoria: "Ordinaria",
        opcion: "A",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "A.5",
        tema: "Con relación a las aportaciones de Mendel al estudio de la herencia",
        enunciado: `(2 puntos) Con relación a las aportaciones de Mendel al estudio de la herencia:
a) En las cabras, la ausencia de cuernos "A” es dominante sobre el alelo “a” para la presencia de cuernos. Suponga que se cruza un macho sin cuernos con tres hembras: hembra 1 con cuernos, de la que nace una cría con cuernos; hembra 2 con cuernos, de la que nace una cría sin cuernos; y hembra 3 sin cuernos, de la que nace una cría con cuernos. Indique el genotipo de los cuatro parentales: macho, hembra 1, hembra 2 y hembra 3 (1 punto).
b) ¿Qué tipo de cruzamiento se podría diseñar para distinguir un individuo homocigótico dominante (AA) de un heterocigótico (Aa)? Razone la respuesta. ¿Qué denominación recibe? (1 punto).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2020-B-1",
        año: 2020,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta1",
        label: "Pregunta 1",
        numero: "B.1",
        tema: "En referencia a los glúcidos",
        enunciado: `(2 puntos) En referencia a los glúcidos: 
a) Indique el principal glúcido de reserva energética de la célula animal y señale los dos principales lugares de almacenamiento en el cuerpo humano. Describa su composición y los enlaces químicos que presenta (1 punto). 
b) Indique el principal glúcido de reserva energética de la célula vegetal y señale dos lugares de almacenamiento en la planta. Describa su composición y los enlaces químicos que presenta (1 punto).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2020-B-2",
        año: 2020,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta2",
        label: "Pregunta 2",
        numero: "B.2",
        tema: "En relación a las características y clasificación de los microorganismos: Se",
        enunciado: `(2 puntos) En relación a las características y clasificación de los microorganismos: Se cultivan los siguientes microorganismos: Clostridium, Escherichia, Saccharomyces y una cianobacteria en un medio de cultivo general con todas las condiciones necesarias para su crecimiento y se hace variar solo una condición. La siguiente tabla muestra los resultados obtenidos en las diferentes condiciones, el signo + indica crecimiento y el signo - que no hubo crecimiento: Medio con inhibidor bacteriano Medio anaerobio Medio con inhibidor de la fotosíntesis CULTIVO A ─ ─ ─ CULTIVO B ─ + + CULTIVO C ─ ─ + CULTIVO D + + + 
a) Identifique el microorganismo de cada cultivo (1 punto). 
b) Cite los cuatro tipos morfológicos que pueden presentar los organismos procariotas (1 punto).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2020-B-3",
        año: 2020,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta3",
        label: "Pregunta 3",
        numero: "B.3",
        tema: "En relación con la información genética de los seres vivos",
        enunciado: `(2 puntos) En relación con la información genética de los seres vivos: 
a) Relacione cada uno de los conceptos de la columna izquierda con uno de los de la columna derecha (1 punto). (1) $ARN$ polimerasa (A) Replicación (2) Sustitución nucleotídica (3) $ADN$ Polimerasa I (B) Transcripción (4) Sitio P (5) Inserción / Deleción (C) Traducción (6) Burbuja bidireccional (7) Subunidad ribosomal (D) Mutación (8) Caperuza 5’ 
b) Explique cuál es el dogma central de la biología molecular. Describa en un gráfico qué elementos lo componen y qué procesos los relacionan entre sí (1 punto).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2020-B-4",
        año: 2020,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta4",
        label: "Pregunta 4",
        numero: "B.4",
        tema: "Respecto a los procesos energéticos celulares",
        enunciado: `(2 puntos) Respecto a los procesos energéticos celulares: 
a) Indique una diferencia entre ósmosis y difusión (0,5 puntos). 
b) Indique las diferencias entre los procesos de fermentación alcohólica y láctica en cuanto a: organismos que los realizan y procesos industriales en los que se emplean (1 punto). 
c) Indique la localización mitocondrial de las reacciones del ciclo de Krebs y de la cadena transportadora de electrones respiratoria (0,5 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      },
      {
        id: "bio-2020-B-5",
        año: 2020,
        convocatoria: "Ordinaria",
        opcion: "B",
        bloque: "Pregunta5",
        label: "Pregunta 5",
        numero: "B.5",
        tema: "Respecto a la mitosis",
        enunciado: `(2 puntos) Respecto a la mitosis: 
a) Indique cuál es la función de la mitosis en: 1) un organismo unicelular y 2) un organismo pluricelular (0,5 puntos). 
b) Explique qué relación existe entre cinetocoros y huso mitótico (0,5 puntos). 
c) Mencione dos procesos de la división mitótica en los que resulta esencial la relación entre cinetocoros y huso mitótico (0,5 puntos). 
d) Indique cuál es la ploidía y el número de cromátidas por cromosoma en una célula somática animal en profase y en telofase (0,5 puntos).`,
        puntuacion: 2,
        criterios: "Cada pregunta se calificará sobre 2 puntos. Se valorará el uso correcto del lenguaje biológico, la claridad y concreción de la respuesta, el ajuste estricto al enunciado oficial y la presentación.",
      }
    ]
  },
  ...examenesBiologiaCataluna,
]
