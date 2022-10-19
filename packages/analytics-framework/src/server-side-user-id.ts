import { readItemFx, writeItemFx } from '~/cookie-storage'
import { Request } from '~/lib/request'

type UserIdProviderParams = {
  baseURL: string
  path: string
}

const USER_ID_COOKIE_NAME = 'user-id'
const SERVER_ID_RECEIVED = 'server-id-received'

const isGuid = (value: string) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export const createUserIdProvider =
  ({ baseURL, path }: UserIdProviderParams) =>
  async () => {
    const { value: serverIdReceived } = await readItemFx({
      key: SERVER_ID_RECEIVED,
    })

    if (serverIdReceived === 'true') {
      const { value: userId } = await readItemFx({
        key: USER_ID_COOKIE_NAME,
      })

      if (userId) {
        return userId
      }

      throw new Error('existing id not found!')
    }

    const { value: userId } = await readItemFx({
      key: USER_ID_COOKIE_NAME,
    })

    // existing user id fallback
    const query = userId ? { userid: userId } : undefined
    const req = new Request({ baseURL })
    const res = await req.get(path, {
      query,
      withCredentials: true,
    })

    if (res.status === 200) {
      const userId = res.data
      if (!isGuid(userId)) {
        throw new Error('invalid user id')
      }

      if (typeof userId !== 'string') {
        throw new Error('invalid response')
      }
      await writeItemFx({
        key: USER_ID_COOKIE_NAME,
        value: userId,
      })
      await writeItemFx({
        key: SERVER_ID_RECEIVED,
        value: 'true',
      })
      return userId
    } else {
      throw new Error('get server id error!')
    }
  }
