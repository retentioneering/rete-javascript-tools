import { readItemFx } from '~/cookie-storage'
import { LAST_EXTERNAL_REFERRER_KEY } from '~/marketing-session/contracts'

export const getExternalReferrer = (host: string, hostsToIgnore: string[] = []): string => {
  try {
    const { referrer } = document

    if (!referrer) {
      return ''
    }

    const { origin } = new URL(referrer)

    if (origin === location.origin) {
      return ''
    }

    if (origin.endsWith(host[0] === '.' ? host.slice(1) : host)) {
      return ''
    }

    // TODO: Compare as URL
    const ignore = hostsToIgnore.some(ignore => referrer.includes(ignore))

    return ignore ? '' : referrer
  } catch (error) {
    console.error(error)

    return ''
  }
}

export const isRefererChanged = async (host: string, hostsToIgnore: string[]): Promise<boolean> => {
  const { value } = await readItemFx({ key: LAST_EXTERNAL_REFERRER_KEY })

  return value !== getExternalReferrer(host, hostsToIgnore)
}
