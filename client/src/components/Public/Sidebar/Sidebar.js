// @flow
import React from 'react'
import {compose, withHandlers} from 'recompose'
import {FormGroup} from 'reactstrap'
import {connect} from 'react-redux'
import {geocodeByAddress, getLatLng} from 'react-places-autocomplete'
import ArrowRightIcon from 'react-icons/lib/fa/angle-double-right'
import ArrowLeftIcon from 'react-icons/lib/fa/angle-double-left'
import Drawer from 'rc-drawer'
import 'rc-drawer/assets/index.css'
import './Sidebar.css'

import EntitySearch from '../EntitySearch/EntitySearch'
import EntitySearchAutocomplete from '../EntitySearchAutocomplete/EntitySearchAutocomplete'

import {zoomToLocation, toggleDrawer, setDrawer} from '../../../actions/publicActions'
import {updateValue} from '../../../actions/sharedActions'
import {
  autocompleteValueSelector,
  autocompleteOptionsSelector,
  openedAddressDetailSelector,
  drawerOpenSelector,
  entitySearchOpenSelector,
} from '../../../selectors'
import {ENTITY_CLOSE_ZOOM} from '../../../constants'
import AddressDetail from './../Map/AddressDetail/AddressDetail'
import PlacesAutocomplete from '../../PlacesAutocomplete/PlacesAutocomplete'

import type {State} from '../../../state'

type DrawerIconProps = {|
  drawerOpen: boolean,
  toggleDrawer: () => void,
|}

type Bound = {|
  east: number,
  north: number,
  west: number,
  south: number,
|}

type ContentProps = {
  autocompleteValue: string,
  setAutocompleteValue: (value: string) => void,
  setZoomToLocation: (value: string, id: ?string) => void,
  autocompleteOptions: Bound,
  openedAddressIds: Array<number>,
  entitySearchOpen: boolean,
}

type SidebarProps = {|
  toggleDrawer: () => void,
  closeDrawer: () => void,
  drawerOpen: boolean,
  renderDrawer: boolean,
|}

const _DrawerIcon = ({drawerOpen, toggleDrawer}: DrawerIconProps) =>
  drawerOpen ? (
    <ArrowLeftIcon onClick={toggleDrawer} className="drawer-handle p-1" />
  ) : (
    <ArrowRightIcon onClick={toggleDrawer} className="drawer-handle p-1" />
  )

const DrawerIcon = connect(
  (state: State) => ({
    drawerOpen: drawerOpenSelector(state),
  }),
  {toggleDrawer}
)(_DrawerIcon)

const _Content = ({
  autocompleteValue,
  setAutocompleteValue,
  setZoomToLocation,
  autocompleteOptions,
  openedAddressIds,
  entitySearchOpen,
}: ContentProps) => (
  <React.Fragment>
    <FormGroup>
      <EntitySearchAutocomplete />
    </FormGroup>
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
    {entitySearchOpen && <EntitySearch />}
    {openedAddressIds != null &&
      openedAddressIds.length !== 0 && <AddressDetail addressIds={openedAddressIds} />}
  </React.Fragment>
)

const Content = compose(
  connect(
    (state: State) => ({
      autocompleteValue: autocompleteValueSelector(state),
      autocompleteOptions: autocompleteOptionsSelector(state),
      openedAddressIds: openedAddressDetailSelector(state),
      entitySearchOpen: entitySearchOpenSelector(state),
    }),
    {
      updateValue,
      zoomToLocation,
      setDrawer,
    }
  ),
  withHandlers({
    setAutocompleteValue: ({updateValue}) => (value) =>
      updateValue(['publicly', 'autocompleteValue'], value, 'Set autocomplete value'),
    setZoomToLocation: ({zoomToLocation, updateValue, setDrawer}) => (value, id) => {
      updateValue(['publicly', 'autocompleteValue'], value, 'Set autocomplete value')
      geocodeByAddress(value)
        .then((results) => getLatLng(results[0]))
        .then((location) => zoomToLocation(location, ENTITY_CLOSE_ZOOM))
      setDrawer(false)
    },
  })
)(_Content)

const Sidebar = ({toggleDrawer, closeDrawer, drawerOpen, renderDrawer}: SidebarProps) =>
  renderDrawer ? (
    <Drawer
      level={null}
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

export default compose(
  connect(
    (state: State) => ({
      drawerOpen: drawerOpenSelector(state),
      renderDrawer: window.innerWidth < 576,
    }),
    {updateValue, zoomToLocation, toggleDrawer, setDrawer}
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
