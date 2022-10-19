export function onDomContentLoaded(callback: () => any): void {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => callback())
  } else {
    callback()
  }
}

export function onWindowLoaded(callback: () => void): void {
  if (document.readyState !== 'complete') {
    window.addEventListener('load', () => callback())
  } else {
    callback()
  }
}

export function onWindowUnloaded(callback: () => void): void {
  const listener = () => {
    callback()
    window.removeEventListener('unload', listener)
  }
  window.addEventListener('unload', listener, false)
}
