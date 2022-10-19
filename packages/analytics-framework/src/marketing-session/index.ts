import { domEventCaptured } from '~/dom-events-tracker'
import { disableSession, enableSession, sessionReady } from '~/marketing-session/model/public'
import { updateLastEventMsTs } from '~/marketing-session/utils/last-event'

const waitSessionReady = (): Promise<void> => {
  return new Promise(resolve => {
    const unwatch = sessionReady.watch(() => {
      resolve()
      unwatch()
    })
  })
}

export const trackMarketingSession = async (host: string, hostsToIgnore: string[]): Promise<void> => {
  enableSession({ host, hostsToIgnore })

  await waitSessionReady()

  const domEventCapturedUnwatch = domEventCaptured.watch(updateLastEventMsTs)

  const disableSessionUnwatch = disableSession.watch(() => {
    domEventCapturedUnwatch()
    disableSessionUnwatch()
  })
}
