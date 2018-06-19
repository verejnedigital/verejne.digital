// @flow
import React from 'react'
import {setEntities, setEntitySearchEids} from '../actions/verejneActions'

import type {Entity} from '../state'
import type {Dispatch} from '../types/reduxTypes'

const dispatchEntities = () => (ref: string, data: Array<Entity>, dispatch: Dispatch) =>
  dispatch(setEntities(data))

const dispatchSearchEids = () => (ref: string, data: Array<{eid: string}>, dispatch: Dispatch) =>
  dispatch(setEntitySearchEids(data))

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
