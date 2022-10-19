import { getCookie } from '~/lib/cookies'
import { waitFor } from '~/lib/wait-for'

export function waitForCookie(name: string, attemptIntervalMs = 500, maxWaitingMs?: number): Promise<string | null> {
  const checkCookie = () => getCookie(name) !== null
  return waitFor(checkCookie, attemptIntervalMs, maxWaitingMs).then(cookieExists => {
    if (cookieExists) {
      return getCookie(name)
    }
    return null
  })
}
