import { parseQueryParams } from './index'

describe('url utils', () => {
  it('parse-query-params', () => {
    const examples = [
      {
        str: '?t=35&s=4',
        parsed: {
          t: '35',
          s: '4',
        },
      },
      {
        str: '?t=35&s=4&',
        parsed: {
          t: '35',
          s: '4',
        },
      },
      {
        str: '?t=35&s=4&arr[]=2&arr[]=3',
        parsed: {
          t: '35',
          s: '4',
          arr: ['2', '3'],
        },
      },
      {
        str: '',
        parsed: {},
      },
    ]

    for (const { str, parsed } of examples) {
      expect(parseQueryParams(str)).toEqual(parsed)
    }
  })
})
