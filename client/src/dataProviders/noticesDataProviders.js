// @flow
import {dispatchReceivedData} from './dataProvidersUtils'

export const noticesProvider = () => ({
  ref: 'notices',
  getData: [
    fetch,
    `${process.env.REACT_APP_API_URL || ''}/api/o/list_obstaravania`,
    {
      accept: 'application/json',
    },
  ],
  onData: [dispatchReceivedData, ['notices', 'data']],
})

export const noticeDetailProvider = (id: string) => ({
  ref: 'noticeDetail',
  getData: [
    fetch,
    `${process.env.REACT_APP_API_URL || ''}/api/o/info_obstaravanie?id=${id}`,
    {
      accept: 'application/json',
    },
  ],
  onData: [dispatchReceivedData, ['notices', 'data']],
})
