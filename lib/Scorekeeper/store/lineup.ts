import { Lineup, LineupEntry, PitcherEntry } from '../../types'
import { createAction, createReducer } from '@reduxjs/toolkit'

export type LineupState = {
  home: Lineup
  visiting: Lineup
  homePitchers: PitcherEntry[]
  visitingPitchers: PitcherEntry[]
}
type LineupSubstition = { lineupSpot: number; lineupEntry: LineupEntry }

function sub(lineup: Lineup, sub: LineupSubstition) {
  if (!lineup[sub.lineupSpot]) {
    lineup[sub.lineupSpot] = []
  }

  lineup[sub.lineupSpot].push(sub.lineupEntry)
}

export const setLineups = createAction<LineupState>('setLineup')
export const subHome = createAction<LineupSubstition>('subHome')
export const subVisiting = createAction<LineupSubstition>('subVisiting')

const initialState: LineupState = {
  home: [],
  visiting: [],
  homePitchers: [],
  visitingPitchers: []
}
export const lineupReducer = createReducer(initialState, (builder) => {
  builder.addCase(setLineups, (state, action) => {
    state.home = action.payload.home
    state.visiting = action.payload.visiting

    state.homePitchers = action.payload.homePitchers
    state.visitingPitchers = action.payload.visitingPitchers
  })
  builder.addCase(subHome, (state, action) => {
    sub(state.home, action.payload)
    return state
  })
  builder.addCase(subVisiting, (state, action) => {
    sub(state.visiting, action.payload)
    return state
  })
})