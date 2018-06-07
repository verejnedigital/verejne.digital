// @flow
import React from 'react'

import Search from './components/Search/Search'
import Statuses from './components/Statuses/Statuses'
import Results from './scenes/Results/Results'
import './Connections.css'

const Connections = () => (
  <div className="container-fluid connections">
    <div className="row">
      <div className="sidebar col-sm-5 col-md-4 col-lg-3">
        <div className="myAffix">
          <Search />
        </div>
      </div>
      <div className="col-sm-7 col-md-8 col-lg-9 main">
        <Statuses />
        <Results />
      </div>
    </div>
  </div>
)

export default Connections
