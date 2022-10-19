import { fireEvent } from '@testing-library/dom'

import { waitOnceEvent } from '~/lib/testing-helpers'

import { createListenersManager } from './index'

describe('listen', () => {
  test('listen one event', async () => {
    const mockFunc = jest.fn()

    const root = document.createElement('div')
    const target = document.createElement('target')
    root.appendChild(target)

    const listenerManager = createListenersManager({
      onEvent: mockFunc,
    })

    listenerManager.listen(root)

    await waitOnceEvent({
      element: target,
      eventType: 'click',
      onListenerAdded: () => fireEvent.click(target),
    })

    expect(mockFunc.mock.calls.length).toBe(1)
    const payload = mockFunc.mock.calls[0][0]
    expect(payload.root).toBe(root)
    expect(payload.event.target).toBe(target)

    listenerManager.stopListening(root)

    await waitOnceEvent({
      element: target,
      eventType: 'click',
      onListenerAdded: () => fireEvent.click(target),
    })

    expect(mockFunc.mock.calls.length).toBe(1)
  })
})

describe('listenMany', () => {
  test('listen many events', async () => {
    const mockFunc = jest.fn()
    const listenerManager = createListenersManager({
      onEvent: mockFunc,
    })
    const first = document.createElement('div')
    const second = document.createElement('div')

    listenerManager.listenMany([first, second])

    await waitOnceEvent({
      element: first,
      eventType: 'click',
      onListenerAdded: () => fireEvent.click(first),
    })
    await waitOnceEvent({
      element: second,
      eventType: 'click',
      onListenerAdded: () => fireEvent.click(second),
    })
    expect(mockFunc.mock.calls.length).toBe(2)
  })
})
