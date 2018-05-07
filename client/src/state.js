// @flow

export type Kandidat = {
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

export type Obstaravanie = {|
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
  kandidati: Array<Kandidat | []>,
  price_num: number,
  price_avg: number,
|}

export type State = {|
  +count: number,
  +obstaravania: {|
    +data: ?{[string]: Obstaravanie},
  |},
  +activeProviderPromises: {
    [string]: Promise<any>,
  },
|}

export default (): State => ({
  count: 0,
  obstaravania: {
    data: undefined,
  },
  activeProviderPromises: {},
})
