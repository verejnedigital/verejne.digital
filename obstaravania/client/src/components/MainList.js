import React, { Component } from 'react';
import * as serverAPI from '../actions/serverAPI';
import MainItem from './MainItem';
import './MainList.css';
import ExternalLink from "./info/ExternalLink";

export default class MainList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      sortBy: 0,
      items: [],
    };
  }

  componentWillMount() {
    this.loadList();
  }

  loadList() {
    serverAPI.getObstaravaniaList((result) => {
      this.setState({
        items: result,
      });
    });
  }

  render() {
    let text = '';
    if (this.state.items.length > 0) {
      const firstItem = this.state.items[0];
      text = (<span>
        <strong>
          {firstItem.bulletin_date}</strong> Vestník číslo <ExternalLink url={`https://www.uvo.gov.sk/evestnik?poradie=${firstItem.bulletin_number}&year=${firstItem.bulletin_year}`} text={<strong>{firstItem.bulletin_number}/{firstItem.bulletin_year}</strong>} />
      </span>);
    }

    let items = null;
    if (this.state.items.length > 0) {
      items = this.state.items.map(
            item => <MainItem key={item.id} item={item} />,
        );
    }

    return (
      <div>
        <div className="row">
          <div className="col-sm-offset-1 col-sm-10 col-xs-offset-1 col-xs-10 obstaravaniaInfo">
            {text}
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 col-xs-12">
            <div className="section">
              <table className="mainListTable dataTable table table-condensed table-responsive">
                <thead>
                  <tr>
                    <td colSpan="2" />
                    <td>Názov obstarávania</td>
                    <td>Objednávateľ</td>
                    <td>Kto by sa mal prihlásiť</td>
                    <td>Pod.</td>
                  </tr>
                </thead>
                <tbody>
                  {items}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
