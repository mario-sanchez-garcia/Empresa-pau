// ═══════════════════════════════════════════════════════════════════════
// FÍSICA — Exámenes EBAU/PAU Madrid 2018-2025
// Ordinaria 2019-2025 extraída de PDFs oficiales; 2018 preservada del PDF escaneado.
// ═══════════════════════════════════════════════════════════════════════

export type TipoFisica =
  | "Gravitacion"
  | "Ondas"
  | "Electricidad"
  | "Optica"
  | "RadioactividadModerna";

export interface PreguntaFisica {
  id: string;
  año: number;
  convocatoria: "Ordinaria" | "Extraordinaria" | "Modelo";
  opcion: "A" | "B";
  tipo: TipoFisica;
  numero: string;
  enunciado: string;
  apartados: string[];
  datos?: string[];
  puntos: number;
}

function numeroPreguntaFisica(pregunta: PreguntaFisica) {
  const numero = pregunta.numero.trim()
  const yaNormalizado = numero.match(/^([AB])\.(\d+)$/)
  if (yaNormalizado) return numero

  const conOpcionAlFinal = numero.match(/^(\d+)\.([AB])$/)
  if (conOpcionAlFinal) return `${conOpcionAlFinal[2]}.${conOpcionAlFinal[1]}`

  const soloNumero = numero.match(/^(\d+)$/)
  if (soloNumero) return `${pregunta.opcion}.${soloNumero[1]}`

  return `${pregunta.opcion}.${numero}`
}

function enunciadoFisica(pregunta: PreguntaFisica) {
  const encabezado = `**Pregunta ${numeroPreguntaFisica(pregunta)}:**`
  const enunciado = pregunta.enunciado
    .trim()
    .replace(/[ \t]*(?:\n[ \t]*)*((?:Datos|Dato):)/g, "\n\n$1")

  const apartados = pregunta.apartados
    .map((apartado, i) => `${String.fromCharCode(97 + i)}) ${apartado}`)
    .join("\n\n")

  const datos = pregunta.datos?.length ? `Datos: ${pregunta.datos.join("; ")}` : ""

  return [encabezado, enunciado, apartados, datos].filter(Boolean).join("\n\n")
}

export const examenesF: PreguntaFisica[] = [
  // ══════════════════════════════════════════════
  // JUNIO 2025-2019 — Ordinaria oficial desde PDFs
  // ══════════════════════════════════════════════

  {
    id: "f-2025-jun-1",
    año: 2025, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Gravitacion", numero: "1",
    enunciado: `Eris es un planeta enano del sistema solar descubierto en enero de 2005 por un equipo
del observatorio del Monte Palomar dirigido por Michael E. Brown. Es el objeto transneptuniano más
masivo, el segundo más grande después de Plutón, y el cuerpo más grande del sistema solar que no ha
sido visitado por una sonda espacial. Tiene un diámetro de 2330 km, ligeramente inferior al de Plutón, y
su densidad es de $2{,}5\ \\text{g cm}^{-3}$. La órbita de Eris es muy excéntrica; actualmente el planeta se encuentra
a su máxima distancia del Sol (afelio), a $1{,}45 \\cdot 10^{13}$ m, llegando a situarse a $5{,}24 \\cdot 10^{12}$ m del Sol durante
su perihelio.

a) (1 punto) Calcule la masa del planeta y el valor de la aceleración de la gravedad en su superficie.

b) (1,5 puntos) Sabiendo que la energía mecánica de un objeto de masa $m_1$ que orbita alrededor de
un objeto de masa $m_2$ con una órbita elíptica de semieje mayor $a$ es
$$E_{mec} = -\\dfrac{Gm_1m_2}{2a},$$
donde $G$ es la constante de la gravitación universal, halle la energía mecánica de Eris y calcule la
velocidad orbital que tendrá en el perihelio.

Datos: Constante de gravitación universal, $G = 6{,}67 \\cdot 10^{-11}\ \\text{N m}^2\ \\text{kg}^{-2}$; Masa del Sol, $M_{\\text{Sol}} = 1{,}99 \\cdot 10^{30}\ \\text{kg}$.`,
    apartados: [],
    puntos: 2.5,
  },
  {
    id: "f-2025-jun-2A",
    año: 2025, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Electricidad", numero: "2.A",
    enunciado: `Un electrón de carga $-e$ y un positrón de carga $+e$ se encuentran inicialmente fijos en
el plano $xy$ en las posiciones $(0, 6)$ nm y $(0, -6)$ nm, respectivamente.

a) (1,25 puntos) Obtenga el campo eléctrico en el punto $(8, 0)$ nm debido a ambas partículas.

b) (1,25 puntos) Si al positrón se le imprime una velocidad de $-1{,}5 \\cdot 10^5\ \\text{m s}^{-1}\ \\hat{j}$, permaneciendo fijo
el electrón, determine la máxima distancia de alejamiento entre ambas partículas.

Datos: Constante de la ley de Coulomb, $K = 9 \\cdot 10^9\ \\text{N m}^2\ \\text{C}^{-2}$; Valor absoluto de la carga del electrón y del positrón,
$e = 1{,}6 \\cdot 10^{-19}\ \\text{C}$; Masa del electrón y del positrón, $m_e = 9{,}1 \\cdot 10^{-31}\ \\text{kg}$.`,
    apartados: [],
    puntos: 2.5,
  },
  {
    id: "f-2025-jun-2B",
    año: 2025, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Electricidad", numero: "2.B",
    enunciado: `Una espira conductora circular de radio 20 cm se en-
cuentra en el seno de un campo magnético homogéneo perpendicular
al plano de la espira (ver figura). Si la espira tiene una resistencia de
40 Ω, calcule la máxima intensidad de corriente que circulará por la
espira en los siguientes casos:

a) (1,25 puntos) El módulo del campo magnético es constante de
valor $B = 150$ mT, y la espira gira en torno a uno de sus diáme-
tros con una velocidad angular de 50 rad s$^{-1}$.

b) (1,25 puntos) La espira se encuentra fija, y el módulo del campo
magnético varía con el tiempo conforme a $B = B_0\\sin(\\omega t)$, con $B_0 = 200$ mT y $\\omega = 75$ rad s$^{-1}$.`,
    apartados: [],
    puntos: 2.5,
  },
  {
    id: "f-2025-jun-3A",
    año: 2025, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Ondas", numero: "3.A",
    enunciado: `Una ballena sumergida en el mar a una cierta profundidad emite un potente sonido
grave de 60 Hz y 25 m de longitud de onda. Un barco A, situado sobre su vertical, detecta dicho sonido
con su sónar 80 ms después de ser emitido, y poco tiempo después es detectado por otro barco B
situado a 300 m del barco A.

a) (1 punto) Halle la profundidad a la que se encuentra la ballena.

b) (1,5 puntos) Si el barco A recibe el sonido con una intensidad de 3 μW m$^{-2}$, calcule la potencia
del sonido emitido por la ballena y el nivel de intensidad sonora que detectará el barco B.

Dato: Intensidad umbral, $I_0 = 1 \\cdot 10^{-12}\ \\text{W m}^{-2}$.`,
    apartados: [],
    puntos: 2.5,
  },
  {
    id: "f-2025-jun-3B",
    año: 2025, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Optica", numero: "3.B",
    enunciado: `Considere la imagen formada por una lente delgada de distancia focal $f'$ de un objeto
situado a una distancia $s$ a la izquierda de la lente.

a) (1 punto) Demuestre que el aumento lateral $M$ tiene la siguiente expresión en función de la dis-
tancia focal $f'$ y la posición del objeto $s$:
$$M = \\dfrac{f'}{f'+s}$$

b) (0,5 puntos) Considerando la expresión obtenida en el apartado anterior, razone si una lente
divergente puede formar una imagen invertida.

c) (1 punto) Dibuje el trazado de rayos a través del sistema óptico de la imagen formada por una
lente divergente si el objeto se sitúa a una distancia dos veces su distancia focal.`,
    apartados: [],
    puntos: 2.5,
  },
  {
    id: "f-2025-jun-4A",
    año: 2025, convocatoria: "Ordinaria", opcion: "A",
    tipo: "RadioactividadModerna", numero: "4.A",
    enunciado: `Las moléculas de ozono absorben luz ultravioleta (UV) de alta energía, lo que evita que
llegue a la superficie de la Tierra demasiada radiación dañina para los seres vivos.

a) (1 punto) Halle la diferencia de energía, expresada en electrón-voltios, entre los niveles electróni-
cos de la molécula de ozono que inducen la absorción de radiación de 260 nm.

b) (1,5 puntos) Si el flujo de fotones de 260 nm que le llega a una persona con su cuerpo expuesto
al sol es de $2{,}6 \\cdot 10^{14}$ fotones s$^{-1}$, calcule la potencia que le incide debida a esos fotones UV y la
energía recibida en 30 minutos.

Datos: Valor absoluto de la carga del electrón, $e = 1{,}6 \\cdot 10^{-19}\ \\text{C}$; Constante de Planck, $h = 6{,}63 \\cdot 10^{-34}\ \\text{J s}$; Velocidad de la
luz en el vacío, $c = 3 \\cdot 10^8\ \\text{m s}^{-1}$.`,
    apartados: [],
    puntos: 2.5,
  },
  {
    id: "f-2025-jun-4B",
    año: 2025, convocatoria: "Ordinaria", opcion: "B",
    tipo: "RadioactividadModerna", numero: "4.B",
    enunciado: `El mineral de cuarzo (SiO$_2$) sobre la superficie de la Tierra contiene impurezas de
aluminio, con una cantidad de 0,1 % de átomos de $^{26}$Al en relación a los átomos de silicio. Cuando el
mineral se entierra debido a diversos procesos geológicos (sedimentación, glaciares, etc.) los átomos
de $^{26}$Al se desintegran con un tiempo de semidesintegración de 0,72 millones de años.

a) (1,25 puntos) Calcule la actividad de una muestra de mineral de cuarzo, debida a la presencia de
isótopos de $^{26}$Al, situada en superficie si contiene $8{,}3 \\cdot 10^{22}$ átomos de silicio.

b) (1,25 puntos) Se recoge una muestra de cuarzo de unos sedimentos, obteniéndose una relación
de 0,08 % de átomos de $^{26}$Al respecto a los átomos de silicio. Obtenga la edad correspondiente a
la formación de dichos sedimentos.`,
    apartados: [],
    puntos: 2.5,
  },
  {
    id: "f-2024-jun-A1",
    año: 2024, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Gravitacion", numero: "A.1",
    enunciado: `La distancia del satélite Halimede a Neptuno, planeta alrededor del cual orbita, varía
entre 12 y 21 millones de km.

a) Calcule el trabajo realizado por la atracción gravitatoria de Neptuno sobre Halimede en el tránsito
del punto más próximo al más distante de la órbita.

b) Sabiendo que la energía mecánica de Halimede vale $-2{,}5 \\cdot 10^{20}$ J, determine la velocidad máxima
que alcanza en su órbita.

Datos: Constante de Gravitación Universal, $G = 6{,}67 \\cdot 10^{-11}\ \\text{N m}^2\ \\text{kg}^{-2}$; Masa de Halimede, $M_H = 1{,}60 \\cdot 10^{15}\ \\text{kg}$; Masa de
Neptuno, $M_N = 1{,}02 \\cdot 10^{26}\ \\text{kg}$.`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2024-jun-A2",
    año: 2024, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Ondas", numero: "A.2",
    enunciado: `Por una cuerda tensa dispuesta a lo largo del eje $x$ se propaga, a una velocidad de
200 m s$^{-1}$ en el sentido positivo del eje, una onda armónica de 0,4 m de longitud de onda. En el
instante inicial y en el origen de coordenadas, la elongación es positiva y también lo es la velocidad de
oscilación, que equivale a la mitad de su valor máximo. Obtenga:

a) El número de onda y la frecuencia de la onda.

b) La fase inicial de la onda.`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2024-jun-A3",
    año: 2024, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Electricidad", numero: "A.3",
    enunciado: `Un hilo conductor de longitud indefinida se extiende a lo largo del eje $z$. Otro hilo de
longitud indefinida paralelo al primero pasa por el punto $(5, 0, 0)$ cm. Los dos hilos se repelen con una
fuerza por unidad de longitud de $5 \\cdot 10^{-5}$ N m$^{-1}$. El campo magnético total se anula a lo largo de la recta
$x = +10$ cm en el plano $xz$.

a) Explique si las corrientes en los hilos son paralelas o antiparalelas y calcule su magnitud.

b) Determine el módulo del campo magnético en el punto $(-5, 0, 0)$ cm.

Dato: Permeabilidad magnética del vacío, $\\mu_0 = 4\\pi \\cdot 10^{-7}\ \\text{T m A}^{-1}$.`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2024-jun-A4",
    año: 2024, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Optica", numero: "A.4",
    enunciado: "Un objeto de 4 mm de altura está situado 20 cm a la izquierda de una lente delgada.\nLa imagen que se forma es derecha y tiene una altura de 2 mm.\n\na) Calcule la potencia de la lente e indique si es convergente o divergente.\n\nb) Elabore el trazado de rayos correspondiente a la situación descrita.",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2024-jun-A5",
    año: 2024, convocatoria: "Ordinaria", opcion: "A",
    tipo: "RadioactividadModerna", numero: "A.5",
    enunciado: `Una placa de cobalto se expone a luz de una determinada intensidad y de frecuencia
igual a 1,2 veces la frecuencia umbral para el efecto fotoeléctrico en ese material. En estas condiciones,
se registra un cierto potencial de frenado $V_1$.

a) Si se duplica la frecuencia de la luz incidente, se registra un nuevo potencial de frenado $V_2$, que
es 6 V mayor que $V_1$. Obtenga el trabajo de extracción para el cobalto y el valor de la frecuencia
umbral.

b) Si se mantiene la frecuencia inicial y se duplica la intensidad de la luz incidente, ¿cómo se modi-
ficará el potencial de frenado?

Datos: Valor absoluto de la carga del electrón, $e = 1{,}6 \\cdot 10^{-19}\ \\text{C}$; Constante de Planck, $h = 6{,}63 \\cdot 10^{-34}\ \\text{J s}$.`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2024-jun-B1",
    año: 2024, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Gravitacion", numero: "B.1",
    enunciado: `Un satélite de 200 kg de masa se mueve en una órbita cerrada alrededor de la Tierra.
En un determinado instante, es detectado a 630 km de altura, moviéndose a 9,92 km s$^{-1}$ con velocidad
perpendicular a la dirección radial.

a) Compare la velocidad del satélite con la correspondiente a una órbita circular de la altura dada y
del resultado anterior, razone si la órbita es circular o elíptica.

b) Calcule los módulos del momento angular y de la aceleración del satélite en el instante señalado.

Datos: Constante de Gravitación Universal, $G = 6{,}67 \\cdot 10^{-11}\ \\text{N m}^2\ \\text{kg}^{-2}$; Masa de la Tierra, $M_T = 5{,}97 \\cdot 10^{24}\ \\text{kg}$; Radio de la
Tierra, $R_T = 6{,}37 \\cdot 10^6\ \\text{m}$.`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2024-jun-B2",
    año: 2024, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Ondas", numero: "B.2",
    enunciado: `El campanario de una iglesia medieval, situado a 35 m de altura, consta de 4 campanas.
Cada una de ellas emite 10 mW de potencia sonora tras ser golpeada. Por otro lado, el límite de
contaminación acústica en ese municipio está establecido en 55 dB.

a) Determine el nivel de intensidad sonora que percibe una persona parada al pie de la torre del
campanario cuando se toca una sola campana.

b) ¿Podrán tocar las cuatro campanas a la vez si no se quiere sobrepasar el límite de contaminación
acústica y la población está situada a más de 100 metros de la iglesia?

Dato: Intensidad umbral, $I_0 = 1 \\cdot 10^{-12}\ \\text{W m}^{-2}$.`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2024-jun-B3",
    año: 2024, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Electricidad", numero: "B.3",
    enunciado: `Dos partículas situadas en los puntos $(-6, 0)$ mm y $(6, 0)$ mm del plano $xy$ poseen
cargas iguales de $+9$ nC. Obtenga el potencial eléctrico y el campo eléctrico en:

a) El origen de coordenadas.

b) El punto $(0, 3)$ mm.

Dato: Constante de la ley de Coulomb, $K = 9 \\cdot 10^9\ \\text{N m}^2\ \\text{C}^{-2}$.`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2024-jun-B4",
    año: 2024, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Optica", numero: "B.4",
    enunciado: "El prisma de sección triangular mostrado en la figura está hecho\nde un material con índice de refracción np. Se halla inmerso en aire, con índice\nde refracción igual a 1.\n\na) Determine el índice de refracción np si se sabe que el ángulo límite para la\nreflexión total en el paso del prisma al aire vale 45, 58◦.\n\nb) Considere un rayo de luz que incide perpendicularmente sobre la superficie\ndel prisma desde el aire, en el punto P. Elabore un diagrama mostrando su\nrecorrido en el interior del prisma hasta que vuelve a emerger al aire, y\ncalcule el ángulo de refracción a la salida.\n\n![Esquema óptico del paralelepípedo](/fisica-imgs/madrid/2024/ordinaria/fisica-2024-ordinaria-b4.png)",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2024-jun-B5",
    año: 2024, convocatoria: "Ordinaria", opcion: "B",
    tipo: "RadioactividadModerna", numero: "B.5",
    enunciado: `Dos muestras, cada una de un radioisótopo distinto (radioisótopo
1 y radioisótopo 2) contienen en el momento de su preparación la misma masa
del radioisótopo correspondiente. Las medidas de actividad de las muestras 1 y
2 para el instante inicial ($t = 0$) y al cabo de un día arrojan los siguientes valores:
$A_1$ (kBq) $\\quad A_2$ (kBq)
$t = 0$: 10,00 $\\quad$ 11,70
$t = 1$ d: 8,90 $\\quad$ 10,77

a) Calcule el período de semidesintegración de cada radioisótopo.

b) Si $M_1$ y $M_2$ denotan las respectivas masas atómicas de los radioisótopos, determine el cociente
$M_2/M_1$.

![Gráfica del efecto fotoeléctrico](/fisica-imgs/madrid/2024/ordinaria/fisica-2024-ordinaria-b5.png)`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2023-jun-A1",
    año: 2023, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Gravitacion", numero: "A.1",
    enunciado: `Un satélite de la constelación OneWeb, de 150 kg de masa, se encuentra en una
órbita circular alrededor de la Tierra a una altura de 1200 km sobre el nivel del mar. Determine:

a) Las energías potencial gravitatoria y cinética que tiene el satélite en su órbita.

b) La energía que fue necesario comunicar al satélite para ponerlo en órbita desde la superficie
de la Tierra.

Datos: Constante de Gravitación Universal, $G = 6{,}67 \\cdot 10^{-11}\ \\text{N m}^2\ \\text{kg}^{-2}$; Masa de la Tierra, $M_T = 5{,}97 \\cdot 10^{24}\ \\text{kg}$; Radio de la
Tierra, $R_T = 6{,}37 \\cdot 10^6\ \\text{m}$.`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2023-jun-A2",
    año: 2023, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Ondas", numero: "A.2",
    enunciado: `A lo largo de una cuerda se propaga en el sentido $+x$ una onda transversal. El periodo
de oscilación y la elongación máxima de un punto cualquiera de la cuerda son, respectivamente,
$4 \\cdot 10^{-3}$ s y 3 mm. La distancia mínima entre dos puntos cualesquiera de la cuerda que oscilan en fase
es de 0,25 metros. En el instante $2 \\cdot 10^{-3}$ s la elongación de un punto situado a $+0{,}5$ m del origen de
coordenadas es de $-1{,}5$ mm y su velocidad de oscilación en ese instante es positiva.

a) Halle la frecuencia angular y la velocidad de propagación de la onda.

b) Obtenga la expresión matemática que describe a la onda.`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2023-jun-A3",
    año: 2023, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Electricidad", numero: "A.3",
    enunciado: `Tres cargas $-q$, $-q$ y $+2q$ se encuentran situadas en los
puntos del plano $(-a, a)$, $(a, a)$ y $(0, 0)$, respectivamente, tal y como se
describe en la figura. Determine, en función de la constante de
Coulomb, $K$, el valor de la carga, $q$, y la distancia, $a$:

a) La expresión de la fuerza electrostática que se ejerce sobre la
carga situada en la posición $(a, a)$ y la expresión del trabajo
que habrá realizado esa fuerza electrostática para traer la
carga $-q$ desde el infinito a la posición $(a, a)$.

b) El flujo del campo eléctrico a través de las superficies cerradas
$S_1$ y $S_2$.

Dato: Permitividad eléctrica del vacío; $\\varepsilon_0 = 1/(4\\pi K)$.

![Distribución de tres cargas puntuales en el plano](/fisica-imgs/madrid/2023/ordinaria/fisica-2023-ordinaria-a3.png)`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2023-jun-A4",
    año: 2023, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Optica", numero: "A.4",
    enunciado: "Un objeto de 2 cm de altura se sitúa a 18 cm a la izquierda de una pantalla. Entre la\npantalla y el objeto, a 14,2 cm de este, se sitúa una lente convergente.\n\na) \tDetermine la distancia focal que debe tener la lente para que se enfoque la imagen del objeto\nsobre la pantalla y el tamaño de la imagen.\n\nb) \tA continuación, se retira la pantalla y se sitúa a 5 cm a la derecha de la primera lente otra lente\nconvergente de distancia focal 1,2 cm. ¿Dónde se formará la nueva imagen? Realice el\ncorrespondiente trazado de rayos.",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2023-jun-A5",
    año: 2023, convocatoria: "Ordinaria", opcion: "A",
    tipo: "RadioactividadModerna", numero: "A.5",
    enunciado: `Se sospecha que un acuífero recibe aportes intermitentes de radón ($^{222}$Rn). Para
comprobarlo, se toman semanalmente medidas de la actividad radiactiva de muestras de agua. Una
de esas medidas arroja un valor de 14 Bq para una muestra de un litro. Determine el valor de la medida
de la siguiente semana, para otra muestra de un litro, en cada una de las siguientes condiciones:

a) Si no hubiese ningún aporte de $^{222}$Rn en el transcurso de esa semana.

b) Si el cuarto día de esa semana la concentración de $^{222}$Rn en el acuífero experimentase un
aumento súbito de $2 \\cdot 10^{-16}$ g por cada litro de agua.

Datos: Período de semidesintegración del $^{222}$Rn, $T_{1/2} = 3{,}8$ días; Masa atómica del $^{222}$Rn, $M_{222\\text{-Rn}} = 222$ u; Número de
Avogadro, $N_A = 6{,}02 \\cdot 10^{23}\ \\text{mol}^{-1}$.`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2023-jun-B1",
    año: 2023, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Gravitacion", numero: "B.1",
    enunciado: `En la película Space Cowboys un
amenazador satélite militar orbita alrededor de la
Tierra a una altura de 1600 km sobre la superficie
terrestre.

a) Calcule la velocidad orbital del satélite y
el tiempo que tarda en dar una vuelta
completa alrededor de la Tierra.
Desprecie en este apartado la interacción
gravitatoria de la Luna.

b) Para evitar que el satélite caiga a la Tierra se decide impulsarlo hacia la Luna. Determine la
distancia $x$ al centro de la Tierra, tal y como se muestra en la figura, a la que tendrá que llegar
el satélite, para que el efecto del campo gravitatorio lunar sea superior al del campo
gravitatorio terrestre.

Datos: Constante de Gravitación Universal, $G = 6{,}67 \\cdot 10^{-11}\ \\text{N m}^2\ \\text{kg}^{-2}$; Masa de la Tierra, $M_T = 5{,}97 \\cdot 10^{24}\ \\text{kg}$; Radio de la
Tierra, $R_T = 6{,}37 \\cdot 10^3$ km; Masa de la Luna, $M_L = 7{,}35 \\cdot 10^{22}\ \\text{kg}$; Distancia de la Tierra a la Luna, $d = 3{,}84 \\cdot 10^5$ km.`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2023-jun-B2",
    año: 2023, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Ondas", numero: "B.2",
    enunciado: `Un observador que se encuentra a 3 m de una fuente puntual sonora que emite en
todas direcciones mide un nivel de intensidad sonora de 53 dB. Halle:

a) La intensidad sonora recibida por el observador y la potencia con la que emite la fuente
puntual.

b) La distancia a la que debe situarse el observador para que el nivel de intensidad sonora
percibido se reduzca a una cuarta parte.

Dato: Intensidad umbral, $I_0 = 10^{-12}\ \\text{W m}^{-2}$.`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2023-jun-B3",
    año: 2023, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Electricidad", numero: "B.3",
    enunciado: `Un ion de He$^+$ se sitúa inicialmente en reposo dentro de una región del espacio donde
existe un campo eléctrico homogéneo de $10^3$ V m$^{-1}$ que está dirigido a lo largo del eje $+x$.

a) Calcule la aceleración que experimenta el ion en el instante inicial.

b) Determine la fuerza total sobre el ion si a los 20 μs de ser depositado se aplica un campo
magnético homogéneo de 0,6 T a lo largo del eje $+y$.

Datos: Masa atómica del ion de He$^+$, $M_{\\text{He}} = 4$ u; Número de Avogadro, $N_A = 6{,}02 \\cdot 10^{23}\ \\text{mol}^{-1}$; Valor absoluto de la carga
del electrón, $e = 1{,}6 \\cdot 10^{-19}\ \\text{C}$.`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2023-jun-B4",
    año: 2023, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Optica", numero: "B.4",
    enunciado: "Un rayo de luz incide sobre la cara izquierda del\nprisma de la figura, el cual está construido con un material cuyo\níndice de refracción vale 1,66.\n\na) \tDetermine los ángulos α y\nβ de la trayectoria que sigue\nel rayo de luz que entra en el prisma desde el aire con\nun ángulo de incidencia de 50º.\n\nb) \tCalcule el ángulo límite con el que deberá incidir desde\nel aire el rayo de luz para que este no emerja del prisma.\n\nDato: Índice de refracción del aire, n = 1.\n\n![Esquema de lentes delgadas](/fisica-imgs/madrid/2023/ordinaria/fisica-2023-ordinaria-b4.png)",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2023-jun-B5",
    año: 2023, convocatoria: "Ordinaria", opcion: "B",
    tipo: "RadioactividadModerna", numero: "B.5",
    enunciado: `Para estudiar el efecto fotoeléctrico se
registra la intensidad de corriente entre un cierto metal
emisor de fotoelectrones y una placa en función del
potencial eléctrico aplicado entre ambos, mientras se
ilumina el metal fotoemisor con un cierto haz de luz. La
gráfica adjunta muestra los datos para luz de 379 nm y
544 nm, donde se observan potenciales de frenado de 2,5 V
y de 1,5 V, respectivamente.

a) A partir de los potenciales de frenado, obtenga el
valor de la constante de Planck.

b) Indique cuáles serían los valores del potencial de
frenado y de la intensidad de corriente máxima para
el haz de luz de 379 nm si se disminuyese a la mitad
la intensidad del haz.

Datos: Velocidad de la luz en el vacío, $c = 3 \\cdot 10^8\ \\text{m s}^{-1}$; Valor absoluto de la carga del electrón, $e = 1{,}6 \\cdot 10^{-19}\ \\text{C}$.

![Gráfica de actividad radiactiva frente al tiempo](/fisica-imgs/madrid/2023/ordinaria/fisica-2023-ordinaria-b5.png)`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2022-jun-A1",
    año: 2022, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Gravitacion", numero: "A.1",
    enunciado: `Una partícula de masa 20 kg permanece fija en el origen de coordenadas.

a) Calcule el campo gravitatorio generado por la masa en el punto $(8, 6)$ m y la fuerza que
experimentará una segunda partícula de masa 3 kg situada en dicho punto.

b) Con el objetivo de alejar la segunda partícula, se le transmite una velocidad de $1{,}2 \\cdot 10^{-5}$ m s$^{-1}$
en la dirección de la recta que une ambas partículas. Halle el punto más alejado del origen que
alcanzará dicha partícula.

Datos: Constante de Gravitación Universal, $G = 6{,}67 \\cdot 10^{-11}\ \\text{N m}^2\ \\text{kg}^{-2}$.`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2022-jun-A2",
    año: 2022, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Ondas", numero: "A.2",
    enunciado: `Por una cuerda dispuesta a lo largo del eje $x$ viaja una onda armónica que desplaza
los elementos de la cuerda en la dirección del eje $y$. Se sabe que los elementos A y B, respectivamente
ubicados en $x_A = 0$ m y $x_B = 2$ m, oscilan en fase y cortan al eje $x$ cada 4 s. Teniendo en cuenta que no
hay entre A y B ningún otro elemento que oscile en fase con ellos:

a) Calcule el valor de la velocidad de propagación.

b) Escriba la expresión matemática de la onda, si esta viaja en el sentido negativo del eje $x$ y en
el instante inicial los elementos A y B presentan desplazamiento igual a $+10$ cm y velocidad
nula.`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2022-jun-A3",
    año: 2022, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Electricidad", numero: "A.3",
    enunciado: `La figura representa una varilla metálica de 20 cm de longitud, cuyos extremos deslizan
sin rozamiento sobre unos raíles horizontales, paralelos al eje $x$, metálicos y de resistencia
despreciable. La varilla tiene resistencia despreciable y su velocidad es $\\vec{v} = 2\ \\hat{i}$ m s$^{-1}$. Los raíles están conectados en $x = 0$
por una resistencia de valor $R = 0{,}5\ \\Omega$. En la región hay un
campo magnético uniforme $\\vec{B} = -0{,}4\ \\hat{k}$ T. Calcule:

a) La intensidad de la corriente en el circuito formado por la
varilla, la resistencia y los tramos de raíl entre ellas.

b) La fuerza $\\vec{F}$ que el campo magnético ejerce sobre la
varilla.

![Esquema de campo magnético generado por corrientes](/fisica-imgs/madrid/2022/ordinaria/fisica-2022-ordinaria-a3.png)`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2022-jun-A4",
    año: 2022, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Optica", numero: "A.4",
    enunciado: "Dos lentes convergentes idénticas están separadas 16 cm. Cuando un objeto se sitúa\na una cierta distancia a la izquierda de la primera lente, se encuentra que cada una de ellas opera con\naumento igual a -1.\n\na) \tDetermine la potencia de las lentes.\n\nb) \t¿Cuánto y hacia dónde debe desplazarse la segunda lente para lograr que la imagen del\nsistema se forme en el infinito?",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2022-jun-A5",
    año: 2022, convocatoria: "Ordinaria", opcion: "A",
    tipo: "RadioactividadModerna", numero: "A.5",
    enunciado: `Una muestra contiene inicialmente una masa de 30 mg de $^{210}$Po. Sabiendo que su
período de semidesintegración es de 138,38 días, determine:

a) La vida media del isótopo y la actividad inicial de la muestra.

b) El tiempo que debe transcurrir para que el contenido de $^{210}$Po de la muestra se reduzca a
5 mg.

Datos: Masa atómica del $^{210}$Po, $M_{\\text{Po}} = 210$ u; Número de Avogadro, $N_A = 6{,}02 \\cdot 10^{23}\ \\text{mol}^{-1}$.`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2022-jun-B1",
    año: 2022, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Gravitacion", numero: "B.1",
    enunciado: `Marte posee la décima parte de la masa de la Tierra y la mitad de su diámetro.

a) Encuentre la relación entre las velocidades de escape de Marte y de la Tierra desde sus
respectivas superficies.

b) Suponga que un objeto se lanza verticalmente desde la superficie terrestre, con una velocidad
igual a la velocidad de escape de Marte. Si se desprecia el rozamiento, ¿qué altura máxima
alcanzaría el objeto?

Dato: Radio de la Tierra, $R_T = 6{,}37 \\cdot 10^6$ m.`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2022-jun-B2",
    año: 2022, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Ondas", numero: "B.2",
    enunciado: `Un foco sonoro de potencia $P$ se coloca a una
altura $h$ sobre el suelo, como ilustra la figura. El nivel de
intensidad sonora vale 60 dB en el punto A, a 100 m de
distancia del foco, y alcanza 80 dB en el punto B, en el suelo
en la vertical del foco.

a) Calcule $P$ y $h$.

b) ¿Cuál sería el nivel de intensidad en el punto B si se
agregase sobre él otro foco de igual potencia a una
altura de $h/2$?

Dato: Intensidad umbral de audición, $I_0 = 10^{-12}\ \\text{W m}^{-2}$.

![Representación de una onda transversal](/fisica-imgs/madrid/2022/ordinaria/fisica-2022-ordinaria-b2.png)`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2022-jun-B3",
    año: 2022, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Electricidad", numero: "B.3",
    enunciado: `Una carga puntual positiva está situada en el punto $(3, 4)$ m del plano $xy$. En otro
punto del plano se coloca una segunda carga puntual, también positiva y de magnitud el cuádruple
de la primera, haciendo que el campo se anule en el origen de coordenadas.

a) Determine la posición de la segunda carga.

b) Si el potencial en el origen de coordenadas vale $1{,}08 \\cdot 10^4$ V, encuentre el valor de las cargas.

Dato: Constante de la ley de Coulomb, $K = 9 \\cdot 10^9\ \\text{N m}^2\ \\text{C}^{-2}$.`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2022-jun-B4",
    año: 2022, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Optica", numero: "B.4",
    enunciado: "Una lámina de vidrio se halla sobre un líquido\nde índice de refracción desconocido. La longitud de onda de la\nluz en el vidrio se reduce a un 70 % de su valor en el aire. Si se\nemite luz desde el líquido, los rayos con ángulos de incidencia\nsuperiores a 30º en la cara inferior de la lámina no se refractan\nal aire por su cara superior. Calcule:\n\na) \tEl índice de refracción del vidrio.\n\nb) \tEl índice de refracción del líquido.\n\nDato: Índice de refracción del aire, naire = 1.\n\n![Esquema de lámina de vidrio sobre líquido](/fisica-imgs/madrid/2022/ordinaria/fisica-2022-ordinaria-b4.png)",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2022-jun-B5",
    año: 2022, convocatoria: "Ordinaria", opcion: "B",
    tipo: "RadioactividadModerna", numero: "B.5",
    enunciado: `Un electrón relativista ha llegado a adquirir una energía cinética equivalente a la energía
de un fotón de $5 \\cdot 10^{-12}$ m de longitud de onda en el vacío. Calcule:

a) La energía cinética del electrón, en eV.

b) La velocidad del electrón.

Datos: Valor absoluto de la carga del electrón, $e = 1{,}6 \\cdot 10^{-19}\ \\text{C}$; Constante de Planck, $h = 6{,}63 \\cdot 10^{-34}\ \\text{J s}$;
Velocidad de la luz en el vacío, $c = 3 \\cdot 10^8\ \\text{m s}^{-1}$; Masa del electrón en reposo, $m_e = 9{,}1 \\cdot 10^{-31}\ \\text{kg}$.`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2021-jun-A1",
    año: 2021, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Gravitacion", numero: "A.1",
    enunciado: `Una masa puntual de 50 g se encuentra situada en la posición $(8, 0)$ m del plano $xy$.
Calcule:

a) El potencial gravitatorio y el campo gravitatorio en el punto $(0, 6)$ m del plano debido a
dicha masa.

b) El trabajo realizado por el campo al trasladar un objeto puntual de 20 g desde el punto
$(0, 6)$ m hasta el origen de coordenadas.

Dato: Constante de Gravitación Universal, $G = 6{,}67 \\cdot 10^{-11}\ \\text{N m}^2\ \\text{kg}^{-2}$.`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2021-jun-A2",
    año: 2021, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Ondas", numero: "A.2",
    enunciado: `Al explotar, un cohete de fuegos artificiales genera una onda sonora esférica con
una potencia sonora de 20 mW. Un espectador oye la explosión 1,5 s después de verlo explotar.
Calcule:

a) La distancia a la que está situado el espectador respecto al cohete en el momento de la
explosión, así como la intensidad del sonido en la posición del espectador.

b) El nivel de intensidad sonora percibida si explotan 10 cohetes simultáneamente, y el
espectador los oye todos al unísono 1,5 s después de explotar.

Datos: Velocidad del sonido en el aire, $v_s = 340$ m s$^{-1}$; Valor umbral de la intensidad acústica, $I_0 = 10^{-12}\ \\text{W m}^{-2}$.`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2021-jun-A3",
    año: 2021, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Electricidad", numero: "A.3",
    enunciado: `Una carga puntual de 2 μC se encuentra situada en el origen de coordenadas.

a) Aplicando el teorema de Gauss, obtenga el flujo del campo eléctrico a través de una
superficie esférica de 10 mm de diámetro centrada en el origen.

b) Utilizando el valor del flujo obtenido en el apartado anterior, calcule el módulo del campo
eléctrico en puntos situados a 5 mm de la carga.

Dato: Permitividad eléctrica del vacío, $\\varepsilon_0 = 8{,}85 \\cdot 10^{-12}\ \\text{C}^2\ \\text{N}^{-1}\ \\text{m}^{-2}$.`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2021-jun-A4",
    año: 2021, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Optica", numero: "A.4",
    enunciado: "Un objeto vertical de 2 mm de altura se encuentra situado 15 cm a la izquierda de\nuna lente convergente de 40 dioptrías. Calcule:\n\na) \tLa posición y tamaño de la imagen que forma la lente.\n\nb) \tLa posición de una segunda lente convergente de 6 cm de distancia focal, situada a la\nderecha de la primera lente, para que el sistema óptico genere una imagen en el infinito.",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2021-jun-A5",
    año: 2021, convocatoria: "Ordinaria", opcion: "A",
    tipo: "RadioactividadModerna", numero: "A.5",
    enunciado: `Un material posee un sistema de tres niveles energéticos electrónicos (nivel
fundamental, primer nivel, y segundo nivel). Para que un electrón pase desde el nivel fundamental al
segundo nivel, el material absorbe radiación de 450 nm; tras lo cual el material emite radiación de
600 nm debido al decaimiento del primer nivel hasta el fundamental.

a) Determine las diferencias de energía entre el primer nivel y el nivel fundamental, y entre el
segundo nivel y el nivel fundamental, expresadas en electrón-voltios.

b) Calcule la energía por unidad de tiempo que produce la emisión si el material emite
$4 \\cdot 10^{15}$ fotones s$^{-1}$.

Datos: Valor absoluto de la carga del electrón, $e = 1{,}6 \\cdot 10^{-19}\ \\text{C}$; Constante de Planck, $h = 6{,}63 \\cdot 10^{-34}\ \\text{J s}$; Velocidad de la
luz en el vacío, $c = 3 \\cdot 10^8\ \\text{m s}^{-1}$.`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2021-jun-B1",
    año: 2021, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Gravitacion", numero: "B.1",
    enunciado: `Una sonda espacial de 3500 kg se encuentra en órbita circular alrededor de
Saturno, realizando una revolución cada 36 horas. Calcule:

a) La velocidad orbital y la energía mecánica que posee la sonda espacial.

b) La energía mínima necesaria que habría que suministrarle para que abandone el campo
gravitatorio del planeta.

Datos: Constante de Gravitación Universal, $G = 6{,}67 \\cdot 10^{-11}\ \\text{N m}^2\ \\text{kg}^{-2}$; Masa de Saturno, $M_s = 5{,}68 \\cdot 10^{26}\ \\text{kg}$.`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2021-jun-B2",
    año: 2021, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Ondas", numero: "B.2",
    enunciado: `El valor del campo eléctrico asociado a una onda electromagnética que se propaga
en un medio material en la dirección del eje $x$ viene expresado por:
$$E(x,t) = 4\\cos(3{,}43 \\cdot 10^{15}\, t - 1{,}52 \\cdot 10^7\, x)\ \\text{N C}^{-1},$$
donde todas las magnitudes están expresadas en unidades del SI. Calcule:

a) La frecuencia y la longitud de onda asociadas a la onda electromagnética.

b) La velocidad de propagación de la onda y el índice de refracción del medio por el cual se
propaga.

Dato: Velocidad de la luz en el vacío, $c = 3 \\cdot 10^8\ \\text{m s}^{-1}$.`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2021-jun-B3",
    año: 2021, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Electricidad", numero: "B.3",
    enunciado: `Un hilo conductor rectilíneo indefinido situado a lo largo del eje $x$ transporta una
corriente de 25 A en sentido positivo del eje. Obtenga:

a) El campo magnético creado por el hilo en el punto $(0, 5, 0)$ cm.

b) La fuerza magnética que experimenta un electrón cuando está en la posición $(0, 5, 0)$ cm y
tiene una velocidad de 1000 m s$^{-1}$ en sentido positivo del eje $y$.

Datos: Valor absoluto de la carga del electrón, $e = 1{,}6 \\cdot 10^{-19}\ \\text{C}$; Permeabilidad magnética del vacío,
$\\mu_0 = 4\\pi \\cdot 10^{-7}\ \\text{T m A}^{-1}$.`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2021-jun-B4",
    año: 2021, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Optica", numero: "B.4",
    enunciado: "Un rayo láser, que emite luz de longitud de onda de 488 nm en el vacío, incide\ndesde el aire sobre la superficie plana de un material con un índice de refracción de 1,55. El rayo\nincidente y el reflejado forman entre sí un ángulo de 60º.\n\na) \tDetermine la frecuencia y la longitud de onda del rayo luminoso en el aire y dentro del\nmedio material.\n\nb) \tCalcule el ángulo que formará el rayo refractado en el material con el rayo reflejado en el\naire. ¿Existirá algún ángulo de incidencia para el cual el rayo láser sufra reflexión total?\nJustifique la respuesta.\n\nDatos: Índice de refracción del aire, n aire = 1; Velocidad de la luz en el vacío, c = 3·10 8 m s-1 .",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2021-jun-B5",
    año: 2021, convocatoria: "Ordinaria", opcion: "B",
    tipo: "RadioactividadModerna", numero: "B.5",
    enunciado: `Un isótopo de una muestra radiactiva posee un periodo de semidesintegración de
5730 años.

a) Obtenga la vida media y la constante radiactiva del isótopo.

b) Si una muestra tiene $5 \\cdot 10^{20}$ átomos radiactivos en el momento inicial, calcule la actividad
inicial y el tiempo que debe trascurrir para que dicha actividad se reduzca a la décima
parte.`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2020-jun-A1",
    año: 2020, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Gravitacion", numero: "A.1",
    enunciado: `Un satélite sigue una órbita circular sincrónica (es decir, del mismo período que el de
rotación del planeta) de radio $1{,}59 \\cdot 10^5$ km en torno a un planeta de masa $1{,}90 \\cdot 10^{27}$ kg. Calcule:

a) La velocidad del satélite en la órbita.

b) El periodo de rotación del planeta sobre su eje.

Dato: Constante de Gravitación Universal, $G = 6{,}67 \\cdot 10^{-11}\ \\text{N m}^2\ \\text{kg}^{-2}$.`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2020-jun-A2",
    año: 2020, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Ondas", numero: "A.2",
    enunciado: `Una onda armónica unidimensional, que se propaga en un medio con una velocidad
de 400 m s$^{-1}$, está descrita por la siguiente expresión matemática:
$$y(x,t) = 3\\sin\!\\left(200\\pi t - kx + \\varphi_0\\right)\ \\text{cm},$$
donde $x$ y $t$ están en m y s, respectivamente. Sabiendo que $y(0, 0) = 1{,}5$ cm y que la velocidad de
oscilación en $t = 0$ y $x = 0$ es positiva, halle:

a) El número de onda $k$ y la fase inicial $\\varphi_0$.

b) La aceleración máxima de oscilación de un punto genérico del eje $x$.`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2020-jun-A3",
    año: 2020, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Electricidad", numero: "A.3",
    enunciado: `Una barra conductora, de 30 cm de longitud y paralela al eje $y$, se mueve en el plano
$xy$ con una velocidad en el sentido positivo del eje $x$. La barra se mueve sobre unos rieles conductores
paralelos en forma de U (ver figura). Perpendicular al plano,
hay un campo magnético uniforme $\\vec{B} = -10^{-3}\ \\hat{k}$ T. Halle la fuerza
electromotriz inducida en la barra en función del tiempo en los
siguientes casos:

a) La velocidad de la barra es constante e igual a $\\vec{v} = 10^2\ \\hat{i}$ m s$^{-1}$.

b) La barra parte del reposo y su aceleración es
constante e igual a $\\vec{a} = 5\ \\hat{i}$ m s$^{-2}$.

![Dos cargas puntuales en el plano](/fisica-imgs/madrid/2020/ordinaria/fisica-2020-ordinaria-a3.png)`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2020-jun-A4",
    año: 2020, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Optica", numero: "A.4",
    enunciado: "Un objeto está situado en una posición s1 a la izquierda de una lente convergente de\ndistancia focal 50 mm, de modo que forma una imagen real, invertida y de tamaño doble que el objeto.\nA continuación, el objeto se va moviendo hacia la lente hasta una posición s2 en la que la imagen es\nvirtual, derecha y de tamaño doble que la del objeto. Calcule:\n\na) \tLa posición s1 inicial del objeto y la distancia inicial entre la imagen y la lente.\n\nb) \tLa posición s2 final del objeto y la distancia final entre la imagen y la lente.",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2020-jun-A5",
    año: 2020, convocatoria: "Ordinaria", opcion: "A",
    tipo: "RadioactividadModerna", numero: "A.5",
    enunciado: `Se tienen dos fuentes radiactivas cuya actividad a día de hoy es la misma. Se sabe
que dentro de 10 años la actividad de la primera fuente será el doble que la de la segunda. Determine:

a) La diferencia, $\\lambda_2 - \\lambda_1$, que existe entre las constantes de desintegración de ambas fuentes.

b) La relación entre las actividades de dichas fuentes dentro de 20 años.`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2020-jun-B1",
    año: 2020, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Gravitacion", numero: "B.1",
    enunciado: `Se tiene un planeta de masa $1{,}95 \\cdot 10^{25}$ kg y radio 5500 km. Determine:

a) El módulo de la aceleración de la gravedad en la superficie de dicho planeta.

b) La velocidad de escape desde la superficie del planeta.

Dato: Constante de Gravitación Universal, $G = 6{,}67 \\cdot 10^{-11}\ \\text{N m}^2\ \\text{kg}^{-2}$.`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2020-jun-B2",
    año: 2020, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Ondas", numero: "B.2",
    enunciado: `A una distancia de 10 m, el nivel de intensidad sonora producida por un foco puntual
es de 20 dB. Halle:

a) La potencia del foco.

b) El nivel de intensidad sonora a 2 m del foco.

Dato: Intensidad umbral de audición, $I_0 = 10^{-12}\ \\text{W m}^{-2}$.`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2020-jun-B3",
    año: 2020, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Electricidad", numero: "B.3",
    enunciado: `Se tienen cuatro cargas cuyo valor absoluto es $|q| = 1 \\cdot 10^{-6}$ C, situadas en los vértices
de un cuadrado de lado $a = 30$ cm, que está en el plano $xy$. Dos de ellas son positivas y están en los
puntos $(0, 0)$ y $(a, a)$. Las otras dos son negativas y están situadas en los puntos $(0, a)$ y $(a, 0)$. Calcule:

a) La fuerza que se ejerce sobre la carga $+q$ situada en el punto $(a, a)$ debida a las otras tres.

b) La energía potencial de la carga situada en el origen de coordenadas debida a las otras tres.

Dato: Constante de la ley de Coulomb, $K = 9 \\cdot 10^9\ \\text{N m}^2\ \\text{C}^{-2}$.`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2020-jun-B4",
    año: 2020, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Optica", numero: "B.4",
    enunciado: "Una placa de vidrio de 4 cm de espesor\ny de índice de refracción 1,5 se encuentra sumergida\nentre dos aceites de índices de refracción 1,4 y 1,2\nrespectivamente. Proveniente del aceite de índice 1,4\nincide sobre el vidrio un haz de luz con un ángulo de\nincidencia de 30º. Calcule:\n\na) \tLa distancia, d, entre el rayo reflejado por la cara\nsuperior del vidrio y el refractado después de\nreflejarse en la cara inferior del vidrio.\n\nb) \tEl ángulo de incidencia mínimo en la cara\nsuperior \tdel \tvidrio \tnecesario \tpara \tque \tse\nproduzca el fenómeno de reflexión total en la cara inferior de la placa de vidrio.\n\n![Esquema de refracción y reflexión en una placa de vidrio](/fisica-imgs/madrid/2020/ordinaria/fisica-2020-ordinaria-b4.png)",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2020-jun-B5",
    año: 2020, convocatoria: "Ordinaria", opcion: "B",
    tipo: "RadioactividadModerna", numero: "B.5",
    enunciado: `Se hace incidir un haz de
fotones de frecuencia variable sobre una
lámina de material metálico, de manera que
se emiten electrones cuya energía cinética
máxima se mide, obteniendo la gráfica que
se adjunta. Determine:

a) El trabajo de extracción del metal
en eV.

b) La longitud de onda de de Broglie
asociada a los electrones que se
emiten, con máxima energía
cinética, cuando la frecuencia de
los fotones incidentes es de
$10 \\cdot 10^{14}$ Hz.

Datos: Valor absoluto de la carga del electrón, $e = 1{,}6 \\cdot 10^{-19}\ \\text{C}$; Masa del electrón, $m_e = 9{,}1 \\cdot 10^{-31}\ \\text{kg}$; Constante de
Planck, $h = 6{,}63 \\cdot 10^{-34}\ \\text{J s}$.

![Gráfica de energía cinética máxima frente a frecuencia](/fisica-imgs/madrid/2020/ordinaria/fisica-2020-ordinaria-b5.png)`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2019-jun-A1",
    año: 2019, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Gravitacion", numero: "A.1",
    enunciado: `Una masa puntual $m_1 = 5$ kg está situada en el punto $(4, 3)$ m.

a) Determine la intensidad del campo gravitatorio creado por la masa $m_1$ en el origen de
coordenadas y el trabajo realizado al trasladar otra masa $m_2 = 0{,}5$ kg desde el infinito hasta
el origen de coordenadas.

b) Situadas las masas $m_1$ y $m_2$ en las posiciones anteriores, ¿a qué distancia del origen de
coordenadas, el campo gravitatorio resultante es nulo?

Dato: Constante de Gravitación Universal, $G = 6{,}67 \\cdot 10^{-11}\ \\text{N m}^2\ \\text{kg}^{-2}$.`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2019-jun-A2",
    año: 2019, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Ondas", numero: "A.2",
    enunciado: `Un detector situado a cierta distancia de una fuente sonora puntual mide un nivel de
intensidad sonora de 80 dB. Si se duplica la distancia entre la fuente y el detector, determine a esta
distancia:

a) La intensidad de la onda sonora.

b) El nivel de intensidad sonora.

Dato: Intensidad umbral de audición, $I_0 = 10^{-12}\ \\text{W m}^{-2}$.`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2019-jun-A3",
    año: 2019, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Electricidad", numero: "A.3",
    enunciado: `Se tienen dos hilos conductores rectilíneos, indefinidos y paralelos al eje $z$ que cortan
al plano $xy$ en los puntos $O(0, 0, 0)$ y $A(2, 2, 0)$ cm. Por cada cable circula una corriente de 5 A en
el sentido positivo del eje $z$. Calcule:

a) El vector campo magnético en el punto $P(0, 2, 0)$ cm y en el punto $Q(1, 1, 0)$ cm.

b) La fuerza magnética por unidad de longitud que actúa sobre el conductor que pasa por el
punto $A(2, 2, 0)$ cm debida a la presencia del otro, indicando su dirección y sentido.

Dato: Permeabilidad magnética del vacío, $\\mu_0 = 4\\pi \\cdot 10^{-7}$ N A$^{-2}$.`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2019-jun-A4",
    año: 2019, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Optica", numero: "A.4",
    enunciado: "a) \tDetermine a qué distancia debe colocarse un objeto delante de una lente convergente de\n0,30 m de distancia focal, para que se forme una imagen virtual, derecha y dos veces mayor\nque el objeto.\n\nb) \tEl punto remoto de un ojo miope se encuentra 0,5 m delante de sus ojos. Determine la\npotencia de la lente que debe utilizar para ver nítido un objeto situado en el infinito.",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2019-jun-A5",
    año: 2019, convocatoria: "Ordinaria", opcion: "A",
    tipo: "RadioactividadModerna", numero: "A.5",
    enunciado: `a) La longitud de onda umbral de un metal para el efecto fotoeléctrico es 579 nm. Calcule el
trabajo de extracción del metal, y la energía cinética máxima de los electrones emitidos
expresada en eV si el metal se ilumina con una radiación de 304 nm de longitud de onda.

b) Si se hace incidir sobre otro metal la misma radiación del apartado anterior observamos
que el potencial de frenado es de 4,08 V. Calcule el trabajo de extracción de este nuevo
metal.

Datos: Constante de Planck, $h = 6{,}63 \\cdot 10^{-34}\ \\text{J s}$; Valor absoluto de la carga del electrón, $e = 1{,}6 \\cdot 10^{-19}\ \\text{C}$; Velocidad de la
luz en el vacío, $c = 3 \\cdot 10^8\ \\text{m s}^{-1}$.`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2019-jun-B1",
    año: 2019, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Gravitacion", numero: "B.1",
    enunciado: `El Amazonas 5 es un satélite geoestacionario de comunicaciones de 5900 kg puesto en
órbita en septiembre de 2017. Determine:

a) La altura sobre el ecuador terrestre del satélite y su velocidad orbital.

b) La fuerza centrípeta necesaria para que describa la órbita y la energía total del satélite en
dicha órbita.

Datos: Constante de Gravitación Universal, $G = 6{,}67 \\cdot 10^{-11}\ \\text{N m}^2\ \\text{kg}^{-2}$; Masa de la Tierra, $M_T = 5{,}97 \\cdot 10^{24}\ \\text{kg}$; Radio de la
Tierra, $R_T = 6{,}37 \\cdot 10^6$ m.`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2019-jun-B2",
    año: 2019, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Ondas", numero: "B.2",
    enunciado: `Una onda armónica transversal de frecuencia $f = 0{,}25$ Hz y longitud de onda $\\lambda = 2$ m se
propaga en el sentido positivo del eje $x$. Sabiendo que el punto situado en $x = 0{,}5$ m tiene, en el
instante $t = 2$ s, elongación nula y velocidad de oscilación negativa, y en el instante $t = 3$ s, elongación
$y = -0{,}2$ m, determine:

a) La expresión matemática que representa dicha onda.

b) La velocidad máxima de oscilación de cualquier punto alcanzado por la onda y la diferencia
de fase, en un mismo instante, entre dos puntos situados en el eje $x$ que distan entre sí
0,75 m.`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2019-jun-B3",
    año: 2019, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Electricidad", numero: "B.3",
    enunciado: `Dos cargas puntuales, con valores $q_1 = -4$ nC y $q_2 = +2$ nC respectivamente, están
situadas en los puntos $P_1(-5, 0)$ y $P_2(3, 0)$ (coordenadas en centímetros).
Determine:

a) El campo eléctrico y el potencial eléctrico en el origen de coordenadas.

b) En qué punto situado en el segmento que une las dos cargas el potencial eléctrico se anula.

Dato: Constante de la Ley de Coulomb, $K = 9 \\cdot 10^9\ \\text{N m}^2\ \\text{C}^{-2}$.`,
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2019-jun-B4",
    año: 2019, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Optica", numero: "B.4",
    enunciado: "Un rayo de luz se propaga según muestra el esquema de la\nfigura. Primero incide con un ángulo i₁ desde un medio de índice de\nrefracción n₁ = 1,6 sobre un medio de índice de refracción n₂ = 1,3 de\nmanera que el rayo reflejado y el rayo refractado forman entre sí un ángulo\nde 90º. El rayo refractado incide con el ángulo crítico $i_{c}$ sobre otro medio\nde índice de refracción n₃ desconocido. Determine:\n\na) \tLos ángulos de incidencia i₁ e $i_{c}$.\n\nb) \tEl índice de refracción n₃.",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2019-jun-B5",
    año: 2019, convocatoria: "Ordinaria", opcion: "B",
    tipo: "RadioactividadModerna", numero: "B.5",
    enunciado: `Se dispone de una muestra de 10 mg de $^{238}$Pu cuyo período de semidesintegración es
de 87,7 años y su masa atómica es 238 u. Calcule:

a) El tiempo necesario para que la muestra se reduzca a 2 mg.

b) Los valores de la actividad inicial y final.

Dato: Número de Avogadro, $N_A = 6{,}02 \\cdot 10^{23}\ \\text{mol}^{-1}$.`,
    apartados: [],
    puntos: 2,
  },

  // ══════════════════════════════════════════════
  // 2018 Ordinaria escaneada + Julio Extraordinaria preservadas
  // ══════════════════════════════════════════════


  // ══════════════════════════════════════════════
  // JULIO 2025, 2021, 2020, 2019 y 2018 — Extraordinaria Madrid
  // ══════════════════════════════════════════════

  {
    id: "f-2025-jul-1",
    año: 2025, convocatoria: "Extraordinaria", opcion: "A",
    tipo: "RadioactividadModerna", numero: "1",
    enunciado: `En Lund, Suecia, se está construyendo la futura Fuente Europea de Neutrones por Espalación. En sus instalaciones se aceleran protones, $H^+$, hasta alcanzar una energía cinética de $2\ \text{GeV}$. Posteriormente, el haz impacta sobre un blanco de tungsteno que emite neutrones, que atraviesan moderadores para modificar su energía cinética.`,
    apartados: [
      "Determine la masa relativista de los protones al final del acelerador lineal, cuando su energía cinética es de $2\\ \text{GeV}$.",
      "Si se obtienen neutrones con una energía cinética de $25\\ \text{meV}$ (no relativista), calcule su velocidad y su longitud de onda de de Broglie.",
    ],
    datos: ["$c = 3{,}0\\cdot10^8\\ \text{m s}^{-1}$", "$e = 1{,}6\\cdot10^{-19}\\ \text{C}$", "$m_{p0}=1{,}67\\cdot10^{-27}\\ \text{kg}$", "$m_n=1{,}67\\cdot10^{-27}\\ \text{kg}$", "$h=6{,}63\\cdot10^{-34}\\ \text{J s}$"],
    puntos: 2.5,
  },
  {
    id: "f-2025-jul-2A",
    año: 2025, convocatoria: "Extraordinaria", opcion: "A",
    tipo: "Gravitacion", numero: "2.A",
    enunciado: `Una nave alienígena se sitúa en una órbita circular de radio $r$ en torno a la Tierra. Los tripulantes observan que tardan $1{,}59$ h en dar una vuelta completa y saben que la velocidad de escape desde la órbita es $10{,}7\\ \text{km s}^{-1}$.`,
    apartados: [
      "Deduzca las expresiones del periodo de la órbita y de la velocidad de escape desde la órbita en función de $G$, $M_T$ y $r$.",
      "Calcule el radio de la órbita de la nave y la masa de la Tierra.",
    ],
    datos: ["$G = 6{,}67\\cdot10^{-11}\\ \text{N m}^2\\text{kg}^{-2}$"],
    puntos: 2.5,
  },
  {
    id: "f-2025-jul-2B",
    año: 2025, convocatoria: "Extraordinaria", opcion: "B",
    tipo: "Gravitacion", numero: "2.B",
    enunciado: `Sean dos partículas idénticas de masas $m_1=m_2=3\\ \text{kg}$, situadas en los puntos $P_1(0,0)$ m y $P_2(6,0)$ m del plano $xy$.`,
    apartados: [
      "Halle el campo gravitatorio creado por ambas partículas en el punto $(3,3)$ m.",
      "Calcule el trabajo que realiza la fuerza gravitatoria para llevar una partícula de masa $m=1\\ \text{kg}$ desde $(3,3)$ m hasta $(0,3)$ m.",
    ],
    datos: ["$G = 6{,}67\\cdot10^{-11}\\ \text{N m}^2\\text{kg}^{-2}$"],
    puntos: 2.5,
  },
  {
    id: "f-2025-jul-3A",
    año: 2025, convocatoria: "Extraordinaria", opcion: "A",
    tipo: "Ondas", numero: "3.A",
    enunciado: `Un muelle de constante elástica $k$ tiene uno de sus extremos unido a una pared y el otro a un bloque de masa $m$. El bloque se mueve sobre una superficie horizontal sin rozamiento. Se separa $5$ cm de la posición de equilibrio y se suelta; al pasar por el equilibrio su energía cinética es $0{,}02$ J.`,
    apartados: [
      "Determine la constante elástica del muelle.",
      "Si la masa del bloque es $m=4\\ \text{kg}$, calcule el periodo de las oscilaciones y el módulo de la velocidad cuando $x=2$ cm.",
    ],
    puntos: 2.5,
  },
  {
    id: "f-2025-jul-3B",
    año: 2025, convocatoria: "Extraordinaria", opcion: "B",
    tipo: "Optica", numero: "3.B",
    enunciado: `Se sitúa a la izquierda de una lente convergente un objeto de $4$ cm de altura, formándose una imagen real de tamaño $2$ cm. La distancia entre la posición del objeto y la imagen es de $45$ cm.`,
    apartados: [
      "Determine la posición del objeto, la posición de la imagen y la distancia focal de la lente.",
      "Halle la posición en la que debe colocarse el objeto para que la imagen real tenga tamaño $4$ cm. Realice el diagrama de rayos.",
    ],
    puntos: 2.5,
  },
  {
    id: "f-2025-jul-4A",
    año: 2025, convocatoria: "Extraordinaria", opcion: "A",
    tipo: "Electricidad", numero: "4.A",
    enunciado: `Un espectrómetro de masas consta de un selector de velocidades y de un detector de iones. En el selector hay un campo eléctrico y un campo magnético mutuamente perpendiculares para que solo los iones con cierta velocidad viajen en línea recta. Se inyectan iones $Ca^{2+}$ con $\\vec v=2{,}4\\cdot10^5\\,\\vec i\\ \text{m s}^{-1}$ y el campo magnético es $\\vec B_1=1{,}0\\,\\vec j\\ \text{mT}$. A la salida penetran en una región con $\\vec B_2=1{,}5\\,\\vec j\\ \text{T}$.\n\n![Selector de velocidades del espectrómetro](/fisica-imgs/madrid/2025/extraordinaria/fisica-2025-extraordinaria-4a-parte-a.png)\n\n![Detector de iones del espectrómetro](/fisica-imgs/madrid/2025/extraordinaria/fisica-2025-extraordinaria-4a-parte-b.png)`,
    apartados: [
      "Calcule el campo eléctrico $\\vec E$ necesario para que los iones lleguen al detector.",
      "Calcule el radio de la trayectoria circular descrita en el detector.",
    ],
    datos: ["$N_A = 6{,}02\\cdot10^{23}\\ \text{mol}^{-1}$", "$e=1{,}6\\cdot10^{-19}\\ \text{C}$", "Masa atómica de $Ca^{2+}$: $40\\ \text{u}$"],
    puntos: 2.5,
  },
  {
    id: "f-2025-jul-4B",
    año: 2025, convocatoria: "Extraordinaria", opcion: "B",
    tipo: "Electricidad", numero: "4.B",
    enunciado: `Un hilo rectilíneo infinito paralelo al eje $z$ pasa por el punto $(0,6,0)$ cm y transporta una corriente $I=5$ A en el sentido positivo del eje $z$.\n\n![Dos hilos rectilíneos en el plano xy](/fisica-imgs/madrid/2025/extraordinaria/fisica-2025-extraordinaria-4b.png)`,
    apartados: [
      "Calcule el campo magnético creado por el hilo en el punto $(4,2,0)$ cm.",
      "Determine la intensidad que debe transportar un segundo hilo paralelo al eje $z$ situado en $(6,0,0)$ cm para que el campo total en $(4,2,0)$ cm sea cero.",
    ],
    datos: ["$\\mu_0 = 4\\pi\\cdot10^{-7}\\ \text{T m A}^{-1}$"],
    puntos: 2.5,
  },

  {
    id: "f-2021-jul-A1", año: 2021, convocatoria: "Extraordinaria", opcion: "A", tipo: "Gravitacion", numero: "A.1",
    enunciado: `Una nave espacial queda atrapada en una órbita circular alrededor de un planeta esférico desconocido. Su velocidad orbital es $25000\\ \text{km h}^{-1}$ y tarda $5$ h en dar una vuelta completa.`,
    apartados: ["Determine el radio de la órbita circular y la masa del planeta.", "Si la densidad del planeta es $16150\\ \text{kg m}^{-3}$, calcule el radio del planeta y la gravedad en su superficie."],
    datos: ["$G=6{,}67\\cdot10^{-11}\\ \text{N m}^2\\text{kg}^{-2}$"], puntos: 2,
  },
  {
    id: "f-2021-jul-A2", año: 2021, convocatoria: "Extraordinaria", opcion: "A", tipo: "Ondas", numero: "A.2",
    enunciado: `Anacleto graba con un teléfono inteligente, a través de una pared, una conversación situada a $5$ m. Por efecto de la pared, al teléfono solo llega un $2\%$ de la intensidad que llegaría sin pared. El nivel de una conversación a $1$ m es $50$ dB.`,
    apartados: ["Calcule el nivel de intensidad sonora que llega al teléfono.", "Si el teléfono graba conversaciones a $100$ m, calcule el nivel más bajo que puede medir."],
    datos: ["$I_0=10^{-12}\\ \text{W m}^{-2}$"], puntos: 2,
  },
  {
    id: "f-2021-jul-A3", año: 2021, convocatoria: "Extraordinaria", opcion: "A", tipo: "Electricidad", numero: "A.3",
    enunciado: `Se tienen tres hilos indefinidos de corriente. Los hilos de intensidades $I_1=2$ A e $I_2=2$ A son paralelos al eje $x$ y pasan por $(0,0,0)$ y $(0,0,4)$ m. El tercer hilo, de intensidad $I_3=3$ A, pasa por el origen y es paralelo al eje $y$. Todas las corrientes van en el sentido positivo de los ejes.\n\n![Tres hilos indefinidos de corriente](/fisica-imgs/madrid/2021/extraordinaria/fisica-2021-extraordinaria-a3.png)`,
    apartados: ["Calcule el campo magnético total creado por los tres hilos en $(0,0,2)$ m.", "Calcule la fuerza magnética por unidad de longitud que ejerce el hilo $I_1$ sobre el hilo $I_2$ e indique si es atractiva o repulsiva."],
    datos: ["$\\mu_0=4\\pi\\cdot10^{-7}\\ \text{N A}^{-2}$"], puntos: 2,
  },
  {
    id: "f-2021-jul-A4", año: 2021, convocatoria: "Extraordinaria", opcion: "A", tipo: "Optica", numero: "A.4",
    enunciado: `Sistema óptico formado por dos lentes convergentes: una lente A de distancia focal $f'_A$ y otra lente B, situada $80$ cm a la derecha de A, con $f'_B=30$ cm. Un objeto de $5$ cm de altura está $15$ cm a la izquierda de A.`,
    apartados: ["Si la imagen final aparece $75$ cm a la derecha de B, calcule $f'_A$ y el tamaño de la imagen final.", "Determine dónde situar el objeto a la izquierda de A para que el sistema forme la imagen en el infinito."], puntos: 2,
  },
  {
    id: "f-2021-jul-A5", año: 2021, convocatoria: "Extraordinaria", opcion: "A", tipo: "RadioactividadModerna", numero: "A.5",
    enunciado: `En un acelerador se originan un electrón relativista de velocidad $0{,}75c$ y un fotón de $15$ MeV.`,
    apartados: ["Calcule la masa relativista y la energía cinética del electrón.", "Determine la longitud de onda del fotón y la longitud de de Broglie del electrón."],
    datos: ["$e=1{,}6\\cdot10^{-19}\\ \text{C}$", "$m_e=9{,}1\\cdot10^{-31}\\ \text{kg}$", "$h=6{,}63\\cdot10^{-34}\\ \text{J s}$", "$c=3\\cdot10^8\\ \text{m s}^{-1}$"], puntos: 2,
  },
  {
    id: "f-2021-jul-B1", año: 2021, convocatoria: "Extraordinaria", opcion: "B", tipo: "Gravitacion", numero: "B.1",
    enunciado: `Una partícula de masa $m$ está en el origen. La componente $x$ del campo gravitatorio creado en el punto $(2,2)$ m es $-1{,}18\\cdot10^{-11}\\ \text{N kg}^{-1}$.`,
    apartados: ["Calcule la masa $m$.", "Calcule el trabajo del campo para llevar una masa $M=5$ kg desde $(4,0)$ m a $(2,2)$ m."],
    datos: ["$G=6{,}67\\cdot10^{-11}\\ \text{N m}^2\\text{kg}^{-2}$"], puntos: 2,
  },
  {
    id: "f-2021-jul-B2", año: 2021, convocatoria: "Extraordinaria", opcion: "B", tipo: "Ondas", numero: "B.2",
    enunciado: `Una onda transversal se propaga por una cuerda en el sentido positivo del eje $x$. En los instantes $t=0$ s y $t=2$ s: $y(x,0)=0{,}1\\cos(\\pi-4\\pi x)$ m e $y(x,2)=0{,}1\\cos(11\\pi-4\\pi x)$ m.`,
    apartados: ["Calcule la frecuencia angular y la expresión matemática de la onda.", "Calcule la velocidad de propagación y la aceleración máxima de oscilación."], puntos: 2,
  },
  {
    id: "f-2021-jul-B3", año: 2021, convocatoria: "Extraordinaria", opcion: "B", tipo: "Electricidad", numero: "B.3",
    enunciado: `Un espectrómetro de masas selecciona iones positivos de oxígeno $^{18}O^+$ mediante un selector con campos perpendiculares $\\vec E=4{,}0\\cdot10^5\\,\\vec j\\ \text{V m}^{-1}$ y $\\vec B_1=2\\,\\vec k\\ \text{T}$. Después pasan a una región con $\\vec B_2=5\\,\\vec k\\ \text{T}$.\n\n![Esquema de espectrómetro de masas](/fisica-imgs/madrid/2021/extraordinaria/fisica-2021-extraordinaria-b3.png)`,
    apartados: ["Calcule la velocidad de los iones que viajan en línea recta.", "Calcule el radio de la órbita circular en la segunda región."],
    datos: ["$m=2{,}7\\cdot10^{-26}\\ \text{kg}$", "$q=+e$", "$e=1{,}6\\cdot10^{-19}\\ \text{C}$"], puntos: 2,
  },
  {
    id: "f-2021-jul-B4", año: 2021, convocatoria: "Extraordinaria", opcion: "B", tipo: "Optica", numero: "B.4",
    enunciado: `Dos medios A y B tienen índices $n_A$ y $n_B$. Un rayo de frecuencia $6{,}04\\cdot10^{14}$ Hz incide desde A hacia B. El ángulo límite para reflexión total es $45{,}58^\\circ$ y $n_A-n_B=0{,}6$.`,
    apartados: ["Determine los índices de refracción $n_A$ y $n_B$.", "Determine las longitudes de onda en los medios A y B."],
    datos: ["$c=3\\cdot10^8\\ \text{m s}^{-1}$"], puntos: 2,
  },
  {
    id: "f-2021-jul-B5", año: 2021, convocatoria: "Extraordinaria", opcion: "B", tipo: "RadioactividadModerna", numero: "B.5",
    enunciado: `El patrón del kilogramo es un cilindro de platino-iridio con un $90\%$ en masa de Pt. El isótopo $^{190}$Pt es radiactivo, con tiempo de semidesintegración $6{,}5\\cdot10^{11}$ años, y representa el $0{,}012\%$ en masa de una muestra de platino.`,
    apartados: ["Calcule la actividad inicial del patrón del kilogramo.", "Calcule la masa final de $^{190}$Pt transcurridos mil millones de años."],
    datos: ["$M(^{190}Pt)=189{,}96\\ \text{u}$", "$N_A=6{,}02\\cdot10^{23}\\ \text{mol}^{-1}$"], puntos: 2,
  },

  {
    id: "f-2020-jul-A1", año: 2020, convocatoria: "Extraordinaria", opcion: "A", tipo: "Gravitacion", numero: "A.1",
    enunciado: `Calisto, satélite de Júpiter, tiene densidad $1{,}83\\ \text{g cm}^{-3}$ y radio $2410$ km. Da una revolución alrededor de Júpiter cada $16{,}89$ días.`,
    apartados: ["Calcule la masa del satélite y la aceleración de la gravedad en su superficie.", "Obtenga la energía cinética y la energía mecánica de Calisto en su órbita circular."],
    datos: ["$G=6{,}67\\cdot10^{-11}\\ \text{N m}^2\\text{kg}^{-2}$", "$M_J=1{,}90\\cdot10^{27}\\ \text{kg}$"], puntos: 2,
  },
  {
    id: "f-2020-jul-A2", año: 2020, convocatoria: "Extraordinaria", opcion: "A", tipo: "Ondas", numero: "A.2",
    enunciado: `Un violín emite ondas sonoras con una potencia de $5\\cdot10^{-3}$ W al tocar la nota Fa de $698$ Hz.`,
    apartados: ["Indique si la onda es longitudinal o transversal y obtenga su longitud de onda.", "Calcule el nivel sonoro percibido a $20$ m por $15$ violines tocando al unísono."],
    datos: ["$I_0=10^{-12}\\ \text{W m}^{-2}$", "$v_s=340\\ \text{m s}^{-1}$"], puntos: 2,
  },
  {
    id: "f-2020-jul-A3", año: 2020, convocatoria: "Extraordinaria", opcion: "A", tipo: "Electricidad", numero: "A.3",
    enunciado: `Dos cargas puntuales $q_A=+5$ nC y $q_B=-5$ nC están en $(-4,0)$ cm y $(4,0)$ cm.`,
    apartados: ["Determine el potencial y el campo eléctrico en el origen.", "Determine el potencial y el campo eléctrico en el punto $(0,3)$ cm."],
    datos: ["$K=9\\cdot10^9\\ \text{N m}^2\\text{C}^{-2}$"], puntos: 2,
  },
  {
    id: "f-2020-jul-A4", año: 2020, convocatoria: "Extraordinaria", opcion: "A", tipo: "Optica", numero: "A.4",
    enunciado: `Sobre la cara A de un prisma transparente incide perpendicularmente desde el aire un rayo de luz a $5$ cm del vértice superior, cuyo ángulo es de $30^\\circ$.\n\n![Prisma de material transparente](/fisica-imgs/madrid/2020/extraordinaria/fisica-2020-extraordinaria-a4.png)`,
    apartados: ["Calcule el tiempo que tarda el rayo en alcanzar la cara B y el ángulo de emergencia si el material es vidrio de índice $1{,}5$.", "Razone si el rayo emergerá por la cara B si el prisma es de diamante, de índice $2{,}5$."],
    datos: ["$c=3\\cdot10^8\\ \text{m s}^{-1}$", "$n_{aire}=1$"], puntos: 2,
  },
  {
    id: "f-2020-jul-A5", año: 2020, convocatoria: "Extraordinaria", opcion: "A", tipo: "RadioactividadModerna", numero: "A.5",
    enunciado: `Para obtener imágenes del corazón se utiliza $^{201}$Tl, que emite rayos gamma con periodo de semidesintegración de $3{,}04$ días. Se recomienda inyectar $0{,}9\\ \text{MBq kg}^{-1}$.`,
    apartados: ["Obtenga la constante de desintegración y la masa recomendada para un paciente de $75$ kg.", "Calcule el tiempo para que la actividad se reduzca al $1\%$ de la inicial."],
    datos: ["$N_A=6{,}02\\cdot10^{23}\\ \text{mol}^{-1}$", "$M(^{201}Tl)=201\\ \text{u}$"], puntos: 2,
  },
  {
    id: "f-2020-jul-B1", año: 2020, convocatoria: "Extraordinaria", opcion: "B", tipo: "Gravitacion", numero: "B.1",
    enunciado: `La sonda Mars Reconnaissance Orbiter se situó en 2006 en una órbita circular alrededor de Marte a $290$ km de altura. Actualmente tiene una masa de $1031$ kg.`,
    apartados: ["Calcule el periodo de revolución y la velocidad orbital alrededor de Marte.", "Obtenga la energía mínima necesaria para que escape del campo gravitatorio marciano."],
    datos: ["$G=6{,}67\\cdot10^{-11}\\ \text{N m}^2\\text{kg}^{-2}$", "$M_{Marte}=6{,}42\\cdot10^{23}\\ \text{kg}$", "$R_{Marte}=3{,}39\\cdot10^6\\ \text{m}$"], puntos: 2,
  },
  {
    id: "f-2020-jul-B2", año: 2020, convocatoria: "Extraordinaria", opcion: "B", tipo: "Ondas", numero: "B.2",
    enunciado: `Un oscilador de frecuencia $1000$ Hz genera en una cuerda una onda transversal que se propaga en sentido positivo del eje $x$, con longitud de onda $1{,}5$ m. La velocidad máxima de oscilación es $100\\ \text{m s}^{-1}$. En $x=0$ m y $t=600\\ \mu$s, la elongación es $1$ cm y la velocidad de oscilación es positiva.`,
    apartados: ["Determine la velocidad de propagación y la amplitud.", "Halle la fase inicial y escriba la expresión matemática de la onda."], puntos: 2,
  },
  {
    id: "f-2020-jul-B3", año: 2020, convocatoria: "Extraordinaria", opcion: "B", tipo: "Electricidad", numero: "B.3",
    enunciado: `Una espira circular de radio $6$ cm, inicialmente en el plano $xy$, está inmersa en un campo magnético homogéneo dirigido según $+z$.`,
    apartados: ["Calcule el flujo y la fem inducida en $t=7$ ms si $B=3t^2$.", "Calcule el flujo y la fem inducida en $t=7$ ms si $B=8$ mT y la espira gira a $60\\ \text{rad s}^{-1}$ alrededor del eje $y$."], puntos: 2,
  },
  {
    id: "f-2020-jul-B4", año: 2020, convocatoria: "Extraordinaria", opcion: "B", tipo: "Optica", numero: "B.4",
    enunciado: `Determine las posiciones donde debe colocarse un objeto real a la izquierda de una lente convergente de potencia $2{,}5$ dioptrías para que el tamaño de la imagen sea el indicado.`,
    apartados: ["Imagen derecha y del doble que el objeto.", "Imagen invertida y de la mitad que el objeto. Indique la naturaleza de la imagen y trace los rayos."], puntos: 2,
  },
  {
    id: "f-2020-jul-B5", año: 2020, convocatoria: "Extraordinaria", opcion: "B", tipo: "RadioactividadModerna", numero: "B.5",
    enunciado: `Un sistema atómico de tres niveles energéticos se utiliza para obtener radiación láser. Respecto al fundamental, el segundo y tercer nivel están a $2{,}07$ eV y $2{,}76$ eV. La absorción se produce del nivel 1 al 3 y la emisión láser del 2 al 1.`,
    apartados: ["Halle la longitud de onda y frecuencia del fotón necesario para la absorción.", "Calcule la longitud de onda emitida y la potencia del láser si se emiten $2\\cdot10^{16}$ fotones/s."],
    datos: ["$h=6{,}63\\cdot10^{-34}\\ \text{J s}$", "$c=3\\cdot10^8\\ \text{m s}^{-1}$", "$e=1{,}6\\cdot10^{-19}\\ \text{C}$"], puntos: 2,
  },

  {
    id: "f-2019-jul-A1", año: 2019, convocatoria: "Extraordinaria", opcion: "A", tipo: "Gravitacion", numero: "A.1",
    enunciado: `Los satélites LAGEOS son cuerpos esféricos de masa $405$ kg en órbita circular alrededor de la Tierra a $5900$ km sobre su superficie.`,
    apartados: ["Determine el periodo de estos satélites.", "Calcule la energía requerida para pasar desde la superficie terrestre a dicha órbita."],
    datos: ["$G=6{,}67\\cdot10^{-11}\\ \text{N m}^2\\text{kg}^{-2}$", "$M_T=5{,}97\\cdot10^{24}\\ \text{kg}$", "$R_T=6{,}37\\cdot10^6\\ \text{m}$"], puntos: 2,
  },
  {
    id: "f-2019-jul-A2", año: 2019, convocatoria: "Extraordinaria", opcion: "A", tipo: "Ondas", numero: "A.2",
    enunciado: `Un detector situado a $200$ m de una sirena mide $80$ dB. Suponga que la sirena emite como fuente puntual.`,
    apartados: ["Determine la potencia sonora de la sirena.", "Calcule a qué distancia mediría la misma intensidad si la sirena tuviese el doble de potencia."],
    datos: ["$I_0=10^{-12}\\ \text{W m}^{-2}$"], puntos: 2,
  },
  {
    id: "f-2019-jul-A3", año: 2019, convocatoria: "Extraordinaria", opcion: "A", tipo: "Electricidad", numero: "A.3",
    enunciado: `Una carga $q_1=10\\ \mu$C está en el origen y otra carga $q_2=20\\ \mu$C en $(3,0)$ m.`,
    apartados: ["Calcule el punto donde el campo eléctrico total es nulo.", "Calcule el trabajo del campo para transportar un electrón desde $(3,4)$ m hasta $(2,0)$ m."],
    datos: ["$e=1{,}6\\cdot10^{-19}\\ \text{C}$", "$K=9\\cdot10^9\\ \text{N m}^2\\text{C}^{-2}$"], puntos: 2,
  },
  {
    id: "f-2019-jul-A4", año: 2019, convocatoria: "Extraordinaria", opcion: "A", tipo: "Optica", numero: "A.4",
    enunciado: `Una lente convergente de $10$ cm de distancia focal forma la imagen de un objeto de tamaño $y=1$ cm. Se quiere que la imagen se forme $14$ cm a la derecha de la lente.`,
    apartados: ["Determine dónde situar el objeto y el tamaño de la imagen.", "Realice el trazado de rayos correspondiente."], puntos: 2,
  },
  {
    id: "f-2019-jul-A5", año: 2019, convocatoria: "Extraordinaria", opcion: "A", tipo: "RadioactividadModerna", numero: "A.5",
    enunciado: `Al iluminar un material con luz de $\\lambda=589$ nm se liberan electrones con energía cinética máxima $0{,}577$ eV; con luz ultravioleta de $\\lambda=179{,}76$ nm la energía máxima es $5{,}38$ eV.`,
    apartados: ["Determine la constante de Planck y el trabajo de extracción.", "Calcule la longitud de onda de de Broglie del electrón de energía cinética máxima en el caso ultravioleta."],
    datos: ["$e=1{,}6\\cdot10^{-19}\\ \text{C}$", "$m_e=9{,}1\\cdot10^{-31}\\ \text{kg}$", "$c=3\\cdot10^8\\ \text{m s}^{-1}$"], puntos: 2,
  },
  {
    id: "f-2019-jul-B1", año: 2019, convocatoria: "Extraordinaria", opcion: "B", tipo: "Gravitacion", numero: "B.1",
    enunciado: `El satélite Europa describe una órbita circular alrededor de Júpiter de radio $671100$ km y periodo $3{,}55$ días terrestres.`,
    apartados: ["Determine la masa de Júpiter.", "Determine la velocidad de escape desde la superficie de Júpiter."],
    datos: ["$G=6{,}67\\cdot10^{-11}\\ \text{N m}^2\\text{kg}^{-2}$", "$R_{Júpiter}=69911$ km"], puntos: 2,
  },
  {
    id: "f-2019-jul-B2", año: 2019, convocatoria: "Extraordinaria", opcion: "B", tipo: "Ondas", numero: "B.2",
    enunciado: `Una onda transversal que se propaga por el eje $x$ viene dada por $y(x,t)=0{,}05\\cos(8\\pi t-4\\pi x+\\varphi_0)$ en unidades SI.`,
    apartados: ["Determine $\\varphi_0$ si en $t=5$ s la velocidad de oscilación de $x=3$ m es nula y su aceleración es positiva.", "Determine el tiempo que tarda la onda en llegar a $x=8$ m si la fuente comienza a emitir en $t=0$ en el origen."], puntos: 2,
  },
  {
    id: "f-2019-jul-B3", año: 2019, convocatoria: "Extraordinaria", opcion: "B", tipo: "Electricidad", numero: "B.3",
    enunciado: `Un positrón se acelera mediante una diferencia de potencial $\\Delta V$ y entra en una región con un campo magnético $B=5\\ \mu$T perpendicular a su velocidad. El radio de la órbita circular es $50$ cm.`,
    apartados: ["Obtenga la diferencia de potencial utilizada para acelerar el positrón.", "Obtenga la frecuencia angular de giro del positrón."],
    datos: ["$e=1{,}6\\cdot10^{-19}\\ \text{C}$", "$m_p=9{,}1\\cdot10^{-31}\\ \text{kg}$"], puntos: 2,
  },
  {
    id: "f-2019-jul-B4", año: 2019, convocatoria: "Extraordinaria", opcion: "B", tipo: "Optica", numero: "B.4",
    enunciado: `Desde lo alto de un trampolín, Carlos ve a Laura en el fondo de la piscina mirando con un ángulo de $30^\\circ$ respecto a la vertical. La altura de observación es $4$ m, la piscina tiene $3$ m de profundidad y $n_{agua}=1{,}33$.`,
    apartados: ["Determine la distancia respecto a la vertical del trampolín a la que se encuentra Laura.", "Determine el ángulo límite entre agua y aire y realice un esquema del rayo."],
    datos: ["$n_{aire}=1$"], puntos: 2,
  },
  {
    id: "f-2019-jul-B5", año: 2019, convocatoria: "Extraordinaria", opcion: "B", tipo: "RadioactividadModerna", numero: "B.5",
    enunciado: `Una muestra de madera de un sarcófago se ha datado por $^{14}$C con edad de $3200$ años. En la muestra se ha detectado que la cantidad de $^{14}$C ha disminuido un $32\%$ respecto a la original.`,
    apartados: ["Calcule la vida media del $^{14}$C y el periodo de semidesintegración.", "Si la muestra actual contiene $8\\ \mu$g de $^{14}$C, calcule su actividad."],
    datos: ["$N_A=6{,}02\\cdot10^{23}\\ \text{mol}^{-1}$", "$M(^{14}C)=14{,}0\\ \text{u}$"], puntos: 2,
  },

  {
    id: "f-2018-jul-A1", año: 2018, convocatoria: "Extraordinaria", opcion: "A", tipo: "Gravitacion", numero: "A.1",
    enunciado: `La masa de un objeto en la superficie terrestre es de $50$ kg.`,
    apartados: ["Determine la masa y el peso del objeto en la superficie de Mercurio.", "Calcule a qué altura sobre Mercurio su peso se reduce a la tercera parte."],
    datos: ["$G=6{,}67\\cdot10^{-11}\\ \text{N m}^2\\text{kg}^{-2}$", "$M_M=3{,}30\\cdot10^{23}\\ \text{kg}$", "$R_M=2{,}44\\cdot10^6\\ \text{m}$"], puntos: 2,
  },
  {
    id: "f-2018-jul-A2", año: 2018, convocatoria: "Extraordinaria", opcion: "A", tipo: "Ondas", numero: "A.2",
    enunciado: `El nivel de intensidad sonora de la sirena de un barco es $80$ dB a $10$ m. Suponga que la sirena es un foco puntual.`,
    apartados: ["Calcule la potencia de la sirena y la intensidad a $1$ km.", "Calcule las distancias donde se alcanza $70$ dB y donde el sonido deja de ser audible."],
    datos: ["$I_0=10^{-12}\\ \text{W m}^{-2}$"], puntos: 2,
  },
  {
    id: "f-2018-jul-A3", año: 2018, convocatoria: "Extraordinaria", opcion: "A", tipo: "Electricidad", numero: "A.3",
    enunciado: `Dos cargas positivas e iguales situadas en $(2,2)$ m y $(-2,-2)$ m generan en $(1,1)$ m un campo de módulo $E=5\\cdot10^3\\ \text{N C}^{-1}$.`,
    apartados: ["Determine el valor de las cargas y el vector campo eléctrico en $(-1,-1)$ m.", "Calcule el trabajo necesario para traer una carga de $2\\ \mu$C desde el infinito hasta $(-1,-1)$ m."],
    datos: ["$K=9\\cdot10^9\\ \text{N m}^2\\text{C}^{-2}$"], puntos: 2,
  },
  {
    id: "f-2018-jul-A4", año: 2018, convocatoria: "Extraordinaria", opcion: "A", tipo: "Optica", numero: "A.4",
    enunciado: `Un sistema óptico centrado está formado por dos lentes delgadas divergentes iguales, de distancia focal $f'=-20$ cm, separadas $5$ cm. Un objeto luminoso de tamaño $y=2$ cm se sitúa a $60$ cm a la izquierda de la primera lente.`,
    apartados: ["Determine la posición de la imagen formada por la primera lente y realice la construcción geométrica.", "Determine la posición y tamaño de la imagen final formada por las dos lentes."], puntos: 2,
  },
  {
    id: "f-2018-jul-A5", año: 2018, convocatoria: "Extraordinaria", opcion: "A", tipo: "RadioactividadModerna", numero: "A.5",
    enunciado: `El $^{14}$C tiene un periodo de semidesintegración de $5730$ años. Inicialmente se tiene una muestra de $2$ mg.`,
    apartados: ["Determine el tiempo para que la muestra se reduzca a $0{,}5$ mg.", "Calcule la actividad inicial."],
    datos: ["$N_A=6{,}02\\cdot10^{23}\\ \text{mol}^{-1}$", "$M(^{14}C)=14{,}00\\ \text{u}$"], puntos: 2,
  },
  {
    id: "f-2018-jul-B1", año: 2018, convocatoria: "Extraordinaria", opcion: "B", tipo: "Gravitacion", numero: "B.1",
    enunciado: `Un satélite artificial de masa $712$ kg describe una órbita circular alrededor de la Tierra a $694$ km de altura.`,
    apartados: ["Calcule la velocidad y el periodo del satélite.", "Calcule la energía necesaria para trasladarlo a otra órbita circular a $1000$ km de altura."],
    datos: ["$G=6{,}67\\cdot10^{-11}\\ \text{N m}^2\\text{kg}^{-2}$", "$M_T=5{,}97\\cdot10^{24}\\ \text{kg}$", "$R_T=6{,}37\\cdot10^6\\ \text{m}$"], puntos: 2,
  },
  {
    id: "f-2018-jul-B2", año: 2018, convocatoria: "Extraordinaria", opcion: "B", tipo: "Ondas", numero: "B.2",
    enunciado: `Una onda armónica transversal de periodo $T=4$ s se propaga en el sentido positivo del eje $x$. En $t=0$, $Y(x,0)=0{,}2\\sin(-4\\pi x+\\pi/3)$, con $x$ e $Y$ en metros.`,
    apartados: ["Determine amplitud, frecuencia, longitud de onda y velocidad de propagación.", "Determine la velocidad y aceleración de oscilación del punto $x=0{,}40$ m en $t=8$ s."], puntos: 2,
  },
  {
    id: "f-2018-jul-B3", año: 2018, convocatoria: "Extraordinaria", opcion: "B", tipo: "Electricidad", numero: "B.3",
    enunciado: `Dos hilos rectilíneos indefinidos y paralelos al eje $z$ están en el plano $yz$. Uno pasa por $(0,-5,0)$ cm con $I_1=30$ A en sentido $+z$; el otro pasa por $(0,5,0)$ cm con corriente $I_2$ en sentido $-z$. En el origen, $B=2{,}8\\cdot10^{-4}$ T.`,
    apartados: ["Calcule $I_2$ y el campo magnético en $(0,10,0)$ cm.", "Calcule la fuerza magnética por unidad de longitud sobre el conductor de $(0,-5,0)$ cm debida al otro."],
    datos: ["$\\mu_0=4\\pi\\cdot10^{-7}\\ \text{N A}^{-2}$"], puntos: 2,
  },
  {
    id: "f-2018-jul-B4", año: 2018, convocatoria: "Extraordinaria", opcion: "B", tipo: "Optica", numero: "B.4",
    enunciado: `Un material transparente de índice $n=2$ está en aire y limitado por dos superficies planas no paralelas que forman un ángulo $\\alpha$. Un rayo incide perpendicularmente sobre la primera superficie y emerge por la segunda con $90^\\circ$ respecto a la normal, como se muestra en la figura.\n\n![Material transparente limitado por dos superficies no paralelas](/fisica-imgs/madrid/2018/extraordinaria/fisica-2018-extraordinaria-b4.png)`,
    apartados: ["Calcule el ángulo límite material-aire y el ángulo $\\alpha$.", "Calcule el ángulo de incidencia en la primera superficie para que el ángulo de emergencia por la segunda sea igual que él."],
    datos: ["$n_{aire}=1$"], puntos: 2,
  },
  {
    id: "f-2018-jul-B5", año: 2018, convocatoria: "Extraordinaria", opcion: "B", tipo: "RadioactividadModerna", numero: "B.5",
    enunciado: `Al iluminar un metal con luz de longitud de onda en el vacío $\\lambda=700$ nm, se emiten electrones con energía cinética máxima $0{,}45$ eV. Al cambiar la longitud de onda, la energía cinética máxima es $1{,}49$ eV.`,
    apartados: ["Calcule la frecuencia de la luz utilizada en la segunda medida.", "Determine a partir de qué frecuencia no se observará efecto fotoeléctrico."],
    datos: ["$e=1{,}6\\cdot10^{-19}\\ \text{C}$", "$c=3\\cdot10^8\\ \text{m s}^{-1}$", "$h=6{,}63\\cdot10^{-34}\\ \text{J s}$"], puntos: 2,
  },

  {
      id: "f-2024-jul-A1",
      año: 2024, convocatoria: "Extraordinaria", opcion: "A",
      tipo: "Gravitacion", numero: "A.1",
      enunciado: "Un satélite de comunicaciones orbita alrededor de la Tierra en una trayectoria elíptica cuyo apogeo se encuentra a 39700 km de altitud. El satélite da una vuelta completa cada 12 h.",
      apartados: [
        "La altura sobre la superficie terrestre en el perigeo y la relación entre sus velocidades en el perigeo y en el apogeo (vₚ/vₐ).",
        "La velocidad del satélite en el perigeo y la velocidad hasta la que habría que reducirlo para que pasase a una órbita circular de radio igual a la distancia al perigeo.",
      ],
      datos: ["G = 6,67·10⁻¹¹ N m² kg⁻²", "Mₜ = 5,97·10²⁴ kg", "Rₜ = 6,37·10⁶ m"],
      puntos: 2,
    },
  {
      id: "f-2024-jul-A2",
      año: 2024, convocatoria: "Extraordinaria", opcion: "A",
      tipo: "Ondas", numero: "A.2",
      enunciado: "Dos focos sonoros puntuales F₁ y F₂ están situados en las posiciones (0, 3) m y (4, 0) m del plano xy. El nivel de intensidad sonora debido a F₁ a 2 m es β₁ = 55 dB, y el de F₂ a 2 m es β₂ = 65 dB.",
      apartados: [
        "La intensidad y el nivel de intensidad sonora en el origen cuando ambos focos emiten simultáneamente.",
        "La distancia al foco F₁ del punto sobre el segmento que une ambos focos en el que las intensidades generadas por ambos focos son iguales.",
      ],
      datos: ["I₀ = 10⁻¹² W m⁻²"],
      puntos: 2,
    },
  {
      id: "f-2024-jul-A3",
      año: 2024, convocatoria: "Extraordinaria", opcion: "A",
      tipo: "Electricidad", numero: "A.3",
      enunciado: "Una partícula con carga 2 nC está situada en el origen de coordenadas y una segunda partícula con carga 4 nC está en el punto (6, 0) m del plano xy.",
      apartados: [
        "Obtenga el campo eléctrico generado por ambas cargas en el punto (2, 2) m.",
        "Determine el punto entre ambas cargas en el que la fuerza total sobre un electrón sería nula. Obtenga el trabajo realizado por la fuerza electrostática para traer ese electrón desde el infinito hasta dicho punto.",
      ],
      datos: ["K = 9·10⁹ N m² C⁻²", "e = 1,6·10⁻¹⁹ C"],
      puntos: 2,
    },
  {
      id: "f-2024-jul-A4",
      año: 2024, convocatoria: "Extraordinaria", opcion: "A",
      tipo: "Optica", numero: "A.4",
      enunciado: `Dos cristales de grosor 10 cm e índices de refracción n₁ = 1,40 y n₂ = 1,50 están separados por una capa de aire de espesor desconocido e. Un rayo incide por el punto A con ángulo de 30° y sale por el punto B. La distancia horizontal entre A y B es d = 9,2 cm.

![Cristales separados por aire](/fisica-imgs/madrid/2024/extraordinaria/fisica-2024-extraordinaria-a4.png)`,
      apartados: [
        "El espesor e de la capa de aire.",
        "El tiempo que tarda el rayo de luz en llegar desde el punto A hasta el punto B.",
      ],
      datos: ["c = 3·10⁸ m s⁻¹", "n_aire = 1"],
      puntos: 2,
    },
  {
      id: "f-2024-jul-A5",
      año: 2024, convocatoria: "Extraordinaria", opcion: "A",
      tipo: "RadioactividadModerna", numero: "A.5",
      enunciado: "Para una prueba diagnóstica se utiliza el isótopo ⁹⁹Tc cuyo tiempo de semidesintegración es de 6 h. La actividad de la dosis que hay que inocular al paciente es de 5·10⁸ Bq.",
      apartados: [
        "La masa de isótopo que hay que inyectar al paciente.",
        "El tiempo que debe transcurrir para que la actividad sea de 1·10⁴ Bq.",
      ],
      datos: ["M₉₉Tc = 98,9 u", "Nₐ = 6,02·10²³ mol⁻¹"],
      puntos: 2,
    },
  {
      id: "f-2024-jul-B1",
      año: 2024, convocatoria: "Extraordinaria", opcion: "B",
      tipo: "Gravitacion", numero: "B.1",
      enunciado: "Dos planetas de masas iguales orbitan en torno a una estrella. El primero tiene una órbita circular de radio 1,2·10¹¹ m y período de 3 años. El segundo sigue una órbita elíptica con distancia mínima 1,0·10¹¹ m y máxima 1,8·10¹¹ m.",
      apartados: [
        "Determine la masa de la estrella y el período del segundo planeta.",
        "Calcule la velocidad orbital del primer planeta y, sabiendo que su energía mecánica es −3,8·10³⁰ J, halle la masa de los planetas.",
      ],
      datos: ["G = 6,67·10⁻¹¹ N m² kg⁻²"],
      puntos: 2,
    },
  {
      id: "f-2024-jul-B2",
      año: 2024, convocatoria: "Extraordinaria", opcion: "B",
      tipo: "Ondas", numero: "B.2",
      enunciado: `En la figura se representa la elongación de una onda transversal en t = 0 en función de la posición x. La onda se propaga en el sentido negativo del eje x. El tiempo que tarda el punto en x = 0 desde que sale de su posición inicial hasta que vuelve a la misma es de 0,5 s. La amplitud es 3 cm y la longitud de onda 1,5 m.

![Elongación de una onda transversal](/fisica-imgs/madrid/2024/extraordinaria/fisica-2024-extraordinaria-b2.png)`,
      apartados: [
        "La longitud de onda y la velocidad de propagación.",
        "La expresión matemática de la onda.",
      ],
      puntos: 2,
    },
  {
      id: "f-2024-jul-B3",
      año: 2024, convocatoria: "Extraordinaria", opcion: "B",
      tipo: "Electricidad", numero: "B.3",
      enunciado: "Dos hilos indefinidos paralelos al eje z llevan intensidades iguales I₁ = I₂ = 2 A y cortan el plano xy en los puntos (0, 0) m y (4, 0) m. El primer hilo lleva su intensidad en sentido positivo del eje z y el segundo en sentido negativo.",
      apartados: [
        "Determine el campo magnético en el punto A (0, 3) m.",
        "Determine el campo magnético en el punto B (2, 3) m.",
      ],
      datos: ["μ₀ = 4π·10⁻⁷ T m A⁻¹"],
      puntos: 2,
    },
  {
      id: "f-2024-jul-B4",
      año: 2024, convocatoria: "Extraordinaria", opcion: "B",
      tipo: "Optica", numero: "B.4",
      enunciado: "Un objeto se encuentra a una distancia de 4 m de una pantalla. Entre el objeto y la pantalla se coloca una lente delgada que produce una imagen en la pantalla 3 veces mayor que el objeto.",
      apartados: [
        "Calcule la distancia entre el objeto y la lente, así como su distancia focal.",
        "Realice el diagrama de rayos.",
      ],
      puntos: 2,
    },
  {
      id: "f-2024-jul-B5",
      año: 2024, convocatoria: "Extraordinaria", opcion: "B",
      tipo: "RadioactividadModerna", numero: "B.5",
      enunciado: "Al hacer incidir fotones de frecuencia variable sobre un material se obtiene la recta: V(V) = 4,16·10⁻¹⁵ f(Hz) − 2,16.",
      apartados: [
        "La frecuencia umbral y el potencial de extracción en eV.",
        "La constante de Planck.",
      ],
      datos: ["e = 1,6·10⁻¹⁹ C"],
      puntos: 2,
    },
  {
      id: "f-2022-jul-A1",
      año: 2022, convocatoria: "Extraordinaria", opcion: "A",
      tipo: "Gravitacion", numero: "A.1",
      enunciado: "Una partícula de masa 20 kg permanece fija en el origen de coordenadas.",
      apartados: [
        "Calcule el campo gravitatorio generado por la masa en el punto (8, 6) m y la fuerza que experimentará una segunda partícula de masa 3 kg situada en dicho punto.",
        "Se le transmite una velocidad de 1,2·10⁻⁵ m s⁻¹ en la dirección de la recta que une ambas partículas. Halle el punto más alejado del origen que alcanzará dicha partícula.",
      ],
      datos: ["G = 6,67·10⁻¹¹ N m² kg⁻²"],
      puntos: 2,
    },
  {
      id: "f-2022-jul-A2",
      año: 2022, convocatoria: "Extraordinaria", opcion: "A",
      tipo: "Ondas", numero: "A.2",
      enunciado: `Por una cuerda dispuesta a lo largo del eje x viaja una onda armónica. Los elementos A (xA = 0 m) y B (xB = 2 m) oscilan en fase y cortan al eje x cada 4 s. No hay entre A y B ningún otro elemento que oscile en fase con ellos.

![Onda armónica en una cuerda](/fisica-imgs/madrid/2022/extraordinaria/fisica-2022-extraordinaria-a2.png)`,
      apartados: [
        "Calcule el valor de la velocidad de propagación.",
        "Escriba la expresión matemática de la onda, si esta viaja en el sentido negativo del eje x y en el instante inicial los elementos A y B presentan desplazamiento +10 cm y velocidad nula.",
      ],
      puntos: 2,
    },
  {
      id: "f-2022-jul-A3",
      año: 2022, convocatoria: "Extraordinaria", opcion: "A",
      tipo: "Electricidad", numero: "A.3",
      enunciado: "Una varilla metálica de 20 cm de longitud cuyos extremos deslizan sobre unos raíles horizontales. La varilla tiene velocidad v = 2 î m s⁻¹. Los raíles están conectados en x = 0 por R = 0,5 Ω. En la región hay un campo magnético uniforme B = −0,4 k̂ T.",
      apartados: [
        "La intensidad de la corriente en el circuito formado por la varilla, la resistencia y los tramos de raíl.",
        "La fuerza F que el campo magnético ejerce sobre la varilla.",
      ],
      puntos: 2,
    },
  {
      id: "f-2022-jul-A4",
      año: 2022, convocatoria: "Extraordinaria", opcion: "A",
      tipo: "Optica", numero: "A.4",
      enunciado: "Dos lentes convergentes idénticas están separadas 16 cm. Cuando un objeto se sitúa a cierta distancia de la primera lente, cada una de ellas opera con aumento igual a −1.",
      apartados: [
        "Determine la potencia de las lentes.",
        "¿Cuánto y hacia dónde debe desplazarse la segunda lente para que la imagen del sistema se forme en el infinito?",
      ],
      puntos: 2,
    },
  {
      id: "f-2022-jul-A5",
      año: 2022, convocatoria: "Extraordinaria", opcion: "A",
      tipo: "RadioactividadModerna", numero: "A.5",
      enunciado: "Una muestra contiene inicialmente 30 mg de ²¹⁰Po. Su período de semidesintegración es de 138,38 días.",
      apartados: [
        "La vida media del isótopo y la actividad inicial de la muestra.",
        "El tiempo que debe transcurrir para que el contenido de ²¹⁰Po se reduzca a 5 mg.",
      ],
      datos: ["MPo = 210 u", "Nₐ = 6,02·10²³ mol⁻¹"],
      puntos: 2,
    },
  {
      id: "f-2022-jul-B1",
      año: 2022, convocatoria: "Extraordinaria", opcion: "B",
      tipo: "Gravitacion", numero: "B.1",
      enunciado: "Marte posee la décima parte de la masa de la Tierra y la mitad de su diámetro.",
      apartados: [
        "Encuentre la relación entre las velocidades de escape de Marte y de la Tierra desde sus respectivas superficies.",
        "Un objeto se lanza verticalmente desde la superficie terrestre con velocidad igual a la velocidad de escape de Marte. ¿Qué altura máxima alcanzaría?",
      ],
      datos: ["Rₜ = 6,37·10⁶ m"],
      puntos: 2,
    },
  {
      id: "f-2022-jul-B2",
      año: 2022, convocatoria: "Extraordinaria", opcion: "B",
      tipo: "Ondas", numero: "B.2",
      enunciado: "Un foco sonoro de potencia P se coloca a una altura h sobre el suelo. El nivel de intensidad vale 60 dB en el punto A (a 100 m del foco) y 80 dB en el punto B (en el suelo en la vertical del foco).",
      apartados: [
        "Calcule P y h.",
        "¿Cuál sería el nivel de intensidad en B si se agregase otro foco de igual potencia a una altura de h/2?",
      ],
      datos: ["I₀ = 10⁻¹² W m⁻²"],
      puntos: 2,
    },
  {
      id: "f-2022-jul-B3",
      año: 2022, convocatoria: "Extraordinaria", opcion: "B",
      tipo: "Electricidad", numero: "B.3",
      enunciado: "Una carga puntual positiva está situada en el punto (3, 4) m del plano xy. En otro punto del plano se coloca una segunda carga positiva de magnitud cuádruple de la primera, haciendo que el campo se anule en el origen de coordenadas.",
      apartados: [
        "Determine la posición de la segunda carga.",
        "Si el potencial en el origen vale 1,08·10⁴ V, encuentre el valor de las cargas.",
      ],
      datos: ["K = 9·10⁹ N m² C⁻²"],
      puntos: 2,
    },
  {
      id: "f-2022-jul-B4",
      año: 2022, convocatoria: "Extraordinaria", opcion: "B",
      tipo: "Optica", numero: "B.4",
      enunciado: "Una lámina de vidrio se halla sobre un líquido de índice desconocido. La longitud de onda de la luz en el vidrio se reduce a un 70% de su valor en el aire. Los rayos con ángulos de incidencia superiores a 30° en la cara inferior de la lámina no se refractan al aire por su cara superior.",
      apartados: [
        "El índice de refracción del vidrio.",
        "El índice de refracción del líquido.",
      ],
      datos: ["n_aire = 1"],
      puntos: 2,
    },
  {
      id: "f-2022-jul-B5",
      año: 2022, convocatoria: "Extraordinaria", opcion: "B",
      tipo: "RadioactividadModerna", numero: "B.5",
      enunciado: "Un electrón relativista ha llegado a adquirir una energía cinética equivalente a la energía de un fotón de 5·10⁻¹² m de longitud de onda en el vacío.",
      apartados: [
        "La energía cinética del electrón, en eV.",
        "La velocidad del electrón.",
      ],
      datos: ["e = 1,6·10⁻¹⁹ C", "h = 6,63·10⁻³⁴ J s", "c = 3·10⁸ m s⁻¹", "mₑ = 9,1·10⁻³¹ kg"],
      puntos: 2,
    },
  {
      id: "f-2023-jul-A1",
      año: 2023, convocatoria: "Extraordinaria", opcion: "A",
      tipo: "Gravitacion", numero: "A.1",
      enunciado: "El satélite UPM-Sat2 se lanzó el 3 de septiembre de 2020 a una órbita circular con un período de 5710 s. El satélite tiene una masa de 50 kg.",
      apartados: [
        "La altura a la que orbita y la energía que hubo que transmitirle para ponerlo en órbita desde la superficie de la Tierra.",
        "La velocidad y la aceleración centrípeta en su órbita.",
      ],
      datos: ["G = 6,67·10⁻¹¹ N m² kg⁻²", "Mₜ = 5,97·10²⁴ kg", "Rₜ = 6,37·10⁶ m"],
      puntos: 2,
    },
  {
      id: "f-2023-jul-A2",
      año: 2023, convocatoria: "Extraordinaria", opcion: "A",
      tipo: "Ondas", numero: "A.2",
      enunciado: "Por una cuerda dispuesta a lo largo del eje x viaja una onda armónica transversal con velocidad de propagación v = −400 î m s⁻¹. La onda produce en la cuerda una aceleración máxima de 2·10⁴ m s⁻². Los puntos con elongación nula se repiten cada 0,4 m a lo largo del eje x.",
      apartados: [
        "Determine la frecuencia y la amplitud de la onda.",
        "Si en el instante inicial y en el origen la elongación es +1 mm y la velocidad es positiva, calcule la elongación en x = 1,2 m para t = 2 s.",
      ],
      puntos: 2,
    },
  {
      id: "f-2023-jul-A3",
      año: 2023, convocatoria: "Extraordinaria", opcion: "A",
      tipo: "Electricidad", numero: "A.3",
      enunciado: "Una carga situada en un punto del plano xy da lugar a un potencial de 54 V y a un campo eléctrico E = −180 ĵ V m⁻¹ en el origen de coordenadas.",
      apartados: [
        "Determine el valor de la carga y su posición.",
        "Se trae una segunda carga desde el infinito hasta el origen, proceso en el que la fuerza de la primera carga realiza un trabajo de −270 nJ. Determine el valor de la segunda carga.",
      ],
      datos: ["K = 9·10⁹ N m² C⁻²"],
      puntos: 2,
    },
  {
      id: "f-2023-jul-A4",
      año: 2023, convocatoria: "Extraordinaria", opcion: "A",
      tipo: "Optica", numero: "A.4",
      enunciado: `Un observador está situado al borde de un estanque de profundidad H = 2 m. Su visual está a H' = 1,6 m sobre la superficie del agua. En el fondo hay un foco puntual de luz. El observador lo ve cuando mira hacia el punto A de la superficie a d = 1,2 m del borde.

![Observador al borde de un estanque](/fisica-imgs/madrid/2023/extraordinaria/fisica-2023-extraordinaria-a4.png)`,
      apartados: [
        "El índice de refracción del agua si la longitud de onda de la luz vale 375 nm en ella y 500 nm en el aire.",
        "La distancia D del foco a la pared del estanque.",
      ],
      datos: ["c = 3·10⁸ m s⁻¹", "n_aire = 1"],
      puntos: 2,
    },
  {
      id: "f-2023-jul-A5",
      año: 2023, convocatoria: "Extraordinaria", opcion: "A",
      tipo: "RadioactividadModerna", numero: "A.5",
      enunciado: "En un laboratorio de preparación de radiofármacos se rompe accidentalmente una ampolla de una solución que contenía ¹⁸F con una actividad de 18,5 MBq.",
      apartados: [
        "Calcule la masa de ¹⁸F derramada.",
        "Determine el tiempo que ha de transcurrir hasta que la actividad se reduzca a 37 kBq.",
      ],
      datos: ["τ(¹⁸F) = 109,7 min", "Mf = 18 g mol⁻¹", "Nₐ = 6,02·10²³ mol⁻¹"],
      puntos: 2,
    },
  {
      id: "f-2023-jul-B1",
      año: 2023, convocatoria: "Extraordinaria", opcion: "B",
      tipo: "Gravitacion", numero: "B.1",
      enunciado: `En su aproximación al planeta Fomalhaut II, el astronauta Rocannon avista Fomalhautillo según un ángulo α = 53,13° con respecto de la radial hacia el planeta. La fuerza total es F = (9,5 î − 66,4 ĵ) N sobre una nave de masa conjunta 8000 kg.

![Aproximación al planeta Fomalhaut II](/fisica-imgs/madrid/2023/extraordinaria/fisica-2023-extraordinaria-b1.png)`,
      apartados: [
        "¿A qué distancia R' se encuentra Rocannon del satélite?",
        "¿A qué distancia R se encuentra Rocannon del planeta?",
      ],
      datos: ["M = 4·10²³ kg", "M' = 2·10²⁰ kg", "G = 6,67·10⁻¹¹ N m² kg⁻²"],
      puntos: 2,
    },
  {
      id: "f-2023-jul-B2",
      año: 2023, convocatoria: "Extraordinaria", opcion: "B",
      tipo: "Ondas", numero: "B.2",
      enunciado: "Dos focos sonoros puntuales F₁ y F₂ están respectivamente en los puntos (−6, 0) m y (6, 0) m. En el punto (2, 0) m la intensidad debida a cada foco vale lo mismo. En el punto (0, 2) m el nivel de intensidad sonora es de 80 dB.",
      apartados: [
        "El cociente entre la potencia del foco F₁ y la del foco F₂.",
        "La potencia del foco F₁ y la intensidad que se registraría en el punto (0, 8) m si solamente se recibiesen ondas del foco F₁.",
      ],
      datos: ["I₀ = 10⁻¹² W m⁻²"],
      puntos: 2,
    },
  {
      id: "f-2023-jul-B3",
      año: 2023, convocatoria: "Extraordinaria", opcion: "B",
      tipo: "Electricidad", numero: "B.3",
      enunciado: "Dos hilos rectilíneos indefinidos, paralelos al eje y, están en x = −0,1 m y x = 0,1 m. El primero conduce 10 A en sentido positivo del eje y. Un electrón viaja en línea recta con velocidad v = 2·10⁶ ĵ m s⁻¹ a lo largo de x = 0,4 m sin desviarse.",
      apartados: [
        "La intensidad de corriente en el segundo hilo, especificando su sentido.",
        "La fuerza que experimentaría un electrón que pasara por el origen con velocidad v = 2·10⁶ ĵ m s⁻¹.",
      ],
      datos: ["μ₀ = 4π·10⁻⁷ T m A⁻¹", "e = 1,6·10⁻¹⁹ C"],
      puntos: 2,
    },
  {
      id: "f-2023-jul-B4",
      año: 2023, convocatoria: "Extraordinaria", opcion: "B",
      tipo: "Optica", numero: "B.4",
      enunciado: "Un objeto situado 30 cm a la izquierda de una lente produce una imagen con un aumento lateral de −2.",
      apartados: [
        "Obtenga la potencia de la lente.",
        "¿A qué distancia de la lente debe colocarse el objeto para que el aumento pase a ser +2? Efectúe el trazado de rayos.",
      ],
      puntos: 2,
    },
  {
      id: "f-2023-jul-B5",
      año: 2023, convocatoria: "Extraordinaria", opcion: "B",
      tipo: "RadioactividadModerna", numero: "B.5",
      enunciado: "Una placa metálica es irradiada con luz de 400 nm. La máxima corriente eléctrica debida al efecto fotoeléctrico es de 15 nA.",
      apartados: [
        "Si el potencial de frenado que anula la corriente es de 1 V, obtenga el trabajo de extracción del metal.",
        "Asumiendo que cada fotón incidente genera un fotoelectrón, calcule la energía que recibe la placa en 1 hora.",
      ],
      datos: ["c = 3·10⁸ m s⁻¹", "e = 1,6·10⁻¹⁹ C", "h = 6,63·10⁻³⁴ J s"],
      puntos: 2,
    },
  {
      id: "f-2018-jun-A1",
      año: 2018, convocatoria: "Ordinaria", opcion: "A",
      tipo: "Gravitacion", numero: "A.1",
      enunciado: "Dos masas m₁ = 10 kg y m₂ = 20 kg cuelgan del techo y están separadas 1 m de distancia.",
      apartados: [
        "La fuerza F₁₂ que ejerce la masa m₁ sobre m₂ y el peso P₂ de la masa m₂.",
        "Explique razonadamente por qué el módulo de P₂ es mucho mayor que el módulo de F₁₂.",
      ],
      datos: ["Rₜ = 6,37·10⁶ m", "G = 6,67·10⁻¹¹ N m² kg⁻²", "Mₜ = 5,97·10²⁴ kg"],
      puntos: 2,
    },
  {
      id: "f-2018-jun-A2",
      año: 2018, convocatoria: "Ordinaria", opcion: "A",
      tipo: "Ondas", numero: "A.2",
      enunciado: "Dos altavoces de 60 W y 40 W de potencia están situados respectivamente en los puntos (0, 0, 0) y (4, 0, 0) m.",
      apartados: [
        "El nivel de intensidad sonora en el punto (4, 3, 0) m debido a cada uno de los altavoces.",
        "El nivel de intensidad sonora en el punto (4, 3, 0) m debido a ambos altavoces.",
      ],
      datos: ["I₀ = 10⁻¹² W m⁻²"],
      puntos: 2,
    },
  {
      id: "f-2018-jun-A3",
      año: 2018, convocatoria: "Ordinaria", opcion: "A",
      tipo: "Electricidad", numero: "A.3",
      enunciado: "Campo magnético uniforme B = −B₀k̂ con B₀ = 0,3 T. En el plano xy hay una espira rectangular con lados a = 1 m y b = 0,5 m. La varilla de longitud b puede desplazarse en la dirección del eje x.",
      apartados: [
        "El flujo a través de la espira y la fem inducida en t = 2 s si la varilla se desplaza con velocidad constante de 3 m s⁻¹.",
        "El flujo a través de la espira y la fem inducida en t = 2 s si partiendo del reposo la varilla se desplaza con aceleración constante de 2 m s⁻².",
      ],
      puntos: 2,
    },
  {
      id: "f-2018-jun-A4",
      año: 2018, convocatoria: "Ordinaria", opcion: "A",
      tipo: "Optica", numero: "A.4",
      enunciado: "Un sistema óptico está constituido por dos lentes separadas 50 cm. La primera es de 10 dioptrías y la segunda de −10 dioptrías. Un objeto de altura 10 cm está a 15 cm de la primera lente.",
      apartados: [
        "La posición y el tamaño de la imagen producida por la primera lente y de la imagen final.",
        "Realice un diagrama de rayos de la formación de la imagen final.",
      ],
      puntos: 2,
    },
  {
      id: "f-2018-jun-A5",
      año: 2018, convocatoria: "Ordinaria", opcion: "A",
      tipo: "RadioactividadModerna", numero: "A.5",
      enunciado: "Efecto fotoeléctrico y trabajo de extracción.",
      apartados: [
        "Explique clara y brevemente en qué consiste el efecto fotoeléctrico.",
        "Si el trabajo de extracción de un metal es de 2 eV, ¿con fotones de qué frecuencia habría que iluminar el metal para que los electrones extraídos tuvieran una velocidad máxima de 7·10⁵ m s⁻¹?",
      ],
      datos: ["h = 6,63·10⁻³⁴ J s", "e = 1,6·10⁻¹⁹ C", "mₑ = 9,11·10⁻³¹ kg"],
      puntos: 2,
    },
  {
      id: "f-2018-jun-B1",
      año: 2018, convocatoria: "Ordinaria", opcion: "B",
      tipo: "Gravitacion", numero: "B.1",
      enunciado: "Satélite de masa 10³ kg que orbita alrededor de la Tierra en una órbita circular geoestacionaria.",
      apartados: [
        "El radio que tendría que tener la órbita para que su periodo fuese doble del geoestacionario.",
        "La diferencia de energía del satélite entre la primera y la segunda órbita.",
      ],
      datos: ["G = 6,67·10⁻¹¹ N m² kg⁻²", "Mₜ = 5,97·10²⁴ kg"],
      puntos: 2,
    },
  {
      id: "f-2018-jun-B2",
      año: 2018, convocatoria: "Ordinaria", opcion: "B",
      tipo: "Ondas", numero: "B.2",
      enunciado: "Onda armónica transversal que se propaga en el sentido positivo del eje x. De las gráficas se obtiene: amplitud 3 cm, longitud de onda 4 m, periodo 6 s.",
      apartados: [
        "La longitud de onda, la amplitud, el periodo y la velocidad de propagación de la onda.",
        "La expresión matemática de la onda.",
      ],
      puntos: 2,
    },
  {
      id: "f-2018-jun-B3",
      año: 2018, convocatoria: "Ordinaria", opcion: "B",
      tipo: "Electricidad", numero: "B.3",
      enunciado: "Carga q₁ = 6 μC situada en el origen de coordenadas.",
      apartados: [
        "El trabajo necesario para llevar una carga q₂ = 10 μC desde una posición muy alejada hasta la posición x = 10 m.",
        "El punto entre ambas cargas en el que una carga q estaría en equilibrio.",
      ],
      datos: ["K = 9·10⁹ N m² C⁻²"],
      puntos: 2,
    },
  {
      id: "f-2018-jun-B4",
      año: 2018, convocatoria: "Ordinaria", opcion: "B",
      tipo: "Optica", numero: "B.4",
      enunciado: "En un medio de índice de refracción n₁ = 1 se propaga un rayo luminoso de frecuencia f₁ = 6·10¹⁴ Hz.",
      apartados: [
        "¿Cuál es su longitud de onda?",
        "¿Cuál sería la frecuencia y la longitud de onda de la radiación si el índice de refracción del medio fuese n₂ = 1,25 n₁?",
      ],
      datos: ["c = 3·10⁸ m s⁻¹"],
      puntos: 2,
    },
  {
      id: "f-2018-jun-B5",
      año: 2018, convocatoria: "Ordinaria", opcion: "B",
      tipo: "RadioactividadModerna", numero: "B.5",
      enunciado: "Longitud de onda de de Broglie y energía relativista.",
      apartados: [
        "La velocidad a la que debe desplazarse un electrón para que su longitud de onda asociada sea la misma que la de un fotón de 0,02 MeV de energía.",
        "La energía que tiene el electrón en eV y su momento lineal.",
      ],
      datos: ["h = 6,63·10⁻³⁴ J s", "e = 1,60·10⁻¹⁹ C", "mₑ = 9,11·10⁻³¹ kg", "c = 3·10⁸ m s⁻¹"],
      puntos: 2,
    },

  // ══════════════════════════════════════════════
  // MODELO — Exámenes modelo oficiales de la Comunidad de Madrid
  // ══════════════════════════════════════════════

  {
    id: "f-2026-modelo-1",
    año: 2026, convocatoria: "Modelo", opcion: "A",
    tipo: "Optica", numero: "1",
    enunciado: `Un sistema óptico está compuesto por un foco luminoso, un objeto iluminado por éste, una
lente y una pantalla. Se va cambiando la distancia $s$ entre el objeto y la lente y se busca la posición
de la pantalla en la que la imagen está enfocada. La gráfica adjunta muestra la relación entre el
aumento lateral $M$ y la distancia $s'$ entre la lente y la pantalla.

![Gráfica del aumento lateral M frente a la distancia lente-pantalla s'](/fisica-imgs/2026-modelo/pregunta-1-grafica-aumento.png)

a) (1 punto) Demuestre que el aumento lateral, $M$, tiene la siguiente expresión en función de la
distancia focal imagen, $f'$, y de la posición de la imagen, $s'$:
$$M = 1 - \\dfrac{s'}{f'}$$

b) (0,5 puntos) Con los datos de la gráfica, determine la distancia focal de la lente, razonando si es
convergente o divergente.

c) (1 punto) Determine la distancia objeto para el caso en que la distancia lente-imagen es 40 cm y
el aumento lateral es igual a -4. Realice el trazado de rayos en esta situación.`,
    apartados: [],
    puntos: 2.5,
  },
  {
    id: "f-2026-modelo-2A",
    año: 2026, convocatoria: "Modelo", opcion: "A",
    tipo: "Gravitacion", numero: "2.A",
    enunciado: `Consideremos el planeta extrasolar G-876d, que tiene una masa igual a 6 veces la masa
de la Tierra y un radio de 1,73 veces el radio de la Tierra. El planeta describe una órbita circular de
radio $3{,}14 \\cdot 10^6$ km en torno a la estrella Gliese, cuya masa es de $6{,}37 \\cdot 10^{29}$ kg. Determine:

a) (1 punto) La aceleración de la gravedad en la superficie del planeta.

b) (1 punto) La velocidad del planeta en la órbita y su periodo de revolución.

c) (0,5 puntos) La energía del planeta en la órbita.

Datos: Constante de la Gravitación Universal, $G = 6{,}67 \\cdot 10^{-11}\\ \\text{N m}^2\\ \\text{kg}^{-2}$; Masa de la Tierra,
$M_T = 5{,}97 \\cdot 10^{24}$ kg; Radio de la Tierra, $R_T = 6{,}37 \\cdot 10^6$ m.`,
    apartados: [],
    puntos: 2.5,
  },
  {
    id: "f-2026-modelo-2B",
    año: 2026, convocatoria: "Modelo", opcion: "B",
    tipo: "Gravitacion", numero: "2.B",
    enunciado: `Plutón es un planeta enano del sistema solar que describe una órbita con un periodo de
248 años terrestres. Sabiendo que la órbita de Plutón es elíptica y que la excentricidad de la órbita, es
decir, el cociente entre la distancia del Sol al centro de la elipse, $c$, y el semieje mayor de la elipse,
$a$, es 0,244, determine:

![Esquema de la elipse orbital de Plutón con el Sol en un foco](/fisica-imgs/2026-modelo/pregunta-2b-elipse-pluton.png)

a) (1 punto) La distancia al Sol en la que Plutón está más alejado del mismo (afelio) y en la que está
más cercano (perihelio).

b) (1,5 puntos) Las velocidades orbitales en el afelio y en el perihelio.

Datos: Constante de la Gravitación Universal, $G = 6{,}67 \\cdot 10^{-11}\\ \\text{N m}^2\\ \\text{kg}^{-2}$; Masa del Sol,
$M_{Sol} = 1{,}99 \\cdot 10^{30}$ kg.`,
    apartados: [],
    puntos: 2.5,
  },
  {
    id: "f-2026-modelo-3A",
    año: 2026, convocatoria: "Modelo", opcion: "A",
    tipo: "Electricidad", numero: "3.A",
    enunciado: `Una partícula con carga $-2$ nC está situada en el punto $(-5, 0)$ m del plano $xy$. Otra
partícula con carga $+2$ nC está situada en el punto $(5, 0)$ m del plano $xy$. Determine:

a) (1,5 puntos) El campo y el potencial eléctrico en el punto $A(5, 4)$ m del plano $xy$.

b) (1 punto) El trabajo que realiza la fuerza del campo eléctrico al llevar una carga $q' = 3$ nC desde
$A(5, 4)$ m hasta el punto $B(0, 4)$ m del plano $xy$.

Dato: Constante de la ley de Coulomb, $K = 9 \\cdot 10^9\\ \\text{N m}^2\\ \\text{C}^{-2}$.`,
    apartados: [],
    puntos: 2.5,
  },
  {
    id: "f-2026-modelo-3B",
    año: 2026, convocatoria: "Modelo", opcion: "B",
    tipo: "Electricidad", numero: "3.B",
    enunciado: `Una espira cuadrada de lado $L = 20$ cm está situada en el plano $xy$ y penetra en un
campo magnético uniforme $\\vec{B} = 200\\ \\text{mT}\\ \\hat{k}$ con una velocidad uniforme $\\vec{v}_0 = 2\\ \\text{m s}^{-1}\\ \\hat{i}$
(ver figura). Si la espira está inicialmente completamente fuera del campo magnético y comienza a
entrar en él en $t = 0$, determine:

![Espira cuadrada entrando en un campo magnético uniforme perpendicular al plano](/fisica-imgs/2026-modelo/pregunta-3b-espira-campo.png)

a) (1 punto) El flujo magnético en $t_1 = 50$ ms y $t_2 = 150$ ms.

b) (1 punto) La fem inducida en $t_1 = 50$ ms y $t_2 = 150$ ms.

c) (0,5 puntos) La intensidad que recorre la espira en $t = 200$ ms si su resistencia es de 15 Ω.`,
    apartados: [],
    puntos: 2.5,
  },
  {
    id: "f-2026-modelo-4A",
    año: 2026, convocatoria: "Modelo", opcion: "A",
    tipo: "RadioactividadModerna", numero: "4.A",
    enunciado: `El isótopo del cobalto $^{60}$Co tiene un periodo de semidesintegración de 1925,2 días y
una masa atómica de 59,94 u. Se prepara una muestra de este isótopo que tiene una actividad inicial
de $2{,}64 \\cdot 10^9$ Bq. Calcule:

a) (0,5 puntos) La constante de desintegración del $^{60}$Co.

b) (1 punto) La masa de $^{60}$Co que contiene la muestra.

c) (1 punto) La actividad de la muestra al cabo de 1 año.

Dato: Número de Avogadro, $N_A = 6{,}02 \\cdot 10^{23}\\ \\text{mol}^{-1}$.`,
    apartados: [],
    puntos: 2.5,
  },
  {
    id: "f-2026-modelo-4B",
    año: 2026, convocatoria: "Modelo", opcion: "B",
    tipo: "RadioactividadModerna", numero: "4.B",
    enunciado: `Dentro del complejo de aceleradores que suministran protones al LHC (Large Hadron
Collider) está el PS Booster, un acelerador circular capaz de acelerar protones hasta una energía
cinética de 1,4 GeV. Determine:

a) (1,5 puntos) La masa relativista de los protones cuando su energía cinética es de 1,4 GeV.

b) (1 punto) La velocidad de dichos protones con esta energía.

Datos: Valor absoluto de la carga del electrón, $e = 1{,}6 \\cdot 10^{-19}$ C; Velocidad de la luz en el vacío,
$c = 3 \\cdot 10^8\\ \\text{m s}^{-1}$; Masa en reposo del protón, $m_p = 1{,}67 \\cdot 10^{-27}$ kg.`,
    apartados: [],
    puntos: 2.5,
  },

  {
    id: "f-2025-modelo-1",
    año: 2025, convocatoria: "Modelo", opcion: "A",
    tipo: "Gravitacion", numero: "1",
    enunciado: `Un equipo de astronautas se dirige a un planeta de masa desconocida. Con el objetivo
de poder determinar su masa una vez que estén en su superficie, previamente calibran un muelle en la
Tierra suspendiendo del mismo distintas masas. La gráfica que obtienen se puede ver en la figura 1.

![Elongación del muelle en función de la masa colgada, en la superficie de la Tierra](/fisica-imgs/2025-modelo/pregunta-1-figura1-elongacion-tierra.png)

Cuando llegan al planeta desconocido utilizan las mismas masas y miden la elongación del muelle,
para así determinar la gravedad en la superficie. En este caso, obtienen la gráfica de la figura 2.

![Elongación del muelle en función de la masa colgada, en la superficie del planeta desconocido](/fisica-imgs/2025-modelo/pregunta-1-figura2-elongacion-planeta.png)

a) (0,5 puntos) Halle la constante del muelle utilizando la gráfica de la figura 1, aproximando el valor
de la aceleración de la gravedad en la superficie de la Tierra como $g = 10\\ \\text{m s}^{-2}$.

b) (1 punto) Determine la aceleración de la gravedad en la superficie del planeta utilizando la gráfica
de la figura 2.

c) (1 punto) Sabiendo que el radio del planeta es de $3{,}5 \\cdot 10^3$ km, calcule la masa del planeta.

Dato: Constante de Gravitación Universal, $G = 6{,}67 \\cdot 10^{-11}\\ \\text{N m}^2\\ \\text{kg}^{-2}$.`,
    apartados: [],
    puntos: 2.5,
  },
  {
    id: "f-2025-modelo-2A",
    año: 2025, convocatoria: "Modelo", opcion: "A",
    tipo: "Electricidad", numero: "2.A",
    enunciado: `Sea una distribución de tres cargas puntuales fijas, situadas en los vértices de un
triángulo equilátero, en el plano $xy$: $Q_1 = 4$ nC situada en el punto $P_1(0, 0)$ cm, $Q_2 = -2$ nC
situada en el punto $P_2(2, 2\\sqrt{3})$ cm y $Q_3 = -4$ nC situada en el punto $P_3(4, 0)$ cm.

a) (1 punto) Calcule la fuerza total que $Q_1$ y $Q_2$ ejercen sobre la carga $Q_3$.

b) (1,5 puntos) Obtenga la energía electrostática de la distribución de cargas.

Dato: Constante de la ley de Coulomb, $K = 9 \\cdot 10^9\\ \\text{N m}^2\\ \\text{C}^{-2}$.`,
    apartados: [],
    puntos: 2.5,
  },
  {
    id: "f-2025-modelo-2B",
    año: 2025, convocatoria: "Modelo", opcion: "B",
    tipo: "Electricidad", numero: "2.B",
    enunciado: `Un hilo rectilíneo infinito situado paralelo al eje $x$, que pasa por el punto $(0, 0, 2)$
cm, transporta una corriente $I_1 = 5$ A en el sentido positivo del eje $x$. Un segundo hilo paralelo al
primero, que pasa por el punto $(0, 2, 0)$ cm, transporta una corriente $I_2 = 3$ A en el sentido negativo
del eje $x$.

a) (1,5 puntos) Obtenga el campo magnético creado por ambos hilos en el origen de coordenadas.

b) (1 punto) Calcule el módulo de la fuerza por unidad de longitud que ejerce el primer hilo sobre el
segundo.

Dato: Permeabilidad magnética del vacío, $\\mu_0 = 4\\pi \\cdot 10^{-7}\\ \\text{T m A}^{-1}$.`,
    apartados: [],
    puntos: 2.5,
  },
  {
    id: "f-2025-modelo-3A",
    año: 2025, convocatoria: "Modelo", opcion: "A",
    tipo: "Ondas", numero: "3.A",
    enunciado: `Sean dos fuentes sonoras puntuales de potencias $P_1$ y $P_2$ separadas 8 m. La suma
de sus potencias es de 50 W. Si la intensidad medida en un punto situado en el segmento que une
ambas fuentes, a 2 m de distancia de la fuente de potencia $P_1$, es de $7{,}3 \\cdot 10^{-1}\\ \\text{W m}^{-2}$,
determine:

a) (1,5 puntos) Los valores de las potencias de las fuentes $P_1$ y $P_2$.

b) (1 punto) El nivel de intensidad sonora en el punto medio entre ambas fuentes.

Dato: Intensidad umbral, $I_0 = 1 \\cdot 10^{-12}\\ \\text{W m}^{-2}$.`,
    apartados: [],
    puntos: 2.5,
  },
  {
    id: "f-2025-modelo-3B",
    año: 2025, convocatoria: "Modelo", opcion: "B",
    tipo: "Optica", numero: "3.B",
    enunciado: `Se desea fabricar un espejo convexo tal que, al situar un objeto a la izquierda del
espejo a 12 cm de distancia, se forme una imagen cuyo tamaño se reduzca a la cuarta parte de su
tamaño original.

a) (1,5 puntos) Determine la posición en la que se formará la imagen y el radio de curvatura del
espejo.

b) (1 punto) Realice el correspondiente diagrama de rayos.`,
    apartados: [],
    puntos: 2.5,
  },
  {
    id: "f-2025-modelo-4A",
    año: 2025, convocatoria: "Modelo", opcion: "A",
    tipo: "RadioactividadModerna", numero: "4.A",
    enunciado: `Un protón tiene una masa en reposo equivalente a una energía de 938,2 MeV. El protón
es acelerado hasta alcanzar una velocidad que es un 75 % de la velocidad de la luz. Determine:

a) (1,25 puntos) La masa en reposo del protón.

b) (1,25 puntos) La energía cinética del protón.

Datos: Velocidad de la luz en el vacío, $c = 3 \\cdot 10^8\\ \\text{m s}^{-1}$; Valor absoluto de la carga del
electrón, $e = 1{,}6 \\cdot 10^{-19}$ C.`,
    apartados: [],
    puntos: 2.5,
  },
  {
    id: "f-2025-modelo-4B",
    año: 2025, convocatoria: "Modelo", opcion: "B",
    tipo: "RadioactividadModerna", numero: "4.B",
    enunciado: `En el interior del recinto de la central nuclear de Springfield, en una zona
contaminada permanentemente con $^{231}$Th, ha crecido una parra. Homer Simpson va a la parra y
se come $n$ uvas. Ocho horas más tarde, sale de la central nuclear y al medir su actividad radiactiva
se obtiene un valor de $1{,}19 \\cdot 10^6$ Bq. Si cada uva contiene en el momento de ser cogida de la
parra $1{,}50 \\cdot 10^{-12}$ g de $^{231}$Th, calcule:

a) (1 punto) El tiempo de vida media del $^{231}$Th y la actividad inicial de cada uva.

b) (1,5 puntos) El número total de uvas que ha ingerido Homer Simpson.

Datos: Masa atómica del $^{231}$Th, $M_{231Th} = 231$ u; Número de Avogadro,
$N_A = 6{,}02 \\cdot 10^{23}\\ \\text{mol}^{-1}$; Período de semidesintegración del $^{231}$Th, $T_{1/2} = 25{,}5$ horas.`,
    apartados: [],
    puntos: 2.5,
  },

  // ══════════════════════════════════════════════
  // 2017-2018 Modelo
  // ══════════════════════════════════════════════

  {
    id: "f-2018-modelo-A1",
    año: 2018, convocatoria: "Modelo", opcion: "A",
    tipo: "Gravitacion", numero: "A.1",
    enunciado: "Dos partículas puntuales de masas m₁ = 2 kg y m₂ = 10 kg están situadas en el eje X: m₁ en el origen (x₁ = 0) y m₂ en x₂ = 5 m.",
    apartados: [
      "Determine el punto del eje X en el que el campo gravitatorio debido a ambas masas es nulo.",
      "¿Cuál es el potencial gravitatorio debido a ambas masas en ese punto?",
    ],
    datos: ["G = 6,67·10⁻¹¹ N m² kg⁻²"],
    puntos: 2,
  },
  {
    id: "f-2018-modelo-A2",
    año: 2018, convocatoria: "Modelo", opcion: "A",
    tipo: "Ondas", numero: "A.2",
    enunciado: "Disponemos de n altavoces iguales que emiten como fuentes puntuales. En un punto P situado a una distancia r, el nivel de intensidad sonora total es 70 dB.",
    apartados: [
      "Calcule el valor de n, si cada altavoz genera un nivel de intensidad sonora de 60 dB en dicho punto P.",
      "Determine la potencia de cada altavoz en función de la potencia total.",
    ],
    puntos: 2,
  },
  {
    id: "f-2018-modelo-A3",
    año: 2018, convocatoria: "Modelo", opcion: "A",
    tipo: "Electricidad", numero: "A.3",
    enunciado: "Una carga puntual q = 5 nC está situada en el centro de una esfera de radio R = 10 cm.",
    apartados: [
      "El flujo del campo eléctrico a través de la superficie de la esfera.",
      "El trabajo necesario para traer una carga de 2 nC desde el infinito hasta una distancia de 10 cm del centro de la esfera.",
    ],
    datos: ["K = 1/(4πε₀) = 9·10⁹ N m² C⁻²"],
    puntos: 2,
  },
  {
    id: "f-2018-modelo-A4",
    año: 2018, convocatoria: "Modelo", opcion: "A",
    tipo: "Optica", numero: "A.4",
    enunciado: "Una lente convergente forma de un objeto real una imagen real aumentada dos veces. Al desplazar el objeto 20 cm hacia la lente, la imagen que se obtiene es virtual y con el mismo aumento en valor absoluto.",
    apartados: [
      "Determine la potencia y la distancia focal de la lente.",
      "Realice el diagrama de rayos correspondiente.",
    ],
    puntos: 2,
  },
  {
    id: "f-2018-modelo-A5",
    año: 2018, convocatoria: "Modelo", opcion: "A",
    tipo: "RadioactividadModerna", numero: "A.5",
    enunciado: "Un electrón posee una energía cinética de 40 eV y, en otro caso, alcanza en un ciclotrón una energía cinética de 2 GeV.",
    apartados: [
      "Determine la longitud de onda de De Broglie del electrón con 40 eV de energía cinética.",
      "Calcule la relación entre la masa del electrón acelerado a 2 GeV y su masa en reposo.",
    ],
    datos: ["e = 1,6·10⁻¹⁹ C", "mₑ = 9,1·10⁻³¹ kg", "h = 6,63·10⁻³⁴ J s", "c = 3·10⁸ m s⁻¹"],
    puntos: 2,
  },
  {
    id: "f-2018-modelo-B1",
    año: 2018, convocatoria: "Modelo", opcion: "B",
    tipo: "Gravitacion", numero: "B.1",
    enunciado: "Un sistema doble formado por una estrella y un planeta: el planeta gira en órbita circular con periodo de 210 días y masa 5·10⁻⁶ M, donde M es la masa de la estrella (M = 1,3·10³⁰ kg).",
    apartados: [
      "El radio de la órbita del planeta.",
      "El vector campo gravitatorio total en un punto entre la estrella y el planeta que dista 4,6·10⁵ km del centro del planeta.",
    ],
    datos: ["G = 6,67·10⁻¹¹ N m² kg⁻²"],
    puntos: 2,
  },
  {
    id: "f-2018-modelo-B2",
    año: 2018, convocatoria: "Modelo", opcion: "B",
    tipo: "Ondas", numero: "B.2",
    enunciado: "En el extremo izquierdo de una cuerda tensa y horizontal se aplica un movimiento armónico simple perpendicular a la cuerda, propagándose una onda transversal Y(x,t) = 0,01 sen[π(100t − 2,5x)] (S.I.).",
    apartados: [
      "La velocidad de propagación, frecuencia, longitud de onda y número de onda.",
      "La aceleración y velocidad máximas de un punto cualquiera de la cuerda.",
    ],
    puntos: 2,
  },
  {
    id: "f-2018-modelo-B3",
    año: 2018, convocatoria: "Modelo", opcion: "B",
    tipo: "Electricidad", numero: "B.3",
    enunciado: "Una varilla conductora desliza sin rozamiento por dos alambres conductores paralelos separados L = 5 cm, cerrando un circuito con una resistencia R = 150 Ω, inmersos en un campo magnético uniforme. Inicialmente la varilla está a d = 10 cm de la resistencia.\n\n![Circuito con varilla conductora deslizante en campo magnético uniforme](/fisica-imgs/2018-modelo/pregunta-B3-circuito-varilla.png)\n\nCalcule, para t = 0,2 s, el flujo magnético y la corriente en los siguientes casos:",
    apartados: [
      "El campo magnético es constante e igual a 20 mT y la varilla se desplaza hacia la derecha con velocidad de 4 m/s.",
      "La varilla está inmóvil y el campo magnético varía como B = 5t³ (B en teslas, t en segundos).",
    ],
    puntos: 2,
  },
  {
    id: "f-2018-modelo-B4",
    año: 2018, convocatoria: "Modelo", opcion: "B",
    tipo: "Optica", numero: "B.4",
    enunciado: "Sobre un material transparente limitado por dos superficies planas que forman un ángulo de 60°, incide desde el aire un rayo de luz monocromática con ángulo i = 45°. El índice de refracción del material es 1,5.\n\n![Prisma con rayo incidente a 45° y ángulo de 60° entre superficies](/fisica-imgs/2018-modelo/pregunta-B4-refraccion-prisma.png)",
    apartados: [
      "Los ángulos de refracción en cada una de las superficies.",
      "El menor valor del ángulo de incidencia en la primera superficie para que el rayo pueda emerger a través de la segunda superficie.",
    ],
    datos: ["n_aire = 1"],
    puntos: 2,
  },
  {
    id: "f-2018-modelo-B5",
    año: 2018, convocatoria: "Modelo", opcion: "B",
    tipo: "RadioactividadModerna", numero: "B.5",
    enunciado: "Un metal es iluminado con luz de frecuencia 9·10¹⁴ Hz, emitiendo por efecto fotoeléctrico electrones que pueden ser detenidos con un potencial de frenado de 0,6 V. Con luz de longitud de onda λ = 2,38·10⁻⁷ m, el potencial de frenado pasa a ser de 2,1 V.",
    apartados: [
      "El valor de la constante de Planck.",
      "La función de trabajo del metal.",
    ],
    datos: ["e = 1,6·10⁻¹⁹ C", "c = 3·10⁸ m s⁻¹"],
    puntos: 2,
  },

  // ══════════════════════════════════════════════
  // 2018-2019 Modelo
  // ══════════════════════════════════════════════

  {
    id: "f-2019-modelo-A1",
    año: 2019, convocatoria: "Modelo", opcion: "A",
    tipo: "Gravitacion", numero: "A.1",
    enunciado: "Un satélite de 150 kg describe una órbita circular con un periodo de 30 min cuando se mueve con una velocidad de 2,3·10⁴ m s⁻¹.",
    apartados: [
      "Determine la masa del planeta.",
      "¿Cuál es la energía total de dicho satélite?",
    ],
    datos: ["G = 6,67·10⁻¹¹ N m² kg⁻²"],
    puntos: 2,
  },
  {
    id: "f-2019-modelo-A2",
    año: 2019, convocatoria: "Modelo", opcion: "A",
    tipo: "Ondas", numero: "A.2",
    enunciado: "En una mina a cielo abierto se provoca una explosión de forma que un detector situado a 20 m del punto de la explosión mide una intensidad de onda sonora de 100 W m⁻².",
    apartados: [
      "Determine la potencia del sonido producido por la explosión.",
      "Calcule el nivel de intensidad sonora en un punto situado a 10³ m de distancia de la explosión.",
    ],
    datos: ["I₀ = 10⁻¹² W m⁻²"],
    puntos: 2,
  },
  {
    id: "f-2019-modelo-A3",
    año: 2019, convocatoria: "Modelo", opcion: "A",
    tipo: "Electricidad", numero: "A.3",
    enunciado: "Un hilo conductor indefinido situado a lo largo del eje z transporta una corriente de 20 mA en sentido positivo del eje.",
    apartados: [
      "Enuncie el teorema de Ampère.",
      "Calcule la fuerza magnética experimentada por un electrón que lleva una velocidad de 10⁵ m s⁻¹ en la dirección positiva del eje y cuando se encuentra en la posición (0,5,0) m.",
    ],
    datos: ["e = 1,6·10⁻¹⁹ C", "μ₀ = 4π·10⁻⁷ N A⁻²"],
    puntos: 2,
  },
  {
    id: "f-2019-modelo-A4",
    año: 2019, convocatoria: "Modelo", opcion: "A",
    tipo: "Optica", numero: "A.4",
    enunciado: "Una persona con presbicia (vista cansada) tiene su punto próximo situado a 1 m y quiere leer a una distancia de 0,25 m.",
    apartados: [
      "Explique en qué consiste la presbicia o vista cansada.",
      "Determine la potencia y la distancia focal de la lente que debe utilizar.",
    ],
    puntos: 2,
  },
  {
    id: "f-2019-modelo-A5",
    año: 2019, convocatoria: "Modelo", opcion: "A",
    tipo: "RadioactividadModerna", numero: "A.5",
    enunciado: "Una pelota de 20 g de masa posee una energía cinética de 4 J. Los electrones ultrarelativistas en el Acelerador Lineal de Stanford (SLAC) alcanzan una energía cinética máxima de 5·10⁴ MeV.",
    apartados: [
      "Determine la longitud de onda de De Broglie de la pelota.",
      "¿Cuál es la velocidad máxima que alcanzan dichos electrones en el acelerador?",
    ],
    datos: ["e = 1,6·10⁻¹⁹ C", "mₑ = 9,1·10⁻³¹ kg", "h = 6,63·10⁻³⁴ J s", "c = 3·10⁸ m s⁻¹"],
    puntos: 2,
  },
  {
    id: "f-2019-modelo-B1",
    año: 2019, convocatoria: "Modelo", opcion: "B",
    tipo: "Gravitacion", numero: "B.1",
    enunciado: "El planeta Cibeles tiene un radio Rc = 8,5·10³ km y gira en torno a una estrella Aya describiendo una órbita circular de radio R = 1,8·10⁸ km. Un objeto soltado desde 10 m de altura tarda 1,58 s en tocar el suelo. Cibeles completa una vuelta a Aya en 395 días terrestres.",
    apartados: [
      "La aceleración de la gravedad sobre la superficie de Cibeles y el valor de su masa.",
      "El valor de la masa de la estrella Aya.",
    ],
    datos: ["G = 6,67·10⁻¹¹ N m² kg⁻²"],
    puntos: 2,
  },
  {
    id: "f-2019-modelo-B2",
    año: 2019, convocatoria: "Modelo", opcion: "B",
    tipo: "Ondas", numero: "B.2",
    enunciado: "Una onda armónica transversal se propaga por una cuerda tensa en el sentido positivo del eje y con longitud de onda λ = 0,1 m. En y = 0 m, el movimiento vibratorio en z es z(0,t) = 0,5 sen(π/4·t + π/2) (S.I.).",
    apartados: [
      "La expresión matemática que representa dicha onda.",
      "La velocidad y la aceleración de oscilación del punto de la cuerda que ocupa la posición y = 0,5 m en el instante t = 40 s.",
    ],
    puntos: 2,
  },
  {
    id: "f-2019-modelo-B3",
    año: 2019, convocatoria: "Modelo", opcion: "B",
    tipo: "Electricidad", numero: "B.3",
    enunciado: "Considérese una carga puntual q en el origen de coordenadas.",
    apartados: [
      "Defina el flujo de una magnitud vectorial. Enuncie el teorema de Gauss.",
      "Determine la expresión del flujo del campo eléctrico que crea dicha carga a través de una superficie esférica de radio R centrada en el origen, y utilice el teorema de Gauss para determinar el valor de ese campo eléctrico.",
    ],
    puntos: 2,
  },
  {
    id: "f-2019-modelo-B4",
    año: 2019, convocatoria: "Modelo", opcion: "B",
    tipo: "Optica", numero: "B.4",
    enunciado: "Un pez se encuentra dentro del agua de un estanque observando lo que hay fuera del agua. El índice de refracción del agua es 1,33.",
    apartados: [
      "El ángulo crítico para la frontera entre el agua y el aire. Justifique si el pez podría ver un objeto fuera del agua mirando hacia la superficie con un ángulo de 60° respecto de la normal.",
      "Si el pez observa un objeto verde (longitud de onda en aire de 525 nm), obtenga la frecuencia y la longitud de onda de esa luz en el agua.",
    ],
    datos: ["n_aire = 1", "c = 3·10⁸ m s⁻¹"],
    puntos: 2,
  },
  {
    id: "f-2019-modelo-B5",
    año: 2019, convocatoria: "Modelo", opcion: "B",
    tipo: "RadioactividadModerna", numero: "B.5",
    enunciado: "El período de semidesintegración del isótopo más estable del radio, ²²⁶Ra, es de 1602 años. Se dispone inicialmente de una muestra de 20 mg.",
    apartados: [
      "Calcule su vida media y la masa de ²²⁶Ra al cabo de 1800 meses.",
      "¿En cuánto se reduce la actividad de la muestra cuando haya transcurrido un tiempo igual a la vida media del isótopo?",
    ],
    puntos: 2,
  },

  // ══════════════════════════════════════════════
  // 2019-2020 Modelo Orientativo
  // ══════════════════════════════════════════════

  {
    id: "f-2020-modelo-A1",
    año: 2020, convocatoria: "Modelo", opcion: "A",
    tipo: "Gravitacion", numero: "A.1",
    enunciado: "El satélite UARS se puso en órbita en 1991 para estudiar la entrada y salida de energía en la atmósfera superior. Su masa era de 5800 kg y realizaba 15 órbitas diarias.",
    apartados: [
      "La altura sobre la superficie de la Tierra de dicho satélite cuando estaba en órbita.",
      "La energía total del satélite cuando estaba en órbita.",
    ],
    datos: ["G = 6,67·10⁻¹¹ N m² kg⁻²", "Rₜ = 6371 km", "Mₜ = 5,97·10²⁴ kg"],
    puntos: 2,
  },
  {
    id: "f-2020-modelo-A2",
    año: 2020, convocatoria: "Modelo", opcion: "A",
    tipo: "Ondas", numero: "A.2",
    enunciado: "Una onda armónica unidimensional se propaga a lo largo del sentido positivo del eje x con una velocidad de propagación de 1500 m s⁻¹. La gráfica adjunta muestra la elongación de la onda para el instante t = 0 s.\n\n![Gráfica de elongación de la onda en t=0s](/fisica-imgs/2020-modelo/pregunta-A2-grafica-onda.png)",
    apartados: [
      "Determine el número de onda y la frecuencia angular de dicha onda.",
      "Obtenga la expresión matemática que represente dicha onda.",
    ],
    puntos: 2,
  },
  {
    id: "f-2020-modelo-A3",
    año: 2020, convocatoria: "Modelo", opcion: "A",
    tipo: "Electricidad", numero: "A.3",
    enunciado: "Un electrón, situado inicialmente en el origen de coordenadas, se mueve con una velocidad inicial v₀ = 2î m s⁻¹, en presencia de un campo magnético uniforme B = 3k̂ T y de un campo eléctrico uniforme E = −î N C⁻¹.",
    apartados: [
      "La fuerza total sobre el electrón debida a los campos B y E, en el instante inicial.",
      "La diferencia de potencial entre los puntos (0,0,0) y (2,0,0) m, indicando el punto de mayor potencial. ¿Qué trabajo realiza la fuerza total para desplazar el electrón desde el origen hasta (2,0,0) a lo largo del eje x?",
    ],
    datos: ["e = 1,6·10⁻¹⁹ C"],
    puntos: 2,
  },
  {
    id: "f-2020-modelo-A4",
    año: 2020, convocatoria: "Modelo", opcion: "A",
    tipo: "Optica", numero: "A.4",
    enunciado: "Un objeto real está situado 20 cm delante de una lente delgada planoconvexa de 10 dioptrías de potencia e índice de refracción n = 1,6.",
    apartados: [
      "Calcule el radio de curvatura de la cara esférica de la lente y la posición de la imagen.",
      "Si se utiliza la lente anterior como lupa, determine la posición en la que habría que situar el objeto para que la imagen formada fuera virtual y dos veces mayor.",
    ],
    puntos: 2,
  },
  {
    id: "f-2020-modelo-A5",
    año: 2020, convocatoria: "Modelo", opcion: "A",
    tipo: "RadioactividadModerna", numero: "A.5",
    enunciado: "Un haz luminoso monocromático de 400 nm de longitud de onda incide sobre un material cuyo trabajo de extracción para el efecto fotoeléctrico es de 2,5 eV. El haz incidente tiene una intensidad de 5·10⁻⁹ W m⁻².",
    apartados: [
      "La energía cinética máxima de los electrones extraídos y su longitud de onda de De Broglie.",
      "El número de fotones incidentes por unidad de tiempo y superficie, y la energía por unidad de tiempo y superficie de los electrones emitidos suponiendo que todos salen con la energía cinética máxima.",
    ],
    datos: ["e = 1,6·10⁻¹⁹ C", "mₑ = 9,1·10⁻³¹ kg", "h = 6,63·10⁻³⁴ J s", "c = 3·10⁸ m s⁻¹"],
    puntos: 2,
  },
  {
    id: "f-2020-modelo-B1",
    año: 2020, convocatoria: "Modelo", opcion: "B",
    tipo: "Gravitacion", numero: "B.1",
    enunciado: "Unos astrónomos han descubierto un nuevo sistema solar formado por una estrella de masa 6,0·10³⁰ kg y un planeta que gira en torno a ella en órbita circular, tardando 3 años terrestres en dar una vuelta completa.",
    apartados: [
      "Determine la distancia a la que se encuentra el planeta de la estrella.",
      "Si en la superficie del planeta la aceleración de la gravedad es 15 m s⁻² y la velocidad de escape es de 11,2 km s⁻¹, ¿cuánto valen la masa y el radio del planeta?",
    ],
    datos: ["G = 6,67·10⁻¹¹ N m² kg⁻²"],
    puntos: 2,
  },
  {
    id: "f-2020-modelo-B2",
    año: 2020, convocatoria: "Modelo", opcion: "B",
    tipo: "Ondas", numero: "B.2",
    enunciado: "Se mide el nivel de intensidad sonora de una sirena, considerada foco puntual, a una distancia r, alcanzando un valor de 50 dB. Al medir 50 m más cerca, en dirección radial, el nivel de intensidad medida es de 70 dB.",
    apartados: [
      "El valor de la distancia r.",
      "La intensidad de la onda sonora a esa distancia r y la potencia de la sirena.",
    ],
    datos: ["I₀ = 10⁻¹² W m⁻²"],
    puntos: 2,
  },
  {
    id: "f-2020-modelo-B3",
    año: 2020, convocatoria: "Modelo", opcion: "B",
    tipo: "Electricidad", numero: "B.3",
    enunciado: "Dos cargas puntuales de +10 nC y −10 nC se encuentran situadas en el plano xy en las posiciones (0,−6) µm y (0,6) µm, respectivamente.",
    apartados: [
      "El campo eléctrico y el potencial en la posición (8,0) µm.",
      "El trabajo realizado por el campo al trasladar una carga de +5 nC desde el punto (8,0) µm hasta (8,6) µm.",
    ],
    datos: ["K = 9·10⁹ N m² C⁻²"],
    puntos: 2,
  },
  {
    id: "f-2020-modelo-B4",
    año: 2020, convocatoria: "Modelo", opcion: "B",
    tipo: "Optica", numero: "B.4",
    enunciado: "Un rayo de luz monocromático que se propaga por el medio 1 (n₁ = 1,6) con longitud de onda 460 nm incide sobre la superficie de separación con el medio 2 (n₂ = 1,4).\n\n![Tres medios con índices de refracción n1=1,6, n2=1,4 y n3=1,2](/fisica-imgs/2020-modelo/pregunta-B4-tres-medios.png)",
    apartados: [
      "Calcule la frecuencia y la longitud de onda de la luz cuando se propaga en el segundo medio.",
      "Tras el segundo medio, la luz llega a un tercer medio (n₃ = 1,2). Determine el menor ángulo de incidencia del rayo en la superficie 1-2 para que, al llegar a la superficie 2-3, se inicie la reflexión total. Explique en qué consiste este fenómeno.",
    ],
    datos: ["c = 3·10⁸ m s⁻¹"],
    puntos: 2,
  },
  {
    id: "f-2020-modelo-B5",
    año: 2020, convocatoria: "Modelo", opcion: "B",
    tipo: "RadioactividadModerna", numero: "B.5",
    enunciado: "Un isótopo radiactivo utilizado en medicina nuclear tiene una vida media de 6 h. Se inyecta inicialmente a un paciente una cantidad de 1 mg de dicho isótopo.",
    apartados: [
      "Calcule el periodo de semidesintegración del isótopo y la masa que queda en el paciente al cabo de un día.",
      "Defina qué es un becquerel y obtenga la actividad de la muestra a las 24 h.",
    ],
    datos: ["Nₐ = 6,02·10²³ mol⁻¹", "M = 98,90 u"],
    puntos: 2,
  },

  // ══════════════════════════════════════════════
  // 2020-2021 Modelo Orientativo
  // ══════════════════════════════════════════════

  {
    id: "f-2021-modelo-A1",
    año: 2021, convocatoria: "Modelo", opcion: "A",
    tipo: "Gravitacion", numero: "A.1",
    enunciado: "El Sol orbita alrededor del centro galáctico siguiendo una órbita circular de radio 2,4·10¹⁷ km y periodo de 203 millones de años.",
    apartados: [
      "La velocidad orbital del Sol alrededor del centro galáctico.",
      "La masa del centro galáctico suponiendo que toda la masa se concentra en un agujero negro en su centro.",
    ],
    datos: ["G = 6,67·10⁻¹¹ N m² kg⁻²"],
    puntos: 2,
  },
  {
    id: "f-2021-modelo-A2",
    año: 2021, convocatoria: "Modelo", opcion: "A",
    tipo: "Ondas", numero: "A.2",
    enunciado: "La potencia media transferida por una onda armónica en una cuerda viene dada por P = ½μω²A²v, donde μ es la densidad lineal de masa, ω la frecuencia angular, A la amplitud y v la velocidad de propagación. Una onda armónica y(x,t) = 0,01 sen(20πt − 5πx + π/2) (S.I.) se propaga por una cuerda cuya densidad lineal es de 2 g cm⁻¹.",
    apartados: [
      "La longitud de onda y el periodo de la onda.",
      "La potencia media que transfiere la onda y la energía que transmite en un tiempo de 10 s.",
    ],
    puntos: 2,
  },
  {
    id: "f-2021-modelo-A3",
    año: 2021, convocatoria: "Modelo", opcion: "A",
    tipo: "Electricidad", numero: "A.3",
    enunciado: "Dos cargas puntuales iguales de 5 nC se encuentran en el plano (x,y) en los puntos (0,3) m y (0,−3) m.",
    apartados: [
      "Determine el campo eléctrico creado por ambas cargas en el punto (4,0) m.",
      "Si se sitúa una partícula cargada de masa 3 g y carga 3 mC en el origen con velocidad inicial 2î m s⁻¹, calcule la velocidad de la partícula cuando pasa por (4,0) m.",
    ],
    datos: ["K = 9·10⁹ N m² C⁻²"],
    puntos: 2,
  },
  {
    id: "f-2021-modelo-A4",
    año: 2021, convocatoria: "Modelo", opcion: "A",
    tipo: "Optica", numero: "A.4",
    enunciado: "Un sistema óptico está formado por dos lentes convergentes idénticas de distancia focal 20 cm, separadas una cierta distancia desconocida. Un objeto luminoso se sitúa 25 cm a la izquierda de la primera lente.",
    apartados: [
      "Calcule la distancia entre las dos lentes para que la imagen del objeto que forma el sistema óptico se encuentre en el infinito.",
      "Realice el correspondiente trazado de rayos.",
    ],
    puntos: 2,
  },
  {
    id: "f-2021-modelo-A5",
    año: 2021, convocatoria: "Modelo", opcion: "A",
    tipo: "RadioactividadModerna", numero: "A.5",
    enunciado: "Cuando un haz de luz de longitud de onda 150 nm incide sobre una lámina de oro, se emiten electrones cuya energía cinética máxima es de 3,17 eV.",
    apartados: [
      "El trabajo de extracción y la longitud de onda de corte para el efecto fotoeléctrico del oro.",
      "La longitud de onda de De Broglie de los electrones emitidos con la máxima energía cinética.",
    ],
    datos: ["e = 1,6·10⁻¹⁹ C", "mₑ = 9,1·10⁻³¹ kg", "h = 6,63·10⁻³⁴ J s", "c = 3·10⁸ m s⁻¹"],
    puntos: 2,
  },
  {
    id: "f-2021-modelo-B1",
    año: 2021, convocatoria: "Modelo", opcion: "B",
    tipo: "Gravitacion", numero: "B.1",
    enunciado: "Un planeta esférico tiene una masa igual a 360 veces la masa de la Tierra, y la velocidad de escape para objetos cerca de su superficie es 6 veces la velocidad de escape terrestre.",
    apartados: [
      "La relación entre los radios del planeta y de la Tierra.",
      "La relación entre las aceleraciones de la gravedad en la superficie del planeta y de la Tierra.",
    ],
    puntos: 2,
  },
  {
    id: "f-2021-modelo-B2",
    año: 2021, convocatoria: "Modelo", opcion: "B",
    tipo: "Ondas", numero: "B.2",
    enunciado: "La gráfica adjunta representa las curvas de umbral de audición y umbral de dolor del oído humano medio en función de la frecuencia del sonido.\n\n![Curvas de umbral de audición y umbral de dolor frente a la frecuencia](/fisica-imgs/2021-modelo/pregunta-B2-umbrales-audicion.png)",
    apartados: [
      "La distancia máxima a la que debe encontrarse una persona para percibir un trueno de frecuencia 100 Hz y potencia 4 W.",
      "La potencia sonora máxima que puede emitir una sirena de 10000 Hz, situada como mínimo a 5 m de las personas, para no superar el umbral de dolor.",
    ],
    datos: ["I₀ = 10⁻¹² W m⁻²"],
    puntos: 2,
  },
  {
    id: "f-2021-modelo-B3",
    año: 2021, convocatoria: "Modelo", opcion: "B",
    tipo: "Electricidad", numero: "B.3",
    enunciado: "En una región del espacio existe un campo magnético uniforme de 0,5 T perpendicular al plano del papel. Se sitúa un alambre conductor en forma de U, de resistencia despreciable, cerrado por una varilla de longitud l = 20 cm y resistencia 2 Ω.\n\n![Circuito en U con varilla conductora en campo magnético uniforme](/fisica-imgs/2021-modelo/pregunta-B3-circuito-U.png)",
    apartados: [
      "La velocidad (módulo, dirección y sentido) con la que hay que mover la varilla para generar una corriente de 1 A en sentido antihorario.",
      "La fuerza necesaria para que la velocidad de la varilla sea constante.",
    ],
    puntos: 2,
  },
  {
    id: "f-2021-modelo-B4",
    año: 2021, convocatoria: "Modelo", opcion: "B",
    tipo: "Optica", numero: "B.4",
    enunciado: "Sobre la cara AB de un prisma incide perpendicularmente desde el aire un haz de luz monocromática de frecuencia 4,6·10¹⁴ Hz.\n\n![Prisma con ángulo de 45° en la cara de incidencia](/fisica-imgs/2021-modelo/pregunta-B4-prisma.png)",
    apartados: [
      "Calcule el índice de refracción que debería tener el prisma para que el ángulo de emergencia del haz a través de la cara AC sea de 90°.",
      "Determine las longitudes de onda del haz de luz fuera y dentro del prisma.",
    ],
    datos: ["n_aire = 1", "c = 3·10⁸ m s⁻¹"],
    puntos: 2,
  },
  {
    id: "f-2021-modelo-B5",
    año: 2021, convocatoria: "Modelo", opcion: "B",
    tipo: "RadioactividadModerna", numero: "B.5",
    enunciado: "El tecnecio 99 es un isótopo radiactivo empleado en radiodiagnóstico, con un período de semidesintegración de 6 horas.",
    apartados: [
      "La constante de desintegración radiactiva.",
      "La cantidad de tecnecio 99 en gramos que hay que suministrar a un paciente de 70 kg si la dosis recomendada es de 10 MBq por kg de masa.",
    ],
    datos: ["Nₐ = 6,02·10²³ mol⁻¹", "M₉₉Tc = 99 u"],
    puntos: 2,
  },

  // ══════════════════════════════════════════════
  // 2021-2022 Modelo Orientativo
  // ══════════════════════════════════════════════

  {
    id: "f-2022-modelo-A1",
    año: 2022, convocatoria: "Modelo", opcion: "A",
    tipo: "Gravitacion", numero: "A.1",
    enunciado: "La distancia de la Tierra al Sol varía a lo largo de su órbita entre 1,52·10¹¹ m en el afelio y 1,47·10¹¹ m en el perihelio.",
    apartados: [
      "Calcule el trabajo realizado por el campo gravitatorio del Sol sobre la Tierra en el tránsito del afelio al perihelio.",
      "Si la energía mecánica de la Tierra en su órbita vale −2,65·10³³ J, ¿cuál es la velocidad máxima que alcanza la Tierra en ella?",
    ],
    datos: ["G = 6,67·10⁻¹¹ N m² kg⁻²", "Mₜ = 5,97·10²⁴ kg", "Mₛ = 1,99·10³⁰ kg"],
    puntos: 2,
  },
  {
    id: "f-2022-modelo-A2",
    año: 2022, convocatoria: "Modelo", opcion: "A",
    tipo: "Ondas", numero: "A.2",
    enunciado: "Una onda transversal que se propaga en el sentido positivo del eje x, con velocidad de propagación 4/3 m s⁻¹, es y(x,t) = A cos(ωt − kx + φ). En t = 1 s el punto x = 1 m tiene una aceleración de −32π² cm s⁻² y un desplazamiento de +2 cm. En t = 0 s, el punto x = 0 tiene el desplazamiento máximo de valor −2 cm.",
    apartados: [
      "La frecuencia angular y el número de onda.",
      "La amplitud y la fase inicial de la onda φ.",
    ],
    puntos: 2,
  },
  {
    id: "f-2022-modelo-A3",
    año: 2022, convocatoria: "Modelo", opcion: "A",
    tipo: "Electricidad", numero: "A.3",
    enunciado: "Dos hilos indefinidos, paralelos al eje z, están recorridos por una intensidad I = 2 A. El hilo 1 corta el plano xy en (0,a) y el hilo 2 en (2a,0), siendo a = 20 cm.\n\n![Dos hilos conductores paralelos con corrientes en sentidos opuestos](/fisica-imgs/2022-modelo/pregunta-A3-dos-hilos.png)",
    apartados: [
      "El campo magnético creado por ambos hilos en el origen de coordenadas O(0,0).",
      "La fuerza magnética por unidad de longitud que ejerce el hilo 1 sobre el hilo 2.",
    ],
    datos: ["μ₀ = 4π·10⁻⁷ T m A⁻¹"],
    puntos: 2,
  },
  {
    id: "f-2022-modelo-A4",
    año: 2022, convocatoria: "Modelo", opcion: "A",
    tipo: "Optica", numero: "A.4",
    enunciado: "Se sitúa un objeto a la izquierda de una lente convergente, colocado verticalmente sobre el eje óptico. Determine el aumento lateral de la imagen y realice el trazado de rayos si el objeto se sitúa a:",
    apartados: [
      "Una distancia de un tercio de la distancia focal de la lente.",
      "Una distancia de tres veces la distancia focal de la lente.",
    ],
    puntos: 2,
  },
  {
    id: "f-2022-modelo-A5",
    año: 2022, convocatoria: "Modelo", opcion: "A",
    tipo: "RadioactividadModerna", numero: "A.5",
    enunciado: "Al iluminar un metal con luz de 120 nm de longitud de onda se emiten electrones frenados por un potencial de 7,2 V. Con luz de frecuencia 1,67·10¹⁵ Hz, el potencial de frenado se reduce a 3,8 V.",
    apartados: [
      "Determine el valor de la constante de Planck.",
      "Halle el trabajo de extracción del metal, en eV, y su frecuencia umbral para el efecto fotoeléctrico.",
    ],
    datos: ["c = 3·10⁸ m s⁻¹", "e = 1,6·10⁻¹⁹ C"],
    puntos: 2,
  },
  {
    id: "f-2022-modelo-B1",
    año: 2022, convocatoria: "Modelo", opcion: "B",
    tipo: "Gravitacion", numero: "B.1",
    enunciado: "En un experimento similar al de Cavendish, una pequeña esfera A de masa m se sitúa ante dos esferas B y C de igual masa M, formando los centros de las tres un triángulo rectángulo de catetos D y d.\n\n![Triángulo rectángulo con esferas A, B y C de catetos D y d](/fisica-imgs/2022-modelo/pregunta-B1-cavendish.png)",
    apartados: [
      "¿Qué relación debe existir entre D y d para que la fuerza de C sobre A sea la décima parte de la de B sobre A?",
      "Si M = 10 kg y la atracción de B sobre A es la milmillonésima parte del peso de A en la superficie terrestre, ¿cuánto vale d?",
    ],
    datos: ["Mₜ = 5,97·10²⁴ kg", "Rₜ = 6,37·10⁶ m"],
    puntos: 2,
  },
  {
    id: "f-2022-modelo-B2",
    año: 2022, convocatoria: "Modelo", opcion: "B",
    tipo: "Ondas", numero: "B.2",
    enunciado: "En el centro de una pista de circo circular hay un sonómetro. Un faquir actúa a 5 m del centro y grita marcando 80 dB; un espectador del público grita marcando 73,98 dB; todo el público grita al unísono marcando 90,97 dB. Todos gritan con la misma potencia.",
    apartados: [
      "La potencia del grito emitido por el faquir.",
      "La distancia a la que se encuentra el público del centro de la pista y el número de personas que asisten al espectáculo.",
    ],
    datos: ["I₀ = 10⁻¹² W m⁻²"],
    puntos: 2,
  },
  {
    id: "f-2022-modelo-B3",
    año: 2022, convocatoria: "Modelo", opcion: "B",
    tipo: "Electricidad", numero: "B.3",
    enunciado: "Una espira cuadrada de lado a = 30 cm penetra con velocidad constante v = 3î cm s⁻¹ en una zona (x > 0) con campo magnético B = 1·10⁻³k̂ T. Inicialmente la espira está completamente fuera del campo, con un lado sobre el eje y.\n\n![Espira cuadrada penetrando en una región con campo magnético uniforme](/fisica-imgs/2022-modelo/pregunta-B3-espira.png)",
    apartados: [
      "Represente gráficamente la fem inducida en la espira en función del tiempo.",
      "Si la resistencia de la espira es de 10 Ω, obtenga el valor máximo de la intensidad. Razone el sentido de la corriente inducida.",
    ],
    puntos: 2,
  },
  {
    id: "f-2022-modelo-B4",
    año: 2022, convocatoria: "Modelo", opcion: "B",
    tipo: "Optica", numero: "B.4",
    enunciado: "Un haz de luz con dos rayos monocromáticos incide desde el aire con ángulo de 40° sobre un vidrio de 20 cm de espesor. El índice de refracción del vidrio es n₁ = 1,61 para el primer rayo y n₂ = 1,67 para el segundo.",
    apartados: [
      "Calcule la distancia entre los dos rayos a la salida del vidrio por su cara inferior.",
      "Si la frecuencia del primer rayo es 4,21·10¹⁴ Hz, obtenga su longitud de onda dentro del vidrio.",
    ],
    datos: ["n_aire = 1", "c = 3·10⁸ m s⁻¹"],
    puntos: 2,
  },
  {
    id: "f-2022-modelo-B5",
    año: 2022, convocatoria: "Modelo", opcion: "B",
    tipo: "RadioactividadModerna", numero: "B.5",
    enunciado: "Un trozo de madera con 25 g de carbono, tallado como empuñadura, se encontró en ruinas antiguas con una actividad en ¹⁴C de 5,2 Bq. En organismos vivos hay 1,3·10⁻¹² átomos de ¹⁴C por cada átomo de ¹²C, y el período de semidesintegración del ¹⁴C es 5730 años.",
    apartados: [
      "Determine la actividad que tenía el trozo de madera cuando la rama fue cortada.",
      "Calcule hace cuánto tiempo fue cortada la rama.",
    ],
    datos: ["Mc = 12 u", "Nₐ = 6,02·10²³ mol⁻¹"],
    puntos: 2,
  },

  // ══════════════════════════════════════════════
  // 2022-2023 Modelo Orientativo
  // ══════════════════════════════════════════════

  {
    id: "f-2023-modelo-A1",
    año: 2023, convocatoria: "Modelo", opcion: "A",
    tipo: "Gravitacion", numero: "A.1",
    enunciado: "Un satélite de 400 kg orbita alrededor de la Tierra describiendo una órbita circular a una altura de 15000 km.",
    apartados: [
      "La energía que hubo que transmitirle para ponerlo en órbita desde la superficie de la Tierra, y su periodo.",
      "La energía mínima que hay que suministrarle para que escape de la atracción gravitatoria terrestre desde su órbita actual.",
    ],
    datos: ["G = 6,67·10⁻¹¹ N m² kg⁻²", "Mₜ = 5,97·10²⁴ kg", "Rₜ = 6,37·10⁶ m"],
    puntos: 2,
  },
  {
    id: "f-2023-modelo-A2",
    año: 2023, convocatoria: "Modelo", opcion: "A",
    tipo: "Ondas", numero: "A.2",
    enunciado: "Una onda transversal se propaga en el sentido negativo del eje x con velocidad 2 m s⁻¹. En el origen y en t = 0, la elongación es nula y la velocidad de oscilación es −40π cm s⁻¹. La separación entre dos puntos que oscilan en fase es de 50 cm.",
    apartados: [
      "La amplitud y la frecuencia de la onda.",
      "La expresión matemática de la onda.",
    ],
    puntos: 2,
  },
  {
    id: "f-2023-modelo-A3",
    año: 2023, convocatoria: "Modelo", opcion: "A",
    tipo: "Electricidad", numero: "A.3",
    enunciado: "Una corteza esférica hueca de radio 3 cm, centrada en el origen, está cargada con densidad superficial homogénea σ = 2 µC m⁻².",
    apartados: [
      "Calcule el campo eléctrico en los puntos (0,01, 0,01, 0) m y (2, 3, 0) m.",
      "Obtenga el trabajo realizado por el campo eléctrico para trasladar una carga de 1 nC desde (0,2,0) m hasta (3,0,0) m.",
    ],
    datos: ["K = 9·10⁹ N m² C⁻²"],
    puntos: 2,
  },
  {
    id: "f-2023-modelo-A4",
    año: 2023, convocatoria: "Modelo", opcion: "A",
    tipo: "Optica", numero: "A.4",
    enunciado: "A 15 cm a la izquierda de una lente se sitúa un objeto, cuya imagen se forma 30 cm a la derecha de la lente.",
    apartados: [
      "Calcule la distancia focal de la lente y el aumento lateral de la imagen.",
      "Una segunda lente, de distancia focal 12 cm, se coloca a la derecha de la primera. La imagen final es, respecto al objeto original, derecha y de tamaño triple. Determine la distancia entre la primera lente y la imagen final, y elabore el trazado de rayos.",
    ],
    puntos: 2,
  },
  {
    id: "f-2023-modelo-A5",
    año: 2023, convocatoria: "Modelo", opcion: "A",
    tipo: "RadioactividadModerna", numero: "A.5",
    enunciado: "Un positrón en reposo se acelera en un acelerador lineal a través de una diferencia de potencial de 3 MV.",
    apartados: [
      "Obtenga la energía cinética y la energía relativista que alcanza el positrón.",
      "Calcule la masa relativista del positrón y su velocidad tras la etapa de aceleración.",
    ],
    datos: ["c = 3·10⁸ m s⁻¹", "e = 1,6·10⁻¹⁹ C", "mₑ₊ = 9,1·10⁻³¹ kg"],
    puntos: 2,
  },
  {
    id: "f-2023-modelo-B1",
    año: 2023, convocatoria: "Modelo", opcion: "B",
    tipo: "Gravitacion", numero: "B.1",
    enunciado: "Dos masas m₁ = 10 kg y m₂ = 15 kg se encuentran en los puntos (0,0) m y (2,0) m del plano xy.\n\n![Tres trayectorias A, B y C entre los puntos (2,0) y (0,1)](/fisica-imgs/2023-modelo/pregunta-B1-trayectorias.png)",
    apartados: [
      "Calcule la fuerza gravitatoria debida a m₁ y m₂ que experimentará una masa de 5 kg situada en (2,1) m.",
      "Halle el trabajo que realiza el campo gravitatorio creado por m₁ cuando m₂ se desplaza de (2,0) m a (0,1) m a través de los tres caminos representados (sin la masa de 5 kg).",
    ],
    datos: ["G = 6,67·10⁻¹¹ N m² kg⁻²"],
    puntos: 2,
  },
  {
    id: "f-2023-modelo-B2",
    año: 2023, convocatoria: "Modelo", opcion: "B",
    tipo: "Ondas", numero: "B.2",
    enunciado: "Un foco sonoro puntual emite ondas esféricas: a una distancia desconocida x el nivel de intensidad es 60 dB, y a x + 10 m es 47,96 dB.",
    apartados: [
      "La distancia x.",
      "La potencia con la que emite el foco.",
    ],
    datos: ["I₀ = 10⁻¹² W m⁻²"],
    puntos: 2,
  },
  {
    id: "f-2023-modelo-B3",
    año: 2023, convocatoria: "Modelo", opcion: "B",
    tipo: "Electricidad", numero: "B.3",
    enunciado: "Por un hilo rectilíneo infinito sobre el eje x circula una corriente de 3 A en sentido positivo. Una segunda corriente paralela, del mismo sentido, pasa por (0,−2,0) m.",
    apartados: [
      "Obtenga la intensidad de la segunda corriente sabiendo que el campo magnético generado por ambas es nulo en (0,−0,5,0) m.",
      "Calcule la fuerza sobre un electrón que pasa por (0,2,0) m con velocidad v = 5·10⁶î m s⁻¹. ¿Qué velocidad no nula anularía dicha fuerza?",
    ],
    datos: ["μ₀ = 4π·10⁻⁷ T m A⁻¹", "e = 1,6·10⁻¹⁹ C"],
    puntos: 2,
  },
  {
    id: "f-2023-modelo-B4",
    año: 2023, convocatoria: "Modelo", opcion: "B",
    tipo: "Optica", numero: "B.4",
    enunciado: "Un rayo de luz de frecuencia f = 2,94·10¹⁴ Hz incide desde el medio A hacia el medio B, reflejándose totalmente para un ángulo de incidencia igual o superior a 49,88°. Las velocidades de propagación cumplen vA + vB = 4,07·10⁸ m s⁻¹.",
    apartados: [
      "Los índices de refracción nA y nB.",
      "Las longitudes de onda del rayo incidente en los medios A y B.",
    ],
    datos: ["c = 3·10⁸ m s⁻¹"],
    puntos: 2,
  },
  {
    id: "f-2023-modelo-B5",
    año: 2023, convocatoria: "Modelo", opcion: "B",
    tipo: "RadioactividadModerna", numero: "B.5",
    enunciado: "En la figura se presenta la evolución temporal de la actividad de una muestra que contiene Yodo-131.\n\n![Gráfica de actividad del Yodo-131 frente al tiempo](/fisica-imgs/2023-modelo/pregunta-B5-actividad-yodo.png)",
    apartados: [
      "Halle el tiempo de semidesintegración del isótopo de ¹³¹I y su constante de desintegración radiactiva.",
      "Calcule el número de núcleos iniciales del isótopo y la masa de ¹³¹I que quedará en la muestra al cabo de 60 días.",
    ],
    datos: ["M₁₃₁I = 131 u", "Nₐ = 6,02·10²³ mol⁻¹"],
    puntos: 2,
  },

  // ══════════════════════════════════════════════
  // 2023-2024 Modelo Orientativo
  // ══════════════════════════════════════════════

  {
    id: "f-2024-modelo-A1",
    año: 2024, convocatoria: "Modelo", opcion: "A",
    tipo: "Gravitacion", numero: "A.1",
    enunciado: "La sonda Parker de la NASA describe una órbita elíptica alrededor del Sol con un afelio de 1,1·10⁸ km y un perihelio de 7,6·10⁶ km.",
    apartados: [
      "El semieje mayor de la elipse y el tiempo que tarda la sonda en dar una vuelta completa al Sol.",
      "La velocidad de la sonda en el afelio y en el perihelio de la órbita.",
    ],
    datos: ["G = 6,67·10⁻¹¹ N m² kg⁻²", "Mₛ = 1,99·10³⁰ kg"],
    puntos: 2,
  },
  {
    id: "f-2024-modelo-A2",
    año: 2024, convocatoria: "Modelo", opcion: "A",
    tipo: "Ondas", numero: "A.2",
    enunciado: "Un objeto de masa desconocida cuelga de un muelle de constante elástica 750 N m⁻¹, oscilando según el eje y en un MAS de frecuencia 3 Hz y energía 1 J. Posteriormente, se coloca una cuerda tensa en el objeto, por la que se propagan ondas transversales con velocidad 5 m s⁻¹ en el sentido positivo del eje x. En el instante inicial y en el origen, el desplazamiento es nulo y la velocidad es negativa.",
    apartados: [
      "Determine la amplitud del movimiento y el valor de la masa que cuelga del muelle.",
      "Determine la expresión matemática de la onda en la cuerda.",
    ],
    puntos: 2,
  },
  {
    id: "f-2024-modelo-A3",
    año: 2024, convocatoria: "Modelo", opcion: "A",
    tipo: "Electricidad", numero: "A.3",
    enunciado: "Dos cargas de 2 nC cada una están fijas en (0,0) m y (4,0) m del plano xy.",
    apartados: [
      "Determine el valor de una carga Q si para traerla desde el infinito hasta (2,2) m el campo hace un trabajo de 1,27·10⁻⁷ J.",
      "Indique el punto donde habría que colocar una carga de −10 nC para que la fuerza neta sobre Q fuese cero.",
    ],
    datos: ["K = 9·10⁹ N m² C⁻²"],
    puntos: 2,
  },
  {
    id: "f-2024-modelo-A4",
    año: 2024, convocatoria: "Modelo", opcion: "A",
    tipo: "Optica", numero: "A.4",
    enunciado: "Un espejo esférico cóncavo de 60 cm de radio de curvatura tiene situado a 80 cm frente a él, sobre su eje óptico, un objeto de 5 cm de altura.",
    apartados: [
      "Describa y dibuje las trayectorias de los rayos que salen del extremo superior del objeto, paralelo al eje óptico y pasando por el centro de curvatura.",
      "Calcule la posición y el tamaño de la imagen del objeto producida por el espejo.",
    ],
    puntos: 2,
  },
  {
    id: "f-2024-modelo-A5",
    año: 2024, convocatoria: "Modelo", opcion: "A",
    tipo: "RadioactividadModerna", numero: "A.5",
    enunciado: "El isótopo ¹⁹⁸Au reduce su actividad a la sexta parte en el transcurso de una semana.",
    apartados: [
      "Determine la constante de desintegración y el período de semidesintegración del ¹⁹⁸Au.",
      "Una muestra de ¹⁹⁸Au presenta al cabo de un día una actividad de 10 kBq. Calcule la actividad y el número de núcleos iniciales.",
    ],
    puntos: 2,
  },
  {
    id: "f-2024-modelo-B1",
    año: 2024, convocatoria: "Modelo", opcion: "B",
    tipo: "Gravitacion", numero: "B.1",
    enunciado: "Un astronauta aterriza sobre un planeta esférico de radio 1800 km. En su superficie deja caer un objeto desde 2 m de altura y tarda 1,5 s en llegar al suelo.",
    apartados: [
      "Determine la gravedad en la superficie del planeta y la masa de éste.",
      "El astronauta despega con velocidad de 3 km s⁻¹. Compruebe si escapará del planeta y, si es así, calcule la velocidad que tendrá muy alejado de él.",
    ],
    datos: ["G = 6,67·10⁻¹¹ N m² kg⁻²"],
    puntos: 2,
  },
  {
    id: "f-2024-modelo-B2",
    año: 2024, convocatoria: "Modelo", opcion: "B",
    tipo: "Ondas", numero: "B.2",
    enunciado: "Un foco sonoro puntual F₁ emite ondas esféricas: el nivel de intensidad percibido por un observador a 3 m es de 60 dB. Un segundo foco F₂, con el doble de potencia que F₁, emite simultáneamente, y el nivel percibido pasa a ser 70 dB.",
    apartados: [
      "Determine la intensidad de la onda a 3 m y la potencia del foco F₁.",
      "Halle la distancia a la que se encuentra el foco F₂ del observador.",
    ],
    datos: ["I₀ = 10⁻¹² W m⁻²"],
    puntos: 2,
  },
  {
    id: "f-2024-modelo-B3",
    año: 2024, convocatoria: "Modelo", opcion: "B",
    tipo: "Electricidad", numero: "B.3",
    enunciado: "Por un solenoide infinitamente largo de 250 espiras por metro, con eje en z, circula una corriente variable en el tiempo según la gráfica.\n\n![Gráfica de intensidad de corriente frente al tiempo](/fisica-imgs/2024-modelo/pregunta-B3-corriente-tiempo.png)",
    apartados: [
      "Determine el campo magnético en su interior para t = 3 s y t = 8 s.",
      "Si en el interior hay una espira cuadrada de lado a = 3 cm y resistencia 5 Ω, perpendicular al eje z, calcule la intensidad inducida en t = 3 s y en t = 8 s.",
    ],
    datos: ["μ₀ = 4π·10⁻⁷ T m A⁻¹"],
    puntos: 2,
  },
  {
    id: "f-2024-modelo-B4",
    año: 2024, convocatoria: "Modelo", opcion: "B",
    tipo: "Optica", numero: "B.4",
    enunciado: "Un rayo de luz incide desde el aire sobre la superficie lateral de un paralelepípedo a mitad de altura. La altura del paralelepípedo es H = 4 cm y su índice de refracción vale 1,34.\n\n![Rayo incidiendo sobre la superficie lateral de un paralelepípedo](/fisica-imgs/2024-modelo/pregunta-B4-paralelepipedo.png)",
    apartados: [
      "Si el rayo incide con ángulo de 60°, obtenga el tiempo que tarda en el interior del paralelepípedo desde que penetra hasta que alcanza la cara superior.",
      "¿Qué condición debe cumplir el ángulo de incidencia θ para que se produzca reflexión total en la cara superior?",
    ],
    datos: ["n_aire = 1", "c = 3·10⁸ m s⁻¹"],
    puntos: 2,
  },
  {
    id: "f-2024-modelo-B5",
    año: 2024, convocatoria: "Modelo", opcion: "B",
    tipo: "RadioactividadModerna", numero: "B.5",
    enunciado: "En la gráfica se representa el potencial de frenado para el cobre al iluminarlo con fotones de longitudes de onda entre 100 y 200 nm.\n\n![Gráfica del potencial de frenado del cobre frente a la longitud de onda](/fisica-imgs/2024-modelo/pregunta-B5-potencial-frenado.png)",
    apartados: [
      "Utilice los datos de la gráfica para determinar la constante de Planck y el trabajo de extracción del cobre.",
      "Un electrón emitido con energía cinética máxima con luz de 100 nm es acelerado hasta 0,8c. ¿Qué incremento de energía cinética experimenta?",
    ],
    datos: ["c = 3·10⁸ m s⁻¹", "e = 1,6·10⁻¹⁹ C", "mₑ = 9,1·10⁻³¹ kg"],
    puntos: 2,
  },

];

export interface PreguntaFisicaApp {
  id: string
  bloque: TipoFisica
  opcion: "A" | "B"
  enunciado: string
  puntuacion: number
  criterios: string
}

export interface ExamenFisica {
  id: number
  año: number
  tipo: "Ordinaria" | "Extraordinaria" | "Modelo"
  asignatura: "Física"
  comunidad: string
  preguntas: PreguntaFisicaApp[]
}

export const examenesFisica: ExamenFisica[] = Object.values(
  examenesF.reduce((acc, p) => {
    const key = `${p.año}-${p.convocatoria}`

    if (!acc[key]) {
      acc[key] = {
        id: Object.keys(acc).length + 100,
        año: p.año,
        tipo: p.convocatoria,
        asignatura: "Física",
        comunidad: "Madrid",
        preguntas: [],
      }
    }

    acc[key].preguntas.push({
      id: p.id,
      bloque: p.tipo,
      opcion: p.opcion,
      enunciado: enunciadoFisica(p),
      puntuacion: p.puntos,
      criterios: "Se valorará el planteamiento físico, el uso correcto de fórmulas, unidades, sustitución numérica, resultado final y justificación razonada.",
    })

    return acc
  }, {} as Record<string, ExamenFisica>)
).sort((a, b) => b.año - a.año || a.tipo.localeCompare(b.tipo))
