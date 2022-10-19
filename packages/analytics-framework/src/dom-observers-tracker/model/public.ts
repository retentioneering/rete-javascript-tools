import { root } from '~/effector-root'
import type { DomObserverConfig, DomObserverEvent } from '~/types'

const d = root.domain()

export const initDomObservers = d.event<DomObserverConfig[]>()
export const eventCaptured = d.event<DomObserverEvent>()
