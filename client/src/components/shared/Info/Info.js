import React, {Component} from 'react'
import DonationsToParties from './DonationsToParties'
import SponsorshipsOfParties from './SponsorshipsOfParties'
import Relations from './Relations'
import Contracts from './Contracts'
import Trend from './Trend'
import ExternalLink from '../ExternalLink'
import {
  getFinancialData,
  extractIco,
  icoUrl,
  showNumberCurrency,
  showDate,
  isPolitician,
} from '../../Notices/utilities'
import Circle from 'react-icons/lib/fa/circle-o'
import MapMarker from 'react-icons/lib/fa/map-marker'
import ChevronUp from 'react-icons/lib/fa/chevron-up'
import ChevronDown from 'react-icons/lib/fa/chevron-down'
import {Link} from 'react-router-dom'
import './Info.css'

class Info extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showRelated: false,
      showContracts: false,
    }
  }

  showHideRelated = () => {
    this.setState({
      showRelated: !this.state.showRelated,
    })
  }

  showHideContracts = () => {
    this.setState({
      showContracts: !this.state.showContracts,
    })
  }

  render() {
    const {data, eid} = this.props
    const entity = data.entities[0]
    const findata = getFinancialData(data, extractIco(data))
    const zisk = findata.hasOwnProperty('zisk16') ? findata.zisk16 : findata.zisk15
    const trzby = findata.hasOwnProperty('trzby16') ? findata.trzby16 : findata.trzby15
    return (
      <div className="result">
        <span className="entityName">
          <span className={`${isPolitician(data) ? 'politician' : ''}`}>
            <Circle aria-hidden="true" />&nbsp;{entity.entity_name}&nbsp;
          </span>
          <Link to={`/verejne/${entity.lat}&${entity.lng}&${eid}&`}> //TODO when verejne will be completed link has to be fixed
            <MapMarker aria-hidden="true" />
          </Link>{' '}
        </span>
        <hr />
        <table className="infoDataTable table table-condensed">
          <tbody>
            <tr>
              <td colSpan="2">{entity.address}</td>
            </tr>
            {findata.ico && (
              <tr>
                <td colSpan="2">
                  <strong>IČO:</strong>&nbsp;
                  <ExternalLink
                    isMapView={false}
                    url={`http://www.orsr.sk/hladaj_ico.asp?ICO=${findata.ico}&SID=0`}
                    text={findata.ico}
                  />
                  &nbsp;(
                  <ExternalLink
                    isMapView={false}
                    url={icoUrl(findata.ico)}
                    text={'detaily o firme'}
                  />
                  )
                </td>
              </tr>
            )}
            {findata.ico &&
              findata.zaciatok && (
              <tr>
                <td colSpan="2">
                  <strong>Založená:</strong>&nbsp;
                  <ExternalLink
                    isMapView={false}
                    url={icoUrl(findata.ico)}
                    text={showDate(findata.zaciatok)}
                  />
                </td>
              </tr>
            )}
            {findata.ico &&
              findata.koniec && (
              <tr>
                <td colSpan="2">
                  <strong>Zaniknutá:</strong>&nbsp;
                  <ExternalLink
                    isMapView={false}
                    url={icoUrl(findata.ico)}
                    text={showDate(findata.koniec)}
                  />
                </td>
              </tr>
            )}
            {findata.ico &&
              findata.zamestnancov && (
              <tr>
                <td colSpan="2">
                  <strong>Zamestnancov:</strong>&nbsp;
                  <ExternalLink
                    isMapView={false}
                    url={icoUrl(findata.ico)}
                    text={findata.zamestnancov}
                  />
                </td>
              </tr>
            )}
            {data.zrsr_data.length >= 1 && (
              <tr>
                <td colSpan="2">
                  <strong>IČO Živnostníka:</strong>&nbsp;
                  <ExternalLink
                    isMapView={false}
                    url={`https://verejne.digital/zrsr.html?${data.zrsr_data[0].ico}`}
                    text={data.zrsr_data[0].ico}
                  />
                </td>
              </tr>
            )}
            {findata.ico &&
              zisk !== undefined &&
              zisk !== 0 && (
              <tr>
                <td colSpan="2">
                  <span>
                    <strong>Zisk v 2016:</strong>&nbsp;
                    <ExternalLink
                      isMapView={false}
                      url={icoUrl(findata.ico)}
                      text={showNumberCurrency(zisk)}
                    />
                  </span>
                  {findata.zisk_trend !== 0 && <Trend trend={8} />}
                </td>
              </tr>
            )}
            {findata.ico &&
              trzby !== undefined &&
              trzby !== 0 && (
              <tr>
                <td colSpan="2">
                  <span>
                    <strong>Tržby v 2016:</strong>&nbsp;
                    <ExternalLink
                      isMapView={false}
                      url={icoUrl(findata.ico)}
                      text={showNumberCurrency(trzby)}
                    />
                  </span>
                  {findata.trzby_trend !== 0 && <Trend trend={10} />}
                </td>
              </tr>
            )}
            {data.total_contracts !== null &&
              data.total_contracts > 0 && (
              <tr>
                <td colSpan="2">
                  <strong>Verejné zákazky:</strong>&nbsp;
                  <ExternalLink
                    isMapView={false}
                    url={`http://www.otvorenezmluvy.sk/documents/search?utf8=%E2%9C%93&q=${
                      entity.entity_name
                    }`}
                    text={showNumberCurrency(data.total_contracts)}
                  />
                </td>
              </tr>
            )}
            {data.advokati_data.length >= 1 && (
              <tr>
                <td colSpan="2">
                  <ExternalLink
                    isMapView={false}
                    url={`http://datanest.fair-play.sk/searches/quick?query_string=${
                      entity.entity_name
                    }`}
                    text={'Advokát'}
                  />
                </td>
              </tr>
            )}
            {data.nadacie_data.length >= 1 && (
              <tr>
                <td colSpan="2">
                  <ExternalLink
                    isMapView={false}
                    url={`http://datanest.fair-play.sk/searches/quick?query_string=${
                      entity.entity_name
                    }`}
                    text={'Nadácia'}
                  />
                </td>
              </tr>
            )}
            {data.auditori_data.length >= 1 && (
              <tr>
                <td colSpan="2">
                  <ExternalLink
                    isMapView={false}
                    url={`http://datanest.fair-play.sk/searches/quick?query_string=${
                      entity.entity_name
                    }`}
                    text={'Auditor'}
                  />
                </td>
              </tr>
            )}
            {data.sponzori_stran_data.length >= 1 && (
              <tr>
                <td colSpan="2">
                  <strong>Stranícke príspevky:</strong>
                  <SponsorshipsOfParties
                    entityName={entity.entity_name}
                    data={data.sponzori_stran_data}
                  />
                </td>
              </tr>
            )}
            {data.stranicke_prispevky_data.length >= 1 && (
              <tr>
                <td colSpan="2">
                  <strong>Stranícke príspevky:</strong>
                  <DonationsToParties
                    entityName={entity.entity_name}
                    data={data.stranicke_prispevky_data}
                  />
                </td>
              </tr>
            )}
            {data.uzivatelia_vyhody_ludia_data.find(
              (funkcionar) => funkcionar.is_funkcionar === '1'
            ) && (
              <tr>
                <td colSpan="2">
                  <ExternalLink
                    isMapView={false}
                    url={'http://www.transparency.sk/sk/zverejnujeme-zoznam-vlastnikov-firiem/'}
                    text={'Verejný funkcionár'}
                  />
                </td>
              </tr>
            )}
            {data.related.length >= 1 && (
              <tr>
                <td>
                  <button onClick={this.showHideRelated} className="showHideBtn btn btn-link">
                    Vzťahy
                  </button>
                </td>
                <td className="sizeCell">
                  <strong>{data.related.length}</strong>
                  {this.state.showRelated ? (
                    <ChevronUp
                      className="sizeCellArrow"
                      onClick={this.showHideRelated}
                      aria-hidden="true"
                    />
                  ) : (
                    <ChevronDown
                      className="sizeCellArrow"
                      onClick={this.showHideRelated}
                      aria-hidden="true"
                    />
                  )}
                </td>
              </tr>
            )}
            {data.related.length >= 1 &&
              this.state.showRelated && (
              <tr className="noBorder">
                <td colSpan="2">
                  <Relations data={data.related} />
                </td>
              </tr>
            )}
            {data.contracts.length >= 1 && (
              <tr>
                <td>
                  <button onClick={this.showHideContracts} className="showHideBtn btn btn-link">
                    Zmluvy
                  </button>
                </td>
                <td className="sizeCell">
                  <strong>{data.contracts.length}</strong>
                  {this.state.showContracts ? (
                    <ChevronUp
                      className="sizeCellArrow"
                      onClick={this.showHideContracts}
                      aria-hidden="true"
                    />
                  ) : (
                    <ChevronDown
                      className="sizeCellArrow"
                      onClick={this.showHideContracts}
                      aria-hidden="true"
                    />
                  )}
                </td>
              </tr>
            )}
            {data.contracts.length >= 1 &&
              this.state.showContracts && (
              <tr className="noBorder">
                <td colSpan="2">
                  <Contracts data={data.contracts} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    )
  }
}

export default Info
