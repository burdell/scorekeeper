import { AtBat } from 'retrosheet-parse'

import * as resultGenerators from '../generators/result'

import { RetrosheetEvent, AtBatResult } from '../../types'
import { getAction, getPutoutPositions } from '../utilities'
import { ActionConfig } from '../retrosheet.types'

export function getOutType(
  modifier: string
): 'groundout' | 'lineout' | 'flyout' | 'sacrifice-fly' | undefined {
  if (modifier.match(/\/(B*)G/)) return 'groundout'
  if (modifier.indexOf('/L') >= 0) return 'lineout'
  if (modifier.match(/\/.*F.*/) || modifier.indexOf('/P') >= 0) return 'flyout'
  if (modifier.indexOf('/SF') >= 0) return 'sacrifice-fly'
}

export function isSacrifice(atBatResult: string) {
  return !!atBatResult.match(/\/S(F|H)/)
}

function getPutoutFromString(putout: string) {
  return resultGenerators.putout(getPutoutPositions(putout))
}

function getBatterAction(atBatResult: string) {
  const [batterAction, ...modifiers] = atBatResult.split('/')
  return batterAction
}

const strikeout: ActionConfig = {
  actionType: 'batter',
  regexp: /^K/,
  handler: () => {
    return getAction({
      isOut: true,
      result: resultGenerators.pitcherResult('K')
    })
  }
}

function getNonGroundout(
  outType: 'flyout' | 'lineout' | 'sacrifice-fly' | undefined,
  defensivePositions: number[]
) {
  let result: AtBatResult | undefined = undefined
  const defensivePosition = defensivePositions.pop()
  if (!defensivePosition || defensivePositions.length > 0)
    throw new Error(
      `Attempted to record an out without a valid defensive player: ${defensivePositions}`
    )

  if (outType === 'flyout') {
    result = resultGenerators.flyOut(defensivePosition)
  } else if (outType === 'lineout') {
    result = resultGenerators.lineOut(defensivePosition)
  } else if (outType === 'sacrifice-fly') {
    result = resultGenerators.flyOut(defensivePosition)
  }

  return result
}

function getOut(atBatResult: string) {
  const outType = getOutType(atBatResult)
  const batterAction = getBatterAction(atBatResult)
  const defensivePositions = getPutoutPositions(batterAction)

  const outData: Partial<RetrosheetEvent> = {
    isSacrifice: isSacrifice(atBatResult),
    isOut: true
  }

  let result: AtBatResult | undefined = undefined
  if (defensivePositions.length > 1 || outType === 'groundout') {
    result = resultGenerators.putout(defensivePositions)
  } else {
    result = getNonGroundout(outType, defensivePositions)
  }

  outData.result = result
  return outData
}

const simpleOut: ActionConfig = {
  actionType: 'batter',
  regexp: /^\d+\//,
  handler: (gameplayEvent: AtBat, match: RegExpMatchArray) => {
    const out = getOut(gameplayEvent.result)
    return getAction(out)
  }
}

const multiActionOut: ActionConfig = {
  actionType: 'batter',
  regexp: /(\d+)\(([B|1|2|3])\)/g,
  handler: (gameplayEvent, match) => {
    const { result } = gameplayEvent
    const baseActions = result.matchAll(/([\d!]+)\(([B|1|2|3])\)/g)
    const batterMatch = result.match(/^([\d!]+\([123]\))*(\d+)(\(B\))?\//)
    const batterResultType = result.match(/(\/\w+)(\.[B123]-[123H]((.+))*)*$/)

    let batterAction = batterMatch ? batterMatch[2] : ''
    let firstBaseResult = ''
    let secondBaseResult = ''
    let thirdBaseResult = ''

    for (const putout of baseActions) {
      const [_, rawAction, base] = putout
      const action = getPutoutPositions(rawAction).join('')
      switch (base) {
        case 'B': {
          batterAction = action
          break
        }
        case '1': {
          firstBaseResult = action
          break
        }
        case '2': {
          secondBaseResult = action
          break
        }
        case '3': {
          thirdBaseResult = action
        }
      }
    }

    const batterResult = batterMatch
      ? `${thirdBaseResult}${secondBaseResult}${firstBaseResult}${batterAction}`
      : batterAction
    const baseResults = {
      '1': firstBaseResult
        ? `${thirdBaseResult}${secondBaseResult}${firstBaseResult}`
        : undefined,
      '2': secondBaseResult
        ? `${thirdBaseResult}${secondBaseResult}`
        : undefined,
      '3': thirdBaseResult ? `${thirdBaseResult}` : undefined
    }

    function getAtBatResult() {
      if (batterResultType) {
        const [fullMatch, result] = batterResultType
        const outType = getOutType(result)
        const positions = getPutoutPositions(result)
        if (outType !== 'groundout' && positions.length) {
          const batterOut = getNonGroundout(outType, positions)
          return batterOut
        }
      }

      return batterResult
        ? resultGenerators.putout(getPutoutPositions(batterResult))
        : resultGenerators.fieldersChoice(1)
    }

    const res = getAtBatResult()
    const isFieldersChoice = !!(res && res.type === 'fielders-choice')
    return getAction({
      isOut: !isFieldersChoice,
      result: res,
      bases: {
        B: isFieldersChoice
          ? {
              endBase: 1,
              isAtBatResult: true,
              result: undefined
            }
          : undefined,
        1: baseResults[1]
          ? {
              endBase: 2,
              result: getPutoutFromString(baseResults[1]),
              isOut: true
            }
          : undefined,
        2: baseResults[2]
          ? {
              endBase: 3,
              result: getPutoutFromString(baseResults[2]),
              isOut: true
            }
          : undefined,
        3: baseResults[3]
          ? {
              endBase: 4,
              result: getPutoutFromString(baseResults[3]),
              isOut: true
            }
          : undefined
      }
    })
  }
}

export const outConfigs = [strikeout, simpleOut, multiActionOut]
