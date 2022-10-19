import { testFilter } from './index'

test('empty value', () => {
  expect(testFilter('any string')).toBe(true)
})

test('string filter', () => {
  expect(testFilter('any string', 'any')).toBe(true)
  expect(testFilter('any string', 'incorrect')).toBe(false)
})

test('regexp filter', () => {
  expect(testFilter('12345', /\d+/)).toBe(true)
  expect(testFilter('any string', /\d+/)).toBe(false)
})
