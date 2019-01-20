// @flow
import type {ObjectMap} from '../types/commonTypes'
import type {PoliticiansSortKey, PoliticiansSortState} from '../state'

export const setProfileSort = (section: string, sortKey: PoliticiansSortKey, reverse: boolean) => ({
  type: 'Set addresses',
  path: ['profile', 'sorting'],
  payload: {sortKey, reverse},
  reducer: (sortingState: ObjectMap<PoliticiansSortState>, payload: PoliticiansSortState) => ({
    ...sortingState,
    [section]: payload,
  }),
})
