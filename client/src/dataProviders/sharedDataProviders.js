// @flow
import React from 'react'
import {receiveData} from '../actions/sharedActions'
import {setEntityDetails} from '../actions/publicActions'
import {EntityDetailLoading} from '../components/Loading/Loading'
import type {Company, NewEntityDetail} from '../state'
import type {Dispatch} from '../types/reduxTypes'
import type {ObjectMap} from '../types/commonTypes'

const dispatchCompanyDetails = (eid: number) => (
  ref: string,
  data: Company,
  dispatch: Dispatch
) => {
  dispatch(receiveData(['companies'], {id: eid, eid, ...data}, ref))
}

const dispatchEntitySearch = (query: string) => (
  ref: string,
  data: Array<{eid: number}>,
  dispatch: Dispatch
) => {
  dispatch(receiveData(['entitySearch'], {id: query, query, eids: data.map(({eid}) => eid)}, ref))
}

const dispatchEntityDetails = () => (
  ref: string,
  data: ObjectMap<NewEntityDetail>,
  dispatch: Dispatch
) => {
  dispatch(setEntityDetails(data))
}

export const companyDetailProvider = (eid: number, needed: boolean = true) => {
  return {
    ref: `companyDetail-${eid}`,
    getData: [
      fetch,
      `${process.env.REACT_APP_API_URL || ''}/api/v/getInfo?eid=${eid}`,
      {
        accept: 'application/json',
      },
    ],
    onData: [dispatchCompanyDetails, eid],
    keepAliveFor: 60 * 60 * 1000,
    needed,
  }
}

export const entitySearchProvider = (query: string) => ({
  ref: `entitySearch-${query}`,
  getData: [
    fetch,
    `${process.env.REACT_APP_API_URL || ''}/api/v/searchEntityByName?name=${query}`,
    {
      accept: 'application/json',
    },
  ],
  onData: [dispatchEntitySearch, query],
})

export const entityDetailProvider = (eid: number | number[], needed: boolean = true) => {
  const requestPrefix = `${process.env.REACT_APP_API_URL || ''}`
  return {
    ref: `entityDetail-${eid.toString()}`,
    getData: [
      fetch,
      `${requestPrefix}/api/v/getInfos?eids=${eid.toString()}`,
      {
        accept: 'application/json',
      },
    ],
    onData: [dispatchEntityDetails],
    keepAliveFor: 60 * 60 * 1000,
    loadingComponent: <EntityDetailLoading />,
    needed,
  }
}
