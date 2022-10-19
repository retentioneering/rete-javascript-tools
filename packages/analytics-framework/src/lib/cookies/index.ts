import { waitFor } from '../wait-for'

export function getCookie(name: string): string | null {
  const matches = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1')}=([^;]*)`))
  return matches ? decodeURIComponent(matches[1]) : null
}

export function waitForCookie(name: string, attemptIntervalMs = 500, maxWaitingMs?: number): Promise<string | null> {
  const checkCookie = () => getCookie(name) !== null
  return waitFor(checkCookie, attemptIntervalMs, maxWaitingMs).then(cookieExists => {
    if (cookieExists) {
      return getCookie(name)
    }
    return null
  })
}

type WriteCookieParams = {
  name: string
  value: string
  domain?: string
  secure?: boolean
  sameSite?: 'Lax' | 'Strict'
  expDate?: Date
}

export function writeCookie({
  name,
  value,
  domain,
  secure = false,
  sameSite = 'Lax',
  expDate,
}: WriteCookieParams): void {
  const neverExp = new Date()
  neverExp.setFullYear(neverExp.getFullYear() + 10)
  const exp = expDate || neverExp
  // eslint-disable-next-line max-len
  let cookieStr = `${name}=${value};expires=${exp.toUTCString()};domain=${domain};path=/;SameSite=${sameSite}`
  if (secure) {
    cookieStr += ';secure'
  }
  document.cookie = cookieStr
}

type EraseCookieParams = Pick<WriteCookieParams, 'name' | 'domain' | 'secure' | 'sameSite'>

export function eraseCookie({ name, domain, secure, sameSite }: EraseCookieParams) {
  const prevDate = new Date()
  prevDate.setFullYear(2005)
  writeCookie({ name, domain, value: '', secure, sameSite, expDate: prevDate })
}
