// @flow
import React from 'react'
import Statuses from './components/Statuses/Statuses'
import Results from './scenes/Results/Results'
import './Connections.css'

const Connections = () => (
  <div className="container-fluid connections">
    <div className="row">
      <div className="col-sm-12 col-md-12 col-lg-12 main">
        <Statuses />
        <Results />
      </div>
    </div>
  </div>
)

export default Connections
