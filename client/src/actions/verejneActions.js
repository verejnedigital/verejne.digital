import {PATH_MAP, mapReferenceSelector, PATH_MAP_OPTIONS, Entity} from '../state/VerejneState'
import {ENTITY_ZOOM, SUB_CITY_ZOOM, CITY_ZOOM} from '../constants'

const customFetch = (url, options) => {
  return fetch(url, options).then((response) => response.json())
}

export const getZoomLevel = (mapReference) => {
  if (!mapReference) return []
  const zoom = mapReference.getZoom() || 0
  return [ENTITY_ZOOM, SUB_CITY_ZOOM, CITY_ZOOM].reduce((acc, val) => acc + (val >= zoom ? 1 : 0), 0)
}


export const setMapReference = (mapReference) => ({
  type: 'Set map reference',
  path: [...PATH_MAP, 'mapReference'],
  payload: mapReference,
  reducer: (state) => mapReference,
})

export const setEntities = (entities) => ({
  type: 'Set entities',
  path: [...PATH_MAP, 'entities'],
  payload: entities,
  reducer: (state) => entities,
})

export const setMapOptions = (mapOptions) => ({
  type: 'Set map options',
  path: PATH_MAP_OPTIONS,
  payload: mapOptions,
  reducer: (state) => mapOptions,
})

const serverURL = 'https://verejne.digital/api/v/'
export const fetchEntities = () => async (dispatch, getState, {api, logger}) => {
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
    entities.map(({eid, lat, lng, name, size, ds}) => new Entity({
      eid, lat, lng, name, size, ds, usedLevel,
    }))
  ))
}

export const initializeGoogleMap = (mapReference) => async (dispatch, getState, {logger}) => {
  logger.log('Initialize map')
  dispatch(setMapReference(mapReference))
  dispatch(fetchEntities())
}

export const updateMapOptions = (mapOptions) => async (dispatch, getState, {logger}) => {
  logger.log('Update map options')
  dispatch(setMapOptions(mapOptions))
  dispatch(fetchEntities())
}
