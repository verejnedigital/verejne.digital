// @flow
import {dispatchReceivedData} from './dataProvidersUtils'
import {receiveCompanyDetails} from '../actions/noticesActions'
import type {Dispatch, Path} from '../types/reduxTypes'

const dispatchReceivedCompanyDetails = (path: Path, eid: string) => (
  ref: string,
  data: any,
  dispatch: Dispatch
) => {
  dispatch(receiveCompanyDetails(path, data, ref, eid))
}

export const noticesProvider = () => ({
  ref: 'notices',
  getData: [
    fetch,
    `${process.env.REACT_APP_API_URL || ''}/api/o/list_obstaravania`,
    {
      accept: 'application/json',
    },
  ],
  onData: [dispatchReceivedData, ['notices', 'list']],
  keepAliveFor: 10 * 60 * 1000,
})

export const noticeDetailProvider = (id: string) => ({
  ref: `noticeDetail-${id}`,
  getData: [
    fetch,
    `${process.env.REACT_APP_API_URL || ''}/api/o/info_obstaravanie?id=${id}`,
    {
      accept: 'application/json',
    },
  ],
  onData: [dispatchReceivedData, ['notices', 'details']],
  keepAliveFor: 60 * 60 * 1000,
})

export const companyDetailsProvider = (eid: string) => ({
  ref: `companyDetails-${eid}`,
  getData: [
    fetch,
    `${process.env.REACT_APP_API_URL || ''}/api/v/getInfo?eid=${eid}`,
    {
      accept: 'application/json',
    },
  ],
  onData: [dispatchReceivedCompanyDetails, ['companies'], eid],
  keepAliveFor: 60 * 60 * 1000,
})
