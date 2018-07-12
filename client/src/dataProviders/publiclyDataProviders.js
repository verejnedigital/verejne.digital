// @flow
import React from 'react'
import {setEntities, setEntitySearchEids, setAddresses,
  setNewEntities, setNewEntityDetail} from '../actions/verejneActions'

import type {Entity} from '../state'
import type {Dispatch} from '../types/reduxTypes'

const dispatchEntities = () => (ref: string, data: Array<Entity>, dispatch: Dispatch) =>
  dispatch(setEntities(data))

const dispatchSearchEids = () => (ref: string, data: Array<{eid: string}>, dispatch: Dispatch) =>
  dispatch(setEntitySearchEids(data))

const dispatchAddresses = () => (ref: string, data, dispatch: Dispatch) => {
  dispatch(setAddresses(data))
}

const dispatchnewEntities = () => (ref, data, dispatch: Dispatch) => {
  dispatch(setNewEntities(data, ref[1]))
}

const dispatchEntityDetail = () => (ref, data, dispatch: Dispatch) => {
  dispatch(setNewEntityDetail(data[ref[1]], ref[1]))
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
    onData: [dispatchnewEntities],
    keepAliveFor: 60 * 60 * 1000,
  }
}

export const entitiesProvider = (entitiesUrl: string) => {
  return {
    ref: entitiesUrl,
    getData: [
      fetch,
      entitiesUrl,
      {
        accept: 'application/json',
      },
    ],
    onData: [dispatchEntities],
    keepAliveFor: 60 * 60 * 1000,
    needed: false,
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
  }
}

export const singleEntityProvider = (eid: string, onData: Function) => {
  return {
    ref: eid,
    getData: [
      fetch,
      `${process.env.REACT_APP_API_URL || ''}/api/v/getInfo?eid=${eid}`,
      {
        accept: 'application/json',
      },
    ],
    onData: [onData],
    loadingComponent: <div />,
  }
}
