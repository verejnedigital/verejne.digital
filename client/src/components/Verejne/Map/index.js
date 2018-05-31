// @flow
import React from 'react'
import {connect} from 'react-redux'
import {
  zoomSelector,
  centerSelector,
  entitiesSelector,
  clustersSelector,
  mapReferenceSelector,
} from '../../../selectors'
import {
  setMapReference,
  setMapOptions,
  selectEntity,
  zoomToLocation,
} from '../../../actions/verejneActions'
import './GoogleMap.css'
import {map} from 'lodash'
import ClusterMarker from './ClusterMarker'
import {branch, compose, renderComponent, withHandlers} from 'recompose'
import Loading from '../../Loading'
import GoogleMap from '../../GoogleMap'
import {withDataProviders, withRefetch} from 'data-provider'
import {
  entitiesProvider,
  getEntitiesUrlFromMapReference,
} from '../../../dataProviders/publiclyDataProviders'

import type {MapOptions, Entity, MapReference, Center} from '../../../state'
import type {MapCluster} from '../../../selectors'
import type {Thunk, GenericAction} from '../../../types/reduxTypes'

type Props = {
  zoom: number,
  center: [number, number],
  entities: Array<Entity>,
  setMapOptions: (mapOptions: MapOptions) => GenericAction<MapOptions, MapOptions>,
  setMapReference: (mapReference: MapReference) => GenericAction<MapReference, MapReference>,
  selectEntity: (entity: Entity) => Thunk,
  zoomToLocation: (center: Center) => Thunk,
  refetch: () => void,
  clusters: Array<MapCluster>,
  onGoogleApiLoaded: ({map: MapReference}) => any,
  onChange: (options: MapOptions) => any,
}

const Map = ({
  zoom,
  center,
  entities,
  setMapOptions,
  setMapReference,
  selectEntity,
  zoomToLocation,
  refetch,
  clusters,
  onGoogleApiLoaded,
  onChange,
}: Props) => {
  return (
    <div className="GoogleMapWrapper">
      <GoogleMap
        center={center}
        zoom={zoom}
        onGoogleApiLoaded={onGoogleApiLoaded}
        onChange={onChange}
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
      </GoogleMap>
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
      mapReference: mapReferenceSelector(state),
    }),
    {
      setMapReference,
      setMapOptions,
      selectEntity,
      zoomToLocation,
    }
  ),
  withRefetch(),
  withDataProviders(({mapReference}) => [entitiesProvider(mapReference)]),
  withHandlers({
    onGoogleApiLoaded: ({setMapReference}) => ({map}) => setMapReference(map),
    onChange: ({mapReference, setMapOptions, refetch}) => (options) => {
      setMapOptions(options)
      refetch(getEntitiesUrlFromMapReference(mapReference))
    },
  }),
  // display loading only before first fetch
  branch((props) => !props.entities, renderComponent(Loading))
)(Map)
