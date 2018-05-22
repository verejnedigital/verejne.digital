import React, {Component} from 'react'
import InfoLoader from './InfoLoader'
import './RecursiveInfo.css'

class RecursiveInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {
      extracted: false,
    }
  }

  extract = () => {
    this.setState({extracted: true})
  }

  pack = () => {
    this.setState({extracted: false})
  }

  render() {
    if (this.state.extracted) {
      return (
        <div className="recursiveInfoWrapper">
          A Co toto?
          <button onClick={this.pack} className="btn btn-link">[-]</button>
          <div className="recursiveInfo">
            <InfoLoader eid={this.props.eid} recursive />
          </div>
        </div>
      )
    }
    return (
      <button
        onClick={this.extract}
        className="recursiveInfoBtn btn btn-link"
      >{this.props.name}</button>
    )
  }
}

export default RecursiveInfo
