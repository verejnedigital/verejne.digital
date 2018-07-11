// @flow
import React from 'react'
import {connect} from 'react-redux'
import Marker from '../Marker'
import {ENTITY_ZOOM, ENTITY_CLOSE_ZOOM} from '../../../../constants'
import {withHandlers, compose} from 'recompose'
import './ClusterMarker.css'
import {toggleEntityInfo, zoomToLocation} from '../../../../actions/verejneActions'
import FaIconCircle from 'react-icons/lib/fa/circle-o'

import type {Entity} from '../../../../state'
import type {MapCluster} from '../../../../selectors'
import type {Thunk} from '../../../../types/reduxTypes'

type ClusterMarkerProps = {
  zoom: number,
  selectEntity: (entity: Entity) => Thunk,
  zoomToLocation: ({lat: number, lng: number}) => Thunk,
  cluster: MapCluster,
  onClick: () => void,
}

const ClusterMarker = ({
  cluster,
  zoom,
  selectEntity,
  zoomToLocation,
  onClick,
}: ClusterMarkerProps) => {
  const MarkerText = <span className="marker__text">{cluster.numPoints}</span>
  let className, children
  if (zoom < ENTITY_ZOOM) {
    className = cluster.numPoints === 1 ? 'simple-marker' : 'cluster-marker'
    children = cluster.numPoints !== 1 && <span className="marker__text">{cluster.numPoints}</span>
  } else {
    //TODO: fix classnames after we api provides enough information
    className = cluster.numPoints === 1 ? 'company-marker company-marker--normal' : 'cluster-marker'
    children = cluster.numPoints === 1 ? <FaIconCircle size="18" /> : MarkerText
  }
  return (
    <Marker className={className} onClick={onClick}>
      {children}
    </Marker>
  )
}

export default compose(
  connect(
    null,
    {
      toggleEntityInfo,
      zoomToLocation,
    }
  ),
  withHandlers({
    onClick: ({cluster, zoomToLocation, toggleEntityInfo}) => (event) => {
      if (cluster.numPoints === 1) {
        //toggleEntityInfo(cluster.points[0].eid)
        zoomToLocation({lat: cluster.lat, lng: cluster.lng}, ENTITY_CLOSE_ZOOM)
      } else {
        zoomToLocation({lat: cluster.lat, lng: cluster.lng})
      }
    },
  })
)(ClusterMarker)
