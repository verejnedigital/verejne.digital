// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {Link, withRouter} from 'react-router-dom'
import {withDataProviders} from 'data-provider'
import Pagination from 'react-js-pagination'
import {noticesProvider} from '../../dataProviders/noticesDataProviders'
import {
  newestBulletinDateSelector,
  paginatedNoticesSelector,
  paginationSelector,
  noticesLengthSelector,
  locationSearchSelector,
} from '../../selectors'
import {paginationChunkSize, noticesPaginationSize} from '../../constants'
import {modifyQuery} from '../../utils'

import type {Location, Match, RouterHistory} from 'react-router-dom'
import type {Dispatch} from '../../types/reduxTypes'
import type {Notice, State} from '../../state'

export type NoticesOrdering = 'title' | 'date'

export type NoticeListProps = {
  dispatch: Dispatch,
  newestBulletinDate: string,
  paginatedNotices: Array<Notice>,
  currentPage: number,
  noticesLength: number,
  location: Location,
  match: Match,
  history: RouterHistory,
  query: Object,
}

const NoticeList = ({
  dispatch,
  newestBulletinDate,
  paginatedNotices,
  currentPage,
  noticesLength,
  location,
  history,
  query,
}: NoticeListProps) => {
  return (
    <div style={{textAlign: 'center'}}>
      <div>{newestBulletinDate}</div>
      {paginatedNotices.map((n) => (
        <div key={n.id}>
          <Link to={`/obstaravania/${n.id}`}>{n.title}</Link>
        </div>
      ))}
      <Pagination
        itemClass="page-item"
        linkClass="page-link"
        hideNavigation
        pageRangeDisplayed={noticesPaginationSize}
        activePage={currentPage}
        itemsCountPerPage={paginationChunkSize}
        totalItemsCount={noticesLength}
        onChange={(page) => history.push({search: modifyQuery(query, {page})})}
      />
    </div>
  )
}

export default compose(
  withDataProviders(() => [noticesProvider()]),
  connect((state: State, props: NoticeListProps) => ({
    paginatedNotices: paginatedNoticesSelector(state, props),
    currentPage: paginationSelector(state, props),
    noticesLength: noticesLengthSelector(state, props),
    newestBulletinDate: newestBulletinDateSelector(state, props),
    query: locationSearchSelector(state, props),
  })),
  withRouter
)(NoticeList)
