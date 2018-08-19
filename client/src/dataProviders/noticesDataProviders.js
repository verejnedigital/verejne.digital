// @flow
import {dispatchReceivedData} from './dataProvidersUtils'
import {DEFAULT_PROVIDER_KEEP_ALIVE} from '../constants'
import {mapObjToId} from '../utils'

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
  keepAliveFor: DEFAULT_PROVIDER_KEEP_ALIVE,
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
  onData: [dispatchReceivedData, ['notices', 'details'], mapObjToId, id],
  keepAliveFor: 60 * 60 * 1000,
})
