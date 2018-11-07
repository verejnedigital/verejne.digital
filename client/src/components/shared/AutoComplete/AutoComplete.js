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

import './AutoComplete.css'

type AutoCompleteProps = {
  value: string,
  onChangeHandler: (e: Event) => void,
  onSelectHandler: (value: string) => void,
  menuClassName?: string,
  inputProps?: Object,
  wrapperProps?: Object,
  suggestions?: Array<string>,
  renderItem?: (suggestion: string, isHighlighted: boolean) => Node,
}

const AutoComplete = ({
  value,
  onChangeHandler,
  onSelectHandler,
  menuClassName,
  inputProps,
  wrapperProps,
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
      className: 'form-control',
      type: 'text',
      placeholder: FIND_ENTITY_TITLE,
    }, ...inputProps}}
    wrapperProps={wrapperProps}
    renderMenu={(items, value) =>
      suggestions && suggestions.length > 0
        ? (<div
          className={classnames('autocomplete-suggestions-menu', menuClassName)}
          children={items}
        />)
        : <div />
    }
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
