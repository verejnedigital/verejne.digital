// @flow
import React, {type Node} from 'react'
import LoadingComponent from 'react-loading-components'
import {connect} from 'react-redux'
import {compose, withHandlers, withState, lifecycle} from 'recompose'
import {debounce, get} from 'lodash'
import {withDataProviders} from 'data-provider'
import {
  entitySearchProvider,
  entityDetailProvider,
} from '../../../dataProviders/sharedDataProviders'
import {
  autocompleteSuggestionEidsSelector,
  autocompleteSuggestionsSelector,
  autocompleteIsLoading,
  noResultsForCurrentSearch,
} from '../../../selectors/'
import {FIND_ENTITY_TITLE, LOADING_CIRCLE_COLOR} from '../../../constants'
import Autocomplete from 'react-autocomplete'
import classnames from 'classnames'

import type {State} from '../../../state'

import './AutoComplete.css'

// TODO this is just laziness, do better and solve flow types
const LOADING_SUGGESTION = '__isLoading__'
const NO_RESULTS = '__noResults__'

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

const AutocompleteItem = (suggestion, isHighlighted) => {
  switch (suggestion) {
    case LOADING_SUGGESTION:
      return (
        <div key={'__loading-key__'} className="autocomplete-item--placeholder">
          <LoadingComponent type="tail_spin" width={10} height={10} fill={LOADING_CIRCLE_COLOR} />{' '}
          Vyhľadávam
        </div>
      )
    case NO_RESULTS:
      return (
        <div key={'__no-results-key__'} className="autocomplete-item autocomplete-item--placeholder">
          Žiadne výsledky
        </div>
      )
    default:
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
  // autocompleteValue used to preserve last valid result while typing
  withState('autocompleteValue', 'setAutocompleteValue', ''),
  // requestValue used only to debounce dataProviders, never displayed
  withState('requestValue', 'setRequestValue', ''),
  withHandlers(() => {
    const debouncedFn = debounce((requestValue, setRequestValue) => {
      if (requestValue && requestValue.trim().length > 2) setRequestValue(requestValue)
    }, 1000)
    return {
      updateRequestDebounced: ({setRequestValue}) => (requestValue) =>
        debouncedFn(requestValue, setRequestValue),
    }
  }),
  // get search entity -> filter it's ids -> get details for those ids
  withDataProviders(({requestValue}) => {
    if (!requestValue) return []
    return [entitySearchProvider(requestValue, false, false)]
  }),
  connect((state: State, {requestValue}: AutoCompleteProps) => ({
    suggestionEids: autocompleteSuggestionEidsSelector(state, requestValue),
  })),
  withDataProviders(({suggestionEids}) =>
    get(suggestionEids, 'length') ? [entityDetailProvider(suggestionEids, false)] : []
  ),
  // if we have details for ids of current search, display them - otherwise display
  // the last search we've had details for
  connect((state: State, {value, requestValue, autocompleteValue}: AutoCompleteProps) => {
    const currentValueSuggestions = autocompleteSuggestionsSelector(state, value)
    const previousValueSuggestions = autocompleteSuggestionsSelector(state, autocompleteValue)
    const noResults = noResultsForCurrentSearch(state, value)
    const isLoading = autocompleteIsLoading(state, value)
    let suggestionsSource = null
    let suggestions = []

    if (noResults && get(value, 'length') > 2) {
      suggestions = [NO_RESULTS]
      suggestionsSource = value
    } else if (currentValueSuggestions.length) {
      suggestionsSource = value
      suggestions = currentValueSuggestions
    } else if (previousValueSuggestions.length) {
      suggestionsSource = autocompleteValue
      suggestions = previousValueSuggestions
    }
    return {
      suggestions: [...(isLoading ? [LOADING_SUGGESTION] : []), ...suggestions],
      suggestionsSource,
    }
  }),
  // update the last source we've succesfully shown autocomplete for when the list changes +
  // debounced update of request when input changes
  lifecycle({
    componentDidUpdate(prev) {
      if (
        get(this.props, 'suggestionsSource') &&
        get(this.props, 'suggestionsSource') !== get(prev, 'suggestionsSource')
      ) {
        this.props.setAutocompleteValue(this.props.suggestionsSource)
      }
      if (get(this.props, 'value') && get(this.props, 'value') !== get(prev, 'value')) {
        this.props.updateRequestDebounced(this.props.value)
      }
    },
  })
)(AutoComplete)
