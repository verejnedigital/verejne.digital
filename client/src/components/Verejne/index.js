// @flow
import React from 'react'
import {compose, withHandlers} from 'recompose'
import {Input, Form, FormGroup} from 'reactstrap'
import {connect} from 'react-redux'
import {geocodeByAddress, getLatLng} from 'react-places-autocomplete'

import {
  zoomToLocation,
  toggleModalOpen,
  setEntitySearchFor,
} from '../../actions/verejneActions'
import {updateValue} from '../../actions/sharedActions'
import {
  autocompleteValueSelector,
  autocompleteOptionsSelector,
  openedAddressDetailSelector,
  entitySearchValueSelector,
} from '../../selectors'
import {ENTITY_CLOSE_ZOOM, FIND_ENTITY_TITLE} from '../../constants'
import AddressDetail from './Map/AddressDetail'
import PlacesAutocomplete from '../PlacesAutocomplete'
import EntitySearch from './EntitySearch'
import Map from './Map'
import Legend from './Legend'
import './Verejne.css'

const Verejne = ({
  autocompleteValue,
  setAutocompleteValue,
  autocompleteOptions,
  toggleModalOpen,
  openedAddressId,
  entitySearchValue,
  setEntitySearchValue,
  findEntities,
}) => (
  <div className="wrapper">
    <div className="verejne-side-panel">
      <EntitySearch />
      <Form onSubmit={findEntities}>
        <FormGroup>
          <Input
            type="text"
            placeholder={FIND_ENTITY_TITLE}
            value={entitySearchValue}
            onChange={setEntitySearchValue}
          />
        </FormGroup>
      </Form>
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
      {openedAddressId && <AddressDetail addressId={openedAddressId} />}
    </div>
    <Map />
    <Legend />
  </div>
)

export default compose(
  connect(
    (state) => ({
      autocompleteValue: autocompleteValueSelector(state),
      autocompleteOptions: autocompleteOptionsSelector(state),
      openedAddressId: openedAddressDetailSelector(state),
      entitySearchValue: entitySearchValueSelector(state),
    }),
    {updateValue, zoomToLocation, toggleModalOpen, setEntitySearchFor}
  ),
  withHandlers({
    findEntities: ({toggleModalOpen, setEntitySearchFor, entitySearchValue}) => (e) => {
      e.preventDefault()
      toggleModalOpen()
      setEntitySearchFor(entitySearchValue)
    },
    setAutocompleteValue: ({updateValue}) => (value) =>
      updateValue(['publicly', 'autocompleteValue'], value, 'Set autocomplete value'),
    setEntitySearchValue: ({updateValue}) => (e) =>
      updateValue(['publicly', 'entitySearchValue'], (e.target.value), 'Set entity search field value'),
  })
)(Verejne)
