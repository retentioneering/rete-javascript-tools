import { forward, guard, sample } from 'effector'

import { Request } from '~/lib/request'

import type { PushParams } from './private'
import { initThirdPartyCookieStorageFx, pushToThirdPartyCookieStorageFx } from './private'
import {
  $thirdPartyCookieStorage,
  $thirdPartyCookieStorageParams,
  $thirdPartyCookieStorageReady,
  initThirdPartyCookieStorage,
  pushToThirdPartyCookieStorage,
  thirdPartyCookieStorageReady,
} from './public'
import type { KV } from './types'

$thirdPartyCookieStorageReady.on(thirdPartyCookieStorageReady, () => true)

$thirdPartyCookieStorage
  .on(initThirdPartyCookieStorageFx.doneData, (_, kv) => kv)
  .on(pushToThirdPartyCookieStorageFx.doneData, (_, kv) => kv)

$thirdPartyCookieStorageParams.on(initThirdPartyCookieStorageFx.done, (_, { params }) => params)

forward({
  from: initThirdPartyCookieStorage,
  to: initThirdPartyCookieStorageFx,
})

sample({
  source: $thirdPartyCookieStorage,
  clock: initThirdPartyCookieStorageFx.doneData,
  target: thirdPartyCookieStorageReady,
})

const push = guard(
  sample({
    source: $thirdPartyCookieStorageParams,
    clock: pushToThirdPartyCookieStorage,
    fn: (params, updateSet) => ({
      updateSet,
      params,
    }),
  }),
  {
    filter: (p): p is PushParams => Boolean(p.params),
  },
)

forward({
  from: push,
  to: pushToThirdPartyCookieStorageFx,
})

initThirdPartyCookieStorageFx.use(async ({ baseURL, getStorageURL }) => {
  const request = new Request({ baseURL })
  const { data } = await request.get<KV>(getStorageURL, {
    withCredentials: true,
  })
  return data
})

pushToThirdPartyCookieStorageFx.use(async ({ updateSet, params }) => {
  const request = new Request({ baseURL: params.baseURL })
  const { data } = await request.post<KV>(params.setStorageURL, {
    json: updateSet,
    withCredentials: true,
  })
  return data
})
