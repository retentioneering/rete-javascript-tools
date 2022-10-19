import { isIntStr } from './index'

describe('isIntStr', () => {
  test('isIntStr', () => {
    expect(isIntStr('3')).toBe(true)
    expect(isIntStr('3.0')).toBe(true)
    expect(isIntStr('NaN')).toBe(false)
    expect(isIntStr('null')).toBe(false)
    expect(isIntStr('undefined')).toBe(false)
    expect(isIntStr('3.4')).toBe(false)
  })
})
