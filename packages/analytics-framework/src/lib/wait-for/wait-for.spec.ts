import { waitFor } from './index'

jest.useFakeTimers()

describe('waitFor', () => {
  test('set target and get it right away', done => {
    const target = 'target'
    const getTarget = () => !!target

    waitFor(getTarget)
      .then(isTargetExists => {
        expect(isTargetExists).toBe(true)
        done()
      })
      .catch(() => {
        fail('unexpected promise rejection')
      })

    jest.runAllTimers()
  })

  test('set target after wait called', done => {
    let target: string | null = null
    const getTarget = () => !!target

    waitFor(getTarget)
      .then(isTargetExists => {
        expect(isTargetExists).toBe(true)
        done()
      })
      .catch(() => {
        fail('unexpected promise rejection')
      })

    setTimeout(() => {
      target = 'target'
    }, 50)

    jest.runAllTimers()
  })

  test('expire', done => {
    const getTarget = () => false

    waitFor(getTarget, 100, 10)
      .then(isTargetExists => {
        expect(isTargetExists).toBe(false)
        done()
      })
      .catch(() => {
        fail('unexpected promise rejection')
      })

    jest.runAllTimers()
  })
})
