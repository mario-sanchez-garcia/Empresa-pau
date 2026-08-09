export type ConvocatoriaMadrid = 'ordinaria' | 'extraordinaria' | 'modelo'

export type FormatoHistoriaFilosofiaMadrid =
| 'madrid_clasico_texto_ab_tres_preguntas'
| 'madrid_2025_texto_ab_cuatro_preguntas'

export type PreguntaHistoriaFilosofiaMadrid = {
id: string
titulo: string
enunciado: string
puntos: number
bloque?: string
}

export type TextoHistoriaFilosofiaMadrid = {
opcion: 'A' | 'B'
autor: string
obra: string
problema: string
texto: string
preguntas: PreguntaHistoriaFilosofiaMadrid[]
solucionOrientativa?: string
}

export type ExamenHistoriaFilosofiaMadrid = {
id: string
comunidad: 'Madrid'
asignatura: 'historia_filosofia'
anio: number
curso: string
convocatoria: ConvocatoriaMadrid
variante?: string
formato: FormatoHistoriaFilosofiaMadrid
instrucciones: string
duracion: string
textos: TextoHistoriaFilosofiaMadrid[]
preguntasComunes?: PreguntaHistoriaFilosofiaMadrid[]
criteriosGenerales?: string[]
}

const instruccionesClasicas =
'Después de leer atentamente el examen, elija un texto entre A o B y responda a las preguntas A.1 o B.1. Después responda a tres preguntas a elegir indistintamente entre A.2, B.2, A.3, B.3, A.4 y B.4. Cada pregunta vale 2,5 puntos.'

const instrucciones2025 =
'Después de leer atentamente el examen, elija un texto entre A o B y responda a las cuestiones planteadas como preguntas 1, 2, 3 y 4. Cada pregunta vale 2,5 puntos.'

const criteriosClasicos = [
'En la pregunta 1 se valora identificar las ideas fundamentales del texto, explicar la relación entre ellas y usar vocabulario preciso.',
'En las preguntas de desarrollo se valora exponer correctamente el problema filosófico solicitado en un autor, autora o corriente de la época indicada.',
'Se valora la cohesión, coherencia, adecuación, progresión argumentativa, precisión conceptual, ortografía y orden expositivo.',
]

function preguntaTextoClasica(opcion: 'A' | 'B'): PreguntaHistoriaFilosofiaMadrid {
return {
id: `${opcion}.1`,
titulo: `${opcion}.1 — Comentario de texto`,
puntos: 2.5,
enunciado: 'Exponga las ideas fundamentales del texto propuesto y la relación que existe entre ellas.',
}
}

function pregunta(
id: string,
titulo: string,
enunciado: string,
bloque?: string
): PreguntaHistoriaFilosofiaMadrid {
return {
id,
titulo,
enunciado,
puntos: 2.5,
bloque,
}
}

export const examenesHistoriaFilosofiaMadrid: ExamenHistoriaFilosofiaMadrid[] = [
{
id: 'historia-filosofia-mad-2021-ordinaria',
comunidad: 'Madrid',
asignatura: 'historia_filosofia',
anio: 2021,
curso: '2020-2021',
convocatoria: 'ordinaria',
formato: 'madrid_clasico_texto_ab_tres_preguntas',
instrucciones: instruccionesClasicas,
duracion: '90 minutos',
criteriosGenerales: criteriosClasicos,
textos: [
{
opcion: 'A',
autor: 'René Descartes',
obra: 'Meditaciones metafísicas',
problema: 'Conocimiento',
texto:
'En fin, aun cuando conviniese yo en que esas ideas están causadas por esos objetos, no sería necesaria consecuencia el afirmar que han de ser semejantes a ellos. Por el contrario, en muchos casos he notado ya que hay una gran diferencia entre el objeto y su idea; así, por ejemplo, hallo en mí dos ideas del Sol muy diferentes: una es oriunda de los sentidos y debe ponerse entre las que he dicho que vienen de fuera y, según esta idea, paréceme que el Sol es muy pequeño; la otra procede de las razones de la astronomía, es decir, de ciertas nociones nacidas conmigo, o ha sido formada por mí mismo de cualquier modo que sea, y según esta idea es el Sol varias veces mayor que la Tierra. Y es cierto que estas dos ideas que del Sol tengo, no pueden ambas ser semejantes al mismo Sol, y la razón me hace creer que la que procede inmediatamente de su apariencia es la más desemejante. Todo esto me da a conocer que, hasta ahora, no ha sido en virtud de un juicio cierto y premeditado, sino por un ciego y temerario impulso, por lo que he creído que había fuera de mí cosas diferentes de mí, las cuales por medio de los órganos de mis sentidos o por otro medio cualquiera, me enviaban sus ideas o imágenes, imprimiendo en mí su semejanza.',
preguntas: [preguntaTextoClasica('A')],
solucionOrientativa:
'Descartes analiza si las ideas causadas supuestamente por objetos externos se parecen realmente a esos objetos. El ejemplo del Sol muestra que la idea sensible puede ser engañosa, mientras que la razón ofrece una representación más fiable. La conclusión es que la creencia en la semejanza entre ideas sensibles y cosas externas no está fundada en un juicio cierto, sino en un impulso no justificado.',
},
{
opcion: 'B',
autor: 'Karl Marx',
obra: 'La ideología alemana',
problema: 'Conciencia',
texto:
'Solamente ahora, después de haber considerado ya cuatro momentos, cuatro aspectos de las relaciones históricas originarias, caemos en la cuenta de que el hombre tiene también “conciencia”. Pero, tampoco esta es de antemano una conciencia “pura”. El “espíritu” nace ya tarado con la maldición de estar “preñado” de materia, que aquí se manifiesta bajo la forma de capas de aire en movimiento, de sonidos, en una palabra, bajo la forma del lenguaje. El lenguaje es tan viejo como la conciencia: el lenguaje es la conciencia práctica, la conciencia real, que existe también para los otros hombres y que, por tanto, comienza a existir también para mí mismo; y el lenguaje nace, como la conciencia, de la necesidad, de los apremios del intercambio con los demás hombres. Para el animal, sus relaciones con otros no existen como tales relaciones. La conciencia, por tanto, es ya de antemano un producto social, y lo seguirá siendo mientras existan seres humanos. La conciencia es, ante todo, naturalmente, conciencia del mundo inmediato y sensible que nos rodea y conciencia de los nexos limitados con otras personas y cosas.',
preguntas: [preguntaTextoClasica('B')],
solucionOrientativa:
'Marx defiende una concepción materialista y social de la conciencia. La conciencia no es pura ni aislada, sino que surge ligada a la vida material, al lenguaje y a la necesidad de intercambio con otros seres humanos. Por eso la conciencia es un producto social.',
},
],
preguntasComunes: [
pregunta('A.2', 'A.2 — Ética y/o moral antigua', 'Exponga el problema de la ética y/o moral en un autor o corriente filosófica de la época antigua.', 'Texto A'),
pregunta('A.3', 'A.3 — Sociedad y/o política moderna', 'Exponga el problema de la sociedad y/o política en un autor o corriente filosófica de la época moderna.', 'Texto A'),
pregunta('A.4', 'A.4 — Ser humano contemporáneo', 'Exponga el problema del ser humano en un autor o corriente filosófica de la época contemporánea.', 'Texto A'),
pregunta('B.2', 'B.2 — Ser humano medieval', 'Exponga el problema del ser humano en un autor o corriente filosófica de la época medieval.', 'Texto B'),
pregunta('B.3', 'B.3 — Ética y/o moral moderna', 'Exponga el problema de la ética y/o moral en un autor o corriente filosófica de la época moderna.', 'Texto B'),
pregunta('B.4', 'B.4 — Dios contemporáneo', 'Exponga el problema de Dios en un autor o corriente filosófica de la época contemporánea.', 'Texto B'),
],
},
{
id: 'historia-filosofia-mad-2022-ordinaria',
comunidad: 'Madrid',
asignatura: 'historia_filosofia',
anio: 2022,
curso: '2021-2022',
convocatoria: 'ordinaria',
formato: 'madrid_clasico_texto_ab_tres_preguntas',
instrucciones: instruccionesClasicas,
duracion: '90 minutos',
criteriosGenerales: criteriosClasicos,
textos: [
{
opcion: 'A',
autor: 'Karl Marx',
obra: 'La ideología alemana',
problema: 'Sociedad y política',
texto:
'Para nosotros, el comunismo no es un estado que debe implantarse, un ideal al que haya de sujetarse la realidad. Nosotros llamamos comunismo al movimiento real que anula y supera al estado de cosas actual. Las condiciones de este movimiento se desprenden de la premisa actualmente existente. Por lo demás, la masa de los simples obreros —de la fuerza de trabajo excluida en masa del capital o de cualquier satisfacción, por limitada que ella sea— y, por tanto, la pérdida no puramente temporal de este mismo trabajo como fuente segura de vida, presupone, a través de la competencia, el mercado mundial. Por tanto, el proletariado solo puede existir en un plano histórico-mundial, lo mismo que el comunismo, su acción, solo puede llegar a cobrar realidad como existencia histórico-universal. Existencia histórico-universal de los individuos, es decir, existencia de los individuos directamente vinculada a la historia universal.',
preguntas: [preguntaTextoClasica('A')],
solucionOrientativa:
'Marx presenta el comunismo no como un ideal abstracto, sino como un movimiento histórico real que supera el capitalismo. El proletariado tiene una dimensión mundial porque el mercado capitalista también es mundial. Por eso el comunismo solo puede realizarse como transformación histórico-universal.',
},
{
opcion: 'B',
autor: 'David Hume',
obra: 'Investigación sobre el entendimiento humano',
problema: 'Conocimiento y causalidad',
texto:
'La primera vez que un hombre vio la comunicación de movimiento por medio del impulso, por ejemplo, como en el choque de dos bolas de billar, no pudo declarar que un acontecimiento estaba conectado con otro, sino tan solo conjuntado con él. Tras haber observado varios casos de la misma índole, los declara conexionados. ¿Qué cambio ha ocurrido para dar lugar a esta nueva idea de conexión? Exclusivamente que ahora siente que estos acontecimientos están conectados en su imaginación y fácilmente puede predecir la existencia de uno por la aparición del otro.',
preguntas: [preguntaTextoClasica('B')],
solucionOrientativa:
'Hume analiza el problema de la causalidad. No percibimos una conexión necesaria entre causa y efecto, sino solo sucesión, contigüidad y repetición. La idea de conexión surge por hábito o costumbre en la imaginación.',
},
],
preguntasComunes: [
pregunta('A.2', 'A.2 — Conocimiento y/o realidad antigua', 'Exponga el problema del conocimiento y/o realidad en un autor o corriente filosófica de la época antigua.', 'Texto A'),
pregunta('A.3', 'A.3 — Ser humano moderno', 'Exponga el problema del ser humano en un autor o corriente filosófica de la época moderna.', 'Texto A'),
pregunta('A.4', 'A.4 — Dios contemporáneo', 'Exponga el problema de Dios en un autor o corriente filosófica de la época contemporánea.', 'Texto A'),
pregunta('B.2', 'B.2 — Ser humano medieval', 'Exponga el problema del ser humano en un autor o corriente filosófica de la época medieval.', 'Texto B'),
pregunta('B.3', 'B.3 — Sociedad y/o política moderna', 'Exponga el problema de la sociedad y/o política en un autor o corriente filosófica de la época moderna.', 'Texto B'),
pregunta('B.4', 'B.4 — Ética y/o moral contemporánea', 'Exponga el problema de la ética y/o moral en un autor o corriente filosófica de la época contemporánea.', 'Texto B'),
],
},
{
id: 'historia-filosofia-mad-2022-ordinaria-coincidencias',
comunidad: 'Madrid',
asignatura: 'historia_filosofia',
anio: 2022,
curso: '2021-2022',
convocatoria: 'ordinaria',
variante: 'Coincidencias',
formato: 'madrid_clasico_texto_ab_tres_preguntas',
instrucciones: instruccionesClasicas,
duracion: '90 minutos',
criteriosGenerales: criteriosClasicos,
textos: [
{
opcion: 'A',
autor: 'René Descartes',
obra: 'Meditaciones metafísicas',
problema: 'Conocimiento',
texto:
'Pues bien: entre estas ideas, unas me parecen nacidas conmigo, y otras extrañas y oriundas de fuera, y otras hechas e inventadas por mí mismo. Pues si tengo la facultad de concebir qué sea lo que, en general, se llama cosa o verdad, o pensamiento, me parece que no lo debo sino a mi propia naturaleza; pero si oigo ahora un ruido, si veo el sol, si siento calor, he juzgado siempre que estos sentimientos procedían de algunas cosas existentes fuera de mí; y, por último, me parece que las sirenas, los hipogrifos y otras fantasías por el estilo, son ficciones e invenciones de mi espíritu. Pero también podría persuadirme de que todas esas ideas son de las que llamo extrañas y oriundas de fuera, o bien que todas han nacido conmigo o también que todas han sido hechas por mí, puesto que aún no he descubierto su verdadero origen.',
preguntas: [preguntaTextoClasica('A')],
solucionOrientativa:
'Descartes distingue ideas innatas, adventicias y facticias, pero advierte que todavía no ha demostrado su verdadero origen. Por ello debe investigar especialmente las ideas que parecen proceder de objetos externos y si hay razones para creer que se parecen a ellos.',
},
{
opcion: 'B',
autor: 'Jürgen Habermas',
obra: 'Tres modelos normativos de democracia',
problema: 'Democracia',
texto:
'Según la concepción republicana de la democracia, la formación de la voluntad y de la opinión políticas de los ciudadanos conforma el medio sobre el que se constituye la sociedad como un todo estructurado políticamente. La sociedad se centra en el Estado, pues en la práctica de la autodeterminación política de los ciudadanos la comunidad se torna consciente de sí misma como totalidad y actúa sobre sí misma mediante la voluntad colectiva de los ciudadanos. La democracia equivale a la autoorganización política de la sociedad.',
preguntas: [preguntaTextoClasica('B')],
solucionOrientativa:
'Habermas presenta la concepción republicana de la democracia: la sociedad se constituye políticamente mediante la formación de la opinión y la voluntad ciudadanas. La democracia equivale a la autoorganización política de la sociedad y exige revitalizar la esfera pública frente a la despolitización y la burocratización del Estado.',
},
],
preguntasComunes: [
pregunta('A.2', 'A.2 — Ser humano antiguo', 'Exponga el problema del ser humano en un autor o corriente filosófica de la época antigua.', 'Texto A'),
pregunta('A.3', 'A.3 — Sociedad y/o política moderna', 'Exponga el problema de la sociedad y/o política en un autor o corriente filosófica de la época moderna.', 'Texto A'),
pregunta('A.4', 'A.4 — Ética y/o moral contemporánea', 'Exponga el problema de la ética y/o moral en un autor o corriente filosófica de la época contemporánea.', 'Texto A'),
pregunta('B.2', 'B.2 — Conocimiento y/o realidad medieval', 'Exponga el problema del conocimiento y/o realidad en un autor o corriente filosófica de la época medieval.', 'Texto B'),
pregunta('B.3', 'B.3 — Ética y/o moral moderna', 'Exponga el problema de la ética y/o moral en un autor o corriente filosófica de la época moderna.', 'Texto B'),
pregunta('B.4', 'B.4 — Dios contemporáneo', 'Exponga el problema de Dios en un autor o corriente filosófica de la época contemporánea.', 'Texto B'),
],
},
{
id: 'historia-filosofia-mad-2023-ordinaria',
comunidad: 'Madrid',
asignatura: 'historia_filosofia',
anio: 2023,
curso: '2022-2023',
convocatoria: 'ordinaria',
variante: 'D',
formato: 'madrid_clasico_texto_ab_tres_preguntas',
instrucciones: instruccionesClasicas,
duracion: '90 minutos',
criteriosGenerales: criteriosClasicos,
textos: [
{
opcion: 'A',
autor: 'Platón',
obra: 'Fedón',
problema: 'Conocimiento',
texto:
'Y si, tras haber adquirido los conocimientos, no los olvidáramos cada vez, siempre naceríamos con ese saber y siempre lo conservaríamos a lo largo de la vida. Pues, en efecto, el saber estriba en adquirir el conocimiento de algo y en conservarlo sin perderlo. Y por el contrario, Simmias, ¿no llamamos olvido a la pérdida de un conocimiento? Pero si, como creo, tras haberlo adquirido antes de nacer, lo perdimos en el momento de nacer, y después, gracias a usar para ello nuestros sentidos, recuperamos los conocimientos que tuvimos antaño, ¿no será lo que llamamos aprender el recuperar un conocimiento que era nuestro? ¿Y si a este proceso lo denominamos recordar, no le daríamos el nombre exacto?',
preguntas: [preguntaTextoClasica('A')],
solucionOrientativa:
'Platón defiende la teoría de la reminiscencia: aprender es recordar. El alma habría adquirido conocimientos antes de nacer, los habría olvidado al unirse al cuerpo y los recuperaría mediante el uso de los sentidos como ocasión para recordar.',
},
{
opcion: 'B',
autor: 'Friedrich Nietzsche',
obra: 'La gaya ciencia',
problema: 'Moral',
texto:
'Incluso nosotros, que somos descifradores de enigmas por nacimiento, situados entre hoy y mañana, puestos en tensión dentro de la contradicción entre hoy y mañana, nosotros primerizos y nacidos prematuramente al siglo que se avecina, los que ya ahora deberíamos haber percibido las sombras que pronto habrán de envolver a Europa: ¿de qué depende que nosotros veamos aproximarse este oscurecimiento sin cuidado ni temor para nosotros? De hecho, nosotros filósofos y “espíritus libres”, ante la noticia de que el “viejo Dios ha muerto”, nos sentimos como iluminados por una nueva aurora.',
preguntas: [preguntaTextoClasica('B')],
solucionOrientativa:
'Nietzsche interpreta la muerte de Dios como crisis de los valores tradicionales, pero también como oportunidad para los espíritus libres. La desaparición de la moral antigua permite crear nuevos valores afirmadores de la vida.',
},
],
preguntasComunes: [
pregunta('A.2', 'A.2 — Ética y/o moral medieval', 'Exponga el problema de la ética y/o moral en un autor o corriente filosófica de la época medieval.', 'Texto A'),
pregunta('A.3', 'A.3 — Ser humano moderno', 'Exponga el problema del ser humano en un autor o corriente filosófica de la época moderna.', 'Texto A'),
pregunta('A.4', 'A.4 — Sociedad y/o política contemporánea', 'Exponga el problema de la sociedad y/o política en un autor o corriente filosófica de la época contemporánea.', 'Texto A'),
pregunta('B.2', 'B.2 — Sociedad y/o política antigua', 'Exponga el problema de la sociedad y/o política en un autor o corriente filosófica de la época antigua.', 'Texto B'),
pregunta('B.3', 'B.3 — Dios moderno', 'Exponga el problema de Dios en un autor o corriente filosófica de la época moderna.', 'Texto B'),
pregunta('B.4', 'B.4 — Ser humano contemporáneo', 'Exponga el problema del ser humano en un autor o corriente filosófica de la época contemporánea.', 'Texto B'),
],
},
{
id: 'historia-filosofia-mad-2023-ordinaria-coincidencias',
comunidad: 'Madrid',
asignatura: 'historia_filosofia',
anio: 2023,
curso: '2022-2023',
convocatoria: 'ordinaria',
variante: 'C / Coincidencias',
formato: 'madrid_clasico_texto_ab_tres_preguntas',
instrucciones: instruccionesClasicas,
duracion: '90 minutos',
criteriosGenerales: criteriosClasicos,
textos: [
{
opcion: 'A',
autor: 'José Ortega y Gasset',
obra: 'El tema de nuestro tiempo',
problema: 'Conocimiento',
texto:
'Desde distintos puntos de vista, dos hombres miran el mismo paisaje. Sin embargo, no ven lo mismo. La distinta situación hace que el paisaje se organice ante ambos de distinta manera. ¿Tendría sentido que cada cual declarase falso el paisaje ajeno? Evidentemente, no; tan real es el uno como el otro. Pero tampoco tendría sentido que, puestos de acuerdo, en vista de no coincidir sus paisajes, los juzgasen ilusorios. Esto supondría que hay un tercer paisaje auténtico, el cual no se halla sometido a las mismas condiciones que los otros dos. Ahora bien, ese paisaje arquetipo no existe ni puede existir. La realidad cósmica es tal, que solo puede ser vista bajo una determinada perspectiva. La perspectiva es uno de los componentes de la realidad. Lejos de ser su deformación, es su organización.',
preguntas: [preguntaTextoClasica('A')],
solucionOrientativa:
'Ortega defiende el perspectivismo. No existe una realidad arquetípica independiente de toda perspectiva desde la que juzgar las visiones particulares. La perspectiva no deforma la realidad, sino que forma parte de su propia organización.',
},
{
opcion: 'B',
autor: 'René Descartes',
obra: 'Meditaciones metafísicas',
problema: 'Conocimiento',
texto:
'Y ahora, en lo que concierne a las ideas, si se consideran solamente en sí mismas, sin referirlas a otra cosa, no pueden, hablando con propiedad, ser falsas; pues, imagine yo una cabra o una quimera, no es menos cierto que imagino tanto una como otra. Tampoco es de temer que se encuentre falsedad en las afecciones o voluntades; pues, aunque puedo desear cosas malas o que nunca han existido, no deja de ser verdad que las deseo. Así pues, solo quedan los juicios, en los cuales debo tener mucho cuidado de no errar.',
preguntas: [preguntaTextoClasica('B')],
solucionOrientativa:
'Descartes sostiene que el error no está en las ideas tomadas como contenidos mentales, ni en los deseos o afecciones, sino en los juicios. El error aparece cuando juzgamos que nuestras ideas se corresponden con cosas exteriores.',
},
],
preguntasComunes: [
pregunta('A.2', 'A.2 — Sociedad y/o política antigua', 'Exponga el problema de la sociedad y/o política en un autor o corriente filosófica de la época antigua.', 'Texto A'),
pregunta('A.3', 'A.3 — Ética y/o moral moderna', 'Exponga el problema de la ética y/o moral en un autor o corriente filosófica de la época moderna.', 'Texto A'),
pregunta('A.4', 'A.4 — Ser humano contemporáneo', 'Exponga el problema del ser humano en un autor o corriente filosófica de la época contemporánea.', 'Texto A'),
pregunta('B.2', 'B.2 — Ética y/o moral medieval', 'Exponga el problema de la ética y/o moral en un autor o corriente filosófica de la época medieval.', 'Texto B'),
pregunta('B.3', 'B.3 — Dios moderno', 'Exponga el problema de Dios en un autor o corriente filosófica de la época moderna.', 'Texto B'),
pregunta('B.4', 'B.4 — Sociedad y/o política contemporánea', 'Exponga el problema de la sociedad y/o política en un autor o corriente filosófica de la época contemporánea.', 'Texto B'),
],
},
{
id: 'historia-filosofia-mad-2024-ordinaria-lunes',
comunidad: 'Madrid',
asignatura: 'historia_filosofia',
anio: 2024,
curso: '2023-2024',
convocatoria: 'ordinaria',
variante: 'Lunes / C',
formato: 'madrid_clasico_texto_ab_tres_preguntas',
instrucciones: instruccionesClasicas,
duracion: '90 minutos',
criteriosGenerales: criteriosClasicos,
textos: [
{
opcion: 'A',
autor: 'Tomás de Aquino',
obra: 'Suma Teológica',
problema: 'Dios',
texto:
'La quinta vía para probar la existencia de Dios se deduce a partir del ordenamiento de las cosas. Pues vemos que hay cosas que no tienen conocimiento, como son los cuerpos naturales, y que obran por un fin. Esto se puede comprobar observando cómo siempre o a menudo obran igual para conseguir lo mejor. De donde se deduce que, para alcanzar su objetivo, no obran al azar, sino intencionadamente. Las cosas que no tienen conocimiento no tienden al fin sin ser dirigidas por alguien con conocimiento e inteligencia, como la flecha por el arquero. Por lo tanto, hay alguien inteligente por el que todas las cosas son dirigidas al fin. Le llamamos Dios.',
preguntas: [preguntaTextoClasica('A')],
solucionOrientativa:
'Tomás de Aquino expone la quinta vía: los seres naturales sin conocimiento actúan ordenadamente hacia un fin. Como no pueden dirigirse a sí mismos, deben estar ordenados por una inteligencia superior. Esa inteligencia ordenadora es Dios.',
},
{
opcion: 'B',
autor: 'Jean-Jacques Rousseau',
obra: 'Del contrato social',
problema: 'Política',
texto:
'Las cláusulas de este contrato se hallan determinadas hasta tal punto por la naturaleza del acto, que la menor modificación las haría vanas y de efecto nulo. Estas cláusulas se reducen todas a una sola: la enajenación total de cada asociado con todos sus derechos a toda la humanidad; porque, dándose cada uno por entero, la condición es la misma para todos, y siendo la condición igual para todos, nadie tiene interés en convertirla en una carga para los demás.',
preguntas: [preguntaTextoClasica('B')],
solucionOrientativa:
'Rousseau explica que el contrato social exige la entrega total de cada asociado a la comunidad. Como todos se entregan por igual, nadie queda sometido a otro particular y se constituye una voluntad general que permite pasar de la libertad natural a la libertad civil.',
},
],
preguntasComunes: [
pregunta('A.2', 'A.2 — Realidad y/o conocimiento antiguo', 'Exponga el problema de la realidad y/o el conocimiento en un autor o corriente filosófica de la época antigua.', 'Texto A'),
pregunta('A.3', 'A.3 — Dios moderno', 'Exponga el problema de Dios en un autor o corriente filosófica de la época moderna.', 'Texto A'),
pregunta('A.4', 'A.4 — Sociedad y/o política contemporánea', 'Exponga el problema de la sociedad y/o la política en un autor o corriente filosófica de la época contemporánea.', 'Texto A'),
pregunta('B.2', 'B.2 — Ser humano medieval', 'Exponga el problema del ser humano en un autor o corriente filosófica de la época medieval.', 'Texto B'),
pregunta('B.3', 'B.3 — Ética y/o moral moderna', 'Exponga el problema de la ética y/o la moral en un autor o corriente filosófica de la época moderna.', 'Texto B'),
pregunta('B.4', 'B.4 — Realidad y/o conocimiento contemporáneo', 'Exponga el problema de la realidad y/o el conocimiento en un autor o corriente filosófica de la época contemporánea.', 'Texto B'),
],
},
{
id: 'historia-filosofia-mad-2024-ordinaria-martes',
comunidad: 'Madrid',
asignatura: 'historia_filosofia',
anio: 2024,
curso: '2023-2024',
convocatoria: 'ordinaria',
variante: 'Martes / A',
formato: 'madrid_clasico_texto_ab_tres_preguntas',
instrucciones: instruccionesClasicas,
duracion: '90 minutos',
criteriosGenerales: criteriosClasicos,
textos: [
{
opcion: 'A',
autor: 'René Descartes',
obra: 'Meditaciones metafísicas',
problema: 'Dios',
texto:
'Por “Dios” entiendo una substancia infinita, eterna, inmutable, independiente, omnisciente, omnipotente, que me ha creado a mí mismo y a todas las demás cosas que existen, si es que existe alguna. Pues bien, eso que entiendo por Dios es tan grande y eminente, que cuanto más atentamente lo considero menos convencido estoy de que una idea así pueda proceder solo de mí. Y, por consiguiente, hay que concluir necesariamente que Dios existe. Pues, aunque yo tenga la idea de substancia en virtud de ser yo una substancia, no podría tener la idea de una substancia infinita, siendo yo finito, si no la hubiera puesto en mí una substancia que verdaderamente fuese infinita.',
preguntas: [preguntaTextoClasica('A')],
solucionOrientativa:
'Descartes intenta demostrar la existencia de Dios a partir de la idea de infinito. Yo, siendo una sustancia finita, no puedo ser causa adecuada de la idea de una sustancia infinita. Por ello, esa idea debe haber sido puesta en mí por una sustancia realmente infinita: Dios.',
},
{
opcion: 'B',
autor: 'Karl Marx',
obra: 'La ideología alemana',
problema: 'Estado',
texto:
'De donde se desprende que todas las luchas que se libran dentro del Estado, la lucha entre la democracia, la aristocracia y la monarquía, la lucha por el derecho de sufragio, etc., no son sino las formas ilusorias bajo las que se ventilan las luchas reales entre las diversas clases. Y se desprende, asimismo, que toda clase que aspire a implantar su dominación tiene que empezar conquistando el poder político, para poder presentar su interés como el interés general.',
preguntas: [preguntaTextoClasica('B')],
solucionOrientativa:
'Marx interpreta las luchas políticas como expresión superficial de la lucha de clases. El Estado no es neutral: quien aspira a dominar socialmente debe conquistar el poder político y presentar su interés de clase como si fuese interés general.',
},
],
preguntasComunes: [
pregunta('A.2', 'A.2 — Realidad y/o conocimiento antiguo', 'Exponga el problema de la realidad y/o el conocimiento en un autor que pertenezca a la época antigua.', 'Texto A'),
pregunta('A.3', 'A.3 — Sociedad y/o política moderna', 'Exponga el problema de la sociedad y/o la política en un autor que pertenezca a la época moderna.', 'Texto A'),
pregunta('A.4', 'A.4 — Ética y/o moral contemporánea', 'Exponga el problema de la ética y/o la moral en un autor que pertenezca a la época contemporánea.', 'Texto A'),
pregunta('B.2', 'B.2 — Sociedad y/o política medieval', 'Exponga el problema de la sociedad y/o la política en un autor o corriente filosófica de la época medieval.', 'Texto B'),
pregunta('B.3', 'B.3 — Ética y/o moral moderna', 'Exponga el problema de la ética y/o la moral en un autor o corriente filosófica de la época moderna.', 'Texto B'),
pregunta('B.4', 'B.4 — Realidad y/o conocimiento contemporáneo', 'Exponga el problema de la realidad y/o el conocimiento en un autor o corriente filosófica de la época contemporánea.', 'Texto B'),
],
},
{
id: 'historia-filosofia-mad-2025-ordinaria',
comunidad: 'Madrid',
asignatura: 'historia_filosofia',
anio: 2025,
curso: '2024-2025',
convocatoria: 'ordinaria',
variante: 'F',
formato: 'madrid_2025_texto_ab_cuatro_preguntas',
instrucciones: instrucciones2025,
duracion: '90 minutos',
criteriosGenerales: [
'Pregunta 1: identificar la tesis del texto, ponerla en diálogo con otro autor o corriente filosófica y utilizar vocabulario preciso.',
'Pregunta 2: exponer el problema de la ética/moral o de Dios en un autor antiguo o medieval.',
'Pregunta 3: exponer el problema del ser humano o de la realidad/conocimiento en un autor moderno.',
'Pregunta 4: exponer el problema de Dios o de la sociedad/política en un autor contemporáneo.',
],
textos: [
{
opcion: 'A',
autor: 'Platón',
obra: 'Fedón',
problema: 'Alma, conocimiento y sabiduría',
texto:
'¿Y no decíamos antes también que cuando el alma se vale del cuerpo para examinar algo —sea a través del ver, del oír o de alguna otra percepción—, entonces es arrastrada por el cuerpo hacia las cosas que no se encuentran nunca en el mismo estado, y ella misma anda extraviada, se perturba y se marea, como si estuviera embriagada? En cambio, cuando es ella misma la que examina por sí misma, se remonta hacia aquello que es puro, siempre existente e inmortal y que permanece siempre del mismo modo, y entonces ha cesado en su extravío y permanece, siempre igual, en el mismo estado. Este es el estado que recibe el nombre de sabiduría.',
preguntas: [
{
id: '1.1',
titulo: 'Pregunta 1.1 — Tesis principal',
puntos: 1.25,
enunciado: 'Identifique y explique la tesis principal defendida en el texto propuesto.',
},
{
id: '1.2',
titulo: 'Pregunta 1.2 — Diálogo filosófico',
puntos: 1.25,
enunciado:
'Mediante un pequeño texto justificativo, ponga en diálogo con algún otro autor, autora o corriente filosófica la cuestión discutida en el texto.',
},
],
solucionOrientativa:
'Platón contrapone el conocimiento sensible, ligado al cuerpo y a lo cambiante, con el conocimiento racional del alma, que se dirige a realidades puras, inmortales e inmutables. La sabiduría consiste en que el alma se aparte del cuerpo y se oriente hacia lo permanente.',
},
{
opcion: 'B',
autor: 'David Hume',
obra: 'Investigación sobre el conocimiento humano',
problema: 'Causalidad',
texto:
'Parece entonces que esta idea de conexión necesaria entre sucesos surge del acaecimiento de varios casos similares de constante conjunción de dichos sucesos. Esta idea no puede ser sugerida por uno solo de estos casos examinados desde todas las posiciones y perspectivas posibles. Pero, tras la repetición de casos similares, la mente es conducida por hábito a tener la expectativa, al aparecer un suceso, de su acompañante usual y a creer que existirá. Por tanto, esta conexión que sentimos en la mente, esa transición de la representación de un objeto a su acompañante usual, es el sentimiento o impresión a partir del cual formamos la idea de poder o conexión necesaria.',
preguntas: [
{
id: '1.1',
titulo: 'Pregunta 1.1 — Tesis principal',
puntos: 1.25,
enunciado: 'Identifique y explique la tesis principal defendida en el texto propuesto.',
},
{
id: '1.2',
titulo: 'Pregunta 1.2 — Diálogo filosófico',
puntos: 1.25,
enunciado:
'Mediante un pequeño texto justificativo, ponga en diálogo con algún otro autor, autora o corriente filosófica la cuestión discutida en el texto.',
},
],
solucionOrientativa:
'Hume sostiene que no percibimos una conexión necesaria entre causa y efecto. La idea de causalidad surge por la repetición de casos semejantes y por el hábito mental que nos lleva a esperar que un suceso sea seguido por su acompañante habitual.',
},
],
preguntasComunes: [
pregunta('2A', 'Pregunta 2A — Ética y/o moral antigua o medieval', 'Exponga el problema de la ética y/o la moral en un autor, autora o corriente filosófica de la época antigua o medieval.', 'Pregunta 2'),
pregunta('2B', 'Pregunta 2B — Dios antiguo o medieval', 'Exponga el problema de Dios en un autor, autora o corriente filosófica de la época antigua o medieval.', 'Pregunta 2'),
pregunta('3A', 'Pregunta 3A — Ser humano moderno', 'Exponga el problema del ser humano en un autor, autora o corriente filosófica de la época moderna.', 'Pregunta 3'),
pregunta('3B', 'Pregunta 3B — Realidad y/o conocimiento moderno', 'Exponga el problema de la realidad y/o el conocimiento en un autor, autora o corriente filosófica de la época moderna.', 'Pregunta 3'),
pregunta('4A', 'Pregunta 4A — Dios contemporáneo', 'Exponga el problema de Dios en un autor, autora o corriente filosófica de la época contemporánea.', 'Pregunta 4'),
pregunta('4B', 'Pregunta 4B — Sociedad y/o política contemporánea', 'Exponga el problema de la sociedad y/o la política en un autor, autora o corriente filosófica de la época contemporánea.', 'Pregunta 4'),
],
},
{
id: 'historia-filosofia-mad-2025-extraordinaria',
comunidad: 'Madrid',
asignatura: 'historia_filosofia',
anio: 2025,
curso: '2024-2025',
convocatoria: 'extraordinaria',
variante: 'A',
formato: 'madrid_2025_texto_ab_cuatro_preguntas',
instrucciones: instrucciones2025,
duracion: '90 minutos',
criteriosGenerales: [
'Pregunta 1: identificar y explicar la tesis del texto, ponerla en diálogo con otro autor o corriente filosófica y utilizar vocabulario preciso.',
'Pregunta 2: exponer el problema de la ética y/o la moral o el de Dios en un autor, autora o corriente filosófica de la época antigua o medieval.',
'Pregunta 3: exponer el problema del ser humano o el de la ética y/o la moral en un autor, autora o corriente filosófica de la época moderna.',
'Pregunta 4: exponer el problema de la sociedad y/o la política o el de la realidad y/o el conocimiento en un autor, autora o corriente filosófica de la época contemporánea.',
],
textos: [
{
opcion: 'A',
autor: 'René Descartes',
obra: 'Meditaciones metafísicas',
problema: 'Cogito y sustancia pensante',
texto:
'Cerraré ahora los ojos, me taparé los oídos, suspenderé mis sentidos; hasta borraré de mi pensamiento toda imagen de las cosas corpóreas, o, al menos, como es casi imposible, las reputaré vanas y falsas; de este modo, en coloquio solo conmigo y examinando mis adentros, procuraré ir conociéndome mejor y familiarizarme más conmigo mismo. Soy una cosa que piensa, es decir, que duda, afirma, quiere, no quiere, y que también imagina y siente, pues como he observado más arriba, aunque lo que siento e imagino acaso no sea nada fuera de mí y en sí mismo, con todo estoy seguro de que esos modos de pensar residen y se hallan en mí, sin duda. Y con lo poco que acabo de decir, creo haber enumerado todo lo que sé de cierto, o al menos, todo lo que he advertido saber hasta aquí.',
preguntas: [
{ id: '1.1', titulo: 'Pregunta 1.1 — Tesis principal', puntos: 1.25, enunciado: 'Identifique y explique la tesis principal defendida en el texto propuesto.' },
{ id: '1.2', titulo: 'Pregunta 1.2 — Diálogo filosófico', puntos: 1.25, enunciado: 'Mediante un pequeño texto justificativo, ponga en diálogo con algún otro autor, autora o corriente filosófica la cuestión discutida en el texto.' },
],
solucionOrientativa:
'Descartes practica la duda metódica retirando la atención de los sentidos y de las cosas corpóreas para examinarse a sí mismo. Descubre así que es una cosa que piensa —que duda, afirma, quiere, imagina y siente— y que esa existencia como sujeto pensante es la primera verdad cierta e indudable: el cogito o sustancia pensante. Puede ponerse en diálogo con Agustín de Hipona, cuyo argumento contra el escepticismo anticipa la misma certeza a partir de la conciencia de la propia existencia, o con Hume, para quien la noción de sustancia o "yo" no corresponde a ninguna impresión y es, por tanto, una ficción.',
},
{
opcion: 'B',
autor: 'Friedrich Nietzsche',
obra: 'La gaya ciencia',
problema: 'Muerte de Dios y nihilismo',
texto:
'El mayor acontecimiento reciente —que "Dios ha muerto", que la creencia en el dios cristiano ha perdido credibilidad— comienza ya a arrojar sus primeras sombras sobre Europa. Por lo menos a aquellos pocos cuyos ojos, o el recelo que poseen en sus ojos, son lo suficientemente fuertes y sutiles para este espectáculo, les parece que algún sol se ha puesto, alguna confianza antigua y profunda se ha convertido en duda: a ellos nuestro viejo mundo tiene que parecerles cada día más crepuscular, más desconfiado, más extraño, "más viejo". Pero esencialmente puede decirse: el acontecimiento mismo es demasiado grande, demasiado lejano, demasiado apartado de la capacidad de comprensión de muchos como para que pueda decirse siquiera que su noticia haya llegado, y menos aún que muchos sepan qué ha ocurrido propiamente con él —y todo lo que ahora, después de que esa creencia ha sido sepultada, tiene que desmoronarse porque estaba construido sobre ella, apoyado en ella, entrelazado con ella: por ejemplo, toda nuestra moral europea.',
preguntas: [
{ id: '1.1', titulo: 'Pregunta 1.1 — Tesis principal', puntos: 1.25, enunciado: 'Identifique y explique la tesis principal defendida en el texto propuesto.' },
{ id: '1.2', titulo: 'Pregunta 1.2 — Diálogo filosófico', puntos: 1.25, enunciado: 'Mediante un pequeño texto justificativo, ponga en diálogo con algún otro autor, autora o corriente filosófica la cuestión discutida en el texto.' },
],
solucionOrientativa:
'Nietzsche interpreta la "muerte de Dios" como la pérdida de credibilidad de la fe cristiana y, con ella, del fundamento de la moral y la cultura europeas construidas sobre esa creencia. Se trata de un acontecimiento inmenso, todavía no percibido por la mayoría, cuyas consecuencias arrastran todo lo que se apoyaba en él y anuncian el nihilismo. Puede ponerse en diálogo con Platón, para quien existía una verdad y unos valores morales absolutos anclados en el mundo de las Ideas, frente a los cuales Nietzsche opone la voluntad de poder como origen de toda valoración.',
},
],
preguntasComunes: [
pregunta('2A', 'Pregunta 2A — Ética y/o moral antigua o medieval', 'Exponga el problema de la ética y/o la moral en un autor, autora o corriente filosófica de la época antigua o medieval.', 'Pregunta 2'),
pregunta('2B', 'Pregunta 2B — Dios antiguo o medieval', 'Exponga el problema de Dios en un autor, autora o corriente filosófica de la época antigua o medieval.', 'Pregunta 2'),
pregunta('3A', 'Pregunta 3A — Ser humano moderno', 'Exponga el problema del ser humano en un autor, autora o corriente filosófica de la época moderna.', 'Pregunta 3'),
pregunta('3B', 'Pregunta 3B — Ética y/o moral moderna', 'Exponga el problema de la ética y/o la moral en un autor, autora o corriente filosófica de la época moderna.', 'Pregunta 3'),
pregunta('4A', 'Pregunta 4A — Sociedad y/o política contemporánea', 'Exponga el problema de la sociedad y/o la política en un autor, autora o corriente filosófica de la época contemporánea.', 'Pregunta 4'),
pregunta('4B', 'Pregunta 4B — Realidad y/o conocimiento contemporáneo', 'Exponga el problema de la realidad y/o el conocimiento en un autor, autora o corriente filosófica de la época contemporánea.', 'Pregunta 4'),
],
},
{
id: 'historia-filosofia-mad-2025-extraordinaria-coincidencias',
comunidad: 'Madrid',
asignatura: 'historia_filosofia',
anio: 2025,
curso: '2024-2025',
convocatoria: 'extraordinaria',
variante: 'C / Coincidencias',
formato: 'madrid_2025_texto_ab_cuatro_preguntas',
instrucciones: instrucciones2025,
duracion: '90 minutos',
criteriosGenerales: [
'Pregunta 1: identificar y explicar la tesis del texto, ponerla en diálogo con otro autor o corriente filosófica y utilizar vocabulario preciso.',
'Pregunta 2: exponer el problema de la sociedad y/o la política o el de Dios en un autor, autora o corriente filosófica de la época antigua o medieval.',
'Pregunta 3: exponer el problema de la realidad y/o el conocimiento o el de la ética y/o la moral en un autor, autora o corriente filosófica de la época moderna.',
'Pregunta 4: exponer el problema del ser humano o el de la sociedad y/o la política en un autor, autora o corriente filosófica de la época contemporánea.',
],
textos: [
{
opcion: 'A',
autor: 'Platón',
obra: 'Fedón',
problema: 'Teoría de la reminiscencia',
texto:
'–¿Acaso desde que nacimos veíamos, oíamos, y teníamos los demás sentidos? –Desde luego que sí. –¿Era preciso, entonces, decimos, que tengamos adquirido el conocimiento de lo igual antes que estos? –Sí. –Por lo tanto, antes de nacer, según parece, nos es necesario haberlo adquirido. –Eso parece. –Así que si, habiéndolo adquirido antes de nacer, nacimos teniéndolo, ¿sabíamos ya antes de nacer y apenas nacidos no solo lo igual, lo mayor, y lo menor, y todo lo de esa clase? Pues el razonamiento nuestro de ahora no versa más sobre lo igual en sí que sobre lo bello en sí, y lo bueno en sí, y lo justo y lo santo, y, a lo que precisamente me refiero, sobre todo aquello que identificamos como "lo que es en sí", tanto al preguntar en nuestras preguntas como al responder en nuestras respuestas. De modo que nos es necesario haber adquirido los conocimientos de todo eso antes de nacer.',
preguntas: [
{ id: '1.1', titulo: 'Pregunta 1.1 — Tesis principal', puntos: 1.25, enunciado: 'Identifique y explique la tesis principal defendida en el texto propuesto.' },
{ id: '1.2', titulo: 'Pregunta 1.2 — Diálogo filosófico', puntos: 1.25, enunciado: 'Mediante un pequeño texto justificativo, ponga en diálogo con algún otro autor, autora o corriente filosófica la cuestión discutida en el texto.' },
],
solucionOrientativa:
'Platón argumenta que, puesto que el conocimiento de lo igual, lo bello o lo bueno en sí no puede derivarse de los sentidos (ya presentes al nacer), dicho conocimiento tuvo que adquirirse antes de nacer: es innato, y aprender es recordarlo. Esta es la base de la teoría de la reminiscencia. Puede ponerse en diálogo con Descartes, quien también admite ideas innatas aunque sin defender la preexistencia del alma, o con Hume, para quien no hay ideas innatas y la mente es en origen una tabula rasa que solo conoce a partir de la experiencia.',
},
{
opcion: 'B',
autor: 'Jean-Jacques Rousseau',
obra: 'Del contrato social',
problema: 'Contrato social',
texto:
'Supongo a los hombres llegados a un punto en que los obstáculos que se oponen a su conservación en el estado de naturaleza superan con su resistencia a las fuerzas que cada individuo puede emplear para mantenerse en dicho estado. Desde este momento, ese estado primitivo no puede ya subsistir, y el género humano perecería si no cambiase de manera de ser. Ahora bien: como los hombres no pueden engendrar fuerzas nuevas, sino solo unir y dirigir aquellas que existen, no han tenido para conservarse otro medio que formar por agregación una suma de fuerzas que pueda superar la resistencia, ponerlas en juego mediante un solo móvil y hacerlas obrar a coro. Esta suma de fuerzas no puede nacer sino del concurso de muchos; pero siendo la fuerza y la libertad de cada hombre los primeros instrumentos de su conservación, ¿cómo las comprometerá sin perjudicarse y sin descuidar los cuidados que se debe a sí mismo? Esta dificultad, referida a nuestro problema, puede enunciarse en los siguientes términos: "Encontrar una forma de asociación que defienda y proteja con toda la fuerza común a la persona y a los bienes de cada asociado, y por virtud de la cual cada uno, uniéndose a todos, no obedezca sino a sí mismo y quede tan libre como antes". Tal es el problema fundamental, al cual da solución el Contrato social.',
preguntas: [
{ id: '1.1', titulo: 'Pregunta 1.1 — Tesis principal', puntos: 1.25, enunciado: 'Identifique y explique la tesis principal defendida en el texto propuesto.' },
{ id: '1.2', titulo: 'Pregunta 1.2 — Diálogo filosófico', puntos: 1.25, enunciado: 'Mediante un pequeño texto justificativo, ponga en diálogo con algún otro autor, autora o corriente filosófica la cuestión discutida en el texto.' },
],
solucionOrientativa:
'Rousseau plantea que, cuando los obstáculos naturales superan la capacidad de cada individuo para conservarse, los hombres deben unir sus fuerzas mediante una asociación que los proteja sin que ninguno pierda su libertad: cada uno, al unirse a todos, no debe obedecer sino a sí mismo, quedando tan libre como antes. Este es el problema fundamental que resuelve el contrato social. Puede ponerse en diálogo con Hobbes o Locke, cuyos modelos de contrato exigen una cesión de la libertad o soberanía individual distinta a la que propone Rousseau.',
},
],
preguntasComunes: [
pregunta('2A', 'Pregunta 2A — Sociedad y/o política antigua o medieval', 'Exponga el problema de la sociedad y/o la política en un autor, autora o corriente filosófica de la época antigua o medieval.', 'Pregunta 2'),
pregunta('2B', 'Pregunta 2B — Dios antiguo o medieval', 'Exponga el problema de Dios en un autor, autora o corriente filosófica de la época antigua o medieval.', 'Pregunta 2'),
pregunta('3A', 'Pregunta 3A — Realidad y/o conocimiento moderno', 'Exponga el problema de la realidad y/o el conocimiento en un autor, autora o corriente filosófica de la época moderna.', 'Pregunta 3'),
pregunta('3B', 'Pregunta 3B — Ética y/o moral moderna', 'Exponga el problema de la ética y/o la moral en un autor, autora o corriente filosófica de la época moderna.', 'Pregunta 3'),
pregunta('4A', 'Pregunta 4A — Ser humano contemporáneo', 'Exponga el problema del ser humano en un autor, autora o corriente filosófica de la época contemporánea.', 'Pregunta 4'),
pregunta('4B', 'Pregunta 4B — Sociedad y/o política contemporánea', 'Exponga el problema de la sociedad y/o la política en un autor, autora o corriente filosófica de la época contemporánea.', 'Pregunta 4'),
],
},
{
id: 'historia-filosofia-mad-2026-ordinaria',
comunidad: 'Madrid',
asignatura: 'historia_filosofia',
anio: 2026,
curso: '2025-2026',
convocatoria: 'ordinaria',
variante: 'E',
formato: 'madrid_2025_texto_ab_cuatro_preguntas',
instrucciones: instrucciones2025,
duracion: '90 minutos',
criteriosGenerales: [
'Pregunta 1: identificar y explicar la tesis del texto, ponerla en diálogo con otro autor o corriente filosófica y utilizar vocabulario preciso.',
'Pregunta 2: exponer el problema de la ética y/o la moral o el del ser humano en un autor, autora o corriente filosófica de la época antigua o medieval.',
'Pregunta 3: exponer el problema de Dios o el de la sociedad y/o la política en un autor, autora o corriente filosófica de la época moderna.',
'Pregunta 4: exponer el problema de la realidad y/o el conocimiento o el de la ética y/o la moral en un autor, autora o corriente filosófica de la época contemporánea.',
],
textos: [
{
opcion: 'A',
autor: 'Platón',
obra: 'Fedón',
problema: 'Alma y cuerpo',
texto:
'– Míralo también con el enfoque siguiente: siempre que estén en un mismo organismo alma y cuerpo, al uno le prescribe la naturaleza que sea esclavo y esté sometido, y a la otra mandar y ser dueña. Y según esto, de nuevo, ¿cuál de ellos te parece que es semejante a lo divino y cuál a lo mortal? ¿O no te parece que lo divino es lo que está naturalmente capacitado para mandar y ejercer de guía, mientras que lo mortal lo está para ser guiado y hacer de siervo? – Me lo parece, desde luego.',
preguntas: [
{ id: '1.1', titulo: 'Pregunta 1.1 — Tesis principal', puntos: 1.25, enunciado: 'Identifique y explique la tesis principal defendida en el texto propuesto.' },
{ id: '1.2', titulo: 'Pregunta 1.2 — Diálogo filosófico', puntos: 1.25, enunciado: 'Mediante un pequeño texto justificativo, ponga en diálogo con algún otro autor, autora o corriente filosófica perteneciente a la misma o diferente época la cuestión discutida en el texto.' },
],
solucionOrientativa:
'Platón defiende que en el compuesto humano el alma y el cuerpo tienen naturalezas distintas: el alma está hecha para mandar y guiar, por ser semejante a lo divino, mientras que el cuerpo debe obedecer y servir, por ser semejante a lo mortal. Se trata de una concepción dualista jerárquica del ser humano. Puede ponerse en diálogo con Aristóteles, para quien el alma no es una sustancia separada que gobierna al cuerpo desde fuera, sino la forma del cuerpo vivo, de modo que ambos constituyen una unidad funcional inseparable y no una relación de dominio y servidumbre.',
},
{
opcion: 'B',
autor: 'David Hume',
obra: 'Investigación sobre el entendimiento humano',
problema: 'Causalidad y experiencia',
texto:
'Cuando se nos presenta un objeto o suceso cualquiera, por mucha sagacidad y agudeza que tengamos, nos es imposible descubrir, o incluso conjeturar sin la ayuda de la experiencia, el suceso que pueda resultar de él o llevar nuestra previsión más allá del objeto que está inmediatamente presente a nuestra memoria y sentidos. Incluso después de un caso o experimento en que hayamos observado que determinado acontecimiento sigue a otro, no tenemos derecho a enunciar una regla general o anticipar lo que ocurrirá en casos semejantes [...]. Pero cuando determinada clase de acontecimientos ha estado siempre, en todos los casos, unida a otra, no tenemos ya escrúpulos en predecir el uno con la aparición del otro y en utilizar el único razonamiento que puede darnos seguridad sobre una cuestión de hecho o existencia.',
preguntas: [
{ id: '1.1', titulo: 'Pregunta 1.1 — Tesis principal', puntos: 1.25, enunciado: 'Identifique y explique la tesis principal defendida en el texto propuesto.' },
{ id: '1.2', titulo: 'Pregunta 1.2 — Diálogo filosófico', puntos: 1.25, enunciado: 'Mediante un pequeño texto justificativo, ponga en diálogo con algún otro autor, autora o corriente filosófica perteneciente a la misma o diferente época la cuestión discutida en el texto.' },
],
solucionOrientativa:
'Hume sostiene que no podemos descubrir por la razón, ni siquiera tras un único caso observado, qué efecto seguirá a una causa: solo la experiencia repetida de la conjunción constante entre dos sucesos nos autoriza a predecir uno a partir de la aparición del otro. La conexión causal no es, por tanto, una necesidad racional, sino un hábito nacido de la costumbre. Puede ponerse en diálogo con Descartes, para quien la razón alcanza por sí misma verdades necesarias y universales, o con Kant, quien reconoce que la experiencia por sí sola no basta y postula la causalidad como una categoría a priori del entendimiento.',
},
],
preguntasComunes: [
pregunta('2A', 'Pregunta 2A — Ética y/o moral antigua o medieval', 'Exponga el problema de la ética y/o la moral en un autor, autora o corriente filosófica de la época antigua o medieval.', 'Pregunta 2'),
pregunta('2B', 'Pregunta 2B — Ser humano antiguo o medieval', 'Exponga el problema del ser humano en un autor, autora o corriente filosófica de la época antigua o medieval.', 'Pregunta 2'),
pregunta('3A', 'Pregunta 3A — Dios moderno', 'Exponga el problema de Dios en un autor, autora o corriente filosófica de la época moderna.', 'Pregunta 3'),
pregunta('3B', 'Pregunta 3B — Sociedad y/o política moderna', 'Exponga el problema de la sociedad y/o la política en un autor, autora o corriente filosófica de la época moderna.', 'Pregunta 3'),
pregunta('4A', 'Pregunta 4A — Realidad y/o conocimiento contemporáneo', 'Exponga el problema de realidad y/o conocimiento en un autor, autora o corriente filosófica de la época contemporánea.', 'Pregunta 4'),
pregunta('4B', 'Pregunta 4B — Ética y/o moral contemporánea', 'Exponga el problema de la ética y/o moral en un autor, autora o corriente filosófica de la época contemporánea.', 'Pregunta 4'),
],
},
{
id: 'historia-filosofia-mad-2026-modelo',
comunidad: 'Madrid',
asignatura: 'historia_filosofia',
anio: 2026,
curso: '2025-2026',
convocatoria: 'modelo',
formato: 'madrid_2025_texto_ab_cuatro_preguntas',
instrucciones: instrucciones2025,
duracion: '90 minutos',
criteriosGenerales: [
'Pregunta 1: identificar y explicar la tesis del texto, ponerla en diálogo con otro autor o corriente filosófica y utilizar vocabulario preciso.',
'Pregunta 2: exponer el problema del ser humano o el de la sociedad y/o la política en un autor, autora o corriente filosófica de la época antigua o medieval.',
'Pregunta 3: exponer el problema de la realidad y/o el conocimiento o el de la ética y/o la moral en un autor, autora o corriente filosófica de la época moderna.',
'Pregunta 4: exponer el problema de la ética y/o la moral o el de Dios en un autor, autora o corriente filosófica de la época contemporánea.',
],
textos: [
{
opcion: 'A',
autor: 'Santo Tomás de Aquino',
obra: 'Suma Teológica',
problema: 'Existencia de Dios (cuarta vía)',
texto:
'Vemos en los seres que unos son más o menos buenos, verdaderos y nobles que otros, y lo mismo sucede con las diversas cualidades. Pero el más y el menos se atribuye a las cosas según su diversa proximidad a lo máximo, y por esto se dice lo más caliente de lo que más se aproxima al máximo calor. Por tanto, ha de existir algo que sea verísimo, nobilísimo y óptimo, y por ello ente o ser supremo; pues, como dice el Filósofo, lo que es verdad máxima es máxima entidad. Ahora bien, lo máximo en cualquier género es causa de todo lo que en aquel género existe, y así el fuego, que tiene el máximo calor, es causa del calor de todo lo caliente, según dice Aristóteles. Existe, por consiguiente, algo que es para todas las cosas causa de su ser, de su bondad y de todas sus perfecciones, y a esto llamamos Dios.',
preguntas: [
{ id: '1.1', titulo: 'Pregunta 1.1 — Tesis principal', puntos: 1.25, enunciado: 'Identifique y explique la tesis principal defendida en el texto propuesto.' },
{ id: '1.2', titulo: 'Pregunta 1.2 — Diálogo filosófico', puntos: 1.25, enunciado: 'Mediante un pequeño texto justificativo, ponga en diálogo con algún otro autor, autora o corriente filosófica perteneciente a la misma o diferente época la cuestión discutida en el texto.' },
],
solucionOrientativa:
'Santo Tomás expone la cuarta vía: observamos en los seres grados de perfección (bondad, verdad, nobleza) que se miden por su proximidad a un máximo. Ese máximo en cada género es causa de las perfecciones de ese género, igual que el fuego, máximo calor, es causa del calor de las cosas calientes. Debe existir, por tanto, algo que sea causa del ser y de todas las perfecciones de las demás cosas: a ese ser supremo lo llamamos Dios.',
},
{
opcion: 'B',
autor: 'Karl Marx',
obra: 'La ideología alemana',
problema: 'Comunismo como movimiento histórico',
texto:
'Para nosotros, el comunismo no es un estado que debe implantarse, un ideal al que haya de sujetarse la realidad. Nosotros llamamos comunismo al movimiento real que anula y supera al estado de cosas actual. Las condiciones de este movimiento se desprenden de la premisa actualmente existente. Por lo demás, la masa de los simples obreros —de la fuerza de trabajo excluida en masa del capital o de cualquier satisfacción, por limitada que ella sea— y, por tanto, la pérdida no puramente temporal de este mismo trabajo como fuente segura de vida, presupone, a través de la competencia, el mercado mundial. Por tanto, el proletariado solo puede existir en un plano histórico-mundial, lo mismo que el comunismo, su acción, solo puede llegar a cobrar realidad como existencia histórico-universal. Existencia histórico-universal de los individuos, es decir, existencia de los individuos directamente vinculada a la historia universal.',
preguntas: [
{ id: '1.1', titulo: 'Pregunta 1.1 — Tesis principal', puntos: 1.25, enunciado: 'Identifique y explique la tesis principal defendida en el texto propuesto.' },
{ id: '1.2', titulo: 'Pregunta 1.2 — Diálogo filosófico', puntos: 1.25, enunciado: 'Mediante un pequeño texto justificativo, ponga en diálogo con algún otro autor, autora o corriente filosófica perteneciente a la misma o diferente época la cuestión discutida en el texto.' },
],
solucionOrientativa:
'Marx presenta el comunismo no como un ideal abstracto, sino como un movimiento histórico real que surge de las condiciones materiales existentes y supera al capitalismo. El proletariado tiene una dimensión mundial porque el mercado capitalista también es mundial, de modo que el comunismo solo puede realizarse como transformación histórico-universal, vinculada a la historia de todos los individuos.',
},
],
preguntasComunes: [
pregunta('2A', 'Pregunta 2A — Ser humano antiguo o medieval', 'Exponga el problema del ser humano en un autor, autora o corriente filosófica de la época antigua o medieval.', 'Pregunta 2'),
pregunta('2B', 'Pregunta 2B — Sociedad y/o política antigua o medieval', 'Exponga el problema de la sociedad y/o la política en un autor, autora o corriente filosófica de la época antigua o medieval.', 'Pregunta 2'),
pregunta('3A', 'Pregunta 3A — Realidad y/o conocimiento moderno', 'Exponga el problema de la realidad y/o el conocimiento en un autor, autora o corriente filosófica de la época moderna.', 'Pregunta 3'),
pregunta('3B', 'Pregunta 3B — Ética y/o moral moderna', 'Exponga el problema de la ética y/o la moral en un autor, autora o corriente filosófica de la época moderna.', 'Pregunta 3'),
pregunta('4A', 'Pregunta 4A — Ética y/o moral contemporánea', 'Exponga el problema de la ética y/o la moral en un autor, autora o corriente filosófica de la época contemporánea.', 'Pregunta 4'),
pregunta('4B', 'Pregunta 4B — Dios contemporáneo', 'Exponga el problema de Dios en un autor, autora o corriente filosófica de la época contemporánea.', 'Pregunta 4'),
],
},
]
