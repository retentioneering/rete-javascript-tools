import './init'

import { fireEvent } from '@testing-library/dom'
import { allSettled, fork } from 'effector'

import { root as rootDomain } from '~/effector-root'
import { waitOnceEvent } from '~/lib/testing-helpers'
import type { DomEventsTrackerConfig } from '~/types'

import {
  addCollectionToStart,
  addEventConfigToStart,
  captureEvent,
  domEventCaptured,
  setDomEventsTrackerConfig,
} from './public'

const createDomSample = () => {
  const root = document.createElement('div')
  root.id = 'root'
  root.innerHTML = `
    <form class="form">
      <button class="important-btn">Click me!</button>
      <button class="simple-btn">Click me!</button>
    </form>
  `

  const importantBtn = root.querySelector('.important-btn') as HTMLElement
  const simpleBtn = root.querySelector('.simple-btn') as HTMLElement
  const form = root.querySelector('form') as HTMLElement

  return {
    root,
    form,
    importantBtn,
    simpleBtn,
  }
}

describe('tracking', () => {
  test('track events', async () => {
    const onCaptured = jest.fn()
    const clearWatch = domEventCaptured.watch(onCaptured)

    const scope = fork(rootDomain)
    const { form, importantBtn, simpleBtn } = createDomSample()

    if (!importantBtn || !simpleBtn || !form) {
      fail('it should not reach here')
      return
    }

    const importantBtnConfig = {
      eventCustomName: 'very-important-btn',
      selector: '.important-btn',
    }
    const simpleBtnConfig = {
      eventCustomName: 'some-btn',
      selector: 'button',
    }

    const trackingConfig: DomEventsTrackerConfig = {
      collections: [
        {
          rootSelector: '.form',
          name: 'main',
          events: [importantBtnConfig, simpleBtnConfig],
        },
      ],
    }

    await allSettled(setDomEventsTrackerConfig, {
      scope,
      params: trackingConfig,
    })

    const importantBtnClick = await waitOnceEvent({
      element: importantBtn,
      eventType: 'click',
      onListenerAdded: () => fireEvent.click(importantBtn),
    })

    await allSettled(captureEvent, {
      scope,
      params: {
        event: importantBtnClick,
        root: form,
      },
    })

    expect(onCaptured.mock.calls.length).toBe(1)
    expect(onCaptured.mock.calls[0][0]).toEqual({
      type: 'dom-event',
      name: 'important-btn_click',
      data: {
        eventName: 'important-btn_click',
        eventCustomName: 'very-important-btn',
        eventValue: 'Click me!',
        eventTrigger: 'div#root > form.form > button.important-btn',
        extensiveEventTrigger: 'div > .form > .important-btn',
        eventConfig: importantBtnConfig,
      },
    })

    const simpleBtnClick = await waitOnceEvent({
      element: simpleBtn,
      eventType: 'click',
      onListenerAdded: () => fireEvent.click(simpleBtn),
    })

    await allSettled(captureEvent, {
      scope,
      params: {
        event: simpleBtnClick,
        root: form,
      },
    })

    expect(onCaptured.mock.calls.length).toBe(2)
    expect(onCaptured.mock.calls[1][0]).toEqual({
      type: 'dom-event',
      name: 'button_click',
      data: {
        eventName: 'button_click',
        eventCustomName: 'some-btn',
        eventValue: 'Click me!',
        eventTrigger: 'div#root > form.form > button.simple-btn',
        extensiveEventTrigger: 'div > .form > .simple-btn',
        eventConfig: simpleBtnConfig,
      },
    })

    clearWatch()
  })

  test('add event config after tracking started', async () => {
    const onCaptured = jest.fn()
    const clearWatch = domEventCaptured.watch(onCaptured)

    const scope = fork(rootDomain)

    const { form, importantBtn, simpleBtn } = createDomSample()

    if (!importantBtn || !simpleBtn || !form) {
      fail('it should not reach here')
      return
    }

    const simpleBtnConfig = {
      eventCustomName: 'some-btn',
      selector: 'button',
    }

    const trackingConfig: DomEventsTrackerConfig = {
      collections: [
        {
          rootSelector: '.form',
          name: 'main',
          events: [simpleBtnConfig],
        },
      ],
    }

    await allSettled(setDomEventsTrackerConfig, {
      scope,
      params: trackingConfig,
    })

    const firstClick = await waitOnceEvent({
      element: importantBtn,
      eventType: 'click',
      onListenerAdded: () => fireEvent.click(importantBtn),
    })

    await allSettled(captureEvent, {
      scope,
      params: {
        event: firstClick,
        root: form,
      },
    })

    expect(onCaptured.mock.calls.length).toBe(1)
    expect(onCaptured.mock.calls[0][0]).toEqual({
      type: 'dom-event',
      name: 'button_click',
      data: {
        eventName: 'button_click',
        eventCustomName: 'some-btn',
        eventValue: 'Click me!',
        eventTrigger: 'div#root > form.form > button.important-btn',
        extensiveEventTrigger: 'div > .form > .important-btn',
        eventConfig: simpleBtnConfig,
      },
    })

    const importantBtnConfig = {
      eventCustomName: 'very-important-btn',
      selector: '.important-btn',
    }

    await allSettled(addEventConfigToStart, {
      scope,
      params: {
        collectionName: 'main',
        eventConfig: importantBtnConfig,
      },
    })

    const secondClick = await waitOnceEvent({
      element: importantBtn,
      eventType: 'click',
      onListenerAdded: () => fireEvent.click(importantBtn),
    })

    await allSettled(captureEvent, {
      scope,
      params: {
        event: secondClick,
        root: form,
      },
    })

    expect(onCaptured.mock.calls.length).toBe(2)
    expect(onCaptured.mock.calls[1][0]).toEqual({
      type: 'dom-event',
      name: 'important-btn_click',
      data: {
        eventName: 'important-btn_click',
        eventCustomName: 'very-important-btn',
        eventValue: 'Click me!',
        eventTrigger: 'div#root > form.form > button.important-btn',
        extensiveEventTrigger: 'div > .form > .important-btn',
        eventConfig: importantBtnConfig,
      },
    })

    clearWatch()
  })

  // test two collection
  test('two collection match element', async () => {
    const onCaptured = jest.fn()
    const clearWatch = domEventCaptured.watch(onCaptured)

    const scope = fork(rootDomain)
    const { form, importantBtn, simpleBtn } = createDomSample()

    if (!importantBtn || !simpleBtn || !form) {
      fail('it should not reach here')
      return
    }

    const importantBtnConfig = {
      eventCustomName: 'very-important-btn',
      selector: '.important-btn',
    }
    const simpleBtnConfig = {
      eventCustomName: 'some-btn',
      selector: 'button',
    }

    const trackingConfig: DomEventsTrackerConfig = {
      collections: [
        {
          rootSelector: '.form',
          name: 'main',
          events: [importantBtnConfig],
        },
        {
          rootSelector: '.form',
          name: 'default',
          events: [simpleBtnConfig],
        },
      ],
    }

    await allSettled(setDomEventsTrackerConfig, {
      scope,
      params: trackingConfig,
    })

    const importantBtnClick = await waitOnceEvent({
      element: importantBtn,
      eventType: 'click',
      onListenerAdded: () => fireEvent.click(importantBtn),
    })

    await allSettled(captureEvent, {
      scope,
      params: {
        event: importantBtnClick,
        root: form,
      },
    })

    expect(onCaptured.mock.calls.length).toBe(1)
    expect(onCaptured.mock.calls[0][0]).toEqual({
      type: 'dom-event',
      name: 'important-btn_click',
      data: {
        eventName: 'important-btn_click',
        eventCustomName: 'very-important-btn',
        eventValue: 'Click me!',
        eventTrigger: 'div#root > form.form > button.important-btn',
        extensiveEventTrigger: 'div > .form > .important-btn',
        eventConfig: importantBtnConfig,
      },
    })

    clearWatch()
  })

  test('add collection', async () => {
    const onCaptured = jest.fn()
    const clearWatch = domEventCaptured.watch(onCaptured)

    const scope = fork(rootDomain)
    const { form, importantBtn, simpleBtn } = createDomSample()

    if (!importantBtn || !simpleBtn || !form) {
      fail('it should not reach here')
      return
    }

    const trackingConfig: DomEventsTrackerConfig = {
      collections: [
        {
          name: 'default',
          rootSelector: 'form',
          events: [
            {
              selector: 'button',
              eventCustomName: 'some-event',
            },
          ],
        },
      ],
    }

    await allSettled(setDomEventsTrackerConfig, {
      scope,
      params: trackingConfig,
    })

    const importantBtnConfig = {
      eventCustomName: 'very-important-btn',
      selector: '.important-btn',
    }

    await allSettled(addCollectionToStart, {
      scope,
      params: {
        name: 'custom-collection',
        rootSelector: '.form',
        events: [importantBtnConfig],
      },
    })

    const importantBtnClick = await waitOnceEvent({
      element: importantBtn,
      eventType: 'click',
      onListenerAdded: () => fireEvent.click(importantBtn),
    })

    await allSettled(captureEvent, {
      scope,
      params: {
        event: importantBtnClick,
        root: form,
      },
    })

    expect(onCaptured.mock.calls.length).toBe(1)
    expect(onCaptured.mock.calls[0][0]).toEqual({
      type: 'dom-event',
      name: 'important-btn_click',
      data: {
        eventName: 'important-btn_click',
        eventCustomName: 'very-important-btn',
        eventValue: 'Click me!',
        eventTrigger: 'div#root > form.form > button.important-btn',
        extensiveEventTrigger: 'div > .form > .important-btn',
        eventConfig: importantBtnConfig,
      },
    })

    clearWatch()
  })
})
