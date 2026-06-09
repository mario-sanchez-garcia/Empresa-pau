export type ConvocatoriaCataluna = 'ordinaria' | 'extraordinaria'

export type FormatoQuimicaCataluna =
  | 'seleccion_4_de_7'
  | '2025_cuatro_ejercicios'

export type ApartadoCataluna = {
  letra: string
  enunciado: string
  puntos?: number
}

export type EjercicioQuimicaCataluna = {
  numero: number
  titulo: string
  enunciado?: string
  apartados: ApartadoCataluna[]
  datos?: string[]
  instrucciones?: string
  imagenes?: string[]
  requiereRevision?: boolean
}

export type ExamenQuimicaCataluna = {
  id: string
  comunidad: 'Cataluña'
  asignatura: 'quimica'
  anio: number
  convocatoria: ConvocatoriaCataluna
  serie: string
  formato: FormatoQuimicaCataluna
  instrucciones: string
  ejercicios: EjercicioQuimicaCataluna[]
}

export const examenesQuimicaCataluna: ExamenQuimicaCataluna[] = [
  {
    id: 'quimica-cat-2025-ordinaria',
    comunidad: 'Cataluña',
    asignatura: 'quimica',
    anio: 2025,
    convocatoria: 'ordinaria',
    serie: 'Sèrie 1',
    formato: '2025_cuatro_ejercicios',
    instrucciones:
      'L’examen consta de QUATRE exercicis obligatoris. Cada exercici val 2,5 punts. Feu els exercicis 1, 2 i 3, i responeu a TOTES les qüestions que s’hi plantegen. A l’exercici 4, responeu només DUES de les quatre qüestions plantejades.',
    ejercicios: [
      {
        numero: 1,
        titulo: 'Exercici 1 — Halògens i metalls alcalins',
        enunciado:
          'Els halògens són els elements que presenten la configuració electrònica de la capa de valència ns² np⁵ i es troben a la natura formant molècules diatòmiques. El mot halogen prové del grec i significa ‘que forma sals’. D’altra banda, els metalls alcalins són els elements que presenten la configuració electrònica de la capa de valència ns¹.',
        apartados: [
          {
            letra: 'a',
            puntos: 1.25,
            enunciado:
              'Expliqueu per què, a temperatura ambient, el F₂ és un gas, el Br₂ és un líquid i el I₂ és un sòlid. Raoneu per què aquests tres elements formen molècules diatòmiques i és difícil trobar-los en forma d’àtoms aïllats a la natura. Quin tipus d’enllaç s’estableix entre un halogen i un metall alcalí? Justifiqueu la resposta i poseu un exemple d’un compost amb aquest tipus d’enllaç.',
          },
          {
            letra: 'b',
            puntos: 1.25,
            enunciado:
              'Els valors de les taules de sota corresponen als radis atòmics i a les energies d’ionització de tres elements: liti, fluor i sodi. Escriviu les configuracions electròniques de cada element. Assigneu a cada element el radi i l’energia d’ionització que li corresponen. Raoneu la resposta segons el model atòmic de càrregues elèctriques. Calculeu si un fotó de llum blava de λ = 420 nm seria capaç d’ionitzar l’àtom que té una energia d’ionització de 520,2 kJ mol⁻¹.',
          },
        ],
        datos: [
          'Radi atòmic: 1,82 Å; 0,42 Å; 2,27 Å.',
          'Energia d’ionització: 1 681,0 kJ mol⁻¹; 496,0 kJ mol⁻¹; 520,2 kJ mol⁻¹.',
          'Nombres atòmics: Z(Li) = 3; Z(F) = 9; Z(Na) = 11; Z(Br) = 35; Z(I) = 53.',
          'Nombre d’Avogadro: N_A = 6,02 × 10²³ mol⁻¹.',
          'Velocitat de la llum en el buit: c = 3 × 10⁸ m s⁻¹.',
          'Constant de Planck: h = 6,63 × 10⁻³⁴ J s.',
          '1 nm = 10⁻⁹ m.',
        ],
      },
      {
        numero: 2,
        titulo: 'Exercici 2 — Amoníac verd i equilibri químic',
        enunciado:
          'L’amoníac verd no s’obté a partir de les plantes. Per a produir-lo cal aconseguir primer hidrogen verd mitjançant un procés d’electròlisi de l’aigua amb energia elèctrica generada a partir de fonts renovables. Posteriorment, l’hidrogen reacciona amb nitrogen atmosfèric a través del procés de Haber-Bosch.',
        apartados: [
          {
            letra: 'a',
            puntos: 1.25,
            enunciado:
              'En un reactor d’acer d’una planta pilot s’introdueix una barreja de nitrogen atmosfèric i hidrogen verd i s’escalfa a 1 000 K, fins que s’assoleix l’equilibri: N₂(g) + 3 H₂(g) ⇄ 2 NH₃(g), ΔH < 0. S’analitza el contingut de la mescla. Els resultats obtinguts són: [N₂] = 0,142 mol L⁻¹, [H₂] = 1,84 mol L⁻¹, [NH₃] = 0,36 mol L⁻¹. Escriviu l’expressió de la constant d’equilibri en concentracions Kc i calculeu el seu valor a 1 000 K. Calculeu també el valor de Kp a 1 000 K.',
          },
          {
            letra: 'b',
            puntos: 1.25,
            enunciado:
              'Responeu raonadament: per a obtenir un major rendiment de la reacció, és millor dur a terme la reacció a pressions altes o baixes? El rendiment augmenta a temperatures altes o baixes? Segons el model cinètic de col·lisions, la reacció es produiria a més velocitat a temperatures altes o baixes?',
          },
        ],
        datos: ['Constant universal dels gasos ideals: R = 0,082 atm L K⁻¹ mol⁻¹.'],
      },
      {
        numero: 3,
        titulo: 'Exercici 3 — Àcid salicílic i valoració àcid-base',
        enunciado:
          'L’àcid salicílic o àcid 2-hidroxibenzoic (C₆H₄OHCOOH) és un àcid orgànic monopròtic present a l’escorça del salze. A les farmàcies s’utilitza per a preparar cremes per les seves propietats exfoliants i hidratants. Perquè l’exfoliació sigui efectiva la crema ha de tenir un pH entre 3,0 i 4,0. En una farmàcia estan fent una crema receptada per un dermatòleg en la qual hi ha 0,1 grams d’aquest àcid per cada 100 grams de crema.',
        apartados: [
          {
            letra: 'a',
            puntos: 1.25,
            enunciado:
              'Justifiqueu si aquesta crema tindrà un pH òptim per a actuar com a exfoliant. Indiqueu què representen els pictogrames de l’àcid salicílic i de quins perills ens alerten.',
          },
          {
            letra: 'b',
            puntos: 1.25,
            enunciado:
              'Escriviu la reacció de valoració de l’àcid salicílic amb l’hidròxid de sodi. Justifiqueu qualitativament, amb les reaccions d’hidròlisi necessàries, si el pH en el punt d’equivalència és àcid, bàsic o neutre. Raoneu quin dels tres gràfics següents representa la corba de valoració que s’obté.',
          },
        ],
        datos: [
          'Densitat de la crema: 1 g mL⁻¹.',
          'Massa molar de l’àcid salicílic (C₆H₄OHCOOH) = 138,12 g mol⁻¹.',
          'Ka (C₆H₄OHCOOH) = 1,07 × 10⁻³.',
        ],
        imagenes: ['Pictogrames de perill i gràfics A, B i C de valoració.'],
      },
      {
        numero: 4,
        titulo: 'Exercici 4 — Cloroetè, PVC i química orgànica',
        instrucciones:
          'Responeu només a DUES de les quatre qüestions plantejades (a, b, c i d).',
        enunciado:
          'El cloroetè (CH₂=CHCl), també anomenat clorur de vinil, figura entre els compostos químics més produïts arreu del món perquè és el monòmer a partir del qual s’obté el clorur de polivinil (PVC).',
        apartados: [
          {
            letra: 'a',
            puntos: 1.25,
            enunciado:
              'Expliqueu a partir de quin tipus de reacció de polimerització s’obté el PVC. Formuleu tots els isòmers del dicloroetè i el tricloroetà i digueu quin tipus d’isomeria presenten.',
          },
          {
            letra: 'b',
            puntos: 1.25,
            enunciado:
              'Calculeu o raoneu les qüestions associades a l’obtenció del clorur de vinil i als enllaços implicats, segons les dades d’entalpia de formació i entalpia d’enllaç proporcionades.',
          },
          {
            letra: 'c',
            puntos: 1.25,
            enunciado:
              'Raoneu les qüestions de geometria molecular, polaritat o propietats associades als compostos orgànics indicats en l’enunciat.',
          },
          {
            letra: 'd',
            puntos: 1.25,
            enunciado:
              'Completeu l’apartat d segons el PDF original. Aquest apartat requiere revisión visual porque el OCR quedó truncado.',
          },
        ],
        datos: [
          'CH≡CH(g) + HCl(g) → CH₂=CHCl(g).',
          'CH₂=CHCl(g) + Cl₂(g) → CH₂Cl—CHCl₂(l).',
          'ΔHf°: CH≡CH(g) = 226,9 kJ mol⁻¹; HCl(g) = –92,3 kJ mol⁻¹; CH₂=CHCl(g) = –37,26 kJ mol⁻¹.',
          'Entalpies d’enllaç: C—C = 348; C—H = 412; C=C = 608; Cl—Cl = 242; C—Cl = 328 kJ mol⁻¹.',
          'R = 0,082 atm L K⁻¹ mol⁻¹; R = 8,314 J K⁻¹ mol⁻¹.',
          'Z(H) = 1; Z(C) = 6; Z(Cl) = 17.',
          'Electronegativitat: H = 2,2; C = 2,5; Cl = 3,2.',
        ],
        requiereRevision: true,
      },
    ],
  },

  {
    id: 'quimica-cat-2025-extraordinaria',
    comunidad: 'Cataluña',
    asignatura: 'quimica',
    anio: 2025,
    convocatoria: 'extraordinaria',
    serie: 'Sèrie 3',
    formato: '2025_cuatro_ejercicios',
    instrucciones:
      'L’examen consta de QUATRE exercicis obligatoris. Cada exercici val 2,5 punts. Feu els exercicis 1, 2 i 3, i responeu a TOTES les qüestions que s’hi plantegen. A l’exercici 4, responeu només DUES de les quatre qüestions plantejades.',
    ejercicios: [
      {
        numero: 1,
        titulo: 'Exercici 1 — Òxids de nitrogen i equilibri químic',
        enunciado:
          'Una font important de contaminació atmosfèrica causada pel trànsit a les ciutats és la formació d’òxids de nitrogen. El monòxid de nitrogen s’origina per la combustió del nitrogen de l’aire a elevades temperatures en els motors dels vehicles. Es produeix mitjançant la reacció: N₂(g) + O₂(g) ⇄ 2 NO(g). La constant d’equilibri en concentracions Kc d’aquesta reacció és 1,0 × 10⁻³⁰ a 298 K, però a 1 100 K és 1,0 × 10⁻⁵.',
        apartados: [
          {
            letra: 'a',
            puntos: 1.25,
            enunciado:
              'Si aquesta reacció es duu a terme dins un recipient tancat que té un volum fix de 500 cm³, a 1 100 K, i en el qual s’han introduït 0,5 mol de nitrogen i 0,5 mol d’oxigen, quines seran les concentracions dels tres gasos una vegada assolit l’equilibri?',
          },
          {
            letra: 'b',
            puntos: 1.25,
            enunciado:
              'Justifiqueu si la reacció és endotèrmica o exotèrmica i raoneu si el rendiment de la reacció és més gran a temperatures altes o baixes. Raoneu com afecta a l’equilibri i al rendiment de la reacció un augment de la pressió a temperatura constant dins el recipient. Calculeu la constant d’equilibri Kp a 1 100 K.',
          },
        ],
        datos: ['R = 0,082 atm L K⁻¹ mol⁻¹.'],
      },
      {
        numero: 2,
        titulo: 'Exercici 2 — Enllaç químic, Lewis i energia d’ionització',
        enunciado:
          'La determinació de propietats atòmiques i la modelització de les estructures formades per interacció entre àtoms han estat essencials en la construcció del coneixement de la química. L’enllaç covalent i l’enllaç iònic són models útils per interpretar les propietats de les substàncies.',
        apartados: [
          {
            letra: 'a',
            puntos: 1.25,
            enunciado:
              'Expliqueu a quin tipus d’enllaç corresponen les imatges A i B i justifiqueu la geometria o estructura d’aquests compostos i quin tipus d’enllaç hi predomina, utilitzant les dades d’electronegativitat. Representeu les estructures de Lewis del BeCl₂ i del H₂O. Justifiqueu, mitjançant la teoria RPECV, les geometries del BeCl₂ i de l’aigua, i raoneu si es tracta de molècules polars o apolars.',
          },
          {
            letra: 'b',
            puntos: 1.25,
            enunciado:
              'Els valors de les primeres energies d’ionització del liti i del beril·li són, respectivament, 520,3 i 899,5 kJ mol⁻¹. Raoneu per què les energies d’ionització tenen signe positiu. Indiqueu a quin grup i període pertany cadascun dels elements. Expliqueu, a partir de la seva configuració electrònica i el model atòmic de càrregues elèctriques, per què és més gran l’energia d’ionització del beril·li que la del liti.',
          },
        ],
        datos: [
          'Z(H) = 1; Z(Li) = 3; Z(Be) = 4; Z(O) = 8; Z(Cl) = 17.',
          'Electronegativitat: H = 2,1; Li = 1,0; Be = 1,5; O = 3,5; Cl = 3,0.',
        ],
        imagenes: ['Imatge A: molècula de BeCl₂. Imatge B: xarxa tridimensional de LiCl.'],
      },
      {
        numero: 3,
        titulo: 'Exercici 3 — Àcid metanoic i valoració',
        enunciado:
          'L’àcid metanoic (HCOOH), anomenat habitualment àcid fòrmic, és un àcid carboxílic monopròtic d’un sol àtom de carboni i té una constant d’acidesa Ka a 25 °C d’1,77 × 10⁻⁴.',
        apartados: [
          {
            letra: 'a',
            puntos: 1.25,
            enunciado:
              'Calculeu el pH d’una solució 0,20 m d’àcid metanoic i escriviu la reacció de valoració de l’àcid metanoic amb hidròxid de sodi. Calculeu també el volum de solució d’hidròxid de sodi 0,15 m que serà necessari per a valorar 25 mL de la solució de l’àcid metanoic.',
          },
          {
            letra: 'b',
            puntos: 1.25,
            enunciado:
              'Raoneu qualitativament si el pH en el punt d’equivalència de la valoració anterior serà àcid, bàsic o neutre, i digueu quin dels indicadors de la taula es pot utilitzar per a detectar el punt final d’aquesta valoració. Justifiqueu la resposta. Expliqueu com duríeu a terme en el laboratori aquest procediment, i indiqueu quin material i quines substàncies utilitzaríeu.',
          },
        ],
        datos: [
          'Ka(HCOOH) = 1,77 × 10⁻⁴.',
          'Indicadors: verd de bromocresol, blau de bromotimol i fenolftaleïna.',
        ],
      },
      {
        numero: 4,
        titulo: 'Exercici 4 — Etanol i èter dimetílic',
        instrucciones:
          'Responeu només a DUES de les quatre qüestions plantejades (a, b, c i d).',
        enunciado:
          'L’etanol i l’èter dimetílic són dos compostos orgànics amb la mateixa fórmula molecular C₂H₆O, però amb estructures i propietats químiques molt diferents.',
        apartados: [
          {
            letra: 'a',
            puntos: 1.25,
            enunciado:
              'Calculeu l’entalpia de combustió d’1 mol d’etanol utilitzant les energies d’enllaç. Raoneu quin dels dos combustibles, etanol o èter dimetílic, resulta més eficient des del punt de vista energètic per unitat de massa, en condicions estàndard a 25 °C.',
          },
          {
            letra: 'b',
            puntos: 1.25,
            enunciado:
              'Raoneu si l’etanol i l’èter dimetílic presenten algun tipus d’isomeria. Expliqueu de quina manera la seva estructura afecta la seva temperatura d’ebullició, i raoneu quin dels dos compostos tindrà la temperatura d’ebullició més elevada.',
          },
          {
            letra: 'c',
            puntos: 1.25,
            enunciado:
              'L’espectre d’IR correspon a una de les dues substàncies. Indiqueu quins són els enllaços característics de cada substància. Raoneu quins senyals de l’espectre serien comuns en les dues substàncies, i quin o quins senyals permeten identificar la substància.',
          },
          {
            letra: 'd',
            puntos: 1.25,
            enunciado:
              'Completeu l’apartat d segons el PDF original. Aquest apartat requiere revisión visual porque el OCR quedó truncado.',
          },
        ],
        datos: [
          'Fórmula molecular: C₂H₆O.',
          'Entalpia de combustió d’1 mol d’èter dimetílic: –1 292 kJ mol⁻¹.',
        ],
        imagenes: ['Espectre IR de la pàgina següent del PDF original.'],
        requiereRevision: true,
      },
    ],
  },

  {
    id: 'quimica-cat-2024-ordinaria',
    comunidad: 'Cataluña',
    asignatura: 'quimica',
    anio: 2024,
    convocatoria: 'ordinaria',
    serie: 'Sèrie 1',
    formato: 'seleccion_4_de_7',
    instrucciones:
      'Responeu a QUATRE de les set qüestions següents. En el cas que respongueu a més qüestions, només es valoraran les quatre primeres. Cada qüestió val 2,5 punts.',
    ejercicios: [
      {
        numero: 1,
        titulo: 'Qüestió 1 — Taula periòdica i energia d’ionització',
        enunciado:
          'La taula periòdica ordena els elements químics de nombre atòmic més petit a més gran. S’organitza en set períodes, divuit grups i quatre blocs, segons les configuracions electròniques.',
        apartados: [
          {
            letra: 'a',
            puntos: 1.25,
            enunciado:
              'Se sap que dos elements, A i B, tenen els nombres atòmics Z = 11 i Z = 35. Escriviu les configuracions electròniques dels elements i determineu el grup, el període i el bloc. Sabem que A i B formen el compost iònic AB i que A₂ és un compost covalent. Quin nombre atòmic correspon a A i quin a B? Justifiqueu la resposta.',
          },
          {
            letra: 'b',
            puntos: 1.25,
            enunciado:
              'Definiu el terme energia d’ionització d’un element i raoneu quin signe té. Sabent que l’energia d’ionització de l’hidrogen és de 1 318 kJ mol⁻¹, es podria ionitzar l’àtom d’hidrogen amb una radiació de longitud d’ona de 6 × 10⁻¹¹ m?',
          },
        ],
        datos: [
          'N_A = 6,02 × 10²³ mol⁻¹.',
          'c = 3,0 × 10⁸ m s⁻¹.',
          'h = 6,63 × 10⁻³⁴ J s.',
        ],
      },
    ],
  },

  {
    id: 'quimica-cat-2024-extraordinaria',
    comunidad: 'Cataluña',
    asignatura: 'quimica',
    anio: 2024,
    convocatoria: 'extraordinaria',
    serie: 'Sèrie 3',
    formato: 'seleccion_4_de_7',
    instrucciones:
      'Responeu a QUATRE de les set qüestions següents. En el cas que respongueu a més qüestions, només es valoraran les quatre primeres. Cada qüestió val 2,5 punts.',
    ejercicios: [
      {
        numero: 1,
        titulo: 'Qüestió 1 — Àcid làctic',
        enunciado:
          'L’àcid làctic (CH₃—CH(OH)—COOH) o àcid 2-hidroxipropanoic és un sòlid de color blanc. Es tracta d’un àcid orgànic monopròtic que es troba a la llet i als productes làctics. La seva constant d’acidesa a 25 °C és Ka = 1,38 × 10⁻⁴.',
        apartados: [
          {
            letra: 'a',
            puntos: 1.25,
            enunciado:
              'Escriviu les reaccions de l’àcid làctic amb l’aigua i de l’ió lactat amb aigua. Indiqueu, per a cada reacció, segons la teoria de Brønsted i Lowry, quines espècies actuen d’àcid i base, i quins són els respectius àcids i bases conjugats. Raoneu si el pH d’una solució de lactat de sodi és àcid, bàsic o neutre.',
          },
          {
            letra: 'b',
            puntos: 1.25,
            enunciado:
              'Una solució aquosa d’àcid làctic té un pH = 2,8. Calculeu quina és la seva concentració i quants grams d’àcid làctic es necessitarien per a preparar en el laboratori 1,0 L de solució. Determineu quin és el material de vidre imprescindible per preparar una solució de concentració exactament coneguda.',
          },
        ],
        datos: [
          'Ka = 1,38 × 10⁻⁴.',
          'Masses atòmiques relatives: H = 1,0; C = 12,0; O = 16,0.',
        ],
      },
    ],
  },

  {
    id: 'quimica-cat-2023-ordinaria',
    comunidad: 'Cataluña',
    asignatura: 'quimica',
    anio: 2023,
    convocatoria: 'ordinaria',
    serie: 'Sèrie 1',
    formato: 'seleccion_4_de_7',
    instrucciones:
      'Responeu a QUATRE de les set qüestions següents. En el cas que respongueu a més qüestions, només es valoraran les quatre primeres. Cada qüestió val 2,5 punts.',
    ejercicios: [
      {
        numero: 1,
        titulo: 'Qüestió 1 — Hidrazina i combustibles',
        enunciado:
          'La hidrazina (N₂H₄) i la dimetilhidrazina (N₂H₂(CH₃)₂) són combustibles líquids. La hidrazina reacciona amb l’oxigen i s’obté H₂O(g) i N₂(g). La dimetilhidrazina reacciona amb l’oxigen i s’obté H₂O(g), N₂(g) i CO₂(g).',
        apartados: [
          {
            letra: 'a',
            puntos: 1.25,
            enunciado:
              'Escriviu les dues reaccions de combustió. Calculeu l’entalpia estàndard de reacció de cada combustible a 298 K. Si us demanessin consell en l’elecció d’un dels dos combustibles per a fer senyals des d’un vaixell, considerant que la bodega està gairebé al límit del pes permès, quin dels dos aconsellaríeu? Justifiqueu la resposta.',
          },
          {
            letra: 'b',
            puntos: 1.25,
            enunciado:
              'Representeu el diagrama entàlpic del procés de combustió de la hidrazina. A l’etiqueta d’un envàs que conté hidrazina, s’observen dos pictogrames. Expliqueu què volen dir aquests pictogrames i de quins perills ens alerten.',
          },
        ],
        datos: [
          'Masses atòmiques relatives: H = 1,0; C = 12; N = 14,0; O = 16,0.',
          'ΔHf°: N₂H₄(l) = 50,6 kJ mol⁻¹; N₂H₂(CH₃)₂(l) = 42,0 kJ mol⁻¹; H₂O(g) = –241,8 kJ mol⁻¹; CO₂(g) = –393,5 kJ mol⁻¹.',
        ],
        imagenes: ['Pictogrames de perill del recipient d’hidrazina.'],
      },
    ],
  },

  {
    id: 'quimica-cat-2023-extraordinaria',
    comunidad: 'Cataluña',
    asignatura: 'quimica',
    anio: 2023,
    convocatoria: 'extraordinaria',
    serie: 'Sèrie 2',
    formato: 'seleccion_4_de_7',
    instrucciones:
      'Responeu a QUATRE de les set qüestions següents. En el cas que respongueu a més qüestions, només es valoraran les quatre primeres. Cada qüestió val 2,5 punts.',
    ejercicios: [
      {
        numero: 1,
        titulo: 'Qüestió 1 — Sodi i energia d’ionització',
        enunciado:
          'En l’enllumenat públic s’utilitzen làmpades de descàrrega que contenen un gas, com les de vapor de sodi a alta pressió. La llum s’aconsegueix per excitació del gas mitjançant l’energia subministrada per una descàrrega elèctrica.',
        apartados: [
          {
            letra: 'a',
            puntos: 1.25,
            enunciado:
              'Definiu el terme primera energia d’ionització d’un element i indiqueu quin signe té. Escriviu la configuració electrònica del sodi abans i després del procés d’ionització. Definiu el terme segona energia d’ionització i indiqueu quin signe té. Expliqueu raonadament si el radi del sodi serà més gran o més petit que el de l’ió sodi i si la segona energia d’ionització serà més gran o més petita que la primera.',
          },
          {
            letra: 'b',
            puntos: 1.25,
            enunciado:
              'Si l’energia d’ionització de l’estat fonamental del sodi és 495,8 kJ mol⁻¹, calculeu la longitud d’ona de la radiació capaç d’ionitzar el sodi gasós. Calculeu també l’energia necessària per a ionitzar 10 g de sodi gasós des del seu estat fonamental.',
          },
        ],
        datos: [
          'Z(Na) = 11.',
          'c = 3,0 × 10⁸ m s⁻¹.',
          'h = 6,63 × 10⁻³⁴ J s.',
          'N_A = 6,02 × 10²³ mol⁻¹.',
          'Massa atòmica relativa: Na = 23,0.',
        ],
      },
    ],
  },

  {
    id: 'quimica-cat-2022-ordinaria',
    comunidad: 'Cataluña',
    asignatura: 'quimica',
    anio: 2022,
    convocatoria: 'ordinaria',
    serie: 'Sèrie 2',
    formato: 'seleccion_4_de_7',
    instrucciones:
      'Responeu a QUATRE de les set qüestions següents. En el cas que respongueu a més qüestions, només es valoraran les quatre primeres. Cada qüestió val 2,5 punts.',
    ejercicios: [
      {
        numero: 1,
        titulo: 'Qüestió 1 — Velocitat de reacció',
        enunciado:
          'La majoria de les reaccions químiques són el resultat de diverses etapes. Per a determinar l’equació de velocitat de la reacció 2 NO(g) + 2 H₂(g) → 2 H₂O(l) + N₂(g), ΔH° < 0, s’ha observat experimentalment el mecanisme: etapa 1 lenta: 2 NO + H₂ → N₂ + H₂O₂; etapa 2 ràpida: H₂O₂ + H₂ → 2 H₂O.',
        apartados: [
          {
            letra: 'a',
            puntos: 1.25,
            enunciado:
              'Quina de les dues etapes determina la velocitat de la reacció química? Escriviu l’equació de la velocitat i justifiqueu la resposta. Indiqueu els ordres parcials respecte a cada reactiu i l’ordre total de la reacció. Justifiqueu les unitats de la constant de velocitat.',
          },
          {
            letra: 'b',
            puntos: 1.25,
            enunciado:
              'Representeu en un gràfic l’energia de la reacció en funció de la coordenada de reacció i indiqueu-hi l’energia d’activació de les dues etapes, la variació de l’entalpia, els complexos activats i l’intermedi de la reacció.',
          },
        ],
      },
    ],
  },

  {
    id: 'quimica-cat-2022-extraordinaria',
    comunidad: 'Cataluña',
    asignatura: 'quimica',
    anio: 2022,
    convocatoria: 'extraordinaria',
    serie: 'Sèrie 3',
    formato: 'seleccion_4_de_7',
    instrucciones:
      'Responeu a QUATRE de les set qüestions següents. En el cas que respongueu a més qüestions, només es valoraran les quatre primeres. Cada qüestió val 2,5 punts.',
    ejercicios: [
      {
        numero: 1,
        titulo: 'Qüestió 1 — Begudes autoescalfables',
        enunciado:
          'En el mercat hi ha diversos envasos per a aliments i begudes que són autoescalfables. En les begudes autoescalfables comercials, la reacció que produeix la calor necessària per a escalfar-les és: CaO(s) + H₂O(l) → Ca(OH)₂(s).',
        apartados: [
          {
            letra: 'a',
            puntos: 1.25,
            enunciado:
              'Calculeu la variació d’entalpia estàndard d’aquesta reacció a 25 °C. Justifiqueu, mitjançant els càlculs necessaris, si la reacció serà espontània a 25 °C.',
          },
          {
            letra: 'b',
            puntos: 1.25,
            enunciado:
              'Si dins de l’envàs hi ha 50,0 mL d’aigua i 14,0 g d’òxid de calci, calculeu quants mL d’una beguda de densitat 0,9 g mL⁻¹, que inicialment es troba a pressió constant i 20 °C, podrem escalfar fins a 42 °C.',
          },
        ],
        datos: [
          'Ce = 4,18 kJ kg⁻¹ °C⁻¹.',
          'Masses atòmiques relatives: Ca = 40,0; O = 16,0; H = 1,0.',
          'Densitat de l’aigua = 1,0 g mL⁻¹.',
          'Densitat de la beguda = 0,9 g mL⁻¹.',
          'ΔHf°: CaO(s) = –635; H₂O(l) = –286; Ca(OH)₂(s) = –987 kJ mol⁻¹.',
          'S°: CaO(s) = 39,8; H₂O(l) = 69,8; Ca(OH)₂(s) = 83,4 J K⁻¹ mol⁻¹.',
        ],
      },
    ],
  },
]