// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {branch, renderNothing, withState, withHandlers} from 'recompose'
import {Button} from 'reactstrap'
import SearchModal from './SearchModal'
import EntitySearchWrapper, {type EntitySearchProps} from '../dataWrappers/EntitySearchWrapper'
import EntityWrapper, {type EntityProps} from '../dataWrappers/EntityWrapper'
import ConnectionWrapper, {type ConnectionProps} from '../dataWrappers/ConnectionWrapper'
import {updateValue} from '../../../actions/sharedActions'
import Alternative from './Alternative'
import './Statuses.css'

type EmptyHandler = () => void

const translateZaznam = (count: number, onClickMethod) => {
  const button = <strong onClick={onClickMethod}>{count}</strong>
  if (count === 1) {
    return <span>Nájdený {button} záznam</span>
  } else if (count > 1 && count < 5) {
    return <span>Nájdené {button} záznamy</span>
  }
  return <span>Nájdených {button} záznamov</span>
}

type Props = {
  showAlternatives1: boolean,
  showAlternatives2: boolean,
  toggleAlternatives1: EmptyHandler,
  toggleAlternatives2: EmptyHandler,
  toggleModal: (boolean) => void,
} & EntitySearchProps &
  EntityProps &
  ConnectionProps

const Statuses = ({
  entity1,
  entity2,
  connections,
  showAlternatives1,
  showAlternatives2,
  toggleAlternatives1,
  toggleAlternatives2,
  toggleModal,
  modalOpen,
}: Props) => (
  <div className="statuses">
    {connections.length > 0 ? (
      <p id="search-status" className="searchStatus">
        <span>Dĺžka prepojenia:</span> <strong>{connections.length - 1}</strong>
      </p>
    ) : (
      <p id="search-status" className="searchStatus">
        Prepojenie neexistuje.
      </p>
    )}
    <p id="search-status1" className="searchStatus">
      {translateZaznam(entity1.eids.length, toggleAlternatives1)}
      <span> pre</span> <strong>&quot;{entity1.query}&quot;</strong>
      {showAlternatives1 &&
        entity1.eids &&
        entity1.eids.map((eid) => <Alternative key={eid} eid={eid} />)}
    </p>
    <p id="search-status2" className="searchStatus">
      {translateZaznam(entity2.eids.length, toggleAlternatives2)}
      <span> pre</span> <strong>&quot;{entity2.query}&quot;</strong>
      {showAlternatives2 &&
        entity2.eids &&
        entity2.eids.map((eid) => <Alternative key={eid} eid={eid} />)}
    </p>
    <Button color="primary" onClick={toggleModal}>
      Ine spojenie
    </Button>
    <SearchModal />
  </div>
)

export default compose(
  EntitySearchWrapper,
  branch(
    ({entitySearch1, entitySearch2}: EntitySearchProps): boolean =>
      !!entitySearch1 && !!entitySearch2,
    compose(
      connect((state) => ({
        modalOpen: state.connections.modalOpen,
      }),
      {updateValue}
      ),
      EntityWrapper,
      ConnectionWrapper,
      withState('showAlternatives1', 'toggleAlternatives1', false),
      withState('showAlternatives2', 'toggleAlternatives2', false),
      withHandlers({
        toggleAlternatives1: ({toggleAlternatives1}) => () => toggleAlternatives1((show) => !show),
        toggleAlternatives2: ({toggleAlternatives2}) => () => toggleAlternatives2((show) => !show),
        toggleModal: ({updateValue, modalOpen}) => () => {
          updateValue(['connections', 'modalOpen'], !modalOpen)
        },
      })
    ),
    renderNothing
  )
)(Statuses)
