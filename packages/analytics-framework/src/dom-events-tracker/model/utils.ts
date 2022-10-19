import { parseDOM } from '@retentioneering/retentioneering-dom-observer'

import { getConstructorChain } from '~/lib/constructor-chain'
import { getCssClassPath, getDomPath } from '~/lib/dom-path'
import { md5 } from '~/lib/md5'
import { isElement, isHTMLElement, isHTMLInputElement } from '~/lib/predicate'
import { testFilter } from '~/lib/string-filter'
import type { DomEvent, DomEventConfig, DomEventConfigCollection, SendValueOption, SupportedEvent } from '~/types'

export const extractTextContent = (eventTarget: EventTarget | null) => {
  if (!eventTarget) {
    return null
  }

  // TODO: Fix?
  // noinspection SuspiciousTypeOfGuard
  if (typeof (eventTarget as HTMLElement).textContent === 'string') {
    return (eventTarget as HTMLElement).textContent
  }

  return null
}

type IsMatchedParams = {
  event: SupportedEvent
  eventConfig: DomEventConfig
}

export const isMatched = ({ event, eventConfig }: IsMatchedParams) => {
  const textContent = extractTextContent(event.target)
  const { pageFilter, textContentFilter, selector, exclude } = eventConfig

  if (eventConfig.eventType && event.type !== eventConfig.eventType) {
    return false
  }

  if (!eventConfig.eventType && event.type !== 'click') {
    return false
  }

  if (!testFilter(window.location.href, pageFilter)) {
    return false
  }

  if (textContent && !testFilter(textContent.toLowerCase(), textContentFilter)) {
    return false
  }

  if (!isElement(event.target, true)) {
    return false
  }

  const eventTarget = event.target as Element
  if (exclude && eventTarget.matches(exclude)) {
    return false
  }

  return Boolean(eventTarget.closest(selector))
}

type MatchEventConfigParams = {
  event: SupportedEvent
  collection: DomEventConfigCollection
}

export const matchEventConfig = ({ event, collection }: MatchEventConfigParams) => {
  for (const eventConfig of collection.events) {
    if (isMatched({ event, eventConfig })) {
      return eventConfig
    }
  }

  return null
}

type GetEventNameParams = {
  event: SupportedEvent
  eventConfig: DomEventConfig
}

export const getEventName = ({ event, eventConfig }: GetEventNameParams): string => {
  if (eventConfig.name) {
    return eventConfig.name
  }

  const eventTarget = event.target

  const name = isHTMLInputElement(eventTarget, true)
    ? (eventTarget as HTMLInputElement).type
    : eventConfig.selector.replace(/[^a-zA-Z_-]/g, '')

  return `${name}_${event.type || eventConfig.eventType || 'click'}`
}

type GetDomInfoParams = {
  domInfoConfig: DomEventConfig['domInfo']
  targetElement: Element
}

const getDomInfo = ({ domInfoConfig, targetElement }: GetDomInfoParams) => {
  if (!domInfoConfig) {
    return
  }

  const rootElement: HTMLElement | null = domInfoConfig.closestSelector
    ? targetElement.closest(domInfoConfig.closestSelector)
    : document.body

  if (!rootElement) {
    return null
  }

  if (!isHTMLElement(rootElement, true)) {
    return null
  }

  return parseDOM(domInfoConfig.parseConfig, rootElement)
}

enum ElementType {
  LINK = 'link',
  BUTTON = 'button',
  TEXT = 'text',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  NUMBER = 'number',
  SELECT = 'select',
  FORM = 'form',
  OTHER = 'other',
}

export const getElementType = (element: Element): ElementType => {
  if (element.tagName === 'A') {
    return ElementType.LINK
  }
  if (element.tagName === 'BUTTON') {
    return ElementType.BUTTON
  }
  if (element.tagName === 'SELECT') {
    return ElementType.SELECT
  }
  if (element.tagName === 'FORM') {
    return ElementType.FORM
  }
  if (element.tagName === 'TEXTAREA') {
    return ElementType.TEXT
  }

  const isInputElement = getConstructorChain(element).includes('HTMLInputElement')

  if (isInputElement) {
    if ((element as HTMLInputElement).type === 'checkbox') {
      return ElementType.CHECKBOX
    }
    if ((element as HTMLInputElement).type === 'radio') {
      return ElementType.RADIO
    }
    if ((element as HTMLInputElement).type === 'number') {
      return ElementType.NUMBER
    }
    return ElementType.TEXT
  }
  return ElementType.OTHER
}

type GetEventValueParams = {
  element: Element
  eventConfig: DomEventConfig
  sendValue?: SendValueOption
}

export const getEventValue = ({ element, sendValue }: GetEventValueParams) => {
  const elementType = getElementType(element)
  let eventValue: string

  if (sendValue === 'none') {
    return ''
  }

  switch (elementType) {
    case ElementType.TEXT:
    case ElementType.NUMBER:
    case ElementType.SELECT: {
      eventValue = (element as HTMLInputElement).value
      break
    }

    // TODO: Очень не универсальная логика, разобраться
    case ElementType.CHECKBOX:
    case ElementType.RADIO: {
      const parent = element.parentElement
      const parentText = parent ? parent.textContent : null
      const value = (element as HTMLInputElement).checked ? 'on' : 'off'

      eventValue = parentText ? `${value}:${parentText.trim()}` : value
      break
    }
    default: {
      eventValue = (element as HTMLElement).textContent || ''
    }
  }

  return sendValue === 'hashOfValue' ? md5(eventValue) : eventValue
}

const getNextLocation = (element: Element) => {
  const elementType = getElementType(element)

  if (elementType === ElementType.LINK) {
    return (element as HTMLAnchorElement).href
  }

  if (elementType === ElementType.FORM) {
    return (element as HTMLFormElement).action
  }

  return undefined
}

type GetEventCustomNameParams = {
  element: Element
  eventConfig: DomEventConfig
}

export const getEventCustomName = ({ element, eventConfig }: GetEventCustomNameParams) => {
  const dataset = isHTMLElement(element, true) ? (element as HTMLElement).dataset : null

  return dataset && dataset.reteEventCustomName ? dataset.reteEventCustomName : eventConfig.eventCustomName
}

type CreateDomEventParams = {
  event: SupportedEvent
  eventConfig: DomEventConfig
  collection: DomEventConfigCollection
}

export const createDomEvent = ({ event, eventConfig, collection }: CreateDomEventParams): DomEvent => {
  const sendValue = eventConfig.sendValue || collection.sendValue

  const element = event.target as HTMLElement

  const eventName = getEventName({ event, eventConfig })
  const eventCustomName = getEventCustomName({ element, eventConfig })
  const eventValue = getEventValue({
    element,
    sendValue,
    eventConfig,
  })
  const eventTrigger = getDomPath(element)
  const extensiveEventTrigger = getCssClassPath(element)
  const nextLocation = getNextLocation(element)

  const domInfo = getDomInfo({
    domInfoConfig: eventConfig.domInfo,
    targetElement: element,
  })

  return {
    type: 'dom-event',
    name: eventName,
    data: {
      eventName,
      eventCustomName,
      nextLocation,
      eventValue,
      eventTrigger,
      extensiveEventTrigger,
      eventConfig,
      domInfo,
    },
    endpointsOptions: eventConfig.endpointOptions,
  }
}
