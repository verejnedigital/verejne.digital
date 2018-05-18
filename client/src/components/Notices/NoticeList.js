// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'
import {withDataProviders} from 'data-provider'
import {noticesProvider} from '../../dataProviders/noticesDataProviders'
import {
  newestBulletinDateSelector,
  paginatedNoticesSelector,
  paginationSelector,
  noticesNumPagesSelector,
} from '../../selectors'
import Pagination from '../shared/Pagination'

import type {Location, Match} from 'react-router-dom'
import type {Dispatch} from '../../types/reduxTypes'
import type {Notice, State} from '../../state'

export type NoticesOrdering = 'title' | 'date'

export type NoticeListProps = {
  dispatch: Dispatch,
  newestBulletinDate: string,
  paginatedNotices: Array<Notice>,
  currentPage: number,
  numPages: number,
  location: Location,
  match: Match,
}

const NoticeList = ({
  dispatch,
  newestBulletinDate,
  paginatedNotices,
  currentPage,
  numPages,
  location,
}: NoticeListProps) => {
  return (
    <div style={{textAlign: 'center'}}>
      <div>{newestBulletinDate}</div>
      {paginatedNotices.map((n) => (
        <div key={n.id}>
          <Link to={`/obstaravania/${n.id}`}>{n.title}</Link>
        </div>
      ))}
      <Pagination maxPage={numPages} currentPage={currentPage} currentQuery={location.search} />
    </div>
  )
}

export default compose(
  withDataProviders(() => [noticesProvider()]),
  connect((state: State, props: NoticeListProps) => ({
    paginatedNotices: paginatedNoticesSelector(state, props),
    currentPage: paginationSelector(state, props),
    numPages: noticesNumPagesSelector(state, props),
    newestBulletinDate: newestBulletinDateSelector(state),
  }))
)(NoticeList)
