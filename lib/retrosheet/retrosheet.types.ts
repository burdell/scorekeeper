import { AtBat } from 'retrosheet-parse'

import { RetrosheetEvent } from '../types'
import { BaserunnerMovements } from './baseMovements'

type ActionType = 'baserunner' | 'batter'

export type Handler = (
  gameplayEvent: AtBat,
  match: RegExpMatchArray,
  baseAdvancements: BaserunnerMovements
) => RetrosheetEvent | undefined

export type Action = {
  actionType: ActionType
  match: RegExpMatchArray
  handler?: Handler
}

export type ActionConfig = {
  regexp: RegExp
  actionType: ActionType
  handler: Handler
}
