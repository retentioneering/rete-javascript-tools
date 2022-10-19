import type { ArrayElement } from '~/lib/type-helpers'
import type { SupportedEvent } from '~/types'

export type SupportedEventType = ArrayElement<
  [
    'resize',
    'focusin',
    'focusout',
    'click',
    'dblclick',
    'mousedown',
    'mouseup',
    'paste',
    // 'mouseover',
    // 'mouseout',
    // 'mousemove',
    'keydown',
    'keypress',
    'keyup',
    'submit',
    'change',
    'input',
  ]
>

export const EVENTS_TYPES: SupportedEventType[] = [
  'resize',
  'focusin',
  'focusout',
  'click',
  'dblclick',
  'mousedown',
  'mouseup',
  'paste',
  // 'mouseover',
  // 'mouseout',
  // 'mousemove',
  'keydown',
  'keypress',
  'keyup',
  'submit',
  'change',
  'input',
]

type EventHandler = (e: SupportedEvent) => void

type Listener = {
  eventType: SupportedEventType
  handler: EventHandler
}

type ListeningElement = {
  element: Element
  listeners: Listener[]
}

type CbPayload = {
  event: SupportedEvent
  root: Element
}

type Params = {
  onEvent: (paylod: CbPayload) => void
}

export const createListenersManager = ({ onEvent }: Params) => {
  let listeningElements: ListeningElement[] = []

  const listen = (element: Element) => {
    const existing = listeningElements.find(found => found.element === element)
    // already listen
    if (existing) {
      return
    }

    const listeningElement: ListeningElement = {
      element,
      listeners: [],
    }

    for (const EVENT_TYPE of EVENTS_TYPES) {
      const handler: EventHandler = event => {
        onEvent({ root: element, event })
      }
      element.addEventListener(EVENT_TYPE, handler, true)
      listeningElement.listeners.push({
        eventType: EVENT_TYPE,
        handler,
      })
    }

    listeningElements.push(listeningElement)
  }

  const listenMany = (elements: Element[]) => {
    for (const element of elements) {
      listen(element)
    }
  }

  const stopListening = (element: Element) => {
    const existing = listeningElements.find(found => found.element === element)
    if (!existing) {
      return
    }

    for (const listener of existing.listeners) {
      element.removeEventListener(listener.eventType, listener.handler, {
        capture: true,
      })
    }
    listeningElements = listeningElements.filter(found => found.element !== element)
  }

  return {
    listen,
    listenMany,
    stopListening,
  }
}
