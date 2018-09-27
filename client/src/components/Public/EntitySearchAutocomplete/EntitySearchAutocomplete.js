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
  entitySearchSuggestionsSelector,
  entitySearchSuggestionEidsSelector,
  entitySearchLoadedSelector,
} from '../../../selectors'
import {
  entitySearchProvider,
  entityDetailProvider,
} from '../../../dataProviders/sharedDataProviders'

import classnames from 'classnames'
import './EntitySearchAutocomplete.css'

import SearchIcon from 'react-icons/lib/fa/search'
import ModalIcon from 'react-icons/lib/fa/clone'
import Autocomplete from 'react-autocomplete'

import {FIND_ENTITY_TITLE} from '../../../constants'

import type {State} from '../../../state'

type EntitySearchAutocompleteProps = {
  entitySearchValue: string,
  suggestionEids: Array<number>,
  suggestions: Array<string>,
  setEntitySearchValue: (value: string) => void,
  setEntitySearchFor: (value: string) => void,
  toggleModalOpen: () => void,
  setDrawer: (open: boolean) => void,
  setEntitySearchOpen: (open: boolean) => void,
  closeAddressDetail: () => void,
  findEntities: (e: Event) => void,
  onSelectHandler: (e: Event) => void,
  onChangeHandler: (e: Event) => void,
  getItemValue: (suggestion: string) => string,
  renderItem: (suggestion: string, isHighlighted: boolean) => any,
  setEntitySearchLoaded: (loaded: boolean) => void,
}

const menuStyle = {
  padding: '0px',
  borderRadius: '0px',
  background: 'white',
  zIndex: 1,
}

const EntitySearchAutocomplete = ({
  entitySearchValue,
  suggestionEids,
  suggestions,
  setEntitySearchValue,
  setEntitySearchFor,
  toggleModalOpen,
  setDrawer,
  setEntitySearchOpen,
  closeAddressDetail,
  findEntities,
  onSelectHandler,
  onChangeHandler,
  getItemValue,
  renderItem,
  setEntitySearchLoaded,
}: EntitySearchAutocompleteProps) => (
  <Form onSubmit={findEntities}>
    <InputGroup className="autocomplete-holder">
      <Autocomplete
        getItemValue={getItemValue}
        items={suggestions}
        renderItem={renderItem}
        value={entitySearchValue}
        onChange={onChangeHandler}
        onSelect={onSelectHandler}
        autoHighlight={false}
        inputProps={{
          id: 'entity-input',
          className: 'form-control',
          type: 'text',
          placeholder: FIND_ENTITY_TITLE,
        }}
        renderMenu={function(items, value, style) {
          // this.menuStyle is react-autocomplete's default
          // we're using menuStyle to partially override it
          return (
            <div
              className="autocomplete-suggestions-menu"
              style={{...style, ...this.menuStyle, ...menuStyle}}
              children={items}
            />
          )
        }}
      />
      <InputGroupAddon addonType="append">
        <Button className="addon-button" color="primary" onClick={findEntities}>
          <SearchIcon />
        </Button>
      </InputGroupAddon>
      <InputGroupAddon addonType="append">
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
      suggestions: entitySearchSuggestionsSelector(state),
      entitySearchLoaded: entitySearchLoadedSelector(state),
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
    }) => (e) => {
      e.preventDefault()
      if (entitySearchValue.trim() === '') {
        return
      }
      setEntitySearchLoaded(false)
      setEntitySearchFor(entitySearchValue)
      closeAddressDetail()
      setEntitySearchOpen(true)
      setDrawer(true)
    },
    onSelectHandler: ({
      setEntitySearchValue,
      setEntitySearchFor,
      closeAddressDetail,
      setEntitySearchOpen,
      setDrawer,
    }) => (name, suggestion) => {
      setEntitySearchValue(name)
      setEntitySearchFor(name)
      closeAddressDetail()
      setEntitySearchOpen(true)
      setDrawer(true)
    },
    onChangeHandler: ({setEntitySearchValue}) => (e) => {
      setEntitySearchValue(e.target.value)
    },
    getItemValue: () => (suggestion) => suggestion,
    renderItem: () => (suggestion, isHighlighted) => (
      <div
        key={suggestion}
        className={classnames('autocomplete-item', {
          'autocomplete-item--active': isHighlighted,
        })}
      >
        <strong>{suggestion}</strong>
      </div>
    ),
  }),
  withDataProviders(({entitySearchValue, suggestionEids}) => [
    ...(entitySearchValue.trim() !== ''
      ? [entitySearchProvider(entitySearchValue, false, false)]
      : []),
    ...(suggestionEids.length > 0 ? [entityDetailProvider(suggestionEids, false)] : []),
  ])
)(EntitySearchAutocomplete)
