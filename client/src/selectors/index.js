// @flow
import {createSelector} from 'reselect'
import qs from 'qs'
import {sortBy, filter, map, pick} from 'lodash'
import supercluster from 'points-cluster'
import type {ContextRouter} from 'react-router-dom'

import {
  clusterOptions,
  clusterOptionsCloser,
  ENTITY_ZOOM,
  SUB_CITY_ZOOM,
  CITY_ZOOM,
  DEFAULT_ENTITIES_REQUEST_PARAMS,
  COUNTRY_ZOOM,
  WORLD_ZOOM,
  SLOVAKIA_COORDINATES,
  SLOVAKIA_DISTRICT_CITIES,
  SLOVAKIA_ALL_CITIES,
} from '../constants'
import {isInSlovakia, normalizeName} from '../utils'
import type {NoticesOrdering} from '../components/Notices/NoticeList'
import type {NoticeDetailProps} from '../components/Notices/NoticeDetail'
import type {
  State,
  MapOptions,
  CompanyEntity,
  MapBounds,
  Company,
  NewEntityDetail,
  Notice,
  SearchedEntity,
  Center,
} from '../state'
import type {ObjectMap} from '../types/commonTypes'

export const paramsIdSelector = (_: State, props: ContextRouter): string =>
  props.match.params.id || '0'

export const noticeDetailSelector = (state: State, props: NoticeDetailProps) =>
  props.match.params.id && state.notices.details[props.match.params.id]

export const companyDetailSelector = (state: State, props: {eid: number}): Company | null =>
  props.eid ? state.companies[props.eid.toString()] : null

export const noticesSelector = (state: State) => state.notices.list
export const noticesSearchQuerySelector = (state: State) => normalizeName(state.notices.searchQuery)

export const searchFilteredNoticesSelector = createSelector(
  noticesSelector,
  noticesSearchQuerySelector,
  (notices: ObjectMap<Notice>, query): Array<Notice> => {
    const filteredNotices = filter(notices, (notice) => {
      return (
        normalizeName(
          notice.title
            .concat(notice.supplier_name || notice.best_supplier_name)
            .concat(Math.round(notice.best_similarity * 100).toString())
            .concat(notice.name)
        ).indexOf(query) > -1
      )
    })
    return filteredNotices.length > 0 ? filteredNotices : []
  }
)
export const dateSortedNoticesSelector = createSelector(
  searchFilteredNoticesSelector,
  (data: Array<Notice>) => sortBy(data, ['bulletin_year'])
)
export const activeNoticesSelector = createSelector(
  dateSortedNoticesSelector,
  (notices: Array<Notice>) => filter(notices, (notice) => !notice.supplier_eid)
)

export const locationSearchSelector = (_: State, props: ContextRouter) =>
  qs.parse(props.location.search.slice(1))

export const noticesOrderingSelector = createSelector(
  locationSearchSelector,
  (query): NoticesOrdering => query.ordering || 'date'
)

export const noticesLengthSelector = createSelector(activeNoticesSelector, (notices) => {
  return notices.length
})

export const mapOptionsSelector = (state: State): MapOptions => state.mapOptions
export const centerSelector = (state: State): [number, number] => state.mapOptions.center
export const zoomSelector = (state: State): number => state.mapOptions.zoom
export const boundsSelector = (state: State): ?MapBounds => state.mapOptions.bounds
export const addressesSelector = (state: State) => state.addresses
export const showInfoSelector = (state: State) => state.publicly.showInfo
export const openedAddressDetailSelector = (state: State): Array<number> =>
  state.publicly.openedAddressDetail
export const entitiesSelector = (state: State) => state.entities
export const entitySearchSelector = (state: State, query: string): SearchedEntity =>
  state.entitySearch[query]
export const entitySearchesSelector = (state: State): ObjectMap<SearchedEntity> =>
  state.entitySearch
export const allEntityDetailsSelector = (state: State): ObjectMap<NewEntityDetail> =>
  state.entityDetails
export const entityDetailSelector = (state: State, eid: number): NewEntityDetail | null => {
  if (!eid) return null
  return state.entityDetails[eid.toString()]
}
export const entityDetailsSelector = (state: State, eids: number[]): ObjectMap<NewEntityDetail> =>
  pick(state.entityDetails, eids)
export const addressEntitiesSelector = createSelector(
  entitiesSelector,
  openedAddressDetailSelector,
  (entities, addressIds: Array<number>) =>
    filter(entities, (entity) => addressIds.includes(entity.addressId))
)
export const addressEntitiesIdsSelector = createSelector(addressEntitiesSelector, (entities) =>
  entities.map((v) => v.id)
)

export const sortedAddressEntityDetailsSelector = createSelector(
  addressEntitiesIdsSelector,
  allEntityDetailsSelector,
  (entitiesIds, entityDetails) =>
    sortBy(map(entitiesIds, (eid) => entityDetails[eid.toString()]), [
      'political_entity',
      'contact_with_politics',
      'trade_with_government',
    ]).reverse()
)

export const useLabelsSelector = createSelector(
  zoomSelector,
  centerSelector,
  (zoom, center) => zoom < SUB_CITY_ZOOM && isInSlovakia(center)
)

type SuperCluster = {
  numPoints: number,
  points: Array<CompanyEntity>,
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
  setZoomTo: number,
  isLabel: boolean,
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
  const _clusterOptions = mapOptions.zoom > 18 ? clusterOptionsCloser : clusterOptions
  const clusters = supercluster(addresses, _clusterOptions)
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
      isLabel: false,
      setZoomTo: Math.min(mapOptions.zoom + 2, 22),
    })
  )
}
const createLabels = (mapOptions: MapOptions): Array<MapCluster> => {
  let labels = []
  if (mapOptions.zoom <= WORLD_ZOOM) {
    labels = [
      {
        lat: SLOVAKIA_COORDINATES[0],
        lng: SLOVAKIA_COORDINATES[1],
        numPoints: 0,
        id: 'SLOVAKIA',
        points: [],
        setZoomTo: COUNTRY_ZOOM,
        isLabel: true,
      },
    ]
  } else if (mapOptions.zoom < CITY_ZOOM) {
    labels = SLOVAKIA_DISTRICT_CITIES.map((city) => ({
      lat: city.coord[1],
      lng: city.coord[0],
      numPoints: 0,
      id: city.name,
      points: [],
      setZoomTo: SUB_CITY_ZOOM,
      isLabel: true,
    }))
  } else if (mapOptions.zoom < SUB_CITY_ZOOM) {
    labels = SLOVAKIA_ALL_CITIES.map((city) => ({
      lat: city.coord[0],
      lng: city.coord[1],
      numPoints: 0,
      id: city.name,
      points: [],
      setZoomTo: SUB_CITY_ZOOM,
      isLabel: true,
    }))
  }

  return labels
}

export const selectedLocationsSelector = (state: State) => state.publicly.selectedLocations || []

const createSelectedLocationClusters = (selectedLocations: Center[], clusters) =>
  selectedLocations
    .map((location, i) => ({
      lat: location.lat,
      lng: location.lng,
      numPoints: 1,
      id: `loc${i}`,
      points: [location],
      isLabel: true,
      setZoomTo: ENTITY_ZOOM,
    }))
    .filter(
      (location) =>
        !clusters.some(
          (cluster) =>
            cluster.numPoints === 1 && cluster.lat === location.lat && cluster.lng === location.lng
        )
    )

export const clustersSelector = createSelector(
  mapOptionsSelector,
  addressesSelector,
  useLabelsSelector,
  selectedLocationsSelector,
  (mapOptions, addresses, useLabels, selectedLocations) => {
    const clusters = useLabels ? createLabels(mapOptions) : createClusters(mapOptions, addresses)
    return clusters.concat(createSelectedLocationClusters(selectedLocations, clusters))
  }
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

export const entitySearchValueSelector = (state: State) => state.publicly.entitySearchValue
export const entitySearchOpenSelector = (state: State) => state.publicly.entitySearchOpen
export const entitySearchModalOpenSelector = (state: State) => state.publicly.entityModalOpen
export const entitySearchForSelector = (state: State) => state.publicly.entitySearchFor
export const entitySearchLoadedSelector = (state: State) => state.publicly.entitySearchLoaded
export const entitySearchEidsSelector = createSelector(
  entitySearchesSelector,
  entitySearchForSelector,
  (searches, query): Array<number> => (searches[query] && searches[query].eids) || []
)
export const sortedEntitySearchDetailsSelector = createSelector(
  entitySearchEidsSelector,
  allEntityDetailsSelector,
  (eids, entityDetails): Array<NewEntityDetail> =>
    sortBy(map(eids, (eid) => entityDetails[eid.toString()]), [
      'political_entity',
      'contact_with_politics',
      'trade_with_government',
    ]).reverse()
)

export const drawerOpenSelector = (state: State) => state.publicly.drawerOpen

export const connectionDetailSelector = (
  state: State,
  eids1: Array<number>,
  eids2: Array<number>
) => {
  const query = `${eids1.join()}-${eids2.join()}`
  return state.connections.detail[query] ? state.connections.detail[query].ids : []
}

export const subgraphSelectedEidsSelector = (state: State) => state.connections.selectedEids

export const subgraphSelector = (state: State, query: string) =>
  state.connections.subgraph[query]

export const addNeighboursLimitSelector = (state: State): number | null =>
  state.connections.addNeighboursLimit

export const isItCandidatesListSelector = (state: State, props: ContextRouter): boolean =>
  props.location.search.includes('kandidati_bratislava') ||
  props.location.search.includes('kandidati_prezident')

export const autocompleteSuggestionEidsSelector = (state: State, query: string): Array<number> => (
  state.entitySearch[query] && state.entitySearch[query].eids
) || []

export const autocompleteSuggestionsSelector =
  (state: State, value: string): Array<string> => {
    const details = allEntityDetailsSelector(state)
    const eids = autocompleteSuggestionEidsSelector(state, value)
    return eids
      .map((eid) => (details[eid.toString()] ? details[eid.toString()].name : ''))
      .filter((name, index, array) => name && array.indexOf(name) === index)
  }
