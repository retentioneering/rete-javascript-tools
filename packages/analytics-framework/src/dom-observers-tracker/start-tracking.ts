import { createDomCollector } from '@retentioneering/retentioneering-dom-observer'
import type { Event } from 'effector'
import throttle from 'just-throttle'

import type { DomObserverConfig } from '~/types'

import type { DomCollectedPayload } from './model/private'
import { onDomCollected } from './model/private'
import { initDomObservers } from './model/public'

export type StartTrackingConfig = {
  rootEl?: Element
  configs: DomObserverConfig[]
}

type Worker = {
  name: string
  event: Event<DomCollectedPayload>
}

export const startTracking = ({ rootEl, configs }: StartTrackingConfig) => {
  initDomObservers(configs)

  const getThrottleParams = (params: DomObserverConfig['params']) => {
    if (params?.throttleParams) {
      return params.throttleParams
    }
    return { leading: true }
  }

  // TODO: рабочее временное решение
  const workers: Worker[] = configs.map(({ config, params }) => ({
    name: config.name,
    event:
      params && params.throttle
        ? // TODO: Use `throttle` from `effector/patronum`
          //  @see https://patronum.effector.dev/methods/throttle/
          throttle(onDomCollected, params.throttle, getThrottleParams(params))
        : onDomCollected,
  }))

  createDomCollector({
    targets: configs.map(({ config }) => config),
    rootEl: rootEl || document.body,
    onCollect: ({ name, parsedContent }) => {
      const worker = workers.find(w => w.name === name)
      if (worker) {
        worker.event({ name, parseResult: parsedContent })
      }
    },
  })
}
