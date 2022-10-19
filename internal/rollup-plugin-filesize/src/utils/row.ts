import { cyan, green, red, white } from 'colorette'

import type { FileSizeOutputResult } from '~/contracts'

export const row = (title: string, sizeCurrent: FileSizeOutputResult, sizeBefore?: FileSizeOutputResult) => {
  const size = [cyan(sizeCurrent.join(' '))]

  if (sizeBefore) {
    size.push(cyan(sizeBefore.join(' ')))

    const [valueCurrent, symbol] = sizeCurrent
    const [valueBefore] = sizeBefore

    const diff = valueCurrent - valueBefore

    size.push(diff > 0 ? red(`+${diff} ${symbol}`) : green(`${diff} ${symbol}`))
  }

  return { [white(title)]: size }
}
