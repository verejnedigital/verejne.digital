// @flow
import {dispatchReceivedData} from './dataProvidersUtils'

export const obstaravaniaProvider = () => ({
  ref: 'obstaravania',
  getData: [
    fetch,
    `${process.env.REACT_APP_API_URL || ''}/api/o/list_obstaravania`,
    {
      accept: 'application/json',
    },
  ],
  onData: [dispatchReceivedData, ['obstaravania', 'data']],
})
