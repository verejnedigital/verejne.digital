import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {withDataProviders} from 'data-provider'
import CircleIcon from 'react-icons/lib/fa/circle-o'
import SearchIcon from 'react-icons/lib/fa/search'
import {ListGroupItem} from 'reactstrap'
import {
  toggleEntityInfo,
  toggleModalOpen,
  setEntitySearchFor,
} from '../../../../actions/verejneActions'
import {updateValue} from '../../../../actions/sharedActions'
import {entityDetailProvider} from '../../../../dataProviders/sharedDataProviders'
import {entityDetailSelector} from '../../../../selectors'
import Info from '../../../shared/Info/Info'
import './ListRow.css'

const _DetailedInfo = ({toggleEntityInfo, data}) => (
  <ListGroupItem action className="list-row">
    <Info data={data} canClose onClose={toggleEntityInfo} />
  </ListGroupItem>
)

const DetailedInfo = compose(
  connect(
    (state, {id}) => ({
      data: entityDetailSelector(state, id),
    }),
    {toggleEntityInfo}
  ),
  withDataProviders(({id}) => [entityDetailProvider(id)]),
  withHandlers({
    toggleEntityInfo: ({toggleEntityInfo, id}) => () => {
      toggleEntityInfo(id)
    },
  })
)(_DetailedInfo)

const ListRow = ({entity, toggleEntityInfo, showInfo, openModalSearch}) =>
  showInfo ? (
    <DetailedInfo id={entity.id} />
  ) : (
    <ListGroupItem action className="list-row">
      <span className="list-row-toggler" onClick={toggleEntityInfo}>
        <CircleIcon size="10" className="list-row-icon" />
        <span>{entity.name}</span>
      </span>
      <SearchIcon size="16" className="search-icon float-right mr-3" onClick={openModalSearch} />
    </ListGroupItem>
  )

export default compose(
  connect(
    (state, {entity}) => ({
      showInfo: state.publicly.showInfo[entity.id],
    }),
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
