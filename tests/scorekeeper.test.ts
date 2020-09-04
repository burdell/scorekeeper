import { Scorekeeper } from '../lib/Scorekeeper'
import { getAction, getBases } from '../lib/retrosheet/utilities'
import * as actionGenerators from '../lib/retrosheet/generators/action'
import * as resultGenerators from '../lib/retrosheet/generators/result'

describe('Scorekeeper tests', () => {
  it('handles gameplay events', () => {
    const sk = new Scorekeeper()
    const action = actionGenerators.hit(1)

    sk.handleGameEvent({
      event: action,
      inning: 0,
      lineupSpot: 0,
      team: 'visiting'
    })

    sk.handleGameEvent({
      event: getAction({
        result: resultGenerators.pitcherResult('BB'),
        pitches: {
          balls: 4,
          strikes: 2,
          pitchCount: 8
        },
        bases: getBases({
          B: {
            endBase: 1,
            isAtBatResult: true
          },
          1: {
            endBase: 2
          }
        })
      }),
      inning: 0,
      lineupSpot: 1,
      team: 'visiting'
    })

    sk.handleGameEvent({
      event: getAction({
        bases: getBases({
          2: {
            endBase: 3,
            result: resultGenerators.stolenBase(3)
          }
        })
      }),
      inning: 0,
      lineupSpot: 2,
      team: 'visiting'
    })

    sk.handleGameEvent({
      event: getAction({
        pitches: {
          balls: 0,
          strikes: 0,
          pitchCount: 1
        },
        result: resultGenerators.hit(2),
        bases: getBases({
          B: {
            endBase: 2,
            isAtBatResult: true
          },
          1: {
            endBase: 4
          },
          3: {
            endBase: 4
          }
        })
      }),
      inning: 0,
      lineupSpot: 2,
      team: 'visiting'
    })

    sk.handleGameEvent({
      event: getAction({
        pitches: {
          balls: 0,
          strikes: 0,
          pitchCount: 1
        },
        result: undefined,
        bases: getBases({
          2: {
            endBase: 3,
            result: resultGenerators.putout([1, 5]),
            isOut: true
          }
        })
      }),
      inning: 0,
      lineupSpot: 3,
      team: 'visiting'
    })

    expect(sk.gameplay.visiting[0][0]).toEqual({
      balls: 0,
      bases: [
        {
          advanced: true,
          isAtBatResult: true
        },
        {
          advanced: true
        },
        {
          advanced: true,
          result: resultGenerators.stolenBase(3)
        },
        {
          advanced: true
        }
      ],
      isOut: false,
      pitchCount: 0,
      result: {
        display: '1B',
        result: 1,
        type: 'hit'
      },
      strikes: 0
    })

    expect(sk.gameplay.visiting[0][1]).toEqual({
      balls: 4,
      strikes: 2,
      pitchCount: 8,
      bases: [
        {
          advanced: true,
          isAtBatResult: true,
          result: undefined
        },
        {
          advanced: true
        },
        {
          advanced: true
        },
        {
          advanced: true
        }
      ],
      isOut: false,
      result: resultGenerators.pitcherResult('BB')
    })

    expect(sk.gameplay.visiting[0][2]).toEqual({
      balls: 0,
      strikes: 0,
      pitchCount: 1,
      bases: [
        {
          advanced: true,
          result: undefined
        },
        {
          advanced: true,
          isAtBatResult: true,
          result: undefined
        },
        {
          advanced: false,
          result: resultGenerators.putout([1, 5])
        }
      ],
      isOut: true,
      result: resultGenerators.hit(2)
    })

    expect(sk.gameplay.visiting[0].length).toEqual(9)
  })

  it('handles batting around in the order', () => {
    const sk = new Scorekeeper()
    Array(9)
      .fill(null)
      .map((_, i) => {
        sk.handleGameEvent({
          event: getAction({ result: resultGenerators.pitcherResult('BB') }),
          inning: 0,
          lineupSpot: i,
          team: 'visiting'
        })
      })

    Array(2)
      .fill(null)
      .map((_, i) => {
        sk.handleGameEvent({
          event: getAction({ result: resultGenerators.pitcherResult('HBP') }),
          inning: 0,
          lineupSpot: i,
          team: 'visiting'
        })
      })

    expect(sk.gameplay.visiting[0].length).toEqual(18)
    expect(sk.gameplay.visiting[0][0].result).toEqual(
      resultGenerators.pitcherResult('BB')
    )
    expect(sk.gameplay.visiting[0][9].result).toEqual(
      resultGenerators.pitcherResult('HBP')
    )
    expect(sk.gameplay.visiting[0][10].result).toEqual(
      resultGenerators.pitcherResult('HBP')
    )
  })
})
