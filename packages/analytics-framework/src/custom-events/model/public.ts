import { root } from '~/effector-root'
import type { CustomEvent } from '~/types'

const d = root.domain()

export const dispatchCustomEvent = d.event<CustomEvent>()
