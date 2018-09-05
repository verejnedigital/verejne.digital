// @flow
import React from 'react'
import {compose} from 'redux'
import {branch, renderComponent, withState, withHandlers} from 'recompose'
import {Button} from 'reactstrap'
import ConnectionWrapper, {type ConnectionProps} from '../dataWrappers/ConnectionWrapper'
import EntityWrapper, {type EntityProps} from '../dataWrappers/EntityWrapper'
import EntitySearchWrapper, {type EntitySearchProps} from '../dataWrappers/EntitySearchWrapper'
import InfoLoader from './InfoLoader'
import BeforeResults from './BeforeResults'
import Subgraph from './Subgraph'
import './Results.css'

type StateProps = {
  graphShown: boolean,
  toggleGraphShown: () => void,
}

type Props = EntitySearchProps & EntityProps & ConnectionProps & StateProps

const Results = (props: Props) => (
  <div>
    <div className="showGraphButtonWrap">
      <Button color="primary" onClick={props.toggleGraphShown} className="showGraphButton">
        {props.graphShown ? 'Skryť graf' : 'Zobraziť graf'}
      </Button>
    </div>
    {props.graphShown && <Subgraph preloadNodes {...props} />}
    {props.connections.map((connEid) => <InfoLoader key={connEid} eid={connEid} hasConnectLine />)}
  </div>
)

export default compose(
  EntitySearchWrapper,
  withState('graphShown', 'setGraphShown', false),
  withHandlers({
    toggleGraphShown: ({setGraphShown, graphShown}) => () => setGraphShown(!graphShown),
  }),
  branch(
    ({entitySearch1, entitySearch2}: EntitySearchProps) =>
      entitySearch1 !== '' && entitySearch2 !== '',
    compose(EntityWrapper, ConnectionWrapper),
    renderComponent(BeforeResults)
  )
)(Results)
