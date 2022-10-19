import { attach } from 'effector'

import { root } from '~/effector-root'

type InitCookieStorageParams = {
  cookieDomain: string
}

type ReadItemParams = {
  key: string
  validator?: (value: string) => boolean
}

type ReadItemResult = {
  key: string
  value: string | null
}

type CookieReducer = (currValue: string | null) => string | null

type WriteItemParams = {
  key: string
  value: string | null | CookieReducer
}

type WriteItemResult = ReadItemResult

export const d = root.domain()

export const $cookieDomain = d.store<string | null>(null)

export const initCookieStorage = d.event<InitCookieStorageParams>()

export const writeCookieFx = d.effect<WriteItemParams & { cookieDomain: string }, WriteItemResult, Error>()

export const readCookieFx = d.effect<ReadItemParams & { cookieDomain: string }, ReadItemResult, Error>()

export const writeItemFx = attach({
  source: $cookieDomain,
  effect: writeCookieFx,
  mapParams: (params: WriteItemParams, cookieDomain) => ({
    ...params,
    cookieDomain: cookieDomain || '',
  }),
})

export const readItemFx = attach({
  source: $cookieDomain,
  effect: readCookieFx,
  mapParams: (params: ReadItemParams, cookieDomain) => ({
    ...params,
    cookieDomain: cookieDomain || '',
  }),
})
