// @flow
import React, {Fragment} from 'react'

import {Row, Col} from 'reactstrap'
import './NoticeSidebar.css'

const NoticeSidebar = () => (
  <Fragment>
    <Row>
      <Col sm={{size: 10, offset: 5}} className="notice-sidebar">
        <h2 className="notice-list-title">Aktuálne obstarávania</h2>
        <p className="notice-list-text">
          Našim cieľom je identifikovať a osloviť najvhodnejších uchádzačov, ktorí by sa mali
          zapojiť do verejných obstarávaní. <a href=".">Viac info</a>
        </p>
      </Col>
    </Row>
  </Fragment>
)

export default NoticeSidebar
