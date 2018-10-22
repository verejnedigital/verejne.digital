// @flow
import React from 'react'
import {compose, withHandlers} from 'recompose'
import {FIND_ENTITY_TITLE} from '../../../constants'
import Autocomplete from 'react-autocomplete'
import classnames from 'classnames'
import {connect} from 'react-redux'
import {
  setEntitySearchValue,
  setEntitySearchFor,
  setDrawer,
  setEntitySearchOpen,
  closeAddressDetail,
  setEntitySearchLoaded,
} from '../../../actions/publicActions'
import {entitySearchValueSelector, entitySearchSuggestionsSelector} from '../../../selectors'

import type {State} from '../../../state'

import './AutoComplete.css'

type AutoCompleteProps = {
  getItemValue: (suggestion: string) => string,
  suggestions: Array<string>,
  renderItem: (suggestion: string, isHighlighted: boolean) => any,
  entitySearchValue: string,
  onChangeHandler: (e: Event) => void,
  onSelectHandler: (e: Event) => void,
}

const AutoComplete = ({
  getItemValue,
  suggestions,
  renderItem,
  entitySearchValue,
  onChangeHandler,
  onSelectHandler,
}: AutoCompleteProps) => (
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
    wrapperProps={{
      className: 'autocomplete-wrapper',
    }}
    renderMenu={function(items, value) {
      // this.menuStyle is react-autocomplete's default
      // we're using menuStyle to partially override it
      const menuStyle = {
        padding: '0px',
        borderRadius: '0px',
        background: 'white',
        zIndex: 1,
      }
      return (
        <div
          className="autocomplete-suggestions-menu"
          style={{...this.menuStyle, ...menuStyle}}
          children={items}
        />
      )
    }}
  />
)

export default compose(
  connect(
    (state: State) => ({
      entitySearchValue: entitySearchValueSelector(state),
      suggestions: entitySearchSuggestionsSelector(state),
    }),
    {
      setEntitySearchValue,
      setEntitySearchFor,
      setDrawer,
      setEntitySearchOpen,
      setEntitySearchLoaded,
      closeAddressDetail,
    }
  ),
  withHandlers({
    onSelectHandler: ({
      setEntitySearchValue,
      setEntitySearchFor,
      closeAddressDetail,
      setEntitySearchOpen,
      setDrawer,
      setEntitySearchLoaded,
    }) => (name, suggestion) => {
      setEntitySearchLoaded(false)
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
  })
)(AutoComplete)
