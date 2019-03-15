// @flow
import React from 'react'

import {formatSimilarPercent, getWarningSymbol} from './LegendSymbols'
import './Legend.css'
import './LegendSymbols.css'

const Legend = () => (
  <div className="notice-legend">
    <h3 className="notice-legend-label">Legenda:</h3>
    <dl className="notice-legend-items">
      <dt>{formatSimilarPercent(19)}</dt>
      <dd>podobnosť s predchádzajúcim obstarávaním</dd>
      <dt>{getWarningSymbol(1)}</dt>
      <dd>podozrivé obstarávanie</dd>
    </dl>
  </div>
)

export default Legend
