// @flow
import React from 'react'
import {compose} from 'redux'
import {branch, renderComponent} from 'recompose'
import ConnectionWrapper, {type ConnectionProps} from '../../dataWrappers/ConnectionWrapper'
import EntityWrapper, {type EntityProps} from '../../dataWrappers/EntityWrapper'
import EntitySearchWrapper, {type EntitySearchProps} from '../../dataWrappers/EntitySearchWrapper'
import InfoLoader from './components/InfoLoader/InfoLoader'
import BeforeResults from './components/BeforeResults/BeforeResults'

type Props = EntitySearchProps & EntityProps & ConnectionProps

const Results = (props: Props) => (
  <div>
    {/* this.props.location.query.graph
              ? ''
              : <Subgraph eids_A={this.state.entity1.eids} eids_B={this.state.entity2.eids} />
              ''*/}
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
