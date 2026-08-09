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
{
  id: "historia-filosofia-mad-2018-extraordinaria",
  comunidad: "Madrid",
  asignatura: "historia_filosofia",
  anio: 2018,
  curso: "2017-2018",
  convocatoria: "extraordinaria",
  formato: "madrid_clasico_texto_ab_tres_preguntas",
  instrucciones: instruccionesClasicas,
  duracion: "90 minutos",
  criteriosGenerales: criteriosClasicos,
  textos: [
    {
      opcion: "A",
      autor: "David Hume",
      obra: "Investigación\nsobre el entendimiento humano",
      problema: "Este texto trata sobre la noción de causa.",
      texto: "«Un acontecimiento sigue a otro, pero nunca hemos podido observar un vínculo entre ellos. Parecen conjuntados, pero no conectados. Y como no podemos tener idea de algo que no haya aparecido en algún momento a los sentidos externos o al sentimiento interno, la conclusión necesaria parece ser la de que no tenemos ninguna idea de conexión o poder y que estas palabras carecen totalmente de sentido cuando son empleadas en razonamientos filosóficos o en la vida corriente»",
      preguntas: [preguntaTextoClasica('A')],
    },
    {
      opcion: "B",
      autor: "TOMÁS DE AQUINO",
      obra: "Suma\nTeológica",
      problema: "En este texto, Tomás de Aquino reflexiona sobre el problema de Dios.",
      texto: "«La evidencia de algo puede ser de dos modos. Uno en sí misma y no para nosotros; otro, en sí misma y para nosotros. Así, una proposición es evidente por sí misma cuando el predicado está incluido en el concepto del sujeto, como el hombre es animal, ya que el predicado animal está incluido en el concepto de hombre. De este modo, si todos conocieran en qué consiste el predicado y en qué el sujeto, la proposición sería evidente para nosotros. Esto es lo que sucede con los primeros principios de la demostración, pues sus términos como ser-no ser, todo-parte, y otros parecidos, son tan comunes que nadie los ignora. Por el contrario, si algunos no conocen en qué consiste el predicado y en qué el sujeto, la proposición será evidente en sí misma, pero no lo será para los que desconocen en qué consiste el predicado y en qué el sujeto de la proposición. Así ocurre, como dice Boecio, que hay conceptos del espíritu comunes para todos y evidentes por sí mismos que solo comprenden los sabios, por ejemplo, lo incorpóreo no ocupa lugar. Por consiguiente, digo: La proposición Dios existe, en cuanto tal, es evidente por sí misma, ya que en Dios sujeto y predicado son lo mismo, pues Dios es su mismo ser […]. Pero, puesto que no sabemos en qué consiste Dios, para nosotros no es evidente, sino que necesitamos demostrarlo a través de aquello que es más evidente para nosotros y menos por su naturaleza, esto es, por los efectos»",
      preguntas: [preguntaTextoClasica('B')],
    },
  ],
  preguntasComunes: [
    {
      id: "A.2",
      titulo: "A.2 — El problema del ser humano en un autor o corriente filosófica de la época mediev",
      enunciado: "Exponga el problema del ser humano en un autor o corriente filosófica de la época medieval.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.3",
      titulo: "A.3 — El problema de Dios en un autor o corriente filosófica de la época moderna",
      enunciado: "Exponga el problema de Dios en un autor o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.4",
      titulo: "A.4 — El problema de la ética y/o moral en un autor o corriente filosófica de la época",
      enunciado: "Exponga el problema de la ética y/o moral en un autor o corriente filosófica de la época contemporánea.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "B.2",
      titulo: "B.2 — El problema del conocimiento y/o realidad en un autor o corriente filosófica de",
      enunciado: "Exponga el problema del conocimiento y/o realidad en un autor o corriente filosófica de la época antigua.",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.3",
      titulo: "B.3 — El problema de la sociedad y/o política en un autor o corriente filosófica de la",
      enunciado: "Exponga el problema de la sociedad y/o política en un autor o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.4",
      titulo: "B.4 — El problema del ser humano en un autor o corriente filosófica de la época contem",
      enunciado: "Exponga el problema del ser humano en un autor o corriente filosófica de la época contemporánea.  HISTORIA DE LA FILOSOFÍA",
      puntos: 2.5,
      bloque: "Texto B"
    }
  ],
},
{
  id: "historia-filosofia-mad-2018-modelo",
  comunidad: "Madrid",
  asignatura: "historia_filosofia",
  anio: 2018,
  curso: "2017-2018",
  convocatoria: "modelo",
  formato: "madrid_clasico_texto_ab_tres_preguntas",
  instrucciones: instruccionesClasicas,
  duracion: "90 minutos",
  criteriosGenerales: criteriosClasicos,
  textos: [
    {
      opcion: "A",
      autor: "TOMÁS DE AQUINO",
      obra: "Suma teológica",
      problema: "En este texto, Tomás de Aquino reflexiona sobre el problema de Dios.",
      texto: "«Pues nos encontramos que en el mundo sensible hay un orden de causas eficientes. Sin embargo, no encontramos, ni es posible, que algo sea causa eficiente de sí mismo, pues sería anterior a sí mismo, cosa imposible. En las causas eficientes no es posible proceder indefinidamente porque en todas las causas eficientes hay orden: la primera es causa de la intermedia; y esta, sea una o múltiple, lo es de la última. Puesto que, si se quita la causa, desaparece el efecto, si en el orden de las causas eficientes no existiera la primera, no se daría tampoco ni la última ni la intermedia. Si en las causas eficientes llevásemos hasta el infinito este proceder, no existiría la primera causa eficiente; en consecuencia no habría efecto último ni causa intermedia; y esto es absolutamente falso. Por lo tanto, es necesario admitir una causa eficiente primera. Todos la llaman Dios»",
      preguntas: [preguntaTextoClasica('A')],
    },
    {
      opcion: "B",
      autor: "ORTEGA Y GASSET",
      obra: "El tema de nuestro tiempo",
      problema: "En este texto, Ortega y Gasset reflexiona sobre el concepto de verdad como perspectiva.",
      texto: "«Cada vida es un punto de vista sobre el universo. En rigor, lo que ella ve no lo puede ver otra. Cada individuo —persona, pueblo, época— es un órgano insustituible para la conquista de la verdad. He aquí cómo ésta, que por sí misma es ajena a las variaciones históricas, adquiere una dimensión vital. Sin el desarrollo, el cambio perpetuo y la inagotable aventura que constituyen la vida, el universo, la omnímoda verdad, quedaría ignorado. El error inveterado consistía en suponer que la realidad tenía por sí misma, e independientemente del punto de vista que sobre ella se tomara, una fisonomía propia. Pensando así, claro está, toda visión de ella desde un punto determinado no coincidiría con ese su aspecto absoluto y, por tanto, sería falsa. Pero es el caso que la realidad, como un paisaje, tiene infinitas perspectivas, todas ellas igualmente verídicas y auténticas. La sola perspectiva falsa es esa que pretende ser la única. Dicho de otra manera: lo falso es la utopía, la verdad no localizada, vista desde «lugar ninguno». El utopista —y esto ha sido en esencia el racionalismo— es el que más yerra, porque es el hombre que no se conserva fiel a su punto de vista, que deserta de su puesto»",
      preguntas: [preguntaTextoClasica('B')],
    },
  ],
  preguntasComunes: [
    {
      id: "A.2",
      titulo: "A.2 — Explicar el problema del conocimiento en un autor o corriente filosófica de la é",
      enunciado: "Explicar el problema del conocimiento en un autor o corriente filosófica de la época antigua (2,5 puntos).",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.3",
      titulo: "A.3 — Explicar el problema de la ética en un autor o corriente filosófica de la época",
      enunciado: "Explicar el problema de la ética en un autor o corriente filosófica de la época moderna (2,5 puntos).",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.4",
      titulo: "A.4 — Explicar el problema de la sociedad y/o política en un autor o corriente filosóf",
      enunciado: "Explicar el problema de la sociedad y/o política en un autor o corriente filosófica de la época contemporánea (2,5 puntos).",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "B.2",
      titulo: "B.2 — Explicar el problema de la ética en un autor o corriente filosófica de la época",
      enunciado: "Explicar el problema de la ética en un autor o corriente filosófica de la época medieval (2,5 puntos).",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.3",
      titulo: "B.3 — Explicar el problema de la sociedad y/o política en un autor o corriente filosóf",
      enunciado: "Explicar el problema de la sociedad y/o política en un autor o corriente filosófica de la época moderna (2,5 puntos).",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.4",
      titulo: "B.4 — Explicar el problema del ser humano en un autor o corriente filosófica de la épo",
      enunciado: "Explicar el problema del ser humano en un autor o corriente filosófica de la época contemporánea (2,5 puntos).  HISTORIA DE LA FILOSOFÍA",
      puntos: 2.5,
      bloque: "Texto B"
    }
  ],
},
{
  id: "historia-filosofia-mad-2018-ordinaria",
  comunidad: "Madrid",
  asignatura: "historia_filosofia",
  anio: 2018,
  curso: "2017-2018",
  convocatoria: "ordinaria",
  formato: "madrid_clasico_texto_ab_tres_preguntas",
  instrucciones: instruccionesClasicas,
  duracion: "90 minutos",
  criteriosGenerales: criteriosClasicos,
  textos: [
    {
      opcion: "A",
      autor: "René Descartes",
      obra: "Meditaciones\nmetafísicas",
      problema: "En este texto, Descartes reflexiona sobre el problema del conocimiento.",
      texto: "«Para procurar ahora extender mi conocimiento, seré circunspecto y consideraré con cuidado si no podré descubrir en mí otras cosas más de las que no me he apercibido todavía. Estoy seguro de que soy una cosa que piensa; pero ¿no sé también cuáles son los requisitos precisos para estar cierto de algo? Desde luego, en este mi primer conocimiento nada hay que me asegure su verdad, si no es la percepción clara y distinta de lo que digo, la cual no sería, por cierto, suficiente para asegurar que lo que digo es verdad, si pudiese ocurrir alguna vez que fuese falsa una cosa concebida por mí de ese modo claro y distinto; por lo cual me parece que ya puedo establecer esta regla general: que todas las cosas que concebimos muy clara y distintamente son verdaderas»",
      preguntas: [preguntaTextoClasica('A')],
    },
    {
      opcion: "B",
      autor: "Autor no especificado",
      obra: "Obra no especificada",
      problema: "en este texto sobre el concepto de política deliberativa.",
      texto: "«El concepto de una política deliberativa solo cobra una referencia empírica cuando tenemos en cuenta la pluralidad de formas de comunicación en las que se configura una voluntad común, a saber: no sólo por medio de la autocomprensión ética, sino también mediante acuerdos de intereses y compromisos, mediante la elección racional de medios en relación a un fin, las fundamentaciones morales y la comprobación de lo coherente jurídicamente […]. Si están suficientemente institucionalizadas las correspondientes condiciones de comunicación, la política dialógica y la política instrumental pueden entrelazarse en el medio que representan las deliberaciones. Todo depende, pues, de las condiciones de la comunicación y de los procedimientos que prestan su fuerza legitimadora a la formación institucionalizada de la opinión y de la voluntad común. El tercer modelo de democracia que yo quisiera proponer se apoya precisamente en las condiciones comunicativas bajo las cuales el proceso político tiene para sí la presunción de producir resultados racionales porque se lleva a cabo en toda su extensión de un modo deliberativo» (JÜRGEN HABERMAS, Tres modelos normativos de democracia). Habermas reflexiona en este texto sobre el concepto de política deliberativa.",
      preguntas: [preguntaTextoClasica('B')],
    },
  ],
  preguntasComunes: [
    {
      id: "A.2",
      titulo: "A.2 — El problema de Dios en un autor o corriente filosófica de la época medieval",
      enunciado: "Exponga el problema de Dios en un autor o corriente filosófica de la época medieval.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.3",
      titulo: "A.3 — El problema de la sociedad y/o política en un autor o corriente filosófica de la",
      enunciado: "Exponga el problema de la sociedad y/o política en un autor o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.4",
      titulo: "A.4 — El problema del ser humano en un autor o corriente filosófica de la época contem",
      enunciado: "Exponga el problema del ser humano en un autor o corriente filosófica de la época contemporánea.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "B.2",
      titulo: "B.2 — El problema del conocimiento y/o realidad en un autor o corriente filosófica de",
      enunciado: "Exponga el problema del conocimiento y/o realidad en un autor o corriente filosófica de la época antigua.",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.3",
      titulo: "B.3 — El problema de Dios en un autor o corriente filosófica de la época moderna",
      enunciado: "Exponga el problema de Dios en un autor o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.4",
      titulo: "B.4 — El problema de la ética y/o moral en un autor o corriente filosófica de la época",
      enunciado: "Exponga el problema de la ética y/o moral en un autor o corriente filosófica de la época contemporánea.  HISTORIA DE LA FILOSOFÍA",
      puntos: 2.5,
      bloque: "Texto B"
    }
  ],
},
{
  id: "historia-filosofia-mad-2019-extraordinaria",
  comunidad: "Madrid",
  asignatura: "historia_filosofia",
  anio: 2019,
  curso: "2018-2019",
  convocatoria: "extraordinaria",
  formato: "madrid_clasico_texto_ab_tres_preguntas",
  instrucciones: instruccionesClasicas,
  duracion: "90 minutos",
  criteriosGenerales: criteriosClasicos,
  textos: [
    {
      opcion: "A",
      autor: "Ortega y Gasset reflexiona en este texto sobre el problema del conocimiento",
      obra: "Obra no especificada",
      problema: "en este texto sobre el problema del conocimiento.",
      texto: "«Lo que acontece con la visión corpórea se cumple igualmente en todo lo demás. Todo conocimiento lo es desde un punto de vista determinado. La species aeternitatis de Spinoza, el punto de vista ubicuo, absoluto, no existe propiamente: es un punto de vista ficticio y abstracto. No dudamos de su utilidad instrumental para ciertos menesteres del conocimiento; pero es preciso no olvidar que desde él no se ve lo real. El punto de vista abstracto solo proporciona abstracciones. Esta manera de pensar lleva a una reforma radical de la filosofía y, lo que importa más, de nuestra sensación cósmica. La individualidad de cada sujeto real era el indominable estorbo que la tradición intelectual de los últimos tiempos encontraba para que el conocimiento pudiese justificar su pretensión de conseguir la verdad. Dos sujetos diferentes –se pensaba– llegarán a verdades divergentes. Ahora vemos que la divergencia entre los mundos de dos sujetos no implica la falsedad de uno de ellos. Al contrario, precisamente porque lo que cada cual ve es una realidad y no una ficción, tiene que ser su aspecto distinto del que otro percibe. Esa divergencia no es contradicción, sino complemento» (JOSÉ ORTEGA Y GASSET, El tema de nuestro tiempo).",
      preguntas: [preguntaTextoClasica('A')],
    },
    {
      opcion: "B",
      autor: "TOMÁS DE\nAQUINO",
      obra: "Suma Teológica",
      problema: "Este texto trata el problema del conocimiento, en concreto de cómo el ser humano conoce a Dios.",
      texto: "«[…] Que existe la verdad es evidente por sí mismo, puesto que quien niega que la verdad existe está diciendo que la verdad existe; pues si la verdad no existe, es verdadero que la verdad no existe. Pero para que algo sea verdadero, es necesario que exista la verdad. Dios es la misma verdad. Jn 14, 6: Yo soy el camino, la verdad y la vida. Por lo tanto, que Dios existe es evidente por sí mismo»",
      preguntas: [preguntaTextoClasica('B')],
    },
  ],
  preguntasComunes: [
    {
      id: "A.2",
      titulo: "A.2 — El problema de la ética y/o moral en un autor o corriente filosófica de la época",
      enunciado: "Exponga el problema de la ética y/o moral en un autor o corriente filosófica de la época medieval.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.3",
      titulo: "A.3 — El problema del ser humano en un autor o corriente filosófica de la época modern",
      enunciado: "Exponga el problema del ser humano en un autor o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.4",
      titulo: "A.4 — El problema de Dios en un autor o corriente filosófica de la época contemporánea",
      enunciado: "Exponga el problema de Dios en un autor o corriente filosófica de la época contemporánea.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "B.2",
      titulo: "B.2 — El problema del ser humano en un autor o corriente filosófica de la época antigu",
      enunciado: "Exponga el problema del ser humano en un autor o corriente filosófica de la época antigua.",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.3",
      titulo: "B.3 — El problema de la ética y/o moral en un autor o corriente filosófica de la época",
      enunciado: "Exponga el problema de la ética y/o moral en un autor o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.4",
      titulo: "B.4 — El problema de la sociedad y/o política en un autor o corriente filosófica de la",
      enunciado: "Exponga el problema de la sociedad y/o política en un autor o corriente filosófica de la época contemporánea.  HISTORIA DE LA FILOSOFÍA",
      puntos: 2.5,
      bloque: "Texto B"
    }
  ],
},
{
  id: "historia-filosofia-mad-2019-modelo",
  comunidad: "Madrid",
  asignatura: "historia_filosofia",
  anio: 2019,
  curso: "2018-2019",
  convocatoria: "modelo",
  formato: "madrid_clasico_texto_ab_tres_preguntas",
  instrucciones: instruccionesClasicas,
  duracion: "90 minutos",
  criteriosGenerales: criteriosClasicos,
  textos: [
    {
      opcion: "A",
      autor: "René Descartes",
      obra: "\nMeditaciones metafísicas",
      problema: "En este texto, Descartes reflexiona sobre el problema de la existencia de Dios.",
      texto: "«Por ello, pasaré adelante y consideraré si yo mismo, que tengo esa idea de Dios, podría existir, en el caso de que no hubiera Dios. Y pregunto: ¿de quién habría recibido mi existencia? Pudiera ser que de mí mismo, o bien de mis padres, o bien de otras causas que, en todo caso, serían menos perfectas que Dios, pues nada puede imaginarse más perfecto que Él, y ni siquiera igual a Él. Ahora bien: si yo fuese independiente de cualquier otro, si yo mismo fuese el autor de mi ser, entonces no dudaría de nada, nada desearía, y ninguna perfección me faltaría, pues me habría dado a mí mismo todas aquellas de las que tengo alguna idea; y así, yo sería Dios»",
      preguntas: [preguntaTextoClasica('A')],
    },
    {
      opcion: "B",
      autor: "F. NIETZSCHE",
      obra: "La gaya ciencia",
      problema: "En este texto, Nietzsche reflexiona sobre el problema de la moral.",
      texto: "«¿Cómo es posible que no haya encontrado a nadie, ni siquiera en los libros, que se situase en esta posición como persona con respecto a la moral, que reconociese la moral como su necesidad, tormento, placer y pasión personales? Visiblemente hasta ahora la moral no fue problema, sino más bien aquello en que venían a ponerse de acuerdo unos con otros después de toda desconfianza, discrepancia y contradicción, el lugar santificado de la paz, donde los pensadores descansaban, incluso de sí mismos, tomaban aliento y surgían de nuevo. No veo a nadie que se haya atrevido a hacer una crítica de los juicios morales. […] Nadie ha puesto, pues, a prueba hasta ahora el valor de la más famosa de todas las medicinas, la llamada moral, para lo cual es de todo punto necesario en primer lugar que alguien por fin… la ponga en duda. ¡Ánimo, esta es precisamente nuestra tarea!»",
      preguntas: [preguntaTextoClasica('B')],
    },
  ],
  preguntasComunes: [
    {
      id: "A.2",
      titulo: "A.2 — El problema de la ética y/o moral en un autor o corriente filosófica de la época",
      enunciado: "Exponga el problema de la ética y/o moral en un autor o corriente filosófica de la época medieval.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.3",
      titulo: "A.3 — El problema del ser humano en un autor o corriente filosófica de la época modern",
      enunciado: "Exponga el problema del ser humano en un autor o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.4",
      titulo: "A.4 — El problema del conocimiento y/o realidad en un autor o corriente filosófica de",
      enunciado: "Exponga el problema del conocimiento y/o realidad en un autor o corriente filosófica de la época contemporánea.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "B.2",
      titulo: "B.2 — El problema del conocimiento y/o realidad en un autor o corriente filosófica de",
      enunciado: "Exponga el problema del conocimiento y/o realidad en un autor o corriente filosófica de la época antigua.",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.3",
      titulo: "B.3 — El problema de Dios en un autor o corriente filosófica de la época moderna",
      enunciado: "Exponga el problema de Dios en un autor o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.4",
      titulo: "B.4 — El problema de la sociedad y/o política en un autor o corriente filosófica de la",
      enunciado: "Exponga el problema de la sociedad y/o política en un autor o corriente filosófica de la época contemporánea.  HISTORIA DE LA FILOSOFÍA",
      puntos: 2.5,
      bloque: "Texto B"
    }
  ],
},
{
  id: "historia-filosofia-mad-2019-ordinaria",
  comunidad: "Madrid",
  asignatura: "historia_filosofia",
  anio: 2019,
  curso: "2018-2019",
  convocatoria: "ordinaria",
  formato: "madrid_clasico_texto_ab_tres_preguntas",
  instrucciones: instruccionesClasicas,
  duracion: "90 minutos",
  criteriosGenerales: criteriosClasicos,
  textos: [
    {
      opcion: "A",
      autor: "René Descartes",
      obra: "Meditaciones metafísicas",
      problema: "En este texto, Descartes reflexiona sobre el problema del conocimiento.",
      texto: "«Y por cierto que, no teniendo yo ninguna razón para creer que haya algún Dios engañador y no habiendo aún considerado ninguna de las que prueban que hay un Dios, la razón de dudar, que depende solo de esta opinión, es muy leve y, por decirlo así, metafísica. Pero para poderla suprimir del todo, debo examinar si hay Dios, tan pronto como encuentre ocasión para ello; y si hallo que lo hay, debo examinar también si puede ser engañador; pues, sin conocer estas dos verdades, no veo cómo voy a poder nunca estar cierto de cosa alguna. Y para poder encontrar alguna ocasión de indagar todo esto, sin interrumpir el orden que me he propuesto en estas meditaciones, que es pasar gradualmente de las primeras nociones que halle en mi espíritu a las que luego pueda encontrar, debo dividir aquí todos mis pensamientos en ciertos géneros y considerar en cuáles de estos géneros hay propiamente verdad o error»",
      preguntas: [preguntaTextoClasica('A')],
    },
    {
      opcion: "B",
      autor: "JÜRGEN\nHABERMAS",
      obra: "«Tres modelos normativos de democracia», en La inclusión del otro",
      problema: "Este texto trata el problema de la política.",
      texto: "«Si están suficientemente institucionalizadas las correspondientes condiciones de comunicación, la política dialógica y la política instrumental pueden entrelazarse en el medio que representan las deliberaciones. Todo depende, pues, de las condiciones de la comunicación y de los procedimientos que prestan su fuerza legitimadora a la formación institucionalizada de la opinión y de la voluntad común. El tercer modelo de democracia que yo quisiera proponer se apoya precisamente en las condiciones comunicativas bajo las cuales el proceso político tiene para sí la presunción de producir resultados racionales porque se lleva a cabo en toda su extensión de un modo deliberativo»",
      preguntas: [preguntaTextoClasica('B')],
    },
  ],
  preguntasComunes: [
    {
      id: "A.2",
      titulo: "A.2 — El problema de la sociedad y/o política en un autor o corriente filosófica de la",
      enunciado: "Exponga el problema de la sociedad y/o política en un autor o corriente filosófica de la época antigua.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.3",
      titulo: "A.3 — El problema de la ética y/o moral en un autor o corriente filosófica de la época",
      enunciado: "Exponga el problema de la ética y/o moral en un autor o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.4",
      titulo: "A.4 — El problema del ser humano en un autor o corriente filosófica de la época contem",
      enunciado: "Exponga el problema del ser humano en un autor o corriente filosófica de la época contemporánea.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "B.2",
      titulo: "B.2 — El problema del conocimiento y/o realidad en un autor o corriente filosófica de",
      enunciado: "Exponga el problema del conocimiento y/o realidad en un autor o corriente filosófica de la época medieval.",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.3",
      titulo: "B.3 — El problema del ser humano en un autor o corriente filosófica de la época modern",
      enunciado: "Exponga el problema del ser humano en un autor o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.4",
      titulo: "B.4 — El problema de la ética y/o moral en un autor o corriente filosófica de la época",
      enunciado: "Exponga el problema de la ética y/o moral en un autor o corriente filosófica de la época contemporánea.  HISTORIA DE LA FILOSOFÍA",
      puntos: 2.5,
      bloque: "Texto B"
    }
  ],
},
{
  id: "historia-filosofia-mad-2020-extraordinaria",
  comunidad: "Madrid",
  asignatura: "historia_filosofia",
  anio: 2020,
  curso: "2019-2020",
  convocatoria: "extraordinaria",
  formato: "madrid_clasico_texto_ab_tres_preguntas",
  instrucciones: instruccionesClasicas,
  duracion: "90 minutos",
  criteriosGenerales: criteriosClasicos,
  textos: [
    {
      opcion: "A",
      autor: "Kant reflexiona en este texto sobre la necesidad de los conocimientos a priori",
      obra: "Obra no especificada",
      problema: "en este texto sobre la necesidad de los conocimientos a priori.",
      texto: "«Es fácil mostrar que existen realmente en el conocimiento humano semejantes juicios necesarios y estrictamente universales, es decir, juicios puros a priori. Si queremos un ejemplo de las ciencias, solo necesitamos fijarnos en todas las proposiciones de las matemáticas. Si queremos un ejemplo extraído del uso más ordinario del entendimiento, puede servir la proposición “Todo cambio ha de tener su causa”. Efectivamente en esta última el concepto mismo de causa encierra con tal evidencia el concepto de necesidad de conexión con un efecto y el de estricta universalidad de la regla, que dicho concepto desaparecería totalmente si quisiéramos derivarlo, como hizo Hume, de una repetida asociación entre lo que ocurre y lo que precede y la costumbre (es decir, de una necesidad meramente subjetiva), nacida de tal asociación, de enlazar representaciones. Podríamos también, sin acudir a tales ejemplos para demostrar que existe en nuestro conocimiento principios puros a priori, mostrar que estos son indispensables para que sea posible la experiencia misma y, consiguientemente, exponerlos a priori. Pues ¿de dónde sacaría la misma experiencia su certeza si todas las reglas conforme a las cuales avanza fueran empíricas y, por tanto, contingentes?» (IMMANUEL KANT, Crítica de la razón pura).",
      preguntas: [preguntaTextoClasica('A')],
    },
    {
      opcion: "B",
      autor: "JÜRGEN\nHABERMAS",
      obra: "«Tres modelos normativos de democracia», en La inclusión del otro",
      problema: "En este texto, Habermas reflexiona sobre la cuestión de la sociedad.",
      texto: "«Pero en las condiciones de pluralismo social y cultural, tras los objetivos políticamente relevantes se encuentran a menudo intereses y orientaciones valorativas que en ningún modo son elementos constitutivos de la identidad de la comunidad en su conjunto, esto es, del conjunto de una forma de vida compartida intersubjetivamente. Estos intereses y orientaciones valorativas, que en el interior de la misma comunidad entran en conflicto con otros sin ninguna perspectiva de conseguir un consenso, tienen necesidad de un acuerdo o compromiso que no ha de alcanzarse mediante discursos éticos, aun cuando los resultados de ese acuerdo o compromiso no obtenido discursivamente estén sujetos a la reserva de no vulnerar los valores fundamentales de una cultura que concitan consenso»",
      preguntas: [preguntaTextoClasica('B')],
    },
  ],
  preguntasComunes: [
    {
      id: "A.2",
      titulo: "A.2 — El problema de la ética y/o moral en un autor o corriente filosófica de la época",
      enunciado: "Exponga el problema de la ética y/o moral en un autor o corriente filosófica de la época medieval.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.3",
      titulo: "A.3 — El problema de Dios en un autor o corriente filosófica de la época moderna",
      enunciado: "Exponga el problema de Dios en un autor o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.4",
      titulo: "A.4 — El problema del ser humano en un autor o corriente filosófica de la época contem",
      enunciado: "Exponga el problema del ser humano en un autor o corriente filosófica de la época contemporánea.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "B.2",
      titulo: "B.2 — El problema del conocimiento y/o realidad en un autor o corriente filosófica de",
      enunciado: "Exponga el problema del conocimiento y/o realidad en un autor o corriente filosófica de la época antigua.",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.3",
      titulo: "B.3 — El problema del ser humano en un autor o corriente filosófica de la época modern",
      enunciado: "Exponga el problema del ser humano en un autor o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.4",
      titulo: "B.4 — El problema de la ética y/o moral en un autor o corriente filosófica de la época",
      enunciado: "Exponga el problema de la ética y/o moral en un autor o corriente filosófica de la época contemporánea.  6 HISTORIA DE LA FILOSO",
      puntos: 2.5,
      bloque: "Texto B"
    }
  ],
},
{
  id: "historia-filosofia-mad-2020-ordinaria-coincidencias",
  comunidad: "Madrid",
  asignatura: "historia_filosofia",
  anio: 2020,
  curso: "2019-2020",
  convocatoria: "ordinaria",
  variante: "Coincidencias",
  formato: "madrid_clasico_texto_ab_tres_preguntas",
  instrucciones: instruccionesClasicas,
  duracion: "90 minutos",
  criteriosGenerales: criteriosClasicos,
  textos: [
    {
      opcion: "A",
      autor: "Platón",
      obra: "Fedón",
      problema: "En este texto, Platón reflexiona sobre el problema del conocimiento.",
      texto: "«— ¿Y no decíamos también hace un momento que el alma, cuando usa del cuerpo para considerar algo, bien sea mediante la vista, el oído o algún otro sentido ‒pues es valerse del cuerpo como instrumento el considerar algo mediante un sentido‒, es arrastrada por el cuerpo a lo que nunca se presenta en el mismo estado y se extravía, se embrolla y se marea como si estuviera ebria, por haber entrado en contacto con cosas de esta índole? — En efecto. — ¿Y no agregábamos que, por el contrario, cuando reflexiona a solas consigo misma, allá se va, a lo que es puro, existe siempre, es inmortal y siempre se presenta del mismo modo? ¿Y que, como si fuera por afinidad, se reúne con ello siempre que queda a solas consigo misma y le es posible, y cesa su extravío y siempre queda igual y en el mismo estado con relación a esas realidades, puesto que ha entrado en contacto con objetos que, asimismo, son idénticos e inmutables? ¿Y que esta experiencia del alma se llama pensamiento?»",
      preguntas: [preguntaTextoClasica('A')],
    },
    {
      opcion: "B",
      autor: "JEAN-JACQUES ROUSSEAU",
      obra: "Del contrato social",
      problema: "En este texto, Rousseau reflexiona sobre la relación entre el individuo y la sociedad.",
      texto: "«A fin, pues, de que el pacto social no sea un vano formulario, implica tácitamente el compromiso, el único que puede dar fuerza a los demás, de que quien rehúse obedecer a la voluntad general será obligado a ello por todo el cuerpo: lo cual no significa sino que se le forzará a ser libre; porque esa es la condición que, dando cada ciudadano a la patria, le garantiza de toda dependencia personal; condición que constituye el artificio y el juego de la máquina política, y la única que hace legítimos los compromisos civiles, que sin eso serían absurdos y tiránicos y estarían sometidos a los abusos más enormes»",
      preguntas: [preguntaTextoClasica('B')],
    },
  ],
  preguntasComunes: [
    {
      id: "A.2",
      titulo: "A.2 — El problema de Dios en un autor o corriente filosófica de la época medieval",
      enunciado: "Exponga el problema de Dios en un autor o corriente filosófica de la época medieval.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.3",
      titulo: "A.3 — El problema del ser humano en un autor o corriente filosófica de la época modern",
      enunciado: "Exponga el problema del ser humano en un autor o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.4",
      titulo: "A.4 — El problema de la ética y/o moral en un autor o corriente filosófica de la época",
      enunciado: "Exponga el problema de la ética y/o moral en un autor o corriente filosófica de la época contemporánea.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "B.2",
      titulo: "B.2 — El problema de la ética y/o moral en un autor o corriente filosófica de la época",
      enunciado: "Exponga el problema de la ética y/o moral en un autor o corriente filosófica de la época antigua.",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.3",
      titulo: "B.3 — El problema de Dios en un autor o corriente filosófica de la época moderna",
      enunciado: "Exponga el problema de Dios en un autor o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.4",
      titulo: "B.4 — El problema del ser humano en un autor o corriente filosófica de la época contem",
      enunciado: "Exponga el problema del ser humano en un autor o corriente filosófica de la época contemporánea.  4 HISTORIA DE LA FILOSOFÍA",
      puntos: 2.5,
      bloque: "Texto B"
    }
  ],
},
{
  id: "historia-filosofia-mad-2020-ordinaria",
  comunidad: "Madrid",
  asignatura: "historia_filosofia",
  anio: 2020,
  curso: "2019-2020",
  convocatoria: "ordinaria",
  formato: "madrid_clasico_texto_ab_tres_preguntas",
  instrucciones: instruccionesClasicas,
  duracion: "90 minutos",
  criteriosGenerales: criteriosClasicos,
  textos: [
    {
      opcion: "A",
      autor: "Kant reflexiona en este texto sobre la necesidad de los conocimientos a priori",
      obra: "Obra no especificada",
      problema: "en este texto sobre la necesidad de los conocimientos a priori.",
      texto: "«Es fácil mostrar que existen realmente en el conocimiento humano semejantes juicios necesarios y estrictamente universales, es decir, juicios puros a priori. Si queremos un ejemplo de las ciencias, solo necesitamos fijarnos en todas las proposiciones de las matemáticas. Si queremos un ejemplo extraído del uso más ordinario del entendimiento, puede servir la proposición “Todo cambio ha de tener su causa”. Efectivamente en esta última el concepto mismo de causa encierra con tal evidencia el concepto de necesidad de conexión con un efecto y el de estricta universalidad de la regla, que dicho concepto desaparecería totalmente si quisiéramos derivarlo, como hizo Hume, de una repetida asociación entre lo que ocurre y lo que precede y la costumbre (es decir, de una necesidad meramente subjetiva), nacida de tal asociación, de enlazar representaciones. Podríamos también, sin acudir a tales ejemplos para demostrar que existe en nuestro conocimiento principios puros a priori, mostrar que estos son indispensables para que sea posible la experiencia misma y, consiguientemente, exponerlos a priori. Pues ¿de dónde sacaría la misma experiencia su certeza si todas las reglas conforme a las cuales avanza fueran empíricas y, por tanto, contingentes?» (IMMANUEL KANT, Crítica de la razón pura).",
      preguntas: [preguntaTextoClasica('A')],
    },
    {
      opcion: "B",
      autor: "JÜRGEN\nHABERMAS",
      obra: "«Tres modelos normativos de democracia», en La inclusión del otro",
      problema: "En este texto, Habermas reflexiona sobre la cuestión de la sociedad.",
      texto: "«Pero en las condiciones de pluralismo social y cultural, tras los objetivos políticamente relevantes se encuentran a menudo intereses y orientaciones valorativas que en ningún modo son elementos constitutivos de la identidad de la comunidad en su conjunto, esto es, del conjunto de una forma de vida compartida intersubjetivamente. Estos intereses y orientaciones valorativas, que en el interior de la misma comunidad entran en conflicto con otros sin ninguna perspectiva de conseguir un consenso, tienen necesidad de un acuerdo o compromiso que no ha de alcanzarse mediante discursos éticos, aun cuando los resultados de ese acuerdo o compromiso no obtenido discursivamente estén sujetos a la reserva de no vulnerar los valores fundamentales de una cultura que concitan consenso»",
      preguntas: [preguntaTextoClasica('B')],
    },
  ],
  preguntasComunes: [
    {
      id: "A.2",
      titulo: "A.2 — El problema de la ética y/o moral en un autor o corriente filosófica de la época",
      enunciado: "Exponga el problema de la ética y/o moral en un autor o corriente filosófica de la época medieval.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.3",
      titulo: "A.3 — El problema de Dios en un autor o corriente filosófica de la época moderna",
      enunciado: "Exponga el problema de Dios en un autor o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.4",
      titulo: "A.4 — El problema del ser humano en un autor o corriente filosófica de la época contem",
      enunciado: "Exponga el problema del ser humano en un autor o corriente filosófica de la época contemporánea.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "B.2",
      titulo: "B.2 — El problema del conocimiento y/o realidad en un autor o corriente filosófica de",
      enunciado: "Exponga el problema del conocimiento y/o realidad en un autor o corriente filosófica de la época antigua.",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.3",
      titulo: "B.3 — El problema del ser humano en un autor o corriente filosófica de la época modern",
      enunciado: "Exponga el problema del ser humano en un autor o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.4",
      titulo: "B.4 — El problema de la ética y/o moral en un autor o corriente filosófica de la época",
      enunciado: "Exponga el problema de la ética y/o moral en un autor o corriente filosófica de la época contemporánea.  6 HISTORIA DE LA FILOSO",
      puntos: 2.5,
      bloque: "Texto B"
    }
  ],
},
{
  id: "historia-filosofia-mad-2021-extraordinaria",
  comunidad: "Madrid",
  asignatura: "historia_filosofia",
  anio: 2021,
  curso: "2020-2021",
  convocatoria: "extraordinaria",
  formato: "madrid_clasico_texto_ab_tres_preguntas",
  instrucciones: instruccionesClasicas,
  duracion: "90 minutos",
  criteriosGenerales: criteriosClasicos,
  textos: [
    {
      opcion: "A",
      autor: "JEAN-JACQUES ROUSSEAU",
      obra: "Del contrato\nsocial",
      problema: "En este texto, Rousseau reflexiona sobre el problema de la sociedad.",
      texto: "«Por lo tanto, si se aparta del pacto social lo que no pertenece a su esencia, encontraremos que se reduce a los siguientes términos: Cada uno de nosotros pone en común su persona y todo su poder bajo la suprema dirección de la voluntad general; y nosotros recibimos corporativamente a cada miembro como parte indivisible del todo. En el mismo instante, en lugar de la persona particular de cada contratante, este acto de asociación produce un cuerpo moral y colectivo, compuesto de tantos miembros como votos tiene la asamblea, el cual recibe de este mismo acto su unidad, su yo común, su vida y su voluntad. Esta persona pública que se forma de este modo por la unión de todas las demás tomaba en otro tiempo el nombre de Ciudad, y toma ahora el de República»",
      preguntas: [preguntaTextoClasica('A')],
    },
    {
      opcion: "B",
      autor: "TOMÁS DE AQUINO",
      obra: "Suma teológica",
      problema: "En este texto, Tomás de Aquino reflexiona sobre posibilidad de demostrar la existencia de Dios.",
      texto: "«Toda demostración es doble. Una, por la causa, que es absolutamente previa a cualquier cosa. Se la llama: a causa de. Otra, por el efecto, que es lo primero con lo que nos encontramos; pues el efecto se nos presenta como más evidente que la causa, y por el efecto llegamos a conocer la causa. Se la llama: porque. Por cualquier efecto puede ser demostrada su causa (siempre que los efectos de la causa se nos presenten como más evidentes): pues, como quiera que los efectos dependen de la causa, dado el efecto, necesariamente antes se ha dado la causa. De donde se deduce que la existencia de Dios, aun cuando en sí misma no se nos presenta como evidente, en cambio sí es demostrable por los efectos con que nos encontramos»",
      preguntas: [preguntaTextoClasica('B')],
    },
  ],
  preguntasComunes: [
    {
      id: "A.2",
      titulo: "A.2 — El problema del ser humano en un autor o corriente filosófica de la época mediev",
      enunciado: "Exponga el problema del ser humano en un autor o corriente filosófica de la época medieval.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.3",
      titulo: "A.3 — El problema del conocimiento y/o realidad en un autor o corriente filosófica de",
      enunciado: "Exponga el problema del conocimiento y/o realidad en un autor o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.4",
      titulo: "A.4 — El problema de la ética y/o moral en un autor o corriente filosófica de la época",
      enunciado: "Exponga el problema de la ética y/o moral en un autor o corriente filosófica de la época contemporánea.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "B.2",
      titulo: "B.2 — El problema de la ética y/o moral en un autor o corriente filosófica de la época",
      enunciado: "Exponga el problema de la ética y/o moral en un autor o corriente filosófica de la época antigua.",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.3",
      titulo: "B.3 — El problema del ser humano en un autor o corriente filosófica de la época modern",
      enunciado: "Exponga el problema del ser humano en un autor o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.4",
      titulo: "B.4 — El problema de la sociedad y/o política en un autor o corriente filosófica de la",
      enunciado: "Exponga el problema de la sociedad y/o política en un autor o corriente filosófica de la época contemporánea.  HISTORIA DE LA FILOSOFÍA",
      puntos: 2.5,
      bloque: "Texto B"
    }
  ],
},
{
  id: "historia-filosofia-mad-2021-modelo",
  comunidad: "Madrid",
  asignatura: "historia_filosofia",
  anio: 2021,
  curso: "2020-2021",
  convocatoria: "modelo",
  formato: "madrid_clasico_texto_ab_tres_preguntas",
  instrucciones: instruccionesClasicas,
  duracion: "90 minutos",
  criteriosGenerales: criteriosClasicos,
  textos: [
    {
      opcion: "A",
      autor: "Kant reflexiona en este texto sobre la posibilidad de la metafísica",
      obra: "Obra no especificada",
      problema: "en este texto sobre la posibilidad de la metafísica.",
      texto: "«Más importancia que todo lo anterior tiene el hecho de que algunos conocimientos abandonen incluso el campo de toda experiencia posible, y posean la apariencia de extender nuestros juicios más allá de todos los límites de la misma por medio de conceptos a los que ningún objeto empírico puede corresponder. Y es precisamente en estos últimos conocimientos que traspasan el mundo de los sentidos y en los que la experiencia no puede proporcionar ni guía ni rectificación donde la razón desarrolla aquellas investigaciones que, por su importancia, nosotros consideramos como más sobresalientes y de finalidad más relevante que todo cuanto puede aprender el entendimiento en el campo fenoménico. Por ello preferimos afrontarlo todo, aún a riesgo de equivocarnos, antes que abandonar tan urgentes investigaciones por falta de resolución, por desdén o por indiferencia. Estos inevitables problemas de la misma razón pura son: Dios, la libertad y la inmortalidad. Pero la ciencia que, con todos sus aprestos, tiene por único objetivo final el resolverlos es la metafísica. Esta ciencia procede inicialmente de forma dogmática, es decir, emprende confiadamente la realización de una tarea tan ingente sin analizar de antemano la capacidad o incapacidad de la razón para llevarla a cabo» (IMMANUEL KANT, Crítica de la razón pura).",
      preguntas: [preguntaTextoClasica('A')],
    },
    {
      opcion: "B",
      autor: "TOMÁS DE AQUINO",
      obra: "Suma teológica",
      problema: "Este texto trata del problema filosófico de la existencia de Dios.",
      texto: "«La cuarta vía se toma de los grados que se encuentran en las cosas. Pues se encuentra en las cosas algo más y menos bueno, y verdadero, y noble, y así otras cosas semejantes. Pero este más y este menos se dice de las cosas en cuanto que se aproximan más o menos a lo máximo. Así, caliente se dice de aquello que se aproxima más al máximo calor. Hay algo, por tanto, que es verísimo y óptimo y nobilísimo; y, en consecuencia, es el máximo ser; pues las cosas que son máximamente verdaderas, son máximamente seres […]. Pero lo que es máximamente tal en algún género es la causa de todas las cosas que son de ese género, como el fuego, que es el máximo calor, es causa de todos los calores […]. Del mismo modo hay algo que en todos los seres es causa de su ser, de su bondad, de cualquier otra perfección, y a esto lo llamamos Dios»",
      preguntas: [preguntaTextoClasica('B')],
    },
  ],
  preguntasComunes: [
    {
      id: "A.2",
      titulo: "A.2 — El problema de la ética y/o moral en un autor o corriente filosófica de la época",
      enunciado: "Exponga el problema de la ética y/o moral en un autor o corriente filosófica de la época medieval.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.3",
      titulo: "A.3 — El problema de Dios en un autor o corriente filosófica de la época moderna",
      enunciado: "Exponga el problema de Dios en un autor o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.4",
      titulo: "A.4 — El problema del ser humano en un autor o corriente filosófica de la época contem",
      enunciado: "Exponga el problema del ser humano en un autor o corriente filosófica de la época contemporánea.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "B.2",
      titulo: "B.2 — El problema del conocimiento y/o realidad en un autor o corriente filosófica de",
      enunciado: "Exponga el problema del conocimiento y/o realidad en un autor o corriente filosófica de la época antigua.",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.3",
      titulo: "B.3 — El problema del ser humano en un autor o corriente filosófica de la época modern",
      enunciado: "Exponga el problema del ser humano en un autor o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.4",
      titulo: "B.4 — El problema de la ética y/o moral en un autor o corriente filosófica de la época",
      enunciado: "Exponga el problema de la ética y/o moral en un autor o corriente filosófica de la época contemporánea.  HISTORIA DE LA FILOSOFÍA",
      puntos: 2.5,
      bloque: "Texto B"
    }
  ],
},
{
  id: "historia-filosofia-mad-2021-ordinaria-coincidencias",
  comunidad: "Madrid",
  asignatura: "historia_filosofia",
  anio: 2021,
  curso: "2020-2021",
  convocatoria: "ordinaria",
  variante: "Coincidencias",
  formato: "madrid_clasico_texto_ab_tres_preguntas",
  instrucciones: instruccionesClasicas,
  duracion: "90 minutos",
  criteriosGenerales: criteriosClasicos,
  textos: [
    {
      opcion: "A",
      autor: "Immanuel Kant",
      obra: "Crítica de la razón pura",
      problema: "En este texto, Kant reflexiona sobre el problema del conocimiento.",
      texto: "«Mas, si bien todo nuestro conocimiento comienza con la experiencia, no por eso se origina todo él en la experiencia. Pues bien podría ser que nuestro conocimiento de experiencia fuera compuesto de lo que recibimos por medio de impresiones y de lo que nuestra propia facultad de conocer (con ocasión tan solo de las impresiones sensibles) proporciona por sí misma, sin que distingamos este añadido de aquella materia fundamental hasta que un largo ejercicio nos ha hecho atentos a ello y hábiles en separar ambas cosas. Es, pues, por lo menos una cuestión que necesita de una detenida investigación y que no ha de resolverse enseguida a primera vista, la de si hay un conocimiento semejante, independiente de la experiencia, y aún de toda impresión de los sentidos. Estos conocimientos se llaman a priori y se distinguen de los empíricos, que tienen sus fuentes a posteriori, a saber, en la experiencia»",
      preguntas: [preguntaTextoClasica('A')],
    },
    {
      opcion: "B",
      autor: "José Ortega y Gasset",
      obra: "El tema de nuestro\ntiempo",
      problema: "En este texto, Ortega reflexiona sobre el problema del conocimiento y la realidad.",
      texto: "«El error inveterado consistía en suponer que la realidad tenía por sí misma, e independientemente del punto de vista que sobre ella se tomara, una fisonomía propia. Pensando así, claro está, toda visión de ella desde un punto de vista determinado no coincidiría con ese su aspecto absoluto y, por tanto, sería falsa. Pero es el caso que la realidad, como un paisaje, tiene infinitas perspectivas, todas ellas igualmente verídicas y auténticas. La sola perspectiva falsa es la que pretende ser la única. Dicho de otra manera: lo falso es la utopía, la verdad no localizada, vista desde “lugar ninguno”. El utopista —y esto ha sido en esencia el racionalismo— es el que más yerra, pues es el hombre que no se conserva fiel a su punto de vista, que deserta de su puesto»",
      preguntas: [preguntaTextoClasica('B')],
    },
  ],
  preguntasComunes: [
    {
      id: "A.2",
      titulo: "A.2 — El problema de Dios en un autor o corriente filosófica de la época medieval",
      enunciado: "Exponga el problema de Dios en un autor o corriente filosófica de la época medieval.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.3",
      titulo: "A.3 — El problema de la sociedad y/o política en un autor o corriente filosófica de la",
      enunciado: "Exponga el problema de la sociedad y/o política en un autor o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.4",
      titulo: "A.4 — El problema de la ética y/o moral en un autor o corriente filosófica de la época",
      enunciado: "Exponga el problema de la ética y/o moral en un autor o corriente filosófica de la época contemporánea.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "B.2",
      titulo: "B.2 — El problema del ser humano en un autor o corriente filosófica de la época antigu",
      enunciado: "Exponga el problema del ser humano en un autor o corriente filosófica de la época antigua.",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.3",
      titulo: "B.3 — El problema de la ética y/o moral en un autor o corriente filosófica de la época",
      enunciado: "Exponga el problema de la ética y/o moral en un autor o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.4",
      titulo: "B.4 — El problema de Dios en un autor o corriente filosófica de la época contemporánea",
      enunciado: "Exponga el problema de Dios en un autor o corriente filosófica de la época contemporánea.  HISTORIA DE LA FILOSOFÍA",
      puntos: 2.5,
      bloque: "Texto B"
    }
  ],
},
{
  id: "historia-filosofia-mad-2022-extraordinaria-coincidencias",
  comunidad: "Madrid",
  asignatura: "historia_filosofia",
  anio: 2022,
  curso: "2021-2022",
  convocatoria: "extraordinaria",
  variante: "Coincidencias",
  formato: "madrid_clasico_texto_ab_tres_preguntas",
  instrucciones: instruccionesClasicas,
  duracion: "90 minutos",
  criteriosGenerales: criteriosClasicos,
  textos: [
    {
      opcion: "A",
      autor: "Immanuel Kant",
      obra: "Crítica de la razón pura",
      problema: "En este texto, Kant reflexiona acerca del conocimiento.",
      texto: "«Se trata de averiguar cuál es el criterio seguro para distinguir el conocimiento puro del conocimiento empírico. La experiencia nos enseña que algo tiene estas u otras características, pero no que no pueda ser de otro modo. En consecuencia, si se encuentra, en primer lugar, una proposición que, al ser pensada, es simultáneamente necesaria, tenemos un juicio a priori. Si, además, no deriva de otra que no sea válida, como proposición necesaria, entonces es una proposición absolutamente a priori. En segundo lugar, la experiencia nunca otorga a sus juicios una universalidad verdadera o estricta, sino simplemente supuesta o comparativa (inducción), de tal manera que debe decirse propiamente: de acuerdo con lo que hasta ahora hemos observado, no se encuentra excepción alguna en esta o aquella regla. Por consiguiente, si se piensa un juicio con estricta universalidad, es decir, de modo que no admita ninguna posible excepción, no deriva de la experiencia, sino que es válido absolutamente a priori»",
      preguntas: [preguntaTextoClasica('A')],
    },
    {
      opcion: "B",
      autor: "Platón",
      obra: "Fedón",
      problema: "En este texto, Platón trata acerca del alma.",
      texto: "«— Lo que el alma examina por medio de los sentidos es sensible y visible; y lo que ve por sí misma es invisible e inteligible. El alma del verdadero filósofo, persuadida de que no debe oponerse a su liberación, renuncia, en cuanto le es posible, a los placeres, a los deseos, a las tristezas, a los temores, porque sabe que, después de los grandes placeres, de los grandes temores, de las extremas tristezas y de los extremos deseos, no solo se experimentan los males sensibles, que todo el mundo conoce, como las enfermedades o la pérdida de bienes, sino el mayor y el supremo de todos los males, tanto más grande, cuanto que no se deja sentir. — ¿En qué consiste ese mal, Sócrates? — En que, obligada el alma a regocijarse o afligirse por cualquier objeto, está persuadida de que lo que le causa este placer o esta tristeza es muy verdadero y muy real, cuando no lo es en manera alguna. Tal es el efecto de todas las cosas visibles»",
      preguntas: [preguntaTextoClasica('B')],
    },
  ],
  preguntasComunes: [
    {
      id: "A.2",
      titulo: "A.2 — El problema de la sociedad y/o política en un autor o corriente filosófica de la",
      enunciado: "Exponga el problema de la sociedad y/o política en un autor o corriente filosófica de la época antigua.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.3",
      titulo: "A.3 — El problema de Dios en un autor o corriente filosófica de la época moderna",
      enunciado: "Exponga el problema de Dios en un autor o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.4",
      titulo: "A.4 — El problema del ser humano en un autor o corriente filosófica de la época contem",
      enunciado: "Exponga el problema del ser humano en un autor o corriente filosófica de la época contemporánea.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "B.2",
      titulo: "B.2 — El problema del conocimiento y/o realidad en un autor o corriente filosófica de",
      enunciado: "Exponga el problema del conocimiento y/o realidad en un autor o corriente filosófica de la época medieval.",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.3",
      titulo: "B.3 — El problema de la sociedad y/o política en un autor o corriente filosófica de la",
      enunciado: "Exponga el problema de la sociedad y/o política en un autor o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.4",
      titulo: "B.4 — El problema de la ética y/o moral en un autor o corriente filosófica de la época",
      enunciado: "Exponga el problema de la ética y/o moral en un autor o corriente filosófica de la época contemporánea.  HISTORIA DE LA FILOSOFÍA",
      puntos: 2.5,
      bloque: "Texto B"
    }
  ],
},
{
  id: "historia-filosofia-mad-2022-extraordinaria",
  comunidad: "Madrid",
  asignatura: "historia_filosofia",
  anio: 2022,
  curso: "2021-2022",
  convocatoria: "extraordinaria",
  formato: "madrid_clasico_texto_ab_tres_preguntas",
  instrucciones: instruccionesClasicas,
  duracion: "90 minutos",
  criteriosGenerales: criteriosClasicos,
  textos: [
    {
      opcion: "A",
      autor: "Autor no especificado",
      obra: "Obra no especificada",
      problema: "Problema filosófico del texto",
      texto: "«Segunda objeción por la que parece que Dios es evidente por sí mismo: Se llama evidente por sí mismo lo que se conoce con solo comprender sus términos, cualidad que el Filósofo atribuye a los primeros principios de demostración. Así, por ejemplo, sabido lo que es todo y lo que es parte, inmediatamente se comprende que el todo es mayor que cualquiera de sus partes. Ahora bien, si se sabe lo que significa el término Dios, inmediatamente se sabe que Dios existe, porque con este nombre expresamos lo mayor de cuanto se puede concebir; y mayor será lo que existe en el entendimiento y en la realidad que lo que existe solo en el entendimiento. Por consiguiente, cuando se comprende el término Dios, este ya está en el entendimiento y se sigue entonces que también está en la realidad. Luego que Dios existe es evidente por sí mismo» (TOMÁS DE AQUINO, Suma teológica). El texto trata de la existencia de Dios.",
      preguntas: [preguntaTextoClasica('A')],
    },
    {
      opcion: "B",
      autor: "JEAN-JACQUES\nROUSSEAU",
      obra: "Del contrato social",
      problema: "En este texto, Rousseau trata el problema de las obligaciones políticas.",
      texto: "«Cada individuo puede como hombre tener una voluntad particular contraria o disconforme con la voluntad general que tiene como ciudadano; su interés particular puede hablarle de un modo completamente distinto de como lo hace el interés común; su existencia, absoluta y naturalmente independiente, lo puede llevar a considerar lo que debe a la causa común como una contribución gratuita, cuya pérdida será menos perjudicial a los demás que oneroso es para él el pago, y considerando la persona moral que constituye el Estado como un ser de razón, ya que no es un hombre, gozaría [aquel individuo] de los derechos del ciudadano sin querer cumplir los deberes del súbdito, injusticia cuyo progreso causaría la ruina del cuerpo político. Por tanto, a fin de que este pacto social no sea una vana fórmula, encierra tácitamente el compromiso, el único que puede dar fuerza a los demás, de que quien se niegue a obedecer la voluntad general será obligado a ello por todo el cuerpo. Esto no significa otra cosa sino que se le obligará a ser libre»",
      preguntas: [preguntaTextoClasica('B')],
    },
  ],
  preguntasComunes: [
    {
      id: "A.2",
      titulo: "A.2 — El problema de la sociedad y/o política en un autor o corriente filosófica de la",
      enunciado: "Exponga el problema de la sociedad y/o política en un autor o corriente filosófica de la época antigua.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.3",
      titulo: "A.3 — El problema de la ética y/o moral en un autor o corriente filosófica de la época",
      enunciado: "Exponga el problema de la ética y/o moral en un autor o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.4",
      titulo: "A.4 — El problema del ser humano en un autor o corriente filosófica de la época contem",
      enunciado: "Exponga el problema del ser humano en un autor o corriente filosófica de la época contemporánea.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "B.2",
      titulo: "B.2 — El problema de la ética y/o moral en un autor o corriente filosófica de la época",
      enunciado: "Exponga el problema de la ética y/o moral en un autor o corriente filosófica de la época medieval.",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.3",
      titulo: "B.3 — El problema del conocimiento y/o realidad en un autor o corriente filosófica de",
      enunciado: "Exponga el problema del conocimiento y/o realidad en un autor o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.4",
      titulo: "B.4 — El problema de Dios en un autor o corriente filosófica de la época contemporánea",
      enunciado: "Exponga el problema de Dios en un autor o corriente filosófica de la época contemporánea.  HISTORIA DE LA FILOSOFÍA",
      puntos: 2.5,
      bloque: "Texto B"
    }
  ],
},
{
  id: "historia-filosofia-mad-2022-modelo",
  comunidad: "Madrid",
  asignatura: "historia_filosofia",
  anio: 2022,
  curso: "2021-2022",
  convocatoria: "modelo",
  formato: "madrid_clasico_texto_ab_tres_preguntas",
  instrucciones: instruccionesClasicas,
  duracion: "90 minutos",
  criteriosGenerales: criteriosClasicos,
  textos: [
    {
      opcion: "A",
      autor: "Platón reflexiona en este texto en torno al conocimiento",
      obra: "Obra no especificada",
      problema: "en este texto en torno al conocimiento.",
      texto: "«— Y si después de haber adquirido [esos conocimientos] en cada ocasión no los olvidáramos, naceríamos siempre sabiéndolos y siempre los sabríamos a lo largo de nuestra vida. Porque el saber consiste en esto: conservar el conocimiento que se ha adquirido y no perderlo. ¿O no es eso lo que llamamos olvido, Simmias, la pérdida de un conocimiento? — Totalmente de acuerdo, Sócrates —dijo—. — Y si es que después de haberlos adquirido antes de nacer, pienso, al nacer los perdimos, y luego al utilizar nuestros sentidos respecto a esas mismas cosas recuperamos los conocimientos que en un tiempo anterior ya teníamos, ¿acaso lo que llamamos aprender no sería recuperar un conocimiento ya familiar? ¿Llamándolo recordar lo llamaríamos correctamente? — Desde luego» (PLATÓN, Fedón).",
      preguntas: [preguntaTextoClasica('A')],
    },
    {
      opcion: "B",
      autor: "RENÉ\nDESCARTES",
      obra: "Meditaciones metafísicas",
      problema: "En este texto, Descartes reflexiona sobre el problema del conocimiento de la realidad externa.",
      texto: "«Sin embargo, he admitido antes de ahora, como cosas muy ciertas y manifiestas, muchas que más tarde he reconocido ser dudosas e inciertas. ¿Cuáles eran? La tierra, el cielo, los astros y todas las demás cosas que percibía por medio de los sentidos. Ahora bien: ¿qué es lo que concebía en ellas como claro y distinto? Nada más, en verdad, sino que las ideas o pensamientos de esas cosas se presentaban a mi espíritu. Y aun ahora no niego que esas ideas estén en mí. Pero había, además, otra cosa que yo afirmaba, y que pensaba percibir muy claramente por la costumbre que tenía de creerla, aunque verdaderamente no la percibiera, a saber: que había fuera de mí ciertas cosas de las que procedían esas ideas, y a las que estas se asemejaban por completo. Y en eso me engañaba; o al menos si es que mi juicio era verdadero, no lo era en virtud de un conocimiento que yo tuviera»",
      preguntas: [preguntaTextoClasica('B')],
    },
  ],
  preguntasComunes: [
    {
      id: "A.2",
      titulo: "A.2 — El problema de la ética y/o moral en un autor o corriente filosófica de la época",
      enunciado: "Exponga el problema de la ética y/o moral en un autor o corriente filosófica de la época medieval.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.3",
      titulo: "A.3 — El problema de ser humano en un autor o corriente filosófica de la época moderna",
      enunciado: "Exponga el problema de ser humano en un autor o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.4",
      titulo: "A.4 — El problema de Dios en un autor o corriente filosófica de la época contemporánea",
      enunciado: "Exponga el problema de Dios en un autor o corriente filosófica de la época contemporánea.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "B.2",
      titulo: "B.2 — El problema del ser humano en un autor o corriente filosófica de la época antigu",
      enunciado: "Exponga el problema del ser humano en un autor o corriente filosófica de la época antigua.",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.3",
      titulo: "B.3 — El problema de Dios en un autor o corriente filosófica de la época moderna",
      enunciado: "Exponga el problema de Dios en un autor o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.4",
      titulo: "B.4 — El problema de la ética y/o moral en un autor o corriente filosófica de la época",
      enunciado: "Exponga el problema de la ética y/o moral en un autor o corriente filosófica de la época contemporánea.  HISTORIA DE LA FILOSOFÍA",
      puntos: 2.5,
      bloque: "Texto B"
    }
  ],
},
{
  id: "historia-filosofia-mad-2023-extraordinaria",
  comunidad: "Madrid",
  asignatura: "historia_filosofia",
  anio: 2023,
  curso: "2022-2023",
  convocatoria: "extraordinaria",
  formato: "madrid_clasico_texto_ab_tres_preguntas",
  instrucciones: instruccionesClasicas,
  duracion: "90 minutos",
  criteriosGenerales: criteriosClasicos,
  textos: [
    {
      opcion: "A",
      autor: "Immanuel Kant",
      obra: "Crítica de la razón pura",
      problema: "En este texto, Kant reflexiona sobre el problema del conocimiento.",
      texto: "«Los juicios de experiencia, como tales, son todos sintéticos. Sería efectivamente absurdo fundamentar en la experiencia un juicio analítico, pues no he de salir de mi concepto para formular tal juicio y no necesito para ello, por lo tanto, testimonio alguno de la experiencia. La proposición: “un cuerpo es extenso”, es una proposición que se sostiene a priori y no es juicio alguno de experiencia. Pues ya antes de recurrir a la experiencia, tengo en el concepto todos los requisitos para mi juicio, y del concepto puedo extraer el predicado, por medio del principio de contradicción, pudiendo asimismo tomar conciencia, al mismo tiempo, de la necesidad del juicio, cosa que la experiencia no podría enseñarme. […] Ahora bien, si amplío mi conocimiento y me vuelvo hacia la experiencia, de donde había extraído ese concepto de cuerpo, encuentro, unida siempre con las anteriores propiedades, también la pesantez, y la añado, pues, como predicado, sintéticamente a aquel concepto. Es, pues, en la experiencia, en donde se funda la posibilidad de la síntesis del predicado de la pesantez con el concepto de cuerpo»",
      preguntas: [preguntaTextoClasica('A')],
    },
    {
      opcion: "B",
      autor: "TOMÁS DE AQUINO",
      obra: "Suma teológica",
      problema: "En este texto, Tomás de Aquino reflexiona sobre la existencia de Dios.",
      texto: "«La cuarta [vía para demostrar la existencia de Dios] se deduce de la jerarquía de valores que encontramos en las cosas. Pues nos encontramos que la bondad, la veracidad, la nobleza y otros valores se dan en las cosas. En unas más y en otras menos. Pero este más y este menos se dice de las cosas en cuanto que se aproximan más o menos a lo máximo. Así, caliente se dice de aquello que se aproxima más al máximo calor. Hay algo, por tanto, que es muy veraz, muy bueno, muy noble; y, en consecuencia, es el máximo ser; pues las cosas que son sumamente verdaderas son seres máximos […]. Como quiera que en cualquier género, lo máximo se convierte en causa de lo que pertenece a tal género –así el fuego, que es el máximo calor, es causa de todos los calores […]–, del mismo modo hay algo que en todos los seres es causa de su existir, de su bondad, de cualquier otra perfección. Le llamamos Dios»",
      preguntas: [preguntaTextoClasica('B')],
    },
  ],
  preguntasComunes: [
    {
      id: "A.2",
      titulo: "A.2 — El problema de la ética y/o moral en un autor o corriente filosófica de la época",
      enunciado: "Exponga el problema de la ética y/o moral en un autor o corriente filosófica de la época medieval.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.3",
      titulo: "A.3 — El problema de Dios en un autor o corriente filosófica de la época moderna",
      enunciado: "Exponga el problema de Dios en un autor o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.4",
      titulo: "A.4 — El problema de la sociedad y/o política en un autor o corriente filosófica de la",
      enunciado: "Exponga el problema de la sociedad y/o política en un autor o corriente filosófica de la época contemporánea.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "B.2",
      titulo: "B.2 — El problema del conocimiento y/o realidad en un autor o corriente filosófica de",
      enunciado: "Exponga el problema del conocimiento y/o realidad en un autor o corriente filosófica de la época antigua.",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.3",
      titulo: "B.3 — El problema de la sociedad y/o política en un autor o corriente filosófica de la",
      enunciado: "Exponga el problema de la sociedad y/o política en un autor o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.4",
      titulo: "B.4 — El problema de la ética y/o moral en un autor o corriente filosófica de la época",
      enunciado: "Exponga el problema de la ética y/o moral en un autor o corriente filosófica de la época contemporánea.  HISTORIA DE LA FILOSOFÍA",
      puntos: 2.5,
      bloque: "Texto B"
    }
  ],
},
{
  id: "historia-filosofia-mad-2023-modelo",
  comunidad: "Madrid",
  asignatura: "historia_filosofia",
  anio: 2023,
  curso: "2022-2023",
  convocatoria: "modelo",
  formato: "madrid_clasico_texto_ab_tres_preguntas",
  instrucciones: instruccionesClasicas,
  duracion: "90 minutos",
  criteriosGenerales: criteriosClasicos,
  textos: [
    {
      opcion: "A",
      autor: "Immanuel Kant",
      obra: "Crítica de la razón pura",
      problema: "En este texto, Kant reflexiona sobre el problema del conocimiento.",
      texto: "«En todos los juicios en donde se piensa la relación de un sujeto con el predicado […], es esa relación posible de dos maneras. O bien el predicado B pertenece al sujeto A como algo contenido (ocultamente) en ese concepto A; o bien B está enteramente fuera del concepto A, si bien en enlace con el mismo. En el primer caso llamo al juicio analítico; en el otro sintético. […] Los primeros pudieran llamarse también juicios de explicación; los segundos, juicios de ampliación; porque aquellos no añaden nada con el predicado al concepto del sujeto, sino que lo dividen tan solo, por medio del análisis, en sus conceptos parciales, pensados ya (aunque confusamente) en él; los últimos, en cambio, añaden al concepto del sujeto un predicado que no estaba pensado en él y no hubiera podido sacarse por análisis alguno»",
      preguntas: [preguntaTextoClasica('A')],
    },
    {
      opcion: "B",
      autor: "Autor no especificado",
      obra: "Obra no especificada",
      problema: "Problema filosófico del texto",
      texto: "«Así, pues, entre los actos conformes con la virtud, los de la política y la guerra podrán superar a los demás en brillantez e importancia; pero tienen lugar en medio de la agitación y se llevan a cabo en vista de un fin ajeno, pues no se los busca por sí mismos. Por el contrario, el acto del pensamiento y del entendimiento, siendo como es contemplativo, supone una aplicación mucho más seria; no tiene otro fin que él mismo, y lleva consigo el placer que le es exclusivamente propio y que se ve aumentado por la intensidad de la acción. Por tanto, así la independencia que se basta a sí misma, como la tranquilidad y la calma, toda la que el hombre puede disfrutar y todas las ventajas análogas que se atribuyen de ordinario a la felicidad, todas estas cosas se encuentran en el acto del pensamiento contemplativo. Solo esta vida es la que ciertamente constituye la felicidad perfecta del hombre» (ARISTÓTELES, Ética a Nicómaco). Aquí Aristóteles reflexiona acerca de la felicidad.",
      preguntas: [preguntaTextoClasica('B')],
    },
  ],
  preguntasComunes: [
    {
      id: "A.2",
      titulo: "A.2 — El problema de la sociedad y/o política en un autor o corriente filosófica de la",
      enunciado: "Exponga el problema de la sociedad y/o política en un autor o corriente filosófica de la época antigua.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.3",
      titulo: "A.3 — El problema de ser humano en un autor o corriente filosófica de la época moderna",
      enunciado: "Exponga el problema de ser humano en un autor o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.4",
      titulo: "A.4 — El problema de Dios en un autor o corriente filosófica de la época contemporánea",
      enunciado: "Exponga el problema de Dios en un autor o corriente filosófica de la época contemporánea.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "B.2",
      titulo: "B.2 — El problema del ser humano en un autor o corriente filosófica de la época mediev",
      enunciado: "Exponga el problema del ser humano en un autor o corriente filosófica de la época medieval.",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.3",
      titulo: "B.3 — El problema de Dios en un autor o corriente filosófica de la época moderna",
      enunciado: "Exponga el problema de Dios en un autor o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.4",
      titulo: "B.4 — El problema del conocimiento y/o realidad en un autor o corriente filosófica de",
      enunciado: "Exponga el problema del conocimiento y/o realidad en un autor o corriente filosófica de la época contemporánea.  HISTORIA DE LA FILOSOFÍA",
      puntos: 2.5,
      bloque: "Texto B"
    }
  ],
},
{
  id: "historia-filosofia-mad-2024-extraordinaria-coincidencias",
  comunidad: "Madrid",
  asignatura: "historia_filosofia",
  anio: 2024,
  curso: "2023-2024",
  convocatoria: "extraordinaria",
  variante: "Coincidencias",
  formato: "madrid_clasico_texto_ab_tres_preguntas",
  instrucciones: instruccionesClasicas,
  duracion: "90 minutos",
  criteriosGenerales: criteriosClasicos,
  textos: [
    {
      opcion: "A",
      autor: "Agustín de Hipona",
      obra: "Del libre albedrío",
      problema: "En este texto, San Agustín reflexiona sobre la libertad humana.",
      texto: "«Si el ser humano careciese del libre albedrío de la voluntad, ¿cómo podría darse aquel bien por el que se alaba a la justicia y que consiste en condenar los pecados y en premiar las buenas acciones? Ya que lo que no se hubiera hecho voluntariamente no sería ni pecado, ni buena acción. Por lo tanto, si el ser humano no tuviera una voluntad libre, tanto el castigo como el premio serían injustos. Ahora bien, ha tenido que haber justicia, tanto en el castigo como en el premio, pues es uno de los bienes que vienen de Dios. Así pues, Dios ha debido dar al ser humano una voluntad libre.»",
      preguntas: [preguntaTextoClasica('A')],
    },
    {
      opcion: "B",
      autor: "HANNAH ARENDT",
      obra: "La condición humana",
      problema: "En este texto, Arendt reflexiona sobre la condición humana en la tradición occidental.",
      texto: "«Tradicionalmente, la expresión vita activa toma su significado de la vita contemplativa; su muy limitada dignidad se le concede debido a que sirve a las necesidades y exigencias de la contemplación en un cuerpo vivo. El cristianismo, con su creencia en el más allá, cuya gloria se anuncia en el deleite de la contemplación, confiere sanción religiosa a la degradación de la vita activa a una posición derivada, secundaria; pero la determinación del orden coincidió con el descubrimiento de la contemplación (theoría) como facultad humana claramente distinta del pensamiento y del razonamiento, que se dio en la escuela socrática y que desde entonces ha gobernado el pensamiento metafísico y político a lo largo de nuestra tradición. [...] Si, por lo tanto, el empleo de la expresión vita activa, tal como lo propongo aquí, está en manifiesta contradicción con la tradición, se debe no a que dude de la validez de la experiencia que sostiene la distinción, sino más bien del orden jerárquico inherente a ella desde su principio [...]. Mi argumento es sencillamente que el enorme peso de la contemplación en la jerarquía tradicional ha borrado las distinciones y articulaciones dentro de la vita activa.»",
      preguntas: [preguntaTextoClasica('B')],
    },
  ],
  preguntasComunes: [
    {
      id: "A.2",
      titulo: "A.2 — El problema del ser humano en un autor o corriente filosófica de la época antigu",
      enunciado: "Exponga el problema del ser humano en un autor o corriente filosófica de la época antigua.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.3",
      titulo: "A.3 — El problema de la realidad y/o el conocimiento en un autor o corriente filosófic",
      enunciado: "Exponga el problema de la realidad y/o el conocimiento en un autor o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.4",
      titulo: "A.4 — El problema de la sociedad y/o la política en un autor o corriente filosófica de",
      enunciado: "Exponga el problema de la sociedad y/o la política en un autor o corriente filosófica de la época contemporánea.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "B.2",
      titulo: "B.2 — El problema de la realidad y/o el conocimiento en un autor o corriente filosófic",
      enunciado: "Exponga el problema de la realidad y/o el conocimiento en un autor o corriente filosófica de la época medieval.",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.3",
      titulo: "B.3 — El problema de la sociedad y/o la política en un autor o corriente filosófica de",
      enunciado: "Exponga el problema de la sociedad y/o la política en un autor o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.4",
      titulo: "B.4 — El problema de Dios en un autor o corriente filosófica de la época contemporánea",
      enunciado: "Exponga el problema de Dios en un autor o corriente filosófica de la época contemporánea.  HISTORIA DE LA FILOSOFÍA",
      puntos: 2.5,
      bloque: "Texto B"
    }
  ],
},
{
  id: "historia-filosofia-mad-2024-extraordinaria",
  comunidad: "Madrid",
  asignatura: "historia_filosofia",
  anio: 2024,
  curso: "2023-2024",
  convocatoria: "extraordinaria",
  formato: "madrid_clasico_texto_ab_tres_preguntas",
  instrucciones: instruccionesClasicas,
  duracion: "90 minutos",
  criteriosGenerales: criteriosClasicos,
  textos: [
    {
      opcion: "A",
      autor: "JOSÉ ORTEGA Y\nGASSET",
      obra: "El tema de nuestro tiempo",
      problema: "Este texto trata sobre la teoría del conocimiento de José Ortega y Gasset.",
      texto: "«La individualidad de cada sujeto real era el indomable estorbo que la tradición intelectual de los últimos tiempos encontraba para que el conocimiento pudiese justificar su pretensión de conseguir la verdad. Dos sujetos diferentes —se pensaba— llegarán a verdades divergentes. Ahora vemos que la divergencia entre los mundos de dos sujetos no implica la falsedad de uno de ellos. Al contrario, precisamente porque lo que cada cual ve es una realidad y no una ficción, tiene que ser su aspecto distinto del que otro percibe. Esa divergencia no es contradicción, sino complemento. Si el universo hubiese presentado una faz idéntica a los ojos de un griego socrático que a los de un yanqui, deberíamos pensar que el universo no tiene verdadera realidad, independiente de los sujetos. Porque esa coincidencia de aspecto entre dos hombres colocados en puntos tan diversos como son la Atenas del siglo V y la Nueva York del siglo XX indicaría que no se trataba de una realidad externa a ellos, sino de una imaginación que por azar se producía idénticamente en dos sujetos.»",
      preguntas: [preguntaTextoClasica('A')],
    },
    {
      opcion: "B",
      autor: "ARISTÓTELES",
      obra: "Ética a Nicómaco",
      problema: "En este texto, Aristóteles trata sobre el problema de la virtud.",
      texto: "«Las acciones se llaman justas y moderadas cuando son tales que una persona justa y moderada podría realizarlas, y es justo y moderado no el que las hace, sino el que las hace como las hacen los justos y moderados. Se dice bien, por tanto, que uno se vuelve justo por realizar acciones justas y moderado por realizar acciones moderadas. Y nadie podría llegar a ser bueno sin realizarlas. Pero la mayoría de la gente no hace estas cosas, sino que, refugiándose en la teoría, creen filosofar y poder, así, convertirse en personas virtuosas; se comportan como los enfermos que escuchan con atención a los médicos, pero no hacen nada de lo que estos les prescriben. Y, así como estos pacientes no sanarán del cuerpo con semejante tratamiento, tampoco aquellos sanarán el alma con semejante filosofía.»",
      preguntas: [preguntaTextoClasica('B')],
    },
  ],
  preguntasComunes: [
    {
      id: "A.2",
      titulo: "A.2 — El problema del ser humano en un autor o corriente filosófica de la época antigu",
      enunciado: "Exponga el problema del ser humano en un autor o corriente filosófica de la época antigua.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.3",
      titulo: "A.3 — El problema de la realidad y/o el conocimiento en un autor o corriente filosófic",
      enunciado: "Exponga el problema de la realidad y/o el conocimiento en un autor o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.4",
      titulo: "A.4 — El problema de la sociedad y/o la política en un autor o corriente filosófica de",
      enunciado: "Exponga el problema de la sociedad y/o la política en un autor o corriente filosófica de la época contemporánea.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "B.2",
      titulo: "B.2 — El problema de la ética y/o la moral en un autor o corriente filosófica de la ép",
      enunciado: "Exponga el problema de la ética y/o la moral en un autor o corriente filosófica de la época medieval.",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.3",
      titulo: "B.3 — El problema de la sociedad y/o la política en un autor o corriente filosófica de",
      enunciado: "Exponga el problema de la sociedad y/o la política en un autor o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.4",
      titulo: "B.4 — El problema de Dios en un autor o corriente filosófica de la época contemporánea",
      enunciado: "Exponga el problema de Dios en un autor o corriente filosófica de la época contemporánea.  HISTORIA DE LA FILOSOFÍA",
      puntos: 2.5,
      bloque: "Texto B"
    }
  ],
},
{
  id: "historia-filosofia-mad-2024-modelo",
  comunidad: "Madrid",
  asignatura: "historia_filosofia",
  anio: 2024,
  curso: "2023-2024",
  convocatoria: "modelo",
  formato: "madrid_clasico_texto_ab_tres_preguntas",
  instrucciones: instruccionesClasicas,
  duracion: "90 minutos",
  criteriosGenerales: criteriosClasicos,
  textos: [
    {
      opcion: "A",
      autor: "David Hume",
      obra: "Investigación sobre el entendimiento humano",
      problema: "En este texto, Hume trata sobre el problema del conocimiento.",
      texto: "«Parece entonces que esta idea de conexión necesaria entre sucesos surge del acaecimiento de varios casos similares de constante conjunción de dichos sucesos. Esta idea no puede ser sugerida por uno solo de estos casos examinados desde todas las posiciones y perspectivas posibles. Pero en una serie de casos no hay nada distinto de cualquiera de los casos individuales que se suponen exactamente iguales, salvo que, tras la repetición de casos similares, la mente es conducida por hábito a tener la expectativa, al aparecer un suceso, de su acompañante usual y a creer que existirá. Por tanto, esta conexión que sentimos en la mente, esta transición de la imagen de un objeto a su acompañante usual, es el sentimiento o impresión a partir del cual formamos la idea de poder o de conexión necesaria. No hay más en esta cuestión. Examínese el asunto desde cualquier perspectiva. Nunca encontraremos otro origen para esa idea. Esta es la única diferencia entre un caso del que jamás podremos recibir la idea de conexión y varios casos semejantes que la sugieren»",
      preguntas: [preguntaTextoClasica('A')],
    },
    {
      opcion: "B",
      autor: "ARISTÓTELES",
      obra: "Ética a\nNicómaco",
      problema: "En este texto, Aristóteles reflexiona sobre la felicidad.",
      texto: "«La felicidad no consiste en divertirse; sería un absurdo que la diversión fuera el fin de la vida; sería también absurdo trabajar y sufrir durante toda la vida sin otra mira que la de divertirse. Puede decirse realmente de todas las cosas del mundo que solo se las desea en vista de otra cosa, excepto, sin embargo, la felicidad, porque ella es en sí misma fin. […] Según Anacarsis, es preciso divertirse para dedicarse después a asuntos serios, y tiene mucha razón. La diversión es una especie de reposo, y como no se puede trabajar sin descanso, el ocio es una necesidad. Pero este ocio, ciertamente, no es el fin de la vida, porque solo tiene lugar en vista del acto que se ha de realizar más tarde. La vida dichosa es la vida conforme a la virtud, y esta vida es seria y laboriosa; no la constituyen vanas diversiones»",
      preguntas: [preguntaTextoClasica('B')],
    },
  ],
  preguntasComunes: [
    {
      id: "A.2",
      titulo: "A.2 — El problema del ser humano en un autor o corriente filosófica de la época antigu",
      enunciado: "Exponga el problema del ser humano en un autor o corriente filosófica de la época antigua.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.3",
      titulo: "A.3 — El problema de Dios en un autor o corriente filosófica de la época moderna",
      enunciado: "Exponga el problema de Dios en un autor o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.4",
      titulo: "A.4 — El problema de la ética y/o moral en un autor o corriente filosófica de la época",
      enunciado: "Exponga el problema de la ética y/o moral en un autor o corriente filosófica de la época contemporánea",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "B.2",
      titulo: "B.2 — El problema de Dios en un autor o corriente filosófica de la época medieval",
      enunciado: "Exponga el problema de Dios en un autor o corriente filosófica de la época medieval.",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.3",
      titulo: "B.3 — El problema de la sociedad y/o política en un autor o corriente filosófica de la",
      enunciado: "Exponga el problema de la sociedad y/o política en un autor o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.4",
      titulo: "B.4 — El problema del ser humano en un autor o corriente filosófica de la época contem",
      enunciado: "Exponga el problema del ser humano en un autor o corriente filosófica de la época contemporánea.  HISTORIA DE LA FILOSOFÍA",
      puntos: 2.5,
      bloque: "Texto B"
    }
  ],
},
{
  id: "historia-filosofia-mad-2025-modelo",
  comunidad: "Madrid",
  asignatura: "historia_filosofia",
  anio: 2025,
  curso: "2024-2025",
  convocatoria: "modelo",
  formato: "madrid_2025_texto_ab_cuatro_preguntas",
  instrucciones: instrucciones2025,
  duracion: "90 minutos",
  criteriosGenerales: [
    "Pregunta 1: identificar y explicar la tesis del texto y ponerla en diálogo con otro autor, autora o corriente filosófica.",
    "Preguntas 2, 3 y 4: desarrollar una de las alternativas propuestas usando vocabulario preciso y estructura argumentativa clara."
  ],
  textos: [
    {
      opcion: "A",
      autor: "Descartes",
      obra: "Meditaciones metafísicas",
      problema: "Problema filosófico del texto",
      texto: "«Ahora bien, de todas estas ideas, unas parecen haber nacido conmigo, otras, serme ajenas y venir de fuera, y las demás, haber sido construidas e inventadas por mí mismo. Pues, aunque tenga la facultad de concebir eso que en general llamamos una cosa, o una verdad, o un pensamiento, me parece que eso no lo tengo en absoluto de ninguna otra parte que de mi propia naturaleza; pero si oigo, ahora, algún ruido, si veo el sol, si siento el calor, hasta el presente he juzgado que esas sensaciones procedían de algunas cosas que existían fuera de mi; y, en fin, me parece que las sirenas, los hipogrifos y todas las demás quimeras semejantes son ficciones e invenciones de mi mente. Pero también, quizá, pueda persuadirme de que todas las ideas son del género de las que llamo adventicias, y que proceden de fuera, o bien que todas han nacido conmigo, o bien que todas han sido fabricadas por mí; pues todavía no he descubierto claramente su origen.»",
      preguntas: [
        {
          id: "1.1",
          titulo: "Pregunta 1.1 — Tesis principal",
          puntos: 1.25,
          enunciado: "Identifique y explique la tesis principal defendida en el texto propuesto."
        },
        {
          id: "1.2",
          titulo: "Pregunta 1.2 — Diálogo filosófico",
          puntos: 1.25,
          enunciado: "Mediante un pequeño texto justificativo, ponga en diálogo con algún otro autor, autora o corriente filosófica perteneciente a la misma o diferente época la cuestión discutida en el texto."
        }
      ],
    },
    {
      opcion: "B",
      autor: "Santo Tomás",
      obra: "Suma Teológica 1ª Parte, cuestión 2, art. 3",
      problema: "Problema filosófico del texto",
      texto: "«La existencia de Dios puede ser probada de cinco maneras distintas. 1) La primera y más clara es la que se deduce del movimiento. Pues es cierto, y lo perciben los sentidos, que en este mundo hay movimiento. Y todo lo que se mueve es movido por otro. [...] Por su parte, quien mueve está en acto. Pues mover no es más que pasar de la potencia al acto. La potencia no puede pasar a acto más que por quien está en acto. [...] Pero no es posible que una cosa sea lo mismo simultáneamente en potencia y en acto; sólo lo puede ser respecto a algo distinto. Ejemplo: Lo que es caliente en acto, no puede ser al mismo tiempo caliente en potencia, pero sí puede ser en potencia frío. Igualmente, es imposible que algo mueva y sea movido al mismo tiempo, o que se mueva a sí mismo. Todo lo que se mueve necesita ser movido por otro. Pero si lo que es movido por otro se mueve, necesita ser movido por otro, y éste por otro. Este proceder no se puede llevar indefinidamente, porque no se llegaría al primero que mueve, y así no habría motor alguno pues los motores intermedios no mueven más que por ser movidos por el primer motor. [...] Por lo tanto, es necesario llegar a aquel primer motor al que nadie mueve. En éste, todos reconocen a Dios.»",
      preguntas: [
        {
          id: "1.1",
          titulo: "Pregunta 1.1 — Tesis principal",
          puntos: 1.25,
          enunciado: "Identifique y explique la tesis principal defendida en el texto propuesto."
        },
        {
          id: "1.2",
          titulo: "Pregunta 1.2 — Diálogo filosófico",
          puntos: 1.25,
          enunciado: "Mediante un pequeño texto justificativo, ponga en diálogo con algún otro autor, autora o corriente filosófica perteneciente a la misma o diferente época la cuestión discutida en el texto."
        }
      ],
    },
  ],
  preguntasComunes: [
    {
      id: "2A",
      titulo: "Pregunta 2A — El problema de la ética y/o la moral en un autor, autora o corriente filosófica",
      enunciado: "Exponga el problema de la ética y/o la moral en un autor, autora o corriente filosófica de la época antigua o medieval.",
      puntos: 2.5,
      bloque: "Pregunta 2"
    },
    {
      id: "2B",
      titulo: "Pregunta 2B — El problema de la política en un autor, autora o corriente filosófica de la époc",
      enunciado: "Exponga el problema de la política en un autor, autora o corriente filosófica de la época antigua o medieval.",
      puntos: 2.5,
      bloque: "Pregunta 2"
    },
    {
      id: "3A",
      titulo: "Pregunta 3A — El problema de la realidad y/o el conocimiento en un autor, autora o corriente f",
      enunciado: "Exponga el problema de la realidad y/o el conocimiento en un autor, autora o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Pregunta 3"
    },
    {
      id: "3B",
      titulo: "Pregunta 3B — El problema de la ética y la moral en un autor, autora o corriente filosófica de",
      enunciado: "Exponga el problema de la ética y la moral en un autor, autora o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Pregunta 3"
    },
    {
      id: "4A",
      titulo: "Pregunta 4A — El problema de Dios en un autor, autora o corriente filosófica de la época conte",
      enunciado: "Exponga el problema de Dios en un autor, autora o corriente filosófica de la época contemporánea.",
      puntos: 2.5,
      bloque: "Pregunta 4"
    },
    {
      id: "4B",
      titulo: "Pregunta 4B — El problema del ser humano en un autor, autora o corriente filosófica de la époc",
      enunciado: "Exponga el problema del ser humano en un autor, autora o corriente filosófica de la época contemporánea.  HISTORIA DE LA FILOSOFÍA",
      puntos: 2.5,
      bloque: "Pregunta 4"
    }
  ],
},
{
  id: "historia-filosofia-mad-2020-modelo",
  comunidad: "Madrid",
  asignatura: "historia_filosofia",
  anio: 2020,
  curso: "2019-2020",
  convocatoria: "modelo",
  formato: "madrid_clasico_texto_ab_tres_preguntas",
  instrucciones: instruccionesClasicas,
  duracion: "90 minutos",
  criteriosGenerales: criteriosClasicos,
  textos: [
    {
      opcion: "A",
      autor: "FRIEDRICH\nNIETZSCHE",
      obra: "La gaya ciencia",
      problema: "En este texto, Nietzsche reflexiona sobre el problema del conocimiento y de la ciencia.",
      texto: "«Se dice con razón que las convicciones no tienen derecho alguno de ciudadanía en la ciencia. Solo cuando se resuelven a descender a la modestia de una hipótesis, de una previa posición para una prueba, de una ficción normativa, puede concedérseles la entrada y un cierto valor dentro del imperio del conocimiento ‒en todo caso con la limitación de permanecer bajo vigilancia policial, bajo la policía de la desconfianza‒. Pero esto, si se considera más exactamente, ¿no quiere decir que solo cuando la convicción deja de serlo, le es permitido conseguir su acceso a la ciencia? ¿No comienza el cultivo del espíritu científico cuando uno no se permite ya más convicciones? Así es probablemente. Solo resta por preguntar, para que este cultivo pueda comenzar, si no ha de haber ya una convicción, y por cierto tan imperiosa e incondicional que se sacrifiquen por ella todas las restantes convicciones. Se ve que también la ciencia se apoya sobre una fe, no existe ciencia alguna “libre de presupuestos”»",
      preguntas: [preguntaTextoClasica('A')],
    },
    {
      opcion: "B",
      autor: "Rousseau reflexiona en este texto sobre la relación entre individuo y sociedad",
      obra: "Obra no especificada",
      problema: "en este texto sobre la relación entre individuo y sociedad.",
      texto: "«A fin, pues, de que el pacto social no sea un vano formulario, implica tácitamente el compromiso, el único que puede dar fuerza a los demás, de que quien rehúse obedecer a la voluntad general será obligado a ello por todo el cuerpo: lo cual no significa sino que se le forzará a ser libre; porque esa es la condición que, dando cada ciudadano a la patria, le garantiza de toda dependencia personal; condición que constituye el artificio y el juego de la máquina política, y la única que hace legítimos los compromisos civiles, que sin eso serían absurdos y tiránicos y estarían sometidos a los abusos más enormes» (JEAN-JACQUES ROUSSEAU, Del contrato social).",
      preguntas: [preguntaTextoClasica('B')],
    },
  ],
  preguntasComunes: [
    {
      id: "A.2",
      titulo: "A.2 — El problema de Dios en un autor o corriente filosófica de la época medieval",
      enunciado: "Exponga el problema de Dios en un autor o corriente filosófica de la época medieval.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.3",
      titulo: "A.3 — El problema del ser humano en un autor o corriente filosófica de la época modern",
      enunciado: "Exponga el problema del ser humano en un autor o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "A.4",
      titulo: "A.4 — El problema de la sociedad y/o política en un autor o corriente filosófica de la",
      enunciado: "Exponga el problema de la sociedad y/o política en un autor o corriente filosófica de la época contemporánea.",
      puntos: 2.5,
      bloque: "Texto A"
    },
    {
      id: "B.2",
      titulo: "B.2 — El problema del ser humano en un autor o corriente filosófica de la época antigu",
      enunciado: "Exponga el problema del ser humano en un autor o corriente filosófica de la época antigua.",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.3",
      titulo: "B.3 — El problema del conocimiento y/o realidad en un autor o corriente filosófica de",
      enunciado: "Exponga el problema del conocimiento y/o realidad en un autor o corriente filosófica de la época moderna.",
      puntos: 2.5,
      bloque: "Texto B"
    },
    {
      id: "B.4",
      titulo: "B.4 — El problema de la ética y/o moral en un autor o corriente filosófica de la época",
      enunciado: "Exponga el problema de la ética y/o moral en un autor o corriente filosófica de la época contemporánea.  HISTORIA DE LA FILOSOFÍA",
      puntos: 2.5,
      bloque: "Texto B"
    }
  ],
},
]
