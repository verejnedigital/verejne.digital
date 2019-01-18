// @flow
import React, {Component} from 'react'
import GoogleMapReact from 'google-map-react'
import {
  COUNTRY_ZOOM,
  SLOVAKIA_COORDS,
  createMapOptions,
  GOOGLE_MAP_CONFIG,
} from '../../../constants'

import type {CadastralData, GeolocationPoint} from '../../../state'

import './MapContainer.css'

const Marker = ({title, label, href}) =>
  href ? (
    <a href={href} title={title} className="marker">
      {label}
    </a>
  ) : (
    <div title={title} className="marker">
      {label}
    </div>
  )

type MapContainerProps = {
  assets: Array<CadastralData>,
  center: GeolocationPoint,
  zoom: number,
}

// TODO fix flow
class MapContainer extends Component<MapContainerProps> {
  render() {
    return (
      <div className="map">
        <GoogleMapReact
          bootstrapURLKeys={GOOGLE_MAP_CONFIG}
          defaultCenter={SLOVAKIA_COORDS}
          options={createMapOptions}
          center={this.props.center}
          defaultZoom={COUNTRY_ZOOM}
          zoom={this.props.zoom}
        >
          {this.props.assets.map((asset, key) => {
            return (
              <Marker
                // TODO: This should be template prop instead.
                href={asset.eid && `#js-${asset.eid}`}
                key={key}
                label={key + 1}
                title={asset.name && asset.address && `${asset.name}, ${asset.address}`}
                lat={asset.lat}
                lng={asset.lon || asset.lng}
              />
            )
          })}
        </GoogleMapReact>
      </div>
    )
  }
}

export default MapContainer
