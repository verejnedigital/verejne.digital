// @flow
import {fitBounds} from 'google-map-react/utils'
import {minBy, maxBy} from 'lodash'

import {ENTITY_CLOSE_ZOOM, DEFAULT_MAP_CENTER, COUNTRY_ZOOM} from '../constants'
import type {Center} from '../state'

// this function doesn't cover crossing 0th meridian and equator, but for Slovakia it's good enough
export const getBoundsFromLocations = (locations: Center[], width: number, height: number) => {
  switch (locations.length) {
    case 0:
      return {center: DEFAULT_MAP_CENTER, zoom: COUNTRY_ZOOM}
    case 1:
      return {center: locations[0], zoom: ENTITY_CLOSE_ZOOM}
    default:
      return fitBounds(
        {
          sw: {
            lat: minBy(locations, 'lat').lat,
            lng: minBy(locations, 'lng').lng,
          },
          ne: {
            lat: maxBy(locations, 'lat').lat,
            lng: maxBy(locations, 'lng').lng,
          },
        },
        {width, height}
      )
  }
}
