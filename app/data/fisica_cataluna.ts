export type ConvocatoriaCataluna = 'ordinaria' | 'extraordinaria'

export type FormatoFisicaCataluna =
  | 'seleccion_4_de_8'
  | 'seleccion_4_de_7'
  | '2025_opciones'

export type ApartadoFisicaCataluna = {
  letra: string
  enunciado: string
  puntos?: number
}

export type OpcionFisicaCataluna = {
  opcion: 'A' | 'B'
  titulo?: string
  enunciado?: string
  apartados: ApartadoFisicaCataluna[]
  datos?: string[]
  imagenes?: string[]
  requiereRevision?: boolean
}

export type EjercicioFisicaCataluna = {
  numero: number
  titulo: string
  bloque?: string
  enunciado?: string
  apartados?: ApartadoFisicaCataluna[]
  opciones?: OpcionFisicaCataluna[]
  datos?: string[]
  instrucciones?: string
  imagenes?: string[]
  requiereRevision?: boolean
}

export type ExamenFisicaCataluna = {
  id: string
  comunidad: 'Cataluña'
  asignatura: 'fisica'
  anio: number
  convocatoria: ConvocatoriaCataluna
  serie: string
  formato: FormatoFisicaCataluna
  instrucciones: string
  ejercicios: EjercicioFisicaCataluna[]
}

export const examenesFisicaCataluna: ExamenFisicaCataluna[] = [
  {
    id: 'fisica-cat-2025-ordinaria',
    comunidad: 'Cataluña',
    asignatura: 'fisica',
    anio: 2025,
    convocatoria: 'ordinaria',
    serie: 'Sèrie 1',
    formato: '2025_opciones',
    instrucciones:
      'L’examen consta de QUATRE exercicis obligatoris. Cada exercici val 2,5 punts. Als exercicis 2 i 3 heu de triar UNA de les dues opcions (A o B) que s’hi proposen.',
    ejercicios: [
      {
        numero: 1,
        titulo: 'Exercici 1 — Camps gravitatoris',
        bloque: 'Camps gravitatoris',
        enunciado:
          'La brossa espacial deixada per satèl·lits antics i els seus coets llançadors s’està convertint en un perill per a altres satèl·lits. El novembre de 2023, durant unes tasques de reparació, dos astronautes es van deixar una caixa d’eines a l’exterior de l’Estació Espacial Internacional.',
        apartados: [
          {
            letra: 'a',
            puntos: 1.25,
            enunciado:
              'A partir de la llei de gravitació universal, deduïu l’expressió de la velocitat orbital en funció del radi orbital. Calculeu la velocitat de la caixa d’eines en òrbita a 400 km per sobre de la superfície terrestre i el nombre de voltes que farà la caixa cada dia al voltant de la Terra.',
          },
          {
            letra: 'b',
            puntos: 1.25,
            enunciado:
              'La fi de l’EEI està planificada per a l’any 2031. D’una manera gradual i controlada se’n baixarà l’òrbita fins als 280 km d’altura per sobre de la superfície terrestre. Calculeu l’energia mecànica de l’EEI en aquesta òrbita i justifiqueu-ne el signe. Calculeu amb quina energia cinètica impactarà l’estació contra l’aigua, sense tenir en compte els efectes de l’atmosfera terrestre.',
          },
        ],
        datos: [
          'G = 6,67 × 10⁻¹¹ N m² kg⁻².',
          'Massa de la Terra: M_T = 5,98 × 10²⁴ kg.',
          'Radi de la Terra: R_T = 6,37 × 10⁶ m.',
          'Massa de l’EEI: M_EEI = 430 × 10³ kg.',
        ],
      },
      {
        numero: 2,
        titulo: 'Exercici 2 — Camps electromagnètics',
        bloque: 'Camps electromagnètics',
        instrucciones: 'Trieu UNA de les dues opcions (A o B).',
        opciones: [
          {
            opcion: 'A',
            titulo: 'Opció A — Experiment de Millikan',
            enunciado:
              'L’experiment de Millikan va permetre determinar la càrrega de l’electró. El muntatge consta de dues plaques metàl·liques horitzontals separades verticalment per una distància d i connectades a una font de potencial elèctric regulable. Entre les plaques s’introdueixen gotetes d’oli carregades negativament.',
            apartados: [
              {
                letra: 'a',
                puntos: 1.25,
                enunciado:
                  'Feu un esquema del dispositiu emprat per Millikan, dibuixant les forces que actuen sobre una gota d’oli esfèrica. Indiqueu i raoneu el signe de la càrrega que tindrà cada placa i la direcció i el sentit del camp elèctric generat. Suposant que les plaques es connecten a un potencial de 2,00 kV i que la distància entre plaques és d = 2,00 cm, calculeu el camp elèctric creat entre plaques.',
              },
              {
                letra: 'b',
                puntos: 1.25,
                enunciado:
                  'Tenint en compte que la densitat de l’oli és de 923 kg m⁻³ i que el radi d’una gota és d’1,08 μm, calculeu la càrrega d’una gota que es troba en equilibri. Quants electrons calen per a generar aquesta càrrega? Què s’observaria si il·luminéssim la gota amb raigs ultraviolats i aquesta perdés un electró?',
              },
            ],
            datos: [
              '|e| = 1,602 × 10⁻¹⁹ C.',
              'm_e = 9,11 × 10⁻³¹ kg.',
              'g = 9,8 m s⁻².',
              'Volum d’una esfera: V = 4/3πr³.',
            ],
          },
          {
            opcion: 'B',
            titulo: 'Opció B — Inducció electromagnètica',
            enunciado:
              'Formem un circuit amb un cable metàl·lic en forma de U i tanquem la part superior amb una barra metàl·lica que pot lliscar lliurement. L’amplària de la U és de 0,25 m i inicialment l’alçària del circuit és de 0,30 m. La barra es desplaça cap avall a una velocitat constant de 5,00 m s⁻¹ dins un camp magnètic B = 2,00 T perpendicular al pla del circuit.',
            apartados: [
              {
                letra: 'a',
                puntos: 1.25,
                enunciado:
                  'Calculeu l’expressió del flux magnètic del circuit en funció del temps i la força electromotriu induïda. Indiqueu el sentit de circulació del corrent induït i justifiqueu la resposta.',
              },
              {
                letra: 'b',
                puntos: 1.25,
                enunciado:
                  'Suposem que la barra presenta una resistència de 50,0 Ω i la resta del circuit no presenta cap resistència. Calculeu la intensitat elèctrica que circularà pel circuit. Calculeu la força magnètica que actua sobre la barra i representeu-la.',
              },
            ],
          },
        ],
      },
      {
        numero: 3,
        titulo: 'Exercici 3 — Vibracions i ones',
        bloque: 'Vibracions i ones',
        instrucciones: 'Trieu UNA de les dues opcions (A o B).',
        opciones: [
          {
            opcion: 'A',
            titulo: 'Opció A — Bloc de policarbonat i refracció',
            enunciado:
              'En una exposició d’art hi ha una obra que consisteix en una moneda situada a l’interior d’un bloc massís de policarbonat transparent. Una persona observa l’obra des del punt mitjà de la cara oposada i una segona persona se situa a la dreta de la primera, però no veu la moneda.',
            apartados: [
              {
                letra: 'a',
                puntos: 1.25,
                enunciado:
                  'A partir de la llei de Snell, deduïu l’expressió de l’angle límit o angle crític en funció dels índexs de refracció dels dos medis. Calculeu l’angle límit amb les dades del problema. Justifiqueu si es podria donar aquest fenomen si s’invertissin els medis.',
              },
              {
                letra: 'b',
                puntos: 1.25,
                enunciado:
                  'A quina distància màxima, d, s’hauria de col·locar la segona persona respecte de la primera per veure la moneda? Considereu un raig de llum que surt de la moneda i arriba a la interfície de policarbonat-aire amb aquest angle límit i dibuixeu un esquema dels raigs incident, reflectit i refractat.',
              },
            ],
            datos: ['Índex de refracció de l’aire = 1.', 'Índex de refracció del policarbonat = 1,58.'],
          },
          {
            opcion: 'B',
            titulo: 'Opció B — Flauta travessera',
            enunciado:
              'Una flauta travessera és un tub metàl·lic obert pels dos extrems que té una longitud de 67,0 cm. El seu so abraça un interval extens de freqüències.',
            apartados: [
              {
                letra: 'a',
                puntos: 1.25,
                enunciado:
                  'Per a tocar la nota més greu, el flautista tapa amb els dits tots els forats laterals del tub. Calculeu les freqüències del primer i el tercer harmònics d’una flauta travessera en aquest cas. Dibuixeu aquests dos harmònics i calculeu per a cada un la posició dels nodes i els ventres respecte d’un extrem de la flauta.',
              },
              {
                letra: 'b',
                puntos: 1.25,
                enunciado:
                  'Tapem un dels extrems de la flauta de manera que aquesta es comporta com un tub amb un extrem obert i un de tancat. Dibuixeu l’ona estacionària corresponent al primer i el segon modes de vibració possibles i indiqueu nodes i ventres. Calculeu la longitud d’ona i la freqüència d’aquests dos modes.',
              },
            ],
            datos: ['Velocitat del so en l’aire = 343 m s⁻¹.'],
          },
        ],
      },
      {
        numero: 4,
        titulo: 'Exercici 4 — Física relativista, quàntica, nuclear i de partícules',
        bloque: 'Física relativista, quàntica, nuclear i de partícules',
        enunciado:
          'L’isòtop del sodi ²⁴₁₁Na té un excés de neutrons i sabem que és un emissor beta.',
        apartados: [
          {
            letra: 'a',
            puntos: 1.25,
            enunciado:
              'Completeu la reacció nuclear de desintegració del ²⁴₁₁Na, indiqueu totes les partícules que intervenen i justifiqueu de quin tipus de desintegració es tracta.',
          },
          {
            letra: 'b',
            puntos: 1.25,
            enunciado:
              'Resoleu els càlculs associats a l’activitat, la massa o l’evolució temporal de l’isòtop segons les dades del PDF original.',
          },
        ],
        requiereRevision: true,
      },
    ],
  },

  {
    id: 'fisica-cat-2025-extraordinaria',
    comunidad: 'Cataluña',
    asignatura: 'fisica',
    anio: 2025,
    convocatoria: 'extraordinaria',
    serie: 'Sèrie 3',
    formato: '2025_opciones',
    instrucciones:
      'L’examen consta de QUATRE exercicis obligatoris. Cada exercici val 2,5 punts. Als exercicis 2 i 3 heu de triar UNA de les dues opcions (A o B) que s’hi proposen.',
    ejercicios: [
      {
        numero: 1,
        titulo: 'Exercici 1 — Camps gravitatoris',
        bloque: 'Camps gravitatoris',
        enunciado:
          'La nau BepiColombo, de 2 700 kg de massa, sobrevola Mercuri per estudiar el planeta.',
        apartados: [
          {
            letra: 'a',
            puntos: 1.25,
            enunciado:
              'Completeu la taula calculant la distància respecte al centre de Mercuri per als dos punts indicats a partir de les energies potencials donades.',
          },
          {
            letra: 'b',
            puntos: 1.25,
            enunciado:
              'Resoleu l’apartat b segons el PDF original. Aquest apartat requereix revisió visual perquè part del OCR ha quedat truncat.',
          },
        ],
        requiereRevision: true,
      },
      {
        numero: 2,
        titulo: 'Exercici 2 — Camps electromagnètics',
        bloque: 'Camps electromagnètics',
        instrucciones: 'Trieu UNA de les dues opcions (A o B).',
        opciones: [
          {
            opcion: 'A',
            titulo: 'Opció A — Vareta metàl·lica i inducció',
            enunciado:
              'Una vareta metàl·lica es desplaça a una velocitat constant de 3,00 m s⁻¹ sobre un conductor en forma de U dins un camp magnètic uniforme B = 0,40 T, perpendicular al pla.',
            apartados: [
              {
                letra: 'a',
                puntos: 1.25,
                enunciado:
                  'Calculeu el flux magnètic a través del circuit tancat per la vareta en l’instant inicial. Justifiqueu quin és el sentit de moviment de la vareta i determineu la FEM induïda mentre es mou.',
              },
              {
                letra: 'b',
                puntos: 1.25,
                enunciado:
                  'Considereu la situació en què la intensitat induïda és de 6,00 mA. Justifiqueu si apareix força magnètica sobre la vareta, calculeu-ne el mòdul i dibuixeu-la.',
              },
            ],
          },
          {
            opcion: 'B',
            titulo: 'Opció B — Model de Bohr',
            enunciado:
              'El model de l’àtom d’hidrogen de Bohr suposa que l’electró descriu una òrbita circular al voltant del protó i que el moment angular de l’òrbita és un múltiple enter de la constant de Planck.',
            apartados: [
              {
                letra: 'a',
                puntos: 1.25,
                enunciado:
                  'Demostreu l’expressió del moment angular i trobeu l’expressió del radi de l’òrbita de l’electró en funció de h, n, k, m i e. Calculeu el radi per a n = 1.',
              },
              {
                letra: 'b',
                puntos: 1.25,
                enunciado:
                  'Suposant que el radi de l’òrbita per a n = 1 és 53 pm, calculeu les energies cinètica, potencial i mecànica clàssiques de l’electró.',
              },
            ],
            datos: [
              '|e| = 1,602 × 10⁻¹⁹ C.',
              'm = 9,11 × 10⁻³¹ kg.',
              'h = 6,63 × 10⁻³⁴ J s.',
            ],
          },
        ],
      },
      {
        numero: 3,
        titulo: 'Exercici 3 — Vibracions i ones',
        bloque: 'Vibracions i ones',
        instrucciones: 'Trieu UNA de les dues opcions (A o B).',
        opciones: [
          {
            opcion: 'A',
            titulo: 'Opció A — Pèndol',
            enunciado:
              'Al taller de l’institut es dissenya un pèndol i es mesura el període T en funció de la longitud L del fil.',
            apartados: [
              {
                letra: 'a',
                puntos: 1.25,
                enunciado:
                  'Ompliu la tercera fila de la taula amb T². Representeu T²(L) i justifiqueu per què els punts estan alineats. Calculeu el pendent del gràfic i, a partir del resultat, la intensitat del camp gravitatori.',
              },
              {
                letra: 'b',
                puntos: 1.25,
                enunciado:
                  'Deixem caure el pèndol d’1,50 kg des d’un angle de 30° respecte a la vertical. Calculeu les energies potencial i cinètica màximes, l’energia mecànica i la velocitat màxima.',
              },
            ],
            datos: [
              'Longitud L: 0,20 m; 0,30 m; 0,50 m; 0,80 m; 1,20 m.',
              'Període T: 0,90 s; 1,08 s; 1,43 s; 1,75 s; 2,20 s.',
            ],
          },
          {
            opcion: 'B',
            titulo: 'Opció B — Refracció en piscina',
            enunciado:
              'L’Alaitz es troba dalt d’un trampolí situat just a sobre la vora de la piscina i observa un objecte al fons amb un angle de 40,0° respecte a la vertical.',
            apartados: [
              {
                letra: 'a',
                puntos: 1.25,
                enunciado:
                  'Calculeu a quina distància x es troba l’objecte respecte a la vora de la piscina.',
              },
              {
                letra: 'b',
                puntos: 1.25,
                enunciado:
                  'A partir de quin angle d’inclinació respecte a la vertical el raig del làser no sortirà de la piscina? A quina velocitat es propagarà el feix làser dins de la piscina? Si la llum té λ = 632,8 nm en l’aire, calculeu la freqüència i la longitud d’ona dins de la piscina.',
              },
            ],
            datos: [
              'c = 3,00 × 10⁸ m s⁻¹.',
              'n_aire = 1,00.',
              'n_aigua = 1,33.',
            ],
          },
        ],
      },
      {
        numero: 4,
        titulo: 'Exercici 4 — Iode 131',
        bloque: 'Física relativista, quàntica, nuclear i de partícules',
        enunciado:
          'L’isòtop del iode 131 (Z = 53) es fa servir en radioteràpia per a tractar determinades malalties de la tiroide. Aquest isòtop es desintegra i dona lloc al xenó 131 estable (Z = 54).',
        apartados: [
          {
            letra: 'a',
            puntos: 1.25,
            enunciado:
              'Escriviu la reacció de desintegració d’aquest isòtop. Completeu la reacció nuclear amb totes les partícules que intervenen i justifiqueu la resposta. De quin tipus de desintegració es tracta?',
          },
          {
            letra: 'b',
            puntos: 1.25,
            enunciado:
              'Si a un pacient se li subministra una pastilla de I-131 amb una activitat de 40,0 × 10⁶ Bq, calculeu la massa de iode 131 que conté i l’activitat al cap d’una setmana.',
          },
        ],
        requiereRevision: true,
      },
    ],
  },

  {
    id: 'fisica-cat-2024-ordinaria',
    comunidad: 'Cataluña',
    asignatura: 'fisica',
    anio: 2024,
    convocatoria: 'ordinaria',
    serie: 'Sèrie 1',
    formato: 'seleccion_4_de_7',
    instrucciones:
      'Responeu a QUATRE dels set problemes següents. En el cas que respongueu a més problemes, només es valoraran els quatre primers. Cada problema val 2,5 punts.',
    ejercicios: [
      {
        numero: 1,
        titulo: 'P1 — Missió BepiColombo i camp gravitatori',
        enunciado:
          'BepiColombo és una missió espacial que té per objectiu l’exploració de Mercuri. La missió va ser llançada l’any 2018 i hi arribarà el 2025. Un cop allà, posarà en òrbita dos satèl·lits al voltant del planeta.',
        apartados: [
          {
            letra: 'a',
            puntos: 1.25,
            enunciado:
              'Considereu un satèl·lit que fa una òrbita circular al voltant de Mercuri. Deduïu l’expressió de la velocitat orbital del satèl·lit en funció del radi orbital i la massa de Mercuri. Calculeu la velocitat orbital del satèl·lit MPO i quantes voltes farà al planeta al cap d’un any terrestre.',
          },
          {
            letra: 'b',
            puntos: 1.25,
            enunciado:
              'A partir de l’expressió general de l’energia mecànica, obtingueu la seva equació per a un satèl·lit en òrbita circular. Determineu el valor màxim que podria tenir la massa del MPO perquè amb l’energia disponible pogués escapar del camp gravitatori de Mercuri.',
          },
        ],
        datos: [
          'G = 6,67 × 10⁻¹¹ N m² kg⁻².',
          'Massa de Mercuri: M_M = 3,285 × 10²³ kg.',
          'Any terrestre = 365,25 dies.',
          'Radi orbital mitjà MPO = 3 360 km.',
          'Energia disponible = 4,5 × 10⁹ J.',
        ],
      },
    ],
  },

  {
    id: 'fisica-cat-2024-extraordinaria',
    comunidad: 'Cataluña',
    asignatura: 'fisica',
    anio: 2024,
    convocatoria: 'extraordinaria',
    serie: 'Sèrie 3',
    formato: 'seleccion_4_de_7',
    instrucciones:
      'Responeu a QUATRE dels set problemes següents. En el cas que respongueu a més problemes, només es valoraran els quatre primers. Cada problema val 2,5 punts.',
    ejercicios: [
      {
        numero: 1,
        titulo: 'P1 — Ressonància orbital',
        enunciado:
          'Els sistemes planetaris tendeixen a formar-se en ressonància. El novembre de 2023 la revista Nature publicava el descobriment de sis planetes que orbitaven en ressonància al voltant de l’estrella HD110067.',
        apartados: [
          {
            letra: 'a',
            puntos: 1.25,
            enunciado:
              'Suposem que aquesta estrella té la massa del Sol i que els planetes tenen òrbites circulars. El sisè planeta té un període de 54,7 dies. Calculeu la distància entre el planeta i l’estrella. Representeu l’estrella i el planeta, dibuixeu el vector d’acceleració normal i calculeu-ne el mòdul.',
          },
          {
            letra: 'b',
            puntos: 1.25,
            enunciado:
              'El cinquè planeta completa 4 òrbites en el mateix temps que el sisè en completa 3. Calculeu el radi de l’òrbita del cinquè planeta i la seva energia mecànica suposant que la seva massa és 2,5 vegades la terrestre.',
          },
        ],
        datos: [
          'G = 6,67 × 10⁻¹¹ N m² kg⁻².',
          'Massa de la Terra: M_T = 5,98 × 10²⁴ kg.',
          'Massa del Sol: M_S = 1,98 × 10³⁰ kg.',
        ],
      },
    ],
  },

  {
    id: 'fisica-cat-2023-ordinaria',
    comunidad: 'Cataluña',
    asignatura: 'fisica',
    anio: 2023,
    convocatoria: 'ordinaria',
    serie: 'Sèrie 1',
    formato: 'seleccion_4_de_7',
    instrucciones:
      'Responeu a QUATRE dels set problemes següents. En el cas que respongueu a més problemes, només es valoraran els quatre primers. Cada problema val 2,5 punts.',
    ejercicios: [
      {
        numero: 1,
        titulo: 'P1 — Satèl·lits de Mart',
        enunciado:
          'Els dos satèl·lits de Mart, Fobos i Deimos, tenen forma irregular, però es poden aproximar a una esfera. El radi orbital mitjà de Fobos al voltant de Mart és de 9 377 km i el seu període de revolució és de 7 hores, 39 minuts i 14 segons.',
        apartados: [
          {
            letra: 'a',
            puntos: 1.25,
            enunciado:
              'Determineu la massa de Mart i la intensitat del camp gravitatori que Mart crea a la seva superfície.',
          },
          {
            letra: 'b',
            puntos: 1.25,
            enunciado:
              'Determineu el període de revolució de Deimos al voltant de Mart i la seva energia mecànica.',
          },
        ],
        datos: [
          'G = 6,67 × 10⁻¹¹ N m² kg⁻².',
          'M_Fobos = 1,10 × 10¹⁶ kg.',
          'M_Deimos = 2,00 × 10¹⁵ kg.',
          'R_Mart = 3 390 km.',
          'Radi orbital mitjà de Deimos = 23 460 km.',
        ],
      },
    ],
  },

  {
    id: 'fisica-cat-2023-extraordinaria',
    comunidad: 'Cataluña',
    asignatura: 'fisica',
    anio: 2023,
    convocatoria: 'extraordinaria',
    serie: 'Sèrie 2',
    formato: 'seleccion_4_de_7',
    instrucciones:
      'Responeu a QUATRE dels set problemes següents. En el cas que respongueu a més problemes, només es valoraran els quatre primers. Cada problema val 2,5 punts.',
    ejercicios: [
      {
        numero: 1,
        titulo: 'P1 — Missió DART',
        enunciado:
          'La NASA va llançar la missió DART amb l’objectiu de canviar l’òrbita de Dimorphos, un petit asteroide que orbita al voltant de Didymos.',
        apartados: [
          {
            letra: 'a',
            puntos: 1.25,
            enunciado:
              'A partir de la llei de la gravitació universal, trobeu l’expressió de la intensitat del camp gravitatori que crea un objecte astronòmic esfèric de massa M i radi R a la seva superfície. Calculeu el camp gravitatori de Didymos i la força gravitatòria mitjana entre Didymos i Dimorphos.',
          },
          {
            letra: 'b',
            puntos: 1.25,
            enunciado:
              'Deduïu l’expressió de la velocitat orbital d’un satèl·lit en funció del radi de l’òrbita. Argumenteu si Dimorphos orbitarà a més velocitat a la nova òrbita o a l’òrbita original.',
          },
        ],
        datos: [
          'G = 6,67 × 10⁻¹¹ N m² kg⁻².',
          'Diàmetre de Didymos = 781 m.',
          'Densitat de Didymos = 2 146 kg m⁻³.',
          'Massa de Dimorphos = 4,42 × 10¹⁰ kg.',
          'Radi orbital mitjà = 1,12 km.',
        ],
        imagenes: ['Esquema de la missió DART.'],
      },
    ],
  },

  {
    id: 'fisica-cat-2022-ordinaria',
    comunidad: 'Cataluña',
    asignatura: 'fisica',
    anio: 2022,
    convocatoria: 'ordinaria',
    serie: 'Sèrie 2',
    formato: 'seleccion_4_de_8',
    instrucciones:
      'Responeu a QUATRE dels vuit problemes següents. En el cas que respongueu a més problemes, només es valoraran els quatre primers. Cada problema val 2,5 punts.',
    ejercicios: [
      {
        numero: 1,
        titulo: 'P1 — Satèl·lit i camp gravitatori',
        enunciado:
          'Un satèl·lit descriu una trajectòria circular de radi R al voltant d’una massa central. El temps que triga a donar-hi una volta sencera és T.',
        apartados: [
          {
            letra: 'a',
            puntos: 1.25,
            enunciado:
              'Deduïu l’expressió per calcular la intensitat del camp gravitatori g creat per la massa central en els punts de l’òrbita del satèl·lit en funció de R i T. Calculeu la intensitat del camp gravitatori als punts de l’òrbita de la Lluna.',
          },
          {
            letra: 'b',
            puntos: 1.25,
            enunciado:
              'Deduïu l’expressió de l’energia cinètica mínima perquè un coet de massa m pugui escapar d’un objecte astronòmic de massa M i radi R. Calculeu quantes vegades és més gran l’energia mínima per escapar de la Terra respecte de la Lluna.',
          },
        ],
        datos: [
          'Distància Terra-Lluna = 384 × 10⁶ m.',
          'Període de la Lluna = 27,3 dies.',
          'M_Terra = 81,3 M_Lluna.',
          'R_Terra = 3,67 R_Lluna.',
        ],
      },
    ],
  },

  {
    id: 'fisica-cat-2022-extraordinaria',
    comunidad: 'Cataluña',
    asignatura: 'fisica',
    anio: 2022,
    convocatoria: 'extraordinaria',
    serie: 'Sèrie 3',
    formato: 'seleccion_4_de_8',
    instrucciones:
      'Responeu a QUATRE dels vuit problemes següents. En el cas que respongueu a més problemes, només es valoraran els quatre primers. Cada problema val 2,5 punts.',
    ejercicios: [
      {
        numero: 1,
        titulo: 'P1 — Nanosatèl·lit',
        enunciado:
          'El març del 2021 es va llançar el primer nanosatèl·lit de la Generalitat de Catalunya a l’espai. Aquests nanosatèl·lits acostumen a orbitar a uns 500 km d’altura respecte de la superfície de la Terra.',
        apartados: [
          {
            letra: 'a',
            puntos: 1.25,
            enunciado:
              'Suposant que l’òrbita és circular, deduïu a partir de la llei de gravitació universal l’expressió de la velocitat orbital en funció del radi orbital. Calculeu també la velocitat i el període orbitals.',
          },
          {
            letra: 'b',
            puntos: 1.25,
            enunciado:
              'Partint de la conservació de l’energia mecànica, deduïu l’expressió de la velocitat de llançament necessària per posar en òrbita un satèl·lit en funció del radi orbital. Calculeu la velocitat necessària per posar-lo a 500 km d’altura.',
          },
        ],
        datos: [
          'G = 6,67 × 10⁻¹¹ N m² kg⁻².',
          'M_Terra = 5,98 × 10²⁴ kg.',
          'R_Terra = 6,37 × 10³ km.',
        ],
      },
    ],
  },

  {
    id: 'fisica-cat-2021-ordinaria',
    comunidad: 'Cataluña',
    asignatura: 'fisica',
    anio: 2021,
    convocatoria: 'ordinaria',
    serie: 'Sèrie 1',
    formato: 'seleccion_4_de_8',
    instrucciones:
      'Responeu a QUATRE dels vuit problemes següents. En el cas que respongueu a més problemes, només es valoraran els quatre primers. Cada problema val 2,5 punts.',
    ejercicios: [
      {
        numero: 1,
        titulo: 'P1 — Exoplanetes i trànsit planetari',
        enunciado:
          'Un dels mètodes emprats per detectar exoplanetes és l’observació del trànsit planetari. El gràfic mostra la variació de lluminositat provocada pel trànsit d’un planeta que descriu una òrbita circular al voltant d’un estel.',
        apartados: [
          {
            letra: 'a',
            puntos: 1.25,
            enunciado:
              'Calculeu el període i el radi de l’òrbita.',
          },
          {
            letra: 'b',
            puntos: 1.25,
            enunciado:
              'Determineu el mòdul de la velocitat i l’acceleració centrípeta del planeta.',
          },
        ],
        datos: ['Radi orbital mitjà de la Terra = 1,00 ua = 1,50 × 10¹¹ m.'],
        imagenes: ['Gràfic de variació de lluminositat del trànsit planetari.'],
      },
    ],
  },

  {
    id: 'fisica-cat-2021-extraordinaria',
    comunidad: 'Cataluña',
    asignatura: 'fisica',
    anio: 2021,
    convocatoria: 'extraordinaria',
    serie: 'Sèrie 2',
    formato: 'seleccion_4_de_8',
    instrucciones:
      'Responeu a QUATRE dels vuit problemes següents. En el cas que respongueu a més problemes, només es valoraran els quatre primers. Cada problema val 2,5 punts.',
    ejercicios: [
      {
        numero: 1,
        titulo: 'P1 — Tercera llei de Kepler',
        enunciado:
          'Gràcies a les dades sobre les posicions dels astres que Tycho Brahe va recollir, Johannes Kepler va poder formular les seves tres lleis.',
        apartados: [
          {
            letra: 'a',
            puntos: 1.25,
            enunciado:
              'Deduïu la tercera llei de Kepler a partir de la segona llei de Newton i de la llei de gravitació universal, suposant que els planetes descriuen moviments circulars uniformes.',
          },
          {
            letra: 'b',
            puntos: 1.25,
            enunciado:
              'A partir de les dades de la taula, determineu la massa del Sol.',
          },
        ],
        datos: [
          'G = 6,67 × 10⁻¹¹ N m² kg⁻².',
          'Mercuri: r = 57,90 × 10⁹ m; T = 0,2408 anys.',
          'Venus: r = 108,2 × 10⁹ m; T = 0,6152 anys.',
          'Terra: r = 149,6 × 10⁹ m; T = 1,000 anys.',
          'Mart: r = 228,0 × 10⁹ m; T = 1,881 anys.',
        ],
      },
    ],
  },
]