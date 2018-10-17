// @flow
import React from 'react'
import {compose} from 'redux'
import {branch, renderComponent, withState, withHandlers} from 'recompose'
import {Button} from 'reactstrap'
import ConnectionWrapper, {type ConnectionProps} from '../dataWrappers/ConnectionWrapper'
import EntityWrapper, {type EntityProps} from '../dataWrappers/EntityWrapper'
import EntitySearchWrapper, {type EntitySearchProps} from '../dataWrappers/EntitySearchWrapper'
import InfoLoader from './InfoLoader'
import {BeforeResults, EmptyResults, NoEntityResults} from './DummyResults'
import Subgraph from './Subgraph'
import './Results.css'

type StateProps = {
  graphShown: boolean,
  toggleGraphShown: () => void,
}

type Props = EntitySearchProps & EntityProps & ConnectionProps & StateProps

const Results = (props: Props) => (
  <div>
    {props.entitySearch2 && (
      <div className="showGraphButtonWrap">
        <Button color="primary" onClick={props.toggleGraphShown} className="showGraphButton">
          {props.graphShown ? 'Skryť graf' : 'Zobraziť graf'}
        </Button>
      </div>
    )}
    {(props.graphShown || !props.entitySearch2) && <Subgraph preloadNodes {...props} />}
    {props.entitySearch2 && <InfoLoader eids={props.connections} />}
  </div>
)

export default compose(
  EntitySearchWrapper,
  withState('graphShown', 'setGraphShown', true),
  withHandlers({
    toggleGraphShown: ({setGraphShown, graphShown}) => () => setGraphShown(!graphShown),
  }),
  branch(
    ({entitySearch1}: EntitySearchProps) => entitySearch1 !== '',
    compose(
      EntityWrapper,
      ConnectionWrapper,
      branch(
        ({
          connections,
          entitySearch2,
          entity1,
        }: ConnectionProps & EntitySearchProps & EntityProps) =>
          connections.length === 0 && (entity1.eids.length === 0 || entitySearch2.length > 0),
        branch(
          ({entitySearch2}: EntitySearchProps) => entitySearch2.length > 0,
          renderComponent(EmptyResults),
          renderComponent(NoEntityResults)
        )
      )
    ),
    renderComponent(BeforeResults)
  )
)(Results)
