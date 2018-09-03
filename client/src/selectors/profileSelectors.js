// @flow
import {createSelector} from 'reselect'
import {sortBy, last, mapValues, chunk, filter} from 'lodash'
import {normalizeName, parseQueryFromLocation} from '../utils'
import {paramsIdSelector} from './index'
import {CADASTRAL_PAGINATION_CHUNK_SIZE} from '../constants'

import type {State, Politician, PoliticianDetail, CadastralData, AssetDeclaration} from '../state'
import type {Selector} from 'reselect'
import type {ContextRouter} from 'react-router-dom'
import type {ObjectMap} from '../types/commonTypes'
import type {ParsedAssetDeclarationsType} from '../types/profileTypes'

export const statePoliticianDetailSelector = (state: State): ObjectMap<PoliticianDetail> =>
  state.profile.details

export const politicianDetailSelector: Selector<
  State,
  ContextRouter,
  PoliticianDetail
> = createSelector(paramsIdSelector, statePoliticianDetailSelector, (id, data) => data[id])

export const politicianCadastralSelector: Selector<
  State,
  ContextRouter,
  CadastralData
> = createSelector(
  paramsIdSelector,
  (state: State) => state.profile.cadastral,
  (id, data) => data[id]
)

export const politicianAssetDeclarationsSelector: Selector<
  State,
  *,
  ObjectMap<AssetDeclaration>
> = createSelector(
  paramsIdSelector,
  (state: State) => state.profile.assetDeclarations,
  (id, data) => data[id]
)

// assume 1 record per year
export const parsedAssetDeclarations: Selector<
  State,
  *,
  ObjectMap<ParsedAssetDeclarationsType>
> = createSelector(politicianAssetDeclarationsSelector, (reports) =>
  mapValues(reports, (r) => ({
    unmovable_assets: r.unmovable_assets ? r.unmovable_assets.split('\n') : [],
    movable_assets: r.movable_assets ? r.movable_assets.split('\n') : [],
    income_assets: [
      `príjmy: ${r.income}`,
      `paušálne náhrady: ${r.compensations}`,
      `ostatné príjmy: ${r.other_income}`,
      `počas výkonu verejnej funkcie má tieto funkcie (čl. 7 ods. 1 písm. c) u. z. 357/2004): ${
        r.offices_other
      }`,
    ],
    source: r.source || 'http://www.nrsr.sk',
  }))
)

// assume 1 record per year
export const assetDeclarationsSortedYearsSelector: Selector<
  State,
  *,
  Array<string>
> = createSelector(politicianAssetDeclarationsSelector, (reports) => sortBy(Object.keys(reports)))

export const assetDeclarationsLatestYearSelector: Selector<State, *, string> = createSelector(
  assetDeclarationsSortedYearsSelector,
  (years) => last(years)
)

export const paramsYearSelector: Selector<State, ContextRouter, string> = createSelector(
  (_: State, props: ContextRouter): string => parseQueryFromLocation(props.location).year,
  assetDeclarationsLatestYearSelector,
  (paramsYear, latestYear) => paramsYear || latestYear
)

export const cadastralPageSelector: Selector<State, ContextRouter, number> = createSelector(
  (_: State, props: ContextRouter): string => parseQueryFromLocation(props.location).cadastralPage,
  (page) => Number.parseInt(page, 10) || 1
)

export const cadastralSearchSelector: Selector<State, ContextRouter, string> = createSelector(
  (_: State, props: ContextRouter): string =>
    parseQueryFromLocation(props.location).cadastralSearch,
  (search) => search || ''
)

export const filteredCadastralInfoSelector: Selector<State, ContextRouter, string> = createSelector(
  politicianCadastralSelector,
  cadastralSearchSelector,
  (cadastral, search) => {
    // TODO: $FlowFixMe Cannot call `filter` because string is incompatible with number
    return filter(cadastral, ({cadastralunitname}) =>
      normalizeName(cadastralunitname).startsWith(search)
    )
  }
)

export const filteredCadastralInfoLengthSelector: Selector<State, *, number> = createSelector(
  filteredCadastralInfoSelector,
  (cadastral) => cadastral.length
)

export const paginatedCadastralInfoSelector = createSelector(
  filteredCadastralInfoSelector,
  cadastralPageSelector,
  (cadastral, page) => {
    return chunk(Object.values(cadastral), CADASTRAL_PAGINATION_CHUNK_SIZE)[page - 1] || []
  }
)

export const parsedAssetDeclarationsForYearSelector: Selector<
  State,
  *,
  ParsedAssetDeclarationsType
> = createSelector(paramsYearSelector, parsedAssetDeclarations, (year, records) => records[year])

export const profileQuerySelector = (state: State): string => normalizeName(state.profile.query)

export const orderedPoliticiansSelector = (state: State): Array<Politician> =>
  sortBy(Object.values(state.profile.list), ['num_houses_flats', 'num_fields_gardens', 'num_others'])
    .reverse()
    .map((p, i) => ({order: i + 1, ...p}))

export const filteredPoliticiansSelector: Selector<State, *, Array<Politician>> = createSelector(
  profileQuerySelector,
  orderedPoliticiansSelector,
  (query, list) =>
    list.filter(
      (p) =>
        normalizeName(p.firstname).startsWith(query) ||
        normalizeName(p.surname).startsWith(query) ||
        normalizeName(p.party_abbreviation).indexOf(query) !== -1
    )
)
