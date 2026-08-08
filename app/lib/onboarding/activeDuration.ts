'use client'

// Fase 0 de observabilidad del onboarding: mide cuánto tiempo pasa un alumno
// en un paso, distinguiendo tiempo total (elapsed) de tiempo con la pestaña
// visible (active). Sin esto, alguien que se va a WhatsApp cinco minutos
// parecería haber tardado cinco minutos en elegir una asignatura.
export function createActiveDurationTracker() {
  const startedAt = Date.now()
  let activeMs = 0
  let lastResumeAt = typeof document !== 'undefined' && document.visibilityState === 'hidden' ? null : Date.now()

  function onVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      if (lastResumeAt !== null) {
        activeMs += Date.now() - lastResumeAt
        lastResumeAt = null
      }
    } else if (lastResumeAt === null) {
      lastResumeAt = Date.now()
    }
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', onVisibilityChange)
  }

  return {
    getDurations() {
      const elapsedMs = Date.now() - startedAt
      const currentActiveMs = activeMs + (lastResumeAt !== null ? Date.now() - lastResumeAt : 0)
      return { elapsedMs, activeMs: currentActiveMs }
    },
    destroy() {
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisibilityChange)
      }
    },
  }
}
