import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'recompose'
import {withDataProviders} from 'data-provider'
import CircleIcon from 'react-icons/lib/fa/circle-o'
import {ListGroupItem} from 'reactstrap'
import {toggleEntityInfo} from '../../../../actions/verejneActions'
import {entityDetailProvider} from '../../../../dataProviders/publiclyDataProviders'
import {entityDetailSelector} from '../../../../selectors'
//import Info from './Info'

const _DetailedInfo = ({id, toggleEntityInfo, data}) => (
  <div>
    There will be detail soon
    {console.log(data, 'a')}
    {/*<Info data={{entities: [data]}} canClose onClose={() => toggleEntityInfo(id)} />*/}
  </div>
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
  showInfo ? <DetailedInfo id={entity.id} /> : (
    <ListGroupItem
      className="side-panel__list__item"
      onClick={() => toggleEntityInfo(entity.id)}
    >
      <CircleIcon size="10" className="side-panel__list__item__icon--normal" />
      <div>{entity.name}</div>
    </ListGroupItem>
  )

export default connect(
  (state, {entity}) => ({
    showInfo: state.publicly.showInfo[entity.id],
  }),
  {toggleEntityInfo}
)(ListRow)
