import React from 'react'

import './Legend.css'
import './LegendSymbols.css'
import {formatSimilarCount, formatSimilarPercent, getWarningSymbol} from './LegendSymbols'
import {Row, Col} from 'reactstrap'


const Legend = () => [
  <div key="legend" className="legend-notices">
    <h2 className="title">Aktuálne obstarávania</h2>
    <p>
      Našim cieľom je identifikovať a osloviť najvhodnejších uchádzačov, ktorí by sa mali
      zapojiť do verejných obstarávaní. <a href=".">Viac info</a>
    </p>
    <hr />
    <span className="label">Legenda:</span>
    <Row tag="dl">
      <Col tag="dt" className="col-sm-3">
        {formatSimilarCount(4)}
      </Col>
      <Col tag="dd" className="col-sm-9">
        počet podobných obstarávaní
      </Col>

      <Col tag="dt" className="col-sm-3">
        {formatSimilarPercent(19)}
      </Col>

      <Col tag="dd" className="col-sm-9">
        podobnosť s predchádzajúcim obstarávaním
      </Col>

      <Col tag="dt" className="col-sm-3">
        {getWarningSymbol(-1)}
      </Col>

      <Col tag="dd" className="col-sm-9">
        podozrivé obstarávanie
      </Col>
    </Row>
    <hr />
  </div>,
  <div key="facebook" className="fbfooter">
    <Row>
      <Col className="col-sm-offset-2 col-sm-10 col-xs-offset-2 col-xs-10">
        <iframe
          src="https://www.facebook.com/plugins/like.php?href=https%3A%2F%2Fwww.facebook.com%2Fverejne.digital&width=111&layout=button_count&action=like&size=small&show_faces=true&share=true&height=46&appId="
          width="151"
          height="23"
          className="fbIframe"
          title="facebook"
          scrolling="no"
          frameBorder="0"
        />
      </Col>
    </Row>
  </div>,
]

export default Legend
