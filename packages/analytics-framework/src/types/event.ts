import type { MarketingSessionEvent } from '~/marketing-session/contracts'

import type { CustomEvent } from './custom-events'
import type { DocumentVisibilityEvent } from './document-visibility-events'
import type { DomEvent } from './dom-events'
import type { DomObserverEvent } from './dom-observers'
import type { PageStateEvent } from './page-state-events'
import type { PageviewEvent } from './pageview-events'
import type { User } from './user'

export type WindowMetadata = {
  currentUrl: string
  userAgent: string
  title: string
  marketingSessionId?: string
}

export type AnyEvent =
  | DomEvent
  | DomObserverEvent
  | PageStateEvent
  | PageviewEvent
  | MarketingSessionEvent
  | CustomEvent
  | DocumentVisibilityEvent

export type EventWithMetadata = AnyEvent & {
  metadata: WindowMetadata & {
    userId: User['userId']
    windowId: string
    userEventIndex: number
    windowEventIndex: number
    userAgent: string
  }
}
