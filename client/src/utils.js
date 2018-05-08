// @flow
import {get, set} from 'lodash'
import produce from 'immer'

import type {SegmentReducer, Path} from './types/reduxTypes'

export const immutableSet = (obj: Object, path: ?Path, value: any) =>
  path && path.length
    ? produce((obj): void => {
      set(obj, path, value)
    })(obj)
    : value
/*
 * Forward reducer transform to a particular state path.
 * If the last path element does not exist, reducer will get undefined
 * so that you can use reduce(state=initialState(), payload) => ...
 *
 * Does not create new state if the value did not change
 */
export const forwardReducerTo = <S: Object, T>(reducer: SegmentReducer<S, T>, path: ?Path) => (
  state: S,
  payload: T
) => {
  const value = path ? get(state, path) : state
  const newValue = reducer(value, payload)
  return newValue !== value ? immutableSet(state, path, newValue) : state
}

// https://github.com/facebook/flow/issues/2221#issuecomment-372112477
// there is no nice way to handle object.values in flow currently - use this instead
export const values = <T>(obj: {[string]: T}): Array<T> => Object.keys(obj).map((k) => obj[k])
