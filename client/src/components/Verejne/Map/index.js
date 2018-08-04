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
import {branch, compose, renderComponent, withHandlers, lifecycle} from 'recompose'
import Loading from '../../Loading'
import GoogleMap from '../../GoogleMap'
import {withDataProviders} from 'data-provider'
import {addressesProvider} from '../../../dataProviders/publiclyDataProviders'
import {withRouter} from 'react-router-dom'
import qs from 'qs'
import {DEFAULT_MAP_CENTER, COUNTRY_ZOOM} from '../../../constants'

import type {MapOptions, Entity} from '../../../state'
import type {MapCluster} from '../../../selectors'
import type {GenericAction} from '../../../types/reduxTypes'
import type {RouterHistory} from 'react-router'

type Props = {
  zoom: number,
  center: [number, number],
  entities: Array<Entity>,
  setMapOptions: (mapOptions: MapOptions) => GenericAction<MapOptions, MapOptions>,
  clusters: Array<MapCluster>,
  onChange: (options: MapOptions) => any,
  history: RouterHistory,
}

// NOTE: there can be multiple points on the map on the same location...
const Map = ({zoom, center, clusters, onChange}: Props) => {
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
  withDataProviders(({addressesUrl}) => [addressesProvider(addressesUrl)]),
  withRouter,
  withHandlers({
    onChange: (props) => (options) => {
      props.setMapOptions(options)
      props.history.replace(
        `?lat=${options.center.lat.toFixed(6)}&lng=${options.center.lng.toFixed(6)}&zoom=${options.zoom}`
      )
    },
  }),
  lifecycle({
    componentDidMount() {
      const params = qs.parse(this.props.history.location.search.substr(1))
      params.lat = params.lat === undefined ? DEFAULT_MAP_CENTER.lat : params.lat
      params.lng = params.lng === undefined ? DEFAULT_MAP_CENTER.lng : params.lng
      params.zoom = params.zoom === undefined ? COUNTRY_ZOOM : params.zoom
      this.props.setMapOptions({
        center: [Number(params.lat), Number(params.lng)],
        zoom: Number(params.zoom),
      })
    },
  }),
  // display loading only before first fetch
  branch((props) => !props.addresses, renderComponent(Loading))
)(Map)
