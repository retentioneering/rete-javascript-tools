/* eslint-disable camelcase */
import type { BaseEvent } from './base'

export type PageStage = 'dom_content_loaded' | 'window_loaded' | 'window_unloaded'

export type PerfInfo = {
  redirect_count?: number
  navigation_type?: string
  used_js_heap_size?: number
  total_js_heap_size?: number
  js_heap_size_limit?: number
  pre_fetch_delay?: number
  domain_lookup_delay?: number
  connect_delay?: number
  request_delay?: number
  dom_interactive_delay?: number
  dom_complete_delay?: number
  window_loaded_delay?: number
  dom_content_loaded_listeners_delay?: number
}

export type PageStateEventData = {
  stage: PageStage
  perfInfo?: PerfInfo
}

export type PageStateEvent = BaseEvent<'page-state', PageStateEventData>
