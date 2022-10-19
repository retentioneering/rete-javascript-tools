const getXpathPart = (element: Record<string, any>): string => {
  let selector = element.tagName.toLowerCase()

  if (element.id) {
    selector += `#${element.id}`
  }

  if (typeof element.className === 'string') {
    const className = element.className.trim()

    if (className) {
      selector += `.${element.className.trim().split(/\s+/).join('.')}`
    }
  }

  if (element.type) {
    selector += `[type="${element.type}"]`
  }

  if (element.name) {
    selector += `[name="${element.name}"]`
  }

  return selector
}

const getXpath = <E extends HTMLElement = HTMLElement>(element: E): string => {
  const xpath = []

  let current: HTMLElement | null = element

  while (current && current !== document.body) {
    xpath.unshift(getXpathPart(current))

    current = current.parentElement
  }

  return xpath.join(' > ')
}

export const getEventTrigger = <E extends HTMLElement = HTMLElement>(element: E): string => {
  const xpath = getXpath(element)

  let nodeList: NodeListOf<HTMLElement>

  try {
    nodeList = document.querySelectorAll<HTMLElement>(xpath)
  } catch (error) {
    console.error(error)
    return ''
  }

  const nodeListLength = nodeList.length

  if (nodeListLength < 2) {
    return xpath
  }

  // Add element number, e.g. | [2/3] means "3 elements on page, this is the 2nd"
  let index: number | undefined

  for (let currentIndex = 0; currentIndex < nodeListLength; currentIndex += 1) {
    if (nodeList[currentIndex] === element) {
      index = currentIndex
    }
  }

  return index ? `${xpath} | [${index + 1}/${nodeListLength}]` : xpath
}
