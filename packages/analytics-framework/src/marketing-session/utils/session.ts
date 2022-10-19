import { SESSION_LIFETIME_MS } from '~/marketing-session/contracts'
import { getLastEventMsTs } from '~/marketing-session/utils/last-event'

export const isFirstMarketingSession = async (sessionId: string | undefined): Promise<boolean> => {
  if (!sessionId) {
    return true
  }

  const lastEventMsTs = await getLastEventMsTs()

  return !lastEventMsTs
}

export const isMarketingSessionExpired = async (): Promise<boolean> => {
  const lastEventMsTs = await getLastEventMsTs()

  if (!lastEventMsTs) {
    return false
  }

  const deltaMs = Date.now() - lastEventMsTs

  return deltaMs > SESSION_LIFETIME_MS
}
