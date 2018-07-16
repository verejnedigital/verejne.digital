// @flow
import React from 'react'
import {Container, Col, Row} from 'reactstrap'

import Search from './components/Search/Search'
import Statuses from './components/Statuses/Statuses'
import Results from './scenes/Results/Results'
import './Connections.css'

const Connections = () => (
  <Container fluid className="connections">
    <Row>
      <Col lg="3" md="4" className="sidebar">
        <Search />
      </Col>
      <Col lg={{size: 9, offset: 3}} md={{size: 8, offset: 4}}>
        <Statuses />
        <Results />
      </Col>
    </Row>
  </Container>
)

export default Connections
