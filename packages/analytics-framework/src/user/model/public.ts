import { root } from '~/effector-root'
import type { UserId } from '~/types'

function isTrackingForbidden(): boolean {
  const isTrue = function (e: any): boolean {
    return e == true || e == '1' || e == 'yes'
  }
  const win: any = window

  // TODO: Заменить `window.external` на что-то посвежее
  // noinspection JSDeprecatedSymbols
  return Boolean(
    isTrue(win.doNotTrack) ||
      (navigator && isTrue(navigator.doNotTrack)) ||
      (navigator && isTrue((navigator as any).msDoNotTrack)) ||
      (window.external &&
        (window.external as any).msTrackingProtectionEnabled &&
        (window.external as any).msTrackingProtectionEnabled()),
  )
}

const d = root.domain()

// userId - это глобальное состояние, доступное всему приложению
// Флоу инициализации приложения гарантирует инициализацию юзера
// Части приложения, зависимые от пользователя просто не будут исполняться
// если юзера нет. Именно поэтому мы здесь кастим тип, чтобы не писать гору
// бессмысленных проверок во всех частях приложения
export const $userId = d.store<UserId>(null as unknown as UserId)
export const $newUser = d.store(false)
export const $isTrackingForbidden = d.store<boolean>(isTrackingForbidden())
export const onCreateUser = d.event<void>()
export const initUser = d.event<string | void>()
export const changeUserId = d.event<string>()
export const userReady = d.event<UserId>()
export const clearUser = d.event<void>()
