// @flow
import {zoomSelector} from '../selectors'
import {ENTITY_CLOSE_ZOOM, ENTITY_ZOOM} from '../constants'
import {isIndividual} from '../components/Verejne/entityHelpers'
import {reverse, sortBy} from 'lodash'

import type {MapReference, MapOptions, Entity, Center} from '../state'
import type {Thunk} from '../types/reduxTypes'

export const setMapReference = (mapReference: MapReference) => ({
  type: 'Set map reference',
  path: ['mapReference'],
  payload: mapReference,
  reducer: (state: MapReference) => mapReference,
})

export const setEntities = (entities: Array<Entity>) => ({
  type: 'Set entities',
  path: ['entities'],
  payload: entities,
  reducer: (state: ?Array<Entity>) => {
    const mappedEntities = entities.map(({eid, lat, lng, name, size, ds}) => ({
      eid,
      lat,
      lng,
      name,
      size,
      ds,
    }))
    return reverse(sortBy(mappedEntities, ['size']))
  },
})

export const setMapOptions = (mapOptions: MapOptions) => ({
  type: 'Set map options',
  path: ['mapOptions'],
  payload: mapOptions,
  reducer: (state: MapOptions) => mapOptions,
})

export const setMapZoom = (newZoom: number) => ({
  type: 'Set map zoom',
  path: ['mapOptions', 'zoom'],
  payload: newZoom,
  reducer: () => newZoom,
})

export const setMapCenter = (newCenter: Center) => ({
  type: 'Set map center',
  path: ['mapOptions', 'center'],
  payload: newCenter,
  reducer: () => newCenter,
})

export const zoomToLocation = (center: Center): Thunk => (dispatch, getState) => {
  dispatch(setMapZoom(zoomSelector(getState()) + 1))
  dispatch(setMapCenter({lat: center.lat, lng: center.lng}))
}

export const selectEntity = (entity: Entity): Thunk => (dispatch, getState, {logger}) => {
  logger.log(`Select entity ${entity.name}`)
  const zoom = isIndividual(entity.eid) ? ENTITY_CLOSE_ZOOM : ENTITY_ZOOM
  dispatch(setMapZoom(zoom))
  dispatch(setMapCenter({lat: parseFloat(entity.lat), lng: parseFloat(entity.lng)}))
}

export const setCurrentPage = (newPage: number) => ({
  type: 'Set current page',
  path: ['publicly', 'currentPage'],
  payload: newPage,
  reducer: () => newPage,
})
