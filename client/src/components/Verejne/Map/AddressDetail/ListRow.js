import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'recompose'
import {withDataProviders} from 'data-provider'
import CircleIcon from 'react-icons/lib/fa/circle-o'
import {ListGroupItem} from 'reactstrap'
import {toggleEntityInfo} from '../../../../actions/verejneActions'
import {entityDetailProvider} from '../../../../dataProviders/publiclyDataProviders'
import {entityDetailSelector} from '../../../../selectors'
import './ListRow.css'
import NewInfo from '../../../shared/NewInfo/Info'

const _DetailedInfo = ({id, toggleEntityInfo, data}) => (
  <ListGroupItem action className="list-row list-row-open">
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
