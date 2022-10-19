import { attach, combine } from 'effector'

import { writeItemFx } from '~/cookie-storage'
import { root } from '~/effector-root'
import { uuid } from '~/lib/fast-uuid'
import type { AnyEvent, UserId, WindowMetadata } from '~/types'
import { $userId } from '~/user'

const createEventIndexKey = (userId: UserId) => `user_${userId}_event_index`

export const d = root.domain()

export const $windowEventIndex = d.store<number>(0)
export const $windowId = d.store<string>(uuid())

type IncUserEventIndexParams = {
  event: AnyEvent
}

export const incUserEventIndexFx = attach({
  source: combine({
    userId: $userId,
  }),
  effect: writeItemFx,
  mapParams: (_: IncUserEventIndexParams, { userId }) => ({
    key: createEventIndexKey(userId),
    value: prevValue => {
      if (prevValue === null) {
        return String(1)
      }

      const prevValInt = parseInt(prevValue, 10)

      if (isNaN(prevValInt)) {
        return String(1)
      }

      return String(prevValInt + 1)
    },
  }),
})

export type GetMetadataParams = {
  event: AnyEvent
  userEventIndex: number
  marketingSessionId?: string
}

export type GetWindowMetadataResult = {
  event: AnyEvent
  userEventIndex: number
  windowMetadata: WindowMetadata
}

export const getWindowMetadataFx = d.effect<GetMetadataParams, GetWindowMetadataResult, Error>()
