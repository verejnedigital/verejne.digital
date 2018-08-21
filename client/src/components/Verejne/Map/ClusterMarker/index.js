// @flow
import React from 'react'
import {connect} from 'react-redux'
import {withHandlers, compose} from 'recompose'
import FaIconCircle from 'react-icons/lib/fa/circle-o'
import classnames from 'classnames'

import {ENTITY_ZOOM, ENTITY_CLOSE_ZOOM} from '../../../../constants'
import {openAddressDetail, zoomToLocation, setDrawer} from '../../../../actions/verejneActions'
import {openedAddressDetailSelector} from '../../../../selectors'
import Marker from '../Marker'
import './ClusterMarker.css'

import type {CompanyEntity} from '../../../../state'
import type {MapCluster} from '../../../../selectors'
import type {Thunk} from '../../../../types/reduxTypes'

type ClusterMarkerProps = {
  zoom: number,
  selectEntity: (entity: CompanyEntity) => Thunk,
  zoomToLocation: ({lat: number, lng: number}) => Thunk,
  cluster: MapCluster,
  onClick: () => void,
  openedAddressId: number,
  useName: boolean,
}

const ClusterMarker = ({
  cluster,
  zoom,
  selectEntity,
  zoomToLocation,
  onClick,
  openedAddressId,
  useName,
}: ClusterMarkerProps) => {
  const MarkerText = <span className="marker__text">{useName ? cluster.id : cluster.numPoints}</span>
  let className, children
  const selected = cluster.numPoints === 1 && cluster.points[0].address_id === openedAddressId
  if (zoom < ENTITY_ZOOM) {
    className = useName ? 'map-label' : cluster.numPoints === 1 ? 'simple-marker' : 'cluster-marker'
    children = cluster.numPoints !== 1 && MarkerText
  } else {
    //TODO: fix classnames after the api provides enough information
    className = classnames({
      'company-marker': cluster.numPoints === 1,
      'cluster-marker': cluster.numPoints > 1,
      'government': cluster.points[0].tradewithgovernment,
    })
    children = cluster.numPoints === 1 ? <FaIconCircle size="18" /> : MarkerText
  }
  if (selected) className += ' selected'
  return (
    <Marker className={className} onClick={onClick}>
      {children}
    </Marker>
  )
}

export default compose(
  connect(
    (state) => ({
      openedAddressId: openedAddressDetailSelector(state),
    }),
    {
      openAddressDetail,
      zoomToLocation,
      setDrawer,
    }
  ),
  withHandlers({
    onClick: ({cluster, zoomToLocation, openAddressDetail, setDrawer}) => (event) => {
      if (cluster.numPoints === 1) {
        openAddressDetail(cluster.points[0].address_id)
        setDrawer(true)
        zoomToLocation({lat: cluster.lat, lng: cluster.lng}, ENTITY_CLOSE_ZOOM)
      } else {
        zoomToLocation({lat: cluster.lat, lng: cluster.lng}, cluster.setZoomTo)
      }
    },
  })
)(ClusterMarker)
