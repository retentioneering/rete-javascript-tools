import { readItemFx, writeItemFx } from '~/cookie-storage'

const LEGACY_LAST_EVENT_TIMESTAMP_KEY = 'last_event_ts'
const LEGACY_LAST_EXTERNAL_REFERRER_KEY = 'rete-last-external-referrer'
const LEGACY_SESSION_ID_KEY = 'rete-session-id'

const LAST_EVENT_TIMESTAMP_KEY = 'last_event_ts'
const LAST_EXTERNAL_REFERRER_KEY = 'rete-last-external-referrer'
const SESSION_ID_KEY = 'rete-session-id'

const legacyGetLastEventMsTs = () => {
  const strVal = window.localStorage.getItem(LEGACY_LAST_EVENT_TIMESTAMP_KEY)
  if (strVal === null) {
    return null
  }
  return +strVal
}

const legacyGetLastExternalReferrer = () => {
  return window.localStorage.getItem(LEGACY_LAST_EXTERNAL_REFERRER_KEY)
}

const legacyGetSessionId = () => {
  return window.localStorage.getItem(LEGACY_SESSION_ID_KEY)
}

const getLastEventMsTs = async () => {
  const strVal = await readItemFx({ key: LAST_EVENT_TIMESTAMP_KEY }).then(({ value }) => value)
  if (strVal === null) {
    return null
  }
  return +strVal
}

const getLastExternalReferrer = () => {
  return readItemFx({
    key: LAST_EXTERNAL_REFERRER_KEY,
  }).then(({ value }) => value)
}

const getSessionId = () => {
  return readItemFx({ key: SESSION_ID_KEY }).then(({ value }) => value)
}

const writeLastEventMsTs = (value: number) => {
  return writeItemFx({
    key: LAST_EVENT_TIMESTAMP_KEY,
    value: `${value}`,
  })
}

const writeLastExternalReferrer = (referrer: string) => {
  return writeItemFx({
    key: LAST_EXTERNAL_REFERRER_KEY,
    value: referrer,
  })
}

const writeSessionId = (sessionId: string) => {
  return writeItemFx({
    key: SESSION_ID_KEY,
    value: sessionId,
  })
}

export const migrateBaseSession = async () => {
  const legacyLastEventMs = legacyGetLastEventMsTs()
  const lastEventMs = await getLastEventMsTs()

  const legacyLastExternalReferrer = legacyGetLastExternalReferrer()
  const lastExternalReferrer = await getLastExternalReferrer()

  const legacySessionId = legacyGetSessionId()
  const sessionId = await getSessionId()

  if (typeof legacyLastEventMs === 'number' && typeof lastEventMs !== 'number') {
    // TODO: Надо ли нам проверять тип `legacyLastExternalReferrer`
    // noinspection SuspiciousTypeOfGuard
    if (typeof legacyLastExternalReferrer === 'string' && typeof lastExternalReferrer !== 'string') {
      if (legacySessionId && !sessionId) {
        await Promise.all([
          writeLastEventMsTs(legacyLastEventMs),
          writeLastExternalReferrer(legacyLastExternalReferrer),
          writeSessionId(legacySessionId),
        ])
      }
    }
  }
}
