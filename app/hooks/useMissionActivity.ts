'use client'

// Adaptador entre el navegador y MissionActivityTracker.
//
// El hook no decide nada: traduce eventos del DOM a entradas de la máquina de
// estados y efectos de la máquina a peticiones. Toda la lógica de cuándo abre,
// cuándo cierra y con qué marca de tiempo vive en el tracker, que es puro y
// está probado aparte.
//
// Dos cosas que sí resuelve este fichero, porque son de entorno y no de lógica:
//
//  - El diario local. Los marcadores se acumulan en memoria hasta cerrar el
//    tramo, así que un navegador que muere se los lleva. Espejarlos en
//    localStorage no cuesta ni una petición, y permite que la SIGUIENTE carga
//    encuentre el tramo huérfano y mande su cierre tardío. Un tramo así se
//    marca `recovered_after_crash` y no finge ser una observación limpia.
//
//  - La cola offline. Un cierre que no sale se guarda con SUS marcas
//    originales y se reintenta; reescribirlas al momento del envío convertiría
//    un tramo real de hace una hora en uno falso de ahora mismo. Los duplicados
//    los absorbe el unique de camino_mission_events por segment_id.

import { useCallback, useEffect, useRef } from 'react'
import { supabase } from '@/app/lib/supabase'
import { mintSegmentId } from '@/app/lib/camino/beginMissionObservation'
import {
  consumePendingStart,
  readOrCreateOrigin,
  safeSessionStorage,
} from '@/app/lib/camino/pendingMissionStart'
import {
  MissionActivityTracker,
  type ClosedPayload,
  type OpenedPayload,
  type TrackerEffect,
} from '@/app/lib/camino/missionActivityTracker'
import type { MarkerType } from '@/app/lib/camino/activitySegments'

const JOURNAL_KEY = 'kairo:activity-journal'
const OUTBOX_KEY = 'kairo:activity-outbox'
const TICK_MS = 30_000

type OutboxEntry = { missionId: string; body: Record<string, unknown> }

function safeLocal(): Storage | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null
    return window.localStorage
  } catch {
    return null
  }
}

function readJson<T>(storage: Storage | null, key: string, fallback: T): T {
  if (!storage) return fallback
  try {
    const raw = storage.getItem(key)
    return raw ? JSON.parse(raw) as T : fallback
  } catch {
    return fallback
  }
}

function writeJson(storage: Storage | null, key: string, value: unknown) {
  if (!storage) return
  try { storage.setItem(key, JSON.stringify(value)) } catch { /* sin diario, seguimos */ }
}

function openedBody(missionId: string, payload: OpenedPayload) {
  return {
    missionId,
    type: 'opened' as const,
    segmentId: payload.segmentId,
    occurredAt: payload.occurredAt,
    openReason: payload.openReason,
    origin: payload.origin,
    seq: payload.seq,
  }
}

function closedBody(missionId: string, payload: ClosedPayload) {
  return {
    missionId,
    type: 'closed' as const,
    segmentId: payload.segmentId,
    occurredAt: payload.closeDetectedAt,
    startedAt: payload.startedAt,
    lastActivityAt: payload.lastActivityAt,
    closeReason: payload.closeReason,
    origin: payload.origin,
    markers: payload.markers,
    markersTruncated: payload.markersTruncated,
  }
}

export function useMissionActivity(missionId: string | null) {
  const trackerRef = useRef<MissionActivityTracker | null>(null)

  const send = useCallback(async (body: Record<string, unknown>) => {
    const local = safeLocal()
    try {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      if (!token) throw new Error('sin sesión')
      const response = await fetch('/api/camino/mission-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      if (!response.ok) throw new Error(`status ${response.status}`)
      return true
    } catch {
      // Se encola con las marcas originales intactas.
      const outbox = readJson<OutboxEntry[]>(local, OUTBOX_KEY, [])
      outbox.push({ missionId: String(body.missionId), body })
      writeJson(local, OUTBOX_KEY, outbox.slice(-50))
      return false
    }
  }, [])

  const flushOutbox = useCallback(async () => {
    const local = safeLocal()
    const outbox = readJson<OutboxEntry[]>(local, OUTBOX_KEY, [])
    if (outbox.length === 0) return
    writeJson(local, OUTBOX_KEY, [])
    for (const entry of outbox) {
      await send(entry.body)
    }
  }, [send])

  const apply = useCallback((effects: TrackerEffect[]) => {
    if (!missionId) return
    const local = safeLocal()
    for (const effect of effects) {
      if (effect.kind === 'open') {
        void send(openedBody(missionId, effect.payload))
      } else {
        // El diario deja de hacer falta en cuanto el cierre sale de aquí.
        writeJson(local, JOURNAL_KEY, null)
        void send(closedBody(missionId, effect.payload))
      }
    }
  }, [missionId, send])

  const markEngagement = useCallback((marker: MarkerType) => {
    const tracker = trackerRef.current
    if (!tracker) return
    apply(tracker.handle({ kind: 'engagement', at: Date.now(), marker }))
  }, [apply])

  /**
   * Cierra el tramo ANTES de completar la misión. El orden importa: el servidor
   * deriva la duración al completar, y si el cierre llegara después vería un
   * tramo descabalado y degradaría a `partial` una medición que era limpia.
   */
  const closeForCompletion = useCallback(async () => {
    const tracker = trackerRef.current
    if (!tracker || !missionId) return
    const effects = tracker.handle({ kind: 'complete', at: Date.now() })
    const local = safeLocal()
    writeJson(local, JOURNAL_KEY, null)
    for (const effect of effects) {
      if (effect.kind === 'close') await send(closedBody(missionId, effect.payload))
    }
  }, [missionId, send])

  useEffect(() => {
    if (!missionId) return
    const session = safeSessionStorage()
    const local = safeLocal()
    const origin = readOrCreateOrigin(session, mintSegmentId)

    const tracker = new MissionActivityTracker({ origin, mintSegmentId })
    trackerRef.current = tracker

    void flushOutbox()

    // Un tramo que quedó abierto en el diario pertenece a una carga anterior
    // que murió sin pagehide. Se cierra tarde y declarándolo.
    const orphan = readJson<(ClosedPayload & { missionId: string }) | null>(local, JOURNAL_KEY, null)
    if (orphan && orphan.segmentId && orphan.missionId) {
      writeJson(local, JOURNAL_KEY, null)
      void send(closedBody(orphan.missionId, {
        ...orphan,
        closeReason: 'recovered_after_crash',
        closeDetectedAt: orphan.lastActivityAt,
      }))
    }

    // El clic deliberado desde Camino, si lo hubo. Si no, el primer engagement
    // abrirá el tramo por su cuenta: la carga de la página nunca inicia nada.
    const pending = consumePendingStart(session, missionId, Date.now())
    if (pending) {
      apply(tracker.handle({
        kind: 'pending_start',
        at: Date.now(),
        segmentId: pending.segmentId,
        t0: pending.t0,
      }))
    }

    const onVisibility = () => {
      apply(tracker.handle({
        kind: 'visibility',
        at: Date.now(),
        visible: document.visibilityState === 'visible',
      }))
    }
    const onPageHide = () => {
      apply(tracker.handle({ kind: 'pagehide', at: Date.now() }))
    }
    const onScroll = () => markEngagement('scroll')
    const onOnline = () => { void flushOutbox() }

    const timer = window.setInterval(() => {
      apply(tracker.handle({ kind: 'tick', at: Date.now() }))
      // Espejo del tramo vivo: lo que rescata los marcadores tras un crash.
      if (tracker.hasOpenSegment) {
        const snapshot = tracker.snapshot()
        if (snapshot) writeJson(local, JOURNAL_KEY, { ...snapshot, missionId })
      }
    }, TICK_MS)

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', onPageHide)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('online', onOnline)

    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', onPageHide)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('online', onOnline)
      apply(tracker.handle({ kind: 'pagehide', at: Date.now() }))
      trackerRef.current = null
    }
  }, [missionId, apply, flushOutbox, markEngagement, send])

  return { markEngagement, closeForCompletion }
}
