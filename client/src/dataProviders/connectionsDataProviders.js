// @flow
import React from 'react'
import type {Dispatch} from '../types/reduxTypes'
import {receiveData} from '../actions/sharedActions'
import {GraphLoading} from '../components/Loading/Loading'

const dispatchConnectionData = (eid1: number | number[], eid2: number | number[]) => (
  ref: string,
  data: number[],
  dispatch: Dispatch
) => {
  dispatch(
    receiveData(
      ['connections', 'detail'],
      {id: `${eid1.toString()}-${eid2.toString()}`, ids: data},
      ref
    )
  )
}

const dispatchSubgraphData = (
  eid1: number | number[],
  eid2: number | number[],
  transformer: (Object) => Object
) => (ref: string, data: any, dispatch: Dispatch) => {
  dispatch(
    receiveData(
      ['connections', 'subgraph'],
      {id: `${eid1.toString()}-${eid2.toString()}`, data: transformer(data)},
      ref
    )
  )
}

const dispatchNotableSubgraphData = (
  eid: number | number[],
  transformer: (Object) => Object
) => (ref: string, data: any, dispatch: Dispatch) => {
  dispatch(
    receiveData(
      ['connections', 'subgraph'],
      {id: `${eid.toString()}`, data: transformer(data)},
      ref
    )
  )
}

export const connectionDetailProvider = (eid1: number | number[], eid2: number | number[]) => ({
  ref: `connection-${eid1.toString()}-${eid2.toString()}`,
  getData: [
    fetch,
    `${process.env.REACT_APP_API_URL ||
      ''}/api/p/a_shortest_path?eid1=${eid1.toString()}&eid2=${eid2.toString()}`,
    {
      accept: 'application/json',
    },
  ],
  onData: [dispatchConnectionData, eid1, eid2],
  keepAliveFor: 60 * 60 * 1000,
})

export const connectionSubgraphProvider = (
  eid1: number | number[],
  eid2: number | number[],
  transformer: (Object) => Object
) => ({
  ref: `connextion-${eid1.toString()}-${eid2.toString()}`,
  getData: [
    fetch,
    `${process.env.REACT_APP_API_URL ||
      ''}/api/p/subgraph?eid1=${eid1.toString()}&eid2=${eid2.toString()}`,
    {
      accept: 'application/json',
    },
  ],
  onData: [dispatchSubgraphData, eid1, eid2, transformer],
  keepAliveFor: 60 * 60 * 1000,
  loadingComponent: <GraphLoading />,
})

export const notableConnectionSubgraphProvider = (
  eid: number | number[],
  transformer: (Object) => Object
) => ({
  ref: `notable-connection-${eid.toString()}`,
  getData: [
    fetch,
    `${process.env.REACT_APP_API_URL ||
      ''}/api/p/notable_connections?eid=${eid.toString()}`,
    {
      accept: 'application/json',
    },
  ],
  onData: [dispatchNotableSubgraphData, eid, transformer],
  keepAliveFor: 60 * 60 * 1000,
  loadingComponent: <GraphLoading />,
})
