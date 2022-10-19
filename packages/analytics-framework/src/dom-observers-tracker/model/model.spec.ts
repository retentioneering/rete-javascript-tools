import './init'

import { allSettled, fork } from 'effector'

import { root } from '~/effector-root'
import type { DomObserverConfig } from '~/types'

import { $lastResults, onDomCollected } from './private'
import { eventCaptured, initDomObservers } from './public'

const mockObserverConfig = (): DomObserverConfig => ({
  config: {
    name: 'test-observer',
    targetSelector: '.test',
    parseRootEl: 'body',
    parseConfig: {
      type: 'string',
      selector: '.ff',
    },
  },
})

describe('dom observers model', () => {
  test('emit dom observer event', async () => {
    const config = mockObserverConfig()
    const eventCapturedWatcher = jest.fn()
    eventCaptured.watch(eventCapturedWatcher)

    const scope = fork(root)

    await allSettled(initDomObservers, {
      scope,
      params: [config],
    })

    await allSettled(onDomCollected, {
      scope,
      params: {
        name: config.config.name,
        parseResult: 'test',
      },
    })

    expect(eventCapturedWatcher.mock.calls.length).toBe(1)
    expect(eventCapturedWatcher.mock.calls[0][0]).toEqual({
      name: 'test-observer',
      type: 'dom-observer',
      data: 'test',
    })
  })

  test('duplicate events', async () => {
    const config = mockObserverConfig()
    const eventCapturedWatcher = jest.fn()
    eventCaptured.watch(eventCapturedWatcher)

    const scope = fork(root)

    await allSettled(initDomObservers, {
      scope,
      params: [config],
    })

    await allSettled(onDomCollected, {
      scope,
      params: {
        name: config.config.name,
        parseResult: 'test',
      },
    })
    await allSettled(onDomCollected, {
      scope,
      params: {
        name: config.config.name,
        parseResult: 'test',
      },
    })

    expect(eventCapturedWatcher.mock.calls.length).toBe(1)
    expect(eventCapturedWatcher.mock.calls[0][0]).toEqual({
      name: 'test-observer',
      type: 'dom-observer',
      data: 'test',
    })
    expect(scope.getState($lastResults)).toEqual({
      'test-observer': 'test',
    })

    await allSettled(onDomCollected, {
      scope,
      params: {
        name: config.config.name,
        parseResult: 'new result',
      },
    })

    expect(eventCapturedWatcher.mock.calls.length).toBe(2)
    expect(scope.getState($lastResults)).toEqual({
      'test-observer': 'new result',
    })
  })

  test('disable duplicate checking', async () => {
    const config: DomObserverConfig = {
      ...mockObserverConfig(),
      params: {
        disableDuplicateChecking: true,
      },
    }
    const eventCapturedWatcher = jest.fn()
    eventCaptured.watch(eventCapturedWatcher)

    const scope = fork(root)

    await allSettled(initDomObservers, {
      scope,
      params: [config],
    })

    await allSettled(onDomCollected, {
      scope,
      params: {
        name: config.config.name,
        parseResult: 'test',
      },
    })
    await allSettled(onDomCollected, {
      scope,
      params: {
        name: config.config.name,
        parseResult: 'test',
      },
    })

    expect(eventCapturedWatcher.mock.calls.length).toBe(2)
  })
})
