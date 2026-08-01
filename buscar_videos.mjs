import https from 'https'
import fs from 'fs'

const API_KEY = process.env.YOUTUBE_API_KEY
const TEMAS = [
  { bloque: 'Álgebra', tema: 'matrices operaciones suma producto' },
  { bloque: 'Álgebra', tema: 'determinantes matriz regla Sarrus' },
  { bloque: 'Álgebra', tema: 'matriz inversa' },
  { bloque: 'Álgebra', tema: 'sistemas ecuaciones lineales Gauss' },
  { bloque: 'Álgebra', tema: 'sistemas Cramer determinantes' },
  { bloque: 'Álgebra', tema: 'discusion sistemas Rouche Frobenius' },
  { bloque: 'Análisis', tema: 'limites funciones calculo' },
  { bloque: 'Análisis', tema: 'continuidad funciones discontinuidades' },
  { bloque: 'Análisis', tema: 'derivada definicion reglas' },
  { bloque: 'Análisis', tema: 'derivadas regla cadena' },
  { bloque: 'Análisis', tema: 'extremos relativos maximos minimos derivada' },
  { bloque: 'Análisis', tema: 'monotonia creciente decreciente funcion' },
  { bloque: 'Análisis', tema: 'curvatura concavidad convexidad inflexion' },
  { bloque: 'Análisis', tema: 'representacion grafica funcion completa' },
  { bloque: 'Análisis', tema: 'integral indefinida primitiva' },
  { bloque: 'Análisis', tema: 'integral definida Riemann' },
  { bloque: 'Análisis', tema: 'calculo area entre curvas integral' },
  { bloque: 'Geometría', tema: 'vectores operaciones modulo producto escalar' },
  { bloque: 'Geometría', tema: 'producto vectorial mixto' },
  { bloque: 'Geometría', tema: 'rectas ecuacion parametrica continua' },
  { bloque: 'Geometría', tema: 'planos ecuacion posicion relativa' },
  { bloque: 'Geometría', tema: 'distancias punto recta plano' },
  { bloque: 'Geometría', tema: 'angulos entre rectas planos' },
  { bloque: 'Probabilidad', tema: 'combinatoria permutaciones combinaciones' },
  { bloque: 'Probabilidad', tema: 'probabilidad condicionada Bayes' },
  { bloque: 'Probabilidad', tema: 'variable aleatoria distribucion binomial' },
  { bloque: 'Probabilidad', tema: 'distribucion normal tipificacion' },
]

function buscarVideo(tema) {
  return new Promise((resolve) => {
    const query = encodeURIComponent('Profesor10demates ' + tema)
    const url = 'https://www.googleapis.com/youtube/v3/search?part=snippet&q=' + query + '&type=video&maxResults=1&key=' + API_KEY + '&relevanceLanguage=es'
    https.get(url, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          const item = json.items?.[0]
          if (item) {
            resolve({
              tema,
              titulo: item.snippet.title,
              videoId: item.id.videoId,
              url: 'https://www.youtube.com/watch?v=' + item.id.videoId,
              canal: item.snippet.channelTitle
            })
          } else {
            resolve({ tema, error: 'No encontrado' })
          }
        } catch(e) { resolve({ tema, error: e.message }) }
      })
    }).on('error', (e) => resolve({ tema, error: e.message }))
  })
}

async function main() {
  if (!API_KEY) { console.error('Falta YOUTUBE_API_KEY'); process.exit(1) }
  console.log('Buscando videos...\n')
  const resultados = []
  for (const { bloque, tema } of TEMAS) {
    process.stdout.write('  ' + tema + '...')
    const r = await buscarVideo(tema)
    resultados.push({ bloque, ...r })
    console.log(r.error ? ' ERROR' : ' OK')
    await new Promise(r => setTimeout(r, 300))
  }
  fs.writeFileSync('videos_resultado.json', JSON.stringify(resultados, null, 2))
  console.log('\nGuardado en videos_resultado.json')

  for (const r of resultados) {
    if (!r.error) {
      console.log('\n' + r.bloque + ' — ' + r.tema)
      console.log('  ' + r.titulo)
      console.log('  ' + r.url)
    }
  }
}
main()
