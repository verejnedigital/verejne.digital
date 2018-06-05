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
import {paginationChunkSize, noticesPaginationSize} from '../../constants'
import {modifyQuery} from '../../utils'

import type {Location, Match, RouterHistory} from 'react-router-dom'
import type {Dispatch} from '../../types/reduxTypes'
import type {Notice, State} from '../../state'

import Legend from './Legend'
import BulletinTitle from './BulletinTitle'
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
  let items = null
  let bulletinTitle = null
  if (paginatedNotices.length > 0) {
    items = paginatedNotices.map((item) => <NoticeItem key={item.id} item={item} />)
    bulletinTitle = BulletinTitle(paginatedNotices[0], newestBulletinDate)
  }

  const pagination = (
    <div className="paginationWrapper">
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
  return (
    <Container className="container-fluid notices">
      <Row className="">
        <Col tag="aside" className="sidebar col-xl-3 col-lg-12">
          <Legend />
          <div className="fbfooter">
            <Row>
              <Col className="col-sm-offset-2 col-sm-10 col-xs-offset-2 col-xs-10">
                <iframe
                  src="https://www.facebook.com/plugins/like.php?href=https%3A%2F%2Fwww.facebook.com%2Fverejne.digital&width=111&layout=button_count&action=like&size=small&show_faces=true&share=true&height=46&appId="
                  width="151"
                  height="23"
                  className="fbIframe"
                  title="facebook"
                  scrolling="no"
                  frameBorder="0"
                />
              </Col>
            </Row>
          </div>
        </Col>
        <Col tag="article" className="main col-xl-8 offset-xl-1 col-lg-12">
          <Row tag="header">
            <Col className="noticeInfo text-center">{bulletinTitle}</Col>
          </Row>
          <Row>
            <Col>
              {pagination}
              <table className="table table-striped table-responsive">
                <thead>
                  <tr>
                    <td />
                    <td>Názov obstarávania</td>
                    <td>Objednávateľ</td>
                    <td>Kto by sa mal prihlásiť</td>
                    <td>Pod.</td>
                  </tr>
                </thead>
                <tbody>{items}</tbody>
              </table>
              {pagination}
            </Col>
          </Row>
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
