import type { ParseDomResult, ParserConfig } from '@retentioneering/retentioneering-dom-observer'

import type { StringFilter } from '~/lib/string-filter'

import type { BaseEvent, EndpointOptions } from './base'

export type SupportedEvent = Event | UIEvent | MouseEvent | KeyboardEvent

export type CssSelector = string

export type SendValueOption = 'none' | 'hashOfValue' | 'plainValue'

export type DomEventConfig = {
  name?: string
  eventCustomName?: string
  selector: CssSelector
  eventType?: string
  exclude?: CssSelector
  domInfo?: {
    closestSelector?: string
    parseConfig: ParserConfig
  }
  sendValue?: SendValueOption
  pageFilter?: StringFilter
  textContentFilter?: StringFilter
  endpointOptions?: EndpointOptions<DomEvent>[]
}

export type DomEventConfigCollection = {
  name: string
  rootSelector?: CssSelector
  sendValue?: SendValueOption
  events: DomEventConfig[]
}

export type DomEventsTrackerConfig = {
  collections: DomEventConfigCollection[]
}

export type DomEventData = {
  eventName: string
  eventCustomName?: string
  nextLocation?: string
  eventValue?: string
  eventTrigger?: string
  extensiveEventTrigger?: string
  eventConfig: DomEventConfig
  domInfo?: ParseDomResult
}

export type DomEvent = BaseEvent<'dom-event', DomEventData>
