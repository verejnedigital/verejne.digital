// @flow
import React, {Component} from 'react'
import {withRouter} from 'react-router-dom'
import {get} from 'lodash/fp'
// import InfoLoader from './info/InfoLoader'
// import Subgraph from './Subgraph'

import Search from './components/Search/Search'
import './Connexions.css'

class PrepojeniaPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      entitySearch1: get(['location', 'query', 'eid1'], props) || '',
      entitySearch2: get(['location', 'query', 'eid2'], props) || '',
      namesCache: {},
      searching: false,
    }
  }

  searchConnection = (entitySearch1, entitySearch2) => {
    if (entitySearch1.trim() === '' || entitySearch2.trim() === '') {
      return
    }
    this.props.history.push(`/prepojenia?eid1=${entitySearch1}&eid2=${entitySearch2}`)
    this.setState({
      entitySearch1,
      entitySearch2,
      searching: true,
      connections: [],
    })
  }

  translateZaznam(count, onClickMethod) {
    const button = <strong onClick={onClickMethod}>{count}</strong>
    if (count === 1) {
      return <span>Nájdený {button} záznam</span>
    } else if (count > 1 && count < 5) {
      return <span>Nájdené {button} záznamy</span>
    }
    return <span>Nájdených {button} záznamov</span>
  }

  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="sidebar col-sm-5 col-md-4 col-lg-3">
            <div id="myAffix" data-spy="affix">
              <Search
                entitySearch1={this.state.entitySearch1}
                entitySearch2={this.state.entitySearch2}
                searchConnection={this.searchConnection}
              />
            </div>
          </div>
          <div
            className="col-sm-7 col-md-8 col-lg-9 main"
            ref={(el) => {
              this.main = el
            }}
          >
            <div className="statuses">
              {this.state.searching
                ? 'Prebieha hľadanie prepojenia ...'
                : this.state.connections &&
                  (this.state.connections.length > 0 ? (
                    <span id="search-status" className="searchStatus">
                      Dĺžka prepojenia: <strong>{this.state.connections.length - 1}</strong>.&nbsp;
                    </span>
                  ) : (
                    <span id="search-status" className="searchStatus">
                      Prepojenie neexistuje.&nbsp;
                    </span>
                  ))}
              {this.state.entity1 && (
                <span id="search-status1" className="searchStatus">
                  {this.translateZaznam(this.state.entity1.eids.length, () =>
                    this.showAlternatives('entity1')
                  )}{' '}
                  pre &quot;{this.state.entity1.name}&quot;.&nbsp;
                </span>
              )}
              {this.state.entity2 && (
                <span id="search-status2" className="searchStatus">
                  {this.translateZaznam(this.state.entity2.eids.length, () =>
                    this.showAlternatives('entity2')
                  )}{' '}
                  pre &quot;{this.state.entity2.name}&quot;.&nbsp;
                </span>
              )}
              {this.state.entity1 &&
                this.state.entity1.eids &&
                this.state.entity1.eids.map((eid) => (
                  <span key={eid.eid}>{this.state.namesCache[eid.eid]}</span>
                ))}
              {this.state.entity2 &&
                this.state.entity2.eids &&
                this.state.entity2.eids.map((eid) => (
                  <span key={eid.eid}>{this.state.namesCache[eid.eid]}</span>
                ))}
            </div>
            {/*this.state.connections && this.state.connections.length > 0 ? (
              <div className="results container-fluid">
                {this.props.location.query.graph ? (
                  <Subgraph eids_A={this.state.entity1.eids} eids_B={this.state.entity2.eids} />
                ) : (
                  ''
                )}
                {this.state.connections.map((connEid) => (
                  <InfoLoader key={connEid} eid={connEid} hasConnectLine />
                ))}
              </div>
            ) : (
              <div className="beforeResultsContainer">
                <div className="beforeResults">
                  <h1 className="whatSearch">Zadajte dvojicu</h1>
                  <h3 className="describeFor">pre začiatok vyhľadávania.</h3>
                </div>
              </div>
            )*/}
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(PrepojeniaPage)
