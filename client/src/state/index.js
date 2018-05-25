// @flow
import {SLOVAKIA_COORDINATES} from '../constants'
import type {ObjectMap} from '../types/commonTypes'

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

export type Politician = {|
  num_fields_gardens: number,
  picture: string,
  surname: string,
  party_abbreviation: string,
  firstname: string,
  title: string,
  term_finish: number,
  party_nom: string,
  num_houses_flats: number,
  office_name_male: string,
  num_others: number,
  term_start: number,
  office_name_female: string,
  id: number,
|}

export type CadastralData = {|
  lon: number,
  cadastralunitcode: number,
  landusename: string,
  cadastralunitname: string,
  parcelno: string,
  lat: number,
  foliono: number,
|}

export type AssetDeclaration = {|
  compensations: ?string,
  source: string,
  year: number,
  offices_other: string,
  other_income: ?string,
  income: string,
  movable_assets: string,
  unmovable_assets: string,
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
    +list: ObjectMap<Notice>,
    +details: ObjectMap<Notice>,
  |},
  +profile: {|
    +list: ObjectMap<Politician>,
    +details: ObjectMap<Politician>,
    +cadastral: ObjectMap<CadastralData>,
    +assetDeclarations: ObjectMap<AssetDeclaration>,
    +query: string,
  |},
  entities: Array<Entity>,
  mapOptions: MapOptions,
  mapReference: MapReference,
|}

const getInitialState = (): State => ({
  count: 0,
  notices: {
    list: {},
    details: {},
  },
  profile: {
    list: {},
    details: {},
    cadastral: {},
    assetDeclarations: {},
    query: '',
  },
  mapOptions: {
    center: SLOVAKIA_COORDINATES,
    zoom: 8,
    bounds: undefined,
  },
  mapReference: undefined,
  entities: [],
})

export default getInitialState
