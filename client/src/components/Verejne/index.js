// @flow
import React from 'react'
import Map from './Map'
import './Verejne.css'
import Legend from './Legend'
import {Input, ListGroup, ListGroupItem, Badge} from 'reactstrap'
import {connect} from 'react-redux'
import {selectEntity, setCurrentPage} from '../../actions/verejneActions'
import {
  currentPageEntities,
  entitiesLengthSelector,
  pageCountSelector,
  currentPageSelector,
  mapReferenceSelector,
} from '../../selectors'
import Pagination from 'react-js-pagination'
import {isPolitician, hasContractsWithState} from './entityHelpers'
import {VEREJNE_MAX_PAGE_ITEMS, VEREJNE_PAGE_RANGE} from '../../constants'
import {map} from 'lodash'
import {compose} from 'recompose'
import classnames from 'classnames'

import FilledCircleIcon from 'react-icons/lib/fa/circle'
import CircleIcon from 'react-icons/lib/fa/circle-o'
import MapIcon from './mapIcon.svg'

const renderListItemIcon = (entity) => {
  if (entity.size > 1) {
    return <img src={MapIcon} style={{width: '2rem', height: '2rem'}} alt="listItemIcon" />
  }
  const color = isPolitician(entity)
    ? 'SidePanel__List__Item__Icon__Politician'
    : 'SidePanel__List__Item__Icon__Normal'
  const Icon = hasContractsWithState(entity) ? FilledCircleIcon : CircleIcon
  return <Icon size="18" className={classnames('SidePanel__List__Item__Icon', color)} />
}

// NOTE: there can be multiple points on the map on the same location...
const Verejne = ({
  entities,
  fetchEntities,
  pageCount,
  currentPage,
  setCurrentPage,
  selectEntity,
  entitiesLength,
  refetch,
  mapReference,
}) => (
  <div className="Wrapper">
    <div className="SidePanel">
      <Input type="text" className="FormControl" placeholder="Hľadaj firmu / človeka" />
      <Input type="text" className="FormControl" placeholder="Hľadaj adresu" />
      <ListGroup>
        {map(entities, (e) => (
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
        pageRangeDisplayed={VEREJNE_PAGE_RANGE}
        activePage={currentPage}
        itemsCountPerPage={VEREJNE_MAX_PAGE_ITEMS}
        totalItemsCount={entitiesLength}
        onChange={setCurrentPage}
      />
    </div>
    <Map />
    <Legend />
  </div>
)
export default compose(
  connect(
    (state) => ({
      entitiesLength: entitiesLengthSelector(state),
      entities: currentPageEntities(state),
      currentPage: currentPageSelector(state),
      pageCount: pageCountSelector(state),
      mapReference: mapReferenceSelector(state),
    }),
    {selectEntity, setCurrentPage}
  )
)(Verejne)
