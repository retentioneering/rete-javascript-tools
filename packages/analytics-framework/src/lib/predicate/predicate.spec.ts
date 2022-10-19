import { isAlienElement, isElement } from './index'

describe('isAlienElement', () => {
  test('is alien element', () => {
    class EventTarget {}
    class Node extends EventTarget {}
    class Element extends Node {}

    const element = new Element()

    expect(isAlienElement(element)).toEqual(true)
  })

  test('normal element', () => {
    expect(isAlienElement(document.createElement('div'))).toEqual(false)
  })
})

describe('isElement', () => {
  test('is alien element', () => {
    class EventTarget {}
    class Node extends EventTarget {}
    class Element extends Node {}

    const alien = new Element()
    expect(isElement(alien, false)).toEqual(false)
    expect(isElement(alien, true)).toEqual(true)
  })

  test('normal element', () => {
    const normalElement = document.createElement('div')
    expect(isElement(normalElement, false)).toEqual(true)
    expect(isElement(normalElement, true)).toEqual(true)
  })
})
