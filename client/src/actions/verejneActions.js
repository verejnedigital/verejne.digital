// @flow
import {zoomSelector, mapOptionsSelector} from '../selectors'
import {ENTITY_CLOSE_ZOOM, ENTITY_ZOOM} from '../constants'
import {isIndividual} from '../components/Verejne/entityHelpers'
import {reverse, sortBy, fromPairs} from 'lodash'

import type {MapOptions, Entity, Center} from '../state'
import type {Thunk} from '../types/reduxTypes'

export const setAddresses = (addresses) => ({
  type: 'Set addresses',
  path: ['addresses'],
  payload: addresses,
  reducer: () => fromPairs(addresses.map((address) => [address.address_id, address])),
})

export const setNewEntities = (entities, addressId) => ({
  type: 'Set new entities',
  path: ['newEntities'],
  payload: entities,
  reducer: (state) => ({
    ...state,
    ...fromPairs(entities.map((entity) => [entity.id, {addressId, ...entity}])),
  }),
})

export const setNewEntityDetail = (entity, entityId) => ({
  type: 'Set new entity detail',
  path: ['entityDetails', entityId],
  payload: entity,
  reducer: (state) => entity,
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

export const zoomToLocation = (center: Center, withZoom?: number): Thunk => (
  dispatch,
  getState
) => {
  const state = getState()
  const zoom = withZoom || zoomSelector(getState()) + 1
  dispatch(setMapOptions({...mapOptionsSelector(state), zoom, center: [center.lat, center.lng]}))
}

export const selectEntity = (entity: Entity): Thunk => (dispatch, getState) => {
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

export const toggleEntityInfo = (eid: number) => ({
  type: 'Toggle entity info',
  path: ['publicly', 'showInfo', eid],
  reducer: (open: boolean) => !open,
})

export const openAddressDetail = (addressId: number) => ({
  type: 'Open address detail',
  path: ['publicly', 'openedAddressDetail'],
  reducer: () => addressId,
})
