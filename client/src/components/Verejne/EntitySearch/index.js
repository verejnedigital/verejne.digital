// @flow
import React from 'react'
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Form,
  FormGroup,
  FormText,
s} from 'reactstrap'
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
  return (
    <Modal
      isOpen={entitySearchModalOpen}
      toggle={toggleModalOpen}
      className={className}
      autoFocus
      size="lg"
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
            <div className="searchGroup">
              <Input
                type="text"
                className="form-control"
                placeholder={FIND_ENTITY_TITLE}
                value={searchEntityValue}
                onChange={(e) => setSearchEntityValue(e.target.value)}
              />
              <Button color="primary" onClick={findEntities}>
                {FIND_ENTITY_TITLE}
              </Button>
            </div>
            <FormText>
              {entitySearchFor && (
                <p>{`Zobrazujem ${entitySearchEids.length} výsledkov pre "${entitySearchFor}".`}</p>
              )}
            </FormText>
            <EntitySearchResult searchFor={searchEntityValue} />
          </FormGroup>
        </Form>
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
