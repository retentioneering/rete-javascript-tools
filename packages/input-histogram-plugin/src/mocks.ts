import type { Histogram } from '~/contracts'

export const TEST_TARGET_INTERVALS_SECONDS = [0.001, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1]

export const TEST_INPUT_TIMESTAMPS_MS = [0, 0.2, 0.3, 0.5, 5000, 7000, 7500, 7600, 9000, 9009]

export const TEST_HISTOGRAM: Histogram = {
  0.001: 3,
  0.005: 0,
  0.01: 1,
  0.02: 0,
  0.05: 0,
  0.1: 1,
  0.2: 0,
  0.5: 1,
  1: 3,
}
