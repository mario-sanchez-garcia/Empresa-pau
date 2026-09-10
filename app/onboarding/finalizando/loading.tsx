import KairoLoadingMark from '@/app/components/onboarding/KairoLoadingMark'

// Sin este archivo, /onboarding/finalizando caía en el comodín de la raíz
// (app/loading.tsx → KairoLoader): las letras KAIRO partiéndose sobre #0f172a
// durante ~medio segundo, y justo después la pantalla real de finalización
// sobre #111. Dos loaders distintos seguidos, con cambio de fondo en medio.
//
// El propio app/loading.tsx ya dice que esta ruta "tiene su propia pantalla
// con los mensajes de cada etapa" — la intención estaba escrita, solo faltaba
// el archivo que la hiciera efectiva (checkout es el otro caso citado allí, y
// ese sí conserva la animación de marca a propósito).
//
// Esto reproduce el primer fotograma EXACTO de FinalizandoClient (su estado
// 'checking'), así que el relevo del servidor al cliente no se ve: mismo
// fondo, misma marca, mismos textos. Lo único que cambia al montar el cliente
// es que aparecen el mensaje personalizado y la barra de progreso.
//
// OJO: si cambias el bloque de carga de FinalizandoClient.tsx, cambia también
// este — son la misma pantalla en dos momentos distintos.
export default function Loading() {
  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#111',
      gap: 16,
      padding: 24,
    }}>
      <KairoLoadingMark />
      <div style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: 9,
        fontWeight: 900,
        letterSpacing: '.22em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,.25)',
        marginTop: 24,
      }}>
        Estamos construyendo tu Camino
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginTop: 6 }}>
        Comprobando tu preparación
      </div>
      {/* Hueco reservado para el mensaje personalizado, que solo el cliente
          puede componer (sale del borrador local). Sin reservarlo, el texto
          de estado daría un salto vertical al montar. */}
      <p style={{ fontSize: 12, marginTop: 4, minHeight: 18 }} />
      {/* La barra va vacía a propósito: su animación arranca en el cliente. Si
          se animara también aquí, al montar volvería a empezar y se vería el
          retroceso. */}
      <div style={{ width: 200, height: 2, background: 'rgba(255,255,255,.06)', marginTop: 16 }} />
    </div>
  )
}
