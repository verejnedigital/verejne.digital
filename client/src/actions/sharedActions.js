// @flow
import produce from 'immer'
import {get} from 'lodash'

import type {GenericAction, Path} from '../types/reduxTypes'
import type {State} from '../state'

// TODO a way of providing id
// merges new data into destination Path
// assumes a certain kind of data format - will need refinment if the API's different
export const receiveData = (
  path: Path,
  data: Array<Object> | Object,
  dataProviderRef: string
): GenericAction<Object, Array<Object> | Object> => ({
  type: `Received data from ${dataProviderRef}`,
  path,
  payload: data,
  reducer: (state, data) =>
    produce(state, (draft): void => {
      const dataObject = Array.isArray(data)
        ? data.reduce((obj, current) => {
          obj[current.id] = current
          return obj
        }, {})
        : {
          [data.id]: data,
        }
      Object.assign(draft, dataObject)
    }),
})

export const updateValue = <T: *>(path: Path, data: T): GenericAction<T, T> => ({
  type: 'Update data on path',
  payload: data,
  path,
  reducer: (state: T, data: T) => data,
})
