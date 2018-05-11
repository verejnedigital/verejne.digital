// @flow
import {createSelector} from 'reselect'
import {sortBy, chunk} from 'lodash'
import queryString from 'query-string'
import {paginationChunkSize} from '../constants'
import {values} from '../utils'

import type {Location} from 'react-router-dom'
import type {NoticesOrdering} from '../components/NoticeList'
import type {NoticeDetailProps} from '../components/NoticeDetail'
import type {State, MapOptions, MapReference, Entity} from '../state'

export const noticeDetailSelector = (state: State, props: NoticeDetailProps) =>
  props.match.params.id && state.notices.data[props.match.params.id]

export const dateSortedNoticesSelector = createSelector(
  (state: State) => state.notices.data,
  (data) => sortBy(values(data), ['bulletin_year', 'bulletin_month', 'bulletin_day'])
)

export const nameSortedNoticesSelector = createSelector(
  (state: State) => state.notices.data,
  (data) => sortBy(values(data), ['title'])
)

export const paginationSelector = (_: State, props: {location: Location}): number => {
  const query = queryString.parse(props.location.search)
  return Number.parseInt(query.page, 10) || 1
}

export const noticesOrderingSelector = (_: State, props: {location: Location}): NoticesOrdering => {
  const query = queryString.parse(props.location.search)
  return query.ordering || 'date'
}

// not the most elegant, but presently we need the whole list
// sorted by date anyway
export const newestBulletinDateSelector = createSelector(
  dateSortedNoticesSelector,
  (notices) => notices[0].bulletin_date
)

export const paginatedNoticesSelector = createSelector(
  dateSortedNoticesSelector,
  nameSortedNoticesSelector,
  noticesOrderingSelector,
  paginationSelector,
  (dateSorted, nameSorted, orderBy, page) => {
    const notices = orderBy === 'title' ? nameSorted : dateSorted
    return chunk(notices, paginationChunkSize)[page - 1]
  }
)

export const noticesNumPagesSelector = createSelector(dateSortedNoticesSelector, (dateSorted) =>
  Math.ceil(dateSorted.length / paginationChunkSize)
)

export const mapOptionsSelector = (state: State): MapOptions => state.mapOptions
export const centerSelector = (state: State): [number, number] => state.mapOptions.center
export const zoomSelector = (state: State): number => state.mapOptions.zoom
export const mapReferenceSelector = (state: State): MapReference => state.mapReference
export const entitiesSelector = (state: State): Array<Entity> => state.entities
