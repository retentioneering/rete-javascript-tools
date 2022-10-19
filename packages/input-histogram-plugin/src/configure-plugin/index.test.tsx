import * as Framework from '@rete/analytics-framework'
import { createEvent, fireEvent } from '@testing-library/dom'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'

import { configureInputHistogramPlugin } from '~/configure-plugin/index'
import { TEST_HISTOGRAM, TEST_INPUT_TIMESTAMPS_MS, TEST_TARGET_INTERVALS_SECONDS } from '~/mocks'

describe('Tests for plugin configuration', () => {
  it('should work correctly', async () => {
    const EVENT_NAME = 'histogram-event'
    const INPUT_ID = 'input'

    const spyOnDispatchCustomEvent = jest.spyOn(Framework, 'dispatchCustomEvent')

    const enablePlugin = configureInputHistogramPlugin({
      selectors: [`#${INPUT_ID}`],
      eventName: EVENT_NAME,
      targetIntervals: TEST_TARGET_INTERVALS_SECONDS,
    })

    enablePlugin()

    const user = userEvent.setup()

    const { getByRole } = render(
      <div>
        <input id={INPUT_ID} type='text' />
        <button type='button'>BUTTON</button>
      </div>,
    )

    const inputElement = getByRole('textbox')

    // Simulate `click` and `focus` and `input` events
    await user.click(inputElement)

    // Simulate `input` events
    TEST_INPUT_TIMESTAMPS_MS.forEach(value => {
      const nativeEvent = Object.defineProperty(createEvent.input(inputElement), 'timeStamp', { value })
      fireEvent(inputElement, nativeEvent)
    })

    expect(spyOnDispatchCustomEvent).not.toBeCalled()

    // Simulate `blur` event
    await user.click(getByRole('button'))

    expect(spyOnDispatchCustomEvent).toBeCalledTimes(1)

    expect(spyOnDispatchCustomEvent).nthCalledWith(1, {
      type: 'custom-event',
      name: EVENT_NAME,
      data: {
        eventTrigger: 'div > div > input#input[type="text"]',
        eventValue: TEST_HISTOGRAM,
      },
    })
  })
})
