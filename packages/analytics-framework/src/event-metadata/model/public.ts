import { root } from '~/effector-root'
import type { EventWithMetadata } from '~/types'

const eventMetadataDomain = root.domain()

export const initMetadata = eventMetadataDomain.event<void>()

export const metadataReady = eventMetadataDomain.event<void>()

export const eventWithMetadataReceived = eventMetadataDomain.event<EventWithMetadata>()

export const resetMetadata = eventMetadataDomain.event<void>()
