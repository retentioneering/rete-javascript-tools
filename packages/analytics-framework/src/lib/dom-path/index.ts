const getName = (element: Element): string | null => {
  if (typeof (element as any).name === 'string') {
    return (element as any).name
  }

  return null
}

/*
  Get selector for XPath
*/
const getXpathPart = (element: Element, windowEnv: Window = window): string => {
  const HtmlInputConstructor: typeof HTMLInputElement = (windowEnv as any).HTMLInputElement
  let selector = element.tagName.toLowerCase()
  if (element.id) {
    selector += `#${element.id}`
  }

  const className = element.getAttribute('class')
  if (className && className.trim()) {
    selector += `.${className.trim().split(/\s+/).join('.')}`
  }

  if (element instanceof HtmlInputConstructor) {
    selector += `[type="${element.type}"]`
  }

  const name = getName(element)

  if (name) {
    selector += `[name="${name}"]`
  }

  return selector
}

/*
  Collect XPath for the whole parent tree
*/
export const getXpath = (element: Element, windowEnv: Window = window): string => {
  const xpath = []
  let current: Element | null = element
  while (current && current !== document.body) {
    xpath.unshift(getXpathPart(current, windowEnv))
    current = current.parentElement
  }
  return xpath.join(' > ')
}

/*
  Tries to get any kind of trigger identification
*/
// eslint-disable-next-line max-len
export const getDomPath = (
  element: Element,
  rootElement: Element | Document = document,
  windowEnv: Window = window,
) => {
  const xpath = getXpath(element, windowEnv)
  let brothers: NodeListOf<HTMLElement>
  try {
    brothers = rootElement.querySelectorAll<HTMLElement>(xpath)
  } catch (err) {
    return
  }

  if (brothers.length < 2) {
    // use original xpath
    return xpath
  } else {
    // add element number, e.g. | [2/3] means "3 elements on page, this is
    // the 2nd"
    let index = null
    for (let i = 0; i < brothers.length; i++) {
      if (brothers[i] === element) {
        index = i
      }
    }

    return index ? `${xpath} | [${index + 1}/${brothers.length}]` : xpath
  }
}

const getParents = (element: Element, parents: Element[] = []): Element[] => {
  parents.unshift(element)

  if (element.tagName === 'HTML') {
    return parents
  }

  const parent = element.parentElement

  if (parent) {
    return getParents(parent, parents)
  }

  return parents
}

export const getCssClassPath = (element: Element) => {
  const selectors = getParents(element).map(element => {
    const className = element.getAttribute('class')

    if (!element.classList.length || !className) {
      return element.tagName.toLocaleLowerCase()
    }

    return `.${className.trim().split(/\s+/).join('.')}`
  })

  return selectors.join(' > ')
}
