// @flow
import React from 'react'
import {connect} from 'react-redux'
import {withHandlers, compose} from 'recompose'
import FaIconCircle from 'react-icons/lib/fa/circle-o'
import classnames from 'classnames'

import {ENTITY_CLOSE_ZOOM} from '../../../../constants'
import {openAddressDetail, zoomToLocation, setDrawer, setEntitySearchOpen, deselectLocation} from '../../../../actions/publicActions'
import {
  zoomSelector,
  openedAddressDetailSelector,
  selectedLocationSelector,
} from '../../../../selectors'
import Marker from '../Marker/Marker'
import './ClusterMarker.css'

import type {Center} from '../../../../state'
import type {MapCluster} from '../../../../selectors'
import type {Thunk} from '../../../../types/reduxTypes'

type ClusterMarkerProps = {
  zoom: number,
  selectedLocation: Center,
  zoomToLocation: ({lat: number, lng: number}) => Thunk,
  cluster: MapCluster,
  onClick: () => void,
  openedAddressIds: Array<number>,
}
const clusterIsOnSelectedLocation = (selectedLocation, point) => (
  (selectedLocation !== null)
    && (point.lat === selectedLocation.lat)
    && (point.lng === selectedLocation.lng)
)
const ClusterMarker = ({
  cluster,
  zoom,
  selectedLocation,
  zoomToLocation,
  onClick,
  openedAddressIds,
}: ClusterMarkerProps) => {
  let className
  const selected = cluster.numPoints === 1 &&
  ((openedAddressIds.includes(cluster.points[0].address_id)
    || clusterIsOnSelectedLocation(selectedLocation, {lat: cluster.points[0].lat, lng: cluster.points[0].lng})))
  className = classnames({
    'simple-marker': cluster.isLabel,
    'company-marker': cluster.numPoints === 1,
    'cluster-marker': cluster.numPoints > 1,
    'government': !cluster.isLabel && cluster.points[0].tradewithgovernment,
  })
  const children = cluster.numPoints === 1
    ? <FaIconCircle size="18" />
    : !cluster.isLabel ? <span className="marker__text">{cluster.numPoints}</span> : <div />
  className = classnames(className, {selected})
  return (
    <Marker className={className} onClick={onClick}>
      {children}
    </Marker>
  )
}

export default compose(
  connect(
    (state) => ({
      openedAddressIds: openedAddressDetailSelector(state),
      zoom: zoomSelector(state),
      selectedLocation: selectedLocationSelector(state),
    }),
    {
      openAddressDetail,
      zoomToLocation,
      setDrawer,
      setEntitySearchOpen,
      deselectLocation,
    }
  ),
  withHandlers({
    onClick: ({
      deselectLocation,
      zoom,
      cluster,
      zoomToLocation,
      openAddressDetail,
      setDrawer,
      setEntitySearchOpen,
    }) => (event) => {
      if (cluster.numPoints === 1) {
        openAddressDetail([cluster.points[0].address_id])
        setDrawer(true)
        setEntitySearchOpen(false)
        zoomToLocation({lat: cluster.lat, lng: cluster.lng}, Math.max(ENTITY_CLOSE_ZOOM, zoom))
        deselectLocation()
      } else {
        if (zoom < 22) {
          zoomToLocation({lat: cluster.lat, lng: cluster.lng}, cluster.setZoomTo)
          deselectLocation()
        } else {
          openAddressDetail(cluster.points.map((point) => point.address_id))
          setDrawer(true)
          setEntitySearchOpen(false)
          zoomToLocation({lat: cluster.lat, lng: cluster.lng}, Math.max(ENTITY_CLOSE_ZOOM, zoom))
          deselectLocation()
        }
      }
    },
  })
)(ClusterMarker)
