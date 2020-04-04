import { Scorekeeper } from '../lib'
import { Game, InitialGame } from '../lib/types'

describe('Scorekeeper', () => {
  it('initializes an empty game', () => {
    const scorekeeper = new Scorekeeper()

    const currentGame = scorekeeper.getCurrentGameInfo()
    const { home, visiting } = scorekeeper.getCurrentLineups()
    expect(currentGame.date).toBe('')
    expect(currentGame.homeTeam).toEqual('')
    expect(currentGame.visitingTeam).toEqual('')
    expect(home).toEqual([])
    expect(visiting).toEqual([])
  })

  it('intializes a game with some data', () => {
    const initialGameInfo = {
      date: '2020-08-09',
      homeTeam: 'Atlanta Braves',
      visitingTeam: 'Washington Nationals',
      startTime: '7:00pm',
      location: 'Truist Park'
    }
    const initialLineups = {
      homeLineup: [
        {
          player: { name: 'Freddie Freeman', number: 5 },
          position: 3
        }
      ],
      visitingLineup: [
        {
          player: { name: 'Pete Alonson', number: 20 },
          position: 3
        }
      ]
    }

    const initialGame: InitialGame = { ...initialGameInfo, ...initialLineups }

    const scorekeeper = new Scorekeeper(initialGame)
    const currentGame = scorekeeper.getCurrentGameInfo()
    const currentLineups = scorekeeper.getCurrentLineups()

    expect(currentGame).toEqual(initialGameInfo)
    expect(currentLineups.home).toEqual([
      [{ ...initialLineups.homeLineup[0], inning: 1 }]
    ])
    expect(currentLineups.visiting).toEqual([
      [{ ...initialLineups.visitingLineup[0], inning: 1 }]
    ])
  })

  it('updates game info', () => {
    const initialGame: Partial<Game> = {
      date: '2020-08-09',
      homeTeam: 'Atlanta Braves',
      visitingTeam: 'Washington Nationals',
      startTime: '7:00pm',
      location: 'Truist Park'
    }
    const scorekeeper = new Scorekeeper(initialGame)

    expect(scorekeeper.getCurrentGameInfo().startTime).toEqual(
      initialGame.startTime
    )

    const newStartTime = '10:00pm'
    scorekeeper.updateGameInfo({ startTime: newStartTime })

    expect(scorekeeper.getCurrentGameInfo().startTime).toEqual(newStartTime)
  })

  it('makes subsitutions in the lineup', () => {
    const scorekeeper = new Scorekeeper()

    const homePlayer = {
      inning: 1,
      position: 3,
      player: { name: 'Freddie Freeman', number: 5 }
    }
    scorekeeper.substituteHomePlayer(0, homePlayer)
    const visitingPlayer = {
      inning: 1,
      position: 3,
      player: { name: 'Pete Alonso', number: 20 }
    }
    scorekeeper.substituteVisitingPlayer(0, visitingPlayer)

    expect(scorekeeper.getCurrentLineups().home[0][0]).toEqual(homePlayer)
    expect(scorekeeper.getCurrentLineups().visiting[0][0]).toEqual(
      visitingPlayer
    )

    const anotherHomePlayer = {
      inning: 7,
      position: 6,
      player: { name: 'Dansby Swanson', number: 6 }
    }
    scorekeeper.substituteHomePlayer(0, anotherHomePlayer)

    expect(scorekeeper.getCurrentLineups().home[0][1]).toEqual(
      anotherHomePlayer
    )
  })
})
