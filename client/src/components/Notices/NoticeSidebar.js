// @flow
import React, {Fragment} from 'react'

import {Row, Col} from 'reactstrap'
import Legend from './Legend'
import './NoticeSidebar.css'

const NoticeSidebar = () => (
  <Fragment>
    <Row>
      <Col sm={{size: 10, offset: 2}}>
        <h2 className="notice-list-title">Aktuálne obstarávania</h2>
        <p className="notice-list-text">
          Našim cieľom je identifikovať a osloviť najvhodnejších uchádzačov, ktorí by sa mali
          zapojiť do verejných obstarávaní. <a href=".">Viac info</a>
        </p>
      </Col>
    </Row>
    <hr />
    <Legend />
    <hr />
    <Row>
      <Col sm={{size: 10, offset: 2}}>
        <div className="fbfooter">
          <iframe
            src="https://www.facebook.com/plugins/like.php?href=https%3A%2F%2Fwww.facebook.com%2Fverejne.digital&width=111&layout=button_count&action=like&size=small&show_faces=true&share=true&height=46&appId="
            className="fbIframe"
            title="facebook"
            scrolling="no"
            frameBorder="0"
          />
        </div>
      </Col>
    </Row>
  </Fragment>
)

export default NoticeSidebar
