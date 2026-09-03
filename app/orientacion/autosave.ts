export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error'

type PendingValue<T> = { sequence: number; value: T }

/** Debounces changes and serializes writes so an older request can never finish last. */
export class LatestStateAutosave<T> {
  private sequence = 0
  private pending: PendingValue<T> | null = null
  private timer: ReturnType<typeof setTimeout> | null = null
  private active: Promise<void> | null = null
  private disposed = false
  private readonly save: (value: T) => Promise<void>
  private readonly onStatus: (status: AutosaveStatus) => void
  private readonly delay: number

  constructor(
    save: (value: T) => Promise<void>,
    onStatus: (status: AutosaveStatus) => void,
    delay = 750,
  ) {
    this.save = save
    this.onStatus = onStatus
    this.delay = delay
  }

  update(value: T) {
    if (this.disposed) return
    this.pending = { sequence: ++this.sequence, value }
    if (this.timer) clearTimeout(this.timer)
    this.timer = setTimeout(() => { this.timer = null; void this.run() }, this.delay)
  }

  async flush(): Promise<void> {
    const sequenceToFlush = this.sequence
    let lastAttempted = -1
    while (!this.disposed) {
      if (this.timer) { clearTimeout(this.timer); this.timer = null }
      if (this.active) { await this.active; continue }
      const next = this.pending
      if (!next || next.sequence > sequenceToFlush || next.sequence === lastAttempted) return
      lastAttempted = next.sequence
      await this.run()
    }
  }

  retry() {
    if (!this.pending || this.disposed) return
    if (this.timer) clearTimeout(this.timer)
    this.timer = null
    void this.run()
  }

  dispose() {
    this.disposed = true
    if (this.timer) clearTimeout(this.timer)
    this.timer = null
  }

  private async run() {
    if (this.active || !this.pending || this.disposed) return
    const saving = this.pending
    this.pending = null
    this.onStatus('saving')
    let failed = false
    this.active = (async () => {
      try {
        await this.save(saving.value)
      } catch {
        failed = true
        if (!this.pending) this.pending = saving
        if (this.pending.sequence === saving.sequence) this.onStatus('error')
      }
    })()
    await this.active
    this.active = null
    if (this.disposed) return
    const pendingAfterSave = this.pending as PendingValue<T> | null
    if (pendingAfterSave && (!failed || pendingAfterSave.sequence > saving.sequence)) {
      void this.run()
    } else if (!failed) {
      this.onStatus('saved')
    }
  }
}
