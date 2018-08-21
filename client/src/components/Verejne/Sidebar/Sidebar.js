// @flow
import React from 'react'
import {compose, withHandlers} from 'recompose'
import {Input, Form, FormGroup, InputGroup, InputGroupAddon, Button} from 'reactstrap'
import {connect} from 'react-redux'
import {geocodeByAddress, getLatLng} from 'react-places-autocomplete'
import ArrowRightIcon from 'react-icons/lib/fa/angle-double-right'
import ArrowLeftIcon from 'react-icons/lib/fa/angle-double-left'
import Drawer from 'rc-drawer'
import 'rc-drawer/assets/index.css'
import './Sidebar.css'
import SearchIcon from 'react-icons/lib/fa/search'
import ModalIcon from 'react-icons/lib/fa/clone'

import {
  zoomToLocation,
  toggleModalOpen,
  setEntitySearchFor,
  toggleDrawer,
  setDrawer,
} from '../../../actions/verejneActions'
import {updateValue} from '../../../actions/sharedActions'
import {
  autocompleteValueSelector,
  autocompleteOptionsSelector,
  openedAddressDetailSelector,
  entitySearchValueSelector,
  drawerOpenSelector,
} from '../../../selectors'
import {ENTITY_CLOSE_ZOOM, FIND_ENTITY_TITLE} from '../../../constants'
import AddressDetail from './../Map/AddressDetail'
import PlacesAutocomplete from '../../PlacesAutocomplete'

const _DrawerIcon = ({drawerOpen, toggleDrawer}) =>
  (drawerOpen) ? (
    <ArrowLeftIcon onClick={toggleDrawer} className="drawer-handle p-1" />
  ) : (
    <ArrowRightIcon onClick={toggleDrawer} className="drawer-handle p-1" />
  )

const DrawerIcon =
  connect(
    (state) => ({
      drawerOpen: drawerOpenSelector(state),
    }),
    {toggleDrawer}
  )(_DrawerIcon)

const _Content = ({
  autocompleteValue,
  setAutocompleteValue,
  setZoomToLocation,
  autocompleteOptions,
  toggleModalOpen,
  toggleDrawer,
  openedAddressId,
  entitySearchValue,
  setEntitySearchValue,
  findEntities,
}) => (
  <React.Fragment>
    <Form onSubmit={findEntities}>
      <FormGroup>
        <InputGroup>
          <Input
            className="entity-input"
            type="text"
            placeholder={FIND_ENTITY_TITLE}
            value={entitySearchValue}
            onChange={setEntitySearchValue}
          />
          <InputGroupAddon addonType="append">
            <Button color="primary" onClick={findEntities}>
              <SearchIcon />
            </Button>
          </InputGroupAddon>
          <InputGroupAddon addonType="append">
            <Button color="primary" onClick={toggleModalOpen}>
              <ModalIcon />
            </Button>
          </InputGroupAddon>
        </InputGroup>
      </FormGroup>
    </Form>
    <FormGroup>
      <PlacesAutocomplete
        value={autocompleteValue}
        onSelect={setZoomToLocation}
        onChange={setAutocompleteValue}
        onError={(status, clearSuggestions) => clearSuggestions()}
        searchOptions={autocompleteOptions}
        className="form-control"
      />
    </FormGroup>
    {openedAddressId && <AddressDetail addressId={openedAddressId} />}
  </React.Fragment>
)

const Content = compose(
  connect(
    (state) => ({
      autocompleteValue: autocompleteValueSelector(state),
      autocompleteOptions: autocompleteOptionsSelector(state),
      openedAddressId: openedAddressDetailSelector(state),
      entitySearchValue: entitySearchValueSelector(state),
    }),
    {updateValue, zoomToLocation, toggleModalOpen, setEntitySearchFor, toggleDrawer}
  ),
  withHandlers({
    findEntities: ({toggleModalOpen, setEntitySearchFor, entitySearchValue, toggleDrawer}) => (e) => {
      e.preventDefault()
      toggleModalOpen()
      setEntitySearchFor(entitySearchValue)
      toggleDrawer()
    },
    setAutocompleteValue: ({updateValue}) => (value) =>
      updateValue(['publicly', 'autocompleteValue'], value, 'Set autocomplete value'),
    setEntitySearchValue: ({updateValue}) => (e) =>
      updateValue(['publicly', 'entitySearchValue'], (e.target.value), 'Set entity search field value'),
    setZoomToLocation: ({zoomToLocation}) => (value, id) =>
      geocodeByAddress(value)
        .then((results) => getLatLng(results[0]))
        .then((location) => zoomToLocation(location, ENTITY_CLOSE_ZOOM)),
  })
)(_Content)

const Sidebar = ({
  toggleDrawer,
  closeDrawer,
  drawerOpen,
  renderDrawer,
}) => (
  (renderDrawer) ? (
    <Drawer level={null}
      open={drawerOpen}
      onMaskClick={closeDrawer}
      onHandleClick={toggleDrawer}
      width="90%"
      handler={<DrawerIcon />}
    >
      <Content />
    </Drawer>
  ) : (
    <div className="verejne-side-panel">
      <Content />
    </div>
  )
)

export default compose(
  connect(
    (state) => ({
      drawerOpen: drawerOpenSelector(state),
      renderDrawer: window.innerWidth < 576,
    }),
    {updateValue, zoomToLocation, toggleModalOpen, setEntitySearchFor, toggleDrawer, setDrawer}
  ),
  withHandlers({
    toggleDrawer: ({toggleDrawer}) => () => {
      toggleDrawer()
    },
    closeDrawer: ({setDrawer}) => () => {
      setDrawer(false)
    },
  })
)(Sidebar)
