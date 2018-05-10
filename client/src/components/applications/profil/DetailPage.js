import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import './DetailPage.css'

import * as serverAPI from './actions/serverAPI'
import Cardboard from './components/Cardboard'
import DetailKatasterTable from './components/DetailCadastralTable'
import DetailAssetDeclaration from './components/DetailAssets'
import MapContainer from './components/MapContainer'
import {NavLink} from 'react-router-dom'
import {Row, Col} from 'reactstrap'

class DetailPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      politician: {},
      kataster: [],
      katasterAssetsFromDeclaration: [],
      hnutelnyAssetsFromDeclaration: [],
      prijmyAssetsFromDeclaration: [],
      years: [],
      currentYear: null,
      reportData: {},
      mapCenter: {lat: 48.6, lng: 19.5},
    }
  }

  componentWillMount() {
    const id = this.props.match.params.id
    this.loadPoliticiant(id)
    this.loadKataster(id)
    this.loadAssetDeclaration(id)
  }

  loadPoliticiant(id) {
    serverAPI.loadPoliticiant(id, (politician) => {
      this.setState({
        politician,
      })
    })
  }

  loadKataster(id) {
    serverAPI.katasterInfo(id, (kataster) => {
      this.setState({
        kataster,
      })
    })
  }

  goMap = (parcel) => {
    this.setState({
      mapCenter: {lat: parcel.lat, lng: parcel.lon},
    })

    const node = ReactDOM.findDOMNode(this.refs.map)
    if (node) {
      window.scrollTo(0, node.offsetTop)
    }
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
    const katasterAssetsFromDeclaration = DetailPage.splitAssets(reportYear, 'unmovable_assets')
    const hnutelnyAssetsFromDeclaration = DetailPage.splitAssets(reportYear, 'movable_assets')
    const prijmyAssetsFromDeclaration = []
    if (reportYear !== undefined) {
      const keys = ['income', 'compensations', 'other_income', 'offices_other']
      const descriptions = [
        'príjmy ',
        'paušálne náhrady',
        'ostatné príjmy',
        'počas výkonu verejnej funkcie má tieto funkcie (čl. 7 ods. 1 písm. c) u. z. 357/2004)',
      ]
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        prijmyAssetsFromDeclaration.push(`${descriptions[i]}: ${reportYear[key]}`)
      }
    }

    return {
      katasterAssetsFromDeclaration,
      hnutelnyAssetsFromDeclaration,
      prijmyAssetsFromDeclaration,
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
        katasterAssetsFromDeclaration: reportByYear[latestYear].katasterAssetsFromDeclaration,
        hnutelnyAssetsFromDeclaration: reportByYear[latestYear].hnutelnyAssetsFromDeclaration,
        prijmyAssetsFromDeclaration: reportByYear[latestYear].prijmyAssetsFromDeclaration,
        reportData: reportByYear,
        years: availableYears,
        currentYear: latestYear,
      })
    })
  }

  selectYear(year) {
    this.setState({
      currentYear: year,
      katasterAssetsFromDeclaration: this.state.reportData[year].katasterAssetsFromDeclaration,
      hnutelnyAssetsFromDeclaration: this.state.reportData[year].hnutelnyAssetsFromDeclaration,
      prijmyAssetsFromDeclaration: this.state.reportData[year].prijmyAssetsFromDeclaration,
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
      <Row tag="article" key="politician">
        <Col tag="section">
          <div className="tabs">{yearTabs}</div>
          <section>
            <DetailAssetDeclaration
              assets={this.state.katasterAssetsFromDeclaration}
              year={this.state.currentYear}
              title="Majetkové priznanie: Nehnuteľnosti"
              image={`https://verejne.digital/img/majetok/${this.state.politician.surname}_${
                this.state.politician.firstname
              }.png`}
              source={source}
            />
          </section>
          <section>
            <DetailAssetDeclaration
              assets={this.state.hnutelnyAssetsFromDeclaration}
              year={this.state.currentYear}
              title="Majetkové priznanie: Hnuteľný majetok"
              source={source}
            />
          </section>
          <section>
            <DetailAssetDeclaration
              assets={this.state.prijmyAssetsFromDeclaration}
              year={this.state.currentYear}
              title="Majetkové priznanie: ostatné"
              source={source}
            />
          </section>
        </Col>
        <Col tag="section" className="col">
          <DetailKatasterTable
            kataster={this.state.kataster}
            onParcelShow={this.goMap.bind(this)}
          />
        </Col>
      </Row>
    ) : null

    return [
      <Row tag="header" key="title" className="header">
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
      <Row key="map" className="detail-map">
        <Col>
          <MapContainer assets={this.state.kataster} center={this.state.mapCenter} ref="map" />
        </Col>
      </Row>,
    ]
  }
}

export default DetailPage
