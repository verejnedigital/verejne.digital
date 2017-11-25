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
            <h3>Majetok verejnych cinitelov podla katastra SR</h3>
          </div>
        </div>

        <div className="App-search">
          <Search/>
        </div>

        <div className="App-body">
          <Table politicians={this.state.politicians}/>        
        </div>

        <div className="App-footer">
        O projekte | <a href="https://www.facebook.com/verejne.digital/">Kontaktujte nas cez facebook</a>
        </div>
      </div>
    );
  }
}

export default App;
