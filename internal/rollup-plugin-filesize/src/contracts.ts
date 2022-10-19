export type FileSizeValue = number

export type FileSizeSymbol = string

export type FileSizeOutputResult = [FileSizeValue, FileSizeSymbol]

export interface Info {
  lastVersion?: string
  file: string
  bundleSize: FileSizeOutputResult
  bundleSizeBefore?: FileSizeOutputResult
  minSize?: FileSizeOutputResult
  minSizeBefore?: FileSizeOutputResult
  gzipSize?: FileSizeOutputResult
  gzipSizeBefore?: FileSizeOutputResult
  brotliSize: FileSizeOutputResult
  brotliSizeBefore?: FileSizeOutputResult
}
