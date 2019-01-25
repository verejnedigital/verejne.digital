// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import type {RouterHistory} from 'react-router'
import {withHandlers, withState} from 'recompose'
import {FaSearch} from 'react-icons/fa'
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
  searchInfo: (value: string) => void,
  inputValue: string,
  onChange: () => void,
  suggestionEids: Array<number>,
  setInputValue: Function,
  entities: Array<CompanyEntity>,
  query: string,
} & ContextRouter

const SearchAutocomplete = ({
  history,
  searchOnEnter,
  searchInfo,
  handleSelect,
  inputValue,
  onChange,
  query,
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
      <Button onClick={() => searchInfo(inputValue)} color="primary" className="search-page-btn">
        <FaSearch />
      </Button>
    </InputGroupAddon>
  </InputGroup>
)

const enhance: HOC<*, Props> = compose(
  withRouter,
  withState('searchEids', 'setSearchEids', []),
  connect(
    (state: State, props: Props) => ({
      query: locationSearchSelector(state, props).meno || '',
    }),
    {updateValue}
  ),
  withState('inputValue', 'setInputValue', (props: Props) => props.query),
  connect((state, {suggestionEids}) => ({
    entities: entityDetailsSelector(state, suggestionEids),
  })),
  withHandlers({
    searchInfo: ({history}: Props) => (inputValue) => {
      if (inputValue.trim() !== '') {
        history.push(`/vyhladavanie?meno=${inputValue.trim()}`)
      }
    },
  }),
  withHandlers({
    searchOnEnter: (props: Props) => (e) => {
      if (e.key === 'Enter') {
        props.searchInfo(props.inputValue)
      }
    },
    handleSelect: (props: Props) => (value) => {
      props.setInputValue(value)
      props.searchInfo(value)
    },
    onChange: ({inputValue, setInputValue}) => (e) => setInputValue(e.target.value),
  })
)

export default enhance(SearchAutocomplete)
