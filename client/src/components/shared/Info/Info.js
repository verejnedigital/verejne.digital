// @flow
import React, {Fragment} from 'react'
import Circle from 'react-icons/lib/fa/circle-o'
import {Container} from 'reactstrap'
import {Link} from 'react-router-dom'
import type {Node} from 'react'

import {
  getNewFinancialData,
  icoUrl,
  ShowNumberCurrency,
  showDate,
} from '../../../services/utilities'
import {compose, withHandlers} from 'recompose'
import {connect} from 'react-redux'
import {zoomToLocation, toggleModalOpen} from '../../../actions/publicActions'
import {ENTITY_CLOSE_ZOOM} from '../../../constants'
import Contracts from './Contracts'
import Notices from './Notices'
import Eurofunds from './Eurofunds'
import Relations from './Relations'
import Trend from './Trend'
import ExternalLink from '../ExternalLink'
import mapIcon from '../../../assets/mapIcon.svg'
import type {NewEntityDetail, Center} from '../../../state'
import type {FinancialData} from '../../../services/utilities'
import './Info.css'

type OwnProps = {
  data: NewEntityDetail,
  inModal?: boolean,
  canClose?: boolean,
  onClose?: () => void,
}

type DispatchProps = {
  zoomToLocation: (center: Center, withZoom?: number) => void,
  toggleModalOpen: () => void,
}

type HandlerProps = {
  showOnMap: () => void,
}

type InfoProps = OwnProps & DispatchProps & HandlerProps

type ItemProps = {|
  children?: Node,
  label?: string,
  url?: string,
  linkText?: Node,
|}

const Item = ({children, label, url, linkText}: ItemProps) => (
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

const Findata = ({data}: {data: FinancialData}) => {
  const finances = data.finances[0] || {} // possible feature: display finances also for older years
  return (
    <Fragment>
      <Item
        label="IČO"
        url={`http://www.orsr.sk/hladaj_ico.asp?ICO=${data.ico}&SID=0`}
        // TODO link to zrsr when there is a way to tell companies and persons apart
        linkText={data.ico}
      >
        &nbsp;(<ExternalLink isMapView={false} url={icoUrl(data.ico)}>
          Detaily o firme
        </ExternalLink>)
      </Item>
      {data.established_on && <Item label="Založená">{showDate(data.established_on)}</Item>}
      {data.terminated_on && <Item label="Zaniknutá">{showDate(data.terminated_on)}</Item>}
      {finances.employees && (
        <Item label={`Zamestnanci v ${finances.year}`}>{finances.employees}</Item>
      )}
      {finances.profit ? (
        <Item
          label={`Zisk v ${finances.year}`}
          url={icoUrl(data.ico)}
          linkText={<ShowNumberCurrency num={finances.profit} />}
        >
          {finances.profitTrend ? <Trend trend={finances.profitTrend} /> : null}
        </Item>
      ) : null}
      {finances.revenue ? (
        <Item
          label={`Tržby v ${finances.year}`}
          url={icoUrl(data.ico)}
          linkText={<ShowNumberCurrency num={finances.revenue} />}
        >
          {finances.revenueTrend ? <Trend trend={finances.revenueTrend} /> : null}
        </Item>
      ) : null}
    </Fragment>
  )
}

const Info = ({data, canClose, onClose, showOnMap}: InfoProps) => (
  <Container className={canClose ? 'info closable' : 'info'}>
    <div className="info-header">
      <h3 onClick={onClose}>
        <Circle aria-hidden="true" />&nbsp;{data.name}&nbsp;
      </h3>
      <Link
        to={`/verejne?lat=${data.lat}&lng=${data.lng}&zoom=${ENTITY_CLOSE_ZOOM}`}
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
        <Item>{data.address}</Item>
        {data.companyinfo && <Findata data={getNewFinancialData(data)} />}
        {data.contracts &&
          data.contracts.price_amount_sum > 0 && (
          <Item
            label="Verejné zákazky"
            url={`http://www.otvorenezmluvy.sk/documents/search?utf8=%E2%9C%93&q=${data.name}`}
            linkText={<ShowNumberCurrency num={data.contracts.price_amount_sum} />}
          />
        )}
      </ul>
      {data.contracts && data.contracts.count > 0 && <Contracts data={data.contracts} />}
      {data.notices && data.notices.count > 0 && <Notices data={data.notices} />}
      {data.eufunds && data.eufunds.eufunds_count > 0 && <Eurofunds data={data.eufunds} />}
      {data.related.length > 0 && <Relations data={data.related} useNewApi />}
    </div>
  </Container>
)

export default compose(
  connect(null, {zoomToLocation, toggleModalOpen}),
  withHandlers({
    showOnMap: ({
      data,
      inModal,
      zoomToLocation,
      toggleModalOpen,
    }: OwnProps & DispatchProps) => () => {
      inModal && toggleModalOpen()
      zoomToLocation(data, ENTITY_CLOSE_ZOOM)
    },
  })
)(Info)
