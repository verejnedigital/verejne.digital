import React, { Component } from 'react';
import './LoadingBanner.css';

export default class LoadingBanner extends Component {
  render() {
    return (
      <div className="content">
        <div className="resultLoading">Načítavam dáta...</div>
      </div>
    );
  }
}
