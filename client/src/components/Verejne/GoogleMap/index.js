// @flow
import React from 'react'
import GMap from 'google-map-react'
import Marker from './Marker'
import {connect} from 'react-redux'
import {mapOptionsSelector, entitiesSelector} from '../../../selectors'
import {
  initializeGoogleMap,
  updateMapOptions,
  selectEntity,
  zoomToLocation,
} from '../../../actions/verejneActions'
import {GOOGLE_MAP_CONFIG, createMapOptions, clusterOptions, ENTITY_ZOOM} from '../../../constants'
import supercluster from 'points-cluster'
import './GoogleMap.css'
import {sortBy, reverse, map} from 'lodash'
import classnames from 'classnames'
import {isPolitician, hasContractsWithState} from '../entityHelpers'
import {branch, compose, renderComponent} from 'recompose'
import Loading from '../../Loading'

import FaIconFilledCircle from 'react-icons/lib/fa/circle'
import FaIconCircle from 'react-icons/lib/fa/circle-o'

import type {MapOptions, Entity, MapReference, Center} from '../../../state'
import type {Thunk} from '../../../types/reduxTypes'

type Props = {
  mapOptions: MapOptions,
  entities: Array<Entity>,
  updateMapOptions: (mapOptions: MapOptions) => Thunk,
  initializeGoogleMap: (mapReference: MapReference) => Thunk,
  selectEntity: (entity: Entity) => Thunk,
  zoomToLocation: (center: Center) => Thunk,
  refetch: () => void,
}

export type Cluster = {
  numPoints: number,
  points: Array<any>,
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

const getClusters = (mapOptions: MapOptions, entities: Array<Entity>): Array<Cluster> => {
  const clusters = supercluster(entities, clusterOptions)
  return clusters(mapOptions)
}

const getClusterTooltip = (cluster: MapCluster): string => {
  const sorted = reverse(sortBy(cluster.points, ['size']))
  return sorted[0].name
}

const createClusters = (mapOptions: MapOptions, entities: Array<Entity>): Array<MapCluster> => {
  const clusters = mapOptions.bounds
    ? getClusters(mapOptions, entities).map(({wx, wy, numPoints, points}, i) => {
      return {
        lat: wy,
        lng: wx,
        numPoints,
        id: `${i}`,
        points,
      }
    })
    : []
  return clusters
}

const getEntityMarker = (cluster: MapCluster): string => {
  return classnames(
    'CompanyMarker',
    isPolitician(cluster.points[0]) ? 'CompanyMarker__Politician' : 'CompanyMarker__Normal'
  )
}

const getCompanyMarker = (entity) =>
  hasContractsWithState(entity) ? <FaIconFilledCircle size="18" /> : <FaIconCircle size="18" />

const renderMarkers = (mapOptions, entities, selectEntity, zoomToLocation) => {
  const zoom = mapOptions.zoom
  const clusters = map(createClusters(mapOptions, entities))
  if (zoom >= ENTITY_ZOOM) {
    return map(clusters, (e, i) => (
      <Marker
        className={e.numPoints === 1 ? getEntityMarker(e) : 'ClusterMarker'}
        key={i}
        lat={e.lat}
        lng={e.lng}
        title={getClusterTooltip(e)}
        onClick={() => {
          if (e.numPoints === 1) selectEntity(e.points[0])
          else zoomToLocation({lat: e.lat, lng: e.lng})
        }}
      >
        {e.numPoints === 1 ? getCompanyMarker(e) : <span className="Marker__Text">{e.numPoints}</span>}
      </Marker>
    ))
  } else {
    return map(clusters, (e, i) => (
      <Marker
        className={e.numPoints === 1 ? 'SimpleMarker' : 'ClusterMarker'}
        key={i}
        lat={e.lat}
        lng={e.lng}
        title={getClusterTooltip(e)}
        onClick={() => {
          if (e.numPoints === 1) selectEntity(e.points[0])
          else zoomToLocation({lat: e.lat, lng: e.lng})
        }}
      >
        {e.numPoints !== 1 && <span className="Marker__Text">{e.numPoints}</span>}
      </Marker>
    ))
  }
}

const GoogleMap = ({
  mapOptions,
  entities,
  updateMapOptions,
  initializeGoogleMap,
  selectEntity,
  zoomToLocation,
  refetch,
}: Props) => {
  return (
    <div className="GoogleMapWrapper">
      <GMap
        bootstrapURLKeys={GOOGLE_MAP_CONFIG}
        center={mapOptions.center}
        zoom={mapOptions.zoom}
        options={createMapOptions}
        onGoogleApiLoaded={({map, maps}) => initializeGoogleMap(map)}
        onChange={(options) => {
          refetch()
          updateMapOptions(options)
        }}
        yesIWantToUseGoogleMapApiInternals
      >
        {renderMarkers(mapOptions, entities, selectEntity, zoomToLocation)}
      </GMap>
    </div>
  )
}

export default compose(
  connect(
    (state) => ({
      mapOptions: mapOptionsSelector(state),
      entities: entitiesSelector(state),
    }),
    {
      initializeGoogleMap,
      updateMapOptions,
      selectEntity,
      zoomToLocation,
    }
  ),
  // will be displayed only on first render
  branch((props) => !props.entities, renderComponent(Loading))
)(GoogleMap)
