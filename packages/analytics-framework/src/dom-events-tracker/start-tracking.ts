import type { DomEventConfig, DomEventConfigCollection, DomEventsTrackerConfig } from '~/types'

import { createListenersManager } from './listeners-manager'
import {
  addCollectionToEnd,
  addCollectionToStart,
  addEventConfigToEnd,
  addEventConfigToStart,
  captureEvent,
  setDomEventsTrackerConfig,
} from './model/public'

type GetCollectionsRootsParams = {
  rootElement: Element | Document
  collections: DomEventConfigCollection[]
}

const getCollectionsRoots = ({ rootElement, collections }: GetCollectionsRootsParams) => {
  const roots: Element[] = []

  for (const { rootSelector } of collections) {
    const collecitonRoot = rootElement.querySelector(rootSelector || 'body')
    if (!collecitonRoot) {
      continue
    }
    roots.push(collecitonRoot)
  }

  return roots
}

type AddEventConfigParams = {
  collectionName: string
  eventConfig: DomEventConfig
}

type StartTrackingParams = {
  rootElement?: Element | Document
  config: DomEventsTrackerConfig
}

export const startTracking = ({ config, rootElement = document }: StartTrackingParams) => {
  setDomEventsTrackerConfig(config)

  const listenertsManager = createListenersManager({
    onEvent: ({ event, root }) => {
      captureEvent({ event, root })
    },
  })

  const collectionsRoots = getCollectionsRoots({
    rootElement,
    collections: config.collections,
  })

  listenertsManager.listenMany(collectionsRoots)

  return {
    addCollectionToStart: (collection: DomEventConfigCollection) => {
      const root = rootElement.querySelector(collection.rootSelector || 'body')
      if (root) {
        listenertsManager.listen(root)
        addCollectionToStart(collection)
      }
    },
    addCollectionToEnd: (collection: DomEventConfigCollection) => {
      const root = rootElement.querySelector(collection.rootSelector || 'body')
      if (root) {
        listenertsManager.listen(root)
        addCollectionToEnd(collection)
      }
    },
    addEventConfigToStart: (payload: AddEventConfigParams) => {
      addEventConfigToStart(payload)
    },
    addEventConfigToEnd: (payload: AddEventConfigParams) => {
      addEventConfigToEnd(payload)
    },
  }
}
