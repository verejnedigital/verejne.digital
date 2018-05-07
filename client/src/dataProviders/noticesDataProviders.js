// @flow
import {dispatchReceivedData} from './dataProvidersUtils'

export const noticesProvider = () => ({
  ref: 'notices',
  getData: [
    fetch,
    `${process.env.REACT_APP_API_URL || ''}/api/o/list_notices`,
    {
      accept: 'application/json',
    },
  ],
  onData: [dispatchReceivedData, ['notices', 'data']],
})
