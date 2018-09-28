// @flow
import {fromPairs, keyBy, map} from 'lodash'
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
    ...keyBy(map(entityDetails, (e, key) => ({...e, eid: Number.parseInt(key, 10)})), (e) =>
      e.eid.toString()
    ),
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
export const makeLocationsSelected = (points: Center[]) => ({
  type: 'Make Location Selected',
  path: ['publicly', 'selectedLocations'],
  payload: points,
  reducer: () => points,
})

export const toggleEntitySearchOpen = () => ({
  type: 'Toggle sidebar search open',
  path: ['publicly', 'entitySearchOpen'],
  reducer: (open: boolean) => !open,
})

export const deselectLocations = () => ({
  type: 'Unselect Location',
  path: ['publicly', 'selectedLocations'],
  payload: null,
  reducer: () => null,
})

export const toggleModalOpen = () => ({
  type: 'Toggle modal open',
  path: ['publicly', 'entityModalOpen'],
  reducer: (open: boolean) => !open,
})

export const setModalOpen = (open: boolean) => ({
  type: 'Set entity search open',
  path: ['publicly', 'entityModalOpen'],
  reducer: () => open,
})

export const setEntitySearchOpen = (open: boolean) => ({
  type: 'Set entity search open',
  path: ['publicly', 'entitySearchOpen'],
  reducer: () => open,
})

export const setEntitySearchFor = (searchFor: string) => ({
  type: 'Set entity search for pattern',
  path: ['publicly', 'entitySearchFor'],
  payload: searchFor,
  reducer: () => searchFor,
})

export const setEntitySearchLoaded = (loaded: boolean) => ({
  type: 'Set entity search loaded pattern',
  path: ['publicly', 'entitySearchLoaded'],
  payload: loaded,
  reducer: () => loaded,
})

export const toggleEntityInfo = (eid: number) => ({
  type: 'Toggle entity info',
  path: ['publicly', 'showInfo', eid],
  reducer: (open: boolean): boolean => !open,
})

export const openAddressDetail = (addressIds: Array<number>) => ({
  type: 'Open address detail',
  path: ['publicly', 'openedAddressDetail'],
  reducer: () => addressIds,
})

export const closeAddressDetail = () => ({
  type: 'Close address detail',
  path: ['publicly', 'openedAddressDetail'],
  reducer: () => [],
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

export const setEntitySearchValue = (value: string) => ({
  type: 'Set entity search field value',
  path: ['publicly', 'entitySearchValue'],
  payload: value,
  reducer: () => value,
})
