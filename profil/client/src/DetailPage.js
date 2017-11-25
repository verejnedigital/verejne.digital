import React, { Component } from 'react';
import './App.css';

import * as serverAPI from './actions/serverAPI';


class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      politician: {}
    };
    this.loadPoliticiant = this.loadPoliticiant.bind(this);
  }

  componentWillMount() {
    console.log(this.props);
    this.loadPoliticiant();
  }

  loadPoliticiant() {
    serverAPI.loadPoliticiant(this.props.params.id,
      (politician) => {
        console.log(politician);
        this.setState({
          politician
        });
      });
  }

  render() {
    return (
      <div className="App">
        <a href="../..">Home</a>
        <h2> id = {this.props.params.id}</h2>
      </div>
    );
  }
}

export default App;
