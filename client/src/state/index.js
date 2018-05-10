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

export type State = {|
  +count: number,
  +notices: {|
    +data: NoticeMap,
  |},
|}

// TODO flow
export class Entity {
  constructor({eid, lat, lng, title, size, ds, level}) {
    this.eid = eid
    this.lng = lng
    this.lat = lat
    this.selected = false
    this.title = title
    this.size = size
    this.level = level
    this.visible = false
    this.ds = ds
  }
}


const getInitialState = (): State => ({
  count: 0,
  notices: {
    data: {},
  },
  mapOptions: {
    center: [48.600, 19.500], // Slovakia :)
    zoom: 8,
    bounds: undefined,
  },
  mapReference: undefined,
  entities: [],
})

export default getInitialState
