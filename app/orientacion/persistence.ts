import type { OrientationTarget } from './data'
import { parseOrientationState, type OrientationStateV1 } from './state.ts'

export function buildOrientationSavePayload(target: OrientationTarget) {
  return {
    target_degree_id: target.degreeId,
    target_university_id: target.universityId,
    target_degree: target.degree,
    target_university: target.university,
    target_community: target.community,
    target_admission_score: target.referenceScore,
    source_type: target.source.type,
  }
}

export async function persistOrientationTarget(
  accessToken: string,
  target: OrientationTarget,
  request: typeof fetch = fetch,
) {
  try {
    const response = await request('/api/orientation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + accessToken },
      body: JSON.stringify(buildOrientationSavePayload(target)),
    })
    return response.ok
  } catch {
    return false
  }
}

export async function loadOrientationState(
  accessToken: string | null,
  request: typeof fetch = fetch,
): Promise<OrientationStateV1 | null> {
  if (!accessToken) return null
  const response = await request('/api/orientation/state', {
    headers: { Authorization: 'Bearer ' + accessToken },
  })
  if (!response.ok) throw new Error('orientation-state-load')
  const body = await response.json() as { state?: unknown }
  if (body.state === null || body.state === undefined) return null
  const state = parseOrientationState(body.state)
  if (!state) throw new Error('orientation-state-invalid')
  return state
}

export async function persistOrientationState(
  accessToken: string | null,
  state: OrientationStateV1,
  request: typeof fetch = fetch,
): Promise<OrientationStateV1 | null> {
  if (!accessToken) return null
  const response = await request('/api/orientation/state', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + accessToken },
    body: JSON.stringify({ state }),
  })
  if (!response.ok) throw new Error('orientation-state-save')
  const body = await response.json() as { state?: unknown }
  const saved = parseOrientationState(body.state)
  if (!saved) throw new Error('orientation-state-invalid')
  return saved
}
