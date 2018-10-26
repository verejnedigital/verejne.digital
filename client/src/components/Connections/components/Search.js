// @flow
import React from 'react'
import {withRouter} from 'react-router-dom'
import {withHandlers, withState} from 'recompose'
import {compose} from 'redux'
import {Form, FormGroup, Label, Button} from 'reactstrap'
import type {ContextRouter} from 'react-router'
import EntitySearchWrapper, {type EntitySearchProps} from '../dataWrappers/EntitySearchWrapper'
import AutoComplete from '../../shared/AutoComplete/AutoComplete'
import './Search.css'

type EmptyHandler = () => void
type EventHandler = (e: Event) => void
type selectHandler = (value: string) => void

type Props = {
  searchValue1: string,
  searchValue2: string,
  setSearchValue1: EventHandler,
  setSearchValue2: EventHandler,
  handleSelect1: selectHandler,
  handleSelect2: selectHandler,
  searchOnEnter: EventHandler,
  searchConnection: EmptyHandler,
} & EntitySearchProps &
  ContextRouter

const _searchConnection = (props: Props) => {
  if (props.searchValue1.trim() !== '') {
    if (props.searchValue2.trim() !== '') {
      props.history.push(
        `/prepojenia?eid1=${props.searchValue1.trim()}&eid2=${props.searchValue2.trim()}`
      )
    } else {
      props.history.push(`/prepojenia?eid1=${props.searchValue1.trim()}`)
    }
  }
}

const Search = ({
  searchValue1,
  searchValue2,
  setSearchValue1,
  setSearchValue2,
  handleSelect1,
  handleSelect2,
  searchOnEnter,
  searchConnection,
}: Props) => (
  <div className="connections-search-wrapper">
    <h2>Vyhľadaj</h2>
    <p>Zaujímavé spojenia jednotlivca alebo najkratšie spojenie medzi dvojicou:</p>
    <Form>
      <FormGroup>
        <Label for="searchValue1">Prvá firma/osoba*</Label>
        <AutoComplete
          value={searchValue1}
          onChangeHandler={setSearchValue1}
          onSelectHandler={handleSelect1}
          menuClassName="connections-autocomplete-suggestions"
          inputProps={{
            className: 'form-control connections-autocomplete-input',
            onKeyPress: searchOnEnter,
            placeholder: 'Zadaj prvú firmu / človeka',
          }}
          wrapperProps={{
            className: 'connections-autocomplete-wrapper',
          }}
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="searchValue2">Druhá firma/osoba</Label>
        <AutoComplete
          value={searchValue2}
          onChangeHandler={setSearchValue2}
          onSelectHandler={handleSelect2}
          menuClassName="connections-autocomplete-suggestions"
          inputProps={{
            className: 'form-control connections-autocomplete-input',
            onKeyPress: searchOnEnter,
            placeholder: 'Zadaj druhú firmu / človeka',
          }}
          wrapperProps={{
            className: 'connections-autocomplete-wrapper',
          }}
        />
      </FormGroup>
      <Button color="primary" onClick={searchConnection}>
        Vyhľadať
      </Button>
    </Form>
  </div>
)

export default compose(
  withRouter,
  EntitySearchWrapper,
  withState('searchValue1', 'setSearchValue1', ({entitySearch1}) => entitySearch1),
  withState('searchValue2', 'setSearchValue2', ({entitySearch2}) => entitySearch2),
  withHandlers({
    setSearchValue1: ({setSearchValue1}) => (e) => setSearchValue1(e.target.value),
    setSearchValue2: ({setSearchValue2}) => (e) => setSearchValue2(e.target.value),
    handleSelect1: ({setSearchValue1}) => (value) => setSearchValue1(value),
    handleSelect2: ({setSearchValue2}) => (value) => setSearchValue2(value),
    searchOnEnter: (props: Props) => (e) => {
      if (e.key === 'Enter') {
        _searchConnection(props)
      }
    },
    searchConnection: (props: Props) => () => _searchConnection(props),
  })
)(Search)
