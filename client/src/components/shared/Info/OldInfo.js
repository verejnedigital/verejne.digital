import React, {Fragment} from 'react'
import Circle from 'react-icons/lib/fa/circle-o'
import {Badge, Container} from 'reactstrap'
import {Link} from 'react-router-dom'
import {compose, withHandlers} from 'recompose'
import {connect} from 'react-redux'
import {zoomToLocation, toggleModalOpen} from '../../../actions/publicActions'
import {ENTITY_CLOSE_ZOOM} from '../../../constants'
import {
  getFinancialData,
  extractIco,
  icoUrl,
  ShowNumberCurrency,
  showDate,
  isPolitician,
} from '../../../services/utilities'
import DonationsToParties from './DonationsToParties'
import SponsorshipsOfParties from './SponsorshipsOfParties'
import Relations from './Relations'
import OldContracts from './OldContracts'
import Trend from './Trend'
import ExternalLink from '../ExternalLink'
import './Info.css'
import mapIcon from '../../../assets/mapIcon.svg'

const Item = ({children, label, url, linkText}) => (
  <li className="info-item">
    {label && <strong className="info-item-label">{label}</strong>}
    {url && (
      <ExternalLink isMapView={false} url={url}>
        {linkText}
      </ExternalLink>
    )}
    {children}
  </li>
)

const Findata = ({data}) => {
  const zisk = data.hasOwnProperty('zisk16') ? data.zisk16 : data.zisk15
  const trzby = data.hasOwnProperty('trzby16') ? data.trzby16 : data.trzby15

  return (
    <Fragment>
      <Item
        label="IČO"
        url={`http://www.orsr.sk/hladaj_ico.asp?ICO=${data.ico}&SID=0`}
        linkText={data.ico}
      >
        (<ExternalLink isMapView={false} url={icoUrl(data.ico)}>
          Detaily o firme
        </ExternalLink>)
      </Item>
      {data.zaciatok && <Item label="Založená">{showDate(data.zaciatok)}</Item>}
      {data.koniec && <Item label="Zaniknutá">{showDate(data.koniec)}</Item>}
      {data.zamestnancov && <Item label="Zaniknutá">{data.zamestnancov}</Item>}
      {data.zamestnancov && <Item label="Zaniknutá">{data.zamestnancov}</Item>}
      {zisk &&
        zisk !== 0 && (
        <Item
          label="Zisk v 2016"
          url={icoUrl(data.ico)}
          linkText={<ShowNumberCurrency num={zisk} />}
        >
          {data.zisk_trend !== 0 && <Trend trend={8} />}
        </Item>
      )}
      {trzby &&
        trzby !== 0 && (
        <Item
          label="Tržby v 2016"
          url={icoUrl(data.ico)}
          linkText={<ShowNumberCurrency num={trzby} />}
        >
          {data.trzby_trend !== 0 && <Trend trend={10} />}
        </Item>
      )}
    </Fragment>
  )
}

const OldInfo = ({data, canClose, onClose, showOnMap}) => {
  const entity = data.entities[0]
  const findata = getFinancialData(data, extractIco(data))

  return (
    <Container className="info">
      <div className="info-header">
        <h3 className={`${isPolitician(data) ? 'politician' : ''}`}>
          <Circle aria-hidden="true" />&nbsp;{entity.entity_name}&nbsp;
        </h3>
        <Link
          to={`/verejne?lat=${entity.lat}&lng=${entity.lng}&zoom=${ENTITY_CLOSE_ZOOM}`}
          title="Zobraz na mape"
          onClick={showOnMap}
        >
          <img src={mapIcon} alt="MapMarker" style={{width: '16px', height: '25px'}} />
        </Link>
        {canClose && (
          <span className="info-close-button" onClick={onClose}>
            &times;
          </span>
        )}
      </div>
      <div className="info-main">
        <ul className="info-list">
          <Item>{entity.address}</Item>
          {findata.ico && <Findata data={findata} />}
          {data.zrsr_data[0] && (
            <Item
              label="IČO Živnostníka"
              url={`https://verejne.digital/zrsr.html?${data.zrsr_data[0].ico}`}
              textLink={data.zrsr_data[0].ico}
            />
          )}
          {data.total_contracts !== null &&
            data.total_contracts > 0 && (
            <Item
              label="Verejné zákazky"
              url={`http://www.otvorenezmluvy.sk/documents/search?utf8=%E2%9C%93&q=${
                entity.entity_name
              }`}
              linkText={<ShowNumberCurrency num={data.total_contracts} />}
            />
          )}
          {data.sponzori_stran_data.length >= 1 && (
            <Item label="Stranícke príspevky">
              <SponsorshipsOfParties
                entityName={entity.entity_name}
                data={data.sponzori_stran_data}
              />
            </Item>
          )}
          {data.stranicke_prispevky_data.length >= 1 && (
            <Item label="Stranícke príspevky">
              <DonationsToParties
                entityName={entity.entity_name}
                data={data.stranicke_prispevky_data}
              />
            </Item>
          )}
        </ul>
        <div className="info-badges">
          {data.advokati_data.length >= 1 && (
            <Badge
              color="info"
              href={`http://datanest.fair-play.sk/searches/quick?query_string=${
                entity.entity_name
              }`}
            >
              Advokát
            </Badge>
          )}
          {data.nadacie_data.length >= 1 && (
            <Badge
              color="info"
              href={`http://datanest.fair-play.sk/searches/quick?query_string=${
                entity.entity_name
              }`}
            >
              Nadácia
            </Badge>
          )}
          {data.auditori_data.length >= 1 && (
            <Badge
              color="info"
              href={`http://datanest.fair-play.sk/searches/quick?query_string=${
                entity.entity_name
              }`}
            >
              Auditor
            </Badge>
          )}
          {data.uzivatelia_vyhody_ludia_data.find(
            (funkcionar) => funkcionar.is_funkcionar === '1'
          ) && (
            <Badge
              color="info"
              href="http://www.transparency.sk/sk/zverejnujeme-zoznam-vlastnikov-firiem/"
            >
              Verejný funkcionár
            </Badge>
          )}
        </div>
        {data.contracts.length >= 1 && <OldContracts data={data.contracts} />}
        {data.related.length >= 1 && <Relations data={data.related} />}
      </div>
    </Container>
  )
}

export default compose(
  connect(null, {zoomToLocation, toggleModalOpen}),
  withHandlers({
    showOnMap: ({data, inModal, zoomToLocation, toggleModalOpen}) => () => {
      inModal && toggleModalOpen()
      zoomToLocation(data.entities[0], ENTITY_CLOSE_ZOOM)
    },
  })
)(OldInfo)
