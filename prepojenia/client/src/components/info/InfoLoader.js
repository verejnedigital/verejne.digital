import React, { Component } from 'react';
import Info from '../info/Info';
import * as serverAPI from '../../actions/serverAPI';
import './InfoLoader.css';

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
        <div className="infoWrapper col-md-offset-2 col-md-8 col-lg-offset-3 col-lg-6">
          <Info data={this.state.data} eid={this.props.eid} />
          {this.props.hasConnectLine && <div className="connectLine"></div>}
        </div>
      );
    }
    return (
      <div className="resultLoading">Prebieha hľadanie...</div>
    );
  }
}

export default InfoLoader;
