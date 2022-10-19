export type Config = {
  selectors: string[]
  eventName: string
  targetIntervals: number[]
}

export type EnablePlugin = () => void

export type ConfigureInputHistogramPlugin = (config: Config) => EnablePlugin

export type Histogram = Record<string, number | undefined>
