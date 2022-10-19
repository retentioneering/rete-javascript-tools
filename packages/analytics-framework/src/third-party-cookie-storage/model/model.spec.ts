import './init'

import { allSettled, fork } from 'effector'

import { mockEffects } from '~/lib/testing-helpers'

import { initThirdPartyCookieStorageFx, pushToThirdPartyCookieStorageFx } from './private'
import {
  $thirdPartyCookieStorage,
  $thirdPartyCookieStorageParams,
  $thirdPartyCookieStorageReady,
  initThirdPartyCookieStorage,
  pushToThirdPartyCookieStorage,
} from './public'
import type { KV } from './types'

const mock = () => {
  let storage: KV = {}

  return fork({
    handlers: mockEffects()
      .set(initThirdPartyCookieStorageFx, () => storage)
      .set(pushToThirdPartyCookieStorageFx, ({ updateSet }) => {
        storage = {
          ...storage,
          ...updateSet,
        }
        return storage
      }),
  })
}

describe('third party cookie storage', () => {
  test('init', async () => {
    const initFxWatcher = jest.fn()
    initThirdPartyCookieStorageFx.watch(initFxWatcher)

    const scope = mock()
    const params = {
      baseURL: 'https://example',
      getStorageURL: '/get',
      setStorageURL: '/set',
    }

    expect(scope.getState($thirdPartyCookieStorage)).toEqual({})
    expect(scope.getState($thirdPartyCookieStorageReady)).toBe(false)

    await allSettled(initThirdPartyCookieStorage, {
      scope,
      params,
    })

    expect(scope.getState($thirdPartyCookieStorageParams)).toEqual(params)
    expect(scope.getState($thirdPartyCookieStorage)).toEqual({})
    expect(scope.getState($thirdPartyCookieStorageReady)).toBe(true)
    expect(initFxWatcher.mock.calls.length).toBe(1)
  })

  test('push', async () => {
    const pushWatcher = jest.fn()
    pushToThirdPartyCookieStorageFx.watch(pushWatcher)

    const scope = mock()
    const params = {
      baseURL: 'https://example',
      getStorageURL: '/get',
      setStorageURL: '/set',
    }

    await allSettled(pushToThirdPartyCookieStorage, {
      scope,
      params: {},
    })

    expect(pushWatcher.mock.calls.length).toBe(0)

    await allSettled(initThirdPartyCookieStorage, {
      scope,
      params,
    })

    const updateSet = {
      a: 'test',
      b: 'test',
    }

    await allSettled(pushToThirdPartyCookieStorage, {
      scope,
      params: updateSet,
    })

    expect(pushWatcher.mock.calls.length).toBe(1)
    expect(scope.getState($thirdPartyCookieStorage)).toEqual(updateSet)

    const updateSet2 = {
      c: 'test3',
    }

    await allSettled(pushToThirdPartyCookieStorage, {
      scope,
      params: updateSet2,
    })

    expect(pushWatcher.mock.calls.length).toBe(2)
    expect(scope.getState($thirdPartyCookieStorage)).toEqual({
      ...updateSet,
      ...updateSet2,
    })
  })
})
