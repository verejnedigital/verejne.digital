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
      onChange={(page) => history.push({search: modifyQuery(query, {page})})}
    />
  )
  return (
    <Container fluid className="notice-list">
      <Row>
        <Col xl="3" tag="aside" className="notice-list-sidebar">
          <Row>
            <Col sm={{size: 10, offset: 2}}>
              <h2 className="notice-list-title">Aktuálne obstarávania</h2>
              <p>
                Našim cieľom je identifikovať a osloviť najvhodnejších uchádzačov, ktorí by sa mali
                zapojiť do verejných obstarávaní. <a href=".">Viac info</a>
              </p>
            </Col>
          </Row>
          <hr />
          <Legend />
          <hr />
          <Row>
            <Col sm={{size: 10, offset: 2}}>
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
          </Row>
        </Col>
        <Col xl={{size: 9, offset: 3}}>
          {map(items, (bulletin, index) => (
            <Bulletin
              key={index}
              items={bulletin}
              number={bulletin[0].bulletin_number}
              year={bulletin[0].bulletin_year}
              date={bulletin[0].bulletin_date}
            />
          ))}
          <div className="notice-list-pagination">{pagination}</div>
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
