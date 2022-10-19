import { forward } from 'effector'

import type { PageStateEvent, PerfInfo } from '~/types'

import { getPerfInfoFx } from './private'
import { eventCaptured, onDomContentLoaded, onWindowLoaded, onWindowUnloaded } from './public'
import { getPerfInfo } from './utils'

forward({
  from: onDomContentLoaded,
  to: getPerfInfoFx.prepend(() => ({
    pageStage: 'dom_content_loaded',
  })),
})

forward({
  from: onWindowLoaded,
  to: getPerfInfoFx.prepend(() => ({
    pageStage: 'window_loaded',
  })),
})

forward({
  from: getPerfInfoFx.doneData.map(({ pageStage, perfInfo }) => {
    const event: PageStateEvent = {
      name: pageStage,
      type: 'page-state',
      data: {
        stage: pageStage,
        perfInfo: perfInfo,
      },
    }

    return event
  }),
  to: eventCaptured,
})

forward({
  from: onWindowUnloaded,
  to: eventCaptured.prepend(() => ({
    name: 'window_unloaded',
    type: 'page-state',
    data: {
      stage: 'window_unloaded',
    },
  })),
})

getPerfInfoFx.use(({ pageStage }) => {
  let perfInfo: PerfInfo | undefined

  try {
    perfInfo = getPerfInfo()
  } catch (error) {
    console.warn(error)
  }

  return {
    pageStage,
    ...(perfInfo && { perfInfo }),
  }
})
