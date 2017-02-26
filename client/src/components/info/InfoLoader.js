import React, { Component } from 'react';
import Info from '../info/Info';
import * as serverAPI from '../../actions/serverAPI';

class InfoLoader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      loaded: false,
    };
  }

  componentWillMount() {
    serverAPI.getInfo(this.props.eid, (data) => {
      this.setState({
        data,
        loaded: true,
      });
    });
  }

  render() {
    if (this.state.loaded) {
      return (
        <Info data={this.state.data} />
      );
    }
    return (
      <div>Prebieha hľadanie</div>
    );
  }
}

export default InfoLoader;
