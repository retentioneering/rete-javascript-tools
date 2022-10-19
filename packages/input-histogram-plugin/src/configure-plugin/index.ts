import { dispatchCustomEvent, onDomContentLoaded } from '@rete/analytics-framework'

import { createHistogram } from '~/create-histogram'
import { getEventTrigger } from '~/event-trigger'
import type { Config, ConfigureInputHistogramPlugin } from '~/index'

const runPlugin = ({ selectors, eventName, targetIntervals }: Config): void => {
  let currentInputTimestampsMs: number[] = []

  let currentInputElement: HTMLElement | undefined

  const isTrackedInput = (input: HTMLInputElement): boolean => {
    return selectors.some(selector => input.matches(selector))
  }

  const handleFocus = (evt: FocusEvent): void => {
    currentInputTimestampsMs = []

    const input = evt.target as HTMLInputElement | null

    if (input && isTrackedInput(input)) {
      currentInputElement = input
    } else {
      currentInputElement = undefined
    }
  }

  const handleInput = (evt: Event): void => {
    if (currentInputElement) {
      currentInputTimestampsMs.push(evt.timeStamp)
    }
  }

  const handleBlur = () => {
    if (currentInputElement && currentInputTimestampsMs.length) {
      dispatchCustomEvent({
        type: 'custom-event',
        name: eventName,
        data: {
          eventTrigger: getEventTrigger(currentInputElement),
          eventValue: createHistogram(currentInputTimestampsMs, targetIntervals),
        },
      })

      currentInputElement = undefined
    }
  }

  document.body.addEventListener('focus', handleFocus, true)

  document.body.addEventListener('input', handleInput, true)

  document.body.addEventListener('blur', handleBlur, true)
}

export const configureInputHistogramPlugin: ConfigureInputHistogramPlugin = config => {
  return () => {
    if (document.readyState === 'loading') {
      // TODO: Check this in real life
      const unsubscribe = onDomContentLoaded.watch(() => {
        runPlugin(config)

        // Handle this event once
        unsubscribe()
      })
    } else {
      runPlugin(config)
    }
  }
}
