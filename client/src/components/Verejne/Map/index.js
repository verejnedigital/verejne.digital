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
import {branch, compose, renderComponent, withHandlers, lifecycle} from 'recompose'
import Loading from '../../Loading'
import GoogleMap from '../../GoogleMap'
import {withDataProviders} from 'data-provider'
import {entitiesProvider} from '../../../dataProviders/publiclyDataProviders'
import {withRouter} from 'react-router-dom'
import qs from 'qs'
import {debounce} from 'throttle-debounce'

import type {MapOptions, Entity, Center} from '../../../state'
import type {MapCluster} from '../../../selectors'
import type {Thunk, GenericAction} from '../../../types/reduxTypes'
import type {RouterHistory} from 'react-router'

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
  history: RouterHistory,
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
  return (
    <div className="google-map-wrapper">
      <GoogleMap center={center} zoom={zoom} onChange={debounce(2000, onChange)}>
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
      entitiesUrl: entitiesUrlSelector(state),
    }),
    {
      setMapOptions,
      selectEntity,
      zoomToLocation,
    }
  ),
  withRouter,
  withDataProviders(({entitiesUrl}) => [entitiesProvider(entitiesUrl)]),
  withHandlers({
    onChange: (props) => (options) => {
      console.log(props)
      props.setMapOptions(options)
      props.history.push(
        `/verejne?lat=${options.center.lat}&lng=${options.center.lng}&zoom=${
          options.zoom
        }`
      )
    }
  }),
  lifecycle({
    componentDidMount() {
      const params = qs.parse(this.props.history.location.search.substr(1))
      this.props.setMapOptions(
        {center: [Number(params.lat), Number(params.lng)], zoom: Number(params.zoom)}
      )
      console.log(this.props)
    }
  }),
  // display loading only before first fetch
  branch((props) => !props.entities, renderComponent(Loading))
)(Map)
