import React from 'react'
import ConnectionWrapper from '../../dataWrappers/ConnectionWrapper'
import EntityWrapper from '../../dataWrappers/EntityWrapper'
import InfoLoader from './components/InfoLoader/InfoLoader'

const Results = (props) => (
  <div>
    {props.connections && props.connections.length > 0 ? (
      <div className="results container-fluid">
        {/* this.props.location.query.graph
              ? ''
              : <Subgraph eids_A={this.state.entity1.eids} eids_B={this.state.entity2.eids} />
              ''*/}
        {props.connections.map((connEid) => (
          <InfoLoader key={connEid} eid={connEid} hasConnectLine />
        ))}
      </div>
    ) : (
      <div className="beforeResultsContainer">
        <div className="beforeResults">
          <h1 className="whatSearch">Zadajte dvojicu</h1>
          <h3 className="describeFor">pre začiatok vyhľadávania.</h3>
        </div>
      </div>
    )}
  </div>
)

export default EntityWrapper(ConnectionWrapper(Results))
