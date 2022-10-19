/* eslint-disable max-len */
/* eslint-disable camelcase */
import { getCookie } from '~/lib/cookies'
import { browser, os } from '~/lib/env'
import { Request } from '~/lib/request'
import { getExternalReferrer } from '~/marketing-session/utils/referer'
import type { EnabledInfo, EventWithMetadata, PerfInfo, Transport } from '~/types'

const getPlatform = () => `${browser()}, ${os()}, ${window.innerWidth}x${window.innerHeight}`

export type LegacyEvent = PerfInfo & {
  event_name: string
  event_custom_name?: string
  event_value?: string
  event_trigger?: string
  extensive_event_trigger?: string
  event_date_local?: string
  event_date_moscow?: string
  event_day_week?: number
  matched_config_id?: number
  has_matched_config?: 1 | 0
  dom_context?: string
  collect_dom?: 1 | 0
  is_action_event?: 1 | 0
  params?: string
  event_auto: 1 | 0
  event_timestamp: number
  event_timestamp_ms: number
  current_location: string
  current_type: string
  next_location?: string
  next_type?: string
  version: string
  source: string
  user_id: string
  custom_user_id_1?: string
  custom_user_id_2?: string
  custom_user_id_3?: string
  custom_user_id_4?: string
  external_referrer?: string
  fingerprint?: string
  dom_info?: string
  api_info?: string
  title?: string
  index?: number
  dmp_id?: string
  dmp_response_ms?: number
  dmp_user_info?: string
  client_session_id?: string
  client_session_event_index?: number
  source_selector?: string
  cookies?: string
  is_iframe?: 1 | 0
  platform?: string
  parent_window_session_id?: string
  parent_window_user_id?: string
  parent_window_not_responding?: 1 | 0
  base_endpoint_enabled_by_rete_fraction?: 1 | 0
  base_endpoint_enabled_by_ga_fraction?: 1 | 0
  base_endpoint_enabled_by_ym_fraction?: 1 | 0
  base_endpoint_enabled_by_trigger?: 1 | 0
  base_endpoint_enabled_by_force?: 1 | 0
  base_endpoint_enabled_by_url_parameter?: 1 | 0
  base_endpoint_enabled_by_session_fraction?: 1 | 0
  base_endpoint_enabled_by_specific_event_fraction?: 1 | 0
  session_type?: string
  base_session_id?: string
  marketing_session_type_1_id?: string
  marketing_session_type_2_id?: string
  marketing_session_type_3_id?: string
  has_network_error: 1 | 0
  gtm_is_ok: 1 | 0
}

type NumBool = 1 | 0

type CreteLegacyEventParams = {
  mainDomain: string
  event: EventWithMetadata
  enabledInfo: EnabledInfo
  collectCookies?: string[]
  version: string
  source: string
  hasErrors: boolean
  gtmIsOk: boolean
  getCombinedUserId: (reteUserId: string) => string
  getCustomUserIds: { (): string | undefined }[]
  sendCustomEventsData: 'event_value' | 'as_it_is'
}

const IGNORED_KEYS = {
  current_location: 1,
  current_type: 1,
} as const

type CensoredEvent = Omit<LegacyEvent, keyof typeof IGNORED_KEYS>

const censorEvent = (event: LegacyEvent): CensoredEvent => {
  return Object.entries(event).reduce((acc, [key, value]) => {
    if (!(key in IGNORED_KEYS)) {
      const k = key as keyof CensoredEvent
      ;(acc[k] as CensoredEvent[typeof k]) = value
    }

    return acc
  }, {} as CensoredEvent)
}

const isTopWindow = () => window.self === window.top

type Cookies = {
  [key: string]: string
}

const getCookies = (collectCookies?: string[]): Cookies | null => {
  if (!collectCookies) {
    return null
  }

  const cookies: Cookies = {}
  let hasCookies = false

  collectCookies.forEach(cookieName => {
    const value = getCookie(cookieName)
    if (typeof value === 'string') {
      hasCookies = true
      cookies[cookieName] = value
    }
  })

  if (hasCookies) {
    return cookies
  }

  return null
}

const createLegacyEventObject = ({
  mainDomain,
  event,
  enabledInfo,
  version,
  collectCookies,
  source,
  getCombinedUserId,
  getCustomUserIds,
  sendCustomEventsData,
  hasErrors,
  gtmIsOk,
}: CreteLegacyEventParams): LegacyEvent => {
  const externalReferrer = getExternalReferrer(mainDomain)
  const eventTimestamp = (Date.now() / 1000) | 0
  const eventTimestampMs = Date.now()

  const cookies = getCookies(collectCookies)

  const win = window as any

  const getCustomUserId = (i: number): string | undefined => {
    return 1 <= i && i <= getCustomUserIds.length ? getCustomUserIds[i - 1]() : undefined
  }

  const main = {
    event_name: event.name,
    has_matched_config: 0 as NumBool,
    event_auto: 0 as NumBool,
    event_timestamp: eventTimestamp,
    event_timestamp_ms: eventTimestampMs,
    event_date_local: new Date()
      .toLocaleString('en-CA', {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timeZoneName: 'short',
        hourCycle: 'h23',
      })
      .replace(/,/g, ''),
    event_date_moscow: new Date()
      .toLocaleString('en-CA', {
        timeZone: 'Europe/Moscow',
        hourCycle: 'h23',
      })
      .replace(/,/g, ''),
    event_day_week: new Date().getDay(),
    user_ip: win.realIP,
    current_location: event.metadata.currentUrl,
    current_type: 'home',
    version,
    source,
    title: event.metadata.title,
    cookies: cookies ? JSON.stringify(cookies) : undefined,
    user_id: getCombinedUserId(event.metadata.userId),
    custom_user_id_1: getCustomUserId(1),
    custom_user_id_2: getCustomUserId(2),
    custom_user_id_3: getCustomUserId(3),
    custom_user_id_4: getCustomUserId(4),
    external_referrer: externalReferrer,
    platform: getPlatform(),
    index: event.metadata.userEventIndex,
    client_session_id: event.metadata.windowId,
    client_session_event_index: event.metadata.windowEventIndex,
    is_iframe: (isTopWindow() ? 0 : 1) as NumBool,
    base_endpoint_enabled_by_rete_fraction: (enabledInfo.enabledByAllEventsFraction ? 1 : 0) as NumBool,
    base_endpoint_enabled_by_ga_fraction: 0 as NumBool,
    base_endpoint_enabled_by_ym_fraction: 0 as NumBool,
    base_endpoint_enabled_by_trigger: 0 as NumBool,
    base_endpoint_enabled_by_force: (enabledInfo.forceEnabledByUser ? 1 : 0) as NumBool,
    base_endpoint_enabled_by_url_parameter: 0 as NumBool,
    base_endpoint_enabled_by_session_fraction: (enabledInfo.enabledBySessionEventsFraction ? 1 : 0) as NumBool,
    base_endpoint_enabled_by_specific_event_fraction: (enabledInfo.enabledByCurrentEventFraction ? 1 : 0) as NumBool,
    marketing_session_type_3_id: event.metadata.marketingSessionId,
    has_network_error: hasErrors ? 1 : (0 as NumBool),
    gtm_is_ok: gtmIsOk ? 1 : (0 as NumBool),
  }

  if (event.type === 'dom-event') {
    return {
      event_custom_name: event.data.eventCustomName,
      event_value: event.data.eventValue,
      event_trigger: event.data.eventTrigger,
      is_action_event: 1,
      extensive_event_trigger: event.data.extensiveEventTrigger,
      next_type: event.data.nextLocation ? 'home' : undefined,
      next_location: event.data.nextLocation,
      source_selector: event.data.eventConfig.selector,
      ...main,
    }
  }

  if (event.type === 'dom-observer') {
    return {
      dom_info: JSON.stringify(event.data),
      ...main,
    }
  }

  if (event.type === 'page-state') {
    return {
      ...event.data.perfInfo,
      ...main,
    }
  }

  if (event.type === 'pageview') {
    return {
      ...main,
    }
  }

  if (event.type === 'document-visibility') {
    return {
      ...main,
    }
  }

  if (event.type === 'session-event') {
    return {
      event_value: event.data.reason,
      ...(externalReferrer && { params: externalReferrer }),
      // TODO: Add to docs
      session_type: 'marketing_session_3',
      ...main,
    }
  }

  if (event.type === 'custom-event') {
    const data = sendCustomEventsData === 'as_it_is' ? event.data : { event_value: JSON.stringify(event.data) }

    return {
      ...data,
      ...main,
    }
  }

  return {
    ...main,
  }
}

type Params<E extends LegacyEvent = LegacyEvent> = {
  baseURL: string
  path: string
  source: string
  version: string
  collectCookies?: string[]
  cookieDomain?: string
  mapEvent?: (event: LegacyEvent) => E
  sendCustomEventsData?: 'event_value' | 'as_it_is'
}

const checkGtm = (): boolean => {
  try {
    return Boolean(
      window.dataLayer &&
        typeof window.dataLayer.find === 'function' &&
        window.dataLayer.some(e => Boolean(e['gtm.start'])),
    )
  } catch (err) {
    return false
  }
}

const HAS_NETWORK_ERROR = 'HAS_NETWORK_ERROR'

export const createLegacyTransport = ({
  baseURL,
  path,
  cookieDomain,
  source,
  version,
  mapEvent,
  sendCustomEventsData = 'as_it_is',
}: Params): Transport => {
  const mainDomain = cookieDomain || window.location.hostname

  const getCombinedUserId = (reteUserId: string): string => {
    const r = reteUserId
    const y = getCookie('_ym_uid') || 'none'
    const g = getCookie('_gid') || 'none'
    const a = getCookie('_ga') || 'none'
    return `${r}|${y}|${g}|${a}`
  }
  const getCustomUserId1 = (): string | undefined => {
    return getCookie('id') || undefined
  }
  const getCustomUserId2 = (): string | undefined => {
    return getCookie('userId') || undefined
  }
  const getCustomUserIds = [getCustomUserId1, getCustomUserId2]

  let hasErrors = window.localStorage.getItem(HAS_NETWORK_ERROR) === 'true'

  return ({ event, enabledInfo }) => {
    const eventObj = createLegacyEventObject({
      mainDomain,
      event,
      enabledInfo,
      version,
      source,
      getCombinedUserId,
      getCustomUserIds,
      sendCustomEventsData,
      hasErrors,
      gtmIsOk: checkGtm(),
    })

    const mappedEvent = mapEvent ? mapEvent(eventObj) : eventObj
    const resultEvent = enabledInfo.isTrackingForbidden ? censorEvent(mappedEvent) : mappedEvent

    const request = new Request({ baseURL })
    request
      .post(path, {
        json: resultEvent,
      })
      .catch(error => {
        console.error(error)
        hasErrors = true
        window.localStorage.setItem(HAS_NETWORK_ERROR, 'true')
      })
  }
}
