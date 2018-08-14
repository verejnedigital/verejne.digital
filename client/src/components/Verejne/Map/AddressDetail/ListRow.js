import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'recompose'
import {withDataProviders} from 'data-provider'
import CircleIcon from 'react-icons/lib/fa/circle-o'
import {ListGroupItem} from 'reactstrap'
import { icoUrl, showDate, } from '../../../Notices/utilities'
import ExternalLink from '../../../shared/ExternalLink'
import {toggleEntityInfo} from '../../../../actions/verejneActions'
import {entityDetailProvider} from '../../../../dataProviders/publiclyDataProviders'
import {entityDetailSelector} from '../../../../selectors'
import './ListRow.css'

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

const _DetailedInfo = ({id, toggleEntityInfo, data}) => (
  <ListGroupItem className="list-row">
    <div action className={data.companyinfo ? "info-header list-group-item-action" : "list-group-item-action"} onClick={() => toggleEntityInfo(id)}>
      {!data.companyinfo && <CircleIcon size="15" className="list-row-icon" />}
      {data.name}
    </div>
    {data.companyinfo &&
    <div className="info-main">
      <ul className="info-list">
        <Item
          label="IČO"
          url={`http://www.orsr.sk/hladaj_ico.asp?ICO=${data.companyinfo.ico}&SID=0`}
          linkText={data.companyinfo.ico}
        >
          (<ExternalLink isMapView={false} url={icoUrl(data.companyinfo.ico)}>
            Detaily o firme
          </ExternalLink>)
        </Item>
        {data.companyinfo.established_on && <Item label="Založená">{showDate(data.companyinfo.established_on)}</Item>}
        {data.companyinfo.terminated_on && <Item label="Zaniknutá">{showDate(data.companyinfo.terminated_on)}</Item>}
      </ul>
    </div>
    }
  </ListGroupItem>
)

const DetailedInfo = compose(
  connect(
    (state, {id}) => ({
      data: entityDetailSelector(state, id),
    }),
    {toggleEntityInfo}
  ),
  withDataProviders(({id}) => [entityDetailProvider(id)])
)(_DetailedInfo)

const ListRow = ({entity, toggleEntityInfo, showInfo}) =>
  showInfo ? (
    <DetailedInfo id={entity.id} />
  ) : (
    <ListGroupItem action className="list-row" onClick={() => toggleEntityInfo(entity.id)}>
      <CircleIcon size="10" className="list-row-icon" />
      <span>{entity.name}</span>
    </ListGroupItem>
  )

export default connect(
  (state, {entity}) => ({
    showInfo: state.publicly.showInfo[entity.id],
  }),
  {toggleEntityInfo}
)(ListRow)
