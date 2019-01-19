// @flow
import React from 'react'
import {compose, withHandlers} from 'recompose'
import {Form, InputGroup, InputGroupAddon, Button} from 'reactstrap'
import {connect} from 'react-redux'

import {
  setEntitySearchValue,
  setEntitySearchFor,
  toggleModalOpen,
  setDrawer,
  setEntitySearchOpen,
  closeAddressDetail,
  setEntitySearchLoaded,
} from '../../../actions/publicActions'
import {
  entitySearchValueSelector,
  entitySearchLoadedSelector,
  entitySearchForSelector,
} from '../../../selectors'
import AutoComplete from '../../shared/AutoComplete/AutoComplete'
import {FaSearch, FaClone} from 'react-icons/fa'

import {FIND_ENTITY_TITLE, OPEN_MODAL_TOOLTIP} from '../../../constants'

import type {State} from '../../../state'

import './EntitySearchAutocomplete.css'

type EntitySearchAutocompleteProps = {
  entitySearchValue: string,
  entitySearchFor: string,
  setEntitySearchValue: (value: string) => void,
  setEntitySearchFor: (value: string) => void,
  toggleModalOpen: () => void,
  setDrawer: (open: boolean) => void,
  setEntitySearchOpen: (open: boolean) => void,
  closeAddressDetail: () => void,
  findEntities: (e: Event) => void,
  setEntitySearchLoaded: (loaded: boolean) => void,
  onChangeHandler: (e: Event) => void,
  onSelectHandler: (value: string) => void,
}

const EntitySearchAutocomplete = ({
  entitySearchValue,
  setEntitySearchValue,
  setEntitySearchFor,
  toggleModalOpen,
  setDrawer,
  setEntitySearchOpen,
  closeAddressDetail,
  findEntities,
  setEntitySearchLoaded,
  onChangeHandler,
  onSelectHandler,
}: EntitySearchAutocompleteProps) => (
  <Form onSubmit={findEntities}>
    <InputGroup className="autocomplete-holder">
      <AutoComplete
        value={entitySearchValue}
        onChangeHandler={onChangeHandler}
        onSelectHandler={onSelectHandler}
        menuClassName="publicly-autocomplete-menu"
        inputProps={{
          className: 'form-control publicly-autocomplete-input',
          placeholder: FIND_ENTITY_TITLE,
        }}
      />
      <InputGroupAddon title={FIND_ENTITY_TITLE} addonType="append">
        <Button className="addon-button" color="primary" onClick={findEntities}>
          <FaSearch />
        </Button>
      </InputGroupAddon>
      <InputGroupAddon title={OPEN_MODAL_TOOLTIP} addonType="append">
        <Button className="addon-button" color="primary" onClick={toggleModalOpen}>
          <FaClone />
        </Button>
      </InputGroupAddon>
    </InputGroup>
  </Form>
)

export default compose(
  connect(
    (state: State) => ({
      entitySearchValue: entitySearchValueSelector(state),
      entitySearchLoaded: entitySearchLoadedSelector(state),
      entitySearchFor: entitySearchForSelector(state),
    }),
    {
      setEntitySearchValue,
      setEntitySearchFor,
      toggleModalOpen,
      setDrawer,
      setEntitySearchOpen,
      closeAddressDetail,
      setEntitySearchLoaded,
    }
  ),
  withHandlers({
    findEntities: ({
      entitySearchValue,
      setEntitySearchFor,
      closeAddressDetail,
      setEntitySearchOpen,
      setDrawer,
      setEntitySearchLoaded,
      entitySearchFor,
    }) => (e) => {
      e.preventDefault()
      if (entitySearchValue.trim() === '') {
        return
      }
      entitySearchFor !== entitySearchValue && setEntitySearchLoaded(false)
      setEntitySearchFor(entitySearchValue)
      closeAddressDetail()
      setEntitySearchOpen(true)
      setDrawer(true)
    },
    onChangeHandler: ({setEntitySearchValue}) => (e) => setEntitySearchValue(e.target.value),
    onSelectHandler: ({
      setEntitySearchValue,
      entitySearchValue,
      setEntitySearchFor,
      closeAddressDetail,
      setEntitySearchOpen,
      setDrawer,
      setEntitySearchLoaded,
      entitySearchFor,
    }) => (value) => {
      setEntitySearchValue(value)
      if (entitySearchValue.trim() === '') {
        return
      }
      entitySearchFor !== entitySearchValue && setEntitySearchLoaded(false)
      setEntitySearchFor(value)
      closeAddressDetail()
      setEntitySearchOpen(true)
      setDrawer(true)
    },
  })
)(EntitySearchAutocomplete)
