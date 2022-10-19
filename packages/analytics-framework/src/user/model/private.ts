import { attach } from 'effector'

import { readItemFx, writeItemFx } from '~/cookie-storage'
import { root } from '~/effector-root'
import { generateUserId } from '~/lib/generate'
import type { UserId } from '~/types'

const d = root.domain()

const USER_ID_COOKIE_NAME = 'user-id'

export const setUserId = d.event<UserId>()
export const getCurrentUserIdFx = attach({
  effect: readItemFx,
  mapParams: () => ({
    key: USER_ID_COOKIE_NAME,
  }),
})
export const createUserIdFx = attach({
  effect: writeItemFx,
  mapParams: () => {
    const userId = generateUserId()
    return {
      key: USER_ID_COOKIE_NAME,
      value: userId,
    }
  },
})
export const writeUserIdFx = attach({
  effect: writeItemFx,
  mapParams: (userId: UserId) => ({
    key: USER_ID_COOKIE_NAME,
    value: userId,
  }),
})
export const clearUserIdFx = attach({
  effect: writeItemFx,
  mapParams: () => ({
    key: USER_ID_COOKIE_NAME,
    value: null,
  }),
})
