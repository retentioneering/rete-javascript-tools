import { getConstructorChain } from './index'

describe('getConstructorChain', () => {
  test('base objects', () => {
    expect(getConstructorChain(Function)).toEqual(['Function'])
    expect(getConstructorChain(Object)).toEqual(['Function'])
    expect(getConstructorChain(Array)).toEqual(['Function'])
  })

  test('primitives', () => {
    expect(getConstructorChain(() => undefined)).toEqual(['Function'])
    expect(getConstructorChain([])).toEqual(['Array', 'Object'])
    expect(getConstructorChain({})).toEqual(['Object'])
    expect(getConstructorChain(3)).toEqual(['Number', 'Object'])
    expect(getConstructorChain('some string')).toEqual(['String', 'Object'])
    expect(getConstructorChain(undefined)).toEqual([])
    expect(getConstructorChain(null)).toEqual([])
    expect(getConstructorChain(NaN)).toEqual(['Number', 'Object'])
    expect(getConstructorChain(Symbol())).toEqual(['Symbol', 'Object'])
  })

  test('classes', () => {
    class Parent {}
    class Child extends Parent {}
    const parent = new Parent()
    const child = new Child()

    expect(getConstructorChain(Child)).toEqual(['Function'])
    expect(getConstructorChain(child)).toEqual(['Child', 'Parent', 'Object'])
    expect(getConstructorChain(parent)).toEqual(['Parent', 'Object'])
  })
})
