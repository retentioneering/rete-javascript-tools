import CliTable from 'cli-table'
import { bold, green, white } from 'colorette'

import type { Info } from '~/contracts'
import { row } from '~/utils/row'

export const table = async (info: Info) => {
  const cliTable = new CliTable({
    head: [
      `${bold(white('File:'))} ${green(info.file)}`,
      bold(white('Current version')),
      bold(white(`Last version${info.lastVersion ? ` (${info.lastVersion})` : ''}`)),
      bold(white('Size diff')),
    ],
  })

  cliTable.push(row('Bundle size', info.bundleSize, info.bundleSizeBefore))

  if (info.minSize) {
    cliTable.push(row('Minified size', info.minSize, info.minSizeBefore))
  }

  if (info.gzipSize) {
    cliTable.push(row('Gzip size', info.gzipSize, info.gzipSizeBefore))
  }

  if (info.brotliSize) {
    cliTable.push(row('Brotli size', info.brotliSize, info.brotliSizeBefore))
  }

  return cliTable.toString()
}
