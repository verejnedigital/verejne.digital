// @flow
import {SLOVAKIA_COORDINATES} from './constants'
import type {ObjectMap} from './types/commonTypes'

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
  customer: string,
  bulletin_number: number,
  title: string,
  text: string,
  price: number,
  price_stdev: number,
  bulletin_day: number,
  bulletin_month: number,
  bulletin_year: number,
  bulletin_date: string, // string representation of day/month/year
  kandidati: Array<Candidate>,
  price_num: number,
  price_avg: number,
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

export type CompanyEntity = {
  eid: number,
  entity_name: string,
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

export type IcoSource = Array<{
  ico: number,
}>

export type Company = {
  id: number,
  eid: number,
  zrsr_data: IcoSource,
  company_stats: Array<CompanyStat>,
  contracts: Array<any>,
  new_orsr_data: IcoSource,
  sponzori_stran_data: Array<any>,
  related: Array<any>,
  auditori_data: Array<any>,
  audiovizfond_data: Array<any>,
  entities: Array<CompanyEntity>,
  firmy_data: IcoSource,
  total_contracts: number,
  advokati_data: Array<any>,
  nadacie_data: Array<any>,
  orsresd_data: IcoSource,
  politicians_data: Array<any>,
  stranicke_prispevky_data: Array<any>,
  uzivatelia_vyhody_ludia_data: Array<any>,
}

export type NoticeMap = {[string]: Notice}

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
  query: string,
  eids: number[],
}
export type GraphId = number

export type Node = {
  id: GraphId,
  label: string,
  x?: number,
  y?: number,
  distA?: number,
  distB?: number,
  leaf?: boolean,
}
export type Edge = {
  from: GraphId,
  to: GraphId,
}
export type Graph = {|
  nodes: Array<Node>,
  edges: Array<Edge>,
  nodeIds: {[GraphId]: boolean},
|}

export type Connections = {
  detail: {[string]: {ids: number[]}},
  subgraph: {[string]: {data: Graph}},
  selectedEids: Array<number>,
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

export type Eufund = {
  title: string,
  link: string,
  price: number,
  state: string,
  call_state: string,
  call_title: string,
}

export type Eufunds = {
  eufunds_count: number,
  eufunds_price_sum: number,
  largest: Array<Eufund>,
}

export type CompanyFinancial = {
  revenue: number,
  profit: number,
  employees: string,
}

export type Contract = {
  client_eid: number,
  client_name: string,
  id: number,
  contract_price_amount: number,
  contract_price_total_amount: number,
  signed_on: string,
  effective_from: string,
  effective_to: string,
  status_id: number,
  contract_id: number,
  contract_identifier: string,
}

export type Contracts = {
  count: number,
  price_amount_sum: number,
  most_recent: Array<Contract>,
  largest: Array<Contract>,
}

// TODO rename to Notice when old one is gone
export type NoticeNew = {
  client_eid: number,
  client_name: string,
  id: number,
  notice_id: number,
  contract_id: number,
  title: string,
  estimated_value_amount: number,
  estimated_value_currency: string,
  bulletin_issue_id: number,
  notice_type_id: number,
  short_description: string,
  total_final_value_amount: number,
  total_final_value_currency: string,
  body: string,
}

export type Notices = {
  count: number,
  total_final_value_amount_eur_sum: number,
  most_recent: Array<NoticeNew>,
  largest: Array<NoticeNew>,
}

export type RelatedEntity = {
  eid: number,
  name: string,
  edge_types: number[],
  edge_type_texts: string[],
  lat: number,
  lng: number,
  address: string,
}

export type NewEntityDetail = {
  eid: number,
  name: string,
  lat: number,
  lng: number,
  address: string,
  eufunds: Eufunds,
  companyfinancials: {
    [year: number]: CompanyFinancial,
  },
  companyinfo: {
    ico: string,
    established_on: string,
    terminated_on: string,
  },
  contracts: Contracts,
  notices: Notices,
  related: RelatedEntity[],
}

// Each property must begin with '+' to be made read only and each object
// must be enclosed in '|' so no properties can be added to state at runtime
export type State = {|
  +count: number,
  +companies: ObjectMap<Company>,
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
    +entitySearchEids: Array<number>,
    +showInfo: any, //TODO: TBD
    +openedAddressDetail: Array<number>,
    +drawerOpen: boolean,
  |},
  +mapOptions: MapOptions,
  +connections: Connections,
  +addresses: ObjectMap<Address>,
  +entities: ObjectMap<NewEntityState>,
  +entityDetails: ObjectMap<NewEntityDetail>,
  +entitySearch: ObjectMap<SearchedEntity>,
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
    openedAddressDetail: [],
    drawerOpen: false,
  },
  mapOptions: {
    center: SLOVAKIA_COORDINATES,
    zoom: 8,
    bounds: undefined,
  },
  connections: {
    detail: {},
    subgraph: {},
    selectedEids: [],
  },
  addresses: {},
  entities: {},
  entityDetails: {},
  entitySearch: {},
})

export default getInitialState
