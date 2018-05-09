// @flow
import produce from 'immer'
import {get, set} from 'lodash'

import type {GenericAction, Path} from '../types/reduxTypes'
import type {State} from '../state'

// merges new data into destination Path
// assumes a certain kind of data format - will need refinment if the API's different
export const receiveData = (
  path: Path,
  data: Array<Object> | Object,
  dataProviderRef: string
): GenericAction<State, Array<Object> | Object> => ({
  type: `Received data from ${dataProviderRef}`,
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
      set(draft, path, Object.assign(get(draft, path) || {}, dataObject))
    }),
})
