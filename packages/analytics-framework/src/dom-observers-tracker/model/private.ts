import type { ParseDomResult } from '@retentioneering/retentioneering-dom-observer'

import { root } from '~/effector-root'
import type { DomObserverConfig, DomObserverEvent } from '~/types'

const d = root.domain()

export type DomCollectedPayload = {
  name: string
  parseResult: ParseDomResult
}

type LastResults = {
  [key: string]: string
}

export type CaptureEventParams = {
  configs: DomObserverConfig[]
  lastResults: LastResults
  domCollectedPayload: DomCollectedPayload
}

export type CaptureEventResult = {
  config: DomObserverConfig
  duplicate: boolean
  url: string
  event: DomObserverEvent
  serializedResult: string
  parseResult: ParseDomResult
}

export const $configs = d.store<DomObserverConfig[]>([])
export const $lastResults = d.store<LastResults>({})
export const onDomCollected = d.event<DomCollectedPayload>()
export const captureEventFx = d.effect<CaptureEventParams, CaptureEventResult, Error>()
