// @flow
import produce from 'immer'
import {get, set} from 'lodash'

import type {GenericAction, Path} from '../types/reduxTypes'
import type {State} from '../state'

export const receiveData = (
  path: Path,
  data: any,
  dataProviderRef: string
): GenericAction<State, Object> => ({
  type: `Received data from ${dataProviderRef}`,
  payload: data,
  reducer: (state, data) =>
    produce(state, (draft): void => {
      const dataObject = data.reduce((obj, current) => {
        obj[current.id] = current
        return obj
      }, {})
      set(draft, path, Object.assign(get(draft, path) || {}, dataObject))
      delete draft.activeProviderPromises[dataProviderRef]
    }),
})
