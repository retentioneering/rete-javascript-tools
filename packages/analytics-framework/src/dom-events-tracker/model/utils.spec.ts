import { fireEvent } from '@testing-library/dom'

import { createInput, waitOnceEvent } from '~/lib/testing-helpers'
import type { DomEventConfig } from '~/types'

import { extractTextContent, getElementType, getEventCustomName, getEventName, getEventValue, isMatched } from './utils'

const mockEventConfig = (): DomEventConfig => ({
  selector: '*',
})

describe('extractTextContent', () => {
  test('null value', () => {
    expect(extractTextContent(null)).toBe(null)
  })

  test('div element', () => {
    const div = document.createElement('div')
    div.innerHTML = 'internal text'
    expect(extractTextContent(div)).toBe('internal text')

    div.innerHTML = `
       <div>
          internal <span>text</span>
       </div>
    `

    expect(extractTextContent(div)?.trim()).toBe('internal text')
  })
})

describe('isMatched', () => {
  test('click event', async () => {
    const btn = document.createElement('button')
    btn.classList.add('btn', 'red')

    const event = await waitOnceEvent({
      element: btn,
      eventType: 'click',
      onListenerAdded: () => fireEvent.click(btn),
    })

    expect(
      isMatched({
        event,
        eventConfig: {
          selector: '.btn',
        },
      }),
    ).toBe(true)

    expect(
      isMatched({
        event,
        eventConfig: {
          pageFilter: '/invalid',
          selector: '.btn',
        },
      }),
    ).toBe(false)

    expect(
      isMatched({
        event,
        eventConfig: {
          pageFilter: 'localhost',
          selector: '.btn',
        },
      }),
    ).toBe(true)

    expect(
      isMatched({
        event,
        eventConfig: {
          exclude: '.red',
          selector: '.btn',
        },
      }),
    ).toBe(false)
  })
})

describe('getEventName', () => {
  test('button click', async () => {
    const btn = document.createElement('button')
    btn.classList.add('btn', 'red')

    const btnClickEvent = await waitOnceEvent({
      element: btn,
      eventType: 'click',
      onListenerAdded: () => fireEvent.click(btn),
    })

    expect(
      getEventName({
        event: btnClickEvent,
        eventConfig: {
          selector: '.btn',
        },
      }),
    ).toBe('btn_click')
  })

  test('input click & override event name', async () => {
    const input = document.createElement('input')
    input.classList.add('field')

    const inputClickEvent = await waitOnceEvent({
      element: input,
      eventType: 'click',
      onListenerAdded: () => fireEvent.click(input),
    })

    expect(
      getEventName({
        event: inputClickEvent,
        eventConfig: {
          selector: '.field',
        },
      }),
    ).toBe('text_click')

    expect(
      getEventName({
        event: inputClickEvent,
        eventConfig: {
          name: 'custom-name',
          selector: '.field',
        },
      }),
    ).toBe('custom-name')
  })
})

describe('getElementType', () => {
  test('links', () => {
    expect(getElementType(document.createElement('a'))).toBe('link')
  })

  test('select', () => {
    expect(getElementType(document.createElement('select'))).toBe('select')
  })

  test('textarea', () => {
    expect(getElementType(document.createElement('textarea'))).toBe('text')
  })

  test('inputs', () => {
    const textInput = createInput('text')
    expect(getElementType(textInput)).toBe('text')

    const checkbox = createInput('checkbox')
    expect(getElementType(checkbox)).toBe('checkbox')

    const radio = createInput('radio')
    expect(getElementType(radio)).toBe('radio')

    const number = createInput('number')
    expect(getElementType(number)).toBe('number')
  })

  test('other html element', () => {
    expect(getElementType(document.createElement('div'))).toBe('other')
  })
})

describe('getEventValue', () => {
  test('links', () => {
    const link = document.createElement('a')
    link.textContent = 'click me!'

    expect(
      getEventValue({
        element: link,
        eventConfig: mockEventConfig(),
      }),
    ).toBe('click me!')
  })

  test('buttons', () => {
    const btn = document.createElement('button')
    btn.textContent = 'click me!'

    expect(
      getEventValue({
        element: btn,
        eventConfig: mockEventConfig(),
      }),
    ).toBe('click me!')
  })

  test('text input', () => {
    const textInput = createInput('text')
    textInput.value = 'some value'

    expect(
      getEventValue({
        element: textInput,
        eventConfig: mockEventConfig(),
      }),
    ).toBe('some value')
  })

  test('textarea', () => {
    const textArea = document.createElement('textarea')
    textArea.value = 'some value'
    expect(
      getEventValue({
        element: textArea,
        eventConfig: mockEventConfig(),
      }),
    ).toBe('some value')
  })

  test('checkbox', () => {
    const eventConfig = mockEventConfig()
    const checkboxWrap = document.createElement('div')
    checkboxWrap.innerHTML = `
      <label>
        <input type='checkbox' value='policy' />
        Agree
      </label>
    `
    const checkbox = checkboxWrap.querySelector('input')
    if (!checkbox) {
      fail('it should not reach here')
      return
    }
    checkbox.checked = true
    expect(
      getEventValue({
        element: checkbox,
        eventConfig,
      }),
    ).toBe('on:Agree')

    checkbox.checked = false
    expect(
      getEventValue({
        element: checkbox,
        eventConfig,
      }),
    ).toBe('off:Agree')
  })

  test('radio buttons', () => {
    const eventConfig = mockEventConfig()
    const radioWrap = document.createElement('div')
    radioWrap.innerHTML = `
      <label>
        <input id="red" type="radio" name="color" value="red">
        Red
      </label>
      <label>
        <input id="green" type="radio" name="color" value="green">
        Green
      </label>
    `
    const red = radioWrap.querySelector('#red') as HTMLInputElement
    const green = radioWrap.querySelector('#green') as HTMLInputElement
    if (!red || !green) {
      fail('it should not reach here')
      return
    }
    red.checked = true
    expect(
      getEventValue({
        element: red,
        eventConfig,
      }),
    ).toBe('on:Red')
    expect(
      getEventValue({
        element: green,
        eventConfig,
      }),
    ).toBe('off:Green')

    green.checked = true
    expect(
      getEventValue({
        element: red,
        eventConfig,
      }),
    ).toBe('off:Red')
    expect(
      getEventValue({
        element: green,
        eventConfig,
      }),
    ).toBe('on:Green')
  })

  test('div element', () => {
    const div = document.createElement('div')
    div.textContent = 'test'
    expect(
      getEventValue({
        element: div,
        eventConfig: mockEventConfig(),
      }),
    ).toBe('test')
  })
})

describe('getEventCustomName', () => {
  test('from config', () => {
    const customName = getEventCustomName({
      element: document.createElement('div'),
      eventConfig: {
        selector: '*',
        eventCustomName: 'my-custom-event',
      },
    })

    expect(customName).toBe('my-custom-event')
  })

  test('from data attr', () => {
    const div = document.createElement('div')
    div.innerHTML = `
      <div id="target" data-rete-event-custom-name='very-important-button'>
      </div>
    `
    const targetElement = div.querySelector('#target')
    if (!targetElement) {
      fail('it should not reach here')
      return
    }

    const customName = getEventCustomName({
      element: targetElement,
      eventConfig: {
        selector: '*',
        eventCustomName: 'my-custom-event',
      },
    })

    expect(customName).toBe('very-important-button')
  })

  test('without custom name', () => {
    const div = document.createElement('div')
    const customName = getEventCustomName({
      element: div,
      eventConfig: {
        selector: '*',
      },
    })
    expect(customName).toBeUndefined()
  })
})
