// @flow
import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import SearchIcon from 'react-icons/lib/fa/search'
import {ListGroupItem} from 'reactstrap'
import {
  toggleEntityInfo,
  toggleEntitySearchOpen,
  setEntitySearchFor,
} from '../../../../actions/publicActions'
import {updateValue} from '../../../../actions/sharedActions'
import Info from '../../../shared/Info/Info'
import CircleIcon from '../../../shared/CircleIcon'

import type {NewEntityDetail} from '../../../../state'

import './ListRow.css'

type DetailedInfoProps = {|
  toggleEntityInfo: (eid: number) => void,
  data: NewEntityDetail,
|}

const _DetailedInfo = ({toggleEntityInfo, data}: DetailedInfoProps) => (
  <ListGroupItem action className="list-row">
    <Info data={data} canClose onClose={toggleEntityInfo} />
  </ListGroupItem>
)

const DetailedInfo = compose(
  connect(null, {toggleEntityInfo}),
  withHandlers({
    toggleEntityInfo: ({toggleEntityInfo, eid}) => () => {
      toggleEntityInfo(eid)
    },
  })
)(_DetailedInfo)

type ListRowProps = {
  entityDetail: NewEntityDetail,
  toggleEntityInfo: (id: number) => void,
  showInfo: () => void,
  openModalSearch: () => void,
}

const ListRow = ({entityDetail, toggleEntityInfo, showInfo, openModalSearch}: ListRowProps) =>
  showInfo ? (
    <DetailedInfo eid={entityDetail.eid} data={entityDetail} />
  ) : (
    <ListGroupItem action className="list-row">
      <span className="list-row-toggler" onClick={toggleEntityInfo}>
        <CircleIcon data={entityDetail} className="list-row-icon" size="10" />
        <span>{entityDetail.name}</span>
      </span>
      <SearchIcon size="16" className="search-icon float-right mr-3" onClick={openModalSearch} />
    </ListGroupItem>
  )

export default compose(
  connect(
    (state, {entityDetail}) => ({
      showInfo: state.publicly.showInfo[entityDetail.eid],
    }),
    {toggleEntityInfo, toggleEntitySearchOpen, setEntitySearchFor, updateValue}
  ),
  withHandlers({
    toggleEntityInfo: ({toggleEntityInfo, entityDetail}) => () => {
      toggleEntityInfo(entityDetail.eid)
    },
    openModalSearch: ({
      entityDetail,
      toggleEntitySearchOpen,
      setEntitySearchFor,
      updateValue,
    }) => () => {
      setEntitySearchFor(entityDetail.name)
      updateValue(
        ['publicly', 'entitySearchValue'],
        entityDetail.name,
        'Set entity search field value'
      )
      toggleEntitySearchOpen()
    },
  })
)(ListRow)
