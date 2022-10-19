import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import * as process from 'node:process'

import pacote from 'pacote'
import type { NormalizedOutputOptions, OutputChunk, OutputPlugin } from 'rollup'
import { minify } from 'terser'

import type { Info } from '~/contracts'
import { brotliSize } from '~/utils/brotli-size'
import { formatSize } from '~/utils/format-size'
import { gzipSize } from '~/utils/gzip-size'
import { table } from '~/utils/table'

const getStrings = async (outputOptions: NormalizedOutputOptions, chunk: OutputChunk) => {
  const info: Info = {
    file: outputOptions.file || 'N/A',
    bundleSize: formatSize(Buffer.byteLength(chunk.code)),
    brotliSize: formatSize(await brotliSize(chunk.code)),
  }

  const url = new URL(path.join(process.cwd(), './package.json'), import.meta.url)

  const { name } = JSON.parse(await readFile(url, 'utf-8')) as { name?: string }

  if (!name) {
    throw new Error('Package name is not defined')
  }

  try {
    const { version } = await pacote.manifest(`${name}@latest`)

    info.lastVersion = version
  } catch (error) {
    console.error(error)
  }

  const minifiedCode = (await minify(chunk.code)).code

  if (minifiedCode) {
    info.minSize = formatSize(minifiedCode.length)
    info.gzipSize = formatSize(gzipSize(minifiedCode))
  }

  let file = outputOptions.file || ''

  try {
    const output = path.join(process.cwd(), './file-size-cache')

    await pacote.extract(`${name}@latest`, output)

    file = path.resolve(output, file)
  } catch (error) {
    console.error(error)

    file = ''
  }

  if (file && (await stat(file)).isFile()) {
    try {
      const codeBefore = await readFile(file, 'utf8')

      if (codeBefore) {
        info.bundleSizeBefore = formatSize(Buffer.byteLength(codeBefore))
        info.brotliSizeBefore = formatSize(await brotliSize(codeBefore))

        const minifiedCodeBefore = (await minify(codeBefore)).code
        if (minifiedCodeBefore) {
          info.minSizeBefore = formatSize(minifiedCodeBefore.length)
          info.gzipSizeBefore = formatSize(gzipSize(minifiedCodeBefore))
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  return table(info)
}

export const filesize = (): OutputPlugin => {
  const plugin: OutputPlugin = {
    name: 'filesize',
  }

  if (process.env.FILESIZE === 'true') {
    plugin.generateBundle = async (outputOptions, bundle) => {
      Promise.all(
        Object.keys(bundle)
          .map(fileName => bundle[fileName])
          .filter((currentBundle): currentBundle is OutputChunk => currentBundle && currentBundle.type !== 'asset')
          .map(currentBundle => getStrings(outputOptions, currentBundle)),
      ).then(strings => {
        strings.forEach(str => {
          if (str) {
            console.log(str)
          }
        })
      })
    }
  }

  return plugin
}
