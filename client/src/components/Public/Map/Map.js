// @flow
import React from 'react'
import {connect} from 'react-redux'
import {
  zoomSelector,
  centerSelector,
  addressesSelector,
  clustersSelector,
  addressesUrlSelector,
  useLabelsSelector,
} from '../../../selectors'
import {setMapOptions} from '../../../actions/publicActions'
import './GoogleMap.css'
import {map} from 'lodash'
import ClusterMarker from './ClusterMarker/ClusterMarker'
import {branch, compose, renderComponent, withHandlers} from 'recompose'
import Loading from '../../Loading/Loading'
import GoogleMap from '../../GoogleMap/GoogleMap'
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
  useLabels: boolean,
  zoom: number,
  center: [number, number],
  entities: Array<CompanyEntity>,
  setMapOptions: (mapOptions: MapOptions) => GenericAction<MapOptions, MapOptions>,
  clusters: Array<MapCluster>,
  onChange: (options: MapOptions) => any,
  history: RouterHistory,
}

// NOTE: there can be multiple points on the map on the same location...
const Map = ({useLabels, zoom, center, clusters, onChange}: Props) => (
  <div className="google-map-wrapper">
    <GoogleMap center={center} zoom={zoom} onChange={onChange}>
      {map(clusters, (cluster, i: number) => (
        <ClusterMarker key={i} cluster={cluster} zoom={zoom} lat={cluster.lat} lng={cluster.lng} />
      ))}
    </GoogleMap>
  </div>
)

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
    useLabels: useLabelsSelector(state),
  })),
  withDataProviders(
    ({useLabels, addressesUrl}) => (useLabels ? [] : [addressesProvider(addressesUrl)])
  ),
  withHandlers({
    onChange: (props) => (options) => {
      const newOptions = {
        zoom: options.zoom,
        center: [options.center.lat, options.center.lng],
        bounds: options.bounds,
      }
      props.setMapOptions(newOptions)
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
