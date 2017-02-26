import React, { Component } from 'react';
import InfoLoader from './InfoLoader';


class RecursiveInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      extracted: false,
    };

    this.extract = this.extract.bind(this);
  }

  extract() {
    this.setState({ extracted: true });
  }

  render() {
    if (this.state.extracted) {
      return <InfoLoader eid={this.props.eid} />;
    }
    return (
      <button onClick={this.extract}>{this.props.name}</button>
    );
  }
}

export default RecursiveInfo;
