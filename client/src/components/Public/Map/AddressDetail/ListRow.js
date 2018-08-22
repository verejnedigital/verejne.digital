import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import CircleIcon from 'react-icons/lib/fa/circle-o'
import FilledCircleIcon from 'react-icons/lib/fa/circle'
import SearchIcon from 'react-icons/lib/fa/search'
import {ListGroupItem} from 'reactstrap'
import {
  toggleEntityInfo,
  toggleModalOpen,
  setEntitySearchFor,
} from '../../../../actions/publicActions'
import {updateValue} from '../../../../actions/sharedActions'
import {entityDetailSelector} from '../../../../selectors'
import {hasTradeWithState} from '../../entityHelpers'
import Info from '../../../shared/Info/Info'

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

const TradeIcon = ({filled}) => filled ?
  <FilledCircleIcon size="10" className="list-row-icon" /> :
  <CircleIcon size="10" className="list-row-icon" />

const DetailedInfo = compose(
  connect(null,
    {toggleEntityInfo}
  ),
  withHandlers({
    toggleEntityInfo: ({toggleEntityInfo, id}) => () => {
      toggleEntityInfo(id)
    },
  })
)(_DetailedInfo)

const ListRow = ({entity, toggleEntityInfo, showInfo, openModalSearch, entityDetails,
  tradesWithState}) =>
  showInfo ? (
    <DetailedInfo id={entity.id} data={entityDetails} />
  ) : (
    <ListGroupItem action className="list-row">
      <span className="list-row-toggler" onClick={toggleEntityInfo}>
        <TradeIcon filled={tradesWithState} />
        <span>{entity.name}</span>
      </span>
      <SearchIcon size="16" className="search-icon float-right mr-3" onClick={openModalSearch} />
    </ListGroupItem>
  )

export default compose(
  connect(
    (state, {entity}) => {
      const entityDetails = entityDetailSelector(state, entity.id)
      return {
        showInfo: state.publicly.showInfo[entity.id],
        tradesWithState: hasTradeWithState(entityDetails),
        entityDetails,
      }
    },
    {toggleEntityInfo, toggleModalOpen, setEntitySearchFor, updateValue}
  ),
  withHandlers({
    toggleEntityInfo: ({toggleEntityInfo, entity}) => () => {
      toggleEntityInfo(entity.id)
    },
    openModalSearch: ({entity, toggleModalOpen, setEntitySearchFor, updateValue}) => () => {
      setEntitySearchFor(entity.name)
      updateValue(['publicly', 'entitySearchValue'], entity.name, 'Set entity search field value')
      toggleModalOpen()
    },
  })
)(ListRow)
