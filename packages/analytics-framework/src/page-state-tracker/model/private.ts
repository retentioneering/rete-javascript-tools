import { root } from '~/effector-root'
import type { PageStage, PerfInfo } from '~/types'

const d = root.domain()
type GetPerfInfoParams = {
  pageStage: PageStage
}

type GetPerfInfoResult = {
  pageStage: PageStage
  perfInfo?: PerfInfo
}

export const getPerfInfoFx = d.effect<GetPerfInfoParams, GetPerfInfoResult, Error>()
