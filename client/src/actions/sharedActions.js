// @flow
import {mappingFn as defaultMappingFn} from '../utils'

import type {GenericAction, Path} from '../types/reduxTypes'

// merges new data into destination Path according to the mappingFn provided
// TODO flow with generics for mappingFn
export const receiveData = (
  path: Path,
  data: Array<Object> | Object,
  dataProviderRef: string,
  mappingFn: (Array<Object> | Object) => Object = defaultMappingFn,
  ...mappingFnArgs: Array<any>
): GenericAction<Object, Array<Object> | Object> => ({
  type: `Received data from ${dataProviderRef}`,
  path,
  payload: data,
  reducer: (state, data) => ({...state, ...mappingFn(data, ...mappingFnArgs)}),
})

export const updateValue = <T: *>(path: Path, data: T): GenericAction<T, T> => ({
  type: 'Update data on path',
  payload: data,
  path,
  reducer: (state: T, data: T) => data,
})
