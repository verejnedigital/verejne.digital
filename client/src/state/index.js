// @flow
import {SLOVAKIA_COORDINATES} from '../constants'

export type Candidate = {
  id: number,
  eid: number,
  customer: string,
  ico: string,
  name: string,
  title: string,
  text: string,
  price: number,
  score: number,
}

export type Notice = {|
  id: number,
  eid: number,
  curstomer: string,
  bulletin_number: number,
  title: string,
  text: string,
  price: number,
  price_stdev: number,
  bulletin_day: number,
  bulletin_month: number,
  bulletin_year: number,
  bulletin_date: string, // string representation of day/month/year
  kandidati: Array<Candidate | []>,
  price_num: number,
  price_avg: number,
|}

export type NoticeMap = {[string]: Notice}

export type Entity = {
  eid: string,
  lng: string,
  lat: string,
  size: string,
  ds: Array<any>,
  name: string,
}

export type GeolocationPoint = {
  lat: number,
  lng: number,
}

export type MapBounds = {
  ne: GeolocationPoint,
  nw: GeolocationPoint,
  se: GeolocationPoint,
  sw: GeolocationPoint,
}

export type MapOptions = {
  center: [number, number],
  zoom: number,
  bounds: ?MapBounds,
}

export type Center = {lat: number, lng: number}

export type State = {|
  +count: number,
  +notices: {|
    +list: NoticeMap,
    +details: NoticeMap,
  |},
  publicly: {
    currentPage: number,
  },
  entities: ?Array<Entity>,
  mapOptions: MapOptions,
|}

const getInitialState = (): State => ({
  count: 0,
  notices: {
    list: {},
    details: {},
  },
  publicly: {
    currentPage: 1,
  },
  mapOptions: {
    center: SLOVAKIA_COORDINATES,
    zoom: 8,
    bounds: undefined,
  },
  entities: undefined,
})

export default getInitialState
