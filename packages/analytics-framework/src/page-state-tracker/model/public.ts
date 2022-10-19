import { root } from '~/effector-root'
import type { PageStateEvent } from '~/types'

const d = root.domain()

export const eventCaptured = d.event<PageStateEvent>()
export const onDomContentLoaded = d.event<void>()
export const onWindowLoaded = d.event<void>()
export const onWindowUnloaded = d.event<void>()
