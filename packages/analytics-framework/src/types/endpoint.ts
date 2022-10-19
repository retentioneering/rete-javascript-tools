import type { EventWithMetadata } from './event'

export type EndpointFilter = (event: EventWithMetadata) => boolean

export type EndpointGuard = {
  fraction?: {
    all: number
    domEvents?: number
    domObservers?: number
    pageStateEvents?: number
    pageviewEvents?: number
    sessionEvents?: number
    customEvents?: number
    documentVisibilityEvents?: number
  }
  filters?: EndpointFilter[]
}

export type EnabledInfo = {
  isTrackingForbidden: boolean
  force: boolean
  forceEnabledByUser: boolean
  enabledByAllEventsFraction: boolean
  enabledByDomEventsFraction: boolean
  enabledByDomObserversFraction: boolean
  enabledByPageStateEventsFraction: boolean
  enabledByPageviewEventsFraction: boolean
  enabledBySessionEventsFraction: boolean
  enabledByCustomEventsFraction: boolean
  enabledByDocumentVisibilityEventsFraction: boolean
  enabledByCurrentEventFraction: boolean
  enabledByFilters: boolean
}

type TransportParams = {
  event: EventWithMetadata
  enabledInfo: EnabledInfo
}

export type Transport = (params: TransportParams) => void

export type Endpoint = {
  name: string
  guard: EndpointGuard
  transport: Transport
}
