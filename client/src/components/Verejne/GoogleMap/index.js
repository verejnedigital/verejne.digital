// @flow
import React from 'react'
import GMap from 'google-map-react'
import {map} from 'lodash'
import Marker from './Marker'
import {connect} from 'react-redux'
import {mapOptionsSelector, mapReferenceSelector, entitiesSelector} from '../../../selectors'
import {initializeGoogleMap, updateMapOptions} from '../../../actions/verejneActions'
import {GOOGLE_MAP_CONFIG, createMapOptions, clusterOptions} from '../../../constants'
import supercluster from 'points-cluster'
import './GoogleMap.css'

import type {MapOptions, Entity, MapReference} from '../../../state'
import type {Thunk} from '../../../types/reduxTypes'

type Props = {
  mapOptions: MapOptions,
  entities: Array<Entity>,
  updateMapOptions: (mapOptions: MapOptions) => Thunk,
  initializeGoogleMap: (mapReference: MapReference) => Thunk,
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

const GoogleMap = ({mapOptions, entities, updateMapOptions, initializeGoogleMap}: Props) => {
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
        {map(createClusters(mapOptions, entities), (e, i) => {
          return (
            <Marker
              className={e.numPoints === 1 ? 'SimpleMarker' : 'ClusterMarker'}
              key={i}
              lat={e.lat}
              lng={e.lng}
              text={e.numPoints}
            />
          )
        })}
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
  }
)(GoogleMap)
