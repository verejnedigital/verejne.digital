// @flow
import {setColabs} from '../actions/colabActions'
import type {Colab} from '../state'
import type {Dispatch} from '../types/reduxTypes'

const dispatchColabs = () => (ref: string, data: Colab[], dispatch: Dispatch) => {
  dispatch(setColabs(data))
}

export const colabsProvider = () => ({
  ref: 'colabs',
  getData: [
    fetch,
    `${process.env.REACT_APP_API_URL || ''}/api/d/colabs_info`,
    {
      accept: 'application/json',
    },
  ],
  onData: [dispatchColabs],
  keepAliveFor: 60 * 60 * 1000,
  needed: true,
})
