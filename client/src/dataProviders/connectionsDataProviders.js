// @flow
import type {Dispatch} from '../types/reduxTypes'
import {dispatchReceivedData} from './dataProvidersUtils'
import {receiveData} from '../actions/sharedActions'

const dispatchEntitiesData = (query: string) => (
  ref: string,
  data: Array<{eid: number}>,
  dispatch: Dispatch
) => {
  dispatch(
    receiveData(['connections', 'entities'], {id: query, eids: data.map(({eid}) => eid)}, ref)
  )
}

const dispatchConnectionData = (eid1: number | number[], eid2: number | number[]) => (
  ref: string,
  data: number[],
  dispatch: Dispatch
) => {
  dispatch(receiveData(['connections', 'detail'], {id: `${eid1}-${eid2}`, ids: data}, ref))
}

export const connectionEntityProvider = (query: string) => ({
  ref: `connectionEntities-${query}`,
  getData: [
    fetch,
    `${process.env.REACT_APP_API_URL || ''}/api/v/searchEntity?text=${query}`,
    {
      accept: 'application/json',
    },
  ],
  onData: [dispatchEntitiesData, query],
  keepAliveFor: 10 * 60 * 1000,
})

export const connectionDetailProvider = (eid1: string, eid2: string) => ({
  ref: `connection-${eid1}-${eid2}`,
  getData: [
    fetch,
    `${process.env.REACT_APP_API_URL || ''}/api/p/connection?eid1=${eid1}&eid2=${eid2}`,
    {
      accept: 'application/json',
    },
  ],
  onData: [dispatchConnectionData, eid1, eid2],
  keepAliveFor: 60 * 60 * 1000,
})

export const connectionSubgraphProvider = (eid1: number | number[], eid2: number | number[]) => ({
  ref: `connextion-${eid1}-${eid2}`,
  getData: [
    fetch,
    `${process.env.REACT_APP_API_URL || ''}/api/p/subgraph?eid1=${eid1}&eid2=${eid2}`,
    {
      accept: 'application/json',
    },
  ],
  onData: [dispatchReceivedData, ['connection', 'subgraph']],
  keepAliveFor: 60 * 60 * 1000,
})
