// @flow
import React from 'react'
import Loading from './components/Loading'
import {get, set} from 'lodash'
import produce from 'immer'
import {stringify, parse} from 'qs'
import type {Location} from 'react-router-dom'
import type {ComponentType} from 'react'
import type {SegmentReducer, Path} from './types/reduxTypes'

const normalizeObjBeforeMap = (data: Array<Object> | Object): Array<Object> =>
  Array.isArray(data) ? data : [data]

// obj handled as a single element of an array
export const mappingFn = (data: Array<Object> | Object, mapByProp?: number | string = 'id') =>
  normalizeObjBeforeMap(data).reduce((obj, current: {[string | number]: string | number}) => {
    obj[current[mapByProp]] = current
    return obj
  }, {})

export const mapArrayToId = (data: Array<Object>, id: number | string, mapByProp?: string) => ({
  [id]: mappingFn(data, mapByProp),
})

export const mapObjToId = (data: Object, id: number | string) => ({
  [id]: data,
})

export const immutableSet = (obj: Object, path: ?Path, value: any) =>
  path && path.length
    ? produce((obj): void => {
      set(obj, path, value)
    })(obj)
    : value
/*
 * Forward reducer transform to a particular state path.
 * If the last path element does not exist, reducer will get undefined
 * so that you can use reduce(state=initialState(), payload) => ...
 *
 * Does not create new state if the value did not change
 */
export const forwardReducerTo = <S: Object, T>(reducer: SegmentReducer<S, T>, path: ?Path) => (
  state: S,
  payload: T
) => {
  const value = path ? get(state, path) : state
  const newValue = reducer(value, payload)
  return newValue !== value ? immutableSet(state, path, newValue) : state
}

// adds new values to query string, replacing existing ones if needed
// expects the object from selector
export const modifyQuery = (queryObj: Object, newValues: Object) =>
  stringify(Object.assign(queryObj, newValues))

// qs expects query without the '?' prefix
export const parseQueryFromLocation = (location: Location) => parse(location.search.slice(1))

export const normalizeName = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

// from https://github.com/mattdesl/promise-cookbook
export const loadImageAsync = (url: string) => {
  return new Promise((resolve, reject) => {
    const image = new Image()

    image.onload = () => {
      resolve(image)
    }

    image.onerror = () => {
      reject(new Error(`Could not load image at ${url}`))
    }

    image.src = url
  })
}

export type SideEffectsFunc<P> = (props: P) => any[]
type SideEffectsState = {
  done: boolean,
}

// run side-effects before rendering component
export const withSideEffects = <P>(sideEffectsFunc: SideEffectsFunc<P>) => (
  WrappedComponent: ComponentType<*>
) => {
  return class extends React.Component<P, SideEffectsState> {
    constructor(props: P) {
      super(props)
      this.state = {
        done: false,
      }
    }

    componentDidMount = () => {
      Promise.all(sideEffectsFunc(this.props).map((val: any) => Promise.resolve(val))).then(() => {
        this.setState({done: true})
      })
    }

    render = () => (this.state.done ? <WrappedComponent {...this.props} /> : <Loading />)
  }
}

// https://github.com/facebook/flow/issues/2221#issuecomment-372112477
// there is no nice way to handle object.values in flow currently - use this instead
export const values = <T>(obj: {[string]: T}): Array<T> => Object.keys(obj).map((k) => obj[k])
