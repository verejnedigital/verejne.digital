import React, { Component } from 'react';
import './App.css';

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
      <div className="App">
        <a href="../..">profil.verejne.digital</a>
        <DetailVizitka politician={this.state.politician} />
        <DetailKatasterTable kataster={this.state.kataster} />
      </div>
    );
  }
}

export default App;
