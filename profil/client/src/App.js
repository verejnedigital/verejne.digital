import React, { Component } from 'react';
import './App.css';

import * as serverAPI from './actions/serverAPI';

import Table from './components/Table';
import Search from './components/Search';
import Footer from './components/Footer';
import Navigation from './components/Navigation';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      politicians: [],
      original_politicians: [],     
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
          original_politicians : list,
        });
      });
  }  

  filterNames(query) {
    query = query.toLowerCase();    
    const politicians = this.state.original_politicians.filter(p => 
      (p.firstname.toLowerCase().startsWith(query) || p.surname.toLowerCase().startsWith(query) || p.party_abbreviation.toLowerCase() === query));    
    this.setState({
      politicians : politicians, 
    })
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <Navigation />
          <div className="App-title">                                  
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
