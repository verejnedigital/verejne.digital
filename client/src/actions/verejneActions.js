// @flow
import {mapReferenceSelector, PATH_MAP_OPTIONS} from '../selectors'
import {ENTITY_ZOOM, SUB_CITY_ZOOM, CITY_ZOOM} from '../constants'

import type {MapReference, MapOptions, Entity, State} from '../state'
import type {Thunk} from '../types/reduxTypes'

const customFetch = (url, options) => {
  return fetch(url, options).then((response) => response.json())
}

export const getZoomLevel = (mapReference: MapReference): number => {
  if (!mapReference) return 0
  const zoom = mapReference.getZoom() || 0
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
  path: PATH_MAP_OPTIONS,
  payload: mapOptions,
  reducer: (state: State) => mapOptions,
})

// TODO use data provider
const serverURL = 'https://verejne.digital/api/v/'
export const fetchEntities = (): Thunk => async (dispatch, getState, {logger}) => {
  logger.log('Fetch map entities')
  const mapReference = mapReferenceSelector(getState())
  if (!mapReference) return
  let req = `${serverURL}getEntities`
  const bounds = mapReference.getBounds()
  let lat1 = '47.26036122625137'
  let lng1 = '16.53369140625'
  let lat2 = '49.90503005077024'
  let lng2 = '22.46630859375'
  let restrictToSlovakia = true
  if (bounds != null && bounds !== undefined) {
    lat1 = bounds.getSouthWest().lat()
    lng1 = bounds.getSouthWest().lng()
    lat2 = bounds.getNorthEast().lat()
    lng2 = bounds.getNorthEast().lng()
    restrictToSlovakia = false
  }
  const usedLevel = getZoomLevel(mapReference)
  req += `?level=${usedLevel}&lat1=${lat1}&lng1=${lng1}&lat2=${lat2}&lng2=${lng2
  }${restrictToSlovakia ? '&restrictToSlovakia=true' : ''}`
  const entities = await customFetch(req)
  dispatch(setEntities(
    entities.map(({eid, lat, lng, name, size, ds}) => ({
      eid, lat, lng, name, size, ds, usedLevel,
    }))
  ))
}

export const initializeGoogleMap = (
  mapReference: MapReference
): Thunk => (dispatch, getState, {logger}) => {
  logger.log('Initialize map')
  dispatch(setMapReference(mapReference))
  dispatch(fetchEntities())
}

export const updateMapOptions = (
  mapOptions: MapOptions
):Thunk => (dispatch, getState, {logger}) => {
  logger.log('Update map options')
  dispatch(setMapOptions(mapOptions))
  dispatch(fetchEntities())
}
