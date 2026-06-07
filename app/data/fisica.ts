// ═══════════════════════════════════════════════════════════════════════
// FÍSICA — Exámenes EBAU Madrid 2020-2024
// Añadir al final de app/data/examenes.ts
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
  // JUNIO 2024 — Ordinaria
  // ══════════════════════════════════════════════

  {
    id: "f-2024-jun-A1",
    año: 2024, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Gravitacion", numero: "A.1",
    enunciado: "La distancia del satélite Halimede a Neptuno varía entre 12 y 21 millones de km.",
    apartados: [
      "Calcule el trabajo realizado por la atracción gravitatoria de Neptuno sobre Halimede en el tránsito del punto más próximo al más distante de la órbita.",
      "Sabiendo que la energía mecánica de Halimede vale −2,5·10²⁰ J, determine la velocidad máxima que alcanza en su órbita.",
    ],
    datos: ["G = 6,67·10⁻¹¹ N m² kg⁻²", "MH = 1,60·10¹⁵ kg", "MN = 1,02·10²⁶ kg"],
    puntos: 2,
  },
  {
    id: "f-2024-jun-A2",
    año: 2024, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Ondas", numero: "A.2",
    enunciado: "Por una cuerda tensa dispuesta a lo largo del eje x se propaga, a una velocidad de 200 m s⁻¹ en el sentido positivo del eje, una onda armónica de 0,4 m de longitud de onda. En el instante inicial y en el origen de coordenadas, la elongación es positiva y también lo es la velocidad de oscilación, que equivale a la mitad de su valor máximo.",
    apartados: [
      "El número de onda y la frecuencia de la onda.",
      "La fase inicial de la onda.",
    ],
    puntos: 2,
  },
  {
    id: "f-2024-jun-A3",
    año: 2024, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Electricidad", numero: "A.3",
    enunciado: "Un hilo conductor de longitud indefinida se extiende a lo largo del eje z. Otro hilo de longitud indefinida paralelo al primero pasa por el punto (5, 0, 0) cm. Los dos hilos se repelen con una fuerza por unidad de longitud de 5·10⁻⁵ N m⁻¹. El campo magnético total se anula a lo largo de la recta x = +10 cm en el plano xz.",
    apartados: [
      "Explique si las corrientes en los hilos son paralelas o antiparalelas y calcule su magnitud.",
      "Determine el módulo del campo magnético en el punto (−5, 0, 0) cm.",
    ],
    datos: ["μ₀ = 4π·10⁻⁷ T m A⁻¹"],
    puntos: 2,
  },
  {
    id: "f-2024-jun-A4",
    año: 2024, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Optica", numero: "A.4",
    enunciado: "Un objeto de 4 mm de altura está situado 20 cm a la izquierda de una lente delgada. La imagen que se forma es derecha y tiene una altura de 2 mm.",
    apartados: [
      "Calcule la potencia de la lente e indique si es convergente o divergente.",
      "Elabore el trazado de rayos correspondiente a la situación descrita.",
    ],
    puntos: 2,
  },
  {
    id: "f-2024-jun-A5",
    año: 2024, convocatoria: "Ordinaria", opcion: "A",
    tipo: "RadioactividadModerna", numero: "A.5",
    enunciado: "Una placa de cobalto se expone a luz de frecuencia igual a 1,2 veces la frecuencia umbral para el efecto fotoeléctrico. Se registra un potencial de frenado V₁. Si se duplica la frecuencia de la luz incidente, se registra un nuevo potencial de frenado V₂ que es 6 V mayor que V₁.",
    apartados: [
      "Obtenga el trabajo de extracción para el cobalto y el valor de la frecuencia umbral.",
      "Si se mantiene la frecuencia inicial y se duplica la intensidad de la luz incidente, ¿cómo se modificará el potencial de frenado?",
    ],
    datos: ["e = 1,6·10⁻¹⁹ C", "h = 6,63·10⁻³⁴ J s"],
    puntos: 2,
  },
  {
    id: "f-2024-jun-B1",
    año: 2024, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Gravitacion", numero: "B.1",
    enunciado: "Un satélite de 200 kg de masa se mueve en una órbita cerrada alrededor de la Tierra. En un determinado instante, es detectado a 630 km de altura, moviéndose a 9,92 km s⁻¹ con velocidad perpendicular a la dirección radial.",
    apartados: [
      "Compare la velocidad del satélite con la correspondiente a una órbita circular de la altura dada y del resultado anterior, razone si la órbita es circular o elíptica.",
      "Calcule los módulos del momento angular y de la aceleración del satélite en el instante señalado.",
    ],
    datos: ["G = 6,67·10⁻¹¹ N m² kg⁻²", "Mₜ = 5,97·10²⁴ kg", "Rₜ = 6,37·10⁶ m"],
    puntos: 2,
  },
  {
    id: "f-2024-jun-B2",
    año: 2024, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Ondas", numero: "B.2",
    enunciado: "El campanario de una iglesia medieval, situado a 35 m de altura, consta de 4 campanas. Cada una de ellas emite 10 mW de potencia sonora. El límite de contaminación acústica está en 55 dB.",
    apartados: [
      "Determine el nivel de intensidad sonora que percibe una persona parada al pie de la torre cuando se toca una sola campana.",
      "¿Podrán tocar las cuatro campanas a la vez si la población está situada a más de 100 metros de la iglesia?",
    ],
    datos: ["I₀ = 10⁻¹² W m⁻²"],
    puntos: 2,
  },
  {
    id: "f-2024-jun-B3",
    año: 2024, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Electricidad", numero: "B.3",
    enunciado: "Dos partículas situadas en los puntos (−6, 0) mm y (6, 0) mm del plano xy poseen cargas iguales de +9 nC.",
    apartados: [
      "Obtenga el potencial eléctrico y el campo eléctrico en el origen de coordenadas.",
      "Obtenga el potencial eléctrico y el campo eléctrico en el punto (0, 3) mm.",
    ],
    datos: ["K = 9·10⁹ N m² C⁻²"],
    puntos: 2,
  },
  {
    id: "f-2024-jun-B4",
    año: 2024, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Optica", numero: "B.4",
    enunciado: "Un prisma de sección triangular (30°) con índice de refracción nₚ está inmerso en aire (n = 1). El ángulo límite para la reflexión total en el paso del prisma al aire vale 45,58°.",
    apartados: [
      "Determine el índice de refracción nₚ.",
      "Considere un rayo de luz que incide perpendicularmente sobre la superficie del prisma en el punto P. Elabore un diagrama de su recorrido en el interior hasta que vuelve a emerger al aire y calcule el ángulo de refracción a la salida.",
    ],
    puntos: 2,
  },
  {
    id: "f-2024-jun-B5",
    año: 2024, convocatoria: "Ordinaria", opcion: "B",
    tipo: "RadioactividadModerna", numero: "B.5",
    enunciado: "Dos muestras (radioisótopo 1 y radioisótopo 2) contienen en el momento de su preparación la misma masa. Las actividades medidas son: t = 0: A₁ = 10,00 kBq, A₂ = 11,70 kBq; t = 1 día: A₁ = 8,90 kBq, A₂ = 10,77 kBq.",
    apartados: [
      "Calcule el período de semidesintegración de cada radioisótopo.",
      "Si M₁ y M₂ denotan las masas atómicas de los radioisótopos, determine el cociente M₂/M₁.",
    ],
    puntos: 2,
  },

  // ══════════════════════════════════════════════
  // JULIO 2024 — Extraordinaria
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

  // ══════════════════════════════════════════════
  // JUNIO 2022 — Ordinaria
  // ══════════════════════════════════════════════

  {
    id: "f-2022-jun-A1",
    año: 2022, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Gravitacion", numero: "A.1",
    enunciado: "El satélite Sentinel-1 tiene una masa de 2300 kg y se encuentra en una órbita circular a 700 km sobre la superficie terrestre.",
    apartados: [
      "Deduzca la expresión que relaciona el periodo T con r, G y Mₜ. Calcule el tiempo que tarda Sentinel-1 en dar una vuelta completa.",
      "Deduzca la expresión de la energía mecánica total de un satélite de masa m en órbita circular de radio r. Obtenga la energía mecánica total del satélite Sentinel-1.",
    ],
    datos: ["G = 6,67·10⁻¹¹ N m² kg⁻²", "Mₜ = 5,97·10²⁴ kg", "Rₜ = 6,37·10⁶ m"],
    puntos: 2,
  },
  {
    id: "f-2022-jun-A2",
    año: 2022, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Ondas", numero: "A.2",
    enunciado: "Una onda armónica transversal se propaga en el sentido positivo del eje x. La amplitud es 3 cm, la longitud de onda 4 cm y el periodo 1 s. En t = 0 y x = 0 la elongación es −3 cm.",
    apartados: [
      "La expresión matemática de la onda.",
      "La velocidad de propagación de la onda y la velocidad de oscilación del punto x = 3 cm en t = 1 s.",
    ],
    puntos: 2,
  },
  {
    id: "f-2022-jun-A3",
    año: 2022, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Electricidad", numero: "A.3",
    enunciado: "Dos cargas puntuales Q₁ = 2 nC y Q₂ = −4 nC se encuentran en los puntos P₁(1, 0) m y P₂(3, 0) m.",
    apartados: [
      "El campo eléctrico creado por ambas cargas en el punto (2, 1) m.",
      "Las coordenadas del punto del eje x (x < 1 m) en el que el potencial electrostático creado por ambas cargas es cero.",
    ],
    datos: ["K = 9·10⁹ N m² C⁻²"],
    puntos: 2,
  },
  {
    id: "f-2022-jun-A4",
    año: 2022, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Optica", numero: "A.4",
    enunciado: "Se sitúa un objeto de altura h a la izquierda de una lente convergente de distancia focal f'. La imagen del objeto que se forma es real, invertida y de igual tamaño.",
    apartados: [
      "Determine, en función de f', las posiciones del objeto y de la imagen con respecto a la lente.",
      "Realice el correspondiente trazado de rayos para la formación de la imagen.",
    ],
    puntos: 2,
  },
  {
    id: "f-2022-jun-A5",
    año: 2022, convocatoria: "Ordinaria", opcion: "A",
    tipo: "RadioactividadModerna", numero: "A.5",
    enunciado: "En el acelerador de partículas del CERN se tiene un protón moviéndose con una velocidad un 90% de la velocidad de la luz, siendo su masa relativista de 3,83·10⁻²⁷ kg.",
    apartados: [
      "La masa en reposo del protón.",
      "La energía cinética que posee el protón, expresada en eV.",
    ],
    datos: ["c = 3·10⁸ m s⁻¹", "e = 1,6·10⁻¹⁹ C"],
    puntos: 2,
  },
  {
    id: "f-2022-jun-B1",
    año: 2022, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Gravitacion", numero: "B.1",
    enunciado: "En el punto (1, 0) m del plano (x, y) se encuentra una partícula A de masa mA = 2 kg. Para llevar una partícula B de masa mB desde el origen al punto (0, 2) m el trabajo del campo gravitatorio de mA es −2,95·10⁻¹⁰ J.",
    apartados: [
      "¿Cuál es el valor de la masa mB?",
      "Calcule el valor del campo gravitatorio que crea la masa mA en el punto (0, 2) m.",
    ],
    datos: ["G = 6,67·10⁻¹¹ N m² kg⁻²"],
    puntos: 2,
  },
  {
    id: "f-2022-jun-B2",
    año: 2022, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Ondas", numero: "B.2",
    enunciado: "En el centro de una pista de baile circular el nivel de intensidad sonora es de 100 dB. La discoteca tiene cuatro altavoces idénticos a la misma distancia del centro, d = 10 m.",
    apartados: [
      "Determine la potencia de cada uno de los altavoces.",
      "Si el oído humano tiene una superficie de 2·10⁻⁴ m² y una persona permanece 5 horas bailando en el centro, ¿cuál es la energía sonora total que le llega al oído?",
    ],
    datos: ["I₀ = 10⁻¹² W m⁻²"],
    puntos: 2,
  },
  {
    id: "f-2022-jun-B3",
    año: 2022, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Electricidad", numero: "B.3",
    enunciado: "Una espira cuadrada de 20 cm de lado se somete a la acción de un campo magnético variable B(t) perpendicular al plano de la espira.",
    apartados: [
      "Cuando B(t) = K·t, con K = 2·10⁻³ T s⁻¹. Halle el flujo magnético y la fem inducida en t = 2 s.",
      "Cuando B(t) = 3·10⁻³ cos(3πt) T. Halle el flujo magnético y la fem inducida en t = 2 s.",
    ],
    puntos: 2,
  },
  {
    id: "f-2022-jun-B4",
    año: 2022, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Optica", numero: "B.4",
    enunciado: "Un estanque con agua está cubierto con una capa de aceite. n_agua = 1,33 y n_aceite = 1,44.",
    apartados: [
      "Si un rayo incide desde el aire con ángulo de 40° respecto a la normal, ¿cuál es el ángulo de refracción en el agua?",
      "Si en el fondo hay un foco de luz, ¿por debajo de qué ángulo debe incidir el haz para que la luz salga fuera del estanque hacia el aire?",
    ],
    datos: ["n_aire = 1"],
    puntos: 2,
  },
  {
    id: "f-2022-jun-B5",
    año: 2022, convocatoria: "Ordinaria", opcion: "B",
    tipo: "RadioactividadModerna", numero: "B.5",
    enunciado: "El isótopo ²⁴¹Am se usa en detectores de humo. La cantidad inicial es 0,2 mg y su vida media τ = 432 años.",
    apartados: [
      "El tiempo de semidesintegración del ²⁴¹Am y la actividad inicial del detector.",
      "La cantidad de ²⁴¹Am cuando su actividad haya disminuido un 80% y el tiempo transcurrido.",
    ],
    datos: ["MAm = 241 u", "Nₐ = 6,02·10²³ mol⁻¹"],
    puntos: 2,
  },

  // ══════════════════════════════════════════════
  // JULIO 2022 — Extraordinaria
  // ══════════════════════════════════════════════

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

  // ══════════════════════════════════════════════
  // JUNIO 2023 — Ordinaria
  // ══════════════════════════════════════════════

  {
    id: "f-2023-jun-A1",
    año: 2023, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Gravitacion", numero: "A.1",
    enunciado: "Un satélite de la constelación OneWeb, de 150 kg de masa, se encuentra en una órbita circular alrededor de la Tierra a una altura de 1200 km sobre el nivel del mar.",
    apartados: [
      "Las energías potencial gravitatoria y cinética que tiene el satélite en su órbita.",
      "La energía que fue necesario comunicar al satélite para ponerlo en órbita desde la superficie de la Tierra.",
    ],
    datos: ["G = 6,67·10⁻¹¹ N m² kg⁻²", "Mₜ = 5,97·10²⁴ kg", "Rₜ = 6,37·10⁶ m"],
    puntos: 2,
  },
  {
    id: "f-2023-jun-A2",
    año: 2023, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Ondas", numero: "A.2",
    enunciado: "A lo largo de una cuerda se propaga en el sentido +x una onda transversal. El periodo es 4·10⁻³ s y la elongación máxima es 3 mm. La distancia mínima entre dos puntos que oscilan en fase es 0,25 m. En el instante 2·10⁻³ s la elongación de un punto a +0,5 m del origen es −1,5 mm y su velocidad de oscilación es positiva.",
    apartados: [
      "Halle la frecuencia angular y la velocidad de propagación de la onda.",
      "Obtenga la expresión matemática que describe a la onda.",
    ],
    puntos: 2,
  },
  {
    id: "f-2023-jun-A3",
    año: 2023, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Electricidad", numero: "A.3",
    enunciado: "Tres cargas −q, −q y +2q se encuentran situadas en los puntos (−a, a), (a, a) y (0, 0), respectivamente.",
    apartados: [
      "La expresión de la fuerza electrostática sobre la carga en la posición (a, a) y el trabajo que habrá realizado esa fuerza para traer la carga −q desde el infinito a la posición (a, a).",
      "El flujo del campo eléctrico a través de las superficies cerradas S₁ y S₂.",
    ],
    datos: ["εₒ = 1/4πK"],
    puntos: 2,
  },
  {
    id: "f-2023-jun-A4",
    año: 2023, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Optica", numero: "A.4",
    enunciado: "Un objeto de 2 cm de altura se sitúa a 18 cm a la izquierda de una pantalla. Entre la pantalla y el objeto, a 14,2 cm de este, se sitúa una lente convergente.",
    apartados: [
      "Determine la distancia focal que debe tener la lente para que se enfoque la imagen del objeto sobre la pantalla y el tamaño de la imagen.",
      "Se retira la pantalla y se sitúa a 5 cm a la derecha de la primera lente otra lente convergente de distancia focal 1,2 cm. ¿Dónde se formará la nueva imagen? Realice el trazado de rayos.",
    ],
    puntos: 2,
  },
  {
    id: "f-2023-jun-A5",
    año: 2023, convocatoria: "Ordinaria", opcion: "A",
    tipo: "RadioactividadModerna", numero: "A.5",
    enunciado: "Se sospecha que un acuífero recibe aportes intermitentes de radón (²²²Rn). Una medida arroja un valor de 14 Bq para una muestra de un litro. Determine el valor de la medida de la siguiente semana en cada condición.",
    apartados: [
      "Si no hubiese ningún aporte de ²²²Rn en el transcurso de esa semana.",
      "Si el cuarto día la concentración de ²²²Rn experimentase un aumento súbito de 2·10⁻¹⁶ g por cada litro de agua.",
    ],
    datos: ["T₁/₂(²²²Rn) = 3,8 días", "M₂₂₂₋Rn = 222 u", "Nₐ = 6,02·10²³ mol⁻¹"],
    puntos: 2,
  },
  {
    id: "f-2023-jun-B1",
    año: 2023, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Gravitacion", numero: "B.1",
    enunciado: "En la película Space Cowboys un satélite militar orbita alrededor de la Tierra a una altura de 1600 km sobre la superficie terrestre.",
    apartados: [
      "Calcule la velocidad orbital del satélite y el tiempo que tarda en dar una vuelta completa. Desprecie la interacción gravitatoria de la Luna.",
      "Para evitar que el satélite caiga a la Tierra se decide impulsarlo hacia la Luna. Determine la distancia x al centro de la Tierra a la que tendrá que llegar el satélite para que el campo gravitatorio lunar sea superior al terrestre.",
    ],
    datos: ["G = 6,67·10⁻¹¹ N m² kg⁻²", "Mₜ = 5,97·10²⁴ kg", "Rₜ = 6,37·10³ km", "Mₗ = 7,35·10²² kg", "d = 3,84·10⁵ km"],
    puntos: 2,
  },
  {
    id: "f-2023-jun-B2",
    año: 2023, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Ondas", numero: "B.2",
    enunciado: "Un observador que se encuentra a 3 m de una fuente puntual sonora que emite en todas direcciones mide un nivel de intensidad sonora de 53 dB.",
    apartados: [
      "La intensidad sonora recibida por el observador y la potencia con la que emite la fuente puntual.",
      "La distancia a la que debe situarse el observador para que el nivel de intensidad sonora percibido se reduzca a una cuarta parte.",
    ],
    datos: ["I₀ = 10⁻¹² W m⁻²"],
    puntos: 2,
  },
  {
    id: "f-2023-jun-B3",
    año: 2023, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Electricidad", numero: "B.3",
    enunciado: "Un ion de He⁺ se sitúa inicialmente en reposo dentro de una región donde existe un campo eléctrico homogéneo de 10³ V m⁻¹ dirigido a lo largo del eje +x.",
    apartados: [
      "Calcule la aceleración que experimenta el ion en el instante inicial.",
      "Determine la fuerza total sobre el ion si a los 20 μs de ser depositado se aplica un campo magnético homogéneo de 0,6 T a lo largo del eje +y.",
    ],
    datos: ["MHe = 4 u", "Nₐ = 6,02·10²³ mol⁻¹", "e = 1,6·10⁻¹⁹ C"],
    puntos: 2,
  },
  {
    id: "f-2023-jun-B4",
    año: 2023, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Optica", numero: "B.4",
    enunciado: "Un rayo de luz incide sobre la cara izquierda de un prisma equilátero (60°) construido con un material de índice de refracción 1,66.",
    apartados: [
      "Determine los ángulos α y β de la trayectoria del rayo que entra en el prisma desde el aire con un ángulo de incidencia de 50°.",
      "Calcule el ángulo límite con el que deberá incidir desde el aire el rayo para que no emerja del prisma.",
    ],
    datos: ["n_aire = 1"],
    puntos: 2,
  },
  {
    id: "f-2023-jun-B5",
    año: 2023, convocatoria: "Ordinaria", opcion: "B",
    tipo: "RadioactividadModerna", numero: "B.5",
    enunciado: "Para estudiar el efecto fotoeléctrico se registra la intensidad de corriente en función del potencial aplicado. La gráfica muestra datos para luz de 379 nm y 544 nm, con potenciales de frenado de 2,5 V y 1,5 V respectivamente.",
    apartados: [
      "A partir de los potenciales de frenado, obtenga el valor de la constante de Planck.",
      "Indique cuáles serían los valores del potencial de frenado y de la intensidad de corriente máxima para 379 nm si se disminuyese a la mitad la intensidad del haz.",
    ],
    datos: ["c = 3·10⁸ m s⁻¹", "e = 1,6·10⁻¹⁹ C"],
    puntos: 2,
  },

  // ══════════════════════════════════════════════
  // JULIO 2023 — Extraordinaria
  // ══════════════════════════════════════════════

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

  // ══════════════════════════════════════════════
  // JUNIO 2021 — Ordinaria
  // ══════════════════════════════════════════════

  {
    id: "f-2021-jun-A1",
    año: 2021, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Gravitacion", numero: "A.1",
    enunciado: "Una masa puntual de 50 g se encuentra situada en la posición (8, 0) m del plano xy.",
    apartados: [
      "El potencial gravitatorio y el campo gravitatorio en el punto (0, 6) m del plano debido a dicha masa.",
      "El trabajo realizado por el campo al trasladar un objeto puntual de 20 g desde el punto (0, 6) m hasta el origen de coordenadas.",
    ],
    datos: ["G = 6,67·10⁻¹¹ N m² kg⁻²"],
    puntos: 2,
  },
  {
    id: "f-2021-jun-A2",
    año: 2021, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Ondas", numero: "A.2",
    enunciado: "Al explotar, un cohete de fuegos artificiales genera una onda sonora esférica con una potencia sonora de 20 mW. Un espectador oye la explosión 1,5 s después de verlo explotar.",
    apartados: [
      "La distancia a la que está situado el espectador respecto al cohete, así como la intensidad del sonido en la posición del espectador.",
      "El nivel de intensidad sonora percibida si explotan 10 cohetes simultáneamente y el espectador los oye todos al unísono 1,5 s después de explotar.",
    ],
    datos: ["vs = 340 m s⁻¹", "I₀ = 10⁻¹² W m⁻²"],
    puntos: 2,
  },
  {
    id: "f-2021-jun-A3",
    año: 2021, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Electricidad", numero: "A.3",
    enunciado: "Una carga puntual de 2 μC se encuentra situada en el origen de coordenadas.",
    apartados: [
      "Aplicando el teorema de Gauss, obtenga el flujo del campo eléctrico a través de una superficie esférica de 10 mm de diámetro centrada en el origen.",
      "Utilizando el valor del flujo obtenido, calcule el módulo del campo eléctrico en puntos situados a 5 mm de la carga.",
    ],
    datos: ["ε₀ = 8,85·10⁻¹² C² N⁻¹ m⁻²"],
    puntos: 2,
  },
  {
    id: "f-2021-jun-A4",
    año: 2021, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Optica", numero: "A.4",
    enunciado: "Un objeto vertical de 2 mm de altura se encuentra situado 15 cm a la izquierda de una lente convergente de 40 dioptrías.",
    apartados: [
      "La posición y tamaño de la imagen que forma la lente.",
      "La posición de una segunda lente convergente de 6 cm de distancia focal, situada a la derecha de la primera, para que el sistema genere una imagen en el infinito.",
    ],
    puntos: 2,
  },
  {
    id: "f-2021-jun-A5",
    año: 2021, convocatoria: "Ordinaria", opcion: "A",
    tipo: "RadioactividadModerna", numero: "A.5",
    enunciado: "Un material posee tres niveles energéticos electrónicos. Para que un electrón pase desde el nivel fundamental al segundo nivel, el material absorbe radiación de 450 nm; tras lo cual emite radiación de 600 nm por el decaimiento del primer nivel hasta el fundamental.",
    apartados: [
      "Determine las diferencias de energía entre el primer nivel y el nivel fundamental, y entre el segundo nivel y el nivel fundamental, expresadas en eV.",
      "Calcule la energía por unidad de tiempo que produce la emisión si el material emite 4·10¹⁵ fotones s⁻¹.",
    ],
    datos: ["e = 1,6·10⁻¹⁹ C", "h = 6,63·10⁻³⁴ J s", "c = 3·10⁸ m s⁻¹"],
    puntos: 2,
  },
  {
    id: "f-2021-jun-B1",
    año: 2021, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Gravitacion", numero: "B.1",
    enunciado: "Una sonda espacial de 3500 kg se encuentra en órbita circular alrededor de Saturno, realizando una revolución cada 36 horas.",
    apartados: [
      "La velocidad orbital y la energía mecánica que posee la sonda espacial.",
      "La energía mínima necesaria que habría que suministrarle para que abandone el campo gravitatorio del planeta.",
    ],
    datos: ["G = 6,67·10⁻¹¹ N m² kg⁻²", "Ms = 5,68·10²⁶ kg"],
    puntos: 2,
  },
  {
    id: "f-2021-jun-B2",
    año: 2021, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Ondas", numero: "B.2",
    enunciado: "El valor del campo eléctrico asociado a una onda electromagnética que se propaga en un medio material en la dirección del eje x viene expresado por: E(x,t) = 4cos(3,43·10¹⁵t − 1,52·10⁷x) N C⁻¹.",
    apartados: [
      "La frecuencia y la longitud de onda asociadas a la onda electromagnética.",
      "La velocidad de propagación de la onda y el índice de refracción del medio.",
    ],
    datos: ["c = 3·10⁸ m s⁻¹"],
    puntos: 2,
  },
  {
    id: "f-2021-jun-B3",
    año: 2021, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Electricidad", numero: "B.3",
    enunciado: "Un hilo conductor rectilíneo indefinido situado a lo largo del eje x transporta una corriente de 25 A en sentido positivo del eje.",
    apartados: [
      "El campo magnético creado por el hilo en el punto (0, 5, 0) cm.",
      "La fuerza magnética que experimenta un electrón cuando está en la posición (0, 5, 0) cm y tiene una velocidad de 1000 m s⁻¹ en sentido positivo del eje y.",
    ],
    datos: ["e = 1,6·10⁻¹⁹ C", "μ₀ = 4π·10⁻⁷ T m A⁻¹"],
    puntos: 2,
  },
  {
    id: "f-2021-jun-B4",
    año: 2021, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Optica", numero: "B.4",
    enunciado: "Un rayo láser de longitud de onda 488 nm en el vacío incide desde el aire sobre la superficie plana de un material con índice de refracción 1,55. El rayo incidente y el reflejado forman entre sí un ángulo de 60°.",
    apartados: [
      "Determine la frecuencia y la longitud de onda del rayo luminoso en el aire y dentro del medio material.",
      "Calcule el ángulo que formará el rayo refractado con el rayo reflejado. ¿Existirá algún ángulo de incidencia para el cual el rayo láser sufra reflexión total? Justifique la respuesta.",
    ],
    datos: ["n_aire = 1", "c = 3·10⁸ m s⁻¹"],
    puntos: 2,
  },
  {
    id: "f-2021-jun-B5",
    año: 2021, convocatoria: "Ordinaria", opcion: "B",
    tipo: "RadioactividadModerna", numero: "B.5",
    enunciado: "Un isótopo de una muestra radiactiva posee un período de semidesintegración de 5730 años.",
    apartados: [
      "Obtenga la vida media y la constante radiactiva del isótopo.",
      "Si una muestra tiene 5·10²⁰ átomos radiactivos en el momento inicial, calcule la actividad inicial y el tiempo que debe transcurrir para que dicha actividad se reduzca a la décima parte.",
    ],
    puntos: 2,
  },

  // ══════════════════════════════════════════════
  // JUNIO 2020 — Ordinaria
  // ══════════════════════════════════════════════

  {
    id: "f-2020-jun-A1",
    año: 2020, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Gravitacion", numero: "A.1",
    enunciado: "Un satélite sigue una órbita circular sincrónica (mismo período que la rotación del planeta) de radio 1,59·10⁵ km en torno a un planeta de masa 1,90·10²⁷ kg.",
    apartados: [
      "La velocidad del satélite en la órbita.",
      "El periodo de rotación del planeta sobre su eje.",
    ],
    datos: ["G = 6,67·10⁻¹¹ N m² kg⁻²"],
    puntos: 2,
  },
  {
    id: "f-2020-jun-A2",
    año: 2020, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Ondas", numero: "A.2",
    enunciado: "Una onda armónica unidimensional que se propaga con velocidad de 400 m s⁻¹ está descrita por: y(x,t) = 3 sen(kx − 200πt + φ₀) cm. Sabiendo que y(0, 0) = 1,5 cm y que la velocidad de oscilación en t = 0 y x = 0 es positiva.",
    apartados: [
      "El número de onda k y la fase inicial φ₀.",
      "La aceleración máxima de oscilación de un punto genérico del eje x.",
    ],
    puntos: 2,
  },
  {
    id: "f-2020-jun-A3",
    año: 2020, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Electricidad", numero: "A.3",
    enunciado: "Una barra conductora de 30 cm de longitud y paralela al eje y se mueve en el plano xy con velocidad en sentido positivo del eje x sobre unos rieles conductores en U. Hay un campo magnético uniforme B = −3·10⁻³ k̂ T perpendicular al plano.",
    apartados: [
      "La fuerza electromotriz inducida en la barra si la velocidad es constante e igual a 2·10⁻¹ î m s⁻¹.",
      "La fuerza electromotriz inducida si la barra parte del reposo con aceleración constante de 5 î m s⁻².",
    ],
    puntos: 2,
  },
  {
    id: "f-2020-jun-A4",
    año: 2020, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Optica", numero: "A.4",
    enunciado: "Un objeto está situado en una posición s₁ a la izquierda de una lente convergente de distancia focal 50 mm formando una imagen real, invertida y de tamaño doble. Luego el objeto se mueve a s₂ donde la imagen es virtual, derecha y de tamaño doble.",
    apartados: [
      "La posición s₁ inicial del objeto y la distancia inicial entre la imagen y la lente.",
      "La posición s₂ final del objeto y la distancia final entre la imagen y la lente.",
    ],
    puntos: 2,
  },
  {
    id: "f-2020-jun-A5",
    año: 2020, convocatoria: "Ordinaria", opcion: "A",
    tipo: "RadioactividadModerna", numero: "A.5",
    enunciado: "Se tienen dos fuentes radiactivas cuya actividad hoy es la misma. Dentro de 10 años la actividad de la primera fuente será el doble que la de la segunda.",
    apartados: [
      "La diferencia λ₂ − λ₁ que existe entre las constantes de desintegración de ambas fuentes.",
      "La relación entre las actividades de dichas fuentes dentro de 20 años.",
    ],
    puntos: 2,
  },
  {
    id: "f-2020-jun-B1",
    año: 2020, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Gravitacion", numero: "B.1",
    enunciado: "Se tiene un planeta de masa 1,95·10²⁵ kg y radio 5500 km.",
    apartados: [
      "El módulo de la aceleración de la gravedad en la superficie de dicho planeta.",
      "La velocidad de escape desde la superficie del planeta.",
    ],
    datos: ["G = 6,67·10⁻¹¹ N m² kg⁻²"],
    puntos: 2,
  },
  {
    id: "f-2020-jun-B2",
    año: 2020, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Ondas", numero: "B.2",
    enunciado: "A una distancia de 10 m, el nivel de intensidad sonora producida por un foco puntual es de 20 dB.",
    apartados: [
      "La potencia del foco.",
      "El nivel de intensidad sonora a 2 m del foco.",
    ],
    datos: ["I₀ = 10⁻¹² W m⁻²"],
    puntos: 2,
  },
  {
    id: "f-2020-jun-B3",
    año: 2020, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Electricidad", numero: "B.3",
    enunciado: "Cuatro cargas con |q| = 1·10⁻⁶ C situadas en los vértices de un cuadrado de lado a = 30 cm. Las cargas positivas están en (0, 0) y (a, a); las negativas en (0, a) y (a, 0).",
    apartados: [
      "La fuerza que se ejerce sobre la carga +q situada en el punto (a, a) debida a las otras tres.",
      "La energía potencial de la carga situada en el origen de coordenadas debida a las otras tres.",
    ],
    datos: ["K = 9·10⁹ N m² C⁻²"],
    puntos: 2,
  },
  {
    id: "f-2020-jun-B4",
    año: 2020, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Optica", numero: "B.4",
    enunciado: "Una placa de vidrio de 4 cm de espesor e índice de refracción 1,5 está sumergida entre dos aceites de índices 1,4 y 1,2. Un haz de luz incide desde el aceite de índice 1,4 con un ángulo de incidencia de 30°.",
    apartados: [
      "La distancia d entre el rayo reflejado por la cara superior del vidrio y el refractado después de reflejarse en la cara inferior.",
      "El ángulo de incidencia mínimo en la cara superior del vidrio para que se produzca reflexión total en la cara inferior.",
    ],
    puntos: 2,
  },
  {
    id: "f-2020-jun-B5",
    año: 2020, convocatoria: "Ordinaria", opcion: "B",
    tipo: "RadioactividadModerna", numero: "B.5",
    enunciado: "Se hace incidir un haz de fotones de frecuencia variable sobre una lámina metálica. De la gráfica se obtiene que la frecuencia umbral es 5·10¹⁴ Hz y a 10·10¹⁴ Hz la energía cinética máxima de los electrones es 2 eV.",
    apartados: [
      "El trabajo de extracción del metal en eV.",
      "La longitud de onda de de Broglie asociada a los electrones emitidos con máxima energía cinética cuando la frecuencia de los fotones es de 10·10¹⁴ Hz.",
    ],
    datos: ["e = 1,6·10⁻¹⁹ C", "mₑ = 9,1·10⁻³¹ kg", "h = 6,63·10⁻³⁴ J s"],
    puntos: 2,
  },

  // ══════════════════════════════════════════════
  // JUNIO 2019 — Ordinaria
  // ══════════════════════════════════════════════

  {
    id: "f-2019-jun-A1",
    año: 2019, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Gravitacion", numero: "A.1",
    enunciado: "Una masa puntual m₁ = 5 kg está situada en el punto (4, 3) m.",
    apartados: [
      "Determine la intensidad del campo gravitatorio creado por m₁ en el origen de coordenadas y el trabajo realizado al trasladar otra masa m₂ = 0,5 kg desde el infinito hasta el origen.",
      "Situadas las masas m₁ y m₂ en las posiciones anteriores, ¿a qué distancia del origen el campo gravitatorio resultante es nulo?",
    ],
    datos: ["G = 6,67·10⁻¹¹ N m² kg⁻²"],
    puntos: 2,
  },
  {
    id: "f-2019-jun-A2",
    año: 2019, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Ondas", numero: "A.2",
    enunciado: "Un detector situado a cierta distancia de una fuente sonora puntual mide un nivel de intensidad sonora de 80 dB. Si se duplica la distancia entre la fuente y el detector, determine a esta nueva distancia:",
    apartados: [
      "La intensidad de la onda sonora.",
      "El nivel de intensidad sonora.",
    ],
    datos: ["I₀ = 10⁻¹² W m⁻²"],
    puntos: 2,
  },
  {
    id: "f-2019-jun-A3",
    año: 2019, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Electricidad", numero: "A.3",
    enunciado: "Dos hilos conductores rectilíneos indefinidos paralelos al eje z cortan al plano xy en O(0, 0, 0) y A(2, 2, 0) cm. Por cada cable circula una corriente de 5 A en el sentido positivo del eje z.",
    apartados: [
      "El vector campo magnético en el punto P(0, 2, 0) cm y en el punto Q(1, 1, 0) cm.",
      "La fuerza magnética por unidad de longitud que actúa sobre el conductor que pasa por A debida a la presencia del otro, indicando su dirección y sentido.",
    ],
    datos: ["μ₀ = 4π·10⁻⁷ N A⁻²"],
    puntos: 2,
  },
  {
    id: "f-2019-jun-A4",
    año: 2019, convocatoria: "Ordinaria", opcion: "A",
    tipo: "Optica", numero: "A.4",
    enunciado: "Problemas de lentes convergentes y corrección visual.",
    apartados: [
      "Determine a qué distancia debe colocarse un objeto delante de una lente convergente de 0,30 m de distancia focal para que se forme una imagen virtual, derecha y dos veces mayor que el objeto.",
      "El punto remoto de un ojo miope se encuentra 0,5 m delante de sus ojos. Determine la potencia de la lente que debe utilizar para ver nítido un objeto situado en el infinito.",
    ],
    puntos: 2,
  },
  {
    id: "f-2019-jun-A5",
    año: 2019, convocatoria: "Ordinaria", opcion: "A",
    tipo: "RadioactividadModerna", numero: "A.5",
    enunciado: "Efecto fotoeléctrico en dos metales distintos.",
    apartados: [
      "La longitud de onda umbral de un metal para el efecto fotoeléctrico es 579 nm. Calcule el trabajo de extracción del metal y la energía cinética máxima de los electrones emitidos en eV si el metal se ilumina con radiación de 304 nm.",
      "Si se hace incidir sobre otro metal la misma radiación de 304 nm y el potencial de frenado es de 4,08 V, calcule el trabajo de extracción de este nuevo metal.",
    ],
    datos: ["h = 6,63·10⁻³⁴ J s", "e = 1,6·10⁻¹⁹ C", "c = 3·10⁸ m s⁻¹"],
    puntos: 2,
  },
  {
    id: "f-2019-jun-B1",
    año: 2019, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Gravitacion", numero: "B.1",
    enunciado: "El Amazonas 5 es un satélite geoestacionario de comunicaciones de 5900 kg puesto en órbita en septiembre de 2017.",
    apartados: [
      "La altura sobre el ecuador terrestre del satélite y su velocidad orbital.",
      "La fuerza centrípeta necesaria para que describa la órbita y la energía total del satélite en dicha órbita.",
    ],
    datos: ["G = 6,67·10⁻¹¹ N m² kg⁻²", "Mₜ = 5,97·10²⁴ kg", "Rₜ = 6,37·10⁶ m"],
    puntos: 2,
  },
  {
    id: "f-2019-jun-B2",
    año: 2019, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Ondas", numero: "B.2",
    enunciado: "Una onda armónica transversal de frecuencia f = 0,25 Hz y longitud de onda λ = 2 m se propaga en el sentido positivo del eje x. El punto situado en x = 0,5 m tiene en t = 2 s elongación nula y velocidad de oscilación negativa, y en t = 3 s elongación y = −0,2 m.",
    apartados: [
      "La expresión matemática que representa dicha onda.",
      "La velocidad máxima de oscilación de cualquier punto alcanzado por la onda y la diferencia de fase entre dos puntos del eje x que distan entre sí 0,75 m.",
    ],
    puntos: 2,
  },
  {
    id: "f-2019-jun-B3",
    año: 2019, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Electricidad", numero: "B.3",
    enunciado: "Dos cargas puntuales q₁ = −4 nC y q₂ = +2 nC están situadas en los puntos P₁(−5, 0) y P₂(3, 0) (coordenadas en cm).",
    apartados: [
      "El campo eléctrico y el potencial eléctrico en el origen de coordenadas.",
      "En qué punto situado en el segmento que une las dos cargas el potencial eléctrico se anula.",
    ],
    datos: ["K = 9·10⁹ N m² C⁻²"],
    puntos: 2,
  },
  {
    id: "f-2019-jun-B4",
    año: 2019, convocatoria: "Ordinaria", opcion: "B",
    tipo: "Optica", numero: "B.4",
    enunciado: "Un rayo de luz incide con ángulo i₁ desde un medio n₁ = 1,6 sobre un medio n₂ = 1,3, de manera que el rayo reflejado y el refractado forman entre sí un ángulo de 90°. El rayo refractado incide con el ángulo crítico ic sobre otro medio n₃ desconocido.",
    apartados: [
      "Los ángulos de incidencia i₁ e ic.",
      "El índice de refracción n₃.",
    ],
    puntos: 2,
  },
  {
    id: "f-2019-jun-B5",
    año: 2019, convocatoria: "Ordinaria", opcion: "B",
    tipo: "RadioactividadModerna", numero: "B.5",
    enunciado: "Se dispone de una muestra de 10 mg de ²³⁸Pu cuyo período de semidesintegración es de 87,7 años y su masa atómica es 238 u.",
    apartados: [
      "El tiempo necesario para que la muestra se reduzca a 2 mg.",
      "Los valores de la actividad inicial y final.",
    ],
    datos: ["Nₐ = 6,02·10²³ mol⁻¹"],
    puntos: 2,
  },

  // ══════════════════════════════════════════════
  // JUNIO 2018 — Ordinaria
  // ══════════════════════════════════════════════

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
