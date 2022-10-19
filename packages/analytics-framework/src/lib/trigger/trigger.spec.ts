import { allSettled, createDomain, fork } from 'effector'

import type { Pattern } from './index'
import { createTrigger } from './index'

const prepareTest = (sequence: Pattern<string>[]) => {
  const d = createDomain()
  const sourceEvent = d.event<string>()
  const targetEvent = d.event<void>()
  const targetWatcher = jest.fn()
  targetEvent.watch(targetWatcher)

  createTrigger({
    source: sourceEvent,
    getEventId: (e: string) => e,
    sequence,
    target: targetEvent,
    domain: d,
  })

  const scope = fork(d)
  const callSource = (p: string) => allSettled(sourceEvent, { scope, params: p })

  return {
    targetWatcher,
    callSource,
  }
}

describe('createTrigger', () => {
  test('simple trigger sequence', async () => {
    const { callSource, targetWatcher } = prepareTest(['eventA', 'eventB', 'eventC'])

    await callSource('eventA')
    expect(targetWatcher.mock.calls.length).toBe(0)
    await callSource('eventB')
    expect(targetWatcher.mock.calls.length).toBe(0)
    await callSource('eventC')
    expect(targetWatcher.mock.calls.length).toBe(1)

    await callSource('eventC')
    expect(targetWatcher.mock.calls.length).toBe(1)
  })

  test("sequence with '*' trigger", async () => {
    const { callSource, targetWatcher } = prepareTest(['eventA', 'eventB', '*', 'eventC'])
    await callSource('eventA')
    await callSource('eventB')
    await callSource('anotherEvent')
    await callSource('eventC')

    expect(targetWatcher.mock.calls.length).toBe(1)
  })

  test('invalid events sequence', async () => {
    const { callSource, targetWatcher } = prepareTest(['eventA', 'eventB', 'eventC'])

    await callSource('eventA')
    await callSource('eventB')
    await callSource('anotherEvent')
    await callSource('eventC')
    await callSource('eventB')
    await callSource('eventC')
    await callSource('eventA')

    expect(targetWatcher.mock.calls.length).toBe(0)
  })

  test("sequence with '**' trigger", async () => {
    const { callSource, targetWatcher } = prepareTest(['eventA', '**', 'eventB', '**', 'eventC'])

    const events = [
      'eventA', // trigger
      'anotherEvent1',
      'anotherEvent2',
      'eventC',
      'eventB', // trigger
      'eventB',
      'eventA',
      'eventA',
      'eventA',
      'eventC', // trigger
    ]

    for (const event of events) {
      await callSource(event)
    }

    expect(targetWatcher.mock.calls.length).toBe(1)
  })

  test('sequence with regexp', async () => {
    const { callSource, targetWatcher } = prepareTest(['eventA', /event-\d+$/, 'eventB', 'eventC'])

    await callSource('eventA')
    await callSource('event-134123')
    await callSource('eventB')
    await callSource('eventC')

    expect(targetWatcher.mock.calls.length).toBe(1)
  })

  test('sequence advanced case', async () => {
    const { callSource, targetWatcher } = prepareTest([
      'eventA',
      /event-\d+$/,
      '**',
      /event-\d+$/,
      'eventB',
      '*',
      '**',
      '**',
      'eventC',
      '**',
    ])

    await callSource('eventA')
    await callSource('event-134123')
    await callSource('eventA')
    await callSource('eventA')
    await callSource('event-3423422222')
    await callSource('eventB')
    await callSource('anotherEvent')
    await callSource('anotherEvent')
    await callSource('anotherEvent')
    await callSource('anotherEvent')
    await callSource('eventC')
    expect(targetWatcher.mock.calls.length).toBe(0)
    await callSource('anotherEvent')
    expect(targetWatcher.mock.calls.length).toBe(1)
  })

  test('empty sequence', async () => {
    const { callSource, targetWatcher } = prepareTest([])

    await callSource('eventA')
    await callSource('eventB')
    await callSource('anotherEvent')

    expect(targetWatcher.mock.calls.length).toBe(0)
  })

  test("last pattern is '**'", async () => {
    const { callSource, targetWatcher } = prepareTest(['A', 'B', 'C', '**'])

    await callSource('A')
    await callSource('B')
    await callSource('C')
    await callSource('FFF')
    expect(targetWatcher.mock.calls.length).toBe(1)
    await callSource('DDD')
    expect(targetWatcher.mock.calls.length).toBe(2)
    await callSource('CCC')
    expect(targetWatcher.mock.calls.length).toBe(3)
  })

  test('trigger reset', async () => {
    const { callSource, targetWatcher } = prepareTest(['A', 'B', 'C', '*'])
    await callSource('A')
    await callSource('B')
    await callSource('C')
    await callSource('FFF')
    expect(targetWatcher.mock.calls.length).toBe(1)

    await callSource('A')
    expect(targetWatcher.mock.calls.length).toBe(1)
    await callSource('B')
    await callSource('C')
    await callSource('DDD')
    expect(targetWatcher.mock.calls.length).toBe(2)
  })
})
