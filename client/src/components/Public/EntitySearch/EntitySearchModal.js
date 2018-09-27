// @flow
import React from 'react'
import ReactDOM from 'react-dom'
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  InputGroup,
  InputGroupAddon,
  Form,
  FormGroup,
  FormText,
} from 'reactstrap'
import {connect} from 'react-redux'
import {compose, withHandlers} from 'recompose'
import EntitySearchResult from '../EntitySearchResult/EntitySearchResult'
import {
  entitySearchValueSelector,
  entitySearchModalOpenSelector,
  entitySearchEidsSelector,
  entitySearchForSelector,
  entitySearchLoadedSelector,
} from '../../../selectors'
import {
  toggleModalOpen,
  setEntitySearchFor,
  setEntitySearchLoaded,
} from '../../../actions/publicActions'
import {updateValue} from '../../../actions/sharedActions'
import {FIND_ENTITY_TITLE} from '../../../constants'
import {resultPlurality} from '../../../services/utilities'

import type {State} from '../../../state'

type EntitySearchProps = {|
  entitySearchModalOpen: boolean,
  toggleModalOpen: () => void,
  className: string,
  entitySearchValue: string,
  setEntitySearchValue: (updateValue: string) => void,
  findEntities: (setEntitySearchFor: Function, entitySearchValue: string) => void,
  entitySearchEids: Array<number>,
  entitySearchFor: string,
  entitySearchLoaded: boolean,
  setEntitySearchLoaded: (loaded: boolean) => void,
|}

const EntitySearchModal = ({
  entitySearchModalOpen,
  toggleModalOpen,
  className,
  entitySearchValue,
  setEntitySearchValue,
  findEntities,
  entitySearchEids,
  entitySearchFor,
  entitySearchLoaded,
  setEntitySearchLoaded,
}: EntitySearchProps) => (
  <Modal
    isOpen={entitySearchModalOpen}
    toggle={toggleModalOpen}
    className={className}
    autoFocus
    size="md"
  >
    <ModalHeader toggle={toggleModalOpen}>{FIND_ENTITY_TITLE}</ModalHeader>
    <ModalBody>
      <Form onSubmit={findEntities}>
        <FormGroup>
          <InputGroup>
            <Input
              type="text"
              className="form-control"
              placeholder={FIND_ENTITY_TITLE}
              value={entitySearchValue}
              onChange={setEntitySearchValue}
              ref={(input) => {
                const el = ReactDOM.findDOMNode(input)
                el && el instanceof HTMLElement && el.focus()
              }}
            />
            <InputGroupAddon addonType="append">
              <Button color="primary" onClick={findEntities}>
                {FIND_ENTITY_TITLE}
              </Button>
            </InputGroupAddon>
          </InputGroup>
          <FormText>
            {entitySearchLoaded &&
              `${resultPlurality(entitySearchEids.length)} pre "${entitySearchFor}".`}
          </FormText>
        </FormGroup>
      </Form>
      <EntitySearchResult />
    </ModalBody>
    <ModalFooter>
      <Button color="secondary" onClick={toggleModalOpen}>
        Zavrieť
      </Button>
    </ModalFooter>
  </Modal>
)

export default compose(
  connect(
    (state: State) => ({
      entitySearchValue: entitySearchValueSelector(state),
      entitySearchModalOpen: entitySearchModalOpenSelector(state),
      entitySearchEids: entitySearchEidsSelector(state),
      entitySearchFor: entitySearchForSelector(state),
      entitySearchLoaded: entitySearchLoadedSelector(state),
    }),
    {toggleModalOpen, setEntitySearchFor, updateValue, setEntitySearchLoaded}
  ),
  withHandlers({
    findEntities: ({
      setEntitySearchFor,
      entitySearchValue,
      setEntitySearchLoaded,
    }) => (e) => {
      e.preventDefault()
      if (entitySearchValue.trim() === '') {
        return
      }
      setEntitySearchLoaded(false)
      setEntitySearchFor(entitySearchValue)
    },
    setEntitySearchValue: ({updateValue}) => (e) =>
      updateValue(
        ['publicly', 'entitySearchValue'],
        e.target.value,
        'Set entity search field value'
      ),
  })
)(EntitySearchModal)
