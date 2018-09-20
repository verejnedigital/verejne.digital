// @flow
import React from 'react'
import {withRouter} from 'react-router-dom'
import {withHandlers, withState} from 'recompose'
import {compose} from 'redux'
import {Form, FormGroup, Label, Input, Button} from 'reactstrap'
import type {ContextRouter} from 'react-router'
import EntitySearchWrapper, {type EntitySearchProps} from '../dataWrappers/EntitySearchWrapper'
import './Search.css'

type EmptyHandler = () => void
type EventHandler = (e: Event) => void

type Props = {
  searchValue1: string,
  searchValue2: string,
  setSearchValue1: EventHandler,
  setSearchValue2: EventHandler,
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
  searchOnEnter,
  searchConnection,
}: Props) => (
  <div>
    <h2>Vyhľadaj</h2>
    <p>zaujímavé spojenia jednotlivca alebo najkratšie spojenie medzi dvojicou:</p>
    <Form>
      <FormGroup>
        <Label for="searchValue1">Prvá firma/osoba*</Label>
        <Input
          id="searchValue1"
          type="text"
          value={searchValue1}
          onChange={setSearchValue1}
          onKeyPress={searchOnEnter}
          placeholder="Zadaj prvú firmu / človeka"
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="searchValue2">Druhá firma/osoba</Label>
        <Input
          id="searchValue2"
          className="form-control"
          type="text"
          value={searchValue2}
          onChange={setSearchValue2}
          onKeyPress={searchOnEnter}
          placeholder="Zadaj druhú firmu / človeka"
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
    searchOnEnter: (props: Props) => (e) => {
      if (e.key === 'Enter') {
        _searchConnection(props)
      }
    },
    searchConnection: (props: Props) => () => _searchConnection(props),
  })
)(Search)
