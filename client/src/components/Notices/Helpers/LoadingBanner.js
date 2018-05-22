import React, {Component} from 'react'
import './LoadingBanner.css'

export default class LoadingBanner extends Component {
  render() {
    return (
      <div className="loadingBanner">
        <div className="loadingBannerContent">Načítavam dáta...</div>
      </div>
    )
  }
}
