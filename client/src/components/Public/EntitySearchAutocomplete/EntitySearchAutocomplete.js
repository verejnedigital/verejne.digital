// @flow
import React from 'react'
import {compose, withHandlers} from 'recompose'
import {withDataProviders} from 'data-provider'
import {Form, InputGroup, InputGroupAddon, Button} from 'reactstrap'
import {connect} from 'react-redux'

import SearchIcon from 'react-icons/lib/fa/search'
import ModalIcon from 'react-icons/lib/fa/clone'
import Autocomplete from 'react-autocomplete'

import {
  toggleModalOpen,
  setModal,
  setEntitySearchValue,
  setEntitySearchFor,
  setDrawer,
  closeAddressDetail,
} from '../../../actions/publicActions'
import {
  entitySearchValueSelector,
  entitySearchSuggestionsSelector,
  entitySearchSuggestionEidsSelector,
} from '../../../selectors'
import {entitiesSearchSuggestionEidsProvider} from '../../../dataProviders/publiclyDataProviders'
import {entityDetailProvider} from '../../../dataProviders/sharedDataProviders'
import {FIND_ENTITY_TITLE} from '../../../constants'
import type NewEntityDetail from '../../../state'

type Props = {
  toggleModalOpen: () => void,
  setModal: (open: boolean) => void,
  setDrawer: (open: boolean) => void,
  entitySearchValue: string,
  suggestions: NewEntityDetail[],
  setEntitySearchValue: (e: Event) => void,
  onChangeHandler: {e: Event} => void,
  onSelectHandler: (e: Event) => void,
  findEntities: (e: Event) => void,
}

const EntitySearchAutocomplete = ({
  toggleModalOpen,
  entitySearchValue,
  setEntitySearchValue,
  suggestions,
  onChangeHandler,
  onSelectHandler,
  findEntities,
}: Props) => (
  <Form onSubmit={findEntities}>
    <InputGroup>
      <Autocomplete
        getItemValue={([eid, entity]) => entity ? entity.name : ''}
        items={suggestions}
        renderItem={([eid, entity], isHighlighted) => (
          <div key={eid} style={{background: isHighlighted ? 'lightgray' : 'white'}}>
            {entity ? entity.name : ''}
          </div>
        )}
        value={entitySearchValue}
        onChange={onChangeHandler}
        onSelect={onSelectHandler}
        autoHighlight={false}
        inputProps={{
          id: 'entity-input',
          className: 'form-control',
          placeholder: FIND_ENTITY_TITLE,
        }}
      />
      <InputGroupAddon addonType="append">
        <Button color="primary" onClick={findEntities}>
          <SearchIcon />
        </Button>
      </InputGroupAddon>
      <InputGroupAddon addonType="append">
        <Button color="primary" onClick={toggleModalOpen}>
          <ModalIcon />
        </Button>
      </InputGroupAddon>
    </InputGroup>
  </Form>
)

export default compose(
  connect(
    (state) => ({
      entitySearchValue: entitySearchValueSelector(state),
      suggestionEids: entitySearchSuggestionEidsSelector(state),
      suggestions: entitySearchSuggestionsSelector(state),
    }),
    {
      setEntitySearchValue,
      toggleModalOpen,
      setModal,
      setEntitySearchFor,
      setDrawer,
      closeAddressDetail,
    }
  ),
  withHandlers({
    findEntities: ({
      setModal,
      setEntitySearchFor,
      entitySearchValue,
      setDrawer,
      closeAddressDetail,
    }) => (e) => {
      e.preventDefault()
      setModal(true)
      closeAddressDetail()
      setEntitySearchFor(entitySearchValue)
      setDrawer(false)
    },
    onChangeHandler: ({setEntitySearchValue}) => (e) => {
      setEntitySearchValue(e.target.value)
    },
    onSelectHandler: ({
      setEntitySearchValue,
      setEntitySearchFor,
      entitySearchModalOpen,
      setModal,
      closeAddressDetail,
      setDrawer,
    }) => (name, [eid, entity]) => {
      setEntitySearchValue(name)
      setEntitySearchFor(name)
      setModal(true)
      closeAddressDetail()
      setDrawer(false)
    },
  }),
  withDataProviders(
    ({entitySearchValue, suggestionEids}) => [
      entitiesSearchSuggestionEidsProvider(entitySearchValue),
      entityDetailProvider(suggestionEids, false),
    ]
  ),
)(EntitySearchAutocomplete)
