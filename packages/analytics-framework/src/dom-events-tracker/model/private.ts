import { root } from '~/effector-root'
import type { DomEvent, DomEventsTrackerConfig, SupportedEvent } from '~/types'

type CaptureEventPayload = {
  event: SupportedEvent
  root: Element
  config: DomEventsTrackerConfig
}

const d = root.domain()

export const $events = d.store<DomEvent[]>([])
export const $domEventsTrackerConfig = d.store<DomEventsTrackerConfig | null>(null)
export const captureEventFx = d.effect<CaptureEventPayload, DomEvent, Error>()
