// @flow
import React from 'react'
import {compose, withHandlers} from 'recompose'
import {withDataProviders} from 'data-provider'
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
  entitySearchSuggestionEidsSelector,
  entitySearchLoadedSelector,
  entitySearchForSelector,
} from '../../../selectors'
import {
  entitySearchProvider,
  entityDetailProvider,
} from '../../../dataProviders/sharedDataProviders'
import AutoComplete from '../AutoComplete/AutoComplete'
import SearchIcon from 'react-icons/lib/fa/search'
import ModalIcon from 'react-icons/lib/fa/clone'

import {FIND_ENTITY_TOOLTIP, OPEN_MODAL_TOOLTIP} from '../../../constants'

import type {State} from '../../../state'

import './EntitySearchAutocomplete.css'

type EntitySearchAutocompleteProps = {
  entitySearchValue: string,
  suggestionEids: Array<number>,
  entitySearchFor: string,
  setEntitySearchValue: (value: string) => void,
  setEntitySearchFor: (value: string) => void,
  toggleModalOpen: () => void,
  setDrawer: (open: boolean) => void,
  setEntitySearchOpen: (open: boolean) => void,
  closeAddressDetail: () => void,
  findEntities: (e: Event) => void,
  setEntitySearchLoaded: (loaded: boolean) => void,
}

const EntitySearchAutocomplete = ({
  entitySearchValue,
  suggestionEids,
  setEntitySearchValue,
  setEntitySearchFor,
  toggleModalOpen,
  setDrawer,
  setEntitySearchOpen,
  closeAddressDetail,
  findEntities,
  setEntitySearchLoaded,
}: EntitySearchAutocompleteProps) => (
  <Form onSubmit={findEntities}>
    <InputGroup className="autocomplete-holder">
      <AutoComplete />
      <InputGroupAddon title={FIND_ENTITY_TOOLTIP} addonType="append">
        <Button className="addon-button" color="primary" onClick={findEntities}>
          <SearchIcon />
        </Button>
      </InputGroupAddon>
      <InputGroupAddon title={OPEN_MODAL_TOOLTIP} addonType="append">
        <Button className="addon-button" color="primary" onClick={toggleModalOpen}>
          <ModalIcon />
        </Button>
      </InputGroupAddon>
    </InputGroup>
  </Form>
)

export default compose(
  connect(
    (state: State) => ({
      entitySearchValue: entitySearchValueSelector(state),
      suggestionEids: entitySearchSuggestionEidsSelector(state),
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
  }),
  withDataProviders(({entitySearchValue, suggestionEids}) => [
    ...(entitySearchValue.trim() !== ''
      ? [entitySearchProvider(entitySearchValue, false, false)]
      : []),
    ...(suggestionEids.length > 0 ? [entityDetailProvider(suggestionEids, false)] : []),
  ])
)(EntitySearchAutocomplete)
