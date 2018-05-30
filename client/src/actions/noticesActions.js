// @flow
import produce from 'immer'
import {get} from 'lodash'

import type {GenericAction, Path} from '../types/reduxTypes'
import type {State} from '../state'

export const receiveCompanyDetails = (
  path: Path,
  data: Array<Object> | Object,
  dataProviderRef: string,
  eid: string
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
          [eid]: data,
        }
      Object.assign(get(draft, path), dataObject)
    }),
})
