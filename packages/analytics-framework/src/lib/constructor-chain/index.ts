export const getConstructorChain = (target: any) => {
  const constructors: string[] = []

  const getConstructor = (currentTarget: any) => {
    const constructorName = currentTarget.constructor.name
    constructors.push(constructorName)

    if (constructorName !== 'Function' && constructorName !== 'Object') {
      getConstructor(Object.getPrototypeOf(currentTarget))
    }
  }

  try {
    getConstructor(Object.getPrototypeOf(target))
  } catch (err) {
    return []
  }

  return constructors
}
