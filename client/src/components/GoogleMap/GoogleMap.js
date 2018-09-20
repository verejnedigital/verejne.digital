// @flow
import * as React from 'react'
import GMap from 'google-map-react'
import {GOOGLE_MAP_CONFIG, createMapOptions} from '../../constants'

import type {MapOptions} from '../../state'

type Props = {|
  zoom: number,
  center: [number, number],
  onChange: (options: MapOptions) => any,
  children: React.Node,
|}

const GoogleMap = ({zoom, center, onChange, children}: Props) => (
  <GMap
    bootstrapURLKeys={GOOGLE_MAP_CONFIG}
    center={center}
    zoom={zoom}
    options={createMapOptions}
    onChange={onChange}
  >
    {children}
  </GMap>
)

export default GoogleMap
