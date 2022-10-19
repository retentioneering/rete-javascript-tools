import type { Domain, Unit } from 'effector'
import { guard, sample } from 'effector'

import { root } from '~/effector-root'

type FilterFunc<E> = (event: E) => boolean

export type Pattern<E> = string | '*' | '**' | RegExp | FilterFunc<E>

export type CreateTriggerParams<E> = {
  source: Unit<E>
  sequence: Pattern<E>[]
  getEventId: (e: E) => string
  target: Unit<void>
  domain?: Domain
}

type HandleEventParams<E> = {
  initialPatternIndex: number | null
  event: E
}

type HandleEventResult = {
  lastMatchedPatternIndex: number | null
  triggered: boolean
}

/*
  source - источник событий
  target - целевое событие
  Фабрика связывает источник событий с целевым событием таким обраом,
  что эмит целевого события происходит каждый раз когда payload последних N
  событий удовлтеоряет последовательности заданной в sequence
*/
export const createTrigger = <E>({ source, getEventId, sequence, target, domain }: CreateTriggerParams<E>) => {
  const d = domain || root.domain()

  const handleEventFx = d.effect<HandleEventParams<E>, HandleEventResult>()
  const $lastMatchedPatternIndex = d.store<number | null>(null)

  $lastMatchedPatternIndex.on(handleEventFx.doneData, (_, { lastMatchedPatternIndex }) => lastMatchedPatternIndex)

  sample({
    source: $lastMatchedPatternIndex,
    clock: source,
    fn: (initialPatternIndex, event) => ({
      initialPatternIndex,
      event,
    }),
    target: handleEventFx,
  })

  guard({
    source: handleEventFx.doneData,
    filter: ({ triggered }) => triggered,
    target: target,
  })

  handleEventFx.use(({ initialPatternIndex, event }) => {
    let lastMatchedPatternIndex = initialPatternIndex

    const testPattern = (event: E, lastPatternIndex?: number | null, doNotIncrement?: boolean): boolean => {
      if (!sequence.length) {
        return false
      }

      const lastPattern = sequence[sequence.length - 1]

      let currentPatternIndex =
        typeof lastPatternIndex === 'number'
          ? lastPatternIndex
          : lastMatchedPatternIndex !== null
          ? lastMatchedPatternIndex + 1
          : 0

      if (lastPattern !== '**' && currentPatternIndex > sequence.length - 1) {
        currentPatternIndex = 0
      }

      if (lastPattern === '**' && currentPatternIndex > sequence.length - 1) {
        currentPatternIndex = sequence.length - 1
      }

      const currentPattern = sequence[currentPatternIndex]
      const isCurrentPatternLast = currentPatternIndex === sequence.length - 1

      if (currentPattern === '*') {
        lastMatchedPatternIndex = currentPatternIndex
        return isCurrentPatternLast
      }

      if (currentPattern === '**' && isCurrentPatternLast) {
        lastMatchedPatternIndex = currentPatternIndex
        return true
      }

      if (currentPattern === '**') {
        const nextPatternIndex = currentPatternIndex + 1
        return testPattern(event, nextPatternIndex, true)
      }

      let isCurrentPattenMatched = false

      if (currentPattern instanceof RegExp) {
        isCurrentPattenMatched = currentPattern.test(getEventId(event))
      }

      if (typeof currentPattern === 'string') {
        isCurrentPattenMatched = currentPattern === getEventId(event)
      }

      if (typeof currentPattern === 'function') {
        isCurrentPattenMatched = currentPattern(event)
      }

      if (isCurrentPattenMatched) {
        lastMatchedPatternIndex = currentPatternIndex
      }

      if (isCurrentPattenMatched && isCurrentPatternLast) {
        return true
      }

      if (!isCurrentPattenMatched && !doNotIncrement) {
        lastMatchedPatternIndex = null
      }

      return false
    }

    const triggered = testPattern(event)

    return {
      lastMatchedPatternIndex,
      triggered,
    }
  })
}
