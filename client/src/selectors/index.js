// @flow
import {createSelector} from 'reselect'
import qs from 'qs'
import {
  paginationChunkSize,
  VEREJNE_MAX_PAGE_ITEMS,
  clusterOptions,
  ENTITY_ZOOM,
  SUB_CITY_ZOOM,
  CITY_ZOOM,
  DEFAULT_ENTITIES_REQUEST_PARAMS,
} from '../constants'
import {values} from '../utils'
import {sortBy, chunk, map} from 'lodash'
import supercluster from 'points-cluster'

import type {Location} from 'react-router-dom'
import type {NoticesOrdering} from '../components/Notices/NoticeList'
import type {NoticeDetailProps} from '../components/Notices/NoticeDetail'

import type {CompanyDetailsProps} from '../components/Notices/CompanyDetails'
import type {State, MapOptions, Entity, MapBounds} from '../state'

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

export const locationSearchSelector = (_: State, props: {location: Location}) =>
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
    return chunk(notices, paginationChunkSize)[page - 1]
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
export const entitiesSelector = (state: State): ?Array<Entity> => state.entities
export const currentPageSelector = (state: State): number => state.publicly.currentPage

export const entitiesLengthSelector = createSelector(
  entitiesSelector,
  (entities) => (entities ? entities.length : 0)
)

export const pageCountSelector = createSelector(
  entitiesSelector,
  (entities) => (entities ? Math.ceil(entities.length / VEREJNE_MAX_PAGE_ITEMS) : 0)
)

export const currentPageEntities = createSelector(
  entitiesSelector,
  currentPageSelector,
  (entities, currentPage) => {
    return chunk(entities, VEREJNE_MAX_PAGE_ITEMS)[currentPage - 1]
  }
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

const getClusters = (mapOptions: MapOptions, entities: ?Array<Entity>): Array<SuperCluster> => {
  const clusters = supercluster(entities, clusterOptions)
  return clusters(mapOptions)
}

const createClusters = (mapOptions: MapOptions, entities: ?Array<Entity>): Array<MapCluster> => {
  if (!mapOptions.bounds || !entities) return []
  return getClusters(mapOptions, entities).map(({wx, wy, numPoints, points}, i) => {
    return {
      lat: wy,
      lng: wx,
      numPoints,
      id: `${i}`,
      points,
    }
  })
}

export const clustersSelector = createSelector(
  mapOptionsSelector,
  entitiesSelector,
  (mapOptions, entities) => map(createClusters(mapOptions, entities))
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

export const entitiesUrlSelector = createSelector(
  requestParamsSelector,
  ({lat1, lng1, lat2, lng2, restrictToSlovakia, usedLevel}) => {
    const requestPrefix = `${process.env.REACT_APP_API_URL || ''}`
    const restrictToSlovakiaParam = restrictToSlovakia ? '&restrictToSlovakia=true' : ''
    return `${requestPrefix}/api/v/getEntities?level=${usedLevel}&lat1=${lat1}&lng1=${lng1}&lat2=${lat2}&lng2=${lng2}${restrictToSlovakiaParam}`
  }
)
