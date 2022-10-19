import { readItemFx, writeItemFx } from '~/cookie-storage'
import { root } from '~/effector-root'
import { uuid } from '~/lib/fast-uuid'
import type {
  MarketingSessionConfigState,
  MarketingSessionEvent,
  SetPersistedStateFxParams,
} from '~/marketing-session/contracts'
import { LAST_EXTERNAL_REFERRER_KEY, LAST_UTM_KEY, Reason, SESSION_ID_KEY } from '~/marketing-session/contracts'
import { updateLastEventMsTs } from '~/marketing-session/utils/last-event'
import { getExternalReferrer, isRefererChanged } from '~/marketing-session/utils/referer'
import { isFirstMarketingSession, isMarketingSessionExpired } from '~/marketing-session/utils/session'
import { isUtmChanged, parseUtm } from '~/marketing-session/utils/utm'

const sessionDomain = root.createDomain()

export const $marketingSessionConfig = sessionDomain.store<MarketingSessionConfigState>({
  host: '',
  hostsToIgnore: [],
})

export const $marketingSessionId = sessionDomain.store<string>('')

export const getPersistedSessionIdFx = sessionDomain.effect(async () => {
  const { value } = await readItemFx({ key: SESSION_ID_KEY })
  return value || ''
})

export const getNewSessionIdFx = sessionDomain.effect(uuid)

export const isMarketingSessionExpiredFx = sessionDomain.effect(isMarketingSessionExpired)

export const updateLastEventMsTsFx = sessionDomain.effect(updateLastEventMsTs)

export const updateUtmFx = sessionDomain.effect(async () => {
  let value = ''

  try {
    const utm = parseUtm(window.location.search)

    if (utm) {
      value = JSON.stringify(utm)
    }
  } catch (error) {
    console.error(error)
  }

  await writeItemFx({ key: LAST_UTM_KEY, value })
})

export const updateLastExternalReferrerFx = sessionDomain.effect(
  async ({ host, hostsToIgnore }: SetPersistedStateFxParams) => {
    await writeItemFx({
      key: LAST_EXTERNAL_REFERRER_KEY,
      value: getExternalReferrer(host, hostsToIgnore),
    })
  },
)

export const updateMarketingSessionIdFx = sessionDomain.effect(async ({ sessionId }: SetPersistedStateFxParams) => {
  await writeItemFx({ key: SESSION_ID_KEY, value: sessionId })
})

export const getReasonToUpdateSessionFx = sessionDomain.effect(
  async ({ host, hostsToIgnore, sessionId }: SetPersistedStateFxParams): Promise<Reason> => {
    if (await isFirstMarketingSession(sessionId)) {
      return Reason.FIRST_SESSION
    }

    if (await isMarketingSessionExpired()) {
      return Reason.SESSION_EXPIRED
    }

    if (await isUtmChanged()) {
      return Reason.UTM_CHANGED
    }

    if (await isRefererChanged(host, hostsToIgnore)) {
      return Reason.REFERER_CHANGED
    }

    return Reason.NO_UPDATES
  },
)

export const enableSession = sessionDomain.event<MarketingSessionConfigState>()

export const setSessionState = sessionDomain.event<MarketingSessionConfigState>()

export const disableSession = sessionDomain.event()

export const sessionReady = sessionDomain.event()

export const startInterval = sessionDomain.event()

export const stopInterval = sessionDomain.event()

export const dispatchSessionEvent = sessionDomain.event<MarketingSessionEvent>()
