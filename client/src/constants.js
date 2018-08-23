// @flow
import districtJson from './slovensko/okresy-centers.json'
import regionJson from './slovensko/kraje-centers.json'

export const SLOVAKIA_DISTRICT = districtJson
export const SLOVAKIA_REGION = regionJson

export const PAGINATION_CHUNK_SIZE = 10
export const NOTICES_PAGINATION_SIZE = 10
export const CADASTRAL_PAGINATION_CHUNK_SIZE = 20
export const CADASTRAL_PAGINATION_SIZE = 10

export const DEFAULT_PROVIDER_KEEP_ALIVE = 10 * 60 * 1000

export const DEFAULT_MAP_CENTER = {lat: 48.6, lng: 19.5}
export const ENTITY_CLOSE_ZOOM = 19
export const ENTITY_ZOOM = 17
export const SUB_CITY_ZOOM = 14
export const CITY_ZOOM = 11
export const COUNTRY_ZOOM = 8
export const DISTRICT_ZOOM = 10
export const WORLD_ZOOM = 6
export const GOOGLE_MAP_API_KEY = 'AIzaSyCAXMlEL-sfzT4jVK5CQHysSPp77JnVLks'
export const SLOVAKIA_COORDINATES = [48.6, 19.5]

const SLOVAKIA_NORTH_BOUND = 49.62
const SLOVAKIA_SOUTH_BOUND = 47.72
const SLOVAKIA_WEST_BOUND = 16.82
const SLOVAKIA_EAST_BOUND = 22.57 //TU NIC NIEJE!

export const SLOVAKIA_BOUNDS = [[SLOVAKIA_WEST_BOUND, SLOVAKIA_SOUTH_BOUND],
  [SLOVAKIA_EAST_BOUND, SLOVAKIA_NORTH_BOUND]]

// Typing only the first level is enough for now
type GMapOptions = {
  ControlPosition: {
    RIGHT_CENTER: number,
    TOP_RIGHT: number,
  },
  ZoomControlStyle: {
    SMALL: number,
  },
}

export const createMapOptions = (maps: GMapOptions) => {
  return {
    zoomControlOptions: {
      position: maps.ControlPosition.RIGHT_CENTER,
      style: maps.ZoomControlStyle.SMALL,
    },
    mapTypeControlOptions: {
      position: maps.ControlPosition.TOP_RIGHT,
    },
    mapTypeControl: true,
    styles: [
      {elementType: 'geometry.fill', stylers: [{color: '#f1f4f5'}]},
      {elementType: 'geometry.stroke', stylers: [{color: '#cddae3'}]},
      {elementType: 'labels.text.fill', stylers: [{color: '#666666'}]},
      {elementType: 'labels.text.stroke', stylers: [{color: '#ffffff'}]},
      {
        featureType: 'administrative',
        elementType: 'geometry.stroke',
        stylers: [{color: '#333333'}],
      },
      {
        featureType: 'landscape',
        elementType: 'geometry.stroke',
        stylers: [{color: '#859fb4'}],
      },
      {
        featureType: 'landscape.natural',
        elementType: 'geometry',
        stylers: [{color: '#f1f4f5'}],
      },
      {
        featureType: 'landscape.man_made',
        elementType: 'geometry.fill',
        stylers: [{color: '#dae3ea'}],
      },
      {
        featureType: 'road',
        elementType: 'geometry.fill',
        stylers: [{color: '#ffffff'}],
      },
      {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{color: '#a5baca'}],
      },
      {
        featureType: 'road.local',
        elementType: 'geometry.fill',
        stylers: [{color: '#ffffff'}],
      },
      {
        featureType: 'transit.line',
        elementType: 'geometry',
        stylers: [{color: '#c5d1da'}],
      },
      {
        featureType: 'transit.station',
        elementType: 'geometry',
        stylers: [{color: '#e6ecf1'}],
      },
      {
        featureType: 'water',
        elementType: 'geometry.fill',
        stylers: [{color: '#ebf8ff'}],
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{color: '#859fb4'}],
      },
      {
        featureType: 'landscape.natural',
        elementType: 'labels',
        stylers: [{visibility: 'off'}],
      },
      {
        featureType: 'road.highway',
        elementType: 'labels',
        stylers: [{visibility: 'off'}],
      },
      {
        featureType: 'road.arterial',
        elementType: 'labels',
        stylers: [{visibility: 'off'}],
      },
    ],
  }
}

export const GOOGLE_MAP_CONFIG = {
  key: GOOGLE_MAP_API_KEY,
  language: 'sk',
  region: 'sk',
}

export const SLOVAKIA_COORDS = {
  lat: 48.6,
  lng: 19.5,
}

export const clusterOptions = {
  minZoom: 0,
  maxZoom: 18,
  radius: 30,
}
export const FACEBOOK_LIKE_SRC =
  'https://www.facebook.com/plugins/like.php?href=https%3A%2F%2Fwww.facebook.com%2Fverejne.digital&width=111&layout=button_count&action=like&size=small&show_faces=true&share=false&height=46&appId='

export const keys = ['income', 'compensations', 'other_income', 'offices_other']
export const descriptions = [
  'príjmy ',
  'paušálne náhrady',
  'ostatné príjmy',
  'počas výkonu verejnej funkcie má tieto funkcie (čl. 7 ods. 1 písm. c) u. z. 357/2004)',
]

export const DEFAULT_ENTITIES_REQUEST_PARAMS = {
  lat1: 47.26036122625137,
  lng1: 16.53369140625,
  lat2: 49.90503005077024,
  lng2: 22.46630859375,
  restrictToSlovakia: true,
  usedLevel: 3,
}

export const FIND_ENTITY_TITLE = 'Hľadaj firmu / človeka'

export const LOADING_CIRCLE_COLOR = "#0062db"