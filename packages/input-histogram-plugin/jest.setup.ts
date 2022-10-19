import '@testing-library/jest-dom'

import { expect } from '@jest/globals'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Expect {
      jsonMatching(value: any): void
    }

    interface Matchers<R> {
      jsonMatching(value: any): R
    }

    interface AsymmetricMatchers {
      jsonMatching(value: any): void
    }
  }
}

expect.extend({
  jsonMatching(...args) {
    // Just for TS/IDE reasons
    const [received, expected] = args

    return {
      message: () => {
        const printableReceived = this.utils.printReceived(received)
        const printableExpected = this.utils.printExpected(expected)

        return `expected ${printableExpected}, but received ${printableReceived}`
      },
      pass: this.equals(JSON.parse(received), expected),
    }
  },
})
