type FuncFilter = (value: string) => boolean
export type StringFilter = string | RegExp | FuncFilter

export const testFilter = (value: string, filter?: StringFilter | null) => {
  if (!filter) {
    return true
  }
  if (typeof filter === 'string') {
    return value.indexOf(filter) !== -1
  }
  if (typeof filter === 'function') {
    return filter(value)
  }
  return filter.test(value)
}
