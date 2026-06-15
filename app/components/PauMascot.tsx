import Image from 'next/image'

export type PauMascotVariant =
  | 'avatar'
  | 'welcome'
  | 'guide'
  | 'study'
  | 'laptop'
  | 'celebrate'
  | 'thinking'
  | 'calm-error'
  | 'sleepy'

export type PauMascotSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export type PauMascotProps = {
  variant?: PauMascotVariant
  size?: PauMascotSize
  className?: string
  alt?: string
  priority?: boolean
}

const VARIANT_SRC: Record<PauMascotVariant, string> = {
  avatar:        '/mascots/pau/pau-avatar.png',
  welcome:       '/mascots/pau/pau-welcome.png',
  guide:         '/mascots/pau/pau-guide.png',
  study:         '/mascots/pau/pau-study.png',
  laptop:        '/mascots/pau/pau-laptop.png',
  celebrate:     '/mascots/pau/pau-celebrate.png',
  thinking:      '/mascots/pau/pau-thinking.png',
  'calm-error':  '/mascots/pau/pau-calm-error.png',
  sleepy:        '/mascots/pau/pau-sleepy.png',
}

const SIZE_PX: Record<PauMascotSize, number> = {
  xs:  32,
  sm:  48,
  md:  80,
  lg: 128,
  xl: 180,
}

export default function PauMascot({
  variant = 'guide',
  size = 'md',
  className,
  alt,
  priority = false,
}: PauMascotProps) {
  const px  = SIZE_PX[size]
  const src = VARIANT_SRC[variant]

  return (
    <Image
      src={src}
      alt={alt ?? `Pau, mascota de Pausia — ${variant}`}
      width={px}
      height={px}
      priority={priority}
      className={className}
      style={{ display: 'block', userSelect: 'none' }}
    />
  )
}
