/** PostgREST applies a row cap even without .limit(). Always paginate summaries. */
export async function readAllRows<T>(page: (from: number, to: number) => PromiseLike<{
  data: T[] | null; error: { message: string } | null
}>): Promise<T[]> {
  const rows: T[] = []
  const size = 500
  for (let from = 0; ; from += size) {
    const result = await page(from, from + size - 1)
    if (result.error) throw new Error(result.error.message)
    const batch = result.data ?? []
    rows.push(...batch)
    if (batch.length < size) return rows
  }
}
