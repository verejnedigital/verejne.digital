// @flow
import {immutableSet} from './utils'
import {setInitialState as getVerejneInitialState} from './state/verejneState'
import {compose} from 'recompose'

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

// TODO change me
const getNoticesInitialState = (state) => immutableSet(state, [], {
  count: 0,
  notices: {
    data: {},
  },
})

const getInitialState = (): State => compose(
  getVerejneInitialState,
  getNoticesInitialState,
)({})

export default getInitialState
