import { combine, guard, sample } from 'effector'

import { testFilter } from '~/lib/string-filter'
import type { DomObserverEvent } from '~/types'

import type { CaptureEventResult } from './private'
import { $configs, $lastResults, captureEventFx, onDomCollected } from './private'
import { eventCaptured, initDomObservers } from './public'

const serializeParseResult = (collect: any) => {
  const isObject = typeof collect === 'object'
  if (!isObject) {
    return String(collect)
  }
  return JSON.stringify(collect)
}

$lastResults.on(captureEventFx.doneData, (results, { config, duplicate, serializedResult }) => {
  const disableDuplicateChecking = Boolean(typeof config.params === 'object' && config.params.disableDuplicateChecking)

  if (disableDuplicateChecking || !duplicate) {
    const updated = { ...results }
    updated[config.config.name] = serializedResult
    return updated
  }

  return results
})

$configs.on(initDomObservers, (_, configs) => configs)

sample({
  source: combine({
    configs: $configs,
    lastResults: $lastResults,
  }),
  clock: onDomCollected,
  fn: ({ configs, lastResults }, domCollectedPayload) => ({
    configs,
    lastResults,
    domCollectedPayload,
  }),
  target: captureEventFx,
})

guard({
  source: captureEventFx.doneData,
  filter: ({ config, url, duplicate, parseResult }) => {
    const { params } = config

    if (params?.doNotSendEmptyResults && parseResult === null) {
      return false
    }

    if (!testFilter(url, config.params?.pageFilter)) {
      return false
    }

    const disableDuplicateChecking = Boolean(
      typeof config.params === 'object' && config.params.disableDuplicateChecking,
    )

    return disableDuplicateChecking || !duplicate
  },
  target: eventCaptured.prepend(({ event }: CaptureEventResult) => event),
})

captureEventFx.use(({ configs, lastResults, domCollectedPayload }) => {
  const config = configs.find(({ config }) => config.name === domCollectedPayload.name)

  if (!config) {
    throw new Error('dom observer config not found!')
  }

  const lastResult = lastResults[config.config.name]
  const url = window.location.href
  const serializedResult = serializeParseResult(domCollectedPayload.parseResult)
  const duplicate = lastResult === serializedResult

  const event: DomObserverEvent = {
    name: config.config.name,
    type: 'dom-observer',
    data: domCollectedPayload.parseResult,
    endpointsOptions: config.endpointOptions,
  }

  return {
    event,
    config,
    url,
    duplicate,
    serializedResult,
    parseResult: domCollectedPayload.parseResult,
  }
})
