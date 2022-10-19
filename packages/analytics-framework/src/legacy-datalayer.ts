import type { CustomEvent } from './types'

type Handler = (e: CustomEvent) => void

declare global {
  interface Window {
    reteUnhandledEvents?: CustomEvent[]
    reteDatalayerEvents?: CustomEvent[]
    reteTracker?: {
      dispatchCustomEvent?: Handler
    }
  }
}

export const getReteDataLayer = () => {
  const getUnhandledEvents = () => {
    window.reteUnhandledEvents = window.reteUnhandledEvents || []
    return window.reteUnhandledEvents
  }

  const getDatalayerEvents = () => {
    window.reteDatalayerEvents = window.reteDatalayerEvents || []
    return window.reteDatalayerEvents
  }

  return {
    add: (event: CustomEvent) => {
      if (typeof window?.reteTracker?.dispatchCustomEvent === 'function') {
        if (event.type === 'custom-event') {
          window.reteTracker.dispatchCustomEvent(event)
        }
      } else {
        const unhandledEvents = getUnhandledEvents()
        unhandledEvents.push(event)
      }

      const datalayerEvents = getDatalayerEvents()
      datalayerEvents.push(event)
    },
    getEvents: () => getDatalayerEvents(),
    getUnhandledEvents: () => getUnhandledEvents(),
    clearUnhandledEvents: () => {
      window.reteUnhandledEvents = []
    },
    clear: () => {
      window.reteUnhandledEvents = []
      window.reteDatalayerEvents = []
    },
    registerGlobalHandler: (handler: Handler) => {
      window.reteTracker = window.reteTracker || {}
      window.reteTracker.dispatchCustomEvent = handler
    },
    clearGlobalHandler: () => {
      window.reteTracker = window.reteTracker || {}
      delete window.reteTracker.dispatchCustomEvent
    },
  }
}
