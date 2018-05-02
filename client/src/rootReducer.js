import {forwardReducerTo} from './utils'
import getInitialState from './state'

const rootReducer = (state = getInitialState(), action) => {
  const {reducer, type, path, payload} = action
  if (!reducer) return state
  if (!path) throw new Error(`You forgot to set path in action ${type}`)
  return forwardReducerTo(reducer, path)(state, payload)
}

export default rootReducer
