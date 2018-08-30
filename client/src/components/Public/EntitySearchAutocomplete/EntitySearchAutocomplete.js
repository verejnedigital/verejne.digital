// @flow
import React from 'react'
import {compose, withHandlers} from 'recompose'
import {withDataProviders} from 'data-provider'
import {Form, InputGroup, InputGroupAddon, Button} from 'reactstrap'
import {connect} from 'react-redux'

import classnames from 'classnames'
import './EntitySearchAutocomplete.css'

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
import {entitiesSearchResultEidsProvider} from '../../../dataProviders/publiclyDataProviders'
import {entityDetailProvider} from '../../../dataProviders/sharedDataProviders'
import {FIND_ENTITY_TITLE} from '../../../constants'
import type NewEntityDetail from '../../../state'

type Props = {
  toggleModalOpen: () => void,
  setModal: (open: boolean) => void,
  setDrawer: (open: boolean) => void,
  entitySearchValue: string,
  suggestions: Array<NewEntityDetail>,
  setEntitySearchValue: (e: Event) => void,
  onChangeHandler: (e: Event) => void,
  onSelectHandler: (e: Event) => void,
  findEntities: (e: Event) => void,
  getItemValue: (entity: NewEntityDetail) => string,
  renderItem: (entity: NewEntityDetail, isHighlighted: boolean) => any,
}

const menuStyle = {
  padding: '0px',
  borderRadius: '0px',
  background: 'white',
  zIndex: 1,
}

const EntitySearchAutocomplete = ({
  toggleModalOpen,
  entitySearchValue,
  setEntitySearchValue,
  suggestions,
  onChangeHandler,
  onSelectHandler,
  findEntities,
  getItemValue,
  renderItem,
}: Props) => (
  <Form onSubmit={findEntities}>
    <InputGroup>
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
          placeholder: FIND_ENTITY_TITLE,
        }}
        renderMenu={function(items, value, style) {
          return <div className="menu" style={{...style, ...this.menuStyle, ...menuStyle}} children={items} />
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
    }) => (name, entity) => {
      setEntitySearchValue(name)
      setEntitySearchFor(name)
      setModal(true)
      closeAddressDetail()
      setDrawer(false)
    },
    getItemValue: () => (entity) => (entity.name ? entity.name : ''),
    renderItem: () => (entity, isHighlighted) => (
      <div key={entity.eid} className={entity.name && classnames('item', isHighlighted && 'item--active')} >
        <strong>{entity.name ? entity.name : ''}</strong>
      </div>
    ),
  }),
  withDataProviders(
    ({entitySearchValue, suggestionEids}) => [
      entitiesSearchResultEidsProvider(entitySearchValue, true),
      entityDetailProvider(suggestionEids, false),
    ]
  ),
)(EntitySearchAutocomplete)
