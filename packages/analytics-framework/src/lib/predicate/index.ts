import { getConstructorChain } from '~/lib/constructor-chain'

/*
  На некоторых сайтах можно встретить DOM элементы,
  созданные в других окнах (например внутри iframe с тем же origin что и у основного сайта)
  и помещенные в основной DOM.
  Такие элементы будут иметь цепочку прототипов с объектами своего окна (Object, EventTarget, ...)
  Для таких элементов проверка intanceof Element / HTMLELement будет давать результат false
  (так как они созданы конструкторами за пределами текущего окна)
  Поэтому, для детектирования таких элементов мы используем метод основанный
  на строковом сравнении названий конструкторов
  Такие элементы мы называем "alien"
*/

export function isAlienElement(target: any) {
  if (target instanceof Element) {
    return false
  }
  const constructors = getConstructorChain(target).reverse()
  return (
    constructors[0] === 'Object' &&
    constructors[1] === 'EventTarget' &&
    constructors[2] === 'Node' &&
    constructors[3] === 'Element'
  )
}

export function isAlienHTMLElement(target: any) {
  if (target instanceof HTMLElement) {
    return false
  }
  const constructors = getConstructorChain(target).reverse()
  return (
    constructors[0] === 'Object' &&
    constructors[1] === 'EventTarget' &&
    constructors[2] === 'Node' &&
    constructors[3] === 'Element' &&
    constructors[4] === 'HTMLElement'
  )
}

export function isAlientHTMLInputElement(target: any) {
  if (target instanceof HTMLElement) {
    return false
  }
  const constructors = getConstructorChain(target).reverse()
  return (
    constructors[0] === 'Object' &&
    constructors[1] === 'EventTarget' &&
    constructors[2] === 'Node' &&
    constructors[3] === 'Element' &&
    constructors[4] === 'HTMLElement' &&
    constructors[5] === 'HTMLInputElement'
  )
}

export function isElement(target: any, includeAlien = false) {
  const isNormalElement = target instanceof Element
  return includeAlien ? isNormalElement || isAlienElement(target) : isNormalElement
}

export function isHTMLElement(target: any, includeAlien = false) {
  const isNormalHTMLElement = target instanceof HTMLElement
  return includeAlien ? isNormalHTMLElement || isAlienHTMLElement(target) : isNormalHTMLElement
}

export function isHTMLInputElement(target: any, includeAlien = false) {
  const isNormalHTMLInputElement = target instanceof HTMLInputElement
  return includeAlien ? isNormalHTMLInputElement || isAlientHTMLInputElement(target) : isNormalHTMLInputElement
}
