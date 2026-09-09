export const CORRECTION_REQUEST_TIMEOUT_MS = 70_000

export async function fetchCorrection(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs = CORRECTION_REQUEST_TIMEOUT_MS,
  fetchImpl: typeof fetch = fetch,
) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(new DOMException('Correction request timed out', 'TimeoutError')), timeoutMs)
  try {
    return await fetchImpl(input, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}
