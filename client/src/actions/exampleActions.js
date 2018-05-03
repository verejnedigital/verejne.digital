// @flow
import produce from 'immer'

import type {GenericAction} from '../types/reduxTypes'
import type {State} from '../state'

export const addCount = (): GenericAction<State, void> => ({
  type: 'Counter up',
  reducer: (state) =>
    produce(state, (draft) => {
      draft.count++
    }),
})
