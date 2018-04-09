import React, { Component } from 'react';
import {browserHistory, Link} from 'react-router';
import './MainItem.css';
import './Legend-symbols.css';
import {expC, getSuspectLevel} from '../utility/utilities';
import {getSimilarCount, getSimilarPercent, getWarningSymbol} from "../utility/LegendSymbols";
import ClickLoader from "./info/ClickLoader";

export default class ObstaravanieItem extends Component {

  static defaultProps = {
    item: null
  };

  constructor(props) {
    super(props);
    this.selectItem = this.selectItem.bind(this);
  }

  selectItem(item) {
    browserHistory.push({
      ...this.props.location,
      query: {
        obstaravanie: item.id,
      },
    });
  }

  render() {
    let candidate = '?';
    if (this.props.item.kandidati.length > 0) {
        candidate = <ClickLoader recursive eid={this.props.item.kandidati[0].eid}>{this.props.item.kandidati[0].name}</ClickLoader>;
    }

    let similarCount = '?';
    similarCount = this.props.item.kandidati.length;
    if (this.props.item.kandidati.length >= 20) {
        similarCount = similarCount + '+';
    }
    let similarity = '?';
    if (this.props.item.kandidati.length > 0) {
      similarity = Math.round(this.props.item.kandidati[0].score * 100) + '%';
    }

    const link = '/detail/' + this.props.item.id;
    let warning = null;
    const suspect = getSuspectLevel(this.props.item);
    if (suspect !== 0) {
        warning = getWarningSymbol(suspect);
    }

    let title = '';
    if (this.props.item.price && this.props.item.price_num && this.props.item.price_num >= 5) {
        const lower = expC ** (this.props.item.price_avg - 2.576 * this.props.item.price_stdev);
        const upper = expC ** (this.props.item.price_avg + 2.576 * this.props.item.price_stdev);
        title = `${this.props.item.price} (${lower}, ${expC ** this.props.item.price_avg}, ${upper}), ${this.props.item.price_avg}, ${this.props.item.price_stdev})`;
    }

    return (
      <tr title={title}>
        <td />
        <td className="text-right"><span className="similar-count">{getSimilarCount(similarCount)}</span></td>
        <td><Link to={link}>{this.props.item.title}</Link> {warning}</td>
        <td>{this.props.item.customer}</td>
        <td>{candidate}</td>
        <td className="text-center"><span className="similarity">{getSimilarPercent(similarity)}</span></td>
      </tr>
    );
  }
}
