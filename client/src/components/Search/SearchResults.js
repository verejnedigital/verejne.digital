// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import type {RouterHistory} from 'react-router'
import {withHandlers, withState, withProps, branch, renderNothing} from 'recompose'
import {withDataProviders} from 'data-provider'
import {get} from 'lodash'
import {Row, Col} from 'reactstrap'
import {
  autocompleteSuggestionEidsSelector,
  locationSearchSelector,
  entityDetailsSelector,
} from '../../selectors/'
import {entitySearchProvider, entityDetailProvider} from '../../dataProviders/sharedDataProviders'
import Info from '../shared/Info/Info'
import CircleIcon from '../shared/CircleIcon'
import Subgraph from '../Connections/components/Subgraph'
import MapContainer from '../Profile/components/MapContainer'
import {FACEBOOK_LIKE_SRC, DEFAULT_MAP_CENTER, COUNTRY_ZOOM} from '../../constants'

import type {State, GeolocationPoint, CompanyEntity} from '../../state'
import type {ContextRouter} from 'react-router-dom'
import type {HOC} from 'recompose'

import './Search.css'

// TODO separate css, fix eslint and flow errors

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

class ScrollIntoView extends React.Component {
  constructor(props) {
    super(props)
    this.scrollInto = React.createRef()
  }

  componentDidUpdate(prevProps) {
    if (this.props.scrollTo !== prevProps.scrollTo) {
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

const SearchResults = ({
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
)

const enhance: HOC<*, Props> = compose(
  withRouter,
  withState('searchEids', 'setSearchEids', []),
  withState('activeEid', 'setActiveEid', ''),
  // query from url used only if it has length > 0, otherwise render nothing
  withProps((props) => {
    const query = get(locationSearchSelector(undefined, props), 'meno', '').trim()
    return {
      query: query.length ? query : null,
    }
  }),
  branch(({query}) => !query, renderNothing),
  withDataProviders(({query}) => {
    return [entitySearchProvider(query)]
  }),
  connect((state: State, {query}: Props) => ({
    suggestionEids: autocompleteSuggestionEidsSelector(state, query),
  })),
  branch(({suggestionEids}) => !suggestionEids.length, renderNothing),
  withDataProviders(({suggestionEids}) => [entityDetailProvider(suggestionEids)]),
  connect((state, {suggestionEids}) => ({
    entities: entityDetailsSelector(state, suggestionEids),
  })),
  withState('mapProps', 'setMapProps', {
    center: DEFAULT_MAP_CENTER,
    zoom: COUNTRY_ZOOM,
  }),
  withHandlers({
    handleActiveEid: (props: Props) => (value) => {
      props.setActiveEid(value)
    },
  })
)

export default enhance(SearchResults)
