import FingerprintJS from '@fingerprintjs/fingerprintjs'
import { dispatchCustomEvent, trackerInit } from '@rete/analytics-framework'
import { createEffect, forward } from 'effector'

const getFingerprintFx = createEffect(() => {
  // TODO: Should we try dynamic import?
  return FingerprintJS.load()
    .then(fp => fp.get())
    .then(({ visitorId }) => visitorId)
})

forward({
  from: trackerInit,
  to: getFingerprintFx,
})

forward({
  from: getFingerprintFx.doneData,
  to: dispatchCustomEvent.prepend((fingerprint: string) => ({
    type: 'custom-event',
    name: 'fingerprint',
    data: {
      fingerprint,
    },
  })),
})

export {}
