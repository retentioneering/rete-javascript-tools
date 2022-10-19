import { mockEffects } from '~/lib/testing-helpers'

import { readCookieFx, writeCookieFx } from './model/public'

export const createKey = ({ key, cookieDomain }: { key: string; cookieDomain: string }) => {
  return `rete_${key}_${cookieDomain}`
}

export const mockCookies = (map: Map<any, any> = new Map(), cookieStorage: any = {}) => {
  return mockEffects(map)
    .set(writeCookieFx, ({ key, value, cookieDomain }) => {
      const cookieName = createKey({ key, cookieDomain })
      if (typeof value === 'function') {
        const newVal = value(cookieStorage[cookieName])
        cookieStorage[cookieName] = newVal
        return {
          key,
          value: newVal,
        }
      }
      cookieStorage[cookieName] = value
      return {
        key,
        value,
      }
    })
    .set(readCookieFx, ({ key, cookieDomain }) => {
      const cookieName = createKey({ key, cookieDomain })
      const value = cookieStorage[cookieName]
      return {
        key,
        value: cookieName in cookieStorage ? value : null,
      }
    })
}
