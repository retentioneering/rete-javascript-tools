/* eslint-disable no-useless-escape */
export type QueryParams = {
  [key: string]: string | number | null
}

export type ParseQueryParamsResult = {
  [key: string]: string | string[] | undefined
}

export const parseQueryParams = (url: string): ParseQueryParamsResult => {
  const question = url.indexOf('?')
  let hash = url.indexOf('#')

  if (hash === -1 && question === -1) {
    return {}
  }

  if (hash === -1) {
    hash = url.length
  }

  const query = question === -1 || hash === question + 1 ? url.substring(hash) : url.substring(question + 1, hash)

  const result = {} as { [key: string]: string | string[] | undefined }

  query.split('&').forEach(function (part) {
    if (!part) {
      return
    }

    part = part.split('+').join(' ')

    const eq = part.indexOf('=')

    let key = eq > -1 ? part.substring(0, eq) : part
    const val = eq > -1 ? decodeURIComponent(part.substring(eq + 1)) : ''

    const from = key.indexOf('[')

    if (from === -1) {
      const objKey = decodeURIComponent(key)

      if (objKey) {
        result[objKey] = val
      }
    } else {
      const to = key.indexOf(']', from)
      const index = decodeURIComponent(key.substring(from + 1, to))

      key = decodeURIComponent(key.substring(0, from))

      if (!result[key]) {
        result[key] = []
      }

      const value = result[key]
      if (!Array.isArray(value)) {
        return
      }

      if (!index) {
        value.push(val)
      } else {
        value[+index] = val
      }
    }
  })

  return result
}

// Simple join url func implementation
export function joinURL(...args: string[]) {
  const url = args
    .map((part, i) => {
      return i === 0 ? part.trim().replace(/\/*$/g, '') : part.trim().replace(/(^\/*|\/*$)/g, '')
    })
    .filter(x => x.length)
    .join('/')

  const lastPart = args[args.length - 1]
  const lastChar = lastPart[lastPart.length - 1]
  return lastChar === '/' && url[url.length - 1] !== '/' ? `${url}/` : url
}

export const buildQuerystring = (params: QueryParams): string => {
  const query = []

  for (const key in params) {
    // eslint-disable-next-line no-prototype-builtins
    if (params.hasOwnProperty(key)) {
      // eslint-disable-next-line max-len
      const parameter = `${encodeURIComponent(key)}=${encodeURIComponent(String(params[key]))}`
      query.push(parameter)
    }
  }

  return query.join('&')
}

export const appendQueryParams = (url: string, params: QueryParams): string => {
  const querystring = buildQuerystring(params)
  const lastUrlChar = url[url.length - 1]

  if (lastUrlChar === '?') {
    return `${url}${querystring}`
  }

  if (/[?&]/.test(url) && lastUrlChar !== '&') {
    return `${url}&${querystring}`
  }

  return `${url}?${querystring}`
}
