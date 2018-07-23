// @flow
import {createSelector} from 'reselect'
import qs from 'qs'
import {
  PAGINATION_CHUNK_SIZE,
  clusterOptions,
  ENTITY_ZOOM,
  SUB_CITY_ZOOM,
  CITY_ZOOM,
  DEFAULT_ENTITIES_REQUEST_PARAMS,
} from '../constants'
import {values} from '../utils'
import {sortBy, chunk, filter} from 'lodash'
import supercluster from 'points-cluster'

import type {ContextRouter} from 'react-router-dom'
import type {NoticesOrdering} from '../components/Notices/NoticeList'
import type {NoticeDetailProps} from '../components/Notices/NoticeDetail'

import type {CompanyDetailsProps} from '../components/shared/CompanyDetails'
import type {State, MapOptions, Entity, MapBounds, EntityDetails} from '../state'

export const paramsIdSelector = (_: State, props: ContextRouter): string =>
  props.match.params.id || '0'

export const noticeDetailSelector = (state: State, props: NoticeDetailProps) =>
  props.match.params.id && state.notices.details[props.match.params.id]

export const companyDetailsSelector = (state: State, props: CompanyDetailsProps) => {
  return props.eid && state.companies[props.eid]
}

export const dateSortedNoticesSelector = createSelector(
  (state: State) => state.notices.list,
  (data) => sortBy(values(data), ['bulletin_year', 'bulletin_month', 'bulletin_day'])
)

export const nameSortedNoticesSelector = createSelector(
  (state: State) => state.notices.list,
  (data) => sortBy(values(data), ['title'])
)

export const locationSearchSelector = (_: State, props: ContextRouter) =>
  qs.parse(props.location.search.slice(1))

export const paginationSelector = createSelector(
  locationSearchSelector,
  (query) => Number.parseInt(query.page, 10) || 1
)

export const noticesOrderingSelector = createSelector(
  locationSearchSelector,
  (query): NoticesOrdering => query.ordering || 'date'
)

export const paginatedNoticesSelector = createSelector(
  dateSortedNoticesSelector,
  nameSortedNoticesSelector,
  noticesOrderingSelector,
  paginationSelector,
  (dateSorted, nameSorted, orderBy, page) => {
    const notices = orderBy === 'title' ? nameSorted : dateSorted
    return chunk(notices, PAGINATION_CHUNK_SIZE)[page - 1]
  }
)

// not the most elegant, but presently we need the whole list
// sorted by date anyway
export const newestBulletinDateSelector = createSelector(
  dateSortedNoticesSelector,
  (notices) => notices[0].bulletin_date
)

// will make more sense once we allow searching on notices
// (filtered notices will then be the input selector)
export const noticesLengthSelector = createSelector(
  dateSortedNoticesSelector,
  nameSortedNoticesSelector,
  noticesOrderingSelector,
  (dateSorted, nameSorted, orderBy, page) => {
    const notices = orderBy === 'title' ? nameSorted : dateSorted
    return notices.length
  }
)

export const mapOptionsSelector = (state: State): MapOptions => state.mapOptions
export const centerSelector = (state: State): [number, number] => state.mapOptions.center
export const zoomSelector = (state: State): number => state.mapOptions.zoom
export const boundsSelector = (state: State): ?MapBounds => state.mapOptions.bounds
export const addressesSelector = (state: State) => state.addresses
export const showInfoSelector = (state: State) => state.publicly.showInfo
export const openedAddressDetailSelector = (state: State) => state.publicly.openedAddressDetail
export const newEntitiesSelector = (state: State) => state.newEntities
export const entityDetailSelector = (state: State, entityId: string): EntityDetails =>
  state.entityDetails[entityId]

export const addressEntitiesSelector = createSelector(
  newEntitiesSelector,
  openedAddressDetailSelector,
  (entities, addressId) => filter(entities, (entity) => entity.addressId === addressId)
)

type SuperCluster = {
  numPoints: number,
  points: Array<Entity>,
  wx: number, // weighted cluster center
  wy: number,
  x: number, // cluster center
  y: number,
  zoom: number,
}

export type MapCluster = {
  lat: number,
  lng: number,
  numPoints: number,
  id: string,
  points: Array<any>,
}

type EntitiesRequestParams = {
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  restrictToSlovakia: boolean,
  usedLevel: number,
}

const getClusters = (mapOptions: MapOptions, addresses): Array<SuperCluster> => {
  const clusters = supercluster(addresses, clusterOptions)
  return clusters(mapOptions)
}

const createClusters = (mapOptions: MapOptions, addresses): Array<MapCluster> => {
  if (!mapOptions.bounds || !addresses) return []
  return getClusters(mapOptions, Object.values(addresses)).map(
    ({wx, wy, numPoints, points}, i) => ({
      lat: wy,
      lng: wx,
      numPoints,
      id: `${i}`,
      points,
    })
  )
}

export const clustersSelector = createSelector(
  mapOptionsSelector,
  addressesSelector,
  (mapOptions, addresses) => createClusters(mapOptions, addresses)
)

const requestParamsSelector = createSelector(
  boundsSelector,
  zoomSelector,
  (bounds, zoom): EntitiesRequestParams => {
    let params = DEFAULT_ENTITIES_REQUEST_PARAMS
    if (bounds) {
      params = {
        lat1: bounds.sw.lat,
        lng1: bounds.sw.lng,
        lat2: bounds.ne.lat,
        lng2: bounds.ne.lng,
        restrictToSlovakia: false,
        usedLevel: [ENTITY_ZOOM, SUB_CITY_ZOOM, CITY_ZOOM].filter((val) => val > zoom).length,
      }
    }
    return params
  }
)

export const addressesUrlSelector = createSelector(
  requestParamsSelector,
  ({lat1, lng1, lat2, lng2, restrictToSlovakia, usedLevel}) => {
    const requestPrefix = `${process.env.REACT_APP_API_URL || ''}`
    const restrictToSlovakiaParam = restrictToSlovakia ? '&restrictToSlovakia=true' : ''
    return `${requestPrefix}/api/v/getAddresses?level=${usedLevel}&lat1=${lat1}&lng1=${lng1}&lat2=${lat2}&lng2=${lng2}${restrictToSlovakiaParam}`
  }
)

export const entitiesUrlSelector = createSelector(
  requestParamsSelector,
  ({lat1, lng1, lat2, lng2, restrictToSlovakia, usedLevel}) => {
    const requestPrefix = `${process.env.REACT_APP_API_URL || ''}`
    const restrictToSlovakiaParam = restrictToSlovakia ? '&restrictToSlovakia=true' : ''
    return `${requestPrefix}/api/v/getEntities?level=${usedLevel}&lat1=${lat1}&lng1=${lng1}&lat2=${lat2}&lng2=${lng2}${restrictToSlovakiaParam}`
  }
)

export const autocompleteValueSelector = (state: State) => state.publicly.autocompleteValue
export const autocompleteOptionsSelector = createSelector(boundsSelector, (bounds) => {
  return {
    bounds: bounds && {
      east: bounds.ne.lng,
      north: bounds.ne.lat,
      west: bounds.sw.lng,
      south: bounds.sw.lat,
    },
  }
})

export const entitySearchModalOpenSelector = (state: State) => state.publicly.entitySearchModalOpen
export const entitySearchForSelector = (state: State) => state.publicly.entitySearchFor
export const entitySearchEidsSelector = (state: State) => state.publicly.entitySearchEids
