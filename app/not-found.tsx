import Link from 'next/link'
import { Bebas_Neue, DM_Mono } from 'next/font/google'

const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'] })
const mono = DM_Mono({ weight: ['400', '500'], subsets: ['latin'] })

export const metadata = {
  title: 'Página no encontrada',
  description: 'La página que buscas no existe o se ha movido.',
}

export default function NotFound() {
  const B = bebas.style.fontFamily
  const M = mono.style.fontFamily

  return (
    <div style={{
      minHeight: '100dvh', background: '#111', color: '#fff',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '24px', fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
    }}>
      <style>{`
        .nf-link { transition: background 140ms, transform 140ms; }
        .nf-link:hover { background: #f0f0f0 !important; }
        .nf-link:active { transform: scale(0.97); }
        .nf-secondary { transition: color 140ms, border-color 140ms; }
        .nf-secondary:hover { color: #fff !important; border-color: rgba(255,255,255,.4) !important; }
      `}</style>

      <p style={{ fontFamily: M, fontSize: 11, color: 'rgba(255,255,255,.35)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 20 }}>
        Error 404
      </p>
      <h1 style={{ fontFamily: B, fontSize: 'clamp(72px, 16vw, 160px)', lineHeight: .9, letterSpacing: '.01em', margin: '0 0 20px' }}>
        Esto no existe.
      </h1>
      <p style={{ fontSize: 16, color: 'rgba(255,255,255,.5)', maxWidth: 440, lineHeight: 1.7, margin: '0 0 40px' }}>
        La página que buscas no existe o se ha movido. Vuelve al inicio o entra a tu Camino PAU.
      </p>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/"
          className="nf-link"
          style={{
            padding: '13px 30px', borderRadius: 999, background: '#fff', color: '#111',
            textDecoration: 'none', fontSize: 14, fontWeight: 700, letterSpacing: '.02em',
          }}
        >
          Volver a Kairo
        </Link>
        <Link
          href="/camino"
          className="nf-secondary"
          style={{
            padding: '13px 30px', borderRadius: 999, border: '1px solid rgba(255,255,255,.2)',
            color: 'rgba(255,255,255,.7)', textDecoration: 'none', fontSize: 14, fontWeight: 700, letterSpacing: '.02em',
          }}
        >
          Ir a mi Camino →
        </Link>
      </div>
    </div>
  )
}
