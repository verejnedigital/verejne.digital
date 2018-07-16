// @flow
import React from 'react'
import {compose} from 'redux'
import {branch, renderComponent} from 'recompose'
import ConnectionWrapper from '../../dataWrappers/ConnectionWrapper'
import EntityWrapper from '../../dataWrappers/EntityWrapper'
import EntitySearchWrapper from '../../dataWrappers/EntitySearchWrapper'
import InfoLoader from './components/InfoLoader/InfoLoader'
import BeforeResults from './components/BeforeResults/BeforeResults'

const Results = (props) => (
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
    ({entitySearch1, entitySearch2}) => entitySearch1 && entitySearch2,
    compose(EntityWrapper, ConnectionWrapper),
    renderComponent(BeforeResults)
  )
)(Results)
