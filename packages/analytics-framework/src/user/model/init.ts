import { forward, sample } from 'effector'
import { condition } from 'patronum/condition'

import { clearUserIdFx, createUserIdFx, getCurrentUserIdFx, setUserId, writeUserIdFx } from '~/user/model/private'
import { $newUser, $userId, changeUserId, clearUser, initUser, onCreateUser, userReady } from '~/user/model/public'

$userId.on(setUserId, (_, userId) => userId).reset(clearUserIdFx)

$newUser.on(onCreateUser, () => true)

condition({
  source: initUser,
  if: userId => Boolean(userId),
  then: setUserId,
  else: getCurrentUserIdFx,
})

condition({
  source: getCurrentUserIdFx.doneData.map(({ value }) => value),
  if: userId => userId !== null,
  then: setUserId,
  else: createUserIdFx,
})

forward({
  from: createUserIdFx.doneData.map(({ value }) => value as string),
  to: setUserId,
})

forward({
  from: sample({
    source: $userId,
    clock: createUserIdFx.done,
  }),
  to: onCreateUser,
})

forward({
  from: sample({
    source: $userId,
    clock: setUserId,
  }),
  to: userReady,
})

forward({
  from: clearUser,
  to: clearUserIdFx,
})

forward({
  from: changeUserId,
  to: writeUserIdFx,
})

forward({
  from: writeUserIdFx.doneData.map(({ value }) => value as string),
  to: setUserId,
})
