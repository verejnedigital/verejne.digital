// @flow
import {setEntities} from '../actions/verejneActions'
import {ENTITY_ZOOM, SUB_CITY_ZOOM, CITY_ZOOM} from '../constants'

import type {MapReference} from '../state'

export const getZoomLevel = (mapReference: MapReference): number => {
  const zoom = mapReference.getZoom()
  return [ENTITY_ZOOM, SUB_CITY_ZOOM, CITY_ZOOM].filter((val) => val > zoom).length
}

const DEFAULT_ENTITIES_REQUEST_PARAMS = {
  lat1: '47.26036122625137',
  lng1: '16.53369140625',
  lat2: '49.90503005077024',
  lng2: '22.46630859375',
  restrictToSlovakia: true,
  usedLevel: 3,
}

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

const dispatchEntities = () => (ref: string, data, dispatch) =>
  dispatch(
    setEntities(
      data.map(({eid, lat, lng, name, size, ds}) => ({
        eid,
        lat,
        lng,
        name,
        size,
        ds,
      }))
    )
  )

export const getEntitiesUrlFromMapReference = (mapReference) => {
  const {lat1, lng1, lat2, lng2, restrictToSlovakia, usedLevel} = getRequestParams(mapReference)
  const requestPrefix = `${process.env.REACT_APP_API_URL || ''}`
  const restrictToSlovakiaParam = restrictToSlovakia ? '&restrictToSlovakia=true' : ''
  return `${requestPrefix}/api/v/getEntities?level=${usedLevel}&lat1=${lat1}&lng1=${lng1}&lat2=${lat2}&lng2=${lng2}${restrictToSlovakiaParam}`
}

export const entitiesProvider = (mapReference: MapReference) => {
  const url = getEntitiesUrlFromMapReference(mapReference)
  return {
    ref: url,
    getData: [
      fetch,
      url,
      {
        accept: 'application/json',
      },
    ],
    onData: [dispatchEntities],
    keepAliveFor: 1000 * 60 * 600,
    needed: false,
  }
}
