import { root } from '~/effector-root'
import type { DocumentVisibilityEvent } from '~/types'

const d = root.domain()

export const eventCaptured = d.event<DocumentVisibilityEvent>()
