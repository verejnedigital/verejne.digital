// @flow
import {zoomSelector, mapOptionsSelector} from '../selectors'
import {ENTITY_CLOSE_ZOOM, ENTITY_ZOOM} from '../constants'
import {isIndividual} from '../components/Verejne/entityHelpers'
import {reverse, sortBy} from 'lodash'

import type {MapOptions, Entity, Center} from '../state'
import type {Thunk} from '../types/reduxTypes'

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

export const zoomToLocation = (center: Center, withZoom?: number): Thunk => (
  dispatch,
  getState
) => {
  const state = getState()
  const zoom = withZoom || zoomSelector(getState()) + 1
  dispatch(setMapOptions({...mapOptionsSelector(state), zoom, center: [center.lat, center.lng]}))
}

export const selectEntity = (entity: Entity): Thunk => (dispatch, getState, {logger}) => {
  //logger.log(`Select entity ${entity.name}`)
  const zoom = isIndividual(entity.eid) ? ENTITY_CLOSE_ZOOM : ENTITY_ZOOM
  dispatch(
    setMapOptions({
      ...mapOptionsSelector(getState()),
      zoom,
      center: [parseFloat(entity.lat), parseFloat(entity.lng)],
    })
  )
}

export const setCurrentPage = (newPage: number) => ({
  type: 'Set current page',
  path: ['publicly', 'currentPage'],
  payload: newPage,
  reducer: () => newPage,
})

export const setAutocompleteValue = (value: string) => ({
  type: 'Set autocomplete value',
  path: ['publicly', 'autocompleteValue'],
  payload: value,
  reducer: () => value,
})

export const toggleModalOpen = () => ({
  type: 'Toggle modal open',
  path: ['publicly', 'entitySearchModalOpen'],
  reducer: (open: boolean) => !open,
})

export const setEntitySearchFor = (searchFor: string) => ({
  type: 'Set entity search for pattern',
  path: ['publicly', 'entitySearchFor'],
  payload: searchFor,
  reducer: () => searchFor,
})

export const setEntitySearchEids = (entity: Array<{eid: string}>) => ({
  type: 'Set entity search eids',
  path: ['publicly', 'entitySearchEids'],
  payload: entity,
  reducer: (): Array<string> => entity.map((e) => e.eid),
})
