import React, { Component } from 'react';
import './DetailPage.css';

import * as serverAPI from './actions/serverAPI';
import DetailVizitka from './components/DetailVizitka';
import DetailKatasterTable from './components/DetailKatasterTable';
import DetailAssetDeclaration from './components/DetailAssetDeclaration';
import Footer from './components/Footer';


class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      politician: {},
      kataster: [],
      assetsFromDeclaration: [],      
    };
  }

  componentWillMount() {
    const id = this.props.params.id;
    this.loadPoliticiant(id);
    this.loadKataster(id);
    this.loadAssetDeclaration(id);    
  }

  loadPoliticiant(id) {
    serverAPI.loadPoliticiant(id,
      (politician) => {
        this.setState({
          politician
        });
      });
  }

  loadKataster(id) {
    serverAPI.katasterInfo(id,
      (kataster) => {        
        this.setState({
          kataster
        });
      });
  }

  loadAssetDeclaration(id) {
    serverAPI.loadAssetDeclaration(id,
      (report) => {                        
        // Report contains asset declarations for several years.
        // TODO: Make sure it is sorted by year from the most recent to the oldest
        const assetsFromDeclaration = (typeof report[0] !== 'undefined' 
          && typeof report[0]["nehnuteľný majetok"] !== 'undefined')
            ? report[0]["nehnuteľný majetok"].split('\n') : [];
        this.setState({
          assetsFromDeclaration
        });
      });
  }

  render() {
    return (
      <div className="detail-page">
        <div className="detail-header">
          <div className="detail-navigation">
            <a href="../.." className="brand">&lt;&lt;&nbsp;profil.verejne.digital</a>
          </div>
        </div>
        <div className="detail-body">
          <DetailVizitka politician={this.state.politician} />
          <div className="data-tables">
            <DetailAssetDeclaration assets={this.state.assetsFromDeclaration} year="2016"/>
            <DetailKatasterTable kataster={this.state.kataster} />
          </div>
        </div>
        <div id = "map">      
        </div>                
        <Footer />
      </div>
    );
  }
}

export default App;
