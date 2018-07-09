import React from 'react'
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
  ShowNumberCurrency,
  showDate,
  isPolitician,
} from '../../Notices/utilities'
import Circle from 'react-icons/lib/fa/circle-o'
import './Info.css'

const Info = ({data, canClose, onClose}) => {
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
        {/*TODO when verejne will be completed link has to be fixed
          <Link to={`/verejne/${entity.lat}&${entity.lng}&${eid}&`}>
            <MapMarker aria-hidden="true" />
            </Link>{' '}
          */}
      </span>
      {canClose && <span style={{float: 'right', cursor: 'pointer'}} onClick={onClose}>X</span>}
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
                >
                  {findata.ico}
                </ExternalLink>
                &nbsp;(
                <ExternalLink isMapView={false} url={icoUrl(findata.ico)}>
                  Detaily o firme
                </ExternalLink>
                )
              </td>
            </tr>
          )}
          {findata.ico &&
            findata.zaciatok && (
            <tr>
              <td colSpan="2">
                <strong>Založená:</strong>&nbsp;
                <ExternalLink isMapView={false} url={icoUrl(findata.ico)}>
                  {showDate(findata.zaciatok)}
                </ExternalLink>
              </td>
            </tr>
          )}
          {findata.ico &&
            findata.koniec && (
            <tr>
              <td colSpan="2">
                <strong>Zaniknutá:</strong>&nbsp;
                <ExternalLink isMapView={false} url={icoUrl(findata.ico)}>
                  {showDate(findata.koniec)}
                </ExternalLink>
              </td>
            </tr>
          )}
          {findata.ico &&
            findata.zamestnancov && (
            <tr>
              <td colSpan="2">
                <strong>Zamestnancov:</strong>&nbsp;
                <ExternalLink isMapView={false} url={icoUrl(findata.ico)}>
                  {findata.zamestnancov}
                </ExternalLink>
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
                >
                  {data.zrsr_data[0].ico}
                </ExternalLink>
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
                  <ExternalLink isMapView={false} url={icoUrl(findata.ico)}>
                    <ShowNumberCurrency num={zisk} />
                  </ExternalLink>
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
                  <ExternalLink isMapView={false} url={icoUrl(findata.ico)}>
                    <ShowNumberCurrency num={trzby} />
                  </ExternalLink>
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
                >
                  <ShowNumberCurrency num={data.total_contracts} />
                </ExternalLink>
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
                >
                  Advokát
                </ExternalLink>
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
                >
                  Nadácia
                </ExternalLink>
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
                >
                  Auditor
                </ExternalLink>
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
                >
                  Verejný funkcionár
                </ExternalLink>
              </td>
            </tr>
          )}
          {data.related.length >= 1 && <Relations data={data.related} />}
          {data.contracts.length >= 1 && <Contracts data={data.contracts} />}
        </tbody>
      </table>
    </div>
  )
}

export default Info
