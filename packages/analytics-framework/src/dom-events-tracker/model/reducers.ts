import type { DomEventConfigCollection, DomEventsTrackerConfig } from '~/types'

import type { AddEventConfigParams } from './public'

// TODO: иммутабельная каша, переписать когда нибудь
const addEventConfigToStart = (
  config: DomEventsTrackerConfig | null,
  { collectionName, eventConfig }: AddEventConfigParams,
) => {
  if (!config) {
    return config
  }
  config.collections = config.collections.map(collection => {
    if (collection.name !== collectionName) {
      return collection
    }
    collection.events = [eventConfig, ...collection.events]
    return collection
  })
  return { ...config }
}

const addEventConfigToEnd = (
  config: DomEventsTrackerConfig | null,
  { collectionName, eventConfig }: AddEventConfigParams,
) => {
  if (!config) {
    return config
  }
  config.collections = config.collections.map(collection => {
    if (collection.name !== collectionName) {
      return collection
    }
    collection.events = [...collection.events, eventConfig]
    return collection
  })
  return { ...config }
}

const addCollectionToStart = (config: DomEventsTrackerConfig | null, collection: DomEventConfigCollection) => {
  if (!config) {
    return config
  }
  config.collections = [collection, ...config.collections]
  return { ...config }
}

const addCollectionToEnd = (config: DomEventsTrackerConfig | null, collection: DomEventConfigCollection) => {
  if (!config) {
    return config
  }
  config.collections = [...config.collections, collection]
  return { ...config }
}

export const reducers = {
  addEventConfigToEnd,
  addEventConfigToStart,
  addCollectionToStart,
  addCollectionToEnd,
}
