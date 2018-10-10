// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers} from 'recompose'
import {Modal, ModalHeader, ModalBody, ModalFooter, Container, Row, Col} from 'reactstrap'
import CompanyDetails from '../../shared/CompanyDetails'
import EntitySearchWrapper, {type EntitySearchProps} from '../dataWrappers/EntitySearchWrapper'
import EntityWrapper, {type EntityProps} from '../dataWrappers/EntityWrapper'
import {updateValue} from '../../../actions/sharedActions'
import './SearchModal.css'

type Props = {
  toggleModal: (boolean) => void,
} & EntitySearchProps &
  EntityProps

const SearchModal = ({
  entity1,
  entity2,
  toggleModal,
  modalOpen,
}: Props) => (
  <Modal
    isOpen={modalOpen}
    toggle={toggleModal}
    className="connections-modal"
    autoFocus
    size="md"
  >
    <ModalHeader toggle={toggleModal}>Title</ModalHeader>
    <ModalBody>
      <Container>
        <Row>
          <Col>
            {entity1.eids &&
                entity1.eids.map((eid) => (
                  <Row>
                    <CompanyDetails eid={eid} key={eid} />
                    <div>
                      {/*TODO nejak spravit jednoznacne oznacenie na oboch stranach
                          bude treba aj v booly v globale State.js, toto by malo byt ono */}
                    </div>
                  </Row>
                ))
            }
          </Col>
          <Col xs="1" style={{border: '1px solid black'}} />
          <Col xs="1" style={{border: '1px solid black'}} />
          <Col className="float-right">
            {entity2.eids &&
                entity2.eids.map((eid) => (
                  <CompanyDetails eid={eid} key={eid} />
                ))
            }
          </Col>
        </Row>
      </Container>
    </ModalBody>
    <ModalFooter toggle={toggleModal} />
  </Modal>
)

export default compose(
  EntitySearchWrapper,
  compose(
    connect((state) => ({
      modalOpen: state.connections.modalOpen,
    }),
    {updateValue}
    ),
    EntityWrapper,
    withHandlers({
      toggleModal: ({updateValue, modalOpen}) => () => {
        updateValue(['connections', 'modalOpen'], !modalOpen)
      },
    })
  ),
)(SearchModal)
