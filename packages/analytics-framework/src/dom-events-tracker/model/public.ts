import { root } from '~/effector-root'
import type {
  DomEvent,
  DomEventConfig,
  DomEventConfigCollection,
  DomEventsTrackerConfig,
  SupportedEvent,
} from '~/types'

type CaptureEventPayload = {
  event: SupportedEvent
  root: Element
}

export type AddEventConfigParams = {
  collectionName: string
  eventConfig: DomEventConfig
}

const d = root.domain()

export const setDomEventsTrackerConfig = d.event<DomEventsTrackerConfig>()
export const resetDomEventsTrackerConfig = d.event<void>()

export const addEventConfigToStart = d.event<AddEventConfigParams>()
export const addEventConfigToEnd = d.event<AddEventConfigParams>()
export const addCollectionToStart = d.event<DomEventConfigCollection>()
export const addCollectionToEnd = d.event<DomEventConfigCollection>()

export const captureEvent = d.event<CaptureEventPayload>()
export const domEventCaptured = d.event<DomEvent>()
