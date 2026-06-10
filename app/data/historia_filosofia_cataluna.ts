export type ConvocatoriaCataluna = 'ordinaria' | 'extraordinaria'

export type FormatoHistoriaFilosofiaCataluna =
  | 'tres_ejercicios_opcion_ab'
  | '2025_ej1_ab_ej2_unico_ej3_ab'

export type ApartadoHistoriaFilosofiaCataluna = {
  id: string
  titulo: string
  enunciado: string
  puntos?: number
  limitePalabras?: string
}

export type OpcionHistoriaFilosofiaCataluna = {
  opcion: 'A' | 'B'
  autor?: string
  obra?: string
  texto?: string
  fuente?: string
  apartados: ApartadoHistoriaFilosofiaCataluna[]
}

export type EjercicioHistoriaFilosofiaCataluna = {
  numero: number
  titulo: string
  puntos: number
  instrucciones: string
  opciones?: OpcionHistoriaFilosofiaCataluna[]
  apartados?: ApartadoHistoriaFilosofiaCataluna[]
}

export type ExamenHistoriaFilosofiaCataluna = {
  id: string
  comunidad: 'Cataluña'
  asignatura: 'historia_filosofia'
  anio: number
  convocatoria: ConvocatoriaCataluna
  serie: string
  formato: FormatoHistoriaFilosofiaCataluna
  idioma: 'catalan'
  instrucciones: string
  ejercicios: EjercicioHistoriaFilosofiaCataluna[]
}

const instruccionesClasicas =
  'La prova consta de tres exercicis. En cada exercici heu d’escollir UNA de les dues opcions (A o B). Tingueu en compte que l’exercici 1 consta de tres preguntes.'

const instrucciones2025 =
  'L’examen consta de TRES exercicis obligatoris. En l’exercici 1 heu de triar UNA de les dues opcions (A o B) i respondre a les tres preguntes. L’exercici 2 té una única opció. En l’exercici 3 heu de triar UNA de les dues opcions (A o B), que pot ser diferent de l’opció triada a l’exercici 1.'

function exercici1(
  opcionA: OpcionHistoriaFilosofiaCataluna,
  opcionB: OpcionHistoriaFilosofiaCataluna
): EjercicioHistoriaFilosofiaCataluna {
  return {
    numero: 1,
    titulo: 'Exercici 1 — Comentari de text',
    puntos: 6,
    instrucciones:
      'Trieu UNA de les dues opcions, A o B, i responeu a les tres preguntes de l’opció triada.',
    opciones: [opcionA, opcionB],
  }
}

function exercici2(opcionA: string, opcionB: string): EjercicioHistoriaFilosofiaCataluna {
  return {
    numero: 2,
    titulo: 'Exercici 2 — Comparació filosòfica',
    puntos: 2,
    instrucciones: 'Trieu UNA de les dues opcions següents, A o B.',
    opciones: [
      {
        opcion: 'A',
        apartados: [
          {
            id: '2A',
            titulo: 'Opció A',
            puntos: 2,
            enunciado: opcionA,
          },
        ],
      },
      {
        opcion: 'B',
        apartados: [
          {
            id: '2B',
            titulo: 'Opció B',
            puntos: 2,
            enunciado: opcionB,
          },
        ],
      },
    ],
  }
}

function exercici3(opcionA: string, opcionB: string): EjercicioHistoriaFilosofiaCataluna {
  return {
    numero: 3,
    titulo: 'Exercici 3 — Reflexió argumentada',
    puntos: 2,
    instrucciones: 'Trieu UNA de les dues opcions següents, A o B.',
    opciones: [
      {
        opcion: 'A',
        apartados: [
          {
            id: '3A',
            titulo: 'Opció A',
            puntos: 2,
            enunciado: opcionA,
          },
        ],
      },
      {
        opcion: 'B',
        apartados: [
          {
            id: '3B',
            titulo: 'Opció B',
            puntos: 2,
            enunciado: opcionB,
          },
        ],
      },
    ],
  }
}

function preguntesText(
  preguntaI: string,
  preguntaIIa: string,
  preguntaIIb: string,
  preguntaIII: string
): ApartadoHistoriaFilosofiaCataluna[] {
  return [
    {
      id: 'I',
      titulo: 'Pregunta I',
      puntos: 2,
      limitePalabras: 'Variable según convocatoria',
      enunciado: preguntaI,
    },
    {
      id: 'IIa',
      titulo: 'Pregunta II a',
      puntos: 0.5,
      limitePalabras: 'Entre 5 i 20/30 paraules',
      enunciado: preguntaIIa,
    },
    {
      id: 'IIb',
      titulo: 'Pregunta II b',
      puntos: 0.5,
      limitePalabras: 'Entre 5 i 20/30 paraules',
      enunciado: preguntaIIb,
    },
    {
      id: 'III',
      titulo: 'Pregunta III',
      puntos: 3,
      enunciado: preguntaIII,
    },
  ]
}

export const examenesHistoriaFilosofiaCataluna: ExamenHistoriaFilosofiaCataluna[] = [
  {
    id: 'historia-filosofia-cat-2021-ordinaria',
    comunidad: 'Cataluña',
    asignatura: 'historia_filosofia',
    anio: 2021,
    convocatoria: 'ordinaria',
    serie: 'Sèrie 2',
    formato: 'tres_ejercicios_opcion_ab',
    idioma: 'catalan',
    instrucciones: instruccionesClasicas,
    ejercicios: [
      exercici1(
        {
          opcion: 'A',
          autor: 'David Hume',
          obra: 'Resum del Tractat de la naturalesa humana',
          texto: `L’ànima, en la mesura que la puguem concebre, no és res més que un sistema o una successió de diferents percepcions, de fred i calor, amor i ira, pensaments i sensacions, totes unides, però sense identitat ni simplicitat perfecta. Descartes sostenia que el pensament era l’essència de la ment; no pas aquest o aquell pensament, sinó el pensament en general. Això sembla absolutament inintel·ligible, ja que tot el que existeix és particular; i per tant han de ser les diferents percepcions particulars les que componen la ment. Dic componen la ment, no pas que li pertanyen. La ment no és una substància en la qual existeixen les percepcions de manera inherent. Aquesta noció és tan intel·ligible com la idea cartesiana que el pensament o la percepció en general és l’essència de la ment. No tenim cap idea de substància de cap mena, ja que no tenim cap idea que no derivi d’alguna impressió, i no tenim cap impressió d’una substància, sigui material o espiritual. No coneixem res, llevat de les qualitats i percepcions particulars. Pel que fa a la idea d’un cos, un préssec, per exemple, és tan sols aquell gust, color, figura, grandària, consistència, etc., particulars. Així, la nostra idea d’una ment és només la de les percepcions particulars, sense la noció de cap cosa anomenada substància, sigui simple o composta.`,
          fuente: 'David Hume. Resum del Tractat de la naturalesa humana',
          apartados: preguntesText(
            'Expliqueu breument les idees principals del text i com hi apareixen relacionades.',
            'Expliqueu el significat de «percepcions».',
            'Expliqueu el significat de «essència».',
            'Expliqueu el sentit i la justificació, segons David Hume, de l’afirmació: «la nostra idea d’una ment és només la de les percepcions particulars, sense la noció de cap cosa anomenada substància».'
          ),
        },
        {
          opcion: 'B',
          autor: 'John Locke',
          obra: 'Segon tractat sobre el govern civil',
          texto: `Si els homes designen i autoritzen un poder legislatiu és perquè hi pugui haver unes lleis i unes normes que actuïn com a custòdia i mur protector de les propietats de tots els membres de la comunitat, i que delimitin el poder i moderin el domini de cada membre i cada part de la societat. A ningú no se li acudiria pensar que la voluntat de la societat pugui ser que el poder legislatiu tingui facultat per a destruir allò que hom havia previst que protegís. Sempre que els legisladors intentin d’arrabassar i de destruir la propietat del poble, o de reduir els homes a la condició d’esclaus sota un poder arbitrari, es posen en estat de guerra amb el poble, i aquest resta eximit de tota obediència.`,
          fuente: 'John Locke. Segon tractat sobre el govern civil, capítol xix',
          apartados: preguntesText(
            'Expliqueu breument les idees principals del text i com hi apareixen relacionades.',
            'Expliqueu el significat de «corrupció».',
            'Expliqueu el significat de «poder legislatiu».',
            'Expliqueu el sentit i la justificació, segons John Locke, de l’afirmació sobre el dret del poble a quedar eximit d’obediència quan el legislatiu destrueix la propietat o redueix els homes a esclaus sota un poder arbitrari.'
          ),
        }
      ),
      exercici2(
        'Compareu la concepció de Hume sobre la possibilitat d’obtenir coneixement sobre com és el món que ens envolta amb la concepció sobre aquesta mateixa qüestió d’un altre autor/a destacat de la història de la filosofia occidental.',
        'Compareu la concepció de Locke sobre quin és el millor sistema d’organització política amb la concepció sobre aquesta mateixa qüestió d’un altre autor/a destacat de la història de la filosofia occidental.'
      ),
      exercici3(
        'Expliqueu si esteu d’acord o en desacord amb l’afirmació sobre si, si la ment fos només un conjunt de sensacions, sentiments i pensaments, no podríem ser la mateixa persona que fa uns anys. Responeu d’una manera raonada.',
        'Expliqueu si esteu d’acord o en desacord amb l’afirmació: «S’ha de complir sempre el que diu la llei, encara que sigui injusta; perquè sols és possible la vida en societat si la gent està disposada a complir el que diguin les lleis.»'
      ),
    ],
  },

  {
    id: 'historia-filosofia-cat-2021-extraordinaria',
    comunidad: 'Cataluña',
    asignatura: 'historia_filosofia',
    anio: 2021,
    convocatoria: 'extraordinaria',
    serie: 'Sèrie 1',
    formato: 'tres_ejercicios_opcion_ab',
    idioma: 'catalan',
    instrucciones: instruccionesClasicas,
    ejercicios: [
      exercici1(
        {
          opcion: 'A',
          autor: 'John Stuart Mill',
          obra: 'Utilitarisme',
          texto: `La Utilitat es veu sovint estigmatitzada com una doctrina immoral quan s’interpreta en el sentit de Conveniència. Dir una mentida sovint pot resultar convenient per sortir d’un mal pas, però qualsevol desviació de la veritat té per efecte minar la confiança en les declaracions dels homes. Tanmateix, fins i tot aquesta regla, sagrada com és, admet possibles excepcions; la més important és quan amagar un fet podria evitar a una persona diferent de nosaltres mateixos un gran mal que no mereix. Si el principi d’utilitat és bo per a alguna cosa, ha de ser bo per sospesar aquestes utilitats en conflicte.`,
          fuente: 'John Stuart Mill. Utilitarisme, ii',
          apartados: preguntesText(
            'Expliqueu breument les idees principals del text i com hi apareixen relacionades.',
            'Expliqueu el significat de «desviació de la veritat».',
            'Expliqueu el significat de «felicitat humana».',
            'Expliqueu el sentit i la justificació, segons John Stuart Mill, de l’afirmació: «si el principi d’utilitat és bo per a alguna cosa, ha de ser bo per a sospesar aquestes utilitats en conflicte».'
          ),
        },
        {
          opcion: 'B',
          autor: 'Plató',
          obra: 'La República',
          texto: `Quan cadascuna de les classes, la dels comerciants, la dels auxiliars i la dels guardians, es dedica a la seva pròpia comesa dins de la ciutat i fa allò que li és propi, això és la justícia i el que fa a una ciutat justa. Si provàvem de veure la justícia en qualsevol cosa més gran que la tingui en si, aleshores veuríem més fàcilment què és en un individu concret. L’home just no diferirà en res de la ciutat justa en allò que és la forma essencial de la justícia.`,
          fuente: 'Plató. La República, llibre iv',
          apartados: preguntesText(
            'Expliqueu breument les idees principals del text i com hi apareixen relacionades.',
            'Expliqueu el significat de «coratjosa».',
            'Expliqueu el significat de «ànima».',
            'Expliqueu el sentit i la justificació, segons Plató, de l’afirmació segons la qual l’individu que tingui els mateixos elements a la seva ànima mereixerà els mateixos qualificatius que la ciutat justa.'
          ),
        }
      ),
      exercici2(
        'Compareu la forma com l’utilitarisme de Mill analitzaria si és moralment acceptable robar d’uns grans magatzems un manga amb com s’analitzaria aquest mateix cas des de la concepció ètica d’un altre autor/a destacat.',
        'Compareu la concepció de Plató sobre el paper de la raó en el coneixement amb la concepció sobre aquesta mateixa qüestió d’un altre autor/a destacat.'
      ),
      exercici3(
        'Expliqueu si esteu d’acord o en desacord amb l’afirmació sobre si seria bona idea viure connectat a una màquina del plaer.',
        'Expliqueu si esteu d’acord o en desacord amb l’afirmació: «Haver estudiat filosofia no contribueix de cap manera significativa a fer que una persona pugui ser una bona gestora dels interessos públics o una bona governant.»'
      ),
    ],
  },

  {
    id: 'historia-filosofia-cat-2022-ordinaria',
    comunidad: 'Cataluña',
    asignatura: 'historia_filosofia',
    anio: 2022,
    convocatoria: 'ordinaria',
    serie: 'Sèrie 2',
    formato: 'tres_ejercicios_opcion_ab',
    idioma: 'catalan',
    instrucciones: instruccionesClasicas,
    ejercicios: [
      exercici1(
        {
          opcion: 'A',
          autor: 'Immanuel Kant',
          obra: 'Fonamentació de la metafísica dels costums',
          texto: `Si hi ha d’haver un imperatiu categòric, cal que sigui un principi tal que a partir de la idea d’allò que és necessàriament un fi per a tothom —ja que és un fi en si mateix— constitueixi un principi objectiu de la voluntat, un principi que pugui servir de llei pràctica universal. El fonament d’aquest principi és aquest: la naturalesa racional existeix com a fi en si mateix. L’imperatiu pràctic serà el següent: Actua de tal manera que tractis la humanitat, tant en la teva persona com en la persona de qualsevol altre, sempre al mateix temps com a fi, mai simplement com a mitjà.`,
          fuente: 'Immanuel Kant. Fonamentació de la metafísica dels costums, ii',
          apartados: preguntesText(
            'Expliqueu breument les idees principals del text i com hi apareixen relacionades.',
            'Expliqueu el significat de «imperatiu categòric».',
            'Expliqueu el significat de «llei pràctica universal».',
            'Expliqueu el sentit i la justificació, segons Kant, de l’afirmació: «jo no puc disposar pas de l’home en la meva persona, jo no puc mutilar-lo, danyar-lo o matar-lo».'
          ),
        },
        {
          opcion: 'B',
          autor: 'René Descartes',
          obra: 'Meditacions metafísiques',
          texto: `Tot i que no puc concebre un Déu sense existència, com no puc pensar una muntanya sense vall, del fet que pugui concebre Déu amb existència no sembla que se’n segueixi per això sol que Déu existeix. De tota manera, aquí hi ha un sofisma: del fet que no puc concebre Déu sense existència se’n segueix que l’existència és inseparable de Déu. No soc lliure de concebre un Déu sense existència, és a dir, un ésser sobiranament perfecte sense una perfecció sobirana.`,
          fuente: 'René Descartes. Meditacions metafísiques, v',
          apartados: preguntesText(
            'Expliqueu breument les idees principals del text i com hi apareixen relacionades.',
            'Expliqueu el significat de «necessitat».',
            'Expliqueu el significat de «sofisma».',
            'Expliqueu el sentit i la justificació, segons Descartes, de l’afirmació segons la qual no som lliures de concebre Déu sense existència.'
          ),
        }
      ),
      exercici2(
        'Compareu la concepció de Kant sobre la moral amb la concepció sobre la moral d’un altre autor/a destacat.',
        'Compareu la concepció de Descartes sobre el paper de la raó en la justificació del coneixement amb la concepció d’un altre autor/a destacat.'
      ),
      exercici3(
        'Expliqueu si esteu d’acord o en desacord amb l’afirmació que compara l’esclavitud i la prostitució com a formes de tractar una persona com a mer objecte.',
        'Expliqueu si esteu d’acord o en desacord amb l’argumentació sobre la necessitat d’una primera causa no causada, anomenada Déu.'
      ),
    ],
  },

  {
    id: 'historia-filosofia-cat-2022-extraordinaria',
    comunidad: 'Cataluña',
    asignatura: 'historia_filosofia',
    anio: 2022,
    convocatoria: 'extraordinaria',
    serie: 'Sèrie 3',
    formato: 'tres_ejercicios_opcion_ab',
    idioma: 'catalan',
    instrucciones: instruccionesClasicas,
    ejercicios: [
      exercici1(
        {
          opcion: 'A',
          autor: 'Friedrich Nietzsche',
          obra: 'La gaia ciència',
          texto: `Què diries si un dia o una nit un dimoni s’introduís furtivament en la teva solitud més solitària i et digués: «Aquesta vida, tal com la vius ara i tal com l’has viscuda, hauràs de viure-la encara una altra vegada i encara incomptables vegades més. I en ella no hi haurà res de nou, sinó que cada sofrença, cada plaer, cada pensament, cada sospir, tot allò petit i gran de la teva vida ha de tornar a esdevenir-se per a tu, tot en el mateix ordre i en la mateixa successió.»`,
          fuente: 'Friedrich Nietzsche. La gaia ciència, 341',
          apartados: preguntesText(
            'Expliqueu breument les idees principals del text i com hi apareixen relacionades.',
            'Expliqueu el significat de «rellotge d’arena de l’existència».',
            'Expliqueu el significat de «ets una volva de pols de la pols».',
            'Expliqueu el sentit i la justificació, segons Nietzsche, de la frase sobre voler la vida encara una altra vegada i encara incomptables vegades.'
          ),
        },
        {
          opcion: 'B',
          autor: 'David Hume',
          obra: 'Resum del Tractat de la naturalesa humana',
          texto: `En considerar el moviment transmès per una bola a una altra, no podíem trobar res més que contigüitat, anterioritat en la causa i conjunció constant. Però normalment se suposa que hi ha una connexió necessària entre la causa i l’efecte. Si totes les nostres idees es deriven de les impressions, aquest poder o força ha de manifestar-se als sentits o al sentiment intern. Però l’experiència només ens mostra objectes contigus, successius i constantment conjuntats.`,
          fuente: 'David Hume. Resum del Tractat de la naturalesa humana',
          apartados: preguntesText(
            'Expliqueu breument les idees principals del text i com hi apareixen relacionades.',
            'Expliqueu el significat de «contigüitat».',
            'Expliqueu el significat de «impressions».',
            'Expliqueu el sentit i la justificació, segons Hume, de la frase segons la qual no tenim cap idea de força o energia més enllà de l’hàbit de passar de la causa a l’efecte habitual.'
          ),
        }
      ),
      exercici2(
        'Compareu la concepció de Nietzsche sobre la moral amb la concepció sobre la moral d’un altre autor/a destacat.',
        'Compareu la concepció de Hume sobre la ment amb la concepció sobre la ment d’un altre autor/a destacat.'
      ),
      exercici3(
        'Expliqueu si esteu d’acord o en desacord amb l’afirmació: «Déu ha mort.»',
        'Expliqueu si esteu d’acord o en desacord amb l’afirmació que l’observació de regularitats passades justifica concloure que la natura es comportarà regularment en el futur.'
      ),
    ],
  },

  {
    id: 'historia-filosofia-cat-2023-ordinaria',
    comunidad: 'Cataluña',
    asignatura: 'historia_filosofia',
    anio: 2023,
    convocatoria: 'ordinaria',
    serie: 'Sèrie 1',
    formato: 'tres_ejercicios_opcion_ab',
    idioma: 'catalan',
    instrucciones: instruccionesClasicas,
    ejercicios: [
      exercici1(
        {
          opcion: 'A',
          autor: 'René Descartes',
          obra: 'Meditacions metafísiques',
          texto: `Observo que hi ha una gran diferència entre l’esperit i el cos, perquè el cos, per la seva naturalesa, és sempre divisible, i l’esperit és del tot indivisible. Quan considero el meu esperit, és a dir, a mi mateix en tant que soc només una cosa que pensa, no hi puc distingir cap part, sinó que em concebo com una cosa única i íntegra. En canvi, amb les coses corporals o extenses passa tot el contrari, ja que no n’hi ha cap que no es pugui dividir fàcilment en parts en el pensament.`,
          fuente: 'René Descartes. Meditacions metafísiques, vi',
          apartados: preguntesText(
            'Expliqueu breument les idees principals del text i com hi apareixen relacionades.',
            'Expliqueu el significat de «esperit».',
            'Expliqueu el significat de «una cosa única i íntegra».',
            'Expliqueu el sentit de l’afirmació segons la qual l’esperit o l’ànima de l’home és totalment diferent del cos, i les raons de Descartes per defensar-la.'
          ),
        },
        {
          opcion: 'B',
          autor: 'Plató',
          obra: 'La República',
          texto: `Governar correspon a la part racional, perquè és sàvia i té previsió sobre tota l’ànima, i a la part fogosa li correspondrà ser súbdita i aliada de la part racional. Aquestes dues parts s’imposaran a la part concupiscible. Anomenem coratjós un individu quan la part fogosa es manté ferma en allò que indica la raó. L’anomenarem savi en virtut de la part que governa, i temperat per l’harmonia de les tres parts.`,
          fuente: 'Plató. La República, llibre iv',
          apartados: preguntesText(
            'Expliqueu breument les idees principals del text i com hi apareixen relacionades.',
            'Expliqueu el significat de «ànima».',
            'Expliqueu el significat de «part concupiscible».',
            'Expliqueu el sentit del fragment sobre la justícia en l’ànima i la seva analogia amb la ciutat justa segons Plató.'
          ),
        }
      ),
      exercici2(
        'Compareu la concepció de Descartes sobre la possibilitat d’obtenir coneixement fiable sobre com és el món amb la concepció d’un altre autor/a destacat.',
        'Compareu la concepció de Plató sobre la distinció entre cos i ànima amb la concepció d’un altre autor/a destacat.'
      ),
      exercici3(
        'Expliqueu si esteu d’acord o en desacord amb l’argument segons el qual Déu podria haver creat el món fa trenta minuts amb falses memòries, de manera que no podem assegurar que hàgim estudiat per a l’examen.',
        'Expliqueu si esteu d’acord o en desacord amb l’afirmació que l’acció política ha d’estar sempre guiada per la raó desapassionada i que sentiments com la indignació o la ràbia no tenen mai cap paper positiu.'
      ),
    ],
  },

  {
    id: 'historia-filosofia-cat-2023-extraordinaria',
    comunidad: 'Cataluña',
    asignatura: 'historia_filosofia',
    anio: 2023,
    convocatoria: 'extraordinaria',
    serie: 'Sèrie 2',
    formato: 'tres_ejercicios_opcion_ab',
    idioma: 'catalan',
    instrucciones: instruccionesClasicas,
    ejercicios: [
      exercici1(
        {
          opcion: 'A',
          autor: 'Immanuel Kant',
          obra: 'Fonamentació de la metafísica dels costums',
          texto: `S’ha de poder voler que una màxima de la nostra acció esdevingui una llei universal: aquest és el cànon general del judici moral de la nostra acció. Algunes accions són de tal índole que la seva màxima no es pot ni tan sols pensar, sense contradicció, com a llei natural universal. En altres accions no es troba aquesta impossibilitat intrínseca, però segueix essent impossible voler que la seva màxima sigui elevada a la universalitat d’una llei de la naturalesa, perquè una voluntat com aquesta es contradiria amb ella mateixa.`,
          fuente: 'Immanuel Kant. Fonamentació de la metafísica dels costums, ii',
          apartados: preguntesText(
            'Expliqueu breument les idees principals del text i com hi apareixen relacionades.',
            'Expliqueu el significat de «màxima».',
            'Expliqueu el significat de «sense contradicció».',
            'Expliqueu el sentit i la justificació, segons Kant, de la distinció entre accions contràries al deure estricte i accions contràries al deure ampli.'
          ),
        },
        {
          opcion: 'B',
          autor: 'John Locke',
          obra: 'Segon tractat sobre el govern civil',
          texto: `Els que afirmen que dir al poble que resta eximit d’obediència quan s’atempta il·legalment contra les seves llibertats i propietats és establir els fonaments de la rebel·lió haurien d’afirmar també que els homes honrats no poden plantar cara als lladres ni als pirates. Qualsevol dany ocasionat en aquests casos no és imputable a aquell qui defensa els seus drets, sinó a aquell qui envaeix els del seu veí. La finalitat del govern és el bé de la comunitat.`,
          fuente: 'John Locke. Segon tractat sobre el govern civil, capítol xix',
          apartados: preguntesText(
            'Expliqueu breument les idees principals del text i com hi apareixen relacionades.',
            'Expliqueu el significat de «rebel·lió».',
            'Expliqueu el significat de «opressors».',
            'Expliqueu el sentit i la justificació, segons Locke, de la pregunta retòrica sobre si és millor que el poble estigui exposat als tirans o que pugui enfrontar-s’hi.'
          ),
        }
      ),
      exercici2(
        'Compareu la concepció de Kant sobre què és el que fa que una acció estigui moralment prohibida amb la concepció d’un altre autor/a destacat.',
        'Compareu la concepció de Locke sobre allò que donaria lloc a la creació d’un estat i la legitimació d’un govern amb la concepció d’un altre autor/a destacat.'
      ),
      exercici3(
        'Expliqueu si esteu d’acord o en desacord amb l’argumentació sobre si l’eutanàsia no hauria de ser legal perquè podria donar lloc a abusos i l’Estat ha de protegir les persones vulnerables.',
        'Expliqueu si esteu d’acord o en desacord amb l’afirmació: «La violència sols produeix més violència i, per tant, mai no s’hauria de recórrer a la violència quan es vol intentar resoldre una situació d’injustícia social o política.»'
      ),
    ],
  },

  {
    id: 'historia-filosofia-cat-2024-ordinaria',
    comunidad: 'Cataluña',
    asignatura: 'historia_filosofia',
    anio: 2024,
    convocatoria: 'ordinaria',
    serie: 'Sèrie 1',
    formato: 'tres_ejercicios_opcion_ab',
    idioma: 'catalan',
    instrucciones: instruccionesClasicas,
    ejercicios: [
      exercici1(
        {
          opcion: 'A',
          autor: 'René Descartes',
          obra: 'Meditacions metafísiques',
          texto: `Mentre parlo, algú atansa aquest tros de cera al foc. El sabor es desprèn, l’olor s’esvaeix, canvia de color, perd la forma, augmenta de grandària, es fon i s’escalfa. Subsisteix la mateixa cera després d’aquests canvis? Hem de confessar que subsisteix la mateixa cera. Certament, no pot ser res del que he notat mitjançant els sentits, ja que totes les coses percebudes han canviat i, malgrat tot, continua havent-hi la mateixa cera. La percepció del tros de cera no és una visió, ni un tacte, ni una imaginació, sinó una inspecció de l’esperit.`,
          fuente: 'René Descartes. Meditacions metafísiques, ii',
          apartados: preguntesText(
            'Expliqueu breument les idees principals del text i com hi apareixen relacionades.',
            'Expliqueu el significat de «distintament».',
            'Expliqueu el significat de «esperit».',
            'Expliqueu el sentit i la justificació, segons Descartes, de l’afirmació que la percepció del tros de cera és una inspecció de l’esperit.'
          ),
        },
        {
          opcion: 'B',
          autor: 'John Locke',
          obra: 'Segon tractat sobre el govern civil',
          texto: `Sempre que els legisladors intentin d’arrabassar i de destruir la propietat del poble, o de reduir els homes a la condició d’esclaus sota un poder arbitrari, es posen en estat de guerra amb el poble, i aquest resta eximit de tota obediència. Aquesta doctrina d’un poder en mans del poble per a recuperar la seguretat tot nomenant un nou legislatiu és la millor defensa contra la rebel·lió. Qui usi de nou la força per oposar-se a les lleis fa que torni l’estat de guerra.`,
          fuente: 'John Locke. Segon tractat sobre el govern civil, capítol xix',
          apartados: preguntesText(
            'Expliqueu breument les idees principals del text i com hi apareixen relacionades.',
            'Expliqueu el significat de «rebel».',
            'Expliqueu el significat de «estat de guerra».',
            'Expliqueu el sentit i la justificació, segons Locke, de l’afirmació sobre quan el poble resta eximit d’obediència davant del poder legislatiu.'
          ),
        }
      ),
      exercici2(
        'Compareu el paper que té la idea d’un geni maligne en l’argumentació de Descartes a les Meditacions metafísiques amb el paper que té la idea de Déu en aquesta mateixa obra.',
        'Compareu la concepció de Locke sobre quan una societat és justa o quan un govern està legitimat amb la concepció d’un altre autor/a destacat.'
      ),
      exercici3(
        'Expliqueu si esteu d’acord o en desacord amb l’afirmació que els sentits no permeten afirmar que el gosset de la foto és el mateix gos actual, perquè la seva aparença ha canviat.',
        'Expliqueu si esteu d’acord o en desacord amb l’afirmació que les accions de protesta que alteren la vida quotidiana poden contribuir paradoxalment al bon funcionament de la societat.'
      ),
    ],
  },

  {
    id: 'historia-filosofia-cat-2024-extraordinaria',
    comunidad: 'Cataluña',
    asignatura: 'historia_filosofia',
    anio: 2024,
    convocatoria: 'extraordinaria',
    serie: 'Sèrie 3',
    formato: 'tres_ejercicios_opcion_ab',
    idioma: 'catalan',
    instrucciones: instruccionesClasicas,
    ejercicios: [
      exercici1(
        {
          opcion: 'A',
          autor: 'Immanuel Kant',
          obra: 'Fonamentació de la metafísica dels costums',
          texto: `Pel que fa al deure necessari o estricte envers els altres, aquell qui té al cap la idea de fer una falsa promesa s’adonarà que vol servir-se d’un altre home simplement com a mitjà per a un fi que aquest home no comparteix. Aquest conflicte amb el principi de respectar els altres homes es veu encara més clarament en exemples d’atacs a la llibertat i a la propietat d’altri. El transgressor dels drets dels homes té la intenció de servir-se de la persona dels altres simplement com a mitjà.`,
          fuente: 'Immanuel Kant. Fonamentació de la metafísica dels costums, ii',
          apartados: preguntesText(
            'Expliqueu breument les idees principals del text i com hi apareixen relacionades.',
            'Expliqueu el significat de «deure necessari o estricte».',
            'Expliqueu el significat de «mitjà».',
            'Expliqueu el sentit i la justificació, segons Kant, de l’afirmació que el transgressor dels drets humans tracta els altres simplement com a mitjans.'
          ),
        },
        {
          opcion: 'B',
          autor: 'David Hume',
          obra: 'Resum del Tractat de la naturalesa humana',
          texto: `La nostra experiència del passat no pot ser prova de res de cara al futur, a menys que ja suposem que hi ha semblança entre passat i futur. Estem determinats només pel costum a suposar que el futur serà conforme al passat. Quan veig una bola de billar que es mou en direcció a una altra, la meva ment es mou immediatament per l’hàbit cap a l’efecte acostumat. No hi ha cap argument que em determini a suposar que l’efecte estarà d’acord amb l’experiència passada.`,
          fuente: 'David Hume. Resum del Tractat de la naturalesa humana',
          apartados: preguntesText(
            'Expliqueu breument les idees principals del text i com hi apareixen relacionades.',
            'Expliqueu el significat de «prova».',
            'Expliqueu el significat de «costum».',
            'Expliqueu el sentit i la justificació, segons Hume, de l’afirmació que l’experiència passada no justifica racionalment la previsió del futur.'
          ),
        }
      ),
      exercici2(
        'Compareu la concepció de Kant sobre quan tenim l’obligació de fer una determinada acció amb la concepció d’un altre autor/a destacat.',
        'Compareu la concepció de Hume sobre el jo amb la concepció sobre aquesta mateixa qüestió d’un altre autor/a destacat.'
      ),
      exercici3(
        'Expliqueu si esteu d’acord o en desacord amb l’afirmació que, com que els animals no humans no són éssers racionals, no tenim obligacions morals envers ells.',
        'Expliqueu si esteu d’acord o en desacord amb l’argument que no és possible justificar totes les nostres creences i que, per tant, està bé creure algunes coses sense justificació.'
      ),
    ],
  },

  {
    id: 'historia-filosofia-cat-2025-ordinaria',
    comunidad: 'Cataluña',
    asignatura: 'historia_filosofia',
    anio: 2025,
    convocatoria: 'ordinaria',
    serie: 'Sèrie 1',
    formato: '2025_ej1_ab_ej2_unico_ej3_ab',
    idioma: 'catalan',
    instrucciones: instrucciones2025,
    ejercicios: [
      exercici1(
        {
          opcion: 'A',
          autor: 'Martha C. Nussbaum',
          obra: 'Crear capacitats',
          texto: `L’educació és un àmbit en què és legítim que es relaxi l’habitual deferència a la llibertat d’elecció: aquí, els governs faran bé d’exigir que els infants tinguin certs funcionaments, i no només capacitats. Aquest cas és diferent quan estem pensant en infants, els quals tenen les capacitats de lliure elecció encara immadures i són susceptibles de sucumbir a les pressions dels pares perquè treballin en lloc d’estudiar. L’educació dona accés a un ampli espectre de capacitats futures i això justifica fer-la obligatòria durant la infància. En el cas de l’educació d’adults, l’enfocament correcte seria recórrer a la persuasió.`,
          fuente: 'Martha C. Nussbaum. Crear capacitats, capítol 8',
          apartados: preguntesText(
            'Feu un breu resum del text, centrant-vos en les idees principals i en la relació entre aquestes idees.',
            'Expliqueu el significat de «funcionaments».',
            'Expliqueu el significat de «persuasió».',
            'Expliqueu el sentit i la justificació, segons Nussbaum, de l’afirmació que en educació és legítim relaxar la llibertat d’elecció i exigir als infants certs funcionaments, no només capacitats.'
          ),
        },
        {
          opcion: 'B',
          autor: 'René Descartes',
          obra: 'Meditacions metafísiques',
          texto: `Tot i que la sequedat de la gola no sempre ve del fet que beure és necessari per a la salut del cos, és millor que ens enganyi en aquesta circumstància que no pas que ens enganyés sempre. Sé que allò que els meus sentits m’indiquen sobre el que és bo o nociu per al cos és més sovint veritat que no pas fals; puc examinar una mateixa cosa amb molts sentits, i puc utilitzar la memòria i l’enteniment. Del fet que Déu no és enganyador, se’n segueix necessàriament que jo en això tampoc no m’enganyo.`,
          fuente: 'René Descartes. Meditacions metafísiques, vi',
          apartados: preguntesText(
            'Feu un breu resum del text, centrant-vos en les idees principals i en la relació entre aquestes idees.',
            'Expliqueu el significat de «falsedat».',
            'Expliqueu el significat de «se’n segueix necessàriament».',
            'Expliqueu el sentit i la justificació, segons Descartes, de l’afirmació que no hem de dubtar de la veritat del que indiquen els sentits, la memòria i l’enteniment quan no entren en conflicte.'
          ),
        }
      ),
      {
        numero: 2,
        titulo: 'Exercici 2 — Aplicació de dos autors',
        puntos: 2,
        instrucciones: 'Exercici amb una única opció.',
        apartados: [
          {
            id: '2',
            titulo: 'Exercici 2',
            puntos: 2,
            enunciado:
              'Considereu el punt de vista segons el qual una persona de vint anys amb recursos suficients podria dedicar tot el dia a dormir, prendre el sol, anar de festa i mirar vídeos intranscendents sense impediment moral. Analitzeu com s’avaluaria aquest punt de vista des de la perspectiva de dos autors/es destacats de la història de la filosofia occidental. Expliqueu primer un autor, després l’altre, i indiqueu breument el principal punt de semblança o contrast.',
          },
        ],
      },
      exercici3(
        'Considereu l’afirmació: «És millor ser Sòcrates insatisfet que un ximple satisfet.» Indiqueu si hi esteu d’acord o en desacord i justifiqueu la resposta.',
        'Considereu les afirmacions sobre si la societat no hauria d’obligar motoristes, ciclistes o conductors de patinets a portar casc. Indiqueu si hi esteu d’acord o en desacord i justifiqueu la resposta.'
      ),
    ],
  },

  {
    id: 'historia-filosofia-cat-2025-extraordinaria',
    comunidad: 'Cataluña',
    asignatura: 'historia_filosofia',
    anio: 2025,
    convocatoria: 'extraordinaria',
    serie: 'Sèrie 3',
    formato: '2025_ej1_ab_ej2_unico_ej3_ab',
    idioma: 'catalan',
    instrucciones: instrucciones2025,
    ejercicios: [
      exercici1(
        {
          opcion: 'A',
          autor: 'Friedrich Nietzsche',
          obra: 'Més enllà del bé i del mal',
          texto: `La mirada de l’esclau és poc favorable a les virtuts dels poderosos: s’hi mostra escèptic i desconfiat, i sent una malfiança subtil contra tot allò que s’honora com a «bo» en aquelles virtuts. Com a contrapunt es destaquen les qualitats que alleugen la condició dels afligits: compassió, ajuda, tendresa del cor, paciència, humilitat i afabilitat. En la moral de l’esclau, el «malvat» fa por; en la moral dels senyors és precisament el «bo» qui desperta la por. Allà on la moral de l’esclau domina, la llengua tendeix a acostar les paraules «bo» i «ximple».`,
          fuente: 'Friedrich Nietzsche. Més enllà del bé i del mal, part ix',
          apartados: preguntesText(
            'Feu un breu resum del text, centrant-vos en les idees principals i en la relació entre aquestes idees.',
            'Expliqueu el significat de «compassió».',
            'Expliqueu el significat de «acostar les paraules».',
            'Expliqueu el sentit i la justificació, segons Nietzsche, de l’afirmació: «En la moral de l’esclau, el “malvat” fa por; en la moral dels senyors és precisament el “bo” qui desperta la por».'
          ),
        },
        {
          opcion: 'B',
          autor: 'René Descartes',
          obra: 'Meditacions metafísiques',
          texto: `Què soc jo, ara que suposo que hi ha algú extremament poderós, maliciós i astut, que dedica totes les seves forces a enganyar-me? No és necessari que m’aturi a enumerar les coses corporals. Passem als atributs de l’ànima. Nodrir-me i caminar no poden pertànyer-me si no tinc cos. Percebre amb els sentits tampoc no és possible sense cos. Un altre és pensar. I aquí sí que trobo que el pensament és un atribut que em pertany: és l’únic que no es pot separar de mi. Jo soc, jo existeixo. No soc, parlant amb propietat, sinó una cosa que pensa.`,
          fuente: 'René Descartes. Meditacions metafísiques, ii',
          apartados: preguntesText(
            'Feu un breu resum del text, centrant-vos en les idees principals i en la relació entre aquestes idees.',
            'Expliqueu el significat de «necessàriament».',
            'Expliqueu el significat de «suposició».',
            'Expliqueu el sentit i la justificació, segons Descartes, de l’afirmació: «No soc de cap manera aquesta agrupació de membres que anomenem cos humà».'
          ),
        }
      ),
      {
        numero: 2,
        titulo: 'Exercici 2 — Aplicació de dos autors',
        puntos: 2,
        instrucciones: 'Exercici amb una única opció.',
        apartados: [
          {
            id: '2',
            titulo: 'Exercici 2',
            puntos: 2,
            enunciado:
              'Considereu el punt de vista segons el qual, per mantenir el benestar i la competitivitat europea, l’Estat podria requerir a joves amb capacitat que estudiïn enginyeries o ciències aplicades i treballin en aquests camps encara que preferissin una altra activitat. Analitzeu com s’avaluaria aquest punt de vista des de la perspectiva de dos autors/es destacats de la història de la filosofia occidental. Expliqueu primer un autor, després l’altre, i indiqueu breument el principal punt de semblança o contrast.',
          },
        ],
      },
      exercici3(
        'Considereu l’argumentació segons la qual, com que la llibertat és valuosa, no s’hauria d’obligar nens i adolescents a anar a l’escola si no volen. Indiqueu si hi esteu d’acord o en desacord i justifiqueu la resposta.',
        'Considereu l’afirmació: «La veritat està sobrevalorada. Per actuar moralment i políticament, el principal és actuar amb bones intencions, altruisme i ganes de contribuir al bé comú.» Indiqueu si hi esteu d’acord o en desacord i justifiqueu la resposta.'
      ),
    ],
  },
]