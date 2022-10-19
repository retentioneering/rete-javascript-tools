import type { Effect, Store } from 'effector'

type WaitOnceEventParams = {
  element: HTMLElement
  eventType: string
  useCapture?: boolean
  onListenerAdded?: () => void
}

export const waitOnceEvent = ({
  element,
  eventType,
  useCapture,
  onListenerAdded,
}: WaitOnceEventParams): Promise<Event> => {
  return new Promise(resolve => {
    const listener = (e: Event) => {
      resolve(e)
      element.removeEventListener(eventType, listener)
    }
    element.addEventListener(eventType, listener, useCapture)
    if (onListenerAdded) {
      onListenerAdded()
    }
  })
}

export const createInput = (type: string) => {
  const input = document.createElement('input')
  input.type = type
  return input
}

export interface EffectsMapper extends Map<any, any> {
  set<P, D, E>(effect: Effect<P, D, E>, handler: (params: P) => D | Promise<D>): this
}

export const mockEffects = (map?: Map<any, any>): EffectsMapper => {
  return map || new Map()
}

interface StoreMapper extends Map<any, any> {
  set<V>(store: Store<V>, value: V): this
}

export const mockStores = (map?: Map<any, any>): StoreMapper => {
  return map || new Map()
}
