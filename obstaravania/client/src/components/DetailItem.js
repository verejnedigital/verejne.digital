import React, { Component } from 'react';
import {browserHistory, Link} from 'react-router';
import './DetailItem.css';
import './Legend-symbols.css';
import { addCommas } from '../utility/utilities';
import { getSimilarPercent } from "../utility/LegendSymbols";
import ClickLoader from "./info/ClickLoader";

export default class DetailItem extends Component {

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
    const similarity = Math.round(this.props.item.score * 100) + '%';
    const link = '/detail/' + this.props.item.id;

    return (
      <tr>
        <td><ClickLoader recursive eid={this.props.item.eid}>{this.props.item.name}</ClickLoader></td>
        <td><Link to={link}>{this.props.item.title}</Link></td>
        <td>{this.props.item.customer}</td>
        <td className="text-nowrap text-right"><strong>{addCommas(this.props.item.price)}</strong></td>
        <td className="text-center"><span className="similarity">{getSimilarPercent(similarity)}</span></td>
      </tr>
    );
  }
}
