// @flow
import type {Dispatch} from './reduxTypes'

export type ObjectMap<T> = {[string]: T}

export type onDataFunction = (ref: string, data: any, dispatch: Dispatch) => void

// use with recompose.withState updater
// https://github.com/acdlite/recompose/blob/master/docs/API.md#withstate
export type stateUpdater<T> = (
  (prevValue: T) => T,
  callback?: Function
) => void | ((newValue: T, callback?: Function) => void)
