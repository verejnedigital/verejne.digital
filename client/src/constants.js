export const paginationChunkSize = 10
export const ENTITY_ZOOM = 16
export const SUB_CITY_ZOOM = 13
export const CITY_ZOOM = 10
export const GOOGLE_MAP_API_KEY = 'AIzaSyCAXMlEL-sfzT4jVK5CQHysSPp77JnVLks'

export const createMapOptions = (maps) => {
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

export const clusterOptions = {
  minZoom: 0,
  maxZoom: 16,
  radius: 60,
}
