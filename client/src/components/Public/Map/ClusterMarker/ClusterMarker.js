// @flow
import React from 'react'
import {connect} from 'react-redux'
import {withHandlers, compose} from 'recompose'
import FaIconCircle from 'react-icons/lib/fa/circle-o'
import classnames from 'classnames'

import {ENTITY_ZOOM, ENTITY_CLOSE_ZOOM} from '../../../../constants'
import {openAddressDetail, zoomToLocation, setDrawer, setModal} from '../../../../actions/publicActions'
import {zoomSelector, openedAddressDetailSelector} from '../../../../selectors'
import Marker from '../Marker/Marker'
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
  openedAddressIds: Array<number>,
}

const ClusterMarker = ({
  cluster,
  zoom,
  selectEntity,
  zoomToLocation,
  onClick,
  openedAddressIds,
}: ClusterMarkerProps) => {
  let className, children
  const selected = cluster.numPoints === 1 && openedAddressIds.includes(cluster.points[0].address_id)
  if (zoom < ENTITY_ZOOM) {
    className = cluster.isLabel || (cluster.numPoints === 1)
      ? 'simple-marker'
      : 'cluster-marker'
    children = cluster.numPoints > 1 && <span className="marker__text">{cluster.numPoints}</span>
  } else {
    //TODO: fix classnames after the api provides enough information
    className = classnames({
      'company-marker': cluster.numPoints === 1,
      'cluster-marker': cluster.numPoints > 1,
      'government': cluster.points[0].tradewithgovernment,
    })
    children = cluster.numPoints === 1 ? <FaIconCircle size="18" /> : <span className="marker__text">{cluster.numPoints}</span>
  }
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
    }),
    {
      openAddressDetail,
      zoomToLocation,
      setDrawer,
      setModal,
    }
  ),
  withHandlers({
    onClick: ({zoom, cluster, zoomToLocation, openAddressDetail, setDrawer, setModal}) => (event) => {
      if (cluster.numPoints === 1) {
        openAddressDetail([cluster.points[0].address_id])
        setDrawer(true)
        setModal(false)
        zoomToLocation({lat: cluster.lat, lng: cluster.lng}, Math.max(ENTITY_CLOSE_ZOOM, zoom))
      } else {
        if (zoom < 22) {
          zoomToLocation({lat: cluster.lat, lng: cluster.lng}, cluster.setZoomTo)
        } else {
          openAddressDetail(cluster.points.map((point) => point.address_id))
          setDrawer(true)
          setModal(false)
          zoomToLocation({lat: cluster.lat, lng: cluster.lng}, Math.max(ENTITY_CLOSE_ZOOM, zoom))
        }
      }
    },
  })
)(ClusterMarker)
