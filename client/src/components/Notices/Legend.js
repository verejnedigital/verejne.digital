import React, {Component} from 'react'

import './Legend.css'
import './LegendSymbols.css'
import {formatSimilarCount, formatSimilarPercent, getWarningSymbol} from './LegendSymbols'
import {Row, Col} from 'reactstrap'

export default class Legend extends Component {

  render() {
    return (
      <div className="legend">
        <h2 className="title">Aktuálne obstarávania</h2>
        <p>
          Našim cieľom je identifikovať a osloviť najvhodnejších uchádzačov,
          ktorí by sa mali zapojiť do verejných obstarávaní. <a href=".">Viac info</a>
        </p>
        <hr />
        <span className="label">Legenda:</span>
        <Row tag="dl">
          <Col tag="dt" className="col-sm-3">{formatSimilarCount(4)}</Col>
          <Col tag="dd" className="col-sm-9">počet podobných obstarávaní</Col>

          <Col tag="dt" className="col-sm-3">{formatSimilarPercent(19)}</Col>
          <Col tag="dd" className="col-sm-9">podobnosť s predchádzajúcim obstarávaním</Col>

          <Col tag="dt" className="col-sm-3">{getWarningSymbol(-1)}</Col>
          <Col tag="dd" className="col-sm-9">podozrivé obstarávanie</Col>
        </Row>
        <hr />
      </div>
    )
  }
}
