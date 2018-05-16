import React, {Component} from 'react'
import {keys, descriptions} from '../../constants'
import './DetailPage.css'

import * as serverAPI from './actions/serverAPI'
import Cardboard from './components/Cardboard'
import DetailCadastralTable from './components/DetailCadastralTable'
import DetailAsset from './components/DetailAssets'
import MapContainer from './components/MapContainer'
import {NavLink} from 'react-router-dom'
import {Row, Col} from 'reactstrap'

class DetailPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      politician: {},
      cadastral: [],
      cadastralAssetsFromDeclaration: [],
      movableAssetsFromDeclaration: [],
      incomeAssetsFromDeclaration: [],
      years: [],
      currentYear: null,
      reportData: {},
      mapCenter: {lat: 48.6, lng: 19.5},
    }
  }

  componentWillMount() {
    const id = this.props.match.params.id
    this.loadPoliticiant(id)
    this.loadCadastral(id)
    this.loadAssetDeclaration(id)
  }

  loadPoliticiant(id) {
    serverAPI.loadPoliticiant(id, (politician) => {
      this.setState({
        politician,
      })
    })
  }

  loadCadastral(id) {
    serverAPI.cadastralInfo(id, (cadastral) => {
      this.setState({
        cadastral,
      })
    })
  }

  goMap = (parcel) => {
    this.setState({
      mapCenter: {lat: parcel.lat, lng: parcel.lon},
    })
  }

  static splitAssets(obj, splitStr) {
    if (obj !== undefined && obj[splitStr] !== undefined) {
      return obj[splitStr].split('\n')
    } else {
      return []
    }
  }

  static parseReport(reportYear) {
    // Report contains asset declarations for several years.
    const cadastralAssetsFromDeclaration = DetailPage.splitAssets(reportYear, 'unmovable_assets')
    const movableAssetsFromDeclaration = DetailPage.splitAssets(reportYear, 'movable_assets')
    const incomeAssetsFromDeclaration = []
    if (reportYear !== undefined) {
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        incomeAssetsFromDeclaration.push(`${descriptions[i]}: ${reportYear[key]}`)
      }
    }

    return {
      cadastralAssetsFromDeclaration,
      movableAssetsFromDeclaration,
      incomeAssetsFromDeclaration,
    }
  }

  loadAssetDeclaration(id) {
    serverAPI.loadAssetDeclaration(id, (report) => {
      const reportByYear = {}
      let latestYear = null
      const availableYears = []
      for (let i = 0; i < report.length; i++) {
        availableYears.push(report[i].year)
        reportByYear[report[i].year] = DetailPage.parseReport(report[i])
      }

      availableYears.sort().reverse()
      if (availableYears.length > 0) {
        latestYear = availableYears[0]
      }

      this.setState({
        cadastralAssetsFromDeclaration: reportByYear[latestYear].cadastralAssetsFromDeclaration,
        movableAssetsFromDeclaration: reportByYear[latestYear].movableAssetsFromDeclaration,
        incomeAssetsFromDeclaration: reportByYear[latestYear].incomeAssetsFromDeclaration,
        reportData: reportByYear,
        years: availableYears,
        currentYear: latestYear,
      })
    })
  }

  selectYear(year) {
    this.setState({
      currentYear: year,
      cadastralAssetsFromDeclaration: this.state.reportData[year].cadastralAssetsFromDeclaration,
      movableAssetsFromDeclaration: this.state.reportData[year].movableAssetsFromDeclaration,
      incomeAssetsFromDeclaration: this.state.reportData[year].incomeAssetsFromDeclaration,
    })
  }

  render() {
    const yearTabs = []
    for (let i = 0; i < this.state.years.length; i++) {
      let className = 'tab'
      if (this.state.currentYear === this.state.years[i]) {
        className = 'tab active'
      }
      yearTabs.push(
        <span
          className={className}
          key={this.state.years[i]}
          onClick={this.selectYear.bind(this, this.state.years[i])}
        >
          {this.state.years[i]}
        </span>
      )
    }

    let source = 'http://www.nrsr.sk'
    if (this.state.currentYear !== null && this.state.reportData[this.state.currentYear].source) {
      source = this.state.reportData[this.state.currentYear].source
    }

    const politician = this.state.politician.surname ? (
      <Row tag="article" key="politician" className="profile">
        <Col tag="section">
          <div className="profile-tabs">{yearTabs}</div>
          <section>
            <DetailAsset
              assets={this.state.cadastralAssetsFromDeclaration}
              year={this.state.currentYear}
              title="Majetkové priznanie: Nehnuteľnosti"
              image={`https://verejne.digital/img/majetok/${this.state.politician.surname}_${
                this.state.politician.firstname
              }.png`}
              source={source}
            />
          </section>
          <section>
            <DetailAsset
              assets={this.state.movableAssetsFromDeclaration}
              year={this.state.currentYear}
              title="Majetkové priznanie: Hnuteľný majetok"
              source={source}
            />
          </section>
          <section>
            <DetailAsset
              assets={this.state.incomeAssetsFromDeclaration}
              year={this.state.currentYear}
              title="Majetkové priznanie: ostatné"
              source={source}
            />
          </section>
        </Col>
        <Col tag="section">
          <DetailCadastralTable cadastral={this.state.cadastral} onParcelShow={this.goMap} />
        </Col>
      </Row>
    ) : null

    return [
      <Row tag="header" key="title" className="header profile-header">
        <Col>
          <h1 className="title">
            <NavLink to="/profil">
              <span className="bolder">profil</span>.verejne.digital
            </NavLink>
          </h1>
        </Col>
      </Row>,
      <Cardboard key="cardboard" politician={this.state.politician} />,
      politician,
      <Row key="map" className="profile-map">
        <Col>
          <MapContainer assets={this.state.cadastral} center={this.state.mapCenter} ref="map" />
        </Col>
      </Row>,
    ]
  }
}

export default DetailPage
