// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
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
import {PAGINATION_CHUNK_SIZE, NOTICES_PAGINATION_SIZE} from '../../constants'
import {modifyQuery} from '../../utils'
import {groupBy, map} from 'lodash'

import type {ContextRouter} from 'react-router-dom'
import type {Dispatch} from '../../types/reduxTypes'
import type {Notice, State} from '../../state'

import Legend from './Legend'
import Bulletin from './Bulletin'
import NoticeItem from './NoticeItem'
import {Row, Col, Container} from 'reactstrap'
import './NoticeList.css'

export type NoticesOrdering = 'title' | 'date'

export type NoticeListProps = {
  dispatch: Dispatch,
  newestBulletinDate: string,
  paginatedNotices: Array<Notice>,
  currentPage: number,
  noticesLength: number,
  query: Object,
} & ContextRouter

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
  let items = []
  if (paginatedNotices.length > 0) {
    items = groupBy(paginatedNotices, (item) => `${item.bulletin_number}/${item.bulletin_year}`)
  }

  const pagination = (
    <Pagination
      itemClass="page-item"
      linkClass="page-link"
      className="paginationWrapper"
      hideNavigation
      pageRangeDisplayed={NOTICES_PAGINATION_SIZE}
      activePage={currentPage}
      itemsCountPerPage={PAGINATION_CHUNK_SIZE}
      totalItemsCount={noticesLength}
      onChange={(page) => history.replace({search: modifyQuery(query, {page})})}
    />
  )
  return (
    <Container className="container-fluid notices">
      <Row className="">
        <Col tag="aside" className="sidebar col-lg-3 col-xs-12">
          <Legend />
          <div className="fbfooter">
            <iframe
              src="https://www.facebook.com/plugins/like.php?href=https%3A%2F%2Fwww.facebook.com%2Fverejne.digital&width=111&layout=button_count&action=like&size=small&show_faces=true&share=true&height=46&appId="
              className="fbIframe"
              title="facebook"
              scrolling="no"
              frameBorder="0"
            />
          </div>
        </Col>
        <Col className="col-lg-8 offset-lg-1 col-xs-12">
          <div tag="article" className="main">
            {map(items, (bulletin, key) => (
              <Bulletin
                key={key}
                items={bulletin.map((item) => <NoticeItem key={item.id} item={item} />)}
                number={bulletin[0].bulletin_number}
                year={bulletin[0].bulletin_year}
                date={bulletin[0].bulletin_date}
              />
            ))}
          </div>
          {pagination}
        </Col>
      </Row>
    </Container>
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
