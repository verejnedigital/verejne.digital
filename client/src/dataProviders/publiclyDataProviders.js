// @flow
import {setEntities} from '../actions/verejneActions'
import {ENTITY_ZOOM, SUB_CITY_ZOOM, CITY_ZOOM, DEFAULT_ENTITIES_REQUEST_PARAMS} from '../constants'

import type {MapReference, Entity} from '../state'
import type {Dispatch} from '../types/reduxTypes'

type EntitiesRequestParams = {
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  restrictToSlovakia: boolean,
  usedLevel: number,
}

const getZoomLevel = (mapReference: MapReference): number => {
  const zoom = mapReference.getZoom()
  return [ENTITY_ZOOM, SUB_CITY_ZOOM, CITY_ZOOM].filter((val) => val > zoom).length
}

const getRequestParams = (mapReference: MapReference): EntitiesRequestParams => {
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

const dispatchEntities = () => (ref: string, data: Array<Entity>, dispatch: Dispatch) =>
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

export const getEntitiesUrlFromMapReference = (mapReference: MapReference): string => {
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
    keepAliveFor: 60 * 60 * 1000,
    needed: false,
  }
}
