import type { Event } from 'effector'
import { combine, forward, merge, sample } from 'effector'

import { dispatchCustomEvent } from '~/custom-events'
import { eventCaptured as documentVisibilityEventCaptured } from '~/document-visibility-tracker'
import { domEventCaptured } from '~/dom-events-tracker'
import { eventCaptured as domObserverEventCaptured } from '~/dom-observers-tracker'
import { $marketingSessionId, dispatchSessionEvent } from '~/marketing-session/model/public'
import { eventCaptured as pageStateEventCaptured } from '~/page-state-tracker'
import { eventCaptured as pageViewEventCaptured } from '~/pageview-tracker'
import type { AnyEvent, WindowMetadata } from '~/types'
import { $userId } from '~/user'

import type { GetWindowMetadataResult } from './private'
import { $windowEventIndex, $windowId, getWindowMetadataFx, incUserEventIndexFx } from './private'
import { eventWithMetadataReceived, initMetadata, metadataReady, resetMetadata } from './public'

const eventCaptured: Event<AnyEvent> = merge([
  domEventCaptured,
  domObserverEventCaptured,
  pageStateEventCaptured,
  dispatchCustomEvent,
  dispatchSessionEvent,
  pageViewEventCaptured,
  documentVisibilityEventCaptured,
])

const parseIndex = (value: string | null) => {
  if (value === null) {
    return 0
  }

  const intVal = parseInt(value)

  if (isNaN(intVal)) {
    return 0
  }

  return intVal
}

$windowEventIndex.on(eventCaptured, currIndex => currIndex + 1).reset(resetMetadata)

$windowId.reset(resetMetadata)

// read initial index
// TODO: избавиться от ненужного эвента
forward({
  from: initMetadata,
  to: metadataReady,
})

// update index on event
forward({
  from: eventCaptured.map(event => ({ event })),
  to: incUserEventIndexFx,
})

sample({
  source: $marketingSessionId,
  clock: incUserEventIndexFx.done.map(({ params, result }) => ({
    event: params.event,
    userEventIndex: parseIndex(result.value),
  })),
  fn: (marketingSessionId, { event, userEventIndex }) => ({
    event,
    userEventIndex,
    ...(marketingSessionId && { marketingSessionId }),
  }),
  target: getWindowMetadataFx,
})

// Attach metadata
sample({
  source: combine({
    userId: $userId,
    windowId: $windowId,
    windowEventIndex: $windowEventIndex,
  }),
  clock: getWindowMetadataFx.doneData,
  fn: (meta, { event, userEventIndex, windowMetadata }) => ({
    ...event,
    metadata: {
      ...windowMetadata,
      ...meta,
      userEventIndex,
    },
  }),
  target: eventWithMetadataReceived,
})

getWindowMetadataFx.use(({ event, userEventIndex, marketingSessionId }): GetWindowMetadataResult => {
  const windowMetadata: WindowMetadata = {
    currentUrl: document.URL,
    userAgent: window.navigator.userAgent,
    title: document.title || '',
    ...(marketingSessionId && { marketingSessionId }),
  }

  return {
    event,
    userEventIndex,
    windowMetadata,
  }
})
