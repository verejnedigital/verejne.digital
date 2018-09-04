// @flow
import React from 'react'
import {compose, withHandlers} from 'recompose'
import {Input, Form, FormGroup, InputGroup, InputGroupAddon, Button} from 'reactstrap'
import {connect} from 'react-redux'

import SearchIcon from 'react-icons/lib/fa/search'
import ModalIcon from 'react-icons/lib/fa/clone'

import {
  toggleModalOpen,
  setEntitySearchFor,
  toggleDrawer,
  closeAddressDetail,
  toggleEntitySearchOpen,
} from '../../../actions/publicActions'
import {updateValue} from '../../../actions/sharedActions'
import {
  entitySearchValueSelector,
} from '../../../selectors'
import {FIND_ENTITY_TITLE} from '../../../constants'

type Props = {
  toggleEntitySearchOpen: () => void,
  toggleModalOpen: () => void,
  entitySearchValue: string,
  setEntitySearchValue: (e: Event) => void,
  findEntities: (e: Event) => void,
}

const entitySearchAutocomplete = ({
  toggleModalOpen,
  entitySearchValue,
  setEntitySearchValue,
  findEntities,
}: Props) => (
  <Form onSubmit={findEntities}>
    <FormGroup>
      <InputGroup>
        <Input
          className="entity-input"
          type="text"
          placeholder={FIND_ENTITY_TITLE}
          value={entitySearchValue}
          onChange={setEntitySearchValue}
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
    </FormGroup>
  </Form>
)

export default compose(
  connect(
    (state) => ({
      entitySearchValue: entitySearchValueSelector(state),
    }),
    {
      updateValue,
      toggleEntitySearchOpen,
      toggleModalOpen,
      setEntitySearchFor,
      toggleDrawer,
      closeAddressDetail,
    }
  ),
  withHandlers({
    findEntities: ({toggleEntitySearchOpen, setEntitySearchFor, entitySearchValue, toggleDrawer, closeAddressDetail}) => (e) => {
      e.preventDefault()
      toggleEntitySearchOpen()
      closeAddressDetail()
      setEntitySearchFor(entitySearchValue)
      toggleDrawer()
    },
    setEntitySearchValue: ({updateValue}) => (e) =>
      updateValue(
        ['publicly', 'entitySearchValue'],
        e.target.value,
        'Set entity search field value'
      ),
  })
)(entitySearchAutocomplete)
