import './init'

import { fireEvent } from '@testing-library/dom'

import { waitOnceEvent } from '~/lib/testing-helpers'
import type { DomEventsTrackerConfig } from '~/types'

import { domEventCaptured } from './model/public'
import { startTracking } from './start-tracking'

describe('startTracking', () => {
  test('track events', done => {
    const root = document.createElement('div')
    const form = document.createElement('form')
    root.appendChild(form)
    const button = document.createElement('button')
    form.appendChild(button)

    const trackerConfig: DomEventsTrackerConfig = {
      collections: [
        {
          name: 'main',
          rootSelector: 'form',
          events: [
            {
              selector: '*',
              name: 'something-clicked',
            },
          ],
        },
      ],
    }

    startTracking({
      rootElement: root,
      config: trackerConfig,
    })

    const unwatch = domEventCaptured.watch(() => {
      unwatch()
      done()
    })

    waitOnceEvent({
      element: button,
      eventType: 'click',
      onListenerAdded: () => fireEvent.click(button),
    })
  })
})
