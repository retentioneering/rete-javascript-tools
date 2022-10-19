import type { QueryParams } from '~/lib/url'
import { appendQueryParams, joinURL } from '~/lib/url'

export interface RequestConfig {
  baseURL?: string
  query?: QueryParams
  json?: any
  text?: string
  withCredentials?: boolean
}

export interface HttpResponse<R> {
  status: number
  data: R
}

export class HttpError<R> extends Error {
  public response?: HttpResponse<R>

  constructor(message?: string, response?: HttpResponse<R>) {
    super(message)

    // TODO: Fix this shit
    // Линтер не ругается, но при компиляции выдаётся ошибка.
    // `Error.captureStackTrace` -- это фишка V8.
    // Возможно, здесь это не нужно.
    // @see https://github.com/microsoft/TypeScript/issues/1168#issuecomment-219296751
    if (typeof (Error as any).captureStackTrace === 'function') {
      ;(Error as any).captureStackTrace(this, this.constructor)
    } else {
      const err = new Error(message)
      this.stack = err.stack
    }

    this.response = response
  }
}

export class Request {
  private readonly baseURL: string

  private isSuccessHttpStatus(status: number) {
    return status >= 200 && status < 300
  }

  private parseResponse(xhr: XMLHttpRequest) {
    try {
      const responseText = xhr.responseText
      const contentType = xhr.getResponseHeader('Content-Type')
      if (contentType && /json/.test(contentType.toLowerCase())) {
        return JSON.parse(responseText)
      }
      return xhr.response
    } catch {
      return null
    }
  }

  private createResponse<R>(xhr: XMLHttpRequest): HttpResponse<R> {
    return {
      status: xhr.status,
      data: this.parseResponse(xhr) as R,
    }
  }

  private createHttpError<E>(xhr: XMLHttpRequest) {
    return new HttpError<E>('http error', this.createResponse<E>(xhr))
  }

  private promisifyXhrResponse<R, E>(xhr: XMLHttpRequest) {
    return new Promise<HttpResponse<R>>((resolve, reject) => {
      xhr.onreadystatechange = () => {
        if (xhr.readyState != xhr.DONE) {
          return
        }
        if (this.isSuccessHttpStatus(xhr.status)) {
          resolve(this.createResponse<R>(xhr))
        } else {
          reject(this.createHttpError<E>(xhr))
        }
      }
    })
  }

  constructor({ baseURL = '/' }: RequestConfig = { baseURL: '/' }) {
    this.baseURL = baseURL
  }

  public get<R = any, E = any>(path: string, config: RequestConfig = {}) {
    const xhr = new XMLHttpRequest()
    let url = joinURL(config.baseURL || this.baseURL, path)
    if (config.query) {
      url = appendQueryParams(url, config.query)
    }
    xhr.open('GET', url, true)
    if (config.withCredentials) {
      xhr.withCredentials = true
    }
    xhr.send()
    return this.promisifyXhrResponse<R, E>(xhr)
  }

  public post<R = any, E = any>(path: string, config: RequestConfig = {}) {
    const xhr = new XMLHttpRequest()
    let url = joinURL(config.baseURL || this.baseURL, path)
    if (config.query) {
      url = appendQueryParams(url, config.query)
    }
    xhr.open('POST', url, true)
    if (config.withCredentials) {
      xhr.withCredentials = true
    }
    if (config.json) {
      xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    }
    xhr.send(config.json ? JSON.stringify(config.json) : config.text)
    return this.promisifyXhrResponse<R, E>(xhr)
  }
}
