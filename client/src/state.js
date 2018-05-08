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
  kandidati: Array<Candidate | []>,
  price_num: number,
  price_avg: number,
|}

export type NoticeMap = {[string]: Notice}

export type State = {|
  +count: number,
  +notices: {|
    +data: NoticeMap,
  |},
|}

export default (): State => ({
  count: 0,
  notices: {
    data: {},
  },
})
