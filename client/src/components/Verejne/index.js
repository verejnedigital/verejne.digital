// @flow
import React from 'react'
import Map from './Map'
import './Verejne.css'
import Legend from './Legend'
import {Input, ListGroup} from 'reactstrap'
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
import {
  VEREJNE_MAX_PAGE_ITEMS,
  VEREJNE_PAGE_RANGE,
  ENTITY_CLOSE_ZOOM,
  FIND_ENTITY_TITLE,
} from '../../constants'
import {map} from 'lodash'
import {compose, withHandlers} from 'recompose'
import PlacesAutocomplete from '../PlacesAutocomplete'
import EntitySearch from './EntitySearch'
import {geocodeByAddress, getLatLng} from 'react-places-autocomplete'
import PanelRow from './PanelRow'

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
  <div className="wrapper">
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
          <PanelRow entity={e} key={e.eid} />
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
