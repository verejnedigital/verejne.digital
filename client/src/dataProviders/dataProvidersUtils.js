// @flow
import {receiveData, storeActiveProviderRef} from '../actions/sharedActions'

import type {Path, Dispatch} from '../types/reduxTypes'

// helper to be used with data-provider
export const dispatchReceivedData = (path: Path) => (
  ref: string,
  data: any,
  dispatch: Dispatch
) => {
  dispatch(receiveData(path, data, ref))
}

// done so that we can track if fetching of data-provider is in progress
// (and later potentially if it is failed - not suppored in current data-provider version)
export const fetchAndStoreRef = (...fetchProps: Array<any>) => (
  ref: string,
  data: any,
  dispatch: Dispatch
) => {
  dispatch(storeActiveProviderRef(ref, fetch(...fetchProps)))
}
