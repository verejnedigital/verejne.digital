// @flow
import React from 'react'
import {map} from 'lodash'
import {compose, withHandlers} from 'recompose'
import {Input, ListGroup, FormGroup} from 'reactstrap'
import {connect} from 'react-redux'
import {geocodeByAddress, getLatLng} from 'react-places-autocomplete'
import Pagination from 'react-js-pagination'

import {
  setCurrentPage,
  zoomToLocation,
  toggleModalOpen,
  setEntitySearchFor,
} from '../../actions/verejneActions'
import {updateValue} from '../../actions/sharedActions'
import {
  currentPageEntities,
  entitiesLengthSelector,
  pageCountSelector,
  currentPageSelector,
  autocompleteValueSelector,
  autocompleteOptionsSelector,
  entitySearchEidsSelector,
  entitySearchForSelector,
} from '../../selectors'
import {
  VEREJNE_MAX_PAGE_ITEMS,
  VEREJNE_PAGE_RANGE,
  ENTITY_CLOSE_ZOOM,
  FIND_ENTITY_TITLE,
} from '../../constants'
import PlacesAutocomplete from '../PlacesAutocomplete'
import EntitySearch from './EntitySearch'
import PanelRow from './PanelRow'
import Map from './Map'
import Legend from './Legend'
import './Verejne.css'

const Verejne = ({
  entities,
  pageCount,
  currentPage,
  setCurrentPage,
  entitiesLength,
  autocompleteValue,
  setAutocompleteValue,
  autocompleteOptions,
  toggleModalOpen,
  entitySearchEids,
  entitySearchFor,
  setEntitySearchFor,
}) => (
  <div className="wrapper">
    <div className="verejne-side-panel">
      <EntitySearch />
      <FormGroup>
        <Input type="text" placeholder={FIND_ENTITY_TITLE} onClick={toggleModalOpen} />
      </FormGroup>
      <FormGroup>
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
      </FormGroup>
      <ListGroup>{map(entities, (e) => <PanelRow entity={e} key={e.eid} />)}</ListGroup>
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
      entitySearchEids: entitySearchEidsSelector(state),
      entitySearchFor: entitySearchForSelector(state),
    }),
    {setCurrentPage, updateValue, zoomToLocation, toggleModalOpen}
  ),
  withHandlers({
    setAutocompleteValue: ({updateValue}) => (value) =>
      updateValue(['publicly', 'autocompleteValue'], value, 'Set autocomplete value'),
  })
)(Verejne)
