import { readItemFx, writeItemFx } from '~/cookie-storage'

const LEGACY_LAST_EVENT_TIMESTAMP_KEY = 'rete_marketing_session_3_last_event_ts'
const LEGACY_LAST_EXTERNAL_REFERRER_KEY = 'rete_marketing_session_3_last_external_referrer'
const LEGACY_LAST_UTM_KEY = 'rete_marketing_session_3_last_utm'
const LEGACY_SESSION_ID_KEY = 'rete-marketing-session-3-id'

const LAST_EVENT_TIMESTAMP_KEY = 'rete_marketing_session_3_last_event_ts'
const LAST_EXTERNAL_REFERRER_KEY = 'rete_marketing_session_3_last_external_referrer'
const LAST_UTM_KEY = 'rete_marketing_session_3_last_utm'
const SESSION_ID_KEY = 'rete-marketing-session-3-id'

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

type UTM = {
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  utm_term: string | null
  gclid: string | null
  yclid: string | null
  ymclid: string | null
  fbclid: string | null
}

const legacyValidateUTM = (utm: any): boolean => {
  const isStringOrNull = (something: any) => {
    return something === null || typeof something === 'string'
  }

  return (
    typeof utm === 'object' &&
    isStringOrNull(utm.utm_source) &&
    isStringOrNull(utm.utm_medium) &&
    isStringOrNull(utm.utm_campaign) &&
    isStringOrNull(utm.utm_content) &&
    isStringOrNull(utm.utm_term) &&
    isStringOrNull(utm.gclid) &&
    isStringOrNull(utm.yclid) &&
    isStringOrNull(utm.ymclid) &&
    isStringOrNull(utm.fbclid)
  )
}

const legacyGetLastUTM = () => {
  const serialized = window.localStorage.getItem(LEGACY_LAST_UTM_KEY)
  if (serialized === null) {
    return null
  }

  let utm: UTM
  try {
    utm = JSON.parse(serialized)
  } catch (err) {
    return null
  }

  return legacyValidateUTM(utm) ? utm : null
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

const validateUTM = (utm: any): boolean => {
  const isStringOrNull = (something: any) => {
    return something === null || typeof something === 'string'
  }

  return (
    typeof utm === 'object' &&
    isStringOrNull(utm.utm_source) &&
    isStringOrNull(utm.utm_medium) &&
    isStringOrNull(utm.utm_campaign) &&
    isStringOrNull(utm.utm_content) &&
    isStringOrNull(utm.utm_term) &&
    isStringOrNull(utm.gclid) &&
    isStringOrNull(utm.yclid) &&
    isStringOrNull(utm.ymclid) &&
    isStringOrNull(utm.fbclid)
  )
}

const getLastUTM = async () => {
  const serialized = await readItemFx({ key: LAST_UTM_KEY }).then(({ value }) => value)
  if (serialized === null) {
    return null
  }

  let utm: UTM
  try {
    utm = JSON.parse(serialized)
  } catch (err) {
    return null
  }

  return validateUTM(utm) ? utm : null
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

const writeLastUTM = (utm: UTM) => {
  try {
    return writeItemFx({ key: LAST_UTM_KEY, value: JSON.stringify(utm) })
  } catch (error) {
    console.error(error)
    return undefined
  }
}

export const migrateMarketingSession3 = async () => {
  const legacyLastEventMs = legacyGetLastEventMsTs()
  const lastEventMs = await getLastEventMsTs()

  const legacyLastExternalReferrer = legacyGetLastExternalReferrer()
  const lastExternalReferrer = await getLastExternalReferrer()

  const legacySessionId = legacyGetSessionId()
  const sessionId = await getSessionId()

  const legacyLastUTM = legacyGetLastUTM()
  const lastUTM = await getLastUTM()

  if (typeof legacyLastEventMs === 'number' && typeof lastEventMs !== 'number') {
    // TODO: Надо ли нам проверять тип `legacyLastExternalReferrer`
    // noinspection SuspiciousTypeOfGuard
    if (typeof legacyLastExternalReferrer === 'string' && typeof lastExternalReferrer !== 'string') {
      if (legacySessionId && !sessionId) {
        if (legacyLastUTM && !lastUTM) {
          await Promise.all([
            writeLastEventMsTs(legacyLastEventMs),
            writeLastExternalReferrer(legacyLastExternalReferrer),
            writeSessionId(legacySessionId),
            writeLastUTM(legacyLastUTM),
          ])
        }
      }
    }
  }
}
