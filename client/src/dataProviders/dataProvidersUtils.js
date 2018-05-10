// @flow
import {receiveData} from '../actions/sharedActions'

import type {Dispatch, Path} from '../types/reduxTypes'

// helper to be used with data-provider
export const dispatchReceivedData = (path: Path) => (
  ref: string,
  data: any,
  dispatch: Dispatch
) => {
  dispatch(receiveData(path, data, ref))
}
