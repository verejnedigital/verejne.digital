import React, {Component} from 'react'
import './Profil.css'
import './common.css'
import * as serverAPI from './actions/serverAPI'
import PoliticiansList from './components/PoliticiansList'
import Search from './components/Search'
import {normalizeName} from '../../utils'
import {FACEBOOK_LIKE_SRC} from '../../constants'
import {Row, Col, Container} from 'reactstrap'

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
    return (
      <Container className="Profile">
        <Row tag="header" key="header" className="header profile-header">
          <Col>
            <h1 className="title">
              <span className="bolder">profil</span>.verejne.digital
            </h1>
            <h3 className="sub-title">Majetok poslancov podľa priznaní a katastra</h3>
          </Col>
        </Row>
        <Row key="search" className="profile-search">
          <Col className="search-form">
            <Search filterNames={this.filterNames} />
          </Col>
        </Row>
        <Row key="fb" className="profile-fbframe">
          <Col>
            <iframe
              title="fb_like"
              src={FACEBOOK_LIKE_SRC}
              width="201"
              height="23"
              className="fbIframe"
              scrolling="no"
              frameBorder="0"
            />
          </Col>
        </Row>
        <Row tag="article" key="politicians" className="profile">
          <Col>
            <PoliticiansList politicians={this.state.politicians} />
          </Col>
        </Row>
      </Container>
    )
  }
}

export default Profil
