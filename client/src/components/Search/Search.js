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
import CircleIcon from '../shared/CircleIcon'
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

class ScrollIntoView extends React.Component {
  constructor(props) {
    super(props)
    this.scrollInto = React.createRef()
  }

  componentDidUpdate(prevProps) {
    if (this.props.scrollTo) {
      this.scrollInto.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'center',
      })
    }
  }
  render() {
    return <div ref={this.scrollInto}>{this.props.children}</div>
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
  activeEid,
  handleActiveEid,
}: Props) => (
  <Container className="" style={{maxWidth: '1200px'}}>
    <SearchAutocomplete />
    {query && (
      <>
        {suggestionEids.map((eid, index) => {
          const entity = entities[eid]
          return (
            <div
              key={eid}
              onClick={() => {
                handleActiveEid(eid)
              }}
              className="search-box"
              title={`${entity.name}, ${entity.address}`}
            >
              <span className="search-box-index">{index + 1}</span>
              <strong className="search-box-name">
                <CircleIcon data={entity} /> {entity.name}
              </strong>
              <span className="search-box-address">
                {/* NOTE: We want to show short format of the address.
                At the moment we get whole address as one string.
                This is hotfix that can be removed when the backend
                will send object for address. */}
                {entity.address.replace(/ \d\d\d \d\d/, '').replace(/, Slovakia/, '')}
              </span>
            </div>
          )
        })}
        <Row id="map">
          <Col>
            {/* TODO fix flow */}
            <MapContainer
              assets={suggestionEids.map((eid) => entities[eid])}
              markerAction={handleActiveEid}
              {...mapProps}
            />
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
              <ScrollIntoView scrollTo={activeEid === eid}>
                <Info
                  key={`${eid}`}
                  data={entities[eid]}
                  index={index + 1}
                  active={activeEid === eid}
                />
              </ScrollIntoView>
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
  withState('searchEids', 'setSearchEids', []),
  withState('activeEid', 'setActiveEid', ''),
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
    handleActiveEid: (props: Props) => (value) => {
      props.setActiveEid(value)
    },
    handleSelect: (props: Props) => (value) => {
      props.setInputValue(value)
      _SearchInfo(value, props.history)
    },
    onChange: ({inputValue, setInputValue}) => (e) => setInputValue(e.target.value),
  })
)

export default enhance(Search)
