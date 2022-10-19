import { readItemFx, writeItemFx } from '~/cookie-storage'
import { LAST_EVENT_TIMESTAMP_KEY } from '~/marketing-session/contracts'

export const getLastEventMsTs = async (): Promise<number | null> => {
  const { value } = await readItemFx({ key: LAST_EVENT_TIMESTAMP_KEY })

  if (value === null) {
    return null
  }

  return +value
}

export const updateLastEventMsTs = async (): Promise<void> => {
  await writeItemFx({ key: LAST_EVENT_TIMESTAMP_KEY, value: Date.now() + '' })
}
