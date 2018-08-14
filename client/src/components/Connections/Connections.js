// @flow
import React from 'react'
import {Container, Col, Row} from 'reactstrap'
import Search from './components/Search'
import Statuses from './components/Statuses'
import Results from './components/Results'
import './Connections.css'

const Connections = () => (
  <Container fluid className="connections">
    <Row>
      <Col lg="3" md="4" className="connections-sidebar">
        <Search />
        <Statuses />
      </Col>
      <Col lg={{size: 9, offset: 3}} md={{size: 8, offset: 4}} className="connections-main">
        <Results />
      </Col>
    </Row>
  </Container>
)

export default Connections
