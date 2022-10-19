import { getDatalayer } from '@retentioneering/datalayer'
import { forward, fromObservable } from 'effector'

import type { CustomEvent } from '~/types'

import { dispatchCustomEvent } from './custom-events'
import * as legacy from './legacy-datalayer'

const stream = getDatalayer().createStream({ emitInitial: true })

export const onDatalayerEvent = fromObservable<CustomEvent>(stream)

forward({
  from: onDatalayerEvent,
  to: dispatchCustomEvent,
})

// TODO: удалить когда убедимся что нигде не используется
const connectLegacy = (): void => {
  const reteDatalayer = legacy.getReteDataLayer()

  const unhandledEvents = reteDatalayer.getUnhandledEvents()

  for (const event of unhandledEvents) {
    dispatchCustomEvent(event)
  }

  reteDatalayer.registerGlobalHandler(e => dispatchCustomEvent(e))

  reteDatalayer.clearUnhandledEvents()
}

// TODO: WIP
export const connectDatalayer = (): void => connectLegacy()
