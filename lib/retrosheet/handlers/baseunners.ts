import { ActionConfig } from '../retrosheet.types'

import {
  getAction,
  getBase,
  getBases,
  getNextBase,
  getPreviousBase,
  getAdvanceableBase
} from '../utilities'
import * as resultGenerators from '../generators/result'

function getPutoutFromString(putoutString: string) {
  return resultGenerators.putout(putoutString.split('').map(Number))
}

const caughtStealing: ActionConfig = {
  actionType: 'baserunner',
  regexp: /^(PO)?CS([23H])\((\dE?\d)!?\)/,
  handler: (atBat, match) => {
    const [fullMatch, isPickoff, baseString, putout] = match
    const base = getBase(baseString)
    return getAction({
      isOut: true,
      bases: getBases({
        [getPreviousBase(base)]: {
          endBase: base,
          result: getPutoutFromString(putout),
          isOut: true
        }
      })
    })
  }
}

const stolenBase: ActionConfig = {
  actionType: 'baserunner',
  regexp: /SB([23H])/,
  handler: (atBat, match) => {
    const [fullMatch, baseStolen] = match
    const base = getAdvanceableBase(baseStolen)
    return getAction({
      bases: getBases({
        [getPreviousBase(base)]: {
          endBase: base,
          result: resultGenerators.stolenBase(base)
        }
      })
    })
  }
}

const pickOff: ActionConfig = {
  actionType: 'baserunner',
  regexp: /^PO([123])\((E?\d+)\)/,
  handler: (atBat, match) => {
    const [_, rawBase, putoutString] = match
    const base = getBase(rawBase)

    if (putoutString.indexOf('E') >= 0) {
      return getAction({
        isOut: false,
        bases: getBases({
          [base]: {
            endBase: getNextBase(base),
            result: resultGenerators.error(
              Number(putoutString.split('E').pop())
            )
          }
        })
      })
    } else {
      const pickOff = getPutoutFromString(putoutString)
      return getAction({
        isOut: true,
        bases: getBases({
          [base]: { endBase: base, onBasePutout: pickOff, isOut: true }
        })
      })
    }
  }
}

export const baserunnerConfigs = [caughtStealing, pickOff, stolenBase]
