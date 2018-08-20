// @flow
import {receiveData} from '../actions/sharedActions'

import type {Company} from '../state'
import type {Dispatch} from '../types/reduxTypes'

const dispatchCompanyDetails = (eid: number) => (
  ref: string,
  data: Company,
  dispatch: Dispatch
) => {
  dispatch(receiveData(['companies'], {id: eid, eid, ...data}, ref))
}

export const companyDetailProvider = (eid: number) => {
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
  }
}
