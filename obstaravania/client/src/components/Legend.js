import React, { Component } from 'react';

import './Legend.css';
import './Legend-symbols.css';
import {getSimilarCount, getSimilarPercent, getWarningSymbol} from '../utility/LegendSymbols';

export default class Legend extends Component {

  render() {
    return (
      <div className="mainLegend">
        <div className="mainLabel row">
          <div className="col-sm-offset-2 col-sm-10 col-xs-offset-2 col-xs-10 about">
            <h2 className="mainTitle">Aktuálne obstarávania</h2>
              Našim cieľom je identifikovať a osloviť najvhodnejších uchádzačov,
              ktorí by sa mali zapojiť do verejných obstarávaní.
              <a href="#">Viac info</a>
          </div>
        </div>
        <div className="row">
          <div className="divider col-sm-12 col-xs-12" />
        </div>
        <div className="row">
          <div className="col-sm-offset-2 col-sm-10 col-xs-offset-2 col-xs-10 legendLabel">
              Legenda:
          </div>
        </div>
        <div className="row">
          <div className="col-sm-2 col-xs-2">
            {getSimilarCount(4)}
          </div>
          <div className="col-sm-10 col-xs-10">počet podobných obstarávaní</div>
        </div>
        <div className="row">
          <div className="col-sm-2 col-xs-2">
            {getSimilarPercent('80%')}
          </div>
          <div className="col-sm-10 col-xs-10">podobnosť s predchádzajúcim obstarávaním</div>
        </div>
        <div className="row">
          <div className="col-sm-2 col-xs-2">
            {getWarningSymbol(2)}
          </div>
          <div className="col-sm-10 col-xs-10">podozrivé obstarávanie</div>
        </div>
      </div>
    );
  }
}
