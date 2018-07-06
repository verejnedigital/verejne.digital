// @flow
import React from 'react'
import './Verejne.css'
import {Input, ListGroup, ListGroupItem, Badge} from 'reactstrap'
import {connect} from 'react-redux'
import {
  selectEntity,
  setCurrentPage,
  zoomToLocation,
  toggleModalOpen,
} from '../../actions/verejneActions'
import {updateValue} from '../../actions/sharedActions'
import {
  currentPageEntities,
  entitiesLengthSelector,
  pageCountSelector,
  currentPageSelector,
  autocompleteValueSelector,
  autocompleteOptionsSelector,
} from '../../selectors'
import Pagination from 'react-js-pagination'
import {isPolitician, hasContractsWithState} from './entityHelpers'
import {
  VEREJNE_MAX_PAGE_ITEMS,
  VEREJNE_PAGE_RANGE,
  ENTITY_CLOSE_ZOOM,
  FIND_ENTITY_TITLE,
} from '../../constants'
import {map} from 'lodash'
import {compose, withHandlers} from 'recompose'
import classnames from 'classnames'
import PlacesAutocomplete from '../PlacesAutocomplete'
import EntitySearch from './EntitySearch'
import {geocodeByAddress, getLatLng} from 'react-places-autocomplete'

import FilledCircleIcon from 'react-icons/lib/fa/circle'
import CircleIcon from 'react-icons/lib/fa/circle-o'
import MapIcon from '../../assets/mapIcon.svg'

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

const Verejne = ({
  entities,
  fetchEntities,
  pageCount,
  currentPage,
  setCurrentPage,
  selectEntity,
  entitiesLength,
  refetch,
  autocompleteValue,
  setAutocompleteValue,
  autocompleteOptions,
  zoomToLocation,
  toggleModalOpen,
}) => (
  <div className="side-panel">
    <Input
      type="text"
      className="form-control"
      placeholder={FIND_ENTITY_TITLE}
      onClick={toggleModalOpen}
    />
    <EntitySearch />
    <PlacesAutocomplete
      value={autocompleteValue}
      onSelect={(value, id) =>
        geocodeByAddress(value)
          .then((results) => getLatLng(results[0]))
          .then((location) => zoomToLocation(location, ENTITY_CLOSE_ZOOM))
      }
      onChange={setAutocompleteValue}
      onError={(status, clearSuggestions) => clearSuggestions()}
      searchOptions={autocompleteOptions}
      className="form-control"
    />
    <ListGroup>
      {map(entities, (e) => (
        <ListGroupItem
          className="side-panel__list__item"
          key={e.eid}
          onClick={() => selectEntity(e)}
        >
          {renderListItemIcon(e)}
          {e.name}
          <Badge pill className="side-panel__list__item__badge">
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
)
export default compose(
  connect(
    (state) => ({
      entitiesLength: entitiesLengthSelector(state),
      entities: currentPageEntities(state),
      currentPage: currentPageSelector(state),
      pageCount: pageCountSelector(state),
      autocompleteValue: autocompleteValueSelector(state),
      autocompleteOptions: autocompleteOptionsSelector(state),
    }),
    {selectEntity, setCurrentPage, updateValue, zoomToLocation, toggleModalOpen}
  ),
  withHandlers({
    setAutocompleteValue: ({updateValue}) => (value) =>
      updateValue(['publicly', 'autocompleteValue'], value, 'Set autocomplete value'),
  })
)(Verejne)
