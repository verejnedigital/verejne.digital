// @flow
import {receiveData} from '../actions/sharedActions'

import type {Dispatch, Path} from '../types/reduxTypes'

// helper to be used with data-provider
export const dispatchReceivedData = (
  path: Path,
  mappingFn: (Array<Object> | Object) => Object,
  ...mappingFnArgs: Array<any>
) => (ref: string, data: Array<Object> | Object, dispatch: Dispatch) => {
  dispatch(receiveData(path, data, ref, mappingFn, ...mappingFnArgs))
}
