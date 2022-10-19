import type { BrotliOptions } from 'node:zlib'
import { brotliCompress, constants } from 'node:zlib'

interface BrotliEncodeParams {
  mode?: number
  quality?: number
}

const bufferFormatter = (incoming: Buffer | string): Buffer => {
  return typeof incoming === 'string' ? Buffer.from(incoming, 'utf8') : incoming
}

const optionFormatter = (passed?: BrotliEncodeParams, toEncode?: Buffer): BrotliOptions => ({
  params: {
    [constants.BROTLI_PARAM_MODE]: (passed && 'mode' in passed && passed.mode) || constants.BROTLI_DEFAULT_MODE,
    [constants.BROTLI_PARAM_QUALITY]: (passed && 'quality' in passed && passed.quality) || constants.BROTLI_MAX_QUALITY,
    [constants.BROTLI_PARAM_SIZE_HINT]: toEncode ? toEncode.byteLength : 0,
  },
})

export const brotliSize = (incoming: Buffer | string, options?: BrotliEncodeParams): Promise<number> => {
  const buffer = bufferFormatter(incoming)

  return new Promise((resolve, reject) => {
    brotliCompress(buffer, optionFormatter(options, buffer), (error: Error | null, result: Buffer) => {
      if (error !== null) {
        reject(error)
      }

      resolve(result.byteLength)
    })
  })
}
