// @flow
import React from 'react'
import {connect} from 'react-redux'
import {
  zoomSelector,
  centerSelector,
  entitiesSelector,
  clustersSelector,
  entitiesUrlSelector,
} from '../../../selectors'
import {setMapOptions, selectEntity, zoomToLocation} from '../../../actions/verejneActions'
import './GoogleMap.css'
import {map} from 'lodash'
import ClusterMarker from './ClusterMarker'
import {branch, compose, renderComponent, withHandlers} from 'recompose'
import Loading from '../../Loading'
import GoogleMap from '../../GoogleMap'
import Legend from '../Legend'
import {withDataProviders} from 'data-provider'
import {entitiesProvider} from '../../../dataProviders/publiclyDataProviders'

import type {MapOptions, Entity, Center} from '../../../state'
import type {MapCluster} from '../../../selectors'
import type {Thunk, GenericAction} from '../../../types/reduxTypes'

type Props = {
  zoom: number,
  center: [number, number],
  entities: Array<Entity>,
  setMapOptions: (mapOptions: MapOptions) => GenericAction<MapOptions, MapOptions>,
  selectEntity: (entity: Entity) => Thunk,
  zoomToLocation: (center: Center) => Thunk,
  refetch: () => void,
  clusters: Array<MapCluster>,
  onChange: (options: MapOptions) => any,
}

// NOTE: there can be multiple points on the map on the same location...
const Map = ({
  zoom,
  center,
  entities,
  setMapOptions,
  selectEntity,
  zoomToLocation,
  refetch,
  clusters,
  onChange,
}: Props) => {
  return [
    <div key="map" className="google-map-wrapper">
      <GoogleMap center={center} zoom={zoom} onChange={onChange}>
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
    </div>,
    <Legend key="legend" />,
  ]
}

export default compose(
  connect(
    (state) => ({
      zoom: zoomSelector(state),
      center: centerSelector(state),
      entities: entitiesSelector(state),
      clusters: clustersSelector(state),
      entitiesUrl: entitiesUrlSelector(state),
    }),
    {
      setMapOptions,
      selectEntity,
      zoomToLocation,
    }
  ),
  withDataProviders(({entitiesUrl}) => [entitiesProvider(entitiesUrl)]),
  withHandlers({
    onChange: ({entitiesUrl, setMapOptions, refetch}) => (options) => {
      setMapOptions(options)
    },
  }),
  // display loading only before first fetch
  branch((props) => !props.entities, renderComponent(Loading))
)(Map)
