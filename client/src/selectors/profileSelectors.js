// @flow
import {createSelector} from 'reselect'
import {sortBy, orderBy, last, mapValues, chunk, filter, values} from 'lodash'
import {normalizeName, parseQueryFromLocation} from '../utils'
import {getGroupFromQuery} from '../components/Profile/utilities'

import {paramsIdSelector} from './index'
import {CADASTRAL_PAGINATION_CHUNK_SIZE, DEFAULT_POLITICIAN_GROUP} from '../constants'

import type {
  State,
  Politician,
  PoliticianDetail,
  CadastralData,
  AssetDeclaration,
  PoliticiansSortState,
} from '../state'
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
> = createSelector(
  paramsIdSelector,
  statePoliticianDetailSelector,
  (id, data) => data[id]
)

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
> = createSelector(
  politicianAssetDeclarationsSelector,
  (reports) =>
    mapValues(reports, (r) => ({
      unmovable_assets: r.unmovable_assets ? r.unmovable_assets.split('\n') : [],
      movable_assets: r.movable_assets ? r.movable_assets.split('\n') : [],
      income_assets: [
        r.income && `príjmy: ${r.income}`,
        r.compensations && `paušálne náhrady: ${r.compensations}`,
        r.other_income && `ostatné príjmy: ${r.other_income}`,
        r.offices_other &&
          `počas výkonu verejnej funkcie má tieto funkcie (čl. 7 ods. 1 písm. c) u. z. 357/2004): ${
            r.offices_other
          }`,
      ].filter((asset) => asset !== null),
      source: r.source || 'http://www.nrsr.sk',
    }))
)

// assume 1 record per year
export const assetDeclarationsSortedYearsSelector: Selector<
  State,
  *,
  Array<string>
> = createSelector(
  politicianAssetDeclarationsSelector,
  (reports) => sortBy(Object.keys(reports))
)

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

const cadastralInfoComparator = (a: CadastralData, b: CadastralData) => {
  if (!a.landusename) return -1
  if (!b.landusename) return 1
  if (a.landusename === 'Orná pôda') return -1
  if (b.landusename === 'Orná pôda') return 1
  return a.landusename.localeCompare(b.landusename)
}

export const sortedCadastralInfoSelector: Selector<
  State,
  ContextRouter,
  Array<CadastralData>
> = createSelector(
  politicianCadastralSelector,
  (cadastral) =>
    values(cadastral)
      .sort(cadastralInfoComparator)
      .reverse()
)

export const filteredCadastralInfoSelector: Selector<State, ContextRouter, string> = createSelector(
  sortedCadastralInfoSelector,
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
> = createSelector(
  paramsYearSelector,
  parsedAssetDeclarations,
  (year, records) => records[year]
)

export const profileQuerySelector = (state: State): string => normalizeName(state.profile.query)

export const politicianGroupSelector = (state: State, props: ContextRouter): string =>
  getGroupFromQuery(parseQueryFromLocation(props.location).skupina) || DEFAULT_POLITICIAN_GROUP

export const politicianListSelector = (state: State, props: ContextRouter): ObjectMap<Politician> =>
  state.profile.list[politicianGroupSelector(state, props)] || {}

export const politicianSortingOptionSelector = (
  state: State,
  props: ContextRouter
): PoliticiansSortState =>
  state.profile.sorting[politicianGroupSelector(state, props)] || {
    sortKey: 'latest_income',
    reverse: true,
  }

export const orderedPoliticiansSelector: Selector<State, *, Array<Politician>> = createSelector(
  politicianListSelector,
  politicianSortingOptionSelector,
  (politicians, sortState) => {
    // if sorting by any of 'building' columns, sort by the other two cols. as secondary
    // otherwise, sort by income as well (and buildings afterwards)
    const buildingColumns = ['num_houses_flats', 'num_fields_gardens', 'num_others']
    // if one of the building column sort is reversed, reverse them all
    const buildingColumnsOrdering =
      buildingColumns.indexOf(sortState.sortKey) === -1 || sortState.reverse ? 'desc' : 'asc'
    const buildingDefaultSort = [
      ['num_houses_flats', buildingColumnsOrdering],
      ['num_fields_gardens', buildingColumnsOrdering],
      ['num_others', buildingColumnsOrdering],
    ]
    const defaultSortOrder =
      buildingColumns.indexOf(sortState.sortKey) === -1
        ? [['latest_income', 'desc']].concat(buildingDefaultSort)
        : buildingDefaultSort
    // primary sort by sortKey, secondary in order provided above
    const sortPriority = [[sortState.sortKey, sortState.reverse ? 'desc' : 'asc']].concat(
      defaultSortOrder.filter((key) => key !== sortState.sortKey)
    )
    return orderBy(
      Object.values(politicians).map((p) => ({...p, latest_income: p.latest_income || -1})),
      sortPriority.map((p) => p[0]),
      sortPriority.map((p) => p[1])
    ).map((p, i) => ({order: i + 1, ...p}))
  }
)

export const filteredPoliticiansSelector: Selector<State, *, Array<Politician>> = createSelector(
  profileQuerySelector,
  orderedPoliticiansSelector,
  (query, list) =>
    list.filter(
      (p) =>
        normalizeName(p.firstname).startsWith(query) ||
        normalizeName(p.surname).startsWith(query) ||
        normalizeName(`${p.firstname} ${p.surname}`).startsWith(query) ||
        normalizeName(`${p.surname} ${p.firstname}`).startsWith(query) ||
        (p.party_abbreviation && normalizeName(p.party_abbreviation).indexOf(query) !== -1)
    )
)
