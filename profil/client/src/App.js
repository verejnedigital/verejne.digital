import React, { Component } from 'react';
import './App.css';

import * as serverAPI from './actions/serverAPI';

import Table from './components/Table';
import Search from './components/Search';
import Footer from './components/Footer';
import Navigation from './components/Navigation';
import DetailPage from './DetailPage';

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
    return (this.props.params.splat.length > 0 && this.props.params.splat !== "profil" && this.props.params.splat !== "profil/") ?
     (<DetailPage id={this.props.params.splat.replace("profil/", "").replace("?", "")} />) :
     (
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
        <div className="fbframe">
            <iframe title="fb_like" src="https://www.facebook.com/plugins/like.php?href=https%3A%2F%2Fwww.facebook.com%2Fverejne.digital&width=111&layout=button_count&action=like&size=small&show_faces=true&share=true&height=46&appId=" width="201" height="23" className="fbIframe" scrolling="no" frameBorder="0" allowtransparency="true" />
        </div>
        <div className="App-body">
          <Table politicians={this.state.politicians}/>        
        </div>        
      </div>
    );
  }
}

export default App;
