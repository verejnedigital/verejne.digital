// @flow
import {setAddresses, setEntities} from '../actions/publicActions'
import type {Address, NewEntity} from '../state'
import type {Dispatch} from '../types/reduxTypes'

const dispatchAddresses = () => (ref: string, data: Address[], dispatch: Dispatch) => {
  dispatch(setAddresses(data))
}

const dispatchEntities = () => (ref: number[], data: NewEntity[], dispatch: Dispatch) => {
  dispatch(setEntities(data, ref[1]))
}

export const addressesProvider = (addressesUrl: string) => {
  return {
    ref: addressesUrl,
    getData: [
      fetch,
      addressesUrl,
      {
        accept: 'application/json',
      },
    ],
    onData: [dispatchAddresses],
    needed: false,
  }
}

export const addressEntitiesProvider = (addressId: number) => {
  const requestPrefix = `${process.env.REACT_APP_API_URL || ''}`
  return {
    ref: ['addressEntities', addressId],
    getData: [
      fetch,
      `${requestPrefix}/api/v/getEntitiesAtAddressId?address_id=${addressId}`,
      {
        accept: 'application/json',
      },
    ],
    onData: [dispatchEntities],
    keepAliveFor: 60 * 60 * 1000,
  }
}
