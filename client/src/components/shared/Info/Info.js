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
import type {EnhancedCompanyFinancial, FinancialData} from '../../../services/utilities'
import './Info.css'

type OwnProps = {
  data: NewEntityDetail,
  className?: string,
  inModal?: boolean,
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
  const {
    established_on,
    finances,
    ico,
    terminated_on
  } = data

  const lastFinances = finances[0]

  return(
    <Fragment>
      <Item
        label="IČO"
        url={`http://www.orsr.sk/hladaj_ico.asp?ICO=${ico}&SID=0`}
        // TODO link to zrsr when there is a way to tell companies and persons apart
        linkText={ico}
      >
        &nbsp;(<ExternalLink isMapView={false} url={icoUrl(ico)}>
          Detaily o firme
        </ExternalLink>)
      </Item>
      {established_on && <Item label="Založená">{showDate(established_on)}</Item>}
      {terminated_on && <Item label="Zaniknutá">{showDate(terminated_on)}</Item>}
      <Finances data={lastFinances} ico />
    </Fragment>
  )
}

const Finances = ({data, ico}: {data: EnhancedCompanyFinancial, ico: string}) => {  
  const {employees, profit, profitTrend, revenue, revenueTrend, year} = data

  return (
    <Fragment>     
      {employees && (
        <Item label={`Zamestnanci v ${year}`}>{employees}</Item>
      )} 
      {profit && (
        <Item
          label={`Zisk v ${year}`}
          url={icoUrl(ico)}
          linkText={<ShowNumberCurrency num={profit} />}
        >
          {profitTrend && <Trend trend={profitTrend} />}
        </Item>
      )}
      {revenue && (
        <Item
          label={`Tržby v ${year}`}
          url={icoUrl(ico)}
          linkText={<ShowNumberCurrency num={revenue} />}
        >
          {revenueTrend && <Trend trend={revenueTrend} />}
        </Item>
      )}
    </Fragment>
  )
}

const Info = ({data, onClose, showOnMap, className}: InfoProps) => (
  <Container className={classnames(className, {closable: Boolean(onClose)}, 'info')}>
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
          {Boolean(onClose) && (
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
