// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'
import {withDataProviders} from 'data-provider'
import {noticesProvider} from '../dataProviders/noticesDataProviders'
import {newestBulletinDateSelector, paginatedNoticesSelector} from '../selectors'

import type {Dispatch} from '../types/reduxTypes'
import type {Notice, State} from '../state'

type NoticeListProps = {
  dispatch: Dispatch,
  newestBulletinDate: string,
  paginatedNotices: Array<Notice>,
}

const NoticeList = ({dispatch, newestBulletinDate, paginatedNotices}: NoticeListProps) => {
  return (
    <div>
      <div>{newestBulletinDate}</div>
      {paginatedNotices.map((n) => (
        <div key={n.id}>
          <Link to={`/obstaravania/${n.id}`}>{n.title}</Link>
        </div>
      ))}
    </div>
  )
}

export default compose(
  withDataProviders(() => [noticesProvider()]),
  connect((state: State, props: NoticeListProps) => ({
    paginatedNotices: paginatedNoticesSelector(state, props),
    newestBulletinDate: newestBulletinDateSelector(state),
  }))
)(NoticeList)
