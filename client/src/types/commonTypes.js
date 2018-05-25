// @flow
import type {Dispatch} from './reduxTypes'

export type ObjectMap<T> = {[string]: T}

export type onDataFunction = (ref: string, data: any, dispatch: Dispatch) => void

export type ParamsIdRoute = {
  match: {
    params: {
      id: string,
    },
  },
}
