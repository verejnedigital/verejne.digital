// @flow
import {createSelector} from 'reselect'
import {sortBy} from 'lodash'
import type {State} from './state'

export const dateSortedObstaravania = () =>
  createSelector(
    (state: State) => state.obstaravania.data,
    (data) => sortBy(data, ['bulletin_year', 'bulletin_month', 'bulletin_day'])
  )

export const nameSortedObstaravania = () =>
  createSelector((state: State) => state.obstaravania.data, (data) => sortBy(data, ['title']))
