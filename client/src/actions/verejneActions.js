// @flow
import {zoomSelector, mapOptionsSelector} from '../selectors'
import {fromPairs} from 'lodash'

import type {
  MapOptions,
  Center,
  Address,
  NewEntityState,
  NewEntity,
  NewEntityDetails,
} from '../state'
import type {GenericAction, Thunk} from '../types/reduxTypes'
import type {ObjectMap} from '../types/commonTypes'

export const setAddresses = (addresses: Address[]) => ({
  type: 'Set addresses',
  path: ['addresses'],
  payload: addresses,
  reducer: () => fromPairs(addresses.map((address) => [address.address_id, address])),
})

export const setEntities = (
  entities: NewEntity[],
  addressId: number
): GenericAction<ObjectMap<NewEntityState>, NewEntity[]> => ({
  type: 'Set entities',
  path: ['entities'],
  payload: entities,
  reducer: (state) => ({
    ...state,
    ...fromPairs(entities.map((entity) => [entity.id, {addressId, ...entity}])),
  }),
})

export const setEntityDetail = (entityDetails: NewEntityDetails, entityId: number) => ({
  type: 'Set entity detail',
  path: ['entityDetails', entityId],
  payload: entityDetails,
  reducer: () => entityDetails,
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

export const closeAddressDetail = () => ({
  type: 'Close address detail',
  path: ['publicly', 'openedAddressDetail'],
  reducer: () => null,
})
