// @flow
import React from 'react'
import GoogleMap from './GoogleMap'
import './Verejne.css'
import Legend from './Legend'
import {Input, ListGroup, ListGroupItem, Badge} from 'reactstrap'
import {connect} from 'react-redux'
import {fetchEntities} from '../../actions/verejneActions'
import {entitiesSelector} from '../../selectors'
import {compose, lifecycle, branch, renderComponent, withProps, withState} from 'recompose'
import Loading from '../Loading'
import {sortBy, chunk, reverse} from 'lodash'
import {VEREJNE_MAX_PAGE_ITEMS} from '../../constants'
import Pagination from 'react-js-pagination'

import CircleIcon from 'react-icons/lib/fa/circle'

const Verejne = ({
  entities,
  entitiesLength,
  fetchEntities,
  pageCount,
  currentPage,
  setCurrentPage,
}) => (
  <div className="Wrapper">
    <div className="SidePanel">
      <Input type="text" className="FormControl" placeholder="Hľadaj firmu / človeka" />
      <Input type="text" className="FormControl" placeholder="Hľadaj adresu" />
      <ListGroup>
        {entities.map(({eid, name, size}) => (
          <ListGroupItem key={eid}>
            <CircleIcon size="18" color="#0062db" className="SidePanel__List__Item__Icon" />
            {name}
            <Badge pill className="SidePanel__List__Item__Badge">
              {size}
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
    {fetchEntities}
  ),
  lifecycle({
    componentDidMount() {
      this.props.fetchEntities()
    },
  }),
  withState('currentPage', 'setCurrentPage', 1),
  withProps(({entities, currentPage}) => ({
    entities:
      chunk(reverse(sortBy(entities, ['size'])), VEREJNE_MAX_PAGE_ITEMS)[currentPage - 1] || [],
    pageCount: entities ? Math.ceil(entities.length / VEREJNE_MAX_PAGE_ITEMS) : 0,
  })),
  branch((props) => !props.entities.length, renderComponent(Loading))
)(Verejne)
