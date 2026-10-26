/**
 * Lightweight per-key asynchronous lock to serialize concurrent read-modify-write
 * operations on the same document key, preventing race condition data overwrites.
 */
export default class AsyncLock {
  constructor() {
    this.queues = new Map()
  }

  acquire(key, task) {
    const queueKey = String(key)
    const current = this.queues.get(queueKey) || Promise.resolve()

    const next = current
      .then(() => task())
      .catch((err) => {
        // Propagate error to caller without deadlocking subsequent tasks in queue
        throw err
      })
      .finally(() => {
        if (this.queues.get(queueKey) === next) {
          this.queues.delete(queueKey)
        }
      })

    this.queues.set(queueKey, next)
    return next
  }
}
