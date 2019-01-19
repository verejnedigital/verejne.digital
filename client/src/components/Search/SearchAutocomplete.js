// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import type {RouterHistory} from 'react-router'
import {withHandlers, withState} from 'recompose'
import SearchIcon from 'react-icons/lib/fa/search'
import {Button, InputGroup, InputGroupAddon} from 'reactstrap'
import {updateValue} from '../../actions/sharedActions'
import {entityDetailsSelector, locationSearchSelector} from '../../selectors/'
import AutoComplete from '../shared/AutoComplete/AutoComplete'

import type {State, CompanyEntity} from '../../state'
import type {ContextRouter} from 'react-router-dom'
import type {HOC} from 'recompose'

import './Search.css'

export type Props = {
  history: RouterHistory,
  searchOnEnter: (e: Event) => void,
  handleSelect: (value: string) => void,
  inputValue: string,
  onChange: () => void,
  suggestionEids: Array<number>,
  setInputValue: Function,
  entities: Array<CompanyEntity>,
} & ContextRouter

const _SearchInfo = (inputValue, history) => {
  if (inputValue.trim() !== '') {
    history.push(`/vyhladavanie?meno=${inputValue.trim()}`)
  }
}

const SearchAutocomplete = ({
  history,
  searchOnEnter,
  handleSelect,
  inputValue,
  onChange,
  suggestionEids,
  entities,
}) => (
  <InputGroup className="search-autocomplete">
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
)

const enhance: HOC<*, Props> = compose(
  withRouter,
  withState(
    'inputValue',
    'setInputValue',
    (props) => locationSearchSelector(undefined, props).meno || ''
  ),
  withState('searchEids', 'setSearchEids', []),
  connect((state, {suggestionEids}) => ({
    entities: entityDetailsSelector(state, suggestionEids),
  })),
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

export default enhance(SearchAutocomplete)
