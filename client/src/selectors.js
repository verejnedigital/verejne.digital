// @flow
import {createSelector} from 'reselect'
import {sortBy} from 'lodash'
import type {State} from './state'

export const dateSortedNotices = () =>
  createSelector(
    (state: State) => state.notices.data,
    (data) => sortBy(data, ['bulletin_year', 'bulletin_month', 'bulletin_day'])
  )

export const nameSortedNotices = () =>
  createSelector((state: State) => state.notices.data, (data) => sortBy(data, ['title']))
