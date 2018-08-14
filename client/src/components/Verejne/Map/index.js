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
import {withRouter} from 'react-router-dom'
import qs from 'qs'
import {DEFAULT_MAP_CENTER, COUNTRY_ZOOM} from '../../../constants'
import {withSideEffects} from '../../../utils'

import type {MapOptions, CompanyEntity} from '../../../state'
import type {MapCluster} from '../../../selectors'
import type {GenericAction} from '../../../types/reduxTypes'
import type {RouterHistory} from 'react-router'

type Props = {
  zoom: number,
  center: [number, number],
  entities: Array<CompanyEntity>,
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

// a 'side-effect' function
// fixes location in redux state based query string
const parseLocationFromUrl = (props) => {
  const params = qs.parse(props.history.location.search.substr(1))
  params.lat = params.lat || DEFAULT_MAP_CENTER.lat
  params.lng = params.lng || DEFAULT_MAP_CENTER.lng
  params.zoom = params.zoom || COUNTRY_ZOOM
  props.setMapOptions({
    center: [Number(params.lat), Number(params.lng)],
    zoom: Number(params.zoom),
  })
}

export default compose(
  withRouter,
  connect(undefined, {setMapOptions}),
  // if done in component lifecycle, the url location would be
  // overwritten by the one from fired onChange of map component
  withSideEffects((props) => [parseLocationFromUrl(props)]),
  connect((state) => ({
    zoom: zoomSelector(state),
    center: centerSelector(state),
    addresses: addressesSelector(state),
    clusters: clustersSelector(state),
    addressesUrl: addressesUrlSelector(state),
  })),
  withDataProviders(({addressesUrl}) => [addressesProvider(addressesUrl)]),
  withHandlers({
    onChange: (props) => (options) => {
      props.setMapOptions(options)
      props.history.replace(
        `?lat=${+options.center.lat.toFixed(6)}&lng=${+options.center.lng.toFixed(6)}&zoom=${
          options.zoom
        }`
      )
    },
  }),
  // display loading only before first fetch
  branch((props) => !props.addresses, renderComponent(Loading))
)(Map)
