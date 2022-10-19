import { filesize } from 'filesize'

import type { FileSizeOutputResult } from '~/contracts'

export const formatSize = (value: number): FileSizeOutputResult => {
  return filesize(value, { output: 'array', exponent: 0 }) as any
}
