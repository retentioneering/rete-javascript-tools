import * as listen from '~/lib/page-state'

import { onDomContentLoaded, onWindowLoaded, onWindowUnloaded } from './model/public'

export const startTracking = () => {
  listen.onDomContentLoaded(() => onDomContentLoaded())
  listen.onWindowLoaded(() => onWindowLoaded())
  listen.onWindowUnloaded(() => onWindowUnloaded())
}
