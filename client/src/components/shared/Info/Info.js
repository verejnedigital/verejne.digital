// @flow
import React, {Fragment} from 'react'
import {Container, Row, Col} from 'reactstrap'
import {Link, NavLink} from 'react-router-dom'
import classnames from 'classnames'
import type {Node} from 'react'

import {
  getNewFinancialData,
  icoUrl,
  ShowNumberCurrency,
  showDate,
} from '../../../services/utilities'
import {compose, withHandlers} from 'recompose'
import {connect} from 'react-redux'
import {
  zoomToLocation,
  setModalOpen,
  setDrawer,
  makeLocationsSelected,
} from '../../../actions/publicActions'
import {ENTITY_CLOSE_ZOOM} from '../../../constants'
import Contracts from './Contracts'
import Notices from './Notices'
import Eurofunds from './Eurofunds'
import Relations from './Relations'
import Trend from './Trend'
import ExternalLink from '../ExternalLink'
import CircleIcon from '.././CircleIcon'
import mapIcon from '../../../assets/mapIcon.svg'
import ProfileIcon from 'react-icons/lib/fa/user'
import type {NewEntityDetail, Center} from '../../../state'
import type {FinancialData} from '../../../services/utilities'
import './Info.css'

type OwnProps = {
  data: NewEntityDetail,
  className?: string,
  inModal?: boolean,
  canClose?: boolean,
  onClose?: () => void,
}

type DispatchProps = {
  zoomToLocation: (center: Center, withZoom?: number) => void,
  setModalOpen: (boolean) => void,
  setDrawer: (boolean) => void,
  makeLocationsSelected: (points: Center[]) => void,
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

const Info = ({data, canClose, onClose, showOnMap, className}: InfoProps) => (
  <Container className={classnames(className, {closable: canClose}, 'info')}>
    <div className="info-header">
      <Row>
        <Col xs="auto" className="mt-1 pr-0">
          <CircleIcon data={data} />
        </Col>
        <Col className="pl-2">
          <h3 onClick={onClose} className="d-inline mr-1">
            {data.name}
          </h3>
          <Link
            to={`/verejne?lat=${data.lat}&lng=${data.lng}&zoom=${ENTITY_CLOSE_ZOOM}`}
            title="Zobraz na mape"
            onClick={showOnMap}
          >
            <img
              src={mapIcon}
              alt="MapMarker"
              style={{width: '16px', height: '25px'}}
              className="mb-2"
            />
          </Link>
          {data.profil_id && <NavLink to={`/profil/${data.profil_id}`} title="Zobraz profil">
            <ProfileIcon
              alt="ProfileIcon"
              style={{width: '18px', height: '25px'}}
              className="mb-2 blue"
            />
          </NavLink>}
          {canClose && (
            <span className="info-close-button" onClick={onClose}>
              &times;
            </span>
          )}
        </Col>
      </Row>
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
      {data.related.length > 0 && <Relations data={data.related} name={data.name} />}
    </div>
  </Container>
)

export default compose(
  connect(null, {makeLocationsSelected, zoomToLocation, setModalOpen, setDrawer}),
  withHandlers({
    showOnMap: ({
      data,
      inModal,
      zoomToLocation,
      setModalOpen,
      setDrawer,
      makeLocationsSelected,
    }: OwnProps & DispatchProps) => () => {
      inModal && setModalOpen(false)
      setDrawer(false)
      zoomToLocation(data, ENTITY_CLOSE_ZOOM)
      makeLocationsSelected([{lat: data.lat, lng: data.lng}])
    },
  })
)(Info)
