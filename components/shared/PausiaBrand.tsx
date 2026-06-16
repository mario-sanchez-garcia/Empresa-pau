import type { CSSProperties } from 'react'

type PausiaBrandProps = {
  variant?: 'default' | 'inverse' | 'mark'
  subtitle?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
  style?: CSSProperties
}

const scale = {
  sm: { mark: 32, radius: 11, title: 15, sub: 9.5, gap: 9 },
  md: { mark: 42, radius: 14, title: 18, sub: 10.5, gap: 11 },
  lg: { mark: 52, radius: 17, title: 23, sub: 11, gap: 13 },
}

export default function PausiaBrand({
  variant = 'default',
  subtitle,
  size = 'md',
  className,
  style,
}: PausiaBrandProps) {
  const s = scale[size]
  const inverse = variant === 'inverse'
  const titleColor = inverse ? '#ffffff' : '#004aad'
  const subColor = inverse ? 'rgba(255,255,255,0.64)' : '#7c8da5'

  const mark = (
    <span
      aria-hidden={variant === 'mark' ? undefined : 'true'}
      aria-label={variant === 'mark' ? 'Pausia' : undefined}
      className={variant === 'mark' ? className : undefined}
      style={{
        width: s.mark,
        height: s.mark,
        borderRadius: s.radius,
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
        background: inverse ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.88)',
        border: inverse ? '1px solid rgba(255,255,255,0.30)' : '1px solid rgba(191,219,254,0.82)',
        boxShadow: inverse
          ? '0 14px 34px rgba(2,8,23,0.18)'
          : '0 12px 28px rgba(37,99,235,0.14)',
        overflow: 'hidden',
        ...(variant === 'mark' ? style : undefined),
      }}
    >
      <img
        src="/brand/pausia-mark.svg"
        alt=""
        width={s.mark}
        height={s.mark}
        style={{ width: '78%', height: '78%', objectFit: 'contain', display: 'block' }}
      />
    </span>
  )

  if (variant === 'mark') return mark

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: s.gap,
        minWidth: 0,
        ...style,
      }}
    >
      {mark}
      <span style={{ minWidth: 0, display: 'block' }}>
        <span
          style={{
            display: 'block',
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: s.title,
            fontWeight: 800,
            color: titleColor,
            letterSpacing: '-0.035em',
            lineHeight: 0.92,
          }}
        >
          Pausia
        </span>
        {subtitle !== null && (
          <span
            style={{
              display: 'block',
              marginTop: 4,
              color: subColor,
              fontSize: s.sub,
              fontWeight: 750,
              letterSpacing: '0.14em',
              lineHeight: 1,
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            {subtitle ?? 'PAU'}
          </span>
        )}
      </span>
    </span>
  )
}
