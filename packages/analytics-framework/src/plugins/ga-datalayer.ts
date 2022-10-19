import { createDomain } from 'effector'

declare global {
  interface Window {
    dataLayer?: any[]
  }
}

export type GaDatalayerEvent = {
  event: string
  [key: string]: any
}

export const gaDataLayerDomain = createDomain()

export const onGaDataLayerEvent = gaDataLayerDomain.event<any>()

type GaDataLayerParams = {
  checkIntervalMs?: number
}

export const listenGaDatalayer = ({ checkIntervalMs = 1000 }: GaDataLayerParams = {}) => {
  const handledEvents: any[] = []

  const alreadyHandled = (event: any) => {
    for (const handledEvent of handledEvents) {
      if (handledEvent === event) {
        return true
      }
    }

    return false
  }

  const checkDataLayer = () => {
    // TODO: Зачем проверять тип `window.dataLayer.length`?
    // noinspection SuspiciousTypeOfGuard
    if (window.dataLayer && typeof window.dataLayer.length === 'number') {
      for (const event of window.dataLayer) {
        if (alreadyHandled(event)) {
          continue
        }
        handledEvents.push(event)
        onGaDataLayerEvent(event)
      }
    }
    setTimeout(() => checkDataLayer(), checkIntervalMs)
  }

  checkDataLayer()
}

export const pushEventToGaDatalayerFx = gaDataLayerDomain.effect((event: GaDatalayerEvent) => {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(event)
})
