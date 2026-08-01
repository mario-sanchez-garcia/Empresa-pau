/**
 * Runs `worker` over `items` in fixed-size concurrent batches, awaiting each
 * batch (via Promise.allSettled) before starting the next. A rejection from
 * one item never aborts the rest — callers are expected to catch/record
 * failures inside `worker` itself (e.g. via logEmailEvent) if they need the
 * per-item outcome; this just guarantees the batch as a whole keeps going.
 */
export async function runInBatches<T>(
  items: T[],
  batchSize: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    await Promise.allSettled(batch.map(worker))
  }
}
