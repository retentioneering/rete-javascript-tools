import { attach, forward, guard, sample } from 'effector'

import { readItemFx, writeItemFx } from '~/cookie-storage'
import { root } from '~/effector-root'
import { eventWithMetadataReceived } from '~/event-metadata'
import { checkFraction } from '~/lib/user-id'
import type { EnabledInfo, Endpoint, EndpointGuard, EventWithMetadata, UserId } from '~/types'
import { $isTrackingForbidden, $userId } from '~/user'

type CreateKeyParams = {
  userId: UserId
  endpointName: string
}

export const createEnabledForUserKey = ({ userId, endpointName }: CreateKeyParams) => {
  return `force_enabled_endpoint_${endpointName}_for_user_${userId}`
}

type CheckEndpointForceEnabledForUserParams = {
  event: EventWithMetadata
  userId: UserId
}

type CheckEndpointEnabledParams = {
  isTrackingForbidden: boolean
  forceEnabledUsers: UserId[]
  event: EventWithMetadata
  userId: UserId
  endpointName: string
  endpointGuard: EndpointGuard
}

const checkEndpointEnabled = (params: CheckEndpointEnabledParams): EnabledInfo => {
  const { isTrackingForbidden, forceEnabledUsers, event, userId, endpointName, endpointGuard } = params

  let enabledByAllEventsFraction
  let enabledByDomEventsFraction = false
  let enabledByDomObserversFraction = false
  let enabledByCurrentEventFraction = false
  let enabledByPageStateEventsFraction = false
  let enabledByCustomEventsFraction = false
  let enabledByPageviewEventsFraction = false
  let enabledBySessionEventsFraction = false
  let enabledByDocumentVisibilityEventsFraction = false
  let enabledByFilters

  if (endpointGuard.filters && endpointGuard.filters.length) {
    enabledByFilters = endpointGuard.filters.every(filter => filter(event))
  } else {
    enabledByFilters = true
  }

  if (endpointGuard.fraction) {
    enabledByAllEventsFraction = checkFraction(userId, endpointGuard.fraction.all)
  } else {
    enabledByAllEventsFraction = true
  }
  if (event.type === 'dom-event' && endpointGuard.fraction?.domEvents) {
    enabledByDomEventsFraction = checkFraction(userId, endpointGuard.fraction.domEvents)
  }

  if (event.type === 'dom-observer' && endpointGuard.fraction?.domObservers) {
    enabledByDomObserversFraction = checkFraction(userId, endpointGuard.fraction.domObservers)
  }

  if (event.type === 'document-visibility' && endpointGuard.fraction?.documentVisibilityEvents) {
    // eslint-disable-next-line max-len
    enabledByDocumentVisibilityEventsFraction = checkFraction(userId, endpointGuard.fraction.documentVisibilityEvents)
  }

  if (event.type === 'page-state' && endpointGuard.fraction?.pageStateEvents) {
    enabledByPageStateEventsFraction = checkFraction(userId, endpointGuard.fraction?.pageStateEvents)
  }

  if (event.type === 'custom-event' && endpointGuard.fraction?.customEvents) {
    enabledByCustomEventsFraction = checkFraction(userId, endpointGuard.fraction?.customEvents)
  }

  if (event.type === 'pageview' && endpointGuard.fraction?.pageviewEvents) {
    enabledByPageviewEventsFraction = checkFraction(userId, endpointGuard.fraction?.pageviewEvents)
  }

  if (event.type === 'session-event' && endpointGuard.fraction?.sessionEvents) {
    enabledBySessionEventsFraction = checkFraction(userId, endpointGuard.fraction?.sessionEvents)
  }

  const endpointOptions = event.endpointsOptions?.find(({ name }) => {
    return name === endpointName
  })

  if (endpointOptions && endpointOptions.fraction) {
    enabledByCurrentEventFraction = checkFraction(userId, endpointOptions.fraction)
  }

  return {
    force: Boolean(endpointOptions?.force),
    forceEnabledByUser: forceEnabledUsers.includes(userId),
    isTrackingForbidden,
    enabledByAllEventsFraction,
    enabledByDomEventsFraction,
    enabledByDomObserversFraction,
    enabledByPageStateEventsFraction,
    enabledByPageviewEventsFraction,
    enabledBySessionEventsFraction,
    enabledByCustomEventsFraction,
    enabledByCurrentEventFraction,
    enabledByDocumentVisibilityEventsFraction,
    enabledByFilters,
  }
}

export const createEndpoint = (endpoint: Endpoint) => {
  const { name, guard: endpointGuard, transport } = endpoint

  const d = root.domain()
  const $forceEnabledUsers = d.store<UserId[]>([])

  const forceEnableForUser = d.event<UserId>()

  const forceEnableForUserFx = attach({
    effect: writeItemFx,
    mapParams: (userId: UserId) => ({
      key: createEnabledForUserKey({ userId, endpointName: name }),
      value: '1',
    }),
  })

  const isEndpointForceEnabledForUserFx = attach({
    effect: readItemFx,
    mapParams: ({ userId }: CheckEndpointForceEnabledForUserParams) => ({
      key: createEnabledForUserKey({ userId, endpointName: name }),
    }),
  })

  const sendEventFx = d.effect({
    handler: transport,
  })

  $forceEnabledUsers
    .on(forceEnableForUser, (enabledUsers, userId) => {
      if (enabledUsers.includes(userId)) {
        return enabledUsers
      }
      return [...enabledUsers, userId]
    })
    .on(isEndpointForceEnabledForUserFx.done, (enabledUsers, { params, result }) => {
      if (result.value === null) {
        return enabledUsers
      }
      if (enabledUsers.includes(params.userId)) {
        return enabledUsers
      }
      return [...enabledUsers, params.userId]
    })

  forward({
    from: forceEnableForUser,
    to: forceEnableForUserFx,
  })

  sample({
    source: $userId,
    clock: eventWithMetadataReceived,
    fn: (userId, event) => ({ userId, event }),
    target: isEndpointForceEnabledForUserFx,
  })

  const checkEndpoint = sample({
    clock: isEndpointForceEnabledForUserFx.done,
    source: {
      forceEnabledUsers: $forceEnabledUsers,
      isTrackingForbidden: $isTrackingForbidden,
    },
    fn: ({ forceEnabledUsers, isTrackingForbidden }, { params }) => ({
      forceEnabledUsers,
      event: params.event,
      userId: params.userId,
      enabledInfo: checkEndpointEnabled({
        isTrackingForbidden,
        forceEnabledUsers,
        endpointGuard,
        endpointName: name,
        event: params.event,
        userId: params.userId,
      }),
    }),
  })

  guard({
    source: checkEndpoint,
    filter: ({ enabledInfo }) => {
      if (enabledInfo.force) {
        return true
      }

      return (
        !enabledInfo.isTrackingForbidden &&
        enabledInfo.enabledByFilters &&
        (enabledInfo.forceEnabledByUser ||
          enabledInfo.enabledByAllEventsFraction ||
          enabledInfo.enabledByDomEventsFraction ||
          enabledInfo.enabledByDomObserversFraction ||
          enabledInfo.enabledByPageStateEventsFraction ||
          enabledInfo.enabledByPageviewEventsFraction ||
          enabledInfo.enabledByCustomEventsFraction ||
          enabledInfo.enabledBySessionEventsFraction ||
          enabledInfo.enabledByCurrentEventFraction ||
          enabledInfo.enabledByDocumentVisibilityEventsFraction)
      )
    },
    target: sendEventFx,
  })

  return {
    $forceEnabledUsers,
    forceEnableForUser,
  }
}
