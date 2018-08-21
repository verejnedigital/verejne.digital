// @flow
import React from 'react'
import {receiveData} from '../actions/sharedActions'
import {setEntityDetail} from '../actions/publicActions'
import {EntityDetailLoading} from '../components/Loading/Loading'
import type {Company, NewEntityDetail} from '../state'
import type {Dispatch} from '../types/reduxTypes'

const dispatchCompanyDetails = (eid: number) => (
  ref: string,
  data: Company,
  dispatch: Dispatch
) => {
  dispatch(receiveData(['companies'], {id: eid, eid, ...data}, ref))
}

const dispatchEntityDetail = (eid: number) => (
  ref: string,
  data: NewEntityDetail,
  dispatch: Dispatch
) => {
  dispatch(setEntityDetail(data[eid], eid))
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

export const entityDetailProvider = (eid: number, needed: boolean = true) => {
  const requestPrefix = `${process.env.REACT_APP_API_URL || ''}`
  return {
    ref: `entityDetail-${eid}`,
    getData: [
      fetch,
      `${requestPrefix}/api/v/getInfos?eids=${eid}`,
      {
        accept: 'application/json',
      },
    ],
    onData: [dispatchEntityDetail, eid],
    keepAliveFor: 60 * 60 * 1000,
    loadingComponent: <EntityDetailLoading />,
    needed,
  }
}
