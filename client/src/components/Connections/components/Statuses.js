// @flow
import React from 'react'
import {compose} from 'redux'
import {branch, renderNothing, withState, withHandlers} from 'recompose'
import EntitySearchWrapper, {type EntitySearchProps} from '../dataWrappers/EntitySearchWrapper'
import EntityWrapper, {type EntityProps} from '../dataWrappers/EntityWrapper'
import ConnectionWrapper, {type ConnectionProps} from '../dataWrappers/ConnectionWrapper'
import Alternative from './Alternative'
import './Statuses.css'

type EmptyHandler = () => void // TODO extract

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
      <span> pre</span> <strong>&quot;{entity1.id}&quot;</strong>
      {showAlternatives1 &&
        entity1.eids &&
        entity1.eids.map((eid) => <Alternative key={eid} eid={eid} />)}
    </p>
    <p id="search-status2" className="searchStatus">
      {translateZaznam(entity2.eids.length, toggleAlternatives2)}
      <span> pre</span> <strong>&quot;{entity2.id}&quot;</strong>
      {showAlternatives2 &&
        entity2.eids &&
        entity2.eids.map((eid) => <Alternative key={eid} eid={eid} />)}
    </p>
  </div>
)

export default compose(
  EntitySearchWrapper,
  branch(
    ({entitySearch1, entitySearch2}: EntitySearchProps): boolean =>
      !!entitySearch1 && !!entitySearch2,
    compose(
      EntityWrapper,
      ConnectionWrapper,
      withState('showAlternatives1', 'toggleAlternatives1', false),
      withState('showAlternatives2', 'toggleAlternatives2', false),
      withHandlers({
        toggleAlternatives1: ({toggleAlternatives1}) => () => toggleAlternatives1((show) => !show),
        toggleAlternatives2: ({toggleAlternatives2}) => () => toggleAlternatives2((show) => !show),
      })
    ),
    renderNothing
  )
)(Statuses)
