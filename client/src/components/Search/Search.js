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
import SearchResults from './SearchResults'

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

const Search = () => (
  <Container className="" style={{maxWidth: '1200px'}}>
    <SearchAutocomplete />
    <SearchResults />
  </Container>
)

const enhance: HOC<*, Props> = compose(
  withRouter,
  withHandlers({
    searchOnEnter: (props: Props) => (e) => {
      if (e.key === 'Enter') {
        _SearchInfo(props.inputValue, props.history)
      }
    },
    onChange: ({inputValue, setInputValue}) => (e) => setInputValue(e.target.value),
  })
)

export default enhance(Search)
