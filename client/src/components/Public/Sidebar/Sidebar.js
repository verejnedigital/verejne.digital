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

import {
  zoomToLocation,
  toggleDrawer,
  setDrawer,
} from '../../../actions/publicActions'
import {updateValue} from '../../../actions/sharedActions'
import {
  autocompleteValueSelector,
  autocompleteOptionsSelector,
  openedAddressDetailSelector,
  drawerOpenSelector,
  entitySearchModalOpenSelector,
} from '../../../selectors'
import {ENTITY_CLOSE_ZOOM,} from '../../../constants'
import AddressDetail from './../Map/AddressDetail/AddressDetail'
import PlacesAutocomplete from '../../PlacesAutocomplete/PlacesAutocomplete'

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
  setZoomToLocation: (value: string, id: string) => void,
  autocompleteOptions: Bound,
  openedAddressId: number,
  entitySearchModalOpen: boolean,
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
  openedAddressIds,
  entitySearchModalOpen,
}: ContentProps) => (

  <React.Fragment>
    <EntitySearchAutocomplete className="form-control" />
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
    {entitySearchModalOpen && <EntitySearch />}
    {(openedAddressIds != null && openedAddressIds.length !== 0) && <AddressDetail addressIds={openedAddressIds} />}
  </React.Fragment>
)

const Content = compose(
  connect(
    (state) => ({
      autocompleteValue: autocompleteValueSelector(state),
      autocompleteOptions: autocompleteOptionsSelector(state),
      openedAddressIds: openedAddressDetailSelector(state),
      entitySearchModalOpen: entitySearchModalOpenSelector(state),
    }),
    {
      updateValue,
      zoomToLocation,
    }
  ),
  withHandlers({
    setAutocompleteValue: ({updateValue}) => (value) =>
      updateValue(['publicly', 'autocompleteValue'], value, 'Set autocomplete value'),
    setZoomToLocation: ({zoomToLocation, updateValue}) => (value, id) => {
      updateValue(['publicly', 'autocompleteValue'], value, 'Set autocomplete value')
      geocodeByAddress(value)
        .then((results) => getLatLng(results[0]))
        .then((location) => zoomToLocation(location, ENTITY_CLOSE_ZOOM))
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
    (state) => ({
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
