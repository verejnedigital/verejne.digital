import React, {Fragment} from 'react'

import './Legend.css'
import './LegendSymbols.css'
import {formatSimilarCount, formatSimilarPercent, getWarningSymbol} from './LegendSymbols'
import {Row, Col} from 'reactstrap'

const Legend = () => (
  <Fragment>
    <Row>
      <Col xs={{size: 10, offset: 2}}>
        <h3 className="notice-legend-label">Legenda:</h3>
      </Col>
    </Row>
    <Row tag="dl">
      <Col tag="dt" xs="2" className="text-right">
        {formatSimilarCount(4)}
      </Col>
      <Col tag="dd" xs="10">
        počet podobných obstarávaní
      </Col>

      <Col tag="dt" xs="2" className="text-right">
        {formatSimilarPercent(19)}
      </Col>

      <Col tag="dd" xs="10">
        podobnosť s predchádzajúcim obstarávaním
      </Col>

      <Col tag="dt" xs="2" className="text-right">
        {getWarningSymbol(1)}
      </Col>

      <Col tag="dd" xs="10">
        podozrivé obstarávanie
      </Col>
    </Row>
  </Fragment>
)

export default Legend
