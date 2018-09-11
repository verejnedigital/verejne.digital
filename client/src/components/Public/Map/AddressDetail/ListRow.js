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
import {entityDetailSelector} from '../../../../selectors'
import Info from '../../../shared/Info/Info'
import CircleIcon from '../../../shared/CircleIcon'

import type {NewEntityDetail} from '../../../../state'

import './ListRow.css'

type DetailedInfoProps = {|
  toggleEntityInfo: (id: number) => void,
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
    toggleEntityInfo: ({toggleEntityInfo, id}) => () => {
      toggleEntityInfo(id)
    },
  })
)(_DetailedInfo)

const ListRow = ({entity, toggleEntityInfo, showInfo, openModalSearch, entityDetails}) =>
  showInfo ? (
    <DetailedInfo id={entity.id} data={entityDetails} />
  ) : (
    <ListGroupItem action className="list-row">
      <span className="list-row-toggler" onClick={toggleEntityInfo}>
        <CircleIcon data={entityDetails} className="list-row-icon" size="10" />
        <span>{entity.name}</span>
      </span>
      <SearchIcon size="16" className="search-icon float-right mr-3" onClick={openModalSearch} />
    </ListGroupItem>
  )

export default compose(
  connect(
    (state, {entity}) => ({
      showInfo: state.publicly.showInfo[entity.id],
      entityDetails: entityDetailSelector(state, entity.id),
    }),
    {toggleEntityInfo, toggleEntitySearchOpen, setEntitySearchFor, updateValue}
  ),
  withHandlers({
    toggleEntityInfo: ({toggleEntityInfo, entity}) => () => {
      toggleEntityInfo(entity.id)
    },
    openModalSearch: ({entity, toggleEntitySearchOpen, setEntitySearchFor, updateValue}) => () => {
      setEntitySearchFor(entity.name)
      updateValue(['publicly', 'entitySearchValue'], entity.name, 'Set entity search field value')
      toggleEntitySearchOpen()
    },
  })
)(ListRow)
