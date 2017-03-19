import React, { Component } from 'react';
import StranickePrispevky from './StranickePrispevky';
import SponzorstvoStran from './SponzorstvoStran';
import Vztahy from './Vztahy';
import Zmluvy from './Zmluvy';
import ShowTrend from './ShowTrend';
import TabLink from './TabLink';
import { getFinancialData, extractIco, icoUrl, showNumberCurrency, showDate } from '../../utility/utilities';
import './Info.css';

class Info extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showRelated: false,
      showContracts: false,
    };

    this.showHideRelated = this.showHideRelated.bind(this);
    this.showHideContracts = this.showHideContracts.bind(this);
  }

  showHideRelated() {
    this.setState({
      showRelated: !this.state.showRelated,
    });
  }

  showHideContracts() {
    this.setState({
      showContracts: !this.state.showContracts,
    });
  }

  render() {
    const { data, eid } = this.props;
    const entity = data.entities[0];
    const findata = getFinancialData(data, extractIco(data));
    return (
      <div className="result">
        <span className="entityName">
          <i className="fa fa-circle" aria-hidden="true"></i>&nbsp;
          {entity.entity_name}&nbsp;
          <a title="Zobraz na mape" target="_blank" rel="noopener noreferrer" href={`?zobraz&${entity.lat}&${entity.lng}&${eid}&`}><i className="fa fa-map-marker" aria-hidden="true"></i></a>
        </span>
        <hr />
        <table className="dataTable table table-condensed">
          <tbody>
            <tr>
              <td colSpan="2">
                {entity.address}
              </td>
            </tr>
            {findata.ico &&
              <tr>
                <td colSpan="2"><strong>IČO:</strong>&nbsp;
                  <TabLink
                    isMapView={false}
                    url={`http://www.orsr.sk/hladaj_ico.asp?ICO=${findata.ico}&SID=0`}
                    text={findata.ico}
                  />
                  &nbsp;(
                    <TabLink
                      isMapView={false}
                      url={icoUrl(findata.ico)}
                      text={'detaily o firme'}
                    />
                  )
                </td>
              </tr>
            }
            {findata.ico &&
              <tr>
                <td colSpan="2">
                  {findata.zaciatok &&
                    <span title="Vznik"><strong>Založená:</strong>&nbsp;
                      <TabLink
                        isMapView={false}
                        url={icoUrl(findata.ico)}
                        text={showDate(findata.zaciatok)}
                      />
                    </span>
                  }
                  {findata.koniec &&
                    <span title="Zánik"><strong>Zaniknutá:</strong>&nbsp;
                      <TabLink
                        isMapView={false}
                        url={icoUrl(findata.ico)}
                        text={showDate(findata.koniec)}
                      />
                    </span>
                  }
                  {findata.zamestnancov &&
                    <span title="Zamestnancov"> &#x1f464;
                      <TabLink
                        isMapView={false}
                        url={icoUrl(findata.ico)}
                        text={findata.zamestnancov}
                      />
                    </span>
                  }
                </td>
              </tr>
            }
            {data.zrsr_data.length >= 1 &&
              <tr>
                <td colSpan="2">
                  <strong>IČO Živnostníka:</strong>&nbsp;
                  <TabLink
                    isMapView={false}
                    url={`zrsr.html?${data.zrsr_data[0].ico}`}
                    text={data.zrsr_data[0].ico}
                  />
                </td>
              </tr>
            }
            {findata.ico && findata.zisk15 !== 0 &&
              <tr>
                <td colSpan="2">
                  <span><strong>Zisk v 2015:</strong>&nbsp;
                    <TabLink
                      isMapView={false}
                      url={icoUrl(findata.ico)}
                      text={showNumberCurrency(findata.zisk15)}
                    />
                  </span>
                  {findata.zisk_trend !== 0 &&
                    <span title="Trend">
                      &nbsp;(<ShowTrend trend={findata.zisk_trend} isMapView={false} />)
                    </span>
                    }
                </td>
              </tr>
              }
            {findata.ico && findata.trzby15 !== 0 &&
              <tr>
                <td colSpan="2">
                  <span><strong>Tržby v 2015:</strong>&nbsp;
                    <TabLink
                      isMapView={false}
                      url={icoUrl(findata.ico)}
                      text={showNumberCurrency(findata.trzby15)}
                    />
                  </span>
                  {findata.trzby_trend !== 0 &&
                    <span title="Trend">
                      &nbsp;(<ShowTrend trend={findata.trzby_trend} isMapView={false} />)
                    </span>
                  }
                </td>
              </tr>
            }
            {data.total_contracts !== null && data.total_contracts > 0 &&
              <tr>
                <td colSpan="2">
                  <strong>Verejné zákazky:</strong>&nbsp;
                  <TabLink
                    isMapView={false}
                    url={`http://www.otvorenezmluvy.sk/documents/search?utf8=%E2%9C%93&q=${entity.entity_name}`}
                    text={showNumberCurrency(data.total_contracts)}
                  />
                </td>
              </tr>
            }
            {data.advokati_data.length >= 1 &&
              <tr>
                <td colSpan="2">
                  <TabLink
                    isMapView={false}
                    url={`http://datanest.fair-play.sk/searches/quick?query_string=${entity.entity_name}`}
                    text={'Advokát'}
                  />
                </td>
              </tr>
            }
            {data.nadacie_data.length >= 1 &&
              <tr>
                <td colSpan="2">
                  <TabLink
                    isMapView={false}
                    url={`http://datanest.fair-play.sk/searches/quick?query_string=${entity.entity_name}`}
                    text={'Nadácia'}
                  />
                </td>
              </tr>
            }
            {data.auditori_data.length >= 1 &&
              <tr>
                <td colSpan="2">
                  <TabLink
                    isMapView={false}
                    url={`http://datanest.fair-play.sk/searches/quick?query_string=${entity.entity_name}`}
                    text={'Auditor'}
                  />
                </td>
              </tr>
            }
            {data.sponzori_stran_data.length >= 1 &&
              <tr>
                <td colSpan="2"><strong>Stranícke príspevky:</strong>
                  <SponzorstvoStran
                    entityName={entity.entity_name}
                    data={data.sponzori_stran_data}
                  />
                </td>
              </tr>
            }
            {data.stranicke_prispevky_data.length >= 1 &&
              <tr>
                <td colSpan="2"><strong>Stranícke príspevky:</strong>
                  <StranickePrispevky
                    entityName={entity.entity_name}
                    data={data.stranicke_prispevky_data}
                  />
                </td>
              </tr>
            }
            {data.uzivatelia_vyhody_ludia_data.find(funkcionar => funkcionar.is_funkcionar === '1') &&
              <tr>
                <td colSpan="2">
                  <TabLink
                    isMapView={false}
                    url={'http://www.transparency.sk/sk/zverejnujeme-zoznam-vlastnikov-firiem/'}
                    text={'Verejný funkcionár'}
                  />
                </td>
              </tr>
            }
            {data.related.length >= 1 &&
              <tr>
                <td>
                  <button
                    onClick={this.showHideRelated}
                    className="showHideBtn btn btn-link"
                  >Vzťahy</button>
                </td>
                <td className="sizeCell">
                  <strong>{data.related.length}</strong>
                  <i
                    className={this.state.showRelated ? 'fa fa-chevron-up sizeCellArrow' : 'fa fa-chevron-down sizeCellArrow'}
                    onClick={this.showHideRelated}
                    aria-hidden="true"
                  >
                  </i>
                </td>
              </tr>
            }
            {data.related.length >= 1 && this.state.showRelated &&
              <tr className="noBorder">
                <td colSpan="2">
                  <Vztahy
                    data={data.related}
                  />
                </td>
              </tr>
            }
            {data.contracts.length >= 1 &&
              <tr>
                <td>
                  <button
                    onClick={this.showHideContracts}
                    className="showHideBtn btn btn-link"
                  >Zmluvy</button>
                </td>
                <td className="sizeCell">
                  <strong>{data.contracts.length}</strong>
                  <i
                    className={this.state.showContracts ? 'fa fa-chevron-up sizeCellArrow' : 'fa fa-chevron-down sizeCellArrow'}
                    onClick={this.showHideContracts}
                    aria-hidden="true"
                  >
                  </i>
                </td>
              </tr>
            }
            { data.contracts.length >= 1 && this.state.showContracts &&
              <tr className="noBorder">
                <td colSpan="2">
                  <Zmluvy
                    data={data.contracts}
                    isMapView={false}
                  />
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    );
  }
}

export default Info;
