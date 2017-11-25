import React, { Component } from 'react';
import './App.css';

import * as serverAPI from './actions/serverAPI';

import Table from './components/Table';
import Search from './components/Search';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      searching: false,
      politicians: [],
    };
    this.loadListOfPoliticiants = this.loadListOfPoliticiants.bind(this);
  }

  componentWillMount() {
    this.loadListOfPoliticiants();
  }

  loadListOfPoliticiants() {
    serverAPI.listPoliticians(
      (list) => {
        this.setState({
          politicians: list,
          searching: false,
        });
      });
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <div className="App-title">
            <h1>profil.verejne.digital</h1>
            <h3>Majetok verejných činiteľov podľa katastra SR</h3>
          </div>
        </div>

        <div className="App-search">
          <Search/>
        </div>

        <div className="App-body">
          <Table politicians={this.state.politicians}/>        
        </div>

        <div className="App-footer">
        O projekte | <a href="https://www.facebook.com/verejne.digital/">Kontaktujte nás cez facebook</a>
        </div>
      </div>
    );
  }
}

export default App;
