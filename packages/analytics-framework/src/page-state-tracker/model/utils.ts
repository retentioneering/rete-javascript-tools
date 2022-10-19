import type { PerfInfo } from '~/types'

interface PerformanceWithMemory extends Performance {
  memory?: {
    /** The maximum size of the heap, in bytes, that is available to the context. */
    jsHeapSizeLimit: number
    /** The total allocated heap size, in bytes. */
    totalJSHeapSize: number
    /** The currently active segment of JS heap, in bytes. */
    usedJSHeapSize: number
  }
}

const MB = 1_048_576 // 1024 * 1024

const toMegabytes = (value: number): number => Math.floor(value / MB)

// TODO: Add support for `prerender` type, use `NavigationTimingType`
const NavigationTypeMap: Record<string, string | undefined> = {
  back_forward: 'History',
  navigate: 'Navigation',
  reload: 'Reload',
}

const toNavigationType = (navigationTimingTime: NavigationTimingType): string => {
  return NavigationTypeMap[navigationTimingTime] || 'Unknown_' + navigationTimingTime
}

const diff = (start: number, end: number): number => end - start

export const getPerfInfo = (): PerfInfo | undefined => {
  if (typeof window === 'undefined' || !('performance' in window)) {
    return undefined
  }

  const result: PerfInfo = {}

  const { memory } = performance as PerformanceWithMemory

  // Non standard API
  if (memory) {
    result.used_js_heap_size = toMegabytes(memory.usedJSHeapSize)
    result.total_js_heap_size = toMegabytes(memory.totalJSHeapSize)
    result.js_heap_size_limit = toMegabytes(memory.jsHeapSizeLimit)
  }

  const [timing] = performance.getEntriesByType('navigation') as [PerformanceNavigationTiming]

  if (timing) {
    result.navigation_type = toNavigationType(timing.type)

    result.redirect_count = timing.redirectCount
    result.pre_fetch_delay = timing.fetchStart

    result.domain_lookup_delay = diff(timing.domainLookupStart, timing.domainLookupEnd)
    result.connect_delay = diff(timing.connectStart, timing.connectEnd)
    result.request_delay = diff(timing.requestStart, timing.responseEnd)

    result.dom_interactive_delay = diff(timing.responseEnd, timing.domInteractive)
    result.dom_complete_delay = diff(timing.responseEnd, timing.domComplete)
    result.window_loaded_delay = diff(timing.responseEnd, timing.loadEventEnd)

    result.dom_content_loaded_listeners_delay = diff(timing.domContentLoadedEventStart, timing.domContentLoadedEventEnd)
  }

  return result
}
