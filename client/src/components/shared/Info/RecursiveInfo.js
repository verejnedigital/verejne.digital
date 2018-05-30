import React, {Component} from 'react'
import CompanyDetails from '../../Notices/CompanyDetails'
import './RecursiveInfo.css'

class RecursiveInfo extends Component {
  componentWillMount() {
    const state = {
      extracted: false,
    }
    this.setState(state)
  }

  toggleExtract = () => {
    const stateChange = {extracted: !this.state.extracted}
    this.setState(stateChange)
  }

  render() {
    if (this.state.extracted) {
      return (
        <div className="recursive-info-wrapper">
          <div className="recursive-info">
            <CompanyDetails eid={this.props.eid} />
          </div>
        </div>
      )
    } else {
      return (
        <button
          onClick={this.toggleExtract}
          className="recursive-info-btn btn btn-link"
        >{this.props.name}</button>
      )
    }
  }
}

export default RecursiveInfo
