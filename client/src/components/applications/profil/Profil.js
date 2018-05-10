import React, {Component} from 'react'
import './Profil.css'
import * as serverAPI from './actions/serverAPI'
import PoliticiansList from './components/PoliticiansList'
import Search from './components/Search'
import {normalizeName} from '../../../utils'
import {Row, Col} from 'reactstrap'

class Profil extends Component {
  constructor(props) {
    super(props)
    this.state = {
      politicians: [],
      original_politicians: [],
    }
    this.loadListOfPoliticiants = this.loadListOfPoliticiants.bind(this)
    this.filterNames = this.filterNames.bind(this)
  }

  componentWillMount() {
    this.loadListOfPoliticiants()
  }

  loadListOfPoliticiants() {
    serverAPI.listPoliticians((list) => {
      this.setState({
        politicians: list,
        original_politicians: list,
      })
    })
  }

  filterNames(query) {
    query = normalizeName(query)
    const politicians = this.state.original_politicians.filter(
      (p) =>
        normalizeName(p.firstname).startsWith(query) ||
        normalizeName(p.surname).startsWith(query) ||
        normalizeName(p.party_abbreviation).indexOf(query) !== -1
    )
    this.setState({
      politicians,
    })
  }

  render() {
    return [
      <Row tag="header" key="header" className="header">
        <Col>
          <h1 className="title">
            <span className="bolder">profil</span>.verejne.digital
          </h1>
          <h3 className="sub-title">Majetok poslancov podľa priznaní a katastra</h3>
        </Col>
      </Row>,
      <Row key="search" className="search">
        <Col className="search-form">
          <Search filterNames={this.filterNames} />
        </Col>
      </Row>,
      <Row key="fb" className="fbframe">
        <Col>
          <iframe
            title="fb_like"
            src="https://www.facebook.com/plugins/like.php?href=https%3A%2F%2Fwww.facebook.com%2Fverejne.digital&width=111&layout=button_count&action=like&size=small&show_faces=true&share=true&height=46&appId="
            width="201"
            height="23"
            className="fbIframe"
            scrolling="no"
            frameBorder="0"
            allowtransparency="true"
          />
        </Col>
      </Row>,
      <Row tag="article" key="politicians">
        <Col>
          <PoliticiansList politicians={this.state.politicians} />
        </Col>
      </Row>,
    ]
  }
}

export default Profil
