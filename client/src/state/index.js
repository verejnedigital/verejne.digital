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

export type Entity = {
  eid: string,
  lng: string,
  lat: string,
  selected: string,
  title: string,
  size: string,
  level: string,
  visible: string,
  ds: Array<any>,
  name: string,
}

export type Company = {
  id: number,
  eid: number,
  zrsr_data: Array<any>,
  company_stats: Array<any>,
  contracts: Array<any>,
  new_orsr_data: Array<any>,
  sponzori_stran_data: Array<any>,
  related: Array<any>,
  auditori_data: Array<any>,
  audiovizfond_data: Array<any>,
  entities: Array<Entity>,
  firmy_data: Array<any>,
  total_contracts: number,
  advokati_data: Array<any>,
  nadacie_data: Array<any>,
  orsresd_data: Array<any>,
  politicians_data: Array<any>,
  stranicke_prispevky_data: Array<any>,
  uzivatelia_vyhody_ludia_data: Array<any>,
}

export type NoticeMap = {[string]: Notice}

export type CompanyMap = {[string]: Company}

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

export type SearchedEntity = {
  eids: string[],
  id: string,
}

export type Connections = {
  entities: {[string]: Entity},
  detail: {[string]: {ids: string[]}},
  entityDetails: {
    [string]: {
      name: string,
      data: any, //TODO: TBD
    },
  },
}

export type State = {|
  +count: number,
  +companies: CompanyMap,
  +notices: {|
    +list: NoticeMap,
    +details: NoticeMap,
  |},
  publicly: {
    currentPage: number,
  },
  entities: Entity[],
  mapOptions: MapOptions,
  connections: Connections,
|}

const getInitialState = (): State => ({
  count: 0,
  companies: {},
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
  entities: [],
  connections: {
    entities: {},
    detail: {},
    entityDetails: {},
  },
})

export default getInitialState
