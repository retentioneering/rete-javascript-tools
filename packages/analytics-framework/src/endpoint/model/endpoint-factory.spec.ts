import '~/event-metadata/init'
import '~/cookie-storage/init'
import '~/user/init'

import type { Scope } from 'effector'
import { allSettled, fork, forward, sample } from 'effector'

import { initCookieStorage } from '~/cookie-storage'
import { mockCookies } from '~/cookie-storage/mocks'
import { domEventCaptured } from '~/dom-events-tracker'
import { root } from '~/effector-root'
import { createEndpoint } from '~/endpoint'
import { eventWithMetadataReceived, initMetadata } from '~/event-metadata'
import type { AnyEvent } from '~/types'
import { $userId, initUser } from '~/user'
import { $isTrackingForbidden, changeUserId } from '~/user'

const mockDomEvent = (): AnyEvent => ({
  type: 'dom-event',
  name: 'some-event',
  data: {
    eventName: 'some-event',
    eventConfig: {
      selector: '*',
    },
  },
})

const initModules = async (scope: Scope) => {
  await allSettled(initCookieStorage, {
    scope,
    params: {
      cookieDomain: '.example.com',
    },
  })
  await allSettled(initUser, { scope, params: undefined })
  await allSettled(initMetadata, { scope })
}

describe('endpoint factory', () => {
  test('good user id', async () => {
    const fraction = 0.7
    const goodUserId = 'ed50419d-4657-46e2-8d0e-78b8787432b9'
    const transport = jest.fn()
    const { $forceEnabledUsers } = createEndpoint({
      name: 'test',
      guard: {
        fraction: {
          all: fraction,
        },
      },
      transport,
    })

    const scope = fork(root, {
      handlers: mockCookies(),
    })

    await initModules(scope)

    await allSettled(changeUserId, {
      scope,
      params: goodUserId,
    })

    await allSettled(domEventCaptured, {
      scope,
      params: mockDomEvent(),
    })

    expect(scope.getState($forceEnabledUsers).length).toBe(0)
    expect(transport.mock.calls.length).toBe(1)
    expect(transport.mock.calls[0][0].enabledInfo).toEqual({
      force: false,
      isTrackingForbidden: false,
      forceEnabledByUser: false,
      enabledByFilters: true,
      enabledByAllEventsFraction: true,
      enabledByDomEventsFraction: false,
      enabledByDomObserversFraction: false,
      enabledByPageStateEventsFraction: false,
      enabledByPageviewEventsFraction: false,
      enabledBySessionEventsFraction: false,
      enabledByCustomEventsFraction: false,
      enabledByCurrentEventFraction: false,
      enabledByDocumentVisibilityEventsFraction: false,
    })
  })

  test('bad user id', async () => {
    const fraction = 0.7
    const badUserId = 'd1eec3f4-9226-4d4e-898a-3d4b2e84d9d3'

    const transport = jest.fn()
    const { $forceEnabledUsers } = createEndpoint({
      name: 'test',
      guard: {
        fraction: {
          all: fraction,
        },
      },
      transport,
    })

    const scope = fork(root, {
      handlers: mockCookies(),
    })

    await initModules(scope)

    await allSettled(changeUserId, {
      scope,
      params: badUserId,
    })

    await allSettled(domEventCaptured, {
      scope,
      params: mockDomEvent(),
    })
    expect(scope.getState($forceEnabledUsers).length).toBe(0)
    expect(transport.mock.calls.length).toBe(0)
  })

  test('force enable', async () => {
    const fraction = 0.7
    const badUserId = 'd1eec3f4-9226-4d4e-898a-3d4b2e84d9d3'

    const transport = jest.fn()
    const { $forceEnabledUsers, forceEnableForUser } = createEndpoint({
      name: 'test',
      guard: {
        fraction: {
          all: fraction,
        },
      },
      transport,
    })

    const scope = fork(root, {
      handlers: mockCookies(),
    })

    await initModules(scope)

    await allSettled(changeUserId, {
      scope,
      params: badUserId,
    })

    await allSettled(forceEnableForUser, {
      scope,
      params: badUserId,
    })

    await allSettled(domEventCaptured, {
      scope,
      params: mockDomEvent(),
    })

    expect(scope.getState($forceEnabledUsers).length).toBe(1)
    expect(transport.mock.calls.length).toBe(1)
    expect(transport.mock.calls[0][0].enabledInfo).toEqual({
      force: false,
      isTrackingForbidden: false,
      forceEnabledByUser: true,
      enabledByAllEventsFraction: false,
      enabledByDomEventsFraction: false,
      enabledByFilters: true,
      enabledByDomObserversFraction: false,
      enabledByPageviewEventsFraction: false,
      enabledBySessionEventsFraction: false,
      enabledByPageStateEventsFraction: false,
      enabledByCustomEventsFraction: false,
      enabledByCurrentEventFraction: false,
      enabledByDocumentVisibilityEventsFraction: false,
    })
  })

  test('force enable by event', async () => {
    const fraction = 0.7
    const badUserId = 'd1eec3f4-9226-4d4e-898a-3d4b2e84d9d3'

    const transport = jest.fn()
    const { $forceEnabledUsers, forceEnableForUser } = createEndpoint({
      name: 'test',
      guard: {
        fraction: {
          all: fraction,
        },
      },
      transport,
    })

    const unforward = forward({
      from: sample({
        source: $userId,
        clock: eventWithMetadataReceived,
      }),
      to: forceEnableForUser,
    })

    const scope = fork(root, {
      handlers: mockCookies(),
    })

    await initModules(scope)

    await allSettled(changeUserId, {
      scope,
      params: badUserId,
    })

    await allSettled(domEventCaptured, {
      scope,
      params: mockDomEvent(),
    })

    expect(scope.getState($forceEnabledUsers).length).toBe(1)
    expect(transport.mock.calls.length).toBe(1)
    expect(transport.mock.calls[0][0].enabledInfo).toEqual({
      force: false,
      isTrackingForbidden: false,
      forceEnabledByUser: true,
      enabledByAllEventsFraction: false,
      enabledByDomEventsFraction: false,
      enabledByFilters: true,
      enabledByDomObserversFraction: false,
      enabledByPageStateEventsFraction: false,
      enabledBySessionEventsFraction: false,
      enabledByPageviewEventsFraction: false,
      enabledByCustomEventsFraction: false,
      enabledByCurrentEventFraction: false,
      enabledByDocumentVisibilityEventsFraction: false,
    })

    unforward()
  })

  test('force enable by event fraction', async () => {
    const fraction = 0.7
    const badUserId = 'd1eec3f4-9226-4d4e-898a-3d4b2e84d9d3'

    const transport = jest.fn()
    createEndpoint({
      name: 'test',
      guard: {
        fraction: {
          all: fraction,
        },
      },
      transport,
    })

    const scope = fork(root, {
      handlers: mockCookies(),
    })

    await initModules(scope)

    await allSettled(changeUserId, {
      scope,
      params: badUserId,
    })

    const event: AnyEvent = {
      ...mockDomEvent(),
      endpointsOptions: [
        {
          name: 'test',
          fraction: 1.0,
        },
      ],
    }

    await allSettled(domEventCaptured, {
      scope,
      params: event,
    })

    expect(transport.mock.calls.length).toBe(1)
    expect(transport.mock.calls[0][0].enabledInfo).toEqual({
      force: false,
      isTrackingForbidden: false,
      forceEnabledByUser: false,
      enabledByAllEventsFraction: false,
      enabledByDomEventsFraction: false,
      enabledByFilters: true,
      enabledByDomObserversFraction: false,
      enabledByPageStateEventsFraction: false,
      enabledBySessionEventsFraction: false,
      enabledByPageviewEventsFraction: false,
      enabledByCustomEventsFraction: false,
      enabledByCurrentEventFraction: true,
      enabledByDocumentVisibilityEventsFraction: false,
    })
  })

  test('is tracking forbidden', async () => {
    const fraction = 0.7
    const goodUserId = 'ed50419d-4657-46e2-8d0e-78b8787432b9'
    const transport = jest.fn()

    createEndpoint({
      name: 'test',
      guard: {
        fraction: {
          all: fraction,
        },
      },
      transport,
    })

    const scope = fork(root, {
      values: new Map().set($isTrackingForbidden, true),
      handlers: mockCookies(),
    })

    await initModules(scope)
    await allSettled(changeUserId, {
      scope,
      params: goodUserId,
    })

    await allSettled(domEventCaptured, {
      scope,
      params: mockDomEvent(),
    })
    expect(transport.mock.calls.length).toBe(0)
  })

  test('force tracking forbidden', async () => {
    const fraction = 0.7
    const goodUserId = 'ed50419d-4657-46e2-8d0e-78b8787432b9'
    const transport = jest.fn()

    createEndpoint({
      name: 'test',
      guard: {
        fraction: {
          all: fraction,
        },
      },
      transport,
    })

    const scope = fork(root, {
      values: new Map().set($isTrackingForbidden, true),
      handlers: mockCookies(),
    })

    await initModules(scope)
    await allSettled(changeUserId, {
      scope,
      params: goodUserId,
    })

    const event: AnyEvent = {
      ...mockDomEvent(),
      endpointsOptions: [
        {
          name: 'test',
          force: true,
        },
      ],
    }

    await allSettled(domEventCaptured, {
      scope,
      params: event,
    })
    expect(transport.mock.calls.length).toBe(1)
    expect(transport.mock.calls[0][0].enabledInfo).toEqual({
      force: true,
      isTrackingForbidden: true,
      forceEnabledByUser: false,
      enabledByFilters: true,
      enabledByAllEventsFraction: true,
      enabledByDomEventsFraction: false,
      enabledByDomObserversFraction: false,
      enabledByPageStateEventsFraction: false,
      enabledByPageviewEventsFraction: false,
      enabledBySessionEventsFraction: false,
      enabledByCustomEventsFraction: false,
      enabledByCurrentEventFraction: false,
      enabledByDocumentVisibilityEventsFraction: false,
    })
  })
})
