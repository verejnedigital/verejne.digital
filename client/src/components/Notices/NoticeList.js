// @flow
import React from 'react'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
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
  noticesSearchQuerySelector,
} from '../../selectors'
import {PAGINATION_CHUNK_SIZE, NOTICES_PAGINATION_SIZE} from '../../constants'
import {modifyQuery} from '../../utils'
import {groupBy, map} from 'lodash'

import {updateValue} from '../../actions/sharedActions'

import type {ContextRouter} from 'react-router-dom'
import type {Dispatch} from '../../types/reduxTypes'
import type {Notice, State} from '../../state'

import NoticeSidebar from './NoticeSidebar'
import Bulletin from './Bulletin'
import {Input, FormText, Row, Col, Container} from 'reactstrap'
import './NoticeList.css'

export type NoticesOrdering = 'title' | 'date'

export type NoticeListProps = {
  dispatch: Dispatch,
  newestBulletinDate: string,
  paginatedNotices: Array<Notice>,
  currentPage: number,
  noticesLength: number,
  query: Object,
  searchValue: string,
  updateSearchValue: () => void,
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
  searchValue,
  updateSearchValue,
}: NoticeListProps) => {
  let items = []
  if (paginatedNotices.length > 0) {
    items = groupBy(paginatedNotices, (item) => `${item.bulletin_number}/${item.bulletin_year}`)
  }

  const plurality = (count) => {
    if (count === 1) {
      return `Nájdený ${count} výsledok`
    } else if (count > 1 && count < 5) {
      return `Nájdené ${count} výsledky`
    }
    return `Nájdených ${count} výsledkov`
  }

  const pagination = (
    <Pagination
      itemClass="page-item"
      linkClass="page-link"
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
        <NoticeSidebar />
        <Col xl={{size: 9, offset: 3}}>
          <Input
            type="text"
            className="form-control mt-2"
            placeholder="Vyhľadávanie"
            value={searchValue}
            onChange={updateSearchValue}
          />
          <FormText>{searchValue && `${plurality(noticesLength)} pre "${searchValue}".`}</FormText>
          {noticesLength >= 1 &&
            map(items, (bulletin, index) => (
              <Bulletin
                key={index}
                items={bulletin}
                number={bulletin[0].bulletin_number}
                year={bulletin[0].bulletin_year}
                date={bulletin[0].bulletin_date}
              />
            ))}
          {noticesLength > 10 && (
            <div className="pagination-wrapper">
              <div className="scroll-container">{pagination}</div>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  )
}

export default compose(
  withDataProviders(() => [noticesProvider()]),
  connect(
    (state: State, props: NoticeListProps) => ({
      paginatedNotices: paginatedNoticesSelector(state, props),
      currentPage: paginationSelector(state, props),
      noticesLength: noticesLengthSelector(state, props),
      newestBulletinDate: newestBulletinDateSelector(state, props),
      query: locationSearchSelector(state, props),
      searchValue: noticesSearchQuerySelector(state),
    }),
    {updateValue}
  ),
  withHandlers({
    updateSearchValue: (props) => (e) => {
      props.updateValue(['notices', 'searchQuery'], e.target.value)
      if (props.history.location.search !== '') props.history.push({})
    },
  }),
  withRouter
)(NoticeList)
