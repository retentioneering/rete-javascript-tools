import { forward, guard } from 'effector'

import { initCookieStorage } from '~/cookie-storage'
import { dispatchCustomEvent } from '~/custom-events'
import { startTracking as startDocumentVisibilityTracking } from '~/document-visibility-tracker'
import { startTracking as startDomTracking } from '~/dom-events-tracker'
import { startTracking as startDomObserversTracking } from '~/dom-observers-tracker'
import { initMetadata, metadataReady } from '~/event-metadata'
import * as listen from '~/lib/page-state'
import { trackMarketingSession } from '~/marketing-session'
import { DEFAULT_IS_MARKETING_SESSION_ENABLED } from '~/marketing-session/contracts'
import { startTracking as startPagestateTracking } from '~/page-state-tracker'
import type { PageviewGuard } from '~/pageview-tracker'
import { startTracking as startPageviewTracking } from '~/pageview-tracker'
import type { ThirdPartyCookieStorageParams } from '~/third-party-cookie-storage'
import { initThirdPartyCookieStorage } from '~/third-party-cookie-storage'
import { trackerInit } from '~/tracker-lifecircle'
import type { DomEventConfigCollection, DomObserverConfig, Endpoint } from '~/types'
import { initUser, userReady } from '~/user'
import { $newUser } from '~/user'

import { connectDatalayer } from './connect-datalayer'
import { createEndpoint } from './endpoint'
import { migrateLegacyData } from './migrate-legacy-data'

export type Config = {
  pageviewGuard?: PageviewGuard
  cookieDomain?: string
  ignoreSessionDomainsList?: string[]
  isMarketingSessionEnabled?: boolean
  yaCounter?: number
  domEvents?: {
    rootElement?: Element
    config: {
      collections: DomEventConfigCollection[]
    }
  }
  domObservers?: {
    rootEl?: Element
    configs: DomObserverConfig[]
  }
  endpoints?: Endpoint[]
  userIdProvider?: () => string | Promise<string>
  thirdPartyCookieStorage?: ThirdPartyCookieStorageParams
}

const defaultDomEventsCollection: DomEventConfigCollection = {
  name: 'defaultCollection',
  rootSelector: 'body',
  sendValue: 'hashOfValue',
  events: [
    {
      selector: 'button',
      sendValue: 'plainValue',
    },
    {
      selector: 'a',
      name: 'link_click',
      sendValue: 'plainValue',
    },
    {
      selector: 'a',
      name: 'link_rightclick',
      eventType: 'contextmenu',
      sendValue: 'plainValue',
    },
    {
      selector: 'input',
      sendValue: 'hashOfValue',
    },
    {
      selector: 'input',
      eventType: 'change',
      sendValue: 'hashOfValue',
    },
    {
      selector: 'textarea',
      sendValue: 'hashOfValue',
    },
    {
      selector: 'textarea',
      eventType: 'change',
      sendValue: 'hashOfValue',
    },
    {
      selector: 'select',
      sendValue: 'plainValue',
    },
    {
      selector: 'select',
      eventType: 'change',
      sendValue: 'plainValue',
    },
    {
      selector: 'form',
      eventType: 'submit',
      sendValue: 'plainValue',
    },
    {
      selector: '*',
      eventType: 'click',
      name: 'something_clicked',
      eventCustomName: 'something_clicked',
      sendValue: 'plainValue',
    },
  ],
}

const dispatchTrackerCreatedEvent = dispatchCustomEvent.prepend(() => ({
  type: 'custom-event',
  name: 'tracker_created',
  data: {},
}))

const dispatchNewUserEvent = dispatchCustomEvent.prepend(() => ({
  type: 'custom-event',
  name: 'new_user',
  data: {},
}))

guard({
  clock: dispatchTrackerCreatedEvent,
  filter: $newUser,
  target: dispatchNewUserEvent,
})

export type DomainSpecificConfig = {
  domain: string
  config: Config
}

type ResolveDomainParams = {
  defaultConfig: Config
  configMap: DomainSpecificConfig[]
}

export const resolveConfig = ({ configMap, defaultConfig }: ResolveDomainParams) => {
  const currDomain = window.location.hostname
  const checkSubDomain = (curr: string, target: string) => {
    return curr.includes(target) && curr.indexOf(target) === curr.length - target.length
  }

  for (const { domain, config } of configMap) {
    if (domain[0] === '.' && checkSubDomain(currDomain, domain)) {
      return config
    }

    if (domain[0] !== '.' && currDomain === domain) {
      return config
    }
  }

  return defaultConfig
}

const initializeUser = async (userIdProvider?: Config['userIdProvider']): Promise<void> => {
  let isUserInitialized = false

  if (userIdProvider) {
    try {
      initUser(await userIdProvider())
      isUserInitialized = true
    } catch (error) {
      console.error(error)
    }
  }

  if (!isUserInitialized) {
    initUser()
  }
}

export const start = async ({
  cookieDomain = window.location.hostname,
  isMarketingSessionEnabled = DEFAULT_IS_MARKETING_SESSION_ENABLED,
  ignoreSessionDomainsList = [],
  pageviewGuard,
  domObservers,
  yaCounter,
  endpoints = [],
  domEvents = { config: { collections: [] } },
  thirdPartyCookieStorage,
  userIdProvider,
}: Config) => {
  metadataReady.watch(async () => {
    if (isMarketingSessionEnabled) {
      await trackMarketingSession(cookieDomain, ignoreSessionDomainsList)
    }

    dispatchTrackerCreatedEvent()

    startPagestateTracking()

    startPageviewTracking({ guard: pageviewGuard })

    startDocumentVisibilityTracking()

    listen.onDomContentLoaded(() => {
      startDomTracking(domEvents)
      if (domObservers) {
        startDomObserversTracking(domObservers)
      }
      trackerInit()
    })
  })

  // TODO: временное быстрое решение, абстрагировать в будущем
  if (yaCounter) {
    userReady.watch(reuser => {
      const yacid = `yaCounter${yaCounter}`
      const win: any = window
      if (win[yacid]) {
        win[yacid].params({ reuser })
      }
    })
  }

  for (const endpoint of endpoints) {
    createEndpoint(endpoint)
  }

  domEvents.config.collections = [...domEvents.config.collections, defaultDomEventsCollection]

  forward({
    from: userReady,
    to: initMetadata,
  })

  if (thirdPartyCookieStorage) {
    initThirdPartyCookieStorage(thirdPartyCookieStorage)
  }

  initCookieStorage({ cookieDomain })

  // TODO: Delete me
  await migrateLegacyData()

  await initializeUser(userIdProvider)

  connectDatalayer()
}
