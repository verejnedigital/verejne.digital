// @flow
import React, {Fragment} from 'react'
import {Row, Col} from 'reactstrap'

import {formatSimilarPercent, getWarningSymbol} from './LegendSymbols'
import './Legend.css'
import './LegendSymbols.css'

const Legend = () => (
  <Fragment>
    <Row>
      <Col xs={{size: 10, offset: 2}}>
        <h3 className="notice-legend-label">Legenda:</h3>
      </Col>
    </Row>
    <Row tag="dl">
      <Col tag="dt" xs="2" className="text-right px-0">
        {formatSimilarPercent(19)}
      </Col>

      <Col tag="dd" xs="10">
        podobnosť s predchádzajúcim obstarávaním
      </Col>

      <Col tag="dt" xs="2" className="text-right px-0">
        {getWarningSymbol(1)}
      </Col>

      <Col tag="dd" xs="10">
        podozrivé obstarávanie
      </Col>
    </Row>
  </Fragment>
)

export default Legend
