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
    produce(state, (draft) => {
      // assumes all of the received data are objects at root
      set(draft, path, Object.assign(get(draft, path) || {}, data))
      delete draft.activeProviderPromises[dataProviderRef]
    }),
})

export const storeActiveProviderRef = (
  ref: string,
  promise: Promise<any>
): GenericAction<State, void> => ({
  type: `Getting data from provider ${ref}`,
  reducer: (state) =>
    produce(state, (draft) => {
      draft.activeProviderPromises[ref] = promise
    }),
})
