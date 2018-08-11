// @flow
import React, {PureComponent} from 'react'
import {withRouter} from 'react-router-dom'
import {compose} from 'redux'
import type {RouterHistory} from 'react-router'
import {Form, FormGroup, Label, Input, Button} from 'reactstrap'

import EntitySearchWrapper from '../../dataWrappers/EntitySearchWrapper'
import './Search.css'

type Props = {|
  entitySearch1: string,
  entitySearch2: string,
  history: RouterHistory,
|}

type State = {|
  entitySearch1: string,
  entitySearch2: string,
|}

class Search extends PureComponent<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      entitySearch1: props.entitySearch1,
      entitySearch2: props.entitySearch2,
    }
  }

  searchConnection = (entitySearch1, entitySearch2) => {
    if (entitySearch1.trim() === '' || entitySearch2.trim() === '') {
      return
    }
    this.props.history.push(`/prepojenia?eid1=${entitySearch1}&eid2=${entitySearch2}`)
  }

  updateInputValue = (e) => {
    this.setState({
      [e.target.id]: e.target.value,
    })
  }

  searchOnClick = () => {
    this.searchConnection(this.state.entitySearch1, this.state.entitySearch2)
  }

  checkEnter = (e) => {
    if (e.key === 'Enter') {
      this.searchOnClick()
    }
  }

  render() {
    return (
      <div>
        <h2>Vyhľadaj</h2>
        <p>najkratšie spojenie medzi dvojicou:</p>
        <Form>
          <FormGroup>
            <Label for="entitySearch1">Prvá firma/osoba</Label>
            <Input
              id="entitySearch1"
              type="text"
              value={this.state.entitySearch1}
              onChange={this.updateInputValue}
              onKeyPress={this.checkEnter}
              placeholder="Zadaj prvú firmu / človeka"
            />
          </FormGroup>
          <FormGroup>
            <label htmlFor="entitySearch2">Druhá firma/osoba</label>
            <input
              id="entitySearch2"
              className="form-control"
              type="text"
              value={this.state.entitySearch2}
              onChange={this.updateInputValue}
              onKeyPress={this.checkEnter}
              placeholder="Zadaj druhú firmu / človeka"
            />
          </FormGroup>
          <Button color="primary" onClick={this.searchOnClick}>
            Vyhľadať
          </Button>
        </Form>
      </div>
    )
  }
}

export default compose(withRouter, EntitySearchWrapper)(Search)
