// @flow
import React from 'react'
import {withRouter} from 'react-router-dom'
import {withHandlers, withState} from 'recompose'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {updateValue} from '../../../../actions/sharedActions'
import {Form, FormGroup, Label, Input, Button} from 'reactstrap'
import type {ContextRouter} from 'react-router'

import EntitySearchWrapper from '../../dataWrappers/EntitySearchWrapper'
import './Search.css'

const checkEnter = (callback) => {
  return (e) => {
    if (e.key === 'Enter') {
      callback()
    }
  }
}

type Props = {
  searchValue1: string,
  searchValue2: string,
  setSearchValue1: (entitySearch: string) => void,
  setSearchValue2: (entitySearch: string) => void,
  searchConnection: (e: Event) => void,
} & ContextRouter

const Search = ({
  searchValue1,
  searchValue2,
  setSearchValue1,
  setSearchValue2,
  searchConnection,
}: Props) => (
  <div>
    <h2>Vyhľadaj</h2>
    <p>najkratšie spojenie medzi dvojicou:</p>
    <Form>
      <FormGroup>
        <Label for="searchValue1">Prvá firma/osoba</Label>
        <Input
          id="searchValue1"
          type="text"
          value={searchValue1}
          onChange={(e) => setSearchValue1(e.target.value)}
          onKeyPress={checkEnter(searchConnection)}
          placeholder="Zadaj prvú firmu / človeka"
        />
      </FormGroup>
      <FormGroup>
        <label htmlFor="searchValue2">Druhá firma/osoba</label>
        <input
          id="searchValue2"
          className="form-control"
          type="text"
          value={searchValue2}
          onChange={(e) => setSearchValue2(e.target.value)}
          onKeyPress={checkEnter(searchConnection)}
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
  connect(null, {updateValue}),
  withHandlers({
    searchConnection: (props: Props) => () => {
      if (props.searchValue1.trim() === '' || props.searchValue2.trim() === '') {
        return
      }
      props.history.push(
        `/prepojenia?eid1=${props.searchValue1.trim()}&eid2=${props.searchValue2.trim()}`
      )
    },
  })
)(Search)
