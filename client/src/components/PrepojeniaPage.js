import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import InfoLoader from './info/InfoLoader';
import * as serverAPI from '../actions/serverAPI';

import Navigation from './Navigation';
import Search from './Search';
import './PrepojeniaPage.css';

class PrepojeniaPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      entitysearch1: (props.location && props.location.query.eid1) || '',
      entitysearch2: (props.location && props.location.query.eid2) || '',
      searching: false,
    };
    this.searchConnection = this.searchConnection.bind(this);
    this.loadEntity1 = this.loadEntity1.bind(this);
    this.loadEntity2 = this.loadEntity2.bind(this);
    this.loadConnections = this.loadConnections.bind(this);
  }

  componentWillMount() {
    this.searchConnection(this.state.entitysearch1, this.state.entitysearch2);
  }

  searchConnection(entitysearch1, entitysearch2) {
    if (entitysearch1.trim() === '' || entitysearch2.trim() === '') {
      return;
    }
    browserHistory.push({
      query: {
        eid1: entitysearch1,
        eid2: entitysearch2,
      },
    });
    this.setState({
      entitysearch1,
      entitysearch2,
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
            <Navigation />
            <Search
              entitysearch1={this.state.entitysearch1}
              entitysearch2={this.state.entitysearch2}
              searchConnection={this.searchConnection}
            />
            <div className="fbfooter">
              <hr />
              <div className="row">
                <div className="col-sm-offset-2 col-sm-10">
                  <iframe src="https://www.facebook.com/plugins/like.php?href=https%3A%2F%2Fwww.facebook.com%2Fverejne.digital&width=111&layout=button_count&action=like&size=small&show_faces=true&share=true&height=46&appId=" width="151" height="23" className="fbIframe" scrolling="no" frameBorder="0" allowTransparency="true" />
                </div>
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
