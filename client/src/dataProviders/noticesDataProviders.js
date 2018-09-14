// @flow
import {dispatchReceivedData} from './dataProvidersUtils'
import {DEFAULT_PROVIDER_KEEP_ALIVE} from '../constants'
import {mapObjToId} from '../utils'
import {updateValue} from '../actions/sharedActions'
import type {Notice} from '../state'
import type {Dispatch} from '../types/reduxTypes'

const dispatchNoticesList = () => (ref: string, data: Array<Notice>, dispatch: Dispatch) =>
  dispatch(updateValue(['notices', 'list'], data, ref))

export const noticesProvider = () => ({
  ref: 'notices',
  getData: [
    fetch,
    `${process.env.REACT_APP_API_URL || ''}/api/o/list_notices`,
    {
      accept: 'application/json',
    },
  ],
  onData: [dispatchNoticesList],
  keepAliveFor: DEFAULT_PROVIDER_KEEP_ALIVE,
})

export const noticeDetailProvider = (id: string) => ({
  ref: `noticeDetail-${id}`,
  getData: [
    fetch,
    `${process.env.REACT_APP_API_URL || ''}/api/o/info_notice?id=${id}`,
    {
      accept: 'application/json',
    },
  ],
  onData: [dispatchReceivedData, ['notices', 'details'], mapObjToId, id],
  keepAliveFor: 60 * 60 * 1000,
})
