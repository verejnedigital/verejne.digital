import React, { Component } from 'react';
import './App.css';

import Table from './components/Table';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <div className="App-title">
            <h1>profil.verejne.digital</h1>
            <h3>Majetok verejnych cinitelov podla katastra SR</h3>
          </div>
        </div>

        <div className="App-body">
          <Table/>        
        </div>
      </div>
    );
  }
}

export default App;
