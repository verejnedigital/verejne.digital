// @flow
import React, {type Node} from 'react'
import {connect} from 'react-redux'
import {compose, withHandlers} from 'recompose'
import {withDataProviders} from 'data-provider'
import {
  entitySearchProvider,
  entityDetailProvider,
} from '../../../dataProviders/sharedDataProviders'
import {
  autocompleteSuggestionEidsSelector,
  autocompleteSuggestionsSelector,
} from '../../../selectors/'
import {FIND_ENTITY_TITLE} from '../../../constants'
import Autocomplete from 'react-autocomplete'
import classnames from 'classnames'

import type {State} from '../../../state'

type AutoCompleteProps = {
  value: string,
  onChangeHandler: (e: Event) => void,
  onSelectHandler: (value: string) => void,
  inputProps?: Object,
  wrapperProps?: Object,
  menuClassName?: string,
  suggestions?: Array<string>,
  renderItem?: (suggestion: string, isHighlighted: boolean) => Node,
}

const AutoComplete = ({
  value,
  onChangeHandler,
  onSelectHandler,
  inputProps,
  wrapperProps,
  menuClassName,
  suggestions,
  renderItem,
}: AutoCompleteProps) => (
  <Autocomplete
    getItemValue={(suggestion) => suggestion}
    items={suggestions}
    renderItem={renderItem}
    value={value}
    onChange={onChangeHandler}
    onSelect={onSelectHandler}
    autoHighlight={false}
    inputProps={{...{
      id: 'entity-input',
      className: 'form-control',
      type: 'text',
      placeholder: FIND_ENTITY_TITLE,
    }, ...inputProps}}
    wrapperProps={wrapperProps}
    renderMenu={function(items, value) {
      // this.menuStyle is react-autocomplete's default
      // we're using menuStyle to partially override it
      const menuStyle = {
        padding: '0px',
        borderRadius: '0px',
        background: 'white',
        border: '1px solid #cddae3',
        zIndex: 1,
      }
      return suggestions && suggestions.length > 0
        ? (<div
          className={menuClassName || ''}
          style={{...this.menuStyle, ...menuStyle}}
          children={items}
        />)
        : <div />
    }}
  />
)

export default compose(
  connect(
    (state: State, {value}: AutoCompleteProps) => ({
      suggestionEids: autocompleteSuggestionEidsSelector(state, value),
      suggestions: autocompleteSuggestionsSelector(state, value),
    }),
  ),
  withDataProviders(({value, suggestionEids}) => [
    ...(value.trim() !== ''
      ? [entitySearchProvider(value, false, false)]
      : []),
    ...(suggestionEids.length > 0 ? [entityDetailProvider(suggestionEids, false)] : []),
  ]),
  withHandlers({
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
