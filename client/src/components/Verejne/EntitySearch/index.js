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
import {compose, withState, withHandlers} from 'recompose'
import EntitySearchResult from '../EntitySearchResult'
import {
  entitySearchModalOpenSelector,
  entitySearchEidsSelector,
  entitySearchForSelector,
} from '../../../selectors'
import {toggleModalOpen, setEntitySearchFor} from '../../../actions/verejneActions'
import {FIND_ENTITY_TITLE} from '../../../constants'
import './EntitySearch.css'

const EntitySearch = ({
  entitySearchModalOpen,
  toggleModalOpen,
  className,
  searchEntityValue,
  setSearchEntityValue,
  findEntities,
  entitySearchEids,
  entitySearchFor,
}) => {
  const plurality = (count) => {
    if (count === 1) {
      return `Nájdený ${count} výsledok`
    } else if (count > 1 && count < 5) {
      return `Nájdené ${count} výsledky`
    }
    return `Nájdených ${count} výsledkov`
  }

  return (
    <Modal
      isOpen={entitySearchModalOpen}
      toggle={toggleModalOpen}
      className={className}
      autoFocus
      size="md"
    >
      <ModalHeader toggle={toggleModalOpen}>{FIND_ENTITY_TITLE}</ModalHeader>
      <ModalBody>
        <Form
          onSubmit={(e) => {
            e.preventDefault()
            findEntities()
          }}
        >
          <FormGroup>
            <InputGroup>
              <Input
                type="text"
                className="form-control"
                placeholder={FIND_ENTITY_TITLE}
                value={searchEntityValue}
                onChange={(e) => setSearchEntityValue(e.target.value)}
                ref={input => input && ReactDOM.findDOMNode(input).focus()}
              />
              <InputGroupAddon addonType="append">
                <Button color="primary" onClick={findEntities}>
                  {FIND_ENTITY_TITLE}
                </Button>
              </InputGroupAddon>
            </InputGroup>
            <FormText>
              {entitySearchFor && `${plurality(entitySearchEids.length)} pre "${entitySearchFor}".`}
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
}

export default compose(
  connect(
    (state) => ({
      entitySearchModalOpen: entitySearchModalOpenSelector(state),
      entitySearchEids: entitySearchEidsSelector(state),
      entitySearchFor: entitySearchForSelector(state),
    }),
    {toggleModalOpen, setEntitySearchFor}
  ),
  withState('searchEntityValue', 'setSearchEntityValue', ''),
  withHandlers({
    findEntities: ({setEntitySearchFor, searchEntityValue}) => () =>
      setEntitySearchFor(searchEntityValue),
  })
)(EntitySearch)
