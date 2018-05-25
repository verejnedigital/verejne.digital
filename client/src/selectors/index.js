// @flow
import {createSelector} from 'reselect'
import {sortBy, chunk} from 'lodash'
import qs from 'qs'
import {paginationChunkSize} from '../constants'
import {values} from '../utils'

import type {Location} from 'react-router-dom'
import type {NoticesOrdering} from '../components/Notices/NoticeList'
import type {NoticeDetailProps} from '../components/Notices/NoticeDetail'
import type {State, MapOptions, MapReference, Entity} from '../state'

export const noticeDetailSelector = (state: State, props: NoticeDetailProps) =>
  props.match.params.id && state.notices.details[props.match.params.id]

export const dateSortedNoticesSelector = createSelector(
  (state: State) => state.notices.list,
  (data) => sortBy(values(data), ['bulletin_year', 'bulletin_month', 'bulletin_day'])
)

export const nameSortedNoticesSelector = createSelector(
  (state: State) => state.notices.list,
  (data) => sortBy(values(data), ['title'])
)

export const locationSearchSelector = (_: State, props: {location: Location}) =>
  qs.parse(props.location.search.slice(1))

export const paginationSelector = createSelector(
  locationSearchSelector,
  (query) => Number.parseInt(query.page, 10) || 1
)

export const noticesOrderingSelector = createSelector(
  locationSearchSelector,
  (query): NoticesOrdering => query.ordering || 'date'
)

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

// will make more sense once we allow searching on notices
// (filtered notices will then be the input selector)
export const noticesLengthSelector = createSelector(
  dateSortedNoticesSelector,
  nameSortedNoticesSelector,
  noticesOrderingSelector,
  (dateSorted, nameSorted, orderBy, page) => {
    const notices = orderBy === 'title' ? nameSorted : dateSorted
    return notices.length
  }
)

export const mapOptionsSelector = (state: State): MapOptions => state.mapOptions
export const centerSelector = (state: State): [number, number] => state.mapOptions.center
export const zoomSelector = (state: State): number => state.mapOptions.zoom
export const mapReferenceSelector = (state: State): MapReference => state.mapReference
export const entitiesSelector = (state: State): Array<Entity> => state.entities
