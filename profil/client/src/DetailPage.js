import React, { Component } from 'react';
import './DetailPage.css';

import * as serverAPI from './actions/serverAPI';
import DetailVizitka from './components/DetailVizitka';
import DetailKatasterTable from './components/DetailKatasterTable';


class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      politician: {},
      kataster: []
    };
    this.loadPoliticiant = this.loadPoliticiant.bind(this);
  }

  componentWillMount() {
    this.loadPoliticiant();
    this.loadKataster();
  }

  loadPoliticiant() {
    serverAPI.loadPoliticiant(this.props.params.id,
      (politician) => {
        this.setState({
          politician
        });
      });
  }

  loadKataster() {
    serverAPI.katasterInfo(this.props.params.id,
      (kataster) => {
        console.log(kataster[0]);
        this.setState({
          kataster
        });
      });
  }

  render() {
    return (
      <div className="detail-page">
        <div className="detail-header">
          <div className="detail-navigation">
            <a href="../.." className="brand">profil.verejne.digital</a>
          </div>
        </div>
        <div className="detail-body">
          <DetailVizitka politician={this.state.politician} />
          <DetailKatasterTable kataster={this.state.kataster} />
        </div>
      </div>
    );
  }
}

export default App;
