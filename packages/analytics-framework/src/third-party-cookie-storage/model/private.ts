import { root } from '~/effector-root'

import type { KV, ThirdPartyCookieStorageParams } from './types'

const d = root.domain()

export type PushParams = {
  updateSet: KV
  params: ThirdPartyCookieStorageParams
}

export const initThirdPartyCookieStorageFx = d.effect<ThirdPartyCookieStorageParams, KV>()
export const pushToThirdPartyCookieStorageFx = d.effect<PushParams, KV>()
