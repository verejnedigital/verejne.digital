// @flow
import React from 'react'
import classnames from 'classnames'
import {isNil} from 'lodash'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers, withState} from 'recompose'
import {
  Table,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Container,
  Row,
  Col,
} from 'reactstrap'
import CompanyDetails from '../../shared/CompanyDetails'
import EntitySearchWrapper, {type EntitySearchProps} from '../dataWrappers/EntitySearchWrapper'
import EntityWrapper, {type EntityProps} from '../dataWrappers/EntityWrapper'
import {updateValue} from '../../../actions/sharedActions'
import './SearchModal.css'

type Props = {
  toggleModal: (boolean) => void,
} & EntitySearchProps &
  EntityProps

type connectionChooserProps = {
  ownEid: number,
  chosenEid: number | null,
  setEid: (eid: number) => void,
  right?: boolean,
}

const ConnectionChooser = ({ownEid, chosenEid, setEid, right}: connectionChooserProps) => (
  <Col
    xs="1"
    className={classnames('chooser-holder', {
      'chooser-holder--active': ownEid === chosenEid,
      'chooser-holder--right': right,
    })}
    onClick={() => setEid(ownEid)}
  >
    <div className="connection-chooser">
      <input type="radio" checked={ownEid === chosenEid} onChange={() => setEid(ownEid)} />
    </div>
  </Col>
)

const ConnectionModalTable = ({eids1, eids2, setEid1, setEid2, chosenEid1, chosenEid2}) => {
  return (
    <Table className="w-100">
      <tbody>
        {eids1.map((eid1, i) => {
          const eid2 = eids2[i]
          return (
            <tr key={eid1}>
              <td className="modal-table-cell">
                <Row className="my-1">
                  <Col>
                    <CompanyDetails eid={eid1} />
                  </Col>
                  <ConnectionChooser ownEid={eid1} chosenEid={chosenEid1} setEid={setEid1} />
                </Row>
              </td>
              {eid2 ? (
                <td className="modal-table-cell">
                  <Row className="my-1">
                    <ConnectionChooser
                      ownEid={eid2}
                      chosenEid={chosenEid2}
                      setEid={setEid2}
                      right
                    />
                    <Col>
                      <CompanyDetails eid={eid2} />
                    </Col>
                  </Row>
                </td>
              ) : (
                <td className="modal-table-cell" />
              )}
            </tr>
          )
        })}
        {eids2.slice(eids1.length).map((eid2) => (
          <tr key={eid2}>
            <td className="modal-table-cell" />
            <td className="modal-table-cell">
              <Row className="my-1">
                <ConnectionChooser
                  ownEid={eid2}
                  chosenEid={chosenEid2}
                  setEid={setEid2}
                  right
                />
                <Col>
                  <CompanyDetails eid={eid2} />
                </Col>
              </Row>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

const SearchModal = ({
  entity1,
  entity2,
  toggleModal,
  modalOpen,
  eid1,
  eid2,
  setEid1,
  setEid2,
  submitNewConnection,
}: Props) => (
  <Modal isOpen={modalOpen} toggle={toggleModal} className="connections-modal" autoFocus size="md">
    <ModalHeader toggle={toggleModal}>Title</ModalHeader>
    <ModalBody>
      <Container>
        <Row>
          <ConnectionModalTable
            eids1={entity1.eids}
            eids2={entity2.eids}
            setEid1={setEid1}
            setEid2={setEid2}
            chosenEid1={eid1}
            chosenEid2={eid2}
          />
        </Row>
      </Container>
    </ModalBody>
    <ModalFooter>
      <Button
        color="primary"
        onClick={() => submitNewConnection(eid1, eid2)}
        disabled={isNil(eid1) || isNil(eid2)}
      >
        Submit
      </Button>
    </ModalFooter>
  </Modal>
)

export default compose(
  EntitySearchWrapper,
  compose(
    connect(
      (state) => ({
        modalOpen: state.connections.modalOpen,
      }),
      {updateValue}
    ),
    EntityWrapper,
    withState('eid1', 'setEid1', null),
    withState('eid2', 'setEid2', null),
    withHandlers({
      toggleModal: ({updateValue, modalOpen}) => () => {
        updateValue(['connections', 'modalOpen'], !modalOpen)
      },
      chooseEntity1: ({setEid1}) => (eid: number) => {
        setEid1(eid)
      },
      chooseEntity2: ({setEid2}) => (eid: number) => {
        setEid2(eid)
      },
      submitNewConnection: ({eid1, eid2, updateValue}) => () => {
        updateValue(['connections', 'specificEntities'], [eid1, eid2])
        updateValue(['connections', 'modalOpen'], false)
      },
    })
  )
)(SearchModal)
