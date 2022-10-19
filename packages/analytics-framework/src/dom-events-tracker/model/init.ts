import { forward, guard, sample } from 'effector'

import type { DomEventsTrackerConfig } from '~/types'

import { $domEventsTrackerConfig, captureEventFx } from './private'
import {
  addCollectionToEnd,
  addCollectionToStart,
  addEventConfigToEnd,
  addEventConfigToStart,
  captureEvent,
  domEventCaptured,
  resetDomEventsTrackerConfig,
  setDomEventsTrackerConfig,
} from './public'
import { reducers } from './reducers'
import { createDomEvent, matchEventConfig } from './utils'

$domEventsTrackerConfig
  .on(setDomEventsTrackerConfig, (_, config) => {
    return config
  })
  .on(addEventConfigToStart, reducers.addEventConfigToStart)
  .on(addEventConfigToEnd, reducers.addEventConfigToEnd)
  .on(addCollectionToStart, reducers.addCollectionToStart)
  .on(addCollectionToEnd, reducers.addCollectionToEnd)
  .reset(resetDomEventsTrackerConfig)

guard({
  source: sample({
    source: $domEventsTrackerConfig,
    clock: captureEvent,
    fn: (config, { event, root }) => {
      return {
        config: config as DomEventsTrackerConfig,
        event,
        root,
      }
    },
  }),
  filter: ({ config }) => config !== null,
  target: captureEventFx,
})

forward({
  from: captureEventFx.doneData,
  to: domEventCaptured,
})

captureEventFx.use(({ event, root, config }) => {
  const matchedCollections = config.collections.filter(({ rootSelector = 'body' }) => {
    return root.matches(rootSelector)
  })

  for (const collection of matchedCollections) {
    const matchedConfig = matchEventConfig({
      event,
      collection,
    })
    if (matchedConfig) {
      return createDomEvent({
        event,
        collection,
        eventConfig: matchedConfig,
      })
    }
  }

  throw new Error('event config not found!')
})
