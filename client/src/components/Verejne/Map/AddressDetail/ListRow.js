import React from 'react'
import {connect} from 'react-redux'
import {compose, withHandlers} from 'recompose'
import {withDataProviders} from 'data-provider'
import CircleIcon from 'react-icons/lib/fa/circle-o'
import SearchIcon from 'react-icons/lib/fa/search'
import {ListGroupItem} from 'reactstrap'
import { icoUrl, showDate, } from '../../../../services/utilities'
import ExternalLink from '../../../shared/ExternalLink'
import {toggleEntityInfo, toggleModalOpen, setEntitySearchFor} from '../../../../actions/verejneActions'
import {updateValue} from '../../../../actions/sharedActions'
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

const _DetailedInfo = ({id, toggleEntityInfo, openModalSearch, data}) => (
  <ListGroupItem className="list-row">
    <div className={data.companyinfo ? "info-header list-group-item-action" : "list-group-item-action"} onClick={() => toggleEntityInfo(id)}>
      {!data.companyinfo && <CircleIcon size="15" className="list-row-icon" />}
      {data.name}
      <SearchIcon size="20" className={!data.companyinfo ? "search-icon float-right mr-3" : "search-icon float-right"} onClick={openModalSearch}/>
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
    {toggleEntityInfo, toggleModalOpen, setEntitySearchFor},
  ),
  withDataProviders(({id}) => [entityDetailProvider(id)]),
  withHandlers({
    openModalSearch: ({toggleModalOpen, setEntitySearchFor, data}) => (e) =>{
      if (e.stopPropagation) e.stopPropagation()
      setEntitySearchFor(data.name)
      toggleModalOpen()
    }
  })
)(_DetailedInfo)

const ListRow = ({entity, toggleEntityInfo, showInfo, openModalSearch}) =>
  showInfo ? (
    <DetailedInfo id={entity.id} />
  ) : (
    <ListGroupItem action className="list-row" onClick={() => toggleEntityInfo(entity.id)}>
      <CircleIcon size="10" className="list-row-icon" />
      <span>{entity.name}</span>
      <SearchIcon size="20" className="search-icon float-right mr-3" onClick={openModalSearch}/>
    </ListGroupItem>
  )

export default compose(
  connect(
    (state, {entity}) => ({
      showInfo: state.publicly.showInfo[entity.id],
    }),
    {toggleEntityInfo, toggleModalOpen, setEntitySearchFor, updateValue},
  ),
  withHandlers({
    openModalSearch: ({toggleModalOpen, setEntitySearchFor, entity, updateValue}) => (e) =>{
      if (e.stopPropagation) e.stopPropagation()
      updateValue(['publicly', 'entitySearchValue'], entity.name, 'Set entity search field value')
      setEntitySearchFor(entity.name)
      updateValue(['publicly', 'entitySearchValue'], entity.name, 'Set entity search field value')
      toggleModalOpen()
    }
  })
) (ListRow)
