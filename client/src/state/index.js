// @flow
import {DEFAULT_MAP_CENTER, SLOVAKIA_COORDINATES} from '../constants'
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
  customer: string,
|}

export type PoliticianDetail = {|
  picture: string,
  party_nom: string,
  surname: string,
  party_abbreviation: string,
  firstname: string,
  title: string,
  term_finish: number,
  office_name_male: string,
  term_start: number,
  office_name_female: string,
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
  ds: Array<any>,
  name: string,
}

export type CompanyStat = {
  datum_vzniku: string,
  datum_zaniku: string,
  zisk2016: ?number,
  trzby2016: ?number,
  zisk2015: ?number,
  trzby2015: ?number,
  zisk2014: ?number,
  trzby2014: ?number,
  trzby2016: ?number,
  zamestnanci2016: string,
  zamestnanci2015: string,
}

export type Company = {
  id: number,
  eid: number,
  zrsr_data: Array<any>,
  company_stats: Array<CompanyStat>,
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

export type Address = {
  address_id: number,
  lat: number,
  lng: number,
}

// Entity returned from api call getEntitiesAtAddressId
export type NewEntity = {
  id: number,
  name: string,
}

export type NewEntityState = NewEntity & {addressId: number}

export type RelatedEntity = {
  name: string,
  stakeholder_type_id: number,
  eid: number,
  address: string,
  lat: number,
  lng: number,
}

export type EntityDetails = {
  name: string,
  related: RelatedEntity[],
  address: string,
  lat: number,
  lng: number,
  companyinfo: {
    established_on: string,
    ico: number,
    terminated_on: string,
  },
}

// Each property must begin with '+' to be made read only and each object
// must be enclosed in '|' so no properties can be added to state at runtime
export type State = {|
  +count: number,
  +companies: CompanyMap,
  +notices: {|
    +list: ObjectMap<Notice>,
    +details: ObjectMap<Notice>,
    +searchQuery: string,
  |},
  +profile: {|
    +list: ObjectMap<Politician>,
    +details: ObjectMap<PoliticianDetail>,
    +cadastral: ObjectMap<CadastralData>,
    +assetDeclarations: ObjectMap<ObjectMap<AssetDeclaration>>,
    +query: string,
  |},
  +publicly: {|
    +currentPage: number,
    +autocompleteValue: string,
    +entitySearchValue: string,
    +entitySearchModalOpen: boolean,
    +entitySearchFor: string,
    +entitySearchEids: Array<string>,
    +showInfo: any, //TODO: TBD
    +openedAddressDetail: ?number,
  |},
  +mapOptions: MapOptions,
  +connections: Connections,
  +addresses: ObjectMap<Address>,
  +newEntities: ObjectMap<NewEntityState>,
  +entityDetails: ObjectMap<EntityDetails>,
|}

const getInitialState = (): State => ({
  count: 0,
  companies: {},
  notices: {
    list: {},
    details: {},
    searchQuery: '',
  },
  profile: {
    list: {},
    details: {},
    cadastral: {},
    assetDeclarations: {},
    query: '',
  },
  publicly: {
    currentPage: 1,
    autocompleteValue: '',
    entitySearchValue: '',
    entitySearchModalOpen: false,
    entitySearchFor: '',
    entitySearchEids: [],
    showInfo: {},
    openedAddressDetail: undefined,
  },
  mapOptions: {
    center: SLOVAKIA_COORDINATES,
    zoom: 8,
    bounds: undefined,
  },
  newEntities: {},
  entityDetails: {},
  addresses: {},
  connections: {
    entities: {},
    detail: {},
    entityDetails: {},
  },
})

export default getInitialState
