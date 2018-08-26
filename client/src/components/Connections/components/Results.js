// @flow
import React from 'react'
import {compose} from 'redux'
import {branch, renderComponent} from 'recompose'
import ConnectionWrapper, {type ConnectionProps} from '../dataWrappers/ConnectionWrapper'
import EntityWrapper, {type EntityProps} from '../dataWrappers/EntityWrapper'
import EntitySearchWrapper, {type EntitySearchProps} from '../dataWrappers/EntitySearchWrapper'
import InfoLoader from './InfoLoader'
import BeforeResults from './BeforeResults'
import Subgraph from './Subgraph'

type Props = EntitySearchProps & EntityProps & ConnectionProps

const Results = (props: Props) => (
  <div>
    {props.showGraph ? <Subgraph preloadNodes {...props} /> : null}
    {props.connections.map((connEid) => <InfoLoader key={connEid} eid={connEid} hasConnectLine />)}
  </div>
)

export default compose(
  EntitySearchWrapper,
  branch(
    ({entitySearch1, entitySearch2}: EntitySearchProps) =>
      entitySearch1 !== '' && entitySearch2 !== '',
    compose(EntityWrapper, ConnectionWrapper),
    renderComponent(BeforeResults)
  )
)(Results)
