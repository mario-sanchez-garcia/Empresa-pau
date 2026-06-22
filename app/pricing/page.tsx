'use client'

import Link from 'next/link'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import PausiaBrand from '@/components/shared/PausiaBrand'

type Plan = {
  name: string
  price: string
  priceStrike?: string
  period: string
  description: string
  features: Array<{ text: string; included: boolean }>
  cta: string
  href: string
  popular?: boolean
  popularLabel?: string
  popularAmber?: boolean
}

const plans: Plan[] = [
  {
    name: 'Free',
    price: '0 €',
    period: 'sin tarjeta',
    description: 'Para probar Pausia y practicar con exámenes reales sin ningún compromiso.',
    features: [
      { text: '10 correcciones con IA al mes', included: true },
      { text: 'Todos los exámenes oficiales', included: true },
      { text: 'Historial básico', included: true },
      { text: 'Camino PAU', included: false },
      { text: 'Simulacros', included: false },
      { text: 'Chat tutor IA con límite diario', included: false },
    ],
    cta: 'Empezar gratis',
    href: '/login',
  },
  {
    name: 'Mensual',
    price: '7,99 €',
    period: '/mes · cancela cuando quieras',
    description: 'Todo incluido. La forma más flexible de preparar la PAU mes a mes.',
    features: [
      { text: 'Correcciones amplias con IA con uso responsable', included: true },
      { text: 'Todos los exámenes oficiales', included: true },
      { text: 'Camino PAU y misiones diarias', included: true },
      { text: 'Simulacros diarios según plan', included: true },
      { text: 'Chat con tutor IA con límite diario', included: true },
      { text: 'Plan de estudio personalizado', included: true },
    ],
    cta: 'Empezar ahora',
    href: '/login',
    popular: true,
    popularLabel: 'Precio de lanzamiento',
  },
  {
    name: 'Pack Curso PAU',
    price: '49 €',
    priceStrike: '79 €',
    period: 'sep–jun · pago único',
    description: 'Acceso para todo el curso académico. La opción más completa y económica.',
    features: [
      { text: 'Correcciones amplias con IA con uso responsable', included: true },
      { text: 'Todos los exámenes oficiales', included: true },
      { text: 'Camino PAU completo sep–jun', included: true },
      { text: 'Simulacros diarios según plan', included: true },
      { text: 'Chat con tutor IA con límite diario', included: true },
      { text: 'Sin renovación mensual', included: true },
    ],
    cta: 'Reservar early bird',
    href: '/login',
    popular: true,
    popularLabel: 'Early bird hasta 30 sep',
    popularAmber: true,
  },
  {
    name: 'Pack Intensivo',
    price: '19,99 €',
    period: 'mayo–jul · pago único',
    description: 'Para la recta final de la PAU. Acceso completo mayo–julio sin renovación.',
    features: [
      { text: 'Correcciones amplias con IA con uso responsable', included: true },
      { text: 'Todos los exámenes oficiales', included: true },
      { text: 'Camino PAU mayo–julio', included: true },
      { text: 'Simulacros diarios según plan', included: true },
      { text: 'Chat con tutor IA con límite diario', included: true },
      { text: 'Sin renovación', included: true },
    ],
    cta: 'Quiero el Pack Intensivo',
    href: '/login',
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b border-border/60 bg-white/80 px-6 backdrop-blur-xl lg:px-12">
        <Link href="/landing" className="flex items-center gap-3 no-underline">
          <PausiaBrand subtitle={null} size="md" />
        </Link>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/landing">Volver</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/login">Entrar</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl space-y-5 text-center">
            <span className="inline-flex items-center rounded-full border border-border bg-white px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
              Precios de lanzamiento
            </span>
            <h1 className="text-4xl font-black tracking-tight lg:text-5xl" style={{ letterSpacing: '-0.025em' }}>
              Elige tu plan PAU
            </h1>
            <p className="text-base text-muted-foreground" style={{ maxWidth: 'none' }}>
              Empieza gratis. Actualiza cuando quieras.{' '}
              <span className="font-semibold text-foreground">Sin permanencia</span> en el plan mensual.
            </p>
          </div>

          {/* Cards grid */}
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={[
                  'relative flex flex-col transition-all duration-200 hover:-translate-y-1',
                  plan.popular && !plan.popularAmber
                    ? 'border-primary/40 bg-blue-50/60 shadow-md'
                    : plan.popularAmber
                    ? 'border-amber-300/60 bg-amber-50/40'
                    : '',
                ].join(' ')}
              >
                {/* Badge */}
                {plan.popular && (
                  <span
                    className={[
                      'absolute inset-x-0 -top-3 mx-auto flex h-6 w-fit items-center rounded-full px-3 py-1 text-[10px] font-black ring-1 ring-inset ring-white/20 ring-offset-1',
                      plan.popularAmber
                        ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-amber-950 ring-offset-amber-50/30'
                        : 'bg-gradient-to-r from-blue-600 to-sky-400 text-white ring-offset-blue-50/30',
                    ].join(' ')}
                  >
                    {plan.popularLabel}
                  </span>
                )}

                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-black">{plan.name}</CardTitle>

                  {/* Price */}
                  <div className="mt-3 flex items-end gap-2">
                    <span
                      className={[
                        'text-3xl font-black leading-none',
                        plan.popular && !plan.popularAmber ? 'text-primary' : '',
                      ].join(' ')}
                    >
                      {plan.price}
                    </span>
                    {plan.priceStrike && (
                      <span className="pb-0.5 text-lg font-semibold text-muted-foreground line-through">
                        {plan.priceStrike}
                      </span>
                    )}
                  </div>

                  <CardDescription className="mt-1 text-xs font-semibold">
                    {plan.period}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 space-y-4">
                  <p className="text-xs leading-relaxed text-muted-foreground">{plan.description}</p>
                  <hr className="border-dashed border-border" />
                  <ul className="space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f.text} className="flex items-start gap-2 text-xs font-medium">
                        {f.included ? (
                          <Check
                            className={[
                              'mt-0.5 size-3.5 shrink-0',
                              plan.popular && !plan.popularAmber ? 'text-primary' : 'text-emerald-600',
                            ].join(' ')}
                          />
                        ) : (
                          <X className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/40" />
                        )}
                        <span className={f.included ? 'text-foreground/80' : 'text-muted-foreground/50'}>
                          {f.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="mt-auto pt-2">
                  <Button
                    asChild
                    variant={plan.popular && !plan.popularAmber ? 'default' : plan.popularAmber ? 'default' : 'outline'}
                    className={[
                      'w-full text-xs',
                      plan.popularAmber
                        ? 'bg-gradient-to-r from-amber-500 to-orange-400 text-white hover:brightness-105'
                        : '',
                    ].join(' ')}
                  >
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Los precios incluyen IVA. El Pack Curso PAU early bird está disponible hasta el 30 de septiembre de 2026.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex flex-wrap justify-center gap-4 pb-10 text-xs text-muted-foreground">
        {[
          { href: '/legal/privacidad', label: 'Privacidad' },
          { href: '/legal/terminos', label: 'Términos' },
          { href: '/legal/reembolsos', label: 'Reembolsos' },
          { href: '/legal/ia', label: 'Uso de IA' },
          { href: '/contacto', label: 'Contacto' },
        ].map((l, i, arr) => (
          <span key={l.href} className="flex items-center gap-4">
            <Link href={l.href} className="transition-colors hover:text-foreground">
              {l.label}
            </Link>
            {i < arr.length - 1 && <span className="text-border">·</span>}
          </span>
        ))}
      </footer>
    </div>
  )
}
