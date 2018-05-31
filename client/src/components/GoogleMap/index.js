// @flow
import * as React from 'react'
import GMap from 'google-map-react'
import {GOOGLE_MAP_CONFIG, createMapOptions} from '../../constants'

import type {MapReference, MapOptions} from '../../state'

type Props = {|
  zoom: number,
  center: [number, number],
  onGoogleApiLoaded: (mapReference: MapReference) => any,
  onChange: (options: MapOptions) => any,
  children: React.Node,
|}

const GoogleMap = ({zoom, center, onGoogleApiLoaded, onChange, children}: Props) => {
  return (
    <GMap
      bootstrapURLKeys={GOOGLE_MAP_CONFIG}
      center={center}
      zoom={zoom}
      options={createMapOptions}
      onGoogleApiLoaded={onGoogleApiLoaded}
      onChange={onChange}
      yesIWantToUseGoogleMapApiInternals
    >
      {children}
    </GMap>
  )
}

export default GoogleMap
