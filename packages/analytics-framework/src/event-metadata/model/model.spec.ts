import '~/cookie-storage/init'
import '~/user/init'
import './init'

import type { Scope } from 'effector'
import { allSettled, fork } from 'effector'

import { initCookieStorage } from '~/cookie-storage'
import { mockCookies } from '~/cookie-storage/mocks'
import { domEventCaptured } from '~/dom-events-tracker'
import { root } from '~/effector-root'
import type { AnyEvent } from '~/types'
import { $userId, initUser } from '~/user'

import { $windowEventIndex, $windowId } from './private'
import { eventWithMetadataReceived, initMetadata, resetMetadata } from './public'

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

describe('event metadata', () => {
  test('init metadata', async () => {
    const scope = fork(root, {
      handlers: mockCookies(),
    })

    await initModules(scope)

    expect(scope.getState($windowEventIndex)).toEqual(0)
    expect(typeof scope.getState($windowId) === 'string').toEqual(true)
  })

  test('process event', async () => {
    const eventWithMetadataWatcher = jest.fn()
    eventWithMetadataReceived.watch(eventWithMetadataWatcher)

    const scope = fork(root, {
      handlers: mockCookies(),
    })

    await initModules(scope)

    const eventMock = mockDomEvent()

    await allSettled(domEventCaptured, {
      scope,
      params: eventMock,
    })

    const windowEventIndex = scope.getState($windowEventIndex)
    const windowId = scope.getState($windowId)
    const userId = scope.getState($userId)

    const metadata = eventWithMetadataWatcher.mock.calls[0][0].metadata
    const eventWithoutMetadata = { ...eventWithMetadataWatcher.mock.calls[0][0] }
    delete eventWithoutMetadata.metadata

    expect(windowEventIndex).toBe(1)
    expect(metadata.userEventIndex).toBe(1)
    expect(metadata.windowEventIndex).toBe(1)
    expect(metadata.windowId).toBe(windowId)
    expect(metadata.userId).toBe(userId)
    expect(eventWithoutMetadata).toEqual(eventMock)
  })

  test('inc indexes', async () => {
    const eventWithMetadataWatcher = jest.fn()
    eventWithMetadataReceived.watch(eventWithMetadataWatcher)

    const scope = fork(root, {
      handlers: mockCookies(),
    })

    await initModules(scope)

    await allSettled(domEventCaptured, {
      scope,
      params: mockDomEvent(),
    })
    await allSettled(domEventCaptured, {
      scope,
      params: mockDomEvent(),
    })

    const firstEventMetadata = eventWithMetadataWatcher.mock.calls[0][0].metadata
    const secondEventMetadata = eventWithMetadataWatcher.mock.calls[1][0].metadata

    expect(firstEventMetadata.userEventIndex).toBe(1)
    expect(firstEventMetadata.windowEventIndex).toBe(1)
    expect(secondEventMetadata.userEventIndex).toBe(2)
    expect(secondEventMetadata.windowEventIndex).toBe(2)
  })

  test('keep user index', async () => {
    const eventWithMetadataWatcher = jest.fn()
    eventWithMetadataReceived.watch(eventWithMetadataWatcher)

    const scope = fork(root, {
      handlers: mockCookies(),
    })

    await initModules(scope)
    await allSettled(domEventCaptured, {
      scope,
      params: mockDomEvent(),
    })

    const firstEventMetadata = eventWithMetadataWatcher.mock.calls[0][0].metadata

    expect(firstEventMetadata.userEventIndex).toBe(1)
    expect(firstEventMetadata.windowEventIndex).toBe(1)

    await allSettled(resetMetadata, { scope })

    const windowEventIndex = scope.getState($windowEventIndex)

    expect(windowEventIndex).toBe(0)

    await allSettled(initMetadata, { scope })
    await allSettled(domEventCaptured, {
      scope,
      params: mockDomEvent(),
    })
    const secondEventMetadata = eventWithMetadataWatcher.mock.calls[1][0].metadata
    expect(secondEventMetadata.userEventIndex).toBe(2)
    expect(secondEventMetadata.windowEventIndex).toBe(1)
  })
})
