export const os = (): string | null => {
  const userAgent = window.navigator.userAgent

  // TODO: Заменить на что-то посвежее
  // noinspection JSDeprecatedSymbols
  const platform = window.navigator.platform
  const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K']
  const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE']
  const iosPlatforms = ['iPhone', 'iPad', 'iPod']
  let os = null
  if (macosPlatforms.indexOf(platform) !== -1) {
    os = 'Mac OS'
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    os = 'iOS'
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    os = 'Windows'
  } else if (/Android/.test(userAgent)) {
    os = 'Android'
  } else if (/Linux/.test(platform)) {
    os = 'Linux'
  }

  return os
}

export const browser = (): string => {
  const win = window as any
  const test = (regexp: RegExp) => regexp.test(window.navigator.userAgent)
  switch (true) {
    case test(/edge/i):
      return 'edge'
    case test(/opr/i) && (!!win.opr || !!win.opera):
      return 'opera'
    case test(/chrome/i) && !!win.chrome:
      return 'chrome'
    case test(/trident/i):
      return 'ie'
    case test(/firefox/i):
      return 'firefox'
    case test(/safari/i):
      return 'safari'
    default:
      return 'other'
  }
}
