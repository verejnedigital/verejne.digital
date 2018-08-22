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
import {setMapOptions} from '../../../actions/publicActions'
import './GoogleMap.css'
import {map} from 'lodash'
import ClusterMarker from './ClusterMarker/ClusterMarker'
import {branch, compose, renderComponent, withHandlers, withProps} from 'recompose'
import Loading from '../../Loading/Loading'
import GoogleMap from '../../GoogleMap/GoogleMap'
import {withDataProviders} from 'data-provider'
import {addressesProvider} from '../../../dataProviders/publiclyDataProviders'
import {withRouter} from 'react-router-dom'
import qs from 'qs'
import {
  CITY_ZOOM,
  DEFAULT_MAP_CENTER,
  COUNTRY_ZOOM,
  WORLD_ZOOM,
  SLOVAKIA_OKRESY,
  SLOVAKIA_KRAJE,
  SLOVAKIA_COORDINATES,
  OKRESY_ZOOM,
  SLOVAKIA_BOUNDS,
} from '../../../constants'
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
const isInSlovakia = (center: [number, number]): boolean => {
  return (center[0] > SLOVAKIA_BOUNDS[0][1]) && (center[0] < SLOVAKIA_BOUNDS[1][1]) &&
    (center[1] > SLOVAKIA_BOUNDS[0][0]) && (center[1] < SLOVAKIA_BOUNDS[1][0])
}
// NOTE: there can be multiple points on the map on the same location...
const Map = ({useLabels, zoom, center, clusters, onChange}: Props) => {
  let finalClusters = clusters
  if (useLabels) {
    if (zoom <= WORLD_ZOOM) {
      finalClusters = [{
        lat: SLOVAKIA_COORDINATES[0],
        lng: SLOVAKIA_COORDINATES[1],
        numPoints: 0,
        id: 'SLOVAKIA',
        points: [],
        setZoomTo: COUNTRY_ZOOM,
      }]
    } else {
      if (zoom <= COUNTRY_ZOOM) {
        finalClusters = SLOVAKIA_KRAJE.map((e) => ({
          lat: e.centroid[1],
          lng: e.centroid[0],
          numPoints: 0,
          id: e.name,
          points: [],
          setZoomTo: OKRESY_ZOOM,
        })
        )
      } else {
        finalClusters = SLOVAKIA_OKRESY.map((e) => ({
          lat: e.centroid[1],
          lng: e.centroid[0],
          numPoints: 0,
          id: e.name,
          points: [],
          setZoomTo: CITY_ZOOM,
        })
        )
      }
    }
  }
  return (
    <div className="google-map-wrapper">
      <GoogleMap center={center} zoom={zoom} onChange={onChange}>
        {map(finalClusters, (cluster, i: number) => (
          <ClusterMarker
            key={i}
            cluster={cluster}
            zoom={zoom}
            lat={cluster.lat}
            lng={cluster.lng}
            useName={useLabels}
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
  withProps((props) => {
    return {
      useLabels: !(props.zoom >= CITY_ZOOM ||
  !isInSlovakia(props.center)),
    }
  }),
  withDataProviders(({useLabels, addressesUrl}) => {
    if (!useLabels) {
      return [addressesProvider(addressesUrl)]
    } else {
      return []
    }
  }),
  withHandlers({
    onChange: (props) => (options) => {
      const newOptions = {zoom: options.zoom,
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
