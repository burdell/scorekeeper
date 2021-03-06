import { AdvanceBaseResult, BaseAction, OutBaseResult } from './result'
import type { PickOff, PutOut } from '../../generators/types'

export type Base = 1 | 2 | 3 | 4
export type AdvanceableBase = 2 | 3 | 4
export type StartableBase = 1 | 2 | 3

export type AdditionalBases = Array<{ base: Base; result?: BaseAction }>

export interface EventBaseResult {
  endBase: Base
  result?: BaseAction
  isOut?: boolean
  isAtBatResult?: boolean
  onBasePutout?: PutOut | PickOff
  additionalBases?: AdditionalBases
}

export interface Bases {
  B: EventBaseResult | undefined
  1: EventBaseResult | undefined
  2: EventBaseResult | undefined
  3: EventBaseResult | undefined
}

export interface RunnerMovement {
  startBase: Base | 'B'
  endBase: Base
  result: AdvanceBaseResult | OutBaseResult | undefined
  isOut?: boolean
}
