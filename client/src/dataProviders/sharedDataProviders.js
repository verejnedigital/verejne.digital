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

export const entityDetailProvider = (eids: number | number[], needed: boolean = true) => {
  const requestPrefix = `${process.env.REACT_APP_API_URL || ''}`
  const query = eids instanceof Array ? eids.join() : eids
  return {
    ref: `entityDetail-${query}`,
    getData: [
      fetch,
      `${requestPrefix}/api/v/getInfos?eids=${query}`,
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
