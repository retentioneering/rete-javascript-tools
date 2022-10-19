import { createHistogram } from '~/create-histogram/index'
import { TEST_HISTOGRAM, TEST_INPUT_TIMESTAMPS_MS, TEST_TARGET_INTERVALS_SECONDS } from '~/mocks'

it('`createHistogram` should work correctly', () => {
  const histogram = createHistogram(TEST_INPUT_TIMESTAMPS_MS, TEST_TARGET_INTERVALS_SECONDS)

  expect(histogram).toEqual(TEST_HISTOGRAM)
})
