// @flow
import type {Dispatch} from '../types/reduxTypes'
import {dispatchReceivedData} from './dataProvidersUtils'
import {receiveData} from '../actions/sharedActions'

const dispatchEntitiesData = (query: string) => (ref: string, data: any, dispatch: Dispatch) => {
  dispatch(
    receiveData(['connexions', 'entities'], {id: query, eids: data.map(({eid}) => eid)}, ref)
  )
}

const dispatchConnexionData = (eid1: string, eid2: string) => (
  ref: string,
  data: any,
  dispatch: Dispatch
) => {
  dispatch(receiveData(['connexions', 'detail'], {id: `${eid1}-${eid2}`, ids: data}, ref))
}

const dispatchEntityDetailData = (eid: string) => (ref: string, data: any, dispatch: Dispatch) => {
  dispatch(
    receiveData(
      ['connexions', 'entityDetails'],
      {id: eid, name: data.entities[0].entity_name, data},
      ref
    )
  )
}

export const connexionEntityProvider = (query: string) => ({
  ref: `connexionEntities-${query}`,
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

export const connexionEntityDetailProvider = (eid: string) => ({
  ref: `connexionEntityDetail-${eid}`,
  getData: [
    fetch,
    `${process.env.REACT_APP_API_URL || ''}/api/v/getInfo?eid=${eid}`,
    {
      accept: 'application/json',
    },
  ],
  onData: [dispatchEntityDetailData, eid],
  keepAliveFor: 10 * 60 * 1000,
})

export const connexionDetailProvider = (eid1: string, eid2: string) => ({
  ref: `connexion-${eid1}-${eid2}`,
  getData: [
    fetch,
    `${process.env.REACT_APP_API_URL || ''}/api/p/connection?eid1=${eid1}&eid2=${eid2}`,
    {
      accept: 'application/json',
    },
  ],
  onData: [dispatchConnexionData, eid1, eid2],
  keepAliveFor: 60 * 60 * 1000,
})

export const connexionSubgraphProvider = (eid1: string, eid2: string) => ({
  ref: `connextion-${eid1}-${eid2}`,
  getData: [
    fetch,
    `${process.env.REACT_APP_API_URL || ''}/api/p/subgraph?eid1=${eid1}&eid2=${eid2}`,
    {
      accept: 'application/json',
    },
  ],
  onData: [dispatchReceivedData, ['connexion', 'subgraph']],
  keepAliveFor: 60 * 60 * 1000,
})
