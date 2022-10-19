import type { BaseEvent } from '~/types'

export type MarketingSessionConfigState = {
  host: string
  hostsToIgnore: string[]
}

export type SetPersistedStateFxParams = MarketingSessionConfigState & { sessionId: string }

export type MarketingSessionEvent = BaseEvent<
  'session-event',
  {
    marketingSessionId: string
    reason: string
  }
>

export type UTM = {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  gclid?: string
  yclid?: string
  ymclid?: string
  fbclid?: string
}

export const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'gclid',
  'yclid',
  'ymclid',
  'fbclid',
] as const

export enum Reason {
  NO_UPDATES = 'no_updates',
  FIRST_SESSION = 'first_session',
  SESSION_EXPIRED = 'last_session_expired',
  UTM_CHANGED = 'utm_changed',
  REFERER_CHANGED = 'external_referrer',
}

export const CHECK_SESSION_INTERVAL = 60_000

export const LAST_EVENT_TIMESTAMP_KEY = 'rete_marketing_session_3_last_event_ts'

export const LAST_EXTERNAL_REFERRER_KEY = 'rete_marketing_session_3_last_external_referrer'

export const LAST_UTM_KEY = 'rete_marketing_session_3_last_utm'

export const SESSION_ID_KEY = 'rete-marketing-session-3-id'

export const SESSION_LIFETIME_MS = 1_800_000 // 1000 * 60 * 30

export const DEFAULT_IS_MARKETING_SESSION_ENABLED = true
