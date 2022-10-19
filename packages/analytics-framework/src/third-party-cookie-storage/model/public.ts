import { root } from '~/effector-root'

import type { KV, ThirdPartyCookieStorageParams } from './types'

const d = root.domain()

export const $thirdPartyCookieStorage = d.store<KV>({})
export const $thirdPartyCookieStorageParams = d.store<ThirdPartyCookieStorageParams | null>(null)
export const $thirdPartyCookieStorageReady = d.store(false)

export const initThirdPartyCookieStorage = d.event<ThirdPartyCookieStorageParams>()
export const thirdPartyCookieStorageReady = d.event<void>()
export const pushToThirdPartyCookieStorage = d.event<KV>()
