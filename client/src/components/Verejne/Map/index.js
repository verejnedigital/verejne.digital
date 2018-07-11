// @flow
import React from 'react'
import {connect} from 'react-redux'
import {
  zoomSelector,
  centerSelector,
  addressesSelector,
  clustersSelector,
  addressesUrlSelector,
} from '../../../selectors'
import {setMapOptions} from '../../../actions/verejneActions'
import './GoogleMap.css'
import {map} from 'lodash'
import ClusterMarker from './ClusterMarker'
import {branch, compose, renderComponent, withHandlers} from 'recompose'
import Loading from '../../Loading'
import GoogleMap from '../../GoogleMap'
import {withDataProviders} from 'data-provider'
import {addressesProvider} from '../../../dataProviders/publiclyDataProviders'

import type {MapOptions, Entity} from '../../../state'
import type {MapCluster} from '../../../selectors'
import type {GenericAction} from '../../../types/reduxTypes'

type Props = {
  zoom: number,
  center: [number, number],
  entities: Array<Entity>,
  setMapOptions: (mapOptions: MapOptions) => GenericAction<MapOptions, MapOptions>,
  clusters: Array<MapCluster>,
  onChange: (options: MapOptions) => any,
}

// NOTE: there can be multiple points on the map on the same location...
const Map = ({
  zoom,
  center,
  clusters,
  onChange,
}: Props) => {
  return (
    <div className="google-map-wrapper">
      <GoogleMap center={center} zoom={zoom} onChange={onChange}>
        {map(clusters, (cluster, i) => (
          <ClusterMarker
            key={i}
            cluster={cluster}
            zoom={zoom}
            lat={cluster.lat}
            lng={cluster.lng}
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
      addresses: addressesSelector(state),
      clusters: clustersSelector(state),
      addressesUrl: addressesUrlSelector(state),
    }),
    {
      setMapOptions,
    }
  ),
  withDataProviders(({addressesUrl}) =>
    [addressesProvider(addressesUrl)]),
  withHandlers({
    onChange: ({setMapOptions}) => (options) => {
      setMapOptions(options)
    },
  }),
  // display loading only before first fetch
  branch((props) => !props.addresses, renderComponent(Loading))
)(Map)
