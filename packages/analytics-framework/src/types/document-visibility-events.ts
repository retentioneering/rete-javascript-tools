import type { BaseEvent } from './base'

export type DocumentVisibilityEventData = {
  visible: boolean
}

export type DocumentVisibilityEvent = BaseEvent<'document-visibility', DocumentVisibilityEventData>
