import {createSelector} from 'reselect'
import {sortBy, last, mapValues} from 'lodash'
import {normalizeName, parseQueryFromLocation} from '../utils'
import {paramsIdSelector} from './index'

import type {State} from '../state'
import type {ProfileDetailPageProps} from '../components/Profil/DetailPage'

// TODO proptype
export const politicianDetailSelector = createSelector(
  paramsIdSelector,
  (state: State) => state.profile.details,
  (id, data) => data[id]
)

export const politicianCadastralSelector = createSelector(
  paramsIdSelector,
  (state: State) => state.profile.cadastral,
  (id, data) => data[id]
)

export const politicianAssetDeclarationsSelector = createSelector(
  paramsIdSelector,
  (state: State) => state.profile.assetDeclarations,
  (id, data) => data[id]
)

// assume 1 record per year
export const parsedAssetDeclarations = createSelector(
  politicianAssetDeclarationsSelector,
  (reports) =>
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
export const assetDeclarationsSortedYearsSelector = createSelector(
  politicianAssetDeclarationsSelector,
  (reports) => sortBy(Object.keys(reports))
)

export const assetDeclarationsLatestYearSelector = createSelector(
  assetDeclarationsSortedYearsSelector,
  (years) => last(years)
)

export const paramsYearSelector = createSelector(
  (_: State, props: ProfileDetailPageProps) => parseQueryFromLocation(props.location).year,
  assetDeclarationsLatestYearSelector,
  (paramsYear, latestYear) => Number.parseInt(paramsYear, 10) || latestYear
)

export const parsedAssetDeclarationsForYearSelector = createSelector(
  paramsYearSelector,
  parsedAssetDeclarations,
  (year, records) => records[year]
)

export const profileQuerySelector = (state: State) => normalizeName(state.profile.query)

export const housesOrderedPoliticiansSelector = (state: State) =>
  sortBy(Object.values(state.profile.list), ['num_houses_flats'])
    .reverse()
    .map((p, i) => ({order: i + 1, ...p}))

export const filteredPoliticiansSelector = createSelector(
  profileQuerySelector,
  housesOrderedPoliticiansSelector,
  (query, list) =>
    list.filter(
      (p) =>
        normalizeName(p.firstname).startsWith(query) ||
        normalizeName(p.surname).startsWith(query) ||
        normalizeName(p.party_abbreviation).indexOf(query) !== -1
    )
)
