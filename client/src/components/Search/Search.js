// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import type {RouterHistory} from 'react-router'
import {withHandlers, withState} from 'recompose'
import {withDataProviders} from 'data-provider'
import {chunk} from 'lodash'
import {Row, Col, Container} from 'reactstrap'
import {
  autocompleteSuggestionEidsSelector,
  autocompleteSuggestionsSelector,
  locationSearchSelector,
  entityDetailsSelector,
} from '../../selectors/'
import {updateValue} from '../../actions/sharedActions'
import {entitySearchProvider, entityDetailProvider} from '../../dataProviders/sharedDataProviders'
import Info from '../shared/Info/Info'
import Subgraph from '../Connections/components/Subgraph'
import MapContainer from '../Profile/components/MapContainer'
import {
  FACEBOOK_LIKE_SRC,
  DEFAULT_MAP_CENTER,
  COUNTRY_ZOOM,
  MAX_ENTITY_REQUEST_COUNT,
} from '../../constants'
import SearchAutocomplete from './SearchAutocomplete'

import type {State, GeolocationPoint, CompanyEntity} from '../../state'
import type {ContextRouter} from 'react-router-dom'
import type {HOC} from 'recompose'

import './Search.css'

export type Props = {
  history: RouterHistory,
  searchOnEnter: (e: Event) => void,
  mapProps: {center: GeolocationPoint, zoom: number},
  handleSelect: (value: string) => void,
  inputValue: string,
  onChange: () => void,
  query: string,
  suggestionEids: Array<number>,
  setInputValue: Function,
  entities: Array<CompanyEntity>,
} & ContextRouter

const _SearchInfo = (inputValue, history) => {
  if (inputValue.trim() !== '') {
    history.push(`/vyhladavanie?meno=${inputValue.trim()}`)
  }
}

const Search = ({
  history,
  searchOnEnter,
  mapProps,
  handleSelect,
  inputValue,
  onChange,
  query,
  suggestionEids,
  entities,
}: Props) => (
  <Container className="" style={{maxWidth: '1200px'}}>
    <SearchAutocomplete />
    {query && (
      <>
        {suggestionEids.map((eid, index) => {
          const entity = entities[eid]
          return (
            <a
              href={`#js-${eid}`}
              key={eid}
              className="search-box"
              title={`${entity.name}, ${entity.address}`}
            >
              <span className="search-box-index">{index + 1}</span>
              <strong className="search-box-name">{entity.name}</strong>
              <span className="search-box-address">{entity.address}</span>
            </a>
          )
        })}
        <Row id="map">
          <Col>
            {/* TODO fix flow */}
            <MapContainer assets={suggestionEids.map((eid) => entities[eid])} {...mapProps} />
          </Col>
        </Row>
        <Row key="fb" className="profile-fbframe mt-2">
          <Col>
            <iframe
              title="fb_like"
              src={FACEBOOK_LIKE_SRC}
              width="201"
              height="23"
              className="fbIframe"
              scrolling="no"
              frameBorder="0"
            />
          </Col>
        </Row>
        <Row>
          {suggestionEids.map((eid, index) => (
            <Col md={6} lg={4} style={{marginBottom: '24px'}} key={index}>
              <Info key={`${eid}`} data={entities[eid]} index={index + 1} />
            </Col>
          ))}
        </Row>
        <Subgraph notable eids1={suggestionEids} preloadNodes />
      </>
    )}
  </Container>
)

const enhance: HOC<*, Props> = compose(
  withRouter,
  withState('inputValue', 'setInputValue', ''),
  withState('searchEids', 'setSearchEids', []),
  connect(
    (state: State, props: Props) => ({
      query: locationSearchSelector(state, props).meno || '',
    }),
    {updateValue}
  ),
  connect(
    (state: State, props: Props) => ({
      suggestionEids: autocompleteSuggestionEidsSelector(state, props.query),
      suggestions: autocompleteSuggestionsSelector(state, props.query),
    }),
    {}
  ),
  withDataProviders(({query, suggestionEids}) => [
    ...(query.trim() !== '' ? [entitySearchProvider(query, false, false)] : []),
    ...(suggestionEids.length > 0
      ? [...chunk(suggestionEids, MAX_ENTITY_REQUEST_COUNT).map((ids) => entityDetailProvider(ids))]
      : []),
  ]),
  connect((state, {suggestionEids}) => ({
    entities: entityDetailsSelector(state, suggestionEids),
  })),
  withState('mapProps', 'setMapProps', {
    center: DEFAULT_MAP_CENTER,
    zoom: COUNTRY_ZOOM,
  }),
  withHandlers({
    searchOnEnter: (props: Props) => (e) => {
      if (e.key === 'Enter') {
        _SearchInfo(props.inputValue, props.history)
      }
    },
    handleSelect: (props: Props) => (value) => {
      props.setInputValue(value)
      _SearchInfo(value, props.history)
    },
    onChange: ({inputValue, setInputValue}) => (e) => setInputValue(e.target.value),
  })
)

export default enhance(Search)
