import { eraseCookie, getCookie, writeCookie } from '~/lib/cookies'

import { $cookieDomain, initCookieStorage, readCookieFx, writeCookieFx } from './public'

$cookieDomain.on(initCookieStorage, (_, { cookieDomain }) => cookieDomain)

const createKey = (key: string, cookieDomain: string): string => {
  return `rete_${key}_${cookieDomain}`
}

writeCookieFx.use(({ key, value, cookieDomain }) => {
  const cookieName = createKey(key, cookieDomain)

  if (typeof value === 'string') {
    writeCookie({
      name: cookieName,
      value,
      domain: cookieDomain,
    })
  }

  if (typeof value === 'function') {
    const prevVal = getCookie(cookieName)
    const newVal = value(prevVal)

    if (typeof newVal === 'string') {
      writeCookie({
        name: cookieName,
        value: newVal,
        domain: cookieDomain,
      })
    } else {
      eraseCookie({
        name: cookieName,
        domain: cookieDomain,
      })
    }

    return { key, value: newVal }
  }

  if (value === null) {
    eraseCookie({
      name: cookieName,
      domain: cookieDomain,
    })
  }

  return { key, value }
})

readCookieFx.use(({ key, cookieDomain, validator }) => {
  const cookieName = createKey(key, cookieDomain)

  const value = getCookie(cookieName)

  const isValid = validator && value !== null ? validator(value) : true

  return {
    key: cookieName,
    value: isValid ? value : null,
  }
})
