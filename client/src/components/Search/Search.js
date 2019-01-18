// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import type {RouterHistory} from 'react-router'
import {withHandlers, withState} from 'recompose'
import {withDataProviders} from 'data-provider'
import {chunk} from 'lodash'
import SearchIcon from 'react-icons/lib/fa/search'
import {Row, Col, Container, Button, InputGroup, InputGroupAddon} from 'reactstrap'
import {
  autocompleteSuggestionEidsSelector,
  autocompleteSuggestionsSelector,
  locationSearchSelector,
  entityDetailsSelector,
} from '../../selectors/'
import {updateValue} from '../../actions/sharedActions'
import {entitySearchProvider, entityDetailProvider} from '../../dataProviders/sharedDataProviders'
import AutoComplete from '../shared/AutoComplete/AutoComplete'
import Info from '../shared/Info/Info'
import Subgraph from '../Connections/components/Subgraph'
import MapContainer from '../Profile/components/MapContainer'
import {
  FACEBOOK_LIKE_SRC,
  DEFAULT_MAP_CENTER,
  COUNTRY_ZOOM,
  MAX_ENTITY_REQUEST_COUNT,
} from '../../constants'

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
  <Container className="">
    <Col>
      <h1 className="notice-list-title">Vyhľadávanie</h1>
    </Col>
    <Row key="search" className="profile-search">
      <Col className="search-form">
        <InputGroup>
          <AutoComplete
            value={inputValue}
            onChangeHandler={onChange}
            onSelectHandler={handleSelect}
            inputProps={{
              onKeyPress: searchOnEnter,
            }}
            wrapperProps={{
              className: 'search-autocomplete-wrapper',
            }}
          />
          <InputGroupAddon addonType="append">
            <Button color="primary" className="search-page-btn">
              <SearchIcon />
            </Button>
          </InputGroupAddon>
        </InputGroup>
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
    {query && (
      <>
        <Row id="map">
          <Col>
            {/* TODO fix flow */}
            <MapContainer assets={suggestionEids.map((eid) => entities[eid])} {...mapProps} />
          </Col>
        </Row>
        <Row>
          <Col>
            <Subgraph notable eids1={suggestionEids} preloadNodes />
          </Col>
        </Row>
        <Row className="mb-4">
          <Col>
            {suggestionEids.map((eid, index) => (
              <>
                {index} - TODO styling
                <Info key={`${eid}`} data={entities[eid]} />
              </>
            ))}
          </Col>
        </Row>
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
