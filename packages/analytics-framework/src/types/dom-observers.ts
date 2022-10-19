import type { DomCollectorTarget, ParseDomResult } from '@retentioneering/retentioneering-dom-observer'

import type { StringFilter } from '~/lib/string-filter'

import type { BaseEvent, EndpointOptions } from './base'

export type DomObserverConfig = {
  params?: {
    doNotSendEmptyResults?: boolean
    pageFilter?: StringFilter
    disableDuplicateChecking?: boolean
    throttle?: number
    throttleParams?: {
      trailing?: boolean
      leading?: boolean
    }
  }
  config: DomCollectorTarget
  endpointOptions?: EndpointOptions<DomObserverEvent>[]
}

export type DomObserverEventData = ParseDomResult

export type DomObserverEvent = BaseEvent<'dom-observer', DomObserverEventData>
