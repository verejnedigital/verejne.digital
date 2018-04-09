import React, { Component } from 'react';
import Info from '../info/Info';
import * as serverAPI from '../../actions/serverAPI';
import './ClickLoader.css';
import LoadingBanner from "./LoadingBanner";

export default class ClickLoader extends Component {

  static defaultProps = {
    eid: null,
    children: 'Načítať info'
  };

  constructor(props) {
    super(props);
    this.state = {
      data: null,
      loading: false
    };
    this.loadData = this.loadData.bind(this);
  }

  loadData() {
      if (this.state.data === null) {
          this.setState({
              loading: true,
          });
          serverAPI.getEntityInfo(this.props.eid, (data) => {
              this.setState({
                  data,
                  loading: false,
              });
          });
      }
  }

  render() {
    if (this.state.data !== null) {
      return (
        <div className={this.props.recursive ? 'infoWrapper' : 'infoWrapper col-md-offset-2 col-md-8 col-lg-offset-3 col-lg-6'}>
          <Info data={this.state.data} eid={this.props.eid} />
          {this.props.hasConnectLine && <div className="connectLine" />}
        </div>
      );
    }

    if (this.state.loading) {
      return (
        <div>{this.props.children}
          <LoadingBanner/>
        </div>
      );
    }

    return (
        <a className="cursor-pointer" onClick={this.loadData}>{this.props.children}</a>
    );
  }
}
