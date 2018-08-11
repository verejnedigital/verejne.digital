import React from 'react'
import {connect} from 'react-redux'
import {compose, withHandlers, withStateHandlers} from 'recompose'
import {withDataProviders} from 'data-provider'
import Info from '../shared/Info/Info'
import {singleEntityProvider} from '../../dataProviders/publiclyDataProviders'
import FilledCircleIcon from 'react-icons/lib/fa/circle'
import CircleIcon from 'react-icons/lib/fa/circle-o'
import MapIcon from '../../assets/mapIcon.svg'
import {isPolitician, hasContractsWithState} from './entityHelpers'
import classnames from 'classnames'
import {ListGroupItem, Badge} from 'reactstrap'
import {
  selectEntity,
  toggleEntityInfo,
} from '../../actions/verejneActions'

const renderListItemIcon = (entity) => {
  if (entity.size > 1) {
    return <img src={MapIcon} style={{width: '2rem', height: '2rem'}} alt="listItemIcon" />
  }
  const color = isPolitician(entity)
    ? 'side-panel__list__item__icon--politician'
    : 'side-panel__list__item__icon--normal'
  const Icon = hasContractsWithState(entity) ? FilledCircleIcon : CircleIcon
  return <Icon size="18" className={classnames('side-panel__list__item__icon', color)} />
}

const _DetailedInfo = ({eid, data, toggleEntityInfo}) => (
  <Info data={data} canClose onClose={() => toggleEntityInfo(eid)} />
)

const DetailedInfo = compose(
  connect(null, {toggleEntityInfo}),
  withStateHandlers({data: undefined}, {onData: (props) => (data) => ({...props, data})}),
  withHandlers({
    bindedOnData: ({onData}) => () => (ref, data) => onData(data),
  }),
  withDataProviders(({eid, bindedOnData}) => [singleEntityProvider(eid, bindedOnData)])
)(_DetailedInfo)

const PanelRow = ({entity, selectEntity, toggleEntityInfo, showInfo, data}) =>
  showInfo ? <DetailedInfo eid={entity.eid} /> : (
    <ListGroupItem
      className="side-panel__list__item"
      onClick={() => {
        if (entity.size === 1) toggleEntityInfo(entity.eid)
        return selectEntity(entity)
      }}
    >
      {renderListItemIcon(entity)}
      {entity.name}
      <Badge pill className="side-panel__list__item__badge">
        {entity.size}
      </Badge>
    </ListGroupItem>
  )

export default connect(
  (state, {entity}) => ({
    showInfo: state.publicly.showInfo[entity.eid],
  }),
  {toggleEntityInfo, selectEntity}
)(PanelRow)
