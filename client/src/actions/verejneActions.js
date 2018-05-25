// @flow
import {mapReferenceSelector} from '../selectors'
import {ENTITY_ZOOM, SUB_CITY_ZOOM, CITY_ZOOM} from '../constants'

import type {MapReference, MapOptions, Entity, State} from '../state'
import type {Thunk} from '../types/reduxTypes'

const DEFAULT_ENTITIES_REQUEST_PARAMS = {
  lat1: '47.26036122625137',
  lng1: '16.53369140625',
  lat2: '49.90503005077024',
  lng2: '22.46630859375',
  restrictToSlovakia: true,
  usedLevel: 3,
}

const customFetch = (url, options) => {
  return fetch(url, options).then((response) => response.json())
}

export const getZoomLevel = (mapReference: MapReference): number => {
  const zoom = mapReference.getZoom()
  return [ENTITY_ZOOM, SUB_CITY_ZOOM, CITY_ZOOM].filter((val) => val >= zoom).length
}

export const setMapReference = (mapReference: MapReference) => ({
  type: 'Set map reference',
  path: ['mapReference'],
  payload: mapReference,
  reducer: (state: State) => mapReference,
})

export const setEntities = (entities: Array<Entity>) => ({
  type: 'Set entities',
  path: ['entities'],
  payload: entities,
  reducer: (state: State) => entities,
})

export const setMapOptions = (mapOptions: MapOptions) => ({
  type: 'Set map options',
  path: ['mapOptions'],
  payload: mapOptions,
  reducer: (state: State) => mapOptions,
})

const getRequestParams = (mapReference) => {
  let params = DEFAULT_ENTITIES_REQUEST_PARAMS
  if (mapReference) {
    const bounds = mapReference.getBounds()
    if (bounds != null && bounds !== undefined) {
      params = {
        lat1: bounds.getSouthWest().lat(),
        lng1: bounds.getSouthWest().lng(),
        lat2: bounds.getNorthEast().lat(),
        lng2: bounds.getNorthEast().lng(),
        restrictToSlovakia: false,
        usedLevel: getZoomLevel(mapReference),
      }
    }
  }
  return params
}

// TODO use data provider
const serverURL = 'https://verejne.digital/api/v/'
export const fetchEntities = (): Thunk => async (dispatch, getState, {logger}) => {
  logger.log('Fetch map entities')
  const mapReference = mapReferenceSelector(getState())
  const {lat1, lng1, lat2, lng2, restrictToSlovakia, usedLevel} = getRequestParams(mapReference)
  const req = `${serverURL}getEntities?level=${usedLevel}&lat1=${lat1}&lng1=${lng1}&lat2=${lat2}&lng2=${lng2}${
    restrictToSlovakia ? '&restrictToSlovakia=true' : ''
  }`
  const entities = await customFetch(req)
  dispatch(
    setEntities(
      entities.map(({eid, lat, lng, name, size, ds}) => ({
        eid,
        lat,
        lng,
        name,
        size,
        ds,
        usedLevel,
      }))
    )
  )
}

export const initializeGoogleMap = (mapReference: MapReference): Thunk => (
  dispatch,
  getState,
  {logger}
) => {
  logger.log('Initialize map')
  dispatch(setMapReference(mapReference))
  dispatch(fetchEntities())
}

export const updateMapOptions = (mapOptions: MapOptions): Thunk => (
  dispatch,
  getState,
  {logger}
) => {
  logger.log('Update map options')
  dispatch(setMapOptions(mapOptions))
  dispatch(fetchEntities())
}
