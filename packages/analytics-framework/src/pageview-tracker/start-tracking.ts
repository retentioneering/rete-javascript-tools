import { eventCaptured } from './model/public'

const CHECK_URL_INTERVAL_MS = 600

type LocationPart = {
  href: string
  origin: string
  pathname: string
  search: string
}

const copyLocation = (location: Location): LocationPart => ({
  href: location.href,
  origin: location.origin,
  pathname: location.pathname,
  search: location.search,
})

export type PageviewGuard = (newLocation: LocationPart, currentLocation: LocationPart) => boolean

const defaultGuard: PageviewGuard = (newLocation, currentLocation) => {
  return newLocation.href !== currentLocation.href
}

type StartPageviwTrackerParams = {
  guard?: PageviewGuard
}

export const startTracking = (params: StartPageviwTrackerParams = {}) => {
  const guard: PageviewGuard = params.guard || defaultGuard

  const emitPageViewEvent = () => {
    eventCaptured({
      type: 'pageview',
      name: 'pageview',
      data: undefined,
    })
  }

  emitPageViewEvent()

  let timeout: ReturnType<typeof setTimeout>
  let currentLocation: LocationPart = copyLocation(window.location)

  const checkUrl = () => {
    const newLocation = copyLocation(window.location)
    if (guard(newLocation, currentLocation)) {
      emitPageViewEvent()
    }
    currentLocation = newLocation
    timeout = setTimeout(checkUrl, CHECK_URL_INTERVAL_MS)
  }

  checkUrl()

  return () => {
    clearTimeout(timeout)
  }
}
