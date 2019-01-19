// @flow
import React, {type Node} from 'react'
import {connect} from 'react-redux'
import {compose, withStateHandlers, withState, withProps, lifecycle} from 'recompose'
import {debounce} from 'lodash'
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
import Loading from '../../Loading/Loading'

import './AutoComplete.css'

// value
type AutoCompleteProps = {
  value: string, // what is currently typed in input component
  autocompleteValue: string, // autocomplete data displayed for this value
  requestValue: string, // last request fired for this value
  onChangeHandler: (e: Event) => void,
  onSelectHandler: (value: string) => void,
  menuClassName?: string,
  inputProps?: Object,
  wrapperProps?: Object,
  suggestions: Array<string>,
  placeholder?: string,
  renderItem?: (suggestion: string, isHighlighted: boolean) => Node,
}

const AutocompleteItem = () => (suggestion, isHighlighted) => {
  if (suggestion.displayLoading) {
    return (
      <div
        key={'__loading-key__'}
        className={classnames('autocomplete-item', {
          'autocomplete-item--active': isHighlighted,
        })}
      >
        Loading
      </div>
    )
  }
  return (
    <div
      key={suggestion}
      className={classnames('autocomplete-item', {
        'autocomplete-item--active': isHighlighted,
      })}
    >
      <strong>{suggestion}</strong>
    </div>
  )
}

const AutoComplete = ({
  value,
  autocompleteValue,
  requestValue,
  onChangeHandler,
  onSelectHandler,
  menuClassName,
  inputProps,
  wrapperProps,
  suggestions,
  placeholder,
}: AutoCompleteProps) => (
  <Autocomplete
    getItemValue={(suggestion) => suggestion}
    items={suggestions}
    renderItem={AutocompleteItem}
    value={value}
    onChange={onChangeHandler}
    onSelect={onSelectHandler}
    autoHighlight={false}
    inputProps={{
      ...{
        className: 'form-control',
        type: 'text',
        placeholder: placeholder || FIND_ENTITY_TITLE,
      },
      ...inputProps,
    }}
    wrapperProps={wrapperProps}
    renderMenu={(items, value) =>
      items && items.length > 0 ? (
        <div
          className={classnames('autocomplete-suggestions-menu', menuClassName)}
          children={items}
        />
      ) : (
        <div />
      )
    }
  />
)

export default compose(
  withState('autocompleteValue', 'setAutocompleteValue', ''),
  withStateHandlers(
    {requestValue: null},
    {
      updateRequestValue: (state, props) => debounce((requestValue) => ({requestValue}), 1000),
    }
  ),
  withDataProviders(({requestValue}) => {
    if (!requestValue || requestValue.trim().length < 3) return []
    return [entitySearchProvider(requestValue, false, false)]
  }),
  connect((state: State, {requestValue}: AutoCompleteProps) => ({
    suggestionEids: autocompleteSuggestionEidsSelector(state, requestValue),
  })),
  withDataProviders(({suggestionEids}) => [entityDetailProvider(suggestionEids, false)]),
  connect((state: State, {value, autocompleteValue}: AutoCompleteProps) => {
    const currentValueSuggestions = autocompleteSuggestionsSelector(state, value)
    const previousValueSuggestions = autocompleteSuggestionsSelector(state, autocompleteValue)
    let suggestionsSource = null
    if (currentValueSuggestions.length) {
      suggestionsSource = value
    } else if (previousValueSuggestions.length) {
      suggestionsSource = autocompleteValue
    }
    return {
      suggestions: currentValueSuggestions || previousValueSuggestions || [],
      suggestionsSource,
    }
  }),
  lifecycle({
    componentDidUpdate: (prev, next) => {
      if (next.suggestionsSource !== prev.suggestionsSource) {
        next.setAutocompleteValue(next.suggestionsSource)
      }
    },
  }),
  // insert 'loading object' into suggestions if we're requesting new results
  withProps(({requestValue, autocompleteValue, suggestions}: AutoCompleteProps) => {
    if (requestValue !== autocompleteValue) {
      return {
        suggestions: [{displayLoading: true}, ...suggestions],
      }
    } else {
      return {}
    }
  })
)(AutoComplete)
