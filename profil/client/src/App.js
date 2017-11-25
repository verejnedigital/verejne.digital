import React, { Component } from 'react';
import './App.css';

import * as serverAPI from './actions/serverAPI';

import Table from './components/Table';
import Search from './components/Search';
import Footer from './components/Footer';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      politicians: [],
    };
    this.loadListOfPoliticiants = this.loadListOfPoliticiants.bind(this);
    this.filterNames = this.filterNames.bind(this);
  }

  componentWillMount() {
    this.loadListOfPoliticiants();
  }

  loadListOfPoliticiants() {
    serverAPI.listPoliticians(
      (list) => {
        this.setState({
          politicians: list,
        });
      });
  }

  filterNames(query) {
    const politicians = this.state.politicians.filter(p => p.firstname === query);
    this.setState({
      politicians
    })
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
          <Search filterNames={this.filterNames} names={this.state.politicians.map(politician => { return {
            firstname: politician.firstname, 
            surname: politician.surname}})}/>
        </div>
        <div className="App-body">
          <Table politicians={this.state.politicians}/>        
        </div>

        <Footer />
      </div>
    );
  }
}

export default App;
