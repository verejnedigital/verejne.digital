// @flow
import React from 'react'
import {Container, Row, Col} from 'reactstrap'
import {Link, NavLink} from 'react-router-dom'
import classnames from 'classnames'

import {getNewFinancialData, ShowNumberCurrency} from '../../../services/utilities'
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
import Findata from './Findata'
import Item from './Item'
import Relations from './Relations'
import CircleIcon from '.././CircleIcon'
import mapIcon from '../../../assets/mapIcon.svg'
import ProfileIcon from 'react-icons/lib/fa/user'
import type {NewEntityDetail, Center} from '../../../state'
import './Info.css'

type OwnProps = {
  data: NewEntityDetail,
  className?: string,
  inModal?: boolean,
  onClose?: () => void,
  active?: boolean,
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

const Info = ({data, onClose, showOnMap, index, active, className}: InfoProps) => (
  <Container
    className={classnames(
      className,
      {closable: Boolean(onClose), active, index: Boolean(index)},
      'info'
    )}
  >
    {index && <span className="search-box-index">{index}</span>}
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
            <img src={mapIcon} alt="" style={{width: '16px', height: '25px'}} className="mb-2" />
          </Link>
          {data.profil_id && (
            <NavLink to={`/profil/${data.profil_id}`} title="Zobraz profil">
              <ProfileIcon
                alt="ProfileIcon"
                style={{width: '18px', height: '25px'}}
                className="mb-2 blue"
              />
            </NavLink>
          )}
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
        {data.contracts && data.contracts.price_amount_sum > 0 && (
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
  connect(
    null,
    {makeLocationsSelected, zoomToLocation, setModalOpen, setDrawer}
  ),
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
