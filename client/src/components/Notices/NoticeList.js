// @flow
import React from 'react'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import {withDataProviders} from 'data-provider'
import {noticesProvider} from '../../dataProviders/noticesDataProviders'
import {
  activeNoticesSelector,
  noticesLengthSelector,
  locationSearchSelector,
  noticesSearchQuerySelector,
} from '../../selectors'
import {groupBy, map} from 'lodash'

import {updateValue} from '../../actions/sharedActions'
import {resultPlurality} from '../../services/utilities'
import type {ContextRouter} from 'react-router-dom'
import type {Dispatch} from '../../types/reduxTypes'
import type {Notice, State} from '../../state'

import NoticeSidebar from './NoticeSidebar'
import Bulletin from './Bulletin'
import {Input, FormText, Row, Col, Container} from 'reactstrap'
import Legend from './Legend'
import './NoticeList.css'

export type NoticesOrdering = 'title' | 'date'

export type NoticeListProps = {
  dispatch: Dispatch,
  notices: Array<Notice>,
  noticesLength: number,
  query: Object,
  searchValue: string,
  updateSearchValue: (e: Event) => void,
  updateValue: (Array<string>, string) => void,
} & ContextRouter

const NoticeList = ({
  dispatch,
  notices,
  noticesLength,
  location,
  history,
  query,
  searchValue,
  updateSearchValue,
  updateValue,
}: NoticeListProps) => {
  const items = groupBy(notices, (item) => `${item.bulletin_number}/${item.bulletin_year}`)

  return (
    <Container fluid className="notice-list">
      <NoticeSidebar />
      <Row>
        <Col>
          <Input
            type="text"
            className="notice-input mt-2"
            placeholder="Vyhľadávanie"
            value={searchValue}
            onChange={updateSearchValue}
          />
          <FormText className="notice-search-result-text">
            {searchValue && `${resultPlurality(noticesLength)} pre "${searchValue}".`}
          </FormText>
          <hr />
          <Legend />
          <hr />
          <div className="notice-list-table">
            {noticesLength >= 1 &&
              map(items, (bulletin, index) => (
                <Bulletin
                  key={index}
                  items={bulletin}
                  number={bulletin[0].bulletin_number}
                  year={bulletin[0].bulletin_year}
                  date={bulletin[0].bulletin_published_on}
                />
              ))}
          </div>
        </Col>
      </Row>
      <Row>
        <Col className="fbfooter">
          <iframe
            src="https://www.facebook.com/plugins/like.php?href=https%3A%2F%2Fwww.facebook.com%2Fverejne.digital&width=111&layout=button_count&action=like&size=small&show_faces=true&share=true&height=46&appId="
            className="fbIframe"
            title="facebook"
            scrolling="no"
            frameBorder="0"
          />
        </Col>
      </Row>
    </Container>
  )
}

export default compose(
  withDataProviders(() => [noticesProvider()]),
  connect(
    (state: State, props: NoticeListProps) => ({
      notices: activeNoticesSelector(state, props),
      noticesLength: noticesLengthSelector(state, props),
      query: locationSearchSelector(state, props),
      searchValue: noticesSearchQuerySelector(state),
    }),
    {updateValue}
  ),
  withHandlers({
    updateSearchValue: (props: NoticeListProps) => (e: Event) => {
      const {target} = e
      if (target instanceof HTMLInputElement) {
        props.updateValue(['notices', 'searchQuery'], target.value)
      }
      if (props.history.location.search !== '') props.history.push({})
    },
  }),
  withRouter
)(NoticeList)
