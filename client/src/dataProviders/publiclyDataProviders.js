// @flow
import {
  setEntitySearchEids,
  setAddresses,
  setEntities,
  setEntityDetail,
} from '../actions/verejneActions'
import {EntityDetailLoading, ModalLoading} from '../components/Loading/'
import type {Address, NewEntity, NewEntityDetail} from '../state'
import type {Dispatch} from '../types/reduxTypes'

const dispatchSearchEids = () => (ref: string, data: Array<{eid: string}>, dispatch: Dispatch) =>
  dispatch(setEntitySearchEids(data))

const dispatchAddresses = () => (ref: string, data: Address[], dispatch: Dispatch) => {
  dispatch(setAddresses(data))
}

const dispatchEntities = () => (ref: number[], data: NewEntity[], dispatch: Dispatch) => {
  dispatch(setEntities(data, ref[1]))
}

const dispatchEntityDetail = () => (ref: number[], data: NewEntityDetail, dispatch: Dispatch) => {
  dispatch(setEntityDetail(data[ref[1]], ref[1]))
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
    keepAliveFor: 60 * 60 * 1000,
    needed: false,
  }
}

export const entityDetailProvider = (entityId: string) => {
  const requestPrefix = `${process.env.REACT_APP_API_URL || ''}`
  return {
    ref: ['entityDetail', entityId],
    getData: [
      fetch,
      `${requestPrefix}/api/v/getInfos?eids=${entityId}`,
      {
        accept: 'application/json',
      },
    ],
    onData: [dispatchEntityDetail],
    keepAliveFor: 60 * 60 * 1000,
    loadingComponent: <EntityDetailLoading />,
  }
}

export const addressEntitiesProvider = (addressId: string) => {
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

export const entitiesSearchResultEidsProvider = (searchFor: string) => {
  return {
    ref: searchFor,
    getData: [
      fetch,
      `${process.env.REACT_APP_API_URL || ''}/api/v/searchEntity?text=${searchFor}`,
      {
        accept: 'application/json',
      },
    ],
    onData: [dispatchSearchEids],
    loadingComponent: <ModalLoading />,
  }
}
