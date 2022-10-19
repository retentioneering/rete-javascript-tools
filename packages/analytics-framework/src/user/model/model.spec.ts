import '~/cookie-storage/init'
import './init'

import { allSettled, fork } from 'effector'

import { initCookieStorage } from '~/cookie-storage'
import { mockCookies } from '~/cookie-storage/mocks'
import { root } from '~/effector-root'
import { generateUserId } from '~/lib/generate'
import { $userId, initUser } from '~/user/model/public'

describe('initUser', () => {
  test("init user if user doesn't exists", async () => {
    const scope = fork(root, {
      handlers: mockCookies(),
    })

    await allSettled(initCookieStorage, {
      scope,
      params: {
        cookieDomain: '.example.com',
      },
    })

    await allSettled(initUser, {
      scope,
      params: undefined,
    })

    expect(typeof scope.getState($userId) === 'string').toBeTruthy()
  })

  test('init user if user already exists', async () => {
    const clearUser = root.event<void>()

    $userId.reset(clearUser)

    const scope = fork(root, {
      handlers: mockCookies(),
    })

    await allSettled(initCookieStorage, {
      scope,
      params: {
        cookieDomain: '.example.com',
      },
    })

    await allSettled(initUser, {
      scope,
      params: undefined,
    })

    const userId = scope.getState($userId)

    await allSettled(clearUser, {
      scope,
    })

    expect(scope.getState($userId)).toEqual(null)

    await allSettled(initUser, {
      scope,
      params: undefined,
    })

    expect(scope.getState($userId)).toEqual(userId)
  })

  test('init user with external id', async () => {
    const scope = fork(root, {
      handlers: mockCookies(),
    })

    await allSettled(initCookieStorage, {
      scope,
      params: {
        cookieDomain: '.example.com',
      },
    })

    const externalUserId = generateUserId()

    await allSettled(initUser, {
      scope,
      params: externalUserId,
    })

    expect(scope.getState($userId)).toEqual(externalUserId)
  })
})
