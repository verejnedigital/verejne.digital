// @flow
import {forwardReducerTo} from './utils'
import getInitialState from './initialState'

import type {GenericAction} from './types/reduxTypes'
import type {State} from './initialState'

const rootReducer = (state: State = getInitialState(), action: GenericAction<*, *>) => {
  const {reducer, path, payload} = action
  // fallback for 3rd-party actions
  if (!reducer) return state
  return forwardReducerTo(reducer, path)(state, payload)
}

export default rootReducer
