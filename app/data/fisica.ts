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
  convocatoria: "Ordinaria" | "Extraordinaria";
  opcion: "A" | "B";
  tipo: TipoFisica;
  numero: string;
  enunciado: string;
  apartados: string[];
  datos?: string[];
  puntos: number;
}

export const examenesF: PreguntaFisica[] = [
  // ══════════════════════════════════════════════
  // JUNIO 2025-2019 — Ordinaria oficial desde PDFs
  // ══════════════════════════════════════════════

  {
    id: "f-2025-jun-1",
    año: 2025, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Gravitacion", numero: "1",
    enunciado: "Eris es un planeta enano del sistema solar descubierto en enero de 2005 por un equipo\ndel observatorio del Monte Palomar dirigido por Michael E. Brown. Es el objeto transneptuniano más\nmasivo, el segundo más grande después de Plutón, y el cuerpo más grande del sistema solar que no ha\nsido visitado por una sonda espacial. Tiene un diámetro de 2330 km, ligeramente inferior al de Plutón, y\nsu densidad es de 2,5 g cm−3. La órbita de Eris es muy excéntrica; actualmente el planeta se encuentra\na su máxima distancia del Sol (afelio), a 1,45 · 1013 m, llegando a situarse a 5,24 · 1012 m del Sol durante\nsu perihelio.\n\na) (1 punto) Calcule la masa del planeta y el valor de la aceleración de la gravedad en su superficie.\n\nb) (1,5 puntos) Sabiendo que la energía mecánica de un objeto de masa m1 que orbita alrededor de\nun objeto de masa m2 con una órbita elíptica de semieje mayor a es\nEmec = − Gm1m2\n2a ,\ndonde G es la constante de la gravitación universal, halle la energía mecánica de Eris y calcule la\nvelocidad orbital que tendrá en el perihelio.\n\nDatos: Constante de gravitación universal, G = 6,67 · 10−11 N m2 kg−2; Masa del Sol, MSol = 1,99 · 1030 kg.",
    apartados: [],
    puntos: 2.5,
  },
  {
    id: "f-2025-jun-2A",
    año: 2025, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Electricidad", numero: "2.A",
    enunciado: "Un electrón de carga −e y un positrón de carga +e se encuentran inicialmente fijos en\nel plano xy en las posiciones (0, 6) nm y (0, -6) nm, respectivamente.\n\na) (1,25 puntos) Obtenga el campo eléctrico en el punto (8, 0) nm debido a ambas partículas.\n\nb) (1,25 puntos) Si al positrón se le imprime una velocidad de −1,5 · 105 m s−1⃗ j, permaneciendo fijo\nel electrón, determine la máxima distancia de alejamiento entre ambas partículas.\n\nDatos: Constante de la ley de Coulomb, K = 9 · 109 N m2 C−2; Valor absoluto de la carga del electrón y del positrón,\ne = 1,6 · 10−19 C; Masa del electrón y del positrón, me = 9,1 · 10−31 kg.",
    apartados: [],
    puntos: 2.5,
  },
  {
    id: "f-2025-jun-2B",
    año: 2025, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Electricidad", numero: "2.B",
    enunciado: "Una espira conductora circular de radio 20 cm se en-\ncuentra en el seno de un campo magnético homogéneo perpendicular\nal plano de la espira (ver figura). Si la espira tiene una resistencia de\n40 Ω, calcule la máxima intensidad de corriente que circulará por la\nespira en los siguientes casos:\n\na) (1,25 puntos) El módulo del campo magnético es constante de\nvalor B = 150 mT, y la espira gira en torno a uno de sus diáme-\ntros con una velocidad angular de 50 rad s−1.\n\nb) (1,25 puntos) La espira se encuentra fija, y el módulo del campo\nmagnético varía con el tiempo conforme a B = B0 sen(ωt), con B0 = 200 mT y ω = 75 rad s−1.",
    apartados: [],
    puntos: 2.5,
  },
  {
    id: "f-2025-jun-3A",
    año: 2025, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Ondas", numero: "3.A",
    enunciado: "Una ballena sumergida en el mar a una cierta profundidad emite un potente sonido\ngrave de 60 Hz y 25 m de longitud de onda. Un barco A, situado sobre su vertical, detecta dicho sonido\ncon su sónar 80 ms después de ser emitido, y poco tiempo después es detectado por otro barco B\nsituado a 300 m del barco A.\n\na) (1 punto) Halle la profundidad a la que se encuentra la ballena.\n\nb) (1,5 puntos) Si el barco A recibe el sonido con una intensidad de 3 μW m−2, calcule la potencia\ndel sonido emitido por la ballena y el nivel de intensidad sonora que detectará el barco B.\n\nDato: Intensidad umbral, I0 = 1 · 10−12 W m−2.",
    apartados: [],
    puntos: 2.5,
  },
  {
    id: "f-2025-jun-3B",
    año: 2025, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Optica", numero: "3.B",
    enunciado: "Considere la imagen formada por una lente delgada de distancia focal f ′ de un objeto\nsituado a una distancia s a la izquierda de la lente.\n\na) (1 punto) Demuestre que el aumento lateral M tiene la siguiente expresión en función de la dis-\ntancia focal f ′ y la posición del objeto s:\nM = f ′\nf ′ + s\n\nb) (0,5 puntos) Considerando la expresión obtenida en el apartado anterior, razone si una lente\ndivergente puede formar una imagen invertida.\n\nc) (1 punto) Dibuje el trazado de rayos a través del sistema óptico de la imagen formada por una\nlente divergente si el objeto se sitúa a una distancia dos veces su distancia focal.",
    apartados: [],
    puntos: 2.5,
  },
  {
    id: "f-2025-jun-4A",
    año: 2025, convocatoria: "Ordinaria", opcion: "A",
    tipo: "RadioactividadModerna", numero: "4.A",
    enunciado: "Las moléculas de ozono absorben luz ultravioleta (UV) de alta energía, lo que evita que\nllegue a la superficie de la Tierra demasiada radiación dañina para los seres vivos.\n\na) (1 punto) Halle la diferencia de energía, expresada en electrón-voltios, entre los niveles electróni-\ncos de la molécula de ozono que inducen la absorción de radiación de 260 nm.\n\nb) (1,5 puntos) Si el flujo de fotones de 260 nm que le llega a una persona con su cuerpo expuesto\nal sol es de 2,6 · 1014 fotones s−1, calcule la potencia que le incide debida a esos fotones UV y la\nenergía recibida en 30 minutos.\n\nDatos: Valor absoluto de la carga del electrón, e = 1,6 · 10−19 C; Constante de Planck, h = 6,63 · 10−34 J s; Velocidad de la\nluz en el vacío, c = 3 · 108 m s−1.",
    apartados: [],
    puntos: 2.5,
  },
  {
    id: "f-2025-jun-4B",
    año: 2025, convocatoria: "Ordinaria", opcion: "B",
    tipo: "RadioactividadModerna", numero: "4.B",
    enunciado: "El mineral de cuarzo (SiO2) sobre la superficie de la Tierra contiene impurezas de\naluminio, con una cantidad de 0,1 % de átomos de 26Al en relación a los átomos de silicio. Cuando el\nmineral se entierra debido a diversos procesos geológicos (sedimentación, glaciares, etc.) los átomos\nde 26Al se desintegran con un tiempo de semidesintegración de 0,72 millones de años.\n\na) (1,25 puntos) Calcule la actividad de una muestra de mineral de cuarzo, debida a la presencia de\nisótopos de 26Al, situada en superficie si contiene 8,3 · 1022 átomos de silicio.\n\nb) (1,25 puntos) Se recoge una muestra de cuarzo de unos sedimentos, obteniéndose una relación\nde 0,08 % de átomos de 26Al respecto a los átomos de silicio. Obtenga la edad correspondiente a\nla formación de dichos sedimentos.",
    apartados: [],
    puntos: 2.5,
  },
  {
    id: "f-2024-jun-A1",
    año: 2024, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Gravitacion", numero: "A.1",
    enunciado: "La distancia del satélite Halimede a Neptuno, planeta alrededor del cual orbita, varía\nentre 12 y 21 millones de km.\n\na) Calcule el trabajo realizado por la atracción gravitatoria de Neptuno sobre Halimede en el tránsito\ndel punto más próximo al más distante de la órbita.\n\nb) Sabiendo que la energía mecánica de Halimede vale −2,5 · 1020 J, determine la velocidad máxima\nque alcanza en su órbita.\n\nDatos: Constante de Gravitación Universal, G = 6,67 · 10−11 N m2 kg−2; Masa de Halimede, MH = 1,60 · 1015 kg; Masa de\nNeptuno, MN = 1,02 · 1026 kg.",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2024-jun-A2",
    año: 2024, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Ondas", numero: "A.2",
    enunciado: "Por una cuerda tensa dispuesta a lo largo del eje x se propaga, a una velocidad de\n200 m s−1 en el sentido positivo del eje, una onda armónica de 0,4 m de longitud de onda. En el\ninstante inicial y en el origen de coordenadas, la elongación es positiva y también lo es la velocidad de\noscilación, que equivale a la mitad de su valor máximo. Obtenga:\n\na) El número de onda y la frecuencia de la onda.\n\nb) La fase inicial de la onda.",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2024-jun-A3",
    año: 2024, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Electricidad", numero: "A.3",
    enunciado: "Un hilo conductor de longitud indefinida se extiende a lo largo del eje z. Otro hilo de\nlongitud indefinida paralelo al primero pasa por el punto (5, 0, 0) cm. Los dos hilos se repelen con una\nfuerza por unidad de longitud de 5 · 10−5 N m−1. El campo magnético total se anula a lo largo de la recta\nx = +10 cm en el plano xz.\n\na) Explique si las corrientes en los hilos son paralelas o antiparalelas y calcule su magnitud.\n\nb) Determine el módulo del campo magnético en el punto (−5, 0, 0) cm.\n\nDato: Permeabilidad magnética del vacío, μ0 = 4π · 10−7 T m A−1.",
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
    enunciado: "Una placa de cobalto se expone a luz de una determinada intensidad y de frecuencia\nigual a 1,2 veces la frecuencia umbral para el efecto fotoeléctrico en ese material. En estas condiciones,\nse registra un cierto potencial de frenado V1.\n\na) Si se duplica la frecuencia de la luz incidente, se registra un nuevo potencial de frenado V2, que\nes 6 V mayor que V1. Obtenga el trabajo de extracción para el cobalto y el valor de la frecuencia\numbral.\n\nb) Si se mantiene la frecuencia inicial y se duplica la intensidad de la luz incidente, ¿cómo se modi-\nficará el potencial de frenado?\n\nDatos: Valor absoluto de la carga del electrón, e = 1,6 · 10−19 C; Constante de Planck, h = 6,63 · 10−34 J s.",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2024-jun-B1",
    año: 2024, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Gravitacion", numero: "B.1",
    enunciado: "Un satélite de 200 kg de masa se mueve en una órbita cerrada alrededor de la Tierra.\nEn un determinado instante, es detectado a 630 km de altura, moviéndose a 9,92 km s−1 con velocidad\nperpendicular a la dirección radial.\n\na) Compare la velocidad del satélite con la correspondiente a una órbita circular de la altura dada y\ndel resultado anterior, razone si la órbita es circular o elíptica.\n\nb) Calcule los módulos del momento angular y de la aceleración del satélite en el instante señalado.\n\nDatos: Constante de Gravitación Universal, G = 6,67 · 10−11 N m2 kg−2; Masa de la Tierra, MT = 5,97 · 1024 kg; Radio de la\nTierra, RT = 6,37 · 106 m.",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2024-jun-B2",
    año: 2024, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Ondas", numero: "B.2",
    enunciado: "El campanario de una iglesia medieval, situado a 35 m de altura, consta de 4 campanas.\nCada una de ellas emite 10 mW de potencia sonora tras ser golpeada. Por otro lado, el límite de\ncontaminación acústica en ese municipio está establecido en 55 dB.\n\na) Determine el nivel de intensidad sonora que percibe una persona parada al pie de la torre del\ncampanario cuando se toca una sola campana.\n\nb) ¿Podrán tocar las cuatro campanas a la vez si no se quiere sobrepasar el límite de contaminación\nacústica y la población está situada a más de 100 metros de la iglesia?\n\nDato: Intensidad umbral, I0 = 1 · 10−12 W m−2.",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2024-jun-B3",
    año: 2024, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Electricidad", numero: "B.3",
    enunciado: "Dos partículas situadas en los puntos (-6, 0) mm y (6, 0) mm del plano xy poseen\ncargas iguales de +9 nC. Obtenga el potencial eléctrico y el campo eléctrico en:\n\na) El origen de coordenadas.\n\nb) El punto (0, 3) mm.\n\nDato: Constante de la ley de Coulomb, K = 9 · 109 N m2 C−2.",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2024-jun-B4",
    año: 2024, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Optica", numero: "B.4",
    enunciado: "El prisma de sección triangular mostrado en la figura está hecho\nde un material con índice de refracción np. Se halla inmerso en aire, con índice\nde refracción igual a 1.\n\na) Determine el índice de refracción np si se sabe que el ángulo límite para la\nreflexión total en el paso del prisma al aire vale 45, 58◦.\n\nb) Considere un rayo de luz que incide perpendicularmente sobre la superficie\ndel prisma desde el aire, en el punto P. Elabore un diagrama mostrando su\nrecorrido en el interior del prisma hasta que vuelve a emerger al aire, y\ncalcule el ángulo de refracción a la salida.",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2024-jun-B5",
    año: 2024, convocatoria: "Ordinaria", opcion: "B",
    tipo: "RadioactividadModerna", numero: "B.5",
    enunciado: "Dos muestras, cada una de un radioisótopo distinto (radioisótopo\n1 y radioisótopo 2) contienen en el momento de su preparación la misma masa\ndel radioisótopo correspondiente. Las medidas de actividad de las muestras 1 y\n2 para el instante inicial (t = 0) y al cabo de un día arrojan los siguientes valores:\nA1 (kBq) A2 (kBq)\nt = 0 10,00 11,70\nt = 1 d 8,90 10,77\n\na) Calcule el período de semidesintegración de cada radioisótopo.\n\nb) Si M1 y M2 denotan las respectivas masas atómicas de los radioisótopos, determine el cociente\nM2/M1.",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2023-jun-A1",
    año: 2023, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Gravitacion", numero: "A.1",
    enunciado: "Un satélite de la constelación OneWeb, de 150 kg de masa, se encuentra en una\nórbita circular alrededor de la Tierra a una altura de 1200 km sobre el nivel del mar. Determine:\n\na) \tLas energías potencial gravitatoria y cinética que tiene el satélite en su órbita.\n\nb) \tLa energía que fue necesario comunicar al satélite para ponerlo en órbita desde la superficie\nde la Tierra.\n\nDatos: Constante de Gravitación Universal, G = 6,67·10 -11 N m 2 kg -2 ; Masa de la Tierra, MT = 5,97·10 24 kg; Radio de la\nTierra, R T = 6,37·10 6 m.",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2023-jun-A2",
    año: 2023, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Ondas", numero: "A.2",
    enunciado: "A lo largo de una cuerda se propaga en el sentido +x una onda transversal. El periodo\nde oscilación y la elongación máxima de un punto cualquiera de la cuerda son, respectivamente,\n4·10-3 s y 3 mm. La distancia mínima entre dos puntos cualesquiera de la cuerda que oscilan en fase\nes de 0,25 metros. En el instante 2·10 -3 s la elongación de un punto situado a + 0,5 m del origen de\ncoordenadas es de -1,5 mm y su velocidad de oscilación en ese instante es positiva.\n\na) \tHalle la frecuencia angular y la velocidad de propagación de la onda.\n\nb) \tObtenga la expresión matemática que describe a la onda.",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2023-jun-A3",
    año: 2023, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Electricidad", numero: "A.3",
    enunciado: "Tres cargas -q, -q y +2q se encuentran situadas en los\npuntos del plano (-a, a), (a, a) y (0, 0), respectivamente, tal y como se\ndescribe en la figura. Determine, en función de la constante de\nCoulomb, K, el valor de la carga, q, y la distancia, a:\n\na) \tLa expresión de la fuerza electrostática que se ejerce sobre la\ncarga situada en la posición (a, a) y la expresión del trabajo\nque habrá realizado esa fuerza electrostática para traer la\ncarga -q desde el infinito a la posición (a, a).\n\nb) \tEl flujo del campo eléctrico a través de las superficies cerradas\nS1 y S2.\n\nDato: Permitividad eléctrica del vacío;\nεo = 1/4πK.",
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
    enunciado: "Se sospecha que un acuífero recibe aportes intermitentes de radón ( 222\nRn). Para\ncomprobarlo, se toman semanalmente medidas de la actividad radiactiva de muestras de agua. Una\nde esas medidas arroja un valor de 14 Bq para una muestra de un litro. Determine el valor de la medida\nde la siguiente semana, para otra muestra de un litro, en cada una de las siguientes condiciones:\n\na) \tSi no hubiese ningún aporte de 222\nRn en el transcurso de esa semana.\n\nb) \tSi el cuarto día de esa semana la concentración de 222\nRn en el acuífero experimentase un\naumento súbito de 2∙10-16 g por cada litro de agua.\n\nDatos: Período de semidesintegración del 222\nRn, T1/2 = 3,8 días; Masa atómica del 222 Rn, M222-Rn = 222 u; Número de\nAvogadro, NA = 6,02\n⋅10 23 mol-1.",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2023-jun-B1",
    año: 2023, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Gravitacion", numero: "B.1",
    enunciado: "En la película Space Cowboys un\namenazador satélite militar orbita alrededor de la\nTierra a una altura de 1600 km sobre la superficie\nterrestre.\n\na) \tCalcule la velocidad orbital del satélite y\nel tiempo que tarda en dar una vuelta\ncompleta \talrededor \tde \tla \tTierra.\nDesprecie en este apartado la interacción\ngravitatoria de la Luna.\n\nb) \tPara evitar que el satélite caiga a la Tierra se decide impulsarlo hacia la Luna. Determine la\ndistancia x al centro de la Tierra, tal y como se muestra en la figura, a la que tendrá que llegar\nel satélite, para que el efecto del campo gravitatorio lunar sea superior al del campo\ngravitatorio terrestre.\n\nDatos: Constante de Gravitación Universal, G = 6,67·10 -11 N m 2 kg -2 ; Masa de la Tierra, MT = 5,97·10 24 kg; Radio de la\nTierra; R T = 6,37·10 3 km; Masa de la Luna, ML = 7,35·10 22 kg; Distancia de la Tierra a la Luna, d = 3,84·10 5 km.",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2023-jun-B2",
    año: 2023, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Ondas", numero: "B.2",
    enunciado: "Un observador que se encuentra a 3 m de una fuente puntual sonora que emite en\ntodas direcciones mide un nivel de intensidad sonora de 53 dB. Halle:\n\na) \tLa intensidad sonora recibida por el observador y la potencia con la que emite la fuente\npuntual.\n\nb) \tLa distancia a la que debe situarse el observador para que el nivel de intensidad sonora\npercibido se reduzca a una cuarta parte.\n\nDato: Intensidad umbral,\nΙ 0 = 10 -12 W m -2 .",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2023-jun-B3",
    año: 2023, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Electricidad", numero: "B.3",
    enunciado: "Un ion de He+ se sitúa inicialmente en reposo dentro de una región del espacio donde\nexiste un campo eléctrico homogéneo de 10 3 V m -1 que está dirigido a lo largo del eje +x.\n\na) \tCalcule la aceleración que experimenta el ion en el instante inicial.\n\nb) \tDetermine la fuerza total sobre el ion si a los 20 μs de ser depositado se aplica un campo\nmagnético homogéneo de 0,6 T a lo largo del eje +y.\n\nDatos: Masa atómica del ion de He+\n, MHe = 4 u; Número de Avogadro, NA = 6,02\n⋅10 23 mol-1; Valor absoluto de la carga\ndel electrón, e = 1,6·10 -19 C.",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2023-jun-B4",
    año: 2023, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Optica", numero: "B.4",
    enunciado: "Un rayo de luz incide sobre la cara izquierda del\nprisma de la figura, el cual está construido con un material cuyo\níndice de refracción vale 1,66.\n\na) \tDetermine los ángulos α y\nβ de la trayectoria que sigue\nel rayo de luz que entra en el prisma desde el aire con\nun ángulo de incidencia de 50º.\n\nb) \tCalcule el ángulo límite con el que deberá incidir desde\nel aire el rayo de luz para que este no emerja del prisma.\n\nDato: Índice de refracción del aire, n = 1.",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2023-jun-B5",
    año: 2023, convocatoria: "Ordinaria", opcion: "B",
    tipo: "RadioactividadModerna", numero: "B.5",
    enunciado: "Para estudiar el efecto fotoeléctrico se\nregistra la intensidad de corriente entre un cierto metal\nemisor \tde \tfotoelectrones \ty \tuna \tplaca \ten \tfunción \tdel\npotencial \teléctrico \taplicado \tentre \tambos, \tmientras \tse\nilumina el metal fotoemisor con un cierto haz de luz. La\ngráfica adjunta muestra los datos para luz de 379 nm y\n544 nm, donde se observan potenciales de frenado de 2,5 V\ny de 1,5 V, respectivamente.\n\na) A partir de los potenciales de frenado, obtenga el\nvalor de la constante de Planck.\n\nb) Indique cuáles serían los valores del potencial de\nfrenado y de la intensidad de corriente máxima para\nel haz de luz de 379 nm si se disminuyese a la mitad\nla intensidad del haz.\n\nDatos: Velocidad de la luz en el vacío, c = 3·10 8 m s-1; Valor absoluto de la carga del electrón, e = 1,6·10 -19 C.\nTierra\nLuna\nd\nx\n60o\nα\nβ\n60o\n60o",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2022-jun-A1",
    año: 2022, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Gravitacion", numero: "A.1",
    enunciado: "Una partícula de masa 20 kg permanece fija en el origen de coordenadas.\n\na) \tCalcule el campo gravitatorio generado por la masa en el punto (8, 6) m y la fuerza que\nexperimentará una segunda partícula de masa 3 kg situada en dicho punto.\n\nb) \tCon el objetivo de alejar la segunda partícula, se le transmite una velocidad de 1,2·10 -5 m s -1\nen la dirección de la recta que une ambas partículas. Halle el punto más alejado del origen que\nalcanzará dicha partícula.\n\nDatos: Constante de Gravitación Universal, G = 6,67·10-11 N m2 kg-2.",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2022-jun-A2",
    año: 2022, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Ondas", numero: "A.2",
    enunciado: "Por una cuerda dispuesta a lo largo del eje x viaja una onda armónica que desplaza\nlos elementos de la cuerda en la dirección del eje y. Se sabe que los elementos A y B, respectivamente\nubicados en xA = 0 m y xB = 2 m, oscilan en fase y cortan al eje x cada 4 s. Teniendo en cuenta que no\nhay entre A y B ningún otro elemento que oscile en fase con ellos:\n\na) \tCalcule el valor de la velocidad de propagación.\n\nb) \tEscriba la expresión matemática de la onda, si esta viaja en el sentido negativo del eje x y en\nel instante inicial los elementos A y B presentan desplazamiento igual a +10 cm y velocidad\nnula.",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2022-jun-A3",
    año: 2022, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Electricidad", numero: "A.3",
    enunciado: "La figura representa una varilla metálica de 20 cm de longitud, cuyos extremos deslizan\nsin rozamiento sobre unos raíles horizontales, paralelos al eje x, metálicos y de resistencia\ndespreciable. La varilla tiene resistencia despreciable y su\nvelocidad es 1\n2 \tm s\tv \ti −\n= \t . Los raíles están conectados en x = 0\npor una resistencia de valor R = 0,5 Ω . En la región hay un\ncampo magnético uniforme \t0, 4 \tT\tB \tk\t= − \t . Calcule:\n\na) \tLa intensidad de la corriente en el circuito formado por la\nvarilla, la resistencia y los tramos de raíl entre ellas.\n\nb) \tLa fuerza F\n que el campo magnético ejerce sobre la\nvarilla.",
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
    enunciado: "Una muestra contiene inicialmente una masa de 30 mg de 210\nPo. Sabiendo que su\nperíodo de semidesintegración es de 138,38 días, determine:\n\na) \tLa vida media del isótopo y la actividad inicial de la muestra.\n\nb) \tEl tiempo que debe transcurrir para que el contenido de 210 Po de la muestra se reduzca a\n5 mg.\n\nDatos: Masa atómica del 210Po, MPo = 210 u; Número de Avogadro, NA = 6,02\n⋅1023 mol-1.",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2022-jun-B1",
    año: 2022, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Gravitacion", numero: "B.1",
    enunciado: "Marte posee la décima parte de la masa de la Tierra y la mitad de su diámetro.\n\na) \tEncuentre la relación entre las velocidades de escape de Marte y de la Tierra desde sus\nrespectivas superficies.\n\nb) \tSuponga que un objeto se lanza verticalmente desde la superficie terrestre, con una velocidad\nigual a la velocidad de escape de Marte. Si se desprecia el rozamiento, ¿qué altura máxima\nalcanzaría el objeto?\n\nDato: Radio de la Tierra, RT = 6,37·106 m.",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2022-jun-B2",
    año: 2022, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Ondas", numero: "B.2",
    enunciado: "Un foco sonoro de potencia P se coloca a una\naltura h sobre el suelo, como ilustra la figura. El nivel de\nintensidad sonora vale 60 dB en el punto A, a 100 m de\ndistancia del foco, y alcanza 80 dB en el punto B, en el suelo\nen la vertical del foco.\n\na) \tCalcule P y h.\n\nb) \t¿Cuál sería el nivel de intensidad en el punto B si se\nagregase sobre él otro foco de igual potencia a una\naltura de h/2?\n\nDato: Intensidad umbral de audición, I0 = 10-12 W m-2.",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2022-jun-B3",
    año: 2022, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Electricidad", numero: "B.3",
    enunciado: "Una carga puntual positiva está situada en el punto (3, 4) m del plano xy. En otro\npunto del plano se coloca una segunda carga puntual, también positiva y de magnitud el cuádruple\nde la primera, haciendo que el campo se anule en el origen de coordenadas.\n\na) \tDetermine la posición de la segunda carga.\n\nb) \tSi el potencial en el origen de coordenadas vale 1,08∙104 V, encuentre el valor de las cargas.\n\nDato: Constante de la ley de Coulomb, K = 9·109 N m2 C-2.",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2022-jun-B4",
    año: 2022, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Optica", numero: "B.4",
    enunciado: "Una lámina de vidrio se halla sobre un líquido\nde índice de refracción desconocido. La longitud de onda de la\nluz en el vidrio se reduce a un 70 % de su valor en el aire. Si se\nemite luz desde el líquido, los rayos con ángulos de incidencia\nsuperiores a 30º en la cara inferior de la lámina no se refractan\nal aire por su cara superior. Calcule:\n\na) \tEl índice de refracción del vidrio.\n\nb) \tEl índice de refracción del líquido.\n\nDato: Índice de refracción del aire, naire = 1.",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2022-jun-B5",
    año: 2022, convocatoria: "Ordinaria", opcion: "B",
    tipo: "RadioactividadModerna", numero: "B.5",
    enunciado: "Un electrón relativista ha llegado a adquirir una energía cinética equivalente a la energía\nde un fotón de 5∙10-12 m de longitud de onda en el vacío. Calcule:\n\na) \tLa energía cinética del electrón, en eV.\n\nb) \tLa velocidad del electrón.\n\nDatos: Valor absoluto de la carga del electrón, e = 1,6·10-19 C; Constante de Planck, h = 6,63·10-34 J s;\nVelocidad de la luz en el vacío, c = 3·108 m s-1; Masa del electrón en reposo, me = 9,1·10-31 kg.",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2021-jun-A1",
    año: 2021, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Gravitacion", numero: "A.1",
    enunciado: "Una masa puntual de 50 g se encuentra situada en la posición (8, 0) m del plano xy.\nCalcule:\n\na) \tEl potencial gravitatorio y el campo gravitatorio en el punto (0, 6) m del plano debido a\ndicha masa.\n\nb) \tEl trabajo realizado por el campo al trasladar un objeto puntual de 20 g desde el punto\n(0, 6) m hasta el origen de coordenadas.\n\nDato: Constante de Gravitación Universal, G = 6,67·10 -11 N m 2 kg -2 .",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2021-jun-A2",
    año: 2021, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Ondas", numero: "A.2",
    enunciado: "Al explotar, un cohete de fuegos artificiales genera una onda sonora esférica con\nuna potencia sonora de 20 mW. Un espectador oye la explosión 1,5 s después de verlo explotar.\nCalcule:\n\na) \tLa distancia a la que está situado el espectador respecto al cohete en el momento de la\nexplosión, así como la intensidad del sonido en la posición del espectador.\n\nb) \tEl nivel de intensidad sonora percibida si explotan 10 cohetes simultáneamente, y el\nespectador los oye todos al unísono 1,5 s después de explotar.\n\nDatos: Velocidad del sonido en el aire, v s = 340 m s-1; Valor umbral de la intensidad acústica, I 0 = 10 -12 W m -2.",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2021-jun-A3",
    año: 2021, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Electricidad", numero: "A.3",
    enunciado: "Una carga puntual de 2 μC se encuentra situada en el origen de coordenadas.\n\na) \tAplicando el teorema de Gauss, obtenga el flujo del campo eléctrico a través de una\nsuperficie esférica de 10 mm de diámetro centrada en el origen.\n\nb) \tUtilizando el valor del flujo obtenido en el apartado anterior, calcule el módulo del campo\neléctrico en puntos situados a 5 mm de la carga.\n\nDato: Permitividad eléctrica del vacío,\nε0 = 8,85·10 -12 C2 N -1 m -2 .",
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
    enunciado: "Un material posee un sistema de tres niveles energéticos electrónicos (nivel\nfundamental, primer nivel, y segundo nivel). Para que un electrón pase desde el nivel fundamental al\nsegundo nivel, el material absorbe radiación de 450 nm; tras lo cual el material emite radiación de\n600 nm debido al decaimiento del primer nivel hasta el fundamental.\n\na) \tDetermine las diferencias de energía entre el primer nivel y el nivel fundamental, y entre el\nsegundo nivel y el nivel fundamental, expresadas en electrón-voltios.\n\nb) \tCalcule la energía por unidad de tiempo que produce la emisión si el material emite\n4⋅1015 fotones s-1\n.\n\nDatos: Valor absoluto de la carga del electrón, e = 1,6·10 -19 C; Constante de Planck, h = 6,63·10 -34 J s; Velocidad de la\nluz en el vacío, c = 3·10 8 m s-1\n.",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2021-jun-B1",
    año: 2021, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Gravitacion", numero: "B.1",
    enunciado: "Una sonda espacial de 3500 kg se encuentra en órbita circular alrededor de\nSaturno, realizando una revolución cada 36 horas. Calcule:\n\na) \tLa velocidad orbital y la energía mecánica que posee la sonda espacial.\n\nb) \tLa energía mínima necesaria que habría que suministrarle para que abandone el campo\ngravitatorio del planeta.\n\nDatos: Constante de Gravitación Universal, G = 6,67·10 -11 N m 2 kg -2 ; Masa de Saturno, Ms = 5,68·10 26 kg.",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2021-jun-B2",
    año: 2021, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Ondas", numero: "B.2",
    enunciado: "El valor del campo eléctrico asociado a una onda electromagnética que se propaga\nen un medio material en la dirección del eje x viene expresado por:\n15 \t7\n( , ) \t4 cos(3, 43 10 \t1,52 10 \t)\tE x t \tt \tx\t= \t⋅ \t− \t⋅ N C-1\n,\ndonde todas las magnitudes están expresadas en unidades del SI. Calcule:\n\na) \tLa frecuencia y la longitud de onda asociadas a la onda electromagnética.\n\nb) \tLa velocidad de propagación de la onda y el índice de refracción del medio por el cual se\npropaga.\n\nDato: Velocidad de la luz en el vacío, c = 3·10 8 m s-1 .",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2021-jun-B3",
    año: 2021, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Electricidad", numero: "B.3",
    enunciado: "Un hilo conductor rectilíneo indefinido situado a lo largo del eje x transporta una\ncorriente de 25 A en sentido positivo del eje. Obtenga:\n\na) \tEl campo magnético creado por el hilo en el punto (0, 5, 0) cm.\n\nb) \tLa fuerza magnética que experimenta un electrón cuando está en la posición (0, 5, 0) cm y\ntiene una velocidad de 1000 m s -1 en sentido positivo del eje y.\n\nDatos: Valor absoluto de la carga del electrón, e = 1,6·10 -19 C; Permeabilidad magnética del vacío,\nμ0 = 4\nπ·10 -7 T m A-1.",
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
    enunciado: "Un isótopo de una muestra radiactiva posee un periodo de semidesintegración de\n5730 años.\n\na) \tObtenga la vida media y la constante radiactiva del isótopo.\n\nb) \tSi una muestra tiene 5⋅1020 átomos radiactivos en el momento inicial, calcule la actividad\ninicial y el tiempo que debe trascurrir para que dicha actividad se reduzca a la décima\nparte.",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2020-jun-A1",
    año: 2020, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Gravitacion", numero: "A.1",
    enunciado: "Un satélite sigue una órbita circular sincrónica (es decir, del mismo período que el de\nrotación del planeta) de radio 1,59 ·10 5 km en torno a un planeta de masa 1,90·10 27 kg. Calcule:\n\na) \tLa velocidad del satélite en la órbita.\n\nb) \tEl periodo de rotación del planeta sobre su eje.\n\nDato: Constante de Gravitación Universal, G = 6,67·10 -11 N m2 kg -2 .",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2020-jun-A2",
    año: 2020, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Ondas", numero: "A.2",
    enunciado: "Una onda armónica unidimensional, que se propaga en un medio con una velocidad\nde 400 m s -1, está descrita por la siguiente expresión matemática:\n( \t)\t0\tsen\t( , ) \t200 \tcm\t3\nπ \tφ\t= \t− \t+\tkx \tt\ty x t\ndonde x y t están en m y s, respectivamente. Sabiendo que y(0, 0) = 1,5 cm y que la velocidad de\noscilación en t = 0 y x = 0 es positiva, halle:\n\na) El número de onda k y la fase inicial\nφ0.\n\nb) La aceleración máxima de oscilación de un punto genérico del eje x.",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2020-jun-A3",
    año: 2020, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Electricidad", numero: "A.3",
    enunciado: "Una barra conductora, de 30 cm de longitud y paralela al eje y, se mueve en el plano\nxy con una velocidad en el sentido positivo del eje x. La barra se mueve sobre unos rieles conductores\nparalelos en forma de U (ver figura). Perpendicular al plano,\nhay un campo magnético uniforme 3\n10 \tT\tk−  . Halle la fuerza\nelectromotriz inducida en la barra en función del tiempo en los\nsiguientes casos:\n\na) La velocidad de la barra es constante e igual a\n2 \t-1\n10 \tm s\ti\n .\n\nb) La barra parte del reposo y su aceleración es\nconstante e igual a -2\n5 \tm s\ti\n .",
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
    enunciado: "Se tienen dos fuentes radiactivas cuya actividad a día de hoy es la misma. Se sabe\nque dentro de 10 años la actividad de la primera fuente será el doble que la de la segunda. Determine:\n\na) \tLa diferencia,\nλ2 –\nλ1, que existe entre las constantes de desintegración de ambas fuentes.\n\nb) \tLa relación entre las actividades de dichas fuentes dentro de 20 años.",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2020-jun-B1",
    año: 2020, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Gravitacion", numero: "B.1",
    enunciado: "Se tiene un planeta de masa 1,95·10 25 kg y radio 5500 km. Determine:\n\na) \tEl módulo de la aceleración de la gravedad en la superficie de dicho planeta.\n\nb) \tLa velocidad de escape desde la superficie del planeta.\n\nDato: Constante de Gravitación Universal, G = 6,67·10 -11 N m2 kg -2 .",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2020-jun-B2",
    año: 2020, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Ondas", numero: "B.2",
    enunciado: "A una distancia de 10 m, el nivel de intensidad sonora producida por un foco puntual\nes de 20 dB. Halle:\n\na) \tLa potencia del foco.\n\nb) \tEl nivel de intensidad sonora a 2 m del foco.\n\nDato: Intensidad umbral de audición, I 0 = 10 -12 W m-2 .",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2020-jun-B3",
    año: 2020, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Electricidad", numero: "B.3",
    enunciado: "Se tienen cuatro cargas cuyo valor absoluto es |q| = 1·10 -6 C, situadas en los vértices\nde un cuadrado de lado a = 30 cm, que está en el plano xy. Dos de ellas son positivas y están en los\npuntos (0, 0) y (a, a). Las otras dos son negativas y están situadas en los puntos (0, a) y (a, 0). Calcule:\n\na) \tLa fuerza que se ejerce sobre la carga +q situada en el punto (a, a) debida a las otras tres.\n\nb) \tLa energía potencial de la carga situada en el origen de coordenadas debida a las otras tres.\n\nDato: Constante de la ley de Coulomb, K = 9\n·10 9 N m2 C-2.",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2020-jun-B4",
    año: 2020, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Optica", numero: "B.4",
    enunciado: "Una placa de vidrio de 4 cm de espesor\ny de índice de refracción 1,5 se encuentra sumergida\nentre dos aceites de índices de refracción 1,4 y 1,2\nrespectivamente. Proveniente del aceite de índice 1,4\nincide sobre el vidrio un haz de luz con un ángulo de\nincidencia de 30º. Calcule:\n\na) \tLa distancia, d, entre el rayo reflejado por la cara\nsuperior del vidrio y el refractado después de\nreflejarse en la cara inferior del vidrio.\n\nb) \tEl ángulo de incidencia mínimo en la cara\nsuperior \tdel \tvidrio \tnecesario \tpara \tque \tse\nproduzca el fenómeno de reflexión total en la cara inferior de la placa de vidrio.",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2020-jun-B5",
    año: 2020, convocatoria: "Ordinaria", opcion: "B",
    tipo: "RadioactividadModerna", numero: "B.5",
    enunciado: "Se hace incidir un haz de\nfotones de frecuencia variable sobre una\nlámina de material metálico, de manera que\nse emiten electrones cuya energía cinética\nmáxima se mide, obteniendo la gráfica que\nse adjunta. Determine:\n\na) \tEl trabajo de extracción del metal\nen eV.\n\nb) \tLa longitud de onda de de Broglie\nasociada a los electrones que se\nemiten, \tcon \tmáxima \tenergía\ncinética, cuando la frecuencia de\nlos \tfotones \tincidentes \tes \tde\n10\n·10 14 Hz.\n\nDatos: Valor absoluto de la carga del electrón, e = 1,6·10 -19 C; Masa del electrón, m e = 9,1·10 -31 kg; Constante de\nPlanck, h = 6,63·10 -34 J s.",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2019-jun-A1",
    año: 2019, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Gravitacion", numero: "A.1",
    enunciado: "Una masa puntual m1 = 5 kg está situada en el punto (4, 3) m.\n\na) \tDetermine la intensidad del campo gravitatorio creado por la masa m1 en el origen de\ncoordenadas y el trabajo realizado al trasladar otra masa m2 = 0,5 kg desde el infinito hasta\nel origen de coordenadas.\n\nb) \tSituadas las masas m1 y m2 en las posiciones anteriores, ¿a qué distancia del origen de\ncoordenadas, el campo gravitatorio resultante es nulo?\n\nDato: Constante de Gravitación Universal, G = 6,67ꞏ10 -11 N m2 kg -2 .",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2019-jun-A2",
    año: 2019, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Ondas", numero: "A.2",
    enunciado: "Un detector situado a cierta distancia de una fuente sonora puntual mide un nivel de\nintensidad sonora de 80 dB. Si se duplica la distancia entre la fuente y el detector, determine a esta\ndistancia:\n\na) \tLa intensidad de la onda sonora.\n\nb) \tEl nivel de intensidad sonora.\n\nDato: Intensidad umbral de audición, I 0 = 10 -12 W m-2 .",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2019-jun-A3",
    año: 2019, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Electricidad", numero: "A.3",
    enunciado: "Se tienen dos hilos conductores rectilíneos, indefinidos y paralelos al eje z que cortan\nal plano xy en los puntos O (0, 0, 0) y A (2, 2, 0) cm. Por cada cable circula una corriente de 5 A en\nel sentido positivo del eje z. Calcule:\n\na) \tEl vector campo magnético en el punto P (0, 2, 0) cm y en el punto Q (1, 1, 0) cm.\n\nb) \tLa fuerza magnética por unidad de longitud que actúa sobre el conductor que pasa por el\npunto A (2, 2, 0) cm debida a la presencia del otro, indicando su dirección y sentido.\n\nDato: Permeabilidad magnética del vacío, μ0 = 4πꞏ10 -7 N A -2.",
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
    enunciado: "a) \tLa longitud de onda umbral de un metal para el efecto fotoeléctrico es 579 nm. Calcule el\ntrabajo de extracción del metal, y la energía cinética máxima de los electrones emitidos\nexpresada en eV si el metal se ilumina con una radiación de 304 nm de longitud de onda.\n\nb) \tSi se hace incidir sobre otro metal la misma radiación del apartado anterior observamos\nque el potencial de frenado es de 4,08 V. Calcule el trabajo de extracción de este nuevo\nmetal.\n\nDatos: Constante de Planck, h = 6,63ꞏ10 -34 J s; Valor absoluto de la carga del electrón, e = 1,6ꞏ10 -19 C; Velocidad de la\nluz en el vacío, c = 3ꞏ10 8 m s-1.\n\nOPCIÓN B",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2019-jun-B1",
    año: 2019, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Gravitacion", numero: "B.1",
    enunciado: "El Amazonas 5 es un satélite geoestacionario de comunicaciones de 5900 kg puesto en\nórbita en septiembre de 2017. Determine:\n\na) \tLa altura sobre el ecuador terrestre del satélite y su velocidad orbital.\n\nb) \tLa fuerza centrípeta necesaria para que describa la órbita y la energía total del satélite en\ndicha órbita.\n\nDatos: Constante de Gravitación Universal, G = 6,67ꞏ10 -11 N m2 kg -2 ; Masa de la Tierra, MT = 5,97∙10 24 kg; Radio de la\nTierra, R T = 6,37ꞏ10 6 m.",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2019-jun-B2",
    año: 2019, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Ondas", numero: "B.2",
    enunciado: "Una onda armónica tranversal de frecuencia f = 0,25 Hz y longitud de onda\n = 2 m se\npropaga en el sentido positivo del eje x. Sabiendo que el punto situado en x = 0,5 m tiene, en el\ninstante t = 2 s, elongación nula y velocidad de oscilación negativa, y en el instante t = 3 s, elongación\ny = - 0,2 m, determine:\n\na) \tLa expresión matemática que representa dicha onda.\n\nb) \tLa velocidad máxima de oscilación de cualquier punto alcanzado por la onda y la diferencia\nde fase, en un mismo instante, entre dos puntos situados en el eje x que distan entre si\n0,75 m.",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2019-jun-B3",
    año: 2019, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Electricidad", numero: "B.3",
    enunciado: "Dos cargas puntuales, con valores q 1 = -4 nC y q 2 = +2 nC respectivamente, están\nsituadas en los puntos P1 (-5, 0), y P2 (3, 0) (coordenadas en centímetros).\nDetermine:\n\na) \tEl campo eléctrico y el potencial eléctrico en el origen de coordenadas.\n\nb) \tEn qué punto situado en el segmento que une las dos cargas el potencial eléctrico se anula\n\nDato: Constante de la Ley de Coulomb, K = 9ꞏ10 9 N m2 C-2 .",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2019-jun-B4",
    año: 2019, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Optica", numero: "B.4",
    enunciado: "Un rayo de luz se propaga según muestra el esquema de la\nfigura. Primero incide con un ángulo i 1 desde un medio de índice de\nrefracción n1 = 1,6 sobre un medio de índice de refracción n 2 = 1,3 de\nmanera que el rayo reflejado y el rayo refractado forman entre sí un ángulo\nde 90º. El rayo refractado incide con el ángulo crítico i c sobre otro medio\nde índice de refracción n3 desconocido. Determine:\n\na) \tLos ángulos de incidencia i 1 e ic.\n\nb) \tEl índice de refracción n 3.",
    apartados: [],
    puntos: 2,
  },
  {
    id: "f-2019-jun-B5",
    año: 2019, convocatoria: "Ordinaria", opcion: "B",
    tipo: "RadioactividadModerna", numero: "B.5",
    enunciado: "Se dispone de una muestra de 10 mg de 238 Pu cuyo período de semidesintegración es\nde 87,7 años y su masa atómica es 238 u. Calcule:\n\na) \tEl tiempo necesario para que la muestra se reduzca a 2 mg.\n\nb) \tLos valores de la actividad inicial y final.\n\nDato: Número de Avogadro, N A = 6,02ꞏ10 23 mol-1 .",
    apartados: [],
    puntos: 2,
  },

  // ══════════════════════════════════════════════
  // 2018 Ordinaria escaneada + Julio Extraordinaria preservadas
  // ══════════════════════════════════════════════

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
      enunciado: "Dos cristales de grosor 10 cm e índices de refracción n₁ = 1,40 y n₂ = 1,50 están separados por una capa de aire de espesor desconocido e. Un rayo incide por el punto A con ángulo de 30° y sale por el punto B. La distancia horizontal entre A y B es d = 9,2 cm.",
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
      enunciado: "En la figura se representa la elongación de una onda transversal en t = 0 en función de la posición x. La onda se propaga en el sentido negativo del eje x. El tiempo que tarda el punto en x = 0 desde que sale de su posición inicial hasta que vuelve a la misma es de 0,5 s. La amplitud es 3 cm y la longitud de onda 1,5 m.",
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
      enunciado: "Por una cuerda dispuesta a lo largo del eje x viaja una onda armónica. Los elementos A (xA = 0 m) y B (xB = 2 m) oscilan en fase y cortan al eje x cada 4 s. No hay entre A y B ningún otro elemento que oscile en fase con ellos.",
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
      enunciado: "Un observador está situado al borde de un estanque de profundidad H = 2 m. Su visual está a H' = 1,6 m sobre la superficie del agua. En el fondo hay un foco puntual de luz. El observador lo ve cuando mira hacia el punto A de la superficie a d = 1,2 m del borde.",
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
      enunciado: "En su aproximación al planeta Fomalhaut II, el astronauta Rocannon avista Fomalhautillo según un ángulo α = 53,13° con respecto de la radial hacia el planeta. La fuerza total es F = (9,5 î − 66,4 ĵ) N sobre una nave de masa conjunta 8000 kg.",
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
      enunciado:
        `${p.numero}. ${p.enunciado}\n\n` +
        p.apartados.map((apartado, i) => `${String.fromCharCode(97 + i)}) ${apartado}`).join("\n\n") +
        (p.datos?.length ? `\n\nDatos: ${p.datos.join("; ")}` : ""),
      puntuacion: p.puntos,
      criterios: "Se valorará el planteamiento físico, el uso correcto de fórmulas, unidades, sustitución numérica, resultado final y justificación razonada.",
    })

    return acc
  }, {} as Record<string, ExamenFisica>)
).sort((a, b) => b.año - a.año || a.tipo.localeCompare(b.tipo))
