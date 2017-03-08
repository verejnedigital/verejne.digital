import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import InfoLoader from './info/InfoLoader';
import * as serverAPI from '../actions/serverAPI';
import Navigation from './Navigation';

import './PrepojeniaPage.css';

class PrepojeniaPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      entitysearch1: (props.location && props.location.query.eid1) || '',
      entitysearch2: (props.location && props.location.query.eid2) || '',
    };
    this.searchOnClick = this.searchOnClick.bind(this);
    this.updateInputValue = this.updateInputValue.bind(this);
    this.loadEntity1 = this.loadEntity1.bind(this);
    this.loadEntity2 = this.loadEntity2.bind(this);
    this.loadConnections = this.loadConnections.bind(this);
  }

  componentWillMount() {
    this.searchOnClick();
  }

  updateInputValue(e) {
    this.setState({
      [e.target.id]: e.target.value,
    });
  }

  searchOnClick() {
    if (this.state.entitysearch1.trim() === '' || this.state.entitysearch2.trim() === '') {
      return;
    }
    browserHistory.push({
      query: {
        eid1: this.state.entitysearch1,
        eid2: this.state.entitysearch2,
      },
    });
    this.setState({
      searching: true,
    });
    this.loadEntity1();
  }

  loadEntity1() {
    serverAPI.searchEntity(this.state.entitysearch1, (eids1) => {
      this.setState({
        entity1: {
          name: this.state.entitysearch1,
          eids: eids1,
        },
      }, this.loadEntity2);
    });
  }

  loadEntity2() {
    serverAPI.searchEntity(this.state.entitysearch2, (eids2) => {
      this.setState({
        entity2: {
          name: this.state.entitysearch2,
          eids: eids2,
        },
      }, this.loadConnections);
    });
  }

  loadConnections() {
    serverAPI.connection(this.state.entity1.eids.map(eid => eid.eid).join(),
      this.state.entity2.eids.map(eid => eid.eid).join(),
      (conns) => {
        this.setState({
          connections: conns,
          searching: false,
        });
      });
  }

  render() {
    return (
      <div>
        <Navigation brand={'prepojenia.verejne.digital'} />
        <div className="row">
          <div className="col-md-4" style={{ padding: '10px', margin: '10px' }}>
            <div style={{ marginLeft: '0px' }}>
              <label htmlFor="entitysearch1" className="toRight">
                Nájdi najkratšie spojenie medzi dvojicou:
              </label>
            </div>
            <table>
              <tbody><tr><td style={{ verticalAlign: 'middle' }}><span style={{ fontSize: '28px' }}>&#8597;</span></td><td>
                <input
                  id="entitysearch1" className="form-control entitysearch" type="text"
                  value={this.state.entitysearch1} onChange={this.updateInputValue}
                  placeholder="Zadaj prvú firmu / človeka"
                />
                <input
                  id="entitysearch2" className="form-control entitysearch" type="text"
                  value={this.state.entitysearch2} onChange={this.updateInputValue}
                  placeholder="Zadaj druhú firmu / človeka"
                />
              </td></tr>
              </tbody>
            </table>

            <div className="toRight">
              <div>
                <button
                  className="searchButton list-group-item list-group-item-danger"
                  onClick={this.searchOnClick}
                >Hľadaj</button>
              </div><br />

              <span id="search-status1" className="searchStatus">
                {this.state.entity1 &&
                  `Nájdených ${this.state.entity1.eids.length} záznamov pre "${this.state.entity1.name}"`}
                &nbsp;
              </span><br />
              <span id="search-status2" className="searchStatus">
                {this.state.entity2 &&
                  `Nájdených ${this.state.entity2.eids.length} záznamov pre "${this.state.entity2.name}"`}
                &nbsp;
              </span><br />
              <span id="search-status" className="searchStatus">
                {this.state.searching ? (
                  'Prebieha hľadanie prepojenia ...'
                ) : (
                  this.state.connections && (
                    this.state.connections.length > 0 ? (
                      `Dĺžka prepojenia: ${this.state.connections.length - 1}.`
                    ) : (
                      'Prepojenie neexistuje.'
                    )
                  )
                )}
                &nbsp;
              </span><br /><br />

              <iframe src="https://www.facebook.com/plugins/like.php?href=https%3A%2F%2Fwww.facebook.com%2Fverejne.digital&width=111&layout=button_count&action=like&size=small&show_faces=true&share=true&height=46&appId=" width="151" height="23" className="fbIframe" scrolling="no" frameBorder="0" allowTransparency="true" />
            </div>
          </div>
          <div className="col-md-6">
            <div id="search-results-link" className="toRight"></div>
            <div id="search-results1"> </div>
            <div id="search-results2"> </div>
            <div id="search-results" style={{ margin: '10px' }}>
              {this.state.connections &&
                  this.state.connections.map(connEid =>
                    <InfoLoader key={connEid} eid={connEid} />,
                  )
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default PrepojeniaPage;
