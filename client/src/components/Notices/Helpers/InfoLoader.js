import React, {Component} from 'react'
import Info from './Info'
import './InfoLoader.css'
import LoadingBanner from './LoadingBanner'

class InfoLoader extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: {},
      loaded: false,
    }
  }

  componentWillMount() {
    /*serverAPI.getEntityInfo(this.props.eid, (data) => {
      this.setState({
        data,
        loaded: true,
      })
    })*/
  }

  render() {
    if (this.state.loaded) {
      return (
        <div className={this.props.recursive ? 'infoWrapper' : 'infoWrapper col-md-offset-2 col-md-8 col-lg-offset-3 col-lg-6'}>
          Nemame implementovane
          <Info data={this.state.data} eid={this.props.eid} />
          {this.props.hasConnectLine && <div className="connectLine" />}
        </div>
      )
    }
    return (
      <LoadingBanner />
    )
  }
}

export default InfoLoader
