// @flow
import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import SearchIcon from 'react-icons/lib/fa/search'
import {ListGroupItem, Row, Col} from 'reactstrap'
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
      <Row >
        <Col xs="auto" className="px-1">
          <CircleIcon data={entityDetail} className="list-row-icon" size="10" />
        </Col>
        <Col className="px-1 list-row-toggler" onClick={toggleEntityInfo}>
          <span>{entityDetail.name}</span>
        </Col>
        <Col xs="auto" className="px-1">
          <SearchIcon size="16" className="search-icon float-right" onClick={openModalSearch} />
        </Col>
      </Row>
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
