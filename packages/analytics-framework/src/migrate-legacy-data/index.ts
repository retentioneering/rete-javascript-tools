import { attach } from 'effector'

import { readItemFx, writeItemFx } from '~/cookie-storage'
import type { UserId } from '~/types'

import { migrateBaseSession } from './base-session'
import { migrateMarketingSession1 } from './marketing-session1'
import { migrateMarketingSession2 } from './marketing-session2'
import { migrateMarketingSession3 } from './marketing-session3'

const USER_ID_COOKIE_NAME = 'user-id'

export const getCurrentUserIdFx = attach({
  effect: readItemFx,
  mapParams: () => ({ key: USER_ID_COOKIE_NAME }),
})

const writeUserIdFx = attach({
  effect: writeItemFx,
  mapParams: (userId: UserId) => ({
    key: USER_ID_COOKIE_NAME,
    value: userId,
  }),
})

const legacyGetCookie = (name: string): string | null => {
  const matches = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1')}=([^;]*)`))
  return matches ? decodeURIComponent(matches[1]) : null
}

const legacyGetUserId = () => {
  const cookieName = 'reuserid'
  const cookie = legacyGetCookie(cookieName)
  if (cookie) {
    return cookie
  }

  return null
}

type EventsStats = {
  allEventsCount: number
  events: {
    [key: string]: number
  }
}

type StatsStorage = {
  [key: string]: EventsStats
}

const EVENTS_STATS_LC_KEY = 'rete-users-events-stats'

const isStatsValid = (stats: any) => {
  const isObject = typeof stats === 'object'
  const hasAllEventsCountField = typeof stats.allEventsCount === 'number'
  const hasEventsField = typeof stats.events === 'object'
  if (!isObject || !hasAllEventsCountField || !hasEventsField) {
    return false
  }
  return Object.getOwnPropertyNames(stats.events).every(key => {
    const value = stats.events[key]
    return typeof value === 'number' && !window.isNaN(value) && window.isFinite(value)
  })
}

const isStorageValid = (storage: any, notDeep = false) => {
  const isObject = typeof storage === 'object' && !Array.isArray(storage) && Boolean(storage)
  if (!isObject) {
    return false
  }
  if (notDeep) {
    return true
  }
  return Object.getOwnPropertyNames(storage).every(userId => {
    return isStatsValid(storage[userId])
  })
}

const legacyReadUserStats = (userId: string): EventsStats | null => {
  try {
    const serialized = window.localStorage.getItem(EVENTS_STATS_LC_KEY)
    if (serialized === null) {
      return null
    }
    const parsedStorage = JSON.parse(serialized)
    if (!isStorageValid(parsedStorage)) {
      return null
    }
    const statsStorage = parsedStorage as StatsStorage
    return statsStorage[userId] || null
  } catch {
    return null
  }
}

const createEventIndexKey = (userId: UserId) => `user_${userId}_event_index`

type WriteUserEventIndexParams = {
  userId: string
  index: number
}

const writeUserEventIndexFx = attach({
  effect: writeItemFx,
  mapParams: ({ userId, index }: WriteUserEventIndexParams) => ({
    key: createEventIndexKey(userId),
    value: `${index}`,
  }),
})

export const migrateLegacyData = async () => {
  const legacyUserId = legacyGetUserId()
  const { value: currentUserId } = await getCurrentUserIdFx()

  if (typeof legacyUserId === 'string' && typeof currentUserId !== 'string') {
    await writeUserIdFx(legacyUserId)
    const legacyStats = legacyReadUserStats(legacyUserId)

    // TODO: Надо ли тут проверять тип `legacyStats.allEventsCount`?
    // noinspection SuspiciousTypeOfGuard
    if (legacyStats && typeof legacyStats.allEventsCount === 'number') {
      await writeUserEventIndexFx({
        userId: legacyUserId,
        index: legacyStats.allEventsCount,
      })
    }
    await Promise.all([
      migrateBaseSession(),
      migrateMarketingSession1(),
      migrateMarketingSession2(),
      migrateMarketingSession3(),
    ])
  }
}
