// @flow
import {dispatchReceivedData} from './dataProvidersUtils'

export const connexionEntityProvider = (query: string, index: number) => ({
  ref: `connexionEntities-${index}`,
  getData: [
    fetch,
    `${process.env.REACT_APP_API_URL || ''}/api/v/searchEntity?text=${query}`,
    {
      accept: 'application/json',
    },
  ],
  onData: [dispatchReceivedData, ['connexions', 'entities']],
  keepAliveFor: 10 * 60 * 1000,
})

export const connexionDetailProvider = (eid1: string, eid2: string) => ({
  ref: `connextion-${eid1}-${eid2}`,
  getData: [
    fetch,
    `${process.env.REACT_APP_API_URL || ''}api/p/connection?eid1=${eid1}&eid2=${eid2}`,
    {
      accept: 'application/json',
    },
  ],
  onData: [dispatchReceivedData, ['connexion', 'detail']],
  keepAliveFor: 60 * 60 * 1000,
})

export const connexionSubgraphProvider = (eid1: string, eid2: string) => ({
  ref: `connextion-${eid1}-${eid2}`,
  getData: [
    fetch,
    `${process.env.REACT_APP_API_URL || ''}api/p/subgraph?eid1=${eid1}&eid2=${eid2}`,
    {
      accept: 'application/json',
    },
  ],
  onData: [dispatchReceivedData, ['connexion', 'subgraph']],
  keepAliveFor: 60 * 60 * 1000,
})
