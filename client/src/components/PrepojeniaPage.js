import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import InfoLoader from './info/InfoLoader';
import * as serverAPI from '../actions/serverAPI';

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
    this.searchOnClickOnEnter = this.searchOnClickOnEnter.bind(this);
  }

  componentWillMount() {
    this.searchOnClick();
  }

  updateInputValue(e) {
    this.setState({
      [e.target.id]: e.target.value,
    });
  }

  searchOnClickOnEnter(e) {
    if (e.key === 'Enter') {
      this.searchOnClick();
    }
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
      <div className="container-fluid">
        <div className="row">
          <div className="sidebar col-sm-5 col-md-3">
            <nav className="sidebarnav navbar">
              <div className="navbar-header" id="world-top">
                <button
                  type="button" className="navbar-toggle"
                  data-toggle="collapse" data-target=".navbar-collapse"
                >
                  <span className="icon-bar"></span>
                  <span className="icon-bar"></span>
                  <span className="icon-bar"></span>
                </button>
                <a className="navbar-brand">prepojenia.verejne.digital</a>
              </div>
              <div className="navbar-collapse collapse">
                <ul className="nav navbar-nav">
                  <li><a href="../index.html">verejne.digital</a></li>
                  <li><a href="http://www.facebook.com/verejne.digital" target="_blank" rel="noopener noreferrer">kontaktuj nás na Facebooku</a></li>
                  <li><a href="../obstaravania/index.html">obstaravania.verejne.digital</a></li>
                </ul>
              </div>
            </nav>
            <div className="searchForm">
              <div className="searchLabel row">
                <div className="col-sm-offset-2 col-sm-10">
                  <h2>Vyhľadaj</h2>
                  najkratšie spojenie medzi dvojicou:
                </div>
              </div>
              <div className="form-horizontal">
                <div className="entitysearch form-group">
                  <label htmlFor="entitysearch1" className="col-sm-2 control-label">01</label>
                  <div className="col-sm-10">
                    <input
                      id="entitysearch1" className="form-control" type="text"
                      value={this.state.entitysearch1} onChange={this.updateInputValue}
                      onKeyPress={this.searchOnClickOnEnter}
                      placeholder="Zadaj prvú firmu / človeka"
                    />
                  </div>
                </div>
                <div className="entitysearch form-group">
                  <label htmlFor="entitysearch2" className="col-sm-2 control-label">02</label>
                  <div className="col-sm-10">
                    <input
                      id="entitysearch2" className="form-control" type="text"
                      value={this.state.entitysearch2} onChange={this.updateInputValue}
                      onKeyPress={this.searchOnClickOnEnter}
                      placeholder="Zadaj druhú firmu / človeka"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <div className="col-sm-offset-2 col-sm-10">
                    <button
                      className="searchButton btn btn-primary"
                      onClick={this.searchOnClick}
                    >Vyhľadať</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="fbfooter">
              <hr />
              <div className="col-sm-offset-2 col-sm-10">
                <iframe src="https://www.facebook.com/plugins/like.php?href=https%3A%2F%2Fwww.facebook.com%2Fverejne.digital&width=111&layout=button_count&action=like&size=small&show_faces=true&share=true&height=46&appId=" width="151" height="23" className="fbIframe" scrolling="no" frameBorder="0" allowTransparency="true" />
              </div>
            </div>
          </div>
          <div className="col-sm-7 col-md-9 main">
            <div className="statuses">
              {this.state.searching ? (
                'Prebieha hľadanie prepojenia ...'
              ) : (
                this.state.connections && (
                  this.state.connections.length > 0 ? (
                    <span id="search-status" className="searchStatus">
                      Dĺžka prepojenia: <strong>{this.state.connections.length - 1}</strong>.&nbsp;
                    </span>
                  ) : (
                    <span id="search-status" className="searchStatus">
                      Prepojenie neexistuje.&nbsp;
                    </span>
                  )
                )
              )}
              {this.state.entity1 &&
                <span id="search-status1" className="searchStatus">
                  Nájdených <strong>{this.state.entity1.eids.length}</strong> záznamov
                  pre &quot;{this.state.entity1.name}&quot;.&nbsp;
                </span>
              }
              {this.state.entity2 &&
                <span id="search-status2" className="searchStatus">
                  Nájdených <strong>{this.state.entity2.eids.length}</strong> záznamov
                  pre &quot;{this.state.entity2.name}&quot;.&nbsp;
                </span>
              }
            </div>
            {this.state.connections ? (
              <div className="results container-fluid">
                {this.state.connections.map(connEid =>
                  <InfoLoader key={connEid} eid={connEid} hasConnectLine />,
                )}
              </div>
              ) : (
                <div className="beforeSearchContainer">
                  <div className="beforeSearch">
                    <h1 className="whatSearch">Zadajte dvojicu</h1>
                    <h3 className="describeFor">pre začiatok vyhľadávania.</h3>
                  </div>
                </div>
              )
            }
          </div>
        </div>
      </div>
    );
  }
}

export default PrepojeniaPage;
