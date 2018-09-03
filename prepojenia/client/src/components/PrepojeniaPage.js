import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import InfoLoader from './info/InfoLoader';
import Subgraph from './Subgraph';
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
      namesCache: {},
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
      ...this.props.location,
      query: {
        eid1: entitysearch1,
        eid2: entitysearch2,
        graph: this.props.location.query.graph,
      },
    });
    this.setState({
      entitysearch1,
      entitysearch2,
      searching: true,
      connections: [],
    }, this.loadEntity1);

    if (this.main) {
      this.main.scrollIntoView({
        behavior: 'smooth',
      });
    }
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

  translateZaznam(count, onClickMethod) {
    const button = <strong onClick={onClickMethod}>{count}</strong>;
    if (count === 1) {
      return <span>Nájdený {button} záznam</span>;
    } else if (count > 1 && count < 5) {
      return <span>Nájdené {button} záznamy</span>;
    }
    return <span>Nájdených {button} záznamov</span>;
  }

  showAlternatives(entity) {
    this.loadAlternativeEid(this.state[entity].eids);
  }

  loadAlternativeEid(eids) {
    eids.map(eid =>
      !this.state.namesCache[eid.eid] &&
        this.setState({
          namesCache: {
            ...this.state.namesCache,
            [eid.eid]: 'loading',
          },
        }, () =>
          serverAPI.getInfo(eid.eid, (data) => {
            this.setState({
              namesCache: {
                ...this.state.namesCache,
                [eid.eid]: data.entities[0].entity_name,
              },
            });
          }),
      ),
    );
  }

  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="sidebar col-sm-5 col-md-4 col-lg-3">
            <div id="myAffix" data-spy="affix">
              <Navigation />
              <Search
                entitysearch1={this.state.entitysearch1}
                entitysearch2={this.state.entitysearch2}
                searchConnection={this.searchConnection}
              />
              <div className="fbfooter">
                <hr />
                <div className="row">
                  <div className="col-sm-offset-2 col-sm-10 col-xs-offset-2 col-xs-10">
                    <iframe src="https://www.facebook.com/plugins/like.php?href=https%3A%2F%2Fwww.facebook.com%2Fverejne.digital&width=111&layout=button_count&action=like&size=small&show_faces=true&share=true&height=46&appId=" width="200" height="23" className="fbIframe" scrolling="no" frameBorder="0" allowTransparency="true" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-sm-7 col-md-8 col-lg-9 main" ref={(el) => { this.main = el; }}>
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
                  {this.translateZaznam(this.state.entity1.eids.length, () => this.showAlternatives('entity1'))} pre
                  &quot;{this.state.entity1.name}&quot;.&nbsp;
                </span>
              }
              {this.state.entity2 &&
                <span id="search-status2" className="searchStatus">
                  {this.translateZaznam(this.state.entity2.eids.length, () => this.showAlternatives('entity2'))} pre
                  &quot;{this.state.entity2.name}&quot;.&nbsp;
                </span>
              }
              {this.state.entity1 && this.state.entity1.eids &&
                this.state.entity1.eids.map(eid =>
                  <span key={eid.eid}>{this.state.namesCache[eid.eid]}</span>,
              )}
              {this.state.entity2 && this.state.entity2.eids &&
                this.state.entity2.eids.map(eid =>
                  <span key={eid.eid}>{this.state.namesCache[eid.eid]}</span>,
              )}
            </div>
            {this.state.connections && this.state.connections.length > 0 ? (
              <div className="results container-fluid">
                {this.props.location.query.graph ? <Subgraph eids_A={this.state.entity1.eids} eids_B={this.state.entity2.eids} /> : ''}
                {this.state.connections.map(connEid =>
                  <InfoLoader key={connEid} eid={connEid} hasConnectLine />,
                )}
              </div>
              ) : (
                <div className="beforeResultsContainer">
                  <div className="beforeResults">
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
