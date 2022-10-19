import { forward, sample } from 'effector'
import { combineEvents } from 'patronum/combine-events'
import { condition } from 'patronum/condition'
import { interval } from 'patronum/interval'

import type { MarketingSessionEvent } from '~/marketing-session/contracts'
import { CHECK_SESSION_INTERVAL, Reason } from '~/marketing-session/contracts'
import {
  $marketingSessionConfig,
  $marketingSessionId,
  disableSession,
  dispatchSessionEvent,
  enableSession,
  getNewSessionIdFx,
  getPersistedSessionIdFx,
  getReasonToUpdateSessionFx,
  isMarketingSessionExpiredFx,
  sessionReady,
  startInterval,
  stopInterval,
  updateLastEventMsTsFx,
  updateLastExternalReferrerFx,
  updateMarketingSessionIdFx,
  updateUtmFx,
} from '~/marketing-session/model/public'

$marketingSessionConfig.on(enableSession, (_, newState) => newState).reset(disableSession)

$marketingSessionId
  .on([getNewSessionIdFx.doneData, getPersistedSessionIdFx.doneData], (_, newSessionId) => newSessionId)
  .reset(disableSession)

const prepareSessionEvent = combineEvents({
  events: [
    getReasonToUpdateSessionFx.doneData,
    updateLastEventMsTsFx.doneData,
    updateUtmFx.doneData,
    updateLastExternalReferrerFx.doneData,
    updateMarketingSessionIdFx.doneData,
  ],
})

const { tick } = interval({
  timeout: CHECK_SESSION_INTERVAL,
  start: startInterval,
  stop: stopInterval,
})

// Дождёмся инициализации состояния сессии с ранее сохранённым в постоянном хранилище
// значением сессии
forward({
  from: enableSession,
  to: getPersistedSessionIdFx,
})

// Остановим таймер при условии, что он работает, а сессия включена
forward({
  from: disableSession,
  to: stopInterval,
})

// При инициализации сессии запустим таймер и эффект получения причины обновления сессии
sample({
  source: {
    config: $marketingSessionConfig,
    sessionId: $marketingSessionId,
  },
  clock: getPersistedSessionIdFx.doneData,
  fn: ({ config, sessionId }) => ({ ...config, sessionId }),
  target: [getReasonToUpdateSessionFx, startInterval],
})

// После получения причины обновления сессии, при её наличии запустить эффект,
// который обновит данные в куках
condition({
  source: getReasonToUpdateSessionFx.doneData,
  if: reason => reason === Reason.NO_UPDATES,
  then: sessionReady,
  else: getNewSessionIdFx,
})

// После получения обновлённого идентификатора сессии
// запустим эффекты обновления данных в куках
sample({
  source: {
    config: $marketingSessionConfig,
    sessionId: $marketingSessionId,
  },
  clock: getNewSessionIdFx.doneData,
  fn: ({ config, sessionId }) => ({ ...config, sessionId }),
  target: [updateMarketingSessionIdFx, updateLastExternalReferrerFx, updateLastEventMsTsFx, updateUtmFx],
})

// Перенаправим событие тика таймера в эффект проверки времени истечения сессии
forward({
  from: tick,
  to: isMarketingSessionExpiredFx,
})

// Если выяснилось, что сессия истекла, обновим сессию
sample({
  clock: isMarketingSessionExpiredFx.doneData,
  filter: isExpired => isExpired,
  target: getNewSessionIdFx,
})

forward({
  from: prepareSessionEvent,
  to: sessionReady,
})

// Если обнаружена новая сессия, запустим соответствующее событие
sample({
  source: $marketingSessionId,
  clock: prepareSessionEvent,
  filter: (marketingSessionId, [reason]) => !!marketingSessionId && reason !== Reason.NO_UPDATES,
  fn: (marketingSessionId, [reason]): MarketingSessionEvent => ({
    type: 'session-event',
    name: 'start_session',
    data: {
      marketingSessionId,
      reason,
    },
  }),
  target: dispatchSessionEvent,
})
