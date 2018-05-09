// @flow
import {immutableSet} from './utils'
import {setInitialState as getVerejneInitialState} from './state/VerejneState'
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

const CHANGE_ME = (state) => immutableSet(state, [], {
  count: 0,
  notices: {
    data: {},
  },
})

// TODO WTF this is in reverese order????
const getInitialState = (): State => compose(
  getVerejneInitialState,
  CHANGE_ME,
  //(state) => ({kks: 'sad'}),
)({})

export default getInitialState

console.log('INI', getInitialState())
