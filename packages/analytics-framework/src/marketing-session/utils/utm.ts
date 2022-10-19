import { readItemFx } from '~/cookie-storage'
import { parseQueryParams } from '~/lib/url'
import type { UTM } from '~/marketing-session/contracts'
import { LAST_UTM_KEY, UTM_KEYS } from '~/marketing-session/contracts'

type StringOrUndefined = string | undefined

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return value !== null && typeof value === 'object'
}

const isStringOrUndefined = (value: unknown): value is StringOrUndefined => {
  return typeof value === 'string' || typeof value === 'undefined'
}

const isUtmValid = (utmObject: unknown): utmObject is UTM => {
  if (!isRecord(utmObject)) {
    return false
  }

  for (const utmKey of UTM_KEYS) {
    if (!isStringOrUndefined(utmObject[utmKey])) {
      return false
    }
  }

  return true
}

const getLastUtm = async (): Promise<UTM | undefined> => {
  const { value } = await readItemFx({ key: LAST_UTM_KEY })

  if (!value) {
    return undefined
  }

  let utm: UTM | undefined

  try {
    utm = JSON.parse(value)
  } catch (error) {
    console.error(error)
  }

  return isUtmValid(utm) ? utm : undefined
}

export const parseUtm = (queryString: string): UTM | undefined => {
  let queryParams: Record<string, unknown> = {}

  try {
    queryParams = parseQueryParams(queryString)
  } catch (error) {
    console.error(error)
  }

  const utm = UTM_KEYS.reduce<UTM>((acc, utmKey) => {
    const value = queryParams[utmKey]

    if (value && typeof value === 'string') {
      acc[utmKey] = value
    }

    return acc
  }, {})

  return Object.keys(utm).length ? utm : undefined
}

export const isUtmChanged = async (): Promise<boolean> => {
  const newUtm = parseUtm(window.location.search)

  if (!newUtm) {
    return false
  }

  const currentUtm = (await getLastUtm()) || {}

  if (Object.keys(newUtm).length !== Object.keys(newUtm).length) {
    return true
  }

  for (const utmKey of UTM_KEYS) {
    if (newUtm[utmKey] !== currentUtm[utmKey]) {
      return true
    }
  }

  return false
}
