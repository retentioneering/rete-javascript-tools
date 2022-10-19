import type { Histogram } from '~/contracts'

const timeStampsToIntervals = (inputTimestampsMs: number[]): number[] => {
  return inputTimestampsMs.reduce<number[]>((acc, timestampMs, index) => {
    if (index > 0) {
      const prevTimestamp = inputTimestampsMs[index - 1]
      acc.push(timestampMs - prevTimestamp)
    }

    return acc
  }, [])
}

export const createHistogram = (inputTimestampsMs: number[], targetIntervalsSeconds: number[]): Histogram => {
  const intervalsMs = timeStampsToIntervals(inputTimestampsMs)

  const histogram: Histogram = {}

  const incrementInterval = (interval: number): void => {
    const value = histogram[interval] || 0
    histogram[interval] = value + 1
  }

  for (const intervalMs of intervalsMs) {
    targetIntervalsSeconds.forEach((histogramIntervalSec, index) => {
      const histogramIntervalMs = histogramIntervalSec * 1000
      if (index === 0) {
        if (intervalMs <= histogramIntervalMs) {
          incrementInterval(histogramIntervalSec)
        }

        return
      }

      if (index === targetIntervalsSeconds.length - 1) {
        if (intervalMs >= histogramIntervalMs) {
          incrementInterval(histogramIntervalSec)
        }

        return
      }

      const prevHistogramIntervalMs = targetIntervalsSeconds[index - 1] * 1000

      if (intervalMs > prevHistogramIntervalMs && intervalMs <= histogramIntervalMs) {
        incrementInterval(histogramIntervalSec)
      }
    })
  }

  targetIntervalsSeconds.forEach(histogramInterval => {
    if (!histogram[histogramInterval]) {
      histogram[histogramInterval] = 0
    }
  })

  return histogram
}
