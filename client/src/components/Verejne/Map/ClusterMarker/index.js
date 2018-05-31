// @flow
import React from 'react'
import Marker from '../Marker'
import {ENTITY_ZOOM} from '../../../../constants'
import {sortBy, reverse} from 'lodash'
import classnames from 'classnames'
import {isPolitician, hasContractsWithState} from '../../entityHelpers'
import {withHandlers} from 'recompose'
import './ClusterMarker.css'

import FaIconFilledCircle from 'react-icons/lib/fa/circle'
import FaIconCircle from 'react-icons/lib/fa/circle-o'

import type {Entity} from '../../../../state'
import type {MapCluster} from '../../../../selectors'
import type {Thunk} from '../../../../types/reduxTypes'

type ClusterMarkerProps = {
  zoom: number,
  selectEntity: (entity: Entity) => Thunk,
  zoomToLocation: ({lat: number, lng: number}) => Thunk,
  entity: MapCluster,
  onClick: () => void,
}

const getClusterTooltip = (cluster: MapCluster): string => {
  const sorted = reverse(sortBy(cluster.points, ['size']))
  return `${sorted[0].name}...`
}

const getEntityMarker = (cluster: MapCluster): string => {
  return classnames(
    'CompanyMarker',
    isPolitician(cluster.points[0]) ? 'CompanyMarker__Politician' : 'CompanyMarker__Normal'
  )
}

const getCompanyMarker = (cluster: MapCluster) =>
  hasContractsWithState(cluster.points[0]) ? (
    <FaIconFilledCircle size="18" />
  ) : (
    <FaIconCircle size="18" />
  )

const ClusterMarker = ({
  entity,
  zoom,
  selectEntity,
  zoomToLocation,
  onClick,
}: ClusterMarkerProps) => {
  const MarkerText = <span className="Marker__Text">{entity.numPoints}</span>
  let className, children
  if (zoom < ENTITY_ZOOM) {
    className = entity.numPoints === 1 ? 'SimpleMarker' : 'ClusterMarker'
    children = entity.numPoints !== 1 && <span className="Marker__Text">{entity.numPoints}</span>
  } else {
    className = entity.numPoints === 1 ? getEntityMarker(entity) : 'ClusterMarker'
    children = entity.numPoints === 1 ? getCompanyMarker(entity) : MarkerText
  }
  return (
    <Marker className={className} title={getClusterTooltip(entity)} onClick={onClick}>
      {children}
    </Marker>
  )
}

export default withHandlers({
  onClick: ({entity, selectEntity, zoomToLocation}) => (event) => {
    if (entity.numPoints === 1) selectEntity(entity.points[0])
    else zoomToLocation({lat: entity.lat, lng: entity.lng})
  },
})(ClusterMarker)
