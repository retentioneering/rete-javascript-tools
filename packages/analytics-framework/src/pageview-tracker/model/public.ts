import { root } from '~/effector-root'
import type { PageviewEvent } from '~/types'

const d = root.domain()

export const eventCaptured = d.event<PageviewEvent>()
