// @flow
import React from 'react'
import GMap from 'google-map-react'
import Marker from './Marker'
import {connect} from 'react-redux'
import {mapOptionsSelector, mapReferenceSelector, entitiesSelector} from '../../../selectors'
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

const getClusterTooltip = (entity): string => {
  const sorted = reverse(sortBy(entity.points, ['size']))
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

const getEntityMarker = (entity): string => {
  return classnames(
    'CompanyMarker',
    isPolitician(entity) ? 'CompanyMarker__Politician' : 'CompanyMarker__Normal'
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
        {e.numPoints !== 1 && <span className="Marker__Text">{e.numPoints}</span>}
        {e.numPoints === 1 && getCompanyMarker(e)}
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
}: Props) => {
  return (
    <div className="GoogleMapWrapper">
      <GMap
        bootstrapURLKeys={GOOGLE_MAP_CONFIG}
        center={mapOptions.center}
        zoom={mapOptions.zoom}
        options={createMapOptions}
        onGoogleApiLoaded={({map, maps}) => initializeGoogleMap(map)}
        onChange={updateMapOptions}
        yesIWantToUseGoogleMapApiInternals
      >
        {renderMarkers(mapOptions, entities, selectEntity, zoomToLocation)}
      </GMap>
    </div>
  )
}

export default connect(
  (state) => ({
    mapOptions: mapOptionsSelector(state),
    mapReference: mapReferenceSelector(state),
    entities: entitiesSelector(state),
  }),
  {
    initializeGoogleMap,
    updateMapOptions,
    selectEntity,
    zoomToLocation,
  }
)(GoogleMap)
