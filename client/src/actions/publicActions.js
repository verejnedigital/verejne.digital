// @flow
import {fromPairs} from 'lodash'
import {zoomSelector, mapOptionsSelector} from '../selectors'
import type {ObjectMap} from '../types/commonTypes'
import type {
  MapOptions,
  Center,
  Address,
  NewEntityState,
  NewEntity,
  NewEntityDetail,
} from '../state'
import type {GenericAction, Thunk} from '../types/reduxTypes'

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

export const setEntityDetails = (
  entityDetails: ObjectMap<NewEntityDetail>
): GenericAction<ObjectMap<NewEntityDetail>, ObjectMap<NewEntityDetail>> => ({
  type: 'Set entity detail',
  path: ['entityDetails'],
  payload: entityDetails,
  reducer: (state) => ({
    ...state,
    ...entityDetails,
  }),
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

export const setModal = (open: boolean) => ({
  type: 'Set modal',
  path: ['publicly', 'entitySearchModalOpen'],
  reducer: () => open,
})

export const setEntitySearchFor = (searchFor: string) => ({
  type: 'Set entity search for pattern',
  path: ['publicly', 'entitySearchFor'],
  payload: searchFor,
  reducer: () => searchFor,
})

export const setEntitySearchEids = (eids: Array<{eid: number}>) => ({
  type: 'Set entity search eids',
  path: ['publicly', 'entitySearchEids'],
  payload: eids,
  reducer: (): Array<number> => eids.map((e) => e.eid),
})

export const toggleEntityInfo = (eid: number) => ({
  type: 'Toggle entity info',
  path: ['publicly', 'showInfo', eid],
  reducer: (open: boolean): boolean => !open,
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

export const toggleDrawer = () => ({
  type: 'Toggle drawer',
  path: ['publicly', 'drawerOpen'],
  reducer: (open: boolean) => !open,
})

export const setDrawer = (open: boolean) => ({
  type: 'Set drawer',
  path: ['publicly', 'drawerOpen'],
  reducer: () => open,
})
