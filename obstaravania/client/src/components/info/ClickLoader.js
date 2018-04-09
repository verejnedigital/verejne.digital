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
      showData: false
    };
    this.loadData = this.loadData.bind(this);
    this.closeHandler = this.closeHandler.bind(this);
  }

  loadData() {
      this.setState({
          showData: true,
      });
      if (this.state.data === null) {
          serverAPI.getEntityInfo(this.props.eid, (data) => {
              this.setState({
                  data
              });
          });
      }
  }

  closeHandler() {
      this.setState({
          showData: false,
      });
  }

  render() {
    if (this.state.showData && this.state.data === null) {
        return (
            <div>{this.props.children}
                <LoadingBanner />
            </div>
        );
    }

    if (this.state.showData && this.state.data !== null) {
      return (
        <div className={this.props.recursive ? 'infoWrapper' : 'infoWrapper col-md-offset-2 col-md-8 col-lg-offset-3 col-lg-6'}>
          <Info data={this.state.data} eid={this.props.eid} onClose={this.closeHandler}/>
          {this.props.hasConnectLine && <div className="connectLine" />}
        </div>
      );
    }

    return (
        <a className="cursor-pointer" onClick={this.loadData}>{this.props.children}</a>
    );
  }
}
