// @flow
import {get, set} from 'lodash'
import produce from 'immer'

import type {SegmentReducer, Path} from './types/reduxTypes'

export const compose = (f: Function, ...fs: Array<Function>) =>
  fs.length > 0 ? (x: any) => f(compose(...fs)(x)) : f

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
