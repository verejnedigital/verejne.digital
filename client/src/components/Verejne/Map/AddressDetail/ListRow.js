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
import {entityDetailProvider} from '../../../../dataProviders/publiclyDataProviders'
import {entityDetailSelector} from '../../../../selectors'
import NewInfo from '../../../shared/NewInfo/Info'
import './ListRow.css'

const _DetailedInfo = ({id, toggleEntityInfo, data}) => (
  <ListGroupItem action className="list-row">
    <NewInfo data={data} canClose onClose={() => toggleEntityInfo(id)} />
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

const ListRow = ({entity, toggleEntityInfo, showInfo, openModalSearch}) =>
  showInfo ? (
    <DetailedInfo id={entity.id} />
  ) : (
    <ListGroupItem action className="list-row">
      <span className="list-row-toggler" onClick={() => toggleEntityInfo(entity.id)}>
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
    openModalSearch: ({entity, toggleModalOpen, setEntitySearchFor, updateValue}) => () => {
      setEntitySearchFor(entity.name)
      updateValue(['publicly', 'entitySearchValue'], entity.name, 'Set entity search field value')
      toggleModalOpen()
    },
  })
)(ListRow)
