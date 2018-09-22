// @flow
import React from 'react'
import {connect} from 'react-redux'
import {withHandlers, compose} from 'recompose'
import classnames from 'classnames'

import {ENTITY_CLOSE_ZOOM} from '../../../../constants'
import {
  openAddressDetail,
  zoomToLocation,
  setDrawer,
  setEntitySearchOpen,
  deselectLocations,
} from '../../../../actions/publicActions'
import {
  zoomSelector,
  openedAddressDetailSelector,
  selectedLocationsSelector,
} from '../../../../selectors'
import CircleIcon from '../../../shared/CircleIcon'
import Marker from '../Marker/Marker'
import './ClusterMarker.css'

import type {Center, State} from '../../../../state'
import type {MapCluster} from '../../../../selectors'
import type {Thunk} from '../../../../types/reduxTypes'

type ClusterMarkerProps = {
  zoom: number,
  selectedLocations: Center[],
  zoomToLocation: ({lat: number, lng: number}) => Thunk,
  cluster: MapCluster,
  onClick: () => void,
  openedAddressIds: Array<number>,
}
const clusterHasSelectedLocation = (selectedLocations, point) =>
  selectedLocations.some((location) => point.lat === location.lat && point.lng === location.lng)
const ClusterMarker = ({
  cluster,
  zoom,
  selectedLocations,
  zoomToLocation,
  onClick,
  openedAddressIds,
}: ClusterMarkerProps) => {
  const selected =
    cluster.numPoints === 1 &&
    (openedAddressIds.includes(cluster.points[0].address_id) ||
      clusterHasSelectedLocation(selectedLocations, {
        lat: cluster.points[0].lat,
        lng: cluster.points[0].lng,
      }))
  const className = classnames({
    'simple-marker': cluster.isLabel,
    'company-marker': cluster.numPoints === 1,
    'cluster-marker': cluster.numPoints > 1,
    selected,
  })
  const children =
    cluster.numPoints === 1 ? (
      <CircleIcon className="company-marker" data={cluster.points[0]} size="18" />
    ) : !cluster.isLabel ? (
      <span className="marker__text">{cluster.numPoints}</span>
    ) : (
      <div />
    )
  return (
    <Marker className={className} onClick={onClick}>
      {children}
    </Marker>
  )
}

export default compose(
  connect(
    (state: State) => ({
      openedAddressIds: openedAddressDetailSelector(state),
      zoom: zoomSelector(state),
      selectedLocations: selectedLocationsSelector(state),
    }),
    {
      openAddressDetail,
      zoomToLocation,
      setDrawer,
      setEntitySearchOpen,
      deselectLocations,
    }
  ),
  withHandlers({
    onClick: ({
      deselectLocations,
      zoom,
      cluster,
      zoomToLocation,
      openAddressDetail,
      setDrawer,
      setEntitySearchOpen,
    }) => (event) => {
      if (cluster.numPoints === 1) {
        if (cluster.points[0].address_id) {
          openAddressDetail([cluster.points[0].address_id])
          setEntitySearchOpen(false)
          setDrawer(true)
        }
        zoomToLocation({lat: cluster.lat, lng: cluster.lng}, Math.max(ENTITY_CLOSE_ZOOM, zoom))
      } else {
        if (zoom < 22) {
          zoomToLocation({lat: cluster.lat, lng: cluster.lng}, cluster.setZoomTo)
          deselectLocations()
        } else {
          openAddressDetail(cluster.points.map((point) => point.address_id))
          setDrawer(true)
          setEntitySearchOpen(false)
          zoomToLocation({lat: cluster.lat, lng: cluster.lng}, Math.max(ENTITY_CLOSE_ZOOM, zoom))
          deselectLocations()
        }
      }
    },
  })
)(ClusterMarker)
