// @flow
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
  kandidati: Array < Candidate | [] >,
  price_num: number,
  price_avg: number,
|}

export type NoticeMap = { [string]: Notice }


export type Entity = {
  eid: string,
  lng: string,
  lat: string,
  selected: string,
  title: string,
  size: string,
  level: string,
  visible: string,
  ds: string,
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

export type MapReference = any

export type State = {|
  +count: number,
  +notices: {|
    +data: NoticeMap,
  |},
  entities: Array<Entity>,
  mapOptions: MapOptions,
  mapReference: MapReference,
|}

const getInitialState = (): State => ({
  count: 0,
  notices: {
    data: {},
  },
  mapOptions: {
    center: [48.600, 19.500], // Slovakia
    zoom: 8,
    bounds: undefined,
  },
  mapReference: undefined,
  entities: [],
})

export default getInitialState
