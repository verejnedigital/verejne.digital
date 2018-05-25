// @flow
import React, {Component} from 'react'
import {withRouter} from 'react-router-dom'
import {parse} from 'qs'

import Search from './components/Search/Search'
import Statuses from './components/Statuses/Statuses'
import Results from './scenes/Results/Results'
import './Connexions.css'

class PrepojeniaPage extends Component {
  constructor(props) {
    super(props)
    // remove leading '?'
    const query = parse(props.location.search.substring(1))
    this.state = {
      entitySearch1: query.eid1 || '',
      entitySearch2: query.eid2 || '',
    }
  }

  searchConnection = (entitySearch1, entitySearch2) => {
    if (entitySearch1.trim() === '' || entitySearch2.trim() === '') {
      return
    }
    this.props.history.push(`/prepojenia?eid1=${entitySearch1}&eid2=${entitySearch2}`)
    this.setState({
      entitySearch1,
      entitySearch2,
    })
  }

  render() {
    const {entitySearch1, entitySearch2} = this.state
    return (
      <div className="container-fluid connexions">
        <div className="row">
          <div className="sidebar col-sm-5 col-md-4 col-lg-3">
            <div id="myAffix" data-spy="affix">
              <Search
                entitySearch1={this.state.entitySearch1}
                entitySearch2={this.state.entitySearch2}
                searchConnection={this.searchConnection}
              />
            </div>
          </div>
          <div
            className="col-sm-7 col-md-8 col-lg-9 main"
            ref={(el) => {
              this.main = el
            }}
          >
            <Statuses entitySearch1={entitySearch1} entitySearch2={entitySearch2} />
            <Results entitySearch1={entitySearch1} entitySearch2={entitySearch2} />
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(PrepojeniaPage)
