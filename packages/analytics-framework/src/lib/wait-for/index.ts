export function waitFor(target: () => boolean, attemptIntervalMs = 500, maxWaitingMs?: number): Promise<boolean> {
  const startedAt = Date.now()
  return new Promise(resolve => {
    const attempt = () => {
      if (target()) {
        return resolve(true)
      }
      const durationMs = Date.now() - startedAt
      if (typeof maxWaitingMs !== 'number' || durationMs < maxWaitingMs) {
        setTimeout(attempt, attemptIntervalMs)
        return
      }
      resolve(false)
    }
    attempt()
  })
}
