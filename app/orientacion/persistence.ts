import type { OrientationTarget } from './data'

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
