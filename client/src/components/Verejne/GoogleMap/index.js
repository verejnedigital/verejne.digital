// @flow
import React from 'react'
import GMap from 'google-map-react'
import {connect} from 'react-redux'
import {zoomSelector, centerSelector, entitiesSelector, clustersSelector} from '../../../selectors'
import {
  initializeGoogleMap,
  updateMapOptions,
  selectEntity,
  zoomToLocation,
} from '../../../actions/verejneActions'
import {GOOGLE_MAP_CONFIG, createMapOptions} from '../../../constants'
import './GoogleMap.css'
import {map} from 'lodash'
import ClusterMarker from './ClusterMarker'
import {branch, compose, renderComponent} from 'recompose'
import Loading from '../../Loading'

import type {MapOptions, Entity, MapReference, Center} from '../../../state'
import type {MapCluster} from '../../../selectors'
import type {Thunk} from '../../../types/reduxTypes'

type Props = {
  zoom: number,
  center: [number, number],
  entities: Array<Entity>,
  updateMapOptions: (mapOptions: MapOptions) => Thunk,
  initializeGoogleMap: (mapReference: MapReference) => Thunk,
  selectEntity: (entity: Entity) => Thunk,
  zoomToLocation: (center: Center) => Thunk,
  refetch: () => void,
  clusters: Array<MapCluster>,
}

const GoogleMap = ({
  zoom,
  center,
  entities,
  updateMapOptions,
  initializeGoogleMap,
  selectEntity,
  zoomToLocation,
  refetch,
  clusters,
}: Props) => {
  return (
    <div className="GoogleMapWrapper">
      <GMap
        bootstrapURLKeys={GOOGLE_MAP_CONFIG}
        center={center}
        zoom={zoom}
        options={createMapOptions}
        onGoogleApiLoaded={({map, maps}) => initializeGoogleMap(map)}
        onChange={(options) => {
          refetch()
          updateMapOptions(options)
        }}
        yesIWantToUseGoogleMapApiInternals
      >
        {map(clusters, (e, i) => (
          <ClusterMarker
            key={i}
            entity={e}
            selectEntity={selectEntity}
            zoom={zoom}
            zoomToLocation={zoomToLocation}
            lat={e.lat}
            lng={e.lng}
          />
        ))}
      </GMap>
    </div>
  )
}

export default compose(
  connect(
    (state) => ({
      zoom: zoomSelector(state),
      center: centerSelector(state),
      entities: entitiesSelector(state),
      clusters: clustersSelector(state),
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
