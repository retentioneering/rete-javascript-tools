import zlib from 'node:zlib'

export const gzipSize = (input: string): number => {
  return zlib.gzipSync(input, { level: 9 }).length
}
