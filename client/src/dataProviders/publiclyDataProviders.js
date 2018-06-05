// @flow
import {setEntities} from '../actions/verejneActions'

import type {Entity} from '../state'
import type {Dispatch} from '../types/reduxTypes'

const dispatchEntities = () => (ref: string, data: Array<Entity>, dispatch: Dispatch) =>
  dispatch(setEntities(data))

export const entitiesProvider = (entitiesUrl: string) => {
  return {
    ref: entitiesUrl,
    getData: [
      fetch,
      entitiesUrl,
      {
        accept: 'application/json',
      },
    ],
    onData: [dispatchEntities],
    keepAliveFor: 60 * 60 * 1000,
    needed: false,
  }
}
