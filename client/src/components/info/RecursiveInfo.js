import React, { Component } from 'react';
import InfoLoader from './InfoLoader';


class RecursiveInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      extracted: false,
    };

    this.extract = this.extract.bind(this);
    this.pack = this.pack.bind(this);
  }

  extract() {
    this.setState({ extracted: true });
  }

  pack() {
    this.setState({ extracted: false });
  }

  render() {
    if (this.state.extracted) {
      return (
        <div>
          <button onClick={this.pack}>[-]</button>
          <InfoLoader eid={this.props.eid} />
        </div>
      );
    }
    return (
      <button onClick={this.extract}>{this.props.name}</button>
    );
  }
}

export default RecursiveInfo;
