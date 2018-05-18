// @flow
import React from 'react'
import GoogleMap from './GoogleMap'
import './Verejne.css'
import Legend from './Legend'
import {Input, ListGroup, ListGroupItem, Badge} from 'reactstrap'
import {connect} from 'react-redux'
import {fetchEntities, selectEntity} from '../../actions/verejneActions'
import {entitiesSelector} from '../../selectors'
import {compose, lifecycle, branch, renderComponent, withProps, withState} from 'recompose'
import Loading from '../Loading'
import {sortBy, chunk, reverse} from 'lodash'
import {VEREJNE_MAX_PAGE_ITEMS} from '../../constants'
import Pagination from 'react-js-pagination'

import FilledCircleIcon from 'react-icons/lib/fa/circle'
import CircleIcon from 'react-icons/lib/fa/circle-o'
import MapIcon from './mapIcon.svg'

const renderListItemIcon = (entity) => {
  if (entity.size > 1) {return <img src={MapIcon} style={{width: '2rem', height: '2rem'}} alt="listItemIcon" />}
  const color = isPolitician(entity) ? '#e55600' : '#0062db'
  const Icon = hasContractsWithState(entity) ? FilledCircleIcon : CircleIcon
  return <Icon size="18" color={color} className="SidePanel__List__Item__Icon" />
}

// NOTE: there can be multiple points in the map on the same location...
const Verejne = ({
  entities,
  fetchEntities,
  pageCount,
  currentPage,
  setCurrentPage,
  selectEntity,
}) => (
  <div className="Wrapper">
    <div className="SidePanel">
      <Input type="text" className="FormControl" placeholder="Hľadaj firmu / človeka" />
      <Input type="text" className="FormControl" placeholder="Hľadaj adresu" />
      <ListGroup>
        {entities &&
          entities.map((e) => (
            <ListGroupItem
              className="SidePanel__List__Item"
              key={e.eid}
              onClick={() => selectEntity(e)}
            >
              {renderListItemIcon(e)}
              {e.name}
              <Badge pill className="SidePanel__List__Item__Badge">
                {e.size}
              </Badge>
            </ListGroupItem>
          ))}
      </ListGroup>
      <Pagination
        itemClass="page-item"
        linkClass="page-link"
        hideNavigation
        pageRangeDisplayed={pageCount}
        activePage={currentPage}
        itemsCountPerPage={VEREJNE_MAX_PAGE_ITEMS}
        totalItemsCount={entitiesLength}
        onChange={setCurrentPage}
      />
    </div>
    <GoogleMap />
    <Legend />
  </div>
)
export default compose(
  connect(
    (state) => ({
      entities: entitiesSelector(state),
      entitiesLength: entitiesSelector(state).length,
    }),
    {fetchEntities, selectEntity}
  ),
  lifecycle({
    componentDidMount() {
      this.props.fetchEntities()
    },
  }),
  withState('currentPage', 'setCurrentPage', 1),
  withProps(({entities, currentPage}) => {
    let newEntities = entities
    if (entities && entities.length) {
      newEntities = chunk(reverse(sortBy(entities, ['size'])), VEREJNE_MAX_PAGE_ITEMS)[
        currentPage - 1
      ]
    }
    return {
      entities: newEntities,
      pageCount: entities ? Math.ceil(entities.length / VEREJNE_MAX_PAGE_ITEMS) : 0,
    }
  }),
  branch((props) => !props.entities, renderComponent(Loading))
)(Verejne)
