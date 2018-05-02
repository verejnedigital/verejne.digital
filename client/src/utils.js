import {get} from 'lodash'
import {set} from 'object-path-immutable'

export const compose = (f, ...fs) => (fs.length > 0 ? (x) => f(compose(...fs)(x)) : f)

/*
 * Forward reducer transform to a particular state path.
 * If the last path element does not exist, reducer will get undefined
 * so that you can use reduce(state=initialState(), payload) => ...
 *
 * Does not create new state if the value did not change
 */
export const forwardReducerTo = (reducer, path) => (state, payload) => {
  const value = get(state, path)
  const newValue = reducer(value, payload)
  return newValue !== value ? set(state, path, newValue) : state
}
