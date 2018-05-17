import {createSelector} from 'reselect'
import {sortBy} from 'lodash'
import {normalizeName} from '../utils'

import type {State} from '../state'

// TODO proptype
export const politicianDetailSelector = (state: State, props: any) =>
  props.match.params.id && state.profile.list[props.match.params.id]

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
